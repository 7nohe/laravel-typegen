import { print } from "./print";
import { CLIOptions } from "./cli";
import { createSource as createModelSource } from "./models/createSource";
import { createRouteParamsSource } from "./routes/createSource";
import { sync } from "glob";
import fs from "fs";
import { execSync } from "child_process";
import { LaravelModelType, LaravelRouteListType } from "./types";
import {
  defaultOutputPath,
  modelFileName,
  routeParamsFileName,
  indexDeclarationFileName,
  formRequestsFileName,
  tmpDir,
} from "./constants";
import path from "path";
import { parseFormRequests } from "@7nohe/laravel-zodgen";
import { createFormRequestTypes } from "./formRequests/createFormRequestTypes";
import { formatNamespaceForCommand, getPhpAst, getPhpNamespace } from "./utils";

export async function generate(options: CLIOptions) {
  const parsedModelPath = path
    .join(options.modelPath, "**", "*.php")
    .replace(/\\/g, "/");
  const modelPaths = sync(parsedModelPath).sort();

  const modelData: LaravelModelType[] = [];
  const parsedEnumPath = path
    .join(options.enumPath, "**", "*.php")
    .replace(/\\/g, "/");
  const enums = sync(parsedEnumPath).sort();
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  // Generate models
  for (const modelPath of modelPaths) {
    const modelName = modelPath
      .replace(options.modelPath.replace(/\\/g, "/") + "/", "")
      .replace(path.extname(modelPath), "") // remove .php extension
      .split("/")
      .at(-1)!; // get only model name without directory

    createModelDirectory(modelName);

    const namespacedModel =
      getNamespaceForCommand(modelPath) + "\\\\" + modelName;
    const outputPath = path.join(tmpDir, `${modelName}.json`);

    const modelShowCommand = `php artisan model:show ${namespacedModel} --json > ${outputPath}`;

    // Run artisan command to get model data
    try {
      if (process.env.SKIP_ARTISAN_COMMAND !== "true") {
        execSync(modelShowCommand);
      } else {
        console.log(`Skipping ${modelShowCommand}`);
      }
    } catch (e) {
      console.log(
        `Failed to get model data for ${modelName}'. You still can generate types by running ${modelShowCommand} manually and then run 'laravel-typegen' with SKIP_ARTISAN_COMMAND=true environment variable.`
      );
      console.error(e);
    }

    // Read model data from JSON file
    try {
      const modelJson = JSON.parse(
        fs.readFileSync(path.resolve(tmpDir, `${modelName}.json`), "utf8")
      ) as LaravelModelType;
      modelData.push(modelJson);
    } catch {
      console.log(`Failed to generate ${modelName}. Skipping...`);
    }
  }

  const modelSource = createModelSource(
    modelFileName,
    modelData,
    enums,
    options
  );
  print(modelFileName, modelSource, options.output ?? defaultOutputPath);

  // Generate types for ziggy
  if (options.ziggy) {
    const vendorOption = options.vendorRoutes ? "" : "--except-vendor";
    const routeListCommand = `php artisan route:list ${vendorOption} --json > ${tmpDir}/route.json`;

    if (process.env.SKIP_ARTISAN_COMMAND !== "true") {
      execSync(routeListCommand);
    } else {
      console.log(`Skipping ${routeListCommand}`);
    }
    const routeJson = JSON.parse(
      fs.readFileSync(path.resolve(tmpDir, "route.json"), "utf8")
    ) as LaravelRouteListType[];

    const routeSource = createRouteParamsSource(
      routeParamsFileName,
      routeJson,
      options
    );

    print(
      routeParamsFileName,
      routeSource,
      options.output ?? defaultOutputPath
    );

    // Copy route.d.ts
    if (!options.ignoreRouteDts) {
      fs.copyFileSync(
        path.resolve(__dirname, "..", "templates", indexDeclarationFileName),
        path.resolve(
          options.output ?? defaultOutputPath,
          indexDeclarationFileName
        )
      );
    }
  }

  if (options.formRequest) {
    // Generate types for form requests
    const rules = parseFormRequests(options.formRequestPath, true);
    const formRequestSource = createFormRequestTypes(rules);
    print(
      formRequestsFileName,
      formRequestSource,
      options.output ?? defaultOutputPath
    );
  }
  if (fs.existsSync(tmpDir) && process.env.KEEP_LARAVEL_JSON !== "true") {
    fs.rmSync(tmpDir, { recursive: true });
  }
}

const createModelDirectory = (modelName: string) => {
  const modelNameArray = modelName.split("/");
  modelNameArray.pop();
  if (
    modelNameArray.length > 0 &&
    !fs.existsSync(path.join(tmpDir, ...modelNameArray))
  ) {
    fs.mkdirSync(path.join(tmpDir, ...modelNameArray));
  }
};

/**
 * Cache for namespace by directory. Assume namespace is same when its directory is same
 * e.g. { 'app/Models': 'App\Models', 'app-modules/{module}/Models': 'Modules/{Module}/Models', ... }
 */
const namespaceDictByDir: { [key: string]: string } = {};

export const getNamespaceForCommand = (phpFilepath: string) => {
  const dir = path.dirname(phpFilepath);

  if (namespaceDictByDir[dir]) {
    return namespaceDictByDir[dir];
  }

  const ast = getPhpAst(phpFilepath);
  const namespace = getPhpNamespace(ast).name;
  const namespaceForCommand = formatNamespaceForCommand(namespace);
  namespaceDictByDir[dir] = namespaceForCommand;

  return namespaceForCommand;
};

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
import {
  parseFormRequests,
  defaultFormRequestPath,
} from "@7nohe/laravel-zodgen";
import { createFormRequestTypes } from "./formRequests/createFormRequestTypes";

export async function generate(options: CLIOptions) {
  const parsedModelPath = path
    .join(options.modelPath, "**", "*.php")
    .replace(/\\/g, "/");
  const models = sync(parsedModelPath).sort();
  const modelData: LaravelModelType[] = [];
  const parsedEnumPath = path
    .join(options.enumPath, "**", "*.php")
    .replace(/\\/g, "/");
  const enums = sync(parsedEnumPath).sort();
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }

  let command = "php";

  // sail option
  const useSail = options.sail;
  if (useSail) {
    command = "./vendor/bin/sail"
  }

  // Generate models
  for (const model of models) {
    const modelName = model
      .replace(options.modelPath.replace(/\\/g, "/") + "/", "")
      .replace(path.extname(model), ""); // remove .php extension
    createModelDirectory(modelName);
    const modelShowCommand = `${command} artisan model:show ${modelName} --json > ${path.join(
      tmpDir,
      `${modelName}.json`
    )}`;
    try {
      execSync(modelShowCommand);
      const modelJson = JSON.parse(
        fs.readFileSync(path.join(tmpDir, `${modelName}.json`), "utf8")
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
    const routeListCommand = `${command} artisan route:list ${
      options.vendorRoutes ? "" : "--except-vendor"
    } --json > ${tmpDir}/route.json`;
    execSync(routeListCommand);
    const routeJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/route.json`, "utf8")
    ) as LaravelRouteListType[];

    const routeSource = createRouteParamsSource(
      routeParamsFileName,
      routeJson,
      options
    );
    // Copy route.d.ts
    if (!options.ignoreRouteDts) {
      fs.copyFileSync(
        path.resolve(__dirname, "..", "templates", indexDeclarationFileName),
        path.resolve(options.output ?? defaultOutputPath, indexDeclarationFileName)
      );
    }
  }

  if (options.formRequest) {
    // Generate types for form requests
    const rules = parseFormRequests(defaultFormRequestPath, true);
    const formRequestSource = createFormRequestTypes(rules);
    print(formRequestsFileName, formRequestSource, options.output ?? defaultOutputPath);
  }

  fs.rmSync(tmpDir, { recursive: true });
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

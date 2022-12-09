import { print } from "./print";
import { CLIOptions } from "./cli";
import { createSource as createModelSource } from "./models/createSource";
import {
  createRouteParamsSource,
} from "./routes/createSource";
import glob from "glob";
import fs from "fs";
import { execSync } from "child_process";
import { LaravelModelType, LaravelRouteListType } from "./types";
import {
  defaultEnumPath,
  defaultOutputPath,
  defaultModelPath,
  modelFileName,
  routeParamsFileName,
  indexDeclarationFileName,
} from "./constants";
import path from "path";

const tmpDir = "./.laravel-typegen-tmp";
export async function generate(options: CLIOptions) {
  const models = glob.sync(`${defaultModelPath}/*.php`);
  const modelData: LaravelModelType[] = [];
  const enums = glob.sync(`${options.enumPath ?? defaultEnumPath}/*.php`);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  // Generate models
  for (const model of models) {
    const modelName = model.split("/").at(-1)?.replace(".php", "");
    const modelShowCommand = `php artisan model:show ${modelName} --json > ${tmpDir}/${modelName}.json`;
    console.log(modelShowCommand);
    execSync(modelShowCommand);
    const modelJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/${modelName}.json`, "utf8")
    ) as LaravelModelType;
    modelData.push(modelJson);
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
    const routeListCommand = `php artisan route:list --json > ${tmpDir}/route.json`;
    console.log(routeListCommand);
    execSync(routeListCommand);
    const routeJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/route.json`, "utf8")
    ) as LaravelRouteListType[];

    const routeSource = createRouteParamsSource(
      routeParamsFileName,
      routeJson,
      options
    );

    print(routeParamsFileName, routeSource, defaultOutputPath);

    // Copy route.d.ts
    fs.copyFileSync(path.resolve(__dirname, '../templates/route.d.ts'), path.resolve(defaultOutputPath, indexDeclarationFileName))
  }

  fs.rmSync(tmpDir, { recursive: true });
}

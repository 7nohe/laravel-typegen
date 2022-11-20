import { print } from "./print";
import { CLIOptions } from "./cli";
import { createSource } from "./createSource";
import glob from "glob";
import fs from "fs";
import { execSync } from "child_process";
import { LaravelModelType } from "./types";

const tmpDir = "./.laravel-typegen-tmp";
export async function generate(options: CLIOptions) {
  const models = glob.sync(`app/Models/*.php`);
  const modelData: LaravelModelType[] = [];
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  for (const model of models) {
    const modelName = model.split("/").at(-1)?.replace(".php", "");
    const modelShowCommand = `php artisan model:show ${modelName} --json > ${tmpDir}/${modelName}.json`;
    console.log(modelShowCommand);
    execSync(modelShowCommand);
    console.log(`${modelName}.json was created successfully`);
    const modelJson = JSON.parse(
      fs.readFileSync(`${tmpDir}/${modelName}.json`, "utf8")
    ) as LaravelModelType;
    modelData.push(modelJson);
  }
  fs.rmSync(tmpDir, { recursive: true });
  const source = createSource(modelData);
  print(source, options);
}

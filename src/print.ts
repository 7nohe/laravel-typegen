import fs from "fs";
import path from "path";
import { CLIOptions } from "./cli";
import { defaultOutputPath } from "./constants";

function printGeneratedTS(result: string, options: CLIOptions) {
  fs.writeFileSync(path.join(options.output, "model.ts"), result);
}

export function print(result: string, options: CLIOptions) {
  const outputPath = options.output ?? defaultOutputPath;
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  printGeneratedTS(result, options);
}
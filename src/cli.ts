#!/usr/bin/env node
import { generate } from "./generate";
import { Command } from "commander";
import packageJson from "../package.json";
import {
  defaultEnumPath,
  defaultModelPath,
  defaultOutputPath,
  tmpDir,
} from "./constants";
import fs from "fs";

export type CLIOptions = {
  output: string;
  laravelEnum: boolean;
  enumPath: string;
  modelPath: string;
  ziggy: boolean;
  ignoreRouteDts: boolean;
  formRequest: boolean;
};

const program = new Command();

program
  .name("laravel-typegen")
  .version(packageJson.version)
  .description("Generate TypeScript types from your Laravel code")
  .option("-o, --output <value>", "Output directory", defaultOutputPath)
  .option("--laravel-enum", "Use Laravel Enum", false)
  .option("--enum-path <value>", "Path to enum files", defaultEnumPath)
  .option("--model-path <value>", "Path to model files", defaultModelPath)
  .option("-z, --ziggy", "Generate types for ziggy", false)
  .option("--ignore-route-dts", "Ignore generating route.d.ts", false)
  .option("--form-request", "Generate types for FormRequests", false)
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating types...`);

try {
  generate(options).then(() => {
    console.log(`Types generated successfully!!`);
  });
} catch {
  console.log("Failed to generate types.");
  if (fs.existsSync(tmpDir)) {
    // Clean up
    fs.rmSync(tmpDir, { recursive: true });
  }
}

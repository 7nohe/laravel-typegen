#!/usr/bin/env node
import { generate } from "./generate";
import { Command } from "commander";
import packageJson from "../package.json";
import { defaultEnumPath, defaultOutputPath } from "./constants";

export type CLIOptions = {
  output: string;
  laravelEnum: boolean;
  enumPath: string;
  ziggy: boolean;
  ignoreRouteDts: boolean;
};

const program = new Command();

program
  .name("laravel-typegen")
  .version(packageJson.version)
  .description("Generate TypeScript types from your Laravel code")
  .option("-o, --output <value>", "Output directory", defaultOutputPath)
  .option("--laravel-enum", "Use Laravel Enum", false)
  .option("--enum-path <value>", "Path to enum files", defaultEnumPath)
  .option("-z, --ziggy", "Generate types for ziggy", false)
  .option("--ignore-route-dts", "Ignore generating route.d.ts", false)
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating types...`);
generate(options);

#!/usr/bin/env node
import { generate } from "./generate";
import { Command } from "commander";
import packageJson from "../package.json";
import { defaultOutputPath } from "./constants";

export type CLIOptions = {
  output: string;
};

const program = new Command();

program
  .name("laravel-typegen")
  .version(packageJson.version)
  .description("Generate TypeScript types from your Laravel models")
  .option("-o, --output <value>", "Output directory", defaultOutputPath)
  .parse();

const options = program.opts<CLIOptions>();

console.log(`Generating types...`);
generate(options);

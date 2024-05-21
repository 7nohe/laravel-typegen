#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { defaultFormRequestPath } from "@7nohe/laravel-zodgen";
import { Command } from "commander";
import { consola } from "consola";
import { colors } from "consola/utils";
import packageJson from "../package.json";
import {
	defaultEnumPath,
	defaultModelPath,
	defaultOutputPath,
	tmpDir,
} from "./constants";
import { generate } from "./generate";

export type CLIOptions = {
	output: string;
	laravelEnum: boolean;
	enumPath: string;
	modelPath: string;
	ziggy: boolean;
	vendorRoutes: boolean;
	ignoreRouteDts: boolean;
	formRequest: boolean;
	formRequestPath: string;
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
	.option("--vendor-routes", "Include routes defined by vendor packages", false)
	.option("--ignore-route-dts", "Ignore generating route.d.ts", false)
	.option("--form-request", "Generate types for FormRequests", false)
	.option(
		"--form-request-path <value>",
		"Path to FormRequest files",
		defaultFormRequestPath,
	)
	.parse();

const options = program.opts<CLIOptions>();

consola.box(`${colors.bgBlueBright(`Laravel Typegen v${packageJson.version}`)}

[Options]
${Object.entries(options)
	.map(([key, value]) => `${key}: ${value}`)
	.join("\n")}
`);

try {
	generate(options).then(() => {
		consola.success(
			`Done! Generated types are available in ${path.resolve(options.output)}`,
		);
	});
} catch {
	consola.error("Failed to generate types.");
	if (fs.existsSync(tmpDir) && process.env.KEEP_LARAVEL_JSON !== "true") {
		// Clean up
		fs.rmSync(tmpDir, { recursive: true });
	}
}

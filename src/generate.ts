import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { parseFormRequests } from "@7nohe/laravel-zodgen";
import { consola } from "consola";
import { colors } from "consola/utils";
import { sync } from "glob";
import type { CLIOptions } from "./cli";
import {
	defaultOutputPath,
	formRequestsFileName,
	indexDeclarationFileName,
	modelFileName,
	routeParamsFileName,
	tmpDir,
} from "./constants";
import { createFormRequestTypes } from "./formRequests/createFormRequestTypes";
import { createSource as createModelSource } from "./models/createSource";
import { print } from "./print";
import { createRouteParamsSource } from "./routes/createSource";
import type { LaravelModelType, LaravelRouteListType } from "./types";
import { formatNamespaceForCommand, getPhpAst, getPhpNamespace } from "./utils";

const modelLogPrefix = colors.bgBlueBright("[Model]");
const routeLogPrefix = colors.bgGreenBright("[Route]");
const formRequestLogPrefix = colors.bgYellowBright("[FormRequest]");

export async function generate(options: CLIOptions) {
	consola.info(
		modelLogPrefix,
		colors.blueBright("Start generating model types..."),
	);

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
		const modelName =
			modelPath
				.replace(/\\/g, "/")
				.replace(`${options.modelPath.replace(/\\/g, "/")}/`, "")
				.replace(path.extname(modelPath), "") // remove .php extension
				.split("/")
				.at(-1) ?? ""; // get only model name without directory

		createModelDirectory(modelName);

		const namespacedModel = `${getNamespaceForCommand(modelPath)}/${modelName}`;
		const outputPath = path.join(tmpDir, `${modelName}.json`);

		const modelShowCommand = `php artisan model:show ${namespacedModel} --json`;

		// Run artisan command to get model data
		try {
			if (process.env.SKIP_ARTISAN_COMMAND !== "true") {
				consola.start(
					modelLogPrefix,
					`Running '${colors.blueBright(modelShowCommand)}'`,
				);
				const json = execSync(modelShowCommand).toString();
				const dir = path.dirname(outputPath);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}
				fs.writeFileSync(outputPath, json);
				consola.success(modelLogPrefix, `Saved ${modelName} to ${outputPath}`);
			} else {
				consola.info(modelLogPrefix, `Skipping ${modelShowCommand}`);
			}
		} catch (e) {
			consola.info(
				modelLogPrefix,
				`Failed to get model data for ${modelName}'. You still can generate types by running ${modelShowCommand} manually and then run 'laravel-typegen' with SKIP_ARTISAN_COMMAND=true environment variable.`,
			);
			consola.error(modelLogPrefix, e);
		}

		// Read model data from JSON file
		try {
			const jsonPath = path.resolve(tmpDir, `${modelName}.json`);
			consola.start(modelLogPrefix, `Reading ${jsonPath}`);
			const modelJson = JSON.parse(
				fs.readFileSync(jsonPath, "utf8"),
			) as LaravelModelType;
			modelData.push(modelJson);
		} catch {
			consola.warn(
				modelLogPrefix,
				`Failed to generate ${modelName}. Skipping...`,
			);
		}
	}

	const modelSource = createModelSource(
		modelFileName,
		modelData,
		enums,
		options,
	);
	print(modelFileName, modelSource, options.output ?? defaultOutputPath);

	consola.success(
		modelLogPrefix,
		colors.blueBright("Model types generated successfully."),
	);

	// Generate types for ziggy
	if (options.ziggy) {
		consola.info(
			routeLogPrefix,
			colors.greenBright("Start generating route types..."),
		);

		const vendorOption = options.vendorRoutes ? "" : "--except-vendor";
		const routeListCommand = `php artisan route:list ${vendorOption} --json`;

		if (process.env.SKIP_ARTISAN_COMMAND !== "true") {
			consola.start(
				routeLogPrefix,
				`Running '${colors.greenBright(routeListCommand)}'`,
			);
			const json = execSync(routeListCommand).toString();
			const dir = path.dirname(path.resolve(tmpDir, "route.json"));
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, {
					recursive: true,
				});
			}
			fs.writeFileSync(path.resolve(tmpDir, "route.json"), json);
			consola.success(
				routeLogPrefix,
				`Saved route.json to ${path.resolve(tmpDir, "route.json")}`,
			);
		} else {
			consola.warn(routeLogPrefix, "Failed to get route data. Skipping...");
		}

		consola.start(routeLogPrefix, "Reading route.json");
		const routeJson = JSON.parse(
			fs.readFileSync(path.resolve(tmpDir, "route.json"), "utf8"),
		) as LaravelRouteListType[];

		const routeSource = createRouteParamsSource(
			routeParamsFileName,
			routeJson,
			options,
		);

		print(
			routeParamsFileName,
			routeSource,
			options.output ?? defaultOutputPath,
		);

		consola.start(routeLogPrefix, "Copying route.d.ts...");

		// Copy route.d.ts
		if (!options.ignoreRouteDts) {
			fs.copyFileSync(
				path.resolve(__dirname, "..", "templates", indexDeclarationFileName),
				path.resolve(
					options.output ?? defaultOutputPath,
					indexDeclarationFileName,
				),
			);
		}

		consola.success(
			routeLogPrefix,
			colors.greenBright("Route types generated successfully."),
		);
	}

	if (options.formRequest) {
		consola.start(
			formRequestLogPrefix,
			colors.yellowBright("Start generating form request types..."),
		);
		consola.start(
			formRequestLogPrefix,
			`Parsing form requests from ${options.formRequestPath}...`,
		);
		// Generate types for form requests
		const rules = parseFormRequests(options.formRequestPath, true);
		consola.success(formRequestLogPrefix, "Form requests parsed successfully.");

		const formRequestSource = createFormRequestTypes(rules);
		print(
			formRequestsFileName,
			formRequestSource,
			options.output ?? defaultOutputPath,
		);

		consola.success(
			formRequestLogPrefix,
			colors.yellowBright("Form request types generated successfully."),
		);
	}

	if (fs.existsSync(tmpDir) && process.env.KEEP_LARAVEL_JSON !== "true") {
		consola.start("Removing temporary files...");
		fs.rmSync(tmpDir, { recursive: true });
		consola.success("Temporary files removed.");
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

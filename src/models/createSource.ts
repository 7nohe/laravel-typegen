import ts from "typescript";
import type { CLIOptions } from "../cli";
import type { LaravelModelType } from "../types";
import { createEnumTypes } from "./createEnumTypes";
import { createLaravelEnumTypes } from "./createLarvelEnumTypes";
import { createTypes } from "./createTypes";
const createSourceFile = (
	modelData: LaravelModelType[],
	enums: string[],
	options: CLIOptions,
) => {
	return ts.factory.createSourceFile(
		[
			...createTypes(modelData),
			...(options.laravelEnum
				? createLaravelEnumTypes(enums)
				: createEnumTypes(enums)),
		],
		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
		ts.NodeFlags.None,
	);
};

export const createSource = (
	filename: string,
	modelData: LaravelModelType[],
	enums: string[],
	options: CLIOptions,
) => {
	const resultFile = ts.createSourceFile(
		filename,
		"",
		ts.ScriptTarget.Latest,
		false,
		ts.ScriptKind.TS,
	);
	const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

	const result = printer.printNode(
		ts.EmitHint.Unspecified,
		createSourceFile(modelData, enums, options),
		resultFile,
	);

	return result;
};

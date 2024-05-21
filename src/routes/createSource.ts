import ts from "typescript";
import type { CLIOptions } from "../cli";
import type { LaravelRouteListType } from "../types";
import { createTypes } from "./createTypes";

const createSourceFile = (
	routeListData: LaravelRouteListType[],
	options: CLIOptions,
) => {
	return ts.factory.createSourceFile(
		[...createTypes(routeListData)],
		ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
		ts.NodeFlags.None,
	);
};

export const createRouteParamsSource = (
	filename: string,
	routeListData: LaravelRouteListType[],
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
		createSourceFile(routeListData, options),
		resultFile,
	);

	return result;
};

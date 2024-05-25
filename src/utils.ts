import fs from "node:fs";
import { Engine, type Namespace, type Program } from "php-parser";
import { defaultEnumPath } from "./constants";
import type { Attribute } from "./types";

// "app/Enums" -> "App-Enums"
const enumPath = defaultEnumPath
	.split("/")
	.map((name) => name.charAt(0).toUpperCase() + name.substring(1).toLowerCase())
	.join("-");

export const isEnum = (attribute: Attribute, customEnumPath?: string) => {
	return attribute.cast
		?.replaceAll("\\", "-")
		.match(new RegExp(customEnumPath ?? enumPath));
};

export const convertCamelToSnake = (camelCaseString: string): string => {
	return camelCaseString.replace(/[A-Z]/g, (str) => `_${str.toLowerCase()}`);
};

export const formatNamespaceForCommand = (namespace: string): string => {
	return namespace.replaceAll(/\\/g, "\\\\");
};

export const getPhpAst = (phpFilePath: string): Program => {
	const parser = new Engine({});

	const file = fs.readFileSync(phpFilePath);
	const fileName = phpFilePath.split("/").at(-1) ?? "";
	const ast = parser.parseCode(file.toString(), fileName);

	return ast;
};

export const getPhpNamespace = (phpAst: Program): Namespace => {
	const namespaceObj = phpAst.children.find(
		(child) => child.kind === "namespace",
	) as Namespace;

	return namespaceObj;
};

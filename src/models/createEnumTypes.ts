import fs from "node:fs";
import {
	type Class,
	Engine,
	type EnumCase,
	type Identifier,
	type Namespace,
	type Number as NumberType,
	type String as StringType,
} from "php-parser";
import ts from "typescript";

const parser = new Engine({});

const getInitializer = (enumcase: EnumCase) => {
	const numberValue = enumcase.value as unknown as NumberType;
	if (numberValue.kind === "number") {
		return ts.factory.createNumericLiteral(numberValue.value);
	}

	return ts.factory.createStringLiteral(
		(enumcase.value as unknown as StringType).value,
	);
};

export const createEnumType = (enumFilePath: string) => {
	const phpFile = fs.readFileSync(enumFilePath);
	const ast = parser.parseCode(
		phpFile.toString(),
		enumFilePath.split("/").at(-1) ?? "",
	);

	// find Namespace
	const namespace = ast.children.find(
		(child) => child.kind === "namespace",
	) as Namespace;

	// find enum Block
	const enumBlock = namespace.children.find(
		(child) => child.kind === "enum",
	) as Class;

	const enumName = (enumBlock.name as Identifier).name;

	// get EnumCases
	const enumcases = enumBlock.body.filter(
		(declaration) => declaration.kind === "enumcase",
	) as unknown as EnumCase[];

	return ts.factory.createEnumDeclaration(
		[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
		ts.factory.createIdentifier(enumName),
		enumcases.map((enumcase) =>
			ts.factory.createEnumMember(
				ts.factory.createIdentifier(
					(enumcase.name as unknown as Identifier).name,
				),
				getInitializer(enumcase),
			),
		),
	);
};

export const createEnumTypes = (enumFilePaths: string[]) => {
	return enumFilePaths.map((path) => createEnumType(path));
};

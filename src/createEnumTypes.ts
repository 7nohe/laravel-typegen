import ts from "typescript";
import {
  Class,
  Engine,
  EnumCase,
  Identifier,
  Namespace,
  Number,
  String,
} from "php-parser";
import fs from "fs";

const parser = new Engine({});

const getInitializer = (enumcase: EnumCase) => {
  const numberValue = enumcase.value as unknown as Number;
  if (numberValue.kind === "number") {
    return ts.factory.createNumericLiteral(numberValue.value);
  }

  return ts.factory.createStringLiteral(
    (enumcase.value as unknown as String).value
  );
};

export const createEnumType = (enumFilePath: string) => {
  const phpFile = fs.readFileSync(enumFilePath);
  const ast = parser.parseCode(
    phpFile.toString(),
    enumFilePath.split("/").at(-1)!
  );

  // find Namespace
  const namespace = ast.children.find(
    (child) => child.kind === "namespace"
  ) as Namespace;

  // find enum Block
  const enumBlock = namespace.children.find(
    (child) => child.kind === "enum"
  ) as Class;

  const enumName = (enumBlock.name as Identifier).name;

  // get EnumCases
  const enumcases = enumBlock.body.filter(
    (declaration) => declaration.kind === "enumcase"
  ) as unknown as EnumCase[];

  return ts.factory.createEnumDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(enumName),
    enumcases.map((enumcase) =>
      ts.factory.createEnumMember(
        ts.factory.createIdentifier(
          (enumcase.name as unknown as Identifier).name
        ),
        getInitializer(enumcase)
      )
    )
  );
};

export const createEnumTypes = (enumFilePaths: string[]) => {
  return enumFilePaths.map((path) => createEnumType(path));
};

import ts from "typescript";
import { defaultEnumPath } from "./constants";
import { Attribute } from "./types";
import {
  Class,
  ClassConstant,
  Constant,
  Engine,
  Identifier,
  Namespace,
  Number,
  String,
} from "php-parser";
import fs from "fs";

const parser = new Engine({});

// "app/Enums" -> "App-Enums"
const enumPath = defaultEnumPath
  .split("/")
  .map((name) => name.charAt(0).toUpperCase() + name.substring(1).toLowerCase())
  .join("-");

export const isEnum = (attribute: Attribute) => {
  return attribute.cast?.replaceAll("\\", "-").match(new RegExp(enumPath));
};

const getInitializer = (constant: Constant) => {
  const numberValue = constant.value as Number;
  if (numberValue.kind === "number") {
    return ts.factory.createNumericLiteral(numberValue.value);
  }

  return ts.factory.createStringLiteral(
    (constant.value as unknown as String).value
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

  // find Class Block
  const classBlock = namespace.children.find(
    (child) => child.kind === "class"
  ) as Class;

  const className = (classBlock.name as Identifier).name;

  // get Constants
  const constants = (
    classBlock.body.filter(
      (declaration) => declaration.kind === "classconstant"
    ) as unknown as ClassConstant[]
  ).map((declaration) => declaration.constants.at(0)) as Constant[];

  return ts.factory.createEnumDeclaration(
    undefined,
    ts.factory.createIdentifier(className),
    constants.map((constant) =>
      ts.factory.createEnumMember(
        ts.factory.createIdentifier(
          (constant.name as unknown as Identifier).name
        ),
        getInitializer(constant)
      )
    )
  );
};

export const createEnumTypes = (enumFilePaths: string[]) => {
  return enumFilePaths.map((path) => createEnumType(path));
};

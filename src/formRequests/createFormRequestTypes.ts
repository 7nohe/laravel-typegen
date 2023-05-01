import { ParsedRules } from "@7nohe/laravel-zodgen";
import ts from "typescript";

function getKeyword(name: string): ts.KeywordTypeSyntaxKind {
  switch (name) {
    case "string":
      return ts.SyntaxKind.StringKeyword;
    case "number":
      return ts.SyntaxKind.NumberKeyword;
    case "boolean":
      return ts.SyntaxKind.BooleanKeyword;
    case "undefined":
      return ts.SyntaxKind.UndefinedKeyword;
    default:
      return ts.SyntaxKind.AnyKeyword;
  }
}

function isArrayOfPrimitives(
  arrayValue:
    | Record<string, any>
    | {
        name: string;
        isRequired: boolean;
      }
) {
  const isArrayOfPrimitives =
    typeof arrayValue === "object" &&
    "name" in arrayValue &&
    typeof arrayValue.name === "string";

  return isArrayOfPrimitives;
}

export function createTypeNodeFromFields(fields: {
  [key: string]: { name: string; isRequired: boolean } | object;
}): ts.TypeNode {
  const isArray = "*" in fields;
  if (isArray) {
    const arrayValue = fields["*"];
    if (isArrayOfPrimitives(arrayValue)) {
      const arrayPrimitiveType = ts.factory.createKeywordTypeNode(
        getKeyword((arrayValue as { name: string, isRequired: boolean }).name)
      );
      return ts.factory.createArrayTypeNode(arrayPrimitiveType);
    }
    const arrayElementType = createTypeNodeFromFields(arrayValue as any);
    return ts.factory.createArrayTypeNode(arrayElementType);
  }
  const members = Object.entries(fields).flatMap<
    ts.PropertySignature | ts.TypeNode
  >(([name, value]) => {
    let typeNode: ts.TypeNode;
    const isNested = typeof value === "object" && !("name" in value);
    if (isNested) {
      typeNode = createTypeNodeFromFields(value as any);
    } else {
      typeNode = ts.factory.createKeywordTypeNode(
        getKeyword(value.name as string)
      );
    }

    const isArray = typeof value === "object" && "*" in value;
    if (isArray) {
      const arrayValue = value["*"] as { name: string; isRequired: boolean };
      if (isArrayOfPrimitives(arrayValue)) {
        const arrayPrimitiveType = ts.factory.createKeywordTypeNode(
          getKeyword(arrayValue.name as string)
        );
        typeNode = ts.factory.createArrayTypeNode(arrayPrimitiveType);
      } else {
        const arrayElementType = createTypeNodeFromFields(arrayValue as any);
        typeNode = ts.factory.createArrayTypeNode(arrayElementType);
      }
    }

    const isRequired = isNested ? false : (value as any).isRequired;

    return [
      ts.factory.createPropertySignature(
        undefined,
        name,
        isRequired
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        typeNode
      ),
    ];
  });

  return ts.factory.createTypeLiteralNode(
    members.filter(Boolean) as ts.TypeElement[]
  );
}

function createTypeAliasDeclaration(
  typeName: string,
  fields: { [key: string]: { name: string; isRequired: boolean } | object }
): ts.TypeAliasDeclaration {
  const typeNode = createTypeNodeFromFields(fields);

  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    typeName,
    undefined,
    typeNode
  );
}

export function createFormRequestTypes(rules: { [k: string]: ParsedRules }) {
  const sourceFile = ts.factory.createSourceFile(
    Object.entries(rules).map(([key, value]) =>
      createTypeAliasDeclaration(key, value)
    ),
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    sourceFile,
    sourceFile
  );
  return result;
}

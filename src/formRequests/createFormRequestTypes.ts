import ts from "typescript";

type FieldValue =
  | { name: string; isRequired: boolean; "*"?: FieldValue }
  | object;

type Fields =
  | {
      [key: string]: FieldValue;
    }
  | FieldValue;

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

function isArrayOfPrimitives(arrayValue: FieldValue) {
  return (
    typeof arrayValue === "object" &&
    "name" in arrayValue &&
    typeof arrayValue.name === "string"
  );
}

function createArrayTypeNode(arrayValue: FieldValue): ts.TypeNode {
  if (isArrayOfPrimitives(arrayValue)) {
    const arrayPrimitiveType = ts.factory.createKeywordTypeNode(
      getKeyword((arrayValue as { name: string; isRequired: boolean }).name),
    );
    return ts.factory.createArrayTypeNode(arrayPrimitiveType);
  }
  const arrayElementType = createTypeNodeFromFields(arrayValue);
  return ts.factory.createArrayTypeNode(arrayElementType);
}

function createTypeNodeForValue(value: FieldValue): ts.TypeNode {
  if (typeof value === "object" && !("name" in value)) {
    return createTypeNodeFromFields(value);
  }

  if (typeof value === "object" && "*" in value && value["*"]) {
    return createArrayTypeNode(value["*"]);
  }

  return ts.factory.createKeywordTypeNode(getKeyword(value.name as string));
}

function createTypeNodeFromFields(fields: Fields): ts.TypeNode {
  if ("*" in fields && fields["*"]) {
    return createArrayTypeNode(fields["*"]);
  }
  const members = Object.entries(fields).flatMap<
    ts.PropertySignature | ts.TypeNode
  >(([name, value]) => {
    const typeNode = createTypeNodeForValue(value);

    const isRequired = !("name" in value) || value.isRequired;

    return [
      ts.factory.createPropertySignature(
        undefined,
        name,
        isRequired
          ? undefined
          : ts.factory.createToken(ts.SyntaxKind.QuestionToken),
        typeNode,
      ),
    ];
  });

  return ts.factory.createTypeLiteralNode(
    members.filter(Boolean) as ts.TypeElement[],
  );
}

function createTypeAliasDeclaration(
  typeName: string,
  fields: Fields,
): ts.TypeAliasDeclaration {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    typeName,
    undefined,
    createTypeNodeFromFields(fields),
  );
}

export function createFormRequestTypes(rules: Fields) {
  const sourceFile = ts.factory.createSourceFile(
    Object.entries(rules).map(([key, value]) =>
      createTypeAliasDeclaration(key, value),
    ),
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  return printer.printNode(ts.EmitHint.Unspecified, sourceFile, sourceFile);
}

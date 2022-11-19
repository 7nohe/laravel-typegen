import ts from "typescript";
import { ColumnType, LaravelModelType } from "./types";

type TSModelKeyword = ts.SyntaxKind.NumberKeyword | ts.SyntaxKind.StringKeyword;

const keywordTypeDictionary: Record<ColumnType, TSModelKeyword> = {
  "bigint unsigned": ts.SyntaxKind.NumberKeyword,
  datetime: ts.SyntaxKind.StringKeyword,
};

const getKeywordType = (columnType: ColumnType) => {
  const keywordType = keywordTypeDictionary[columnType];
  if (keywordType) return keywordType;

  if (columnType.match(/string\(/)) {
    return ts.SyntaxKind.StringKeyword;
  }

  return ts.SyntaxKind.AnyKeyword;
};

export const createTypes = (modelData: LaravelModelType[]) => {
  return modelData.map((model) =>
    ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(model.class.split("\\").at(-1)!),
      undefined,
      ts.factory.createTypeLiteralNode(
        model.attributes.map((attribute) =>
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier(attribute.name),
            undefined,
            ts.factory.createKeywordTypeNode(getKeywordType(attribute.type))
          )
        )
      )
    )
  );
};

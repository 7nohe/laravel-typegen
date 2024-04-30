import ts, { TypeNode } from "typescript";
import { convertCamelToSnake, isEnum } from "../utils";
import { Attribute, ColumnType, LaravelModelType, Relation } from "../types";

type TSModelKeyword =
  | ts.SyntaxKind.NumberKeyword
  | ts.SyntaxKind.StringKeyword
  | ts.SyntaxKind.BooleanKeyword;

const keywordTypeDictionary: Record<ColumnType, TSModelKeyword> = {
  "bigint unsigned": ts.SyntaxKind.NumberKeyword,
  "integer unsigned": ts.SyntaxKind.NumberKeyword,
  bigint: ts.SyntaxKind.NumberKeyword,
  integer: ts.SyntaxKind.NumberKeyword,
  smallint: ts.SyntaxKind.NumberKeyword,
  boolean: ts.SyntaxKind.BooleanKeyword,
  datetime: ts.SyntaxKind.StringKeyword,
  date: ts.SyntaxKind.StringKeyword,
  text: ts.SyntaxKind.StringKeyword,
  string: ts.SyntaxKind.StringKeyword,
  char: ts.SyntaxKind.StringKeyword,
  varchar: ts.SyntaxKind.StringKeyword,
};

const getKeywordType = (columnType: ColumnType | null) => {
  if (!columnType) {
    return ts.SyntaxKind.AnyKeyword;
  }
  const keywordType = keywordTypeDictionary[columnType];
  if (keywordType) return keywordType;

  if (columnType.match(/string|text|char.*|varchar.*/)) {
    return ts.SyntaxKind.StringKeyword;
  }

  return ts.SyntaxKind.AnyKeyword;
};

const manyRelations: Relation["type"][] = [
  "HasMany",
  "MorphMany",
  "HasManyThrough",
  "BelongsToMany",
];
const oneRlations: Relation["type"][] = [
  "HasOne",
  "MorphOne",
  "HasOneThrough",
  "BelongsTo",
];

const getRelationNode = (relation: Relation) => {
  // many relation
  if (manyRelations.includes(relation.type)) {
    return ts.factory.createArrayTypeNode(
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(getClassName(relation.related)!),
        undefined
      )
    );
  }

  // one relation
  if (oneRlations.includes(relation.type)) {
    return ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(getClassName(relation.related)!),
      undefined
    );
  }

  return ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword);
};

const getClassName = (namespace: string) => {
  return namespace.split("\\").at(-1);
};

const createAttributeType = (attribute: Attribute) => {
  let node: TypeNode = ts.factory.createKeywordTypeNode(
    getKeywordType(attribute.type)
  );

  // Blob type
  if (attribute.type === "blob") {
    node = ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier("Blob"),
      undefined
    );
  }

  // Date, DateTime cast
  if (attribute.cast && ["date", "datetime"].includes(attribute.cast)) {
    node = ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }

  // Json type
  if (attribute.type === "json") {
    if (attribute.cast === "array") {
      node = ts.factory.createArrayTypeNode(
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
      );
    }

    if (attribute.cast === "object") {
      node = ts.factory.createTypeReferenceNode("Record", [
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
        ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
      ]);
    }
  }

  // Enum type
  if (attribute.cast && isEnum(attribute)) {
    // Create enum type node
    node = ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(attribute.cast.split("\\").at(-1)!),
      undefined
    );
  }

  return ts.factory.createPropertySignature(
    undefined,
    ts.factory.createIdentifier(attribute.name),
    attribute.nullable
      ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
      : undefined,
    node
  );
};

export const createTypes = (modelData: LaravelModelType[]) => {
  const modelNames = modelData.map((data) => data.class);
  return modelData.map((model) =>
    ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(getClassName(model.class)!),
      undefined,
      ts.factory.createTypeLiteralNode([
        ...model.attributes
          .filter((attribute) => !attribute.hidden)
          .map((attribute) => createAttributeType(attribute)),
        ...model.relations
          .filter((relation) => modelNames.includes(relation.related))
          .map((relation) =>
            ts.factory.createPropertySignature(
              undefined,
              ts.factory.createIdentifier(convertCamelToSnake(relation.name)),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              getRelationNode(relation)
            )
          ),
      ])
    )
  );
};

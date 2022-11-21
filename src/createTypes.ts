import ts, { TypeNode } from "typescript";
import { isEnum } from "./utils";
import { Attribute, ColumnType, LaravelModelType, Relation } from "./types";

type TSModelKeyword = ts.SyntaxKind.NumberKeyword | ts.SyntaxKind.StringKeyword;

const keywordTypeDictionary: Record<ColumnType, TSModelKeyword> = {
  "bigint unsigned": ts.SyntaxKind.NumberKeyword,
  bigint: ts.SyntaxKind.NumberKeyword,
  datetime: ts.SyntaxKind.StringKeyword,
  date: ts.SyntaxKind.StringKeyword,
};

const getKeywordType = (columnType: ColumnType) => {
  const keywordType = keywordTypeDictionary[columnType];
  if (keywordType) return keywordType;

  if (columnType.match(/string\(/)) {
    return ts.SyntaxKind.StringKeyword;
  }

  return ts.SyntaxKind.AnyKeyword;
};

const manyRelations: Relation["type"][] = [
  "HasMany",
  "MorphMany",
  "HasManyThrough",
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
              ts.factory.createIdentifier(relation.name),
              ts.factory.createToken(ts.SyntaxKind.QuestionToken),
              getRelationNode(relation)
            )
          ),
      ])
    )
  );
};

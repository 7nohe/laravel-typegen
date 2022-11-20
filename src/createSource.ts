import ts from "typescript";
import { createEnumTypes } from "./createEnumTypes";
import { createTypes } from "./createTypes";
import { LaravelModelType } from "./types";
const createSourceFile = (modelData: LaravelModelType[], enums: string[]) => {
  return ts.factory.createSourceFile(
    [...createTypes(modelData), ...createEnumTypes(enums)],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
};

export const createSource = (modelData: LaravelModelType[], enums: string[]) => {
  const resultFile = ts.createSourceFile(
    "model.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result = printer.printNode(
    ts.EmitHint.Unspecified,
    createSourceFile(modelData, enums),
    resultFile
  );

  return result;
};

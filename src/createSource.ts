import ts from "typescript";
import { createTypes } from "./createTypes";
import { LaravelModelType } from "./types";
const createSourceFile = (modelData: LaravelModelType[]) => {
  return ts.factory.createSourceFile(
    [...createTypes(modelData)],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );
};

export const createSource = (modelData: LaravelModelType[]) => {
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
    createSourceFile(modelData),
    resultFile
  );

  return result;
};

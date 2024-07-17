import ts from "typescript";
import type { LaravelRouteListType } from "../types";

export const createTypes = (routeListData: LaravelRouteListType[]) => {
  return [
    ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier("RouteParams"),
      undefined,
      ts.factory.createTypeLiteralNode(
        routeListData
          .filter((route) => route.name)
          .map((route) => {
            const params = Array.from(
              route.uri.matchAll(/\{(.*?)\}/g),
              (param) => param[1],
            );
            return ts.factory.createPropertySignature(
              undefined,
              ts.factory.createStringLiteral(route.name ?? ""),
              undefined,
              ts.factory.createTypeLiteralNode(
                params?.map((param) =>
                  ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(param),
                    undefined,
                    ts.factory.createKeywordTypeNode(
                      ts.SyntaxKind.StringKeyword,
                    ),
                  ),
                ),
              ),
            );
          }),
      ),
    ),
  ];
};

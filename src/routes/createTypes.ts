import { consola } from "consola";
import ts from "typescript";
import type { LaravelRouteListType } from "../types";

export const createTypes = (routeListData: LaravelRouteListType[]) => {
	const keys: string[] = [];
	return [
		ts.factory.createTypeAliasDeclaration(
			[ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
			ts.factory.createIdentifier("RouteParams"),
			undefined,
			ts.factory.createTypeLiteralNode(
				routeListData
					.filter((route) => {
						if (!route.name) {
							consola.warn(`Route definitions must have a name for type generation.
Skipping the following route:
Method: ${route.method}
Uri: ${route.uri}
Action: ${route.action}`);
							return false;
						}
						if (keys.includes(route.name)) {
							consola.warn(`Duplicate route name found in route definitions.
Skipping the following route:
Name: ${route.name}
Method: ${route.method}
Uri: ${route.uri}
Action: ${route.action}`);
							return false;
						}
						keys.push(route.name);
						return true;
					})
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

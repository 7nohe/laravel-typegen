import { defaultEnumPath } from "./constants";
import { Attribute } from "./types";

// "app/Enums" -> "App-Enums"
const enumPath = defaultEnumPath
  .split("/")
  .map((name) => name.charAt(0).toUpperCase() + name.substring(1).toLowerCase())
  .join("-");

export const isEnum = (attribute: Attribute, customEnumPath?: string) => {
  return attribute.cast
    ?.replaceAll("\\", "-")
    .match(new RegExp(customEnumPath ?? enumPath));
};

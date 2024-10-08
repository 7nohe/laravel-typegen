export type Relation = {
  name: string;
  type:
    | "MorphMany"
    | "HasMany"
    | "BelongsToMany"
    | "HasManyThrough"
    | "BelongsTo"
    | "HasOne"
    | "MorphOne"
    | "HasOneThrough";
  related: string;
};

export type ColumnType =
  | "bigint unsigned"
  | "bigint"
  | "datetime"
  | "date"
  | string; // "string(n)"

type CastType =
  | "array"
  | "AsStringable::class"
  | "boolean"
  | "collection"
  | "date"
  | "datetime"
  | "immutable_date"
  | "immutable_datetime"
  | "double"
  | "encrypted"
  | "encrypted:array"
  | "encrypted:collection"
  | "encrypted:object"
  | "float"
  | "integer"
  | "object"
  | "real"
  | "string"
  | "timestamp"
  | null
  | string; // "decimal:<precision>"

export type Attribute = {
  name: string;
  type: ColumnType;
  increments: boolean;
  nullable: boolean;
  default: null;
  unique: boolean;
  fillable: boolean;
  hidden: boolean;
  appended: null;
  cast: CastType;
};

export type LaravelModelType = {
  class: string;
  database: "mysql" | "sqlite" | "pgsql";
  table: string;
  attributes: Attribute[];
  relations: Relation[];
  observers: unknown[];
};

export type LaravelRouteListType = {
  domain: string | null;
  method: "GET|HEAD" | "POST" | "PUT|PATCH" | "DELETE";
  uri: string;
  name: string | null;
  action: string;
  middleware: string[];
};

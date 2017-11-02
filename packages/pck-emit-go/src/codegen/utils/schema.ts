import { TNode, TChildren, Context, ComponentNode, context, component } from "osh";
import { Schema, Field } from "pck";
import { getBundle } from "./bundle";

const SCHEMA = Symbol("Schema");

export function getSchema(ctx: Context): Schema {
  return ctx[SCHEMA];
}

export function enterSchema(schema: Schema, ...children: TChildren[]): TNode {
  return context({ [SCHEMA]: schema }, ...children);
}

export function SchemaName(ctx: Context, schema: Schema) {
  return getBundle(ctx).getSchemaName(schema);
}

export function schemaName(schema: Schema): ComponentNode<Schema> {
  return component(SchemaName, schema);
}

export function SchemaType(ctx: Context, schema: Schema) {
  return getBundle(ctx).getSchemaName(schema);
}

export function schemaType(schema: Schema) {
  return component(SchemaType, schema);
}

export function fieldName(f: Field) {
  return f.name;
}

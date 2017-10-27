import { Schema, Field } from "pck";
import { Context, component, ComponentNode } from "osh";
import { getBundle } from "./bundle";

export const SCHEMA = Symbol("Schema");

export function getSchema(ctx: Context): Schema {
  return ctx[SCHEMA];
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

export function bitSetOptionalIndex(schema: Schema, field: Field<any>) {
  return schema.optionalBitSetIndex(field).index;
}

export function bitSetOptionalPosition(schema: Schema, field: Field<any>) {
  return schema.optionalBitSetIndex(field).position;
}

export function bitSetBooleanIndex(schema: Schema, field: Field<any>) {
  return schema.booleanBitSetIndex(field).index;
}

export function bitSetBooleanPosition(schema: Schema, field: Field<any>) {
  return schema.booleanBitSetIndex(field).position;
}

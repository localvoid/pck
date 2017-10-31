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

export function BitSetOptionalIndex(ctx: Context, field: Field) {
  return getSchema(ctx).optionalBitSetIndex(field).index;
}

export function bitSetOptionalIndex(f: Field) {
  return component(BitSetOptionalIndex, f);
}

export function BitSetOptionalPosition(ctx: Context, field: Field) {
  return getSchema(ctx).optionalBitSetIndex(field).position;
}

export function bitSetOptionalPosition(f: Field) {
  return component(BitSetOptionalPosition, f);
}

export function BitSetBooleanIndex(ctx: Context, field: Field) {
  return getSchema(ctx).booleanBitSetIndex(field).index;
}

export function bitSetBooleanIndex(f: Field) {
  return component(BitSetBooleanIndex, f);
}

export function BitSetBooleanPosition(ctx: Context, field: Field) {
  return getSchema(ctx).booleanBitSetIndex(field).position;
}

export function bitSetBooleanPosition(f: Field) {
  return component(BitSetBooleanPosition, f);
}

export function fieldName(f: Field) {
  return f.name;
}

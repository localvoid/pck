import { TNode, TChildren, Context, context } from "osh";
import { Schema } from "pck";
import { GoField } from "../../schema";

const SCHEMA = Symbol("Schema");

export function getSchema(ctx: Context): Schema<GoField> {
  return ctx[SCHEMA];
}

export function enterSchema(schema: Schema<GoField>, ...children: TChildren[]): TNode {
  return context({ [SCHEMA]: schema }, ...children);
}

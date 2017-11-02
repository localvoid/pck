import { Context, TNode, TChildren, component } from "osh";
import { capitalize } from "osh-text";
import { Schema } from "pck";
import { arg } from "./symbols";
import { getBundle } from "./bundle";

export function StructName(ctx: Context, schema: Schema): TChildren {
  const bundle = getBundle(ctx);
  return bundle.getSchemaName(schema);
}

export function structName(schema: Schema): TNode {
  return component(StructName, schema);
}

export function self(property?: TChildren): TChildren {
  if (property === void 0) {
    return arg("self");
  }
  return [arg("self"), ".", capitalize(property)];
}

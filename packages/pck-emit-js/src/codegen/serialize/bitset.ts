import { Context, ComponentNode, TChildren, component } from "osh";
import { line, indent } from "osh-code";
import { optional } from "./optional";
import { getSchema, pck, v, isTrue, getter } from "../utils";

export function SerializeBitSet(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return [
    line(pck("writeBitSet"), "("),
    indent(
      line(v("writer"), ","),
      schema.optionalFields.map((f) => line(optional(f), ",")),
      schema.booleanFields.map((f) => line(isTrue(getter(f)), ",")),
    ),
    line(");"),
  ];
}

export function serializeBitSet(): ComponentNode<undefined> {
  return component(SerializeBitSet);
}

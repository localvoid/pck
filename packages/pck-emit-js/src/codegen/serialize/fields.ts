import { Context, ComponentNode, TChildren, component } from "osh";
import { line, indent } from "osh-code";
import { serializeField } from "./field";
import { getSchema, optional } from "../utils";

export function SerializeFields(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return [
    schema.sortedFields.map((f) => f.type.isBoolean() ?
      null :
      f.isOptional() ?
        [
          line("if (", optional(f), ") {"),
          indent(line(serializeField(f), ";")),
          line("}"),
        ] :
        line(serializeField(f), ";"),
    ),
  ];
}

export function serializeFields(): ComponentNode<undefined> {
  return component(SerializeFields);
}

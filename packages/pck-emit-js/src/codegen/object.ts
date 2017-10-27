import { Context, ComponentNode, TChildren, component } from "osh";
import { line, indent, scope, declSymbol } from "osh-code";
import { ts } from "osh-code-js";
import { FIELD_VALUES, getSchema, fieldValue, tsFieldType } from "./utils";

export function ObjectConstructor(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return scope({
    type: FIELD_VALUES,
    symbols: schema.fields.map((f) => declSymbol(f, f.name)),
    children: [
      line("constructor("),
      indent(schema.fields.map((f) => line(fieldValue(f), ts(": ", tsFieldType(f)), ","))),
      line(") {"),
      indent(
        schema.fields.map((f) => line("this.", f.name, " = ", fieldValue(f), ";")),
      ),
      line("}"),
    ],
  });
}

export function objectConstructor(): ComponentNode<undefined> {
  return component(ObjectConstructor);
}

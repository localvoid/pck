import { Context, ComponentNode, TChildren, component } from "osh";
import { line, indent, scope, declSymbol } from "osh-code";
import { ts } from "osh-code-js";
import { FIELD_VALUES, getSchema, fieldValue, tsFieldType } from "./utils";

export function ObjectProperties(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return schema.fields.map((f) => line(f.name, ": ", tsFieldType(f), ";"));
}

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

export function objectProperties(): ComponentNode<undefined> {
  return component(ObjectProperties);
}

export function objectConstructor(): ComponentNode<undefined> {
  return component(ObjectConstructor);
}

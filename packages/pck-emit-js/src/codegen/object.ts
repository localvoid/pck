import { Context, ComponentNode, TChildren, component } from "osh";
import { line, indent, scope, declSymbol } from "osh-code";
import { jsCodeOptions, ts } from "osh-code-js";
import { pckMethod } from "./pck";
import { unpckFunction } from "./unpck";
import { FIELD_VALUES, getSchema, schemaName, fieldValue, tsFieldType } from "./utils";

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

export function ObjectClass(ctx: Context): TChildren {
  const schema = getSchema(ctx);
  const jsOpts = jsCodeOptions(ctx);

  return [
    line(
      jsOpts.module === "es2015" ? "export " : null,
      "class ", schemaName(schema), " {",
    ),
    indent(
      jsOpts.lang === "ts" ? [objectProperties(), line()] : null,
      objectConstructor(),
      line(),
      pckMethod(),
    ),
    line("}"),
    line(),
    unpckFunction(),
  ];
}

export function objectProperties(): ComponentNode<undefined> {
  return component(ObjectProperties);
}

export function objectConstructor(): ComponentNode<undefined> {
  return component(ObjectConstructor);
}

export function objectClass(): ComponentNode<undefined> {
  return component(ObjectClass);
}

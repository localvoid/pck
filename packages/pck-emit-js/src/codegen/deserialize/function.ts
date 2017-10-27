import { Context, ComponentNode, TChildren, component } from "osh";
import { Field } from "pck";
import { line, indent, docComment, scope, declSymbol } from "osh-code";
import { deserializeBitSet, bitSetSizes } from "./bitset";
import { deserializeField } from "./field";
import { checkBitSetOptional } from "./checks";
import { BIT_SETS, FIELD_VALUES, arg, type, pck, getSchema, schemaType, fieldValue } from "../utils";

function defaultValue(f: Field) {
  if (f.isOmitNull()) {
    return "null";
  }
  if (f.isOmitEmpty()) {
    if (f.type.isArray()) {
      return "[]";
    }
    if (f.type.isString()) {
      return `""`;
    }
    return "null"; // ByteArray
  }
  if (f.isOmitZero()) {
    return "0";
  }
  throw new Error("Field cannot have default value");
}

export function DeserializeBody(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return scope({
    type: FIELD_VALUES,
    symbols: schema.fields.map((f) => declSymbol(f, f.name)),
    children: scope({
      type: BIT_SETS,
      symbols: bitSetSizes(schema.bitSetSize()).map((s, i) => declSymbol(i, `bitSet${0}`)),
      children: [
        schema.hasBitSet() ? deserializeBitSet() : null,
        schema.hasRegularFields() ?
          [
            schema.sortedFields.map((f) => f.type.isBoolean() ?
              null :
              [
                line(
                  "const ", fieldValue(f), " = ",
                  f.isOptional() ?
                    [checkBitSetOptional(schema, f), " ? ", deserializeField(f), " : ", defaultValue(f)] :
                    deserializeField(f),
                  ";",
                ),
              ],
            ),
          ] : null,
        line(),
        line("return new ", schemaType(schema), "("),
        indent(schema.fields.map((f) => line(fieldValue(f), ","))),
        line(");"),
      ],
    }),
  });
}

export function deserializeBody(): ComponentNode<undefined> {
  return component(DeserializeBody);
}

export function DeserializeFunction(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return [
    docComment(
      line("unpck", schemaType(schema), " is an automatically generated deserialization function."),
      line(),
      line("@param ", arg("reader"), " Read buffer."),
      line("@returns Deserialized object."),
    ),
    line(
      "export function unpck", schemaType(schema), "(",
      arg("reader"), type(": ", pck("ReadBuffer")),
      ")", type(": ", schemaType(schema)), " {",
    ),
    indent(deserializeBody()),
    line("}"),
  ];
}

export function deserializeFunction(): ComponentNode<undefined> {
  return component(DeserializeFunction);
}

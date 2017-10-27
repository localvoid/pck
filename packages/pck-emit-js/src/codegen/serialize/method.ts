import { Context, ComponentNode, TChildren, component, capitalizeTransformer } from "osh";
import { line, indent, docComment, scope, declSymbol } from "osh-code";
import { writeUVar } from "./writers";
import { OPTIONAL, arg, type, pck, getBundle, getSchema } from "../utils";
import { serializeBitSet } from "./bitset";
import { serializeFields } from "./fields";
import { optionalChecks } from "./optional";

function serializeTag(tag: number) {
  return writeUVar(tag);
}

export function SerializeMethodBody(ctx: Context): TChildren {
  const bundle = getBundle(ctx);
  const schema = getSchema(ctx);
  const tag = bundle.getSchemaTag(schema);

  return scope({
    type: OPTIONAL,
    symbols: schema.optionalFields.map((f) => declSymbol(f, `optional${capitalizeTransformer(f.name)}`)),
    children: [
      tag !== void 0 ? serializeTag(tag) : null,
      schema.hasOptionalFields() ? optionalChecks() : null,
      schema.hasBitSet() ? serializeBitSet() : null,
      serializeFields(),
    ],
  });
}

export function serializeMethodBody(): ComponentNode<undefined> {
  return component(SerializeMethodBody);
}

export function SerializeMethod(ctx: Context): TChildren {
  const bundle = getBundle(ctx);
  const schema = getSchema(ctx);

  const shouldSupportTagging = bundle.getSchemaTag(schema) !== void 0;

  return [
    docComment(
      line("pck is an automatically generated serialization method."),
      line(),
      line("@param ", arg("writer"), " Writer object."),
      shouldSupportTagging ?
        line("@param ", arg("isTagged"), " Tagged.") :
        null,
    ),
    line(
      "pck", "(",
      arg("writer"), type(": ", pck("Writer")),
      shouldSupportTagging ?
        [", ", arg("isTagged"), type("?: boolean")] :
        null,
      ")", type(": void"), " {",
    ),
    indent(serializeMethodBody()),
    line("}"),
  ];
}

export function serializeMethod(): ComponentNode<undefined> {
  return component(SerializeMethod);
}

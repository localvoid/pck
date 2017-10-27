import { Context, ComponentNode, TChildren, component } from "osh";
import { line } from "osh-code";
import { checkBitSetBoolean } from "./checks";
import { getSchema, call, pck, arg, fieldValue, bitSet } from "../utils";

export function DeserializeBitSet(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return [
    bitSetSizes(schema.bitSetSize()).map((s, i) => (
      line("const ", bitSet(i), " = ", call(pck(`readU${s * 8}`), [arg("reader")]), ";")),
    ),
    schema.hasBooleanFields() ?
      schema.booleanFields.map((f) => line("const ", fieldValue(f), " = ", checkBitSetBoolean(schema, f), ";")) :
      null,
  ];
}

export function deserializeBitSet(): ComponentNode<undefined> {
  return component(DeserializeBitSet);
}

function bitSetMaxSize(size: number): number {
  if (size > 3) {
    return 4;
  }
  if (size > 1) {
    return 2;
  }
  return 1;
}

export function bitSetSizes(size: number): number[] {
  const r = [];
  while (size > 0) {
    const n = bitSetMaxSize(size);
    r.push(n);
    size -= n;
  }
  return r;
}

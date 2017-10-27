import { TChildren } from "osh";
import { Schema, Field } from "pck";
import {
  bitSetOptionalIndex, bitSetOptionalPosition, bitSetBooleanIndex, bitSetBooleanPosition, bitSet,
} from "../utils";

export function checkBitSetOptional(schema: Schema, field: Field<any>): TChildren {
  return [
    "(", bitSet(bitSetOptionalIndex(schema, field)),
    " & (1 << ", bitSetOptionalPosition(schema, field), ")) !== 0",
  ];
}

export function checkBitSetBoolean(schema: Schema, field: Field<any>): TChildren {
  return [
    "(", bitSet(bitSetBooleanIndex(schema, field)),
    " & (1 << ", bitSetBooleanPosition(schema, field), ")) !== 0",
  ];
}

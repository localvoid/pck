import { TChildren } from "osh";
import { Field } from "pck";
import { bitSetOptionalIndex, bitSetOptionalPosition, bitSetBooleanIndex, bitSetBooleanPosition } from "../utils";

export function checkBitSetOptional(f: Field): TChildren {
  return ["(__bitSet", bitSetOptionalIndex(f), " & (1 << ", bitSetOptionalPosition(f), ")) !== 0"];
}

export function checkBitSetBoolean(f: Field): TChildren {
  return ["(__bitSet", bitSetBooleanIndex(f), " & (1 << ", bitSetBooleanPosition(f), ")) !== 0"];
}

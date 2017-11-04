import { BoolType } from "./type";
import { Field } from "./field";
import { Schema } from "./schema";

export type BitFieldType = "optional" | "bool";
export type BitField = OptionalBitField | BoolBitField;

export class OptionalBitField {
  readonly type: "optional";
  readonly field: Field;
  readonly index: number;
  readonly offset: number;

  constructor(field: Field, index: number) {
    this.type = "optional";
    this.field = field;
    this.index = index;
    this.offset = Math.floor(index / 8);
  }

  toString() {
    return `<OptionalBitField: [${this.index}] ${this.field.toString()}>`;
  }
}

export class BoolBitField {
  readonly type: "bool";
  readonly field: Field<BoolType>;
  readonly index: number;
  readonly offset: number;

  constructor(field: Field<BoolType>, index: number) {
    this.type = "bool";
    this.field = field;
    this.index = index;
    this.offset = Math.floor(index / 8);
  }

  toString() {
    return `<BoolBitField: [${this.index}] ${this.field.toString()}>`;
  }
}

export class BitStore {
  readonly booleans: BoolBitField[];
  readonly optionals: OptionalBitField[];
  readonly length: number;

  constructor(optionals: OptionalBitField[], booleans: BoolBitField[]) {
    this.optionals = optionals;
    this.booleans = booleans;
    this.length = optionals.length + booleans.length;
  }
}

export function createBitStoreFromSchema<T extends Field>(schema: Schema<T>): BitStore {
  const optionals = [];
  const booleans = [];

  for (const field of schema.fields) {
    if (field.isOptional()) {
      optionals.push(field);
    }
    if (field.type.id === "bool") {
      booleans.push(field);
    }
  }

  let i = 0;
  return new BitStore(
    optionals.map((f) => new OptionalBitField(f, i++)),
    booleans.map((f) => new BoolBitField(f as Field<BoolType>, i++)),
  );
}

import { TypeFlags, TypeId } from "./type";
import { Field, FieldFlags } from "./field";

export const enum SchemaFlags {
  BitSet = 1,
  DynamicSize = 1 << 1,
  OptionalFields = 1 << 2,
  BooleanFields = 1 << 3,
  RegularFields = 1 << 4,
}

export const enum BitFieldType {
  Optional = 1,
  Boolean = 2,
}

export interface BitField {
  readonly type: BitFieldType;
  readonly field: Field;
}

export interface SchemaDetails {
  readonly flags: SchemaFlags;
  readonly size: number;
  readonly optionalFields: Field[];
  readonly booleanFields: Field[];
  readonly bitSet: BitField[];
}

export class Schema {
  readonly name: string;
  readonly fields: Field<any>[];
  readonly flags: SchemaFlags;
  readonly size: number;
  readonly optionalFields: Field[];
  readonly booleanFields: Field[];
  readonly bitSet: BitField[];
  readonly meta: Map<symbol, any>;

  constructor(name: string, fields: Field<any>[], details: SchemaDetails, meta: Map<symbol, any>) {
    this.name = name;
    this.fields = fields;
    this.flags = details.flags;
    this.size = details.size;
    this.optionalFields = details.optionalFields;
    this.booleanFields = details.booleanFields;
    this.bitSet = details.bitSet;
    this.meta = meta;
  }

  hasBitSet(): boolean {
    return (this.flags & SchemaFlags.BitSet) !== 0;
  }

  optionalBitSetIndex(field: Field): { index: number, position: number } {
    return bitSetIndex(this.optionalFields, field);
  }

  booleanBitSetIndex(field: Field): { index: number, position: number } {
    return bitSetIndex(this.booleanFields, field, this.optionalFields.length);
  }

  hasDynamicSize(): boolean {
    return (this.flags & SchemaFlags.DynamicSize) !== 0;
  }

  hasOptionalFields(): boolean {
    return (this.flags & SchemaFlags.OptionalFields) !== 0;
  }

  hasBooleanFields(): boolean {
    return (this.flags & SchemaFlags.BooleanFields) !== 0;
  }

  hasRegularFields(): boolean {
    return (this.flags & SchemaFlags.RegularFields) !== 0;
  }

  bitSetSize(): number {
    return Math.ceil(this.bitSet.length / 8);
  }
}

/* tslint:disable:no-empty-interface */
export type Fields = Field | RecursiveFieldArray | null;
export interface RecursiveFieldArray extends Array<Fields> { }
/* tslint:enable:no-empty-interface */

export interface KV<T> {
  key: symbol;
  value: T;
}

export function schema(name: string, fields: RecursiveFieldArray, ...meta: KV<any>[]): Schema {
  const normalizedFields = normalizeFields(fields);
  const m = new Map<symbol, any>();
  for (const kv of meta) {
    m.set(kv.key, kv.value);
  }
  return new Schema(name, normalizedFields, analyzeFields(normalizedFields), m);
}

function _normalizeFields(result: Field[], fields: RecursiveFieldArray): void {
  for (const f of fields) {
    if (f !== null) {
      if (Array.isArray(f)) {
        _normalizeFields(result, f);
      } else {
        result.push(f);
      }
    }
  }
}

function normalizeFields(fields: RecursiveFieldArray): Field[] {
  const result: Field[] = [];
  _normalizeFields(result, fields);
  return result;
}

function analyzeFields(fields: Field[]): SchemaDetails {
  const optionalFields: Field[] = [];
  const booleanFields: Field[] = [];
  const bitSet: BitField[] = [];
  let flags: SchemaFlags = 0;
  let size = 0;

  for (const field of fields) {
    if ((field.type.flags & TypeFlags.DynamicSize) !== 0) {
      flags |= SchemaFlags.DynamicSize;
    } else {
      size += field.type.size;
    }
    if ((field.flags & FieldFlags.Optional) !== 0) {
      flags |= SchemaFlags.OptionalFields;
      optionalFields.push(field);
    }
    if (field.type.id === TypeId.Bool) {
      flags |= SchemaFlags.BooleanFields;
      booleanFields.push(field);
    } else {
      flags |= SchemaFlags.RegularFields;
    }
  }

  if (optionalFields.length > 0) {
    for (const field of optionalFields) {
      bitSet.push({ type: BitFieldType.Optional, field });
    }
  }

  if (booleanFields.length > 0) {
    for (const field of booleanFields) {
      bitSet.push({ type: BitFieldType.Boolean, field });
    }
  }

  if (bitSet.length > 0) {
    flags |= SchemaFlags.BitSet;
    size += Math.ceil(bitSet.length / 8);
  }

  return { flags, size, optionalFields, booleanFields, bitSet };
}

function bitSetIndex(fields: Field[], field: Field, offset = 0): { index: number, position: number } {
  let position = offset + fields.indexOf(field);
  let index = 0;
  while (position > 0) {
    if (position > 32) {
      position -= 32;
    } else if (position > 16) {
      position -= 16;
    } else if (position > 8) {
      position -= 8;
    } else {
      break;
    }
    index++;
  }
  return { index, position };
}

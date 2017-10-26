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
  readonly sortedFields: Field[];
  readonly optionalFields: Field[];
  readonly booleanFields: Field[];
  readonly bitSet: BitField[];
}

export class Schema {
  readonly fields: Field<any>[];
  readonly flags: SchemaFlags;
  readonly size: number;
  readonly sortedFields: Field[];
  readonly optionalFields: Field[];
  readonly booleanFields: Field[];
  readonly bitSet: BitField[];

  constructor(fields: Field<any>[], details: SchemaDetails) {
    this.fields = fields;
    this.flags = details.flags;
    this.size = details.size;
    this.sortedFields = details.sortedFields;
    this.optionalFields = details.optionalFields;
    this.booleanFields = details.booleanFields;
    this.bitSet = details.bitSet;
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

export function schema(...fields: Fields[]): Schema {
  const normalizedFields = normalizeFields(fields);
  return new Schema(normalizedFields, analyzeFields(normalizedFields));
}

function _normalizeFields(result: Field[], fields: Fields[]): void {
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

function normalizeFields(fields: Fields[]): Field<any>[] {
  const result: Field<any>[] = [];
  _normalizeFields(result, fields);
  return result;
}

function analyzeFields(fields: Field[]): SchemaDetails {
  const sortedFields = fields.slice().sort(sortFields);
  const optionalFields: Field<any>[] = [];
  const booleanFields: Field<any>[] = [];
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

  return { flags, size, sortedFields, optionalFields, booleanFields, bitSet };
}

function bitSetIndex(fields: Field<any>[], field: Field<any>, offset = 0): { index: number, position: number } {
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

/**
 * Field Priorities:
 *  - required fields
 *  - optional fields
 *  - dynamic size fields
 *
 * Field types:
 *  - numbers
 *  - strings
 *  - bytearray
 *  - refs
 *  - arrays
 */
function sortFields(a: Field<any>, b: Field<any>): number {
  if (a.type.hasDynamicSize()) {
    if (!b.type.hasDynamicSize()) {
      return 1;
    }
  }
  if (a.isOptional()) {
    if (!b.isOptional()) {
      return 1;
    }
  }
  if (a.type.isArray()) {
    if (!b.type.isArray()) {
      return 1;
    }
    return 0;
  }
  if (a.type.isRef()) {
    if (!b.type.isRef()) {
      if (b.type.isArray()) {
        return -1;
      }
      return 1;
    }
    return 0;
  }
  if (a.type.isByteArray()) {
    if (!b.type.isByteArray()) {
      if (b.type.isArray() || b.type.isRef()) {
        return -1;
      }
      return 1;
    }
    return 0;
  }
  if (a.type.isString()) {
    if (!b.type.isString()) {
      if (b.type.isArray() || b.type.isRef() || b.type.isByteArray()) {
        return -1;
      }
      return 1;
    }
    return 0;
  }
  if (a.type.isNumber()) {
    if (!b.type.isNumber()) {
      if (b.type.isArray() || b.type.isRef() || b.type.isByteArray() || b.type.isString()) {
        return -1;
      }
      return 1;
    }

    if (a.type.isVariadicInteger()) {
      if (!b.type.isVariadicInteger()) {
        return 1;
      }
      if (a.type.isSignedInteger()) {
        if (!b.type.isSignedInteger()) {
          return 1;
        }
      }
      return 0;
    } else if (a.type.isFloat()) {
      if (!b.type.isFloat()) {
        if (b.type.isVariadicInteger()) {
          return -1;
        }
        return 1;
      }
      return b.type.size - a.type.size;
    } else { // fixed integer
      if (a.type.isSignedInteger()) {
        if (!b.type.isSignedInteger()) {
          return 1;
        }
      }
      return b.type.size - a.type.size;
    }
  }
  return 0;
}

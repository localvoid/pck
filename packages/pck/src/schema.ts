import { Field } from "./field";

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

export class BitField {
  readonly field: Field<any>;
  readonly type: BitFieldType;
  readonly index: number;
  readonly offset: number;

  constructor(field: Field<any>, type: BitFieldType, index: number) {
    this.field = field;
    this.type = type;
    this.index = index;
    this.offset = Math.floor(index / 8);
  }

  isOptional(): boolean {
    return this.type === BitFieldType.Optional;
  }

  isBoolean(): boolean {
    return this.type === BitFieldType.Boolean;
  }
}

export interface SchemaDetails {
  readonly flags: SchemaFlags;
  /**
   * Size of a fixed part of a structure (doesn't include bitset size).
   */
  readonly size: number;
  readonly sortedFields: Field<any>[];
  readonly sortedFixedFields: Field<any>[];
  readonly sortedDynamicFields: Field<any>[];
  readonly optionalFields: Field<any>[];
  readonly booleanFields: Field<any>[];
  readonly bitSet: BitField[];
}

export class Schema {
  readonly fields: Field<any>[];
  readonly flags: SchemaFlags;
  readonly fixedFieldsSize: number;
  readonly sortedFields: Field[];
  readonly sortedFixedFields: Field[];
  readonly sortedDynamicFields: Field[];
  readonly optionalFields: Field[];
  readonly booleanFields: Field[];
  readonly bitSet: BitField[];

  constructor(fields: Field<any>[], details: SchemaDetails) {
    this.fields = fields;
    this.flags = details.flags;
    this.fixedFieldsSize = details.size;
    this.sortedFields = details.sortedFields;
    this.sortedFixedFields = details.sortedFixedFields;
    this.sortedDynamicFields = details.sortedDynamicFields;
    this.optionalFields = details.optionalFields;
    this.booleanFields = details.booleanFields;
    this.bitSet = details.bitSet;
  }

  hasBitSet(): boolean {
    return (this.flags & SchemaFlags.BitSet) !== 0;
  }

  getBifField(field: Field<any>, boolean = true): BitField {
    for (const bf of this.bitSet) {
      if (bf.field === field && ((boolean && bf.isBoolean()) || bf.isOptional())) {
        return bf;
      }
    }
    if (boolean) {
      throw new Error(`Unable to find boolean BitField for a field ${field}`);
    }
    throw new Error(`Unable to find optional BitField for a field ${field}`);
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

  getBitSetSize(): number {
    return Math.ceil(this.bitSet.length / 8);
  }

  getFixedSize(): number {
    return this.getBitSetSize() + this.fixedFieldsSize;
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
  const sortedFixedFields = [];
  const sortedDynamicFields = [];
  const optionalFields: Field<any>[] = [];
  const booleanFields: Field<any>[] = [];
  const bitSet: BitField[] = [];
  let flags: SchemaFlags = 0;
  let size = 0;

  for (const field of sortedFields) {
    if (field.isDynamic()) {
      if (field.isOptional()) {
        flags |= SchemaFlags.OptionalFields;
        optionalFields.push(field);
      }
      sortedDynamicFields.push(field);
      flags |= SchemaFlags.DynamicSize;
    } else {
      sortedFixedFields.push(field);
      size += field.type.size;
    }
    if (field.type.isBoolean()) {
      flags |= SchemaFlags.BooleanFields;
      booleanFields.push(field);
    } else {
      flags |= SchemaFlags.RegularFields;
    }
  }

  let i = 0;
  if (optionalFields.length > 0) {
    for (const field of optionalFields) {
      bitSet.push(new BitField(field, BitFieldType.Optional, i++));
    }
  }

  if (booleanFields.length > 0) {
    for (const field of booleanFields) {
      bitSet.push(new BitField(field, BitFieldType.Boolean, i++));
    }
  }

  if (bitSet.length > 0) {
    flags |= SchemaFlags.BitSet;
  }

  return {
    flags,
    size,
    sortedFields,
    sortedFixedFields,
    sortedDynamicFields,
    optionalFields,
    booleanFields,
    bitSet,
  };
}

/**
 * Field Priorities:
 *  - fixed fields
 *  - dynamic fields (optional | dynamic size type)
 *  - dynamic size types
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

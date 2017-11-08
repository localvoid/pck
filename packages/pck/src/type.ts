export type TypeId =
  | "bool"
  | "int"
  | "float"
  | "varint"
  | "bytes"
  | "string"
  | "array"
  | "map"
  | "schema"
  | "union";

export const enum TypeFlags {
  Nullable = 1,
}

export type Type =
  | BoolType
  | IntType
  | FloatType
  | VarIntType
  | BytesType
  | StringType
  | ArrayType
  | MapType
  | SchemaType
  | UnionType;

export abstract class BaseType {
  readonly id: TypeId;
  readonly flags: TypeFlags;

  constructor(id: TypeId, flags: TypeFlags) {
    this.id = id;
    this.flags = flags;
  }

  toString(): string {
    return `<Type: ${this.id}>`;
  }

  isCompatible(other: Type): boolean {
    return this.id === other.id && this.flags === other.flags;
  }

  abstract withFlags(flags: TypeFlags): Type;
}

export class BoolType extends BaseType {
  readonly id: "bool";

  constructor(flags: TypeFlags) {
    super("bool", flags);
  }

  withFlags(flags: TypeFlags): BoolType {
    return new BoolType(flags);
  }
}

export class IntType extends BaseType {
  readonly id: "int";
  readonly size: 1 | 2 | 4 | 8;
  readonly signed: boolean;

  constructor(flags: TypeFlags, size: 1 | 2 | 4 | 8, signed: boolean) {
    super("int", flags);
    this.size = size;
    this.signed = signed;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "int" &&
      this.flags === other.flags &&
      this.size === other.size &&
      this.signed === other.signed
    );
  }

  withFlags(flags: TypeFlags): IntType {
    return new IntType(flags, this.size, this.signed);
  }

  toString(): string {
    return `<Type: ${this.signed ? "u" : ""}int[${this.size * 8}]>`;
  }
}

export class FloatType extends BaseType {
  readonly id: "float";
  readonly size: 4 | 8;

  constructor(flags: TypeFlags, size: 4 | 8) {
    super("float", flags);
    this.size = size;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "float" &&
      this.flags === other.flags &&
      this.size === other.size
    );
  }

  withFlags(flags: TypeFlags): FloatType {
    return new FloatType(flags, this.size);
  }

  toString(): string {
    return `<Type: float[${this.size * 8}]>`;
  }
}

export class VarIntType extends BaseType {
  readonly id: "varint";
  readonly signed: boolean;

  constructor(flags: TypeFlags, signed: boolean) {
    super("varint", flags);
    this.signed = signed;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "varint" &&
      this.flags === other.flags &&
      this.signed === other.signed
    );
  }

  withFlags(flags: TypeFlags): VarIntType {
    return new VarIntType(flags, this.signed);
  }

  toString(): string {
    return `<Type: var${this.signed ? "u" : ""}int>`;
  }
}

export class BytesType extends BaseType {
  readonly id: "bytes";
  readonly length: number;

  constructor(flags: TypeFlags, length = 0) {
    super("bytes", flags);
    this.length = length;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "bytes" &&
      this.flags === other.flags &&
      this.length === other.length
    );
  }

  withFlags(flags: TypeFlags): BytesType {
    return new BytesType(flags, this.length);
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: bytes[${this.length}]>`;
    }
    return `<Type: bytes>`;
  }
}

export class StringType extends BaseType {
  readonly id: "string";
  readonly encoding: "ascii" | "utf8";
  readonly length: number;

  constructor(flags: TypeFlags, encoding: "ascii" | "utf8", length: number) {
    super("string", flags);
    this.encoding = encoding;
    this.length = length;
  }

  withFlags(flags: TypeFlags): StringType {
    return new StringType(flags, this.encoding, this.length);
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: string<${this.encoding}>[${this.length}]>`;
    }
    return `<Type: string<${this.encoding}>>`;
  }
}

export class ArrayType extends BaseType {
  readonly id: "array";
  readonly valueType: Type;
  readonly length: number;

  constructor(flags: TypeFlags, valueType: Type, length = 0) {
    super("array", flags);
    this.valueType = valueType;
    this.length = length;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "array" &&
      this.flags === other.flags &&
      this.length === other.length &&
      this.valueType.isCompatible(other.valueType)
    );
  }

  withFlags(flags: TypeFlags): ArrayType {
    return new ArrayType(flags, this.valueType, this.length);
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: array[${this.length}]<${this.valueType.toString()}>>`;
    }
    return `<Type: array<${this.valueType.toString()}>>`;
  }
}

export class MapType extends BaseType {
  readonly id: "map";
  readonly keyType: Type;
  readonly valueType: Type;

  constructor(flags: TypeFlags, keyType: Type, valueType: Type) {
    super("map", flags);
    this.keyType = keyType;
    this.valueType = valueType;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "map" &&
      this.flags === other.flags &&
      this.keyType.isCompatible(this.valueType) &&
      this.valueType.isCompatible(other.valueType)
    );
  }

  withFlags(flags: TypeFlags): MapType {
    return new MapType(flags, this.keyType, this.valueType);
  }

  toString(): string {
    return `<Type: map<${this.keyType.toString()}, ${this.valueType.toString()}>>`;
  }
}

export class SchemaType extends BaseType {
  readonly id: "schema";
  readonly schemaId: string;

  constructor(flags: TypeFlags, schemaId: string) {
    super("schema", flags);
    this.schemaId = schemaId;
  }

  isCompatible(other: Type): boolean {
    return (
      other.id === "schema" &&
      this.flags === other.flags &&
      this.schemaId === other.schemaId
    );
  }

  withFlags(flags: TypeFlags): SchemaType {
    return new SchemaType(flags, this.schemaId);
  }

  toString(): string {
    return `<Type: schema<${this.schemaId}>`;
  }
}

export class UnionType extends BaseType {
  readonly id: "union";
  readonly schemaIds: string[];

  constructor(flags: TypeFlags, symbols: string[]) {
    super("union", flags);
    this.schemaIds = symbols;
  }

  isCompatible(other: Type): boolean {
    if (this.flags !== other.flags) {
      return false;
    }
    if (other.id !== "union") {
      return false;
    }
    if (this.schemaIds !== other.schemaIds) {
      if (this.schemaIds.length !== other.schemaIds.length) {
        return false;
      }

      for (let i = 0; i < this.schemaIds.length; i++) {
        if (this.schemaIds[i] !== other.schemaIds[i]) {
          return false;
        }
      }
    }

    return true;
  }

  withFlags(flags: TypeFlags): UnionType {
    return new UnionType(flags, this.schemaIds);
  }

  toString(): string {
    return `<Type: union<${this.schemaIds.join("|")}>`;
  }
}

export function isNumberType(type: Type): boolean {
  switch (type.id) {
    case "int":
    case "float":
    case "varint":
      return true;
  }
  return false;
}

const _BOOL = new BoolType(0);
const _I8 = new IntType(0, 1, true);
const _U8 = new IntType(0, 1, false);
const _I16 = new IntType(0, 2, true);
const _U16 = new IntType(0, 2, false);
const _I32 = new IntType(0, 4, true);
const _U32 = new IntType(0, 4, false);
const _I64 = new IntType(0, 8, true);
const _U64 = new IntType(0, 8, false);
const _F32 = new FloatType(0, 4);
const _F64 = new FloatType(0, 8);
const _VARINT = new VarIntType(0, true);
const _VARUINT = new VarIntType(0, false);
const _BYTES = new BytesType(0);
const _UTF8 = new StringType(0, "utf8", 0);
const _ASCII = new StringType(0, "ascii", 0);

export function BOOL(): BoolType {
  return _BOOL;
}

export function INT8(): IntType {
  return _I8;
}

export function UINT8(): IntType {
  return _U8;
}

export function INT16(): IntType {
  return _I16;
}

export function UINT16(): IntType {
  return _U16;
}

export function INT32(): IntType {
  return _I32;
}

export function UINT32(): IntType {
  return _U32;
}

export function INT64(): IntType {
  return _I64;
}

export function UINT64(): IntType {
  return _U64;
}

export function FLOAT32(): FloatType {
  return _F32;
}

export function FLOAT64(): FloatType {
  return _F64;
}

export function VARINT(): VarIntType {
  return _VARINT;
}

export function VARUINT(): VarIntType {
  return _VARUINT;
}

export function BYTES(length: number = 0): BytesType {
  if (length === 0) {
    return _BYTES;
  }
  return new BytesType(0, length);
}

export function UTF8(): StringType {
  return _UTF8;
}

export function ASCII(length: number = 0): StringType {
  if (length === 0) {
    return _ASCII;
  }
  return new StringType(0, "ascii", length);
}

export function ARRAY(valueType: Type, length = 0): ArrayType {
  return new ArrayType(0, valueType, length);
}

export function MAP(keyType: Type, valueType: Type): MapType {
  return new MapType(0, keyType, valueType);
}

export function SCHEMA(schemaId: string): SchemaType {
  return new SchemaType(0, schemaId);
}

export function UNION(schemaIds: string[]): UnionType {
  return new UnionType(0, schemaIds);
}

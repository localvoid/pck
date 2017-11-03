export type TypeId =
  | "bool"
  | "int"
  | "float"
  | "varint"
  | "bytes"
  | "utf8"
  | "ascii"
  | "array"
  | "map"
  | "ref"
  | "union";

export type Type =
  | BoolType
  | IntType
  | FloatType
  | VarIntType
  | BytesType
  | Utf8Type
  | AsciiType
  | ArrayType
  | MapType
  | RefType
  | UnionType;

export interface IType {
  readonly id: TypeId;
}

export class BoolType implements IType {
  readonly id: "bool";

  constructor() {
    this.id = "bool";
  }

  toString(): string {
    return `<Type: bool>`;
  }
}

export class IntType implements IType {
  readonly id: "int";
  readonly size: 1 | 2 | 4 | 8;
  readonly signed: boolean;

  constructor(size: 1 | 2 | 4 | 8, signed: boolean) {
    this.id = "int";
    this.size = size;
    this.signed = signed;
  }

  toString(): string {
    return `<Type: ${this.signed ? "u" : ""}int[${this.size * 8}]>`;
  }
}

export class FloatType implements IType {
  readonly id: "float";
  readonly size: 4 | 8;

  constructor(size: 4 | 8) {
    this.id = "float";
    this.size = size;
  }

  toString(): string {
    return `<Type: float[${this.size * 8}]>`;
  }
}

export class VarIntType implements IType {
  readonly id: "varint";
  readonly signed: boolean;

  constructor(signed: boolean) {
    this.id = "varint";
    this.signed = signed;
  }

  toString(): string {
    return `<Type: var${this.signed ? "u" : ""}int>`;
  }
}

export class BytesType implements IType {
  readonly id: "bytes";
  readonly length: number;

  constructor(length = 0) {
    this.id = "bytes";
    this.length = length;
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: bytes[${this.length}]>`;
    }
    return `<Type: bytes>`;
  }
}

export class Utf8Type implements IType {
  readonly id: "utf8";

  constructor() {
    this.id = "utf8";
  }

  toString(): string {
    return `<Type: utf8>`;
  }
}

export class AsciiType implements IType {
  readonly id: "ascii";
  readonly length: number;

  constructor(length = 0) {
    this.id = "ascii";
    this.length = length;
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: ascii[${this.length}]>`;
    }
    return `<Type: ascii>`;
  }
}

export class ArrayType implements IType {
  readonly id: "array";
  readonly valueType: Type;
  readonly length: number;

  constructor(valueType: Type, length = 0) {
    this.id = "array";
    this.valueType = valueType;
    this.length = length;
  }

  toString(): string {
    if (this.length > 0) {
      return `<Type: array[${this.length}]<${this.valueType.toString()}>>`;
    }
    return `<Type: array<${this.valueType.toString()}>>`;
  }
}

export class MapType implements IType {
  readonly id: "map";
  readonly keyType: Type;
  readonly valueType: Type;

  constructor(keyType: Type, valueType: Type) {
    this.id = "map";
    this.keyType = keyType;
    this.valueType = valueType;
  }

  toString(): string {
    return `<Type: map<${this.keyType.toString()}, ${this.valueType.toString()}>>`;
  }
}

export class RefType implements IType {
  readonly id: "ref";
  readonly symbol: symbol;

  constructor(symbol: symbol) {
    this.id = "ref";
    this.symbol = symbol;
  }

  toString(): string {
    return `<Type: ref<${this.symbol.toString()}>`;
  }
}

export class UnionType implements IType {
  readonly id: "union";
  readonly symbols: symbol[];

  constructor(symbols: symbol[]) {
    this.id = "union";
    this.symbols = symbols;
  }

  toString(): string {
    return `<Type: union<${this.symbols.map((s) => s.toString()).join("|")}>`;
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

export function isStringType(type: Type): boolean {
  switch (type.id) {
    case "utf8":
    case "ascii":
      return true;
  }
  return false;
}

const _BOOL = new BoolType();
const _I8 = new IntType(1, true);
const _U8 = new IntType(1, false);
const _I16 = new IntType(2, true);
const _U16 = new IntType(2, false);
const _I32 = new IntType(4, true);
const _U32 = new IntType(4, false);
const _I64 = new IntType(8, true);
const _U64 = new IntType(8, false);
const _F32 = new FloatType(4);
const _F64 = new FloatType(8);
const _VARINT = new VarIntType(true);
const _VARUINT = new VarIntType(false);
const _BYTES = new BytesType();
const _UTF8 = new Utf8Type();
const _ASCII = new AsciiType();

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
  return new BytesType(length);
}

export function UTF8(): Utf8Type {
  return _UTF8;
}

export function ASCII(length: number = 0): AsciiType {
  if (length === 0) {
    return _ASCII;
  }
  return new AsciiType(length);
}

export function ARRAY(valueType: Type, length = 0): ArrayType {
  return new ArrayType(valueType, length);
}

export function MAP(keyType: Type, valueType: Type): MapType {
  return new MapType(keyType, valueType);
}

export function REF(symbol: symbol): RefType {
  return new RefType(symbol);
}

export function UNION(symbols: symbol[]): UnionType {
  return new UnionType(symbols);
}

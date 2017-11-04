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
  | "schema"
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
  | SchemaType
  | RefType
  | UnionType;

export interface IType<T = any> {
  readonly id: TypeId;
  readonly meta?: T;
}

export class BoolType<T = any> implements IType<T> {
  readonly id: "bool";
  readonly meta?: T;

  constructor() {
    this.id = "bool";
  }

  toString(): string {
    return `<Type: bool>`;
  }
}

export class IntType<T = any> implements IType<T> {
  readonly id: "int";
  readonly size: 1 | 2 | 4 | 8;
  readonly signed: boolean;
  readonly meta?: T;

  constructor(size: 1 | 2 | 4 | 8, signed: boolean) {
    this.id = "int";
    this.size = size;
    this.signed = signed;
  }

  toString(): string {
    return `<Type: ${this.signed ? "u" : ""}int[${this.size * 8}]>`;
  }
}

export class FloatType<T = any> implements IType<T> {
  readonly id: "float";
  readonly size: 4 | 8;
  readonly meta?: T;

  constructor(size: 4 | 8) {
    this.id = "float";
    this.size = size;
  }

  toString(): string {
    return `<Type: float[${this.size * 8}]>`;
  }
}

export class VarIntType<T = any> implements IType<T> {
  readonly id: "varint";
  readonly signed: boolean;
  readonly meta?: T;

  constructor(signed: boolean) {
    this.id = "varint";
    this.signed = signed;
  }

  toString(): string {
    return `<Type: var${this.signed ? "u" : ""}int>`;
  }
}

export class BytesType<T = any> implements IType<T> {
  readonly id: "bytes";
  readonly length: number;
  readonly meta?: T;

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

export class Utf8Type<T = any> implements IType<T> {
  readonly id: "utf8";
  readonly meta?: T;

  constructor() {
    this.id = "utf8";
  }

  toString(): string {
    return `<Type: utf8>`;
  }
}

export class AsciiType<T = any> implements IType<T> {
  readonly id: "ascii";
  readonly length: number;
  readonly meta?: T;

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

export class ArrayType<T = any> implements IType<T> {
  readonly id: "array";
  readonly valueType: Type;
  readonly length: number;
  readonly meta?: T;

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

export class MapType<T = any> implements IType<T> {
  readonly id: "map";
  readonly keyType: Type;
  readonly valueType: Type;
  readonly meta?: T;

  constructor(keyType: Type, valueType: Type) {
    this.id = "map";
    this.keyType = keyType;
    this.valueType = valueType;
  }

  toString(): string {
    return `<Type: map<${this.keyType.toString()}, ${this.valueType.toString()}>>`;
  }
}

export class SchemaType<T = any> implements IType<T> {
  readonly id: "schema";
  readonly symbol: symbol;
  readonly meta?: T;

  constructor(symbol: symbol) {
    this.id = "schema";
    this.symbol = symbol;
  }

  toString(): string {
    return `<Type: schema<${this.symbol.toString()}>`;
  }
}

export class RefType<T = any> implements IType<T> {
  readonly id: "ref";
  readonly symbol: symbol;
  readonly meta?: T;

  constructor(symbol: symbol) {
    this.id = "ref";
    this.symbol = symbol;
  }

  toString(): string {
    return `<Type: ref<${this.symbol.toString()}>`;
  }
}

export class UnionType<T = any> implements IType<T> {
  readonly id: "union";
  readonly symbols: symbol[];
  readonly meta?: T;

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

export function SCHEMA(symbol: symbol): SchemaType {
  return new SchemaType(symbol);
}

export function REF(symbol: symbol): RefType {
  return new RefType(symbol);
}

export function UNION(symbols: symbol[]): UnionType {
  return new UnionType(symbols);
}

export function checkTypeCompatibility(a: Type, b: Type): "type" | "size" | "length" | "symbol" | null {
  if (a.id !== b.id) {
    switch (a.id) {
      case "schema":
      case "ref":
        if (b.id === "schema" || b.id === "ref") {
          break;
        }
      default:
        return "type";
    }
  }

  switch (a.id) {
    case "int":
    case "float":
      if (a.size !== (b as IntType | FloatType).size) {
        return "size";
      }
      break;
    case "ascii":
    case "bytes":
      if (a.length !== (b as AsciiType | BytesType).length) {
        return "length";
      }
      break;
    case "array":
      return checkTypeCompatibility(a.valueType, (b as ArrayType).valueType);
    case "map":
      const keyError = checkTypeCompatibility(a.keyType, (b as MapType).keyType);
      if (keyError !== null) {
        return keyError;
      }
      return checkTypeCompatibility(a.valueType, (b as MapType).valueType);
    case "schema":
    case "ref":
      if (a.symbol !== (b as (SchemaType | RefType)).symbol) {
        return "symbol";
      }
      break;
    case "union":
      const bSymbols = (b as UnionType).symbols;
      if (a.symbols.length !== bSymbols.length) {
        return "symbol";
      }
      for (const s of a.symbols) {
        if (bSymbols.indexOf(s) === -1) {
          return "symbol";
        }
      }
  }

  return null;
}

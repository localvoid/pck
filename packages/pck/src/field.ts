import {
  Type, TypeFlags,
  BoolType, IntType, FloatType, VarIntType, BytesType, Utf8Type, AsciiType, ArrayType, MapType, SchemaType, UnionType,
  BOOL, INT8, UINT8, INT16, UINT16, INT32, UINT32, INT64, UINT64, FLOAT32, FLOAT64, VARINT, VARUINT,
  BYTES, UTF8, ASCII, ARRAY, MAP, SCHEMA, UNION,
} from "./type";

export class InvalidFieldDeclarationError extends Error { }

export const enum FieldFlags {
  OmitNull = 1,
  OmitEmpty = 1 << 1,
  OmitZero = 1 << 2,

  Optional = OmitNull | OmitEmpty | OmitZero,
}

export class Field<T extends Type = Type> {
  readonly type: T;
  readonly flags: FieldFlags;
  readonly name: string;

  constructor(type: T, name: string, flags: FieldFlags = 0) {
    this.type = type;
    this.flags = flags;
    this.name = name;
  }

  toString(): string {
    return `<FieldDeclaration: ${this.name} = ${this.type.toString()}>`;
  }

  isCompatible(other: Field<T>): boolean {
    return (
      this.type.isCompatible(other.type) &&
      (
        (this.flags & (FieldFlags.OmitNull | FieldFlags.OmitEmpty | FieldFlags.OmitZero)) ===
        (other.flags & (FieldFlags.OmitNull | FieldFlags.OmitEmpty | FieldFlags.OmitZero))
      )
    );
  }

  isOptional(): boolean {
    return ((this.flags & FieldFlags.Optional) !== 0);
  }
}

export function omitNull<T extends Type>(field: Field<T>): Field<T> {
  switch (field.type.id) {
    case "array":
    case "bytes":
    case "schema":
      return new Field<T>(field.type.withFlags(TypeFlags.Nullable) as T, field.name, field.flags | FieldFlags.OmitNull);
  }
  throw new InvalidFieldDeclarationError(
    `Unable to create omitNull field. Invalid field type: ${field.type.toString()}.`,
  );
}

export function omitEmpty<T extends Type>(field: Field<T>): Field<T> {
  switch (field.type.id) {
    case "utf8":
    case "ascii":
    case "array":
    case "bytes":
      return new Field(field.type, field.name, field.flags | FieldFlags.OmitEmpty);
  }
  throw new InvalidFieldDeclarationError(
    `Unable to create omitEmpty field. Invalid field type: ${field.type.toString()}.`,
  );
}

export function omitZero<T extends Type>(field: Field<T>): Field<T> {
  switch (field.type.id) {
    case "int":
    case "float":
    case "varint":
      return new Field(field.type, field.name, field.flags | FieldFlags.OmitEmpty);
  }
  throw new InvalidFieldDeclarationError(
    `Unable to create omitZero field. Invalid field type: ${field.type.toString()}.`,
  );
}

export function bool(name: string): Field<BoolType> {
  return new Field(BOOL(), name);
}

export function int8(name: string): Field<IntType> {
  return new Field(INT8(), name);
}

export function uint8(name: string): Field<IntType> {
  return new Field(UINT8(), name);
}

export function int16(name: string): Field<IntType> {
  return new Field(INT16(), name);
}

export function uint16(name: string): Field<IntType> {
  return new Field(UINT16(), name);
}

export function int32(name: string): Field<IntType> {
  return new Field(INT32(), name);
}

export function uint32(name: string): Field<IntType> {
  return new Field(UINT32(), name);
}

export function int64(name: string): Field<IntType> {
  return new Field(INT64(), name);
}

export function uint64(name: string): Field<IntType> {
  return new Field(UINT64(), name);
}

export function float32(name: string): Field<FloatType> {
  return new Field(FLOAT32(), name);
}

export function float64(name: string): Field<FloatType> {
  return new Field(FLOAT64(), name);
}

export function varint(name: string): Field<VarIntType> {
  return new Field(VARINT(), name);
}

export function varuint(name: string): Field<VarIntType> {
  return new Field(VARUINT(), name);
}

export function bytes(name: string, size = 0): Field<BytesType> {
  return new Field(BYTES(size), name);
}

export function utf8(name: string): Field<Utf8Type> {
  return new Field(UTF8(), name);
}

export function ascii(name: string, size?: number): Field<AsciiType> {
  return new Field(ASCII(size), name);
}

export function array(name: string, valueType: Type, length = 0): Field<ArrayType> {
  return new Field(ARRAY(valueType, length), name);
}

export function map(name: string, keyType: Type, valueType: Type): Field<MapType> {
  return new Field(MAP(keyType, valueType), name);
}

export function schema(name: string, symbol: symbol): Field<SchemaType> {
  return new Field(SCHEMA(symbol), name);
}

export function union(name: string, symbols: symbol[]): Field<UnionType> {
  return new Field(UNION(symbols), name);
}

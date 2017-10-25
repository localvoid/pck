import { Schema } from "./schema";

export enum TypeId {
  Bool = 0,
  Int = 1,
  Uint = 2,
  Float = 3,
  VarInt = 4,
  VarUint = 5,
  Bytes = 6,
  UTF8 = 7,
  ASCII = 8,
  Ref = 9,
  Array = 10,
  Map = 11,
  Union = 12,
}

export const enum TypeFlags {
  DynamicSize = 1,
}

export class Type<T = null> {
  readonly id: TypeId;
  readonly size: number;
  readonly flags: TypeFlags;
  readonly props: T;

  constructor(id: TypeId, size: number, flags: TypeFlags, props: T) {
    this.id = id;
    this.size = size;
    this.flags = flags;
    this.props = props;
  }

  toString(): string {
    if (this.size > 0) {
      return `<Type: ${TypeId[this.id]}[${this.size}]>`;
    }
    return `<Type: ${TypeId[this.id]}>`;
  }

  hasDynamicSize(): boolean {
    return ((this.flags & TypeFlags.DynamicSize) !== 0);
  }

  isBoolean(): boolean {
    return this.id === TypeId.Bool;
  }

  isFloat(): boolean {
    return this.id === TypeId.Float;
  }

  isFixedInteger(): boolean {
    return (
      this.id === TypeId.Int ||
      this.id === TypeId.Uint
    );
  }

  isVariadicInteger(): boolean {
    return (
      this.id === TypeId.VarInt ||
      this.id === TypeId.VarUint
    );
  }

  isInteger(): boolean {
    return (
      this.isFixedInteger() ||
      this.isVariadicInteger()
    );
  }

  isNumber(): boolean {
    return this.isInteger() || this.isFloat();
  }

  isSignedInteger(): boolean {
    return this.id === TypeId.Int || this.id === TypeId.VarInt;
  }

  isUnsignedInteger(): boolean {
    return this.id === TypeId.Uint || this.id === TypeId.VarUint;
  }

  isUtf8String(): boolean {
    return this.id === TypeId.UTF8;
  }

  isAsciiString(): boolean {
    return this.id === TypeId.ASCII;
  }

  isString(): boolean {
    return this.id === TypeId.UTF8 || this.id === TypeId.ASCII;
  }

  isByteArray(): boolean {
    return this.id === TypeId.Bool;
  }

  isArray(): this is Type<ArrayTypeProps> {
    return this.id === TypeId.Array;
  }

  isRef(): this is Type<Schema> {
    return this.id === TypeId.Ref;
  }

  isUnion(): this is Type<Type[]> {
    return this.id === TypeId.Union;
  }
}

export interface ArrayTypeProps {
  readonly length: number;
  readonly type: Type<any>;
}

export interface MapTypeProps {
  readonly key: Type<any>;
  readonly value: Type<any>;
}

const _REFS = new WeakMap<Schema, Type<Schema>>();

export function REF(schema: Schema): Type<Schema> {
  let r = _REFS.get(schema);
  if (r === void 0) {
    let size = schema.size;
    let flags = 0;
    if (schema.hasDynamicSize()) {
      flags |= TypeFlags.DynamicSize;
      size = 0;
    }
    _REFS.set(schema, r = new Type(TypeId.Ref, size, flags, schema));
  }
  return r;
}

export function ARRAY(type: Type<any>, length = 0): Type<ArrayTypeProps> {
  let size = 0;
  let flags = 0;

  if (length === 0) {
    flags |= TypeFlags.DynamicSize;
  } else {
    if (type.hasDynamicSize()) {
      flags |= TypeFlags.DynamicSize;
    }
    size *= length;
  }

  return new Type<ArrayTypeProps>(TypeId.Array, size, flags, { length, type });
}

export function MAP(key: Type<any>, value: Type<any>): Type<MapTypeProps> {
  return new Type<MapTypeProps>(TypeId.Map, 0, TypeFlags.DynamicSize, { key, value });
}

export function UNION(types: Type<any>[]): Type<Type<any>[]> {
  for (const type of types) {
    if (!type.isRef()) {
      throw new Error("UNION type doesn't work with basic types");
    }
  }
  return new Type<Type<any>[]>(TypeId.Union, 0, TypeFlags.DynamicSize, types);
}

function t(id: TypeId, size: number = 0, flags: TypeFlags = 0): Type {
  return new Type(id, size, flags, null);
}

export const BOOL = t(TypeId.Bool, 0);
export const I8 = t(TypeId.Int, 1);
export const U8 = t(TypeId.Uint, 1);
export const I16 = t(TypeId.Int, 2);
export const U16 = t(TypeId.Uint, 2);
export const I32 = t(TypeId.Int, 4);
export const U32 = t(TypeId.Uint, 4);
export const F32 = t(TypeId.Float, 4);
export const F64 = t(TypeId.Float, 8);
export const IVAR = t(TypeId.VarInt, 0, TypeFlags.DynamicSize);
export const UVAR = t(TypeId.VarUint, 0, TypeFlags.DynamicSize);
export const UTF8 = t(TypeId.UTF8, 0, TypeFlags.DynamicSize);

const _BYTES = t(TypeId.Bytes, 0, TypeFlags.DynamicSize);
const _ASCII = t(TypeId.ASCII, 0, TypeFlags.DynamicSize);
const _DYNAMIC_BYTES = new Map<number, Type>();
const _DYNAMIC_ASCII = new Map<number, Type>();

export function BYTES(size: number = 0): Type {
  if (size === 0) {
    return _BYTES;
  }
  let r = _DYNAMIC_BYTES.get(size);
  if (r === void 0) {
    _DYNAMIC_BYTES.set(size, r = t(TypeId.Bytes, size));
  }
  return r;
}

export function ASCII(size: number = 0): Type {
  if (size === 0) {
    return _ASCII;
  }
  let r = _DYNAMIC_ASCII.get(size);
  if (r === void 0) {
    _DYNAMIC_ASCII.set(size, r = t(TypeId.ASCII, size));
  }
  return r;
}

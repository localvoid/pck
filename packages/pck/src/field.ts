import {
  Type, ArrayTypeProps, ARRAY, REF, BOOL, I8, U8, I16, U16, I32, U32, F32, F64, IVAR, UVAR, BYTES, UTF8, ASCII,
} from "./type";
import { Schema } from "./schema";

export const enum FieldFlags {
  Optional = 1,
  OmitEmpty = 1 << 1,
}

export class Field<T = null> {
  readonly type: Type<T>;
  readonly flags: FieldFlags;
  readonly name: string;

  constructor(type: Type<T>, name: string, flags: FieldFlags = 0) {
    this.type = type;
    this.flags = flags;
    this.name = name;
  }

  isOptional(): boolean {
    return (this.flags & FieldFlags.Optional) !== 0;
  }

  isOmitEmpty(): boolean {
    return (this.flags & FieldFlags.OmitEmpty) !== 0;
  }
}

export function optional<T>(field: Field<T>): Field<T> {
  return new Field<T>(field.type, field.name, field.flags | FieldFlags.Optional);
}

export function omitEmpty<T>(field: Field<T>): Field<T> {
  return new Field<T>(field.type, field.name, field.flags | FieldFlags.OmitEmpty);
}

export function ref(name: string, schema: Schema): Field<Schema> {
  return new Field<Schema>(REF(schema), name);
}

export function array(name: string, types: Type<any> | Type<any>[], length?: number): Field<ArrayTypeProps> {
  return new Field<ArrayTypeProps>(ARRAY(types, length), name);
}

export function bool(name: string): Field {
  return new Field(BOOL, name);
}

export function i8(name: string): Field {
  return new Field(I8, name);
}

export function u8(name: string): Field {
  return new Field(U8, name);
}

export function i16(name: string): Field {
  return new Field(I16, name);
}

export function u16(name: string): Field {
  return new Field(U16, name);
}

export function i32(name: string): Field {
  return new Field(I32, name);
}

export function u32(name: string): Field {
  return new Field(U32, name);
}

export function f32(name: string): Field {
  return new Field(F32, name);
}

export function f64(name: string): Field {
  return new Field(F64, name);
}

export function ivar(name: string): Field {
  return new Field(IVAR, name);
}

export function uvar(name: string): Field {
  return new Field(UVAR, name);
}

export function bytes(name: string, size?: number): Field {
  return new Field(BYTES(size), name);
}

export function utf8(name: string): Field {
  return new Field(UTF8, name);
}

export function ascii(name: string, size?: number): Field {
  return new Field(ASCII(size), name);
}

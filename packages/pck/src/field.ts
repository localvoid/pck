import {
  TypeId, Type, ArrayTypeProps, MapTypeProps,
  ARRAY, MAP, REF, UNION, BOOL, I8, U8, I16, U16, I32, U32, F32, F64, IVAR, UVAR, BYTES, UTF8, ASCII,
} from "./type";
import { Schema } from "./schema";

export class InvalidFieldError extends Error { }

export const enum FieldFlags {
  Optional = 1,
  OmitNull = 1 << 1,
  OmitEmpty = 1 << 2,
  OmitZero = 1 << 3,
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

  isOmitNull(): boolean {
    return (this.flags & FieldFlags.OmitNull) !== 0;
  }

  isOmitEmpty(): boolean {
    return (this.flags & FieldFlags.OmitEmpty) !== 0;
  }

  isOmitZero(): boolean {
    return (this.flags & FieldFlags.OmitZero) !== 0;
  }
}

export function omitNull<T>(field: Field<T>): Field<T> {
  if (field.type.isRef() || field.type.isArray()) {
    return new Field<T>(field.type, field.name, field.flags | FieldFlags.OmitNull | FieldFlags.Optional);
  }
  throw new InvalidFieldError(`Unable to create omitNull field, invalid field type: ${TypeId[field.type.id]}`);
}

export function omitEmpty<T>(field: Field<T>): Field<T> {
  if (field.type.isString() || field.type.isArray() || field.type.isByteArray()) {
    return new Field<T>(field.type, field.name, field.flags | FieldFlags.OmitEmpty | FieldFlags.Optional);
  }
  throw new InvalidFieldError(`Unable to create omitEmpty field, invalid field type: ${TypeId[field.type.id]}`);
}

export function omitZero<T>(field: Field<T>): Field<T> {
  if (field.type.isNumber()) {
    return new Field<T>(field.type, field.name, field.flags | FieldFlags.OmitZero | FieldFlags.Optional);
  }
  throw new InvalidFieldError(`Unable to create omitZero field, invalid field type: ${TypeId[field.type.id]}`);
}

export function ref(name: string, schema: Schema): Field<Schema> {
  return new Field<Schema>(REF(schema), name);
}

export function array(name: string, type: Type<any>, length?: number): Field<ArrayTypeProps> {
  return new Field<ArrayTypeProps>(ARRAY(type, length), name);
}

export function map(name: string, key: Type<any>, value: Type<any>): Field<MapTypeProps> {
  return new Field<MapTypeProps>(MAP(key, value), name);
}

export function union(name: string, types: Type<any>[]): Field<Type<any>[]> {
  types.forEach((t) => {
    if (!t.isRef()) {
      throw new InvalidFieldError(
        `Unable to create oneOf field, one of the types is refering to an invalid type: ${TypeId[t.id]}`,
      );
    }
  });
  return new Field<Type<any>[]>(UNION(types), name);
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

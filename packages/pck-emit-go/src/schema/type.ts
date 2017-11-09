import {
  TypeFlags, Type, BoolType, IntType, FloatType, VarIntType, BytesType, StringType, ArrayType, MapType, SchemaType,
  UnionType,
} from "pck";

export type GoType =
  | GoBoolType
  | GoIntType
  | GoFloatType
  | GoVarIntType
  | GoBytesType
  | GoStringType
  | GoArrayType
  | GoMapType
  | GoSchemaType
  | GoUnionType;

export class GoBoolType extends BoolType { }
export class GoIntType extends IntType { }
export class GoFloatType extends FloatType { }
export class GoVarIntType extends VarIntType { }
export class GoBytesType extends BytesType { }
export class GoStringType extends StringType { }

export class GoArrayType extends ArrayType {
  readonly valueType: GoType;

  constructor(flags: TypeFlags, valueType: GoType, length?: number) {
    super(flags, valueType, length);
  }

  withValueType(valueType: GoType): GoArrayType {
    return new GoArrayType(this.flags, valueType, this.length);
  }
}

export class GoMapType extends MapType {
  readonly keyType: GoType;
  readonly valueType: GoType;

  constructor(flags: TypeFlags, keyType: GoType, valueType: GoType) {
    super(flags, keyType, valueType);
  }

  withKeyType(keyType: GoType): GoMapType {
    return new GoMapType(this.flags, keyType, this.valueType);
  }

  withValueType(valueType: GoType): GoMapType {
    return new GoMapType(this.flags, this.keyType, valueType);
  }
}

export class GoSchemaType extends SchemaType {
  readonly ref: boolean;

  constructor(flags: TypeFlags, schemaId: string, ref: boolean) {
    super(flags, schemaId);
    this.ref = ref;
  }
}

export class GoUnionType extends UnionType {
  readonly interface: string;

  constructor(flags: TypeFlags, schemaIds: string[], iface: string) {
    super(flags, schemaIds);
    this.interface = iface;
  }
}

export function convertToGoType(type: Type): GoType {
  switch (type.id) {
    case "bool":
      return new GoBoolType(type.flags);
    case "int":
      return new GoIntType(type.flags, type.size, type.signed);
    case "float":
      return new GoFloatType(type.flags, type.size);
    case "varint":
      return new GoVarIntType(type.flags, type.signed);
    case "bytes":
      return new GoBytesType(type.flags, type.length);
    case "string":
      return new GoStringType(type.flags, type.encoding, type.length);
    case "array":
      return new GoArrayType(type.flags, convertToGoType(type.valueType), type.length);
    case "map":
      return new GoMapType(type.flags, convertToGoType(type.keyType), convertToGoType(type.valueType));
    case "schema":
      return new GoSchemaType(type.flags, type.schemaId, false);
    case "union":
      return new GoUnionType(type.flags, type.schemaIds, "unpcker");
  }
}

export function REF(type: GoType): GoType {
  switch (type.id) {
    case "schema":
      return new GoSchemaType(type.flags, type.schemaId, true);
  }

  throw new Error(`REF cannot be applied to ${type.id} type.`);
}

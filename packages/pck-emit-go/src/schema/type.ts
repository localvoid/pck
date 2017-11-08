import {
  Type, BoolType, IntType, FloatType, VarIntType, BytesType, StringType, ArrayType, MapType, SchemaType, UnionType,
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
export class GoArrayType extends ArrayType { }
export class GoMapType extends MapType { }
export class GoSchemaType extends SchemaType { }
export class GoUnionType extends UnionType { }

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
      return new GoArrayType(type.flags, type.valueType, type.length);
    case "map":
      return new GoMapType(type.flags, type.keyType, type.valueType);
    case "schema":
      return new GoSchemaType(type.flags, type.schemaId);
    case "union":
      return new GoUnionType(type.flags, type.schemaIds);
  }
}

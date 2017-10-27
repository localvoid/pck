import { TChildren } from "osh";
import { Field, Type } from "pck";
import { schemaName } from "./schema";

export function tsType(type: Type): TChildren {
  if (type.isNumber()) {
    return "number";
  }
  if (type.isString()) {
    return "string";
  }
  if (type.isByteArray()) {
    return "Uint8Array";
  }
  if (type.isArray()) {
    return ["Array<", tsType(type.props.type), ">"];
  }
  if (type.isRef()) {
    return schemaName(type.props);
  }

  throw new Error(`Unable to find appropriate TypeScript type for PCK ${type} type.`);
}

export function tsFieldType(field: Field<any>): TChildren {
  if (field.isOmitNull()) {
    return [tsType(field.type), " | null"];
  }
  return tsType(field.type);
}

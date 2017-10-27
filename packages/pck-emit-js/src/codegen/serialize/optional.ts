import { Context, ComponentNode, TChildren, component } from "osh";
import { line } from "osh-code";
import { Field } from "pck";
import { isNotEmpty, isNotEmptyString, isNotNull, isNotZero, and, getter, getSchema, optional } from "../utils";

export function checkOptionalField(f: Field): TChildren {
  if (f.isOmitNull()) {
    if (f.isOmitEmpty()) {
      if (f.type.isString()) {
        return and(isNotNull(getter(f)), isNotEmptyString(getter(f)));
      }
      return and(isNotNull(getter(f)), isNotEmpty(getter(f)));
    }
    return isNotNull(getter(f));
  }
  if (f.isOmitEmpty()) {
    if (f.type.isString()) {
      return isNotEmptyString(getter(f));
    }
    return isNotEmpty(getter(f));
  }
  if (f.isOmitZero()) {
    return isNotZero(getter(f));
  }
  throw new Error("Invalid optional field");
}

export function OptionalChecks(ctx: Context): TChildren {
  const schema = getSchema(ctx);

  return schema.optionalFields.map((f) => line("const ", optional(f), " = ", checkOptionalField(f), ";"));
}

export function optionalChecks(): ComponentNode<undefined> {
  return component(OptionalChecks);
}

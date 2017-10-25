import { Field } from "pck";
import { TChildren } from "osh";
import { isNotEmpty, isNotEmptyString, isNotNull, isNotZero, and, getter } from "../utils";

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

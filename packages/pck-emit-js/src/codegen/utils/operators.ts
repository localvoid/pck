import { TChildren, join } from "osh";
import { ts } from "osh-code-js";
import { Field } from "pck";

export function call(fn: TChildren, args: TChildren[]): TChildren {
  return [fn, "(", join(args, ", "), ")"];
}

export function and(...children: TChildren[]): TChildren {
  return ["(", join(children, " && "), ")"];
}

export function getter(field: Field<any>): TChildren {
  if (field.isOmitNull()) {
    return [`this.${field.name}`, ts("!")];
  }
  return `this.${field.name}`;
}

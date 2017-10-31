import { TChildren } from "osh";
import { intersperse } from "osh-text";
import { ts } from "osh-code-js";
import { Field } from "pck";

export function call(fn: TChildren, args: TChildren[]): TChildren {
  return [fn, "(", intersperse(args, ", "), ")"];
}

export function and(...children: TChildren[]): TChildren {
  return ["(", intersperse(children, " && "), ")"];
}

export function getter(field: Field<any>): TChildren {
  if (field.isOmitNull()) {
    return [`this.${field.name}`, ts("!")];
  }
  return `this.${field.name}`;
}

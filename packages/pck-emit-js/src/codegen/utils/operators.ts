import { TChildren, join } from "osh";
import { Field } from "pck";

export function call(fn: TChildren, args: TChildren[]): TChildren {
  return [fn, "(", join(args, ", "), ")"];
}

export function and(...children: TChildren[]): TChildren {
  return ["(", join(children, " && "), ")"];
}

export function getter(field: Field<any>): TChildren {
  return `this.${field.name}`;
}

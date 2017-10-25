import { TChildren } from "osh";
import { Field } from "pck";

export function call(fn: TChildren, args: TChildren[]): TChildren {
  const r = [fn, "("];
  if (args.length > 0) {
    r.push(args[0]);
    for (let i = 1; i < args.length; ++i) {
      r.push(", ", args[i]);
    }
  }
  r.push(")");
  return r;
}

export function and(...children: TChildren[]): TChildren {
  if (children.length === 1) {
    return children;
  }
  const r = [children[0]];
  for (let i = 1; i < children.length; ++i) {
    r.push(" && ", children[i]);
  }
  return ["(", r, ")"];
}

export function getter(field: Field<any>): TChildren {
  return `this.${field.name}`;
}

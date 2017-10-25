import { Field } from "pck";
import { Context, TChildren, component, ComponentNode } from "osh";

export const VARS = Symbol("Vars");
export const TYPED = Symbol("Typed");
export const TARGET = Symbol("Target");

export function isNotNull(...children: TChildren[]) {
  return ["((", children, ") !== null)"];
}

export function isNotEmpty(...children: TChildren[]) {
  return ["((", children, ").length > 0)"];
}

export function isNotEmptyString(...children: TChildren[]) {
  return [`((`, children, `) !== "")`];
}

export function isNotZero(...children: TChildren[]) {
  return ["((", children, ") !== 0)"];
}

export function isTrue(...children: TChildren[]) {
  return ["((", children, ") === true)"];
}

export function call(fn: TChildren, args: TChildren[]) {
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

export function and(...children: TChildren[]) {
  if (children.length === 1) {
    return children;
  }
  const r = [children[0]];
  for (let i = 1; i < children.length; ++i) {
    r.push(" && ", children[i]);
  }
  return ["(", r, ")"];
}

export function isTyped(ctx: Context): boolean {
  return ctx[TYPED] === true;
}

export function getTarget(ctx: Context): string {
  const target = ctx[TARGET];
  if (target === void 0) {
    return "browser";
  }
  return "node";
}

const has = Object.prototype.hasOwnProperty;

export function V(ctx: Context, symbol: string) {
  const vars = ctx[VARS];
  if (vars === void 0) {
    throw new Error("Unable to locate VARS object in context");
  }
  if (!has.call(vars, symbol)) {
    throw new Error(`Unable to locate "${symbol}" variable`);
  }
  return `${vars[symbol]}`;
}

export function v(symbol: string): ComponentNode<string> {
  return component(V, symbol);
}

export function Type(ctx: Context, children: TChildren[]) {
  if (isTyped(ctx)) {
    return children;
  }
  return null;
}

export function type(...children: TChildren[]) {
  return component(Type, children);
}

export function Getter(ctx: Context, field: Field) {
  return `this.${field.name}`;
}

export function getter(field: Field) {
  return component(Getter, field);
}

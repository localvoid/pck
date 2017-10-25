import { Context, ComponentNode, TChildren, component } from "osh";

export const VARS = Symbol("Vars");

const has = Object.prototype.hasOwnProperty;

export function V(ctx: Context, symbol: string): TChildren {
  const vars = ctx[VARS];
  if (vars === void 0) {
    throw new Error("Unable to locate VARS object in context");
  }
  if (!has.call(vars, symbol)) {
    throw new Error(`Unable to locate "${symbol}" variable`);
  }
  return vars[symbol];
}

export function v(symbol: string): ComponentNode<string> {
  return component(V, symbol);
}

import { Context } from "osh";

export const TARGET = Symbol("Target");

export function getTarget(ctx: Context): string {
  const target = ctx[TARGET];
  if (target === void 0) {
    return "browser";
  }
  return "node";
}

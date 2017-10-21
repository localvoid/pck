import { Bundle } from "pck";
import { Context } from "osh";

export const BUNDLE = Symbol("Bundle");

export function getBundle(ctx: Context): Bundle {
  return ctx[BUNDLE];
}

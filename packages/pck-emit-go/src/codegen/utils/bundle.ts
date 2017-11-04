import { Bundle } from "pck";
import { Context } from "osh";
import { GoSchema, GoField } from "../../schema";

export const BUNDLE = Symbol("Bundle");

export function getBundle(ctx: Context): Bundle<GoSchema, GoField> {
  return ctx[BUNDLE];
}

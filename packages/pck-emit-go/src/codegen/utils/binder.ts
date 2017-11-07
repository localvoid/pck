import { Binder } from "pck";
import { Context } from "osh";
import { GoSchema, GoField } from "../../schema";

export const BINDER = Symbol("Binder");

export function getBinder(ctx: Context): Binder<GoSchema, GoField> {
  return ctx[BINDER];
}

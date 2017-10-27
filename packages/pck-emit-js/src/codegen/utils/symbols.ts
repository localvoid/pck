import { TNode } from "osh";
import { sym } from "osh-code";
import { Field } from "pck";

export const ARGUMENTS = Symbol("Arguments");
export const OPTIONAL = Symbol("Optional");
export const MODULES = Symbol("Modules");
export const BIT_SETS = Symbol("BitSets");
export const FIELD_VALUES = Symbol("FieldValues");

export function arg(name: string): TNode {
  return sym(ARGUMENTS, name);
}

export function optional(field: Field<any>): TNode {
  return sym(OPTIONAL, field);
}

export function module(name: string): TNode {
  return sym(MODULES, name);
}

export function bitSet(i: number): TNode {
  return sym(BIT_SETS, i);
}

export function fieldValue(field: Field<any>): TNode {
  return sym(FIELD_VALUES, field);
}

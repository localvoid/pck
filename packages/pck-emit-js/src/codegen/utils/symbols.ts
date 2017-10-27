import { TNode } from "osh";
import { sym } from "osh-code";
import { Field } from "pck";

export const ARGUMENTS = Symbol("Arguments");
export const OPTIONAL = Symbol("Optional");
export const MODULES = Symbol("Modules");
export const BITSETS = Symbol("BitSets");

export function arg(key: string): TNode {
  return sym(ARGUMENTS, key);
}

export function optional(f: Field<any>): TNode {
  return sym(OPTIONAL, f);
}

export function module(name: string): TNode {
  return sym(MODULES, name);
}

export function bitSet(i: number): TNode {
  return sym(BITSETS, i);
}

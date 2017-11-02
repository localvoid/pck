import { TNode, TChildren } from "osh";
import { capitalizeTransformer } from "osh-text";
import { SymbolDeclaration, scope, declSymbol, sym } from "osh-code";
import { Field } from "pck";

const INTERNAL = Symbol("Internal");
const ARGUMENTS = Symbol("Arguments");
const VARS = Symbol("Variables");
const OPTIONALS = Symbol("Optionals");

export function declInternal(symbols: string[], children: TChildren): TChildren {
  return scope({
    type: INTERNAL,
    symbols: symbols.map((s) => declSymbol(s, s)),
    children: children,
  });
}

export function declArgs(args: (string | SymbolDeclaration)[], children: TChildren): TChildren {
  return scope({
    type: ARGUMENTS,
    symbols: args.map((a) => typeof a === "string" ? declSymbol(a, a) : a),
    children: children,
  });
}

export function declVars(vars: string[], children: TChildren): TChildren {
  return scope({
    type: VARS,
    symbols: vars.map((a) => declSymbol(a, a)),
    children: children,
  });
}

export function declOptionals(fields: Field<any>[], children: TChildren): TChildren {
  return scope({
    type: OPTIONALS,
    symbols: fields.map((f) => declSymbol(f, `optional${capitalizeTransformer(f.name)}`)),
    children: children,
  });
}

export function internal(name: string): TNode {
  return sym(INTERNAL, name);
}

export function arg(name: string): TNode {
  return sym(ARGUMENTS, name);
}

export function v(name: string): TNode {
  return sym(VARS, name);
}

export function optional(field: Field<any>): TNode {
  return sym(OPTIONALS, field);
}

import { TNode, TChildren } from "osh";
import { scope, declSymbol, sym } from "osh-code";

const INTERNAL = Symbol("Internal");
const ARGUMENTS = Symbol("Arguments");

export function declInternal(symbols: string[], children: TChildren[]): TChildren {
  return scope({
    type: INTERNAL,
    symbols: symbols.map((s) => declSymbol(s, s)),
    children: children,
  });
}

export function declArgs(args: string[], children: TChildren[]): TChildren {
  return scope({
    type: ARGUMENTS,
    symbols: args.map((a) => declSymbol(a, a)),
    children: children,
  });
}

export function internal(name: string): TNode {
  return sym(INTERNAL, name);
}

export function arg(name: string): TNode {
  return sym(ARGUMENTS, name);
}

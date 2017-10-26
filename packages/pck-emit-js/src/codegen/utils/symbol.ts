import { Context, ComponentNode, TChildren, component } from "osh";
import { SymbolDeclaration, scope, getSymbol } from "osh-code";

export const VARIABLES = Symbol("Variables");

function symbolConflictResolver(s: string, i: number): string {
  if (i === 0) {
    return s;
  }
  return `${s}_${i}`;
}

export function declareSymbols(scopeType: symbol, symbols: SymbolDeclaration[], ...children: TChildren[]): TChildren {
  return scope(
    scopeType,
    symbolConflictResolver,
    symbols,
    children,
  );
}

export function Variable(ctx: Context, props: { scopeType: symbol, key: any }): TChildren {
  return getSymbol(ctx, props.scopeType, props.key);
}

export function v(key: any): ComponentNode<{ scopeType: symbol, key: any }> {
  return component(Variable, { scopeType: VARIABLES, key });
}

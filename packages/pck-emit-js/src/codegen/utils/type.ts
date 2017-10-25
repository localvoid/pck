import { Context, ComponentNode, TChildren, component } from "osh";

export const TYPED = Symbol("Typed");

export function isTyped(ctx: Context): boolean {
  return ctx[TYPED] === true;
}

export function Type(ctx: Context, children: TChildren[]): TChildren {
  if (isTyped(ctx)) {
    return children;
  }
  return null;
}

export function type(...children: TChildren[]): ComponentNode<TChildren[]> {
  return component(Type, children);
}

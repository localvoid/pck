import { Context, TChildren, component, context, ContextNode, ComponentNode } from "osh";

export const MODULE_RESOLVERS = Symbol("ImportModules");

function resolveModuleSymbol(ctx: Context, module: string, symbol: string): string {
  return ctx[MODULE_RESOLVERS][module](symbol);
}

export function ModuleResolvers(ctx: Context, props: { imports: {}, children: TChildren }): ContextNode {
  return context(
    { [MODULE_RESOLVERS]: { ...ctx[MODULE_RESOLVERS], ...props.imports } },
    props.children,
  );
}

export function ModuleSymbol(ctx: Context, props: { module: string, symbol: string }) {
  return resolveModuleSymbol(ctx, props.module, props.symbol);
}

export function moduleResolvers(imports: {}, children: TChildren): ComponentNode<{ imports: {}, children: TChildren }> {
  return component(ModuleResolvers, { imports, children });
}

export function moduleSymbol(module: string, symbol: string) {
  return component(ModuleSymbol, { module, symbol });
}

export function pck(symbol: string) {
  return moduleSymbol("pck", symbol);
}

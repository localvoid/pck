import { TChildren, renderToString, context } from "osh";
import { PADDING } from "osh-code";
import { goCode } from "osh-code-go";
import { GoBinder } from "./schema";
import { declLibSymbols } from "./codegen/lib";

export interface EmitOptions {
  readonly binder: GoBinder;
  readonly padding: string;
}

export function emit(options: EmitOptions, ...children: TChildren[]): string {
  options = {
    ...{
      padding: "",
    },
    ...options,
  };

  return renderToString(
    goCode(
      {},
      context(
        {
          [PADDING]: options.padding,
        },
        declLibSymbols(
          children,
        ),
      ),
    ),
  );
}

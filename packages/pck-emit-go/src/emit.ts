import { TChildren, renderToString, context } from "osh";
import { PADDING } from "osh-code";
import { goCode } from "osh-code-go";
import { Bundle } from "pck";
import { GoSchema, GoField } from "./schema";
import { BUNDLE } from "./codegen/utils";
import { declLibSymbols } from "./codegen/lib";

export interface EmitOptions {
  readonly bundle: Bundle<GoSchema, GoField>;
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
          [BUNDLE]: options.bundle,
          [PADDING]: options.padding,
        },
        declLibSymbols(
          children,
        ),
      ),
    ),
  );
}

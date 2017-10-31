import { TChildren, renderToString, context } from "osh";
import { PADDING } from "osh-code";
import { goCode } from "osh-code-go";
import { Bundle } from "pck";
import { BUNDLE } from "./codegen/utils";

export interface EmitOptions {
  readonly bundle: Bundle;
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
        children,
      ),
    ),
  );
}

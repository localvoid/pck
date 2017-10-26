import { Bundle, Schema } from "pck";
import { renderToString, context } from "osh";
import { PADDING, goCode, line } from "osh-code";
import { BUNDLE, SCHEMA, VARS } from "./codegen/utils";

export interface EmitOptions {
  readonly bundle: Bundle;
  readonly padding: string;
}

export enum EmitType {
  Size = 0,
  Pck = 1,
  Unpck = 2,
}

function emitByType(type: EmitType) {
  switch (type) {
    case EmitType.Size:
    case EmitType.Pck:
    case EmitType.Unpck:
      return "";
  }
  throw new Error(`Invalid emit type "${EmitType[type]}"`);
}

export function emit(options: EmitOptions, schema: Schema, type: EmitType): string {
  options = {
    ...{
      padding: "",
    },
    ...options,
  };

  return renderToString(
    goCode(
      context(
        {
          [BUNDLE]: options.bundle,
          [SCHEMA]: schema,
          [PADDING]: options.padding,
          [VARS]: {
            "buffer": "b",
          },
        },
        line(),
        emitByType(type),
      ),
    ),
  );
}

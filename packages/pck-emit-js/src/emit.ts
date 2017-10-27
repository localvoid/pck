import { Context, renderToString, context } from "osh";
import { PADDING, line, scope, declSymbol, getSymbol } from "osh-code";
import { JSCodeOptions, jsCode } from "osh-code-js";
import { Bundle, Schema } from "pck";
import { BUNDLE, SCHEMA, ARGUMENTS, MODULES, moduleResolvers } from "./codegen/utils";
import { pckMethod } from "./codegen/pck";
import { unpckFunction } from "./codegen/unpck";
import { taggedReaders } from "./codegen/tagged_readers";

export interface EmitOptions {
  readonly bundle: Bundle;
  readonly padding?: string;
  readonly jsOptions?: JSCodeOptions;
}

export enum EmitType {
  Pck = 0,
  Unpck = 1,
  TaggedReaders = 2,
}

function emitByType(type: EmitType) {
  switch (type) {
    case EmitType.Pck:
      return pckMethod();
    case EmitType.Unpck:
      return unpckFunction();
    case EmitType.TaggedReaders:
      return taggedReaders();
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
    jsCode(
      options.jsOptions,
      scope({
        type: ARGUMENTS,
        symbols: [
          declSymbol("writer", "writer"),
          declSymbol("reader", "reader"),
          declSymbol("isTagged", "isTagged"),
        ],
        children: moduleResolvers(
          {
            "pck": resolvePckSymbol,
          },
          context(
            {
              [BUNDLE]: options.bundle,
              [SCHEMA]: schema,
              [PADDING]: options.padding,
            },
            line(),
            emitByType(type),
          ),
        ),
      }),
    ),
  );
}

function resolvePckSymbol(symbol: string, ctx: Context): string {
  return `${getSymbol(ctx, MODULES, "pck")}.${symbol}`;
}

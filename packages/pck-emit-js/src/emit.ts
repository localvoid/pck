import { Bundle, Schema } from "pck";
import { renderToString, context } from "osh";
import { PADDING, jsCode, line } from "osh-code";
import { VARS, TYPED, TARGET } from "./code/utils";
import { BUNDLE } from "./code/bundle";
import { SCHEMA } from "./code/schema";
import { moduleResolvers } from "./code/modules";
import { serializeMethod } from "./code/serializer";
import { deserializeFunction } from "./code/deserializer";
import { taggedReaders } from "./code/tagged_readers";

export interface EmitOptions {
  readonly bundle: Bundle;
  readonly padding?: string;
  readonly mode?: "js" | "ts";
  readonly target?: "browser" | "node";
}

export enum EmitType {
  Pck = 0,
  Unpck = 1,
  TaggedReaders = 2,
}

function emitByType(type: EmitType) {
  switch (type) {
    case EmitType.Pck:
      return serializeMethod();
    case EmitType.Unpck:
      return deserializeFunction();
    case EmitType.TaggedReaders:
      return taggedReaders();
  }
  throw new Error(`Invalid emit type "${EmitType[type]}"`);
}

export function emit(options: EmitOptions, schema: Schema, type: EmitType): string {
  options = {
    ...{
      padding: "",
      mode: "js",
      target: "browser",
    },
    ...options,
  };

  return renderToString(
    jsCode(
      moduleResolvers(
        {
          "pck": resolvePckSymbol,
        },
        context(
          {
            [BUNDLE]: options.bundle,
            [SCHEMA]: schema,
            [PADDING]: options.padding,
            [TYPED]: options.mode === "ts",
            [TARGET]: options.target,
            [VARS]: {
              "writer": "__w",
              "reader": "__r",
              "tagged": "__tagged",
            },
          },
          line(),
          emitByType(type),
        ),
      ),
    ),
  );
}

function resolvePckSymbol(symbol: string): string {
  return `__pck.${symbol}`;
}

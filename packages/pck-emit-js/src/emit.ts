import { Bundle } from "pck";
import { renderToString, context } from "osh";
import { PADDING, jsCode, line } from "osh-code";
import { VARS, TYPED } from "./code/utils";
import { BUNDLE } from "./code/bundle";
import { SCHEMA } from "./code/schema";
import { moduleResolvers } from "./code/modules";
import { serializeMethod } from "./code/serializer";

export interface EmitData {
  readonly schema: string;
  readonly padding: string;
}

function emitType(type: string) {
  switch (type) {
    case "pck":
      return serializeMethod();
  }
  throw new Error("Invalid emit type");
}

export function emit(bundle: Bundle, data: EmitData, type: string, padding: string): string {
  const schema = bundle.findSchemaByName(data.schema);

  return renderToString(
    jsCode(
      moduleResolvers(
        {
          "pck": resolvePckSymbol,
        },
        context(
          {
            [BUNDLE]: bundle,
            [SCHEMA]: schema,
            [PADDING]: padding,
            [TYPED]: true,
            [VARS]: {
              "writer": "__w",
              "reader": "__r",
              "tagged": "__tagged",
            },
          },
          line(),
          emitType(type),
        ),
      ),
    ),
  );
}

function resolvePckSymbol(symbol: string): string {
  return `__pck.${symbol}`;
}

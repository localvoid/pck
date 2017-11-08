import { createDirectiveMatcher, inject as _inject } from "incode";
import { line } from "osh-code";
import { GoSchema, GoBinder } from "./schema";
import {
  lib, sizeMethod, sizeWithTagMethod, pckMethod, pckWithTagMethod, unpckMethod, taggedFactories,
} from "./codegen";
import { emit } from "./emit";

const DIRECTIVE_MATCHER = createDirectiveMatcher("pck");

export interface InjectOptions {
  readonly binder: GoBinder;
}

export function inject(options: InjectOptions, text: string): string {
  const binder = options.binder;

  return _inject(
    text,
    DIRECTIVE_MATCHER,
    (region) => {
      let children;
      switch (region.args[0]) {
        case "lib":
          children = lib();
          break;
        case "taggedFactories":
          children = taggedFactories(binder);
          break;
        case "size":
          children = sizeMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "tagSize":
          children = sizeWithTagMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "pckTag":
          children = pckWithTagMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "pck":
          children = pckMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "unpck":
          children = unpckMethod(binder, getSchema(binder, region.args[1]));
          break;
        case "methods":
          const schema = getSchema(binder, region.args[1]);
          children = [
            sizeMethod(binder, schema),
            line(),
            sizeWithTagMethod(binder, schema),
            line(),
            pckMethod(binder, schema),
            line(),
            pckWithTagMethod(binder, schema),
            line(),
            unpckMethod(binder, schema),
          ];
          break;
      }

      return (
        "\n\n" +
        emit(
          {
            ...options,
            ...{
              padding: region.padding,
            },
          },
          children,
        ) +
        "\n"
      );
    },
  );
}

function getSchema(binder: GoBinder, schemaName: any): GoSchema {
  if (typeof schemaName !== "string") {
    throw new Error(`Invalid schema name. Invalid type: ${typeof schemaName}.`);
  }
  return binder.findSchemaByName(schemaName);
}

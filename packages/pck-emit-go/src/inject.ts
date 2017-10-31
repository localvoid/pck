import { createDirectiveMatcher, inject as _inject } from "incode";
import { Bundle, Schema } from "pck";
import { sizeMethod } from "./codegen/size";
import { EmitOptions, emit } from "./emit";

interface InjectableData {
  readonly schema: string;
}

const DIRECTIVE_MATCHER = createDirectiveMatcher("pck");

export function inject(options: EmitOptions, text: string): string {
  const bundle = options.bundle;

  return _inject(
    text,
    DIRECTIVE_MATCHER,
    (region) => {
      const data = region.data as InjectableData;
      let children;
      switch (region.type) {
        case "size":
          children = sizeMethod(extractSchema(data, bundle));
          break;
      }

      return emit(
        {
          ...options,
          ...{
            padding: region.padding,
          },
        },
        children,
      );
    },
  );
}

function extractSchema(data: InjectableData, bundle: Bundle): Schema {
  const schemaName: string | undefined = data.schema;
  let schema;
  if (schemaName === void 0) {
    throw new Error(`Unable to find schema.`);
  }
  if (typeof schemaName !== "string") {
    throw new Error(`Invalid schema name. Invalid type: ${typeof schemaName}.`);
  }
  schema = bundle.findSchemaByName(schemaName);
  if (schema === void 0) {
    throw new Error(`Unable to find schema with a name "${schemaName}".`);
  }

  return schema;
}

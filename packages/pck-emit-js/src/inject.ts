import { createDirectiveMatcher, inject as _inject } from "incode";
import { EmitType, EmitOptions, emit } from "./emit";

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

      const schemaName = data.schema;
      if (typeof schemaName !== "string") {
        throw new Error(`Invalid schema name type: ${typeof schemaName}`);
      }

      const schema = bundle.findSchemaByName(schemaName);
      if (schema === void 0) {
        throw new Error(`Unable to find schema with a name "${schemaName}"`);
      }

      const type = emitTypeFromString(region.type);

      return emit({ ...options, ...{ padding: region.padding } }, schema, type);
    },
  );
}

function emitTypeFromString(type: string): EmitType {
  switch (type) {
    case "pck":
      return EmitType.Pck;
    case "unpck":
      return EmitType.Unpck;
    case "tagged-readers":
      return EmitType.TaggedReaders;
    case "properties":
      return EmitType.Properties;
    case "constructor":
      return EmitType.Constructor;
    case "class":
      return EmitType.Class;
  }
  throw new Error(`Invalid emit type "${type}"`);
}

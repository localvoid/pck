import { Type } from "./type";
import { Schema } from "./schema";

export class Bundle {
  readonly schemas: Schema[];
  readonly types: Set<Type>;
  readonly fixedSizeSchemas: Set<Schema>;
  readonly oneOfSchemas: Map<Schema, number>;
  readonly index: Map<string, Schema>;

  constructor(
    schemas: Schema[],
    types: Set<Type>,
    fixedSizeSchemas: Set<Schema>,
    oneOfSchemas: Map<Schema, number>,
  ) {
    this.schemas = schemas;
    this.types = types;
    this.fixedSizeSchemas = fixedSizeSchemas;
    this.oneOfSchemas = oneOfSchemas;
    this.index = new Map<string, Schema>();

    for (const schema of schemas) {
      if (this.index.has(schema.name)) {
        throw new Error(`Failed to bundle, found two schemas with the name ${schema.name}`);
      }
      this.index.set(schema.name, schema);
    }
  }

  findSchemaByName(name: string): Schema | undefined {
    return this.index.get(name);
  }

  isOneOfSchema(schema: Schema): number | undefined {
    return this.oneOfSchemas.get(schema);
  }
}

export function bundle(schemas: Schema[]): Bundle {
  const analyzeResult = analyzeSchemas(schemas);
  return new Bundle(
    schemas,
    analyzeResult.types,
    analyzeResult.fixedSizeSchemas,
    analyzeResult.oneOfSchemas,
  );
}

interface AnalyzeResult {
  readonly types: Set<Type>;
  readonly fixedSizeSchemas: Set<Schema>;
  readonly oneOfSchemas: Map<Schema, number>;
}

function analyzeSchemas(schemas: Schema[]): AnalyzeResult {
  const types = new Set<Type>();
  const fixedSizeSchemas = new Set<Schema>();
  const oneOfSchemas = new Map<Schema, number>();
  let oneOfIndex = 0;

  for (const schema of schemas) {
    if (!schema.hasDynamicSize()) {
      fixedSizeSchemas.add(schema);
    }

    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.isOneOf()) {
        for (const oneOfType of field.type.props) {
          if (oneOfType.isRef()) {
            oneOfSchemas.set(oneOfType.props, oneOfIndex++);
          }
        }
      }
    }
  }

  return {
    types,
    fixedSizeSchemas,
    oneOfSchemas,
  };
}

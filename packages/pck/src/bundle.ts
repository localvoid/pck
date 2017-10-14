import { Type } from "./type";
import { Schema, SchemaFlags } from "./schema";

export class Bundle {
  readonly schemas: Schema[];
  readonly types: Set<Type>;
  readonly fixedSizeSchemas: Set<Schema>;
  readonly index: Map<string, Schema>;

  constructor(schemas: Schema[], types: Set<Type>, fixedSizeSchemas: Set<Schema>) {
    this.schemas = schemas;
    this.types = types;
    this.fixedSizeSchemas = fixedSizeSchemas;
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
}

export function bundle(schemas: Schema[]): Bundle {
  const analyzeResult = analyzeSchemas(schemas);
  return new Bundle(schemas, analyzeResult.types, analyzeResult.fixedSizeSchemas);
}

interface AnalyzeResult {
  types: Set<Type>;
  fixedSizeSchemas: Set<Schema>;
}

function analyzeSchemas(schemas: Schema[]): AnalyzeResult {
  const types = new Set<Type>();
  const fixedSizeSchemas = new Set<Schema>();

  for (const schema of schemas) {
    if ((schema.details.flags & SchemaFlags.DynamicSize) === 0) {
      fixedSizeSchemas.add(schema);
    }

    for (const field of schema.fields) {
      types.add(field.type);
    }
  }

  return {
    types,
    fixedSizeSchemas,
  };
}

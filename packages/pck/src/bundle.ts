import { Type } from "./type";
import { Schema } from "./schema";
import { Binder } from "./binder";

export class Bundle {
  readonly binder: Binder;
  readonly schemas: Schema[];
  readonly types: Set<Type>;
  readonly taggedSchemas: Map<symbol, number>;

  constructor(
    binder: Binder,
    schemas: Schema[],
    types: Set<Type>,
    taggedSchemas: Map<symbol, number>,
  ) {
    this.binder = binder;
    this.schemas = schemas;
    this.types = types;
    this.taggedSchemas = taggedSchemas;
  }

  getSchemaTag(schema: Schema): number | undefined {
    return this.taggedSchemas.get(schema.id);
  }
}

export function bundle(schemas: Schema[]): Bundle {
  const binder = new Binder();
  for (const schema of schemas) {
    binder.addSchema(schema);
  }

  const analyzeResult = analyzeSchemas(binder, schemas);

  return new Bundle(binder, schemas, analyzeResult.types, analyzeResult.taggedSchemas);
}

interface AnalyzeResult {
  readonly types: Set<Type>;
  readonly taggedSchemas: Map<symbol, number>;
}

function analyzeSchemas(binder: Binder, schemas: Schema[]): AnalyzeResult {
  const types = new Set<Type>();
  const taggedSchemas = new Map<symbol, number>();
  let tagIndex = 0;

  for (const schema of schemas) {
    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.id === "union") {
        for (const schemaId of field.type.symbols) {
          if (!taggedSchemas.has(schemaId)) {
            taggedSchemas.set(schemaId, tagIndex++);
          }
        }
      }
    }
  }

  return { types, taggedSchemas };
}

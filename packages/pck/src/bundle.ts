import { Type } from "./type";
import { Schema } from "./schema";

export class SchemaImport {
  readonly name: string;
  readonly schema: Schema;

  constructor(name: string, schema: Schema) {
    this.name = name;
    this.schema = schema;
  }
}

export function importSchema(name: string, schema: Schema): SchemaImport {
  return new SchemaImport(name, schema);
}

export class Bundle {
  readonly schemas: Schema[];
  readonly index: Map<string, Schema>;
  readonly schemaNames: Map<Schema, string>;
  readonly types: Set<Type>;
  readonly fixedSizeSchemas: Set<Schema>;
  readonly taggedSchemas: Map<Schema, number>;

  constructor(
    schemas: Schema[],
    index: Map<string, Schema>,
    types: Set<Type>,
    fixedSizeSchemas: Set<Schema>,
    taggedSchemas: Map<Schema, number>,
  ) {
    this.schemas = schemas;
    this.index = index;
    this.schemaNames = new Map<Schema, string>();
    this.types = types;
    this.fixedSizeSchemas = fixedSizeSchemas;
    this.taggedSchemas = taggedSchemas;

    this.index.forEach((schema, name) => {
      this.schemaNames.set(schema, name);
    });
  }

  findSchemaByName(name: string): Schema | undefined {
    return this.index.get(name);
  }

  getSchemaTag(schema: Schema): number | undefined {
    return this.taggedSchemas.get(schema);
  }

  getSchemaName(schema: Schema): string {
    const name = this.schemaNames.get(schema);
    if (name === void 0) {
      throw new Error("Unable to find schema name");
    }
    return name;
  }
}

export function bundle(imports: SchemaImport[]): Bundle {
  const analyzeResult = analyzeSchemas(imports);

  return new Bundle(
    analyzeResult.schemas,
    analyzeResult.index,
    analyzeResult.types,
    analyzeResult.fixedSizeSchemas,
    analyzeResult.taggedSchemas,
  );
}

interface AnalyzeResult {
  readonly schemas: Schema[];
  readonly index: Map<string, Schema>;
  readonly types: Set<Type>;
  readonly fixedSizeSchemas: Set<Schema>;
  readonly taggedSchemas: Map<Schema, number>;
}

function analyzeSchemas(imports: SchemaImport[]): AnalyzeResult {
  const schemas = imports.map((i) => i.schema);
  const index = new Map<string, Schema>();
  const types = new Set<Type>();
  const fixedSizeSchemas = new Set<Schema>();
  const taggedSchemas = new Map<Schema, number>();
  let tagIndex = 0;

  for (const i of imports) {
    if (index.has(i.name)) {
      throw new Error(`Failed to bundle, found two schemas with the name "${i.name}"`);
    }
    index.set(i.name, i.schema);
  }

  for (const schema of schemas) {
    if (!schema.hasDynamicSize()) {
      fixedSizeSchemas.add(schema);
    }

    for (const field of schema.fields) {
      types.add(field.type);

      if (field.type.isOneOf()) {
        for (const oneOfType of field.type.props) {
          if (oneOfType.isRef()) {
            taggedSchemas.set(oneOfType.props, tagIndex++);
          }
        }
      }
    }
  }

  return { schemas, index, types, fixedSizeSchemas, taggedSchemas };
}

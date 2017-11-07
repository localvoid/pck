import { Type, IntType, FloatType, VarIntType } from "./type";
import { Field } from "./field";
import { Schema } from "./schema";
import { BitStore, createBitStoreFromSchema } from "./bitstore";

export const DYNAMIC_SIZE = -1;

export class SchemaSize {
  readonly bitStoreSize: number;
  readonly fixedFieldsSize: number;
  readonly dynamic: boolean;

  constructor(bitStoreSize: number, fixedFieldsSize: number, dynamic: boolean) {
    this.bitStoreSize = bitStoreSize;
    this.fixedFieldsSize = fixedFieldsSize;
    this.dynamic = dynamic;
  }

  get fixedSize(): number {
    return this.bitStoreSize + this.fixedFieldsSize;
  }

  toString(): string {
    return `<SchemaSize: ${this.bitStoreSize}|${this.fixedFieldsSize}${this.dynamic ? "|dynamic" : ""}>`;
  }
}

export class SchemaDetails<T extends Schema<F>, F extends Field> {
  readonly schema: T;
  readonly tag: number;
  readonly size: SchemaSize;
  readonly bitStore: BitStore;
  readonly fixedFields: F[];
  readonly dynamicFields: F[];
  readonly optionalFields: F[];

  constructor(
    schema: T,
    tag: number,
    size: SchemaSize,
    bitStore: BitStore,
    fixedFields: F[],
    dynamicFields: F[],
    optionalFields: F[],
  ) {
    this.schema = schema;
    this.tag = tag;
    this.size = size;
    this.bitStore = bitStore;
    this.fixedFields = fixedFields;
    this.dynamicFields = dynamicFields;
    this.optionalFields = optionalFields;
  }
}

export class Binder<T extends Schema<F>, F extends Field> {
  readonly schemas: T[];
  readonly schemaIdIndex: Map<string, T>;
  readonly schemaTags: Map<string, number>;
  readonly details: Map<string, SchemaDetails<T, F>>;

  constructor(schemas: T[], schemaTags: Map<string, number>) {
    this.schemas = schemas;
    this.schemaIdIndex = new Map<string, T>();
    this.schemaTags = schemaTags;
    this.details = new Map<string, SchemaDetails<T, F>>();

    for (const schema of schemas) {
      this.schemaIdIndex.set(schema.id, schema);
    }
  }

  findSchemaById(id: string): T {
    const schema = this.schemaIdIndex.get(id);
    if (schema === undefined) {
      throw new Error(`Unable to find schema with id "${id}".`);
    }
    return schema;
  }

  getSchemaDetails(schema: T): SchemaDetails<T, F> {
    let details = this.details.get(schema.id);
    if (details === undefined) {
      details = analyzeSchema(this, new Set<string>(), schema);
      this.details.set(schema.id, details);
    }
    return details;
  }

  getTypeSize(type: Type): number {
    return getTypeSize(this, new Set<string>(), type);
  }
}

function analyzeSchema<T extends Schema<F>, F extends Field>(
  binder: Binder<T, F>,
  visitedSchemas: Set<string>,
  schema: T,
): SchemaDetails<T, F> {
  visitedSchemas.add(schema.id);

  const bitStore = createBitStoreFromSchema(schema);
  const fixedFields = [];
  const dynamicFields = [];
  const optionalFields = [];
  let tag = binder.schemaTags.get(schema.id);
  if (tag === undefined) {
    tag = -1;
  }

  let fixedFieldsSize = 0;
  let dynamic = false;

  for (const field of schema.fields.slice().sort(sortFields(binder, visitedSchemas))) {
    if (field.isOptional()) {
      optionalFields.push(field);
      dynamicFields.push(field);
      dynamic = true;
    } else {
      const fieldSize = getTypeSize(binder, visitedSchemas, field.type);
      if (fieldSize === DYNAMIC_SIZE) {
        dynamicFields.push(field);
        dynamic = true;
      } else if (fieldSize > 0) {
        fixedFields.push(field);
        fixedFieldsSize += fieldSize;
      }
    }
  }

  const size = new SchemaSize(Math.ceil(bitStore.length / 8), fixedFieldsSize, dynamic);

  return new SchemaDetails<T, F>(schema, tag, size, bitStore, fixedFields, dynamicFields, optionalFields);
}

function getSchemaSize<T extends Schema<F>, F extends Field>(
  binder: Binder<T, F>,
  visitedSchemas: Set<string>,
  schema: T,
): number {
  let details = binder.details.get(schema.id);
  if (details === undefined) {
    if (visitedSchemas.has(schema.id)) {
      throw new Error(`Unable to to calculate schema size.Schema ${schema.id} has circular references.`);
    }
    details = analyzeSchema(binder, visitedSchemas, schema);
    binder.details.set(schema.id, details);
  }
  if (details.size.dynamic) {
    return DYNAMIC_SIZE;
  }
  return details.size.fixedSize;
}

function getTypeSize<T extends Schema<F>, F extends Field>(
  binder: Binder<T, F>,
  visitedSchemas: Set<string>,
  type: Type,
): number {
  switch (type.id) {
    case "bool":
      return 0;
    case "int":
    case "float":
      return type.size;
    case "varint":
      return DYNAMIC_SIZE;
    case "bytes":
      if (type.length === 0) {
        return DYNAMIC_SIZE;
      } else {
        return type.length;
      }
    case "utf8":
      return DYNAMIC_SIZE;
    case "ascii":
      if (type.length === 0) {
        return DYNAMIC_SIZE;
      } else {
        return type.length;
      }
    case "array":
      if (type.length === 0) {
        return DYNAMIC_SIZE;
      } else {
        const valueTypeSize = getTypeSize(binder, visitedSchemas, type.valueType);
        if (valueTypeSize === DYNAMIC_SIZE) {
          return DYNAMIC_SIZE;
        } else {
          return type.length * valueTypeSize;
        }
      }
    case "map":
      return -1;
    case "schema":
      return getSchemaSize(binder, visitedSchemas, binder.findSchemaById(type.schemaId));
    case "union":
      return -1;
  }
}

/**
 * - [FIXED | DYNAMIC | OPTIONAL]
 * - [UINT | INT | FLOAT | VARUINT | VARINT | BYTES | UTF8 | ASCII | REF | UNION | ARRAY | MAP]
 * - Integers and floats sorted by size
 */
function sortFields<T extends Schema<F>, F extends Field>(
  binder: Binder<T, F>,
  visitedSchemas: Set<string>,
): (a: Field, b: Field) => number {
  return (a: Field, b: Field) => {
    if (a.isOptional()) {
      if (!b.isOptional()) {
        return 1;
      }
    }

    const aSize = getTypeSize(binder, visitedSchemas, a.type);
    const bSize = getTypeSize(binder, visitedSchemas, b.type);
    if (aSize === DYNAMIC_SIZE) {
      if (bSize !== DYNAMIC_SIZE) {
        return 1;
      }
    }

    if (a.type.id === b.type.id) {
      if (a.type.id === "varint") {
        if (a.type.signed) {
          if (!(b.type as VarIntType).signed) {
            return 1;
          }
        }
      } else if (a.type.id === "int") {
        if (a.type.signed) {
          if (!(b.type as IntType).signed) {
            return 1;
          }
        }
        return (b.type as IntType).size - a.type.size;
      } else if (a.type.id === "float") {
        return (b.type as FloatType).size - a.type.size;
      }

      return 0;
    }

    if (a.type.id === "map") {
      return 1;
    }

    if (a.type.id === "array") {
      if (b.type.id === "map") {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "union") {
      if (
        b.type.id === "map" ||
        b.type.id === "array"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "schema") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "ascii") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "utf8") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema" ||
        b.type.id === "ascii"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "bytes") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema" ||
        b.type.id === "ascii" ||
        b.type.id === "utf8"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "varint") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema" ||
        b.type.id === "ascii" ||
        b.type.id === "utf8" ||
        b.type.id === "bytes"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "float") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema" ||
        b.type.id === "ascii" ||
        b.type.id === "utf8" ||
        b.type.id === "bytes" ||
        b.type.id === "varint"
      ) {
        return -1;
      }
      return 1;
    }

    if (a.type.id === "int") {
      if (
        b.type.id === "map" ||
        b.type.id === "array" ||
        b.type.id === "union" ||
        b.type.id === "schema" ||
        b.type.id === "ascii" ||
        b.type.id === "utf8" ||
        b.type.id === "bytes" ||
        b.type.id === "varint" ||
        b.type.id === "float"
      ) {
        return -1;
      }
      return 1;
    }

    // BoolType
    return -1;
  };
}

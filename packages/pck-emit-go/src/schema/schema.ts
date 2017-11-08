import { capitalizeTransformer } from "osh-text";
import { Schema, Field } from "pck";
import { convertToGoType } from "./type";
import { GoField, GoFieldTransformer } from "./field";

export class GoSchema extends Schema<GoField> {
  readonly struct: string;
  readonly self: string;
  readonly factory: string;

  constructor(id: string, fields: GoField[], struct: string, self: string, factory: string) {
    super(id, fields);
    this.struct = struct;
    this.self = self;
    this.factory = factory;
  }
}

export interface GoSchemaTransformOptions {
  readonly struct?: string;
  readonly self?: string;
  readonly factory?: string;
  readonly fields?: GoFieldTransformer | GoFieldTransformer[];
}

export function transformGoSchema(schema: GoSchema, options: GoSchemaTransformOptions): GoSchema {
  const struct = options.struct === undefined ? schema.id : options.struct;
  const self = options.self === undefined ? schema.self : options.self;
  const factory = options.factory === undefined ? schema.factory : options.factory;

  let fields = schema.fields;
  if (options.fields !== undefined) {
    if (typeof options.fields === "function") {
      fields = fields.map(options.fields);
    } else {
      for (const fn of options.fields) {
        fields = fields.map(fn);
      }
    }
  }

  return new GoSchema(
    schema.id,
    fields,
    struct,
    self,
    factory,
  );
}

export function convertToGoSchema(schema: Schema<Field>): GoSchema {
  return new GoSchema(
    schema.id,
    schema.fields.map(convertToGoField),
    schema.id,
    schema.id.toLowerCase(),
    `&${schema.id}{}`,
  );
}

function convertToGoField(field: Field): GoField {
  return new GoField(
    convertToGoType(field.type),
    capitalizeTransformer(field.name),
    field.flags,
    0,
  );
}

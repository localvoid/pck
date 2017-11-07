import { capitalizeTransformer } from "osh-text";
import { Schema, Field } from "pck";
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

export interface GoSchemaOptions {
  readonly schema: Schema<Field>;
  readonly struct?: string;
  readonly self?: string;
  readonly factory?: string;
  readonly fields?: GoFieldTransformer | GoFieldTransformer[];
}

export function goSchema(options: GoSchemaOptions): GoSchema {
  const schema = options.schema;
  const struct = options.struct === undefined ? schema.id : options.struct;
  const self = options.self === undefined ? struct.toLowerCase() : options.self;
  const factory = options.factory === undefined ? `&${struct}{}` : options.factory;

  let fields = schema.fields.map(goFieldTransformer);
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

function goFieldTransformer(field: Field): GoField {
  return new GoField(
    field.type,
    capitalizeTransformer(field.name),
    field.flags,
    0,
  );
}

import { capitalizeTransformer } from "osh-text";
import { Schema, Field, FieldFlags, Type } from "pck";

export type GoFieldTransformer = (field: GoField) => GoField;

export const enum GoFieldFlags {
  Skip = 1,
  Embed = 1 << 1,
}

export class GoField<T extends Type = Type> extends Field<T> {
  readonly gFlags: GoFieldFlags;

  constructor(type: T, name: string, flags: FieldFlags, gFlags: GoFieldFlags) {
    super(type, name, flags);
    this.gFlags = gFlags;
  }
}

export function skip<T extends Type>(field: GoField<T>): GoField<T> {
  return new GoField<T>(field.type, field.name, field.flags, field.gFlags | GoFieldFlags.Skip);
}

export function embed<T extends Type>(field: GoField<T>): GoField<T> {
  return new GoField<T>(field.type, field.name, field.flags, field.gFlags | GoFieldFlags.Embed);
}

export class GoSchema extends Schema<GoField> {
  readonly struct: string;
  readonly self: string;
  readonly factory: string;

  constructor(id: symbol, fields: GoField[], struct: string, self: string, factory: string) {
    super(id, fields);
    this.struct = struct;
    this.self = self;
    this.factory = factory;
  }
}

export interface GoSchemaOptions {
  readonly schema: Schema<Field>;
  readonly struct: string;
  readonly self?: string;
  readonly factory?: string;
  readonly fields?: GoFieldTransformer | GoFieldTransformer[];
}

export function goSchema(options: GoSchemaOptions): GoSchema {
  const schema = options.schema;
  const struct = options.struct;
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

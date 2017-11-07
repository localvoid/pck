import { Field, FieldFlags, Type } from "pck";

export const enum GoFieldFlags {
  Skip = 1,
  Ref = 1 << 1,
}

export class GoField<T extends Type = Type> extends Field<T> {
  readonly goFlags: GoFieldFlags;

  constructor(type: T, name: string, flags: FieldFlags, goFlags: GoFieldFlags) {
    super(type, name, flags);
    this.goFlags = goFlags;
  }
}

export type GoFieldTransformer = (field: GoField) => GoField;

export function skip<T extends Type>(field: GoField<T>): GoField<T> {
  return new GoField<T>(field.type, field.name, field.flags, field.goFlags | GoFieldFlags.Skip);
}

export function ref<T extends Type>(field: GoField<T>): GoField<T> {
  return new GoField<T>(field.type, field.name, field.flags, field.goFlags | GoFieldFlags.Ref);
}

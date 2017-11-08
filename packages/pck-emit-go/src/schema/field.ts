import { Field, FieldFlags } from "pck";
import { GoType } from "./type";

export const enum GoFieldFlags {
  Skip = 1,
}

export class GoField<T extends GoType = GoType> extends Field<T> {
  readonly goFlags: GoFieldFlags;

  constructor(type: T, name: string, flags: FieldFlags, goFlags: GoFieldFlags) {
    super(type, name, flags);
    this.goFlags = goFlags;
  }
}

export type GoFieldTransformer = (field: GoField) => GoField;

export interface GoFieldTransformOptions {
  readonly name?: string;
  readonly type?: (type: GoType) => GoType;
  readonly skip?: boolean;
}

export function transformGoField(field: GoField, options: GoFieldTransformOptions): GoField {
  let name = field.name;
  let type: GoType = field.type;
  let goFlags = field.goFlags;

  if (options.name !== undefined) {
    name = options.name;
  }

  if (options.type !== undefined) {
    type = options.type(type);
  }

  if (options.skip !== undefined) {
    if (options.skip) {
      goFlags |= GoFieldFlags.Skip;
    } else {
      goFlags &= ~GoFieldFlags.Skip;
    }
  }

  return new GoField(type, name, field.flags, goFlags);
}

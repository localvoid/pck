import { Context, ComponentNode, TChildren, component } from "osh";
import { capitalizeTransformer } from "osh-text";
import { line, indent, docComment, scope, declSymbol } from "osh-code";
import { ts } from "osh-code-js";
import { Field, Type } from "pck";
import {
  ARGUMENTS, OPTIONAL,
  arg, pck, getBundle, getSchema, optional, isNotEmpty, isNotEmptyString, isNotNull, isNotZero, isTrue, and, getter,
  call,
} from "./utils";

const WRITER = arg("writer");
const IS_TAGGED = arg("isTagged");

export function PckMethod(ctx: Context): TChildren {
  const bundle = getBundle(ctx);
  const schema = getSchema(ctx);
  const tag = bundle.getSchemaTag(schema);

  return scope({
    type: ARGUMENTS,
    symbols: [
      declSymbol("writer", "writer"),
      declSymbol("isTagged", "isTagged"),
    ],
    children: [
      docComment(
        line("pck is an automatically generated serialization method."),
        line(),
        line("@param ", WRITER, " Writer object."),
        tag !== void 0 ?
          line("@param ", IS_TAGGED, " Tagged.") :
          null,
      ),
      line(
        "pck", "(",
        WRITER, ts(": ", pck("Writer")),
        tag !== void 0 ?
          [", ", IS_TAGGED, ts("?: boolean")] :
          null,
        ")", ts(": void"), " {",
      ),
      indent(
        scope({
          type: OPTIONAL,
          symbols: schema.optionalFields.map((f) => declSymbol(f, `optional${capitalizeTransformer(f.name)}`)),
          children: [
            tag !== void 0 ?
              [
                line("if ", isTrue(IS_TAGGED), " {"),
                indent(
                  line(writeUVar(tag)),
                ),
                line("}"),
              ] : null,
            schema.hasOptionalFields() ?
              schema.optionalFields.map((f) => (
                line("const ", optional(f), " = ", checkOptionalField(f), ";")),
              ) : null,
            schema.hasBitSet() ?
              [
                line(pck("writeBitSet"), "("),
                indent(
                  line(WRITER, ","),
                  schema.optionalFields.map((f) => line(optional(f), ",")),
                  schema.booleanFields.map((f) => line(isTrue(getter(f)), ",")),
                ),
                line(");"),
              ] : null,
            schema.sortedFields.map((f) => f.type.isBoolean() ?
              null :
              f.isOptional() ?
                [
                  line("if (", optional(f), ") {"),
                  indent(line(serializeField(f), ";")),
                  line("}"),
                ] :
                line(serializeField(f), ";"),
            ),
          ],
        }),
      ),
      line("}"),
    ],
  });
}

export function pckMethod(): ComponentNode<undefined> {
  return component(PckMethod);
}

function checkOptionalField(field: Field<any>): TChildren {
  if (field.isOmitNull()) {
    if (field.isOmitEmpty()) {
      if (field.type.isString()) {
        return and(isNotNull(getter(field)), isNotEmptyString(getter(field)));
      }
      return and(isNotNull(getter(field)), isNotEmpty(getter(field)));
    }
    return isNotNull(getter(field));
  }
  if (field.isOmitEmpty()) {
    if (field.type.isString()) {
      return isNotEmptyString(getter(field));
    }
    return isNotEmpty(getter(field));
  }
  if (field.isOmitZero()) {
    return isNotZero(getter(field));
  }
  throw new Error("Invalid optional field");
}

function writeI8(value: TChildren): TChildren {
  return call(pck("writeI8"), [WRITER, value]);
}

function writeI16(value: TChildren): TChildren {
  return call(pck("writeI16"), [WRITER, value]);
}

function writeI32(value: TChildren): TChildren {
  return call(pck("writeI32"), [WRITER, value]);
}

function writeF32(value: TChildren): TChildren {
  return call(pck("writeF32"), [WRITER, value]);
}

function writeF64(value: TChildren): TChildren {
  return call(pck("writeF64"), [WRITER, value]);
}

function writeIVar(value: TChildren): TChildren {
  return call(pck("writeIVar"), [WRITER, value]);
}

function writeUVar(value: TChildren): TChildren {
  return call(pck("writeUVar"), [WRITER, value]);
}

function writeUtf8(value: TChildren): TChildren {
  return call(pck("writeUtf8"), [WRITER, value]);
}

function writeAscii(value: TChildren): TChildren {
  return call(pck("writeAscii"), [WRITER, value]);
}

function writeLongFixedAscii(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeLongFixedAscii"), [WRITER, value, length]);
}

function writeBytes(value: TChildren): TChildren {
  return call(pck("writeBytes"), [WRITER, value]);
}

function writeFixedBytes(value: TChildren, length: TChildren): TChildren {
  return call(pck("writeFixedBytes"), [WRITER, value, length]);
}

function writeArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeArray"), [WRITER, value, arrayWriter]);
}

function writeFixedArray(value: TChildren, arrayWriter: TChildren): TChildren {
  return call(pck("writeFixedArray"), [WRITER, value, arrayWriter]);
}

function writeRef(value: TChildren): TChildren {
  return call([value, ".pck"], [WRITER]);
}

function arrayWriterFromType(type: Type): TChildren {
  const size = type.size;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return pck("writeIVar");
      } else {
        return pck("writeUVar");
      }
    }
    if (type.isInteger()) {
      switch (size) {
        case 1:
          return pck("writeI8");
        case 2:
          return pck("writeI16");
        case 4:
          return pck("writeI32");
        default:
          throw new Error(`Unable to emit writer callsite for a type: ${type}. Invalid size for an Int field.`);
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          return pck("writeF32");
        case 8:
          return pck("writeF64");
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${type}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return pck("writeUtf8");
    } else {
      if (type.hasDynamicSize()) {
        return pck("writeAscii");
      } else {
        if (size > 128) {
          return pck("writeLongFixedAscii");
        } else {
          return pck("writeUtf8");
        }
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return pck("writeBytes");
    } else {
      return pck("writeFixedBytes");
    }
  }
  if (type.isRef()) {
    return pck("writeObject");
  }
  if (type.isUnion()) {
    return pck("writeTaggedObject");
  }
  throw new Error("Invalid type");
}

function serializeField(field: Field<any>): TChildren {
  const type = field.type;
  const size = type.size;

  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return writeIVar(getter(field));
      } else {
        return writeUVar(getter(field));
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (size) {
          case 1:
            return writeI8(getter(field));
          case 2:
            return writeI16(getter(field));
          case 4:
            return writeI32(getter(field));
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Int field.`);
        }
      } else {
        switch (size) {
          case 1:
            return writeI8(getter(field));
          case 2:
            return writeI16(getter(field));
          case 4:
            return writeI32(getter(field));
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Uint field.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (size) {
        case 4:
          return writeF32(getter(field));
        case 8:
          return writeF64(getter(field));
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return writeUtf8(getter(field));
    } else {
      if (type.hasDynamicSize()) {
        return writeAscii(getter(field));
      } else {
        if (size > 128) {
          return writeLongFixedAscii(getter(field), size);
        } else {
          return writeUtf8(getter(field));
        }
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return writeBytes(getter(field));
    } else {
      return writeFixedBytes(getter(field), size);
    }
  }
  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return writeArray(getter(field), arrayWriterFromType(type.props.type));
    } else {
      return writeFixedArray(getter(field), arrayWriterFromType(type.props.type));
    }
  }
  if (type.isRef()) {
    return writeRef(getter(field));
  }

  throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid field type.`);
}

import { Field, Type } from "pck";
import { Context, componentFactory, ComponentNode } from "osh";
import { line, indent, comment, docComment } from "osh-code";
import { isNotEmpty, isNotNull, isTrue, call, and, v, getter, fieldToString, type } from "./utils";
import { pck } from "./modules";
import { getBundle } from "./bundle";
import { getSchema } from "./schema";

function arrayWriterType(t: Type): string {
  const s = t.size;

  if (t.isNumber()) {
    if (t.isVariadicInteger()) {
      if (t.isSignedInteger()) {
        return "writeIVar";
      } else {
        return "writeUVar";
      }
    }
    if (t.isInteger()) {
      switch (s) {
        case 1:
          return "writeI8";
        case 2:
          return "writeI16";
        case 4:
          return "writeI32";
        default:
          throw new Error(`Unable to emit writer callsite for a type: ${type}. Invalid size for an Int field.`);
      }
    }
    if (t.isFloat()) {
      switch (s) {
        case 4:
          return "writeF32";
        case 8:
          return "writeF64";
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${type}. Invalid size for a Float field.`);
      }
    }
  }
  if (t.isString()) {
    if (t.isUtf8String()) {
      return "writeUtf8";
    } else {
      if (t.hasDynamicSize()) {
        return "writeAscii";
      } else {
        if (s > 128) {
          return "writeLongFixedAscii";
        } else {
          return "writeUtf8";
        }
      }
    }
  }
  if (t.isByteArray()) {
    if (t.hasDynamicSize()) {
      return "writeBytes";
    } else {
      return "writeFixedBytes";
    }
  }
  if (t.isRef()) {
    return "writeObject";
  }
  if (t.isOneOf()) {
    return "writeTaggedObject";
  }
  throw new Error("Invalid type");
}

export const serializeField: (field: Field<any>) => ComponentNode<Field<any>>
  = componentFactory((ctx: Context, field: Field<any>) => {
    const t = field.type;
    const s = t.size;

    if (t.isNumber()) {
      if (t.isVariadicInteger()) {
        if (t.isSignedInteger()) {
          return call(pck("writeIVar"), [v("writer"), getter(field)]);
        } else {
          return call(pck("writeUVar"), [v("writer"), getter(field)]);
        }
      }
      if (t.isInteger()) {
        if (t.isSignedInteger()) {
          switch (s) {
            case 1:
              return call(pck("writeI8"), [v("writer"), getter(field)]);
            case 2:
              return call(pck("writeI16"), [v("writer"), getter(field)]);
            case 4:
              return call(pck("writeI32"), [v("writer"), getter(field)]);
            default:
              throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Int field.`);
          }
        } else {
          switch (s) {
            case 1:
              return call(pck("writeI8"), [v("writer"), getter(field)]);
            case 2:
              return call(pck("writeI16"), [v("writer"), getter(field)]);
            case 4:
              return call(pck("writeI32"), [v("writer"), getter(field)]);
            default:
              throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Uint field.`);
          }
        }
      }
      if (t.isFloat()) {
        switch (s) {
          case 4:
            return call(pck("writeF32"), [v("writer"), getter(field)]);
          case 8:
            return call(pck("writeF64"), [v("writer"), getter(field)]);
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for a Float field.`);
        }
      }
    }
    if (t.isString()) {
      if (t.isUtf8String()) {
        return call(pck("writeUtf8"), [v("writer"), getter(field)]);
      } else {
        if (t.hasDynamicSize()) {
          return call(pck("writeAscii"), [v("writer"), getter(field)]);
        } else {
          if (s > 128) {
            return call(pck("writeLongFixedAscii"), [v("writer"), getter(field), s]);
          } else {
            return call(pck("writeUtf8"), [v("writer"), getter(field), s]);
          }
        }
      }
    }
    if (t.isByteArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("writeBytes"), [v("writer"), getter(field)]);
      } else {
        return call(pck("writeFixedBytes"), [v("writer"), getter(field), s]);
      }
    }
    if (t.isArray()) {
      if (t.hasDynamicSize()) {
        return call(pck("writeArray"), [v("writer"), getter(field), pck(arrayWriterType(t.props.type))]);
      } else {
        return call(pck("writeFixedArray"), [v("writer"), getter(field), pck(arrayWriterType(t.props.type))]);
      }
    }
    if (t.isRef()) {
      return call([getter(field), ".pck"], [v("writer")]);
    }

    throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid field type.`);
  });

export const serializeBitSet = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    line(pck("writeBitSet"), "("),
    indent(
      line(v("writer"), ","),
      schema.hasOptionalFields() ?
        [
          comment("Optional Fields: "),
          schema.optionalFields.map((f) => f.isOmitEmpty() ?
            line(and(isNotNull(getter(f)), isNotEmpty(getter(f))), ", ", comment(fieldToString(f))) :
            line(isNotNull(getter(f)), ", ", comment(fieldToString(f))),
          ),
        ] : null,
      schema.hasBooleanFields() ?
        [
          comment("Boolean Fields: "),
          schema.booleanFields.map((f) => line(isTrue(getter(f)), ", ", comment(fieldToString(f)))),
        ] : null,
    ),
    line(");"),
  ];
});

export const serializeRegularFields = componentFactory((ctx: Context) => {
  const schema = getSchema(ctx);

  return [
    schema.fields.map((f) => f.type.isBoolean() ?
      null : [
        comment(fieldToString(f)),
        f.isOptional() ?
          f.isOmitEmpty() ?
            [
              line("if ", and(isNotNull(getter(f)), isNotEmpty(getter(f))), " {"),
              indent(line(serializeField(f), ";")),
              line("}"),
            ] :
            [
              line("if ", isNotNull(getter(f)), " {"),
              indent(line(serializeField(f), ";")),
              line("}"),
            ] :
          line(serializeField(f), ";"),
      ],
    ),
  ];
});

export const serializeBody = componentFactory((ctx: Context) => {
  return [
    serializeBitSet(),
    serializeRegularFields(),
  ];
});

export const serializeMethod = componentFactory((ctx: Context) => {
  const bundle = getBundle(ctx);
  const schema = getSchema(ctx);

  const shouldSupportTagging = bundle.isOneOfSchema(schema) !== undefined;

  return [
    docComment(
      line("pck is an automatically generated serialization method."),
      line(),
      line("@param ", v("writer"), " Writer object."),
      shouldSupportTagging ?
        line("@param ", v("tagged"), " Tagged.") :
        null,
    ),
    line(
      "pck", "(",
      v("writer"), type(": ", pck("Writer")),
      shouldSupportTagging ?
        [", ", v("tagged"), type("?: boolean")] :
        null,
      ")", type(": void"), " {",
    ),
    indent(serializeBody()),
    line("}"),
  ];
});

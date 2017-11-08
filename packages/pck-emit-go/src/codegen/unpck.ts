import { TChildren, TNode, zone } from "osh";
import { docComment, line, indent, declSymbol } from "osh-code";
import { DYNAMIC_SIZE, TypeFlags, Type, SchemaSize, SchemaDetails } from "pck";
import {
  declArgs, declVars, SELF, BUF, v, boundCheckHint, callFunc, callMethod, Value,
  castToInt8, castToInt16, castToInt32, castToFloat, castToDouble, castToString,
} from "./utils";
import {
  InlineReadIntOptions, inlineReadUint8, inlineReadUint16, inlineReadUint32, inlineReadUint64, readIvar, readUvar,
} from "./lib";
import { GoField, GoSchema, GoBinder } from "../schema";

const OFFSET = v("offset");
const LENGTH = v("length");
const VALUE = v("value");
const SIZE = v("size");
const TAG = v("tag");
const I = v("i");

function BIT_STORE(i: number): TChildren {
  return v(`bitStore${i}`);
}

export function unpckMethod(binder: GoBinder, schema: GoSchema): TNode {
  const details = binder.getSchemaDetails(schema);

  const bitStoreVars = [];
  for (let i = 0; i < details.size.bitStoreSize; i++) {
    bitStoreVars.push(`bitStore${i}`);
  }

  return (
    zone(`unpckMethod(${schema.struct})`,
      declArgs(
        [
          declSymbol("self", schema.self),
          declSymbol("buf", "b"),
        ],
        declVars(
          [
            ...bitStoreVars,
            "offset",
            "length",
            "value",
            "size",
            "tag",
            "i",
          ],
          [
            docComment(
              line("Unpck is an automatically generated method for PCK deserialization."),
            ),
            line("func (", SELF(), " *", schema.struct, ") Unpck(", BUF.value, " []byte) int {"),
            indent(
              (details.size.fixedSize > 1) ?
                boundCheckHint(details.size.fixedSize - 1) :
                null,
              readBitStore(schema, details.size),
              readFields(binder, schema, details),
              line("return ", details.size.dynamic ? OFFSET : details.size.fixedSize),
            ),
            line("}"),
          ],
        ),
      ),
    )
  );
}

export function taggedFactories(binder: GoBinder): TChildren {
  const factories: TChildren = [];

  binder.schemaTags.forEach((tag, id) => {
    factories.push("func () Pcker { return ", binder.findSchemaById(id).factory, " }");
  });

  return [
    line("var taggedFactories", " = [", factories.length, "]func() unpcker {"),
    indent(factories),
    line("}"),
  ];
}

function readBitStore(schema: GoSchema, size: SchemaSize): TChildren {
  const r = [];
  for (let i = 0; i < size.bitStoreSize; i++) {
    r.push(line(BIT_STORE(i), " := ", BUF.at(i)));
  }
  return r;
}

function readFields(binder: GoBinder, schema: GoSchema, details: SchemaDetails<GoSchema, GoField>): TChildren {
  const r = [];
  if (details.bitStore.length > 0) {
    if (details.bitStore.length === 1) {
      if (details.bitStore.booleans.length === 1) {
        const bitField = details.bitStore.booleans[0];
        r.push(line(SELF(bitField.field.name), " = ", BIT_STORE(0), " != 0"));
      }
    } else {
      for (const bitField of details.bitStore.booleans) {
        const index = bitField.index % 8;
        r.push(line(SELF(bitField.field.name), " = ", BIT_STORE(bitField.offset), "&(1<<", index, ") != 0"));
      }
    }
  }

  let offset = details.size.bitStoreSize;
  for (const field of details.fixedFields) {
    r.push(readFixedType(
      binder,
      field.type,
      BUF,
      new Value(SELF(field.name)),
      offset,
    ));
    offset += binder.getTypeSize(field.type);
  }

  if (details.size.dynamic) {
    r.push(line(OFFSET, " := ", offset));

    for (const field of details.dynamicFields) {
      r.push(readDynamicType(
        binder,
        field.type,
        BUF,
        new Value(SELF(field.name)),
      ));
    }
  }

  return r;
}

function readFixedType(
  binder: GoBinder,
  type: Type,
  from: Value,
  to: Value,
  offset: number,
  start?: TChildren,
): TChildren {
  const size = binder.getTypeSize(type);
  switch (type.id) {
    case "int":
    case "float": {
      const opts: InlineReadIntOptions = {
        from: from,
        to: to,
        offset: offset,
        start: start,
        cast: undefined,
      };
      if (type.id === "int") {
        switch (size) {
          case 1:
            return inlineReadUint8(type.signed ? { ...opts, ...{ cast: castToInt8 } } : opts);
          case 2:
            return inlineReadUint16(type.signed ? { ...opts, ...{ cast: castToInt16 } } : opts);
          case 4:
            return inlineReadUint32(type.signed ? { ...opts, ...{ cast: castToInt32 } } : opts);
          default:
            throw new Error(`Invalid int size: ${size}.`);
        }
      } else {
        switch (size) {
          case 4:
            opts.cast = castToFloat;
            return inlineReadUint32(opts);
          case 8:
            opts.cast = castToDouble;
            return inlineReadUint64(opts);
          default:
            throw new Error(`Invalid float size ${size}.`);
        }
      }
    }
    case "bytes":
      return line(to.assign(from.slice({
        start: start,
        end: start,
        startOffset: offset,
        endOffset: offset + size,
      })));
    case "string":
      return line(to.assign(castToString(from.slice({
        start: start,
        end: start,
        startOffset: offset,
        endOffset: offset + size,
      }))));
    case "array":
      const valueSize = binder.getTypeSize(type.valueType);
      if (type.length > 4) {
        return [
          line(
            "for ", I, ", ", OFFSET, " := 0, ", offset, "; ",
            I, " < ", type.length, "; ",
            I, ", ", OFFSET, " = ", I, " + 1, ", OFFSET, " + ", valueSize, " {",
          ),
          indent(
            readFixedType(
              binder,
              type.valueType,
              from,
              new Value(to.at(0, I)),
              0,
              OFFSET,
            ),
          ),
          line("}"),
        ];
      } else {
        const r = [];
        for (let i = 0; i < type.length; i++) {
          r.push(readFixedType(binder, type.valueType, from, new Value(to.at(i)), offset + (i * valueSize)));
        }
        return r;
      }
    case "schema":
      if ((type.flags & TypeFlags.Nullable) === 0) {
        return line(callMethod(to.value, "Unpck", [from.slice({ start: start, startOffset: offset })]));
      } else {
        return [
          line("{"),
          indent(
            line(VALUE, " := ", binder.findSchemaById(type.schemaId).factory),
            line(callMethod(VALUE, "Unpck", [from.slice({ start: start, startOffset: offset })])),
            line(to.assign(VALUE)),
          ),
          line("}"),
        ];
      }
  }

  throw new Error(`Invalid fixed type: ${type}.`);
}

function readDynamicType(
  binder: GoBinder,
  type: Type,
  from: Value,
  to: Value,
): TChildren {
  switch (type.id) {
    case "varint":
      if (type.signed) {
        return [
          line("{"),
          indent(
            line(VALUE, ", ", SIZE, " := ", readIvar(from.slice({ start: OFFSET }))),
            line(to.assign(VALUE)),
            line(OFFSET, " += ", SIZE),
          ),
          line("}"),
        ];
      } else {
        return [
          line("{"),
          indent(
            line(VALUE, ", ", SIZE, " := ", readUvar(from.slice({ start: OFFSET }))),
            line(to.assign(VALUE)),
            line(OFFSET, " += ", SIZE),
          ),
          line("}"),
        ];
      }
    case "bytes":
      return [
        line("{"),
        indent(
          line(LENGTH, ", ", SIZE, " := ", readUvar(from.slice({ start: OFFSET }))),
          line(OFFSET, " += ", SIZE),
          line(to.assign(from.slice({ start: OFFSET, end: [OFFSET, " + ", LENGTH] }))),
          line(OFFSET, " += ", LENGTH),
        ),
        line("}"),
      ];
    case "string":
      return [
        line("{"),
        indent(
          line(LENGTH, ", ", SIZE, " := ", readUvar(from.slice({ start: OFFSET }))),
          line(OFFSET, " += ", SIZE),
          line(to.assign(castToString(from.slice({ start: OFFSET, end: [OFFSET, " + ", LENGTH] })))),
          line(OFFSET, " += ", LENGTH),
        ),
        line("}"),
      ];
    case "array":
      const valueSize = binder.getTypeSize(type.valueType);
      if (type.length === 0) {
        return [
          line("{"),
          indent(
            line(LENGTH, ", ", SIZE, " := ", readUvar(from.slice({ start: OFFSET }))),
            line(OFFSET, " += ", SIZE),
            line(VALUE, " := ", callFunc("make", [goType(binder, type)])),
            line(to.assign(VALUE)),
            line("for ", I, " := 0; ", I, " < ", LENGTH, "; ", I, " += 1 {"),
            indent(
              (valueSize === DYNAMIC_SIZE)
                ? readDynamicType(
                  binder,
                  type.valueType,
                  from,
                  new Value([VALUE, "[", I, "]"]),
                )
                : readFixedType(
                  binder,
                  type.valueType,
                  from,
                  new Value([VALUE, "[", I, "]"]),
                  0,
                  OFFSET,
                ),
            ),
            line("}"),
          ),
          line("}"),
        ];
      } else {
        return [
          line("for ", I, " := 0; ", I, " < ", type.length, "; ", I, " += 1 {"),
          indent(
            readDynamicType(
              binder,
              type.valueType,
              from,
              new Value(to.at(0, I)),
            ),
          ),
          line("}"),
        ];
      }
    case "map":
      break;
    case "schema":
      if ((type.flags & TypeFlags.Nullable) === 0) {
        return line(OFFSET, " += ", callMethod(to.value, "Unpck", [from.slice({ start: OFFSET })]));
      } else {
        return [
          line("{"),
          indent(
            line(VALUE, " := ", binder.findSchemaById(type.schemaId).factory),
            line(LENGTH, " := ", callMethod(VALUE, "Unpck(", [from.slice({ start: OFFSET })])),
            line(OFFSET, " += ", LENGTH),
          ),
          line("}"),
        ];
      }
    case "union":
      return [
        line("{"),
        indent(
          line(TAG, ", ", SIZE, " := ", readUvar(from.slice({ start: OFFSET }))),
          line(OFFSET, " += ", SIZE),
          line(VALUE, " := ", "taggedFactories[", TAG, "]()"),
          line(LENGTH, " := ", callMethod(VALUE, "Unpck(", [from.slice({ start: OFFSET })])),
          line(OFFSET, " += ", LENGTH),
        ),
        line("}"),
      ];
  }

  throw new Error(`Invalid dynamic type: ${type}`);
}

function goType(binder: GoBinder, type: Type): string {
  switch (type.id) {
    case "bool":
      return "bool";
    case "int":
      switch (type.size) {
        case 1:
          return type.signed ? "int8" : "uint8";
        case 2:
          return type.signed ? "int16" : "uint16";
        case 4:
          return type.signed ? "int32" : "uint32";
        case 8:
          return type.signed ? "int64" : "uint64";
      }
    case "float":
      switch (type.size) {
        case 4:
          return "float";
        case 8:
          return "double";
      }
    case "varint":
      return type.signed ? "int64" : "uint64";
    case "bytes":
      return "[]byte";
    case "string":
      return "string";
    case "array":
      return "[]" + goType(binder, type.valueType);
    case "map":
      return `map[${goType(binder, type.keyType)}]${goType(binder, type.valueType)}`;
    case "schema":
      return ((type.flags & TypeFlags.Nullable) !== 0 ? "*" : "") + binder.findSchemaById(type.schemaId).struct;
    case "union":
      return "unpcker";
  }
}

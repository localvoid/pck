import { Bundle, Schema, Field, Type } from "pck";

export function emitImports(bundle: Bundle): string {
  return `import * as __pck from "pck-browser";\n`;
}

export function emitWriter(field: Field): string {
  const type = field.type;
  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return `__pck.writeIVar(__w, __v.${field.name})`;
      } else {
        return `__pck.writeUVar(__w, __v.${field.name})`;
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (type.size) {
          case 1:
            return `__pck.writeI8(__w, __v.${field.name})`;
          case 2:
            return `__pck.writeI16(__w, __v.${field.name})`;
          case 4:
            return `__pck.writeI32(__w, __v.${field.name})`;
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Int field.`);
        }
      } else {
        switch (type.size) {
          case 1:
            return `__pck.writeI8(__w, __v.${field.name})`;
          case 2:
            return `__pck.writeI16(__w, __v.${field.name})`;
          case 4:
            return `__pck.writeI32(__w, __v.${field.name})`;
          default:
            throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for an Uint field.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (type.size) {
        case 4:
          return `__pck.writeF32(__w, __v.${field.name})`;
        case 8:
          return `__pck.writeF64(__w, __v.${field.name})`;
        default:
          throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return `__pck.writeUtf8(__w, __v.${field.name})`;
    } else {
      if (type.hasDynamicSize()) {
        return `__pck.writeAscii(__w, __v.${field.name})`;
      } else {
        return `__pck.writeFixedUtf8(__w, __v.${field.name}, ${type.size})`;
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return `__pck.writeBytes(__w, __v.${field.name})`;
    } else {
      return `__pck.writeFixedBytes(__w, __v.${field.name}, ${type.size})`;
    }
  }
  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return `__pck.writeArray(__w, __v.${field.name})`;
    } else {
      return `__pck.writeFixedArray(__w, __v.${field.name}, ${type.props.length})`;
    }
  }
  if (type.isRef()) {
    return `write${type.props.name}(__w, __v.${field.name})`;
  }

  throw new Error(`Unable to emit writer callsite for a field: ${field}. Invalid field type.`);
}

export function emitReader(field: Field): string {
  const type = field.type;
  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return `__pck.readIVar(__b)`;
      } else {
        return `__pck.readUVar(__b)`;
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        switch (type.size) {
          case 1:
            return `__pck.readI8(__b)`;
          case 2:
            return `__pck.readI16(__b)`;
          case 4:
            return `__pck.readI32(__b)`;
          default:
            throw new Error(`Unable to emit read callsite for a field: ${field}. Invalid size for an Int field.`);
        }
      } else {
        switch (type.size) {
          case 1:
            return `__pck.readU8(__b)`;
          case 2:
            return `__pck.readU16(__b)`;
          case 4:
            return `__pck.readU32(__b)`;
          default:
            throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for an Uint field.`);
        }
      }
    }
    if (type.isFloat()) {
      switch (type.size) {
        case 4:
          return `__pck.readF32(__b)`;
        case 8:
          return `__pck.readF64(__b)`;
        default:
          throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid size for a Float field.`);
      }
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return `__pck.readUtf8(__b)`;
    } else {
      if (type.hasDynamicSize()) {
        return `__pck.readUtf8(__b)`;
      } else {
        return `__pck.readFixedUtf8(__b)`;
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return `__pck.readBytes(__b)`;
    } else {
      return `__pck.readFixedBytes(__b)`;
    }
  }
  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return `__pck.readArray(__b)`;
    } else {
      return `__pck.readFixedArray(__b)`;
    }
  }
  if (type.isRef()) {
    return `read${type.props.name}(__b)`;
  }

  throw new Error(`Unable to emit reader callsite for a field: ${field}. Invalid field type.`);
}

export function emitWriteBody(schema: Schema): string {
  let result = "";

  // BitSet
  if (schema.hasBitSet()) {
    result += `__pck.writeBitSet(__w,\n`;
    if (schema.hasOptionalFields()) {
      result += `\n${comment("Optional Fields:", true)}\n`;
      for (const field of schema.details.optionalFields) {
        if (field.isOmitEmpty()) {
          result += `__v.${field.name} !== null && __v.${field.name}.length > 0,`;
        } else {
          result += `__v.${field.name} !== null,`;
        }
        result += comment(fieldToString(field)) + "\n";
      }
    }
    if (schema.hasBooleanFields()) {
      result += `\n${comment("Boolean Fields:", true)}\n`;
      for (const field of schema.details.booleanFields) {
        result += `__v.${field.name} === true, ${comment(fieldToString(field))}\n`;
      }
    }
    result += `);\n\n`;
  }

  if (schema.hasRegularFields()) {
    result += comment("Regular Fields:", true) + "\n";
    for (const field of schema.fields) {
      if (!field.type.isBoolean()) {
        result += comment(fieldToString(field), true) + "\n";
        if (field.isOptional()) {
          if (field.isOmitEmpty()) {
            result += `if (__v.${field.name} !== null && __v.${field.name}.length > 0) {\n`;
          } else {
            result += `if (__v.${field.name} !== null) {\n`;
          }
          result += emitWriter(field) + ";\n";
          result += `}\n\n`;
        } else {
          result += emitWriter(field) + ";\n\n";
        }
      }
    }
  }

  return result;
}

export function emitWriteFunction(schema: Schema): string {
  return `export function write${schema.name}(__w, __v) {${emitWriteBody(schema)}}`;
}

export function emitReadBodyFunction(schema: Schema): string {
  let result = "";

  // BitSet
  if (schema.hasBitSet()) {
    result += comment("BitSet:", true) + "\n";
    let bitSetSize = schema.bitSetSize();
    let i = 0;
    while (bitSetSize > 0) {
      if (bitSetSize > 3) {
        result += `const bitSet${i} = __pck.readU32(__b);\n`;
        bitSetSize -= 4;
      } else if (bitSetSize > 1) {
        result += `const bitSet${i} = __pck.readU16(__b);\n`;
        bitSetSize -= 2;
      } else {
        result += `const bitSet${i} = __pck.readU8(__b);\n`;
        bitSetSize -= 1;
      }
      ++i;
    }
    result += "\n";

    if (schema.hasBooleanFields()) {
      result += comment("Boolean Fields:", true) + "\n";
      for (const field of schema.details.booleanFields) {
        const b = schema.booleanBitSetIndex(field);
        result += comment(fieldToString(field), true) + "\n";
        result += `const ${field.name} = `;
        if (field.isOptional()) {
          const ob = schema.optionalBitSetIndex(field);
          result += `(bitSet${ob.index} & (1 << ${ob.position})) !== 0 ? `;
          if (b.position === 0) {
            result += `(bitSet${b.index} & 1) !== 0`;
          } else {
            result += `(bitSet${b.index} & (1 << ${b.position})) !== 0`;
          }
          result += ` : null;\n`;
        } else {
          if (b.position === 0) {
            result += `(bitSet${b.index} & 1) !== 0;\n`;
          } else {
            result += `(bitSet${b.index} & (1 << ${b.position})) !== 0;\n`;
          }
        }
        i++;
      }
      result += "\n";
    }
  }

  if (schema.hasRegularFields()) {
    result += comment("Regular Fields:", true) + "\n";
    for (const field of schema.fields) {
      if (!field.type.isBoolean()) {
        result += comment(fieldToString(field), true) + "\n";
        result += `const ${field.name} = `;
        if (field.isOptional()) {
          const ob = schema.optionalBitSetIndex(field);
          result += `((bitSet${ob.index} & (1 << ${ob.position})) !== 0) ? `;
          result += emitReader(field);
          result += ` : null;\n\n`;
        } else {
          result += emitReader(field) + ";\n\n";
        }
      }
    }
  }

  result += `return new ${schema.name}(${schema.fields.map((f) => f.name).join(", ")});\n`;

  return result;
}

export function emitReadFunction(schema: Schema): string {
  return `export function read${schema.name}(__b) {${emitReadBodyFunction(schema)}}`;
}

function typeToString(type: Type): string {
  if (type.isBoolean()) {
    return `bool`;
  }
  if (type.isNumber()) {
    if (type.isVariadicInteger()) {
      if (type.isSignedInteger()) {
        return `ivar`;
      } else {
        return `uvar`;
      }
    }
    if (type.isInteger()) {
      if (type.isSignedInteger()) {
        return `i${type.size * 8}`;
      } else {
        return `u${type.size * 8}`;
      }
    }
    if (type.isFloat()) {
      return `f${type.size * 8}`;
    }
  }
  if (type.isString()) {
    if (type.isUtf8String()) {
      return `utf8`;
    } else {
      if (type.hasDynamicSize()) {
        return `ascii`;
      } else {
        return `ascii[${type.size}]`;
      }
    }
  }
  if (type.isByteArray()) {
    if (type.hasDynamicSize()) {
      return `bytes`;
    } else {
      return `bytes[${type.size}]`;
    }
  }
  if (type.isArray()) {
    if (type.hasDynamicSize()) {
      return `array`;
    } else {
      return `array[${type.props.length}]`;
    }
  }
  if (type.isRef()) {
    return `ref[${type.props.name}]`;
  }
  return `UNKNOWN`;
}

function fieldToString(field: Field): string {
  let type = typeToString(field.type);
  if (field.isOptional()) {
    type = `optional(${type})`;
  }
  if (field.isOmitEmpty()) {
    type = `omitEmpty(${type})`;
  }
  return `${field.name}: ${type}`;
}

function comment(s: string, singleLine = false): string {
  if (singleLine) {
    return `// ${s}`;
  }
  return `/* ${s} */`;
}

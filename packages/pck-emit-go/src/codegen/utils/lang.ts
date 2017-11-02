import { TChildren } from "osh";
import { intersperse } from "osh-text";

export function callMethod(obj: TChildren, method: TChildren, args?: TChildren[]): TChildren {
  if (args === void 0) {
    return [obj, ".", method, "()"];
  }
  return [obj, ".", method, "(", intersperse(args, ","), ")"];
}

export function callFunc(func: TChildren, args?: TChildren[]): TChildren {
  if (args === void 0) {
    return [func, "()"];
  }
  return [func, "(", intersperse(args, ", "), ")"];
}

export function len(...children: TChildren[]): TChildren {
  return callFunc("len", [children]);
}

export function isNotNil(...children: TChildren[]): TChildren {
  return [children, " != nil"];
}

export function isTrue(...children: TChildren[]): TChildren {
  return children;
}

export function castTo(to: TChildren, value: TChildren): TChildren {
  return [to, "(", value, ")"];
}

export function castToByte(...children: TChildren[]): TChildren {
  return castTo("byte", children);
}

export function castToUint8(...children: TChildren[]): TChildren {
  return castTo("uint8", children);
}

export function castToUint16(...children: TChildren[]): TChildren {
  return castTo("uint16", children);
}

export function castToUint32(...children: TChildren[]): TChildren {
  return castTo("uint32", children);
}

export function castToUint64(...children: TChildren[]): TChildren {
  return castTo("uint64", children);
}

export function castToInt8(...children: TChildren[]): TChildren {
  return castTo("int8", children);
}

export function castToInt16(...children: TChildren[]): TChildren {
  return castTo("int16", children);
}

export function castToInt32(...children: TChildren[]): TChildren {
  return castTo("int32", children);
}

export function castToInt64(...children: TChildren[]): TChildren {
  return castTo("int64", children);
}

export function castToFloat(...children: TChildren[]): TChildren {
  return castTo("float", children);
}

export function castToDouble(...children: TChildren[]): TChildren {
  return castTo("double", children);
}

export function castToString(...children: TChildren[]): TChildren {
  return castTo("string", children);
}

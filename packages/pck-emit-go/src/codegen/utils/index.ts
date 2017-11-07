export { calcVarUintSize } from "./varint";
export {
  callMethod, callFunc,
  len,
  isNotNil, isTrue,
  castTo, castToByte, castToUint8, castToUint16, castToUint32, castToUint64, castToInt8, castToInt16, castToInt32,
  castToInt64, castToFloat, castToDouble, castToString,
  Value, SELF, BUF, boundCheckHint,
} from "./lang";
export { declInternal, declArgs, declVars, internal, arg, v } from "./symbols";

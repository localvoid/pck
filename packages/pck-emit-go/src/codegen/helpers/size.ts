import { TChildren } from "osh";
import { line, indent } from "osh-code";

export function sizeUvar(): TChildren {
  return [
    line("func sizeUVar(x uint64) (n int) {"),
    indent(
      line("for {"),
      indent(
        line("n++"),
        line("x >>= 7"),
        line("if x == 0 {"),
        indent(
          line("return"),
        ),
        line("}"),
      ),
      line("}"),
    ),
    line("}"),
  ];
}

export function sizeIvar(): TChildren {
  return [
    line("func sizeIVar(x uint64) int {"),
    indent(
      line("return sizeUVar(uint64((x << 1) ^ uint64((int64(x) >> 63))))"),
    ),
    line("}"),
  ];
}

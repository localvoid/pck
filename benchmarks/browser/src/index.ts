import { pckDecodeBasic, pckEncodeBasic, jsonDecodeBasic, jsonEncodeBasic } from "./basic";
import { pckDecodeMixed, pckEncodeMixed, jsonDecodeMixed, jsonEncodeMixed } from "./mixed";
import {
  pckDecodeUTF1k, pckDecodeUTF20k, pckDecodeUTF32, pckDecodeUTF8, pckEncodeUTF1k, pckEncodeUTF20k, pckEncodeUTF32,
  pckEncodeUTF8,

  pckDecodeASCII1k, pckDecodeASCII20k, pckDecodeASCII32, pckDecodeASCII8, pckEncodeASCII8, pckEncodeASCII1k,
  pckEncodeASCII20k, pckEncodeASCII32,

  jsonDecodeUTF1k, jsonDecodeUTF20k, jsonDecodeUTF32, jsonDecodeUTF8, jsonEncodeUTF1k, jsonEncodeUTF20k,
  jsonEncodeUTF32, jsonEncodeUTF8,
} from "./string";
import { DECODE_STRING_EXPERIMENTS, ENCODE_STRING_EXPERIMENTS } from "./experiments/string";
import { pckDecodeHN, pckEncodeHN, jsonDecodeHN, jsonEncodeHN, hnReady } from "./hn";
import * as __pck from "pck-browser";

declare global {
  interface Window {
    Benchmark: any;
  }
}

declare global {
  interface Window {
    Benchmark: any;
  }
}

const results = document.getElementById("results")!;

function printResult(s: string): void {
  const div = document.createElement("div");
  div.textContent = s;
  results.appendChild(div);
}

function bench(names: string[], fns: Array<() => void>): void {
  const b = new window["Benchmark"]["Suite"]()
  ["on"]("cycle", function (e: any) {
    printResult(String(e.target));
  });

  for (let i = 0; i < names.length; i++) {
    b["add"](names[i], fns[i]);
  }

  b["run"]({ "async": true });
}

function add(name: string, names: string[], fns: Array<() => void>) {
  document.getElementById(name)!.addEventListener("click", (e) => {
    e.preventDefault();
    bench(names.map((n) => `${name}:${n}`), fns);
  });
}

add("encodeBasic", ["PCK", "JSON"], [pckEncodeBasic, jsonEncodeBasic]);
add("encodeMixed", ["PCK", "JSON"], [pckEncodeMixed, jsonEncodeMixed]);
add("encodeUTF20k", ["PCK", "JSON"], [pckEncodeUTF20k, jsonEncodeUTF20k]);
add("encodeUTF1k", ["PCK", "JSON"], [pckEncodeUTF1k, jsonEncodeUTF1k]);
add("encodeUTF32", ["PCK", "JSON"], [pckEncodeUTF32, jsonEncodeUTF32]);
add("encodeUTF8", ["PCK", "JSON"], [pckEncodeUTF8, jsonEncodeUTF8]);
add("encodeASCII20k", ["PCK", "JSON"], [pckEncodeASCII20k, jsonEncodeUTF20k]);
add("encodeASCII1k", ["PCK", "JSON"], [pckEncodeASCII1k, jsonEncodeUTF1k]);
add("encodeASCII32", ["PCK", "JSON"], [pckEncodeASCII32, jsonEncodeUTF32]);
add("encodeASCII8", ["PCK", "JSON"], [pckEncodeASCII8, jsonEncodeUTF8]);

add("decodeBasic", ["PCK", "JSON"], [pckDecodeBasic, jsonDecodeBasic]);
add("decodeMixed", ["PCK", "JSON"], [pckDecodeMixed, jsonDecodeMixed]);
add("decodeUTF20k", ["PCK", "JSON"], [pckDecodeUTF20k, jsonDecodeUTF20k]);
add("decodeUTF1k", ["PCK", "JSON"], [pckDecodeUTF1k, jsonDecodeUTF1k]);
add("decodeUTF32", ["PCK", "JSON"], [pckDecodeUTF32, jsonDecodeUTF32]);
add("decodeUTF8", ["PCK", "JSON"], [pckDecodeUTF8, jsonDecodeUTF8]);
add("decodeASCII20k", ["PCK", "JSON"], [pckDecodeASCII20k, jsonDecodeUTF20k]);
add("decodeASCII1k", ["PCK", "JSON"], [pckDecodeASCII1k, jsonDecodeUTF1k]);
add("decodeASCII32", ["PCK", "JSON"], [pckDecodeASCII32, jsonDecodeUTF32]);
add("decodeASCII8", ["PCK", "JSON"], [pckDecodeASCII8, jsonDecodeUTF8]);

add(
  "encodeStringExperiments",
  ENCODE_STRING_EXPERIMENTS.map((x) => x.name),
  ENCODE_STRING_EXPERIMENTS.map((x) => x.fn),
);
add(
  "decodeStringExperiments",
  DECODE_STRING_EXPERIMENTS.map((x) => x.name),
  DECODE_STRING_EXPERIMENTS.map((x) => x.fn),
);

add("encodeHN", ["PCK", "JSON"], [pckEncodeHN, jsonEncodeHN]);
add("decodeHN", ["PCK", "JSON"], [pckDecodeHN, jsonDecodeHN]);

if (__pck.utf8Decoder !== null) {
  printResult("TextDecoder detected");
}
if (__pck.utf8Encoder !== null) {
  printResult("TextEncoder detected");
}

hnReady(() => {
  printResult("HN Ready");
  let start;
  for (let i = 0; i < 3; i++) {
    start = performance.now();
    pckDecodeHN();
    printResult(`pck:decode:hn: ${performance.now() - start}`);
  }

  for (let i = 0; i < 3; i++) {
    start = performance.now();
    jsonDecodeHN();
    printResult(`json:decode:hn: ${performance.now() - start}`);
  }
});

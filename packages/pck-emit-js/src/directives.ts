/**
 * Beware of the shitty code in this file :)
 *
 * It was implemented with a pragmatic approach and huge laziness, such implementation is perfectly fine for projects
 * like this. If someone wants to rewrite it, PRs are welcome.
 *
 * The algorithm is pretty simple:
 *
 * 1. Extract directives from the source code
 *   1. Locate all lines that start with "// pck:"
 *   2. Extract first keyword after line prefix as DirectiveType
 *   3. Split arguments inside of parentheses and parse them with `JSON.parse`
 * 2. Loop through all directives
 *   - Recursively enter into block directives: `Start` and `Emit`
 *   - Create new immutable `data` objects and assign(`Object.assign`) new properties from `Assign` directive
 *   - Create new immutable `data` objects and merge(`_.merge`) new properties from `Merge` directive
 *   - Push `EmitRegion` when exiting from the `Emit` directive
 *
 * Code example:
 *
 *     // pck:assign({ schema: "MyObject" })
 *     // pck:merge({ properties: { "prop1": "renamedProp" })
 *     export class MyObject {
 *       // pck:emit("properties")
 *       // pck:end
 *
 *       // pck:emit("pck")
 *       // pck:end
 *     }
 *
 *     // pck:emit("unpck")
 *     // pck:end
 */

import { merge } from "lodash";

enum DirectiveType {
  Start = 0,
  End = 1,
  Assign = 2,
  Merge = 3,
  Emit = 4,

  Invalid = -1,
}

interface Directive {
  readonly type: DirectiveType;
  readonly arg: Array<{}> | null;
  readonly offset: string;
  readonly start: number;
  readonly end: number;
}

export interface EmitRegion<T = {}> {
  type: string;
  data: T;
  offset: string;
  start: number;
  end: number;
}

const DIRECTIVE_MATCHER = /^[ \t]*(\/\/\s+pck:(.+))$/gm;

function directiveTypeFromString(s: string): DirectiveType {
  switch (s) {
    case "start":
      return DirectiveType.Start;
    case "end":
      return DirectiveType.End;
    case "assign":
      return DirectiveType.Assign;
    case "merge":
      return DirectiveType.Merge;
    case "emit":
      return DirectiveType.Emit;
  }
  return DirectiveType.Invalid;
}

function extractDirectives(s: string): Directive[] {
  const directives = [];
  let match;
  while ((match = DIRECTIVE_MATCHER.exec(s)) !== null) {
    const fullMatch = match[0];
    const start = match.index;
    const end = start + fullMatch.length;
    const comment = match[1];
    const directive = match[2];
    const offset = fullMatch.substring(0, fullMatch.length - comment.length);

    const argStart = directive.indexOf("(");
    if (argStart !== -1) {
      const type = directiveTypeFromString(directive.substring(0, argStart));
      if (type !== DirectiveType.Invalid) {
        const argEnd = directive.lastIndexOf(")");
        if (argEnd === -1) {
          throw new Error(`Unable to find closing parenthesis in a directive "${directive}"`);
        }
        const argString = directive.substring(argStart + 1, argEnd);
        let arg;
        try {
          arg = JSON.parse(argString);
        } catch {
          throw new Error(`Unable to parse(JSON.parse) directive argument "${argString}"`);
        }
        directives.push({ type, arg, offset, start, end });
      }
    } else {
      const type = directiveTypeFromString(directive.trim());
      if (type !== DirectiveType.Invalid) {
        directives.push({ type, arg: null, offset, start, end });
      }
    }
  }

  return directives;
}

function enterEmit(
  regions: EmitRegion[],
  directives: Directive[],
  index: number,
  data: {},
  region: EmitRegion,
): number {
  while (index < directives.length) {
    const directive = directives[index++];
    switch (directive.type) {
      case DirectiveType.End:
        region.end = directive.start;
        regions.push(region);
        return index;
      default:
        throw new Error("Emit region cannot include any directives");
    }
  }
  throw new Error(`Emit region should end with "pck:end" directive`);
}

function enterScope(regions: EmitRegion[], directives: Directive[], index: number, scopes: number, data: {}): number {
  while (index < directives.length) {
    const directive = directives[index++];
    switch (directive.type) {
      case DirectiveType.Start:
        index = enterScope(regions, directives, index, scopes + 1, data);
        break;
      case DirectiveType.End:
        return index;
      case DirectiveType.Assign:
        if (directive.arg !== null) {
          if (typeof directive.arg !== "object") {
            throw new Error("Assign directive arguments should have object type");
          }
          data = { ...data, ...directive.arg };
        }
        break;
      case DirectiveType.Merge:
        if (directive.arg !== null) {
          if (typeof directive.arg !== "object") {
            throw new Error("Assign directive arguments should have object type");
          }
          data = merge({}, data, directive.arg);
        }
        break;
      case DirectiveType.Emit:
        const arg = directive.arg;
        if (arg === null || typeof arg !== "string") {
          throw new Error(`Invalid emit argument`);
        }

        index = enterEmit(
          regions,
          directives,
          index,
          data,
          {
            type: arg,
            data,
            offset: directive.offset,
            start: directive.end,
            end: -1,
          },
        );
        break;
    }
  }
  if (scopes > 0) {
    throw new Error(`All scopes should end with "pck:end" directive`);
  }
  return index;
}

export function extractRegions(s: string, data = {}): EmitRegion[] {
  const regions: EmitRegion[] = [];
  enterScope(regions, extractDirectives(s), 0, 0, data);
  return regions;
}

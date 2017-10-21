import { Bundle } from "pck";
import { extractRegions } from "./directives";
import { EmitData, emit } from "./emit";

export function inject(bundle: Bundle, s: string): string {
  let r = "";
  let start = 0;
  for (const region of extractRegions(s)) {
    r += s.substring(start, region.start);
    r += emit(bundle, region.data as EmitData, region.type, region.offset);
    start = region.end;
  }
  return r += s.substring(start);
}

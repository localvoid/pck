const KEY = Symbol("jsMeta");

export interface JSMeta {
  readonly create: string;
  readonly props: { [key: string]: string };
}

export function jsMeta(meta: JSMeta) {
  return {
    key: KEY,
    value: meta,
  };
}

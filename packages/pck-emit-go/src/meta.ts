const KEY = Symbol("goMeta");

export interface GOMeta {
  readonly props: { [key: string]: string };
}

export function goMeta(meta: GOMeta) {
  return {
    key: KEY,
    value: meta,
  };
}

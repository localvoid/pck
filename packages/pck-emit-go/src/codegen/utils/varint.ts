export function calcVarUintSize(n: number): number {
  let i = 0;
  do {
    i++;
    n >>= 7;
  } while (n !== 0);
  return i;
}

export function varUintBytes(n: number): number[] {
  const r = [];
  while (n > 0x7F) {
    r.push((n & 0x7F) | 0x80);
    n >>= 7;
  }
  r.push(n & 0x7F);
  return r;
}

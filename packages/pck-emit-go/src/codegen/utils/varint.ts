export function calcVarUintSize(n: number): number {
  let i = 0;
  do {
    i++;
    n >>= 7;
  } while (n !== 0);
  return i;
}

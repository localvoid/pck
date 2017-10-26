export function upperCaseFirstLetter(s: string): string {
  if (s.length > 0) {
    return s[0].toUpperCase() + s.substring(1);
  }
  return s;
}

const COMMON_INITIALISMS: { [key: string]: boolean } = {
  "ACL": true,
  "API": true,
  "ASCII": true,
  "CPU": true,
  "CSS": true,
  "DNS": true,
  "EOF": true,
  "GUID": true,
  "HTML": true,
  "HTTP": true,
  "HTTPS": true,
  "ID": true,
  "IP": true,
  "JSON": true,
  "LHS": true,
  "QPS": true,
  "RAM": true,
  "RHS": true,
  "RPC": true,
  "SLA": true,
  "SMTP": true,
  "SQL": true,
  "SSH": true,
  "TCP": true,
  "TLS": true,
  "TTL": true,
  "UDP": true,
  "UI": true,
  "UID": true,
  "UUID": true,
  "URI": true,
  "URL": true,
  "UTF8": true,
  "VM": true,
  "XML": true,
  "XMPP": true,
  "XSRF": true,
  "XSS": true,
};

const ALL_LOWER_RE = /^[a-z_]+$/;
const LOWER_RE = /^[a-z]$/;

export function goName(name: string, publicName?: boolean): string {
  if (name === "_") {
    return name;
  }
  if (publicName) {
    if (name.length === 1) {
      return name.toUpperCase();
    } else {
      name = name[0].toUpperCase() + name.substring(1);
    }
  } else {
    if (name.length === 1) {
      return name.toLowerCase();
    } else {
      name = name[0].toLowerCase() + name.substring(1);
    }
  }
  if (ALL_LOWER_RE.test(name)) {
    return name;
  }
  let result = "";
  const words = splitWords(name);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const upper = word.toUpperCase();
    if (COMMON_INITIALISMS[upper]) {
      if (i === 0 && LOWER_RE.test(word)) {
        result += word.toLowerCase();
      } else {
        result += upper;
      }
    } else if (i > 0 && word.toLowerCase() === word) {
      result += word[0].toUpperCase() + word.substring(1);
    } else {
      result += word;
    }
  }
  return result;
}

function splitWords(s: string): string[] {
  const words = [];

  let word = "";
  let state = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c >= "a" && c <= "z") {
      word += c;
      state = 1;
    } else if (c >= "A" && c <= "Z") {
      if (state === 1 && word !== "") {
        words.push(word);
        word = "";
      }
      word += c;
      state = 2;
    } else { // if (c === "_")
      if ((state === 1 || state === 2) && word !== "") {
        words.push(word);
        word = "";
      }
      state = 3;
    }
  }
  if ((state === 1 || state === 2) && word !== "") {
    words.push(word);
  }

  return words;
}

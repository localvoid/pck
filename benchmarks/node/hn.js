"use strict"

const fs = require("fs");
const __pck = require("pck-node");
const benchmark = require("benchmark");
const pck = require("../../examples/hn/pck");

const stories = {
  items: JSON.parse(fs.readFileSync("../../examples/hn/data/top_stories.json")),
}
const rawStories = jsonEncode();

function createItem(item) {
  return new pck.Item(
    item.by,
    item.descendants,
    item.id,
    item.kids === void 0 ? null : item.kids,
    item.score,
    item.time,
    item.title,
    item.url === void 0 ? "" : item.url,
  );
}

const pckStories = (() => {
  const items = [];
  for (const item of stories.items) {
    items.push(createItem(item));
  }
  return new pck.TopStories(items);
})();
const rawPckStories = pckEncode();

console.log(`PCK size: ${rawPckStories.length}`);
console.log(`JSON size: ${rawStories.length}`);

let start;
console.log("JSON");
for (let i = 0; i < 10; i++) {
  start = process.hrtime();
  jsonDecode();
  console.log(process.hrtime(start));
}

console.log("PCK");
for (let i = 0; i < 10; i++) {
  start = process.hrtime();
  pckDecode();
  console.log(process.hrtime(start));
}

function pckEncode() {
  const w = new __pck.Writer();
  pckStories.pck(w);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecode() {
  return pck.unpckTopStories({ u: rawPckStories, o: 0 });
}

function jsonEncode() {
  return JSON.stringify(stories);
}

function jsonDecode() {
  return JSON.parse(rawStories);
}

new benchmark.Suite()
  .add("pck:encode", () => { pckEncode(); })
  .add("pck:decode", () => { pckDecode(); })
  .add("json:encode", () => { jsonEncode(); })
  .add("json:decode", () => { jsonDecode(); })
  .on("cycle", (e) => { console.log(String(e.target)); })
  .run();

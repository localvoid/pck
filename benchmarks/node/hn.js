"use strict"

const fs = require("fs");
const __pck = require("pck-node");
const benchmark = require("benchmark");
const pck = require("../../examples/hn/pck");

const topStories = JSON.parse(fs.readFileSync("../../examples/hn/data/top_stories.json"));

const stories = [];
const rawStories = [];
const pckStories = [];
const rawPckStories = [];

for (const id of topStories) {
  const raw = fs.readFileSync(`../../examples/hn/data/items/${id}.json`).toString();
  const item = JSON.parse(raw);
  const pckItem = new pck.Item(
    item.by,
    item.descendants,
    item.id,
    item.kids === void 0 ? null : item.kids,
    item.score,
    item.time,
    item.title,
    item.url === void 0 ? "" : item.url,
  );
  rawStories.push(raw);
  stories.push(item);
  pckStories.push(pckItem);
  rawPckStories.push(pckEncodeItem(pckItem));
}

function pckEncodeItem(item) {
  const w = new __pck.Writer();
  item.pck(w);
  const a = Buffer.allocUnsafe(w.size);
  __pck.serialize(w, a);
  return a;
}

function pckDecodeItem(raw) {
  return pck.unpckItem({ u: raw, o: 0 });
}

function pckEncode() {
  for (const item of pckStories) {
    pckEncodeItem(item);
  }
}

function pckDecode() {
  for (const item of rawPckStories) {
    pckDecodeItem(item);
  }
}

function jsonEncode() {
  for (const item of stories) {
    JSON.stringify(item);
  }
}

function jsonDecode() {
  for (const item of rawStories) {
    JSON.parse(item);
  }
}

new benchmark.Suite()
  .add("pck:encode", () => { pckEncode(); })
  .add("pck:decode", () => { pckDecode(); })
  .add("json:encode", () => { jsonEncode(); })
  .add("json:decode", () => { jsonDecode(); })
  .on("cycle", (e) => { console.log(String(e.target)); })
  .run();

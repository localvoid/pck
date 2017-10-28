import * as pck from "pck-browser";

// pck:assign({ "schema": "Item" })
// pck:emit("class")
export class Item {
  by: string;
  descendants: number;
  id: number;
  kids: Array<number> | null;
  score: number;
  time: number;
  title: string;
  url: string;

  constructor(
    by: string,
    descendants: number,
    id: number,
    kids: Array<number> | null,
    score: number,
    time: number,
    title: string,
    url: string,
  ) {
    this.by = by;
    this.descendants = descendants;
    this.id = id;
    this.kids = kids;
    this.score = score;
    this.time = time;
    this.title = title;
    this.url = url;
  }

  /**
   * pck is an automatically generated serialization method.
   *
   * @param writer Writer object.
   */
  pck(writer: pck.Writer): void {
    const optionalKids = (((this.kids!) !== null) && ((this.kids!).length > 0));
    const optionalUrl = ((this.url) !== "");
    pck.writeBitSet(
      writer,
      optionalKids,
      optionalUrl,
    );
    pck.writeI32(writer, this.time);
    pck.writeUVar(writer, this.descendants);
    pck.writeUVar(writer, this.id);
    pck.writeUVar(writer, this.score);
    pck.writeUtf8(writer, this.by);
    pck.writeUtf8(writer, this.title);
    if (optionalUrl) {
      pck.writeUtf8(writer, this.url);
    }
    if (optionalKids) {
      pck.writeArray(writer, this.kids!, pck.writeUVar);
    }
  }
}

/**
 * unpckItem is an automatically generated deserialization function.
 *
 * @param reader Read buffer.
 * @returns Deserialized object.
 */
export function unpckItem(reader: pck.ReadBuffer): Item {
  const bitSet0 = pck.readU8(reader);
  const time = pck.readU32(reader);
  const descendants = pck.readUVar(reader);
  const id = pck.readUVar(reader);
  const score = pck.readUVar(reader);
  const by = pck.readUtf8(reader);
  const title = pck.readUtf8(reader);
  const url = (bitSet0 & (1 << 1)) !== 0 ? pck.readUtf8(reader) : "";
  const kids = (bitSet0 & (1 << 0)) !== 0 ? pck.readArray(reader, pck.readUVar) : null;

  return new Item(
    by,
    descendants,
    id,
    kids,
    score,
    time,
    title,
    url,
  );
}
// pck:end

// pck:assign({ "schema": "TopStories" })
// pck:emit("class")
export class TopStories {
  items: Array<Item>;

  constructor(
    items: Array<Item>,
  ) {
    this.items = items;
  }

  /**
   * pck is an automatically generated serialization method.
   *
   * @param writer Writer object.
   */
  pck(writer: pck.Writer): void {
    pck.writeArray(writer, this.items, pck.writeObject);
  }
}

/**
 * unpckTopStories is an automatically generated deserialization function.
 *
 * @param reader Read buffer.
 * @returns Deserialized object.
 */
export function unpckTopStories(reader: pck.ReadBuffer): TopStories {
  const items = pck.readArray(reader, unpckItem);

  return new TopStories(
    items,
  );
}
// pck:end

let ready: () => void;
let stories: any;
let rawStories: string;
let pckStories: TopStories;
let rawPckStories: Uint8Array;

function createItem(item: any): Item {
  return new Item(
    item["by"],
    item["descendants"],
    item["id"],
    item["kids"] === void 0 ? null : item["kids"],
    item["score"],
    item["time"],
    item["title"],
    item["url"] === void 0 ? "" : item["url"],
  );
}

export function pckEncodeHN() {
  const w = new pck.Writer();
  pckStories.pck(w);
  const a = new Uint8Array(w.size);
  pck.serialize(w, a);
  return a;
}

export function pckDecodeHN() {
  return unpckTopStories({ u: rawPckStories, o: 0 });
}

export function jsonEncodeHN() {
  return JSON.stringify(stories);
}

function fromJSON(data: any) {
  const items = [];
  for (const item of data.items) {
    items.push(createItem(item));
  }
  return new TopStories(items);
}

export function jsonDecodeHN() {
  return fromJSON(JSON.parse(rawStories));
}

export function hnReady(cb: () => void): void {
  ready = cb;
}

fetch("top_stories.json")
  .then((response) => {
    return response.text();
  })
  .then((raw) => {
    stories = { items: JSON.parse(raw).slice(0, 10) };
    rawStories = jsonEncodeHN();
    pckStories = fromJSON(stories);
    rawPckStories = pckEncodeHN();
    ready();
  });

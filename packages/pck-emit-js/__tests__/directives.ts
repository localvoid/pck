import { expect } from "iko";
import { extractRegions } from "../src/directives";

describe("src/directives.ts", () => {
  it("empty text", () => {
    expect(extractRegions("")).toHaveLength(0);
  });

  it("multiline text without directives", () => {
    expect(extractRegions(`
      Line 1
      Line 2
    `)).toHaveLength(0);
  });

  it("one emit region", () => {
    const r = extractRegions(`// pck:emit("a")\n// pck:end`);
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("a");
    expect(r[0].offset).toBe("");
    expect(r[0].start).toBe(16);
    expect(r[0].end).toBe(17);
    expect(r[0].data).toBeObject().toBeEqual({});
  });

  it("one emit region with offset", () => {
    const r = extractRegions(`
    // pck:emit("a")
    // pck:end
  `);
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("a");
    expect(r[0].offset).toBe("    ");
    expect(r[0].start).toBe(21);
    expect(r[0].end).toBe(22);
    expect(r[0].data).toBeObject().toBeEqual({});
  });

  it("one emit region with offset and text block", () => {
    const r = extractRegions(`
    // pck:emit("a")
    Text inside
    // pck:end
  `);
    expect(r).toHaveLength(1);
    expect(r[0].type).toBe("a");
    expect(r[0].offset).toBe("    ");
    expect(r[0].start).toBe(21);
    expect(r[0].end).toBe(38);
    expect(r[0].data).toBeObject().toBeEqual({});
  });

  it("two emit regions with offset and text block", () => {
    const r = extractRegions(`
    // pck:emit("a")
    Text inside 1
    // pck:end
    Line
    // pck:emit("b")
    Text inside 2
    // pck:end
  `);
    expect(r).toHaveLength(2);
    expect(r[0].type).toBe("a");
    expect(r[0].offset).toBe("    ");
    expect(r[0].start).toBe(21);
    expect(r[0].end).toBe(40);
    expect(r[0].data).toBeObject().toBeEqual({});

    expect(r[1].type).toBe("b");
    expect(r[1].offset).toBe("    ");
    expect(r[1].start).toBe(84);
    expect(r[1].end).toBe(103);
    expect(r[1].data).toBeObject().toBeEqual({});
  });

  describe("data", () => {
    it("default", () => {
      const r = extractRegions(`
        // pck:emit("a")
        Text inside
        // pck:end
      `, { d: 123 });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
    });

    it("assign", () => {
      const r = extractRegions(`
        // pck:assign({ "d": 123 })
        // pck:emit("a")
        Text inside
        // pck:end
      `);
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
    });

    it("assign overwrite", () => {
      const r = extractRegions(`
        // pck:assign({ "d": 123 })
        // pck:emit("a")
        Text inside
        // pck:end
      `, { d: 0 });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
    });

    it("assign overwrite before", () => {
      const r = extractRegions(`
        // pck:assign({ "d": 456 })
        // pck:assign({ "d": 123 })
        // pck:emit("a")
        Text inside
        // pck:end
        `, { d: 0 });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
    });

    it("assign overwrite after", () => {
      const r = extractRegions(`
        // pck:assign({ "d": 123 })
        // pck:emit("a")
        Text inside
        // pck:end
        // pck:assign({ "d": 0 })
        `, { d: 0 });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
    });

    it("assign overwrite after (2 regions)", () => {
      const r = extractRegions(`
        // pck:assign({ "d": 123 })
        // pck:emit("a")
        Text inside 1
        // pck:end
        // pck:assign({ "d": 0 })
        // pck:emit("b")
        Text inside 2
        // pck:end
        `, { d: 0 });
      expect(r).toHaveLength(2);
      expect(r[0].data).toBeObject().toBeEqual({ d: 123 });
      expect(r[1].data).toBeObject().toBeEqual({ d: 0 });
    });

    it("merge", () => {
      const r = extractRegions(`
        // pck:merge({ "d": { "b": 2 } })
        // pck:emit("a")
        Text inside
        // pck:end
      `, { d: { a: 1 } });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: { a: 1, b: 2 } });
    });

    it("merge overwrite", () => {
      const r = extractRegions(`
        // pck:merge({ "d": { "a": 0, "b": 2 } })
        // pck:emit("a")
        Text inside
        // pck:end
      `, { d: { a: 1 } });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: { a: 0, b: 2 } });
    });

    it("merge overwrite after", () => {
      const r = extractRegions(`
        // pck:merge({ "d": { "b": 2 } })
        // pck:emit("a")
        Text inside
        // pck:end
        // pck:merge({ "d": { "a": 0 } })
        `, { d: { a: 1 } });
      expect(r).toHaveLength(1);
      expect(r[0].data).toBeObject().toBeEqual({ d: { a: 1, b: 2 } });
    });

    it("merge overwrite after (2 regions)", () => {
      const r = extractRegions(`
        // pck:merge({ "d": { "b": 2 } })
        // pck:emit("a")
        Text inside 1
        // pck:end
        // pck:merge({ "d": { "a": 0 } })
        // pck:emit("b")
        Text inside 2
        // pck:end
        `, { d: { a: 1 } });
      expect(r).toHaveLength(2);
      expect(r[0].data).toBeObject().toBeEqual({ d: { a: 1, b: 2 } });
      expect(r[1].data).toBeObject().toBeEqual({ d: { a: 0, b: 2 } });
    });
  });

  describe("scope", () => {
    it("assign", () => {
      const r = extractRegions(`
        // pck:start
        //   pck:assign({ "d": 1 })
        //   pck:emit("a")
        Text inside 1
        //   pck:end
        // pck:end
        // pck:emit("b")
        Text inside 2
        // pck:end
        `, { d: 0 });
      expect(r).toHaveLength(2);
      expect(r[0].data).toBeObject().toBeEqual({ d: 1 });
      expect(r[1].data).toBeObject().toBeEqual({ d: 0 });
    });
  });
});

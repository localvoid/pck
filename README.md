PCK is a binary format and a set of tools specifically designed for generating efficient deserializers in javascript.

## Features

- Binary format
- Compact storage size
- Javascript as a language to describe schemas
- Efficient and compact deserialization and serialization in javascript

## Supported Programming Languages

- Javascript ([pck-emit-js](https://npmjs.com/package/pck-emit-js))
- Go ([pck-emit-go](https://npmjs.com/package/pck-emit-go))

## Packages

- [pck](https://npmjs.com/package/pck) Core data structures and helper functions for generating schemas.
- [pck-emit-js](https://npmjs.com/package/pck-emit-js) Emitter for Javascript/TypeScript (Browser/Node).
- [pck-emit-go](https://npmjs.com/package/pck-emit-go) Emitter for Go.
- [pck-browser](https://npmjs.com/package/pck-browser) Helper utilities for Javascript (Browser).
- [pck-node](https://npmjs.com/package/pck-node) Helper utilities for Javascript (Node).

## Benchmarks

[pck-browser](https://npmjs.com/package/pck-browser) is optimized towards fast deserialization performance and compact
seralization functions. It is possible to generate way much faster serializers, but it would require generating more
code and in most situations it is isn't worth it.

[pck-node](https://npmjs.com/package/pck-node) works in the same way as `pck-browser`, but Node.js implementation
doesn't need to be super compact, so in the future, serialization functions will be optimized towards serialization
performance.

### Basic Data

Basic benchmarks that serialize and deserialize simple data structure that doesn't contain any strings:

```js
const DATA = {
  health: 100,
  jumping: true,
  position: { x: 10, y: 20 },
  attributes: { str: 100, agi: 50, int: 10 },
};
```

#### Schema

```js
const Position = schema(ivar("x"), ivar("y"));
const Attributes = schema(u8("str"), u8("agi"), u8("int"));
const Player = schema(
  ivar("health"),
  bool("jumping"),
  ref("position", Position),
  ref("attributes", Attributes),
);
```

#### Storage Size

- PCK: 8 bytes
- JSON: 99 bytes

#### Node v8.8.0 (i5 4570k, Linux)

```txt
pck:encode x 3,424,757 ops/sec ±0.96% (94 runs sampled)
pck:decode x 19,974,290 ops/sec ±0.22% (96 runs sampled)
json:encode x 508,511 ops/sec ±1.45% (84 runs sampled)
json:decode x 589,417 ops/sec ±0.27% (96 runs sampled)
```

#### Browser (iPad 2017, iOS 11.0.3)

```txt
pck:encode x 2,467,280 ops/sec ±4.99% (34 runs sampled)
pck:decode x 27,437,271 ops/sec ±0.78% (64 runs sampled)
json:encode x 626,667 ops/sec ±1.26% (61 runs sampled)
json:decode x 617,130 ops/sec ±0.27% (44 runs sampled)
```

#### Browser (Nexus 5, Chrome 61)

```txt
pck:encode x 514,284 ops/sec ±5.64% (52 runs sampled)
pck:decode x 1,529,939 ops/sec ±4.71% (49 runs sampled)
json:encode x 127,017 ops/sec ±3.10% (51 runs sampled)
json:decode x 132,055 ops/sec ±0.71% (55 runs sampled)
```

#### Go 1.9 (i5 4570k, Linux)

```txt
BenchmarkPckEncode-4    	200000000	        65.9 ns/op
BenchmarkPckDecode-4    	200000000	        92.6 ns/op
BenchmarkJsonEncode-4   	10000000	      1380 ns/op
BenchmarkJsonDecode-4   	 3000000	      4624 ns/op
```

### HackerNews Data

This benchmark serializes and deserializes response from [HackerNews](https://news.ycombinator.com/) top stories API.

#### Schema

```js
const Item = schema(
  utf8("by"),
  uvar("descendants"),
  uvar("id"),
  omitEmpty(omitNull(array("kids", UVAR))),
  uvar("score"),
  u32("time"),
  utf8("title"),
  omitEmpty(utf8("url")),
);

const TopStories = schema(
  array("items", REF(Item)),
);
```

#### Storage Size

- PCK: 94815 bytes
- JSON: 185885 bytes

#### Node v8.8.0 (i5 4570k, Linux)

```txt
pck:encode x 970 ops/sec ±2.41% (91 runs sampled)
pck:decode x 2,265 ops/sec ±0.67% (94 runs sampled)
json:encode x 1,468 ops/sec ±0.21% (94 runs sampled)
json:decode x 516 ops/sec ±2.86% (82 runs sampled)
```

#### Browser (iPad 2017, iOS 11.0.3)

```txt
pck:encode x 441 ops/sec ±1.00% (63 runs sampled)
pck:decode x 1,176 ops/sec ±0.50% (62 runs sampled)
json:encode x 941 ops/sec ±0.44% (62 runs sampled)
json:decode x 587 ops/sec ±0.25% (63 runs sampled)
```

#### Browser (Nexus 5, Chrome 61)

```txt
pck:encode x 102 ops/sec ±6.51% (45 runs sampled)
pck:decode x 511 ops/sec ±2.95% (54 runs sampled)
json:encode x 238 ops/sec ±3.76% (51 runs sampled)
json:decode x 71 ops/sec ±7.94% (44 runs sampled)
```

#### Go 1.9 (i5 4570k, Linux)

```txt
BenchmarkPckEncode-4    	  100000	    197485 ns/op
BenchmarkPckDecode-4    	   50000	    308749 ns/op
BenchmarkJsonEncode-4   	   10000	   1292727 ns/op
BenchmarkJsonDecode-4   	    3000	   4856830 ns/op
```

## Data Types

| Type         | Storage Size         | Description                       |
| ---          | ---                  | ---                               |
| Bool         | 1 bit (bit store)    | Boolean                           |
| I8           | 1 byte               | Int8                              |
| U8           | 1 byte               | Uint8                             |
| I16          | 2 bytes              | Int16                             |
| U16          | 2 bytes              | Uint16                            |
| I32          | 4 bytes              | Int32                             |
| U32          | 4 bytes              | Uint32                            |
| F32          | 4 bytes              | Float32                           |
| F64          | 8 bytes              | Float64                           |
| IVAR         | 1-5 bytes            | Variadic Int32 (ZigZag encoding)  |
| UVAR         | 1-5 bytes            | Variadic Uint32                   |
| UTF8         | 1-5+N bytes          | UTF8 String                       |
| ASCII        | 1-5+N bytes          | ASCII String                      |
| BYTES        | 1-5+N bytes          | Byte Array                        |
| ARRAY        | 1-5+N bytes          | Array                             |
| MAP(K,V)     | 1-5+(NK+NV) bytes    | Map                               |
| ASCII(N)     | N bytes              | Fixed ASCII String                |
| BYTES(N)     | N bytes              | Fixed Byte Array                  |
| ARRAY(N)     | NV bytes             | Fixed Array                       |
| REF(T)       | size(T) bytes        | Reference to an Object            |
| UNION(T...)  | 1-5+size(...T) bytes | Tagged Union                      |

## Field Flags

| Flag         | Storage Size         | Description                       |
| ---          | ---                  | ---                               |
| Optional     | 1 bit (bit store)    | OmitNull, OmitEmpty, OmitZero     |

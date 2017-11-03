## Size thresholds

### UTF8 Decoding

- `readFixedUTF8()` when `s.length <= 32`
- [StringDecoder](https://nodejs.org/api/string_decoder.html) when `s.length > 32`

### UTF8 Encoding

- `utf8Size()` & `writeFixedUtf8()` when `s.length <= 8`
- `Buffer.from()` when `s.length > 8`

### ASCII Encoding

- `writeFixedUtf8()` when `s.length <= 8`
- `Buffer.write()` when `s.length > 8`

### Buffer

- `for-loop` when `b.length <= 16`
- `Buffer.copy()` when `b.length > 16`

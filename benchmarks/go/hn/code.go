package hn

// Item is item
type Item struct {
	By          string   `json:"by"`
	Descendants uint64   `json:"descendants"`
	ID          uint64   `json:"id"`
	Kids        []uint64 `json:"kids"`
	Score       uint64   `json:"score"`
	Time        uint32   `json:"time"`
	Title       string   `json:"title"`
	URL         string   `json:"url,omitempty"`
}

// TopStories is top stories
type TopStories struct {
	Items []*Item `json:"items"`
}

// pck:emit("taggedFactories")

var taggedFactories = [0]func() unpcker {
}

// pck:end

// pck:emit("methods", "Item")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (item *Item) PckSize() int {
	size := 5
	size += sizeVarUint(uint64(item.Descendants))
	size += sizeVarUint(uint64(item.ID))
	size += sizeVarUint(uint64(item.Score))
	{
		length := len(item.By)
		size += sizeVarUint(uint64(length)) + length
	}
	{
		length := len(item.Title)
		size += sizeVarUint(uint64(length)) + length
	}
	if length := len(item.URL); length != 0 {
		size += sizeVarUint(uint64(length)) + length
	}
	if len(item.Kids) != 0 {
		size += sizeVarUint(uint64(len(item.Kids)))
		for _, item2 := range item.Kids {
			size += sizeVarUint(uint64(item2))
		}
	}
	return size
}

// PckSizeWithTag is an automatically generated method for PCK serialized size calculation.
func (item *Item) PckSizeWithTag() int {
	panic("Item doesn't support tagged serialization")
}

// Pck is an automatically generated method for PCK serialization.
func (item *Item) Pck(b []byte) int {
	_ = b[4]
	optionalURL := len(item.URL) > 0
	optionalKids := item.Kids != nil && len(item.Kids) > 0
	var bitStoreValue byte
	if optionalURL {
		bitStoreValue = 1
	}
	if optionalKids {
		bitStoreValue |= 1 << 1
	}
	b[0] = bitStoreValue
	b[1] = byte(item.Time)
	b[2] = byte(item.Time >> 8)
	b[3] = byte(item.Time >> 16)
	b[4] = byte(item.Time >> 24)
	offset := 5
	offset += writeVarUint(b[offset:], uint64(item.Descendants))
	offset += writeVarUint(b[offset:], uint64(item.ID))
	offset += writeVarUint(b[offset:], uint64(item.Score))
	offset += writeVarUint(b[offset:], uint64(len(item.By)))
	offset += copy(b[offset:], item.By)
	offset += writeVarUint(b[offset:], uint64(len(item.Title)))
	offset += copy(b[offset:], item.Title)
	if optionalURL {
		offset += writeVarUint(b[offset:], uint64(len(item.URL)))
		offset += copy(b[offset:], item.URL)
	}
	if optionalKids {
		offset += writeVarUint(b[offset:], uint64(len(item.Kids)))
		for i := 0; i < len(item.Kids); i++ {
			offset += writeVarUint(b[offset:], uint64(item.Kids[i]))
		}
	}
	return offset
}

// PckWithTag is an automatically generated method for PCK serialization.
func (item *Item) PckWithTag(b []byte) int {
	panic("Item doesn't support tagged serialization")
}

// Unpck is an automatically generated method for PCK deserialization.
func (item *Item) Unpck(b []byte) int {
	_ = b[4]
	bitStore0 := b[0]
	item.Time = uint32(uint32(b[1]) | uint32(b[2])<<8 | uint32(b[3])<<16 | uint32(b[4])<<24)
	offset := 5
	{
		value, size := readVarUint(b[offset:])
		item.Descendants = value
		offset += size
	}
	{
		value, size := readVarUint(b[offset:])
		item.ID = value
		offset += size
	}
	{
		value, size := readVarUint(b[offset:])
		item.Score = value
		offset += size
	}
	{
		length, size := readVarUint(b[offset:])
		offset += size
		item.By = string(b[offset:offset + int(length)])
		offset += int(length)
	}
	{
		length, size := readVarUint(b[offset:])
		offset += size
		item.Title = string(b[offset:offset + int(length)])
		offset += int(length)
	}
	if bitStore0&(1<<0) != 0 {
		{
			length, size := readVarUint(b[offset:])
			offset += size
			item.URL = string(b[offset:offset + int(length)])
			offset += int(length)
		}
	}
	if bitStore0&(1<<1) != 0 {
		{
			length, size := readVarUint(b[offset:])
			offset += size
			value := make([]uint64, length)
			item.Kids = value
			for i := 0; i < int(length); i++ {
				{
					value2, size := readVarUint(b[offset:])
					value[i] = value2
					offset += size
				}
			}
		}
	}
	return offset
}

// pck:end

// pck:emit("methods", "TopStories")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (topStories *TopStories) PckSize() int {
	size := 0
	size += sizeVarUint(uint64(len(topStories.Items)))
	for _, item := range topStories.Items {
		size += item.PckSize()
	}
	return size
}

// PckSizeWithTag is an automatically generated method for PCK serialized size calculation.
func (topStories *TopStories) PckSizeWithTag() int {
	panic("TopStories doesn't support tagged serialization")
}

// Pck is an automatically generated method for PCK serialization.
func (topStories *TopStories) Pck(b []byte) int {
	offset := 0
	offset += writeVarUint(b[offset:], uint64(len(topStories.Items)))
	for i := 0; i < len(topStories.Items); i++ {
		offset += topStories.Items[i].Pck(b[offset:])
	}
	return offset
}

// PckWithTag is an automatically generated method for PCK serialization.
func (topStories *TopStories) PckWithTag(b []byte) int {
	panic("TopStories doesn't support tagged serialization")
}

// Unpck is an automatically generated method for PCK deserialization.
func (topStories *TopStories) Unpck(b []byte) int {
	offset := 0
	{
		length, size := readVarUint(b[offset:])
		offset += size
		value := make([]*Item, length)
		topStories.Items = value
		for i := 0; i < int(length); i++ {
			{
				value2 := &Item{}
				value[i] = value2
				offset += value2.Unpck(b[offset:])
			}
		}
	}
	return offset
}

// pck:end

// pck:emit("lib")

type unpcker interface {
	Unpck(b []byte) int
}

func writeUint16(b []byte, v uint16) {
	_ = b[1]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
}

func readUint16(b []byte) uint16 {
	_ = b[1]
	return uint16(b[0]) | uint16(b[1])<<8
}

func writeUint32(b []byte, v uint32) {
	_ = b[3]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
	b[2] = byte(v >> 16)
	b[3] = byte(v >> 24)
}

func readUint32(b []byte) uint32 {
	_ = b[3]
	return uint32(b[0]) | uint32(b[1])<<8 | uint32(b[2])<<16 | uint32(b[3])<<24
}

func writeUint64(b []byte, v uint64) {
	_ = b[7]
	b[0] = byte(v)
	b[1] = byte(v >> 8)
	b[2] = byte(v >> 16)
	b[3] = byte(v >> 24)
	b[4] = byte(v >> 32)
	b[5] = byte(v >> 40)
	b[6] = byte(v >> 48)
	b[7] = byte(v >> 56)
}

func readUint64(b []byte) uint64 {
	_ = b[7]
	return uint64(b[0]) | uint64(b[1])<<8 | uint64(b[2])<<16 | uint64(b[3])<<24 |
		uint64(b[4])<<32 | uint64(b[5])<<40 | uint64(b[6])<<48 | uint64(b[7])<<56
}

func writeVarUint(b []byte, v uint64) int {
	i := 0
	for v >= 0x80 {
		b[i] = byte(v) | 0x80
		v >>= 7
		i++
	}
	b[i] = byte(v)
	return i + 1
}

func readVarUint(b []byte) (v uint64, i int) {
	for shift := uint(0); ; shift += 7 {
		x := b[i]
		i++
		v |= (uint64(x) & 0x7F) << shift
		if x < 0x80 {
			return
		}
	}
}

func writeVarInt(b []byte, v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return writeVarUint(b, uv)
}

func readVarInt(b []byte) (int64, int) {
	uv, i := readVarUint(b)
	v := int64(uv >> 1)
	if uv&1 != 0 {
		v = ^v
	}
	return v, i
}

func sizeVarUint(v uint64) (n int) {
	for {
		n++
		v >>= 7
		if v == 0 {
			return
		}
	}
}

func sizeVarInt(v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return sizeVarUint(uv)
}

// pck:end

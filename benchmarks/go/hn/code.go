package hn

// Item is item
type Item struct {
	By          string   `json:"by"`
	Descendants uint64   `json:"descendants"`
	Id          uint64   `json:"id"`
	Kids        []uint64 `json:"kids"`
	Score       uint64   `json:"score"`
	Time        uint32   `json:"time"`
	Title       string   `json:"title"`
	Url         string   `json:"url,omitempty"`
}

// TopStories is top stories
type TopStories struct {
	Items []*Item `json:"items"`
}

// pck:emit("taggedFactories")

var taggedFactories = [0]func() unpcker{}

// pck:end

// pck:emit("methods", "Item")

// PckSize is an automatically generated method for PCK serialized size calculation.
func (item *Item) PckSize() (size int) {
	var length int
	_ = length
	size = 5
	size += sizeUvar(uint64(item.Descendants))
	size += sizeUvar(uint64(item.Id))
	size += sizeUvar(uint64(item.Score))
	length = len(item.By)
	size += sizeUvar(uint64(length)) + length
	length = len(item.Title)
	size += sizeUvar(uint64(length)) + length
	if len(item.Url) > 0 {
		length = len(item.Url)
		size += sizeUvar(uint64(length)) + length
	}
	if item.Kids != nil && len(item.Kids) > 0 {
		size += sizeUvar(uint64(len(item.Kids)))
		for _, item2 := range item.Kids {
			size += sizeUvar(uint64(item2))
		}
	}
	return
}

// PckSizeWithTag is an automatically generated method for PCK serialized size calculation.
func (item *Item) PckSizeWithTag() int {
	panic("Item doesn't support tagged serialization")
}

// Pck is an automatically generated method for PCK serialization.
func (item *Item) Pck(b []byte) int {
	_ = b[4]
	optionalUrl := len(item.Url) > 0
	optionalKids := item.Kids != nil && len(item.Kids) > 0
	var bitStoreValue byte
	if optionalKids {
		bitStoreValue = 1
	}
	if optionalUrl {
		bitStoreValue |= 1 << 1
	}
	b[0] = bitStoreValue
	b[1] = byte(item.Time)
	b[2] = byte(item.Time >> 8)
	b[3] = byte(item.Time >> 16)
	b[4] = byte(item.Time >> 24)
	offset := 5
	offset += writeUvar(b[offset:], uint64(item.Descendants))
	offset += writeUvar(b[offset:], uint64(item.Id))
	offset += writeUvar(b[offset:], uint64(item.Score))
	offset += writeUvar(b[offset:], uint64(len(item.By)))
	offset += copy(b[offset:], item.By)
	offset += writeUvar(b[offset:], uint64(len(item.Title)))
	offset += copy(b[offset:], item.Title)
	if optionalUrl {
		offset += writeUvar(b[offset:], uint64(len(item.Url)))
		offset += copy(b[offset:], item.Url)
	}
	if optionalKids {
		offset += writeUvar(b[offset:], uint64(len(item.Kids)))
		for i := 0; i < len(item.Kids); i++ {
			offset += writeUvar(b[offset:], uint64(item.Kids[i]))
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
		value, size := readUvar(b[offset:])
		item.Descendants = value
		offset += size
	}
	{
		value, size := readUvar(b[offset:])
		item.Id = value
		offset += size
	}
	{
		value, size := readUvar(b[offset:])
		item.Score = value
		offset += size
	}
	{
		length, size := readUvar(b[offset:])
		offset += size
		item.By = string(b[offset : offset+int(length)])
		offset += int(length)
	}
	{
		length, size := readUvar(b[offset:])
		offset += size
		item.Title = string(b[offset : offset+int(length)])
		offset += int(length)
	}
	if bitStore0&(1<<1) != 0 {
		{
			length, size := readUvar(b[offset:])
			offset += size
			item.Url = string(b[offset : offset+int(length)])
			offset += int(length)
		}
	}
	if bitStore0&(1<<0) != 0 {
		{
			length, size := readUvar(b[offset:])
			offset += size
			value := make([]uint64, length)
			item.Kids = value
			for i := 0; i < int(length); i++ {
				{
					value2, size := readUvar(b[offset:])
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
func (topstories *TopStories) PckSize() (size int) {
	var length int
	_ = length
	size = 0
	size += sizeUvar(uint64(len(topstories.Items)))
	for _, item := range topstories.Items {
		size += item.PckSize()
	}
	return
}

// PckSizeWithTag is an automatically generated method for PCK serialized size calculation.
func (topstories *TopStories) PckSizeWithTag() int {
	panic("TopStories doesn't support tagged serialization")
}

// Pck is an automatically generated method for PCK serialization.
func (topstories *TopStories) Pck(b []byte) int {
	offset := 0
	offset += writeUvar(b[offset:], uint64(len(topstories.Items)))
	for i := 0; i < len(topstories.Items); i++ {
		offset += topstories.Items[i].Pck(b[offset:])
	}
	return offset
}

// PckWithTag is an automatically generated method for PCK serialization.
func (topstories *TopStories) PckWithTag(b []byte) int {
	panic("TopStories doesn't support tagged serialization")
}

// Unpck is an automatically generated method for PCK deserialization.
func (topstories *TopStories) Unpck(b []byte) int {
	offset := 0
	{
		length, size := readUvar(b[offset:])
		offset += size
		value := make([]*Item, length)
		topstories.Items = value
		for i := 0; i < int(length); i++ {
			v := &Item{}
			offset += v.Unpck(b[offset:])
			value[i] = v
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

func writeUvar(b []byte, v uint64) int {
	i := 0
	for v >= 0x80 {
		b[i] = byte(v) | 0x80
		v >>= 7
		i++
	}
	b[i] = byte(v)
	return i + 1
}

func readUvar(b []byte) (v uint64, i int) {
	for shift := uint(0); ; shift += 7 {
		x := b[i]
		i++
		v |= (uint64(x) & 0x7F) << shift
		if x < 0x80 {
			return
		}
	}
}

func writeIvar(b []byte, v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return writeUvar(b, uv)
}

func readIvar(b []byte) (int64, int) {
	uv, i := readUvar(b)
	v := int64(uv >> 1)
	if uv&1 != 0 {
		v = ^v
	}
	return v, i
}

func sizeUvar(v uint64) (n int) {
	for {
		n++
		v >>= 7
		if v == 0 {
			return
		}
	}
}

func sizeIvar(v int64) int {
	uv := uint64(v) << 1
	if v < 0 {
		uv ^= uv
	}
	return sizeUvar(uv)
}

// pck:end

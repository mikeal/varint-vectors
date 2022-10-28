/* original code from github.com/arj03/fast-varint */

const MSB        = 0x80
const INT        = Math.pow(2, 31)
const REST       = 0x7f
const MSBALL     = ~REST
const MATH_POW_4 = Math.pow(2, 4*7)
const MATH_POW_5 = Math.pow(2, 5*7)
const MATH_POW_6 = Math.pow(2, 6*7)
const MATH_POW_7 = Math.pow(2, 7*7)

const encode = (num, out, offset) => {
  if (Number.MAX_SAFE_INTEGER && num > Number.MAX_SAFE_INTEGER) {
    encode.bytes = 0
    throw new RangeError('Could not encode varint')
  }
  out = out || []
  offset = offset || 0
  var oldOffset = offset

  while(num >= INT) {
    out[offset++] = (num & 0xFF) | MSB
    num /= 128
  }
  while(num & MSBALL) {
    out[offset++] = (num & 0xFF) | MSB
    num >>>= 7
  }
  out[offset] = num | 0

  encode.bytes = offset - oldOffset + 1

  return out
}

const read = (buf, offset) => {
  offset = offset || 0

  let b = buf[offset]
  let res = 0

  res += b & REST
  if (b < MSB) {
    read.bytes = 1
    return res
  }

  b = buf[offset + 1]
  res += (b & REST) << 7
  if (b < MSB) {
    read.bytes = 2
    return res
  }

  b = buf[offset + 2]
  res += (b & REST) << 14
  if (b < MSB) {
    read.bytes = 3
    return res
  }

  b = buf[offset + 3]
  res += (b & REST) << 21
  if (b < MSB) {
    read.bytes = 4
    return res
  }

  b = buf[offset + 4]
  res += (b & REST) * MATH_POW_4
  if (b < MSB) {
    read.bytes = 5
    return res
  }

  b = buf[offset + 5]
  res += (b & REST) * MATH_POW_5
  if (b < MSB) {
    read.bytes = 6
    return res
  }

  b = buf[offset + 6]
  res += (b & REST) * MATH_POW_6
  if (b < MSB) {
    read.bytes = 7
    return res
  }

  b = buf[offset + 7]
  res += (b & REST) * MATH_POW_7
  if (b < MSB) {
    read.bytes = 8
    return res
  }

  read.bytes = 0
  throw new RangeError('Could not decode varint')
}


var N1 = Math.pow(2,  7)
var N2 = Math.pow(2, 14)
var N3 = Math.pow(2, 21)
var N4 = Math.pow(2, 28)
var N5 = Math.pow(2, 35)
var N6 = Math.pow(2, 42)
var N7 = Math.pow(2, 49)
var N8 = Math.pow(2, 56)
var N9 = Math.pow(2, 63)

const encoding_length = (value) => {
  return (
    value < N1 ? 1
  : value < N2 ? 2
  : value < N3 ? 3
  : value < N4 ? 4
  : value < N5 ? 5
  : value < N6 ? 6
  : value < N7 ? 7
  : value < N8 ? 8
  : value < N9 ? 9
  :              10
  )
}

/* end original code */

const encode_vector = vector => vector.flatMap(int => encode(int))

const parse = (vector, offset) => {
  const int = read(vector, offset)
  return [ int, offset + read.bytes ]
}

const parse_vector = (vector, num, offset=0) => {
  let i = 0
  let int
  const parsed = []
  while (i < num) {
    ;[ int, offset ] = parse(vector, offset)
    parsed.push(int)
    i++
  }
  return [].concat(...parsed, offset)
}

const decode = read

export { decode, encode, encoding_length, encode_vector, parse, parse_vector }

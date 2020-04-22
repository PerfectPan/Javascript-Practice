// https://zh.wikipedia.org/wiki/UTF-8
// https://github.com/migueldeicaza/NStack/issues/20
function UTF8Encode(str) {
  const result = [];
  for (let i = 0; i < str.length; ++i) {
    let codePoint = str.codePointAt(i);

    // codePointAt在标准里已经处理了surrogate pair的情况。如果出现
    // 这样[0xD800,0xDBFF][0xDC00,0xDFFF]连续两个字符，标准是会解码返回UTF16Decode(first,second)的 JS原本是UTF-16编码的
    // http://unicode.org/versions/Unicode3.0.0/ch03.pdf 3.7
    // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    if (codePoint < 0x80) {
      result.push(codePoint);
    } else if (codePoint < 0x800) {
      result.push(codePoint >> 6 | 0b11000000);
      result.push(codePoint & 0b111111 | 0b10000000);
    } else if (codePoint < 0xD800 || (codePoint >= 0xE000 && codePoint < 0x10000)) {
      result.push(codePoint >> 12 | 0b11100000);
      result.push(codePoint >> 6 & 0b111111 | 0b10000000);
      result.push(codePoint & 0b111111 | 0b10000000);
    } else if (codePoint >= 0x10000 && codePoint <= 0x10FFFF){
      result.push(codePoint >> 18 | 0b11110000)
      result.push(codePoint >> 12  & 0b111111 | 0b10000000);
      result.push(codePoint >> 6 & 0b111111 | 0b10000000);
      result.push(codePoint & 0b111111 | 0b10000000);
    } else {
      // handle invalid character
      result.push(0xEF, 0xBF, 0xBD);
    }
  }

  return new Uint8Array(result).buffer;
}
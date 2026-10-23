const zlib = require("zlib");
const T = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; T[n] = c; }
const crc = (b) => { let c = -1; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (art, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const a = Buffer.concat([Buffer.from(art, "ascii"), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(a)); return Buffer.concat([l, a, c]); };
module.exports = function png(u8, W, H) {
  const roh = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) { roh[y * (W * 4 + 1)] = 0; Buffer.from(u8.buffer, u8.byteOffset + y * W * 4, W * 4).copy(roh, y * (W * 4 + 1) + 1); }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(roh)), chunk("IEND", Buffer.alloc(0))]);
};

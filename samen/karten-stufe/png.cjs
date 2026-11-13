// png.cjs — RGBA-PNG schreiben und lesen (zlib, ohne Abhängigkeit): die Abzüge der Bühne und die Bilder des Befunds
"use strict";
const zlib = require("zlib");
const CRC = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});
const crc = (b) => {
    let c = 0xffffffff;
    for (const x of b) c = CRC[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
};
function pngSchreiben(w, h, rgba) {
    const roh = Buffer.alloc((w * 4 + 1) * h);
    for (let y = 0; y < h; y++) Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(roh, y * (w * 4 + 1) + 1);
    const teil = (typ, daten) => {
        const l = Buffer.alloc(4);
        l.writeUInt32BE(daten.length);
        const td = Buffer.concat([Buffer.from(typ), daten]);
        const c = Buffer.alloc(4);
        c.writeUInt32BE(crc(td));
        return Buffer.concat([l, td, c]);
    };
    const kopf = Buffer.alloc(13);
    kopf.writeUInt32BE(w, 0);
    kopf.writeUInt32BE(h, 4);
    kopf[8] = 8;
    kopf[9] = 6;
    return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), teil("IHDR", kopf), teil("IDAT", zlib.deflateSync(roh, { level: 9 })), teil("IEND", Buffer.alloc(0))]);
}
module.exports = { pngSchreiben };

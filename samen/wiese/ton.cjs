// WEGWERF (w28-samen-wiese): woher der Ton des Grases kommt — die Farbe je Ecke des echten L1-Büschels (Brücken-Bau), der
// Standort-Tint des Kerns (`wiesenTint`, als Text aus foundry-core.js gelesen und hier gerechnet) und das Laub der Eiche.
// node samen/wiese/ton.cjs <dump-ordner>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const f32 = (b) => new Float32Array(new Uint8Array(Buffer.from(b, "base64")).buffer);
const srgb = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
const hex = (c) => "#" + c.map((x) => Math.round(255 * Math.max(0, Math.min(1, srgb(x)))).toString(16).padStart(2, "0")).join("");
const zeile = (name, c) => `${name}: linear ${c.map((x) => x.toFixed(3)).join(" / ")} · sRGB ${hex(c)} · R/G ${(c[0] / c[1]).toFixed(2)} · B/G ${(c[2] / c[1]).toFixed(2)}`;
// flächen-gewichtete Farbe der Ecken eines Teils; `oben`: nur Dreiecke, deren Schwerpunkt über diesem Anteil der Höhe liegt
function mittel(datei, art, oben = 0, aehre = null) {
    const r = JSON.parse(fs.readFileSync(datei, "utf8"));
    const s = [0, 0, 0];
    let A = 0;
    for (const m of r.meshes) {
        if (m.kind !== art || !m.attrs || !m.attrs.color) continue;
        const p = f32(m.attrs.position.b64), c = f32(m.attrs.color.b64), z = m.attrs.aCenter ? f32(m.attrs.aCenter.b64) : null, I = new Uint32Array(new Uint8Array(Buffer.from(m.index, "base64")).buffer);
        let yMax = 0;
        for (let i = 1; i < p.length; i += 3) yMax = Math.max(yMax, p[i]);
        for (let t = 0; t < I.length; t += 3) {
            const [a, b, d] = [I[t] * 3, I[t + 1] * 3, I[t + 2] * 3];
            if ((p[a + 1] + p[b + 1] + p[d + 1]) / 3 < oben * yMax) continue;
            if (aehre !== null && z && z[a + 1] > 0 !== aehre) continue; // die Marke der Ähre: aCenter y > 0 (foundry-core.js:268)
            const u = [p[b] - p[a], p[b + 1] - p[a + 1], p[b + 2] - p[a + 2]], v = [p[d] - p[a], p[d + 1] - p[a + 1], p[d + 2] - p[a + 2]];
            const fl = 0.5 * Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]);
            for (let k = 0; k < 3; k++) s[k] += (fl * (c[a + k] + c[b + k] + c[d + k])) / 3;
            A += fl;
        }
    }
    return s.map((x) => x / A);
}
const halm = mittel(path.join(D, "gras-s1-l1.json"), "grass"), halmOben = mittel(path.join(D, "gras-s1-l1.json"), "grass", 0.5);
const laub = mittel(path.join(D, "eiche-s1-l0.json"), "foliageTex");
console.log(zeile("Halm L1 (Ecken-Farbe, ganze Fläche)", halm));
console.log(zeile("Halm L1 (obere Hälfte — was das Auge von 1,6 m sieht)", halmOben));
console.log(zeile("   davon Blatt-Halme oben (ohne Ähren)", mittel(path.join(D, "gras-s1-l1.json"), "grass", 0.5, false)));
console.log(zeile("   davon Ähren", mittel(path.join(D, "gras-s1-l1.json"), "grass", 0, true)));
console.log(zeile("Laub Eiche L0 (Ecken-Farbe; der Atlas multipliziert seinen Wert darauf)", laub));
// der Standort-Tint: der Text des Kerns (foundry-core.js, WIESEN_ARTEN … wiesenTint)
const kern = fs.readFileSync(path.join(__dirname, "../../foundry-core.js"), "utf8");
const a = kern.indexOf("const WIESEN_ARTEN"), b = kern.indexOf("/* GROUND-COVER-GESETZ");
const mb = "function mulberry32(a){return function(){a|=0;a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}\n"; // foundry-core.js:8–16
const wiesenTint = new Function(mb + kern.slice(a, b) + "; return { wiesenTint, WIESEN_ARTEN };")();
for (const [lit, wet] of [[1, 0], [1, 0.3], [1, 0.6], [0.5, 0.6]]) {
    const s = [0, 0, 0], aus = [0, 0, 0];
    const N = 40000;
    for (let i = 0; i < N; i++) {
        wiesenTint.wiesenTint((i % 200) * 0.72 + 0.31, Math.floor(i / 200) * 0.72 + 0.17, lit, wet, aus, 0);
        for (let k = 0; k < 3; k++) s[k] += aus[k] / N;
    }
    console.log(`wiesenTint Licht ${lit} · Feuchte ${wet}: Faktor ${s.map((x) => x.toFixed(3)).join(" / ")} (R/G × ${(s[0] / s[1]).toFixed(2)})`);
    console.log("   " + zeile("Halm oben × Tint", halmOben.map((x, k) => x * s[k])));
}

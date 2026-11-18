// gras-sonde.js — Büschel der Nah-Wiese auf Pflaster: im Quadrat ±R um (X, Z) alle Kacheln der Nah-Wiese neu geworfen
// (`_nahWieseKachelBueschel`, derselbe Leser wie das Spiel), je Büschel die Deckung der Wege-Karte (`_wegeBelagAt`).
// Fläche des Pflasters aus einem 0,25-m-Raster. Gibt Zahl, Fläche, Büschel je m² für Pflaster ≥ 0,5, ≥ 0,98 und Erde/Rest.
module.exports = (X, Z, R) => `
const NW = AnazhRealm.NAH_WIESE, K = NW.kachel, aus = {}, o = { X: ${X}, Z: ${Z}, R: ${R}, kacheln: 0, offen: 0, bueschel: 0, p50: 0, p98: 0, erde: 0, liste: [] };
const lies = (x, z) => { r._wegeBelagAt(x, z, aus); return { p: aus.pflaster, e: aus.erde, g: aus.rasen }; };
for (let tx = Math.floor((o.X - o.R) / K); tx * K < o.X + o.R; tx++) for (let tz = Math.floor((o.Z - o.R) / K); tz * K < o.Z + o.R; tz++) {
    const L = r._nahWieseKachelBueschel(tx, tz); o.kacheln++;
    if (!L) { o.offen++; continue; }
    for (const b of L) { if (Math.abs(b.x - o.X) > o.R || Math.abs(b.z - o.Z) > o.R) continue; o.bueschel++; const v = lies(b.x, b.z);
        if (v.p >= 0.5) { o.p50++; if (o.liste.length < 60) o.liste.push([+b.x.toFixed(2), +b.y.toFixed(2), +b.z.toFixed(2), +v.p.toFixed(2), +v.g.toFixed(2)]); }
        if (v.p >= 0.98) o.p98++; if (v.p < 0.5 && v.e >= 0.5) o.erde++; }
}
let a50 = 0, a98 = 0, aE = 0, n = 0;
for (let x = o.X - o.R; x < o.X + o.R; x += 0.25) for (let z = o.Z - o.R; z < o.Z + o.R; z += 0.25) { const v = lies(x, z); n++; if (v.p >= 0.5) a50++; if (v.p >= 0.98) a98++; if (v.p < 0.5 && v.e >= 0.5) aE++; }
o.m2 = { alles: n / 16, p50: a50 / 16, p98: a98 / 16, erde: aE / 16 };
o.jeM2 = { p50: o.m2.p50 ? +(o.p50 / o.m2.p50).toFixed(3) : null, p98: o.m2.p98 ? +(o.p98 / o.m2.p98).toFixed(3) : null, erde: o.m2.erde ? +(o.erde / o.m2.erde).toFixed(3) : null, rest: +((o.bueschel - o.p50 - o.erde) / Math.max(1, o.m2.alles - o.m2.p50 - o.m2.erde)).toFixed(3) };
return o;`;

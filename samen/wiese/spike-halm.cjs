// WEGWERF (w28-samen-wiese) — der Halm-Spike: drei Fälle am selben Büschel, Zahlen und Bilder im selben Licht.
// node samen/wiese/spike-halm.cjs [form,form,...]
"use strict";
const fs = require("fs");
const path = require("path");
const { mitBuehne } = require("./buehne.cjs");
const { bueschel } = require("./halm.cjs");
const FORMEN = (process.argv[2] || "heute,mehr,trieb3").split(",");
const AUS = __dirname;
const b64 = (a) => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString("base64");
const rnd = (s) => () => ((s = (s + 0x6d2b79f5) >>> 0), (s = Math.imul(s ^ (s >>> 15), s | 1)), (s ^= s + Math.imul(s ^ (s >>> 7), s | 61)), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
function feld(w) {
    const out = [[], []];
    for (let gj = -2; gj * 0.72 < 16; gj++)
        for (let gi = -14; gi <= 14; gi++) {
            const x = gi * 0.72 + (w() - 0.5) * 0.68, z = gj * 0.72 + (w() - 0.5) * 0.68;
            const v = w() < 0.5 ? 0 : 1, s = 0.7 + w() * 0.7, rot = w() * Math.PI * 2;
            if (Math.hypot(x, z) >= 14) continue;
            out[v].push(x, 0, z, rot, s, 1, 1, 1);
        }
    return out;
}
(async () => {
    const zeilen = [];
    await mitBuehne(8794, async ({ geo, zeige, pixel }) => {
        const streif = { elev: 14, azim: 8 };
        for (const form of FORMEN) {
            // Bau-Zeit: Median aus 15 Bauten (der erste wärmt)
            const zeiten = [];
            let B = null;
            for (let i = 0; i < 16; i++) { B = [bueschel(form, 11), bueschel(form, 23)]; if (i) zeiten.push(B[0].mass.bauMs); }
            zeiten.sort((a, b) => a - b);
            for (const k of [0, 1]) await geo(form + k, [{ art: "grass", position: b64(B[k].position), color: b64(B[k].color), index: b64(B[k].index), doppel: true }]);
            const F = feld(rnd(7));
            const wiese = [{ key: form + 0, inst: F[0] }, { key: form + 1, inst: F[1] }];
            const eins = [{ key: form + 0, inst: [0, 0, 1, 0.6, 1, 1, 1, 1] }];
            const licht = { sonne: streif, fuell: 1.5, staerke: 3.0, boden: 0x8c8478 };
            await zeige(Object.assign({ objekte: eins, kamera: { pos: [0, 1.6, 0], ziel: [0, 0.15, 1.0], fov: 50 }, reich: 3 }, licht), path.join(AUS, `halm-${form}-bueschel-1m.png`));
            await zeige(Object.assign({ objekte: eins, kamera: { pos: [0.1, 0.3, -0.35], ziel: [0, 0.2, 1.0], fov: 50 }, reich: 3 }, licht), path.join(AUS, `halm-${form}-bueschel-seite.png`));
            const r = await zeige(Object.assign({ objekte: wiese, kamera: { pos: [0, 1.6, 0], ziel: [0, 0.15, 1.0], fov: 60 }, reich: 7 }, licht), path.join(AUS, `halm-${form}-feld-1m.png`));
            // die Deckung des Bodens im Ego-Bild: Anteil der Pixel, die NICHT Boden sind (der Boden ohne Schatten ist die hellste glatte Fläche —
            // gemessen im Bild ohne Licht-Unterschied: Boden in Signal-Farbe)
            await zeige({ objekte: wiese.map((o) => Object.assign({ grau: 0x000000 }, o)), kamera: { pos: [0, 1.6, 0], ziel: [0, 0.15, 1.0], fov: 60 }, sonne: { elev: 89, azim: 0 }, fuell: 6, staerke: 0.0001, boden: 0xff0000, himmel: 0x0000ff, reich: 7 });
            const px = await pixel();
            let rot = 0, alle = 0;
            for (let i = 0; i < px.daten.length; i += 4) { alle++; if (px.daten[i] > 120 && px.daten[i + 1] < 60) rot++; }
            await zeige(Object.assign({ objekte: wiese, kamera: { pos: [0, 1.6, 0], ziel: [0, 0.25, 10], fov: 40 }, reich: 16 }, licht), path.join(AUS, `halm-${form}-feld-10m.png`));
            const m = B[0].mass;
            const z = { form, fuesse: m.fuesse, blaetter: m.blaetter, dreiecke: m.dreiecke, ecken: m.ecken, breiteMm: +m.breiteMm.toFixed(1), bauMs: +zeiten[zeiten.length >> 1].toFixed(3), flaecheM2: +m.flaecheM2.toFixed(4), lai: +m.lai.toFixed(2), schlank: +m.schlank.toFixed(1), winkelGrad: +m.winkel.toFixed(1), feldDreiecke: r.tris, bodenFrei: +(rot / alle).toFixed(4) };
            zeilen.push(z);
            console.log(JSON.stringify(z));
        }
    });
    fs.writeFileSync(path.join(AUS, "halm-zahlen.json"), JSON.stringify(zeilen, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });

// WEGWERF (w28-samen-wiese) — SCHRITT 1 SIEH: die echten Kern-Puffer (bau.cjs) nackt im Streiflicht.
// node samen/wiese/sieh.cjs <dump-ordner>
"use strict";
const path = require("path");
const { mitBuehne, teileAusDump } = require("./buehne.cjs");
const D = process.argv[2];
const AUS = __dirname;
const rnd = (s) => () => ((s = (s + 0x6d2b79f5) >>> 0), (s = Math.imul(s ^ (s >>> 15), s | 1)), (s ^= s + Math.imul(s ^ (s >>> 7), s | 61)), ((s ^ (s >>> 14)) >>> 0) / 4294967296);
// das Feld der Wiese wie der Wirt es wirft (vegetation-wiese.js:131–152): Gitter 0,72 m, Jitter ±0,34, Skala 0,7–1,4, Gier frei
function feld(r0, r1, w) {
    const out = [[], []];
    for (let gj = -2; gj * 0.72 < 16; gj++)
        for (let gi = -14; gi <= 14; gi++) {
            const x = gi * 0.72 + (w() - 0.5) * 0.68, z = gj * 0.72 + (w() - 0.5) * 0.68;
            const v = w() < 0.5 ? 0 : 1, s = 0.7 + w() * 0.7, rot = w() * Math.PI * 2;
            const d = Math.hypot(x, z);
            if (d < r0 || d >= r1) continue;
            out[v].push(x, 0, z, rot, s, 1, 1, 1);
        }
    return out;
}
(async () => {
    await mitBuehne(8793, async ({ geo, zeige }) => {
        const GS = 0.24; // placement.scale.gras (foundry-core.js:673)
        for (const s of [1, 2]) for (const l of [1, 2]) await geo(`gras${s}l${l}`, teileAusDump(path.join(D, `gras-s${s}-l${l}.json`), GS));
        const nah = feld(0, 5, rnd(7)), mittel = feld(5, 14, rnd(7));
        const wiese = [
            { key: "gras1l1", inst: nah[0] }, { key: "gras2l1", inst: nah[1] },
            { key: "gras1l2", inst: mittel[0] }, { key: "gras2l2", inst: mittel[1] },
        ];
        const streif = { elev: 14, azim: 8 };
        const licht = { sonne: streif, fuell: 1.5, staerke: 3.0, boden: 0x8c8478 };
        let r;
        r = await zeige(Object.assign({ objekte: wiese, kamera: { pos: [0, 1.6, 0], ziel: [0, 0.15, 1.0], fov: 60 }, reich: 7 }, licht), path.join(AUS, "sieh-gras-feld-1m.png"));
        console.log("gras-feld-1m", r);
        r = await zeige(Object.assign({ objekte: wiese, kamera: { pos: [0, 1.6, 0], ziel: [0, 0.25, 10], fov: 40 }, reich: 16 }, licht), path.join(AUS, "sieh-gras-feld-10m.png"));
        console.log("gras-feld-10m", r);
        // EIN Büschel, allein: L1 auf 1 m (die Stufe der Welt 0–5 m), L2 auf 10 m (die Stufe 5–10 m)
        const eins = (key, z) => [{ key, inst: [0, 0, z, 0.6, 1, 1, 1, 1] }];
        r = await zeige(Object.assign({ objekte: eins("gras1l1", 1), kamera: { pos: [0, 1.6, 0], ziel: [0, 0.15, 1.0], fov: 50 }, reich: 3 }, licht), path.join(AUS, "sieh-bueschel-l1-1m.png"));
        console.log("bueschel-l1-1m", r);
        r = await zeige(Object.assign({ objekte: eins("gras1l2", 10), kamera: { pos: [0, 1.6, 0], ziel: [0, 0.2, 10], fov: 9 }, reich: 3 }, licht), path.join(AUS, "sieh-bueschel-l2-10m.png"));
        console.log("bueschel-l2-10m", r);
        // der Baum steht im Stamm-Spike (spike-stamm.cjs, Fall „heute": der Bau des Kerns)
    });
})().catch((e) => { console.error(e); process.exit(1); });

// kosmos-bahn systeme#1 am Prüfstand: MOND_EPHEMERIDE wörtlich aus dem Kandidaten (k2-kosmos.js) gegen den Leser des Spiels
// (welt-licht mondRichtung(sonnenWinkel(uhr), sonnenBahn(breite, phase, koerper, kosmosZeit(K, gestuft).mond)) — die Rechnung von
// stamm/bild-himmel.js `_dayNightMoonDirection` mit `_kosmosJetzt` in Stufen von HIMMEL.kosmosSchrittTage). ALT: der Leser vor dem
// Schnitt (die Gegen-Sonne, mondRichtung = −sonnenRichtung) gegen dieselbe Ephemeride.
"use strict";
const fs = require("fs"), vm = require("vm"), path = require("path");
const ROOT = path.resolve(__dirname, "../.."); // die Wurzel des Spiels
const H = require(path.join(ROOT, "scripts/lib/asset-worker-harness.cjs"));
const ctx = H.kernKontext();
ctx.window = ctx;
vm.runInContext(fs.readFileSync(path.join(ROOT, "foundry-core.js"), "utf8"), ctx);
vm.runInContext(fs.readFileSync(path.join(ROOT, "welt-licht.js"), "utf8") + "\n;this.__weltLicht = __weltLicht;", ctx);
const WL = ctx.__weltLicht;
const src = fs.readFileSync(process.argv[2], "utf8");
const a = src.indexOf("const MOND_EPHEMERIDE = "), b = src.indexOf("const HIMMEL_AN = ", a);
const MOND_EPHEMERIDE = new Function(src.slice(a, b) + "\nreturn MOND_EPHEMERIDE;")();
const schritt = 1 / 96; // stamm/bild-himmel.js:3766 HIMMEL.kosmosSchrittTage
const D = 180 / Math.PI, winkel = (p, q) => Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))) * D;
const aus = {};
for (const saat of ["anazh-realm-seed", "kosmos-s7"]) {
    const K = WL.kosmos(saat, { jahrTage: 365 });
    for (const [breite, koerper] of [[0.71, { neigungRad: 0.4091, drehsinn: 1, radiusKm: 6371 }], [-0.52, { neigungRad: 0.6, drehsinn: -1, radiusKm: 5200 }]]) {
        let max = 0, sum = 0, n = 0, altMax = 0;
        for (let i = 0; i < 2920; i++) {
            const t = i * 0.125 + 0.0371, uhr = t - Math.floor(t), phase = ((t % 365) + 365) % 365 / 365;
            const tS = Math.floor(t / schritt) * schritt; // die Stufe von _kosmosJetzt
            const w = WL.sonnenWinkel(uhr);
            const bahn = WL.sonnenBahn(breite, phase, koerper, WL.kosmosZeit(K, tS).mond);
            const spiel = WL.mondRichtung(w, bahn), eph = MOND_EPHEMERIDE(K, t, phase, w, breite, koerper);
            const s = WL.sonnenRichtung(w, bahn), alt = [-s[0], -s[1], -s[2]];
            const g = winkel(spiel, eph);
            max = Math.max(max, g); sum += g; n++;
            altMax = Math.max(altMax, winkel(alt, eph));
        }
        aus[saat + "@" + breite] = { n, maxGrad: +max.toFixed(4), mittelGrad: +(sum / n).toFixed(4), altGegenSonneMaxGrad: +altMax.toFixed(2) };
    }
}
console.log(JSON.stringify(aus));

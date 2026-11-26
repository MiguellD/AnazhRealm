// s2-hand.cjs — planet.kopplung.gegenwart S2 von Hand unter node: dieselbe Rechnung wie die Station (k2-zusammenspiel.js, `seite` s2),
// derselbe Auftrag wie der Planet-Faden (voxel-worker.js planetOrtAuftrag: planet-core planetScheibe · planetOrt · planetPunkt am
// Ort-Gesetz des Gelände-Kerns). Aufruf aus der Wurzel von main:  node bericht/2611-stationen/gegenwart2/s2-hand.cjs <saaten> [weltSaat]
// Richter (wörtlich, meisterkarte-2.json): „100 Saaten: Gipfel > 2 km an einer jemals konvergenten Grenze ≥ 95 %“.
"use strict";
const path = require("path");
const R = process.cwd();
globalThis.self = globalThis;
require(path.join(R, "gelaende-core.js"));
const G = globalThis.__gelaendeCore;
const P = require(path.join(R, "planet-core.js"));
const N = +(process.argv[2] || 12), WELT = process.argv[3] || "anazh-realm-seed";
const RAD = Math.PI / 180;
const plaene = new Map();
const planVon = (s) => plaene.get(s) || (plaene.set(s, P.planetPlan(s, P.PLANET_ERDE)), plaene.get(s));
const ort = (samen, b, l, t = 0) => {
    const plan = planVon(samen);
    const S = P.planetScheibe(plan, t);
    const o = P.planetOrt(S, b * RAD, l * RAD, G.ortGesetz(), undefined, planVon(samen));
    const p = {};
    P.planetPunkt(S, b * RAD, l * RAD, 16, p);
    return { land: p.hoeheM > 0, hoeheM: p.hoeheM, ks: o.delta.wildnis.ks };
};
const t0 = Date.now();
const gip = { gipfel: 0, konv: 0, saaten: 0, land: 0, landKonv: 0 };
const jeSaat = [];
for (let si = 0; si < N; si++) {
    const s = si === 0 ? WELT : "zsp-" + (si - 1);
    const Pq = [];
    for (let b = -66; b <= 66; b += 6) for (let l = -180; l < 180; l += 6) Pq.push([b, l]);
    const o = Pq.map((q) => ort(s, q[0], q[1]));
    const nb = 60;
    const ksMin = Math.min(...o.filter((x) => x.land).map((x) => x.ks));
    let g = 0, k = 0;
    o.forEach((x, i) => {
        if (x.land) { gip.land++; if (x.ks > ksMin + 0.05) gip.landKonv++; }
        if (!(x.land && x.hoeheM > 2000)) return;
        const nachbarn = [i - 1, i + 1, i - nb, i + nb].filter((j) => j >= 0 && j < o.length).map((j) => o[j].hoeheM);
        if (nachbarn.some((h) => h > x.hoeheM)) return;
        g++;
        if (x.ks > ksMin + 0.05) k++;
    });
    gip.gipfel += g; gip.konv += k; gip.saaten++;
    jeSaat.push([s, g, k]);
}
const proz = gip.gipfel ? Math.round((1000 * gip.konv) / gip.gipfel) / 10 : null;
console.log(JSON.stringify({ saaten: gip.saaten, gipfel: gip.gipfel, konv: gip.konv, gipfelProzent: proz, landProzent: gip.land ? Math.round((1000 * gip.landKonv) / gip.land) / 10 : null, ms: Date.now() - t0, version: P.VERSION }));
const schlecht = jeSaat.filter(([, g, k]) => g && k / g < 0.95).map(([s, g, k]) => s + " " + k + "/" + g);
console.log("Saaten unter 95 %: " + schlecht.length + (schlecht.length ? " — " + schlecht.slice(0, 12).join(" · ") : ""));

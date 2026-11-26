// s2-kandidat.cjs — der Kandidat der korrigierten Station planet.kopplung.gegenwart S2 (meisterkarte-quelle/punkte/stationen/
// k2-zusammenspiel.js, `[P]` gegenwart): der Stations-Fehler ist das Literal `S(seite, { saaten: 12, budgetMs: 22000 })` gegen den
// Richter „100 Saaten: Gipfel > 2 km an einer jemals konvergenten Grenze ≥ 95 %“ (wörtlich) — die Station misst 12 und meldet „der
// Zeuge der Welt fehlt: nur 12 Saaten (Soll 100)“. Der Kandidat rechnet S2 wie S1 auf der node-Seite im Kern des Kopfs (PCk =
// planet-core.js, Ort-Gesetz aus gelaende-core.js — derselbe Auftrag wie voxel-worker.js planetOrtAuftrag: planetScheibe · planetOrt ·
// planetPunkt), dasselbe Gitter (6° × 6°, ±66°), dieselbe Gipfel-Regel (Land, > 2 000 m, kein 4er-Nachbar höher), dasselbe Maß
// (Δ ks > ksMin der Saat + 0,05) — über 100 Saaten, gefächert über die Kerne der Maschine (worker_threads), damit es in den Deckel passt.
// Aufruf aus der Wurzel von main:  node bericht/2611-stationen/gegenwart2/s2-kandidat.cjs [saaten=100] [faeden=Kerne] [weltSaat]
"use strict";
const path = require("path");
const os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");

function saatRechnen(R, samen) {
    globalThis.self = globalThis;
    if (!globalThis.__gelaendeCore) require(path.join(R, "gelaende-core.js"));
    const G = globalThis.__gelaendeCore;
    const P = require(path.join(R, "planet-core.js"));
    const RAD = Math.PI / 180, og = G.ortGesetz();
    const plan = P.planetPlan(samen, P.PLANET_ERDE), S = P.planetScheibe(plan, 0);
    const o = [];
    for (let b = -66; b <= 66; b += 6)
        for (let l = -180; l < 180; l += 6) {
            const x = P.planetOrt(S, b * RAD, l * RAD, og, undefined, plan), p = {};
            P.planetPunkt(S, b * RAD, l * RAD, 16, p);
            o.push({ land: p.hoeheM > 0, hoeheM: p.hoeheM, ks: x.delta.wildnis.ks });
        }
    const nb = 60, ksMin = Math.min(...o.filter((x) => x.land).map((x) => x.ks));
    const a = { samen, gipfel: 0, konv: 0, land: 0, landKonv: 0, antworten: o.length, version: P.VERSION };
    o.forEach((x, k) => {
        if (x.land) { a.land++; if (x.ks > ksMin + 0.05) a.landKonv++; }
        if (!(x.land && x.hoeheM > 2000)) return;
        const nachbarn = [k - 1, k + 1, k - nb, k + nb].filter((j) => j >= 0 && j < o.length).map((j) => o[j].hoeheM);
        if (nachbarn.some((h) => h > x.hoeheM)) return;
        a.gipfel++;
        if (x.ks > ksMin + 0.05) a.konv++;
    });
    return a;
}

if (!isMainThread) {
    for (const s of workerData.saaten) parentPort.postMessage(saatRechnen(workerData.R, s));
    parentPort.postMessage(null);
} else {
    const R = process.cwd();
    const N = +(process.argv[2] || 100), F = +(process.argv[3] || os.cpus().length), WELT = process.argv[4] || "anazh-realm-seed";
    const saaten = Array.from({ length: N }, (_, si) => (si === 0 ? WELT : "zsp-" + (si - 1)));
    const t0 = Date.now(), je = [];
    let offen = F;
    for (let f = 0; f < F; f++) {
        const w = new Worker(__filename, { workerData: { R, saaten: saaten.filter((_, i) => i % F === f) } });
        w.on("message", (m) => {
            if (m) return je.push(m);
            if (--offen) return;
            const g = { saaten: je.length, gipfel: 0, konv: 0, land: 0, landKonv: 0, antworten: 0 };
            for (const a of je) for (const k of ["gipfel", "konv", "land", "landKonv", "antworten"]) g[k] += a[k];
            const proz = (z, n) => (n ? Math.round((1000 * z) / n) / 10 : null);
            console.log(JSON.stringify({ ...g, gipfelProzent: proz(g.konv, g.gipfel), landProzent: proz(g.landKonv, g.land), faeden: F, ms: Date.now() - t0, version: je[0] && je[0].version }));
            const schlecht = je.filter((a) => a.gipfel && a.konv / a.gipfel < 0.95).map((a) => a.samen + " " + a.konv + "/" + a.gipfel);
            console.log("Saaten unter 95 %: " + schlecht.length + (schlecht.length ? " — " + schlecht.join(" · ") : ""));
        });
        w.on("error", (e) => { console.error("Faden warf: " + e.message); process.exitCode = 1; });
    }
}

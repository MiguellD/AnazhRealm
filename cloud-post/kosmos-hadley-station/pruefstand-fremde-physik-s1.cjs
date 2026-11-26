// fremde-physik#1 am Prüfstand: FP_AN und die Regression WÖRTLICH aus der Stationsdatei (k2-leben.js, geschnitten zwischen
// `const FP_AN = ` und `const geladen = ` bzw. `const je = R1.je` und `const n = (a.saaten`), über den FÄCHER (stationen/faecher.js,
// required) in der EINEN Welt des Spiels (scripts/lib/welt-boot.cjs nullWelt der Wurzel, die Seite des Spiels): jede Adresse ruft den
// Guss des Spiels `_buildCreatureGroup("wolf")` unter state.gravity — kein Kern-Fächer in node, jede Probe geht durch den Leser des Spiels.
// Aufruf (aus der Wurzel des Spiels):  node <dieser Pfad> <…/stationen/k2-leben.js> [<…/stationen/faecher.js>]
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = process.cwd();
const src = fs.readFileSync(process.argv[2], "utf8");
const { FAECHER } = require(path.resolve(process.argv[3] || path.join(path.dirname(process.argv[2]), "faecher.js")));
const schnitt = (von, bis) => {
    const a = src.indexOf(von), b = src.indexOf(bis, a);
    if (a < 0 || b < 0) throw new Error("der Stationstext trägt „" + von + "“ … „" + bis + "“ nicht");
    return src.slice(a, b);
};
const FP_AN = new Function(schnitt("const FP_AN = ", "const geladen = ") + "\nreturn FP_AN;")();
const REGRESSION = new Function("R1", "a", schnitt("const je = R1.je.map", "const n = (a.saaten") + "\nreturn { je, steigung: a.steigung, saatenJeG, gMin: a.gMin, gMax: a.gMax };");
const { statikServer, nullWelt } = require(path.join(ROOT, "scripts/lib/welt-boot.cjs"));
(async () => {
    const server = statikServer();
    const { browser, page } = await nullWelt(server, { da: (r) => r.state && r.state.player, frist: 300000 }, 120000);
    const ev = (code) => page.evaluate((c) => new Function("r", "T", "return (async () => {" + c + "})();")(window.r, {}), code);
    const geladen = await ev("return r.state.worldMeta && r.state.worldMeta.seed;");
    const t0 = Date.now();
    const R1 = await FAECHER(ev, {
        gesetz: { fn: FP_AN, export: "stamm/koerper-leib.js _buildCreatureGroup (Guss unter state.gravity)", leser: "stamm/koerper-leib.js _gangZeile" },
        adressen: { saaten: [geladen, ...Array.from({ length: 50 }, (_, i) => "evo-g-saat-" + (i + 1))], orte: [0.3, 1, 3] },
        ms: 8000,
        masse: { gMin: { wie: "min", feld: "f" }, gMax: { wie: "max", feld: "f" }, guesse: { wie: "anzahl", nur: "saat" } },
        schlecht: { feld: "A", richtung: "max" },
    });
    const ms = Date.now() - t0;
    const a = {};
    a.gMin = R1.werte.gMin;
    a.gMax = R1.werte.gMax;
    const r = REGRESSION(R1, a);
    console.log(JSON.stringify({
        wurzel: ROOT, saat: geladen, steigung: r.steigung, saatenJeG: r.saatenJeG, gMin: r.gMin, gMax: r.gMax, gemessen: R1.gemessen, adressen: R1.adressen,
        fehler: R1.fehler.length, fehlt: R1.fehlt, faecherMs: R1.ms, gesamtMs: ms,
        je: r.je.map((x) => ({ f: x.f, A: x.A, beine: x.beine, ringe: x.ringe, haut: x.haut, rumpfA: x.rumpfA, omega: x.omega })),
    }));
    await browser.close();
    server.close && server.close();
    process.exit(0);
})();

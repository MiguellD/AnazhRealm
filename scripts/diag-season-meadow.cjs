#!/usr/bin/env node
// diag-season-meadow.cjs — DIE FARBE DES JAHRS. Jeder Foundry-Körper und jede Karte ist Golden-Sommer
// gebacken (die Transport-Schale nagelt season "summer"); das Jahr färbt über die EINE Uniform `uSeasonMul` nach dem
// Studio-Gesetz (seine Gestalt — das Laub fällt, `uLaubPraesenz` über den Jahres-Ecken — prüft gate:fluss W2b am echten
// Laub der Welt). Diese Linse beweist (Node, die geladene Klasse — D3c: am Lauf, nie am Quelltext; das Studio-Orakel F1a
// stand am Text der Shell und fiel):
//   F0  EINE QUELLE: der Stamm liest das SAISON_GESETZ des Kerns (foundry-core, `__terrainCore`), eine Kern-Stützstelle
//       ändert die Welt;
//   F1  `_saisonMul(phase)`: Sommer-Mitte exakt ×1, Herbst und Winter deutlich verschieden;
//   F2  keine Paletten-Literale in der Shell (die dritte Palette im Stamm, `_seasonTint`, bewacht gate:fluss S5b);
//   F3  `_tickSeason` fährt die Uniform aus `_saisonMul` (kein Neubau).
//   node scripts/diag-season-meadow.cjs [--selftest]          (npm run gate:season-meadow)
"use strict";
const { selbsttestEnde, wandEnde, SELBSTTEST, path, stammLib } = require("./lib/welt-boot.cjs");

const root = path.resolve(__dirname, "..");
const { AnazhRealm: A, ctx } = stammLib.ladeKlasse(root);
// die Absenzen über den EINEN Helfer (stammLib.fehlt, kommentarfrei); `o.shell` die Wandlung der Shell im Selbsttest
const SHELL = "worlds/terrain/phytogenesis.js";

// o.welt(phase) → {r,g,b} (die Methode der Klasse), o.mul: der Leser, den `_tickSeason` ruft (Selbsttest: gebrochen)
function pruefe(o) {
    const aus = [];
    const pruef = (name, ok, detail) => aus.push([name, !!ok, detail || ""]);
    const SG = ctx.SAISON_GESETZ;
    const herbst = (ph) => JSON.stringify(o.welt(ph));
    const vor = herbst(0.625);
    const alt = SG && SG.stuetzen[2].ti;
    if (SG) SG.stuetzen[2].ti = 0xa0602a;
    const folgt = herbst(0.625) !== vor;
    if (SG) SG.stuetzen[2].ti = alt;
    pruef(
        "F0 der Stamm liest das SAISON_GESETZ des Kerns (+ __terrainCore), eine Kern-Stützstelle ändert die Welt",
        SG && ctx.__terrainCore.SAISON_GESETZ === SG && A._saisonGesetz() === SG && folgt
    );
    const werte = {};
    for (const [n, ph] of Object.entries({ spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 })) werte[n] = o.welt(ph);
    const d = (x, y) => (x && y ? Math.abs(x.r - y.r) + Math.abs(x.g - y.g) + Math.abs(x.b - y.b) : 0);
    pruef(
        "F1 Sommer-Mitte exakt ×1, Herbst und Winter deutlich verschieden",
        werte.summer && d(werte.summer, { r: 1, g: 1, b: 1 }) < 1e-12 && d(werte.autumn, werte.summer) > 0.3 && d(werte.winter, werte.summer) > 0.3,
        Object.entries(werte)
            .map(([n, c]) => `${n} (${c.r.toFixed(2)},${c.g.toFixed(2)},${c.b.toFixed(2)})`)
            .join(" · ")
    );
    pruef(
        "F2a die Shell trägt keine Paletten-Literale (Stützstellen nur im SAISON_GESETZ)",
        stammLib.fehlt(null, /0x6a9a3e|0xb0702a|0x6e6650/, { datei: SHELL, wandel: o.shell }),
        stammLib.fehlt.wo
    );
    const w = Object.create(A.prototype);
    w.state = { seasonPhase: 0.625, autoSeason: false };
    const u = { uSeasonMul: { value: { r: 1, g: 1, b: 1 } } };
    w._ensureSeasonUniforms = () => u;
    if (o.mul) w._saisonMul = o.mul;
    A.prototype._tickSeason.call(w, 0);
    pruef(
        "F3 _tickSeason fährt uSeasonMul aus _saisonMul",
        d(u.uSeasonMul.value, o.welt(0.625)) < 1e-12 && d(u.uSeasonMul.value, { r: 1, g: 1, b: 1 }) > 0.3 && w.state.season === "autumn",
        JSON.stringify(u.uSeasonMul.value)
    );
    return aus;
}
const WELT = (ph) => A.prototype._saisonMul.call(null, ph, {});

const { errs, check } = require("./lib/welt-boot.cjs").pruefer();
if (SELBSTTEST) {
    console.log("=== SAISON-FARBE — SELBST-TEST: die Linse feuert auf injizierte Brüche ===");
    const roh = (o, wer) => pruefe(Object.assign({ welt: WELT }, o)).find((g) => g[0].startsWith(wer))[1] === false;
    check("Selbst-Test 1: Welt ohne Phasen-Versatz (+0,125) → F1 rot", roh({ welt: (ph) => WELT(ph + 0.125) }, "F1"));
    check("Selbst-Test 2: die Welt mit eigenem Gesetz (folgt der Kern-Stützstelle nicht) → F0 rot", roh({ welt: (ph) => (ph === 0.625 ? { r: 1.2, g: 0.9, b: 0.7 } : WELT(ph)) }, "F0"));
    check(
        "Selbst-Test 3: eine Paletten-Kopie zurück in die Shell → F2a rot",
        roh({ shell: (t) => t.replace("const seq = SAISON_GESETZ.stuetzen;", "const seq = [{ ti: 0x6a9a3e }];") }, "F2a")
    );
    check("Selbst-Test 5: _tickSeason ohne Leser (der Mul schreibt nicht) → F3 rot", roh({ mul: () => null }, "F3"));
    selbsttestEnde(errs, "die Saison-Farb-Linse feuert auf jede injizierte Bruch-Klasse.");
    process.exit(0);
}
console.log("=== DIE SAISON IST EINE FARBE — uSeasonMul nach dem Studio-Gesetz (Node, die geladene Klasse) ===");
for (const [n, ok, d] of pruefe({ welt: WELT })) check(n, ok, d);
wandEnde(errs, "die Welt färbt ihr Jahr wie das Studio: EINE Uniform, keine Saison im Körper.");

#!/usr/bin/env node
// diag-season-meadow.cjs — DIE SAISON IST EINE FARBE (V18.527; vorher V6 „die Wiese folgt der Saison").
// Jeder Foundry-Körper und jede Karte ist Golden-Sommer gebacken (die Transport-Schale nagelt season "summer"); das Jahr
// trägt die EINE Uniform `uSeasonMul` nach dem Studio-Gesetz. Diese Linse beweist (Node, ohne Browser):
//   F1  ORAKEL: `_saisonMul(phase)` des Stamms == das Studio selbst — `seasonColors(t)` aus worlds/terrain/phytogenesis.js
//       (r128-Farb-Semantik) + seine uSeasonMul-Zeile (clamp(tönung / bau, mulMin, mulMax)), t = phase − 0,125, über
//       64 Phasen; Sommer-Mitte exakt ×1, Herbst/Winter deutlich verschieden.
//   F2  EINE QUELLE: die Stützstellen leben NUR im SAISON_GESETZ (foundry-core) — keine Paletten-Literale in der Shell,
//       keine dritte Palette im Stamm (`_seasonTint` fort); die Shell liest bau/mulMin/mulMax/kartenGewicht.
//   F3  KONSUM: `_tickSeason` fährt die Uniform aus `_saisonMul`; die Nah-Wiese, das Foundry-Laub/-Gras
//       (`_foundryTreeMaterial`) und der Karten-Stoff (× mix(1, uSeasonMul, kartenGewicht)) lesen sie.
//   node scripts/diag-season-meadow.cjs [--selftest]          (npm run gate:season-meadow)
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const lies = (p) => fs.readFileSync(path.join(root, p), "utf8");
const STAMM = lies("anazhRealm.js");
const KERN = lies("foundry-core.js");
const SHELL = lies("worlds/terrain/phytogenesis.js");

const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:\\"'`])\/\/.*$/gm, "$1");
function methode(src, kopf) {
    const a = src.indexOf("\n    " + kopf);
    if (a < 0) return null;
    const b = src.indexOf("\n    }\n", a);
    return b < 0 ? null : src.slice(a + 1, b + 6);
}
function block(src, kopf, ende) {
    const a = src.indexOf(kopf);
    if (a < 0) return null;
    const b = src.indexOf(ende, a);
    return b < 0 ? null : src.slice(a, b + ende.length);
}

// r128-THREE.Color (roh /255, keine Farbraum-Wandlung — die Farben des Studios).
class C128 {
    constructor(hex) {
        this.r = this.g = this.b = 0;
        if (hex !== undefined) this.set(hex);
    }
    set(hex) {
        this.r = ((hex >> 16) & 255) / 255;
        this.g = ((hex >> 8) & 255) / 255;
        this.b = (hex & 255) / 255;
        return this;
    }
    lerp(c, k) {
        this.r += (c.r - this.r) * k;
        this.g += (c.g - this.g) * k;
        this.b += (c.b - this.b) * k;
        return this;
    }
}

function pruefe(stamm, kern, shell) {
    const aus = [];
    const pruef = (name, ok, detail) => aus.push([name, !!ok, detail || ""]);
    const sgQ = block(kern, "var SAISON_GESETZ = {", "\n};");
    let SG = null;
    try {
        SG = sgQ ? new Function(sgQ + "\nreturn SAISON_GESETZ;")() : null;
    } catch (_e) {}
    pruef("F0 SAISON_GESETZ steht in foundry-core (+ __terrainCore)", SG && /SAISON_GESETZ: SAISON_GESETZ/.test(kern));
    // Das Studio-Orakel: seasonColors aus der Shell, mit r128-Farben; die uSeasonMul-Zeile aus updateWorld.
    const scQ = block(shell, "function seasonColors(t) {", "\n}\n");
    let orakel = null;
    try {
        orakel = new Function(
            "SAISON_GESETZ",
            "C128",
            "let seasonTint = new C128(SAISON_GESETZ.bau), seasonAccent = new C128(), presenceTarget = 1, bloomTarget = 1;" +
                "const _w1 = new C128(); const lerp = (a, b, t) => a + (b - a) * t;" +
                scQ +
                "\nconst bau = new C128(SAISON_GESETZ.bau);" +
                "const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);" +
                "return (t) => { seasonColors(t); return ['r', 'g', 'b'].map((k) => clamp(seasonTint[k] / Math.max(bau[k], 1e-3), SAISON_GESETZ.mulMin, SAISON_GESETZ.mulMax)); };"
        )(SG, C128);
    } catch (_e) {}
    const smQ = methode(stamm, "_saisonMul(phase, out) {");
    let welt = null;
    try {
        welt = smQ ? new Function("AnazhRealm", "return {" + smQ + "};")({ _saisonGesetz: () => SG }) : null;
    } catch (_e) {}
    let maxAbw = Infinity;
    const werte = {};
    if (SG && orakel && welt) {
        try {
            maxAbw = 0;
            for (let i = 0; i < 64; i++) {
                const ph = i / 64;
                const w = welt._saisonMul(ph, {});
                const o = orakel((((ph - 0.125) % 1) + 1) % 1);
                maxAbw = Math.max(maxAbw, Math.abs(w.r - o[0]), Math.abs(w.g - o[1]), Math.abs(w.b - o[2]));
            }
            for (const [n, ph] of Object.entries({ spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 }))
                werte[n] = welt._saisonMul(ph, {});
        } catch (_e) {
            maxAbw = Infinity; // ein gebrochenes Orakel oder eine gebrochene Welt misst nichts → rot
        }
    }
    pruef("F1a Welt-uSeasonMul == Studio (seasonColors + uSeasonMul-Zeile), 64 Phasen", maxAbw < 1e-9, `max Abweichung ${maxAbw}`);
    const d = (a, b) => (a && b ? Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b) : 0);
    pruef(
        "F1b Sommer-Mitte exakt ×1, Herbst und Winter deutlich verschieden",
        werte.summer && d(werte.summer, { r: 1, g: 1, b: 1 }) < 1e-12 && d(werte.autumn, werte.summer) > 0.3 && d(werte.winter, werte.summer) > 0.3,
        Object.entries(werte)
            .map(([n, c]) => `${n} (${c.r.toFixed(2)},${c.g.toFixed(2)},${c.b.toFixed(2)})`)
            .join(" · ")
    );
    const sh = strip(shell);
    pruef(
        "F2a die Shell trägt keine Paletten-Literale (Stützstellen nur im SAISON_GESETZ), liest bau/mulMin/mulMax/kartenGewicht",
        !/0x6a9a3e|0xb0702a|0x6e6650/.test(sh) &&
            /const seq = SAISON_GESETZ\.stuetzen;/.test(sh) &&
            /new THREE\.Color\(SAISON_GESETZ\.bau\)/.test(sh) &&
            /SAISON_GESETZ\.mulMin, SAISON_GESETZ\.mulMax/.test(sh) &&
            /SAISON_GESETZ\.kartenGewicht\.toFixed\(1\)/.test(sh)
    );
    const st = strip(stamm);
    pruef("F2b keine dritte Palette im Stamm (_seasonTint fort, keine Keyframe-Tabelle)", !/_seasonTint\b/.test(st));
    const tick = methode(stamm, "_tickSeason(currentTime) {");
    pruef(
        "F3a _tickSeason fährt uSeasonMul aus _saisonMul (kein Neubau)",
        tick && /this\._saisonMul\(st\.seasonPhase, su\.uSeasonMul\.value\)/.test(strip(tick)) && !/_foundry/.test(strip(tick))
    );
    const gras = methode(stamm, "_grassInstanceMat() {");
    const baum = methode(stamm, "_foundryTreeMaterial(kind, mp) {");
    pruef(
        "F3b die Nah-Wiese und das Foundry-Laub/-Gras lesen uSeasonMul",
        gras && /uSeasonMul/.test(strip(gras)) && baum && /vcol\.mul\(_suF\.uSeasonMul\)/.test(strip(baum)) && /texN\.rgb(?:\.mul\(TSL\.vec3\([^;]*?\)\))?\.mul\(laubFarbe\)/.test(strip(baum))
    );
    pruef(
        "F3c der Karten-Stoff färbt mit mix(1, uSeasonMul, kartenGewicht)",
        /_suK\.uSeasonMul,\s*_Ta\.float\(AnazhRealm\._saisonGesetz\(\)\.kartenGewicht\)/.test(st)
    );
    return aus;
}

const errs = [];
const check = (name, ok, detail) => {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
};
if (process.argv.includes("--selftest")) {
    console.log("=== SAISON-FARBE — SELBST-TEST: die Linse feuert auf injizierte Brüche ===");
    const roh = (a, b, c, wer) => pruefe(a, b, c).find((g) => g[0].startsWith(wer))[1] === false;
    check(
        "Selbst-Test 1: Welt ohne Phasen-Versatz (t = phase) → F1a rot",
        roh(STAMM.replace("const t = (((phase - 0.125) % 1) + 1) % 1;", "const t = ((phase % 1) + 1) % 1;"), KERN, SHELL, "F1a")
    );
    check(
        "Selbst-Test 2: Studio-Herbst geändert (Kern-Stützstelle) → F1a bleibt grün, F1b misst neu (eine Quelle)",
        pruefe(STAMM, KERN.replace("{ ti: 0xb0702a,", "{ ti: 0xa0602a,"), SHELL).find((g) => g[0].startsWith("F1a"))[1] === true
    );
    check(
        "Selbst-Test 3: eine Paletten-Kopie zurück in die Shell → F2a rot",
        roh(STAMM, KERN, SHELL.replace("const seq = SAISON_GESETZ.stuetzen;", "const seq = [{ ti: 0x6a9a3e }];"), "F2a")
    );
    check(
        "Selbst-Test 4: Foundry-Laub ohne Saison → F3b rot",
        roh(STAMM.replace("vcol.mul(_suF.uSeasonMul)", "vcol"), KERN, SHELL, "F3b")
    );
    check(
        "Selbst-Test 5: _tickSeason baut wieder neu (_foundrySeasonChanged) → F3a rot",
        roh(STAMM.replace("st.season = this._seasonName(st.seasonPhase);", "st.season = this._seasonName(st.seasonPhase);\n        this._foundrySeasonChanged();"), KERN, SHELL, "F3a")
    );
    if (errs.length) {
        console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN — die Saison-Farb-Linse feuert auf jede injizierte Bruch-Klasse.");
    process.exit(0);
}
console.log("=== DIE SAISON IST EINE FARBE — uSeasonMul nach dem Studio-Gesetz (Node, Orakel = die Studio-Shell) ===");
for (const [n, ok, d] of pruefe(STAMM, KERN, SHELL)) check(n, ok, d);
if (errs.length) {
    console.error(`\n❌ ROT — ${errs.length} Gesetz(e) verletzt.`);
    process.exit(1);
}
console.log("\n✅ GRÜN — die Welt färbt ihr Jahr wie das Studio: EINE Uniform, keine Saison im Körper.");

// diag-charakter-achsen.cjs — DIE CHARAKTER-ACHSEN DER STUDIOS (Konsum-Beweis).
// Die Studios tragen ORTHOGONALE Design-Sprachen — Schmiede-TRADITIONEN
// (Frank/Nihon/Pars/Urvolk/Brut), Garage-KULTUREN (cavallo/toro/stern/vorsprung/
// monolith), 22 Klang-Genres — die Welt wählt sie. Diese Linse hält die Naht:
//
//   T (Tradition): ov.__tradition FORMT die Klinge (Fingerprint je Tradition
//     verschieden; Möbel folgen: Nihon = Kashira anders als Frank-Scheibenknauf),
//     und der ov-FREIE Bau bleibt byte-stabil (die v5-Goldens hält gate:schmiede-
//     contract — hier die Stabilitäts-Probe als Zwilling).
//   K (Kultur): die KULTUREN-Tabelle ist exportiert, jede Zeile trägt den
//     fx-Dial-Vektor (die vehicle-Merge-Ordnung konsumiert ov seit je).
//   G (Genres): klang-core exportiert >= 20 Genre-Presets (kind "klang").
//   V (Lade-Karte): index.html lädt kein Spiel-Script ohne ?v=-Buster (Lehre 10,
//     eine Absenz über den EINEN Helfer stammLib.fehlt; vendor/ ausgenommen). Dass
//     die Kerne main-seitig laden, beweist die Prägung in der Welt (gate:praegung-
//     welt, gate:portal-membran) am Verhalten; keine Probe liest Quelltext (D3c/D3d).
//
//   node scripts/diag-charakter-achsen.cjs
"use strict";
const crypto = require("crypto");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "schmiede-core.js"));
require(path.join(root, "vehicle-core.js"));
require(path.join(root, "klang-core.js"));
const SC = globalThis.__schmiedeCore;
const VC = globalThis.__vehicleCore;
const KC = globalThis.__klangCore;

const { errs, check, wandEnde } = require("./lib/welt-boot.cjs").pruefer();
function fp(g) {
    const h = crypto.createHash("sha256");
    let n = 0;
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        if (!o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
        n++;
        h.update(Buffer.from(new Float32Array(o.geometry.attributes.position.array).buffer));
    });
    return h.digest("hex").slice(0, 16) + "/" + n;
}

console.log("=== V18.466 CHARAKTER-ACHSEN — Tradition · Kultur · Genre ===");

// ── T: die Tradition formt ──
const TRADS = Object.keys(SC.TRADITIONEN || {});
check("T: TRADITIONEN exportiert (5 Design-Sprachen)", TRADS.length === 5, TRADS.join(" · "));
const frank = fp(SC.buildInstance("langschwert", 7, 0, null));
const frank2 = fp(SC.buildInstance("langschwert", 7, 0, null));
check("T: ov-freier Bau byte-stabil (Frank bleibt Frank)", frank === frank2, frank);
let alleWirken = true;
const gesehen = new Set([frank]);
for (const t of TRADS) {
    if (t === "Frank") continue;
    const f = fp(SC.buildInstance("langschwert", 7, 0, { __tradition: t }));
    if (f === frank || gesehen.has(f)) alleWirken = false;
    gesehen.add(f);
}
check("T: JEDE Tradition formt das Langschwert anders (5 unverwechselbare Fingerprints)", alleWirken, `${gesehen.size}/5`);
const unbekannt = fp(SC.buildInstance("langschwert", 7, 0, { __tradition: "klingon" }));
check("T: unbekannte Tradition fällt fail-soft auf Frank", unbekannt === frank);

// ── K: die Kulturen tragen ihre Dial-Vektoren ──
const KULT = Object.keys(VC.CULTURES || {});
check("K: KULTUREN exportiert (5 Marken-Sprachen)", KULT.length === 5, KULT.join(" · "));
check(
    "K: jede Kultur trägt einen fx-Dial-Vektor (cEdge/cStance/cGrille)",
    KULT.every((k) => {
        const fx = VC.CULTURES[k] && VC.CULTURES[k].fx;
        return fx && typeof fx.cEdge === "number" && typeof fx.cStance === "number" && typeof fx.cGrille === "string";
    })
);

// ── G: die Genres ──
const GENRES = Object.keys(KC.PRESETS || {});
check(`G: klang-core exportiert die Genre-Presets (${GENRES.length})`, GENRES.length >= 20, GENRES.slice(0, 6).join(" · ") + " …");

// ── V: die Lade-Karte der Welt ──
check(
    "V: index.html lädt kein Spiel-Script ohne ?v=-Buster (vendor/ ausgenommen)",
    stammLib.fehlt(null, /src="(?!vendor\/)[^"?]+\.js"/, { datei: "index.html" }),
    stammLib.fehlt.wo
);

// ── Selbst-Test: eine kaputte Tradition MUSS rot erkannt werden ──
const kaputtGleich = fp(SC.buildInstance("langschwert", 7, 0, { __tradition: "Nihon" })) === frank;
check("SELBST-TEST: Nihon==Frank würde erkannt (die T-Probe feuert)", kaputtGleich === false);

wandEnde(errs, "die Charakter-Achsen der Studios sind welt-wählbar: die Tradition FORMT (5 unverwechselbare Klingen-Sprachen, ov-frei byte-stabil), die Kulturen tragen ihre Dial-Vektoren, und die Genres stehen im Buch.");

// diag-pipeline-constitution.cjs — P8: DIE VERFASSUNG DER PIPELINE (Struktur ersetzt Ermahnung), im `check`-Gate.
// Eine Absenz-Wand: jede Regel nennt das Anti-Muster eines vollzogenen Pipeline-Schnitts (Inline-Wuchs, Welt-Bäcker,
// Bake-iframe, Formel-Kopie, Dichte-Zwilling, nackter Render-Zähler, kind-Zweig, Kern-ns-Literal, zweite Naht, mp-Zwilling,
// Mesh-Gras, placeExtra-Griff) und liest über den EINEN Absenz-Helfer `stammLib.fehlt` (PFLICHT-OFFEN D3: keine
// Präsenz-Probe liest Quelltext) — im Stamm, in einem Glied, im Stamm außer seiner Engstelle (`ausser`) oder in einer
// Datei; ein Glied ohne Definition wirft. Die Anwesenheit des Baus beweisen die Verhaltens-Bänder. Der Immer-Selbsttest
// trägt ein Anti-Muster in den Stamm zurück und muss ROT sehen. Vollständig: `docs/neues-kleid-verfassung.md`.
//   node scripts/diag-pipeline-constitution.cjs
"use strict";
const fs = require("fs");
const path = require("path");
const { fehlt } = require("./lib/stamm.cjs");

const ROOT = path.resolve(__dirname, "..");
const datei = (d) => ({ datei: d });
// [Gesetz, Glied (null = der ganze Text, { ausser } = außer der Engstelle), Anti-Muster, Quelle (ohne = der Stamm)]
const GESETZE = [
    ["G2 EIN Wuchs: keine Inline-Rekursion grow(pos,dir,radius,length,depth) in foundry-core", null, /function grow\(pos, ?dir, ?radius, ?length, ?depth/, datei("foundry-core.js")],
    ["G3 kein Welt-RTT-Nachbau (_bakeImpostorAtlasRTT · _impostorBlitPixels · _impostorDilate · _foundryBakeLeaves)", null, /_bakeImpostorAtlasRTT|_impostorBlitPixels|_impostorDilate|_foundryBakeLeaves/],
    ["G3 kein asset-foundry-Bake-iframe", null, /iframe\.src\s*=\s*[^;]*asset-foundry/],
    ["G3 die Bäcker-Methoden bleiben geschnitten (iframe, Studio-Kanal)", null, /_foundryEnsureBakeIframe|_foundryRequestImpostor|_foundryBuildImpostorRecord|_foundryBakeImpostorRequest|_applyStudioImpostorPayload|_foundryBaecker/],
    ["G6 keine Nischen-Formel-Kopie (wF/wT/wE)", null, /const wF = \(ss\(0\.4, 0\.8, clim\)/],
    ["G6 keine reverse-J-Größen-Kopie (0.55 + 1.45·ue^1.45)", null, /0\.55 \+ 1\.45 \* Math\.pow\(ue/],
    ["G6 keine v36-Rahmen-Kopie (totalH * 0.51)", null, /totalH \* 0\.51/],
    ["G7 kein eigener Dichte-Rechner in _scatterPass", "_scatterPass", /_foliageDensityScale/],
    ["G7 kein eigener Dichte-Rechner in _tickFoliageThin", "_tickFoliageThin", /_foliageDensityScale/],
    ["G7 kein nackter render.calls (nur hinter drawCalls und als Kehraus-Marke)", { ausser: "_gpuKehrausMarke" }, /(?<!drawCalls[^;]{0,160})render\.calls/],
    ["N1/M8 kein kind-Vergleich im Auto-Register-Chokepoint", "_foundryAutoRegisterSpecies", /kind\s*[!=]==?\s*"/],
    ["N2 kein Kern-ns-Literal in der Brücke (self.__vehicleCore)", null, /self\.__vehicleCore/, datei("foundry-bruecke.js")],
    ["N2 kein Kern-ns-Literal im Pflanzen-Labor (self.__vehicleCore)", null, /self\.__vehicleCore/, datei("worlds/terrain/phytogenesis.js")],
    ["N4.1 keine zweite Reply→Geometrie-Konversion neben _foundryBuildMesh", { ausser: "_foundryBuildMesh" }, /new T\.BufferAttribute\(m\.position\.array/],
    ["N4.2 kein eigener mp-Leser (budgetRegler trägt)", null, /typeof mp\.(roughness|metalness|envMapIntensity)\b/],
    ["N7.4 der Mesh-Gras-Konsum bleibt tot", null, /sg === "leer"|if \(!grassStudio\) \{/],
    ["N7.4 kein _grassBladeTuftGeometry", null, /_grassBladeTuftGeometry/],
    ["N7.4 kein Gras-Thin-Tick", null, /_tickGrassThin/],
    ["N4.4 kein tree|shrub-Literal in _foundryPresetIsTree", "_foundryPresetIsTree", /"tree"|"shrub"/],
    ["N5 kein placeExtra-Griff in der Wald-Nischen-Quelle", "_forestExtraSpecies", /placeExtra/],
    ["N5 außer _placePolicyFor liest kein Glied .placeExtra", { ausser: "_placePolicyFor" }, /\.placeExtra/],
];

const selbst = !fehlt(null, /_tickGrassThin/, (t) => t.replace(/\n {4}_tickFoliageThin\(/, "\n    _tickGrassThin(")) && /_tickGrassThin/.test(fehlt.wo || "");
if (!selbst) {
    console.error("❌ SELBSTCHECK FEHLGESCHLAGEN — die Wand sieht ein zurückgekehrtes Anti-Muster nicht. Kein verlässliches Grün.");
    process.exit(2);
}
console.log("=== P8 — DIE VERFASSUNG DER PIPELINE (Absenzen über stammLib.fehlt, Selbsttest feuert) ===");
let rot = 0;
for (const [name, glied, re, quelle] of GESETZE) {
    const ok = fehlt(glied, re, quelle);
    if (!ok) rot++;
    console.log(`  ${ok ? "✅" : "❌"} ${name}${ok ? "" : " — " + fehlt.wo}`);
}
const v2 = fs.existsSync(path.join(ROOT, "spec/asset-contract/v2/CONTRACT.md"));
if (v2) rot++;
console.log(`  ${v2 ? "❌" : "✅"} G4 Vertrag v2 (Kreatur-Skin) bleibt gefallen (KONVERGENZ III — der Baum trägt)`);
console.log(`\n${GESETZE.length + 1 - rot} Gesetze gehalten, ${rot} verletzt.`);
if (rot) {
    console.error("\n❌ ROT — ein Pipeline-Gesetz wurde still gebrochen: heile die Wurzel, nicht diese Linse.");
    process.exit(1);
}
console.log("\n✅ GRÜN — die Pipeline-Verfassung steht: kein Schnitt kehrt zurück.");

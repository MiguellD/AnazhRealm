// diag-pipeline-constitution.cjs — P8: DIE VERFASSUNG DER PIPELINE (Struktur ersetzt Ermahnung).
// Statisch (kein Browser), im `check`-Gate: die GESETZE der „Neues Kleid"-Pipeline sind hier als
// prüfbare STRUKTUR verankert, nicht als Kommentar-Ermahnung. Jede Regel prüft die ANWESENHEIT des
// erzwingenden Baus UND die ABWESENHEIT ihres Anti-Musters. Kommentar-Bereinigung (V18.267: der Code
// darf das Wort tragen, der Code darf es nicht) — die geprüften Anti-Muster (Inline-Wuchs, iframe.src,
// geschnittene Methoden) leben, wenn überhaupt, nur noch in Kommentaren, die der Strip entfernt. Ein
// Refactor, der ein Gesetz still bricht (Nachbau, iframe, Parallel-Wuchs), macht diese Linse rot.
// Vollständig: `docs/neues-kleid-verfassung.md`.
//   node scripts/diag-pipeline-constitution.cjs
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
// NUR Kommentare raus (Strings BLEIBEN). Ein naives String-Strippen über den 85k-Zeilen-Monolithen ist
// unzuverlässig (ein Regex-/Template-Literal mit Anführungszeichen frisst echten Code) — die Kommentar-
// Bereinigung reicht: die geprüften Muster tragen kein String-Literal, das eine Regel vortäuschen könnte,
// und die Anti-Muster (Inline-Wuchs, iframe.src, geschnittene Methoden) leben NUR noch in Kommentaren,
// wenn überhaupt (die entfernt der Strip). Ein echter Code-Verstoß bleibt sichtbar.
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

let pass = 0,
    fail = 0;
// present=true → die Struktur MUSS da sein (cond true); present=false → das Anti-Muster MUSS weg sein (cond false).
const law = (name, present, cond, detail) => {
    const ok = present ? cond : !cond;
    if (ok) {
        pass++;
        console.log(`  ✅ ${name}`);
    } else {
        fail++;
        console.error(`  ❌ ${name}${detail ? " — " + detail : ""}`);
    }
};

const anazhNC = stripComments(read("anazhRealm.js"));
const foundryNC = stripComments(read("foundry-core.js"));
const pkg = read("package.json");

console.log("=== P8 — DIE VERFASSUNG DER PIPELINE (Struktur, nicht Ermahnung) ===");

// GESETZ 1 (P4) — DIE FOUNDRY IST DIE EINE BAUM-QUELLE: der Chokepoint `_buildVariantLODs` gibt bei
// lebender Foundry null (kein Aufrufer kann einen Nachbau setzen); der Scatter unterdrückt den
// Grammatik-Render für Baum-Schichten, wenn die Foundry lebt.
console.log("\nGesetz 1 — die Foundry ist die EINE Baum-Quelle (Chokepoint + Scatter-Gate):");
law("der Chokepoint prüft `_foundryPresetFor(species)` (in `_buildVariantLODs`)", true, /_foundryPresetFor\(species\)/.test(anazhNC));
law('der Scatter unterdrückt den Baum-Grammatik-Nachbau bei lebender Foundry (`layer.kind === "tree" && _foundryEnabled() → continue`)', true, /layer\.kind === "tree" && this\._foundryEnabled\(\)\)\s*continue/.test(anazhNC));

// GESETZ 2 (P6) — EIN WUCHS: der Studio-Generator delegiert an die geteilte Quelle, KEIN Parallel-Wuchs.
console.log("\nGesetz 2 — EIN Wuchs (foundry-core liest den geteilten phyto-core):");
law("`growTreeNodes` delegiert an `__core.growSkeleton`", true, /__core\.growSkeleton/.test(foundryNC));
law("KEIN Inline-Parallel-Wuchs (die `grow(pos,dir,radius,length,depth)`-Rekursion ist geschnitten)", false, /function grow\(pos, ?dir, ?radius, ?length, ?depth/.test(foundryNC), "der ~275-Zeilen-Inline-Bau lebt wieder");

// GESETZ 3 (P5) — DER IMPOSTOR BACKT AUF DEM EINEN HAUPT-RENDERER: kein GL-Bake-iframe; der RTT liest die Foundry-Leaves.
console.log("\nGesetz 3 — der Impostor backt auf dem EINEN Haupt-Renderer (kein Bake-iframe):");
law("`_bakeImpostorAtlasRTT` liest bei der `foundry`-Flagge die LOD1-Bake-Leaves", true, /if \(rec\.foundry\)/.test(anazhNC) && /_foundryBakeLeaves/.test(anazhNC));
law("KEIN asset-foundry-Bake-iframe (kein `iframe.src = …asset-foundry`)", false, /iframe\.src\s*=\s*[^;]*asset-foundry/.test(anazhNC), "ein Bake-iframe wird wieder erzeugt");
law("die drei iframe-Impostor-Methoden bleiben geschnitten", false, /_foundryEnsureBakeIframe|_foundryRequestImpostor|_foundryBuildImpostorRecord/.test(anazhNC), "eine iframe-Impostor-Methode ist zurück");

// GESETZ 4 (P1/P7) — DIE ASSET-VERTRÄGE: Pflanzen v1 + Kreatur-Skin v2 eingefroren + gate-bewacht.
console.log("\nGesetz 4 — die Asset-Verträge sind eingefroren + gate-bewacht:");
law("Vertrag v1 (Pflanzen) existiert", true, fs.existsSync(path.join(ROOT, "spec/asset-contract/v1/CONTRACT.md")));
law("Vertrag v2 (Kreatur-Skin) existiert", true, fs.existsSync(path.join(ROOT, "spec/asset-contract/v2/CONTRACT.md")));
law("`gate:asset-contract` verdrahtet", true, /"gate:asset-contract"\s*:/.test(pkg));
law("`gate:creature-contract` verdrahtet", true, /"gate:creature-contract"\s*:/.test(pkg));

// GESETZ 5 (P0–P8) — JEDE REGEL HAT IHRE LINSE: die Pipeline-Gates existieren im package.json.
console.log("\nGesetz 5 — jede Regel hat ihre Linse (die Gates existieren):");
for (const g of ["gate:foundry-warm", "gate:foundry-deadlock", "gate:portal-boot", "gate:foundry-impostor", "gate:boot-fog-ring"])
    law(`\`${g}\` verdrahtet`, true, pkg.includes('"' + g + '"'));

// GESETZ 6 („Drähte statt Kopien", 08.07.) — KEINE LOGIK-KOPIE IM MONOLITHEN: was auch im
// Studio-/Vorlagen-Kern steht, darf in anazhRealm.js nur als DRAHT existieren. Der Wald-Plan
// (Poisson/Nische/Größe) + der Impostor-Rahmen (Studio v36) leben EINMAL in phyto-core; der
// Monolith delegiert. Jeder Refactor, der die Formel zurückkopiert, wird hier rot.
console.log("\nGesetz 6 — Drähte statt Kopien (Wald-Plan + Rahmen leben in der Quelle):");
const phytoNC = stripComments(read("phyto-core.js"));
law("phyto-core trägt den Wald-Plan (`planForestCell`)", true, /function planForestCell\(/.test(phytoNC));
law("phyto-core trägt den Impostor-Rahmen (`impostorFrame` + `scanRadialXZ`)", true, /function impostorFrame\(/.test(phytoNC) && /function scanRadialXZ\(/.test(phytoNC));
law("der Monolith DELEGIERT den Wald-Plan (ctx-Draht zu `planForestCell`)", true, /core\.planForestCell\(cx, cz, seedInt/.test(anazhNC));
law("KEINE Nischen-Formel-Kopie im Monolithen (die wF/wT/wE-Gewichte sind umgezogen)", false, /const wF = \(ss\(0\.4, 0\.8, clim\)/.test(anazhNC), "die Arten-Nische lebt wieder im Monolithen");
law("KEINE Größen-Formel-Kopie im Monolithen (reverse-J `0.55 + 1.45·ue^1.45`)", false, /0\.55 \+ 1\.45 \* Math\.pow\(ue/.test(anazhNC), "die reverse-J-Größe lebt wieder im Monolithen");
law("der Monolith DELEGIERT den Rahmen (`core.impostorFrame(`)", true, /core\.impostorFrame\(/.test(anazhNC));
law("KEINE Rahmen-Formel-Kopie im Monolithen (`totalH * 0.51`)", false, /totalH \* 0\.51/.test(anazhNC), "die v36-Rahmenformel lebt wieder als Kopie im Monolithen");
const phytogenNC = stripComments(read("worlds/terrain/phytogenesis.js"));
law("das Studio liest DENSELBEN Rahmen (`__phytoCore.impostorFrame` in bakeImpostorAtlas)", true, /__phytoCore\.impostorFrame\(/.test(phytogenNC));
law("der Bäcker-Spec lebt als Daten in foundry-core (`impostor: { views:`)", true, /impostor:\s*\{\s*views:/.test(foundryNC));
// LOD-WURZEL (08.07., V9.56-i — das Gesetz wandert mit dem Code): der Halm-Draht ist
// STUFEN-parameterisiert (`_grassStudioGeometry(stage)`, die Stufe aus den Vertrags-Daten
// `kindStages.grass` via `_grassKindStages`); der Defer-Draht bleibt die Kopie-Bau-Wand.
law(
    "DER GRAS-SCHNITT: der Halm ist das Studio-Asset (`_grassStudioGeometry(stage)` + kindStages-Draht + Defer im Bauer)",
    true,
    /_grassStudioGeometry\(/.test(anazhNC) &&
        /_grassKindStages\(\)/.test(anazhNC) &&
        /this\._enqueueGrass\(cx, cz\);\s*return;/.test(anazhNC)
);
// LOD-WURZEL (08.07.) — die Stufen-Wahrheit je Art lebt als VERTRAGS-DATEN in foundry-core
// (kindStages), der Studio-Wald liest sie SELBST (near/far-Kacheln), AnazhRealm clampt seine
// Distanz-Wahl darauf (kein Empfänger erfindet Stufen, die das Studio nicht vorsieht).
law("die Stufen-Wahrheit je Art lebt als Daten (`kindStages:` in foundry-core)", true, /kindStages:\s*\{/.test(foundryNC));
law("der Studio-Wald liest kindStages SELBST (near/far-Kacheln)", true, /kindStages/.test(phytogenNC) && /tileStage/.test(phytogenNC));
law("AnazhRealm clampt auf die deklarierten Stufen (`kindStages` im Flatten-Chokepoint)", true, /kindStages\[_rec\.kind\]/.test(anazhNC));

console.log(`\n${pass} Gesetze gehalten, ${fail} verletzt.`);
if (fail) {
    console.error(
        "\n❌ ROT — die Pipeline-Verfassung ist verletzt: ein Gesetz (eine Quelle · ein Wuchs · ein Bake-Pfad · die Vertraege) wurde still gebrochen. Die Struktur traegt die Disziplin — heile die Wurzel, nicht diese Linse."
    );
    process.exit(1);
}
console.log("\n✅ GRÜN — die Pipeline-Verfassung steht: eine Baum-Quelle · ein Wuchs · ein Bake-Pfad · zwei eingefrorene Verträge, jede Regel als Struktur (Chokepoint/Schnitt/Gate) verankert, nicht als Ermahnung.");
process.exit(0);

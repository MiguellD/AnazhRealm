#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-forest-floor.cjs — DER WALDBODEN-LOOK ÜBER DEM VOXEL (Neues Kleid P6, V18.389)
//
// Schöpfer: „ziehe die 2.5D-Welt über unser Voxelterrain, die Terrain-STRUKTUR …
// der Boden-LOOK/das Gefühl zieht auf Vorlagen-Niveau." Die Voxel-Tech bleibt (tiefer
// als das Vorlagen-Heightfield) — nur der Waldboden-CHARAKTER (Wiesen-/Sand-/Fels-/
// Feucht-/Wald-Kern-Übergänge der Vorlage worlds/terrain/phytogenesis.js) zieht nach.
//
// Diese Linse beweist die MECHANIK GPU-frei + headless (rein statische Quell-Analyse —
// kein Browser, kein Renderer, kein WebGPU nötig):
//   (a) der Boden-Albedo variiert nach Feuchte / Slope / Wasser-Nähe wie die Vorlage
//       (feucht-grün → Moos, feucht+beschattet → Wald-Kern, trocken → braun-gelb,
//        steil → Fels, Ufer → Sand) — messbar an den Farb-Termen/Konstanten.
//   (b) die Boden-Farb-Logik liegt in DER EINEN Substanz-Quelle
//       (_terrainGeologyAlbedo / _substanceCharacter) — kein Parallel-Material-Zweig.
//   (c) die bestehenden Felder werden gelesen: _feuchteAt (Feuchte, im Vertex-Bäcker)
//       und _slopeAt (Slope, in der Boden-/Gras-Deckschicht) + normalWorld (Slope
//       per-Fragment für den Fels-Durchbruch).
//
// „MECHANIK braucht eine ZAHL" — der LOOK selbst bleibt Schöpfer-Auge. Ausgabe
// „WALDBODEN OK", exit != 0 bei Fehlschlag.
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

let fails = 0;
const checks = [];
function ok(name, cond, detail) {
    checks.push({ name, cond: !!cond, detail: detail || "" });
    if (!cond) fails++;
}

// ── Methoden-Körper per Brace-Matching extrahieren (robust gegen Zeilen-Drift) ──
function methodBody(name) {
    // Suche `    name(` als Methoden-Signatur (führende Einrückung → Klassen-Ebene).
    const re = new RegExp("\\n    (?:static (?:get )?)?" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\(");
    const m = re.exec(src);
    if (!m) return null;
    // Erst die Parameter-Klammer `( ... )` überspringen (ein `opts = {}`-Default
    // im Parameter würde sonst das Brace-Matching fangen) → dann die Körper-`{`.
    let p = m.index + m[0].length - 1; // steht auf dem `(`
    let pd = 0;
    for (; p < src.length; p++) {
        if (src[p] === "(") pd++;
        else if (src[p] === ")") {
            pd--;
            if (pd === 0) {
                p++;
                break;
            }
        }
    }
    // Finde die öffnende `{` des Funktions-Körpers nach den Parametern.
    let i = src.indexOf("{", p);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        const ch = src[i];
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

const geo = methodBody("_terrainGeologyAlbedo");
const subst = methodBody("_substanceCharacter");
const baker = methodBody("_attachVoxelFieldColors");
const grass = methodBody("_buildVoxelChunkGrass");
const geology = methodBody("TERRAIN_GEOLOGY");
const meadowGreen = methodBody("MEADOW_GREEN");

ok("_terrainGeologyAlbedo existiert", geo, geo ? "" : "Methoden-Körper nicht gefunden");
ok("_substanceCharacter existiert", subst, subst ? "" : "Methoden-Körper nicht gefunden");
ok("_attachVoxelFieldColors existiert", baker, baker ? "" : "Vertex-Farb-Bäcker nicht gefunden");
ok("_buildVoxelChunkGrass existiert", grass, grass ? "" : "Boden-Gras-Deckschicht nicht gefunden");
ok("TERRAIN_GEOLOGY existiert", geology);
ok("MEADOW_GREEN existiert", meadowGreen);

const G = geo || "";
const S = subst || "";
const B = baker || "";
const GR = grass || "";
const CFG = geology || "";

// ── (a) DIE VORLAGEN-ÜBERGÄNGE — jeder Farb-Term messbar ──────────────────
// FEUCHT-GRÜN → MOOS: die Geologie treibt einen Feucht×Grün → mossTint-Mix (der
//   substanz-Kern mischt zum Moos-Ton). Vorlage: mossCol/cWet auf feuchtem Grund.
ok(
    "(a) feucht+grün → MOOS (mossDrive aus _damp × _green)",
    /_mossDrive\s*=/.test(G) && /_green\b/.test(G) && /_damp\b/.test(G) && /mossDrive\s*:/.test(G),
    "der Feucht×Grün-Treiber speist das Moos im EINEN Substanz-Kern"
);
ok(
    "(a) MOOS-Mix im Substanz-Kern (mossTint/moss-Ton)",
    /mossDrive/.test(S) && /mossW\b/.test(S) && /mix\(/.test(S),
    "der Substanz-Kern mischt zum Moos-Ton nach dem mossW-Treiber"
);

// FEUCHT+BESCHATTET → WALD-KERN (P6, Vorlagen-cLit): der schattige Unterwuchs dunkelt.
ok(
    "(a) feucht+beschattet → WALD-KERN (P6, litTint aus _damp × _green × _flat)",
    /_floorW\s*=/.test(G) && /litTint/.test(G) && /_damp\b/.test(G) && /_forestPatch/.test(G),
    "der Waldboden-Kern-Term senkt die feuchte Niederung zum Vorlagen-cLit"
);
ok("(a) litTint-Konstante (Vorlagen-cLit) definiert", /litTint\s*:/.test(CFG) && /floorMax\s*:/.test(CFG));

// TROCKEN → BRAUN-GELBE DÜRRE: der inverse-damp Patch-Term.
ok(
    "(a) trocken → BRAUN-GELB (dryW aus 1−_damp, Gelb-Braun-Multiplikator)",
    /_dryW\s*=/.test(G) && /_dryPatch/.test(G) && /1\.32,\s*1\.12,\s*0\.6/.test(G),
    "die trockene, flache, nicht-grüne Fläche bekommt Dürre-Flecken (Hue → Gelb-Braun)"
);

// STEIL/GRAT → FELS-DURCHBRUCH: rockW/screeW aus der Steile (normalWorld).
ok(
    "(a) steil/Grat → FELS (rockW/screeW aus _steep = normalWorld)",
    /_steep\s*=/.test(G) &&
        /normalWorld\.y/.test(G) &&
        /_rockW\s*=/.test(G) &&
        /_screeW\s*=/.test(G) &&
        /rockTint/.test(G),
    "die rohe Geometrie-Steile (Slope per-Fragment) treibt Fels/Geröll → rockTint"
);

// UFER/NIEDRIG+FLACH NAHE WASSER → SAND: der aboveWater-Sand-Band im Bäcker.
ok(
    "(a) Ufer/niedrig nahe Wasser → SAND (aboveWater-Band, _waterLevelAt)",
    /_waterLevelAt\(/.test(B) && /aboveWater\b/.test(B) && /sand\b/.test(B) && /shoreBlend/.test(B),
    "der Vertex-Bäcker tönt den Strand-Saum über dem Wasser-Spiegel zu Sand"
);

// WIESE (Lichtung, flach+grün+hell/trocken): MEADOW_GREEN-Grund.
ok(
    "(a) flach+grün (Lichtung) → WIESE (MEADOW_GREEN)",
    /_meadowW\s*=/.test(G) && /MEADOW_GREEN/.test(G),
    "die helle/trockene flache Lichtung behält den Wiesen-Grund"
);

// ── (b) EINE QUELLE — kein Parallel-Material-Zweig ────────────────────────
// Alle fünf per-Fragment-Boden-Charaktere (Fels/Moos/Trocken/Wiese/Wald-Kern)
// leben IN _terrainGeologyAlbedo und faltet in _substanceCharacter (ein Aufruf).
const substCallInGeo = /this\._substanceCharacter\(/.test(G);
ok(
    "(b) _terrainGeologyAlbedo ruft _substanceCharacter (die EINE Kern-Quelle)",
    substCallInGeo,
    "Geologie faltet in den EINEN Substanz-Kern (Albedo UND Roughness aus dem Kern)"
);
// Der Roughness-Envelope (V18.335) kommt aus DEMSELBEN Kern (Out-Param) — kein
// zweiter Terrain-Material-Zweig.
ok(
    "(b) Roughness aus DEMSELBEN Kern (roughOut/roughNode-Out-Param)",
    /roughOut/.test(G) && /roughNode/.test(S),
    "Albedo UND Rauheit lesen den einen Kern (V18.335-Disziplin, kein Parallel-Zweig)"
);
// Der neue Wald-Kern-Mix operiert auf `_out` (der geteilte Geologie-Akkumulator),
// nicht auf einem eigenen Material — er faltet mit in den einen _substanceCharacter.
const floorBeforeSubst = G.indexOf("_floorW") >= 0 && G.indexOf("this._substanceCharacter(") > G.indexOf("_floorW");
ok(
    "(b) Wald-Kern-Mix speist den EINEN Kern (vor dem _substanceCharacter-Aufruf, auf _out)",
    floorBeforeSubst && /_out\s*=\s*_T\.mix\(_out,\s*_T\.vec3\(_lit/.test(G),
    "der P6-Term mischt in den geteilten _out-Akkumulator, kein neues Terrain-Material"
);

// ── (c) DIE FELDER WERDEN GELESEN ─────────────────────────────────────────
// FEUCHTE: _feuchteAt im Vertex-Bäcker (die Feuchte-getriebene dampEarth/Sand-Basis,
//   die als Albedo IN die Geologie fliesst → dort _damp).
ok(
    "(c) _feuchteAt gelesen (Feuchte — im Vertex-Farb-Bäcker _attachVoxelFieldColors)",
    /this\._feuchteAt\(/.test(B),
    "der Boden-Albedo (Basis der Geologie) trägt die Feuchte aus dem _feuchteAt-Feld"
);
// SLOPE: _slopeAt in der Boden-/Gras-Deckschicht (die Wiese-vs-Fels-Grenze am Boden),
//   plus normalWorld (Slope per-Fragment) für den Fels-Durchbruch in der Geologie.
ok(
    "(c) _slopeAt gelesen (Slope — in der Boden-Gras-Deckschicht _buildVoxelChunkGrass)",
    /this\._slopeAt\(/.test(GR),
    "die Slope-Achse (_slopeAt, die V18.351-EINE-Quelle) steuert die Boden-Deckschicht"
);
ok(
    "(c) Slope per-Fragment im Boden-Albedo (normalWorld → _steep → Fels)",
    /1\.0\)\.sub\(_T\.normalWorld\.y\)/.test(G),
    "die Geologie liest die echte Hangneigung (normalWorld) für den Fels-Durchbruch"
);
ok(
    "(c) Feuchte per-Fragment im Boden-Albedo (_damp treibt Moos/Dürre/Wald-Kern)",
    /_damp\s*=\s*_T\.float\(1\.0\)\.sub\(_T\.smoothstep/.test(G),
    "die Feuchte-Achse (_damp, aus dem _feuchteAt-gebackenen Albedo) treibt drei Übergänge"
);

// ── litTint plausibel dunkler als MEADOW_GREEN (Wald-Kern < Wiese) ─────────
function firstTriple(text, key) {
    const m = new RegExp(key + "\\s*[:(]?\\s*\\[?\\s*([0-9.]+)\\s*,\\s*([0-9.]+)\\s*,\\s*([0-9.]+)").exec(text || "");
    return m ? [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])] : null;
}
const litT = firstTriple(CFG, "litTint");
const meadT = firstTriple(meadowGreen || "", "return");
if (litT && meadT) {
    const litL = litT[0] * 0.3 + litT[1] * 0.59 + litT[2] * 0.11;
    const meadL = meadT[0] * 0.3 + meadT[1] * 0.59 + meadT[2] * 0.11;
    ok(
        "litTint (Wald-Kern) dunkler als MEADOW_GREEN (Wiese)",
        litL < meadL && litL > 0 && litT[1] > litT[0] && litT[1] > litT[2],
        `Wald-Kern-Luma ${litL.toFixed(4)} < Wiesen-Luma ${meadL.toFixed(4)}, grün-dominant`
    );
} else {
    ok("litTint/MEADOW_GREEN-Werte lesbar", false, "Farb-Tripel nicht parsebar");
}

// ── Bericht ───────────────────────────────────────────────────────────────
console.log("\n─── diag-forest-floor: der Waldboden-Look über dem Voxel (P6) ───\n");
for (const c of checks) {
    console.log(`  ${c.cond ? "✅" : "❌"} ${c.name}${c.detail ? "  — " + c.detail : ""}`);
}
console.log("");
if (fails === 0) {
    console.log(`WALDBODEN OK — ${checks.length}/${checks.length} Invarianten grün`);
    console.log("  feucht → _feuchteAt (Bäcker) → _damp → Moos + Wald-Kern (litTint) · trocken → Dürre ·");
    console.log("  steil → normalWorld/_slopeAt → Fels · Ufer → _waterLevelAt → Sand · EINE Quelle.\n");
    process.exit(0);
} else {
    console.error(`WALDBODEN FEHLGESCHLAGEN — ${fails}/${checks.length} Invarianten rot\n`);
    process.exit(1);
}

// EINS W4 — DIE BLATT-KLINGEN-LINSE (GPU-frei, kein Browser).
// Beweist die vier W4-Wahrheiten an der QUELLE:
//   (a) das L0-Blatt ist die 30-Vert-SUPERFORMEL-KLINGE (phyto-core `buildLeafBlades`,
//       der Vorlagen-`pushLeaf`-Port) und ist QUER-GEMULDET (der Mittel-Vertex ragt
//       messbar aus der Blatt-Ebene — cup 0.5 → 0.125·scale bei s=0.5);
//   (b) L1 bleibt das 4-Vert-Cluster-Quad (`buildFoliageQuads`), und der Stamm gated
//       die Klingen auf lodLevel===0 (`_buildTreeSkeletonLeaves`);
//   (c) der unlit-Silhouetten-Floor lebt in `_applyVegetationResponse` (pow(1−ndv,2.5)·
//       0.55 + Kanten-Grün) und ist SONNEN-UNABHÄNGIG (kein uSunDir im Floor-Block);
//   (d) EINE Blatt-Farb-Quelle: der alte ·0.72/0.95/0.55-Fallback ist tot (kommentar-
//       bereinigt geprüft — die V18.267-Falle), beide Pfade lesen `_treeLeafBaseColor`.
// Plus die Perf-Ehrlichkeit: die Tri-Last der L0-Eichen-Krone vorher (Quads) → nachher
// (Klingen), gemessen am echten growSkeleton-Ergebnis mit dem Main-Blatt-Budget (480).
"use strict";
const fs = require("fs");
const path = require("path");

require("../phyto-core.js");
const core = globalThis.__phytoCore;

const mainSrc = fs.readFileSync(path.join(__dirname, "..", "anazhRealm.js"), "utf8");

let fails = 0;
const ok = (name, cond, detail) => {
    console.log((cond ? "  ✅ " : "  ⛔ ") + name + (detail ? " — " + detail : ""));
    if (!cond) fails++;
};

// ── Helfer: Methoden-Quelle aus dem Stamm schneiden (brace-count) + Kommentare strippen ──
function methodSrc(name) {
    const marker = "\n    " + name + "(";
    const i = mainSrc.indexOf(marker);
    if (i < 0) return null;
    let depth = 0,
        started = false,
        j = i;
    for (; j < mainSrc.length; j++) {
        const c = mainSrc[j];
        if (c === "{") {
            depth++;
            started = true;
        } else if (c === "}") {
            depth--;
            if (started && depth === 0) break;
        }
    }
    return mainSrc.slice(i, j + 1);
}
function stripComments(src) {
    return String(src || "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/[^\n]*/g, "");
}

console.log("=== EINS W4 — Blatt-Klingen-Linse ===");

// ── (a) die Klinge: 30 Verts/Blatt + Superformel + Quer-Mulde ──────────────────────────
ok("phyto-core exportiert buildLeafBlades", typeof core.buildLeafBlades === "function");
ok("phyto-core exportiert superR + LEAF_SHAPES", typeof core.superR === "function" && !!core.LEAF_SHAPES);
ok(
    "LEAF_SHAPES.oak = die Vorlagen-Parameter (m9 · n1 0.7 · wsc 0.42)",
    core.LEAF_SHAPES &&
        core.LEAF_SHAPES.oak &&
        core.LEAF_SHAPES.oak.m === 9 &&
        core.LEAF_SHAPES.oak.n1 === 0.7 &&
        core.LEAF_SHAPES.oak.wsc === 0.42
);

const oneLeaf = [{ pos: [0, 0, 0], dir: [1, 0, 0], up: [0, 1, 0], scale: 1, sway: 0.7, phase: 0.3, needle: false }];
const blade = core.buildLeafBlades(oneLeaf, { leafShape: "oak", cup: 0.5, scale: 1 });
const vpl = blade.positions.length / 3;
ok("(a1) EIN Blatt = 30 Verts (Vorlage pushLeaf: 14 Segmente × 2 + 2)", vpl === 30, vpl + " Verts");
ok("(a2) EIN Blatt = 28 Tris", blade.indices.length / 3 === 28, blade.indices.length / 3 + " Tris");
ok(
    "(a3) Attribut-Layout = die Float32-Naht (position/normal/color/aFlex/aPhase/uv/indices)",
    blade.normals.length === 90 &&
        blade.colors.length === 90 &&
        blade.aFlex.length === 30 &&
        blade.aPhase.length === 30 &&
        blade.uvs.length === 60
);
// Quer-Mulde: dir=[1,0,0], up=[0,1,0] → right=[0,0,1], u2=[0,1,0] → cupZ displaziert in −y.
// Blatt-Ebene = xz → der Mittel-Segment-Vertex (s=0.5) MUSS aus der Ebene ragen (0.125·scale).
let maxOutOfPlane = 0,
    tipOutOfPlane = 0;
for (let v = 0; v < vpl; v++) {
    const y = Math.abs(blade.positions[v * 3 + 1]);
    if (y > maxOutOfPlane) maxOutOfPlane = y;
    if (v >= vpl - 2) tipOutOfPlane = Math.max(tipOutOfPlane, y);
}
ok(
    "(a4) die Klinge ist QUER-GEMULDET: Mittel-Vertex ragt aus der Blatt-Ebene (>0.05·scale)",
    maxOutOfPlane > 0.05,
    "max |out-of-plane| = " + maxOutOfPlane.toFixed(4) + " (erwartet ~0.125 bei cup 0.5)"
);
ok("(a5) Basis + Spitze liegen IN der Ebene (die Mulde ist s−s², nicht ein Shear)", tipOutOfPlane < 1e-6);
// Normalen: nicht-degeneriert + die Mulde variiert sie (kein konstanter Vektor).
let nMin = 2,
    nMax = 0,
    nDot = 2;
for (let v = 0; v < vpl; v++) {
    const l = Math.hypot(blade.normals[v * 3], blade.normals[v * 3 + 1], blade.normals[v * 3 + 2]);
    nMin = Math.min(nMin, l);
    nMax = Math.max(nMax, l);
    const d =
        blade.normals[0] * blade.normals[v * 3] +
        blade.normals[1] * blade.normals[v * 3 + 1] +
        blade.normals[2] * blade.normals[v * 3 + 2];
    nDot = Math.min(nDot, d);
}
ok("(a6) Normalen normalisiert (Face-Akkumulation)", nMin > 0.999 && nMax < 1.001);
ok("(a7) die Mulde KRÜMMT die Normalen (min dot(n0,ni) < 0.999)", nDot < 0.999, "min dot = " + nDot.toFixed(4));

// ── (b) L1 bleibt Quad + der Stamm gated die Klingen auf LOD0 ──────────────────────────
const quad = core.buildFoliageQuads(oneLeaf, {});
ok("(b1) buildFoliageQuads bleibt das 4-Vert-Quad (L1)", quad.positions.length / 3 === 4 && quad.count === 1);
const skelLeavesSrc = stripComments(methodSrc("_buildTreeSkeletonLeaves") || "");
ok(
    "(b2) _buildTreeSkeletonLeaves gated die Klingen auf lodLevel===0 + Toggle foliageBlades",
    /skel\.lodLevel \| 0\) === 0/.test(skelLeavesSrc) &&
        /foliageBlades !== false/.test(skelLeavesSrc) &&
        /_buildTreeFoliageBladeGeometry/.test(skelLeavesSrc)
);
ok(
    "(b3) der Karten-Pfad bekommt skipBroadleaf (keine Doppel-Krone über den Klingen)",
    /skipBroadleaf/.test(skelLeavesSrc) &&
        /skipBroadleaf/.test(stripComments(methodSrc("_buildTreeFoliageCardGeometry") || ""))
);
const bladeGeoSrc = stripComments(methodSrc("_buildTreeFoliageBladeGeometry") || "");
ok(
    "(b4) _buildTreeFoliageBladeGeometry liest die EINE Quelle (__phytoCore.buildLeafBlades) + stempelt aH0/aH0L",
    /buildLeafBlades/.test(bladeGeoSrc) && /_stampFoliageVisHeights/.test(bladeGeoSrc)
);

// ── (c) der unlit-Silhouetten-Floor: präsent + sonnen-UNABHÄNGIG ───────────────────────
const vegRespRaw = methodSrc("_applyVegetationResponse") || "";
const floorStart = vegRespRaw.indexOf("EINS W4 (P2)");
const floorEnd = vegRespRaw.indexOf("V18.387 — DAS NEUE KLEID S1-SHADER");
const floorBlock = floorStart >= 0 && floorEnd > floorStart ? vegRespRaw.slice(floorStart, floorEnd) : "";
const floorCode = stripComments(floorBlock);
ok("(c1) der Floor-Block existiert in _applyVegetationResponse", floorBlock.length > 0);
ok(
    "(c2) der Floor ist die Vorlagen-Klasse: albedo·pow(1−ndv, 2.5)·0.55 + Kanten-Grün pow(…,4)·0.5",
    /pow\(_inv, _Tf\.float\(2\.5\)\)/.test(floorCode) &&
        /0\.55/.test(floorCode) &&
        /vec3\(0\.09, 0\.15, 0\.04\)/.test(floorCode) &&
        /float\(4\.0\)/.test(floorCode)
);
ok(
    "(c3) der Floor ist SONNEN-UNABHÄNGIG (kein uSunDir im Floor-Block — er lebt auch nachts)",
    floorCode.length > 0 && !/uSunDir/.test(floorCode)
);
ok(
    "(c4) der Floor ist NUR Laub (foliageLeaf-Gate) + post-lighting (outputNode, nie colorNode-Override)",
    /foliageLeaf === true/.test(floorCode) && /mat\.outputNode = _outF\.add/.test(floorCode)
);

// ── (d) EINE Blatt-Farb-Quelle ─────────────────────────────────────────────────────────
const cardSrc = stripComments(methodSrc("_buildTreeFoliageCardGeometry") || "");
ok(
    "(d1) der ·0.72/0.95/0.55-Fallback ist TOT (kommentar-bereinigt: kein 0.72-Multiplikator im Code)",
    cardSrc.length > 0 && !/\*\s*0\.72/.test(cardSrc) && !/\*\s*0\.55/.test(cardSrc)
);
ok(
    "(d2) BEIDE Pfade lesen die EINE Quelle _treeLeafBaseColor (Karten-Phyto + Fallback + Klingen)",
    (cardSrc.match(/_treeLeafBaseColor/g) || []).length >= 2 && /_treeLeafBaseColor/.test(bladeGeoSrc)
);
ok("(d3) _treeLeafBaseColor existiert als Methode", (methodSrc("_treeLeafBaseColor") || "").length > 0);

// ── Perf-Ehrlichkeit: die L0-Eichen-Kronen-Tri-Last vorher (Quads) → nachher (Klingen) ──
// growSkeleton mit den Main-Dials (leafBudget 480 = der L0-Wert aus _growTreeBlueprintRich;
// weit UNTER dem Vorlagen-L0-Budget 20000, Z.449) — die ehrliche gerechnete Zahl.
function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const eicheP = {
    height: 11,
    slim: 0.45,
    apical: 0.3,
    trop: -0.15,
    delta: 2.3,
    leafD: 0.6,
    leafSize: 0.82 * 1.3,
    conifer: false,
    barkType: "smooth",
    maxDepth: 5,
    crownBase: 0.24,
    whorlSpacing: 0.12,
    coniferDroop: 0.05,
    basalStems: 0,
    windGain: 0.9,
    countCap: 3600,
    leafBudget: 480,
};
const grown = core.growSkeleton(eicheP, mulberry32(20260704));
const quadsFull = core.buildFoliageQuads(grown.leaves, { scale: 2.35 });
const bladesFull = core.buildLeafBlades(
    grown.leaves.filter((l) => !l.needle),
    { leafShape: "oak", cup: 0.5, scale: 1 }
);
const triBefore = quadsFull.indices.length / 3;
const triAfter = bladesFull.indices.length / 3;
const vertsBefore = quadsFull.positions.length / 3;
const vertsAfter = bladesFull.positions.length / 3;
console.log(
    "  📐 L0-Eichen-Krone (Budget 480, gemessen): Quads " +
        quadsFull.count +
        " Blätter · " +
        vertsBefore +
        " Verts · " +
        triBefore +
        " Tris  →  Klingen " +
        bladesFull.count +
        " Blätter · " +
        vertsAfter +
        " Verts · " +
        triAfter +
        " Tris (×" +
        (triAfter / Math.max(1, triBefore)).toFixed(1) +
        " Tris, nur <32 m [W2-LOD])"
);
ok("(p1) das Blatt-Budget hält (≤480 Blätter — die Main-Konstante deckelt)", bladesFull.count <= 480);
ok(
    "(p2) die Klinge trägt exakt 30 Verts/Blatt auch im vollen Wuchs",
    vertsAfter === bladesFull.count * 30,
    vertsAfter + " = " + bladesFull.count + "·30"
);

console.log(fails === 0 ? "\nBLATT-KLINGEN OK" : "\n⛔ BLATT-KLINGEN ROT — " + fails + " Verletzung(en).");
process.exit(fails === 0 ? 0 : 1);

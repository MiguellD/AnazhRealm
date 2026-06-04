#!/usr/bin/env node
/*
 * diag-lod-pyramid.cjs — MISST die Welle-E-LOD-Pyramide (E1+E2). Reine Geometrie
 * (kein Engine-Load, Stufe-2-Probe): die LOD-Zuweisung ist Distanz-Mathematik,
 * die Cell-Kosten kommen aus der Config. Beweist die drei Behauptungen des
 * Schöpfer-Wunsches („mehr Ringe, riesige Weite, hohe FPS"):
 *   (1) ADDITIV — r ≤ 8 ist BYTE-IDENTISCH zur alten Zuweisung (kein Regress an
 *       der geliebten Sicht);
 *   (2) BILLIG — die neuen Ringe 9–12 sind LOD2/LOD3 (16×/~300× weniger Cells);
 *   (3) ENABLER — ring 12 MIT Pyramide kostet ~wie ring 8, während ring 12 NAIV
 *       (alles LOD1) explodieren würde → die Pyramide IST die geniale Struktur,
 *       die „ein paar mehr Ringe" bei hoher FPS ermöglicht.
 */

// dim (horizontale Auflösung) + dimY pro LOD — Spiegel von _voxelChunkConfig.
const DIM = { 0: 24, 1: 12, 2: 6, 3: 3 };
const DIMY = { 0: 200, 1: 100, 2: 50, 3: 25 };
// Mesh-Kosten-Proxy: Oberflächen-Vertices ≈ dim² (1 Vertex pro Surface-Cell-
// Säule). Build-Kosten-Proxy: Grid-Vertices (dim+1)²·(dimY+1) (das gesampelte
// Density-Grid; der Band-Skip reduziert das real noch, aber das Verhältnis hält).
const surfVerts = (lod) => (DIM[lod] + 1) * (DIM[lod] + 1);
const gridVerts = (lod) => (DIM[lod] + 1) * (DIM[lod] + 1) * (DIMY[lod] + 1);

// Die NEUE LOD-Pyramide (Spiegel von _voxelChunkLodFor).
const lodNew = (r) => (r >= 11 ? 3 : r >= 9 ? 2 : r >= 2 ? 1 : 0);
// Die ALTE Zuweisung (r >= 2 ? 1 : 0) + eine naive „alles fern = LOD1"-Variante.
const lodOld = (r) => (r >= 2 ? 1 : 0);

function tally(ringRadius, lodFn) {
    let chunks = 0;
    let surf = 0;
    let grid = 0;
    const perLod = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let cx = -ringRadius; cx <= ringRadius; cx++) {
        for (let cz = -ringRadius; cz <= ringRadius; cz++) {
            const r = Math.max(Math.abs(cx), Math.abs(cz));
            const lod = lodFn(r);
            chunks++;
            perLod[lod]++;
            surf += surfVerts(lod);
            grid += gridVerts(lod);
        }
    }
    return { ringRadius, chunks, surf, grid, perLod };
}

const SPAN = 43.2;
const fmt = (n) => n.toLocaleString("de-DE");
function show(label, t) {
    console.log(
        `  ${label.padEnd(26)} | Chunks ${String(t.chunks).padStart(4)} ` +
            `(L0:${t.perLod[0]} L1:${t.perLod[1]} L2:${t.perLod[2]} L3:${t.perLod[3]}) | ` +
            `Surf-Verts ${fmt(t.surf).padStart(9)} | Grid-Verts ${fmt(t.grid).padStart(11)} | ` +
            `Sicht ${(t.ringRadius * SPAN).toFixed(0)} m`
    );
}

console.log("=== diag-lod-pyramid — Welle E (LOD-Pyramide E1+E2) ===");
console.log(`Chunk-Span ${SPAN} m. dim/LOD: 0→24 1→12 2→6 3→3. Surf-Verts ≈ Mesh-Kosten, Grid-Verts ≈ Build-Kosten.\n`);

const r8old = tally(8, lodOld);
const r8new = tally(8, lodNew);
const r12new = tally(12, lodNew);
const r12naive = tally(12, lodOld); // ring 12, aber ohne Pyramide (alles fern = LOD1)

console.log("           Konfiguration       | Chunks (Verteilung)              | Mesh-Kosten   | Build-Kosten | Weitsicht");
console.log("  -------------------------------+----------------------------------+---------------+--------------+----------");
show("ring 8  ALT (= aktuell)", r8old);
show("ring 8  NEU (Pyramide)", r8new);
show("ring 12 NEU (Pyramide)", r12new);
show("ring 12 NAIV (ohne Pyr.)", r12naive);

console.log("\n--- Verdikt ---");
// (1) Additiv: r ≤ 8 byte-identisch
const additive = r8old.surf === r8new.surf && r8old.grid === r8new.grid && r8old.chunks === r8new.chunks;
console.log(
    `(1) ADDITIV:   ring 8 ALT == ring 8 NEU ?  ${additive ? "JA ✓" : "NEIN ✗"}  ` +
        `(die geliebte Sicht bis Ring 8 ist unverändert)`
);
// (2) Billig: neue Ringe LOD2/LOD3
console.log(
    `(2) BILLIG:    die neuen Ringe 9–12 sind LOD2/LOD3 → +${r12new.chunks - r8new.chunks} Chunks für ` +
        `+${((r12new.ringRadius - r8new.ringRadius) * SPAN).toFixed(0)} m Sicht`
);
// (3) Enabler: ring 12 Pyramide vs naiv
const meshExtra = (((r12new.surf - r8old.surf) / r8old.surf) * 100).toFixed(1);
const meshNaive = (((r12naive.surf - r8old.surf) / r8old.surf) * 100).toFixed(1);
const buildExtra = (((r12new.grid - r8old.grid) / r8old.grid) * 100).toFixed(1);
const buildNaive = (((r12naive.grid - r8old.grid) / r8old.grid) * 100).toFixed(1);
// Das richtige Mass ist das INKREMENT (die Mehr-Kosten der Extension), nicht der
// Absolut-Vergleich: die Pyramide-Extension kostet einen Bruchteil der naiven.
const incPyr = r12new.surf - r8old.surf;
const incNaive = r12naive.surf - r8old.surf;
const cheaper = (incNaive / incPyr).toFixed(1);
console.log(
    `(3) ENABLER:   ring 12 → +50 % Weitsicht (346→518 m). Mehr-Kosten ggü. ring 8:\n` +
        `       Mesh:  Pyramide +${meshExtra} %   vs   NAIV +${meshNaive} %   → ${cheaper}× billiger\n` +
        `       Build: Pyramide +${buildExtra} %   vs   NAIV +${buildNaive} %`
);
// EHRLICH: die Pyramide senkt die GEOMETRIE-Kosten (Verts/Build), aber NICHT die
// Chunk-Zahl (= Draw-Calls). Gleich-grosse Chunks → mehr Ringe = mehr Draw-Calls.
console.log(
    `\n  EHRLICHE GRENZE (Draw-Calls): die Chunk-Zahl steigt ${r8old.chunks} → ${r12new.chunks} ` +
        `(+${r12new.chunks - r8old.chunks}). Die Pyramide\n` +
        `  macht die ferne GEOMETRIE fast gratis, aber jeder Chunk bleibt ein Draw-Call. Für\n` +
        `  VIEL mehr Ringe braucht es grössere ferne Chunks (echtes Clipmap) — die „künftige\n` +
        `  geniale Struktur" (Schöpfer-Wort). Für „ein paar mehr Ringe" ist die Pyramide genug.`
);
// Erfolg: additiv UND das Pyramide-Inkrement ist deutlich < die Hälfte des naiven.
const win = additive && incPyr < incNaive * 0.5;
console.log(
    win
        ? `\n✓ Die Pyramide IST die geniale Struktur: +50 % Weitsicht für ${cheaper}× weniger ` +
              `Mehr-Kosten\n  als naiv, die geliebte Nahsicht (Ring ≤ 8) BYTE-IDENTISCH unangetastet.`
        : "\n✗ unerwartet — Annahme prüfen."
);
process.exit(win ? 0 : 1);

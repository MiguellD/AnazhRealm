// diag-boot-foliage-ring.cjs — BEWEIS: die Vegetation wächst MIT dem Boden, nie voraus.
// Diese Linse treibt den NICHT-headless-Pfad (Null-Renderer, `_isHeadlessNull=false` erzwungen: der Ring wächst
// Schale um Schale, `_ringWaechst`, das Laub-Ziel ist auf seine Kante gekappt) und prüft: der foliageRadius
// bleibt an der Ring-Kante, statt auf MAX zu rennen.
//   node scripts/diag-boot-foliage-ring.cjs
const { statikServer, hauptLauf, nullSeite } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.FOLIRING_PORT || 4615);
const server = statikServer();
hauptLauf(async () => {
    await server.lausche(PORT);
    // Erwartet: der Null-Renderer gibt sich unten als echter aus (_isHeadlessNull = false) — ein Stoff-Bau fragt ihn dann
    // nach der Node-Bibliothek, die er nicht trägt, und bricht laut. Das ist die Attrappe dieser Linse, kein Fehler der Welt.
    const { browser, page } = await nullSeite({ frist: 120000, erwartet: /reading 'getMaterialNodeClass'/ });
    await server.zeige(page, 30000);
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state && r.state.blueprints);
    });
    const S = await page.evaluate(async () => {
        // den NICHT-headless-Pfad erzwingen: der Null-Renderer gibt sich als echter aus, damit Ring und
        // foliageRadius wachsen wie auf einer Karte (der Boot: Ring 0, Laub 70 m).
        if (st.renderer) st.renderer._isHeadlessNull = false;
        st._activeRingRadius = 0;
        st.foliageRadius = 70;
        const { span } = r._voxelChunkConfig();
        for (let i = 0; i < 160; i++) {
            try { r._gameLoopTick(performance.now()); } catch {}
            await sleep(4);
        }
        return {
            activeRing: st._activeRingRadius,
            foliageR: Math.round(st.foliageRadius || 0),
            ringReach: Math.round((st._activeRingRadius + 1) * span),
            foliMax: r.constructor.PERF_FOLIAGE_RADIUS_MAX,
            span: Math.round(span),
        };
    });
    await browser.close();
    server.close();
    console.log("=== V18.414 — DIE VEGETATION WÄCHST MIT DEM BODEN (kein ferner Billboard-Ring) ===");
    console.log(`  gebauter Terrain-Ring: ${S.activeRing} (Reichweite ${S.ringReach} m, span ${S.span} m)`);
    console.log(`  foliageRadius: ${S.foliageR} m · MAX wäre ${S.foliMax} m`);
    // Der Radius MUSS an der Ring-Kante kleben (± span Toleranz), NICHT auf MAX rennen.
    const capped = S.foliageR <= S.ringReach + S.span;
    const notMax = S.foliageR < S.foliMax - 1;
    if (!capped || !notMax) {
        console.error(`\n❌ ROT — foliageRadius (${S.foliageR} m) ${!notMax ? "raste auf MAX" : "läuft über die Ring-Kante (" + S.ringReach + " m)"} → die Vegetation liegt vor dem Boden (ferner Billboard-Ring).`);
        process.exit(1);
    }
    console.log(`\n✅ GRÜN — foliageRadius (${S.foliageR} m) bleibt an der gebauten Ring-Kante (${S.ringReach} m), rennt NICHT auf MAX (${S.foliMax} m). Die Vegetation wächst mit dem Boden — erst der Nah-Chunk, dann erweitern.`);
    process.exit(0);
});

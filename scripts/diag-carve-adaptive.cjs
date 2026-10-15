#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-carve-adaptive.cjs — DER CARVE-REBUILD GEHT ÜBER DEN WORKER (npm run gate:carve)
//
// Schöpfer-Hardware-Befund (echtes Log): `Gegraben: 5× erde` → `FPS: 4`. Der Edit-/
// Spieler-Chunk-Rebuild zwang den Mesh-Bau SYNC (instant-Carve-Feedback) → auf
// schwacher HW ein ~200-ms-Stall pro Abbau-Hieb. V18.362 machte die Sync-Pflicht adaptiv
// (nur bei gesundem Frame); K69-2 nahm sie ganz: der Neubau des Spieler-Chunks (und jedes
// Chunks mit einem Schnitt im 3×3) geht über den Worker, auch bei gesundem Frame — am Erdbau
// eines Dorfs um den Spieler baute er sonst 154–409 ms in EINEM Takt (gate:stand-takt ORT).
// Synchron baut nur ein ausdrückliches `forceSync`. Die Linse beweist die Entscheidung headless.
// ─────────────────────────────────────────────────────────────────────────

// Port über CARVE_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4330.
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.CARVE_PORT || 4330);
const server = statikServer();

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null" });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        // Takte, bis der Chunk unter dem Spieler GEBAUT steht — das Bau-Ereignis, nie eine feste Takt-Zahl: seit K69-2
        // baut der Worker auch den Spieler-Chunk (nach 33 Takten statt in 20, Prüfung K69-2-2); die Decke 600 schützt
        // nur vor dem Hängen, ihr Erreichen ist ROT (der Spieler-Chunk entstand nie).
        let takte = 0;
        for (; takte < 600; takte++) {
            const steht = await page.evaluate(() => {
                const r = window.anazhRealm;
                const st = r.state;
                const pc = st.lastPlayerVoxelChunk;
                return !!(pc && st.voxelChunks && st.voxelChunks.has(pc.cx + "," + pc.cz));
            });
            if (steht) break;
            await page.evaluate(() => window.anazhRealm._gameLoopTick());
        }
        console.log(`  der Spieler-Chunk steht nach ${takte} Takten`);
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const pc = st.lastPlayerVoxelChunk;
            if (!pc) return { err: "kein Spieler-Chunk" };
            const cx = pc.cx,
                cz = pc.cz;
            // der Test-Chunk ist der GEBAUTE Chunk unter dem Spieler (sonst misst der Neubau ins Leere)
            const o = { isPlayerChunk: !!(st.voxelChunks && st.voxelChunks.has(cx + "," + cz)) };
            // den Build-Aufruf bespitzeln → die forceSync-ENTSCHEIDUNG ablesen (unabhängig
            // vom headless-no-worker-Sync-Fallback)
            let lastForceSync = null;
            const orig = r._acquireVoxelChunkBuild.bind(r);
            r._acquireVoxelChunkBuild = function (a, b, c, opts) {
                lastForceSync = !!(opts && opts.forceSync);
                return orig(a, b, c, opts);
            };
            try {
                // (1) gesunder Frame → der Neubau geht über den Worker (kein Sync-Trip im Takt)
                st._frameOverBudget = false;
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz);
                o.syncWhenHealthy = lastForceSync;
                // (2) Frame über Budget → ebenso über den Worker
                st._frameOverBudget = true;
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz);
                o.syncWhenStruggling = lastForceSync;
                // (3) explizites forceSync bleibt ABSOLUT (Test/Naht), auch über Budget
                lastForceSync = null;
                r._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
                o.explicitForceSyncWins = lastForceSync;
            } finally {
                r._acquireVoxelChunkBuild = orig;
                st._frameOverBudget = false;
            }
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Carve-Linse fehlgeschlagen: ${out ? out.__err || out.err : "?"}`);
        process.exit(2);
    }

    const checks = [
        { name: "Der Test-Chunk ist der gebaute Chunk unter dem Spieler", pass: out.isPlayerChunk },
        {
            name: "Gesunder Frame → der Neubau des Spieler-Chunks geht über den Worker (kein Sync-Trip im Takt)",
            pass: out.syncWhenHealthy === false,
        },
        {
            name: "Frame über Budget → der Neubau geht über den Worker (KEIN ~200-ms-Stall)",
            pass: out.syncWhenStruggling === false,
        },
        {
            name: "Explizites forceSync gewinnt IMMER (Test/Naht-Intent absolut)",
            pass: out.explicitForceSyncWins === true,
        },
    ];
    console.log("\n=== Carve-Rebuild über den Worker (Grab-Stall an der Wurzel) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Carve-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Neubau des Spieler-Chunks baut synchron im Takt — Graben und Erdbau stallen.");
        process.exit(1);
    }
    console.log("✅ Der Neubau des Spieler-Chunks geht über den Worker, ein ausdrückliches forceSync bleibt synchron.");
    process.exit(0);
})();

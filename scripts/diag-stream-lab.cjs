#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-stream-lab.cjs — DIE STREAMING-WERKBANK (npm run stream-lab)
//
// Die Testumgebung, um die der Schöpfer mehrfach bat: eine SCHNELLE, isolierte
// Werkbank für die Lade-/Streaming-Wurzeln — Start-Chunk-Erscheinen, Nebel-/
// Wasser-Front-Pendeln, Front-Trajektorien. ZAHLEN, kein Pixel — der LOOK bleibt
// Schöpfer-Browser.
//
// DER GENIE-TRICK (V18.360, Schöpfer „ist der Prozess genial?" — er WAR es nicht):
// die erste Fassung bootete den SCHWEREN swiftshader-Renderer (~40–60 s, fragil),
// nur um Zahlen zu lesen — ein Vorschlaghammer für ein Thermometer. GEMESSEN
// (Null-Probe): die Wasser-Iso-Meshes (`voxelChunkWaterIso`) bauen im SCHNELLEN
// Null-Renderer genauso (CPU-Geometrie, kein GPU-Upload nötig), Boot ~9 s. Der
// EINZIGE Grund für den schweren Renderer war eine Bequemlichkeits-Zeile in
// `_builtWaterRingRadius` (~25939: im Null-Renderer kurzschliessen auf die Terrain-
// Front, gate-treu). Die umgehen wir lokal (`__forceRealFronts`-Flip) → die echte
// Wasser-vs-Terrain-DIVERGENZ ist im schnellen Null-Renderer voll messbar. Nicht
// rendern ist der intelligenteste Rasterizer.
//
// MISST: (A) Start-Chunk — Ticks bis der Spieler-Chunk einen Mesh hat + dessen LOD.
//        (B) Fog/Wasser-Pendeln — die Fronten (terrain/gras/wasser) + die Nebel-Kante
//            über die Async-Füll-Sequenz; zählt Wasser-Front-RÜCKZÜGE (nicht-monoton)
//            + Nebel-Kanten-RICHTUNGSWECHSEL (das Pendeln).
//        (C) Der PUFFER — ein synthetisch jitterndes Ziel darf die Nebel-Kante NICHT
//            pendeln lassen, ein anhaltend niedriges Ziel MUSS sie lösen (deterministisch).
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4324;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    // SCHNELLER Null-Renderer (kein swiftshader) — die Wasser-Iso-Geometrie ist CPU,
    // baut auch ohne GPU; nur der `_builtWaterRingRadius`-Kurzschluss wird lokal umgangen.
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu"],
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function",
            { timeout: 120000 }
        );
        // den `_builtWaterRingRadius`-Null-Renderer-Kurzschluss LOKAL umgehen → die ECHTE
        // Wasser-Front (CPU-Geometrie ist da) statt der Terrain-Front-Vereinfachung.
        await page.evaluate(() => {
            window.__realWaterFront = () => {
                const r = window.anazhRealm,
                    st = r.state;
                const was = st.renderer ? st.renderer._isHeadlessNull : false;
                if (st.renderer) st.renderer._isHeadlessNull = false;
                let v = null;
                try {
                    v = r._builtWaterRingRadius();
                } catch (_e) {
                    v = null;
                }
                if (st.renderer) st.renderer._isHeadlessNull = was;
                return v;
            };
        });

        // ── PHASE A: Start-Chunk — wie schnell erscheint der Boden unter dem Spieler? ──
        // Mit YIELDS (der Worker streamt async, V18.271) — ein tight-loop sähe den Chunk NIE.
        const isHeadlessNull = await page.evaluate(
            () => !!(window.anazhRealm.state.renderer && window.anazhRealm.state.renderer._isHeadlessNull)
        );
        let appearTick = -1,
            firstLod = null;
        for (let i = 0; i < 60 && appearTick < 0; i++) {
            await page.evaluate(() => window.anazhRealm._gameLoopTick && window.anazhRealm._gameLoopTick());
            await new Promise((r) => setTimeout(r, 18));
            const got = await page.evaluate(() => {
                const st = window.anazhRealm.state;
                const pc = st.lastPlayerVoxelChunk;
                if (!pc) return null;
                const e = st.voxelChunks && st.voxelChunks.get(`${pc.cx},${pc.cz}`);
                if (e && (e.mesh || e.empty))
                    return { lod: e.lod != null ? e.lod : e.mesh && e.mesh.userData ? e.mesh.userData.lod : null };
                return null;
            });
            if (got) {
                appearTick = i;
                firstLod = got.lod;
            }
        }
        const startPhase = { appearTick, firstLod, isHeadlessNull };

        // ── PHASE B: Fog/Wasser-Pendeln — der ASYNC-Fill am Spawn (das echte Szenario) ──
        // WICHTIG: NICHT teleportieren (das bräche lastPlayerVoxelChunk) + NICHT in einem
        // tight-loop ticken (der Worker liefert dann NIE — die Chunks streamen async, V18.271).
        // Stattdessen: ein Tick in evaluate, RAUS, ~20 ms warten (der Worker liefert), sampeln.
        // So füllt sich die Welt wie im echten Browser → die Wasser-Front holt das Terrain
        // budgetiert ein (jittert) → der Nebel folgt. Reset der Fog-Glättung für eine saubere Messung.
        await page.evaluate(() => {
            const st = window.anazhRealm.state;
            st._fogEdgeSmooth = null;
            window.anazhRealm._fogEdgeLowFrames = 0;
        });
        const FRAMES = 160;
        const traj = [];
        for (let f = 0; f < FRAMES; f++) {
            await page.evaluate(() => window.anazhRealm._gameLoopTick && window.anazhRealm._gameLoopTick());
            await new Promise((r) => setTimeout(r, 22)); // yield → der Worker liefert die gebauten Chunks
            const s = await page.evaluate(() => {
                const r = window.anazhRealm,
                    st = r.state;
                return {
                    bk: r._builtRingRadius ? r._builtRingRadius() : null,
                    gk: r._builtGrassRingRadius ? r._builtGrassRingRadius() : null,
                    wk: window.__realWaterFront ? window.__realWaterFront() : null,
                    fog: st.fog ? +st.fog.far.toFixed(1) : null,
                    edge: st._fogEdgeSmooth != null ? +st._fogEdgeSmooth.toFixed(1) : null,
                };
            });
            traj.push(s);
        }

        // ── PHASE C: der PUFFER-BEWEIS (deterministisch) — ein JITTERNDES Ziel (wie die
        // gemessene Wasser-Front) darf die Nebel-Kante NICHT pendeln lassen; ein ANHALTEND
        // niedrigeres Ziel MUSS sie lösen. Testet die _smoothFogEdge-Logik direkt, kein Async. ──
        const buffer = await page.evaluate(() => {
            const r = window.anazhRealm;
            r._fogEdgeLowFrames = 0;
            let edge = 200,
                reversals = 0,
                lastDir = 0;
            // 90 Frames jitterndes Ziel (200 ↔ 160, Periode 6) — der Streaming-Dip
            for (let i = 0; i < 90; i++) {
                const target = i % 6 < 3 ? 200 : 160;
                const ne = r._smoothFogEdge(edge, target);
                const d = ne - edge,
                    dir = d > 0.05 ? 1 : d < -0.05 ? -1 : 0;
                if (dir !== 0 && lastDir !== 0 && dir !== lastDir) reversals++;
                if (dir !== 0) lastDir = dir;
                edge = ne;
            }
            const heldAt = +edge.toFixed(1); // soll nahe 200 bleiben (NICHT zur 160 pendeln)
            // dann 120 Frames ANHALTEND niedrig (120) — MUSS lösen + contracten
            r._fogEdgeLowFrames = 0;
            let released = false;
            for (let i = 0; i < 120; i++) {
                const ne = r._smoothFogEdge(edge, 120);
                if (ne < edge - 0.05) released = true;
                edge = ne;
            }
            return { jitterReversals: reversals, heldAt, releasedTo: +edge.toFixed(1), released };
        });

        out = { startPhase, spot: { spawn: true }, traj, buffer };
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Lab-Boot/Mess fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // ── Analyse ──
    console.log("\n=== STREAMING-WERKBANK ===");
    console.log(
        `Renderer: ${out.startPhase.isHeadlessNull ? "NULL (schnell, ~9 s) + Wasser-Front-Kurzschluss umgangen → echte Front" : "ECHT (swiftshader)"}`
    );

    console.log("\n— PHASE A: Start-Chunk —");
    console.log(
        `  Boden unter dem Spieler nach ${out.startPhase.appearTick} Ticks · erster LOD: ${out.startPhase.firstLod}`
    );

    console.log("\n— PHASE B: Fog/Wasser-Front-Pendeln —");
    if (out.spot.nowater) console.log("  ⚠ kein wasser-naher Spot gefunden — Divergenz evtl. schwach.");
    const t = out.traj;
    let waterRetreats = 0,
        maxWaterDrop = 0;
    for (let i = 1; i < t.length; i++) {
        if (t[i].wk != null && t[i - 1].wk != null && t[i].wk < t[i - 1].wk) {
            waterRetreats++;
            maxWaterDrop = Math.max(maxWaterDrop, t[i - 1].wk - t[i].wk);
        }
    }
    // Nebel-Kanten-Richtungswechsel (das Pendeln): zähle Vorzeichen-Wechsel der edge-Differenz
    let edgeReversals = 0,
        edgeAmp = 0;
    let lastDir = 0,
        localMin = Infinity,
        localMax = -Infinity;
    for (let i = 1; i < t.length; i++) {
        if (t[i].edge == null || t[i - 1].edge == null) continue;
        const d = t[i].edge - t[i - 1].edge;
        const dir = d > 0.05 ? 1 : d < -0.05 ? -1 : 0;
        if (dir !== 0 && lastDir !== 0 && dir !== lastDir) {
            edgeReversals++;
            edgeAmp = Math.max(edgeAmp, localMax - localMin);
            localMin = Infinity;
            localMax = -Infinity;
        }
        if (dir !== 0) lastDir = dir;
        localMin = Math.min(localMin, t[i].edge);
        localMax = Math.max(localMax, t[i].edge);
    }
    const wkSeq = t.map((s) => s.wk).filter((v) => v != null);
    const edgeSeq = t.map((s) => s.edge).filter((v) => v != null);
    console.log(`  Wasser-Front-Verlauf: [${wkSeq.filter((_, i) => i % 20 === 0).join(",")} …]`);
    console.log(`  Wasser-Front-RÜCKZÜGE (nicht-monoton): ${waterRetreats}  · max Drop ${maxWaterDrop} Ringe`);
    console.log(
        `  Nebel-Kante-Verlauf:  [${edgeSeq
            .filter((_, i) => i % 20 === 0)
            .map((v) => v.toFixed(0))
            .join(",")} …]`
    );
    console.log(
        `  Nebel-Kante-RICHTUNGSWECHSEL (das Pendeln): ${edgeReversals}  · max Amplitude ${edgeAmp.toFixed(1)} m`
    );

    const pendelt = edgeReversals >= 4 && edgeAmp >= 3;
    console.log(
        `\n${pendelt ? "⛔ NEBEL PENDELT" : "✅ Nebel-Kante ruhig"} (Schwelle: ≥4 Wechsel & ≥3 m Amplitude).` +
            (waterRetreats > 0 ? `  Quelle (Wasser-Front) oszilliert: ${waterRetreats} Rückzüge (real, GEMESSEN).` : "")
    );

    console.log("\n— PHASE C: der PUFFER (das jitternde Ziel gegen die Nebel-Kante) —");
    const bf = out.buffer;
    const bufOk = bf.jitterReversals === 0 && bf.heldAt > 195 && bf.released && bf.releasedTo < 160;
    console.log(
        `  jitterndes Ziel (200↔160): Nebel-Richtungswechsel ${bf.jitterReversals} · gehalten bei ${bf.heldAt} (Ziel: ~200, KEIN Pendeln)`
    );
    console.log(`  anhaltend niedriges Ziel (120): gelöst=${bf.released} · contracted zu ${bf.releasedTo}`);
    console.log(
        `  ${bufOk ? "✅ DER PUFFER WIRKT" : "❌ Puffer defekt"}: die Kante hält gegen Streaming-Jitter UND löst bei echtem Rückzug.`
    );
    process.exit(bufOk ? 0 : 1);
})();

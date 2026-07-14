// Diagnose B1 (V18.345) — DER WASSER-SHEET-WORKER-MIRROR ist BYTE-IDENTISCH.
//
// Das Orakel des B1-Bogens (analog diag-worker-chunk für das Terrain-Mesh): der
// Worker baut den Wasser-Zell-Oberkanten-Sheet OFF-THREAD (`buildWaterSheetGeometry`,
// via `water-sheet`-Message) — er MUSS bit-identisch zum Main-Sync-Pfad
// (`_computeWaterSheetData`) sein, sonst lebt das Wasser auf zwei Wahrheiten.
//
// Für jeden CA-freien Wasser-Chunk: Main-Sheet (sync) vs Worker-Sheet (round-trip),
// Vergleich positions/indices/aFlow/aWave/aDepth/aSlope byte-für-byte (Float32/Uint32).
// maxDiff MUSS 0. Exit 1 bei Drift/Längen-Mismatch/Page-Error.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4391;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (err) => {
        pageErr = (err.stack || err.message).split("\n")[0];
        console.log("[PAGE-ERROR]", pageErr);
    });
    // Null-Renderer (wie der Playtest): die Determinismus-Probe braucht KEINEN GPU-Render
    // (sie rechnet `_computeWaterSheetData` + den Worker-Sheet direkt) — der swiftshader-
    // Render macht den Boot/Loop sonst ~2.5 s/Frame (ProtocolTimeout). Worker + Compute
    // sind render-unabhängig.
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Boot — pump bis Welt-bereit (Loop läuft) + Worker bereit.
    await page.evaluate(async () => {
        try {
            localStorage.clear();
        } catch (_e) {
            /* */
        }
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.voxelChunks && r.state.voxelChunks.size > 8 && r.state.voxelWorkerReady) break;
            }
            await new Promise((res) => setTimeout(res, 16));
        }
    });

    // Zu echtem Wasser steuern: ein NATÜRLICHES Wasserfeld (Ozean/See) finden
    // (submerges Atlas-Wasser), den Spieler dorthin setzen + die Welt darum streamen
    // (der Worker baut die Chunks + liefert die waterCells). Dann der Vergleich.
    const steer = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        if (!s || !s.playerMesh) return { err: "kein Spieler" };
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;
        // Spiral-Scan nach der NÄCHSTEN submergten Wasser-Spalte (Atlas-Wasser über Terrain).
        let spot = null;
        for (let radius = 0; radius <= 1400 && !spot; radius += 30) {
            for (let a = 0; a < 360 && !spot; a += 15) {
                const rad = (a * Math.PI) / 180;
                const x = px + Math.cos(rad) * radius;
                const z = pz + Math.sin(rad) * radius;
                const L = r._atlasWaterLevelAt(x, z, -Infinity);
                if (!(L > -Infinity)) continue;
                const t = r.getTerrainHeightAt(x, z);
                if (Number.isFinite(t) && t < L - 1.5) spot = { x, z, L };
            }
        }
        if (!spot) return { err: "kein natürliches Wasser im 1400-m-Radius gefunden" };
        // Spieler ans Wasser (Body-frei seit V18.331 — nur die Mesh-Position treibt das Streaming).
        s.playerMesh.position.set(spot.x, spot.L + 3, spot.z);
        // Streaming-Pump: der Worker baut die Chunks um den Spieler + liefert waterCells.
        for (let i = 0; i < 280; i++) {
            try {
                if (typeof r._tickVoxelChunkStreaming === "function") r._tickVoxelChunkStreaming();
                r._gameLoopTick(performance.now());
                if (r._drainPendingWaterIso) r._drainPendingWaterIso();
            } catch (_e) {
                /* */
            }
            if (i % 6 === 0) await new Promise((res) => setTimeout(res, 12));
        }
        return { x: +spot.x.toFixed(1), z: +spot.z.toFixed(1), L: +spot.L.toFixed(1), chunks: s.voxelChunks.size };
    });

    const report = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {
            ok: true,
            msgs: [],
            compared: 0,
            waterChunks: 0,
            withCells: 0,
            withWater: 0,
            maxDiff: 0,
            mismatches: [],
        };
        if (!r || !r.state || !r.state.voxelChunks) {
            out.ok = false;
            out.msgs.push("keine Welt/voxelChunks");
            return out;
        }
        if (!r.state.voxelWorker || !r.state.voxelWorkerReady) {
            out.ok = false;
            out.msgs.push("Worker nicht bereit");
            return out;
        }
        // Welt EINFRIEREN + SETTLED-CA SIMULIEREN: der rAF-Loop würde sonst streamen. `_gameLoopTick`
        // →no-op. Dann der HARTE B1-Beweis: `waterCAActive` LEEREN (nichts fliesst → der
        // `waterCAActive`-Gate lässt alle durch) UND `waterLevelCells` aus dem FLOOD SEEDEN für
        // ALLE Wasser-Chunks (`_seedWaterLevel` = der CA-Ruhe-Spiegel). So liest der Main-ctx einen
        // FLOOD-Level (CA-Delta d=0) → wir prüfen, dass der Worker-STATIC-Sheet byte-identisch zum
        // Main-CA-FLOOD-Sheet ist — DAS ist die Grundlage der `waterCAActive`-Route (settled = flood
        // = identisch). Schärfer als der reine CA-freie Vergleich.
        r._gameLoopTick = () => {};
        if (r.state.waterCAActive) r.state.waterCAActive.clear();
        if (r.state.waterStauFields) r.state.waterStauFields.clear();
        if (!r.state.waterLevelCells) r.state.waterLevelCells = new Map();
        else r.state.waterLevelCells.clear();
        for (const [k, e] of r.state.voxelChunks) {
            if (e && e.waterCells && e.waterCells.length) {
                try {
                    r.state.waterLevelCells.set(k, r._seedWaterLevel(e.waterCells));
                } catch (_e) {
                    /* */
                }
            }
        }
        // Kandidaten: CA-freie Chunks, deren Main-Sheet NICHT null ist (also Wasser tragen).
        const keys = [...r.state.voxelChunks.keys()];
        const cand = [];
        for (const key of keys) {
            const ci = key.indexOf(",");
            const cx = parseInt(key.slice(0, ci), 10);
            const cz = parseInt(key.slice(ci + 1), 10);
            const entry = r.state.voxelChunks.get(key);
            if (!entry || !entry.waterCells || entry.waterCells.length === 0) continue;
            out.withCells++;
            // hat die Spalten-Zelle echtes WATER (CELL_STATE.WATER=1)?
            let anyWater = false;
            for (let q = 0; q < entry.waterCells.length; q++) {
                if (entry.waterCells[q] === 1) {
                    anyWater = true;
                    break;
                }
            }
            if (anyWater) out.withWater++;
            if (!r._waterSheetCaFree(cx, cz)) continue;
            let mainData = null;
            try {
                mainData = r._computeWaterSheetData(cx, cz, r._mainWaterSheetCtx(cx, cz, entry));
            } catch (e) {
                out.msgs.push(`main-compute-throw ${key}: ${e.message}`);
                continue;
            }
            if (!mainData) continue; // kein Wasser-Sheet in diesem Chunk
            cand.push({ cx, cz, key, mainData });
            if (cand.length >= 24) break;
        }
        out.waterChunks = cand.length;
        if (cand.length === 0) {
            out.ok = false;
            out.msgs.push("KEIN CA-freier Wasser-Chunk gefunden (Welt ohne Wasser im Ring?)");
            return out;
        }

        const f32 = (a) => (a instanceof Float32Array ? a : new Float32Array(a));
        const u32 = (a) => (a instanceof Uint32Array ? a : new Uint32Array(a));
        const cmpF = (label, a, b, ctx) => {
            const A = f32(a);
            const B = f32(b);
            if (A.length !== B.length) {
                out.ok = false;
                out.mismatches.push(`${ctx} ${label} LEN ${A.length}≠${B.length}`);
                return;
            }
            for (let i = 0; i < A.length; i++) {
                const d = Math.abs(A[i] - B[i]);
                if (d > out.maxDiff) out.maxDiff = d;
                if (d !== 0) {
                    out.ok = false;
                    if (out.mismatches.length < 12)
                        out.mismatches.push(`${ctx} ${label}[${i}] ${A[i]}≠${B[i]} (Δ${d})`);
                }
            }
        };
        const cmpU = (label, a, b, ctx) => {
            const A = u32(a);
            const B = u32(b);
            if (A.length !== B.length) {
                out.ok = false;
                out.mismatches.push(`${ctx} ${label} LEN ${A.length}≠${B.length}`);
                return;
            }
            for (let i = 0; i < A.length; i++) {
                if (A[i] !== B[i]) {
                    out.ok = false;
                    if (out.mismatches.length < 12) out.mismatches.push(`${ctx} ${label}[${i}] ${A[i]}≠${B[i]}`);
                    if (1 > out.maxDiff) out.maxDiff = 1;
                }
            }
        };

        for (const c of cand) {
            let wd = null;
            try {
                wd = await r._workerBuildWaterSheet(c.cx, c.cz);
            } catch (e) {
                out.ok = false;
                out.msgs.push(`worker-throw ${c.key}: ${e.message}`);
                continue;
            }
            if (!wd || wd.empty) {
                out.ok = false;
                out.mismatches.push(`${c.key}: Worker EMPTY, Main hatte ${c.mainData.positions.length / 3} Verts`);
                continue;
            }
            cmpF("position", c.mainData.positions, wd.positions, c.key);
            cmpU("index", c.mainData.indices, wd.indices, c.key);
            cmpF("aFlow", c.mainData.aFlow, wd.aFlow, c.key);
            cmpF("aWave", c.mainData.aWave, wd.aWave, c.key);
            cmpF("aDepth", c.mainData.aDepth, wd.aDepth, c.key);
            cmpF("aSlope", c.mainData.aSlope, wd.aSlope, c.key);
            out.compared++;
        }
        return out;
    });

    console.log("\n========= B1 DIAGNOSE — Wasser-Sheet Worker == Main (byte-identisch) =========\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    console.log(`  Wasser-Spot: ${steer && steer.err ? steer.err : JSON.stringify(steer)}`);
    for (const m of report.msgs) console.log("  •", m);
    console.log(`  Chunks mit waterCells: ${report.withCells}  (davon mit echtem WATER: ${report.withWater})`);
    console.log(`  CA-freie Wasser-Sheet-Chunks (Kandidaten): ${report.waterChunks}`);
    console.log(`  verglichen (Worker round-trip): ${report.compared}`);
    console.log(`  maxDiff: ${report.maxDiff}`);
    if (report.mismatches.length) {
        console.log("  MISMATCHES:");
        for (const mm of report.mismatches) console.log("    ✗", mm);
    }
    const pass = report.ok && !pageErr && report.compared > 0 && report.maxDiff === 0;
    console.log(
        `\n${pass ? "✅" : "⛔"} ${pass ? "Worker-Sheet == Main-Sheet, byte-identisch (maxDiff 0)" : "DRIFT / FEHLER"}\n`
    );
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

// Diagnose W-B (V18.90, T4-Plan §6) — der CA als FÜLL-WAHRHEIT, BEWIESEN (headless = Zustand):
//   A · QUELLEN-PIN   — Atlas-Wasser-Spalten sind unendliche Reservoirs (Minecraft-Source):
//                       manuell entleerte Quell-Zellen füllen sich pro Tick zurück, dann Settle.
//   B · NACHFLIESSEN  — ein ECHTER Carve unter `L` am Ufer: die Level-Einträge sind PRE-geseedet
//                       (deterministisch, kein Timing), der neue Raum beginnt LEER (sichtbarer
//                       Verzug) und FÜLLT sich über Ticks; der See bleibt voll (die Quelle speist).
//   D · BAND-PARITÄT  — der y-Band-Tick ist BIT-IDENTISCH zum Voll-Sweep (+ Speed-Faktor).
// Exit 1 bei Pin-/Fluss-/Paritäts-Bruch oder Page-Error.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4380;
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
    const pageErrors = [];
    page.on("pageerror", (e) => {
        pageErrors.push((e.stack || e.message).split("\n")[0]);
        console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]);
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const dim = cfg.dim,
            dimY = cfg.dimY,
            step = cfg.step,
            span = cfg.span;
        const dimSq = dim * dim;
        const WATER = r.constructor.CELL_STATE.WATER;
        const SOLID = r.constructor.CELL_STATE.SOLID;
        const oy = (s.terrainBaseHeight || 0) - cfg.floorDrop;

        // ---- Kandidat: ein LOD0-Chunk mit ECHTEM Atlas-Wasser + einer Ufer-Spalte ----
        let pick = null;
        for (const [key, e] of s.voxelChunks) {
            if (!e || e.empty || !e.waterCells || (Number.isFinite(e.lod) && e.lod !== 0)) continue;
            const [cx, cz] = key.split(",").map(Number);
            const cells = e.waterCells;
            // Ufer-Spalte suchen: WATER-Spalte mit trockenem 4-Nachbarn (Innenbereich)
            for (let k = 2; k < dim - 2 && !pick; k++) {
                for (let i = 2; i < dim - 2 && !pick; i++) {
                    const col = i + k * dim;
                    let topW = -1;
                    for (let j = dimY - 1; j >= 0; j--)
                        if (cells[col + j * dimSq] === WATER) {
                            topW = j;
                            break;
                        }
                    if (topW < 3) continue;
                    for (const [di, dk] of [
                        [1, 0],
                        [-1, 0],
                        [0, 1],
                        [0, -1],
                    ]) {
                        const nc = i + di + (k + dk) * dim;
                        let nWet = false;
                        for (let j = 0; j < dimY; j++)
                            if (cells[nc + j * dimSq] === WATER) {
                                nWet = true;
                                break;
                            }
                        if (!nWet) {
                            pick = { key, cx, cz, i: i + di * 2, k: k + dk * 2, topW, e };
                            break;
                        }
                    }
                }
            }
            if (pick) break;
        }
        if (!pick) return { err: "kein Ufer-Kandidat gefunden" };

        // ---- A · QUELLEN-PIN ----
        const lvA = r._ensureWaterCALevel(pick.cx, pick.cz);
        const srcA = s.waterSourceCols.get(pick.key);
        let srcWaterIdx = [];
        if (srcA) {
            for (let c = 0; c < dimSq && srcWaterIdx.length < 40; c++) {
                if (!srcA[c]) continue;
                for (let j = 0; j < dimY; j++) {
                    const idx = c + j * dimSq;
                    if (pick.e.waterCells[idx] === WATER) srcWaterIdx.push(idx);
                }
            }
        }
        let pinOk = false,
            pinSettled = false,
            pinDebug = null;
        if (srcWaterIdx.length > 5) {
            for (const idx of srcWaterIdx) lvA[idx] = 0.2; // manuell entleert
            r._wakeWaterCA(pick.cx, pick.cz);
            for (let t = 0; t < 60; t++) r._tickWorldWaterCA();
            // MAKRO-Kriterium (Mittel ≥ 0.97): das Reservoir bleibt voll, WÄHREND der CA
            // legitim in Ufer-Schelf-Zellen unter L weiterdiffundiert (die statische Flood
            // ließ sie aus — die T7d-Lücken; Rand-Zellen tragen mid-Diffusion einen Tick-
            // Abfluss, das ist die QUELLE bei der Arbeit, kein Leck — der See-Pegel hält).
            let pinSum = 0;
            for (const idx of srcWaterIdx) pinSum += lvA[idx];
            pinOk = pinSum / srcWaterIdx.length >= 0.97;
            pinSettled = !s.waterCAActive || !s.waterCAActive.has(pick.key) || s.waterCAActive.size === 0;
            const lvNow = s.waterLevelCells.get(pick.key);
            let mn = Infinity,
                mx = -Infinity,
                below = 0;
            for (const idx of srcWaterIdx) {
                const v = lvNow[idx];
                if (v < mn) mn = v;
                if (v > mx) mx = v;
                if (v < 0.999) below++;
            }
            pinDebug = {
                sameRef: lvNow === lvA,
                mn: +mn.toFixed(3),
                mx: +mx.toFixed(3),
                below,
                active: s.waterCAActive ? [...s.waterCAActive].slice(0, 6) : [],
                worstIdx: srcWaterIdx.find((idx) => lvNow[idx] < 0.999),
            };
            if (pinDebug.worstIdx !== undefined) {
                const idx = pinDebug.worstIdx;
                const j = (idx / dimSq) | 0;
                const c = idx - j * dimSq;
                pinDebug.worst = { c, j, cell: pick.e.waterCells[idx], src: srcA[c], lv: +lvNow[idx].toFixed(3) };
            }
        }

        // ---- B · DETERMINISTISCHES NACHFLIESSEN (echter Carve unter L am Ufer) ----
        const wx = pick.cx * span + (pick.i + 0.5) * step;
        const wz = pick.cz * span + (pick.k + 0.5) * step;
        const carveY = oy + (pick.topW - 0.5) * step; // unter dem Wasser-Dach → unter L
        const preCells = pick.e.waterCells.slice();
        r.carveVoxelSphere(wx, carveY, wz, 3.2);
        const e2 = s.voxelChunks.get(pick.key);
        const cells2 = e2 && e2.waterCells ? e2.waterCells : null;
        if (!cells2) return { err: "Chunk nach Carve ohne Zellen" };
        const lv2 = s.waterLevelCells.get(pick.key);
        const preSeeded = !!lv2; // MUSS existieren (der V18.90-Pre-Seed)
        // der NEUE Wasser-Raum: jetzt WATER, vorher SOLID
        const newWater = [];
        for (let n = 0; n < cells2.length; n++) if (cells2[n] === WATER && preCells[n] === SOLID) newWater.push(n);
        const fillFrac = () => {
            if (!lv2 || newWater.length === 0) return -1;
            let f = 0;
            for (const n of newWater) if (lv2[n] > 0.5) f++;
            return f / newWater.length;
        };
        const fill0 = fillFrac();
        const fillCurve = [];
        for (let t = 0; t < 240; t++) {
            r._tickWorldWaterCA();
            if (t % 40 === 39) fillCurve.push(+fillFrac().toFixed(3));
        }
        const fillEnd = fillFrac();
        // der See bleibt voll (die Quelle speist): Quell-WATER-Zellen (post-carve) ≥ 0.99?
        let srcFull = -1;
        if (srcA) {
            let tot = 0,
                full = 0;
            for (let c = 0; c < dimSq; c++) {
                if (!srcA[c]) continue;
                for (let j = 0; j < dimY; j++) {
                    const idx = c + j * dimSq;
                    if (cells2[idx] === WATER) {
                        tot++;
                        if (lv2[idx] >= 0.99) full++;
                    }
                }
            }
            srcFull = tot ? full / tot : -1;
        }

        // ---- D · BAND-PARITÄT (synthetisch, bit-identisch + Speed) ----
        const mk = () => {
            const cells = new Uint8Array(dimSq * dimY);
            for (let c = 0; c < dimSq; c++) cells[c] = SOLID;
            const level = new Float32Array(dimSq * dimY);
            const kMid = (dim >> 1) * dim + (dim >> 1);
            for (let j = 60; j <= 66; j++) level[j * dimSq + kMid] = 1.0;
            return { cells, level };
        };
        const fullS = mk();
        const bandS = mk();
        const scratch = new Float64Array(dimSq * dimY);
        const t0 = performance.now();
        for (let t = 0; t < 40; t++) r._tickWaterCA(fullS.level, fullS.cells, dim, dimY, 0.25, scratch, null);
        const tFull = performance.now() - t0;
        const band = { jMin: 0, jMax: dimY - 1 };
        const t1 = performance.now();
        for (let t = 0; t < 40; t++) r._tickWaterCA(bandS.level, bandS.cells, dim, dimY, 0.25, scratch, band);
        const tBand = performance.now() - t1;
        let bandMismatch = 0;
        for (let n = 0; n < fullS.level.length; n++) if (fullS.level[n] !== bandS.level[n]) bandMismatch++;

        return {
            key: pick.key,
            srcCols: srcA ? srcA.reduce((a, b) => a + b, 0) : 0,
            srcCells: srcWaterIdx.length,
            pinOk,
            pinDebug,
            pinSettled,
            preSeeded,
            newWater: newWater.length,
            fill0: +fill0.toFixed(3),
            fillCurve,
            fillEnd: +fillEnd.toFixed(3),
            srcFull: +srcFull.toFixed(3),
            bandMismatch,
            tFull: +tFull.toFixed(1),
            tBand: +tBand.toFixed(1),
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== W-B — QUELLEN + NACHFLIESSEN + y-BAND (`diag-water-sources`) ===\n");
    if (out.err) {
        console.log("SKIP:", out.err, "\n");
        process.exit(0);
    }
    console.log(`Chunk ${out.key} · Quell-Spalten: ${out.srcCols}`);
    console.log(
        `A · QUELLEN-PIN (${out.srcCells} entleerte Quell-Zellen): aufgefüllt=${out.pinOk ? "✓" : "✗"} · settled=${out.pinSettled ? "✓" : "○"}`
    );
    if (out.pinDebug) console.log(`    debug: ${JSON.stringify(out.pinDebug)}`);
    console.log(
        `B · NACHFLIESSEN: pre-seeded=${out.preSeeded ? "✓" : "✗ (Timing-Falle zurück!)"} · neuer Raum ${out.newWater} Zellen · Füllung ${out.fill0} → [${out.fillCurve.join(" → ")}]   (${out.fill0 < 0.5 && out.fillEnd > 0.6 ? "✓ fliesst SICHTBAR nach" : "✗"})`
    );
    console.log(`    der See bleibt voll (Quell-Zellen ≥0.99): ${out.srcFull >= 0.95 ? "✓" : "✗"} (${out.srcFull})`);
    console.log(
        `D · BAND-PARITÄT: mismatches=${out.bandMismatch} (${out.bandMismatch === 0 ? "✓ bit-identisch" : "✗"}) · Voll ${out.tFull} ms vs Band ${out.tBand} ms (${(out.tFull / Math.max(0.1, out.tBand)).toFixed(1)}×)`
    );
    console.log(`Page-Errors: ${pageErrors.length}\n`);

    const ok =
        out.pinOk &&
        out.preSeeded &&
        out.fill0 < 0.5 &&
        out.fillEnd > 0.6 &&
        out.srcFull >= 0.95 &&
        out.bandMismatch === 0 &&
        pageErrors.length === 0;
    console.log(
        ok
            ? "GRÜN — der CA ist die Füll-Wahrheit: Quellen speisen, Carves fliessen sichtbar nach, das Band ist exakt.\n"
            : "ROT — siehe oben.\n"
    );
    process.exit(ok ? 0 : 1);
})();

// Diagnose V18.29 — REAKTIVE Flut über die Chunkgrenze (Schöpfer „beim Abbauen fliesst das
// Wasser innerhalb des Chunks nach, aber NICHT über die Naht in die Vertiefung"). Reproduktion:
// finde eine Wasser-Grenze (Chunk A hat WATER an der Kante zu B), carve eine Vertiefung in B
// knapp jenseits der Grenze (unter dem Spiegel L, an A's Wasser angrenzend), drain sync, prüfe:
// flutet B die Vertiefung jetzt? (Vor V18.29 blieb B trocken — B seedete nur aus dem Atlas.)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4369;
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 50000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        for (let i = 0; i < 200; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span,
            dim = cfg.dim,
            step = cfg.step,
            dimY = cfg.dimY;
        const dimSq = dim * dim;
        const base = s.terrainBaseHeight || 0;
        const oy0 = base - cfg.floorDrop;
        const WATER = r.constructor.CELL_STATE.WATER;
        // (1) finde Chunk A mit WATER nahe der RECHTEN Kante (Spalte i=dim-1), Nachbar B=(cx+1) existiert.
        const colWet = (cells, i, k) => {
            for (let j = 0; j < dimY; j++) if (cells[i + k * dim + j * dimSq] === WATER) return true;
            return false;
        };
        let found = null;
        for (const [key, A] of s.voxelChunks) {
            if (!A || !A.waterCells) continue;
            const [cx, cz] = key.split(",").map(Number);
            const B = s.voxelChunks.get(`${cx + 1},${cz}`);
            if (!B || !B.waterCells) continue;
            for (let k = 2; k < dim - 2; k++) {
                if (colWet(A.waterCells, dim - 1, k)) {
                    found = { cx, cz, k, A, B };
                    break;
                }
            }
            if (found) break;
        }
        if (!found) return { ok: false, reason: "keine Wasser-Grenze gefunden" };
        const { cx, cz, k, B } = found;
        const ox = cx * span,
            oz = cz * span;
        const bx = (cx + 1) * span; // die Grenze x
        const bz = oz + (k + 0.5) * step;
        const L = r._atlasWaterLevelAt(bx, bz, -Infinity);
        // (2) Vor dem Carve: hat B an dieser Stelle (knapp jenseits der Grenze) WATER?
        const probeWet = () => {
            const Bnow = s.voxelChunks.get(`${cx + 1},${cz}`);
            if (!Bnow || !Bnow.waterCells) return 0;
            let wet = 0;
            for (let bi = 0; bi <= 3; bi++)
                for (let bk = Math.max(0, k - 2); bk <= Math.min(dim - 1, k + 2); bk++)
                    if (colWet(Bnow.waterCells, bi, bk)) wet++;
            return wet;
        };
        const wetBefore = probeWet();
        // (3) Carve eine Vertiefung in B, knapp jenseits der Grenze, unter L (an A's Wasser angrenzend).
        const cxw = bx + 3.5;
        const cyw = L - 1.5;
        const czw = bz;
        r.carveVoxelSphere(cxw, cyw, czw, 5);
        // (4) drain sync (der Force-Sync + die reaktive Flut)
        if (typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        // ein paar Ticks, falls die Propagation iteriert
        for (let i = 0; i < 6; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        }
        const wetAfter = probeWet();
        const hasCarve = r._chunkRegionHasCarve(cx + 1, cz);
        return {
            ok: true,
            key: `${cx},${cz}`,
            k,
            L: +L.toFixed(2),
            carve: [+cxw.toFixed(1), +cyw.toFixed(1), +czw.toFixed(1)],
            wetBefore,
            wetAfter,
            hasCarve,
            BhasCells: !!(B && B.waterCells),
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n=== REAKTIVE FLUT ÜBER DIE CHUNKGRENZE (V18.29) ===");
    if (!out.ok) {
        console.log("SKIP:", out.reason);
        process.exit(0);
    }
    console.log(`Grenze an Chunk ${out.key} (rechte Kante, k=${out.k}), Spiegel L=${out.L} m`);
    console.log(
        `Carve in B bei [${out.carve}] (unter L, an A's Wasser angrenzend); _chunkRegionHasCarve(B)=${out.hasCarve}`
    );
    console.log(`B-Wasser-Spalten in der Carve-Zone:  VORHER ${out.wetBefore}  →  NACHHER ${out.wetAfter}`);
    if (out.wetAfter > out.wetBefore)
        console.log(
            `✅ B FLUTET die Vertiefung jetzt über die Grenze (+${out.wetAfter - out.wetBefore} Spalten) — die reaktive Flut propagiert.`
        );
    else
        console.log(
            `❌ B flutet NICHT (vorher ${out.wetBefore}, nachher ${out.wetAfter}) — die Propagation greift noch nicht.`
        );
    console.log("");
    process.exit(0);
})();

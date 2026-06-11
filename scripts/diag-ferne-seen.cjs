// A3 (V18.132) — FERNE BINNENGEWAESSER: die Mess-Sonde. Beweist:
//   (1) JENSEITS ±1024 existieren jetzt Seen/Fluesse (vorher GEMESSEN 0 —
//       nur der globale H3-Ozean),
//   (2) die HEIMAT-Region ist BIT-IDENTISCH vor/nach dem Kachel-Bau
//       (Welt-Identitaet — der V17.117-Vertrag "in-region unangetastet"),
//   (3) eine Kachel ist DETERMINISTISCH (zweimal berechnet → identisch),
//   (4) WORKER == MAIN am fernen Chunk (Density-Grid bit-identisch — die
//       Determinismus-Wand haelt mit Kachel-Wahrheit),
//   (5) der Kachel-Compute-Preis (ms — der Erkundungs-Hitch, ehrlich).
//   node scripts/diag-ferne-seen.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4402;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
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
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const t0 = performance.now();
        while (performance.now() - t0 < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                r.state.postProcessingFailed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const h = r.state && r.state.hydrosphere;
                if (h && h.ready && r.state.voxelWorkerReady) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
        const r = window.anazhRealm;
        const wl = r.state.waterLevel;
        const out = { wl: +wl.toFixed(2) };

        // (2a) HEIMAT-Fingerprint VOR den Kacheln (256 deterministische Punkte).
        const homeFp = () => {
            const vals = [];
            for (let i = 0; i < 16; i++) {
                for (let j = 0; j < 16; j++) {
                    const x = -1000 + (i + 0.5) * 125;
                    const z = -1000 + (j + 0.5) * 125;
                    vals.push(
                        r._atlasWaterLevelAt(x, z, -Infinity),
                        r._erosionDeltaAt(x, z),
                        r._terrainMacroSurfaceY(x, z, true)
                    );
                }
            }
            return JSON.stringify(vals);
        };
        const fpBefore = homeFp();

        // (1) + (5) Kachel Ost (1,0) bauen + messen.
        const tA = performance.now();
        r._ensureHydroTilesAround(2048, 0, 10);
        out.tileMs = Math.round(performance.now() - tA);
        const tile = r.state.hydroTiles.get("1,0");
        out.tileExists = !!(tile && tile.ready);
        out.tileRivers = tile && tile.rivers ? tile.rivers.length : 0;
        out.tileLakes = tile && tile.lakes ? tile.lakes.length : 0;
        // Punkt-Beweis: Atlas-Wasser ÜBER Meeresspiegel jenseits ±1024.
        let lakeRiverPts = 0;
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 24; j++) {
                const x = 1100 + ((i + 0.5) / 24) * 1900;
                const z = -1000 + ((j + 0.5) / 24) * 2000;
                const a = r._atlasWaterLevelAt(x, z, -Infinity);
                if (a > -Infinity && a > wl + 1.5) lakeRiverPts++;
            }
        }
        out.lakeRiverPtsBeyond = lakeRiverPts;

        // (2b) HEIMAT-Fingerprint NACH den Kacheln — bit-identisch?
        out.homeIdentical = homeFp() === fpBefore;

        // (3) Kachel-Determinismus: (1,0) frisch in leere Maps neu rechnen.
        const savedH = r.state.hydroTiles;
        const savedE = r.state.erosionTiles;
        r.state.hydroTiles = new Map();
        r.state.erosionTiles = new Map();
        r._ensureHydroTilesAround(2048, 0, 10);
        const tile2 = r.state.hydroTiles.get("1,0");
        const wk1 = tile.water.waterKind;
        const wk2 = tile2.water.waterKind;
        let identical = wk1.length === wk2.length;
        if (identical)
            for (let i = 0; i < wk1.length; i++)
                if (wk1[i] !== wk2[i]) {
                    identical = false;
                    break;
                }
        const wy1 = tile.water.waterY;
        const wy2 = tile2.water.waterY;
        if (identical)
            for (let i = 0; i < wy1.length; i++)
                if (wy1[i] !== wy2[i]) {
                    identical = false;
                    break;
                }
        out.tileDeterministic = identical && tile2.rivers.length === tile.rivers.length;
        r.state.hydroTiles = savedH;
        r.state.erosionTiles = savedE;
        // Worker auf den Stand der wiederhergestellten Maps bringen.
        await r._voxelWorkerSyncWorldgenState();

        // (4) WORKER == MAIN am fernen Chunk (in der Kachel, nahe eines
        // Flusses falls vorhanden — der haerteste Punkt).
        let probeX = 2048;
        let probeZ = 0;
        if (tile.rivers && tile.rivers.length) {
            const rv = tile.rivers.reduce((a, b) => ((a.points || []).length > (b.points || []).length ? a : b));
            const mid = rv.points[Math.floor(rv.points.length / 2)];
            probeX = mid.x;
            probeZ = mid.z;
        }
        const cfg = r._voxelChunkConfig(0);
        const cx = Math.floor(probeX / cfg.span);
        const cz = Math.floor(probeZ / cfg.span);
        const ox = cx * cfg.span - cfg.step;
        const oz = cz * cfg.span - cfg.step;
        const oy = (r.state.terrainBaseHeight || 0) - cfg.floorDrop;
        const dimX = cfg.dim + 3;
        const dimZ = cfg.dim + 3;
        const dimYg = 40; // schmales Band reicht fuer den Beweis (schnell)
        const mainGrid = r._voxelSampleDensityGrid(ox, oy, oz, dimX, dimYg, dimZ, cfg.step, (x, y, z) =>
            r._terrainDensityAt(x, y, z)
        );
        let workerGrid = null;
        try {
            workerGrid = await r._voxelWorkerComputeDensity(ox, oy, oz, dimX, dimYg, dimZ, cfg.step);
        } catch (e) {
            out.workerErr = String(e && e.message);
        }
        if (workerGrid) {
            let mism = 0;
            for (let i = 0; i < mainGrid.length; i++) if (mainGrid[i] !== workerGrid[i]) mism++;
            out.workerMismatch = mism;
            out.gridLen = mainGrid.length;
        }
        out.probe = [Math.round(probeX), Math.round(probeZ)];
        return out;
    });
    console.log(JSON.stringify(out, null, 1));
    console.log("PAGE-ERRORS:", errs.length ? errs.slice(0, 4).join(" | ") : "keine");
    const ok =
        out.tileExists &&
        out.tileRivers + out.tileLakes > 0 &&
        out.lakeRiverPtsBeyond > 0 &&
        out.homeIdentical &&
        out.tileDeterministic &&
        out.workerMismatch === 0 &&
        errs.length === 0;
    console.log(ok ? "FERNE-SEEN-DIAG: GRÜN" : "FERNE-SEEN-DIAG: ROT");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

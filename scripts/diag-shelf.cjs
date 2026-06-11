// V18.125 — A4-SCHELF-KONSOLIDIERUNG, die Mess-Sonde. Die V18.117-Restklasse:
// Punkt-Probe-Löcher mit atlasL=-Inf bei terr bis -24 (klar unter dem Meeres-
// spiegel), alle nahe der Region-Kante. Hypothese: die `_hydroMarkOcean`-
// Komponente ist REGION-BLIND — die Senke verbindet sich erst JENSEITS der
// ±1024-Kante mit dem globalen H3-Ozean; in der Region trennt ein Atlas-Grat
// (16-m-surf über dem Spiegel) sie vom Rand-Seed → waterKind=0 → kein Wasser.
// DUMPT: die ASCII-Atlas-Karte (waterKind + surf−waterLevel) um die Loch-Zone
// + zählt die Klasse regionweit (unter-Spiegel-Zellen ohne waterKind).
//   node scripts/diag-shelf.cjs
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
                const h = r.state && r.state.hydrosphere;
                if (h && h.ready) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const h = s.hydrosphere;
        const dim = h.dim;
        const wK = h.water.waterKind;
        const wL = s.waterLevel || 0;
        const lines = [];
        lines.push(`waterLevel=${wL.toFixed(2)}  Atlas dim=${dim} cell=${h.cell} origin=(${h.originX},${h.originZ})`);

        // (1) die KLASSE regionweit zählen: Atlas-Zellen, deren MAKRO-Terrain
        // (Zell-Mitte) unter dem Spiegel liegt, aber waterKind=0 — und davon,
        // wie viele per 2D-Flood ÜBER unter-Spiegel-Zellen (beliebiger Kind)
        // mit der Region-Kante verbunden wären (= die region-blinde Ozean-Klasse).
        const n = dim * dim;
        const subSea = new Uint8Array(n); // Makro-Terrain unter Spiegel
        let cntSub = 0,
            cntSubNoKind = 0;
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                const x = h.originX + (i + 0.5) * h.cell;
                const z = h.originZ + (j + 0.5) * h.cell;
                const t = r._terrainMacroSurfaceY(x, z);
                const idx = i + j * dim;
                if (t <= wL) {
                    subSea[idx] = 1;
                    cntSub++;
                    if (wK[idx] === 0) cntSubNoKind++;
                }
            }
        }
        // Flood von der Kante über subSea-Zellen (8er) — wie _hydroMarkOcean,
        // aber auf dem ECHTEN Makro-Terrain (nicht dem geblurrten Atlas-surf).
        const reach = new Uint8Array(n);
        const stack = [];
        for (let j = 0; j < dim; j++) {
            for (let i = 0; i < dim; i++) {
                if (i !== 0 && j !== 0 && i !== dim - 1 && j !== dim - 1) continue;
                const idx = i + j * dim;
                if (subSea[idx] && !reach[idx]) {
                    reach[idx] = 1;
                    stack.push(idx);
                }
            }
        }
        while (stack.length) {
            const c = stack.pop();
            const ci = c % dim;
            const cj = (c / dim) | 0;
            for (let dj = -1; dj <= 1; dj++)
                for (let di = -1; di <= 1; di++) {
                    if (!di && !dj) continue;
                    const ni = ci + di;
                    const nj = cj + dj;
                    if (ni < 0 || nj < 0 || ni >= dim || nj >= dim) continue;
                    const nidx = ni + nj * dim;
                    if (subSea[nidx] && !reach[nidx]) {
                        reach[nidx] = 1;
                        stack.push(nidx);
                    }
                }
        }
        let cntGapReach = 0,
            cntGapIsolated = 0;
        for (let idx = 0; idx < n; idx++) {
            if (subSea[idx] && wK[idx] === 0) {
                if (reach[idx]) cntGapReach++;
                else cntGapIsolated++;
            }
        }
        lines.push(
            `Unter-Spiegel-Zellen (Makro): ${cntSub}  davon waterKind=0 (LÜCKE): ${cntSubNoKind}` +
                `  → kanten-verbunden (region-blinder Ozean): ${cntGapReach}  isoliert (Death-Valley): ${cntGapIsolated}`
        );

        // (2) die ASCII-Karte der Loch-Zone (um (-192..-64, -1024..-880)):
        // Zeichen: '~'=Ozean(1) 'o'=See(2) '.'=Land über Spiegel
        // '!'=LÜCKE (unter Spiegel, kind=0, kanten-verbunden) 'x'=isoliert unter Spiegel
        const i0 = Math.floor((-260 - h.originX) / h.cell);
        const i1 = Math.floor((-40 - h.originX) / h.cell);
        const j1 = Math.floor((-860 - h.originZ) / h.cell);
        lines.push(`Karte i=${i0}..${i1} j=0..${j1} ('!'=kanten-verbundene Lücke):`);
        for (let j = 0; j <= j1; j++) {
            let row = "";
            for (let i = i0; i <= i1; i++) {
                const idx = i + j * dim;
                const k = wK[idx];
                if (k === 1) row += "~";
                else if (k === 2) row += "o";
                else if (subSea[idx]) row += reach[idx] ? "!" : "x";
                else row += ".";
            }
            lines.push(`  j=${String(j).padStart(2)} ${row}`);
        }

        // (3) der Atlas-surf an drei Loch-Zellen vs das echte Makro (Blur-Drift?)
        const probes = [
            [-192, -1008],
            [-176, -1000],
            [-80, -896],
        ];
        for (const [x, z] of probes) {
            const ci = Math.floor((x - h.originX) / h.cell);
            const cj = Math.floor((z - h.originZ) / h.cell);
            const t = r._terrainMacroSurfaceY(x, z);
            const tReal = r._voxelSurfaceY(x, z);
            lines.push(
                `Probe (${x},${z}) cell(${ci},${cj}): macroTerr=${t.toFixed(1)} echtesTerr=${
                    tReal === null ? "—" : tReal.toFixed(1)
                } waterKind=${wK[ci + cj * dim]}`
            );
        }

        // (4) SPALTEN-AUTOPSIE der 5 Rest-Löcher: der frische Zellen-Build des
        // Chunks + die per-Spalte-Entscheidung (Zell-Mitte, topJ/topCy, colL aus
        // _atlasWaterLevelAt mit MAKRO-colSurf [wie der Build], _hydroRiverAt).
        const cfg = r._voxelChunkConfig(0);
        const { dim: cdim, step, span } = cfg;
        const base = s.terrainBaseHeight || 0;
        const floorDrop = cfg.floorDrop;
        const aquiferY = wL;
        for (const [px, pz] of [
            [-216, -984],
            [-144, -968],
            [-80, -904],
        ]) {
            const ccx = Math.floor(px / span);
            const ccz = Math.floor(pz / span);
            const ox = ccx * span;
            const oz = ccz * span;
            const oy = base - floorDrop;
            const ci = Math.min(cdim - 1, Math.max(0, Math.floor((px - ox) / step)));
            const ck = Math.min(cdim - 1, Math.max(0, Math.floor((pz - oz) / step)));
            const cxw = ox + (ci + 0.5) * step;
            const czw = oz + (ck + 0.5) * step;
            const macro = r._terrainMacroSurfaceY(cxw, czw);
            const real = r._voxelSurfaceY(cxw, czw);
            const atlasL = r._atlasWaterLevelAt(cxw, czw, macro);
            const atlasSrc = r._atlasWaterLevelAt(cxw, czw, Infinity);
            const riv = r._hydroRiverAt(cxw, czw);
            // frischer Build des Chunks → die Spalte auslesen
            const cells = r._buildVoxelChunkWaterCells(ox, oy, oz, step, null, 0);
            const dimSq = cdim * cdim;
            const ST = { AIR: 0, WATER: 1, SOLID: 2 };
            const band = s.hydroBand;
            const jMax = Math.min(
                Math.floor(((band ? band.top : wL + 10) - oy) / step),
                Math.floor(cells.length / dimSq) - 1
            );
            let colStates = [];
            let topJ = -1;
            for (let j = jMax; j >= 0; j--) {
                const c = cells[ci + ck * cdim + j * dimSq];
                if (topJ < 0 && c === ST.SOLID) topJ = j;
                if (j > jMax - 14) colStates.push(c === ST.SOLID ? "S" : c === ST.WATER ? "W" : ".");
            }
            const topCy = topJ >= 0 ? oy + (topJ + 0.5) * step : NaN;
            lines.push(
                `Autopsie (${px},${pz}) → Zellmitte(${cxw.toFixed(1)},${czw.toFixed(1)}): macro=${macro.toFixed(
                    1
                )} real=${real === null ? "—" : real.toFixed(1)} atlasL(macro)=${
                    atlasL === -Infinity ? "-Inf" : atlasL.toFixed(1)
                } src=${atlasSrc === -Infinity ? "0" : "1:" + atlasSrc.toFixed(1)} river=${
                    riv ? riv.surfaceY.toFixed(1) : "—"
                } topJ=${topJ} topCy=${Number.isFinite(topCy) ? topCy.toFixed(1) : "—"} (Schwelle ${(
                    aquiferY - 1.0
                ).toFixed(1)}) BandOben→: ${colStates.join("")}`
            );
        }
        return lines.join("\n");
    });
    console.log(out);
    await browser.close();
    server.close();
})();

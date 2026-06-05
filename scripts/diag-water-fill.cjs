// Diagnose W3+W4 (Wasser-finale-Form) — die ±1024-Grenze + „Seen füllen sich
// nicht" MESSEN, BEVOR gebaut wird (Disziplin: keine Nicht-Bugs fixen).
//   W3: ist der Wasserspiegel an der ±1024-Atlas-Grenze STETIG? (in-region
//       Atlas-`wY` vs. beyond `state.waterLevel`). Eine Stufe = echter Bug.
//   W4: füllen sich Seen? Anteil der Atlas-See-Zellen (kind 2), deren Voxel-
//       Spalte WATER bis ~Seespiegel trägt. Wenig = „füllen sich nicht".
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4343;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const o = { waterLevel: s.waterLevel, notes: [] };
        const h = s.hydrosphere;
        // ---- W3: ±1024-Grenze, Spiegel-Stetigkeit ----
        if (h && h.ready && h.water) {
            const wK = h.water.waterKind, wY = h.water.waterY, dim = h.dim, cell = h.cell;
            // Ozean-Zellen (kind 1): ihr Atlas-wY vs. state.waterLevel
            let oceanN = 0, oceanWyMin = Infinity, oceanWyMax = -Infinity;
            for (let i = 0; i < wK.length; i++) {
                if (wK[i] === 1) { oceanN++; const y = wY[i]; if (y < oceanWyMin) oceanWyMin = y; if (y > oceanWyMax) oceanWyMax = y; }
            }
            o.oceanCells = oceanN;
            o.oceanWyMin = oceanN ? +oceanWyMin.toFixed(3) : null;
            o.oceanWyMax = oceanN ? +oceanWyMax.toFixed(3) : null;
            // _atlasWaterLevelAt knapp innen (-1020) vs. knapp außen (-1030) der x=-1024-Grenze,
            // an mehreren z, terrainTopY=-Infinity (kein Rim-Gate) → der reine Ozean-Default.
            const inX = h.originX + 4, outX = h.originX - 6; // originX = -1024
            let maxStep = 0, samples = 0;
            for (let z = h.originZ + 200; z < h.originZ + 1848; z += 256) {
                const li = r._atlasWaterLevelAt(inX, z, -Infinity);
                const lo = r._atlasWaterLevelAt(outX, z, -Infinity);
                if (isFinite(li) && isFinite(lo)) { maxStep = Math.max(maxStep, Math.abs(li - lo)); samples++; }
            }
            o.boundaryMaxStep = +maxStep.toFixed(3);
            o.boundarySamples = samples;
        }
        // ---- W4: füllen sich Seen? ----
        // Atlas-See-Zellen (kind 2) mit Spiegel klar über globalem waterLevel.
        // Für jede gestreamte Voxel-Spalte im See-Footprint: trägt sie WATER bis ~Spiegel?
        if (h && h.ready && h.water) {
            const wK = h.water.waterKind, wY = h.water.waterY, dim = h.dim, cell = h.cell;
            const cfg = r._voxelChunkConfig(0);
            const base = s.terrainBaseHeight || 0;
            const ooy = base - cfg.floorDrop;
            let lakeCols = 0, lakeColsFilled = 0;
            // pro See-Atlas-Zelle die Welt-Mitte → die Voxel-Spalte prüfen
            for (let cj = 0; cj < dim; cj += 1) {
                for (let ci = 0; ci < dim; ci += 1) {
                    if (wK[ci + cj * dim] !== 2) continue;
                    const lvl = wY[ci + cj * dim];
                    if (lvl <= s.waterLevel + 0.5) continue; // nur klare Bergseen
                    const wx = h.originX + (ci + 0.5) * cell;
                    const wz = h.originZ + (cj + 0.5) * cell;
                    const ccx = Math.floor((wx + 150) / cfg.span);
                    const ccz = Math.floor((wz + 150) / cfg.span);
                    const entry = s.voxelChunks.get(`${ccx},${ccz}`);
                    if (!entry || !entry.waterCells) continue; // nicht gestreamt → überspringen
                    lakeCols++;
                    // lokale Zelle (i,k) im Chunk
                    const ox = ccx * cfg.span, oz = ccz * cfg.span;
                    const li = Math.floor((wx - ox) / cfg.step);
                    const lk = Math.floor((wz - oz) / cfg.step);
                    if (li < 0 || lk < 0 || li >= cfg.dim || lk >= cfg.dim) continue;
                    // gibt es eine WATER-Zelle in dieser Spalte nahe dem Seespiegel?
                    let filled = false;
                    for (let j = 0; j < cfg.dimY; j++) {
                        const cy = ooy + (j + 0.5) * cfg.step;
                        if (cy > lvl + 1 || cy < lvl - 8) continue; // Band um den Spiegel
                        if (entry.waterCells[li + lk * cfg.dim + j * cfg.dim * cfg.dim] === STATE.WATER) { filled = true; break; }
                    }
                    if (filled) lakeColsFilled++;
                }
            }
            o.lakeColsChecked = lakeCols;
            o.lakeColsFilled = lakeColsFilled;
            o.lakeFillPct = lakeCols ? +((100 * lakeColsFilled) / lakeCols).toFixed(1) : null;
        }
        return o;
    });

    console.log("\n=== W3 — die ±1024-Grenze (Spiegel-Stetigkeit) ===");
    console.log(`state.waterLevel: ${out.waterLevel}`);
    console.log(`Ozean-Atlas-Zellen (kind 1): ${out.oceanCells}, wY-Spanne: [${out.oceanWyMin} .. ${out.oceanWyMax}]`);
    console.log(`_atlasWaterLevelAt knapp innen(-1020) vs. außen(-1030), max |Δ| über ${out.boundarySamples} z-Proben: ${out.boundaryMaxStep} m`);
    const w3step = out.boundaryMaxStep > 0.5 || (out.oceanCells > 0 && Math.abs(out.oceanWyMax - out.waterLevel) > 0.5);
    console.log(`W3-Urteil: ${w3step ? "STUFE an der Grenze → echter Bug, bauen" : "STETIG (Ozean-wY == waterLevel) → kein W3-Bug"}`);

    console.log("\n=== W4 — füllen sich Seen? ===");
    console.log(`Bergsee-Spalten geprüft (gestreamt): ${out.lakeColsChecked}, davon mit WATER am Spiegel: ${out.lakeColsFilled}  → ${out.lakeFillPct}%`);
    let w4verdict;
    if (out.lakeColsChecked === 0) w4verdict = "kein Bergsee im gestreamten Ring → headless nicht messbar (Browser)";
    else if (out.lakeFillPct >= 90) w4verdict = "Zellen FUELLEN korrekt -> fuellt-sich-nicht ist RENDER (W1/W2 + Browser), kein Zell-Bug";
    else w4verdict = "Zellen füllen NICHT → echter Bug an der Klassifikation/Flood, bauen";
    console.log(`W4-Urteil: ${w4verdict}`);

    await browser.close();
    server.close();
})();

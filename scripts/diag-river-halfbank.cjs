// Fischer-Sonde: der Schöpfer-Befund — ein Fluss ein paar Zellen neben der Chunknaht;
// eine Seite (ein Ufer) rendert, der Nachbar-Chunk „meint, er braucht kein Wasser" →
// die andere Seite fehlt, der Fluss läuft halb auf einem Feld. MISST pro Chunk: das
// GATE (`_voxelChunkHasAnyWater`), die FLUSS-Präsenz (`_hydroRiverAt` an einem 8×8-
// Footprint-Raster), die MESH-Präsenz (Wasser-Surface mit Vertices). Pinnt die Wurzel:
//   (A) riverInChunk && !gate     → das Gate VERFEHLT den Fluss (kein Wasser gebaut)
//   (B) riverInChunk && gate && !hasMesh → das Gate ja, aber das Mesh leer
//   (C) ASYMMETRIE — der Fluss kreuzt eine Chunkgrenze, eine Seite hat Mesh-Vertices
//       nahe der Grenze, die andere nicht (das halbe Ufer).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4370;
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
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 200; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} }
            await new Promise((res) => setTimeout(res, 2));
        }
        const r = window.anazhRealm;
        if (r && typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        if (r && typeof r._drainPendingWaterIso === "function") r._drainPendingWaterIso();
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const span = r._voxelChunkConfig(0).span;
        const chunks = new Map(); // key → {cx,cz,gate,river,mesh,riverCells}
        for (const [key, e] of s.voxelChunks) {
            if (!e || e.empty) continue;
            const [cx, cz] = key.split(",").map(Number);
            const ox = cx * span, oz = cz * span;
            const gate = r._voxelChunkHasAnyWater(cx, cz);
            // Fluss-Präsenz: 10×10-Raster, zähle Punkte mit _hydroRiverAt != null
            let riverCells = 0;
            for (let gj = 0; gj < 10; gj++) for (let gi = 0; gi < 10; gi++) {
                const x = ox + ((gi + 0.5) / 10) * span, z = oz + ((gj + 0.5) / 10) * span;
                if (r._hydroRiverAt(x, z)) riverCells++;
            }
            const m = s.voxelChunkWaterIso && s.voxelChunkWaterIso.get(key);
            const mesh = !!(m && m.geometry && m.geometry.attributes.position && m.geometry.attributes.position.count > 0);
            chunks.set(key, { cx, cz, gate, river: riverCells > 0, riverCells, mesh });
        }
        // (A)/(B): river present aber kein Gate / kein Mesh
        const gateMiss = [], meshMiss = [];
        for (const [, c] of chunks) {
            if (c.river && !c.gate) gateMiss.push(`${c.cx},${c.cz}(rc${c.riverCells})`);
            if (c.river && c.gate && !c.mesh) meshMiss.push(`${c.cx},${c.cz}(rc${c.riverCells})`);
        }
        // (C) ASYMMETRIE: ein Chunk MIT Fluss+Mesh, dessen Achs-Nachbar Fluss hat aber KEIN Mesh
        const asym = [];
        for (const [, c] of chunks) {
            if (!c.river || !c.mesh) continue;
            for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                const nb = chunks.get(`${c.cx+dx},${c.cz+dz}`);
                if (nb && nb.river && !nb.mesh) asym.push(`${c.cx},${c.cz}[mesh] ↔ ${nb.cx},${nb.cz}[KEIN mesh, rc${nb.riverCells}, gate=${nb.gate}]`);
            }
        }
        let nRiver = 0, nRiverMesh = 0, nRiverGate = 0;
        for (const [, c] of chunks) { if (c.river) { nRiver++; if (c.mesh) nRiverMesh++; if (c.gate) nRiverGate++; } }
        return { total: chunks.size, nRiver, nRiverGate, nRiverMesh, gateMiss, meshMiss, asym };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== Halber-Fluss-Befund — Gate vs Fluss-Präsenz vs Mesh (Chunknaht) ===\n");
    console.log(`Chunks: ${out.total}  ·  mit Fluss (im Footprint): ${out.nRiver}  ·  davon Gate=true: ${out.nRiverGate}  ·  davon Mesh: ${out.nRiverMesh}\n`);
    console.log(`(A) Fluss-im-Chunk ABER Gate=false (das Gate verfehlt den Fluss): ${out.gateMiss.length}`);
    if (out.gateMiss.length) console.log(`    ${out.gateMiss.slice(0, 12).join("  ")}`);
    console.log(`(B) Fluss + Gate ABER KEIN Mesh (Gate ja, Mesh leer): ${out.meshMiss.length}`);
    if (out.meshMiss.length) console.log(`    ${out.meshMiss.slice(0, 12).join("  ")}`);
    console.log(`(C) ASYMMETRIE (Fluss kreuzt Naht, eine Seite Mesh, Nachbar KEIN Mesh trotz Fluss): ${out.asym.length}`);
    if (out.asym.length) for (const a of out.asym.slice(0, 10)) console.log(`    ${a}`);
    console.log(`\nDEUTUNG: (A)>0 → das Gate (_voxelChunkHasAnyWater) ist die Wurzel (Marge fehlt). (B)>0 → das`);
    console.log(`Surface-Mesh baut nicht trotz Gate. (C)>0 → genau der „halbe Fluss" des Schöpfers (eine Seite fehlt).`);
    process.exit(0);
})();

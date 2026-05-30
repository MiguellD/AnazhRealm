// Diagnose V14.4-Chunkfehler: Decken-Marge an der ECHTEN Surface-Max (feines
// Grid, nicht 4000 Random-Samples) + an der Schöpfer-Position. Wurzel-Verdacht:
// die V14.1-V14.4-Berge ragen in Gebirgs-Regionen über die Voxel-Hülle → Löcher.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4351;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", () => {});
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready) break;
            await new Promise((res) => setTimeout(res, 200));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const base = s.terrainBaseHeight || 0;
        const ceiling = base - cfg.floorDrop + cfg.dimY * cfg.step;
        const floor = base - cfg.floorDrop;
        // feines Makro-Grid über ±1100 m, step 4 m
        let macroMax = -1e9, macroMaxAt = null, overCeil = 0, total = 0;
        const tops = [];
        for (let x = -1100; x <= 1100; x += 4) {
            for (let z = -1100; z <= 1100; z += 4) {
                const m = r._terrainMacroSurfaceY(x, z, true);
                total++;
                if (m > macroMax) { macroMax = m; macroMaxAt = { x, z }; }
                if (m > ceiling) { overCeil++; if (tops.length < 8) tops.push({ x, z, m: Math.round(m) }); }
            }
        }
        // echte Voxel-Surface (mit 3D-Roughness) an den höchsten Makro-Spots
        const voxelAtMax = r._voxelSurfaceY ? r._voxelSurfaceY(macroMaxAt.x, macroMaxAt.z) : null;
        // Schöpfer-Position
        const px = 811.1, pz = -115.5;
        const pm = r._terrainMacroSurfaceY(px, pz, true);
        const pv = r._voxelSurfaceY ? r._voxelSurfaceY(px, pz) : null;
        // Surface-Sprünge: Nachbar-Differenz auf 4-m-Grid an der höchsten Region
        let maxJump = 0;
        const cx = macroMaxAt.x, cz = macroMaxAt.z;
        for (let dx = -40; dx <= 40; dx += 4) {
            const a = r._terrainMacroSurfaceY(cx + dx, cz, true);
            const b = r._terrainMacroSurfaceY(cx + dx + 4, cz, true);
            if (Math.abs(a - b) > maxJump) maxJump = Math.abs(a - b);
        }
        return { base, floor, ceiling: Math.round(ceiling * 10) / 10, macroMax: Math.round(macroMax * 10) / 10, macroMaxAt, voxelAtMax: voxelAtMax !== null ? Math.round(voxelAtMax * 10) / 10 : null, overCeil, total, tops, pm: Math.round(pm * 10) / 10, pv: pv !== null ? Math.round(pv * 10) / 10 : null, maxJump: Math.round(maxJump * 10) / 10 };
    });
    console.log("\n=== DECKEN-MARGE @ ECHTE Surface-Max (feines 4-m-Grid, ±1100 m) ===\n");
    console.log(`  Voxel-Hülle:     Boden ${out.floor} m … Decke ${out.ceiling} m  (base ${out.base})`);
    console.log(`  Makro-Surface MAX: ${out.macroMax} m  @ (${out.macroMaxAt.x}, ${out.macroMaxAt.z})`);
    console.log(`  Voxel-Surface dort: ${out.voxelAtMax} m  (mit 3D-Roughness — DAS muss unter die Decke)`);
    console.log(`  >>> Decken-Marge: ${Math.round((out.ceiling - out.macroMax) * 10) / 10} m  ${out.macroMax > out.ceiling ? "❌ SURFACE RAGT ÜBER DIE DECKE → LÖCHER!" : (out.ceiling - out.macroMax < 10 ? "⚠ knapp" : "✓")}`);
    console.log(`  Grid-Punkte über der Decke: ${out.overCeil} / ${out.total} (${(out.overCeil / out.total * 100).toFixed(2)} %)`);
    if (out.tops.length) console.log(`  Beispiel-Spots über Decke: ${out.tops.map((t) => `(${t.x},${t.z})=${t.m}m`).join(", ")}`);
    console.log(`\n  Schöpfer-Position (811, -115): Makro ${out.pm} m, Voxel ${out.pv} m`);
    console.log(`  Max Nachbar-Sprung (4 m) an der Gipfel-Region: ${out.maxJump} m`);
    await browser.close();
    server.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });

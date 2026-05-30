// Wie waechst die Decken-Verletzung mit der Distanz? cont0 hat λ~7100 m → ein
// Sample-Fenster < 7100 m unterschaetzt den Surface-Max systematisch. Bin nach
// Radius: Anteil (macro+roughness) ueber Decke + globaler Max bis ±5000 m.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4354;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json" };
const server = http.createServer((req, res) => { let p = req.url.split("?")[0]; if (p === "/") p = "/index.html"; const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); } fs.readFile(fp, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(d); }); });
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", () => {});
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => { const t = performance.now(); while (performance.now() - t < 25000) { const r = window.anazhRealm; if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready) break; await new Promise((x) => setTimeout(x, 200)); } });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const base = s.terrainBaseHeight || 0;
        const ceiling = base - cfg.floorDrop + cfg.dimY * cfg.step;
        const floor = base - cfg.floorDrop;
        const ROUGH = 12;
        const bins = {}; // radius-bin (500m) -> {n, over, under, max, min}
        let gMax = -1e9, gMaxAt = null, gMin = 1e9, gMinAt = null;
        for (let x = -5000; x <= 5000; x += 16) {
            for (let z = -5000; z <= 5000; z += 16) {
                const rad = Math.hypot(x, z);
                if (rad > 5000) continue;
                const m = r._terrainMacroSurfaceY(x, z, true);
                const b = Math.floor(rad / 500) * 500;
                if (!bins[b]) bins[b] = { n: 0, over: 0, under: 0, max: -1e9, min: 1e9 };
                bins[b].n++;
                if (m > bins[b].max) bins[b].max = m;
                if (m < bins[b].min) bins[b].min = m;
                if (m + ROUGH > ceiling) bins[b].over++;
                if (m - ROUGH < floor) bins[b].under++;
                if (m > gMax) { gMax = m; gMaxAt = { x, z }; }
                if (m < gMin) { gMin = m; gMinAt = { x, z }; }
            }
        }
        return { ceiling: Math.round(ceiling * 10) / 10, floor, gMax: Math.round(gMax * 10) / 10, gMaxAt, gMin: Math.round(gMin * 10) / 10, gMinAt, bins };
    });
    console.log("\n=== HUELLEN-VERLETZUNG vs DISTANZ (Boden " + out.floor + " … Decke " + out.ceiling + " m, roughness ±12) ===\n");
    console.log("  Radius-Bin |  Samples | Srf-Min | Srf-Max | (m+12)>Decke | (m-12)<Boden");
    console.log("  -----------+----------+---------+---------+--------------+-------------");
    for (const k of Object.keys(out.bins).map(Number).sort((a, b) => a - b)) {
        const b = out.bins[k];
        const op = (b.over / b.n * 100).toFixed(1), up = (b.under / b.n * 100).toFixed(1);
        const of = b.over > 0 ? "❌ " + op + "%" : "✓";
        const uf = b.under > 0 ? "❌ " + up + "%" : "✓";
        console.log(`  ${String(k).padStart(5)} m   | ${String(b.n).padStart(7)} | ${String(Math.round(b.min)).padStart(6)}m | ${String(Math.round(b.max)).padStart(6)}m | ${of.padStart(12)} | ${uf.padStart(11)}`);
    }
    console.log(`\n  >>> GLOBALER Surface-Max bis ±5 km: ${out.gMax} m @ (${out.gMaxAt.x},${out.gMaxAt.z}) → +rough ${Math.round(out.gMax + 12)} m vs Decke ${out.ceiling}`);
    console.log(`  >>> GLOBALER Surface-Min bis ±5 km: ${out.gMin} m @ (${out.gMinAt.x},${out.gMinAt.z}) → -rough ${Math.round(out.gMin - 12)} m vs Boden ${out.floor}`);
    await browser.close();
    server.close();
})().catch((e) => { console.error("FAIL", e.message); process.exit(1); });

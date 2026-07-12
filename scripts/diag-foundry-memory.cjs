// V4(B)-GATE — DER FOUNDRY-GEOMETRIE-SPEICHER IST FLACH (Null-Renderer, foundry-ON, JS-Bilanz-Zähler):
// beweist, dass die geteilte Foundry-Baum-Geometrie über viele Saison-Flips NICHT linear leckt — die LRU
// räumt + `_disposeFoundryGroupGeom` gibt frei, sobald kein InstancedMesh sie mehr hält (Ref-Zähler == 0).
// Zwei Wände: (1) live = built-disposed wächst NICHT linear mit der Flip-Zahl (flach ab Zyklus 2);
// (2) REF-GUARD: keine Geometrie wird disposed, solange _liveRefs > 0 (kein Use-after-free).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4515;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 240000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0; if (sz >= 25) break; }
            await sleep(6);
        }
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const t0 = performance.now(); while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        // dichten Wald streamen.
        for (let it = 0; it < 300; it++) { r.state._frameOverBudget = false; try { r._gameLoopTick && r._gameLoopTick(performance.now()); const pp = r.state.playerMesh && r.state.playerMesh.position; if (pp && r._tickScatterStreaming) r._tickScatterStreaming(pp); } catch (_e) {} await sleep(6); }
        // REF-GUARD-Instrument: bei JEDEM _disposeFoundryGroupGeom die _liveRefs prüfen.
        let maxRefsAtDispose = 0, disposeCalls = 0, hasMethod = typeof r._disposeFoundryGroupGeom === "function";
        if (hasMethod) {
            const orig = r._disposeFoundryGroupGeom.bind(r);
            r._disposeFoundryGroupGeom = function (g) { disposeCalls++; const refs = (g && g._liveRefs) || 0; if (refs > maxRefsAtDispose) maxRefsAtDispose = refs; return orig(g); };
        }
        const snap = () => ({ built: (f._geomBuiltCount || 0), disposed: (f._geomDisposedCount || 0), cache: f.cache ? f.cache.size : 0 });
        const seasons = ["summer", "autumn", "winter", "spring"];
        const cycles = [];
        for (let c = 0; c < 4; c++) {
            for (const s of seasons) {
                r.state.season = s;
                if (r._foundrySeasonChanged) r._foundrySeasonChanged();
                // konvergieren: pumpen bis die Flip-Queue leer + ein paar Extra-Frames für Bakes.
                for (let it = 0; it < 80; it++) { r.state._frameOverBudget = false; try { r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_e) {} if (!r._seasonFlipQueue && it > 30) break; await sleep(4); }
            }
            cycles.push(snap());
        }
        return { hasMethod, maxRefsAtDispose, disposeCalls, cycles, capacity: (r.constructor.FOUNDRY_CACHE_CAP || 256) };
    });
    await browser.close(); server.close();

    console.log("=== V4(B) — FOUNDRY-GEOMETRIE-SPEICHER FLACH ÜBER 4 SAISON-ZYKLEN (16 Flips) ===");
    if (!out.hasMethod) { console.log("❌ `_disposeFoundryGroupGeom` fehlt — V4(B) nicht implementiert."); process.exit(1); }
    out.cycles.forEach((c, i) => console.log(`  Zyklus ${i + 1}: built=${c.built} disposed=${c.disposed} live=${c.built - c.disposed} cache=${c.cache}`));
    console.log(`  Dispose-Aufrufe: ${out.disposeCalls} · MAX _liveRefs bei Dispose: ${out.maxRefsAtDispose} (muss 0 = kein Use-after-free)`);
    const live = out.cycles.map((c) => c.built - c.disposed);
    const growth = live[3] - live[1]; // Zyklus 4 vs Zyklus 2
    console.log(`  live-Wachstum Zyklus 2 -> 4: ${growth} (muss klein/bounded sein, NICHT linear mit Flips)`);
    const fails = [];
    if (out.cycles[3].disposed <= 0) fails.push("kein Dispose gefeuert (der LRU räumt nicht / Cap nicht überschritten — die Geom wird nie frei)");
    if (out.maxRefsAtDispose > 0) fails.push(`Dispose mit _liveRefs=${out.maxRefsAtDispose} > 0 (USE-AFTER-FREE-Risiko: eine noch gehaltene Geometrie wurde freigegeben)`);
    // "flach": das live-Wachstum Zyklus2->4 muss deutlich unter dem built-Zuwachs bleiben (sub-linear).
    const builtGrowth = out.cycles[3].built - out.cycles[1].built;
    if (builtGrowth > 0 && growth > builtGrowth * 0.5) fails.push(`live wuchs ${growth} bei ${builtGrowth} neuen Bakes (>50% = quasi-linear = das Leck lebt)`);
    if (growth > out.capacity * 8) fails.push(`live-Wachstum ${growth} > ${out.capacity * 8} (unbounded)`);

    if (fails.length) { console.log(`\n❌ V4(B)-Gate ROT:\n  - ${fails.join("\n  - ")}`); process.exit(1); }
    console.log(`\n✅ V4(B)-Gate GRÜN — die Foundry-Geometrie wird freigegeben (${out.cycles[3].disposed} disposed), der Speicher ist flach (live-Wachstum ${growth} bei ${builtGrowth} Bakes), kein Dispose mit lebenden Refs.`);
})();

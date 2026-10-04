// V4(B)-GATE — DER FOUNDRY-GEOMETRIE-SPEICHER IST FLACH (Null-Renderer, foundry-ON, JS-Bilanz-Zähler):
// beweist, dass die geteilte Foundry-Geometrie unter LRU-Churn NICHT linear leckt — die LRU räumt +
// `_disposeFoundryGroupGeom` gibt frei, sobald kein InstancedMesh sie mehr hält (Ref-Zähler == 0).
// Der Churn-Treiber war bis V18.527 der Saison-Flip (die Saison stand im Schlüssel, jeder Wechsel baute neu);
// seit die Saison eine Farbe ist, treibt die Linse den Churn selbst: ein kleiner Cache-Deckel und vier Zyklen
// über alle '*'-Gestalten der Fels-/Blumen-Arten (16 je Art) — jeder Zyklus räumt und baut neu.
// Zwei Wände: (1) live = built-disposed wächst NICHT linear mit den Zyklen (flach ab Zyklus 2);
// (2) REF-GUARD: keine Geometrie wird disposed, solange _liveRefs > 0 (kein Use-after-free).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.FOUNDRY_MEMORY_PORT || 4515);
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
        // DER CHURN: Cache-Deckel auf 32 (die Welt hält gerade weit mehr) und je Zyklus alle 16 Gestalten von sechs
        // '*'-Arten flach anfordern (96 Schlüssel, Stufe 0) — die LRU muss räumen, jeder Zyklus baut die geräumten neu.
        const CAP0 = r.constructor.FOUNDRY_CACHE_CAP;
        r.constructor.FOUNDRY_CACHE_CAP = 32;
        // Der Anstoß: der Vorrat hat alle Gestalten schon warm (kein Neubau, keine Räumung) — EINE Räumung über die EINE
        // Naht, dann baut die erste Ankunft neu und der Deckel räumt die LRU auf 32 (der Churn läuft ab Zyklus 1).
        r._foundryCacheEvict(r._foundryKoerperKey("findling", 1, 0));
        const arten = ["findling", "basalt", "sediment", "zacken", "kristalle", "blume"];
        const cycles = [];
        for (let c = 0; c < 4; c++) {
            for (const sp of arten) {
                const V = r._foundryGestalten(sp);
                const getroffen = new Set();
                for (let s = 0; getroffen.size < V && s < 4000; s++) {
                    const g = r._foundryVariantFor(s, sp);
                    if (getroffen.has(g)) continue;
                    getroffen.add(g);
                    r._foundryFlattenFor({ seed: s, position: { x: 0, y: 0, z: 0 } }, sp, 0);
                }
            }
            for (let it = 0; it < 400; it++) { r.state._frameOverBudget = false; try { r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_e) {} if (f.pending.size === 0 && !(f.warte && f.warte.length) && it > 30) break; await sleep(6); }
            cycles.push(snap());
        }
        r.constructor.FOUNDRY_CACHE_CAP = CAP0;
        return { hasMethod, maxRefsAtDispose, disposeCalls, cycles, capacity: 32 };
    });
    await browser.close(); server.close();

    console.log("=== V4(B) — FOUNDRY-GEOMETRIE-SPEICHER FLACH ÜBER 4 LRU-CHURN-ZYKLEN (Deckel 32, 96 Gestalten) ===");
    if (!out.hasMethod) { console.log("❌ `_disposeFoundryGroupGeom` fehlt — V4(B) nicht implementiert."); process.exit(1); }
    out.cycles.forEach((c, i) => console.log(`  Zyklus ${i + 1}: built=${c.built} disposed=${c.disposed} live=${c.built - c.disposed} cache=${c.cache}`));
    console.log(`  Dispose-Aufrufe: ${out.disposeCalls} · MAX _liveRefs bei Dispose: ${out.maxRefsAtDispose} (muss 0 = kein Use-after-free)`);
    const live = out.cycles.map((c) => c.built - c.disposed);
    const growth = live[3] - live[1]; // Zyklus 4 vs Zyklus 2
    console.log(`  live-Wachstum Zyklus 2 -> 4: ${growth} (muss klein/bounded sein, NICHT linear mit den Zyklen)`);
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

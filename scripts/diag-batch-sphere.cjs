// V18.358-Diagnose: CULL IM BLICKFELD. Hypothese: der BatchedMesh-Region-Pfad (default-an)
// invalidiert seine mesh-level Bounding-Sphere NICHT nach dem Hinzufügen von Instanzen (der
// InstancedMesh-Pfad tut es: `boundingSphere=null` nach jedem Add). Eine STALE Sphere (von
// einem früheren Streaming-Zustand) umschließt spät-gestreamte Instanzen NICHT → die mesh-
// level Frustum-Cull cullt die GANZE Region, wenn die stale Sphere das Frustum verlässt →
// sichtbare Bäume verschwinden beim Drehen. Test: am echten settled Batch die aktuelle Sphere
// mit der frisch berechneten vergleichen (Differenz = stale).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4415,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(d); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 360000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"] });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0; if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; } if (sz > 40 && stableFor > 80) break; }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 250; i++) { try { window.anazhRealm._gameLoopTick(performance.now()); } catch (_e) {} }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        if (!s.archBatches) return { error: "no archBatches (useBatchedArch off?)" };
        s.useBatchedArch = true;
        // ein instanceable Blueprint finden
        let bpName = null;
        for (const name of Object.keys(s.blueprints)) { const f = r._archFlattenBlueprint(name); if (f && f.instanceable) { bpName = name; break; } }
        if (!bpName) return { error: "kein instanceable Blueprint" };

        // KONTROLLIERTER ZWEI-WELLEN-TEST in einer fernen, sauberen Region (regKey "99,99").
        const RK = "99,99", cx = 99 * 256 + 20, cz = 99 * 256 + 20;
        // Welle 1: 3 geclusterte Instanzen
        for (let i = 0; i < 3; i++) r._scatterInstanceAdd(bpName, cx + i * 2, 0, cz + i * 2, 0, 1, null, RK);
        // den Test-Batch finden
        let mesh = null;
        for (const [bk, b] of s.archBatches) if (bk.indexOf("@99,99") >= 0) { mesh = b.mesh; break; }
        if (!mesh) return { error: "Test-Batch nicht gefunden" };
        // THREE's lazy Compute simulieren (was der echte Renderer beim ersten Frustum-Cull tut)
        mesh.computeBoundingSphere();
        const r1 = mesh.boundingSphere ? mesh.boundingSphere.radius : null;
        // Welle 2: eine Instanz 120 m WEIT weg (spät gestreamt) — DIESELBE Region
        r._scatterInstanceAdd(bpName, cx + 120, 0, cz + 120, 0, 1, null, RK);
        // DER TEST: hat der Add die gecachte Sphere invalidiert? (Fix → null; ohne Fix → stale r1)
        const invalidatedAfterAdd = mesh.boundingSphere === null;
        // recompute (was THREE beim nächsten Cull täte) → muss jetzt die ferne Instanz umschließen
        mesh.computeBoundingSphere();
        const r2 = mesh.boundingSphere ? mesh.boundingSphere.radius : null;

        // PLUS: der settled-Welt-Scan (Kontext)
        let nullCount = 0, total = 0;
        for (const [, batch] of s.archBatches) { if (batch.mesh) { total++; if (!batch.mesh.boundingSphere) nullCount++; } }

        return { bpName, r1, r2, invalidatedAfterAdd, total, nullCount };
    });

    console.log("\n===== CULL-IM-BLICKFELD — BATCHEDMESH-SPHERE-INVALIDIERUNG =====\n");
    let ok = true;
    const check = (c, m) => { console.log(`  ${c ? "✅" : "❌"} ${m}`); if (!c) ok = false; };
    if (out.error) { console.log("FEHLER:", out.error); ok = false; }
    else {
        console.log(`  Test-Blueprint '${out.bpName}' · Welle1-Radius r1=${out.r1 != null ? out.r1.toFixed(1) : null} m · nach 120-m-Welle2: r2=${out.r2 != null ? out.r2.toFixed(1) : null} m\n`);
        check(out.invalidatedAfterAdd === true, "(1) ein Add INVALIDIERT die gecachte Bounding-Sphere (boundingSphere=null → THREE rechnet sie neu)");
        check(out.r2 != null && out.r1 != null && out.r2 > out.r1 + 30, `(2) die neu berechnete Sphere UMSCHLIESST die ferne Instanz (r2 ${out.r2 != null ? out.r2.toFixed(0) : "?"} >> r1 ${out.r1 != null ? out.r1.toFixed(0) : "?"})`);
        console.log(`\n  ${ok ? "✅ FIX BEWIESEN: spät-gestreamte Bauten werden umschlossen → kein Cull im Blickfeld mehr" : "❌ FIX GREIFT NICHT"} (settled-Welt: ${out.nullCount}/${out.total} Batch-Sphären null = invalidiert)`);
    }
    console.log("\n============================================================\n");
    process.exitCode = ok ? 0 : 1;
    await browser.close(); server.close(); process.exit(0);
})();

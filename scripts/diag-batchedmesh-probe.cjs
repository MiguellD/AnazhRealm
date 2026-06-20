// FEASIBILITY-PROBE (temporär): rendert THREE.BatchedMesh auf unserem echten
// WebGPURenderer (swiftshader) mit einem echten Blatt-NodeMaterial + echter
// Geometrie. Beantwortet die EINE Frage, die den BatchedMesh-Foliage-Umbau
// trägt oder killt: läuft BatchedMesh auf WebGPU+NodeMaterial in r184 OHNE Crash
// + zeichnet es (count>0)? Headless kann den LOOK nicht prüfen, aber Crash/
// Konstruktion/Draw-Mechanik schon. Löschbar nach dem Befund.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4391;
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
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1024, height: 640 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => { const t = m.text(); if (/error|Error|fehl|crash/i.test(t)) pageErrors.push("[console] " + t.slice(0, 160)); });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Auf die echte Welt warten (echter Renderer, _gameLoopTick + ≥1 Bewuchs-Gruppe)
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.renderer && r.state.rendererReady) {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const groups = r.state.archInstanceGroups;
                if (groups && groups.size > 0) return;
            }
            await new Promise((res) => setTimeout(res, 100));
        }
    });

    const probe = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = { steps: [] };
        const THREE = window.THREE || (r && r.constructor && r.constructor.THREE);
        out.threeFound = !!THREE;
        out.batchedMeshType = THREE ? typeof THREE.BatchedMesh : "no-THREE";
        if (!THREE || typeof THREE.BatchedMesh !== "function") return out;
        try {
            // Echtes Blatt-Material + Geometrie aus einer lebenden Bewuchs-Gruppe
            const groups = [...r.state.archInstanceGroups.values()];
            out.groupCount = groups.length;
            const g0 = groups.find((g) => g.geom && g.mat) || groups[0];
            const geomA = g0.geom;
            const mat = g0.mat;
            out.geomVerts = geomA.attributes.position ? geomA.attributes.position.count : 0;
            out.geomIdx = geomA.index ? geomA.index.count : 0;
            // Zweite Geometrie (andere Gruppe) → der eigentliche Test: VERSCHIEDENE Geo in EINEM Batch
            const g1 = groups.find((g) => g.geom && g.geom !== geomA) || g0;
            const geomB = g1.geom;
            out.twoDistinctGeoms = geomB !== geomA;
            // BatchedMesh bauen: 2 Geometrien, 8 Instanzen
            const maxGeo = 2;
            const maxVerts = (out.geomVerts + (geomB.attributes.position ? geomB.attributes.position.count : 0)) + 16;
            const maxIdx = (out.geomIdx + (geomB.index ? geomB.index.count : 0)) + 48;
            const bm = new THREE.BatchedMesh(8, maxVerts, maxIdx, mat);
            out.steps.push("constructed");
            const idA = bm.addGeometry(geomA);
            const idB = bm.addGeometry(geomB);
            out.steps.push("addGeometry ok (" + idA + "," + idB + ")");
            const tmp = new THREE.Matrix4();
            for (let i = 0; i < 6; i++) {
                const inst = bm.addInstance(i % 2 === 0 ? idA : idB);
                tmp.makeTranslation((i - 3) * 4, 2, -8);
                bm.setMatrixAt(inst, tmp);
            }
            out.steps.push("addInstance ok, count=" + bm.instanceCount);
            out.hasPerInstanceCull = typeof bm.setVisibleAt === "function" && typeof bm.sortObjects !== "undefined";
            out.perObjectFrustumCulled = bm.perObjectFrustumCulled;
            bm.position.set(0, 0, -10);
            r.state.scene.add(bm);
            out.steps.push("added to scene");
            // EINE echte Frame rendern (swiftshader, langsam aber echt)
            if (typeof r.state.renderer.renderAsync === "function") {
                await r.state.renderer.renderAsync(r.state.scene, r.state.camera);
            } else {
                r.state.renderer.render(r.state.scene, r.state.camera);
            }
            out.steps.push("rendered one frame");
            out.rendered = true;
            r.state.scene.remove(bm);
            bm.dispose && bm.dispose();
        } catch (e) {
            out.error = (e && (e.stack || e.message) || String(e)).split("\n").slice(0, 3).join(" | ");
        }
        return out;
    });

    probe.pageErrors = pageErrors.slice(0, 8);
    console.log("\n===== BatchedMesh-WebGPU-FEASIBILITY =====\n");
    console.log(JSON.stringify(probe, null, 2));
    console.log("\n  VERDIKT:", probe.rendered && probe.pageErrors.length === 0
        ? "✅ BatchedMesh rendert auf WebGPU+NodeMaterial — der Umbau ist gangbar"
        : "❌ BatchedMesh NICHT gangbar auf unserem Stack — Fallback nötig");
    await browser.close();
    server.close();
})().catch((e) => { console.error("PROBE-CRASH:", e); process.exit(2); });

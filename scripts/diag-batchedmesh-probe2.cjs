// MIGRATIONS-FEASIBILITY-PROBE 2: testet die BatchedMesh-APIs, die der echte
// Bewuchs-Umbau braucht — mit ECHTER Bewuchs-Geometrie (aFlex/aPhase/color):
//   (1) überleben Custom-Vertex-Attribute den addGeometry-Merge?
//   (2) Wachstum: was passiert bei Überlauf von maxInstanceCount / maxVertex?
//       gibt es setGeometrySize / Wachstums-API?
//   (3) setColorAt (per-Instanz-Tint) + deleteInstance + getMatrixAt.
//   (4) render eine echte Frame (swiftshader-WebGPU).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4393;
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
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.renderer && r.state.rendererReady) {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state.player && r.state.player.position) r.state.player.position.x += 6;
                const groups = r.state.archInstanceGroups;
                if (groups && groups.size > 3) return;
            }
            await new Promise((res) => setTimeout(res, 80));
        }
    });
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const THREE = window.THREE;
        const o = { steps: [], attrs: {} };
        try {
            const groups = [...r.state.archInstanceGroups.values()].filter((g) => g.geom && g.mat);
            // Zwei Gruppen MIT GLEICHEM Material (für einen Batch) ODER irgendzwei
            const g0 = groups[0];
            const geomA = g0.geom, mat = g0.mat;
            const attrNames = Object.keys(geomA.attributes);
            o.attrs.source = attrNames;
            o.attrs.hasFlex = !!geomA.attributes.aFlex;
            o.attrs.hasPhase = !!geomA.attributes.aPhase;
            o.attrs.hasColor = !!geomA.attributes.color;
            const g1 = groups.find((g) => g.geom !== geomA) || g0;
            const geomB = g1.geom;
            // großzügig dimensioniert
            const vA = geomA.attributes.position.count, vB = geomB.attributes.position.count;
            const iA = geomA.index ? geomA.index.count : 0, iB = geomB.index ? geomB.index.count : 0;
            const bm = new THREE.BatchedMesh(16, vA + vB + 64, iA + iB + 192, mat);
            o.steps.push("constructed");
            const idA = bm.addGeometry(geomA);
            const idB = bm.addGeometry(geomB);
            o.steps.push(`addGeometry ${idA},${idB}`);
            // (1) Attribut-Überleben: trägt die BATCHED-Geometrie die Custom-Attrs?
            const bg = bm.geometry;
            o.attrs.batched = Object.keys(bg.attributes);
            o.attrs.batchedHasFlex = !!bg.attributes.aFlex;
            o.attrs.batchedHasPhase = !!bg.attributes.aPhase;
            o.attrs.batchedHasColor = !!bg.attributes.color;
            // (3) Instanzen + Tint
            const tmp = new THREE.Matrix4();
            const ids = [];
            for (let i = 0; i < 4; i++) {
                const inst = bm.addInstance(i % 2 ? idB : idA);
                ids.push(inst);
                tmp.makeTranslation((i - 2) * 3, 1, -6);
                bm.setMatrixAt(inst, tmp);
                if (typeof bm.setColorAt === "function") bm.setColorAt(inst, new THREE.Color(0.3 + i * 0.1, 0.6, 0.2));
            }
            o.steps.push(`addInstance x${ids.length}, setColorAt=${typeof bm.setColorAt === "function"}`);
            o.api = {
                setColorAt: typeof bm.setColorAt === "function",
                deleteInstance: typeof bm.deleteInstance === "function",
                deleteGeometry: typeof bm.deleteGeometry === "function",
                setGeometrySize: typeof bm.setGeometrySize === "function",
                setInstanceCount: typeof bm.setInstanceCount === "function",
                optimize: typeof bm.optimize === "function",
                maxInstanceCount: bm.maxInstanceCount,
                perObjectFrustumCulled: bm.perObjectFrustumCulled,
                instanceCount: bm.instanceCount,
            };
            // (3b) deleteInstance + Wiederverwendung
            if (typeof bm.deleteInstance === "function") {
                bm.deleteInstance(ids[1]);
                const reuse = bm.addInstance(idA);
                o.steps.push(`deleteInstance + reuse → id ${reuse}`);
            }
            // (2) Wachstum: maxInstanceCount überlaufen
            try {
                const small = new THREE.BatchedMesh(2, vA + 32, iA + 96, mat);
                small.addGeometry(geomA);
                small.addInstance(small.geometry ? 0 : 0);
                small.addInstance(0);
                let overflowErr = null;
                try { small.addInstance(0); } catch (e2) { overflowErr = (e2.message || "" + e2).slice(0, 80); }
                o.growth = { overflowThrows: !!overflowErr, overflowMsg: overflowErr, setInstanceCount: typeof small.setInstanceCount === "function", setGeometrySize: typeof small.setGeometrySize === "function" };
                if (typeof small.setInstanceCount === "function") { try { small.setInstanceCount(8); small.addInstance(0); o.growth.setInstanceCountWorks = true; } catch (e3) { o.growth.setInstanceCountWorks = false; o.growth.setInstanceCountErr = (e3.message || "").slice(0, 80); } }
                small.dispose && small.dispose();
            } catch (eg) { o.growth = { error: (eg.message || "" + eg).slice(0, 120) }; }
            // (4) render
            bm.position.set(0, 0, -8);
            r.state.scene.add(bm);
            if (typeof r.state.renderer.renderAsync === "function") await r.state.renderer.renderAsync(r.state.scene, r.state.camera);
            else r.state.renderer.render(r.state.scene, r.state.camera);
            o.steps.push("rendered");
            o.rendered = true;
            r.state.scene.remove(bm); bm.dispose && bm.dispose();
        } catch (e) {
            o.error = (e && (e.stack || e.message) || String(e)).split("\n").slice(0, 4).join(" | ");
        }
        return o;
    });
    out.pageErrors = pageErrors.slice(0, 8);
    console.log("\n===== BatchedMesh MIGRATIONS-PROBE =====\n");
    console.log(JSON.stringify(out, null, 2));
    await browser.close(); server.close();
})().catch((e) => { console.error("PROBE-CRASH:", e); process.exit(2); });

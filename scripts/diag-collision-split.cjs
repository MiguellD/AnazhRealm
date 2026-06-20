// MESS-PROBE: dominiert beim Kollisions-Bau der per-Dreieck-addTriangle-LOOP
// (→ btTriangleIndexVertexArray-Puffer-API lohnt) oder der btBvhTriangleMeshShape-
// KONSTRUKTOR (BVH-Baum-Bau, O(n log n) → nur weniger Dreiecke/kein BVH hilft)?
// Misst beide Phasen separat auf einer ECHTEN Voxel-Chunk-Geometrie (swiftshader
// nicht nötig — reine Ammo-CPU; null-Renderer reicht, Ammo läuft trotzdem).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4394;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => { let p = req.url.split("?")[0]; if (p === "/") p = "/index.html"; const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); } fs.readFile(fp, (e, d) => { if (e) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(d); }); });
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        const r0 = window.anazhRealm;
        if (r0 && r0.state) r0.state.voxelWorker = null;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size > 20) break; }
            await new Promise((res) => setTimeout(res, 30));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const Ammo = window.Ammo;
        const o = { samples: [] };
        if (!Ammo) { o.error = "kein Ammo"; return o; }
        // ein paar echte Chunk-Mesh-Geometrien greifen
        const meshes = [];
        for (const e of r.state.voxelChunks.values()) {
            if (e.mesh && e.mesh.geometry && e.mesh.geometry.index && e.mesh.geometry.attributes.position) meshes.push(e.mesh);
            if (meshes.length >= 5) break;
        }
        o.chunkCount = meshes.length;
        const sf = r.state.scaleFactor || 1;
        for (const mesh of meshes) {
            const geo = mesh.geometry;
            const verts = geo.attributes.position.array;
            const indices = geo.index.array;
            const tris = indices.length / 3;
            // PHASE 1: addTriangle-Loop (3 wiederverwendete btVector3, wie die Produktion)
            const tmesh = new Ammo.btTriangleMesh(true, true);
            const v0 = new Ammo.btVector3(0, 0, 0), v1 = new Ammo.btVector3(0, 0, 0), v2 = new Ammo.btVector3(0, 0, 0);
            const tLoop0 = performance.now();
            for (let i = 0; i + 2 < indices.length; i += 3) {
                const ai = indices[i] * 3, bi = indices[i + 1] * 3, ci = indices[i + 2] * 3;
                v0.setValue(verts[ai] / sf, verts[ai + 1] / sf, verts[ai + 2] / sf);
                v1.setValue(verts[bi] / sf, verts[bi + 1] / sf, verts[bi + 2] / sf);
                v2.setValue(verts[ci] / sf, verts[ci + 1] / sf, verts[ci + 2] / sf);
                tmesh.addTriangle(v0, v1, v2);
            }
            const loopMs = performance.now() - tLoop0;
            // PHASE 2: btBvhTriangleMeshShape-Konstruktor (BVH-Baum-Bau)
            const tBvh0 = performance.now();
            const shape = new Ammo.btBvhTriangleMeshShape(tmesh, true, true);
            const bvhMs = performance.now() - tBvh0;
            o.samples.push({ tris: Math.round(tris), loopMs: +loopMs.toFixed(2), bvhMs: +bvhMs.toFixed(2) });
            Ammo.destroy(shape); Ammo.destroy(tmesh); Ammo.destroy(v0); Ammo.destroy(v1); Ammo.destroy(v2);
        }
        return o;
    });
    console.log("\n===== KOLLISIONS-BAU-SPLIT (Loop vs BVH-Konstruktor) =====\n");
    console.log(JSON.stringify(out, null, 2));
    if (out.samples && out.samples.length) {
        const loop = out.samples.reduce((s, x) => s + x.loopMs, 0) / out.samples.length;
        const bvh = out.samples.reduce((s, x) => s + x.bvhMs, 0) / out.samples.length;
        console.log(`\n  Ø Loop ${loop.toFixed(2)} ms · Ø BVH-Konstruktor ${bvh.toFixed(2)} ms`);
        console.log(`  → ${loop > bvh ? "LOOP dominiert → btTriangleIndexVertexArray (Puffer-API) lohnt" : "BVH-KONSTRUKTOR dominiert → weniger Dreiecke / kein BVH nötig"}`);
    }
    await browser.close(); server.close();
})().catch((e) => { console.error("CRASH:", e); process.exit(2); });

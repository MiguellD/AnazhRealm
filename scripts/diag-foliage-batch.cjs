// Mess-/Design-Werkzeug für den BatchedMesh-Bewuchs-Umbau: die TOPOLOGIE der
// archInstanceGroups — wie viele DISTINKTE Materialien (BatchedMesh bündelt pro
// Material) vs. wie viele Gruppen (= heutige Draws). Bestimmt die Draw-Call-Decke
// des Merge. Null-Renderer (schnell, kein GPU nötig — reine State-Topologie).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4392;
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
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load", timeout: 30000 });
    // warmlaufen: Streaming pumpen bis Bewuchs-Gruppen existieren
    await page.evaluate(async () => {
        const start = performance.now();
        const r0 = window.anazhRealm;
        if (r0 && r0.state) r0.state.voxelWorker = null; // sync-Streaming für deterministisches Warmup
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state.player && r.state.player.position) { r.state.player.position.x += 6; } // wandern → mehr Bewuchs streamen
                const g = r.state.archInstanceGroups;
                if (g && g.size > 40) break;
            }
            await new Promise((res) => setTimeout(res, 30));
        }
    });
    const topo = await page.evaluate(() => {
        const r = window.anazhRealm;
        const groups = r.state.archInstanceGroups ? [...r.state.archInstanceGroups.values()] : [];
        const matSet = new Map(); // mat → {groups, instances, tris}
        const geomSet = new Set();
        let totalInst = 0, totalTris = 0;
        for (const g of groups) {
            const mat = g.mat;
            const geom = g.geom;
            geomSet.add(geom);
            const inst = g.next || (g.mesh ? g.mesh.count : 0) || 0;
            const triPer = geom && geom.index ? geom.index.count / 3 : (geom && geom.attributes.position ? geom.attributes.position.count / 3 : 0);
            const tris = triPer * inst;
            totalInst += inst; totalTris += tris;
            const key = mat ? (mat.uuid || mat.name || "m") : "none";
            const e = matSet.get(key) || { name: (mat && (mat.type + (mat.userData && mat.userData.useInstanceTint ? "+tint" : ""))) || "?", groups: 0, instances: 0, tris: 0 };
            e.groups++; e.instances += inst; e.tris += tris;
            matSet.set(key, e);
        }
        const mats = [...matSet.entries()].map(([uuid, e]) => ({ uuid: uuid.slice(0, 8), ...e })).sort((a, b) => b.groups - a.groups);
        // V18.288 — Baum-spezifisch: teilen die grown_baum-Gruppen jetzt EIN Material?
        const treeGroups = groups.filter((g) => /grown_baum/.test(g.key || ""));
        const treeMats = new Set(treeGroups.map((g) => g.mat && g.mat.uuid));
        const sharedMarked = groups.filter((g) => g.mat && g.mat.userData && g.mat.userData.sharedFoliage).length;
        return {
            totalGroups: groups.length,
            distinctMaterials: matSet.size,
            distinctGeometries: geomSet.size,
            totalInstances: totalInst,
            totalTrisK: Math.round(totalTris / 100) / 10,
            foliageMatCacheSize: r.state._foliageMatCache ? r.state._foliageMatCache.size : -1,
            treeGroups: treeGroups.length,
            treeDistinctMaterials: treeMats.size,
            groupsWithSharedMat: sharedMarked,
            materials: mats,
        };
    });
    console.log("\n===== BEWUCHS-TOPOLOGIE (BatchedMesh-Decke) =====\n");
    console.log(`  Gruppen heute (= Draw-Calls):  ${topo.totalGroups}`);
    console.log(`  DISTINKTE Materialien:          ${topo.distinctMaterials}   ← BatchedMesh-Draw-Call-Decke`);
    console.log(`  DISTINKTE Geometrien:           ${topo.distinctGeometries}`);
    console.log(`  Instanzen total:                ${topo.totalInstances}`);
    console.log(`  Dreiecke total:                 ${topo.totalTrisK}k`);
    console.log("\n  Material → (Gruppen | Instanzen | Dreiecke):");
    for (const m of topo.materials.slice(0, 20)) {
        console.log(`    ${m.name.padEnd(34)} grp ${String(m.groups).padStart(4)} | inst ${String(m.instances).padStart(6)} | tris ${Math.round(m.tris / 100) / 10}k`);
    }
    console.log(`\n  GETEILTE MATERIALIEN (V18.288):`);
    console.log(`    _foliageMatCache.size:          ${topo.foliageMatCacheSize}   (distinkte geteilte Materialien gebaut)`);
    console.log(`    Gruppen mit sharedFoliage-Mat:  ${topo.groupsWithSharedMat} / ${topo.totalGroups}`);
    console.log(`    grown_baum-Gruppen:             ${topo.treeGroups}  →  ${topo.treeDistinctMaterials} distinkte Materialien  (Ziel: ≤ ~2-3)`);
    console.log(`\n  → Merge-Potential: ${topo.totalGroups} Gruppen-Draws → ~${topo.distinctMaterials} BatchedMesh-Draws (×LOD)`);
    await browser.close();
    server.close();
})().catch((e) => { console.error("CRASH:", e); process.exit(2); });

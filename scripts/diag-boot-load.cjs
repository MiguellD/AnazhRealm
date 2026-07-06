// DIE BOOT-LAST IN ZAHLEN (Schöpfer „wir laden den ersten chunk gemeinsam mit einem fernen niedrigen lod,
// wir sollten ganz günstig nur beim allerersten chunk starten, deutlich weniger trias"). Kein Render (Null-
// Renderer → kein swiftshader-Haenger) — nur die DREIECKS-Buchhaltung der Szene, nach Kategorie: Terrain
// (nah LOD0 vs fern LOD1/2/3) · Wasser-Sheet · Fern-Wasser-Sheet · Gras · Laub/Baeume. So sehe ich, was den
// Boot WIRKLICH schwer macht + wie teuer EIN einzelner erster Chunk ist.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4529;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    // NULL-Renderer (kein Pixel, kein Haenger) — die Geometrie ist CPU, die Dreiecke sind echt zaehlbar.
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 200000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html?nullRenderer=1`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        // Null-Renderer erzwingen (kein GPU).
        window.__anazhHeadlessNullRenderer = true;
        let boot = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                boot = true;
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 20) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        const triOf = (geo) => {
            if (!geo) return 0;
            const idx = geo.index;
            if (idx) return idx.count / 3;
            const pos = geo.attributes && geo.attributes.position;
            return pos ? pos.count / 3 : 0;
        };
        // 1) EIN einzelner LOD0-Chunk: wie teuer ist der erste Chunk?
        const res = {};
        const chunks = s.voxelChunks;
        let perChunk = { lod0: [], water: [], byLod: { 0: 0, 1: 0, 2: 0, 3: 0 } };
        let chunkCount = 0;
        chunks.forEach((entry) => {
            chunkCount++;
            const lod = Number.isFinite(entry.lod) ? entry.lod : 0;
            const mesh =
                entry.mesh || entry.terrainMesh || (entry.group && entry.group.children && entry.group.children[0]);
            let t = 0;
            if (mesh && mesh.geometry) t = triOf(mesh.geometry);
            else if (entry.group)
                entry.group.traverse((o) => {
                    if (o.isMesh && o.geometry) t += triOf(o.geometry);
                });
            perChunk.byLod[lod] = (perChunk.byLod[lod] || 0) + t;
            if (lod === 0 && perChunk.lod0.length < 5) perChunk.lod0.push(Math.round(t));
        });
        res.chunkCount = chunkCount;
        res.terrainTrisByLod = perChunk.byLod;
        res.einzelnerLod0Chunk_beispiele = perChunk.lod0;
        // 2) Fern-Wasser-Sheet (V18.381) — der Kandidat fuer „ferner niedriger LOD"
        let farWater = 0,
            farWaterMeshes = 0;
        if (s.scene)
            s.scene.traverse((o) => {
                if (o.isMesh && o.geometry && o.name && /farwater|far_water|fernwasser/i.test(o.name)) {
                    farWater += triOf(o.geometry);
                    farWaterMeshes++;
                }
            });
        // Fallback: bekanntes Feld
        if (s._farWaterMesh && s._farWaterMesh.geometry) {
            farWater = triOf(s._farWaterMesh.geometry);
            farWaterMeshes = 1;
        }
        res.fernWasserSheet = { tris: Math.round(farWater), meshes: farWaterMeshes };
        // 3) Gesamt-Szene nach Kategorie (Terrain/Wasser/Gras/Laub/Rest)
        const cat = { terrain: 0, wasser: 0, gras: 0, laubBaeume: 0, rest: 0 };
        let totalTris = 0,
            meshCount = 0,
            instMeshCount = 0;
        if (s.scene)
            s.scene.traverse((o) => {
                if (!o.visible) return;
                if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                meshCount++;
                let t = triOf(o.geometry);
                const inst = o.isInstancedMesh ? o.count || 0 : o.isBatchedMesh ? o._geometryCount || o.count || 1 : 1;
                if (o.isInstancedMesh || o.isBatchedMesh) instMeshCount++;
                const tt = t * (o.isInstancedMesh ? inst : 1);
                totalTris += tt;
                const nm = (
                    (o.name || "") +
                    " " +
                    (o.material && o.material.name ? o.material.name : "")
                ).toLowerCase();
                const fk = o.material && o.material.userData ? o.material.userData.foundryKind || "" : "";
                if (/water|wasser|hydro/.test(nm)) cat.wasser += tt;
                else if (/grass|gras|halm/.test(nm)) cat.gras += tt;
                else if (/foliage|leaf|laub|baum|tree|bark|rinde/.test(nm) || /foliage|leaf|bark/i.test(fk))
                    cat.laubBaeume += tt;
                else if (/chunk|terrain|voxel/.test(nm)) cat.terrain += tt;
                else cat.rest += tt;
            });
        res.szeneGesamt = { totalTris: Math.round(totalTris), meshCount, instMeshCount };
        res.nachKategorie = {
            terrain: Math.round(cat.terrain),
            wasser: Math.round(cat.wasser),
            gras: Math.round(cat.gras),
            laubBaeube: Math.round(cat.laubBaeube),
            rest: Math.round(cat.rest),
        };
        // Die GROESSTEN Meshes nach Dreiecken (was macht die 6.9M aus?) — Name/Material/Instanzen dumpen.
        const big = [];
        if (s.scene)
            s.scene.traverse((o) => {
                if (!o.visible || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                const per = triOf(o.geometry);
                const inst = o.isInstancedMesh ? o.count || 0 : 1;
                const tot = per * (o.isInstancedMesh ? inst : 1);
                big.push({
                    tris: Math.round(tot),
                    perInst: Math.round(per),
                    inst,
                    kind: o.isInstancedMesh ? "InstMesh" : o.isBatchedMesh ? "Batched" : "Mesh",
                    name: (o.name || "?").slice(0, 40),
                    mat: o.material && o.material.name ? o.material.name.slice(0, 30) : "",
                    fk: o.material && o.material.userData ? o.material.userData.foundryKind || "" : "",
                });
            });
        big.sort((a, b) => b.tris - a.tris);
        res.groessteMeshes = big.slice(0, 14);
        // 4) Gras-Instanzen gesamt (der 83%-Last-Traeger V18.307)
        let grassInst = 0,
            grassMeshes = 0;
        if (s.voxelChunkGrass && s.voxelChunkGrass.forEach)
            s.voxelChunkGrass.forEach((m) => {
                if (m && m.count) {
                    grassInst += m.count;
                    grassMeshes++;
                }
            });
        res.gras = { instanzen: grassInst, meshes: grassMeshes };
        // 5) Ramp-Zustand: baut die Welt wirklich klein, oder full ring?
        res.ramp = {
            activeRingRadius: s._activeRingRadius,
            chunkRingRadius: s.chunkRingRadius,
            RING_RAMP_START: r.constructor.RING_RAMP_START,
            headlessBypass: !!(s.renderer && s.renderer._isHeadlessNull),
        };
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    process.exit(0);
})();

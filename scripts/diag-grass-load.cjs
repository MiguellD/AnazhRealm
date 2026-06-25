#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-grass-load.cjs — DIE GRAS-LAST-LINSE (schnell, null-renderer, ~9 s)
//
// Das Gras trägt den GPU-render-gebundenen Sockel (CLAUDE.md V18.361: 83 %). Diese
// Linse misst die ECHTE Gras-Geometrie OHNE den schweren swiftshader-Renderer: die
// Gras-InstancedMeshes sind CPU-gebaut → der Null-Renderer trägt sie genauso. Sie
// liest: Mesh-Zahl (= Draw-Calls), Σ-Instanzen, Tris/Tuft, Σ-Tris, Frustum-Cull-Status.
// „Nicht rendern ist der intelligenteste Rasterizer." (V18.360-Prozess-Lehre.)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4361;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        // Warmup: den Ring + das Gras voll bauen (null-renderer-sync)
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null; // sync-Build im Tick (load-unabhängig)
            for (let i = 0; i < 140; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const triOf = (geo) =>
                !geo || !geo.attributes || !geo.attributes.position
                    ? 0
                    : geo.index
                      ? geo.index.count / 3
                      : geo.attributes.position.count / 3;
            const o = { meshes: 0, instances: 0, tris: 0, trisPerTuft: 0, noCull: 0, cullable: 0, byLod: {} };
            const grassMap = st.voxelChunkGrass || new Map();
            const lodMap = st.voxelChunkGrassLod || new Map();
            for (const [key, inst] of grassMap) {
                if (!inst) continue; // null = leerer/ferner Chunk
                const lod = lodMap.get(key) || 0;
                const tpt = triOf(inst.geometry);
                const n = inst.count || 0;
                o.meshes++;
                o.instances += n;
                o.tris += tpt * n;
                o.trisPerTuft = tpt;
                if (inst.frustumCulled === false) o.noCull += tpt * n;
                else o.cullable += tpt * n;
                if (!o.byLod[lod]) o.byLod[lod] = { meshes: 0, inst: 0 };
                o.byLod[lod].meshes++;
                o.byLod[lod].inst += n;
            }
            o.grassChunks = grassMap.size;
            o.densityScale = st._foliageDensityScale != null ? st._foliageDensityScale : 1;
            o.GRASS_MAX_BLADES = 1400;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Gras-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : "" + n);
    console.log("\n=== Gras-Last (Null-Renderer, echte CPU-Geometrie) ===");
    console.log(`  Gras-Chunks (Einträge):    ${out.grassChunks}  (densityScale=${out.densityScale})`);
    console.log(`  Gras-Meshes (= Draw-Calls): ${out.meshes}`);
    console.log(`  Σ Instanzen (Büschel):      ${fmt(out.instances)}`);
    console.log(`  Tris / Büschel:             ${out.trisPerTuft}`);
    console.log(`  Σ Gras-Tris:                ${fmt(out.tris)}`);
    console.log(`  davon nie-gecullt:          ${fmt(out.noCull)}  ·  cullbar: ${fmt(out.cullable)}`);
    console.log(`  nach LOD:`);
    for (const lod of Object.keys(out.byLod).sort()) {
        const b = out.byLod[lod];
        console.log(`    LOD ${lod}: ${b.meshes} Meshes · ${fmt(b.inst)} Büschel`);
    }
    console.log("");
    process.exit(0);
})();

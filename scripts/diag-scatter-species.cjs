// Diag: DIE NAHE STREU-LAST PRO ART (V18.307-Vorbereitung). Das Laub ist 84 % der
// GPU-Last (diag-render-load: Scatter 2.14M Tris / 56.561 Instanzen). DIESER Probe
// bricht die nahe Streu (`state.voxelChunkScatter`) PRO ART auf: Instanzen × Geometrie-
// Dreiecke → wo die 2.14M wirklich leben. Die V18.266-Disziplin „miss die Render-Last
// pro Art" — bevor man Geometrie senkt, MISST man, welche Art sie trägt. Null-Renderer
// (volle Dichte/Radius) → die volle lush-Last sichtbar.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4362,
    root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
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
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    // Null-Renderer → volle Dichte/Radius (die volle lush-Welt, gate-treu).
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        // den Streu-Aufbau drainen (deferierte Queue)
        const r = window.anazhRealm;
        for (let i = 0; i < 400; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const triOf = (geo) =>
            !geo || !geo.attributes || !geo.attributes.position
                ? 0
                : geo.index
                  ? geo.index.count / 3
                  : geo.attributes.position.count / 3;
        // Geometrie → Art-Name (aus dem _scatterGeoms-Cache, keyed by species.name).
        const geo2name = new Map();
        const triByName = {};
        if (s._scatterGeoms) {
            for (const [name, geo] of s._scatterGeoms.entries()) {
                geo2name.set(geo, name);
                triByName[name] = triOf(geo);
            }
        }
        // Pro-Art: Instanzen über alle Chunk-Streu-Meshes summieren.
        const perSpecies = {};
        let totalInst = 0,
            totalTris = 0,
            meshCount = 0;
        if (s.voxelChunkScatter) {
            for (const meshes of s.voxelChunkScatter.values()) {
                if (!meshes) continue;
                for (const mesh of meshes) {
                    if (!mesh || !mesh.geometry) continue;
                    meshCount++;
                    const name = geo2name.get(mesh.geometry) || mesh.name || "?";
                    const inst = mesh.count || 0;
                    const tpi = triOf(mesh.geometry);
                    if (!perSpecies[name]) perSpecies[name] = { inst: 0, tpi, tris: 0, meshes: 0 };
                    perSpecies[name].inst += inst;
                    perSpecies[name].tris += inst * tpi;
                    perSpecies[name].meshes++;
                    totalInst += inst;
                    totalTris += inst * tpi;
                }
            }
        }
        // Gras separat (eigenes System) — zum Vergleich.
        let grassInst = 0,
            grassTris = 0,
            grassMeshes = 0;
        if (s.voxelChunkGrass) {
            for (const mesh of s.voxelChunkGrass.values()) {
                if (!mesh || !mesh.geometry) continue;
                grassMeshes++;
                const inst = mesh.count || 0;
                grassInst += inst;
                grassTris += inst * triOf(mesh.geometry);
            }
        }
        return {
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
            foliageRadius: s.foliageRadius,
            densityScale: s._foliageDensityScale,
            perSpecies,
            triByName,
            totalInst,
            totalTris,
            meshCount,
            grass: { inst: grassInst, tris: grassTris, meshes: grassMeshes },
        };
    });

    console.log("\n===== NAHE STREU-LAST PRO ART (V18.266-Disziplin) =====\n");
    console.log(
        `  Welt: chunks=${out.chunks} foliageRadius=${out.foliageRadius} densityScale=${out.densityScale} scatterMeshes=${out.meshCount}`
    );
    console.log(`  Streu TOTAL: ${(out.totalTris / 1e6).toFixed(2)}M Tris · ${out.totalInst} Instanzen\n`);
    const rows = Object.entries(out.perSpecies).sort((a, b) => b[1].tris - a[1].tris);
    console.log("  Art                tris/Inst    Instanzen     Tris-gesamt    %-Streu");
    for (const [name, d] of rows) {
        const pct = out.totalTris ? ((d.tris / out.totalTris) * 100).toFixed(1) : "0";
        console.log(
            `  ${name.padEnd(20)} ${String(d.tpi).padStart(5)}    ${String(d.inst).padStart(8)}    ${(d.tris / 1e3).toFixed(1).padStart(9)}k    ${pct.padStart(5)}%`
        );
    }
    console.log(
        `\n  Gras (eigenes System): ${(out.grass.tris / 1e6).toFixed(2)}M Tris · ${out.grass.inst} Instanzen · ${out.grass.meshes} Meshes`
    );
    console.log("\n=======================================================\n");
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();

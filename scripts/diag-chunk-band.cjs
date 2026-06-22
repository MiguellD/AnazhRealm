// diag-chunk-band.cjs — BYTE-ORAKEL + Zeitmessung für den Voxel-Mesh-Band-Skip.
// Der Worker-Mesher (`buildChunkMesh`) wertet `terrainDensityAt` am VOLLEN Gitter
// aus (~91k Noise-Calls/Chunk), während der Main-Mesh-Pfad (`_voxelSampleDensityGrid`)
// schon den BAND-SKIP nutzt (nur nahe der Oberfläche, sonst ±1). Diese Linse beweist
// auf dem MAIN-Thread, dass der Band-Skip BYTE-IDENTISCHE Mesh-Geometrie liefert wie
// die Vollauswertung (position/normal/color/index) — die Rechtfertigung, den Band-Skip
// in den Worker zu portieren. Plus: die gemessene Ersparnis der Density-Sample-Schleife.
// Lauf: node scripts/diag-chunk-band.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4372;
const root = path.resolve(__dirname, "..");
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
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const cfg = r._voxelChunkConfig(0);
        const { dim, step, span, dimY, floorDrop } = cfg;
        const base = r.state.terrainBaseHeight || 0;
        const cases = [
            [0, 0],
            [1, 0],
            [0, 1],
            [3, 2],
        ];
        const fullSample = (x, y, z) => r._terrainDensityAt(x, y, z);
        const res = [];
        for (const [cx, cz] of cases) {
            const ox = cx * span,
                oz = cz * span,
                oy = base - floorDrop;
            const sampleOx = ox - step,
                sampleOz = oz - step;
            const sdx = dim + 3,
                sdy = dimY,
                sdz = dim + 3;
            const Nx = sdx + 1,
                Ny = sdy + 1,
                Nz = sdz + 1;
            // BAND density (die Produktions-Methode des Main-Mesh-Pfads).
            const tB0 = performance.now();
            const bandD = r._voxelSampleDensityGrid(sampleOx, oy, sampleOz, sdx, sdy, sdz, step, fullSample);
            const tBand = performance.now() - tB0;
            // FULL density (die Worker-buildChunkMesh-Methode: jeder Punkt terrainDensityAt).
            const tF0 = performance.now();
            const fullD = new Float32Array(Nx * Ny * Nz);
            for (let k = 0; k < Nz; k++)
                for (let j = 0; j < Ny; j++)
                    for (let i = 0; i < Nx; i++)
                        fullD[i + j * Nx + k * Nx * Ny] = fullSample(
                            sampleOx + i * step,
                            oy + j * step,
                            sampleOz + k * step
                        );
            const tFull = performance.now() - tF0;
            // Mesh beidseitig bauen (gleiche densityFn für OOB-Normalen-Fallback; preDensity variiert).
            const tG0 = performance.now();
            const gBand = r._voxelChunkGeometry(sampleOx, oy, sampleOz, sdx, sdy, sdz, step, fullSample, 1, bandD, 1);
            const tGeom = performance.now() - tG0; // Surface-Nets+Smooth+Normalen+Colors (geteilt, density-unabhängig)
            const gFull = r._voxelChunkGeometry(sampleOx, oy, sampleOz, sdx, sdy, sdz, step, fullSample, 1, fullD, 1);
            const cmp = (a, b) => {
                if (!a && !b) return 0;
                if (!a || !b || a.length !== b.length) return Infinity;
                let w = 0;
                for (let i = 0; i < a.length; i++) {
                    const d = Math.abs(a[i] - b[i]);
                    if (d > w) w = d;
                }
                return w;
            };
            const attr = (g, n) => (g && g.attributes[n] ? g.attributes[n].array : null);
            const c = {
                chunk: `${cx},${cz}`,
                tBand: +tBand.toFixed(1),
                tFull: +tFull.toFixed(1),
                tGeom: +tGeom.toFixed(1),
                bandNull: !gBand,
                fullNull: !gFull,
            };
            if (gBand && gFull) {
                c.position = cmp(attr(gBand, "position"), attr(gFull, "position"));
                c.normal = cmp(attr(gBand, "normal"), attr(gFull, "normal"));
                c.color = cmp(attr(gBand, "color"), attr(gFull, "color"));
                c.index = cmp(gBand.index ? gBand.index.array : null, gFull.index ? gFull.index.array : null);
                c.vtx = gBand.attributes.position.count;
            } else {
                c.bothNull = !gBand && !gFull;
            }
            res.push(c);
        }
        return res;
    });
    await browser.close();
    server.close();
    console.log("===== CHUNK-BAND-ORAKEL — Band-Skip vs Vollauswertung (Mesh byte-identisch?) =====\n");
    let allOk = true;
    for (const c of out) {
        if (c.bothNull) {
            console.log(`  ✅ Chunk ${c.chunk} (beide leer)`);
            continue;
        }
        const md = Math.max(c.position || 0, c.normal || 0, c.color || 0, c.index || 0);
        const ok = md === 0;
        if (!ok) allOk = false;
        const totFull = c.tFull + c.tGeom,
            totBand = c.tBand + c.tGeom;
        console.log(
            `  ${ok ? "✅" : "❌"} Chunk ${c.chunk.padEnd(5)}  maxDiff ${md}  · density ${c.tFull.toFixed(0)}→${c.tBand.toFixed(0)} ms (${(c.tFull / c.tBand).toFixed(2)}×) · +geom ${c.tGeom.toFixed(0)} → CHUNK ${totFull.toFixed(0)}→${totBand.toFixed(0)} ms (${(totFull / totBand).toFixed(2)}×) · vtx ${c.vtx || 0}` +
                (ok ? "" : `  → pos ${c.position} nrm ${c.normal} col ${c.color} idx ${c.index}`)
        );
    }
    console.log(
        "\n" +
            (allOk
                ? "✅ BYTE-IDENTISCH — der Band-Skip liefert dieselbe Mesh-Geometrie; sicher in den Worker zu portieren."
                : "❌ DIFF — der Band-Skip ändert die Geometrie. Band-Margin prüfen.")
    );
    process.exit(allOk ? 0 : 1);
})().catch((e) => {
    console.error("Crash:", e);
    process.exit(1);
});

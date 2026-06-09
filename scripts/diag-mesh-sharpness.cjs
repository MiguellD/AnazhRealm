// Diagnose T3 (Terrain-Kohärenz-Plan §4) — die SCHÄRFE des Terrain-Meshers messen.
// Surface Nets MITTELT die Kanten-Kreuzungen → blobig/rund (keine scharfen Kanten). Dual
// Contouring (QEF-Minimum über die Hermite-Normalen) setzt den Vertex an den FEATURE-Eckpunkt
// → scharfe Canyons/Felsen. Maß: die DIEDER-Winkel-Verteilung (der Winkel zwischen den Face-
// Normalen über eine geteilte Kante). Blobig = fast alle Kanten flach (<15°); kantig = eine
// fette Schulter scharfer Kanten (>40°) = die Falten/Grate. Headless beweisbar (reine GEOMETRIE,
// nicht pixel-blind — die V18-Lehre + der Schöpfer-Beweis „du siehst es wie ich").
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4366;
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
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 120; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        // pro LOD0-Terrain-Chunk: Dieder-Winkel über geteilte Kanten (face-normal-Differenz).
        const hist = { flat: 0, soft: 0, edge: 0, sharp: 0 }; // <10° / 10-25° / 25-45° / >45°
        let edges = 0,
            sumAngle = 0,
            tris = 0,
            chunks = 0;
        const degen = [];
        for (const [, entry] of s.voxelChunks) {
            if (!entry || entry.empty || !entry.mesh || !entry.mesh.geometry) continue;
            if (Number.isFinite(entry.lod) && entry.lod !== 0) continue; // nur LOD0 (volle Auflösung)
            const g = entry.mesh.geometry;
            const pos = g.attributes.position;
            const idx = g.index ? g.index.array : null;
            if (!pos || !idx) continue;
            chunks++;
            // Face-Normalen + Edge→Faces-Map (Edge-Key = sortiertes Vertex-Index-Paar)
            const triN = idx.length / 3;
            tris += triN;
            const nx = new Float64Array(triN),
                ny = new Float64Array(triN),
                nz = new Float64Array(triN);
            const edgeMap = new Map();
            const addEdge = (a, b, t) => {
                const key = a < b ? a + ":" + b : b + ":" + a;
                let arr = edgeMap.get(key);
                if (!arr) {
                    arr = [];
                    edgeMap.set(key, arr);
                }
                arr.push(t);
            };
            for (let t = 0; t < triN; t++) {
                const i0 = idx[t * 3],
                    i1 = idx[t * 3 + 1],
                    i2 = idx[t * 3 + 2];
                const ax = pos.getX(i0),
                    ay = pos.getY(i0),
                    az = pos.getZ(i0);
                const bx = pos.getX(i1),
                    by = pos.getY(i1),
                    bz = pos.getZ(i1);
                const cx = pos.getX(i2),
                    cy = pos.getY(i2),
                    cz = pos.getZ(i2);
                const ux = bx - ax,
                    uy = by - ay,
                    uz = bz - az;
                const vx = cx - ax,
                    vy = cy - ay,
                    vz = cz - az;
                let fx = uy * vz - uz * vy,
                    fy = uz * vx - ux * vz,
                    fz = ux * vy - uy * vx;
                const len = Math.hypot(fx, fy, fz);
                if (len < 1e-12) {
                    degen.push(t);
                    nx[t] = 0;
                    ny[t] = 1;
                    nz[t] = 0;
                } else {
                    nx[t] = fx / len;
                    ny[t] = fy / len;
                    nz[t] = fz / len;
                }
                addEdge(i0, i1, t);
                addEdge(i1, i2, t);
                addEdge(i2, i0, t);
            }
            for (const [, arr] of edgeMap) {
                if (arr.length !== 2) continue; // nur Mannigfaltigkeits-Kanten (genau 2 Faces)
                const t0 = arr[0],
                    t1 = arr[1];
                let dot = nx[t0] * nx[t1] + ny[t0] * ny[t1] + nz[t0] * nz[t1];
                dot = Math.max(-1, Math.min(1, dot));
                const ang = (Math.acos(dot) * 180) / Math.PI;
                edges++;
                sumAngle += ang;
                if (ang < 10) hist.flat++;
                else if (ang < 25) hist.soft++;
                else if (ang < 45) hist.edge++;
                else hist.sharp++;
            }
        }
        return {
            chunks,
            tris,
            edges,
            degen: degen.length,
            meanAngle: edges ? +(sumAngle / edges).toFixed(2) : 0,
            flatPct: edges ? +((100 * hist.flat) / edges).toFixed(1) : 0,
            softPct: edges ? +((100 * hist.soft) / edges).toFixed(1) : 0,
            edgePct: edges ? +((100 * hist.edge) / edges).toFixed(1) : 0,
            sharpPct: edges ? +((100 * hist.sharp) / edges).toFixed(1) : 0,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n=== T3 — TERRAIN-SCHÄRFE (Dieder-Winkel-Verteilung, LOD0) ===\n");
    console.log(
        `LOD0-Chunks: ${out.chunks},  Dreiecke: ${out.tris},  Mannigfaltigkeits-Kanten: ${out.edges},  degeneriert: ${out.degen}`
    );
    console.log(`mittlerer Dieder-Winkel: ${out.meanAngle}°`);
    console.log(
        `Verteilung:  flach <10°: ${out.flatPct}%   ·   weich 10-25°: ${out.softPct}%   ·   Kante 25-45°: ${out.edgePct}%   ·   SCHARF >45°: ${out.sharpPct}%`
    );
    console.log(`\n→ blobig = fast alles flach/weich; kantig = eine fette SCHARF-Schulter (>45° = Grate/Falten).`);
    console.log(`  (Vergleich: vor T3 [Surface Nets Mittelung] vs. nach T3 [Dual Contouring QEF].)\n`);
    process.exit(0);
})();

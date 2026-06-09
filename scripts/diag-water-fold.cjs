// Fischer-Sonde (T7d/Ebene B): der Schöpfer-Befund — facettierte/gefaltete Wasser-
// Flächen (vorallem kleine Seen), Chunkgrenz-Step, Seen die sich „entleeren" + nicht
// wissen ob See/Fluss. MISST headless die GEOMETRIE (kein Pixel): (1) das FALTEN —
// Wasser-Dreiecke deren Normale NICHT fast-vertikal ist (ny<0.7 = gekippt/gefaltet;
// ein flacher Spiegel hat ~alle ny≈1); (2) der AUSLAUF-Anteil (aDepth < 1 Zelle =
// die V18.31-Terrain-Folge-Branche feuert → der Verdächtige); (3) der GRENZ-STEP
// (geteilte Rand-Vertices benachbarter Meshes — gleiche x,z → gleiche surfY?); (4)
// LEERE Seen (Wasser-Mesh existiert, aber aDepth≈0 überall = Flood füllt nicht).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4368;
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
        for (let i = 0; i < 200; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        const r = window.anazhRealm;
        if (r && typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        if (r && typeof r._drainPendingWaterIso === "function") r._drainPendingWaterIso();
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const step0 = r._voxelChunkConfig(0).step;
        let nMeshes = 0;
        let totalTris = 0,
            foldedTris = 0,
            steepTris = 0;
        let totalVerts = 0,
            auslaufVerts = 0,
            dryVerts = 0;
        const perMesh = []; // pro Mesh die Falt-/Auslauf-Quote
        if (s.voxelChunkWaterIso) {
            for (const [key, mesh] of s.voxelChunkWaterIso) {
                if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) continue;
                nMeshes++;
                const pos = mesh.geometry.attributes.position;
                const ad = mesh.geometry.attributes.aDepth;
                const idx = mesh.geometry.index ? mesh.geometry.index.array : null;
                // FALTEN: Dreiecks-Normale; flacher Spiegel → ny≈1. ny<0.7 = >45° gekippt (gefaltet/steil).
                let mTris = 0,
                    mFold = 0,
                    mSteep = 0;
                const tc = idx ? idx.length / 3 : Math.floor(pos.count / 3);
                for (let t = 0; t < tc; t++) {
                    const a = idx ? idx[t * 3] : t * 3,
                        b = idx ? idx[t * 3 + 1] : t * 3 + 1,
                        c = idx ? idx[t * 3 + 2] : t * 3 + 2;
                    const ax = pos.getX(a),
                        ay = pos.getY(a),
                        az = pos.getZ(a);
                    const e1x = pos.getX(b) - ax,
                        e1y = pos.getY(b) - ay,
                        e1z = pos.getZ(b) - az;
                    const e2x = pos.getX(c) - ax,
                        e2y = pos.getY(c) - ay,
                        e2z = pos.getZ(c) - az;
                    const nx = e1y * e2z - e1z * e2y,
                        ny = e1z * e2x - e1x * e2z,
                        nz = e1x * e2y - e1y * e2x;
                    const nl = Math.hypot(nx, ny, nz) || 1e-9;
                    const nyAbs = Math.abs(ny / nl);
                    mTris++;
                    totalTris++;
                    if (nyAbs < 0.7) {
                        mSteep++;
                        steepTris++;
                    } // >45° gekippt = die Faltung
                    if (nyAbs < 0.95) {
                        mFold++;
                        foldedTris++;
                    } // >18° = sanft gekippt (alle ≈1 = perfekt flach)
                }
                let mVerts = 0,
                    mAus = 0,
                    mDry = 0;
                for (let v = 0; v < pos.count; v++) {
                    mVerts++;
                    totalVerts++;
                    const depthM = ad ? ad.getX(v) : 2;
                    if (depthM < step0) {
                        mAus++;
                        auslaufVerts++;
                    } // die V18.31-Auslauf-Branche feuert hier
                    if (depthM < 0.05) {
                        mDry++;
                        dryVerts++;
                    }
                }
                perMesh.push({
                    key,
                    tris: mTris,
                    steepPct: mTris ? +((100 * mSteep) / mTris).toFixed(0) : 0,
                    ausPct: mVerts ? +((100 * mAus) / mVerts).toFixed(0) : 0,
                    dryPct: mVerts ? +((100 * mDry) / mVerts).toFixed(0) : 0,
                    verts: mVerts,
                });
            }
        }
        // GRENZ-STEP: geteilte Rand-Vertices benachbarter Meshes (gleiche x,z → gleiche Y?)
        const QV = 0.05;
        const vmap = new Map(); // "qx,qz" → [y,...] über alle Meshes
        if (s.voxelChunkWaterIso) {
            for (const [, mesh] of s.voxelChunkWaterIso) {
                if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) continue;
                const pos = mesh.geometry.attributes.position;
                for (let v = 0; v < pos.count; v++) {
                    const qk = Math.round(pos.getX(v) / QV) + "," + Math.round(pos.getZ(v) / QV);
                    const y = pos.getY(v);
                    const e = vmap.get(qk);
                    if (e) {
                        e.push(y);
                    } else vmap.set(qk, [y]);
                }
            }
        }
        let sharedXZ = 0,
            stepXZ = 0,
            maxStep = 0;
        for (const [, ys] of vmap) {
            if (ys.length < 2) continue;
            sharedXZ++;
            let mn = Infinity,
                mx = -Infinity;
            for (const y of ys) {
                if (y < mn) mn = y;
                if (y > mx) mx = y;
            }
            if (mx - mn > 0.1) {
                stepXZ++;
                if (mx - mn > maxStep) maxStep = mx - mn;
            }
        }
        // die schlimmsten Meshes nach Faltung
        perMesh.sort((a, b) => b.steepPct - a.steepPct);
        return {
            nMeshes,
            totalTris,
            steepTris,
            foldedTris,
            steepPct: totalTris ? +((100 * steepTris) / totalTris).toFixed(1) : 0,
            foldPct: totalTris ? +((100 * foldedTris) / totalTris).toFixed(1) : 0,
            totalVerts,
            auslaufPct: totalVerts ? +((100 * auslaufVerts) / totalVerts).toFixed(1) : 0,
            dryPct: totalVerts ? +((100 * dryVerts) / totalVerts).toFixed(1) : 0,
            sharedXZ,
            stepXZ,
            stepPct: sharedXZ ? +((100 * stepXZ) / sharedXZ).toFixed(1) : 0,
            maxStep: +maxStep.toFixed(2),
            worst: perMesh.slice(0, 8),
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== Wasser-Mesh-Befund (T7d/Ebene B) — facettiert? Auslauf? Grenz-Step? leer? ===\n");
    console.log(`Wasser-Flächen: ${out.nMeshes}  ·  Dreiecke: ${out.totalTris}  ·  Vertices: ${out.totalVerts}\n`);
    console.log(`(1) FALTEN — Wasser-Dreiecke mit gekippter Normale (flacher Spiegel = ny≈1):`);
    console.log(
        `    >45° gekippt (das sichtbare Falten): ${out.steepPct}% (${out.steepTris})  ·  >18° sanft: ${out.foldPct}%`
    );
    console.log(`(2) AUSLAUF — Vertices wo die V18.31-Terrain-Folge-Branche feuert (depthM < 1 Zelle):`);
    console.log(`    ${out.auslaufPct}% der Vertices  ·  davon ganz trocken (depthM≈0): ${out.dryPct}%`);
    console.log(`(3) GRENZ-STEP — geteilte (x,z) zwischen Meshes, Y-Sprung > 0.1 m:`);
    console.log(
        `    ${out.stepPct}% der ${out.sharedXZ} geteilten Positionen springen  ·  max Sprung ${out.maxStep} m`
    );
    console.log(`\nSCHLIMMSTE Meshes (Falt-% / Auslauf-% / trocken-%):`);
    for (const m of out.worst)
        console.log(
            `    ${m.key.padEnd(9)} steep ${String(m.steepPct).padStart(3)}%  auslauf ${String(m.ausPct).padStart(3)}%  trocken ${String(m.dryPct).padStart(3)}%  (${m.verts} v)`
        );
    console.log(`\nDEUTUNG: hohe steep% + hohe auslauf% an denselben Meshes → die V18.31-Auslauf-Branche (per-Vertex`);
    console.log(`Terrain-Folge) faltet flache Seen. Hoher Grenz-Step% → das L/surfY ist an der Naht NICHT geteilt.`);
    process.exit(0);
})();

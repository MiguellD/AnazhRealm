// Diagnose (Auslauf-Schliff) — die HORIZONTALE NEIGUNG des Wasser-Auslaufs.
// Schöpfer-Befund (Browser): "kriegen wir den Auslauf noch flacher hin? die Neigung,
// das Fliessen fast 90°, der Fluss mehr ein Quadrat als eine Konvexe, sehr kantig,
// es fällt direkt in den Boden statt fluidisch auszufliessen."
//
// HYPOTHESE (Code als Fremder gelesen): der V18.25-Boden-Auslauf
//   surfY = L − (thickness+1)·smoothstep((thickness−2.5)/4.0)
// koppelt die VERTIKALE Absenkung an `thickness = L − Terrain`. Bei steilem Terrain
// wächst thickness pro Zelle (step=1.8 m) schnell → der smoothstep durchläuft seinen
// vollen Bereich (2.5..6.5 m) über ~1 Zelle → der Übergang ist horizontal komprimiert
// → fast vertikal. Diese Neigung ist GEOMETRIE (Vertex-surfY) → headless messbar
// (anders als die Shader-Pixel).
//
// METRIK A — pro Wasser-Surface-Quad die MAX Kanten-Neigung (|dY|/horizontale Distanz
//            → Grad). Verteilung p50/p90/max + Anteil "steil" (>60°) und "fast vertikal"
//            (>75°). NUR Quads mit echtem Höhen-Drop (Auslauf-Zone), nicht die flache Fläche.
// METRIK B — die ÜBERGANGS-BREITE: pro Auslauf-Profil wie viele Zellen vom flachen L
//            bis zum vollen Boden-Drop. 1 Zelle = kantig; >3 = fluidisch.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4377;
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
        while (performance.now() - start < 50000) {
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
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        // METRIK A — pro Wasser-Surface-Quad: max Vertex-zu-Vertex-Neigung in Grad.
        const slopes = []; // Grad, nur Kanten mit |dY|>0.5 m (echter Drop = Auslauf)
        let edgeTotal = 0,
            edgeDrop = 0,
            steep60 = 0,
            vert75 = 0;
        const RAD = 180 / Math.PI;
        for (const [, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            const idx = mesh.geometry.index;
            if (!pos || !idx) continue;
            // pro Dreieck die 3 Kanten prüfen
            for (let t = 0; t < idx.count; t += 3) {
                const a = idx.getX(t),
                    b = idx.getX(t + 1),
                    c = idx.getX(t + 2);
                const tri = [
                    [a, b],
                    [b, c],
                    [c, a],
                ];
                for (const [u, v] of tri) {
                    const dx = pos.getX(u) - pos.getX(v);
                    const dy = pos.getY(u) - pos.getY(v);
                    const dz = pos.getZ(u) - pos.getZ(v);
                    const horiz = Math.hypot(dx, dz);
                    if (horiz < 0.01) continue;
                    edgeTotal++;
                    const ady = Math.abs(dy);
                    if (ady > 0.5) {
                        edgeDrop++;
                        const deg = Math.atan2(ady, horiz) * RAD;
                        slopes.push(deg);
                        if (deg > 60) steep60++;
                        if (deg > 75) vert75++;
                    }
                }
            }
        }
        slopes.sort((x, y) => x - y);
        const pct = (p) => (slopes.length ? +slopes[Math.floor((slopes.length - 1) * p)].toFixed(1) : 0);

        // METRIK B — Übergangs-Breite an Fluss-Auslauf-Profilen: senkrecht zur Strömung
        // walken; zählen, über wie viele Zellen surfY (gelesen vom echten Surface-Mesh via
        // _atlasWaterLevelAt + dem Auslauf nachgebildet) vom flachen L auf den Boden fällt.
        // Hier rekonstruieren wir den Auslauf NICHT (er steckt im Mesh); stattdessen messen
        // wir an realen Mesh-Vertices: pro Chunk-Reihe die längste monoton-fallende surfY-Kette.
        const step = r._voxelChunkConfig(0).step;
        const runLens = [];
        for (const [, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            if (!pos) continue;
            // Vertices in ein (x,z)->Y-Gitter packen (gerundet auf step)
            const grid = new Map();
            let minI = Infinity,
                maxI = -Infinity,
                minK = Infinity,
                maxK = -Infinity;
            const ox = mesh.userData.cx !== undefined ? mesh.userData.cx : 0;
            void ox;
            for (let p = 0; p < pos.count; p++) {
                const gi = Math.round(pos.getX(p) / step);
                const gk = Math.round(pos.getZ(p) / step);
                grid.set(gi + "," + gk, pos.getY(p));
                if (gi < minI) minI = gi;
                if (gi > maxI) maxI = gi;
                if (gk < minK) minK = gk;
                if (gk > maxK) maxK = gk;
            }
            // entlang jeder Reihe (k fix): längste fallende Kette mit Gesamt-Drop > 2 m
            for (let k = minK; k <= maxK; k++) {
                let runStart = null,
                    prevY = null,
                    run = 0,
                    drop = 0;
                for (let i = minI; i <= maxI; i++) {
                    const y = grid.get(i + "," + k);
                    if (y === undefined) {
                        if (run > 0 && drop > 2) runLens.push(run);
                        runStart = null;
                        prevY = null;
                        run = 0;
                        drop = 0;
                        continue;
                    }
                    if (prevY !== null && y < prevY - 0.2) {
                        run++;
                        drop += prevY - y;
                    } else {
                        if (run > 0 && drop > 2) runLens.push(run);
                        runStart = i;
                        run = 0;
                        drop = 0;
                    }
                    void runStart;
                    prevY = y;
                }
                if (run > 0 && drop > 2) runLens.push(run);
            }
        }
        runLens.sort((x, y) => x - y);
        const rpct = (p) => (runLens.length ? runLens[Math.floor((runLens.length - 1) * p)] : 0);

        return {
            edgeTotal,
            edgeDrop,
            steep60,
            vert75,
            slopeP50: pct(0.5),
            slopeP90: pct(0.9),
            slopeMax: pct(1),
            runN: runLens.length,
            runP50: rpct(0.5),
            runP90: rpct(0.9),
            runMax: rpct(1),
            step,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n=== WASSER-AUSLAUF-NEIGUNG (Geometrie, headless) ===");
    console.log(`Mesh-Kanten gesamt: ${out.edgeTotal}, davon mit echtem Drop (>0.5 m): ${out.edgeDrop}`);
    console.log(`\n(A) AUSLAUF-NEIGUNG (Grad, nur Drop-Kanten):`);
    console.log(`    p50/p90/max = ${out.slopeP50}° / ${out.slopeP90}° / ${out.slopeMax}°`);
    console.log(
        `    steil (>60°): ${out.steep60} (${out.edgeDrop ? ((100 * out.steep60) / out.edgeDrop).toFixed(1) : "—"}%)  ·  fast vertikal (>75°): ${out.vert75} (${out.edgeDrop ? ((100 * out.vert75) / out.edgeDrop).toFixed(1) : "—"}%)`
    );
    console.log(
        `\n(B) ÜBERGANGS-BREITE (Zellen à ${out.step.toFixed(1)} m, fallende Ketten >2 m Drop, n=${out.runN}):`
    );
    console.log(`    p50/p90/max = ${out.runP50} / ${out.runP90} / ${out.runMax} Zellen`);
    console.log(`    (1 Zelle = kantig/~76°; >3 Zellen = fluidischer Auslauf)\n`);
    process.exit(0);
})();

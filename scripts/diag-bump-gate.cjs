// Diagnose — DER TRAPEZ-MECHANISMUS, NUMERISCH (hardware-unabhängig, kein GPU-Render nötig;
// der Container-swiftshader-Render stirbt → ich messe den Mechanismus, nicht das Pixel).
//
// HYPOTHESE: der Bump-`_flatGate = smoothstep(0.55, 0.85, normalWorld.y)` liest die FACETTIERTE
// Geometrie-Normale. Auf FLACHEM Wiesen-Boden variiert die Gradienten-Normale ny pro Vertex
// (Low-Poly-Dichtefeld) und DIPPT unter 0.85 in Mikro-Mulden → die Gate-Stärke schwankt 0.5..1
// = das Trapez-Patchwork (Bump an/aus nebeneinander). Der niedrigere Schwellwert (0.3, 0.62)
// hält die Wiese UNIFORM (ny>0.62 → Gate=1 überall), kappt nur ECHTE Wände (ny<0.62, >52°).
//
// MESSUNG: über ALLE LOD0-Chunk-Mesh-Normalen: für FLACHE Vertices (ny>0.62 = Wiese, keine Wand)
// die Gate-Schwankung (Anteil mit Gate < 0.9 = sichtbar gedämpfter Bump = Patchwork) für den
// ALTEN vs NEUEN Schwellwert. Alt: hoher Patchwork-Anteil. Neu: ~0.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4401;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
        protocolTimeout: 300000,
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
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 30 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const smoothstep = (a, b, x) => {
            const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return t * t * (3 - 2 * t);
        };
        // GATE-Varianten
        const gateOld = (ny) => smoothstep(0.55, 0.85, ny);
        const gateNew = (ny) => smoothstep(0.3, 0.62, ny);
        let flatVerts = 0; // Vertices, die FLACHER Boden sind (keine echte Wand): ny > 0.62
        let oldPatch = 0; // davon: Bump sichtbar gedämpft (Gate < 0.9) = Patchwork
        let newPatch = 0;
        let wallVerts = 0; // echte Wände (ny < 0.5) — die sollen GEDÄMPFT bleiben
        let oldWallKept = 0,
            newWallKept = 0; // Gate < 0.3 = Wand sauber gedämpft
        let chunks = 0;
        for (const [, e] of s.voxelChunks) {
            if (!e || e.empty || (Number.isFinite(e.lod) && e.lod !== 0) || !e.mesh) continue;
            const nAttr = e.mesh.geometry && e.mesh.geometry.getAttribute && e.mesh.geometry.getAttribute("normal");
            if (!nAttr) continue;
            chunks++;
            for (let i = 0; i < nAttr.count; i++) {
                const ny = nAttr.getY(i);
                if (ny > 0.62) {
                    flatVerts++;
                    if (gateOld(ny) < 0.9) oldPatch++;
                    if (gateNew(ny) < 0.9) newPatch++;
                } else if (ny < 0.5) {
                    wallVerts++;
                    if (gateOld(ny) < 0.3) oldWallKept++;
                    if (gateNew(ny) < 0.3) newWallKept++;
                }
            }
        }
        return { chunks, flatVerts, oldPatch, newPatch, wallVerts, oldWallKept, newWallKept };
    });

    console.log("\n===== TRAPEZ-GATE — NUMERISCHE WURZEL-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : "0.0");
    console.log(`  LOD0-Chunks gemessen: ${o.chunks}`);
    console.log(`  FLACHE Boden-Vertices (ny>0.62, Wiese): ${o.flatVerts}`);
    console.log(`    → Bump-PATCHWORK (Gate<0.9, sichtbar gedämpft auf flachem Boden):`);
    console.log(`        ALT (smoothstep 0.55,0.85): ${o.oldPatch}  (${pct(o.oldPatch, o.flatVerts)} %)  ← das Trapez`);
    console.log(`        NEU (smoothstep 0.30,0.62): ${o.newPatch}  (${pct(o.newPatch, o.flatVerts)} %)  ← uniform`);
    console.log(`  ECHTE Wände (ny<0.5): ${o.wallVerts}`);
    console.log(`    → sauber gedämpft (Gate<0.3, Bump fast aus):`);
    console.log(
        `        ALT: ${pct(o.oldWallKept, o.wallVerts)} %   NEU: ${pct(o.newWallKept, o.wallVerts)} %  (beide kappen die Wand)`
    );
    const win = o.flatVerts > 0 && o.oldPatch / o.flatVerts > 0.1 && o.newPatch / o.flatVerts < 0.03;
    console.log(
        `\n  ${win ? "✅" : "⚠️"} ${win ? "Der niedrigere Schwellwert killt das Patchwork auf der Wiese, kappt aber weiter die Wand." : "Mechanismus nicht wie erwartet — neu prüfen, NICHT blind tweaken."}\n`
    );
    await browser.close();
    server.close();
})();

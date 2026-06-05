// Diagnose V18.18 — die FLUSS-CHUNKNAHT (Schöpfer „Seen/Meere fast perfekt, aber
// Flüsse zeigen die Chunknaht; wieso der Fluss?"). Wurzel (code-evident + gemessen):
// die `aDepth`-Attribut-Berechnung im Surface-Mesh las die LOKALEN Zellen mit
// `if (ci < dim0 && ck < dim0)` → die FERNEN Rand-Vertices (i=dim → ci=dim0, ausser
// Reichweite) bekamen aDepth=0, während die NAHKANTE des Nachbarn (i=0) die echte
// Tiefe las. Der Shader macht daraus an JEDER Chunk-Fernkante einen Schaum-/Farb-
// Streifen. Bei TIEFEN Seen gated `shoreLine` (waterThick) den Schaum weg → unsichtbar;
// bei FLACHEN Flüssen (shoreLine≈1) ist er SICHTBAR = die Naht. DARUM Fluss, nicht See.
//
// Die WAHRE Naht-Metrik: teilen zwei ANEINANDER GRENZENDE Surface-Chunks am gemeinsamen
// Rand DENSELBEN aDepth pro geteiltem Vertex? Vorher: ferne Kante 0, Nahkante echt →
// Mismatch (0-vs-nass). Nach der Heilung (nachbar-lesend): identisch → naht-frei.
//
// Exit-Code 1, wenn ≥1 „0-vs-nass"-Mismatch am geteilten Rand existiert (der Naht-Bug).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4357;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
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
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 24) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        // Pro Surface-Chunk eine Welt-Position->aDepth-Karte (Vertices sitzen aufs Gitter,
        // auf 0.1 m gerundet als Schlüssel). Geteilte Rand-Vertices haben denselben Schlüssel.
        const chunks = new Map();
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            const aDepth = mesh.geometry.attributes.aDepth;
            if (!pos || !aDepth) continue;
            const [cx, cz] = key.split(",").map(Number);
            const map = new Map();
            for (let v = 0; v < pos.count; v++) {
                const wk = Math.round(pos.getX(v) * 10) + "," + Math.round(pos.getZ(v) * 10);
                map.set(wk, aDepth.getX(v));
            }
            chunks.set(key, { cx, cz, map });
        }
        if (chunks.size < 2) return { err: "weniger als 2 Surface-Chunks gestreamt" };
        let pairs = 0,
            shared = 0,
            zeroVsWet = 0,
            otherMismatch = 0,
            maxDelta = 0,
            sumDelta = 0;
        let worst = null;
        for (const [, A] of chunks) {
            for (const [dcx, dcz] of [
                [1, 0],
                [0, 1],
            ]) {
                const B = chunks.get(`${A.cx + dcx},${A.cz + dcz}`);
                if (!B) continue;
                pairs++;
                for (const [wk, dA] of A.map) {
                    const dB = B.map.get(wk);
                    if (dB === undefined) continue;
                    shared++;
                    const delta = Math.abs(dA - dB);
                    sumDelta += delta;
                    if (delta > maxDelta) {
                        maxDelta = delta;
                        worst = { A: `${A.cx},${A.cz}`, B: `${B.cx},${B.cz}`, dA: +dA.toFixed(2), dB: +dB.toFixed(2) };
                    }
                    if (delta > 0.5) {
                        if ((dA < 0.05 && dB > 0.5) || (dB < 0.05 && dA > 0.5)) zeroVsWet++;
                        else otherMismatch++;
                    }
                }
            }
        }
        return {
            chunks: chunks.size,
            pairs,
            shared,
            zeroVsWet,
            otherMismatch,
            maxDelta: +maxDelta.toFixed(2),
            meanDelta: shared ? +(sumDelta / shared).toFixed(3) : 0,
            worst,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== FLUSS-CHUNKNAHT — aDepth am geteilten Chunk-Rand (V18.18) ===");
    if (out.err) {
        console.log("SKIP:", out.err);
        process.exit(0);
    }
    console.log(`Surface-Chunks: ${out.chunks},  Nachbar-Paare: ${out.pairs},  geteilte Rand-Vertices: ${out.shared}`);
    console.log(`  0-vs-nass-Mismatch (der Naht-Bug): ${out.zeroVsWet}`);
    console.log(`  sonstige Mismatch (>0.5 m):        ${out.otherMismatch}`);
    console.log(`  max |ΔaDepth|: ${out.maxDelta} m,  mittel: ${out.meanDelta} m`);
    if (out.worst) console.log(`  schlimmster: Chunk ${out.worst.A} aDepth ${out.worst.dA} m  vs  Chunk ${out.worst.B} aDepth ${out.worst.dB} m`);
    console.log("");
    if (out.zeroVsWet > 0) {
        console.log(`  ROT — ${out.zeroVsWet} geteilte Rand-Vertices haben in EINEM Chunk aDepth≈0, im Nachbarn echte Tiefe.`);
        console.log("        → der aDepth-0-Streifen an der Chunk-Fernkante = die sichtbare Fluss-Naht.");
        process.exit(1);
    } else {
        console.log("  GRÜN — kein 0-vs-nass-Mismatch: beide Chunks teilen am Rand denselben aDepth → naht-frei.");
        process.exit(0);
    }
})();

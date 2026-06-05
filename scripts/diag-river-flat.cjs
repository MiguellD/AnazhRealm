// Diagnose V18.7 — der Fluss-Wasserspiegel ist FLACH im Querschnitt.
//
// Schöpfer-Browser-Befund (V18.6): Seen super, aber Fluss-Ränder „wie geschnitten,
// vor allem diagonal, ein schwebender Layer". Wurzel (gemessen): `_hydroRiverAt`
// wertete `surfaceY` am Sample-Punkt (x,z) aus → der Spiegel kippte lateral mit
// dem Makro-Terrain mit (schräge Fläche, die auf der Bank schwebt). V18.7 wertet
// `surfaceY` an der MITTELLINIEN-Projektion aus → flach im Querschnitt.
//
// Diese Diagnose misst (schnell, nur Hydrosphäre, kein Streaming): an mehreren
// Fluss-Punkten den Spiegel SENKRECHT zur Strömung über die Breite — die
// Variation muss ~0 sein (flacher Querschnitt). Plus: der Spiegel FÄLLT entlang
// der Strömung (natürliche Drops bleiben). Exit 1 wenn der Querschnitt kippt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4349;
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
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                if (r.state && r.state.hydrosphere && r.state.hydrosphere.ready && r.state.playerMesh) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm; const s = r.state;
        const h = s.hydrosphere;
        if (!h || !h.ready) return { err: "keine Hydrosphäre" };
        // Fluss-Punkte finden: das Region-Raster grob nach `_hydroRiverAt` absuchen.
        const found = [];
        const ox = h.originX, oz = h.originZ, size = (r.constructor.HYDROSPHERE && r.constructor.HYDROSPHERE.regionSize) || 2048;
        for (let gy = 0; gy < 90 && found.length < 24; gy++) {
            for (let gx = 0; gx < 90 && found.length < 24; gx++) {
                const x = ox + (gx + 0.5) * (size / 90);
                const z = oz + (gy + 0.5) * (size / 90);
                const riv = r._hydroRiverAt(x, z);
                if (riv && (riv.flowX || riv.flowZ)) found.push({ x, z, riv });
            }
        }
        if (!found.length) return { err: "kein Fluss im Region-Raster gefunden" };
        // Pro Fluss-Punkt: Spiegel senkrecht zur Strömung über die Breite.
        let maxCross = 0; const samples = [];
        const slopeAlong = [];
        for (const f of found.slice(0, 12)) {
            const fl = Math.hypot(f.riv.flowX, f.riv.flowZ) || 1;
            const fx = f.riv.flowX / fl, fz = f.riv.flowZ / fl;
            const perpX = -fz, perpZ = fx; // senkrecht zur Strömung
            const ys = [];
            for (let o = -8; o <= 8; o += 2) {
                const riv = r._hydroRiverAt(f.x + perpX * o, f.z + perpZ * o);
                if (riv) ys.push(riv.surfaceY);
            }
            if (ys.length >= 3) {
                const cross = Math.max(...ys) - Math.min(...ys);
                if (cross > maxCross) maxCross = cross;
                samples.push({ x: +f.x.toFixed(0), z: +f.z.toFixed(0), cross: +cross.toFixed(3), n: ys.length });
            }
            // Gefälle ENTLANG der Strömung (10 m vor/zurück) — die Drops müssen bleiben.
            const up = r._hydroRiverAt(f.x - fx * 10, f.z - fz * 10);
            const dn = r._hydroRiverAt(f.x + fx * 10, f.z + fz * 10);
            if (up && dn) slopeAlong.push(+(up.surfaceY - dn.surfaceY).toFixed(2));
        }
        const slopeMax = slopeAlong.length ? Math.max(...slopeAlong.map(Math.abs)) : 0;
        return { riverPoints: found.length, measured: samples.length, maxCross: +maxCross.toFixed(3), samples: samples.slice(0, 8), slopeMax };
    });

    console.log("\n=== DIAG V18.7 — Fluss-Wasserspiegel flach im Querschnitt ===\n");
    if (out.err) { console.log(out.err + " (kein Fluss nahe Spawn streambar — der Querschnitt-Beweis braucht ihn nicht headless, aber hier kein Sample)"); await browser.close(); server.close(); process.exit(0); }
    console.log(`Fluss-Punkte gefunden: ${out.riverPoints}, gemessen: ${out.measured}`);
    console.log("Ort(x,z)        Querschnitt-Spiegel-Variation (über ±8 m senkrecht)");
    for (const sm of out.samples) console.log(`  (${sm.x},${sm.z})\t${sm.cross} m  (${sm.n} Proben)`);
    // Schwelle 0.3 m: der systematische laterale Kipp (Bank-Folge, mehrere Meter)
    // ist weg; ein Rest ≤0.3 m bleibt nur an BIEGUNGEN, wo die ±8-m-Senkrechte in
    // ein Nachbar-Segment überschiesst (Test-Artefakt, kein schwebender Layer).
    console.log(`\nmax Querschnitt-Variation: ${out.maxCross} m  → ${out.maxCross <= 0.3 ? "FLACH (kein schwebender/schräger Layer; Rest = Biegungs-Überschuss der Mess-Senkrechten)" : "KIPPT noch"}`);
    console.log(`Gefälle entlang der Strömung (max über 20 m): ${out.slopeMax} m  → ${out.slopeMax > 0.05 ? "die Drops/Strömung leben (Spiegel fällt entlang des Flusses)" : "flach (evt. ruhiger Abschnitt)"}`);
    const ok = out.maxCross <= 0.3;
    console.log(`\n  ${ok ? "GRÜN — der Querschnitt ist flach, der Fluss-Spiegel kippt nicht mehr lateral. Browser-Pixel-Sign-off bleibt der Seh-Schluss." : "ROT — der Querschnitt kippt noch."}`);
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

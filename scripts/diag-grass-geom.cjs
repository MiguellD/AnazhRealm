#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-grass-geom.cjs — DIE WIESEN-GEOMETRIE-LINSE (V18.390 Eins W5, GPU-frei)
//
// Die gemessene Wurzel des „sieht alt aus"-Befunds (docs/analyse/diff-A2): das
// Gras war 6× zu dünn (~4.5 Halme/m² durch den 1400-Cap statt der Vorlagen-27),
// STEIF (bend=lean·t², kaum Bogen), zu HOCH (0.5-1.95 m statt 0.1-0.4 m Teppich)
// und ohne Ähren/Rispen. W5 hebt den Cap-Deckel (Gesetz #0: EINE Quelle
// GRASS_MAX_BLADES=3200, der Regler ist der Look-Deckel) + baut die Halm-Geometrie
// auf den Euler-Kragträger-Bogen (K=3, droop 0.45-1.35 + Gravitropismus) + Rispen.
//
// Diese Linse beweist headless (Null-Renderer, ~9 s):
//   (a) Halm-Dichte im lush Chunk (voller Regler) ≥ 20/m²  (4.5 → ~20.6)
//   (b) der Halm ist GEBOGEN (Tip-Auslenkung > 0.15 × Höhe — der Euler-Bogen)
//   (c) Welt-Höhe 0.1-0.4 m (Teppich, nicht Steppe)
//   (d) Rispen/Ähren-Spitzen präsent (culmCount > 0)
// + der EHRLICHE Perf-Readout: renderTris der Gras-Schicht vorher → nachher.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4338;
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
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 120; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const st = r.state;
            const o = {};
            const cfg = r._voxelChunkConfig();
            const span = cfg.span;
            o.span = span;
            const area = span * span;

            // Einen GARANTIERT lushen Chunk bauen (deterministisch, biom-unabhängig): die Feld-Leser
            // kurz auf „volle Lichtung" patchen → count läuft an den Cap (die ehrliche cap-limitierte
            // Dichte), Höhe/Bogen aus der geteilten Tuff-Geometrie. Danach sauber restaurieren.
            const save = {
                wf: r.worldFieldAt,
                wl: r._waterLevelAt,
                sl: r._slopeAt,
                pf: r._pathFieldAt,
                fe: r._feuchteAt,
                cl: r._canopyLightAt,
                cm: r._clumpAt,
                fds: st._foliageDensityScale,
            };
            r.worldFieldAt = () => ({ lebendig: 1, dichte: 0.5, glut: 0, magieleitung: 0 });
            r._waterLevelAt = () => -1000;
            r._slopeAt = () => 0;
            r._pathFieldAt = () => 0;
            r._feuchteAt = () => 0.5;
            r._canopyLightAt = () => 1;
            r._clumpAt = () => 0;
            st._foliageDensityScale = 1; // voller Regler (gate-treu; headless ist eh 1)
            const LX = 9997;
            const LZ = 9997;
            if (st.voxelChunkGrass) st.voxelChunkGrass.delete(`${LX},${LZ}`);
            r._buildVoxelChunkGrass(LX, LZ);
            const inst = st.voxelChunkGrass ? st.voxelChunkGrass.get(`${LX},${LZ}`) : null;
            // Restaurieren, BEVOR wir messen (die Messung liest nur inst + die Geometrie).
            r.worldFieldAt = save.wf;
            r._waterLevelAt = save.wl;
            r._slopeAt = save.sl;
            r._pathFieldAt = save.pf;
            r._feuchteAt = save.fe;
            r._canopyLightAt = save.cl;
            r._clumpAt = save.cm;
            st._foliageDensityScale = save.fds;

            const geo = st._grassConeGeometry;
            o.hasGeo = !!geo;
            o.hasInst = !!inst && inst.isInstancedMesh;
            if (!geo || !inst) return o;
            const ud = geo.userData || {};
            o.tuftBlades = ud.tuftBlades;
            o.culmCount = ud.culmCount;
            o.localMaxY = ud.localMaxY;
            o.maxTipBendRatio = ud.maxTipBendRatio;
            o.vertCount = ud.vertCount;
            o.trisPerTuft = ud.vertCount ? Math.round(ud.vertCount / 3) : 0;

            // (a) Halm-Dichte: Tuffs × Halme/Tuff / Fläche.
            const tufts = inst.count || 0;
            o.tufts = tufts;
            o.cap = r.constructor.GRASS_MAX_BLADES;
            o.bladesPerM2 = +((tufts * (ud.tuftBlades || 0)) / area).toFixed(2);

            // (c) Welt-Höhe: localMaxY × per-Instanz-scale.y (aus der instanceMatrix, keine THREE-Deko).
            const arr = inst.instanceMatrix ? inst.instanceMatrix.array : null;
            const heights = [];
            if (arr) {
                for (let i = 0; i < tufts; i++) {
                    const b = i * 16;
                    const sy = Math.hypot(arr[b + 4], arr[b + 5], arr[b + 6]);
                    heights.push((ud.localMaxY || 0) * sy);
                }
            }
            heights.sort((a, b) => a - b);
            const q = (f) =>
                heights.length ? heights[Math.min(heights.length - 1, Math.floor(f * heights.length))] : 0;
            o.heightMin = heights.length ? +heights[0].toFixed(3) : 0;
            o.heightMedian = +q(0.5).toFixed(3);
            o.heightP95 = +q(0.95).toFixed(3);
            o.heightMax = heights.length ? +heights[heights.length - 1].toFixed(3) : 0;

            // Perf-Readout: die Gras-Tri-Last dieses vollen Chunks (nachher) vs. der alte Stand (1400 × 24).
            o.grassTrisAfter = tufts * o.trisPerTuft;
            o.grassTrisBefore = 1400 * 24; // V18.232-Stand: Cap 1400 × 6 Blätter × SEG2 (4 Tris) = 24 Tris/Tuff
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Wiesen-Geometrie-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    console.log("\n=== DIE WIESE (Eins W5) — der Vorlagen-Gras-Teppich, gemessen ===");
    console.log(
        `  Chunk-Span ${out.span} m · Fläche ${(out.span * out.span).toFixed(0)} m² · Cap ${out.cap} Tuffs · ${out.tuftBlades} Halme/Tuff (${out.culmCount} Rispen)`
    );
    console.log(
        `  Tuffs ${out.tufts} · lokale Halm-Höhe ${out.localMaxY} m · Tris/Tuff ${out.trisPerTuft} (${out.vertCount} Verts)`
    );
    console.log(
        `  Perf (Gras-Tris, voller Regler): vorher ${out.grassTrisBefore} → nachher ${out.grassTrisAfter} (×${(out.grassTrisAfter / out.grassTrisBefore).toFixed(1)}; der Regler _foliageDensityScale + _tickGrassThin lichten adaptiv)`
    );

    const checks = [
        {
            name: `(a) Halm-Dichte im lush Chunk ${out.bladesPerM2}/m² ≥ 20 (Vorlage ~27; vorher ~4.5)`,
            pass: out.bladesPerM2 >= 20,
        },
        {
            name: `(b) Halm GEBOGEN — Tip-Auslenkung/Höhe ${out.maxTipBendRatio} > 0.15 (Euler-Kragträger-Bogen)`,
            pass: out.maxTipBendRatio > 0.15,
        },
        {
            name: `(c) Welt-Höhe Teppich: Median ${out.heightMedian} m ∈ [0.1, 0.4], Max ${out.heightMax} m ≤ 0.5 (nass fetter)`,
            pass: out.heightMedian >= 0.1 && out.heightMedian <= 0.4 && out.heightMax <= 0.5,
        },
        {
            name: `(d) Rispen/Ähren-Spitzen präsent (culmCount ${out.culmCount} > 0)`,
            pass: (out.culmCount || 0) > 0,
        },
    ];
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Wiesen-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die Wiese trägt den Vorlagen-Teppich noch nicht.");
        process.exit(1);
    }
    console.log("GRAS-GEOM OK");
    process.exit(0);
})();

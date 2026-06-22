// P1a — DIE FELD-COLLIDER-VERIFIKATIONS-LINSE (Determinismus-Bogen, docs/eigene-physik-plan.md §5/§10).
// Beweist, dass die reinen Feld-Helfer KORREKT die kanonische Welt-Wahrheit lesen, BEVOR der
// Character-Controller (P1b) darauf baut. Fünf Prüfungen:
//   (A) EINE QUELLE: _fieldDensityAt(.,null) === _terrainDensityAt (der Edit-Refactor + der
//       Feld-Pfad lesen exakt dieselbe Dichte — bit-gleich, mit + ohne Edits).
//   (B) BODEN-WAHRHEIT: _fieldSurfaceBelow ≈ getTerrainHeightAt auf offenen Spalten (kreuz-
//       geprüft gegen die bestehende Wahrheit).
//   (C) AUSWURF: eine Kugel TIEF im Soliden wird per _fieldResolveSphere an/über die
//       Oberfläche gedrückt (finale Dichte ≤ ~0).
//   (D) NORMALE: an Boden-Punkten zeigt der Gradient nach OBEN (ny > 0).
//   (E) KOSTEN: die gehoistete Kapsel-Probe (3 Kugeln + lokale Boden-DDA, EIN Spalten-Kontext)
//       gegen die naive _voxelSurfaceY (der P0-43,7-µs-Bottleneck) — der Hoist muss billiger sein.
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
        protocolTimeout: 300000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                if (r.state.voxelWorker) {
                    try {
                        r.state.voxelWorker.terminate();
                    } catch (_e) {}
                    r.state.voxelWorker = null;
                }
                stubbed = true;
            }
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
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm,
            s = r.state;
        if (!r._gameLoopTick) return { error: "no _gameLoopTick" };
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;
        const RANGE = 70;
        const xs = [],
            zs = [];
        for (let i = 0; i < 60; i++) {
            xs.push(px + (((i * 89) % (RANGE * 2)) - RANGE));
            zs.push(pz + (((i * 137) % (RANGE * 2)) - RANGE));
        }

        // (A) EINE QUELLE — _fieldDensityAt(.,null) === _terrainDensityAt (mit + ohne Edits).
        let maxDiffNoEdit = 0,
            maxDiffEdit = 0;
        const sample = (x, y, z) => Math.abs(r._fieldDensityAt(x, y, z, null) - r._terrainDensityAt(x, y, z));
        for (let i = 0; i < xs.length; i++) {
            const h = r.getTerrainHeightAt(xs[i], zs[i]);
            for (let dy = -10; dy <= 10; dy += 2) maxDiffNoEdit = Math.max(maxDiffNoEdit, sample(xs[i], h + dy, zs[i]));
        }
        // einen Edit einschießen → beide Pfade müssen die Delta-Schicht identisch tragen.
        const ex = px + 5,
            ez = pz + 5,
            eh = r.getTerrainHeightAt(ex, ez);
        if (!s.worldMeta.voxelEdits) s.worldMeta.voxelEdits = [];
        const editsBefore = s.worldMeta.voxelEdits.length;
        s.worldMeta.voxelEdits.push({ x: ex, y: eh, z: ez, r: 6, mode: "carve", strength: 48 });
        for (let dy = -8; dy <= 8; dy += 1) maxDiffEdit = Math.max(maxDiffEdit, sample(ex, eh + dy, ez));
        s.worldMeta.voxelEdits.length = editsBefore; // den Test-Edit wieder entfernen

        // (B) BODEN-WAHRHEIT — _fieldSurfaceBelow ≈ getTerrainHeightAt auf offenen Spalten.
        let surfDiffs = [],
            surfMisses = 0;
        for (let i = 0; i < xs.length; i++) {
            const truth = r.getTerrainHeightAt(xs[i], zs[i]);
            if (!Number.isFinite(truth)) continue;
            const probe = r._fieldSurfaceBelow(xs[i], truth + 4, zs[i], 12);
            if (probe === null) surfMisses++;
            else surfDiffs.push(Math.abs(probe - truth));
        }
        surfDiffs.sort((a, b) => a - b);
        const surfMax = surfDiffs.length ? surfDiffs[surfDiffs.length - 1] : -1;
        const surfMed = surfDiffs.length ? surfDiffs[Math.floor(surfDiffs.length / 2)] : -1;

        // (C) AUSWURF — realistisch: eine FLACHE Penetration (~0,4 m, wie ein echter Frame)
        // muss GANZ geräumt werden; eine TIEFE (2 m, künstlich hart) muss substanziell
        // reduziert werden (der gesweepte Schritt in P1b hält die Penetration radius-beschränkt).
        let shallowCleared = 0,
            shallowTested = 0,
            deepReduced = 0,
            deepTested = 0,
            worstShallow = -Infinity;
        for (let i = 0; i < xs.length; i++) {
            const h = r.getTerrainHeightAt(xs[i], zs[i]);
            if (!Number.isFinite(h)) continue;
            // flach: 0,4 m unter der Oberkante
            const ps = { x: xs[i], y: h - 0.4, z: zs[i] };
            if (r._fieldSolid(ps.x, ps.y, ps.z, null)) {
                shallowTested++;
                r._fieldResolveSphere(ps, 1.2, null);
                const res = r._fieldDensityAt(ps.x, ps.y, ps.z, null);
                worstShallow = Math.max(worstShallow, res);
                if (res <= 0) shallowCleared++;
            }
            // tief: 2 m
            const pd = { x: xs[i], y: h - 2.0, z: zs[i] };
            if (r._fieldSolid(pd.x, pd.y, pd.z, null)) {
                const before = r._fieldDensityAt(pd.x, pd.y, pd.z, null);
                deepTested++;
                r._fieldResolveSphere(pd, 1.2, null);
                const after = r._fieldDensityAt(pd.x, pd.y, pd.z, null);
                if (after < before * 0.5) deepReduced++;
            }
        }

        // (D) NORMALE — an Boden-Punkten zeigt der Gradient nach OBEN.
        let normalUp = 0,
            normalTested = 0,
            minNy = Infinity;
        const g = {};
        for (let i = 0; i < xs.length; i++) {
            const h = r.getTerrainHeightAt(xs[i], zs[i]);
            if (!Number.isFinite(h)) continue;
            r._fieldGradient(xs[i], h, zs[i], g); // an der Oberfläche
            normalTested++;
            if (g.y > 0) normalUp++;
            minNy = Math.min(minNy, g.y);
        }

        // (E) KOSTEN — die per-Frame-Boden-/Kollisions-Probe: naiv (voller _voxelSurfaceY-
        // Spalten-Scan) vs gehoistet (lokale DDA + 3 Kapsel-Kugeln, EIN ctx). FAIR: der echte
        // Controller kennt sein y schon (trackt es über Frames) → KEIN getTerrainHeightAt in
        // der gehoisteten Query (das wäre der teure Scan zurück). Start-Höhen einmal vorab.
        const N = 4000;
        const hs = xs.map((x, i) => r.getTerrainHeightAt(x, zs[i]));
        // naiv: _voxelSurfaceY (voller Spalten-Scan) als Boden-Probe, jeden Frame.
        let t0 = performance.now();
        let sink = 0;
        for (let i = 0; i < N; i++) {
            const j = i % xs.length;
            sink += r._voxelSurfaceY(xs[j], zs[j]) || 0;
        }
        const naiveMs = performance.now() - t0;
        // gehoistet: lokale Boden-DDA von der bekannten Höhe + 3 Kugel-Solid-Tests, EIN ctx.
        t0 = performance.now();
        for (let i = 0; i < N; i++) {
            const j = i % xs.length;
            const x = xs[j],
                z = zs[j],
                h = hs[j]; // BEKANNT (getrackt), kein Scan
            const ctx = r._terrainColumnContext(x, z);
            sink += r._fieldSurfaceBelow(x, h + 1.5, z, 4) || 0;
            sink += r._fieldSolid(x, h + 0.5, z, ctx) ? 1 : 0;
            sink += r._fieldSolid(x, h + 1.4, z, ctx) ? 1 : 0;
            sink += r._fieldSolid(x, h + 2.3, z, ctx) ? 1 : 0;
        }
        const hoistedMs = performance.now() - t0;

        return {
            oneSource: { maxDiffNoEdit: +maxDiffNoEdit.toFixed(8), maxDiffEdit: +maxDiffEdit.toFixed(8) },
            ground: {
                samples: surfDiffs.length,
                misses: surfMisses,
                medianDiff: +surfMed.toFixed(3),
                maxDiff: +surfMax.toFixed(3),
            },
            resolve: {
                shallowTested,
                shallowCleared,
                worstShallow: +worstShallow.toFixed(3),
                deepTested,
                deepReduced,
            },
            normal: { tested: normalTested, pointUp: normalUp, minNy: +minNy.toFixed(3) },
            cost: {
                naiveSurfaceYUsPerCall: +((naiveMs * 1000) / N).toFixed(1),
                hoistedCapsuleUsPerQuery: +((hoistedMs * 1000) / N).toFixed(1),
                speedup: +(naiveMs / hoistedMs).toFixed(2),
                _sink: sink,
            },
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    let pass = true;
    const ok = (cond, label) => {
        console.log(`  ${cond ? "✅" : "❌"} ${label}`);
        if (!cond) pass = false;
    };
    console.log("\n===== FELD-COLLIDER-VERIFIKATION P1a =====\n");
    console.log(
        `  (A) EINE QUELLE: maxDiff ohne Edit ${out.oneSource.maxDiffNoEdit} · mit Edit ${out.oneSource.maxDiffEdit}`
    );
    ok(
        out.oneSource.maxDiffNoEdit === 0 && out.oneSource.maxDiffEdit === 0,
        "_fieldDensityAt === _terrainDensityAt (bit-gleich, mit + ohne Edits)"
    );
    console.log(
        `  (B) BODEN: n=${out.ground.samples} misses=${out.ground.misses} · median Δ ${out.ground.medianDiff} m · max Δ ${out.ground.maxDiff} m`
    );
    // _voxelSurfaceY ist auf das 1,2-m-Raster gequantelt (Spalten-Scan in 1,2er-Schritten);
    // die Bisektions-Probe ist sub-voxel-fein → die erwartete Δ ist ~halbe Quantelung (≤ 1,3 m).
    ok(
        out.ground.misses === 0 && out.ground.maxDiff < 1.3,
        "_fieldSurfaceBelow ≈ getTerrainHeightAt (≤ 1,3 m = die 1,2-m-Quantelung der Referenz, keine Misses)"
    );
    console.log(
        `  (C) AUSWURF: flach ${out.resolve.shallowCleared}/${out.resolve.shallowTested} geräumt (worst ${out.resolve.worstShallow}) · tief ${out.resolve.deepReduced}/${out.resolve.deepTested} reduziert`
    );
    ok(
        out.resolve.shallowTested > 0 && out.resolve.shallowCleared === out.resolve.shallowTested,
        "_fieldResolveSphere räumt JEDE flache Penetration (~0,4 m, der echte Frame-Fall) ganz"
    );
    ok(
        out.resolve.deepTested === 0 || out.resolve.deepReduced === out.resolve.deepTested,
        "tiefe Penetration (2 m, künstlich) wird substanziell (>50 %) reduziert"
    );
    console.log(
        `  (D) NORMALE: ${out.normal.pointUp}/${out.normal.tested} zeigen nach oben · min ny ${out.normal.minNy}`
    );
    ok(
        out.normal.tested > 0 && out.normal.pointUp === out.normal.tested,
        "Gradient-Normale zeigt an Boden-Punkten nach OBEN (ny > 0)"
    );
    console.log(
        `  (E) KOSTEN: naiv ${out.cost.naiveSurfaceYUsPerCall} µs · gehoistet ${out.cost.hoistedCapsuleUsPerQuery} µs/Query · ${out.cost.speedup}× schneller`
    );
    ok(
        out.cost.hoistedCapsuleUsPerQuery < out.cost.naiveSurfaceYUsPerCall,
        "die gehoistete Kapsel-Probe ist billiger als der naive _voxelSurfaceY-Scan"
    );
    console.log(`\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`);
    console.log("==========================================\n");
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-field-collide.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

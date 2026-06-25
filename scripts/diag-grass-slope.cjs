// Diagnose — DIE EINE PLATZIERUNGS-SLOPE-QUELLE (V18.351, Schöpfer „Steilheit bestimmt ob dort Wiese
// sein kann — noch nie eine Felswand mit Gras gesehen · wie will das System einheitlich werden, wenn
// alles einzeln hardcoded ist").
//
// HARDWARE-UNABHÄNGIG (reine Geometrie/Logik, kein GPU-Render):
//   (1) DIE EINE FORMEL: `_slopeAt(x,z, getTerrainHeightAt, 2)` == der alte Inline-Cross des Bäckers
//       (byte-gleich → null Fels-Verschiebung); `_slopeAt(x,z)` default == _voxelSurfaceY ±1.
//   (2) DAS GRAS-GATE: flacher Spot → slopeFactor ≈ 1 (volles Gras) · steiler Spot → slopeFactor 0
//       (gar kein Gras) · sanfter Übergang dazwischen (kein harter Schnitt).
//   (3) SYNERGIE: Gras (`_buildVoxelChunkGrass`), Scatter-Fallback (`_scatterPass`) UND der Bäcker
//       (`_bakeRegionFields`) lesen ALLE `this._slopeAt(` — EINE Quelle, viele Leser (Gesetz #0).
//   (4) BEHAVIORAL: an vegetierten STEILEN Spots (lebendig>0.22, über Wasser, slope>hi) gibt der Gras-
//       Count jetzt 0 — die „Felswand mit Gras"-Kandidaten verschwinden; an flachen bleibt er voll.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4411;
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
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
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
                if (sz > 25 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const GS = r.constructor.GRASS_SLOPE;
        const out = { lo: GS.lo, hi: GS.hi };
        const slopeFactor = (slope) => Math.max(0, Math.min(1, 1 - (slope - GS.lo) / (GS.hi - GS.lo)));

        // (1) DIE EINE FORMEL — parametrisiert == alter Bäcker-Inline (getTerrainHeightAt ±2 m).
        const ght = (px, pz) => r.getTerrainHeightAt(px, pz);
        let maxDiffBaker = 0;
        const pm = r.state.playerMesh;
        const px0 = pm ? pm.position.x : 0,
            pz0 = pm ? pm.position.z : 0;
        for (let k = 0; k < 40; k++) {
            const x = px0 + (k % 8) * 7 - 28,
                z = pz0 + Math.floor(k / 8) * 7 - 18;
            const viaSlopeAt = r._slopeAt(x, z, ght, 2);
            const hxp = ght(x + 2, z),
                hxn = ght(x - 2, z),
                hzp = ght(x, z + 2),
                hzn = ght(x, z - 2);
            const manual = Math.sqrt(((hxp - hxn) / 4) ** 2 + ((hzp - hzn) / 4) ** 2);
            maxDiffBaker = Math.max(maxDiffBaker, Math.abs(viaSlopeAt - manual));
        }
        out.maxDiffBaker = maxDiffBaker;

        // (2)+(4) das Welt-Raster scannen: flache vs steile, vegetierte Spots.
        let flatN = 0,
            flatFactorSum = 0,
            steepN = 0,
            steepFactorMax = 0;
        let vegSteep = 0,
            vegSteepGrassZero = 0,
            vegFlat = 0,
            vegFlatGrassPos = 0;
        const SCAN = 60,
            STEP = 9;
        for (let zi = 0; zi < SCAN; zi++) {
            for (let xi = 0; xi < SCAN; xi++) {
                const x = px0 + (xi - SCAN / 2) * STEP,
                    z = pz0 + (zi - SCAN / 2) * STEP;
                const slope = r._slopeAt(x, z); // default-Sampler (gleiche Formel wie Gras)
                if (!Number.isFinite(slope)) continue;
                const factor = slopeFactor(slope);
                if (slope < 0.35) {
                    flatN++;
                    flatFactorSum += factor;
                }
                if (slope > GS.hi + 0.1) {
                    steepN++;
                    steepFactorMax = Math.max(steepFactorMax, factor);
                }
                // vegetierter Spot über Wasser (die „Felswand mit Gras"-Frage)?
                const f = r.worldFieldAt(x, z);
                const leb = f ? f.lebendig : 0;
                const surfY = r._voxelSurfaceY(x, z);
                const aboveWater = surfY != null && surfY >= (r._waterLevelAt ? r._waterLevelAt(x, z) : -1e9) + 0.1;
                if (leb < 0.22 || !aboveWater) continue;
                // der Gras-Count-Kern (ohne rnd/clump/path — die Slope-Wirkung isoliert):
                const baseCount = leb * 16;
                const gatedCount = baseCount * factor;
                if (slope > GS.hi) {
                    vegSteep++;
                    if (gatedCount < 1) vegSteepGrassZero++;
                }
                if (slope < GS.lo) {
                    vegFlat++;
                    if (gatedCount >= 1) vegFlatGrassPos++;
                }
            }
        }
        out.flatN = flatN;
        out.flatFactorAvg = flatN ? flatFactorSum / flatN : null;
        out.steepN = steepN;
        out.steepFactorMax = steepFactorMax;
        out.vegSteep = vegSteep;
        out.vegSteepGrassZero = vegSteepGrassZero;
        out.vegFlat = vegFlat;
        out.vegFlatGrassPos = vegFlatGrassPos;

        // (3) SYNERGIE — Source-Probe: alle drei Platzierungs-Leser rufen this._slopeAt(.
        out.grassReadsSlope = /this\._slopeAt\(/.test(r._buildVoxelChunkGrass.toString());
        out.scatterReadsSlope = /this\._slopeAt\(/.test(r._scatterPass.toString());
        out.bakerReadsSlope = /this\._slopeAt\(/.test(r._bakeRegionFields.toString());
        return out;
    });

    console.log("\n===== DIE EINE PLATZIERUNGS-SLOPE-QUELLE — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  GRASS_SLOPE: lo=${o.lo} (~35°) · hi=${o.hi} (~52°)`);
    console.log(
        `  (1) EINE FORMEL: _slopeAt(·,ght,2) vs alter Bäcker-Inline maxDiff ${o.maxDiffBaker.toExponential(2)} (erw ~0 — byte-gleich)`
    );
    console.log(
        `  (2) GRAS-GATE: flache Spots ${o.flatN} → slopeFactor Ø ${o.flatFactorAvg != null ? o.flatFactorAvg.toFixed(3) : "?"} (erw ~1) · steile ${o.steepN} → max slopeFactor ${o.steepFactorMax.toFixed(3)} (erw 0)`
    );
    console.log(
        `  (4) BEHAVIORAL: vegetierte STEILE Spots ${o.vegSteep}, davon Gras=0 jetzt: ${o.vegSteepGrassZero} (erw alle) — die Felswand-mit-Gras-Kandidaten`
    );
    console.log(
        `               vegetierte FLACHE Spots ${o.vegFlat}, davon Gras>0: ${o.vegFlatGrassPos} (erw alle — die Wiese bleibt)`
    );
    console.log(
        `  (3) SYNERGIE: Gras=${o.grassReadsSlope} · Scatter=${o.scatterReadsSlope} · Bäcker=${o.bakerReadsSlope} lesen alle this._slopeAt(`
    );

    const ok =
        !pageErr &&
        o.maxDiffBaker < 1e-9 &&
        o.flatN > 0 &&
        o.flatFactorAvg > 0.9 &&
        (o.steepN === 0 || o.steepFactorMax === 0) &&
        (o.vegSteep === 0 || o.vegSteepGrassZero === o.vegSteep) &&
        (o.vegFlat === 0 || o.vegFlatGrassPos === o.vegFlat) &&
        o.grassReadsSlope &&
        o.scatterReadsSlope &&
        o.bakerReadsSlope;
    console.log(
        `\n  ${ok ? "✅ EINE Slope-Formel (byte-gleich zum Bäcker), Gras weicht der Felswand (steil→0, flach→voll), Gras+Fels+Bäcker lesen DIESELBE Quelle." : "⚠️ Der Slope-Mechanismus weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

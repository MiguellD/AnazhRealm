#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-lod-perception.cjs — SCREEN-SPACE-ERROR-LOD (V18.387, DAS NEUE KLEID)
//
// Beweist headless (GPU-frei), dass die WAHRNEHMUNGS-Distanz (phytogenesis v38
// portiert) wirkt und als EIN System mit dem Perf-Regler integriert ist:
//   (1) ein GRÖSSERER Baum (größere Sichthöhe) schaltet SPÄTER auf LOD1/2
//       (rohe Distanz muss größer sein, um dieselbe LOD-Stufe zu erreichen).
//   (2) ein Baum der Referenz-Sichthöhe `lodRef` schaltet nominal (bei thresh01).
//   (3) UNTER LAST (`_foliageDensityScale` = MIN) schalten ALLE Bäume FRÜHER
//       (die EINE Regler-Quelle skaliert die Wahrnehmungs-Distanz nach oben —
//       kein zweiter LOD-Regler, Gesetz #0).
//   (4) kleine Bäume schalten NIE früher als nominal (Faktor auf 1 gekappt).
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4351;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
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
        for (let i = 0; i < 15; i++) await page.evaluate(() => window.anazhRealm._gameLoopTick());
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const AR = r.constructor;
            const cfg = AR.LOD_DISTANCES;
            // Eine gewachsene Baum-Spezies + Variante bauen (LOD0-Bauplan trägt
            // die Sichthöhe, die der Chooser liest).
            const species = "baum_eiche";
            const variantIndex = 0;
            const keys = r._buildVariantLODs(species, variantIndex);
            if (!keys) return { err: "keine Varianten-LODs" };
            const templH = r._lodTreeVisHeightFor(species, variantIndex, 1);
            if (!(templH > 0)) return { err: "Sichthöhe 0 (Bauplan ohne dy?)" };

            // Kleinster rohe Distanz, bei der die Stufe LOD1 erreicht wird
            // (Erst-Wahl, kein currentLOD → reine Stufenfunktion).
            const distToReachLOD1 = (visH) => {
                for (let d = 1; d <= 4000; d++) {
                    if (r._chooseLODForDistance(d, undefined, visH) >= 1) return d;
                }
                return Infinity;
            };

            const st = r.state;
            const savedFd = st._foliageDensityScale;

            // (2) Referenz-Baum (visHeight == lodRef) schaltet nominal bei ~thresh01.
            st._foliageDensityScale = 1;
            const dRef = distToReachLOD1(cfg.lodRef);

            // (1) großer vs kleiner Baum bei voller Kapazität.
            const bigH = cfg.lodRef * 2;
            const smallH = cfg.lodRef * 0.5;
            const dBig = distToReachLOD1(bigH);
            const dSmall = distToReachLOD1(smallH);

            // (3) derselbe große Baum unter voller Last → früher.
            st._foliageDensityScale = AR.PERF_FOLIAGE_DENSITY_MIN != null ? AR.PERF_FOLIAGE_DENSITY_MIN : 0.4;
            const dBigLoaded = distToReachLOD1(bigH);

            st._foliageDensityScale = savedFd;

            return {
                templH: +templH.toFixed(2),
                lodRef: cfg.lodRef,
                thresh01: cfg.thresh01,
                dRef,
                dBig,
                dSmall,
                dBigLoaded,
                perfDistMulMax: cfg.perfDistMulMax,
            };
        });
    } catch (e) {
        out = { err: String((e && e.message) || e) };
    } finally {
        await browser.close();
        server.close();
    }

    console.log(JSON.stringify(out, null, 2));
    if (out.err) {
        console.error("FEHLER:", out.err);
        process.exit(1);
    }
    const checks = [];
    // (2) Referenz-Baum schaltet nahe thresh01 (±5 m Rundung).
    checks.push(["Referenz-Baum ~ thresh01", Math.abs(out.dRef - out.thresh01) <= 5]);
    // (1) großer Baum schaltet SPÄTER als der Referenz-Baum.
    checks.push(["großer Baum schaltet später", out.dBig > out.dRef + 5]);
    // (4) kleiner Baum schaltet NICHT früher als nominal (Faktor auf 1 gekappt).
    checks.push(["kleiner Baum nicht früher (Kappe)", out.dSmall >= out.dRef - 1]);
    // (3) unter Last schaltet der große Baum FRÜHER als ungedrosselt.
    checks.push(["unter Last früher", out.dBigLoaded < out.dBig]);

    let ok = true;
    for (const [name, pass] of checks) {
        console.log(`${pass ? "✅" : "❌"} ${name}`);
        if (!pass) ok = false;
    }
    console.log(ok ? "\n✅ SCREEN-SPACE-ERROR-LOD wirkt + perf-integriert." : "\n❌ Mechanismus fehlerhaft.");
    process.exit(ok ? 0 : 1);
})();

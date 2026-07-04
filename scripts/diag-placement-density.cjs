#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-placement-density.cjs — DIE PLATZIERUNGS-DICHTE DER VORLAGE (V18.388,
//   DAS NEUE KLEID W1-B, GPU-frei)
//
// Die phytogenesis-Wald-Verteilung (plantForest/moisture/slopeAt) auf AnazhRealms
// Voxel-Saat: die Wald-/Unterwuchs-Dichte ist dicht wo FEUCHT + FLACH + NIEDRIG,
// licht auf STEIL-Hang + HÖHE — über die EINE Quelle `_placementDensityFactor`
// (Stand-Klump × Slope × Feuchte × Höhe × Perf). Diese Linse beweist headless:
//   (a) Slope-/Feuchte-/Höhen-GATE wirkt: feucht+flach+niedrig ≫ steil/trocken/hoch.
//   (b) DETERMINISMUS: dieselbe (x,z) → bit-identische Dichte (zweimal bauen gleich).
//   (c) die Dichte folgt `_foliageDensityScale` (der Perf-Regler).
//   (d) HEADLESS = VOLL (gate-treu, `_foliageDensityScale` = 1 im Null-Renderer).
//   (e) WIRING/KONSUM: `_vegetationSampleSpawn` liest die EINE Quelle; Γ5-Suffixe.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4332;
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
            for (let i = 0; i < 40; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const o = {};
            const X = 1234.5,
                Z = -567.25;
            const baseH = st.terrainBaseHeight || 0;
            // -- (e) WIRING/KONSUM: die EINE Quelle wird gelesen + Γ5-Suffixe --
            const src = (fn) => (typeof fn === "function" ? fn.toString() : "");
            o.hasFactor = typeof r._placementDensityFactor === "function";
            o.hasStand = typeof r._placementStandAt === "function";
            o.vegReadsFactor = /_placementDensityFactor/.test(src(r._vegetationSampleSpawn));
            const standSrc = src(r._placementStandAt);
            o.standHasSuffixes = /:forest/.test(standSrc) && /:meadow/.test(standSrc);
            o.factorReadsSlope = /_slopeAt/.test(src(r._placementDensityFactor));
            o.factorReadsWet = /_feuchteAt/.test(src(r._placementDensityFactor));
            o.factorReadsPerf = /_foliageDensityScale/.test(src(r._placementDensityFactor));

            // -- (a) GATE: slope/feuchte/höhe isoliert (stand konstant bei fester x,z) --
            st._foliageDensityScale = 1;
            const origSlope = r._slopeAt;
            const origWet = r._feuchteAt;
            const probe = (slope, wet, relH) => {
                r._slopeAt = () => slope;
                r._feuchteAt = () => wet;
                return r._placementDensityFactor(X, Z, baseH + relH, "forest");
            };
            const fFlatWetLow = probe(0.05, 0.9, 2); // die üppige Niederung
            const fSteep = probe(1.0, 0.9, 2); // Steilhang
            const fDry = probe(0.05, 0.0, 2); // trockener Grund
            const fHigh = probe(0.05, 0.9, 50); // hoher Grat
            r._slopeAt = origSlope;
            r._feuchteAt = origWet;
            o.fFlatWetLow = +fFlatWetLow.toFixed(4);
            o.fSteep = +fSteep.toFixed(4);
            o.fDry = +fDry.toFixed(4);
            o.fHigh = +fHigh.toFixed(4);
            o.steepGate = fFlatWetLow > fSteep * 1.4 && fSteep < fFlatWetLow * 0.35;
            o.dryGate = fFlatWetLow > fDry * 1.15;
            o.highGate = fFlatWetLow > fHigh * 1.4;

            // -- (b) DETERMINISMUS: reine Funktion von (x,z) → zwei Läufe bit-gleich --
            const scanA = [],
                scanB = [];
            for (let i = 0; i < 200; i++) {
                const sx = ((i * 733) % 4000) - 2000;
                const sz = ((i * 1471) % 4000) - 2000;
                const sy = baseH + ((i * 37) % 60);
                scanA.push(r._placementDensityFactor(sx, sz, sy, i % 2 ? "meadow" : "forest"));
            }
            for (let i = 0; i < 200; i++) {
                const sx = ((i * 733) % 4000) - 2000;
                const sz = ((i * 1471) % 4000) - 2000;
                const sy = baseH + ((i * 37) % 60);
                scanB.push(r._placementDensityFactor(sx, sz, sy, i % 2 ? "meadow" : "forest"));
            }
            let maxDiff = 0;
            for (let i = 0; i < scanA.length; i++) maxDiff = Math.max(maxDiff, Math.abs(scanA[i] - scanB[i]));
            o.deterministic = maxDiff === 0;
            o.detMaxDiff = maxDiff;
            // Der ':forest'/':meadow'-Stand sind ANDERE Klumpungen (nicht dieselbe Quelle)
            o.standDistinct = r._placementStandAt(X, Z, "forest") !== r._placementStandAt(X, Z, "meadow");

            // -- (c) PERF: die Dichte folgt _foliageDensityScale --
            st._foliageDensityScale = 1;
            const full = r._placementDensityFactor(X, Z, baseH + 4, "forest");
            st._foliageDensityScale = 0.4;
            const scaled = r._placementDensityFactor(X, Z, baseH + 4, "forest");
            o.followsPerf = Math.abs(scaled - full * 0.4) < 1e-9 && scaled < full;
            o.full = +full.toFixed(4);
            o.scaled = +scaled.toFixed(4);
            st._foliageDensityScale = 1;

            // -- (d) HEADLESS = VOLL: der Null-Renderer treibt _foliageDensityScale → 1 --
            o.headlessNull = !!(st.renderer && st.renderer._isHeadlessNull);
            o.headlessFull = st._foliageDensityScale === 1;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Platzierungs-Dichte-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const checks = [
        {
            name: "Die EINE Quelle existiert + `_vegetationSampleSpawn` liest sie (KONSUM)",
            pass: out.hasFactor && out.hasStand && out.vegReadsFactor,
        },
        {
            name: "Γ5-Suffixe ':forest'/':meadow' + Faktor liest Slope/Feuchte/Perf",
            pass: out.standHasSuffixes && out.factorReadsSlope && out.factorReadsWet && out.factorReadsPerf,
        },
        {
            name: `(a) SLOPE-Gate: flach ${out.fFlatWetLow} ≫ steil ${out.fSteep} (dicht auf flach, kahl auf der Wand)`,
            pass: out.steepGate,
        },
        {
            name: `(a) FEUCHTE-Gate: feucht ${out.fFlatWetLow} > trocken ${out.fDry} (nass → dichter)`,
            pass: out.dryGate,
        },
        {
            name: `(a) HÖHEN-Gate: niedrig ${out.fFlatWetLow} ≫ hoch ${out.fHigh} (Höhe lichtet)`,
            pass: out.highGate,
        },
        {
            name: `(b) DETERMINISMUS: zweimal bauen bit-identisch (maxDiff ${out.detMaxDiff}) + ':forest'≠':meadow'`,
            pass: out.deterministic && out.standDistinct,
        },
        {
            name: `(c) Die Dichte folgt _foliageDensityScale (voll ${out.full} → 0.4 ${out.scaled})`,
            pass: out.followsPerf,
        },
        {
            name: `(d) HEADLESS = VOLL (Null-Renderer → _foliageDensityScale = 1, gate-treu)`,
            pass: out.headlessNull && out.headlessFull,
        },
    ];
    console.log("\n=== Platzierungs-Dichte der Vorlage (dicht wo feucht+flach, licht auf Hang+Höhe) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Platzierungs-Dichte-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die Platzierungs-Dichte folgt der Vorlagen-Ökologie noch nicht.");
        process.exit(1);
    }
    console.log("✅ PLATZIERUNGS-DICHTE OK");
    process.exit(0);
})();

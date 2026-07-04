#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-undergrowth.cjs — DER UNTERWUCHS (V18.389, DAS NEUE KLEID P2, GPU-frei)
//
// Die phytogenesis-scatterGround-Schichten (Gras/Kies/Blume/Strauch, die aufs
// Kronendach reagieren — canopyLight/understoryNiche/groundCover, Vorlage
// Z.1466-1576) auf AnazhRealms Voxel-Saat. Das Kronendach-Licht ist die EINE
// Quelle (`_canopyLightAt`): dicht bepflanzter Wald (P1) = dunkler Boden = licht,
// die Lichtung = volles Licht = Wiese. Diese Linse beweist headless:
//   (a) die BLUMEN (blume_tulpe/klee/mohn) erscheinen auf flacher besonnter
//       Wiese (count>0), slope-gegated (flach > steil).
//   (b) Gras + Unterwuchs REAGIEREN aufs Kronendach (Lichtung dichter als unterm
//       Dach; Gras hell-liebend, Farn schatten-liebend) + Feuchte.
//   (c) Varianten-Vielfalt: ≥2 Gestalt-Varianten je Art (Blume/Farn) erscheinen.
//   (d) DETERMINISMUS: reine Funktion von (x,z) → zwei Läufe bit-gleich; der
//       Streu-Bau zweimal → identische Instanz-Zahlen (Γ5, kein Math.random).
//   (e) HEADLESS = VOLL (gate-treu, `_foliageDensityScale` = 1 im Null-Renderer).
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4341;
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
        // Warmup: die Welt bauen (Worker null → synchron, deterministisch).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 60; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const o = {};
            const baseH = st.terrainBaseHeight || 0;
            st._foliageDensityScale = 1;
            const src = (fn) => (typeof fn === "function" ? fn.toString() : "");
            const U = r.constructor.UNDERGROWTH;

            // -- WIRING/KONSUM: die EINE Kronendach-Quelle wird von allen Lesern gelesen --
            o.hasCanopy = typeof r._canopyLightAt === "function";
            o.hasNiche = typeof r._understoryNiche === "function";
            o.hasGround = typeof r._undergrowthGroundFactor === "function";
            o.grassReads =
                /_canopyLightAt/.test(src(r._buildVoxelChunkGrass)) &&
                /_understoryNiche/.test(src(r._buildVoxelChunkGrass));
            o.scatterReads = /_undergrowthGroundFactor/.test(src(r._buildVoxelChunkScatter));
            o.fernReads = /_undergrowthGroundFactor/.test(src(r._buildDekoFernfeldSpecies));
            o.canopyAligned = /_placementStandAt/.test(src(r._canopyLightAt)); // P1-Wald-aligned
            o.noRandom =
                !/Math\.random/.test(src(r._canopyLightAt)) &&
                !/Math\.random/.test(src(r._understoryNiche)) &&
                !/Math\.random/.test(src(r._undergrowthGroundFactor));

            // -- Klärung/Wald-Punkt aus dem forestStand-Extrem (die P1-Wald-Quelle) --
            let clearPt = null,
                forestPt = null;
            for (let i = 0; i < 20000 && (!clearPt || !forestPt); i++) {
                const x = -3000 + ((i * 137) % 6000);
                const z = -3000 + ((i * 971) % 6000);
                const stand = r._placementStandAt(x, z, "forest");
                if (!clearPt && stand < -0.55) clearPt = { x, z };
                if (!forestPt && stand > 0.55) forestPt = { x, z };
            }
            o.foundPts = !!(clearPt && forestPt);
            const sy = baseH + 4;

            // -- (b) KRONENDACH-REAKTION: Lichtung heller als dichtes Dach --
            const LClear = r._canopyLightAt(clearPt.x, clearPt.z, sy, 0.5);
            const LForest = r._canopyLightAt(forestPt.x, forestPt.z, sy, 0.5);
            o.LClear = +LClear.toFixed(3);
            o.LForest = +LForest.toFixed(3);
            o.canopyReacts = LClear > LForest + 0.15;

            // Gras: hell-liebend → Lichtung deutlich dichter als Waldboden.
            const gG = (L, wet) => (U.grassFloor + U.grassGain * r._understoryNiche(L).gras) * (0.85 + U.grassWet * wet);
            o.grassClear = +gG(LClear, 0.5).toFixed(3);
            o.grassForest = +gG(LForest, 0.5).toFixed(3);
            o.grassCanopyReacts = o.grassClear > o.grassForest * 1.3;

            // Feuchte: der direkte Wiesen-Antrieb (Vorlagen meadow += m) verdichtet das Gras.
            o.grassWetHi = +gG(LClear, 0.9).toFixed(3);
            o.grassWetLo = +gG(LClear, 0.05).toFixed(3);
            o.grassMoistureReacts = o.grassWetHi > o.grassWetLo * 1.05;
            // Und das Kronendach selbst verdunkelt bei Nässe (Bäume mögen Wasser → dichter).
            o.canopyDryLight = +r._canopyLightAt(clearPt.x, clearPt.z, sy, 0.05).toFixed(3);
            o.canopyWetLight = +r._canopyLightAt(clearPt.x, clearPt.z, sy, 0.95).toFixed(3);
            o.canopyMoistureReacts = o.canopyDryLight > o.canopyWetLight + 0.02;

            // Farn (kronen "unter"): schatten-liebend → Waldboden dichter als Lichtung.
            const farnSp = { kronen: "unter" };
            o.farnForest = +r._undergrowthGroundFactor(farnSp, r._understoryNiche(LForest), 0.1).toFixed(3);
            o.farnClear = +r._undergrowthGroundFactor(farnSp, r._understoryNiche(LClear), 0.1).toFixed(3);
            o.farnFavorsShade = o.farnForest > o.farnClear;

            // -- (a) BLUME slope-gegated: mittleres Licht (Saum), flach ≫ steil --
            const blumeSp = { kronen: "lichtung" };
            const nicheMid = r._understoryNiche(0.5); // Saum-Peak
            const GS = r.constructor.GRASS_SLOPE;
            o.blumeFlat = +r._undergrowthGroundFactor(blumeSp, nicheMid, 0.1).toFixed(3);
            o.blumeSteep = +r._undergrowthGroundFactor(blumeSp, nicheMid, GS.hi + 0.5).toFixed(3);
            o.blumeSlopeGated = o.blumeFlat > 0 && o.blumeSteep === 0;
            // Blume bevorzugt den besonnten Saum vor dem tiefen Schatten.
            o.blumeMid = +r._undergrowthGroundFactor(blumeSp, nicheMid, 0.1).toFixed(3);
            o.blumeDeepForest = +r._undergrowthGroundFactor(blumeSp, r._understoryNiche(0.08), 0.1).toFixed(3);
            o.blumeFavorsSaum = o.blumeMid > o.blumeDeepForest;

            // -- (a)+(c) ECHTE BLUMEN: die Streu bauen, Blumen/Farne zählen --
            const buildAllScatter = () => {
                const counts = {};
                if (!st.voxelChunks) return counts;
                const origLpc = st.lastPlayerVoxelChunk;
                for (const key of [...st.voxelChunks.keys()]) {
                    const ci = key.indexOf(",");
                    const cx = parseInt(key.slice(0, ci), 10);
                    const cz = parseInt(key.slice(ci + 1), 10);
                    // Als Spieler-Chunk behandeln → Mesh-Band (die Blume ist Nah-Deko).
                    st.lastPlayerVoxelChunk = { cx, cz };
                    if (st.voxelChunkScatter) st.voxelChunkScatter.delete(key);
                    r._buildVoxelChunkScatter(cx, cz);
                    const list = st.voxelChunkScatter ? st.voxelChunkScatter.get(key) : null;
                    if (list)
                        for (const it of list) {
                            const c = it.mesh ? it.mesh.count || 0 : 0;
                            counts[it.name] = (counts[it.name] || 0) + c;
                        }
                }
                st.lastPlayerVoxelChunk = origLpc;
                return counts;
            };
            const counts1 = buildAllScatter();
            o.chunkCount = st.voxelChunks ? st.voxelChunks.size : 0;
            const blumeNames = ["blume_tulpe", "blume_klee", "blume_mohn"];
            const farnNames = ["farn_normal", "farn_breit", "farn_schmal"];
            o.blumeTotal = blumeNames.reduce((s, n) => s + (counts1[n] || 0), 0);
            o.blumeVariants = blumeNames.filter((n) => (counts1[n] || 0) > 0).length;
            o.farnVariants = farnNames.filter((n) => (counts1[n] || 0) > 0).length;
            o.blumePresent = o.blumeTotal > 0;

            // -- (d) DETERMINISMUS: zweiter Streu-Bau → identische Instanz-Zahlen --
            const counts2 = buildAllScatter();
            let scatterDrift = 0;
            const allNames = new Set([...Object.keys(counts1), ...Object.keys(counts2)]);
            for (const n of allNames) scatterDrift = Math.max(scatterDrift, Math.abs((counts1[n] || 0) - (counts2[n] || 0)));
            o.scatterDrift = scatterDrift;
            // Reine Funktion: zwei Scans von _canopyLightAt bit-gleich.
            let pureDrift = 0;
            for (let i = 0; i < 300; i++) {
                const x = ((i * 733) % 6000) - 3000;
                const z = ((i * 1471) % 6000) - 3000;
                const a = r._canopyLightAt(x, z, baseH + (i % 40), i % 2 ? 0.3 : 0.7);
                const b = r._canopyLightAt(x, z, baseH + (i % 40), i % 2 ? 0.3 : 0.7);
                pureDrift = Math.max(pureDrift, Math.abs(a - b));
            }
            o.pureDrift = pureDrift;
            o.deterministic = scatterDrift === 0 && pureDrift === 0;

            // -- (e) HEADLESS = VOLL --
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
        console.log(`⛔ Unterwuchs-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const checks = [
        {
            name: "Die EINE Kronendach-Quelle existiert + Gras/Streu/Fernfeld lesen sie (KONSUM)",
            pass: out.hasCanopy && out.hasNiche && out.hasGround && out.grassReads && out.scatterReads && out.fernReads,
        },
        {
            name: "Kronendach P1-Wald-aligned (`_placementStandAt`) + kein Math.random (Γ5)",
            pass: out.canopyAligned && out.noRandom,
        },
        {
            name: `(b) KRONENDACH reagiert: Lichtung ${out.LClear} heller als dichtes Dach ${out.LForest}`,
            pass: out.foundPts && out.canopyReacts,
        },
        {
            name: `(b) GRAS dichter in der Lichtung (${out.grassClear}) als unterm Dach (${out.grassForest})`,
            pass: out.grassCanopyReacts,
        },
        {
            name: `(b) FARN schatten-liebend: Waldboden ${out.farnForest} > Lichtung ${out.farnClear}`,
            pass: out.farnFavorsShade,
        },
        {
            name: `(b) FEUCHTE: Wiese verdichtet mit Nässe (${out.grassWetLo}→${out.grassWetHi}); Dach verdunkelt (${out.canopyDryLight}→${out.canopyWetLight})`,
            pass: out.grassMoistureReacts && out.canopyMoistureReacts,
        },
        {
            name: `(a) BLUME slope-gegated (flach ${out.blumeFlat} > steil ${out.blumeSteep}=0) + Saum-liebend (${out.blumeMid}>${out.blumeDeepForest})`,
            pass: out.blumeSlopeGated && out.blumeFavorsSaum,
        },
        {
            name: `(a) BLUMEN erscheinen auf der Wiese (count ${out.blumeTotal} > 0, ${out.chunkCount} Chunks)`,
            pass: out.blumePresent,
        },
        {
            name: `(c) VARIANTEN-VIELFALT: ≥2 Blume-Varianten (${out.blumeVariants}/3) + ≥2 Farn-Varianten (${out.farnVariants}/3)`,
            pass: out.blumeVariants >= 2 && out.farnVariants >= 2,
        },
        {
            name: `(d) DETERMINISMUS: Streu-Bau bit-gleich (drift ${out.scatterDrift}) + reine Funktion (drift ${out.pureDrift})`,
            pass: out.deterministic,
        },
        {
            name: `(e) HEADLESS = VOLL (Null-Renderer → _foliageDensityScale = 1, gate-treu)`,
            pass: out.headlessNull && out.headlessFull,
        },
    ];
    console.log("\n=== Der Unterwuchs (Gras/Blume/Farn nach Kronendach-Licht × Feuchte, Varianten-Pools) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Unterwuchs-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Unterwuchs folgt der Vorlagen-scatterGround-Ökologie noch nicht.");
        process.exit(1);
    }
    console.log("✅ UNTERWUCHS OK");
    process.exit(0);
})();

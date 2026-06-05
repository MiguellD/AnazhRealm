// Diagnose V18.13 — DIE WASSER-SYSTEM-KOMMUNIKATION (Schöpfer-Hypothese: „stimmt
// nur die Kommunikation der Systeme/Schnittstellen nicht?"). Der Render-Shader macht
// MIKRO (Wellen/Schaum/Tiefen-Uferlinie) OHNE den MAKRO-Kontext (Fluss vs Ozean,
// tief vs flach, Mündung, Steilheit). Diese Diagnose MISST die drei Inkohärenzen,
// die der Schöpfer im Browser sah — headless, mit Zahlen, NICHT geraten.
//
//   M1 — „Shader chaotisch, foamt überall": die Tiefen-Uferlinie (`waterThick`,
//        shoreWidth) ist für TIEFES Wasser gebaut. Wie TIEF ist der Fluss wirklich
//        (L − Bett) vs See/Ozean? Wenn der Fluss überall dünn ist, hält der Shader
//        die GANZE Fläche für „Uferlinie" → Schaum überall.
//   M2 — „Mündung fadet nicht, harsch": aWave (Ozean-Wellen) kippt HART bei
//        |L−waterLevel|<1.5. Wie viele Fluss-Punkte tragen fälschlich Ozean-Wellen,
//        und wie hart ist der Sprung an der Fluss↔Ozean-Grenze?
//   M3 — „Wasserfall zu hoch, Artefakt, kaum echte Vertikalen": für jeden Wasserfall
//        die ECHTE Terrain-Steilheit (dropH / horizontaler Lauf des Abfalls). Steil
//        (>~1.5 = echte Wand) vs flach (Hang → die vertikale Plane ist ein Artefakt).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4353;
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
        while (performance.now() - start < 40000) {
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
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const wl = typeof s.waterLevel === "number" ? s.waterLevel : 0;
        const px = s.playerMesh ? s.playerMesh.position.x : 0;
        const pz = s.playerMesh ? s.playerMesh.position.z : 0;

        // Sammle Fluss-/See-/Ozean-Punkte über ein Gitter ums Spawn.
        const river = [],
            lake = [],
            ocean = [];
        const N = 90,
            cell = 8;
        for (let k = 0; k < N; k++) {
            for (let i = 0; i < N; i++) {
                const x = px + (i - N / 2) * cell;
                const z = pz + (k - N / 2) * cell;
                const L = r._atlasWaterLevelAt(x, z, -Infinity);
                if (!isFinite(L)) continue;
                const rv = r._hydroRiverAt(x, z);
                const bed = r._voxelSurfaceY(x, z);
                if (bed === null || !isFinite(bed)) continue;
                const depth = L - bed; // echte Wassertiefe (Spiegel − Bett)
                const aWave = Math.abs(L - wl) < 1.5 ? 1 : 0;
                const pt = { x, z, L, depth, aWave };
                if (rv && (rv.flowX || rv.flowZ)) river.push(pt);
                else if (Math.abs(L - wl) < 0.6) ocean.push(pt);
                else lake.push(pt);
            }
        }
        const stat = (arr, key) => {
            if (!arr.length) return { n: 0 };
            const v = arr.map((p) => p[key]).sort((a, b) => a - b);
            const med = v[Math.floor(v.length / 2)];
            const mean = v.reduce((a, b) => a + b, 0) / v.length;
            return { n: arr.length, med: +med.toFixed(2), mean: +mean.toFixed(2), min: +v[0].toFixed(2), max: +v[v.length - 1].toFixed(2) };
        };
        // M1 — Wassertiefe Fluss vs See vs Ozean; „dünn" = < 1.5 m (foamt im Shader).
        const thinFrac = (arr) => (arr.length ? +(arr.filter((p) => p.depth < 1.5).length / arr.length).toFixed(2) : 0);
        const M1 = {
            riverDepth: stat(river, "depth"),
            lakeDepth: stat(lake, "depth"),
            oceanDepth: stat(ocean, "depth"),
            riverThinFrac: thinFrac(river),
            lakeThinFrac: thinFrac(lake),
        };
        // M2 — aWave fälschlich auf dem Fluss (Ozean-Wellen) + der Anteil.
        const M2 = {
            riverWithOceanWaves: river.length ? +(river.filter((p) => p.aWave === 1).length / river.length).toFixed(2) : 0,
            // der Sprung ist binär (0/1) → per Konstruktion HART (kein Fade-Wert dazwischen).
            aWaveIsBinary: true,
            riverPts: river.length,
        };
        // M3 — Wasserfall-Realität: dropH / horizontaler Lauf des echten Terrain-Abfalls.
        const wfs = (s.hydrosphere && s.hydrosphere.waterfalls) || [];
        const wfMeasures = [];
        for (const wf of wfs.slice(0, 40)) {
            const dropH = (wf.topY || 0) - (wf.bottomY || 0);
            if (dropH < 2) continue;
            // entlang der Fluss-Richtung das Terrain abtasten, bis es um dropH gefallen ist.
            let fx = wf.flowX || 0,
                fz = wf.flowZ || 0;
            const fm = Math.hypot(fx, fz) || 1;
            fx /= fm;
            fz /= fm;
            const y0 = r._voxelSurfaceY(wf.x, wf.z);
            let run = 0;
            for (let d = 1; d <= 40; d++) {
                const yy = r._voxelSurfaceY(wf.x + fx * d, wf.z + fz * d);
                if (yy === null || !isFinite(yy)) continue;
                if (y0 - yy >= dropH * 0.8) {
                    run = d;
                    break;
                }
            }
            if (run === 0) run = 40; // in 40 m nicht gefallen → sehr flacher Hang
            const steep = dropH / run; // >~1.5 echte Wand, <1 Hang
            wfMeasures.push({ dropH: +dropH.toFixed(1), run, steep: +steep.toFixed(2) });
        }
        const slopeArtefacts = wfMeasures.filter((w) => w.steep < 1).length;
        const M3 = {
            count: wfMeasures.length,
            slopeArtefacts,
            artefactFrac: wfMeasures.length ? +(slopeArtefacts / wfMeasures.length).toFixed(2) : 0,
            steepMed: wfMeasures.length ? +wfMeasures.map((w) => w.steep).sort((a, b) => a - b)[Math.floor(wfMeasures.length / 2)].toFixed(2) : 0,
            tallest: wfMeasures.length ? Math.max(...wfMeasures.map((w) => w.dropH)) : 0,
            sample: wfMeasures.slice(0, 6),
        };
        return { wl, M1, M2, M3 };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== WASSER-SYSTEM-KOMMUNIKATION (V18.13 Diagnose) ===");
    console.log("Meeresspiegel waterLevel:", out.wl, "\n");
    console.log("M1 — TIEFE (L − Bett): foamt der Shader den Fluss, weil er ihn fuer Uferlinie haelt?");
    console.log("   Fluss :", JSON.stringify(out.M1.riverDepth), " dünn(<1.5m):", out.M1.riverThinFrac);
    console.log("   See   :", JSON.stringify(out.M1.lakeDepth), " dünn(<1.5m):", out.M1.lakeThinFrac);
    console.log("   Ozean :", JSON.stringify(out.M1.oceanDepth));
    console.log("   → wenn Fluss-dünn-Anteil hoch + See/Ozean tief: der Shader behandelt sie GLEICH = die Inkohärenz.\n");
    console.log("M2 — MÜNDUNG/aWave: Ozean-Wellen fälschlich auf dem Fluss?");
    console.log("   Fluss-Punkte mit aWave=1 (Ozean-Wellen):", out.M2.riverWithOceanWaves, " von", out.M2.riverPts, "Fluss-Punkten");
    console.log("   aWave ist binär 0/1 →", out.M2.aWaveIsBinary, "(per Konstruktion HART, kein Fade — die harsche Mündung).\n");
    console.log("M3 — WASSERFALL: echte Vertikale (Wand) oder Hang-Artefakt?");
    console.log("   gemessene Wasserfälle:", out.M3.count, " davon Hang-Artefakte (steep<1):", out.M3.slopeArtefacts, `(${(out.M3.artefactFrac * 100).toFixed(0)}%)`);
    console.log("   Median-Steilheit:", out.M3.steepMed, "(>1.5 = echte Wand, <1 = Hang)  höchster Drop:", out.M3.tallest, "m");
    if (out.M3.sample.length) console.log("   Proben:", JSON.stringify(out.M3.sample));
    console.log("\n[Diagnose-Lauf, kein Pass/Fail] — die Zahlen sagen, WELCHE Schnittstelle inkohärent ist.");
    process.exit(0);
})();

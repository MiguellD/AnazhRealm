// Diagnose T6 (terrain-koharenz-plan §9) — DAS DRAMA, repräsentativ gemessen an MEHREREN Orten
// (inkl. ~Schöpfer-Position 250), NICHT ein gerahmter Shot. Misst die VIER Schöpfer-Forderungen direkt
// an der Density-Funktion (GEOMETRIE → headless beweisbar, ich bin nicht pixel-blind):
//   (1) GIGANTISCHE CANYONS  — tiefste lokale Schlucht (m unter dem 120-m-Fenster-Max) + Anzahl.
//   (2) WEITE FELDER         — Anteil wirklich FLACHER Fläche (lokaler Gradient < 1.5 m).
//   (3) KRASSE KONTRASTE     — Anzahl Steilkanten (Nachbar-Sample-Sprung > 8 m).
//   (4) HÖHLEN BRECHEN DURCH — Spalten mit AIR-Tasche (Density<0) innerhalb 16 m unter der Oberfläche.
// Exit 0 immer (Mess-Werkzeug, kein Gate) — die ZAHLEN führen.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4371;
const root = path.resolve(__dirname, "..");
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Nur bis die Engine + Worldgen (Hydrosphäre) bereit ist — wir sampeln die Density-Funktion direkt.
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (
                r &&
                r.state &&
                r.state.terrainBaseHeight !== undefined &&
                typeof r._terrainMacroSurfaceY === "function"
            ) {
                // Hydrosphäre bereit abwarten (Seen/Flüsse) — sonst fehlt der Carve-Kontext.
                if (r.state.hydrosphere && r.state.hydrosphere.ready) break;
            }
            await new Promise((res) => setTimeout(res, 50));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const origins = [
            [0, 0],
            [250, 250],
            [1000, -800],
            [2000, 1500],
            [-1500, 600],
        ];
        const N = 100; // 100×100 Raster
        const RES = 6; // 6 m Auflösung → 600 m × 600 m je Ort
        const results = [];
        for (const [ox, oz] of origins) {
            const surf = new Float64Array(N * N);
            let mn = Infinity,
                mx = -Infinity,
                sum = 0;
            for (let k = 0; k < N; k++) {
                for (let i = 0; i < N; i++) {
                    const x = ox + (i - N / 2) * RES;
                    const z = oz + (k - N / 2) * RES;
                    const s = r._terrainMacroSurfaceY(x, z);
                    surf[i + k * N] = s;
                    if (s < mn) mn = s;
                    if (s > mx) mx = s;
                    sum += s;
                }
            }
            const mean = sum / (N * N);
            // (2) WEITE FELDER — lokaler Gradient (Nachbar-Differenz) < 1.5 m → flach.
            let flat = 0,
                tot = 0;
            // (3) KONTRASTE — Nachbar-Sprung > 8 m über 6 m Distanz (Steilkante).
            let cliffs = 0;
            for (let k = 1; k < N - 1; k++) {
                for (let i = 1; i < N - 1; i++) {
                    const c = surf[i + k * N];
                    const gx = Math.abs(surf[i + 1 + k * N] - surf[i - 1 + k * N]) / 2;
                    const gz = Math.abs(surf[i + (k + 1) * N] - surf[i + (k - 1) * N]) / 2;
                    const g = Math.hypot(gx, gz);
                    tot++;
                    if (g < 1.5) flat++;
                    const dxStep = Math.abs(surf[i + 1 + k * N] - c);
                    const dzStep = Math.abs(surf[i + (k + 1) * N] - c);
                    if (dxStep > 8 || dzStep > 8) cliffs++;
                }
            }
            // (1) CANYONS — Tiefe unter dem lokalen 120-m-Fenster-Max (W = ±10 Samples = ±60 m).
            const W = 10;
            let deepest = 0,
                canyonCells = 0;
            for (let k = W; k < N - W; k++) {
                for (let i = W; i < N - W; i++) {
                    let localMax = -Infinity;
                    for (let dk = -W; dk <= W; dk += 2)
                        for (let di = -W; di <= W; di += 2) {
                            const v = surf[i + di + (k + dk) * N];
                            if (v > localMax) localMax = v;
                        }
                    const depth = localMax - surf[i + k * N];
                    if (depth > deepest) deepest = depth;
                    if (depth > 40) canyonCells++;
                }
            }
            results.push({
                origin: [ox, oz],
                min: +mn.toFixed(1),
                max: +mx.toFixed(1),
                range: +(mx - mn).toFixed(1),
                mean: +mean.toFixed(1),
                flatPct: +((100 * flat) / tot).toFixed(1),
                cliffs,
                deepestCanyon: +deepest.toFixed(1),
                canyonCells,
            });
        }

        // (4) HÖHLEN BRECHEN DURCH — an den 5 Orten je 400 Spalten scannen: gibt es eine AIR-Tasche
        // (Density<0) innerhalb 18 m UNTER der Oberfläche? (= ein sichtbarer Höhlen-/Canyon-Eingang).
        let surfaceVoidCols = 0,
            scanned = 0,
            deepestVoid = 0;
        for (const [ox, oz] of origins) {
            for (let s = 0; s < 400; s++) {
                const x = ox + (Math.floor(s / 20) - 10) * 22;
                const z = oz + ((s % 20) - 10) * 22;
                const surfY = r._terrainMacroSurfaceY(x, z);
                scanned++;
                // von surf-2 (knapp unter der Oberfläche) bis surf-18 scannen: eine AIR-Zelle = Eingang.
                let voidDepth = 0;
                for (let d = 2; d <= 18; d += 1.5) {
                    const dens = r._terrainBaseDensityAt(x, surfY - d, z);
                    if (dens < 0) {
                        voidDepth = d;
                        break;
                    }
                }
                if (voidDepth > 0) {
                    surfaceVoidCols++;
                    if (voidDepth > deepestVoid) deepestVoid = voidDepth;
                }
            }
        }
        return {
            results,
            cave: {
                surfaceVoidCols,
                scanned,
                voidPct: +((100 * surfaceVoidCols) / scanned).toFixed(2),
            },
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== T6 — DAS DRAMA, repräsentativ an 5 Orten (GEOMETRIE, headless beweisbar) ===\n");
    console.log(
        "Ort           | Relief(min..max=Δ)      | Felder flach% | Steilkanten | tiefste Schlucht | Canyon-Zellen"
    );
    console.log("-".repeat(108));
    for (const x of out.results) {
        const o = `(${x.origin[0]},${x.origin[1]})`.padEnd(13);
        const rel = `${x.min}..${x.max} = ${x.range}m`.padEnd(23);
        const fl = `${x.flatPct}%`.padEnd(13);
        const cl = `${x.cliffs}`.padEnd(11);
        const dc = `${x.deepestCanyon}m`.padEnd(16);
        console.log(`${o} | ${rel} | ${fl} | ${cl} | ${dc} | ${x.canyonCells}`);
    }
    console.log("\n(4) HÖHLEN BRECHEN DURCH die Oberfläche:");
    console.log(
        `    ${out.cave.surfaceVoidCols}/${out.cave.scanned} Spalten (${out.cave.voidPct}%) haben eine AIR-Tasche < 18 m unter der Oberfläche = sichtbare Eingänge.\n`
    );

    // Heuristische Ampel (kein Gate — nur Orientierung): das Drama trägt, wenn JEDER Ort Relief > 60 m hat,
    // es ECHTE flache Felder gibt (>15 % irgendwo), Canyons (deepest > 60 m irgendwo) + Höhlen-Eingänge (>0.5%).
    const anyDeepCanyon = out.results.some((x) => x.deepestCanyon > 60);
    const anyWideField = out.results.some((x) => x.flatPct > 15);
    const allRelief = out.results.every((x) => x.range > 60);
    const cavesBreak = out.cave.voidPct > 0.5;
    console.log("DRAMA-AMPEL (Orientierung, kein Gate):");
    console.log(`  gigantische Canyons (>60 m irgendwo):  ${anyDeepCanyon ? "✓" : "✗ FEHLT"}`);
    console.log(`  weite flache Felder (>15 % irgendwo):  ${anyWideField ? "✓" : "✗ FEHLT"}`);
    console.log(`  Relief überall > 60 m:                 ${allRelief ? "✓" : "✗ FEHLT"}`);
    console.log(`  Höhlen brechen durch (>0.5 %):         ${cavesBreak ? "✓" : "✗ FEHLT"}\n`);
    process.exit(0);
})();

// Diagnose der Schöpfer-Browser-Befunde (09.06. — die drei Schnittstellen-Lücken nach T4b+T6).
// MESSEN, bevor wir den Plan optimieren (kein Raten). Drei Achsen, an mehreren Orten + unter dem Meer:
//   (A) BAND-SANITY      — bricht die Surface die Chunk-Decke / der Canyon den Boden? (Löcher an Peaks/Sohlen)
//   (B) MESA-MOIRÉ       — wie viele Solid↔Air-Übergänge stapeln sich in einer Spalte einer Mesa-Region?
//                          (das „stacked thin layers / accordion" der Screenshots = die T6b-Terracing-Wand)
//   (C) MEER/HÖHLEN-LOCH — Spalten UNTER dem Meeresspiegel, deren Boden eine Höhle/Kaverne durchbricht
//                          (Density<0 unter dem Meeresboden → das Wasser hat einen Abfluss = „Löcher im Meer").
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4375;
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
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (
                r &&
                r.state &&
                typeof r._terrainBaseDensityAt === "function" &&
                r.state.hydrosphere &&
                r.state.hydrosphere.ready
            )
                break;
            await new Promise((res) => setTimeout(res, 50));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const base = s.terrainBaseHeight || 0;
        const cfg = r._voxelChunkConfig(0);
        const ceil = base - cfg.floorDrop + cfg.dimY * cfg.step;
        const floor = base - cfg.floorDrop;
        const waterLevel = typeof s.waterLevel === "number" ? s.waterLevel : base + 4;

        // (A) BAND-SANITY — radial bis 3 km: max Surface (Decke?) + min Surface (Canyon, Boden?).
        let surfMax = -Infinity,
            surfMin = Infinity,
            ceilBreach = 0,
            floorBreach = 0,
            sampled = 0;
        for (let rad = 0; rad <= 3000; rad += 60) {
            for (let a = 0; a < 16; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = Math.cos(ang) * rad,
                    z = Math.sin(ang) * rad;
                const sy = r._terrainMacroSurfaceY(x, z);
                sampled++;
                if (sy > surfMax) surfMax = sy;
                if (sy < surfMin) surfMin = sy;
                // Decke: gibt es über der Surface noch Roughness-Spitzen über der Decke? (Density>0 über ceil)
                if (r._terrainBaseDensityAt(x, ceil + 1, z) > 0) ceilBreach++;
                // Boden: ist der Boden bei floor-2 fest? (sonst Loch nach unten)
                if (r._terrainBaseDensityAt(x, floor - 2, z) <= 0) floorBreach++;
            }
        }

        // (B) MESA-MOIRÉ — in den Mesa-Regionen (wo das Terracing feuert): zähle die Solid↔Air-Übergänge
        // in einer vertikalen Spalte (von surf+4 bis surf-40, 0.9-m-Schritt). Eine glatte Wand = 1 Übergang;
        // ein „accordion" = viele. Plus: messe die horizontale Cliff-Dichte (Surface-Sprünge > 10 m / 4 m).
        const mesaSpots = [];
        let mesaTransSum = 0,
            mesaTransMax = 0,
            mesaCols = 0,
            mesaCliffRuns = 0;
        // Mesa-Regionen finden: scanne ein 2-km-Gitter, finde Orte mit hohem mesaRegion-Noise.
        const n = r._voxelNoise;
        for (let gx = -2000; gx <= 2000 && mesaSpots.length < 6; gx += 137) {
            for (let gz = -2000; gz <= 2000 && mesaSpots.length < 6; gz += 149) {
                const wx = gx + n.noise2D(gx * 0.00026 + 11.3, gz * 0.00026 + 4.1) * 70;
                const wz = gz + n.noise2D(gx * 0.00026 + 41.7, gz * 0.00026 + 23.9) * 70;
                const mesaRegion = Math.max(
                    0,
                    Math.min(1, (n.noise2D(wx * 0.00034 + 13.7, wz * 0.00034 + 47.3) - 0.45) / 0.13)
                );
                if (mesaRegion > 0.6) mesaSpots.push([gx, gz, +mesaRegion.toFixed(2)]);
            }
        }
        for (const [ox, oz] of mesaSpots) {
            // 12×12-Spalten-Raster über die Mesa-Region, je Spalte die vertikalen Übergänge zählen.
            for (let k = 0; k < 12; k++)
                for (let i = 0; i < 12; i++) {
                    const x = ox + (i - 6) * 4,
                        z = oz + (k - 6) * 4;
                    const sy = r._terrainMacroSurfaceY(x, z);
                    let trans = 0,
                        prev = r._terrainBaseDensityAt(x, sy + 4, z) > 0;
                    for (let y = sy + 3; y >= sy - 40; y -= 0.9) {
                        const sol = r._terrainBaseDensityAt(x, y, z) > 0;
                        if (sol !== prev) trans++;
                        prev = sol;
                    }
                    mesaTransSum += trans;
                    if (trans > mesaTransMax) mesaTransMax = trans;
                    mesaCols++;
                    // horizontale Cliff: Surface-Sprung zum +x-Nachbar > 10 m?
                    if (Math.abs(r._terrainMacroSurfaceY(x + 4, z) - sy) > 10) mesaCliffRuns++;
                }
        }

        // (C) MEER/HÖHLEN-LOCH — scanne ein weites Gitter, finde Ozean-Spalten (macroSurf < waterLevel),
        // prüfe ob der Meeresboden eine Höhle/Kaverne durchbricht (Density<0 IM Boden unter dem Meeresboden,
        // ODER der Meeresboden selbst ist offen). Zähle die Löcher + ihre Tiefe.
        let oceanCols = 0,
            oceanHoles = 0,
            holeDepthMax = 0;
        const holeSpots = [];
        for (let gx = -2400; gx <= 2400; gx += 60) {
            for (let gz = -2400; gz <= 2400; gz += 60) {
                const sy = r._terrainMacroSurfaceY(gx, gz);
                if (sy >= waterLevel - 1) continue; // kein Ozean hier
                oceanCols++;
                // Meeresboden = höchste solide Zelle ab waterLevel abwärts. Tief scannen (bis sy-30): ein
                // rauer Meeresboden kann real bis ~sy-12 unter die Makro-Surface tauchen — das ist KEIN Loch
                // (der Boden ist da, nur tiefer), erst gar-kein-Boden bis sy-30 wäre ein echtes Leck.
                let floorY = null;
                for (let y = waterLevel; y >= sy - 30; y -= 0.9) {
                    if (r._terrainBaseDensityAt(gx, y, gz) > 0) {
                        floorY = y;
                        break;
                    }
                }
                if (floorY === null) {
                    // gar kein Boden bis sy-30 → ein echtes Loch (Wasser fällt durch).
                    oceanHoles++;
                    continue;
                }
                // gibt es UNTER dem Boden (bis floorY-30) eine AIR-Tasche (Höhle/Kaverne)? = Abfluss-Risiko.
                let voidBelow = 0;
                for (let y = floorY - 1; y >= floorY - 30; y -= 0.9) {
                    if (r._terrainBaseDensityAt(gx, y, gz) < 0) {
                        voidBelow = floorY - y;
                        break;
                    }
                }
                if (voidBelow > 0) {
                    oceanHoles++;
                    if (voidBelow > holeDepthMax) holeDepthMax = voidBelow;
                    if (holeSpots.length < 5) holeSpots.push([gx, gz, +voidBelow.toFixed(1)]);
                }
            }
        }

        return {
            band: {
                base: +base.toFixed(1),
                floor: +floor.toFixed(1),
                ceil: +ceil.toFixed(1),
                surfMin: +surfMin.toFixed(1),
                surfMax: +surfMax.toFixed(1),
                ceilBreach,
                floorBreach,
                sampled,
            },
            mesa: {
                spots: mesaSpots.length,
                cols: mesaCols,
                avgTrans: mesaCols ? +(mesaTransSum / mesaCols).toFixed(2) : 0,
                maxTrans: mesaTransMax,
                cliffPct: mesaCols ? +((100 * mesaCliffRuns) / mesaCols).toFixed(1) : 0,
            },
            ocean: {
                cols: oceanCols,
                holes: oceanHoles,
                holePct: oceanCols ? +((100 * oceanHoles) / oceanCols).toFixed(2) : 0,
                holeDepthMax: +holeDepthMax.toFixed(1),
                holeSpots,
            },
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== DIE DREI SCHÖPFER-BEFUNDE, GEMESSEN (nach T4b+T6) ===\n");
    const b = out.band;
    console.log("(A) BAND-SANITY (Löcher an Peaks/Sohlen?):");
    console.log(`    Chunk-Band: floor ${b.floor} … ceil ${b.ceil}  (base ${b.base})`);
    console.log(`    Surface radial bis 3 km: ${b.surfMin} … ${b.surfMax}  (${b.sampled} Samples)`);
    console.log(
        `    Decken-Durchbruch (Density>0 über ceil): ${b.ceilBreach}  ${b.ceilBreach === 0 ? "✓" : "✗ LÖCHER AN PEAKS"}`
    );
    console.log(
        `    Boden-Durchbruch (Density≤0 unter floor): ${b.floorBreach}  ${b.floorBreach === 0 ? "✓" : "✗ LÖCHER NACH UNTEN"}\n`
    );
    const m = out.mesa;
    console.log("(B) MESA-MOIRÉ (das stacked-thin-layers/accordion der Screenshots):");
    console.log(`    Mesa-Regionen geprüft: ${m.spots}  ·  Spalten: ${m.cols}`);
    console.log(
        `    Solid↔Air-Übergänge pro Spalte: ⌀${m.avgTrans}, max ${m.maxTrans}  (glatte Wand = 1–2; >4 = accordion-Stacking)`
    );
    console.log(
        `    Steilkanten-Anteil (>10 m / 4 m): ${m.cliffPct}%  ${m.avgTrans > 3 || m.cliffPct > 40 ? "✗ MOIRÉ-RISIKO" : "✓"}\n`
    );
    const o = out.ocean;
    console.log("(C) MEER/HÖHLEN-LOCH (Löcher im Meer, Durchbrüche in den Boden):");
    console.log(`    Ozean-Spalten geprüft: ${o.cols}`);
    console.log(
        `    davon mit Höhlen-Loch unter dem Meeresboden: ${o.holes} (${o.holePct}%), tiefste ${o.holeDepthMax} m`
    );
    console.log(
        `    ${o.holes === 0 ? "✓ kein Abfluss" : "✗ DAS MEER HAT ABFLUSS-LÖCHER → " + JSON.stringify(o.holeSpots)}\n`
    );
    process.exit(0);
})();

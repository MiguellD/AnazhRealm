// Diagnose: das Schnee-Band gegen die HEUTIGE Terrain-Höhe.
// Schöpfer-Hypothese (04.06.): die Schnee-Zeile `mix(snow, ss(12,42,y))` ist
// eine ABSOLUTE Welt-Höhe, kalibriert als das Terrain klein war (Gipfel ~40 m).
// Nach V14 (Terrain geweitet) + V17.96 (Berge 244 m) liegt y=12..42 m jetzt fast
// auf Bodenhöhe → Schnee sprenkelt sich über normales Gelände statt auf Gipfel
// = die „krassen Flecken" (stone 0.42 vs snow 0.92 = 2× Kontrast), die unter
// Licht auseinanderdriften. Diese Messung quantifiziert das (MESSEN vor Schneiden,
// V9.58/V17.90), bevor wir die Schwelle nachziehen.
//
// Lauf: `node scripts/diag-snowband.cjs`. Kein CI-Gate.

const { spawn } = require("child_process");
const puppeteer = require("puppeteer");

const SERVER_URL = "http://127.0.0.1:4312/index.html";
const WORLD_READY_TIMEOUT_MS = 60000;

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const t = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(t);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

function pct(arr, p) {
    if (!arr.length) return NaN;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * p)));
    return sorted[idx];
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
    });
    try {
        const page = await browser.newPage();
        page.on("pageerror", (e) => console.error("PAGE-ERROR:", String(e)));
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

        const t0 = Date.now();
        let ready = false;
        while (Date.now() - t0 < WORLD_READY_TIMEOUT_MS) {
            const r = await page
                .evaluate(() => {
                    const w = window.anazhRealm;
                    return !!(w && w.state && w.state.hydrosphere && w.state.hydrosphere.ready);
                })
                .catch(() => false);
            if (r) {
                ready = true;
                break;
            }
            await new Promise((r2) => setTimeout(r2, 500));
        }
        if (!ready) throw new Error(`Welt nicht bereit in ${WORLD_READY_TIMEOUT_MS / 1000}s`);
        console.log(`Welt bereit nach ${Math.round((Date.now() - t0) / 1000)}s.\n`);

        const data = await page.evaluate(() => {
            const r = window.anazhRealm;
            const s = r.state;
            const ss = (e0, e1, x) => {
                let t = (x - e0) / (e1 - e0);
                t = t < 0 ? 0 : t > 1 ? 1 : t;
                return t * t * (3 - 2 * t);
            };
            // Zwei Regionen: NAHE (±300 m, was der Spieler beim Spawn sieht) und
            // WEIT (±2048 m, die Worldgen-Region). Beide messen, weil die Schöpfer-
            // Beobachtung "Schnee in fast jedem Chunk" die nahe Region betrifft.
            const measure = (REGION, N) => {
                const HALF = REGION / 2;
                let hash = 2166136261;
                const seedStr = (s.worldMeta && s.worldMeta.seed) || "diag-snow";
                for (let i = 0; i < seedStr.length; i++) hash = ((hash ^ seedStr.charCodeAt(i)) * 16777619) >>> 0;
                let lcg = hash || 1;
                const next = () => {
                    lcg = (lcg * 1664525 + 1013904223) >>> 0;
                    return lcg / 4294967296;
                };
                const base = s.terrainBaseHeight || 0;
                // Kontinentale Basis (cont0) — bit-identisch zu _terrainMacroSurfaceY.
                const cont0At = (x, z) => {
                    const wpX = r._voxelNoise.noise2D(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70;
                    const wpZ = r._voxelNoise.noise2D(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70;
                    const cB = r._voxelNoise.noise2D((x + wpX) * 0.00014 + 7.2, (z + wpZ) * 0.00014 + 3.8);
                    return Math.max(0, cB) * 130 + cB * 15 + 12;
                };
                const heights = [];
                const proms = []; // y - (base + cont0) = Relief über der kontinentalen Basis
                let aboveWater = 0;
                let snowStart = 0; // y >= 12 (Schnee beginnt einzumischen)
                let snowFull = 0; // y >= 42 (voller Schnee)
                let snowBlendSum = 0; // Σ ss(12,42,y) über LAND-Vertices
                for (let i = 0; i < N; i++) {
                    const x = (next() - 0.5) * REGION;
                    const z = (next() - 0.5) * REGION;
                    const y = r._terrainMacroSurfaceY(x, z, true);
                    const wY = r._waterLevelAt ? r._waterLevelAt(x, z) : -3;
                    if (y <= wY + 0.5) continue; // unter Wasser → kein sichtbarer Schnee
                    aboveWater++;
                    heights.push(y);
                    proms.push(y - (base + cont0At(x, z)));
                    const blend = ss(12, 42, y);
                    snowBlendSum += blend;
                    if (y >= 12) snowStart++;
                    if (y >= 42) snowFull++;
                }
                return { HALF, N, aboveWater, snowStart, snowFull, snowBlendSum, heights, proms };
            };
            return { near: measure(600, 6000), wide: measure(4096, 8000) };
        });

        const report = (label, m) => {
            const h = m.heights;
            const aw = m.aboveWater || 1;
            console.log(`### ${label} (±${m.HALF} m, ${m.N} Punkte, ${m.aboveWater} über Wasser)`);
            console.log(
                `  Höhe:  p5=${pct(h, 0.05).toFixed(1)}  p25=${pct(h, 0.25).toFixed(1)}  ` +
                    `MEDIAN=${pct(h, 0.5).toFixed(1)}  p75=${pct(h, 0.75).toFixed(1)}  ` +
                    `p90=${pct(h, 0.9).toFixed(1)}  p95=${pct(h, 0.95).toFixed(1)}  max=${pct(h, 1).toFixed(1)} m`
            );
            console.log(
                `  SCHNEE-ALT: y>=12 (beginnt): ${((100 * m.snowStart) / aw).toFixed(1)}%  ` +
                    `| y>=42 (voll): ${((100 * m.snowFull) / aw).toFixed(1)}%  ` +
                    `| mittlerer Schnee-Anteil: ${(m.snowBlendSum / aw).toFixed(3)}`
            );
            const p = m.proms;
            console.log(
                `  PROMINENZ (y-cont0):  p50=${pct(p, 0.5).toFixed(1)}  p75=${pct(p, 0.75).toFixed(1)}  ` +
                    `p90=${pct(p, 0.9).toFixed(1)}  p95=${pct(p, 0.95).toFixed(1)}  ` +
                    `p98=${pct(p, 0.98).toFixed(1)}  max=${pct(p, 1).toFixed(1)} m`
            );
            // Was würde ss(START,FULL,prominence) an Schnee-Anteil geben?
            const trySnow = (start, full) => {
                let sum = 0;
                for (const pr of p) {
                    let t = (pr - start) / (full - start);
                    t = t < 0 ? 0 : t > 1 ? 1 : t;
                    sum += t * t * (3 - 2 * t);
                }
                return sum / (p.length || 1);
            };
            console.log(
                `  PROBE PROMINENZ-SCHNEE: ss(50,115)NEU=${trySnow(50, 115).toFixed(3)}  ` +
                    `ss(70,140)=${trySnow(70, 140).toFixed(3)}  ss(90,170)=${trySnow(90, 170).toFixed(3)}`
            );
            console.log("");
        };

        console.log("=== SCHNEE-BAND vs HEUTIGE TERRAIN-HÖHE ===\n");
        console.log("Schnee-Zeile: mix(snow=[0.92,0.93,1.0], ss(12,42,y)) — ABSOLUTE Welt-Höhe.\n");
        report("NAHE (Spawn-Sicht)", data.near);
        report("WEIT (Worldgen-Region)", data.wide);
        console.log("Lesart: Ein mittlerer Schnee-Anteil > ~0.1 in der NAHEN Region heißt");
        console.log("Schnee mischt sich über weite Bodenflächen ein (nicht nur Gipfel) →");
        console.log("die stone/snow-Hochkontrast-Flecken. Ziel-Schwelle: Schnee erst hoch");
        console.log("(z.B. ab p90 der Höhe) ODER relativ zur lokalen Erhebung.");
    } finally {
        await browser.close();
        server.kill();
    }
})();

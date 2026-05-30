// V9.57 — Diagnose-Pass für Relief + Hochsee-Sichtbarkeit.
// Schöpfer-Browser-Befund (Welle vor V9.57): "habe keine hochseen gefunden ...
// alles wasser auf ähnlicher höhe ... berge wirken zu wenig hoch, zu wenig
// weit, nicht über weite phasen aufbauend". Vor einer Worldgen-Wandel-Welle
// (V9.58) sammeln wir empirische Daten statt zu parameter-würfeln.
//
// Was dieser Pass misst:
//   (a) Höhen-Verteilung von 4000 Random-Sample-Punkten in der 2048×2048-Region:
//       Min, Max, Median, p5, p25, p75, p95 — beantwortet "wie hoch ist das
//       Relief realistisch (nicht theoretisch)".
//   (b) Hydrosphäre-Stats (surfMin/Max, waterLevel, lakeCells, seaCells).
//   (c) Tarn-Bilanz: state.tarns Länge, Höhen-Spanne, Radien.
//   (d) See-Levels: state.hydrosphere.lakes durchgehen, Histogramm der `level`-
//       Werte — beantwortet "sind die See-Spiegel wirklich auf ähnlicher Höhe".
//   (e) Top-Down-Screenshot (vogelperspektive, kamera senkrecht).
//
// Lauf: `node scripts/diag-relief.cjs`. Kein npm-Skript; ein Mess-Werkzeug,
// kein CI-Gate. Output: stdout-Report + artifacts/diag-relief-{top,side}.png.

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const SERVER_URL = "http://127.0.0.1:4312/index.html";
const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");
const SCREENSHOT_TOP = path.join(ARTIFACT_DIR, "diag-relief-top.png");
const SCREENSHOT_SIDE = path.join(ARTIFACT_DIR, "diag-relief-side.png");
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

function histogram(values, bucketSize) {
    const buckets = new Map();
    for (const v of values) {
        const b = Math.floor(v / bucketSize) * bucketSize;
        buckets.set(b, (buckets.get(b) || 0) + 1);
    }
    return [...buckets.entries()].sort((a, b) => a[0] - b[0]);
}

(async () => {
    fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
    console.log("V9.57 Diagnose-Pass: Relief + Hochsee-Sichtbarkeit");
    console.log("===================================================\n");

    const server = await startSaveServer();
    console.log("Save-Server läuft. Starte Browser ...");

    const browser = await puppeteer.launch({
        headless: true,
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
    await page.setViewport({ width: 1280, height: 720 });

    const consoleErrors = [];
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });

        // Auf die Hydrosphäre warten (Worldgen + Hydro-Compute können bis ~30 s
        // dauern). Poll alle 500 ms bis `state.hydrosphere.ready === true`.
        const t0 = Date.now();
        let ready = false;
        while (Date.now() - t0 < WORLD_READY_TIMEOUT_MS) {
            const r = await page.evaluate(() => {
                const w = window.anazhRealm;
                return !!(w && w.state && w.state.hydrosphere && w.state.hydrosphere.ready);
            }).catch(() => false);
            if (r) {
                ready = true;
                break;
            }
            await new Promise((r2) => setTimeout(r2, 500));
        }
        if (!ready) throw new Error(`Hydrosphäre wurde nicht bereit innerhalb ${WORLD_READY_TIMEOUT_MS / 1000}s`);
        console.log(`Welt bereit nach ${Math.round((Date.now() - t0) / 1000)}s. Sample-Pass startet ...\n`);

        // ### Datenerhebung ###
        const data = await page.evaluate(() => {
            const r = window.anazhRealm;
            const s = r.state;
            const REGION = 2048;
            const HALF = REGION / 2;

            // (a) 4000 Random-Sample-Punkte — die Makro-Surface + die echte
            // Voxel-Surface. Verschiedene Stichproben, weil Voxel-Surface schon
            // den Carve + die Detail-Oktave trägt.
            const N = 4000;
            const macroY = new Float64Array(N);
            const voxelY = new Float64Array(N);
            // Deterministischer RNG (LCG mit Welt-Seed-Hash), damit ein Re-Lauf
            // dieselben Punkte misst.
            const seedStr = (s.worldMeta && s.worldMeta.seed) || "diag-relief";
            let hash = 2166136261;
            for (let i = 0; i < seedStr.length; i++) hash = (hash ^ seedStr.charCodeAt(i)) * 16777619 >>> 0;
            let lcg = hash || 1;
            const next = () => { lcg = (lcg * 1664525 + 1013904223) >>> 0; return lcg / 4294967296; };
            for (let i = 0; i < N; i++) {
                const x = (next() - 0.5) * REGION;
                const z = (next() - 0.5) * REGION;
                macroY[i] = r._terrainMacroSurfaceY(x, z, true);
                voxelY[i] = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : macroY[i];
            }

            // (b) Hydrosphäre-Stats (vorgekochte Diagnostik)
            const hs = s.hydrosphere || {};
            const stats = hs.stats || null;

            // (c) Tarn-Bilanz
            const tarns = (s.tarns || []).map((t) => ({
                x: Math.round(t.x), z: Math.round(t.z),
                surf: Math.round(t.surf), r: Math.round(t.r), d: Math.round(t.d),
            }));

            // (d) See-Levels
            const lakes = (hs.lakes || []).map((lk) => ({
                id: lk.id,
                level: Math.round(lk.level * 10) / 10,
                floorY: Math.round(lk.floorY * 10) / 10,
                rimY: Math.round(lk.rimY * 10) / 10,
                cells: lk.cells ? lk.cells.length : 0,
                bbox: lk.bbox ? {
                    w: Math.round(lk.bbox.maxX - lk.bbox.minX),
                    h: Math.round(lk.bbox.maxZ - lk.bbox.minZ),
                } : null,
            }));

            // (V9.59) Welt-Awareness: zählt Architekturen + Gras-Instanzen,
            // die UNTER Wasser stehen (Sünde-Counter). Vor V9.59 hatte die
            // Welt keine Wasser-Awareness; nach V9.59 sollte der Counter ~0
            // sein. Architekturen aus state.architectures (Position), Gras
            // aus state.voxelChunkGrass (InstancedMesh.matrices).
            let archTotal = 0;
            let archInWater = 0;
            for (const a of s.architectures || []) {
                if (!a || !a.position) continue;
                archTotal++;
                const waterY = r._waterLevelAt(a.position.x, a.position.z);
                const surfY = r._voxelSurfaceY(a.position.x, a.position.z);
                if (surfY !== null && surfY < waterY) archInWater++;
            }
            let grassTotal = 0;
            let grassInWater = 0;
            if (s.voxelChunkGrass) {
                const tmpMatrix = new (window.THREE || {}).Matrix4 ? new window.THREE.Matrix4() : null;
                const tmpPos = (window.THREE || {}).Vector3 ? new window.THREE.Vector3() : null;
                for (const inst of s.voxelChunkGrass.values()) {
                    if (!inst || !inst.count || !tmpMatrix) continue;
                    for (let i = 0; i < inst.count; i++) {
                        inst.getMatrixAt(i, tmpMatrix);
                        tmpPos.setFromMatrixPosition(tmpMatrix);
                        grassTotal++;
                        const wY = r._waterLevelAt(tmpPos.x, tmpPos.z);
                        if (tmpPos.y < wY) grassInWater++;
                    }
                }
            }
            const awareness = { archTotal, archInWater, grassTotal, grassInWater };

            // (V9.60-b.diag) Hydrosphäre-Topologie — empirische Metriken für
            // die Wurzel-Welle. Misst (1) Fluss-Längen-Verteilung, (2) See-
            // Höhen-Varianz, (3) Uferlinien-Variations-Index (Buchten),
            // (4) Land-über-Wasser-Marge. Schöpfer-Befund nach V9.59-d.1:
            // "Sand-Streifen zu homogen, in echt gibt es buchten und karge
            // stellen" + "Biome scheinen unter Wasser". Beide Wurzeln leben
            // in der Hydrosphäre-Topologie — diese Metriken sind die
            // Erfolgs-Akzeptanz für V9.60-b-Sub-Wellen.
            const rivers = hs.rivers || [];
            const cell = hs.cell || 16;
            const riverLengths = rivers
                .filter((rv) => rv && rv.points)
                .map((rv) => rv.points.length * cell);
            riverLengths.sort((a, b) => a - b);
            const riverMedian = riverLengths.length
                ? riverLengths[Math.floor(riverLengths.length * 0.5)]
                : 0;
            const riverStats = {
                count: riverLengths.length,
                min: riverLengths[0] || 0,
                median: riverMedian,
                max: riverLengths[riverLengths.length - 1] || 0,
                longCount: riverLengths.filter((l) => l > 500).length,
                shortCount: riverLengths.filter((l) => l < 100).length,
            };
            const lakeLevels = (hs.lakes || []).map((lk) => lk.level).filter((v) => Number.isFinite(v));
            let lakeStdDev = 0;
            if (lakeLevels.length > 1) {
                const mean = lakeLevels.reduce((a, b) => a + b, 0) / lakeLevels.length;
                const variance = lakeLevels.reduce((sum, v) => sum + (v - mean) ** 2, 0) / lakeLevels.length;
                lakeStdDev = Math.sqrt(variance);
            }
            // Uferlinien-Variations-Index: Anzahl Wasser-Land-Kanten geteilt
            // durch sqrt(Wasser-Zellen). Theoretisch: Kreis ~3.5, gerade Linie
            // → klein, Buchten → hoch (>5 = fraktal-küstenartig).
            let coastEdges = 0;
            let waterCells = 0;
            let landCellsAboveWater = 0;
            if (hs.water && hs.water.waterKind && hs.dim) {
                const wK = hs.water.waterKind;
                const dim = hs.dim;
                for (let j = 0; j < dim; j++) {
                    for (let i = 0; i < dim; i++) {
                        const idx = i + j * dim;
                        const wet = wK[idx] !== 0;
                        if (wet) waterCells++;
                        else landCellsAboveWater++;
                        if (wet) {
                            const ns = [
                                i > 0 ? wK[i - 1 + j * dim] : 0,
                                i < dim - 1 ? wK[i + 1 + j * dim] : 0,
                                j > 0 ? wK[i + (j - 1) * dim] : 0,
                                j < dim - 1 ? wK[i + (j + 1) * dim] : 0,
                            ];
                            for (const n of ns) if (n === 0) coastEdges++;
                        }
                    }
                }
            }
            const coastIndex = waterCells > 0 ? coastEdges / Math.sqrt(waterCells) : 0;
            // Land-über-Wasser-Marge: Median(Surface) − waterLevel. Positiv
            // = Median-Land liegt über Wasser; negativ = die Hälfte der
            // Welt ertrinkt. V9.59-Diagnose: +0.8 m (fast genau am Wasser).
            const sortedMacro = Array.from(macroY).sort((a, b) => a - b);
            const medianSurf = sortedMacro[Math.floor(sortedMacro.length * 0.5)] || 0;
            const landMargin = medianSurf - (s.waterLevel || 0);
            const topology = {
                rivers: riverStats,
                lakeLevelStdDev: lakeStdDev,
                coastIndex,
                waterCells,
                landCells: landCellsAboveWater,
                landMargin,
            };

            // (V14.0) Terrain-Charakteristik — die "episch vs. spitz"-Metriken.
            // Ein regelmässiges Makro-Höhen-Grid (Steigung + Kohärenz brauchen
            // Nachbar-Beziehungen, anders als die Random-Stichprobe oben).
            // Beantwortet den Schöpfer-Befund "spitzig/steil, nicht über weite
            // Strecken aufbauend": misst Hang-Neigung, die charakteristische
            // Feature-Grösse (Autokorrelation), Ketten-Kohärenz, Plateau-Anteil.
            const GDIM = 128; // 128×128 über 2048 m = 16 m Auflösung
            const GSTEP = REGION / GDIM;
            const gh = new Float64Array(GDIM * GDIM);
            for (let j = 0; j < GDIM; j++) {
                for (let i = 0; i < GDIM; i++) {
                    const gx = -HALF + (i + 0.5) * GSTEP;
                    const gz = -HALF + (j + 0.5) * GSTEP;
                    gh[i + j * GDIM] = r._terrainMacroSurfaceY(gx, gz, true);
                }
            }
            // Steigung pro Zelle (zentrale Differenz, dimensionslos m/m → Grad).
            const slopes = [];
            for (let j = 1; j < GDIM - 1; j++) {
                for (let i = 1; i < GDIM - 1; i++) {
                    const ddx = (gh[i + 1 + j * GDIM] - gh[i - 1 + j * GDIM]) / (2 * GSTEP);
                    const ddz = (gh[i + (j + 1) * GDIM] - gh[i + (j - 1) * GDIM]) / (2 * GSTEP);
                    slopes.push(Math.hypot(ddx, ddz));
                }
            }
            slopes.sort((a, b) => a - b);
            const slopeAt = (p) => slopes[Math.floor(slopes.length * p)] || 0;
            const toDeg = (s2) => (Math.atan(s2) * 180) / Math.PI;
            const steepFrac = slopes.filter((v) => v > 1).length / slopes.length; // >45°
            const gentleFrac = slopes.filter((v) => v < 0.2).length / slopes.length; // <11°
            // Höhen-Autokorrelation entlang x: über welche Distanz sinkt die
            // Korrelation auf 1/e (0.3679)? = charakteristische Feature-Grösse.
            // Klein (~80 m) = Alpen-Miniatur; gross (>500 m) = kontinentale Weite.
            const ghMean = gh.reduce((a, b) => a + b, 0) / gh.length;
            let ghVar = 0;
            for (const v of gh) ghVar += (v - ghMean) ** 2;
            ghVar /= gh.length;
            const autocorr = (lag) => {
                let acc = 0;
                let n = 0;
                for (let j = 0; j < GDIM; j++) {
                    for (let i = 0; i < GDIM - lag; i++) {
                        acc += (gh[i + j * GDIM] - ghMean) * (gh[i + lag + j * GDIM] - ghMean);
                        n++;
                    }
                }
                return ghVar > 0 ? acc / n / ghVar : 0;
            };
            let corrLenCells = GDIM;
            for (let lag = 1; lag < GDIM; lag++) {
                if (autocorr(lag) < 0.3679) {
                    corrLenCells = lag;
                    break;
                }
            }
            // Hochland-Kohäsion: von den Top-15%-Höhen-Zellen, welcher Anteil hat
            // >=4 von 8 Nachbarn ebenfalls im Top-15%? (1.0 = zusammenhängende
            // Ketten/Hochländer, ~0 = isolierte Zacken). Plus Plateau-Anteil:
            // hoch (>p70) UND flach (<0.25 Steigung) = weite Hochebene.
            const sortedGh = Array.from(gh).sort((a, b) => a - b);
            const hiThresh = sortedGh[Math.floor(sortedGh.length * 0.85)];
            const p70h = sortedGh[Math.floor(sortedGh.length * 0.7)];
            let hiCount = 0;
            let hiCohesive = 0;
            let plateauCount = 0;
            for (let j = 1; j < GDIM - 1; j++) {
                for (let i = 1; i < GDIM - 1; i++) {
                    const h = gh[i + j * GDIM];
                    const ddx = (gh[i + 1 + j * GDIM] - gh[i - 1 + j * GDIM]) / (2 * GSTEP);
                    const ddz = (gh[i + (j + 1) * GDIM] - gh[i + (j - 1) * GDIM]) / (2 * GSTEP);
                    const sl = Math.hypot(ddx, ddz);
                    if (h > p70h && sl < 0.25) plateauCount++;
                    if (h >= hiThresh) {
                        hiCount++;
                        let hiN = 0;
                        for (let dj = -1; dj <= 1; dj++)
                            for (let di = -1; di <= 1; di++) {
                                if (di === 0 && dj === 0) continue;
                                if (gh[i + di + (j + dj) * GDIM] >= hiThresh) hiN++;
                            }
                        if (hiN >= 4) hiCohesive++;
                    }
                }
            }
            // (V14.8) Ketten-Elongation: Connected-Components (4-Nachbar) der
            // Top-15%-Zellen; je Komponente Elongation = max(bboxW,bboxH)/sqrt(area),
            // flächengewichtet. Eine lineare Kette (Anden) → hoch (~sqrt(Länge)); ein
            // runder Blob (isotropes Noise) → ~1.1. Misst „lineare Ketten vs Flecken".
            const hiMask = new Uint8Array(GDIM * GDIM);
            for (let q = 0; q < gh.length; q++) hiMask[q] = gh[q] >= hiThresh ? 1 : 0;
            const labelSeen = new Uint8Array(GDIM * GDIM);
            let elongWeightedSum = 0;
            let elongAreaSum = 0;
            let chainCompCount = 0;
            const ccStack = [];
            for (let q0 = 0; q0 < GDIM * GDIM; q0++) {
                if (!hiMask[q0] || labelSeen[q0]) continue;
                ccStack.length = 0;
                ccStack.push(q0);
                labelSeen[q0] = 1;
                let minI = GDIM;
                let maxI = 0;
                let minJ = GDIM;
                let maxJ = 0;
                let area = 0;
                while (ccStack.length) {
                    const q = ccStack.pop();
                    const qi = q % GDIM;
                    const qj = (q / GDIM) | 0;
                    area++;
                    if (qi < minI) minI = qi;
                    if (qi > maxI) maxI = qi;
                    if (qj < minJ) minJ = qj;
                    if (qj > maxJ) maxJ = qj;
                    const nbs = [qi > 0 ? q - 1 : -1, qi < GDIM - 1 ? q + 1 : -1, qj > 0 ? q - GDIM : -1, qj < GDIM - 1 ? q + GDIM : -1];
                    for (const nq of nbs) if (nq >= 0 && hiMask[nq] && !labelSeen[nq]) { labelSeen[nq] = 1; ccStack.push(nq); }
                }
                if (area >= 4) {
                    const elong = Math.max(maxI - minI + 1, maxJ - minJ + 1) / Math.sqrt(area);
                    elongWeightedSum += elong * area;
                    elongAreaSum += area;
                    chainCompCount++;
                }
            }
            const terrainChar = {
                slopeMedianDeg: toDeg(slopeAt(0.5)),
                slopeP90Deg: toDeg(slopeAt(0.9)),
                steepFrac,
                gentleFrac,
                corrLenM: corrLenCells * GSTEP,
                hiCohesion: hiCount > 0 ? hiCohesive / hiCount : 0,
                plateauFrac: plateauCount / ((GDIM - 2) * (GDIM - 2)),
                chainElong: elongAreaSum > 0 ? elongWeightedSum / elongAreaSum : 0,
                chainCompCount,
            };

            // (e) Welt-Meta
            const meta = {
                seed: s.worldMeta && s.worldMeta.seed,
                terrainBaseHeight: s.terrainBaseHeight,
                terrainSteepness: s.terrainSteepness,
                waterLevel: s.waterLevel,
            };

            // (f) Decken-Marge — wo sitzt die Voxel-Chunk-Decke relativ zum
            // höchsten Makro-Surface-Sample?
            const cfg = r._voxelChunkConfig();
            const base = meta.terrainBaseHeight || 0;
            const ceiling = base + (cfg.dimY * cfg.step) - cfg.floorDrop;

            return {
                meta,
                stats,
                tarns,
                lakes,
                awareness,
                topology,
                terrainChar,
                macroY: Array.from(macroY),
                voxelY: Array.from(voxelY),
                chunkCfg: { dimY: cfg.dimY, step: cfg.step, floorDrop: cfg.floorDrop, ceiling },
            };
        });

        // ### Top-Down-Screenshot — Kamera 400 m über dem Welt-Ursprung, senkrecht runter ###
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const cam = r.state.camera;
            const THREE = window.THREE || (r.state.scene && r.state.scene.userData && r.state.scene.userData.THREE);
            cam.position.set(0, 400, 0.01);
            cam.lookAt(0, 0, 0);
            cam.updateMatrixWorld(true);
            r.state.renderer.render(r.state.scene, cam);
        }).catch((e) => console.warn("Top-Down-Render failed:", e.message));
        await page.screenshot({ path: SCREENSHOT_TOP });

        // ### Side-View — von -700,80,0 in Richtung +X, etwas erhöht ###
        await page.evaluate(() => {
            const r = window.anazhRealm;
            const cam = r.state.camera;
            cam.position.set(-700, 80, 0);
            cam.lookAt(0, 20, 0);
            cam.updateMatrixWorld(true);
            r.state.renderer.render(r.state.scene, cam);
        }).catch(() => null);
        await page.screenshot({ path: SCREENSHOT_SIDE });

        // ### Report ###
        const m = data.macroY;
        const v = data.voxelY;
        const base = data.meta.terrainBaseHeight || 0;

        console.log("=== WELT-META ===");
        console.log(`  Seed: ${data.meta.seed}`);
        console.log(`  terrainBaseHeight: ${data.meta.terrainBaseHeight}`);
        console.log(`  terrainSteepness: ${data.meta.terrainSteepness}`);
        console.log(`  waterLevel: ${data.meta.waterLevel}`);
        console.log("");

        console.log("=== HÖHEN-VERTEILUNG (4000 Random-Punkte, 2048×2048 Region) ===");
        const fmt = (x) => x.toFixed(1).padStart(7);
        console.log("                  Makro-Surface     Voxel-Surface     (über base)");
        console.log(`  Min:        ${fmt(Math.min(...m))}            ${fmt(Math.min(...v))}        (Makro: ${(Math.min(...m) - base).toFixed(1)} m)`);
        console.log(`  p5:         ${fmt(pct(Array.from(m), 0.05))}            ${fmt(pct(Array.from(v), 0.05))}`);
        console.log(`  p25:        ${fmt(pct(Array.from(m), 0.25))}            ${fmt(pct(Array.from(v), 0.25))}`);
        console.log(`  Median:     ${fmt(pct(Array.from(m), 0.5))}            ${fmt(pct(Array.from(v), 0.5))}`);
        console.log(`  p75:        ${fmt(pct(Array.from(m), 0.75))}            ${fmt(pct(Array.from(v), 0.75))}`);
        console.log(`  p95:        ${fmt(pct(Array.from(m), 0.95))}            ${fmt(pct(Array.from(v), 0.95))}        (Makro: ${(pct(Array.from(m), 0.95) - base).toFixed(1)} m über base)`);
        console.log(`  Max:        ${fmt(Math.max(...m))}            ${fmt(Math.max(...v))}        (Makro: ${(Math.max(...m) - base).toFixed(1)} m über base)`);
        console.log("");

        console.log("=== HÖHEN-HISTOGRAMM (Makro-Surface, 10 m Buckets) ===");
        const hist = histogram(Array.from(m), 10);
        const maxCount = Math.max(...hist.map((h) => h[1]));
        for (const [bucket, count] of hist) {
            const bar = "█".repeat(Math.round((count / maxCount) * 40));
            console.log(`  ${String(bucket).padStart(5)} m: ${String(count).padStart(4)} ${bar}`);
        }
        console.log("");

        console.log("=== HYDROSPHÄRE-STATS ===");
        if (data.stats) {
            console.log(`  surfMin/Max:    ${data.stats.surfMin} / ${data.stats.surfMax}`);
            console.log(`  waterLevel:     ${data.stats.waterLevel}`);
            console.log(`  Ozean-Zellen:   ${data.stats.seaCells} / ${data.stats.cells} (${(data.stats.seaCells / data.stats.cells * 100).toFixed(1)}%)`);
            console.log(`  See-Zellen:     ${data.stats.lakeCells} / ${data.stats.cells} (${(data.stats.lakeCells / data.stats.cells * 100).toFixed(1)}%)`);
            console.log(`  Undrained Land: ${data.stats.undrainedLand} (sollte 0 sein)`);
        } else {
            console.log("  KEINE STATS — Hydrosphäre nicht bereit?");
        }
        console.log("");

        console.log("=== TARN-BILANZ (Bergsee-Mulden) ===");
        console.log(`  Anzahl gesetzter Tarns: ${data.tarns.length}`);
        if (data.tarns.length > 0) {
            const tarnSurfs = data.tarns.map((t) => t.surf);
            console.log(`  Tarn-Höhen (surf):  min ${Math.min(...tarnSurfs)}, median ${pct(tarnSurfs, 0.5)}, max ${Math.max(...tarnSurfs)}`);
            console.log(`  Radien:             min ${Math.min(...data.tarns.map((t) => t.r))}, max ${Math.max(...data.tarns.map((t) => t.r))}`);
            console.log(`  Mulden-Tiefen:      min ${Math.min(...data.tarns.map((t) => t.d))}, max ${Math.max(...data.tarns.map((t) => t.d))}`);
            console.log(`  Erste 5 Tarns:`);
            for (const t of data.tarns.slice(0, 5)) {
                console.log(`    (x=${t.x}, z=${t.z})  surf=${t.surf} m,  r=${t.r} m,  d=${t.d} m`);
            }
        }
        console.log("");

        console.log("=== SEEN (extrahierte hydrosphere.lakes) ===");
        console.log(`  Anzahl gelisteter Seen: ${data.lakes.length}`);
        if (data.lakes.length > 0) {
            const levels = data.lakes.map((l) => l.level);
            console.log(`  See-Spiegel-Höhen:  min ${Math.min(...levels)}, median ${pct(levels, 0.5)}, max ${Math.max(...levels)}`);
            console.log(`  über waterLevel (=${data.meta.waterLevel}):`);
            const above = levels.filter((l) => l > data.meta.waterLevel + 2);
            console.log(`    Seen > waterLevel+2:  ${above.length} (sind ECHTE Hochseen?)`);
            console.log(`    Seen ≤ waterLevel+2:  ${levels.length - above.length} (Meeresspiegel-Niveau)`);
            console.log("");
            console.log("  Alle Seen (Top 10 nach Höhe):");
            const sortedLakes = [...data.lakes].sort((a, b) => b.level - a.level).slice(0, 10);
            for (const lk of sortedLakes) {
                const tag = lk.level > data.meta.waterLevel + 2 ? "HOCHSEE" : "tief";
                console.log(`    Lake #${lk.id}:  level=${lk.level} m,  floor=${lk.floorY},  rim=${lk.rimY},  cells=${lk.cells},  ${lk.bbox ? `${lk.bbox.w}×${lk.bbox.h} m` : ""} [${tag}]`);
            }
        }
        console.log("");

        console.log("=== VOXEL-CHUNK-DECKEN-MARGE ===");
        const ceiling = data.chunkCfg.ceiling;
        const surfP95 = pct(Array.from(m), 0.95);
        const surfMax = Math.max(...m);
        console.log(`  Voxel-Chunk-Decke:    base + ${data.chunkCfg.dimY * data.chunkCfg.step - data.chunkCfg.floorDrop} m  = ${ceiling.toFixed(1)} m`);
        console.log(`  Surface p95:          ${surfP95.toFixed(1)} m  (Marge bis Decke: ${(ceiling - surfP95).toFixed(1)} m)`);
        console.log(`  Surface max:          ${surfMax.toFixed(1)} m  (Marge bis Decke: ${(ceiling - surfMax).toFixed(1)} m)`);
        if (ceiling - surfMax < 8) {
            console.log("  ⚠  WARNUNG: Decken-Marge knapp — eine Berg-Vertiefung BRAUCHT eine Decken-Erhöhung");
        }
        console.log("");

        console.log("=== HYDROSPHAERE-TOPOLOGIE (V9.60-b — Wurzel-Wahrheit) ===");
        const tp = data.topology;
        console.log(`  Land-Marge:               ${tp.landMargin.toFixed(1)} m  (Median Surface ueber waterLevel — sollte > +15 m sein damit Biome ueber Wasser liegen)`);
        console.log(`  Land-Anteil:              ${tp.landCells} / ${tp.landCells + tp.waterCells} (${((tp.landCells / (tp.landCells + tp.waterCells)) * 100).toFixed(1)}%)`);
        console.log(`  Fluss-Anzahl:             ${tp.rivers.count}`);
        console.log(`  Fluss-Laengen:            min ${tp.rivers.min} m, median ${(tp.rivers.median || 0).toFixed(0)} m, max ${tp.rivers.max} m`);
        console.log(`  Davon lange (>500m):      ${tp.rivers.longCount} ${tp.rivers.longCount >= 3 ? "✓" : "⚠ (braucht mehr lange Fluesse)"}`);
        console.log(`  Davon kurze (<100m):      ${tp.rivers.shortCount}`);
        console.log(`  See-Hoehen Std-Abw:       ${tp.lakeLevelStdDev.toFixed(1)} m  (${tp.lakeLevelStdDev > 8 ? "✓ differenziert" : "⚠ zu uniform"})`);
        console.log(`  Uferlinien-Index:         ${tp.coastIndex.toFixed(2)} (Kreis ~3.5, Buchten >5, fraktale Kueste >7)`);
        console.log("");

        console.log("=== TERRAIN-CHARAKTERISTIK (V14.0 — episch vs. spitz) ===");
        const tc = data.terrainChar;
        console.log(`  Hang-Neigung Median:      ${tc.slopeMedianDeg.toFixed(1)}°  (sanfte Welt < ~12°, alpin > ~25°)`);
        console.log(`  Hang-Neigung p90:         ${tc.slopeP90Deg.toFixed(1)}°  (die steilsten 10 %)`);
        console.log(`  Anteil steil (>45°):      ${(tc.steepFrac * 100).toFixed(1)} %  ${tc.steepFrac < 0.05 ? "✓" : "⚠ viele Steilwände/Cusps"}`);
        console.log(`  Anteil sanft (<11°):      ${(tc.gentleFrac * 100).toFixed(1)} %  (epische Weite braucht viel sanftes Land)`);
        console.log(`  Feature-Grösse (Korr-Län):${tc.corrLenM.toFixed(0)} m  ${tc.corrLenM > 400 ? "✓ kontinental" : "⚠ Alpen-Miniatur (Ziel >400 m)"}`);
        console.log(`  Hochland-Kohäsion:        ${tc.hiCohesion.toFixed(2)}  (1.0 = lange Ketten/Hochländer, ~0 = isolierte Zacken)`);
        console.log(`  Plateau-Anteil (hoch+flach):${(tc.plateauFrac * 100).toFixed(1)} %  (weite Hochebenen — Ziel: spürbar > 0)`);
        console.log(`  Ketten-Elongation:        ${tc.chainElong.toFixed(2)}  (${tc.chainCompCount} Hochland-Komponenten; ~1.1 = runde Blobs, >2 = lineare Ketten/Anden)`);
        console.log("");

        console.log("=== WELT-AWARENESS (V9.59 — kennt die Welt ihr Wasser?) ===");
        const aw = data.awareness;
        console.log(`  Architekturen total:        ${aw.archTotal}`);
        console.log(`  Architekturen unter Wasser: ${aw.archInWater} ${aw.archInWater === 0 ? "✓" : "⚠"}`);
        console.log(`  Gras-Halme total:           ${aw.grassTotal}`);
        console.log(`  Gras-Halme unter Wasser:    ${aw.grassInWater} ${aw.grassInWater === 0 ? "✓" : "⚠"}`);
        console.log("");

        console.log("=== ARTEFAKTE ===");
        console.log(`  Top-Down:   ${SCREENSHOT_TOP}`);
        console.log(`  Side-View:  ${SCREENSHOT_SIDE}`);

        if (consoleErrors.length) {
            console.log("\n=== BROWSER-ERRORS ===");
            for (const e of consoleErrors.slice(0, 5)) console.log(`  ${e}`);
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("DIAGNOSE FAILED:", e);
    process.exit(1);
});

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

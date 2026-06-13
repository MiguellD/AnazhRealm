// diag-wf.cjs — W-F (meister-plan §8.3 W-F, V18.175): die DREI Teilwellen
// GEMESSEN am echten Fluss (kein Raten, kein Browser-Render — reine Welt-
// Wahrheit + Funktions-Proben). Die Härtungs-Wände der diag-frequenzband
// (DIAG_PORT · inkrementelles Artefakt · Warm-Welt): geerbt.
//
//   (1) LAUF-GLÄTTUNG: along-flow-Rauheit (Σ|2.Differenz| der Höhe entlang der
//       Strömung) — _waterRunSurfaceAt MUSS deutlich glatter sein als das rohe
//       _atlasWaterLevelAt; die NARBEN-WAND (Querschnitt-Bulge) bleibt erhalten.
//   (2) DIVE-TRIGGER: liest die geglättete Lauf-Fläche (Source-Probe).
//   (3) BOOT: ein holz-Gefährt schwimmt (Profil.floats), ein stein-Gefährt sinkt.
// Schreibt artifacts/wf-karte.json (inkrementell). node scripts/diag-wf.cjs
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const ART = path.resolve("artifacts");
const DIAG_PORT = Number(process.env.DIAG_PORT) || 4318;
const KARTE_JSON = path.join(ART, "wf-karte.json");
const WARMWELT_JSON = path.join(ART, "diag-warmwelt.json");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], {
            stdio: ["ignore", "pipe", "pipe"],
            env: { ...process.env, PORT: String(DIAG_PORT) },
        });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    const out = {};
    try {
        let warm = false;
        if (!process.env.FREQBAND_FRESH && fs.existsSync(WARMWELT_JSON)) {
            try {
                const dump = JSON.parse(fs.readFileSync(WARMWELT_JSON, "utf8"));
                if (dump && dump.keys) {
                    await page.evaluateOnNewDocument((kv) => {
                        try {
                            for (const k of Object.keys(kv)) localStorage.setItem(k, kv[k]);
                        } catch {
                            /* quota */
                        }
                    }, dump.keys);
                    warm = true;
                }
            } catch {
                /* frisch */
            }
        }
        await page.goto(`http://127.0.0.1:${DIAG_PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            let stub = false;
            const t0 = performance.now();
            let last = -1;
            let stable = 0;
            while (performance.now() - t0 < 90000) {
                const r = window.anazhRealm;
                if (r && !stub && r.state && r.state.renderer) {
                    r.state.renderer.render = function () {};
                    r.state.postProcessingFailed = true;
                    stub = true;
                }
                if (r && typeof r._gameLoopTick === "function") {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {
                        /* warm */
                    }
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 12 && stable > 50) break;
                }
                await new Promise((res) => setTimeout(res, 5));
            }
        });
        console.log("WARM:", warm);

        // (1) LAUF-GLÄTTUNG + (2) DIVE-Probe + (3) BOOT — alles in EINEM evaluate.
        const res = await page.evaluate(() => {
            const r = window.anazhRealm;
            const h = r.state.hydrosphere || {};
            const o = { teil1: null, teil2: null, teil3: null };

            // --- Teilwelle 1: along-flow-Rauheit am längsten Fluss ---
            const rivers = (h.rivers || []).slice().sort((a, b) => (b.points || []).length - (a.points || []).length);
            const riv = rivers.find((rv) => rv.points && rv.points.length > 8);
            if (riv) {
                const pts = riv.points;
                const mid = pts[Math.floor(pts.length / 2)];
                // entlang der Strömung schreiten (V18.11-Tangente)
                const river = r._hydroRiverAt(mid.x, mid.z);
                if (river) {
                    const fx = river.flowX;
                    const fz = river.flowZ;
                    const N = 40;
                    const stepm = 3;
                    const rawH = [];
                    const smoothH = [];
                    for (let s = -N; s <= N; s++) {
                        const x = mid.x + fx * s * stepm;
                        const z = mid.z + fz * s * stepm;
                        const raw = r._atlasWaterLevelAt(x, z, -Infinity);
                        const sm = r._waterRunSurfaceAt(x, z);
                        if (raw > -1e8 && sm > -1e8) {
                            rawH.push(raw);
                            smoothH.push(sm);
                        }
                    }
                    // Rauheit = Σ |2. Differenz| (Krümmung der Höhe entlang der Linie).
                    const rough = (arr) => {
                        let a = 0;
                        for (let i = 1; i < arr.length - 1; i++) a += Math.abs(arr[i + 1] - 2 * arr[i] + arr[i - 1]);
                        return arr.length > 2 ? a / (arr.length - 2) : 0;
                    };
                    // NARBEN-WAND, zwei ECHTE Versagen (nicht „Magnitude ändert
                    // sich"): (a) TROG — die Mitte darf relativ zu den Ufern
                    // nicht SINKEN (der „leere Trog", den der Schöpfer zweimal
                    // revertierte); (b) UFER-ERHALTUNG — am Kanal-RAND (centerness
                    // → 0) muss geglättet ≈ roh sein (die Zentrums-Blende lässt
                    // die Querschnitt-Kante unangetastet).
                    const px = -fz,
                        pz = fx;
                    const lateralRelief = (fn) => {
                        const c = fn(mid.x, mid.z);
                        let bank = 0,
                            nb = 0;
                        for (const frac of [0.4, 0.7]) {
                            const d = Math.max(1, river.depth) * frac;
                            const l = fn(mid.x + px * d, mid.z + pz * d);
                            const rr = fn(mid.x - px * d, mid.z - pz * d);
                            if (l > -1e8) {
                                bank += l;
                                nb++;
                            }
                            if (rr > -1e8) {
                                bank += rr;
                                nb++;
                            }
                        }
                        return nb > 0 ? c - bank / nb : 0;
                    };
                    const reliefRaw = lateralRelief((x, z) => r._atlasWaterLevelAt(x, z, -Infinity));
                    const reliefSmooth = lateralRelief((x, z) => r._waterRunSurfaceAt(x, z));
                    // UFER-ERHALTUNG: am weiten Rand (≈ Kanal-Kante) roh vs glatt.
                    const edgeD = Math.max(3, river.depth * 1.3);
                    let edgeDiff = 0,
                        ne = 0;
                    for (const sgn of [1, -1]) {
                        const ex = mid.x + px * edgeD * sgn;
                        const ez = mid.z + pz * edgeD * sgn;
                        const raw = r._atlasWaterLevelAt(ex, ez, -Infinity);
                        const sm = r._waterRunSurfaceAt(ex, ez);
                        if (raw > -1e8 && sm > -1e8) {
                            edgeDiff += Math.abs(sm - raw);
                            ne++;
                        }
                    }
                    o.teil1 = {
                        samples: rawH.length,
                        roughRaw: Math.round(rough(rawH) * 1000) / 1000,
                        roughSmooth: Math.round(rough(smoothH) * 1000) / 1000,
                        depth: Math.round(river.depth * 100) / 100,
                        reliefRaw: Math.round(reliefRaw * 1000) / 1000,
                        reliefSmooth: Math.round(reliefSmooth * 1000) / 1000,
                        edgeDiff: ne > 0 ? Math.round((edgeDiff / ne) * 1000) / 1000 : null,
                    };
                }
            }

            // --- Teilwelle 2 + 3: Source-Proben (die Verdrahtung) ---
            o.teil2 = {
                sheetReadsRun: /_waterRunSurfaceAt/.test(r._buildVoxelChunkWaterCellSheet.toString()),
                diveReadsRun: /_waterRunSurfaceAt/.test(r._loopPhysicsSync.toString()),
                flowRippleInShader: /flowRipple|nFlow/.test(r._ensureHydroSurfaceMaterial.toString()),
            };

            // --- Teilwelle 3: BOOT schwimmt, Stein sinkt (Profil.floats) ---
            const mkBoat = (mat) => ({
                name: `boot_${mat}`,
                parts: [
                    { shape: "box", material: mat, size: { x: 3, y: 0.6, z: 1.4 }, position: { x: 0, y: 0, z: 0 } },
                    { shape: "box", material: mat, size: { x: 0.4, y: 0.4, z: 0.4 }, position: { x: 0, y: 0.5, z: 0 } },
                ],
                connections: [],
            });
            const probeFloat = (mat) => {
                const bp = mkBoat(mat);
                r.state.blueprints[bp.name] = bp;
                const fake = { type: bp.name, scale: 1, position: { x: 0, y: 0, z: 0 } };
                const prof = r._vehicleProfile(fake);
                delete r.state.blueprints[bp.name];
                return prof ? prof.floats : null;
            };
            o.teil3 = {
                holzFloats: probeFloat("holz"),
                steinFloats: probeFloat("stein"),
                eisenFloats: probeFloat("eisen"),
            };
            return o;
        });
        Object.assign(out, res);
        fs.writeFileSync(KARTE_JSON, JSON.stringify({ at: new Date().toISOString(), ...out }, null, 1));

        // === URTEIL ===
        console.log("\n=== W-F MESSUNG ===");
        const t1 = out.teil1;
        if (t1) {
            const glatter = t1.roughSmooth < t1.roughRaw * 0.7;
            // (a) TROG: die Mitte darf relativ zu den Ufern nicht SINKEN.
            const keinTrog = t1.reliefSmooth >= t1.reliefRaw - 0.05;
            // (b) UFER-ERHALTUNG: am Kanal-Rand roh ≈ glatt (Zentrums-Blende).
            const uferRoh = t1.edgeDiff !== null && t1.edgeDiff <= 0.1;
            console.log(
                `(1) LAUF-GLÄTTUNG  rauh roh=${t1.roughRaw} → glatt=${t1.roughSmooth}  ` +
                    `(${glatter ? "OK −" + Math.round((1 - t1.roughSmooth / Math.max(t1.roughRaw, 1e-6)) * 100) + "%" : "XX zu wenig"})`
            );
            console.log(
                `    NARBEN-WAND  kein-Trog: Mitte-Relief roh=${t1.reliefRaw} → glatt=${t1.reliefSmooth} (${keinTrog ? "OK Mitte sinkt nicht" : "XX TROG"})  · Ufer-erhalten: Δ=${t1.edgeDiff} (${uferRoh ? "OK Kante roh" : "XX Kante verändert"})  depth=${t1.depth}`
            );
        } else console.log("(1) kein Fluss gefunden — Welt ohne langen Lauf (Warm-Welt-abhängig)");
        const t2 = out.teil2;
        console.log(
            `(2) VERDRAHTUNG  Sheet→Run=${t2.sheetReadsRun ? "OK" : "XX"}  Dive→Run=${t2.diveReadsRun ? "OK" : "XX"}  Flow-Ripple-Shader=${t2.flowRippleInShader ? "OK" : "XX"}`
        );
        const t3 = out.teil3;
        const bootOk = t3.holzFloats === true && t3.steinFloats === false && t3.eisenFloats === false;
        console.log(
            `(3) BOOT  holz=${t3.holzFloats} stein=${t3.steinFloats} eisen=${t3.eisenFloats}  (${bootOk ? "OK Substanz-emergent" : "XX"})`
        );
        console.log("\nKarte: artifacts/wf-karte.json");
    } finally {
        await browser.close();
        server.kill();
    }
})();

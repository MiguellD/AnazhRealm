// diag-frequenzband.cjs — W-E E1 (meister-plan §8.3 Punkt 5): DIE INVENTUR.
// Die MATERIAL-MATRIX {Terrain · Bau · Baum · Kreatur · Gras} × {Mittag · Abend
// · Nacht} × {nightFloor 0 / 0.06 / 0.3} als gemessene DIVERGENZ-KARTE VORHER:
// pro Ebene wird ein Welt-Punkt auf den Screen projiziert und ein Pixel-Patch
// gemittelt — die Karte zeigt, WIE UNGLEICH die Ebenen-Familien auf denselben
// Hebel antworten (die GEMESSENE Fragmentierung, die W-E verdichtet). Wasser-
// Ufer wird gemessen, wenn ein See im Nahbereich liegt (sonst ehrlich skip).
// Reine Messung — keine Code-Änderung. Shots: artifacts/freqband-*.png
//   node scripts/diag-frequenzband.cjs
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const ART = path.resolve("artifacts");
// V18.174 (Diag-Härtung, drei Wände gegen die Remote-Container-Reibung):
// (1) EIGENER PORT (DIAG_PORT, Default 4317) — der Diag serialisiert nicht
//     mehr hart mit dem Playtest auf 4312 (Client fällt graceful auf
//     localStorage-only, _isLocalhostSaveServer).
// (2) ERGEBNIS ALS ARTEFAKT: die Karte wird nach JEDER Zelle inkrementell
//     nach artifacts/freqband-karte.json geschrieben — ein still gekillter
//     Prozess (Task-Reaping/Block-Buffer) hinterlässt MESSDATEN, nie nichts.
// (3) WARM-WELT-CACHE (artifacts/diag-warmwelt.json): der erste Lauf dumpt
//     den localStorage NACH dem Settle und VOR dem Szene-Bau; Folge-Läufe
//     injizieren ihn → dieselbe Welt/Seed (A/B-Läufe werden quer-vergleichbar,
//     nicht nur intra-Lauf) + kein Genesis-Anteil im Warmup.
//     FREQBAND_FRESH=1 erzwingt eine frische Welt.
const DIAG_PORT = Number(process.env.DIAG_PORT) || 4317;
const KARTE_JSON = path.join(ART, "freqband-karte.json");
const WARMWELT_JSON = path.join(ART, "diag-warmwelt.json");
// Pixel-Messung OHNE pngjs: die Shots liegen in artifacts/ (Web-Root des
// save-servers) — der Browser lädt sie als <img> + misst via Canvas-2D
// (das diag-nightfloor-ab-Muster).
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
    await page.setViewport({ width: 800, height: 450 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        // Warm-Welt injizieren (falls gecacht + nicht FRESH erzwungen).
        let warmGeladen = false;
        if (!process.env.FREQBAND_FRESH && fs.existsSync(WARMWELT_JSON)) {
            try {
                const dump = JSON.parse(fs.readFileSync(WARMWELT_JSON, "utf8"));
                if (dump && dump.keys && typeof dump.keys === "object") {
                    await page.evaluateOnNewDocument((kv) => {
                        try {
                            for (const k of Object.keys(kv)) localStorage.setItem(k, kv[k]);
                        } catch {
                            /* Quota → frisch booten */
                        }
                    }, dump.keys);
                    warmGeladen = true;
                    console.log(`WARM-WELT geladen (${Object.keys(dump.keys).length} Keys, ${dump.at || "?"})`);
                }
            } catch {
                /* kaputter Cache → frisch */
            }
        }
        await page.goto(`http://127.0.0.1:${DIAG_PORT}/index.html`, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });
        // Settled warm (Render gestubbt fürs Tempo, dann restauriert).
        await page.evaluate(async () => {
            let stubbed = false;
            const start = performance.now();
            let lastSize = -1;
            let stable = 0;
            while (performance.now() - start < 90000) {
                const r = window.anazhRealm;
                if (r && !stubbed && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    r.state.postProcessingFailed = true;
                    stubbed = true;
                }
                if (r && typeof r._gameLoopTick === "function") {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {
                        /* warm */
                    }
                    const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === lastSize) stable++;
                    else {
                        stable = 0;
                        lastSize = sz;
                    }
                    if (sz > 12 && stable > 50) break;
                }
                await new Promise((res) => setTimeout(res, 5));
            }
        });
        // Warm-Welt dumpen — NACH dem Settle, VOR dem Szene-Bau (so trägt der
        // Cache nie die Mess-Probes; Folge-Läufe spawnen ihre Szene frisch in
        // DIESELBE Welt). Nur beim ersten (frischen) Lauf.
        if (!warmGeladen) {
            try {
                const keys = await page.evaluate(() => {
                    const o = {};
                    for (let i = 0; i < localStorage.length; i++) {
                        const k = localStorage.key(i);
                        o[k] = localStorage.getItem(k);
                    }
                    return o;
                });
                const blob = JSON.stringify({ at: new Date().toISOString(), keys });
                if (blob.length < 16 * 1024 * 1024) fs.writeFileSync(WARMWELT_JSON, blob);
                console.log(`WARM-WELT gedumpt (${Object.keys(keys).length} Keys → diag-warmwelt.json)`);
            } catch {
                /* Dump ist Komfort, nie ein Lauf-Abbruch */
            }
        }
        // Die SZENE: Bau + Baum + Kreatur in definierte Punkte vor die Kamera.
        const scene = await page.evaluate(() => {
            const r = window.anazhRealm;
            const pm = r.state.playerMesh.position;
            const y = (x, z) => r.getTerrainHeightAt(x, z);
            const probes = {};
            // BAU (Stein-Block) + BAUM (Eiche) + KREATUR (wesen) nebeneinander.
            const bau = r.spawnArchitecture(
                "stein_block",
                { x: pm.x + 10, y: y(pm.x + 10, pm.z - 3), z: pm.z - 3 },
                { silent: true }
            );
            const baum = r.spawnArchitecture(
                "baum_eiche",
                { x: pm.x + 14, y: y(pm.x + 14, pm.z + 4), z: pm.z + 4 },
                { silent: true }
            );
            const krea = r.spawnCreatureAt(pm.x + 8, y(pm.x + 8, pm.z + 3) + 0.6, pm.z + 3, "happy", "wesen");
            // Das Mess-Wesen wandert sonst aus dem Patch — Pose einfrieren
            // (pro Messung re-gepinnt wie die Kamera).
            if (krea) window.__kreaPose = { x: krea.position.x, y: krea.position.y, z: krea.position.z };
            probes.terrain = { x: pm.x + 12, y: y(pm.x + 12, pm.z) + 0.1, z: pm.z };
            probes.bau = bau ? { x: bau.position.x, y: bau.position.y + 1.0, z: bau.position.z } : null;
            probes.baum = baum ? { x: baum.position.x, y: baum.position.y + 3.5, z: baum.position.z } : null;
            probes.kreatur = krea ? { live: true, id: krea.userData.netId } : null;
            probes.gras = { x: pm.x + 6, y: y(pm.x + 6, pm.z - 2) + 0.25, z: pm.z - 2 };
            // Wasser-Ufer: der nächste See im Umkreis 80 m (ehrlich skip wenn fern).
            let wasser = null;
            for (let rad = 16; rad <= 80 && !wasser; rad += 16) {
                for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
                    const wx = pm.x + Math.cos(a) * rad;
                    const wz = pm.z + Math.sin(a) * rad;
                    const lvl = r._atlasWaterLevelAt ? r._atlasWaterLevelAt(wx, wz, -Infinity) : -Infinity;
                    if (Number.isFinite(lvl) && lvl > -1e8 && lvl > y(wx, wz)) {
                        wasser = { x: wx, y: lvl + 0.05, z: wz };
                        break;
                    }
                }
            }
            probes.wasser = wasser;
            // Das eingefrorene Auge: die Pose wird PRO Messung neu gesetzt —
            // der Game-Loop-Follow zieht die Kamera sonst zwischen den
            // evaluates weg (die V18.129-Shot-Lehre).
            window.__camPose = {
                pos: { x: pm.x, y: pm.y + 2.4, z: pm.z },
                look: { x: pm.x + 11, y: pm.y + 0.5, z: pm.z },
            };
            window.__probes = probes;
            return { hatWasser: !!wasser, hatBau: !!bau, hatBaum: !!baum, hatKrea: !!krea };
        });
        console.log("SZENE:", JSON.stringify(scene));

        const ZEITEN = [
            ["mittag", 0.5],
            ["abend", 0.85],
            ["nacht", 0.0],
        ];
        // V18.173 — Floor-Override fürs schnelle Δ (die Divergenz braucht nur
        // f0/f0.3; der Default misst zusätzlich die 0.06-Standard-Zeile):
        //   FREQBAND_FLOORS="0,0.3" node scripts/diag-frequenzband.cjs
        const FLOORS = (process.env.FREQBAND_FLOORS || "0,0.06,0.3").split(",").map(Number).filter(Number.isFinite);
        const karte = {};
        for (const [zName, t] of ZEITEN) {
            for (const f of FLOORS) {
                // Render mit echtem Render-Pfad (Stub aufheben), Patch-Punkte projizieren.
                const pts = await page.evaluate(
                    (tv, fv) => {
                        const r = window.anazhRealm;
                        if (window.__origRender) r.state.renderer.render = window.__origRender;
                        r.setTimeOfDay(tv);
                        // V18.174 — das WETTER ist GEPINNT (sunny, Transition genullt):
                        // der 120-s-Auto-Flip + die 45-s-Fade-Transition waren die
                        // größte Rausch-Quelle der Karte (±10 dokumentiert; GEMESSEN
                        // bis ~24 am Nacht-Terrain zwischen Läufen) — ein Messgerät
                        // pinnt seine Störgrößen.
                        r.state.weather = "sunny";
                        r.state.weatherTransition = null;
                        const au = r._ensureAtmoUniforms();
                        if (au && au.terrainNightFloor) au.terrainNightFloor.value = fv;
                        // Das eingefrorene Auge JEDES Mal neu (der Loop-Follow zieht sonst weg).
                        const cp = window.__camPose;
                        const setCam = () => {
                            const cam = r.state.camera;
                            cam.position.set(cp.pos.x, cp.pos.y, cp.pos.z);
                            cam.lookAt(cp.look.x, cp.look.y, cp.look.z);
                            cam.updateMatrixWorld(true);
                            cam.updateProjectionMatrix();
                            // Das Mess-Wesen zurück auf die Probe-Pose (es wandert).
                            const kp = window.__kreaPose;
                            const pr = window.__probes;
                            if (kp && pr && pr.kreatur && pr.kreatur.live) {
                                const c = (r.state.creatures || []).find((x) => x.userData.netId === pr.kreatur.id);
                                if (c) c.position.set(kp.x, kp.y, kp.z);
                            }
                        };
                        try {
                            setCam();
                            r._loopRender(performance.now());
                            setCam();
                            r._loopRender(performance.now());
                            setCam();
                            r._loopRender(performance.now());
                        } catch {
                            /* shot */
                        }
                        setCam();
                        // Welt → Screen (NDC → Pixel) für jede Probe.
                        const cam = r.state.camera;
                        const out = {};
                        const proj = (p) => {
                            const v = new window.THREE.Vector3(p.x, p.y, p.z).project(cam);
                            if (v.z > 1 || v.x < -0.95 || v.x > 0.95 || v.y < -0.95 || v.y > 0.95) return null;
                            return {
                                px: Math.round(((v.x + 1) / 2) * window.innerWidth),
                                py: Math.round(((1 - v.y) / 2) * window.innerHeight),
                            };
                        };
                        const probes = window.__probes;
                        for (const k of Object.keys(probes)) {
                            const p = probes[k];
                            if (!p) {
                                out[k] = null;
                                continue;
                            }
                            if (p.live) {
                                const c = (r.state.creatures || []).find((x) => x.userData.netId === p.id);
                                out[k] = c ? proj({ x: c.position.x, y: c.position.y + 0.4, z: c.position.z }) : null;
                            } else out[k] = proj(p);
                        }
                        return out;
                    },
                    t,
                    f
                );
                const fileName = `freqband-${zName}-f${String(f).replace(".", "_")}.png`;
                await page.screenshot({ path: path.join(ART, fileName) });
                // Patch-Mittel (13×13) via Browser-Canvas (das nightfloor-ab-Muster).
                const mittel = await page.evaluate(
                    async (src, points) => {
                        const img = await new Promise((res, rej) => {
                            const i = new Image();
                            i.onload = () => res(i);
                            i.onerror = rej;
                            i.src = src + "?t=" + Math.random();
                        });
                        const c = document.createElement("canvas");
                        c.width = img.width;
                        c.height = img.height;
                        const g = c.getContext("2d");
                        g.drawImage(img, 0, 0);
                        const out = {};
                        for (const k of Object.keys(points)) {
                            const pt = points[k];
                            if (!pt) {
                                out[k] = null;
                                continue;
                            }
                            const x0 = Math.max(0, pt.px - 6);
                            const y0 = Math.max(0, pt.py - 6);
                            const d = g.getImageData(
                                x0,
                                y0,
                                Math.min(13, img.width - x0),
                                Math.min(13, img.height - y0)
                            ).data;
                            let s = 0;
                            for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
                            out[k] = Math.round((s / (d.length / 4)) * 10) / 10;
                        }
                        return out;
                    },
                    "artifacts/" + fileName,
                    pts
                );
                karte[`${zName}|f${f}`] = mittel;
                // INKREMENTELLES Artefakt: nach jeder Zelle ist der bisherige
                // Stand auf Platte — ein gekillter Lauf hinterlässt Messdaten.
                try {
                    fs.writeFileSync(
                        KARTE_JSON,
                        JSON.stringify({ at: new Date().toISOString(), floors: FLOORS, karte }, null, 1)
                    );
                } catch {
                    /* Artefakt ist Komfort */
                }
            }
        }
        // DIE DIVERGENZ-KARTE: pro Zeit der Floor-HUB (f0.3 − f0) je Ebene —
        // ein harmonisches Band höbe alle Ebenen ÄHNLICH; heute hebt der
        // max()-Clamp NUR das Terrain (die §8.1#11-Fragmentierung als Zahl).
        console.log("\n=== DIE KARTE (Patch-Helligkeit 0..255) ===");
        for (const key of Object.keys(karte)) console.log(`  ${key}:`, JSON.stringify(karte[key]));
        console.log("\n=== DIVERGENZ (floor 0 → 0.3: Δ je Ebene) ===");
        for (const [zName] of ZEITEN) {
            const a = karte[`${zName}|f0`];
            const b = karte[`${zName}|f0.3`];
            if (!a || !b) continue;
            const delta = {};
            for (const k of Object.keys(a))
                delta[k] = Number.isFinite(a[k]) && Number.isFinite(b[k]) ? Math.round((b[k] - a[k]) * 10) / 10 : null;
            console.log(`  ${zName}:`, JSON.stringify(delta));
        }
        console.log("\nShots: artifacts/freqband-*.png");
    } finally {
        await browser.close();
        server.kill();
    }
})();

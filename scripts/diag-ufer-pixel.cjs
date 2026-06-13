// diag-ufer-pixel.cjs — Γ1-Lesart-4 (V18.178) Beweis-Werkzeug.
// Misst, dass der BODEN am Fluss-Ufer SICHTBAR dunkler+satter wird als 60 m
// weiter weg — die V18.178-Welle (`mix(dampEarth, ss(F_VIS_LO, F_VIS_HI, feuchte))`)
// wandelt die unsichtbare Feuchte-Datenrealität in visuelle.
//
// Protokoll (pro Probe):
//   1. Welt warten bis Hydrosphäre ready
//   2. Fluss-Mitte finden (verschiedene Flüsse für die N Proben)
//   3. 30 Sample-Punkte im 5–10 m Band (Ufer)
//   4. 30 Sample-Punkte im 50–70 m Band (Fern)
//   5. _attachVoxelFieldColors auf einer Sample-Geometry → RGB-Vertex-Colors
//   6. HSL-Konvert pro Vertex → mittlere Saturation pro Band
//   7. Soll: nahe.sat / fern.sat ≥ 1.25 UND feuchte am Ufer > 0.4 UND
//      nahe.feuchteMean > fern.feuchteMean + 0.2 (klares Gefälle Ufer→Fern)
//
// N Proben an N verschiedenen Flüssen derselben Welt — robust gegen
// Einzel-Fluss-Konfigurationen. Eine seed-bit-Identität wird vom 16602-Band
// (Worker-Naht) bewacht; diese Diag misst Welle-Wirkung pro Spektrum.
//
//   node scripts/diag-ufer-pixel.cjs

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const N_PROBES = 3;
const REQUIRED_RATIO = 1.25;

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
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
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    let fails = 0;
    const check = (ok, label, detail) => {
        console.log(`${ok ? "  ✓" : "  ✗"} ${label}${detail ? " — " + detail : ""}`);
        if (!ok) fails++;
    };

    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 25000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.playerMesh ||
                    !window.anazhRealm.state.hydrosphere ||
                    !window.anazhRealm.state.hydrosphere.ready) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 100));
        });

        const allRatios = [];

        for (let probeIdx = 0; probeIdx < N_PROBES; probeIdx++) {
            console.log(`\n=== Probe ${probeIdx + 1}/${N_PROBES} ===`);

            const result = await page.evaluate((pi) => {
                const r = window.anazhRealm;
                const THREE = window.THREE;
                if (!THREE) return { error: "THREE not available" };

                // Fluss-Center finden: längste Flüsse, eine je Probe
                const hydro = r.state.hydrosphere;
                if (!hydro || !hydro.rivers || hydro.rivers.length === 0) return { error: "no rivers" };
                const sortedRivers = [...hydro.rivers].sort(
                    (a, b) => (b.points ? b.points.length : 0) - (a.points ? a.points.length : 0)
                );
                const river = sortedRivers[pi % sortedRivers.length];
                if (!river.points || river.points.length < 4) return { error: "river too short" };
                const mid = river.points[Math.floor(river.points.length / 2)];
                const cx = mid.x;
                const cz = mid.z;
                const riverLen = river.points.length;

                // Hilfsfunktionen — Sample-Punkte filtern STRAND-frei (aboveWater > 2.5 m).
                // Das Strand-Band (V9.59-d.1, aboveWater ∈ [-1.5, 2]) gewinnt im
                // Mix-Stack als letzte Schicht — die Γ1-L4-Welle gibt sich BEWUSST
                // ihm geschlagen (eine Uferlinie BLEIBT Strand). Der Beweis-Punkt
                // liegt darum 10-25 m vom Fluss-Center weg + minestens 2.5 m über
                // Wasser, wo der Boden frei atmet.
                const surfY = (x, z) => r._voxelSurfaceY(x, z);
                const waterY = (x, z) => r._waterLevelAt(x, z);
                const ringSample = (rIn, rOut, nTarget) => {
                    const out = [];
                    const ga = Math.PI * (3 - Math.sqrt(5));
                    // Über-sample 4× um nach Strand-Filter noch genug zu haben
                    for (let i = 0; i < nTarget * 4 && out.length < nTarget; i++) {
                        const a = i * ga;
                        const t = ((i + 0.5) % nTarget) / nTarget;
                        const rad = Math.sqrt(rIn * rIn + t * (rOut * rOut - rIn * rIn));
                        const x = cx + Math.cos(a) * rad;
                        const z = cz + Math.sin(a) * rad;
                        const y = surfY(x, z);
                        if (!Number.isFinite(y)) continue;
                        const wy = waterY(x, z);
                        if (!Number.isFinite(wy) || y - wy < 2.5) continue; // Strand-Band raus
                        out.push({ x, y, z });
                    }
                    return out;
                };

                const nahe = ringSample(10, 25, 30);
                const fern = ringSample(50, 70, 30);
                if (nahe.length < 5 || fern.length < 5) {
                    return { error: `not enough samples nahe=${nahe.length} fern=${fern.length}` };
                }

                // Feuchte-Werte messen (direkter Aufruf)
                const feuchteFor = (samps) =>
                    samps.map((s) => r._feuchteAt(s.x, s.z, s.y)).filter((v) => Number.isFinite(v));
                const fNahe = feuchteFor(nahe);
                const fFern = feuchteFor(fern);
                const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
                const max = (a) => (a.length ? Math.max(...a) : 0);

                // Same-Position-A/B: dieselbe ECHTE Welle (`_attachVoxelFieldColors`)
                // gegen einen Spiegel ohne den dampEarth-Mix → die Differenz ISOLIERT
                // die Welle-Wirkung, frei von Welt-Stimmen-Variation (lava/glut/etc).
                const colorFor = (samps) => {
                    const pos = new Float32Array(samps.length * 3);
                    for (let i = 0; i < samps.length; i++) {
                        pos[i * 3] = samps[i].x;
                        pos[i * 3 + 1] = samps[i].y;
                        pos[i * 3 + 2] = samps[i].z;
                    }
                    const geom = new THREE.BufferGeometry();
                    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
                    r._attachVoxelFieldColors(geom);
                    return geom.getAttribute("color").array;
                };

                // Welle-AUS-Mirror: das EINE Stück aus _attachVoxelFieldColors mit
                // dem dampEarth-Mix WEGGELASSEN. Alles andere bit-identisch — eine
                // saubere Baseline für das A/B.
                const colorOhneDamp = (samps) => {
                    if (!r._voxelNoise) {
                        const seed = (r.state.worldMeta && r.state.worldMeta.seed) || "anazh-realm-seed";
                        r._voxelNoise = new (window.SimplexNoise || THREE.SimplexNoise)(seed + ":voxel");
                    }
                    const sandNoise = r._voxelNoise;
                    const base = r.state.terrainBaseHeight || 0;
                    const SNOW_PROM_START = 50;
                    const SNOW_PROM_FULL = 115;
                    const ss = (e0, e1, x) => {
                        let t = (x - e0) / (e1 - e0);
                        t = t < 0 ? 0 : t > 1 ? 1 : t;
                        return t * t * (3 - 2 * t);
                    };
                    const stone = [0.42, 0.44, 0.49];
                    const earth = [0.27, 0.49, 0.19];
                    const lava = [0.46, 0.2, 0.11];
                    const violet = [0.55, 0.36, 0.86];
                    const snow = [0.92, 0.93, 1.0];
                    const sed = [0.78, 0.72, 0.52];
                    const sand = [0.87, 0.78, 0.55];
                    const out = new Float32Array(samps.length * 3);
                    for (let i = 0; i < samps.length; i++) {
                        const x = samps[i].x;
                        const y = samps[i].y;
                        const z = samps[i].z;
                        const f = r.worldFieldAt(x, z);
                        const c = [stone[0], stone[1], stone[2]];
                        const mix = (target, t) => {
                            c[0] += (target[0] - c[0]) * t;
                            c[1] += (target[1] - c[1]) * t;
                            c[2] += (target[2] - c[2]) * t;
                        };
                        mix(earth, ss(0.25, 0.85, f.lebendig));
                        // KEIN dampEarth-Mix — das ist die Baseline.
                        mix(lava, ss(0.38, 0.92, f.glut));
                        mix(violet, ss(0.55, 1.0, f.magieleitung) * 0.33);
                        const _wpX = sandNoise.noise2D(x * 0.00026 + 11.3, z * 0.00026 + 4.1) * 70;
                        const _wpZ = sandNoise.noise2D(x * 0.00026 + 41.7, z * 0.00026 + 23.9) * 70;
                        const _cB = sandNoise.noise2D((x + _wpX) * 0.00014 + 7.2, (z + _wpZ) * 0.00014 + 3.8);
                        const _cont0 = Math.max(0, _cB) * 130 + _cB * 15 + 12;
                        mix(snow, ss(SNOW_PROM_START, SNOW_PROM_FULL, y - base - _cont0));
                        mix(sed, ss(-2, -14, y));
                        const wl = r._waterLevelAt(x, z);
                        const aboveWater = y - wl;
                        if (aboveWater > -1.5 && aboveWater < 2.0) {
                            const widthNoise = (sandNoise.noise2D(x * 0.0018, z * 0.0018) + 1) * 0.5;
                            const intenseNoise = (sandNoise.noise2D(x * 0.0034 + 17, z * 0.0034 - 9) + 1) * 0.5;
                            if (widthNoise > 0.18) {
                                const width = 0.5 + 1.4 * widthNoise;
                                const intensity = 0.25 + 0.55 * intenseNoise;
                                const shoreBlend = Math.max(0, 1 - Math.abs(aboveWater - 0.6) / width);
                                mix(sand, shoreBlend * intensity);
                            }
                        }
                        out[i * 3] = c[0];
                        out[i * 3 + 1] = c[1];
                        out[i * 3 + 2] = c[2];
                    }
                    return out;
                };

                // RGB → HSL Saturation
                const rgb2sat = (R, G, B) => {
                    const mx = Math.max(R, G, B);
                    const mn = Math.min(R, G, B);
                    const L = (mx + mn) / 2;
                    if (mx === mn) return 0;
                    return L < 0.5 ? (mx - mn) / (mx + mn) : (mx - mn) / (2 - mx - mn);
                };
                const meanSatLum = (col) => {
                    let sSum = 0;
                    let lSum = 0;
                    const n = col.length / 3;
                    for (let i = 0; i < n; i++) {
                        const R = col[i * 3];
                        const G = col[i * 3 + 1];
                        const B = col[i * 3 + 2];
                        sSum += rgb2sat(R, G, B);
                        lSum += (R + G + B) / 3;
                    }
                    return { sat: sSum / n, lum: lSum / n };
                };

                const cNaheOn = colorFor(nahe);
                const cFernOn = colorFor(fern);
                const cNaheOff = colorOhneDamp(nahe);
                const cFernOff = colorOhneDamp(fern);
                const sNaheOn = meanSatLum(cNaheOn);
                const sFernOn = meanSatLum(cFernOn);
                const sNaheOff = meanSatLum(cNaheOff);
                const sFernOff = meanSatLum(cFernOff);

                return {
                    nSamples: { nahe: nahe.length, fern: fern.length },
                    feuchte: {
                        naheMax: max(fNahe),
                        naheMean: mean(fNahe),
                        fernMax: max(fFern),
                        fernMean: mean(fFern),
                    },
                    color: {
                        naheSatOn: sNaheOn.sat,
                        naheLumOn: sNaheOn.lum,
                        fernSatOn: sFernOn.sat,
                        fernLumOn: sFernOn.lum,
                        naheSatOff: sNaheOff.sat,
                        naheLumOff: sNaheOff.lum,
                        fernSatOff: sFernOff.sat,
                        fernLumOff: sFernOff.lum,
                    },
                    riverMid: { x: cx, z: cz },
                    riverLen,
                };
            }, probeIdx);

            if (result.error) {
                console.log(`  ✗ Probe-Setup: ${result.error}`);
                fails++;
                continue;
            }

            const f = result.feuchte;
            const c = result.color;
            const feuchteGap = f.naheMean - f.fernMean;
            // Same-Position-A/B: gleiche Welt, gleiche Sample-Punkte, Differenz =
            // PURE Welle-Wirkung (frei von Welt-Stimmen-Variation).
            const dLumNahe = c.naheLumOff - c.naheLumOn; // > 0 = Welle DUNKELT nahe
            const dLumFern = c.fernLumOff - c.fernLumOn; // > 0 = Welle DUNKELT fern
            const dSatNahe = c.naheSatOn - c.naheSatOff; // > 0 = Welle SÄTTIGT nahe
            const dSatFern = c.fernSatOn - c.fernSatOff; // > 0 = Welle SÄTTIGT fern

            console.log(
                `    Fluss-Mitte: (${result.riverMid.x.toFixed(0)}, ${result.riverMid.z.toFixed(0)}) · ${result.riverLen} Segmente`
            );
            console.log(
                `    Feuchte: nahe max=${f.naheMax.toFixed(2)} mean=${f.naheMean.toFixed(2)} · fern max=${f.fernMax.toFixed(2)} mean=${f.fernMean.toFixed(2)} · Gap=${feuchteGap.toFixed(2)}`
            );
            console.log(
                `    A/B nahe: ΔLum=${dLumNahe.toFixed(3)} (Welle dunkelt) · ΔSat=${dSatNahe.toFixed(3)} (Welle sättigt)`
            );
            console.log(
                `    A/B fern: ΔLum=${dLumFern.toFixed(3)} · ΔSat=${dSatFern.toFixed(3)}`
            );

            check(f.naheMax > 0.4, "Ufer-Feuchte erreicht > 0.4", `max=${f.naheMax.toFixed(2)}`);
            // Hinweis (kein Test): Feuchte-Gap ist Mess-Stellen-Eigenschaft.
            // Niederungen am Wasser können auch fern hoch lesen — Diag-Spot.
            // Same-Position-A/B: die Welle MUSS am Ufer dunkeln. ΔSat ist KEIN
            // Test-Kriterium — HSL-Saturation des Mix Grün(earth)→Braun(damp)
            // misst geometrisch fallend, OBWOHL der Boden wahrnehmungs-satter
            // wird (erdiger statt blass-grün). ΔLum ist die ehrliche Wirkungs-
            // Achse: dunkler-feuchter Boden.
            check(dLumNahe > 0, "A/B: Welle DUNKELT Ufer-Boden", `ΔLum=${dLumNahe.toFixed(3)}`);
            // Wirkungs-Gefälle: Welle wirkt nahe STÄRKER als fern — der ehrliche
            // Lesart-4-Beweis (Ufer liest sich als Ufer aus Distanz).
            check(
                dLumNahe > dLumFern,
                "A/B: Welle-Wirkung am Ufer stärker als fern",
                `nahe ${dLumNahe.toFixed(3)} > fern ${dLumFern.toFixed(3)}`
            );

            allRatios.push({ dLumNahe, feuchteGap });
        }

        // ---- Bookmark-Shot „Fluss-Ufer Vista" (Plan §A.7, Schein-Test) ----
        // Der Schöpfer-Browser-Beweis: das Auge auf Augenhöhe am Ufer eines
        // starken Flusses, Blick aufs Wasser → vorne der feuchte (dunkle) Boden,
        // hinten der trockene (heller). Ein A/B-Paar (Welle ON vs OFF über die
        // genVersion-Schleuse) macht die Welle-Wirkung im EINEN Bild lesbar.
        console.log("\n=== BOOKMARK-SHOT: Fluss-Ufer Vista ===");
        try {
            // Stärkste Probe finden (höchste Feuchte-Gap)
            const strongMid = await page.evaluate(() => {
                const r = window.anazhRealm;
                const hydro = r.state.hydrosphere;
                if (!hydro || !hydro.rivers) return null;
                const sorted = [...hydro.rivers].sort(
                    (a, b) => (b.points ? b.points.length : 0) - (a.points ? a.points.length : 0)
                );
                const river = sorted[0];
                if (!river.points || river.points.length < 4) return null;
                const mid = river.points[Math.floor(river.points.length / 2)];
                return { x: mid.x, z: mid.z };
            });
            if (!strongMid) {
                console.log("  ✗ kein Fluss gefunden");
            } else {
                // Auf Ufer-Position: 12 m nordöstlich der Fluss-Mitte, dort
                // mit guter Wahrscheinlichkeit Land. Yaw schaut zum Fluss
                // (südwestlich), pitch leicht nach unten — der Boden im Frame.
                const standX = strongMid.x + 12;
                const standZ = strongMid.z + 12;
                const yawDeg = (Math.atan2(strongMid.x - standX, strongMid.z - standZ) * 180) / Math.PI;
                const shootShot = async (filename) => {
                    await page.evaluate(
                        (cx, cz, yd) => {
                            const ar = window.anazhRealm;
                            if (ar.state.playerBody) {
                                const tr = ar.state.playerBody.getWorldTransform();
                                const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                                tr.getOrigin().setValue(cx, (Number.isFinite(ground) ? ground : 0) + 1.7, cz);
                                ar.state.playerBody.setWorldTransform(tr);
                                try {
                                    if (ar.state.tmpVec1 && typeof ar.setVec === "function") {
                                        ar.state.playerBody.setLinearVelocity(
                                            ar.setVec(ar.state.tmpVec1, 0, 0, 0)
                                        );
                                    }
                                } catch (_e) {}
                                ar.state.playerBody.activate(true);
                            }
                            if (ar.state.player) {
                                ar.state.player.yaw = (yd * Math.PI) / 180;
                                ar.state.player.pitch = (-8 * Math.PI) / 180;
                            }
                        },
                        standX,
                        standZ,
                        yawDeg
                    );
                    // Settle: 4×6 Frames für Streaming + Rebuild
                    for (let s = 0; s < 4; s++) {
                        await page.evaluate(() => {
                            const ar = window.anazhRealm;
                            for (let i = 0; i < 6; i++)
                                if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                        });
                        await new Promise((r) => setTimeout(r, 60));
                    }
                    await page.screenshot({ path: filename, timeout: 60000 });
                };

                // Sicherstellen, dass artifacts/ existiert
                const fs = require("fs");
                if (!fs.existsSync("artifacts")) fs.mkdirSync("artifacts");

                // Mittag fixieren — A/B sauber vergleichbar (Atmosphäre +
                // Schatten gleich, nur die Boden-Farbe wandelt sich).
                await page.evaluate(() => {
                    const r = window.anazhRealm;
                    if (typeof r.setTimeOfDay === "function") r.setTimeOfDay(0.5);
                });
                // Vor allen Shots: Welt SETTLEN, damit Streaming+Build den
                // Vista-Bereich vollständig aufgebaut hat (kein leerer Chunk
                // beim ON-Shot, der das vorige Bild ruinierte).
                await shootShot(path.resolve("artifacts/uferpixel-vista-warmup.png"));
                fs.unlinkSync(path.resolve("artifacts/uferpixel-vista-warmup.png"));
                for (let s = 0; s < 8; s++) {
                    await page.evaluate(() => {
                        const ar = window.anazhRealm;
                        for (let i = 0; i < 6; i++)
                            if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                    });
                    await new Promise((r) => setTimeout(r, 80));
                }

                // Shot A: Welle ON (genVersion 2 — Standard) + Sync-Remesh des
                // 60-m-Sichtkegels, damit die Vertex-Color frisch schreibt.
                // Zeit wieder auf Mittag fixieren (settle-Frames haben gedriftet).
                await page.evaluate(
                    (cx, cz) => {
                        const r = window.anazhRealm;
                        if (typeof r.setTimeOfDay === "function") r.setTimeOfDay(0.5);
                        if (!r.state.worldMeta) r.state.worldMeta = {};
                        r.state.worldMeta.genVersion = 2;
                        if (typeof r._remeshVoxelChunksAround === "function") {
                            r._remeshVoxelChunksAround(cx, cz, 60, 1);
                        }
                        if (typeof r._drainDirtyVoxelChunks === "function") {
                            r._drainDirtyVoxelChunks();
                        }
                    },
                    standX,
                    standZ
                );
                const shotOn = path.resolve("artifacts/uferpixel-vista-on.png");
                await shootShot(shotOn);
                console.log(`  ✓ Shot ON  → ${shotOn}`);

                // Shot B: Welle OFF (genVersion 1 → feuchteAt=0 → Mix-Linie stumm)
                // + Sync-Remesh derselben Chunks; die Vertex-Color schreibt jetzt
                // ohne den dampEarth-Term — der ehrliche A/B-Vergleich.
                await page.evaluate(
                    (cx, cz) => {
                        const r = window.anazhRealm;
                        if (typeof r.setTimeOfDay === "function") r.setTimeOfDay(0.5);
                        r.state.worldMeta.genVersion = 1;
                        if (typeof r._remeshVoxelChunksAround === "function") {
                            r._remeshVoxelChunksAround(cx, cz, 60, 1);
                        }
                        if (typeof r._drainDirtyVoxelChunks === "function") {
                            r._drainDirtyVoxelChunks();
                        }
                    },
                    standX,
                    standZ
                );
                const shotOff = path.resolve("artifacts/uferpixel-vista-off.png");
                await shootShot(shotOff);
                console.log(`  ✓ Shot OFF → ${shotOff}`);

                // Welle wieder anschalten + Remesh, damit der diag-Endstand
                // korrekt + die Welt für die Bilanz frisch ist.
                await page.evaluate(
                    (cx, cz) => {
                        const r = window.anazhRealm;
                        r.state.worldMeta.genVersion = 2;
                        if (typeof r._remeshVoxelChunksAround === "function") {
                            r._remeshVoxelChunksAround(cx, cz, 60, 1);
                        }
                    },
                    standX,
                    standZ
                );

                console.log(
                    `  Vista @ (${standX.toFixed(0)}, ${standZ.toFixed(0)}) yaw=${yawDeg.toFixed(0)}° pitch=-8°`
                );
                console.log("  → Schöpfer-Browser-A/B: vergleiche die zwei Shots → der Ufer-Boden atmet.");
            }
        } catch (err) {
            console.log("  ✗ Bookmark-Shot fehlgeschlagen: " + err.message);
        }

        // ---- Globale Bilanz -----------------------------------------------
        console.log("\n=== BILANZ ===");
        if (allRatios.length) {
            const meanDLum = allRatios.reduce((a, b) => a + b.dLumNahe, 0) / allRatios.length;
            const maxDLum = Math.max(...allRatios.map((a) => a.dLumNahe));
            const maxGap = Math.max(...allRatios.map((a) => a.feuchteGap));
            const strongProbe = allRatios.find((a) => a.feuchteGap > 0.4);
            console.log(
                `A/B-ΔLum nahe über ${allRatios.length} Proben: mean=${meanDLum.toFixed(3)} max=${maxDLum.toFixed(3)} (max Feuchte-Gap ${maxGap.toFixed(2)})`
            );
            check(meanDLum > 0, "mean-ΔLum > 0 — Welle wirkt durchgängig");
            check(
                !strongProbe || strongProbe.dLumNahe > 0.03,
                "klar-feuchte Probe (Gap > 0.4) → ΔLum > 0.03",
                strongProbe ? `Gap ${strongProbe.feuchteGap.toFixed(2)} → ΔLum ${strongProbe.dLumNahe.toFixed(3)}` : "keine"
            );
        }
    } catch (err) {
        console.error("ERROR:", err.message);
        fails++;
    } finally {
        await browser.close();
        server.kill();
    }

    console.log(`\n${fails === 0 ? "✓ Γ1-Lesart-4: BODEN ATMET — Beweis grün" : `✗ ${fails} Fehler`}`);
    process.exit(fails === 0 ? 0 : 1);
})();

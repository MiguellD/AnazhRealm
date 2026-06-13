// diag-lebendige-welt.cjs — Λ.7 (V18.173+, meister-plan Λ-Plan §IV.7):
// die FISCHER-WAND. Die VOLL-Galerie: sucht ECHTE Wald-Spots via worldFieldAt
// (lebendig hoch, glut niedrig), HUD aus, mehrere Perspektiven (Augenhöhe nah,
// Drohne fern, Saum, Lichtung, Wasserkante), Wettern + Tageszeiten. Disziplin:
// vor JEDER „Λ.X fertig"-Aussage muss diese Galerie laufen + das Auge prüfen.
//
//   node scripts/diag-lebendige-welt.cjs        → Shot-Galerie + Metrik-Report
//
// Output: artifacts/lebendige-welt-*.png + STDOUT-Tabelle. Exit 0 wenn die
// gemessenen Schwellen erreicht sind (Mischwald + Hue-Streuung + Erle-Pflicht).

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const OUTDIR = path.resolve("artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 6000);
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
    if (!require("fs").existsSync(OUTDIR)) require("fs").mkdirSync(OUTDIR, { recursive: true });
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1366, height: 768 },
        protocolTimeout: 180000,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(180000);
    const errors = [];
    page.on("pageerror", (e) => {
        const msg = e.message.split("\n")[0];
        errors.push(msg);
        console.error("PAGE-ERROR:", msg);
    });
    let exitCode = 0;
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 18000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.renderer) &&
                performance.now() < dl
            )
                await new Promise((r) => setTimeout(r, 80));
        });
        // Welt streamen + settled (chunked, sonst timeout in puppeteer).
        // Setze einen hohen protocolTimeout-Default — viele Frames pro evaluate.
        page.setDefaultTimeout(120000);
        for (let pass = 0; pass < 8; pass++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 60; i++) {
                    if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
                }
            });
            await new Promise((res) => setTimeout(res, 60));
        }

        // Metriken: Baumarten + Hue-Streuung + Wasser-Spots finden.
        const metrics = await page.evaluate(() => {
            const r = window.anazhRealm;
            const archs = (r.state.architectures || []).filter((a) => a.type && a.type.startsWith("baum_"));
            const types = {};
            const hues = [];
            for (const a of archs) {
                types[a.type] = (types[a.type] || 0) + 1;
                if (Number.isFinite(a.tintH)) hues.push(a.tintH);
            }
            const mean = hues.reduce((s, v) => s + v, 0) / Math.max(1, hues.length);
            const variance = hues.reduce((s, v) => s + (v - mean) * (v - mean), 0) / Math.max(1, hues.length);
            const stdDev = Math.sqrt(variance);
            const erles = archs.filter((a) => a.type === "baum_erle");
            const erleAtWater = erles.filter((a) => {
                const f = typeof r._feuchteAt === "function" ? r._feuchteAt(a.position.x, a.position.z) : 0;
                return f >= 0.5;
            });
            return {
                totalArchitectures: r.state.architectures.length,
                totalBaeume: archs.length,
                typeCounts: types,
                distinctSpecies: Object.keys(types).length,
                hueCount: hues.length,
                hueStdDev: stdDev,
                erleCount: erles.length,
                erleAtWaterCount: erleAtWater.length,
            };
        });

        console.log("\n=== Λ.7 — DIE FISCHER-WAND (Mess-Report) ===");
        console.log(`Architekturen total: ${metrics.totalArchitectures}`);
        console.log(`Bäume total: ${metrics.totalBaeume}`);
        console.log(`Distinkte Baumarten: ${metrics.distinctSpecies}`);
        console.log(`Typ-Verteilung:`);
        for (const t of Object.keys(metrics.typeCounts)) console.log(`  ${t}: ${metrics.typeCounts[t]}`);
        console.log(`Hue-Streuung: n=${metrics.hueCount}, σ=${metrics.hueStdDev.toFixed(4)}`);
        console.log(`Erle: ${metrics.erleCount} total, ${metrics.erleAtWaterCount} an feuchten Stellen`);

        // ECHTE Welt-Spots finden (Lebendig hoch, Glut niedrig = Wald).
        const spots = await page.evaluate(() => {
            const r = window.anazhRealm;
            const lpos = (r.state.playerMesh && r.state.playerMesh.position) || { x: 0, z: 0 };
            const cx = Math.round(lpos.x);
            const cz = Math.round(lpos.z);
            const archs = (r.state.architectures || []).filter((a) => a.type && a.type.startsWith("baum_"));

            // Suche dichte Wald-Cluster: pro 40x40-Region die Anzahl Bäume zählen.
            const buckets = new Map();
            for (const a of archs) {
                const bx = Math.round(a.position.x / 40) * 40;
                const bz = Math.round(a.position.z / 40) * 40;
                const key = `${bx},${bz}`;
                if (!buckets.has(key)) buckets.set(key, { cx: bx, cz: bz, count: 0, archs: [] });
                const b = buckets.get(key);
                b.count++;
                b.archs.push(a);
            }
            const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
            const denseCluster = sorted[0] || null;

            // Wasser-nahe Stellen suchen
            const wasserSpots = [];
            for (let dx = -200; dx <= 200; dx += 20) {
                for (let dz = -200; dz <= 200; dz += 20) {
                    const x = cx + dx;
                    const z = cz + dz;
                    const f = r._feuchteAt ? r._feuchteAt(x, z) : 0;
                    if (f >= 0.5) {
                        const sy = r._voxelSurfaceY ? r._voxelSurfaceY(x, z) : null;
                        const wl = r._waterLevelAt ? r._waterLevelAt(x, z) : 0;
                        if (sy !== null && Number.isFinite(sy) && sy > wl + 0.3) {
                            wasserSpots.push({ x, z, sy, feuchte: f });
                        }
                    }
                }
            }

            // Lichtung-suchen: lebendig hoch, glut niedrig, archs in der nähe (zur Atmosphäre)
            const lichtung = [];
            for (let dx = -100; dx <= 100; dx += 25) {
                for (let dz = -100; dz <= 100; dz += 25) {
                    const x = cx + dx;
                    const z = cz + dz;
                    const f = r.worldFieldAt(x, z);
                    if (!f) continue;
                    if (f.lebendig > 0.4 && f.glut < 0.1 && f.dichte < 0.7) {
                        const sy = r._voxelSurfaceY(x, z);
                        if (sy !== null && Number.isFinite(sy)) lichtung.push({ x, z, sy, lebendig: f.lebendig });
                    }
                }
            }
            lichtung.sort((a, b) => b.lebendig - a.lebendig);

            return {
                denseCluster,
                wasserSpots: wasserSpots.slice(0, 5),
                lichtung: lichtung.slice(0, 3),
            };
        });

        console.log("\n=== ORTE-KARTE ===");
        console.log(
            `Dichtester Wald-Cluster: ${spots.denseCluster ? `(${spots.denseCluster.cx}, ${spots.denseCluster.cz}) mit ${spots.denseCluster.count} Bäumen` : "keiner"}`
        );
        console.log(`Wasser-Spots: ${spots.wasserSpots.length}`);
        console.log(`Lichtungen: ${spots.lichtung.length}`);

        // HUD verbergen für saubere Welt-Shots (alles, was die Sicht stört)
        await page.evaluate(() => {
            const css = `
                #console, #logbook-overlay, #title-bar, #status-bar, #hotbar-host,
                #topnav, #emotion-label, #status-emotion, #chat-feed,
                .drawer, .hud-overlay, #toast-host, #affordance-hint,
                #crosshair, .ui-banner { display: none !important; visibility: hidden !important; }
                body { background: #000; }
            `;
            const st = document.createElement("style");
            st.id = "_hide-hud";
            st.textContent = css;
            document.head.appendChild(st);
        });

        // Hilfsfunktion: teleportiere + settle + screenshot (alle evaluates kurz)
        const shootFrom = async (name, x, z, eyeY, yawDeg, pitchDeg = -5) => {
            await page.evaluate(
                (cx, cz, ey, yd, pd) => {
                    const ar = window.anazhRealm;
                    if (ar.state.playerBody) {
                        const tr = ar.state.playerBody.getWorldTransform();
                        const o = tr.getOrigin();
                        const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                        const eyeAbs = (Number.isFinite(ground) ? ground : 0) + ey;
                        o.setValue(cx, eyeAbs, cz);
                        ar.state.playerBody.setWorldTransform(tr);
                        try {
                            if (ar.state.tmpVec1 && typeof ar.setVec === "function") {
                                ar.state.playerBody.setLinearVelocity(ar.setVec(ar.state.tmpVec1, 0, 0, 0));
                            }
                        } catch (_e) {
                            /* defensiv */
                        }
                        ar.state.playerBody.activate(true);
                    }
                    if (Number.isFinite(yd) && ar.state.player) ar.state.player.yaw = (yd * Math.PI) / 180;
                    if (Number.isFinite(pd) && ar.state.player) ar.state.player.pitch = (pd * Math.PI) / 180;
                },
                x,
                z,
                eyeY,
                yawDeg,
                pitchDeg
            );
            // Settle: 6×5 Frames (bounded — kein endloser evaluate; swiftshader hat hohe Frame-Cost)
            for (let s = 0; s < 6; s++) {
                await page.evaluate(() => {
                    const ar = window.anazhRealm;
                    for (let i = 0; i < 5; i++) if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                });
                await new Promise((res) => setTimeout(res, 30));
            }
            const filePath = path.resolve(OUTDIR + `/lebendige-welt-${name}.png`);
            await page.screenshot({ path: filePath });
            console.log(`Shot: ${name} @ (${x}, ${z}) → ${filePath}`);
        };

        // === PERSPEKTIVE 1: Wald aus Augenhöhe nah ===
        if (spots.denseCluster) {
            const c = spots.denseCluster;
            await shootFrom("01-wald-nah", c.cx, c.cz, 2.2, 0, -5);
        }

        // === PERSPEKTIVE 2: Wald aus erhöhter Position (Drohne) ===
        if (spots.denseCluster) {
            const c = spots.denseCluster;
            await shootFrom("02-wald-drohne", c.cx + 30, c.cz + 30, 8, 225, -20);
        }

        // === PERSPEKTIVE 3: Nah auf einen einzelnen Baum (Pro-Instanz-Tint sichtbar) ===
        if (spots.denseCluster && spots.denseCluster.archs.length) {
            // Wähle Bäume, die nahe beieinander stehen (für Tint-Vergleich)
            const archs = spots.denseCluster.archs.slice(0, 5);
            const center = archs.reduce(
                (a, b) => ({ x: a.x + b.position.x / archs.length, z: a.z + b.position.z / archs.length }),
                { x: 0, z: 0 }
            );
            await shootFrom("03-baeume-tint-vergleich", center.x - 8, center.z - 8, 3, 45, 0);
        }

        // === PERSPEKTIVE 4: Wiese / Lichtung ===
        if (spots.lichtung.length) {
            const l = spots.lichtung[0];
            await shootFrom("04-lichtung", l.x, l.z, 2.0, 0, -2);
        }

        // === PERSPEKTIVE 5: Wasser-Saum (Erle dort?) ===
        if (spots.wasserSpots.length) {
            const w = spots.wasserSpots[0];
            await shootFrom("05-wasser-saum", w.x, w.z, 2.0, 0, -8);
        }

        // === PERSPEKTIVE 6: Wald aus Distanz (Atmosphäre + Schichtung) ===
        if (spots.denseCluster) {
            const c = spots.denseCluster;
            await shootFrom("06-wald-fern", c.cx - 80, c.cz - 80, 12, 45, -8);
        }

        // === PERSPEKTIVE 7: Wald am Abend (Atmosphäre + Mond-Rim) ===
        if (spots.denseCluster) {
            await page.evaluate(() => {
                const ar = window.anazhRealm;
                if (typeof ar.setTimeOfDay === "function") ar.setTimeOfDay(18.5);
            });
            for (let s = 0; s < 3; s++) {
                await page.evaluate(() => {
                    const ar = window.anazhRealm;
                    for (let i = 0; i < 15; i++) if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                });
                await new Promise((res) => setTimeout(res, 30));
            }
            const c = spots.denseCluster;
            await shootFrom("07-wald-abend", c.cx, c.cz, 2.5, 0, -2);
        }

        // === Schwellen ===
        const checks = [
            { name: "≥2 distinkte Baumarten", ok: metrics.distinctSpecies >= 2 },
            { name: "Hue-Streuung σ > 0.02", ok: metrics.hueStdDev > 0.02 },
            { name: "Bäume gespawnt > 0", ok: metrics.totalBaeume > 0 },
            { name: "Dichter Wald-Cluster gefunden", ok: !!spots.denseCluster && spots.denseCluster.count >= 5 },
        ];
        console.log("\n=== SCHWELLEN ===");
        for (const c of checks) {
            console.log(`  ${c.ok ? "✓" : "✗"} ${c.name}`);
            if (!c.ok) exitCode = 1;
        }

        if (errors.length > 0) {
            console.log(`\nPAGE-ERRORS: ${errors.length}`);
            exitCode = 1;
        }
    } catch (e) {
        console.error("FATAL:", e.message);
        exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
    process.exit(exitCode);
})();

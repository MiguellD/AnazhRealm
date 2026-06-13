// diag-fischer-wand.cjs — V18.177 die ECHTE 6-Shot-Galerie (Plan §IV.7)
// 1) Wald-Cluster nah · 2) Wald aus Distanz · 3) Wiese mit Sonne ·
// 4) Lichtung · 5) Wasser-Saum · 6) Tag/Abend Übergang
// Klein (800x600), robuste chunked evaluates, jeder Shot eigene Datei.

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");
const OUTDIR = path.resolve("artifacts");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 10000);
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
        defaultViewport: { width: 800, height: 600 },
        protocolTimeout: 300000,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(300000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message.split("\n")[0]));
    let exitCode = 0;
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 18000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 80));
        });
        for (let p = 0; p < 12; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 50; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
            await new Promise((r) => setTimeout(r, 80));
        }

        // HUD aus, Mittag, sonnig
        await page.evaluate(() => {
            const st = document.createElement("style");
            st.textContent = `
                #topbar, #console, #stats-hud, #hotbar, #fps, #dialogue-box, #build-mode-hud,
                #portal-prompt, #portal-invite-banner, #emotion-vignette, #emotion-label,
                #status-emotion, #statusbar, #chat-feed, #inventory-overlay,
                .drawer, .hud-overlay, .topbar, [class*="drawer"], .hud-frame {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
            `;
            document.head.appendChild(st);
            const ar = window.anazhRealm;
            if (typeof ar.setTimeOfDay === "function") ar.setTimeOfDay(0.5);
            if (typeof ar.setWeather === "function") ar.setWeather("sunny");
        });
        for (let p = 0; p < 4; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 10; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
        }

        // Spot-Suche (Wald, Lichtung, Wasser)
        const spots = await page.evaluate(() => {
            const r = window.anazhRealm;
            const archs = (r.state.architectures || []).filter((a) => a.type && a.type.startsWith("baum_"));
            const buckets = new Map();
            for (const a of archs) {
                const bx = Math.round(a.position.x / 40) * 40;
                const bz = Math.round(a.position.z / 40) * 40;
                const key = `${bx},${bz}`;
                if (!buckets.has(key)) buckets.set(key, { cx: bx, cz: bz, count: 0 });
                buckets.get(key).count++;
            }
            const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
            const denseCluster = sorted[0] || { cx: 0, cz: 0, count: 0 };

            // Lichtung suchen
            let lichtung = null;
            for (let dx = -100; dx <= 100; dx += 15) {
                for (let dz = -100; dz <= 100; dz += 15) {
                    const f = r.worldFieldAt(dx, dz);
                    if (!f) continue;
                    if (f.lebendig > 0.55 && f.glut < 0.1 && f.dichte < 0.55) {
                        if (!lichtung || f.lebendig > lichtung.lebendig) lichtung = { x: dx, z: dz, lebendig: f.lebendig };
                    }
                }
            }

            // Wasser-Saum suchen
            let wasser = null;
            for (let dx = -200; dx <= 200; dx += 20) {
                for (let dz = -200; dz <= 200; dz += 20) {
                    const fw = r._feuchteAt ? r._feuchteAt(dx, dz) : 0;
                    if (fw >= 0.6) {
                        const sy = r._voxelSurfaceY ? r._voxelSurfaceY(dx, dz) : null;
                        const wl = r._waterLevelAt ? r._waterLevelAt(dx, dz) : 0;
                        if (sy !== null && Number.isFinite(sy) && sy > wl + 0.3) {
                            if (!wasser || fw > wasser.feuchte) wasser = { x: dx, z: dz, feuchte: fw };
                        }
                    }
                }
            }

            return { denseCluster, lichtung: lichtung || { x: 0, z: 0 }, wasser };
        });
        console.log(
            `Cluster: (${spots.denseCluster.cx}, ${spots.denseCluster.cz}) mit ${spots.denseCluster.count} Bäumen · Lichtung: (${spots.lichtung.x}, ${spots.lichtung.z}) · Wasser: ${spots.wasser ? "ja (" + spots.wasser.x + "," + spots.wasser.z + ")" : "nein"}`
        );

        // Hilfsfunktion: teleportiere + settle (kurz) + screenshot
        const shootFrom = async (name, x, z, eyeY, yawDeg, pitchDeg = -5) => {
            await page.evaluate(
                (cx, cz, ey, yd, pd) => {
                    const ar = window.anazhRealm;
                    if (ar.state.playerBody) {
                        const tr = ar.state.playerBody.getWorldTransform();
                        const o = tr.getOrigin();
                        const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                        o.setValue(cx, (Number.isFinite(ground) ? ground : 0) + ey, cz);
                        ar.state.playerBody.setWorldTransform(tr);
                        try {
                            if (ar.state.tmpVec1 && typeof ar.setVec === "function") {
                                ar.state.playerBody.setLinearVelocity(ar.setVec(ar.state.tmpVec1, 0, 0, 0));
                            }
                        } catch (_e) {}
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
            // Settle: 3×5 Frames
            for (let s = 0; s < 3; s++) {
                await page.evaluate(() => {
                    const ar = window.anazhRealm;
                    for (let i = 0; i < 5; i++) if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
                });
                await new Promise((r) => setTimeout(r, 50));
            }
            try {
                const filePath = path.resolve(OUTDIR + `/fischer-${name}.png`);
                await page.screenshot({ path: filePath, timeout: 60000 });
                console.log(`✓ ${name}`);
            } catch (_e) {
                console.log(`✗ ${name}: ${_e.message}`);
            }
        };

        // Sonne-zentrierter Yaw (für sun-Halo-Shots)
        const sunYaw = await page.evaluate(() => {
            const ar = window.anazhRealm;
            const sun = ar.state.sunMesh;
            if (!sun) return 0;
            return (Math.atan2(sun.position.x, sun.position.z) * 180) / Math.PI;
        });

        const c = spots.denseCluster;

        // === SHOT 1: Wald-Cluster aus Augenhöhe ===
        await shootFrom("01-wald-nah", c.cx, c.cz, 2.0, 0, -5);

        // === SHOT 2: Wald aus Distanz (60m) ===
        await shootFrom("02-wald-fern", c.cx + 50, c.cz + 50, 4.5, 225, -8);

        // === SHOT 3: Wiese mit Sonne ===
        const l = spots.lichtung;
        await shootFrom("03-wiese-sonne", l.x, l.z, 1.7, sunYaw, -10);

        // === SHOT 4: Lichtung (Vegetation-Vielfalt) ===
        await shootFrom("04-lichtung", l.x, l.z, 1.4, sunYaw + 90, -25);

        // === SHOT 5: Wasser-Saum ===
        if (spots.wasser) {
            await shootFrom("05-wasser-saum", spots.wasser.x, spots.wasser.z, 1.8, 0, -10);
        }

        // === SHOT 6: Abend-Stimmung (goldene Stunde) ===
        await page.evaluate(() => {
            const ar = window.anazhRealm;
            if (typeof ar.setTimeOfDay === "function") ar.setTimeOfDay(0.78); // ~18:30
        });
        for (let s = 0; s < 3; s++) {
            await page.evaluate(() => {
                const ar = window.anazhRealm;
                for (let i = 0; i < 10; i++) if (typeof ar._gameLoopTick === "function") ar._gameLoopTick(performance.now());
            });
        }
        await shootFrom("06-abend", c.cx, c.cz, 2.2, sunYaw, -3);

        if (errors.length) {
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

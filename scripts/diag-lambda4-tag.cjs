// diag-lambda4-tag.cjs — TAG-Galerie für Λ.4 (Streu-Tint)
// kleinere viewport, mittag, mehrere Streu-Klüstern → die Tints sichtbar

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
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(240000);
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

        // HUD aus + Tag (12 Uhr)
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

        // Suche Wiese
        const spot = await page.evaluate(() => {
            const r = window.anazhRealm;
            let best = null;
            for (let dx = -150; dx <= 150; dx += 12) {
                for (let dz = -150; dz <= 150; dz += 12) {
                    const f = r.worldFieldAt(dx, dz);
                    if (!f) continue;
                    if (f.lebendig > 0.6 && f.glut < 0.08 && f.dichte < 0.55) {
                        if (!best || f.lebendig > best.lebendig) best = { x: dx, z: dz, lebendig: f.lebendig };
                    }
                }
            }
            return best || { x: 0, z: 0, lebendig: 0 };
        });
        console.log(`Wiese: (${spot.x}, ${spot.z}) lebendig=${spot.lebendig.toFixed(2)}`);

        // Teleport
        await page.evaluate(
            (cx, cz) => {
                const ar = window.anazhRealm;
                if (ar.state.playerBody) {
                    const tr = ar.state.playerBody.getWorldTransform();
                    const o = tr.getOrigin();
                    const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                    o.setValue(cx, (Number.isFinite(ground) ? ground : 0) + 1.7, cz);
                    ar.state.playerBody.setWorldTransform(tr);
                    ar.state.playerBody.activate(true);
                }
                if (ar.state.player) {
                    ar.state.player.pitch = -0.6;
                    ar.state.player.yaw = 0;
                }
            },
            spot.x,
            spot.z
        );

        for (let p = 0; p < 5; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 8; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
            await new Promise((r) => setTimeout(r, 50));
        }

        try {
            await page.screenshot({ path: OUTDIR + "/lambda4-tag-wiese.png", timeout: 60000 });
            console.log(`Shot: lambda4-tag-wiese.png`);
        } catch (_e) {
            console.log(`Tag-Wiese-Shot: ${_e.message}`);
        }

        // Detail-Shot: noch tiefer, näher am Boden
        await page.evaluate(
            (cx, cz) => {
                const ar = window.anazhRealm;
                if (ar.state.playerBody) {
                    const tr = ar.state.playerBody.getWorldTransform();
                    const o = tr.getOrigin();
                    const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                    o.setValue(cx, (Number.isFinite(ground) ? ground : 0) + 0.8, cz);
                    ar.state.playerBody.setWorldTransform(tr);
                }
                if (ar.state.player) ar.state.player.pitch = -0.3;
            },
            spot.x,
            spot.z
        );
        for (let p = 0; p < 3; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 5; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
        }
        try {
            await page.screenshot({ path: OUTDIR + "/lambda4-tag-detail.png", timeout: 60000 });
            console.log(`Shot: lambda4-tag-detail.png`);
        } catch (_e) {
            console.log(`Detail-Shot: ${_e.message}`);
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

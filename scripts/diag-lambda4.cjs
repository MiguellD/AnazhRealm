// diag-lambda4.cjs — schneller Beweis: pro-Instanz-Tint für Streu-Vegetation
// rendert ein NAH-Shot in eine Wiese, prüft instanceColor-Setting + visuell.

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
    const errors = [];
    page.on("pageerror", (e) => {
        const msg = e.message.split("\n")[0];
        errors.push(msg);
        console.error("PAGE-ERROR:", msg);
    });
    page.on("console", (msg) => {
        const text = msg.text();
        if (/error|fail|exception|TypeError/i.test(text)) console.error("CONSOLE:", text);
    });
    let exitCode = 0;
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 18000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 80));
        });
        // Welt VIEL streamen (Λ.4 braucht scatter-Chunks)
        for (let p = 0; p < 15; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 50; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
            await new Promise((r) => setTimeout(r, 100));
        }

        // HUD aus
        await page.evaluate(() => {
            const st = document.createElement("style");
            st.textContent = `#console,#logbook-overlay,#title-bar,#status-bar,#hotbar-host,#topnav,#emotion-label,#status-emotion,#chat-feed,.drawer,.hud-overlay{display:none!important}`;
            document.head.appendChild(st);
        });

        // Suche eine Wiese (lebendig hoch, glut niedrig, viele blumen/farn drum)
        const spot = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Probe-Sweep
            let best = null;
            for (let dx = -100; dx <= 100; dx += 16) {
                for (let dz = -100; dz <= 100; dz += 16) {
                    const f = r.worldFieldAt(dx, dz);
                    if (!f) continue;
                    if (f.lebendig > 0.6 && f.glut < 0.1 && f.dichte < 0.6) {
                        if (!best || f.lebendig > best.lebendig) best = { x: dx, z: dz, lebendig: f.lebendig };
                    }
                }
            }
            return best || { x: 0, z: 0, lebendig: 0 };
        });
        console.log(`Wiese gefunden: (${spot.x}, ${spot.z}) lebendig=${spot.lebendig.toFixed(2)}`);

        // Spieler an Wiese teleportieren, low + horizontal blick
        await page.evaluate(
            (cx, cz) => {
                const ar = window.anazhRealm;
                if (ar.state.playerBody) {
                    const tr = ar.state.playerBody.getWorldTransform();
                    const o = tr.getOrigin();
                    const ground = ar._voxelSurfaceY ? ar._voxelSurfaceY(cx, cz) : 0;
                    o.setValue(cx, (Number.isFinite(ground) ? ground : 0) + 1.6, cz);
                    ar.state.playerBody.setWorldTransform(tr);
                    ar.state.playerBody.activate(true);
                }
                if (ar.state.player) {
                    ar.state.player.pitch = -0.3; // schauen nach unten leicht
                    ar.state.player.yaw = 0;
                }
            },
            spot.x,
            spot.z
        );

        // Settle
        for (let p = 0; p < 4; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 10; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
            await new Promise((r) => setTimeout(r, 100));
        }

        try {
            await page.screenshot({ path: OUTDIR + "/lambda4-wiese.png", timeout: 60000 });
            console.log(`Shot: ${OUTDIR}/lambda4-wiese.png`);
        } catch (_e) {
            console.log(`Screenshot übersprungen: ${_e.message}`);
        }
        // Detail-Shot: pitch -45° für Boden-Sicht (Streu-Vegetation)
        await page.evaluate(() => {
            const ar = window.anazhRealm;
            if (ar.state.player) ar.state.player.pitch = -0.85;
        });
        for (let p = 0; p < 3; p++) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let i = 0; i < 5; i++) if (typeof r._gameLoopTick === "function") r._gameLoopTick(performance.now());
            });
        }
        try {
            await page.screenshot({ path: OUTDIR + "/lambda4-wiese-boden.png", timeout: 60000 });
            console.log(`Shot Boden: ${OUTDIR}/lambda4-wiese-boden.png`);
        } catch (_e) {
            console.log(`Boden-Screenshot übersprungen: ${_e.message}`);
        }

        // Code-Verifikation: prüfe ob die `_scatterMats` einen instanceColor-Tint im Material haben
        const verify = await page.evaluate(() => {
            const r = window.anazhRealm;
            const out = { mats: {}, scatterChunks: 0, totalScatterMeshes: 0, tintingMeshes: 0 };
            const mats = r.state._scatterMats;
            if (mats) {
                for (const [name, mat] of mats) {
                    out.mats[name] = {
                        useInstanceTint: !!(mat.userData && mat.userData.useInstanceTint),
                        hasColorNode: !!mat.colorNode,
                    };
                }
            }
            // Scatter-Chunks zählen + instanceColor-getragene Meshes
            if (r.state.voxelChunkScatter) {
                for (const [, list] of r.state.voxelChunkScatter) {
                    out.scatterChunks++;
                    for (const it of list) {
                        out.totalScatterMeshes++;
                        if (it.mesh && it.mesh.instanceColor) out.tintingMeshes++;
                    }
                }
            }
            return out;
        });
        console.log("\n=== Λ.4 Verifikation ===");
        console.log(`Streu-Chunks: ${verify.scatterChunks}`);
        console.log(`Streu-Meshes total: ${verify.totalScatterMeshes}`);
        console.log(`Davon mit instanceColor: ${verify.tintingMeshes}`);
        console.log(`Material useInstanceTint Flag:`);
        for (const name of Object.keys(verify.mats)) {
            console.log(`  ${name}: useInstanceTint=${verify.mats[name].useInstanceTint}`);
        }

        if (verify.tintingMeshes === 0) {
            console.log("WARN: keine instanceColor-Meshes — Λ.4 wirkt nicht!");
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

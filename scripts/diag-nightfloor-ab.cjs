// diag-nightfloor-ab.cjs — M7 (Befund 20): A/B-Beweis des Terrain-Nacht-Bodens.
// Misst das Pixel-Mittel der unteren Bildhälfte (Terrain) bei floor 0 vs 0.12
// in der Abend-Szene (eingefrorenes Auge, dieselbe Kamera).
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
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
    await page.setViewport({ width: 800, height: 450 });
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 20000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.renderer ||
                    !window.anazhRealm.state.voxelChunks ||
                    window.anazhRealm.state.voxelChunks.size < 6) &&
                performance.now() < dl
            ) {
                try {
                    window.anazhRealm &&
                        window.anazhRealm._gameLoopTick &&
                        window.anazhRealm._gameLoopTick(performance.now());
                } catch (_e) {
                    /* warm */
                }
                await new Promise((r) => setTimeout(r, 30));
            }
        });
        const shoot = async (floor, file) => {
            await page.evaluate((f) => {
                const r = window.anazhRealm;
                r.setTimeOfDay && r.setTimeOfDay(0.85);
                r._dayNightApplyHemiAndFog && r._applyDayNightToScene && r._applyDayNightToScene();
                const au = r._ensureAtmoUniforms();
                if (au && au.terrainNightFloor) au.terrainNightFloor.value = f;
                const pm = r.state.playerMesh.position;
                const cam = r.state.camera;
                cam.position.set(pm.x, pm.y + 2.2, pm.z);
                cam.lookAt(pm.x + 20, pm.y - 2, pm.z);
                cam.updateMatrixWorld(true);
                r.state.postProcessingFailed = true;
                try {
                    r._loopRender(performance.now());
                    r._loopRender(performance.now());
                } catch (_e) {
                    /* shot */
                }
            }, floor);
            await new Promise((r) => setTimeout(r, 300));
            await page.screenshot({ path: path.join("artifacts", file) });
        };
        await shoot(0.0, "nightfloor-aus.png");
        await shoot(0.12, "nightfloor-an.png");
        // Pixel-Mittel der unteren Hälfte vergleichen (PNG via Canvas im Browser).
        const lum = await page.evaluate(async () => {
            const load = (src) =>
                new Promise((res) => {
                    const i = new Image();
                    i.onload = () => res(i);
                    i.src = src + "?t=" + Math.random();
                });
            const mean = (img) => {
                const c = document.createElement("canvas");
                c.width = img.width;
                c.height = img.height;
                const g = c.getContext("2d");
                g.drawImage(img, 0, 0);
                const d = g.getImageData(
                    0,
                    Math.floor(img.height * 0.55),
                    img.width,
                    Math.floor(img.height * 0.4)
                ).data;
                let s = 0;
                for (let i = 0; i < d.length; i += 4) s += (d[i] + d[i + 1] + d[i + 2]) / 3;
                return s / (d.length / 4);
            };
            const a = await load("artifacts/nightfloor-aus.png");
            const b = await load("artifacts/nightfloor-an.png");
            return { aus: Math.round(mean(a) * 10) / 10, an: Math.round(mean(b) * 10) / 10 };
        });
        console.log("NACHT-BODEN A/B (Pixel-Mittel untere Hälfte, Abend 0.85):", JSON.stringify(lum));
    } catch (e) {
        console.error("DIAG-FEHLER:", e.message);
        process.exitCode = 1;
    } finally {
        await browser.close();
        server.kill();
    }
})();

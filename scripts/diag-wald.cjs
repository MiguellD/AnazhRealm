// diag-wald.cjs — W-H der FISCHER-BLICK: rendert einen echten Baum-Cluster aus
// der warmen Welt (kein Raten) + schaut ihn SELBST an. Findet die dichteste
// Baum-Ansammlung unter state.architectures, stellt die Kamera auf Augenhöhe
// davor und zeichnet drei Frames (Mittag · Abend · Nah). Gehärtet (DIAG_PORT).
//   node scripts/diag-wald.cjs
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const SERVER_JS = path.resolve("save-server.js");
const ART = path.resolve("artifacts");
const DIAG_PORT = Number(process.env.DIAG_PORT) || 4320;

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
    await page.setViewport({ width: 900, height: 540 });
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto(`http://127.0.0.1:${DIAG_PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        // HUD weg.
        await page.evaluate(() => {
            for (const id of ["topbar", "console", "chat-widget", "status-bar", "hotbar"]) {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            }
            document.body.classList.add("hud-hidden");
        });
        // Settled warm — länger pumpen, damit ein Wald steht (Streaming + Spawns).
        await page.evaluate(async () => {
            let stub = false;
            const t0 = performance.now();
            let last = -1;
            let stable = 0;
            while (performance.now() - t0 < 120000) {
                const r = window.anazhRealm;
                if (r && !stub && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
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
                    const trees = (r.state.architectures || []).filter((a) => /^baum_/.test(a.type)).length;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 12 && stable > 40 && trees >= 8) break;
                }
                await new Promise((res) => setTimeout(res, 5));
            }
        });

        // Den dichtesten Baum-Cluster finden (Greedy: das Zentrum mit den meisten
        // Bäumen in 18 m) + die Kamera davor stellen.
        const cam = await page.evaluate(() => {
            const r = window.anazhRealm;
            const trees = (r.state.architectures || [])
                .filter((a) => /^baum_/.test(a.type))
                .map((a) => ({ x: a.position.x, z: a.position.z, type: a.type, scale: a.scale, yaw: a.rotationY }));
            if (trees.length === 0) return { ok: false, trees: 0 };
            // Cluster-Zentrum
            let best = trees[0];
            let bestN = 0;
            for (const t of trees) {
                let n = 0;
                for (const u of trees) if (Math.hypot(t.x - u.x, t.z - u.z) < 18) n++;
                if (n > bestN) {
                    bestN = n;
                    best = t;
                }
            }
            // Yaw-Streuung messen (der Klon-Killer-Beweis): die Standardabw. der
            // Rotationen im Cluster — bei Klonen ~0, bei echtem Wald groß.
            const inCluster = trees.filter((t) => Math.hypot(t.x - best.x, t.z - best.z) < 18);
            const yaws = inCluster.map((t) => t.yaw || 0);
            const meanY = yaws.reduce((a, b) => a + b, 0) / yaws.length;
            const stdY = Math.sqrt(yaws.reduce((a, b) => a + (b - meanY) ** 2, 0) / yaws.length);
            const scales = inCluster.map((t) => t.scale || 1);
            const minS = Math.min(...scales);
            const maxS = Math.max(...scales);
            const types = [...new Set(inCluster.map((t) => t.type))];
            // Kamera 16 m südlich, Augenhöhe über dem Cluster-Boden.
            const gy = r.getTerrainHeightAt(best.x, best.z);
            window.__camWald = {
                pos: { x: best.x, y: gy + 2.0, z: best.z - 16 },
                look: { x: best.x, y: gy + 4.0, z: best.z },
            };
            return {
                ok: true,
                trees: trees.length,
                cluster: bestN,
                yawStd: Math.round(stdY * 100) / 100,
                scaleSpan: [Math.round(minS * 100) / 100, Math.round(maxS * 100) / 100],
                types,
            };
        });
        console.log("WALD:", JSON.stringify(cam));
        if (!cam.ok) {
            console.log("kein Wald gefunden (Welt ohne dichte Bäume).");
            return;
        }

        const shoot = async (file, t) => {
            await page.evaluate((tv) => {
                const r = window.anazhRealm;
                if (window.__origRender) r.state.renderer.render = window.__origRender;
                r.setTimeOfDay(tv);
                r.state.weather = "sunny";
                r.state.weatherTransition = null;
                const cp = window.__camWald;
                const setCam = () => {
                    const c = r.state.camera;
                    c.position.set(cp.pos.x, cp.pos.y, cp.pos.z);
                    c.lookAt(cp.look.x, cp.look.y, cp.look.z);
                    c.updateMatrixWorld(true);
                    c.updateProjectionMatrix();
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
            }, t);
            await page.screenshot({ path: path.join(ART, file) });
            console.log("Shot:", file);
        };
        await shoot("wald-mittag.png", 0.5);
        await shoot("wald-abend.png", 0.84);
    } finally {
        await browser.close();
        server.kill();
    }
})();

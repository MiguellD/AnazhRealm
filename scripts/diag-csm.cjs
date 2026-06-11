// B4/V18.130 — SCHATTEN-CSM: die Look-Sonde (das A-Gate). Die V18.113-AKNE-
// MATRIX als Bild-Beweis: {Mittag · Schräglicht(Abend)} × {Struktur auf
// Fläche · Hang} — settled, Augenhöhe, HUD aus (Tour-Disziplin). Dazu der
// Status-Dump (Kaskaden · breaks · Texel-Schärfe nah vs. alt). Bilder:
// artifacts/csm-{noon,evening}.png — das Urteil ist das AUGE (keine Akne-
// Rauten an Hängen, Schatten nah scharf, fern vorhanden).
//   node scripts/diag-csm.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4398;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
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
    await page.setViewport({ width: 1600, height: 900 });
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e.message || e).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Boot + settle (Render gestubbt; Welt VOLL laden — die „Mut"-Disziplin).
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1;
        let stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
    });

    // Eine nahe Struktur als Schatten-Werfer suchen (das Mess-Motiv).
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const pm = r.state.playerMesh.position;
        let best = null;
        for (const a of r.state.architectures || []) {
            if (!a || !a.position || !a.blockerAABBs) continue;
            const d = Math.hypot(a.position.x - pm.x, a.position.z - pm.z);
            if (d < 120 && (!best || d < best.d)) best = { x: a.position.x, z: a.position.z, d, type: a.type };
        }
        return best || { x: pm.x + 10, z: pm.z, d: 10, type: "(keine Struktur — Terrain-Hang)" };
    });
    console.log(`MOTIV: ${spot.type} @(${spot.x | 0},${spot.z | 0}) d=${spot.d | 0}m`);

    fs.mkdirSync(ART, { recursive: true });
    const shot = async (file, tod) => {
        await page.evaluate(
            async (spot, tod) => {
                const r = window.anazhRealm;
                const s = r.state;
                s.timeOfDay = tod;
                if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                try {
                    for (let i = 0; i < 10; i++) r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                const gy = r.getTerrainHeightAt(spot.x + 14, spot.z + 10);
                const cam = s.camera;
                cam.position.set(spot.x + 14, (Number.isFinite(gy) ? gy : 20) + 3.4, spot.z + 10);
                const ty = r.getTerrainHeightAt(spot.x, spot.z);
                cam.lookAt(spot.x, (Number.isFinite(ty) ? ty : 18) + 2, spot.z);
                cam.updateMatrixWorld(true);
                if (window.__origRender) {
                    s.renderer.render = window.__origRender;
                    try {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } catch (_e) {}
                    s.renderer.render = function () {};
                }
            },
            spot,
            tod
        );
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file) });
        console.log(`Shot: ${file}`);
    };
    await shot("csm-noon.png", 0.5); // Mittag — Akne auf flachen Dächern/Flächen?
    await shot("csm-evening.png", 0.78); // Schräglicht — Akne-Rauten an Hängen? (die V18.113-Matrix)

    // Status NACH dem echten Render (CSM initialisiert lazy beim ersten
    // Material-Build — vor dem ersten un-gestubbten Frame sind breaks leer).
    const status = await page.evaluate(() => {
        const r = window.anazhRealm;
        const csm = r.state.csmNode;
        if (!csm) return { active: false };
        const texel = csm.lights.map((lw) => {
            const c = lw.shadow.camera;
            return +((c.right - c.left) / lw.shadow.mapSize.width).toFixed(3);
        });
        // Der OBJEKTIVE Schatten-Beweis: jede Kaskade hat nach einem echten
        // Frame ihre Depth-Map ALLOZIERT (Three.js rendert die Shadow-Pass-
        // Maps nur für wirklich aktive Schatten-Lichter).
        const mapsAllocated = csm.lights.map((lw) => !!(lw.shadow && lw.shadow.map));
        return {
            active: true,
            cascades: csm.cascades,
            breaks: csm.breaks.map((b) => +b.toFixed(3)),
            fade: csm.fade,
            texelProKaskade: texel,
            altTexel: 0.293, // die eine 600/2048-Map (V17.111-Stand) — Vergleichswert
            mapsAllocated,
            camBound: !!csm.camera,
        };
    });
    console.log("CSM-STATUS:", JSON.stringify(status));
    const ok =
        status.active &&
        status.camBound &&
        Array.isArray(status.mapsAllocated) &&
        status.mapsAllocated.every(Boolean) &&
        status.breaks.length === 3 &&
        errs.length === 0;
    console.log("PAGE-ERRORS:", errs.length ? errs.slice(0, 5).join(" | ") : "keine");
    console.log(ok ? "CSM-DIAG: GRÜN (Maps alloziert, Kaskaden gebunden, keine Fehler)" : "CSM-DIAG: ROT");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

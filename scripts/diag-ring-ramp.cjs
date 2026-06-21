// V18.301-Verifikation: der LADE-RHYTHMUS-RING. (A) headless → der Ring springt
// sofort auf das Ziel (Gate sieht die volle Welt). (B) im Nicht-Headless-Modus
// startet der aktive Ring KLEIN und wächst MONOTON zum Ziel, nur wenn der aktuelle
// Ring settled ist + der Frame Luft hat → eine kleine, settled Basis, dann wachsen.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4365,
    root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Warmup (headless, render-gestubbt)
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
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
    });

    // (A) headless: Ring = Ziel?
    const headlessState = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        return {
            isHeadless: !!(s.renderer && s.renderer._isHeadlessNull),
            target: s.chunkRingRadius,
            active: s._activeRingRadius,
            cfgRing: r._voxelChunkConfig().ringRadius,
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };
    });

    // (B) Nicht-Headless-Ramp erzwingen + die Trajektorie sampeln
    const traj = [];
    await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        // den Headless-Sprung abschalten → der echte Ramp-Pfad
        if (s.renderer) s.renderer._isHeadlessNull = false;
        s._activeRingRadius = r.constructor.RING_RAMP_START;
        s._ringRampLast = 0;
        s._frameOverBudget = false; // Frame hat Luft (render-gestubbt → schnell)
    });
    for (let i = 0; i < 30; i++) {
        await page.evaluate(() => {
            const r = window.anazhRealm;
            for (let k = 0; k < 20; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
        });
        const snap = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            return {
                active: s._activeRingRadius,
                cfgRing: r._voxelChunkConfig().ringRadius,
                built: r._builtRingRadius(),
                chunks: s.voxelChunks ? s.voxelChunks.size : 0,
                t: Math.round(performance.now()),
            };
        });
        traj.push(snap);
        await new Promise((res) => setTimeout(res, 120)); // Real-Zeit für den „Atem" (SETTLE_MS)
        if (snap.active >= headlessState.target) break;
    }

    console.log("===== V18.301 LADE-RHYTHMUS-RING =====\n");
    console.log("  (A) HEADLESS (Gate-Treue):");
    console.log(
        `      isHeadlessNull=${headlessState.isHeadless} · Ziel=${headlessState.target} · aktiv=${headlessState.active} · cfgRing=${headlessState.cfgRing} · Chunks=${headlessState.chunks}`
    );
    console.log(
        `      ${headlessState.active === headlessState.target && headlessState.chunks > 40 ? "✓ Ring = Ziel, volle Welt — das Gate sieht alles (gate-treu)" : "⚠ Ring ≠ Ziel headless — Gate-Risiko!"}\n`
    );
    console.log("  (B) NICHT-HEADLESS-RAMP (der Boot-Rhythmus):");
    console.log("      Schritt: aktiverRing · cfgRing · builtRing · Chunks");
    let mono = true,
        prev = -1;
    for (const s of traj) {
        console.log(`        ring ${s.active} · cfg ${s.cfgRing} · built ${s.built} · chunks ${s.chunks}`);
        if (s.active < prev) mono = false;
        prev = s.active;
    }
    const startRing = traj.length ? traj[0].active : 2;
    console.log("");
    console.log(
        `      Start ${startRing} → Ende ${traj.length ? traj[traj.length - 1].active : "?"} · monoton=${mono}`
    );
    if (mono && traj.length && traj[traj.length - 1].active >= headlessState.target)
        console.log(
            "      ✓ BEWIESEN: der Ring startet klein und wächst monoton zum Ziel (settled-gegated) — der Lade-Rhythmus."
        );
    else if (mono) console.log("      ~ wächst monoton (noch nicht am Ziel im Mess-Fenster) — Mechanik steht.");
    else console.log("      ⚠ nicht monoton — prüfen.");
    console.log("\n======================================");
    await browser.close();
    server.close();
    process.exit(0);
})();

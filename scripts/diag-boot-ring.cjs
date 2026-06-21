// BOOT-RING-TRACE: was sieht der Schöpfer WIRKLICH beim Start? Misst — mit echtem
// Renderer (swiftshader, NICHT der Null-Renderer der den Ring auf Ziel zwingt) — ab
// dem ALLERERSTEN Frame, wie schnell _activeRingRadius + voxelChunks.size klettern.
// Kein Warmup-bis-stabil (das überspringt genau die Boot-Phase, die der Schöpfer sieht).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4377,
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
const server = http.createServer((q, s) => {
    let p = q.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        s.statusCode = 403;
        return s.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            s.statusCode = 404;
            return s.end();
        }
        s.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        s.end(d);
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

    // Warten, bis die Welt-Instanz + der Loop existieren — dann SOFORT messen (kein
    // Vorab-Pump). Nur render() stubben für Tempo; _isHeadlessNull NICHT setzen → der
    // echte Ramp-Pfad (wie im Schöpfer-Browser).
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.renderer && typeof r._gameLoopTick === "function") {
                if (r.state.renderer.render) r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                return;
            }
            await new Promise((res) => setTimeout(res, 10));
        }
    });

    const trace = [];
    const t0 = Date.now();
    for (let i = 0; i < 80; i++) {
        const snap = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            return {
                isHeadless: !!(s.renderer && s.renderer._isHeadlessNull),
                target: s.chunkRingRadius,
                active: s._activeRingRadius,
                cfgRing: r._voxelChunkConfig ? r._voxelChunkConfig().ringRadius : null,
                built: r._builtRingRadius ? r._builtRingRadius() : null,
                chunks: s.voxelChunks ? s.voxelChunks.size : 0,
                pending: s.voxelMeshPending ? s.voxelMeshPending.size : 0,
                overBudget: !!s._frameOverBudget,
                frameMs: s.perfSense ? Math.round(s.perfSense.frameMs * 10) / 10 : null,
            };
        });
        snap.ms = Date.now() - t0;
        trace.push(snap);
        await new Promise((res) => setTimeout(res, 150)); // echte Zeit (Atem/Settle)
    }

    console.log("\n===== BOOT-RING-TRACE: was lädt beim Start (echter Renderer-Pfad) =====");
    console.log(`  isHeadlessNull = ${trace[0].isHeadless}  ·  chunkRingRadius (Ziel) = ${trace[0].target}`);
    console.log("  ms     aktiv  cfg  built  chunks  pending  overBudget  frameMs");
    let last = -1;
    for (const s of trace) {
        // nur Zeilen zeigen, wo sich was ändert (sonst Rauschen)
        const sig = `${s.active}|${s.chunks}|${s.overBudget}`;
        if (sig !== last || s === trace[trace.length - 1]) {
            console.log(
                `  ${String(s.ms).padStart(5)}  ${String(s.active).padStart(4)}   ${String(s.cfgRing).padStart(3)}  ${String(s.built).padStart(4)}   ${String(s.chunks).padStart(5)}   ${String(s.pending).padStart(5)}     ${s.overBudget ? "JA " : "nein"}      ${s.frameMs}`
            );
            last = sig;
        }
    }
    const first = trace[0],
        end = trace[trace.length - 1];
    // Wann erreichte der Ring das Ziel + 81?
    const hitTarget = trace.find((s) => s.active >= first.target);
    const hit81 = trace.find((s) => s.chunks >= 80);
    console.log("");
    console.log(`  Start: aktiv=${first.active} chunks=${first.chunks} @ ${first.ms}ms`);
    if (hitTarget) console.log(`  Ring erreichte das ZIEL (${first.target}) @ ${hitTarget.ms}ms`);
    if (hit81) console.log(`  Chunk-Zahl erreichte ~81 @ ${hit81.ms}ms  ← das ist „100 Chunks geladen"`);
    console.log(`  Ende: aktiv=${end.active} chunks=${end.chunks} overBudget=${end.overBudget}`);
    console.log("=======================================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();

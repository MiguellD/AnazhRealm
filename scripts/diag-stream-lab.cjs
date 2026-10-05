#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-stream-lab.cjs — DIE STREAMING-WERKBANK (npm run stream-lab)
//
// Eine SCHNELLE, isolierte Werkbank für die Lade-/Streaming-Wurzel: wie schnell erscheint der Boden unter dem
// Spieler (Start-Chunk + dessen LOD). ZAHLEN, kein Pixel. Der Null-Renderer genügt: die Chunk-Geometrie ist CPU.
//
// MISST: (A) Start-Chunk — Ticks bis der Spieler-Chunk einen Mesh hat + dessen LOD.
// Die Phasen B/C (Nebel-/Wasser-Front-Pendeln, Nebel-Puffer) fielen mit dem Lade-Nebel (V18.530): die Luft ist
// Physik (`_luftEnsure`), Ungebautes deckt der Fern-Ring (Loch-Deckel), keine Front treibt mehr einen Nebel.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4324;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    // SCHNELLER Null-Renderer (kein swiftshader) — die Chunk-Geometrie ist CPU, baut auch ohne GPU.
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-gpu"],
        protocolTimeout: 240000,
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(
            () => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function",
            { timeout: 120000 }
        );
        // ── PHASE A: Start-Chunk — wie schnell erscheint der Boden unter dem Spieler? ──
        // Mit YIELDS (der Worker streamt async, V18.271) — ein tight-loop sähe den Chunk NIE.
        const isHeadlessNull = await page.evaluate(
            () => !!(window.anazhRealm.state.renderer && window.anazhRealm.state.renderer._isHeadlessNull)
        );
        let appearTick = -1,
            firstLod = null;
        for (let i = 0; i < 60 && appearTick < 0; i++) {
            await page.evaluate(() => window.anazhRealm._gameLoopTick && window.anazhRealm._gameLoopTick());
            await new Promise((r) => setTimeout(r, 18));
            const got = await page.evaluate(() => {
                const st = window.anazhRealm.state;
                const pc = st.lastPlayerVoxelChunk;
                if (!pc) return null;
                const e = st.voxelChunks && st.voxelChunks.get(`${pc.cx},${pc.cz}`);
                if (e && (e.mesh || e.empty))
                    return { lod: e.lod != null ? e.lod : e.mesh && e.mesh.userData ? e.mesh.userData.lod : null };
                return null;
            });
            if (got) {
                appearTick = i;
                firstLod = got.lod;
            }
        }
        const startPhase = { appearTick, firstLod, isHeadlessNull };

        out = { startPhase };
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Lab-Boot/Mess fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    // ── Analyse ──
    console.log("\n=== STREAMING-WERKBANK ===");
    console.log(
        `Renderer: ${out.startPhase.isHeadlessNull ? "NULL (schnell, ~9 s)" : "ECHT (swiftshader)"}`
    );

    console.log("\n— PHASE A: Start-Chunk —");
    console.log(
        `  Boden unter dem Spieler nach ${out.startPhase.appearTick} Ticks · erster LOD: ${out.startPhase.firstLod}`
    );

    process.exit(out.startPhase.appearTick >= 0 ? 0 : 1);
})();

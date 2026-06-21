// Diag: DIE BOOT-ZEITLEISTE (V18.308-Vorbereitung — Schöpfer „ich spawne noch im
// fallen, erhalte erst spät die kontrolle; ein top programm reagiert sofort, lädt
// anderes langsam"). MISST den allerersten Lebens-Abschnitt des Spielers: fällt er
// beim Spawn? von welcher Höhe auf welche? wie viele Frames bis er GEERDET steht?
// wann trägt echte Kollision (Plattform-/Chunk-BVH) statt des weichen Bodens? Plus:
// wie lange blockt der synchrone Boot den Main-Thread (Kontrolle kommt erst danach)?
// Null-Renderer (Mechanik headless-treu; der Fall ist reine Physik/Geometrie).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4364,
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // Boot-Zeitstempel: wann ist die Welt fertig (loop installiert)?
        window.__bootMarks = {};
    });
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Warte bis der Loop installiert ist (Welt bereit), MISS wie lange das dauerte.
    const ready = await page.evaluate(async (navStart) => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.playerMesh) {
                return { bootMs: Math.round(performance.now()), navToReady: Date.now() - navStart };
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        return { error: "boot timeout" };
    }, t0);

    // Jetzt die ERSTEN Frames Tick für Tick aufzeichnen (der Fall passiert hier).
    const trace = await page.evaluate(async () => {
        const r = window.anazhRealm,
            s = r.state;
        const pm = s.playerMesh;
        const rows = [];
        const playerChunkBVH = () => {
            const lpc = s.lastPlayerVoxelChunk;
            if (!lpc || !s.voxelChunks) return "?";
            const e = s.voxelChunks.get(`${lpc.cx},${lpc.cz}`);
            return e ? (e.empty ? "empty" : e.hasBVH ? "BVH" : e.mesh ? "mesh" : "none") : "none";
        };
        const platformReady = () => {
            if (!s.architectures) return "?";
            const p = s.architectures.find((a) => a && a.type === "start_plattform");
            return p ? (p.collision ? "coll" : "no-coll") : "none";
        };
        let t = performance.now();
        for (let i = 0; i < 200; i++) {
            const y = +pm.position.y.toFixed(2);
            const surf = r.getTerrainHeightAt ? r.getTerrainHeightAt(pm.position.x, pm.position.z) : null;
            let vy = null;
            try {
                if (s.playerBody) vy = +(s.playerBody.getLinearVelocity().y() * (s.scaleFactor || 1)).toFixed(2);
            } catch (_e) {}
            const grounded = r.isPlayerGrounded ? !!r.isPlayerGrounded() : null;
            rows.push({
                f: i,
                y,
                surf: surf != null && Number.isFinite(surf) ? +surf.toFixed(2) : null,
                vy,
                grounded,
                soft: !!s._softFloorActive,
                lpc: !!s.lastPlayerVoxelChunk,
                bvh: playerChunkBVH(),
                plat: platformReady(),
                chunks: s.voxelChunks ? s.voxelChunks.size : 0,
            });
            t += 16.7;
            try {
                r._gameLoopTick(t);
            } catch (_e) {}
            await new Promise((res) => setTimeout(res, 1));
        }
        return rows;
    });

    console.log("\n===== BOOT-ZEITLEISTE (der erste Lebens-Abschnitt) =====\n");
    console.log(`  Boot bis Loop bereit: ~${ready.navToReady} ms (nav→_gameLoopTick) · interne bootMs ${ready.bootMs}`);
    const first = trace[0];
    console.log(
        `  Spawn: y=${first.y}  terrain=${first.surf}  → ${(first.y - (first.surf ?? 0)).toFixed(1)} m über Grund`
    );
    // Den Frame finden, wo der Spieler zur Ruhe kommt (grounded + |vy|<0.5 + y stabil).
    let settledFrame = -1;
    for (let i = 1; i < trace.length; i++) {
        const rprev = trace[i - 1],
            rr = trace[i];
        if (rr.grounded && Math.abs(rr.vy ?? 9) < 0.5 && Math.abs(rr.y - rprev.y) < 0.05) {
            settledFrame = i;
            break;
        }
    }
    console.log(
        `  GEERDET + ruhig ab Frame ${settledFrame}` +
            (settledFrame >= 0
                ? ` (≈ ${(settledFrame * 16.7).toFixed(0)} ms nach Loop-Start)`
                : " — NIE in 200 Frames!")
    );
    const minY = Math.min(...trace.map((r) => r.y));
    console.log(`  tiefster Punkt: y=${minY}  · Spawn-y=${first.y}  → Fall-Tiefe ${(first.y - minY).toFixed(1)} m`);
    console.log("\n  Frame   y      terrain   vy      grounded soft  lpc  bvh    platform  chunks");
    for (let i = 0; i < trace.length; i++) {
        const r = trace[i];
        if (i < 12 || i % 15 === 0 || i === settledFrame) {
            console.log(
                `  ${String(r.f).padStart(4)}  ${String(r.y).padStart(7)}  ${String(r.surf).padStart(7)}  ${String(r.vy).padStart(7)}  ${String(r.grounded).padStart(6)}  ${String(r.soft).padStart(5)} ${String(r.lpc).padStart(4)}  ${String(r.bvh).padStart(5)}  ${String(r.plat).padStart(7)}  ${String(r.chunks).padStart(5)}`
            );
        }
    }
    console.log("\n========================================================\n");
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();

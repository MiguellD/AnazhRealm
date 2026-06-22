// diag-emotion-time.cjs — die CPU/JS-ZEIT eines Emotions-Welt-Effekts (ergänzt diag-emotion-freeze,
// das die GPU-Recompiles zählt). Ein „kurzer Freeze" kann auch ein SYNCHRONER CPU-Spike sein
// (Partikel-Spawn, Geometrie-Bau, Mesh-Rebuild), den die Recompile-Zählung NICHT sieht. Null-
// Renderer (GPU gestubbt, schnell) → die CPU-Arbeit ist identisch. Wir feuern jeden Effekt MEHRFACH
// und messen die reine JS-Zeit von dslRun + der Folge-Game-Ticks (ohne Render) → ein recurring CPU-
// Spike zeigt sich JEDES Mal; eine einmalige Erst-Last nur beim 1. Mal.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4394;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 120000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 90000;
        while ((!window.anazhRealm || !window.anazhRealm.state || typeof window.anazhRealm._gameLoopTick !== "function" || !window.anazhRealm.state.blueprints) && performance.now() < dl)
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        for (let i = 0; i < 240; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (i % 40 === 0) await new Promise((x) => setTimeout(x, 2)); }
        try { r._drainPendingGrass && r._drainPendingGrass(); r._drainPendingWaterIso && r._drainPendingWaterIso(); } catch (_e) {}
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        // einen Effekt feuern + die reine JS-Zeit messen (dslRun + 6 Folge-Ticks, KEIN Render)
        const fire = (program) => {
            const t0 = performance.now();
            try { r.dslRun(program, { source: "emotion-time" }); } catch (e) { return { err: (e && e.message) || String(e) }; }
            const tDsl = performance.now() - t0;
            const t1 = performance.now();
            for (let i = 0; i < 6; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} }
            const tTicks = performance.now() - t1;
            return { dslMs: +tDsl.toFixed(2), ticks6Ms: +tTicks.toFixed(2) };
        };
        const baselineTick = () => { const t = performance.now(); for (let i = 0; i < 6; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} } return +(performance.now() - t).toFixed(2); };
        const base = [baselineTick(), baselineTick(), baselineTick()];
        const seq = [
            ["skybox_color #f7d358 (1)", ["skybox_color", "#f7d358"]],
            ["skybox_color #f7d358 (2)", ["skybox_color", "#f7d358"]],
            ["skybox_color #d4a3ff (1)", ["skybox_color", "#d4a3ff"]],
            ["weather rainy (1)", ["weather", "rainy"]],
            ["weather sunny (1)", ["weather", "sunny"]],
            ["weather rainy (2)", ["weather", "rainy"]],
            ["weather stormy (1)", ["weather", "stormy"]],
        ];
        const res = [];
        for (const [label, prog] of seq) res.push({ label, ...fire(prog) });
        return { base, res };
    });

    await browser.close();
    server.close();
    console.log("===== EMOTIONS-WELT-EFFEKT: reine CPU/JS-ZEIT (Null-Renderer) =====\n");
    console.log(`  Baseline (6 Game-Ticks, ohne Effekt): ${out.base.join(" / ")} ms\n`);
    for (const o of out.res) {
        if (o.err) { console.log(`  ${o.label.padEnd(28)} FEHLER: ${o.err}`); continue; }
        const total = o.dslMs + o.ticks6Ms;
        const flag = total > 30 ? "  ⚠ CPU-SPIKE" : total > 12 ? "  · spürbar" : "";
        console.log(`  ${o.label.padEnd(28)} dslRun ${String(o.dslMs).padStart(7)} ms + 6 Ticks ${String(o.ticks6Ms).padStart(7)} ms = ${total.toFixed(2)} ms${flag}`);
    }
    console.log("\nLESART: liegt dslRun+Ticks nahe der Baseline → kein CPU-Freeze (die Wurzel ist GPU-Compile,");
    console.log("s. diag-emotion-freeze). Ein hoher Wert JEDES Mal = ein recurring CPU-Spike (Spawn/Bau/Rebuild).");
    process.exit(0);
})().catch((e) => { console.error("Crash:", e); process.exit(1); });

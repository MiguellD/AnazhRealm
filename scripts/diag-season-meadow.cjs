// V6-GATE (Look-Finale) — DIE WIESE FOLGT DER SAISON (Null-Renderer, GPU-frei): Source-Probe, dass
// das Gras-Material (`_grassInstanceMat`) die Saison-Tönungs-Uniform `uSeasonMul` in die Albedo
// faltet, UND dass `_seasonTint(phase)` für die vier Saison-Phasen verschiedene Tönungen liefert
// (Winter ≠ Sommer). Rein — nur die Instanz nötig (kein Welt-Warmup, kein Renderer).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4518;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 120000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const t0 = performance.now();
        while (performance.now() - t0 < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._seasonTint === "function" && typeof r._grassInstanceMat === "function") break;
            await sleep(30);
        }
        const r = window.anazhRealm;
        if (!r || typeof r._seasonTint !== "function") return { err: "keine Instanz / _seasonTint fehlt" };
        // Source-Probe: das Gras-Material liest die Saison-Uniform (der KONSUM-Beweis, kein Passagier).
        const grassSrc = r._grassInstanceMat.toString();
        const readsUniform = grassSrc.indexOf("uSeasonMul") >= 0;
        const phases = { spring: 0.125, summer: 0.375, autumn: 0.625, winter: 0.875 };
        const tints = {};
        for (const [name, ph] of Object.entries(phases)) {
            const c = r._seasonTint(ph);
            tints[name] = { r: c.r, g: c.g, b: c.b };
        }
        return { readsUniform, tints, hasEnsure: typeof r._ensureSeasonUniforms === "function" };
    });
    await browser.close();
    server.close();

    console.log("=== V6 — DIE WIESE FOLGT DER SAISON (_seasonTint + _grassInstanceMat, Null-Renderer) ===");
    if (out.err) { console.log(`\n❌ V6-Season-Gate ROT: ${out.err}`); process.exit(1); }
    for (const [name, c] of Object.entries(out.tints)) {
        console.log(`  ${name.padEnd(7)} uSeasonMul = (${c.r.toFixed(3)}, ${c.g.toFixed(3)}, ${c.b.toFixed(3)})`);
    }
    console.log(`  _grassInstanceMat liest uSeasonMul: ${out.readsUniform} · _ensureSeasonUniforms: ${out.hasEnsure}`);
    const fails = [];
    if (!out.readsUniform) fails.push("_grassInstanceMat.toString() enthält 'uSeasonMul' NICHT — die Wiese liest die Saison-Uniform nicht (Passagier)");
    if (!out.hasEnsure) fails.push("_ensureSeasonUniforms fehlt");
    const dist = (a, b) => Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
    const t = out.tints;
    if (dist(t.winter, t.summer) < 0.1) fails.push(`Winter ≈ Sommer (dist ${dist(t.winter, t.summer).toFixed(3)}) — die Saison färbt die Wiese nicht`);
    if (dist(t.autumn, t.summer) < 0.1) fails.push(`Herbst ≈ Sommer (dist ${dist(t.autumn, t.summer).toFixed(3)})`);
    if (dist(t.spring, t.winter) < 0.05) fails.push(`Frühling ≈ Winter (dist ${dist(t.spring, t.winter).toFixed(3)})`);
    // Sommer ist der neutrale Bezug (≈ 1,1,1 → das Gras-Grün unverändert).
    if (dist(t.summer, { r: 1, g: 1, b: 1 }) > 0.05) fails.push(`Sommer nicht neutral (${JSON.stringify(t.summer)}) — der Sommer-Bezug soll ×1 sein`);

    if (fails.length) { console.log(`\n❌ V6-Season-Gate ROT:\n  - ${fails.join("\n  - ")}`); process.exit(1); }
    console.log(`\n✅ V6-Season-Gate GRÜN — die Wiese liest uSeasonMul, die vier Saison-Tönungen sind verschieden (Winter dist ${dist(t.winter, t.summer).toFixed(2)} zu Sommer), Sommer neutral (×1).`);
})();

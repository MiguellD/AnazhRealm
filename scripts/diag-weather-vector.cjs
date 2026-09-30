// V6-GATE (Look-Finale) — DAS WETTER-5-KANAL-FELD (Null-Renderer, GPU-frei): beweist, dass
// `_weatherFieldFor(w)` die fünf Kanäle {fog,sun,grey,wind,rain} transition-aware liefert und
// dass die LOOK-Invarianten halten: grey entsättigt (stormy≥0.8, sunny==0), wind dramatisiert
// (stormy ≥5× sunny), rain kontinuierlich (sunny 0 · rainy ~0.6 · stormy 1.0), fog monoton über
// die Transition. Rein — keine Welt-Warmup nötig, nur die Instanz.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4517;
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
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const t0 = performance.now();
        while (performance.now() - t0 < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && typeof r._weatherFieldFor === "function") break;
            await sleep(30);
        }
        const r = window.anazhRealm;
        if (!r || typeof r._weatherFieldFor !== "function") return { err: "keine Instanz / _weatherFieldFor fehlt" };
        // Keine laufende Transition — die Wort-Vorgabe führt.
        r.state.weatherTransition = null;
        const sunny = r._weatherFieldFor("sunny");
        const rainy = r._weatherFieldFor("rainy");
        const stormy = r._weatherFieldFor("stormy");
        // Transition-Monotonie: fog steigt von sunny (.15) → stormy (.70) mit progress.
        const fogRamp = [];
        for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
            r.state.weatherTransition = { from: "sunny", to: "stormy", progress: p };
            fogRamp.push(r._weatherFieldFor("sunny").fog);
        }
        r.state.weatherTransition = null;
        return { sunny, rainy, stormy, fogRamp };
    });
    await browser.close();
    server.close();

    console.log("=== V6 — DAS WETTER-5-KANAL-FELD (_weatherFieldFor, Null-Renderer) ===");
    if (out.err) { console.log(`\n❌ V6-Weather-Gate ROT: ${out.err}`); process.exit(1); }
    const CH = ["fog", "sun", "grey", "wind", "rain"];
    console.log(`  sunny : ${JSON.stringify(out.sunny)}`);
    console.log(`  rainy : ${JSON.stringify(out.rainy)}`);
    console.log(`  stormy: ${JSON.stringify(out.stormy)}`);
    console.log(`  fog-Ramp (sunny→stormy, p=0..1): ${out.fogRamp.map((v) => v.toFixed(3)).join(" → ")}`);
    const fails = [];
    for (const w of ["sunny", "rainy", "stormy"]) {
        for (const c of CH) {
            if (typeof out[w][c] !== "number" || !Number.isFinite(out[w][c])) fails.push(`${w}.${c} ist kein finiter Kanal`);
        }
    }
    // grey — entsättigt das Licht (stormy stark, sunny gar nicht).
    if (!(out.stormy.grey >= 0.8)) fails.push(`stormy.grey ${out.stormy.grey} < 0.8 (kein deutliches Entsättigen)`);
    if (out.sunny.grey !== 0) fails.push(`sunny.grey ${out.sunny.grey} != 0 (sunny darf das Licht NICHT entsättigen)`);
    // wind — dramatisiert (stormy ≥ 5× sunny).
    if (!(out.stormy.wind >= 5 * out.sunny.wind)) fails.push(`stormy.wind ${out.stormy.wind} < 5× sunny.wind ${out.sunny.wind}`);
    // rain — kontinuierlich (sunny 0 · rainy ~0.6 · stormy 1.0).
    if (out.sunny.rain !== 0) fails.push(`sunny.rain ${out.sunny.rain} != 0`);
    if (Math.abs(out.rainy.rain - 0.6) > 0.05) fails.push(`rainy.rain ${out.rainy.rain} ≉ 0.6`);
    if (Math.abs(out.stormy.rain - 1.0) > 0.01) fails.push(`stormy.rain ${out.stormy.rain} ≉ 1.0`);
    // Transition-Monotonie (fog steigt streng mit dem Sturm-Anteil).
    for (let i = 1; i < out.fogRamp.length; i++) {
        if (!(out.fogRamp[i] >= out.fogRamp[i - 1])) fails.push(`fog-Ramp nicht monoton bei p-Schritt ${i} (${out.fogRamp[i - 1]} → ${out.fogRamp[i]})`);
    }
    if (!(out.fogRamp[out.fogRamp.length - 1] > out.fogRamp[0])) fails.push(`fog-Ramp steigt gar nicht (${out.fogRamp[0]} → ${out.fogRamp[out.fogRamp.length - 1]})`);

    if (fails.length) { console.log(`\n❌ V6-Weather-Gate ROT:\n  - ${fails.join("\n  - ")}`); process.exit(1); }
    console.log(`\n✅ V6-Weather-Gate GRÜN — 5 Kanäle finit, grey entsättigt (stormy ${out.stormy.grey}, sunny 0), wind stormy ${out.stormy.wind} ≥ 5× sunny ${out.sunny.wind}, rain kontinuierlich (0/${out.rainy.rain}/${out.stormy.rain}), fog transition-monoton.`);
})();

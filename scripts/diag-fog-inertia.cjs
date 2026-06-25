// Diagnose — DIE NEBEL-TRÄGHEIT (V18.350, Schöpfer „echter Nebel stürmt nicht nach hinten und vorne,
// das muss langsam, gefühlvoll geschehen"). HARDWARE-UNABHÄNGIG (reine Smoothing-Mathe, kein Render):
//   (1) die Kante überschreitet NIE maxStep/Frame (kein „Sturm" selbst bei großem Ring-Sprung);
//   (2) sie KONTRAHIERT langsamer als sie EXPANDIERT (asymmetrisch — kein Einwärts-Lurchen);
//   (3) sie konvergiert MONOTON aufs Ziel (kein Überschwingen/Oszillieren);
//   (4) bei JITTER (revealK schwingt 100↔112) bleibt die Kante ruhig (folgt nicht der vollen Schwingung).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4410;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
        protocolTimeout: 120000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 30000) {
            if (window.anazhRealm && typeof window.anazhRealm._smoothFogEdge === "function") break;
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const E = r.constructor.FOG_EDGE;
        const run = (prev, target, n) => {
            const steps = [];
            for (let i = 0; i < n; i++) {
                const next = r._smoothFogEdge(prev, target);
                steps.push(next - prev);
                prev = next;
            }
            return { final: prev, steps };
        };
        const out = { maxStep: E.maxStep, expandRate: E.expandRate, contractRate: E.contractRate };
        // EXPAND: 14 → 250 (großer Ring-Sprung).
        const ex = run(14, 250, 120);
        out.expandMaxStep = Math.max(...ex.steps.map(Math.abs));
        out.expandMonotone = ex.steps.every((s) => s >= -1e-9); // nie rückwärts beim Expandieren
        out.expandFinal = ex.final;
        out.expandFirstStep = ex.steps[0];
        // CONTRACT: 250 → 30 (bewusst LANGSAM → mehr Frames bis zur Konvergenz = Trägheit).
        const co = run(250, 30, 400);
        out.contractMaxStep = Math.max(...co.steps.map(Math.abs));
        out.contractMonotone = co.steps.every((s) => s <= 1e-9); // nie vorwärts beim Kontrahieren
        out.contractFinal = co.final;
        out.contractFirstStep = co.steps[0];
        // ASYMMETRIE: gleicher Delta-Betrag (50, UNGEDECKELT) → Kontraktion langsamer als Expansion.
        out.expandStepFor50 = r._smoothFogEdge(0, 50) - 0; // +Δ → 50·expandRate
        out.contractStepFor50 = 50 - r._smoothFogEdge(50, 0); // |−Δ| → 50·contractRate
        // JITTER: Ziel schwingt 100↔112; nach Einschwingen bleibt die Kante in einer engen Spanne.
        let prev = 106;
        const tail = [];
        for (let i = 0; i < 80; i++) {
            prev = r._smoothFogEdge(prev, i % 2 === 0 ? 100 : 112);
            if (i >= 60) tail.push(prev);
        }
        out.jitterSpan = Math.max(...tail) - Math.min(...tail);
        return out;
    });

    console.log("\n===== DIE NEBEL-TRÄGHEIT — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  FOG_EDGE: maxStep=${o.maxStep} · expandRate=${o.expandRate} · contractRate=${o.contractRate}`);
    console.log(
        `  EXPAND 14→250: maxStep/Frame ${o.expandMaxStep.toFixed(2)} (≤ ${o.maxStep}) · monoton ${o.expandMonotone} · final ${o.expandFinal.toFixed(1)}`
    );
    console.log(
        `  CONTRACT 250→30: maxStep/Frame ${o.contractMaxStep.toFixed(2)} (≤ ${o.maxStep}) · monoton ${o.contractMonotone} · final ${o.contractFinal.toFixed(1)}`
    );
    console.log(
        `  ASYMMETRIE (|Δ|=50): expand ${o.expandStepFor50.toFixed(2)} m/Frame vs contract ${o.contractStepFor50.toFixed(2)} m/Frame (contract langsamer)`
    );
    console.log(
        `  JITTER 100↔112: eingeschwungene Spanne ${o.jitterSpan.toFixed(2)} m (eng = ruhig, kein Vor/Zurück-Sturm)`
    );

    const ok =
        !pageErr &&
        o.expandMaxStep <= o.maxStep + 1e-6 &&
        o.contractMaxStep <= o.maxStep + 1e-6 &&
        o.expandMonotone === true &&
        o.contractMonotone === true &&
        Math.abs(o.expandFinal - 250) < 2.0 && // sanfter Annäherungs-Schwanz (Trägheit) → grössere Toleranz
        Math.abs(o.contractFinal - 30) < 2.0 && // langsamer Kontraktions-Schwanz (Trägheit) → grössere Toleranz
        o.contractStepFor50 < o.expandStepFor50 && // asymmetrisch: kontrahiert langsamer
        o.jitterSpan < 12; // bei 12-m-Ziel-Schwingung bleibt die Kante deutlich enger (gedämpft)
    console.log(
        `\n  ${ok ? "✅ Die Nebel-Kante driftet träge: pro Frame gedeckelt, asymmetrisch (kaum Rückzug), monoton konvergent, jitter-gedämpft." : "⚠️ Die Trägheits-Mathe weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

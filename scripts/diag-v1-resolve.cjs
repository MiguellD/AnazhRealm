// V1-GATE — DAS KRISTALL-KLEID (Null-Renderer, GPU-frei, immun gegen swiftshader-Tod): beweist, dass
// `_foundryPresetForEntry` die Formations-VARIANTEN (kristall_var${N}/fels_var${N}) auf ein Studio-
// Rezept auflöst (vorher NULL = Part-Pfad → die „alten Kristalle") — die Fels-Vielfalt bleibt (jede
// Form-Klasse ihr Studio-Rezept), glutbrunnen bleibt BEWUSST Part-Look (Schöpfer-Entscheid). Reine
// CPU-Logik, kein Rendern. Selbst-assertierend: falsche Auflösung → exit 1.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4509;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
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
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.blueprints && Object.keys(r.state.blueprints).length > 20) break; }
            await sleep(8);
        }
        const r = window.anazhRealm;
        const bp = r.state.blueprints || {};
        const resolve = (t) => (r._foundryPresetForEntry ? r._foundryPresetForEntry({ type: t }) : "nomethod");
        const res = {};
        for (const t of ["kristall_var0", "kristall_var7", "fels_var0", "fels_var5", "fels_var7", "glut_var0", "glut_var3", "kristall_geode", "felsturm", "stein_block"]) {
            res[t] = { exists: !!bp[t], formClass: bp[t] && bp[t]._formClass, preset: resolve(t) };
        }
        // V2 — WERKSTATT: der Rezept-Regler klassifiziert die Repräsentanten (Karte je Art) korrekt +
        // der `_var0`-Suffix löst über `_foundryPresetForEntry` auf → die Vorschau zeigt das Studio-Asset.
        res._workshop = {
            felsKind: r._workshopRecipeKind ? r._workshopRecipeKind(bp["fels_var0"]) : "nomethod",
            kristallKind: r._workshopRecipeKind ? r._workshopRecipeKind(bp["kristall_var0"]) : "nomethod",
        };
        return res;
    });
    await browser.close(); server.close();

    console.log("=== V1 — DAS KRISTALL-KLEID: Formations-Varianten -> Studio-Preset ===");
    const fails = [];
    const check = (t, pred, why) => {
        const r = out[t] || {};
        const ok = pred(r);
        console.log(`  ${ok ? "✅" : "❌"} ${t.padEnd(15)} formClass=${String(r.formClass).padEnd(8)} -> ${r.preset}  ${ok ? "" : "(" + why + ")"}`);
        if (!ok) fails.push(t);
    };
    // Kristall-Varianten: IMMER auf das EINE Studio-Kristall-Rezept.
    check("kristall_var0", (r) => r.preset === "kristalle", "erwartet kristalle");
    check("kristall_var7", (r) => r.preset === "kristalle", "erwartet kristalle");
    // Fels-Varianten: nach Form-Klasse auf EIN Studio-Fels-Rezept (nie NULL = Part-Pfad).
    check("fels_var0", (r) => r.preset && r.preset !== "null", "erwartet nicht-null Fels-Rezept");
    check("fels_var5", (r) => r.preset && r.preset !== "null", "erwartet nicht-null Fels-Rezept");
    check("fels_var7", (r) => r.preset && r.preset !== "null", "erwartet nicht-null Fels-Rezept");
    // Glut bleibt BEWUSST Part-Look (Schöpfer-Entscheid „glutbrunnen bleibt noch").
    check("glut_var0", (r) => r.preset == null, "glut MUSS Part-Look bleiben (null)");
    check("glut_var3", (r) => r.preset == null, "glut MUSS Part-Look bleiben (null)");
    // Kontroll-Referenz: die benannten Arten bleiben UNVERÄNDERT.
    check("kristall_geode", (r) => r.preset === "kristalle", "Regression");
    check("felsturm", (r) => r.preset === "zacken", "Regression");
    check("stein_block", (r) => r.preset === "basalt", "Regression");

    // V2 — WERKSTATT: der Rezept-Regler erkennt die Repräsentanten (Karte je Art).
    console.log("--- V2 Werkstatt: Rezept-Kind der Formations-Repräsentanten ---");
    const ws = out._workshop || {};
    const wcheck = (label, got, want) => {
        const ok = got === want;
        console.log(`  ${ok ? "✅" : "❌"} ${label.padEnd(15)} -> ${got}  ${ok ? "" : "(erwartet " + want + ")"}`);
        if (!ok) fails.push(label);
    };
    wcheck("fels_var0 kind", ws.felsKind, "rock");
    wcheck("kristall_var0 kind", ws.kristallKind, "crystal");

    if (fails.length) { console.log(`\n❌ Gate ROT: ${fails.join(", ")}`); process.exit(1); }
    console.log("\n✅ Gate GRÜN — V1: jede Fels/Kristall-Variante trägt ihr Studio-Rezept (glut Part-Look); V2: der Werkstatt-Rezept-Regler erkennt die Repräsentanten.");
})();

// V1-GATE — DAS KRISTALL-KLEID (Null-Renderer, GPU-frei, immun gegen swiftshader-Tod): beweist, dass
// `_foundryPresetForEntry` die Formations-VARIANTEN (kristall_var${N}/fels_var${N}) auf ein Studio-
// Rezept auflöst (vorher NULL = Part-Pfad → die „alten Kristalle") — die Fels-Vielfalt bleibt (jede
// Form-Klasse ihr Studio-Rezept). Die AUSSTATTUNG (Architektur-Welle 05.10.): glutbrunnen · marktstand_dorf ·
// brunnen_dorf lösen über ihre studioGestalt-Zeile auf das Gesetzbuch der Architektur auf (feuerstelle · marktstand ·
// brunnen); die sechs Glut-Formationen sind gefallen, ihr Umzug trägt alte Welten auf glutbrunnen. Reine CPU-Logik,
// kein Rendern. Selbst-assertierend: falsche Auflösung → exit 1.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.V1_RESOLVE_PORT || 4509);
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
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
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
        // die Ausstattung löst über das LIVE-Buch auf (studioGestalt): warten, bis das Gesetzbuch der Architektur da ist
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const b0 = performance.now();
        while (performance.now() - b0 < 60000 && !(f && f.ready && f.recipes && f.recipes.feuerstelle)) await sleep(100);
        const bp = r.state.blueprints || {};
        const resolve = (t) => (r._foundryPresetForEntry ? r._foundryPresetForEntry({ type: t }) : "nomethod");
        const res = {};
        for (const t of ["kristall_var0", "kristall_var7", "fels_var0", "fels_var5", "fels_var7", "glut_var0", "glutbrunnen", "marktstand_dorf", "brunnen_dorf", "kristall_geode", "felsturm", "stein_block"]) {
            res[t] = { exists: !!bp[t], formClass: bp[t] && bp[t]._formClass, preset: resolve(t) };
        }
        res._umzug = r.constructor.BAUPLAN_UMZUG ? r.constructor.BAUPLAN_UMZUG.glut_var3 : null;
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
    // Die Ausstattung trägt das Gesetzbuch (studioGestalt → LIVE-Buch); das Glut-Genom ist gefallen (kein glut_var-Bauplan),
    // sein Umzug führt alte Welten auf die EINE Feuerstelle.
    check("glutbrunnen", (r) => r.preset === "feuerstelle", "erwartet feuerstelle (Gesetzbuch)");
    check("marktstand_dorf", (r) => r.preset === "marktstand", "erwartet marktstand (Gesetzbuch)");
    check("brunnen_dorf", (r) => r.preset === "brunnen", "erwartet brunnen (Gesetzbuch)");
    check("glut_var0", (r) => r.exists === false, "das Glut-Genom ist gefallen");
    {
        const ok = out._umzug === "glutbrunnen";
        console.log(`  ${ok ? "✅" : "❌"} Umzug glut_var3 -> ${out._umzug}`);
        if (!ok) fails.push("umzug");
    }
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
    console.log("\n✅ Gate GRÜN — V1: jede Fels/Kristall-Variante trägt ihr Studio-Rezept, die Ausstattung ihr Gesetzbuch; V2: der Werkstatt-Rezept-Regler erkennt die Repräsentanten.");
})();

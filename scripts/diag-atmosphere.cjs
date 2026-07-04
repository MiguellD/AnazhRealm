// DIE ATMOSPHÄRE-LINSE (V18.390, Eins W1 — GPU-frei, MECHANIK braucht eine ZAHL):
// beweist das Rayleigh-Atmosphäre-Gesetz (`_atmosphere(e)`, Port Vorlage phytogenesis.js
// Z.2111) als EINE Licht-Quelle + das neue Licht-Rig (Key hoch · Ambient fast null ·
// Hemi halbiert · grünes Bounce-Fill). Die Erfolgs-Zahl des eins-plan §3 (Welle 1):
// dir/(amb+hemi) war 0.83:1 (Füll-Wash = „flache Masse") → jetzt ≥3:1 tags, ≥1.5:1 nachts.
//   (1) _atmosphere(1).lum ∈ [0.88, 0.94]           (Zenit: m=0.943 → lum≈0.913)
//   (2) _atmosphere(0.05) rot-verschoben (col.b klein, col.r max)  (Sonnenuntergang aus Physik)
//   (3) _atmosphere(-0.2) == MOONLIGHT-Hue, lum == 0.06            (Purkinje-Mond)
//   (4) Rig tags   (tod=0.5): dl/(amb+hemi) ≥ 3
//   (5) Rig nachts (tod=0.0): dl/(amb+hemi) ≥ 1.5   (der Mond dominiert = Form)
//   (6) fillLight: grün, gerichtet, folgt atm.lum (tags an, nachts ~aus)
// Ausgabe: „ATMOSPHAERE OK" + exit 0, sonst ❌-Liste + exit 1.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4421;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    // GPU-frei (V18.347-Lehre): der Mechanik-Gate braucht kein Pixel — kein swiftshader-Prozess.
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    // Der Null-Renderer (die Playtest-Bahn): kein GPU-Kontext, kein swiftshader —
    // die Licht-Objekte + Tag-Nacht-Mathematik sind reine CPU (MECHANIK = ZAHL).
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false; const start = performance.now(); let n = 0;
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (++n > 60 && r.state.directionalLight && r.state.fillLight) break; }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const probe = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const K = r.constructor;
        // Deterministisch: neutrales Wetter, keine Emotion/Aura-Tints.
        s.weather = "sunny";
        s.weatherTransition = null;
        if (s.player && s.player.emotions) for (const k of Object.keys(s.player.emotions)) s.player.emotions[k] = 0;
        if (s.emotionField && s.emotionField.clear) s.emotionField.clear();
        const out = { atm: {}, rig: {} };
        // (1)-(3) das reine Gesetz
        const a1 = r._atmosphere(1);
        const a005 = r._atmosphere(0.05);
        const aM = r._atmosphere(-0.2);
        const M = K.MOONLIGHT;
        out.atm.zenit = { lum: a1.lum, col: a1.col };
        out.atm.horizont = { lum: a005.lum, col: a005.col };
        out.atm.mond = { lum: aM.lum, col: aM.col, hue: { r: M.r, g: M.g, b: M.b } };
        // (4)-(6) das Rig, live gerechnet
        for (const [key, tod] of [["tag", 0.5], ["nacht", 0.0]]) {
            r.setTimeOfDay(tod);
            for (let i = 0; i < 8; i++) r._gameLoopTick(performance.now());
            const dl = s.directionalLight, al = s.ambientLight, hl = s.hemiLight, fl = s.fillLight;
            out.rig[key] = {
                dir: dl ? +dl.intensity.toFixed(4) : -1,
                amb: al ? +al.intensity.toFixed(4) : -1,
                hemi: hl ? +hl.intensity.toFixed(4) : -1,
                ratio: dl && al && hl ? +(dl.intensity / Math.max(1e-6, al.intensity + hl.intensity)).toFixed(3) : -1,
                dlColor: dl ? { r: +dl.color.r.toFixed(3), g: +dl.color.g.toFixed(3), b: +dl.color.b.toFixed(3) } : null,
                fill: fl ? { int: +fl.intensity.toFixed(4), r: +fl.color.r.toFixed(3), g: +fl.color.g.toFixed(3), b: +fl.color.b.toFixed(3), noShadow: fl.castShadow === false, targeted: !!fl.target && fl.target.parent === s.scene } : null,
            };
        }
        r.setTimeOfDay(0.5); // sauber zurück auf Mittag
        return out;
    });
    console.log(JSON.stringify(probe, null, 1));
    const ok = [];
    const bad = [];
    const t = (cond, label) => (cond ? ok : bad).push(label);
    const A = probe.atm;
    t(A.zenit.lum >= 0.88 && A.zenit.lum <= 0.94, `Zenit: lum ${A.zenit.lum.toFixed(4)} ∈ [0.88, 0.94]`);
    t(A.horizont.col.b < 0.25 && A.horizont.col.r > 0.95, `Horizont e=0.05: rot-verschoben (r=${A.horizont.col.r.toFixed(3)}, b=${A.horizont.col.b.toFixed(3)} < 0.25)`);
    t(
        Math.abs(A.mond.col.r - A.mond.hue.r) < 1e-9 && Math.abs(A.mond.col.g - A.mond.hue.g) < 1e-9 && Math.abs(A.mond.col.b - A.mond.hue.b) < 1e-9,
        "Nacht e=-0.2: col == MOONLIGHT-Hue (Purkinje, exakt)"
    );
    t(Math.abs(A.mond.lum - 0.06) < 1e-9, `Nacht e=-0.2: lum == 0.06 (${A.mond.lum})`);
    const D = probe.rig.tag, N = probe.rig.nacht;
    t(D.ratio >= 3, `Rig TAG: dir/(amb+hemi) = ${D.dir}/(${D.amb}+${D.hemi}) = ${D.ratio} ≥ 3`);
    t(N.ratio >= 1.5, `Rig NACHT: dir/(amb+hemi) = ${N.dir}/(${N.amb}+${N.hemi}) = ${N.ratio} ≥ 1.5`);
    t(N.dlColor && N.dlColor.b > N.dlColor.r, "Rig NACHT: Mond-Licht kühl (b > r — die diag-night-probe-Wand hält)");
    t(D.fill && D.fill.g > D.fill.r && D.fill.g > D.fill.b, "Fill TAG: GRÜN (g > r, g > b — Laub-Bounce)");
    t(D.fill && D.fill.int > 0.3, `Fill TAG: an (int ${D.fill && D.fill.int} > 0.3)`);
    t(N.fill && N.fill.int < 0.1, `Fill NACHT: folgt atm.lum auf ~0 (int ${N.fill && N.fill.int} < 0.1)`);
    t(D.fill && D.fill.noShadow && D.fill.targeted, "Fill: schattenfrei + Target im Szenengraph");
    for (const o of ok) console.log("  ✅ " + o);
    for (const b of bad) console.log("  ❌ " + b);
    await browser.close();
    await new Promise((r) => server.close(r));
    if (bad.length) { console.log("⛔ ATMOSPHAERE VERLETZT"); process.exit(1); }
    console.log("ATMOSPHAERE OK");
    process.exit(0);
})();

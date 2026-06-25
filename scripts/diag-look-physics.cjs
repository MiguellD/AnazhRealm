#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-look-physics.cjs — DER LOOK GEGEN DIE REALITÄT GEMESSEN (npm run look-lens)
//
// DER RISS (Schöpfer-Frage 25.06.): „wir nähern den Look der Realität an, die
// Realität kann man messen — wieso also hängt der Look von MIR ab?" Die ehrliche
// Antwort: das Gate misst MECHANIK, nicht den Perzept. ABER — für die Teile des
// Looks, die REALITÄT SIND (Licht · Farbe · Atmosphäre-Physik), gibt es eine
// publizierte Wahrheit, gegen die man headless assertieren kann. KEINE GPU nötig,
// kein Schöpfer-Auge — eine ZAHL gegen die gemessene Welt.
//
// Diese Linse prüft die CPU-lesbaren Look-KONSTANTEN gegen reale physikalische
// Bereiche. Der gerenderte Perzept (SSIM gegen ein Golden) lebt in
// diag-look-golden.cjs; das subjektive „ist diese Kunst schön" bleibt der kleine
// menschliche Rest — nicht der Default.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4319;
const root = path.resolve(__dirname, "..");
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

// sRGB → lineare relative Luminanz (BT.709 / CIE Y) — die Standard-Farbwissenschaft.
function relLuminance([r, g, b]) {
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let boot = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        // auf den Loop warten (Welt bereit), dann die Konstanten + Live-Renderer lesen.
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        boot = await page.evaluate(() => {
            const r = window.anazhRealm;
            const K = r.constructor;
            const T = window.THREE || {};
            const rend = r.state && r.state.renderer;
            return {
                meadow: K.MEADOW_GREEN,
                tints: K.WEATHER_TINTS,
                intensity: K.WEATHER_INTENSITY,
                fogEdge: K.FOG_EDGE,
                toneMapping: rend ? rend.toneMapping : null,
                acesConst: T.ACESFilmicToneMapping != null ? T.ACESFilmicToneMapping : null,
                exposure: rend ? rend.toneMappingExposure : null,
                colorMgmt: T.ColorManagement ? !!T.ColorManagement.enabled : null,
            };
        });
    } catch (e) {
        boot = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!boot || boot.__err) {
        console.log(`⛔ Boot/Read fehlgeschlagen: ${boot ? boot.__err : "kein Ergebnis"}`);
        process.exit(2);
    }

    const checks = [];
    const ok = (name, pass, detail) => checks.push({ name, pass: !!pass, detail });

    // 1) GRAS-ALBEDO gegen die gemessene Vegetations-Albedo (~0,15–0,30; grün-dominant).
    //    Erde-Oberflächen-Albedo-Tabellen: Gras/Vegetation 0,15–0,30, grün-dominant.
    if (Array.isArray(boot.meadow) && boot.meadow.length === 3) {
        const [r, g, b] = boot.meadow;
        const lum = relLuminance(boot.meadow);
        ok(
            "Gras-Albedo grün-dominant + im Real-Bereich",
            g > r && g > b && lum > 0.08 && lum < 0.55,
            `MEADOW_GREEN=[${boot.meadow}] · lum(linear)=${lum.toFixed(3)} (real Vegetation ~0,15–0,30; grün>rot>blau: ${g > r && r > b})`
        );
    } else ok("Gras-Albedo lesbar", false, "MEADOW_GREEN fehlt");

    // 2) WOLKEN DÄMPFEN DAS LICHT (physikalisch): bedeckter Himmel reduziert die
    //    Oberflächen-Bestrahlung → lightMul/skyMul müssen sunny > rainy > stormy sein.
    const t = boot.tints;
    if (t && t.sunny && t.rainy && t.stormy) {
        const lightOrder = t.sunny.lightMul > t.rainy.lightMul && t.rainy.lightMul > t.stormy.lightMul;
        const skyOrder = t.sunny.skyMul > t.rainy.skyMul && t.rainy.skyMul > t.stormy.skyMul;
        ok(
            "Wetter dimmt Licht monoton (sunny>rainy>stormy)",
            lightOrder && skyOrder,
            `lightMul ${t.sunny.lightMul}/${t.rainy.lightMul}/${t.stormy.lightMul} · skyMul ${t.sunny.skyMul}/${t.rainy.skyMul}/${t.stormy.skyMul}`
        );
    } else ok("Wetter-Tints lesbar", false, "WEATHER_TINTS fehlt");

    // 3) WETTER-INTENSITÄT monoton (eine physikalische Achse, kein Binär-Paar).
    const wi = boot.intensity;
    if (wi) {
        ok(
            "Wetter-Intensität monoton (0 < rainy < stormy)",
            wi.sunny < wi.rainy && wi.rainy < wi.stormy,
            `sunny=${wi.sunny} rainy=${wi.rainy} stormy=${wi.stormy}`
        );
    } else ok("Wetter-Intensität lesbar", false, "WEATHER_INTENSITY fehlt");

    // 4) NEBEL-TRÄGHEIT (V18.350-Physik): echter Nebel weitet sanft, zieht kaum
    //    einwärts → expandRate > contractRate, und der Schritt ist gedeckelt (>0).
    const f = boot.fogEdge;
    if (f) {
        ok(
            "Nebel-Kante träge + asymmetrisch (expand > contract, maxStep gedeckelt)",
            f.expandRate > f.contractRate && f.maxStep > 0 && f.contractRate > 0,
            `expand=${f.expandRate} contract=${f.contractRate} maxStep=${f.maxStep}`
        );
    } else ok("FOG_EDGE lesbar", false, "FOG_EDGE fehlt");

    // 5) HDR-TONE-MAPPING: reale Kameras/das Auge rollen Highlights filmisch ab
    //    (kein hartes Klemmen bei 1,0). ACES-Filmic + sane Exposure.
    if (boot.acesConst != null) {
        ok(
            "HDR-Tone-Mapping (ACES-Filmic, sane Exposure)",
            boot.toneMapping === boot.acesConst && boot.exposure > 0.5 && boot.exposure < 2.0,
            `toneMapping=${boot.toneMapping} (ACES=${boot.acesConst}) · exposure=${boot.exposure}`
        );
    } else ok("Tone-Mapping lesbar", false, "THREE.ACESFilmicToneMapping fehlt");

    // 6) LINEARE LICHT-MATHE: Lighting in linearem Raum (sRGB-Transfer korrekt
    //    angewandt) — die Grundlage jeder physikalisch plausiblen Farbe.
    ok(
        "Farb-Management linear (sRGB-korrekt)",
        boot.colorMgmt === true,
        `THREE.ColorManagement.enabled=${boot.colorMgmt}`
    );

    console.log("\n=== Look-Physik-Linse (der Look gegen die gemessene Realität) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        console.log(`       ${c.detail}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Look-Physik-Invarianten gegen die Realität OK.`);
    if (fails) {
        console.log("⛔ Eine Look-Konstante driftet aus dem real-physikalischen Bereich — heilen.");
        process.exit(1);
    }
    console.log("✅ Der messbare Look steht im Einklang mit der Realität.");
    process.exit(0);
})();

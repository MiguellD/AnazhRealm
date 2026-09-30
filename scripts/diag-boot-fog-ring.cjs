// diag-boot-fog-ring.cjs — V18.411-BEWEIS: der RAMP-REVEAL-SPALT ist geschlossen.
// Beim Ein-Chunk-Boot (RING_RAMP_START=0, Schöpfer „1 Chunk statt 9") ist der aktive Ring 0
// und die gebaute Front 0 → `revealK == vCfg.ringRadius == 0`. Vor dem Fix griff KEINE der beiden
// Reveal-Klammern (`revealK<0` Kokon, `revealK<ringRadius` gebaute Kante) → der Nebel sprang auf
// den vollen Ziel-Rand (4.3-km-Mantel) über die noch UNGEBAUTE Leere = der ferne Sichtring, den
// der Schöpfer sah. Der Fix: solange die Welt zum Ziel-Ring RAMPT (`activeRing < targetRing`),
// kappt der Nebel IMMER auf die gebaute Kante — egal ob der aktive Ring voll steht.
//
// Die Linse ist hardware-unabhängig (Null-Renderer): sie treibt die exakte Boot-Ramp-STATE
// (activeRing 0 · target 4 · Fronten 0 = ein Chunk gebaut) direkt in die EINE Reveal-Quelle
// (`_applyDayNightToScene` → `_dayNightApplyHemiAndFog`) und liest `fog.far`.
//   node scripts/diag-boot-fog-ring.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.BOOTFOG_PORT || 4593);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // N7.4 — BEGRÜNDETER Hook (vorher unbegründet): die Linse prüft die REVEAL-KLAMMER-
        // Logik (welche Kappe greift), nicht den Look. Foundry-an würde der async andockende
        // Studio-Sicht-Config (`_sightDist` überstimmt die Alt-Formel) ein Timing-Race in die
        // Szenario-C-Baseline (796 m Alt-Welt-Weitblick) tragen — der Hook hält die Formel
        // deterministisch; die Klammer-Mechanik selbst ist regime-unabhängig (Fronten gestubbt).
        window.__anazhGateNoFoundry = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.fog ||
                typeof window.anazhRealm._applyDayNightToScene !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });

    const S = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {};
        // Eine feste Tageszeit (Mittag) → deterministische Sonne, keine Nacht-Zweige.
        r.state.timeOfDay = 0.5;
        r.state.weather = "clear";
        // Der Ziel-Ring (User-Sicht-Regler) = 4. (N7.4: der Horizont-Mantel ist geschnitten —
        // der alte Mantel-Stub hier war toter Ballast, der Nebel liest den Mantel nirgends.)
        r.state.chunkRingRadius = 4;

        // Die Nebel-KANTE führt `_smoothFogEdge` träge nach (max 4 m/Schritt — die V18.350-Inertia,
        // eine SEPARATE, eigen-getestete Sache: diag-fog-inertia). Für die REVEAL-ENTSCHEIDUNG (welche
        // Klammer greift) stubben wir den Glätter auf Identität → wir lesen das ROHE Ziel, nicht den
        // langsamen Anmarsch. Der Regelkreis selbst (die Trägheit) ist damit nicht das, was wir hier prüfen.
        r["_smoothFogEdge"] = (_prev, target) => target;
        const span = r._voxelChunkConfig(0).span; // 43.2
        const measure = () => {
            r._applyDayNightToScene();
            return r.state.fog ? r.state.fog.far : null;
        };
        // Die drei Ring-Fronten fixieren (ein Chunk gebaut = Front 0). Der Reveal liest sie über
        // min(builtK, grassK, waterK).
        const stub = (k) => {
            r["_builtRingRadius"] = () => k;
            r["_builtGrassRingRadius"] = () => k;
            r["_builtWaterRingRadius"] = () => k;
        };

        // SZENARIO A — DER EIN-CHUNK-BOOT (die Wurzel): activeRing 0, target 4, Fronten 0.
        // `revealK == vCfg.ringRadius == 0` → der alte Spalt. Der Nebel MUSS die gebaute Kante
        // kappen (~46 m), NICHT auf den Mantel (4300 m) springen.
        r.state._activeRingRadius = 0;
        stub(0);
        out.rampRingRadius = r._voxelChunkConfig().ringRadius; // erwartet 0
        out.fogFarRamp0 = measure();

        // SZENARIO B — der aktive Ring wächst auf 2 (immer noch < Ziel 4), Fronten ziehen mit.
        r.state._activeRingRadius = 2;
        stub(2);
        out.fogFarRamp2 = measure();

        // SZENARIO C — DIE WELT AM ZIEL (activeRing == target == 4, voll gebaut): STUDIO-MODELL
        // (Schöpfer „voll kippen"): der Nebel schliesst an der WALD-KANTE (Ring-/foliageRadius-
        // Kante ~194 m), NICHT am 4.3-km-Mantel. Man sieht die dichte Krause bis zum Rand, dann
        // Nebel — nie die baumlose Makro-Wiese (die „ferne Kulisse"). Die Sicht wächst zur vollen
        // Wald-Kante (klemmt nicht klein), öffnet aber NICHT jenseits davon (Regress-Wand).
        r.state._activeRingRadius = 4;
        stub(4);
        out.fogFarSettled = measure();

        // SZENARIO D — DAS ERWACHEN (noch KEIN Chunk, Front -1): der 14-m-Kokon bleibt.
        r.state._activeRingRadius = 0;
        stub(-1);
        out.fogFarAwaken = measure();
        return out;
    });

    await browser.close();
    server.close();

    console.log("=== V18.411 — DER RAMP-REVEAL-SPALT (der ferne Sichtring beim Ein-Chunk-Boot) ===");
    console.log(`  aktiver Ring beim Boot (erwartet 0): ${S.rampRingRadius}`);
    console.log(`  A  Ein-Chunk-Boot (activeRing 0, Front 0):   fog.far = ${fmt(S.fogFarRamp0)} m`);
    console.log(`  B  Ramp activeRing 2 (< Ziel 4, Front 2):    fog.far = ${fmt(S.fogFarRamp2)} m`);
    console.log(`  C  am Ziel (activeRing 4 == Ziel, voll):     fog.far = ${fmt(S.fogFarSettled)} m`);
    console.log(`  D  Erwachen (kein Chunk, Front -1, Kokon):   fog.far = ${fmt(S.fogFarAwaken)} m`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    function fmt(v) {
        return v == null ? "null" : Number(v).toFixed(1);
    }
    const errs = [];
    // A — die WURZEL: der ferne Sichtring ist zu. Die gebaute Kante liegt bei ~46 m
    // ((0+0.5)·43.2+18 = 39.6 → floor 46). OHNE den Fix läge A bei der vollen Sicht-Basis (~120–150 m),
    // weil die else-Klammer den Nebel auf visualEdgeTarget öffnete → großzügige Wand ≤ 60 m.
    if (!(S.fogFarRamp0 != null && S.fogFarRamp0 <= 60))
        errs.push(
            `A: der Ein-Chunk-Boot öffnete den Nebel auf ${fmt(S.fogFarRamp0)} m (> 60) — der ferne Sichtring lebt`
        );
    // B — die Kante weitet mit dem wachsenden Ring (größer als der Ein-Chunk-Boot).
    if (!(S.fogFarRamp2 != null && S.fogFarRamp2 > S.fogFarRamp0))
        errs.push(`B: die Ramp-Kante wuchs nicht mit dem Ring (${fmt(S.fogFarRamp0)} → ${fmt(S.fogFarRamp2)} m)`);
    // C — STUDIO-MODELL (Schöpfer „voll kippen"): am Ziel schliesst der Nebel an der WALD-KANTE
    // (Ring-Kante ~194 m bei Ring 4), NICHT am 4.3-km-Mantel/748-m-Weitblick. ZWEI Wände: (C1) die Sicht
    // klemmt NICHT auf die Boot-Kante (wächst zur vollen Wald-Kante), (C2) sie öffnet NICHT JENSEITS der
    // Wald-Kante in die ferne Kulisse. Eine Regression, die den Mantel wieder freigibt, wird hier ROT.
    const _ringEdge4 = (4 + 0.5) * 43.2; // die gebaute Ring-Kante bei Ziel-Ring 4 = die Wald-Kante
    if (!(S.fogFarSettled != null && S.fogFarSettled > S.fogFarRamp2))
        errs.push(
            `C1: die Sicht wuchs am Ziel nicht zur vollen Wald-Kante (${fmt(S.fogFarRamp2)} → ${fmt(S.fogFarSettled)} m)`
        );
    if (!(S.fogFarSettled != null && S.fogFarSettled <= _ringEdge4 + 60))
        errs.push(
            `C2: der Nebel öffnete JENSEITS der Wald-Kante auf ${fmt(S.fogFarSettled)} m (> ${fmt(_ringEdge4 + 60)}) — die ferne Kulisse/der Mantel-Weitblick lebt wieder`
        );
    // D — der Kokon bleibt eng (≤ ~20 m, AWAKEN_FOG_FAR=14).
    if (!(S.fogFarAwaken != null && S.fogFarAwaken <= 20))
        errs.push(`D: der Erwachen-Kokon ist nicht eng (${fmt(S.fogFarAwaken)} m > 20)`);

    if (errs.length) {
        console.error("\n❌ ROT:");
        for (const e of errs) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN (STUDIO-MODELL) — der Nebel kappt beim Boot auf die gebaute Kante, weitet mit dem Ring und schliesst am Ziel an der WALD-KANTE (~194 m), NICHT am 4.3-km-Mantel — man sieht nie über den Wald in die ferne Kulisse; der Erwachen-Kokon bleibt eng."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Boot-Fog-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

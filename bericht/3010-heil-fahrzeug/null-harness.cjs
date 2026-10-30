// Scratch-Harness (w4-heil-fahrzeug): die Welt-Probe der Station fahrzeug.K3 (tempo3.js / tempo4.js) wörtlich wie `werkbank eval`
// (new Function("r", "T", "return (async () => { CODE })();")), headless am Null-Renderer — dessen setAnimationLoop ist still
// (noop), die Harness hängt ihn an requestAnimationFrame; die Schüsse (Ausgabe-Aufnahme) fehlen headless und fallen in `fehler`.
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.argv[2];
const PORT = Number(process.argv[3] || 7881);
const PROBE = fs.readFileSync(process.argv[4], "utf8");
const { statikServer, nullSeite } = require(path.join(ROOT, "scripts/lib/welt-boot.cjs"));
const server = statikServer();

(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 1800000 });
    await page.evaluateOnNewDocument(() => (window.__anazhAutoSettlement = false));
    await server.zeige(page);
    await page.evaluate(() => window.__weltDa((x) => x._foundry && x._foundry.ready && x._foundry.recipes && x._foundry.recipes.gt));
    const o = await page.evaluate((code) => {
        const R = anazhRealm.state.renderer;
        let id = null;
        R.setAnimationLoop = (cb) => {
            if (id !== null) cancelAnimationFrame(id);
            id = null;
            if (!cb) return;
            const f = (t) => {
                id = requestAnimationFrame(f);
                cb(t);
            };
            id = requestAnimationFrame(f);
        };
        return new Function("r", "T", `return (async () => { ${code} })();`)(anazhRealm, THREE);
    }, PROBE);
    await browser.close();
    server.close();
    if (o && Array.isArray(o.bilder)) for (const b of o.bilder) delete b.jpg;
    const kurz = o && { ende: o.ende, phasen: o.phasen, ort: o.ort, gasSimS: o.gasSimS, stoss: o.stoss, ruhe: o.ruhe, top: o.top, vmaxGesetz: o.vmaxGesetz, rueck: o.rueck, drift: o.drift && { bilder: o.drift.bilder, kameraGegenFahrtMax: o.drift.kameraGegenFahrtMax, schlupfMax: o.drift.schlupfMax }, fehler: o.fehler };
    console.log("TEMPO " + JSON.stringify(kurz));
    process.exit(0);
})().catch((e) => {
    console.error("FEHLER", e && e.stack);
    process.exit(1);
});

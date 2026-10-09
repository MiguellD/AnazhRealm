// Sonde BOOT (Auftrag 0710-2 Klein): zählt die abgefangenen Loop-Fehler vom Boot bis 8 s nach dem Buch und nennt je Fehler
// die erste Zeile + die Täter-Methode aus dem Stack.   SONDE_WT=<worktree> node sonde-boot.cjs [port]
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-fahren");
const puppeteer = require(WT + "/node_modules/puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { softwareWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const PORT = Number(process.argv[2] || 7906);
const root = path.resolve(WT);
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
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
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const meld = [];
    page.on("console", (m) => {
        const t = m.text();
        if (/Loop-Frame-Fehler|KERN-PFLICHT/.test(t)) meld.push(t.split("\n").slice(0, 4).join(" ⏎ ").slice(0, 400));
    });
    const seite = [];
    page.on("pageerror", (e) => seite.push((e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async (TICK, HALT) => {
        const t0 = performance.now();
        while (!(window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function") && performance.now() - t0 < 60000) await new Promise((r) => setTimeout(r, 50));
        const r = window.anazhRealm;
        const st = r.state;
        // die Täter je Fehler: die Grenze wird live umwickelt, sobald die Instanz steht (der erste Takt kann davor liegen)
        const taeter = [];
        const roh = r._loopErrorBoundary;
        r._loopErrorBoundary = function (e) {
            const s = String((e && e.stack) || e).split("\n");
            taeter.push({ msg: s[0].slice(0, 160), stack: s.slice(1, 6).map((z) => z.trim().replace(/\(.*\//, "(")).join(" < "), buch: !!(r._foundry && r._foundry.recipes), t: Math.round(performance.now() - t0) });
            return roh.call(this, e);
        };
        const vorUmwickeln = st._loopErrorCount || 0;
        // das Buch kommt spät (der echte Browser: der Ring steht nach ~1 s, das Buch nach 5–8 s) — HALT ms zurückhalten
        if (HALT > 0) {
            const ingRoh = r._foundryIngestBook;
            r._foundryIngestBook = function (m) {
                setTimeout(() => ingRoh.call(r, m), HALT);
            };
        }
        const nw = { vorBuch: 0, nachBuch: 0, framesBeiBuch: null, chunksGebautVorBuch: 0 };
        const nwRoh = r._tickNahWiese;
        r._tickNahWiese = function (dl) {
            if (r._foundry && r._foundry.recipes) nw.nachBuch++;
            else nw.vorBuch++;
            return nwRoh.call(this, dl);
        };
        let tBuch = null;
        const selbst = TICK;
        let tMs = performance.now();
        while (performance.now() - t0 < 90000) {
            if (selbst) for (let i = 0; i < 4; i++) { tMs += 1000 / 60; r._gameLoopTick(tMs); }
            if (tBuch == null && r._foundry && r._foundry.recipes) { tBuch = performance.now(); nw.framesBeiBuch = r._schedFrameNo || 0; }
            if (tBuch != null && performance.now() - tBuch > 8000) break;
            await new Promise((r2) => setTimeout(r2, 100));
        }
        return { nw, foundryDa: !!r._foundry, selbst, frames: r._schedFrameNo || 0, szene: !!st.scene, kamera: !!st.camera, vorUmwickeln, gesamt: st._loopErrorCount || 0, buchMs: tBuch == null ? null : Math.round(tBuch - t0), nahWiese: !!st.nahWiese, kacheln: st.nahWiese ? st.nahWiese.kacheln.size : 0, taeter: taeter.slice(0, 6), taeterN: taeter.length };
    }, !!process.env.SONDE_TICK, Number(process.env.SONDE_BUCH_HALT || 0));
    await browser.close();
    server.close();
    out.konsole = meld.slice(0, 6);
    out.konsoleN = meld.length;
    out.seite = seite.slice(0, 4);
    console.log(JSON.stringify(out, null, 1));
})();

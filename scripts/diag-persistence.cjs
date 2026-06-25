#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-persistence.cjs — DIE PERSISTENZ-HÄRTUNG (npm run gate:persistence)
//
// Schöpfer-Audit-Befund (HOCH): die Welt lebt in localStorage (+ IndexedDB seit
// V18.151) — aber ein KORRUPTER/partieller Write überschrieb den letzten guten
// Stand UND der Load verlor die Welt bei einem Parse-Fehler (`return null`). FIX
// (V18.361): ein ROTIERENDER .bak-Backup (saveState rettet den bisherigen Stand,
// BEVOR es überschreibt) + ein KORRUPTIONS-SICHERER Load (`_loadStateLoadFromStorage`
// fällt bei korruptem Haupt-Stand auf den .bak-Backup zurück). Diese Linse beweist
// beide Hälften headless (GPU-frei).
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4326;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
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
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const o = {};
            const activeId = r.activeWorldGet ? r.activeWorldGet() : null;
            const wid = r.state.worldMeta && r.state.worldMeta.worldId;
            o.idsMatch = !!activeId && activeId === wid;
            const key = r.worldStorageKey(activeId || wid);
            const bakKey = key + ".bak";
            // zwei Saves → der .bak wird mit dem ersten guten Stand gefüllt (Rotation)
            r.saveState();
            r.saveState();
            o.mainExists = !!localStorage.getItem(key);
            o.bakExists = !!localStorage.getItem(bakKey);
            o.bakValid = (() => {
                try {
                    return !!JSON.parse(localStorage.getItem(bakKey));
                } catch (_e) {
                    return false;
                }
            })();
            // den IDB-Preload-Pfad ausschalten, damit der LS-Pfad gemessen wird
            r._idbPreloadedState = null;
            // (1) Haupt-Stand KORRUMPIEREN (truncated write) → muss aus dem .bak retten
            localStorage.setItem(key, '{"worldMeta":{trunc');
            const recovered = r._loadStateLoadFromStorage();
            o.recoveredFromBackup = !!(recovered && typeof recovered === "object");
            // (2) AUCH den Backup korrumpieren → ehrliches null (kein stiller Müll)
            r._idbPreloadedState = null;
            localStorage.setItem(bakKey, "]]also broken{{");
            const both = r._loadStateLoadFromStorage();
            o.honestNullWhenBothCorrupt = both === null;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Persistenz-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const checks = [
        { name: "World-Key == Active-Key (kein Key-Drift)", pass: out.idsMatch },
        { name: "Haupt-Stand geschrieben", pass: out.mainExists },
        { name: "Rotierender .bak-Backup geschrieben", pass: out.bakExists },
        { name: ".bak ist gültiges JSON (der letzte gute Stand)", pass: out.bakValid },
        {
            name: "Korrupter Haupt-Stand → aus dem Backup WIEDERHERGESTELLT (Welt nicht verloren)",
            pass: out.recoveredFromBackup,
        },
        { name: "Haupt + Backup korrupt → ehrliches null (kein stiller Müll)", pass: out.honestNullWhenBothCorrupt },
    ];
    console.log("\n=== Persistenz-Härtung (rotierender Backup + korruptions-sicherer Load) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Persistenz-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die Persistenz-Härtung greift nicht — die Welt ist bei Korruption noch verlierbar.");
        process.exit(1);
    }
    console.log("✅ Die Welt überlebt einen korrupten Write (ein Stand zurück) — kein stiller Datenverlust.");
    process.exit(0);
})();

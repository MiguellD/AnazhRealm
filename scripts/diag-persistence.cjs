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
//
// (K) DER RELOAD MIT KALTEM BUCH (06.10., V18.531): ein Studio-Haus der Welt (haus_*, Worldgen-id als ZAHL) muss
// den Restore überstehen, auch wenn das Studio-Buch noch nicht da ist. Die FOUNDRY-SPAWN-WAND nahm nur Text-ids als
// Restore-Heilung: echte GPU, Werkbank, zweiter Boot — 12 Häuser an der Mess-Wiese fielen, der nächste Save schrieb
// den Verlust fest. Gegenprobe (nicht vakuös): ein FRISCHER Spawn bei kaltem Buch bleibt blockiert.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Port über PERSISTENCE_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4326.
const PORT = Number(process.env.PERSISTENCE_PORT || 4326);
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
        window.__anazhForceFoundry = true;
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
        // (K) DER RELOAD MIT KALTEM BUCH: warten, bis das Studio-Buch die Häuser registriert hat, dann ein Haus mit
        // Zahlen-id setzen, den Snapshot bei kaltem Buch zurückspielen (der Zweit-Boot) und zählen.
        await page.waitForFunction(
            () => {
                const r = window.anazhRealm;
                return !!(r._foundry && r._foundry.ready && r.state.blueprints && r.state.blueprints.haus_griechisch);
            },
            { timeout: 120000 }
        );
        Object.assign(
            out,
            await page.evaluate(() => {
                const r = window.anazhRealm;
                const k = {};
                const id = 990001; // eine Zahlen-id (wie Worldgen) — der Spawn vergibt sie neu, gezählt wird die Stelle
                const istHaus = (a) => a && a.type === "haus_griechisch" && Math.abs(a.position.x - 52) < 0.01 && Math.abs(a.position.z - 52) < 0.01;
                const pos = { x: 52, y: r._voxelSurfaceY(52, 52), z: 52 };
                const haus = r.spawnArchitecture("haus_griechisch", pos, { seed: 9, precise: true, id });
                k.kGesetzt = !!haus;
                const snap = r.buildStateSnapshot();
                k.kImSnapshot = (snap.architectures || []).some(istHaus);
                const f = r._foundry;
                const warm = f.ready;
                f.ready = false; // der Zweit-Boot: der Stand lädt, bevor das Buch kommt
                try {
                    k.kFrischBlockiert =
                        r.spawnArchitecture("haus_griechisch", { x: 60, y: pos.y, z: 60 }, { seed: 9 }) === null;
                    r._loadStateRestoreArchitectures({ architectures: snap.architectures });
                } finally {
                    f.ready = warm;
                }
                k.kZurueck = (r.state.architectures || []).some(istHaus);
                k.kVorher = (snap.architectures || []).length;
                k.kNachher = (r.state.architectures || []).length;
                return k;
            })
        );
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
        {
            name: "(K) Gegenprobe: ein FRISCHER Studio-Spawn bei kaltem Buch bleibt blockiert (die Kalt-Probe wirkt)",
            pass: out.kGesetzt === true && out.kFrischBlockiert === true,
        },
        {
            name: `(K) Reload mit kaltem Buch: das Haus mit Zahlen-id kehrt zurück (Einträge ${out.kVorher} → ${out.kNachher})`,
            pass: out.kImSnapshot === true && out.kZurueck === true && out.kNachher === out.kVorher,
        },
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

// diag-genesis-spawn.cjs — V18.95: Browser-Pfad-Reproduktion des Schöpfer-Befunds
// „bei NEUER Welt spawnt keine Plattform, ich stecke im Boden" (V18.94-Restbefund).
//
// Der Headless-Playtest bootet mit FRISCHEM localStorage → loadState findet nichts →
// terrainEverGenerated bleibt false → der Erst-Spawn-Pfad (deterministischer offener
// Punkt + Genesis-Plattform) läuft IMMER → grün. Der ECHTE Browser-Pfad einer neuen
// Welt ist anders: createNewWorld schreibt einen LEEREN Snapshot → window.location
// .reload() → loadState FINDET den Snapshot → _loadStateRestorePlayerPosition setzte
// terrainEverGenerated=true (Hypothese b des V18.94-Diskriminators) → wasFirstSpawn
// =false → KEINE Plattform, Spieler bleibt auf dem Snapshot-Default → im Fels.
//
// Diese Sonde fährt den ECHTEN Pfad: boot → createNewWorld({reload:false}) →
// page.reload() → boot → Loop pumpen → messen. Exit 0 nur wenn die neue Welt
// die Plattform trägt UND der Spieler offen + un-eingegraben steht.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4316;
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

const BOOT = () =>
    `window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.terrainEverGenerated === true`;

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    const genesisLines = [];
    page.on("console", (msg) => {
        const t = msg.text();
        if (/Genesis-Plattform|Erst-Spawn/.test(t)) genesisLines.push(t);
    });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", err.message));

    console.log("[1] Erst-Boot (frisches Profil) …");
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(BOOT(), { timeout: 180000, polling: 500 });

    console.log("[2] createNewWorld({reload:false}) — der leere Snapshot wird geschrieben …");
    const newId = await page.evaluate(() => window.anazhRealm.createNewWorld({ slug: "diag-genesis", reload: false }));
    if (!newId) {
        console.log("FAIL: createNewWorld gab keine worldId zurück");
        process.exit(1);
    }
    const snapInfo = await page.evaluate((id) => {
        const raw = localStorage.getItem(window.anazhRealm.worldStorageKey(id));
        const snap = raw ? JSON.parse(raw) : null;
        return snap ? { hasPlayerPosition: snap.playerPosition != null, playerPosition: snap.playerPosition } : null;
    }, newId);
    console.log("    Snapshot:", JSON.stringify(snapInfo));

    console.log("[3] ECHTER page.reload() — der Browser-Pfad …");
    genesisLines.length = 0;
    await page.reload({ waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(BOOT(), { timeout: 180000, polling: 500 });

    // Loop synchron pumpen (V9.83-Muster): Spieler-Chunk + Physik settlen lassen.
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        const t0 = performance.now();
        for (let i = 0; i < 400 && performance.now() - t0 < 25000; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                console.log("[TICK-ERROR] " + _e.message);
            }
            if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const p = r.state.playerMesh ? r.state.playerMesh.position : null;
        const surf = p ? r.getTerrainHeightAt(p.x, p.z) : null;
        const macro = p ? r._terrainMacroSurfaceY(p.x, p.z) : null;
        const plat = (r.state.architectures || []).find((a) => a && a.type === "start_plattform") || null;
        return {
            slug: r.state.worldMeta && r.state.worldMeta.slug,
            terrainEverGenerated: r.state.terrainEverGenerated,
            player: p ? { x: +p.x.toFixed(1), y: +p.y.toFixed(1), z: +p.z.toFixed(1) } : null,
            surf: Number.isFinite(surf) ? +surf.toFixed(1) : null,
            macro: Number.isFinite(macro) ? +macro.toFixed(1) : null,
            embedded: p && Number.isFinite(surf) ? p.y < surf - 0.5 : null,
            openSky: Number.isFinite(surf) && Number.isFinite(macro) ? surf >= macro - 6 : null,
            hasPlatform: !!plat,
            voxelChunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
        };
    });

    console.log("[4] Messung nach Reload:", JSON.stringify(out, null, 2));
    console.log("    Genesis-Konsole:", genesisLines.length ? genesisLines : "(KEINE Genesis-Zeile — nie gerufen)");

    await browser.close();
    server.close();

    const pass =
        out.slug === "diag-genesis" &&
        out.hasPlatform === true &&
        out.embedded === false &&
        genesisLines.some((l) => /Genesis-Plattform erstellt/.test(l));
    console.log(
        pass
            ? "\nPASS — neue Welt: Plattform da, Spieler offen + frei"
            : "\nFAIL — der Browser-Pfad bricht den Erst-Spawn"
    );
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    process.exit(2);
});

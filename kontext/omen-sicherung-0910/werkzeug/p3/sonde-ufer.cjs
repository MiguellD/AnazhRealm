// Sonde UFER (Auftrag 0710-2 Punkt 5, D5 nur benennen): der GT am trockenen Uferstreifen der Leben-Schau (−878/−607),
// 6 s Vollgas in 8 Richtungen, je Richtung Weg, Spitzen-Tempo, Boden, Lauf-Fläche des Wassers und die Frames "unter Wasser".
//   SONDE_WT=<worktree> node sonde-ufer.cjs [port]
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-fahren");
const puppeteer = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren/node_modules/puppeteer");
const http = require("http"), fs = require("fs"), path = require("path");
const { softwareWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const PORT = Number(process.argv[2] || 7907);
const root = path.resolve(WT);
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => { if (err) return ((res.statusCode = 404), res.end()); res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: softwareWebGpuArgs() });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhForceFoundry = true; window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((q) => setTimeout(q, ms));
        const t0 = performance.now();
        while (!(window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") && performance.now() - t0 < 60000) await sleep(100);
        const r = window.anazhRealm, st = r.state, f = r._ensureAssetFoundry();
        while (performance.now() - t0 < 90000 && !(f && f.ready && f.recipes && f.recipes.gt && st.blueprints && st.blueprints.fahrzeug_gt)) await sleep(80);
        let tMs = performance.now();
        const frame = () => { tMs += 1000 / 60; r._gameLoopTick(tMs); };
        const hh = (a, b) => r.getTerrainHeightAt(a, b);
        const O = [-878, -607];
        st.playerMesh.position.set(O[0], hh(O[0], O[1]) + 2, O[1]);
        for (let i = 0; i < 400; i++) { frame(); if (i % 40 === 39) await sleep(30); }
        const ort = { boden: +hh(O[0], O[1]).toFixed(2), lauf: r._waterRunSurfaceAt(O[0], O[1]), ueberWasser: r._isAboveWaterAt ? r._isAboveWaterAt(O[0], O[1]) : null };
        const zeilen = [];
        for (let k = 0; k < 8; k++) {
            const gier = (k * Math.PI) / 4;
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (const cr of (st.creatures || []).slice()) if (cr && cr.position && Math.hypot(cr.position.x - O[0], cr.position.z - O[1]) < 30) r.removeCreature(cr);
            st.playerMesh.position.set(O[0], hh(O[0], O[1]) + 1.2, O[1]);
            st.playerVel.setValue(0, 0, 0);
            const e = r.spawnArchitecture("fahrzeug_gt", { x: O[0], y: hh(O[0], O[1]) + 0.5, z: O[1] }, { silent: true, precise: true, rotationY: gier - Math.PI / 2 });
            const dl = performance.now() + 30000;
            while (e && !e.instanced && !e.mesh && performance.now() < dl) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) frame(); await sleep(80); }
            const mr = r.mountArchitecture(e);
            if (!mr || !mr.ok) { zeilen.push({ gier: k * 45, fehler: "aufsitzen" }); continue; }
            for (const kk of ["w", "a", "s", "d", "shift", " "]) st.keys[kk] = false;
            for (let i = 0; i < 12; i++) frame();
            const p0 = { x: e.position.x, z: e.position.z };
            let vMax = 0, nass = 0, n = 0;
            st.keys.w = true;
            for (let i = 0; i < 360; i++) {
                frame();
                vMax = Math.max(vMax, Math.hypot(st.playerVel.x(), st.playerVel.z()));
                n++;
                if (st.playerUnderwater) nass++;
            }
            st.keys.w = false;
            const lauf = r._waterRunSurfaceAt(e.position.x, e.position.z);
            zeilen.push({ gier: k * 45, weg: +Math.hypot(e.position.x - p0.x, e.position.z - p0.z).toFixed(2), vMax: +vMax.toFixed(2), afloat: !!e._afloat, nass, n, laufEnde: lauf == null ? null : +(+lauf).toFixed(2), bodenEnde: +hh(e.position.x, e.position.z).toFixed(2) });
            r.dismountArchitecture();
            r.removeArchitecture(e);
        }
        return { ort, zeilen };
    });
    await browser.close();
    server.close();
    console.log(JSON.stringify(out, null, 1));
})();

// Sonde MASSE (Auftrag 0710-4 Klasse 1): je Gattung bei bodySize 1 — Hüft-L, Kapsel-Masse heute (_kreaturMasse), die Meshes der
// Gestalt (Klasse, Ecken, Dreiecke, offene Kanten, Volumen über den Divergenz-Satz in m³ inkl. Wurzel- und Tier-Skala).
//   SONDE_WT=<worktree> node sonde-masse.cjs [port]
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-impuls");
const puppeteer = require("C:/Users/micha/Desktop/AnazhRealm-OMEN/welle-m-fahren/node_modules/puppeteer");
const http = require("http"), fs = require("fs"), path = require("path");
const { softwareWebGpuArgs } = require(WT + "/scripts/lib/software-gpu.cjs");
const PORT = Number(process.argv[2] || 7906);
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
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((q) => setTimeout(q, ms));
        const t0 = performance.now();
        while (!(window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") && performance.now() - t0 < 60000) await sleep(100);
        const r = window.anazhRealm, st = r.state, f = r._ensureAssetFoundry();
        while (performance.now() - t0 < 90000 && !(f && f.ready && f.recipes)) await sleep(80);
        const hh = (a, b) => r.getTerrainHeightAt(a, b);
        let tMs = performance.now();
        const O = [-900, -850];
        st.playerMesh.position.set(O[0] - 4, hh(O[0] - 4, O[1] + 6) + 1.2, O[1] + 6);
        for (let i = 0; i < 200; i++) { tMs += 16.7; r._gameLoopTick(tMs); if (i % 40 === 39) await sleep(20); }
        const A = r.constructor;
        const steuerRoh = A._steuerGesetz; const steht = Object.create(steuerRoh.call(A)); steht.steuerSchritt = (sw) => { sw.v = 0; }; A._steuerGesetz = () => steht;
        const wx = O[0] + 6, wz = O[1], g = hh(wx, wz);
        const wand = r.spawnArchitecture("stein_block", { x: wx, y: g + 0.5, z: wz }, { silent: true, precise: true });
        wand.blockerAABBs = [{ minX: wx - 0.175, maxX: wx + 0.175, minZ: wz - 2, maxZ: wz + 2, botY: g - 0.5, topY: g + 3, dick: 3.5 }];
        wand._blockerReach = 3;
        const bx = wx - 0.175 - 3;
        const b = r.spawnCreatureAt(bx, hh(bx, wz) + 0.5, wz, "calm", "baer", { precise: true, bodySize: 1 });
        b.position.set(bx, hh(bx, wz), wz); b.rotation.y = Math.PI / 2; b.userData._steuer = { gier: Math.PI / 2, v: 0 };
        b.userData._stossV = { x: 13.7, z: 0 };
        const spur = [];
        for (let i = 0; i < 40; i++) { tMs += 33.3; r._gameLoopTick(tMs); spur.push(+(b.position.x - wx).toFixed(3)); }
        A._steuerGesetz = steuerRoh;
        const lb = r._kreaturLeib(b, 0, {});
        return { spur, halb: lb.halb, radius: lb.radius, boxen: wand.blockerAABBs.length, stossV: b.userData._stossV };
    });
    await browser.close(); server.close();
    console.log(JSON.stringify(out));
})();

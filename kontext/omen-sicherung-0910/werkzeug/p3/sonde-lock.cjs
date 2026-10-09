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
        const sleep = (ms) => new Promise((q) => setTimeout(q, ms));
        const t0 = performance.now();
        while (!(window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") && performance.now() - t0 < 60000) await sleep(100);
        const r = window.anazhRealm, st = r.state, f = r._ensureAssetFoundry();
        while (performance.now() - t0 < 90000 && !(f && f.ready && f.recipes && f.recipes.gt && st.blueprints.fahrzeug_gt)) await sleep(80);
        const hh = (a, b) => r.getTerrainHeightAt(a, b);
        let tMs = performance.now();
        const O = [-900, -850];
        st.playerMesh.position.set(O[0], hh(O[0], O[1]) + 2, O[1]);
        for (let i = 0; i < 300; i++) { tMs += 16.7; r._gameLoopTick(tMs); if (i % 40 === 39) await sleep(20); }
        for (const c of (st.creatures || []).slice()) if (Math.hypot(c.position.x - O[0], c.position.z - O[1]) < 60) r.removeCreature(c);
        const A = r.constructor;
        const steuerRoh = A._steuerGesetz; const steht = Object.create(steuerRoh.call(A)); steht.steuerSchritt = (sw) => { sw.v = 0; }; A._steuerGesetz = () => steht;
        const lauf = async (muster) => {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (const w of (st.architectures || []).slice()) if (w && /^fahrzeug_/.test(w.type)) r.removeArchitecture(w);
            const sx = O[0], sz = O[1];
            st.playerMesh.position.set(sx, hh(sx, sz) + 1.2, sz); st.playerVel.setValue(0, 0, 0); st._fieldVy = 0;
            const e = r.spawnArchitecture("fahrzeug_gt", { x: sx, y: hh(sx, sz) + 0.5, z: sz }, { silent: true, precise: true, rotationY: Math.PI / 2 - Math.PI / 2 });
            while (!e.instanced && !e.mesh) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) { tMs += 16.7; r._gameLoopTick(tMs); } await sleep(80); }
            r.mountArchitecture(e);
            for (const k of ["w", "a", "s", "d", "shift", " "]) st.keys[k] = false;
            for (let i = 0; i < 12; i++) { tMs += 16.7; r._gameLoopTick(tMs); }
            const yaw = Number.isFinite(e._rideYaw) ? e._rideYaw : 0;
            const ux = Math.sin(yaw), uz = Math.cos(yaw);
            const bx = sx + ux * 9, bz = sz + uz * 9;
            const b = r.spawnCreatureAt(bx, hh(bx, bz) + 0.5, bz, "calm", "baer", { precise: true, bodySize: 1 });
            b.position.set(bx, hh(bx, bz), bz); b.rotation.y = yaw + Math.PI / 2; b.userData._steuer = { gier: b.rotation.y, v: 0 }; b.userData._stossV = null;
            st._fixedAccumulator = 0;
            const PF = r._stepFixedSim; const spur = []; let n = 0;
            r._stepFixedSim = function (simTime, dt) { PF.call(this, simTime, dt); n++; const sv = b.userData._stossV; spur.push([n, +st.playerMesh.position.x.toFixed(5), +st.playerMesh.position.z.toFixed(5), +e.position.x.toFixed(5), +b.position.x.toFixed(5), +b.position.z.toFixed(5), +b.position.y.toFixed(4), sv ? +Math.hypot(sv.x, sv.z).toFixed(4) : 0, +st.playerVel.x().toFixed(5), +st.playerVel.z().toFixed(5)]); };
            st.keys.w = true;
            for (let i = 0; i < 2000 && n < 200; i++) { tMs += muster[i % muster.length]; r._gameLoopTick(tMs); }
            r._stepFixedSim = PF; st.keys.w = false;
            r.dismountArchitecture(); r.removeArchitecture(e); r.removeCreature(b);
            return spur;
        };
        const a = await lauf([1000 / 60]);
        const m = await lauf([8, 33, 16, 25, 12, 30, 20, 9, 33, 14]);
        A._steuerGesetz = steuerRoh;
        let erst = -1;
        for (let i = 0; i < Math.min(a.length, m.length); i++) if (JSON.stringify(a[i].slice(1)) !== JSON.stringify(m[i].slice(1))) { erst = i; break; }
        let erstXZ = -1; for (let i = 0; i < Math.min(a.length, m.length); i++) if (a[i][1] !== m[i][1] || a[i][2] !== m[i][2] || a[i][4] !== m[i][4] || a[i][5] !== m[i][5]) { erstXZ = i; break; } return { erst, erstXZ, um: erstXZ >= 0 ? [a.slice(Math.max(0, erstXZ - 1), erstXZ + 2), m.slice(Math.max(0, erstXZ - 1), erstXZ + 2)] : null, endeA: a[a.length - 1], endeM: m[m.length - 1] };
    });
    await browser.close(); server.close();
    console.log(JSON.stringify(out, null, 0));
})();

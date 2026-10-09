// Sonde SITZ (Auftrag 0710-4 Klasse 4): je Wagen-Art aufsitzen und messen — Dach (oberste Hüllen-Box), Sitzfläche
// (exportDrive.sitz über der Rad-Ebene), Hüftgelenk und Kopf-Oberkante des Reiters (das gepostete Haut-Mesh).
//   SONDE_WT=<worktree> node sonde-sitz.cjs [port]
"use strict";
const WT = "C:/Users/micha/Desktop/AnazhRealm-OMEN/" + (process.env.SONDE_WT || "welle-m-impuls");
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
        const O = [-900, -850];
        st.playerMesh.position.set(O[0], hh(O[0], O[1]) + 2, O[1]);
        for (let i = 0; i < 300; i++) { frame(); if (i % 40 === 39) await sleep(30); }
        const namen = Object.keys(st.blueprints).filter((n) => /^fahrzeug_/.test(n));
        const zeilen = [];
        const haut = () => {
            let m = null;
            const nah = [];
            st.playerMesh.traverse((o) => { if (o.userData && o.userData._menschFern && o.userData._menschFern.nah) nah.push(o.userData._menschFern.nah); });
            (nah[0] || st.playerMesh).traverse((o) => { if (!m && o.isMesh && o.material && o.material.userData && o.material.userData.foundryKind === "haut") m = o; });
            return m;
        };
        for (const name of namen) {
            if (st.player && st.player.mountedArch != null) r.dismountArchitecture();
            for (const w of (st.architectures || []).slice()) if (w && /^fahrzeug_/.test(w.type)) r.removeArchitecture(w);
            const x = O[0] + 4, z = O[1];
            st.playerMesh.position.set(x, hh(x, z) + 1.2, z);
            const e = r.spawnArchitecture(name, { x, y: hh(x, z) + 0.5, z }, { silent: true, precise: true });
            if (!e) { zeilen.push({ name, fehler: "spawn" }); continue; }
            const dl = performance.now() + 30000;
            while (!e.instanced && !e.mesh && performance.now() < dl) { r._rebuildArchitectureMesh(e); if (e.instanced || e.mesh) break; for (let i = 0; i < 6; i++) frame(); await sleep(80); }
            const mr = r.mountArchitecture(e);
            if (!mr || !mr.ok) { zeilen.push({ name, fehler: "aufsitzen" }); continue; }
            for (let i = 0; i < 30; i++) frame();
            const fzg = r._fahrzeugGesetzFor(e);
            const drive = fzg && fzg.drive;
            const sc = Number.isFinite(e.scale) ? e.scale : 1;
            let dach = -Infinity;
            for (const b of e.blockerAABBs || []) dach = Math.max(dach, b.topY);
            st.playerMesh.updateMatrixWorld(true);
            const hm = haut();
            let kopf = null;
            if (hm) {
                if (hm.isSkinnedMesh && typeof hm.computeBoundingBox === "function") { hm.computeBoundingBox(); const bb = hm.boundingBox.clone().applyMatrix4(hm.matrixWorld); kopf = bb.max.y; }
                else { hm.geometry.computeBoundingBox(); kopf = hm.geometry.boundingBox.clone().applyMatrix4(hm.matrixWorld).max.y; }
            }
            const rig = st.playerMesh.userData && st.playerMesh.userData.rig;
            const hp = new THREE.Vector3();
            if (rig && rig.legL && rig.legL.hip) rig.legL.hip.getWorldPosition(hp);
            const basis = e.position.y; // die Rad-Ebene des Studio-Wagens (Ursprung der Gestalt)
            zeilen.push({
                name, scale: sc,
                rad: +basis.toFixed(3),
                sitzAnker: drive && drive.sitz ? drive.sitz.y : null,
                sitzFlaeche: drive && drive.sitz ? +(basis + drive.sitz.y * sc).toFixed(3) : null,
                dachKern: drive && drive.huelle ? +(basis + drive.huelle.yRoof * sc).toFixed(3) : null,
                dachBox: Number.isFinite(dach) ? +dach.toFixed(3) : null,
                spieler: +st.playerMesh.position.y.toFixed(3),
                huefte: rig ? +hp.y.toFixed(3) : null,
                kopf: kopf === null ? null : +kopf.toFixed(3),
                sitzHoehe: e._sitzHeight,
            });
        }
        return zeilen;
    });
    await browser.close();
    server.close();
    for (const z of out) {
        if (z.fehler) { console.log(z.name, "FEHLER", z.fehler); continue; }
        console.log(`${z.name} (Skala ${z.scale}): Rad-Ebene ${z.rad} · Sitzfläche +${(z.sitzFlaeche - z.rad).toFixed(3)} · Dach Kern +${(z.dachKern - z.rad).toFixed(3)} / Box +${(z.dachBox - z.rad).toFixed(3)} · Spieler-Ursprung +${(z.spieler - z.rad).toFixed(3)} · Hüfte +${(z.huefte - z.rad).toFixed(3)} (über Sitz ${(z.huefte - z.sitzFlaeche).toFixed(3)}) · Kopf +${(z.kopf - z.rad).toFixed(3)} (Dach − Kopf ${(z.dachKern - z.kopf).toFixed(3)} m)`);
    }
})();

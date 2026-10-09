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
        while (performance.now() - t0 < 90000 && !(f && f.ready && f.recipes)) await sleep(80);
        const zeilen = [];
        const volumen = (geo) => {
            const p = geo.attributes.position.array, ix = geo.index ? geo.index.array : null;
            const n = ix ? ix.length : p.length / 3;
            let v = 0;
            const kanten = new Map();
            for (let t = 0; t < n; t += 3) {
                const a = ix ? ix[t] : t, b = ix ? ix[t + 1] : t + 1, c = ix ? ix[t + 2] : t + 2;
                const ax = p[3 * a], ay = p[3 * a + 1], az = p[3 * a + 2], bx = p[3 * b], by = p[3 * b + 1], bz = p[3 * b + 2], cx = p[3 * c], cy = p[3 * c + 1], cz = p[3 * c + 2];
                v += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
                for (const [u, w] of [[a, b], [b, c], [c, a]]) { const k = u < w ? u + "," + w : w + "," + u; kanten.set(k, (kanten.get(k) || 0) + 1); }
            }
            let offen = 0;
            for (const z of kanten.values()) if (z === 1) offen++;
            return { v, offen, dreiecke: n / 3, ecken: p.length / 3 };
        };
        for (const seele of ["fuchs", "wolf", "wesen", "baer"]) {
            st.maxCreatures = Math.max(st.maxCreatures || 0, st.creatures.length + 2);
            const c = r.spawnCreatureAt(-900, 40, -850, "calm", seele, { bodySize: 1, precise: true });
            if (!c) { zeilen.push({ seele, fehler: "spawn" }); continue; }
            const tb = c.userData._tierBaum;
            const s = (c.scale && c.scale.x) || 1;
            const wrapS = tb && tb.wrap ? tb.wrap.scale.x : 1;
            const meshes = [];
            if (tb && tb.wrap) tb.wrap.updateMatrixWorld(true);
            if (tb && tb.wrap) tb.wrap.traverse((o) => {
                if (!o.isMesh) return;
                const m = volumen(o.geometry);
                // die Skala vom Mesh bis zur Kreatur (wrap · Klon-Knoten), dazu die Kreatur-Skala
                const e = new THREE.Vector3(); o.getWorldScale(e);
                const cs = new THREE.Vector3(); c.getWorldScale(cs);
                const k = (e.x / cs.x) * s;
                o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox; const gr = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z].map((v) => +(v * k).toFixed(3));
                const mat = o.material || {};
                meshes.push({ gr, mname: mat.name || "", ud: Object.keys(mat.userData || {}).join("+"), kl: (mat.userData && (mat.userData.__klasse || mat.userData.foundryKind)) || ("ud:" + Object.keys(mat.userData || {}).join("+") + "|g:" + Object.keys(o.geometry.userData || {}).join("+") + "|m:" + Object.keys(o.userData || {}).join("+")), parent: o.parent && o.parent.name, name: o.name, klasse: o.material && o.material.userData ? o.material.userData.__klasse || o.material.name : "", skinned: !!o.isSkinnedMesh, ecken: m.ecken, dreiecke: m.dreiecke, offen: m.offen, vM3: +(m.v * k * k * k).toFixed(4) });
            });
            const A = r.constructor;
            const diag = [];
            tb.wrap.traverse((o) => { if (!o.isMesh) return; const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null; if (!A.LEIB_KLASSEN.includes(kl)) return; const g = A._geschlossenesVolumen(o.geometry); const memo = A._leibVolumenMemo && A._leibVolumenMemo.get(o.geometry); diag.push({ kl, g, memo, inter: !!o.geometry.attributes.position.isInterleavedBufferAttribute, idx: !!o.geometry.index }); });
            const jetzt = A._leibVolumen(tb.wrap, c);
            const L = r._kreaturHueftL(c);
            zeilen.push({ seele, label: c.userData.soulLabel || c.userData.label || "", bodySize: c.userData.bodySize, scale: s, wrapS, L: +L.toFixed(3), leibV: tb ? tb.leibV : null, jetzt, diag, kapselKg: (() => { try { return typeof r._leibMasse === "function" ? +r._leibMasse(c).toFixed(1) : +r._kreaturMasse(c).toFixed(1); } catch (e) { return String(e.message).slice(0, 80); } })(), meshes });
            r.removeCreature(c);
        }
        // am Bäcker-Ausgang: die Klasse je Mesh (material.userData.__klasse) und ihr Volumen in m³ (Lab-Einheit × meterJeEinheit)
        const core = window.__tetrapodaCore, B = globalThis.BAKERS_BY_KIND;
        const f2 = core.MASSSTAB.meterJeEinheit;
        const baecker = [];
        for (const seele of ["fuchs", "wolf", "wesen", "baer"]) {
            const recId = r.constructor.TETRAPODA_SOUL_MAP[seele];
            const d = r._ofenKreaturDials(recId);
            const g = B.kreatur(core, recId, 0, 0, d.dials);
            const ms = [];
            g.updateMatrixWorld(true);
            g.traverse((o) => { if (!o.isMesh) return; const m = volumen(o.geometry); if (!m.offen && m.v > 0) ms.push({ kl: (o.material && o.material.userData && o.material.userData.__klasse) || "-", v: +(m.v * f2 * f2 * f2).toFixed(4), skin: !!o.isSkinnedMesh, ws: +o.getWorldScale(new THREE.Vector3()).x.toFixed(3) }); });
            baecker.push({ seele, recId, ms });
        }
        zeilen.baecker = baecker;
        // der Spieler: jede Mesh-Klasse unter playerMesh (geschlossen?, Volumen in Welt-m³)
        const spieler = [];
        st.playerMesh.updateMatrixWorld(true);
        st.playerMesh.traverse((o) => {
            if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
            const m = volumen(o.geometry);
            const e = new THREE.Vector3(); o.getWorldScale(e);
            spieler.push({ kl: (o.material && o.material.userData && (o.material.userData.foundryKind || o.material.userData.__klasse)) || "-", name: o.name, ecken: m.ecken, offen: m.offen, vM3: +(m.v * e.x * e.y * e.z).toFixed(4), skin: !!o.isSkinnedMesh, vis: o.visible });
        });
        zeilen.spieler = spieler;
        try { zeilen.spielerKg = typeof r._leibMasse === "function" ? r._leibMasse(st.playerMesh) : null; } catch (e) { const v = []; st.playerMesh.traverse((o) => { if (o.userData && "_leibV" in o.userData) v.push(o.userData._leibV); }); zeilen.spielerKg = "FEHLER " + String(e.message).slice(0, 60) + " leibV-Halter: " + JSON.stringify(v) + " kinder " + st.playerMesh.children.length; }
        const e = r.spawnArchitecture("fahrzeug_gt", { x: -905, y: r.getTerrainHeightAt(-905, -850) + 0.5, z: -850 }, { silent: true, precise: true });
        const prof = e ? r._vehicleProfile(e) : null;
        const G = prof ? r._fahrSatz(e, prof) : null;
        zeilen.gt = G ? { m3: G.m, kg: typeof r._fahrMasse === "function" ? r._fahrMasse(G) : null } : null;
        return { zeilen, baecker, spieler: zeilen.spieler, spielerKg: zeilen.spielerKg, gt: zeilen.gt };
    });
    await browser.close();
    server.close();
    console.log("Bäcker:", JSON.stringify(out.baecker));
    console.log("Spieler kg:", out.spielerKg, " GT:", JSON.stringify(out.gt));
    for (const z of out.zeilen) {
        console.log(`jetzt ${z.jetzt} diag ${JSON.stringify(z.diag)} · leibV ${z.leibV} · ${z.seele} (${z.label}) bodySize ${z.bodySize} scale ${z.scale} L ${z.L} m · Kapsel ${z.kapselKg} kg`);
        for (const m of z.meshes || []) console.log(`   [${m.kl}|${m.mname}|${m.name}|${m.parent}] Groesse ${m.gr.join('x')} m: ${m.ecken} Ecken, ${m.dreiecke} Dreiecke, offen ${m.offen}, V ${m.vM3} m³${m.skinned ? " (geskinnt)" : ""}`);
        if (z.fehler) console.log("   FEHLER", z.fehler);
    }
})();

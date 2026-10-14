// 1310-18 (aus k17, + Seiten-Fehler + Schlüssel je Signatur): DER ERST-BAU BEIM NAMEN — echte GPU, Boot über den save-server (benanntes Profil: der erste Lauf kalt, jeder weitere
// zweit). Am Renderer wird `_nodes.getForRender` umhüllt (dort baut r184 den Knoten-Graphen eines RenderObjects, synchron):
// je Bau die Zeit ab Navigation, die Dauer, der Stoff (Typ, Name, foundryKind), das Objekt (Name, Art: instanziert ·
// geskinnt · gebündelt), die Kamera (Haupt · Schatten), der Schlüssel des Programms.
//   node bau-probe.cjs <instrument-baum> <datei.json> <profil-ordner> [http://localhost:4312]
"use strict";
const fs = require("fs");
const path = require("path");
const [instr, datei, profilArg, seite = "http://localhost:4312"] = process.argv.slice(2);
const puppeteer = require(require.resolve("puppeteer", { paths: [instr] }));
const { echteWebGpuArgs } = require(path.join(instr, "scripts/lib/software-gpu.cjs"));
const HOOK = () => {
    const L = (window.__bau = { liste: [], gehuellt: null });
    const huelle = () => {
        const r = window.anazhRealm;
        const rend = r && r.state && r.state.renderer;
        const N = rend && rend._nodes;
        if (!N || N.__k17) return !!(N && N.__k17);
        const orig = N.getForRender.bind(N);
        N.getForRender = function (ro, ...rest) {
            const d = N.get(ro);
            const neu = d.nodeBuilderState === undefined;
            const gebaut = neu && N.nodeBuilderCache.get(N.getForRenderCacheKey(ro)) === undefined;
            const t = performance.now();
            const out = orig(ro, ...rest);
            if (neu) {
                const ms = performance.now() - t;
                const o = ro.object || {};
                const m = ro.material || {};
                const u = (m.userData || {});
                L.liste.push({
                    t: Math.round(t),
                    ms: +ms.toFixed(1),
                    gebaut,
                    stoff: (m.type || "?") + (m.name ? ":" + m.name : ""),
                    kind: u.foundryKind || u.__klasse || null,
                    objekt: (o.name || o.type || "?").slice(0, 60),
                    art: o.isBatchedMesh ? "batch" : o.isInstancedMesh ? "inst" : o.isSkinnedMesh ? "skin" : o.isMesh ? "mesh" : o.type,
                    kamera: ro.camera ? (ro.camera.isOrthographicCamera ? "ortho" : "persp") : "?",
                    schatten: !!(ro.camera && ro.camera.isOrthographicCamera),
                    schluessel: String(ro.initialCacheKey || "").slice(0, 80),
                    ou: Object.keys(o.userData || {}).filter((k) => { const v = o.userData[k]; return typeof v === "string" || typeof v === "number" || typeof v === "boolean"; }).slice(0, 8).map((k) => k + "=" + String(o.userData[k]).slice(0, 30)).join(" "),
                    eltern: o.parent ? (o.parent.name || o.parent.type || "").slice(0, 30) : null,
                    mu: Object.keys(u).filter((k) => { const v = u[k]; return typeof v === "string" || typeof v === "number" || typeof v === "boolean"; }).slice(0, 8).map((k) => k + "=" + String(u[k]).slice(0, 24)).join(" "),
                    knoten: ["colorNode", "positionNode", "normalNode", "opacityNode", "emissiveNode", "fragmentNode", "outputNode", "maskNode", "castShadowNode"].filter((k) => m[k]).join(","),
                    attr: Object.keys((ro.geometry && ro.geometry.attributes) || {}).join(","),
                    flags: [m.transparent ? "transp" : "", m.side === 2 ? "double" : m.side === 1 ? "back" : "", m.vertexColors ? "vcol" : "", m.flatShading ? "flat" : "", m.map ? "map" : "", m.alphaTest ? "alphaTest" : ""].filter(Boolean).join(","),
                });
            }
            return out;
        };
        N.__k17 = true;
        if (window.__k17Ungedrosselt) r.constructor.ERST_BAU_MS = 1e9; // Versuch: keine Drossel bis zum ersten Bild
        L.gehuellt = Math.round(performance.now());
        return true;
    };
    const iv = setInterval(() => {
        if (huelle()) clearInterval(iv);
    }, 1);
};
(async () => {
    const profil = path.resolve(profilArg);
    const zweit = fs.existsSync(profil);
    fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({ headless: false, userDataDir: profil, protocolTimeout: 600000,
        defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 }, args: [...echteWebGpuArgs(), "--window-size=1940,1200"] });
    const page = await browser.newPage();
    if (process.env.K17_UNGEDROSSELT === "1") await page.evaluateOnNewDocument(() => { window.__k17Ungedrosselt = true; });
    await page.evaluateOnNewDocument(HOOK);
    const fehler = [];
    page.on("pageerror", (e) => fehler.push("pageerror " + String(e.message).slice(0, 300)));
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" || /TSL|WGSL|Stoff-Bruch|ERROR/.test(t)) fehler.push(m.type() + " " + t.slice(0, 300)); });
    const t0 = Date.now();
    await page.goto(seite + "/index.html", { waitUntil: "domcontentloaded", timeout: 120000 });
    let da = 0;
    while (Date.now() - t0 < 120000) {
        da = await page.evaluate(() => (window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa) || 0).catch(() => 0);
        if (da) break;
        await new Promise((r) => setTimeout(r, 250));
    }
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const E = r && r._erstZeichnung;
        const sch = {}; const tore = {}; if (r && r.state && r.state.scene) r.state.scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) { const u = m.userData || {}; let k = null; try { k = m.customProgramCacheKey(); } catch (e) { k = "ERR"; } if (u.foundrySignatur) { const g = (sch[u.foundrySignatur] = sch[u.foundrySignatur] || { stoffe: new Set(), schluessel: new Set() }); g.stoffe.add(m.uuid); g.schluessel.add(k); } if (u.portalMembran || u.portalNebel) { const g = (tore[u.portalMembran ? "membran" : "nebel"] = tore[u.portalMembran ? "membran" : "nebel"] || { stoffe: new Set(), schluessel: new Set() }); g.stoffe.add(m.uuid); g.schluessel.add(k); } } }); const flach = (o) => Object.fromEntries(Object.entries(o).map(([k, g]) => [k, { stoffe: g.stoffe.size, schluessel: g.schluessel.size }]));
        return Object.assign({}, window.__bau, { signaturen: flach(sch), tore: flach(tore), erst: E ? { bauN: E.bauN, bauMs: Math.round(E.bauMs), verschoben: E.verschoben, pipeAsync: E.pipeAsync, neubauN: E.neubauN } : null });
    });
    await browser.close();
    out.weltbild = Math.round(da);
    out.fehler = fehler.slice(0, 40);
    out.zweit = zweit;
    fs.writeFileSync(datei, JSON.stringify(out, null, 1));
    const vor = out.liste.filter((b) => b.t <= da);
    const echt = vor.filter((b) => b.gebaut);
    const sum = (a) => a.reduce((s, b) => s + b.ms, 0);
    console.log(`fehler=${fehler.length} ${fehler.slice(0, 3).join(" | ")}`);
    console.log(`${zweit ? "ZWEIT" : "KALT"}: Weltbild ${(da / 1000).toFixed(2)} s · Bauten bis dahin ${echt.length} echt / ${vor.length} erst-geholt (${(sum(vor) / 1000).toFixed(2)} s; Haupt ${echt.filter((b) => !b.schatten).length}, Schatten ${echt.filter((b) => b.schatten).length}), danach ${out.liste.length - vor.length} · gehüllt ab ${out.gehuellt} ms · Zähler der Welt ${JSON.stringify(out.erst)}`);
})().catch((e) => { console.error("ABBRUCH " + e.message); process.exit(2); });

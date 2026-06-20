// MESS-PROBE (Shader-Frage des Schöpfers „ist nicht der Shader das Problem?"):
// die Zahl der UNIQUE Materialien = die Zahl der GPU-Pipelines, die kompiliert
// + pro Frame umgeschaltet werden müssen. Reine Szene-Traversierung, KEIN
// Rastern → headless ehrlich (swiftshader-unabhängig). Material-Fragmentierung
// ist die Shader-KOMPILATIONS-Last (jede unique = ein Pipeline-Build = ein
// potenzieller Stall) + die State-Switch-Last pro Frame. Bricht nach Typ +
// Foliage-Anteil auf.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4398;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 580000, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try { r._gameLoopTick(performance.now()); } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm, s = r.state;
        const scene = s.scene;
        if (!scene) return { error: "no scene" };
        const mats = new Map(); // uuid → {type, count(meshes), name, transparent, foliage}
        let drawCalls = 0, transparentDraws = 0, foliageDraws = 0, foliageTransparent = 0;
        const isFoliage = (node) => {
            const u = node.userData || {};
            if (u.archInstanceKey) return true;
            const nm = (node.name || "") + " " + ((node.material && node.material.name) || "");
            return /laub|foliage|leaf|blatt|grass|gras|baum|busch|blume|kiesel|fels/i.test(nm) || node.isInstancedMesh;
        };
        scene.traverse((node) => {
            if ((!node.isMesh && !node.isInstancedMesh) || !node.visible) return;
            let cur = node.parent, vis = true;
            while (cur) { if (!cur.visible) { vis = false; break; } cur = cur.parent; }
            if (!vis) return;
            const m = node.material;
            const list = Array.isArray(m) ? m : [m];
            const fol = isFoliage(node);
            for (const mat of list) {
                if (!mat) continue;
                drawCalls++;
                if (mat.transparent) transparentDraws++;
                if (fol) { foliageDraws++; if (mat.transparent) foliageTransparent++; }
                const e = mats.get(mat.uuid);
                if (e) e.count++;
                else mats.set(mat.uuid, { type: mat.type, name: mat.name || "", transparent: !!mat.transparent, foliage: fol, count: 1 });
            }
        });
        // nach Typ + Foliage gruppieren
        const byType = {};
        let foliageMats = 0, transparentMats = 0;
        for (const e of mats.values()) {
            byType[e.type] = (byType[e.type] || 0) + 1;
            if (e.foliage) foliageMats++;
            if (e.transparent) transparentMats++;
        }
        return {
            uniqueMaterials: mats.size,
            drawCalls,
            transparentDraws,
            foliageDraws,
            foliageTransparent,
            foliageMats,
            transparentMats,
            byType,
            archInstanceGroups: s.archInstanceGroups ? s.archInstanceGroups.size : -1,
        };
    });
    console.log("\n===== MATERIAL-/PIPELINE-ZENSUS (Shader-Kompilations-Last) =====\n");
    if (out.error) { console.log("FEHLER: " + out.error); }
    else {
        console.log("  UNIQUE Materialien (= GPU-Pipelines zu kompilieren): " + out.uniqueMaterials);
        console.log("    davon Foliage-bezogen: " + out.foliageMats + " · transparent (Alpha-Karten): " + out.transparentMats);
        console.log("\n  nach Typ:");
        for (const [t, n] of Object.entries(out.byType).sort((a, b) => b[1] - a[1])) console.log("    " + t.padEnd(28) + n);
        console.log("\n  DRAW-CALLS: " + out.drawCalls + " · davon transparent: " + out.transparentDraws + " (Overdraw-Last)");
        console.log("  Foliage-Draws: " + out.foliageDraws + " · davon transparent: " + out.foliageTransparent);
        console.log("  archInstanceGroups (HISM): " + out.archInstanceGroups);
    }
    console.log("\n================================================================\n");
    await browser.close();
    server.close();
    process.exit(0);
})().catch((e) => { console.error("CRASH:", e); process.exit(2); });

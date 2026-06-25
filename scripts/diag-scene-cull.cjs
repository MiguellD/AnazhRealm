#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-scene-cull.cjs — DIE SZENE-CULL-LINSE (schnell, null-renderer, ~12 s)
//
// Wo lebt die VIEW-UNABHÄNGIGE Last (frustumCulled=false → rendert egal wohin man
// schaut)? Das ist der „kann mich nicht umsehen"-Hebel. Diese Linse bricht die GANZE
// Szene nach Kategorie × Cull-Status auf — und nutzt `perObjectFrustumCulled` (die
// GPU-per-Instanz-Cullung der BatchedMesh) korrekt (sonst zählt sie ein Batch falsch
// als Phantom). Null-Renderer = die CPU-Geometrie ist da, kein swiftshader nötig.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4362;
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
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 160; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const scene = st.scene;
            const triOf = (geo) =>
                !geo || !geo.attributes || !geo.attributes.position
                    ? 0
                    : geo.index
                      ? geo.index.count / 3
                      : geo.attributes.position.count / 3;
            const cat = (node) => {
                const u = node.userData || {};
                if (u.voxelChunkX != null || u.isVoxelChunk) return "terrain";
                if (u._creatureSkin || u._creatureFace) return "creature";
                if (node === st.playerMesh || (st.playerMesh && node.parent === st.playerMesh)) return "avatar";
                const nm = (node.name || "") + " " + ((node.material && node.material.name) || "");
                if (/grass|gras/i.test(nm)) return "grass";
                if (/water|wasser|iso/i.test(nm)) return "water";
                if (/star|sky|himmel|planet|mantle|horizon/i.test(nm)) return "sky";
                if (u.useFlexAttr || u.foliageLeaf || u.archInstanceKey || /laub|foliage|leaf|blatt/i.test(nm))
                    return "foliage";
                return "other";
            };
            const acc = {};
            const other = {}; // V18.362 — „other" nach echter Quelle aufschlüsseln (V18.266/.307: die Sammel-Kategorie versteckt den Schuldigen)
            scene.traverse((n) => {
                if (!n.visible) return;
                const isMesh = n.isMesh || n.isInstancedMesh || n.isBatchedMesh;
                if (!isMesh || !n.geometry) return;
                let inst = 1;
                if (n.isInstancedMesh) inst = n.count || 0;
                else if (n.isBatchedMesh) inst = n._geometryCount || n.instanceCount || 1;
                const tris = triOf(n.geometry) * (n.isInstancedMesh ? inst : 1);
                const trulyNoCull = n.frustumCulled === false && n.perObjectFrustumCulled !== true;
                const c = cat(n);
                if (!acc[c]) acc[c] = { tris: 0, meshes: 0, noCullTris: 0, noCullMeshes: 0, inst: 0 };
                acc[c].tris += tris;
                acc[c].meshes += 1;
                acc[c].inst += inst;
                if (trulyNoCull) {
                    acc[c].noCullTris += tris;
                    acc[c].noCullMeshes += 1;
                }
                if (c === "other") {
                    const u = n.userData || {};
                    const ukeys = Object.keys(u).slice(0, 3).join(",");
                    const sig = `${n.isInstancedMesh ? "inst" : n.isBatchedMesh ? "batch" : "mesh"}·${(n.material && (n.material.name || n.material.type)) || "?"}·tpg${triOf(n.geometry)}·u[${ukeys}]·n[${(n.name || "").slice(0, 18)}]`;
                    if (!other[sig]) other[sig] = { tris: 0, meshes: 0, inst: 0 };
                    other[sig].tris += tris;
                    other[sig].meshes += 1;
                    other[sig].inst += inst;
                }
            });
            return { acc, other };
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Szene-Cull-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const fmt = (n) =>
        n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : "" + Math.round(n);
    const cats = Object.keys(out.acc).sort((a, b) => out.acc[b].tris - out.acc[a].tris);
    let total = 0,
        totalNoCull = 0;
    for (const c of cats) {
        total += out.acc[c].tris;
        totalNoCull += out.acc[c].noCullTris;
    }
    console.log("\n=== Szene-Last nach Kategorie × Cull-Status (Null-Renderer) ===");
    console.log("  KATEGORIE     Σ-Tris      %     Meshes   |  NIE-GECULLT (view-unabh.)");
    for (const c of cats) {
        const a = out.acc[c];
        const pct = total ? ((a.tris / total) * 100).toFixed(0) : 0;
        console.log(
            `  ${c.padEnd(12)} ${fmt(a.tris).padStart(8)} ${String(pct).padStart(4)}%  ${String(a.meshes).padStart(6)}   |  ${fmt(a.noCullTris).padStart(8)} (${a.noCullMeshes} Meshes)`
        );
    }
    console.log(`  ${"—".repeat(58)}`);
    console.log(
        `  ${"TOTAL".padEnd(12)} ${fmt(total).padStart(8)}        |  ${fmt(totalNoCull).padStart(8)} view-unabhängig (${total ? ((totalNoCull / total) * 100).toFixed(0) : 0}%)`
    );
    if (out.other) {
        const sigs = Object.keys(out.other)
            .sort((a, b) => out.other[b].tris - out.other[a].tris)
            .slice(0, 14);
        console.log("\n  „other" + '"' + " nach Quelle (Σ-Tris · Meshes · Σ-Instanzen):");
        for (const s of sigs) {
            const o = out.other[s];
            console.log(
                `    ${fmt(o.tris).padStart(8)} · ${String(o.meshes).padStart(4)}m · ${String(o.inst).padStart(6)}i  ${s}`
            );
        }
    }
    console.log("");
    process.exit(0);
})();

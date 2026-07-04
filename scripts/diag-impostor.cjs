// V18.388 — DIE KRONE (K5-IMPOSTOR) LINSE: beweist headless, dass der ferne
// Baum (LOD2) durch den EINEN Skeleton-Leaf/HISM-Pfad als gekreuztes Impostor-
// Billboard baut (3 Quads = 18 Verts) statt Rinde+~hundert Blatt-Karten, und
// dass der Tree-Silhouetten-Atlas je (Art,Variante) EINMAL gebacken + gecacht
// wird. GPU-frei (Null-Renderer) — die MECHANIK, nicht der LOOK.
const http = require("http");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const PORT = 4419;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 200000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.voxelChunks && r.state.voxelChunks.size > 4) break;
            }
            await new Promise((res) => setTimeout(res, 8));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { impostorErr: window.__impostorAtlasError || null };
        // genVersion muss >=7 sein, sonst hat lod2 kein _skeleton (kein Impostor-Pfad).
        out.genV = typeof r._genVersion === "function" ? r._genVersion() : null;
        const species = "baum_eiche";
        // die drei LOD-Baupläne wachsen lassen (setzt _skeleton auf lod2).
        const keys = r._buildVariantLODs(species, 0);
        out.keys = keys;
        if (!keys || !keys[2]) return Object.assign(out, { err: "keine lod-keys" });
        const bpL2 = r.state.blueprints[keys[2]];
        out.lod2HasSkeleton = !!(bpL2 && bpL2._skeleton && Array.isArray(bpL2._skeleton.branches));
        out.lod2Level = bpL2 && bpL2._lodLevel;

        // Flatten lod2 → sollte EIN Impostor-Leaf sein (Cross-Quad = 18 Verts).
        const flat2 = r._archFlattenBlueprint(keys[2]);
        out.l2_instanceable = flat2 && flat2.instanceable;
        out.l2_leafCount = flat2 && flat2.leaves ? flat2.leaves.length : 0;
        if (flat2 && flat2.leaves && flat2.leaves[0]) {
            const g = flat2.leaves[0].geom;
            out.l2_verts = g.attributes.position ? g.attributes.position.count : 0;
            out.l2_hasUv = !!g.attributes.uv;
            out.l2_hasFlex = !!g.attributes.aFlex;
            const m = flat2.leaves[0].mat;
            out.l2_matIsNode = !!(m && m.isNodeMaterial);
            out.l2_useInstanceTint = !!(m && m.userData && m.userData.useInstanceTint);
            out.l2_alphaTest = m ? m.alphaTest : null;
            // aFlex crown-weighting: base verts flex 0, top verts flex 1
            if (g.attributes.aFlex && g.attributes.position) {
                const fa = g.attributes.aFlex.array,
                    pa = g.attributes.position.array;
                let minF = 1e9,
                    maxF = -1e9,
                    topFlex = -1,
                    baseFlex = -1,
                    maxY = -1e9;
                for (let i = 0; i < fa.length; i++) {
                    if (fa[i] < minF) minF = fa[i];
                    if (fa[i] > maxF) maxF = fa[i];
                    if (pa[i * 3 + 1] > maxY) maxY = pa[i * 3 + 1];
                }
                for (let i = 0; i < fa.length; i++) {
                    if (pa[i * 3 + 1] < 0.01) baseFlex = Math.max(baseFlex, fa[i]);
                    if (pa[i * 3 + 1] > maxY - 0.01) topFlex = Math.max(topFlex, fa[i]);
                }
                out.l2_flexRange = [+minF.toFixed(3), +maxF.toFixed(3)];
                out.l2_baseFlex = +baseFlex.toFixed(3);
                out.l2_topFlex = +topFlex.toFixed(3);
            }
        }

        // Atlas: gebacken + gecacht (idempotent → EINE Instanz je Key).
        out.atlasMapSize = r._impostorAtlasMap ? r._impostorAtlasMap.size : 0;
        const key = species + "|0";
        const a1 = r._ensureImpostorAtlas(key, bpL2._skeleton);
        const a2 = r._ensureImpostorAtlas(key, bpL2._skeleton);
        out.atlasBaked = !!a1;
        out.atlasCached = a1 === a2; // gleiche Instanz → EINMAL-Bake
        out.atlasIsTexture = !!(a1 && a1.isTexture);

        // lod0 zum Vergleich: NICHT Impostor (Rinde+Karten, viele Verts).
        const flat0 = r._archFlattenBlueprint(keys[0]);
        out.l0_leafCount = flat0 && flat0.leaves ? flat0.leaves.length : 0;
        let l0verts = 0;
        if (flat0 && flat0.leaves)
            for (const lf of flat0.leaves)
                l0verts += lf.geom.attributes.position ? lf.geom.attributes.position.count : 0;
        out.l0_totalVerts = l0verts;

        // A/B: Toggle aus → lod2 fällt auf Karten (viele Verts) zurück.
        r.state.treeImpostors = false;
        r.state.archFlattenCache && r.state.archFlattenCache.delete(keys[2]);
        r.state.archMergedGeomCache && r.state.archMergedGeomCache.delete(keys[2]);
        const flat2off = r._archFlattenBlueprint(keys[2]);
        let offVerts = 0;
        if (flat2off && flat2off.leaves)
            for (const lf of flat2off.leaves)
                offVerts += lf.geom.attributes.position ? lf.geom.attributes.position.count : 0;
        out.l2_off_leafCount = flat2off && flat2off.leaves ? flat2off.leaves.length : 0;
        out.l2_off_totalVerts = offVerts;
        r.state.treeImpostors = true;
        return out;
    });

    report.pageErr = pageErr;
    // Verdikt
    const ok =
        !report.pageErr &&
        report.lod2HasSkeleton === true &&
        report.l2_instanceable === true &&
        report.l2_leafCount === 1 &&
        report.l2_verts === 18 &&
        report.l2_hasUv &&
        report.l2_hasFlex &&
        report.l2_matIsNode === true &&
        report.l2_useInstanceTint === true &&
        report.l2_alphaTest === 0.5 &&
        report.l2_baseFlex === 0 &&
        report.l2_topFlex === 1 &&
        report.atlasBaked &&
        report.atlasCached &&
        report.atlasIsTexture &&
        report.l2_off_totalVerts > report.l2_verts && // Toggle-off = mehr Geometrie (Karten)
        report.l0_totalVerts > report.l2_verts;
    console.log(JSON.stringify(report, null, 2));
    console.log(
        ok
            ? "\n✅ IMPOSTOR-MECHANIK OK (lod2 = 18-Vert Cross-Billboard, Atlas einmal gebacken, Toggle A/B)"
            : "\n❌ IMPOSTOR-MECHANIK verletzt"
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

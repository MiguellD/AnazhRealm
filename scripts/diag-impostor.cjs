// V18.388/.390 — DIE KRONE (8-VIEW-IMPOSTOR) LINSE: beweist headless, dass der
// ferne Baum (LOD2) durch den EINEN Skeleton-Leaf/HISM-Pfad als EIN camera-facing
// Billboard-Quad baut (6 Verts, Achsen-Anker + aImpX + Rotations-Probe-Normale)
// statt Rinde+~hundert Blatt-Karten, dass der 8-View-Atlas-RECORD je (Art,Variante)
// EINMAL erzeugt + gecacht wird (Atlas-Breite = 8×Zellbreite, Normal-Atlas dabei),
// und dass headless der Canvas-FALLBACK trägt (rttBaked=false — der RTT-Bake ist
// echter-Renderer-only, gate-treu). GPU-frei (Null-Renderer) — MECHANIK, nicht LOOK.
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

        // Flatten lod2 → sollte EIN Impostor-Leaf sein (camera-facing Quad = 6 Verts).
        const flat2 = r._archFlattenBlueprint(keys[2]);
        out.l2_instanceable = flat2 && flat2.instanceable;
        out.l2_leafCount = flat2 && flat2.leaves ? flat2.leaves.length : 0;
        if (flat2 && flat2.leaves && flat2.leaves[0]) {
            const g = flat2.leaves[0].geom;
            out.l2_verts = g.attributes.position ? g.attributes.position.count : 0;
            out.l2_hasUv = !!g.attributes.uv;
            out.l2_hasFlex = !!g.attributes.aFlex;
            // V18.390 — camera-facing: ALLE Positionen liegen auf der Stammachse
            // (x=z=0, die Ecke legt der Shader per aImpX an) + der Rotations-Probe
            // (Geometrie-Normale = (1,0,0)) + signierter aImpX (±halfW).
            out.l2_hasImpX = !!g.attributes.aImpX;
            if (g.attributes.position && g.attributes.aImpX && g.attributes.normal) {
                const pa = g.attributes.position.array;
                const na = g.attributes.normal.array;
                const xa = g.attributes.aImpX.array;
                let onAxis = true,
                    probeOk = true,
                    minX = 1e9,
                    maxX = -1e9;
                for (let i = 0; i < g.attributes.position.count; i++) {
                    if (Math.abs(pa[i * 3]) > 1e-6 || Math.abs(pa[i * 3 + 2]) > 1e-6) onAxis = false;
                    if (
                        Math.abs(na[i * 3] - 1) > 1e-6 ||
                        Math.abs(na[i * 3 + 1]) > 1e-6 ||
                        Math.abs(na[i * 3 + 2]) > 1e-6
                    )
                        probeOk = false;
                    if (xa[i] < minX) minX = xa[i];
                    if (xa[i] > maxX) maxX = xa[i];
                }
                out.l2_onAxis = onAxis;
                out.l2_probeNormal = probeOk;
                out.l2_impXSigned = minX < 0 && maxX > 0 && Math.abs(minX + maxX) < 1e-4;
            }
            const m = flat2.leaves[0].mat;
            out.l2_matIsNode = !!(m && m.isNodeMaterial);
            out.l2_useInstanceTint = !!(m && m.userData && m.userData.useInstanceTint);
            out.l2_alphaTest = m ? m.alphaTest : null;
            // V18.390 — der Billboard-positionNode + Linsen-Marker (camera-facing verdrahtet).
            out.l2_billboard = !!(m && m.userData && m.userData.impostorBillboard);
            out.l2_hasPositionNode = !!(m && m.positionNode);
            out.l2_hasNormalNode = !!(m && m.normalNode);
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

        // Atlas-RECORD: erzeugt + gecacht (idempotent → EIN Record je Key).
        out.atlasMapSize = r._impostorAtlasMap ? r._impostorAtlasMap.size : 0;
        const key = species + "|0";
        const a1 = r._ensureImpostorAtlas(key, bpL2._skeleton);
        const a2 = r._ensureImpostorAtlas(key, bpL2._skeleton);
        out.atlasBaked = !!a1;
        out.atlasCached = a1 === a2; // gleiche Instanz → EINMAL-Erzeugung
        out.atlasIsTexture = !!(a1 && a1.map && a1.map.isTexture);
        // V18.390 — 8 VIEWS: Atlas-Breite = views × Zellbreite (8×128 = 1024),
        // Höhe = Zellhöhe (256); der NORMAL-Atlas existiert in denselben Maßen.
        out.atlasViews = a1 ? a1.views : 0;
        out.atlasWidth8x = !!(
            a1 &&
            a1.map &&
            a1.map.image &&
            a1.map.image.width === a1.views * a1.cellW &&
            a1.map.image.height === a1.cellH
        );
        out.atlasHasNormal = !!(
            a1 &&
            a1.nmap &&
            a1.nmap.isTexture &&
            a1.nmap.image &&
            a1.nmap.image.width === a1.views * a1.cellW
        );
        // headless (Null-Renderer) → der RTT-Bake läuft NIE, der Canvas-Fallback
        // trägt (gate-treu); die Bake-Queue bleibt leer/der Record unbebacken.
        out.headlessFallback = a1 ? a1.rttBaked === false : false;
        out.rttError = window.__impostorRttError || null;

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
        report.l2_verts === 6 && // EIN camera-facing Quad (V18.390)
        report.l2_hasUv &&
        report.l2_hasFlex &&
        report.l2_hasImpX === true &&
        report.l2_onAxis === true && // alle Verts auf der Stammachse (der Shader legt die Ecke an)
        report.l2_probeNormal === true && // Rotations-/Skalen-Probe (1,0,0)
        report.l2_impXSigned === true &&
        report.l2_billboard === true && // camera-facing Material-Marker
        report.l2_hasPositionNode === true &&
        report.l2_hasNormalNode === true && // per-Fragment-Licht aus dem Normal-Atlas
        report.l2_matIsNode === true &&
        report.l2_useInstanceTint === true &&
        report.l2_alphaTest === 0.34 && // Vorlagen-ath
        report.l2_baseFlex === 0 &&
        report.l2_topFlex === 1 &&
        report.atlasBaked &&
        report.atlasCached &&
        report.atlasIsTexture &&
        report.atlasViews === 8 && // 8 Blickwinkel (SpeedTree-Multi-View)
        report.atlasWidth8x === true && // Atlas-Breite = 8×Zellbreite
        report.atlasHasNormal === true && // Normal-Atlas existiert
        report.headlessFallback === true && // headless trägt der Canvas-Fallback (gate-treu)
        report.l2_off_totalVerts > report.l2_verts && // Toggle-off = mehr Geometrie (Karten)
        report.l0_totalVerts > report.l2_verts;
    console.log(JSON.stringify(report, null, 2));
    console.log(
        ok
            ? "\n✅ IMPOSTOR-MECHANIK OK (lod2 = camera-facing 6-Vert-Quad, 8-View-Atlas + Normal-Atlas, headless Canvas-Fallback, Toggle A/B)"
            : "\n❌ IMPOSTOR-MECHANIK verletzt"
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

// V18.213 — Diag: misst die Draw-Call-Reduktion durch Mesh-Merge.
// Vergleicht (a) Per-Part-Pfad (gen<6, V18.211 form, 75-80 leaves/Variante)
// gegen (b) Merged-Pfad (gen>=6, V18.213 form, ~2 leaves/Variante). Same
// Bauplan, derselbe Tag-Vektor — nur das Render-Modell unterscheidet sich.
//
// Akzeptanz (gigant-fortsetzung-plan §1): ein gemerged Bauplan liefert
// ≤4 Leaves (typisch 2 für holz+laub), die Per-Part-Variante 50-80 Leaves.
// Faktor: ~30× weniger InstancedMeshes pro Variante.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.DIAG_PORT) || 4319;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Pumpen bis Welt + Spieler stehen.
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 15000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 5) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
        // Vegetation cold-spawn — pumpe noch, bis ein paar Bauplan-Spawns da sind.
        const r = window.anazhRealm;
        for (let i = 0; i < 200; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            await new Promise((resolve) => setTimeout(resolve, 4));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { perPart: {}, merged: {}, world: {} };

        // ─── WARM-WELT-DIAGNOSE: was ist in der echten Welt da? ─────
        // Wie viele grown-Baupläne hat die Welt jetzt?
        const grownBps = Object.keys(r.state.blueprints).filter(
            (k) => r.state.blueprints[k] && r.state.blueprints[k]._isGrown
        );
        out.world.grownBpCount = grownBps.length;
        if (grownBps.length > 0) {
            const sampleBp = r.state.blueprints[grownBps[0]];
            out.world.sampleBpName = grownBps[0];
            out.world.sampleBpParts = sampleBp.parts.length;
            out.world.sampleBpIsMerged = !!sampleBp._isMerged;
            // Echte Affordance + Flatten in der warmgelaufenen Welt.
            const aff = r.computeBlueprintAffordances(sampleBp);
            out.world.sampleAffMoveable = aff.moveable === true;
            const flat = r._archFlattenBlueprint(grownBps[0]);
            out.world.sampleFlatLeaves = flat ? flat.leaves.length : -1;
            out.world.sampleFlatReason = flat ? flat.reason : "no-flat";
            out.world.sampleFlatInstanceable = flat ? flat.instanceable : false;
            out.world.sampleFlatMergedFlag = flat ? !!flat.merged : false;
        }
        out.world.archInstanceGroupCount = r.state.archInstanceGroups ? r.state.archInstanceGroups.size : 0;
        out.world.archMergedGeomCacheSize = r.state.archMergedGeomCache ? r.state.archMergedGeomCache.size : 0;
        out.world.archCount = r.state.architectures ? r.state.architectures.length : 0;
        out.world.currentGenVersion = r._genVersion ? r._genVersion() : 0;

        // Den ECHTEN warm-welt-Bauplan als Test-Subjekt wählen: ein
        // _isGrown-Bauplan, der NICHT als moveable klassifiziert wird (sonst
        // läuft er sowieso classic-Pfad, kein HISM, kein Merge-Bedarf).
        // Damit testen wir das Routing an der Substanz, die im realen Spiel
        // 99 %+ des Vegetation-Drucks ausmacht.
        let testBp = null;
        let testKey = null;
        for (const key of Object.keys(r.state.blueprints)) {
            const b = r.state.blueprints[key];
            if (!b || !b._isGrown) continue;
            const aff = r.computeBlueprintAffordances(b);
            if (aff.moveable || aff.magnifying) continue;
            testBp = b;
            testKey = key;
            break;
        }
        if (!testBp) {
            out.error = "kein instancbar-grown-Bauplan in der Welt";
            return out;
        }

        // Cache leeren, sodass die zwei Pfade unverdorben gemessen werden.
        if (r.state.archFlattenCache) r.state.archFlattenCache.delete(testKey);
        if (r.state.archMergedGeomCache) r.state.archMergedGeomCache.delete(testKey);

        // ─── (a) Per-Part-Pfad: _isMerged=false (V18.211 form) ─────
        const origIsMerged = testBp._isMerged;
        testBp._isMerged = false;
        out.perPart.bpName = testKey;
        out.perPart.partCount = testBp.parts.length;
        out.perPart.isMergedFlag = testBp._isMerged === true;
        const flat5 = r._archFlattenBlueprint(testKey);
        out.perPart.leafCount = flat5 ? flat5.leaves.length : -1;
        out.perPart.merged = flat5 ? !!flat5.merged : false;
        out.perPart.instanceable = flat5 ? flat5.instanceable : false;
        out.perPart.reason = flat5 ? flat5.reason : "no-flat";
        out.perPart.bpInstanced = testBp.instanced;
        out.perPart.bpConnections = Array.isArray(testBp.connections) ? testBp.connections.length : "no-array";
        const aff5 = r.computeBlueprintAffordances(testBp);
        out.perPart.affMagnifying = aff5.magnifying;
        out.perPart.affMoveable = aff5.moveable;

        // Cache zurücksetzen — die merged-Variante braucht einen frischen Lauf.
        if (r.state.archFlattenCache) r.state.archFlattenCache.delete(testKey);

        // ─── (b) Merged-Pfad: _isMerged=true (V18.213 form) ───────
        testBp._isMerged = true;
        const tMerge0 = performance.now();
        const flat6 = r._archFlattenBlueprint(testKey);
        const tMerge1 = performance.now();
        out.merged.bpName = testKey;
        out.merged.leafCount = flat6 ? flat6.leaves.length : -1;
        out.merged.merged = flat6 ? !!flat6.merged : false;
        out.merged.instanceable = flat6 ? flat6.instanceable : false;
        out.merged.buildMs = +(tMerge1 - tMerge0).toFixed(2);

        // Pro Leaf: Vertex-Count + Material-Tag-Profil.
        if (flat6 && flat6.leaves) {
            out.merged.leafs = flat6.leaves.map((l) => ({
                vertCount: l.geom.attributes.position.count,
                hasColors: !!l.geom.attributes.color,
                hasNormal: !!l.geom.attributes.normal,
                vertexColorsOnMat: l.mat ? l.mat.vertexColors === true : false,
            }));
        }

        // ─── Reduktions-Faktor ────────────────────────────────────────
        out.reductionFactor =
            out.perPart.leafCount > 0 && out.merged.leafCount > 0
                ? +(out.perPart.leafCount / out.merged.leafCount).toFixed(2)
                : null;

        // Tag-Neutralität: computeCompoundTags identisch in BEIDEN Modi.
        const tags = r.computeCompoundTags(testBp);
        out.tags = {
            lebendig: +(tags.lebendig || 0).toFixed(4),
            dichte: +(tags.dichte || 0).toFixed(4),
            brennbar: +(tags.brennbar || 0).toFixed(4),
            magieleitung: +(tags.magieleitung || 0).toFixed(4),
        };

        // Original-Flag wiederherstellen (defensive — andere Bands danach).
        testBp._isMerged = origIsMerged;

        return out;
    });

    console.log("=== V18.213 WARM-WELT-DIAGNOSE ===");
    console.log(`Welt-genVersion: ${report.world.currentGenVersion}`);
    console.log(`Grown-Baupläne: ${report.world.grownBpCount}, Architekturen: ${report.world.archCount}`);
    console.log(`archInstanceGroups (HISM-Pools): ${report.world.archInstanceGroupCount}`);
    console.log(`archMergedGeomCache: ${report.world.archMergedGeomCacheSize}`);
    if (report.world.sampleBpName) {
        console.log(`Stichprobe Bauplan: ${report.world.sampleBpName}`);
        console.log(`   parts=${report.world.sampleBpParts}, isMerged=${report.world.sampleBpIsMerged}`);
        console.log(`   aff.moveable=${report.world.sampleAffMoveable}`);
        console.log(`   archFlattenBlueprint: leaves=${report.world.sampleFlatLeaves}, reason="${report.world.sampleFlatReason}", inst=${report.world.sampleFlatInstanceable}, merged=${report.world.sampleFlatMergedFlag}`);
    }
    console.log("");
    console.log("=== V18.213 DRAW-CALL-REDUKTION ===");
    console.log("(a) Per-Part-Pfad (V18.211 gen=5):");
    console.log(`   Bauplan: ${report.perPart.bpName}`);
    console.log(`   bp.parts: ${report.perPart.partCount}`);
    console.log(`   bp.instanced: ${report.perPart.bpInstanced}, connections: ${report.perPart.bpConnections}`);
    console.log(`   aff.magnifying: ${report.perPart.affMagnifying}, aff.moveable: ${report.perPart.affMoveable}`);
    console.log(`   archFlattenBlueprint.leaves: ${report.perPart.leafCount}, reason: "${report.perPart.reason}"`);
    console.log(`   merged-Flag: ${report.perPart.merged}, instanceable: ${report.perPart.instanceable}`);
    console.log("");
    console.log("(b) Merged-Pfad (V18.213 gen=6):");
    console.log(`   archFlattenBlueprint.leaves: ${report.merged.leafCount}`);
    console.log(`   merged-Flag: ${report.merged.merged}`);
    console.log(`   Build-Zeit: ${report.merged.buildMs} ms`);
    if (report.merged.leafs) {
        for (let i = 0; i < report.merged.leafs.length; i++) {
            const l = report.merged.leafs[i];
            console.log(`   Leaf ${i}: verts=${l.vertCount}, colors=${l.hasColors}, normal=${l.hasNormal}, matVC=${l.vertexColorsOnMat}`);
        }
    }
    console.log("");
    console.log(`REDUKTIONS-FAKTOR: ${report.reductionFactor}× weniger Leaves pro Variante`);
    console.log("");
    console.log("Tag-Neutralität (V17.16-Wand):");
    if (report.tags) {
        console.log(`   lebendig=${report.tags.lebendig}, dichte=${report.tags.dichte}, brennbar=${report.tags.brennbar}, magieleitung=${report.tags.magieleitung}`);
    }
    console.log("");

    const passed =
        report.perPart.leafCount >= 50 &&
        report.merged.leafCount > 0 && report.merged.leafCount <= 4 &&
        report.merged.merged === true &&
        report.merged.buildMs < 100;
    console.log(passed ? "✓ Akzeptanz: Mesh-Merge schließt 75-80 → ≤4 Leaves in <100ms" : "✗ Akzeptanz verfehlt");

    try {
        fs.writeFileSync(
            path.join(root, "artifacts", "diag-draw-calls.json"),
            JSON.stringify(report, null, 2)
        );
    } catch (_e) {
        // artifacts/ existiert evtl. nicht — Fallback /tmp
        try {
            fs.writeFileSync("/tmp/diag-draw-calls.json", JSON.stringify(report, null, 2));
        } catch (_e2) {
            /* */
        }
    }

    await browser.close();
    server.close();
    process.exit(passed ? 0 : 1);
})();

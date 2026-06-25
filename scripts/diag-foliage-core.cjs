// Diagnose — DER OPAKE KRONEN-KERN (V18.349, Gigant-Perf, das Tierfell-Prinzip).
//
// Die Wurzel der 90 %-Laub-Last ist der OVERDRAW: ~100 überlappende DoubleSide-Alpha-Test-Karten
// pro Krone. Das Tierfell ist effizient, weil es EINE OPAKE Mesh ist (schreibt Tiefe, kein
// Overdraw). Der Fix: eine kleine OPAKE Icosphere INNERHALB der Karten-Wolke jeder LOD0-Krone.
//
// Diese Messung ist HARDWARE-UNABHÄNGIG (reine Geometrie/Material-Logik, KEIN GPU-Render — der
// LOOK [füllt es die Krone schön? pokt es heraus?] bleibt das Schöpfer-Browser-A/B). Sie beweist:
//   (1) der Kern WIRD gebaut (LOD0-Skelett: 2 Leaves → 3, der dritte ist der Kern);
//   (2) der Kern ist OPAK (kein transparent/alphaTest), schreibt also Tiefe (early-Z);
//   (3) der Kern wirft KEINEN Schatten (castShadow:false — kein Look-Eingriff in v1);
//   (4) der Kern SITZT IM Karten-Wolken-BBox (kein Heraus-Poken — die mechanische No-Poke-Wand);
//   (5) der Kern ist BILLIG (80 Tris ≪ die Karten-Hunderte);
//   (6) der Toggle `state.foliageOpaqueCore=false` schaltet ihn ab (2 Leaves);
//   (7) LOD1/LOD2-Skelett bekommt KEINEN Kern (die dünnen, kleinen fernen Bäume).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4408;
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
        protocolTimeout: 300000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
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
    // Warmup nur bis der Realm + die Bauplan-Maschinerie bereit sind (kein Chunk-Bedarf).
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && typeof r._growTreeBlueprintForSpawn === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.blueprints) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
        // ein paar Ticks settlen
        for (let i = 0; i < 20; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = { genV: typeof r._genVersion === "function" ? r._genVersion() : null };
        // Einen LOD0-Skelett-Baum wachsen (genVersion ≥ 7 → bp._skeleton gesetzt).
        const species = ["baum_eiche", "baum_kiefer", "baum_tanne", "baum_birke"];
        let bp = null,
            grownKey = null;
        for (const s of species) {
            const key = r._growTreeBlueprintForSpawn(s, "core-diag-seed");
            if (key && st.blueprints[key] && st.blueprints[key]._skeleton) {
                bp = st.blueprints[key];
                grownKey = key;
                break;
            }
        }
        out.grownKey = grownKey;
        out.hasSkeleton = !!(bp && bp._skeleton);
        if (!bp || !bp._skeleton) return out;
        out.skelLod = bp._skeleton.lodLevel | 0;

        const bboxInside = (inner, outer, tol) => {
            if (!inner || !outer) return null;
            return (
                inner.min.x >= outer.min.x - tol &&
                inner.min.y >= outer.min.y - tol &&
                inner.min.z >= outer.min.z - tol &&
                inner.max.x <= outer.max.x + tol &&
                inner.max.y <= outer.max.y + tol &&
                inner.max.z <= outer.max.z + tol
            );
        };

        // (1) Kern AN: 3 Leaves (bark, foliage, core).
        st.foliageOpaqueCore = true;
        const onEntry = r._buildTreeSkeletonLeaves(bp);
        const onLeaves = (onEntry && onEntry.leaves) || [];
        out.leafCountOn = onLeaves.length;
        if (onLeaves.length >= 3) {
            const foliage = onLeaves[1];
            const core = onLeaves[2];
            out.coreCastShadow = core.castShadow; // erwartet false
            out.coreVerts = core.geom.attributes.position.count; // 240 (≥100-Wand)
            out.coreTris = core.geom.index ? core.geom.index.count / 3 : core.geom.attributes.position.count / 3;
            out.foliageTris = foliage.geom.index
                ? foliage.geom.index.count / 3
                : foliage.geom.attributes.position.count / 3;
            out.coreTriFraction = out.coreTris / Math.max(1, out.foliageTris);
            const m = core.mat;
            out.coreOpaque = !m.transparent && !(m.alphaTest > 0);
            out.coreVertexColors = m.vertexColors === true;
            out.coreHasFlex = !!core.geom.attributes.aFlex;
            out.coreHasColor = !!core.geom.attributes.color;
            // (4) der Kern-BBox sitzt IM Karten-Wolken-BBox (kein Poken).
            foliage.geom.computeBoundingBox();
            core.geom.computeBoundingBox();
            out.coreInsideFoliage = bboxInside(core.geom.boundingBox, foliage.geom.boundingBox, 0.001);
            // identity localMatrix (merged-Pfad-Wand).
            const e = core.localMatrix.elements;
            out.coreIdentity =
                Math.abs(e[0] - 1) < 1e-6 && Math.abs(e[5] - 1) < 1e-6 && Math.abs(e[10] - 1) < 1e-6;
            // eigenes Material (eigene Batch-Signatur → nicht mit den Karten gemischt).
            out.coreMatDistinct = core.mat !== foliage.mat;
        }

        // (6) Toggle AUS → 2 Leaves.
        st.foliageOpaqueCore = false;
        const offEntry = r._buildTreeSkeletonLeaves(bp);
        out.leafCountOff = ((offEntry && offEntry.leaves) || []).length;

        // (7) LOD1-Skelett → kein Kern (Toggle wieder an, lodLevel 1).
        st.foliageOpaqueCore = true;
        const savedLod = bp._skeleton.lodLevel;
        bp._skeleton.lodLevel = 1;
        const lod1Entry = r._buildTreeSkeletonLeaves(bp);
        out.leafCountLod1 = ((lod1Entry && lod1Entry.leaves) || []).length;
        bp._skeleton.lodLevel = savedLod;

        return out;
    });

    console.log("\n===== DER OPAKE KRONEN-KERN — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  genVersion: ${o.genV}   grownKey: ${o.grownKey}   skeleton: ${o.hasSkeleton}   lod: ${o.skelLod}`);
    console.log(`  Leaves (Kern AN):   ${o.leafCountOn}   (erwartet 3 — bark, foliage, core)`);
    console.log(`  Leaves (Kern AUS):  ${o.leafCountOff}   (erwartet 2)`);
    console.log(`  Leaves (LOD1):      ${o.leafCountLod1}   (erwartet 2 — fern, kein Kern)`);
    console.log(`  core castShadow:    ${o.coreCastShadow}   (erwartet false)`);
    console.log(`  core verts:         ${o.coreVerts}   (erwartet 240 — ≥100-Wand)`);
    console.log(
        `  core tris:          ${o.coreTris} vs foliage tris ${o.foliageTris}   (Anteil ${o.coreTriFraction != null ? (o.coreTriFraction * 100).toFixed(1) + "%" : "?"} — billig)`
    );
    console.log(`  core opak:          ${o.coreOpaque}   (kein transparent/alphaTest → schreibt Tiefe)`);
    console.log(`  core vertexColors:  ${o.coreVertexColors}   ·  aFlex ${o.coreHasFlex}  ·  color ${o.coreHasColor}`);
    console.log(`  core IM Karten-BBox: ${o.coreInsideFoliage}   (erwartet true — kein Heraus-Poken)`);
    console.log(`  core identity-Mat:  ${o.coreIdentity}  ·  eigenes Material: ${o.coreMatDistinct}`);

    const ok =
        !pageErr &&
        o.hasSkeleton === true &&
        o.skelLod === 0 &&
        o.leafCountOn === 3 &&
        o.leafCountOff === 2 &&
        o.leafCountLod1 === 2 &&
        o.coreCastShadow === false &&
        o.coreVerts >= 100 &&
        o.coreOpaque === true &&
        o.coreVertexColors === true &&
        o.coreHasFlex === true &&
        o.coreHasColor === true &&
        o.coreInsideFoliage === true &&
        o.coreIdentity === true &&
        o.coreMatDistinct === true &&
        // Der Kern ist ein FIXER, winziger Zusatz (80 Tris) — unabhängig von der Baum-Größe; bei den
        // dichten LOD0-Kronen (die Overdraw-Wurzel) ist der Anteil klein, bei kleinen Bäumen grösser,
        // aber der ABSOLUTE Kosten-Deckel (80 Tris) ist die Wand, nicht der Bruch.
        o.coreTris === 80;
    console.log(
        `\n  ${ok ? "✅ Der opake Kern wird gebaut (LOD0), ist opak+schattenlos+billig, sitzt IM Karten-Wolken-BBox (kein Poken), Toggle+LOD-Gate wirken." : "⚠️ Der Kern-Mechanismus weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

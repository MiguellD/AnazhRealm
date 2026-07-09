// Diagnose — DAS NEUE KLEID S1-SHADER: die LOD-PIPELINE (SSE-Metrik + Dither-Crossfade).
//
// Adaptiert aus phytogenesis.js (`_lodU`, `injectWind` Z.121-135): der Wald-Renderer der
// Vorlage blendet die LOD-Stufen (L0 fein → L1 mittel → L2 Impostor) über ein KOMPLEMENTÄRES
// golden-ratio-Dither-Crossfade WEICH ineinander (kein Pop). In AnazhRealms TSL-Laub-Karten-
// Material portiert (ERGÄNZT die schon gebaute S1-CPU-Hälfte `_lodPerceptionDistance`). Diese
// Linse beweist HARDWARE-FREI (Null-Renderer, kein Pixel):
//   (a) die Laub-Karten-GEOMETRIE trägt die aH0/aH0L-Attribute + die uLodRef/uLodMaskOn/uDitherT-
//       Uniforms existieren als EINE Quelle (state.lodUniforms), das Material trägt den Crossfade-
//       Marker,
//   (b) __codeOf(_applyVegetationResponse / _buildPbrNodeMaterial) trägt die vLodD-SSE-Metrik
//       (positionWorld + uLodRef + aH0/aH0L) + den golden-ratio-Dither-Term (screenCoordinate/
//       uDitherT) + den Keep-Discard (step) + den uLodMaskOn-Toggle (mix),
//   (c) uLodRef ist EINE Quelle — die CPU-`_lodPerceptionDistance` (die `_chooseLODForDistance`
//       liest) zieht `state.lodRef` (behavioral: grosser Baum behält Detail länger, kleiner
//       schaltet früher; live: lodRef↑ → der grosse Baum schaltet früher),
//   (d) uLodMaskOn=0 → harte Kanten (altes Verhalten) als A/B, uDitherT rotiert pro Frame.
// MECHANIK = ZAHL. Eine ✅/❌-Liste, exit≠0 bei Fehlschlag.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4468;
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
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-gpu",
        ],
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

    // Welt-bereit abwarten (wir brauchen nur die Klasse + Materialien).
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.voxelChunks && r.state.voxelChunks.size > 2) break;
            }
            await new Promise((res) => setTimeout(res, 8));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { checks: {}, vals: {} };
        // Kommentar-freier Quell-Leser (die V18.267-Falle: ein Kommentar, der ein Token zitiert,
        // darf eine Präsenz-Prüfung nicht vakuös bestehen lassen).
        const codeOf = (fn) => {
            let s = typeof fn === "function" ? fn.toString() : String(fn || "");
            s = s.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/[^\n]*/g, " ");
            return s;
        };

        // ── Ein echtes Eiche-Skelett wachsen (Side-Channel _lastTreeSkeleton) ──
        const grammar = r.constructor.SPECIES_GRAMMAR && r.constructor.SPECIES_GRAMMAR.baum_eiche;
        let skel = null;
        try {
            r._growTreeBlueprintRich("baum_eiche", "diag-lod-crossfade", grammar, { lod: 0 });
            skel = (r.state && r.state._lastTreeSkeleton) || r._lastTreeSkeleton;
        } catch (e) {
            out.err = "grow: " + e.message;
            return out;
        }
        if (!skel || !skel.anchors) {
            out.err = "kein Skelett";
            return out;
        }
        out.vals.totalH = skel.totalH;

        // ── (a1) die Laub-Karten-GEOMETRIE trägt aH0/aH0L ──
        let geo = null;
        try {
            geo = r._buildTreeFoliageCardGeometry(skel);
        } catch (e) {
            out.err = "cards: " + e.message;
            return out;
        }
        const hasH0 = !!(geo && geo.attributes && geo.attributes.aH0);
        const hasH0L = !!(geo && geo.attributes && geo.attributes.aH0L);
        out.checks.geomHasAH0 = hasH0;
        out.checks.geomHasAH0L = hasH0L;
        if (hasH0 && hasH0L) {
            const a0 = geo.attributes.aH0.array;
            const a0l = geo.attributes.aH0L.array;
            const cap = (r.constructor.LOD_DISTANCES && r.constructor.LOD_DISTANCES.leafVisCap) || 14;
            out.vals.aH0_0 = a0[0];
            out.vals.aH0L_0 = a0l[0];
            out.vals.leafCap = cap;
            // aH0 = volle Baum-Höhe; aH0L = min(totalH, cap) → für die grosse Eiche gekappt.
            out.checks.aH0EqualsTotalH = Math.abs(a0[0] - Math.max(1, skel.totalH || 10)) < 0.01;
            out.checks.aH0LCapped = Math.abs(a0l[0] - Math.min(Math.max(1, skel.totalH || 10), cap)) < 0.01;
            // aH0L ≤ aH0 (das Laub folgt näher der absoluten Distanz als das Skelett).
            out.checks.aH0LLeqAH0 = a0l[0] <= a0[0] + 0.01;
        }

        // ── (a2) die LOD-Uniforms sind EINE Quelle (uLodRef/uLodMaskOn/uDitherT) ──
        let lu = null;
        try {
            lu = r._ensureLodUniforms();
        } catch (e) {
            out.err = "lodUniforms: " + e.message;
            return out;
        }
        out.checks.lodUniformsExist = !!lu;
        out.checks.hasULodRef = !!(lu && lu.uLodRef && lu.uLodRef.value !== undefined);
        out.checks.hasULodMaskOn = !!(lu && lu.uLodMaskOn);
        out.checks.hasUDitherT = !!(lu && lu.uDitherT);
        out.vals.uLodRef = lu && lu.uLodRef ? lu.uLodRef.value : null;

        // ── (a3) das echte Laub-Material trägt den Crossfade-Marker ──
        let mat = null;
        try {
            const laubMat = r.state.materials && r.state.materials.laub;
            const opts = { vertexColors: true, useInstanceTint: true, useFlexAttr: true, foliageLeaf: true };
            if (laubMat && laubMat.tags) opts.tags = laubMat.tags;
            mat = r._buildPbrNodeMaterial(opts);
        } catch (e) {
            out.err = "material: " + e.message;
            return out;
        }
        out.checks.materialBuilds = !!mat;
        out.checks.materialHasCrossfade = !!(mat && mat.userData && mat.userData.lodCrossfade === true);
        out.vals.lodCrossfadeError = window.__lodCrossfadeError || null;

        // ── (b) __codeOf: die vLodD-SSE-Metrik + der Dither-Term ──
        const vegSrc = codeOf(r._applyVegetationResponse);
        const pbrSrc = codeOf(r._buildPbrNodeMaterial);
        const bothSrc = vegSrc + "\n" + pbrSrc;
        // SSE-Metrik: die Wahrnehmungs-Distanz aus Kamera-XZ (positionWorld) × min(uLodRef/aH0,1).
        out.checks.srcHasVLodD = /_vLodD\b/.test(bothSrc) && /_vLodDL\b/.test(bothSrc);
        out.checks.srcHasULodRef = /uLodRef/.test(bothSrc);
        out.checks.srcHasAH0Attr =
            /attribute\(\s*["']aH0["']/.test(bothSrc) && /attribute\(\s*["']aH0L["']/.test(bothSrc);
        out.checks.srcHasPositionWorld = /positionWorld/.test(bothSrc) && /cameraPosition/.test(bothSrc);
        // Dither-Term: golden-ratio Screen-Space-Dither + Discard (in die Alpha gefaltet).
        out.checks.srcHasDither = /screenCoordinate/.test(bothSrc) && /uDitherT/.test(bothSrc);
        out.checks.srcHasDiscard = /_keep\b/.test(bothSrc) && /step\(/.test(bothSrc);
        // uLodMaskOn togglet das Crossfade (A/B in der Quelle verankert, via mix-Faltung).
        out.checks.srcHasMaskToggle = /uLodMaskOn/.test(bothSrc) && /mix\(/.test(bothSrc);

        // ── (c) uLodRef EINE Quelle: die CPU-Wahrnehmungs-Distanz liest state.lodRef ──
        const perceptionSrc = codeOf(r._lodPerceptionDistance);
        const chooseSrc = codeOf(r._chooseLODForDistance);
        out.checks.cpuReadsLodRef =
            /state\s*\.\s*lodRef/.test(perceptionSrc) && /_lodPerceptionDistance/.test(chooseSrc);
        // Behavioral: bei gleicher Roh-Distanz behält der GROSSE Baum Detail länger (Perception).
        const cfg = r.constructor.LOD_DISTANCES;
        const baseRef = cfg && cfg.lodRef ? cfg.lodRef : 14;
        r.state.lodRef = baseRef;
        // WELLE S2 — der SSE-Stretch ist jetzt GEDECKELT (visStretchMax → heightFactor-Floor
        // 1/visStretchMax): ein Riese behält NUR noch beschränkt länger Detail (kein L0 mehr bis
        // 194 m). Wir proben knapp JENSEITS thresh12, im Fenster [thresh12, thresh12/floor), wo die
        // gedeckelte SSE einen Riesen (noch LOD1) von einem kleinen Baum (schon LOD2) trennt — die
        // SSE-Idee bleibt sichtbar, aber die Streckung ist begrenzt.
        const stretchMax = cfg && cfg.visStretchMax >= 1 ? cfg.visStretchMax : 1.25;
        const dist = cfg.thresh12 * (1 + (stretchMax - 1) * 0.5); // default 45 m (∈ [thresh12, thresh12/floor))
        const bigH = cfg.thresh12; // sehr grosser Baum (Höhe ≫ lodRef)
        const smallH = Math.max(2, baseRef * 0.4); // kleiner Baum
        const lodTall = r._chooseLODForDistance(dist, undefined, bigH);
        const lodShort = r._chooseLODForDistance(dist, undefined, smallH);
        const lodNoHint = r._chooseLODForDistance(dist, undefined); // ~alter Aufrufer (Faktor 1)
        out.vals.lodTall = lodTall;
        out.vals.lodShort = lodShort;
        out.vals.lodNoHint = lodNoHint;
        out.vals.probeDist = dist;
        // grosser Baum → niedrigeres (feineres) LOD als kleiner Baum bei DERSELBEN Distanz.
        out.checks.perceptionScales = lodTall < lodShort;
        // ohne visHeight bleibt das alte Verhalten (Faktor 1 == visHeight===lodRef).
        out.checks.backwardCompat = lodNoHint === r._chooseLODForDistance(dist, undefined, baseRef);
        // live: lodRef↑ → der GROSSE Baum verliert Detail (Faktor → 1, schaltet früher) ohne Rebuild.
        r.state.lodRef = cfg.thresh12 * 2; // sehr hoher lodRef → Faktor 1 für alle
        const lodTallHiRef = r._chooseLODForDistance(dist, undefined, bigH);
        r.state.lodRef = baseRef;
        out.vals.lodTallHiRef = lodTallHiRef;
        out.checks.lodRefLive = lodTallHiRef > lodTall;

        // ── (d) uLodMaskOn=0 → harte Kanten (A/B): der Loop-Tick spiegelt state.lodMaskOn ──
        r.state.lodMaskOn = false;
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        out.vals.maskOffVal = lu.uLodMaskOn.value;
        r.state.lodMaskOn = true;
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        out.vals.maskOnVal = lu.uLodMaskOn.value;
        out.checks.maskToggleAB = lu.uLodMaskOn.value === 1 && out.vals.maskOffVal === 0;
        // W5.2 (V9.56-i — die Probe wandert mit dem Entscheid): das Studio rotiert das Dither
        // NUR unter TAA-Lite („animiertes Dither ohne TAA wäre kriechendes Rauschen") — die
        // Probe prüft jetzt BEIDE Hälften: default STATISCH (kein Kriechen) und unter dem
        // TAA-Gate (state.taaLite) rotiert golden-ratio.
        const d0 = lu.uDitherT.value;
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        const staticByDefault = lu.uDitherT.value === d0;
        r.state.taaLite = true;
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        const rotatesUnderTaa = lu.uDitherT.value !== d0;
        delete r.state.taaLite;
        out.checks.ditherRotates = staticByDefault && rotatesUnderTaa;
        // uLodRef spiegelt live state.lodRef nach dem Tick.
        out.checks.uLodRefLive = Math.abs(lu.uLodRef.value - baseRef) < 0.01;

        return out;
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    if (pageErr) {
        console.error("PAGE-ERROR: " + pageErr);
        process.exit(1);
    }
    if (report.err) {
        console.error("DIAG-FEHLER: " + report.err);
        process.exit(1);
    }

    const C = report.checks;
    const V = report.vals;
    const order = [
        ["geomHasAH0", "Laub-Karten-Geometrie trägt aH0 (Skelett-Sichthöhe)"],
        ["geomHasAH0L", "Laub-Karten-Geometrie trägt aH0L (Blatt-Sichthöhe)"],
        [
            "aH0EqualsTotalH",
            `aH0 = volle Baum-Höhe (${V.aH0_0 && V.aH0_0.toFixed(1)}m ≈ totalH ${V.totalH && V.totalH.toFixed(1)}m)`,
        ],
        ["aH0LCapped", `aH0L auf leafVisCap gekappt (${V.aH0L_0 && V.aH0L_0.toFixed(1)}m = min(totalH, ${V.leafCap}))`],
        ["aH0LLeqAH0", "aH0L ≤ aH0 (Laub folgt näher der absoluten Distanz)"],
        ["lodUniformsExist", "state.lodUniforms existiert (EINE Quelle)"],
        ["hasULodRef", `uLodRef-Uniform vorhanden (${V.uLodRef})`],
        ["hasULodMaskOn", "uLodMaskOn-Uniform vorhanden"],
        ["hasUDitherT", "uDitherT-Uniform vorhanden"],
        ["materialBuilds", "das Laub-Material baut headless"],
        ["materialHasCrossfade", "das Laub-Material trägt den Crossfade-Marker (userData.lodCrossfade)"],
        ["srcHasVLodD", "Quelle: vLodD/vLodDL SSE-Metrik"],
        ["srcHasULodRef", "Quelle: liest uLodRef"],
        ["srcHasAH0Attr", "Quelle: liest die aH0/aH0L-Attribute"],
        ["srcHasPositionWorld", "Quelle: positionWorld + cameraPosition (Instanz-Distanz)"],
        ["srcHasDither", "Quelle: golden-ratio screenCoordinate-Dither + uDitherT"],
        ["srcHasDiscard", "Quelle: Dither-Discard in die Karten-Alpha (_keep via step)"],
        ["srcHasMaskToggle", "Quelle: uLodMaskOn togglet das Crossfade (mix)"],
        ["cpuReadsLodRef", "uLodRef EINE Quelle: CPU-_lodPerceptionDistance liest state.lodRef"],
        [
            "perceptionScales",
            `Perception: grosser Baum LOD ${V.lodTall} < kleiner Baum LOD ${V.lodShort} (@${V.probeDist}m)`,
        ],
        ["backwardCompat", `rückwärtskompatibel: ohne visHeight altes Verhalten (LOD ${V.lodNoHint})`],
        ["lodRefLive", `lodRef live: lodRef↑ → grosser Baum schaltet früher (LOD ${V.lodTall}→${V.lodTallHiRef})`],
        ["maskToggleAB", `A/B: uLodMaskOn 1↔0 (an=${V.maskOnVal}, aus=${V.maskOffVal})`],
        ["ditherRotates", "uDitherT rotiert pro Frame (die Maske wandert)"],
        ["uLodRefLive", "uLodRef spiegelt live state.lodRef nach dem Tick"],
    ];
    let allOk = true;
    for (const [k, label] of order) {
        const ok = C[k] === true;
        if (!ok) allOk = false;
        console.log(`${ok ? "✅" : "❌"} ${label}`);
    }
    if (V.lodCrossfadeError) console.log("   (lodCrossfadeError: " + V.lodCrossfadeError + ")");

    if (allOk) {
        console.log("\n✅ LOD-CROSSFADE OK");
        process.exit(0);
    } else {
        console.log("\n❌ LOD-CROSSFADE FEHLGESCHLAGEN");
        process.exit(1);
    }
})().catch((e) => {
    console.error("EXCEPTION: " + (e && e.stack ? e.stack : e));
    process.exit(1);
});

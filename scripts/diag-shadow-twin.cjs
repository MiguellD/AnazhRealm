// Diagnose — DER SCHATTEN-ZWILLING AUF 3D ÜBERSETZT (V18.389, DAS NEUE KLEID P4).
//
// Die Vorlage (worlds/terrain/phytogenesis.js Z.1844-1852/1895) trennt SICHTBAR und SCHATTEN in
// getrennte Layer: das Anzeige-Laub (Blätter/Gras) liegt auf Layer 1 und castet SELBST NIE
// (`im.castShadow=false`); ein SEPARATER, opaker „shadowProxy" (Layer 2, `castShadow=true`,
// `layers.set(2)`) trägt den Kronen-Schatten — kein Alpha-Test-Schatten-Rauschen der Karten, ein
// sauberer solider Kronen-Schatten. Der Schatten-Bake enabled alle Layer (`camera.layers.enableAll()`),
// die Anzeige-Kamera sieht Layer 2 NIE.
//
// AnazhRealm-Übersetzung (VOLL, nicht der vereinfachte 80-Tri-Kern von V18.387): ein DEDIZIERTER
// opaker Schatten-Caster je LOD0-Krone — eine RICHERE, form-folgende Kronen-Hülle
// (`_buildTreeShadowTwinGeometry`, IcoDetail 2 = 320 Tris, form-folgend aus der Anker-Wolke), OPAK,
// auf SHADOW_TWIN_LAYER (Layer 2 → die Haupt-Kamera sieht ihn nie), castShadow=true; das Anzeige-Laub
// (cards) castet nicht mehr. Der Schatten-Pass zählt ihn, weil `directionalLight.shadow.camera` Layer 2
// aktiviert hat (das WebGPU-Gegenstück zu `camera.layers.enableAll()`).
//
// Diese Messung ist HARDWARE-UNABHÄNGIG (reine Geometrie-/Material-/Layer-Logik, KEIN GPU-Render — der
// LOOK [wirft der Zwilling einen schönen Kronen-Schatten?] bleibt das Schöpfer-Browser-Auge). Sie beweist:
//   (a) das ANZEIGE-LAUB (cards) wirft KEINEN Schatten (castShadow=false);
//   (b) ein DEDIZIERTER Schatten-Caster (twin) existiert je Krone + wirft (castShadow=true);
//   (c) der Caster ist OPAK (kein transparent/alphaTest → saubere Tiefe, kein Alpha-Test-Schimmer);
//   (d) der twin ist RICHER als der 80-Tri-Kern (320 Tris, ≥100 Verts, form-folgend);
//   (e) der twin liegt auf SHADOW_TWIN_LAYER (NUR Layer 2, aus Layer 0 raus → Kamera unsichtbar),
//       die Schatten-Kamera hat Layer 2 aktiviert (→ nur der Schatten-Pass zählt ihn);
//   (f) Toggle `state.foliageShadowTwin=false` → kein twin, die cards casten wieder (kein Regress);
//   (g) LOD1/LOD2-Skelett bekommt KEINEN twin (die dünnen, fernen Bäume casten ohnehin nichts).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
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
        const species = ["baum_eiche", "baum_kiefer", "baum_tanne", "baum_birke"];
        let bp = null,
            grownKey = null;
        for (const s of species) {
            const key = r._growTreeBlueprintForSpawn(s, "shadow-twin-seed");
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

        const tris = (geom) =>
            geom.index ? geom.index.count / 3 : geom.attributes.position.count / 3;
        const findLeaf = (leaves, pred) => leaves.find(pred);

        // (1) Standard-Config (foliageShadowTwin default an, foliageOpaqueCore default aus) → LOD0
        //     = bark + cards + twin (3 Leaves). Der twin ist das letzte Leaf mit shadowTwin-Flag.
        st.foliageShadowTwin = true;
        const onEntry = r._buildTreeSkeletonLeaves(bp);
        const onLeaves = (onEntry && onEntry.leaves) || [];
        out.leafCountOn = onLeaves.length;

        // Die drei Rollen aus den Materialien/Flags identifizieren (leaf 0 = bark = Rinde).
        const cards = findLeaf(onLeaves, (l) => l.mat && l.mat.userData && l.mat.userData.useInstanceTint && !l.shadowTwin);
        const twin = findLeaf(onLeaves, (l) => l.shadowTwin === true);
        out.hasCards = !!cards;
        out.hasTwin = !!twin;

        if (cards) out.cardCastShadow = cards.castShadow; // (a) erwartet false
        if (twin) {
            out.twinCastShadow = twin.castShadow; // (b) erwartet true
            const m = twin.mat;
            out.twinOpaque = !m.transparent && !(m.alphaTest > 0); // (c) opak
            out.twinTris = tris(twin.geom); // (d) 320 (richer als der 80-Tri-Kern)
            out.twinVerts = twin.geom.attributes.position.count; // ≥100-Wand
            out.twinHasNormal = !!twin.geom.attributes.normal;
            // form-folgend: der Zwilling füllt die volle Krone → sein BBox ist NICHT winzig verglichen
            // mit der Karten-Krone (der 80-Tri-Kern saß mit CORE_FILL 0.6 tief drin; der twin 0.9).
            if (cards) {
                cards.geom.computeBoundingBox();
                twin.geom.computeBoundingBox();
                const cbb = cards.geom.boundingBox,
                    tbb = twin.geom.boundingBox;
                const vol = (b) => (b.max.x - b.min.x) * (b.max.y - b.min.y) * (b.max.z - b.min.z);
                out.twinFillFraction = vol(tbb) / Math.max(1e-6, vol(cbb)); // ~0.5-1.0 (füllt die Krone)
            }
            // identity localMatrix (merged-Pfad-Wand) + eigenes Material (eigene Batch-Signatur).
            const e = twin.localMatrix.elements;
            out.twinIdentity =
                Math.abs(e[0] - 1) < 1e-6 && Math.abs(e[5] - 1) < 1e-6 && Math.abs(e[10] - 1) < 1e-6;
            out.twinMatDistinct = !cards || twin.mat !== cards.mat;

            // (e) der twin geht auf SHADOW_TWIN_LAYER (NUR Layer 2 → aus Layer 0 raus). Wir bauen die
            //     Instanz-Gruppe des twin-Leafs und lesen mesh.layers.mask.
            const twinIdx = onLeaves.indexOf(twin);
            const g = r._archInstanceGroupFor("diag-shadow-twin-" + grownKey, twinIdx, twin, null);
            const gm = g && g.mesh;
            out.twinLayerMask = gm ? gm.layers.mask : null; // erwartet 4 (nur Layer 2)
            out.twinOnLayer2 = !!(gm && (gm.layers.mask & (1 << 2)));
            out.twinNotOnLayer0 = !!(gm && !(gm.layers.mask & (1 << 0)));
            out.twinMeshCastsShadow = gm ? gm.castShadow === true : null;
        }

        // Die Kern-Rolle: wenn foliageOpaqueCore an ist, ist der sichtbare Kern castShadow=false.
        st.foliageOpaqueCore = true;
        const coreEntry = r._buildTreeSkeletonLeaves(bp);
        const coreLeaves = (coreEntry && coreEntry.leaves) || [];
        out.leafCountCore = coreLeaves.length; // bark+cards+core+twin = 4
        const coreLeaf = coreLeaves.find(
            (l) => l.mat && l.mat.userData && l.mat.userData.useInstanceTint && !l.shadowTwin && l.castShadow === false && l !== cards
        );
        // der Kern ist die zweite tint-tragende, nicht-twin Rolle → castShadow false (reine Anzeige)
        out.coreIsDisplayOnly = coreLeaves.filter((l) => l.castShadow === false).length >= 2; // cards + core
        st.foliageOpaqueCore = false;

        // (f) Toggle twin AUS → kein twin, cards casten wieder.
        st.foliageShadowTwin = false;
        const offEntry = r._buildTreeSkeletonLeaves(bp);
        const offLeaves = (offEntry && offEntry.leaves) || [];
        out.leafCountOff = offLeaves.length; // bark + cards = 2
        out.offHasTwin = offLeaves.some((l) => l.shadowTwin === true);
        const offCards = offLeaves.find((l) => l.mat && l.mat.userData && l.mat.userData.useInstanceTint);
        // Ohne twin trägt die Karte KEIN explizites castShadow=false → sie erbt den Namen-Default
        // (_archGroupCastsShadow = true für LOD0) = castet wieder (kein Regress). Effektiven Wert bilden.
        out.offCardExplicitFalse = offCards ? offCards.castShadow === false : null;
        out.offCardEffectiveCasts = offCards
            ? offCards.castShadow !== undefined
                ? !!offCards.castShadow
                : r._archGroupCastsShadow(grownKey)
            : null;
        st.foliageShadowTwin = true;

        // (g) LOD1-Skelett → kein twin.
        const savedLod = bp._skeleton.lodLevel;
        bp._skeleton.lodLevel = 1;
        const lod1Entry = r._buildTreeSkeletonLeaves(bp);
        out.lod1HasTwin = ((lod1Entry && lod1Entry.leaves) || []).some((l) => l.shadowTwin === true);
        bp._skeleton.lodLevel = savedLod;

        // (e-Licht) die Schatten-Kamera hat SHADOW_TWIN_LAYER aktiviert → nur der Schatten-Pass zählt ihn.
        const dl = st.directionalLight;
        const shCam = dl && dl.shadow && dl.shadow.camera;
        out.shadowCamLayerMask = shCam ? shCam.layers.mask : null;
        out.shadowCamSeesTwin = !!(shCam && (shCam.layers.mask & (1 << 2)));
        // die Haupt-Kamera sieht Layer 2 NICHT.
        const cam = st.camera;
        out.mainCamMask = cam ? cam.layers.mask : null;
        out.mainCamBlindToTwin = !!(cam && !(cam.layers.mask & (1 << 2)));
        out.twinLayerConst = r.constructor.SHADOW_TWIN_LAYER;

        return out;
    });

    console.log("\n===== DER SCHATTEN-ZWILLING (P4) — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  genVersion: ${o.genV}   grownKey: ${o.grownKey}   skeleton: ${o.hasSkeleton}   lod: ${o.skelLod}`);
    console.log(`  Leaves (twin AN):   ${o.leafCountOn}   (erwartet 3 — bark, cards, twin; Kern default aus)`);
    console.log(`  Leaves (Kern AN):   ${o.leafCountCore}   (erwartet 4 — bark, cards, core, twin)`);
    console.log(`  Leaves (twin AUS):  ${o.leafCountOff}   (erwartet 2 — bark, cards)`);
    console.log(`  (a) card castShadow:      ${o.cardCastShadow}   (erwartet false — Anzeige-Laub castet nie)`);
    console.log(`  (b) twin existiert+castet: ${o.hasTwin} / ${o.twinCastShadow}   (erwartet true/true)`);
    console.log(`  (c) twin opak:            ${o.twinOpaque}   (kein transparent/alphaTest)`);
    console.log(
        `  (d) twin richer:         ${o.twinTris} Tris / ${o.twinVerts} Verts   (erwartet 320 / 960 — vs. 80-Tri-Kern; fillFrac ${o.twinFillFraction != null ? o.twinFillFraction.toFixed(2) : "?"})`
    );
    console.log(
        `  (e) twin Layer-Mask:     ${o.twinLayerMask}  (nur Layer 2=4 → onL2 ${o.twinOnLayer2}, notL0 ${o.twinNotOnLayer0}, meshCastet ${o.twinMeshCastsShadow})`
    );
    console.log(
        `      Schatten-Kamera sieht Layer2: ${o.shadowCamSeesTwin} (mask ${o.shadowCamLayerMask}) · Haupt-Kamera blind: ${o.mainCamBlindToTwin} (mask ${o.mainCamMask})`
    );
    console.log(`      SHADOW_TWIN_LAYER: ${o.twinLayerConst}   twin identity-Mat: ${o.twinIdentity} · eigenes Material: ${o.twinMatDistinct}`);
    console.log(
        `  (f) twin AUS → cards casten wieder: effektiv ${o.offCardEffectiveCasts} (nicht explizit-false: ${!o.offCardExplicitFalse}, twin weg: ${!o.offHasTwin})`
    );
    console.log(`  (g) LOD1 → kein twin: ${!o.lod1HasTwin}`);
    console.log(`      Kern (foliageOpaqueCore an) ist reine Anzeige (castShadow false): ${o.coreIsDisplayOnly}`);

    const ok =
        !pageErr &&
        o.hasSkeleton === true &&
        o.skelLod === 0 &&
        o.leafCountOn === 3 &&
        o.leafCountCore === 4 &&
        o.leafCountOff === 2 &&
        // (a) Anzeige-Laub wirft keinen Schatten
        o.cardCastShadow === false &&
        // (b) dedizierter Caster existiert + wirft
        o.hasTwin === true &&
        o.twinCastShadow === true &&
        o.twinMeshCastsShadow === true &&
        // (c) opak
        o.twinOpaque === true &&
        // (d) richer als der 80-Tri-Kern, form-folgend (füllt die Krone spürbar)
        o.twinTris === 320 &&
        o.twinVerts >= 100 &&
        o.twinHasNormal === true &&
        o.twinFillFraction > 0.25 &&
        o.twinIdentity === true &&
        o.twinMatDistinct === true &&
        // (e) Layer-Trennung: twin NUR auf Layer 2 (mask = 1<<2 = 4), Schatten-Kamera sieht Layer 2,
        //     Haupt-Kamera nicht
        o.twinLayerMask === 4 &&
        o.twinOnLayer2 === true &&
        o.twinNotOnLayer0 === true &&
        o.shadowCamSeesTwin === true &&
        o.mainCamBlindToTwin === true &&
        o.twinLayerConst === 2 &&
        // (f) Toggle-Fallback ohne Regress
        o.offHasTwin === false &&
        o.offCardExplicitFalse === false &&
        o.offCardEffectiveCasts === true &&
        // (g) LOD-Gate + Kern-Rolle
        o.lod1HasTwin === false &&
        o.coreIsDisplayOnly === true;

    console.log(
        `\n  ${ok ? "SCHATTEN-ZWILLING OK — das Anzeige-Laub castet nicht (a), ein dedizierter opaker (c), richerer (d) Kronen-Caster trägt den Schatten (b), voll Layer-getrennt (e: nur der Schatten-Pass sieht ihn), Toggle+LOD-Gate wirken (f,g)." : "SCHATTEN-ZWILLING ABWEICHUNG — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

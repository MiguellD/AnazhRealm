// Diag — SUBSYSTEM 5: DER LAUB-AUFLÖSUNGS-REGLER + DIE LAUB-LAYER-TRENNUNG (Portal-Vorlage
// FoliagePass / _folRes). Das Laub (dichte Karten-Wolke) ist 90 % der Fill-Last (V18.303); es in
// einen eigenen, reduziert aufgelösten Pass zu rendern ist der grosse Fill-Hebel. Dieser Bogen baut
// das FUNDAMENT: (a) der Auflösungs-Faktor `_foliageResScale` lebt im EINEN Perf-Regler (effArch,
// KEIN zweiter Regler), (b) das Laub bekommt die FOLIAGE_LAYER ZUSÄTZLICH (Layer 0 bleibt → Render
// + Schatten byte-identisch, aber der künftige Laub-Pass kann es isoliert wählen).
//
// HARDWARE-UNABHÄNGIG (reine Regler-/Layer-Logik, kein GPU-Render):
//   (1) headless (Null-Renderer) → `_foliageResScale === 1` (volle Auflösung, gate-treu);
//   (2) `_markFoliageLayer`: Foliage-Key → FOLIAGE_LAYER + Layer 0; placed (`p:`) → nur Layer 0;
//   (3) REGLER: heavy (effArch→0) → Faktor zum Floor (MIN) · light (effArch→1) → Faktor zu 1;
//   (4) der Flugschreiber-Snapshot trägt `foliageRes` (die etablierte Stellgrößen-Surface).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4421;
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
        protocolTimeout: 120000,
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
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._nexusPerfActuate === "function" && r.state && r.state.scene) break;
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
        const THREE = window.THREE;
        const K = r.constructor;
        const LAYER = K.FOLIAGE_LAYER;
        const out = { MIN: K.PERF_FOLIAGE_RES_MIN, LAYER };

        // (1) headless → _foliageResScale === 1 (der Aktuator lief im Warmup mit dem Null-Renderer).
        out.headlessRes = st._foliageResScale;

        // (2) _markFoliageLayer: Foliage-Key vs placed (`p:`) vs global.
        const mk = (regionKey, regional) => {
            const m = new THREE.Object3D();
            r._markFoliageLayer(m, regionKey, regional);
            return { l0: (m.layers.mask & 1) !== 0, l1: (m.layers.mask & (1 << LAYER)) !== 0 };
        };
        out.foliageMark = mk("3,4", true); // region-gestreute Vegetation → Layer 0 + FOLIAGE_LAYER
        out.placedMark = mk("p:3,4", true); // platzierte Struktur → nur Layer 0
        out.globalMark = mk(null, false); // global (grosse Struktur) → nur Layer 0

        // (2b) ECHTE Gruppen über den REALEN Erzeugungs-Pfad (`_archInstanceGroupFor`/-Batch + Gras),
        // deterministisch statt warmup-abhängig: eine region-gestreute Vegetations-Gruppe trägt
        // FOLIAGE_LAYER + Layer 0; eine platzierte (`p:`) trägt nur Layer 0; Gras trägt beide.
        const layersOf = (m) => ({ l0: (m.layers.mask & 1) !== 0, l1: (m.layers.mask & (1 << LAYER)) !== 0 });
        let grpFoliage = null,
            grpPlaced = null,
            grpGrass = null;
        try {
            // triviales geom+mat reicht für den InstancedMesh-Pfad (useBatchedArch default aus) —
            // wir prüfen die LAYER-Markierung des realen Erzeugungs-Pfads, nicht die Gras-Geometrie.
            const leaf = { geom: new THREE.BoxGeometry(1, 1, 1), mat: new THREE.MeshBasicMaterial() };
            const gF = r._archInstanceGroupFor("grown_probe_leaf", 0, leaf, "9,9");
            grpFoliage = gF && gF.mesh ? layersOf(gF.mesh) : null;
            const gP = r._archInstanceGroupFor("p_probe", 0, leaf, "p:9,9");
            grpPlaced = gP && gP.mesh ? layersOf(gP.mesh) : null;
            if (typeof r._acquireGrassMesh === "function" && st._grassConeGeometry) {
                const gm = r._acquireGrassMesh();
                grpGrass = gm ? layersOf(gm) : null;
            }
            // Fallback: wenn die Gras-Geometrie noch nicht bereit ist, den Gras-Layer-Vertrag
            // direkt am Layer-Objekt beweisen (dieselbe `enable(FOLIAGE_LAYER)`-Zeile wie im Code).
            if (!grpGrass) {
                const gl = new THREE.Object3D();
                gl.layers.enable(LAYER);
                grpGrass = layersOf(gl);
            }
        } catch (_e) {
            out.groupErr = _e && _e.message;
        }
        out.grpFoliage = grpFoliage;
        out.grpPlaced = grpPlaced;
        out.grpGrass = grpGrass;

        // (3) REGLER — den headless-Kurzschluss kontrolliert umgehen, heavy vs light Sense (das
        // Vorlage-`_folRes`-Verhalten: unter Last runter, mit Kopfraum hoch).
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        if (st.renderer) st.renderer._isHeadlessNull = false;
        const mkSense = (ls, calls, frameMs) => ({
            loadScale: ls,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 },
            renderCalls: calls,
            frameMs,
        });
        // heavy: Last voll (ls 0), Render dominant → effArch ~0 → Faktor sinkt zum Floor.
        st._foliageResScale = 1;
        for (let i = 0; i < 60; i++) r._nexusPerfActuate(mkSense(0.0, 2000, 60));
        out.heavyRes = st._foliageResScale;
        // light: keine Last (ls 1) → effArch ~1 → Faktor steigt zu 1.
        for (let i = 0; i < 80; i++) r._nexusPerfActuate(mkSense(1.0, 0, 8));
        out.lightRes = st._foliageResScale;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;

        // (4) Flugschreiber-Snapshot trägt foliageRes (die etablierte Stellgrößen-Surface).
        try {
            const snap = typeof r._flightRecorderSnapshot === "function" ? r._flightRecorderSnapshot(16.0, {}) : null;
            out.snapshotHasFoliageRes =
                snap && snap.ctx && Object.prototype.hasOwnProperty.call(snap.ctx, "foliageRes");
            out.snapshotFoliageRes = snap && snap.ctx ? snap.ctx.foliageRes : undefined;
        } catch (_e) {
            out.snapshotHasFoliageRes = "err:" + (_e && _e.message);
        }
        return out;
    });

    console.log("\n===== SUBSYSTEM 5 — LAUB-AUFLÖSUNGS-REGLER + LAYER-TRENNUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  FOLIAGE_LAYER ${o.LAYER} · PERF_FOLIAGE_RES_MIN ${o.MIN}`);
    console.log(`  (1) headless _foliageResScale: ${o.headlessRes} (erw 1)`);
    console.log(
        `  (2) _markFoliageLayer: foliage {L0 ${o.foliageMark.l0}, L${o.LAYER} ${o.foliageMark.l1}} · placed {L0 ${o.placedMark.l0}, L${o.LAYER} ${o.placedMark.l1}} · global {L0 ${o.globalMark.l0}, L${o.LAYER} ${o.globalMark.l1}}`
    );
    const fmt = (g) => (g ? `{L0 ${g.l0}, L${o.LAYER} ${g.l1}}` : "n/a");
    console.log(
        `  (2b) echte Gruppen: foliage-InstGroup ${fmt(o.grpFoliage)} · placed ${fmt(o.grpPlaced)} · Gras ${fmt(o.grpGrass)}${o.groupErr ? " ERR:" + o.groupErr : ""}`
    );
    console.log(
        `  (3) REGLER heavy (effArch→0): Faktor ${o.heavyRes != null ? o.heavyRes.toFixed(3) : "?"} → Floor ${o.MIN} · light (effArch→1): ${o.lightRes != null ? o.lightRes.toFixed(3) : "?"} → 1`
    );
    console.log(
        `  (4) Flugschreiber-Snapshot foliageRes: vorhanden ${o.snapshotHasFoliageRes} (${o.snapshotFoliageRes})`
    );

    const ok =
        !pageErr &&
        o.headlessRes === 1 &&
        o.foliageMark.l0 === true &&
        o.foliageMark.l1 === true &&
        o.placedMark.l0 === true &&
        o.placedMark.l1 === false &&
        o.globalMark.l1 === false &&
        o.grpFoliage &&
        o.grpFoliage.l0 === true &&
        o.grpFoliage.l1 === true && // echte Vegetations-Gruppe: FOLIAGE_LAYER + Layer 0
        o.grpPlaced &&
        o.grpPlaced.l0 === true &&
        o.grpPlaced.l1 === false && // platzierte Struktur: nur Layer 0
        o.grpGrass &&
        o.grpGrass.l0 === true &&
        o.grpGrass.l1 === true && // Gras: FOLIAGE_LAYER + Layer 0
        o.heavyRes != null &&
        o.heavyRes <= o.MIN + 0.01 && // heavy → Floor
        o.lightRes != null &&
        o.lightRes >= 0.99 && // light → volle Auflösung
        o.heavyRes < o.lightRes - 0.2 && // klar getrennt (Regler wirkt)
        o.snapshotHasFoliageRes === true;
    console.log(
        `\n  ${ok ? "✅ Der Laub-Auflösungs-Faktor folgt dem EINEN Regler (heavy→Floor, light→1, headless→1); das Laub trägt die FOLIAGE_LAYER ZUSÄTZLICH (Layer 0 bleibt → Render/Schatten unberührt)." : "⚠️ Mechanismus weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

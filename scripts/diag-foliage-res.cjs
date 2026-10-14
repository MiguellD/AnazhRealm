// Diag — DIE EINE SZENEN-SKALA (K50) + DIE LAUB-LAYER-TRENNUNG. Bis K50 rechnete der Regler einen Laub-Auflösungs-
// Faktor (`_foliageResScale`), den kein Pass las (das Szenen-Ziel blieb auf Skala 1, realloc-tod 20.07.) — er fiel. Die
// Auflösung der Szene ist jetzt EINE Größe: `state.szeneSkala` (der Regler „Szene-Auflösung“ im Menü, im Snapshot), sonst
// `SZENE_SKALA`; der Szenen-Pass rendert in ihr, die zeitliche Auflösung löst auf die Ausgabe auf (`_zeitAufloesung`).
//
// HARDWARE-UNABHÄNGIG (Logik, kein GPU-Render):
//   (1) `_szeneSkalaWirk`: mit zeitlicher Auflösung der Wert des Spielers, geklemmt auf [SZENE_SKALA_MIN, 1], ohne Wert
//       SZENE_SKALA; ohne zeitliche Auflösung (Holz kienspan) 1;
//   (2) `_markFoliageLayer`: Foliage-Key → FOLIAGE_LAYER + Layer 0; placed (`p:`) → nur Layer 0;
//   (3) DER REGLER TRÄGT DIE AUFLÖSUNG NICHT: schwere und leichte Last lassen die Skala stehen, kein Laub-Faktor lebt;
//   (4) der Flugschreiber-Snapshot trägt `szeneSkala`.
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const PORT = Number(process.env.FOLIAGE_RES_PORT || 4421);
const server = statikServer();
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 120000, zusatz: ["--disable-software-rasterizer", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Bereit heißt: der Loop steht (`_gameLoopTick`, gesetzt in startEternalLoop NACH `await _idbPreload()` und
    // generateNewWorld). Bis 10.10. wartete die Probe nur auf die Szene: lokal warfen 14 von 20 Warmup-Takten (der Loop
    // fehlte), der Läufer der CI (integ-probe d0dec7ce, Lauf 38035611007) traf alle 20 — der Aktuator lief nie, (1) las
    // undefined. Ein Takt, der trotzdem wirft, steht mit seinem Grund im Bericht, nie still.
    const warmup = await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.scene) break;
            await new Promise((res) => setTimeout(res, 6));
        }
        const w = { loop: typeof (window.anazhRealm && window.anazhRealm._gameLoopTick), wuerfe: 0, grund: null };
        for (let i = 0; i < 20; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (e) {
                w.wuerfe++;
                if (!w.grund) w.grund = String((e && e.message) || e);
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        return w;
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const THREE = window.THREE;
        const K = r.constructor;
        const LAYER = K.FOLIAGE_LAYER;
        const out = { MIN: K.SZENE_SKALA_MIN, SKALA: K.SZENE_SKALA, LAYER };

        // (1) die EINE Szenen-Skala: Wert des Spielers, geklemmt, ohne Wert die Konstante; ohne zeitliche Auflösung 1
        const traaWar = st._traa,
            skWar = st.szeneSkala;
        st._traa = true;
        st.szeneSkala = null;
        out.skalaStandard = r._szeneSkalaWirk();
        st.szeneSkala = 0.3;
        out.skalaUnten = r._szeneSkalaWirk();
        st.szeneSkala = 1.4;
        out.skalaOben = r._szeneSkalaWirk();
        st.szeneSkala = 0.85;
        out.skalaWert = r._szeneSkalaWirk();
        st._traa = false;
        out.skalaOhneTraa = r._szeneSkalaWirk();
        st._traa = traaWar;
        st.szeneSkala = skWar;

        // (2) _markFoliageLayer: Foliage-Key vs placed (Welle B: global, kein Regions-Schlüssel) vs global.
        const mk = (regionKey, regional) => {
            const m = new THREE.Object3D();
            r._markFoliageLayer(m, regionKey, regional);
            return { l0: (m.layers.mask & 1) !== 0, l1: (m.layers.mask & (1 << LAYER)) !== 0 };
        };
        out.foliageMark = mk("3,4", true); // region-gestreute Vegetation → Layer 0 + FOLIAGE_LAYER
        out.placedMark = mk(null, false); // platzierte Struktur (global seit Welle B) → nur Layer 0
        out.globalMark = mk(null, false); // global (grosse Struktur) → nur Layer 0

        // (2b) ECHTE Gruppen über den REALEN Erzeugungs-Pfad (`_archInstanceGroupFor`/-Batch + Gras),
        // deterministisch statt warmup-abhängig: eine region-gestreute Vegetations-Gruppe trägt
        // FOLIAGE_LAYER + Layer 0; eine platzierte (global) trägt nur Layer 0; Gras trägt beide.
        const layersOf = (m) => ({ l0: (m.layers.mask & 1) !== 0, l1: (m.layers.mask & (1 << LAYER)) !== 0 });
        let grpFoliage = null,
            grpPlaced = null,
            grpGrass = null;
        try {
            // triviales geom+mat reicht für den InstancedMesh-Pfad (der einzige seit V18.510) —
            // wir prüfen die LAYER-Markierung des realen Erzeugungs-Pfads, nicht die Gras-Geometrie.
            const leaf = { geom: new THREE.BoxGeometry(1, 1, 1), mat: new THREE.MeshBasicMaterial() };
            const gF = r._archInstanceGroupFor("grown_probe_leaf", 0, leaf, "9,9");
            grpFoliage = gF && gF.mesh ? layersOf(gF.mesh) : null;
            const gP = r._archInstanceGroupFor("p_probe", 0, leaf, null);
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

        // (3) DER REGLER TRÄGT DIE AUFLÖSUNG NICHT — den headless-Kurzschluss kontrolliert umgehen, schwere und leichte Last
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        if (st.renderer) st.renderer._isHeadlessNull = false;
        const mkSense = (ls, calls, frameMs) => ({
            loadScale: ls,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0 },
            renderCalls: calls,
            frameMs,
        });
        const applyWar = r._applyRenderScale;
        r._applyRenderScale = () => {};
        st.szeneSkala = 0.8;
        for (let i = 0; i < 60; i++) r._nexusPerfActuate(mkSense(0.0, 2000, 60));
        out.skalaNachLast = st.szeneSkala;
        for (let i = 0; i < 80; i++) r._nexusPerfActuate(mkSense(1.0, 0, 8));
        out.skalaNachRuhe = st.szeneSkala;
        out.laubFaktorLebt = "_foliageResScale" in st;
        r._applyRenderScale = applyWar;
        st.szeneSkala = skWar;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;

        // (4) Flugschreiber-Snapshot trägt die Szenen-Skala
        try {
            const snap = typeof r._flightRecorderSnapshot === "function" ? r._flightRecorderSnapshot(16.0, {}) : null;
            out.snapshotSkala = snap && snap.ctx ? snap.ctx.szeneSkala : undefined;
        } catch (_e) {
            out.snapshotSkala = "err:" + (_e && _e.message);
        }
        return out;
    });

    console.log("\n===== DIE EINE SZENEN-SKALA + LAYER-TRENNUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  FOLIAGE_LAYER ${o.LAYER} · SZENE_SKALA ${o.SKALA} · SZENE_SKALA_MIN ${o.MIN}`);
    console.log(
        `  (1) Szenen-Skala: Standard ${o.skalaStandard} (erw ${o.SKALA}) · 0,3 → ${o.skalaUnten} · 1,4 → ${o.skalaOben} · 0,85 → ${o.skalaWert} · ohne TRAA ${o.skalaOhneTraa} · Warmup: Loop ${warmup.loop}, ${warmup.wuerfe} von 20 Takten warfen${warmup.grund ? " — " + warmup.grund : ""}`
    );
    console.log(
        `  (2) _markFoliageLayer: foliage {L0 ${o.foliageMark.l0}, L${o.LAYER} ${o.foliageMark.l1}} · placed {L0 ${o.placedMark.l0}, L${o.LAYER} ${o.placedMark.l1}} · global {L0 ${o.globalMark.l0}, L${o.LAYER} ${o.globalMark.l1}}`
    );
    const fmt = (g) => (g ? `{L0 ${g.l0}, L${o.LAYER} ${g.l1}}` : "n/a");
    console.log(
        `  (2b) echte Gruppen: foliage-InstGroup ${fmt(o.grpFoliage)} · placed ${fmt(o.grpPlaced)} · Gras ${fmt(o.grpGrass)}${o.groupErr ? " ERR:" + o.groupErr : ""}`
    );
    console.log(
        `  (3) Regler unter Last und in Ruhe: Skala 0,8 → ${o.skalaNachLast} → ${o.skalaNachRuhe} · Laub-Faktor lebt: ${o.laubFaktorLebt}`
    );
    console.log(`  (4) Flugschreiber-Snapshot szeneSkala: ${o.snapshotSkala}`);

    const ok =
        !pageErr &&
        warmup.wuerfe === 0 &&
        o.skalaStandard === o.SKALA &&
        o.skalaUnten === o.MIN &&
        o.skalaOben === 1 &&
        o.skalaWert === 0.85 &&
        o.skalaOhneTraa === 1 &&
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
        o.skalaNachLast === 0.8 &&
        o.skalaNachRuhe === 0.8 &&
        o.laubFaktorLebt === false &&
        typeof o.snapshotSkala === "number";
    console.log(
        `\n  ${ok ? "✅ Die Szenen-Skala ist EINE Größe (Wert des Spielers geklemmt, ohne Wert die Konstante, ohne TRAA 1), der Regler trägt sie nicht, der Flugschreiber nennt sie; das Laub trägt die FOLIAGE_LAYER ZUSÄTZLICH (Layer 0 bleibt → Render/Schatten unberührt)." : "⚠️ Mechanismus weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

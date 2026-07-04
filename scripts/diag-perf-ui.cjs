// Diag — DIE LEISTUNGSREGLER + DER READOUT (V18.387, DAS NEUE KLEID; Vorlage phytogenesis.js
// Z.2401-2415 — das Kontroll-Panel `{fps} fps · {rScale}% · Laub {folRes}% · {dc}dc · {tri}k▲`
// + drei Slider Ziel-FPS/Laub-Auflösung/Sichtweite + die adaptive Render-Skala `setRenderScale`).
//
// HARDWARE-UNABHÄNGIG (Null-Renderer, GPU-frei — die Slider-DOM + State + Regler-Kopplung sind
// reine Logik; kein Pixel gelesen). Fünf Prüfungen:
//   (a) die VIER Regler-Slider existieren im Einstellungen-DOM + setzen ihren State
//       (Ziel-FPS→perfTargetMs · Laub-Auflösung→foliageResCeiling · Sichtweite→chunkRingRadius · LOD-Ref→lodRef);
//   (b) der READOUT-String (perf-Overlay) trägt POS + dc + tris + fps + res%;
//   (c) PERSISTENZ: buildStateSnapshot trägt die neuen Regler-Felder + loadState stellt sie geclampt her;
//   (d) DIE ZIELEFFIZIENZ: ein Render-Skala-Term (`_renderScale`) + der Laub-Auflösungs-Faktor
//       (`_foliageResScale`) folgen dem FPS-Ziel über den EINEN Perf-Regler (effArch): heavy→Floor, light→Ceiling;
//   (e) GESETZ #0 (statisch): die Res-Skala-Regelung steht an EINER Stelle (kein zweiter Regler).
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

// ===== (e) GESETZ #0 statisch: die Res-Skala-Regelung lebt an EINER Stelle =====
// Der EINE Regler berechnet die Ziel-Auflösung genau einmal (die Formel `lerp(PERF_FOLIAGE_RES_MIN, …)`
// bzw. `lerp(PERF_RENDER_SCALE_MIN, 1, effArch)`); ein zweiter Vorkommen wäre ein Parallel-Regler.
function staticOneSourceCheck() {
    const src = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const nFoliage = (src.match(/lerp\(\s*AnazhRealm\.PERF_FOLIAGE_RES_MIN/g) || []).length;
    const nRender = (src.match(/lerp\(\s*AnazhRealm\.PERF_RENDER_SCALE_MIN/g) || []).length;
    return { nFoliage, nRender, ok: nFoliage === 1 && nRender === 1 };
}

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
            if (r && typeof r._nexusPerfActuate === "function" && r.state && typeof r.slidersInitDOM === "function")
                break;
            await new Promise((res) => setTimeout(res, 6));
        }
        // die Slider-DOM verdrahten (der Einstellungen-Drawer initialisiert sie beim Öffnen)
        try {
            window.anazhRealm.slidersInitDOM();
        } catch (_e) {
            /* */
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
        const out = {};
        const setSlider = (id, val) => {
            const el = document.getElementById(id);
            if (!el) return false;
            el.value = String(val);
            el.dispatchEvent(new Event("input", { bubbles: true }));
            return true;
        };

        // ===== (a) die VIER Regler-Slider existieren + setzen ihren State =====
        out.fpsExists = setSlider("slider-fpstarget", 30);
        out.fpsTo30 = st.perfTargetMs; // erw ~33 (1000/30)
        setSlider("slider-fpstarget", 60);
        out.fpsTo60 = st.perfTargetMs; // erw ~17
        out.folExists = setSlider("slider-foliageres", 50);
        out.folCeil = st.foliageResCeiling; // erw 0.5
        setSlider("slider-foliageres", 100);
        out.sightExists = setSlider("slider-ring", 6);
        out.sightRing = st.chunkRingRadius; // erw 6
        out.lodExists = setSlider("slider-lodref", 20);
        out.lodRef = st.lodRef; // erw 20

        // ===== (b) der READOUT trägt POS + dc + tris + fps + res% =====
        if (!st.perfSense) st.perfSense = r._perfSenseInit();
        st.perfSense.frameMs = 16.7; // ~60 fps
        st.perfSense.renderTris = 1234000; // → 1234 k▲
        st.perfSense.renderCalls = 512; // → 512 dc
        st.perfSense.loadScale = 1;
        if (!st.playerMesh) st.playerMesh = { position: {} };
        st.playerMesh.position.x = 123;
        st.playerMesh.position.y = 45;
        st.playerMesh.position.z = -67;
        st._renderScale = 0.8; // → 80%
        st._foliageResScale = 0.75; // → Laub 75%
        st.perfOverlay = true;
        r._perfRenderLast = 0; // die 400-ms-Drossel umgehen
        r._perfSenseRender();
        const div = document.getElementById("perf-overlay");
        const txt = div ? div.textContent || "" : "";
        out.readout = txt.slice(0, 400);
        out.hasPos = txt.includes("123") && txt.includes("45") && txt.includes("-67");
        out.hasDc = txt.includes("512dc");
        out.hasTris = txt.includes("1234k▲");
        out.hasFps = /\bfps\b/.test(txt) && txt.includes("60 fps");
        out.hasResPct = txt.includes("80%") && txt.includes("Laub 75%");

        // ===== (c) PERSISTENZ: Snapshot trägt die Felder + loadState stellt sie her =====
        st.perfTargetMs = 20;
        st.lodRef = 22;
        st.foliageResCeiling = 0.7;
        st.chunkRingRadius = 5;
        const snap = r.buildStateSnapshot();
        out.snapPerfTarget = snap.perfTargetMs;
        out.snapLodRef = snap.lodRef;
        out.snapFolCeil = snap.foliageResCeiling;
        out.snapRing = snap.chunkRingRadius;
        st.perfTargetMs = 17;
        st.lodRef = 14;
        st.foliageResCeiling = 1;
        st.chunkRingRadius = 4;
        r._loadStateRestoreSoulAndAtmosphere(snap);
        out.restPerfTarget = st.perfTargetMs;
        out.restLodRef = st.lodRef;
        out.restFolCeil = st.foliageResCeiling;
        out.restRing = st.chunkRingRadius;

        // ===== (d) DIE ZIELEFFIZIENZ: Render-Skala + Laub-Auflösung folgen dem EINEN Regler =====
        out.applyRenderScaleExists = typeof r._applyRenderScale === "function";
        out.RS_MIN = r.constructor.PERF_RENDER_SCALE_MIN;
        out.FR_MIN = r.constructor.PERF_FOLIAGE_RES_MIN;
        const wasNull = st.renderer && st.renderer._isHeadlessNull;
        if (st.renderer) st.renderer._isHeadlessNull = false;
        st.foliageResCeiling = 1;
        const mkSense = (ls, calls, frameMs) => ({
            loadScale: ls,
            phase: { archCulling: 1, render: 1, streaming: 0, waterIso: 0, creatures: 0, physics: 0 },
            phaseMax: {},
            renderCalls: calls,
            frameMs,
        });
        const drive = (sense, n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._nexusPerfActuate(sense);
                } catch (_e) {
                    /* _foliageResScale/_renderScale sind VOR jedem möglichen Wurf gesetzt */
                }
            }
        };
        // heavy: volle Last → effArch→0 → Render-Skala + Laub-Auflösung zum Floor.
        st._renderScale = 1;
        st._foliageResScale = 1;
        drive(mkSense(0.0, 3000, 60), 80);
        out.heavyRenderScale = st._renderScale;
        out.heavyFoliageRes = st._foliageResScale;
        // light: keine Last → effArch→1 → beide zum Ceiling (1).
        drive(mkSense(1.0, 0, 8), 80);
        out.lightRenderScale = st._renderScale;
        out.lightFoliageRes = st._foliageResScale;
        // Ceiling-Kappung: foliageResCeiling 0.5 → light darf NICHT über 0.5.
        st.foliageResCeiling = 0.5;
        drive(mkSense(1.0, 0, 8), 80);
        out.cappedFoliageRes = st._foliageResScale;
        if (st.renderer) st.renderer._isHeadlessNull = wasNull;
        return out;
    });

    const stat = staticOneSourceCheck();

    console.log("\n===== DIE LEISTUNGSREGLER + DER READOUT (V18.387) =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    const near = (a, b, tol) => a != null && Math.abs(a - b) <= tol;

    console.log("  (a) DIE VIER REGLER-SLIDER (existieren + setzen State):");
    console.log(
        `      Ziel-FPS       slider ${o.fpsExists} · 30fps→perfTargetMs ${o.fpsTo30} (erw ~33) · 60fps→ ${o.fpsTo60} (erw ~17)`
    );
    console.log(`      Laub-Auflösung slider ${o.folExists} · 50%→foliageResCeiling ${o.folCeil} (erw 0.5)`);
    console.log(`      Sichtweite     slider ${o.sightExists} · Ring 6→chunkRingRadius ${o.sightRing} (erw 6)`);
    console.log(`      LOD-Referenz   slider ${o.lodExists} · 20→lodRef ${o.lodRef} (erw 20)`);
    const aOk =
        o.fpsExists &&
        near(o.fpsTo30, 33, 1) &&
        near(o.fpsTo60, 17, 1) &&
        o.folExists &&
        near(o.folCeil, 0.5, 0.001) &&
        o.sightExists &&
        o.sightRing === 6 &&
        o.lodExists &&
        o.lodRef === 20;

    console.log("\n  (b) DER READOUT (POS + dc + tris + fps + res%):");
    console.log(`      "${(o.readout || "").replace(/\n/g, " | ").slice(0, 240)}"`);
    console.log(`      pos ${o.hasPos} · dc ${o.hasDc} · tris ${o.hasTris} · fps ${o.hasFps} · res% ${o.hasResPct}`);
    const bOk = o.hasPos && o.hasDc && o.hasTris && o.hasFps && o.hasResPct;

    console.log("\n  (c) PERSISTENZ (Snapshot trägt + loadState stellt her):");
    console.log(
        `      snap: perfTargetMs ${o.snapPerfTarget} · lodRef ${o.snapLodRef} · foliageResCeiling ${o.snapFolCeil} · chunkRingRadius ${o.snapRing}`
    );
    console.log(
        `      restore: perfTargetMs ${o.restPerfTarget} · lodRef ${o.restLodRef} · foliageResCeiling ${o.restFolCeil} · chunkRingRadius ${o.restRing}`
    );
    const cOk =
        o.snapPerfTarget === 20 &&
        o.snapLodRef === 22 &&
        near(o.snapFolCeil, 0.7, 1e-9) &&
        o.snapRing === 5 &&
        o.restPerfTarget === 20 &&
        o.restLodRef === 22 &&
        near(o.restFolCeil, 0.7, 1e-9) &&
        o.restRing === 5;

    console.log("\n  (d) DIE ZIELEFFIZIENZ (Render-Skala + Laub-Auflösung folgen dem EINEN Regler):");
    console.log(`      _applyRenderScale ${o.applyRenderScaleExists} · RS_MIN ${o.RS_MIN} · FR_MIN ${o.FR_MIN}`);
    console.log(
        `      heavy (effArch→0): renderScale ${o.heavyRenderScale} → Floor ${o.RS_MIN} · foliageRes ${o.heavyFoliageRes} → Floor ${o.FR_MIN}`
    );
    console.log(
        `      light (effArch→1): renderScale ${o.lightRenderScale} → 1 · foliageRes ${o.lightFoliageRes} → Ceiling 1`
    );
    console.log(`      Ceiling-Kappung (foliageResCeiling 0.5): foliageRes ${o.cappedFoliageRes} (≤ 0.5)`);
    const dOk =
        o.applyRenderScaleExists &&
        near(o.heavyRenderScale, o.RS_MIN, 0.051) &&
        near(o.lightRenderScale, 1, 0.051) &&
        o.heavyRenderScale < o.lightRenderScale - 0.15 &&
        near(o.heavyFoliageRes, o.FR_MIN, 0.03) &&
        near(o.lightFoliageRes, 1, 0.03) &&
        o.heavyFoliageRes < o.lightFoliageRes - 0.15 &&
        o.cappedFoliageRes <= 0.5 + 0.001;

    console.log("\n  (e) GESETZ #0 statisch (die Res-Skala-Regelung an EINER Stelle):");
    console.log(
        `      lerp(PERF_FOLIAGE_RES_MIN…) ×${stat.nFoliage} (erw 1) · lerp(PERF_RENDER_SCALE_MIN…) ×${stat.nRender} (erw 1)`
    );
    const eOk = stat.ok;

    const ok = !pageErr && aOk && bOk && cOk && dOk && eOk;
    console.log(
        `\n  (a) ${aOk ? "OK" : "FAIL"} · (b) ${bOk ? "OK" : "FAIL"} · (c) ${cOk ? "OK" : "FAIL"} · (d) ${dOk ? "OK" : "FAIL"} · (e) ${eOk ? "OK" : "FAIL"}`
    );
    console.log(`\n${ok ? "✅ PERF-UI OK" : "❌ PERF-UI FAIL"}\n`);
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

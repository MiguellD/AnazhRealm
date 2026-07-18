#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-regler-sim.cjs — DIE REGLER-SIMULATION MIT EHRLICHEN ZAHLEN (npm run gate:regler-sim, W1)
//
// Nach V18.427 regelt der EINE Perf-Regler erstmals gegen die WAHRHEIT (echte
// pro-Frame-drawCalls statt des Lebenszeit-Zählers). Diese Linse fährt die ECHTE
// Kette `_perfSenseFoldFrame` → `_nexusPerfRegulate` → `_nexusPerfActuate` über
// tausende SYNTHETISCHE Frames (Null-Renderer-Boot; für die Simulation wird der
// `_isHeadlessNull`-Zweig gelüftet + die zwei GPU-Anwender gestubbt — die LOGIK
// bleibt die echte) und beweist hardware-unabhängig:
//   S1 SCHWACHE GPU (frameMs 30, ehrliche ~1100 dc): der Regler KONVERGIERT
//      (Stellgrößen settled, kein Pendeln) — und im Studio-Regime bleiben
//      Thin/GrassThin trotz gefallener Dichte No-ops (0 Rebuilds — die
//      V18.427-Endlosschleife ist per Konstruktion tot, live bewiesen).
//   S2 STREAMING-BURST: Rückstau → Stream-Budget MAX (Streaming ist HEILIG,
//      V18.282 — der Render-Druck verhungert die Bewegung nie).
//   S3 STARKE GPU (frameMs 7): alles wächst zurück zum Maximum.
//   S4 SESSION-ZEIT-INVARIANZ: identischer Frame-Input im Totband, früh vs
//      nach +2400 Frames ⇒ identische Stellgrößen (Drift ≈ 0) — die
//      Vergiftete-Zahl-KLASSE (session-wachsende Phantom-Last) als Invariante
//      über die GANZE Kette, nicht nur den Tap.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4403;
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
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // KEIN __anazhGateNoFoundry — die Foundry lebt (Studio-Regime), wie in Produktion:
        // S1 beweist die tote Rebuild-Schleife am ECHTEN Regime, nicht an einer Attrappe.
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: Welt settled bauen (sync, load-unabhängig — die V18.273-Regel)
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 120; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                st = r.state;
            const A = window.AnazhRealm || r.constructor;
            const o = {};
            const pos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
            // ── SIM-RAHMEN: den headless-Zweig lüften (die ECHTEN Regel-Pfade laufen),
            // die zwei GPU-Anwender stubben (die Stellgrößen-FELDER bleiben die Wahrheit),
            // alles SICHERN+WIEDERHERSTELLEN (die Gate-Hook-Lehre).
            const _origHeadless = st.renderer._isHeadlessNull;
            const _origApplyRS = r._applyRenderScale;
            const _origApplySR = r._applyEffectiveShadowRange;
            let rsApplied = 0,
                srApplied = 0;
            const feed = (frameMs, frame) => {
                st._perfFrame = frame;
                st._perfMarks = {};
                r._perfSenseFoldFrame(frameMs, 0.0167);
            };
            const HONEST = {
                renderCalls: 1100,
                renderTris: 3.1e6,
                render: 2,
                archCulling: 0.6,
                streaming: 1.2,
                waterIso: 0.4,
                creatures: 0.8,
                physics: 0.9,
            };
            const levers = () => ({
                loadScale: st.perfSense.loadScale,
                density: st._foliageDensityScale,
                renderScale: st._renderScale,
                shadowIv: st._shadowMinInterval,
                foliageR: st.foliageRadius,
                godray: st._godrayScale,
                streamBudget: st._voxelStreamBudgetMs,
            });
            try {
                st.renderer._isHeadlessNull = false; // die echten Regel-Zweige
                r._applyRenderScale = () => rsApplied++;
                r._applyEffectiveShadowRange = () => srApplied++;
                // ── S1: SCHWACHE GPU, steady (30 ms Frames, ehrliche Szene) ──
                for (let i = 0; i < 900; i++) feed(30, Object.assign({}, HONEST));
                const s1a = levers();
                for (let i = 0; i < 400; i++) feed(30, Object.assign({}, HONEST));
                const s1b = levers();
                o.s1Throttled = s1a.density < 0.9 && s1a.loadScale < 0.5;
                o.s1Converged =
                    Math.abs(s1b.density - s1a.density) < 0.02 &&
                    Math.abs(s1b.loadScale - s1a.loadScale) < 0.02 &&
                    Math.abs(s1b.renderScale - s1a.renderScale) < 0.051;
                o.s1 = { a: s1a, b: s1b };
                // Studio-Regime: trotz gefallener Dichte KEIN Dispose+Rebuild (die tote Schleife).
                // AUSLÖSCHUNGS-WELLE (Beifang, V9.56-i nachgezogen): `_tickGrassThin` fiel in
                // V18.436 mit dem Tuft-Paket (die Wiese dünnt NIE — Studio-Gesetz); der Streu-
                // Thin ist der EINE verbliebene Hebel — die Probe liest nur noch ihn.
                st._frameOverBudget = false;
                let thinFired = 0;
                for (let i = 0; i < 25; i++) thinFired += r._tickFoliageThin(pos);
                o.s1NoRebuildLoop = thinFired === 0;
                o.s1EffectiveDensityOne = r._effectiveFoliageDensity() === 1;
                // ── S2: STREAMING-BURST (Rückstau) → Stream-Budget MAX (heilig) ──
                // `voxelMeshPending` ist lazy-init (Set) — nach einem Sync-Warmup existiert
                // es ggf. nicht: für die Probe anlegen (wie die Produktion es täte).
                const hadPendSet = !!st.voxelMeshPending;
                if (!st.voxelMeshPending) st.voxelMeshPending = new Set();
                const pend = st.voxelMeshPending;
                const hadPending = pend.size > 0;
                if (!hadPending) pend.add("__sim");
                for (let i = 0; i < 60; i++) feed(30, Object.assign({}, HONEST, { streaming: 20 }));
                const L = A.PERF_LEVERS;
                o.s2StreamSacred = Math.abs(st._voxelStreamBudgetMs - L.streamBudgetMs[1]) < 0.01;
                if (!hadPending) pend.delete("__sim");
                if (!hadPendSet && pend.size === 0) delete st.voxelMeshPending;
                // ── S3: STARKE GPU (7 ms) → alles wächst zurück ──
                for (let i = 0; i < 2200; i++) feed(7, Object.assign({}, HONEST));
                const s3 = levers();
                o.s3Recovered = s3.loadScale > 0.95 && s3.density > 0.95 && s3.renderScale > 0.95;
                o.s3 = s3;
                // ── S4: SESSION-ZEIT-INVARIANZ im Totband (err=0 → Stellgrößen eingefroren;
                // eine vergiftete/wachsende Metrik drückte sie über die Session weiter) ──
                const tMs = Number.isFinite(st.perfTargetMs) ? st.perfTargetMs : A.PERF_TARGET_MS;
                const gMs = Math.max(1, tMs - A.PERF_HEADROOM_MS);
                const dead = (tMs + gMs) / 2;
                for (let i = 0; i < 300; i++) feed(dead, Object.assign({}, HONEST));
                const s4a = levers();
                for (let i = 0; i < 2400; i++) feed(dead, Object.assign({}, HONEST)); // „9 Minuten später"
                const s4b = levers();
                let s4MaxDrift = 0;
                for (const k of Object.keys(s4a)) {
                    const d = Math.abs((s4b[k] || 0) - (s4a[k] || 0));
                    if (d > s4MaxDrift) s4MaxDrift = d;
                }
                o.s4MaxDrift = +s4MaxDrift.toFixed(6);
                o.s4Invariant = s4MaxDrift < 0.001;
                o.s4 = { a: s4a, b: s4b };
                o.gpuAppliersDrove = rsApplied > 0; // die Sim fuhr die echten Zweige (nicht vakuös)
                // ── S5: DER GERÄTE-SEED (18.07., „das Geräte-Profil ist Telemetrie,
                // kein Regler-Seed" fiel) — die EINE Profil-Quelle urteilt Klassen,
                // der Sense-Init KONSUMIERT den Seed, headless bleibt byte-alt. ──
                {
                    const defO = (obj, k, v) => Object.defineProperty(obj, k, { get: () => v, configurable: true });
                    const undefO = (obj, k) => delete obj[k];
                    const fakeAdapter = (info) => {
                        st.renderer.backend = { adapter: { info } };
                    };
                    const prevBackend = st.renderer.backend;
                    const prof = (info, cores, mem, dpr, w, h) => {
                        r._geraeteProfilMemo = null;
                        fakeAdapter(info);
                        defO(navigator, "hardwareConcurrency", cores);
                        defO(navigator, "deviceMemory", mem);
                        defO(window, "devicePixelRatio", dpr);
                        defO(window, "innerWidth", w);
                        defO(window, "innerHeight", h);
                        return r._geraeteProfil();
                    };
                    const pStark = prof({ vendor: "nvidia", architecture: "ampere" }, 24, 32, 1, 1920, 1080);
                    const pSchwach = prof({ vendor: "arm", architecture: "valhall" }, 8, 8, 1, 800, 600);
                    const pMittel = prof({ vendor: "intel", architecture: "gen-12lp" }, 12, 16, 2, 1440, 765);
                    o.s5 = { pStark, pSchwach, pMittel };
                    o.s5Klassen =
                        pStark.klasse === "stark" &&
                        pStark.seed === 1 &&
                        pSchwach.klasse === "schwach" &&
                        Math.abs(pSchwach.seed - 0.45) < 1e-9 &&
                        pMittel.klasse === "mittel" &&
                        Math.abs(pMittel.seed - 0.6) < 1e-9; // 0.7 − 0.1 Hi-DPI-Zuschlag (4.4 MPix)
                    // KONSUM: ein frischer Sense-Init (non-headless, Mittel-Profil aktiv)
                    // startet loadScale AM SEED — nicht bei optimistischer 1.
                    r._geraeteProfilMemo = null;
                    st.perfSense = null;
                    feed(17, Object.assign({}, HONEST));
                    o.s5SeedStart = st.perfSense ? st.perfSense.seedStart : null;
                    o.s5SeedKonsumiert =
                        st.perfSense &&
                        Math.abs(st.perfSense.seedStart - 0.6) < 1e-9 &&
                        Math.abs(st.perfSense.loadScale - 0.6) < 0.06;
                    // HEADLESS BYTE-ALT: derselbe Init unter Null-Renderer ⇒ Seed 1.
                    st.renderer._isHeadlessNull = true;
                    r._geraeteProfilMemo = null;
                    st.perfSense = null;
                    feed(17, Object.assign({}, HONEST));
                    o.s5HeadlessAlt = st.perfSense && st.perfSense.seedStart === 1;
                    st.renderer._isHeadlessNull = false;
                    // Stubs zurücknehmen (die Gate-Hook-Lehre: sichern + wiederherstellen).
                    undefO(navigator, "hardwareConcurrency");
                    undefO(navigator, "deviceMemory");
                    undefO(window, "devicePixelRatio");
                    undefO(window, "innerWidth");
                    undefO(window, "innerHeight");
                    st.renderer.backend = prevBackend;
                    r._geraeteProfilMemo = null;
                    st.perfSense = null; // die finally-Faltung initialisiert headless-ehrlich neu
                }
                // ── S6: DER GRENZZYKLUS-SCHNITT (18.07., vierter Schöpfer-Trace: Radius
                // atmete 58↔130 m und baute dieselben Rand-Zellen im Kreis) — GEPULSTER
                // Kopfraum (kurze Ruhe-Fenster zwischen Über-Budget-Wellen) bewegt den
                // Radius NICHT mehr; ANHALTENDER Kopfraum wächst weiter (S3 bleibt). ──
                {
                    st.perfSense = null;
                    for (let i = 0; i < 600; i++) feed(30, Object.assign({}, HONEST)); // auf den Boden
                    const s6Start = st.foliageRadius;
                    for (let w = 0; w < 6; w++) {
                        for (let i = 0; i < 80; i++) feed(7, Object.assign({}, HONEST)); // kurzes Ruhe-Fenster
                        for (let i = 0; i < 20; i++) feed(30, Object.assign({}, HONEST)); // die Welle bricht
                    }
                    const s6NachPuls = st.foliageRadius;
                    o.s6PulsDelta = +Math.abs(s6NachPuls - s6Start).toFixed(2);
                    o.s6PulsStill = o.s6PulsDelta < 1e-6; // gepulster Kopfraum: der Radius steht
                    for (let i = 0; i < 1200; i++) feed(7, Object.assign({}, HONEST)); // anhaltende Ruhe
                    o.s6RuheWaechst = st.foliageRadius > s6NachPuls + 1;
                    o.s6 = { start: s6Start, nachPuls: s6NachPuls, nachRuhe: st.foliageRadius };
                }
            } finally {
                st.renderer._isHeadlessNull = _origHeadless;
                r._applyRenderScale = _origApplyRS;
                r._applyEffectiveShadowRange = _origApplySR;
                // headless-ehrlichen Zustand wiederherstellen (ein Fold im echten Modus)
                st._perfFrame = {};
                st._perfMarks = {};
                r._perfSenseFoldFrame(8, 0.0167);
            }
            o.restored = st.renderer._isHeadlessNull === _origHeadless && st._foliageDensityScale === 1;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Regler-Sim fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const f2 = (v) => (typeof v === "number" ? +v.toFixed(3) : v);
    const checks = [
        {
            name: `S1 schwache GPU: der Regler DROSSELT (loadScale ${f2(out.s1.a.loadScale)}, Dichte ${f2(out.s1.a.density)})`,
            pass: out.s1Throttled,
        },
        {
            name: `S1 KONVERGENZ: nach +400 Frames settled (Δdichte ${f2(Math.abs(out.s1.b.density - out.s1.a.density))}, ΔloadScale ${f2(Math.abs(out.s1.b.loadScale - out.s1.a.loadScale))}) — kein Pendeln`,
            pass: out.s1Converged,
        },
        {
            name: "S1 STUDIO-REGIME: trotz gefallener Dichte 0 Thin-Rebuilds + Dichte-Quelle=1 (die V18.427-Endlosschleife ist tot, live)",
            pass: out.s1NoRebuildLoop && out.s1EffectiveDensityOne,
        },
        {
            name: "S2 STREAMING IST HEILIG: Rückstau → Stream-Budget MAX trotz Render-Last (V18.282)",
            pass: out.s2StreamSacred,
        },
        {
            name: `S3 starke GPU: alles wächst zurück (loadScale ${f2(out.s3.loadScale)}, Dichte ${f2(out.s3.density)}, renderScale ${f2(out.s3.renderScale)})`,
            pass: out.s3Recovered,
        },
        {
            name: `S5 GERÄTE-SEED Klassen: stark=1 · schwach=0.45 · mittel-HiDPI=0.6 (${out.s5 ? [out.s5.pStark.klasse, out.s5.pSchwach.klasse, out.s5.pMittel.klasse].join("/") : "?"})`,
            pass: out.s5Klassen === true,
        },
        {
            name: `S5 SEED-KONSUM: frischer Sense-Init startet loadScale am Seed (${out.s5SeedStart}) · headless byte-alt (Seed 1: ${out.s5HeadlessAlt})`,
            pass: out.s5SeedKonsumiert === true && out.s5HeadlessAlt === true,
        },
        {
            name: `S6 GRENZZYKLUS-SCHNITT: gepulster Kopfraum bewegt den Radius NICHT (Δ ${out.s6PulsDelta}) · anhaltende Ruhe wächst (${out.s6 ? out.s6.nachPuls + "→" + out.s6.nachRuhe : "?"})`,
            pass: out.s6PulsStill === true && out.s6RuheWaechst === true,
        },
        {
            name: `S4 SESSION-ZEIT-INVARIANZ: identischer Input früh vs +2400 Frames ⇒ identische Stellgrößen (maxΔ ${out.s4MaxDrift})`,
            pass: out.s4Invariant,
        },
        {
            name: "die Sim fuhr die ECHTEN Nicht-Headless-Zweige (GPU-Anwender-Stubs wurden gerufen — nicht vakuös)",
            pass: out.gpuAppliersDrove,
        },
        { name: "SICHERN+WIEDERHERSTELLEN: headless-Zustand + Dichte=1 restauriert (gate-treu)", pass: out.restored },
    ];
    console.log("\n=== Regler-Simulation mit ehrlichen Zahlen (fold → regulate → actuate, die echte Kette) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Regler-Sim-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Der Regler ist gegen die ehrliche Metrik noch nicht bewiesen — vor der Schöpfer-Runde heilen.");
        process.exit(1);
    }
    console.log(
        "✅ Der Regler konvergiert, hält das Heilige, erholt sich und ist session-zeit-invariant — bereit für die Wahrheit."
    );
    process.exit(0);
})();

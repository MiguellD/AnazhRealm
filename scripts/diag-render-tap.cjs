#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-render-tap.cjs — DIE WAHRHEITS-WAND UM DEN RENDER-TAP (npm run gate:render-tap, W1)
//
// Die Wurzel: im r184-WebGPU-Info ist `render.calls` ein LEBENSZEIT-Zähler
// der render()-Aufrufe (`reset()` löscht ihn NICHT — nur drawCalls/frameCalls/
// triangles); der Tap las `.calls` → HUD („38108dc"), Flugschreiber UND der Regler
// (renderLoadMs = renderCalls × 0.011) waren mit einer session-linear WACHSENDEN
// Phantom-Zahl vergiftet → Dauer-Drosselung + Thin-Re-Stream-Endlosschleife.
// Diese Linse macht die Heilung STRUKTURELL unumkehrbar (Gesetz #0 — die Linse,
// nicht die Wachsamkeit): ein Fake-Info-Objekt mit EXAKTER r184-Semantik wird dem
// EINEN Tap untergeschoben (SICHERN+WIEDERHERSTELLEN, die Gate-Hook-Lehre) — liest
// je wieder ein Konsument den Lebenszeit-Zähler, wächst seine Zahl mit der Session
// und diese Invarianten werden rot (D3c: der Tap drawCalls-first beweist der Fake-Vertrag
// am Lauf, die Text-Proben am Tap und am Flugschreiber fielen). GPU-frei, hardware-unabhängig.
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser, warteAufWelt, urteilEnde } = require("./lib/welt-boot.cjs");
const server = statikServer();

(async () => {
    // REAL_RENDERER=1 → der ECHTE Vendor (swiftshader) statt des Fake-Vertrags: liest
    // renderer.info.render.drawCalls über N Frames und prüft NICHT-Monotonie (der
    // Lebenszeit-Detektor am echten r184-Info — die nightly Light-Real-Hälfte; der
    // GPU-freie Fake-Vertrag oben bleibt der CI-Pfad).
    const REAL = process.env.REAL_RENDERER === "1";
    await server.lausche(0);
    const browser = await starteBrowser({ art: REAL ? "linse" : "null", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((real) => {
        if (!real) window.__anazhHeadlessNullRenderer = true;
    }, REAL);
    let out = null;
    try {
        await server.zeige(page, 120000, "index.html", "networkidle0");
        await warteAufWelt(page, 120000);
        if (REAL) {
            // Der echte-Vendor-Pfad: der rAF-Loop rendert selbst — nur beobachten.
            const real = await page.evaluate(async () => {
                const samples = [];
                for (let i = 0; i < 60; i++) {
                    await sleep(50);
                    const info = st.renderer && st.renderer.info;
                    if (info && info.render) samples.push(info.render.drawCalls != null ? info.render.drawCalls : -1);
                }
                const grow = samples.filter((v, i) => i > 5 && v > samples[i - 1]).length;
                return {
                    n: samples.length,
                    first: samples[5],
                    last: samples[samples.length - 1],
                    monotonGrowth: grow > samples.length * 0.8,
                    hasDrawCalls: samples.every((v) => v >= 0),
                    senseRC: st.perfSense ? Math.round(st.perfSense.renderCalls || 0) : -1,
                };
            });
            await browser.close();
            server.close();
            console.log("\n=== Render-Tap REAL-Vendor-Kreuzcheck (swiftshader, r184-Info) ===");
            const rc = [
                { name: `der Vendor trägt render.drawCalls (${real.n} Samples)`, pass: real.hasDrawCalls },
                {
                    name: `drawCalls ist NICHT session-monoton (${real.first}→${real.last}) — pro-Frame-Semantik am echten Info`,
                    pass: !real.monotonGrowth,
                },
                {
                    name: `sense.renderCalls plausibel beschränkt (${real.senseRC})`,
                    pass: real.senseRC >= 0 && real.senseRC < 100000,
                },
            ];
            let rf = 0;
            for (const c of rc) {
                console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
                if (!c.pass) rf++;
            }
            process.exit(rf ? 1 : 0);
        }
        out = await page.evaluate(async () => {
            const o = {};
            // ── DER FAKE-INFO-VERTRAG (exakte r184-Semantik): `calls` wächst über die
            // LEBENSZEIT (reset() löscht ihn NICHT), `drawCalls` ist pro Frame. reset()
            // simuliert zugleich die Frame-Arbeit (7 Pässe × 1100 Draws) — der Tap liest
            // am Frame-Ende, was nach seinem reset() im Info steht (der echte Ablauf).
            const orig = st.renderer.info;
            const fake = {
                render: { calls: 0, drawCalls: 0, triangles: 0, frameCalls: 0 },
                memory: {},
                autoReset: false,
                reset() {
                    // r184: drawCalls/triangles/frameCalls fallen — calls NICHT (Lebenszeit).
                    this.render.drawCalls = 1100;
                    this.render.triangles = 3.1e6;
                    this.render.frameCalls = 7;
                    this.render.calls += 7; // der Lebenszeit-Zähler wächst JEDEN Frame weiter
                },
            };
            try {
                st.renderer.info = fake;
                st._frameOverBudget = false;
                // Phase 1 — 120 Frames „früh in der Session"
                for (let i = 0; i < 120; i++) {
                    r._gameLoopTick();
                    await sleep(0);
                }
                // Der Frame-Akku `_perfFrame` wird beim Fold KONSUMIERT (am Tick-Ende geleert) —
                // die pro-Frame-Wahrheit liest man an der EWMA: bei KONSTANTEM drawCalls=1100
                // konvergiert sie exakt auf 1100 (ein Lebenszeit-Leser läge nach 120 Frames ~840+
                // und STIEGE weiter — Phase 2 fängt genau das).
                o.senseEarly = st.perfSense ? st.perfSense.renderCalls : -1;
                o.lifetimeEarly = fake.render.calls;
                // Phase 2 — weitere 150 Frames „später in der Session" (der Lebenszeit-
                // Zähler ist jetzt ~2× so groß; eine vergiftete Kette WÜCHSE mit).
                for (let i = 0; i < 150; i++) {
                    r._gameLoopTick();
                    await sleep(0);
                }
                o.senseLate = st.perfSense ? st.perfSense.renderCalls : -1;
                o.lifetimeLate = fake.render.calls;
                o.senseIsScalar = typeof (st.perfSense && st.perfSense.renderCalls) === "number";
                // der Regler-Eingang: renderLoadMs aus der EHRLICHEN Zahl (bounded + flach über
                // die Session), während die vergiftete Kette (Lebenszeit × K) WEITER WÜCHSE
                const K = (window.AnazhRealm || AnazhRealm).PERF_RENDER_CALL_MS;
                o.renderLoadMs = +(o.senseLate * K).toFixed(2);
                o.renderLoadMsEarly = +(o.senseEarly * K).toFixed(2);
                o.poisonedEarly = +(o.lifetimeEarly * K).toFixed(2);
                o.poisonedLate = +(o.lifetimeLate * K).toFixed(2);
            } finally {
                st.renderer.info = orig; // WIEDERHERSTELLEN (die Gate-Hook-Lehre)
            }
            o.infoRestored = st.renderer.info === orig;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Render-Tap-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const driftAbs = Math.abs((out.senseLate || 0) - (out.senseEarly || 0));
    const checks = [
        {
            name: `der Tap liest den PRO-FRAME-Zähler (EWMA konvergiert exakt auf drawCalls=1100: ${Math.round(out.senseEarly)}) — nie Lebenszeit`,
            pass: Math.abs((out.senseEarly || 0) - 1100) < 5,
        },
        {
            name: `die Falle ist scharf: der Lebenszeit-Zähler wuchs (${out.lifetimeEarly}→${out.lifetimeLate}) — die Linse misst nicht vakuös`,
            pass: out.lifetimeLate > out.lifetimeEarly && out.lifetimeEarly >= 120 * 7,
        },
        {
            name: `sense.renderCalls ist BESCHRÄNKT (~1100: früh ${Math.round(out.senseEarly)}, spät ${Math.round(out.senseLate)}) statt session-linear`,
            pass: out.senseEarly > 200 && out.senseEarly < 2600 && out.senseLate > 200 && out.senseLate < 2600,
        },
        {
            name: `SESSION-ZEIT-INVARIANZ: gleiche Last früh wie spät ⇒ gleiche Zahl (Δ=${driftAbs.toFixed(1)} ≤ 60) — die Vergiftete-Zahl-KLASSE als Invariante`,
            pass: driftAbs <= 60,
        },
        {
            name: `der Regler-Eingang ist ehrlich: renderLoadMs flach (${out.renderLoadMsEarly}→${out.renderLoadMs} ms), die vergiftete Kette wüchse (${out.poisonedEarly}→${out.poisonedLate} ms)`,
            pass:
                out.renderLoadMs < 30 &&
                Math.abs(out.renderLoadMs - out.renderLoadMsEarly) <= 0.7 &&
                out.poisonedLate > out.poisonedEarly * 1.5,
        },
        {
            name: "sense.renderCalls ist ein SKALAR (HUD/Linsen lesen ihn direkt — die diag-turn-hang-.ewma-Falle)",
            pass: out.senseIsScalar === true,
        },
        {
            name: "das echte renderer.info ist WIEDERHERGESTELLT (die Gate-Hook-Lehre)",
            pass: out.infoRestored === true,
        },
    ];
    console.log("\n=== Render-Tap-Wahrheits-Wand (r184: calls=Lebenszeit · drawCalls=pro Frame) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Render-Tap-Invarianten OK.`);
    urteilEnde(fails, "⛔ Die vergiftete Zahl kann zurückkehren — ein Konsument liest den Lebenszeit-Zähler.", "✅ Der Render-Tap ist strukturell wahr: pro-Frame-Zähler, beschränkte sense-Zahl, session-invariant.");
})();

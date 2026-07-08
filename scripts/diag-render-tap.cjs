#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-render-tap.cjs — DIE WAHRHEITS-WAND UM DEN RENDER-TAP (npm run gate:render-tap, W1)
//
// Die V18.427-Wurzel: im r184-WebGPU-Info ist `render.calls` ein LEBENSZEIT-Zähler
// der render()-Aufrufe (`reset()` löscht ihn NICHT — nur drawCalls/frameCalls/
// triangles); der Tap las `.calls` → HUD („38108dc"), Flugschreiber UND der Regler
// (renderLoadMs = renderCalls × 0.011) waren mit einer session-linear WACHSENDEN
// Phantom-Zahl vergiftet → Dauer-Drosselung + Thin-Re-Stream-Endlosschleife.
// Diese Linse macht die Heilung STRUKTURELL unumkehrbar (Gesetz #0 — die Linse,
// nicht die Wachsamkeit): ein Fake-Info-Objekt mit EXAKTER r184-Semantik wird dem
// EINEN Tap untergeschoben (SICHERN+WIEDERHERSTELLEN, die Gate-Hook-Lehre) — liest
// je wieder ein Konsument den Lebenszeit-Zähler, wächst seine Zahl mit der Session
// und diese Invarianten werden rot. Dazu statisch: KEIN Render-Linsen-Skript liest
// `.calls` nackt (drawCalls-first), der Flugschreiber trägt das version-Feld
// (trennt alte vergiftete Traces). GPU-frei, hardware-unabhängig.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4402;
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

// ── Der STATISCHE Teil: kein Konsument liest den Lebenszeit-Zähler nackt ──
// (die drei Render-Linsen wanderten V18.427 mit — hier bleibt das so; die
// V18.267-Falle: Kommentare zitieren die Muster wörtlich → erst strippen.)
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
function nakedLifetimeReads(src) {
    const nc = stripComments(src);
    const naked = (nc.match(/render\.calls/g) || []).length;
    // gedeckt = als ??-/Ternär-Fallback HINTER einem drawCalls-Read in derselben Expression
    // ([^;] statt [^;\n] — ein prettier-umbrochener Ternär spannt Zeilen, bleibt EINE Expression)
    const covered = (nc.match(/drawCalls[^;]{0,160}render\.calls/g) || []).length;
    return Math.max(0, naked - covered);
}

(async () => {
    const staticChecks = [];
    for (const f of [
        "scripts/diag-render-load.cjs",
        "scripts/diag-arch-perf.cjs",
        "scripts/diag-shadow-pixel.cjs",
        "scripts/diag-turn-hang.cjs",
    ]) {
        const p = path.join(root, f);
        if (!fs.existsSync(p)) {
            staticChecks.push({ name: `${f} existiert (Konsumenten-Inventar)`, pass: false });
            continue;
        }
        const n = nakedLifetimeReads(fs.readFileSync(p, "utf8"));
        staticChecks.push({ name: `${f}: kein nackter render.calls-Read (${n} gefunden)`, pass: n === 0 });
    }
    {
        // Der Flugschreiber trennt vergiftete Alt-Traces: der Perf-Payload trägt `version:`
        // (≥ V18.427 = geheilte Traces) + sein drawCalls-Feld liest die (bounded) sense-Zahl,
        // nie ein rohes info-Objekt. Anker = das eindeutige drawCalls-Feld, version davor.
        const nc = stripComments(fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8"));
        const dcIdx = nc.search(/drawCalls:\s*Math\.round\(s\.renderCalls/);
        const before = dcIdx >= 0 ? nc.slice(Math.max(0, dcIdx - 2500), dcIdx) : "";
        staticChecks.push({
            name: "Flugschreiber: version-Feld im Perf-Payload (trennt vergiftete Alt-Traces) + drawCalls aus der sense-Zahl",
            pass: dcIdx >= 0 && /version:\s*AnazhRealm\.VERSION/.test(before),
        });
    }

    // REAL_RENDERER=1 → der ECHTE Vendor (swiftshader) statt des Fake-Vertrags: liest
    // renderer.info.render.drawCalls über N Frames und prüft NICHT-Monotonie (der
    // Lebenszeit-Detektor am echten r184-Info — die nightly Light-Real-Hälfte; der
    // GPU-freie Fake-Vertrag oben bleibt der CI-Pfad).
    const REAL = process.env.REAL_RENDERER === "1";
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: REAL
            ? ["--no-sandbox", "--use-angle=swiftshader", "--enable-unsafe-webgpu"]
            : ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument((real) => {
        if (!real) window.__anazhHeadlessNullRenderer = true;
    }, REAL);
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        if (REAL) {
            // Der echte-Vendor-Pfad: der rAF-Loop rendert selbst — nur beobachten.
            const real = await page.evaluate(async () => {
                const r = window.anazhRealm,
                    st = r.state;
                const samples = [];
                for (let i = 0; i < 60; i++) {
                    await new Promise((res) => setTimeout(res, 50));
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
            const r = window.anazhRealm,
                st = r.state;
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
                    await new Promise((res) => setTimeout(res, 0));
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
                    await new Promise((res) => setTimeout(res, 0));
                }
                o.senseLate = st.perfSense ? st.perfSense.renderCalls : -1;
                o.lifetimeLate = fake.render.calls;
                o.senseIsScalar = typeof (st.perfSense && st.perfSense.renderCalls) === "number";
                // der Regler-Eingang: renderLoadMs aus der EHRLICHEN Zahl (bounded + flach über
                // die Session), während die vergiftete Kette (Lebenszeit × K) WEITER WÜCHSE
                const K = (window.AnazhRealm || r.constructor).PERF_RENDER_CALL_MS;
                o.renderLoadMs = +(o.senseLate * K).toFixed(2);
                o.renderLoadMsEarly = +(o.senseEarly * K).toFixed(2);
                o.poisonedEarly = +(o.lifetimeEarly * K).toFixed(2);
                o.poisonedLate = +(o.lifetimeLate * K).toFixed(2);
            } finally {
                st.renderer.info = orig; // WIEDERHERSTELLEN (die Gate-Hook-Lehre)
            }
            o.infoRestored = st.renderer.info === orig;
            // der EINE Tap, kommentar-gestrippt: drawCalls-first (die Probe kann nicht
            // am erklärenden Kommentar vakuös grün werden — die V18.267-Klasse)
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\*[\s\S]*?\*\//g, "")
                    .replace(/\/\/[^\n]*/g, "");
            const lr = codeOf(r._loopRender);
            o.tapDrawCallsFirst =
                lr.includes("render.drawCalls") && lr.indexOf("render.drawCalls") < lr.indexOf("render.calls");
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
            name: "der EINE Tap ist drawCalls-first (kommentar-gestrippt — kein vakuöses Grün am Kommentar)",
            pass: out.tapDrawCallsFirst === true,
        },
        {
            name: "das echte renderer.info ist WIEDERHERGESTELLT (die Gate-Hook-Lehre)",
            pass: out.infoRestored === true,
        },
        ...staticChecks,
    ];
    console.log("\n=== Render-Tap-Wahrheits-Wand (r184: calls=Lebenszeit · drawCalls=pro Frame) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Render-Tap-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die vergiftete Zahl kann zurückkehren — ein Konsument liest den Lebenszeit-Zähler.");
        process.exit(1);
    }
    console.log("✅ Der Render-Tap ist strukturell wahr: pro-Frame-Zähler, beschränkte sense-Zahl, session-invariant.");
    process.exit(0);
})();

// V18.354 PHASE B — FRAME-BUDGET-SCHEDULER: beweist hardware-unabhängig die DISPATCH-LOGIK
// (reine Job-Kosten als Parameter, kein GPU) + die Produktions-Verdrahtung (kein Crash).
//   (1) BUDGET: der Dispatcher überschreitet das Budget NIE um mehr als EINEN Job
//   (2) PRIORITÄT: bei knappem Budget laufen hohe Prio, niedrige WARTEN
//   (3) STREAMING HEILIG: prio 0 läuft IMMER, auch bei leerem Budget (V18.282)
//   (4) IDLE: viel Budget → auch die niedrig-prioren Jobs kommen dran
//   (5) HEADLESS gate-treu: _deferrableBudgetMs() → Infinity (volle Arbeit wie der feste Pfad)
//   (6) PRODUKTION: useFrameScheduler=true → die Welt streamt weiter, kein Page-Error,
//       _loopVoxelStreaming routet zu _runFrameScheduler (CONSUM-Source-Probe)
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4413,
    root = path.resolve(__dirname, "..");
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
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
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
    page.setDefaultTimeout(340000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        if (typeof r._dispatchFrameJobs !== "function" || typeof r._makeFrameBudget !== "function")
            return { error: "scheduler methods missing" };

        // ---- synthetisches Job-Modell (Kosten als Parameter, kein GPU) ----
        const mkBudget = (totalMs) => {
            const b = r._makeFrameBudget(totalMs);
            b._synthSpent = 0; // synthetischer Modus
            return b;
        };
        const runScenario = (totalMs, specs) => {
            const b = mkBudget(totalMs);
            b.startFrame();
            const jobs = specs.map((sp) => ({
                name: sp.name,
                prio: sp.prio,
                run: () => b.addSynthetic(sp.cost),
            }));
            const ran = r._dispatchFrameJobs(jobs, b);
            return { ran, spent: b.spentMs(), totalMs };
        };

        const specs = [
            { name: "stream", prio: 0, cost: 5 },
            { name: "waterIso", prio: 1, cost: 4 },
            { name: "prebake", prio: 2, cost: 4 },
            { name: "foliageThin", prio: 3, cost: 4 },
            { name: "decoGrow", prio: 4, cost: 4 },
        ];
        const maxCost = Math.max(...specs.map((x) => x.cost));

        // (A) knappes Budget 10: stream(5)+waterIso(4)+prebake(4=13) → break; thin/grow warten
        const A = runScenario(10, specs);
        // (B) 0 Budget: nur das heilige stream läuft
        const B = runScenario(0, specs);
        // (C) Idle 100: alle laufen
        const C = runScenario(100, specs);

        // (5) Headless-Budget: den _isHeadlessNull-Zweig DIREKT testen (dieser Diag fährt den
        // echten swiftshader-Renderer, nicht den Null-Renderer → das Flag forcieren).
        const realBudget = r._deferrableBudgetMs();
        const prevHN = s.renderer ? s.renderer._isHeadlessNull : undefined;
        if (s.renderer) s.renderer._isHeadlessNull = true;
        const headlessBudget = r._deferrableBudgetMs();
        if (s.renderer) s.renderer._isHeadlessNull = prevHN;

        // (6) PRODUKTION: Scheduler-Pfad treiben
        const routesToScheduler = /_runFrameScheduler/.test(r._loopVoxelStreaming.toString());
        const hasRun = typeof r._runFrameScheduler === "function";
        const chunksBefore = s.voxelChunks ? s.voxelChunks.size : 0;
        const prevToggle = s.useFrameScheduler;
        s.useFrameScheduler = true;
        let prodErr = null;
        try {
            for (let i = 0; i < 120; i++) r._gameLoopTick(performance.now());
        } catch (e) {
            prodErr = String(e && (e.message || e));
        }
        const chunksAfter = s.voxelChunks ? s.voxelChunks.size : 0;
        s.useFrameScheduler = prevToggle;

        return {
            A,
            B,
            C,
            maxCost,
            headlessBudget,
            realBudget,
            routesToScheduler,
            hasRun,
            prodErr,
            chunksBefore,
            chunksAfter,
            isHeadless: !!(s.renderer && s.renderer._isHeadlessNull),
        };
    });

    console.log("\n===== V18.354 PHASE B — FRAME-BUDGET-SCHEDULER-VERIFIKATION =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (out.error) {
        console.log("FEHLER:", out.error);
        ok = false;
    } else {
        const has = (arr, n) => arr.indexOf(n) >= 0;
        console.log(`  (A) Budget 10: lief [${out.A.ran.join(", ")}] · spent ${out.A.spent}`);
        console.log(`  (B) Budget 0:  lief [${out.B.ran.join(", ")}]`);
        console.log(`  (C) Budget 100: lief [${out.C.ran.join(", ")}]`);
        console.log(
            `  Headless-Budget=${out.headlessBudget === null ? "Infinity" : out.headlessBudget} (real ${out.realBudget == null ? "Infinity" : out.realBudget.toFixed(1)}) · routesToScheduler=${out.routesToScheduler} · Chunks ${out.chunksBefore}→${out.chunksAfter}\n`
        );
        // (1) Budget: nie mehr als EINEN Job über das Budget
        check(
            out.A.spent <= out.A.totalMs + out.maxCost,
            `(1) BUDGET respektiert: spent ${out.A.spent} ≤ totalMs ${out.A.totalMs} + 1 Job (${out.maxCost})`
        );
        // (2) Priorität: hohe Prio laufen, niedrige warten
        check(
            has(out.A.ran, "stream") && has(out.A.ran, "waterIso") && has(out.A.ran, "prebake"),
            "(2a) hohe Prio (stream/waterIso/prebake) liefen"
        );
        check(
            !has(out.A.ran, "foliageThin") && !has(out.A.ran, "decoGrow"),
            "(2b) niedrige Prio (foliageThin/decoGrow) WARTETEN (Budget leer)"
        );
        // (3) Streaming heilig
        check(
            out.B.ran.length === 1 && has(out.B.ran, "stream"),
            "(3) STREAMING HEILIG: bei 0 Budget läuft NUR prio-0 (stream), kein anderer"
        );
        // (4) Idle
        check(out.C.ran.length === 5, `(4) IDLE: viel Budget → alle 5 Jobs liefen (${out.C.ran.length})`);
        // (5) Headless gate-treu (Flag forciert): Infinity = volle Deferrable-Arbeit wie der feste Pfad
        check(
            out.headlessBudget === Infinity || out.headlessBudget === null,
            `(5) HEADLESS gate-treu: _deferrableBudgetMs()=Infinity bei _isHeadlessNull (real ${out.realBudget?.toFixed?.(1)})`
        );
        // (6) Produktion
        check(out.routesToScheduler && out.hasRun, "(6a) _loopVoxelStreaming routet zu _runFrameScheduler (CONSUM)");
        check(!out.prodErr && !pageErr, `(6b) Scheduler-Pfad: kein Crash (prodErr=${out.prodErr})`);
        check(out.chunksAfter >= out.chunksBefore, `(6c) die Welt streamt weiter (${out.chunksBefore}→${out.chunksAfter})`);
    }
    console.log(`\n  ${ok ? "✅ PHASE B BEWIESEN" : "❌ FEHLGESCHLAGEN"}\n`);
    console.log("================================================================\n");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

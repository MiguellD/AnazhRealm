// V18.317 — Diag: WO GEHT DIE PER-FRAME-CPU-ZEIT HIN? (Schöpfer-Hypothese „ist es nicht durch
// den Nexus und die Emotionen?"). perfSense tappt nur physics/streaming/archCulling/render/
// creatures/waterIso — der Nexus/Emotion/Welt-Regel-Pfad ist NICHT separat gemessen (fällt in
// die untapped Frame-Zeit). Diese Diag wrappt die Autonom-Leben-Methoden + den Rest, fährt den
// VOLLEN _gameLoopTick (Render gestubbt → CPU-treu, hardware-unabhängig), und listet die teuersten.
// MISS zuerst (V18.260): die Zahl sagt, ob der Schöpfer recht hat — kein Raten.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4364,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    // Methoden VOR der Konstruktion am Prototyp wrappen (diag-startup-cost-Muster).
    await page.evaluateOnNewDocument(() => {
        const NAMES = [
            // Autonom-Leben (Schöpfer-Hypothese)
            "updatePlayerEmotions",
            "_tickEmotionContagion",
            "updateCreatureEmotions",
            "_tickWorldRules",
            "_loopNexusUpdate",
            "evolveNexus",
            "generateEvolution",
            "selfAwarenessAnalyze",
            "_crystallizeGestureRule",
            "finalizePendingOutcomes",
            "_loopSelfAnalysis",
            "grokSpeak",
            "grokTick",
            "dslRun",
            "dslEval",
            "dslCompose",
            "journalTick",
            "updateWorldInfo",
            // Der Rest des Loops (zum Vergleich)
            "updateCreatures",
            "_loopWeatherAndGrowth",
            "symphonyTick",
            "_tickHydrosphereAudio",
            "_loopRender",
            "_tickVoxelChunkStreaming",
            "_pruneDistantVoxelChunks",
            "_nexusPerfActuate",
        ];
        let _realm;
        Object.defineProperty(window, "anazhRealm", {
            configurable: true,
            get() {
                return _realm;
            },
            set(v) {
                _realm = v;
                if (v && v.constructor && !window.__wrapped) {
                    window.__wrapped = true;
                    window.__acc = {};
                    window.__accOn = false;
                    const proto = v.constructor.prototype;
                    for (const name of NAMES) {
                        const orig = proto[name];
                        if (typeof orig !== "function") continue;
                        window.__acc[name] = { n: 0, ms: 0, max: 0 };
                        proto[name] = function (...args) {
                            if (!window.__accOn) return orig.apply(this, args);
                            const t = performance.now();
                            const r = orig.apply(this, args);
                            const dt = performance.now() - t;
                            const a = window.__acc[name];
                            a.n++;
                            a.ms += dt;
                            if (dt > a.max) a.max = dt;
                            return r;
                        };
                    }
                }
            },
        });
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Warmup: render-gestubbt pumpen bis die Welt steht.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
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
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    // MESS-FENSTER: Zähler AN, N volle Ticks, Zeit messen. Lang genug, dass die
    // 24-s-Evolution + 30-s-Emotion-Cooldowns ein paar Mal feuern (sim-Zeit via tick).
    const N = Number(process.env.DIAG_TICKS) || 2000;
    const result = await page.evaluate(async (N) => {
        const r = window.anazhRealm;
        // worldRules-Zahl vorher/nachher (akkumulieren sie?)
        const rulesBefore = r.state.worldRules ? r.state.worldRules.length : 0;
        const abilitiesBefore = r.state.dsl && r.state.dsl.abilities ? r.state.dsl.abilities.length : 0;
        window.__accOn = true;
        const t0 = performance.now();
        let ticks = 0;
        // performance.now() läuft real; um die Cooldowns (24/30 s) zu treffen, treiben
        // wir die Sim-Zeit über den übergebenen Timestamp schneller (×30 sim-s pro tick-batch).
        const simStart = performance.now();
        for (let i = 0; i < N; i++) {
            // sim-Zeit beschleunigen, damit Nexus/Emotion mehrfach feuern
            const simNow = simStart + i * 50; // 50 ms sim-Schritt → N=2000 ≈ 100 s sim
            try {
                r._gameLoopTick(simNow);
            } catch (_e) {}
            ticks++;
            if (i % 20 === 0) await new Promise((res) => setTimeout(res, 0));
        }
        const wall = performance.now() - t0;
        window.__accOn = false;
        return {
            wall,
            ticks,
            acc: JSON.parse(JSON.stringify(window.__acc)),
            rulesBefore,
            rulesAfter: r.state.worldRules ? r.state.worldRules.length : 0,
            abilitiesBefore,
            abilitiesAfter: r.state.dsl && r.state.dsl.abilities ? r.state.dsl.abilities.length : 0,
            historyLen: r.state.dsl && r.state.dsl.history ? r.state.dsl.history.length : 0,
            pendingLen: r.state.dsl && r.state.dsl.pendingOutcomes ? r.state.dsl.pendingOutcomes.length : 0,
            architectures: r.state.architectures ? r.state.architectures.length : 0,
            creatures: r.state.creatures ? r.state.creatures.length : 0,
        };
    }, N);

    const rows = Object.entries(result.acc)
        .filter(([, a]) => a.n > 0)
        .sort((a, b) => b[1].ms - a[1].ms);
    const perTick = (ms) => (ms / result.ticks).toFixed(3);
    console.log("\n===== LOOP-CPU-KOSTEN (Render gestubbt, CPU-treu) =====\n");
    console.log(`  ${result.ticks} Ticks in ${result.wall.toFixed(0)} ms Wall (${(result.wall / result.ticks).toFixed(2)} ms/Tick gemessen, inkl. Wrapper)`);
    console.log(`  Welt-Regeln: ${result.rulesBefore} → ${result.rulesAfter} · Fähigkeiten ${result.abilitiesBefore} → ${result.abilitiesAfter} · history ${result.historyLen} · pending ${result.pendingLen}`);
    console.log(`  Architektur ${result.architectures} · Kreaturen ${result.creatures}`);
    console.log("\n  Methode                          calls   total ms   ms/Tick   max ms");
    for (const [k, a] of rows) {
        console.log("  " + k.padEnd(32) + String(a.n).padStart(6) + " " + a.ms.toFixed(1).padStart(10) + " " + perTick(a.ms).padStart(9) + " " + a.max.toFixed(2).padStart(8));
    }
    const sumLife = rows
        .filter(([k]) => ["updatePlayerEmotions", "_tickEmotionContagion", "updateCreatureEmotions", "_tickWorldRules", "_loopNexusUpdate", "evolveNexus", "generateEvolution", "selfAwarenessAnalyze", "_crystallizeGestureRule", "finalizePendingOutcomes", "_loopSelfAnalysis", "grokSpeak", "grokTick", "dslRun", "dslEval", "dslCompose", "journalTick", "updateWorldInfo"].includes(k))
        .reduce((s, [, a]) => s + a.ms, 0);
    console.log(`\n  → NEXUS+EMOTION+WELT-REGEL-Pfad gesamt: ${sumLife.toFixed(1)} ms über ${result.ticks} Ticks = ${(sumLife / result.ticks).toFixed(3)} ms/Tick`);
    console.log(`     (16,7 ms = ein 60-fps-Frame-Budget. Anteil: ${((sumLife / result.wall) * 100).toFixed(1)}% der gemessenen Loop-Zeit)`);
    console.log("\n=======================================================\n");
    try {
        fs.writeFileSync(path.join(root, "artifacts", "diag-loop-cost.json"), JSON.stringify(result, null, 2));
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-loop-cost.json", JSON.stringify(result, null, 2));
        } catch (_e2) {}
    }
    await browser.close();
    server.close();
    process.exit(0);
})();

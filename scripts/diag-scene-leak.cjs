// SZENE-LECK-REPRODUKTION (Schöpfer-Flugschreiber: „Heap +1.39 MB/s, sceneChildren
// 113→216, archInstanceGroup×119"): der Spieler steht (springt nur) → es darf NICHTS
// wachsen. Diese Probe hält den Spieler FIX, lässt die autonomen Systeme (Nexus-Evolution,
// Welt-Regeln, Foliage-Ticks) laufen + sampelt scene.children PRO KATEGORIE über die Zeit
// → WELCHE Sammlung leckt. Reine Messung, keine Änderung.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4379,
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
const server = http.createServer((q, s) => {
    let p = q.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        s.statusCode = 403;
        return s.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            s.statusCode = 404;
            return s.end();
        }
        s.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        s.end(d);
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
            "--js-flags=--expose-gc",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let last = -1,
            stable = 0;
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
                if (sz === last) stable++;
                else {
                    stable = 0;
                    last = sz;
                }
                if (sz > 40 && stable > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    // den autonomen Nexus BESCHLEUNIGEN (Minuten → Sekunden komprimieren), Spieler fixieren
    await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        s.nexusEvolutionInterval = 0.4; // schnelle Evolution → das Leck in Sekunden sichtbar
        s.nexusAutonomyLimit = 100000; // nicht künstlich pausieren
        s._leakProbeFix = s.playerMesh
            ? { x: s.playerMesh.position.x, y: s.playerMesh.position.y, z: s.playerMesh.position.z }
            : null;
    });
    const sample = async () =>
        page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            // Spieler fix (Springen ändert nur y; X/Z halten = kein Streaming)
            if (s._leakProbeFix && s.playerMesh) {
                s.playerMesh.position.x = s._leakProbeFix.x;
                s.playerMesh.position.z = s._leakProbeFix.z;
            }
            return {
                sceneChildren: s.scene ? s.scene.children.length : 0,
                breakdown: r._flightRecorderSceneBreakdown ? r._flightRecorderSceneBreakdown() : null,
                creatures: s.creatures ? s.creatures.length : 0,
                architectures: s.architectures ? s.architectures.length : 0,
                worldRules: s.worldRules ? s.worldRules.filter((x) => x).length : 0,
                heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null,
            };
        });
    const pump = async (ms) => {
        const t0 = Date.now();
        while (Date.now() - t0 < ms) {
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (let k = 0; k < 10; k++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                }
            });
            await new Promise((res) => setTimeout(res, 16));
        }
    };

    const series = [];
    for (let i = 0; i < 8; i++) {
        series.push({ t: i * 5, ...(await sample()) });
        await pump(5000);
    }

    console.log("\n===== SZENE-LECK-REPRODUKTION (Spieler steht, autonome Systeme laufen) =====");
    console.log("  t(s)  sceneChildren  creatures  arches  worldRules  heapMB");
    for (const s of series)
        console.log(
            `  ${String(s.t).padStart(3)}    ${String(s.sceneChildren).padStart(6)}        ${String(s.creatures).padStart(4)}     ${String(s.architectures).padStart(4)}      ${String(s.worldRules).padStart(4)}     ${s.heapMB}`
        );
    const a = series[0],
        b = series[series.length - 1];
    const dt = b.t - a.t;
    console.log(
        `\n  ÜBER ${dt}s:  sceneChildren ${a.sceneChildren}→${b.sceneChildren} (+${b.sceneChildren - a.sceneChildren})  ·  arches ${a.architectures}→${b.architectures}  ·  creatures ${a.creatures}→${b.creatures}  ·  rules ${a.worldRules}→${b.worldRules}`
    );
    if (a.heapMB != null && b.heapMB != null)
        console.log(`  Heap ${a.heapMB}→${b.heapMB} MB  (${((b.heapMB - a.heapMB) / dt).toFixed(2)} MB/s)`);
    console.log(`\n  Kategorie-Snapshot START: ${(a.breakdown || []).join(", ")}`);
    console.log(`  Kategorie-Snapshot ENDE:  ${(b.breakdown || []).join(", ")}`);
    // pro-Kategorie-Wachstum berechnen
    const parse = (bd) => {
        const m = {};
        for (const e of bd || []) {
            const ix = e.lastIndexOf("×");
            if (ix > 0) m[e.slice(0, ix)] = Number(e.slice(ix + 1));
        }
        return m;
    };
    const ma = parse(a.breakdown),
        mb = parse(b.breakdown);
    const growth = Object.keys({ ...ma, ...mb })
        .map((k) => [k, (mb[k] || 0) - (ma[k] || 0)])
        .filter(([, d]) => d !== 0)
        .sort((x, y) => y[1] - x[1]);
    console.log(
        `  PRO-KATEGORIE-WACHSTUM: ${growth.map(([k, d]) => `${k} ${d >= 0 ? "+" : ""}${d}`).join(", ") || "(keine sichtbar — tiefer als top-8)"}`
    );
    console.log("===========================================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();

// Einmal-Probe (nicht CI): simuliert eine LANGE autonome Session headless und
// misst, ob irgendeine Sammlung UNBESCHRÄNKT wächst (das Leck). Treibt den Nexus
// hart (selfAwarenessAnalyze + direkte autonome Struktur-Spawns via DSL) und pumpt
// den Game-Loop dazwischen, damit das Cull-/Cap-Tick (tickArchitectureCulling →
// _capNexusStructures) läuft. Liest _flightRecorderSampleSizes() über die Zeit.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4362,
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
            "--js-flags=--expose-gc",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/LECK|leak|Leck/i.test(t)) console.log("[PAGE]", t);
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

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm,
            s = r.state;
        const samples = [];
        const doGc = () => {
            // mehrfach + kurze Yields → die Mark-Sweep + Finalizer durchlaufen lassen
            if (typeof gc !== "function") return false;
            try {
                gc();
                gc();
            } catch (_e) {}
            return true;
        };
        const sample = (label) => {
            const m = r._flightRecorderSampleSizes();
            samples.push({ label, ...m });
        };
        let spawnOk = 0,
            spawnErr = null,
            evoOk = 0,
            evoErr = null;
        const gcAvail = typeof gc === "function";
        const tick = (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
        };
        const kinds = ["spawn_village", "spawn_temple", "spawn_waterfall"];
        // GC-FLOOR-WELLEN: jede Welle spawnt+evolved+tickt, dann GC, dann misst den
        // RETAINED-Boden. Klettert der Boden welle-über-welle monoton → echtes Leck.
        // Bleibt er flach → die Roh-Heap-Drift war GC-Sägezahn (kein Leck).
        doGc();
        await new Promise((res) => setTimeout(res, 50));
        doGc();
        sample("floor_0");
        const WAVES = 8;
        for (let w = 1; w <= WAVES; w++) {
            for (let round = 0; round < 80; round++) {
                const k = kinds[round % kinds.length];
                try {
                    r.dslRun([k, ["far_player", 180, 380]], { source: "nexus" });
                    spawnOk++;
                } catch (e) {
                    spawnErr = spawnErr || String(e.message || e);
                }
                try {
                    r.selfAwarenessAnalyze();
                    evoOk++;
                } catch (e) {
                    evoErr = evoErr || String(e.message || e);
                }
                tick(4); // Cull/Cap + Nexus-Update laufen
            }
            tick(200); // den Cap-Evict-Tick (1/Frame) nachlaufen lassen
            // RETAINED-Boden messen: GC, kurz yielden, nochmal GC, dann lesen
            doGc();
            await new Promise((res) => setTimeout(res, 60));
            doGc();
            sample("floor_" + w);
        }
        const autoCount = (s.architectures || []).filter((e) => e && e.autonomous).length;
        return {
            samples,
            spawnOk,
            spawnErr,
            evoOk,
            evoErr,
            autoCount,
            gcAvail,
            maxNexus: (window.AnazhRealm || r.constructor).MAX_NEXUS_STRUCTURES,
        };
    });

    console.log("===== LECK-PROBE (GC-FLOOR-WELLEN, autonome Session) =====\n");
    console.log(
        `  spawns ok=${out.spawnOk}${out.spawnErr ? " err=" + out.spawnErr : ""} · evolutions ok=${out.evoOk}${
            out.evoErr ? " err=" + out.evoErr : ""
        } · gc verfügbar=${out.gcAvail}`
    );
    console.log(`  Cap MAX_NEXUS_STRUCTURES=${out.maxNexus} · autonome Architekturen am Ende=${out.autoCount}`);
    console.log("");
    const keys = [
        "sceneChildren",
        "architectures",
        "archInstanceGroups",
        "creatures",
        "voxelMeshCache",
        "pendingDisposals",
        "rigidBodies",
        "worldRules",
        "scatterRegions",
        "floatingIslands",
        "ufos",
        "dslHistory",
        "abilities",
        "logBuffer",
    ];
    const header =
        "  " + "label".padEnd(16) + "heap".padStart(8) + keys.map((k) => k.slice(0, 9).padStart(11)).join("");
    console.log(header);
    for (const sm of out.samples) {
        const row =
            "  " +
            String(sm.label).padEnd(16) +
            String(sm.heapMB == null ? "-" : sm.heapMB).padStart(8) +
            keys.map((k) => String(sm.sizes[k] ?? 0).padStart(11)).join("");
        console.log(row);
    }
    console.log("");
    // Wachstums-Urteil: floor_0 → letzter floor (POST-GC = retained)
    const b = out.samples.find((x) => x.label === "floor_0"),
        f = out.samples[out.samples.length - 1];
    // Post-GC-Heap-Boden je Welle: klettert er monoton → echtes Leck
    const floors = out.samples.filter((x) => /^floor_/.test(x.label));
    console.log("  POST-GC-HEAP-BODEN je Welle (klettert monoton = echtes Leck):");
    console.log("    " + floors.map((x) => `${x.label}=${x.heapMB == null ? "-" : x.heapMB}`).join("  "));
    if (floors.length >= 3 && floors[0].heapMB != null) {
        const first = floors[0].heapMB,
            last = floors[floors.length - 1].heapMB;
        const perWave = (last - first) / (floors.length - 1);
        console.log(
            `    → Boden ${first} → ${last} MB über ${floors.length - 1} Wellen = ${perWave.toFixed(2)} MB/Welle ` +
                `(${perWave > 1.5 ? "ECHTES LECK" : perWave > 0.5 ? "leichte Drift" : "FLACH — kein retained-Leck"})`
        );
    }
    console.log("");
    console.log("  WACHSTUM floor_0 → ende (Sammlungen):");
    for (const k of keys) {
        const d = (f.sizes[k] || 0) - (b.sizes[k] || 0);
        const flag = d > 50 ? "  <== WÄCHST STARK" : d > 10 ? "  <- wächst" : "";
        if (d !== 0) console.log(`    ${k.padEnd(20)} ${b.sizes[k]} → ${f.sizes[k]}  (${d > 0 ? "+" : ""}${d})${flag}`);
    }
    if (b.heapMB != null && f.heapMB != null) {
        const dt = Math.max(0.001, f.t - b.t);
        console.log(
            `    heapMB ${b.heapMB} → ${f.heapMB}  (${((f.heapMB - b.heapMB) / dt).toFixed(2)} MB/s über ${Math.round(dt)}s)`
        );
    }
    console.log("\n==================================================");
    await browser.close();
    server.close();
    process.exit(0);
})();

// Diag — BOOT-AUFSCHLÜSSELUNG (Schöpfer „ich warte etwa 15 s bis ich spawne, die Welt rendert").
// Patcht die schweren Boot-Methoden über den `window.anazhRealm`-Setter (feuert VOR init()) und misst
// die SYNCHRONE Main-Thread-Zeit jeder bis `_gameLoopTick` existiert (= die Kontrolle kommt). Null-
// Renderer → hardware-unabhängig (ein dominanter Synchron-Block friert jede Hardware). Zeigt, WO die
// Sekunden vor der Kontrolle hingehen + was schon deferiert ist (Kreaturen) vs was den Pfad blockt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4413;
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
        protocolTimeout: 180000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__bootT = {};
        window.__tNav = performance.now();
        let _ar;
        const METHODS = [
            "init",
            "generateTerrainWithParameters",
            "_worldgenComputeErosionAndTarns",
            "_worldgenSpawnFloatingIslands",
            "_worldgenBuildVoxelChunkCache",
            "_worldgenComputeAndBuildHydrosphere",
            "_bootDeferCreatures",
            "spawnCreatures",
            "_spawnOneInitialCreature",
            "_buildCreatureSkinGeometry",
            "_buildHumanoidRig",
            "_buildHumanGroup",
            "forgeAvatar",
            "_ensureGenesisPlatform",
            "_ensureSkyEnvironment",
        ];
        Object.defineProperty(window, "anazhRealm", {
            configurable: true,
            get() {
                return _ar;
            },
            set(v) {
                _ar = v;
                try {
                    const proto = v && v.constructor && v.constructor.prototype;
                    if (!proto) return;
                    const T = window.__bootT;
                    for (const name of METHODS) {
                        const orig = proto[name];
                        if (typeof orig !== "function" || orig.__wrapped) continue;
                        const w = function (...a) {
                            const t0 = performance.now();
                            try {
                                return orig.apply(this, a);
                            } finally {
                                T[name] = (T[name] || 0) + (performance.now() - t0);
                                T["#" + name] = (T["#" + name] || 0) + 1;
                            }
                        };
                        w.__wrapped = true;
                        proto[name] = w;
                    }
                    window.__tSet = performance.now();
                } catch (e) {
                    window.__bootErr = String(e);
                }
            },
        });
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            if (window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function") {
                window.__tReady = performance.now();
                break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const r = await page.evaluate(() => ({
        T: window.__bootT,
        tNav: window.__tNav,
        tSet: window.__tSet,
        tReady: window.__tReady,
        err: window.__bootErr || null,
    }));

    console.log("\n===== BOOT-AUFSCHLÜSSELUNG (Sync-Block vor der Kontrolle) =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    if (r.err) console.log("WRAP-ERR:", r.err);
    const T = r.T || {};
    const parseMs = r.tSet != null && r.tNav != null ? r.tSet - r.tNav : null;
    const initMs = r.tReady != null && r.tSet != null ? r.tReady - r.tSet : null;
    console.log(`  Script-Load+Parse+Konstrukt (nav→Setter):  ${parseMs != null ? parseMs.toFixed(0) : "?"} ms`);
    console.log(`  init() bis Kontrolle (Setter→_gameLoopTick): ${initMs != null ? initMs.toFixed(0) : "?"} ms\n`);
    const rows = Object.keys(T)
        .filter((k) => !k.startsWith("#"))
        .map((k) => ({ k, ms: T[k], n: T["#" + k] || 0 }));
    rows.sort((a, b) => b.ms - a.ms);
    console.log("  Methode                              Sync-ms   Aufrufe");
    for (const row of rows) {
        console.log(`  ${row.k.padEnd(36)} ${row.ms.toFixed(0).padStart(7)}   ${String(row.n).padStart(5)}`);
    }
    const creatures = (T._bootDeferCreatures || 0) + (T.spawnCreatures || 0);
    const skin = (T._buildCreatureSkinGeometry || 0) + (T._buildHumanoidRig || 0);
    console.log(
        `\n  → Kreaturen-Sync (headless sofort, in PROD deferiert): ${creatures.toFixed(0)} ms (davon Skin ${skin.toFixed(0)} ms)`
    );
    console.log(
        `  → PROD-Sync-Schätzung (init − Kreaturen):              ${initMs != null ? (initMs - creatures).toFixed(0) : "?"} ms`
    );
    console.log("");
    await browser.close();
    server.close();
    process.exit(0);
})();

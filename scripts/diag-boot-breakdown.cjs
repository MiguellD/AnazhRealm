// Diag — BOOT-AUFSCHLÜSSELUNG (Schöpfer „ich warte etwa 15 s bis ich spawne, die Welt rendert").
// Patcht die schweren Boot-Methoden über den `window.anazhRealm`-Setter (feuert VOR init()) und misst
// die SYNCHRONE Main-Thread-Zeit jeder bis `_gameLoopTick` existiert (= die Kontrolle kommt). Null-
// Renderer → hardware-unabhängig (ein dominanter Synchron-Block friert jede Hardware). Zeigt, WO die
// Sekunden vor der Kontrolle hingehen + was schon deferiert ist (Kreaturen) vs was den Pfad blockt.
// DIE WAND MISST ODER BRICHT (K16, Pruefung 13.10.: sie druckte "?" und EXIT 0): jede benannte Methode muss am Prototyp
// leben (eine gefallene, etwa die Kachel-Erosion, nennt sie beim Namen), Setter und Kontrolle muessen beobachtet sein, und
// vor der Kontrolle zaehlt nur, was vor ihr endete (bis 13.10. zaehlten die Kreaturen danach mit: Schaetzung -416 ms).
// Port: BOOT_BREAKDOWN_PORT (Standard 4413). `--selbsttest`: eine erfundene Methode muss die Wand ROT machen.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.BOOT_BREAKDOWN_PORT || 4413);
const SELBSTTEST = process.argv.includes("--selbsttest");
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
    await page.evaluateOnNewDocument((selbsttest) => {
        window.__anazhHeadlessNullRenderer = true;
        window.__bootT = {};
        window.__tNav = performance.now();
        let _ar;
        const METHODS = [
            "init",
            "generateTerrainWithParameters",
            "_worldgenSpawnFloatingIslands",
            "_worldgenBuildVoxelChunkCache",
            "_worldgenComputeAndBuildHydrosphere",
            "_bootDeferCreatures",
            "spawnCreatures",
            "_spawnOneInitialCreature",
            "_buildHumanoidRig",
            "_buildHumanGroup",
            "forgeAvatar",
            "_ensureGenesisPlatform",
            "_ensureSkyEnvironment",
        ];
        if (selbsttest) METHODS.push("_gibtEsNichtSelbsttest");
        window.__bootFehlt = [];
        window.__bootVorKontrolle = {};
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
                        if (typeof orig !== "function") {
                            window.__bootFehlt.push(name);
                            continue;
                        }
                        if (orig.__wrapped) continue;
                        const w = function (...a) {
                            const t0 = performance.now();
                            try {
                                return orig.apply(this, a);
                            } finally {
                                const ms = performance.now() - t0;
                                T[name] = (T[name] || 0) + ms;
                                if (window.__tReady == null) {
                                    const V = window.__bootVorKontrolle;
                                    V[name] = (V[name] || 0) + ms;
                                }
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
    }, SELBSTTEST);
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
        fehlt: window.__bootFehlt || null,
        V: window.__bootVorKontrolle || {},
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
    const V = r.V || {};
    // spawnCreatures laeuft IN _bootDeferCreatures: die Summe zaehlte die Kreaturen doppelt (Schaetzung -521 ms).
    const creatures = Math.max(V._bootDeferCreatures || 0, V.spawnCreatures || 0);
    const skin = V._buildHumanoidRig || 0;
    console.log(
        `\n  → Kreaturen-Sync vor der Kontrolle (in PROD deferiert): ${creatures.toFixed(0)} ms (davon Rig ${skin.toFixed(0)} ms)`
    );
    console.log(
        `  → PROD-Sync-Schätzung (init − Kreaturen):              ${initMs != null ? (initMs - creatures).toFixed(0) : "?"} ms`
    );
    // DAS URTEIL: gemessen ist nur, was beobachtet wurde — sonst ROT mit dem Grund.
    const rot = [];
    if (pageErr) rot.push("Seiten-Fehler: " + pageErr);
    if (r.err) rot.push("Haken-Fehler: " + r.err);
    if (r.tSet == null) rot.push("der Setter von window.anazhRealm feuerte nie");
    if (r.tReady == null) rot.push("die Kontrolle (_gameLoopTick) kam nie binnen 60 s");
    if (!r.fehlt) rot.push("der Haken lief nie (keine Methoden-Liste)");
    else for (const n of r.fehlt) rot.push("Methode fehlt am Prototyp: " + n);
    if (!(T.init > 0)) rot.push("init() ohne Messung");
    console.log("");
    for (const g of rot) console.log("  ROT " + g);
    const exit = SELBSTTEST ? (rot.some((g) => g.includes("_gibtEsNichtSelbsttest")) ? 0 : 1) : rot.length ? 1 : 0;
    console.log(
        SELBSTTEST
            ? "  SELBSTTEST: die erfundene Methode macht die Wand " + (exit === 0 ? "ROT (richtig)" : "NICHT rot (Linse blind)")
            : "  URTEIL: " + (rot.length ? "ROT (" + rot.length + ")" : "gemessen")
    );
    await browser.close();
    server.close();
    process.exit(exit);
})();

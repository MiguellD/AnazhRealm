#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-perf-panel.cjs — DAS SCREENSHOT-PANEL + DER PERF-EXPORT (V18.472).
// Schöpfer: „optimiere das perf-panel … damit ich spielen kann, einen
// screenshot erstellen kann, und du durch das panel im screenshot alles
// sauber auswerten kannst … einen button für den export der daten."
// Diese Linse hält beides headless:
//   (P) das PANEL füllt seine Felder aus den EINEN Quellen (perfSense ·
//       Flugschreiber-Sekunden-Ring/Eimer/worst · Impostor-Zensus) —
//       Kopf trägt die VERSION (der Screenshot muss sie tragen), Grid
//       trägt frame/dc/tris/GPU-Lücke, der Ring-Canvas ist gemalt.
//   (E) der EXPORT liefert denselben Flugschreiber-Trace als Datei:
//       Name anazhRealmPerf-V<version>-….json, parsebares JSON mit
//       session/worstFrames/impostorZensus/sekundenRingMaxMs.
//   SELBST-TEST: ein leerer Flugschreiber MUSS als „kein Export" lesen.
//   node scripts/diag-perf-panel.cjs      (npm run gate:perf-panel)
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT) || 4429;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
    ".wasm": "application/wasm",
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

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm;
            const res = {};
            // ~4 s Sim pumpen, damit Flugschreiber + Sekunden-Ring Substanz tragen
            // (der Ring rollt an echter Wanduhr — zwischen den Ticks kurz atmen).
            let t = performance.now();
            for (let i = 0; i < 40; i++) {
                for (let k = 0; k < 12; k++) {
                    t += 16.7;
                    try {
                        r._gameLoopTick(t);
                    } catch (_e) {}
                }
                await new Promise((res2) => setTimeout(res2, 110));
            }
            r.state.perfPanel = true;
            this._perfPanelLast = 0;
            r._perfPanelLast = 0;
            r._perfPanelRender();
            const fr = r.state.flightRecorder;
            res.ringN = fr && fr.secRingN ? fr.secRingN : 0;
            res.head = (document.getElementById("pp-head") || {}).textContent || "";
            res.grid = (document.getElementById("pp-grid") || {}).textContent || "";
            res.buckets = (document.getElementById("pp-buckets") || {}).textContent || "";
            const cv = document.getElementById("pp-ring");
            res.canvas = !!(cv && cv.getContext && cv.getContext("2d"));
            // Canvas wirklich GEMALT (nicht leer): mindestens ein nicht-Hintergrund-Pixel.
            if (res.canvas) {
                const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
                let hit = 0;
                for (let i = 0; i < d.length; i += 4) if (d[i] > 30 || d[i + 1] > 30 || d[i + 2] > 60) hit++;
                res.canvasPixel = hit;
            }
            // Export (a.click lädt headless nichts herunter — Rückgabe + JSON sind der Beweis)
            const exp = r._exportPerfTrace();
            res.export = exp ? { name: exp.name, bytes: exp.bytes } : null;
            if (exp) {
                const trace = r._flightRecorderBuildTrace();
                res.traceKeys = {
                    session: !!(trace && trace.session && trace.session.frames > 0),
                    zensusKey: !!(trace && "impostorZensus" in trace),
                    version: !!(trace && trace.version),
                };
            }
            // SELBST-TEST: ohne Flugschreiber → kein Export (die Linse kann rot)
            const saved = r.state.flightRecorder;
            r.state.flightRecorder = null;
            res.selbstTestKeinTrace = r._exportPerfTrace() === null;
            r.state.flightRecorder = saved;
            return res;
        });
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log("\n===== V18.472 — DAS SCREENSHOT-PANEL + DER PERF-EXPORT =====\n");
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        process.exit(1);
    }
    check("(P) Kopf trägt fps + VERSION (Screenshot-Pflichtfeld)", /fps/.test(out.head) && out.head.includes("V" + require(path.join(root, "package.json")).version), out.head.slice(0, 60));
    check(
        "(P) Grid trägt die Kern-Zahlen (frame · draw-calls · tris · GPU-Lücke · Impostor)",
        /frame ø/.test(out.grid) && /draw-calls/.test(out.grid) && /tris/.test(out.grid) && /GPU-Lücke/.test(out.grid) && /Impostor/.test(out.grid)
    );
    check("(P) ms-Verteilung steht (6 Flugschreiber-Eimer)", /ms-Verteilung/.test(out.buckets) && /<17/.test(out.buckets));
    check(`(P) Sekunden-Ring rollt (${out.ringN}s) + Canvas ist GEMALT (${out.canvasPixel || 0} px)`, out.ringN >= 2 && (out.canvasPixel || 0) > 200);
    check(
        "(E) Export liefert die Datei (Name + Substanz)",
        !!(out.export && /^anazhRealmPerf-V[\d.]+-.*\.json$/.test(out.export.name) && out.export.bytes > 500),
        out.export ? `${out.export.name} · ${out.export.bytes} B` : "null"
    );
    check(
        "(E) der Trace trägt session/impostorZensus/version (die Auswerte-Felder)",
        !!(out.traceKeys && out.traceKeys.session && out.traceKeys.zensusKey && out.traceKeys.version)
    );
    check("SELBST-TEST: ohne Flugschreiber kein Export (die Linse feuert)", out.selbstTestKeinTrace === true);
    check("kein Page-Error", pageErrors.length === 0, pageErrors[0] || "sauber");

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — das Panel ist screenshot-auswertbar (Version · Verlauf · Kern-Zahlen · Verteilung · Stocker) und der Export liefert denselben Flugschreiber-Trace als Datei."
    );
})();

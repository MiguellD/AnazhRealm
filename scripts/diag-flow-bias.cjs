// Diagnose — D8-Flow-Richtungs-Bias (Schöpfer-Hypothese V13.2-Audit: ein
// richtungs-abhängiger Terrain-/Wasser-Artefakt aus einer asymmetrischen
// Achsen-Behandlung). Misst die Verteilung der Flow-Richtungen in
// `state.erosion.flowTo` (D8-steepest-descent). Unverzerrt → ~gleich über die
// 8 Richtungen (terrain-getrieben mit Varianz). Ein Spike auf EINE Richtung
// (v.a. die zuerst-gescannte (-1,-1)-Diagonale) = Tie-Break-Bias (Z15725
// `< bestF` strict → erster gleicher Nachbar gewinnt) → richtungs-abhängige
// Drainage/Erosion = der vom Schöpfer gesehene „Treppenstufe in eine Richtung".
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4321;
const root = path.resolve(__dirname, "..");
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
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 20000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                if (r.state && r.state.erosion && r.state.erosion.flowTo) break;
            }
            await new Promise((res) => setTimeout(res, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const ero = r.state.erosion;
        if (!ero || !ero.flowTo) return { error: "keine erosion.flowTo" };
        const flowTo = ero.flowTo;
        const dim = ero.dim || Math.round(Math.sqrt(flowTo.length));
        out.dim = dim;
        // 8 Richtungen: key = (dj+1)*3 + (di+1), aber (0,0) ausgelassen.
        const hist = {};
        const label = {
            "-1,-1": "↖ (-1,-1)",
            "0,-1": "↑ (0,-1)",
            "1,-1": "↗ (1,-1)",
            "-1,0": "← (-1,0)",
            "1,0": "→ (1,0)",
            "-1,1": "↙ (-1,1)",
            "0,1": "↓ (0,1)",
            "1,1": "↘ (1,1)",
        };
        let total = 0;
        let sinks = 0;
        for (let j = 1; j < dim - 1; j++) {
            for (let i = 1; i < dim - 1; i++) {
                const idx = i + j * dim;
                const t = flowTo[idx];
                if (t < 0) {
                    sinks++;
                    continue;
                }
                const ti = t % dim;
                const tj = (t / dim) | 0;
                const di = ti - i;
                const dj = tj - j;
                const k = `${di},${dj}`;
                hist[k] = (hist[k] || 0) + 1;
                total++;
            }
        }
        out.total = total;
        out.sinks = sinks;
        out.hist = [];
        const keys = ["-1,-1", "0,-1", "1,-1", "-1,0", "1,0", "-1,1", "0,1", "1,1"];
        for (const k of keys) {
            const c = hist[k] || 0;
            out.hist.push({ dir: label[k] || k, count: c, pct: total > 0 ? +((100 * c) / total).toFixed(1) : 0 });
        }
        // Diagonalen vs Achsen + die spezifische Tie-Break-Diagonale (-1,-1).
        const diagKeys = ["-1,-1", "1,-1", "-1,1", "1,1"];
        const axisKeys = ["0,-1", "-1,0", "1,0", "0,1"];
        const sum = (ks) => ks.reduce((a, k) => a + (hist[k] || 0), 0);
        out.diagPct = total > 0 ? +((100 * sum(diagKeys)) / total).toFixed(1) : 0;
        out.axisPct = total > 0 ? +((100 * sum(axisKeys)) / total).toFixed(1) : 0;
        out.tieBreakDirPct = total > 0 ? +((100 * (hist["-1,-1"] || 0)) / total).toFixed(1) : 0;
        // Erwartung unverzerrt: die zuerst-gescannte (-1,-1) sollte NICHT
        // dominieren; bei 8 Richtungen ~12.5 % je, Diagonalen+Achsen ~50/50.
        return out;
    });
    console.log("\n========= D8-FLOW-RICHTUNGS-BIAS DIAGNOSE =========\n");
    if (report.error) {
        console.log("FEHLER:", report.error);
    } else {
        console.log(
            `Erosions-Grid: ${report.dim}×${report.dim} · ${report.total} Flow-Zellen · ${report.sinks} Senken`
        );
        console.log("\n-- Flow-Richtungs-Histogramm (unverzerrt ~12,5 % je) --");
        for (const h of report.hist) {
            const bar = "█".repeat(Math.round(h.pct / 1.5));
            const mark = h.dir.includes("(-1,-1)") ? "  ⟵ Tie-Break-Default (zuerst gescannt)" : "";
            console.log(`  ${h.dir.padEnd(12)} ${String(h.pct).padStart(5)} %  ${bar}${mark}`);
        }
        console.log(`\n  Diagonalen gesamt: ${report.diagPct} %  ·  Achsen gesamt: ${report.axisPct} %`);
        console.log(`  (-1,-1)-Tie-Break-Diagonale allein: ${report.tieBreakDirPct} %  (unverzerrt erwartet ~12,5 %)`);
        const verdict =
            report.tieBreakDirPct > 20
                ? "⚠️  BIAS BESTÄTIGT — (-1,-1) dominiert deutlich → Tie-Break-Default verzerrt die Drainage."
                : report.tieBreakDirPct > 15
                  ? "~ leichter Überhang auf (-1,-1) — möglicher Tie-Break-Einfluss, nicht dominant."
                  : "✓ kein starker (-1,-1)-Überhang — der Tie-Break ist nicht die dominante Richtungs-Quelle.";
        console.log(`\n  VERDIKT: ${verdict}`);
    }
    console.log("\n===================================================\n");
    await browser.close();
    server.close();
})();

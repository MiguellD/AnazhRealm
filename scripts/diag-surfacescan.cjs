// diag-surfacescan.cjs — V18.96 (G7): der `_voxelSurfaceY`-Envelope-Skip.
// BEWEIST drei Dinge, exit 0 nur wenn alle halten:
//  (A) BIT-EXAKTHEIT — der Skip ändert KEIN Ergebnis: alter Voll-Scan
//      (in-page repliziert, exakt dieselbe Schleife ohne Skip) vs neues
//      `_voxelSurfaceY` über ~3000 Spalten (±1024-Atlas-Region + Spawn-Ring)
//      → 0 Mismatches. Das ist die Determinismus-Wand: `_voxelSurfaceY`
//      speist den Hydro-Atlas — EIN Drift wäre eine andere Welt.
//  (B) FILL-EDIT ÜBER DEM ENVELOPE — ein hoher Aufschütt-Turm wird weiter
//      gefunden (der `_voxelEditsFillTop`-Wächter hebt die Skip-Grenze).
//  (C) PERF — Probe-Ratio + Zeit-Ratio alt/neu (informativ) + Gras-Build-Zeit.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4317;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".css": "text/css",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", err.message));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await page.waitForFunction(
        `window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.terrainEverGenerated === true`,
        { timeout: 180000, polling: 500 }
    );

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        // Der ALTE Voll-Scan: exakt dieselbe Schleife OHNE Envelope-Skip
        // (gleiche Start-Phase, gleiche 1.2-Schritte, gleiche Vergleiche).
        let oldProbes = 0;
        const oldScan = (x, z) => {
            const base = r.state.terrainBaseHeight || 0;
            const cfg = r._voxelChunkConfig();
            const floorY = base - cfg.floorDrop;
            const top = floorY + cfg.dimY * cfg.step - 8;
            const bottom = floorY + 12;
            let prevAir = true;
            for (let y = top; y >= bottom; y -= 1.2) {
                oldProbes++;
                const solid = r._terrainDensityAt(x, y, z) > 0;
                if (solid && prevAir) return y;
                prevAir = !solid;
            }
            return null;
        };
        // Neuer Pfad mit Proben-Zähler: wir zählen via Wrapper.
        let newProbes = 0;
        const origDensity = r._terrainDensityAt.bind(r);
        const countingDensity = (x, y, z) => {
            newProbes++;
            return origDensity(x, y, z);
        };

        // (A) BIT-EXAKTHEIT über die Atlas-Region + den Spawn-Ring.
        let rs = 0x9e3779b9 >>> 0;
        const rnd = () => {
            rs = (rs + 0x6d2b79f5) >>> 0;
            let t = rs;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const cols = [];
        for (let i = 0; i < 2600; i++) cols.push([(rnd() - 0.5) * 2048, (rnd() - 0.5) * 2048]);
        for (let i = 0; i < 400; i++) cols.push([(rnd() - 0.5) * 240, (rnd() - 0.5) * 240]);
        let mismatches = 0;
        let firstMismatch = null;
        let nullsOld = 0;
        const t0 = performance.now();
        const oldVals = cols.map(([x, z]) => oldScan(x, z));
        const tOld = performance.now() - t0;
        nullsOld = oldVals.filter((v) => v === null).length;
        r._terrainDensityAt = countingDensity;
        const t1 = performance.now();
        const newVals = cols.map(([x, z]) => r._voxelSurfaceY(x, z));
        const tNew = performance.now() - t1;
        r._terrainDensityAt = origDensity;
        for (let i = 0; i < cols.length; i++) {
            if (oldVals[i] !== newVals[i]) {
                mismatches++;
                if (!firstMismatch) firstMismatch = { x: cols[i][0], z: cols[i][1], alt: oldVals[i], neu: newVals[i] };
            }
        }

        // (B) FILL-EDIT über dem Envelope: Turm bei (33, 44), 30 m über der
        // Oberfläche aufgeschüttet → beide Scans müssen die NEUE Spitze sehen.
        const fx = 33;
        const fz = 44;
        const surfBefore = r._voxelSurfaceY(fx, fz);
        const macro = r._terrainMacroSurfaceY(fx, fz);
        const fillY = (Number.isFinite(macro) ? macro : 20) + 30;
        r.fillVoxelSphere(fx, fillY, fz, 4);
        const oldAfter = oldScan(fx, fz);
        const newAfter = r._voxelSurfaceY(fx, fz);
        const fillSeen =
            oldAfter !== null && newAfter === oldAfter && newAfter > (surfBefore === null ? -999 : surfBefore) + 10;

        // (C) Gras-Build-Zeit (frischer Rebuild des Spawn-Chunks).
        let grassMs = null;
        try {
            if (r.state.voxelChunkGrass) r.state.voxelChunkGrass.delete("0,0");
            const g0 = performance.now();
            r._buildVoxelChunkGrass(0, 0);
            grassMs = +(performance.now() - g0).toFixed(1);
        } catch (e) {
            grassMs = "err:" + e.message;
        }

        return {
            cols: cols.length,
            mismatches,
            firstMismatch,
            nullsOld,
            probesOldPerCol: +(oldProbes / cols.length).toFixed(1),
            probesNewPerCol: +(newProbes / cols.length).toFixed(1),
            probeRatio: +(oldProbes / Math.max(1, newProbes)).toFixed(1),
            msOld: +tOld.toFixed(0),
            msNew: +tNew.toFixed(0),
            speedup: +(tOld / Math.max(0.1, tNew)).toFixed(1),
            fill: { surfBefore, fillY: +fillY.toFixed(1), oldAfter, newAfter, fillSeen },
            grassMs,
        };
    });

    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    const pass = out.mismatches === 0 && out.fill.fillSeen === true;
    console.log(
        pass
            ? `\nPASS — bit-exakt (0/${out.cols}), Fill-Turm gefunden, Proben ${out.probesOldPerCol}→${out.probesNewPerCol}/Spalte (${out.probeRatio}×), Zeit ${out.msOld}→${out.msNew} ms (${out.speedup}×)`
            : "\nFAIL — Drift oder Fill-Turm verfehlt"
    );
    process.exit(pass ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    process.exit(2);
});

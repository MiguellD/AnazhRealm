#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-grass-thin.cjs — DAS GRAS-NACH-DÜNNEN (npm run gate:grass-thin, V18.363)
//
// Das Gras ist die DOMINANTE kapazitäts-geregelte Last (V18.307, 83 %), las aber
// `_foliageDensityScale` NUR beim Erst-Bau → eine schon geladene Welt behielt ihr
// volles Gras beim Stehen/Drehen → der Regler konnte die dominante Last nicht
// senken (drab UND langsam zugleich, der Synergie-Verlust). `_tickGrassThin` (die
// Schwester zu `_tickFoliageThin`/Streu, V18.280) baut eine zu dichte Gras-Chunk
// dünner neu, wenn die geregelte Dichte gesunken ist. Diese Linse beweist headless:
// (a) Default scale=1 → KEIN Dünnen (volle Wiese, gate-treu), (b) gesunkene Dichte →
// die geladene Gras-Last SINKT, (c) über Budget → kein Dünnen (V18.282). GPU-frei.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4331;
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

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 60000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 150; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r.state;
            const o = {};
            const pos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
            const grassInstances = () => {
                let n = 0;
                if (st.voxelChunkGrass) for (const inst of st.voxelChunkGrass.values()) if (inst) n += inst.count || 0;
                return n;
            };
            o.hasThin = typeof r._tickGrassThin === "function";
            o.hasDensityMap = !!st.voxelChunkGrassDensity && st.voxelChunkGrassDensity.size > 0;
            // (1) Default-Dichte (headless → 1) → kein Dünnen (volle Wiese, gate-treu)
            st._foliageDensityScale = 1;
            st._frameOverBudget = false;
            const beforeFull = grassInstances();
            let thinnedAtFull = 0;
            for (let i = 0; i < 30; i++) thinnedAtFull += r._tickGrassThin(pos);
            o.noThinAtFullDensity = thinnedAtFull === 0 && grassInstances() === beforeFull;
            o.fullCount = beforeFull;
            // (2) Dichte gesunken (kämpfende HW) → die GELADENE Gras-Last SINKT
            st._foliageDensityScale = 0.4;
            st._frameOverBudget = false;
            const beforeThin = grassInstances();
            let thinSteps = 0;
            for (let i = 0; i < 200; i++) {
                if (r._tickGrassThin(pos) === 0) break;
                thinSteps++;
            }
            const afterThin = grassInstances();
            o.thinStepsRan = thinSteps;
            o.beforeThin = beforeThin;
            o.afterThin = afterThin;
            o.grassDropped = afterThin < beforeThin;
            o.dropFraction = beforeThin > 0 ? +(1 - afterThin / beforeThin).toFixed(2) : 0;
            // (3) über Budget → KEIN Dünnen (V18.282 — erst die Frame-Zeit)
            st._foliageDensityScale = 0.4;
            st._frameOverBudget = true;
            const beforeBudget = grassInstances();
            let thinnedOverBudget = 0;
            for (let i = 0; i < 10; i++) thinnedOverBudget += r._tickGrassThin(pos);
            o.noThinOverBudget = thinnedOverBudget === 0 && grassInstances() === beforeBudget;
            st._frameOverBudget = false;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Gras-Dünn-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }

    const checks = [
        {
            name: "_tickGrassThin existiert + Gras-Bau-Dichte wird gemerkt (voxelChunkGrassDensity)",
            pass: out.hasThin && out.hasDensityMap,
        },
        {
            name: `Default-Dichte (scale=1) → KEIN Dünnen (volle Wiese ${out.fullCount} Büschel, gate-treu)`,
            pass: out.noThinAtFullDensity,
        },
        {
            name: `Dichte gesunken (0.4) → die GELADENE Gras-Last SINKT (${out.beforeThin}→${out.afterThin}, −${Math.round((out.dropFraction || 0) * 100)}%, ${out.thinStepsRan} Chunks)`,
            pass: out.grassDropped,
        },
        {
            name: "Über Budget → KEIN Dünnen (V18.282: erst die Frame-Zeit, dann nachregeln)",
            pass: out.noThinOverBudget,
        },
    ];
    console.log("\n=== Gras-Nach-Dünnen (die dominante Last folgt dem EINEN Regler im Stand) ===");
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Gras-Dünn-Invarianten OK.`);
    if (fails) {
        console.log(
            "⛔ Das Gras folgt dem Regler im Stand noch nicht — der dominante Last-Träger bleibt außerhalb der Schleife."
        );
        process.exit(1);
    }
    console.log(
        "✅ Das Gras schrumpft im Stand auf die gemessene Kapazität (adaptiv, nicht geschnitten) — der Regler erreicht die dominante Last."
    );
    process.exit(0);
})();

// Diagnose Welle A — der 10-Sekunden-Ruckel. Misst die Main-Thread-Wallzeit
// der drei verdächtigen Operationen (Journal-DOM-Rebuild, Save-Snapshot+
// stringify+localStorage, Nexus-Spawn+Remesh) in einer bevölkerten Welt, um
// VOR dem Heilen die DOMINANTE Quelle zu identifizieren (V9.58-Disziplin).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4319;
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
    const browser = await puppeteer.launch({
        headless: true,
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
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Welt + Avatar + Voxel-Chunks + ein paar Strukturen pumpen.
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 10) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const median = (a) => (a.length ? a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)] : 0);
        const maxOf = (a) => (a.length ? Math.max(...a) : 0);

        // ---------- (1) JOURNAL-DOM-REBUILD ----------
        // Worst-case: ~200 Einträge, voller innerHTML-Rebuild. Wir füllen das
        // Journal auf den Cap, invalidieren die Signatur und messen den Rebuild.
        const j = r.state.worldJournal;
        for (let i = 0; i < 260; i++) {
            r.journalAppend("growth", "Ein neuer Bauplan entstand: test_struktur_" + i + ".", { i });
        }
        out.journalEntries = j.entries.length;
        const jList = document.getElementById("world-journal-list");
        const jSamples = [];
        for (let k = 0; k < 8; k++) {
            // Signatur invalidieren erzwingt den vollen Rebuild.
            if (jList) jList.dataset.signature = "force-" + k;
            const t = performance.now();
            r.renderWorldJournal();
            jSamples.push(+(performance.now() - t).toFixed(2));
        }
        out.journalDomNodes = jList ? jList.childElementCount : 0;
        out.journalRebuildMs = { median: median(jSamples), max: maxOf(jSamples), samples: jSamples };

        // ---------- (2) SAVE ----------
        const snapSamples = [];
        const strSamples = [];
        const setSamples = [];
        for (let k = 0; k < 5; k++) {
            let t = performance.now();
            const snap = r.buildStateSnapshot();
            snapSamples.push(+(performance.now() - t).toFixed(2));
            t = performance.now();
            const str = JSON.stringify(snap);
            strSamples.push(+(performance.now() - t).toFixed(2));
            out.snapshotBytes = str.length;
            t = performance.now();
            try {
                localStorage.setItem("__diag_stutter_probe", str);
            } catch (_e) {
                /* quota */
            }
            setSamples.push(+(performance.now() - t).toFixed(2));
        }
        try {
            localStorage.removeItem("__diag_stutter_probe");
        } catch (_e) {
            /* noop */
        }
        out.saveBuildSnapshotMs = { median: median(snapSamples), max: maxOf(snapSamples) };
        out.saveStringifyMs = { median: median(strSamples), max: maxOf(strSamples) };
        out.saveLocalStorageMs = { median: median(setSamples), max: maxOf(setSamples) };
        out.saveTotalMaxMs = +(
            maxOf(snapSamples) +
            maxOf(strSamples) +
            maxOf(setSamples)
        ).toFixed(2);

        // ---------- (3) NEXUS-SPAWN + REMESH ----------
        // Wir wrappen _remeshVoxelChunksAround + spawnArchitecture, treiben dann
        // mehrere Nexus-Evolutionen durch die Queue und messen den Frame, in dem
        // gespawnt/remesht wird.
        const acc = {};
        const origs = {};
        const wrap = (name) => {
            if (typeof r[name] !== "function") return;
            origs[name] = r[name].bind(r);
            acc[name] = { ms: 0, n: 0, max: 0 };
            r[name] = (...args) => {
                const t = performance.now();
                const res = origs[name](...args);
                const dt = performance.now() - t;
                acc[name].ms += dt;
                acc[name].n++;
                if (dt > acc[name].max) acc[name].max = dt;
                return res;
            };
        };
        ["_remeshVoxelChunksAround", "spawnArchitecture", "dslRun"].forEach(wrap);

        // Pro Nexus-Zyklus: evolveNexus queued, _loopNexusUpdate drained einen.
        const nexusFrameMs = [];
        if (r.nexus && typeof r.evolveNexus === "function" && typeof r._loopNexusUpdate === "function") {
            for (let cyc = 0; cyc < 12; cyc++) {
                r.evolveNexus(performance.now() / 1000);
                // den Frame messen, der die Queue abarbeitet (kann spawnen+remeshen)
                const t = performance.now();
                r._loopNexusUpdate();
                nexusFrameMs.push(+(performance.now() - t).toFixed(2));
            }
        }
        for (const m of Object.keys(origs)) r[m] = origs[m];
        out.nexusLoopUpdateMs = { median: median(nexusFrameMs), max: maxOf(nexusFrameMs) };
        out.nexusComponents = {};
        for (const k of Object.keys(acc)) {
            out.nexusComponents[k] = {
                totalMs: +acc[k].ms.toFixed(1),
                calls: acc[k].n,
                maxMs: +acc[k].max.toFixed(2),
            };
        }

        // ---------- KONTEXT ----------
        out.context = {
            chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
            architectures: (r.state.architectures || []).length,
            creatures: (r.state.creatures || []).length,
            blueprints: Object.keys(r.state.blueprints || {}).length,
            worldRules: (r.state.worldRules || []).length,
            saveIntervalS: r.state.saveInterval,
            nexusIntervalS: r.state.nexusEvolutionInterval,
        };
        return out;
    });

    console.log("\n========= WELLE A — STUTTER-DIAGNOSE =========\n");
    console.log("Kontext:", JSON.stringify(report.context));
    console.log("\n--- (1) Journal-DOM-Rebuild (worst-case, " + report.journalEntries + " Einträge) ---");
    console.log("  DOM-Knoten nach Rebuild:", report.journalDomNodes);
    console.log("  Rebuild ms: median=" + report.journalRebuildMs.median + " max=" + report.journalRebuildMs.max);
    console.log("\n--- (2) Save (Snapshot + stringify + localStorage) ---");
    console.log("  Snapshot bytes:", report.snapshotBytes);
    console.log("  buildStateSnapshot ms: median=" + report.saveBuildSnapshotMs.median + " max=" + report.saveBuildSnapshotMs.max);
    console.log("  JSON.stringify ms:     median=" + report.saveStringifyMs.median + " max=" + report.saveStringifyMs.max);
    console.log("  localStorage.setItem ms: median=" + report.saveLocalStorageMs.median + " max=" + report.saveLocalStorageMs.max);
    console.log("  SAVE TOTAL (max):", report.saveTotalMaxMs, "ms");
    console.log("\n--- (3) Nexus-Spawn + Remesh ---");
    console.log("  _loopNexusUpdate Frame ms: median=" + report.nexusLoopUpdateMs.median + " max=" + report.nexusLoopUpdateMs.max);
    const nc = Object.entries(report.nexusComponents).sort((a, b) => b[1].totalMs - a[1].totalMs);
    for (const [name, c] of nc) {
        console.log(`    ${name.padEnd(26)} total=${String(c.totalMs).padStart(7)}ms  calls=${String(c.calls).padStart(3)}  max=${c.maxMs}ms`);
    }
    console.log("\n--- VERDIKT (dominante Single-Frame-Quelle) ---");
    const verdict = [
        ["Journal-Rebuild", report.journalRebuildMs.max],
        ["Save (gesamt)", report.saveTotalMaxMs],
        ["Nexus-Frame", report.nexusLoopUpdateMs.max],
    ].sort((a, b) => b[1] - a[1]);
    for (const [n, ms] of verdict) console.log(`  ${n.padEnd(18)} ${ms} ms ${ms > 16 ? "  <-- BLOCKIERT (>16ms)" : ""}`);
    console.log("\n=============================================\n");
    await browser.close();
    server.close();
})();

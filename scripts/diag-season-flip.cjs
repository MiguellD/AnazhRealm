// V4-GATE — DER SAISON-FLIP IST PROGRESSIV (Null-Renderer, foundry-ON, GPU-frei): beweist, dass ein
// Saison-Wechsel NICHT alle Foundry-Instanzen in EINEM Frame tauscht (O(archs)-Spike + Vanish-Pop), sondern
// je Tick nur eine kleine Charge (FOUNDRY_SEASON_FLIP_PER_TICK) — die Instanz-Zahl bleibt konstant.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4513;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 180000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0; if (sz >= 25) break; }
            await sleep(6);
        }
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const t0 = performance.now(); while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        const FLIP = r.constructor.SEASON_FLIP_PER_TICK || 24;
        // Foundry-Bäume platzieren.
        for (let it = 0; it < 300; it++) { r.state._frameOverBudget = false; try { r._gameLoopTick && r._gameLoopTick(performance.now()); const pp = r.state.playerMesh && r.state.playerMesh.position; if (pp && r._tickScatterStreaming) r._tickScatterStreaming(pp); } catch (_e) {} await sleep(8); }
        const countFoundryTrees = () => (r.state.architectures || []).filter((e) => e && e.instFoundry && e.instanced).length;
        const before = countFoundryTrees();
        // Removes ZÄHLEN + dem Flip zuordnen: (a) synchron IM `_foundrySeasonChanged`-Call (der alte
        // O(archs)-Spike — muss jetzt 0 sein, die Arbeit wandert in die Queue); (b) je `_drainSeasonFlip`-
        // Call (die progressive Charge — muss <= SEASON_FLIP_PER_TICK sein). Die Rewarm-Churn (classic-
        // Re-Platzierung) ist PRE-EXISTING + separat budgetiert (48/Frame) — NICHT der Flip-Spike.
        let removeCount = 0;
        const origRemove = r._archInstanceRemove.bind(r);
        r._archInstanceRemove = function (e) { removeCount++; return origRemove(e); };
        const origDrain = r._drainSeasonFlip.bind(r);
        let maxDrainRemoves = 0;
        r._drainSeasonFlip = function (ms) { const b = removeCount; const out = origDrain(ms); const d = removeCount - b; if (d > maxDrainRemoves) maxDrainRemoves = d; return out; };
        // Saison wechseln → füllt die Flip-Queue (kein synchrones Entfernen mehr).
        r.state.season = r.state.season === "summer" ? "autumn" : "summer";
        const beforeCall = removeCount;
        r._foundrySeasonChanged();
        const flipCallRemoves = removeCount - beforeCall; // der alte Spike (jetzt 0)
        const queueAtFlip = (r._seasonFlipQueue && r._seasonFlipQueue.length) || 0;
        // Ticken bis Konvergenz (der Drain läuft im Scheduler von _gameLoopTick). Dip während Neu-Bake erwartet.
        let ticks = 0;
        for (let it = 0; it < 500; it++) {
            r.state._frameOverBudget = false;
            try { r._gameLoopTick && r._gameLoopTick(performance.now()); } catch (_e) {}
            ticks++;
            if (!r._seasonFlipQueue && countFoundryTrees() >= before - 2) break;
            await sleep(8);
        }
        r._archInstanceRemove = origRemove; r._drainSeasonFlip = origDrain;
        return { FLIP, before, queueAtFlip, flipCallRemoves, maxDrainRemoves, after: countFoundryTrees(), ticks, queueLeft: (r._seasonFlipQueue && r._seasonFlipQueue.length - r._seasonFlipCursor) || 0 };
    });
    await browser.close(); server.close();

    console.log("=== V4 — DER SAISON-FLIP IST PROGRESSIV (foundry-ON, Null-Renderer) ===");
    console.log(`  SEASON_FLIP_PER_TICK: ${out.FLIP}`);
    console.log(`  Foundry-Bäume vorher: ${out.before} · Flip-Queue-Länge: ${out.queueAtFlip}`);
    console.log(`  Removes SYNCHRON im _foundrySeasonChanged-Call: ${out.flipCallRemoves} (der alte O(archs)-Spike — muss 0 sein)`);
    console.log(`  MAX Removes je _drainSeasonFlip-Call: ${out.maxDrainRemoves} (muss <= ${out.FLIP} = progressiv)`);
    console.log(`  Konvergenz nach ${out.ticks} Frames · Bäume nachher: ${out.after} · Queue-Rest: ${out.queueLeft}`);
    const fails = [];
    if (out.before < 5) fails.push(`zu wenige Foundry-Bäume (${out.before}) — Linse misst nichts`);
    if (out.queueAtFlip <= out.FLIP) fails.push(`Queue (${out.queueAtFlip}) <= FLIP (${out.FLIP}) — der Flip war ohnehin klein, das Budget beweist nichts`);
    if (out.flipCallRemoves > 0) fails.push(`_foundrySeasonChanged entfernte ${out.flipCallRemoves} synchron (der O(archs)-Spike lebt — muss 0 sein)`);
    if (out.maxDrainRemoves > out.FLIP) fails.push(`MAX Drain-Removes ${out.maxDrainRemoves} > Budget ${out.FLIP} (nicht progressiv)`);
    if (out.after < out.before - 2) fails.push(`Instanz-Verlust nach Konvergenz: ${out.before} -> ${out.after} (Flip verlor Bäume)`);
    if (out.queueLeft > 0) fails.push(`Flip-Queue nicht abgearbeitet (${out.queueLeft} übrig)`);

    if (fails.length) { console.log(`\n❌ V4-Gate ROT:\n  - ${fails.join("\n  - ")}`); process.exit(1); }
    console.log(`\n✅ V4-Gate GRÜN — kein synchroner O(archs)-Spike (${out.flipCallRemoves} Removes im Flip-Call), der Drain verteilt <= ${out.FLIP}/Frame (Queue ${out.queueAtFlip} über ~${Math.ceil(out.queueAtFlip / out.FLIP)} Frames), die Instanz-Zahl erholt sich (${out.before} -> ${out.after}).`);
})();

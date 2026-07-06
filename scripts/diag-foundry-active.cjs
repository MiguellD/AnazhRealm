// IST DIE FOUNDRY-PIPELINE AKTIV? (Schöpfer: „die pipline noch nicht aktiv, robust, genial genug?").
// Kein Rendern — nur ZAHLEN: ist die Foundry ready? Wieviele Architektur-/Baum-Instanzen leben? Wieviele
// davon sind FOUNDRY (instFoundry)? Wie ist die LOD-Verteilung (L0/L1 Geometrie vs L2 Billboard)? So sehe
// ich, ob die Studio-Bäume wirklich in die Welt fliessen — oder ob die Naht schwach/inaktiv ist.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4505;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 60000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stub = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0; if (sz >= 20) break; }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const res = { foundry: {}, arch: {}, foundryEnabled: null };
        try { res.foundryEnabled = typeof r._foundryEnabled === "function" ? r._foundryEnabled() : "keine methode"; } catch (e) { res.foundryEnabled = "throw:" + e.message; }
        // Foundry aktiv machen + auf ready warten.
        let f = null;
        try { f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null; } catch (e) { res.foundry.err = e.message; }
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        res.foundry.ready = !!(f && f.ready);
        res.foundry.recipeCount = f ? f.recipeCount || 0 : 0;
        res.foundry.hasIframe = !!(f && f.iframe);
        // Der Welt Zeit geben, Bäume zu streamen (mehr Ticks).
        for (let i = 0; i < 400; i++) { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (i % 40 === 0) await sleep(20); }
        // Architektur-Instanzen zählen (Bäume sind Architektur). state.architecture ODER die Instanz-Gruppen.
        const st = r.state;
        let archEntries = 0, foundryEntries = 0, coldTrees = 0, classicTrees = 0;
        const lodCount = { 0: 0, 1: 0, 2: 0, other: 0 };
        const typeCount = {};
        try {
            const arr = st.architecture || st.architectures || null;
            if (arr && arr.forEach) {
                arr.forEach((e) => {
                    archEntries++;
                    const t = e.type || e._lodSpecies || "?";
                    typeCount[t] = (typeCount[t] || 0) + 1;
                    if (e.instFoundry) foundryEntries++;
                    const lod = e._lodLevel != null ? e._lodLevel : "other";
                    if (lod in lodCount) lodCount[lod]++; else lodCount.other++;
                    // Ist es ein Baum?
                    const sp = (e._lodSpecies || e.type || "") + "";
                    if (/baum|tree|eiche|fichte|tanne|birke|weide|mammut/i.test(sp)) {
                        if (e.instFoundry) foundryEntries; // schon gezählt
                        if (e._foundryCold) coldTrees++;
                    }
                });
            } else {
                res.arch.note = "state.architecture ist keine Liste: " + typeof arr;
            }
        } catch (e) { res.arch.err = e.message; }
        res.arch.entries = archEntries;
        res.arch.foundryEntries = foundryEntries;
        res.arch.lodCount = lodCount;
        res.arch.typeTop = Object.entries(typeCount).sort((a, b) => b[1] - a[1]).slice(0, 12);
        // Wieviele Bäume in Spieler-Nähe (die man beim Spawn sähe)?
        const pm = st.playerMesh;
        let near = 0, nearFoundry = 0;
        if (pm && st.architecture && st.architecture.forEach) {
            st.architecture.forEach((e) => {
                if (!e.position && !e.x) return;
                const ex = e.position ? e.position.x : e.x, ez = e.position ? e.position.z : e.z;
                const d = Math.hypot(ex - pm.position.x, ez - pm.position.z);
                const sp = (e._lodSpecies || e.type || "") + "";
                if (d < 60 && /baum|tree|eiche|fichte|tanne|birke|weide|mammut/i.test(sp)) { near++; if (e.instFoundry) nearFoundry++; }
            });
        }
        res.arch.treesNear60m = near;
        res.arch.treesNearFoundry = nearFoundry;
        // Foundry-Methoden vorhanden?
        res.methods = {
            ensureAssetFoundry: typeof r._ensureAssetFoundry,
            foundryRequest: typeof r._foundryRequest,
            foundryBuildGroup: typeof r._foundryBuildGroup,
            foundryRewarmColdTrees: typeof r._foundryRewarmColdTrees,
            foundryFlattenFor: typeof r._foundryFlattenFor,
        };
        return res;
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    process.exit(0);
})();

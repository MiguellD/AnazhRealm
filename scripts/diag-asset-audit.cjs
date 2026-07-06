// LAUFEN ALLE ASSET-KLASSEN DURCH DIE PIPELINE? (Schöpfer „alle Assets, die selbe Dichte, vollendet?").
// Echter Renderer + Foundry. Baut ein 3x3-Gitter, bepflanzt, konvergiert den Dock. Zaehlt PRO KLASSE
// (Baum/Fels/Kristall/Blume/Strauch) die World-Eintraege: foundry-platziert (Studio) vs grown/klassik vs
// kalt. Plus Gras (Halme). So sehe ich, welche Klasse Studio ist + wo die Dichte/Pipeline noch fehlt.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4569;
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
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 280000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sl = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 40000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true; r._bootWarmDone = true; stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state.voxelChunks && r.state.voxelChunks.size >= 1) break; }
            await sl(4);
        }
        const r = window.anazhRealm, s = r.state;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 25000) await sl(100);
        for (let cx = -1; cx <= 1; cx++) for (let cz = -1; cz <= 1; cz++) { try { r._ensureVoxelChunkAt(cx, cz, { forceSync: true }); } catch (_e) {} }
        for (let cx = -1; cx <= 1; cx++) for (let cz = -1; cz <= 1; cz++) { try { r._populateVoxelChunkVegetation(cx, cz); } catch (_e) {} }
        for (let i = 0; i < 100; i++) { s._frameOverBudget = false; s._frameChunksBuilt = false; try { r._foundryRewarmColdTrees(); r._gameLoopTick(performance.now()); } catch (_e) {} if (i % 15 === 0) await sl(25); }
        // Klassifiziere jede Architektur nach Foundry-Preset-KLASSE + Quelle.
        const classOf = (preset) => {
            if (["eiche", "fichte", "tanne", "birke", "weide", "mammut"].includes(preset)) return "baum";
            if (["findling", "basalt", "sediment", "zacken", "geroell"].includes(preset)) return "fels";
            if (preset === "kristalle") return "kristall";
            if (preset === "blume") return "blume";
            if (preset === "strauch") return "strauch";
            return "sonst";
        };
        const stats = {};
        const add = (cls, key) => { if (!stats[cls]) stats[cls] = { total: 0, foundry: 0, klassik: 0, cold: 0 }; stats[cls][key]++; stats[cls].total++; };
        for (const e of s.architectures || []) {
            const preset = r._foundryPresetForEntry(e);
            if (!preset) continue; // nicht-foundry-faehig (z.B. Bauwerke) -> ignorieren
            const cls = classOf(preset);
            if (e.instFoundry) add(cls, "foundry");
            else if (e.instanced || e.mesh) add(cls, "klassik");
            else add(cls, "cold");
        }
        // Gras separat.
        let grassBlades = 0, grassMeshes = 0;
        if (s.voxelChunkGrass && s.voxelChunkGrass.forEach) s.voxelChunkGrass.forEach((m) => { if (m && m.count) { grassBlades += m.count; grassMeshes++; } });
        // Der Grass-Baupfad: laeuft er durch die Foundry oder AnazhRealm-eigen?
        const grassSrc = typeof r._buildVoxelChunkGrass === "function" ? r._buildVoxelChunkGrass.toString().slice(0, 400) : "";
        const grassFoundry = /_foundry|foundryRequest|impostor/i.test(grassSrc);
        return { proKlasse: stats, gras: { halme: grassBlades, meshes: grassMeshes, laeuftDurchFoundry: grassFoundry } };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log("\nLESART: pro Klasse foundry>>klassik/cold => die Klasse laeuft durchs Studio. cold hoch => Bake haengt. klassik hoch => faellt auf AnazhRealm-Geometrie.");
    await browser.close(); server.close(); process.exit(0);
})();

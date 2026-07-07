// V3-GATE — KEIN ZWEITER BAUM-BÄCKER (Null-Renderer, foundry-ON, GPU-frei): beweist die P4-Invariante —
// bei lebender Foundry rendert KEIN Baum die Grammatik-Geometrie (der „83 batched-174k-Bäume"-Nachbau ist weg).
// Der Scatter trägt Bäume UND Fels/Kiesel als Studio-Asset (fscatter:*); die Grammatik erscheint nur für
// wirklich ungemappte Arten. Selbst-assertierend: ein Grammatik-BAUM in den Instanz-Gruppen → exit 1.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4511;
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
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; window.__anazhHeadlessSkinResCap = 64; });
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
        const o = { foundryEnabled: r._foundryEnabled ? r._foundryEnabled() : "nomethod" };
        const f = r._ensureAssetFoundry ? r._ensureAssetFoundry() : null;
        const t0 = performance.now(); while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        o.foundryReady = !!(f && f.ready);
        // Kräftig ticken → der Scatter streamt Regionen um den Spieler; Studio-Assets kommen an.
        for (let it = 0; it < 350; it++) {
            r.state._frameOverBudget = false;
            try {
                r._gameLoopTick && r._gameLoopTick(performance.now());
                const pp = r.state.playerMesh && r.state.playerMesh.position;
                if (pp && r._tickScatterStreaming) r._tickScatterStreaming(pp);
            } catch (_e) {}
            await sleep(10);
        }
        // Instanz-Gruppen (+ Batches) enumerieren: Schlüssel = Bauplan-Name#leaf[@region].
        const groups = [];
        const eat = (map) => { if (!map) return; for (const [k, g] of map) { let c = 0; if (g && g.mesh && Number.isFinite(g.mesh.count)) c = g.mesh.count; else if (g && Number.isFinite(g.count)) c = g.count; groups.push({ key: String(k), count: c }); } };
        eat(r.state.archInstanceGroups);
        eat(r.state.archBatches);
        // Klassifizieren: die FOUNDRY-Herkunft lebt im LEAF-Key (nach `#`): `f:`/`fimp:` = Foundry-Geometrie/
        // -Impostor (auch für die PLATZIERTE Architektur, deren Gruppen-NAME die Art `baum_tanne` trägt, aber
        // deren Leaf `f:tanne|…` ist). `fscatter:` im Namen = Foundry-Scatter. Ein GRAMMATIK-Baum hat einen
        // Baum-Namen UND einen nicht-foundry Leaf (numerischer Index / `grown_…`-Grammatik-Bauplan).
        const leafOf = (k) => { const i = k.indexOf("#"); return i >= 0 ? k.slice(i + 1) : ""; };
        const isFoundry = (k) => k.startsWith("fscatter:") || /^(f:|fimp:)/.test(leafOf(k));
        const isTreeName = (k) => /(^|[#@:_])baum_[a-z]+/.test(k) || /grown_baum_/.test(k);
        o.foundryScatterKeys = groups.filter((x) => x.key.startsWith("fscatter:") && x.count > 0).map((x) => x.key.split("#")[0]);
        o.grammarTreeGroups = groups.filter((x) => !isFoundry(x.key) && isTreeName(x.key) && x.count > 0).map((x) => ({ key: x.key, count: x.count }));
        o.totalGroups = groups.length;
        o.instancedGroups = groups.filter((x) => x.count > 0).length;
        // Foundry-Scatter-Presets (Art-Sicht): eiche/fichte… (Baum) + findling/basalt/geroell… (Fels) + kristalle.
        const presets = new Set();
        for (const k of o.foundryScatterKeys) { const m = k.match(/^fscatter:([a-z]+)/); if (m) presets.add(m[1]); }
        o.foundryPresets = Array.from(presets).sort();
        return o;
    });
    await browser.close(); server.close();

    console.log("=== V3 — KEIN ZWEITER BAUM-BÄCKER (Foundry-ON, Null-Renderer) ===");
    console.log(`  _foundryEnabled: ${out.foundryEnabled} · foundryReady: ${out.foundryReady}`);
    console.log(`  Instanz-Gruppen: ${out.instancedGroups}/${out.totalGroups} bestückt`);
    console.log(`  Foundry-Scatter-Presets: ${out.foundryPresets.join(", ") || "(keine)"}`);
    console.log(`  Grammatik-BAUM-Gruppen (müssen 0 sein): ${out.grammarTreeGroups.length}`);
    for (const g of out.grammarTreeGroups) console.log(`    ❌ ${g.key}  (${g.count} Instanzen)`);
    const fails = [];
    if (!out.foundryReady) fails.push("Foundry nicht ready");
    if (out.grammarTreeGroups.length > 0) fails.push(`${out.grammarTreeGroups.length} Grammatik-Baum-Gruppen`);
    // Positiv-Beweis: mindestens EIN Baum-Preset fliesst als Studio-Scatter (sonst misst die Linse nichts).
    const treePresets = out.foundryPresets.filter((p) => ["eiche", "fichte", "tanne", "birke", "weide", "mammut"].includes(p));
    if (out.foundryReady && treePresets.length === 0) fails.push("kein Studio-Baum im Scatter (Linse misst nichts)");

    if (fails.length) { console.log(`\n❌ V3-Gate ROT: ${fails.join(" · ")}`); process.exit(1); }
    console.log(`\n✅ V3-Gate GRÜN — bei lebender Foundry rendert kein Baum Grammatik; der Scatter trägt das Studio-Kleid (${treePresets.join("/")}${out.foundryPresets.some((p) => ["findling", "basalt", "sediment", "zacken", "geroell"].includes(p)) ? " + Fels" : ""}).`);
})();

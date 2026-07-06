// BEWEIST: DER NACHBAU IST AUS DER WELT RAUS (Schöpfer „der Nachbau muss weg, nicht ueberlagert"). Echter
// Renderer + Foundry AN, kein Render. Natuerlich streamen, dann die Baum-Instanz-Gruppen zaehlen nach
// Quelle: STUDIO [fscatter:.../foundry-impostor] vs NACHBAU [grown_baum_*]. Ziel: grown_baum-Instanzen -> 0,
// sobald die Foundry lebt [nur im schmalen Boot-Spalt/foundry-aus darf die Grammatik tragen].
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4543;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
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
        protocolTimeout: 200000,
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
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 50000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                r._bootWarmDone = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        // Ordentlich streamen lassen, damit die Foundry-Assets ankommen (wie der echte Boot, keine Gewalt).
        for (let i = 0; i < 240; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (i % 20 === 0) await sleep(25);
        }
        // Die Arch-Instanz-Gruppen zaehlen nach Quelle [der Gruppen-Key traegt den bpName].
        let studioInst = 0,
            nachbauInst = 0,
            studioGroups = 0,
            nachbauGroups = 0;
        const nachbauKeys = [];
        const groups = s.archInstanceGroups;
        if (groups && groups.forEach)
            groups.forEach((g, key) => {
                const k = key + "";
                if (!/baum|fscatter|fimp|eiche|fichte|tanne|birke|weide|mammut/i.test(k)) return; // nur Baum-Gruppen
                const count = g.mesh ? (g.mesh.isBatchedMesh ? g.next || 0 : g.mesh.count || 0) : g.next || 0;
                // KLASSIFIZIERE nach dem LEAF (nach '#'), nicht dem Namen: eine Foundry-Platzierung traegt den
                // grown-Bauplan-NAMEN [entry.type], aber ein FOUNDRY-Leaf [`f:...`] → das ist Studio, kein Nachbau.
                const isFoundry = /fscatter|fimp|#f:|:f:/i.test(k);
                if (isFoundry) {
                    studioInst += count;
                    studioGroups++;
                } else if (/grown_baum/i.test(k)) {
                    nachbauInst += count;
                    nachbauGroups++;
                    if (count > 0 && nachbauKeys.length < 8) nachbauKeys.push(k.slice(0, 44) + "=" + count);
                }
            });
        // Auch die Architektur-Eintraege: instFoundry vs klassik.
        let archFoundry = 0,
            archKlassik = 0;
        for (const e of s.architectures || []) {
            const sp = ((e._lodSpecies || e.type || "") + "").toLowerCase();
            if (!/baum/.test(sp)) continue;
            if (e.instFoundry) archFoundry++;
            else if (e.instanced || e.mesh) archKlassik++;
        }
        return {
            foundryReady: !!(f && f.ready),
            studio: { instanzen: studioInst, gruppen: studioGroups },
            nachbau: { instanzen: nachbauInst, gruppen: nachbauGroups, keys: nachbauKeys },
            architektur: { foundry: archFoundry, klassik: archKlassik },
        };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log(
        "\nLESART: nachbau.instanzen == 0 [oder winzig] → der Grammatik-Nachbau ist aus der Welt, sobald die Foundry lebt."
    );
    await browser.close();
    server.close();
    process.exit(0);
})();

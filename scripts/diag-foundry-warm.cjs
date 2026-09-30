// diag-foundry-warm.cjs — P3a-BEWEIS (W2): die Foundry ist ein WORKER und produziert in AnazhRealms
// EIGENEM Kontext echte Assets — auch HEADLESS (Null-Renderer), also im Gate-Kontext (heilt W1: vorher
// sah der Null-Renderer-Gate nur den Grammatik-Alt-Pfad, nie die echte Pipeline).
//
// Misst: (a) ms bis f.ready (der Studio-Worker bootet), (b) recipeCount (die Rezepte fliessen durch
// den Worker), (c) _foundryRequest("eiche"…) liefert echte Meshes (die Pipeline LIEST). GRÜN ⇒ der
// iframe-Produktionsweg ist ersetzt, der Gate testet den echten Pfad.
//   node scripts/diag-foundry-warm.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.WARM_PORT || 4551);
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
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // der GATE-Kontext (kein GPU) — genau hier muss die Pipeline lesen
        window.__anazhForceFoundry = true; // den Worker im Null-Renderer ERZWINGEN (W1-Beweis: liest die Pipeline headless?)
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Welt bereit (gameLoopTick als Funktion — renderer-unabhängig korrekt).
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });

    const S = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const out = {
            workerEnabled: false,
            hasWorker: false,
            readyMs: -1,
            recipeCount: 0,
            meshes: 0,
            verts: 0,
            err: null,
        };
        try {
            out.workerEnabled = r._foundryEnabled();
            const f = r._ensureAssetFoundry();
            if (!f) {
                out.err = "kein Foundry-Objekt";
                return out;
            }
            // auf f.ready warten (der Worker bootet die Studio-Kette + meldet ready über self.postMessage)
            const t0 = performance.now();
            const dl = t0 + 60000;
            while (!f.ready && performance.now() < dl) await new Promise((res) => setTimeout(res, 50));
            out.readyMs = f.ready ? Math.round(performance.now() - t0) : -1;
            // N2 (V9.56-i): f.worker entsteht seit dem manifest-getriebenen Boot ASYNC im
            // fetch-then — der ehrliche Lese-Moment ist NACH dem ready-Wait (vorher ist ein
            // false nur das Boot-Fenster, kein Befund; ready==true impliziert den Worker).
            out.hasWorker = !!(f && f.worker);
            if (!f.ready) {
                out.err = "Worker wurde nicht ready";
                return out;
            }
            // Der Rezept-Reply ist ein EIGENER Round-Trip NACH ready (get-recipes wird im
            // ready-Handler gepostet) — die Linse wartet auf die WAHRHEIT (Rezepte fliessen),
            // nicht auf den Timing-Zufall des 50-ms-Poll-Fensters (der Race stand seit dem
            // Prefetch-Fächer auf der Kippe und kippte mit dem IDB-Layer deterministisch).
            const dlR = performance.now() + 30000;
            while (!(f.recipeCount > 0) && performance.now() < dlR) await new Promise((res) => setTimeout(res, 100));
            out.recipeCount = f.recipeCount || 0;
            // DER KERN-BEWEIS: eine echte build-asset-Anfrage durch den Worker — liefert sie Meshes?
            const meshes = await r._foundryRequest("eiche", 7, 0, "summer");
            out.meshes = meshes ? meshes.length : 0;
            out.verts = meshes
                ? meshes.reduce((s, m) => {
                      const pos = m.position || (m.attributes && m.attributes.position);
                      const arr = pos && (pos.array || pos);
                      return s + (arr && arr.length ? (arr.length / 3) | 0 : 0);
                  }, 0)
                : 0;
        } catch (e) {
            out.err = (e && e.message) || String(e);
        }
        return out;
    });

    await browser.close();
    server.close();

    console.log("=== P3a — FOUNDRY-WARM (Worker produziert in AnazhRealm, headless) ===");
    console.log(`  _foundryEnabled(): ${S.workerEnabled}  ·  f.worker: ${S.hasWorker}`);
    console.log(`  ready nach: ${S.readyMs} ms  ·  recipeCount: ${S.recipeCount}`);
    console.log(`  _foundryRequest("eiche",7,0,summer): ${S.meshes} Meshes · ${S.verts} Verts`);
    if (S.err) console.log(`  Fehler: ${S.err}`);
    if (pageErrors.length) console.log("  Seiten-Fehler:", pageErrors.slice(0, 3));

    const ok = S.workerEnabled && S.hasWorker && S.readyMs >= 0 && S.recipeCount > 0 && S.meshes > 0 && S.verts > 100;
    if (!ok) {
        console.error("\n❌ ROT — die Worker-Pipeline liest im Gate-Kontext NICHT (P3a nicht bestätigt).");
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Foundry ist ein Worker + produziert echte Assets HEADLESS. Der Gate sieht den echten Pfad (W1 geheilt)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Warm-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

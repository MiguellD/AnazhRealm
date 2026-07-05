// PRUEFT DEN VORLAGEN-BAECKER IN DER FOUNDRY (L2): laeuft das ECHTE Studio-bakeImpostorAtlas
// offscreen in der Foundry (?asset-foundry=1, WebGL-Renderer im iframe) und liefert es einen
// echten 8-Winkel-Billboard-Atlas (Albedo + Normal) zurueck? Bootet AnazhRealm, holt die Foundry-
// Bruecke, postet `bake-impostor` fuer eiche, faengt die `impostor`-Antwort, und ZEICHNET den
// Albedo-Atlas (8 gestapelte Ansichten) + Normal-Atlas als Bild — so SEHE ich, dass die Ferne aus
// DEINEM Baecker kommt (kein Nachbau). MECHANIK = Payload-Zahlen, LOOK = das gerenderte Atlas-Bild.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4487;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
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
    await page.setViewport({ width: 900, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    page.on("console", (m) => {
        const t = m.text();
        if (/phyto|impostor|bake/i.test(t)) console.log("[BROWSER]", t.slice(0, 160));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 45000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const T = window.THREE;
        const res = { err: null };
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        if (!f || !f.ready) {
            res.err = "foundry nicht ready";
            return res;
        }

        // bake-impostor durch die Bruecke posten + die `impostor`-Antwort fangen.
        const payload = await new Promise((resolve) => {
            const onMsg = (ev) => {
                if (ev.source !== f.iframe.contentWindow) return;
                const m = ev.data;
                if (m && m.type === "impostor" && m.reqId === "imp1") {
                    window.removeEventListener("message", onMsg);
                    resolve(m.payload || null);
                }
            };
            window.addEventListener("message", onMsg);
            f.iframe.contentWindow.postMessage(
                { type: "bake-impostor", reqId: "imp1", presetId: "eiche", seed: 12345, season: "summer" },
                "*"
            );
            setTimeout(() => {
                window.removeEventListener("message", onMsg);
                resolve(null);
            }, 60000);
        });
        if (!payload) {
            res.err = "keine impostor-Antwort";
            return res;
        }
        res.cw = payload.cw;
        res.ch = payload.ch;
        res.V = payload.V;
        res.aspect = payload.aspect;
        res.height = payload.height;
        res.albedoLen = payload.albedo ? payload.albedo.length : 0;
        res.normalLen = payload.normal ? payload.normal.length : 0;
        // Nicht-leer? Zaehle Pixel mit Alpha>0 (die Silhouette) im Albedo.
        let opaque = 0;
        const a = payload.albedo;
        if (a) for (let i = 3; i < a.length; i += 4) if (a[i] > 20) opaque++;
        res.opaquePx = opaque;
        res.totalPx = a ? a.length / 4 : 0;

        // Den Atlas zeichnen (Albedo links, Normal rechts). Readback ist BOTTOM-UP -> Zeilen flippen.
        const cw = payload.cw,
            ch = payload.ch,
            V = payload.V,
            H = ch * V;
        const draw = (buf, sx) => {
            const cv = document.createElement("canvas");
            cv.width = cw;
            cv.height = H;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(cw, H);
            const row = cw * 4;
            for (let y = 0; y < H; y++) {
                const src = (H - 1 - y) * row,
                    dst = y * row;
                for (let i = 0; i < row; i++) img.data[dst + i] = buf[src + i];
            }
            ctx.putImageData(img, 0, 0);
            return cv;
        };
        const acv = draw(payload.albedo, 0);
        const ncv = draw(payload.normal, 0);
        // Auf schmale Kontakt-Bahn: Albedo | Normal nebeneinander, auf 200px Hoehe skaliert.
        const scale = 900 / H;
        const outW = Math.ceil(cw * scale) * 2 + 20,
            outH = Math.ceil(H * scale);
        const oc = document.createElement("canvas");
        oc.width = outW;
        oc.height = outH;
        const octx = oc.getContext("2d");
        octx.fillStyle = "#334";
        octx.fillRect(0, 0, outW, outH);
        octx.drawImage(acv, 0, 0, Math.ceil(cw * scale), outH);
        octx.drawImage(ncv, Math.ceil(cw * scale) + 20, 0, Math.ceil(cw * scale), outH);
        res.dataURL = oc.toDataURL("image/png");
        return res;
    });

    const { dataURL, ...meta } = out;
    console.log(JSON.stringify(meta, null, 2));
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "foundry-impostor.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/foundry-impostor.png (links Albedo · rechts Normal · 8 Ansichten gestapelt)");
    }
    await browser.close();
    server.close();
    const ok = out && out.opaquePx > 500 && out.aspect > 0 && out.height > 1;
    process.exit(ok ? 0 : 1);
})();

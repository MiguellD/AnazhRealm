// V18.317 — Diag: WIE VIEL HEAP/ARRAYBUFFER FRISST DER ECHTE RENDERER? (Schöpfer-Heap-Snapshot
// 19.558 ArrayBuffer/322 MB, aber die JS-Geometrie ist nur ~32 MB/4081 Buffer [diag-buffer-census]
// → die 5×-Lücke muss renderer-seitig sein [WebGPU uniform/bind-group/staging buffer]). Beweis:
// Heap + ArrayBuffer-Zahl GESTUBBT (kein Render) vs nach N ECHTEN Frames messen.
// ArrayBuffer-Zahl via CDP Runtime.queryObjects (zählt LEBENDE ArrayBuffer-Instanzen).
//
// ⚠️ ECHTE-GPU-WERKZEUG: swiftshader im CI-Container braucht >2 min/Frame für die ~2,5-M-Dreieck-
// Szene → das CDP-protocolTimeout reißt (gemessen V18.317). Auf einer ECHTEN GPU (Schöpfer-
// Maschine) läuft es flüssig + zeigt den renderer-seitigen ArrayBuffer-Sprung direkt. Im
// Container ist die JS-Wahrheit `diag-buffer-census` (render-frei, gate-treu) maßgeblich.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4363,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: Number(process.env.DIAG_PROTO_MS) || 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    const client = await page.target().createCDPSession();
    await client.send("HeapProfiler.enable");
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // CDP: zähle lebende ArrayBuffer-Instanzen (collectGarbage zuerst → nur Retained)
    const countArrayBuffers = async () => {
        await client.send("HeapProfiler.collectGarbage");
        const { result: proto } = await client.send("Runtime.evaluate", { expression: "ArrayBuffer.prototype" });
        const { objects } = await client.send("Runtime.queryObjects", { prototypeObjectId: proto.objectId });
        const { result } = await client.send("Runtime.callFunctionOn", {
            objectId: objects.objectId,
            functionDeclaration: "function(){ let n=0,b=0; for(const a of this){ n++; b+=a.byteLength||0; } return n+'|'+b; }",
            returnByValue: true,
        });
        const [n, b] = String(result.value).split("|").map(Number);
        return { n, mb: +(b / 1048576).toFixed(1) };
    };
    const heap = () => page.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : -1));

    // Warmup gestubbt bis settled
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__realRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const ab0 = await countArrayBuffers();
    const h0 = await heap();
    console.log(`\n  GESTUBBT (kein echter Render): Heap ${h0} MB · ArrayBuffer ${ab0.n} (${ab0.mb} MB)`);

    // Echte Frames rendern (lazy WebGPU-Backend allokiert uniform/bind-group buffer). Auf
    // swiftshader extrem langsam (>2 min/Frame für ~2,5 M Dreiecke) → graceful, nicht crashen.
    const N = Number(process.env.DIAG_FRAMES) || 3;
    let frameMs = "-1",
        renderOk = false;
    try {
        frameMs = await page.evaluate(async (N) => {
            const r = window.anazhRealm,
                s = r.state;
            const real = window.__realRender;
            if (!real || !s.scene || !s.camera) return -1;
            s.renderer.render = real; // un-stub
            const ts = [];
            for (let i = 0; i < N; i++) {
                const t = performance.now();
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ts.push(+(performance.now() - t).toFixed(0));
                await new Promise((res) => setTimeout(res, 2));
            }
            return ts.join(",");
        }, N);
        renderOk = frameMs !== "-1";
        console.log(`  ${N} echte Frames gerendert (ms je Frame): ${frameMs}`);
    } catch (e) {
        console.log(`  ⚠️ ECHTER RENDER abgebrochen (${String(e).split("\n")[0]}).`);
        console.log(`     swiftshader ist für diese Szene zu langsam → auf einer ECHTEN GPU laufen lassen`);
        console.log(`     (oder DIAG_PROTO_MS höher). Die JS-Wahrheit liefert diag-buffer-census (render-frei).`);
    }

    if (renderOk) {
        try {
            const ab1 = await countArrayBuffers();
            const h1 = await heap();
            console.log(`  NACH ECHTEM RENDER: Heap ${h1} MB · ArrayBuffer ${ab1.n} (${ab1.mb} MB)`);
            console.log(`\n  ===== VERDIKT =====`);
            console.log(`  Δ ArrayBuffer durch den Renderer: +${ab1.n - ab0.n} (+${(ab1.mb - ab0.mb).toFixed(1)} MB) · Δ Heap +${h1 - h0} MB`);
            console.log(
                `  → ${ab1.n - ab0.n > 2000 ? "RENDERER-SEITIG bestätigt: der echte WebGPU-Renderer allokiert tausende ArrayBuffer (uniform/bind-group/staging) — die JS-Geometrie ist nur ~4081." : "Renderer fügt wenig hinzu — die Buffer leben anderswo."}`
            );
            console.log(`\n  (Schöpfer-Snapshot: 19.558 ArrayBuffer / 322 MB. Hier swiftshader ≈ relativ, nicht absolut.)\n`);
        } catch (e) {
            console.log(`  ⚠️ Nachmessung fehlgeschlagen (${String(e).split("\n")[0]}).`);
        }
    }

    await browser.close();
    server.close();
    process.exit(0);
})();

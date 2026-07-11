#!/usr/bin/env node
// JEDES-HOLZ — DAS HOLZ-AUGE: ein Look-Schuss auf Holz OHNE Present-Fähigkeit.
//
// Befund (gemessen, Headless-Container mit Dawn-Swiftshader): WebGPU RECHNET
// (Adapter+Device+Compile+Render OK), aber der Canvas-Present stirbt am ersten
// getCurrentTexture — dem GPU-Prozess fehlt die SharedImageBackingFactory für
// WebgpuSwapChainTexture (gpu/command_buffer/service/shared_image_factory.cc)
// → „Instance dropped in popErrorScope" → device.lost reason=destroyed. Kein
// Chromium-Flag heilt das (in-process-gpu / disable-gpu-compositing /
// angle-swiftshader / gl-swiftshader: alle tot).
//
// DAS AUGE umgeht den Present VOLLSTÄNDIG: es armiert VOR dem ersten Frame ein
// Offscreen-RenderTarget, biegt setRenderTarget(null)→RTT um (kein Pfad erreicht
// je die Swap-Chain → das Device LEBT) und STUMMT den Loop-Render (ohne Present
// fehlt jeder Compositor-Gegendruck — schon gedrosselte Renders überfüllen die
// Dawn-Queue unbegrenzt; gemessen: onSubmittedWorkDone hängt dann für immer).
// Die Sim streamt render-frei (Headless-Null-Pfad-Wahrheit); am Ende fällt GENAU
// EIN manueller Frame (Compile+Render in einem Zug — Minuten auf Software-Raster,
// der Guard trägt das), dann wandern die Pixel per MANUELLEM Dawn-Readback
// (copyTextureToBuffer + mapAsync, 256er-Zeilen-Alignment — THREEs
// readRenderTargetPixelsAsync hängt am selben Queue-Problem) in eine 2D-Canvas
// → element-screenshot → artifacts/holz-auge.png. Dieselben TSL-Shader, farbtreu.
//
// Nutzen: Look-Verifikation mit eigenen Augen auf JEDEM Holz — auch dem, das
// nicht presenten kann (CI-Container, Software-Raster). Standalone-Werkzeug
// (nicht in der check-Kette: er braucht Minuten auf Software-Holz).
//
// Aufruf: node scripts/diag-holz-auge.cjs [holz] [sekunden]
//   holz     voll|nah|kienspan (Default kienspan — das Software-Holz-Profil)
//   sekunden max. Streaming-Wartezeit (Default 180)
const path = require("path");
const puppeteer = require(path.join(process.cwd(), "node_modules", "puppeteer"));
const http = require("http");
const fs = require("fs");
const ROOT = process.cwd();
const HOLZ = process.argv[2] || "kienspan";
const WARTE_S = Math.max(30, parseInt(process.argv[3] || "180", 10));
const W = 720,
    H = 440,
    PORT = 4392;
(async () => {
    const srv = http
        .createServer((req, res) => {
            const p = path.join(ROOT, decodeURIComponent((req.url || "/").split("?")[0]).replace(/^\/+/, "") || "index.html");
            fs.readFile(p, (e, d) => {
                if (e) {
                    res.writeHead(404);
                    res.end();
                    return;
                }
                const ext = path.extname(p);
                const mime =
                    ext === ".html" ? "text/html" : ext === ".js" ? "text/javascript" : ext === ".json" ? "application/json" : "application/octet-stream";
                res.writeHead(200, { "Content-Type": mime });
                res.end(d);
            });
        })
        .listen(PORT);
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-dev-shm-usage", "--enable-unsafe-webgpu", "--use-webgpu-adapter=swiftshader"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    let errN = 0;
    page.on("pageerror", (e) => {
        errN++;
        if (errN <= 5) console.log("PAGEERR", String(e.message).slice(0, 120));
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=${encodeURIComponent(HOLZ)}`, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    // Armieren, SOBALD der Renderer existiert — VOR dem ersten Present (der Loop
    // startet erst nach Worldgen; das Fenster ist breit genug für 50-ms-Polling).
    await page.waitForFunction(
        () => {
            const r = window.anazhRealm;
            if (!r || !r.state || !r.state.renderer || !window.THREE) return false;
            if (window.__eyeArmed) return true;
            try {
                const st = r.state;
                st.postProcessingFailed = true; // direkter Render-Pfad (das RTT trägt keinen PP-Graph)
                const rt = new THREE.RenderTarget(720, 440, { depthBuffer: true, stencilBuffer: false });
                rt.texture.colorSpace = THREE.SRGBColorSpace;
                const orig = st.renderer.setRenderTarget.bind(st.renderer);
                st.renderer.setRenderTarget = function (t, ...a) {
                    return orig(t === null || t === undefined ? rt : t, ...a);
                };
                st.renderer.setRenderTarget(rt);
                // NULL-RENDER WÄHREND DES STREAMINGS: ohne Present fehlt jeder Compositor-
                // Gegendruck — schon 1-in-12-Renders überfüllen die Dawn-Queue des Software-
                // Rasters unbegrenzt (gemessen: onSubmittedWorkDone hängt selbst nach Loop-
                // Stopp). Die Sim braucht den Render NICHT (Streaming/Wiese sind sim-seitig,
                // der Headless-Null-Pfad beweist das seit je) → während des Aufbaus rendert
                // NICHTS; am Ende fällt GENAU EIN manueller Frame (Queue = 1 Frame + Copy).
                const origRender = st.renderer.render.bind(st.renderer);
                st.renderer.render = function () {};
                window.__eyeRender = origRender;
                window.__eyeRT = rt;
                window.__eyeArmed = true;
                return true;
            } catch (e) {
                window.__eyeErr = e.message;
                return false;
            }
        },
        { timeout: 60000, polling: 50 }
    );
    console.log("AUGE ARMIERT (Profil:", HOLZ + ")");
    // Streamen lassen: Ziel = Existenz-Boden voll + Wiese steht.
    const runden = Math.ceil(WARTE_S / 10);
    for (let i = 0; i < runden; i++) {
        await new Promise((r) => setTimeout(r, 10000));
        const st = await page
            .evaluate(() => {
                const s = window.anazhRealm.state;
                return {
                    chunks: s.voxelChunks.size,
                    ring: s._activeRingRadius,
                    fps: s.fps,
                    lost: s._deviceLost || null,
                    grass: s.pendingGrass ? s.pendingGrass.size : -1,
                };
            })
            .catch((e) => ({ err: e.message.slice(0, 60) }));
        console.log(`t+${(i + 1) * 10}s`, JSON.stringify(st));
        if (st.lost) {
            console.log("DEVICE TOT — Auge blind (Present-Pfad getroffen?).");
            process.exitCode = 1;
            break;
        }
        if (st.chunks >= 25 && st.grass === 0) break;
    }
    // Pixel lesen → 2D-Canvas → Schuss. MANUELLER Readback direkt am Dawn-Device
    // (copyTextureToBuffer + mapAsync): die Primitive feuern auf diesem Holz
    // beweisbar (Callback-Probe OK), aber THREEs readRenderTargetPixelsAsync
    // hängt hier endlos — also die eine Ebene tiefer, ohne Helfer. Der Loop
    // wird angehalten (deterministischer letzter Frame).
    const ok = await page.evaluate(async () => {
        const st = window.anazhRealm.state;
        const rt = window.__eyeRT;
        if (!rt || st._deviceLost) return { ok: false, warum: st._deviceLost || "kein RT" };
        try {
            const schritte = [];
            const T = (p, ms, tag) =>
                Promise.race([p.then(() => "OK"), new Promise((res) => setTimeout(() => res("HÄNGT"), ms))]).then((r) => {
                    schritte.push(`${tag}=${r}`);
                    return r;
                });
            st.renderer.setAnimationLoop(null); // Loop anhalten — die Queue läuft leer
            await new Promise((res) => setTimeout(res, 600));
            const backend = st.renderer.backend;
            const dev = backend.device;
            // Schritt 1: die Queue ist leer (es wurde NIE gerendert) — Beweis:
            await T(dev.queue.onSubmittedWorkDone(), 30000, "queueLeer");
            // Schritt 2: DER EINE Frame — kompiliert + rendert alles in einem Zug
            // (Software-Raster: das dauert; der Guard trägt Minuten).
            (window.__eyeRender || st.renderer.render.bind(st.renderer))(st.scene, st.camera);
            await T(dev.queue.onSubmittedWorkDone(), 180000, "frameFertig");
            const gpuTex = backend.get(rt.texture) && backend.get(rt.texture).texture;
            if (!gpuTex) return { ok: false, warum: "kein GPU-Texture-Handle am RT", schritte };
            const W2 = rt.width,
                H2 = rt.height;
            const bytesPerRow = Math.ceil((W2 * 4) / 256) * 256; // WebGPU-Zeilen-Alignment
            const rb = dev.createBuffer({ size: bytesPerRow * H2, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
            const enc = dev.createCommandEncoder();
            enc.copyTextureToBuffer(
                { texture: gpuTex },
                { buffer: rb, bytesPerRow, rowsPerImage: H2 },
                { width: W2, height: H2, depthOrArrayLayers: 1 }
            );
            dev.queue.submit([enc.finish()]);
            await T(dev.queue.onSubmittedWorkDone(), 20000, "copyFertig");
            const mapR = await T(rb.mapAsync(GPUMapMode.READ), 30000, "map");
            if (mapR !== "OK") return { ok: false, warum: "mapAsync hängt", schritte };
            const roh = new Uint8Array(rb.getMappedRange());
            // Zeilen entpacken (Stride bytesPerRow → dichte W2*4):
            const buf = new Uint8Array(W2 * H2 * 4);
            for (let y = 0; y < H2; y++) buf.set(roh.subarray(y * bytesPerRow, y * bytesPerRow + W2 * 4), y * W2 * 4);
            let probe = 0;
            for (let i = 0; i < buf.length; i += 4013) probe += buf[i];
            const cv = document.createElement("canvas");
            cv.id = "eye-canvas";
            cv.width = rt.width;
            cv.height = rt.height;
            cv.style.cssText = "position:fixed;left:0;top:0;z-index:99999";
            const c2 = cv.getContext("2d");
            const img = c2.createImageData(rt.width, rt.height);
            const px = new Uint8ClampedArray(buf.buffer, buf.byteOffset, rt.width * rt.height * 4);
            img.data.set(px);
            for (let i = 3; i < img.data.length; i += 4) img.data[i] = 255; // deckend (Screenshot-Compositing)
            c2.putImageData(img, 0, 0);
            document.body.appendChild(cv);
            return { ok: true, probe, schritte };
        } catch (e) {
            return { ok: false, warum: e.message.slice(0, 120) };
        }
    });
    console.log("PIXEL-LESUNG:", JSON.stringify(ok));
    if (ok.ok) {
        fs.mkdirSync(path.join(ROOT, "artifacts"), { recursive: true });
        const el = await page.$("#eye-canvas");
        await el.screenshot({ path: path.join(ROOT, "artifacts", "holz-auge.png") });
        console.log("AUGE-SCHUSS OK → artifacts/holz-auge.png");
    } else {
        process.exitCode = 1;
    }
    await browser.close();
    srv.close();
})().catch((e) => {
    console.error("FAIL:", e.message);
    process.exit(1);
});

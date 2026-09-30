// diag-blick.cjs — DIE AUGEN (T0 des Erlebnis-Ziels, 16.07.): ein ECHTER Welt-Schuss
// aus dem Container. Die V18.359-Narbe (WebGPU-Frame komponiert nicht in den
// puppeteer-Screenshot: weiß/schwarz/Timeout — 3 Wege gemessen) wird UMGANGEN, nicht
// wiederholt: die Welt rendert EINMAL in ein explizites RenderTarget und die Pixel
// reisen über die RENDERER-API zurück (readRenderTargetPixelsAsync, r184 — derselbe
// Weg, den der Studio-Bäcker seit V18.471 erfolgreich geht). Kein Composite nötig.
//
//   node scripts/diag-blick.cjs [--out DIR] [--zeit 10|22] [--blick wald|boden]
//   Ergebnis: PNG(s) in DIR (Default scratch/blick-*.png) + Exit 0 wenn der Schuss
//   SUBSTANZ trägt (nicht leer/uniform — sonst Exit 1 mit Diagnose).
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.BLICK_PORT || 4461);
const argOut = (() => {
    const i = process.argv.indexOf("--out");
    return i > 0 ? process.argv[i + 1] : root;
})();
const W = 640,
    H = 360;
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
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    // KEIN Null-Renderer — die Augen brauchen den echten (WebGPU via swiftshader-Vulkan).
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const gpu = await page.evaluate(async () => {
        if (!navigator.gpu) return "kein navigator.gpu";
        try {
            const a = await navigator.gpu.requestAdapter();
            return a ? "adapter ok" : "kein adapter";
        } catch (e) {
            return "adapter-wurf: " + (e && e.message);
        }
    });
    console.log("WebGPU-Probe:", gpu);

    const out = await page.evaluate(
        async (zeitArg, blickArg) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const res = { schuesse: {} };
            const dl = performance.now() + 300000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await sleep(200);
            const r = window.anazhRealm;
            if (!r) return { fatal: "anazhRealm kam nie" };
            // Settle: Chunks-Plateau + Foundry warm (großzügig — swiftshader ist zäh).
            let stable = 0,
                last = -1;
            while (performance.now() < dl) {
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === last) stable++;
                else {
                    stable = 0;
                    last = sz;
                }
                if (sz > 20 && stable > 10) break;
                await sleep(500);
            }
            const rend = r.state.renderer;
            if (!rend) return { fatal: "kein Renderer" };
            res.rendererArt = rend.isWebGPURenderer ? "webgpu" : rend.isWebGLRenderer ? "webgl" : "?";
            res.headlessNull = !!rend._isHeadlessNull;
            if (rend._isHeadlessNull) return res; // ehrlich: ohne echten Renderer kein Schuss

            const THREE_ = window.THREE;
            const cam = r.state.camera;
            const scene = r.state.scene;
            if (!cam || !scene) return { fatal: "kein cam/scene" };
            const schuss = async (name) => {
                const w = 640,
                    h = 360;
                const rt = new THREE_.RenderTarget(w, h, { depthBuffer: true, samples: 0 });
                const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
                rend.setRenderTarget(rt);
                if (typeof rend.renderAsync === "function") await rend.renderAsync(scene, cam);
                else rend.render(scene, cam);
                let px = null;
                if (typeof rend.readRenderTargetPixelsAsync === "function") {
                    px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, w, h);
                } else if (typeof rend.readRenderTargetPixels === "function") {
                    px = new Uint8Array(w * h * 4);
                    rend.readRenderTargetPixels(rt, 0, 0, w, h, px);
                }
                rend.setRenderTarget(prev);
                rt.dispose && rt.dispose();
                if (!px || !px.length) return { ok: false, grund: "keine Pixel" };
                const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
                // Substanz-Urteil: distinkte Farben + nicht alles eine Fläche.
                const set = new Set();
                let nonzero = 0;
                for (let i = 0; i < u8.length; i += 4 * 97) {
                    set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                    if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
                }
                // PNG über Canvas. GEMESSEN (erster Schuss 16.07.): der WebGPU-
                // Readback liefert die Zeilen bereits TOP-DOWN — kein Y-Flip
                // (der WebGL-Erfahrungswert „bottom-up" gilt hier nicht).
                const cv = document.createElement("canvas");
                cv.width = w;
                cv.height = h;
                const ctx = cv.getContext("2d");
                const img = ctx.createImageData(w, h);
                img.data.set(u8.subarray(0, w * h * 4));
                ctx.putImageData(img, 0, 0);
                return { ok: true, farben: set.size, nonzero, png: cv.toDataURL("image/png") };
            };

            // Blick einrichten: Augenhöhe in den Wald ODER auf den Boden.
            const pm = r.state.playerMesh && r.state.playerMesh.position;
            if (pm && cam) {
                if (blickArg === "boden") {
                    cam.position.set(pm.x, pm.y + 1.7, pm.z);
                    cam.lookAt(pm.x + 2, pm.y - 2, pm.z + 2);
                } else {
                    cam.position.set(pm.x, pm.y + 1.7, pm.z);
                    cam.lookAt(pm.x + 30, pm.y + 4, pm.z + 30);
                }
                cam.updateMatrixWorld(true);
            }
            // Zeit setzen (Tag/Nacht) über die eine Zeit-Quelle, falls vorhanden.
            try {
                if (zeitArg && r.state.world) r.state.world.timeOfDay = Number(zeitArg) / 24;
            } catch (_e) {}
            // Ein paar echte Loop-Ticks, damit Uniforms/Streaming den Blick tragen.
            for (let i = 0; i < 20; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await sleep(30);
            }
            res.schuesse.haupt = await schuss("haupt");
            return res;
        },
        process.env.BLICK_ZEIT || (process.argv.includes("--zeit") ? process.argv[process.argv.indexOf("--zeit") + 1] : ""),
        process.argv.includes("--blick") ? process.argv[process.argv.indexOf("--blick") + 1] : "wald"
    );

    await browser.close();
    server.close();

    console.log("\n===== DIE AUGEN (T0) — RT-Readback-Schuss =====");
    if (!out || out.fatal) {
        console.log("FEHLER:", out ? out.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        process.exit(1);
    }
    console.log(`Renderer: ${out.rendererArt} · headlessNull=${out.headlessNull}`);
    const s = out.schuesse.haupt;
    if (out.headlessNull || !s) {
        console.log("KEIN SCHUSS — Renderer fiel auf Null zurück (WebGPU im Container nicht initialisierbar).");
        console.log("Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        process.exit(1);
    }
    if (!s.ok) {
        console.log("SCHUSS LEER:", s.grund);
        process.exit(1);
    }
    const b64 = s.png.split(",")[1];
    const file = path.join(argOut, `blick-${Date.now()}.png`);
    fs.writeFileSync(file, Buffer.from(b64, "base64"));
    const substanz = s.farben >= 8 && s.nonzero > 50;
    console.log(`Schuss: ${file} · distinkte Farben=${s.farben} · nonzero-Proben=${s.nonzero}`);
    console.log(substanz ? "✅ GRÜN — die Augen sehen (Substanz im Bild)." : "❌ ROT — Bild ohne Substanz (leer/uniform).");
    process.exit(substanz ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});

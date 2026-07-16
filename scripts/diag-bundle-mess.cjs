// diag-bundle-mess.cjs — T3-MESSUNG: render-CPU-ms + dc einer SETTLED Szene des
// ECHTEN Spiels, vorher/nachher (Region-RenderBundles aus/an), mit ECHTEM
// WebGPU-Renderer (swiftshader-Vulkan — dieselben Flags wie diag-blick).
// Quellen: perfSense (phase.render = CPU-ms EWMA · phase.gpuMs · renderCalls =
// per-Frame-Draws) + renderer.info + backend.beginBundle-Zähler (Re-Record-Rate)
// + ein RT-Readback-Schuss je Variante (Substanz-Beweis, PNG in --out).
//   node scripts/diag-bundle-mess.cjs [--out DIR] [--nur mit|ohne]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.MESS_PORT || 4472);
const argOut = (() => {
    const i = process.argv.indexOf("--out");
    return i > 0 ? process.argv[i + 1] : root;
})();
const nur = (() => {
    const i = process.argv.indexOf("--nur");
    return i > 0 ? process.argv[i + 1] : null;
})();
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

async function messeVariante(browser, bundlesAn) {
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    // Flag VOR jedem Spiel-Code setzen: Setter-Falle auf window.anazhRealm —
    // useRegionRenderBundles wird gesetzt, sobald der Realm konstruiert ist
    // (Batches bauen erst Sekunden später beim Streaming → race-frei).
    await page.evaluateOnNewDocument((an) => {
        let val;
        Object.defineProperty(window, "anazhRealm", {
            configurable: true,
            get() {
                return val;
            },
            set(v) {
                val = v;
                const pin = () => {
                    if (v && v.state) v.state.useRegionRenderBundles = an;
                    else setTimeout(pin, 5);
                };
                pin();
            },
        });
    }, bundlesAn);
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });

    const out = await page.evaluate(async (bundlesAnArg) => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const res = { bundlesAn: bundlesAnArg };
        const dl = performance.now() + 300000;
        while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl) await sleep(200);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        res.flag = r.state.useRegionRenderBundles;
        // Settle: Chunk-Plateau + Batch-Plateau (Foundry warm, Streu steht).
        let stable = 0,
            last = "";
        while (performance.now() < dl) {
            const sig =
                (r.state.voxelChunks ? r.state.voxelChunks.size : 0) +
                "|" +
                (r.state.archBatches ? r.state.archBatches.size : 0);
            if (sig === last) stable++;
            else {
                stable = 0;
                last = sig;
            }
            const chunks = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
            if (chunks > 20 && stable > 16) break;
            await sleep(500);
        }
        const rend = r.state.renderer;
        if (!rend || rend._isHeadlessNull) return { fatal: "kein echter Renderer" };
        res.settle = {
            chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0,
            batches: r.state.archBatches ? r.state.archBatches.size : 0,
            bundles: r.state._regionBundles ? r.state._regionBundles.size : 0,
            groups: r.state.archInstanceGroups ? r.state.archInstanceGroups.size : 0,
        };
        // Re-Record-Zähler (nur wenn Backend Bundles kann).
        let begins = { n: 0 };
        if (rend.backend && typeof rend.backend.beginBundle === "function") {
            const orig = rend.backend.beginBundle.bind(rend.backend);
            rend.backend.beginBundle = (c) => {
                begins.n++;
                return orig(c);
            };
        }
        // Messfenster: 14 s, alle 400 ms samplen (EWMA-Phasen + Roh-Info).
        const samples = [];
        const t0 = performance.now();
        let framesT0 = null;
        while (performance.now() - t0 < 14000) {
            await sleep(400);
            const s = r.state.perfSense || {};
            const ph = s.phase || {};
            const info = rend.info && rend.info.render ? rend.info.render : {};
            if (framesT0 === null) framesT0 = { f: s.frames || 0, t: performance.now() };
            samples.push({
                render: ph.render,
                gpuMs: ph.gpuMs,
                dc: s.renderCalls,
                tris: info.triangles,
                infoDc: info.drawCalls != null ? info.drawCalls : info.calls,
            });
        }
        const num = (k) => {
            const v = samples.map((s) => s[k]).filter((x) => Number.isFinite(x));
            if (!v.length) return null;
            return v.reduce((a, b) => a + b, 0) / v.length;
        };
        res.mess = {
            renderCpuMs: num("render"),
            gpuMs: num("gpuMs"),
            gpuQuelle: (r.state.perfSense || {}).gpuQuelle,
            dcSense: num("dc"),
            dcInfo: num("infoDc"),
            tris: num("tris"),
            beginsIn14s: begins.n,
            sichtbareBundles: r.state._regionBundles
                ? Array.from(r.state._regionBundles.values()).filter((b) => b.visible).length
                : 0,
        };
        // Schuss (Substanz-Beweis, RT-Readback wie diag-blick).
        try {
            const THREE_ = window.THREE;
            const cam = r.state.camera;
            const scene = r.state.scene;
            const w = 640,
                h = 360;
            const rt = new THREE_.RenderTarget(w, h, { depthBuffer: true });
            const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
            rend.setRenderTarget(rt);
            if (typeof rend.renderAsync === "function") await rend.renderAsync(scene, cam);
            else rend.render(scene, cam);
            const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, w, h);
            rend.setRenderTarget(prev);
            const u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
            const set = new Set();
            let nonzero = 0;
            for (let i = 0; i < u8.length; i += 4 * 97) {
                set.add(((u8[i] >> 4) << 8) | ((u8[i + 1] >> 4) << 4) | (u8[i + 2] >> 4));
                if (u8[i] + u8[i + 1] + u8[i + 2] > 12) nonzero++;
            }
            const cv = document.createElement("canvas");
            cv.width = w;
            cv.height = h;
            const ctx = cv.getContext("2d");
            const img = ctx.createImageData(w, h);
            img.data.set(u8.subarray(0, w * h * 4));
            ctx.putImageData(img, 0, 0);
            res.schuss = { farben: set.size, nonzero, png: cv.toDataURL("image/png") };
            rt.dispose && rt.dispose();
        } catch (e) {
            res.schuss = { fehler: (e && e.message) || String(e) };
        }
        return res;
    }, bundlesAn);
    out.pageErrors = pageErrors.slice(0, 3);
    await page.close();
    return out;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
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
    const report = {};
    if (nur !== "mit") {
        console.log(">> Variante OHNE Bundles (Basislinie) ...");
        report.ohne = await messeVariante(browser, false);
        console.log(JSON.stringify(report.ohne, (k, v) => (k === "png" ? "<png>" : v), 2));
    }
    if (nur !== "ohne") {
        console.log(">> Variante MIT Bundles ...");
        report.mit = await messeVariante(browser, true);
        console.log(JSON.stringify(report.mit, (k, v) => (k === "png" ? "<png>" : v), 2));
    }
    await browser.close();
    server.close();
    for (const [name, v] of Object.entries(report)) {
        if (v && v.schuss && v.schuss.png) {
            const file = path.join(argOut, `bundle-mess-${name}.png`);
            fs.writeFileSync(file, Buffer.from(v.schuss.png.split(",")[1], "base64"));
            console.log(`Schuss ${name}: ${file} (farben=${v.schuss.farben} nonzero=${v.schuss.nonzero})`);
        }
    }
    const o = report.ohne && report.ohne.mess,
        m = report.mit && report.mit.mess;
    if (o && m) {
        console.log("===== T3-MESSUNG (settled, echter Renderer) =====");
        console.log(
            `render-CPU: ${o.renderCpuMs && o.renderCpuMs.toFixed(2)} → ${m.renderCpuMs && m.renderCpuMs.toFixed(2)} ms · ` +
                `dc/Frame: ${o.dcSense && Math.round(o.dcSense)} → ${m.dcSense && Math.round(m.dcSense)} · ` +
                `GPU: ${o.gpuMs && o.gpuMs.toFixed(2)} → ${m.gpuMs && m.gpuMs.toFixed(2)} ms · ` +
                `Tris: ${o.tris && Math.round(o.tris / 1000)}k → ${m.tris && Math.round(m.tris / 1000)}k · ` +
                `ReRecords/14s: ${m.beginsIn14s} · Bundles: ${report.mit.settle && report.mit.settle.bundles}`
        );
    }
    const fatal = (report.ohne && report.ohne.fatal) || (report.mit && report.mit.fatal);
    process.exit(fatal ? 1 : 0);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});

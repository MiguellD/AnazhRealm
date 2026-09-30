// diag-wiese.cjs — DIE WIESEN-LINSE (Pflicht D): die Halm-Funktion im Boden ist nur dort ein
// Beweis, wo Sonne auf flaches Gras fällt. Befund 30.09.: die E-Bühne neben dem Wolf liegt im
// Waldschatten — der Boden dort ist fast schwarz, mit und ohne Halme. Die Linse SUCHT deshalb die
// besonnte Wiese: Kandidaten auf Ringen bis 120 m (der geladene Ring) um die Mess-Wiese −900/−850 (flach, trocken), je
// ein Blick senkrecht nach unten (64×36, Mittag, Schatten frisch) — Grün-Überschuss × Helligkeit gewinnt. Dort je ein
// Schuss fern (1,7 m, 10 m voraus) und Armlänge (1,6 m, 0,8 m voraus) + die Halm-Zahl: mittlerer
// Nachbar-Kontrast der unteren Bildhälfte (hochfrequente Struktur = Halme, glatter Boden ≈ 0).
//   node scripts/diag-wiese.cjs [--tag name] [--out DIR]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const argOf = (k, d) => {
    const i = process.argv.indexOf(k);
    return i > 0 ? process.argv[i + 1] : d;
};
const TAG = argOf("--tag", "head");
const OUT = path.resolve(argOf("--out", path.join(root, "artifacts", "beweis-e")));
const PORT = Number(process.env.WIESE_PORT || 4468);
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

// Im Seiten-Kontext: ein Render in ein RT (Loop ruht, Mittag, Schatten frisch) → Pixel (+ PNG).
const RENDER_FN = async (kam, W, H, png) => {
    const r = window.anazhRealm;
    const THREE_ = window.THREE;
    const rend = r.state.renderer;
    rend.setAnimationLoop(null);
    if (r.state.world) r.state.world.timeOfDay = 0.5;
    r.state.timeOfDay = 0.5;
    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
    const cam = r.state.camera;
    cam.position.set(kam.px, kam.py, kam.pz);
    cam.lookAt(kam.lx, kam.ly, kam.lz);
    cam.updateMatrixWorld(true);
    if (r.state.playerMesh) r.state.playerMesh.visible = false;
    let u8 = null;
    for (let k = 0; k < 2; k++) {
        try {
            if (r.state.fernRing && typeof r._tickFeldPass === "function") r._tickFeldPass(r.state.fernRing);
        } catch (_e) {}
        if (rend.shadowMap) rend.shadowMap.needsUpdate = true;
        const rt = new THREE_.RenderTarget(W, H, { depthBuffer: true, samples: 0 });
        const prev = rend.getRenderTarget ? rend.getRenderTarget() : null;
        rend.setRenderTarget(rt);
        if (typeof rend.renderAsync === "function") await rend.renderAsync(r.state.scene, cam);
        else rend.render(r.state.scene, cam);
        const px = await rend.readRenderTargetPixelsAsync(rt, 0, 0, W, H);
        rend.setRenderTarget(prev);
        if (rt.dispose) rt.dispose();
        u8 = px instanceof Uint8Array ? px : new Uint8Array(px.buffer || px);
    }
    rend.setAnimationLoop(r._gameLoopTick);
    // Kennzahlen der unteren Bildhälfte (Boden): Helligkeit + Nachbar-Kontrast
    const lum = (i) => 0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2];
    let n = 0,
        l = 0,
        k2 = 0;
    for (let y = Math.floor(H / 2); y < H - 1; y++)
        for (let x = 0; x < W - 1; x++) {
            const i = (y * W + x) * 4;
            const a = lum(i);
            l += a;
            k2 += Math.abs(a - lum(i + 4)) + Math.abs(a - lum(i + W * 4));
            n++;
        }
    let gr = 0;
    for (let i = 0; i < u8.length; i += 4) gr += u8[i + 1] - Math.max(u8[i], u8[i + 2]);
    const out = { hell: l / n, kontrast: k2 / (2 * n), gruen: gr / (u8.length / 4) };
    if (png) {
        const cv = document.createElement("canvas");
        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d");
        const img = ctx.createImageData(W, H);
        img.data.set(u8.subarray(0, W * H * 4));
        ctx.putImageData(img, 0, 0);
        out.png = cv.toDataURL("image/png");
    }
    return out;
};

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
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
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    // Umstellen: der Spieler steht an der Stelle, die Welt schwingt ein (Chunks ruhig).
    const umstellen = (x, z) =>
        page.evaluate(
            async (x, z) => {
                const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
                const dl0 = performance.now() + 300000;
                while (
                    (!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") &&
                    performance.now() < dl0
                )
                    await sleep(200);
                const r = window.anazhRealm;
                if (!r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
                r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
                let stabil = 0,
                    last = -1,
                    takte = 0;
                const dl = performance.now() + 150000;
                while (performance.now() < dl) {
                    try {
                        if (r.state.world) r.state.world.timeOfDay = 0.5;
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    takte++;
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stabil++;
                    else {
                        stabil = 0;
                        last = sz;
                    }
                    if (takte >= 40 && stabil >= 15) break;
                    await sleep(50);
                }
                return { takte, chunks: last };
            },
            x,
            z
        );
    const start = await umstellen(-900, -850);
    if (start.fatal) {
        console.log("FEHLER:", start.fatal);
        process.exit(1);
    }
    // Kandidaten: flach (Spanne ≤ 0,8 m über 6 m), trocken — auf Ringen 0…120 m.
    const kand = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = [];
        for (let d = 0; d <= 120; d += 15)
            for (let k = 0; k < (d ? 12 : 1); k++) {
                const w = (k * Math.PI) / 6;
                const x = -900 + Math.cos(w) * d,
                    z = -850 + Math.sin(w) * d;
                if (typeof r._isAboveWaterAt === "function" && !r._isAboveWaterAt(x, z, 0.3)) continue;
                let lo = Infinity,
                    hi = -Infinity;
                for (const [dx, dz] of [
                    [0, 0],
                    [3, 0],
                    [-3, 0],
                    [0, 3],
                    [0, -3],
                ]) {
                    const y = r._voxelSurfaceY(x + dx, z + dz);
                    lo = Math.min(lo, y);
                    hi = Math.max(hi, y);
                }
                if (hi - lo <= 1.2) out.push({ x, z, y: r._voxelSurfaceY(x, z) });
            }
        return out;
    });
    // Die besonnte Stelle: je Kandidat ein Blick senkrecht nach unten (Mittag, Schatten frisch).
    let best = null;
    for (const c of kand) {
        const m = await page.evaluate(
            RENDER_FN,
            { px: c.x, py: c.y + 6, pz: c.z + 0.01, lx: c.x, ly: c.y, lz: c.z },
            64,
            36,
            false
        );
        // Wiese = grün UND besonnt: Grün-Überschuss × Helligkeit von oben
        const wert = Math.max(0, m.gruen) * m.hell;
        if (!best || wert > best.wert) best = Object.assign({ hell: m.hell, gruen: m.gruen, wert }, c);
    }
    if (!best) {
        console.log("❌ keine flache, trockene Stelle gefunden");
        process.exit(1);
    }
    console.log(
        `Besonnte Wiese: ${best.x.toFixed(0)}/${best.z.toFixed(0)} · von oben Helligkeit ${best.hell.toFixed(1)}, Grün-Überschuss ${best.gruen.toFixed(1)} (${kand.length} Kandidaten)`
    );
    const um = await umstellen(best.x, best.z);
    console.log(`  umgestellt: ${um.takte} Takte · ${um.chunks} Chunks`);
    const g = await page.evaluate((b) => window.anazhRealm._voxelSurfaceY(b.x, b.z), best);
    const bericht = { tag: TAG, stelle: best, schuesse: {} };
    for (const [art, kam] of [
        ["fern", { px: best.x, py: g + 1.7, pz: best.z, lx: best.x + 10, ly: g - 1.2, lz: best.z + 0.01 }],
        ["arm", { px: best.x, py: g + 1.6, pz: best.z, lx: best.x + 0.8, ly: g, lz: best.z + 0.01 }],
    ]) {
        const s = await page.evaluate(RENDER_FN, kam, 640, 360, true);
        const f = path.join(OUT, `wiese-${TAG}-${art}.png`);
        fs.writeFileSync(f, Buffer.from(s.png.split(",")[1], "base64"));
        bericht.schuesse[art] = {
            hell: +s.hell.toFixed(1),
            kontrast: +s.kontrast.toFixed(2),
            datei: path.relative(root, f),
        };
        console.log(
            `  ${art}: Boden-Helligkeit ${s.hell.toFixed(1)} · Halm-Kontrast ${s.kontrast.toFixed(2)} · ${path.relative(root, f)}`
        );
    }
    fs.writeFileSync(path.join(OUT, `wiese-${TAG}.json`), JSON.stringify(bericht, null, 2));
    await browser.close();
    server.close();
    console.log(pageErrors.length ? "Page-Errors: " + pageErrors.slice(0, 3).join(" | ") : "Page-Errors: 0");
    process.exit(0);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});

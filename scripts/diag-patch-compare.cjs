// DER 10x10m-LOOK-ABGLEICH (Schöpfer-Idee: „in einem kleinen Bereich abgleichen, handleable machen").
// Statt die ganze WebGPU-Welt zu rendern (stirbt an kumulativer Last) rendern wir einen KLEINEN Fleck
// zweimal, echt, nebeneinander:
//   LINKS  = das STUDIO (worlds/terrain, r128 WebGL) — Kamera senkrecht über einen ~10x10m-Boden-Fleck
//            (bzw. hoch für den Himmel), gerendert durch die echte Studio-Pipeline (?patch-probe → __phytoView).
//   RECHTS = ANAZHREALM (echtes WebGPU) — derselbe Fleck-Rahmen, via page.screenshot() (der Pfad, der auf
//            swiftshader FUNKTIONIERT — readRenderTargetPixelsAsync ist kaputt, screenshot nicht).
// So SEHE ich Boden/Himmel/Wasser wie der Schöpfer sie sieht, ohne den Voll-Welt-Tod. -> artifacts/patch-compare.png
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4501;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const W = 420; // Kachelgröße
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GPU_ARGS = [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--no-sandbox",
    "--disable-setuid-sandbox",
];
// Die drei Flecken: Boden (senkrecht runter), Himmel (hoch), Wasser (runter auf einen Teich).
// pitch in Grad (−90 = senkrecht runter, +75 = hoch), tod = Tageszeit (0..1, 0.5 = Mittag).
const VIEWS = [
    { key: "boden", pitch: -78, tod: 0.5, want: "land" },
    { key: "himmel", pitch: 62, tod: 0.5, want: "any" },
    { key: "wasser", pitch: -70, tod: 0.5, want: "water" },
];

// ---------------------------------------------------------------------------
// STUDIO-SEITE: worlds/terrain?patch-probe=1, Wald betreten, __phytoView fahren.
async function shootStudio(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: W });
    page.on("pageerror", (e) => console.log("[STUDIO-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe=1`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });
    // Auf __phytoView warten (init fertig), dann den Wald betreten (der begehbare Boden/Himmel/Wasser).
    await page.evaluate(async () => {
        const s = performance.now();
        while (!window.__phytoView && performance.now() - s < 30000) await new Promise((r) => setTimeout(r, 50));
        const btn = document.getElementById("waldBtn");
        if (btn) btn.click();
    });
    // Der Wald baut asynchron (setTimeout in enterForest) + die Bäume/Schatten brauchen ein paar Frames.
    await sleep(9000);
    // UI robust ausblenden (Style-Regel: das Studio erzeugt sein Regler-Panel dynamisch als
    // Body-Kind NACH einem einmaligen Hide → eine CSS-Regel deckt auch Später-Erzeugtes).
    await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}";
        document.head.appendChild(st);
    });
    const shots = {};
    for (const v of VIEWS) {
        const meta = await page.evaluate((v) => {
            const V = window.__phytoView;
            if (!V || !V.camera) return { err: "kein __phytoView" };
            const cam = V.camera,
                sc = V.scene;
            // Einen Fleck wählen: der Studio-Wald steht um (0,0). Boden y≈0. Wasser: ein Wasser-Mesh suchen.
            let tx = 0,
                tz = 0,
                gy = 0;
            if (v.want === "water") {
                // Ein transparentes/Wasser-Mesh in der Szene finden (die Teiche/der Bach).
                let found = null;
                sc.traverse((o) => {
                    if (found) return;
                    const m = o.material;
                    // Wasser = transparent + TEAL-Farbe (0x20444d ~ b>0.12, g>=r); der Kontaktschatten
                    // ist transparent aber SCHWARZ (0,0,0) → das Farbfilter schliesst ihn aus.
                    const isWater =
                        m &&
                        m.transparent &&
                        m.opacity < 0.98 &&
                        m.color &&
                        m.color.b > 0.12 &&
                        m.color.g >= m.color.r * 0.9;
                    if (o.isMesh && isWater && o.geometry) {
                        const bb = o.geometry.boundingBox || (o.geometry.computeBoundingBox(), o.geometry.boundingBox);
                        if (bb) {
                            const c = bb.getCenter(new window.THREE.Vector3());
                            o.localToWorld(c);
                            found = c;
                        }
                    }
                });
                if (found) {
                    tx = found.x;
                    tz = found.z;
                    gy = found.y;
                } else return { err: "kein Wasser-Mesh im Studio" };
            }
            const H = 13;
            const pitch = (v.pitch * Math.PI) / 180;
            // Kamera über dem Fleck; Blickrichtung aus pitch (nach unten/oben), yaw fix nach −z.
            cam.position.set(tx, gy + H, tz);
            const dir = { x: 0, y: Math.sin(pitch), z: -Math.cos(pitch) };
            cam.lookAt(tx + dir.x * 30, gy + H + dir.y * 30, tz + dir.z * 30);
            cam.updateMatrixWorld(true);
            V.renderPatch();
            V.renderPatch();
            return { ok: true, tx: +tx.toFixed(1), tz: +tz.toFixed(1), gy: +gy.toFixed(1), forest: V.forestMode };
        }, v);
        if (v.tod !== undefined) {
            // Studio-Tageszeit über den Slider (wTime, 0..24). 0.5 → 12:00.
            await page.evaluate((tod) => {
                const el = document.getElementById("wTime");
                if (el) {
                    el.value = String(tod * 24);
                    el.dispatchEvent(new Event("input", { bubbles: true }));
                }
            }, v.tod);
            await sleep(200);
            await page.evaluate(() => window.__phytoView && window.__phytoView.renderPatch());
        }
        await sleep(200);
        const buf = await page.screenshot({ type: "png" });
        shots[v.key] = buf;
        console.log(`  studio ${v.key.padEnd(7)} ${meta.err ? "WARN " + meta.err : "OK " + JSON.stringify(meta)}`);
    }
    await page.close();
    return shots;
}

// ---------------------------------------------------------------------------
// ANAZHREALM-SEITE: echtes WebGPU, kleiner Ring, Fleck-Rahmen, page.screenshot().
async function shootAnazh(browser) {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: W });
    page.on("pageerror", (e) => console.log("[ANAZH-ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Boot mit gestubtem Render (schneller Warmup), aber den echten Renderer merken.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 90000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
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
                if (sz >= 18 && stableFor > 40) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
    });
    // UI + Avatar ausblenden (Style-Regel deckt auch dynamisch erzeugte Panels wie #perf-panel).
    await page.evaluate(() => {
        const st = document.createElement("style");
        st.textContent = "body > *:not(canvas):not(script):not(style){display:none!important}";
        document.head.appendChild(st);
        const r = window.anazhRealm;
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });
    const shots = {};
    for (const v of VIEWS) {
        // Tageszeit setzen.
        await page.evaluate((tod) => {
            const r = window.anazhRealm;
            try {
                r.setTimeOfDay(tod);
                for (let i = 0; i < 4; i++) r._gameLoopTick(performance.now());
            } catch (_e) {}
        }, v.tod);
        // Fleck wählen: flaches Land nahe Spawn; Wasser via _waterLevelAt.
        const meta = await page.evaluate((v) => {
            const r = window.anazhRealm;
            const s = r.state;
            const pm = s.playerMesh;
            if (!pm) return { err: "no player" };
            const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
            const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
            const cx = pm.position.x,
                cz = pm.position.z;
            let tx = cx,
                tz = cz,
                gy = th(cx, cz);
            if (v.want === "water") {
                let best = null;
                for (let rad = 6; rad <= 200 && !best; rad += 6)
                    for (let a = 0; a < 360; a += 8) {
                        const x = cx + Math.cos((a * Math.PI) / 180) * rad,
                            z = cz + Math.sin((a * Math.PI) / 180) * rad;
                        if (wl(x, z) > th(x, z) + 0.4) {
                            best = { x, z, y: wl(x, z) };
                            break;
                        }
                    }
                if (!best) return { err: "kein Wasser nahe Spawn" };
                tx = best.x;
                tz = best.z;
                gy = best.y;
            } else if (v.want === "land") {
                // Den DICHTESTEN Gras-Chunk anpeilen (garantiert Wiese, weg von Plattform/Wasser) —
                // die vorigen Flach-Suchen trafen die Spawn-Plattform bzw. Voxel-Wasser (das
                // `_waterLevelAt` nicht immer kennt). `state.voxelChunkGrass` trägt die echten
                // Gras-InstancedMeshes; der Chunk mit den meisten Halmen IST eine Wiese.
                const span = r._voxelChunkConfig ? r._voxelChunkConfig().span : 24;
                let best = null;
                const gm = s.voxelChunkGrass;
                // Ein DRY Wiesen-Chunk: Zentrum + vier Ecken klar über Wasser (nicht die Ufer-Wiese,
                // die das Vorlagen-„saftige Ufer" ans Seeufer setzt → Kamera fing sonst den See).
                const dry = (wx, wz) => {
                    const m = span * 0.35;
                    for (const [dx, dz] of [
                        [0, 0],
                        [m, m],
                        [-m, m],
                        [m, -m],
                        [-m, -m],
                    ]) {
                        if (th(wx + dx, wz + dz) < wl(wx + dx, wz + dz) + 2) return false;
                    }
                    return true;
                };
                // FAIRE Wahl: das Studio zeigt LUSH-Waldboden (feucht, grün). AnazhRealms Dürre-Wiese
                // ist ABSICHTLICH gelber/spärlicher (V18.344) — kein fairer Gegenpart. Deshalb unter den
                // dry-Chunks (solider Boden) den FEUCHTESTEN wählen (grün-lush = das Studio-Pendant).
                const feu = (x, z) => (typeof r._feuchteAt === "function" ? r._feuchteAt(x, z, th(x, z)) : 0);
                if (gm && gm.forEach) {
                    gm.forEach((inst, key) => {
                        if (!inst || !inst.count || inst.count < 40) return;
                        const [gx, gz] = key.split(",").map(Number);
                        const wx = gx * span + span / 2,
                            wz = gz * span + span / 2;
                        if (!dry(wx, wz)) return;
                        const score = feu(wx, wz) + inst.count / 512; // feucht (grün) bevorzugt, Dichte als Tiebreak
                        if (!best || score > best.score) best = { x: wx, z: wz, count: inst.count, score, feu: feu(wx, wz) };
                    });
                }
                if (best) {
                    tx = best.x;
                    tz = best.z;
                    gy = th(tx, tz);
                } else {
                    // Fallback: flaches Land über Wasser, Ring rad≥30 (jenseits der Plattform).
                    for (let rad = 30; rad <= 90; rad += 4)
                        for (let a = 0; a < 360; a += 12) {
                            const x = cx + Math.cos((a * Math.PI) / 180) * rad,
                                z = cz + Math.sin((a * Math.PI) / 180) * rad;
                            const h = th(x, z);
                            if (h < wl(x, z) + 1.5) continue;
                            const sl = Math.abs(th(x + 2, z) - h) + Math.abs(th(x, z + 2) - h);
                            if (sl > 0.03 && sl < 1.2) {
                                tx = x;
                                tz = z;
                                gy = h;
                                rad = 999;
                                break;
                            }
                        }
                }
            }
            const H = 13;
            const pitch = (v.pitch * Math.PI) / 180;
            const cam = s.camera;
            cam.position.set(tx, gy + H, tz);
            const dir = { x: 0, y: Math.sin(pitch), z: -Math.cos(pitch) };
            cam.lookAt(tx + dir.x * 30, gy + H + dir.y * 30, tz + dir.z * 30);
            cam.updateMatrixWorld(true);
            // Echten Renderer kurz zurückholen, zweimal rendern, wieder stubben.
            let err = null;
            if (window.__origRender) {
                r.state.renderer.render = window.__origRender;
                s.postProcessingFailed = true;
                try {
                    if (typeof r._loopRender === "function") {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } else window.__origRender(s.scene, cam);
                } catch (_e) {
                    err = String((_e && _e.message) || _e);
                }
                r.state.renderer.render = function () {};
            } else err = "no origRender";
            return { err, tx: +tx.toFixed(1), tz: +tz.toFixed(1), gy: +gy.toFixed(1) };
        }, v);
        await sleep(250);
        const buf = await page.screenshot({ type: "png" });
        shots[v.key] = buf;
        console.log(`  anazh  ${v.key.padEnd(7)} ${meta.err ? "WARN " + meta.err : "OK " + JSON.stringify(meta)}`);
    }
    await page.close();
    return shots;
}

// ---------------------------------------------------------------------------
// Kontaktblatt bauen: pro View eine Zeile [Studio | AnazhRealm], via einer Zusammenbau-Seite.
async function stitch(browser, studio, anazh) {
    const page = await browser.newPage();
    await page.goto("about:blank");
    const toB64 = (buf) => (buf ? buf.toString("base64") : null);
    const rows = VIEWS.map((v) => ({ key: v.key, s: toB64(studio[v.key]), a: toB64(anazh[v.key]) }));
    const dataURL = await page.evaluate(
        async (rows, W) => {
            const LBL = 24,
                GAP = 8;
            const cv = document.createElement("canvas");
            cv.width = 2 * W + GAP;
            cv.height = rows.length * (W + LBL);
            const ctx = cv.getContext("2d");
            ctx.fillStyle = "#111";
            ctx.fillRect(0, 0, cv.width, cv.height);
            const load = (b64) =>
                new Promise((res) => {
                    if (!b64) return res(null);
                    const im = new Image();
                    im.onload = () => res(im);
                    im.onerror = () => res(null);
                    im.src = "data:image/png;base64," + b64;
                });
            for (let i = 0; i < rows.length; i++) {
                const y = i * (W + LBL) + LBL;
                const si = await load(rows[i].s),
                    ai = await load(rows[i].a);
                if (si) ctx.drawImage(si, 0, 0, si.width, si.height, 0, y, W, W);
                if (ai) ctx.drawImage(ai, 0, 0, ai.width, ai.height, W + GAP, y, W, W);
                ctx.fillStyle = "#fff";
                ctx.font = "14px sans-serif";
                ctx.fillText(rows[i].key + " — STUDIO", 6, y - 7);
                ctx.fillText(rows[i].key + " — ANAZHREALM", W + GAP + 6, y - 7);
            }
            return cv.toDataURL("image/png");
        },
        rows,
        W
    );
    await page.close();
    return dataURL;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 600000, args: GPU_ARGS });
    console.log("STUDIO rendert die Flecken...");
    const studio = await shootStudio(browser);
    console.log("ANAZHREALM rendert die Flecken...");
    const anazh = await shootAnazh(browser);
    console.log("Kontaktblatt...");
    const dataURL = await stitch(browser, studio, anazh);
    if (dataURL) {
        fs.writeFileSync(
            path.join(ART, "patch-compare.png"),
            Buffer.from(dataURL.replace(/^data:image\/png;base64,/, ""), "base64")
        );
        console.log("-> artifacts/patch-compare.png");
    }
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(dataURL ? 0 : 1);
})();

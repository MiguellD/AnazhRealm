// DER ANBLICK — das geschärfte Seh-Werkzeug (wahreranblick-plan §1).
// Die alte diag-sicht hing: sie rief _loopRender SYNCHRON und wartete nie auf
// den asynchronen WebGPU-Render → ein blanker/gestauter Framebuffer + Timeout.
// Heilung: renderAsync AWAITEN (der GPU-Render ist async). Plus:
//   §1.1 Mittag korrekt: setTimeOfDay(0.5) im Render-Pfad (ruft den Sync).
//   §1.2 Timeout besiegen: awaited renderAsync + jeder Shot SOFORT als Artefakt
//        (ein gekillter Lauf hinterlässt Bilder), der wichtigste (Baum nah) ZUERST.
//   §1.3 Last-Zähler: Instanzen + Dreiecke + Draw-Calls, inkrementell als JSON.
//   §1.4 A/B-Bank: ANBLICK_SCATTER / ANBLICK_PBR / ANBLICK_DENSITY env-Schalter.
// Aufruf: node scripts/diag-anblick.cjs   (env: ANBLICK_SCATTER=1 ANBLICK_PBR=1)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.ANBLICK_PORT || 4380);
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const SCATTER = process.env.ANBLICK_SCATTER === "1"; // default AUS für den schnellen Baum-Shot
const PBR = process.env.ANBLICK_PBR !== "0"; // PBR ist Default (V18.234)
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
const progress = { phase: "boot", t: 0, scatter: SCATTER, pbr: PBR, shots: [], counts: null };
const flush = () => {
    try {
        fs.writeFileSync(path.join(ART, "anblick-progress.json"), JSON.stringify(progress, null, 2));
    } catch (_e) {}
};
const T0 = Date.now();
const mark = (phase) => {
    progress.phase = phase;
    progress.t = ((Date.now() - T0) / 1000).toFixed(1);
    flush();
    console.log(`[${progress.t}s] ${phase}`);
};

(async () => {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    mark("launch-browser");
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 595000,
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
    await page.setViewport({ width: 1100, height: 680 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // ── SETTLE: Render gestubbt, Mittag, PBR-Default, Scatter nach Schalter ──
    mark("settle");
    const settleInfo = await page.evaluate(
        async (opts) => {
            let stubbed = false;
            const start = performance.now();
            let last = -1,
                stable = 0;
            while (performance.now() - start < 42000) {
                const r = window.anazhRealm;
                if (r && r.state) {
                    r.state.timeOfDay = 0.5;
                    if (r.state.atmosphere) {
                        r.state.atmosphere.gpuScatter = opts.scatter;
                        r.state.atmosphere.materialMode = opts.pbr ? "pbr" : "toon";
                    }
                }
                if (r && !stubbed && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    if (typeof r.state.renderer.renderAsync === "function") {
                        window.__origRenderAsync = r.state.renderer.renderAsync.bind(r.state.renderer);
                        r.state.renderer.renderAsync = () => Promise.resolve();
                    }
                    r.state.postProcessingFailed = true;
                    stubbed = true;
                }
                if (r && typeof r._gameLoopTick === "function") {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 25 && stable > 45) break;
                }
                await new Promise((res) => setTimeout(res, 4));
            }
            const r = window.anazhRealm;
            return { chunks: r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0 };
        },
        { scatter: SCATTER, pbr: PBR }
    );
    progress.chunks = settleInfo.chunks;
    mark(`settled chunks=${settleInfo.chunks}`);
    const skyDbg = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state,
            pm = s.playerMesh;
        if (r.setTimeOfDay) r.setTimeOfDay(0.5);
        const a = r.auraAt ? r.auraAt(pm.position.x, pm.position.z) : null;
        const neb = s.skyboxUniforms && s.skyboxUniforms.nebulaColor ? s.skyboxUniforms.nebulaColor.value : null;
        const rgb = (c) => (c ? [+c.r.toFixed(3), +c.g.toFixed(3), +c.b.toFixed(3)] : null);
        const base = r._interpolateDayNight ? r._interpolateDayNight(0.5) : null;
        const tinted = base && r._dayNightComputeTint ? r._dayNightComputeTint(base) : null;
        return {
            auraTintStrength: s.atmosphere && s.atmosphere.auraTintStrength,
            glut: a && +(+a.glut).toFixed(2),
            awe: a && a.emotion && +(+a.emotion.awe).toFixed(2),
            joy: a && a.emotion && +(+a.emotion.joy).toFixed(2),
            baseSky: base ? rgb(base.sky) : null,
            tintedSky: tinted ? rgb(tinted.skyColor) : null,
            neb: rgb(neb),
            skyTintStrength: +(+s.skyTintStrength || 0).toFixed(3),
            skyTintTo: rgb(s.skyTintTo),
        };
    });
    console.log("  SKY", JSON.stringify(skyDbg));
    await page.evaluate(() => {
        for (const el of document.querySelectorAll("body > *:not(#world-canvas)")) el.style.display = "none";
    });

    // ── der EINE wahre Render: renderAsync AWAITEN (der Hang-Fix) ──
    const realRender = async () =>
        page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            if (window.__origRender) s.renderer.render = window.__origRender;
            if (window.__origRenderAsync) s.renderer.renderAsync = window.__origRenderAsync;
            s.postProcessingFailed = true;
            if (r.setTimeOfDay) r.setTimeOfDay(0.5); // ECHTES Mittag (ruft _applyDayNightToScene)
            const t0 = performance.now();
            try {
                if (typeof s.renderer.renderAsync === "function") {
                    await s.renderer.renderAsync(s.scene, s.camera);
                    await s.renderer.renderAsync(s.scene, s.camera);
                } else {
                    s.renderer.render(s.scene, s.camera);
                    s.renderer.render(s.scene, s.camera);
                }
            } catch (e) {
                return { err: String(e.message || e), ms: Math.round(performance.now() - t0) };
            }
            // wieder stubben, damit der rAF-Hintergrund nicht weiterrendert
            s.renderer.render = function () {};
            if (typeof s.renderer.renderAsync === "function") s.renderer.renderAsync = () => Promise.resolve();
            return { ms: Math.round(performance.now() - t0) };
        });

    const shoot = async (tag) => {
        const r = await realRender();
        await new Promise((res) => setTimeout(res, 150));
        await page.screenshot({ path: path.join(ART, `anblick-${tag}.png`) });
        progress.shots.push({ tag, ms: r.ms, err: r.err || null });
        flush();
        console.log(`  shot anblick-${tag}.png  render=${r.ms}ms ${r.err || "ok"}`);
    };

    // ── SHOT 1 (ZUERST, der wichtigste): ein gewachsener Baum NAH ──
    // §3-Verifikation: liest die Krone als lushe Krone oder als Stachel?
    mark("spawn-tree");
    const tinfo = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state,
            pm = s.playerMesh,
            cam = s.camera;
        let spawned = false,
            parts = 0,
            anchors = 0,
            foliageVerts = 0,
            key = "";
        try {
            const keys = r._buildVariantLODs("baum_eiche", 0);
            key = keys && keys[0];
            const bp = key && s.blueprints[key];
            parts = bp && bp.parts ? bp.parts.length : 0;
            anchors = bp && bp._skeleton && bp._skeleton.anchors ? bp._skeleton.anchors.length : 0;
            if (bp) {
                const px = pm.position.x + 13,
                    pz = pm.position.z + 2;
                const py = r.getTerrainHeightAt ? r.getTerrainHeightAt(px, pz) : pm.position.y;
                const a = r.spawnArchitecture(key, { x: px, y: py, z: pz }, { silent: true });
                spawned = !!a;
                // Foliage-Vertices der Variante (die echte Kronen-Dichte)
                const fg = s.archMergedGeomCache && s.archMergedGeomCache.get(key);
                if (fg && fg.leaves)
                    for (const lf of fg.leaves) {
                        const g = lf.geom;
                        if (g && g.attributes && g.attributes.position) foliageVerts += g.attributes.position.count;
                    }
                // TIGHT close-up des gespawnten Baums (die echte Welt-Beleuchtung,
                // faithful) — schmaler FOV zoomt in den Baum ohne die Welt-Weite.
                const th = bp._skeleton ? bp._skeleton.totalH : 12;
                cam.position.set(px - th * 1.6, py + th * 0.55, pz + 2);
                cam.lookAt(px, py + th * 0.55, pz);
                if (Number.isFinite(cam.fov)) {
                    cam.fov = 30;
                    cam.updateProjectionMatrix();
                }
                cam.updateMatrixWorld(true);
            }
        } catch (e) {
            return { err: String(e.message || e) };
        }
        return { spawned, parts, anchors, foliageVerts, key };
    });
    progress.tree = tinfo;
    flush();
    console.log(
        `  tree key=${tinfo.key} spawned=${tinfo.spawned} parts=${tinfo.parts} anchors=${tinfo.anchors} foliageVerts=${tinfo.foliageVerts} ${tinfo.err || ""}`
    );
    await shoot("baum");

    if (process.env.ANBLICK_ONLY_BAUM === "1") {
        progress.phase = "done-baum-only";
        flush();
        console.log("\n(only-baum) artifacts/anblick-baum.png + anblick-progress.json");
        await browser.close();
        await new Promise((r) => server.close(r));
        process.exit(0);
    }

    // ── SHOT 2+3: Boden/Wald nah, Augenhöhe, zwei Richtungen ──
    for (const [yaw, tag] of [
        [35, "ground-a"],
        [200, "ground-b"],
    ]) {
        mark(`aim-${tag}`);
        await page.evaluate((yaw) => {
            const r = window.anazhRealm,
                s = r.state,
                pm = s.playerMesh,
                cam = s.camera;
            const y = (yaw * Math.PI) / 180,
                ex = pm.position.x,
                ey = pm.position.y + 1.7,
                ez = pm.position.z;
            cam.position.set(ex, ey, ez);
            cam.lookAt(ex + Math.sin(y) * 50, ey - 6, ez + Math.cos(y) * 50);
            cam.updateMatrixWorld(true);
        }, yaw);
        await shoot(tag);
    }

    // ── LAST-ZÄHLER (§1.3): Instanzen + Dreiecke + Draw-Calls ──
    mark("count");
    const counts = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        let instances = 0,
            tris = 0,
            draws = 0,
            meshes = 0,
            instMeshes = 0;
        s.scene.traverse((o) => {
            if (o.isInstancedMesh) {
                const c = o.count || 0;
                instances += c;
                draws++;
                instMeshes++;
                const g = o.geometry;
                const t =
                    g && g.index ? g.index.count / 3 : g && g.attributes.position ? g.attributes.position.count / 3 : 0;
                tris += t * c;
            } else if (o.isMesh) {
                meshes++;
                draws++;
                const g = o.geometry;
                const t =
                    g && g.index
                        ? g.index.count / 3
                        : g && g.attributes && g.attributes.position
                          ? g.attributes.position.count / 3
                          : 0;
                tris += t;
            }
        });
        return {
            instances,
            tris: Math.round(tris),
            draws,
            meshes,
            instMeshes,
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };
    });
    progress.counts = counts;
    mark("done");
    console.log(
        `\nLAST: instances=${counts.instances} tris=${counts.tris.toLocaleString()} drawCalls=${counts.draws} (inst=${counts.instMeshes} mesh=${counts.meshes}) chunks=${counts.chunks}`
    );
    console.log(`artifacts/anblick-{baum,ground-a,ground-b}.png + anblick-progress.json`);

    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();

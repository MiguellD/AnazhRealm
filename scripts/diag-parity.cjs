// diag-parity.cjs — DAS PARITÄTS-AUGE (Schöpfer „vollende es": die zwei Bilder nebeneinander,
// bis man nicht mehr sagen kann, welches welches ist). Rendert BEIDE Welten sequenziell auf
// swiftshader (nie zwei Seiten zugleich — Container-Wand) mit vergleichbarer Rahmung:
//   1) STUDIO (worlds/terrain, WebGL r128): enterForest, UI aus, Wald-Blick → parity-studio.png
//   2) ANAZHREALM (WebGPU, bare render — ACES-Tonemapping ist im Renderer, das Bild-Urteil gilt):
//      kleine dichte Welt, Kamera IN den Wald (hoher standDensity-Spot), Augenhöhe → parity-anazh.png
//   3) ANALYSE (2D-Canvas, GPU-frei): Himmel-/Boden-Palette · Grün-Deckung · Vergleichs-Tabelle.
// Die Bilder sind das GATE der Vollendungs-Welle; die Zahlen sind die Zwischen-Linse.
//   node scripts/diag-parity.cjs [--skip-studio] [--skip-anazh]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.PARITY_PORT || 4399);
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
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
    const fp = path.join(root, decodeURIComponent(p));
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
const W = 960,
    H = 600;
const LAUNCH = {
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
};

async function renderStudio() {
    const browser = await puppeteer.launch(LAUNCH);
    const out = { ms: NaN, ok: false };
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: W, height: H });
        page.on("pageerror", (e) => console.log("[studio PE]", (e.stack || e.message).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/worlds/terrain/index.html?patch-probe`, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });
        await page.evaluate(async () => {
            const dl = performance.now() + 60000;
            while (performance.now() < dl) {
                const v = window.__phytoView;
                if (v && v.scene && v.renderer && v.camera) return;
                await new Promise((r) => setTimeout(r, 100));
            }
        });
        await sleep(2000);
        await page.evaluate(() => {
            const wb = document.getElementById("waldBtn");
            if (wb) wb.click();
        });
        await sleep(6000); // enterForest pflanzt + bäckt Schatten
        await page.evaluate(() => {
            for (const id of ["ui", "forestHint", "exitForest", "loading"]) {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            }
        });
        out.ms = await page.evaluate(() => {
            const v = window.__phytoView;
            if (!v) return NaN;
            v.renderPatch();
            const t0 = performance.now();
            v.renderPatch();
            return +(performance.now() - t0).toFixed(1);
        });
        await sleep(300);
        await page.screenshot({ path: path.join(ART, "parity-studio.png") });
        out.ok = true;
        console.log(`STUDIO gerendert: ${out.ms} ms/Frame → parity-studio.png ✓`);
    } catch (e) {
        console.log("STUDIO-Render scheiterte:", (e && e.message ? e.message : e).toString().split("\n")[0]);
    }
    try {
        await browser.close();
    } catch (_e) {}
    return out;
}

async function renderAnazh() {
    const browser = await puppeteer.launch(LAUNCH);
    const out = { ms: NaN, ok: false, scene: null };
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: W, height: H });
        page.on("pageerror", (e) => console.log("[anazh PE]", (e.stack || e.message).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        // Laden: Render gestubbt, Worker sync, Post-FX aus (bare Render trägt ACES) — der Light-Pfad.
        const loaded = await page.evaluate(async () => {
            let stubbed = false;
            const start = performance.now();
            let lastSize = -1,
                stableFor = 0;
            while (performance.now() - start < 110000) {
                const r = window.anazhRealm;
                if (r && !stubbed && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    if (typeof r.state.renderer.renderAsync === "function")
                        r.state.renderer.renderAsync = () => Promise.resolve();
                    try {
                        r.state.voxelWorker = null;
                    } catch (_e) {}
                    try {
                        r.state.postProcessingFailed = true;
                    } catch (_e) {}
                    // Impostor-RTT-Bakes BLOCKEN, solange der Render gestubbt ist — sonst „backen"
                    // sie in einen No-op-Renderer = LEERE Atlanten = weiße Geister-Bäume (gemessen
                    // im ersten Paritäts-Bild). Vor dem Schuss wird der Block gelöst + real gebacken.
                    try {
                        r._impostorBakePending = true;
                    } catch (_e) {}
                    try {
                        r.state.foliageRadius = AnazhRealm.PERF_FOLIAGE_RADIUS_MAX || 240;
                        r.state._activeRingRadius = r._voxelChunkConfig ? r._voxelChunkConfig().ringRadius : 4;
                    } catch (_e) {}
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
                    // PARITÄT: 9 Chunks (ring 1, ±65 m) = die STUDIO-Weltgröße (R≈64 m) — dieselbe
                    // Bühne für beide Bilder. GEMESSEN: das Studio trägt selbst 15.95M Tris (WebGL
                    // schluckt das auf swiftshader; WebGPU stirbt dort ab ~6M — eine CONTAINER-
                    // Eigenheit, kein Budget-Urteil). 9 Chunks halten AnazhRealm unter der Container-
                    // Decke, ohne die Welt fürs Bild zu verdünnen.
                    if (sz >= 9 && stableFor > 50) break;
                }
                await new Promise((res) => setTimeout(res, 2));
            }
            const r = window.anazhRealm;
            try {
                r._drainPendingWaterIso && r._drainPendingWaterIso();
                r._drainPendingGrass && r._drainPendingGrass();
            } catch (_e) {}
            return { chunks: r.state.voxelChunks ? r.state.voxelChunks.size : 0 };
        });
        console.log("ANAZH Welt geladen:", JSON.stringify(loaded));
        // Foundry-Assets nachziehen: weiter ticken, bis die Baum-Requests bedient sind (Wald sichtbar).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const dl = performance.now() + 45000;
            let lastPend = -1,
                stable = 0;
            while (performance.now() < dl) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const f = r._foundry;
                const pend = f && f.pending ? (f.pending.size != null ? f.pending.size : 0) : 0;
                const req = f && f.requested ? f.requested.size : 0;
                const key = pend * 1000 + req;
                if (key === lastPend) stable++;
                else {
                    stable = 0;
                    lastPend = key;
                }
                if (stable > 120) break;
                await new Promise((res) => setTimeout(res, 8));
            }
            try {
                if (typeof r._foundryRewarmColdTrees === "function") r._foundryRewarmColdTrees();
                if (typeof r._scatterRefillPending !== "undefined") r._scatterRefillPending = true;
            } catch (_e) {}
            for (let i = 0; i < 200; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 4));
            }
        });
        // UI aus + Avatar aus + TAGESZEIT auf Studio-10:00 gepinnt (die Tick-Pumpe hatte die Uhr
        // in die Dämmerung gedreht → violetter Himmel + Sterne am Tag im ersten Paritäts-Bild).
        await page.evaluate(() => {
            const cv = document.querySelector("canvas");
            for (const el of Array.from(document.body.children))
                if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
            const r = window.anazhRealm;
            if (r.state.playerMesh) r.state.playerMesh.visible = false;
            try {
                // AnazhRealms Tages-KURVE ist anders gemappt als die Studio-Uhr: t=10/24 liegt in der
                // Morgen-Rampe (warm-mauve), t=0.5 ist ZENIT — dort steht die Sonne senkrecht und
                // VERTIKALE Stämme bekommen NdotL≈0 (der „schwarze Stamm", Zyklus 7 gemessen: Äste
                // braun, Stamm schwarz — gleiche Farbe, anderes Licht). Das Studio schießt bei ~52°
                // Sonnenstand (keyLight 58/92/40). Der visuelle Zwilling: t=0.58 (Sonne ~60°, Himmel
                // blau, Licht warm-weiß, Stämme seitlich beleuchtet).
                r.state.timeOfDay = 0.58;
                r.state.weather = "sunny";
                r.state.weatherTransition = null;
                if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
            } catch (_e) {}
        });
        // Kamera IN den Wald: dichtesten trockenen Spot suchen, Blick auf die meisten nahen Bäume.
        const cam = await page.evaluate(() => {
            const r = window.anazhRealm;
            const s = r.state;
            const pm = s.playerMesh;
            if (!pm || !s.camera) return { err: "no player/cam" };
            const th = (x, z) => r.getTerrainHeightAt(x, z);
            const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
            const sd = (x, z) => (typeof r._forestStandDensity === "function" ? r._forestStandDensity(x, z) : 0);
            // WALDBODEN, nicht Berg (das erste Bild stand auf einem Steilhang @eyeY 50 m): unter den
            // dichten Kandidaten (stand ≥ 0.6) den TIEFSTEN, FLACHSTEN nehmen — die Studio-Bühne ist
            // der flache Waldboden, nicht der Grat.
            let best = null;
            for (let rad = 8; rad <= 100; rad += 6) {
                for (let a = 0; a < 360; a += 20) {
                    const x = pm.position.x + Math.cos((a * Math.PI) / 180) * rad;
                    const z = pm.position.z + Math.sin((a * Math.PI) / 180) * rad;
                    const g = th(x, z);
                    if (!(g > wl(x, z) + 2)) continue;
                    const slope = Math.abs(th(x + 3, z) - th(x - 3, z)) + Math.abs(th(x, z + 3) - th(x, z - 3));
                    if (slope > 3.5) continue;
                    const d = sd(x, z);
                    if (d < 0.6) continue;
                    const score = -g - slope * 2; // tief + flach gewinnt (Dichte ist per Gate schon hoch)
                    if (!best || score > best.score) best = { x, z, d, score };
                }
            }
            const bx = best ? best.x : pm.position.x,
                bz = best ? best.z : pm.position.z;
            // Blickrichtung: wo stehen die meisten gebauten Bäume (arch-Einträge mit _lodSpecies) in 8-45 m?
            let bestYaw = 0.6,
                bestN = -1;
            const arch = s.architectures || [];
            for (let ya = 0; ya < 360; ya += 15) {
                const dx = Math.sin((ya * Math.PI) / 180),
                    dz = Math.cos((ya * Math.PI) / 180);
                let n = 0;
                for (const e of arch) {
                    if (!e || !e.position || !e._lodSpecies) continue;
                    const rx = e.position.x - bx,
                        rz = e.position.z - bz;
                    const dist = Math.hypot(rx, rz);
                    if (dist < 6 || dist > 45) continue;
                    const dot = (rx * dx + rz * dz) / dist;
                    if (dot > 0.55) n++;
                }
                if (n > bestN) {
                    bestN = n;
                    bestYaw = (ya * Math.PI) / 180;
                }
            }
            const gy = th(bx, bz);
            const eyeY = gy + 1.7;
            pm.position.set(bx, eyeY, bz);
            const cam = s.camera;
            const pitch = (-4 * Math.PI) / 180;
            cam.position.set(bx, eyeY, bz);
            const dir = {
                x: Math.sin(bestYaw) * Math.cos(pitch),
                y: Math.sin(pitch),
                z: Math.cos(bestYaw) * Math.cos(pitch),
            };
            cam.lookAt(bx + dir.x * 50, eyeY + dir.y * 50, bz + dir.z * 50);
            cam.updateMatrixWorld(true);
            return {
                bx: +bx.toFixed(1),
                bz: +bz.toFixed(1),
                stand: best ? +best.d.toFixed(2) : null,
                treesInView: bestN,
            };
        });
        console.log("ANAZH Kamera:", JSON.stringify(cam));
        // Die IMPOSTOR-ATLANTEN jetzt ECHT backen (der Block fällt, der echte Render lebt kurz):
        // die RTT-Bakes laufen async über mehrere Frames — pumpen bis die Queue leer ist.
        const baked = await page.evaluate(async () => {
            const r = window.anazhRealm;
            r.state.renderer.render = window.__origRender;
            r._impostorBakePending = false;
            const dl = performance.now() + 25000;
            let n0 = (window.__impostorRttBaked || 0) | 0;
            while (performance.now() < dl) {
                // NUR den Bake-Tick pumpen (rendert die winzigen 128×256-RTT-Zellen), NIE den vollen
                // _gameLoopTick mit echtem Render — N volle 7M-Tri-Frames auf WebGPU-swiftshader sind
                // der Kumulativ-Tod (im 4. Zyklus gemessen: Target closed genau in dieser Phase).
                try {
                    r._tickImpostorBake();
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 60));
                const q = r._impostorBakeQueue;
                if ((!q || q.length === 0) && !r._impostorBakePending) break;
            }
            r.state.renderer.render = function () {};
            return { baked: ((window.__impostorRttBaked || 0) | 0) - n0, err: window.__impostorRttError || null };
        });
        console.log("ANAZH Impostor-RTT gebacken:", JSON.stringify(baked));
        // Szene-Last + ein bare Render + Screenshot (crash-sicher).
        out.scene = await page.evaluate(() => {
            const r = window.anazhRealm;
            let tris = 0,
                inst = 0;
            r.state.scene.traverse((o) => {
                if (!o.visible || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return;
                const g = o.geometry;
                if (!g || !g.attributes || !g.attributes.position) return;
                const idx = g.index ? g.index.count : g.attributes.position.count;
                const cnt = o.isInstancedMesh ? o.count : 1;
                tris += (idx / 3) * cnt;
                if (o.isInstancedMesh) inst += cnt;
            });
            return { tris: Math.round(tris), instances: inst };
        });
        console.log("ANAZH Szene:", JSON.stringify(out.scene));
        // STAMM-SONDE: was IST der dunkle Stamm? Raycast durch die Bild-Mitte-rechts (dort stand er
        // in Zyklus 7-10) → Mesh-Typ, leafKey/Name, Vertex-Farb-Attribut, Instanz-Farbe.
        const trunkProbe = await page.evaluate(() => {
            const r = window.anazhRealm;
            const cam = r.state.camera;
            const rc = new THREE.Raycaster();
            const out = [];
            for (const [nx, ny] of [
                [0.25, 0.05],
                [0.25, -0.2],
                [0.0, 0.0],
            ]) {
                rc.setFromCamera(new THREE.Vector2(nx, ny), cam);
                const hits = rc.intersectObjects(r.state.scene.children, true);
                const h = hits && hits[0];
                if (!h) {
                    out.push(null);
                    continue;
                }
                const o = h.object;
                const g = o.geometry;
                const col = g && g.getAttribute ? g.getAttribute("color") : null;
                let colMean = null;
                if (col) {
                    let s = [0, 0, 0];
                    const n = Math.min(col.count, 2000);
                    for (let i = 0; i < n; i++) {
                        s[0] += col.getX(i);
                        s[1] += col.getY(i);
                        s[2] += col.getZ(i);
                    }
                    colMean = s.map((v) => +(v / n).toFixed(3));
                }
                let instCol = null;
                if (o.isInstancedMesh && o.instanceColor && Number.isFinite(h.instanceId)) {
                    const c = new THREE.Color();
                    o.getColorAt(h.instanceId, c);
                    instCol = [+c.r.toFixed(3), +c.g.toFixed(3), +c.b.toFixed(3)];
                }
                out.push({
                    type: o.isBatchedMesh ? "batch" : o.isInstancedMesh ? "inst" : "mesh",
                    name: (o.name || "").slice(0, 60),
                    kind: o.material && o.material.userData ? o.material.userData.foundryKind : null,
                    hasColorAttr: !!col,
                    colMean,
                    instCol,
                    dist: +h.distance.toFixed(1),
                });
            }
            return out;
        });
        console.log("STAMM-SONDE:", JSON.stringify(trunkProbe));
        try {
            out.ms = await page.evaluate(() => {
                const r = window.anazhRealm;
                r.state.postProcessingFailed = true;
                r.state.renderer.render = window.__origRender;
                let ms = NaN;
                try {
                    r._loopRender(performance.now());
                    const t0 = performance.now();
                    r._loopRender(performance.now());
                    ms = +(performance.now() - t0).toFixed(1);
                } finally {
                    r.state.renderer.render = function () {};
                }
                return ms;
            });
            await sleep(300);
            await page.screenshot({ path: path.join(ART, "parity-anazh.png") });
            out.ok = true;
            console.log(`ANAZH gerendert: ${out.ms} ms/Frame → parity-anazh.png ✓`);
        } catch (e) {
            console.log("ANAZH-Render/Screenshot scheiterte:", (e && e.message ? e.message : e).toString().split("\n")[0]);
        }
    } catch (e) {
        console.log("ANAZH scheiterte:", (e && e.message ? e.message : e).toString().split("\n")[0]);
    }
    try {
        await browser.close();
    } catch (_e) {}
    return out;
}

async function analyze() {
    // GPU-frei: die zwei PNGs in einer 2D-Canvas-Seite vermessen (Himmel/Boden/Grün-Deckung).
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
    const stats = await page.evaluate(async (port) => {
        const load = (src) =>
            new Promise((res) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = () => res(null);
                img.src = `http://127.0.0.1:${port}/artifacts/${src}`;
            });
        const measure = (img) => {
            if (!img) return null;
            const c = document.createElement("canvas");
            c.width = img.width;
            c.height = img.height;
            const x = c.getContext("2d");
            x.drawImage(img, 0, 0);
            const d = x.getImageData(0, 0, c.width, c.height).data;
            const zone = (y0, y1) => {
                let r = 0,
                    g = 0,
                    b = 0,
                    n = 0,
                    green = 0;
                for (let y = Math.floor(c.height * y0); y < Math.floor(c.height * y1); y += 2)
                    for (let px = 0; px < c.width; px += 2) {
                        const i = (y * c.width + px) * 4;
                        r += d[i];
                        g += d[i + 1];
                        b += d[i + 2];
                        if (d[i + 1] > d[i] * 1.05 && d[i + 1] > d[i + 2] * 1.05) green++;
                        n++;
                    }
                return { rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)], greenPct: +((green / n) * 100).toFixed(1) };
            };
            return { sky: zone(0, 0.3), mid: zone(0.3, 0.65), ground: zone(0.65, 1) };
        };
        const a = await load("parity-anazh.png");
        const s = await load("parity-studio.png");
        return { anazh: measure(a), studio: measure(s) };
    }, PORT);
    await browser.close();
    return stats;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const skipStudio = process.argv.includes("--skip-studio");
    const skipAnazh = process.argv.includes("--skip-anazh");
    let studio = { ms: NaN },
        anazh = { ms: NaN };
    if (!skipStudio) studio = await renderStudio();
    if (!skipAnazh) anazh = await renderAnazh();
    const st = await analyze();
    console.log("\n===== PARITÄTS-TABELLE =====");
    const row = (name, m) =>
        console.log(
            `  ${name.padEnd(8)} Himmel ${m ? JSON.stringify(m.sky.rgb) : "—"} · Mitte ${m ? JSON.stringify(m.mid.rgb) : "—"} (grün ${m ? m.mid.greenPct : "—"}%) · Boden ${m ? JSON.stringify(m.ground.rgb) : "—"} (grün ${m ? m.ground.greenPct : "—"}%)`
        );
    row("STUDIO", st.studio);
    row("ANAZH", st.anazh);
    console.log(`  Frame:   Studio ${studio.ms} ms · Anazh ${anazh.ms} ms${anazh.scene ? ` · Anazh-Szene ${(anazh.scene.tris / 1e6).toFixed(2)}M Tris / ${anazh.scene.instances} Inst` : ""}`);
    console.log("\nBilder: artifacts/parity-studio.png + artifacts/parity-anazh.png");
    server.close();
    process.exit(0);
})().catch((e) => {
    console.error("Paritäts-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

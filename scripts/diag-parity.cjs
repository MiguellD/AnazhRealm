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
            // INVENTUR (08.07., Schöpfer „Steine fehlen"): auf die STREU-KONVERGENZ warten —
            // deferrierte Regionen (Assets waren beim ersten Pass kalt) werden vom Refill neu
            // gestreamt; erst wenn KEINE Region mehr deferriert ist (oder Timeout), ist die
            // Bühne vollständig (Kiesel-Teppich · Blumen · Sträucher · Fels im Bild).
            const dl2 = performance.now() + 90000;
            while (performance.now() < dl2) {
                for (let i = 0; i < 120; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                }
                await new Promise((res) => setTimeout(res, 300));
                let deferred = 0;
                if (r.state.scatterRegions)
                    for (const reg of r.state.scatterRegions.values()) if (reg && reg._deferredFoundry) deferred++;
                if (deferred === 0 && !r._scatterRefillPending) break;
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
            // W2 — BÜHNEN-REINIGUNG (das Bild vergleicht die WELT-PRÄSENTATION, nicht die
            // Welt-Substanz): Kreaturen + start_plattform + fliegende Inseln sind AnazhRealm-
            // Substanz ohne Studio-Gegenstück → im Paritäts-SHOT versteckt (in der Welt bleiben
            // sie — kein Render-Regime-Gate auf Welt-Inhalt, nur die Mess-Bühne ist sauber).
            try {
                if (Array.isArray(r.state.creatures)) for (const c of r.state.creatures) if (c) c.visible = false;
                if (Array.isArray(r.state.floatingIslands))
                    for (const isl of r.state.floatingIslands) if (isl) isl.visible = false;
                if (Array.isArray(r.state.architectures))
                    for (const a of r.state.architectures)
                        if (a && a.type === "start_plattform" && a.mesh) a.mesh.visible = false;
            } catch (_e) {}
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
            // P-C (08.07.): ZUERST den parallelen Saug abwarten (er ist jetzt deterministisch —
            // Bibliothek ~6 s, Records ~10 s nach Boot), DANN einen expliziten ensure-Pass über
            // die Baum-(Art×Variante)-Matrix (enqueued alles, was der Block verpasste), DANN
            // real backen. Vorher: baked:0, weil die Queue zum Drain-Zeitpunkt leer war.
            const f = r._foundry;
            const dlP = performance.now() + 30000;
            while (f && f._prefetching && performance.now() < dlP) await new Promise((res) => setTimeout(res, 200));
            try {
                const spec = r._foundryLibrarySpec();
                const season = r.state.season || "summer";
                for (const sp of spec.species) {
                    if (typeof r._foundryPresetIsTree === "function" && !r._foundryPresetIsTree(sp)) continue;
                    for (let v = 1; v <= 16; v++) r._foundryEnsureImpostorRecord(sp, v, season);
                }
            } catch (_e) {}
            const qLen0 = r._impostorBakeQueue ? r._impostorBakeQueue.length : 0;
            const recs0 = r._impostorAtlasMap ? r._impostorAtlasMap.size : 0;
            r.state.renderer.render = window.__origRender;
            r._impostorBakePending = false;
            // P0 (Bühnen-Ordnung, 09.07.) — die Bake-Queue wartet in Produktion auf die Bühne
            // (_tickImpostorBake-Gate); diese Linse will die Bakes JETZT drainen → Bühne latchen.
            r.state._buehneStand = true;
            const dl = performance.now() + 45000;
            let n0 = (window.__impostorRttBaked || 0) | 0;
            let _bi = 0;
            while (performance.now() < dl) {
                // NUR den Bake-Tick pumpen (rendert die winzigen 128×256-RTT-Zellen), NIE den vollen
                // _gameLoopTick mit echtem Render — N volle 7M-Tri-Frames auf WebGPU-swiftshader sind
                // der Kumulativ-Tod (im 4. Zyklus gemessen: Target closed genau in dieser Phase).
                try {
                    r._tickImpostorBake();
                } catch (_e) {}
                // W4.3 (die 0/115-Wurzel): der async Readback des RTT-Bakes resolvt NUR, wenn die
                // GPU-Queue echte Submissions sieht — ohne Frames hing der ERSTE Bake für immer
                // (pending klemmte, die ganze Queue verhungerte still, err null). Ein winziger
                // 1×1-Scissor-Render alle paar Ticks flusht die Queue, ohne die volle Szene zu
                // rastern (die Kumulativ-Tod-Wand bleibt).
                if ((++_bi & 7) === 0) {
                    try {
                        r.state.renderer.setScissorTest(true);
                        r.state.renderer.setScissor(0, 0, 1, 1);
                        r.state.renderer.render(r.state.scene, r.state.camera);
                        r.state.renderer.setScissorTest(false);
                    } catch (_e) {}
                }
                await new Promise((res) => setTimeout(res, 60));
                const q = r._impostorBakeQueue;
                if ((!q || q.length === 0) && !r._impostorBakePending) break;
            }
            r.state.renderer.render = function () {};
            return {
                baked: ((window.__impostorRttBaked || 0) | 0) - n0,
                queueVorher: qLen0,
                records: recs0,
                err: window.__impostorRttError || null,
            };
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
            console.log(
                "ANAZH-Render/Screenshot scheiterte:",
                (e && e.message ? e.message : e).toString().split("\n")[0]
            );
        }
    } catch (e) {
        console.log("ANAZH scheiterte:", (e && e.message ? e.message : e).toString().split("\n")[0]);
    }
    try {
        await browser.close();
    } catch (_e) {}
    return out;
}

async function analyze(selftest) {
    // GPU-frei: die zwei PNGs in einer 2D-Canvas-Seite vermessen. W2 — die framing-robusten
    // Statistiken fürs künftige VERDIKT (Kalibrierung erst in W6, NACH den bild-ändernden
    // Wellen — die V18.346-Kontaminations-Disziplin): Zonen-RGB + Grün-% (wie gehabt) PLUS
    // Luma-Histogramm (32 Bins, L1-Distanz — framing-tolerant) + Kanten-Dichte pro Zone,
    // AA-ROBUST (Downscale ¼ VOR der Gradienten-Statistik — swiftshader hat kein MSAA, die
    // Sub-Pixel-Kanten-Achse ist genau die Container↔GPU-Divergenz, V18.374).
    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page
        .goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 20000 })
        .catch(() => {});
    const stats = await page.evaluate(
        async (port, doSelftest) => {
            const load = (src) =>
                new Promise((res) => {
                    const img = new Image();
                    img.onload = () => res(img);
                    img.onerror = () => res(null);
                    img.src = `http://127.0.0.1:${port}/artifacts/${src}`;
                });
            const measure = (src) => {
                // src: Image ODER Canvas (der Selbst-Test misst synthetische Canvases)
                if (!src) return null;
                const W0 = src.width,
                    H0 = src.height;
                const c = document.createElement("canvas");
                c.width = W0;
                c.height = H0;
                const x = c.getContext("2d");
                x.drawImage(src, 0, 0);
                const d = x.getImageData(0, 0, W0, H0).data;
                const zone = (y0, y1) => {
                    let r = 0,
                        g = 0,
                        b = 0,
                        n = 0,
                        green = 0;
                    for (let y = Math.floor(H0 * y0); y < Math.floor(H0 * y1); y += 2)
                        for (let px = 0; px < W0; px += 2) {
                            const i = (y * W0 + px) * 4;
                            r += d[i];
                            g += d[i + 1];
                            b += d[i + 2];
                            if (d[i + 1] > d[i] * 1.05 && d[i + 1] > d[i + 2] * 1.05) green++;
                            n++;
                        }
                    return {
                        rgb: [Math.round(r / n), Math.round(g / n), Math.round(b / n)],
                        greenPct: +((green / n) * 100).toFixed(1),
                    };
                };
                // Luma-Histogramm (32 Bins, normiert) übers ganze Bild
                const hist = new Array(32).fill(0);
                let hn = 0;
                for (let i = 0; i < d.length; i += 16) {
                    const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
                    hist[Math.min(31, (l / 8) | 0)]++;
                    hn++;
                }
                for (let i = 0; i < 32; i++) hist[i] /= hn;
                // Kanten-Dichte, AA-robust: erst auf ¼ verkleinern (bilinear = Blur), dann Gradient
                const c4 = document.createElement("canvas");
                c4.width = Math.max(8, (W0 / 4) | 0);
                c4.height = Math.max(8, (H0 / 4) | 0);
                const x4 = c4.getContext("2d");
                x4.drawImage(src, 0, 0, c4.width, c4.height);
                const d4 = x4.getImageData(0, 0, c4.width, c4.height).data;
                const lum = (i) => 0.2126 * d4[i] + 0.7152 * d4[i + 1] + 0.0722 * d4[i + 2];
                const edgeZone = (y0, y1) => {
                    let e = 0,
                        n = 0;
                    for (
                        let y = Math.max(1, (c4.height * y0) | 0);
                        y < Math.min(c4.height - 1, (c4.height * y1) | 0);
                        y++
                    )
                        for (let px = 1; px < c4.width - 1; px++) {
                            const i = (y * c4.width + px) * 4;
                            const gx = Math.abs(lum(i + 4) - lum(i - 4));
                            const gy = Math.abs(lum(i + c4.width * 4) - lum(i - c4.width * 4));
                            if (gx + gy > 48) e++;
                            n++;
                        }
                    return +(e / Math.max(1, n)).toFixed(4);
                };
                return {
                    sky: zone(0, 0.3),
                    mid: zone(0.3, 0.65),
                    ground: zone(0.65, 1),
                    lumaHist: hist,
                    edges: { sky: edgeZone(0, 0.3), mid: edgeZone(0.3, 0.65), ground: edgeZone(0.65, 1) },
                };
            };
            const out = {};
            if (doSelftest) {
                // ── SELBST-TEST (GPU-frei, standalone): das Statistik-SKELETT muss eine
                // injizierte Störung als DELTA zeigen — sonst wären alle Baseline-Zahlen
                // unverifiziert (ein ~0-Delta-Skelett fiele erst in W6 auf, 4 Wellen später).
                const synth = (hueShift, bright, jitter) => {
                    const c = document.createElement("canvas");
                    c.width = 240;
                    c.height = 150;
                    const x = c.getContext("2d");
                    for (let y = 0; y < c.height; y++) {
                        const t = y / c.height;
                        const r = (60 + t * 60 + hueShift) | 0,
                            g = (140 - t * 40 + bright) | 0,
                            b = (200 - t * 160) | 0;
                        x.fillStyle = `rgb(${r},${g},${b})`;
                        x.fillRect(0, y, c.width, 1);
                    }
                    // deterministisches „Blatt-Rauschen" für die Kanten-Statistik
                    let s = 12345;
                    const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
                    for (let i = 0; i < 400 + jitter; i++) {
                        x.fillStyle = i % 2 ? "#1c4a1c" : "#2f6b2f";
                        x.fillRect((rnd() * c.width) | 0, (60 + rnd() * 80) | 0, 3, 3);
                    }
                    return c;
                };
                const base = measure(synth(0, 0, 0));
                const same = measure(synth(0, 0, 0));
                const disturbed = measure(synth(40, 30, 900));
                const l1 = (a, b) => a.lumaHist.reduce((s2, v, i) => s2 + Math.abs(v - b.lumaHist[i]), 0);
                const rgbD = (a, b, z) => Math.hypot(...a[z].rgb.map((v, i) => v - b[z].rgb[i]));
                out.selftest = {
                    identicalNearZero: l1(base, same) < 0.01 && rgbD(base, same, "mid") < 1,
                    disturbedVisible:
                        l1(base, disturbed) > 0.08 &&
                        rgbD(base, disturbed, "mid") > 15 &&
                        Math.abs(base.edges.mid - disturbed.edges.mid) > 0.005,
                    deltas: {
                        histSame: +l1(base, same).toFixed(4),
                        histDist: +l1(base, disturbed).toFixed(4),
                        rgbDist: +rgbD(base, disturbed, "mid").toFixed(1),
                        edgeDist: +Math.abs(base.edges.mid - disturbed.edges.mid).toFixed(4),
                    },
                };
            }
            const a = await load("parity-anazh.png");
            const s = await load("parity-studio.png");
            out.anazh = measure(a);
            out.studio = measure(s);
            return out;
        },
        PORT,
        !!selftest
    );
    await browser.close();
    return stats;
}

(async () => {
    fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const skipStudio = process.argv.includes("--skip-studio");
    const skipAnazh = process.argv.includes("--skip-anazh");
    const selftest = process.argv.includes("--selftest");
    let studio = { ms: NaN },
        anazh = { ms: NaN };
    if (!skipStudio) studio = await renderStudio();
    if (!skipAnazh) anazh = await renderAnazh();
    const st = await analyze(selftest);
    if (selftest && st.selftest) {
        console.log("\n===== SELBST-TEST DES STATISTIK-SKELETTS (synthetisch, GPU-frei) =====");
        console.log(
            `  identisch → ~0-Delta: ${st.selftest.identicalNearZero ? "✅" : "❌"} (hist ${st.selftest.deltas.histSame})`
        );
        console.log(
            `  Störung → sichtbares Delta: ${st.selftest.disturbedVisible ? "✅" : "❌"} (hist ${st.selftest.deltas.histDist} · RGB ${st.selftest.deltas.rgbDist} · Kanten ${st.selftest.deltas.edgeDist})`
        );
        if (!st.selftest.identicalNearZero || !st.selftest.disturbedVisible) {
            server.close();
            process.exit(1);
        }
    }
    console.log("\n===== PARITÄTS-TABELLE =====");
    const row = (name, m) =>
        console.log(
            `  ${name.padEnd(8)} Himmel ${m ? JSON.stringify(m.sky.rgb) : "—"} · Mitte ${m ? JSON.stringify(m.mid.rgb) : "—"} (grün ${m ? m.mid.greenPct : "—"}%) · Boden ${m ? JSON.stringify(m.ground.rgb) : "—"} (grün ${m ? m.ground.greenPct : "—"}%)${m && m.edges ? ` · Kanten [${m.edges.sky}, ${m.edges.mid}, ${m.edges.ground}]` : ""}`
        );
    row("STUDIO", st.studio);
    row("ANAZH", st.anazh);
    console.log(
        `  Frame:   Studio ${studio.ms} ms · Anazh ${anazh.ms} ms${anazh.scene ? ` · Anazh-Szene ${(anazh.scene.tris / 1e6).toFixed(2)}M Tris / ${anazh.scene.instances} Inst` : ""}`
    );
    // W2 — DAS VERDIKT-SKELETT (PROVISORISCH, NICHT-GATEND): die Deltas als Zahlen + eine
    // vorläufige Schwellen-Ampel. Die Schwellen werden erst in W6 KALIBRIERT + scharf
    // gestellt (exit≠0), NACHDEM W5/W6 das Bild stabilisiert haben (V18.346-Disziplin:
    // nie auf einem Bild kalibrieren, das sich noch bewegt). Bis dahin: Baseline-Anker.
    if (st.studio && st.anazh) {
        const rgbD = (z) => Math.hypot(...st.studio[z].rgb.map((v, i) => v - st.anazh[z].rgb[i]));
        const histL1 = st.studio.lumaHist.reduce((s2, v, i) => s2 + Math.abs(v - st.anazh.lumaHist[i]), 0);
        const rows = [
            { k: "Himmel-RGB-Δ", v: +rgbD("sky").toFixed(1), thr: 25 },
            { k: "Mitte-RGB-Δ", v: +rgbD("mid").toFixed(1), thr: 25 },
            { k: "Boden-RGB-Δ", v: +rgbD("ground").toFixed(1), thr: 25 },
            { k: "Grün-%-Δ (Mitte)", v: +Math.abs(st.studio.mid.greenPct - st.anazh.mid.greenPct).toFixed(1), thr: 12 },
            { k: "Luma-Hist-L1", v: +histL1.toFixed(3), thr: 0.35 },
            { k: "Kanten-Δ (Mitte)", v: +Math.abs(st.studio.edges.mid - st.anazh.edges.mid).toFixed(4), thr: 0.06 },
        ];
        console.log("\n===== VERDIKT-SKELETT (provisorische Schwellen — Kalibrierung + Schärfung in W6) =====");
        for (const r of rows) console.log(`  ${r.v <= r.thr ? "✓" : "⚠"} ${r.k.padEnd(18)} ${r.v}  (prov. ≤ ${r.thr})`);
    } else if (!selftest) {
        console.log("\n(Verdikt-Skelett: mindestens ein Bild fehlt — nur mit beiden PNGs messbar.)");
    }
    console.log("\nBilder: artifacts/parity-studio.png + artifacts/parity-anazh.png");
    server.close();
    process.exit(0);
})().catch((e) => {
    console.error("Paritäts-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

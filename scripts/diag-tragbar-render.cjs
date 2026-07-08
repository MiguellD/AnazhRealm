// diag-tragbar-render.cjs — DER TRAGBAR-BEWEIS (Schöpfer „lade die Welt selbst, ohne nahes lod
// laub, das müsste nun tragbar sein"): rendert AnazhRealm auf dem ECHTEN swiftshader-Renderer in
// ZWEI Konfigurationen und misst die reale _loopRender-Wall-Clock-Zeit + screenshottet beide:
//   B (zuerst, SICHER) — OHNE nahes LOD-Laub: die schwere Baum-Geometrie (InstancedMesh mit
//       >VERT_HEAVY Verts/Instanz = die 76k/26k-Foundry-Bäume L0/L1) ist versteckt; Terrain +
//       Wasser + Himmel + die leichten Fern-Impostoren (6-Vert-Karten) bleiben → tragbar.
//   A (danach) — die VOLLE Welt (alle Baum-Geometrie sichtbar). Kann auf swiftshader schwer/fragil
//       sein — darum NACH B (B ist dann schon geschossen). Der Kontrast beweist: das nahe L0-Laub
//       IST die Last.
// Der LIGHT-Pfad (CLAUDE.md): Render beim Laden gestubbt, kleine Welt, dann 1-2 echte Frames.
//   node scripts/diag-tragbar-render.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.TRAGBAR_PORT || 4397);
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
    await page.setViewport({ width: 960, height: 600 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // PHASE 1 — Welt laden (Render gestubbt). Der Worker wird SYNC (voxelWorker=null, das Playtest-
    // Warmup-Muster) → jeder Tick baut den Ring-Chunk deterministisch im Tick (kein Async-Hunger unter
    // dem Stub) → eine grössere, stabile Welt. foliageRadius/activeRing auf MAX für die volle Deko.
    const loadInfo = await page.evaluate(async () => {
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
                // Worker aus → Ring baut sync im Tick (deterministisch, byte-identisch); volle Deko.
                try {
                    r.state.voxelWorker = null;
                } catch (_e) {}
                // Post-FX AUS (der Look-Shot-Pfad): die WebGPU-Post-Processing-Pipeline (Bloom/PMREM/
                // CSM) ist auf der Container-swiftshader fragil und crasht den Renderer UNABHÄNGIG von
                // der Geometrie. Aus → der bare Render überlebt → der GEOMETRIE-Kontrast (mit/ohne
                // Nah-Laub) wird die ehrliche Messgrösse. Auf echter GPU läuft die Post-FX normal.
                try {
                    r.state.postProcessingFailed = true;
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
                if (sz >= 25 && stableFor > 50) break;
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
        return { chunks: r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0 };
    });
    console.log("Welt geladen:", JSON.stringify(loadInfo), "Chunks");

    // UI ausblenden + Avatar verstecken.
    await page.evaluate(() => {
        const cv = document.querySelector("canvas");
        for (const el of Array.from(document.body.children))
            if (el !== cv && el.tagName !== "SCRIPT") el.style.display = "none";
        const r = window.anazhRealm;
        if (r && r.state && r.state.playerMesh) r.state.playerMesh.visible = false;
    });

    // Kamera auf einen LAND-Spot mit Wald ringsum, Augenhöhe, leicht nach unten/level in den Wald.
    const cam = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const pm = s.playerMesh;
        if (!pm || !s.camera) return { err: "no player/cam" };
        const th = (x, z) => (typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(x, z) : 0);
        const wl = (x, z) => (typeof r._waterLevelAt === "function" ? r._waterLevelAt(x, z) : -Infinity);
        // Einen MODERATEN, offenen Land-Spot suchen: nicht der höchste Gipfel (dort klebt der Blick an
        // einem Steilhang), sondern ein flacher Spot mit einer OFFENEN Sicht in EINE Richtung (das
        // Terrain fällt ab → eine Vista + der Nebel an der Kante). Kandidaten sammeln + den mit der
        // offensten Vorwärts-Sicht + moderater Steilheit wählen.
        let best = null;
        for (let rad = 12; rad <= 120; rad += 8) {
            for (let a = 0; a < 360; a += 20) {
                const x = pm.position.x + Math.cos((a * Math.PI) / 180) * rad;
                const z = pm.position.z + Math.sin((a * Math.PI) / 180) * rad;
                const g = th(x, z);
                if (!(g > wl(x, z) + 2) || g > 40) continue; // trocken + nicht auf dem Hochgipfel
                // Steilheit lokal (flacher Stand ist schöner)
                const slope = Math.abs(th(x + 3, z) - th(x - 3, z)) + Math.abs(th(x, z + 3) - th(x, z - 3));
                if (slope > 6) continue;
                // die offenste Blickrichtung: wo das Terrain 40 m voraus am tiefsten liegt (Vista)
                let bestYaw = 0,
                    lowest = Infinity;
                for (let ya = 0; ya < 360; ya += 30) {
                    const fx = x + Math.sin((ya * Math.PI) / 180) * 40;
                    const fz = z + Math.cos((ya * Math.PI) / 180) * 40;
                    const fg = th(fx, fz);
                    if (fg < lowest) {
                        lowest = fg;
                        bestYaw = (ya * Math.PI) / 180;
                    }
                }
                const openness = g - lowest; // wie stark fällt die Vorwärts-Sicht ab
                if (!best || openness > best.openness) best = { x, z, g, yaw: bestYaw, openness };
            }
        }
        const bx = best ? best.x : pm.position.x,
            bz = best ? best.z : pm.position.z;
        const gy = th(bx, bz);
        const eyeY = gy + 1.7;
        pm.position.set(bx, eyeY, bz);
        const cam = s.camera;
        // level-Blick, ganz leicht nach unten (Vista + Horizont + Nebel-Kante); yaw auf die offene Sicht.
        const yaw = best ? best.yaw : 0.6,
            pitch = (-3 * Math.PI) / 180;
        cam.position.set(bx, eyeY, bz);
        const dir = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: Math.cos(yaw) * Math.cos(pitch) };
        cam.lookAt(bx + dir.x * 50, eyeY + dir.y * 50, bz + dir.z * 50);
        cam.updateMatrixWorld(true);
        return {
            bx: +bx.toFixed(1),
            bz: +bz.toFixed(1),
            eyeY: +eyeY.toFixed(1),
            aboveWater: +(eyeY - wl(bx, bz)).toFixed(1),
            openness: best ? +best.openness.toFixed(1) : 0,
        };
    });
    console.log("Kamera:", JSON.stringify(cam));

    // Szene-Last messen. AnazhRealms Vegetation lebt in BatchedMesh (useBatchedArch) UND InstancedMesh
    // (schwere Bäume + Impostoren) — beide zählen.
    const sceneStat = async (label) =>
        await page.evaluate((label) => {
            const r = window.anazhRealm;
            const s = r.state;
            let tris = 0,
                batched = 0,
                batchTris = 0,
                inst = 0,
                plainMeshes = 0;
            s.scene.traverse((o) => {
                if (!o.visible) return;
                if (!(o.isMesh || o.isInstancedMesh || o.isBatchedMesh)) return;
                const g = o.geometry;
                if (!g || !g.attributes || !g.attributes.position) return;
                const vc = g.attributes.position.count;
                const idx = g.index ? g.index.count : vc;
                const perTris = idx / 3;
                const cnt = o.isInstancedMesh ? o.count : 1;
                const t = perTris * cnt;
                tris += t;
                if (o.isBatchedMesh) {
                    batched++;
                    batchTris += t;
                } else if (o.isInstancedMesh) inst += cnt;
                else plainMeshes++;
            });
            return {
                label,
                tris: Math.round(tris),
                batchedMeshes: batched,
                batchTris: Math.round(batchTris),
                instances: inst,
                plainMeshes,
            };
        }, label);

    // Einen echten Render messen + screenshotten. Voll crash-sicher (ein swiftshader-Tod beim
    // Render/Screenshot darf den Lauf nicht hängen lassen).
    const renderShot = async (file, label) => {
        let meta = { err: null, ms: NaN };
        try {
            meta = await page.evaluate(() => {
                const r = window.anazhRealm;
                const s = r.state;
                let err = null,
                    ms = 0;
                s.postProcessingFailed = true; // Post-FX bleibt aus (der bare Render, swiftshader-sicher)
                if (window.__origRender) {
                    r.state.renderer.render = window.__origRender;
                    try {
                        if (typeof r._loopRender === "function") r._loopRender(performance.now());
                        const t0 = performance.now();
                        if (typeof r._loopRender === "function") r._loopRender(performance.now());
                        else window.__origRender(s.scene, s.camera);
                        ms = performance.now() - t0;
                    } catch (e) {
                        err = String((e && e.message) || e);
                    }
                    r.state.renderer.render = function () {};
                } else err = "no origRender";
                return { err, ms: +ms.toFixed(1) };
            });
        } catch (e) {
            meta = { err: "RENDER-CRASH: " + (e && e.message ? e.message : e).toString().split("\n")[0], ms: NaN };
            console.log(`  ${label.padEnd(26)} ${meta.err}`);
            return meta;
        }
        await new Promise((res) => setTimeout(res, 300));
        try {
            await page.screenshot({ path: path.join(ART, file), fullPage: false });
            console.log(`  ${label.padEnd(26)} render ${String(meta.ms).padStart(7)} ms · ${meta.err ? "ERR " + meta.err : "OK"} → ${file} ✓`);
        } catch (e) {
            console.log(`  ${label.padEnd(26)} Screenshot FEHLGESCHLAGEN: ${(e && e.message ? e.message : e).toString().split("\n")[0]}`);
        }
        return meta;
    };

    console.log("\n=== KONFIG B — OHNE nahes LOD-Laub (alle Nah-Vegetation versteckt, Fern-Impostoren bleiben) ===");
    // „Nahes LOD-Laub" = die Nah-Vegetation (Baum-Geometrie + Blatt-Karten + Gras): jede
    // InstancedMesh, die NICHT ein Fern-Impostor ist (der Impostor trägt das `aImpX`-Attribut = die
    // 6-Vertex-Karte). So bleibt Terrain (kein InstancedMesh) + Wasser + Himmel + die leichten
    // Fern-Billboards → der tragbare Boden. Der ganze schwere Vegetations-Vertex-Berg fällt.
    const hid = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        let hidden = 0,
            hiddenTris = 0,
            impostorsKept = 0;
        s.scene.traverse((o) => {
            if (!o.visible) return;
            const g = o.geometry;
            if (!g || !g.attributes || !g.attributes.position) return;
            // Fern-Impostor (die 6-Vertex-Karte, aImpX) = das ferne Billboard → behalten.
            if (o.isInstancedMesh && g.attributes.aImpX) {
                impostorsKept += o.count;
                return;
            }
            // Nah-Vegetation lebt in BatchedMesh (leichte Blatt-Karten/Gras) UND InstancedMesh
            // (schwere Baum-Geometrie). Beide verstecken. Terrain/Wasser/Himmel sind plain Mesh → bleiben.
            if (o.isBatchedMesh || o.isInstancedMesh) {
                o.userData.__tragbarHidden = true;
                o.visible = false;
                hidden++;
                const idx = g.index ? g.index.count : g.attributes.position.count;
                const cnt = o.isInstancedMesh ? o.count : 1;
                hiddenTris += (idx / 3) * cnt;
            }
        });
        return { hidden, hiddenTris: Math.round(hiddenTris), impostorsKept };
    });
    console.log(
        `  versteckt: ${hid.hidden} Nah-Vegetations-InstancedMeshes (${(hid.hiddenTris / 1e6).toFixed(2)}M Tris) · Fern-Impostoren behalten: ${hid.impostorsKept}`
    );
    console.log("  Szene-B:", JSON.stringify(await sceneStat("B")));
    const B = await renderShot("tragbar-anazh-ohne-nahlaub.png", "B ohne Nah-Laub");

    console.log("\n=== KONFIG A — die VOLLE Welt (alle Vegetation sichtbar) ===");
    let A = { ms: NaN, err: "übersprungen/gecrasht" };
    try {
        await page.evaluate(() => {
            const r = window.anazhRealm;
            r.state.scene.traverse((o) => {
                if (o.userData && o.userData.__tragbarHidden) {
                    o.visible = true;
                    o.userData.__tragbarHidden = false;
                }
            });
        });
        console.log("  Szene-A:", JSON.stringify(await sceneStat("A")));
        A = await renderShot("tragbar-anazh-voll.png", "A volle Welt");
    } catch (e) {
        console.log(`  KONFIG A crashte den Renderer (das IST der Befund — die volle Nah-Vegetation ist NICHT tragbar auf swiftshader): ${(e && e.message ? e.message : e).toString().split("\n")[0]}`);
    }

    console.log("\n=== TRAGBAR-VERDIKT ===");
    console.log(`  B (ohne Nah-Laub): ${B.ms} ms/Frame · ${B.err ? "ERR " + B.err : "gerendert ✓"}`);
    console.log(`  A (volle Welt):    ${A.ms} ms/Frame · ${A.err ? "ERR " + A.err : "gerendert ✓"}`);
    if (Number.isFinite(A.ms) && Number.isFinite(B.ms) && B.ms > 0)
        console.log(`  → das nahe Laub kostet ${(A.ms / B.ms).toFixed(1)}× mehr Render-Zeit`);

    try {
        await browser.close();
    } catch (_e) {}
    await new Promise((r) => server.close(r));
    console.log("\nScreenshots: artifacts/tragbar-anazh-{ohne-nahlaub,voll}.png");
    process.exit(0);
})().catch((e) => {
    console.error("Tragbar-Render-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

// V18.116 — A4-MÜNDUNGS-SYNERGIE-MESSUNG (S-Befund 10.06.: „Übergang
// Wasser/See/Meer zu Fluss noch komisch, der See-/Meer-Shader noch nicht
// synergetisch, durch die Wellen oder so"). MISST die per-Vertex-Wahrheit der
// gebauten Wasser-Sheets an drei Stationen (Meer-Mündung · Fluss-Lauf · See):
//   aWave  = Ozean-Wellen-Anteil (treibt Gerstner-Amplitude + Crest-Gischt +
//            Ozean-Farbmix) — heute eine reine HÖHEN-Rampe um waterLevel.
//   fmag   = |aFlow| (Fluss-Abdeckung×Ausrichtung, V18.24-Taper).
// HYPOTHESE: Fluss-/See-Vertices nahe Meereshöhe tragen aWave≈1 → der Fluss
// wogt wie das offene Meer, der Übergang ist ein Höhen-Schalter statt einer
// Art-Rampe. exit 1, wenn Fluss-Kern-Vertices (fmag≥0.5) mit aWave>0.5 existieren.
//   node scripts/diag-mouth.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4385;
const root = path.resolve(__dirname, "..");
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
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
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
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Boot + Settle (diag-tour-Muster: Render gestubbt fürs Tempo).
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
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    // Stationen aus der Welt-Wahrheit.
    const spots = await page.evaluate(() => {
        const r = window.anazhRealm;
        const h = r.state.hydrosphere || {};
        const wl = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
        const out = { wl, stations: [] };
        const seaRiver = (h.rivers || []).find((rv) => rv.mouth === "sea" && rv.points && rv.points.length > 3);
        if (seaRiver) {
            const p = seaRiver.points;
            out.riverPath = p.map((q) => ({ x: q.x, z: q.z }));
            const m = p[p.length - 1];
            out.stations.push({ name: "mouth", x: m.x, z: m.z });
            const up = p[Math.max(0, p.length - 9)];
            out.stations.push({ name: "upriver", x: up.x, z: up.z });
        }
        const lakes = (h.lakes || []).slice().sort((a, b) => (b.cells || 0) - (a.cells || 0));
        if (lakes[0] && lakes[0].bbox) {
            const b = lakes[0].bbox;
            out.lakeLevel = lakes[0].level;
            out.lakeBBox = b;
            out.stations.push({ name: "lake", x: (b.minX + b.maxX) / 2, z: (b.minZ + b.maxZ) / 2 });
        }
        return out;
    });
    console.log(
        `waterLevel=${spots.wl.toFixed(2)}  lakeLevel=${spots.lakeLevel !== undefined ? spots.lakeLevel.toFixed(2) : "—"}` +
            `  Stationen: ${spots.stations.map((s) => `${s.name}@(${s.x | 0},${s.z | 0})`).join("  ")}`
    );

    let exitBad = false;
    for (const st of spots.stations) {
        // hinreisen + nachstreamen.
        await page.evaluate(async (spot) => {
            const r = window.anazhRealm;
            const s = r.state;
            const groundY = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(spot.x, spot.z) : 20;
            const body = s.playerBody;
            if (body && s.tmpTransform && typeof Ammo !== "undefined") {
                s.tmpTransform.setIdentity();
                s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, spot.x, Math.max(groundY, s.waterLevel || 0) + 3, spot.z));
                body.setWorldTransform(s.tmpTransform);
                body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
                body.activate(true);
            }
            const t0 = performance.now();
            let lastSize = -1,
                stable = 0;
            while (performance.now() - t0 < 60000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (stable > 80) break;
                await new Promise((res) => setTimeout(res, 3));
            }
        }, st);

        // Sheet-Vertices im Umkreis klassifizieren.
        const m = await page.evaluate(
            (spot, wl, lakeBBox, riverPath) => {
                const r = window.anazhRealm;
                const iso = r.state.voxelChunkWaterIso;
                if (!iso) return { err: "kein voxelChunkWaterIso" };
                const R = 120;
                let total = 0;
                const cls = {
                    riverCore: { n: 0, waveHi: 0, waveSum: 0 }, // fmag ≥ 0.5
                    riverEdge: { n: 0, waveHi: 0, waveSum: 0 }, // 0.1 ≤ fmag < 0.5
                    still: { n: 0, waveHi: 0, waveSum: 0 }, // fmag < 0.1 (See/Meer)
                };
                const inLake = (x, z) =>
                    lakeBBox && x >= lakeBBox.minX && x <= lakeBBox.maxX && z >= lakeBBox.minZ && z <= lakeBBox.maxZ;
                let lakeN = 0,
                    lakeWaveHi = 0,
                    lakeWaveSum = 0;
                const prof = [];
                for (const mesh of iso.values()) {
                    if (!mesh || !mesh.geometry) continue;
                    const g = mesh.geometry;
                    const pos = g.getAttribute("position");
                    const aw = g.getAttribute("aWave");
                    const af = g.getAttribute("aFlow");
                    if (!pos || !aw || !af) continue;
                    for (let i = 0; i < pos.count; i++) {
                        const x = pos.getX(i);
                        const z = pos.getZ(i);
                        const dx = x - spot.x;
                        const dz = z - spot.z;
                        if (dx * dx + dz * dz > R * R) continue;
                        total++;
                        const wave = aw.getX(i);
                        const fmag = Math.hypot(af.getX(i), af.getY(i));
                        const c = fmag >= 0.5 ? cls.riverCore : fmag >= 0.1 ? cls.riverEdge : cls.still;
                        c.n++;
                        c.waveSum += wave;
                        if (wave > 0.5) c.waveHi++;
                        if (spot.name === "lake" && inLake(x, z) && fmag < 0.1) {
                            lakeN++;
                            lakeWaveSum += wave;
                            if (wave > 0.3) lakeWaveHi++;
                        }
                    }
                }
                // Profil entlang des Fluss-Pfads (nur an der Mündungs-Station).
                if (spot.name === "mouth" && riverPath && riverPath.length) {
                    const pts = riverPath.slice(-12);
                    for (let pi = 0; pi < pts.length; pi++) {
                        const q = pts[pi];
                        let best = null,
                            bd = 64;
                        for (const mesh of iso.values()) {
                            if (!mesh || !mesh.geometry) continue;
                            const g = mesh.geometry;
                            const pos = g.getAttribute("position");
                            const aw = g.getAttribute("aWave");
                            const af = g.getAttribute("aFlow");
                            if (!pos || !aw || !af) continue;
                            for (let i = 0; i < pos.count; i++) {
                                const dx = pos.getX(i) - q.x;
                                const dz = pos.getZ(i) - q.z;
                                const d2 = dx * dx + dz * dz;
                                if (d2 < bd) {
                                    bd = d2;
                                    best = {
                                        y: pos.getY(i),
                                        wave: aw.getX(i),
                                        fmag: Math.hypot(af.getX(i), af.getY(i)),
                                    };
                                }
                            }
                        }
                        if (best)
                            prof.push({
                                idxFromMouth: pts.length - 1 - pi,
                                relY: +(best.y - wl).toFixed(2),
                                fmag: +best.fmag.toFixed(2),
                                aWave: +best.wave.toFixed(2),
                            });
                    }
                }
                const pack = (c) => ({
                    n: c.n,
                    hi: c.waveHi,
                    avg: c.n ? +(c.waveSum / c.n).toFixed(3) : 0,
                });
                return {
                    total,
                    riverCore: pack(cls.riverCore),
                    riverEdge: pack(cls.riverEdge),
                    still: pack(cls.still),
                    lake:
                        spot.name === "lake"
                            ? { n: lakeN, hi: lakeWaveHi, avg: lakeN ? +(lakeWaveSum / lakeN).toFixed(3) : 0 }
                            : null,
                    prof,
                };
            },
            st,
            spots.wl,
            spots.lakeBBox || null,
            spots.riverPath || null
        );

        if (m.err) {
            console.log(`${st.name}: FEHLER ${m.err}`);
            exitBad = true;
            continue;
        }
        console.log(
            `\n=== ${st.name} (${m.total} Vertices in 120 m) ===\n` +
                `  Fluss-KERN  (fmag≥0.5): n=${m.riverCore.n}  aWave>0.5: ${m.riverCore.hi}  Ø=${m.riverCore.avg}\n` +
                `  Fluss-RAND  (0.1–0.5):  n=${m.riverEdge.n}  aWave>0.5: ${m.riverEdge.hi}  Ø=${m.riverEdge.avg}\n` +
                `  STILL (See/Meer):       n=${m.still.n}  aWave>0.5: ${m.still.hi}  Ø=${m.still.avg}`
        );
        if (m.lake)
            console.log(`  SEE-Fläche (im bbox, still): n=${m.lake.n}  aWave>0.3: ${m.lake.hi}  Ø=${m.lake.avg}`);
        if (m.prof && m.prof.length) {
            console.log("  Profil (Mündung → flussauf):  idx | y−wl | fmag | aWave");
            for (const p of m.prof)
                console.log(
                    `    ${String(p.idxFromMouth).padStart(3)} | ${String(p.relY).padStart(6)} | ${String(p.fmag).padStart(4)} | ${p.aWave}`
                );
        }
        // Das Symptom: Fluss-Kern, der wie der Ozean wogt.
        if (
            (st.name === "mouth" || st.name === "upriver") &&
            m.riverCore.n > 10 &&
            m.riverCore.hi / m.riverCore.n > 0.3
        ) {
            console.log(
                `  → SYMPTOM: ${((100 * m.riverCore.hi) / m.riverCore.n).toFixed(0)} % des Fluss-Kerns wogt wie Ozean (aWave>0.5)`
            );
            exitBad = true;
        }

        // DROHNEN-SHOT an der Mündung (das eigene Auge — Mündungen sind flach,
        // die Tour-Ufer-Suche findet keinen erhöhten Stand → Kamera direkt).
        if (st.name === "mouth") {
            fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
            for (const [tod, label] of [
                [0.5, "mittag"],
                [0.8, "abend"],
            ]) {
                await page.evaluate(
                    (spot, t) => {
                        const r = window.anazhRealm;
                        const s = r.state;
                        // HUD weg + klares Wetter + Spieler ÜBER Wasser (sonst
                        // playerEyesUnderwater-Fog → das Bild ist blau).
                        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
                            el.style.display = "none";
                        document.body.classList.add("hud-hidden");
                        s.weather = "sunny";
                        const camY = (s.waterLevel || 0) + 24;
                        const body = s.playerBody;
                        if (body && s.tmpTransform && typeof Ammo !== "undefined") {
                            // HINTER die Kamera (sonst hängt der eigene Avatar
                            // als Riesen-Säule vor der Linse) + über Wasser
                            // (sonst playerEyesUnderwater-Fog).
                            s.tmpTransform.setIdentity();
                            s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, spot.x - 30, camY + 6, spot.z + 110));
                            body.setWorldTransform(s.tmpTransform);
                            body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
                            body.activate(true);
                        }
                        try {
                            r._gameLoopTick(performance.now());
                        } catch (_e) {}
                        s.timeOfDay = t;
                        if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                        const cam = s.camera;
                        cam.position.set(spot.x - 30, camY, spot.z + 42);
                        cam.lookAt(spot.x, s.waterLevel || 0, spot.z - 20);
                        cam.updateMatrixWorld(true);
                        if (window.__origRender) {
                            s.renderer.render = window.__origRender;
                            s.postProcessingFailed = true;
                            try {
                                r._loopRender(performance.now());
                                r._loopRender(performance.now());
                                r._loopRender(performance.now());
                            } catch (_e) {}
                            s.renderer.render = function () {};
                        }
                    },
                    st,
                    tod
                );
                await new Promise((res) => setTimeout(res, 300));
                await page.screenshot({ path: path.join(root, "artifacts", `mouth-drone-${label}.png`) });
                console.log(`  Shot: artifacts/mouth-drone-${label}.png`);
            }
        }
    }

    await browser.close();
    server.close();
    console.log(exitBad ? "\nDIAG: SYMPTOM REPRODUZIERT (exit 1)" : "\nDIAG: sauber (exit 0)");
    process.exit(exitBad ? 1 : 0);
})();

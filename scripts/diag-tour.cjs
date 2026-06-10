// V18.114 — DIE SPIEL-TOUR (Schöpfer: „lerne dich im spiel zu steuern und prüfe
// selbst, wie ein fischer"): das Selbst-Erkunden als Werkzeug. Findet markante
// ORTE aus der WELT-WAHRHEIT (Seeufer · Fluss-Mitte · MEER-MÜNDUNG · Wasserfall ·
// Spawn), STEUERT den Spieler-Body dorthin (V13.0-Disziplin: setWorldTransform +
// activate), lässt die Welt dort SETTLED nachstreamen, schaut auf AUGENHÖHE aufs
// Ziel und schießt ECHTE Frames — Mittag + Abend an den Wasser-Orten. Die Bilder
// liest mein Auge (swiftshader ist treu); danach wird geheilt + die Tour wiederholt.
//   node scripts/diag-tour.cjs            → alle Orte
//   node scripts/diag-tour.cjs mouth      → nur ein Ort (mouth|lake|river|waterfall|spawn)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4384;
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const ONLY = process.argv[2] || null;
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
    await page.setViewport({ width: 1600, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Boot + erste Settle-Runde am Spawn (Render gestubbt fürs Tempo).
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
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        for (const id of ["dialogue-box", "intro-overlay", "onboarding"]) {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
        }
        document.body.classList.add("hud-hidden");
    });

    // Die ORTE aus der Welt-Wahrheit (deterministisch, kein Raten).
    const spots = await page.evaluate(() => {
        const r = window.anazhRealm;
        const h = r.state.hydrosphere || {};
        const wl = typeof r.state.waterLevel === "number" ? r.state.waterLevel : 0;
        const out = [];
        const pm = r.state.playerMesh.position;
        out.push({ name: "spawn", x: pm.x, z: pm.z, lookX: pm.x, lookZ: pm.z + 40, lookY: null });
        // Seeufer: größter See — Stand am bbox-Rand, Blick über die Mitte.
        const lakes = (h.lakes || []).slice().sort((a, b) => (b.cells || 0) - (a.cells || 0));
        if (lakes[0] && lakes[0].bbox) {
            const b = lakes[0].bbox;
            const cx = (b.minX + b.maxX) / 2;
            const cz = (b.minZ + b.maxZ) / 2;
            out.push({ name: "lake", x: b.minX - 8, z: cz, lookX: cx, lookZ: cz, lookY: lakes[0].level });
        }
        // V18.120 — B5-TAUCH-BLICK: im größten See UNTER Wasser, Blick schräg
        // zur DECKE (vorher fehlte sie: BackSide+Top-Cull = Himmel statt Spiegel).
        if (lakes[0] && lakes[0].bbox) {
            const b = lakes[0].bbox;
            const cx = (b.minX + b.maxX) / 2;
            const cz = (b.minZ + b.maxZ) / 2;
            out.push({ name: "dive", x: cx, z: cz, lookX: cx + 26, lookZ: cz + 8, lookY: lakes[0].level, dive: true });
        }
        // Fluss-Mitte: der längste Fluss.
        const rivers = (h.rivers || []).slice().sort((a, b) => (b.points || []).length - (a.points || []).length);
        if (rivers[0] && rivers[0].points && rivers[0].points.length > 4) {
            const mid = rivers[0].points[Math.floor(rivers[0].points.length / 2)];
            out.push({ name: "river", x: mid.x - 14, z: mid.z, lookX: mid.x + 10, lookZ: mid.z, lookY: mid.voxelY });
        }
        // MEER-MÜNDUNG (der S-Schmerz „See/Meer↔Fluss komisch"): ein Fluss mit mouth=sea.
        const seaRiver = (h.rivers || []).find((rv) => rv.mouth === "sea" && rv.points && rv.points.length > 3);
        if (seaRiver) {
            const p = seaRiver.points;
            const m = p[p.length - 1];
            const back = p[Math.max(0, p.length - 5)];
            out.push({ name: "mouth", x: back.x, z: back.z, lookX: m.x, lookZ: m.z, lookY: wl });
        }
        // Wasserfall: steilster OBERIRDISCHER.
        const open = (h.waterfalls || []).filter((w) => (w.bottomY || 0) > wl + 1);
        const wfs = (open.length ? open : h.waterfalls || []).slice();
        wfs.sort((a, b) => (b.topY || 0) - (b.bottomY || 0) - ((a.topY || 0) - (a.bottomY || 0)));
        if (wfs[0]) {
            const w = wfs[0];
            const mid = ((w.topY || 10) + (w.bottomY || 0)) / 2;
            // seitlich versetzt stehen, auf die Fall-Mitte schauen.
            out.push({ name: "waterfall", x: w.x + 22, z: w.z + 14, lookX: w.x, lookZ: w.z, lookY: mid });
        }
        return out;
    });
    console.log("TOUR-ORTE:", spots.map((s) => `${s.name}@(${s.x | 0},${s.z | 0})`).join("  "));

    // Pro Ort: hinreisen (Body), nachstreamen, schauen, echte Frames, Shot.
    const visit = async (spot, file, timeOfDay) => {
        const meta = await page.evaluate(
            async (spot, tod) => {
                const r = window.anazhRealm;
                const s = r.state;
                // V2 — LANDFEST ans Ufer treten (Tour-Lehre: der rohe Punkt fiel in
                // See/Meer/Schlucht → Auge unter Wasser/im Fels): vom Wunsch-Punkt
                // RADIAL WEG vom Blickziel schreiten, bis der Boden ÜBER der
                // Wasserlinie liegt (wie ein Spieler, der ans Ufer tritt).
                // V3 — hoch genug ÜBER dem ZIEL-Spiegel stehen (Seen liegen über dem
                // Meer → gegen spot.lookY messen, nicht wl), sonst klebt das Auge auf
                // der Wasserlinie; in 8 RICHTUNGEN suchen (ein Canyon hat nur eine
                // brauchbare Seite), die beste = nah + hoch genug.
                const wl = typeof s.waterLevel === "number" ? s.waterLevel : 0;
                if (!spot.dive) {
                    const ref = spot.lookY !== null && spot.lookY !== undefined ? spot.lookY : wl;
                    let bx = spot.x;
                    let bz = spot.z;
                    let found = false;
                    outer: for (let step = 10; step <= 110; step += 8) {
                        for (let a = 0; a < 8; a++) {
                            const ang = (a / 8) * Math.PI * 2;
                            const tx = spot.lookX + Math.cos(ang) * step;
                            const tz = spot.lookZ + Math.sin(ang) * step;
                            const gy = r.getTerrainHeightAt(tx, tz);
                            if (Number.isFinite(gy) && gy > ref + 2.5 && gy < ref + 26) {
                                bx = tx;
                                bz = tz;
                                found = true;
                                break outer;
                            }
                        }
                    }
                    if (found) {
                        spot.x = bx;
                        spot.z = bz;
                    }
                }
                const groundY = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(spot.x, spot.z) : 20;
                const body = s.playerBody;
                if (body && s.tmpTransform && typeof Ammo !== "undefined") {
                    s.tmpTransform.setIdentity();
                    s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, spot.x, groundY + 2.2, spot.z));
                    body.setWorldTransform(s.tmpTransform);
                    body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
                    body.activate(true);
                }
                // nachstreamen bis stabil (der Ring folgt dem Spieler).
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
                    if (stable > 50) break;
                    await new Promise((res) => setTimeout(res, 4));
                }
                try {
                    r._drainPendingWaterIso && r._drainPendingWaterIso();
                    r._drainPendingGrass && r._drainPendingGrass();
                } catch (_e) {}
                if (tod !== null) {
                    s.timeOfDay = tod;
                    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                }
                // Augenhöhe, Blick aufs Ziel (Wasser-Spiegel/Fall-Mitte, sonst leicht runter).
                const pm = s.playerMesh.position;
                const cam = s.camera;
                if (spot.dive) {
                    // UNTER den Spiegel: Body tief setzen, 2 Ticks (das Flag +
                    // der Side-Sync greifen), Auge unter Wasser, Blick zur Decke.
                    const lv = spot.lookY !== null && spot.lookY !== undefined ? spot.lookY : wl;
                    const body = s.playerBody;
                    if (body && s.tmpTransform && typeof Ammo !== "undefined") {
                        s.tmpTransform.setIdentity();
                        s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, spot.x, lv - 3.2, spot.z));
                        body.setWorldTransform(s.tmpTransform);
                        body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
                        body.activate(true);
                    }
                    try {
                        r._gameLoopTick(performance.now());
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
                    cam.position.set(spot.x, lv - 1.6, spot.z);
                    cam.lookAt(spot.lookX, lv + 5, spot.lookZ);
                    cam.updateMatrixWorld(true);
                } else {
                    const ey = pm.y + 2.2; // leicht erhöht — Ufer + Wasser + Übergang im Bild
                    cam.position.set(pm.x, ey, pm.z);
                    const ly = spot.lookY !== null && spot.lookY !== undefined ? spot.lookY : ey - 6;
                    cam.lookAt(spot.lookX, ly, spot.lookZ);
                    cam.updateMatrixWorld(true);
                }
                let err = null;
                if (window.__origRender) {
                    s.renderer.render = window.__origRender;
                    s.postProcessingFailed = true;
                    try {
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                        r._loopRender(performance.now());
                    } catch (e) {
                        err = String((e && e.message) || e).split("\n")[0];
                    }
                    s.renderer.render = function () {};
                }
                return { err, px: +pm.x.toFixed(0), py: +pm.y.toFixed(1), pz: +pm.z.toFixed(0) };
            },
            spot,
            timeOfDay
        );
        await new Promise((res) => setTimeout(res, 300));
        await page.screenshot({ path: path.join(ART, file), fullPage: false });
        console.log(`${file.padEnd(30)} @(${meta.px},${meta.py},${meta.pz}) ${meta.err ? "⚠ " + meta.err : "✓"}`);
    };

    fs.mkdirSync(ART, { recursive: true });
    for (const spot of spots) {
        if (ONLY && spot.name !== ONLY) continue;
        await visit(spot, `tour-${spot.name}-mittag.png`, 0.5);
        // an den Wasser-Orten auch das Schräglicht (Shader/Glitzer/Übergänge).
        if (spot.name === "mouth" || spot.name === "lake" || spot.name === "waterfall") {
            await visit(spot, `tour-${spot.name}-abend.png`, 0.8);
        }
    }
    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\nTOUR fertig: artifacts/tour-*.png — mit dem Auge lesen, heilen, wiederholen.\n");
    process.exit(0);
})();

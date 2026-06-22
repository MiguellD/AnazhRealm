// FEEL-LINSE (Determinismus-Bogen, Profi-Bewegungsgefühl). Beweist mit einer ZAHL, dass die
// zwei erbetenen Profi-Mechanismen WIRKEN (das FEEL selbst urteilt der Schöpfer-Browser):
//   (A) BREMS-TRÄGHEIT: nach dem Loslassen gleitet der Körper noch ein Stück (Masse/Momentum),
//       statt trägheitslos zu stoppen — aber nicht floaty (begrenzter Schlitter).
//   (B) VIEW-HEIGHT-SMOOTHING: über Buckel/Stufen ist die AUGEN-Höhe GLATTER als die Fuß-Höhe
//       (der Körper „federt" die Höhe ab, Source/Quake-Stair-Smoothing) — und bleibt gebunden
//       (kein Gummiband, kein Abkoppeln).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4365,
    root = path.resolve(__dirname, "..");
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
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 300000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        let stubbed = false;
        const startW = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - startW < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                if (r.state.voxelWorker) {
                    try {
                        r.state.voxelWorker.terminate();
                    } catch (_e) {}
                    r.state.voxelWorker = null;
                }
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

        const r = window.anazhRealm,
            s = r.state;
        if (!r._gameLoopTick || !s.playerMesh || !s.playerBody || !s.camera) return { error: "Welt nicht bereit" };
        const footDrop = (window.anazhRealm.constructor || r.constructor).PLAYER_FOOT_OFFSET;
        const maxLag = (window.anazhRealm.constructor || r.constructor).CAMERA_STEP_MAX_LAG;

        let simT = performance.now();
        const DT = 1000 / 60;
        const tick = () => {
            simT += DT;
            r._gameLoopTick(simT);
        };
        const clearKeys = () => {
            s.keys = {};
        };
        const zeroVel = () => {
            if (s.playerBody) s.playerBody.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
            s._fieldVy = 0;
        };
        r.setFieldPhysics(true);
        s.cameraMode = "first";

        // flacher, über-Wasser-Spot
        let spot = null,
            bestNy = -1;
        for (let i = 0; i < 300; i++) {
            const x = ((i * 53) % 80) - 40;
            const z = ((i * 31) % 80) - 40;
            const h = r.getTerrainHeightAt(x, z);
            if (!Number.isFinite(h) || !r._isAboveWaterAt(x, z)) continue;
            const g = r._fieldGradient(x, h, z, {});
            if (g.y > bestNy) {
                bestNy = g.y;
                spot = { x, z, h };
            }
        }
        if (!spot) spot = { x: 0, z: 0, h: r.getTerrainHeightAt(0, 0) };

        // ===== (A) BREMS-TRÄGHEIT — bis Topspeed laufen, loslassen, Schlitter messen =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 1.5, spot.z);
        zeroVel();
        s.yaw = 0; // +Z
        for (let i = 0; i < 50; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        s.keys["w"] = true;
        for (let i = 0; i < 55; i++) tick(); // auf Topspeed bringen
        const relPos = { x: s.playerMesh.position.x, z: s.playerMesh.position.z };
        clearKeys(); // LOSLASSEN
        let stopTick = -1;
        for (let i = 0; i < 60; i++) {
            tick();
            const v = s.playerBody.getLinearVelocity();
            const sp = Math.sqrt(v.x() * v.x() + v.z() * v.z());
            if (stopTick < 0 && sp < 0.15) stopTick = i;
        }
        const dxs = s.playerMesh.position.x - relPos.x;
        const dzs = s.playerMesh.position.z - relPos.z;
        const slide = Math.sqrt(dxs * dxs + dzs * dzs);
        const stopMs = stopTick >= 0 ? Math.round((stopTick + 1) * (1000 / 60)) : -1;

        // ===== (B) VIEW-HEIGHT-SMOOTHING — über Buckel: Auge glatter als Füße =====
        // 3 FILL-Buckel (~0.45 m) in die Bahn → die Füße snappen drüber, das Auge glättet.
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 1.5, spot.z);
        zeroVel();
        for (let i = 0; i < 50; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        const baseFeet = s.playerMesh.position.y - footDrop;
        if (!s.worldMeta.voxelEdits) s.worldMeta.voxelEdits = [];
        const editN = s.worldMeta.voxelEdits.length;
        // GENTLE, breite Buckel (~0.2 m Anstieg über ~4 m): der Läufer bleibt GEERDET
        // (GROUND_SNAP hält ihn bergab) → reiner Stufen-Smoothing-Test, KEINE Mini-Landungen
        // (die mischten sonst Dips in die Glättungs-Messung; die Landung prüft (C) separat).
        for (let b = 0; b < 4; b++) {
            s.worldMeta.voxelEdits.push({
                x: spot.x,
                y: baseFeet - 1.8,
                z: spot.z + 2 + b * 2.0,
                r: 2.0,
                mode: "fill",
                strength: 220,
            });
        }
        s.keys["w"] = true;
        let feetVar = 0,
            eyeVar = 0,
            maxEyeLag = 0,
            prevFeet = null,
            prevEye = null,
            samples = 0;
        for (let i = 0; i < 140; i++) {
            tick();
            const feetTarget = s.playerMesh.position.y + 1.6; // starres Ziel
            const eye = s.camera.position.y; // geglättet
            if (prevFeet !== null) {
                feetVar += Math.abs(feetTarget - prevFeet);
                eyeVar += Math.abs(eye - prevEye);
                samples++;
            }
            // wie weit hängt das Auge unter dem starren Ziel (am Boden) — muss gebunden sein
            if (!s.isInAir) maxEyeLag = Math.max(maxEyeLag, feetTarget - eye);
            prevFeet = feetTarget;
            prevEye = eye;
        }
        clearKeys();
        s.worldMeta.voxelEdits.length = editN;
        const smoothRatio = feetVar > 1e-6 ? eyeVar / feetVar : 1;

        // ===== (C) LANDUNGS-ABSORPTION — aus der Höhe fallen, Auge federt ein + zurück =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 8, spot.z); // hoher Fall → klarer Aufprall
        zeroVel();
        s._landDip = 0;
        s._landImpactPending = 0;
        let dipDepth = 0,
            landed = false,
            recovered = 0,
            minVy = 0,
            minStateDip = 0;
        for (let i = 0; i < 120; i++) {
            tick();
            if (typeof s._fieldVy === "number" && s._fieldVy < minVy) minVy = s._fieldVy;
            if (typeof s._landDip === "number" && s._landDip < minStateDip) minStateDip = s._landDip;
            const rigidEye = s.playerMesh.position.y + 1.6;
            const dipNow = s.camera.position.y - rigidEye; // < 0 = eingefedert
            if (!s.isInAir) {
                landed = true;
                if (dipNow < dipDepth) dipDepth = dipNow; // tiefster Einfeder-Punkt
                recovered = dipNow; // letzter Wert → sollte zur Ruhe (~0)
            }
        }

        return {
            slide: { dist: +slide.toFixed(3), stopMs },
            smooth: {
                feetVar: +feetVar.toFixed(3),
                eyeVar: +eyeVar.toFixed(3),
                ratio: +smoothRatio.toFixed(3),
                maxEyeLag: +maxEyeLag.toFixed(3),
                maxLagConst: maxLag,
                samples,
            },
            land: {
                landed,
                dipDepth: +dipDepth.toFixed(3),
                recovered: +recovered.toFixed(3),
                minVy: +minVy.toFixed(2),
                minStateDip: +minStateDip.toFixed(3),
            },
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    let pass = true;
    const ok = (cond, label) => {
        console.log(`  ${cond ? "✅" : "❌"} ${label}`);
        if (!cond) pass = false;
    };
    console.log("\n===== FEEL-VERIFIKATION (Profi-Bewegung, Feld-Physik) =====\n");
    console.log(`  (A) BREMS-TRÄGHEIT: Schlitter ${out.slide.dist} m · Stopp nach ${out.slide.stopMs} ms`);
    ok(
        out.slide.dist > 0.2 && out.slide.dist < 2.0,
        "nach dem Loslassen gleitet der Körper spürbar (0,2–2 m) — Masse, nicht trägheitslos"
    );
    console.log(
        `  (B) VIEW-SMOOTHING: feetVar ${out.smooth.feetVar} · eyeVar ${out.smooth.eyeVar} · ratio ${out.smooth.ratio} · maxEyeLag ${out.smooth.maxEyeLag} (≤ ${out.smooth.maxLagConst})`
    );
    ok(out.smooth.feetVar > 0.3, "die Füße wechseln messbar die Höhe über die Buckel (Test-Vorbedingung)");
    ok(out.smooth.ratio < 0.85, "die AUGEN-Höhe ist GLATTER als die Fuß-Höhe (der Körper federt die Höhe ab)");
    ok(
        out.smooth.maxEyeLag <= out.smooth.maxLagConst + 0.12,
        "die Augen-Glättung bleibt gebunden (kein Gummiband/Abkoppeln)"
    );
    console.log(
        `  (C) LANDUNG: gelandet ${out.land.landed} · minVy ${out.land.minVy} · stateDip ${out.land.minStateDip} · Einfeder(Kamera) ${out.land.dipDepth} m · zurück bei ${out.land.recovered} m`
    );
    ok(
        out.land.landed && out.land.dipDepth < -0.05,
        "beim Aufkommen federt das Auge spürbar ein (View-Punch, der Körper fängt den Stoß)"
    );
    ok(Math.abs(out.land.recovered) < 0.03, "und federt danach sauber zur Ruhe zurück (kein hängender Versatz)");
    console.log(
        `\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN — die Profi-Mechanik wirkt; das GEFÜHL urteilt der Schöpfer-Browser" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`
    );
    console.log("===========================================================\n");
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-walk-inertia.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

// EDGE-CASE-LINSE (Determinismus-Bogen) — die zwei Schöpfer-Befunde am Rand, gemessen + gefixt:
//   (A) ANTI-CLIP: ein TIEF im Terrain steckender Spieler wird auf die Oberkante geholt — er
//       kann NIE unter der Welt feststecken (das Sicherheitsnetz, das sonst die BVH war).
//   (B) STEILE WAND: in steiles Terrain laufen → der Spieler bleibt AUF/an der Oberfläche,
//       clippt NICHT durch den Boden auf eine Höhlen-Schicht (der „steiler Berg"-Befund).
//   (C) KAMM/KLIPPE: über eine Kante laufen → der Spieler hebt natürlich ab (kein Kleben).
//   (D) KEIN LANDE-MAGNET: im Fall zieht KEIN Sog den Spieler die letzten cm an (Δy/Frame
//       bleibt schwerkraft-konform, kein 0,4-m-Teleport nach unten).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4366,
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
        if (!r._gameLoopTick || !s.playerMesh || !s.playerVel) return { error: "Welt nicht bereit" };
        const footDrop = (window.anazhRealm.constructor || r.constructor).PLAYER_FOOT_OFFSET;
        let simT = performance.now();
        const tick = () => {
            simT += 1000 / 60;
            r._gameLoopTick(simT);
        };
        const clearKeys = () => {
            s.keys = {};
        };
        const zeroVel = () => {
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
            s._fieldVy = 0;
        };
        r.setFieldPhysics(true);

        // flacher Spot
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

        // ===== (A) ANTI-CLIP — Spieler 3 m TIEF im Terrain platzieren, erholt er sich? =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h - 3, spot.z); // tief im Soliden
        zeroVel();
        s._fieldWasGrounded = false;
        for (let i = 0; i < 60; i++) tick();
        const surfA = r.getTerrainHeightAt(spot.x, spot.z);
        const feetA = s.playerMesh.position.y - footDrop;
        const recovered = feetA >= surfA - 0.4; // Füße auf/über der Oberfläche (nicht darunter)
        const notFar = Math.abs(s.playerMesh.position.y - (surfA + footDrop)) < 1.0; // nicht auf einer Höhle weit weg

        // ===== (B) STEILE WAND — in steiles Terrain laufen, kein Clip durch den Boden =====
        // einen steilen Spot finden (Gradient-Normale niedrig = steile Wand), davor stellen,
        // in den Hang HINEIN laufen (uphill). Tiefster Clip = wie weit die Füße je unter die
        // lokale Oberfläche fallen.
        let steep = null,
            lowNy = 1;
        for (let i = 0; i < 800; i++) {
            const x = ((i * 67) % 180) - 90;
            const z = ((i * 41) % 180) - 90;
            const h = r.getTerrainHeightAt(x, z);
            if (!Number.isFinite(h) || !r._isAboveWaterAt(x, z)) continue;
            const g = r._fieldGradient(x, h, z, {});
            if (g.y < lowNy && g.y > 0.2) {
                lowNy = g.y;
                const up = Math.hypot(g.x, g.z) || 1;
                steep = { x, z, h, yaw: Math.atan2(g.x / up, g.z / up), ny: +g.y.toFixed(3) };
            }
        }
        let maxBuried = 0,
            steepMinY = 0,
            startH = 0;
        if (steep) {
            clearKeys();
            s.playerMesh.position.set(steep.x, steep.h + 1.0, steep.z);
            zeroVel();
            s.yaw = steep.yaw; // in die Wand hinein
            for (let i = 0; i < 40; i++) {
                tick();
                if (s._groundedCache) zeroVel();
            }
            steepMinY = s.playerMesh.position.y;
            startH = s.playerMesh.position.y;
            s.keys["w"] = true;
            for (let i = 0; i < 160; i++) {
                tick();
                const pm = s.playerMesh.position;
                // ECHTES Clipping = Füße IM Soliden (nicht getTerrainHeightAt, das am Überhang
                // die Wand-Oberkante meldet und einen Stand-am-Wandfuß fälschlich als „clip" zählt).
                const feet = pm.y - footDrop;
                if (r._fieldSolid(pm.x, feet + 0.1, pm.z, null)) {
                    let depth = 0.1;
                    for (let d = 0.35; d <= 3; d += 0.25) {
                        if (!r._fieldSolid(pm.x, feet + d, pm.z, null)) break;
                        depth = d;
                    }
                    if (depth > maxBuried) maxBuried = depth;
                }
                steepMinY = Math.min(steepMinY, pm.y);
            }
            clearKeys();
        }

        // ===== (C) KLIPPE/KAMM — über eine Kante laufen, hebt der Spieler ab? =====
        // eine FILL-Plattform mit scharfer Kante bauen, der Spieler läuft drüber hinaus.
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 1.5, spot.z);
        zeroVel();
        if (!s.worldMeta.voxelEdits) s.worldMeta.voxelEdits = [];
        const editN = s.worldMeta.voxelEdits.length;
        // eine erhöhte Kante: FILL-Block, dahinter (+Z) freier Fall (kein Fill) → scharfe Klippe
        for (let d = 0; d < 5; d++) {
            s.worldMeta.voxelEdits.push({
                x: spot.x + (d - 2) * 1.4,
                y: spot.h + 1.0,
                z: spot.z,
                r: 2.2,
                mode: "fill",
                strength: 200,
            });
        }
        s.yaw = 0; // +Z, über die Kante
        for (let i = 0; i < 50; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        s.keys["w"] = true;
        let sawAirAtEdge = false;
        for (let i = 0; i < 70; i++) {
            tick();
            if (s.isInAir) sawAirAtEdge = true;
        }
        clearKeys();
        s.worldMeta.voxelEdits.length = editN;

        // ===== (D) KEIN LANDE-MAGNET — fallen lassen, kein Δy/Frame über Schwerkraft =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 6, spot.z);
        zeroVel();
        let prevY = s.playerMesh.position.y,
            maxFrameDrop = 0;
        for (let i = 0; i < 90; i++) {
            tick();
            const drop = prevY - s.playerMesh.position.y; // positiv = nach unten
            if (drop > maxFrameDrop) maxFrameDrop = drop;
            prevY = s.playerMesh.position.y;
            if (s._groundedCache) break;
        }
        // Terminal ~14 m/s × 1/60 ≈ 0.23 m/Frame; ein Magnet-Snap wäre ~0.4. Schwelle 0.3.

        return {
            spot,
            anticlip: { recovered, notFar, finalY: +s.playerMesh.position.y.toFixed(2), surf: +surfA.toFixed(2) },
            steep: steep
                ? {
                      ny: steep.ny,
                      maxBuried: +maxBuried.toFixed(2),
                      minY: +steepMinY.toFixed(2),
                      startH: +startH.toFixed(2),
                      fellThrough: steepMinY < startH - 8,
                  }
                : null,
            ledge: { sawAirAtEdge },
            magnet: { maxFrameDrop: +maxFrameDrop.toFixed(3) },
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    let pass = true;
    const ok = (c, l) => {
        console.log(`  ${c ? "✅" : "❌"} ${l}`);
        if (!c) pass = false;
    };
    console.log("\n===== EDGE-CASE-VERIFIKATION (Feld-Physik) =====\n");
    console.log(
        `  (A) ANTI-CLIP: finalY ${out.anticlip.finalY} · surf ${out.anticlip.surf} · recovered ${out.anticlip.recovered} · nah ${out.anticlip.notFar}`
    );
    ok(
        out.anticlip.recovered && out.anticlip.notFar,
        "ein TIEF im Terrain steckender Spieler wird auf die Oberkante geholt (kein Feststecken unter der Welt)"
    );
    if (out.steep) {
        console.log(
            `  (B) STEILE WAND (ny ${out.steep.ny}, Start ${out.steep.startH}): maxBuried ${out.steep.maxBuried} m · minY ${out.steep.minY} · fellThrough ${out.steep.fellThrough}`
        );
        ok(
            out.steep.maxBuried < 0.6 && !out.steep.fellThrough,
            "in steiles Terrain laufen clippt NICHT durch (Füße nie tief im Soliden, kein Durchfallen)"
        );
    } else {
        console.log("  (B) STEILE WAND: kein steiler Spot gefunden (übersprungen)");
    }
    console.log(`  (C) KLIPPE/KAMM: sawAir ${out.ledge.sawAirAtEdge}`);
    ok(out.ledge.sawAirAtEdge, "über eine scharfe Kante hebt der Spieler ab (kein Kleben am Boden)");
    console.log(`  (D) LANDE-MAGNET: maxFrameDrop ${out.magnet.maxFrameDrop} m (Schwerkraft-Terminal ~0,23)`);
    ok(out.magnet.maxFrameDrop < 0.32, "im Fall zieht KEIN Sog (kein Δy/Frame über Schwerkraft → kein Lande-Magnet)");
    console.log(
        `\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN — die Rand-Fälle sind heil" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`
    );
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-walk-edge.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

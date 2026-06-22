// P1b — DIE GEH-MECHANIK-LINSE (Determinismus-Bogen). Beweist mit einer ZAHL, dass der
// feld-native Kapsel-Controller (_stepCharacter) den Spieler korrekt trägt — BEVOR der
// Schöpfer das GEFÜHL im Browser urteilt (die Bewegungs-Gefühl-Wand: Mechanik = Zahl,
// Gefühl = Bild). Vier Prüfungen, alle über den ECHTEN Loop (_gameLoopTick), Feld-Physik AN:
//   (A) ERDUNG: aus der Luft fallend kommt der Spieler auf der Oberfläche zur Ruhe
//       (Füße ≈ Oberkante, grounded), fällt NICHT durch.
//   (B) LAUF: W trägt ihn vorwärts (Distanz wächst), und er bleibt dabei AUF dem Boden
//       (Füße nahe der Feld-Oberfläche, kein Versinken/Schweben, kein Tunneln).
//   (C) STUFE: eine kleine Kante (≤ STEP_UP) wird ohne Sprung erklommen.
//   (D) SPRUNG: Space hebt ihn (vy > 0, Höhengewinn), dann landet er wieder geerdet.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4363,
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
        // ---- Warmup: Renderer stubben, Worker null (Sync-Chunks), Welt aufbauen ----
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
        if (!r._gameLoopTick || !s.playerMesh || !s.playerBody) return { error: "Welt nicht bereit" };

        const footDrop = (window.anazhRealm.constructor || r.constructor).PLAYER_FOOT_OFFSET;
        const stepUp = (window.anazhRealm.constructor || r.constructor).PLAYER_STEP_UP;

        // synthetischer 60-fps-Takt, kontinuierlich mit lastTime des Warmups.
        let simT = performance.now();
        const DT = 1000 / 60;
        const tick = () => {
            simT += DT;
            r._gameLoopTick(simT);
        };
        const clearKeys = () => {
            s.keys = {};
        };

        // Feld-Physik AN.
        r.setFieldPhysics(true);
        clearKeys();

        // Einen offenen, über-Wasser-Spot nahe Spawn finden — und einen FLACHEN
        // (Gradient-Normale ny hoch), damit die Lauf-/Erdungs-Messung sauber ist.
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
                spot = { x, z, h, flatNy: +g.y.toFixed(3) };
            }
        }
        if (!spot) spot = { x: 0, z: 0, h: r.getTerrainHeightAt(0, 0), flatNy: 1 };

        // Geste, die der echte Spieler-Spawn auch hat: kein Rest-Impuls. Body-Velocity
        // nullen, sonst driftet der Avatar in der Luft über den Hang (Test-Artefakt).
        const zeroVel = () => {
            if (s.playerBody) s.playerBody.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
            s._fieldVy = 0;
        };

        // ===== (A) ERDUNG — aus der Luft fallen lassen, settled? =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 4, spot.z);
        zeroVel();
        s.yaw = 0;
        for (let i = 0; i < 130; i++) {
            tick();
            if (s._groundedCache) zeroVel(); // am Boden Rest-Drift killen (wie der Lauf-Brake)
        }
        const surfA = r._fieldSurfaceBelow(
            s.playerMesh.position.x,
            s.playerMesh.position.y + 1,
            s.playerMesh.position.z,
            8
        );
        const restClear = s.playerMesh.position.y - footDrop - (surfA === null ? -999 : surfA); // ≈ 0 erwartet
        const groundedA = s._groundedCache === true;
        const fellThrough = s.playerMesh.position.y < spot.h - 5;

        // ===== (B) LAUF — W vorwärts, bleibt auf dem Boden? =====
        const startPos = { x: s.playerMesh.position.x, z: s.playerMesh.position.z };
        clearKeys();
        s.keys["w"] = true;
        let maxSink = 0,
            maxFloat = 0,
            sumAbsClear = 0,
            nClear = 0,
            groundedTicks = 0,
            minY = Infinity;
        const WALK = 120;
        for (let i = 0; i < WALK; i++) {
            tick();
            const pm = s.playerMesh.position;
            minY = Math.min(minY, pm.y);
            const surf = r._fieldSurfaceBelow(pm.x, pm.y - footDrop + stepUp, pm.z, footDrop + stepUp + 2);
            if (surf !== null) {
                const clear = pm.y - footDrop - surf; // 0 = Füße auf Oberkante, <0 versunken, >0 schwebt
                sumAbsClear += Math.abs(clear);
                nClear++;
                if (clear < -maxSink) maxSink = -clear; // wie weit unter die Oberfläche (Tunnel)
                if (clear > maxFloat) maxFloat = clear; // wie weit darüber (Levitation)
            }
            if (s._groundedCache) groundedTicks++;
        }
        clearKeys();
        const dx = s.playerMesh.position.x - startPos.x;
        const dz = s.playerMesh.position.z - startPos.z;
        const walkDist = Math.sqrt(dx * dx + dz * dz);
        const medAbsClear = nClear ? sumAbsClear / nClear : 999;
        const groundedFrac = groundedTicks / WALK;

        // ===== (C) STUFE — eine FILL-Kante (≤ STEP_UP) vor den Spieler, erklimmt er sie? =====
        // Sauber: zurück auf den flachen Spot settlen, dann eine ~0.4-m-Kante dicht voraus.
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 1.5, spot.z);
        zeroVel();
        for (let i = 0; i < 60; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        const beforeStepY = s.playerMesh.position.y;
        const sx = s.playerMesh.position.x,
            sz0 = s.playerMesh.position.z;
        if (!s.worldMeta.voxelEdits) s.worldMeta.voxelEdits = [];
        const editN = s.worldMeta.voxelEdits.length;
        const feetNow = beforeStepY - footDrop;
        // breite, niedrige FILL-Wand quer zur Laufrichtung, Oberkante ~0.4 m über den Füßen
        // (< STEP_UP), dicht voraus (+1.6 m) → ein klarer Stufen-Riser in der Bahn.
        for (let d = 0; d < 3; d++) {
            s.worldMeta.voxelEdits.push({
                x: sx + (d - 1) * 1.4,
                y: feetNow - 1.5,
                z: sz0 + 1.8,
                r: 2.0,
                mode: "fill",
                strength: 200,
            });
        }
        const ledgeTop = r._fieldSurfaceBelow(sx, beforeStepY + 1.5, sz0 + 1.8, 6);
        s.keys["w"] = true;
        let climbed = 0;
        for (let i = 0; i < 120; i++) {
            tick();
            climbed = Math.max(climbed, s.playerMesh.position.y - beforeStepY);
        }
        clearKeys();
        const stepClimbedY = climbed;
        s.worldMeta.voxelEdits.length = editN; // Test-Edits entfernen

        // ===== (D) SPRUNG — isoliert: frisch auf den flachen Spot, sauber settlen, EIN Sprung. =====
        clearKeys();
        s.playerMesh.position.set(spot.x, spot.h + 1.5, spot.z);
        zeroVel();
        s.isJumping = false;
        s._jumpPressedAt = -Infinity;
        for (let i = 0; i < 70; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        const groundY = s.playerMesh.position.y;
        const groundedBeforeJump = s._groundedCache === true;
        s.keys[" "] = true;
        tick();
        s.keys[" "] = false;
        s._spaceWasDown = false;
        let peakY = s.playerMesh.position.y;
        let sawAir = false;
        for (let i = 0; i < 90; i++) {
            tick();
            peakY = Math.max(peakY, s.playerMesh.position.y);
            if (s.isInAir) sawAir = true;
        }
        const jumpRise = peakY - groundY;
        const landedY = s.playerMesh.position.y;
        const landedGrounded = s._groundedCache === true && Math.abs(landedY - groundY) < 0.6;

        return {
            spot,
            footDrop,
            stepUp,
            erdung: { restClear: +restClear.toFixed(3), grounded: groundedA, fellThrough },
            lauf: {
                dist: +walkDist.toFixed(2),
                dz: +dz.toFixed(2),
                medAbsClear: +medAbsClear.toFixed(3),
                maxSink: +maxSink.toFixed(3),
                maxFloat: +maxFloat.toFixed(3),
                groundedFrac: +groundedFrac.toFixed(2),
                minY: +minY.toFixed(2),
                floorRef: +spot.h.toFixed(2),
            },
            stufe: {
                climbedY: +stepClimbedY.toFixed(3),
                ledgeAbove: ledgeTop === null ? null : +(ledgeTop - (beforeStepY - footDrop)).toFixed(2),
            },
            sprung: { jumpRise: +jumpRise.toFixed(3), sawAir, landedGrounded, groundedBeforeJump },
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
    console.log("\n===== GEH-MECHANIK-VERIFIKATION P1b (Feld-Physik) =====\n");
    console.log(
        `  Spot (${out.spot.x},${out.spot.z}) h=${out.spot.h.toFixed(2)} · footDrop ${out.footDrop} · stepUp ${out.stepUp}`
    );
    console.log(
        `  (A) ERDUNG: restClear ${out.erdung.restClear} m · grounded ${out.erdung.grounded} · fellThrough ${out.erdung.fellThrough}`
    );
    ok(
        !out.erdung.fellThrough && out.erdung.grounded && Math.abs(out.erdung.restClear) < 0.25,
        "der Spieler ruht aus der Luft sauber auf der Oberfläche (Füße ≈ Oberkante, grounded)"
    );
    console.log(
        `  (B) LAUF: dist ${out.lauf.dist} m (dz ${out.lauf.dz}) · med|clear| ${out.lauf.medAbsClear} · maxSink ${out.lauf.maxSink} · maxFloat ${out.lauf.maxFloat} · grounded ${(out.lauf.groundedFrac * 100).toFixed(0)}% · minY ${out.lauf.minY} (floor ${out.lauf.floorRef})`
    );
    ok(out.lauf.dist > 4 && out.lauf.dz > 3, "W trägt den Spieler vorwärts (> 4 m, in Laufrichtung +Z)");
    ok(
        out.lauf.maxSink < 0.2 && out.lauf.maxFloat < 0.8 && out.lauf.groundedFrac > 0.7,
        "er bleibt dabei AUF dem Boden (kein Versinken < 0,2 m, keine Levitation < 0,8 m, > 70 % geerdet)"
    );
    console.log(`  (C) STUFE: erklommen ${out.stufe.climbedY} m (Kante ~${out.stufe.ledgeAbove} m über Start)`);
    ok(out.stufe.climbedY > 0.25, "eine kleine Kante (≤ STEP_UP) wird ohne Sprung erklommen");
    console.log(
        `  (D) SPRUNG: rise ${out.sprung.jumpRise} m · sawAir ${out.sprung.sawAir} · landedGrounded ${out.sprung.landedGrounded}`
    );
    ok(
        out.sprung.groundedBeforeJump && out.sprung.jumpRise > 1.0 && out.sprung.sawAir && out.sprung.landedGrounded,
        "Space hebt den Spieler (> 1 m) und er landet wieder geerdet"
    );
    console.log(
        `\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN — die Mechanik trägt; das GEFÜHL urteilt der Schöpfer-Browser" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`
    );
    console.log("=======================================================\n");
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-walk-feel.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

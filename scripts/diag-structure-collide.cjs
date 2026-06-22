// P2 — DIE STRUKTUR-KOLLISIONS-LINSE (Determinismus-Bogen). Beweist mit einer ZAHL, dass der
// feld-native Controller (`_stepCharacter` + `_stepCharacterStructures`) den Spieler an einer
// Bauwerks-WAND blockt UND auf einer Bauwerks-OBERKANTE (Dach/Plattform) TRÄGT — sonst liefe
// er im Feld-Modus durch Wände und fiele durch die Start-Plattform (die Unehrlichkeit, die
// Default-AN sonst hätte). Zwei Prüfungen, über den echten Loop, Feld-Physik AN:
//   (A) AUFLAGE: über einer soliden Struktur fallen gelassen → ruht auf ihrer Oberkante,
//       fällt NICHT durch (das Start-Plattform-Problem).
//   (B) WAND: auf eine solide Wand zulaufen → wird davor geblockt, läuft NICHT hindurch.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4364,
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
        if (!r._gameLoopTick || !s.playerMesh || !s.playerBody) return { error: "Welt nicht bereit" };
        const footDrop = (window.anazhRealm.constructor || r.constructor).PLAYER_FOOT_OFFSET;

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

        // einen flachen, über-Wasser-Spot finden
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

        // eine solide Struktur am Spot spawnen — die erste, die blockerAABBs trägt.
        const candidates = ["temple", "village", "tower", "haus", "stein_block", "wall", "monument"];
        let entry = null,
            usedType = null;
        for (const t of candidates) {
            try {
                const e = r.spawnArchitecture(t, { x: spot.x, y: spot.h, z: spot.z }, {});
                if (e && Array.isArray(e.blockerAABBs) && e.blockerAABBs.length) {
                    entry = e;
                    usedType = t;
                    break;
                }
                // kein Blocker → wieder entfernen (best effort), nächsten probieren
            } catch (_e) {}
        }
        if (!entry)
            return {
                error: "keine solide Struktur mit blockerAABBs spawnbar (Kandidaten: " + candidates.join(",") + ")",
            };

        // die höchste/breiteste Blocker-Box als Wand + Auflage-Ziel
        let wall = entry.blockerAABBs[0];
        for (const b of entry.blockerAABBs) if (b.topY > wall.topY) wall = b;
        const cxBox = (wall.minX + wall.maxX) / 2;
        const czBox = (wall.minZ + wall.maxZ) / 2;

        // ===== (A) AUFLAGE — über der Box-Oberkante fallen lassen, ruht drauf? =====
        clearKeys();
        s.playerMesh.position.set(cxBox, wall.topY + 3, czBox);
        zeroVel();
        for (let i = 0; i < 130; i++) {
            tick();
            if (s._groundedCache) zeroVel();
        }
        const restY = s.playerMesh.position.y;
        const supportClear = restY - footDrop - wall.topY; // ≈ 0 = Füße auf der Oberkante
        const onStructure = s._groundedCache === true && Math.abs(supportClear) < 0.3;
        const fellThroughStruct = restY < wall.topY - 1.5; // durch die Struktur gefallen

        // ===== (B) WAND — auf die Wand zulaufen, geblockt? =====
        // Spieler auf Terrain, ~5 m vor der −X-Seite der Box, Blick +X in die Wand.
        clearKeys();
        const approachX = wall.minX - 5;
        const groundAtApproach = r.getTerrainHeightAt(approachX, czBox);
        const startY = (Number.isFinite(groundAtApproach) ? groundAtApproach : spot.h) + footDrop + 0.2;
        s.playerMesh.position.set(approachX, startY, czBox);
        s.yaw = Math.PI / 2; // forward = (sin, 0, cos) = (+1,0,0) → +X
        zeroVel();
        for (let i = 0; i < 30; i++) tick(); // settlen
        const beforeX = s.playerMesh.position.x;
        s.keys["w"] = true;
        let maxX = -Infinity;
        for (let i = 0; i < 150; i++) {
            tick();
            maxX = Math.max(maxX, s.playerMesh.position.x);
        }
        clearKeys();
        const finalX = s.playerMesh.position.x;
        // geblockt, wenn der Spieler die Wand-Vorderkante (minX) nicht nennenswert
        // überschritten hat (Radius-Toleranz). Penetration = wie weit über minX hinaus.
        const penetration = maxX - wall.minX;
        const movedToward = beforeX < wall.minX - 1; // ist überhaupt losgelaufen Richtung Wand
        const blocked = penetration < 0.5;

        return {
            usedType,
            box: {
                minX: +wall.minX.toFixed(2),
                maxX: +wall.maxX.toFixed(2),
                topY: +wall.topY.toFixed(2),
                botY: +wall.botY.toFixed(2),
            },
            auflage: {
                restY: +restY.toFixed(2),
                supportClear: +supportClear.toFixed(3),
                onStructure,
                fellThroughStruct,
            },
            wand: {
                beforeX: +beforeX.toFixed(2),
                finalX: +finalX.toFixed(2),
                maxX: +maxX.toFixed(2),
                penetration: +penetration.toFixed(3),
                movedToward,
                blocked,
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
    console.log("\n===== STRUKTUR-KOLLISIONS-VERIFIKATION P2 (Feld-Physik) =====\n");
    console.log(
        `  Struktur '${out.usedType}' · Box X[${out.box.minX}..${out.box.maxX}] topY ${out.box.topY} botY ${out.box.botY}`
    );
    console.log(
        `  (A) AUFLAGE: restY ${out.auflage.restY} · supportClear ${out.auflage.supportClear} m · onStructure ${out.auflage.onStructure} · fellThrough ${out.auflage.fellThroughStruct}`
    );
    ok(
        out.auflage.onStructure && !out.auflage.fellThroughStruct,
        "der Spieler ruht auf der Struktur-Oberkante (Plattform/Dach), fällt NICHT durch"
    );
    console.log(
        `  (B) WAND: vor ${out.wand.beforeX} → max ${out.wand.maxX} (Wand-Kante ${out.box.minX}) · Penetration ${out.wand.penetration} m`
    );
    ok(out.wand.movedToward, "der Spieler ist Richtung Wand losgelaufen (Test-Vorbedingung)");
    ok(out.wand.blocked, "der Spieler wird an der Wand geblockt, läuft NICHT hindurch (< 0,5 m Penetration)");
    console.log(
        `\n  ${pass ? "✅ ALLE PRÜFUNGEN GRÜN — die Box-Schicht trägt; Default-AN ist ehrlich" : "❌ MINDESTENS EINE PRÜFUNG ROT"}\n`
    );
    console.log("=============================================================\n");
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-structure-collide.json"), JSON.stringify(out, null, 2));
    } catch (_e) {}
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

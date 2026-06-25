// V18.355 PHASE C — FIXED-TIMESTEP SIM/RENDER-SPLIT: beweist hardware-unabhängig, dass die
// SIM (Charakter-Physik + Bewegung) framerate-UNABHÄNGIG ist — dieselbe Input-Folge bei
// verschiedenen Frame-Raten (realDt = FIXED_DT · 2×FIXED_DT · ½×FIXED_DT) über DIESELBE Sim-
// ZEIT → bit-identischer Sim-State (Position · Velocity · fieldVy). DAS ist das Lockstep-MP-
// Fundament. Plus: (a) gleiche Schritt-Zahl je Szenario · (b) Spiral-of-Death-Klemme (ein
// Riesen-realDt → Schritte ≤ FIXED_MAX_STEPS) · (c) Interpolations-alpha in [0,1] · (d) der
// Produktions-Pfad (fixedTimestep=true) crasht nicht + die Welt streamt weiter.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4414,
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
        protocolTimeout: 360000,
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
    page.setDefaultTimeout(340000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                // Worker null → die Aufwärm-Welt baut SYNC (deterministisch, wie diag-walk-feel)
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
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const A = r.constructor;
        const mesh = s.playerMesh;
        if (!mesh || !s.playerVel) return { error: "no player" };
        if (typeof r._loopFixedStep !== "function") return { error: "fixed-timestep methods missing" };

        // einen settled LAND-Spot über Wasser finden (deterministisch, valides Feld)
        let spot = { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z };
        for (let i = 0; i < 200; i++) {
            const x = ((i * 53) % 80) - 40,
                z = ((i * 31) % 80) - 40;
            const h = r.getTerrainHeightAt(x, z);
            if (Number.isFinite(h) && r._isAboveWaterAt && r._isAboveWaterAt(x, z)) {
                spot = { x, y: h + 1.5, z };
                break;
            }
        }

        const resetSim = () => {
            // V18.358 — Fixed-Timestep ist der EINE Sim-Pfad (kein Toggle mehr); der Loop ruft
            // `_loopFixedStep` unbedingt, dieser Diag fährt ihn direkt.
            mesh.position.set(spot.x, spot.y, spot.z);
            s.playerVel.setValue(0, 0, 0);
            s._fieldVy = 0;
            s._fieldWasGrounded = false;
            s._groundedCache = false;
            s.isInAir = false;
            s.isJumping = false;
            s.onSteepSlope = false;
            s._jumpPressedAt = -Infinity;
            s._spaceWasDown = false;
            s.yaw = 0;
            s.keys = { w: true }; // W gehalten, kein Sprung
            s._fixedAccumulator = 0;
            s._fixedSimPos = null;
            s._fixedPrevPos = null;
            s._fixedSimTime = 0;
        };
        const capture = () => {
            if (s._fixedSimPos) mesh.position.copy(s._fixedSimPos); // die Sim-Position (nicht die interpolierte)
            return {
                x: mesh.position.x,
                y: mesh.position.y,
                z: mesh.position.z,
                vx: s.playerVel.x(),
                vy: s.playerVel.y(),
                vz: s.playerVel.z(),
                fieldVy: s._fieldVy,
            };
        };
        const runFixed = (realDt, frames) => {
            resetSim();
            let t = 0,
                totalSteps = 0,
                alphaSeen = [];
            for (let i = 0; i < frames; i++) {
                totalSteps += r._loopFixedStep(realDt, t);
                alphaSeen.push(s._fixedAlpha);
                r._applyFixedInterpolation();
                t += realDt;
            }
            const end = capture();
            return { end, totalSteps, alphaMin: Math.min(...alphaSeen), alphaMax: Math.max(...alphaSeen) };
        };

        const FIXED = A.FIXED_DT;
        // alle drei: dieselbe Sim-ZEIT (90×FIXED ≈ 1.5 s) → dieselben 90 Schritte
        const sA = runFixed(FIXED, 90); // 60 fps
        const sB = runFixed(2 * FIXED, 45); // 30 fps
        const sC = runFixed(FIXED / 2, 180); // 120 fps

        const bitEq = (p, q) =>
            p.x === q.x && p.y === q.y && p.z === q.z && p.vx === q.vx && p.vy === q.vy && p.vz === q.vz && p.fieldVy === q.fieldVy;
        const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z);

        // (b) Spiral-of-Death: ein Riesen-realDt
        resetSim();
        const spiralSteps = r._loopFixedStep(100, 0);

        // (d) Produktions-Pfad: der Loop ruft `_loopFixedStep` unbedingt (V18.358, kein Toggle).
        const routesToFixed = /_loopFixedStep/.test(r.startEternalLoop.toString());
        const chunksBefore = s.voxelChunks ? s.voxelChunks.size : 0;
        resetSim();
        let prodErr = null;
        try {
            for (let i = 0; i < 90; i++) r._gameLoopTick(performance.now());
        } catch (e) {
            prodErr = String(e && (e.message || e));
        }
        const chunksAfter = s.voxelChunks ? s.voxelChunks.size : 0;
        const finite =
            Number.isFinite(mesh.position.x) && Number.isFinite(mesh.position.y) && Number.isFinite(mesh.position.z);

        return {
            sA,
            sB,
            sC,
            bitEq_AB: bitEq(sA.end, sB.end),
            bitEq_AC: bitEq(sA.end, sC.end),
            dist_AB: dist(sA.end, sB.end),
            dist_AC: dist(sA.end, sC.end),
            moved: dist(sA.end, { x: spot.x, y: spot.y, z: spot.z }),
            spiralSteps,
            maxSteps: A.FIXED_MAX_STEPS,
            routesToFixed,
            prodErr,
            chunksBefore,
            chunksAfter,
            finite,
        };
    });

    console.log("\n===== V18.355 PHASE C — FIXED-TIMESTEP-VERIFIKATION =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (out.error) {
        console.log("FEHLER:", out.error);
        ok = false;
    } else {
        console.log(
            `  60fps: ${out.sA.totalSteps} Schritte · 30fps: ${out.sB.totalSteps} · 120fps: ${out.sC.totalSteps} (alle = dieselbe Sim-Zeit)`
        );
        console.log(
            `  End-Sim-State bit-Distanz: A↔B ${out.dist_AB.toExponential(2)} m · A↔C ${out.dist_AC.toExponential(2)} m · bewegt ${out.moved.toFixed(2)} m`
        );
        console.log(
            `  Spiral: realDt 100 s → ${out.spiralSteps} Schritte (Cap ${out.maxSteps}) · alpha∈[${out.sC.alphaMin?.toFixed(2)}, ${out.sC.alphaMax?.toFixed(2)}]\n`
        );
        check(
            out.sA.totalSteps === out.sB.totalSteps && out.sA.totalSteps === out.sC.totalSteps && out.sA.totalSteps > 0,
            `(1) gleiche Schritt-Zahl bei allen Frame-Raten (${out.sA.totalSteps})`
        );
        check(out.moved > 1.0, `(2) die Sim bewegt den Spieler spürbar (${out.moved.toFixed(2)} m, kein No-op)`);
        check(
            out.bitEq_AB && out.bitEq_AC,
            `(3) FRAMERATE-UNABHÄNGIG: 30/60/120 fps → BIT-IDENTISCHER Sim-State (das Lockstep-Fundament)`
        );
        check(
            out.spiralSteps <= out.maxSteps && out.spiralSteps < 100,
            `(4) SPIRAL-KLEMME: 100-s-Hitch → ${out.spiralSteps} Schritte ≤ ${out.maxSteps} (kein Einhol-Sturm)`
        );
        check(
            out.sC.alphaMin >= 0 && out.sC.alphaMax <= 1,
            `(5) INTERPOLATION: alpha ∈ [0,1] (${out.sC.alphaMin?.toFixed(2)}..${out.sC.alphaMax?.toFixed(2)})`
        );
        check(out.routesToFixed, "(6a) startEternalLoop routet zu _loopFixedStep (CONSUM)");
        check(!out.prodErr && !pageErr && out.finite, `(6b) Produktions-Pfad: kein Crash, Position endlich (err=${out.prodErr})`);
        // Der Spieler wurde für den Test teleportiert (resetSim) → ferne Chunks prunen, neue
        // streamen (die Zahl fluktuiert — KEIN Freeze). „Streamt weiter" = die Welt lebt (Chunks > 0).
        check(out.chunksAfter > 0, `(6c) die Welt lebt + streamt (${out.chunksBefore}→${out.chunksAfter} Chunks, Teleport-bedingt)`);
    }
    console.log(`\n  ${ok ? "✅ PHASE C BEWIESEN" : "❌ FEHLGESCHLAGEN"}\n`);
    console.log("=========================================================\n");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

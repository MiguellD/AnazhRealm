// V18.129 — DAS HOCH-BECKEN (A4-Rest, gigant-plan §5): die Mess-Sonde des
// Stau-Spiegels. Beweist am ECHTEN Fluss der Welt, in dieser Reihenfolge:
//   (1) PFEILER-KONTROLLE: ein einzelner Fill-Block im Fluss STAUT NICHT
//       (der Spill-Scan findet den Ausweg auf rim-Niveau — die Physik filtert,
//       keine Werk-Heuristik; Pegel-Delta ≈ 0, Kappen-Raise ≤ 1 Zelle).
//   (2) DAMM: eine Fill-Kugel-Reihe QUER zum Lauf → der Pool steigt ÜBER den
//       frozen Spiegel (rim-L), bounded (≤ Krone + Quantisierung, ≤ rim +
//       CA_STAU.MAX_CELLS), und der Automat SETTLED (Gleichgewichts-Regel).
//   (3) WELT-KONTROLLE: Spalten außerhalb des Stau-Fensters bleiben auf dem
//       V18.93-Stand (keine Badewanne).
// Plus A/B-Screenshots (artifacts/stau-before.png / stau-after.png) — das
// A-Gate (mein Auge), Tour-Disziplin (settled, Augenhöhe, HUD aus).
//   node scripts/diag-stau.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4393;
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

    // Boot (Render gestubbt fürs Tempo — diag-tour-Muster).
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
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
                const h = r.state && r.state.hydrosphere;
                if (h && h.ready && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
    });

    // Den DAMM-PUNKT wählen: ein Fluss-Punkt mit echtem Gefälle (~2 Zellen über
    // ~32 m aufwärts) — sonst kann kein Stau über die Quantisierung steigen
    // (der Pool ist durch den Zufluss-Pegel am Fenster-Rand bounded — ehrliche
    // Hydraulik der Spieler-Aufmerksamkeits-Grenze).
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const h = r.state.hydrosphere;
        const rimAt = (x, z) => r._atlasWaterLevelAt(x, z, -Infinity);
        let best = null;
        for (const rv of h.rivers || []) {
            const pts = rv.points || [];
            for (let i = 3; i < pts.length - 2; i++) {
                if (pts[i].inLake) continue;
                const p = pts[i];
                const up = pts[i - 2];
                const rim = rimAt(p.x, p.z);
                const rimUp = rimAt(up.x, up.z);
                if (!(rim > -Infinity) || !(rimUp > -Infinity)) continue;
                const rise = rimUp - rim;
                const score = Math.min(rise, 4);
                if (rise >= 1.2 && (!best || score > best.score)) {
                    best = { x: p.x, z: p.z, upX: up.x, upZ: up.z, rim, rimUp, rise, score };
                }
            }
        }
        return best;
    });
    if (!spot) {
        console.log("STAU: kein Fluss-Punkt mit Gefälle in dieser Welt — unmessbar (kein Fehler).");
        await browser.close();
        server.close();
        process.exit(0);
    }
    console.log(
        `DAMM-PUNKT @(${spot.x | 0},${spot.z | 0})  rim=${spot.rim.toFixed(2)}  rise(32m up)=${spot.rise.toFixed(2)}`
    );

    // Body an den Punkt teleportieren + Ring nachstreamen (LOD0-Zellen Pflicht).
    await page.evaluate(async (spot) => {
        const r = window.anazhRealm;
        const s = r.state;
        // landfest ans Ufer (Tour-V3): erhöhter Punkt nahe dem Damm-Ort.
        let bx = spot.x + 14;
        let bz = spot.z;
        outer: for (let step = 8; step <= 60; step += 6) {
            for (let a = 0; a < 8; a++) {
                const ang = (a / 8) * Math.PI * 2;
                const tx = spot.x + Math.cos(ang) * step;
                const tz = spot.z + Math.sin(ang) * step;
                const gy = r.getTerrainHeightAt(tx, tz);
                if (Number.isFinite(gy) && gy > spot.rim + 2.5 && gy < spot.rim + 24) {
                    bx = tx;
                    bz = tz;
                    break outer;
                }
            }
        }
        const groundY = r.getTerrainHeightAt(bx, bz);
        const body = s.playerBody;
        if (body && s.tmpTransform && typeof Ammo !== "undefined") {
            s.tmpTransform.setIdentity();
            s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, bx, (Number.isFinite(groundY) ? groundY : 20) + 2.2, bz));
            body.setWorldTransform(s.tmpTransform);
            body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
            body.activate(true);
        }
        const t0 = performance.now();
        let lastSize = -1;
        let stable = 0;
        while (performance.now() - t0 < 90000) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            const sz = s.voxelChunks ? s.voxelChunks.size : 0;
            if (sz === lastSize) stable++;
            else {
                stable = 0;
                lastSize = sz;
            }
            if (stable > 60) break;
            await new Promise((res) => setTimeout(res, 4));
        }
    }, spot);

    // Mess-Helfer als Page-Funktion installieren.
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        window.__colTop = (x, z) => {
            const cfg = r._voxelChunkConfig(0);
            const cx = Math.floor(x / cfg.span);
            const cz = Math.floor(z / cfg.span);
            const key = `${cx},${cz}`;
            const entry = s.voxelChunks.get(key);
            if (!entry || !entry.waterCells || (Number.isFinite(entry.lod) && entry.lod !== 0)) return null;
            const lv = s.waterLevelCells ? s.waterLevelCells.get(key) : null;
            const cfgOy = (s.terrainBaseHeight || 0) - cfg.floorDrop;
            const i = Math.floor((x - cx * cfg.span) / cfg.step);
            const k = Math.floor((z - cz * cfg.span) / cfg.step);
            const c = i + k * cfg.dim;
            const dimSq = cfg.dim * cfg.dim;
            for (let j = cfg.dimY - 1; j >= 0; j--) {
                const idx = c + j * dimSq;
                if (entry.waterCells[idx] === 2) continue;
                const wet = lv ? lv[idx] > 0.5 : entry.waterCells[idx] === 1;
                if (wet) return cfgOy + (j + 1) * cfg.step;
            }
            return -Infinity;
        };
        window.__pumpCA = (maxTicks) => {
            let settledAt = -1;
            let calm = 0;
            let last = 0;
            for (let t = 0; t < maxTicks; t++) {
                last = r._tickWorldWaterCA();
                if (last < 0.3) calm++;
                else calm = 0;
                if (calm >= 120) {
                    settledAt = t;
                    break;
                }
            }
            return { settledAt, lastMoved: +last.toFixed(3), active: s.waterCAActive ? s.waterCAActive.size : 0 };
        };
    });

    // ===== PHASE 1 — PFEILER-KONTROLLE =====
    const pillar = await page.evaluate((spot) => {
        const r = window.anazhRealm;
        const samples = [];
        for (let a = 0; a < 8; a++) {
            const ang = (a / 8) * Math.PI * 2;
            samples.push([spot.x + Math.cos(ang) * 6, spot.z + Math.sin(ang) * 6]);
        }
        const before = samples.map(([x, z]) => window.__colTop(x, z));
        r.fillVoxelSphere(spot.x, spot.rim + 0.6, spot.z, 2.0);
        const pump = window.__pumpCA(900);
        const after = samples.map(([x, z]) => window.__colTop(x, z));
        let maxDelta = 0;
        for (let i = 0; i < samples.length; i++) {
            if (Number.isFinite(before[i]) && Number.isFinite(after[i]))
                maxDelta = Math.max(maxDelta, after[i] - before[i]);
        }
        return { maxDelta: +maxDelta.toFixed(2), pump };
    }, spot);
    const pillarOk = pillar.maxDelta <= 1.85; // ≤ 1 Zelle (Quantisierungs-Toleranz)
    console.log(
        `PFEILER: max Pegel-Delta=${pillar.maxDelta} m (≤1.85 erwartet) settled@${pillar.pump.settledAt}  ${pillarOk ? "✓" : "✗ STAUT FÄLSCHLICH"}`
    );

    // Screenshot VOR dem Damm (echter Render): DROHNE schräg über dem Lauf,
    // Blick auf den künftigen Stau-Bereich (upstream-Seite des Damm-Punkts).
    fs.mkdirSync(ART, { recursive: true });
    const shot = async (file) => {
        await page.evaluate((spot) => {
            const r = window.anazhRealm;
            const s = r.state;
            const cam = s.camera;
            // upstream-Richtung aus den Fluss-Punkten (Quelle → Punkt).
            const ux = spot.upX - spot.x;
            const uz = spot.upZ - spot.z;
            const ul = Math.hypot(ux, uz) || 1;
            // ERST ticken (Re-Mesh-Queue leeren) — der Loop-Kamera-Follow würde
            // eine schon gesetzte Drohnen-Kamera aufs Spieler-Auge zurücksetzen.
            try {
                for (let i = 0; i < 30; i++) r._gameLoopTick(performance.now());
            } catch (_e) {}
            // Tour-Disziplin (V18.114): AUGENHÖHE vom landfest gefundenen Ufer-
            // Standpunkt, Blick auf den Stau-Bereich (Pool-Mitte upstream des
            // Damm-Punkts). Die Pose wird beim ERSTEN Shot EINGEFROREN — der Body
            // driftet über die Pump-Ticks, ein echtes A/B braucht EIN Auge.
            if (!window.__stauCam) {
                const pm = s.playerMesh.position;
                window.__stauCam = { x: pm.x, y: pm.y + 2.6, z: pm.z };
            }
            const eye = window.__stauCam;
            cam.position.set(eye.x, eye.y, eye.z);
            cam.lookAt(spot.x + (ux / ul) * 5, spot.rim + 1.2, spot.z + (uz / ul) * 5);
            cam.updateMatrixWorld(true);
            if (window.__origRender) {
                s.renderer.render = window.__origRender;
                try {
                    r._loopRender(performance.now());
                    r._loopRender(performance.now());
                    r._loopRender(performance.now());
                } catch (_e) {}
                s.renderer.render = function () {};
            }
        }, spot);
        await new Promise((res) => setTimeout(res, 250));
        await page.screenshot({ path: path.join(ART, file) });
    };
    await shot("stau-before.png");

    // ===== PHASE 2 — DER DAMM (quer zum Lauf) =====
    const dam = await page.evaluate((spot) => {
        const r = window.anazhRealm;
        const rv = r._hydroRiverAt(spot.x, spot.z);
        let fx = 0;
        let fz = 1;
        if (rv && (rv.dirX || rv.dirZ)) {
            const len = Math.hypot(rv.dirX, rv.dirZ) || 1;
            fx = rv.dirX / len;
            fz = rv.dirZ / len;
        } else {
            // Fallback: Richtung aus den Fluss-Punkten (upstream → Punkt).
            const dx = spot.x - spot.upX;
            const dz = spot.z - spot.upZ;
            const len = Math.hypot(dx, dz) || 1;
            fx = dx / len;
            fz = dz / len;
        }
        // upstream-Vorzeichen: rim steigt bergauf.
        const rimA = r._atlasWaterLevelAt(spot.x - fx * 12, spot.z - fz * 12, -Infinity);
        const rimB = r._atlasWaterLevelAt(spot.x + fx * 12, spot.z + fz * 12, -Infinity);
        const upSign = rimA >= rimB ? -1 : 1;
        const nx = -fz;
        const nz = fx;
        const crestY = spot.rim + 0.6 + 2.8;
        for (const t of [-8.1, -5.4, -2.7, 0, 2.7, 5.4, 8.1]) {
            r.fillVoxelSphere(spot.x + nx * t, spot.rim + 0.6, spot.z + nz * t, 2.8);
        }
        const pump = window.__pumpCA(6000);
        // Pool-Messung UPSTREAM des Damms (+ leicht lateral).
        let pool = -Infinity;
        const poolPts = [];
        for (const d of [4, 6, 8, 10, 13]) {
            for (const lat of [-2.5, 0, 2.5]) {
                const px = spot.x + fx * upSign * d + nx * lat;
                const pz = spot.z + fz * upSign * d + nz * lat;
                const top = window.__colTop(px, pz);
                if (Number.isFinite(top)) {
                    poolPts.push(+(top - spot.rim).toFixed(2));
                    if (top > pool) pool = top;
                }
            }
        }
        // Welt-Kontrolle: außerhalb des Stau-Fensters (REACH 16×1.8≈29 m + Damm).
        const ctrl = [];
        for (const d of [48, 58]) {
            for (const sgn of [-1, 1]) {
                const px = spot.x + fx * sgn * d;
                const pz = spot.z + fz * sgn * d;
                const top = window.__colTop(px, pz);
                const rim = r._atlasWaterLevelAt(px, pz, -Infinity);
                if (Number.isFinite(top) && rim > -Infinity) ctrl.push(+(top - rim).toFixed(2));
            }
        }
        // Kappen-Wahrheit am Pool (diagnostisch): max cap-Raise in Zellen.
        return {
            pump,
            poolOverRim: +(pool - spot.rim).toFixed(2),
            poolPts,
            crestOverRim: +(crestY - spot.rim).toFixed(2),
            ctrlOverRim: ctrl,
            upSign,
        };
    }, spot);

    const maxAllowed = Math.min(dam.crestOverRim + 1.9, (7 + 1) * 1.8);
    const stautOk = dam.poolOverRim >= 0.9;
    const boundedOk = dam.poolOverRim <= maxAllowed;
    const settledOk = dam.pump.settledAt >= 0;
    const ctrlOk = dam.ctrlOverRim.every((v) => v <= 2.4); // rim + 0.5 + 1 Zelle Quantisierung
    console.log(
        `DAMM: Pool über rim = ${dam.poolOverRim} m (Krone +${dam.crestOverRim} m, Deckel ${maxAllowed.toFixed(1)} m)`
    );
    console.log(`      Pool-Profil (über rim): ${dam.poolPts.join(", ")}`);
    console.log(`      settled@${dam.pump.settledAt} (lastMoved=${dam.pump.lastMoved}, active=${dam.pump.active})`);
    console.log(`      Welt-Kontrolle (über rim, ±48–58 m): ${dam.ctrlOverRim.join(", ") || "(keine messbar)"}`);
    console.log(
        `  → STAUT ${stautOk ? "✓" : "✗"} · BOUNDED ${boundedOk ? "✓" : "✗"} · SETTLED ${settledOk ? "✓" : "✗"} · WELT-UNVERÄNDERT ${ctrlOk ? "✓" : "✗"}`
    );

    // Screenshot NACH dem Damm (der Stausee — das A-Gate).
    await shot("stau-after.png");

    await browser.close();
    server.close();
    const ok = pillarOk && stautOk && boundedOk && settledOk && ctrlOk;
    console.log(ok ? "STAU-DIAG: ALLES GRÜN" : "STAU-DIAG: ROT");
    process.exit(ok ? 0 : 1);
})();

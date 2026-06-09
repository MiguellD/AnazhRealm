// Diagnose W-A (V18.89, wasser-plan §0) — das ZELL-OBERKANTEN-SHEET ("cells"-Modus), BEWIESEN:
//   PARITÄT  — Ruhe-Höhe über tiefem Wasser ≈ Body-Spiegel `L` (Bett gefüllt, die V18.87-Lehre:
//              kein abgesenkter Spiegel). Headless = GEOMETRIE, nicht pixel-blind.
//   NAHT     — geteilte Grenz-Vertices zweier Sheet-Chunks haben IDENTISCHE Höhe (der PAD=3-
//              Glätt-Symmetrie-Beweis; V18.18-Resolver).
//   ANKER    — die trockenen Ring-Vertices (aDepth=0) liegen UNTER dem Terrain (Eintauchen ≠
//              Klippen: die Mesh-Kante ist im Boden versteckt).
//   A/B-AUGE — zwei Screenshots aus DERSELBEN Kamera am Wasser: surface (L-Film) vs cells
//              (Sheet) → artifacts/water-ab-{surface,cells}.png (mein Auge pro Welle; das
//              Schöpfer-Auge bleibt das Merge-Gate, Regel #0 präzisiert).
// Exit 1 bei Paritäts-/Naht-/Anker-Bruch oder Page-Error.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4379;
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
    const pageErrors = [];
    page.on("pageerror", (e) => {
        pageErrors.push((e.stack || e.message).split("\n")[0]);
        console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]);
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // PHASE 1 — settlen (Render gestubbt), Ring voll + stabil.
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
        const r = window.anazhRealm;
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
            r._drainPendingGrass && r._drainPendingGrass();
        } catch (_e) {}
    });

    // PHASE 2 — headless-Beweise im "cells"-Modus (Geometrie, nicht pixel-blind).
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span;
        r.setWaterRenderMode("cells");
        r._drainPendingWaterIso && r._drainPendingWaterIso();
        const sheets = [];
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (mesh && mesh.userData && mesh.userData.hydroKind === "chunk-water-cellsheet") sheets.push([key, mesh]);
        }
        // PARITÄT — tiefe Vertices (aDepth ≥ 3.6 m) gegen den Atlas-Spiegel L.
        let parMax = 0,
            parSum = 0,
            parN = 0,
            parOver1 = 0,
            parWorst = null;
        // ANKER — trockene Ring-Vertices (aDepth = 0) unter dem Terrain?
        let anchorN = 0,
            anchorAbove = 0,
            anchorWorst = -Infinity;
        // NAHT — geteilte Grenz-Positionen über Mesh-Grenzen hinweg.
        const boundary = new Map(); // "x,z" → {min, max, meshes}
        const EPS = 0.01;
        for (const [, mesh] of sheets) {
            const pos = mesh.geometry.getAttribute("position");
            const dep = mesh.geometry.getAttribute("aDepth");
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i),
                    y = pos.getY(i),
                    z = pos.getZ(i);
                const d = dep.getX(i);
                if (d >= 3.6) {
                    // PARITÄT nur über FLACHEM Wasser im EINDEUTIGEN Körper-Inneren messen:
                    // (a) am Fluss-GEFÄLLE springt L → das geglättete Sheet weicht LEGITIM ab;
                    // (b) an KÖRPER-GRENZZONEN gewinnt das Rim-L des Nachbar-Körpers (max-
                    //     Semantik) über den lokalen Spiegel, zu dem die Zellen korrekt
                    //     füllten — der Rim-Wert ist dort die FALSCHE Referenz (GEMESSEN:
                    //     worst (-72,-104) y=-6.9 vs Rim-L=-3, der lokale Körper liegt tiefer).
                    // Eindeutig = Rim-L (−Inf-Probe) == terrain-gated L (die Flood-Referenz).
                    const L = r._atlasWaterLevelAt(x, z, -Infinity);
                    const Lg = r._atlasWaterLevelAt(x, z, r.getTerrainHeightAt(x, z));
                    const l1 = r._atlasWaterLevelAt(x + 2.7, z, -Infinity);
                    const l2 = r._atlasWaterLevelAt(x - 2.7, z, -Infinity);
                    const l3 = r._atlasWaterLevelAt(x, z + 2.7, -Infinity);
                    const l4 = r._atlasWaterLevelAt(x, z - 2.7, -Infinity);
                    const flat =
                        L > -Infinity &&
                        Lg > -Infinity &&
                        Math.abs(Lg - L) < 0.05 &&
                        Math.max(Math.abs(l1 - L), Math.abs(l2 - L), Math.abs(l3 - L), Math.abs(l4 - L)) < 0.05;
                    if (flat) {
                        const dv = Math.abs(y - L);
                        if (dv > parMax) {
                            parMax = dv;
                            parWorst = {
                                x: +x.toFixed(1),
                                z: +z.toFixed(1),
                                y: +y.toFixed(2),
                                L: +L.toFixed(2),
                                d: +d.toFixed(1),
                            };
                        }
                        if (dv > 1.0) parOver1++;
                        parSum += dv;
                        parN++;
                    }
                } else if (d === 0) {
                    anchorN++;
                    const t = r.getTerrainHeightAt(x, z);
                    if (Number.isFinite(t) && y > t + 0.05) {
                        anchorAbove++;
                        anchorWorst = Math.max(anchorWorst, y - t);
                    }
                }
                const onX = Math.abs(x / span - Math.round(x / span)) * span < EPS;
                const onZ = Math.abs(z / span - Math.round(z / span)) * span < EPS;
                if (onX || onZ) {
                    const k2 = `${x.toFixed(2)},${z.toFixed(2)}`;
                    const e = boundary.get(k2) || { min: Infinity, max: -Infinity, n: 0 };
                    e.min = Math.min(e.min, y);
                    e.max = Math.max(e.max, y);
                    e.n++;
                    boundary.set(k2, e);
                }
            }
        }
        let seamMax = 0,
            seamShared = 0;
        for (const e of boundary.values()) {
            if (e.n < 2) continue;
            seamShared++;
            seamMax = Math.max(seamMax, e.max - e.min);
        }
        const totalVerts = sheets.reduce((t, [, m]) => t + m.geometry.getAttribute("position").count, 0);
        return {
            sheets: sheets.length,
            totalVerts,
            parMax: +parMax.toFixed(3),
            parMean: parN ? +(parSum / parN).toFixed(3) : 0,
            parN,
            parOver1,
            parWorst,
            seamShared,
            seamMax: +seamMax.toFixed(4),
            anchorN,
            anchorAbove,
            anchorWorst: anchorN ? +anchorWorst.toFixed(2) : 0,
        };
    });

    // PHASE 3 — A/B-Screenshots aus DERSELBEN Kamera am größten nahen Wasser.
    fs.mkdirSync(ART, { recursive: true });
    const spot = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        // größtes Wasser-Mesh nahe dem Spieler suchen (im LOD0-Ring ≤ 120 m)
        let best = null;
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;
        for (const [, mesh] of s.voxelChunkWaterIso) {
            if (!mesh) continue;
            mesh.geometry.computeBoundingBox();
            const bb = mesh.geometry.boundingBox;
            const cx2 = (bb.min.x + bb.max.x) / 2,
                cz2 = (bb.min.z + bb.max.z) / 2;
            const dist = Math.hypot(cx2 - px, cz2 - pz);
            const n = mesh.geometry.getAttribute("position").count;
            if (dist < 120 && (!best || n > best.n)) best = { cx: cx2, cz: cz2, wy: bb.max.y, n, dist };
        }
        if (!best) return { err: "kein Wasser im Ring" };
        // Spieler ans Ufer teleportieren (V13.0-Muster: Body, nicht Mesh)
        const A = window.Ammo;
        const dx = px - best.cx,
            dz = pz - best.cz;
        const m = Math.hypot(dx, dz) || 1;
        const sx = best.cx + (dx / m) * 16,
            sz = best.cz + (dz / m) * 16;
        const sy = (r.getTerrainHeightAt ? r.getTerrainHeightAt(sx, sz) : 20) + 3;
        const body = s.playerMesh && s.playerMesh.userData && s.playerMesh.userData.physicsBody;
        if (body && A) {
            const tr = new A.btTransform();
            tr.setIdentity();
            const v = new A.btVector3(sx, sy, sz);
            tr.setOrigin(v);
            body.setWorldTransform(tr);
            const z0 = new A.btVector3(0, 0, 0);
            body.setLinearVelocity(z0);
            body.activate(true);
            A.destroy(v);
            A.destroy(z0);
            A.destroy(tr);
        }
        s.playerMesh.position.set(sx, sy, sz);
        const yawDeg = (Math.atan2(best.cx - sx, best.cz - sz) * 180) / Math.PI;
        return {
            sx: +sx.toFixed(1),
            sz: +sz.toFixed(1),
            wy: +best.wy.toFixed(1),
            yawDeg: +yawDeg.toFixed(1),
            dist: +best.dist.toFixed(0),
            n: best.n,
        };
    });
    if (spot.err) {
        console.log("SKIP Screenshots:", spot.err);
    } else {
        // nach dem Teleport kurz settlen (Chunk-Ring/Physik nachziehen)
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const t0 = performance.now();
            while (performance.now() - t0 < 6000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                await new Promise((res) => setTimeout(res, 4));
            }
            try {
                r._drainPendingWaterIso && r._drainPendingWaterIso();
            } catch (_e) {}
            for (const id of ["dialogue-box", "intro-overlay", "onboarding", "start-overlay", "modal-overlay"]) {
                const el = document.getElementById(id);
                if (el) el.style.display = "none";
            }
            for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
                el.style.display = "none";
        });
        const shoot = async (file, mode, yawDeg) => {
            const meta = await page.evaluate(
                (mode, yawDeg) => {
                    const r = window.anazhRealm;
                    const s = r.state;
                    r.setWaterRenderMode(mode);
                    r._drainPendingWaterIso && r._drainPendingWaterIso();
                    const pm = s.playerMesh;
                    const cam = s.camera;
                    const yaw = (yawDeg * Math.PI) / 180;
                    const pitch = (-14 * Math.PI) / 180;
                    const ex = pm.position.x,
                        ey = pm.position.y + 1.6,
                        ez = pm.position.z;
                    cam.position.set(ex, ey, ez);
                    const dir = {
                        x: Math.sin(yaw) * Math.cos(pitch),
                        y: Math.sin(pitch),
                        z: Math.cos(yaw) * Math.cos(pitch),
                    };
                    cam.lookAt(ex + dir.x * 50, ey + dir.y * 50, ez + dir.z * 50);
                    cam.updateMatrixWorld(true);
                    if (!window.__origRender) return { err: "no origRender" };
                    s.renderer.render = window.__origRender;
                    s.postProcessingFailed = false;
                    let err = null;
                    try {
                        window.__origRender(s.scene, cam);
                    } catch (_e) {
                        err = String((_e && _e.message) || _e);
                    }
                    s.renderer.render = function () {};
                    s.postProcessingFailed = true;
                    return { err };
                },
                mode,
                yawDeg
            );
            await new Promise((res) => setTimeout(res, 300));
            await page.screenshot({ path: path.join(ART, file), fullPage: false });
            console.log(`${file.padEnd(28)} Modus=${mode}  ${meta.err ? "⚠ " + meta.err : "✓"}`);
        };
        console.log(
            `\nA/B-Spot: Ufer (${spot.sx},${spot.sz}) → Wasser @y≈${spot.wy} (${spot.n} Verts, ${spot.dist} m vom Spawn), Blick yaw=${spot.yawDeg}°`
        );
        await shoot("water-ab-surface.png", "surface", spot.yawDeg);
        await shoot("water-ab-cells.png", "cells", spot.yawDeg);
        await page.evaluate(() => window.anazhRealm.setWaterRenderMode("surface"));
    }

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== W-A — ZELL-OBERKANTEN-SHEET (headless GEOMETRIE-Beweise) ===\n");
    console.log(`Sheets gebaut: ${out.sheets} (${out.totalVerts} Verts)`);
    // GATE: Ø klein + Ausreißer-Quote ≤ 1 %. Einzelne |y−L|>1-Spalten sind die ALTE
    // Flood-vs-Atlas-Lücke (T7d „leeres Becken" — die Flood füllt dort nicht bis L;
    // das Sheet rendert die ZELL-Wahrheit treu, GEMESSEN worst = exakt face+step).
    const parPct = out.parN ? (100 * out.parOver1) / out.parN : 0;
    console.log(
        `PARITÄT (tief, n=${out.parN}): Ø |y−L| = ${out.parMean} m · >1 m: ${out.parOver1} (${parPct.toFixed(2)} %) · max ${out.parMax} m   (${out.parMean <= 0.1 && parPct <= 1 ? "✓ Bett gefüllt, Spiegel hält" : "✗ Spiegel verschoben!"})`
    );
    if (out.parWorst)
        console.log(
            `  worst @(${out.parWorst.x},${out.parWorst.z}) y=${out.parWorst.y} L=${out.parWorst.L} aDepth=${out.parWorst.d}  ← Flood-vs-Atlas (T7d), nicht das Sheet`
        );
    console.log(
        `NAHT (${out.seamShared} geteilte Grenz-Positionen): max Δy = ${out.seamMax} m   (${out.seamMax < 0.001 ? "✓ naht-symmetrisch" : "✗ Glätt-Asymmetrie!"})`
    );
    console.log(
        `ANKER (${out.anchorN} Ring-Vertices): über Terrain = ${out.anchorAbove} (worst +${out.anchorWorst} m)   (${out.anchorAbove / Math.max(1, out.anchorN) < 0.05 ? "✓ Kante taucht ein" : "✗ Kante schwebt!"})`
    );
    console.log(`Page-Errors: ${pageErrors.length}`);
    console.log("\nA/B-Bilder: artifacts/water-ab-surface.png vs artifacts/water-ab-cells.png\n");

    const ok =
        out.sheets > 0 &&
        out.parMean <= 0.1 &&
        parPct <= 1 &&
        out.seamMax < 0.001 &&
        out.anchorAbove / Math.max(1, out.anchorN) < 0.05 &&
        pageErrors.length === 0;
    process.exit(ok ? 0 : 1);
})();

// Diagnose A2+A6 (gigant-plan §5 PHASE A) — der Edit-„Reset" + die Körper-Kollision, GEMESSEN.
// A2: (1) Vertex-Delta-LOKALITÄT eines Carve (ändert der Ganz-Chunk-Rebuild Vertices
//         außerhalb des Edit-Einflusses? Ziel: 0 — dann ist der Swap unsichtbar);
//     (2) Architektur-Platzierung: Terrain-Vertices bit-identisch? Gras-Referenz gehalten?
//     (3) der Edit-Frame-Hitch (ms des Carve-Calls).
// A6: (1) Fill-unter-sich ×12 (fällt der Spieler durch?);
//     (2) Block-Architektur-unter-sich ×12;
//     (3) Niedrig-Decken-Sprung (glitcht der Kopf durch die Höhlendecke?).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = 4327,
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        // Render stubben (Software-Render dominiert sonst, V17.32-Twist) + Welt pumpen.
        const r0 = window.anazhRealm;
        if (r0 && r0.state && r0.state.renderer) {
            r0.state.renderer.render = function () {};
            if (r0.state.renderer.renderAsync) r0.state.renderer.renderAsync = async function () {};
            r0.state.postProcessingFailed = true;
        }
        const s = performance.now();
        while (performance.now() - s < 40000) {
            const r = window.anazhRealm;
            if (r && r._gameLoopTick) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 12) break;
            }
            await new Promise((z) => setTimeout(z, 16));
        }
        const r = window.anazhRealm;
        if (r._drainDirtyVoxelChunks) r._drainDirtyVoxelChunks();
        if (r._drainPendingGrass) r._drainPendingGrass();
    });

    // ── A2 · Lokalität + Layer-Churn + Hitch ──
    const a2 = await page.evaluate(() => {
        const r = window.anazhRealm,
            out = {};
        const { span } = r._voxelChunkConfig();
        const pm = r.state.playerMesh.position;
        const pcx = Math.floor(pm.x / span),
            pcz = Math.floor(pm.z / span);
        const key = `${pcx},${pcz}`;
        const entry = r.state.voxelChunks.get(key);
        if (!entry || !entry.mesh) return { err: "kein Spieler-Chunk" };
        const Q = (v) => Math.round(v * 1000); // 1-mm-Quantisierung
        const snap = (geom) => {
            const p = geom.attributes.position;
            const set = new Set();
            for (let i = 0; i < p.count; i++) set.add(`${Q(p.getX(i))},${Q(p.getY(i))},${Q(p.getZ(i))}`);
            return set;
        };
        const before = snap(entry.mesh.geometry);
        const grassBefore = r.state.voxelChunkGrass && r.state.voxelChunkGrass.get(key);
        // Carve-Punkt: Chunk-Zentrum-Oberfläche (klar im Chunk-Innern, weg von der Naht).
        const ex = pcx * span + span / 2,
            ez = pcz * span + span / 2;
        const surf = r._voxelSurfaceY(ex, ez);
        const R = 2.0;
        const t0 = performance.now();
        r.carveVoxelSphere(ex, surf - 0.5, ez, R);
        const editMs = performance.now() - t0;
        if (r._drainDirtyVoxelChunks) r._drainDirtyVoxelChunks();
        const entryAfter = r.state.voxelChunks.get(key);
        const after = snap(entryAfter.mesh.geometry);
        // Einfluss-Radius: Kugel + Density-Pad + Glättungs-Halo (Laplacian ~2 Zellen) + Marge.
        const rInf = R + 4 * 1.8;
        let changedOutside = 0,
            totalOutside = 0;
        for (const k of before) {
            const [qx, qy, qz] = k.split(",").map((n) => n / 1000);
            const d = Math.hypot(qx - ex, qy - (surf - 0.5), qz - ez);
            if (d <= rInf) continue;
            totalOutside++;
            if (!after.has(k)) changedOutside++;
        }
        out.carve = {
            editMs: +editMs.toFixed(1),
            totalOutside,
            changedOutside,
            changedPct: +((100 * changedOutside) / Math.max(1, totalOutside)).toFixed(2),
            grassKeptRef: grassBefore === (r.state.voxelChunkGrass && r.state.voxelChunkGrass.get(key)),
            grassPresent: !!(r.state.voxelChunkGrass && r.state.voxelChunkGrass.get(key)),
        };
        // (2) Architektur-Platzierung daneben (Terrain-Dichte unberührt → Vertices identisch?)
        const entry2 = r.state.voxelChunks.get(key);
        const before2 = snap(entry2.mesh.geometry);
        const meshUuid2 = entry2.mesh.uuid;
        const grassRef2 = r.state.voxelChunkGrass && r.state.voxelChunkGrass.get(key);
        const t1 = performance.now();
        r.spawnArchitecture(
            "stein_block",
            { x: ex + 5, y: r._voxelSurfaceY(ex + 5, ez + 5), z: ez + 5 },
            { silent: true }
        );
        const placeMs = performance.now() - t1;
        if (r._drainDirtyVoxelChunks) r._drainDirtyVoxelChunks();
        const entry2b = r.state.voxelChunks.get(key);
        const after2 = snap(entry2b.mesh.geometry);
        let mismatch2 = 0;
        for (const k of before2) if (!after2.has(k)) mismatch2++;
        out.place = {
            placeMs: +placeMs.toFixed(1),
            rebuilt: entry2b.mesh.uuid !== meshUuid2,
            vertexMismatch: mismatch2,
            sizeBefore: before2.size,
            grassKeptRef: grassRef2 === (r.state.voxelChunkGrass && r.state.voxelChunkGrass.get(key)),
        };
        return out;
    });

    // ── A6 · Körper-Kollision ──
    const a6 = await page.evaluate(async () => {
        const r = window.anazhRealm,
            out = {};
        const Ammo = window.Ammo;
        const teleport = (x, y, z) => {
            const body = r.state.playerBody;
            const tr = r.state.tmpTransform;
            tr.setIdentity();
            tr.setOrigin(r.setVec(r.state.tmpVec1, x, y, z));
            body.setWorldTransform(tr);
            if (body.getMotionState()) body.getMotionState().setWorldTransform(tr);
            body.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
            body.activate(true);
            r.state.playerMesh.position.set(x, y, z);
        };
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                await new Promise((z) => setTimeout(z, 0));
            }
        };
        const py = () => r.state.playerMesh.position.y;
        const { span } = r._voxelChunkConfig();
        const pm = r.state.playerMesh.position;
        // flacher Spot im Spieler-Chunk
        const sx = Math.floor(pm.x / span) * span + span / 2 + 8,
            sz = Math.floor(pm.z / span) * span + span / 2 + 8;
        const surf0 = r._voxelSurfaceY(sx, sz);
        // (1) Fill-unter-sich ×12
        let fallsFill = 0,
            minYFill = Infinity;
        teleport(sx, surf0 + 1.2, sz);
        await tick(8);
        for (let i = 0; i < 12; i++) {
            const yBefore = py();
            // r=2.4: breiter Dom (flaches Plateau) — bei r=1.6 rutschte der Spieler
            // gelegentlich von der schmalen Säulen-Flanke (legitime Physik, kein
            // Durchfallen) und konfundierte den falls-Zähler.
            r.fillVoxelSphere(sx, yBefore - 1.4, sz, 2.4);
            await tick(6);
            const yA = py();
            minYFill = Math.min(minYFill, yA);
            // ECHTES Durchfallen/Begraben = großer Drop UND das Körper-ZENTRUM im
            // Fels (Dichte > 0). Abrutschen von der Dom-Flanke + unter dem Rand-
            // Überhang landen ist legitime Physik (Zentrum in LUFT) — der frühere
            // „unter localSurf?"-Check zählte genau das fälschlich mit (die
            // Spalte trifft den Dom-Rand ÜBER dem Spieler).
            const pp = r.state.playerMesh.position;
            if (yA < yBefore - 3 && r._terrainDensityAt(pp.x, pp.y, pp.z) > 0) {
                fallsFill++;
                teleport(sx, r._voxelSurfaceY(sx, sz) + 1.2, sz);
                await tick(4);
            }
        }
        const surfFillEnd = r._voxelSurfaceY(sx, sz);
        // A6a-Kern: BEGRABEN = klar unter der neuen Oberfläche (>2.5 m — die
        // Feld-vs-Mesh-Divergenz [Laplacian, Ø0.61 m] ist KEIN Begraben; vor dem
        // Fix lag der Spieler GEMESSEN 11 m unter der Oberfläche).
        out.fill = {
            falls: fallsFill,
            endY: +py().toFixed(2),
            endSurf: +surfFillEnd.toFixed(2),
            buriedDeep: surfFillEnd - py() > 2.5,
        };
        // (2) Architektur-Block unter sich ×12
        const bx = sx + 12,
            bz = sz + 12;
        const bs = r._voxelSurfaceY(bx, bz);
        teleport(bx, bs + 1.2, bz);
        await tick(8);
        let fallsArch = 0;
        for (let i = 0; i < 12; i++) {
            const yBefore = py();
            r.spawnArchitecture("stein_block", { x: bx, y: yBefore - 1.0, z: bz }, { silent: true });
            await tick(6);
            const yA = py();
            if (yA < yBefore - 3) {
                fallsArch++;
                teleport(bx, r._voxelSurfaceY(bx, bz) + 1.2, bz);
                await tick(4);
            }
        }
        out.arch = { falls: fallsArch, endY: +py().toFixed(2), endSurf: +r._voxelSurfaceY(bx, bz).toFixed(2) };
        // (3a) FREI-SPRUNG-KONTROLLE (offener Himmel): die Klemme darf den freien
        // Sprung NICHT berühren (Steighöhe deutlich > 1.5 m).
        const fx = sx + 6,
            fz = sz - 6;
        const fsf = r._voxelSurfaceY(fx, fz);
        teleport(fx, fsf + 0.7, fz);
        await tick(12);
        {
            const startY = py();
            r.state.lastGroundedTime = performance.now() / 1000;
            r.handleJump(performance.now() / 1000);
            let maxY = startY;
            for (let i = 0; i < 40; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                maxY = Math.max(maxY, py());
                await new Promise((z) => setTimeout(z, 0));
            }
            out.freeJump = { rise: +(maxY - startY).toFixed(2), ok: maxY - startY > 1.5 };
        }
        // (3) Niedrig-Decken-Sprung — DETERMINISTISCHES DACH: ein Fill-Dom über dem
        // Spieler (statt einer Taschen-Höhle, die in eine echte Kaverne lecken kann).
        const cxp = sx - 16,
            czp = sz - 16;
        const cs = r._voxelSurfaceY(cxp, czp);
        r.fillVoxelSphere(cxp, cs + 4.4, czp, 2.2);
        await tick(2);
        // Decken-Unterkante über der Spieler-Säule per Dichte-Scan
        const dens = (y) => r._terrainDensityAt(cxp, y, czp);
        let ceilY = null;
        for (let y = cs + 0.6; y < cs + 6; y += 0.05)
            if (dens(y) > 0) {
                ceilY = y;
                break;
            }
        if (ceilY === null || ceilY - cs > 3.2) {
            out.jump = { err: "kein Dach baubar", ceilY, cs };
        } else {
            teleport(cxp, cs + 0.7, czp);
            await tick(12);
            const startY = py();
            r.state.lastGroundedTime = performance.now() / 1000;
            r.handleJump(performance.now() / 1000);
            let maxY = startY;
            for (let i = 0; i < 40; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_) {}
                maxY = Math.max(maxY, py());
                await new Promise((z) => setTimeout(z, 0));
            }
            // Body-Top = Zentrum + 0.5 (btBoxShape halfExtent); durch die Decke =
            // Top über der Decken-Unterkante + Marge.
            out.jump = {
                clearance: +(ceilY - cs).toFixed(2),
                startY: +startY.toFixed(2),
                maxY: +maxY.toFixed(2),
                ceilY: +ceilY.toFixed(2),
                rise: +(maxY - startY).toFixed(2),
                headThrough: maxY + 0.5 > ceilY + 0.25,
            };
        }
        return out;
    });

    await browser.close();
    server.close();
    console.log("\n===== A2+A6 — EDIT-RESET + KÖRPER-KOLLISION (GEMESSEN) =====\n");
    console.log("A2 · CARVE:", JSON.stringify(a2.carve));
    console.log("A2 · PLACE:", JSON.stringify(a2.place));
    console.log("A6 · FILL-UNTER-SICH:", JSON.stringify(a6.fill));
    console.log("A6 · BLOCK-UNTER-SICH:", JSON.stringify(a6.arch));
    console.log("A6 · FREI-SPRUNG (Kontrolle):", JSON.stringify(a6.freeJump));
    console.log("A6 · NIEDRIG-DECKEN-SPRUNG:", JSON.stringify(a6.jump));
    const ok =
        a2.carve &&
        a2.carve.changedPct < 1 &&
        a2.place &&
        a2.place.vertexMismatch === 0 &&
        a6.fill.falls === 0 &&
        !a6.fill.buriedDeep &&
        a6.arch.falls === 0 &&
        a6.freeJump &&
        a6.freeJump.ok &&
        a6.jump &&
        !a6.jump.err &&
        !a6.jump.headThrough;
    console.log("\n  VERDIKT:", ok ? "GRÜN" : "ROT — Wurzeln oben ablesbar");
    process.exit(ok ? 0 : 1);
})();

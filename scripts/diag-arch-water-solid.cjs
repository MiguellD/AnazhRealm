// Diagnose V13.10 — Strukturen unter Wasser + nicht-solide (Schöpfer-Befund
// V13.9.1): Felsbogen/Felsturm/Genesis-Plattform stehen oft im Wasser UND
// sind nicht mehr solide (kein Abspringen); Bäume/Kristall-Geode nicht.
// Hypothese-Test (messen vor schneiden, V9.96-Disziplin): vergleicht pro
// Bauplan-Typ — blockerAABBs vorhanden? collision-Body vorhanden? Cells als
// SOLID gestempelt? Wasser-Cells im Footprint? Alles headless deterministisch
// lesbar (kein anazhRealm.js-Touch). Pixel braucht es hier NICHT — Solidität
// + Stempel + Zellen sind Daten.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4326;
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
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
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Welt hochfahren bis Spieler + Chunks da sind.
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
    });

    const result = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const out = { types: {}, notes: [] };

        // Spieler-Position als Spawn-Anker (nah → im Collision-Radius).
        const pm = s.playerMesh.position;
        const types = ["felsbogen", "felsturm", "start_plattform", "baum_eiche", "kristall_geode"];

        // Jeden Typ in einem eigenen Abstand um den Spieler spawnen (nah, < colRadius).
        let i = 0;
        const spawned = {};
        for (const t of types) {
            const ang = (i / types.length) * Math.PI * 2;
            const px = pm.x + Math.cos(ang) * 8;
            const pz = pm.z + Math.sin(ang) * 8;
            // Boden-Höhe an der Stelle (spawnArchitecture zieht intern 0.5 ab).
            const gy = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(px, pz) : pm.y;
            let entry = null;
            try {
                entry = r.spawnArchitecture(t, { x: px, y: gy + 0.5, z: pz }, { silent: true });
            } catch (e) {
                out.notes.push(`spawn ${t} threw: ${(e && e.message) || e}`);
            }
            spawned[t] = entry;
            i++;
        }

        // Einen Tick laufen lassen, damit Collision-Pass + Remesh greifen.
        for (let f = 0; f < 30; f++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* listener */
            }
        }
        // Collision explizit sicherstellen (falls Budget den Pass verzögerte).
        for (const t of types) {
            const e = spawned[t];
            if (e && typeof r._archEnsureCollision === "function") {
                try {
                    r._archEnsureCollision(e);
                } catch (_e) {
                    /* ignore */
                }
            }
        }

        const cfg = r._voxelChunkConfig(0);
        const { dim, step } = cfg;
        const idx = (ii, k, j) => ii + k * dim + j * dim * dim;

        for (const t of types) {
            const e = spawned[t];
            const bp = s.blueprints && s.blueprints[t];
            const info = {
                spawned: !!e,
                instanced: e ? !!e.instanced : null,
                parts: bp && Array.isArray(bp.parts) ? bp.parts.length : 0,
                partMaterials: bp && Array.isArray(bp.parts) ? bp.parts.map((p) => p.material) : [],
                solidPartCount: 0,
                blockerAABBs: e && e.blockerAABBs ? e.blockerAABBs.length : 0,
                hasCollision: !!(e && e.collision),
                hasMesh: !!(e && e.mesh),
                rendered: e && typeof r._archIsRendered === "function" ? r._archIsRendered(e) : null,
                // Cell-Stempel: liegen SOLID-Cells im Footprint des Bauplans?
                stampedSolidCells: 0,
                waterCellsInFootprint: 0,
            };
            // Solid-Part-Count via _isPartSolid
            if (bp && Array.isArray(bp.parts) && typeof r._isPartSolid === "function") {
                for (const p of bp.parts) if (r._isPartSolid(p)) info.solidPartCount++;
            }
            // Footprint-Scan: über die blockerAABBs (oder Position als Fallback)
            // die SOLID- + WATER-Cells im betroffenen Chunk zählen.
            const aabbs = (e && e.blockerAABBs) || [];
            if (aabbs.length && e.position) {
                for (const [key, entry] of s.voxelChunks) {
                    if (!entry || !entry.waterCells) continue;
                    const parts = key.split(",");
                    const cx = parseInt(parts[0], 10);
                    const cz = parseInt(parts[1], 10);
                    const span = dim * step;
                    const ox = cx * span - span / 2;
                    const oz = cz * span - span / 2;
                    const cells = entry.waterCells;
                    // Nur Chunks, die einen AABB schneiden.
                    let hit = false;
                    for (const a of aabbs) {
                        if (a.maxX < ox || a.minX > ox + span) continue;
                        if (a.maxZ < oz || a.minZ > oz + span) continue;
                        hit = true;
                        break;
                    }
                    if (!hit) continue;
                    for (let n = 0; n < cells.length; n++) {
                        if (cells[n] === STATE.SOLID) info.stampedSolidCells++;
                        else if (cells[n] === STATE.WATER) info.waterCellsInFootprint++;
                    }
                }
            }
            out.types[t] = info;
        }

        // Globaler Kontext.
        out.architectureCollisionRadius = s.architectureCollisionRadius;
        out.architectureCullingRadius = s.architectureCullingRadius;
        out.playerPos = { x: pm.x, y: pm.y, z: pm.z };
        out.voxelChunks = s.voxelChunks ? s.voxelChunks.size : 0;
        return out;
    });

    console.log("\n=== DIAG: Architektur — Solidität + Wasser-Stempel ===\n");
    console.log(
        `Spieler @ (${result.playerPos.x.toFixed(1)}, ${result.playerPos.z.toFixed(1)}), ` +
            `Chunks=${result.voxelChunks}, colRadius=${result.architectureCollisionRadius}, ` +
            `cullRadius=${result.architectureCullingRadius}`,
    );
    if (result.notes.length) console.log("Notes:", result.notes.join(" | "));
    console.log("");
    const pad = (s, n) => String(s).padEnd(n);
    console.log(
        pad("Typ", 17) +
            pad("inst", 6) +
            pad("parts", 6) +
            pad("solidP", 7) +
            pad("blockAABB", 10) +
            pad("collis", 7) +
            pad("mesh", 6) +
            pad("rend", 6) +
            pad("SOLIDcells", 11) +
            pad("WATERft", 8),
    );
    for (const t of Object.keys(result.types)) {
        const x = result.types[t];
        console.log(
            pad(t, 17) +
                pad(x.instanced, 6) +
                pad(x.parts, 6) +
                pad(x.solidPartCount, 7) +
                pad(x.blockerAABBs, 10) +
                pad(x.hasCollision, 7) +
                pad(x.hasMesh, 6) +
                pad(x.rendered, 6) +
                pad(x.stampedSolidCells, 11) +
                pad(x.waterCellsInFootprint, 8),
        );
    }
    console.log("\nMaterialien je Typ:");
    for (const t of Object.keys(result.types)) {
        console.log(`  ${pad(t, 17)} [${result.types[t].partMaterials.join(", ")}]`);
    }

    await browser.close();
    server.close();
})();

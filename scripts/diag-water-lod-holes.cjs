// V18.117 — S-Befund „durch das LOD sind noch Löcher im Wasser; Terrain wird
// vereinfacht geladen, das Meerwasser folgt nicht" (auf den diag-mouth-Drohnen-
// Bildern sichtbar: helle Flächen im Meer). MISST pro Chunk im Ring:
//   lod · atlasSagtWasser (_voxelChunkHasAnyWater) · nasse Zellen · Sheet-Status
// → die Loch-Karte nach LOD. Plus Welt-Punkt-Probe: SOLL Wasser (Atlas-Spiegel
// über Terrain) vs IST Sheet-Vertex in der Nähe.
//   node scripts/diag-water-lod-holes.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4387;
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
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
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
    });

    // Zur Meer-Mündung (Wasser-reiche Gegend) + settlen.
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const h = s.hydrosphere || {};
        const seaRiver = (h.rivers || []).find((rv) => rv.mouth === "sea" && rv.points && rv.points.length > 3);
        const m = seaRiver ? seaRiver.points[seaRiver.points.length - 1] : { x: 0, z: 0 };
        const body = s.playerBody;
        if (body && s.tmpTransform && typeof Ammo !== "undefined") {
            s.tmpTransform.setIdentity();
            s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, m.x, (s.waterLevel || 0) + 30, m.z));
            body.setWorldTransform(s.tmpTransform);
            body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
            body.activate(true);
        }
        const t0 = performance.now();
        let lastSize = -1,
            stable = 0;
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
            if (stable > 120) break;
            await new Promise((res) => setTimeout(res, 3));
        }
        try {
            r._drainPendingWaterIso && r._drainPendingWaterIso();
        } catch (_e) {}
    });

    const rep = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const rows = [];
        const lodStat = {};
        for (const [key, entry] of s.voxelChunks.entries()) {
            if (!entry) continue;
            const lod = entry.lod || 0;
            const [pcx, pcz] = key.split(",").map(Number);
            const atlasWater =
                typeof r._voxelChunkHasAnyWater === "function" ? !!r._voxelChunkHasAnyWater(pcx, pcz) : null;
            let wetCells = 0;
            if (entry.waterCells) {
                const wc = entry.waterCells;
                const W =
                    (window.AnazhRealm && window.AnazhRealm.CELL_STATE && window.AnazhRealm.CELL_STATE.WATER) || 1;
                for (let i = 0; i < wc.length; i++) if (wc[i] === W) wetCells++;
            }
            const sheet = s.voxelChunkWaterIso ? s.voxelChunkWaterIso.get(key) : undefined;
            const sheetState = sheet === undefined ? "FEHLT" : sheet === null ? "null" : "da";
            const k = `lod${lod}`;
            if (!lodStat[k]) lodStat[k] = { chunks: 0, atlasWater: 0, cells0: 0, sheetMissing: 0, sheetNull: 0 };
            lodStat[k].chunks++;
            if (atlasWater) {
                lodStat[k].atlasWater++;
                if (!entry.waterCells || wetCells === 0) lodStat[k].cells0++;
                if (sheet === undefined) lodStat[k].sheetMissing++;
                if (sheet === null) lodStat[k].sheetNull++;
                if (!entry.waterCells || wetCells === 0 || sheet === undefined || sheet === null)
                    rows.push({ key, lod, wetCells, sheetState, hasCells: !!entry.waterCells });
            } else if (atlasWater === false && entry.waterCells) {
                // Gegenprobe: Chunks MIT Zellen, die das Gate heute verneint.
                let wc2 = 0;
                const W2 =
                    (window.AnazhRealm && window.AnazhRealm.CELL_STATE && window.AnazhRealm.CELL_STATE.WATER) || 1;
                for (let i = 0; i < entry.waterCells.length; i++) if (entry.waterCells[i] === W2) wc2++;
                if (wc2 > 0) rows.push({ key, lod, wetCells: wc2, sheetState: "gate=false!", hasCells: true });
            }
        }
        // Punkt-Probe: Raster ums Spieler-Umfeld — SOLL-Ozean (Terrain unter wl)
        // ohne Sheet-Vertex in 4 m.
        const pm = s.playerMesh.position;
        const wl = s.waterLevel || 0;
        const verts = [];
        for (const mesh of (s.voxelChunkWaterIso || new Map()).values()) {
            if (!mesh || !mesh.geometry) continue;
            const pos = mesh.geometry.getAttribute("position");
            for (let i = 0; i < pos.count; i++) verts.push([pos.getX(i), pos.getZ(i)]);
        }
        let soll = 0,
            loch = 0,
            mantel = 0;
        const lochPts = [];
        // DURCHSTICH-Zählung: der GERENDERTE LOD-Boden (surfMap = Mesh-Wahrheit
        // des Chunks bei SEINEM lod) erreicht/übersteigt den Wasser-Spiegel,
        // obwohl die LOD0-Wahrheit klar darunter liegt → der vereinfachte
        // Meeresboden sticht durchs Meer (DH-#606-Klasse).
        const pierce = { lod0: 0, lod1: 0, lod2p: 0 };
        let pierceMax = -Infinity;
        const piercePts = [];
        const lochXZ = [];
        for (let dz = -320; dz <= 320; dz += 8) {
            for (let dx = -320; dx <= 320; dx += 8) {
                const x = pm.x + dx;
                const z = pm.z + dz;
                const ty = r.getTerrainHeightAt(x, z);
                if (!Number.isFinite(ty) || ty > wl - 0.8) continue; // SOLL: klar unter Spiegel
                {
                    // Nur die RING-Pflicht messen: jenseits gestreamter Chunks
                    // deckt der B2-Mantel (wl−3-Meer-Platte) — keine Sheet-Pflicht.
                    const spanP = r._voxelChunkConfig(0).span;
                    const pe = s.voxelChunks.get(`${Math.floor(x / spanP)},${Math.floor(z / spanP)}`);
                    if (!pe || pe.empty) {
                        mantel++;
                        continue;
                    }
                }
                soll++;
                {
                    const { span } = r._voxelChunkConfig(0);
                    const ccx = Math.floor(x / span);
                    const ccz = Math.floor(z / span);
                    const e2 = s.voxelChunks.get(`${ccx},${ccz}`);
                    if (e2) {
                        const rs = r._chunkSurfaceAt(e2, ccx, ccz, x, z);
                        if (Number.isFinite(rs) && rs !== null && rs > wl - 0.2) {
                            const lk = (e2.lod || 0) === 0 ? "lod0" : e2.lod === 1 ? "lod1" : "lod2p";
                            pierce[lk]++;
                            const over = rs - ty;
                            if (over > pierceMax) pierceMax = over;
                            if (piercePts.length < 10)
                                piercePts.push(
                                    `(${x | 0},${z | 0}) lod=${e2.lod || 0} renderSurf=${rs.toFixed(1)} echt=${ty.toFixed(1)} (+${over.toFixed(1)})`
                                );
                        }
                    }
                }
                let near = false;
                for (let i = 0; i < verts.length; i++) {
                    const ddx = verts[i][0] - x;
                    const ddz = verts[i][1] - z;
                    if (ddx * ddx + ddz * ddz < 16) {
                        near = true;
                        break;
                    }
                }
                if (!near) {
                    loch++;
                    lochXZ.push([x, z]);
                    if (lochPts.length < 12) {
                        // Spalten-Sektion: Chunk + Atlas + Zellen-Säule.
                        const { span, dim, step, dimY, floorDrop } = r._voxelChunkConfig(0);
                        const ccx = Math.floor(x / span);
                        const ccz = Math.floor(z / span);
                        const e2 = s.voxelChunks.get(`${ccx},${ccz}`);
                        const aw =
                            typeof r._atlasWaterLevelAt === "function" ? r._atlasWaterLevelAt(x, z, -Infinity) : null;
                        let colWet = 0;
                        if (e2 && e2.waterCells) {
                            const base = s.terrainBaseHeight || 0;
                            const oy = base - floorDrop;
                            const ci = Math.max(0, Math.min(dim - 1, Math.floor((x - ccx * span) / step)));
                            const ck = Math.max(0, Math.min(dim - 1, Math.floor((z - ccz * span) / step)));
                            for (let j = 0; j < dimY; j++)
                                if (e2.waterCells[ci + ck * dim + j * dim * dim] === 1) colWet++;
                        }
                        lochPts.push(
                            `(${x | 0},${z | 0})→chunk(${ccx},${ccz}) ${e2 ? `lod=${e2.lod || 0} colWet=${colWet}` : "CHUNK FEHLT"} atlasL=${aw === null ? "null" : aw === -Infinity ? "-Inf" : aw.toFixed(1)} terr=${ty.toFixed(1)}`
                        );
                    }
                }
            }
        }
        // LOCH-MARKER in die Szene (rote Säulen am Spiegel) — der Pixel-Beweis.
        if (window.THREE && lochXZ.length) {
            const g = new THREE.BoxGeometry(5, 1.2, 5);
            const mmat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
            for (const [mx, mz] of lochXZ) {
                const mk = new THREE.Mesh(g, mmat);
                mk.position.set(mx, wl + 0.8, mz);
                s.scene.add(mk);
            }
        }
        return {
            lodStat,
            rows: rows.slice(0, 25),
            soll,
            loch,
            lochPts,
            pierce,
            pierceMax,
            piercePts,
            mantel,
            player: { x: pm.x | 0, z: pm.z | 0 },
        };
    });

    console.log(`Spieler @(${rep.player.x},${rep.player.z})`);
    console.log("\nPro LOD (nur Atlas-Wasser-Chunks):");
    for (const [k, v] of Object.entries(rep.lodStat))
        console.log(
            `  ${k}: chunks=${v.chunks} atlasWater=${v.atlasWater} → Zellen-leer=${v.cells0} Sheet-FEHLT=${v.sheetMissing} Sheet-null=${v.sheetNull}`
        );
    if (rep.rows.length) {
        console.log("\nVerdächtige Wasser-Chunks (Atlas sagt Wasser, aber leer/ohne Sheet):");
        for (const row of rep.rows)
            console.log(
                `  ${row.key} lod=${row.lod} wetCells=${row.wetCells} hasCells=${row.hasCells} sheet=${row.sheetState}`
            );
    }
    console.log(
        `\nPunkt-Probe (Raster 640×640 m @8 m): SOLL-Ozean-Punkte-im-Ring=${rep.soll}  LOCH (kein Sheet-Vertex in 4 m)=${rep.loch}  [jenseits Ring → Mantel: ${rep.mantel}]` +
            (rep.lochPts.length ? `\n  Loch-Beispiele: ${rep.lochPts.join("\n  ")}` : "")
    );
    console.log(
        `\nDURCHSTICH (gerenderter LOD-Boden ≥ Spiegel−0.2 auf SOLL-Wasser): lod0=${rep.pierce.lod0} lod1=${rep.pierce.lod1} lod2+=${rep.pierce.lod2p}  maxÜber=${Number.isFinite(rep.pierceMax) ? rep.pierceMax.toFixed(1) : "—"}` +
            (rep.piercePts.length ? `\n  ${rep.piercePts.join("\n  ")}` : "")
    );
    // Marker-Drohnen-Shot: wo liegen die Löcher im Bild?
    await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        for (const el of document.querySelectorAll(".overlay, .modal, .drawer, #chat-console"))
            el.style.display = "none";
        document.body.classList.add("hud-hidden");
        s.weather = "sunny";
        s.timeOfDay = 0.5;
        if (typeof r._applyDayNightToScene === "function") r._applyDayNightToScene();
        const pm = s.playerMesh.position;
        const ax = pm.x;
        const az = pm.z;
        // Body ÜBER Wasser + hinter die Kamera (playerEyesUnderwater-Fog +
        // Avatar-vor-der-Linse, die diag-mouth-Lehren).
        const body = s.playerBody;
        if (body && s.tmpTransform && typeof Ammo !== "undefined") {
            s.tmpTransform.setIdentity();
            s.tmpTransform.setOrigin(r.setVec(s.tmpVec1, ax, (s.waterLevel || 0) + 80, az + 120));
            body.setWorldTransform(s.tmpTransform);
            body.setLinearVelocity(r.setVec(s.tmpVec2, 0, 0, 0));
            body.activate(true);
        }
        try {
            r._gameLoopTick(performance.now());
        } catch (_e) {}
        // Diagnose-Blick: der A5-Fog deckt ab der Ring-Kante (~194 m) alles —
        // fürs Daten↔Pixel-Bild temporär strecken (nur dieser Shot).
        if (s.scene.fog) {
            s.scene.fog.near = 600;
            s.scene.fog.far = 3000;
        }
        const cam = s.camera;
        cam.position.set(ax, (s.waterLevel || 0) + 60, az + 40);
        cam.lookAt(ax, s.waterLevel || 0, az - 260);
        cam.updateMatrixWorld(true);
        if (window.__origRender) {
            s.renderer.render = window.__origRender;
            s.postProcessingFailed = true;
            try {
                r._loopRender(performance.now());
                r._loopRender(performance.now());
                r._loopRender(performance.now());
            } catch (_e) {}
            s.renderer.render = function () {};
        }
    });
    await new Promise((res) => setTimeout(res, 300));
    fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
    await page.screenshot({ path: path.join(root, "artifacts", "water-lod-holes-marked.png") });
    console.log("  Shot: artifacts/water-lod-holes-marked.png (rote Säulen = gemessene Löcher)");
    const pierceTotal = rep.pierce.lod0 + rep.pierce.lod1 + rep.pierce.lod2p;
    const bad =
        rep.soll > 20 && (rep.loch / Math.max(1, rep.soll) > 0.05 || pierceTotal / Math.max(1, rep.soll) > 0.03);
    await browser.close();
    server.close();
    console.log(bad ? "\nDIAG: LÖCHER REPRODUZIERT (exit 1)" : "\nDIAG: sauber (exit 0)");
    process.exit(bad ? 1 : 0);
})();

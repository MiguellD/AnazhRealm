// Diagnose V17.118-Reflexion — der ECHTE Gebäude-Wasser-Blob (die stale
// Nachbar-Iso), nachdem V17.119/.120 als Nullnummer reverted wurden.
//
// Schöpfer-Befund (seit 50+ Versionen, roadmap §1.4): „der Schatten/Blob
// klebt an den Gebäuden, das Wasser klettert die Strukturen hoch." Mein
// V17.120-Mess-FEHLER: ich maß nur den EIGENEN Chunk des Gebäudes
// (`phantomInAABB=0`, korrekt) und schloss „also Render, schick ein Foto".
//
// Die WAHRHEIT (im Code verifiziert): der Wasser-Iso-Mesher (`cellClass`-OOB)
// liest die 8 NACHBARN (Achsen + Diagonalen), aber `_finalizeVoxelChunkBuild`
// re-enqueued nach einem Rebuild nur die 4 ACHSEN-Nachbarn. Der Arch-Spawn
// (`_remeshVoxelChunksAround skirt=0`) markiert nur den Footprint dirty. → die
// DIAGONAL-Nachbar-Iso bleibt auf dem Vor-Stempel-State stehen = Phantom-Wasser
// an der Struktur-Ecke, das sich NICHT selbst heilt.
//
// Diese Diagnose BEWEIST das headless (deterministisch, kein Pixel nötig) +
// ist seit V18.0 das exit-codierte REGRESSIONS-GATE (exit 1, wenn der Blob
// zurückkehrt):
//   Teil A — die STRUKTUR-LÜCKE: ein echter forceSync-Rebuild, `_enqueueWaterIso`
//            instrumentiert → welche Nachbarn re-enqueued werden. NACH V18.0:
//            ALLE 8 (Achsen + Diagonalen) → ungeheilte Wasser-Diagonalen = 0.
//   Teil B — die DEPENDENZ: ein Wasser-Eck-Stempel (faithful zu
//            `_stampArchitectureSolidCellsInto`) → hängt die Diagonal-Iso vom
//            Nachbar-Eck ab.
//   Teil C — der ECHTE Blob: ein felsturm in den nassesten NAHEN Chunk gespawnt;
//            WATER im Gebäude (Transient) + stale Nachbar-Iso → NACH V18.0 = 0
//            (89→0; der forceSync-Gegenprobe-Schutz trennt Transient vom Loch).
//   Teil D — der FERNE Spawn (der V17.118-Transient-Trigger): ein felsturm an
//            einem Wasser-Chunk >6 Chunks draussen (async-Rebuild-Pfad) →
//            WATER im Gebäude + stale Iso = 0 (der Sync-Footprint-Fix hält fern).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4339;
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

    // Welt hochfahren bis Spieler + viele Chunks da sind (Wasser-Chunks nötig).
    await page.evaluate(async () => {
        // V17.32-Lehre: der swiftshader-Render ist ~2,5 s/Frame — diese Diagnose
        // misst NUR Daten (Zellen/Iso-Vertices/Queue, pixel-blind) → renderer.render
        // stubben, sonst läuft das Pumpen in den Timeout.
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function")
                    r.state.renderer.renderAsync = function () {
                        return Promise.resolve();
                    };
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 4));
        }
        // Wasser-Iso-Queue leerpumpen, damit alle Iso-Meshes präsent sind.
        const r = window.anazhRealm;
        for (let f = 0; f < 60; f++) {
            try {
                r._tickPendingWaterIso(64);
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* ignore */
            }
        }
    });

    const result = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const out = { notes: [], partA: {}, partB: {} };
        const cfg = r._voxelChunkConfig(0);
        const { dim, dimY, step, span } = cfg;
        const idx = (i, k, j) => i + k * dim + j * dim * dim;
        const isoMesh = (key) => s.voxelChunkWaterIso && s.voxelChunkWaterIso.get(key);
        const isoCount = (key) => {
            const m = isoMesh(key);
            return m && m.geometry && m.geometry.attributes.position ? m.geometry.attributes.position.count : null;
        };

        // ---------- Teil A — die Struktur-Lücke, ISOLIERT ----------
        // V17.118-Reflexion-Mess-FEHLER (mein erster Lauf): den Recorder über 60
        // Ticks laufen lassen → das gleichzeitige Streaming anderer Chunks
        // verschmutzte die Zählung. JETZT isoliert: EIN forceSync-Rebuild eines
        // Wasser-Chunks (synchron, ein Aufruf, kein Streaming dazwischen) → der
        // Recorder fängt NUR die Finalize-Re-Enqueue DIESES Chunks.
        let waterKey = null;
        for (const [key, e] of s.voxelChunks) {
            if (e && e.waterCells && isoCount(key) != null) {
                waterKey = key;
                break;
            }
        }
        const enqueued = [];
        const origEnqueue = r._enqueueWaterIso.bind(r);
        r._enqueueWaterIso = (cx, cz) => {
            enqueued.push(`${cx},${cz}`);
            return origEnqueue(cx, cz);
        };
        if (s.pendingWaterIso) s.pendingWaterIso.clear();
        let rebuiltKey = null;
        if (waterKey) {
            const [cx, cz] = waterKey.split(",").map(Number);
            rebuiltKey = waterKey;
            try {
                r._rebuildVoxelChunk(cx, cz, null, { forceSync: true });
            } catch (e) {
                out.notes.push(`rebuild ${waterKey} threw: ${(e && e.message) || e}`);
            }
        }
        r._enqueueWaterIso = origEnqueue;
        let axisN = 0;
        let diagN = 0;
        if (rebuiltKey) {
            const [fx, fz] = rebuiltKey.split(",").map(Number);
            for (const k of new Set(enqueued)) {
                if (k === rebuiltKey) continue;
                const [ex, ez] = k.split(",").map(Number);
                const dx = Math.abs(ex - fx);
                const dz = Math.abs(ez - fz);
                if (dx + dz === 1) axisN++;
                else if (dx === 1 && dz === 1) diagN++;
            }
        }
        // Die WASSER-tragenden Diagonalen, die die Iso DES rebuilt-Chunks via OOB
        // LIEST (cellClass-Eck), aber die der Finalize NICHT re-enqueued:
        const diagWaterButNotEnqueued = [];
        if (rebuiltKey) {
            const [fx, fz] = rebuiltKey.split(",").map(Number);
            const eset = new Set(enqueued);
            for (const [dx, dz] of [
                [-1, -1],
                [1, -1],
                [-1, 1],
                [1, 1],
            ]) {
                const nk = `${fx + dx},${fz + dz}`;
                const nb = s.voxelChunks.get(nk);
                if (nb && nb.waterCells && !eset.has(nk)) diagWaterButNotEnqueued.push(nk);
            }
        }
        out.partA = {
            rebuiltChunk: rebuiltKey,
            axisNeighborsEnqueued: axisN,
            diagonalNeighborsEnqueued: diagN,
            waterDiagonalsReadButNotEnqueued: diagWaterButNotEnqueued,
        };

        // ---------- Teil B — die DEPENDENZ: hängt die Diagonal-Iso vom Eck-
        // Cell-Zustand des Nachbarn ab? Wenn ja, lässt ein Eck-Stempel ohne
        // Re-Enqueue (Teil-A-Lücke) sie als Phantom stehen. ----------
        // Metrik: NICHT der Gesamt-Vertex-Count (mein erster Mess-FEHLER — SOLID
        // ist im sampleWater neutral, die eigene Wasser-Zelle der Diagonale hält
        // den Count → Count blind). Stattdessen: die Vertices NAHE der GETEILTEN
        // ECKE zählen (das ist die Phantom-Region). Geteilte Ecke (cx,cz)/(cx+1,
        // cz+1) liegt bei Welt ((cx+1)*span, (cz+1)*span).
        const cornerVtxNear = (key, wx, wz, rad) => {
            const m = isoMesh(key);
            if (!m || !m.geometry || !m.geometry.attributes.position) return 0;
            const p = m.geometry.attributes.position.array;
            let n = 0;
            for (let v = 0; v < p.length; v += 3) {
                const ddx = p[v] - wx;
                const ddz = p[v + 2] - wz;
                if (ddx * ddx + ddz * ddz <= rad * rad) n++;
            }
            return n;
        };
        let best = null;
        let examined = 0;
        for (const [key, entry] of s.voxelChunks) {
            if (!entry || !entry.waterCells) continue;
            const [cx, cz] = key.split(",").map(Number);
            const diagKey = `${cx + 1},${cz + 1}`;
            const diag = s.voxelChunks.get(diagKey);
            if (!diag || !diag.waterCells) continue;
            if (isoCount(diagKey) == null) continue;
            // (cx,cz)'s +x+z-Eck-Säule muss WATER tragen (sonst kein Stempel-Effekt).
            let cw = 0;
            for (let j = 0; j < dimY; j++) if (entry.waterCells[idx(dim - 1, dim - 1, j)] === STATE.WATER) cw++;
            if (cw === 0) continue;
            examined++;
            const wx = (cx + 1) * span;
            const wz = (cz + 1) * span;
            const rad = 2.5 * step;
            // Frischer Baseline-Rebuild der Diagonale (liest (cx,cz)'s Wasser-Ecke).
            r._buildVoxelChunkWaterIsoSurface(cx + 1, cz + 1);
            const cornerBefore = cornerVtxNear(diagKey, wx, wz, rad);
            // Den Eck-Stempel setzen (faithful zu _stampArchitectureSolidCellsInto).
            const saved = [];
            for (let j = 0; j < dimY; j++) {
                const n = idx(dim - 1, dim - 1, j);
                saved.push(entry.waterCells[n]);
                if (entry.waterCells[n] === STATE.WATER) entry.waterCells[n] = STATE.SOLID;
            }
            r._buildVoxelChunkWaterIsoSurface(cx + 1, cz + 1);
            const cornerAfter = cornerVtxNear(diagKey, wx, wz, rad);
            // Wiederherstellen + Diagonale + Quell-Chunk zurückbauen.
            for (let j = 0; j < dimY; j++) entry.waterCells[idx(dim - 1, dim - 1, j)] = saved[j];
            r._buildVoxelChunkWaterIsoSurface(cx + 1, cz + 1);
            const delta = Math.abs(cornerBefore - cornerAfter);
            if (!best || delta > best.delta) {
                best = { pair: `${key} -> diag ${diagKey}`, cornerBefore, cornerAfter, delta, cornerWater: cw };
            }
        }
        out.partB = {
            examinedPairs: examined,
            best,
            dependencyProven: !!(best && best.delta > 0),
        };

        // ---------- Teil C — der ECHTE Blob: ein felsturm IN Wasser ----------
        // Den nassesten gestreamten Chunk finden → dort ein felsturm spawnen →
        // nach dem REALEN Remesh+Finalize+Iso-Drain (40 Ticks) messen:
        //  (a) ROOT #3 „klettert hoch": bleiben WATER-Cells INNERHALB der
        //      Gebäude-Footprint-AABBs (xz, botY..topY)? (Stempel sollte sie
        //      SOLID machen → >0 = der Stempel deckt das Gebäude NICHT.)
        //  (b) ROOT #1/#2 „klebt an Ecke/Kante": trägt ein 8er-Ring-Nachbar nach
        //      dem Spawn eine STALE Iso (force-rebuild ändert die Vertex-Zahl)?
        const baseY = s.terrainBaseHeight || 0;
        const oyG = baseY - cfg.floorDrop;
        let wettest = null;
        for (const [key, e] of s.voxelChunks) {
            if (!e || !e.waterCells) continue;
            let w = 0;
            for (let n = 0; n < e.waterCells.length; n++) if (e.waterCells[n] === STATE.WATER) w++;
            if (!wettest || w > wettest.w) wettest = { key, w };
        }
        if (!wettest || wettest.w === 0) {
            out.partC = { found: false, note: "kein Wasser-Chunk im gestreamten Set" };
        } else {
            const [wcx, wcz] = wettest.key.split(",").map(Number);
            const bx = wcx * span + span / 2;
            const bz = wcz * span + span / 2;
            const gy = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(bx, bz) : 0;
            const ring = [];
            for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) ring.push(`${wcx + dx},${wcz + dz}`);
            let be = null;
            try {
                be = r.spawnArchitecture("felsturm", { x: bx, y: gy + 0.5, z: bz }, {});
            } catch (e) {
                out.notes.push("C spawn: " + ((e && e.message) || e));
            }
            // Den realen Pfad deterministisch zu Ende treiben (Dirty-Rebuild + Iso-Drain).
            for (let f = 0; f < 40; f++) {
                try {
                    r._gameLoopTick(performance.now());
                    r._tickPendingWaterIso(64);
                } catch (_e) {
                    /* ignore */
                }
            }
            // (a) WATER innerhalb der Gebäude-AABBs (= Stempel-Loch / „klettert hoch")?
            const aabbs = (be && be.blockerAABBs) || [];
            const aabbChunks = new Set();
            const countWaterInBuilding = () => {
                let n = 0;
                for (const k of ring) {
                    const e = s.voxelChunks.get(k);
                    if (!e || !e.waterCells) continue;
                    const [ccx, ccz] = k.split(",").map(Number);
                    const cox = ccx * span;
                    const coz = ccz * span;
                    for (const ab of aabbs) {
                        if (ab.maxX < cox || ab.minX > cox + dim * step) continue;
                        if (ab.maxZ < coz || ab.minZ > coz + dim * step) continue;
                        aabbChunks.add(k);
                        const i0 = Math.max(0, Math.floor((ab.minX - cox) / step));
                        const i1 = Math.min(dim - 1, Math.floor((ab.maxX - cox) / step));
                        const k0 = Math.max(0, Math.floor((ab.minZ - coz) / step));
                        const k1 = Math.min(dim - 1, Math.floor((ab.maxZ - coz) / step));
                        const j0 = Math.max(
                            0,
                            Math.floor(((Number.isFinite(ab.botY) ? ab.botY : ab.topY - 4) - oyG) / step)
                        );
                        const j1 = Math.min(dimY - 1, Math.floor((ab.topY - oyG) / step));
                        for (let j = j0; j <= j1; j++)
                            for (let kk = k0; kk <= k1; kk++)
                                for (let ii = i0; ii <= i1; ii++)
                                    if (e.waterCells[ii + kk * dim + j * dim * dim] === STATE.WATER) n++;
                    }
                }
                return n;
            };
            const waterInBuilding = countWaterInBuilding();
            // Über-Claim-Schutz: ist das WASSER-im-Gebäude PERMANENT (echtes
            // Stempel-Loch = ROOT #3) oder nur TRANSIENT (der V17.118-async-Rebuild
            // des fernen Chunks landete in 40 Ticks nicht)? → die AABB-Chunks JETZT
            // synchron zwangs-rebuilden (forceSync stempelt garantiert) + neu zählen.
            for (const k of aabbChunks) {
                const [kx, kz] = k.split(",").map(Number);
                try {
                    r._rebuildVoxelChunk(kx, kz, null, { forceSync: true });
                } catch (_e) {
                    /* ignore */
                }
            }
            const waterInBuildingAfterSync = countWaterInBuilding();
            // (b) stale Nachbar-Iso? force-rebuild jede Ring-Iso, vergleiche Count.
            let staleNeighbors = 0;
            const staleList = [];
            for (const k of ring) {
                if (k === wettest.key) continue;
                const e = s.voxelChunks.get(k);
                if (!e || !e.waterCells) continue;
                const before = isoCount(k);
                const [kx, kz] = k.split(",").map(Number);
                r._buildVoxelChunkWaterIsoSurface(kx, kz);
                const after = isoCount(k);
                if (before !== after) {
                    staleNeighbors++;
                    const dx = Math.abs(kx - wcx);
                    const dz = Math.abs(kz - wcz);
                    staleList.push(`${k}(${dx === 1 && dz === 1 ? "diag" : "axis"}):${before}->${after}`);
                }
            }
            out.partC = {
                found: true,
                wettestChunk: wettest.key,
                waterCells: wettest.w,
                buildingSpawned: !!be,
                buildingAABBs: aabbs.length,
                waterCellsInsideBuilding: waterInBuilding,
                waterInsideAfterForceSync: waterInBuildingAfterSync,
                staleNeighborIsos: staleNeighbors,
                staleList,
            };
        }

        // ---------- Teil D — der FERNE Wasser-Spawn (der V17.118-Transient-Trigger) ----------
        // Der Transient bisst NUR bei einem Spawn FERN vom Spieler (Nicht-Spieler-
        // Chunk → async-Worker-Rebuild). Teil C nahm den nassesten NAHEN Chunk;
        // Teil D sucht einen Wasser-Chunk WEIT draussen (>6 Chunks = klar async),
        // baut sein 3×3 force-in, spawnt dort ein felsturm → bestätigt, dass der
        // Fix auch im fernen (Ozean-)Kontext greift (eine zweite, unabhängige Probe).
        let farKey = null;
        const pcx0 = Math.floor((s.playerMesh.position.x + span / 2) / span);
        const pcz0 = Math.floor((s.playerMesh.position.z + span / 2) / span);
        for (let rad = 7; rad <= 22 && !farKey; rad++) {
            for (let a = 0; a < 16 && !farKey; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const fcx = pcx0 + Math.round(Math.cos(ang) * rad);
                const fcz = pcz0 + Math.round(Math.sin(ang) * rad);
                try {
                    if (r._voxelChunkHasAnyWater(fcx, fcz)) farKey = `${fcx},${fcz}`;
                } catch (_e) {
                    /* ignore */
                }
            }
        }
        if (!farKey) {
            out.partD = { found: false, note: "kein ferner Wasser-Chunk in Radius 7..22 gefunden" };
        } else {
            const [dcx, dcz] = farKey.split(",").map(Number);
            // 3×3 um den fernen Wasser-Chunk force-in bauen + Iso.
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    try {
                        r._ensureVoxelChunkAt(dcx + dx, dcz + dz, 0);
                    } catch (_e) {
                        /* ignore */
                    }
                }
            for (let f = 0; f < 12; f++) {
                try {
                    r._tickPendingWaterIso(64);
                } catch (_e) {
                    /* ignore */
                }
            }
            const dchebFromPlayer = Math.max(Math.abs(dcx - pcx0), Math.abs(dcz - pcz0));
            const dbx = dcx * span + span / 2;
            const dbz = dcz * span + span / 2;
            const dgy = typeof r.getTerrainHeightAt === "function" ? r.getTerrainHeightAt(dbx, dbz) : 0;
            let dbe = null;
            try {
                dbe = r.spawnArchitecture("felsturm", { x: dbx, y: dgy + 0.5, z: dbz }, {});
            } catch (e) {
                out.notes.push("D spawn: " + ((e && e.message) || e));
            }
            for (let f = 0; f < 40; f++) {
                try {
                    r._gameLoopTick(performance.now());
                    r._tickPendingWaterIso(64);
                } catch (_e) {
                    /* ignore */
                }
            }
            const dRing = [];
            for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) dRing.push(`${dcx + dx},${dcz + dz}`);
            const dAabbs = (dbe && dbe.blockerAABBs) || [];
            let dWaterInBuilding = 0;
            for (const k of dRing) {
                const e = s.voxelChunks.get(k);
                if (!e || !e.waterCells) continue;
                const [ccx, ccz] = k.split(",").map(Number);
                const cox = ccx * span;
                const coz = ccz * span;
                for (const ab of dAabbs) {
                    if (ab.maxX < cox || ab.minX > cox + dim * step) continue;
                    if (ab.maxZ < coz || ab.minZ > coz + dim * step) continue;
                    const i0 = Math.max(0, Math.floor((ab.minX - cox) / step));
                    const i1 = Math.min(dim - 1, Math.floor((ab.maxX - cox) / step));
                    const k0 = Math.max(0, Math.floor((ab.minZ - coz) / step));
                    const k1 = Math.min(dim - 1, Math.floor((ab.maxZ - coz) / step));
                    const j0 = Math.max(
                        0,
                        Math.floor(((Number.isFinite(ab.botY) ? ab.botY : ab.topY - 4) - oyG) / step)
                    );
                    const j1 = Math.min(dimY - 1, Math.floor((ab.topY - oyG) / step));
                    for (let j = j0; j <= j1; j++)
                        for (let kk = k0; kk <= k1; kk++)
                            for (let ii = i0; ii <= i1; ii++)
                                if (e.waterCells[ii + kk * dim + j * dim * dim] === STATE.WATER) dWaterInBuilding++;
                }
            }
            let dStale = 0;
            for (const k of dRing) {
                if (k === farKey) continue;
                const e = s.voxelChunks.get(k);
                if (!e || !e.waterCells) continue;
                const before = isoCount(k);
                const [kx, kz] = k.split(",").map(Number);
                r._buildVoxelChunkWaterIsoSurface(kx, kz);
                if (before !== isoCount(k)) dStale++;
            }
            out.partD = {
                found: true,
                farChunk: farKey,
                chebFromPlayer: dchebFromPlayer,
                buildingSpawned: !!dbe,
                waterCellsInsideBuilding: dWaterInBuilding,
                staleNeighborIsos: dStale,
            };
        }

        out.playerPos = { x: s.playerMesh.position.x, y: s.playerMesh.position.y, z: s.playerMesh.position.z };
        out.voxelChunks = s.voxelChunks ? s.voxelChunks.size : 0;
        return out;
    });

    console.log("\n=== DIAG: der Gebäude-Wasser-Blob = die stale Diagonal-Nachbar-Iso ===\n");
    console.log(`Chunks=${result.voxelChunks}`);
    if (result.notes.length) console.log("Notes:", result.notes.join(" | "));

    console.log("\n--- Teil A: die Struktur-Lücke (ISOLIERT: ein forceSync-Rebuild) ---");
    const a = result.partA;
    console.log(`  rebuilt Chunk:                 ${a.rebuiltChunk}`);
    console.log(`  ACHSEN-Nachbarn re-enqueued:   ${a.axisNeighborsEnqueued}`);
    console.log(
        `  DIAGONAL-Nachbarn re-enqueued: ${a.diagonalNeighborsEnqueued}   <-- V18.0-Fix: erwartet >0 (Diagonalen JETZT re-enqueued)`
    );
    console.log(
        `  Wasser-Diagonalen, die die Iso LIEST aber die Finalize NICHT enqueued: ${a.waterDiagonalsReadButNotEnqueued.length}   <-- V18.0-Fix: erwartet 0 (geheilt)` +
            (a.waterDiagonalsReadButNotEnqueued.length ? ` [${a.waterDiagonalsReadButNotEnqueued.join(" ")}]` : "")
    );

    console.log("\n--- Teil B: die DEPENDENZ (Diagonal-Iso vs. Nachbar-Eck-Stempel) ---");
    const b = result.partB;
    console.log(`  geprüfte Eck-Paare:            ${b.examinedPairs}`);
    if (b.best) {
        console.log(`  stärkstes Paar:                ${b.best.pair} (Eck-Wasser-Zellen ${b.best.cornerWater})`);
        console.log(`  Diag-Eck-Vertices VOR Stempel: ${b.best.cornerBefore}`);
        console.log(`  Diag-Eck-Vertices NACH Stempel:${b.best.cornerAfter}`);
        console.log(
            `  DELTA (Phantom-Vertices):      ${b.best.delta}   <-- >0 = die Diag-Iso HÄNGT vom Nachbar-Eck ab`
        );
    } else {
        console.log(`  kein +x+z-Wasser-Eck-Paar im gestreamten Set`);
    }

    console.log("\n--- Teil C: der ECHTE Blob (felsturm IN Wasser, realer Spawn-Pfad) ---");
    const c = result.partC;
    if (!c || !c.found) {
        console.log(`  ${(c && c.note) || "nicht ausgeführt"}`);
    } else {
        console.log(`  nassester Chunk:               ${c.wettestChunk} (${c.waterCells} WATER-Cells)`);
        console.log(`  felsturm gespawnt:             ${c.buildingSpawned} (${c.buildingAABBs} solide AABBs)`);
        console.log(
            `  (a) WATER IM Gebäude (nach 40 Ticks):     ${c.waterCellsInsideBuilding}   <-- V18.0-Fix: erwartet 0 (Sync-Footprint-Rebuild verdrängt sofort)`
        );
        console.log(
            `      WATER IM Gebäude (nach forceSync):    ${c.waterInsideAfterForceSync}   <-- >0 = ECHTES Stempel-Loch (war nie der Fall)`
        );
        console.log(
            `  (b) stale Nachbar-Iso:         ${c.staleNeighborIsos}   <-- V18.0-Fix: erwartet 0 (Diagonale heilt)` +
                (c.staleList.length ? ` [${c.staleList.join(" ")}]` : "")
        );
    }

    console.log("\n--- Teil D: der FERNE Wasser-Spawn (der V17.118-Transient-Trigger, async) ---");
    const d = result.partD;
    if (!d || !d.found) {
        console.log(`  ${(d && d.note) || "nicht ausgeführt"}`);
    } else {
        console.log(`  ferner Wasser-Chunk:           ${d.farChunk} (Cheb-Distanz ${d.chebFromPlayer} Chunks → async)`);
        console.log(`  felsturm gespawnt:             ${d.buildingSpawned}`);
        console.log(
            `  WATER IM Gebäude:              ${d.waterCellsInsideBuilding}   <-- V18.0-Fix: erwartet 0 (Sync-Footprint trotz Ferne)`
        );
        console.log(`  stale Nachbar-Iso:             ${d.staleNeighborIsos}   <-- V18.0-Fix: erwartet 0`);
    }

    // V18.0 — REGRESSIONS-GATE: nach dem Fix MÜSSEN alle gemessenen Wurzeln 0 sein.
    console.log("\n=== V18.0-Regressions-Gate (der Fix muss die gemessenen Zahlen auf 0 halten) ===");
    const checks = [];
    checks.push([
        "#1 Diagonal-Iso geheilt (waterDiagonalsReadButNotEnqueued=0)",
        a.waterDiagonalsReadButNotEnqueued.length === 0,
    ]);
    if (c && c.found) {
        checks.push(["V17.118-Transient geheilt (WATER im Gebäude nach Ticks=0)", c.waterCellsInsideBuilding === 0]);
        checks.push(["KEIN Stempel-Loch (WATER im Gebäude nach forceSync=0)", c.waterInsideAfterForceSync === 0]);
        checks.push(["#1/#2 keine stale Nachbar-Iso nach realem Spawn (=0)", c.staleNeighborIsos === 0]);
    } else {
        console.log("  (Teil C nicht reproduziert — kein Wasser-Chunk im Set; #1 bleibt der harte Beweis.)");
    }
    if (d && d.found) {
        checks.push(["FERN (async): WATER im Gebäude=0 (Transient-Fix hält fern)", d.waterCellsInsideBuilding === 0]);
        checks.push(["FERN (async): keine stale Nachbar-Iso=0", d.staleNeighborIsos === 0]);
    }
    let regressed = false;
    for (const [label, ok] of checks) {
        console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}`);
        if (!ok) regressed = true;
    }
    console.log(
        `\n  ${regressed ? "REGRESSION — der Wasser-Blob ist zurück." : "GRÜN — die gemessenen Wurzeln sind 0. Browser-Verify am Wasser-Gebäude bleibt der Seh-Schluss (V13: Wasser-RENDER nur im Browser)."}`
    );

    await browser.close();
    server.close();
    process.exit(regressed ? 1 : 0);
})();

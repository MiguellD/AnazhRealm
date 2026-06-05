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
// Diese Diagnose BEWEIST das headless (deterministisch, kein Pixel nötig):
//   Teil A — die STRUKTUR-LÜCKE: ein echter Arch-Spawn, `_enqueueWaterIso`
//            instrumentiert → zeigt, welche Nachbarn re-enqueued werden
//            (nur die 4 Achsen, nie die 4 Diagonalen).
//   Teil B — die VERHALTENS-FOLGE: ein Wasser-Eck-Stempel (faithful zu
//            `_stampArchitectureSolidCellsInto`) → die Diagonal-Nachbar-Iso
//            ist NICHT in der Queue UND ihr Vertex-Count ändert sich beim
//            erzwungenen Rebuild = sie WAR stale (Phantom-Wasser an der Ecke).
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
    console.log(`  DIAGONAL-Nachbarn re-enqueued: ${a.diagonalNeighborsEnqueued}   <-- erwartet 0 (die Lücke)`);
    console.log(
        `  Wasser-Diagonalen, die die Iso LIEST aber die Finalize NICHT enqueued: ${a.waterDiagonalsReadButNotEnqueued.length}` +
            (a.waterDiagonalsReadButNotEnqueued.length ? ` [${a.waterDiagonalsReadButNotEnqueued.join(" ")}]` : ""),
    );

    console.log("\n--- Teil B: die DEPENDENZ (Diagonal-Iso vs. Nachbar-Eck-Stempel) ---");
    const b = result.partB;
    console.log(`  geprüfte Eck-Paare:            ${b.examinedPairs}`);
    if (b.best) {
        console.log(`  stärkstes Paar:                ${b.best.pair} (Eck-Wasser-Zellen ${b.best.cornerWater})`);
        console.log(`  Diag-Eck-Vertices VOR Stempel: ${b.best.cornerBefore}`);
        console.log(`  Diag-Eck-Vertices NACH Stempel:${b.best.cornerAfter}`);
        console.log(`  DELTA (Phantom-Vertices):      ${b.best.delta}   <-- >0 = die Diag-Iso HÄNGT vom Nachbar-Eck ab`);
    } else {
        console.log(`  kein +x+z-Wasser-Eck-Paar im gestreamten Set`);
    }

    console.log("\n=== Urteil ===");
    const gapProven = a.diagonalNeighborsEnqueued === 0 && b.dependencyProven;
    if (gapProven) {
        console.log("BESTÄTIGT: (A) die Finalize re-enqueued NIE die Diagonalen, obwohl die Iso sie liest;");
        console.log("(B) die Diagonal-Iso HÄNGT vom Eck-Cell-Zustand des Nachbarn ab → ein Gebäude-Stempel");
        console.log("an der Ecke lässt sie als PHANTOM-WASSER stehen (heilt nicht selbst) = der Blob.");
        console.log("Die Render-Sync-Schicht, NICHT die Worldgen-Cells (die V17.119/.120 band-aideten).");
    } else if (a.diagonalNeighborsEnqueued === 0 && !b.dependencyProven) {
        console.log("TEIL A bestätigt (Diagonalen nie re-enqueued), TEIL B im gestreamten Set NICHT");
        console.log("reproduziert (kein passendes Wasser-Eck-Paar / Dependenz=0) → weiter messen, NICHT raten.");
    } else {
        console.log("UNERWARTET — Diagonale wurde re-enqueued. Hypothese überdenken, neu messen.");
    }

    await browser.close();
    server.close();
})();

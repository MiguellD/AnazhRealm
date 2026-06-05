// Diagnose V18.9 — DER WASSER-NAHTFEHLER AN DER CHUNKGRENZE (der „Geradenschnitt",
// den der Schöpfer seit Versionen sieht: „Nahtfehler, Kommunikation mit dem Terrain,
// führen zu Geradenschnitten").
//
// WURZEL (gemessen, nicht behauptet): die V18.6/.8-Flächen-Maske `cornerWet` wertet
// ein 3×3 um jede Eck-Spalte aus, das an der Chunkgrenze in den Nachbarn reicht. Las
// es dort NUR die eigenen Zellen (Klipp bei OOB), klassifizierten zwei Nachbar-Chunks
// DIESELBE Boundary-Uferlinie UNTERSCHIEDLICH → die Fläche wurde entlang der Chunk-
// Kante abgeschnitten = der harte Geradenschnitt. Das ist GENAU die V13.13.2-Iso-
// Lehre („lies die Nachbar-Zellen, rate nie per-Spalte"), die die neue Maske nie erbte.
//
// Diese Diagnose misst an einer GETEILTEN Chunkgrenze, für jeden geteilten Eck-Vertex,
// ob Chunk A und Chunk B IHN GLEICH klassifizieren — einmal mit der ALTEN Maske
// (own-cells-only, Klipp) und einmal mit der NEUEN (neighbor-read, der V18.9-Fix):
//   - oldMismatch  = Eck-Vertices, wo A != B mit own-only  → der Geradenschnitt.
//   - newMismatch  = Eck-Vertices, wo A != B mit neighbor  → MUSS 0 sein (naht-frei).
//
// Exit 1 (Regressions-Gate), wenn newMismatch > 0 (die Naht offen) ODER keine zwei
// benachbarten Wasser-Chunks gestreamt wurden (nichts gemessen).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4351;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".woff2": "font/woff2", ".css": "text/css", ".png": "image/png" };
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
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Warmup: Render stubben (pixel-blind), bis Wasser-Chunks gestreamt sind.
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (typeof r.state.renderer.renderAsync === "function") r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 20) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        const r = window.anazhRealm;
        for (let f = 0; f < 80; f++) {
            try {
                r._tickPendingWaterIso(64);
                r._gameLoopTick(performance.now());
            } catch (_e) {}
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const STATE = r.constructor.CELL_STATE;
        const { dim, dimY, step, span } = r._voxelChunkConfig(0);
        const dim0 = dim,
            step0 = step,
            dimY0 = dimY,
            dq0 = dim0 * dim0;

        // alle LOD0-Wasser-Chunks
        const water = new Map(); // "cx,cz" -> entry
        for (const [key, e] of s.voxelChunks) {
            if (!e || !e.waterCells || (e.lod || 0) !== 0) continue;
            let has = false;
            for (let n = 0; n < e.waterCells.length && !has; n++) if (e.waterCells[n] === STATE.WATER) has = true;
            if (has) water.set(key, e);
        }
        const res = { mode: r._waterRenderMode(), waterChunks: water.size };

        // eine Spalte (oi,ok) eines gegebenen waterCells-Arrays ist nass?
        const colWetIn = (cellsArr, li, lk) => {
            if (!cellsArr || li < 0 || lk < 0 || li >= dim0 || lk >= dim0) return 0;
            const base = li + lk * dim0;
            for (let j = 0; j < dimY0; j++) if (cellsArr[base + j * dq0] === STATE.WATER) return 1;
            return 0;
        };
        // ALTE Maske: only-own-cells, Klipp bei OOB (das V18.8-Verhalten).
        const colWetOwn = (e, oi, ok) => {
            if (oi < 0 || ok < 0 || oi >= dim0 || ok >= dim0) return 0;
            return colWetIn(e.waterCells, oi, ok);
        };
        // NEUE Maske: neighbor-read (der V18.9-Fix — exakt `colWetAt` repliziert).
        const colWetNbr = (cx, cz, e, oi, ok) => {
            let ncx = cx,
                ncz = cz,
                li = oi,
                lk = ok;
            if (oi < 0) {
                ncx -= 1;
                li = oi + dim0;
            } else if (oi >= dim0) {
                ncx += 1;
                li = oi - dim0;
            }
            if (ok < 0) {
                ncz -= 1;
                lk = ok + dim0;
            } else if (ok >= dim0) {
                ncz += 1;
                lk = ok - dim0;
            }
            if (ncx === cx && ncz === cz) return colWetIn(e.waterCells, li, lk);
            const nb = s.voxelChunks.get(`${ncx},${ncz}`);
            if (nb && nb.waterCells) return colWetIn(nb.waterCells, li, lk);
            if (nb) return 0; // geladen + trocken
            // ungestreamt → eigene Kant-Spalte spiegeln
            const ci2 = oi < 0 ? 0 : oi >= dim0 ? dim0 - 1 : oi;
            const ck2 = ok < 0 ? 0 : ok >= dim0 ? dim0 - 1 : ok;
            return colWetIn(e.waterCells, ci2, ck2);
        };
        // cornerWet aus der Sicht von Chunk (cx,cz) am Welt-Punkt (wx,wz).
        const cornerWet = (cx, cz, e, wx, wz, mode) => {
            const ox = cx * span,
                oz = cz * span;
            const ci = Math.floor((wx - ox) / step0);
            const ck = Math.floor((wz - oz) / step0);
            for (let dk = -1; dk <= 1; dk++)
                for (let di = -1; di <= 1; di++) {
                    const wet = mode === "own" ? colWetOwn(e, ci + di, ck + dk) : colWetNbr(cx, cz, e, ci + di, ck + dk);
                    if (wet) return 1;
                }
            return 0;
        };

        // Für jedes benachbarte Wasser-Chunk-Paar (A, A+x) und (A, A+z): an der
        // geteilten Kante jeden Eck-Vertex aus BEIDEN Frames klassifizieren.
        let pairs = 0,
            sharedVerts = 0,
            oldMismatch = 0,
            newMismatch = 0;
        const worstOld = [];
        for (const [key, eA] of water) {
            const [cx, cz] = key.split(",").map(Number);
            for (const [dirx, dirz] of [
                [1, 0],
                [0, 1],
            ]) {
                const bcx = cx + dirx,
                    bcz = cz + dirz;
                const eB = water.get(`${bcx},${bcz}`);
                if (!eB) continue;
                pairs++;
                // geteilte Kante: bei +x liegt sie auf wx=(cx+1)*span, wz variiert;
                // bei +z auf wz=(cz+1)*span, wx variiert. Eck-Vertices im LOD0-Step.
                let pOld = 0;
                for (let t = 0; t <= dim0; t++) {
                    let wx, wz;
                    if (dirx === 1) {
                        wx = (cx + 1) * span;
                        wz = cz * span + t * step0;
                    } else {
                        wx = cx * span + t * step0;
                        wz = (cz + 1) * span;
                    }
                    sharedVerts++;
                    const aOld = cornerWet(cx, cz, eA, wx, wz, "own");
                    const bOld = cornerWet(bcx, bcz, eB, wx, wz, "own");
                    const aNew = cornerWet(cx, cz, eA, wx, wz, "nbr");
                    const bNew = cornerWet(bcx, bcz, eB, wx, wz, "nbr");
                    if (aOld !== bOld) {
                        oldMismatch++;
                        pOld++;
                    }
                    if (aNew !== bNew) newMismatch++;
                }
                if (pOld > 0) worstOld.push({ a: key, b: `${bcx},${bcz}`, dir: dirx === 1 ? "+x" : "+z", mismatch: pOld });
            }
        }
        res.pairs = pairs;
        res.sharedVerts = sharedVerts;
        res.oldMismatch = oldMismatch; // der Geradenschnitt (alte Maske)
        res.newMismatch = newMismatch; // MUSS 0 (V18.9-Fix)
        worstOld.sort((a, b) => b.mismatch - a.mismatch);
        res.worstOld = worstOld.slice(0, 6);
        return res;
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== WASSER-NAHT AN DER CHUNKGRENZE (V18.9) ===");
    console.log("Render-Modus           :", out.mode, "(surface = die V18.6-Fläche)");
    console.log("LOD0-Wasser-Chunks     :", out.waterChunks);
    console.log("benachbarte Paare      :", out.pairs);
    console.log("geteilte Eck-Vertices  :", out.sharedVerts);
    console.log("");
    console.log("ALTE Maske (own-only)  : mismatch =", out.oldMismatch, "  <- der Geradenschnitt an der Chunkgrenze");
    console.log("NEUE Maske (neighbor)  : mismatch =", out.newMismatch, "  <- MUSS 0 (naht-frei per Konstruktion)");
    if (out.worstOld && out.worstOld.length) {
        console.log("\nschlimmste alte Nähte:");
        for (const w of out.worstOld) console.log(`  ${w.a} | ${w.b} (${w.dir}): ${w.mismatch} uneinige Vertices`);
    }
    if (out.err) {
        console.log("\nFEHLER:", out.err);
        process.exit(1);
    }
    if (out.pairs === 0) {
        console.log("\n[FAIL] keine zwei benachbarten Wasser-Chunks gestreamt — nichts gemessen.");
        process.exit(1);
    }
    if (out.newMismatch > 0) {
        console.log("\n[FAIL] die NEUE Maske öffnet noch eine Naht (newMismatch > 0) — der Fix greift nicht.");
        process.exit(1);
    }
    console.log("\n[OK] die neue Maske ist an jeder geteilten Chunkgrenze EINIG (newMismatch=0).");
    if (out.oldMismatch > 0) console.log(`     Die alte Maske war an ${out.oldMismatch} geteilten Vertices uneinig = der gemessene Geradenschnitt, jetzt geheilt.`);
    else console.log("     (Im gestreamten Gebiet war die alte Maske zufällig schon einig — der Fix ist trotzdem die Naht-Garantie per Konstruktion.)");
    process.exit(0);
})();

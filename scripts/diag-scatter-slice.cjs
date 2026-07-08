#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-scatter-slice.cjs — DIE SCHEIBEN-BYTE-WAND (W3.3b/3c, npm run gate:scatter-slice)
//
// `_scatterRegion` baut mit Deadline in ZEIT-SCHEIBEN (Fortsetzung `region._cont`:
// Bake-Phase j-Zeilen → Zellen-Phase cz/cx/emitted). Diese Linse beweist headless:
//   (1) BYTE-EXAKT: dieselbe Region One-Shot vs in N Scheiben → `region.cells`
//       identisch (cellX/cellZ/layer/species/variantIndex/lod/bpName) — UND es
//       WAREN echte Scheiben (sliceCount ≥ 3, sonst misst der Vergleich nichts).
//   (2) HISM-SLOT-BILANZ: die Gruppen tragen nach dem Scheiben-Bau dieselben
//       count/free-Stände wie nach dem One-Shot — ein Doppel-Add über die
//       Scheiben-Grenze wäre im cells-Vergleich UNSICHTBAR (die Instanz landet
//       trotzdem in der Gruppe), die Bilanz fängt ihn.
//   (3) KALT-BAKE-SCHEIBEN: der Region-Feld-Bake läuft in j-Zeilen-Scheiben und
//       das Ergebnis ist Float32-BYTE-GLEICH zum One-Shot-Bake; ein HALBER Bake
//       steht NIE in der Map (die _sampleBakedField-Wand).
//   (4) DISPOSE-STORNO: ein Dispose MITTEN in der Fortsetzung tötet den cont —
//       kein Throw, die Map ist sauber, ein frischer One-Shot baut normal.
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = 4413;
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            const old = r.state.voxelWorker;
            r.state.voxelWorker = null;
            for (let i = 0; i < 150; i++) {
                r._gameLoopTick();
                await new Promise((res) => setTimeout(res, 0));
            }
            r.state.voxelWorker = old;
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                st = r.state;
            const A = window.AnazhRealm || r.constructor;
            const SC = A.SCATTER;
            const o = {};
            const pos = st.playerMesh ? st.playerMesh.position : { x: 0, y: 0, z: 0 };
            const rx = Math.floor(pos.x / SC.regionM),
                rz = Math.floor(pos.z / SC.regionM);
            const key = `${rx},${rz}`;
            const bcfg = r._bakeRegionConfig();
            const bKey = `${Math.floor((rx * SC.regionM) / bcfg.sizeM)},${Math.floor((rz * SC.regionM) / bcfg.sizeM)}`;
            const snapshot = (reg) =>
                JSON.stringify(
                    (reg && reg.cells ? reg.cells : []).map((c) => [
                        c.cellX,
                        c.cellZ,
                        c.layer,
                        c.species,
                        c.variantIndex,
                        c.lod,
                        c.bpName,
                    ])
                );
            const groupBalance = () => {
                const b = {};
                if (st.archInstanceGroups)
                    for (const [k, g] of st.archInstanceGroups)
                        b[k] = { count: g.count || 0, free: Array.isArray(g.free) ? g.free.length : 0 };
                return JSON.stringify(b);
            };
            const clean = () => {
                if (st.scatterRegions && st.scatterRegions.has(key)) r._disposeScatterRegion(key);
            };
            const cleanBake = () => {
                if (st.bakedRegionFields) st.bakedRegionFields.delete(bKey);
            };
            // ── (1)+(3) ONE-SHOT-Referenz (kalt: auch der Bake läuft im One-Shot) ──
            clean();
            cleanBake();
            const oneShot = r._scatterRegion(rx, rz, pos);
            o.oneShotCells = oneShot ? oneShot.cells.length : -1;
            const snapOne = snapshot(oneShot);
            const bakeOne = st.bakedRegionFields && st.bakedRegionFields.get(bKey);
            const bakeOneCopy = bakeOne && bakeOne.data ? Array.from(bakeOne.data) : null;
            const balanceOne = groupBalance();
            // ── SCHEIBEN-Bau (kalt: Bake-Phase + Zellen-Phase, enge Deadlines) ──
            clean();
            cleanBake();
            let slices = 0,
                halfBakeSeen = false,
                contSeenPhases = new Set();
            let reg = null;
            for (let i = 0; i < 800; i++) {
                reg = r._scatterRegion(rx, rz, pos, performance.now() + 0.4);
                slices++;
                if (reg && reg._cont) {
                    contSeenPhases.add(reg._cont.phase);
                    // die _sampleBakedField-Wand: ein HALBER Bake darf NIE in der Map stehen
                    const e = st.bakedRegionFields && st.bakedRegionFields.get(bKey);
                    if (e && e.dirty !== false && reg._cont.phase === "bake") halfBakeSeen = true;
                } else break;
                await new Promise((res) => setTimeout(res, 0));
            }
            o.slices = slices;
            o.contPhases = Array.from(contSeenPhases);
            o.halfBakeInMap = halfBakeSeen;
            o.sliceDone = !!(reg && !reg._cont);
            const snapSliced = snapshot(reg);
            const bakeSliced = st.bakedRegionFields && st.bakedRegionFields.get(bKey);
            o.bakeByteEqual =
                !!bakeOneCopy && !!bakeSliced && bakeSliced.data.length === bakeOneCopy.length
                    ? bakeSliced.data.every((v, i) => v === bakeOneCopy[i])
                    : false;
            o.cellsByteEqual = snapOne === snapSliced;
            o.balanceEqual = groupBalance() === balanceOne;
            o.slicedCells = reg ? reg.cells.length : -1;
            // ── (4) DISPOSE-STORNO: mitten in der Fortsetzung disposen ──
            clean();
            cleanBake();
            let storno = { threw: false, contDead: false, rebuildOk: false };
            try {
                let reg2 = r._scatterRegion(rx, rz, pos, performance.now() + 0.4);
                let guard = 0;
                while (reg2 && reg2._cont && reg2._cont.phase === "bake" && guard++ < 300)
                    reg2 = r._scatterRegion(rx, rz, pos, performance.now() + 0.4);
                // jetzt in der Zellen-Phase (oder fertig) → mitten drin disposen
                if (reg2 && reg2._cont) {
                    r._disposeScatterRegion(key);
                    storno.contDead = !st.scatterRegions.has(key) && reg2._cont === null;
                    const fresh = r._scatterRegion(rx, rz, pos);
                    storno.rebuildOk = !!fresh && !fresh._cont && snapshot(fresh) === snapOne;
                    r._disposeScatterRegion(key);
                } else {
                    // Region wurde zu schnell fertig (winzige Region) — Storno an leerer Stelle prüfen
                    r._disposeScatterRegion(key);
                    storno.contDead = !st.scatterRegions.has(key);
                    const fresh = r._scatterRegion(rx, rz, pos);
                    storno.rebuildOk = !!fresh && snapshot(fresh) === snapOne;
                    r._disposeScatterRegion(key);
                }
            } catch (e) {
                storno.threw = String((e && e.message) || e);
            }
            o.storno = storno;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Scheiben-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    console.log("\n=== SCATTER-ZEIT-SCHEIBEN (One-Shot vs Fortsetzung, byte-exakt) ===");
    const checks = [
        {
            name: `ECHTE Scheiben liefen (${out.slices} Aufrufe, Phasen [${out.contPhases}]) — der Vergleich misst nicht vakuös`,
            pass: out.slices >= 3 && out.sliceDone === true && out.contPhases.includes("cells"),
        },
        {
            name: `region.cells BYTE-EXAKT gleich (One-Shot ${out.oneShotCells} == Scheiben ${out.slicedCells} Zellen)`,
            pass: out.cellsByteEqual === true && out.oneShotCells === out.slicedCells && out.oneShotCells > 5,
        },
        {
            name: "HISM-SLOT-BILANZ identisch (kein Doppel-Add über die Scheiben-Grenze — im cells-Vergleich unsichtbar)",
            pass: out.balanceEqual === true,
        },
        {
            name: "KALT-BAKE gescheibt + Float32-byte-gleich · kein halber Bake je in der Map (die _sampleBakedField-Wand)",
            pass: out.bakeByteEqual === true && out.halfBakeInMap === false && out.contPhases.includes("bake"),
        },
        {
            name: `DISPOSE-STORNO: mitten in der Fortsetzung disposen → cont tot, kein Throw, frischer One-Shot byte-gleich (${JSON.stringify(out.storno)})`,
            pass: out.storno.threw === false && out.storno.contDead === true && out.storno.rebuildOk === true,
        },
    ];
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Scheiben-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die Zeit-Scheiben sind nicht byte-treu — der 54-ms-Schnitt darf so nicht leben.");
        process.exit(1);
    }
    console.log("✅ Der Region-Bau läuft in Scheiben — byte-identisch, bilanz-treu, dispose-sicher.");
    process.exit(0);
})();

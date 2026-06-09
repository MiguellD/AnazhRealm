// Diagnose T4a-2 (terrain-t4-wasser-ca-plan §3) — der Wasser-Automat in der WELT, BEWIESEN.
// `_tickWorldWaterCA` tickt die AKTIVEN LOD0-Chunks + tauscht Level über die Chunk-GRENZE aus
// (cross-chunk-wake, möglich WEIL T1/T2 die Grenze kohärent machten). Wir testen die Plumbing auf
// ZWEI echten Nachbar-Chunk-Entries mit kontrollierten Daten — headless GEOMETRIE/Zustand:
//   ERHALTUNG (Σ Wasser über A+B konstant) · CROSS-CHUNK (Wasser fliesst von A nach B) ·
//   FLUSS (eine hohe Rand-Säule fällt + spreizt) · ACTIVE-CELL (settled → active-Set leert sich).
// Exit 1 bei gebrochener Erhaltung ODER keinem Fluss über die Grenze.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4368;
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
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
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 80; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const cfg = r._voxelChunkConfig(0);
        const dim = cfg.dim,
            dimY = cfg.dimY;
        const SOLID = r.constructor.CELL_STATE.SOLID;
        const AIR = r.constructor.CELL_STATE.AIR;
        const dimSq = dim * dim;
        // zwei benachbarte LOD0-Chunk-Entries finden
        let A = null,
            B = null,
            aKey = null,
            bKey = null;
        for (const [key, e] of s.voxelChunks) {
            if (!e || e.empty || !e.waterCells || (Number.isFinite(e.lod) && e.lod !== 0)) continue;
            const [cx, cz] = key.split(",").map(Number);
            const nbKey = `${cx + 1},${cz}`;
            const nb = s.voxelChunks.get(nbKey);
            if (nb && !nb.empty && nb.waterCells && (!Number.isFinite(nb.lod) || nb.lod === 0)) {
                A = e;
                B = nb;
                aKey = key;
                bKey = nbKey;
                break;
            }
        }
        if (!A) return { err: "kein LOD0-Nachbar-Paar mit waterCells gefunden" };

        // synthetische Zellen (AIR + SOLID-Boden j=0) auf beide Entries (Originale sichern)
        const aOrig = A.waterCells,
            bOrig = B.waterCells;
        const cellsA = new Uint8Array(dimSq * dimY).fill(AIR);
        const cellsB = new Uint8Array(dimSq * dimY).fill(AIR);
        for (let c = 0; c < dimSq; c++) {
            cellsA[c] = SOLID;
            cellsB[c] = SOLID;
        }
        A.waterCells = cellsA;
        B.waterCells = cellsB;
        // V18.88 — das System SCHLIESSEN (Test wandert mit dem Code, V9.56-i): seit der
        // Isotropie-Heilung (T4-Plan §6.3) tauscht ein aktiver Chunk über ALLE vier Grenzen —
        // die Außen-Nachbarn tragen NATUR-Wasser (Flood-Seed 1.0) und strömten in das
        // synthetische A/B-Paar ein (die alte Messung nahm ein offenes System als geschlossen).
        // SOLID-Wände auf den 6 Außen-Nachbarn → kein Tausch über den Paar-Rand, Σ A+B exakt.
        const [acx, acz] = aKey.split(",").map(Number);
        const outer = [
            [acx - 1, acz],
            [acx, acz - 1],
            [acx, acz + 1],
            [acx + 2, acz],
            [acx + 1, acz - 1],
            [acx + 1, acz + 1],
        ];
        const wallOrig = [];
        const wall = new Uint8Array(dimSq * dimY).fill(SOLID);
        for (const [wx, wz] of outer) {
            const wk = `${wx},${wz}`;
            const we = s.voxelChunks.get(wk);
            if (we && we.waterCells) {
                wallOrig.push([we, we.waterCells]);
                we.waterCells = wall;
            }
        }
        // Level: eine hohe Säule an A's +x-RAND (i=dim-1, Mitte k), j=1..6; B leer.
        const levelA = new Float32Array(dimSq * dimY);
        const levelB = new Float32Array(dimSq * dimY);
        const kMid = (dim >> 1) * dim;
        for (let j = 1; j <= 6; j++) levelA[j * dimSq + kMid + (dim - 1)] = 1.0;
        s.waterLevelCells = s.waterLevelCells || new Map();
        s.waterLevelCells.set(aKey, levelA);
        s.waterLevelCells.set(bKey, levelB);
        const sum = (a) => {
            let t = 0;
            for (let i = 0; i < a.length; i++) t += a[i];
            return t;
        };
        const sumA0 = sum(levelA),
            sumB0 = sum(levelB);

        // wecken + den WELT-Tick fahren (genau die Loop-Funktion)
        r._wakeWaterCA(aKey.split(",")[0] | 0, aKey.split(",")[1] | 0);
        let ticks = 0;
        for (let t = 0; t < 80; t++) {
            r._tickWorldWaterCA();
            ticks++;
        }
        const la = s.waterLevelCells.get(aKey),
            lb = s.waterLevelCells.get(bKey);
        const sumA1 = sum(la),
            sumB1 = sum(lb);
        // A's Rand-Säule (sollte stark abgeflossen sein)
        let colA1 = 0;
        for (let j = 0; j < dimY; j++) colA1 += la[j * dimSq + kMid + (dim - 1)];
        const activeAfter = s.waterCAActive ? s.waterCAActive.size : -1;

        // TEST 2 — ISOTROPIE (T4-Plan §6.3): Säule an B's −x-RAND (i=0), NUR B geweckt →
        // das Wasser MUSS in den INAKTIVEN West-Nachbarn A fließen (vor der V18.88-Heilung
        // lief das Grenz-Paar nie: B schaute nicht nach −x, das inaktive A tickte nicht →
        // Ausbreitung über den Wake-Ring hinaus nur nach Ost/Süd, die V13.3-Isotropie-Klasse).
        if (s.waterCAActive) s.waterCAActive.clear();
        const levelA2 = new Float32Array(dimSq * dimY);
        const levelB2 = new Float32Array(dimSq * dimY);
        for (let j = 1; j <= 6; j++) levelB2[j * dimSq + kMid + 0] = 1.0;
        s.waterLevelCells.set(aKey, levelA2);
        s.waterLevelCells.set(bKey, levelB2);
        r._wakeWaterCA(bKey.split(",")[0] | 0, bKey.split(",")[1] | 0);
        for (let t = 0; t < 40; t++) r._tickWorldWaterCA();
        const westGain = sum(s.waterLevelCells.get(aKey));
        const westCons = sum(s.waterLevelCells.get(aKey)) + sum(s.waterLevelCells.get(bKey));

        // Originale wiederherstellen
        A.waterCells = aOrig;
        B.waterCells = bOrig;
        for (const [we, orig] of wallOrig) we.waterCells = orig;
        s.waterLevelCells.clear();
        if (s.waterCAActive) s.waterCAActive.clear();

        return {
            aKey,
            bKey,
            sum0: +(sumA0 + sumB0).toFixed(5),
            sum1: +(sumA1 + sumB1).toFixed(5),
            sumA0: +sumA0.toFixed(3),
            sumA1: +sumA1.toFixed(3),
            sumB1: +sumB1.toFixed(3),
            col0: 6,
            col1: +colA1.toFixed(3),
            ticks,
            activeAfter,
            westGain: +westGain.toFixed(3),
            westCons: +westCons.toFixed(5),
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== T4a-2 — WASSER-AUTOMAT IN DER WELT (`_tickWorldWaterCA`, headless) ===\n");
    if (out.err) {
        console.log("SKIP:", out.err, "\n");
        process.exit(0);
    }
    console.log(`Chunk-Paar: ${out.aKey} ↔ ${out.bKey}  (${out.ticks} Welt-Ticks)`);
    console.log(
        `Σ Wasser A+B: ${out.sum0} → ${out.sum1}   (ERHALTUNG: ${Math.abs(out.sum1 - out.sum0) < 1e-3 ? "✓ exakt" : "✗ GEBROCHEN"})`
    );
    console.log(
        `Chunk B (Nachbar) erhielt Wasser: ${out.sumB1}   (CROSS-CHUNK-WAKE: ${out.sumB1 > 0.1 ? "✓ Wasser floss über die Grenze" : "✗ kein Grenz-Fluss"})`
    );
    console.log(
        `A's Rand-Säule: ${out.col0} → ${out.col1}   (abgeflossen/gespreizt: ${out.col1 < out.col0 - 1 ? "✓" : "✗"})`
    );
    console.log(
        `active-Set nach dem Settle: ${out.activeAfter} Chunks   (active-cell ruht: ${out.activeAfter === 0 ? "✓" : "○ noch aktiv"})`
    );
    console.log(
        `ISOTROPIE (V18.88): B aktiv, A inaktiv-WESTLICH → A erhielt ${out.westGain} (Σ ${out.westCons})   (${out.westGain > 0.1 ? "✓ fliesst auch nach Westen" : "✗ West-Ausbreitung blockiert"})\n`
    );

    const consOk = Math.abs(out.sum1 - out.sum0) < 1e-3;
    const crossOk = out.sumB1 > 0.1;
    const flowOk = out.col1 < out.col0 - 1;
    const isoOk = out.westGain > 0.1 && Math.abs(out.westCons - 6) < 1e-3;
    if (consOk && crossOk && flowOk && isoOk) {
        console.log(
            "GRÜN — der Welt-Automat ERHÄLT das Wasser, es FLIESST über die Chunk-GRENZE (cross-chunk-wake) + sucht sein Niveau."
        );
        console.log(
            "  → T4a-2 verdrahtet; nächster Schritt: die Physik liest das Level (T4a-4) + der Render aus dem CA-Level (T4b, Browser).\n"
        );
        process.exit(0);
    } else {
        console.log(
            `ROT — Erhaltung ${consOk ? "ok" : "GEBROCHEN"}, cross-chunk ${crossOk ? "ok" : "FEHLT"}, Fluss ${flowOk ? "ok" : "FEHLT"}, Isotropie ${isoOk ? "ok" : "FEHLT"}.\n`
        );
        process.exit(1);
    }
})();

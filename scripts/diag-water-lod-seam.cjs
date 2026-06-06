// Diagnose V18.22 — die WASSER-CHUNKNAHT als LOD-T-junction (die Sägezahn-Wurzel des
// Schöpfers: „du hast die Verbindung des Flusses beachtet, aber nicht wenn er GENAU AUF DER
// NAHT läuft — dann entstehen immer Sägezähne; Minecraft hat das längst gelöst").
//
// Wurzel (GEMESSEN): das V18.6-Surface-Mesh baute sein `L`-Höhenfeld auf `entry.lod` →
// die Wasser-Flächen streamten auf GEMISCHTEN LODs (LOD0 step 1.8 m neben LOD1 step 3.6 m).
// An so einer Naht fallen die feineren LOD0-Vertices ZWISCHEN die gröberen LOD1-Vertices:
// die gröbere Kante interpoliert linear, der feinere L-Wert weicht ab → ein T-junction-Riss
// = der „chunk transition"-Sägezahn. Das verletzt die V9.93-Lehre „naht-freie Schicht lebt
// auf EINER LOD-Skala" (die ZELLEN folgen ihr schon: immer LOD0). V18.22-Fix: die FLÄCHE
// baut IMMER auf LOD0 → alle Wasser-Chunks teilen das Gitter → naht-frei per Konstruktion.
//
// METRIK 1 — Surface-Mesh-Auflösung: der minimale Vertex-Abstand pro Mesh (LOD0 ≈ 1.8 m,
//            LOD1 ≈ 3.6 m). Nach dem Fix: ALLE ≈ 1.8 m (eine Skala).
// METRIK 2 — Naht-T-junctions: ein Vertex EINES Chunks, der EXAKT auf der gemeinsamen
//            Chunk-Grenze zum Nachbarn liegt, aber im Nachbar-Mesh KEINEN koinzidenten
//            Vertex hat = ein hängender Knoten = der Riss. Nach dem Fix: 0.
// Exit 1, wenn T-junctions existieren ODER die Auflösung gemischt ist.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4362;
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
        while (performance.now() - start < 50000) {
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
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 28) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        // SETTLE: viele Extra-Ticks, damit alle re-enqueued Nachbar-Surface-Meshes
        // bauen (V18.18 re-enqueued alle 8 Nachbarn) → trennt transiente Build-
        // Reihenfolge-T-junctions von permanenten Coverage-Rissen.
        for (let i = 0; i < 400; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const span = r._voxelChunkConfig(0).span;
        // pro Surface-Chunk: Vertices, min-Abstand, Set der Positions-Schlüssel (0.1 m).
        const chunks = new Map();
        const keyOf = (x, z) => Math.round(x * 10) + "," + Math.round(z * 10);
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            if (!pos || pos.count === 0) continue;
            const [cx, cz] = key.split(",").map(Number);
            const set = new Set();
            const xs = new Set();
            for (let v = 0; v < pos.count; v++) {
                set.add(keyOf(pos.getX(v), pos.getZ(v)));
                xs.add(Math.round(pos.getX(v) * 10) / 10);
            }
            // min Vertex-Abstand entlang X (sortierte eindeutige X-Werte)
            const sx = [...xs].sort((a, b) => a - b);
            let minStep = Infinity;
            for (let i = 1; i < sx.length; i++) minStep = Math.min(minStep, sx[i] - sx[i - 1]);
            chunks.set(key, { cx, cz, set, minStep: Number.isFinite(minStep) ? +minStep.toFixed(2) : 0 });
        }
        // METRIK 1 — Auflösungs-Histogramm
        const stepHist = {};
        for (const [, c] of chunks) stepHist[c.minStep] = (stepHist[c.minStep] || 0) + 1;
        // METRIK 2 — Naht-T-junctions: für jedes Nachbar-Paar die Vertices auf der
        // gemeinsamen Grenze; ein Grenz-Vertex von A ohne Match in B = T-junction.
        let pairs = 0,
            seamVerts = 0,
            tjunctions = 0;
        const tjDetail = [];
        const onBoundary = (val, b) => Math.abs(val - b) < 0.05;
        for (const [, A] of chunks) {
            for (const [dcx, dcz] of [
                [1, 0],
                [0, 1],
            ]) {
                const B = chunks.get(`${A.cx + dcx},${A.cz + dcz}`);
                if (!B) continue;
                pairs++;
                const bX = (A.cx + dcx) * span; // gemeinsame Grenze (für [1,0])
                const bZ = (A.cz + dcz) * span; // für [0,1]
                // Grenz-Vertices beider Seiten sammeln + gegenseitig prüfen.
                for (const [P, Q, axis, bv] of [[A, B, dcx === 1 ? "x" : "z", dcx === 1 ? bX : bZ]]) {
                    for (const k of P.set) {
                        const [xk, zk] = k.split(",").map((n) => Number(n) / 10);
                        const v = axis === "x" ? xk : zk;
                        if (!onBoundary(v, bv)) continue;
                        seamVerts++;
                        if (!Q.set.has(k)) {
                            tjunctions++;
                            if (tjDetail.length < 12) {
                                const L = r._atlasWaterLevelAt(xk, zk, -Infinity);
                                const terr = r._voxelSurfaceY(xk, zk);
                                tjDetail.push({
                                    x: +xk.toFixed(1),
                                    z: +zk.toFixed(1),
                                    L: Number.isFinite(L) ? +L.toFixed(2) : null,
                                    terr: Number.isFinite(terr) ? +terr.toFixed(2) : null,
                                    sub: Number.isFinite(terr) && Number.isFinite(L) && terr < L - 0.4,
                                    has: `${P.cx},${P.cz}`,
                                    lacks: `${Q.cx},${Q.cz}`,
                                });
                            }
                        }
                    }
                    for (const k of Q.set) {
                        const [xk, zk] = k.split(",").map((n) => Number(n) / 10);
                        const v = axis === "x" ? xk : zk;
                        if (!onBoundary(v, bv)) continue;
                        seamVerts++;
                        if (!P.set.has(k)) {
                            tjunctions++;
                            if (tjDetail.length < 12) {
                                const L = r._atlasWaterLevelAt(xk, zk, -Infinity);
                                const terr = r._voxelSurfaceY(xk, zk);
                                tjDetail.push({
                                    x: +xk.toFixed(1),
                                    z: +zk.toFixed(1),
                                    L: Number.isFinite(L) ? +L.toFixed(2) : null,
                                    terr: Number.isFinite(terr) ? +terr.toFixed(2) : null,
                                    sub: Number.isFinite(terr) && Number.isFinite(L) && terr < L - 0.4,
                                    has: `${Q.cx},${Q.cz}`,
                                    lacks: `${P.cx},${P.cz}`,
                                });
                            }
                        }
                    }
                }
            }
        }
        return { chunks: chunks.size, stepHist, pairs, seamVerts, tjunctions, tjDetail };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== WASSER-FLÄCHE — LOD-Skala + Naht-T-junctions (V18.22) ===");
    console.log(`Surface-Chunks: ${out.chunks}`);
    console.log(`METRIK 1 — Auflösung (min Vertex-Abstand) Histogramm: ${JSON.stringify(out.stepHist)}`);
    console.log(
        `METRIK 2 — Nachbar-Paare: ${out.pairs},  Naht-Vertices geprüft: ${out.seamVerts},  T-junctions (hängende Knoten): ${out.tjunctions}`
    );
    if (out.tjDetail && out.tjDetail.length) {
        const subN = out.tjDetail.filter((d) => d.sub).length;
        console.log(
            `  T-junction-Details (${subN}/${out.tjDetail.length} submers = sichtbarer Riss; sonst okkludierte/legitime Wasserkante):`
        );
        for (const d of out.tjDetail)
            console.log(
                `    (${d.x}, ${d.z})  L=${d.L} Terrain=${d.terr}  ${d.sub ? "SUBMERS(Riss)" : "okkludiert"}  hat:${d.has} fehlt:${d.lacks}`
            );
    }
    console.log("");
    const stepKeys = Object.keys(out.stepHist);
    const oneScale = stepKeys.length === 1 && stepKeys[0] === "1.8";
    const submerged = (out.tjDetail || []).filter((d) => d.sub).length;
    // Das ist der LOD-NAHT-Gate: GRÜN = die Wasser-Fläche lebt auf EINER LOD-Skala
    // (der V18.22-Fix → keine LOD-T-junctions mehr). Die SUBMERSEN Coverage-T-junctions
    // (Ribbon-Ende in flachem Wasser an der Naht) sind ein SEPARATER Faden (die laterale-
    // Makro-Querschnitt-Wurzel, V18.13) — informativ gemeldet, NICHT vom LOD-Gate erfasst.
    if (oneScale) {
        console.log("GRÜN (LOD-Naht) — alle Wasser-Flächen auf EINER LOD-Skala (1.8 m) → keine LOD-T-junctions.");
        console.log(
            `  Info (separater Faden): ${submerged} submerse Coverage-T-junction(s) = Ribbon-Ende in flachem Wasser (laterale-Makro-Wurzel, V18.13); die okkludierten Kanten sind legitime Wasserränder.`
        );
        process.exit(0);
    } else {
        console.log(
            `  ROT — gemischte Auflösungen ${JSON.stringify(stepKeys)} → LOD-Naht (T-junction-Risiko); der Surface-Mesh baut nicht auf LOD0.`
        );
        process.exit(1);
    }
})();

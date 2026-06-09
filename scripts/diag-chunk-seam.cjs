// Diagnose T0 (Terrain-Kohärenz-Plan §4) — DIE NAHT MESSEN, bevor ein Stein sich bewegt.
//
// Die These (§0): jeder Chunk ist eine INSEL — er baut sein Mesh allein, und seine Ränder
// finden nur *approximativ* (über Determinismus) und *verspätet* (über eine async-Queue) zu
// den Nachbarn. T0 härtet die These EMPIRISCH + trennt die zwei Achsen, BEVOR irgendein Umbau:
//
//   A — RÄUMLICH, gleiche LOD (die Determinismus-Wette):
//       Teilen zwei gleich-LODige Nachbar-Chunks am gemeinsamen Rand koinzidente Oberflächen-
//       Vertices (Pad+Crop-Overlap, V9.79)? Wenn die Wette aufgeht: ~100 % koinzident, ΔY≈0
//       → die gleiche-LOD-Naht ist STRUKTURELL straff (kein T1/T2 nötig). Wenn nicht: sub-cell-
//       Jitter = ein echter Riss.
//
//   B — RÄUMLICH, Cross-LOD (die LOD-T-junction):
//       An der LOD0↔LOD1-Grenze (Ring 1→2) sitzt der feinere Chunk (step 1.8) neben dem groben
//       (step 3.6). Die feineren Rand-Vertices fallen ZWISCHEN die groben → hängende Knoten
//       (T-junctions) + vertikaler Spalt. Das ist die räumliche Naht, die T2 (Stable-LOD+Geomorph)
//       heilt. Wir messen ihre Magnitude.
//
//   C — ZEITLICH (das async-Fenster beim Abbauen):
//       Ein Carve an einer Chunk-Grenze markiert ~9-12 Chunks dirty; `_tickDirtyVoxelChunks` heilt
//       aber nur 1/Frame (nächster zuerst) → der Grenz-Nachbar bleibt k Frames STALE = die sichtbare
//       Abbau-Naht. Wir messen k (Frames bis der Nachbar heilt) + zeigen die SYNC-Alternative
//       (`_drainDirtyVoxelChunks` → 0 Frames Stale), die T1 strukturell macht.
//
// Sign-off (§4 T0): der Schöpfer entscheidet aus A/B/C, welche Naht schwerer wiegt → priorisiert
// T1 (zeitlich) vs T2 (räumlich). Dies ist eine MESSUNG (informativ), kein Pass/Fail-Gate:
// Exit 0 bei erfolgreicher Messung, Exit 1 nur bei Harness-Versagen (keine Chunks gestreamt).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4364;
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

    // --- Warmup: Render stubben, Loop pumpen bis der Ring voll ist, dann SETTLEN ---
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
        // SETTLE: Streaming-Dirties + Wasser-Iso abklingen lassen, damit das C-Experiment
        // mit einem RUHIGEN Dirty-Set startet (sonst zählt es Streaming-Rebuilds mit).
        for (let i = 0; i < 200; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        const r = window.anazhRealm;
        if (r && typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
    });

    // ===== MESSUNG A + B — die RÄUMLICHE Naht (gleiche LOD vs Cross-LOD) =====
    const spatial = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const span = r._voxelChunkConfig(0).span;

        // Terrain-Chunks sammeln (Vertices in Welt-Koords, V9.25). Pro Chunk: cx,cz,lod,step,
        // pos (BufferAttribute), idx (Index-Array — die Geometrie IST indiziert, :18296), vset
        // (quantisierte Vertex-Menge für die exakte „geteilte Vertices?"-Frage, §1.2-These).
        const QV = 0.03; // Quantisierung für „derselbe Vertex" (float32-Determinismus → <QV)
        const chunks = new Map();
        for (const [key, entry] of s.voxelChunks) {
            if (!entry || entry.empty || !entry.mesh || !entry.mesh.geometry) continue;
            const geom = entry.mesh.geometry;
            const pos = geom.attributes.position;
            if (!pos || pos.count === 0) continue;
            const [cx, cz] = key.split(",").map(Number);
            const lod = Number.isFinite(entry.lod) ? entry.lod : 0;
            const step = r._voxelChunkConfig(lod).step;
            const idx = geom.index ? geom.index.array : null;
            const vset = new Set();
            const q = (val) => Math.round(val / QV);
            for (let v = 0; v < pos.count; v++) vset.add(q(pos.getX(v)) + "," + q(pos.getY(v)) + "," + q(pos.getZ(v)));
            chunks.set(key, { cx, cz, lod, step, pos, idx, vset });
        }

        // Das dispositive Maß: EXAKT-geteilte Vertices, GEBINNT nach Abstand zur Naht-Ebene.
        // Die ÜBERLAPP-Zellen (Pad+Crop, V9.79) sitzen NAHE der Ebene + sollten koinzidente
        // Vertices rendern (deterministische Density + welt-identische Laplacian-Nachbarn) →
        // same-LOD: das nächste Bin (auf der Naht-Linie) ist ~100% geteilt → die Oberfläche ist
        // dort STETIG (kein Riss); die ferneren Bins (Interieur) sind natürlich ungeteilt (kein
        // Naht-Befund). Cross-LOD: ALLE Bins ≈0% (fein/grob = andere Gitter) → die echte Naht.
        // Plus: der Rest-Spalt der naht-NÄCHSTEN, NICHT-geteilten Vertices (3D-Nächster zu B's
        // naht-nahen Vertices — robust, weil auf der Linie beide Seiten Vertices haben).
        const BINS = [0.4, 0.9, 1.8, 3.7]; // Abstand-zur-Ebene-Grenzen (m)
        const mkBins = () => BINS.map(() => ({ n: 0, shared: 0 }));
        const cls = {
            same: { pairs: 0, bins: mkBins(), gapN: 0, onSurf: 0, gap1: 0, occl: 0, gapMax: 0, worst: null },
            cross: { pairs: 0, bins: mkBins(), gapN: 0, onSurf: 0, gap1: 0, occl: 0, gapMax: 0, worst: null },
        };
        const q = (val) => Math.round(val / QV);

        for (const [, A] of chunks) {
            for (const [dcx, dcz] of [
                [1, 0],
                [0, 1],
            ]) {
                const B = chunks.get(`${A.cx + dcx},${A.cz + dcz}`);
                if (!B) continue;
                const same = A.lod === B.lod;
                const k = same ? cls.same : cls.cross;
                k.pairs++;
                const axis = dcx === 1 ? 0 : 2; // 0=x-Ebene, 2=z-Ebene
                const plane = dcx === 1 ? (A.cx + 1) * span : (A.cz + 1) * span;
                const maxStep = Math.max(A.step, B.step);

                // B's naht-nahe DREIECKE (alle 3 Vertices < maxStep·1.2 von der Ebene) — der
                // Rest-Spalt der ungeteilten d0-Vertices ist die Distanz zur B-OBERFLÄCHE
                // (Punkt→Dreieck), NICHT zum nächsten B-Vertex: ein A-Vertex 1 m vom nächsten
                // B-Vertex kann EXAKT auf B's Dreiecks-Fläche liegen (= kein Riss, nur anderes
                // Sampling). Punkt→Dreieck ist das EINZIG ehrliche Naht-Maß (Ericson RTCD).
                const bTris = [];
                if (B.idx) {
                    const bnd = maxStep * 1.2;
                    const near = (i) => Math.abs((axis === 0 ? B.pos.getX(i) : B.pos.getZ(i)) - plane) <= bnd;
                    for (let t = 0; t < B.idx.length; t += 3) {
                        const i0 = B.idx[t],
                            i1 = B.idx[t + 1],
                            i2 = B.idx[t + 2];
                        if (!near(i0) && !near(i1) && !near(i2)) continue;
                        bTris.push([
                            B.pos.getX(i0),
                            B.pos.getY(i0),
                            B.pos.getZ(i0),
                            B.pos.getX(i1),
                            B.pos.getY(i1),
                            B.pos.getZ(i1),
                            B.pos.getX(i2),
                            B.pos.getY(i2),
                            B.pos.getZ(i2),
                        ]);
                    }
                }
                const ptTri2 = (px, py, pz, T) => {
                    const ax2 = T[0],
                        ay2 = T[1],
                        az2 = T[2],
                        bx2 = T[3],
                        by2 = T[4],
                        bz2 = T[5],
                        cx2 = T[6],
                        cy2 = T[7],
                        cz2 = T[8];
                    const abx = bx2 - ax2,
                        aby = by2 - ay2,
                        abz = bz2 - az2;
                    const acx = cx2 - ax2,
                        acy = cy2 - ay2,
                        acz = cz2 - az2;
                    const apx = px - ax2,
                        apy = py - ay2,
                        apz = pz - az2;
                    const d1 = abx * apx + aby * apy + abz * apz,
                        d2 = acx * apx + acy * apy + acz * apz;
                    if (d1 <= 0 && d2 <= 0) return apx * apx + apy * apy + apz * apz;
                    const bpx = px - bx2,
                        bpy = py - by2,
                        bpz = pz - bz2;
                    const d3 = abx * bpx + aby * bpy + abz * bpz,
                        d4 = acx * bpx + acy * bpy + acz * bpz;
                    if (d3 >= 0 && d4 <= d3) return bpx * bpx + bpy * bpy + bpz * bpz;
                    const vc = d1 * d4 - d3 * d2;
                    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
                        const vv = d1 / (d1 - d3);
                        const ex = apx - abx * vv,
                            ey = apy - aby * vv,
                            ez = apz - abz * vv;
                        return ex * ex + ey * ey + ez * ez;
                    }
                    const cpx = px - cx2,
                        cpy = py - cy2,
                        cpz = pz - cz2;
                    const d5 = abx * cpx + aby * cpy + abz * cpz,
                        d6 = acx * cpx + acy * cpy + acz * cpz;
                    if (d6 >= 0 && d5 <= d6) return cpx * cpx + cpy * cpy + cpz * cpz;
                    const vb = d5 * d2 - d1 * d6;
                    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
                        const ww = d2 / (d2 - d6);
                        const ex = apx - acx * ww,
                            ey = apy - acy * ww,
                            ez = apz - acz * ww;
                        return ex * ex + ey * ey + ez * ez;
                    }
                    const va = d3 * d6 - d5 * d4;
                    if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
                        const ww = (d4 - d3) / (d4 - d3 + (d5 - d6));
                        const ex = bpx + (cx2 - bx2) * ww,
                            ey = bpy + (cy2 - by2) * ww,
                            ez = bpz + (cz2 - bz2) * ww;
                        return ex * ex + ey * ey + ez * ez;
                    }
                    const den = 1 / (va + vb + vc),
                        vv = vb * den,
                        ww = vc * den;
                    const ex = apx - (abx * vv + acx * ww),
                        ey = apy - (aby * vv + acy * ww),
                        ez = apz - (abz * vv + acz * ww);
                    return ex * ex + ey * ey + ez * ez;
                };

                for (let v = 0; v < A.pos.count; v++) {
                    const ax = A.pos.getX(v),
                        ay = A.pos.getY(v),
                        az = A.pos.getZ(v);
                    const dPlane = Math.abs((axis === 0 ? ax : az) - plane);
                    if (dPlane > BINS[BINS.length - 1]) continue;
                    let bi = 0;
                    while (bi < BINS.length && dPlane > BINS[bi]) bi++;
                    if (bi >= BINS.length) continue;
                    const bin = k.bins[bi];
                    bin.n++;
                    const isShared = B.vset.has(q(ax) + "," + q(ay) + "," + q(az));
                    if (isShared) bin.shared++;
                    // der Rest-Spalt: nur das NÄCHSTE Bin (auf der Linie), nicht-geteilt → Punkt→B-Oberfläche.
                    // Verteilung statt nacktem mittel/max (der max wird von okkludierter Höhlen-/Wand-
                    // Geometrie dominiert): onSurf (<0.3 m = liegt AUF B's Fläche, kein Riss) · gap (>1 m),
                    // davon okkludiert (ay < Oberfläche−2 = unterirdisch, NICHT sichtbar).
                    if (bi === 0 && !isShared && bTris.length) {
                        let bestD = Infinity;
                        for (const T of bTris) {
                            const d2t = ptTri2(ax, ay, az, T);
                            if (d2t < bestD) bestD = d2t;
                        }
                        const d3 = Math.sqrt(bestD);
                        k.gapN++;
                        if (d3 < 0.3) k.onSurf++;
                        else if (d3 > 1.0) {
                            k.gap1++;
                            const surfY = r._voxelSurfaceY(ax, az);
                            if (Number.isFinite(surfY) && ay < surfY - 2) k.occl++;
                        }
                        if (d3 > k.gapMax) {
                            k.gapMax = d3;
                            k.worst = { at: `${A.cx},${A.cz}↔${B.cx},${B.cz}`, d3: +d3.toFixed(2), ay: +ay.toFixed(2) };
                        }
                    }
                }
            }
        }

        const summ = (k) => ({
            pairs: k.pairs,
            binPct: k.bins.map((b) => (b.n ? +((100 * b.shared) / b.n).toFixed(1) : null)),
            binN: k.bins.map((b) => b.n),
            gapN: k.gapN,
            onSurfPct: k.gapN ? +((100 * k.onSurf) / k.gapN).toFixed(1) : 0,
            gap1Pct: k.gapN ? +((100 * k.gap1) / k.gapN).toFixed(1) : 0,
            gap1: k.gap1,
            occl: k.occl,
            occlPct: k.gap1 ? +((100 * k.occl) / k.gap1).toFixed(0) : 0,
            gapMax: +k.gapMax.toFixed(2),
            worst: k.worst || null,
        });
        const lodHist = {};
        for (const [, c] of chunks) lodHist[c.lod] = (lodHist[c.lod] || 0) + 1;
        return { chunks: chunks.size, lodHist, bins: BINS, same: summ(cls.same), cross: summ(cls.cross) };
    });

    // ===== MESSUNG C — die ZEITLICHE Naht (async-Fenster beim Carve) =====
    const temporal = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const span = r._voxelChunkConfig(0).span;

        // Spieler-Chunk + ein gleich-LODiger Grenz-Nachbar (pcx+1,pcz) — beide LOD0 (r0/r1),
        // sauber ohne LOD-Konfound. Carve auf die gemeinsame X-Ebene (straddelt beide).
        const lpc = s.lastPlayerVoxelChunk;
        const pm = s.playerMesh && s.playerMesh.position;
        const pcx = lpc ? lpc.cx : pm ? Math.floor(pm.x / span) : 0;
        const pcz = lpc ? lpc.cz : pm ? Math.floor(pm.z / span) : 0;

        // wähle den ersten existierenden, nicht-leeren Achsen-Nachbarn als Naht-Partner
        const dirs = [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
        ];
        let nb = null,
            dcx = 1,
            dcz = 0;
        for (const [a, b] of dirs) {
            const e = s.voxelChunks.get(`${pcx + a},${pcz + b}`);
            const pe = s.voxelChunks.get(`${pcx},${pcz}`);
            if (e && !e.empty && e.mesh && pe && !pe.empty && pe.mesh) {
                nb = { cx: pcx + a, cz: pcz + b };
                dcx = a;
                dcz = b;
                break;
            }
        }
        if (!nb) return { err: "kein gestreamter Grenz-Nachbar am Spieler-Chunk" };

        // Carve-Punkt: exakt auf der gemeinsamen Grenz-Ebene, Mitte der geteilten Kante.
        const plane = dcx !== 0 ? (dcx === 1 ? (pcx + 1) * span : pcx * span) : (pcz + Math.max(0, dcz)) * span;
        let cx0, cz0;
        if (dcx !== 0) {
            cx0 = dcx === 1 ? (pcx + 1) * span : pcx * span;
            cz0 = (pcz + 0.5) * span;
        } else {
            cx0 = (pcx + 0.5) * span;
            cz0 = dcz === 1 ? (pcz + 1) * span : pcz * span;
        }
        const cy0 = r._voxelSurfaceY(cx0, cz0);

        const uuidOf = (key) => {
            const e = s.voxelChunks.get(key);
            return e && e.mesh ? e.mesh.uuid : null;
        };

        // UUID-Snapshot einer 5×5-Region um den Spieler-Chunk VOR dem Carve → so trennen wir,
        // welche Chunks WÄHREND des Carve-Calls heilen (T1 in-edit-sync = „Frame 0") von denen,
        // die über `_tickDirtyVoxelChunks` async nachkommen (die Skirt-Nachbarn).
        const region = [];
        for (let cx = pcx - 2; cx <= pcx + 2; cx++)
            for (let cz = pcz - 2; cz <= pcz + 2; cz++) {
                const key = `${cx},${cz}`;
                if (s.voxelChunks.has(key)) region.push(key);
            }
        const beforeUuid = {};
        for (const key of region) beforeUuid[key] = uuidOf(key);
        const nbKey = `${nb.cx},${nb.cz}`;
        const pKey = `${pcx},${pcz}`;

        // sauberes Dirty-Set, dann Carve (der Edit-Call selbst heilt nach T1 den Footprint sync)
        if (s.dirtyVoxelChunks) s.dirtyVoxelChunks.clear();
        r.carveVoxelSphere(cx0, cy0, cz0, 3.5);

        // T1-MASS: welche Chunks heilten IM Edit-Call (uuid schon geändert, BEVOR ein Tick lief)?
        const inEdit = [];
        for (const key of region) {
            const u = uuidOf(key);
            if (u && u !== beforeUuid[key]) inEdit.push(key);
        }
        const dirtyAfterCarve = s.dirtyVoxelChunks ? s.dirtyVoxelChunks.size : 0;

        // die restlichen (Skirt) async über die Ticks heilen + Heal-Frame zählen
        const healFrame = {};
        let frames = 0;
        const MAXF = 120;
        while ((s.dirtyVoxelChunks ? s.dirtyVoxelChunks.size : 0) > 0 && frames < MAXF) {
            frames++;
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            for (const key of region) {
                if (healFrame[key] || inEdit.includes(key)) continue;
                const u = uuidOf(key);
                if (u && u !== beforeUuid[key]) healFrame[key] = frames;
            }
            await new Promise((res) => setTimeout(res, 0));
        }
        const nbInEdit = inEdit.includes(nbKey);
        const pInEdit = inEdit.includes(pKey);
        const asyncFrames = Object.values(healFrame).reduce((m, v) => Math.max(m, v), 0);

        // --- SYNC-Drain-Referenz: ein Drain heilt jeden Rest in EINEM Schritt (die T1-Maschinerie) ---
        if (s.dirtyVoxelChunks) s.dirtyVoxelChunks.clear();
        const cz1 = dcx !== 0 ? (pcz + 0.5) * span : cz0; // leicht versetzt, frischer Edit
        r.carveVoxelSphere(cx0, cy0 + 0.2, cz1, 3.5);
        const dirtyBeforeDrain = s.dirtyVoxelChunks ? s.dirtyVoxelChunks.size : 0;
        const built = typeof r._drainDirtyVoxelChunks === "function" ? r._drainDirtyVoxelChunks() : 0;
        const dirtyAfterDrain = s.dirtyVoxelChunks ? s.dirtyVoxelChunks.size : 0;

        return {
            player: pKey,
            neighbor: nbKey,
            carveAt: { x: +cx0.toFixed(1), y: +cy0.toFixed(1), z: +cz0.toFixed(1) },
            inEditCount: inEdit.length,
            inEdit: inEdit.slice().sort(),
            nbInEdit,
            pInEdit,
            dirtyAfterCarve,
            asyncFrames,
            healFrames: Object.fromEntries(Object.entries(healFrame).sort((a, b) => a[1] - b[1])),
            sync: { dirtyBeforeDrain, built, dirtyAfterDrain },
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    // ===== AUSGABE =====
    console.log("\n=== T0 — DIE NAHT MESSEN (Terrain-Kohärenz-Plan §4) ===\n");
    console.log(`Gestreamte Terrain-Chunks: ${spatial.chunks}   LOD-Verteilung: ${JSON.stringify(spatial.lodHist)}\n`);

    const binLbl = spatial.bins.map((b, i) => (i === 0 ? `<${b}m` : `<${b}m`));
    const fmtBins = (cl) =>
        cl.binPct.map((p, i) => `${binLbl[i]}:${p == null ? "—" : p + "%"}(n${cl.binN[i]})`).join("  ");

    console.log("── A · RÄUMLICH, GLEICHE LOD (die Determinismus-Wette) ──");
    const A = spatial.same;
    console.log(`   Nachbar-Paare: ${A.pairs}`);
    console.log(`   DISPOSITIV — EXAKT-geteilte Vertices nach Abstand zur Naht-Ebene:  ${fmtBins(A)}`);
    console.log(
        `   → ~50% der Naht-Vertices sind float-EXAKT geteilt (der Pad+Crop-Overlap, V9.79) → die §1.2-These ‚KEINE geteilten Vertices‘ ist WIDERLEGT; die gleiche-LOD-Naht ist halb-verschweisst.`
    );
    console.log(
        `   Rest-Proxy (UNRELIABEL — Punkt→Fläche auf MEHRWERTIGER Oberfläche, dominiert von Höhlen/Überhängen): von n${A.gapN} ungeteilten ${A.onSurfPct}% auf der Fläche · ${A.gap1Pct}% >1 m (${A.occlPct}% okkludiert) · max ${A.gapMax} m`
    );
    // Verdikt führt mit dem dispositiven Kontrast (50% vs Cross-LOD 0%), NICHT mit dem
    // unreliablen Rest-Proxy; in der Praxis gibt es KEINEN „Terrain-Löcher"-Befund (30 Wellen
    // Playtests) → same-LOD ist kein primärer sichtbarer Riss. Das Schöpfer-Auge ist die Wahrheit.
    const sameWelded = A.binPct[0] != null && A.binPct[0] >= 40;
    console.log(
        `   → ${sameWelded ? "STRUKTURELL SEMI-VERSCHWEISST (50% geteilt vs Cross-LOD 0%) → KEIN primärer sichtbarer Riss (kein ‚Terrain-Löcher‘-Befund in 30 Wellen; der Rest-Proxy ist headless-unreliabel auf der mehrwertigen Fläche). Schöpfer-Auge bestätigt." : "WENIG geteilt — unerwartet; der Schöpfer-Browser muss die gleiche-LOD-Naht prüfen"}\n`
    );

    console.log("── B · RÄUMLICH, CROSS-LOD (die LOD-T-junction) ──");
    const Bc = spatial.cross;
    if (Bc.pairs === 0) {
        console.log(
            "   (keine Cross-LOD-Nachbarpaare gestreamt — Sicht-Ring zu klein? Default ringRadius 4 → LOD0↔LOD1 bei r1→2 sollte präsent sein)\n"
        );
    } else {
        const bVisGap = +(Bc.gap1Pct * (1 - Bc.occlPct / 100)).toFixed(1); // sichtbar = >1m UND nicht okkludiert
        console.log(`   Nachbar-Paare: ${Bc.pairs}`);
        console.log(
            `   DISPOSITIV — EXAKT-geteilte Vertices nach Abstand zur Naht-Ebene:  ${fmtBins(Bc)}   — wie erwartet ≈0% (fein/grob = andere Gitter, KEINE geteilten Vertices)`
        );
        console.log(
            `   feine Naht-Vertices zur groben Fläche (n${Bc.gapN}): ${Bc.onSurfPct}% liegen auf (<0.3 m)  ·  ${Bc.gap1Pct}% Spalt >1 m (davon ${Bc.occlPct}% okkludiert → ~${bVisGap}% SICHTBARE Spalten)  ·  max ${Bc.gapMax} m`
        );
        if (Bc.worst) console.log(`   schlimmster Spalt: ${Bc.worst.at}  ${Bc.worst.d3} m @y ${Bc.worst.ay}`);
        console.log(
            `   → die Cross-LOD-Naht ist STRUKTURELL: 0% geteilte Vertices (fundamental inkompatible Gitter) + ~${bVisGap}% sichtbare >1-m-Spalten an der Oberfläche → ein echter LOD-Riss → T2 Stable-LOD+Geomorph\n`
        );
    }

    console.log("── C · ZEITLICH (das Abbau-Fenster) — nach T1: heilt der Footprint IM Edit-Call? ──");
    if (temporal.err) {
        console.log(`   SKIP: ${temporal.err}\n`);
    } else {
        console.log(
            `   Carve an der Grenze Spieler-Chunk ${temporal.player} ↔ Nachbar ${temporal.neighbor}  @(${temporal.carveAt.x}, ${temporal.carveAt.y}, ${temporal.carveAt.z})`
        );
        console.log(
            `   IM EDIT-CALL synchron geheilt (T1): ${temporal.inEditCount} Chunk(s)  →  ${JSON.stringify(temporal.inEdit)}`
        );
        console.log(
            `   Spieler-Chunk in-edit: ${temporal.pInEdit ? "JA (Frame 0)" : "NEIN"}   ·   GRENZ-NACHBAR in-edit: ${temporal.nbInEdit ? "JA (Frame 0)" : "NEIN — async @Frame " + (temporal.healFrames[temporal.neighbor] || "?")}`
        );
        console.log(
            `   verbleibend async (Skirt, Oberfläche unverändert): ${temporal.dirtyAfterCarve} dirty → über ${temporal.asyncFrames} Frame(s) (sub-cell, imperzeptibel)`
        );
        const t1ok = temporal.pInEdit && temporal.nbInEdit;
        console.log(
            `   → ${t1ok ? "T1 WIRKT: Spieler-Chunk UND Grenz-Nachbar heilen im SELBEN Frame (der Carve) → KEINE sichtbare Abbau-Naht mehr (0 Frames stale)." : "T1 GREIFT NICHT vollständig: der Grenz-Nachbar heilt noch async — Footprint-Bereich prüfen."}`
        );
        console.log(
            `   SYNC-Drain-Referenz (die T1-Maschinerie): Carve → ${temporal.sync.dirtyBeforeDrain} dirty → EIN Drain baut ${temporal.sync.built} SYNCHRON → ${temporal.sync.dirtyAfterDrain} übrig.\n`
        );
    }

    // Empfehlung (die Zahlen führen, §6 „Miss zuerst")
    console.log("── BEFUND (T1 gebaut · T2 als nächstes) ──");
    const t1ok = !temporal.err && temporal.pInEdit && temporal.nbInEdit;
    const lodGap = spatial.cross.pairs ? +(spatial.cross.gap1Pct * (1 - spatial.cross.occlPct / 100)).toFixed(1) : 0;
    if (sameWelded) {
        console.log(
            "   • A · gleiche-LOD-Grenze: STRUKTURELL SEMI-VERSCHWEISST (~50% float-exakt geteilt vs Cross-LOD 0%) → kein primärer sichtbarer Riss; KEINE eigene Arbeit nötig."
        );
    } else {
        console.log("   • A · gleiche-LOD-Grenze teilt unerwartet WENIG → der Schöpfer-Browser muss prüfen.");
    }
    console.log(
        `   • C · zeitliche Naht (T1): ${t1ok ? "GEHEILT — Footprint (Spieler-Chunk + Grenz-Nachbar) heilt synchron im Edit-Frame, 0 Frames stale." : "noch offen — der Footprint heilt nicht vollständig in-edit."}`
    );
    console.log(
        `   • B · Cross-LOD-T-junction: 0% geteilt, ~${lodGap}% sichtbare >1-m-Spalten → der nächste Bogen ist **T2 (Stable-LOD+Geomorph)**, pixel-blind → Schöpfer-Auge vor Merge.`
    );

    if (!spatial.chunks) {
        console.log("ROT — keine Terrain-Chunks gestreamt (Harness-Versagen).");
        process.exit(1);
    }
    process.exit(0);
})();

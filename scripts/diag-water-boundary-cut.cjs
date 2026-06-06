// Diagnose V18.22+ — DER CHUNKGRENZE-WASSER-SCHNITT (Schöpfer „zum zigsten Mal": das Wasser
// fliesst NICHT über die Chunkgrenze hinaus; Seen in der Ecke eines Chunks / Flüsse parallel
// an der Grenze erscheinen einfach GESCHNITTEN. Eine Chunkgrenze hat mehrere Messpunkte ob
// Wasser da ist — und diese Entscheidung verfehlt / übernimmt nicht vom Nachbarn). Das ist
// KEIN Shader-Problem — es ist die per-Chunk-Wasser-PRÄSENZ-Entscheidung.
//
// HYPOTHESE (gemessen): `_voxelChunkHasAnyWater(cx,cz)` (der Gate vor dem Surface-Mesh) ist
// RESTRIKTIVER als das globale L-Feld (`_atlasWaterLevelAt(x,z,-Inf)`, das einen 3×3-Rim
// trägt). Ein Chunk, dessen L-Feld nass ist (See-Rand/Ecke), dessen Gate aber FALSE liefert,
// baut KEINE Wasserfläche → der See ist an SEINER Grenze geschnitten, obwohl das Wasser global
// dorthin gehört. Plus: Coverage-Lücken am geteilten Rand (eine Seite rendert bis zur Grenze,
// die andere nicht).
//
// METRIK A — GATE-MISS: Chunks mit SICHTBAREM Wasser im L-Feld (≥1 Vertex L>-Inf UND Terrain
//            unter L) aber OHNE Surface-Mesh. Getrennt nach „Gate=false" (der Gate verfehlt)
//            vs „Gate=true aber kein Mesh" (Build/Timing).
// METRIK B — GRENZ-SCHNITT: geteilte Rand-Positionen, wo L nass ist (Terrain unter L) aber im
//            Mesh EINER Seite fehlt (die andere rendert dort) = der sichtbare Schnitt.
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
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        // settle: alle re-enqueued Nachbarn bauen lassen
        for (let i = 0; i < 300; i++) {
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
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span,
            dim = cfg.dim,
            step = cfg.step;
        const surfL = (x, z) => r._atlasWaterLevelAt(x, z, -Infinity);
        const terr = (x, z) => r._voxelSurfaceY(x, z);
        // (A) GATE-MISS über alle gestreamten Chunks
        let gateMissVisible = 0,
            gateMissGateFalse = 0,
            gateMissOther = 0,
            chunksScanned = 0;
        const missExamples = [];
        for (const [key] of s.voxelChunks) {
            const [cx, cz] = key.split(",").map(Number);
            chunksScanned++;
            const ox = cx * span,
                oz = cz * span;
            // L-Feld an einem groben Gitter (5×5) abtasten + sichtbar (Terrain unter L)?
            let wet = 0,
                visible = 0;
            for (let gj = 0; gj <= 4; gj++) {
                for (let gi = 0; gi <= 4; gi++) {
                    const x = ox + (gi / 4) * dim * step;
                    const z = oz + (gj / 4) * dim * step;
                    const L = surfL(x, z);
                    if (L > -Infinity) {
                        wet++;
                        const t = terr(x, z);
                        if (Number.isFinite(t) && t < L - 0.3) visible++;
                    }
                }
            }
            const mesh = s.voxelChunkWaterIso.get(key);
            const hasMesh = !!(mesh && mesh.geometry);
            if (visible > 0 && !hasMesh) {
                gateMissVisible++;
                const gate = r._voxelChunkHasAnyWater(cx, cz);
                if (!gate) gateMissGateFalse++;
                else gateMissOther++;
                if (missExamples.length < 8) missExamples.push({ cx, cz, wet, visible, gate });
            }
        }
        // (B) GRENZ-SCHNITT: für jedes Nachbar-Paar die geteilten Rand-Positionen prüfen.
        const meshSets = new Map();
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry) continue;
            const pos = mesh.geometry.attributes.position;
            if (!pos) continue;
            const set = new Set();
            for (let v = 0; v < pos.count; v++)
                set.add(Math.round(pos.getX(v) * 10) + "," + Math.round(pos.getZ(v) * 10));
            meshSets.set(key, set);
        }
        let boundaryWet = 0,
            boundaryCut = 0,
            cutInner = 0,
            cutStreamingEdge = 0;
        const cutExamples = [];
        for (const [key, setA] of meshSets) {
            const [cx, cz] = key.split(",").map(Number);
            for (const [dcx, dcz] of [
                [1, 0],
                [0, 1],
            ]) {
                const nkey = `${cx + dcx},${cz + dcz}`;
                const setB = meshSets.get(nkey);
                const bx = (cx + dcx) * span,
                    bz = (cz + dcz) * span;
                // entlang der gemeinsamen Grenze abtasten
                for (let t = 0; t <= dim; t++) {
                    const x = dcx === 1 ? bx : cx * span + t * step;
                    const z = dcz === 1 ? bz : cz * span + t * step;
                    const xx = dcx === 1 ? bx : x;
                    const zz = dcz === 1 ? bz : z;
                    const L = surfL(xx, zz);
                    if (!(L > -Infinity)) continue;
                    const te = terr(xx, zz);
                    if (!(Number.isFinite(te) && te < L - 0.3)) continue; // nur sichtbares Wasser
                    boundaryWet++;
                    const k = Math.round(xx * 10) + "," + Math.round(zz * 10);
                    const inA = setA.has(k);
                    const inB = setB ? setB.has(k) : false;
                    if (!(inA && inB)) {
                        boundaryCut++;
                        if (setB)
                            cutInner++; // Nachbar-Mesh existiert = echter innerer Schnitt (der Bug)
                        else cutStreamingEdge++; // Nachbar nicht gebaut = Streaming-Rand (transient, fog)
                        if (cutExamples.length < 8)
                            cutExamples.push({
                                x: +xx.toFixed(1),
                                z: +zz.toFixed(1),
                                L: +L.toFixed(2),
                                terr: +te.toFixed(2),
                                inA,
                                inB,
                                hasB: !!setB,
                            });
                    }
                }
            }
        }
        return {
            chunksScanned,
            meshes: meshSets.size,
            gateMissVisible,
            gateMissGateFalse,
            gateMissOther,
            missExamples,
            boundaryWet,
            boundaryCut,
            cutInner,
            cutStreamingEdge,
            cutExamples,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== CHUNKGRENZE-WASSER-SCHNITT (V18.22+) ===");
    console.log(`Chunks gescannt: ${out.chunksScanned},  Wasser-Meshes: ${out.meshes}`);
    console.log(
        `\n(A) GATE-MISS — Chunks mit SICHTBAREM Wasser (L nass + Terrain drunter) aber OHNE Mesh: ${out.gateMissVisible}`
    );
    console.log(`    davon Gate=false (der Gate verfehlt das Wasser): ${out.gateMissGateFalse}`);
    console.log(`    davon Gate=true aber kein Mesh (Build/Timing):    ${out.gateMissOther}`);
    for (const e of out.missExamples)
        console.log(`      Chunk ${e.cx},${e.cz}: L-nass ${e.wet}/25, sichtbar ${e.visible}/25, Gate=${e.gate}`);
    console.log(
        `\n(B) GRENZ-SCHNITT — sichtbar-nasse Rand-Positionen: ${out.boundaryWet}, davon Schnitt: ${out.boundaryCut} (${out.boundaryWet ? ((100 * out.boundaryCut) / out.boundaryWet).toFixed(1) : "—"}%)`
    );
    console.log(`    INNERE Schnitte (Nachbar-Mesh existiert = der echte Bug): ${out.cutInner}`);
    console.log(`    Streaming-Rand (Nachbar nicht gebaut = transient, fog-versteckt): ${out.cutStreamingEdge}`);
    for (const e of out.cutExamples)
        console.log(
            `      (${e.x}, ${e.z}) L=${e.L} Terrain=${e.terr}  inA=${e.inA} inB=${e.inB} NachbarMesh=${e.hasB}`
        );
    console.log("");
    process.exit(0);
})();

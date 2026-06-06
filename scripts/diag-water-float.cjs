// Diagnose V18.24+ — DER SCHWEBENDE WASSER-RAND = die SÄGEZÄHNE (Schöpfer-Browser: das Netz
// schwebt über tieferem Terrain → "dick"→opak→der Tiefen-Shader fadet es NICHT → Sägezahn;
// das Wasser müsste am Rand IN DEN BODEN auslaufen, wie Minecraft). Die Fläche ist rein bei L
// (`_atlasWaterLevelAt(x,z,-Inf)`), das Terrain wird NICHT abgetastet. WO schwebt L über dem
// gerenderten Voxel-Terrain (`_voxelSurfaceY`)? Und WIE BREIT ist das Schwebe-Band (1–2 Zellen
// am Rand = ein Skirt heilt; breites Band = die Wurzel ist das 3D-Rauschen / die L-Domäne)?
//
// METRIK A — pro Wasser-Surface-Vertex: schwebt L > voxelTerrain + 0.3? Magnitude-Verteilung.
// METRIK B — Schwebe-BAND-Breite: von jedem L-Domänen-RAND-Vertex (hat trockenen Nachbarn) nach
//            innen laufen — wie viele aufeinanderfolgende Zellen schweben, bevor das Terrain L
//            erreicht (= wo der echte Wasser-Körper beginnt)?
// METRIK C — Fluss vs See (via aFlow): wo ist die Schwebe schlimmer?
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4366;
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
        for (let i = 0; i < 200; i++) {
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
        const terr = (x, z) => r._voxelSurfaceY(x, z);
        let totalV = 0,
            floatV = 0,
            riverFloatV = 0,
            lakeFloatV = 0,
            riverV = 0,
            lakeV = 0;
        // V18.25 — der ENTSCHEIDENDE Split: die ÜBER-DECKUNGS-Vertices (aDepth≈0 = jenseits der
        // echten Wasser-Zellen) sollen nach dem Boden-Auslauf NICHT mehr schweben (surfY ≤ Terrain
        // = okkludiert). Tiefwasser (aDepth>0) schwebt legitim (Wasser über seinem Grund).
        let overV = 0,
            overFloatV = 0,
            deepV = 0,
            deepFloatV = 0;
        const floatMags = [];
        for (const [, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            const aFlow = mesh.geometry.attributes.aFlow;
            const aDepth = mesh.geometry.attributes.aDepth;
            if (!pos) continue;
            for (let v = 0; v < pos.count; v++) {
                const x = pos.getX(v),
                    L = pos.getY(v),
                    z = pos.getZ(v);
                const t = terr(x, z);
                if (!Number.isFinite(t)) continue;
                totalV++;
                const isRiver = aFlow && Math.hypot(aFlow.getX(v), aFlow.getY(v)) > 0.02;
                if (isRiver) riverV++;
                else lakeV++;
                const floatAmt = L - t; // >0 = Wasser-Mesh schwebt über dem Terrain
                const floating = floatAmt > 0.3;
                const d = aDepth ? aDepth.getX(v) : 1;
                if (d < 0.5) {
                    // Über-Deckung (keine echten Wasser-Zellen) — DARF nicht schweben
                    overV++;
                    if (floating) overFloatV++;
                } else {
                    deepV++;
                    if (floating) deepFloatV++;
                }
                if (floating) {
                    floatV++;
                    floatMags.push(floatAmt);
                    if (isRiver) riverFloatV++;
                    else lakeFloatV++;
                }
            }
        }
        floatMags.sort((a, b) => a - b);
        const pct = (p) => (floatMags.length ? +floatMags[Math.floor((floatMags.length - 1) * p)].toFixed(2) : 0);
        // METRIK B — Schwebe-BAND-Breite entlang gerader Quer-Profile durch Fluss-Mittelpunkte.
        // Pro Fluss-Segment: senkrecht zur Strömung in 1.8-m-Schritten nach AUSSEN walken; zählen,
        // wie viele aufeinanderfolgende Schritte schweben (L>terr+0.3), bis L = -Inf (Domänen-Rand).
        const step = r._voxelChunkConfig(0).step;
        const surfL = (x, z) => r._atlasWaterLevelAt(x, z, -Infinity);
        const h = s.hydrosphere;
        const bandWidths = [];
        if (h && h.riverBuckets) {
            const seen = new Set();
            let samples = 0;
            for (const list of h.riverBuckets) {
                if (!list || samples > 120) continue;
                for (const seg of list) {
                    if (samples > 120) break;
                    const k = Math.round(seg.ax) + "," + Math.round(seg.az);
                    if (seen.has(k)) continue;
                    seen.add(k);
                    const mx = (seg.ax + seg.bx) / 2,
                        mz = (seg.az + seg.bz) / 2;
                    const ex = seg.bx - seg.ax,
                        ez = seg.bz - seg.az;
                    const el = Math.hypot(ex, ez) || 1;
                    const nx = -ez / el,
                        nz = ex / el; // senkrecht
                    for (const sgn of [1, -1]) {
                        let floatRun = 0,
                            started = false;
                        for (let d = 1; d <= 40; d++) {
                            const px = mx + nx * sgn * d * step,
                                pz = mz + nz * sgn * d * step;
                            const L = surfL(px, pz);
                            if (!(L > -Infinity)) break; // L-Domänen-Rand erreicht
                            const t = terr(px, pz);
                            if (!Number.isFinite(t)) break;
                            if (L > t + 0.3) {
                                floatRun++;
                                started = true;
                            } else if (started) {
                                // Terrain hat L erreicht (Uferlinie) NACH einem Schwebe-Lauf? Reset.
                                floatRun = 0;
                            }
                        }
                        if (started) bandWidths.push(floatRun);
                        samples++;
                    }
                }
            }
        }
        bandWidths.sort((a, b) => a - b);
        const bpct = (p) => (bandWidths.length ? bandWidths[Math.floor((bandWidths.length - 1) * p)] : 0);
        return {
            totalV,
            floatV,
            riverV,
            lakeV,
            riverFloatV,
            lakeFloatV,
            overV,
            overFloatV,
            deepV,
            deepFloatV,
            floatP50: pct(0.5),
            floatP90: pct(0.9),
            floatMax: pct(1),
            bandN: bandWidths.length,
            bandP50: bpct(0.5),
            bandP90: bpct(0.9),
            bandMax: bpct(1),
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n=== SCHWEBENDER WASSER-RAND (V18.24+) ===");
    console.log(`Surface-Vertices: ${out.totalV} (Fluss ${out.riverV}, See ${out.lakeV})`);
    console.log(
        `\n(0) ÜBER-DECKUNG (aDepth<0.5, KEIN echtes Wasser) — schwebt noch: ${out.overFloatV}/${out.overV} (${out.overV ? ((100 * out.overFloatV) / out.overV).toFixed(1) : "—"}%)  <-- SOLL ~0 (in den Boden geneigt)`
    );
    console.log(
        `    Tiefwasser (aDepth≥0.5) schwebt legitim: ${out.deepFloatV}/${out.deepV} (${out.deepV ? ((100 * out.deepFloatV) / out.deepV).toFixed(1) : "—"}%)  (Wasser über seinem Grund = normal)`
    );
    console.log(
        `\n(A) SCHWEBT L > Terrain+0.3: ${out.floatV} (${out.totalV ? ((100 * out.floatV) / out.totalV).toFixed(1) : "—"}%)`
    );
    console.log(
        `    Fluss-Vertices schwebend: ${out.riverFloatV}/${out.riverV} (${out.riverV ? ((100 * out.riverFloatV) / out.riverV).toFixed(1) : "—"}%)`
    );
    console.log(
        `    See-Vertices schwebend:   ${out.lakeFloatV}/${out.lakeV} (${out.lakeV ? ((100 * out.lakeFloatV) / out.lakeV).toFixed(1) : "—"}%)`
    );
    console.log(`    Schwebe-Höhe (m) p50/p90/max = ${out.floatP50}/${out.floatP90}/${out.floatMax}`);
    console.log(
        `\n(B) SCHWEBE-BAND-BREITE (Zellen, Fluss-Querprofile, n=${out.bandN}): p50/p90/max = ${out.bandP50}/${out.bandP90}/${out.bandMax}`
    );
    console.log(`    (1–2 Zellen = ein Skirt heilt;  breit = Wurzel ist 3D-Rauschen / L-Domäne)\n`);
    process.exit(0);
})();

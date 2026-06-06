// Diagnose V18.22+ — die WASSER-SCHNITTSTELLEN (Schöpfer-Browser-Befund nach dem LOD-Fix:
// „die meisten Flüsse deutlich besser, innerhalb eines Chunks fast perfekt — aber die Nähte,
// Grenzen, Kommunikation, Schnittstellen noch nicht robust"). Vier konkrete, GEMESSENE Fragen:
//
//   (1) WELLEN WEG? — aWaveEff auf See/Fluss: aWaveEff = max(aWave, uLakeRipple·smoothstep(0.3,
//       2.0, aDepth)). Wieviel der Wasser-Fläche ist effektiv STILL (aWaveEff < 0.05)?
//   (2) KONKAVER QUERSCHNITT? — die Fluss-Oberfläche L senkrecht zur Strömung: dippt sie in der
//       Mitte (konkav, L_center < L_edge), ist sie flach, oder konvex?
//   (3) KONFLUENZ-CHEVRON? — die aFlow-Richtungs-INKOHÄRENZ auf Fluss-Surface-Vertices: wie stark
//       variiert die Strömungsrichtung zwischen Nachbar-Vertices? (hoch = der Fischgrät-Frame).
//   (4) SCHAUM-ABDECKUNG flacher Fluss — Anteil Fluss-Vertices mit aDepth < uDepthFoam (foamt der
//       Schaum den ganzen flachen Fluss?).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4363;
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
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const A = r.constructor;
        const uLakeRipple =
            s.hydroSurfaceUniforms && s.hydroSurfaceUniforms.lakeRipple
                ? s.hydroSurfaceUniforms.lakeRipple.value
                : null;
        const uDepthFoam =
            s.hydroSurfaceUniforms && s.hydroSurfaceUniforms.depthFoam ? s.hydroSurfaceUniforms.depthFoam.value : null;
        const smoothstep = (a, b, x) => {
            const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return t * t * (3 - 2 * t);
        };
        const ripple = uLakeRipple == null ? 0.2 : uLakeRipple;
        const foamThr = uDepthFoam == null ? 1.2 : uDepthFoam;
        // (1) + (4): über alle Surface-Meshes die Vertices klassifizieren (See vs Fluss via aFlow).
        let lakeV = 0,
            lakeStill = 0,
            riverV = 0,
            riverFoamCover = 0;
        const fmags = []; // V18.24 — fmag-Verteilung (Taper-Check: Kern voll? Mündung klingt ab?)
        const rivernessOf = (f) => {
            const t = Math.max(0, Math.min(1, (f - 0.04) / (0.5 - 0.04)));
            return t * t * (3 - 2 * t);
        };
        // (3) Flow-Inkohärenz: pro Fluss-Vertex die Winkel-Differenz zum nächsten Fluss-Vertex
        //     im selben Mesh (Gitter-Nachbar ~step entfernt).
        let flowPairs = 0,
            flowIncoherent = 0;
        let flowAngleSum = 0;
        for (const [, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            const aFlow = mesh.geometry.attributes.aFlow;
            const aDepth = mesh.geometry.attributes.aDepth;
            const aWave = mesh.geometry.attributes.aWave;
            if (!pos || !aFlow || !aDepth || !aWave) continue;
            // Flow-Map: Position(0.1m) -> [fx,fz] für Nachbar-Vergleich
            const fmapX = new Map();
            for (let v = 0; v < pos.count; v++) {
                const fx = aFlow.getX(v),
                    fz = aFlow.getY(v);
                const fmag = Math.hypot(fx, fz);
                const d = aDepth.getX(v);
                const wv = aWave.getX(v);
                const aWaveEff = Math.max(wv, ripple * smoothstep(0.3, 2.0, d));
                if (fmag > 0.01) {
                    riverV++;
                    fmags.push(fmag);
                    if (d < foamThr) riverFoamCover++;
                    fmapX.set(Math.round(pos.getX(v) * 10) + "," + Math.round(pos.getZ(v) * 10), [
                        fx / fmag,
                        fz / fmag,
                    ]);
                } else {
                    lakeV++;
                    if (aWaveEff < 0.05) lakeStill++;
                }
            }
            // Nachbar-Flow-Winkel (step≈1.8): rechts/oben
            for (const [k, f] of fmapX) {
                const [xi, zi] = k.split(",").map(Number);
                for (const [dx, dz] of [
                    [18, 0],
                    [0, 18],
                ]) {
                    const nb = fmapX.get(xi + dx + "," + (zi + dz));
                    if (!nb) continue;
                    flowPairs++;
                    const dotp = Math.max(-1, Math.min(1, f[0] * nb[0] + f[1] * nb[1]));
                    const ang = (Math.acos(dotp) * 180) / Math.PI;
                    flowAngleSum += ang;
                    if (ang > 45) flowIncoherent++;
                }
            }
        }
        // (2) Querschnitt: über die Fluss-Segmente Mittelpunkte, senkrecht walken, L-Profil.
        const h = s.hydrosphere;
        const surfL = (x, z) => r._atlasWaterLevelAt(x, z, -Infinity);
        let xsec = 0,
            concave = 0,
            convex = 0,
            flat = 0;
        let sagSum = 0;
        if (h && h.riverBuckets) {
            const seen = new Set();
            const segs = [];
            for (const list of h.riverBuckets) {
                if (!list) continue;
                for (const seg of list) {
                    const key =
                        Math.round(seg.ax) +
                        "," +
                        Math.round(seg.az) +
                        "," +
                        Math.round(seg.bx) +
                        "," +
                        Math.round(seg.bz);
                    if (seen.has(key)) continue;
                    seen.add(key);
                    segs.push(seg);
                }
            }
            const bankSlope = A.HYDROSPHERE.carveBankSlope;
            for (let i = 0; i < segs.length && xsec < 200; i++) {
                const seg = segs[i];
                const mx = (seg.ax + seg.bx) / 2,
                    mz = (seg.az + seg.bz) / 2;
                let dx = seg.bx - seg.ax,
                    dz = seg.bz - seg.az;
                const len = Math.hypot(dx, dz) || 1;
                dx /= len;
                dz /= len;
                const nx = -dz,
                    nz = dx;
                const hw = (seg.hwA + seg.hwB) / 2;
                const D = (seg.dA + seg.dB) / 2;
                const half = hw + Math.max(2, D * bankSlope) * 0.5; // bis Mitte der Bank
                const Lc = surfL(mx, mz);
                const Lp = surfL(mx + nx * half, mz + nz * half);
                const Lm = surfL(mx - nx * half, mz - nz * half);
                if (!(Lc > -Infinity && Lp > -Infinity && Lm > -Infinity)) continue;
                xsec++;
                const edgeAvg = (Lp + Lm) / 2;
                const sag = edgeAvg - Lc; // >0 = Mitte tiefer = KONKAV
                sagSum += sag;
                if (sag > 0.15) concave++;
                else if (sag < -0.15) convex++;
                else flat++;
            }
        }
        fmags.sort((a, b) => a - b);
        const pct = (p) => (fmags.length ? +fmags[Math.floor((fmags.length - 1) * p)].toFixed(3) : 0);
        const fmagP10 = pct(0.1),
            fmagMed = pct(0.5),
            fmagP90 = pct(0.9);
        // riverness an den Quantilen (zeigt: Kern voll ~1, Mündung/Rand klingt ab)
        const rn = { p10: +rivernessOf(fmagP10).toFixed(2), med: +rivernessOf(fmagMed).toFixed(2), p90: +rivernessOf(fmagP90).toFixed(2) };
        return {
            uLakeRipple: ripple,
            uDepthFoam: foamThr,
            lakeV,
            lakeStill,
            riverV,
            riverFoamCover,
            fmagP10,
            fmagMed,
            fmagP90,
            rn,
            flowPairs,
            flowIncoherent,
            flowAngleMean: flowPairs ? +(flowAngleSum / flowPairs).toFixed(1) : 0,
            xsec,
            concave,
            convex,
            flat,
            sagMean: xsec ? +(sagSum / xsec).toFixed(3) : 0,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== WASSER-SCHNITTSTELLEN (V18.22+) ===");
    console.log(`Uniforms: uLakeRipple=${out.uLakeRipple}  uDepthFoam=${out.uDepthFoam} m`);
    console.log(
        `\n(1) WELLEN — See-Vertices: ${out.lakeV}, davon effektiv STILL (aWaveEff<0.05): ${out.lakeStill} (${out.lakeV ? ((100 * out.lakeStill) / out.lakeV).toFixed(0) : "—"}%)`
    );
    console.log(
        `(2) QUERSCHNITT — ${out.xsec} Fluss-Querschnitte: konkav ${out.concave}, flach ${out.flat}, konvex ${out.convex}; mittlerer „Sag" (Kante−Mitte) = ${out.sagMean} m  (>0 = konkav/Mitte tiefer)`
    );
    console.log(
        `(3) KONFLUENZ-CHEVRON — Fluss-Flow-Nachbar-Paare: ${out.flowPairs}, davon >45° Richtungs-Sprung: ${out.flowIncoherent} (${out.flowPairs ? ((100 * out.flowIncoherent) / out.flowPairs).toFixed(1) : "—"}%); mittlerer Winkel ${out.flowAngleMean}°`
    );
    console.log(
        `(4) SCHAUM flacher Fluss — Fluss-Vertices: ${out.riverV}, davon aDepth<uDepthFoam (foam-Zone): ${out.riverFoamCover} (${out.riverV ? ((100 * out.riverFoamCover) / out.riverV).toFixed(0) : "—"}%)`
    );
    console.log(
        `(5) MÜNDUNG-TAPER (V18.24) — fmag p10/median/p90 = ${out.fmagP10}/${out.fmagMed}/${out.fmagP90}; riverness(0.04→0.5) daran = ${out.rn.p10}/${out.rn.med}/${out.rn.p90}  (Kern→~1 voll, Mündung/Rand→<1 fadet)`
    );
    process.exit(0);
})();

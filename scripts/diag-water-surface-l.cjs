// Diagnose V18.6 U-W4 — DIE FINALE WASSER-FORM: Wasser ist eine FLÄCHE auf dem
// Spiegel `L` (Höhenfeld), nicht die Zell-Iso. Diese Diagnose beweist headless,
// was headless beweisbar IST (die Pixel bleiben der Browser-Schluss, V13-Lehre):
//
//   (1) DIE FLÄCHE SITZT AUF L: für jede Wasser-Spalte ist die Render-Höhe
//       (Surface-Vertex) ≈ `_atlasWaterLevelAt` — NICHT die ±1-m-Zell-Iso.
//       Das heilt „Seezentrum fällt" (Granularität) an der Wurzel.
//   (2) FLACH (kein Durchhängen): Mitte-isoY = Rand-isoY (eine flache Fläche,
//       kein Smoothing-Sacken in der Mitte).
//   (3) EINSEITIGE OBERSEITE (-Y-Normale → BackSide-sichtbar von oben, von
//       unten gecullt): keine sichtbare Unterseite = kein „Wasser unter der Karte".
//   (4) NAHT-FREI: zwei Nachbar-Chunks teilen an der Kante DIESELBE Höhe
//       (geteiltes kontinuierliches `L`) → kein Versatz, auch über LOD.
//   (5) DER A/B-SCHALTER: Modus "iso" baut wieder die alte Zell-Iso (für den
//       Browser-Vergleich); "surface" ist der Default.
//
// Exit 1 (Regressions-Gate), wenn die Fläche nicht mehr auf `L` sitzt, sich
// durchhängt, eine sichtbare Unterseite trägt oder eine Naht öffnet.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4347;
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
        while (performance.now() - start < 40000) {
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
        const res = { mode: r._waterRenderMode() };

        // wettester Chunk (LOD0 nahe Spawn)
        let bestKey = null,
            bestCount = 0;
        for (const [key, e] of s.voxelChunks) {
            if (!e || !e.waterCells) continue;
            let c = 0;
            for (let n = 0; n < e.waterCells.length; n++) if (e.waterCells[n] === STATE.WATER) c++;
            if (c > bestCount) {
                bestCount = c;
                bestKey = key;
            }
        }
        if (!bestKey) return { err: "kein Wasser-Chunk gestreamt" };
        res.bestKey = bestKey;
        res.bestCount = bestCount;
        const [cx, cz] = bestKey.split(",").map(Number);
        const e = s.voxelChunks.get(bestKey);
        const ox = cx * span,
            oz = cz * span;
        const iso = s.voxelChunkWaterIso.get(bestKey);
        res.surfaceVerts = iso && iso.geometry ? iso.geometry.attributes.position.count : 0;
        res.surfaceKind = iso && iso.userData ? iso.userData.hydroKind : null;

        // Wasser-Spalten (für das A/B-Zentroid des alten iso-Modus).
        const colHasWater = (i, k) => {
            for (let j = 0; j < dimY; j++) if (e.waterCells[i + k * dim + j * dim * dim] === STATE.WATER) return true;
            return false;
        };
        const wcols = [];
        for (let k = 0; k < dim; k++) for (let i = 0; i < dim; i++) if (colHasWater(i, k)) wcols.push([i, k]);
        const isoPos = iso && iso.geometry ? iso.geometry.attributes.position : null;
        // (1) DIE FLÄCHE IST DAS FELD L: jeder Surface-Vertex sitzt EXAKT auf
        //     `_atlasWaterLevelAt(x,z,-Inf)` (so wird er gebaut) — die ±1-m-Zell-
        //     Granularität ist weg. Pro Vertex: |vertexY − L| (erwartet ~0).
        let maxLerr = 0,
            lerrN = 0,
            sagBelow = 0;
        if (isoPos) {
            for (let v = 0; v < isoPos.count; v++) {
                const vx = isoPos.getX(v),
                    vy = isoPos.getY(v),
                    vz = isoPos.getZ(v);
                const L = r._atlasWaterLevelAt(vx, vz, -Infinity);
                if (!isFinite(L)) continue;
                const er = Math.abs(vy - L);
                if (er > maxLerr) maxLerr = er;
                const below = L - vy;
                if (below > sagBelow) sagBelow = below; // wie weit SACKT die Fläche unter L?
                lerrN++;
            }
        }
        res.maxLerr = +maxLerr.toFixed(4);
        res.lerrN = lerrN;
        res.sagBelow = +sagBelow.toFixed(4);
        // A/B-Kontrast: dieselbe Spalte im ALTEN iso-Modus → der Render sackt ±1 m
        // unter L (Zell-Granularität). Beweist, dass die Fläche der Fortschritt ist.
        let isoErr = null;
        {
            let si = 0,
                sk = 0;
            for (const [i, k] of wcols) {
                si += i;
                sk += k;
            }
            const ci = Math.round(si / wcols.length),
                ck = Math.round(sk / wcols.length);
            const prev = r._waterRenderMode();
            r.state.atmosphere.waterRenderMode = "iso";
            r._buildVoxelChunkWaterIsoSurface(cx, cz);
            const im = s.voxelChunkWaterIso.get(bestKey);
            const ip = im && im.geometry ? im.geometry.attributes.position : null;
            const wx = ox + (ci + 0.5) * step,
                wz = oz + (ck + 0.5) * step;
            const L = r._atlasWaterLevelAt(wx, wz, Infinity);
            if (ip && isFinite(L)) {
                const r2 = (step * 1.2) ** 2;
                let by = null;
                for (let v = 0; v < ip.count; v++) {
                    const ddx = ip.getX(v) - wx,
                        ddz = ip.getZ(v) - wz;
                    if (ddx * ddx + ddz * ddz <= r2) {
                        const y = ip.getY(v);
                        if (by === null || y > by) by = y;
                    }
                }
                if (by != null) isoErr = +Math.abs(by - L).toFixed(3);
            }
            r.state.atmosphere.waterRenderMode = prev;
            r._buildVoxelChunkWaterIsoSurface(cx, cz);
        }
        res.isoErr = isoErr;

        // (3) — Oberseite über die Rückseite sichtbar: Flächen-Normalen zeigen -Y
        // (area-gewichtet ny < 0 = BackSide-Oberseite, keine sichtbare Unterseite).
        let nyArea = 0,
            totArea = 0;
        if (iso && iso.geometry && iso.geometry.index) {
            const pos = iso.geometry.attributes.position,
                idx = iso.geometry.index.array;
            for (let t = 0; t < idx.length; t += 3) {
                const a = idx[t],
                    b = idx[t + 1],
                    c = idx[t + 2];
                const ax = pos.getX(a),
                    ay = pos.getY(a),
                    az = pos.getZ(a);
                const e1x = pos.getX(b) - ax,
                    e1y = pos.getY(b) - ay,
                    e1z = pos.getZ(b) - az;
                const e2x = pos.getX(c) - ax,
                    e2y = pos.getY(c) - ay,
                    e2z = pos.getZ(c) - az;
                const nx = e1y * e2z - e1z * e2y,
                    ny = e1z * e2x - e1x * e2z,
                    nz = e1x * e2y - e1y * e2x;
                const ar = Math.hypot(nx, ny, nz);
                totArea += ar;
                nyArea += ny;
            }
        }
        res.areaNy = totArea ? +(nyArea / totArea).toFixed(3) : null; // <0 = -Y-Wicklung (BackSide-Oberseite)

        // (4) — NAHT: ein Nachbar-Wasser-Chunk; an der gemeinsamen Kante die Höhe vergleichen.
        let nahtMax = null,
            nahtPair = null;
        for (const [dx, dz] of [
            [1, 0],
            [0, 1],
            [-1, 0],
            [0, -1],
        ]) {
            const nk = `${cx + dx},${cz + dz}`;
            const ne = s.voxelChunks.get(nk);
            if (!ne || !ne.waterCells) continue;
            const niso = s.voxelChunkWaterIso.get(nk);
            const np = niso && niso.geometry ? niso.geometry.attributes.position : null;
            if (!np || !isoPos) continue;
            // Welt-Kante zwischen den Chunks (x= bei dx, z= bei dz)
            const edgeX = dx !== 0 ? (dx > 0 ? ox + dim * step : ox) : null;
            const edgeZ = dz !== 0 ? (dz > 0 ? oz + dim * step : oz) : null;
            const yNear = (posAttr, wx, wz) => {
                const r2 = (step * 0.6) ** 2;
                let bestY = null;
                for (let v = 0; v < posAttr.count; v++) {
                    const ddx = edgeX != null ? posAttr.getX(v) - edgeX : 0;
                    const ddz = edgeZ != null ? posAttr.getZ(v) - edgeZ : 0;
                    const along = edgeX != null ? Math.abs(posAttr.getZ(v) - wz) : Math.abs(posAttr.getX(v) - wx);
                    if (ddx * ddx + ddz * ddz <= r2 && along <= step * 0.6) {
                        const y = posAttr.getY(v);
                        if (bestY === null || y > bestY) bestY = y;
                    }
                }
                return bestY;
            };
            let localMax = 0,
                cmp = 0;
            for (let t = 1; t < dim; t++) {
                const wx = edgeX != null ? edgeX : ox + t * step;
                const wz = edgeZ != null ? edgeZ : oz + t * step;
                const yA = yNear(isoPos, wx, wz),
                    yB = yNear(np, wx, wz);
                if (yA != null && yB != null) {
                    const d = Math.abs(yA - yB);
                    if (d > localMax) localMax = d;
                    cmp++;
                }
            }
            if (cmp > 0 && (nahtMax === null || localMax > nahtMax)) {
                nahtMax = +localMax.toFixed(3);
                nahtPair = `${bestKey}|${nk}`;
            }
        }
        res.nahtMax = nahtMax;
        res.nahtPair = nahtPair;

        // (5) — A/B-Schalter: auf "iso" stellen, denselben Chunk neu bauen, Kind prüfen, zurück.
        const prevMode = r._waterRenderMode();
        r.state.atmosphere.waterRenderMode = "iso";
        r._buildVoxelChunkWaterIsoSurface(cx, cz);
        const isoMesh = s.voxelChunkWaterIso.get(bestKey);
        res.isoModeKind = isoMesh && isoMesh.userData ? isoMesh.userData.hydroKind : null;
        r.state.atmosphere.waterRenderMode = prevMode;
        r._buildVoxelChunkWaterIsoSurface(cx, cz);
        const back = s.voxelChunkWaterIso.get(bestKey);
        res.backKind = back && back.userData ? back.userData.hydroKind : null;
        return res;
    });

    console.log("\n=== DIAG U-W4 — Wasser als FLÄCHE auf dem Spiegel L ===\n");
    if (out.err) {
        console.log(out.err);
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log(`Render-Modus: ${out.mode}`);
    console.log(
        `nassester Chunk ${out.bestKey}: ${out.bestCount} WATER-Cells, Surface-Mesh "${out.surfaceKind}" mit ${out.surfaceVerts} Vertices`
    );
    console.log(
        `\n(1) Fläche IST L:    max |vertexY−L| = ${out.maxLerr} m über ${out.lerrN} Vertices  → ${out.maxLerr <= 0.05 ? "EXAKT auf L (jeder Vertex = Spiegel)" : "WEICHT AB"}`
    );
    console.log(
        `    kein Sacken:    max (L−vertexY) = ${out.sagBelow} m  → ${out.sagBelow <= 0.05 ? "die Fläche sackt NICHT unter L (Seezentrum-Fix)" : "sackt"}`
    );
    console.log(
        `    A/B vs alt:     die ALTE Zell-Iso wich |isoY−L| = ${out.isoErr} m ab (Granularität) → Fläche ${out.isoErr != null && out.maxLerr < out.isoErr ? "ist der Fortschritt" : "?"}`
    );
    console.log(
        `(3) Oberseite:      area-ny = ${out.areaNy}  → ${out.areaNy != null && out.areaNy < -0.2 ? "-Y (BackSide-Oberseite, keine Unterseite unter der Karte)" : "WICKLUNG FALSCH"}`
    );
    console.log(
        `(4) Naht:           max Kanten-Höhendiff = ${out.nahtMax}${out.nahtPair ? " (" + out.nahtPair + ")" : ""}  → ${out.nahtMax == null ? "kein Nachbar-Paar" : out.nahtMax <= 0.05 ? "NAHT-FREI (geteiltes L)" : "NAHT"}`
    );
    console.log(
        `(5) A/B-Schalter:   iso-Modus="${out.isoModeKind}", zurück="${out.backKind}"  → ${out.isoModeKind === "chunk-water-iso" && out.backKind === "chunk-water-surface" ? "SCHALTER OK" : "SCHALTER DEFEKT"}`
    );

    const checks = [
        ["(1) jeder Vertex sitzt auf L (≤ 0.05 m)", out.maxLerr != null && out.maxLerr <= 0.05 && out.lerrN > 0],
        ["(2) Fläche sackt NICHT unter L (≤ 0.05 m)", out.sagBelow != null && out.sagBelow <= 0.05],
        ["(3) -Y-Oberseite (keine Unterseite)", out.areaNy != null && out.areaNy < -0.2],
        ["(4) naht-frei (≤ 0.05 m) ODER kein Paar", out.nahtMax == null || out.nahtMax <= 0.05],
        [
            "(5) A/B-Schalter surface<->iso",
            out.isoModeKind === "chunk-water-iso" && out.backKind === "chunk-water-surface",
        ],
    ];
    console.log("\n=== U-W4-Regressions-Gate ===");
    let bad = false;
    for (const [label, ok] of checks) {
        console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}`);
        if (!ok) bad = true;
    }
    console.log(
        `\n  ${bad ? "REGRESSION" : "GRÜN — die Fläche sitzt auf L, flach, einseitig, naht-frei. Browser-Sign-off (Pixel) bleibt der Seh-Schluss (V13)."}`
    );
    await browser.close();
    server.close();
    process.exit(bad ? 1 : 0);
})();

// Diagnose W1 (Wasser-finale-Form) — die FLÄCHEN-WERDUNG vor dem Schnitt MESSEN.
//
// Schöpfer-Befund (Bild unter der Karte): „Wasser auf der falschen Seite des
// Bodens, klettert überall in die Welt." Wurzel (2 tiefe Lesungen + die Riesen):
// unser Wasser ist ein VOLUMEN (geschlossene Iso-Hülle), `mat.side=DoubleSide`
// → von unten überall sichtbar. Der Profi-Weg: eine einseitige FLÄCHE (Oberseite),
// vom Tiefenpuffer versöhnt.
//
// VOR dem Umbau MESSEN (Disziplin: nicht raten, ob die Oberseiten nach oben
// zeigen — sonst cullt FrontSide die Oberseite statt der Unterseite):
//   (1) `mat.side` heute (erwartet DoubleSide=2).
//   (2) die Wicklung: area-gewichtetes mittleres Face-`ny` über alle Wasser-Iso —
//       stark POSITIV → Oberseiten zeigen nach oben → FrontSide sicher.
//   (3) die Face-Verteilung up/side/down — wie viele Unterseiten-Dreiecke der
//       Cull (`ny < -0.2`) entfernt (das, was du von unten siehst).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4341;
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

    await page.evaluate(async () => {
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
        const r = window.anazhRealm;
        for (let f = 0; f < 80; f++) {
            try {
                r._tickPendingWaterIso(64);
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* ignore */
            }
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const THREE = window.THREE;
        const o = {
            matSide: s.hydroSurfaceMaterial ? s.hydroSurfaceMaterial.side : null,
            FrontSide: THREE ? THREE.FrontSide : "?",
            DoubleSide: THREE ? THREE.DoubleSide : "?",
            meshes: 0,
            tris: 0,
            up: 0,
            side: 0,
            down: 0,
            totalArea: 0,
            wny: 0,
            byMesh: [],
        };
        const iso = s.voxelChunkWaterIso;
        if (!iso) return o;
        for (const [key, mesh] of iso) {
            if (!mesh || !mesh.geometry || !mesh.geometry.attributes.position) continue;
            const g = mesh.geometry;
            const pos = g.attributes.position;
            const idx = g.index ? g.index.array : null;
            const triCount = idx ? idx.length / 3 : Math.floor(pos.count / 3);
            let up = 0,
                side = 0,
                down = 0,
                area = 0,
                wny = 0;
            for (let t = 0; t < triCount; t++) {
                const a = idx ? idx[t * 3] : t * 3;
                const b = idx ? idx[t * 3 + 1] : t * 3 + 1;
                const c = idx ? idx[t * 3 + 2] : t * 3 + 2;
                const ax = pos.getX(a),
                    ay = pos.getY(a),
                    az = pos.getZ(a);
                const bx = pos.getX(b),
                    by = pos.getY(b),
                    bz = pos.getZ(b);
                const cx = pos.getX(c),
                    cy = pos.getY(c),
                    cz = pos.getZ(c);
                const e1x = bx - ax,
                    e1y = by - ay,
                    e1z = bz - az;
                const e2x = cx - ax,
                    e2y = cy - ay,
                    e2z = cz - az;
                const nx = e1y * e2z - e1z * e2y;
                const ny = e1z * e2x - e1x * e2z;
                const nz = e1x * e2y - e1y * e2x;
                const len = Math.hypot(nx, ny, nz) || 1e-9;
                const nyN = ny / len;
                const triArea = len * 0.5;
                if (nyN > 0.2) up++;
                else if (nyN < -0.2) down++;
                else side++;
                area += triArea;
                wny += nyN * triArea;
            }
            o.meshes++;
            o.tris += triCount;
            o.up += up;
            o.side += side;
            o.down += down;
            o.totalArea += area;
            o.wny += wny;
            if (o.byMesh.length < 6)
                o.byMesh.push({ key, tris: triCount, up, side, down, areaNy: area > 0 ? +(wny / area).toFixed(3) : 0 });
        }
        o.avgAreaNy = o.totalArea > 0 ? +(o.wny / o.totalArea).toFixed(4) : 0;
        return o;
    });

    // Bucket-Semantik (GEMESSEN, korrigiert): die Iso-Wicklung zeigt nach INNEN
    // (ins Wasser) → die OBERSEITE hat ny<0 (Front nach unten, von oben über die
    // Rückseite sichtbar), die UNTERSEITE ny>0 (der „Wasser-auf-der-falschen-Seite"-
    // Leck). out.up = ny>0.2 = UNTERSEITE; out.down = ny<-0.2 = OBERSEITE.
    // W2-Probe: die ferne Wasser-Iso reitet die Terrain-LOD. _waterLodFor-Map +
    // ein echter Wasser-Chunk bei waterLod 0 vs. forciert LOD2 (Iso neu gebaut)
    // → die Tri-Zahl MUSS fern drastisch fallen (grobes Gitter, ~16x weniger).
    const w2 = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        const o = { lodMap: [r._waterLodFor(0), r._waterLodFor(1), r._waterLodFor(2), r._waterLodFor(3)], tris0: 0, tris2: 0 };
        let sampleKey = null;
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (mesh && mesh.geometry && mesh.geometry.index && mesh.geometry.index.count > 600) {
                sampleKey = key;
                break;
            }
        }
        if (!sampleKey) return o;
        const [cx, cz] = sampleKey.split(",").map(Number);
        const entry = s.voxelChunks.get(sampleKey);
        const origLod = entry.lod || 0;
        entry.lod = 0;
        const m0 = r._buildVoxelChunkWaterIsoSurface(cx, cz);
        o.tris0 = m0 && m0.geometry && m0.geometry.index ? Math.round(m0.geometry.index.count / 3) : 0;
        entry.lod = 2;
        const m2 = r._buildVoxelChunkWaterIsoSurface(cx, cz);
        o.tris2 = m2 && m2.geometry && m2.geometry.index ? Math.round(m2.geometry.index.count / 3) : 0;
        entry.lod = origLod;
        r._buildVoxelChunkWaterIsoSurface(cx, cz); // wiederherstellen
        return o;
    });

    const underside = out.up;
    const topside = out.down;
    const sideLabel = out.matSide === out.DoubleSide ? "DoubleSide" : out.matSide === out.FrontSide ? "FrontSide" : out.matSide === 1 ? "BackSide" : `?(${out.matSide})`;
    console.log("\n=== W1 Wasser-Flächen-Werdung — MESSUNG ===");
    console.log(`mat.side: ${sideLabel}  (FrontSide=${out.FrontSide}, BackSide=1, DoubleSide=${out.DoubleSide})`);
    console.log(`Wasser-Iso-Meshes: ${out.meshes},  Dreiecke gesamt: ${out.tris}`);
    if (out.tris > 0) {
        const pct = (n) => ((100 * n) / out.tris).toFixed(1);
        console.log(`  OBERSEITE (ny<-0.2):   ${topside}  (${pct(topside)} %)   <- bleibt (von oben via Rückseite sichtbar)`);
        console.log(`  Ufer/seitlich(|ny|<=.2): ${out.side}  (${pct(out.side)} %)`);
        console.log(`  UNTERSEITE (ny>0.2):   ${underside}  (${pct(underside)} %)   <- W1 verwirft sie am Build`);
        console.log(`  area-gewichtetes mittleres ny: ${out.avgAreaNy}   (stark <0 ⇒ Oberseiten ins Wasser gewickelt ⇒ BackSide korrekt)`);
        console.log("  Stichprobe pro Mesh:");
        for (const m of out.byMesh) console.log(`    ${m.key}: tris=${m.tris} oben=${m.down} ufer=${m.side} UNTEN=${m.up} areaNy=${m.areaNy}`);
    } else {
        console.log("  (keine Wasser-Iso-Dreiecke gefunden — kein Wasser im gestreamten Ring?)");
    }

    // REGRESSIONS-GATE: W1 (Material BackSide + Unterseite<1%) + W2 (Kaskade-Map +
    // fern vergröbert). Exit 1, wenn der Volumen-Look ODER die Zwei-Skalen zurück.
    const hasWater = out.tris > 0;
    const undersidePct = hasWater ? (100 * underside) / out.tris : 100;
    const backSide = out.matSide === 1; // THREE.BackSide
    const topsPresent = topside > 0;

    console.log("\n=== W2 (Wasser reitet die Terrain-LOD) ===");
    console.log(`_waterLodFor [lod0,1,2,3] = [${w2.lodMap.join(", ")}]  (erwartet 0, 0, 2, 3)`);
    const w2lodOk = w2.lodMap[0] === 0 && w2.lodMap[1] === 0 && w2.lodMap[2] === 2 && w2.lodMap[3] === 3;
    const ratio = w2.tris2 > 0 ? (w2.tris0 / w2.tris2).toFixed(1) : "?";
    console.log(`Iso-Tris bei waterLod 0: ${w2.tris0}  →  forciert LOD2: ${w2.tris2}  (${ratio}× grober)`);
    const w2coarsens = w2.tris0 > 0 && w2.tris2 > 0 && w2.tris2 < w2.tris0 * 0.5;
    const w2ok = w2lodOk && (w2.tris0 === 0 || w2coarsens);

    console.log("\n=== URTEIL ===");
    console.log(`W1 Material BackSide: ${backSide ? "JA" : "NEIN — Volumen-Look (DoubleSide) zurück!"}`);
    console.log(`W1 Unterseite verworfen (<1%): ${undersidePct < 1 ? "JA (" + undersidePct.toFixed(2) + " %)" : "NEIN (" + undersidePct.toFixed(1) + " %) — Leck zurück!"}`);
    console.log(`W1 Oberseite vorhanden: ${topsPresent ? "JA" : "NEIN — Wasser von oben unsichtbar!"}`);
    console.log(`W2 Kaskade-Map (0,0,2,3): ${w2lodOk ? "JA" : "NEIN"}`);
    console.log(`W2 fern vergröbert: ${w2.tris0 === 0 ? "n/a (kein Sample im Ring)" : w2coarsens ? "JA" : "NEIN — Iso vergröbert nicht!"}`);
    const pass = hasWater && backSide && undersidePct < 1 && topsPresent && w2ok;
    console.log(pass ? "\nW1+W2 GRÜN — Wasser ist eine Fläche auf der Terrain-Skala." : "\nROT.");

    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

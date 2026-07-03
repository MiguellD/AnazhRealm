// DIE FERN-WASSER-LINSE (V18.381, `npm run gate:fern-wasser`) — beweist headless die Atlas-
// Kulisse jenseits des Voxel-Chunk-Rings: (1) sie BAUT (Quads > 0 in einer Wasser-Welt),
// (2) der VOLLE Material-Vertrag (5 Attribute — WebGPU crasht sonst), (3) jede Quad-Zelle
// ist ATLAS-NASS + liegt AUSSERHALB des Rings (kein Doppel-Wasser überm echten Sheet),
// (4) nasse Vertices sitzen exakt bei Atlas-L − drop, (5) COVERAGE: ≥90 % der atlas-nassen
// in-Region-Zellen im Annulus tragen ein Quad, (6) Re-Anker beim Spieler-Crossing,
// (7) der Toggle (`atmosphere.farWater=false`) räumt sauber. Reine CPU-Geometrie (~40 s).
// (Das ältere `diag-far-water.cjs` ist die H3-Region-Gate-Diagnose — ein ANDERES Werkzeug.)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4404;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
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
    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-gpu"], protocolTimeout: 240000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
    await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state && typeof window.anazhRealm._gameLoopTick === "function", {
        timeout: 120000,
    });
    // kurzer Warm-Pump (Chunks + erster Fern-Wasser-Bau via Scheduler)
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        for (let i = 0; i < 120; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await new Promise((res) => setTimeout(res, 4));
        }
    });
    const out = await page.evaluate(() => {
        const r = window.anazhRealm;
        const s = r.state;
        const o = {};
        const F = r.constructor.FAR_WATER;
        const span = r._voxelChunkConfig(0).span;
        const ringR = r._voxelChunkConfig().ringRadius;
        const step = span / 4;
        r._ensureFarWaterSheet();
        const m = s.farWater;
        o.built = !!(m && m.mesh);
        o.quads = m ? m.quads : 0;
        o.builtMs = m ? m.builtMs : null;
        o.builtOutR = m ? m.builtOutR : null;
        if (!m || !m.mesh) return o;
        const g = m.mesh.geometry;
        // (2) der VOLLE Material-Vertrag
        const want = { position: 3, aFlow: 2, aShore: 1, aWave: 1, aDepth: 1, aSlope: 1 };
        o.attrs = {};
        let attrsOk = true;
        for (const [name, size] of Object.entries(want)) {
            const a = g.getAttribute(name);
            o.attrs[name] = a ? a.itemSize : null;
            if (!a || a.itemSize !== size) attrsOk = false;
        }
        o.attrsOk = attrsOk;
        // (3)+(4) jede Quad-Zelle atlas-nass + ausserhalb des Rings; nasse Vertices bei L−drop
        const pos = g.getAttribute("position");
        const aD = g.getAttribute("aDepth");
        const idx = g.getIndex().array;
        const pcx = Math.floor(m.anchorX / span);
        const pcz = Math.floor(m.anchorZ / span);
        let cellsChecked = 0,
            cellsWet = 0,
            cellsOutside = 0;
        const quadStride = Math.max(1, Math.floor(idx.length / 6 / 400)); // ≤400 Stichproben
        for (let q = 0; q < idx.length / 6; q += quadStride) {
            const v00 = idx[q * 6];
            const cx = pos.getX(v00) + step / 2;
            const cz = pos.getZ(v00) + step / 2;
            cellsChecked++;
            const L = r._atlasWaterLevelAt(cx, cz, -Infinity);
            if (L > -Infinity && Number.isFinite(L)) cellsWet++;
            const ccx = Math.floor(cx / span),
                ccz = Math.floor(cz / span);
            if (Math.max(Math.abs(ccx - pcx), Math.abs(ccz - pcz)) > ringR) cellsOutside++;
        }
        o.cellsChecked = cellsChecked;
        o.cellsWetFrac = cellsChecked ? +(cellsWet / cellsChecked).toFixed(3) : 0;
        o.cellsOutsideFrac = cellsChecked ? +(cellsOutside / cellsChecked).toFixed(3) : 0;
        let vChecked = 0,
            vLevelOk = 0;
        for (let i = 0; i < pos.count; i += Math.max(1, Math.floor(pos.count / 300))) {
            if (aD.getX(i) <= 0) continue; // Anker
            const L = r._atlasWaterLevelAt(pos.getX(i), pos.getZ(i), -Infinity);
            if (!(L > -Infinity)) continue;
            vChecked++;
            if (Math.abs(pos.getY(i) - (L - F.drop)) < 0.02) vLevelOk++;
        }
        o.vChecked = vChecked;
        o.vLevelFrac = vChecked ? +(vLevelOk / vChecked).toFixed(3) : 1;
        // (5) COVERAGE: atlas-nasse in-Region-Zellen im Annulus → Quad vorhanden?
        // Zell-Hash über die ECKE (ganze step-Vielfache — float32-robust; ein Hash über die
        // MITTE läge exakt auf dem .5-Rundungs-Scheitel und kippte mit dem Float32-Epsilon).
        const have = new Set();
        for (let q = 0; q < idx.length / 6; q++) {
            const v00 = idx[q * 6];
            have.add(`${Math.round(pos.getX(v00) / step)},${Math.round(pos.getZ(v00) / step)}`);
        }
        const inRegion = (x, z) => {
            const rg = r._hydroFor(x, z);
            if (!rg || !rg.ready) return false;
            const sz = rg.dim * rg.cell;
            return x >= rg.originX && z >= rg.originZ && x < rg.originX + sz && z < rg.originZ + sz;
        };
        let wetCells = 0,
            covered = 0;
        const uncovered = [];
        const seenCells = new Set();
        const outR = m.builtOutR;
        for (let wx = m.anchorX - outR; wx <= m.anchorX + outR; wx += step * 2) {
            for (let wz = m.anchorZ - outR; wz <= m.anchorZ + outR; wz += step * 2) {
                const cx = Math.floor(wx / step) * step + step / 2;
                const cz = Math.floor(wz / step) * step + step / 2;
                const ck2 = `${Math.round((cx - step / 2) / step)},${Math.round((cz - step / 2) / step)}`;
                if (seenCells.has(ck2)) continue;
                seenCells.add(ck2);
                const dx = cx - m.anchorX,
                    dz = cz - m.anchorZ;
                if (dx * dx + dz * dz > outR * outR * 0.92) continue; // klar innerhalb
                const ccx = Math.floor(cx / span),
                    ccz = Math.floor(cz / span);
                if (Math.max(Math.abs(ccx - pcx), Math.abs(ccz - pcz)) <= ringR) continue;
                if (!inRegion(cx, cz)) continue;
                const L = r._atlasWaterLevelAt(cx, cz, -Infinity);
                if (!(L > -Infinity) || !Number.isFinite(L)) continue;
                wetCells++;
                if (have.has(ck2)) covered++;
                else if (uncovered.length < 8)
                    uncovered.push({
                        cx: +cx.toFixed(1),
                        cz: +cz.toFixed(1),
                        L: +L.toFixed(2),
                        distFrac: +(Math.sqrt(dx * dx + dz * dz) / outR).toFixed(3),
                        ring: Math.max(Math.abs(ccx - pcx), Math.abs(ccz - pcz)),
                    });
            }
        }
        o.wetCells = wetCells;
        o.coverage = wetCells ? +(covered / wetCells).toFixed(3) : 1;
        o.uncovered = uncovered;
        // (6) Re-Anker beim Crossing (der Budget-Guard darf den TEST nicht gaten)
        const pm = s.playerMesh.position;
        const oldAX = m.anchorX;
        const sx = pm.x;
        s._frameOverBudget = false;
        pm.x += 200;
        r._ensureFarWaterSheet();
        o.reanchored = s.farWater && Math.abs(s.farWater.anchorX - oldAX) > 100;
        pm.x = sx;
        s._frameOverBudget = false;
        r._ensureFarWaterSheet();
        // (7) der Toggle räumt sauber
        if (!s.atmosphere) s.atmosphere = {};
        s.atmosphere.farWater = false;
        r._ensureFarWaterSheet();
        o.toggleOffDisposed = s.farWater === null;
        delete s.atmosphere.farWater;
        r._ensureFarWaterSheet();
        o.toggleOnRebuilt = !!(s.farWater && s.farWater.mesh);
        return o;
    });
    console.log("\n===== FERN-WASSER — LINSE (V18.381) =====\n");
    console.log(`  gebaut: ${out.built} · Quads: ${out.quads} · Bau ${out.builtMs} ms · outR ${out.builtOutR} m`);
    if (out.built) {
        console.log(`  Material-Vertrag (5 Attribute): ${JSON.stringify(out.attrs)} → ${out.attrsOk ? "OK" : "FEHLT"}`);
        console.log(
            `  Quad-Zellen (${out.cellsChecked} Stichproben): atlas-nass ${(out.cellsWetFrac * 100).toFixed(1)} % · ausserhalb Ring ${(out.cellsOutsideFrac * 100).toFixed(1)} %`
        );
        console.log(`  nasse Vertices bei Atlas-L−drop: ${(out.vLevelFrac * 100).toFixed(1)} % (${out.vChecked} Proben)`);
        console.log(`  COVERAGE atlas-nasser Annulus-Zellen: ${(out.coverage * 100).toFixed(1)} % von ${out.wetCells}`);
        if (out.uncovered && out.uncovered.length) console.log(`  UNGEDECKT (Beispiele): ${JSON.stringify(out.uncovered)}`);
        console.log(
            `  Re-Anker beim Crossing: ${out.reanchored} · Toggle aus→weg: ${out.toggleOffDisposed} · an→wieder da: ${out.toggleOnRebuilt}`
        );
    }
    const ok =
        out.built &&
        out.quads > 0 &&
        out.attrsOk &&
        out.cellsWetFrac >= 0.99 &&
        out.cellsOutsideFrac >= 0.99 &&
        out.vLevelFrac >= 0.98 &&
        out.coverage >= 0.9 &&
        out.reanchored &&
        out.toggleOffDisposed &&
        out.toggleOnRebuilt;
    console.log(
        `\n  ${ok ? "✅ DAS FERN-WASSER STEHT: atlas-treu, ring-löchrig (kein Doppel-Wasser), voll gedeckt, Lifecycle sauber." : "❌ Fern-Wasser weicht ab — prüfen."}\n`
    );
    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(ok ? 0 : 1);
})();

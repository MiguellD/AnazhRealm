// MATHEMATISCHE MESSUNG (kein Bild noetig): werden die Baeume WIRKLICH gepflanzt, stehen die
// Dreiecke, ist die Geometrie ein echter Baum (hoch, Stamm+Laub), ist die Varianz real
// (jeder Seed andere Geometrie), greift LOD, wie dicht um den Spieler? Render gestubbt = Tempo.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4461;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0]; if (p === "/") p = "/index.html";
    const fp = path.join(root, p); if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => { if (err) { res.statusCode = 404; return res.end(); } res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream"); res.end(data); });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 300000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 400, height: 300 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const D = await page.evaluate(async () => {
        // Warmup (render gestubbt).
        let stubbed = false; const start = performance.now(); let lastSize = -1, stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) { r.state.renderer.render = function () {}; if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve(); r.state.postProcessingFailed = true; stubbed = true; }
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0; if (sz === lastSize) stableFor++; else { stableFor = 0; lastSize = sz; } if (sz >= 20 && stableFor > 40) break; }
            await new Promise((res) => setTimeout(res, 3));
        }
        const r = window.anazhRealm; const s = r.state; const pm = s.playerMesh;
        const out = {};
        const isTreeType = (t) => typeof t === "string" && (/^baum_/.test(t) || /^grown_baum_/.test(t));

        // 1) WERDEN BAEUME GEPFLANZT? Architektur-Eintraege + Instanzen + LOD-Tag zaehlen.
        const px = pm ? pm.position.x : 0, pz = pm ? pm.position.z : 0;
        let treeEntries = 0, treeNear = 0, instanced = 0, lodTagged = 0;
        const speciesCount = {}, lodLevels = {}, byFamily = { baum: 0, grown: 0 };
        for (const e of (s.architectures || [])) {
            if (!e || !isTreeType(e.type)) continue;
            treeEntries++; speciesCount[e.type] = (speciesCount[e.type] || 0) + 1;
            byFamily[/^grown_/.test(e.type) ? "grown" : "baum"]++;
            if (e.instanced) instanced++;
            if (e._lodSpecies) { lodTagged++; const l = e._lodLevel != null ? e._lodLevel : "?"; lodLevels[l] = (lodLevels[l] || 0) + 1; }
            const dx = e.position.x - px, dz = e.position.z - pz; if (dx * dx + dz * dz < 2500) treeNear++;
        }
        out.plantung = { treeEntries, familie: byFamily, instanced, treeNear_50m: treeNear, arten: speciesCount };
        out.lod = { baeume_mit_lodTag: lodTagged, verteilung_L: lodLevels };

        // 2) STEHEN DIE DREIECKE? Instanz-Gruppen-Dreiecke zaehlen (die ECHTE gerenderte Geometrie).
        let groups = 0, totalTris = 0, totalInst = 0, treeTris = 0, treeGroups = 0;
        const heavy = [];
        const collect = (map) => { if (!map) return; map.forEach((g, key) => {
            const mesh = g && (g.mesh || (g.kind === "batch" && g.batched));
            if (!mesh || !mesh.geometry) return;
            const geo = mesh.geometry; const cnt = mesh.count || (mesh.isBatchedMesh ? (mesh._geometryCount || 0) : 1);
            const idx = geo.index ? geo.index.count : (geo.attributes.position ? geo.attributes.position.count : 0);
            const tris = (idx / 3) * cnt;
            groups++; totalInst += cnt; totalTris += tris;
            const nm = String(g.name || key || "");
            if (/baum|grown/i.test(nm)) { treeGroups++; treeTris += tris; }
            heavy.push({ nm: nm.slice(0, 44), inst: cnt, triJe: Math.round(idx / 3), tris: Math.round(tris) });
        }); };
        collect(s.archInstanceGroups); collect(s.archBatchGroups);
        heavy.sort((a, b) => b.tris - a.tris);
        out.geometrie = { instanzGruppen: groups, instanzen: totalInst, dreiecke_gesamt: Math.round(totalTris), baum_gruppen: treeGroups, baum_dreiecke: Math.round(treeTris), teuerste: heavy.slice(0, 6) };

        // 3) IST DIE GEOMETRIE EIN ECHTER BAUM? Die ECHTE gerenderte Skeleton-Geometrie (Tube+Cards)
        //    einer gewachsenen Variante messen — NICHT die Parts-Fallback-Kugeln.
        const measure = (species, regionSeed) => {
            try {
                const key = r._growTreeBlueprintForSpawn(species, regionSeed);
                const bp = key && s.blueprints && s.blueprints[key];
                if (!bp) return { err: "kein grown bp" };
                // Die ECHTE gerenderte Geometrie: _archFlattenBlueprint(NAME) baut die Leaves
                // (Tube+Cards). Die Geometrien sind GECACHT + geteilt -> NIE disposen.
                let flat = null;
                try { flat = r._archFlattenBlueprint ? r._archFlattenBlueprint(key) : null; } catch (e) { return { err: "flatten:" + (e && e.message) }; }
                const leaves = flat && flat.leaves;
                if (!leaves || !leaves.length) return { err: "keine leaves (" + (flat && flat.reason) + ")" };
                let miny = 1e9, maxy = -1e9, maxr = 0, verts = 0, hasGreen = false, hasBrown = false, meshes = 0;
                let barkMiny = 1e9, barkMaxy = -1e9, barkMaxr = 0; // Nur der STAMM/AST-Tube (leaf 0)
                for (let li = 0; li < leaves.length; li++) {
                    const lf = leaves[li];
                    const geo = lf && (lf.geom || lf.geometry); if (!geo || !geo.attributes || !geo.attributes.position) continue;
                    const p = geo.attributes.position; meshes++; verts += p.count;
                    const isBark = li === 0;
                    for (let i = 0; i < p.count; i++) { const y = p.getY(i), rr = Math.hypot(p.getX(i), p.getZ(i)); if (y < miny) miny = y; if (y > maxy) maxy = y; if (rr > maxr) maxr = rr; if (isBark) { if (y < barkMiny) barkMiny = y; if (y > barkMaxy) barkMaxy = y; if (rr > barkMaxr) barkMaxr = rr; } }
                    const c = geo.attributes.color;
                    if (c) for (let i = 0; i < c.count; i += 31) { const g = c.getY(i), rd = c.getX(i), b = c.getZ(i); if (g > rd + 0.02 && g > b) hasGreen = true; if (rd > g && rd > b && rd < 0.55 && g > 0.1) hasBrown = true; }
                }
                const h = maxy - miny; const bh = barkMaxy - barkMiny;
                return { variante: key.replace(/^grown_/, ""), hoehe: +h.toFixed(1), breite: +(maxr * 2).toFixed(1), schlank: +(h / (maxr * 2 || 1)).toFixed(2), stamm_h: +bh.toFixed(1), stamm_schlank: +(bh / (barkMaxr * 2 || 1)).toFixed(2), leaves: meshes, verts, laub_gruen: hasGreen, rinde_braun: hasBrown };
            } catch (e) { return { err: String(e && e.message || e) }; }
        };
        const ws = (s.worldMeta && s.worldMeta.seed) || "anazh-realm-seed";
        out.eiche = measure("baum_eiche", `${ws}|baum_eiche|0,0`);
        out.tanne = measure("baum_tanne", `${ws}|baum_tanne|0,0`);
        out.birke = measure("baum_birke", `${ws}|baum_birke|0,0`);

        // 4) IST DIE VARIANZ REAL? Alle N Varianten einer Art -> verschiedene Hoehen/Silhouetten?
        const N = r.constructor.VARIANTS_PER_SPECIES || 3;
        const sigs = [];
        for (let i = 0; i < N; i++) { const m = measure("baum_eiche", `${ws}|baum_eiche|${i},${i * 7}`); sigs.push(m.err ? "err" : m.variante + "=" + m.hoehe + "m/s" + m.schlankheit); }
        out.varianz = { varianten_pro_art: N, gestalten: sigs, distinkt: new Set(sigs).size };

        return out;
    });
    console.log(JSON.stringify(D, null, 1));
    await browser.close(); server.close();
    process.exit(0);
})();

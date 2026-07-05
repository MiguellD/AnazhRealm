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

        // 1) WERDEN BAEUME GEPFLANZT? Architektur-Eintraege + Instanzen zaehlen (nah um den Spieler).
        const px = pm ? pm.position.x : 0, pz = pm ? pm.position.z : 0;
        let treeEntries = 0, treeNear = 0, instanced = 0;
        const speciesCount = {};
        for (const e of (s.architectures || [])) {
            if (!e || typeof e.type !== "string" || !/^baum_/.test(e.type)) continue;
            treeEntries++; speciesCount[e.type] = (speciesCount[e.type] || 0) + 1;
            if (e.instanced) instanced++;
            const dx = e.position.x - px, dz = e.position.z - pz; if (dx * dx + dz * dz < 2500) treeNear++;
        }
        out.plantung = { treeEntries, instanced, treeNear_50m: treeNear, arten: speciesCount };

        // 2) STEHEN DIE DREIECKE? Instanz-Gruppen-Dreiecke zaehlen.
        let groups = 0, totalTris = 0, totalInst = 0;
        if (s.archInstanceGroups) s.archInstanceGroups.forEach((g) => {
            if (g && g.mesh && g.mesh.geometry) {
                const geo = g.mesh.geometry; const cnt = g.mesh.count || 0;
                const idx = geo.index ? geo.index.count : (geo.attributes.position ? geo.attributes.position.count : 0);
                groups++; totalInst += cnt; totalTris += (idx / 3) * cnt;
            }
        });
        out.geometrie = { instanzGruppen: groups, instanzen: totalInst, dreiecke_gesamt: Math.round(totalTris) };

        // 3) IST DIE GEOMETRIE EIN ECHTER BAUM? Eine Eiche wachsen + bbox/Teile/Farben messen.
        const measure = (species, seed) => {
            try {
                const parts = r._growTreeBlueprint(species, seed);
                if (!parts || !parts.length) return { err: "keine parts" };
                const grp = r._buildFromBlueprint({ name: "m", parts });
                if (!grp) return { err: "kein mesh" };
                let miny = 1e9, maxy = -1e9, maxr = 0, verts = 0, meshes = 0, hasGreen = false, hasBrown = false;
                grp.traverse((o) => {
                    if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) {
                        const p = o.geometry.attributes.position; meshes++; verts += p.count;
                        for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y < miny) miny = y; if (y > maxy) maxy = y; const rr = Math.hypot(p.getX(i), p.getZ(i)); if (rr > maxr) maxr = rr; }
                        const c = o.geometry.attributes.color;
                        if (c) for (let i = 0; i < c.count; i += 47) { const g = c.getY(i), rd = c.getX(i), b = c.getZ(i); if (g > rd && g > b) hasGreen = true; if (rd > g && rd > b * 0.9 && rd < 0.5) hasBrown = true; }
                    }
                });
                try { r._disposeSoulGroup && r._disposeSoulGroup(grp); } catch (_e) {}
                const h = maxy - miny;
                return { hoehe: +h.toFixed(1), breite: +(maxr * 2).toFixed(1), schlankheit: +(h / (maxr * 2 || 1)).toFixed(2), teile: meshes, verts, laub_gruen: hasGreen, rinde_braun: hasBrown, sig: verts + ":" + Math.round(h * 10) + ":" + meshes };
            } catch (e) { return { err: String(e && e.message || e) }; }
        };
        out.eiche = measure("baum_eiche", 12345);
        out.tanne = measure("baum_tanne", 777);
        out.birke = measure("baum_birke", 999);

        // 4) IST DIE VARIANZ REAL? 6 Eichen mit verschiedenen Seeds -> verschiedene Signaturen?
        const sigs = [];
        for (let i = 0; i < 6; i++) { const m = measure("baum_eiche", 1000 + i * 137); sigs.push(m.sig || "err"); }
        const uniq = new Set(sigs);
        out.varianz = { seeds: 6, distinkte_gestalten: uniq.size, signaturen: sigs };

        // 5) GREIFT LOD? Setzen die instanzierten Baeume _lodSpecies?
        let lodTagged = 0, lodLevels = {};
        for (const e of (s.architectures || [])) { if (e && e.instanced && e._lodSpecies) { lodTagged++; const l = e._lodLevel != null ? e._lodLevel : "?"; lodLevels[l] = (lodLevels[l] || 0) + 1; } }
        out.lod = { baeume_mit_lodTag: lodTagged, verteilung_L: lodLevels };

        return out;
    });
    console.log(JSON.stringify(D, null, 1));
    await browser.close(); server.close();
    process.exit(0);
})();

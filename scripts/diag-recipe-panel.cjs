// PRUEFT DIE PIPELINE-SICHTBARKEIT: erscheint in der Werkstatt bei einem gewachsenen Baum der
// REZEPT-REGLER (5 Studio-Slider + Saat-Wuerfel) unter den Farben, und fuettert er die EINE
// geteilte Pipeline live? Ein Dial-Zug + ein Wuerfel MUESSEN die Baum-Geometrie messbar aendern.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4468;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
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
        protocolTimeout: 300000,
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
    await page.setViewport({ width: 900, height: 700 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const D = await page.evaluate(async () => {
        // Warmup (render gestubbt).
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                stubbed = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.blueprints && r.state.blueprints.baum_eiche) break;
            }
            await new Promise((res) => setTimeout(res, 5));
        }
        const r = window.anazhRealm;
        const s = r.state;
        const out = {};

        // bbox eines Bauplans aus seinen parts (position +/- size/2).
        const bbox = (bp) => {
            let miny = 1e9,
                maxy = -1e9,
                maxr = 0,
                holz = 0,
                laub = 0;
            for (const p of bp.parts || []) {
                const pos = p.position || { x: 0, y: 0, z: 0 },
                    sz = p.size || { x: 0, y: 0, z: 0 };
                const y0 = pos.y - (sz.y || 0) / 2,
                    y1 = pos.y + (sz.y || 0) / 2;
                if (y0 < miny) miny = y0;
                if (y1 > maxy) maxy = y1;
                const rr = Math.hypot(pos.x, pos.z) + Math.max(sz.x || 0, sz.z || 0) / 2;
                if (rr > maxr) maxr = rr;
                if (p.material === "holz") holz++;
                else if (p.material === "laub") laub++;
            }
            return { h: +(maxy - miny).toFixed(2), w: +(maxr * 2).toFixed(2), holz, laub, n: (bp.parts || []).length };
        };

        // 1) Panel erscheint fuer baum_eiche (gewachsener Baum)?
        const ws = r._ensureWorkshopState();
        ws.selectedBlueprint = "baum_eiche";
        const eiche = s.blueprints.baum_eiche;
        r._workshopRenderRecipePanel(eiche);
        const panel = document.getElementById("workshop-recipe-panel");
        const sliders = panel ? panel.querySelectorAll('input[type="range"]') : [];
        const dice = panel ? panel.querySelector(".workshop-recipe-dice") : null;
        const reset = panel ? panel.querySelector(".workshop-recipe-reset") : null;
        out.panel = { sichtbar: !!(panel && !panel.hidden), regler: sliders.length, wuerfel: !!dice, reset: !!reset };

        // 2) Panel VERSTECKT fuer einen Nicht-Rezept-Bauplan (AUSLÖSCHUNGS-WELLE:
        // der gefallene "temple" wich der lebenden Esse — ein Crafting-Geraet
        // OHNE Rezept-kind, das das Panel wirklich versteckt; stein_block/kristall
        // haben rock/crystal-kinds und ZEIGEN es, taugten also nicht).
        const nichtRezept = s.blueprints.esse;
        if (nichtRezept) {
            r._workshopRenderRecipePanel(nichtRezept);
            out.nichtBaum_versteckt = !!(panel && panel.hidden);
        }

        // 3) DIAL-ZUG aendert die Geometrie? api 0.30 (Laub) -> 0.95 (Nadel-Kegel).
        r._workshopRenderRecipePanel(eiche);
        const base = bbox(eiche);
        const d1 = Object.assign(
            {},
            r._treeRecipeDials("baum_eiche", s.blueprints.baum_eiche._skeleton ? undefined : null) || {},
            r._treeRecipeDials("baum_eiche", null)
        );
        d1.api = 0.95;
        d1.slim = 0.72;
        d1.conifer = true;
        r._workshopRegrowRecipe(eiche, d1, "studio-test-a");
        const conif = bbox(eiche);
        out.dialZug = { basis: base, nach_nadel_api095: conif, geaendert: base.h !== conif.h || base.w !== conif.w };

        // 4) SAAT-WUERFEL wirft eine ANDERE Variante (gleiches Rezept, anderer Same)?
        r._workshopRegrowRecipe(eiche, d1, "studio-seed-1");
        const seedA = bbox(eiche);
        r._workshopRegrowRecipe(eiche, d1, "studio-seed-2");
        const seedB = bbox(eiche);
        out.saatWuerfel = {
            seedA,
            seedB,
            andereGestalt: seedA.h !== seedB.h || seedA.w !== seedB.w || seedA.holz !== seedB.holz,
        };

        // 5) RESET stellt das Vorlagen-Rezept wieder her?
        delete eiche._recipeDials;
        r._workshopRegrowRecipe(eiche, r._treeRecipeDials("baum_eiche", null), "baum_eiche-studio");
        out.reset = bbox(eiche);

        // Geometrie-Signatur (Fels/Kristall bauen prozedural beim Render → parts unveraendert,
        // Vertices aendern sich). Baue via _buildFromBlueprint + summiere Vertex-Positionen.
        const meshSig = (bp) => {
            try {
                const grp = r._buildFromBlueprint(bp, 0, undefined, {});
                if (!grp) return { err: "no mesh" };
                let sum = 0,
                    verts = 0;
                grp.traverse((o) => {
                    if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) {
                        const p = o.geometry.attributes.position;
                        verts += p.count;
                        for (let i = 0; i < p.count; i++) sum += p.getX(i) * 1.1 + p.getY(i) * 1.3 + p.getZ(i) * 1.7;
                    }
                });
                try {
                    r._disposeSoulGroup && r._disposeSoulGroup(grp);
                } catch (_e) {}
                return { sig: Math.round(sum * 1000) / 1000, verts };
            } catch (e) {
                return { err: String((e && e.message) || e) };
            }
        };

        // 6) FELS (felsbrocken): Panel + 4 Regler? Dial (Rundheit) + Saat aendern die Geometrie?
        const fels = s.blueprints.felsbrocken;
        if (fels) {
            r._ensureWorkshopState().selectedBlueprint = "felsbrocken";
            r._workshopRenderRecipePanel(fels);
            const fReg = panel ? panel.querySelectorAll('input[type="range"]').length : 0;
            const fSichtbar = !!(panel && !panel.hidden);
            const g0 = meshSig(fels);
            r._workshopRegrowRock(fels, { round: 0.85, rough: 0.9, elong: 0.6, strat: 0.4 }, null);
            const g1 = meshSig(fels);
            r._workshopRegrowRock(fels, { round: 0.85, rough: 0.9, elong: 0.6, strat: 0.4 }, 111);
            const gA = meshSig(fels);
            r._workshopRegrowRock(fels, { round: 0.85, rough: 0.9, elong: 0.6, strat: 0.4 }, 222);
            const gB = meshSig(fels);
            out.fels = {
                sichtbar: fSichtbar,
                regler: fReg,
                dialGeaendert: g0.sig !== g1.sig,
                saatGeaendert: gA.sig !== gB.sig,
                sigs: [g0.sig, g1.sig, gA.sig, gB.sig],
            };
        }

        // 7) KRISTALL (kristall_geode): Panel + 2 Regler? Facetten + Saat aendern die Geometrie?
        const kris = s.blueprints.kristall_geode;
        if (kris) {
            r._ensureWorkshopState().selectedBlueprint = "kristall_geode";
            r._workshopRenderRecipePanel(kris);
            const kReg = panel ? panel.querySelectorAll('input[type="range"]').length : 0;
            const kSichtbar = !!(panel && !panel.hidden);
            const c0 = meshSig(kris);
            r._workshopRegrowCrystal(kris, { facets: 12, termFrac: 0.8 }, null);
            const c1 = meshSig(kris);
            r._workshopRegrowCrystal(kris, { facets: 6, termFrac: 0.3 }, 111);
            const cA = meshSig(kris);
            r._workshopRegrowCrystal(kris, { facets: 6, termFrac: 0.3 }, 222);
            const cB = meshSig(kris);
            out.kristall = {
                sichtbar: kSichtbar,
                regler: kReg,
                dialGeaendert: c0.sig !== c1.sig,
                saatGeaendert: cA.sig !== cB.sig,
                sigs: [c0.sig, c1.sig, cA.sig, cB.sig],
            };
        }

        // 8) LOD-BUTTON: L0 (viele Parts) -> L2 (wenige) fuer den Baum? Fels: Detail gruene?
        eiche._recipeLod = 0;
        r._workshopRegrowRecipe(eiche, r._treeRecipeDials("baum_eiche", null), "lod-test");
        const nL0 = bbox(eiche).n;
        eiche._recipeLod = 2;
        r._workshopRegrowRecipe(eiche, r._treeRecipeDials("baum_eiche", null), "lod-test");
        const nL2 = bbox(eiche).n;
        eiche._recipeLod = 0;
        out.lodButton = { baumL0Parts: nL0, baumL2Parts: nL2, groeberBeiL2: nL2 < nL0 };

        // 9b) SKELETT-VORSCHAU: baut die Werkstatt-Vorschau des Baums die Tube+Blatt-Klingen
        //     (wenige Meshes, viele Verts) statt der ~80 Kugel-Blob-Parts?
        eiche._recipeLod = 0;
        r._workshopRegrowRecipe(eiche, r._treeRecipeDials("baum_eiche", null), "skel-test");
        const skelGrp = r._workshopBuildSkeletonPreviewGroup(eiche);
        let skelMeshes = 0,
            skelVerts = 0;
        if (skelGrp)
            skelGrp.traverse((o) => {
                if (o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position) {
                    skelMeshes++;
                    skelVerts += o.geometry.attributes.position.count;
                }
            });
        const partGrp = r._buildFromBlueprint(eiche, 0, undefined, {});
        let partMeshes = 0;
        if (partGrp)
            partGrp.traverse((o) => {
                if (o.isMesh) partMeshes++;
            });
        out.skelettVorschau = {
            skelett_meshes: skelMeshes,
            skelett_verts: skelVerts,
            parts_blob_meshes: partMeshes,
            istSkelett: skelMeshes > 0 && skelMeshes < 12 && skelVerts > 1000,
        };

        // 9) PIPELINE-ZENSUS: welche editierbaren Baupláne fliessen durch die geteilte Pipeline?
        const census = { tree: [], rock: [], crystal: [], keine: [] };
        for (const name of Object.keys(s.blueprints)) {
            if (String(name).startsWith("grown_")) continue;
            const k = r._workshopRecipeKind(s.blueprints[name]);
            (k ? census[k] : census.keine).push(name);
        }
        out.pipelineZensus = {
            tree: census.tree.length,
            rock: census.rock.length,
            crystal: census.crystal.length,
            keine_anzahl: census.keine.length,
            keine_beispiele: census.keine.slice(0, 24),
        };

        return out;
    });
    console.log(JSON.stringify(D, null, 1));
    const treeOK =
        D.panel &&
        D.panel.sichtbar &&
        D.panel.regler === 5 &&
        D.panel.wuerfel &&
        D.nichtBaum_versteckt &&
        D.dialZug &&
        D.dialZug.geaendert &&
        D.saatWuerfel &&
        D.saatWuerfel.andereGestalt;
    const felsOK = D.fels && D.fels.sichtbar && D.fels.regler === 4 && D.fels.dialGeaendert && D.fels.saatGeaendert;
    const krisOK =
        D.kristall &&
        D.kristall.sichtbar &&
        D.kristall.regler === 2 &&
        D.kristall.dialGeaendert &&
        D.kristall.saatGeaendert;
    const lodOK = D.lodButton && D.lodButton.groeberBeiL2;
    console.log(
        `\nBAUM: ${treeOK ? "✅" : "❌"}  FELS: ${felsOK ? "✅" : "❌"}  KRISTALL: ${krisOK ? "✅" : "❌"}  LOD-BUTTON: ${lodOK ? "✅" : "❌"}`
    );
    if (D.pipelineZensus)
        console.log(
            `PIPELINE-ZENSUS: Baum ${D.pipelineZensus.tree} · Fels ${D.pipelineZensus.rock} · Kristall ${D.pipelineZensus.crystal} fliessen | ${D.pipelineZensus.keine_anzahl} NICHT (${D.pipelineZensus.keine_beispiele.join(", ")})`
        );
    const ok = treeOK && felsOK && krisOK && lodOK;
    console.log(
        ok ? "✅ REZEPT-REGLER + LOD-BUTTON PRUEFBAR fuer BAUM · FELS · KRISTALL." : "❌ Etwas fehlt — siehe oben."
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

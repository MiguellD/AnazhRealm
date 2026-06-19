// V18.264 — Diag: DIE RENDER-LAST (Schöpfer: „kann mich nicht umsehen, freezt die
// ganze Zeit" → die per-Frame-RENDER-Last, NICHT Streaming; bisher NIE gemessen, weil
// das Headless-Profiling den Render stubt). Misst: (1) Szene-Dreiecke + Draw-Calls je
// Kategorie (Terrain/Foliage/Gras/Avatar/Kreatur/Architektur/Wasser/Sky), (2) die
// SCHATTEN-CASTER-Last (castShadow-Dreiecke = der zweite Voll-Render via autoUpdate),
// (3) echter Render mit/ohne Schatten → die Schatten-Kosten als renderer.info-Delta,
// (4) Shader-Programm-Zahl (Recompile-Stall?). MISS zuerst, dann heile (V18.260-Disziplin).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4360,
    root = path.resolve(__dirname, "..");
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
    fs.readFile(fp, (e, d) => {
        if (e) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 360000,
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
    page.setDefaultTimeout(340000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const REALR = process.env.DIAG_REALRENDER === "1";
    await page.evaluateOnNewDocument(() => {});
    await page.evaluate((rr) => {
        window.__diagRealRender = rr;
    }, REALR);
    // Warmup: render-gestubbt pumpen bis die Welt steht.
    await page.evaluate(async () => {
        let stubbed = false,
            realRender = null;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
                realRender = r.state.renderer.render.bind(r.state.renderer);
                window.__realRender = realRender;
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
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 40 && stableFor > 60) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm,
            s = r.state;
        const scene = s.scene;
        if (!scene) return { error: "no scene" };
        const triOf = (geo) => {
            if (!geo || !geo.attributes || !geo.attributes.position) return 0;
            return geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
        };
        // Kategorisieren: per userData/Name/Material-Heuristik.
        const cat = (node) => {
            const u = node.userData || {};
            if (u.voxelChunkX != null || u.isVoxelChunk) return "terrain";
            if (u._creatureSkin || u._creatureFace) return "creature";
            if (node === s.playerMesh || (s.playerMesh && node.parent === s.playerMesh)) return "avatar";
            const nm = (node.name || "") + " " + ((node.material && node.material.name) || "");
            if (/grass|gras/i.test(nm)) return "grass";
            if (/water|wasser|iso/i.test(nm)) return "water";
            if (/star|sky|himmel|planet|mantle|horizon/i.test(nm)) return "sky";
            if (u.useFlexAttr || u.foliageLeaf || /laub|foliage|leaf|blatt/i.test(nm)) return "foliage";
            return "other";
        };
        // creatures-Set für Zuordnung
        const creatureSet = new Set(s.creatures || []);
        const acc = {};
        const bump = (c, tris, calls, shadowTris) => {
            if (!acc[c]) acc[c] = { tris: 0, calls: 0, shadowTris: 0, instances: 0 };
            acc[c].tris += tris;
            acc[c].calls += calls;
            acc[c].shadowTris += shadowTris;
        };
        let totalTris = 0,
            totalCalls = 0,
            shadowTris = 0,
            shadowCasters = 0,
            visMeshes = 0;
        // V18.264 — der „kann nicht umsehen"-Schlüssel: wieviele Dreiecke rendern
        // VIEW-UNABHÄNGIG (frustumCulled=false) vs frustum-cullbar?
        let noCullTris = 0,
            noCullMeshes = 0,
            cullTris = 0;
        const bySystem = { hism: { tris: 0, inst: 0, noCull: 0 }, scatter: { tris: 0, inst: 0, noCull: 0 }, rest: { tris: 0, inst: 0, noCull: 0 } };
        // V18.265 — der HISM-Hebel-Schlüssel: WO konzentrieren sich die 2 M HISM-
        // Dreiecke? Nach LOD-Stufe (aus dem archInstanceKey geparst: _lod1/_lod2 →
        // sonst LOD0) → sagt, ob Impostoren (ferne LOD2 schon billig?) oder die
        // NAHEN LOD0-Bäume der Hebel sind.
        const hismLOD = { lod0: { tris: 0, inst: 0, groups: 0 }, lod1: { tris: 0, inst: 0, groups: 0 }, lod2: { tris: 0, inst: 0, groups: 0 } };
        scene.traverse((node) => {
            if (!node.visible) return;
            if (!node.isMesh && !node.isInstancedMesh) return;
            // Vorfahren-Sichtbarkeit
            let cur = node.parent,
                vis = true;
            while (cur) {
                if (!cur.visible) {
                    vis = false;
                    break;
                }
                cur = cur.parent;
            }
            if (!vis) return;
            const inst = node.isInstancedMesh ? node.count || 0 : 1;
            if (inst === 0) return;
            const tris = triOf(node.geometry) * inst;
            // Kategorie: ein Vorfahre eine Kreatur? → creature
            let c = cat(node);
            let p = node;
            while (p) {
                if (creatureSet.has(p)) {
                    c = "creature";
                    break;
                }
                p = p.parent;
            }
            visMeshes++;
            totalTris += tris;
            totalCalls += 1; // 1 Draw-Call je (Instanced)Mesh
            const sc = node.castShadow ? tris : 0;
            if (node.castShadow) {
                shadowTris += sc;
                shadowCasters++;
            }
            bump(c, tris, 1, sc);
            if (node.isInstancedMesh) acc[c].instances += inst;
            // frustumCulled-Aufschlüsselung
            if (node.frustumCulled === false) {
                noCullTris += tris;
                noCullMeshes++;
            } else cullTris += tris;
            // System-Aufschlüsselung (HISM vs Scatter vs Rest)
            const u2 = node.userData || {};
            const sys = u2.archInstanceKey ? "hism" : node.isInstancedMesh ? "scatter" : "rest";
            bySystem[sys].tris += tris;
            bySystem[sys].inst += inst;
            if (node.frustumCulled === false) bySystem[sys].noCull += tris;
            if (sys === "hism") {
                const k = String(u2.archInstanceKey || "");
                const bucket = /_lod2#/.test(k) ? "lod2" : /_lod1#/.test(k) ? "lod1" : "lod0";
                hismLOD[bucket].tris += tris;
                hismLOD[bucket].inst += inst;
                hismLOD[bucket].groups += 1;
            }
        });

        // V18.264 — SCHATTEN-CACHE-VERIFIKATION: statisch (Umsehen) → übersprungen,
        // Bewegung → updated. Misst, wie oft der Schatten-Pass über 30 Frames feuert.
        const shadowCache = (() => {
            if (typeof r._loopShadowUpdate !== "function" || !s.renderer || !s.renderer.shadowMap) return null;
            const sm = s.renderer.shadowMap;
            const pm = s.playerMesh;
            s._shadowMinInterval = 1;
            // (a) STATISCH: Position fix, 30 Frames → wie oft needsUpdate?
            let staticUpdates = 0;
            for (let i = 0; i < 30; i++) {
                sm.needsUpdate = false;
                r._loopShadowUpdate();
                if (sm.needsUpdate) staticUpdates++;
            }
            // (b) BEWEGUNG: jeden Frame verschieben → wie oft?
            let movingUpdates = 0;
            for (let i = 0; i < 30; i++) {
                if (pm) pm.position.x += 2;
                sm.needsUpdate = false;
                r._loopShadowUpdate();
                if (sm.needsUpdate) movingUpdates++;
            }
            return { staticUpdates, movingUpdates, autoUpdate: sm.autoUpdate };
        })();
        // Schatten-Config
        const dl = (scene.children || []).find((c) => c.isDirectionalLight) || s.sunLight || s.directionalLight;
        const shadowCfg = {
            autoUpdate: s.renderer && s.renderer.shadowMap ? s.renderer.shadowMap.autoUpdate : null,
            mapSize: dl && dl.shadow ? dl.shadow.mapSize.x + "x" + dl.shadow.mapSize.y : "?",
            type: s.renderer && s.renderer.shadowMap ? s.renderer.shadowMap.type : null,
        };

        // ECHTER RENDER (un-stub) — info.render mit/ohne Schatten. Optional
        // (swiftshader ist bei schwerer Szene sehr langsam) → DIAG_REALRENDER=1.
        const doReal = window.__diagRealRender === true;
        const real = window.__realRender;
        const info = s.renderer.info;
        const cam = s.camera;
        let withShadow = null,
            noShadow = null,
            programs = null,
            renderMsWith = null,
            renderMsNo = null;
        if (doReal && real && cam) {
            try {
                s.renderer.shadowMap.enabled = true;
                let t0 = performance.now();
                real(scene, cam);
                renderMsWith = +(performance.now() - t0).toFixed(0);
                withShadow = { calls: info.render.calls, tris: info.render.triangles };
                programs = info.programs ? info.programs.length : -1;
                s.renderer.shadowMap.enabled = false;
                t0 = performance.now();
                real(scene, cam);
                renderMsNo = +(performance.now() - t0).toFixed(0);
                noShadow = { calls: info.render.calls, tris: info.render.triangles };
                s.renderer.shadowMap.enabled = true;
            } catch (e) {
                withShadow = { error: String(e).slice(0, 80) };
            }
        }
        return {
            byCat: acc,
            totals: { tris: totalTris, calls: totalCalls, shadowTris, shadowCasters, visMeshes, noCullTris, noCullMeshes, cullTris },
            bySystem,
            hismLOD,
            shadowCfg,
            shadowCache,
            realRender: { withShadow, noShadow, programs, renderMsWith, renderMsNo },
            world: {
                voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
                architectures: s.architectures ? s.architectures.length : 0,
                archInstanceGroups: s.archInstanceGroups ? s.archInstanceGroups.size : 0,
                creatures: s.creatures ? s.creatures.length : 0,
                gpuScatter: s.atmosphere ? s.atmosphere.gpuScatter : undefined,
            },
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n));
    console.log("\n===== RENDER-LAST (V18.264, gemessen) =====\n");
    console.log("  Welt: " + JSON.stringify(out.world));
    console.log(
        "  Schatten: autoUpdate=" +
            out.shadowCfg.autoUpdate +
            " · map=" +
            out.shadowCfg.mapSize +
            " · type=" +
            out.shadowCfg.type
    );
    console.log("\n  SZENE-LAST je Kategorie (Dreiecke | Draw-Calls | Schatten-Dreiecke | Instanzen):");
    const rows = Object.entries(out.byCat).sort((a, b) => b[1].tris - a[1].tris);
    for (const [c, v] of rows) {
        console.log(
            "    " +
                c.padEnd(12) +
                " tris " +
                fmt(v.tris).padStart(8) +
                " | calls " +
                String(v.calls).padStart(4) +
                " | shadowTris " +
                fmt(v.shadowTris).padStart(8) +
                " | inst " +
                v.instances
        );
    }
    const t = out.totals;
    console.log("\n  TOTAL: tris " + fmt(t.tris) + " · draw-calls " + t.calls + " · sichtbare Meshes " + t.visMeshes);
    console.log(
        "  VIEW-UNABHÄNGIG (frustumCulled=false): " + fmt(t.noCullTris) + " Dreiecke in " + t.noCullMeshes + " Meshes (= das, was Umsehen NICHT cullt) · cullbar " + fmt(t.cullTris)
    );
    if (out.bySystem) {
        const bs = out.bySystem;
        console.log("  SYSTEM: HISM " + fmt(bs.hism.tris) + " (noCull " + fmt(bs.hism.noCull) + ", inst " + bs.hism.inst + ") · Scatter " + fmt(bs.scatter.tris) + " (noCull " + fmt(bs.scatter.noCull) + ", inst " + bs.scatter.inst + ") · Rest " + fmt(bs.rest.tris) + " (noCull " + fmt(bs.rest.noCull) + ")");
    }
    if (out.hismLOD) {
        const h = out.hismLOD;
        const per = (b) => fmt(b.tris) + " tris / " + b.inst + " inst / " + b.groups + " grp (" + (b.inst ? Math.round(b.tris / b.inst) : 0) + " tris/inst)";
        console.log("  HISM nach LOD: LOD0 " + per(h.lod0) + " · LOD1 " + per(h.lod1) + " · LOD2 " + per(h.lod2));
    }
    console.log(
        "  SCHATTEN-PASS: " +
            t.shadowCasters +
            " Caster, " +
            fmt(t.shadowTris) +
            " Dreiecke (= ein zweiter Render je Update)"
    );
    if (out.shadowCache) {
        const sc = out.shadowCache;
        console.log(
            "\n  SCHATTEN-CACHE (V18.264): autoUpdate=" +
                sc.autoUpdate +
                " · STATISCH (Umsehen) " +
                sc.staticUpdates +
                "/30 Updates · BEWEGUNG " +
                sc.movingUpdates +
                "/30"
        );
        console.log(
            "    → im Stand wird der " +
                fmt(t.shadowTris) +
                "-Dreieck-Schatten-Pass " +
                Math.round((1 - sc.staticUpdates / 30) * 100) +
                "% der Frames ÜBERSPRUNGEN (der Umsehen-Hebel)"
        );
    }
    const rr = out.realRender;
    if (rr.withShadow && !rr.withShadow.error) {
        console.log("\n  ECHTER RENDER (swiftshader, ein Frame):");
        console.log(
            "    MIT Schatten:  calls " +
                rr.withShadow.calls +
                " · tris " +
                fmt(rr.withShadow.tris) +
                " · " +
                rr.renderMsWith +
                " ms"
        );
        console.log(
            "    OHNE Schatten: calls " +
                rr.noShadow.calls +
                " · tris " +
                fmt(rr.noShadow.tris) +
                " · " +
                rr.renderMsNo +
                " ms"
        );
        console.log(
            "    → SCHATTEN-ANTEIL: " +
                (rr.renderMsWith - rr.renderMsNo) +
                " ms (" +
                Math.round((1 - rr.renderMsNo / rr.renderMsWith) * 100) +
                "% der Frame-Render-Zeit)"
        );
        console.log("    Shader-Programme: " + rr.programs);
    } else if (rr.withShadow && rr.withShadow.error) {
        console.log("\n  ECHTER RENDER Fehler: " + rr.withShadow.error);
    }
    console.log("\n===========================================\n");
    try {
        fs.writeFileSync(path.join(root, "artifacts", "diag-render-load.json"), JSON.stringify(out, null, 2));
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-render-load.json", JSON.stringify(out, null, 2));
        } catch (_e2) {}
    }
    await browser.close();
    server.close();
    process.exit(0);
})();

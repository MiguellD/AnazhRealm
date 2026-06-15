// DER ANBLICK — das geschärfte Seh-Werkzeug (wahreranblick-plan §1).
// Die alte diag-sicht hing: sie rief _loopRender SYNCHRON und wartete nie auf
// den asynchronen WebGPU-Render → ein blanker/gestauter Framebuffer + Timeout.
// Heilung: renderAsync AWAITEN (der GPU-Render ist async). Plus:
//   §1.1 Mittag korrekt: setTimeOfDay(0.5) im Render-Pfad (ruft den Sync).
//   §1.2 Timeout besiegen: awaited renderAsync + jeder Shot SOFORT als Artefakt
//        (ein gekillter Lauf hinterlässt Bilder), der wichtigste (Baum nah) ZUERST.
//   §1.3 Last-Zähler: Instanzen + Dreiecke + Draw-Calls, inkrementell als JSON.
//   §1.4 A/B-Bank: ANBLICK_SCATTER / ANBLICK_PBR / ANBLICK_DENSITY env-Schalter.
// Aufruf: node scripts/diag-anblick.cjs   (env: ANBLICK_SCATTER=1 ANBLICK_PBR=1)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.ANBLICK_PORT || 4380);
const root = path.resolve(__dirname, "..");
const ART = path.join(root, "artifacts");
const SCATTER = process.env.ANBLICK_SCATTER === "1"; // default AUS für den schnellen Baum-Shot
const PBR = process.env.ANBLICK_PBR !== "0"; // PBR ist Default (V18.234)
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
const progress = { phase: "boot", t: 0, scatter: SCATTER, pbr: PBR, shots: [], counts: null };
const flush = () => {
    try {
        fs.writeFileSync(path.join(ART, "anblick-progress.json"), JSON.stringify(progress, null, 2));
    } catch (_e) {}
};
const T0 = Date.now();
const mark = (phase) => {
    progress.phase = phase;
    progress.t = ((Date.now() - T0) / 1000).toFixed(1);
    flush();
    console.log(`[${progress.t}s] ${phase}`);
};

(async () => {
    if (!fs.existsSync(ART)) fs.mkdirSync(ART, { recursive: true });
    await new Promise((r) => server.listen(PORT, r));
    mark("launch-browser");
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 595000,
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
    await page.setViewport({ width: 1100, height: 680 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    // ── SETTLE: Render gestubbt, Mittag, PBR-Default, Scatter nach Schalter ──
    mark("settle");
    const settleInfo = await page.evaluate(
        async (opts) => {
            let stubbed = false;
            const start = performance.now();
            let last = -1,
                stable = 0;
            while (performance.now() - start < 42000) {
                const r = window.anazhRealm;
                if (r && r.state) {
                    r.state.timeOfDay = 0.5;
                    if (r.state.atmosphere) {
                        r.state.atmosphere.gpuScatter = opts.scatter;
                        r.state.atmosphere.materialMode = opts.pbr ? "pbr" : "toon";
                    }
                }
                if (r && !stubbed && r.state && r.state.renderer) {
                    window.__origRender = r.state.renderer.render.bind(r.state.renderer);
                    r.state.renderer.render = function () {};
                    if (typeof r.state.renderer.renderAsync === "function") {
                        window.__origRenderAsync = r.state.renderer.renderAsync.bind(r.state.renderer);
                        r.state.renderer.renderAsync = () => Promise.resolve();
                    }
                    r.state.postProcessingFailed = true;
                    stubbed = true;
                }
                if (r && typeof r._gameLoopTick === "function") {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 25 && stable > 45) break;
                }
                await new Promise((res) => setTimeout(res, 4));
            }
            const r = window.anazhRealm;
            return { chunks: r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0 };
        },
        { scatter: SCATTER, pbr: PBR }
    );
    progress.chunks = settleInfo.chunks;
    mark(`settled chunks=${settleInfo.chunks}`);
    const skyDbg = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state,
            pm = s.playerMesh;
        if (r.setTimeOfDay) r.setTimeOfDay(0.5);
        const a = r.auraAt ? r.auraAt(pm.position.x, pm.position.z) : null;
        const neb = s.skyboxUniforms && s.skyboxUniforms.nebulaColor ? s.skyboxUniforms.nebulaColor.value : null;
        const rgb = (c) => (c ? [+c.r.toFixed(3), +c.g.toFixed(3), +c.b.toFixed(3)] : null);
        const base = r._interpolateDayNight ? r._interpolateDayNight(0.5) : null;
        const tinted = base && r._dayNightComputeTint ? r._dayNightComputeTint(base) : null;
        return {
            auraTintStrength: s.atmosphere && s.atmosphere.auraTintStrength,
            glut: a && +(+a.glut).toFixed(2),
            awe: a && a.emotion && +(+a.emotion.awe).toFixed(2),
            joy: a && a.emotion && +(+a.emotion.joy).toFixed(2),
            baseSky: base ? rgb(base.sky) : null,
            tintedSky: tinted ? rgb(tinted.skyColor) : null,
            neb: rgb(neb),
            skyTintStrength: +(+s.skyTintStrength || 0).toFixed(3),
            skyTintTo: rgb(s.skyTintTo),
        };
    });
    console.log("  SKY", JSON.stringify(skyDbg));
    await page.evaluate((unlit) => {
        for (const el of document.querySelectorAll("body > *:not(#world-canvas)")) el.style.display = "none";
        window.__anblickUnlit = unlit;
    }, process.env.ANBLICK_UNLIT === "1");

    // ── der EINE wahre Render: renderAsync AWAITEN (der Hang-Fix) ──
    const realRender = async () =>
        page.evaluate(async () => {
            const r = window.anazhRealm,
                s = r.state;
            if (window.__origRender) s.renderer.render = window.__origRender;
            if (window.__origRenderAsync) s.renderer.renderAsync = window.__origRenderAsync;
            s.postProcessingFailed = true;
            if (r.setTimeOfDay) r.setTimeOfDay(0.5); // ECHTES Mittag (ruft _applyDayNightToScene)
            if (window.__anblickIsolated) {
                // Neutrales weisses Licht (die Standard-Hemi ist BLAU → wäscht das
                // Aufwärts-Laub blau), grauer Himmel, kein Fog/Unterwasser → die ECHTE
                // Kronen-Farbe. setTimeOfDay setzt Fog/Skybox neu → hier wieder weg.
                if (s.player) s.player.emotions = {};
                s.weather = "sunny";
                s.weatherTransition = null;
                s.skyTint = null;
                s.skyTintStrength = 0;
                s.skyTintTarget = 0;
                if (r._applyDayNightToScene) r._applyDayNightToScene();
                if (s.directionalLight) s.directionalLight.color.setRGB(1, 1, 1);
                if (s.hemisphereLight) {
                    s.hemisphereLight.color.setRGB(0.82, 0.82, 0.82);
                    s.hemisphereLight.groundColor.setRGB(0.5, 0.5, 0.5);
                }
                if (s.ambientLight) s.ambientLight.color.setRGB(1, 1, 1);
                s.scene.fog = null;
                s.playerEyesUnderwater = false;
                if (!s.scene.background || !s.scene.background.isColor)
                    s.scene.background = new window.THREE.Color(0x555560);
                else s.scene.background.setHex(0x555560);
                // Isolation ERNEUT anwenden (der rAF-Loop hat sie evtl. überschrieben):
                if (window.__anblickGrp) {
                    const keep = new Set(window.__anblickGrp.children);
                    s.scene.traverse((o) => {
                        if (o.isMesh || o.isInstancedMesh) o.visible = keep.has(o);
                    });
                }
                if (window.__anblickCam) {
                    const cc = window.__anblickCam;
                    s.camera.position.set(cc.px, cc.py, cc.pz);
                    s.camera.lookAt(cc.tx, cc.ty, cc.tz);
                    s.camera.updateProjectionMatrix();
                    s.camera.updateMatrixWorld(true);
                }
            }
            const t0 = performance.now();
            try {
                if (typeof s.renderer.renderAsync === "function") {
                    // compileAsync (frische Plain-Mesh-Pipelines beim isolierten Baum) +
                    // mehrfach rendern → den Präsentations-Flake schlagen.
                    if (typeof s.renderer.compileAsync === "function") await s.renderer.compileAsync(s.scene, s.camera);
                    for (let i = 0; i < 4; i++) await s.renderer.renderAsync(s.scene, s.camera);
                } else {
                    for (let i = 0; i < 4; i++) s.renderer.render(s.scene, s.camera);
                }
            } catch (e) {
                return { err: String(e.message || e), ms: Math.round(performance.now() - t0) };
            }
            // wieder stubben, damit der rAF-Hintergrund nicht weiterrendert
            s.renderer.render = function () {};
            if (typeof s.renderer.renderAsync === "function") s.renderer.renderAsync = () => Promise.resolve();
            return { ms: Math.round(performance.now() - t0) };
        });

    const shoot = async (tag) => {
        const r = await realRender();
        await new Promise((res) => setTimeout(res, 150));
        await page.screenshot({ path: path.join(ART, `anblick-${tag}.png`) });
        progress.shots.push({ tag, ms: r.ms, err: r.err || null });
        flush();
        console.log(`  shot anblick-${tag}.png  render=${r.ms}ms ${r.err || "ok"}`);
    };

    // ── SHOT 1 (ZUERST, der wichtigste): ein gewachsener Baum NAH ──
    // §3-Verifikation: liest die Krone als lushe Krone oder als Stachel?
    mark("spawn-tree");
    const tinfo = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state,
            THREE = window.THREE,
            cam = s.camera;
        let spawned = false,
            parts = 0,
            anchors = 0,
            foliageVerts = 0,
            key = "";
        try {
            const keys = r._buildVariantLODs("baum_eiche", 0);
            key = keys && keys[0];
            const bp = key && s.blueprints[key];
            parts = bp && bp.parts ? bp.parts.length : 0;
            anchors = bp && bp._skeleton && bp._skeleton.anchors ? bp._skeleton.anchors.length : 0;
            if (bp) {
                // DER ISOLIERTE BAUM (§3 Seh-Werkzeug, die teuer gelernten Wände):
                // die ECHTE gespawnte (MERGED) Geometrie (`_archFlattenBlueprint`, das
                // Grün eingebacken) als Plain-Meshes, HOCH über Wasser (y=500 → kein
                // Unterwasser-Tint), ALLES andere unsichtbar → der Baum ALLEIN gegen
                // einen GRAUEN Himmel (Laub gegen Blau ist unsichtbar), neutral-weiss
                // beleuchtet (in realRender). So liest die Krone GRÜN+lush — oder nicht.
                const flat = r._archFlattenBlueprint(key);
                if (!flat || !flat.leaves || !flat.leaves.length) return { err: "kein flatten" };
                const grp = new THREE.Group();
                const bbox = new THREE.Box3();
                const treeSet = new Set();
                const UNLIT = window.__anblickUnlit;
                for (const lf of flat.leaves) {
                    let mat = lf.mat;
                    if (UNLIT && THREE.MeshBasicNodeMaterial && THREE.TSL) {
                        // RAW-ALBEDO-Probe: unbeleuchtet, colorNode = das color-Attribut
                        // (NodeMaterial liest vertexColors NICHT automatisch — CLAUDE.md).
                        mat = new THREE.MeshBasicNodeMaterial({ side: lf.mat.side });
                        mat.colorNode = THREE.TSL.vec4(THREE.TSL.attribute("color", "vec3"), THREE.TSL.float(1.0));
                    }
                    const mesh = new THREE.Mesh(lf.geom, mat);
                    mesh.frustumCulled = false;
                    // localMatrix ist für gewachsene (merged) Bäume Identität (die Merge
                    // backt die Part-Transforms in die Geometrie) → NICHT als matrixWorld
                    // setzen (das überschrieb grp.position → Baum bei y≈0 statt y=500).
                    if (lf.localMatrix) mesh.applyMatrix4(lf.localMatrix);
                    grp.add(mesh);
                    treeSet.add(mesh);
                    lf.geom.computeBoundingBox();
                    if (lf.geom.boundingBox) bbox.union(lf.geom.boundingBox);
                    if (lf.mat && lf.mat.side === THREE.DoubleSide && lf.geom.attributes.position)
                        foliageVerts += lf.geom.attributes.position.count;
                }
                grp.position.set(0, 500, 0);
                s.scene.add(grp);
                spawned = true;
                s.scene.traverse((o) => {
                    if ((o.isMesh || o.isInstancedMesh) && !treeSet.has(o)) o.visible = false;
                });
                window.__anblickIsolated = true; // realRender setzt neutrales Licht + grauen Himmel
                const sz = new THREE.Vector3();
                bbox.getSize(sz);
                const lc = new THREE.Vector3();
                bbox.getCenter(lc);
                const cx = grp.position.x + lc.x,
                    cyw = grp.position.y + lc.y,
                    czw = grp.position.z + lc.z;
                cam.fov = 42;
                let dist = (Math.max(sz.y, sz.x) * 0.62) / Math.tan((42 * Math.PI) / 180 / 2) + sz.z * 0.5;
                dist = Math.min(45, Math.max(14, dist));
                cam.position.set(cx - dist, cyw, czw);
                cam.lookAt(cx, cyw, czw);
                cam.updateProjectionMatrix();
                cam.updateMatrixWorld(true);
                s.scene.updateMatrixWorld(true);
                // DEBUG: wo ist der Baum WIRKLICH? (world-bbox der Tree-Meshes)
                const wbb = new THREE.Box3();
                for (const m of treeSet) {
                    m.updateWorldMatrix(true, false);
                    const b = new THREE.Box3().setFromObject(m);
                    wbb.union(b);
                }
                const lm =
                    flat.leaves[0] && flat.leaves[0].localMatrix
                        ? Array.from(flat.leaves[0].localMatrix.elements)
                        : null;
                // die ECHTE Laub-Geom-Farbe (das color-Attribut der DoubleSide-Leaf)
                let fgc = null,
                    fgMatType = null,
                    fgHasColorNode = null;
                for (const lf of flat.leaves) {
                    if (lf.mat && lf.mat.side === THREE.DoubleSide && lf.geom.attributes && lf.geom.attributes.color) {
                        const c = lf.geom.attributes.color;
                        let cr = 0,
                            cg = 0,
                            cb = 0;
                        for (let i = 0; i < c.count; i++) {
                            cr += c.getX(i);
                            cg += c.getY(i);
                            cb += c.getZ(i);
                        }
                        fgc = [+(cr / c.count).toFixed(3), +(cg / c.count).toFixed(3), +(cb / c.count).toFixed(3)];
                        fgMatType = lf.mat.type;
                        fgHasColorNode = !!lf.mat.colorNode;
                        break;
                    }
                }
                window.__anblickDbg = {
                    foliageGeomColor: fgc,
                    foliageMatType: fgMatType,
                    foliageHasColorNode: fgHasColorNode,
                    bbox: [+sz.x.toFixed(1), +sz.y.toFixed(1), +sz.z.toFixed(1)],
                    localBboxCtr: [+lc.x.toFixed(1), +lc.y.toFixed(1), +lc.z.toFixed(1)],
                    worldBbox: wbb.isEmpty()
                        ? null
                        : {
                              min: [+wbb.min.x.toFixed(1), +wbb.min.y.toFixed(1), +wbb.min.z.toFixed(1)],
                              max: [+wbb.max.x.toFixed(1), +wbb.max.y.toFixed(1), +wbb.max.z.toFixed(1)],
                          },
                    camPos: [+cam.position.x.toFixed(1), +cam.position.y.toFixed(1), +cam.position.z.toFixed(1)],
                    lookAt: [+cx.toFixed(1), +cyw.toFixed(1), +czw.toFixed(1)],
                    dist: +dist.toFixed(1),
                    lmTranslate: lm ? [+lm[12].toFixed(1), +lm[13].toFixed(1), +lm[14].toFixed(1)] : null,
                };
                // Der rAF-Loop (_gameLoopTick) überschreibt Kamera/Sichtbarkeit zwischen
                // diesem evaluate und realRender → die Isolation in realRender ERNEUT
                // anwenden (Refs auf window halten).
                window.__anblickGrp = grp;
                window.__anblickCam = {
                    px: cam.position.x,
                    py: cam.position.y,
                    pz: cam.position.z,
                    tx: cx,
                    ty: cyw,
                    tz: czw,
                };
            }
        } catch (e) {
            return { err: String(e.message || e) + " @ " + String((e.stack || "").split("\n")[1] || "") };
        }
        return { spawned, parts, anchors, foliageVerts, key, dbg: window.__anblickDbg || null };
    });
    progress.tree = tinfo;
    flush();
    console.log(
        `  tree key=${tinfo.key} spawned=${tinfo.spawned} parts=${tinfo.parts} anchors=${tinfo.anchors} foliageVerts=${tinfo.foliageVerts} ${tinfo.err || ""}`
    );
    // §5-VERDIKT (OBJEKTIV, flake-unabhängig): die Geometrie + Albedo der Krone.
    // Das BILD ist headless-flake-begrenzt (WebGPU-Präsentation ~50% stale = die
    // dokumentierte WERKZEUG-GRENZE) → der LOOK ist der Schöpfer-Browser (W2).
    const d = tinfo.dbg || {};
    if (d.foliageGeomColor) {
        const [fr, fg, fb] = d.foliageGeomColor;
        const gruen = fg > fr && fg > fb;
        console.log(
            `  §5-VERDIKT (objektiv): Laub-Albedo=[${fr},${fg},${fb}] → ${gruen ? "GRÜN ✓" : "NICHT grün ✗"} · ` +
                `Krone-bbox=${JSON.stringify(d.bbox)} (Volumen, kein Stachel) · foliageVerts=${tinfo.foliageVerts} · mat=${d.foliageMatType}`
        );
    }
    await shoot("baum");

    if (process.env.ANBLICK_ONLY_BAUM === "1") {
        progress.phase = "done-baum-only";
        flush();
        console.log("\n(only-baum) artifacts/anblick-baum.png + anblick-progress.json");
        await browser.close();
        await new Promise((r) => server.close(r));
        process.exit(0);
    }

    // ── SHOT 2+3: Boden/Wald nah, Augenhöhe, zwei Richtungen ──
    for (const [yaw, tag] of [
        [35, "ground-a"],
        [200, "ground-b"],
    ]) {
        mark(`aim-${tag}`);
        await page.evaluate((yaw) => {
            const r = window.anazhRealm,
                s = r.state,
                pm = s.playerMesh,
                cam = s.camera;
            const y = (yaw * Math.PI) / 180,
                ex = pm.position.x,
                ey = pm.position.y + 1.7,
                ez = pm.position.z;
            cam.position.set(ex, ey, ez);
            cam.lookAt(ex + Math.sin(y) * 50, ey - 6, ez + Math.cos(y) * 50);
            cam.updateMatrixWorld(true);
        }, yaw);
        await shoot(tag);
    }

    // ── LAST-ZÄHLER (§1.3): Instanzen + Dreiecke + Draw-Calls ──
    mark("count");
    const counts = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        let instances = 0,
            tris = 0,
            draws = 0,
            meshes = 0,
            instMeshes = 0;
        s.scene.traverse((o) => {
            if (o.isInstancedMesh) {
                const c = o.count || 0;
                instances += c;
                draws++;
                instMeshes++;
                const g = o.geometry;
                const t =
                    g && g.index ? g.index.count / 3 : g && g.attributes.position ? g.attributes.position.count / 3 : 0;
                tris += t * c;
            } else if (o.isMesh) {
                meshes++;
                draws++;
                const g = o.geometry;
                const t =
                    g && g.index
                        ? g.index.count / 3
                        : g && g.attributes && g.attributes.position
                          ? g.attributes.position.count / 3
                          : 0;
                tris += t;
            }
        });
        return {
            instances,
            tris: Math.round(tris),
            draws,
            meshes,
            instMeshes,
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };
    });
    progress.counts = counts;
    mark("done");
    console.log(
        `\nLAST: instances=${counts.instances} tris=${counts.tris.toLocaleString()} drawCalls=${counts.draws} (inst=${counts.instMeshes} mesh=${counts.meshes}) chunks=${counts.chunks}`
    );
    console.log(`artifacts/anblick-{baum,ground-a,ground-b}.png + anblick-progress.json`);

    await browser.close();
    await new Promise((r) => server.close(r));
    process.exit(0);
})();

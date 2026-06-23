// ===== DAS DIORAMA — ALLE KOMPONENTEN IN EINER SZENE, EIN RENDER =====
// Schöpfer-Vorschlag (23.06.2026): „eine Umgebung, in der du alle Komponenten auf einem Chunk hast,
// dann siehst du ja alles." Statt langsamer settled-view + isoliertem Werk-Katalog: EINE Szene mit
// Boden + Baum + Fels + Tempel + Schwert + Rüstung nebeneinander, EINE belichtete Aufnahme → der
// Substanz-Feinschliff (A/B vorher/nachher) in Minuten, mit eigenem Auge. Echter WebGPU-Renderer
// (swiftshader); die Material-Pipeline ist die echte (`_buildFromBlueprint` + `_substanceCharacter`).
//   node scripts/diag-diorama.cjs            → artifacts/diorama.png
//   node scripts/diag-diorama.cjs noshadow   → ohne Schatten (reine Form/Substanz lesen)
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const PORT = 4391;
const MIME = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    if (!fs.existsSync(path.join(ROOT, "artifacts"))) fs.mkdirSync(path.join(ROOT, "artifacts"));
    const noshadow = process.argv.includes("noshadow");
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const t0 = performance.now();
            while ((!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.rendererReady || !window.anazhRealm.state.blueprints) && performance.now() - t0 < 25000)
                await new Promise((r) => setTimeout(r, 100));
        });
        const info = await page.evaluate(async (noshadow) => {
            const r = window.anazhRealm, THREE = window.THREE, st = r.state;
            r._gameLoopTick = () => {};
            if (st.renderer && st.renderer.setAnimationLoop) st.renderer.setAnimationLoop(null);
            // HUD weg → sauberes Bild
            try {
                const cv = st.renderer && st.renderer.domElement;
                for (const el of Array.from(document.body.children)) if (el !== cv && !(cv && el.contains && el.contains(cv))) el.style.display = "none";
                if (cv && cv.style) cv.style.display = "block";
            } catch (_e) {}
            if (r._ensureSkyEnvironment) { try { r._ensureSkyEnvironment(true); } catch (_e) {} }

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x9bb4d0);
            scene.fog = null; // kein Welt-Nebel → die Werke klar lesen
            if (st.scene && st.scene.environment) scene.environment = st.scene.environment;
            scene.add(new THREE.AmbientLight(0xffffff, noshadow ? 0.6 : 0.34));
            const key = new THREE.DirectionalLight(0xfff1d8, noshadow ? 1.35 : 1.8);
            key.position.set(9, 15, 11); key.castShadow = !noshadow; scene.add(key);
            const fill = new THREE.DirectionalLight(0xaecbe8, 0.42); fill.position.set(-7, 4, -5); scene.add(fill);
            const rim = new THREE.DirectionalLight(0xffd9a8, 1.0); rim.position.set(-5, 8, -12); scene.add(rim);

            const log = [];
            const place = (grp, x, z, targetH) => {
                if (!grp) return;
                let box = new THREE.Box3().setFromObject(grp);
                let sz = box.getSize(new THREE.Vector3());
                // Auf vergleichbare Höhe skalieren (Material-Vergleich, nicht Größen-Vergleich):
                if (targetH && sz.y > 0.01) {
                    const s = targetH / sz.y;
                    grp.scale.setScalar(s);
                    box = new THREE.Box3().setFromObject(grp);
                    sz = box.getSize(new THREE.Vector3());
                }
                const c = box.getCenter(new THREE.Vector3());
                grp.position.set(x - c.x, -box.min.y, z - c.z); // Füße auf y=0
                grp.traverse((o) => { if (o.isMesh) o.castShadow = true; });
                scene.add(grp);
                return sz;
            };
            // Die Komponenten — der echte Bau-Pfad (Material = _buildFromBlueprint + _substanceCharacter).
            const comps = [
                ["tempel", () => r._buildFromBlueprint({ name: "_tvar", parts: r._classicalTempleVariant("anazh") }, 0, undefined, {})],
                ["fels", () => r._buildFromBlueprint(st.blueprints["fels_var2"], 0, undefined, {})],
                ["schwert", () => r._buildFromBlueprint(st.blueprints["geraet_schwert"], 0, undefined, {})],
                ["ruestung", () => r._buildFromBlueprint(st.blueprints["ruestung_brustpanzer"], 0, undefined, {})],
                ["esse", () => r._buildFromBlueprint(st.blueprints["esse"], 0, undefined, {})],
                ["portal", () => r._buildFromBlueprint(st.blueprints["welt_portal"], 0, undefined, {})],
            ];
            let x = 0;
            const spacing = 5;
            for (const [name, build] of comps) {
                try {
                    const grp = build();
                    const sz = place(grp, x, 0, 4.2); // auf ~4,2 m normiert → Material vergleichbar
                    log.push(name + (sz ? "(" + sz.x.toFixed(1) + "×" + sz.y.toFixed(1) + ")" : ":null"));
                    x += spacing;
                } catch (e) { log.push(name + ":ERR " + e.message); x += spacing; }
            }
            // BAUM separat (eigener Wachstums-Pfad) hinten
            try {
                const grammar = (r.constructor.SPECIES_GRAMMAR || {})["baum_eiche"];
                if (grammar && r._growTreeBlueprintRich) {
                    if (st.worldMeta) st.worldMeta.genVersion = 7;
                    const parts = r._growTreeBlueprintRich("baum_eiche", "diorama", grammar, { lod: 0 });
                    const skel = r._lastTreeSkeleton;
                    const tbp = { name: "_dTree", parts, _skeleton: skel, instanced: true, _grownSpecies: "baum_eiche" };
                    let grp = r._buildFromBlueprint(tbp, 0, undefined, {});
                    if (skel && r._buildTreeSkeletonLeaves) {
                        const se = r._buildTreeSkeletonLeaves(tbp);
                        if (se && Array.isArray(se.leaves)) for (const lf of se.leaves) {
                            if (!lf || !lf.geom || !lf.mat) continue;
                            const im = new THREE.InstancedMesh(lf.geom, lf.mat, 1);
                            im.setMatrixAt(0, new THREE.Matrix4()); im.instanceMatrix.needsUpdate = true;
                            try { if (im.setColorAt) { im.setColorAt(0, new THREE.Color(0x6f9a4d)); if (im.instanceColor) im.instanceColor.needsUpdate = true; } } catch (_e) {}
                            grp.add(im);
                        }
                    }
                    place(grp, (comps.length - 1) * spacing * 0.5, -7, 7);
                    log.push("baum ok");
                }
            } catch (e) { log.push("baum:ERR " + e.message); }

            // BODEN — eine breite Platte mit der Werk-Substanz (stein-Tags) als Stellvertreter-Terrain.
            try {
                const gmat = r._buildPbrNodeMaterial ? r._buildPbrNodeMaterial({ color: 0x6a7048, tags: { dichte: 1.4, "härte": 1.2, lebendig: 1.0 } }) : new THREE.MeshStandardMaterial({ color: 0x6a7048, roughness: 0.95 });
                const ground = new THREE.Mesh(new THREE.BoxGeometry(70, 1, 40), gmat);
                ground.position.set((comps.length - 1) * spacing * 0.5, -0.5, -3);
                ground.receiveShadow = true;
                scene.add(ground);
            } catch (_e) {}

            // KAMERA — die ganze Reihe ins Bild (leicht erhöht, schräg).
            const all = new THREE.Box3().setFromObject(scene);
            const c = all.getCenter(new THREE.Vector3());
            const sz = all.getSize(new THREE.Vector3());
            const cam = new THREE.PerspectiveCamera(42, 1400 / 800, 0.1, 2000);
            const maxd = Math.max(sz.x, sz.z);
            cam.position.set(c.x + maxd * 0.08, 5.5, c.z + maxd * 0.82); // niedrig + nah (Augenhöhe-nah)
            cam.lookAt(c.x, 2.4, c.z - 1);
            if (!noshadow && st.renderer && st.renderer.shadowMap) {
                st.renderer.shadowMap.enabled = true;
                key.shadow.mapSize.set(2048, 2048);
                const s = key.shadow.camera; s.left = -maxd; s.right = maxd; s.top = maxd; s.bottom = -maxd; s.near = 0.1; s.far = maxd * 6; s.updateProjectionMatrix(); key.shadow.bias = -0.0009;
            }
            window.__dioramaRender = () => { try { st.renderer.render(scene, cam); } catch (e) { window.__dioramaErr = e.message; } };
            return log.join(" · ");
        }, noshadow);
        console.log("Diorama-Komponenten:", info);
        for (let i = 0; i < 8; i++) { await page.evaluate(() => window.__dioramaRender && window.__dioramaRender()); await new Promise((r) => setTimeout(r, 80)); }
        const err = await page.evaluate(() => window.__dioramaErr || "");
        if (err) console.log("[RENDER-ERR]", err);
        await page.screenshot({ path: path.join(ROOT, "artifacts", "diorama.png"), clip: { x: 0, y: 0, width: 1400, height: 800 } });
        console.log("geschrieben: artifacts/diorama.png");
    } finally {
        await browser.close();
        server.close();
    }
})().catch((e) => { console.error("DIORAMA-FEHLER:", e.message); process.exit(1); });

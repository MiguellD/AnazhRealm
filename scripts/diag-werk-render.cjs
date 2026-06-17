// diag-werk-render.cjs — der ANBLICK der Grammatik (Ω-B1 Tempel · Ω-B2 Klinge): baut
// das Werk in einer NEUTRALEN Szene (echte PBR-Materialien + Sky-IBL + neutrale Lichter),
// rahmt die Kamera auf die BBox + screenshottet — für die Schöpfer-Augen-Abnahme (Wand 1).
//   node scripts/diag-werk-render.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4380;
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
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

async function renderWerk(page, bpName, view) {
    await page.evaluate(
        async (bpName, view) => {
            const r = window.anazhRealm,
                THREE = window.THREE,
                st = r.state;
            // Loop EINFRIEREN (sonst rendert der Engine-rAF die Welt-Szene über mein Bild)
            r._gameLoopTick = () => {};
            if (st.renderer && st.renderer.setAnimationLoop) st.renderer.setAnimationLoop(null);
            // HUD ausblenden (das DOM liegt über dem Canvas) → ein sauberes Werk-Bild.
            try {
                const cv = st.renderer && st.renderer.domElement;
                for (const el of Array.from(document.body.children)) {
                    if (el !== cv && !(cv && el.contains && el.contains(cv))) el.style.display = "none";
                }
                if (cv && cv.style) cv.style.display = "block";
            } catch (_e) {}
            if (r._ensureSkyEnvironment) {
                try {
                    r._ensureSkyEnvironment(true);
                } catch (_e) {}
            }
            // eigene NEUTRALE Szene (nur das Werk → schnell, kein Welt-Render) mit der echten
            // Sky-IBL + neutralen Lichtern; die Material-Pipeline ist die echte (_buildFromBlueprint).
            let grp;
            window.__treeInfo = "";
            if (bpName.indexOf("tree:") === 0) {
                // BAUM isoliert: `tree:species:seedOderKlasse` — den Baum DIREKT wachsen
                // (`_growTreeBlueprintRich` setzt `_lastTreeSkeleton`), dann die echten Render-
                // leaves (Tube-Stamm + Foliage-Cards) via `_buildTreeSkeletonLeaves`. Ist das
                // 3. Token eine Größenklasse (strauch/gross/gigant), wird ein Seed GESUCHT, der
                // sie würfelt (zeigt den Giganten mit Brettwurzel, T1). genV=7 erzwingen.
                const tk = bpName.split(":");
                const species = tk[1] || "baum_eiche";
                const wantClass = ["strauch", "gross", "gigant"].includes(tk[2]) ? tk[2] : null;
                let seedKey = tk[2] || "iso-" + species;
                grp = new THREE.Group();
                let leaves = null;
                try {
                    if (r.state.worldMeta) r.state.worldMeta.genVersion = 7;
                    const grammar = (r.constructor.SPECIES_GRAMMAR || {})[species];
                    if (!grammar) window.__treeInfo = "no-grammar:" + species;
                    if (grammar && r._growTreeBlueprintRich) {
                        if (wantClass) {
                            for (let s = 0; s < 6000; s++) {
                                r._growTreeBlueprintRich(species, "cls" + s, grammar, { lod: 0 });
                                if (r._lastTreeSkeleton && r._lastTreeSkeleton.sizeClass === wantClass) {
                                    seedKey = "cls" + s;
                                    break;
                                }
                            }
                        }
                        const parts = r._growTreeBlueprintRich(species, seedKey, grammar, { lod: 0 });
                        const skel = r._lastTreeSkeleton;
                        window.__treeInfo =
                            "cls=" +
                            (skel && skel.sizeClass) +
                            " h=" +
                            (skel && skel.totalH ? skel.totalH.toFixed(0) + "m" : "?") +
                            " parts=" +
                            (parts ? parts.length : 0);
                        const tbp = {
                            name: "_isoTree",
                            parts,
                            _skeleton: skel,
                            instanced: true,
                            _grownSpecies: species,
                        };
                        if (skel && r._buildTreeSkeletonLeaves) {
                            const se = r._buildTreeSkeletonLeaves(tbp);
                            if (se && Array.isArray(se.leaves) && se.leaves.length) leaves = se.leaves;
                            window.__treeInfo += " leaves=" + (leaves ? leaves.length : 0);
                        }
                        if (!leaves && Array.isArray(parts) && parts.length)
                            grp = r._buildFromBlueprint(tbp, 0, undefined, {});
                    }
                } catch (_e) {
                    window.__treeInfo = "ERR:" + _e.message;
                }
                if (leaves) {
                    for (const lf of leaves) {
                        if (!lf || !lf.geom || !lf.mat) continue;
                        const im = new THREE.InstancedMesh(lf.geom, lf.mat, 1);
                        im.setMatrixAt(0, new THREE.Matrix4());
                        im.instanceMatrix.needsUpdate = true;
                        try {
                            if (im.setColorAt) {
                                im.setColorAt(0, new THREE.Color(0x6f9a4d));
                                if (im.instanceColor) im.instanceColor.needsUpdate = true;
                            }
                        } catch (_e) {}
                        grp.add(im);
                    }
                }
            } else if (bpName.indexOf("creature:") === 0) {
                // KREATUR isoliert: `creature:soul:bodySize` — der echte Spawn-Pfad
                // (`_buildCreatureGroup` + group.scale + `_applyCreatureAllometry`) → zeigt die
                // T5-Allometrie (ein Koloss mit STOCKIGEN Beinen vs. ein zarter Zwerg).
                const ck = bpName.split(":");
                const soul = ck[1] || "wesen";
                const bs = parseFloat(ck[2]) || 1;
                grp = r._buildCreatureGroup(soul);
                grp.scale.setScalar(bs);
                if (r._applyCreatureAllometry) r._applyCreatureAllometry(grp, soul, bs);
                window.__treeInfo = "creature " + soul + " bodySize=" + bs;
                if (window.__skel) {
                    // DEBUG: die Haut ausblenden, die rohen Knochen-Teile zeigen (das Skelett in 3D)
                    grp.traverse((o) => {
                        if (o.isMesh) o.visible = !o.userData._creatureSkin;
                    });
                }
                if (window.__normskin) {
                    // DEBUG: die Haut mit MeshNormalMaterial (Normalen als RGB) → invertierte
                    // Normalen-Inseln werden als „falsche" Farbe sichtbar (Loch vs. konvex).
                    grp.traverse((o) => {
                        if (o.isMesh && o.userData._creatureSkin) {
                            o.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
                        }
                    });
                }
            } else if (bpName.indexOf("playeravatar:") === 0) {
                // GUSS 2b — der ECHTE getragene Spieler-Avatar (_buildHumanGroup) + die Pose,
                // die animatePlayerSoul fahren würde. `playeravatar:pose` (rest/walk).
                const pose = bpName.split(":")[1] || "rest";
                grp = new THREE.Group();
                try {
                    const av = r._buildHumanGroup();
                    grp.add(av);
                    if (av.userData && av.userData.rig) {
                        if (pose === "walk") r._animateHuman(av, 0, Math.PI * 0.32, true, false);
                        else r._animateHuman(av, 0, 0, false, false);
                        av.updateMatrixWorld(true);
                        window.__treeInfo = "playeravatar " + pose + " rig=yes";
                    } else {
                        window.__treeInfo = "playeravatar " + pose + " rig=NO(fallback)";
                    }
                } catch (_e) {
                    window.__treeInfo = "ERR:" + _e.message;
                }
            } else if (bpName === "humanoidlineup") {
                // GUSS 5 — die VIELFALT-GALERIE: N Genom-Körper nebeneinander in EINEM Bild
                // (der „RPM in den Schatten"-Beweis: distinkte Körper aus EINEM Gesetz).
                grp = new THREE.Group();
                const seeds = ["athlet", "schwer", "frau", "schlank", "huene"];
                let i = 0;
                for (const sd of seeds) {
                    try {
                        const gen = r._rollHumanoidGenome(sd);
                        const rig = r._buildHumanoidRig(gen);
                        if (rig && rig.mesh) {
                            r._animateHumanoidRig(rig.rig, 0, 0, false, false); // Ruhe-Pose
                            rig.mesh.position.x = (i - (seeds.length - 1) / 2) * 1.5;
                            rig.mesh.updateMatrixWorld(true);
                            grp.add(rig.mesh);
                        }
                    } catch (_e) {
                        window.__treeInfo = "ERR:" + _e.message;
                    }
                    i++;
                }
                if (!window.__treeInfo) window.__treeInfo = "lineup " + seeds.length;
            } else if (bpName === "humanoidbuild") {
                // GUSS 5 — der BAU-ACHSEN-BEWEIS: schlank → mittel → schwer, EXPLIZITE build-Werte
                // (gleiches Geschlecht/Größe/Kopf), nebeneinander. Isoliert die Statur-Achse.
                grp = new THREE.Group();
                const builds = [0.05, 0.5, 0.95];
                let i = 0;
                for (const b of builds) {
                    try {
                        const rig = r._buildHumanoidRig({
                            build: b,
                            muscle: b,
                            sex: 0.12,
                            headRatio: 1.0,
                            kh: 0.21,
                            skinColor: 0xc09060,
                            hairColor: 0x241712,
                        });
                        if (rig && rig.mesh) {
                            r._animateHumanoidRig(rig.rig, 0, 0, false, false);
                            rig.mesh.position.x = (i - 1) * 1.7;
                            rig.mesh.updateMatrixWorld(true);
                            grp.add(rig.mesh);
                        }
                    } catch (_e) {
                        window.__treeInfo = "ERR:" + _e.message;
                    }
                    i++;
                }
                if (!window.__treeInfo) window.__treeInfo = "build 0.05/0.5/0.95";
            } else if (bpName.indexOf("humanoidvar:") === 0) {
                // GUSS 5 — EIN Genom-Körper aus einem Seed (Detail).
                const seed = bpName.split(":")[1] || "a";
                grp = new THREE.Group();
                try {
                    const gen = r._rollHumanoidGenome(seed);
                    const rig = r._buildHumanoidRig(gen);
                    if (rig && rig.mesh) {
                        grp.add(rig.mesh);
                        r._animateHumanoidRig(rig.rig, 0, 0, false, false);
                        rig.mesh.updateMatrixWorld(true);
                        window.__treeInfo =
                            "var " +
                            seed +
                            " sex=" +
                            gen.sex.toFixed(2) +
                            " build=" +
                            gen.build.toFixed(2) +
                            " hr=" +
                            gen.headRatio.toFixed(2);
                    } else window.__treeInfo = "NO-RIG";
                } catch (_e) {
                    window.__treeInfo = "ERR:" + _e.message;
                }
            } else if (bpName.indexOf("humanoidrig:") === 0) {
                // GUSS 2 — das RIG (SkinnedMesh + Bones): `humanoidrig:pose:sex` (bind/rest/walk).
                const hk = bpName.split(":");
                const pose = hk[1] || "rest";
                const sex = parseFloat(hk[2]) || 0;
                grp = new THREE.Group();
                try {
                    const rig = r._buildHumanoidRig({ sex, skinColor: 0xc98a63 });
                    if (rig && rig.mesh) {
                        grp.add(rig.mesh);
                        if (pose === "rest") r._animateHumanoidRig(rig.rig, 0, 0, false, false);
                        else if (pose === "walk") r._animateHumanoidRig(rig.rig, 0, Math.PI * 0.32, true, false);
                        else if (pose === "walk2") r._animateHumanoidRig(rig.rig, 0, Math.PI * 1.15, true, false);
                        rig.mesh.updateMatrixWorld(true);
                        window.__treeInfo = "humanoidrig " + pose + " bones=" + rig.bones.length;
                    } else {
                        window.__treeInfo = "NO-RIG";
                    }
                } catch (_e) {
                    window.__treeInfo = "ERR:" + _e.message;
                }
            } else if (bpName.indexOf("humanoid:") === 0) {
                // GUSS 1 — das HUMANOIDE Skelett-Gesetz isoliert: Skelett → Metaball-Haut →
                // Hide-Material. `humanoid:sex` (0 mask., 1 weibl.). __skel zeigt die rohen Teile.
                const hk = bpName.split(":");
                const sex = parseFloat(hk[1]) || 0;
                const skinCol = 0xc98a63;
                grp = new THREE.Group();
                try {
                    const parts = r.constructor._humanoidSkeleton({ sex, bodyColor: skinCol, limbColor: skinCol });
                    window.__treeInfo = "humanoid sex=" + sex + " parts=" + parts.length;
                    if (window.__skel) {
                        grp = r._buildFromBlueprint({ name: "_humanoid", parts }, 0, undefined, {});
                    } else {
                        const geom = r._buildCreatureSkinGeometry(parts);
                        if (geom) {
                            const mat = r._buildCreatureHideMaterial(skinCol, {});
                            const skin = new THREE.Mesh(geom, mat);
                            skin.castShadow = true;
                            grp.add(skin);
                        } else {
                            window.__treeInfo += " NO-GEOM";
                        }
                    }
                } catch (_e) {
                    window.__treeInfo = "ERR:" + _e.message;
                }
            } else if (bpName.indexOf("templevar:") === 0) {
                // V18.250 — eine Tempel-VARIANTE direkt aus einem Seed (zeigt Palette + Größe)
                const seed = bpName.split(":")[1] || "anazh";
                grp = r._buildFromBlueprint(
                    { name: "_tvar", parts: r._classicalTempleVariant(seed) },
                    0,
                    undefined,
                    {}
                );
            } else {
                grp = r._buildFromBlueprint(st.blueprints[bpName], 0, undefined, {});
            }
            // DIAGNOSE-ANSICHTEN (global, jeder Zweig): __normskin → Normalen als RGB (deckt
            // invertierte Normalen/Risse/Nähte auf); __skel → die rohe Skelett-Geometrie.
            if (window.__normskin && grp) {
                grp.traverse((o) => {
                    if (o.isMesh && (o.userData._creatureSkin || o.isSkinnedMesh)) {
                        o.material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
                    }
                });
            }
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x9bb4d0);
            if (st.scene && st.scene.environment) scene.environment = st.scene.environment;
            // PRODUKT-SHOT-LICHT (repräsentiert die belichtete Spiel-Welt: Sonne + Schatten +
            // Sky-IBL + Rim, nicht flaches Grau): kräftiger warmer KEY (wirft Schatten) + kühler
            // FILL + ein warmer RIM von hinten-oben (hebt die Silhouette/das Fell aus dem Grund).
            scene.add(new THREE.AmbientLight(0xffffff, 0.32));
            const key = new THREE.DirectionalLight(0xfff1d8, 1.85);
            key.position.set(7, 13, 9);
            key.castShadow = true;
            scene.add(key);
            const fill = new THREE.DirectionalLight(0xaecbe8, 0.4);
            fill.position.set(-6, 3, -4);
            scene.add(fill);
            const rim = new THREE.DirectionalLight(0xffd9a8, 1.1);
            rim.position.set(-4, 7, -10);
            scene.add(rim);
            const box = new THREE.Box3().setFromObject(grp);
            const c = box.getCenter(new THREE.Vector3());
            const sz = box.getSize(new THREE.Vector3());
            grp.position.sub(c); // ins Zentrum
            grp.traverse((o) => {
                if (o.isMesh) o.castShadow = true;
            });
            scene.add(grp);
            // maxd aus der DOMINANTEN Dimension (hohe Dinge wie Bäume/Kreaturen sind y-lang →
            // die volle vertikale Spanne muss ins Bild, sonst Crop) + 10 % Luft.
            const maxd = (Math.max(sz.x, sz.y, sz.z) || 2) * 1.1;
            // BODEN + SCHATTEN — erdet das Werk (kein Schweben im Nichts) + Kontakt-Schatten,
            // die die FORM lesen lassen. Repräsentiert die Spiel-Welt (Sonne wirft Schatten).
            try {
                if (st.renderer && st.renderer.shadowMap) st.renderer.shadowMap.enabled = true;
                key.shadow.mapSize.set(1024, 1024);
                const sc = key.shadow.camera;
                sc.left = -maxd;
                sc.right = maxd;
                sc.top = maxd;
                sc.bottom = -maxd;
                sc.near = 0.1;
                sc.far = maxd * 6;
                sc.updateProjectionMatrix();
                key.shadow.bias = -0.0009;
                const ground = new THREE.Mesh(
                    new THREE.PlaneGeometry(maxd * 8, maxd * 8),
                    new THREE.MeshStandardMaterial({ color: 0x8593a6, roughness: 0.96, metalness: 0 })
                );
                ground.rotation.x = -Math.PI / 2;
                ground.position.y = -sz.y / 2 - maxd * 0.004;
                ground.receiveShadow = true;
                scene.add(ground);
            } catch (_e) {}
            // GRADIENT-HINTERGRUND (atmosphärisch, nicht flach grau).
            try {
                const cv = document.createElement("canvas");
                cv.width = 16;
                cv.height = 256;
                const g2 = cv.getContext("2d");
                const grd = g2.createLinearGradient(0, 0, 0, 256);
                grd.addColorStop(0, "#cdd8e3");
                grd.addColorStop(0.55, "#a3b3c4");
                grd.addColorStop(1, "#717f90");
                g2.fillStyle = grd;
                g2.fillRect(0, 0, 16, 256);
                const bgTex = new THREE.CanvasTexture(cv);
                if (THREE.SRGBColorSpace) bgTex.colorSpace = THREE.SRGBColorSpace;
                scene.background = bgTex;
            } catch (_e) {}
            const isTree = bpName.indexOf("tree:") === 0;
            const isCreature =
                bpName.indexOf("creature:") === 0 ||
                bpName.indexOf("humanoid:") === 0 ||
                bpName.indexOf("humanoidrig:") === 0 ||
                bpName.indexOf("humanoidvar:") === 0 ||
                bpName === "humanoidlineup" ||
                bpName.indexOf("playeravatar:") === 0;
            const isTall = isTree || isCreature; // braucht mehr Distanz (volle Höhe ins Bild)
            const cam = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
            const dist = isTall ? 2.0 : 1.5;
            const cy = isTall ? 0.3 : 0.26;
            // MULTI-ANGLE: "side" blickt ENTLANG -x (die Seiten-Silhouette — wo die
            // Gesetze sich zeigen: Profil, Glied-Anbindung, schwebende Teile); "front"
            // frontal; "back" von hinten; sonst 3/4. (Die Front allein versteckt die Fehler.)
            let camX, camZ;
            if (view === "side") {
                camX = maxd * dist;
                camZ = maxd * 0.22;
            } else if (view === "front") {
                camX = maxd * 0.18;
                camZ = maxd * dist;
            } else if (view === "back") {
                camX = maxd * 0.18;
                camZ = -maxd * dist;
            } else {
                camX = maxd * 0.85;
                camZ = maxd * dist;
            }
            cam.position.set(camX, maxd * cy, camZ);
            cam.lookAt(0, isTree ? 0 : -sz.y * 0.02, 0);
            window.__rs = () => {
                try {
                    st.renderer.render(scene, cam);
                } catch (_e) {}
            };
        },
        bpName,
        view
    );
    for (let i = 0; i < 6; i++) {
        await page.evaluate(() => window.__rs && window.__rs());
        await new Promise((r) => setTimeout(r, 60));
    }
}

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 900 });
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 20000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    !window.anazhRealm.state.rendererReady ||
                    !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 100));
        });
        const FILTER = process.argv[2] || ""; // optionaler Substring-Filter (bp+file) für gezielte Werk-Renders
        if (process.argv[3] === "skel") await page.evaluate(() => (window.__skel = true)); // DEBUG: Skelett statt Haut
        if (process.argv[3] === "norm") await page.evaluate(() => (window.__normskin = true)); // DEBUG: Normalen als RGB
        // COLD-START-FIX: den Spiel-Loop EINMAL einfrieren BEVOR der erste Werk-Render läuft —
        // sonst erwischte der erste Screenshot (front) das Welt-Frame statt des isolierten Werks
        // (der Loop rendert die Welt-Szene noch, während renderWerk gerade erst die Iso-Szene baut).
        await page.evaluate(() => {
            const r = window.anazhRealm,
                st = r && r.state;
            if (r) r._gameLoopTick = () => {};
            if (st && st.renderer && st.renderer.setAnimationLoop) st.renderer.setAnimationLoop(null);
        });
        await new Promise((res) => setTimeout(res, 200));
        for (const [bp, file, view] of [
            // ── BÄUME (T1/T6) ──
            ["tree:baum_eiche:0", "werk-baum-eiche.png", "front"], // Breitblatt + Rinde-Maserung
            ["tree:baum_palme:0", "werk-baum-palme.png", "front"], // T1 NEU: Palme (palm-Atlas)
            ["tree:baum_zypresse:0", "werk-baum-zypresse.png", "front"], // T1 NEU: Säulen-Zypresse (scale)
            ["tree:baum_tanne:0", "werk-baum-tanne.png", "front"], // Nadel-Kegel
            ["tree:baum_eiche:gigant", "werk-baum-gigant.png", "front"], // T1: Mammut + Brettwurzel
            // ── LANDMARKS (T3, freistehend, Form folgt dem Terrain) ──
            ["fels_var2", "werk-fels-a.png", ""],
            ["fels_var7", "werk-fels-b.png", ""],
            ["kristall_var0", "werk-kristall.png", ""], // F4: Habitus (Druse/Cluster/Geode) + Facetten + Glanz
            ["glut_var0", "werk-glut.png", ""], // T3: Becken + Intensität
            // ── BAUWERKE (T2) ──
            ["village", "werk-dorf.png", "front"], // begehbare Hütten + Platz/Wege
            ["templevar:c", "werk-tempel.png", "front"], // dorische Ordnung, Basalt
            ["esse", "werk-esse.png", ""], // T2: Werkstatt (Proportion + Detail)
            ["welt_portal", "werk-portal.png", "front"], // T2: Portal
            // ── GERÄT / RÜSTUNG / TRANK (T4) ──
            ["geraet_schwert", "werk-schwert.png", ""], // Oakeshott-Klinge + Hohlkehle
            ["geraet_spitzhacke", "werk-spitzhacke.png", ""], // Hebel (Stiel/Kopf/Keil)
            ["ruestung_brustpanzer", "werk-ruestung.png", ""], // T4: Platten + Artikulation
            ["trank_lebenssaft", "werk-trank.png", ""], // T4: Phiole + Glasur
            // ── AVATAR / KREATUR (T5) ──
            ["humanoid:0", "werk-humanoid-front.png", "front"], // GUSS 1: anatomisches Skelett → Metaball-Haut
            ["humanoid:0", "werk-humanoid-seite.png", "side"], // Profil (A-Pose, V-Taper)
            ["humanoid:1", "werk-humanoid-frau.png", "front"], // Sanduhr (sex=1)
            ["humanoidrig:bind:0", "werk-rig-bind.png", "front"], // GUSS 2: SkinnedMesh Bind-Pose
            ["humanoidrig:rest:0", "werk-rig-rest.png", "front"], // Kontrapost-Ruhepose (S-Kurve)
            ["humanoidrig:rest:0", "werk-rig-rest-seite.png", "side"], // Kontrapost Profil
            ["humanoidrig:walk:0", "werk-rig-walk.png", "side"], // Walk-Pose (Profil zeigt den Schritt)
            ["playeravatar:rest", "werk-player-rest.png", "front"], // GUSS 2b: der ECHTE Spieler-Avatar
            ["playeravatar:walk", "werk-player-walk.png", "side"], // im Walk-Cycle
            // KRITISCHE EVAL (Guss 3) — alle Winkel, deckt Fehler auf, die die Front versteckt
            ["humanoidrig:rest:0", "eval-rest-front.png", "front"],
            ["humanoidrig:rest:0", "eval-rest-side.png", "side"],
            ["humanoidrig:rest:0", "eval-rest-back.png", "back"],
            ["humanoidrig:rest:0", "eval-rest-34.png", ""],
            ["humanoidrig:walk:0", "eval-walk-34.png", ""],
            // GUSS 5 — die VIELFALT-GALERIE (RPM in den Schatten)
            ["humanoidlineup", "eval-lineup.png", "front"],
            ["humanoidbuild", "eval-build.png", "front"],
            ["humanoidvar:schwer", "eval-var-schwer.png", "front"],
            ["humanoidvar:athlet", "eval-var-athlet.png", "front"],
            ["avatar_waechter", "werk-avatar.png", "front"], // Seele/Körper
            ["creature:wesen:0.7", "werk-kreatur-zwerg.png", "front"], // T5: zart, zwerg
            ["creature:wesen:2.5", "werk-kreatur-koloss.png", "front"], // T5: STOCKIG (Allometrie)
            ["creature:wesen:2.5", "werk-kreatur-koloss-seite.png", "side"], // SEITE: das Profil/die Gesetze
            ["creature:wesen:2.5", "werk-kreatur-34.png", ""], // DEBUG 3/4 (die Mulde in 3D)
            ["creature:glutwesen:2.0", "werk-kreatur-glutwesen.png", "front"], // T5: Glut-Wesen, gross
            ["creature:glutwesen:2.0", "werk-kreatur-glutwesen-seite.png", "side"], // SEITE
            ["ruestung_brustpanzer", "werk-ruestung-seite.png", "side"], // SEITE: wie getragen liest
            // ── FAHRZEUG (T4) ──
            ["fahrzeug_wagen", "werk-wagen.png", ""], // SSF: Spur/Rad/Kabine
        ]) {
            if (FILTER && !(bp + " " + file).includes(FILTER)) continue;
            await renderWerk(page, bp, view);
            const info = await page.evaluate(() => window.__treeInfo || "");
            const out = path.join(root, "artifacts", file);
            await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 900, height: 900 } });
            console.log("geschrieben:", "artifacts/" + file, "|", info);
        }
    } finally {
        await browser.close();
        server.close();
    }
})();

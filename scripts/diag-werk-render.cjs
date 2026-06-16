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
                // BAUM isoliert: den Baum DIREKT wachsen (`_growTreeBlueprintRich` setzt
                // `_lastTreeSkeleton`), dann die echten Render-leaves (Tube-Stamm + Foliage-
                // Cards) via `_buildTreeSkeletonLeaves` — derselbe Pfad wie die Welt. genV=7
                // erzwingen, sonst setzt das Wachsen kein Skeleton. Instanced-Mesh count=1
                // (für den Foliage-Tint). Fallback: die Parts primitiv (kein Skeleton).
                const species = bpName.split(":")[1] || "baum_eiche";
                grp = new THREE.Group();
                let leaves = null;
                try {
                    if (r.state.worldMeta) r.state.worldMeta.genVersion = 7;
                    const grammar = (r.constructor.SPECIES_GRAMMAR || {})[species];
                    if (!grammar) window.__treeInfo = "no-grammar:" + species;
                    if (grammar && r._growTreeBlueprintRich) {
                        const parts = r._growTreeBlueprintRich(species, "iso-" + species, grammar, { lod: 0 });
                        const skel = r._lastTreeSkeleton;
                        window.__treeInfo = "parts=" + (parts ? parts.length : 0) + " skel=" + (skel ? "Y" : "N");
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
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x9bb4d0);
            if (st.scene && st.scene.environment) scene.environment = st.scene.environment;
            scene.add(new THREE.AmbientLight(0xffffff, 0.55));
            const key = new THREE.DirectionalLight(0xfff1d8, 1.3);
            key.position.set(6, 11, 8);
            scene.add(key);
            const fill = new THREE.DirectionalLight(0xaecbe8, 0.4);
            fill.position.set(-5, 3, -5);
            scene.add(fill);
            const box = new THREE.Box3().setFromObject(grp);
            const c = box.getCenter(new THREE.Vector3());
            const sz = box.getSize(new THREE.Vector3());
            grp.position.sub(c); // ins Zentrum
            scene.add(grp);
            const maxd = Math.max(sz.x, sz.y, sz.z) || 2;
            const isTree = bpName.indexOf("tree:") === 0;
            const cam = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
            const a = view === "front" ? 0.12 : 1.0;
            // Bäume: weiter weg + leicht von oben, damit Stamm UND Krone ganz im Bild sind.
            const dist = isTree ? 2.0 : 1.45;
            const cy = isTree ? 0.32 : 0.28;
            cam.position.set(maxd * a, maxd * cy, maxd * dist);
            cam.lookAt(0, isTree ? 0 : -sz.y * 0.04, 0);
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
        for (const [bp, file, view] of [
            ["tree:baum_eiche:0", "werk-baum-eiche.png", "front"], // Ω-O7: die Rinde-Maserung am Stamm
            ["tree:baum_tanne:0", "werk-baum-tanne.png", "front"],
            ["village", "werk-dorf.png", "front"], // Ω-B4: die variierten Hütten
            ["templevar:n", "werk-tempel-marmor.png", "front"], // V18.250: weisser Marmor
            ["templevar:c", "werk-tempel-basalt.png", "front"], // V18.250: dunkler Basalt
            ["templevar:h", "werk-tempel-granit.png", "front"], // V18.250: Granit, gigantisch
        ]) {
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

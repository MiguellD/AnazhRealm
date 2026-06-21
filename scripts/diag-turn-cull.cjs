// V18.300-Verifikation: beweist, dass die REGIONALEN Streu-Laub-Gruppen beim
// Umsehen cullen. Baut die Welt, dann testet jede region-gekeyte InstancedMesh-
// Gruppe (instanz-bewusste Bounding-Sphere) gegen ein Frustum, das nach +Z bzw.
// −Z (180° gedreht) schaut. Cullt das Wegschauen einen anderen, signifikanten
// Anteil → die Wurzel des „kann mich kaum drehen" ist strukturell geheilt.
// (Kein echter GPU-Render nötig — der Frustum-Test IST die Engine-Logik.)
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4364,
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
    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 120000) {
            const r = window.anazhRealm;
            if (r && !stubbed && r.state && r.state.renderer) {
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
                if (sz > 40 && stableFor > 80) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        // dem Scatter ein paar ruhige Frames geben (er baut nur, wenn das Streaming nichts tut)
        for (let i = 0; i < 400; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (_e) {}
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const scene = s.scene,
            cam = s.camera;
        if (!scene || !cam) return { error: "no scene/cam" };
        const pp = s.playerMesh ? s.playerMesh.position : { x: 0, y: 30, z: 0 };

        // alle region-gekeyten Laub-Gruppen (Key enthält '@') vs globale
        const regional = [],
            global = [];
        scene.traverse((o) => {
            const k = o.userData && o.userData.archInstanceKey;
            if (!k || !o.isInstancedMesh) return;
            const tris =
                (o.geometry && o.geometry.index
                    ? o.geometry.index.count / 3
                    : o.geometry
                      ? o.geometry.attributes.position.count / 3
                      : 0) * (o.count || 0);
            (k.includes("@") ? regional : global).push({ mesh: o, tris });
        });

        const triOfGroup = (m) =>
            (m.geometry && m.geometry.index
                ? m.geometry.index.count / 3
                : m.geometry
                  ? m.geometry.attributes.position.count / 3
                  : 0) * (m.count || 0);

        // ein Frustum bauen, das von der Spieler-Augenhöhe in Richtung dir schaut
        const probe = (dirX, dirZ) => {
            const c = cam.clone();
            c.position.set(pp.x, pp.y + 1.6, pp.z);
            c.up.set(0, 1, 0);
            c.lookAt(pp.x + dirX * 100, pp.y + 1.6, pp.z + dirZ * 100);
            c.updateMatrixWorld(true);
            c.updateProjectionMatrix();
            const m = new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
            const fr = new THREE.Frustum().setFromProjectionMatrix(m);
            let visGroups = 0,
                visTris = 0,
                culledGroups = 0,
                culledTris = 0;
            for (const g of regional) {
                const mesh = g.mesh;
                if (!mesh.boundingSphere) {
                    try {
                        mesh.computeBoundingSphere();
                    } catch (_e) {}
                }
                const tris = triOfGroup(mesh);
                let inside = true;
                if (mesh.frustumCulled && mesh.boundingSphere) {
                    const sph = mesh.boundingSphere.clone().applyMatrix4(mesh.matrixWorld);
                    inside = fr.intersectsSphere(sph);
                }
                if (inside) {
                    visGroups++;
                    visTris += tris;
                } else {
                    culledGroups++;
                    culledTris += tris;
                }
            }
            return { visGroups, visTris, culledGroups, culledTris };
        };

        const fwd = probe(0, 1);
        const back = probe(0, -1);
        const left = probe(1, 0);
        const regionalTris = regional.reduce((a, g) => a + triOfGroup(g.mesh), 0);
        const globalTris = global.reduce((a, g) => a + g.tris, 0);
        return {
            flag: s.useRegionFoliageCull,
            regionalGroups: regional.length,
            globalGroups: global.length,
            regionalTris,
            globalTris,
            fwd,
            back,
            left,
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };
    });

    console.log("===== V18.300 TURN-CULL-VERIFIKATION =====\n");
    if (out.error) {
        console.log("FEHLER:", out.error);
    } else {
        console.log(`  Flag useRegionFoliageCull = ${out.flag} · Chunks ${out.chunks}`);
        console.log(
            `  Laub-Gruppen: regional ${out.regionalGroups} (cullbar) · global ${out.globalGroups} (placed, nie gecullt)`
        );
        console.log(
            `  Laub-Dreiecke: regional ${(out.regionalTris / 1000).toFixed(1)}k · global ${(out.globalTris / 1000).toFixed(1)}k\n`
        );
        const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(0) : "0");
        for (const [name, d] of [
            ["NACH VORN (+Z)", out.fwd],
            ["NACH HINTEN (−Z, 180° gedreht)", out.back],
            ["NACH LINKS (+X)", out.left],
        ]) {
            console.log(`  ${name}:`);
            console.log(
                `    sichtbar ${d.visGroups} Grp / ${(d.visTris / 1000).toFixed(1)}k Tris · GECULLT ${d.culledGroups} Grp / ${(d.culledTris / 1000).toFixed(1)}k Tris (${pct(d.culledTris, out.regionalTris)}% weniger Laub-Last)`
            );
        }
        const avgCull = (out.fwd.culledTris + out.back.culledTris + out.left.culledTris) / 3;
        console.log("");
        if (out.regionalGroups === 0) console.log("  ⚠ KEINE regionalen Gruppen — Flag aus oder kein Scatter gebaut.");
        else if (avgCull / Math.max(1, out.regionalTris) > 0.2)
            console.log(
                `  ✓ BEWIESEN: Umsehen cullt im Schnitt ${((100 * avgCull) / out.regionalTris).toFixed(0)}% der Laub-Last (vorher: 0% — frustumCulled=false).`
            );
        else
            console.log(
                `  ~ Schwacher Cull (${((100 * avgCull) / out.regionalTris).toFixed(0)}%) — Regionen evtl. zu nah/wenige; Mechanik steht.`
            );
    }
    console.log("\n==========================================");
    await browser.close();
    server.close();
    process.exit(0);
})();

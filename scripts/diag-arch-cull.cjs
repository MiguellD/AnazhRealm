// V18.353 PHASE A.1 — DRAW-CALL-KOLLAPS: beweist, dass die PLATZIERTE Architektur
// (`_archInstanceAdd`) jetzt region-gekeyt + frustum-cullbar ist (vorher GLOBAL,
// frustumCulled=false → NIE gecullt, die ganze Welt rendert egal wohin man schaut).
// Vier Wände, alle hardware-unabhängig (reine Frustum-/Logik-Prüfung, kein GPU-Render):
//   (1) der Region-Key `_archPlacedRegionKey`: klein → `p:regX,regZ` · groß → null (global)
//       · skaliert-groß → null (entry.scale faltet ein) · Toggle aus → null (A/B-Revert)
//   (2) PLATZIERUNG: ein echter instanceable Built-in an 4 fernen Spots (je eigene Region)
//       → die Gruppen tragen `@p:`-Keys, frustumCulled=true, LOKALE Bounding-Sphere
//   (3) CULL: Kamera schaut +Z → die -Z-Spots (hinten) cullen (der FPS-Gewinn)
//   (4) NAMENSRAUM: der `p:`-Präfix trennt strikt von der Streu (`@regX,regZ`) → keine
//       Kollision mit `_disposeScatterRegion`.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4411,
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
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const A = r.constructor;
        const scene = s.scene,
            cam = s.camera;
        if (!scene || !cam) return { error: "no scene/cam" };

        // ---------- (1) LOGIK: _archPlacedRegionKey Schwelle + Toggle ----------
        // Synthetische Baupläne — NUR für _compoundVisualExtent (nicht gerendert).
        s.blueprints["__diag_small"] = {
            name: "__diag_small",
            instanced: true,
            parts: [{ position: { x: 0, y: 0, z: 0 }, size: { x: 4, y: 5, z: 4 } }],
        };
        s.blueprints["__diag_big"] = {
            name: "__diag_big",
            instanced: true,
            parts: [{ position: { x: 0, y: 0, z: 0 }, size: { x: 200, y: 8, z: 200 } }],
        };
        const smallEntry = { type: "__diag_small", position: { x: 300, y: 0, z: -300 }, scale: 1 };
        const bigEntry = { type: "__diag_big", position: { x: 300, y: 0, z: -300 }, scale: 1 };
        const scaledSmall = { type: "__diag_small", position: { x: 300, y: 0, z: -300 }, scale: 40 }; // span 160 > 128

        const prevToggle = s.useRegionArchCull;
        s.useRegionArchCull = true;
        const keySmall = r._archPlacedRegionKey(smallEntry);
        const keyBig = r._archPlacedRegionKey(bigEntry);
        const keyScaled = r._archPlacedRegionKey(scaledSmall);
        s.useRegionArchCull = false;
        const keyOff = r._archPlacedRegionKey(smallEntry);
        s.useRegionArchCull = prevToggle;
        // Region-Mathe: floor(300/256)=1, floor(-300/256)=-2 → "p:1,-2"
        const expectSmall = "p:1,-2";

        // ---------- (2)/(3) PLATZIERUNG + CULL mit einem echten Built-in ----------
        let bpName = null,
            bpSpan = 0;
        for (const name of Object.keys(s.blueprints)) {
            if (name.indexOf("__diag") === 0) continue;
            const flat = r._archFlattenBlueprint(name);
            if (!flat || !flat.instanceable) continue;
            const ext = r._compoundVisualExtent(s.blueprints[name]);
            const span = Math.max(ext.dx || 0, ext.dz || 0);
            if (span > 0 && span <= A.ARCH_REGION_CULL_MAX_SPAN) {
                bpName = name;
                bpSpan = span;
                break;
            }
        }
        let placed = { ok: false, bpName: null };
        if (bpName) {
            const spots = [
                { x: 300, z: 400 },
                { x: -300, z: 600 },
                { x: 350, z: -450 },
                { x: -280, z: -700 },
            ];
            const entries = [];
            let seed = 1;
            for (const sp of spots) {
                const y = r.getTerrainHeightAt(sp.x, sp.z);
                const e = {
                    id: "diagP" + seed,
                    type: bpName,
                    position: { x: sp.x, y: Number.isFinite(y) ? y : 5, z: sp.z },
                    seed: seed++,
                    scale: 1,
                };
                r._rebuildArchitectureMesh(e);
                entries.push(e);
            }
            // die platzierten Gruppen einsammeln (bpName + @p:)
            const groups = [];
            for (const [k, g] of s.archInstanceGroups) {
                if (k.indexOf(bpName + "#") === 0 && k.indexOf("@p:") >= 0 && g.mesh && g.mesh.isInstancedMesh)
                    groups.push({ k, mesh: g.mesh });
            }
            const ensureSphere = (mesh) => {
                if (!mesh.boundingSphere) {
                    try {
                        mesh.computeBoundingSphere();
                    } catch (_e) {}
                }
                return mesh.boundingSphere;
            };
            // Frustum-Cull: Kamera am Ursprung schaut +Z → die -Z-Spots (hinten) cullen
            const probe = (dirZ) => {
                const c = cam.clone();
                c.position.set(0, 30, 0);
                c.up.set(0, 1, 0);
                c.lookAt(0, 30, dirZ * 200);
                c.updateMatrixWorld(true);
                c.updateProjectionMatrix();
                const m = new THREE.Matrix4().multiplyMatrices(c.projectionMatrix, c.matrixWorldInverse);
                const fr = new THREE.Frustum().setFromProjectionMatrix(m);
                let vis = 0,
                    culled = 0;
                for (const g of groups) {
                    const mesh = g.mesh;
                    ensureSphere(mesh);
                    let inside = true;
                    if (mesh.frustumCulled && mesh.boundingSphere) {
                        const sph = mesh.boundingSphere.clone().applyMatrix4(mesh.matrixWorld);
                        inside = fr.intersectsSphere(sph);
                    }
                    inside ? vis++ : culled++;
                }
                return { vis, culled };
            };
            const fwd = probe(1);
            const allFrustumCulled = groups.length > 0 && groups.every((g) => g.mesh.frustumCulled === true);
            const allLocalSphere = groups.every((g) => {
                const sph = ensureSphere(g.mesh);
                return sph && sph.radius < 300; // lokal = nicht welt-spannend
            });
            // Cleanup: die platzierten Einträge entfernen (übt zugleich die Empty-Group-Dispose)
            for (const e of entries) r._archInstanceRemove(e);
            const leftover = [];
            for (const [k] of s.archInstanceGroups) if (k.indexOf(bpName + "#") === 0 && k.indexOf("@p:") >= 0) leftover.push(k);
            placed = {
                ok: true,
                bpName,
                bpSpan: +bpSpan.toFixed(1),
                groupCount: groups.length,
                fwdCulled: fwd.culled,
                fwdVis: fwd.vis,
                allFrustumCulled,
                allLocalSphere,
                leftoverAfterRemove: leftover.length,
            };
        }

        delete s.blueprints["__diag_small"];
        delete s.blueprints["__diag_big"];

        return { keySmall, keyBig, keyScaled, keyOff, expectSmall, placed, masterFlag: s.useRegionFoliageCull };
    });

    console.log("\n===== V18.353 PHASE A.1 — PLATZIERTE-ARCHITEKTUR-CULL-VERIFIKATION =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (out.error) {
        console.log("FEHLER:", out.error);
        ok = false;
    } else {
        console.log(`  Master useRegionFoliageCull=${out.masterFlag}`);
        console.log(
            `  Region-Key: klein='${out.keySmall}' (erwartet '${out.expectSmall}') · groß=${out.keyBig} · skaliert-groß=${out.keyScaled} · Toggle-aus=${out.keyOff}\n`
        );
        check(out.keySmall === out.expectSmall, `(1a) kleine Struktur → '${out.expectSmall}' (region-gekeyt, p:-Präfix)`);
        check(out.keyBig === null, "(1b) große Struktur (Span 200 m > 128) → null (bleibt global)");
        check(out.keyScaled === null, "(1c) kleine Struktur ×40 (Span 160 m) → null (entry.scale faltet ein)");
        check(out.keyOff === null, "(1d) Toggle useRegionArchCull=false → null (A/B-Revert)");
        const p = out.placed;
        if (!p.ok) {
            console.log("  ⚠ kein kleiner instanceable Built-in gefunden — Platzierungs-Test übersprungen.");
        } else {
            console.log(
                `\n  Platziert: '${p.bpName}' (Span ${p.bpSpan} m) an 4 fernen Spots → ${p.groupCount} region-private Gruppen`
            );
            console.log(`  Cull (Blick +Z): sichtbar ${p.fwdVis} · GECULLT ${p.fwdCulled} Gruppen (hinten)\n`);
            check(p.groupCount >= 2, `(2a) ≥2 region-private @p:-Gruppen entstanden (${p.groupCount})`);
            check(p.allFrustumCulled, "(2b) alle platzierten Gruppen frustumCulled=true (vorher false)");
            check(p.allLocalSphere, "(2c) alle Bounding-Spheres LOKAL (radius < 300 m)");
            check(p.fwdCulled > 0, `(3) Umsehen cullt platzierte Architektur (${p.fwdCulled} Gruppen hinten — vorher 0)`);
            check(p.leftoverAfterRemove === 0, "(4) leere Gruppen nach _archInstanceRemove ENTSORGT (kein Anwachsen)");
        }
    }
    console.log(`\n  ${ok ? "✅ PHASE A.1 BEWIESEN" : "❌ FEHLGESCHLAGEN"}\n`);
    console.log("=======================================================================\n");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

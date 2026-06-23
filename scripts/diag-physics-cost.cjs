// P0 — DIE PHYSIK-KOSTEN-LINSE (Determinismus-Bogen, docs/archiv/eigene-physik-plan.md §8/§10).
// Die VORHER-Zahl, gegen die der ganze Ammo-raus/feld-nativ-Bogen misst — und der erste
// Beweis VOR jeder Zeile Produktions-Code, dass ein Feld-Sample billiger ist als der
// btBvhTriangleMeshShape-Build. Vier Messungen, alle CPU/WASM (kein GPU → headless treu,
// hardware-UNABHÄNGIG im Sinn der heiligen Lektion: ein synchroner Block kostet auf jeder
// Maschine, der Container-Throttle ändert nur die absolute Sekundenzahl):
//   (1) der sync BVH-Build (_buildVoxelChunkBVH) — ms/Chunk + Dreiecke (der Lauf-Freeze).
//   (2) stepSimulation — ms/Schritt bei der echten Body-Zahl (die laufende Ammo-Last).
//   (3) der WASM-Heap + die Body/Shape-Zählung (was Ammo HÄLT).
//   (4) die Feld-Sample-Kosten (_terrainDensityAt / Gradient / _voxelSurfaceY) + die
//       PROJEKTION feld-native-Kollision/Frame gegen (1)+(2).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4361,
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
        protocolTimeout: 300000,
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
    page.setDefaultTimeout(280000);
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // PUMPENDER Warmup (headless rAF ~1 Hz → den Loop selbst treiben), render-gestubbt.
    // Worker NULL → die Ring-Chunks bauen SYNC im Tick (bit-identisch via Determinismus-
    // Wand, load-unabhängig) → eine warme Welt mit echten Chunk-Meshes + BVH + Bodies.
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
                if (r.state.voxelWorker) {
                    try {
                        r.state.voxelWorker.terminate();
                    } catch (_e) {}
                    r.state.voxelWorker = null;
                }
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
        if (!r._gameLoopTick) return { error: "no _gameLoopTick" };
        const A = window.Ammo;
        const now = () => performance.now();
        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z,
            py = s.playerMesh.position.y;

        // ===== (3) WAS AMMO HÄLT — Heap + Body/Shape-Zählung (clean, vor Test-Builds) =====
        let wasmHeapBytes = -1;
        try {
            wasmHeapBytes = A && A.HEAPU8 ? A.HEAPU8.buffer.byteLength : -1;
        } catch (_e) {}
        let chunksWithBVH = 0,
            chunkMeshes = [];
        if (s.voxelChunks) {
            for (const e of s.voxelChunks.values()) {
                if (e && e.mesh && e.mesh.userData && e.mesh.userData.collision) chunksWithBVH++;
                if (e && e.mesh && e.mesh.geometry) chunkMeshes.push(e.mesh);
            }
        }
        let archWithCollision = 0;
        for (const e of s.architectures || []) if (e && e.collision) archWithCollision++;
        let ammoBodies = -1;
        try {
            ammoBodies = s.physicsWorld ? s.physicsWorld.getNumCollisionObjects() : -1;
        } catch (_e) {}
        const counts = {
            ammoCollisionObjects: ammoBodies,
            rigidBodies: (s.rigidBodies || []).length,
            voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
            chunksWithBVH,
            architectures: (s.architectures || []).length,
            archWithCollision,
            creatures: (s.creatures || []).length,
            wasmHeapMB: wasmHeapBytes > 0 ? +(wasmHeapBytes / 1048576).toFixed(1) : -1,
        };

        // ===== (4a) FELD-SAMPLE-KOSTEN — die kanonische Quelle direkt =====
        // _terrainDensityAt ist, was _fieldSolid aufruft (liest Edits mit). Über echte
        // Welt-Koords nahe dem Spieler, y über/um die Oberfläche (der Kollisions-Bereich).
        const fieldBench = (label, fn, N) => {
            // warmup (JIT)
            for (let i = 0; i < 2000; i++) fn(i);
            const t0 = now();
            let acc = 0;
            for (let i = 0; i < N; i++) acc += fn(i) ? 1 : 0;
            const dt = now() - t0;
            return { calls: N, totalMs: +dt.toFixed(2), nsPerCall: +((dt * 1e6) / N).toFixed(1), _sink: acc };
        };
        const RANGE = 60;
        const dens = fieldBench(
            "terrainDensityAt",
            (i) => {
                const x = px + (((i * 73) % (RANGE * 2)) - RANGE);
                const z = pz + (((i * 131) % (RANGE * 2)) - RANGE);
                const y = py + (((i * 17) % 40) - 20);
                return r._terrainDensityAt(x, y, z) > 0;
            },
            200000
        );
        // Ein Kollisions-Gradient = 6 Dichte-Samples (Zentral-Differenzen) → die Normale.
        const grad = fieldBench(
            "fieldGradient(6 samples)",
            (i) => {
                const x = px + (((i * 73) % (RANGE * 2)) - RANGE);
                const z = pz + (((i * 131) % (RANGE * 2)) - RANGE);
                const y = py + (((i * 17) % 40) - 20);
                const e = 0.5;
                const gx = r._terrainDensityAt(x + e, y, z) - r._terrainDensityAt(x - e, y, z);
                const gy = r._terrainDensityAt(x, y + e, z) - r._terrainDensityAt(x, y - e, z);
                const gz = r._terrainDensityAt(x, y, z + e) - r._terrainDensityAt(x, y, z - e);
                return gx + gy + gz !== 0;
            },
            40000
        );
        // _voxelSurfaceY = die Boden-Probe heute (Spalten-Scan mit Envelope-Skip).
        const surf = fieldBench(
            "voxelSurfaceY",
            (i) => {
                const x = px + (((i * 73) % (RANGE * 2)) - RANGE);
                const z = pz + (((i * 131) % (RANGE * 2)) - RANGE);
                const v = r._voxelSurfaceY(x, z);
                return Number.isFinite(v);
            },
            20000
        );

        // ===== (2) stepSimulation — die laufende Ammo-Last (clean world) =====
        const stepMs = [];
        if (s.physicsWorld) {
            for (let i = 0; i < 30; i++) s.physicsWorld.stepSimulation(1 / 60, 5, 1 / 60); // warmup
            for (let i = 0; i < 120; i++) {
                const t0 = now();
                s.physicsWorld.stepSimulation(1 / 60, 5, 1 / 60);
                stepMs.push(now() - t0);
            }
        }
        stepMs.sort((a, b) => a - b);
        const stepStat = stepMs.length
            ? {
                  samples: stepMs.length,
                  p50: +stepMs[Math.floor(stepMs.length * 0.5)].toFixed(4),
                  p90: +stepMs[Math.floor(stepMs.length * 0.9)].toFixed(4),
                  max: +stepMs[stepMs.length - 1].toFixed(4),
                  avg: +(stepMs.reduce((a, b) => a + b, 0) / stepMs.length).toFixed(4),
              }
            : null;

        // ===== (1) der sync BVH-Build — ms/Chunk + Dreiecke (LETZTE Messung, baut+disposed
        // Test-Bodies sauber: alten Pointer sichern, bauen+timen, neuen disposen, restaurieren) =====
        const bvhMs = [],
            triCounts = [];
        const sample = chunkMeshes.slice(0, 12);
        for (const mesh of sample) {
            const geo = mesh.geometry;
            const tris = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
            const prev = mesh.userData.collision;
            mesh.userData.collision = null; // dispose darf prev NICHT anfassen
            const t0 = now();
            r._buildVoxelChunkBVH(mesh);
            const dt = now() - t0;
            bvhMs.push(dt);
            triCounts.push(tris);
            try {
                r._disposeStaticCollision(mesh); // den frisch gebauten Test-Body sauber räumen
            } catch (_e) {}
            mesh.userData.collision = prev; // den echten Pointer restaurieren
        }
        bvhMs.sort((a, b) => a - b);
        const bvhStat = bvhMs.length
            ? {
                  samples: bvhMs.length,
                  p50: +bvhMs[Math.floor(bvhMs.length * 0.5)].toFixed(2),
                  max: +bvhMs[bvhMs.length - 1].toFixed(2),
                  avg: +(bvhMs.reduce((a, b) => a + b, 0) / bvhMs.length).toFixed(2),
                  avgTris: Math.round(triCounts.reduce((a, b) => a + b, 0) / triCounts.length),
              }
            : null;

        // ===== (4b) DIE PROJEKTION — feld-native Kollision/Frame gegen (1)+(2) =====
        // typisch (kein Penetration, freier Fall/Stand): pro Kapsel-Kugel 1 Solid-Test +
        //   eine Boden-Probe. ~3 Kugeln + 1 Boden ≈ 4 Dichte-Samples + 1 surfaceY.
        // worst (volle Penetration, collide-and-slide 3 Iterationen): 3 Kugeln × 3 Iter ×
        //   (1 Solid + 6 Gradient) = 63 Dichte-Samples + Boden.
        const nsDens = dens.nsPerCall,
            nsSurf = surf.nsPerCall;
        const perEntityTypicalMs = (4 * nsDens + 1 * nsSurf) / 1e6;
        const perEntityWorstMs = (63 * nsDens + 1 * nsSurf) / 1e6;
        const nEntities = 1 + (s.creatures || []).length; // Spieler + Kreaturen
        const projection = {
            nEntities,
            perEntityTypicalMs: +perEntityTypicalMs.toFixed(4),
            perEntityWorstMs: +perEntityWorstMs.toFixed(4),
            allEntitiesTypicalMs: +(perEntityTypicalMs * nEntities).toFixed(3),
            allEntitiesWorstMs: +(perEntityWorstMs * nEntities).toFixed(3),
        };

        return {
            counts,
            field: { density: dens, gradient: grad, surfaceY: surf },
            stepSimulation: stepStat,
            bvhBuild: bvhStat,
            projection,
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    const c = out.counts;
    console.log("\n===== PHYSIK-KOSTEN-LINSE P0 (Determinismus-Bogen, VORHER-Zahl) =====\n");
    console.log("  WAS AMMO HEUTE HÄLT:");
    console.log(`    Ammo collision-objects:  ${c.ammoCollisionObjects}`);
    console.log(`    rigidBodies (dynamisch): ${c.rigidBodies}  (Spieler + Kreaturen)`);
    console.log(`    voxelChunks / mit BVH:   ${c.voxelChunks} / ${c.chunksWithBVH}`);
    console.log(`    architectures / mit Koll:${c.architectures} / ${c.archWithCollision}`);
    console.log(`    Kreaturen:               ${c.creatures}`);
    console.log(`    WASM-Heap (reserviert):  ${c.wasmHeapMB} MB`);
    if (out.bvhBuild) {
        const b = out.bvhBuild;
        console.log("\n  (1) sync BVH-BUILD (_buildVoxelChunkBVH) — der Lauf-Freeze:");
        console.log(`    Ø ${b.avg} ms/Chunk · p50 ${b.p50} · MAX ${b.max} ms  (Ø ${b.avgTris} Dreiecke, n=${b.samples})`);
    }
    if (out.stepSimulation) {
        const st = out.stepSimulation;
        console.log("\n  (2) stepSimulation — die laufende Ammo-Last:");
        console.log(`    Ø ${st.avg} ms · p50 ${st.p50} · p90 ${st.p90} · MAX ${st.max} ms  (n=${st.samples})`);
    }
    const f = out.field;
    console.log("\n  (4a) FELD-SAMPLE-KOSTEN (die kanonische Quelle):");
    console.log(`    _terrainDensityAt:       ${f.density.nsPerCall} ns/call  (${f.density.calls} calls, ${f.density.totalMs} ms)`);
    console.log(`    fieldGradient (6×):      ${f.gradient.nsPerCall} ns/call`);
    console.log(`    _voxelSurfaceY (Boden):  ${f.surfaceY.nsPerCall} ns/call`);
    const p = out.projection;
    console.log("\n  (4b) PROJEKTION — feld-native Kollision/Frame:");
    console.log(`    pro Entität: typisch ${p.perEntityTypicalMs} ms · worst ${p.perEntityWorstMs} ms`);
    console.log(`    alle ${p.nEntities} (Spieler+Kreaturen): typisch ${p.allEntitiesTypicalMs} ms · worst ${p.allEntitiesWorstMs} ms/Frame`);
    console.log("\n  DAS URTEIL:");
    if (out.bvhBuild && out.stepSimulation) {
        console.log(`    • Der BVH-Build (${out.bvhBuild.avg} ms/Chunk, MAX ${out.bvhBuild.max}) ENTFÄLLT ganz (kein Build feld-nativ).`);
        console.log(`    • stepSimulation (${out.stepSimulation.avg} ms/Frame) → ~${p.allEntitiesTypicalMs} ms typisch feld-nativ.`);
        console.log(`    • + der 256-MB-WASM-Heap + ${c.chunksWithBVH} BVH-Bäume fallen weg.`);
    }
    console.log("\n====================================================================\n");
    try {
        if (!fs.existsSync(path.join(root, "artifacts"))) fs.mkdirSync(path.join(root, "artifacts"));
        fs.writeFileSync(path.join(root, "artifacts", "diag-physics-cost.json"), JSON.stringify(out, null, 2));
        console.log("→ artifacts/diag-physics-cost.json");
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-physics-cost.json", JSON.stringify(out, null, 2));
            console.log("→ /tmp/diag-physics-cost.json");
        } catch (_e2) {}
    }
    await browser.close();
    server.close();
    process.exit(0);
})();

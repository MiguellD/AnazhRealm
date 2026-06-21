// V18.317 — Diag: DIE ARRAYBUFFER-VOLKSZÄHLUNG (Schöpfer-Heap-Snapshot: ~19.558 ArrayBuffer /
// ~322 MB / 65% des Heaps in ~9.547 gepaarten Objekten; FPS 13–34). Das Heap-Profil zählt JEDEN
// ArrayBuffer (Szene-Geometrie CPU-Spiegel + State-Caches), nicht nur Dreiecke. Diese Diag
// zählt distinct Geometrien + ihre Float32/Uint-Attribut-Buffer NACH KATEGORIE (Szene-Graph)
// UND in den State-Caches (voxelChunks-Entry-Arrays, voxelMeshCache, skinGeomCache, scatter).
// Ziel: WAS ist 9.547× allokiert + ist es gedeckelt (steady) oder wächst es (Leck)?
// MISS zuerst, dann heile (V18.260-Disziplin). Headless baut die volle JS-Geometrie (gate-treu).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4362,
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

    // Warmup: render-gestubbt pumpen bis die Welt steht (wie diag-render-load).
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

    const census = () =>
        page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state;
            const scene = s.scene;
            if (!scene) return { error: "no scene" };
            // ---- Szene-Graph-Geometrien (CPU-Spiegel der Attribut-Buffer) ----
            const seen = new Set(); // distinct BufferGeometry-Identitäten
            const cat = (node) => {
                const u = node.userData || {};
                if (u.voxelChunkX != null || u.isVoxelChunk) return "terrain";
                if (u._creatureSkin || u._creatureFace) return "creature";
                if (s.playerMesh && (node === s.playerMesh || node.parent === s.playerMesh)) return "avatar";
                const nm = (node.name || "") + " " + ((node.material && node.material.name) || "");
                if (/grass|gras/i.test(nm)) return "grass";
                if (/water|wasser|iso/i.test(nm)) return "water";
                if (/star|sky|himmel|planet|mantle|horizon/i.test(nm)) return "sky";
                if (u.archInstanceKey) return "hism";
                if (u.useFlexAttr || u.foliageLeaf || /laub|foliage|leaf|blatt/i.test(nm)) return "foliage";
                if (node.isInstancedMesh) return "scatter";
                return "other";
            };
            const acc = {}; // cat → {geoms, bufs, bytes, meshes, instMeshes}
            const bump = (c) => {
                if (!acc[c]) acc[c] = { geoms: 0, bufs: 0, bytes: 0, meshes: 0, instMeshes: 0, instRows: 0 };
                return acc[c];
            };
            const bytesOfAttr = (a) => {
                if (!a || !a.array || a.array.byteLength == null) return 0;
                return a.array.byteLength;
            };
            const countGeom = (geo, a) => {
                if (!geo || seen.has(geo)) return;
                seen.add(geo);
                a.geoms++;
                const at = geo.attributes || {};
                for (const k in at) {
                    if (at[k] && at[k].array) {
                        a.bufs++;
                        a.bytes += bytesOfAttr(at[k]);
                    }
                }
                if (geo.index && geo.index.array) {
                    a.bufs++;
                    a.bytes += geo.index.array.byteLength || 0;
                }
            };
            let totalMeshes = 0,
                totalInst = 0;
            scene.traverse((node) => {
                if (!node.isMesh && !node.isInstancedMesh) return;
                const c = cat(node);
                const a = bump(c);
                totalMeshes++;
                if (node.isInstancedMesh) {
                    a.instMeshes++;
                    totalInst++;
                    a.instRows += node.count || 0;
                    // instanceMatrix + instanceColor sind eigene Buffer (NICHT Geometrie)
                    if (node.instanceMatrix && node.instanceMatrix.array) {
                        a.bufs++;
                        a.bytes += node.instanceMatrix.array.byteLength || 0;
                    }
                    if (node.instanceColor && node.instanceColor.array) {
                        a.bufs++;
                        a.bytes += node.instanceColor.array.byteLength || 0;
                    }
                } else {
                    a.meshes++;
                }
                countGeom(node.geometry, a);
            });
            // ---- State-Caches (außerhalb des Szene-Graphs, vom Heap-Snapshot mitgezählt) ----
            const caches = {};
            const arrBytes = (o) => {
                let b = 0,
                    n = 0;
                if (!o) return { b, n };
                for (const k in o) {
                    const v = o[k];
                    if (v && v.byteLength != null && (v.BYTES_PER_ELEMENT || v instanceof ArrayBuffer)) {
                        b += v.byteLength;
                        n++;
                    }
                }
                return { b, n };
            };
            // voxelChunks: jedes Entry kann density/surfMap/waterCells/positions/normals... tragen
            if (s.voxelChunks) {
                let bytes = 0,
                    bufs = 0;
                for (const [, entry] of s.voxelChunks) {
                    const rb = arrBytes(entry);
                    bytes += rb.b;
                    bufs += rb.n;
                    // verschachtelte gridSurfaceMap etc.
                    if (entry && entry.surfMap) {
                        const r2 = arrBytes(entry.surfMap);
                        bytes += r2.b;
                        bufs += r2.n;
                    }
                }
                caches.voxelChunks = { size: s.voxelChunks.size, bufs, bytes };
            }
            if (s.voxelMeshCache) {
                let bytes = 0,
                    bufs = 0;
                for (const [, m] of s.voxelMeshCache) {
                    const rb = arrBytes(m);
                    bytes += rb.b;
                    bufs += rb.n;
                }
                caches.voxelMeshCache = { size: s.voxelMeshCache.size, bufs, bytes };
            }
            if (s._skinGeomCache) {
                caches._skinGeomCache = { size: s._skinGeomCache.size || (s._skinGeomCache.map ? s._skinGeomCache.map.size : 0) };
            }
            const counts = {
                voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
                voxelMeshCache: s.voxelMeshCache ? s.voxelMeshCache.size : 0,
                architectures: s.architectures ? s.architectures.length : 0,
                archInstanceGroups: s.archInstanceGroups ? s.archInstanceGroups.size : 0,
                scatterRegions: s.scatterRegions ? s.scatterRegions.size : 0,
                creatures: s.creatures ? s.creatures.length : 0,
                rigidBodies: s.rigidBodies ? s.rigidBodies.length : 0,
                sceneChildren: scene.children ? scene.children.length : 0,
            };
            // Heap (falls verfügbar)
            const heap = performance.memory
                ? { used: Math.round(performance.memory.usedJSHeapSize / 1048576), total: Math.round(performance.memory.totalJSHeapSize / 1048576) }
                : null;
            let totGeoms = 0,
                totBufs = 0,
                totBytes = 0;
            for (const c in acc) {
                totGeoms += acc[c].geoms;
                totBufs += acc[c].bufs;
                totBytes += acc[c].bytes;
            }
            return { byCat: acc, caches, counts, heap, totals: { geoms: totGeoms, bufs: totBufs, bytes: totBytes, meshes: totalMeshes, instMeshes: totalInst } };
        });

    const fmtMB = (b) => (b / 1048576).toFixed(1) + " MB";
    const out1 = await census();
    if (out1.error) {
        console.log("FEHLER:", out1.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    const print = (out, label) => {
        console.log(`\n===== ARRAYBUFFER-VOLKSZÄHLUNG (${label}) =====\n`);
        if (out.heap) console.log(`  Heap: used ${out.heap.used} MB / total ${out.heap.total} MB`);
        console.log("  Welt: " + JSON.stringify(out.counts));
        console.log("\n  SZENE-GEOMETRIE je Kategorie (distinct Geometrien | Attribut-Buffer | Bytes | Meshes | InstMeshes/Rows):");
        const rows = Object.entries(out.byCat).sort((a, b) => b[1].bufs - a[1].bufs);
        for (const [c, v] of rows) {
            console.log(
                "    " +
                    c.padEnd(10) +
                    " geoms " +
                    String(v.geoms).padStart(6) +
                    " | bufs " +
                    String(v.bufs).padStart(6) +
                    " | " +
                    fmtMB(v.bytes).padStart(9) +
                    " | mesh " +
                    String(v.meshes).padStart(5) +
                    " | inst " +
                    v.instMeshes +
                    "/" +
                    v.instRows
            );
        }
        const t = out.totals;
        console.log(
            "\n  SZENE-TOTAL: " +
                t.geoms +
                " distinct Geometrien · " +
                t.bufs +
                " Attribut-Buffer · " +
                fmtMB(t.bytes) +
                " · " +
                t.meshes +
                " Meshes (" +
                t.instMeshes +
                " instanced)"
        );
        console.log("\n  STATE-CACHES (außerhalb Szene-Graph, vom Heap-Snapshot mitgezählt):");
        for (const [k, v] of Object.entries(out.caches)) {
            console.log("    " + k.padEnd(16) + " " + JSON.stringify(v));
        }
    };
    print(out1, "settled");

    // ---- LECK-TEST: Spieler FIX, autonome Systeme laufen, 600 Ticks → wächst die Buffer-Zahl? ----
    await page.evaluate(async () => {
        const r = window.anazhRealm;
        for (let i = 0; i < 600; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (i % 6 === 0) await new Promise((res) => setTimeout(res, 1));
        }
    });
    const out2 = await census();
    print(out2, "nach 600 Ticks (Spieler fix)");

    const dGeoms = out2.totals.geoms - out1.totals.geoms;
    const dBufs = out2.totals.bufs - out1.totals.bufs;
    const dBytes = out2.totals.bytes - out1.totals.bytes;
    console.log("\n  ===== LECK-VERDIKT (Spieler FIX, 600 Ticks) =====");
    console.log(
        "  Δ Szene-Geometrien " +
            (dGeoms >= 0 ? "+" : "") +
            dGeoms +
            " · Δ Buffer " +
            (dBufs >= 0 ? "+" : "") +
            dBufs +
            " · Δ Bytes " +
            (dBytes >= 0 ? "+" : "") +
            fmtMB(dBytes)
    );
    console.log(
        "  → " +
            (Math.abs(dBufs) < 50
                ? "STEADY (Buffer-Zahl plateaut → das 322-MB-Heap ist die geladene Welt, kein Leck)"
                : dBufs > 0
                  ? "WÄCHST (mögliches Leck — die Buffer-Zahl steigt bei fixem Spieler)"
                  : "SCHRUMPFT (Pruning greift)")
    );
    console.log("\n===========================================\n");
    try {
        fs.writeFileSync(path.join(root, "artifacts", "diag-buffer-census.json"), JSON.stringify({ settled: out1, after: out2 }, null, 2));
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-buffer-census.json", JSON.stringify({ settled: out1, after: out2 }, null, 2));
        } catch (_e2) {}
    }
    await browser.close();
    server.close();
    process.exit(0);
})();

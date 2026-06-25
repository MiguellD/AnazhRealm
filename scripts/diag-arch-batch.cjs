// V18.353 PHASE A.2 — REGION-BATCHEDMESH-KOLLAPS: beweist hardware-unabhängig, dass der
// Batch-Pfad (useBatchedArch) die N region-InstancedMeshes EINER Region in ~1 BatchedMesh
// pro Material kollabiert (= weniger Draw-Call-Produzenten), OHNE Instanzen zu verlieren
// (Parität) und OHNE Speicher-Leck (Region-Batches werden bei Region-Dispose entsorgt).
// Der echte Draw-Call-/FPS-Gewinn ist GPU-gebunden (Schöpfer-Browser); die KOLLAPS-RATIO,
// die Parität + das no-leak sind die hardware-unabhängigen Proxys. Vergleich apples-to-apples:
// DIESELBEN 5×5-Regionen einmal im InstancedMesh-Pfad, einmal im Batch-Pfad re-gestreut.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4412,
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
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
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
        // ein paar ruhige Frames für den Scatter
        for (let i = 0; i < 200; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (_e) {}
        }
    });

    const out = await page.evaluate(() => {
        const r = window.anazhRealm,
            s = r.state;
        const scene = s.scene;
        if (!scene || !s.playerMesh) return { error: "no scene/player" };

        // Scatter-Region-Gruppen = Key trägt '@' aber NICHT '@p:' (letzteres ist die
        // PLATZIERTE Architektur aus A.1 — ein Warmup-Artefakt, kein Scatter; getrennt halten).
        const isScatterKey = (k) => typeof k === "string" && k.indexOf("@") >= 0 && k.indexOf("@p:") < 0;
        const countScene = () => {
            let instGroups = 0,
                instInstances = 0,
                batchMeshes = 0,
                regionBatchMeshes = 0;
            scene.traverse((o) => {
                const ud = o.userData || {};
                if (o.isInstancedMesh && isScatterKey(ud.archInstanceKey)) {
                    instGroups++;
                    instInstances += o.count || 0;
                }
                if (o.isBatchedMesh && typeof ud.archBatchKey === "string") {
                    batchMeshes++;
                    if (isScatterKey(ud.archBatchKey)) regionBatchMeshes++;
                }
            });
            return { instGroups, instInstances, batchMeshes, regionBatchMeshes };
        };
        const disposeAllRegions = () => {
            if (!s.scatterRegions) return;
            for (const key of [...s.scatterRegions.keys()]) r._disposeScatterRegion(key);
        };
        const reScatter = () => {
            const pr = s.playerMesh.position;
            const R = r.constructor.ARCH_REGION_M || 256;
            const prx = Math.floor(pr.x / R),
                prz = Math.floor(pr.z / R);
            let totalInst = 0;
            for (let dz = -2; dz <= 2; dz++)
                for (let dx = -2; dx <= 2; dx++) {
                    const reg = r._scatterRegion(prx + dx, prz + dz, pr);
                    if (reg) totalInst += reg.instanceCount || 0;
                }
            return totalInst;
        };

        // ---- INSTANCED-MESH-PFAD (Default) ----
        s.useBatchedArch = false;
        disposeAllRegions();
        const instTotalInst = reScatter();
        const instM = countScene();

        // ---- BATCH-PFAD (dieselben Regionen) ----
        disposeAllRegions();
        s.useBatchedArch = true;
        const batchTotalInst = reScatter();
        const batchM = countScene();
        // V18.356 — NUR die SCATTER-Batches zählen (@regX,regZ, nicht @p:): mit useBatchedArch
        // default-an trägt die Warmup-Welt schon LIVE platzierte Batches (@p:) — die sind legitim
        // (lebende Strukturen), kein Leck. Der No-Leak-Test prüft, dass die SCATTER-Batches gehen.
        const scatterBatchCount = () =>
            s.archBatches ? [...s.archBatches.values()].filter((b) => isScatterKey(b.batchKey)).length : 0;
        const batchesAfter = scatterBatchCount();

        // ---- NO-LEAK: alle Regionen entsorgen → die SCATTER-Batches müssen weg ----
        disposeAllRegions();
        const batchM2 = countScene();
        const batchesAfterDispose = scatterBatchCount();

        // restore default + die Welt sauber neu streamen lassen
        s.useBatchedArch = false;

        return {
            inst: { groups: instM.instGroups, instances: instM.instInstances, totalScattered: instTotalInst },
            batch: {
                regionMeshes: batchM.regionBatchMeshes,
                allMeshes: batchM.batchMeshes,
                leftoverInstGroups: batchM.instGroups,
                instances: batchM.instInstances,
                totalScattered: batchTotalInst,
                archBatches: batchesAfter,
            },
            noleak: {
                batchMeshesAfterDispose: batchM2.batchMeshes,
                regionBatchMeshesAfterDispose: batchM2.regionBatchMeshes,
                archBatchesAfterDispose: batchesAfterDispose,
            },
        };
    });

    console.log("\n===== V18.353 PHASE A.2 — REGION-BATCHEDMESH-KOLLAPS-VERIFIKATION =====\n");
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (out.error) {
        console.log("FEHLER:", out.error);
        ok = false;
    } else {
        const ratio = out.batch.regionMeshes > 0 ? (out.inst.groups / out.batch.regionMeshes).toFixed(2) : "—";
        console.log(
            `  InstancedMesh-Pfad: ${out.inst.groups} region-Gruppen · ${out.inst.totalScattered} Instanzen gestreut`
        );
        console.log(
            `  Batch-Pfad:         ${out.batch.regionMeshes} region-Batches (${out.batch.allMeshes} gesamt) · ${out.batch.totalScattered} Instanzen gestreut`
        );
        console.log(`  KOLLAPS-RATIO: ${ratio}× weniger Draw-Call-Produzenten · archBatches=${out.batch.archBatches}\n`);
        check(out.inst.groups > 0, `(0) InstancedMesh-Pfad baut region-Gruppen (${out.inst.groups})`);
        check(out.batch.regionMeshes > 0, `(1) Batch-Pfad baut region-Batches (${out.batch.regionMeshes})`);
        check(
            out.batch.regionMeshes < out.inst.groups,
            `(2) KOLLAPS: ${out.batch.regionMeshes} Batches < ${out.inst.groups} InstancedMeshes (${ratio}×)`
        );
        check(
            out.batch.totalScattered === out.inst.totalScattered && out.inst.totalScattered > 0,
            `(3) PARITÄT: gleiche Instanz-Zahl gestreut (${out.inst.totalScattered} = ${out.batch.totalScattered}, kein Verlust)`
        );
        check(out.batch.leftoverInstGroups === 0, "(4) im Batch-Modus KEINE region-InstancedMeshes (alles im Batch)");
        check(
            out.noleak.regionBatchMeshesAfterDispose === 0 && out.noleak.archBatchesAfterDispose === 0,
            `(5) NO-LEAK: nach Region-Dispose sind alle Region-Batches weg (Mesh ${out.noleak.regionBatchMeshesAfterDispose} · archBatches ${out.noleak.archBatchesAfterDispose})`
        );
        check(!pageErr, "(6) KEIN Page-Error während Toggle/Re-Scatter/Dispose (no-crash)");
    }
    console.log(`\n  ${ok ? "✅ PHASE A.2 BEWIESEN" : "❌ FEHLGESCHLAGEN"}\n`);
    console.log("=====================================================================\n");
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

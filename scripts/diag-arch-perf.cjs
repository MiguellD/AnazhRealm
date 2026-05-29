// Diagnose V12.0-perf.c — Architektur-Teilsystem-FPS (der Entdeck-Sturm).
// Misst die VORHER-Zahl des Architektur-Instancing-Bogens:
//   - Draw-Calls (renderer.info) der ganzen Szene
//   - Sub-Mesh-Zahl der Architekturen (≈ Draw-Calls ohne Instancing)
//   - Ammo-Body-Zahl (Eager-Collision-Last)
//   - Culling-Build-Burst: wie teuer ist EIN tickArchitectureCulling, wenn
//     ein dichter Cluster auf einmal in Reichweite kommt (Wurzel B)
//   - Parts pro Bauplan-Typ (Instancing-Gruppen-Sizing)
// Headless misst die GPU-FPS nicht (swiftshader); der Sub-Mesh/Draw-Call-
// Count + Burst-ms sind die renderer-unabhängigen Vorher-Zahlen.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 4319;
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
    const filePath = path.join(root, p);
    if (!filePath.startsWith(root)) {
        res.statusCode = 403;
        return res.end();
    }
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(filePath)] || "application/octet-stream");
        res.end(data);
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
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => console.log("[PAGE-ERROR]", (err.stack || err.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Welt + Avatar + Voxel-Chunks pumpen (Vegetation spawnt cold dabei).
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 25000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* listener */
                }
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 8) break;
            }
            await new Promise((resolve) => setTimeout(resolve, 16));
        }
        // Vegetations-Spawn-Queue leerlaufen lassen (V9.96 FIFO, 4/Frame).
        const r = window.anazhRealm;
        for (let i = 0; i < 200; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            await new Promise((resolve) => setTimeout(resolve, 4));
        }
    });
    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const pp = r.state.playerMesh.position;
        const renderer = r.state.renderer;
        const countSubMeshes = (entries) => {
            let hot = 0,
                sub = 0,
                bodies = 0;
            for (const e of entries) {
                if (e.mesh) {
                    hot++;
                    e.mesh.traverse((n) => {
                        if (n.isMesh) sub++;
                    });
                }
                if (e.collision && e.collision.body) bodies++;
            }
            return { hot, sub, bodies };
        };
        const drawInfo = () => {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            if (renderer && renderer.info && renderer.info.render) {
                return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles };
            }
            return { calls: null, tris: null };
        };

        // --- Natürliche (gestreamte) Architekturen ---
        out.archTotal = r.state.architectures.length;
        out.natural = countSubMeshes(r.state.architectures);
        out.baseline = drawInfo();
        out.cullingRadius = r.state.architectureCullingRadius;

        // --- Parts pro Bauplan-Typ (Instancing-Gruppen-Sizing) ---
        const builders = typeof r._architectureBuilders === "function" ? r._architectureBuilders() : {};
        out.partsPerType = {};
        for (const name of Object.keys(builders)) {
            const bp = r.state.blueprints && r.state.blueprints[name];
            out.partsPerType[name] = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
        }

        // --- Deterministischer dichter Cluster: 60 Vegetations-Strukturen
        //     um den Spieler, COLD gespawnt (cullingRadius=0 → kein Mesh-Bau
        //     beim Spawn), reproduzierbar unabhängig vom Worldgen-Würfel. ---
        const origRadius = r.state.architectureCullingRadius;
        r.state.architectureCullingRadius = 0; // Spawns bleiben cold
        const CLUSTER_N = 60;
        const TYPES = ["baum_kiefer", "kristall_geode", "felsbogen", "felsturm", "glutbrunnen"].filter(
            (t) => builders[t]
        );
        const clusterTypes = new Set();
        const clusterIds = [];
        let spawned = 0;
        for (let i = 0; i < CLUSTER_N; i++) {
            const ang = (i / CLUSTER_N) * Math.PI * 2 * 5;
            const rad = 8 + (i % 7) * 12;
            const x = pp.x + Math.cos(ang) * rad;
            const z = pp.z + Math.sin(ang) * rad;
            const t = TYPES[i % TYPES.length];
            try {
                const e = r.spawnArchitecture(t, { x, y: pp.y, z }, { seed: 5000 + i, silent: true });
                if (e) {
                    clusterTypes.add(t);
                    clusterIds.push(e.id);
                    spawned++;
                }
            } catch (_e) {
                /* skip */
            }
        }
        out.clusterSpawned = spawned;
        out.clusterTypes = [...clusterTypes];

        // --- Culling-Build-Burst (Wurzel B): die COLD Cluster-Einträge in
        //     EINEM tickArchitectureCulling bauen. Radius nur knapp über den
        //     Cluster (90 m) → baut den Cluster + wenige nahe Naturals,
        //     nicht hunderte ferne. Das ist exakt der Sturm beim Eintritt
        //     in eine dichte Region. ---
        const idSet = new Set(clusterIds);
        const coldBefore = r.state.architectures.filter((e) => idSet.has(e.id) && !e.mesh).length;
        r.state.architectureCullingRadius = 90;
        r.state.architectureCullingLastTick = -1e12;
        const t0 = performance.now();
        r.tickArchitectureCulling(performance.now() / 1000);
        out.cullingBurstMs = +(performance.now() - t0).toFixed(1);
        out.clusterColdBuilt = coldBefore - r.state.architectures.filter((e) => idSet.has(e.id) && !e.mesh).length;

        // --- Nach dem Burst: Steady-State-Last ---
        out.afterBurst = countSubMeshes(r.state.architectures);
        out.afterBurstDraw = drawInfo();

        // --- Instancing-Ziel: distinct (type × part) Gruppen über alle
        //     gebauten Architekturen = Draw-Calls NACH Instancing. ---
        let groups = 0;
        for (const t of new Set(r.state.architectures.filter((e) => e.mesh).map((e) => e.type))) {
            groups += out.partsPerType[t] || 0;
        }
        out.instancingGroups = groups;

        r.state.architectureCullingRadius = origRadius;
        return out;
    });

    const fps = (ms) => (ms > 0 ? Math.round(1000 / ms) : "∞");
    console.log("\n========= V12.0-perf.c DIAGNOSE — Architektur-Teilsystem =========\n");
    console.log("Culling-Radius:", report.cullingRadius, "m");
    console.log("\n--- Natürlich gestreamte Architekturen ---");
    console.log("  Einträge total (cold+hot):", report.archTotal);
    console.log("  davon hot (Mesh gebaut):  ", report.natural.hot);
    console.log("  Sub-Meshes (≈ Draw-Calls):", report.natural.sub);
    console.log("  Ammo-Bodies:              ", report.natural.bodies);
    console.log("  Szene Draw-Calls/Tris:    ", report.baseline.calls, "/", report.baseline.tris);

    console.log("\n--- Culling-Build-Burst (Wurzel B: 60er-Cluster cold → EIN Tick) ---");
    console.log("  Cluster gespawnt:", report.clusterSpawned, "(" + report.clusterTypes.join(", ") + ")");
    console.log("  davon in EINEM Tick gebaut:", report.clusterColdBuilt);
    console.log(
        `  tickArchitectureCulling-Burst: ${report.cullingBurstMs} ms  → ~${fps(report.cullingBurstMs)} FPS in dem Frame`
    );

    console.log("\n--- Steady-State NACH dem Burst (Wurzel A: Draw-Call-Last) ---");
    console.log("  hot Architekturen:        ", report.afterBurst.hot);
    console.log("  Sub-Meshes (≈ Draw-Calls):", report.afterBurst.sub);
    console.log("  Ammo-Bodies:              ", report.afterBurst.bodies);
    console.log("  Szene Draw-Calls/Tris:    ", report.afterBurstDraw.calls, "/", report.afterBurstDraw.tris);

    console.log("\n--- Instancing-Hebel (Wurzel A: das Ziel) ---");
    console.log("  Sub-Meshes JETZT (1 Draw-Call/Mesh): ", report.afterBurst.sub);
    console.log("  Instancing-Gruppen (type × part):    ", report.instancingGroups);
    if (report.instancingGroups > 0) {
        console.log(
            `  → Draw-Call-Reduktion: ${report.afterBurst.sub} → ${report.instancingGroups}  (×${(report.afterBurst.sub / report.instancingGroups).toFixed(1)} weniger)`
        );
    }

    console.log("\n--- Parts pro Bauplan-Typ (Instancing-Gruppen-Sizing) ---");
    for (const [name, n] of Object.entries(report.partsPerType).sort((a, b) => b[1] - a[1])) {
        if (n > 0) console.log(`  ${name.padEnd(22)} ${n} Parts`);
    }
    console.log("\n==================================================================\n");
    await browser.close();
    server.close();
})();

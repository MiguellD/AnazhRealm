// V18.263 — Diag: DER LAUF-FREEZE (Schöpfer: „sobald ich beginne zu laufen freezt das
// Bild"). Misst die per-Frame-Kosten ALLER Streaming-/Kollisions-Phasen, WÄHREND der
// Spieler kontinuierlich läuft (Body-Teleport in kleinen Schritten → echtes Chunk-Cross-
// Streaming), mit Worker-Yields (der echte Browser-Pfad). Plus die ZÄHLER, die den
// Schöpfer-Verdacht prüfen: state.architectures.length · Kollisions-Bodies · rigidBodies
// (Ammo-Druck) · Scatter-Instanzen · BVH-Chunks. MISS zuerst (V9.55/V18.260-Disziplin).
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4359,
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
        const probes = {};
        const wrap = (name, fnName) => {
            const orig = r[fnName];
            if (typeof orig !== "function") return;
            probes[name] = { calls: 0, totalMs: 0, maxMs: 0, items: 0 };
            r[fnName] = function (...args) {
                const t0 = performance.now();
                const ret = orig.apply(this, args);
                const dt = performance.now() - t0;
                const p = probes[name];
                p.calls++;
                p.totalMs += dt;
                if (dt > p.maxMs) p.maxMs = dt;
                if (typeof ret === "number") p.items += ret;
                return ret;
            };
        };
        // die per-Frame-Loop-Phasen
        wrap("voxelStreaming", "_loopVoxelStreaming");
        wrap("archCulling", "tickArchitectureCulling");
        wrap("archAnim", "tickArchitectures");
        wrap("waterIso", "_tickPendingWaterIso");
        wrap("physicsSync", "_loopPhysicsSync");
        wrap("creatures", "updateCreatures");
        wrap("playerMove", "_loopPlayerMovement");
        // die schweren Sub-Bauten (der Verdacht: Kollision/BVH)
        wrap("ensureChunk", "_ensureVoxelChunkAt");
        wrap("playerBVH", "_ensurePlayerChunkBVH");
        wrap("pumpBVH", "_pumpVoxelChunkBVH");
        wrap("upgradeBVH", "_upgradeChunkBVH");
        wrap("triMeshCollision", "_buildStaticTriMeshCollision");
        wrap("rebuildArch", "_rebuildArchitectureMesh");
        wrap("archCollision", "_buildArchitectureCollision");
        wrap("archCollisionLeaves", "_buildArchitectureCollisionFromLeaves");
        wrap("waterIsoBuild", "_buildVoxelChunkWaterIsoSurface");

        const teleport = (x, z) => {
            const body = s.playerMesh && s.playerMesh.userData && s.playerMesh.userData.physicsBody;
            const y = (r.getTerrainHeightAt ? r.getTerrainHeightAt(x, z) : 20) + 3;
            if (body && A) {
                const tr = new A.btTransform();
                tr.setIdentity();
                const v = new A.btVector3(x, y, z);
                tr.setOrigin(v);
                body.setWorldTransform(tr);
                const z0 = new A.btVector3(0, 0, 0);
                body.setLinearVelocity(z0);
                body.activate(true);
                A.destroy(v);
                A.destroy(z0);
                A.destroy(tr);
            }
            s.playerMesh.position.set(x, y, z);
        };

        const countCollisions = () => {
            let n = 0;
            for (const e of s.architectures || []) if (e && e.collision) n++;
            return n;
        };
        const countScatter = () => {
            let n = 0;
            if (s.archInstanceGroups) for (const g of s.archInstanceGroups.values()) n += (g && g.count) || 0;
            return n;
        };
        const ammoBodies = () => {
            try {
                return s.physicsWorld ? s.physicsWorld.getNumCollisionObjects() : -1;
            } catch (_e) {
                return -1;
            }
        };

        const px = s.playerMesh.position.x,
            pz = s.playerMesh.position.z;
        const cntStart = {
            architectures: (s.architectures || []).length,
            withCollision: countCollisions(),
            ammoBodies: ammoBodies(),
            scatterInstances: countScatter(),
            voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };

        // Ein paar Frames im Stand (Baseline), dann Probes resetten.
        for (let i = 0; i < 8; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await new Promise((res) => setTimeout(res, 0));
        }
        for (const k in probes) {
            probes[k].calls = probes[k].totalMs = probes[k].maxMs = probes[k].items = 0;
        }

        // LAUFEN: kontinuierliche kleine Schritte (~5 m/Frame) über ~80 Frames (~400 m,
        // ~9 Chunk-Crossings) — das echte Lauf-Streaming, NICHT ein Teleport-Sprung.
        const frames = [];
        const STEP = 5;
        let wx = px,
            wz = pz;
        for (let f = 0; f < 80; f++) {
            wx += STEP;
            teleport(wx, wz);
            const t0 = performance.now();
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            frames.push(performance.now() - t0);
            // YIELD: der Worker liefert seine fertigen Meshes (echter Browser-Pfad).
            await new Promise((res) => setTimeout(res, 0));
        }

        const cntEnd = {
            architectures: (s.architectures || []).length,
            withCollision: countCollisions(),
            ammoBodies: ammoBodies(),
            scatterInstances: countScatter(),
            voxelChunks: s.voxelChunks ? s.voxelChunks.size : 0,
        };

        // V18.263 — was der NEXUS selbst gemessen hat (der Perf-Sense) + wie der
        // Regelkreis darauf reagierte (loadScale + die gefahrenen Stellgrößen).
        const sense = s.perfSense;
        const senseDump = sense
            ? {
                  frameMs: +sense.frameMs.toFixed(1),
                  frameMaxMs: +sense.frameMaxMs.toFixed(0),
                  phase: Object.fromEntries(
                      Object.keys(sense.phase).map((k) => [k, +(sense.phase[k] || 0).toFixed(2)])
                  ),
                  loadScale: +sense.loadScale.toFixed(2),
                  perCreatureMs: +sense.perCreatureMs.toFixed(3),
                  syncBuildN: +sense.syncBuildN.toFixed(2),
                  syncBuildMs: +sense.syncBuildMs.toFixed(0),
                  workerMeshN: +sense.workerMeshN.toFixed(2),
                  levers: {
                      cullRadius: +(s.architectureCullingRadius || 0).toFixed(0),
                      buildBudget: s.architectureBuildBudgetPerFrame,
                      streamBudgetMs: +(s._voxelStreamBudgetMs || 0).toFixed(2),
                      waterIsoBudgetMs: +((s.atmosphere && s.atmosphere.waterIsoBudgetMs) || 0).toFixed(2),
                  },
              }
            : null;

        const sorted = frames.slice().sort((a, b) => a - b);
        const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];
        const summary = (p) =>
            p
                ? {
                      calls: p.calls,
                      totalMs: +p.totalMs.toFixed(1),
                      maxMs: +p.maxMs.toFixed(2),
                      items: p.items,
                      avgMs: p.calls ? +(p.totalMs / p.calls).toFixed(3) : 0,
                  }
                : null;
        const ph = {};
        for (const k in probes) ph[k] = summary(probes[k]);
        return {
            frameMs: {
                p50: +pct(0.5).toFixed(2),
                p90: +pct(0.9).toFixed(2),
                p99: +pct(0.99).toFixed(2),
                max: +sorted[sorted.length - 1].toFixed(2),
            },
            countsStart: cntStart,
            countsEnd: cntEnd,
            phases: ph,
            sense: senseDump,
        };
    });

    if (out.error) {
        console.log("FEHLER:", out.error);
        await browser.close();
        server.close();
        process.exit(1);
    }
    console.log("\n===== LAUF-FREEZE-PROFIL (V18.263, gemessen beim Laufen) =====\n");
    console.log("  Frame-Zeit (ganzer _gameLoopTick) beim Laufen:");
    console.log(
        `    p50=${out.frameMs.p50} ms  p90=${out.frameMs.p90} ms  p99=${out.frameMs.p99} ms  MAX=${out.frameMs.max} ms`
    );
    console.log("\n  ZÄHLER (Start → Ende des Laufs):");
    const c0 = out.countsStart,
        c1 = out.countsEnd;
    console.log(`    state.architectures:     ${c0.architectures} → ${c1.architectures}`);
    console.log(`    davon mit Kollision:     ${c0.withCollision} → ${c1.withCollision}`);
    console.log(`    Ammo collision-objects:  ${c0.ammoBodies} → ${c1.ammoBodies}`);
    console.log(`    Scatter-Instanzen:       ${c0.scatterInstances} → ${c1.scatterInstances}`);
    console.log(`    voxelChunks:             ${c0.voxelChunks} → ${c1.voxelChunks}`);
    console.log("\n  PHASEN (Ø ms | MAX ms | calls | items) — sortiert nach MAX:");
    const rows = Object.entries(out.phases)
        .filter(([, v]) => v)
        .sort((a, b) => b[1].maxMs - a[1].maxMs);
    for (const [k, v] of rows) {
        console.log(
            `    ${k.padEnd(22)} Ø${String(v.avgMs).padStart(7)} | MAX${String(v.maxMs).padStart(8)} | ${v.calls} calls | ${v.items} items`
        );
    }
    if (out.sense) {
        const sd = out.sense;
        console.log("\n  PERF-SENSE (was der Nexus selbst maß) + REGELKREIS:");
        console.log(
            `    frame ø ${sd.frameMs} ms · max ${sd.frameMaxMs} ms · loadScale ${(sd.loadScale * 100).toFixed(0)}%`
        );
        console.log(
            `    phase ms: stream ${sd.phase.streaming} · water ${sd.phase.waterIso} · arch ${sd.phase.archCulling} · creat ${sd.phase.creatures} · phys ${sd.phase.physics} · rend ${sd.phase.render}`
        );
        console.log(
            `    sync-build ${sd.syncBuildN}/f (${sd.syncBuildMs} ms) · worker ${sd.workerMeshN}/f · kosten/kreatur ${sd.perCreatureMs} ms`
        );
        console.log(
            `    STELLGRÖSSEN (vom Regler gefahren): cullR ${sd.levers.cullRadius} · buildBudget ${sd.levers.buildBudget} · streamBudget ${sd.levers.streamBudgetMs} ms · waterBudget ${sd.levers.waterIsoBudgetMs} ms`
        );
    }
    console.log("\n==============================================================\n");
    try {
        fs.writeFileSync(path.join(root, "artifacts", "diag-walk-profile.json"), JSON.stringify(out, null, 2));
    } catch (_e) {
        try {
            fs.writeFileSync("/tmp/diag-walk-profile.json", JSON.stringify(out, null, 2));
        } catch (_e2) {}
    }
    await browser.close();
    server.close();
    process.exit(0);
})();

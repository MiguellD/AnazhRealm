// E3-Diagnose: WO sitzt der Streaming-Frame-Spike (FPS 9-17 beim Betreten neuer
// Gebiete)? Misst die per-Frame-Kosten der deferred Streaming-Ticks während eines
// heftigen Streams (Teleport in ein frisches Wasser-Gebiet → viele neue Chunks +
// Wasser-Iso + Veg-Spawns). V9.55-Disziplin: profilieren VOR optimieren — nicht
// raten, welcher Posten (Terrain-Build · Veg-Spawn · Wasser-Iso) dominiert.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4358;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json" };
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
    const browser = await puppeteer.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const t = performance.now();
        while (performance.now() - t < 25000) {
            const r = window.anazhRealm;
            if (r && r.state && r.state.hydrosphere && r.state.hydrosphere.ready) break;
            await new Promise((x) => setTimeout(x, 200));
        }
    });
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm,
            s = r.state;
        if (!r._gameLoopTick) return { error: "no _gameLoopTick" };
        // Instrumentiere die deferred Streaming-Ticks + den Spawn + die Wasser-Iso.
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
                if (typeof ret === "number") p.items += ret; // wie viele gebaut/gespawnt
                return ret;
            };
        };
        wrap("streaming", "_tickVoxelChunkStreaming");
        wrap("vegSpawn", "_tickPendingVegSpawns");
        wrap("waterIso", "_tickPendingWaterIso");
        wrap("grass", "_tickPendingGrass");
        wrap("scatter", "_tickPendingScatter");
        // einzelne schwere Bauten / Main-Thread-Posten
        wrap("waterIsoBuild", "_buildVoxelChunkWaterIsoSurface");
        wrap("archSpawn", "spawnArchitecture");
        wrap("ensureChunk", "_ensureVoxelChunkAt");
        wrap("finalize", "_finalizeVoxelChunkBuild");
        wrap("playerBVH", "_ensurePlayerChunkBVH");
        wrap("pumpBVH", "_pumpVoxelChunkBVH");
        wrap("upgradeBVH", "_upgradeChunkBVH");

        // Finde ein in-region Wasser-Gebiet (Ozean), teleportiere dorthin.
        const cfg = r._voxelChunkConfig(0);
        const span = cfg.span;
        const WL = typeof s.waterLevel === "number" ? s.waterLevel : 0;
        let tx = 700,
            tz = 700;
        outer: for (let R = 200; R <= 900; R += span) {
            for (let a = 0; a < 16; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = Math.cos(ang) * R,
                    z = Math.sin(ang) * R;
                if (r._terrainMacroSurfaceY(x, z, true) < WL - 1) {
                    tx = x;
                    tz = z;
                    break outer;
                }
            }
        }
        // Teleport via Physik-Body (V13.0-Falle: Mesh-Set wird überschrieben).
        const A = window.Ammo;
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

        // Pump-Helfer: misst die Frame-Zeit (ganzer _gameLoopTick) Verteilung.
        const frames = [];
        const pump = (n) => {
            for (let i = 0; i < n; i++) {
                const t0 = performance.now();
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                frames.push(performance.now() - t0);
            }
        };

        // 1) erst am Spawn ein paar Frames (Baseline), dann teleport + heftiger Stream.
        pump(10);
        const resetProbes = () => {
            for (const k in probes) {
                probes[k].calls = 0;
                probes[k].totalMs = 0;
                probes[k].maxMs = 0;
                probes[k].items = 0;
            }
            frames.length = 0;
        };
        resetProbes();
        teleport(tx, tz);
        // Mehrere Teleports staffeln, um wiederholt frische Ringe zu streamen.
        let qVegPeak = 0,
            qIsoPeak = 0;
        const legs = [
            [tx, tz],
            [tx + span * 6, tz],
            [tx + span * 6, tz + span * 6],
            [tx, tz + span * 6],
        ];
        for (const [lx, lz] of legs) {
            teleport(lx, lz);
            for (let f = 0; f < 35; f++) {
                const t0 = performance.now();
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                frames.push(performance.now() - t0);
                qVegPeak = Math.max(qVegPeak, s.pendingVegSpawns ? s.pendingVegSpawns.length : 0);
                qIsoPeak = Math.max(qIsoPeak, s.pendingWaterIso ? s.pendingWaterIso.size : 0);
                // YIELD: lässt den async Voxel-Worker seine fertigen Meshes liefern
                // (der echte Browser-Pfad — ohne Yield fällt der Bau auf sync zurück).
                await new Promise((res) => setTimeout(res, 0));
            }
        }

        frames.sort((a, b) => a - b);
        const pct = (p) => frames[Math.min(frames.length - 1, Math.floor(frames.length * p))];
        const summary = (p) => ({ calls: p.calls, totalMs: +p.totalMs.toFixed(1), maxMs: +p.maxMs.toFixed(2), items: p.items, avgMs: p.calls ? +(p.totalMs / p.calls).toFixed(2) : 0 });
        return {
            waterArea: { tx: Math.round(tx), tz: Math.round(tz), macro: +r._terrainMacroSurfaceY(tx, tz, true).toFixed(1), waterLevel: WL },
            frameCount: frames.length,
            frameMs: { p50: +pct(0.5).toFixed(2), p90: +pct(0.9).toFixed(2), p99: +pct(0.99).toFixed(2), max: +frames[frames.length - 1].toFixed(2) },
            qVegPeak,
            qIsoPeak,
            ticks: {
                streaming: summary(probes.streaming),
                vegSpawn: summary(probes.vegSpawn),
                waterIso: summary(probes.waterIso),
                grass: summary(probes.grass),
                scatter: summary(probes.scatter),
            },
            heavy: {
                ensureChunk: summary(probes.ensureChunk),
                finalize: summary(probes.finalize),
                waterIsoBuild: summary(probes.waterIsoBuild),
                archSpawn: summary(probes.archSpawn),
                playerBVH: summary(probes.playerBVH),
                pumpBVH: summary(probes.pumpBVH),
                upgradeBVH: summary(probes.upgradeBVH),
            },
        };
    });
    console.log(JSON.stringify(out, null, 2));
    await browser.close();
    server.close();
    process.exit(0);
})();

// IST DIE RENDER-LAST JETZT TRAGBAR? (Schöpfer „lande und vergleiche, muesste beides tragbar sein sofern LOD
// korrekt"). Echter Renderer + Foundry, kein Render [kein Haenger]. Natuerlich streamen, dann die GESAMTE
// gezeichnete Szenen-Last zaehlen: effektive Dreiecke + sichtbare Meshes. Vorher [Doppel-Guss] ~6.9M bei 1
// Chunk. Ziel: deutlich niedriger -> der echte WebGPU-Render ueberlebt swiftshader -> Vergleich moeglich.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4545;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
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
    fs.readFile(fp, (err, data) => {
        if (err) {
            res.statusCode = 404;
            return res.end();
        }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 200000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[ERR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    const out = await page.evaluate(async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        let stub = false;
        const s0 = performance.now();
        while (performance.now() - s0 < 50000) {
            const r = window.anazhRealm;
            if (r && !stub && r.state && r.state.renderer && !r.state.renderer._isHeadlessNull) {
                r.state.renderer.render = function () {};
                if (r.state.renderer.renderAsync) r.state.renderer.renderAsync = () => Promise.resolve();
                r.state.postProcessingFailed = true;
                r._bootWarmDone = true;
                stub = true;
            }
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (r.state.voxelChunks && r.state.voxelChunks.size >= 12) break;
            }
            await sleep(5);
        }
        const r = window.anazhRealm;
        const s = r.state;
        const f = r._ensureAssetFoundry();
        const t0 = performance.now();
        while (f && !f.ready && performance.now() - t0 < 30000) await sleep(100);
        for (let i = 0; i < 200; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (i % 20 === 0) await sleep(25);
        }
        // GESETZ #0 — die EHRLICHE Zahl: fuer eine BatchedMesh ist `geometry.index.count` die RESERVIERTE
        // Puffer-Kapazitaet (global ~524288 Verts -> „174763 Dreiecke"), NICHT die gezeichneten. Das log
        // eine Phantom-Last (15.9M) fuer 83 fast-leere Reserve-Batches -> ein 48h-Phantomjagd. Die WAHRE
        // gezeichnete Last summiert je AKTIVE Instanz die Tris IHRER Geometrie.
        const idxTris = (g) => {
            if (!g) return 0;
            const idx = g.index;
            if (idx) return idx.count / 3;
            const p = g.attributes && g.attributes.position;
            return p ? p.count / 3 : 0;
        };
        const triOf = (g) => idxTris(g); // Kompat fuer die Speicher-Schaetzung (uniqueMem)
        const drawnTrisOf = (o) => {
            if (o.isBatchedMesh) {
                const gi = o._geometryInfo || null;
                const inst = o._instanceInfo || null;
                const geoTris = (gid) =>
                    gi && gi[gid] && Number.isFinite(gi[gid].count) ? gi[gid].count / 3 : 0;
                let tris = 0;
                if (inst && inst.length) {
                    for (let i = 0; i < inst.length; i++) {
                        const it = inst[i];
                        if (!it || it.active === false || it.visible === false) continue;
                        tris += geoTris(it.geometryIndex != null ? it.geometryIndex : it.geometryId);
                    }
                    return tris;
                }
                let sum = 0,
                    cnt = 0;
                if (gi && gi.length)
                    for (let k = 0; k < gi.length; k++) {
                        const c = gi[k] && gi[k].count;
                        if (c) {
                            sum += c / 3;
                            cnt++;
                        }
                    }
                return cnt ? (sum / cnt) * (o._multiDrawCount || cnt) : 0;
            }
            const per = idxTris(o.geometry);
            return per * (o.isInstancedMesh ? o.count || 0 : 1);
        };
        let totalDrawn = 0,
            uniqueMem = 0,
            visMeshes = 0,
            drawCalls = 0;
        const seen = new Set();
        const cat = { terrain: 0, wasser: 0, gras: 0, baumStudio: 0, rest: 0 };
        if (s.scene)
            s.scene.traverse((o) => {
                if (!o.visible || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                const per = triOf(o.geometry);
                const drawn = drawnTrisOf(o);
                totalDrawn += drawn;
                visMeshes++;
                drawCalls++;
                if (!seen.has(o.geometry.uuid)) {
                    seen.add(o.geometry.uuid);
                    uniqueMem += per;
                }
                const nm = (
                    (o.name || "") +
                    " " +
                    (o.material && o.material.name ? o.material.name : "")
                ).toLowerCase();
                const key = ((o.userData && o.userData.archInstanceKey) || o.name || "") + "";
                if (/water|wasser|hydro/.test(nm)) cat.wasser += drawn;
                else if (/grass|gras|halm/.test(nm)) cat.gras += drawn;
                else if (/fscatter|fimp|#f:|:f:|baum|eiche|fichte|tanne/i.test(key) || /foliage|leaf|bark/i.test(nm))
                    cat.baumStudio += drawn;
                else if (/chunk|terrain|voxel/.test(nm)) cat.terrain += drawn;
                else cat.rest += drawn;
            });
        // Die groessten gezeichneten Meshes (was macht die Last aus?)
        const big = [];
        if (s.scene)
            s.scene.traverse((o) => {
                if (!o.visible || !(o.isMesh || o.isInstancedMesh || o.isBatchedMesh) || !o.geometry) return;
                const per = triOf(o.geometry);
                const inst = o.isInstancedMesh ? o.count || 0 : o.isBatchedMesh ? o._multiDrawCount || 0 : 1;
                const mat =
                    o.material && !Array.isArray(o.material)
                        ? o.material
                        : Array.isArray(o.material)
                          ? o.material[0]
                          : null;
                const matNm = mat ? mat.name || (mat.userData && mat.userData.foundryKind) || mat.type || "?" : "?";
                big.push({
                    drawn: Math.round(drawnTrisOf(o)),
                    per: Math.round(per),
                    inst,
                    kind: o.isInstancedMesh ? "Inst" : o.isBatchedMesh ? "Batch" : "Mesh",
                    key: ((o.userData && o.userData.archInstanceKey) || o.name || "?").slice(0, 40),
                    mat: (matNm + "").slice(0, 26),
                    parent: ((o.parent && (o.parent.name || o.parent.type)) || "?").slice(0, 22),
                });
            });
        big.sort((a, b) => b.drawn - a.drawn);
        // Gras separat (der 83%-Traeger)
        let grassInst = 0;
        if (s.voxelChunkGrass && s.voxelChunkGrass.forEach)
            s.voxelChunkGrass.forEach((m) => {
                if (m && m.count && m.visible !== false) grassInst += m.count;
            });
        return {
            chunks: s.voxelChunks ? s.voxelChunks.size : 0,
            gezeichneteDreiecke: Math.round(totalDrawn),
            uniqueSpeicherDreiecke: Math.round(uniqueMem),
            sichtbareMeshes: visMeshes,
            drawCalls,
            grasInstanzen: grassInst,
            groessteMeshes: big.slice(0, 10),
            nachKategorie: {
                terrain: Math.round(cat.terrain),
                wasser: Math.round(cat.wasser),
                gras: Math.round(cat.gras),
                baumStudio: Math.round(cat.baumStudio),
                rest: Math.round(cat.rest),
            },
        };
    });
    console.log(JSON.stringify(out, null, 2));
    console.log(
        "\nLESART: gezeichneteDreiecke << 6.9M [der alte Doppel-Guss] → die Last ist tragbar → der echte Render ueberlebt."
    );
    await browser.close();
    server.close();
    process.exit(0);
})();

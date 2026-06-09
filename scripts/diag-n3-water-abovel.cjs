// Fokus-Sonde (N3): mein größerer LOD0-Ring streamt mehr Wasser-Flächen → der
// Playtest-Wächter "V18.25 U-W4: KEIN Vertex über L" wurde rot. Meine LOD-Änderung
// kann KEINEN Vertex über L VERURSACHEN (der Surface-Builder ist unberührt) — sie
// EXPONIERT einen vorbestehenden. Diese Sonde reproduziert die exakte Fehlstelle +
// pinnt sie: WO (Chunk, Ring-Distanz zum Spieler), WIE GROSS (Y−L), und ob es die
// Ring-KANTE ist (warmup-transient) oder ein echter T7d-L-Sprung im Inneren.
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4366;
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
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    await page.evaluate(async () => {
        let stubbed = false;
        const start = performance.now();
        while (performance.now() - start < 60000) {
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
                if (r.state && r.state.playerMesh && r.state.voxelChunks && r.state.voxelChunks.size > 26) break;
            }
            await new Promise((res) => setTimeout(res, 4));
        }
        for (let i = 0; i < 200; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
        const r = window.anazhRealm;
        if (r && typeof r._drainDirtyVoxelChunks === "function") r._drainDirtyVoxelChunks();
        if (r && typeof r._drainPendingWaterIso === "function") r._drainPendingWaterIso();
    });

    // HYPOTHESE-TEST: ein Carve neben Wasser populiert waterLevelCells (T4b CA) →
    // caDelta darf bis +4 m → surfY = L + caDelta > L. Genau das, was ein frühes
    // Carve-Band im Playtest hinterlässt + der order-abhängige sampleMesh greift.
    // Scan-Funktion (im Browser): max(Y−L) über ALLE Wasser-Flächen.
    const SCAN = () => {
        const r = window.anazhRealm;
        const s = r.state;
        const span = r._voxelChunkConfig(0).span;
        const pm = s.playerMesh && s.playerMesh.position;
        const pcx = pm ? Math.floor(pm.x / span) : 0;
        const pcz = pm ? Math.floor(pm.z / span) : 0;
        const ringR = s.chunkRingRadius || 4;
        const restCA = !s.waterLevelCells || s.waterLevelCells.size === 0;
        let worst = null,
            nMeshes = 0,
            nWet = 0;
        const overByRing = {};
        if (s.voxelChunkWaterIso) {
            for (const [key, mesh] of s.voxelChunkWaterIso) {
                if (!mesh || !mesh.geometry) continue;
                nMeshes++;
                const sp = mesh.geometry.attributes.position;
                const ad = mesh.geometry.attributes.aDepth;
                if (!sp) continue;
                const [cx, cz] = key.split(",").map(Number);
                const ring = Math.max(Math.abs(cx - pcx), Math.abs(cz - pcz));
                let meshWet = false;
                for (let v = 0; v < sp.count; v++) {
                    const L = r._atlasWaterLevelAt(sp.getX(v), sp.getZ(v), -Infinity);
                    if (!isFinite(L)) continue;
                    const dy = sp.getY(v) - L;
                    if ((ad ? ad.getX(v) : 2) >= 1.8) meshWet = true;
                    if (dy > 0.05) overByRing[ring] = (overByRing[ring] || 0) + 1;
                    if (!worst || dy > worst.dy)
                        worst = {
                            dy: +dy.toFixed(3),
                            x: +sp.getX(v).toFixed(1),
                            z: +sp.getZ(v).toFixed(1),
                            y: +sp.getY(v).toFixed(2),
                            L: +L.toFixed(2),
                            chunk: key,
                            ring,
                            atRingEdge: ring >= ringR,
                        };
                }
                if (meshWet) nWet++;
            }
        }
        return {
            pcx,
            pcz,
            ringR,
            restCA,
            nMeshes,
            nWet,
            worst,
            overByRing,
            chunkCount: s.voxelChunks ? s.voxelChunks.size : 0,
        };
    };

    // 1) PRE-Carve-Scan (sauberer Warmup → erwartet Δ≈0)
    const out = await page.evaluate(`(${SCAN.toString()})()`);

    // 2) Carve neben Wasser → T4b CA populiert waterLevelCells → caDelta darf bis +4 m
    const carve = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        let target = null;
        if (s.voxelChunkWaterIso) {
            for (const [, mesh] of s.voxelChunkWaterIso) {
                if (mesh && mesh.geometry && mesh.geometry.attributes.position.count > 0) {
                    const sp = mesh.geometry.attributes.position;
                    target = { x: sp.getX(0), y: sp.getY(0), z: sp.getZ(0) };
                    break;
                }
            }
        }
        if (!target) return { carved: false };
        if (typeof r.carveVoxelSphere === "function") r.carveVoxelSphere(target.x, target.y - 4, target.z, 4);
        for (let i = 0; i < 60; i++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            await new Promise((res) => setTimeout(res, 2));
        }
        if (typeof r._drainPendingWaterIso === "function") r._drainPendingWaterIso();
        return {
            carved: true,
            waterLevelCellsSize: s.waterLevelCells ? s.waterLevelCells.size : 0,
            target: { x: target.x, z: target.z },
        };
    });

    // 3) POST-Carve-Scan (erwartet caDelta>0 → Vertex über L, wenn die Hypothese stimmt)
    const afterCarve = await page.evaluate(`(${SCAN.toString()})()`);
    out.carve = carve;
    out.afterCarve = afterCarve;

    await browser.close();
    await new Promise((r) => server.close(r));

    console.log("\n=== N3 — Wasser-über-L exponiert? (der Playtest-Wächter U-W4) ===\n");
    console.log(
        `Spieler-Chunk: ${out.pcx},${out.pcz}  ·  Ring-Radius: ${out.ringR}  ·  gestreamte Chunks: ${out.chunkCount}`
    );
    console.log(
        `Wasser-Flächen: ${out.nMeshes} (davon nass/aDepth≥1.8: ${out.nWet})  ·  caDelta-Ruhe (waterLevelCells leer): ${out.restCA ? "JA (=0)" : "NEIN!"}`
    );
    if (out.worst) {
        console.log(
            `\nWORST Vertex über L:  Δ=${out.worst.dy} m  @(${out.worst.x}, ${out.worst.y}, ${out.worst.z})  L=${out.worst.L}`
        );
        console.log(
            `   Chunk ${out.worst.chunk}  ·  Ring-Distanz ${out.worst.ring} vom Spieler  ·  ${out.worst.atRingEdge ? "AN DER RING-KANTE (warmup-transient/halb-gebaut?)" : "im Inneren (echter T7d-L-Sprung)"}`
        );
    }
    console.log(`\nVertices >0.05 m über L nach Ring-Distanz: ${JSON.stringify(out.overByRing)}`);
    console.log(`\n--- HYPOTHESE-TEST (Carve → caDelta hebt über L?) ---`);
    if (out.carve && out.carve.carved) {
        console.log(
            `   Carve @(${out.carve.target.x.toFixed(0)},${out.carve.target.z.toFixed(0)})  ·  waterLevelCells nach Carve: ${out.carve.waterLevelCellsSize}`
        );
        if (out.afterCarve && out.afterCarve.worst) {
            const w = out.afterCarve.worst;
            console.log(
                `   WORST über L NACH Carve:  Δ=${w.dy} m  Chunk ${w.chunk}  (caDelta-aktiv: ${out.afterCarve.restCA ? "nein" : "JA"})`
            );
            console.log(
                `   → ${w.dy > 0.05 ? "BESTÄTIGT: caDelta (T4b) hebt Wasser über L — der V18.25-Wächter ist mit T4b inkompatibel (order-abhängiger sampleMesh exponiert es)." : "Carve hob NICHT über L — andere Wurzel."}`
            );
        }
    } else {
        console.log(`   (kein Wasser zum Carven gefunden)`);
    }
    console.log(`\nDeutung: der Wächter prüft max(Y−L) ≤ 0.05 über ALLE Flächen. Meine N3-LOD-Änderung baut keinen`);
    console.log(`Vertex über L — sie streamt nur mehr Flächen. Ist der WORST an der Ring-KANTE → warmup-transient`);
    console.log(`(halb-gebaute Fläche am Rand); im INNEREN bei kleinem Δ → vorbestehender T7d-L-Sprung (Burnt-Zone).`);
    process.exit(0);
})();

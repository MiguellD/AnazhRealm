// Diagnose V18.27+ — DER VERTEX-NAHT-RISS an der Chunkgrenze (Schöpfer „innerhalb des Chunks
// top, nur entlang der Kontur/Ecke Sägezähne; das Netz falsch an der Grenze; Ecke besonders, da
// 4 Chunks aufeinander kommen + das Problem sich stapelt"). Die GEOMETRIE-Frage: teilen zwei
// Nachbar-Chunks an ihrem GEMEINSAMEN Rand-Vertex (gleiche (x,z)) dieselbe Höhe Y (position.y =
// surfY), oder klafft sie? Wenn klafft → ein Riss/Sägezahn an der Naht.
//
// HYPOTHESE: die V18.23-DILATION ist per-Chunk (jeder dilatiert seine trockene Rand-Zelle aus
// SEINEN eigenen Nachbarn) → an der Grenze sehen A und B UNTERSCHIEDLICHE Nachbarn für den
// geteilten Rand-Vertex → unterschiedliche dilatierte L → unterschiedliche surfY → der Riss.
// An der ECKE (4 Chunks) stapelt sich das.
//
// METRIK — geteilte Rand-Positionen (in ≥2 Meshes): max |ΔY|, Anzahl Mismatch (|ΔY|>0.05),
//          getrennt nach KANTE (2 Chunks) vs ECKE (3-4 Chunks).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4367;
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
        while (performance.now() - start < 50000) {
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
        for (let i = 0; i < 250; i++) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            await new Promise((res) => setTimeout(res, 2));
        }
    });

    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        const s = r.state;
        // (x,z gerundet auf mm) -> Liste {y, key}
        const posMap = new Map();
        for (const [key, mesh] of s.voxelChunkWaterIso) {
            if (!mesh || !mesh.geometry || mesh.userData.hydroKind !== "chunk-water-surface") continue;
            const pos = mesh.geometry.attributes.position;
            if (!pos) continue;
            for (let v = 0; v < pos.count; v++) {
                const xk = Math.round(pos.getX(v) * 100);
                const zk = Math.round(pos.getZ(v) * 100);
                const k = xk + "," + zk;
                let e = posMap.get(k);
                if (!e) {
                    e = [];
                    posMap.set(k, e);
                }
                // pro Mesh nur den ersten Y an dieser Position (Vertices sind unique pro Mesh)
                if (!e.some((o) => o.key === key)) e.push({ y: pos.getY(v), key });
            }
        }
        let sharedEdge = 0,
            sharedCorner = 0,
            mismatchEdge = 0,
            mismatchCorner = 0,
            maxDY = 0;
        const examples = [];
        for (const [k, list] of posMap) {
            if (list.length < 2) continue;
            let mn = Infinity,
                mx = -Infinity;
            for (const o of list) {
                if (o.y < mn) mn = o.y;
                if (o.y > mx) mx = o.y;
            }
            const dy = mx - mn;
            if (dy > maxDY) maxDY = dy;
            const isCorner = list.length >= 3; // 3-4 Chunks = Ecke
            if (isCorner) sharedCorner++;
            else sharedEdge++;
            if (dy > 0.05) {
                if (isCorner) mismatchCorner++;
                else mismatchEdge++;
                if (examples.length < 10) {
                    const [xk, zk] = k.split(",").map(Number);
                    examples.push({
                        x: +(xk / 100).toFixed(1),
                        z: +(zk / 100).toFixed(1),
                        dy: +dy.toFixed(2),
                        n: list.length,
                        ys: list.map((o) => +o.y.toFixed(2)),
                    });
                }
            }
        }
        return {
            meshes: [...s.voxelChunkWaterIso.values()].filter(
                (m) => m && m.geometry && m.userData.hydroKind === "chunk-water-surface"
            ).length,
            sharedEdge,
            sharedCorner,
            mismatchEdge,
            mismatchCorner,
            maxDY: +maxDY.toFixed(3),
            examples,
        };
    });

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n=== VERTEX-NAHT-RISS an der Chunkgrenze (V18.27+) ===");
    console.log(`Wasser-Surface-Meshes: ${out.meshes}`);
    console.log(
        `\nKANTE (2 Chunks teilen den Rand-Vertex): ${out.sharedEdge}, davon Riss |ΔY|>0.05 m: ${out.mismatchEdge} (${out.sharedEdge ? ((100 * out.mismatchEdge) / out.sharedEdge).toFixed(1) : "—"}%)`
    );
    console.log(
        `ECKE (3-4 Chunks teilen den Vertex): ${out.sharedCorner}, davon Riss: ${out.mismatchCorner} (${out.sharedCorner ? ((100 * out.mismatchCorner) / out.sharedCorner).toFixed(1) : "—"}%)`
    );
    console.log(`max |ΔY| über alle geteilten Vertices: ${out.maxDY} m   (0 = naht-frei; >0 = der Riss/Sägezahn)`);
    for (const e of out.examples)
        console.log(`   (${e.x}, ${e.z}) ${e.n} Chunks, ΔY=${e.dy} m  Ys=[${e.ys.join(", ")}]`);
    console.log("");
    process.exit(0);
})();

// diag-worker-chunk.cjs — DETERMINISMUS-ROUND-TRIP für den Worker-Mesher.
// Baut einen Chunk über den ECHTEN voxel-worker (jetzt mit Band-Skip via computeDensityGrid)
// und vergleicht das Mesh BYTE-FÜR-BYTE gegen den Main-Sync-Bau desselben Chunks. maxDiff 0
// beweist: (1) die Band-Skip-Verdrahtung in buildChunkMesh ist korrekt, (2) Worker == Main
// (Naht-/Determinismus-Schutz hält). Lauf: node scripts/diag-worker-chunk.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4373;
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
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                typeof window.anazhRealm._gameLoopTick !== "function" ||
                !window.anazhRealm.state.blueprints) &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    const out = await page.evaluate(async () => {
        const r = window.anazhRealm;
        if (!r.state.voxelWorker) return { fatal: "kein voxelWorker (headless erzeugt ihn nicht?)" };
        const worker = r.state.voxelWorker;
        const cfg = r._voxelChunkConfig(0);
        const { dim, step, span, dimY, floorDrop } = cfg;
        const base = r.state.terrainBaseHeight || 0;
        const fullSample = (x, y, z) => r._terrainDensityAt(x, y, z);
        // Worker-Round-Trip für einen Chunk.
        const workerChunk = (cx, cz) =>
            new Promise((resolve) => {
                const rid = "diag-" + cx + "-" + cz + "-" + Math.random().toString(36).slice(2);
                const onmsg = (e) => {
                    const m = e.data;
                    if (m && m.type === "chunk-mesh-result" && m.requestId === rid) {
                        worker.removeEventListener("message", onmsg);
                        if (m.empty) resolve({ empty: true });
                        else
                            resolve({
                                positions: new Float32Array(m.positions),
                                normals: new Float32Array(m.normals),
                                indices: new Uint32Array(m.indices),
                                colors: new Float32Array(m.colors),
                            });
                    }
                };
                worker.addEventListener("message", onmsg);
                worker.postMessage({ type: "chunk-mesh", cx, cz, lod: 0, requestId: rid });
                setTimeout(() => {
                    worker.removeEventListener("message", onmsg);
                    resolve({ timeout: true });
                }, 30000);
            });
        const cmp = (a, b) => {
            if (!a && !b) return 0;
            if (!a || !b || a.length !== b.length) return Infinity;
            let w = 0;
            for (let i = 0; i < a.length; i++) {
                const d = Math.abs(a[i] - b[i]);
                if (d > w) w = d;
            }
            return w;
        };
        const cases = [
            [5, 5],
            [6, 4],
            [4, 7],
        ];
        const res = [];
        for (const [cx, cz] of cases) {
            const wm = await workerChunk(cx, cz);
            // Main-Sync-Bau desselben Chunks (band-skip default), gleiche Geometrie-Pipeline wie buildChunkMesh.
            const ox = cx * span,
                oz = cz * span,
                oy = base - floorDrop;
            const sampleOx = ox - step,
                sampleOz = oz - step,
                sdx = dim + 3,
                sdy = dimY,
                sdz = dim + 3;
            const g = r._voxelChunkGeometry(sampleOx, oy, sampleOz, sdx, sdy, sdz, step, fullSample, 1, null, 1);
            const c = { chunk: `${cx},${cz}` };
            if (wm.empty || wm.timeout) {
                c.note = wm.timeout ? "WORKER-TIMEOUT" : "beide leer?";
                c.empty = true;
                res.push(c);
                continue;
            }
            c.position = cmp(wm.positions, g.attributes.position.array);
            c.normal = cmp(wm.normals, g.attributes.normal ? g.attributes.normal.array : null);
            c.color = cmp(wm.colors, g.attributes.color ? g.attributes.color.array : null);
            c.index = cmp(wm.indices, g.index ? g.index.array : null);
            c.vtx = wm.positions.length / 3;
            res.push(c);
        }
        return { res };
    });
    await browser.close();
    server.close();
    if (out.fatal) {
        console.error("❌", out.fatal);
        process.exit(1);
    }
    console.log("===== WORKER-CHUNK-ROUND-TRIP — Worker (band-skip) vs Main-Sync (byte-identisch?) =====\n");
    let allOk = true;
    for (const c of out.res) {
        if (c.empty) {
            console.log(`  ⚠ Chunk ${c.chunk} ${c.note}`);
            allOk = false;
            continue;
        }
        const md = Math.max(c.position || 0, c.normal || 0, c.color || 0, c.index || 0);
        const ok = md === 0;
        if (!ok) allOk = false;
        console.log(
            `  ${ok ? "✅" : "❌"} Chunk ${c.chunk.padEnd(5)}  maxDiff ${md}  vtx ${c.vtx}` +
                (ok ? "" : `  → pos ${c.position} nrm ${c.normal} col ${c.color} idx ${c.index}`)
        );
    }
    console.log(
        "\n" +
            (allOk
                ? "✅ WORKER == MAIN byte-identisch — die Band-Skip-Verdrahtung im Worker ist korrekt, Naht-/Determinismus-Schutz hält."
                : "❌ DIFF/Problem — der Worker weicht ab.")
    );
    process.exit(allOk ? 0 : 1);
})().catch((e) => {
    console.error("Crash:", e);
    process.exit(1);
});

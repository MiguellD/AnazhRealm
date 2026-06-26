// diag-crosslod-normal.cjs — MISST die cross-LOD-LICHTUNGS-NAHT (der wahre Weg, V18.372+).
// Der Geomorph konformiert an der LOD-Grenze die POSITION (snap fein→grobe Fläche), lässt aber
// die NORMALE des feinen Rand-Verts unangetastet — der grobe Nachbar trägt dort die grobe Normale.
// Diese Linse baut einen FEINEN Chunk (lod0) + seinen GROBEN +x-Nachbarn (lod1), und misst an der
// geteilten Ebene (x=6·span) für jeden feinen Rand-Vert den Winkel zwischen SEINER Normale und der
// des NÄCHSTEN groben Verts. Grosse Divergenz = sichtbare Lichtungs-Naht (die LOD0↔LOD1-Grenze
// liegt bei ~100 m = NICHT tiefer Nebel). Lauf: node scripts/diag-crosslod-normal.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4377;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".wasm": "application/wasm" };
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
        const f = r._voxelChunkConfig(0);
        const c = r._voxelChunkConfig(1);
        const base = r.state.terrainBaseHeight || 0;
        const oyF = base - f.floorDrop;
        const oyC = base - c.floorDrop;
        const fullSample = (x, y, z) => r._terrainDensityAt(x, y, z);
        // FEINER Chunk (5,5) lod0 — +x-Rand bei x=6·span. GROBER Nachbar (6,5) lod1 — −x-Rand bei x=6·span.
        const F = r._voxelChunkGeometry(
            5 * f.span - f.step, oyF, 5 * f.span - f.step, f.dim + 3, f.dimY, f.dim + 3, f.step, fullSample, 1, null, 1
        );
        const C = r._voxelChunkGeometry(
            6 * c.span - c.step, oyC, 5 * c.span - c.step, c.dim + 3, c.dimY, c.dim + 3, c.step, fullSample, 1, null, 1
        );
        if (!F || !C) return { fatal: "Chunk leer" };
        const plane = 6 * f.span;
        const cp = C.attributes.position.array;
        const cn = C.attributes.normal.array;
        const fp = F.attributes.position.array;
        const fn = F.attributes.normal.array;
        // grobe Verts NAHE der Ebene als Kandidaten (für nearest-Suche)
        const cand = [];
        for (let i = 0; i < cp.length; i += 3) {
            if (Math.abs(cp[i] - plane) <= c.step + 0.01) cand.push(i);
        }
        const angs = [];
        for (let i = 0; i < fp.length; i += 3) {
            if (Math.abs(fp[i] - plane) > f.step * 0.6) continue; // nur die feinen Rand-Verts an der Naht
            // nächster grober Vert
            let bd = Infinity, bj = -1;
            for (const j of cand) {
                const dx = fp[i] - cp[j], dy = fp[i + 1] - cp[j + 1], dz = fp[i + 2] - cp[j + 2];
                const d = dx * dx + dy * dy + dz * dz;
                if (d < bd) { bd = d; bj = j; }
            }
            if (bj < 0) continue;
            const dot = Math.max(-1, Math.min(1, fn[i] * cn[bj] + fn[i + 1] * cn[bj + 1] + fn[i + 2] * cn[bj + 2]));
            angs.push({ ang: (Math.acos(dot) * 180) / Math.PI, nnDist: Math.sqrt(bd) });
        }
        angs.sort((a, b) => a.ang - b.ang);
        const n = angs.length;
        const median = n ? +angs[Math.floor(n / 2)].ang.toFixed(2) : null;
        const max = n ? +angs[n - 1].ang.toFixed(2) : null;
        const over15 = angs.filter((a) => a.ang > 15).length;
        const over30 = angs.filter((a) => a.ang > 30).length;
        const meanNnDist = n ? +(angs.reduce((s, a) => s + a.nnDist, 0) / n).toFixed(2) : null;
        return { n, median, max, over15, over30, meanNnDist, fStep: f.step, cStep: c.step };
    });
    console.log("\n===== CROSS-LOD-NORMAL — die Lichtungs-Naht an der LOD0↔LOD1-Grenze =====\n");
    if (out.fatal) {
        console.log("  ⛔ " + out.fatal);
        await browser.close(); server.close(); process.exit(1);
    }
    console.log(`  feiner Rand-Verts an der Naht: ${out.n}  ·  nn-Abstand zum groben Vert ⌀${out.meanNnDist} m (fStep ${out.fStep}, cStep ${out.cStep})`);
    console.log(`  Normal-Winkel fein↔grob:  Median ${out.median}°  ·  max ${out.max}°  ·  >15°: ${out.over15}  ·  >30°: ${out.over30}\n`);
    const real = out.median > 8 || out.over15 > out.n * 0.15;
    console.log(
        real
            ? `  → ECHTE cross-LOD-Lichtungs-Naht (Median ${out.median}°, ${out.over15}/${out.n} >15°): der wahre Schritt = cross-LOD-Normalen konformieren (dekoppelt, kein Churn).`
            : `  → KEINE nennenswerte cross-LOD-Lichtungs-Naht (Median ${out.median}°): die Architektur trägt, kein Eingriff „für nichts".`
    );
    await browser.close();
    server.close();
    process.exit(0);
})();

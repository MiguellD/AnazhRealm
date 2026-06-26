// diag-seam-normal.cjs — G1-GATE (Goldstandard-Mesh): die KONFORME SAME-LOD-RAND-NORMALE.
// Zwei same-LOD-Face-Nachbarn teilen ihre Boundary-Verts float-exakt (pad+crop) — aber die
// NORMALEN divergierten (bis 69° an ~18 % der Rand-Verts), weil der Trilinear-Gradient das
// chunk-lokale Grid liest und der Nachbar am Rand auf sample() zurückfiel (andere Methode →
// andere Normale → eine LICHTUNGS-Naht = der „Naht direkt unter dem Wasser"-Befund). Die G1-
// Heilung (V18.372): in der Rand-Schale rechnet der Gradient via sample() (reine Funktion der
// Welt-Position) → beide Nachbarn rechnen die IDENTISCHE Normale. Dieses Gate misst es: an den
// geteilten Boundary-Verts MUSS der Normal-Winkel ~0 sein. Lauf: node scripts/diag-seam-normal.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4375;
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
        const cfg = r._voxelChunkConfig(0);
        const { dim, step, span, dimY, floorDrop } = cfg;
        const base = r.state.terrainBaseHeight || 0;
        const oy = base - floorDrop;
        const fullSample = (x, y, z) => r._terrainDensityAt(x, y, z);
        const build = (cx, cz) =>
            r._voxelChunkGeometry(cx * span - step, oy, cz * span - step, dim + 3, dimY, dim + 3, step, fullSample, 1, null, 1);
        const q = (v) => Math.round(v * 1e5) / 1e5;
        const EPS = 1e-4;
        // Pro Face-Paar (A,B) misst die Normal-Konformanz an den geteilten Boundary-Verts.
        // axis 0 = x-Face (Ebene bei B.cx·span), axis 2 = z-Face (Ebene bei B.cz·span).
        const measurePair = (A, gA, B, gB, axis, plane) => {
            const collect = (geom) => {
                const m = new Map();
                const p = geom.attributes.position.array;
                const nrm = geom.attributes.normal.array;
                for (let i = 0; i < p.length; i += 3) {
                    const a = axis === 0 ? p[i] : p[i + 2];
                    if (a >= plane - EPS && a <= plane + step + EPS) {
                        m.set(q(p[i]) + "," + q(p[i + 1]) + "," + q(p[i + 2]), [nrm[i], nrm[i + 1], nrm[i + 2]]);
                    }
                }
                return m;
            };
            const ma = collect(gA);
            const mb = collect(gB);
            const angs = [];
            for (const [k, na] of ma) {
                const nb = mb.get(k);
                if (!nb) continue;
                const dot = Math.max(-1, Math.min(1, na[0] * nb[0] + na[1] * nb[1] + na[2] * nb[2]));
                angs.push((Math.acos(dot) * 180) / Math.PI);
            }
            angs.sort((x, y) => x - y);
            return {
                matched: angs.length,
                med: angs.length ? +angs[Math.floor(angs.length / 2)].toFixed(3) : null,
                max: angs.length ? +angs[angs.length - 1].toFixed(3) : null,
                over1: angs.filter((a) => a > 1).length,
            };
        };
        const gA = build(5, 5);
        const gBx = build(6, 5); // +x-Face-Nachbar
        const gBz = build(5, 6); // +z-Face-Nachbar
        const xFace = measurePair({ cx: 5, cz: 5 }, gA, { cx: 6, cz: 5 }, gBx, 0, 6 * span);
        const zFace = measurePair({ cx: 5, cz: 5 }, gA, { cx: 5, cz: 6 }, gBz, 2, 6 * span);
        return { xFace, zFace };
    });
    console.log("\n===== G1 SEAM-NORMAL — konforme same-LOD-Rand-Normale (Goldstandard-Mesh) =====\n");
    const fmt = (f, lbl) =>
        `  ${lbl}: ${f.matched} geteilte Boundary-Verts · Winkel-Median ${f.med}° · max ${f.max}° · >1°: ${f.over1}`;
    console.log(fmt(out.xFace, "x-Face (5,5↔6,5)"));
    console.log(fmt(out.zFace, "z-Face (5,5↔5,6)"));
    console.log("");
    const TOL = 1.0; // konform = Rand-Normalen praktisch identisch (vor G1: bis 69°)
    let bad = false;
    for (const [lbl, f] of [
        ["x-Face", out.xFace],
        ["z-Face", out.zFace],
    ]) {
        if (!f.matched || f.matched < 20) {
            console.log(`⛔ GATE — ${lbl}: nur ${f.matched} geteilte Verts (vakuös) — die Face-Nachbarn teilen den Rand nicht?`);
            bad = true;
        } else if (f.max > TOL) {
            console.log(`⛔ GATE — ${lbl}: Rand-Normalen divergieren bis ${f.max}° > ${TOL}° (Lichtungs-Naht-Regression).`);
            bad = true;
        }
    }
    if (!bad) {
        console.log(
            `✅ SEAM-NORMAL-GATE: same-LOD-Rand-Normalen konform (x ${out.xFace.max}° · z ${out.zFace.max}° ≤ ${TOL}°) — keine Lichtungs-Naht.`
        );
    }
    await browser.close();
    server.close();
    process.exit(bad ? 1 : 0);
})();

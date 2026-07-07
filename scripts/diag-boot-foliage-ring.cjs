// diag-boot-foliage-ring.cjs — V18.414-BEWEIS: die Vegetation wächst MIT dem Boden, nie voraus.
// Schöpfer-Befund: „es wird ein riesiger ferner Ring mit Billboards bepflückt, statt erst den ersten
// Chunk zu beenden und DANN zu erweitern." WURZEL (gemessen): `foliageRadius` raste per perf-headroom
// (leere Boot-Frames) auf MAX (240 m), während der gebaute Terrain-Ring erst 1 Chunk (43 m) war → die
// Vegetation lag weit VOR dem Boden = der ferne Billboard-Ring. FIX: den Radius auf die gebaute Ring-
// Kante kappen. Diese Linse treibt den NICHT-headless-Ramp-Pfad (Null-Renderer, `_isHeadlessNull=false`
// erzwungen → perf-headroom auf ~0-frameMs, genau die Boot-Situation) und prüft: der foliageRadius
// bleibt an der Ring-Kante, statt auf MAX zu rennen.
//   node scripts/diag-boot-foliage-ring.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = Number(process.env.FOLIRING_PORT || 4615);
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (e, d) => {
        if (e) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: true, protocolTimeout: 120000, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => (window.__anazhHeadlessNullRenderer = true));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 60000;
        while ((!window.anazhRealm || !window.anazhRealm.state || typeof window.anazhRealm._gameLoopTick !== "function" || !window.anazhRealm.state.blueprints) && performance.now() < dl)
            await new Promise((r) => setTimeout(r, 100));
    });
    const S = await page.evaluate(async () => {
        const r = window.anazhRealm, st = r.state;
        // den NICHT-headless-Ramp-Pfad erzwingen: der Null-Renderer gibt sich als echter aus, damit die
        // foliageRadius-Ramp läuft (perf-headroom auf ~0-frameMs = die Boot-Situation).
        if (st.renderer) st.renderer._isHeadlessNull = false;
        st._activeRingRadius = 0;
        st.foliageRadius = 70;
        const { span } = r._voxelChunkConfig();
        for (let i = 0; i < 160; i++) {
            try { r._gameLoopTick(performance.now()); } catch (_e) {}
            await new Promise((res) => setTimeout(res, 4));
        }
        return {
            activeRing: st._activeRingRadius,
            foliageR: Math.round(st.foliageRadius || 0),
            ringReach: Math.round((st._activeRingRadius + 1) * span),
            foliMax: r.constructor.PERF_FOLIAGE_RADIUS_MAX,
            span: Math.round(span),
        };
    });
    await browser.close();
    server.close();
    console.log("=== V18.414 — DIE VEGETATION WÄCHST MIT DEM BODEN (kein ferner Billboard-Ring) ===");
    console.log(`  gebauter Terrain-Ring: ${S.activeRing} (Reichweite ${S.ringReach} m, span ${S.span} m)`);
    console.log(`  foliageRadius: ${S.foliageR} m · MAX wäre ${S.foliMax} m`);
    // Der Radius MUSS an der Ring-Kante kleben (± span Toleranz), NICHT auf MAX rennen.
    const capped = S.foliageR <= S.ringReach + S.span;
    const notMax = S.foliageR < S.foliMax - 1;
    if (!capped || !notMax) {
        console.error(`\n❌ ROT — foliageRadius (${S.foliageR} m) ${!notMax ? "raste auf MAX" : "läuft über die Ring-Kante (" + S.ringReach + " m)"} → die Vegetation liegt vor dem Boden (ferner Billboard-Ring).`);
        process.exit(1);
    }
    console.log(`\n✅ GRÜN — foliageRadius (${S.foliageR} m) bleibt an der gebauten Ring-Kante (${S.ringReach} m), rennt NICHT auf MAX (${S.foliMax} m). Die Vegetation wächst mit dem Boden — erst der Nah-Chunk, dann erweitern.`);
    process.exit(0);
})().catch((e) => { console.error("Boot-Foliage-Ring-Fehler:", (e && e.stack) || e); process.exit(1); });

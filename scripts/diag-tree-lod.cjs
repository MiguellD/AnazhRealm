// Diagnose — WENIGER ABER GRÖSSERE KARTEN IN DER FERNE (V18.346, Schöpfer „fernen Bäume fast kahl").
//
// Die Mechanik: cardsPerAnchor dünnt LOD0→1→2 (5→2→1). Vorher GLEICHE Karten-Größe → LOD2 deckt
// 1/5 der Krone = kahl. Jetzt sizeBoost=sqrt(K0/K) → die Karten-FLÄCHE ∝ 1/K → die Kronen-DECKUNG
// (Σ Dreiecks-Fläche der Laub-Karten) bleibt KONSTANT über die LODs, während die Karten-ZAHL fällt
// und die Karten-GRÖSSE steigt. Ich messe die Dreiecks-Gesamtfläche der Krone je LOD (hardware-frei).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4404;
const root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".json": "application/json", ".css": "text/css", ".wasm": "application/wasm", ".woff2": "font/woff2", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (err, data) => {
        if (err) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true, protocolTimeout: 200000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => { pageErr = (e.stack || e.message).split("\n")[0]; });
    await page.evaluateOnNewDocument(() => { window.__anazhHeadlessNullRenderer = true; });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    // Welt-bereit abwarten (kurz — wir brauchen nur die Klasse + Grammatik).
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 40000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") { try { r._gameLoopTick(performance.now()); } catch (_e) {} if (r.state && r.state.voxelChunks && r.state.voxelChunks.size > 4) break; }
            await new Promise((res) => setTimeout(res, 8));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        // Einen echten Eiche-Skelett wachsen (setzt _lastTreeSkeleton als Side-Channel).
        const grammar = r.constructor.SPECIES_GRAMMAR && r.constructor.SPECIES_GRAMMAR.baum_eiche;
        let skel = null;
        try {
            r._growTreeBlueprintRich("baum_eiche", "diag-lod-v1", grammar, { lod: 0 });
            skel = r.state._lastTreeSkeleton || r._lastTreeSkeleton;
        } catch (e) { return { err: "grow: " + e.message }; }
        if (!skel || !skel.anchors) return { err: "kein Skelett (anchors)", hasSkel: !!skel };

        const triArea = (geo) => {
            const p = geo.attributes.position.array;
            const idx = geo.index ? geo.index.array : null;
            let area = 0, tris = 0;
            const get = (i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
            const n = idx ? idx.length : p.length / 3;
            for (let t = 0; t + 2 < n; t += 3) {
                const a = get(idx ? idx[t] : t), b = get(idx ? idx[t + 1] : t + 1), c = get(idx ? idx[t + 2] : t + 2);
                const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
                const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
                const cxv = uy * vz - uz * vy, cyv = uz * vx - ux * vz, czv = ux * vy - uy * vx;
                area += 0.5 * Math.sqrt(cxv * cxv + cyv * cyv + czv * czv);
                tris++;
            }
            return { area, tris };
        };

        const measure = (lod) => {
            const sk = Object.assign({}, skel, { lodLevel: lod });
            const geo = r._buildTreeFoliageCardGeometry(sk, {});
            if (!geo) return null;
            const vCount = geo.attributes.position.count;
            const cards = vCount / 8; // card{cross} = 8 Verts
            const { area, tris } = triArea(geo);
            return { lod, cards: Math.round(cards), tris, area: +area.toFixed(1), areaPerCard: +(area / Math.max(1, cards)).toFixed(2) };
        };
        const anchors = skel.anchors.length;
        const K0 = r.constructor.FOLIAGE_DENSITY.cardsPerAnchor[0];
        return { anchors, K0, l0: measure(0), l1: measure(1), l2: measure(2) };
    });

    console.log("\n===== TREE-LOD — WENIGER ABER GRÖSSERE KARTEN =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    if (report.err) { console.log("FEHLER:", report.err, JSON.stringify(report)); await browser.close(); server.close(); process.exit(1); }
    const o = report;
    console.log(`  Anker: ${o.anchors} · K0 (LOD0-Karten/Anker): ${o.K0}`);
    const row = (l) => l && console.log(`  LOD${l.lod}: Karten ${String(l.cards).padStart(4)} · Tris ${String(l.tris).padStart(5)} · Σ-Fläche ${String(l.area).padStart(9)} · Fläche/Karte ${l.areaPerCard}`);
    row(o.l0); row(o.l1); row(o.l2);
    // Invariante: Σ-Fläche ~konstant (±12 %); Karten fallen; Fläche/Karte steigt.
    const a0 = o.l0.area, a1 = o.l1.area, a2 = o.l2.area;
    const constArea = Math.abs(a1 - a0) / a0 < 0.12 && Math.abs(a2 - a0) / a0 < 0.12;
    const fewerCards = o.l1.cards < o.l0.cards && o.l2.cards < o.l1.cards;
    const biggerCards = o.l1.areaPerCard > o.l0.areaPerCard && o.l2.areaPerCard > o.l1.areaPerCard;
    console.log(`\n  Kronen-DECKUNG (Σ-Fläche) konstant über LODs: ${constArea ? "✅" : "⚠️"}  (L0 ${a0} · L1 ${a1} · L2 ${a2})`);
    console.log(`  WENIGER Karten in der Ferne: ${fewerCards ? "✅" : "⚠️"}   ·   GRÖSSERE Karten: ${biggerCards ? "✅" : "⚠️"}`);
    const ok = constArea && fewerCards && biggerCards;
    console.log(`\n  ${ok ? "✅ Wenige grosse Karten füllen die ferne Krone genauso voll wie viele kleine nah — kein kahler Baum." : "⚠️ Die Deckungs-Invariante hält nicht — prüfen."}\n`);
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

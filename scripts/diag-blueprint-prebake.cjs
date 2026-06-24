// Diagnose — DER BÄCKER PLANT VORAUS (V18.350, Schöpfer „der Bäcker bäckt on-demand, plant nicht
// voraus, das hängt durchs ganze System").
//
// Der Platzier-Ghost (das Vorschau-Phantom) baute via `_buildFromBlueprint` = EIN Mesh PRO Part
// (~248 Per-Part-Geometrien + Materialien) UNGECACHT bei JEDER Auswahl → der Auswahl-Hänger. Jetzt
// liest der Ghost die GETEILTE Merge-Cache (`_buildArchMeshMerged`), die ein Idle-Pass vorausbäckt.
//
// HARDWARE-UNABHÄNGIG (reine CPU-Bau-Zeit + strukturelle No-Leak-Prüfung, KEIN GPU-Render):
//   (1) WARM-Bau (Cache-Hit) ist drastisch billiger als der KALT-Bau (der Erst-Merge);
//   (2) der WARM-Ghost ist drastisch billiger als der alte `_buildFromBlueprint`-Per-Teil-Bau;
//   (3) KEIN LECK: der Ghost-Material-Klon ist transparent, das GETEILTE Struktur-Material bleibt OPAK
//       (der Ghost mutiert NIE das geteilte Material → die platzierten Bauten bleiben undurchsichtig);
//   (4) `_tickBlueprintPrebake` warm die Merge-Cache eines Hotbar-Bauplans im Idle (plant voraus).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4409;
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".wasm": "application/wasm",
    ".woff2": "font/woff2",
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
        protocolTimeout: 300000,
        args: ["--disable-gpu", "--disable-software-rasterizer", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    let pageErr = null;
    page.on("pageerror", (e) => {
        pageErr = (e.stack || e.message).split("\n")[0];
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.evaluate(async () => {
        const start = performance.now();
        while (performance.now() - start < 60000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function" && r.state && r.state.blueprints) break;
            await new Promise((res) => setTimeout(res, 6));
        }
        for (let i = 0; i < 20; i++) {
            try {
                window.anazhRealm._gameLoopTick(performance.now());
            } catch (_e) {
                /* */
            }
            await new Promise((res) => setTimeout(res, 4));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const st = r.state;
        const out = {};
        // Einen GROSSEN, mergeable, platzierbaren Bauplan finden (≥6 Teile, keine connections).
        let bpName = null,
            bp = null;
        for (const name of Object.keys(st.blueprints)) {
            const b = st.blueprints[name];
            if (!b || !Array.isArray(b.parts) || b.parts.length < 6) continue;
            if (Array.isArray(b.connections) && b.connections.length > 0) continue;
            if (!r._isPlaceableBlueprint(b)) continue;
            bpName = name;
            bp = b;
            if (b.parts.length >= 20) break; // bevorzugt einen richtig grossen (Tempel/Dorf)
        }
        out.bpName = bpName;
        out.parts = bp ? bp.parts.length : 0;
        if (!bp) return out;

        const clearCache = () => {
            if (r._archMergeCache) r._archMergeCache.delete(bp);
        };
        const median = (fn, n) => {
            const xs = [];
            for (let i = 0; i < n; i++) {
                const t = performance.now();
                const g = fn();
                xs.push(performance.now() - t);
                if (g && g.traverse) r._disposeSoulGroup(g);
            }
            xs.sort((a, b) => a - b);
            return xs[xs.length >> 1];
        };

        // (1) KALT: Cache leeren, EINEN Ghost bauen (der teure Erst-Merge).
        clearCache();
        let t = performance.now();
        let g = r._buildPlacementGhost(bp);
        out.coldMs = performance.now() - t;
        if (g && g.traverse) r._disposeSoulGroup(g);

        // (2) WARM: Cache ist jetzt voll → Median über mehrere Ghost-Bauten (nur Geom-Klon).
        out.warmMs = median(() => r._buildPlacementGhost(bp), 7);

        // (3) ALT-Pfad: `_buildFromBlueprint` baut JEDES Mal alle Per-Teil-Meshes neu (kein Cache).
        out.oldMs = median(() => r._buildFromBlueprint(bp), 5);

        // (4) NO-LEAK: erst den Ghost bauen (klont das Material transparent), DANN die platzierte
        //     Struktur — ihr GETEILTES Material muss OPAK bleiben (der Ghost mutiert es nicht).
        const ghost = r._buildPlacementGhost(bp);
        let ghostTransparent = false,
            ghostMeshes = 0;
        ghost.traverse((n) => {
            if (n.material) {
                ghostMeshes++;
                if (n.material.transparent) ghostTransparent = true;
            }
        });
        const placed = r._buildArchMeshMerged(bp);
        let placedTransparent = false,
            placedMeshes = 0;
        placed.traverse((n) => {
            if (n.material) {
                placedMeshes++;
                if (n.material.transparent) placedTransparent = true;
            }
        });
        out.ghostTransparent = ghostTransparent;
        out.placedTransparent = placedTransparent;
        out.ghostMeshes = ghostMeshes;
        out.placedMeshes = placedMeshes;
        r._disposeSoulGroup(ghost);
        r._disposeSoulGroup(placed);

        // (5) IDLE-VORBACKEN: Cache leeren, Bauplan in einen Hotbar-Slot, prebaked-Set leeren,
        //     EINEN Idle-Tick → die Merge-Cache muss warm sein (der Bäcker plant voraus).
        clearCache();
        st.hotbar[0] = bpName;
        if (r._prebakedBlueprints) r._prebakedBlueprints.delete(bpName);
        st._frameOverBudget = false;
        r._tickBlueprintPrebake();
        out.prebakeWarmedCache = !!(r._archMergeCache && r._archMergeCache.get(bp));

        return out;
    });

    console.log("\n===== DER BÄCKER PLANT VORAUS — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log(`  Bauplan: ${o.bpName} (${o.parts} Teile)`);
    console.log(`  KALT-Bau (Erst-Merge):        ${o.coldMs != null ? o.coldMs.toFixed(2) : "?"} ms`);
    console.log(`  WARM-Bau (Cache-Hit, Median): ${o.warmMs != null ? o.warmMs.toFixed(2) : "?"} ms`);
    console.log(`  ALT-Pfad _buildFromBlueprint: ${o.oldMs != null ? o.oldMs.toFixed(2) : "?"} ms`);
    console.log(
        `  → WARM ist ${o.coldMs && o.warmMs ? (o.coldMs / o.warmMs).toFixed(1) : "?"}× billiger als KALT, ${o.oldMs && o.warmMs ? (o.oldMs / o.warmMs).toFixed(1) : "?"}× billiger als der alte Per-Teil-Bau`
    );
    console.log(
        `  NO-LEAK: Ghost-Mat transparent=${o.ghostTransparent} (erw true) · geteiltes Struktur-Mat transparent=${o.placedTransparent} (erw false)`
    );
    console.log(`  Ghost-Meshes ${o.ghostMeshes} · platzierte Meshes ${o.placedMeshes} (erw ~gleich, gemergt)`);
    console.log(`  Idle-Vorbacken warm die Cache: ${o.prebakeWarmedCache} (erw true — der Bäcker plant voraus)`);

    const ok =
        !pageErr &&
        o.bpName != null &&
        o.coldMs != null &&
        o.warmMs != null &&
        o.oldMs != null &&
        o.warmMs < o.coldMs * 0.5 && // Cache-Hit deutlich billiger als der Erst-Merge
        o.warmMs < o.oldMs * 0.5 && // und deutlich billiger als der alte Per-Teil-Bau
        o.ghostTransparent === true &&
        o.placedTransparent === false && // KEIN LECK — das geteilte Struktur-Material bleibt opak
        o.prebakeWarmedCache === true;
    console.log(
        `\n  ${ok ? "✅ Der Ghost liest die warme Merge-Cache (billig), das geteilte Material bleibt opak (kein Leck), das Idle-Vorbacken plant voraus." : "⚠️ Der Vorbacken-/Ghost-Mechanismus weicht ab — prüfen."}\n`
    );
    await browser.close();
    server.close();
    process.exit(ok ? 0 : 1);
})();

// V18.389 (SUBSYSTEM 3) — Verifikation der OCCLUSION-DEMOTION. Injiziert synthetische
// Baum-Architekturen (eine Kronen-WAND in der Sichtlinie + ein KLARER Baum), baut das
// Kronen-Dichte-Gitter (`_rebuildOcclusionGrid`) und prüft `_occlusionOccludes`:
//   1) Baum hinter dichter Wand   → verdeckt (Demotion auf Impostor)
//   2) Baum ohne Wand             → sichtbar (voll-3D bleibt)
//   3) Hysterese                  → marginale Wand: false bei thrHi, true bei thrLo
//   4) Perf-Integration           → dieselbe Wand demotiert unter Last (fdScale=0.4)
// Die Methoden laufen headless (der Gate-Off ist NUR im Tick) — kein GPU nötig.
const puppeteer = require("puppeteer"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");
const PORT = Number(process.env.DIAG_PORT) || 4372,
    root = path.resolve(__dirname, "..");
const mime = { ".html": "text/html", ".js": "application/javascript", ".wasm": "application/wasm", ".json": "application/json", ".css": "text/css", ".png": "image/png" };
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) { res.statusCode = 403; return res.end(); }
    fs.readFile(fp, (e, d) => {
        if (e) { res.statusCode = 404; return res.end(); }
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(d);
    });
});
(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 120000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.log("[PAGE-ERROR]", (e.stack || e.message).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        // auf die Instanz + state warten (kein voller Welt-Bau nötig — die Occlusion-
        // Methoden sind reine JS-Funktionen über state.architectures).
        const t0 = performance.now();
        while (performance.now() - t0 < 60000) {
            const r = window.anazhRealm;
            if (r && r.state && typeof r._occlusionOccludes === "function" && typeof r._rebuildOcclusionGrid === "function") break;
            await new Promise((res) => setTimeout(res, 20));
        }
        const r = window.anazhRealm;
        if (!r || !r.state) return { error: "keine Instanz" };
        const O = r.constructor.OCCLUSION;
        if (!O) return { error: "keine OCCLUSION-Konstante" };

        const mkTree = (x, z) => ({ instanced: true, _lodSpecies: "eiche", _lodVariantIndex: 0, position: { x, y: 0, z }, scale: 1 });
        const savedArchs = r.state.architectures;
        const savedFd = r.state._foliageDensityScale;

        // 6-Kronen-Wand (z=12..42, x=0) vor einem Baum bei (0,60); klarer Baum bei (60,0).
        const wall6 = [12, 18, 24, 30, 36, 42].map((z) => mkTree(0, z));
        // 5-Kronen-Wand (marginale: reicht für thrLo, nicht thrHi)
        const wall5 = [12, 18, 24, 30, 36].map((z) => mkTree(0, z));

        const res = {};

        // --- Fall 1+2: dichte Wand verdeckt, klar sichtbar ---
        r.state.architectures = wall6.slice();
        r.state._foliageDensityScale = 1;
        r._rebuildOcclusionGrid();
        res.gridCells = r._occlGrid.size;
        res.occludedBehindWall = r._occlusionOccludes(0, 0, 0, 60, 60, false); // erwartet true
        res.visibleClearPath = r._occlusionOccludes(0, 0, 60, 0, 60, false); // erwartet false

        // --- Fall 3: Hysterese (marginale 5-Kronen-Wand) ---
        r.state.architectures = wall5.slice();
        r._rebuildOcclusionGrid();
        res.marginalAtThrHi = r._occlusionOccludes(0, 0, 0, 60, 60, false); // wasOccluded=false → thrHi 3.6 → erwartet false
        res.marginalAtThrLo = r._occlusionOccludes(0, 0, 0, 60, 60, true); // wasOccluded=true → thrLo 2.8 → erwartet true

        // --- Fall 4: Perf-Integration (dieselbe marginale Wand demotiert unter Last) ---
        r.state._foliageDensityScale = 0.4;
        res.marginalUnderLoad = r._occlusionOccludes(0, 0, 0, 60, 60, false); // thr sinkt → erwartet true
        r.state._foliageDensityScale = 1;
        res.marginalFullCap = r._occlusionOccludes(0, 0, 0, 60, 60, false); // wieder false (Gegenprobe)

        // --- Nah-Baum wird NICHT marschiert (occDist-Gate) ist Tick-Sache; hier die Methode selbst ---
        // Distanz < endMargin → keine Marsch-Schritte → false
        r.state.architectures = wall6.slice();
        r._rebuildOcclusionGrid();
        res.tooCloseNoMarch = r._occlusionOccludes(0, 0, 0, 5, 5, false); // dr=5 < endMargin 8 → tEnd<startM → false

        res.O = { thrHi: O.thrHi, thrLo: O.thrLo, perfThrMin: O.perfThrMin, cellM: O.cellM, occDist: O.occDist };
        r.state.architectures = savedArchs;
        r.state._foliageDensityScale = savedFd;
        return res;
    });

    console.log(JSON.stringify(out, null, 2));
    let pass = true;
    const check = (name, cond) => { console.log((cond ? "  OK  " : " FAIL ") + name); if (!cond) pass = false; };
    if (out.error) { console.log("FEHLER:", out.error); pass = false; }
    else {
        check("Gitter gefüllt (6 Zellen)", out.gridCells === 6);
        check("Baum hinter dichter Wand → verdeckt", out.occludedBehindWall === true);
        check("Baum ohne Wand → sichtbar", out.visibleClearPath === false);
        check("Hysterese: marginal @ thrHi → sichtbar", out.marginalAtThrHi === false);
        check("Hysterese: marginal @ thrLo → verdeckt", out.marginalAtThrLo === true);
        check("Perf: marginale Wand demotiert unter Last", out.marginalUnderLoad === true);
        check("Perf: bei voller Kapazität wieder sichtbar", out.marginalFullCap === false);
        check("zu nah → kein Marsch → sichtbar", out.tooCloseNoMarch === false);
    }
    console.log(pass ? "\n=== ALLE OCCLUSION-CHECKS GRÜN ===" : "\n=== OCCLUSION-CHECKS ROT ===");
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
})();

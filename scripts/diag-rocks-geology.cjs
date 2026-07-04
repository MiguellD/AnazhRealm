// Diagnose — DAS NEUE KLEID P3: STEINE + KRISTALLE NACH GEOLOGIE (V18.389, Schöpfer
// „Kristalle sind auch noch die alten").
//
// Übersetzt die phytogenesis-`placeRocks`-Regel (worlds/terrain/phytogenesis.js Z.1479-1528)
// auf AnazhRealms per-Sample-Saat: der Fels folgt dem HANG (Findling flach · Aufschluss Grat ·
// Talus Steilhang-Fuß), nicht dem Zufall. Und: die Kristalle nutzen die ECHTE Vorlagen-Geometrie
// (`crystalPoint` = facettiertes Prisma), nicht mehr die alte glatte Kugel/octahedron.
//
// HARDWARE-UNABHÄNGIG (reine Geometrie/Logik, kein GPU-Render):
//   (a) SLOPE-GATE: Findling NUR flach, Talus NUR steil (Fuß), Aufschluss NUR Grat (steil+hoch);
//       der Mittelhang trägt KEINEN Fels (die Nische ist messbar). Die FORM folgt der Nische.
//   (b) KRISTALL-GEOMETRIE: kristall_geode + kristall_var* nutzen `crystalPoint` (neu, facettiert),
//       KEINE `octahedron` mehr; buildCrystalPointGeometry (phyto-core) existiert.
//   (c) VARIANTEN-VIELFALT: verschiedene Regionen → verschiedene Fels-Varianten (HISM-kohärent,
//       aber nicht der eine Klon).
//   (d) DETERMINISMUS: gleiche (slope,relH)/Region → gleiche Klasse + Variante.
//   (e) HEADLESS = VOLL: die Geologie ist perf-unabhängig (kein _foliageDensityScale) → headless
//       liefert die volle Nischen-Klassifikation (gate-treu, wie foliageRadius=MAX).
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const PORT = 4419;
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
        let lastSize = -1,
            stableFor = 0;
        while (performance.now() - start < 70000) {
            const r = window.anazhRealm;
            if (r && typeof r._gameLoopTick === "function") {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* */
                }
                const sz = r.state && r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stableFor++;
                else {
                    stableFor = 0;
                    lastSize = sz;
                }
                if (sz > 25 && stableFor > 30) break;
            }
            await new Promise((res) => setTimeout(res, 6));
        }
    });

    const report = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = { pass: {}, info: {} };
        const G = r.constructor.ROCK_GEOLOGY;
        const FORMS = r.constructor.ROCK_GEOLOGY_FORMS;
        out.info.headlessNull = !!(r.state.renderer && r.state.renderer._isHeadlessNull);
        out.info.thresholds = {
            findlingSlopeMax: G.findlingSlopeMax,
            aufschlussSlopeMin: G.aufschlussSlopeMin,
            aufschlussHeightMin: G.aufschlussHeightMin,
            talusSlopeMin: G.talusSlopeMin,
        };

        // ── (a) SLOPE-GATE: die Nischen-Klassifikation aus (slope, relH) ──
        const cls = (s, h) => r._rockGeologyClass(s, h);
        const gateCases = [
            { s: 0.15, h: 5, exp: "findling", why: "sehr flach → Findling" },
            { s: 0.15, h: 40, exp: "findling", why: "flach auch hoch → Findling" },
            { s: 0.4, h: 5, exp: "findling", why: "flach (≤max) → Findling" },
            { s: 0.55, h: 5, exp: null, why: "Mittelhang tief → kein Fels" },
            { s: 0.55, h: 40, exp: null, why: "Mittelhang hoch → kein Fels" },
            { s: 0.78, h: 5, exp: null, why: "steil aber tief+kein Grat → kein Fels" },
            { s: 0.78, h: 40, exp: "aufschluss", why: "steil UND hoch → Aufschluss (Grat)" },
            { s: 0.95, h: 5, exp: "talus", why: "steiler Fuß, nicht hoch → Talus" },
            { s: 0.95, h: 40, exp: "aufschluss", why: "sehr steil UND hoch → Aufschluss" },
            { s: 1.3, h: 8, exp: "talus", why: "Steilwand-Fuß → Talus" },
        ];
        let gateOk = true;
        const gateDetail = [];
        for (const c of gateCases) {
            const got = cls(c.s, c.h);
            const ok = got === c.exp;
            if (!ok) gateOk = false;
            gateDetail.push(`s=${c.s} h=${c.h} → ${got} (erw ${c.exp}) ${ok ? "✓" : "✗ " + c.why}`);
        }
        out.pass.slopeGate = gateOk;
        out.info.gateDetail = gateDetail;

        // ── (a2) die FORM folgt der Nische: die gewählte Variante trägt eine passende Form-Klasse ──
        // Pool-Form-Verteilung sammeln (welche _formClass gibt es überhaupt?).
        const poolForms = {};
        for (let vi = 0; vi < r.constructor.ROCK_VARIANTS; vi++) {
            const b = r.state.blueprints["fels_var" + vi];
            if (b) poolForms[b._formClass] = (poolForms[b._formClass] || 0) + 1;
        }
        out.info.poolForms = poolForms;
        let formOk = true;
        const formDetail = [];
        for (const clazz of ["findling", "talus", "aufschluss"]) {
            const want = FORMS[clazz]; // die geologische Form-Nische
            const available = want.some((f) => poolForms[f] > 0);
            // über mehrere Regionen prüfen: die zurückgegebene Variante trägt eine Form aus der Nische
            let matched = 0,
                total = 0;
            for (let rx = -6; rx <= 6; rx++) {
                for (let rz = -6; rz <= 6; rz++) {
                    const key = r._rockVariantForGeology(clazz, rx, rz, "diag-seed");
                    const b = r.state.blueprints[key];
                    total++;
                    if (b && want.includes(b._formClass)) matched++;
                }
            }
            // wenn die Nischen-Form im Pool existiert, MUSS jede Rückgabe passen (100%)
            const ok = available ? matched === total : true;
            if (!ok) formOk = false;
            formDetail.push(`${clazz} (Nische ${JSON.stringify(want)}, verfügbar ${available}): ${matched}/${total} passend`);
        }
        out.pass.formFollowsNiche = formOk;
        out.info.formDetail = formDetail;

        // ── (b) KRISTALL-GEOMETRIE: neu (crystalPoint), nicht alt (octahedron/kugelig) ──
        const countShapes = (parts) => {
            const c = {};
            for (const p of parts || []) c[p.shape] = (c[p.shape] || 0) + 1;
            return c;
        };
        const geode = r.state.blueprints.kristall_geode;
        const geodeShapes = geode ? countShapes(geode.parts) : {};
        const varr = r.state.blueprints.kristall_var0;
        const varShapes = varr ? countShapes(varr.parts) : {};
        const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
        out.info.geodeShapes = geodeShapes;
        out.info.varShapes = varShapes;
        out.pass.crystalNewGeometry =
            (geodeShapes.crystalPoint || 0) > 0 &&
            (geodeShapes.octahedron || 0) === 0 &&
            (varShapes.crystalPoint || 0) > 0 &&
            (varShapes.octahedron || 0) === 0 &&
            !!(core && typeof core.buildCrystalPointGeometry === "function");
        // Tag-Neutralität (die frozen Baseline darf sich NICHT verschoben haben).
        const geodeTags = geode ? r.computeCompoundTags(geode) : {};
        out.info.geodeTags = {
            dichte: +(geodeTags.dichte || 0).toFixed(3),
            magieleitung: +(geodeTags.magieleitung || 0).toFixed(3),
        };
        out.pass.crystalTagsFrozen =
            Math.abs((geodeTags.dichte || 0) - 1.95) < 1e-4 && Math.abs((geodeTags.magieleitung || 0) - 2.55) < 1e-4;

        // ── (c) VARIANTEN-VIELFALT: verschiedene Regionen → verschiedene Fels-Varianten ──
        const seen = new Set();
        for (let rx = -10; rx <= 10; rx++)
            for (let rz = -10; rz <= 10; rz++) seen.add(r._rockVariantForGeology("findling", rx, rz, "diag-seed"));
        out.info.distinctFindlingVariants = seen.size;
        out.pass.variety = seen.size >= 2;

        // ── (d) DETERMINISMUS: gleiche Eingabe → gleiche Klasse + Variante (zweimal) ──
        let detOk = true;
        for (const c of [
            [0.2, 10],
            [0.9, 5],
            [0.78, 40],
        ]) {
            if (r._rockGeologyClass(c[0], c[1]) !== r._rockGeologyClass(c[0], c[1])) detOk = false;
        }
        for (let k = 0; k < 8; k++) {
            const a = r._rockVariantForGeology("aufschluss", k, k * 2, "det-seed");
            const b = r._rockVariantForGeology("aufschluss", k, k * 2, "det-seed");
            if (a !== b) detOk = false;
        }
        out.pass.determinism = detOk;

        // ── (e) HEADLESS = VOLL: die Geologie liest KEINEN Perf-Regler (perf-unabhängig) ──
        const src = r._rockGeologyClass.toString() + r._rockVariantForGeology.toString() + r._rockGeologyScale.toString();
        out.pass.headlessFull =
            out.info.headlessNull && !/_foliageDensityScale|_frameOverBudget|foliageRadius/.test(src);

        // ── BEHAVIORAL: im echten Welt-Raster folgt der Fels-CHARAKTER dem Hang ──
        // Für viele Welt-Positionen: die Nische aus dem ECHTEN _slopeAt + relH, dann die
        // Variante — ihre Form-Klasse muss zur Nische passen (100% Konsistenz).
        const pm = r.state.playerMesh;
        const px0 = pm ? pm.position.x : 0,
            pz0 = pm ? pm.position.z : 0;
        const baseH = (r.state && r.state.terrainBaseHeight) || 0;
        let scanTotal = 0,
            scanConsistent = 0;
        const nicheCount = { findling: 0, talus: 0, aufschluss: 0, none: 0 };
        const SCAN = 70,
            STEP = 11;
        for (let zi = 0; zi < SCAN; zi++) {
            for (let xi = 0; xi < SCAN; xi++) {
                const x = px0 + (xi - SCAN / 2) * STEP,
                    z = pz0 + (zi - SCAN / 2) * STEP;
                const slope = r._slopeAt(x, z);
                if (!Number.isFinite(slope)) continue;
                const surfY = r._voxelSurfaceY(x, z);
                if (surfY == null || !Number.isFinite(surfY)) continue;
                const relH = surfY - baseH;
                const clazz = r._rockGeologyClass(slope, relH);
                if (!clazz) {
                    nicheCount.none++;
                    continue;
                }
                nicheCount[clazz]++;
                const rx = Math.floor(x / 256),
                    rz = Math.floor(z / 256);
                const key = r._rockVariantForGeology(clazz, rx, rz, "world-seed");
                const b = r.state.blueprints[key];
                const want = FORMS[clazz];
                const available = want.some((f) => poolForms[f] > 0);
                if (!available) continue; // Nischen-Form fehlt im Pool → Fallback erlaubt
                scanTotal++;
                if (b && want.includes(b._formClass)) scanConsistent++;
            }
        }
        out.info.nicheCount = nicheCount;
        out.info.scanTotal = scanTotal;
        out.info.scanConsistent = scanConsistent;
        // im echten Welt-Raster kommen ALLE drei Nischen vor (der Hang variiert) + 100% Form-Konsistenz
        out.pass.worldNichesPresent =
            nicheCount.findling > 0 && nicheCount.talus > 0 && nicheCount.aufschluss > 0;
        out.pass.worldFormConsistent = scanTotal === 0 || scanConsistent === scanTotal;

        return out;
    });

    console.log("\n===== STEINE + KRISTALLE NACH GEOLOGIE — MECHANISMUS-MESSUNG =====\n");
    if (pageErr) console.log("PAGE-ERROR:", pageErr);
    const o = report;
    console.log("  Schwellen (|∇h|-Skala):", JSON.stringify(o.info.thresholds));
    console.log("  headless-Null-Renderer:", o.info.headlessNull);
    console.log("\n  (a) SLOPE-GATE (Findling flach · Aufschluss Grat · Talus Fuß):");
    for (const d of o.info.gateDetail) console.log("      " + d);
    console.log("\n  (a2) FORM folgt der Nische — Pool-Formen:", JSON.stringify(o.info.poolForms));
    for (const d of o.info.formDetail) console.log("      " + d);
    console.log("\n  (b) KRISTALL-GEOMETRIE:");
    console.log("      kristall_geode Shapes:", JSON.stringify(o.info.geodeShapes));
    console.log("      kristall_var0  Shapes:", JSON.stringify(o.info.varShapes));
    console.log("      kristall_geode Tags (frozen):", JSON.stringify(o.info.geodeTags), "(erw dichte 1.95 · magie 2.55)");
    console.log("\n  (c) Vielfalt: distinct Findling-Varianten über 21×21 Regionen =", o.info.distinctFindlingVariants);
    console.log("\n  BEHAVIORAL Welt-Raster: Nischen", JSON.stringify(o.info.nicheCount));
    console.log(`      Form-Konsistenz ${o.info.scanConsistent}/${o.info.scanTotal} (erw 100%)`);

    const checks = [
        ["(a) Slope-Gate: Findling flach · Aufschluss Grat · Talus Fuß · Mittelhang kein Fels", o.pass.slopeGate],
        ["(a2) die FORM folgt der geologischen Nische (100% wo Form verfügbar)", o.pass.formFollowsNiche],
        ["(b) Kristalle nutzen crystalPoint (neu), KEINE octahedron (alt); buildCrystalPointGeometry da", o.pass.crystalNewGeometry],
        ["(b) Kristall-Tags frozen (dichte 1.95 · magieleitung 2.55) — tag-neutral", o.pass.crystalTagsFrozen],
        ["(c) Varianten-Vielfalt (≥2 distinct über Regionen)", o.pass.variety],
        ["(d) Determinismus (gleiche Eingabe → gleiche Klasse + Variante)", o.pass.determinism],
        ["(e) headless = voll (Geologie perf-unabhängig, Null-Renderer)", o.pass.headlessFull],
        ["Welt-Raster: alle drei Nischen präsent (Findling+Talus+Aufschluss)", o.pass.worldNichesPresent],
        ["Welt-Raster: 100% Form-Konsistenz (Fels-Charakter folgt dem Hang)", o.pass.worldFormConsistent],
    ];
    console.log("\n  ── ERGEBNIS ──");
    let allOk = !pageErr;
    for (const [label, ok] of checks) {
        console.log(`   ${ok ? "✅" : "❌"} ${label}`);
        if (!ok) allOk = false;
    }

    await browser.close();
    await new Promise((r) => server.close(r));
    console.log("\n" + (allOk ? "STEINE-GEOLOGIE OK" : "STEINE-GEOLOGIE FEHLGESCHLAGEN") + "\n");
    process.exit(allOk ? 0 : 1);
})();

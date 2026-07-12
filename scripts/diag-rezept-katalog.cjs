// diag-rezept-katalog.cjs — W-A1 (DER KATALYSATOR-BOGEN §5): DER REZEPT-KATALOG + DIE
// GENERISCHEN B4-REGLER + DER OV-ROUNDTRIP + DER DONOR-ABSCHIED + DAS EHRLICHE INTERIM.
// Headless (Null-Renderer, foundry-ON; Warm-Anker: f.ready → recipes/paramsByKind →
// !_prefetching, 120-s-Cap). Fuenf Pruef-Familien, jede mit ehrlicher Zahl:
//   (a) f.paramsByKind traegt gate + vehicle (Arrays mit id/min/max; gate zusaetzlich def —
//       vehicle-core PARAMS tragen GEMESSEN kein def-Feld, der Startwert kommt dort aus
//       rec.s[dial]); gate-Laenge == porta-core.PARAMS.length (Node-direkt gelesen).
//   (b) OV-ROUNDTRIP-BEWEIS: porta `drachentor` einmal ohne ov, einmal mit ov am
//       geometrie-wirksamen Dial `mass` (0.7 Rezept → 0.02 Override) → die Positions-
//       Checksummen sind VERSCHIEDEN; und der ov-Request legt KEINEN neuen f.cache-Key an
//       (Welt-Reinheit: die Regler-Vorschau vergiftet nie den Welt-Cache).
//   (c) KATALOG: die „Studio-Rezepte"-Sektion der Werkstatt-Liste enthaelt `gras`; die
//       Alt-Donor-Namen (fahrzeug_wagen · tor_basis) fehlen in der gerenderten Liste
//       (DOM-Abfrage) UND sind ABWESEND in state.blueprints (AUSLÖSCHUNGS-WELLE) —
//       ihre Judge-Substanz lebt eingefroren in AnazhRealm.KIND_SUBSTANCE.
//   (d) REGLER: Auswahl tor_drachentor → Slider-Anzahl == PARAMS-Laenge des porta-Kerns;
//       ein programmatischer ov-Wert treibt die Vorschau (Rebuild feuert, Gruppe non-null).
//   (e) INTERIM: bei kuenstlich kalter Auswahl (Cache-Keys geloescht) zeigt die Vorschau
//       KEINE Part-Meshes des Donors (kein 17-Teile-Wagen) — "pending" + leere Buehne +
//       Status-Text „Studio-Asset lädt…".
//   node scripts/diag-rezept-katalog.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.REZEPT_KATALOG_PORT || 4437);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

(async () => {
    // Node-direkt: die porta-PARAMS-Laenge als unabhaengige Referenz (die IIFE setzt
    // globalThis.__portaCore — derselbe Lade-Pfad wie im Worker, nur ohne Browser).
    require(path.join(root, "porta-core.js"));
    const portaParams =
        globalThis.__portaCore && globalThis.__portaCore.PARAMS_BY_KIND && globalThis.__portaCore.PARAMS_BY_KIND.gate;
    const portaParamsLen = Array.isArray(portaParams) ? portaParams.length : -1;
    console.log("=== W-A1 REZEPT-KATALOG — Node-Referenz ===");
    check("porta-core.PARAMS_BY_KIND.gate ist ein nicht-leeres Array (die EINE B4-Form)", portaParamsLen > 0, `len=${portaParamsLen}`);

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async (portaLen) => {
        const res = { warm: {}, a: {}, b: {}, c: {}, d: {}, e: {} };
        const sleep = (ms) => new Promise((r2) => setTimeout(r2, ms));
        // ===== WARM-ANKER: Boot → f.ready → Buch+paramsByKind → !_prefetching (120-s-Cap) =====
        const dl0 = performance.now() + 120000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r) return { fatal: "anazhRealm kam nie" };
        const f = r._ensureAssetFoundry();
        while (performance.now() < dl0) {
            if (
                f &&
                f.ready &&
                f.recipes &&
                f.recipes.drachentor &&
                f.recipes.gras &&
                f.paramsByKind &&
                f.paramsByKind.gate &&
                !f._prefetching
            )
                break;
            await sleep(120);
        }
        res.warm.ready = !!(f && f.ready);
        res.warm.recipeCount = f && f.recipes ? Object.keys(f.recipes).length : 0;
        res.warm.prefetching = !!(f && f._prefetching);
        if (!f || !f.ready || !f.recipes) return res;

        // ===== (a) paramsByKind: gate + vehicle als Regler-DATEN =====
        const pk = f.paramsByKind || {};
        const rowOk = (d, needDef) =>
            !!d &&
            typeof d.id === "string" &&
            typeof d.min === "number" &&
            typeof d.max === "number" &&
            (!needDef || typeof d.def === "number");
        res.a.gateLen = Array.isArray(pk.gate) ? pk.gate.length : -1;
        res.a.vehicleLen = Array.isArray(pk.vehicle) ? pk.vehicle.length : -1;
        res.a.gateRowsOk = Array.isArray(pk.gate) && pk.gate.every((d) => rowOk(d, true));
        res.a.vehicleRowsOk = Array.isArray(pk.vehicle) && pk.vehicle.every((d) => rowOk(d, false));
        res.a.gateMatchesNode = res.a.gateLen === portaLen;
        res.a.gateHasGrp = Array.isArray(pk.gate) && pk.gate.some((d) => typeof d.grp === "string" && d.grp);
        // ERFINDER-WELLE („blume z.B. keine regler?") — die PFLANZEN-Tabellen reisen
        // (PARAMS_BY_KIND des Primaer-Kerns): flower + grass als Regler-DATEN.
        res.a.flowerLen = Array.isArray(pk.flower) ? pk.flower.length : -1;
        res.a.flowerRowsOk = Array.isArray(pk.flower) && pk.flower.every((d) => rowOk(d, true));
        res.a.grassLen = Array.isArray(pk.grass) ? pk.grass.length : -1;

        // ===== (b) OV-ROUNDTRIP: mass-Override aendert die Geometrie, Cache bleibt rein =====
        const csum = (meshes) => {
            let s = 0,
                n = 0;
            for (const m of meshes || []) {
                const a = m && m.position && m.position.array;
                if (!a) continue;
                n += a.length;
                for (let i = 0; i < a.length; i += 13) s += a[i];
            }
            return { s: Math.round(s * 1000) / 1000, n };
        };
        try {
            const m0 = await Promise.race([r._foundryRequest("drachentor", 7, 0, "summer"), sleep(45000)]);
            // Schluessel-SET vorher (nicht nur die Groesse: Hintergrund-Ticks duerfen fremde
            // Keys anlegen — die Wand ist, dass der OV-Request KEINEN drachentor-Key legt).
            const keysBefore = new Set(f.cache.keys());
            const reqBefore = new Set(f.requested ? Array.from(f.requested) : []);
            const mOv = await Promise.race([
                r._foundryRequest("drachentor", 7, 0, "summer", { mass: 0.02 }),
                sleep(45000),
            ]);
            res.b.meshes0 = Array.isArray(m0) ? m0.length : -1;
            res.b.meshesOv = Array.isArray(mOv) ? mOv.length : -1;
            res.b.sum0 = csum(m0);
            res.b.sumOv = csum(mOv);
            res.b.differ =
                Array.isArray(m0) &&
                Array.isArray(mOv) &&
                (res.b.sum0.s !== res.b.sumOv.s || res.b.sum0.n !== res.b.sumOv.n);
            const addedCache = Array.from(f.cache.keys()).filter((k) => !keysBefore.has(k));
            const addedReq = (f.requested ? Array.from(f.requested) : []).filter((k) => !reqBefore.has(k));
            res.b.cacheKeysAfter = f.cache.size;
            res.b.addedCache = addedCache;
            res.b.cacheClean = addedCache.every((k) => k.indexOf("drachentor|") !== 0);
            res.b.requestedClean = addedReq.every((k) => k.indexOf("drachentor|") !== 0);
            // ERFINDER-WELLE — der ov-Kanal erreicht jetzt auch den PFLANZEN-Pfad
            // (Bruecke reicht msg.ov an foundry-core.buildInstance): die Blume formt.
            const bKeysBefore = new Set(f.cache.keys());
            const b0 = await Promise.race([r._foundryRequest("blume", 3, 0, "summer"), sleep(45000)]);
            const bOv = await Promise.race([
                r._foundryRequest("blume", 3, 0, "summer", { height: 2.2, bloomCount: 9 }),
                sleep(45000),
            ]);
            res.b.blume0 = csum(b0);
            res.b.blumeOv = csum(bOv);
            res.b.blumeDiffer =
                Array.isArray(b0) &&
                Array.isArray(bOv) &&
                (res.b.blume0.s !== res.b.blumeOv.s || res.b.blume0.n !== res.b.blumeOv.n);
            const bAdded = Array.from(f.cache.keys()).filter((k) => !bKeysBefore.has(k));
            // der DEFAULT-Zug darf cachen (Welt-Pfad), der ov-Zug NIE: genau EIN blume-Key.
            res.b.blumeCacheClean = bAdded.filter((k) => k.indexOf("blume|") === 0).length <= 1;
        } catch (e) {
            res.b.err = (e && e.message) || String(e);
        }

        // ===== (c) KATALOG: Studio-Rezepte-Sektion + Donor-Abschied im DOM =====
        try {
            r._renderWorkshopDOM();
            const list = document.getElementById("workshop-list");
            res.c.grasRow = !!(list && list.querySelector('.workshop-studio-recipe-row[data-recipe="gras"]'));
            res.c.recipeRows = list ? list.querySelectorAll(".workshop-studio-recipe-row").length : -1;
            res.c.wagenRow = !!(list && list.querySelector('[data-blueprint="fahrzeug_wagen"]'));
            res.c.torBasisRow = !!(list && list.querySelector('[data-blueprint="tor_basis"]'));
            // AUSLÖSCHUNGS-WELLE: die Alt-Donoren sind ABWESEND, die Substanz-Tabelle traegt sie.
            const KS = r.constructor.KIND_SUBSTANCE || {};
            res.c.wagenAbsent = !(r.state.blueprints && r.state.blueprints.fahrzeug_wagen);
            res.c.torBasisAbsent = !(r.state.blueprints && r.state.blueprints.tor_basis);
            res.c.wagenSubstanzParts =
                KS.fahrzeug_wagen && Array.isArray(KS.fahrzeug_wagen.parts) ? KS.fahrzeug_wagen.parts.length : 0;
            res.c.torSubstanzParts = KS.tor_basis && Array.isArray(KS.tor_basis.parts) ? KS.tor_basis.parts.length : 0;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }

        // ===== (d) REGLER: tor_drachentor → Slider aus der PARAMS-Tabelle + ov treibt die Vorschau =====
        try {
            const ok = r.selectBlueprintForEdit("tor_drachentor");
            res.d.selected = ok === true;
            const panel = document.getElementById("workshop-recipe-panel");
            res.d.panelVisible = !!(panel && !panel.hidden);
            res.d.sliderCount = panel ? panel.querySelectorAll(".workshop-studio-param-row").length : -1;
            // Programmatischer ov: mass ans Maximum → Vorschau-Rebuild mit ov (cache-frei).
            const ws = r._ensureWorkshopState();
            ws.studioOv["drachentor"] = { mass: 1.0 };
            let rebuilds = 0;
            const orig = r._workshopRebuildPreviewMesh.bind(r);
            r._workshopRebuildPreviewMesh = function () {
                rebuilds++;
                return orig();
            };
            let g = r._workshopFoundryPreviewGroup("tor_drachentor");
            const dl = performance.now() + 45000;
            while ((!g || g === "pending") && performance.now() < dl) {
                await sleep(200);
                g = r._workshopFoundryPreviewGroup("tor_drachentor");
            }
            r._workshopRebuildPreviewMesh = orig;
            res.d.rebuilds = rebuilds;
            res.d.groupChildren = g && g !== "pending" && g.children ? g.children.length : 0;
            res.d.cacheStillClean = !Array.from(f.cache.keys()).some((k) => k.indexOf("{") >= 0);
            delete ws.studioOv["drachentor"];
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }

        // ===== (e) INTERIM: kalte Auswahl → pending, KEINE Donor-Part-Meshes =====
        try {
            const ws = r._ensureWorkshopState();
            res.e.gtExists = !!(r.state.blueprints && r.state.blueprints.fahrzeug_gt);
            // Kuenstlich kalt: alle gt-Cache-/Wachen-Keys raus (der naechste Blick zieht neu).
            for (const k of Array.from(f.cache.keys())) if (k.indexOf("gt|") === 0) f.cache.delete(k);
            if (f.requested) for (const k of Array.from(f.requested)) if (k.indexOf("gt|") === 0) f.requested.delete(k);
            const probe = r._workshopFoundryPreviewGroup("fahrzeug_gt");
            res.e.probePending = probe === "pending";
            // Behavioral mit Minimal-Buehne: rebuild lässt die Buehne LEER (kein 17-Teile-Wagen).
            const prevSel = ws.selectedBlueprint;
            const prevRec = ws.selectedRecipe;
            ws.selectedBlueprint = "fahrzeug_gt";
            ws.selectedRecipe = null;
            ws.preview = {
                scene: {
                    add() {},
                    remove() {},
                },
                partMeshes: new Map(),
                origColors: new Map(),
                orbit: { target: { x: 0, y: 0, z: 0 }, dist: 6 },
                dirty: false,
                currentMesh: null,
            };
            r._workshopRebuildPreviewMesh();
            res.e.stageEmpty = ws.preview.currentMesh === null;
            res.e.partMeshCount = ws.preview.partMeshes.size;
            res.e.pendingFlag = r._wsStudioPending === true;
            const statusEl = document.getElementById("workshop-studio-status");
            res.e.statusText = statusEl ? statusEl.textContent : null;
            // Aufraeumen: Buehne + Auswahl zurueck.
            ws.preview = null;
            ws.selectedBlueprint = prevSel;
            ws.selectedRecipe = prevRec;
            r._wsStudioPending = false;
            r._workshopStudioStatusSync();
        } catch (e) {
            res.e.err = (e && e.message) || String(e);
        }
        return res;
    }, portaParamsLen);

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error("FATAL:", out.fatal);
        process.exit(2);
    }
    console.log("\n=== WARM-ANKER ===");
    check(
        "Foundry warm (ready + Buch + !prefetching)",
        out.warm.ready && out.warm.recipeCount > 0 && !out.warm.prefetching,
        `ready=${out.warm.ready} recipes=${out.warm.recipeCount} prefetching=${out.warm.prefetching}`
    );

    console.log("\n=== (a) paramsByKind — die B4-Tabellen reisen ===");
    check("gate-Tabelle da + Zeilen tragen id/min/max/def", out.a.gateRowsOk === true, `len=${out.a.gateLen}`);
    check(
        "vehicle-Tabelle da + Zeilen tragen id/min/max (def ist im vehicle-Kern gemessen absent)",
        out.a.vehicleRowsOk === true && out.a.vehicleLen > 0,
        `len=${out.a.vehicleLen}`
    );
    check(
        "gate-Laenge == porta-core.PARAMS (Node-Referenz)",
        out.a.gateMatchesNode === true,
        `${out.a.gateLen} vs ${portaParamsLen}`
    );
    check("gate-Tabelle traegt grp-Gruppen (Zwischentitel-Daten)", out.a.gateHasGrp === true);
    check(
        "ERFINDER: flower-Tabelle da (5 Zeilen, id/min/max/def) + grass-Tabelle da — die Blume ist regelbar",
        out.a.flowerLen === 5 && out.a.flowerRowsOk === true && out.a.grassLen >= 4,
        `flower=${out.a.flowerLen} grass=${out.a.grassLen}`
    );

    console.log("\n=== (b) ov-Roundtrip — mass-Override wirkt, Cache bleibt rein ===");
    check(
        "beide Requests liefern Meshes (ohne ov / mit ov)",
        out.b.meshes0 > 0 && out.b.meshesOv > 0,
        out.b.err || `m0=${out.b.meshes0} mOv=${out.b.meshesOv}`
    );
    check(
        "Positions-Checksummen VERSCHIEDEN (mass 0.7 Rezept vs 0.02 ov)",
        out.b.differ === true,
        `sum0=${JSON.stringify(out.b.sum0)} sumOv=${JSON.stringify(out.b.sumOv)}`
    );
    check(
        "der ov-Request legt KEINEN neuen f.cache-Key an",
        out.b.cacheClean === true,
        `cache=${out.b.cacheKeysAfter}`
    );
    check("der ov-Request beruehrt die requested-Wache nicht", out.b.requestedClean === true);
    check(
        "ERFINDER: die BLUME formt unter ov (height/bloomCount aendern die Geometrie) + ov cached nie",
        out.b.blumeDiffer === true && out.b.blumeCacheClean === true,
        `b0=${JSON.stringify(out.b.blume0)} bOv=${JSON.stringify(out.b.blumeOv)}`
    );

    console.log("\n=== (c) Katalog — Studio-Rezepte-Sektion + Donor-Abschied ===");
    check(
        "die Studio-Rezepte-Sektion enthaelt `gras`",
        out.c.grasRow === true,
        out.c.err || `rezeptZeilen=${out.c.recipeRows}`
    );
    check("fahrzeug_wagen fehlt in der gerenderten Liste (DOM)", out.c.wagenRow === false);
    check("tor_basis fehlt in der gerenderten Liste (DOM)", out.c.torBasisRow === false);
    check(
        "die Alt-Donoren sind ABWESEND in state.blueprints — die Substanz-Tabelle traegt sie (wagen 17 · tor 4 Parts)",
        out.c.wagenAbsent === true &&
            out.c.torBasisAbsent === true &&
            out.c.wagenSubstanzParts === 17 &&
            out.c.torSubstanzParts === 4,
        `wagenSubstanz=${out.c.wagenSubstanzParts} torSubstanz=${out.c.torSubstanzParts}`
    );

    console.log("\n=== (d) Regler — tor_drachentor: Slider aus DATEN + ov treibt die Vorschau ===");
    check(
        "Slider-Anzahl == PARAMS-Laenge des porta-Kerns",
        out.d.sliderCount === portaParamsLen,
        out.d.err || `${out.d.sliderCount} vs ${portaParamsLen} (panelVisible=${out.d.panelVisible})`
    );
    check(
        "programmatischer ov-Wert treibt die Vorschau (Rebuild feuert, Gruppe non-null)",
        out.d.rebuilds >= 1 && out.d.groupChildren > 0,
        `rebuilds=${out.d.rebuilds} children=${out.d.groupChildren}`
    );
    check("kein ov-Schluessel im Welt-Cache (kein JSON-Key)", out.d.cacheStillClean === true);

    console.log("\n=== (e) Interim — kalte Auswahl zeigt PENDING, nicht den Donor ===");
    check("Auto-Blueprint fahrzeug_gt existiert", out.e.gtExists === true, out.e.err);
    check('kalte Auswahl → `_workshopFoundryPreviewGroup` == "pending"', out.e.probePending === true);
    check(
        "die Buehne bleibt LEER (kein 17-Teile-Wagen: currentMesh null, 0 partMeshes)",
        out.e.stageEmpty === true && out.e.partMeshCount === 0,
        `partMeshes=${out.e.partMeshCount}`
    );
    check(
        'der Status sagt „Studio-Asset lädt…"',
        out.e.pendingFlag === true && /Studio-Asset lädt/.test(out.e.statusText || ""),
        String(out.e.statusText)
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);
    else console.log("  ✅ keine Seiten-Fehler");

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — W-A1 STEHT: die B4-Tabellen reisen als Daten (paramsByKind), der ov-Kanal baut cache-frei eine ANDERE Geometrie, der Katalog zeigt die Studio-Rezepte (gras) und verabschiedet die Donoren, das Interim ist ehrlich (pending statt Wagen-Gestalt)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Rezept-Katalog-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

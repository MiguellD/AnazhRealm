// diag-nervensystem-schmiede.cjs — DER ε-BEWEIS DER WAFFEN-DOMAENE (Katalysator-Bogen
// W-A4a; Nervensystem-Plan TEIL IV Phase ε). Die Klingen-Domaene (schmiede-core.js,
// __schmiedeCore) dockt NUR ueber die Checkliste §ε an: Manifest-Zeile (N2) +
// KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) + fx.place als Rezept-Daten
// (N5.5, mode "hand") — der Stamm bekam KEINEN Logik-Zweig (M8; den strukturellen
// „kein kind-if im AutoRegister"-Wall traegt zusaetzlich das Verfassungs-Gesetz N1 in
// gate:constitution). Gestraffte Schwester zu diag-nervensystem-porta.cjs:
//   S (statisch, Node): Manifest traegt schmiede (ns __schmiedeCore) · KIND_POLICY
//     traegt die weapon-Zeile (prefix klinge_, donor geraet_schwert) · der Auto-
//     Register-Chokepoint laeuft die Tabelle OHNE kind-String-Vergleich ·
//     schmiede-core deklariert kindStages.weapon == [0] · die Rezepte tragen
//     fx.place {mode:"hand"} als DATEN · der Donor geraet_schwert ist ein
//     DATENBLOCK in _defaultBlueprints (kein portalMeta/roleManual — die Rolle
//     EMERGIERT aus den Parts, Omega-PHYSIS ist der Wield-Richter).
//     --selftest injiziert 2 Verletzungen.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 21 Klingen-
//     Rezepte (Waffen UND Werkzeuge) · kindStages.weapon == [0] gemerged (tree/
//     vehicle/gate unberuehrt) · Auto-Blueprint klinge_langschwert entsteht am
//     EINEN Chokepoint (Donor-Klon, KEIN _grownSpecies) · die generische
//     klinge_-Regel loest auf · die Place-Aufloesung liefert mode "hand", der
//     Dispatch streut NICHT + keine klinge_-Wald-Nische ·
//     _foundryRequest("langschwert",7,0) liefert Meshes end-to-end (Mesh-Zahl
//     geloggt; mat.color reist, BuildGroup baut) · die Distanz-Wahl lod=2 klemmt
//     fail-closed auf Stufe 0.
//   node scripts/diag-nervensystem-schmiede.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_SCHMIEDE_PORT || 4433);
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
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren die Muster woertlich).
function stripComments(src) {
    return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}
// Der Methoden-Body per Klammer-Zaehlung (das diag-pipeline-constitution-Muster).
function fnBody(src, sigRe) {
    const m = sigRe.exec(src);
    if (!m) return null;
    let i = src.indexOf("{", m.index);
    if (i < 0) return null;
    let depth = 0;
    const start = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) return src.slice(start, i + 1);
        }
    }
    return null;
}

// ===== TEIL S: die statischen Gesetze =====
function staticLaws(anazhSrc, scSrc, manifestSrc) {
    const anazhNC = stripComments(anazhSrc);
    const scNC = stripComments(scSrc);
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch (_e) {}
    const schmiede = Array.isArray(manifest) ? manifest.find((c) => c && c.id === "schmiede") : null;
    out.push([
        "S1: das Manifest traegt den schmiede-Kern (scripts schmiede-core.js, ns __schmiedeCore)",
        !!schmiede &&
            Array.isArray(schmiede.scripts) &&
            schmiede.scripts.includes("schmiede-core.js") &&
            schmiede.vertrag === "schmiede-core.js" &&
            schmiede.ns === "__schmiedeCore",
    ]);
    out.push([
        "S2: KIND_POLICY traegt die weapon-Zeile (prefix klinge_, donor geraet_schwert — die EINE Daten-Zeile)",
        /weapon:\s*Object\.freeze\(\{\s*prefix:\s*"klinge_",\s*donor:\s*"geraet_schwert"/.test(anazhNC),
    ]);
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\(book\)\s*/);
    out.push([
        "S3: der Auto-Register-Chokepoint laeuft die Policy-Tabelle (kein kind-String-Vergleich, M8 — s. a. gate:constitution N1)",
        autoReg !== null && /KIND_POLICY/.test(autoReg) && !/kind\s*[!=]==?\s*"/.test(autoReg),
    ]);
    out.push([
        "S4: schmiede-core deklariert kindStages.weapon == [0] (B2-Vertrags-Daten)",
        /kindStages:\s*\{\s*weapon:\s*\[0\]\s*\}/.test(scSrc),
    ]);
    out.push([
        'S5: die Klingen-Rezepte tragen das Platzierungs-Gesetz als DATEN (fx.place mode "hand")',
        /place:\s*\{\s*mode:\s*"hand"\s*\}/.test(scNC),
    ]);
    out.push([
        "S6: der Donor geraet_schwert ist ein DATENBLOCK in den Built-ins (kein portalMeta/roleManual — Rolle emergiert aus den Parts)",
        /geraet_schwert:\s*\{\s*name:\s*"geraet_schwert"/.test(anazhNC) &&
            !/geraet_schwert:\s*\{[^}]*portalMeta/.test(anazhNC) &&
            !/geraet_schwert:\s*\{[^}]*roleManual/.test(anazhNC),
    ]);
    return out;
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const scSrc = fs.readFileSync(path.join(root, "schmiede-core.js"), "utf8");
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: die schmiede-Manifest-Zeile entfernt -> S1 muss rot werden.
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "schmiede"));
        const s1 = staticLaws(anazhSrc, scSrc, brokenManifest).find((l) => l[0].startsWith("S1"));
        check("Selbst-Test 1: schmiede-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        // V2: die weapon-Policy-Zeile verstuemmelt -> S2 muss rot werden.
        const brokenPolicy = anazhSrc.replace('donor: "geraet_schwert"', 'donor: "geraet_kaputt"');
        const s2 = staticLaws(brokenPolicy, scSrc, manifestSrc).find((l) => l[0].startsWith("S2"));
        check("Selbst-Test 2: weapon-Policy-Zeile verstuemmelt -> S2 feuert", s2 && s2[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS SCHMIEDE — TEIL S: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, scSrc, manifestSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessSkinResCap = 64;
        window.__anazhForceFoundry = true;
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = { b: {}, d: {}, p: {}, e: {}, f: {} };
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm || typeof window.anazhRealm._ensureAssetFoundry !== "function") &&
            performance.now() < dl0
        )
            await new Promise((r) => setTimeout(r, 100));
        const r = window.anazhRealm;
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        // Worker + Buch + Config abwarten (recipes/render-config folgen dem ready-Handshake).
        const dl = performance.now() + 50000;
        while (performance.now() < dl) {
            const rc = A._studioRenderConfig;
            if (f && f.ready && f.recipes && f.recipes.langschwert && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der N7.5-Merge KOMMEN AN =====
        res.b.kind = f && f.recipes && f.recipes.langschwert ? f.recipes.langschwert.kind : null;
        res.b.griff =
            f && f.recipes && f.recipes.langschwert && f.recipes.langschwert.s ? f.recipes.langschwert.s.griff : null;
        res.b.weaponCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "weapon").length
                : 0;
        res.b.toolCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter(
                      (k) => f.recipes[k] && f.recipes[k].kind === "weapon" && f.recipes[k].fx && f.recipes[k].fx.tool
                  ).length
                : 0;
        res.b.paramsWeapon =
            f && f.paramsByKind && Array.isArray(f.paramsByKind.weapon) ? f.paramsByKind.weapon.length : -1;
        res.b.ksWeapon = ks ? JSON.stringify(ks.weapon) : null;
        res.b.ksTree = ks ? JSON.stringify(ks.tree) : null;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        res.b.ksGate = ks ? JSON.stringify(ks.gate) : null;
        // ===== D: der AUTO-BLUEPRINT (Donor-Klon am EINEN Chokepoint) =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.klinge_langschwert;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.label = bp ? bp.label : null;
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            res.d.builtIn = bp ? !!bp.builtIn : null;
            res.d.donorIntact = !!(r.state.blueprints.geraet_schwert && r.state.blueprints.geraet_schwert.builtIn);
            res.d.presetResolves = r._foundryPresetFor("klinge_langschwert");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "klinge_spitzhacke" });
            // die Werkzeug-Klasse dockt genauso (geraet_spitzhacke-Klasse gedeckt):
            res.d.toolBlueprint = !!(r.state.blueprints && r.state.blueprints.klinge_spitzhacke);
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== P: die PLACE-AUFLOESUNG (N5.5 — hand als Daten, streut nicht) =====
        try {
            const pol = r._placePolicyFor(f.recipes.langschwert);
            res.p.mode = pol.mode;
            res.p.dispatch = r._placeDispatch(pol, { id: "langschwert" });
            r._forestExtraCache = null;
            res.p.inExtras = r._forestExtraSpecies().some((e) => String(e.species).indexOf("klinge_") === 0);
            r._forestExtraCache = null;
        } catch (e) {
            res.p.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst (Worker-Dispatch + mat.color + BuildGroup) =====
        try {
            const meshes = await Promise.race([
                r._foundryRequest("langschwert", 7, 0, "summer"),
                new Promise((res3) => setTimeout(() => res3(null), 30000)),
            ]);
            res.e.meshCount = Array.isArray(meshes) ? meshes.length : -1;
            res.e.hasMatColor =
                Array.isArray(meshes) &&
                meshes.some((m) => m && m.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3);
            if (Array.isArray(meshes) && meshes.length) {
                const g = r._foundryBuildGroup(meshes);
                res.e.groupChildren = g && g.children ? g.children.length : 0;
                res.e.allHaveColor =
                    !!g &&
                    g.children.every((ch) => !!(ch.geometry && ch.geometry.attributes && ch.geometry.attributes.color));
                // Aufraeumen (kein Leak in der Probe):
                if (g)
                    g.traverse((o) => {
                        if (o.isMesh && o.geometry) o.geometry.dispose();
                    });
            }
        } catch (e) {
            res.e.err = (e && e.message) || String(e);
        }
        // ===== F: FAIL-CLOSED behavioral — die Distanz-Wahl 2 klemmt auf Stufe 0 =====
        try {
            if (!f.requested) f.requested = new Set();
            const before = new Set(f.requested);
            r._foundryFlattenFor({ seed: 7 }, "langschwert", 2);
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.key = fresh.find((k) => k.startsWith("langschwert|")) || null;
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt langschwert als kind:weapon (Worker-Draht lebt)",
        out.b.kind === "weapon",
        String(out.b.kind)
    );
    check("B: die Regler-Daten fliessen (langschwert.s.griff == 0.24)", out.b.griff === 0.24, String(out.b.griff));
    check("B: alle 21 Klingen-Gattungen im Buch", out.b.weaponCount === 21, String(out.b.weaponCount));
    check(
        "B: die Werkzeug-Marke reist (8 tool:true — Messer/Faellaxt/Spaltmaul/Vorschlaghammer/Beil/Spitzhacke/Spaten/Schaufel)",
        out.b.toolCount === 8,
        String(out.b.toolCount)
    );
    check(
        "B: die B4-Regler-Tabelle reist (paramsByKind.weapon == 18 Dials, W-A1-Generik)",
        out.b.paramsWeapon === 18,
        String(out.b.paramsWeapon)
    );
    check("B: kindStages.weapon == [0] (N7.5-Merge am Ingest)", out.b.ksWeapon === "[0]", String(out.b.ksWeapon));
    check("B: foundry-core-kinds UNANGETASTET (tree [0,1,2])", out.b.ksTree === "[0,1,2]", String(out.b.ksTree));
    check("B: vehicle-kindStages UNANGETASTET ([0])", out.b.ksVehicle === "[0]", String(out.b.ksVehicle));
    check("B: gate-kindStages UNANGETASTET ([0])", out.b.ksGate === "[0]", String(out.b.ksGate));
    check(
        "D: Auto-Blueprint klinge_langschwert registriert (Donor-Klon)",
        out.d.blueprint === true && out.d.parts >= 2,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == langschwert)", out.d.autoSpecies === "langschwert");
    check(
        "D: KEIN _grownSpecies (eine Klinge ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check("D: das Label reist aus dem Rezept (lab == Langschwert)", out.d.label === "Langschwert", String(out.d.label));
    check("D: builtIn == false (Policy-Zeile; User-Werk-Sicht wie Fahrzeug/Tor)", out.d.builtIn === false);
    check("D: der Donor geraet_schwert bleibt Built-in (unberuehrt)", out.d.donorIntact === true);
    check(
        "D: die Werkzeug-Klasse dockt mit (klinge_spitzhacke registriert — geraet_spitzhacke-Klasse gedeckt)",
        out.d.toolBlueprint === true
    );
    check(
        "D: die generische klinge_-Regel loest auf (klinge_langschwert -> langschwert)",
        out.d.presetResolves === "langschwert",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry, klinge_spitzhacke -> spitzhacke)",
        out.d.entryResolves === "spitzhacke",
        String(out.d.entryResolves)
    );
    check(
        'P: die Place-Aufloesung liest die Rezept-DATEN (mode "hand")',
        out.p.mode === "hand",
        out.p.err || String(out.p.mode)
    );
    check(
        "P: hand streut NICHT (Dispatch null, N5.5 — Spawn/Befehl/Hand statt Worldgen)",
        out.p.dispatch === null,
        String(out.p.dispatch)
    );
    check("P: keine klinge_-Nische in der Wald-Liste", out.p.inExtras === false);
    check(
        "E: der Worker liefert das Klingen-Asset (Meshes > 0)",
        out.e.meshCount > 0,
        out.e.err || `meshes=${out.e.meshCount}`
    );
    console.log(`      ↳ end-to-end Mesh-Zahl langschwert: ${out.e.meshCount}`);
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:weapon auf Stufe 0 (fail-closed [0])",
        /\|0\|/.test(out.f.key || ""),
        out.f.err || String(out.f.key)
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ε-BEWEIS STEHT: die Waffen-/Werkzeug-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — schmiede-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + B4-Regler + Asset), klinge_<id> entsteht am EINEN Chokepoint, hand reist als Daten ohne Streu (N5.5)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("ε-Schmiede-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

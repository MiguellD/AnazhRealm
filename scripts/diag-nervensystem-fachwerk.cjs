// diag-nervensystem-fachwerk.cjs — DER ε-BEWEIS DER HAUS-DOMAENE (Katalysator-Bogen
// W-A5a; Nervensystem-Plan TEIL IV Phase ε). Die Haus-Domaene (fachwerk-core.js,
// __fachwerkCore) dockt NUR ueber die Checkliste §ε an: Manifest-Zeile (N2) +
// KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) + fx.place als Rezept-Daten
// (N5.7, mode "settlement" + siteTag "haus" — der deliberate Kanal, Worldgen streut nicht) —
// der Stamm bekam KEINEN Logik-Zweig (M8). Gestraffte Schwester zu
// diag-nervensystem-schmiede.cjs, PLUS die MEHR-STUFEN-PROBE (die erste Domaene mit
// kindStages [0,1,2] ausserhalb der Baeume — der Flatten-Chokepoint muss die
// Distanz-Wahl auf die DEKLARIERTEN Stufen klemmen statt fail-closed auf [0]):
//   S (statisch, Node): Manifest traegt fachwerk (ns __fachwerkCore) · KIND_POLICY
//     traegt die haus-Zeile (prefix haus_, donor haus_basis) · der Auto-Register-
//     Chokepoint laeuft die Tabelle OHNE kind-String-Vergleich · fachwerk-core
//     deklariert kindStages.haus == [0,1,2] · die Rezepte tragen fx.place
//     {mode:"settlement", siteTag:"haus"} als DATEN · die Donor-SUBSTANZ haus_basis
//     lebt als EINGEFRORENE Zeile in KIND_SUBSTANCE (kein portalMeta/roleManual —
//     die Rolle EMERGIERT; zwei Front-Segmente = die TUER-LUECKE ist KEIN Part,
//     begehbar per Konstruktion; der Alt-Blueprint ist PHYSISCH gefallen —
//     AUSLÖSCHUNGS-WELLE). --selftest injiziert 3 Verletzungen.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 32 Haus-
//     Rezepte (Dial-Drift-Wand: s.W == der Kern-PRESETS-Wert) · kindStages.haus ==
//     [0,1,2] gemerged (tree/vehicle/gate/weapon unberuehrt) · Auto-Blueprint
//     haus_alemannisch entsteht am EINEN Chokepoint (Donor-Klon, KEIN
//     _grownSpecies) · die generische haus_-Regel loest auf · die Place-
//     Aufloesung liefert mode "settlement", der Dispatch benennt den deliberaten Kanal (kein Worldgen-Streuer) + keine
//     haus_-Wald-Nische · _foundryRequest("alemannisch",7,L) liefert Meshes
//     end-to-end fuer ALLE drei Stufen (Mesh-Zahl je Stufe geloggt) · der
//     Flatten-Chokepoint bedient die Distanz-Wahlen 1 und 2 mit den ECHTEN
//     Stufen |1|/|2| (nicht [0]-Kollaps) und faltet die Wahl 5 auf Stufe 2.
//   node scripts/diag-nervensystem-fachwerk.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_FACHWERK_PORT || 4434);
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
function staticLaws(anazhSrc, fcSrc, manifestSrc) {
    const anazhNC = stripComments(anazhSrc);
    const fcNC = stripComments(fcSrc);
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch (_e) {}
    const fachwerk = Array.isArray(manifest) ? manifest.find((c) => c && c.id === "fachwerk") : null;
    out.push([
        "S1: das Manifest traegt den fachwerk-Kern (scripts fachwerk-core.js, ns __fachwerkCore)",
        !!fachwerk &&
            Array.isArray(fachwerk.scripts) &&
            fachwerk.scripts.includes("fachwerk-core.js") &&
            fachwerk.vertrag === "fachwerk-core.js" &&
            fachwerk.ns === "__fachwerkCore",
    ]);
    out.push([
        "S2: KIND_POLICY traegt die haus-Zeile (prefix haus_, donor haus_basis — die EINE Daten-Zeile)",
        /haus:\s*Object\.freeze\(\{\s*prefix:\s*"haus_",\s*donor:\s*"haus_basis"/.test(anazhNC),
    ]);
    // ABSCHIEDS-WELLE (V9.56-i + die V18.440-fnBody-Lehre): die Probe ankert auf der
    // DEFINITIONS-Form (\\(book\\)\\s*\\{) — die CALL-SITE in _foundryIngestRecipes steht
    // im File VOR der Definition und schnitte sonst den falschen Body.
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\(book\)\s*\{/);
    out.push([
        "S3: der Auto-Register-Chokepoint laeuft die Policy-Tabelle (kein kind-String-Vergleich, M8 — s. a. gate:constitution N1)",
        autoReg !== null && /KIND_POLICY/.test(autoReg) && !/kind\s*[!=]==?\s*"/.test(autoReg),
    ]);
    out.push([
        "S4: fachwerk-core deklariert kindStages.haus == [0, 1, 2] (B2-Vertrags-Daten — die Mehr-Stufen-Wahrheit)",
        /kindStages:\s*\{\s*haus:\s*\[0,\s*1,\s*2\]\s*\}/.test(fcSrc),
    ]);
    out.push([
        'S5: die Haus-Rezepte tragen das Platzierungs-Gesetz als DATEN (fx.place mode "settlement" + siteTag "haus" — N5.7, W-A5b)',
        /place:\s*\{\s*mode:\s*"settlement",\s*siteTag:\s*"haus"\s*\}/.test(fcNC),
    ]);
    // AUSLÖSCHUNGS-WELLE: die Donor-Substanz lebt in KIND_SUBSTANCE. ERFINDER-WELLE
    // (Linsen-Heilung, die Trias-Parser-Klasse): die Zeile ist seit einem Prettier-Lauf
    // MEHRZEILIG (unquoted keys) — die Einzeilen-JSON-Regex griff ins Leere (vorbestehend
    // rot, tail-maskiert). Klammer-bewusste Row-Extraktion + SEMANTIK-Pruefung.
    const hausRow = ksRow(anazhNC, "haus_basis");
    out.push([
        "S6: die Donor-SUBSTANZ haus_basis lebt in KIND_SUBSTANCE (kein portalMeta/roleManual; >= 6 Parts — die Tuer-Luecke ist KEIN Part, begehbar per Konstruktion) — der Alt-Blueprint-Block ist GEFALLEN",
        !!hausRow &&
            /label:\s*"Haus"/.test(hausRow) &&
            !/portalMeta/.test(hausRow) &&
            !/roleManual/.test(hausRow) &&
            (hausRow.match(/shape:\s*"box"/g) || []).length >= 6 &&
            !/name:\s*"haus_basis"/.test(hausRow),
    ]);
    return out;
}

// ERFINDER-WELLE — die klammer-bewusste KIND_SUBSTANCE-Row-Extraktion (quote-sicher;
// dieselbe Heilung wie gate:trias kindSubstanceRowSpan).
function ksRow(src, name) {
    const start = src.indexOf("AnazhRealm.KIND_SUBSTANCE = Object.freeze({");
    if (start < 0) return "";
    const end = src.indexOf("\n});", start);
    const k = src.indexOf("\n    " + name + ": ", start);
    if (k < 0 || k > end) return "";
    const i = src.indexOf("{", k);
    let depth = 0;
    let inStr = null;
    for (let j = i; j <= end; j++) {
        const c = src[j];
        if (inStr) {
            if (c === "\\") j++;
            else if (c === inStr) inStr = null;
            continue;
        }
        if (c === '"' || c === "'") inStr = c;
        else if (c === "{") depth++;
        else if (c === "}") {
            depth--;
            if (!depth) return src.slice(i, j + 1);
        }
    }
    return "";
}

(async () => {
    const anazhSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const fcSrc = fs.readFileSync(path.join(root, "fachwerk-core.js"), "utf8");
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: die fachwerk-Manifest-Zeile entfernt -> S1 muss rot werden.
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "fachwerk"));
        const s1 = staticLaws(anazhSrc, fcSrc, brokenManifest).find((l) => l[0].startsWith("S1"));
        check("Selbst-Test 1: fachwerk-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        // V2: die haus-Policy-Zeile verstuemmelt -> S2 muss rot werden.
        const brokenPolicy = anazhSrc.replace('donor: "haus_basis"', 'donor: "haus_kaputt"');
        const s2 = staticLaws(brokenPolicy, fcSrc, manifestSrc).find((l) => l[0].startsWith("S2"));
        check("Selbst-Test 2: haus-Policy-Zeile verstuemmelt -> S2 feuert", s2 && s2[1] === false);
        // V3: die Stufen-Deklaration kollabiert -> S4 muss rot werden (die Mehr-Stufen-Wand).
        const brokenStages = fcSrc.replace("kindStages: { haus: [0, 1, 2] }", "kindStages: { haus: [0] }");
        const s4 = staticLaws(anazhSrc, brokenStages, manifestSrc).find((l) => l[0].startsWith("S4"));
        check("Selbst-Test 3: kindStages.haus auf [0] kollabiert -> S4 feuert", s4 && s4[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf alle drei Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS FACHWERK — TEIL S: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, fcSrc, manifestSrc)) check(name, ok, detail);

    // Die Kern-Wahrheit fuer die Dial-Drift-Wand (Buch == Kern): PRESETS in Node ableiten.
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FCn = globalThis.__fachwerkCore;
    const kernAlemannischW = FCn.PRESETS.alemannisch.s.W;
    const kernParamsRows = FCn.PARAMS_BY_KIND.haus.length;

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
            if (f && f.ready && f.recipes && f.recipes.alemannisch && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der N7.5-Merge KOMMEN AN =====
        res.b.kind = f && f.recipes && f.recipes.alemannisch ? f.recipes.alemannisch.kind : null;
        res.b.sW =
            f && f.recipes && f.recipes.alemannisch && f.recipes.alemannisch.s ? f.recipes.alemannisch.s.W : null;
        res.b.stil =
            f && f.recipes && f.recipes.alemannisch && f.recipes.alemannisch.fx ? f.recipes.alemannisch.fx.stil : null;
        res.b.hausCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "haus").length
                : 0;
        res.b.paramsHaus = f && f.paramsByKind && Array.isArray(f.paramsByKind.haus) ? f.paramsByKind.haus.length : -1;
        res.b.ksHaus = ks ? JSON.stringify(ks.haus) : null;
        res.b.ksTree = ks ? JSON.stringify(ks.tree) : null;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        res.b.ksGate = ks ? JSON.stringify(ks.gate) : null;
        res.b.ksWeapon = ks ? JSON.stringify(ks.weapon) : null;
        // ===== D: der AUTO-BLUEPRINT (Donor-Klon am EINEN Chokepoint) =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.haus_alemannisch;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.label = bp ? bp.label : null;
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            res.d.builtIn = bp ? !!bp.builtIn : null;
            // AUSLÖSCHUNGS-WELLE — die neue Donor-Wahrheit: der Alt-Name ist ABWESEND,
            // die Substanz lebt in KIND_SUBSTANCE, der Klon traegt byte-gleiche Parts.
            const KS = r.constructor.KIND_SUBSTANCE || {};
            res.d.donorAbsent = !(r.state.blueprints && r.state.blueprints.haus_basis);
            res.d.substanzParts = KS.haus_basis && Array.isArray(KS.haus_basis.parts) ? KS.haus_basis.parts.length : 0;
            res.d.clonePartsMatch =
                !!bp && !!KS.haus_basis && JSON.stringify(bp.parts) === JSON.stringify(KS.haus_basis.parts);
            res.d.hochhaus = !!(r.state.blueprints && r.state.blueprints.haus_hochhaus);
            res.d.presetResolves = r._foundryPresetFor("haus_alemannisch");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "haus_hanseatisch" });
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== P: die PLACE-AUFLOESUNG (N5.7 — settlement als benannter DELIBERATER Kanal, Worldgen streut nicht) =====
        try {
            const pol = r._placePolicyFor(f.recipes.alemannisch);
            res.p.mode = pol.mode;
            res.p.siteTag = pol.siteTag;
            res.p.dispatch = r._placeDispatch(pol, { id: "alemannisch" });
            r._forestExtraCache = null;
            res.p.inExtras = r._forestExtraSpecies().some((e) => String(e.species).indexOf("haus_") === 0);
            r._forestExtraCache = null;
        } catch (e) {
            res.p.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst — ALLE DREI STUFEN end-to-end (Worker-Dispatch + BuildGroup) =====
        try {
            res.e.meshCount = {};
            for (const L of [0, 1, 2]) {
                const meshes = await Promise.race([
                    r._foundryRequest("alemannisch", 7, L, "summer"),
                    new Promise((res3) => setTimeout(() => res3(null), 45000)),
                ]);
                res.e.meshCount[L] = Array.isArray(meshes) ? meshes.length : -1;
                if (L === 0 && Array.isArray(meshes) && meshes.length) {
                    res.e.hasMatColor = meshes.some(
                        (m) => m && m.mat && Array.isArray(m.mat.color) && m.mat.color.length === 3
                    );
                    const g = r._foundryBuildGroup(meshes);
                    res.e.groupChildren = g && g.children ? g.children.length : 0;
                    res.e.allHaveColor =
                        !!g &&
                        g.children.every(
                            (ch) => !!(ch.geometry && ch.geometry.attributes && ch.geometry.attributes.color)
                        );
                    if (g)
                        g.traverse((o) => {
                            if (o.isMesh && o.geometry) o.geometry.dispose();
                        });
                }
            }
        } catch (e) {
            res.e.err = (e && e.message) || String(e);
        }
        // ===== F: DIE MEHR-STUFEN-KLEMME am Flatten-Chokepoint (kindStages [0,1,2] LEBT) =====
        // Ohne den N7.5-Merge klemmte ein bekanntes Rezept fail-closed auf [0].
        // ABSCHIEDS-WELLE (lodServe, V9.56-i — der Test wandert mit dem Entscheid): die
        // haus-Policy mappt den Stufen-WUNSCH 1 auf die Fernstufe 2 (KIND_POLICY.haus.
        // lodServe {1:2} — L1 75k ~ L0 88k, der Mittel-Ring spart gemessen kaum). Also:
        // Wahl 2 fragt |2| frisch an; Wahl 1 fragt DENSELBEN |2|-Key (kein frischer Key =
        // der lodServe-Beweis, kein [0]-Kollaps); Wahl 5 faltet die lod>2-Klemme auf |2|;
        // Wahl 0 bleibt die feine |0| (die Stufen-Existenz [0,1,2] beweist gate:trias N/B).
        try {
            if (!f.requested) f.requested = new Set();
            const probe = (preset, lodWahl) => {
                const before = new Set(f.requested);
                r._foundryFlattenFor({ seed: 11 }, preset, lodWahl);
                const fresh = Array.from(f.requested).filter((k) => !before.has(k));
                return fresh.find((k) => k.startsWith(preset + "|")) || null;
            };
            res.f.k2 = probe("hanseatisch", 2);
            res.f.k1 = probe("hanseatisch", 1);
            res.f.k5 = probe("japanisch", 5);
            res.f.k0 = probe("japanisch", 0);
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt alemannisch als kind:haus (Worker-Draht lebt)",
        out.b.kind === "haus",
        String(out.b.kind)
    );
    check(
        `B: die Dial-Drift-Wand haelt (Buch s.W == Kern-PRESETS ${kernAlemannischW})`,
        out.b.sW === kernAlemannischW,
        String(out.b.sW)
    );
    check('B: die fx-Strings reisen (alemannisch.fx.stil == "alt")', out.b.stil === "alt", String(out.b.stil));
    check("B: alle 32 Haus-Kulturen im Buch", out.b.hausCount === 32, String(out.b.hausCount));
    check(
        `B: die B4-Regler-Tabelle reist (paramsByKind.haus == ${kernParamsRows} Dials, W-A1-Generik)`,
        out.b.paramsHaus === kernParamsRows,
        String(out.b.paramsHaus)
    );
    check(
        "B: kindStages.haus == [0,1,2] (N7.5-Merge am Ingest — die erste Mehr-Stufen-Domaene)",
        out.b.ksHaus === "[0,1,2]",
        String(out.b.ksHaus)
    );
    check("B: foundry-core-kinds UNANGETASTET (tree [0,1,2])", out.b.ksTree === "[0,1,2]", String(out.b.ksTree));
    check("B: vehicle-kindStages UNANGETASTET ([0])", out.b.ksVehicle === "[0]", String(out.b.ksVehicle));
    check("B: gate-kindStages UNANGETASTET ([0])", out.b.ksGate === "[0]", String(out.b.ksGate));
    check("B: weapon-kindStages UNANGETASTET ([0])", out.b.ksWeapon === "[0]", String(out.b.ksWeapon));
    check(
        "D: Auto-Blueprint haus_alemannisch registriert (Donor-Klon, 6 begehbare Judge-Parts)",
        out.d.blueprint === true && out.d.parts === 6,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == alemannisch)", out.d.autoSpecies === "alemannisch");
    check(
        "D: KEIN _grownSpecies (ein Haus ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check(
        "D: das Label reist aus dem Rezept (lab der Kultur-Wahl)",
        out.d.label === "Alemannisch · steil, hell",
        String(out.d.label)
    );
    check("D: builtIn == false (Policy-Zeile; User-Werk-Sicht wie Fahrzeug/Tor/Klinge)", out.d.builtIn === false);
    check(
        "D: der Alt-Donor haus_basis ist ABWESEND (state.blueprints) — die Substanz lebt in KIND_SUBSTANCE (6 Parts)",
        out.d.donorAbsent === true && out.d.substanzParts === 6,
        `substanzParts=${out.d.substanzParts}`
    );
    check(
        "D: der Auto-Klon traegt die Substanz byte-gleich (haus_alemannisch.parts == KIND_SUBSTANCE.haus_basis.parts)",
        out.d.clonePartsMatch === true
    );
    check("D: auch der Glasturm dockt (haus_hochhaus registriert)", out.d.hochhaus === true);
    check(
        "D: die generische haus_-Regel loest auf (haus_alemannisch -> alemannisch)",
        out.d.presetResolves === "alemannisch",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry, haus_hanseatisch -> hanseatisch)",
        out.d.entryResolves === "hanseatisch",
        String(out.d.entryResolves)
    );
    check(
        'P: die Place-Aufloesung liest die Rezept-DATEN (mode "settlement", siteTag "haus" — N5.7)',
        out.p.mode === "settlement" && out.p.siteTag === "haus",
        out.p.err || `${out.p.mode}/${out.p.siteTag}`
    );
    check(
        'P: settlement ist der benannte DELIBERATE Kanal (Dispatch "settlement" — Konsument spawnSettlement, kein Worldgen-Streu-Leser)',
        out.p.dispatch === "settlement",
        String(out.p.dispatch)
    );
    check("P: keine haus_-Nische in der Wald-Liste", out.p.inExtras === false);
    check(
        "E: der Worker liefert das Haus-Asset auf ALLEN drei Stufen (Meshes > 0 je Stufe)",
        out.e.meshCount && out.e.meshCount[0] > 0 && out.e.meshCount[1] > 0 && out.e.meshCount[2] > 0,
        out.e.err || JSON.stringify(out.e.meshCount)
    );
    console.log(
        `      ↳ end-to-end Mesh-Zahl alemannisch je Stufe: L0=${out.e.meshCount && out.e.meshCount[0]} · L1=${out.e.meshCount && out.e.meshCount[1]} · L2=${out.e.meshCount && out.e.meshCount[2]}`
    );
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 wird mit der ECHTEN Stufe |2| bedient (kein [0]-Kollaps — der Merge lebt)",
        /\|2\|/.test(out.f.k2 || ""),
        out.f.err || String(out.f.k2)
    );
    check(
        "F (Abschieds-Welle): die Wahl 1 mappt lodServe auf die schon angefragte Fernstufe |2| (kein frischer Key)",
        out.f.k1 === null,
        String(out.f.k1)
    );
    check(
        "F: die Wahl 5 faltet der Chokepoint auf Stufe 2 (lod>2-Klemme)",
        /\|2\|/.test(out.f.k5 || ""),
        String(out.f.k5)
    );
    check("F: die Wahl 0 bleibt die feine Stufe |0|", /\|0\|/.test(out.f.k0 || ""), String(out.f.k0));
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ε-BEWEIS STEHT: die Haus-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + begehbarer Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — fachwerk-core reist durch den EINEN Foundry-Worker (32 Rezepte + kindStages [0,1,2] + B4-Regler + Asset auf allen drei Stufen), haus_<id> entsteht am EINEN Chokepoint, settlement reist als Daten (N5.7, deliberater Kanal ohne Worldgen-Streu), und der Flatten-Chokepoint bedient die Mehr-Stufen-Wahrheit der ersten Nicht-Baum-Domaene mit echten Stufen."
    );
    process.exit(0);
})().catch((e) => {
    console.error("ε-Fachwerk-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

// diag-nervensystem-porta.cjs — DER ε-BEWEIS (Nervensystem-Plan TEIL VIII Punkt 4).
// Die Tor-Domaene (porta-core.js, __portaCore) dockt NUR ueber die Checkliste §ε an:
// Manifest-Zeile (N2) + KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) +
// fx.place als Rezept-Daten (N5.6) — der Stamm bekam KEINEN Logik-Zweig (M8;
// den strukturellen „kein kind-if im AutoRegister"-Wall traegt zusaetzlich das
// Verfassungs-Gesetz N1 in gate:constitution). Gestraffte Schwester zu
// diag-nervensystem-vehicle.cjs:
//   S (statisch, Node): Manifest traegt porta (ns __portaCore) · KIND_POLICY
//     traegt die gate-Zeile (prefix tor_, donor tor_basis) · der Auto-Register-
//     Chokepoint laeuft die Tabelle OHNE kind-String-Vergleich · porta-core
//     deklariert kindStages.gate == [0] · die Rezepte tragen fx.place
//     {mode:"site", siteTag:"tor"} als DATEN · die Donor-SUBSTANZ tor_basis
//     lebt als EINGEFRORENE Zeile in KIND_SUBSTANCE (der Alt-Blueprint ist
//     PHYSISCH gefallen — AUSLÖSCHUNGS-WELLE). --selftest injiziert 2 Verletzungen.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 7 Tor-
//     Rezepte · kindStages.gate == [0] gemerged (foundry-core-kinds unberuehrt) ·
//     Auto-Blueprint tor_drachentor entsteht am EINEN Chokepoint (Donor-Klon,
//     KEIN _grownSpecies) · die generische tor_-Regel loest auf · die Place-
//     Aufloesung liefert mode "site" + siteTag "tor", der Dispatch streut NICHT
//     (N5.6) + keine tor_-Wald-Nische · _foundryRequest("drachentor",7,0)
//     liefert Meshes end-to-end (mat.color reist, BuildGroup baut) · die
//     Distanz-Wahl lod=2 klemmt fail-closed auf Stufe 0.
//   node scripts/diag-nervensystem-porta.cjs [--selftest]
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.NERV_PORTA_PORT || 4431);
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
function staticLaws(anazhSrc, pcSrc, manifestSrc) {
    const anazhNC = stripComments(anazhSrc);
    const pcNC = stripComments(pcSrc);
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch (_e) {}
    const porta = Array.isArray(manifest) ? manifest.find((c) => c && c.id === "porta") : null;
    out.push([
        "S1: das Manifest traegt den porta-Kern (scripts porta-core.js, ns __portaCore)",
        !!porta &&
            Array.isArray(porta.scripts) &&
            porta.scripts.includes("porta-core.js") &&
            porta.vertrag === "porta-core.js" &&
            porta.ns === "__portaCore",
    ]);
    out.push([
        "S2: KIND_POLICY traegt die gate-Zeile (prefix tor_, donor tor_basis — die EINE Daten-Zeile)",
        /gate:\s*Object\.freeze\(\{\s*prefix:\s*"tor_",\s*donor:\s*"tor_basis"/.test(anazhNC),
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
        "S4: porta-core deklariert kindStages.gate == [0] (B2-Vertrags-Daten)",
        /kindStages:\s*\{\s*gate:\s*\[0\]\s*\}/.test(pcSrc),
    ]);
    out.push([
        "S5: die Tor-Rezepte tragen das Platzierungs-Gesetz als DATEN (fx.place mode site + siteTag tor)",
        /place:\s*\{\s*mode:\s*"site",\s*siteTag:\s*"tor"\s*\}/.test(pcNC),
    ]);
    // ERFINDER-WELLE (Linsen-Heilung, die Trias-Parser-Klasse): die Substanz-Zeile ist
    // seit einem Prettier-Lauf MEHRZEILIG (unquoted keys) — die Einzeilen-JSON-Regex
    // griff ins Leere (vorbestehend rot, tail-maskiert). Klammer-bewusste, quote-
    // sichere Row-Extraktion; geprueft wird die SEMANTIK (label · parts · keine
    // Blueprint-Felder), nicht das Format.
    const torRow = ksRow(anazhNC, "tor_basis");
    out.push([
        "S6: die Donor-SUBSTANZ tor_basis lebt in KIND_SUBSTANCE (label Torbogen, parts, kein portalMeta) — der Alt-Blueprint-Block ist GEFALLEN (AUSLÖSCHUNGS-WELLE)",
        /KIND_SUBSTANCE = Object\.freeze\(\{/.test(anazhNC) &&
            /label:\s*"Torbogen"/.test(torRow) &&
            /parts:\s*\[/.test(torRow) &&
            /shape/.test(torRow) &&
            !/name:\s*"tor_basis"/.test(torRow) &&
            !/portalMeta/.test(torRow),
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
    const pcSrc = fs.readFileSync(path.join(root, "porta-core.js"), "utf8");
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: die porta-Manifest-Zeile entfernt -> S1 muss rot werden.
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "porta"));
        const s1 = staticLaws(anazhSrc, pcSrc, brokenManifest).find((l) => l[0].startsWith("S1"));
        check("Selbst-Test 1: porta-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        // V2: die gate-Policy-Zeile verstuemmelt -> S2 muss rot werden.
        const brokenPolicy = anazhSrc.replace('donor: "tor_basis"', 'donor: "tor_kaputt"');
        const s2 = staticLaws(brokenPolicy, pcSrc, manifestSrc).find((l) => l[0].startsWith("S2"));
        check("Selbst-Test 2: gate-Policy-Zeile verstuemmelt -> S2 feuert", s2 && s2[1] === false);
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf beide Verletzungs-Klassen.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS PORTA — TEIL S: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc, pcSrc, manifestSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
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
            if (f && f.ready && f.recipes && f.recipes.drachentor && rc && rc.lod && rc.lod.kindStages) break;
            await new Promise((res2) => setTimeout(res2, 80));
        }
        const rc = A._studioRenderConfig;
        const ks = rc && rc.lod ? rc.lod.kindStages : null;
        // ===== B: das Buch + der N7.5-Merge KOMMEN AN =====
        res.b.kind = f && f.recipes && f.recipes.drachentor ? f.recipes.drachentor.kind : null;
        res.b.orders =
            f && f.recipes && f.recipes.drachentor && f.recipes.drachentor.s ? f.recipes.drachentor.s.orders : null;
        res.b.gateCount =
            f && f.recipes
                ? Object.keys(f.recipes).filter((k) => f.recipes[k] && f.recipes[k].kind === "gate").length
                : 0;
        res.b.ksGate = ks ? JSON.stringify(ks.gate) : null;
        res.b.ksTree = ks ? JSON.stringify(ks.tree) : null;
        res.b.ksVehicle = ks ? JSON.stringify(ks.vehicle) : null;
        // ===== D: der AUTO-BLUEPRINT (Donor-Klon am EINEN Chokepoint) =====
        try {
            const bp = r.state.blueprints && r.state.blueprints.tor_drachentor;
            res.d.blueprint = !!bp;
            res.d.autoSpecies = bp ? bp._foundryAutoSpecies : null;
            res.d.grownSpecies = bp ? bp._grownSpecies || null : "kein-bp";
            res.d.label = bp ? bp.label : null;
            res.d.parts = bp && Array.isArray(bp.parts) ? bp.parts.length : 0;
            // AUSLÖSCHUNGS-WELLE — die neue Donor-Wahrheit: der Alt-Name ist ABWESEND,
            // die Substanz lebt in KIND_SUBSTANCE, der Klon traegt byte-gleiche Parts.
            const KS = r.constructor.KIND_SUBSTANCE || {};
            res.d.donorAbsent = !(r.state.blueprints && r.state.blueprints.tor_basis);
            res.d.substanzParts = KS.tor_basis && Array.isArray(KS.tor_basis.parts) ? KS.tor_basis.parts.length : 0;
            res.d.clonePartsMatch =
                !!bp && !!KS.tor_basis && JSON.stringify(bp.parts) === JSON.stringify(KS.tor_basis.parts);
            res.d.presetResolves = r._foundryPresetFor("tor_drachentor");
            res.d.entryResolves = r._foundryPresetForEntry({ type: "tor_drachentor" });
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // ===== P: die PLACE-AUFLOESUNG (N5.6 — site als Daten, streut nicht) =====
        try {
            const pol = r._placePolicyFor(f.recipes.drachentor);
            res.p.mode = pol.mode;
            res.p.siteTag = pol.siteTag;
            res.p.dispatch = r._placeDispatch(pol, { id: "drachentor" });
            r._forestExtraCache = null;
            res.p.inExtras = r._forestExtraSpecies().some((e) => String(e.species).indexOf("tor_") === 0);
            r._forestExtraCache = null;
        } catch (e) {
            res.p.err = (e && e.message) || String(e);
        }
        // ===== E: das ASSET selbst (Worker-Dispatch + mat.color + BuildGroup) =====
        try {
            const meshes = await Promise.race([
                r._foundryRequest("drachentor", 7, 0, "summer"),
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
            r._foundryFlattenFor({ seed: 7 }, "drachentor", 2);
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.key = fresh.find((k) => k.startsWith("drachentor|")) || null;
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt drachentor als kind:gate (Worker-Draht lebt)",
        out.b.kind === "gate",
        String(out.b.kind)
    );
    check("B: die Regler-Daten fliessen (drachentor.s.orders == 2)", out.b.orders === 2, String(out.b.orders));
    check("B: alle 7 Tor-Ordnungen im Buch", out.b.gateCount === 7, String(out.b.gateCount));
    check("B: kindStages.gate == [0] (N7.5-Merge am Ingest)", out.b.ksGate === "[0]", String(out.b.ksGate));
    check("B: foundry-core-kinds UNANGETASTET (tree [0,1,2])", out.b.ksTree === "[0,1,2]", String(out.b.ksTree));
    check("B: vehicle-kindStages UNANGETASTET ([0])", out.b.ksVehicle === "[0]", String(out.b.ksVehicle));
    check(
        "D: Auto-Blueprint tor_drachentor registriert (Donor-Klon)",
        out.d.blueprint === true && out.d.parts >= 4,
        out.d.err || `parts=${out.d.parts}`
    );
    check("D: die Herkunfts-Marke sitzt (_foundryAutoSpecies == drachentor)", out.d.autoSpecies === "drachentor");
    check(
        "D: KEIN _grownSpecies (ein Tor ist keine gewachsene Art)",
        out.d.grownSpecies === null,
        String(out.d.grownSpecies)
    );
    check("D: das Label reist aus dem Rezept (lab == Drachentor)", out.d.label === "Drachentor", String(out.d.label));
    check(
        "D: der Alt-Donor tor_basis ist ABWESEND (state.blueprints) — die Substanz lebt in KIND_SUBSTANCE (4 Parts)",
        out.d.donorAbsent === true && out.d.substanzParts === 4,
        `substanzParts=${out.d.substanzParts}`
    );
    check(
        "D: der Auto-Klon traegt die Substanz byte-gleich (tor_drachentor.parts == KIND_SUBSTANCE.tor_basis.parts)",
        out.d.clonePartsMatch === true
    );
    check(
        "D: die generische tor_-Regel loest auf (tor_drachentor -> drachentor)",
        out.d.presetResolves === "drachentor",
        String(out.d.presetResolves)
    );
    check(
        "D: der Entry-Pfad loest auf (_foundryPresetForEntry)",
        out.d.entryResolves === "drachentor",
        String(out.d.entryResolves)
    );
    check(
        'P: die Place-Aufloesung liest die Rezept-DATEN (mode "site" + siteTag "tor")',
        out.p.mode === "site" && out.p.siteTag === "tor",
        out.p.err || `${out.p.mode}/${out.p.siteTag}`
    );
    check(
        "P: site streut NICHT (Dispatch null, N5.6 — die Welt-Nische ist der benannte Folge-Anschluss)",
        out.p.dispatch === null,
        String(out.p.dispatch)
    );
    check("P: keine tor_-Nische in der Wald-Liste", out.p.inExtras === false);
    check(
        "E: der Worker liefert das Tor-Asset (Meshes > 0)",
        out.e.meshCount > 0,
        out.e.err || `meshes=${out.e.meshCount}`
    );
    check("E: die Material-Farbe reist mit (mat.color)", out.e.hasMatColor === true);
    check("E: _foundryBuildGroup baut die Gruppe (Kinder > 0)", out.e.groupChildren > 0, String(out.e.groupChildren));
    check("E: jedes Kind traegt das color-Attribut (WebGPU-STRIKT-Fill)", out.e.allHaveColor === true);
    check(
        "F: die Distanz-Wahl 2 klemmt fuer kind:gate auf Stufe 0 (fail-closed [0])",
        /\|0\|/.test(out.f.key || ""),
        out.f.err || String(out.f.key)
    );
    if (pageErrors.length) check("keine Seiten-Fehler", false, pageErrors[0]);

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER ε-BEWEIS STEHT: die Tor-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — porta-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + Asset), tor_<id> entsteht am EINEN Chokepoint, site reist als Daten ohne Streu (N5.6)."
    );
    process.exit(0);
})().catch((e) => {
    console.error("ε-Porta-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

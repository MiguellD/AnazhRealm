// diag-nervensystem-porta.cjs — DER ε-BEWEIS (Nervensystem-Plan TEIL VIII Punkt 4).
// Die Tor-Domaene (porta-core.js, __portaCore) dockt NUR ueber die Checkliste §ε an:
// Manifest-Zeile (N2) + KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) +
// fx.place als Rezept-Daten (N5.6) — der Stamm bekam KEINEN Logik-Zweig (M8;
// den strukturellen „kein kind-if im AutoRegister"-Wall traegt zusaetzlich das
// Verfassungs-Gesetz N1 in gate:constitution). Gestraffte Schwester zu
// diag-nervensystem-vehicle.cjs:
//   S (statisch, Node, Absenzen): der Auto-Register-Chokepoint vergleicht keinen kind-String (M8) · die
//     Donor-Zeile tor_basis traegt kein portalMeta (der Alt-Blueprint ist PHYSISCH gefallen). Die Kette
//     kindStages.gate beweist gate:porta-contract an der lod-Klemme. --selftest: die kern-stufen-Linse.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 7 Tor-
//     Rezepte · der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (scripts/lib/kern-stufen.cjs) ·
//     Auto-Blueprint tor_drachentor entsteht am EINEN Chokepoint (Donor-Klon,
//     KEIN _grownSpecies) · die generische tor_-Regel loest auf · die Place-
//     Aufloesung liefert mode "site" + siteTag "tor", der Dispatch streut NICHT
//     (N5.6) + keine tor_-Wald-Nische · _foundryRequest("drachentor",7,0)
//     liefert Meshes end-to-end (mat.color reist, BuildGroup baut) · die
//     Distanz-Wahl lod=2 klemmt auf die groesste deklarierte Stufe ≤ 2.
//   node scripts/diag-nervensystem-porta.cjs [--selftest]
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_PORTA_PORT || 4431);
const root = path.resolve(__dirname, "..");
const server = statikServer();

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
// Kommentare strippen (die V18.267-Falle: erklaerende Kommentare zitieren die Muster woertlich).
const stripComments = stammLib.ohneKommentare;
// Der Methoden-Body per Klammer-Zaehlung (das diag-pipeline-constitution-Muster).
// der EINE Rumpf-Schneider (scripts/lib/stamm.cjs): der Block an der Definition, nie am ersten Text-Treffer
function fnBody(src, kopf) {
    return stammLib.rumpf(src, kopf);
}

// ===== TEIL S: die statischen Gesetze =====
function staticLaws(anazhSrc) {
    const anazhNC = stripComments(anazhSrc);
    const out = [];
    // S3 (Absenz, M8): im Auto-Register-Chokepoint steht kein kind-String-Vergleich — die Wirkung der Policy beweist Teil D.
    const autoReg = fnBody(anazhNC, /_foundryAutoRegisterSpecies\([^)]*\)\s*\{/);
    out.push([
        "S3: der Auto-Register-Chokepoint vergleicht keinen kind-String (M8 — s. a. gate:constitution N1)",
        autoReg !== null && !/kind\s*[!=]==?\s*"/.test(autoReg),
    ]);
    // S6 (Absenz): die Donor-Zeile tor_basis trägt keinen Blueprint-Namen und kein portalMeta; Teile und Klon prüft Teil D.
    const torRow = ksRow(anazhNC, "tor_basis");
    out.push([
        "S6: die Donor-SUBSTANZ tor_basis trägt kein portalMeta — der Alt-Blueprint-Block ist GEFALLEN (AUSLÖSCHUNGS-WELLE)",
        !!torRow && !/name:\s*"tor_basis"/.test(torRow) && !/portalMeta/.test(torRow),
    ]);
    return out;
}

// ERFINDER-WELLE — die Zeile der KIND_SUBSTANCE: der EINE Rumpf-Schneider (scripts/lib/stamm.cjs), quote-sicher.
function ksRow(src, name) {
    const tafel = stammLib.rumpf(src, /AnazhRealm\.KIND_SUBSTANCE = Object\.freeze\(\{/, { zitate: true });
    const zeile = new RegExp(`\\n {4}${name}: [^{\\n]*\\{`);
    return (tafel && stammLib.rumpf(tafel, zeile, { zitate: true })) || "";
}

(async () => {
    const anazhSrc = stammLib.text(root);

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V4: ein Buch mit abgeschriebener Stufen-Liste -> der Merge-Vergleich nennt die Art.
        check("Selbst-Test 4: eine abgeschriebene Stufen-Liste faellt beim Namen (kern-stufen)", kernStufen.selbsttest());
        if (errs.length) {
            console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuoes.");
            process.exit(1);
        }
        console.log("\n✅ SELBST-TEST GRUEN — die Linse feuert auf die abgeschriebene Stufen-Liste.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS PORTA — TEIL S: die statischen Absenzen (Node) ===");
    for (const [name, ok, detail] of staticLaws(anazhSrc)) check(name, ok, detail);

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 180000 });
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
        res.b.ks = ks ? JSON.parse(JSON.stringify(ks)) : null;
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
                r._foundryRequest("drachentor", 7, 0),
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
    // Die Erwartung der Stufen: die Kerne in der Seite (dieselben Dateien wie der Worker), nie eine Abschrift (K64).
    const kern = await page.evaluate(kernStufen.seitenStufen, kernStufen.kernRaeume());

    await browser.close();
    server.close();

    check(
        "B: das LIVE-Buch traegt drachentor als kind:gate (Worker-Draht lebt)",
        out.b.kind === "gate",
        String(out.b.kind)
    );
    check("B: die Regler-Daten fliessen (drachentor.s.orders == 2)", out.b.orders === 2, String(out.b.orders));
    check("B: alle 7 Tor-Ordnungen im Buch", out.b.gateCount === 7, String(out.b.gateCount));
    const ksGate = out.b.ks ? JSON.stringify(out.b.ks.gate) : "fehlt";
    check(
        "B: kindStages.gate == die Deklaration von porta-core (N7.5-Merge am Ingest; 3 = NUR-WURF)",
        ksGate === kern.gate,
        `${ksGate} (Kern ${kern.gate})`
    );
    const abweichung = kernStufen.stufenAbweichung(out.b.ks, kern);
    check(
        "B: der Ingest-Merge traegt die Stufen-Liste JEDES Kerns (kein Kern ueberschreibt einen anderen)",
        abweichung.length === 0,
        abweichung.join(" · ") || `${Object.keys(kern).length} Arten`
    );
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
    const fSoll = kern.gate ? kernStufen.geklemmteStufe(kern.gate, 2) : null;
    check(
        `F: die Distanz-Wahl 2 klemmt fuer kind:gate auf die groesste deklarierte Stufe ≤ 2 (${fSoll})`,
        (String(out.f.key || "").split("|")[2] || "") === String(fSoll), // Körper-Schlüssel preset|gestalt|stufe[|ov] (V18.527)
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

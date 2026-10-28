// diag-nervensystem-fachwerk.cjs — DER ε-BEWEIS DER HAUS-DOMAENE (Katalysator-Bogen
// W-A5a; Nervensystem-Plan TEIL IV Phase ε). Die Haus-Domaene (fachwerk-core.js,
// __fachwerkCore) dockt NUR ueber die Checkliste §ε an: Manifest-Zeile (N2) +
// KIND_POLICY-Zeile + Donor-Blueprint (N1, beides DATEN) + fx.place als Rezept-Daten
// (N5.7, mode "settlement" + siteTag "haus" — der deliberate Kanal, Worldgen streut nicht) —
// der Stamm bekam KEINEN Logik-Zweig (M8). Gestraffte Schwester zu
// diag-nervensystem-schmiede.cjs, PLUS die MEHR-STUFEN-PROBE (die erste Domaene mit
// kindStages [0,1,2,3] (3 = NUR-WURF, S3 haus) ausserhalb der Baeume — der Flatten-Chokepoint muss die
// Distanz-Wahl auf die DEKLARIERTEN Stufen klemmen statt fail-closed auf [0]):
//   S (statisch, Node): Manifest traegt fachwerk (ns __fachwerkCore) · Absenzen: der Auto-Register-
//     Chokepoint vergleicht keinen kind-String (M8), die Donor-Zeile haus_basis traegt kein
//     portalMeta/roleManual (der Alt-Blueprint ist PHYSISCH gefallen). --selftest streicht die Manifest-Zeile.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die 32 Haus-
//     Rezepte (Dial-Drift-Wand: s.W == der Kern-PRESETS-Wert) · kindStages.haus ==
//     [0,1,2,3] gemerged (tree/vehicle/gate/weapon unberuehrt) · Auto-Blueprint
//     haus_alemannisch entsteht am EINEN Chokepoint (Donor-Klon, KEIN
//     _grownSpecies) · die generische haus_-Regel loest auf · die Place-
//     Aufloesung liefert mode "settlement", der Dispatch benennt den deliberaten Kanal (kein Worldgen-Streuer) + keine
//     haus_-Wald-Nische · _foundryRequest("alemannisch",7,L) liefert Meshes
//     end-to-end fuer ALLE vier Stufen (die Stufe 3 mit Beipack __fern; der Wurf-Ruf nennt sie beim Namen) (Mesh-Zahl je Stufe geloggt) · der
//     Flatten-Chokepoint bedient die Distanz-Wahlen 1 und 2 mit den ECHTEN
//     Stufen |1|/|2| (nicht [0]-Kollaps) und faltet die Wahl 5 auf Stufe 2.
//   node scripts/diag-nervensystem-fachwerk.cjs [--selftest]
const { statikServer, ROOT: root, hauptLauf, nullSeite, pruefer, wandEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_FACHWERK_PORT || 4434);
const server = statikServer();

const { errs, check } = pruefer();
/// ===== TEIL S: die statischen Gesetze — die Absenzen über den EINEN Helfer `stammLib.fehlt` (kommentarfrei; ein totes
// Glied wirft beim Namen). `q` die Wandlung des Vor-Stands, leer = der Arbeitsbaum. =====
function staticLaws(q, manifestSrc) {
    const out = [];
    let manifest = null;
    try {
        manifest = JSON.parse(manifestSrc);
    } catch {}
    const fachwerk = Array.isArray(manifest) ? manifest.find((c) => c && c.id === "fachwerk") : null;
    out.push([
        "S1: das Manifest traegt den fachwerk-Kern (scripts fachwerk-core.js, ns __fachwerkCore)",
        !!fachwerk &&
            Array.isArray(fachwerk.scripts) &&
            fachwerk.scripts.includes("fachwerk-core.js") &&
            fachwerk.vertrag === "fachwerk-core.js" &&
            fachwerk.ns === "__fachwerkCore",
    ]);
    // (S3, M8 — kein kind-String-Vergleich im Auto-Register-Chokepoint — hält gate:pipeline-constitution N1 wörtlich; die
    // Wirkung der Policy beweist Block D.)
    // S6 (Absenz): die Donor-Zeile haus_basis (KIND_SUBSTANCE) trägt kein portalMeta/roleManual und keinen Alt-Namen; Teile
    // und Klon prüft Block D.
    out.push([
        "S6: die Donor-SUBSTANZ haus_basis trägt kein portalMeta/roleManual — der Alt-Blueprint-Block ist GEFALLEN",
        stammLib.fehlt(/\n {4}haus_basis: [^{\n]*\{/, /portalMeta|roleManual|name:\s*"haus_basis"/, q),
        stammLib.fehlt.wo,
    ]);
    return out;
}

hauptLauf(async () => {
    const manifestSrc = fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8");

    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V1: die fachwerk-Manifest-Zeile entfernt -> S1 muss rot werden.
        const brokenManifest = JSON.stringify(JSON.parse(manifestSrc).filter((c) => c && c.id !== "fachwerk"));
        const s1 = staticLaws(undefined, brokenManifest).find((l) => l[0].startsWith("S1"));
        check("Selbst-Test 1: fachwerk-Zeile aus dem Manifest entfernt -> S1 feuert", s1 && s1[1] === false);
        // V2: portalMeta in der Donor-Zeile -> S6 feuert beim Namen
        const rot = staticLaws((t) => stammLib.ersetze(t, null, /(\n {4}haus_basis: \{)/, "$1\n        portalMeta: {},"), manifestSrc).filter((l) => !l[1]);
        check("Selbst-Test 2: portalMeta in haus_basis -> S6 feuert", rot.length === 1 && rot[0][0].startsWith("S6"), rot.map((l) => l[2]).join(" · "));
        selbsttestEnde(errs, "die Linse feuert auf die gestrichene Manifest-Zeile.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS FACHWERK — TEIL S: die statischen Gesetze (Node) ===");
    for (const [name, ok, detail] of staticLaws(undefined, manifestSrc)) check(name, ok, detail);

    // Die Kern-Wahrheit fuer die Dial-Drift-Wand (Buch == Kern): PRESETS in Node ableiten.
    global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
    require(path.join(root, "fachwerk-core.js"));
    const FCn = globalThis.__fachwerkCore;
    const kernAlemannischW = FCn.PRESETS.alemannisch.s.W;
    const kernParamsRows = FCn.PARAMS_BY_KIND.haus.length;

    console.log("\n=== TEIL B: der lebende Draht (Browser, foundry-ON) ===");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 180000 });
    await server.zeige(page, 30000);

    const W = { bp: "haus_alemannisch", donor: "haus_basis", preset: "alemannisch", entry: "haus_hanseatisch", praefix: "haus_", stufen: [0, 1, 2, 3], name: "ein Haus", art: "haus", anzahl: 32, teile: 6, label: "Alemannisch · steil, hell", place: { mode: "settlement", siteTag: "haus", dispatch: "settlement" } };
    const eps = await page.evaluate(kernStufen.epsilonSeite, W);
    const out = await page.evaluate(async () => {
        const res = { b: {}, f: {} };
        const r = window.anazhRealm;
        const f = r._ensureAssetFoundry();
        const rez = f.recipes.alemannisch;
        res.b.stil = rez.fx ? rez.fx.stil : null;
        res.b.paramsHaus = f.paramsByKind && Array.isArray(f.paramsByKind.haus) ? f.paramsByKind.haus.length : -1;
        res.hochhaus = !!(r.state.blueprints && r.state.blueprints.haus_hochhaus);
        // ===== F: DIE MEHR-STUFEN-KLEMME am Flatten-Chokepoint (kindStages [0,1,2,3] LEBT) =====
        // Ohne den N7.5-Merge klemmte ein bekanntes Rezept fail-closed auf [0].
        // FLÄCHEN-STUFE: L1 ist eine echte
        // Studio-Stufe (17–33 % von L0), der Host-Umweg lodServe {1:2} ist gefallen. Also:
        // Wahl 2 fragt |2| frisch an; Wahl 1 fragt die ECHTE Stufe |1| frisch an (kein
        // Mapping, kein [0]-Kollaps); Wahl 5 faltet die lod>2-Klemme auf |2|; Wahl 0
        // bleibt die feine |0| (die Stufen-Existenz [0,1,2] beweist gate:trias N/B).
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
            // der Wurf- und Fern-Ruf (S3 haus): eine NUR-WURF-Stufe beim Namen baut genau sie, nie die Klammer
            res.f.k3 = probe("tudor", 3);
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });
    // Die Erwartung der Stufen: die Kerne in der Seite (dieselben Dateien wie der Worker), nie eine Abschrift.
    const kern = await page.evaluate(kernStufen.seitenStufen, kernStufen.kernRaeume());

    await browser.close();
    server.close();

    kernStufen.epsilonUrteil(check, eps, W, kern);
    check(`B: die Dial-Drift-Wand haelt (Buch s.W == Kern-PRESETS ${kernAlemannischW})`, eps.b.s.W === kernAlemannischW, String(eps.b.s.W));
    check('B: die fx-Strings reisen (alemannisch.fx.stil == "alt")', out.b.stil === "alt", String(out.b.stil));
    check(`B: die B4-Regler-Tabelle reist (paramsByKind.haus == ${kernParamsRows} Dials, W-A1-Generik)`, out.b.paramsHaus === kernParamsRows, String(out.b.paramsHaus));
    const ksHaus = JSON.stringify(eps.b.ks.haus);
    check("B: kindStages.haus == [0,1,2,3] (N7.5-Merge am Ingest — die erste Mehr-Stufen-Domaene; 3 = NUR-WURF)", ksHaus === "[0,1,2,3]", ksHaus);
    check("D: builtIn == false (Policy-Zeile; User-Werk-Sicht wie Fahrzeug/Tor/Klinge)", eps.d.builtIn === false);
    check("D: auch der Glasturm dockt (haus_hochhaus registriert)", out.hochhaus === true);
    check("E: die Stufe 3 trägt ihre Fernform als Beipack __fern (S3 haus, NUR-WURF)", eps.e.fern === true);
    check(
        "F: die Distanz-Wahl 2 wird mit der ECHTEN Stufe |2| bedient (kein [0]-Kollaps — der Merge lebt)",
        /^[^|]*\|[^|]*\|2(\||$)/.test(out.f.k2 || ""),
        out.f.err || String(out.f.k2)
    );
    check(
        "F (Flächen-Stufe): die Wahl 1 wird mit der ECHTEN Stufe |1| bedient (kein Host-Mapping)",
        /^[^|]*\|[^|]*\|1(\||$)/.test(out.f.k1 || ""),
        String(out.f.k1)
    );
    check(
        "F: die Wahl 5 faltet der Chokepoint auf Stufe 2 (lod>2-Klemme)",
        /^[^|]*\|[^|]*\|2(\||$)/.test(out.f.k5 || ""),
        String(out.f.k5)
    );
    check("F: die Wahl 0 bleibt die feine Stufe |0|", /^[^|]*\|[^|]*\|0(\||$)/.test(out.f.k0 || ""), String(out.f.k0));
    check(
        "F (NUR-WURF, S3 haus): der Wurf-Ruf nennt die Stufe 3 beim Namen und baut genau sie |3| (die Klammer gilt nur dem Distanz-Wunsch)",
        /^[^|]*\|[^|]*\|3(\||$)/.test(out.f.k3 || ""),
        String(out.f.k3)
    );

    wandEnde(errs, "DER ε-BEWEIS STEHT: die Haus-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + begehbarer Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — fachwerk-core reist durch den EINEN Foundry-Worker (32 Rezepte + kindStages [0,1,2,3] + B4-Regler + Asset auf allen vier Stufen), haus_<id> entsteht am EINEN Chokepoint, settlement reist als Daten (N5.7, deliberater Kanal ohne Worldgen-Streu), und der Flatten-Chokepoint bedient die Mehr-Stufen-Wahrheit der ersten Nicht-Baum-Domaene mit echten Stufen.");
});

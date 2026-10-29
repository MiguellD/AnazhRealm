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
const { statikServer, hauptLauf, pruefer, wandEnde, selbsttestEnde } = require("./lib/welt-boot.cjs");
const stammLib = require("./lib/stamm.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_PORTA_PORT || 4431);
const server = statikServer();

const { errs, check } = pruefer();
/// ===== TEIL S: die statischen Gesetze — die Absenz über den EINEN Helfer `stammLib.fehlt` (kommentarfrei; ein totes
// Glied wirft beim Namen). (S3, M8 — kein kind-String-Vergleich im Auto-Register-Chokepoint — hält gate:pipeline-
// constitution N1 wörtlich; die Wirkung der Policy beweist Teil D.) `q` die Wandlung des Vor-Stands, leer = der Arbeitsbaum.
function staticLaws(q) {
    // S6 (Absenz): die Donor-Zeile tor_basis trägt keinen Blueprint-Namen und kein portalMeta; Teile und Klon prüft Teil D.
    return [
        [
            "S6: die Donor-SUBSTANZ tor_basis trägt kein portalMeta — der Alt-Blueprint-Block ist GEFALLEN (AUSLÖSCHUNGS-WELLE)",
            stammLib.fehlt(/\n {4}tor_basis: [^{\n]*\{/, /name:\s*"tor_basis"|portalMeta/, q),
            stammLib.fehlt.wo,
        ],
    ];
}

hauptLauf(async () => {
    if (process.argv.includes("--selftest")) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V4: ein Buch mit abgeschriebener Stufen-Liste -> der Merge-Vergleich nennt die Art.
        check("Selbst-Test 4: eine abgeschriebene Stufen-Liste faellt beim Namen (kern-stufen)", kernStufen.selbsttest());
        // V6: portalMeta in der Donor-Zeile -> S6 feuert beim Namen
        const s6 = staticLaws((t) => stammLib.ersetze(t, null, /(\n {4}tor_basis: \{)/, "$1\n        portalMeta: {},"))[0];
        check("Selbst-Test 6: portalMeta in tor_basis -> S6 feuert", !s6[1], s6[2]);
        selbsttestEnde(errs, "die Linse feuert auf die abgeschriebene Stufen-Liste.");
        process.exit(0);
    }

    console.log("=== ε-BEWEIS PORTA — TEIL S: die statischen Absenzen (Node) ===");
    for (const [name, ok, detail] of staticLaws()) check(name, ok, detail);

    const W = { bp: "tor_drachentor", donor: "tor_basis", preset: "drachentor", praefix: "tor_", wahl: 2, name: "ein Tor", art: "gate", anzahl: 7, teile: 4, label: "Drachentor", place: { mode: "site", siteTag: "tor", dispatch: null } };
    const [out, , kern] = await kernStufen.epsilonDraht(server, PORT, W, check);
    check("B: die Regler-Daten fliessen (drachentor.s.orders == 2)", out.b.s.orders === 2, String(out.b.s.orders));
    const ksGate = JSON.stringify(out.b.ks.gate);
    check("B: kindStages.gate == die Deklaration von porta-core (N7.5-Merge am Ingest; 3 = NUR-WURF)", ksGate === kern.gate, `${ksGate} (Kern ${kern.gate})`);
    const fSoll = kern.gate ? kernStufen.geklemmteStufe(kern.gate, 2) : null;
    check(
        `F: die Distanz-Wahl 2 klemmt fuer kind:gate auf die groesste deklarierte Stufe ≤ 2 (${fSoll})`,
        (String(out.f.key || "").split("|")[2] || "") === String(fSoll), // Körper-Schlüssel preset|gestalt|stufe[|ov] (V18.527)
        out.f.err || String(out.f.key)
    );

    wandEnde(errs, "DER ε-BEWEIS STEHT: die Tor-Domaene dockt NUR ueber die Checkliste §ε an (Manifest-Zeile + KIND_POLICY-Zeile + Donor-DATENBLOCK + fx.place-Daten), der Stamm traegt KEINEN neuen kind-Zweig — porta-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + Asset), tor_<id> entsteht am EINEN Chokepoint, site reist als Daten ohne Streu (N5.6).");
});

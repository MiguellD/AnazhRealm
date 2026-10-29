// diag-nervensystem-vehicle.cjs — DER ZWEIT-KERN-BEWEIS (Studio-Vertrag Phase 1, W7b).
// Die Schwester zu diag-nervensystem.cjs fuer die ERSTE Nicht-Pflanzen-Domaene: beweist, dass
// ein kind:"vehicle"-Preset im Zweit-Kern (vehicle-core.js, __vehicleCore — v1.1 N7.2) OHNE
// eine Zeile AnazhRealm-Edit durch die EINE Pipeline fliesst:
//   A (statisch, Node — Absenzen): der Stamm nennt die Zusatz-Felder nie selbst und ruft kerneVereinen genau
//     einmal (kein zweiter Ingest-Pfad); die Bruecke kennt kein self.__vehicleCore-Literal; der Auto-Register-
//     Chokepoint kennt kein kind-if (M8). Den manifest-getriebenen Boot und Stempel beweist gate:pack-contract (`bootLauf`, B3a)
//     am echten Faden. --selftest injiziert einen zweiten Ingest-Pfad und beweist: die Linse feuert.
//   B (Browser, foundry-ON, Null-Renderer): das LIVE-Buch traegt die Fahrzeug-Presets (der
//     Draht lebt end-to-end durch den echten Worker); kindStages.vehicle == [0] gemerged,
//     die foundry-core-kinds UNANGETASTET (kein Overwrite).
//   C (Merge-Semantik, direkt): ein Probe-Kern, der einen foundry-core-kind ueberschreiben
//     WILL, verliert (first-wins); ein disjunkter kind kommt an. Restore danach.
//   D (Auto-Blueprint): fahrzeug_gt entsteht am EINEN Register-Chokepoint (Donor-Substanz
//     KIND_SUBSTANCE.fahrzeug_wagen — der Alt-Blueprint ist PHYSISCH gefallen, AUSLÖSCHUNGS-
//     WELLE; KEIN _grownSpecies), die generische fahrzeug_-Regel loest ihn auf;
//     ein injiziertes Probe-Preset registriert sich idempotent.
//   E (das Asset selbst): _foundryRequest("gt",7,0) liefert echte Meshes mit mat.color,
//     _foundryBuildGroup baut die Gruppe mit color-Attribut-Fill.
//   F (Fail-Closed behavioral): die Distanz-Wahl lod=2 wird fuer kind:vehicle auf Stufe 0
//     geklemmt (kindStages-Merge) UND fuer einen unbekannten kind ohne jeden Eintrag ebenso
//     (N7.5 [0]) — gemessen an den requested-Keys.
//   node scripts/diag-nervensystem-vehicle.cjs [--selftest]
const { statikServer, hauptLauf, pruefer, wandEnde, selbsttestEnde, SELBSTTEST, stammLib } = require("./lib/welt-boot.cjs");
const kernStufen = require("./lib/kern-stufen.cjs");

const PORT = Number(process.env.NERV_PORT || 4407);
const server = statikServer();

const { errs, check } = pruefer();
// ===== TEIL A: die statischen Absenzen über den EINEN Helfer `stammLib.fehlt` (kommentarfrei; ein totes Glied wirft beim
// Namen; die Präsenzen beweist der lebende Draht B-F). (A10, M8 — kein kind-String-Vergleich im Auto-Register-Chokepoint —
// hält gate:pipeline-constitution N1 wörtlich.) `q` die Wandlung des Vor-Stands, leer = der Arbeitsbaum. =====
function staticLaws(q) {
    return [
        // A3 — Chokepoint-Gesetz (N7.5, W8 erweitert): der Stamm nennt keines der Zusatz-Felder selbst, kerneVereinen ruft
        // nur der Ingest-Chokepoint (ein zweiter Ingest-Pfad wird rot); dass er das Gesetz ruft, beweist Teil C per Spion.
        [
            "A3: kein zweiter Ingest-Pfad für den Zweit-Kern-Merge (Zusatz-Felder im Stamm 0, kerneVereinen nur in _foundryIngestRenderConfig)",
            stammLib.fehlt(null, /zusatzKindStages|zusatzBudget/, q) && stammLib.fehlt({ ausser: "_foundryIngestRenderConfig" }, /kerneVereinen\(/, q),
            stammLib.fehlt.wo,
        ],
        // A5: die Brücke greift auf keinen Kern per ns-Literal zu (die Brücke, K42).
        [
            "A5: die Bruecke kennt kein self.__vehicleCore-Literal",
            stammLib.fehlt(null, /self\.__vehicleCore/, { datei: "foundry-bruecke.js" }),
            stammLib.fehlt.wo,
        ],
    ];
}

hauptLauf(async () => {
    if (SELBSTTEST) {
        console.log("=== SELBST-TEST: die Linse feuert auf injizierte Verletzungen ===");
        // V2: ein ZWEITER Ingest-Pfad (zusatzKindStages-Leser ausserhalb des Chokepoints) -> A3 rot.
        const a3 = staticLaws((t) =>
            stammLib.ersetze(t, "_foundryRequestSettlement",
                /(_foundryRequestSettlement\([^)]*\) \{)/,
                "$1\n        const _leak = this.state && this.state.zusatzKindStages;\n        void _leak;"
            )
        ).find((l) => l[0].startsWith("A3"));
        check("Selbst-Test 2: zweiter Ingest-Pfad injiziert -> A3 feuert", a3 && a3[1] === false, a3 && a3[2]);
        // V3: ein zweiter kerneVereinen-Ruf ausserhalb des Chokepoints -> A3 rot.
        const a3b = staticLaws((t) =>
            stammLib.ersetze(t, null, /(\n {4}_foundryRequestSettlement\([^)]*\) \{)/, "$1\n        globalThis.__phytoCore.kerneVereinen({});")
        ).find((l) => l[0].startsWith("A3"));
        check("Selbst-Test 3: zweiter kerneVereinen-Ruf injiziert -> A3 feuert", a3b && a3b[1] === false, a3b && a3b[2]);

        selbsttestEnde(errs, "die Linse feuert auf den zweiten Ingest-Pfad.");
        process.exit(0);
    }

    console.log("=== ZWEIT-KERN — TEIL A: die statischen Absenzen (Node) ===");
    for (const [name, ok, detail] of staticLaws()) check(name, ok, detail);

    const W = { bp: "fahrzeug_gt", donor: "fahrzeug_wagen", preset: "gt", praefix: "fahrzeug_", wahl: 2, name: "ein Fahrzeug", art: "vehicle", anzahl: 5, teile: 17 };
    const [eps, out, kern] = await kernStufen.epsilonDraht(server, PORT, W, check, async () => {
        const res = { c: {}, d: {}, f: {} };
        const A = r.constructor;
        const f = r._ensureAssetFoundry();
        // ===== C: die MERGE-SEMANTIK direkt (first-wins + disjunkt), mit Restore =====
        try {
            const orig = A._studioRenderConfig;
            const origState = r.state.studioRenderConfig;
            // KONSUM: der Chokepoint mergt über das Gesetz (phyto-core kerneVereinen), nie über einen Inline-Zwilling.
            const PC = window.__phytoCore, kv = PC.kerneVereinen;
            res.c.gesetz = 0;
            PC.kerneVereinen = (...a) => (res.c.gesetz++, kv.apply(PC, a));
            r._foundryIngestRenderConfig({
                lod: {
                    kindStages: { tree: [7, 8] },
                    zusatzKindStages: { "probe-core": { tree: [9], tor: [1] } },
                },
            });
            PC.kerneVereinen = kv;
            const pks = A._studioRenderConfig.lod.kindStages;
            res.c.treeKept = JSON.stringify(pks.tree); // erwartet [7,8] — der Erst-Kern fuehrt
            res.c.torMerged = JSON.stringify(pks.tor); // erwartet [1] — disjunkt kommt an
            A._studioRenderConfig = orig;
            r.state.studioRenderConfig = origState;
        } catch (e) {
            res.c.err = (e && e.message) || String(e);
        }
        // ===== D (dazu): Idempotenz + Probe-Preset =====
        try {
            // Injektion == der Schoepfer legt ein Preset im Kern an
            if (f && f.recipes) {
                f.recipes.probemobil = { kind: "vehicle", lab: "Probemobil", s: {}, fx: {} };
                const n1 = r._foundryAutoRegisterSpecies(f.recipes);
                const n2 = r._foundryAutoRegisterSpecies(f.recipes);
                res.d.probeRegistered = !!(r.state.blueprints && r.state.blueprints.fahrzeug_probemobil);
                res.d.probeLabel =
                    r.state.blueprints && r.state.blueprints.fahrzeug_probemobil
                        ? r.state.blueprints.fahrzeug_probemobil.label
                        : null;
                res.d.idempotent = n1 >= 1 && n2 === 0;
                // Aufraeumen (Gate-Hook-Lehre: sichern + wiederherstellen, nie Muell hinterlassen):
                delete f.recipes.probemobil;
                delete r.state.blueprints.fahrzeug_probemobil;
            }
        } catch (e) {
            res.d.err = (e && e.message) || String(e);
        }
        // Unbekannter kind OHNE jeden kindStages-/Budget-Eintrag (N7.5-[0]): die Stufen-Klammer klemmt fail-closed
        // auf [0]; den Wurf trägt kein Wirts-Literal mehr (W8-Integration: `_WIRT_WURF` fiel) — der Flatten bricht
        // laut (KERN-PFLICHT phyto:lod.budget.tor), bevor eine Anfrage an den Worker geht.
        try {
            const before = new Set(f.requested);
            f.recipes.probetor = { kind: "tor", s: {}, fx: {} };
            res.f.torStufe = r._foundryServierStufe("probetor", 2);
            try {
                r._foundryFlattenFor({ seed: 1 }, "probetor", 2);
            } catch (e) {
                res.f.torBruch = (e && e.message) || String(e);
            }
            const fresh = Array.from(f.requested).filter((k) => !before.has(k));
            res.f.torKeys = fresh.filter((k) => k.startsWith("probetor|")).length;
            // Aufraeumen: Probe-Rezept + Probe-Requests entfernen (kein Muell im lebenden f).
            delete f.recipes.probetor;
            for (const k of fresh) if (k.startsWith("probetor|")) f.requested.delete(k);
        } catch (e) {
            res.f.err = (e && e.message) || String(e);
        }
        return res;
    });
    check("B: die Regler-Daten fliessen (gt.s.radstand == 2.9)", eps.b.s.radstand === 2.9, String(eps.b.s.radstand));
    check("B: kindStages.vehicle == [0,1] (N7.5-Merge am Ingest)", JSON.stringify(eps.b.ks.vehicle) === "[0,1]", JSON.stringify(eps.b.ks.vehicle));
    check(
        "C: first-wins — ein Zweit-Kern ueberschreibt NIE (tree bleibt [7,8])",
        out.c.treeKept === "[7,8]",
        out.c.err || String(out.c.treeKept)
    );
    check("C: disjunkter kind kommt an (tor == [1])", out.c.torMerged === "[1]", String(out.c.torMerged));
    check("C: der Chokepoint mergt über das Gesetz kerneVereinen (Konsum)", out.c.gesetz === 1, String(out.c.gesetz));
    check("D: Probe-Preset registriert + idempotent", out.d.probeRegistered === true && out.d.idempotent === true);
    check("D: das Label reist aus dem Rezept (lab)", out.d.probeLabel === "Probemobil", String(out.d.probeLabel));
    check(
        "F: die Distanz-Wahl 2 fordert fuer kind:vehicle NIE Stufe-2-Geometrie (fern = Impostor-Politik)",
        // Körper-Schlüssel preset|gestalt|stufe[|ov]; die Anfrage MUSS entstehen (sonst prüfte F nichts)
        !!eps.f.key && !/^[^|]*\|[^|]*\|2(\||$)/.test(eps.f.key),
        eps.f.err || String(eps.f.key)
    );
    check(
        "F: unbekannter kind OHNE Eintrag klemmt fail-closed auf [0] und bricht ohne Budget laut (kein Wirts-Wurf)",
        out.f.torStufe === 0 && /KERN-PFLICHT[\s\S]*phyto:lod\.budget\.tor/.test(out.f.torBruch || ""),
        `Stufe ${out.f.torStufe} · ${out.f.torBruch || "kein Bruch"} · Anfragen ${out.f.torKeys}`
    );

    wandEnde(errs, "DER ZWEIT-KERN DOCKT AN: vehicle-core reist durch den EINEN Foundry-Worker (Rezepte + kindStages + Asset), der N7.5-Merge lebt am EINEN Ingest-Chokepoint (first-wins, disjunkt, fail-closed [0]), der Auto-Blueprint fahrzeug_<id> entsteht ohne eine Zeile AnazhRealm-Edit — EINE Pipeline fuer alle Domaenen (Vertrag Phase 1).");
});

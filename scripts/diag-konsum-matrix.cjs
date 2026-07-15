#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-konsum-matrix.cjs — DIE KONSUM-MATRIX (V18.470, Schöpfer 14.07.:
// „die meisten Konsume sind ja mehr oder weniger gleich … kannst du sauber
// herausmessen was noch nicht konsumiert, wo die differenzen?")
//
// DIE EINE FRAGE, ZWEIMAL GEMESSEN — je Gattung × Facette:
//   Facetten: LODs · Rahmen · Bewegung · Material · Körper(Kollision) ·
//             Platzierung · Anwendung · Dynamik
//   (A) VERTRAGS-SEITE (Werk-Harness, die ECHTE Pipe): was LIEFERT das
//       Studio? — deklarierte kindStages, ehrlich-verschiedene Stufen
//       (Fingerprint je LOD distinct), Daten-Kanäle (color/aWind/uv),
//       Part-Rollen (m.kind).
//   (B) WELT-SEITE (Quell-Proben, KONSUM nicht Existenz): WER liest es? —
//       jede Zelle trägt verifizierte Chokepoint-Proben; 0 Treffer = die
//       Welt konsumiert diese Facette dieser Gattung NICHT.
//
// VERDIKT je Zelle: VOLL (Vertrag liefert + Welt liest) · TEIL (eine Seite
// fehlt/halb) · LEER (keiner liest) · „?" = ehrlich UNGEMESSEN (benannt).
// Die DIFFERENZEN-Liste ist die Antwort an den Schöpfer; der RATCHET hält
// jede heute-VOLLE Zelle für immer (nur-wachsend, Gesetz #0-Linse).
//
// SELBST-TEST (immer): eine absichtlich unmögliche Probe MUSS 0 lesen.
//   node scripts/diag-konsum-matrix.cjs      (npm run gate:konsum-matrix)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker, fingerprintMeshes } = require("./lib/asset-worker-harness.cjs");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.DIAG_PORT || 4553);
const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const zaehl = (re) => (stamm.match(new RegExp(re, "g")) || []).length;

// ── (B) DIE WELT-PROBEN — jede Zeile ist ein VERIFIZIERTER Chokepoint ──
// (Zahl = Mindest-Treffer; die Namen sind gegen den lebenden Stamm geprüft,
// eine Umbenennung macht die Zelle rot → Test wandert mit dem Code.)
const P = {
    baum: {
        lods: ["kindStages", "_chooseLODForDistance", "_foundryPresetIsTree"],
        rahmen: ["_growTreeBlueprintRich"],
        bewegung: ["_windSwayOffset"],
        material: ["_foundryTreeMaterial", "mp\\.emissive"],
        koerper: ["_populateBlockerAABBs"],
        platz: ["_forestExtraSpecies"],
        verb: null, // ehrlich: kein Baum-Verb (pflanzen läuft über place/Werkstatt)
        dynamik: ["_tickSeason"],
    },
    streu: {
        // Strauch/Blume/Fels — die Scatter-Gattungen
        lods: ["_tickScatterLod", "_chooseLODForDistance"],
        rahmen: null,
        bewegung: ["_windSwayOffset"],
        material: ["_scatterInstanceAdd"],
        koerper: null, // Streu trägt KEINE Kollision (gemessene Leere)
        platz: ["_scatterMaterializeCell"],
        verb: null,
        dynamik: ["_tickFoliageThin|_tickScatterFoundryRefill"],
    },
    fahrzeug: {
        // FAHRZEUG-FERNSTUFE (V18.477, Tor-Präzedenz): KIND_POLICY.vehicle trägt
        // die Impostor-Zeile — geparkte ferne Fahrzeuge reisen als 8-Winkel-Karte
        // (gt: 328 Meshes/28k Tris → 1 Quad/2 Tris; gate:fahrzeug-fern misst live).
        // TEIL bleibt ehrlich: die Vertrags-Seite deklariert weiter [0].
        lods: ["lodServe|kindStages", "impostor: true"],
        rahmen: ['jointRole = "rad"|role === "rad"'],
        bewegung: ['role === "rad"'],
        // PRÄGUNG-WELT (V18.477): der Charakter reist jetzt als Guss-Stempel bis
        // in die Welt (_artifactStudioOv = der EINE Welt-Leser; gate:praegung-welt).
        material: ["KIND_CHARAKTER", "_artifactStudioOv"],
        koerper: ["_blockerComputePartAABB"],
        platz: ["fx\\.place"],
        verb: ["_mountedVehicleProfile"],
        dynamik: ["_vehicleProfile"],
    },
    tor: {
        lods: ["impostor: true"],
        rahmen: ["_torGesetzFor"],
        bewegung: ["_tickTorFluegel"],
        material: ["_membranMaterialFor"],
        koerper: ["_torBlockerAABBs"],
        platz: ['role: "portal"'],
        verb: ["enterPortal"],
        dynamik: ["_tickPortalMembranes"],
    },
    klinge: {
        lods: null, // Waffen: bewusst einstufig (Hand-Objekt) — kein LOD-Konsum
        rahmen: ["handAxis"],
        bewegung: ["_swingDynamics"],
        // PRÄGUNG-WELT (V18.477): die Tradition reist als Guss-Stempel in den
        // Hand-Guss (_heldFoundryGroup liest _artifactStudioOv; gate:praegung-welt).
        material: ["__tradition", "_artifactStudioOv"],
        koerper: null, // Hand-Objekt ohne Welt-Kollision
        platz: ["_heldFoundryGroup"],
        verb: ["wield"],
        dynamik: ["_swingDynamics"],
    },
    haus: {
        lods: ["lodServe"],
        rahmen: ["haus_basis"],
        bewegung: null, // Häuser: keine bewegten Teile konsumiert (Tür-Flügel nur am Tor)
        material: ["_foundryFlattenFor"],
        koerper: ["_blockerComputePartAABB", "haus_basis"],
        platz: ["spawnSettlement", "_tickAutoSettlement"],
        verb: null, // betreten = Kollisions-Lücke, kein eigenes Verb
        dynamik: ["_tickAutoSettlement"],
    },
    mensch: {
        // KREATUR-KOSTEN (Orakel Tier-1 #2): der lod1-Fern-Guss (bakeMenschInstance
        // fein) wird KONSUMIERT — der EINE Toggle-Chokepoint + die EINE Distanz-
        // Konstante (Peer-Tick liest sie; gate:kreatur-kosten misst den Konsum live).
        lods: ["_menschFernToggle", "MENSCH_FERN_DIST_SQ"],
        rahmen: ["bauMensch"],
        bewegung: ["_animateCompoundMotion"],
        material: ["_koerperDials"],
        koerper: ["_fieldSolid"],
        platz: null, // der Avatar wird nicht platziert
        verb: ["_koerperStudioDials"],
        dynamik: ["morphAuf"],
    },
    tier: {
        // KREATUR-KOSTEN: das Standbild (wrap↔fern, TIER_FERN) + die Anim-Raten-
        // Leiter (_creatureAnimDiv) werden konsumiert; V18.477 dazu die HYSTERESE
        // (TIER_FERN_HYST — die EINE Fern-Bande, auch der mensch-Toggle liest sie;
        // gate:tier-fern misst Guss+Band live). TEIL bleibt ehrlich — die
        // Vertrags-Seite trägt weiter keine kreatur-Stufen-Zeile (benannte Lücke).
        lods: ["TIER_FERN_DIST_SQ", "_creatureAnimDiv", "TIER_FERN_HYST"],
        rahmen: ["bauTier"],
        bewegung: ["_animateCompoundMotion"],
        material: ["computeCreatureStats"],
        koerper: ["_creatureHuntDrive"],
        platz: ["CREATURE_SOULS"],
        verb: ["damageCreature"],
        dynamik: ["computeCreatureStats"],
    },
    klang: {
        lods: null,
        rahmen: null,
        bewegung: null,
        material: null,
        koerper: null,
        platz: null,
        verb: ["klangPreset", "pr\\(\\?:ä\\|ae\\)ge"],
        dynamik: ["klangPreset"],
    },
};

// Erwartungen an die VERTRAGS-Seite (A): Gattung → { kind, preset (null = erster
// des kinds aus dem Buch), sollStufen (Schöpfer-Soll ≥3 — gemessen wird die Wahrheit) }
const REP = {
    baum: { kind: "tree", preset: "eiche" },
    streu: { kind: "rock", preset: "findling" },
    fahrzeug: { kind: "vehicle", preset: null },
    tor: { kind: "gate", preset: null },
    klinge: { kind: "weapon", preset: null },
    haus: { kind: "haus", preset: null },
    tier: { kind: "kreatur", preset: null },
};

(async () => {
    console.log("=== V18.470 DIE KONSUM-MATRIX — Gattung × Facette (Vertrag + Welt) ===\n");

    // ── (A) VERTRAGS-SEITE über die echte Pipe ──
    let A = {};
    try {
        A = await runWithWorker(PORT, async ({ build, getData }) => {
            const env = await getData("get-book");
            const book = env.book || env.recipes || {};
            const rc = env.renderConfig || {};
            // Der GANZE Vertrag: Haupt-Block + die Zweit-Kern-Blöcke (zusatzKindStages,
            // W7b/N2 — der Host mergt sie am Ingest-Chokepoint; die Linse liest dieselbe
            // Vollständigkeit, sonst misst sie eine Phantom-Lücke wie V18.470 erste Fassung).
            const stages = Object.assign({}, (rc.lod && rc.lod.kindStages) || {});
            const zusatz = (rc.lod && rc.lod.zusatzKindStages) || {};
            for (const block of Object.values(zusatz)) Object.assign(stages, block || {});
            const out = { kindStages: stages, gattung: {} };
            const byKind = {};
            for (const [id, r] of Object.entries(book)) {
                const k = (r && r.kind) || "?";
                (byKind[k] = byKind[k] || []).push(id);
            }
            out.rezepteJeKind = Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, v.length]));
            for (const [g, spec] of Object.entries(REP)) {
                const preset = spec.preset || (byKind[spec.kind] || [])[0];
                if (!preset) {
                    out.gattung[g] = { preset: null };
                    continue;
                }
                const decl = Array.isArray(stages[spec.kind]) ? stages[spec.kind] : [0];
                const fps = [];
                const attrs = new Set();
                const parts = new Set();
                let meshCount0 = 0;
                for (const lod of decl) {
                    const r = await build({ presetId: preset, seed: 7, lod });
                    const fp = JSON.stringify((r && r.meshes) || []).length
                        ? JSON.stringify(
                              ((r && r.meshes) || []).map((m) => ({
                                  k: m.kind,
                                  a: Object.fromEntries(
                                      Object.entries(m.attrs || {}).map(([k2, v]) => [k2, v.b64.length])
                                  ),
                              }))
                          )
                        : "";
                    fps.push(fp);
                    for (const m of (r && r.meshes) || []) {
                        for (const k2 of Object.keys(m.attrs || {})) attrs.add(k2);
                        if (m.kind) parts.add(m.kind);
                        if (lod === decl[0]) meshCount0++;
                    }
                }
                out.gattung[g] = {
                    preset,
                    stufenDeklariert: decl,
                    stufenDistinct: new Set(fps).size,
                    attrs: [...attrs].sort(),
                    parts: [...parts].sort().slice(0, 10),
                    meshes: meshCount0,
                };
            }
            return out;
        });
    } catch (e) {
        check("(A) Werk-Harness lieferte die Vertrags-Seite", false, (e && e.message) || String(e));
        A = { kindStages: {}, gattung: {}, rezepteJeKind: {} };
    }

    if (A.rezepteJeKind) {
        console.log("  Rezepte je kind:", JSON.stringify(A.rezepteJeKind));
        console.log("  kindStages (Vertrag):", JSON.stringify(A.kindStages), "\n");
    }

    // ── Matrix bauen ──
    const FACETTEN = ["lods", "rahmen", "bewegung", "material", "koerper", "platz", "verb", "dynamik"];
    const matrix = {};
    const differenzen = [];
    for (const [g, probes] of Object.entries(P)) {
        matrix[g] = {};
        const a = (A.gattung && A.gattung[g]) || null;
        for (const f of FACETTEN) {
            const probe = probes[f];
            let verdict, ev;
            if (probe === null) {
                verdict = "LEER";
                ev = "bewusst/gemessen leer";
            } else {
                const counts = probe.map((re) => zaehl(re));
                const alle = counts.every((c) => c > 0);
                verdict = alle ? "VOLL" : "LEER";
                ev = probe.map((re, i) => `${re.slice(0, 28)}:${counts[i]}`).join(" · ");
            }
            // Vertrags-Seite verfeinert die LOD-Zelle: VOLL nur bei ≥2 ehrlich
            // verschiedenen Stufen; ≥3 ist das Schöpfer-Soll (sonst TEIL).
            if (f === "lods" && a && a.preset && verdict === "VOLL") {
                if (a.stufenDistinct < 2) verdict = "TEIL";
                else if (a.stufenDeklariert.length < 3) verdict = "TEIL";
                ev += ` | Stufen ${JSON.stringify(a.stufenDeklariert)} distinct=${a.stufenDistinct}`;
            }
            matrix[g][f] = { verdict, ev };
            if (verdict !== "VOLL") differenzen.push(`${g}.${f} [${verdict}] ${ev}`);
        }
        if (a && a.preset)
            console.log(
                `  (A) ${g}=${a.preset}: Stufen ${JSON.stringify(a.stufenDeklariert)} (distinct ${a.stufenDistinct}) · attrs [${a.attrs.join(",")}] · ${a.meshes} Meshes`
            );
    }

    // ── Matrix drucken ──
    const SYM = { VOLL: "█", TEIL: "▒", LEER: "·" };
    console.log("\n  MATRIX (█ VOLL · ▒ TEIL · · LEER):");
    console.log("            " + FACETTEN.map((f) => f.slice(0, 7).padEnd(8)).join(""));
    for (const g of Object.keys(P))
        console.log(
            "    " +
                g.padEnd(8) +
                FACETTEN.map((f) =>
                    (SYM[matrix[g][f].verdict] + " " + matrix[g][f].verdict.slice(0, 4)).padEnd(8)
                ).join("")
        );

    console.log("\n  DIE DIFFERENZEN (was noch nicht konsumiert wird):");
    for (const d of differenzen) console.log("    – " + d);

    // ── DER RATCHET (nur-wachsend): heute-VOLLE Zellen bleiben VOLL; die
    // lods-Zellen der Vertrags-Gattungen dürfen TEIL sein (die Leiter-Lücke
    // ist die benannte Arbeitsliste), aber NIE LEER fallen. ──
    const VOLL_ANKER = [
        "baum.lods|baum.rahmen|baum.bewegung|baum.material|baum.koerper|baum.platz|baum.dynamik",
        "streu.bewegung|streu.material|streu.platz|streu.dynamik",
        "fahrzeug.rahmen|fahrzeug.bewegung|fahrzeug.material|fahrzeug.koerper|fahrzeug.platz|fahrzeug.verb|fahrzeug.dynamik",
        "tor.rahmen|tor.bewegung|tor.material|tor.koerper|tor.platz|tor.verb|tor.dynamik",
        "klinge.rahmen|klinge.bewegung|klinge.material|klinge.platz|klinge.verb|klinge.dynamik",
        "haus.rahmen|haus.material|haus.koerper|haus.platz|haus.dynamik",
        "mensch.lods|mensch.rahmen|mensch.bewegung|mensch.material|mensch.koerper|mensch.verb|mensch.dynamik",
        "tier.rahmen|tier.bewegung|tier.material|tier.koerper|tier.platz|tier.verb|tier.dynamik",
        "klang.verb|klang.dynamik",
    ]
        .join("|")
        .split("|");
    const NIE_LEER = ["streu.lods", "fahrzeug.lods", "tor.lods", "haus.lods", "tier.lods"];
    let ratchetOk = true;
    const gefallen = [];
    for (const cell of VOLL_ANKER) {
        const [g, f] = cell.split(".");
        const v = matrix[g] && matrix[g][f] && matrix[g][f].verdict;
        if (v !== "VOLL") {
            ratchetOk = false;
            gefallen.push(`${cell}=${v}`);
        }
    }
    for (const cell of NIE_LEER) {
        const [g, f] = cell.split(".");
        const v = matrix[g] && matrix[g][f] && matrix[g][f].verdict;
        if (v === "LEER") {
            ratchetOk = false;
            gefallen.push(`${cell}=${v}`);
        }
    }
    check(
        `RATCHET: ${VOLL_ANKER.length} VOLL-Anker + ${NIE_LEER.length} Nie-LEER-Anker tragen (nur-wachsend)`,
        ratchetOk,
        gefallen.join(" · ")
    );

    // Vertrags-Kern: die Mehr-Stufen-Domänen liefern ehrlich verschiedene Stufen.
    for (const g of ["baum", "haus"]) {
        const a = A.gattung && A.gattung[g];
        check(
            `(A) ${g}: deklarierte Stufen sind EHRLICH verschieden (kein Etiketten-LOD)`,
            !!(a && a.preset && a.stufenDistinct === a.stufenDeklariert.length),
            a && a.preset ? `${a.stufenDeklariert.length} deklariert, ${a.stufenDistinct} distinct` : "kein Bau"
        );
    }
    // Der gemessene Parallelpfad-Befund (14.07.): der Studio-Bäcker-Kanal
    // (bake-impostor) existiert im Gesetzbuch, der Stamm ruft ihn NIE —
    // die Welt-Ferne backt im Nachbau (_tickImpostorBake). Diese Probe DREHT
    // SICH, sobald die Vereinigungs-Welle den Kanal konsumiert: dann MUSS
    // "bake-impostor" im Stamm stehen — bis dahin dokumentiert sie die Lücke.
    const kanalKonsumiert = zaehl('"bake-impostor"') > 0;
    console.log(
        `  ${kanalKonsumiert ? "✅" : "▒ "} BÄCKER-VEREINIGUNG: Stamm konsumiert den Studio-Bäcker-Kanal (bake-impostor) — ${kanalKonsumiert ? "JA" : "NOCH NICHT (Nachbau _tickImpostorBake lebt; die benannte #1-Differenz)"}`
    );

    // ── SELBST-TEST ──
    check(
        "SELBST-TEST: eine unmögliche Probe liest 0 (die Linse kann rot)",
        zaehl("__diese_methode_gibt_es_nicht__") === 0
    );

    if (errs.length) {
        console.log(`\n❌ ROT — ${errs.length} Verletzung(en): ${errs.join(" · ")}`);
        process.exit(1);
    }
    console.log(
        `\n✅ GRÜN — die Matrix steht: ${VOLL_ANKER.length + NIE_LEER.length} Zellen verankert, ${differenzen.length} Differenzen ehrlich benannt (die Arbeitsliste des Bogens).`
    );
})();

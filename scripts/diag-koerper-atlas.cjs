#!/usr/bin/env node
// ============================================================================
// ULTRAGUSS U7 — DIE KOERPER-ATLAS-LINSE (gate:koerper-atlas).
//
// DER MUSKEL-ATLAS IST GEWANDERT: das humanoide Skelett-GESETZ (der Rippenkorb,
// der Hand-Fächer, Fuß/Zehen, die gelenk-verankerte MUSC-Tabelle + der COVERAGE-
// Pass — ~595 Netto-Zeilen) ist verbatim aus anazhRealm.js._humanoidSkeleton nach
// koerper-core.js.humanSkeleton gewandert; der Stamm delegiert fail-closed.
//
// Diese Linse beweist alt==neu BYTE-GLEICH: die parts-Liste, die der Kern für die
// drei Prüf-Genome (Default + zwei Varianten, _koerper-atlas-genomes.cjs) baut,
// wird als JSON-sha256 gestempelt und gegen die EINGEFRORENEN Baseline-Hashes
// (byte-treu aus dem Stamm-Stand VOR der Wanderung, capture-baseline.cjs) geprüft.
// Identisch = das Gesetz reiste unverändert (Formeln zogen um, wurden nie neu
// geschrieben). Ein Re-Mint dieser Hashes ist ein begründeter Vertrags-Akt.
//
// --selftest perturbiert eine gebaute part-Koordinate und beweist, dass die Linse
// feuert (kein vakuöses Grün).
// ============================================================================
"use strict";

const crypto = require("crypto");
const path = require("path");
require(path.join(__dirname, "..", "koerper-core.js"));
const core = globalThis.__koerperCore;
const GENOMES = require(path.join(__dirname, "_koerper-atlas-genomes.cjs"));

// Die eingefrorene Byte-Wahrheit (Stamp-Stand VOR U7-Wanderung, sha256 der parts-JSON):
const BASELINE = {
    default: "26d7ce5318000fbff8a18daa396a74ac49dc4b5a1bf96715cd565bc04c2cbaa8",
    weiblich_schwer: "93eb6d2f5ad31b5bc55cfe1a8f0f2dbc013ec91f2b3c1521108a443b111b432e",
    maennlich_schlank_muskel: "504f8ad4905bf531c1fee65d9ce0dd0299d8429dbf37541a50d8393c0ec2deea",
};

function hashParts(parts) {
    return crypto.createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

const selftest = process.argv.includes("--selftest");

if (selftest) {
    // Perturbiere EINE part-Koordinate (1e-9) — die Linse MUSS für jedes Genom feuern.
    let fails = 0;
    for (const [name, g] of GENOMES) {
        const parts = core.humanSkeleton(g);
        if (!parts.length) { console.log(`  ⛔ ${name}: keine parts`); fails++; continue; }
        const mut = JSON.parse(JSON.stringify(parts));
        mut[0].position.x += 1e-9;
        const h = hashParts(mut);
        if (h === BASELINE[name]) { console.log(`  ⛔ Selbsttest ${name}: Perturbation NICHT erkannt`); fails++; }
    }
    if (fails) { console.error("❌ ROT — die Linse ist blind."); process.exit(1); }
    console.log(`✅ Selbsttest: alle ${GENOMES.length} perturbierten Genome erkannt.`);
    process.exit(0);
}

if (typeof core.humanSkeleton !== "function") {
    console.error("❌ ROT — koerper-core.humanSkeleton fehlt (das Gesetzbuch trägt den Atlas nicht).");
    process.exit(1);
}

let diffs = 0;
for (const [name, g] of GENOMES) {
    const parts = core.humanSkeleton(g);
    const h = hashParts(parts);
    const want = BASELINE[name];
    if (!want) { console.error(`❌ ROT — kein Baseline-Hash für Genom ${name}.`); process.exit(1); }
    if (h !== want) {
        diffs++;
        console.error(`  ⛔ ${name}: parts-JSON-Hash weicht ab\n     alt=${want}\n     neu=${h} (${parts.length} parts)`);
    }
}
if (diffs > 0) {
    console.error(`❌ ROT — ${diffs} Genom(e) weichen von der eingefrorenen Byte-Wahrheit ab (der Atlas wurde umgeschrieben, nicht gewandert).`);
    process.exit(1);
}
console.log(`✅ DER MUSKEL-ATLAS IST EINER — ${GENOMES.length} Prüf-Genome, parts-JSON-Hash BYTE-GLEICH zur Stamm-Baseline (0 Abweichungen); das humanoide Skelett-Gesetz wohnt im Kern.`);
process.exit(0);

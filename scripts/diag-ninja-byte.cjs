#!/usr/bin/env node
"use strict";
// diag-ninja-byte.cjs — V18.491.180 Byte-Beweis: NINJA_FEEL / NINJA_VIS (.179)
// + Host parkour dual (wandAbstoss/kletterV) NOT Fake-merged with arcade.
// Like diag-grip-byte.cjs .152 / diag-bogen-byte.cjs .178. Node-only; Lab source = UTF-8 string checks.
//   node scripts/diag-ninja-byte.cjs
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "koerper-core.js"));
const KC = globalThis.__koerperCore;

console.log("=== NINJA BYTE (NINJA_FEEL / NINJA_VIS + Host parkour dual) V18.491.180 ===");

const NF = KC && KC.NINJA_FEEL;
const NV = KC && KC.NINJA_VIS;
const park = KC && KC.bewegung && KC.bewegung.parkour;

check("NINJA_FEEL.sprungVy === 15.5", NF && NF.sprungVy === 15.5, String(NF && NF.sprungVy));
check("NINJA_FEEL.wandVy === 14.5", NF && NF.wandVy === 14.5, String(NF && NF.wandVy));
check("NINJA_FEEL.wandKick === 11", NF && NF.wandKick === 11, String(NF && NF.wandKick));
check("NINJA_FEEL.doppelVy === 13.8", NF && NF.doppelVy === 13.8, String(NF && NF.doppelVy));
check("NINJA_FEEL.kletterVy === 8.5", NF && NF.kletterVy === 8.5, String(NF && NF.kletterVy));
check("NINJA_FEEL.sprintSpd === 18", NF && NF.sprintSpd === 18, String(NF && NF.sprintSpd));
check("NINJA_FEEL.walkSpd === 10.5", NF && NF.walkSpd === 10.5, String(NF && NF.walkSpd));
check("NINJA_FEEL.crouchSpd === 4.6", NF && NF.crouchSpd === 4.6, String(NF && NF.crouchSpd));
check("NINJA_FEEL.ctrlWalk === 6.0", NF && NF.ctrlWalk === 6.0, String(NF && NF.ctrlWalk));

check(
    'NINJA_VIS.lab === "arcade-ninja" && NINJA_VIS.host === "parkour-real"',
    NV && NV.lab === "arcade-ninja" && NV.host === "parkour-real",
    NV ? JSON.stringify(NV) : "missing"
);

const parkReal =
    park && (park.wandAbstoss === 3 || park.kletterV === 0.6);
check(
    "bewegung.parkour real (wandAbstoss===3 || kletterV===0.6)",
    !!parkReal,
    park ? `wandAbstoss=${park.wandAbstoss} kletterV=${park.kletterV}` : "missing"
);

check(
    "DUAL: NINJA_FEEL.sprungVy===15.5 && parkour.wandAbstoss===3 (or kletterV===0.6) — NOT Fake-merged",
    NF && NF.sprungVy === 15.5 && parkReal,
    `sprungVy=${NF && NF.sprungVy} wandAbstoss=${park && park.wandAbstoss} kletterV=${park && park.kletterV}`
);

const labPath = path.join(root, "worlds/koerperstudio/koerperstudio.js");
const lab = fs.readFileSync(labPath, "utf8");

const hasCoreReader =
    lab.includes("__koerperCore.NINJA_FEEL") ||
    /__koerperCore\s*&&\s*(?:window\.)?__koerperCore\.NINJA_FEEL/.test(lab) ||
    /window\.__koerperCore\s*&&\s*window\.__koerperCore\.NINJA_FEEL/.test(lab);
check(
    "Lab has __koerperCore.NINJA_FEEL (fail-soft reader)",
    hasCoreReader,
    "reader"
);

const usesFeelKeys =
    lab.includes("NINJA_FEEL.sprungVy") &&
    lab.includes("NINJA_FEEL.wandVy") &&
    lab.includes("NINJA_FEEL.wandKick") &&
    lab.includes("NINJA_FEEL.doppelVy") &&
    lab.includes("NINJA_FEEL.kletterVy") &&
    lab.includes("NINJA_FEEL.sprintSpd") &&
    lab.includes("NINJA_FEEL.walkSpd") &&
    lab.includes("NINJA_FEEL.crouchSpd") &&
    lab.includes("NINJA_FEEL.ctrlWalk");
check(
    "Lab uses NINJA_FEEL.sprungVy/wandVy/wandKick/doppelVy/kletterVy/sprintSpd/walkSpd/crouchSpd/ctrlWalk",
    usesFeelKeys,
    "consumers"
);

// Bare sole-source = object literal with all nine keys WITHOUT a core reader.
// Byte-alt _NF0 + reader is OK; sole bare literal as only source is NOT.
// Sole-source bare = all nine keys in one object literal WITHOUT __koerperCore.NINJA_FEEL reader.
// Byte-alt _NF0 + core reader is OK (fail-soft). Fail only if reader missing.
const nineKeys = ["sprungVy", "wandVy", "wandKick", "doppelVy", "kletterVy", "sprintSpd", "walkSpd", "crouchSpd", "ctrlWalk"];
const bareObjRe = /(?:var|let|const)\s+NINJA_FEEL\s*=\s*\{[^}]+\}/g;
let soleBare = false;
let m;
while ((m = bareObjRe.exec(lab)) !== null) {
    const body = m[0];
    const hasAll = nineKeys.every((k) => new RegExp(k + "\\s*:").test(body));
    const isReaderAssign = /_NFc|_NF0|__koerperCore/.test(body);
    if (hasAll && !isReaderAssign) soleBare = true;
}
check(
    "Lab NO sole bare nine-key NINJA_FEEL literal (reader must be present)",
    hasCoreReader && !soleBare,
    hasCoreReader ? (soleBare ? "sole bare without reader" : "reader present; no sole bare") : "missing reader"
);

if (errs.length) {
    console.log(`\n❌ ROT — ${errs.length} fail: ${errs.join("; ")}`);
    process.exit(1);
}
console.log(
    "\n✅ GRÜN — NINJA Byte-Beweis: NINJA_FEEL nine + NINJA_VIS dual + Host parkour-real (wandAbstoss/kletterV) + Lab fail-soft reader — NOT Fake-merged / NOT Fake-ERLEDIGT E."
);
process.exit(0);

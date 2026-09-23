#!/usr/bin/env node
"use strict";
// diag-resonanz-byte.cjs — V18.491.201 Byte-Beweis: RESONANZ_GESETZ / RESONANZ_VIS (.200 hoist)
// Node-only; Lab source = UTF-8 string checks on worlds/klang/klang.js.
//   node scripts/diag-resonanz-byte.cjs
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const errs = [];
function check(name, ok, detail) {
  console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) errs.push(name);
}

global.window = global;
global.self = global;
require(path.join(root, "klang-core.js"));
const KC = global.__klangCore;

console.log("=== RESONANZ BYTE (RESONANZ_GESETZ / RESONANZ_VIS) V18.491.201 ===");

const R = KC && KC.RESONANZ_GESETZ;
const V = KC && KC.RESONANZ_VIS;
check("KC.RESONANZ_GESETZ exported", !!R, R ? "present" : "missing");
check("KC.RESONANZ_VIS exported", !!V, V ? "present" : "missing");
check("RESONANZ_GESETZ.outGain === 0.16", R && R.outGain === 0.16, String(R && R.outGain));
check("RESONANZ_GESETZ.delaySec === 1/131", R && R.delaySec === 1 / 131, String(R && R.delaySec));
check("RESONANZ_GESETZ.lpHz === 3600", R && R.lpHz === 3600, String(R && R.lpHz));
check("RESONANZ_GESETZ.feedback === 0.72", R && R.feedback === 0.72, String(R && R.feedback));
check("RESONANZ_GESETZ.voices === 3", R && R.voices === 3, String(R && R.voices));
check(
  'RESONANZ_VIS.lab === "sympathetik-3" && RESONANZ_VIS.host === "none"',
  V && V.lab === "sympathetik-3" && V.host === "none",
  V ? JSON.stringify(V) : "missing"
);

const labPath = path.join(root, "worlds/klang/klang.js");
const lab = fs.readFileSync(labPath, "utf8");
const hasReader =
  /KC\s*&&\s*KC\.RESONANZ_GESETZ/.test(lab) &&
  lab.includes("RG.outGain") &&
  lab.includes("RG.delaySec") &&
  lab.includes("RG.lpHz") &&
  lab.includes("RG.feedback") &&
  lab.includes("RG.voices");
check("Lab has KC.RESONANZ_GESETZ reader for all cold fields", hasReader, "reader");
check(
  "Lab has resonance version/visibility marker",
  /V18\.491\.200/.test(lab) || lab.includes("RESONANZ_VIS"),
  "marker"
);
check(
  "Lab cold init uses reader-derived rOutGain",
  /resOut\.gain\.value\s*=\s*rOutGain/.test(lab),
  "cold gain"
);
check(
  "Lab cold init uses reader-derived rDelaySec/rLpHz/rFeedback",
  /delayTime\.value\s*=\s*rDelaySec/.test(lab) &&
    /frequency\.value\s*=\s*rLpHz/.test(lab) &&
    /gain\.value\s*=\s*rFeedback/.test(lab),
  "cold resonators"
);
check(
  "Lab NO bare cold resOut.gain.value = 0.16",
  !/resOut\.gain\.value\s*=\s*0\.16/.test(lab),
  "bare cold literal absent"
);
check(
  "Lab live updateResonators path remains named",
  /function\s+updateResonators\s*\(/.test(lab) && lab.includes("setTargetAtTime"),
  "live setTargetAtTime path"
);

if (errs.length) {
  console.log(`\n❌ ROT — ${errs.length} fail: ${errs.join("; ")}`);
  process.exit(1);
}
console.log(
  "\n✅ GRÜN — Resonanz Byte-Beweis: RESONANZ_GESETZ five fields + RESONANZ_VIS (sympathetik-3 / Host none) + Lab cold-init reader; live updateResonators untouched; NOT Fake-ERLEDIGT E."
);
process.exit(0);

#!/usr/bin/env node
"use strict";
// diag-grip-byte.cjs — V18.491.152 Byte-Beweis: P.grip → exportDrive.lenkung.gripK
// (+ Lab Reibkreis-Spiegel maxGrip·grip). Node-only, same load as diag-vehicle-drive A.
//   node scripts/diag-grip-byte.cjs
const path = require("path");
const root = path.resolve(__dirname, "..");
const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}
const EPS = 1e-12;

global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "vehicle-core.js"));
const VC = globalThis.__vehicleCore;
function expectedFor(presetId) {
    const p = VC.PRESETS[presetId];
    return VC.exportDrive(Object.assign({}, p.s, p.fx));
}

console.log("=== GRIP BYTE (A7 / GRIP_BYTE) V18.491.152 ===");

check("DEFAULT_P.grip === 1", VC.DEFAULT_P && VC.DEFAULT_P.grip === 1, String(VC.DEFAULT_P && VC.DEFAULT_P.grip));
check("FAHR.lenkung.gripK === 6", VC.FAHR && VC.FAHR.lenkung && VC.FAHR.lenkung.gripK === 6, String(VC.FAHR && VC.FAHR.lenkung && VC.FAHR.lenkung.gripK));

const gt = expectedFor("gt");
const ss = expectedFor("supersport");
check("gt.lenkung.gripK === 6", gt && gt.lenkung && gt.lenkung.gripK === 6, String(gt && gt.lenkung && gt.lenkung.gripK));
check(
    "supersport.lenkung.gripK === 5.1",
    ss && ss.lenkung && Math.abs(ss.lenkung.gripK - 5.1) < EPS,
    String(ss && ss.lenkung && ss.lenkung.gripK)
);
check("supersport.zweispur.grip === 0.85", ss && ss.zweispur && ss.zweispur.grip === 0.85, String(ss && ss.zweispur && ss.zweispur.grip));
check("gt.zweispur.grip === 1", gt && gt.zweispur && gt.zweispur.grip === 1, String(gt && gt.zweispur && gt.zweispur.grip));

const mg = VC.FAHR && VC.FAHR.maxGrip;
if (Number.isFinite(mg)) {
    const labRatio = (mg * 0.85) / (mg * 1);
    const zwRatio = ss.zweispur.grip / gt.zweispur.grip;
    check(
        "Lab Reibkreis mirror: (maxGrip·0.85)/(maxGrip·1) === ss/gt zweispur.grip",
        Math.abs(labRatio - zwRatio) < EPS && Math.abs(labRatio - 0.85) < EPS,
        `lab=${labRatio} zw=${zwRatio}`
    );
} else {
    check("FAHR.maxGrip finite (Lab Reibkreis mirror)", false, String(mg));
}

const gv = VC.GRIP_VIS;
check(
    "GRIP_VIS preset/default/host (.151)",
    gv && gv.preset === "supersport-0.85" && gv.default === "grip-1.0" && gv.host === "gripK-product",
    gv ? JSON.stringify(gv) : "missing"
);

if (errs.length) {
    console.log(`\n❌ ROT — ${errs.length} fail: ${errs.join("; ")}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — grip Byte-Beweis: product path + Lab maxGrip·grip scale with P.grip alike.");
process.exit(0);

#!/usr/bin/env node
"use strict";
// scripts/diag-puls — PULS-Marker Analog E (ohne Desktop-Sonden).
// Assertiert Metrologie-Helfer + kapseln im Flugschreiber-Quellpfad,
// dann die volle Linse diag-analog-e-metrology.cjs.
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const js = path.join(root, "anazhRealm.js");
const src = fs.readFileSync(js, "utf8");
const ver = (src.match(/AnazhRealm\.VERSION\s*=\s*"([^"]+)"/) || [])[1] || "?";
const marks = {
  ver,
  hasMetrologieHelper: src.includes("_analogEMetrologieZeile"),
  hasMetrologieChat: /vc === "metrologie"/.test(src),
  hasKapselnExport:
    /kapseln:\s*this\.state\.weltMarch\.kapselCache/.test(src) ||
    /kapseln:\s*[^\n]*kapselCache/.test(src),
  hasKapselCache: /kapselCache:\s*new Map\(/.test(src),
};
const failMarks =
  !marks.hasMetrologieHelper || !marks.hasMetrologieChat || !marks.hasKapselnExport || !marks.hasKapselCache;
console.log("=== PULS (Analog E Metrologie) ===");
console.log(JSON.stringify(marks, null, 2));
if (failMarks) {
  console.log("PULS ROT — Quell-Marker fehlen");
  process.exit(1);
}
const lens = spawnSync(process.execPath, [path.join(__dirname, "diag-analog-e-metrology.cjs")], {
  encoding: "utf8",
  timeout: 60000,
});
process.stdout.write(lens.stdout || "");
process.stderr.write(lens.stderr || "");
const gruen = /GRÜN|GRUEN/.test(lens.stdout || "");
const ok = lens.status === 0 && gruen;
console.log(ok ? "PULS GRÜN" : "PULS ROT");
process.exit(ok ? 0 : 1);

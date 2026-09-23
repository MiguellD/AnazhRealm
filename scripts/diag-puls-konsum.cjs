#!/usr/bin/env node
"use strict";
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const root = __dirname + "/..";
const js = path.join(root, "anazhRealm.js");
const src = fs.readFileSync(js, "utf8");
const ver = (src.match(/AnazhRealm\.VERSION\s*=\s*"([^"]+)"/) || [])[1] || "?";
const hasFit = src.includes("_archFachwerkFit");
const hasVerb = /andreas|Verbänd/.test(src);
const hasOrient = src.includes("_nachDorfOrientieren");
const hasHand = /mesh\.visible = !!haus/.test(src);
const hasBauten = /vc === "bauten"/.test(src);
const hasPrism = /def\.prism|prismFlip|pB\.w = 2/.test(src) || src.includes("pushPrism");
const hasGaube = /gaube|Gaube/.test(src);
const hasMetrologie = src.includes("_analogEMetrologieZeile");
const hasKapselnExport =
  /kapseln:\s*this\.state\.weltMarch\.kapselCache/.test(src) ||
  /kapseln:\s*[^\n]*kapselCache/.test(src);
const check = spawnSync("node", ["--check", js], { encoding: "utf8" });
const okCheck = check.status === 0;
function runDiag(name) {
  const p = path.join(root, "scripts", name);
  if (!fs.existsSync(p)) return { name, skip: true };
  const r = spawnSync("node", [p], { encoding: "utf8", timeout: 120000 });
  const out = (r.stdout || "") + (r.stderr || "");
  const gruen = /GRÜN|GRUEN|✅/.test(out);
  return { name, status: r.status, gruen, tail: out.trim().split("\n").slice(-3).join(" | ") };
}
const diags = [
  "diag-arch-fachwerk-fit.cjs",
  "diag-settlement.cjs",
  "diag-foundry-spawn-warm.cjs",
  "diag-analog-e-metrology.cjs",
].map(runDiag);
const marks = {
  ver,
  hasFit,
  hasVerb,
  hasOrient,
  hasHand,
  hasBauten,
  hasPrism,
  hasGaube,
  hasMetrologie,
  hasKapselnExport,
  okCheck,
};
const metro = diags.find((d) => d.name === "diag-analog-e-metrology.cjs");
const metroOk = metro && !metro.skip && metro.status === 0 && metro.gruen;
const fail = !okCheck || !hasFit || !hasMetrologie || !hasKapselnExport || !metroOk;
console.log("=== PULS KONSUM ===");
console.log(JSON.stringify(marks, null, 2));
for (const d of diags) {
  if (d.skip) console.log(`  skip ${d.name}`);
  else console.log(`  ${d.gruen ? "GRÜN" : "ROT"} ${d.name} exit=${d.status} · ${d.tail}`);
}
console.log(fail ? "PULS ROT" : "PULS GRÜN");
process.exit(fail ? 1 : 0);

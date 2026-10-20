// 2010 Bündel 2: der Stations-Patch der Kalt-Probe (byte-gleich an A und B, danach `git -c core.autocrlf=false checkout --
// scripts/diag-boot-stage.cjs`): je Probe (200 ms) die Term-NAMEN der Lücken (`_weltbildLuecken`, statt nur ihrer Sätze) und
// die Brunnen der Messfrage von grund-datum — Zahl der `brunnen_dorf` und davon mit gebautem Körper (`_servedLod != null`).
//   node kalt-patch.cjs <baum> [--zurueck]
"use strict";
const fs = require("fs");
const path = require("path");
const [baum, flag] = process.argv.slice(2);
const f = path.join(baum, "scripts", "diag-boot-stage.cjs");
let t = fs.readFileSync(f, "utf8");
const anker = "            o.da = r.state._weltbildDa ? Math.round(r.state._weltbildDa) : 0;\n";
const zusatz =
    "            try { o.terme = r._weltbildLuecken().map((l) => l.term); } catch (_e) { o.terme = null; } // STATION 2010\n" +
    "            const br = (r.state.architectures || []).filter((a) => a && a.type === \"brunnen_dorf\"); // STATION 2010\n" +
    "            o.brunnen = [br.length, br.filter((a) => a._servedLod != null).length]; // STATION 2010\n";
if (flag === "--zurueck") throw new Error("zurück mit git checkout, nicht hier");
if (t.includes("STATION 2010")) { console.log("schon gepatcht"); process.exit(0); }
if (!t.includes(anker)) throw new Error("Anker fehlt in " + f);
t = t.replace(anker, anker + zusatz);
fs.writeFileSync(f, t);
console.log("gepatcht " + f);

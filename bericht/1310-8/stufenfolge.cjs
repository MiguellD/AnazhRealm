// 1310-8: aus einer Folge der @wahl-Gruppen (JSON-Liste der Schlüssel "f:art|gestalt|stufe:teil") die nach Stufe sortierte Folge
// schreiben — "auf" = L0 zuerst, "ab" = die höchste Stufe zuerst; innerhalb derselben Stufe bleibt die Folge. node stufenfolge.cjs <in> <auf|ab> <out>
"use strict";
const fs = require("fs");
const [ein, wie, aus] = process.argv.slice(2);
const liste = JSON.parse(fs.readFileSync(ein, "utf8"));
const stufe = (k) => { const m = /\|(\d+):/.exec(k); return m ? Number(m[1]) : 99; };
const neu = liste.map((k, i) => ({ k, i })).sort((a, b) => (wie === "ab" ? stufe(b.k) - stufe(a.k) : stufe(a.k) - stufe(b.k)) || a.i - b.i).map((x) => x.k);
fs.writeFileSync(aus, JSON.stringify(neu));
console.log(neu.slice(0, 12).join(" "));

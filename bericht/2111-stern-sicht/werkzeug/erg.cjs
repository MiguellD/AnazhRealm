// erg.cjs <datei> — druckt das "ergebnis" einer werkbank-eval-Ausgabe (oder den Fehler)
const fs = require("fs");
const t = fs.readFileSync(process.argv[2], "utf8");
try { const j = JSON.parse(t.slice(t.indexOf("{"))); console.log(j.ergebnis != null ? j.ergebnis : JSON.stringify(j).slice(0, 300)); }
catch (e) { console.log("FEHL " + t.slice(0, 300).replace(/\n/g, " ")); }

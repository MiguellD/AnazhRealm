// node zeig.cjs <datei> — Hauptbild, gesamt und die Portal-/Tor-Klassen eines werkbank-zaehlen
const j = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));
const r = j.ergebnis || j;
console.log("gesamt", JSON.stringify(r.gesamt), "haupt", JSON.stringify(r.passe && r.passe.haupt));
for (const k of r.klassen || []) if (/portal|^f:|membran|nebel|gt|haus|esse/.test(k.klasse)) console.log("  ", k.klasse, k.cmd, k.tris, JSON.stringify(k.je || {}), k.dMin + "-" + k.dMax);

// node luecken.cjs <trocken-ausgabe> [<meisterkarte-2.json>] — liest die Ausgabe von `node vision/buche-2.cjs --trocken` und nennt
// (1) die Kopfzeile „KARTE 2: n von 1718“ (NUR sie ist die Zahl der Karte), (2) jede Leiter, in der ein PUNKT über einer
// ungebuchten Sprosse liegt: die Lücken-Sprosse zählt mit dem gebankten Punkt darüber DOPPELT. Leitern zählen lückenlos
// (buche-2 „Sprosse 2 ohne Sprosse 1 zählt nicht“); Glieder-Leitern (zaehlung "glieder" in der Karte) zählen je Glied und fallen hier heraus.
const fs = require("fs");
const [aus, karte = "C:/Users/micha/AnazhRealm-pm-pruefland/vision/meisterkarte-2.json"] = process.argv.slice(2);
if (!aus) { console.log("FEHLER: node luecken.cjs <trocken-ausgabe> [<meisterkarte-2.json>]"); process.exit(2); }
const glieder = new Set();
(function w(x) {
    if (Array.isArray(x)) return x.forEach(w);
    if (x && typeof x === "object") { if (x.id && Array.isArray(x.sprossen) && x.zaehlung === "glieder") glieder.add(x.id); Object.values(x).forEach(w); }
})(JSON.parse(fs.readFileSync(karte, "utf8")));
const t = fs.readFileSync(aus, "utf8").split(/\r?\n/), L = {};
for (const z of t) {
    const m = z.match(/^\s+([a-z0-9.\-]+) S (\d+): (PUNKT|KERN|0)\b(.*)$/);
    if (m) (L[m[1]] = L[m[1]] || {})[+m[2]] = { u: m[3], r: m[4].slice(0, 170) };
}
console.log((t.find((z) => z.startsWith("KARTE 2:")) || "KARTE 2: Kopfzeile fehlt").slice(0, 140));
let bank = 0; const zeilen = [];
for (const [id, s] of Object.entries(L)) {
    if (glieder.has(id)) continue;
    let front = 1; while (s[front] && s[front].u === "PUNKT") front++;
    const drueber = Object.keys(s).map(Number).filter((n) => n > front && s[n].u === "PUNKT").sort((a, b) => a - b);
    if (!drueber.length) continue;
    bank += drueber.length;
    zeilen.push(`${id}#${front} zählt ${1 + drueber.filter((n, i) => n === front + 1 + i).length}fach (gebankt S${drueber.join(",S")}) — ${s[front] ? s[front].u + s[front].r : "KEINE Zeile im Leser: keine Station, keine Akte"}`);
}
console.log(`Lücken-Sprossen: ${zeilen.length} · gebankte Punkte darüber: ${bank}`);
console.log(zeilen.join("\n"));

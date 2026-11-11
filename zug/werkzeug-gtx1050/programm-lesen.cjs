// programm-lesen.cjs <lauf.json> [von ms] — die Knoten-Bauten der Erst-Zeichnung (Eingriff programm-log.js) neben den Pipelines:
// je Bau erster Ruf → fertig (Rufe), Objekt ¦ Stoff ¦ Pass; darunter die Pipeline desselben Stoffs (bestellt → fertig).
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const VON = Number(process.argv[3] || 0);
const s = (ms) => (ms == null ? "  —  " : (ms / 1000).toFixed(1).padStart(5));
const pipes = (b.pipes || []).map((e) => ({ an: e[0], ab: e[1], id: (String(e[2]).match(/_(\d+)$/) || [])[1], label: String(e[2]) }));
console.log("MARKEN " + JSON.stringify(b.marken));
for (const e of ((b.extra || {}).programme || []).filter((x) => x[0] >= VON).sort((x, y) => x[0] - y[0])) {
    const id = (String(e[3]).match(/_(\d+) ¦/) || [])[1];
    const p = pipes.filter((q) => q.id === id && q.an >= e[0] - 50).map((q) => s(q.an).trim() + "→" + s(q.ab).trim()).join(" · ");
    console.log(s(e[0]) + " → " + s(e[1]) + " s (" + String(e[2]).padStart(3) + " Rufe) · " + e[3] + (p ? "   ⇒ Pipeline " + p : "") + (e[4] ? "   ‹" + e[4] + "›" : ""));
}

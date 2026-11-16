// Die Rangliste des Vorrats: alle Fehl-Zettel der Lese-Batterie (vision/vorrat/NN-*.json) in EINER Reihe — die billigste Sprosse oben.
// Aufruf im Koordinations-Baum: node vision/vorrat/rangliste.cjs   → schreibt vision/vorrat/RANGLISTE.md und rangliste.json
// GELESEN, nicht gemessen: keine Zeile hier hebt eine Sprosse (R2) — sie sagt, wo der nächste Bau und die nächste Fahrt am wenigsten kosten.
const fs = require("fs");
const path = require("path");
const DIR = __dirname;
const KLASSE = { A: 0, T: 1, F: 2, R: 3, B: 4 };
const BAU = { S: 1, M: 3, L: 8 };
const zeilen = [];
const kaputt = [];
const dateien = fs.readdirSync(DIR).filter((n) => /^\d\d-.*\.json$/.test(n));
for (const n of dateien) {
    try {
        const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
        for (const z of Array.isArray(j) ? j : j.leitern || j.zeilen || []) zeilen.push({ paket: n.replace(/\.json$/, ""), ...z });
    } catch (e) {
        kaputt.push(n + ": " + e.message);
    }
}
const kosten = (z) => (KLASSE[z.klasse] ?? 9) * 100 + (BAU[z.bau] ?? 5) * 10 + Math.min(Number(z.gpuMin) || 5, 9) - (Number(z.sicher) || 0);
zeilen.sort((a, b) => kosten(a) - kosten(b));
const je = {};
for (const z of zeilen) je[z.klasse] = (je[z.klasse] || 0) + 1;
const eingang = fs.existsSync(path.join(DIR, "eingang")) ? fs.readdirSync(path.join(DIR, "eingang")).filter((n) => n.endsWith(".json")) : [];
let soll = 0;
for (const n of eingang) soll += JSON.parse(fs.readFileSync(path.join(DIR, "eingang", n), "utf8")).leitern.length;
const satz = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").replace(/\|/g, "/").slice(0, n);
const kopf = [
    "# Rangliste des Vorrats — die Sprossen der Karte 2 nach Kosten bis zum Paar",
    "",
    "**GELESEN, nicht gemessen.** Keine Zeile hebt eine Sprosse (R2); jede Zahl hier ist eine Schätzung eines Lesers am Spiel-Kopf e4eeee08.",
    "Vor dem Bau einer Zeile: `git log e4eeee08..origin/main -- <Datei>` an den genannten Dateien, dann die Zeile am Fenster prüfen.",
    "",
    "Blätter: " + dateien.length + " von " + eingang.length + " Paketen · Leitern mit Zettel: " + zeilen.length + " von " + soll +
        " · A (Richter steht) " + (je.A || 0) + " · T (nur Tafel-Zeile) " + (je.T || 0) + " · F (Fahrt im Fenster fehlt) " + (je.F || 0) +
        " · R (neuer Richter auf bestehendem Können) " + (je.R || 0) + " · B (Bau im Spiel) " + (je.B || 0) +
        (kaputt.length ? " · UNLESBAR: " + kaputt.join(" ; ") : ""),
    "",
    "| # | Leiter · Sprosse | Kl. | Bau | GPU-min | sicher | Station | fehlt | Preis-Risiko | Paket |",
    "|---|---|---|---|---|---|---|---|---|---|",
];
const reihe = zeilen
    .filter((z) => z.klasse !== "A")
    .map((z, i) => "| " + [i + 1, satz(z.leiter, 60) + " · S " + z.sprosse, z.klasse, z.bau || "", z.gpuMin ?? "", z.sicher ?? "", satz(z.station, 50), satz(z.fehlt, 170), satz(z.preisRisiko, 40), z.paket.slice(0, 2)].join(" | ") + " |");
fs.writeFileSync(path.join(DIR, "RANGLISTE.md"), kopf.concat(reihe).join("\n") + "\n");
fs.writeFileSync(path.join(DIR, "rangliste.json"), JSON.stringify(zeilen, null, 1));
console.log("Blätter " + dateien.length + "/" + eingang.length + " · Zettel " + zeilen.length + "/" + soll + " · " + JSON.stringify(je) + (kaputt.length ? " · UNLESBAR " + kaputt.length : ""));

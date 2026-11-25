// KANDIDAT (knoten-grossstadt) für die Station mensch.netz.verkehr, Sprosse 2 — NICHT die Station. Der Richter entscheidet.
// Soll und Richter-Text der Sprosse bleiben wörtlich („10 Wagen, je ein Bewohner am Steuer“ · „0 Berührung, 0 Stillstand“ ·
// „P · Marktplatz“ · „nH 300, Tag + Nacht, 10 min: 0 / 0 / 100 % am Ziel UND Wagen im Bild“).
//
// WAS DER STATION HEUTE FEHLT (der Eintrag `bestehend 2` der Karte-2-Station): sie nennt pflicht.C#1 als Tafel-Zeile „fehlt“.
// Die Mechanik misst nur die headless Probe `node scripts/diag-fahr-leben.cjs --verkehr` (10 und 23 Uhr je 600 s, zusammen
// etwa 16 min); keine Leiter ≤ 60 s trägt 10 min, und die Sitzung legt keine Akte ab. Drei Teile des Richters stehen damit an
// keiner Station:
//   1. DIE MECHANIK, Tag + Nacht, 10 min (0 Berührung, 0 Stillstand, 100 % am Ziel): am Kopf dieser Abgabe grün, aber nur
//      headless (10 Uhr und 23 Uhr: VK grün).
//   2. WAGEN IM BILD: pflicht.C#2 an stadt-voll, von dieser Abgabe nicht gemessen (kein Bild in der Wolke).
//   3. P · MARKTPLATZ: der Preis am Markt (p95 ≤ 33 ms im Bild). Gemessen ist nur der Sim-Takt (1,04–1,11 ms je Schritt,
//      headless), nicht das Bild.
//
// DER KANDIDAT: der Leser liest die Akte, nicht „fehlt“. Die Probe schreibt je Stunde (10, 23) ihre Zeile `VERKEHR {…}` mit dem
// Kopf, an dem sie fuhr; die Station liest diese Akte am selben Kopf und urteilt am Richter-Text. Was die Akte nicht trägt, bleibt
// beim Namen offen. Ob die Station eine Akte liest oder die Leiter eine längere Frist bekommt, entscheidet der Richter — ohne
// diese Entscheidung bleibt die Sprosse stehen, auch wenn die Mechanik grün ist.
//
// NEBENBEI, SPROSSE 3 („Zeitlücken Median 1–3 s; 0 Konflikte“): dieselbe Probe misst sie schon heute als Linsen-Zeilen
// „Zeitlücke zum Vorderen [Median, p05, n]“ und „Vorfahrt [genommen, Folgen, …]“. Ihr Umfang (10² Teilnehmer an Ampel und
// Übergang) fehlt: die Szene trägt keine Ampel.
const verkehrBestehend2 = {
    2: {
        station: "pflicht.C#1",
        // die Akte der Mechanik: `diag-fahr-leben --verkehr` am selben Kopf, je Stunde die Zeile VERKEHR (10 und 23 Uhr, je 600 s)
        akte: { werkzeug: "node scripts/diag-fahr-leben.cjs --verkehr", zeile: "VERKEHR", stunden: [10, 23], kopf: "gleich" },
        // was die Akte nicht trägt, bleibt beim Namen offen
        fehlt: "Wagen im Bild (pflicht.C#2 an stadt-voll) und P · Marktplatz (Bild p95 am Markt): die Akte ist headless",
    },
};
module.exports = verkehrBestehend2;

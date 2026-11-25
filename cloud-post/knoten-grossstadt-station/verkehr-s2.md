# KANDIDAT (knoten-grossstadt) für die Station `mensch.netz.verkehr`, Sprosse 2 — NICHT die Station

Der Richter entscheidet. Soll und Richter-Text der Sprosse bleiben wörtlich: „10 Wagen, je ein Bewohner am Steuer“ ·
„0 Berührung, 0 Stillstand“ · „P · Marktplatz“ · „nH 300, Tag + Nacht, 10 min: 0 / 0 / 100 % am Ziel UND Wagen im Bild“.

## Was der Station heute fehlt (k2-netz.js, `bestehend 2`)

Die Station nennt pflicht.C#1 als Tafel-Zeile „fehlt“: die Mechanik misst nur die headless Probe
`node scripts/diag-fahr-leben.cjs --verkehr`. Sie fährt 10 und 23 Uhr je 600 s, zusammen etwa 16 min. Keine Leiter ≤ 60 s trägt
10 min, und die Sitzung legt keine Akte ab. Drei Teile des Richters stehen damit an keiner Station:

1. **Die Mechanik, Tag + Nacht, 10 min:** 0 Berührung, 0 Stillstand, 100 % am Ziel. Heute grün, aber nur headless
   (Kopf dieser Abgabe, 10 Uhr und 23 Uhr: VK ✅).
2. **Wagen im Bild:** pflicht.C#2 an stadt-voll, von dieser Abgabe nicht gemessen.
3. **P · Marktplatz:** der Preis am Markt (p95 ≤ 33 ms im Bild). Gemessen ist nur der Sim-Takt
   (1,04–1,11 ms je Schritt, headless), nicht das Bild.

## Der Kandidat: der Leser liest die Akte, nicht „fehlt“

Die Probe schreibt ihre Zeile `VERKEHR {…}` je Stunde (10, 23) mit dem Kopf, an dem sie fuhr. Der Kandidat lässt die Station
diese Akte lesen und urteilt am Richter-Text:

```js
// k2-netz.js, mensch.netz.verkehr — bestehend 2 (Kandidat; Soll und Richter unverändert)
2: {
    station: "pflicht.C#1",
    // die Akte der Mechanik: `diag-fahr-leben --verkehr` am selben Kopf, je Stunde die Zeile VERKEHR (10 und 23 Uhr, je 600 s)
    akte: { werkzeug: "node scripts/diag-fahr-leben.cjs --verkehr", zeile: "VERKEHR", stunden: [10, 23], kopf: "gleich" },
    // was die Akte nicht trägt, bleibt beim Namen offen
    fehlt: "Wagen im Bild (pflicht.C#2 an stadt-voll) und P · Marktplatz (Bild p95 am Markt): die Akte ist headless",
},
```

Ob die Station eine Akte liest oder die Leiter eine längere Frist bekommt, entscheidet der Richter. Ohne diese Entscheidung
bleibt die Sprosse stehen, auch wenn die Mechanik grün ist.

## Nebenbei: die Maße der Sprosse 3 stehen als Linse

Sprosse 3 („Zeitlücken Median 1–3 s; 0 Konflikte“) misst dieselbe Probe schon heute: „Zeitlücke zum Vorderen [Median, p05, n]“
und „Vorfahrt [genommen, Folgen, …]“. Ihr Umfang (10² Teilnehmer an Ampel und Übergang) fehlt: die Szene trägt keine Ampel.

# Vorrat 17 — same.massstab · same.gedaechtnis · same.preis (Kopf e4eeee08)

**Zählung A 1 · T 0 · F 5 · R 6 · B 2 (14 Leitern) — gelesen: 14 von 14 Ziel-Sprossen, die alten Stationen an ihrer Fundstelle zu etwa 70 %
(die zehn tragenden ganz, profiband K2/K3 und ankunft K3–K5 nur im Kopf). Alles gelesen, nichts gemessen.**

## Die fünf billigsten Sprossen

1. **same.preis.zugang S1 (A, 2 min je Gerät).** Die Tafel-Zeile steht, es fehlt nur die frische Fahrt; die letzte Fahrt war ROT (6 harte
   Zeilen Radeon, 8 GTX, alle aus `_hudSchreib`). Die drei Täter sind am Kopf gelesen geheilt (werkstatt-hud.js:1324-1328, dirigent-ankunft.js:1365).
2. **same.preis.bytes S1 (R, Bau S, 2 min).** Ein Network-Zähler (Muster g4.js:43-51) in den Kalt-Boots von ANKUNFT_VIER (g6.js:1254) zählt den
   ganzen Kalt-Boot je Gerät. Die Datei-Summe von ≈ 15 MB liegt weit unter der Schranke von 50 MB, gelesen also eher grün.
3. **same.massstab.physik S1 (R, Bau S, 3 min).** Schwere aus dem Welt-Gesetz, freier Körper und μ-Bremsung gibt es schon (feld-leben.js:1922,
   koerper-frei.js:534); es fehlt nur eine Probe, die einen Fall aus 10 m (Soll 1,428 s) und den Bremsweg gegen v²/2μg misst. Kein Preis-Risiko an der Wiese.
4. **same.preis.ankunft S2 (F, Bau S, 5 min).** Die vier Kalt-Boots stehen an beiden Geräten (7–8,9 s, Soll 20 s); es fehlt die Lücke ≤ 2 % je
   Boot, die heute nur ankunft.K2#1 an der Radeon misst, und nur einen Boot. Kandidat zum Zusammenlegen: dieselbe Erweiterung von ANKUNFT_VIER wie bei Nr. 2.
5. **same.gedaechtnis.pfad S1 (F, Bau S, 5 min).** Den Pfad gibt es im Spiel (dirigent-takt.js:1176), headless gehalten (13 → 3 Büschel, über
   den Reload). Die Gang-Schleife (g1.js:760-790) muss in die GPU-Sitzung, dazu ein Bild-Maß statt der Zählung von Instanzen.

Danach kommen takt S1, ausdauer S1 und speicher S1. Sie sind als Richter billig (Bau S, Urteil auf bestehenden Sitzungs-Proben), aber nach den
gelesenen Zahlen ROT: Radeon p95 42,4 ms an der Wiese, Heap +185 MB/min, Heap am Dorf 417–549 MB, VRAM im Einlauf 143 MB.

## Funde über das Paket hinaus

- **EIN Probe-Ausbau trägt zwei Sprossen.** ANKUNFT_VIER (g6.js:1254) mit einem Netz-Zähler und Schuss + Lücke je Boot trüge bytes S1 und
  ankunft S2 zugleich. Die Frist der Probe (120 s) muss dafür steigen.
- **Der Preis-Lauf ist schon ein Richter-Rohstoff.** Jede Akte trägt Bild-p95, Heap und VRAM nach GC an der Pose der Probe (punkte.cjs:2974-3014).
  takt S1, speicher S1 und ausdauer S1 könnten auf einem Urteil über Strom und Posten der Sitzung reiten, ohne neue Fahrt.
- **Die Profiband-Proben sind seit 63655917 UNGEMESSEN.** Ursache: die Grundstellung bricht (creatures, „Quin“ fehlt). Das blockiert jede Sprosse,
  die auf PB_PROBE_GANG oder PB_PROBE_DAUER reiten will (takt, ausdauer, speicher).
- **Widerspruch in der Karte:** speicher S1 fordert VRAM ≤ 118 MB, die Preis-Treppe Ort nennt ≤ 256 MB. Die Radeon liegt dazwischen
  (109 MB nach GC, 143 MB im Einlauf), das Urteil kippt also an der Wahl der Zahl.
- **ankunft S2 „Dorf (10² Häuser)“:** der Ankunftsort ist per Gesetz dorffrei (siedlung-ort.js:1658, spawnClearM). Zu entscheiden ist, ob das Dorf
  im Bild stehen muss oder nur in der geladenen Welt.
- **Beleg-Drift:** nahe nennt bild-sicht.js:3861, am Kopf steht HOEHLEN_AUGE_M auf :3872. Die Aussage stimmt, nur die Zeile ist gewandert.
  Der Satz des alter-Belegs „Nässe-Dosis ist ein Zähler, keine Funktion von t“ gilt am Kopf weiter (bild-himmel.js:2663-2669).
- **sprung S1:** Der Spieler hat kein Teleport-Verb; den Sprung setzt die Probe, und die Welt übernimmt ihn (dirigent-takt.js:1195). Der Preis
  reißt an beiden Geräten (41,9 / 49,9 ms > 33), die Zeit bis „steht“ an der Radeon (45–58 s > 30). Das ist ein Preis-Bau, kein Stations-Bau.
- **B-Bauten:** spanne S1 braucht ein Steig-Verb (koerper-bewegung.js:228 als Muster, M). schicht S1 braucht ein Boden-Profil nach Tiefe in EINER
  Quelle für Inventar und Wand (vegetation-wiese.js:2366, stoff-material.js:2990, M).

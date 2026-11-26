# Post an hydro-samen — Koordinator, 26.11. 01:52

**Dein Kopf 41840fb6 ist angenommen** (PROBE-TAG OK, sauber gegen main): Batterie und Probe laufen, bei Grün stemple ich
`w28-hydro-samen`. Deinen Stations-Diff (`cloud-post/hydro-samen-station.diff`) habe ich gegen die Spitze von `punkte-maschine`
(dae86769) gelegt — er greift sauber, `node --check` grün; ich setze ihn NACH der Landung (vorher kennt main `_hydroSaat` nicht) und
lasse je Gerät EINEN gezielten Lauf fahren. Damit kann `same.kopplung.kohaerenz#1` buchen.

**Mein Auge auf dein Bild** (`flussnetz-welt-und-drei-saaten.jpg`): vier eigene Netze, keines ein Abzug der Welt — der Schnitt trägt.
Was das Bild außerdem beim Namen nennt, ist das Gesetz des Netzes selbst, und das ist dein nächster Kopf:

1. **Stern-Knoten:** 4 bis 8 Zuflüsse münden in EINEN Punkt (Welt-Saat 6, same-saat-29 8). Ein gewachsenes Netz verzweigt
   dendritisch — an einem Knoten treffen sich zwei Läufe.
2. **Geraden bis ≈ 600 m:** die Zuflüsse sind Linien (`MAEANDER`, gelaende-core ≈ :854: gerade ab 1,5 % Gefälle) — ein Lauf folgt dem
   Relief, er ist keine Strecke zwischen zwei Punkten.
3. **Sinus-Mäander:** eine Wellenlänge, eine Amplitude, über den ganzen Lauf.
4. Deine eigenen offenen Zahlen gehören zur selben Wurzel: 9 von 101 Saaten unter 95 % (der Lauf wird auf der glatten Makro-Fläche
   geroutet und danach gesetzt), 56 % der Läufe enden am Rand der Region.

**Dein nächster Kopf — Zweig `fluss-netz`, EIN Commit auf dem dann aktuellen main (nach der Landung von w28-hydro-samen):**

- ZENSUS VOR BAU (zuerst lesen, nichts schneiden): (a) main: `flussLaeufe`, `MAEANDER`, `hydroSampleRiverSurfaces` :6757,
  `hydroRiverSpiegel` :6784 in `gelaende-core.js`; (b) der geparkte Zweig `fluss-fuellung` 0b54d65d (Blatt
  `cloud-post/fluss-fuellung.md`, 29 Dateien, ≈ 45 %): dort steht schon „Ebene 0 des Netzes“ mit `mulde` (Priority-Flood nach Barnes,
  Lehman & Mulla 2014; Fill-Spill-Merge nach Barnes, Callaghan & Wickert 2021) und `seeBilanzNetz` — und drei rote Tore
  (gate:gelaende-realismus 8/12 statt 12/12, gate:worker-dichte --faden „kein Feld des Staus“, gate:wasser-leben N2 EIS). Urteile mit
  Zahl: was davon trägt (und wird übernommen), was fällt. Zwei Netze nebeneinander gibt es nicht — EIN Gesetz.
- INFORMIEREN bei den Profis, je Quelle eine Zahl als Band: Horton 1945 / Strahler 1957 (Verzweigungs-Verhältnis R_B ≈ 3–5,
  Längen-Verhältnis R_L ≈ 1,5–3,5), Hack 1957 (L ∝ A^0,6), Flint 1974 (S ∝ A^−θ, θ ≈ 0,4–0,6 — das Maß von
  gate:gelaende-realismus), Leopold & Wolman 1960 (Mäander-Wellenlänge ≈ 10–14 Gerinne-Breiten), Wang et al. 2018 (≈ 4 von 5 Läufen
  enden im Meer, der Rest endorheisch). Prüfe jede Zahl an der Quelle, ich nenne sie aus dem Kopf.
- TÄTER-ZAHL VORHER über 101 Saaten (dein K8-Fächer): Knoten mit ≥ 3 Zuflüssen (Anzahl, Anteil), längste Gerade je Lauf, R_B, R_L,
  Hack-Exponent, Anteil der Läufe mit Ende „Rand“.
- EIN Schnitt an der Wurzel (das Netz entsteht aus dem Abfluss über das ECHTE Relief der Lage — D8/D∞ über die Fläche, die der Kern am
  Punkt nimmt —, nicht aus Strecken zwischen Punkten); Kosten gebunden an die gefragte Region (dein Maß: 70 ms je Saat im Faden ist
  die Latte, nenne vorher ↔ nachher).
- LINSE in der Familie `gate:worker-dichte` (K8 daneben) oder `gate:gelaende-realismus`, vorher ROT am Täter (Stern-Knoten beim
  Namen), mit Selbsttest; Konsum-Leser: Station `same.kopplung.kohaerenz#1` (je Saat ≥ 95 %) und `leben.wasser.bild#1`.
- BILD: dasselbe Vier-Saaten-Bild vorher ↔ nachher im Blatt.
- Die Standard-Welt WIRD sich bewegen (das Flussnetz der Heimat ändert sich) — das ist ein Vertragsakt mit Zahl: nenne, welche
  Goldens und welche Messorte sich um wie viel bewegen; kein stilles Byte-Gleich.

**Die Wand:** kein Wort der Siegel-Wand in irgendeinem Betreff oder Rumpf (auch WIP, auch als Sach-Wort):
`git log --format=%B origin/main..HEAD | grep -n -i -E "\b(fertig|vollendet|vollzogen|schluss)\b|scope\s+zu"` und
`grep -n -E "\bRUND\b"` bleiben leer. Vor dem Schub: `sh artifacts/profiband/werkzeug/zug.sh probe-tag <zweig>@<sha>` sagt „PROBE-TAG OK“.

Stand der Karte 2: 118 von 1 718. Status ZWISCHENSTAND.

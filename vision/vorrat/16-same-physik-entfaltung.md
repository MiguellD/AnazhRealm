# Vorrat 16 — same.physik + same.entfaltung (14 Leitern, gelesen am Spiel-Kopf e4eeee08)

**Zählung:** A 0 · T 2 · F 4 · R 1 · B 7 — gelesen: 14 von 14 Leitern, je Leiter die tragenden Stellen im Spiel und die Station an
ihrer Fundstelle; geschätzt etwa 70 % dessen, was ein volles Urteil bräuchte (vielfalt, stoffe und gleichheit nur angelesen, keine
Akte am Kopf außer mensch.K2#2 nachgeprüft). Alles „gelesen“, nichts gemessen.

## Die fünf billigsten Sprossen

1. **same.physik.fluid S1 (T)** — gelaende.K2#1 urteilt schon in der Sitzung beider Geräte genau den Richter (Graben über das Verb,
   gefüllt im Ausgabe-Bild ≤ 2 s). Es fehlen nur die Tafel-Zeile und das Paar am SELBEN Kopf (Radeon b3f9ae95, GTX 715754fc);
   Preis-Risiko p95 am Fluss, und die Station fängt an der Radeon den echten Mauszeiger.
2. **same.entfaltung.schirm S1 (T)** — pflicht.E#1 (g6.js:3450) urteilt Bild-p95 ≤ 33 ms an Wiese und Genesis × Ego und Third,
   Probe PB_PROBE_GANG, beide Geräte. Tafel-Zeile setzen und prüfen, dass richter-akte.cjs eine `pflicht: true`-Station liest.
3. **same.physik.verformung S1 (F)** — der Flegel schwingt im Spiel-Takt (koerper-seele.js:849/880), physik.K4#1 misst Länge ±2 %
   nur im Null-Renderer. seilProbe als Probe in die Sitzung heben und die Länge aus den gezeichneten `__seil`-Teilen lesen, Wiese, ~2 min.
4. **same.physik.koerper S1 (F)** — der Starrkörper-Löser läuft im Takt (dirigent-takt.js:1178), das Fass ist ein `frei`-Bauplan
   (bau-vorlagen.js:1024), Bau-Boxen tragen als ruhende Kisten. Die Probe physik.K3#1 (headless, 5 Kisten) ersetzen durch ein Fass
   über der Traufe in der Sitzung, Bild-Spalt nach dem Muster von physik.K2#2.
5. **same.physik.feuer S1 (B, S)** — Zünden mit Feuchte-Halt und Eis stehen im Spiel, aber der einzige Zünder des Spielers ist das
   Brennglas; eine Fackel fehlt (0 Treffer). Ein Gerät, das `_brandEntfachen(x, z)` am Zielpunkt ruft, plus EINE Probe für trocken/nass
   und das Eis.

## Funde über das Paket hinaus

- **Eine Station, zwei Leitern:** gelaende.K2#1 steht schon in der Tafel für mensch.nahrung.erdbau S1. Eine Fahrt am selben Kopf
  an beiden Geräten hebt mit der neuen Zeile auch same.physik.fluid S1.
- **Beleg veraltet (fluid):** „die Grube füllt sich im Code, im Spiel-Bild nie gesehen“ stimmt nicht. gelaende.K2#1 misst die Füllung
  im Ausgabe-Bild an Radeon und GTX.
- **Beleg veraltet (abwesenheit):** „die Abwesenheits-Probe wurde nie gefahren“ stimmt nicht. mensch.K2#2 fährt sie an e4eeee08 auf
  beiden Geräten (0 von 1 232 Lagen über ±2 m). Laut dieser Akte reißt der Richter der Karte (≤ 1 m) aber: max 1,826 m. Das ist ein
  kleiner Spiel-Schnitt in `_bewohnerAnkunft`, kein neuer Richter.
- **Beleg gilt (tragen):** knickSicherheit 500 steht am Kopf unverändert (bau-buch.js:2588). Wer ihn auf einen realen Wert setzt, muss
  im selben Schnitt den Statik-Prüfsatz von bauen.K3 nachziehen.
- **Ein Bau, zwei Leitern:** Luftwiderstand im Löser der freien Körper (koerper-frei.js:421) trägt same.physik.flug S1. Derselbe Löser
  mit Stoff je Bauplan (statt fest Holz) ist der Kern von same.physik.stoffe S1.
- **Rauch nicht proportional (reaktion):** `_brandRauch` deckelt die Ballen-Rate über `anteil` (feld-leben.js:3052). Bei großen
  Bränden steigt die sichtbare Rauchmenge also nicht mit dem Brand. Das stört jeden Richter, der „Rauch ∝ Brand“ verlangt.
- **Gleichheit über Geräte ohne Querbezug:** Die Punkte-Maschine urteilt je Gerät. Ein G2↔G3-Richter wird buchbar, wenn jedes Gerät
  gegen dieselbe gerechnete Wahrheit misst (Horizont aus `hoehe`, ≤ 1 px je Gerät ⇒ ≤ 2 px zwischen ihnen). Dasselbe Muster trüge die
  Radeon↔GTX-Hälfte von gleichheit S2.

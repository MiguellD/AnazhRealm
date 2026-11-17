# w28-glut-nacht — ZWISCHENSTAND (GTX 1050, 17.11., auf main d39e0d6e, V18.546.326)

Anlass: Auftrag des Koordinators (Kopf 1 von zweien) — der Feuerschein steht nachts rosa an Brunnen, Flamme + Rauch,
Lava-Rissen und Tor; schneiden an der EINEN Stelle (`stamm/bild-kosten.js` `_nachtAuge`), kein Weg je Leser. Kopf 2
`w28-auge-quelle` (die Belichtung liest das Licht im Blick) folgt nach der Landung.

## Befund (eine Messung vor dem Schnitt, Bilder `glut-mess-a-nf0`, `glut-mess-b-ktag`)

Ohne das Auge der Nacht ist das Rosa weg, die weiße Scheibe bleibt; mit der Belichtung des Tags schrumpft die Scheibe und
bleibt rosa. Zwei Wurzeln: (1) das Auge addiert sein Grau auch auf Pixel weit über Bild-Weiß und liest die Stäbchen
photopisch — Kopf 1; (2) die Belichtung der Nacht × der Licht-Pool am Boden (die Scheibe trägt das 5,1- bis 11,5-Fache von
Bild-Weiß) — Kopf 2. Die Brunnen-Flamme ist KEIN Konsum-Verlust: der Glut-Stoff im Satz trägt `leucht` 2,5 (fachwerk
`LEUCHT_FEUER`), sein Emissiv ist Vertex-Farbe × 2,5; sie liest sich „aus", weil die Scheibe ringsum über Weiß steht.

## Geschnitten (alles in `_nachtAuge`, Tafel `NACHT_AUGE`)

- **Die Blende am Bild** (`bildZapfen` 0,18 … 1): der Stäbchen-Anteil blendet von Mittelgrau bis Weiß (Leuchtdichte ×
  Belichtung) aus — ein Pixel über Bild-Weiß sieht das Auge mit den Zapfen.
- **Das Grau der Stäbchen ist skotopisch** (`skotopisch` 0 · 0,5437 · 0,3599): V′ = −0,702·X + 1,039·Y + 0,433·Z (Pattanaik
  et al. 1998) durch die sRGB→XYZ-Matrix, das Rot auf 0 — Feuerschein hebt das Grau um sein S/P-Verhältnis weniger.
- **Die EINE Stärke** (`staebchenStaerke` 1,22): ihr Zweck war immer „der Boden bleibt nachts lesbar" — Anker = der Boden
  1–3 m der Prüfbühne S0 um Mitternacht ohne Feuer trägt dieselbe Luma wie main (24,1 ± 0,3). Der Mondton war die
  Herleitung für die FORM (V′), der Boden ist der Zweck der STÄRKE (Koordinator 17.11.). Gemessen: 1,012 (am Mondton) →
  21,6 (Soll ≥ 22 reißt) · 1,3 → 25,1 · 1,22 → 24,1.
- **Die Umkehr folgt ihrem Urbild** (`umkehrSchritte` 3): unter dem skotopischen Grau bleibt die Leuchtdichte nicht gleich;
  der Anteil am gesehenen Ton gelesen schoss über (Tor-Dunkelrot Tag 93 → Nacht 119). Zwei Schritte geben 96, drei 93.
- **Linse `gate:post-kette` (j), nur enger:** Mantel-Ratsche `nachtSatt` 0,53 → 0,75 · Tor-Dunkelrot steht an Tag = Nacht
  ≤ 6 (seine Ratsche 0,6 und die Wand der Helle sind gefallen) · NEUER Fall KERN `blende`.
  WARUM DIE KERN-ZEILE DREHT: bis hierher musste der Kern OHNE die Umkehr reißen (das Auge wusch ihn, die Umkehr holte ihn
  zurück — die Mutante bewies, dass die Probe sieht). Nach dem Schnitt steht der Kern über Bild-Weiß und das Auge lässt ihn
  in Ruhe: er muss ohne Umkehr HALTEN (Δ ≤ 6). Reißt er, fehlt die Blende und der Feuerschein steht wieder rosa — der
  Stand von main (Δ 29) ist Selbsttest-Fall und fällt rot beim Namen. Dass die Probe sieht, beweist weiter der Mantel
  (ohne Umkehr Sättigung 0,638 < 0,75).
- **Linse `gate:pruefbuehne-licht`, die Mutante „Glut-Palette" urteilt an der DIFFERENZ** (`S0_TON.paletteUnter` 2°): sie gilt als
  gefangen, wenn ihr Farbton mindestens 2° UNTER dem des Kopfs im selben Lauf liegt; das Band 28–45° bleibt für den Kopf
  unberührt. Die alte Fassung fing die Mutante nur, weil das Rosa des alten Auges sie unter 28° zog — die Linse lehnte am
  Fehler (am neuen Auge steht die Mutante bei 29,1° im Band, BLIND). Drei Läufe auf der Karte: Mutante 29,1°, Kopf 32,2°,
  Differenz 3,1 · 3,1 · 3,1 (Bedingung des Koordinators: die kleinste ≥ 2,5).

## Gemessen (Mess-Wiese, 960 × 540, Sommer trocken, Mitternacht; main 16f45362 ↔ Endkopf; Bilder `glut-m-*` ↔ `glut-e-*`)

| Leser | Zahl | Tag | main | Endkopf |
| --- | --- | --- | --- | --- |
| Gras im Feuerschein (unteres Fünftel) | Farbton · Sättigung | 48,8° · 0,81 | 29,0° · 0,485 | 32,4° · 0,672 |
| Rauch über 1 m, Feld mit Himmel | Sättigung · Luma | 0,39 · 104 | 0,404 · 76,0 | 0,475 · 62,2 |
| Rauch, nur Rauch-Pixel | Farbton · Sättigung | 34,6° · 0,450 | 20,9° · 0,467 | 23,3° · 0,643 |
| Flamme | Pixel Orange (10–45°, S > 0,5, V > 0,5) | 28 532 | 23 121 | 30 168 |
| Brunnen, Licht-Scheibe (14 863 px) | Sättigung · ausgebrannt min(R,G,B) > 0,85 | — | 0,446 · 1,0 % | 0,583 · 1,0 % |
| Lava-Risse | am Bild (`glut-e-lava-nacht` ↔ `../1711-lava-zuendet/lava-main-nah-nacht`) | satt orange | blass-rosa | orange |

- Linse (j), echte Karte, Tag ↔ Nacht (ohne Umkehr): KERN [249,184,122] ↔ [249,184,121] (Δ 0) · MANTEL [200,118,18] ↔
  [199,116,41], Sättigung 0,794 (0,638; main 0,573) · Tor GOLD Δ 0 (Δ 10) · Tor DUNKELROT [93,9,2] ↔ [93,8,2] ([46,4,3];
  main [111,35,35]).
- Prüfbühne S0 (`gate:pruefbuehne-licht`, echte Karte): mit Feuer Boden Farbton 32,3°, Sättigung 0,627 (Soll 28–45°,
  ≤ 0,75), Feuerkreis 0,593; ohne Feuer Luma 24,1 (Soll ≥ 22). Die Mutante „Auge des Tages" reißt weiter.
- Gegenprobe Nacht ohne Feuer gegen main (`glut-{m,e}-dunkel-nacht`): ganzes Bild 4,04/255; Wiese 3,0–3,1 · Bäume 3,1 ·
  Himmel 7,2.

## Ehrlich offen

1. **Die weiße Scheibe am Brunnen bleibt:** 1,0 % ausgebrannt, 5,1- bis 11,5-fach über Bild-Weiß — Kopf 2.
2. **Die Rauch-Ränder tragen einen staubigen Stich:** Sättigung der Rauch-Pixel 0,643 (Tag 0,450, main 0,467), im Feld
   mit Himmel 0,475.
3. **Der Nachthimmel steht 7,2/255 heller und grauer als main** (19,9/24,9/32,4 → 28,4/32,2/38,2) — die Folge der Stärke
   am blauesten Ding des Bilds, gewollt, vom Koordinator am Bild entschieden.
4. **Gegenprobe ohne Feuer 4,04/255** (größter Farbton-Sprung 29° an einer Krone); die Pose trägt einen Glutbrunnen.
5. **Die zwei Sonderwege bleiben** (Umkehr an der Flamme `stamm/feld-leben.js` `_brandFlammenZeichnen`, am Zielbild des
   Tors `stamm/siedlung-tor.js` `_membranGraph`): Töne unter Bild-Weiß tragen weiter den Stäbchen-Anteil — ohne Umkehr
   Mantel [163,106,59] statt [199,116,41], Dunkelrot [46,4,3] statt [93,8,2], Gold Δ 10 statt Δ 0. Nur der Kern hält ohne.
6. **`aGlut` reist ungelesen** an den 245 Ecken des Glut-Stoffs der Feuerstelle (Stoffe mit `leucht` lesen ihr Emissiv aus
   der Farbe): 8 Byte je Ecke (float16x4), 1 960 Byte je Feuerstelle im Umkreis der Messung.
7. **kaskade p95 an einer Brand-Szene ist nicht gemessen.** Die Post-Kette am Flammen-Bild: Kopf 0,97–1,05 ms ↔ main
   1,00–1,01 ms je Bild (40 Bilder × 6 Runden) — kein Unterschied über dem Rauschen; die absolute Zahl ist keine Bildzeit.
8. **kaskade#1 und ereignis#1 sind an beiden Geräten neu zu messen.** Auf der GTX 1050 gemessen (`stationen-nach-lava-zuendet.md`):
   der Glut-Kopf verschiebt keine der beiden Zahlen (beide Schüsse am Mittag, das Auge trägt dort 0) — kaskade +3 ↔
   31d156e8 +0 (Soll ≥ 200), ereignis an beiden Köpfen verweigert („Welt steht nicht"); beide Röten kamen mit w28-lava-zuendet.
9. Fenster / Feuerschein im Dorf: 0 Quellen „fenster"/„herd" im Umkreis 90 m um den Dorf-Messort — dieser Leser ist nicht
   belegt.
10. Vom Koordinator am Bild benannt, nicht in diesem Kopf: der Rauch trägt bis in die oberste Wolke dasselbe helle Orange,
    der Schein färbt den ganzen Vordergrund gleich stark.

## Tore am Endkopf (GTX 1050)

Am Kopf 83795c09 (WIP 8d0fe947 + main d39e0d6e gemergt), 17.11. 19:53–20:21, je EXIT=0: format:check · check · gate:welt-boot ·
playtest · gate:stand-takt (mit --narbe) · gate:post-kette (Selbsttest + swiftshader) · gate:post-kette auf der Karte (29 s:
KERN Δ 1 · MANTEL Sättigung 0,794 · GOLD Δ 0 · DUNKELROT Δ 1) · gate:pruefbuehne-licht auf der Karte (64 s: S0 BILD GRÜN, der
Feuerkreis aus 2 m in der Ausgabe am Tag, Nacht ohne Feuer Luma 24,1, schwarz 0; Mutante Glut-Palette 29,1° ↔ Kopf 32,2°,
3,1° darunter; Mutante „Auge des Tages" reißt an Sättigung 0,781).
Das Schild der Abgabe trägt `gate:pruefbuehne-licht`: die GTX 1060 liest die neue Zeile der Linse vor dem Zug.

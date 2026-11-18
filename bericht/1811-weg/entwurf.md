# w28-weg-koerper — Entwurf (ZWISCHENSTAND, OMEN GTX 1060, 18.11.)

Zweig `w28-weg-koerper-neu`, Kopf **3ecbb9554** (main fa61024d eingemergt über f8f72fb05). Ich stemple nicht.

## Geschnitten

Der Weg ist ein Körper aus EINEM Gesetz, nah und fern, ohne Geometrie und ohne Befehl (dc +0):

- **Das Gesetz** `fachwerk:WEG_GESETZ` (fachwerk-core.js:10096): Bord (hochM 0,12 · breitM 0,16 · steinM 1 · rinneM 0,3), Kante des
  Pflasters, Töne je Teil des Querschnitts, `fernM` 30, und die ART je Rang (`pfad` · `gasse` · `pflastergasse` · `strasse` · `platz`).
  `wegArt` (:10109) und `wegQuerschnitt` (:10116) leiten Art und Querschnitt aus Belag × Rang ab.
- **Die Karte**: das Pflaster trägt zwei Höhen im selben Byte — bis `gehAnteil` seine Deckung, darüber die Lage zum Bord, linear
  über ±1 m (fern ±2 m). Der Boden-Stoff liest daraus den Abstand zum Bord in Metern; die Mischung bleibt reihenfolgefrei.
- **Der Boden-Stoff** `_wegBord` (stamm/siedlung-wege.js:1392): Schatten des Bords = hochM × (−n · s.xz) ÷ s.y auf der Fahrbahn,
  Flanke aus der Augenhöhe (eigener Ton 0,62, Normale waagrecht), Bordstein mit Stoßfuge, Rinne, Ton der Fahrbahn, Kante jedes
  Pflasters (auch Gasse und Platz: es endet an einer Reihe Randsteine statt in Erde auszulaufen). Relief bis 30 m, halb ab 15 m.
- **Die Ferne**: das Band der Ferne trägt den Ton des Wegs (Erd-Gasse = getretene Erde, Fahrstraße = Mittel aus Fahrbahn und Gehweg);
  nah und fern bauen ihr Stück Gasse über DIESELBE Form `_wegStueck`.
- **Die Farbe des Pflasters** (porta `farbe.pflaster` 0x70747a, `kopfstein.stein`): der begangene Stein statt des frischen Granits.
  **Tore byte-gleich (granit unberührt):** `farbe.granit` 0x8e939a steht, sein Leser porta-core.js:1330 ist unverändert, kein Golden
  angefasst, gate:asset-contract GRÜN.

## Leser des Gesetzes (Kopf 3ecbb9554)

| Leser | Stelle | liest |
|---|---|---|
| `wegArt` → `kachelMassen` (Ferne: Art je Straße) | fachwerk-core.js:4084 | art |
| `wegQuerschnitt` | fachwerk-core.js:10116–10124 | art · bord.hochM |
| `_wegKantAnteil` (Kante des Pflasters) | stamm/siedlung-wege.js:1373 | kant.breitM |
| `_wegBord` (Boden-Stoff, Leser `_wegeBodenFarbe` :1234) | stamm/siedlung-wege.js:1393 | bord · ton · fernM |
| `_stadtFerneBand` (Ton des Bands der Ferne) | stamm/siedlung-wege.js:2300 | art · ton.fahr |
| `_wegStueck` (Form in der Karte, nah + fern) | stamm/siedlung-wege.js:2339 | art.bord |
| `_stlWegeRaten` über `wegQuerschnitt` (Gassen, Feldwege) | stamm/siedlung-wege.js:2491 · :2496 | Querschnitt |
| Linse gate:weg-boden Teil 10 (+ Störung `ohnebord`) | scripts/diag-weg-boden.cjs:189–196 | art · Querschnitt |

Die Kodierung der Karte (`gehAnteil` 0,5 · `fahrRandM` 1 · `kantWeich` 0,08) steht in `WEGE_KARTE`, nicht im Weg-Gesetz: sie ist
das Format des Bytes, das Maler, CPU-Leser und Boden-Stoff teilen.

## Gemessen

**Bedingung 1 — der Schatten des Bords** (9 m senkrecht über der Fahrbahn an der `kante`, `bord-mass.cjs`, 78 px je m):

| Fall | Sonne | Soll | Ist | Urteil |
|---|---|---|---|---|
| Sonne des Gesetzes quer, 18° hoch | gestellt | 0,369 m | 0,338 m (−8 %) | GRÜN |
| Sonne im Zenit (Mutante) | gestellt | 0 | 0 | LEER |
| hochM → 1e-4 (Mutante), Sonne quer 18° | gestellt | — | 0 | ROT „kein Band“ |
| 07:12, Licht der Szene | 18° hoch, LÄNGS der Straße | 0,023 m | 0,018 m | GRÜN (unter 2 px) |
| Mittag, Licht der Szene | 74° hoch | 0,034 m | Bord im Schlagschatten des Hauses | nicht gemessen |

Vorbehalt: an der `kante` läuft die echte tiefe Sonne längs der Straße. Die Breite des Bands ist deshalb mit gestellter
Sonnen-Uniform bewiesen (das Band liest nur `uSunDir`), nicht mit dem Licht der Szene.

**Bedingung 2 — die Flanke**: aus Augenhöhe an der `kante` und der `hauptstrasse` steht der Bord als Stufe mit hellem Bordstein und
dunkler Flanke (Bilder `kante-*-nach`, `hauptstrasse-*-nach`); aus 14 m (`boden-ost-nach`) bleibt eine ruhige Linie. Geprüft an
Standbildern — den Gang über die Hauptstraße auf Flimmern habe ich NICHT gefilmt.

**Der Preis** (main 1f3002606 ↔ Kopf f8f72fb05 vor dem Merge, Boote im Wechsel, Median):

| Ort | Boote | Frame p95 | GPU ms p50 / p95 | dc mittel / p95 |
|---|---|---|---|---|
| `kante` („dorf 7 4750“) | 5 ↔ 4 | 25,05 → 25,01 | 2,74 / 3,37 → 2,75 / 3,41 | 79 / 85 → 79 / 85 |
| „dorf 7 42750“ Stand | 5 ↔ 4 | 25,03 → 25,04 | 2,27 / 2,95 → 2,27 / 2,90 | 58 / 63 → 58 / 63 |

Frame p95 +0,0 ms (Grenze +0,3), dc +0. Das Frame-p95 steht an beiden Orten auf der 25-ms-Stufe des Bildtakts; die GPU-Zeit ist
die feinere Zahl. Die Häuserzahl im Stadt-Stand ist nicht bootgleich (1388 ↔ 1549, Fund 08:00), auf beiden Seiten.

**Die Zeichen-Ratsche**: Boden-Programm 98 747 → 102 120 Zeichen WGSL (+3 373; auch am gemergten Kopf 102 120). `S0_ZEICHEN`
gehoben auf Stand 102 120, Luft 2 % (Wort des Koordinators 08:55), Selbsttest GRÜN. Kalte Übersetzung in derselben Sitzung,
Median: Kopf 1171 · main 1047 · Kopf 1073 ms (K17-Verhältnis 0,75 · 0,75 · 0,73); weitere Läufe main 1332, Kopf 1094 · 1249 · 1118.
Kopf-Mittel der Dreier-Folge +7 % (unter der 8-%-Linie, knapp); über alle sieben Läufe liegt kein Anstieg über der Streuung.

**Tore** am f8f72fb05 GRÜN: format:check · check:statik · gate:betriebsgesetz · gate:fachwerk-contract · gate:settlement ·
gate:haus-welt · gate:welt-boot · gate:asset-contract · gate:weg-boden (Teil 10 KÖRPER + Störung `ohnebord`) ·
gate:pruefbuehne-licht · playtest. Kein Golden geändert.

**Nach dem Merge** (Kopf 3ecbb9554) GRÜN: gate:pruefbuehne-licht (Selbsttest, 102 120 Zeichen) · gate:weg-boden · check:statik ·
gate:betriebsgesetz · gate:welt-boot · gate:settlement · playtest · format:check. Die Nachher-Bilder dieses Ordners sind am gemergten
Kopf aufgenommen (Vorher: main 1f3002606); das Maß von oben dort: 07:12 ist 0,018 m ↔ Soll 0,023 m, Mittag Bord im Schlagschatten.
NICHT nach dem Merge wiederholt: der Preis (gemessen am f8f72fb05 ↔ 1f3002606), gate:haus-welt, gate:fachwerk-contract,
gate:asset-contract und die beiden Mutanten.

## Bilder (dieser Ordner)

- Paare Mittag: `kante-mittag-vor/nach` · `hauptstrasse-mittag-vor/nach` · `boden-ost-vor/nach` · `ueber-260m-vor/nach`
- Paare 07:12: `kante-0712-vor/nach` · `hauptstrasse-0712-vor/nach` · `bord-oben-0712-vor/nach`
- Bord von oben: `bord-oben-mittag-nach` · `bord-oben-quer18` · `bord-oben-zenit` · `bord-oben-mutante-ohne-hoehe`

Zum Pflaster am Mittag (`kante-mittag-vor` ↔ `-nach`): vorher fast weiß und ungegliedert, heller als der Putz; nachher grau, die
Fahrbahn einen Ton dunkler als der Gehweg. Die Farbe ist nicht weiter gedrückt worden.

## Offen

- **Der tiefblaue Schatten auf dem Pflaster** steht im Nachher-Bild weiter (Schlagschatten der Häuser am Mittag): nicht ruhiger
  geworden, nicht gejagt.
- **12 cm ohne Tritt**: der Bord ist Bild, kein Körper für den Leib — der Spieler steigt keine Stufe.
- **Der Schatten des Bords liest die Schattenkarte nicht**: im Schlagschatten eines Hauses steht das Band weiter (dort kaum sichtbar,
  am Mittag-Bild nicht messbar).
- **Der Bord läuft über die Mündung der Quergasse durch** (`hauptstrasse-mittag-nach`, links vorn): die Karte kennt an der Kreuzung
  keinen abgesenkten Bord.
- **Die Bild-Linse des Schattens lebt am Messplatz** (`bord-mass.cjs` hier im Ordner, mit beiden Mutanten gefahren), nicht in CI;
  in CI steht Teil 10 der Weg-Linse (die Karte trägt den Querschnitt).
- **Flimmern im Gang** nicht gefilmt (nur Standbilder nah, 14 m, 260 m).
- Der Bordstein steht von oben deutlich heller als Gehweg und Fahrbahn (blanker Stein × 1,12, ohne die Fugen der Köpfe).

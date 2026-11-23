# Vorprüfung stoffstrom-kette 1 — `mensch.wirtschaft.stoffstrom#1`

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 57 von 1 718.

**Geschnitten:** Die Esse schmilzt jetzt Erz aus der Geologie zu Barren nach dem Stoff-Gesetz (Massenbilanz der Elemente, Ausbeute
0,18776), der Schmied macht aus den Barren Beile zu je 0,3975 kg Eisen, und die Bewohner tragen sie in der Hand — EIN Gesetz im
Kern, der Stamm verbindet nur; das Eisen aus dem Nichts (`herstellung.schmiede.jeStunde` 0,5) fiel an der Wurzel.
**Gemessen:** im Dorf „dorf 7 18“ am Anker des Messorts stadt (25 Häuser, 113 Bewohner), sieben geraffte Tage: Halde 1 521,2 →
521,4 kg, Barren am Ofen 0 → 29, Werkzeug in Händen 0 → 63; main am selben Ort: keine Halde, Barren 0 → 0, Werkzeug 0 → 0, dafür
Eisen im Werk aus dem Nichts 0 → 72. **Ehrlich offen:** das BILD — der swiftshader-GPU-Prozess dieses Containers stürzt in jedem
Welt-Schuss (auch main, auch `npm run blick`), die Schüsse fahren die GPU-Proben des Commits.

## Die Kette (Datei:Zeile, Kopf)

- Erz liegt, wo die Geologie es legt: `stoffstromOrte` (koerper-core.js:6000, Ringe 80–420 m um die Ortsmitte, aus der Saat) →
  der erste Ort mit `_rockGeologyClass` „aufschluss“ oder „talus“, nicht im Grundriss, nicht nass (stamm/siedlung-bewohner.js:1107,
  `_stoffstromAnlegen`, gerufen aus stamm/siedlung-bewohner.js:1016). Im Dorf: Aufschluss bei 605,5/134,7, 220 m von der Mitte.
- Die Stoffe: Zeile `haematit` (schmiede-core.js:2892), Gemisch `erz` (schmiede-core.js:2937, Hämatit 0,8 / Quarz 0,2).
- Die Esse: `STOFFSTROM.verhuettung` (schmiede-core.js:3369) — die Element-Bilanz, Fe aus Fe₂O₃, die Schlacke trägt den Rest;
  das Eisen des Werkzeugs `werkEisen` (schmiede-core.js:3387).
- Der Zeitlauf: `BESTAND_GESETZ.stoffstrom` (koerper-core.js:5697: 5 kg Erz je Ofen-Stunde, Barren 5 kg, ein Werkzeug je 3 h,
  Halde 5–15 Tage, Raster 0,25 h), `stoffstromHalter` (koerper-core.js:5903), `stoffstromFassen` (koerper-core.js:5938), die
  Wurzel `herstellung.schmiede` (koerper-core.js:5685: `jeStunde` 0, `aus` „erz“).
- Die Halde: `stoffstromHaldeForm` (koerper-core.js:5989, Schüttkegel aus Masse, Dichte, Porenanteil 0,4, Böschung 37°), ihr
  Bild nah am Auge `_stoffstromBild` (stamm/siedlung-bewohner.js:1222) über den EINEN Bau-Pfad.
- Die Barren: der Ofen liest die Kette vor jedem Leser (`_stoffstromFassen`, stamm/siedlung-bewohner.js:1155; der Wagen
  stamm/siedlung-verkehr.js:519 und stamm/siedlung-verkehr.js:1017; das Bild stamm/siedlung-bewohner.js:1313).
- Das Werkzeug in der Hand: `_stoffstromHand` (stamm/siedlung-bewohner.js:1198) hängt den Bauplan `klinge_beil` an die rechte
  Hand über `_geraetInHand` (stamm/koerper-seele.js:770, die EINE Hand des Spielers, aus `_refreshHeldMesh` gelöst), sobald der
  Leib steht (stamm/siedlung-menge.js:95); der Leib-Abschied löst sie (stamm/siedlung-menge.js:110).
- Der Leser der Station: `_stoffstromZensus` (stamm/siedlung-bewohner.js:1170).

## Die drei Zahlen (Welt-Probe, Null-Renderer, main 9f3fe35f ↔ Kopf)

| Tag | Halde Kopf (kg) | Barren Kopf | Werkzeug Kopf | main: Halde · Barren · Werkzeug · Eisen aus dem Nichts |
| --- | --- | --- | --- | --- |
| 0 | 1 521,2 | 0 | 0 | — · 0 · 0 · 0 |
| 1 | 1 378,4 | 1 | 6 | — · 0 · 0 · 14,3 |
| 3 | 1 092,8 | 12 | 25 | — · 0 · 0 · 42,9 |
| 5 | 807,1 | 20 | 44 | — · 0 · 0 · 65,7 |
| 7 | 521,4 | 29 | 63 | — · 0 · 0 · 72,0 |

Am Kopf nach den sieben Tagen: das Halden-Bild sichtbar (Kegel r 0,63 m, h 0,48 m — 521 kg Erz sind 0,2 m³ Schüttung), die
Kisten an den drei Werk-Haltern der Schmiede 3 · 3 · 2, der Zensus 0,01–0,33 ms. Die Kosten hängen am Schirm und an der Änderung:
das Fassen rechnet nur die Raster-Schritte seit dem letzten Leser, das Bild nur nah (`BESTAND_BILD.nahM`), nie je Weltgröße.

## Die Linse

`gate:koerper-kern` Teil D (`stoffstromUrteil`, scripts/diag-koerper-kern.cjs:498), der Kern-Lauf über sieben Tage: Halde
1 432,8 → 491,1 kg (Erz 941,7 kg, Eisen 176,82 kg), 34 Barren gegossen, 28 am Ofen, 60 Werkzeuge, 12 in der Hand.
**ROT an main** beim Namen: „D6 das Eisen entsteht aus dem Nichts … (jeStunde 0.5)“ und „D0 die Esse schmilzt kein Erz“;
**GRÜN am Kopf**. Selbsttest: alle siebenundzwanzig injizierten Abweichungen erkannt, darunter sechs Täter der Stoffstrom-Kette
(ohne Kette, Eisen aus dem Nichts, die Kette erzeugt Eisen, die Halde schrumpft nicht, kein Werkzeug in der Hand, die Verhüttung
erzeugt Masse). Grün dazu: `check:vorab`, `check:statik`, `stamm:lint`, `node scripts/diag-atlas.cjs --check`.

## Kopf

Der Kopf ist der Commit, der diese Datei trägt (Basis main 9f3fe35f4a6f7860b04264831bc20ffc70aa7d14); seine sha40 steht in der
letzten Nachricht der Sitzung — eine Datei kann ihren eigenen Commit nicht nennen.

## Ehrlich offen

- Das BILD: kein Welt-Schuss aus diesem Container (der GPU-Prozess stirbt, main ebenso) — die GPU-Proben des Commits tragen ihn.
- Der probe-tag-Prüfer (artifacts/profiband/werkzeug/zug.cjs, lokal, im Zweig `koordination` nicht verfolgt) liegt hier nicht;
  die Marke `[gpu-probe: …]` ist gegen den Einlass-Leser des Workflows geprüft.
- Die Metropole „dorf 7 300“ (Messort stadt-voll) trägt in 131 Häusern keine Schmiede — dort steht keine Kette.
- Kein Bergmann: die Halde füllt sich nicht nach. Die Kohle der Esse wird nicht verbraucht. Kein Preis P.
- Der Stand des Markts beginnt weiter voll (Eisen aus dem Nichts im Stand, BESTAND markt S1).
- Die Halde trägt den Stoff „stein“, nicht die Farbe des Hämatits. Werkzeuge über die Zahl der Hände bleiben im Lager.
- Die Barren zeigen sich im Kistenmaß des Bestands. Die Station muss `_stoffstromZensus` lesen (Zweig `punkte-maschine`).
- koerper-core.js: eine Zeile nicht rein additiv — `herstellung.schmiede` (die Wurzel, fern von `MOTION` und `TAGES_GESETZ`).

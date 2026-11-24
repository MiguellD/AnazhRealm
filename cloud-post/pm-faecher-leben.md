# Post an pm-faecher-leben

## 24.11. 12:30 — Cloud, ZWISCHENSTAND: 16 Fronten des Kapitels leben urteilen am Fächer

**Revier:** eine einzige Datei, `meisterkarte-quelle/punkte/stationen/k2-leben.js`.
- Zweig `pm-faecher-leben`, Kopf ded485c92 und der Leser-Nachtrag dynamik#2 in diesem Commit.
- Basis origin/punkte-maschine 471c911f9. `git merge-tree` gegen origin/punkte-maschine 16f1cdae9 ist sauber; oben fiel in der Datei nur jahreslauf#2, 66cc82760.
- `faecher.js`, `punkte.cjs`, `zug/dienst/*` und die anderen `k2-*.js` sind unberührt.

Diese Leitern sind nicht angefasst:
- `fremde-physik#1` und `netz#2` (BUEHNE Saaten);
- `erbe`, `muster`, `stammbaum` (gehören `pm-erbe-geburt`);
- `tiere.bewegung` (gehört `front-leben` und `nerv-bewegung`);
- `leben.kopplung.*`.

**Bild:** an allen 16 Fronten ungemessen bis zum Gerät. Die Cloud hat keine GPU, swiftshader meldet „kein Schuss ohne Gerät“. Jedes Panel-Urteil (R11) und jede Bildpflicht steht offen.

**Headless:** jede Front ist ROT mit „kein Zeuge der Karte im Lauf ([linse-gpu] fehlt)“. Keine Station behauptet GRÜN.

Die Zahlen unten sind das Urteil derselben Station über den echten Lauf der Probe-Art, gefahren gegen die warme Werkbank (swiftshader, Steuer :24490). Nur für die Zahl war dabei die Karte vorgetäuscht.

**Wie jede Station urteilt:**
- Sie ruft im Fächer den Export, den das Spiel liest. Die Station nennt ihn als `Gesetz` und das Lesen im Spiel als `Leser`, beide mit Datei:Zeile; die Akte trägt beides.
- Die Sprosse trägt ihren Täter mit Datei:Zeile.
- Jede Sprosse hat mindestens zwei Attrappen, die ROT werden: „Bühne allein“ (faecher 0) und „die Welt heute“.

Die Zeile je Front lautet: Gruppe der Front-Tafel · Fächer · Urteil · gemessen · es fehlt (Datei:Zeile).

### leben.evolution

- **evolution.zeitreise#1** (KEINE STATION)
  - Fächer: 240/241 Adressen, 20 Saaten × 12 Orte + 1, 4,9 s.
  - Urteil: ROT. hinZurueckGleich 1 ✓; das Panel ist ungemessen. Δ Sommer 0,0573 K gegen das Band 1,6 ± 0,8 K (Kaufman et al. 2004).
  - Es fehlt die Fauna der Epoche: `stamm/kreatur-leben.js:1691 _pickFaunaSoulAtPlayer` liest keine Zeit, und `voxel-worker.js:1491 planetOrtAuftrag` trägt kein Feld der Fauna. `stamm/feld-leben.js:1284 reise` nimmt nur ganze Ma, 10⁴ Jahre sind nicht erreichbar.
- **evolution.mikroben#1** (KEINE STATION)
  - Fächer: 600/606, 40 Saaten × 5 Orte × 3 Zeiten + 6.
  - Urteil: ROT. matten 1 ✓, zonen 3, belagMax 0,03; die Zonierung gegen die Referenz ist ungemessen.
  - Es fehlt: `gelaende-core.js:3855 felsFarbe` nimmt keine Temperatur, das Gelände trägt keine heiße Quelle und kein Watt.
- **evolution.bauplan#1** (BUEHNE Umfang sonst)
  - Fächer: 1004/1004, 1000 Saaten + 4, 3,8 s.
  - Urteil: ROT. bewegt 100 % ✓, genome 1000 ✓, volumenFaktor 1,706 gegen ≥ 10 ✗; 849 von 1000 Genomen liegen außerhalb der Spanne der Gattungen.
  - Es fehlt: `tetrapoda-core.js:295 PARAMS` (5 Dials) → `:4434 artGestalt` ist eine Mischung der vier ART_GESTALT. Ein Bauplan jenseits der Vierbeiner hat kein Genom.
- **evolution.fossil#1** (BUEHNE Umfang sonst)
  - Fächer: 400/402, 100 Saaten × 4 Orte + 2.
  - Urteil: ROT. funde 0 gegen ≥ 100 ✗; imBaum ist ungemessen.
  - Es fehlt: `gelaende-core.js:3607 felsLage` gibt Paket, Bank und Mächtigkeit, aber kein Alter und keinen Inhalt. Im Spiel gibt es 0 Exporte für fossil, faehrte oder leitart.
- **evolution.zivilisation#1** (BUEHNE Umfang sonst): bleibt **offen und ohne Fächer**.
  - Die Sprosse urteilt über die Kreatur-Probe erbe (PFAD_ERBE: rEltern, scheuDelta). `pm-erbe-geburt` hat sie umgebaut: 0cf308d97 „die Stationen ER und ZV“, gelandet in b74654d2d.
  - Ein Fächer daneben wäre ein Zwilling. Deshalb steht die Sprosse nicht in der Anspruchs-Zeile.

### leben.pflanzen

- **pflanzen.arten#1** (KEINE STATION)
  - Fächer: 48/48, 12 Saaten × 4 Orte.
  - Urteil: ROT. gestalten 10 ✓, gattungObergrenze 58,3 % gegen ≥ 80 % ✗. 8 von 12 Arten sind verwechselbar (Tanne ↔ Zypresse: Silhouetten-Abstand 0); 12 Arten liegen auf 10 Rezepten. Gattung und Herbar gehen ins Panel.
  - Es fehlt: `stamm/studio-bruecke.js:3305 STREU_NAMEN`. Palme und Erle werden zu weide, Zypresse zu tanne, Kiefer zu fichte.
- **pflanzen.lebenslauf#1** (KEINE STATION)
  - Fächer: 107/108, 100 Saaten + 8, 8,3 s.
  - Urteil: ROT. reverseJ 84,8 % gegen ≥ 90 % ✗ (de Liocourt 1898; Meyer 1952). astungDelta 0,171 > 0 ✓ (Hasenauer & Monserud 1996). Stehendes Totholz 0, 9 339 Bäume. Der Höhenabstand ist ungemessen, weil kein Korpus da ist.
  - Es fehlt: `phyto-core.js:3273 forestTreeSize` (ab 0,55 der Art, kein Jungwuchs unter dem Dach) und `:2888 FREISTAND` (zwei Zustände). Es gibt keinen Erzeuger für stehendes Totholz.
- **pflanzen.dichte#1** (KEINE STATION)
  - Fächer: 256/256, 64 Saaten × 4 Orte.
  - Urteil: ROT. dichtBisM 9,735 m gegen ≥ 20 m ✗, 10–20 m 66,45 % gegen ≥ 90 % ✗. LAI nah 1,76 liegt im Band 1,71 ± 1,19 (Asner, Scurlock & Hicke 2003; Nilson 1971).
  - Es fehlt: `stamm/vegetation-wiese.js:746 _wieseFern`. Jenseits von 10 m fällt die Blattfläche je Boden mit 1/Q.

### leben.wasser

- **wasser.lebensraeume#2** (KEINE STATION)
  - Fächer: 58/58 Ufer-Punkte, 1 039 Fische, 414 Stände (bach 375 · see 39 · kueste 0).
  - Urteil: ROT. habitateMitEigenerFauna 1 gegen ≥ 3 ✗. Klassifikator und Ufer gehen ins Panel.
  - Es fehlt: `stamm/kreatur-fauna.js:566 _fischZelle`. `FISCH_GESETZ` trägt einen einzigen Leib und keine Art je Lebensraum.
- **wasser.bild#1** (KEINE STATION)
  - Fächer: 70/70.
  - Urteil: ROT. Bach 19,56 m ✓ (Davies-Colley & Smith 2001), See 11,13 m ✓ (Carlson 1977), imBand 98,2 % ✓.
  - sichtFlussM ist ungemessen: der breiteste Lauf ist 18,69 m, das entspricht 30,72 km² Einzugsgebiet, unter 100 km².
  - Es fehlt: `gelaende-core.js:749 flussBreite` / `:761 GEWAESSER_ART.bachBisKm2` (kein Lauf erreicht 100 km²) und `foundry-core.js:151 WASSER_GESETZ.koerper`.
- **wasser.rhythmen#2** (BUEHNE Umfang sonst)
  - Fächer: 240/240, 60 Orte × 4 Zeiten.
  - Urteil: ROT. hubM 0 m gegen ≥ 200 m ✗. Die Tiefe ist 0,095 m um 0, 6, 12 und 18 Uhr, das Meer 16,97 m tief, und es gibt kein Zooplankton.
  - Es fehlt: `stamm/kreatur-fauna.js:590 _fischTiefeY` liest Bett und Spiegel, nie die Uhr; `tetrapoda-core.js:2877 FISCH_GESETZ`.

### leben.tiere

- **tiere.verhalten#2** (BUEHNE Umfang sonst)
  - Fächer: 96/96, 24 Saaten × 4 Orte, 96 Spielstunden.
  - Urteil: ROT. rang 1 ✓ (auf der Bühne 0,316), alarmS 0 s ✓, akte 8 gegen ≥ 30 ✗.
  - Es fehlt: `tetrapoda-core.js:100 VERHALTEN.aktionen` hat 13 Aktionen, ohne Alarmruf, Komfort, Markieren und Drohen; `:2164 ETHOGRAMM_GESETZ.zeigt`.
- **tiere.mensch#2** (BUEHNE Umfang sonst)
  - Fächer: 92/92, 8 Orte × 4 Zeiten + 60.
  - Urteil: ROT. findeQuote 0 gegen ≥ 0,8 ✗. 0 von 32 frischen Spuren sind sichtbar; eine Zelle wird erst ab 28 Tritten zum Pfad (Stufe 0,75).
  - Es fehlt: `stamm/siedlung-wege.js:1712 _trittStufe` (ein Gang tritt keine Fährte), TRITT `:3284`. Es gibt keine Losung.
- **tiere.lebenszyklus#2** (KEINE STATION)
  - Fächer: 19/19, 12 Zeiten + 7 Alter, 5,4 s.
  - Urteil: ROT. jungProzent 33,11 % im Frühsommer ✓. proportionAbw 0 % gegen ≥ 10 % ✗: Bein/Rumpf 0,7323 und Kopf/Rumpf 0,6995 sind für Kitz und Hirsch gleich (Becciolini et al. 2016). Das Wachstum ist ×2,28 (Kitz 15,4 kg ↔ Hirsch 73,2 kg). Das Panel ist ungemessen.
  - Es fehlt: `stamm/kreatur-verhalten.js:590 _kreaturGroesseSetzen` macht mit `scale.setScalar` das Kitz zu einem verkleinerten Hirsch; `tetrapoda-core.js:858 skullR` liest das Alter nie; `leben-core.js:989` kennt keine Setzzeit.

### leben.oeko

- **oeko.stoffe#2** (BUEHNE Umfang sonst)
  - Fächer: 84/84, 64 Orte + 20 Arten, 4 ms. Der Lauf ist um 12:29 frisch gefahren.
  - Urteil: ROT „Umfang nicht erzeugbar“. Der Boden hat 1 Kanal an 64 Zellen (Nährstoff 1–1,2), Fels 1 = Erde 1, und 0 von 20 Arten binden N.
  - Es fehlt: `stamm/vegetation-wiese.js:2338 _naehrstoffAt` ist EIN Skalar und liest kein Gestein; der Leser ist `:2323 _wuchsAt`.
- **oeko.dynamik#2** (PROBE misst nichts)
  - Fächer: 6/6, 1 Saat × 2 Orte × 3 Zeiten, 19,7 s.
  - Urteil: ROT. jungwuchsMinus 4,23 % gegen ≥ 20 % ✗. Die Hirsche im Tal nehmen um 38,85 % zu, 20 Wölfe sind aus.
  - Es fehlt: `phyto-core.js:6527 bodenGewicht`. Allein `blume` trägt `leben`; Farn, Gestrüpp, Schilf und der Jungwuchs der Bäume lesen den Fraß nicht (`stamm/kreatur-erbe.js:555 _gauFrassAt`).
- **oeko.zerfall#2** (KEINE STATION)
  - Fächer: 4/4, die Tage 0/3/10/30 an 10 Kadavern von 5,1–508,3 kg, 4,2 s.
  - Urteil: ROT. kadaverTage 0,025 gegen ≥ 30 ✗: jeder Kadaver liegt 91 s, gleich welcher Größe. stufen 2 (kippt → fort) gegen ≥ 4 ✗ (Payne 1965). aasGilden 1 (fox, wolf, bear) gegen ≥ 2 ✗ (Selva et al. 2005).
  - Es fehlt: `schmiede-core.js:3995 leichnamSec 90` und `:3996 leichnamSinkSec 4`; `stamm/kreatur-leben.js:1006` Kadaver { fleisch } ohne Stufe; `stamm/kreatur-verhalten.js:265` (es frisst nur der Säuger über pflanzDiet).

### Anspruchs-Zeile für `zug/anspruch.txt`

```
pm-faecher-leben karte2.leben.evolution.zeitreise#1,karte2.leben.evolution.mikroben#1,karte2.leben.evolution.bauplan#1,karte2.leben.evolution.fossil#1,karte2.leben.pflanzen.arten#1,karte2.leben.pflanzen.lebenslauf#1,karte2.leben.pflanzen.dichte#1,karte2.leben.wasser.lebensraeume#2,karte2.leben.wasser.bild#1,karte2.leben.wasser.rhythmen#2,karte2.leben.tiere.verhalten#2,karte2.leben.tiere.mensch#2,karte2.leben.tiere.lebenszyklus#2,karte2.leben.oeko.stoffe#2,karte2.leben.oeko.dynamik#2,karte2.leben.oeko.zerfall#2
```

### Selbsttest

Gefahren mit `node meisterkarte-quelle/punkte/punkte.cjs selbsttest --ohne 3c`:
- **Vorher:** 271 GRÜN von 275.
- **Nachher:** 271 GRÜN von 275, in 6 min 20 s.

Die vier ROT sind vorher und nachher dieselben:
- „BEFEHL TRÄGT“: vorher nicht rot waren `mensch.kopplung.antwort#1` und `mensch.zeit.kausal#1`, also k2-mensch.js und nicht mein Revier.
- „WACHE der Läufer nennt seinen Tod“, „WACHE DER TOD KOSTET NUR DIE LAUFENDE PROBE“ und „LEBENSZEICHEN DES ZEUGEN“: alle mit Exit 9 im Container.

Die eigene Selbstprobe der Leben-Stationen ergibt 210 Stationen · 2 110 Proben · 0 falsch · 5 Probe-Arten · 0 kaputt.

### Für den Zug (Probe-Art und Frist)

Mit `faecher: true` ändern sich die Probe-Arten der Perspektiven. Die Frist `sek` der Leitern:

| Leiter | sek vorher → nachher |
|---|---|
| arten | 25 → 35 |
| lebenslauf | 20 → 40 |
| dichte | 20 → 32 |
| verhalten | 40 → 56 |
| lebenszyklus | 30 → 48 |
| mensch | 25 → 29 |
| lebensraeume | 35 → 48 |
| bild | 10 → 34 |
| rhythmen | 10 → 26 |
| dynamik | 45 → 60 |
| zerfall | 10 → 24 |
| stoffe | 25 → 28 |
| zeitreise | 50 (unverändert) |
| bauplan | 40 → 50 |
| mikroben | 10 → 20 |
| fossil | 10 → 20 |

### Was der Bauart fehlt (nicht mein Revier)

1. `faecher.js:105`: `fehlt` trägt nur den ersten Text; die übrigen Fähigkeiten, die fehlen, stehen nur in der Akte.
2. Das Panel-Urteil zeigt nur die Soll-Schlüssel; die Zusatz-Werte leben nur in der Akte.
3. Der Deckel von 60 s je Leiter (`k2-planet.js:457`) drückte dynamik#2 auf 1 Saat.
4. Die Bühne friert den Tag ein (`stamm/feld-leben.js:2688`: tagS 6·10¹³). Wer `_kalender().tagS` liest, misst 0 Tage. zerfall#2 liest deshalb `normS` (`:2678`, 3 600 s).

### Ehrlich offen

- **lebenszyklus#2:** die Schwelle von 10 % für proportionAbw ist die der Station; Becciolini 2016 gibt nur die Richtung, und Bartush & Garner 1979 (der Hinterfuß des Kitzes) ist ungelesen. Der Gau liest keine Jahreszeit: Geburten gibt es je Takt (`leben-core.js:989`). Es gibt zwei Uhren: ZEIT.jahrS ist 262,5 s, das Kalenderjahr 2 400 s, also 9,14 Lebensjahre je Kalenderjahr. buehneJungProzent ist in der warmen Werkbank null.
- **zerfall#2:** aasGilden zählt die Klassen der Leser von `state.leichname`; heute gibt es genau einen, `kreatur-verhalten.js:257`.
- **verhalten#2:** alarmS bleibt ein Maß der Bühne.
- **lebensraeume#2:** die Ufer-Stichprobe ist keine Funktion der Adresse.
- **bild#1:** der Fluss ist ungemessen, weil die Welt keinen trägt.
- **stoffe:** S1 gibt in der warmen Werkbank naehrNach 1,6. Das kommt nicht aus meinem Schnitt; geprüft per git stash gegen den Stand von origin.
- **dynamik#2:** `_gauGeht` lässt nach dem Fächer den Gau des Spielers fallen, der Neubau kostet 2,3 s.
- **zivilisation#1:** offen, wie oben.
- Jede Bildpflicht ist ungemessen bis zum Gerät.
- Eine Post an mich liegt in `origin/koordination` nicht vor: `cloud-post/pm-faecher-leben.md` fehlt dort, gelesen um 12:25 an dc05b5d77.

**Karte 2 gebucht 83 von 1 718** — neu gelesen aus `origin/punkte-maschine:vision/karte-2-stand.json` (e254bfcef, 24.11. 11:08): heute 83, kern 3, anteil 4,4 %.

**Geschnitten:** 16 Fronten des Kapitels leben urteilen jetzt am Fächer, über den Export, den das Spiel liest, mit Leser und Täter an Datei:Zeile; vorher waren es neun Fronten ohne Station, sechs aus der Bühne und eine Probe, die nichts maß. **Gemessen:** headless 16 von 16 ROT ohne Karte, der Selbsttest vorher und nachher 271 von 275, die Selbstprobe 2 110 Proben mit 0 falsch, und je Front die Zahl, die der Welt fehlt. **Offen:** jede Bildpflicht und jedes Panel bis zum Gerät, zivilisation#1 (die Probe erbe von `pm-erbe-geburt`, kein Zwilling) und die vier Wünsche an die Bauart oben.

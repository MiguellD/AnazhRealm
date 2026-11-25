# Vorprüfung unter-wasser — die Sicht ist EIN Gesetz des Gewässer-Typs

ZWISCHENSTAND: Geschnitten · Gemessen (Zahl) · Karte 2 gebucht 108 von 1 718 (Stand-Datei `vision/karte-2-stand.json`,
Zweig `punkte-maschine`). Die Sprosse `karte2.leben.wasser.bild#1` bleibt ROT, weil die Welt um den Messort keinen Fluss trägt
(der Zeuge der Station verlangt vier Medien, gemessen sind drei); Bach und See stehen im Band, das Meer hat seinen eigenen Körper.

**Geschnitten:** Die Sicht unter Wasser ist EIN Gesetz des Gewässer-Typs (gelaende-core `gewaesserOptik`): je Kanal Absorption
und Streuung aus der Stoff-Zeile des Wassers (schmiede `STOFF_GESETZ.medium`) plus gelöstem Stoff und Schwebstoff des Typs, der
Schwebstoff im Lauf mit dem Abfluss. Den Typ gibt die Hydrosphäre (`gewaesserAm`: Lauf nach Breite, sonst Ozean- oder
See-Zelle), und EIN Leser (`_wasserMedium`) trägt ihn unter und über den Spiegel. **Gemessen:** Bach 19,56 → 9,03 m, See
8,32 → 3,69 m, Meer 8,32 (Körper des Sees) → 2,92 m (Secchi 4,47 m im Band 4–5), das Bild an den Ziel-Tafeln folgt dem Gesetz
auf ±3,3 %; die Zeichen-Rufe bleiben an allen sechs Posen gleich (Meer 53, See 80, Bach 102 unter Wasser), die ms liegen
im Rauschen (−4,4 bis +2,2 %, swiftshader). **Ehrlich offen:** kein Fluss in der Welt, über dem Spiegel trägt jeder Lauf
den Körper des Bachs (halb: 3 von 4 Typen), an echter GPU ungemessen.

Basis: main 804ca10c, Zweig `unter-wasser`. Gemessen ist alles auf 804ca10c. Vor dem Push kam main f63a69ef hinein, mit dem
Feuer des Rennofens in schmiede-core; die Stoff-Zeile des Wassers berührt es nicht. Auf dem gemergten Baum liefen check:statik und
K5 noch einmal.

## Die Station, wörtlich (Sprosse 1, `karte2.leben.wasser.bild#1`)

Die Station k2-leben steht im Zweig `punkte-maschine` (meisterkarte-quelle/punkte/stationen/k2-leben.js, Perspektive
`leben.wasser`, Sprosse 1 `u: { mass: "sicht" }`).

- **Leser:** `modus(x, z, y)` stellt die Kamera, ruft `r._applyDayNightToScene()` und liest
  `{ unter: !!s.kameraUnterWasser, art: r._wasserArtAt(x, z), sichtM: R3(r._luftSichtM(y)), farbe, beta }`.
- **Messfunktion:** `_luftSichtM(y)`, die Koschmieder-Sicht der Uniforms der Luft (unter Wasser c des 550-nm-Kanals).
- **Einheit:** m.
- **Soll:** `K.soll(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtBachM", rel: "band",
  zahl: 5, bis: 20, einheit: "m" })`, ebenso `sichtSeeM` 2–16 und `sichtFlussM` 1–1,5.
- **Umfang (Zeuge):** `antworten ≥ 4` (Bach, See, Fluss unter Wasser und die Kontrolle darüber), `oben === false`,
  `streuung > 0` (nicht alle Gewässer dieselbe Sicht).
- **Posen:** Bach `O.bach` in halber Säule, `(bb + r._koerperWasser(x, z, bb)) / 2`; See `O.see.mitte` bei `level − 2`, die
  Kontrolle bei `level + 10`; Fluss der erste Lauf-Punkt mit `gewaesserArt(breite)` „fluss“, `_wasserArtAt` „fluss“ und
  `_nassAt`. Ohne Fluss setzt sie `roh.nicht = "kein Fluss am Messort: …"`.
- **Täter heute:** `"stamm/bild-himmel.js _applyDayNightToScene (WASSER_GESETZ.koerper je Art)"`.

## Zahlen vorher ↔ nachher

Dieselben Posen, dieselbe Probe (Werkbank, swiftshader, Mittag, Blick +x, fov 75), die Ziel-Tafeln schwarz und weiß in
1 · 2 · 5 · 10 · 20 m. „Gesetz“ ist `_luftSichtM` (Kontrast 2 %), „Bild“ die Sicht aus dem Fit der Kontrast-Kurve an den Tafeln
(Abfall e^(−c·d) gegen die Schwelle 2 %), „Schnitt“ die erste Tafel-Entfernung unter 2 % Kontrast, linear zwischen den Stufen.

| Pose (Tiefe) | Typ vorher → nachher (Band) | vorher Gesetz · Bild · Schnitt | nachher Gesetz · Bild · Schnitt |
| --- | --- | --- | --- |
| Bach −269,2 / 25,76 / −1127,4 (0,21 m, halbe Säule) | bach → bach (Scheibe 5–20 m) | 19,56 · 18,29 · 18,81 m | 9,03 · 8,78 · 8,39 m |
| See 1816 / −1,07 / −6168 (2 m) | see → see (Secchi 2–16 m) | 8,32 · 8,28 · 8,46 m | 3,69 · 3,81 · 4,07 m |
| Meer 1896 / −5 / 8776 (2 m) | see → meer (Secchi 4–5 m) | 8,32 · 8,28 · 8,46 m | 2,92 · 2,98 · 3,03 m |
| Fluss | kein Lauf ≥ 27,8 m in ±12 km | — | Gesetz 1,11 m (Scheibe 1,36 m), in der Welt ungemessen |

Das Bild folgt dem Gesetz nachher auf −2,8 % (Bach), +3,3 % (See) und +2,1 % (Meer); vorher lag es bei −6,5 %, −0,5 % und −0,5 %.
Schon vorher lagen Bach und See in ihrem Band; der Bach allerdings an dessen Rand (19,56 von 20 m), nachher sitzt er in der Mitte.
Der Bruch vorher steckte woanders: Das Meer trug den Körper des Sees, und jedes Gewässer las eine Hand-Tafel statt des Gesetzes.
Das Meer liegt nach der Welt-Lesart bei 2,92 m (Schwelle 2 %); in der Lesart seines Bands, Secchi 6/c, sind es 4,47 m im Band 4–5.

| Typ (Band) | c [R, G, B] 1/m | K_d [R, G, B] 1/m | Schwebstoff g/m³ |
| --- | --- | --- | --- |
| Bach (Scheibe 5–20 m) | 0,548 · 0,433 · 0,881 | 0,387 · 0,252 · 0,774 | 0,47 |
| See (Secchi 2–16 m) | 1,176 · 1,061 · 1,509 | 0,440 · 0,301 · 0,830 | 1,72 |
| Fluss (Scheibe 1–1,5 m) | 3,653 · 3,538 · 3,986 | 0,604 · 0,446 · 1,021 | 6,68 |
| Meer (Secchi 4–5 m) | 1,544 · 1,342 · 1,329 | 0,419 · 0,158 · 0,135 | 2,55 |

In den Lesarten der Literatur: Bach Scheibe 11,08 m, See Secchi 5,66 m, Fluss Scheibe 1,36 m, Meer Secchi 4,47 m, je die Mitte
ihres Bands. Rot verlischt im Süßwasser zuerst, das Blau des gelösten Stoffs gleich danach (der Bach im Bild oliv). Im Meer ist
Blau der klarste Kanal: K_d Blau 0,135 gegen Rot 0,419. Vorher trug das Meer den See-Körper, darin war Blau trüber als Grün.

Der Abfluss trübt den Lauf: Bach bei Q = 2·Q̄ 9,03 → 4,78 m, ein Fluss bei Q = 2·Q̄ 1,11 → 0,43 m (Abfluss-Kurve SS ∝ Q^1,4).

**Die Kosten am Schirm** (ein Term im Blick, kein neuer Pass). Gemessen ist je Pose der echte Frame `_loopRender`, 25 Bilder bis
zur Abgabe der Warteschlange nach 5 Warm-Bildern, gezählt mit `__drawZensus`. Main und Zweig liefen je in einer frisch gestarteten
Werkbank, nacheinander, mit derselben Folge Meer · See · Bach (swiftshader, ANGLE-Vulkan):

| Pose | Zeichen-Rufe (orthografisch + Haupt) main → Zweig | Dreiecke main → Zweig | ms p50 main → Zweig | ms p90 main → Zweig |
| --- | --- | --- | --- | --- |
| Meer unter Wasser | 53 (3 + 50) → 53 (3 + 50) | 243 430 → 243 243 | 1 649 → 1 666 (+1,0 %) | 1 848 → 1 822 |
| Meer über dem Spiegel | 52 (3 + 49) → 52 (3 + 49) | 214 823 → 214 863 | 1 576 → 1 549 (−1,7 %) | 1 792 → 1 740 |
| See unter Wasser | 80 (3 + 77) → 80 (3 + 77) | 159 112 → 159 168 | 3 353 → 3 205 (−4,4 %) | 3 489 → 3 352 |
| See über dem Spiegel | 79 (3 + 76) → 79 (3 + 76) | 149 042 → 149 098 | 3 355 → 3 430 (+2,2 %) | 3 614 → 3 661 |
| Bach unter Wasser | 102 (3 + 99) → 102 (3 + 99) | 164 191 → 163 319 | 2 584 → 2 593 (+0,3 %) | 2 981 → 2 778 |
| Bach über dem Spiegel | 101 (3 + 98) → 101 (3 + 98) | 183 370 → 183 200 | 2 717 → 2 749 (+1,2 %) | 2 941 → 2 866 |

Der Schnitt bringt keinen Ruf und keinen Pass. Die Dreiecke weichen höchstens um 0,5 % ab, das ist der Strom des Rings. Die ms
streuen um null. Ein erster Lauf des Zweigs in einer Werkbank, die die drei Orte schon für die Bilder besucht hatte, zählte am See
92 statt 80 Rufe und 176 345 Dreiecke. Das kam vom Strom-Zustand, nicht vom Gesetz: der frische Lauf deckt sich mit main.

## Die Schnitte (Datei:Zeile)

- **Das Gesetz der Optik** (gelaende-core.js:831 `gewaesserOptik`, die Tafel gelaende-core.js:806 `GEWAESSER_OPTIK`):
  a = a_w + a_g(440)·e^(−S(λ−440)), b = b_w + b_p*·SS, b_b = ½·b_w + B_p·b_p*·SS, c = a + b, K_d = √(a² + G·a·b)/μ0. Der Anker je
  Typ ist die geometrische Mitte seines Bands bei 550 nm. Waagrecht gemessene Typen (Bach, Fluss: schwarze Scheibe) liegen
  in der Mitte beider Schwellen, c = √(4,8 · −ln 0,02)/√(z1·z2): die Sicht der Welt (Schwelle 2 %) und die Scheibe der
  Literatur (Ψ = 4,8, Schwelle 0,8 %) stehen damit beide im Band. Senkrecht gemessene Typen (See, Meer: Secchi) haben
  c = 6/√(z1·z2). Der Schwebstoff SS₀ ist der Rest zum Anker. Im Lauf gilt SS = SS₀·(Q/Q̄)^1,4, mit Q/Q̄ = (1 + Hub/T)^(1/0,6)
  aus dem Pegel. Ohne Schwelle wirft das Gesetz (fail-closed).
- **Der Typ aus der Hydrosphäre** (gelaende-core.js:773 `gewaesserAm`): Ein Lauf (`flussAm`) ist Bach oder Fluss nach seiner
  Breite (`gewaesserArt`, Bach unter 27,8 m), sonst entscheidet die Zelle des Wasser-Felds, Ozean „meer“ und See „see“; jenseits
  jeder Region liegt der Ozean des Defaults. Vorher war jedes stehende Wasser „see“.
- **Die Stoff-Zeile** (schmiede-core.js:2970 `medium`): reine Phase je Kanal a_w (Pope & Fry 1997) und b_w (Smith & Baker
  1981), Süß- oder Meerwasser.
- **EIN Leser** (stamm/wasser-hydro.js:662 `_wasserMedium`, je Typ und Abfluss gemerkt): unter dem Spiegel die Luft der Kamera
  (stamm/bild-himmel.js:2821), über dem Spiegel der Körper und sein Durchlass je Ecke (stamm/bild-sicht.js:1502, gemischt nach
  `riverness` und `aWave`), die Ferne (stamm/gelaende-fern.js:1742, der Körper des Meers) und der Bau-Stoff des Wassers
  (`_wasserKoerperArt`). Abgelöst sind `WASSER_GESETZ.koerper` je Art unter dem Spiegel und die Look-Zahl `wK` mit b_b 0,1
  darüber, ein Körper für alle; foundry-core trägt die Zeile weiter, weil die Station sie liest, Welt und Studio lesen sie nicht mehr.
- **Das Terrain-Labor** (worlds/terrain/phytogenesis.js:1075 `waterMediumOf`, unter Wasser :3543): dasselbe Gesetz über
  dieselbe Stoff-Zeile; `waterArtAt` nennt das Meer „meer“.

## Die Linse (gate:wasser-leben, Familie K5)

scripts/diag-wasser-leben.cjs:482 und die Probe scripts/lib/wasser-linse.cjs:286. Die Kamera taucht 3 m unter den Spiegel von
See, Bach und Meer, die Kontrolle steht 10 m über dem See. Je Pose liest sie `art` (die Welt, `luft.wasser.art`), `kern` (gelaende-core
`gewaesserAm`), `sichtM` (`_luftSichtM`), `soll` (−ln 0,02 / c₅₅₀ des Gesetzes) und c je Kanal.

- **K5 MEDIUM:** Ein Typ liegt nicht unter Wasser, oder die Kontrolle liest Wasser.
- **K5 TRÜBUNG:** Welt oder Kern nennen einen anderen Typ, die Sicht weicht mehr als 1 % vom Gesetz ab, oder der Bach liegt
  unter 5 m (die Literatur unabhängig vom Gesetz).
- **K5 EIN KÖRPER:** Zwei Typen tragen dieselbe Strahl-Schwächung c.

Grün auf dem Zweig in der echten Welt (`node scripts/diag-wasser-leben.cjs --nur koerper`, Null-Renderer, „WASSER-LEBEN GRÜN“,
EXIT=0): See 3,688 m (c 1,176/1,061/1,509), Bach 9,028 m (0,548/0,433/0,881), Meer 2,916 m (1,544/1,342/1,329), Welt und Kern
nennen je den eigenen Typ, die Kontrolle über dem See liest Luft.
Im Selbsttest (`--selftest`, EXIT=0) fallen die Täter beim Namen: das Meer als See, wie main es heute zeichnet (Sicht 8,32 m,
K5 TRÜBUNG); das Meer, das die Welt als See liest (K5 TRÜBUNG); das Meer über dem Spiegel (K5 MEDIUM); und die Mutante der
Bahn, alle drei gleich trüb (K5 EIN KÖRPER). Konsum-Leser ist `_applyDayNightToScene` → `_wasserMedium`.

## Die Tore vor dem Push

- `npm run check:statik`: EXIT=0. `gate:betriebsgesetz` ist GRÜN, die Zitat-Wand eingeschlossen.
- `npm run gate:wasser-leben`: Der Selbsttest ist GRÜN, jeder Täter fällt beim Namen. Die Welt ist ROT, und zwar allein an
  K10 LEER: die Höhlen-Probe am See findet 8 Proben, das Soll ist 20, Spieler, Kamera und Tier tragen 0. Die übrigen Familien,
  K5 eingeschlossen, sind grün. Derselbe Befund steht auf main 804ca10c im selben Container (`--nur hoehle`: 8 Proben, EXIT=1),
  auf dem Zweig ebenso mit und ohne K5 davor. Die CI misst main grün. Der Befund hängt also an diesem Container und nicht am
  Schnitt. Richter ist der CI-Lauf des Zweigs.

## Die drei Posen an der Werkbank

Die Werkbank starten:

```bash
node scripts/werkbank.cjs start --port 4490 --holz kienspan
```

Bach (halbe Säule, 0,21 m unter dem Spiegel):

```bash
node scripts/werkbank.cjs umstellen -269.2 -1127.4
```

```bash
node scripts/werkbank.cjs bild -269.2 25.76 -1127.4 -219.2 25.76 -1127.4 --datei bach.png
```

See (2 m unter dem Spiegel der Mitte):

```bash
node scripts/werkbank.cjs umstellen 1830 -6168
```

```bash
node scripts/werkbank.cjs bild 1816 -1.07 -6168 1866 -1.07 -6168 --datei see.png
```

Meer (vor der Küste, 2 m unter dem Spiegel; die dritte Pose statt des Flusses, den die Welt nicht trägt):

```bash
node scripts/werkbank.cjs umstellen 1896 8776
```

```bash
node scripts/werkbank.cjs bild 1896 -5 8776 1946 -5 8776 --datei meer.png
```

Die Bildpaare liegen unter cloud-post/unter-wasser-bild/ (`bach-vorher.png` ↔ `bach-nachher.png`, ebenso see und meer).
Beim Bach stehen vorher die Tafeln in 1, 2, 5 und 10 m im grauen Wasser. Nachher verlöscht die 10-m-Tafel, die 5-m-Tafel
ist schwach, und das Wasser ist oliv: der gelöste Stoff des Binnenwassers nimmt das Blau. See und Meer waren vorher dasselbe grüne
Bild, mit Tafeln bis 5 m und dem Gelände dahinter. Nachher zeigt der See grün-oliv nur noch die Tafeln in 1 und 2 m, das Meer
blaugrün ebenso.

## Der Stations-Kandidat

cloud-post/unter-wasser-station/k2-leben.patch gilt gegen die Station im Zweig `punkte-maschine` (37a8dd04; dort ist die Station
seit a309cf90 unverändert). Der Patch geht auf, `patch` und `node --check` geben je Exit 0. Soll und Richter bleiben unberührt.

- **farbe:** Die Körper lesen das Gesetz, `Object.keys(__gelaendeCore.GEWAESSER_OPTIK.arten)` je mit `r._wasserKoerperArt(k)`,
  statt `WASSER_GESETZ.koerper` und `wK`.
- **Täter:** `stamm/wasser-hydro.js _wasserMedium (gelaende-core gewaesserOptik je Gewässer-Typ)`.
- **Texte:** Die Sätze von farbe und tiefe nennen den Körper des Meers statt des Sees.

- **lebensraeume:** Die Liste der Körper liest dieselben Typen. `lebensraeumeImGesetz` zählt 4 statt 3, weil das Meer ein eigener
  Körper ist.

Der Kandidat löst beide Code-Leser der alten Tafel in der Station ab. Danach kann die Zeile `WASSER_GESETZ.koerper` aus dem Kern,
nur die Täter-Texte anderer Sprossen nennen sie noch.

Der Rumpf der Station lief an der Werkbank, mit denselben Lesern wie Sprosse 1 (`modus` an den Orten von `__wasserOrte`) und mit
dem Körper-Ausdruck des Kandidaten:

| Rumpf | main 804ca10c | unter-wasser |
| --- | --- | --- |
| `sichtBachM` · `sichtSeeM` · `sichtFlussM` | 19,56 · 8,323 · — | 9,028 · 3,688 · — |
| Kontrolle über dem See `unter` | false | false |
| Zeuge `antworten` · `streuung` | 3 · 1 | 3 · 1 |
| `amOrt` (Bach, See, Meer) | bach · see · see | bach · see · meer |
| Körper R∞ je Kanal | see 0,034/0,074/0,046 · fluss 0,009/0,013/0,010 · bach 0,037/0,093/0,064 | bach 0,003/0,005/0,002 · see 0,009/0,014/0,005 · fluss 0,031/0,044/0,016 · meer 0,015/0,049/0,060 |

Das Urteil der Sprosse bleibt auf beiden Ständen ROT am Zeugen: „nur 3 Medien gemessen“, denn es gibt keinen Fluss. Die Körper
ordnen sich jetzt nach dem Gesetz. Das klare Wasser ist von oben am dunkelsten, weil es kaum zurückstreut, der trübe Fluss am
hellsten, und das Meer ist blau. Vorher war der Bach der hellste Körper.

## Profis mit Zahl (je an der Quelle gelesen)

| Größe | Zahl | Quelle |
| --- | --- | --- |
| a_w bei 465 · 550 · 612,5 nm | 0,0101 · 0,0565 · 0,2665 1/m | Pope & Fry 1997 (Tabelle in 1/cm) |
| b_w(500) Süß- · Meerwasser | 0,0022 · 0,0029 1/m, λ^−4,32 | Smith & Baker 1981, Tab. I; Morel & Prieur 1977 |
| Sicht der schwarzen Scheibe | y = 4,8/c, Schwelle 0,8 %, Fehler im Mittel < 10 % | Davies-Colley 1988, nach Zaneveld & Pegau 2003 |
| Secchi | z = 6/c (≈ 1,25 · y) | Gordon & Wouters 1978; Aarup 2002 (c · SD ≈ 6) |
| See, Trophie-Index 20–50 | Secchi 16–2 m (TSI = 60 − 14,41 · ln SD) | Carlson 1977 |
| Ostsee, Sommer heute | Secchi 4–5 m (um 1903 rund 9 m) | HELCOM 2009 (Fleming-Lehtinen & Kaartokallio) |
| Flüsse bei Niedrigwasser, 96 Orte | Scheibe 0,25–10,75 m, Schwebstoff 87 % von c | Davies-Colley & Close 1990 |
| CDOM klares Binnenwasser · Meer | a_g(440) 0,42 dek. (× 2,303) · 0,06 1/m; S 0,0176 · 0,015 1/nm | Kirk 1976; Babin 2003; Davies-Colley 1992 |
| b_p je Masse, mineralisch | 0,5 m²/g bei 555 nm, n = 0 | Babin 2003; Morel & Prieur 1977, Mobley 2013 |
| Rückstreu-Anteil der Partikel | 0,0183 (gemessen 0,005–0,035) | Mobley 2002 (Petzold); Boss 2004 |
| Abfluss-Kurve C = a · Q^b | b 0,2–2,0 | Syvitski 2000, nach Hoffmann 2020 |
| K_d im diffusen Licht | (1/0,856) · √(a² + 0,162 · a · b) | Kirk 1984 |
| Profi-Engine | Absorption je Kanal in 1/m, Streuung als eigener Term (Single Layer Water) | Unreal-Dokumentation |

Gefallen ist, was sich nicht belegen ließ. Davies-Colley & Smith 2001 trägt die Bänder 5–20 m (Bach) und 1–1,5 m (Fluss) der
Station; der Abstract nennt keine Zahl, und der Volltext ist gesperrt (Wiley 403). Die Station setzt diese Bänder, und der Anker
folgt ihnen. Gestützt sind sie durch Davies-Colley & Close 1990: die Spanne 0,25–10,75 m, 31 % der Flüsse über 4 m.

## Ehrlich offen (mit Grund und Adresse)

- **Kein Fluss in der Welt.** Der breiteste Lauf in ±12 km um die Mess-Wiese misst 18,7 m (2804/−4521); ein Fluss beginnt bei
  27,8 m. Das Gesetz trägt den Fluss, 1,11 m im Band 1–1,5. Die Station misst aber nur drei Medien statt vier, die Sprosse bleibt
  ROT. Adresse: das Flussnetz (gelaende-core `flussBreite`), nicht die Optik.
- **Über dem Spiegel ist der Typ halb (3 von 4).** Die Ecke des Wasser-Meshs kennt die Breite ihres Laufs nicht, also trägt jeder
  Lauf den Körper des Bachs. See, Meer und Bach stimmen, der Fluss fehlt. Adresse: ein Attribut der Breite je Ecke im
  Hydro-Mesh (stamm/bild-sicht.js:1502).
- **Die Ferne** liest den Körper des Meers (jenseits des Rings kennt sie kein Gewässer).
- **Die Absorption der Partikel** fehlt (keine belegte Zahl je Masse). Der gelöste Stoff ist für jedes Süßwasser der Wert des
  klarsten Binnenwassers (Kirk 1976): eine Zahl je Typ ist nicht belegt.
- **Der GLSL-Körper des Terrain-Labors** an der Oberfläche (`wK` im Shader) bleibt Studio-Stand; unter Wasser liest das Labor
  das Gesetz.
- **An echter GPU ungemessen.** Bilder und ms kommen aus swiftshader (ANGLE-Vulkan im Container); die ms sind Verhältnisse, keine
  Gerätezahlen.

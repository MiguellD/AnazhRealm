# Übergabe-Blatt mauer-im-stoff — die Stadtmauer steht als gemauerter Stein im Bau-Stoff der Welt (WIP, Stab-Wechsel 25.11.)

**ZWISCHENSTAND, WIP. Der Schnitt ist gebaut, lädt und zeichnet; offen sind die Station von Hand, der Rest der Gates am Kopf und
der Kopf-Commit der Vorprüfung.** Gebaut und gemessen auf main c540c783 (V18.546.412), danach main 967bd422 (V18.546.414, mit der
Ring-Gasse 39718a18) per Merge-Commit eingezogen. Zweig `mauer-im-stoff`: Kern und Labor · Welt und Linse · Merge · dieses Blatt
mit Bildern. Gerät: Radeon 890M, Werkbank `--echt` 1280 × 720, Messort stadt-voll, Stadt Villaalto (1238, mediterran, Steinring:
19 Segmente, 3 Türme, 4 Tore). Mittag = Uhr 0,5 (Sonne 74° hoch), Abend = Uhr 0,72 (Sonne 10° über dem Horizont), nach dem
Uhr-Wechsel 30 s Ruhe. Karte 2: 105 von 1 718 (Stand-Datei); dieser Zweig bucht keine Sprosse, er hält `wehrbau#1` bis `#3`.

## (a) DER AUFTRAG

Der Brief des Koordinators steht WÖRTLICH in `cloud-post/mauer-im-stoff-bild/auftrag-brief.txt` (34 Zeilen, bindend Wort für
Wort; er nennt Namen, die mit diesem Schnitt fielen, darum steht er als Text-Datei neben den Bildern). Sein Kern:

- **Wort des Schöpfers (24.11.):** „die grauen blöcke, das ist die stadtmauer“.
- **Zielbild:** am Messort stadt-voll steht die Mauer als gemauerter Stein im Stoff der Welt: Verband und Fuge lesbar aus 5 m und
  als Ton aus 100 m, in Sonne UND Schatten (kein Schwarz), die Krone mit Zinnen, der Turm mit Dach; Palisade und Bastion in ihrem
  Stoff; Grenzsteine und Zaun in derselben Welle, WENN die Wurzel dieselbe ist. Nicht Teil: Vogel-Pools und Massen der Stadt-Ferne.
- **Sprossen, die stehen bleiben:** `karte2.mensch.macht.wehrbau#1`, `#2`, `#3`; dazu `gate:settlement` GANZ, die Natur-Wand der
  Mauer, der Fuß am Hang (`STADTMAUER_FUSS_M`), der Schattenwurf.
- **Reihenfolge:** (1) messen, warum die Mauer schwarz liest · (2) `gate:webgl-probe` zuerst · (3) EIN Spike mit echtem Renderer ·
  (4) der Schnitt an der Wurzel: die Mauer wird ein Satz im Stoff der Welt, die Gestalt kommt aus dem Kern, Labor und Welt lesen
  dieselbe Zeile, die Kiste mit Instanz-Farbe fällt physisch · (5) Kosten vorher ↔ nachher, Budget höchstens +2 Draws.
- **Die Naht zur Station (bindend):** fällt der Pool, liefert der Wirt EINEN Leser des Gebauten (`_mauerGebaut(plan)`) mit einer
  Linsen-Zeile gegen den Puffer; VOR dem Push der Vorprüfung fährt der Arbeiter die echte Station von Hand (`#1`, `#2`, `#3`) am
  eigenen Kopf unter dem Schloss und nennt ihr Urteil mit Zahl; vorher fragt er den Koordinator nach dem Aufruf und dem geheilten
  Stand der Station.
- **Linse (Gebot 10):** in `gate:settlement` EINE Zeile „die Mauer im Stoff der Welt“, vorher ROT am Täter, mit Mutant, ≤ 3 min
  CI, kein Quelltext-Leser.
- **Platz und Regeln:** Baum `C:/Users/micha/AnazhRealm-leben`, Zweig `mauer-im-stoff`; `node_modules` ist eine Junction (nie
  `npm ci`, nie `npm install`); nie `git stash`; fremde Bäume nie anfassen; kein Soll und kein Richter-Text wird geändert; Kern
  nur additiv oder unter Byte-Beweis, nie `prettier --write` auf Kerne oder scripts/; Commit-Rumpf ≤ 600 Zeichen; kein
  Siegel-Wort in Commit, Zweig oder Dateiname; Zeiten nur aus `date`; nur Prozesse mit EIGENER PID beenden.
- **Ports und GPU:** eigener Server `PORT=4399 node save-server.js`, Werkbank `node scripts/werkbank.cjs start --port 4795 --ort
  stadt-voll --echt --seite http://localhost:4399`; jeder GPU-Lauf einzeln unter dem Schloss (`GPU_LAUF_ART=bild bash …
  gpu-lauf.sh mauer-<name> <befehl>`, der volle Pfad steht im Brief); KEINE Browser-Batterie.
- **Pflicht vor dem Push der Vorprüfung:** `npm run check:statik` · `npm run format:check` · `npm run lint` · `node
  scripts/stamm-umzug.cjs --nach-karte` · alle Familien-Schritte der CI (siedlung · settlement · mauer · fachwerk · haus · stoff ·
  albedo · licht) lokal ganz, EXIT beim Namen · Probe-Tag mit genau EINER Marke und höchstens vier Proben · `git fetch origin main`
  und `git merge-tree --write-tree origin/main HEAD` mit exit 0.
- **Abgabe:** Kopf „Vorprüfung mauer-im-stoff 1 (auf main <sha8>): <ein Satz mit den Zahlen> [gpu-probe: <tore>] [ci voll]“,
  Bericht in dieser Datei. **Nachtrag des Koordinators (25.11., Stab-Wechsel):** Arbeiter laufen auf Opus; dieser Stand ist als
  WIP geschoben, ein frischer champion baut ab Abschnitt (e) weiter.

## (b) GESCHNITTEN

- `fachwerk-core.js` (additiv, zwei Hunks, +186 Zeilen, 0 gestrichen): `MAUER_GESTALT`, `mauerEinheit`, `mauerNetz`, `zaunNetz`
  (dazu `gefuegeReihe` im Export). Je Stück der Wehr ein Netz aus Teilen (Einheits-Form × eine Matrix): Steinring = Wand, Wehrgang
  (die Krone des Gesetzes), Brustwehr, Zinnen, Turm mit Zeltdach; Palisade = Pfahlreihe mit gespitzten Köpfen; Bastion = Wall mit
  Wallkrone und Brustwehr; Zaun = Pfosten und zwei Riegel. Die Wand schert am Hang, Stoß und Zinne stehen lotrecht.
- `stamm/siedlung-wege.js`, `stamm/siedlung-ort.js`: die Einfriedung ist EIN Satz (`siedlung-einfriedung`) im Bau-Stoff der Häuser
  (`_foundryTreeMaterial`, derselbe Stoff, dasselbe Programm; Verband und Fuge aus `_verbandStoff`). `_einfriedungArt`,
  `_einfriedungLege`, `_einfriedungFaellt`, der Leser `_mauerGebaut`. **Physisch gefallen:** die Pools der Kiste mit ihren
  Schreibern und Feldern, dazu das Feld `streifen` der Mauer-Box. `gate:altlasten` trägt acht Nadeln dazu: die drei Schreiber
  der Pools, der Streifen-Leser, die zwei Zustands-Felder und die zwei Pool-Namen (Liste `FORBIDDEN`, Grund „mauer-im-stoff“).
- `worlds/fachwerk/fachwerk.js`: das Labor zeichnet dasselbe Netz (`netzAm`), die Quader je Wand, Krone, Turm und Dach fielen.
- Stehen geblieben wie verlangt: `gate:settlement` ganz, die Natur-Wand der Mauer, der Fuß am Hang (`STADTMAUER_FUSS_M`), der
  Schattenwurf (der Satz wirft), kein Soll und kein Richter-Text geändert.
- Commits des Zweigs: 53c1f09b (Kern und Labor) · 2ed47b75 (Welt und Linse) · 1eea787b (Merge von main 967bd422) · der
  WIP-Kopf (dieses Blatt und die Bilder).

## (c) GEMESSEN

**Das Urteil der echten Station je Sprosse: NICHT gefahren** (`wehrbau#1`, `#2`, `#3`; Grund und Port in „Die Naht zur Station“).

### Die Wurzel (gemessen an main c540c783, vor dem ersten Schnitt)

| Messung (lineares Ziel, ohne Luft und Post) | Schattenseite | Sonnenseite | Schatten ÷ Sonne |
|---|---|---|---|
| Mauer mittags | 0,0720 (nur Himmel, E 0,95) | 0,2306 (Sonne 0,1411 + Himmel 0,0895) | 0,312 |
| Mauer abends | 0,0214 | 0,0906 | 0,237 |

- Albedo der Mauer 0,2384 (0,266 / 0,235 / 0,195: der Ton `stein` des Gesetzbuchs). Die 18-%-Karte am selben Ort trägt Schatten ÷
  Sonne 0,31: **die Licht-Kette behandelt die Mauer wie jede Fläche, das Licht ist nicht der Täter.**
- Kontrast IN der Fläche (Streuung ÷ Mittel) 0,001 bis 0,006: der Kisten-Pool (`_kistenPool`, weißer Stoff mit Instanz-Farbe)
  zeichnete je Segment EINEN Quader von 37 m in EINEM Ton, ohne Verband, Fuge, Gefüge und Gestalt. **Der Täter ist der Stoff.**
- Wand ↔ Mauer im selben Ausgabe-Bild (Kamera innen-gasse, mittags): Putz des Hauses sRGB 137/132/107 (Y 0,230), sein Sockel
  64/61/45 (Y 0,061, Kontrast 1,15), die Mauer daneben 30/37/27 (Y 0,017, Kontrast 0,009).
- Zaun: derselbe Pool (`siedlung-zaun`, eine Kiste je Feld), dieselbe Wurzel. Fällt in dieser Welle mit.
- Grenzstein (`grenzeImLand`): ANDERE Wurzel. `markstein_dorf` ist Foundry-Architektur im Bau-Stoff mit Verband, kein Kisten-Pool;
  er liest im Ausgabe-Bild 25/26/26 (Y 0,0135) bei Boden 0,0664. Nicht in dieser Welle (siehe Offen).

### Bildpaare (identische Kamera, vorher = main c540c783, nachher = Kopf)

Verkleinert im Repo unter `cloud-post/mauer-im-stoff-bild/` (`vor-<kamera>-<zeit>.jpg` ↔ `nach-<kamera>-<zeit>.jpg`), in voller
Größe auf dem Laptop:
vorher `C:\Users\micha\AppData\Local\Temp\claude\9fd86081514dce1c\9c27a074-223e-48c0-a5af-60ae0385359b\scratchpad\mauer\v2\`,
nachher `C:\Users\micha\AppData\Local\Temp\claude\9fd86081514dce1c\9c27a074-223e-48c0-a5af-60ae0385359b\scratchpad\mauer\n3\`
(Dateien `<kamera>-mittag.png`, `<kamera>-abend.png`; `-rot` im Namen = die Abnahme der Werkbank meldet „Blickziel verdeckt“, das
Bild ist ganz). `kopf-<kamera>-mittag.jpg` (drei Bilder) = dieselbe Kamera am gemergten Kopf, Stand 18.546.414, 08:53 Uhr: die
Mauer liest wie im Nachher-Bild.

| Kamera | Ort → Blick | Was sie zeigt |
|---|---|---|
| innen-nah | 835,8 46,6 604,9 → 834 47,8 610,8 | Schattenseite aus 5 m |
| innen-gasse | 855,9 47 606,7 → 818 47,6 611,4 | Schattenseite im Streifblick, Haus daneben |
| aussen-nah | 836,2 46 616,5 → 834 47,8 610,8 | Sonnenseite aus 5 m |
| aussen-mittel | 843,7 44,7 650,4 → 832 48,1 610,9 | Sonnenseite aus 40 m |
| turm-nah | 924,3 48,3 603 → 922,5 51,9 587,9 | Turm mit Dach |
| vogel | 926,4 115,3 504,7 → 922,5 48,9 587,9 | 100 m, von oben |
| zaun-nah | 880,6 57,9 451,3 → 883,6 54,4 458,1 | Zaun am Friedhof |
| grenze-nah | 1246 27,9 452,7 → 1251,3 26,8 452,7 | Grenzstein (unverändert) |

**Die Mauer im Ausgabe-Bild, gleiche Fenster (mittlere Farbe sRGB · lineare Leuchtdichte Y · Kontrast = Streuung ÷ Mittel):**

| Fenster | vorher mittags | nachher mittags | vorher abends | nachher abends |
|---|---|---|---|---|
| innen-nah (Schatten, 5 m) | 55/60/62 · 0,0440 · 0,007 | 57/62/64 · 0,0507 · 0,425 | 54/50/46 · 0,0327 · 0,003 | 64/59/56 · 0,0494 · 0,482 |
| innen-gasse (Schatten) | 30/37/27 · 0,0168 · 0,009 | 32/39/29 · 0,0199 · 0,380 | 58/54/49 · 0,0375 · 0,077 | 62/59/53 · 0,0476 · 0,496 |
| aussen-nah (Sonne, 5 m) | 88/78/67 · 0,0798 · 0,067 | 80/71/61 · 0,0736 · 0,565 | 158/116/75 · 0,2038 · 0,018 | 148/108/68 · 0,1889 · 0,489 |
| aussen-mittel (40 m) | 86/80/63 · 0,0811 · 0,237 | 82/76/59 · 0,0751 · 0,351 | 153/114/72 · 0,1970 · 0,293 | 149/110/69 · 0,1874 · 0,362 |

Lineares Ziel nachher: Schattenseite mittags 0,0737 (vorher 0,0720), Sonnenseite 0,2151 (0,2306), Albedo 0,221 bis 0,249
(0,2384), Kontrast in der Fläche 0,22 bis 0,26 (0,001 bis 0,006); abends 0,0219 und 0,0848.

**Gelesen am Bild.** Verband und Fuge stehen aus 5 m und 40 m, in Sonne und Schatten, mittags und abends; die Krone trägt Zinnen
(18 je Segment), der Turm sein Zeltdach in Ziegel; aus 100 m (Vogel) liest die Mauer als Band mit Zinnen-Takt; der Zaun hat
Pfosten und zwei Riegel in Holz. Die MITTLERE Helligkeit der Schattenseite bleibt, wo die Licht-Kette sie stellt (Y 0,020
mittags im Streifblick): aus der schwarzen Platte wurde dunkles Mauerwerk, nicht helles (siehe Offen).

### Bastion und Palisade im Spiel, die drei Arten im Labor

Die drei Arten der Wehr des Gesetzbuchs (`mauerArt`: Palisade bis 1200, Steinring bis 1500, Bastion danach) zeichnen aus
derselben Zeile (`mauerNetz`) in der Welt und im Labor. Mittags, Werkbank `--echt`, Bilder `nach-bastion-*`, `nach-palisade-*`,
`labor-*` im selben Ordner.

| Ort | Art, Jahr | Teile im Leser | Gelesen am Bild |
|---|---|---|---|
| Westerhausen (−53,5 / −182,3), Spiel | Bastion, 1542 | 69: Wand 19 · Krone 25 · Wallkrone (Gras) 22 · Turm 3 | niedriger gemauerter Wall mit Graskrone, Bollwerk ohne Dach; Verband auch im Schatten |
| Hohenheim (1667,5 / 323,4), Spiel, gegründet mit `dorf 11 60` | Palisade, 1125 | 34: Pfahlreihe 24 · Turm 5 · Dach 5 | Reihe gespitzter Stämme, Holzturm mit Dach; kein Schwarz (Bild schwarz 0,0 %) |
| Labor Steinring | Steinring | 25 Wände, 5 Türme, 2 820 Dreiecke | Zinnen, Wehrgang, Zeltdach in Ziegel |
| Labor Palisade | Palisade | 24 Wände, 4 Türme, 18 920 Dreiecke | Pfahlreihe mit Holzturm |
| Labor Bastion | Bastion | 25 Wände, 5 Türme, 650 Dreiecke | Wall mit Wallkrone in Gras |

Die Abnahme der Werkbank meldet an `nach-palisade-turm-mittag.jpg` ROT (Laub einer Birke deckt 29 % des Vordergrunds, das
Blickziel liegt hinter der Pfahlreihe); das Bild zeigt den Turm ganz. Die übrigen drei Palisaden-Bilder sind GRÜN. Im Labor
laden die drei Arten ohne Seitenfehler. **Ehrlich halb:** das Labor zeichnet das Netz im Layout-Stoff seiner Rolle (`mLay`, ein
Stoff je Netz), die Welt im Bau-Stoff mit dem Ton je Teil; Gestalt und Maße sind dieselbe Zeile, der Ton der Untersicht fehlt im Labor.

### Kosten (Messort stadt-voll)

| Zahl | vorher | nachher |
|---|---|---|
| Draws der Einfriedung im Bild des Messorts | 4 (`siedlung-mauer`: Hauptbild + 3 Kaskaden, nie gecullt) | 3 (`siedlung-einfriedung`) |
| Dreiecke der Mauer, alle Pässe, Messort | 4 080 | 4 206 |
| Draws und Dreiecke an Kamera aussen-mittel | 4 · 4 080 (1 020 im Hauptbild) | 3 · 9 524 (4 652 im Hauptbild) |
| Draws und Dreiecke an Kamera innen-nah | 4 · 4 080 | 3 · 1 470 (420 im Hauptbild) |
| Befehle im Lauf (Mittel · p95) | 170 · 208 | 159 · 175 |
| frameMs p50 (frischer Boot → Messort) | 24,70 · 25,02 | 25,01 · 25,15 · 24,99 |
| frameMs p95 | 25,40 · 33,41 | 33,85 · 41,83 · 33,40 |
| frameMs p99 | 33,49 · 33,64 | 50,14 · 50,23 · 33,57 |
| cpuTakt p50 · gpuMs p50 | 17,59 · 16,70 ms · 2,39 · 3,01 ms | 16,99 · 19,77 · 15,23 ms · 3,02 · 3,60 · 3,03 ms |

Budget „höchstens +2 Draws“: gehalten mit −1. Die Läufe sind je 15 s `werkbank lauf` nach frischem Boot und `umstellen --ort
stadt-voll`, vorher = die zwei Wirt-Dateien von HEAD im selben Baum, 05:40 bis 05:54 Uhr hintereinander unter dem Schloss.
**Ehrlich:** der jeweils ERSTE Lauf nach der Ankunft trägt nachher zweimal einen längeren Schwanz (p99 50 ms, 6 von 600
Bildern), der zweite Lauf ist gleich (p95 33,40 ↔ 33,41, p99 33,57 ↔ 33,64). Die Welt streut zwischen zwei Läufen stärker als
der Schnitt (Phase `creatures` 2,8 bis 8,4 ms je nach Bewohnern im Bild). Die Ruhe-Probe am Messort: in 10 s 0 Rufe der Schreiber
(`_einfriedungLege`, `_einfriedungFaellt`), die Versionen aller Puffer des Satzes unverändert (81 Bereiche, 10 604 Ecken).
**Am gemergten Kopf (Stand 18.546.414, 08:52 Uhr, zwei Läufe nach frischem Boot):** frameMs p50 25,04 · 24,88, p95 33,46 ·
33,45, p99 33,64 · 33,58, Befehle im Mittel 167 · 159; die Einfriedung 3 Draws mit 9 520 Dreiecken (aussen-mittel) und 3 mit
1 484 (innen-nah); der Schwanz des ersten Laufs kehrte nicht wieder (über alle fünf Läufe nach dem Schnitt: 2 von 5 mit p99 50 ms).
Jeder `lauf` endet auch an main mit „BELEGUNG ROT: Pflicht über dem Boden“ (main 1,46 ms, Kopf 1,25 bis 1,72 ms > 0,7), unabhängig vom
Schnitt. Eine frühere Messung (05:10 Uhr, p95 50,3 ms) lief unter doppelter Geräte-Last (auch TRAA und Post doppelt) und zählt nicht.

### Die Linse (`gate:settlement`, zwei Zeilen im Teil B, Mutanten im Lauf)

- **„B: DIE MAUER IM STOFF DER WELT“**: keine Kiste `siedlung-mauer`/`siedlung-zaun` in der Szene, der Satz der Einfriedung
  zeichnet mit DEMSELBEN Stoff-Objekt, das der Wirt den Teilen eines Hauses für ihren Satz gibt (das Flat eines echten Hauses
  über `_foundryFlattenFor`, je Teil `_bauSatzArt`), jede Ecke trägt die Nummer ihres Verbands oder Gefüges und den Ton ihrer
  Rolle, die Gestalt der Form steht. Kein Quelltext-Leser: sie liest Szene, Puffer und Stoff der laufenden Welt.
- **„B: DER LESER DES GEBAUTEN“**: jedes Teil von `_mauerGebaut` steht im Puffer, wo seine Matrix es nennt, und jede Ecke der
  Mauer im Puffer gehört einem Teil.
- **ROT am Täter (die echte alte Fassung, Messort stadt-voll, 05:41 Uhr):** `kisten: ["siedlung-zaun inst×6", "siedlung-mauer
  inst×85"]`, kein Satz, kein Leser.
- **GRÜN am Kopf, Messort stadt-voll (Steinring Villaalto und Bastion):** kisten [] · 493 Teile (wand 38, krone 44, untersicht
  19, brustwehr 19, zinne 342, turm 6, dach 3, wallkrone 22) · ohne Verband 0 · Ton-Abweichung 0,0001 · Lage-Abweichung
  0,00004 m · 9 016 Ecken im Leser = 9 016 im Puffer.
- **GRÜN am Kopf, echte Welt bei Hohenheim (Bastion und Palisade, die Linse in ihrer letzten Fassung, 07:01 Uhr):** kisten [] ·
  103 Teile (wand 43, krone 25, wallkrone 22, turm 8, dach 5) · 1 von 13 Teilen eines Hauses zieht denselben Stoff in seinen
  Satz · ohne Verband 0 · Ton 0,0001 · Lage 0,00006 m · 33 020 = 33 020 Ecken.
- **GRÜN am gemergten Kopf (Stand 18.546.414, Messort stadt-voll, 08:53 Uhr, dieselbe Funktion über die Werkbank):** kisten [] ·
  493 Teile · 1 von 13 Haus-Teilen im selben Stoff · ohne Verband 0 · Lage 0,00004 m · 9 016 = 9 016 Ecken; der Port der
  Station: 19 von 19 Wänden, 3 von 3 Türmen, Spalt −1,406 m.
- **Mutanten (im Lauf des Gates, alle drei fallen):** „flach“ (ein Bereich ohne Verband) → 36 Ecken ohne Verband; „zwilling“
  (der Satz zeichnet mit einem zweiten Stoff-Objekt gleicher Werte) → 0 von 13 Haus-Teilen im selben Stoff; „geist“ (ein Teil im
  Leser, das nicht gezeichnet wird) → Lage 5,00005 m daneben, 33 036 ≠ 33 020 Ecken.
- Kern-Teil J3 (node): Palisade 1 854 + 14 Dreiecke, Steinring 210 + 14 (18 Zinnen), Bastion 20 + 30, Zaun 114; jedes Dreieck zu
  seiner Normale gewunden, die Zinne im Band der Quelle, die Mutante mit einem gedrehten Dreieck fällt.

### Die Naht zur Station `mensch.macht.wehrbau`

**Der Leser:** `r._mauerGebaut(plan)` (stamm/siedlung-wege.js) → je Teil `{ art, x, y, z, yaw, pitch, dick, hoch, lang, m, form,
arg, stoff, stueck, bereich, v0, n, ton }`, `m` = 16 Zahlen Einheits-Würfel → Welt, geschrieben aus denselben Zahlen, mit denen
die Ecken in den Puffer gingen. `art`: wand · krone · untersicht · brustwehr · zinne · wallkrone · wandkopf · turm · dach.

**Was die Station heute liest und was fiel** (Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/g5.js` `STADT_MAUER`
und Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/k2-mensch-macht.js`): `r.state.stlMauer` (der Pool, `P.top`,
`P.mesh.instanceMatrix`) und `box.streifen`. Die Heilung, Zeile für Zeile:

- statt der Schleife über `box.streifen` und `getMatrixAt`: `for (const t of r._mauerGebaut(plan)) { M4.fromArray(t.m); … }`
- Wand = `t.art === "wand"` (bisher: sk.x = wand.dick ± 0,01 und sk.y > wand.hoch), Turm = `t.art === "turm"`
- der Spalt unter dem Fuß wie bisher: `V.set(0, -0.5, s).applyMatrix4(M4)` gegen den Boden (der Würfel ist derselbe)
- „gehört zur Stadt“ (`inBox`): `box.stuecke.includes(t.stueck)` statt des Streifens

**Mein Port derselben Rechnung auf dem Leser** (kein Urteil der Station, eine Eval über die Werkbank am laufenden Spiel), Villaalto:
geplant 19 · gebaut 19 · Wände 19 · Türme 3 von 3 · Spalt unter dem Fuß −1,406 m (die alte Fassung: −1,128 m) · 424 Teile in 22
Stücken. **Die echte Station habe ich NICHT von Hand gefahren:** ohne den geheilten Stand liest sie den gefallenen Pool. Der
nächste Arbeiter braucht vom Koordinator den Aufruf und den geheilten Stand, dann fährt er `#1`, `#2`, `#3` am Kopf nach.

### Gates lokal (jedes einzeln unter dem GPU-Schloss, Radeon)

**Am Schnitt auf main c540c783 (vor dem Merge, 06:25 bis 08:10 Uhr), EXIT beim Namen:** `gate:weg-boden` 0 ·
`gate:asset-inventory` 0 · `gate:freie-slots` 0 · `gate:chunk-satz` 0 · `gate:studio-begehen` 0 · `gate:studio-huelle` 0 ·
`gate:albedo-tafel` 0 · `gate:pruefbuehne-licht` 0 · `gate:pruefbuehne` 0 · haus-welt Teil 1/2 0 · Teil 2/2 0 · `gate:haus-fern` 0 ·
`gate:fachwerk-contract` 0 · `gate:nervensystem-fachwerk` 0 · `gate:settlement --selftest` 0 · `npm run check:statik` 0 ·
`npm run format:check` 0 · `npm run lint` 0.

**`gate:settlement` ganz, am gemergten Kopf (09:26 bis 09:32 Uhr, allein unter dem Schloss): EXIT 1, 176 ok, 12 rot.** Alle
zwölf sind EIN Ausfall: das Auto-Dorf der Zelle −4,−4 steht nicht (elf Zeilen „O Auto-Dorf“ und „C-K3: DIE TRASSE AM ORT“,
deren Liste das fehlende Dorf als `null` trägt). Das ist das Rennen des Befunds unten, an main c540c783 allein am selben Gerät
ebenso ROT. Die zwei Zeilen der Mauer sind GRÜN (220 Teile, 4 024 von 4 024 Ecken, 2 von 13 Haus-Teilen im selben Stoff, alle
drei Mutanten fallen), ebenso jede andere der 176 Zeilen.

**Am gemergten Kopf (main 967bd422 eingezogen, ab 08:12 Uhr), EXIT beim Namen:** `npm run check:statik` 0 · `npm run
format:check` 0 · `npm run lint` 0 · `node scripts/stamm-umzug.cjs --nach-karte` 0 (keine Änderung) · regler-wirkt Teil 2 0 ·
Teil 3 0 · `gate:streu-wahrheit` 0 · `gate:gegenstand-stoff` 0 ·
`gate:tag-achse:echt` 0 · `gate:weg-boden` 0 · `gate:asset-inventory` 0 · `gate:freie-slots` 0 · `gate:ofen-contract` 0.

**Am gemergten Kopf steht aus** (die Kette endete mit dem Stab-Wechsel um 09:51 Uhr, das Gerät teilten sich Messgerät,
Koordinator, zwei Macher und die Proben der CI): die Liste in (e) 2. Der Merge brachte 31 Dateien, EINE gemeinsam
(`fachwerk-core.js`, der Block dieses Schnitts additiv an anderer Stelle, `git merge-tree` EXIT 0).

### Befund: `gate:settlement` Teil O (Auto-Dorf) ist am Laptop ein Rennen, an main c540c783 ebenso

Das Kriterium „der Dorf-Zug baut an −841/−861 kein Dorf der Zelle −4,−4“ fällt nicht am Schnitt, es fällt an der Uhr.

| Bedingung | Kopf | main c540c783 (reiner Export, dasselbe Gerät) |
|---|---|---|
| ein Lauf allein | 4 von 4 ROT (das Gate unter dem Schloss 06:11 bis 06:25, zwei Läufe mit Spur, das Gate am gemergten Kopf 09:26 bis 09:32) | 1 von 1 ROT |
| mehrere Läufe zugleich (Last) | 3 von 3: das Dorf steht | 1 von 1: das Gate ganz GRÜN, 130 ok |
| Fenster der Messung gestreckt (60 statt 8 stille Takte, nur im Speicher der Probe) | 3 von 3: das Dorf steht | 3 von 3: das Dorf steht |

**Die Mechanik (Spur je Takt).** Die Probe C der Linse stellt einen Bahn-Stand ohne Ort (`scripts/diag-settlement.cjs`, am Kopf
Z. 2990, an main c540c783 Z. 2786: `r._bedarf = { t: 0, vx: -16, vz: 0, wand: … }`). Der erste echte `_bedarfTakt`
(`stamm/studio-bruecke.js`) rechnet daraus `e.x − undefined`: das Tempo der Bahn ist NaN. `_dorfVorlauf`
(`stamm/siedlung-ort.js`) rechnet mit ihm `ringe = NaN` und stellt keine Zelle in die Reihe, solange das Tempo als frisch gilt
(`BEDARF.frischMs`, 500 ms nach dem letzten Takt der Bahn). In der Spur: Takt 1 bis 16 „Tempo NaN/NaN, Reihe 0“, Takt 17 (354 ms)
„Tempo 0/0, Reihe 20“, erst dann der Vorrat der Zelle −4,−4. Das Fenster der Linse endet acht stille Takte (etwa 180 ms) nach
der Ankunft des zweiten Dorfs (−7,−7): kommt dessen Export schneller als etwa 170 ms (ein Lauf allein), schließt das Fenster,
bevor die Reihe sich füllt. Mein Schnitt berührt weder die Bahn noch den Vorlauf noch die Probe C.

**Eine Beobachtung ohne Wiederkehr.** EIN Lauf des ganzen Gates am Kopf unter Dreier-Last endete mit 131 ok und 1 rot: „O
Auto-Dorf: der Ort hält jede Zahl — fremde Bauten im Erdbau 1“ (`felsbogen` 1). In sechs Läufen mit Namens-Diagnose (Kopf 3,
main 3, Fenster gestreckt) standen 0 fremde Bauten; gezählt über alle Läufe mit gebautem Dorf: Kopf 1 von 4, main 0 von 4.
Felsbögen sind Landmarken der Natur (`stamm/vegetation-baum.js`, `LANDMARK_RATE`), sie entstehen beim Streaming während der Fahrt
des Akts (an main in zwei von drei Läufen 5 und 15 Stück, alle neben dem Ort); ihre Zahl hängt an der Last. Der Ort des einen
fremden Felsbogens ist nicht gemessen, die Zuordnung zum Schnitt nicht bewiesen und nicht widerlegt: der Schnitt berührt weder
den Wurf der Landmarken noch den Erdbau noch `_ortFrei`.

## (d) GELESEN

**Die eigene Quelle (Datei und Symbol).** `stamm/siedlung-wege.js`: `_kistenPool` (die Kiste mit Instanz-Farbe, bleibt für
Vogel, Feld und Stadt-Ferne), `_stlMauerBuild` (der EINE Schreiber der Mauer), `_stlWegeRaten` (der Zaun). `fachwerk-core.js`:
`MAUER_FORM` über `mauerGestalt` (Art, Wand, Krone, Turm, Dach, Bollwerk, Stoff), die Maße `STADTMAUER`. Der Stoff der Welt für
Stein: `_verbandStoff` (`stamm/studio-stoff.js`) im Bau-Stoff der Häuser (`_foundryTreeMaterial`, `stamm/siedlung-satz.js`). Die
Station: Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/g5.js` (`STADT_MAUER`, Z. 1306 bis 1367).

**Quelle und Band.** Zinne: Piper, Burgenkunde (Nachdruck 1994, S. 329): 0,76 bis 2,35 m breit, 1 bis 2 m hoch; de Caboga, Die
Burg im Mittelalter (1982): 0,70 bis 2 m breit, 1 bis 1,40 m hoch, die Scharte höchstens so breit wie die Zinne. Gesetz: Zinne
1,2 × 1,0 m, Scharte 0,8 m, Brustwehr 0,9 m. Untersicht des Wehrgangs: Formfaktor zweier Flächen im rechten Winkel an einer
Kante, F = (1 + H − √(1 + H²)) / 2 (Incropera, DeWitt, 4. Aufl. 1996, Tab. 13.1): 5,6 m Wand vor 0,2 m Überstand deckt 0,49 der
Halbkugel, der Ton der Untersicht trägt 0,5 (sie las vorher heller als die Wand im Schatten: Y 0,0242 gegen 0,0199).

**Was ein Band wurde.** Zinne 1,2 × 1,0 m im Band 0,76 bis 2,35 m × 1 bis 2 m; Scharte 0,8 m (höchstens so breit wie die
Zinne); Ton der Untersicht 0,5 aus F = 0,49. Kein Band wurde: die Höhe der Brustwehr (die Quelle nennt keine Zahl, das Gesetz
trägt 0,9 m als eigene Setzung, mannshoch mit der Zinne 1,9 m).

## (e) DER NÄCHSTE SCHRITT (in dieser Reihenfolge)

1. **Die Station von Hand.** Frag den Koordinator nach dem Aufruf und dem geheilten Stand der Station; die Heilung steht Zeile
   für Zeile in „Die Naht zur Station“ (Zweig `punkte-maschine`, `meisterkarte-quelle/punkte/stationen/g5.js`, `STADT_MAUER`).
   Erwartet am Kopf: `#1` Wände 19 von 19, Türme 3 von 3, Spalt unter dem Fuß ≤ 0,05 m (der Port misst −1,406 m: der Fuß steht im
   Boden); `#2` und `#3` GRÜN wie an main. Ohne Heilung liest die Station den Pool, der mit diesem Schnitt fiel, und ist am Kopf ROT.
2. **Der Rest der Gates am Kopf**, jedes einzeln unter dem Schloss, erwartet je EXIT 0: `npm run -s gate:fachwerk-contract` ·
   `npm run -s gate:studio-begehen` · `npm run -s gate:studio-huelle` · `npm run -s gate:albedo-tafel` · `npm run -s
   gate:pruefbuehne-licht` · `npm run -s gate:haus-fern` · `npm run -s gate:chunk-satz` · `npm run -s gate:pruefbuehne` · `npm run
   -s gate:nervensystem-fachwerk` · `node scripts/diag-haus-welt.cjs --selftest --teil=1/2` und `--teil=2/2` (mit
   `GPU_LAUF_MAX_S=1800`, je 9 und 13 min) · `npm run -s gate:nacht-licht:echt` · `node scripts/diag-hitch-telemetrie.cjs --teil=1`.
   Die ersten elf standen am Schnitt auf c540c783 auf EXIT 0, die letzten zwei liefen noch nie.
3. **`gate:settlement` ganz** (`npm run -s gate:settlement`, 6 min): erwartet allein EXIT 1 mit 12 rot aus dem EINEN Rennen des
   Teils O (Befund in (c)), unter Last GRÜN. Die zwei Zeilen „B: DIE MAUER IM STOFF DER WELT“ und „B: DER LESER DES GEBAUTEN“
   müssen GRÜN sein (220 Teile, 4 024 von 4 024 Ecken). Der Täter des Rennens ist Richter-Code und gehört dem Koordinator.
4. **Der Abdruck:** `node scripts/werkbank.cjs abdruck --gegen <sha von origin/main>` nennt genau die zehn Dateien des Schnitts
   (`git diff --stat origin/main HEAD`: 10 Dateien, 655 Einfügungen, 166 Löschungen, dazu dieses Blatt und die Bilder).
5. **main prüfen:** `git fetch origin main`, dann `git merge-tree --write-tree origin/main HEAD` mit exit 0 (Stand 09:26 Uhr: main
   78ed3167, exit 0, keine gemeinsame Datei); bei Konflikt ein Merge-Commit, kein Rebase.
6. **Statik am Kopf:** `npm run check:statik` · `npm run format:check` · `npm run lint` · `node scripts/stamm-umzug.cjs
   --nach-karte`, je EXIT 0 (am gemergten Stand um 08:20 Uhr je 0).
7. **Der Kopf der Vorprüfung:** dieses Blatt wird der Bericht (das Urteil der Station in (c), die Abschnitte (e) bis (g) fallen
   weg), Titel: „Vorprüfung mauer-im-stoff 1 (auf main <sha8>): die Stadtmauer steht als gemauerter Stein im Bau-Stoff der Welt
   — Kontrast in der Schattenfläche 0,007 → 0,425, Draws 4 → 3, die Kisten-Pools von Mauer und Zaun fielen [gpu-probe:
   gate:pruefbuehne-licht, gate:albedo-tafel, gate:studio-begehen, bild:stadt-voll@0.5] [ci voll]“, Rumpf als ZWISCHENSTAND mit
   Geschnitten, Gemessen, Offen samt Adresse und „Karte 2 gebucht <n> von 1 718“.

## (f) SACKGASSEN (nicht zweimal bauen)

- **Die Mauer als Block im Bau-Satz der Häuser:** der Bau-Satz duldet keine fremden Blöcke (seine Linsen verlangen die Form eines
  Hauses je Bereich). Darum ist die Einfriedung ein EIGENER Satz (`siedlung-einfriedung`) mit DEMSELBEN Stoff-Objekt.
- **„Die Licht-Kette macht die Mauer schwarz“:** gemessen widerlegt. Die 18-%-Karte am selben Ort trägt Schatten ÷ Sonne 0,31
  wie die Mauer; der Täter war der Stoff ohne Verband. Die Mauer über den Stoff heller zu stellen, wäre ein Zwilling des Lichts.
- **Der Grenzstein in derselben Welle:** andere Wurzel (`markstein_dorf` ist Foundry-Architektur im Bau-Stoff mit Verband, kein
  Kisten-Pool); er gehört nicht in diesen Satz.
- **Die erste Fassung der Linse („der Satz teilt den Bau-Stoff mit N Haus-Sätzen“):** am Ort der Linse 0 Haus-Sätze, die Zeile
  war am richtigen Stand ROT. Die Fassung im Zweig fragt den Wirt nach dem Stoff-Objekt eines Haus-Teils (`_foundryFlattenFor`,
  `_bauSatzArt`) und vergleicht die Objekte.
- **Die Scharte „ein Drittel bis ganz so breit wie die Zinne“:** von der Quelle nicht gedeckt; das Band ist das in (d).
- **Mess-Ziele hinter Laub:** die Ziele an der Innenseite bei 836 / 605,9 lasen das Laub einer Eiche (grünstichig, hohe
  Streuung); die Kameras der Tabelle in (c) sind frei, drei melden „Blickziel verdeckt“ und zeigen die Mauer trotzdem ganz.
- **Die Hydro-Theorie für das ROT im Teil O:** falsch (die Zelle −4,−4 liegt in der Heimat-Kachel); die Ursache ist das Tempo
  NaN der Bahn (Befund in (c)).
- **Booten mitten im Edit:** eine halb geschnittene Wirt-Datei hängte den Boot 8 min unter dem Schloss. Nur booten, wenn der
  Baum stimmig ist.
- **Mehrere Linsen-Läufe zugleich:** sie sind CPU-Last neben dem Messgerät und ändern das Urteil des Teils O (unter Last GRÜN).
  Ein Urteil gilt nur allein unter dem Schloss.
- **Die Messung von 05:10 Uhr (p95 50,3 ms):** lief unter doppelter Geräte-Last und zählt nicht.

## (g) APPARAT (Stand 09:55 Uhr)

- **Beendet, nur eigene PIDs:** der eigene Server auf Port 4399, die Werkbank auf Steuer-Port 4795 (seit 08:53 Uhr), beide
  Gate-Ketten. Am GPU-Schloss hält und wartet kein Lauf mit dem Namen `mauer-…`.
- **Nicht meiner, nicht angefasst:** ein Prozess `node save-server.js` vom 25.11. 06:30 Uhr (Windows-PID 30952), Besitzer nicht
  bewiesen.
- **Baum:** `C:/Users/micha/AnazhRealm-leben`, Zweig `mauer-im-stoff`, nach dem WIP-Commit ohne offene Änderung; der Upstream
  ist `origin/mauer-im-stoff`.
- **Logs und Helfer (Laptop, Sitzungs-Ordner, kann nach einem Neustart fehlen):**
  `C:\Users\micha\AppData\Local\Temp\claude\9fd86081514dce1c\9c27a074-223e-48c0-a5af-60ae0385359b\scratchpad\mauer\` mit `log\`
  (je Gate eine Ausgabe, die Liste der EXIT-Zeilen), den Bildern in voller Größe (`v2\` vorher, `n3\` nachher, `n5\` Palisade,
  `n6\` am gemergten Kopf) und den Skripten der Bild-Serien. Nichts davon braucht der nächste Schritt zwingend: die Kameras stehen
  in (c), die Linse lebt im Gate.
- **Abschluss-Zeile der Commits:** dieser Stand trägt die Zeile der Sitzung (Claude Fable 5.2), der Brief nennt Claude Opus 5.5;
  der nächste Arbeiter schließt mit der Zeile seiner Sitzung.

## Offen, mit Adresse

- **Die Station von Hand ist nicht gefahren.** Leser: `karte2.mensch.macht.wehrbau#1` (dazu `#2`, `#3`). Grund: die Station
  im Zweig `punkte-maschine` liest den gefallenen Pool; am Kopf ist sie ROT, bis sie auf `_mauerGebaut` umzieht (die Naht oben).
- **Der Grenzstein liest weiter dunkel** (Y 0,0135 bei Boden 0,0664). Leser: FUND-REGISTER `[stoff grenze]` (Zweig
  `koordination`). Grund: andere Wurzel, `markstein_dorf` ist Foundry-Architektur im Bau-Stoff, kein Kisten-Pool.
- **Die Helligkeit der Schattenseite stellt die Licht-Kette**, nicht der Stoff (Schatten ÷ Sonne 0,31 für jede Fläche; der
  Sockel des Hauses im selben Bild liest wie die Mauer). Leser: FUND-REGISTER `[stoff mauer]` (Zweig `koordination`): die Zeile
  „pechschwarz, glatte Platte, Quader ohne Dach und Zinne“ fällt mit diesem Schnitt, der Rest ist Licht.
- **Der Schwanz im ersten Lauf nach der Ankunft** (p99 50 ms in zwei von fünf Läufen nach dem Schnitt, 6 von 600 Bildern; p95
  einmal 41,8 ms; am gemergten Kopf in zwei von zwei Läufen nicht). Leser: `gate:hitch-telemetrie` und die Probe
  `bild:stadt-voll@0.5` des Kopfs. Grund: fünf gegen zwei Läufe trennen Schnitt und Streuung der Welt nicht.
- **`gate:settlement` Teil O (Auto-Dorf) ist am Laptop ein Rennen, an main c540c783 ebenso** (Abschnitt oben). Leser:
  `gate:settlement` (der Richter des Koordinators) und FUND-REGISTER (Zweig `koordination`), neue Zeile `[linse settlement O]`.
- **Der Turm steht 0,25 m über der Zinnen-Oberkante** (Turm 8,4 m, Zinnen 8,15 m, darüber das Zeltdach). Kein Soll geändert;
  Leser: FUND-REGISTER `[stoff mauer]` (Zweig `koordination`), als Zahl für das Gesetzbuch der Wehr.
- **Nicht Teil dieser Welle, wie bestellt:** die Vogel-Pools und die Massen der Stadt-Ferne (`_kistenPool` bleibt ihr Stoff).

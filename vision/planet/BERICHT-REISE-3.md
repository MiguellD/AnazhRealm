# BERICHT REISE · WELLE 3 — Bewuchs und Grund nach Klima: EIN Samen, vier Orte (15.11.2026, 16:30) · ZWISCHENSTAND

Zweig `w28-planet-kern`, Kopf **a1f9bf1c** (gepusht). Die Bilder und Spiel-Zahlen stammen vom Stand **ec37e7fd** (darin main
**2b826a89** als Merge-Commit); der Kopf trägt danach nur einen Satz in `docs/studio-vertrag.md` mehr, kein Laufzeit-Byte.
Dieses Blatt liegt unverfolgt im Baum (die Zitat-Wand nennt jedes verfolgte Blatt, das nicht in der Karte `docs/README.md` steht).
Kern `planet-h2-4`. Alle Spiel-Zahlen: Radeon 890M, echtes Fenster 1920 × 1080 ab dem Boot, EINE warme Welt, unter fremder Last.

**Drei Sätze.**
- **Geschnitten:** Der Planet reicht seine Pflanzen-Deckung (dieselbe Rechnung wie die Farbe seines Atlas) als Verhältnis zum
  Anker, die EINE Tafel `ortGesetz(teil).wuchs` macht daraus sieben Faktoren (Krautschicht, Oase, Wald, Gras, Laub, Nadel, Sand —
  in der Heimat jeder 1), und Boden-Farbe, Wald, Streu, Nah-Streu, Platzierung, Rasen und Plan-Bäume lesen sie; main ist
  hineingemischt, die Funde der Gegner sind geheilt oder benannt.
- **Gemessen:** heiß 0 Bäume und Ocker-Grund (167/133/92, Grün 11 %), kalt 0 Bäume und 100 % Weiß, Küste 5 106 Bäume ohne
  Nadelholz vor 44 % Meer, vor 100 Ma 82 % Nadelholz auf Streu-Grund bei Meer +9,88 m; Heimat byte-gleich (Abdruck 103 von 103
  SHA gegen main, nach „reise heim“ Höhe und Boden-Farbe gleich); Sprung 7,2 · 3,4 · 2,7 · 6,5 s, heim 3,9 s.
- **Ehrlich offen:** der Sprung reißt an zwei von vier Orten die 5 s und zeigt an jedem den Ladeschirm; der Speicher wächst mit
  dem Weg (500 → 1 975 MB über fünf Sprünge); jeder Ort trägt Prüfplatz und Dorf (auch vor 100 Ma), der See der Wüste steht
  voll; gelesen werden 18 von 23 Feldern, im Mittags-Bild ändern 9.

---

## 1 Geschnitten (Datei:Zeile am Stand ec37e7fd)

| Teil | Datei:Zeile | Was |
|---|---|---|
| der Planet liefert | `planet-core.js` 2143 · 2281 · 2300 · 2340 · 57 | `pflanzenDeckung` (veg aus N ÷ PET → Krautschicht, Wald) ist EINE Rechnung für `biomFarbe` und `planetOrt().wuchs`; Δ als Verhältnis zum Anker (am Anker 1); VERSION `planet-h2-4`, Relief-SHA cc2f8284 und Biom-Karte unbewegt (6 von 6 SHA h2-3 = h2-4) |
| die EINE Tafel | `gelaende-core.js` 5661 · 5681 · 5690 · 5794 | `ORT_FELDER.wuchs`, `ORT_WUCHS` (Schwellen: Landpflanzen, Wälder, Bedecktsamer, Gräser in Ma; Dauer-Frost, Nadelholz, Sand in °C), `ortWuchs` → `ortGesetz(teil).wuchs` |
| der kahle Grund | `gelaende-core.js` 5714 · `foundry-core.js` 108 | `kahlGrund` (Fels ↔ Wüsten-Ocker nach der Wärme des Orts), EINE Formel für Wirt und Faden; Palette `wueste` 0xd0a26a — die Wiesen-Wache liest sie als nicht-grün (der Strand-Sand läse sich als Wiese: +0,040) |
| Boden-Farbe | `stamm/gelaende-boden.js` 2534 · `voxel-worker.js` 3281 | vor den Gräsern Streu statt Wiesen-Grund; kahl = 1 − (decke + (oase − decke) · nass): die Wüste grünt am Wasser; der Halm, die ferne Wiese und das Gras-Relief folgen über die Wiesen-Wache |
| Wald | `phyto-core.js` 3052 · 2805 · 3485 · 2906 · 2917 · 3513 | `forestWaldgrenze(schnee, wald)` an beiden Stellen (Dart und Kronen-Deckung der Ferne), `forestNische` × nadel/laub, `ctx.wuchs` Pflicht (`forestWuchs`); Wirte `voxel-worker.js` 1421 · 4260 · 4280, `stamm/vegetation-wiese.js` 2795 |
| Streu | `phyto-core.js` 6830 · `stamm/vegetation-streu.js` 39 · 225 · 3016 | `streuRegion`: Baum-Schicht × wald, Kraut-Schicht × decke, Fels 1; die Art der Baum-Schicht nach nadel/laub (in den Tropen die Palme, wo Nadelholz stünde) |
| Nah-Streu, Platzierung, Narben | `stamm/vegetation-wiese.js` 1337 · 2462 · 2498 · 2072 · `stamm/vegetation-baum.js` 1354 | Kraut × Krautschicht samt Oase, Totholz × Wald, Stein 1; `_placementDensityFactor`, `_canopyLightAt`, Strauch-Teppich, `_wuchsAt` |
| Plan des Orts | `stamm/siedlung-wege.js` 1483 · `stamm/siedlung-ort.js` 2454 | der Rasen malt mit decke · gras; ein Baum des Plans steht nach seinem Rang gegen wald · (nadel oder laub) |
| der Faden reicht | `voxel-worker.js` 1162 | `planet-ort` trägt `delta.wuchs` |
| Linse (Gebot 10) | `scripts/diag-worker-dichte.cjs` 2076 · 2132 · `package.json` 54 | K7 in der Familie gate:worker-dichte (`--faden --planet`): Reise an den heißen Ort und heim durch die Konsole |
| Richter | `scripts/diag-planet.cjs` 539 · 1241 · 882 | `ort.delta.null` liest die Verhältnisse, Mutant `ort.delta.wuchs feuert`; `bytes.streifen` urteilt Bytes, die Zeit ist Lesewert (Gegner F10) |
| Vertrag, Karte | `docs/studio-vertrag.md` §9 · `spec/stamm/modul-karte.json` | `wuchs`, `kahlGrund`; `AnazhRealm.STREU_NADEL` |

**Was stirbt:** der Wald, die Wiese, die Streu und der Rasen der Heimat an jedem Ort (`reise.biom` des Entscheids) · die
Wanduhr-Schwelle 150 ms in `bytes.streifen`. Kein Flag, kein Sonder-Modul: jeder Leser rechnet × Faktor, in der Heimat × 1.

**Wo die Heimat ihr Klima bisher übersetzte** (gelesen vor dem Schnitt): die Waldgrenze im Schnee (`forestWaldgrenze`), die
Wiesen-Wache der Boden-Farbe (g − (r+b)/2), die Feuchte des Bodens (`_feuchteAt`) und je Leser ein Sockel für den Regen
(`wetBase`, `WUCHS.wasserBasis`, `groundCover` bei Feuchte 0) — kein Leser las Niederschlag. Der Ort tritt an genau diesen
Stellen ein.

---

## 2 Gemessen

### 2.1 Die vier Orte im Spiel (gelesen durch die Leser des Spiels, je Ort nach 16 s)

| | Heimat | heiß-trocken | kalt | nass-warme Küste | vor 100 Ma |
|---|---|---|---|---|---|
| Satz | (Ankunft) | `reise 17.09 61.93` | `reise 79.07 0.56` | `reise 5.5 -27.25` | `reise 38.40 -2.18 -100` |
| Sommer / Winter am Meer | 18,0 / −4,0 °C | 38,5 / 17,0 °C | −3,7 / −23,8 °C | 29,1 / 21,6 °C | 20,1 / 1,0 °C |
| nass | 37,2 % | 8,1 % | 0 % | 49,8 % | 36,6 % |
| Meer | −3,00 m | −3,00 m | −3,00 m | −3,00 m | **+9,88 m** |
| Krautschicht · Wald | 1 · 1 | 0,06 · 0 | 0 · 0 | 1 · 1 | 1 · 1 |
| Gras · Laub · Nadel | 1 · 1 · 1 | 1 · 1 · 0 | 1 · 1 · 1 | 1 · 1 · **0** | **0** · 0,13 · 1 |
| Bäume in 441 Wald-Zellen | 4 769 | **0** | **0** | 5 106 | 5 708 |
| Arten | Tanne 1 861 · Kiefer 1 301 · Birke 797 · Eiche 716 · Erle 72 | — | — | Eiche 3 238 · Birke 1 365 · Erle 487 (kein Nadelholz) | Tanne 2 733 · Kiefer 1 945 · Erle 422 · Eiche 302 · Birke 267 (82 % Nadelholz) |
| Grund im Mittel (sRGB, 4 km) | 88/89/64 | **167/133/92** | 234/235/252 | 90/89/65 | **113/88/62** |
| Grün unter der Wiesen-Wache | 56,5 % | 11,2 % | 0 % | 53,3 % | 1,0 % |
| Weiß · Meer (Anteil, 4 km) | 0 · 0 % | 0 · 0 % | 100 · 27,2 % | 0 · 43,7 % | 0 · 0 % |
| gezeichnete Instanzen der Szene | 16 576 | 2 861 | 110 | 18 651 | 2 305 |
| JS-Heap am Ort (nach 16 s) | 354 MB | 920 MB | 991 MB | 2 004 MB | 1 264 MB |

Vorher am Kopf 71dfb7af (dieselbe Linse K7): am heißen Ort 839 Bäume in 25 Zellen (Heimat 737), Grün 67 % → jetzt 0 und 11 %.

### 2.2 Der Sprung (Satz → erstes Weltbild der Ziel-Welt; f = Referenz-Last ÷ kleinste der Sitzung)

Referenz: 4 Mio. sin · exp im Haupt-Faden der Seite unmittelbar vor dem Satz (kleinste der Sitzung 46,2 ms), daneben der
Median der Bild-Zeit über 2 s davor.

| Sprung | Zeit | Ladeschirm sichtbar | Referenz · f | Bild p50 davor | Heap davor |
|---|---|---|---|---|---|
| Heimat → heiß (der erste der Sitzung) | **7 243 ms** | 1 642–7 228 ms | 52,0 ms · 1,13 | 7,2 ms | 500 MB |
| heiß → kalt | 3 448 ms | 552–3 435 ms | 46,5 ms · 1,01 | 8,0 ms | 844 MB |
| kalt → Küste | 2 663 ms | 328–2 620 ms | 47,5 ms · 1,03 | 8,1 ms | 1 612 MB |
| Küste → vor 100 Ma | **6 452 ms** | 1 826–6 437 ms | 74,0 ms · 1,60 | 8,2 ms | 1 163 MB |
| „reise heim“ | 3 916 ms | 1 705–3 900 ms | 46,2 ms · 1,00 | 6,7 ms | 1 664 MB |

- **≤ 5 s hält an zwei von vier Orten und heim, reißt am ersten Sprung (7,2 s) und in die Zeit (6,5 s bei f 1,60; die Antwort
  des Planeten 258 ms für die neue Scheibe).** Vorher am Kopf 71dfb7af (Lauf 10:27): 6 359 · 5 697 · 5 234 · 6 161 ms.
- **„Ohne Ladebild“ reißt an jedem Sprung:** die EINE Tür zeigt den Ladeschirm (`_weltWechsel`, `stamm/speicher-laden.js` 1242),
  er steht 2,3–5,6 s.
- **„reise heim“ führt in die byte-gleiche Heimat:** Welt-Id gleich, Höhe des Gesetzes an 81 Punkten gleich (1120549748),
  Boden-Farbe an 81 Punkten gleich (−764092307), Meer −3.
- `reise 5 -28 -100` antwortet „… liegt Meer, 577 km vor der Küste — dort ist kein Ort“ und gebiert nichts.

### 2.3 Die Heimat im Gesetz

| Probe | Zahl |
|---|---|
| Byte-Abdruck `gate:worker-dichte --abdruck` main 2b826a89 ↔ dieser Stand | 103 von 103 SHA-256 gleich (40 Gitter Main + Faden, Makro 3 Saaten, Bühne, Leser samt Boden-Farbe des Fadens) |
| gate:worker-dichte | Standard und Bühne maxDiff 0, Kern-Probe grün, K6 + K7 samt Selbsttest grün; der Faden-Teil im ersten Lauf ROT an der Zeit des Stau-Takts (8,4 > 8 ms unter Last, eine Wanduhr-Zeile außerhalb dieses Schnitts), im zweiten Lauf grün (3,7 ms) |
| `diag-planet --selbsttest` · `--richter ort` · `--bytes` | 45 von 45 · `ort.delta.null` 30/30 · 7 Zeilen grün (`planet.bytes.engines` offen) |
| `npm run check` | grün am Kopf a1f9bf1c (521 s); am Zwischen-Kopf 8990f96f ROT an genau einer Zeile — die Zitat-Wand nannte dieses Blatt, solange es verfolgt war |
| voller Playtest · playtest:fast | „Alle Invarianten OK“ (145 s, 0 von 3 723 rot) · 21 von 21 |
| Spike in node (drei Fälle + zwei) | Heimat 9 355 Bäume, SHA der Darts gleich · heiß 0 · kalt 0 · Küste 9 248 ohne Nadelholz · vor 100 Ma 9 744 (80 % Nadelholz) · vor 500 Ma 0 |
| Verteilung über 400 Land-Ziele des Planeten | Wald 151 · Steppe 91 · Wüste 156 · Eis 2 — an 62 % der Ziele trägt der Ort nicht den Wald der Heimat |

### 2.4 Die Linse K7 (Gebot 10)

Der Fall: „der Ort trägt den Wuchs der Heimat“. `gate:worker-dichte --faden --planet` reist am Null-Renderer mit dem Satz der
Konsole an den heißen Ort und heim und liest durch die Leser des Spiels (Tafel der Lage, `_forestGeborene`, `_bodenFarbeAt`).

| | |
|---|---|
| ROT beim Namen | die Reise kam nicht an · der Ort trägt den Wuchs der Heimat · am Ort ohne Wald-Anteil stehen Bäume · der kahle Grund liest als Wiese · die Heimat ist nach „reise heim“ nicht byte-gleich |
| am Stand davor (71dfb7af, `--wurzel`) | „⛔ K7: der Ort trägt den Wuchs der Heimat (Wald 1, Krautschicht 1)“, 839 Bäume in 25 Zellen, Exit 1 |
| am Stand | grün: 0 Bäume (Heimat 737), Grün 11 % (Heimat 58 %), heim byte-gleich |
| Selbsttest | die Lage des Wirts reicht am Ort die Tafel der Heimat (in die Welt gepflanzt, dieselben Leser): 839 Bäume, 54 von 81 Punkten grün → ROT beim Namen |
| Kosten | 12 s im Tor (K6 + K7 gezielt, samt Selbsttest) |

---

## 3 Bilder

Ordner: `C:\Users\micha\AnazhRealm-profiband\artifacts\profiband\auge\planet-reise\welle3\` — alle 1920 × 1080, Uhr 0,5, Bühne
Sommer · klar, `r._schirm()` 1920 × 1080, `r._laubRand()` 216. Namen `<Ort>-<Kamera>-ec37e7fd.png`; ein Name auf `-rot.png` ist
das Urteil der Abnahme „Blickziel verdeckt“ (ein Bau oder ein Hang steht im Blick-Strahl), das Bild zählt.

| Ort | Ankunft Augenhöhe | Ankunft Totale (80 m, 25° abwärts) | Natur-Ort Augenhöhe · Totale |
|---|---|---|---|
| Heimat | `0-heimat-ankunft-auge-ec37e7fd-rot.png` | `0-heimat-ankunft-totale-ec37e7fd.png` | `0-heimat-natur-auge-…` · `0-heimat-natur-totale-…` |
| heiß-trocken | `1-heiss-trocken-ankunft-auge-ec37e7fd.png` | `1-heiss-trocken-ankunft-totale-ec37e7fd.png` | `1-heiss-trocken-natur-auge-ec37e7fd-rot.png` · `…-natur-totale-…` |
| kalt | `2-kalt-ankunft-auge-ec37e7fd-rot.png` | `2-kalt-ankunft-totale-ec37e7fd.png` | `2-kalt-natur-auge-…` · `2-kalt-natur-totale-…` |
| Küste | `3-kueste-ankunft-auge-ec37e7fd.png` | `3-kueste-ankunft-totale-ec37e7fd.png` | `3-kueste-natur-…`, dazu `3-kueste-ufer-auge-…` · `3-kueste-ufer-totale-…` |
| vor 100 Ma | `4-zeit-100ma-ankunft-auge-ec37e7fd.png` | `4-zeit-100ma-ankunft-totale-ec37e7fd.png` | `4-zeit-100ma-natur-auge-…` · `4-zeit-100ma-natur-totale-…` |

Alle nebeneinander: `kontaktbogen-ec37e7fd.png`. Rohdaten: `probe-ec37e7fd.json`, `probe-ec37e7fd.log`. Vorher-Bilder
derselben Orte am Kopf 71dfb7af: `…\planet-reise\abnahme\` und `kontaktbogen-reise.png` (die Küste dort noch `5 -28`, 3,4 % Meer).

**Mein Blick.** Heiß: Ocker-Dünen bis zum Horizont, kein Baum, Felsen, ein See mit grünem Schilf- und Wiesen-Saum (die Oase),
das Dorf am Ufer. Kalt: Weiß bis ans dunkle Meer, kein Baum, kein Rasen, der Teich hell wie Eis. Küste: Laubwald bis an Buchten
und offenes Meer, Wiese im Vordergrund. Vor 100 Ma: brauner Streu-Grund ohne Halm, Sträucher, Wald am Fluss, Nadelholz auf den
Kämmen. Die vier lesen als vier Klimata. Schwächen: die Kronen des Walds vor 100 Ma lesen in der Mitteldistanz rund wie Laub;
das Dorf steht an jedem Ort.

---

## 4 Konsum-Tiefe

**Gelesen von einem Leser des Spiels: 18 von 23 Feldern = 78 %** (vorher 17: neu `biom` in seiner stetigen Form `wuchs`).
**Im Mittags-Bild der vier Orte ändern 9 von 23 = 39 %**; im Spiel über die Zeit beobachtbar weitere 4 (zusammen 13 = 57 %).

| Felder | gelesen | ändert das Mittags-Bild an den vier Orten |
|---|---|---|
| land · hoehe · rauhLambda · trog · tafel (5) | ja (`ortErbgut`) | ja (Landform, Meer-Anteil) |
| ks · kontinentLambda · schichtDicke · hartAnteil (4) | ja | nein — der Planet liefert sie an allen vier Orten gleich |
| waterLevelM (1) | ja | ja (vor 100 Ma +12,88 m) |
| sommer · winter (2) | ja | ja (Schnee-Linie, Dauer-Frost, Nadelholz, Sand) |
| tagAmp · sommerPhase (2) | ja | nein (tagAmp im Tagesgang; alle vier Orte liegen im Norden) |
| spendeVerh (1) | ja | nein im Standbild (Pegel der Flüsse; der See fällt nur 0,6 m) |
| regenQuote · sturmQuote (2) | ja | nein unter der klaren Bühne (im Spiel: der Wetter-Zug) |
| biom → wuchs (1) | **ja, neu** | **ja** (Grund, Wald, Streu, Rasen) |
| windX · windZ (2) | nein | — die Richtung würfelt `windSaat` aus der Ort-Saat (`phyto-core.js` 4155) |
| huelleM · landC (2) | nein | — die Küste liegt nicht dort, wo der Atlas sie zeigt |
| breite (1) | nein | — die Sonne steht an 79° N mittags im Zenit |

---

## 5 Die Funde der Gegner

| Fund | Stand | Datei:Zeile |
|---|---|---|
| Spiel F0 — die Reise existiert nicht | geheilt (vor dieser Welle) | `stamm/feld-leben.js` 1422 (Ziel), 1398 (heim), 1367 (Ort) |
| F1 — der Samen der Welt statt des Planeten | geheilt (davor), an vier Orten gespielt: jeder nennt „Samen anazh-realm-seed“ | `stamm/gelaende-chunks.js` 658 `_planetSamen` · Linse K6 `scripts/diag-worker-dichte.cjs` 2030 |
| F2 · F8 — der Planet-Faden trägt die Welt, jede Welt zahlt ihn | geheilt (davor): schlank, geboren mit dem Satz, 0 Nachrichten des Stands | `stamm/gelaende-chunks.js` 629 · 666 |
| F3 — der Ort löscht die Platte der Heimat | geheilt (davor): Genese, Erbgut, Ort im Schlüssel; der Deckel hält Heimat und Ort | `stamm/gelaende-chunks.js` 855 · 868 · `voxel-worker.js` 843 |
| F4 — das Jahr steht dreimal | geheilt (davor): `PLANET_ERDE` 365, 0 Flicken | `planet-core.js` 264 · 2063 |
| F5 — Phase und Band der Heimat im Stamm | geheilt (davor) | `stamm/bild-himmel.js` 2822 · 2877 |
| F6 — fünf Rufer der Normalform | geheilt (davor): `ortErbgut` schreibt das Erbgut EINMAL ins Gesetz der Welt | `stamm/netz-portal.js` 698 |
| F7 — Konsum 0 von 23 | 18 von 23 gelesen, 9 im Mittags-Bild (§4) | — |
| F9 — Täter des Selbsttests nicht in der Welt | geheilt (davor); K7 pflanzt seinen Täter in die Welt | `scripts/diag-worker-dichte.cjs` 1983 · 2076 |
| F10 — `--bytes` urteilt eine Wanduhr | **geheilt in dieser Welle** | `scripts/diag-planet.cjs` 882 |
| F11 — Welt ohne `genVersion` | geheilt (davor): die Geburt geht durch `_buildEmptyWorldSnapshot` | `stamm/netz-portal.js` 692 |
| F12 — der Anker wandert mit dem Kern | hält: VERSION in Welt-Id und Satz; h2-4 gebiert neue Orte | `stamm/netz-portal.js` 670 |
| Spiel F3 — jede Welt liegt bei 43–46° | offen, Rand: die Lage der Heimat ist eine Konstante des Gesetzes | `voxel-worker.js` 1123 |
| Spiel F4 — „reise heim“ schlug „ziehe heim“ vor | geheilt (davor) | `stamm/feld-leben.js` 1398 |
| Spiel F6 — der Anker kommt spät | der erste Satz „reise“ antwortet nach 424 ms | — |
| Spiel §2 — der Wechsel direkt am ersten Bild kostet 6,3 s | offen, ungemessen in dieser Welle (Speicher-Faden, `stamm/speicher-laden.js` 1246) | — |

---

## 6 Ehrlich offen (mit Messnamen)

- **`reise.tuer`: ≤ 5 s reißt an 2 von 4 Orten (7,2 und 6,5 s), der Ladeschirm steht an jedem Sprung 2,3–5,6 s.** Der Sprung
  ist die Ankunft einer Welt bei warmer Seite — Pflicht-OFFEN B; diese Welle schneidet die Tür nicht (`stamm/dirigent-ankunft.js`
  ist mit `w28-preis-ort` geteilt).
- **`reise.platz`: der Speicher wächst mit dem Weg.** JS-Heap 500 → 844 → 1 612 → 1 163 → 1 664 → 1 975 MB über fünf Sprünge, an der Küste 2 004 MB
  (ohne erzwungenes Aufräumen); die Preis-Läufe am Kopf 71dfb7af endeten nach 7–8 Wechseln mit „Speicher erschöpft“
  (`…\planet-reise\preis\probe-preis.log`). Der Täter ist ungelesen (was der Abschied der Welt hält, `_weltAbschied`).
- **`reise.siedlung`: jeder Ort trägt den Prüfplatz und ein Dorf** — auch das Eis und die Welt vor 100 Ma; Äcker und Gassen
  lesen den Wuchs nicht. Rasen und Plan-Bäume lesen ihn.
- **`reise.see.spende`: der See der Wüste steht voll.** Der Pegel senkt jeden Spiegel höchstens um die Wassertiefe des
  Fluss-Betts (`pegelHubVon`, `gelaende-core.js` 1614: −0,6 m); ein See ohne Zufluss müsste bis zur Sohle fallen. Im Bild liest
  er als Oase.
- **`reise.landung`: 23 von 400 Land-Zielen (5,8 %; an der Küste 16 von 57) tragen im Makro-Gesetz weder am Ursprung noch in
  der Spirale bis 240 m** — die Reihe der Ort-Saaten aus dem Entscheid ist nicht gebaut; die Küste dieses Berichts ist eine
  gewählte Lage (`5.5 -27.25`), an `5 -28` zeigt die Ankunft 3,4 % Meer.
- **`reise.arten`: die Zeit kennt nur Gras, Laub- und Nadelholz.** Sträucher und Blumen der Streu stehen vor 100 Ma; die
  Auto-Arten des Rezeptbuchs im Wald tragen keinen Faktor; die Palme steht nur in der Streu-Schicht.
- **`reise.sonne.breite`, `reise.wind.richtung`, `ort.leit.leser`:** geliefert, ungelesen (§4).
- **Die Soll-Tafel (A) steht am Zweig veraltet:** `gelaende-core.js` und `foundry-core.js` sind bewegt, ihre Messungen gelten
  bis zur Neu-Messung nicht.
- **GTX 1060: 0 Messungen.** Alles Radeon, ein Lauf, fremde Last (drei andere Arbeiter und ein CI-Lauf am Schloss).
- **Süd-Halbkugel im Spiel ungesehen** (alle vier Orte liegen im Norden).

---

Geschnitten: Bewuchs und Grund nach Klima durch die EINE Tafel `ortGesetz(teil).wuchs`, main 2b826a89 hineingemischt, Linse K7, Gegner F10.
Gemessen: heiß 0 Bäume · Grund 167/133/92; kalt 100 % Weiß; Küste 5 106 Bäume ohne Nadelholz, 44 % Meer; vor 100 Ma 82 % Nadelholz, Meer +9,88 m; Heimat 103 von 103 SHA; Sprung 7,2 · 3,4 · 2,7 · 6,5 s, heim 3,9 s.
Pflicht-OFFEN Rest: A · B · C · E · F (docs/PFLICHT-OFFEN.md, von dieser Welle unberührt)
Status: ZWISCHENSTAND

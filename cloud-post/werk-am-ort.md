# werk-am-ort — wer laut Plan arbeitet, steht an seinem Werk; wer einkauft, geht über den Markt (Stand-Blatt)

Zweig `werk-am-ort`. Kopf 4 ist EIN glatter Commit auf `origin/main` 4a188bf2 (w28-jaeger-stand + die Versions-Stufe 18.546.439).
Er trägt Kopf 3 a7569cd3 (auf main 99649186) unverändert bis auf EINE Naht, Abschnitt KOPF 4. Kopf 3 trug Kopf 1 (cfa4fc95,
`karte2.mensch.menge.bevoelkerung#2`), den Gang über den Markt (`karte2.mensch.menge.bild#2`) und die Rückkehr an einen Punkt, den
einer hält. Die Arbeit von rollen-des-tages Kopf 3 parkt weiter als EIN Commit auf `claude/modest-gates-4uhcl7` (1ec3efd2) — ob er
mitfährt, entscheidet der Koordinator.

## DIE ZWEI SPROSSEN AM KOPF (Regel 13:10)

Beide Stationen sind GPU-Stationen (die Leiter der Karte im Zweig punkte-maschine, `F.leiter`: Gerät radeon|gtx; swiftshader liest
„ROT an der Adapter“) — in
der Cloud nicht gefahren, der Vor-Richter fährt sie. Ihr Rumpf läuft wörtlich headless als Probe der Kreatur-Linse:

- `karte2.mensch.menge.bevoelkerung#2` — Station nicht gefahren (GPU). Headless am Kopf nach dem HEUTIGEN Wortlaut der Station
  77058b05 (das Soll der Stunde, der Gehende ≤ 2 m am Ziel): **18 von 20 — ROT** („Stichproben-Personen ± 2 m angetroffen 18
  verfehlt ≥ 20“); nicht angetroffen jaeger #114167 auf dem Weg zum Besuch 101,0 m vor dem Ziel, wohnhaus #469977 auf dem Weg zum
  Einkauf 3,2 m — beide gehen laut der Kette ihres Tags noch. Vorher am Bündel 8d0a9ebe nach demselben Wortlaut ebenso 18 von 20,
  dieselben zwei weiter vom Ziel (135,9 m und 22,1 m). Nach dem Kandidaten der Station (`cloud-post/werk-am-ort-station/`,
  Entscheid des Koordinators 25.11.: der Gehende am Punkt seiner Kette): 20 von 20. Die Sprosse liest also grün erst, wenn der Kandidat in punkte-maschine steht — darum nicht im Betreff.
- `karte2.mensch.menge.bild#2` — Station nicht gefahren (GPU). Headless am Kopf, MENGE_BILD wörtlich: im Bild 134, gehend 87,
  Zwillinge 0 (Soll ≥ 100, ≥ 40, ≤ 0); vorher am Bündel 8d0a9ebe 100 / 28 / 0 — ROT an den Gehenden.

## VORHER ↔ NACHHER AM BÜNDEL 8d0a9ebe (headless, Null-Renderer, dieselben Proben, je ein Lauf)

| Probe (gate:kreatur-takt) | vorher 8d0a9ebe | nachher Kopf 2 |
|---|---|---|
| `mengebild` (stadt-voll, Third, 8 Uhr) | 100 im Bild · 28 gehend · 0 Zwillinge — ROT | 134 · 87 · 0 — GRÜN |
| davon stehend im Einkauf im Bild | 38 | 16 (14 am Stand, 2 auf dem Weg) |
| `werkort` Stichprobe (10,013 Uhr), Wortlaut der Station 77058b05 | 18 von 20 — ROT (dieselben zwei: 135,9 m · 22,1 m) | 18 von 20 — ROT |
| `werkort` Stichprobe, Wortlaut des Kandidaten (die Kette) | ROT beim Namen: die Kette trägt keine Ankunft | 20 von 20 |
| `werkort` die KLASSE ± 2 m am Punkt der Kette (im Raum) | — | 87 von 89; p10 −0,80 · Median −0,11 · p90 +0,56 m |
| `werkort` Selbsttest, Täter `werk-netz` | — | ROT beim Namen: 18 von 20, die Klasse 29 von 108 |
| `mengebild` Selbsttest, Täter `einkauf-steht` | — | ROT beim Namen: 101 im Bild, 23 gehend |
| `zielplan` | GRÜN | GRÜN |
| `bewohner` Wiederkehr nach 1 h | 1,695 m, 0 von 1 424 über 2 m | 1,827 m, 0 von 1 424 |
| `bewohner` Stadt | Wege 4–10, 0 stecken, 0 Berührung, 0 Wand | dieselben |
| `begegnung` · `bewohner` Haltung | ROT (geerbt, unten) | ROT, dieselbe Zeile |

## KOPF 3 — WER PLATZ MACHTE, KEHRT ZURÜCK, AUCH WENN EINER DEN PUNKT HÄLT (am Bündel-Kopf 7 a9806b59)

**Täter-Zahl.** Der vereinte Baum Bündel-Kopf 7 a9806b59 + Kopf 2 3fc3fb24 (merge-tree glatt): Probe `bewohner` ROT, Stadt 1
Steckenbleiber — wohnhaus #91693 um 7,68 Uhr 2,1 m vor seinem Punkt 657,3/436,6, in zwei Läufen gleich (kein Rennen). Kopf 7
allein: GRÜN. Die Akte: er ist im Einkauf, am zweiten von fünf Punkten seiner Runde, trat Platz für wohnhaus #134516; wohnhaus
#666903 ruht 0,22 m daneben auf SEINEM Punkt (Einkauf, Runde 1 von 5). Der Punkt liegt in den Runden von sechs Häusern — die Front
der Buden ist der Raum, den die Gäste teilen (`marktStand` mit `gang`). Die Rückkehr las den Stand frei erst, wenn keiner näher als
`tuerFreiM` steht (`_tickBewohner`): wer dort auf seinem eigenen Stand ruht, geht vor dem Ende seiner Zeit nie.

**Der Schnitt** (stamm/siedlung-bewohner.js): sein Stand ist frei, wenn keiner näher als `tuerFreiM` steht — außer wer dort auf
SEINEM Stand ruht (da, ohne Weg, ohne Tempo, sein Ziel binnen `tuerFreiM` am selben Punkt). Der Weg zurück endet neben ihm wie jede
Ankunft an einem besetzten Ende (`_bewohnerAusweichen` „DAS BESETZTE ENDE“, Bündel 2789a879). EIN Maß: `_bewohnerNaechster(S, b,
x, z, ohne)` trägt das Prädikat, kein zweiter Gang durch das Raster.

**Der verworfene Wurf, gemessen:** der Punkt der Runde mit eigenem Raum (`tuerFreiM` gegen jeden Stand und jeden Punkt): die Linse
las am alten Gesetz 145 Punkte im Raum eines anderen, mit eigenem Raum trägt die Front die Runden nicht — `rundeKurz` 0 → 439
Kauf-Buden, im Bild gehend 87 → 29 (mengebild ROT). Die Front bleibt geteilt.

**Die Linse** (Probe `bewohner`, scripts/lib/kreatur-mensch.cjs): der Steckenbleiber mit Akte nannte ihn im Tag; der Täter-Gang der
Stadt (3 h ab 5 Uhr) trifft die Lage nicht, darum stellt die Probe sie nach dem Tag: DIE RÜCKKEHR AN EINEN GEHALTENEN PUNKT — je zwei
Ruhende (bis 4 Paare), a ruht auf seinem Stand 0,22 m neben dem von b, b steht 2 m davor, beiseite getreten für einen, der fort ist;
nach 5 Spielminuten wartet keiner beiseite. Täter `bewohner-platz-wartet` (das Gesetz vor Kopf 3: `_bewohnerNaechster` ohne `ohne`):
ROT beim Namen, „2 von 4 warten beiseite (gasthaus/gasthaus #846868 2 m vor seinem Stand …)“; im Grund 0 von 3. Selbsttest
GRÜN: 23 Täter, jeder beim Namen (700 s).

| Probe (gate:kreatur-takt, headless) | Kopf 7 a9806b59 allein | Kopf 7 + Kopf 2 | Kopf 3 |
|---|---|---|---|
| `bewohner` Stadt Steckenbleiber | 0 | 1 — ROT (wohnhaus #91693, 7,68 Uhr, 2,1 m) | 0 — GRÜN |
| `bewohner` Wiederkehr nach 1 h | 1,695 m, 0 von 1 424 | 1,827 m, 0 von 1 424 | 1,827 m, 0 von 1 424 |
| `bewohner` Haltung des Stands im Satz | 0° an 181 | — | 0° an 181 |
| `bewohner` Rückkehr an einen gehaltenen Punkt (die Szene) | — | Täter: 2 von 4 warten | 0 von 3 warten — GRÜN |
| `mengebild` (stadt-voll, 8 Uhr) | — | 138 · 97 · 0 | 133 · 94 · 0, `rundeKurz` 0 — GRÜN |
| `werkort` Stichprobe · Klasse ± 2 m | — | 20 von 20 · 84 von 86 | 20 von 20 · 85 von 87 — GRÜN |

## KOPF 4 — AUF main 4a188bf2 (w28-jaeger-stand)

**Die Naht.** `git cherry-pick` von a7569cd3 auf 4a188bf2: EIN Konflikt, `frei` in `_bewohnerListe` (stamm/siedlung-bewohner.js).
jaeger-stand gab ihm als fünftes Wort `bauten` (der Posten im Freien fragt die Bauten), Kopf 3 `raumR` (der Punkt der Runde hält
zwei Kapseln statt `BW.raumM`). Jetzt beide: `frei(x, z, amRand, tuer, bauten = false, raumR = BW.raumM)`; der Posten ruft
`frei(x, z, true, null, true)`, die Runde `frei(x, z, amRand, null, false, raumR)`.

**Gemessen am Kopf 4 (headless, je ein Lauf):** `bewohner` GRÜN — Stadt 0 stecken, Wege 4–10, Wiederkehr 1,827 m, 0 von 1 424,
Haltung 0° an 181, Rückkehr an einen gehaltenen Punkt 0 von 3; `mengebild` GRÜN 133 · 94 · 0; `werkort` GRÜN, Stichprobe 20 von
20, die Klasse 85 von 87 ± 2 m (p10 −0,80 · Median −0,13 · p90 +0,59 m); `zielplan` · `begegnung` GRÜN. Am Wortlaut der Station
77058b05 weiter 18 von 20 (jaeger #114167 101,0 m, wohnhaus #469977 3,2 m).

**Die GPU-Probe von Kopf 3** (a7569cd3, gtx1050-desktop, probe-post 635aa5bb): pruefbuehne-licht GRÜN 99 s, weltbild-frost:echt
GRÜN 320 s (am Kopf 2 an der GTX 1060 ROT, geerbt von 8d0a9ebe; der Heiler steht im main), studio-begehen GRÜN 480 s,
webgl-probe GRÜN 108 s — `bild:stadt-voll@0.33` ROT 598 s: „umstellen --ort stadt-voll: DIE WELT STEHT NICHT nach 1831 Takten:
Ruhe 0, zuletzt brach sie: Bau-Regung“. Am Kopf 2 an der GTX 1060 GRÜN 171 s, derselbe Ruf — ROT an Gerät A, GRÜN an B: Kopf 4
fährt das Tor noch einmal (Regel: erst Rennen-Verdacht). Die Wurzel am Stapel, headless an stadt-voll, die Welt im vollen
Spiel-Takt (`_gameLoopTick`, 0,1 s je Takt = `TAKT_DECKEL_S`), 1 800 Takte, die Bau-Regung (`_bauRegt`) beim Rufer gezählt:

| um | main 4a188bf2 | Kopf 4 |
|---|---|---|
| 12 Uhr (das `umstellen` steht vor dem `@uhr`) | 1 349 Takte mit Bau-Regung · längste Ruhe 69 | 1 323 · 69 |
| davon `_foundryRewarmColdTrees` (studio-gestalt.js:963, die Gestalt dockte an) | 1 341 | 1 315 |
| davon `_standMeldet` (dienst.js:2223, ein Bau-Takt hat gewirkt) | 1 330 | 1 305 |
| 8 Uhr | 56 · längste Ruhe 95 | 43 · 157 |

Die Bau-Regung kommt headless aus Baum und Bau (kein Rufer aus den Bewohnern) und ist am main dieselbe; headless steht die Welt an beiden (Ruhe
≥ 30 Takte). Der Null-Renderer dockt ohne Bake (`gebacken || !echt`) — wie lange die Bäume an der GTX 1050 andocken, sieht nur der
echte Renderer (Lehre 16).

## KOPF 1 — DIE KETTE MISST DEN WEG, DEN DER LEIB GEHT (bevoelkerung#2; Zahlen am main a954d698)

**Täter-Zahl.** Die Station am main a954d698: 19 von 20 — `wohnhaus/feld #469977`, Einkäufer, hat noch 24,5 m vor sich, die Kette
seines Tags lässt ihm 3,6 m. Die Kette maß die Gehzeit über das Netz des Plans, Ort-Anker zu Ort-Anker (`_bewohnerListe` „DIE WEGE
SEINES TAGS“, `wegeM` aus koerper `tagesWege`; `_bewohnerKette` `geh`), der Leib ging seinen Pfad (`_bewohnerWeg`): ein ZWILLING des Wegs.

**Der Schnitt.** EIN Weg, den der Leib geht und den die Kette misst: `_bewohnerPfad` (aus `_bewohnerWeg` gelöst), gemerkt je Mensch
und Paar der Stände in `_bewohnerPfadM` { m, pts, stand }; zwei Leser — die Kette (`geh(von, nach, P0, P1)`) und der Gang (geht die
gemerkten Punkte, solange sie am Stand der Wache gelten). `wegeM`/`ortI` fallen. DAS WERK DER PFADE (`_bewohnerPfadeWerk`, Lehre 14)
misst jede Kette im Takt-Planer und nach einem Wechsel der Wache nur, was eine Wand trägt (`_bewohnerBeinZu`). Kern additiv: koerper
`tagesKette` trägt je Abschnitt die Ankunft `an`.

**Gemessen am main a954d698:** Stichprobe 20 von 20 (vorher 19); die Klasse 68 von 69 am Punkt ihrer Kette (vorher 8 von 70). Täter
`werk-netz` ROT beim Namen (21 von 85 am Punkt).

## KOPF 2 — ZWEI SCHNITTE AM GANG, GEFUNDEN AN DER KLASSE IM BÜNDEL

**Die Uhr der Ankunft** (`_bewohnerAnkunft`, stamm/siedlung-bewohner.js). Wer mit der Uhr springt, steht, wo sein Tag ihn sieht —
bis hier lief er danach OHNE Uhr (`zielUhr = NaN`) bis zur nächsten Wende: ein Umweg um einen Stehenden (`_bewohnerUm`) blieb
Rückstand, das Aufholen (`_bewohnerGehen`, ≤ Tempo × 2) griff nie. Spur an stadt-voll 10 Uhr: jaeger #114167 auf dem Weg zum Besuch,
1,47 m Umweg nach 1,7 s, danach 2,0 m hinter seiner Kette. Jetzt `[zielUhr, gegangen] = [b.weg ? b.uhr : NaN, 0]`: sein Fortschritt
zählt von der Ankunft an gegen seine Uhr. Gemessen: der Median der Klasse (Rest − Rest) +0,6 → −0,13 m.

**Der Hof trägt EINE Richtung zur Zeit** (`_bewohnerImHof(S, b, hinein)`). Die Tür ließ niemanden hinaus, solange irgendwer auf der
Hof-Achse ging — auch wer vor ihm in dieselbe Richtung zum Tor ging. Gefunden am Zwischenstand (Bündel + Kopf 1 + Gang): Probe
`bewohner` Wiederkehr ROT beim Namen, 1 von 1 424 über 2 m — werkstatt #28191 um 12,7 Uhr 3,411 m (Rückstand 4,96 m, wartete 5 s
drinnen, bis sein Hausgenosse das Tor hinter sich hatte). Jetzt sperrt die Achse nur, wer ENTGEGENkommt; den Abstand hinter dem
Vorderen hält die Tür (`tuerFreiM`). Nachher 1,827 m, 0 von 1 424. Die Linse dieser Klasse ist das bestehende Kriterium Wiederkehr
(Täter `bewohner-wiederkehr`); einen eigenen Täter für die Achse trägt dieser Kopf nicht: der Selbsttest der Probe bewohner bleibt
im Grund ROT an der geerbten Haltung (unten) und fährt die ganze Stadt je Täter neu.

**Die Linse** (`werkort` in scripts/lib/kreatur-mensch.cjs, und gleich im Stations-Kandidaten): angetroffen heißt jetzt, der Leib
steht im RAUM ≤ 2 m am Punkt der Kette — `plan` Meter vor dem Ende seines Wegs, über den Leib, dahinter die gegangenen Punkte; die
Punkte um einen Stehenden (`_um`) zählen nicht. Bis hier zählte Rest − Rest: der Bogen um zwei Patrizier an ihrem Werk zählte jaeger
#114167 1,8 m Umweg als Rückstand (2,9 m, verfehlt), im Raum stand er an seinem Punkt. Endet der letzte Abschnitt — der Weg zurück
zum Anker — nach dem Anker, liegt die Stunde danach noch in der Kette (+ 24): der Nachtwächter #468983 auf dem Heimweg nach
Mitternacht las „am Anker ohne Weg“, 61 m daneben. Die Weitesten nennt die Linse mit ihrem Bein (Länge der Kette gegen den Weg des
Tags, Anfang) und den Sekunden, die sie mit Weg standen.

## DER GANG ÜBER DEN MARKT — `karte2.mensch.menge.bild#2`

**Täter-Zahl.** `koerper-core.js` `tagesKette`: der Einkäufer stand seine ganze Zeit am Markt (`morgenH`, 0,5 h je Erwachsenem,
`TAGES_GESETZ.einkauf`) an EINEM Stand — dem, den `_bewohnerListe` (`marktStand`) ihm vor einer Bude gibt. Am Bündel 8d0a9ebe: im
Bild 100, gehend 28; 38 der Stehenden im Bild sind im Einkauf.

**Der Schnitt** (EIN Gesetz im Kern, der Wirt stellt nur den Ort):
- Kern `TAGES_GESETZ.einkauf` trägt zwei Bänder der Profis: die Geschäfte je Einkaufsweg (Ribbeck & Notzon 2017, BTU Cottbus,
  Weißwasser, Abb. 12: 1 Geschäft 22,8 % · 2: 28,8 % · 3–5: 34,5 % · 6+: 1,8 %; `staende`, je Samen gezogen von
  `tagesEinkaufStaende`, das Band auf seine Summe 87,9 % normiert) und den Anteil des Kaufs an der Zeit im Laden (Sorensen,
  PathTracker, Knowledge@Wharton 2006: 20–30 %; `kaufAnteil` 0,25).
- `tagesKette`: von seinem Stand am Platz geht der Einkäufer die Punkte der Runde, jeden HÖCHSTENS EINMAL — die Kauf-Buden
  (`tagesEinkaufStaende` − 1), solange die Gänge in seiner Zeit am Markt bleiben, jede weitere, solange die Gänge den Anteil des
  Gehens (1 − `kaufAnteil`) nicht übersteigen; je Besuch ein Abschnitt der Kette, die Gehzeit misst `geh` (der Pfad des Leibs aus
  Kopf 1); der Markt endet nie früher (`einkaufAn + morgenH`).
- Wirt `_bewohnerListe`: je Haus die Runde (`orte.einkaufRunde`), je Bude ein Punkt in der Folge des Samens (`marktStand` mit
  `gang`): er nimmt keinen Raum, hält aber zwei Kapseln zu jedem vergebenen Stand und `gangM` zu den Ständen seines Hauses.
  `_einkaufAnlegen` zählt fehlende Kauf-Buden beim Namen (`S.rundeKurz`).
- Linse: Probe `mengebild` (≥ 100 im Bild, ≥ 40 gehend, 0 Zwillinge), Täter `einkauf-steht` (die Runde fällt in `_bewohnerKette`):
  ROT beim Namen.

**Gemessen am Bündel:** 134 im Bild, 87 gehend, 0 Zwillinge (vorher 100 / 28 / 0); 205 Einkäufer, 1 025 Punkte der Runde, keinem
fehlt eine Kauf-Bude (`rundeKurz` 0). Zwei Würfe fielen am Messer (am main c814741e): die Buden im Kreis, bis die Zeit um ist (zwei
Buden 2–3 m auseinander trugen bis zu 58 Besuche — Stadt-Wege bis 62, Soll 4–10) und der Punkt ohne Abstand (0,28 m neben einem
Stand: 1 Steckenbleiber); mit „jeder Punkt höchstens einmal“ und zwei Kapseln GRÜN.

## KOSTEN (headless, Probe `mengebild`, je ein Lauf, Bündel 8d0a9ebe ↔ Kopf 2)

| Maß | vorher | nachher |
|---|---|---|
| das Werk der Stadt, bis sie lebt (`_bewohnerWerkTakt`, ohne Frist) | 27 932 ms | 34 454 ms |
| davon das Werk der Pfade (`_bewohnerPfadeWerk`) | — | 7 971 ms (5 918 Pfade, 273 915 Punkte) |
| die Ankunft nach dem Sprung auf 10 Uhr (`werkort`, 169 Takte) | 8 089 ms | 6 878 ms |

## GEERBT AN DER BASIS (main 99649186 = Bündel-Kopf 7 a9806b59 + Versions-Stufe; main 4a188bf2 = + w28-jaeger-stand)

Keine Probe der Kreatur-Linse: `begegnung` GRÜN (vorher an 8d0a9ebe kind #16036), `bewohner` Haltung des Stands 0° an 181 (vorher
3,616°; mittag-heiler 3 im Bündel). Die Heilung von `gate:weltbild-frost:echt` (af816566) steht in der Basis — an Kopf 3 GRÜN (GTX 1050).

## OFFEN (mit Grund und Messnamen)

- **Die Stadt lebt später:** das Werk der Pfade misst jede Kette vor ihrem Leben, + 6,5 s Werk (+ 23 %) unter der EINEN Frist der
  Bau-Arbeit. Täter der Kosten ist der Pfadsucher (`_bewohnerStrecke`, darin `_verkehrFahrbahnM`, `_bewohnerWand`,
  `_bewohnerAnschluss`; Zahlen im Kopf 1). Die Geburt an die eigene Kette zu binden verlangt Plan-Lauf, Geburt und Ankunft neu.
- **bevoelkerung#2 liest am heutigen Wortlaut der Station ROT** (18 von 20, oben; am Kopf 3 ebenso, dieselben zwei, 101,0 m und 3,2 m): der Richter wartet auf den Stations-Kandidaten;
  das Spiel lässt die beiden laut ihrem Tag gehen, ein Schnitt im Spiel, der sie um 10 Uhr ans Ziel stellt, bräche die Kette.
- **Die Klasse außerhalb ± 2 m** (2 von 89 am Kopf 2, 2 von 87 am Kopf 3 — beide VORAUS): jaeger #640480 −21,2 m — sein Weg wurde mitten im Bein neu geplant (126 m
  von einem Punkt 411 m hinter dem Anfang des Beins, die Kette rechnet 646 m: die Abkürzung kennt die Kette nicht); nachtwaechter
  #468983 −18,7 m (Abschnitt 23,219 → 24,425, die Stunde 24,021, sein Bein ist nicht gemerkt). Dazu: wer für einen Wagen beiseite
  tritt, wartet (`_bewohnerPlatz`), die Kette rechnet ohne Warten (6 von 89 traten beiseite, alle am Punkt).
- **Die Welt steht an der GTX 1050 an stadt-voll nicht** (`bild:stadt-voll@0.33` ROT an Kopf 3, Bau-Regung nach 1 831 Takten;
  GRÜN an Kopf 2 an der GTX 1060): headless ist die Bau-Regung am main dieselbe (Tabelle KOPF 4), die Quelle das Andocken der
  Bäume (`_foundryRewarmColdTrees`) und die Bau-Takte (`_standMeldet`). Messname: Probe `bild:stadt-voll@0.33` am Kopf 4 an der GTX
  1050; liest sie wieder ROT, steht der Verdacht am Andocken der Bäume am echten Renderer, nicht am Gang — er gehört dem Stoff
  der Gestalt (studio-gestalt), nicht diesem Zweig.
- Die Kosten der Ankunft am Spiel-Gerät und das Bild am Markt: richtet die Probe (`bild:stadt-voll`) und der Vor-Richter.

## KOPF

EIN glatter Commit auf `origin/main` 4a188bf2 (Betreff „Vorprüfung werk-am-ort 4 …“): der Baum von Kopf 3 a7569cd3, gehoben auf
main mit der Naht in `frei` (Abschnitt KOPF 4), gemessen headless am Baum auf 4a188bf2. Ruf `gate:pruefbuehne-licht,
gate:weltbild-frost:echt, gate:studio-begehen, bild:stadt-voll@0.33` — das Bild am Markt um 8 Uhr, wo Runde und Rückkehr zu sehen
sind, und dasselbe Tor noch einmal an der GTX 1050 (Abschnitt KOPF 4); die drei Wände sind Pflicht für `stamm/siedlung-*` (Bau +
Haus, der Probe-Tag des Zugs), je Tor ≤ 480 s Cloud-Zeit (`spec/ci/ci-zeiten.json`).
Station-Kandidat `cloud-post/werk-am-ort-station/` (Diff + BEGRUENDUNG.txt), Satz `cloud-post/werk-am-ort-satz.txt`.
ZWISCHENSTAND: Karte 2 gebucht 130 von 1 718.

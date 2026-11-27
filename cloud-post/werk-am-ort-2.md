# werk-am-ort-2 — Stand-Blatt (ZWISCHENSTAND)

Zweig `werk-am-ort-2` = Baum von Kopf 5 (`werk-am-ort-kopf5` cecf1d71) vereint mit `origin/main` eef726c (V18.546.450). EIN Konflikt
in `stamm/siedlung-bewohner.js`: main gab `_bewohnerStrecke` das Wort `wer` (die Zeile ohne Weg nennt den Bewohner), Kopf 5 zog den
Pfad aus `_bewohnerWeg` nach `_bewohnerPfad` — jetzt der Pfad von Kopf 5, der Ruf trägt `wer` (`_bewohnerPfad` → `b`, die andere
Seite der Fahrbahn → `wer`).

## TÄTER-ZAHL (headless, Null-Renderer, Kreatur-Linse am vereinten Baum)

**bild#2 und bevoelkerung#2 lasen headless GRÜN und an der Radeon ROT — der Unterschied ist das WETTER.**
- Headless am Messort stadt-voll (spielZeit 68–72 s nach dem Boot, Wetter `sunny`, Regen an jeder Tür 0): `mengebild` im Bild 133 ·
  gehend 94 · Zwillinge 0 — drinnen 340, außer Bild 657, verdeckt 213, ungezeichnet 13 (Auge [836.7,58,453.4], 8,053 Uhr);
  `werkort` 20 von 20, die Klasse 85 von 87.
- Radeon am cecf1d71, dasselbe Auge, 8,05 Uhr: im Bild 87 — drinnen **533**, außer Bild 548, verdeckt 174, ungezeichnet 14.
- Das Soll der Stunde (8,05 Uhr) nach drinnen, je Regen an der Tür (`KC.tagesZiel(_bewohnerKette(b, nass), h).drinnen`, alle 1 356):
  nass 0 → **353** · 0,2 → **517** · 0,25 → 691 · 0,3 → 867 · 0,4 → 1 169 · 0,6 → **1 327**. Das Gerät zählte 533: Niesel ≈ 0,2
  (am Gerät läuft die Welt-Uhr über die Sitzung, das Wetter der Welt ist eine Funktion von ihr).
- Wer bei Niesel 0,2 nach drinnen kippt: arbeit 93 · spiel 31 · **einkauf 19** · abend 10 · besuch 5 · jagd 3 · hilft 3. Bei Regen 0,6:
  arbeit 532 · spiel 228 · **einkauf 133 (jeder Einkäufer)** · abend 40 · besuch 15.
- Täter: `koerper-core.js` `tagesPlan` `aus` (TAGES_GESETZ.regen): über der Schwelle des Menschen wird JEDER Akt draußen drinnen —
  auch der Weg zum Markt. Das Band der Profis (Cools, Moons, Creemers & Wets 2010, TRR 2157, Tab. 3/4, „Rain“, Trip Cancellation,
  Erwartung über die Klassen 1–25 % · 26–50 % · > 50 %): Einkauf 16,2 %, Freizeit 14,4 %, Pendeln 1,5 % sagen den Weg ab — nie 100 %.

## Schreck und Seuche (headless, Null-Renderer, Kreatur-Linse am Baum vor dem Vorprüf-Kopf, 27.11.)

- kollektiv#2: Front 51,72 → **7,3 m/s** (7,14 im Selbsttest-Lauf nach den Stadt-Proben) (Soll 3–8), Flucht 0,777 → **0,992** (122 Zeugen, Soll ≥ 0,9). Der Schreck wandert vom
  Schrei (Pearsons, Bennett & Fidell 1977: 89 dBA in 1 m; der Platz 50 dB, WHO 1999, ANGENOMMEN) und von Fliehenden binnen 7,6 m
  (Hall 1966), je Leib nach 0,42 ± 0,373 s (Rio, Rhea & Warren 2014). Täter der langen Front: der Erschrockene wartete auf einen freien
  Weg hinter dem Deckel `wegeJeTakt` 2, und wem ein Haus im Rücken stand, der ging seinen Weg (0,5–3,5 s bis 0,5 m fort). Jetzt läuft
  er nach seiner Reaktion gerade fort, sonst ±0,5/±1 rad daneben (wie das Tier). Das Auge am Markt: wer den Schrei hört, bleibt stehen
  und schaut; die Flucht läuft als Welle von der Tat weg (Ring 0 m nach 0,76 s, 25 m nach 4,2 s); nur die Wache naht dem Täter.
- seuche#2: **799 von 1 356** krank, S-I-R ja, R0 der frühen Fälle **2,40** (Band 2–3, Mills, Robins & Lipsitch 2004), Spitze am Tag 11
  von 36; 221 Kranke am Tag der Spitze, 221 im Satz, 221 daheim oder am Posten (kein Kranker an der Arbeit drinnen: vorher 4 von 121).
  Die Kontakte kommen je Viertelstunde aus der Tageskette jedes Bewohners (gezeichnet oder nicht), der Kranke aus der Kette seines
  kranken Tags. Kandidat der Station: `cloud-post/werk-am-ort-2-station/` (Diff + BEGRUENDUNG.txt, nur der Leser).
- Der Zweikampf der Wache geht mit seiner Siedlung (`_hiebe` im Abschied): bis hier warf er nach dem Wechsel der Siedlung einen
  loop-wurf in `_bewohnerStrecke`.

## Linsen und Wände (lokal, alles beim Namen)

- Kreatur-Linse Selbsttest (seuche, werkort, mengebild, schreck, begegnung): GRÜN — kontakt-leer → ROT (20 Fälle) · seuche-ungelesen
  → ROT (im Satz 3) · werk-netz → ROT · regen-sofort → ROT (946 von 946 kehren um) · einkauf-steht → ROT · regen-jeder → ROT ·
  kunde-takt → ROT (Front 27,14) · die sechs Täter der Begegnung → ROT. Ohne Selbsttest grün: bewohner · zielplan.
- Der Riegel des Regens (bevoelkerung#2): 0 von 942 Heimgeschickten kehren mitten im Abschnitt um (die Probe zählt nun auch die Wende
  der Kette des Regens als Grenze: 4 Bewohner hatten sie in den 2 s, bei h 15,64 → 15,645).
- `npm run check:statik` GRÜN · `format:check` GRÜN · `lint` 0 Fehler · `stamm-umzug --nach-karte` · `diag-atlas --check` OK.
- Probe-Ruf: `gate:studio-begehen` lokal GRÜN (probeUrteil). `gate:pruefbuehne-licht` lokal ROT — am main 52937c92 dieselbe Zeile
  (S0 Himmel, swiftshader), die Radeon richtet. `gate:weltbild-frost:echt` lokal ohne Urteil (swiftshader unter
  xvfb, 900 s ohne Zeile, Exit 124) — die Radeon richtet. `zug.sh probe-tag` liegt in keinem Zweig: der Ruf ist von Hand gegen
  `spec/ci/ci-zeiten.json` gehalten (pruefbuehne-licht 43 s · weltbild-frost:echt 135 s · studio-begehen 185 s · bild:stadt-voll 447 s).

## Die Kreatur-Linse in drei Teilen (Koordinator 16:54 und 17:44, headless, Selbsttest)

- Täter 1 — die Reihe: die Dorf-Proben (bewohner, begegnung) liefen vor den Proben der Städte, ihr Start-Dorf blieb in der Welt
  („seuche lief im Start-Dorf …"). Jetzt `werkort, mengebild, schreck, seuche, zielplan, bewohner, begegnung`.
- Täter 2 — die Stadt des Messorts: stadt (`dorf 7 120`) und stadt-voll (`dorf 7 300`) tragen Same 7, 174 m auseinander; der
  Kreis von 200 m in `stadtAm` nahm die Stadt des anderen (mengebild maß die kleine: 144 Bewohner, 24 im Bild). Jetzt die Stadt
  näher am eigenen Anker als an jedem fremden; derselbe Anker (ort-zeichen = stadt-voll) ist dieselbe Stadt.
- Täter 3 — zwei Städte in einer Welt: die kleine stünde im Grundriss der vollen (ihr Wege-Netz zerfiel in 30 Teile, die Seite
  hing 900 s nativ). Jetzt fährt der Lauf in einer frischen Welt, wenn der Messort wechselt (`STADT_ORT`), und `stadtAm` ist ROT
  beim Namen vor einer zweiten Stadt.
- Täter 4 — seuche-ungelesen: ohne den Leser bleiben 3 von 221 im Satz krank (der gewöhnliche kranke Tag,
  `LEBENSLAUF.krank.anteil`); der Täter heißt jetzt „krank im Satz unter den Kranken", nie „0".
- Täter 5 — tagesbudget (Teil 2): am main 948f68ee allein ROT (je Art 12,25,2,0 — kein Wolf trinkt), grün nur hinter herde oder
  lebensraum. Der Durst liest den Fluss-Rand in der Hydro-Kachel am Tier; fehlt sie, antwortet der Kern „kein Fluss", und der Tag
  der Probe rechnet ohne Pause (keine Kachel kommt in ihm an). Die Wölfe ziehen 1,3–5,6 km vom Ufer. Jetzt steht jede Kachel über
  dem Streifgebiet vor dem ersten Takt: allein wie hinter tiersatz Trünke 4,8,2,3,9,10,4,2,0,2,9,3, GRÜN, Selbsttest 4 von 4.
- OFFEN in der Welt (nicht im Schnitt): `_kreaturDurstig` merkt die Pause der vergeblichen Suche auch dort, wo nur die Kachel fehlt
  (jenseits der Reichweite der Kachel-Leser um den Spieler) — dieselbe Klasse wie `_bestandBereit`, Bahn der Tiere.
- Lauf 5 am Baum main 9a75d61c + werk-am-ort-2 (= Kopf 2 90f3f04d): Teil 1/3 GRÜN (64 Täter beim Namen, 13 Proben im Grund grün,
  18:53 UTC) · Teil 2/3 GRÜN (56 Täter, 14 Proben, darin tagesbudget und mengebild, 19:17 UTC) · Teil 3/3 GRÜN (46 Täter, 13 Proben, 19:35
  UTC; werkort 20 von 20, schreck Front 7,29 m/s, Flucht 0,992). Alle drei Teile GRÜN mit Selbsttest; `gate:welt-boot` GRÜN
  (Träger keiner) nach der Zeile von Kopf 3 (`sleep(50)` statt eigenem Schlafen). Der Zweig trägt die Skripte von Kopf 3 byte-gleich.
- Sekunden je Probe aus Lauf 5 (Koordinator 20:50 (1); mein Container, headless, `--selftest` samt Tätern und dem Wechsel des
  Messorts, der Wechsel zählt bei der ersten Probe danach; in Klammern `DAUER_S`):
  - Teil 1 = 1 416 s: bewohner 878 (660) · seuche 310 (60) · erbe 78 (26) · jagd 69 (207) · herde 33 (44) · schwarm 12 (4) ·
    querhang 12 (13) · tiersatz 8 (7) · wachsen 1 · witterung 1 · sattel 0 · nexus 0 · todlage 0.
  - Teil 2 = 1 458 s: kaskade 519 (400) · mengebild 380 (288) · zielplan 330 (80) · gehege 63 (70) · tagesbudget 56 (15) ·
    gau 43 (35) · furcht 29 (31) · mahl 14 (89) · rudel 8 (7) · zerfall 2 · reload 1 · ferngang 1 · peer 0 · temperament 0.
  - Teil 3 = 1 092 s: werkort 424 (182) · schreck 297 (400) · muster 104 (62) · jagdkreis 98 (281) · folgen 71 (59) ·
    begegnung 54 (10) · lebensraum 18 (21) · gier 6 · abstand 2 · huepfer 3 · gestalt 1 · geister 0 · zufall 0.
  - Summe 3 966 s gegen geplant 3 076: die Stadt-Proben tragen den Unterschied (seuche +250, zielplan +250, werkort +242,
    bewohner +218, kaskade +119, mengebild +92). Der Schnitt folgt: `DAUER_S` = diese Zahlen, die Täter der Stadt-Proben billiger,
    je Teil ≤ 1 150 s.
- Kopf 4 (Koordinator 20:59: VIER Teile): am Baum main b3740dd5 + werk-am-ort-2, `DAUER_S` gemessen, `--selftest --teil=k/4` mit
  Stoppuhr — Teil 1/4 GRÜN 974 s (44 Täter, 8 Proben; bewohner 861) · Teil 2/4 GRÜN 1 049 s (42 Täter, 9 Proben; kaskade 528,
  schreck 342 samt Gründung der vollen Stadt) · Teil 3/4 GRÜN 954 s (38 Täter, 12 Proben; werkort 416, seuche 278) · Teil 4/4 GRÜN
  981 s (42 Täter, 11 Proben; mengebild 371, zielplan 321). Summe 3 958 s, 166 Täter beim Namen, 40 Proben im Grund grün.
  Die Waage: `spec/ci/ci-zeiten.json` trägt die vier Zahlen (`geschaetzt`, bis ein gelandeter Lauf sie wiegt), die Gruppen verteilt
  `scripts/ci-zeiten.cjs` (`verteile` über der Tafel, ohne neue Messung): die Teile in den Gruppen 11 · 8 · 12 · 10, jede voll-Gruppe
  20,4 min im Plan, Deckel 21,1, Frist 29 unberührt; `gate:ci-deckung` GRÜN · `check:statik` GRÜN · `gate:welt-boot` GRÜN ·
  `gate:fachwerk-contract` · format · lint GRÜN; `merge-tree` gegen main b3740dd5 und gegen sprache-dialekt 0413162b sauber.
- OFFEN (Folge-Arbeit, nicht Bedingung der Landung): die Täter der Stadt-Proben billiger (seuche 3 Läufe à ≈ 90 s um einen
  Ausbruch von 0,2 s); bewohner allein 861 s gegen `DAUER_S` 660 am main — ob meine Schnitte in `stamm/siedlung-bewohner.js` ihn
  langsamer machen, ist nicht gemessen (derselbe Lauf am Baum von main steht aus).
  Je Lauf gemessen: seuche Grund 124 s, je Täter 88 s (die Rechnung des Ausbruchs ≈ 0,2 s — der Rest ist die Stadt um den Lauf);
  zielplan je Täter 29–35 s (sein Tag an fünf Stunden); der Wechsel in die frische Welt 12 s.
- Folge, Stand 22:2x (WIP am Zweig, nicht im Kopf 4): `bleibt` — die Stadt kehrt zwischen Grund und Täter derselben Stadt-Probe
  nicht heim (die Heimkehr ließ die Liste fallen, jeder Täter wartete 82–113 s auf jeden Leib): seuche 304 → 128 s, schreck
  342 → 213 s. Die stehende Stadt hob einen Welt-Bruch: `_bewohnerGehen` teilte durch einen Takt ohne Zeit (0 ÷ 0 → `tempoTag`
  NaN → Leib in NaN → Tritt „NaN,NaN" → „Trampelpfad: NaN ist kein Varint"; Täter benannt: Rathaus #619833 in schreck). Schnitt
  an der Wurzel: ein Takt ohne Zeit teilt nie durch sie (`mehr`, `vx`/`vz` in `_bewohnerGehen`; der Takt selbst bleibt — er
  schließt den Weg an seinem Ende, ein früher Ausstieg ließ ihn offen). Darunter stand ein zweiter Bruch, den der NaN verdeckte:
  der Erschrockene (`fort`), dessen Ausweichen das besetzte Ende erreichte, las im Schritt den Punkt hinter dem Ende und warf vor
  dem Schluss des Wegs — jeder Takt neu (wohnhaus #440491, 7 von 7, 12 Loop-Würfe). Schnitt im Schritt: ohne Punkt kein Erreichen,
  der Schluss schließt. schreck+seuche Selbst-Test GRÜN, EXIT 0, 0 Würfe: seuche 88 s (DAUER 310), schreck 238 s (DAUER 297).
  werkort · mengebild · zielplan mit `bleibt` Selbst-Test GRÜN, EXIT 0, 0 Würfe (12 Täter): 424 → 228, 380 → 155, 330 → 105 s.
  `DAUER_S` neu: Summe 3 958 → 3 006 s (−24 %); die vier Teile im Plan 878 (bewohner allein) · 710 · 709 · 709 (drei Teile
  trügen 1 002 je Teil — `check.yml` bleibt bis zum Heil-Zug unberührt, also vier). Die vier Teile mit Stoppuhr (--selftest,
  Container): 892 · 741 · 764 · 731 s, jeder GRÜN, EXIT 0, 0 Würfe, 166 Täter beim Namen (Kopf 4: 974 · 1 049 · 954 · 981; Summe
  3 958 → 3 128 s, −21 %). Teil 3 lief zum Teil neben `check:statik` von Kopf 5 — die Zahl steht so, sie liegt weit unter 1 150.
  bewohner (878 s, ein Lauf) ist jetzt der Engpass. Die `ci-zeiten.json`-Zeilen der Teile bleiben die von Kopf 4 (geschaetzt,
  größer), bis die CI misst. main b56b51f0 in den Zweig gemischt (die zwei Dateien des Schreibers wie Kopf 5).

## Heap an der GTX 1060 (Koordinator 18:04)

- 538,7 MB gehalten (Spitze 643,8) an seuche#2, 505,9 MB an kollektiv#2: die Station steht in der vollen Stadt (stadt-voll,
  300 Häuser, 1 356 Bewohner mit Leib, Pose am Markt); der Ausbruch selbst rechnet 155 ms und hält nur seine Tafeln je Bewohner
  (Tag, Symptom, Kurve: ≈ 1 356 × 3 Zahlen). In der Wolke nicht gemessen (kein Gerät) — die Zahl der Stadt ohne Ausbruch ist offen.

## OFFEN (mit Zahl)

- bild#2 und bevoelkerung#2: Station nicht gefahren: GPU. Vorurteil am Gerät: bild ≈ 100 (Radeon vorher 87; bei Niesel 0,2 sagt der
  Einkauf 16,2 % ab statt 100 %, Cools et al. 2010), bevoelkerung 20 von 20 (vorher 18; der Regen hält bis zur Wende). Headless 127 im
  Bild · 20 von 20.
- Die drei Wände des Stations-Kandidaten (die Liste der Punkte-Maschine am Zweig punkte-maschine) sind in der Wolke nicht gefahren.

## Vorprüf-Kopf 56db0ae1 (auf main 7e73426e) — die GPU-Probe

- Radeon 890M, 27.11. 15:06, GRÜN in allen fünf Toren: pruefbuehne-licht 80 s · weltbild-frost:echt 154 s · studio-begehen 177 s ·
  bild:stadt-voll@0.33 210 s · webgl-probe 82 s. Die zwei Tore, die lokal unter swiftshader kein Urteil trugen, lesen am Gerät grün.
- Das Bild stadt-voll 8 Uhr (selbst angesehen): der Markt voll, rund dreißig Menschen zwischen den Ständen, Gehende mitten im Schritt,
  kein Leib im Boden; die Abnahme nennt bewohner 7,3 % (Soll ≥ 1,0 %).
- Der Kopf fährt im Bündel 2 `buendel-abend` (Koordinator 15:39); kein neuer Vorprüf-Kopf vor der Landung. Offen: bild#2 und
  bevoelkerung#2 am Rumpf der Station (Gerät), der Stations-Kandidat seuche#2 (Vor-Richter GTX 1050/1060).
- Wartezimmer: Post bis 20:59 gelesen; Kopf 4 steht: `werk-am-ort-2-kopf4` f28b9679 (EIN Elter main b3740dd5, Baum = der Zweig
  df008c95, Probe-Ruf wie Kopf 3, `[ci voll]`). Der Zweig trägt main b3740dd5 vereint. Post bis 22:11 gelesen (der Heil-Zug
  `frist-puls`): `check.yml`, `ci-zeiten.json`, `ci-zeiten.cjs` fasse ich bis zu seiner Landung nicht an; der Probe-Ruf ohne
  Leerzeichen nach den Kommas — Kopf 4 f28b9679 trägt sie noch (geschoben vor der Regel, Ruf wie Kopf 3); ich lasse ihn stehen, ein
  Kopf mit demselben Baum und dem Ruf ohne Leerzeichen kostet einen Schub, auf Zuruf.
- Post 23:45 gelesen (Kopf 4: eigene Probe GRÜN, PROBE-TAG OK, Konflikt mit dem Heil-Kopf `w28-frist-puls-1`, Batterie
  abgebrochen — nicht neu angestoßen). Kopf 5 GEPROBT gegen den Heil-Kopf fe05c3bb (Arbeitsbaum, nicht geschoben): Kopf 4
  gemischt, an `check.yml` und `ci-zeiten.json` der Stand des Heil-Kopfs + MEINE Struktur (`--teil=k/4`, Schritt „Teil 4“, die
  vier Stoppuhr-Zeilen 974 · 1 049 · 954 · 981, `gate:kreatur-takt` 3958), der Schreiber `verteile` neu gefahren (93 Schritte, 18
  Gruppen, schwerste 21,0 min, Puls-Frist 16 aus `pulsFristMin`; keine `timeout-minutes`-Zeile von mir), `gate:ci-deckung` GRÜN.
  Kopf 5 folgt auf dem neuen main, sobald die Post an alle ihn nennt: dasselbe Rezept, `check:statik` ganz, Ruf ohne Leerzeichen.
  Die Folge-Arbeit (`bleibt`, die zwei Welt-Brüche, `DAUER_S` neu) fährt NICHT in Kopf 5.
- **Kopf 5 steht: `werk-am-ort-2-kopf5` 2b129915** (EIN Elter main 23b593ac V18.546.459; Ruf ohne Leerzeichen, `[ci voll]`).
  Die 17 Dateien von Kopf 4, jede außer den zwei des Schreibers byte-gleich im Diff; an `check.yml`/`ci-zeiten.json` der Heil-Kopf +
  die vier Teile, Schreiber neu (Teile in 11 · 8 · 12 · 10, schwerste Gruppe 21,0 min, Puls-Frist 16; keine Frist von mir).
  `check:statik` GRÜN 596 s · `gate:ci-deckung` GRÜN 25 s · `gate:welt-boot` GRÜN 83 s · `gate:fachwerk-contract` GRÜN 119 s ·
  format · lint GRÜN. merge-tree gegen main 23b593ac, w28-sprache-dialekt-2b und w28-wurf-mit-luft-3 (z812) sauber. Probe-Ruf
  von Hand gegen die Tafel gehalten (`zug.sh` liegt in keinem Zweig), derselbe Ruf wie Kopf 4.

Karte 2 gebucht 156 von 1 718. Status ZWISCHENSTAND.

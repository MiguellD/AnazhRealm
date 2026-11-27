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
  18:53 UTC) · Teil 2/3 GRÜN (56 Täter, 14 Proben, darin tagesbudget und mengebild, 19:17 UTC) · Teil 3/3 fährt (am Baum davor
  GRÜN, 46 Täter, 13 Proben).

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
- Wartezimmer: Post bis 19:12 gelesen; Kopf 2 setzt der Koordinator (`werk-am-ort-2-kopf2`, main 948f68ee + 2f3f96c8), kein
  eigener Vorprüf-Kopf vor dem Urteil seiner Batterie. Der Zweig trägt main 948f68ee vereint.

Karte 2 gebucht 149 von 1 718. Status ZWISCHENSTAND.

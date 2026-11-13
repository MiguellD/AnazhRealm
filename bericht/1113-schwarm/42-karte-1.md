# 42 Meisterkarte, Scheibe 2 von 8 — ankunft · ki · oekologie · stoffe

Scheibe: 33 Domänen alphabetisch aus `PM/meisterkarte-quelle/punkte/stand.json` (kopf ec281422, zeit 13.11. 19:48), Index mod 8 = 1:
1 ankunft · 9 ki · 17 oekologie · 25 stoffe. Gebucht **27/40**; offen 13 Punkte in 9 Kriterien: ankunft 1/10 (9 offen), ki 7/10
(K3, K4, K5 je 1/2), oekologie 10/10, stoffe 9/10 (K1 1/2). Regel (kurs-B Z. 6–9): #1 GRÜN an EINEM Gerät, #2 an ALLEN.

## Was der Spieler sieht (mit Bildpfad)
- Kalt-Boot Radeon 1cd1c408, Schuss bei der Kontrolle und nach der Ruhe:
  `PM/…/messung/roh/1cd1c408-radeon/ankunft.K2_1.json.png` und `…json-ruhe.png`. Ich sehe zwei GLEICHE Bilder: brauner nackter
  Erdboden über die ganze untere Hälfte, kein Halm; links und rechts zwei Laubwald-Reihen mit kahlen Stämmen unten; dunkelblauer
  Himmel mit fleckigen Wolken; kein Dorf, kein Weg. Kein Loch, das in der Ruhe gefüllt wäre.
- Erster Blick am Spawn, Ego 0°: `PM/…/roh/1cd1c408-radeon/ankunft.K4_1-blick/ego-0.png` — graues Kopfstein-Rondell (die halbe
  Fläche), fünf Tor-Bögen (zwei mit Steinmauer-Ruine), Gras als gelb-grüne flache Zacken in Inseln, Laterne, Bank, Wald dahinter,
  derselbe dunkle Himmel. Das ist die eine Pose, die die Station je schoss (danach Deckel).
- Wartezeit: kalt 11,6–12,95 s Radeon (507beba6, 1cd1c408), 12,0–15,6 s GTX (c4010773, 350e6b11) bis die Taste den Leib trägt.

## Was die Quelle sagt
- **Der Messer der Ankunft ist seit 12.11. blind für ein ganzes Bild.** `PM/…/stationen/sitzung-seite.js:319` liest
  `b.luecke` aus `SCHUSS`; `SPIEL/scripts/diag-boot-stage.cjs:93-111` gibt seit ff5b70f7b (12.11. 01:53, w28-linse-wahr) nur noch
  `{dc, dreiecke, png}` zurück — die Lücke rechnet die Linse selbst (`lueckeKacheln` :116, Aufruf :528). Folge in jeder Messung seit
  3d4ac0ae (12.11. 09:03): „Bild NaN % Lücke“; `kaltKontrolle` (`stationen/g6.js:1182`) prüft `luecke <= 0.02` → NaN → nie ganz.
  Am 11.11. (c4010773 GTX) stand dort noch „0.01 % Lücke“. Auf origin/punkte-maschine (020fce1a) ungeheilt.
- **Zweiter Sperrgrund, in jeder Messung seit 11.11.:** `offen im Bild 4 Wald-Stücke warten auf ihre Gestalt` (Satz aus
  `SPIEL/stamm/dirigent-ankunft.js:1307`, Zähler `_streuWartet` `stamm/vegetation-streu.js:1599`, Regel je Region :1626-1634).
  `j.ohne` ist leer (`1cd1c408-radeon/ankunft.K2_1.json`: `"ohne":[]`) — der Ladeschirm wich OHNE Lücke; die vier Regionen
  zählen erst NACH dem Bild, wenn die Station `_weltbildFehlt()` fragt (sitzung-seite.js:308). Pixel 11.11.: 0,01 % (GTX). Bild 13.11.:
  Kontrolle = Ruhe (oben). Der Term zählt Buchhaltung, nicht Pixel; welcher Grund („wartet auf ihr Asset“ oder „Scheibe offen“) —
  nicht gemessen.
- Zeiten (Messung, `PM/…/messung/*.json`): ankunft.K1 Radeon 12,95 s ↔ ≤ 5, GTX 15,64 s ↔ ≤ 10 (beide nötig, g6.js:2844);
  ankunft.K3 Radeon warm Median 5,41 s (818b466d, 08.11.) → 5,88 (2d5f4146) → 6,37/7,07 (1cd1c408, Rohzeilen .out:442/445) ↔ ≤ 5;
  GTX 11,5–13,8 s. ankunft.K5 Radeon längste 494 ms ↔ ≤ 250, belegt 11,95 s ↔ ≤ 4 („Bild 4.41 · Jobs 4.00 · Knoten-Bau 3.64 ·
  Wiese 0.71“); am 507beba6 hieß die längste „folger [koerper-core.js] 102 · _tuchGitterStufe 79 · tuchGitter 60“ — das Kleid.
- ankunft.K4#1 nie gemessen: eine Pose kostet 59 s (1cd1c408) bzw. 81 s (ec281422) still, Deckel 90 s „Stille“ reißt nach
  `POSE ego-0`; die Station braucht 10 Posen + 5 Kopf-Schüsse (g6.js:2583-2614). An ec281422 liefen K1/K2/K3/K5 gar nicht:
  „die Fahrt riss 1800 s (in vegetation.K4#1)“ (`messung/ec281422-radeon.json` ungemessen).
- ankunft.K2 hält 1 Punkt nur über die Ratsche (GRÜN 818b466d, 08.11.: 0,00 % Lücke, nichts offen). Die nächste frische Radeon-
  Fahrt urteilt NaN → frisch ROT → **221 → 220**.
- ki: K3#1/K4#1/K5#1 gehalten, aber R6 „Linse seit der Messung geändert“ (stand.json); K3#2/K4#2 ohne Station, K5#2 „kein
  Werkzeug“ (`stationen/g4.js:2278`: Prompt nie gezählt, das Modell läuft nur am Laptop — „alle Geräte“ heißt Ollama an der GTX).
  KANN: Bewohner tragen dasselbe Gedächtnis (`stamm/siedlung-bewohner.js:1789` `_creatureRemember(b.leib,"gewalt")`), der
  Persona-Prompt liest es (`stamm/feld-nexus.js:1175`, :1324). KONSUMIERT: kein Korpus fragt je einen Bewohner (weg.json:1234).
- stoffe.K1: Tafel holz 5/7 · stein 4 · eisen 4 · gras 5 · erde 4 · laub 5 · wasser 4 (31/49 Wirkungen, headless d3708675). Es
  fehlen Albedo→Luma (GPU), T_schmelz über Esse/Lava, T_zünd als Glut-Schwelle, μ des Wassers (`PM/…/weg.json:214-221`).

## Die EINE begrenzende Entscheidung
Die Ankunft meiner Scheibe sperrt zuerst der MESSER, nicht das Bild: zwei gleiche Bilder gelten seit 12.11. als „nicht ganz“.
Ich jage keine Sekunde (Kurs Z. 20: B ist Kosten-Zeile), ich mache das Urteil über das Ankunftsbild wieder pixelwahr — kein Soll,
keine Schwelle bewegt; danach steht jede Ankunfts-Zahl ehrlich als Zeit und ihr Täter als Klasse.

## Der Schnitt
Stufen (die Klasse „Urteil über das Bild der Kontrolle“ ganz, in EINER Abgabe auf punkte-maschine, Selbsttest je Fall):
1. `sitzung-seite.js:273` die Linse holt `lueckeKacheln` dazu; `:319` `luecke` = MAXIMUM je Kachel aus `a.png`/`b.png`
   (`pngLesen` aus `scripts/lib/abnahme-urteil.cjs`, wie diag-boot-stage.cjs:528), dazu `kachel`. Vor der Ruhe dieselbe Halte-Zeile
   wie die Linse (`__halten(["tiere","bewohner","wagen","leib"])`, diag-boot-stage.cjs:525), sonst heißt ein Schritt Lücke.
2. `sitzung-seite.js:308` im selben `evaluate` die Liste der vier Regionen mit Grund: `r._streuWartet(p, liste, …)`
   (vegetation-streu.js:1599 trägt `liste` schon) — das nennt den Täter des zweiten Sperrgrunds beim Namen, kein neues Werkzeug.
3. Mutante in `g6.js` (`kaltRoh`): `bild.luecke` fehlt → ROT beim Namen „Lücke ungemessen“, nie NaN.
Leser-Liste (wer liest, was sich ändert): `g6.js:1182` kaltKontrolle (ankunft.K1#1/#2), `g6.js:2797` (ankunft.K2#1), `g6.js:2824`
(K3 liest nur warm, unberührt), `g6.js:2903` spurVon (K5, unberührt), pipeline.K4#1/#2 (Zwillinge derselben Probe, lesen
`lieferung`, unberührt). Im Spiel liest niemand die Station.
Kosten-Zeile: 0 ms am Schirm (nur Probe); zwei PNG-Lesungen 960×540 je Kalt-Boot.
Kriterien: ankunft.K2#1 hält 1 (sonst −1) · ankunft.K1#1 bleibt ROT, aber mit Zeit statt NaN (12,95 ↔ 5 / 15,6 ↔ 10) ·
ankunft.K1#2 dito (↔ 5 beide). Station `ankunft.K1#1`, `#2`, `ankunft.K2#1` (g6.js:2780-2889).
Billigster ehrlicher Weg je übrigem Kriterium:
- ankunft.K2#2 (+1): Station fehlt (180°-Blick 2 s nach Kontrolle + 30 m Höhe, weg.json:1674); gebaut erst nach B. Nicht billig.
- ankunft.K3#1 (+1): Radeon 6,37–7,07 ↔ ≤ 5 s; Knoten-Bau 3,64 s ist der größte Posten — jede Klassen-Abgabe zahlt ihn als Zeile.
- ankunft.K4#1 (+1): Station reißt am Deckel (eine Pose 59–81 s still); erst die Pose billig, dann ≥ 6/12 frisch (am Mittag 11/12).
- ankunft.K5#1 (+1): 494 ↔ 250 ms, 11,95 ↔ 4 s; der Welt-Faden (dirigent-takt.js:1423 laut weg.json:1724). Nicht billig.
- ki.K3#2 (+1): Korpus auf Bewohner erweitern (Gedächtnis liegt), aber „alle Geräte“ braucht Ollama an der GTX — fehlt.
- ki.K4#2, ki.K5#2, stoffe.K1#2: je eine neue Station; stoffe braucht dazu 4 Wirkungen × 7 Stoffe im Spiel.

## Was schon liegt
- `w28-linse-wahr` ist in main (die Linse rechnet richtig); die Station zog nicht nach — die Lücke liegt allein in punkte-maschine.
- `w28-weltbild-kalt` bdb060ad (11.11., WIP, 3 Dateien: Platte am Buch) — liegt ohne Arbeiter; `w28-platte-fein` gelandet (z425).
- `w28-leib-nah` ace30e73 (GTX 1050): das Kleid — sein Bau ist am 507beba6 die längste Aufgabe der Ankunft (K5).
- `w28-stoff-fuge` 212b6de9 (36 Dateien, Stoff an den Häusern) — ob es `state.materials`/Albedo→Luma berührt: nicht gelesen.

## Ehrlich offen
- Nicht gemessen: ob nach dem Schnitt K2#1 frisch GRÜN wird — die „4 Wald-Stücke“ sperren `offen.length === 0` weiter, bis ihr Grund
  benannt und im Spiel geschnitten ist. Welcher Grund es ist, sagt erst der Lauf nach Stufe 2.
- Widerspruch: die Station hält nichts still vor dem Ruhe-Schuss, die Linse des Spiels schon (diag-boot-stage.cjs:525).
- Der Kalt-Boot der Station landet nicht am Rondell (K2-Bild: nackte Erde am Waldrand), der erste Blick der K4-Station am Rondell
  — dieselbe „Ankunft“, zwei Orte. Ursache nicht gelesen.
- Nicht gelesen: `_buildCreaturePersonaPrompt` mit einem Bewohner-Leib (userData-Form); FUND-REGISTER über den 13.11. hinaus.

## Rang
Wirkung 2 (rettet 1 Punkt, macht 3 Kriterien wieder lesbar; das Bild ändert sich nicht) · Aufwand S · Risiko: der Schnitt zeigt
die wahre Zeit — keine Ankunft-Zahl wird grün, und die 4 Wald-Stücke können sich als echter Bruch im Spiel erweisen.

Fünf Punkte meiner Scheibe, die ein Bild-Schnitt nebenbei kippt (Wahrscheinlichkeit meine Lesart, nicht gemessen):
1. ankunft.K2#1 (hält) — der Beweis ist schon das Bildpaar Kontrolle = Ruhe; braucht nur den Messer oben.
2. ankunft.K4#1 (+1) — jede Klasse am Spawn (laub-kante, boden-nah am Rondell, mensch-kopf) zählt in die ≥ 6/12; Station reißt erst.
3. ankunft.K3#1 (+1) — ein Kleid-/Stoff-Schnitt mit weniger Programmen senkt Knoten-Bau 3,64 s; 6,37 → 5 s ist weit.
4. ankunft.K5#1 — `folger`/`_tuchGitterStufe` (koerper-core) fallen mit w28-leib-nah aus der längsten Aufgabe; belegt bleibt > 4 s.
5. stoffe.K1#2 — Albedo→Luma ist die einzige GPU-Wirkung; ein Fassaden-Schnitt mit Stoff am Haus liefert das Bild dafür, die Station nicht.

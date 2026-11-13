# 47 Meisterkarte Scheibe 7/8 — gelaende · luftwasser · siedlung · ultiversum (Index mod 8 = 6)

Domänen alphabetisch aus `w3/pm/meisterkarte-quelle/punkte/stand.json` (kopf ec281422, 33 Domänen): 6 gelaende · 14 luftwasser · 22 siedlung · 30 ultiversum.
Gebucht 35/40. Offen sind **4 Punkte in 4 Kriterien** (alle anderen 16 stehen auf 2): gelaende.K2 1/2 · gelaende.K3 1/2 · siedlung.K1 1/2 · ultiversum.K1 1/2.
Regel (kurs-B Z. 6–9, punkte.cjs:4063): #1 GRÜN an einem Gerät, #2 GRÜN an ALLEN, nur wenn #1 hält.

## Was der Spieler sieht (mit Bildpfad; sonst „kein Bild gesehen")

- `BILD/dorf-main-0.5.png` (Dorf der Ankunft, Mittag): Häuser von außen als glatte helle Kästen, die Fenster sind graue, flache Tafeln ohne Glas
  und ohne Tiefe — kein Licht fällt sichtbar hinein oder heraus. Ein Innen-Bild habe ich NICHT gesehen (keine Datei in BILD, keine PNG in
  `messung/roh/ec281422-radeon/` für siedlung.K1_2 — nur `siedlung.K1_2.json`).
- Was die Zahl über das Innere sagt (gelesen, nicht gesehen): Innen-Luminanz linear 0,005–0,012 in JEDEM der 18 Häuser des Start-Dorfs
  (`messung/roh/ec281422-radeon/siedlung.K1_2.json`) — wer eintritt, steht im Dunkeln, am Mittag. Draußen im Schatten 0,05–0,21.

## Was die Quelle sagt (Fakten mit Datei:Zeile und Zahl; was das Gesetzbuch KANN gegen das, was die Welt davon KONSUMIERT)

**siedlung.K1 (1/2) „Haus von innen" — der einzige Bild-Punkt der Scheibe.**
- Soll #2 (`meisterkarte.json:3219`): jedes Haus des Start-Dorfs, Innen-Luma ≥ 15 % des Außen-Schattens, beide Geräte. Station `stationen/g5.js:3747–3790`,
  Probe `startDorfInnen` g5.js:1706–1986.
- Ist: Gang 18/18 ganz (Hub 0,20 m) auf beiden — der Gang ist gelöst. Innen-Bild Radeon ec281422 **4/18, Median 0,057**; GTX 1e00bfdb **5/18, Median 0,083**
  (Soll ≥ 0,15). Seit 11.11. über 9 Messungen stabil 4–5/18, Median 0,057–0,088 (messung/*.json) — kein Wackler, ein fester Mangel.
- Die „grünen" 4–5 Häuser sind grün, weil ihr Außen-Schatten fast schwarz ist (aussen 0,0066–0,027 → Quote 0,26–1,26), nicht weil innen Licht ist.
- WURZEL: unter einem Dach trägt das Innere kein Licht außer der Sonne durch Öffnungen.
  (1) Der Rückstrahl des Bodens ist unter der Decke AUS: `stamm/bild-schatten.js:312–316` `_rueckstrahlAn` → 0 bei `_augeUnterDach()` (stoff-material.js:2253–2266).
  (2) Das Licht des Auges — das Gesetz, das genau dieses Loch in der Höhle schließt (`_dayNightApplyAugenLicht` bild-himmel.js:1962–1990, Stärke
  `_augenLichtStaerke` :1998, „Höhle fällt auf die lesbare Nacht der Kamera, 0,22 der Karte") — kennt nur Höhlen: `_himmelAmAuge` bild-himmel.js:2015–2017
  `if (!s || !s.hoehle) return 1;` und :2043 „in keiner Luft-Box eines Höhlen-Knotens → 1". Im Haus ist h = 1 → `_augenLeuchte` null (:1970–1972).
  Das Gesetzbuch KANN Adaptation an fehlenden Himmel; die Welt KONSUMIERT es an 0 von 18 Häusern.
- Der Dach-Pool kennt die Decken jedes Hauses seit w18-innen-licht (a96dbeb9, in main; stoff-material.js:2273–2277: `__huelle.decken`) — die Frage
  „steht das Auge unter einer Decke" ist am Kopf beantwortet, nur ein Leser fehlt.
- Station-Loch: 6 von 18 Häusern `aussen` = undefined (kein Schatten-Boden auf 1–40 m gegen die Sonne gefunden, g5.js:1963–1978), 1 Haus `innen`
  undefined (haus_skandinavisch, kein freier Blick, g5.js:1946–1948). `quote` null zählt als dunkel (g5.js:3767 `!(h.quote >= 0.15)`) → selbst mit Licht
  höchstens 11/18. Zweig `w28-dorf-innen-leicht-pm` 6c090fc8 (g5.js +31/−3, WIP) hält „nur, was sie liest" — nicht gelesen, ob er dieses Loch heilt.

**gelaende.K2 (1/2) „Wasser folgt jedem Edit".** #1 GRÜN gehalten (Radeon b3f9ae95 8/10 Gräben, 34–203 ms; GTX 715754fc). #2 nie GRÜN: ungemessen,
GTX „Deckel 1757 s gerissen … Runtime.callFunctionOn timed out" (b1531071), Radeon „Werkbank Exit 3221226505" (36f9d45a). Letztes Urteil ROT 29.10.
(98ef98bb, kurs-B Z. 154). Station g1.js:1754–1820, 16 min, `K2_PROBE` in `proben-welt.cjs:1030`. Kein Bild-Mangel bekannt — ein Mess-Mangel.

**gelaende.K3 (1/2) „Wasser-Bild an jeder Pose".** #1 GRÜN GTX e84fd1fb (spiegelTreue 0,73). Radeon wackelt am Soll 0,6: 0,90 · 0,62 · 0,33 · 0,48 · 0,61 ·
0,25 · 0,25 · 0,54 · 0,60 (11.–13.11., gleiche Pose 51–55 m; messung/*.json) — derselbe Schuss streut ×3,6. #2 „kein Werkzeug (fehlt)":
12 Posen (Ego/Third × Mittag/Nacht/Regen × 2 Geräte) + Fließ-Anisotropie ≥ 1,5 (`meisterkarte.json:497`).

**ultiversum.K1 (1/2) „Welt-Gesetz, Konstanten".** #1 headless gehalten (d3708675: A g −9,81 Sprung 0,323 m | B g −3,71 Sprung 1,54 m). #2 „alle Kapitel
des Gesetzes je Welt, beide Geräte" (`meisterkarte.json:3623`) hat KEINE Station (g5.js:4637–4655 nur Staffel 1).

luftwasser.K1–K5 und siedlung.K2–K5, ultiversum.K2–K5, gelaende.K1/K4/K5: je 2/2.

## Die EINE begrenzende Entscheidung

**Das Licht des Auges liest die Decke wie die Höhle:** `_himmelAmAuge` gibt unter einer Decke des Dach-Pools (dieselbe Regel `_augeUnterDach`, die den
Rückstrahl ausschaltet) den fehlenden Himmel zurück, statt 1. EINE Frage „fehlt dem Auge der Himmel" für Höhle UND Haus — kein Innen-Licht-Modul,
keine Lampe je Haus, kein Soll bewegt.

## Der Schnitt (die Klasse ganz: Stufen · Leser-Liste mit Datei:Zeile · Kosten-Zeile · Kriterien der Meisterkarte mit Id, Ist ↔ Soll, Station)

Klasse „Licht unter der Decke" — alle Stufen in einer Welle:
1. Auge: `stamm/bild-himmel.js:2015–2043` `_himmelAmAuge` — vor dem Höhlen-Zweig `if (this._augeUnterDach()) return 0` (bzw. der Anteil offener
   Himmel aus der Hülle, falls das Gesetzbuch Öffnungen nennt — nicht gelesen); der Merker `_himmelAugeMerk` (:2019–2027) darf den Dach-Wechsel nicht
   überspringen: sein Schlüssel trägt `this._dachWahl`/`_grundrissStand()` mit (stoff-material.js:2282–2285).
2. Rückstrahl bleibt aus unter der Decke (bild-schatten.js:315) — unverändert; das Auge ersetzt ihn, kein zweiter Ersatz.
3. Regen/Nässe unter der Decke (stoff-material.js:2198–2247, bild-himmel.js:1022) — schon gelandet, unverändert.
4. Station: g5.js:1963–1978 — findet sie gegen die Sonne keinen Schatten-Boden, sucht sie im Kreis (je 30° Gier) statt `aussen` leer zu lassen;
   das Soll 0,15 bleibt. Ohne diese Stufe bucht der Licht-Schnitt nie (6/18 null).
Leser-Liste VOR dem Schnitt: `_himmelAmAuge` ← nur bild-himmel.js:1965 (`_dayNightApplyAugenLicht`); `st.himmelAmAuge` ← scripts/diag-hoehlen-sicht.cjs:1310;
`_augenLeuchte` ← dirigent-kern.js:1754 (`_leuchtQuellen`, Rang 0) und diag-hoehlen-sicht.cjs:1305; `_augeUnterDach` ← bild-schatten.js:315.
Bildpaar: Ego in haus_schwarzwald am Start-Dorf, Auge 1,3 m über der Diele, Mittag und Nacht, vorher/nachher; dazu von außen durch die Tür.
Kosten-Zeile: `_augeUnterDach` ist EINE CPU-Prüfung je Takt (≤ 8 Plätze, stoff-material.js:2261); das Licht des Auges ist ein Platz des schon bestehenden
Licht-Pools (dirigent-kern.js:1754) — 0 neue Programme. An den Schirm gebunden (nur am Auge), nie an die Weltgröße. Gemessen: nicht.
Kriterien: **siedlung.K1#2** Innen-Bild 4–5/18, Median 0,057/0,083 ↔ 18/18 ≥ 0,15, beide Geräte, Station g5.js:3747 (+1). Mit-Leser: leib.K3#2 Radeon
„Höhle Abfall 0,01 ↔ [0,06; 0,25]" (kurs-B Z. 121) liest dasselbe `_augenLichtStaerke` — nicht meine Scheibe, nicht verschlechtern.

## Was schon liegt (Zweig, Kopf, was fehlt bis zur Landung)

- `w18-innen-licht` a96dbeb9 — in main (Decken aus dem Gesetzbuch). Liefert die Frage, nicht das Licht.
- `w28-dorf-innen-leicht-pm` 6c090fc8 — WIP an der Station (g5.js +31/−3, „hält nur, was sie liest, Lebenszeichen je Haus"); Stufe 4 gehört in ihn.
- `siedlung-k1-innen-koord` 3d9db438 — alter Stations-Zweig, nicht gelesen.
- `w28-wasser-sicht` 6fd33f42 — Abgabe 12.11., NICHT in main (Licht und Glanz des Wassers lesen die Sonnen-Sicht): Kandidat für das Radeon-Streuen von
  gelaende.K3#1, nicht gemessen.
- `w8-ultiversum-k1-pm` 2f280cc6 — Staffel 1; für #2 liegt nichts.

## Ehrlich offen (nicht gelesen, nicht gemessen, Widersprüche)

- Nicht gelesen: ob ein Ersatz-Platz (`ersatz: true`, bild-himmel.js:1984) auf Haus-Stoffen überhaupt wirkt — der Kommentar :1960 sagt „trägt nur, wo der
  Himmel fehlt (der Boden mit 1 − aHimmel)"; trägt nur der Boden-Stoff `aHimmel`, erhellt das Auge Wand und Diele NICHT. Das ist die erste Lesung des Arbeiters
  (`_lichtPoolTerm` in stoff-material.js); fällt sie negativ aus, wächst Stufe 1 um den Ersatz-Faktor 1 − offenerHimmel im Haus-Stoff.
- Nicht gelesen: ob `__ausgabeAufnahme` den Tag-Nacht-Takt rechnet — die Probe stellt die Kamera bei gestopptem Loop (g5.js:1886, 1951); bleibt
  `_augenLeuchte` vom letzten Takt, misst die Station das Auge am falschen Ort.
- Nicht gemessen: ob 0,22 der Karte (die Höhlen-Nacht) über 0,15 × Außen-Schatten trägt (Außen-Schatten 0,11–0,21 bei 11 Häusern).
- gelaende.K2#2: warum die Probe den Deckel reißt (16 min Soll, 1757 s) — Täter unbenannt. Exit 3221226505 der Radeon-Werkbank unbenannt (UEBERGABE Z. 53).
- gelaende.K3#1 Radeon streut 0,25–0,90 am selben Ort — Täter unbenannt; GTX hält den Punkt.
- Die Aufgabe nennt „fünf Punkte der Scheibe": die Scheibe trägt nur **vier** offene. Ein Bild-Schnitt kippt davon nebenbei genau einen
  (siedlung.K1#2). Die anderen drei brauchen Mess-Arbeit (gelaende.K2#2 Deckel) oder neue Stationen (gelaende.K3#2, ultiversum.K1#2 — „kein Werkzeug").

## Rang (Wirkung im Bild oder im Takt 1–5 · Aufwand S/M/L · Risiko in einem Satz)

1. siedlung.K1#2 Licht des Auges unter der Decke + Station sucht den Schatten im Kreis — Bild **4** (jedes Haus am Ort der Ankunft von schwarz zu lesbar) ·
   **S–M** · Risiko: wirkt der Ersatz-Platz nur auf den Boden-Stoff, wird es M und berührt jeden Haus-Stoff.
2. gelaende.K3#1 Radeon-Streuung 0,25–0,90 (wasser-sicht landen, dann dieselbe Pose zweimal) — Bild 2 · M · Risiko: ohne Täter jagt man ein Rauschen.
3. gelaende.K2#2 Deckel — Takt 1 · M · Risiko: Apparat-Arbeit ohne Bild, gegen den Kurs (UEBERGABE §2.5), nur wenn sie eine Buchung blockiert.
Die fünf Punkte, die ein Bild-Schnitt nebenbei kippt: nur **siedlung.K1#2 (+1)**; gelaende.K3#1-Radeon wird stabiler (kein Punkt, der Punkt hält über GTX);
gelaende.K2#2, gelaende.K3#2, ultiversum.K1#2 kippt kein Bild — 0.

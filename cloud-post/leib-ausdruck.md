# leib-ausdruck — WIP (ZWISCHENSTAND, Übergabe)

Basis: main 1feab29c6 (w28-a-haltung steht drin). Karte 2: 0 von 1 718 gebucht durch diesen Zweig.

**Geschnitten:** koerper-core `AUSDRUCK_GESETZ` + `leibAusdruck` (Akt, Gemüt, Alter, Bau, Last, Wunde) fließt in `leibGangTakt`/`leibRigPose` (Gemüt im Gang: Kopf und Brust; Hüpfen des Kindes als ballistischer Flug g·t·(T−t)/2; Hinken über die Standzeit je Bein; Becken im Maß der Eltern `hips.scale`). Der Wirt reicht nur den Stand (`_bewohnerAusdruck`, `ausdruckStand` aus `_bewohnerGenome`, `_gaitTick` → `_gaitTakt` A). Linse AUSDRUCK in `gate:mensch-zuege` mit 7 Tätern; `kreatur-mensch.cjs` liest das Tempo des Ausdrucks.

**Gemessen** (N 2000, Samen 0x51ed, IST 1feab29 → SOLL, gleiche Bedingungen):
- #1 Silhouette Stand Treffer 0,86 → 1,00 (Arbeit 0/10 → 10/10, Rumpf 5,0° → 27,7°, OWAS ≥ 20°); Gang müde/froh 0/10 → 10/10 (Kopf +15,2° / −11,8°).
- #2 Tempo 20–30 J ÷ Mitte 1,13 → 0,977 (Bohannon 0,971), 70–80 J 0,774 → 0,826 (0,86), 80+ 0,715 → 0,735 (0,687); Lichtpunkt-Alter MAE Kind/Erw./Alt 7,1/9,7/37,9 → 4,4/7,9/1,5 J (Band ± 15); Kind hüpft 14/98 → 1,0; Hinken erkannt 0 → 1,0 (84 Lahme, Fehlalarm 0); Hinken > 60 J 0,119 (Mahlknecht 0,174 ± 0,08).
- Fußgleiten (SCHLUPF der Familie tier-gang): 0,0135 → 0,0163, 1,01 cm je Stand (Band ≤ 0,05).
- Linse: Hauptlauf grün 28,5 s; Selbsttest 1:43, alle 7 Ausdrucks-Täter ROT an ihrer Zeile.
- Grün: diag-atlas --check, stamm:lint, gate:koerper-kern, gate:tier-gang (81 s), lint 0 Fehler.

**Offen mit Adresse:**
- `gate:koerper-stand` ROT K7 Aufbau (Büschel 401 < 1000, Pflanzen 37 < 500) — Vergleich gegen IST 1feab29 fehlt; vermutlich Gras-Aufbau, nicht der Gang (Wand gate:koerper-stand).
- Nicht gelaufen: `npm run check`, `gate:mensch-anatomie`, `gate:kreatur-takt` (Browser, liest kreatur-mensch.cjs).
- Bild: GPU-Probe und Bildfolge eines Schritts (≥ 4 Phasen) fehlen — Sprossen mensch.leib.ausdruck #1/#2. GPU-Proben-Run-IDs: keine.
- „beladen“ ungemessen: Last ist nur Werkzeug-kg, die Wirtschaft trägt keinen Sack — mensch.leib.ausdruck #2.
- Eigene Setzungen ohne Profi-Zahl: Hinken < 60 J 3 %, Kind-Tastgrad 0,45; das Gemüt ändert das Tempo nicht (Roether 2009) — #1/#2.
- Fuß des Spielers am Hang 3,1–3,4 cm ist leib.K2 (diag-koerper-stand), eigene Sprosse.
- Die Aufrufstelle `_tickBewohner` prüft nur Spiel/Bild, nicht die Linse.

**Nächster Handgriff:** K7 gegen 1feab29 unter gleichen Bedingungen messen; `npm run check` + `gate:kreatur-takt`; dann Commit „Vorprüfung leib-ausdruck 1: … [gpu-probe: bild:stadt-voll@0.5, gate:pruefbuehne-licht, gate:weltbild-frost:echt, gate:studio-begehen] [ci voll]“ mit Bildfolge, Artefakte ansehen.

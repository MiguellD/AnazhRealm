# 56 Die besten und die schlechtesten Tage: was sie unterscheidet

## Was es den Spieler kostet
- Kein Bild gesehen (Prozess-Bereich). Die Kosten: am 12.11. landeten ~23 Spiel-Zweige, gebucht 220 → 221; am 13.11. 5 Spiel-Landungen,
  gebucht 221 → 219 → 221 (`bericht/1113-kurs-F-beste-zeiten.md:34-35`, `:64-70`; UEBERGABE-2026-11-13.md:50).
- Am 26.10. (11:00–23:38) dagegen 95 → 112 bei 34 → 55 % Woche = 0,81 P/% (memory `buchen-je-takt.md:11`).
- Die Zahl der Landungen unterscheidet die Tage NICHT: 22 Spiel-Merges am 24./26.10. gegen 20/21/18 am 10.–12.11. (kurs-F:15,17,32-34,37-38).
  Der Unterschied: ob eine Landung ein benanntes Kriterium kippt UND am selben Tag gebucht wird.
- Wartezeit heute: die Buchung stand 12.11. 14:51 bis 13.11. 07:32 still (kurs-F:47,78), um 21:02 erneut verweigert 221 → 219
  (UEBERGABE:81) — jeder Gewinn dazwischen ist für den Schöpfer unsichtbar, weil die Seite nichts zeigt.

## Was die Quelle sagt
**Die drei besten Tage (kurs-F:44-46):**
- 26.10. 0,81 P/%: Regel 11:00 „≥ 70 % PUNKTE-Karten — fehlende Staffel-2-Stationen … je Code-Zweig + Stations-Zweig" (memory
  `woche-2510w2.md:49`). Zweige trugen die Kriterium-Id im Namen: `sk2-zipf`, `pk2-vmax`, `tk3-reittier`, `lk4-steil`, davor `ki-k2`,
  `leib-k4`, `mensch-k3` (woche-2510w2:45,49,56). GTX maß nur `gtx-nutzen` = 16 von 46 Stationen, die Punkte ändern können (woche-2510w2:61).
  Gebucht nach JEDEM GTX-Takt am festen Kopf: 97 (17:05) → 98 → 108 → 112 (buchen-je-takt:17-18; woche-2510w2:63). Kern-Zug erst NACH
  der Buchung (woche-2510w2:46,54). Kette nach 2 Karten ohne Punkt angehalten (woche-2510w2:49,59).
- 03.11. ~0,72: zuerst Messschuld ernten (35 hebende GTX-Stationen in drei Scheiben, am Vorabend bestellt), dann „fast fertige Punkte" (kurs-F:45).
- 24.10. 0,53 (nach 14:25: 2,1): 9 champions je benanntem Kriterium, Station kommt mit der Rückgabe (kurs-F:46).
**Die drei schlechtesten (kurs-F:47-49):**
- 12.11. ~0,03: Aufträge an Klassen/Samen (Mensch-Kanon, Fassade, Nacht, Strauch, Samen-Befunde) ohne Kriterium-Ziel; 4 lokale Fable an der
  RAM-Decke + OMEN/GTX als Macher; Koordinator 631k Kontext; Buch-Schleife starb 30× (kurs-F:47).
- 29.10. 0,04: Voll-Takte, 64 GPU-Stationen, 879 Stations-min, 6–7 h je Gerät. 23.10. −1/35: Apparat-Tag, ABAB-Tor seriell vor jeder Landung.
- Netto-Fälle: 10.11. −9 (gpu-wahl-2 erst nach dem Landen gemessen), 13.11. −2 (lod.K4 nach z411, vegetation.K1 nach z414) (kurs-F:51-52).
**Sichtbar im Log:** die Merges 12.–13.11. heißen nach Dingen, nie nach Kriterien (`laub-deckung`, `halm-trieb`, `strauch-gestalt`,
`krone-vor-kachel`, `leib-genom`, `platte-fein`; `git log origin/main --first-parent --since=2026-11-09`, 11-12 12:32 bis 11-13 20:47).
**Die Buchungs-Wand:** `pm/zug/dienst/werkzeug/buche.sh:56-63` vergleicht nur die SUMME mit `zug/budget.txt`; fällt sie, wird NICHTS
gebucht, auch kein Gewinn, bis ein Mensch `BUCHE_FALL=1` setzt (:57). Anlass war 27.10. (R6 machte Messungen alt, :53-55). Seit 191f0684 gilt
ein stummer Werkbank-Absturz als UNGEMESSEN (UEBERGABE:53) — ein frisches ECHTES Rot ohne Täter (schatten.K3/K4, UEBERGABE:81) hält
trotzdem jeden Gewinn derselben Fahrt fest.
**Was trug, was fehlt (kurs-F:76-80, M1–M5):** M1 Einheit = EIN Kriterium mit Wert 0 + Station · M2 Ernte vor Bau · M3 buchen je Teil-Takt
am festen Kopf · M4 Kandidat messen VOR dem Landen · M5 schlank (1 Macher je Karte, ≤ 2–3 lokal, Koordinator klein).
**Der Kurs vom 13.11. widerspricht dem nicht:** Brief nennt Kriterien (Id, Ist ↔ Soll, Station) + Bildpaar + Leser-Liste (UEBERGABE:23;
memory `kurs-1311-kriterium-je-auftrag.md:19`); Look-Linsen sperren keinen Zwischenschritt, die Buchung urteilt am Ende (bild-fuehrt-klasse-ganz:13).
58 der 111 offenen Punkte haben KEINE Station (UEBERGABE:54) — wer ohne Station baut, kann nicht buchen.

## Die EINE begrenzende Entscheidung
Die Arbeits-Einheit eines Tages ist die KLASSE MIT IHREN KRITERIEN: kein Brief, kein Zweig ohne die Kriterium-Ids (Wert 0/1, Station) im
Zweignamen und Brief; die Station fährt im selben Auftrag mit, wenn sie fehlt; gemessen wird am KANDIDATEN, gebucht am selben Tag am festen
Kopf — und die Buchung hält nur das gefallene Kriterium fest, nie die Gewinne daneben.

## Der Schnitt
**Stufen (die Klasse „Tag ohne Buchung" ganz, eine Welle):**
1. Brief-Muster (Kopf jedes Briefs, 6 Zeilen): GOLDENE DEFINITION · Klasse + alle Stufen · Kriterien `<domäne>.K<n>#<p>` Ist ↔ Soll + Station
   (fehlt sie: Station im Auftrag) · Bildpaar an fester Kamera am Dorf · Leser-Liste · „lokal nur check, format, playtest:fast, eigene Tore".
   Zweigname trägt die Ids (Muster `sk2-zipf`, woche-2510w2:49).
2. Tagesablauf (26.10. übertragen): Morgen = `punkte.cjs buchen --trocken` + `gtx-nutzen` am Kopf → Messschuld ernten, buchen (M2/M3);
   Tag = 2–3 lokale GPU-Macher + Cloud je Klasse; Kandidat-Messung NUR der genannten Stationen vor dem Zug (M4); nach jedem Teil-Takt buchen;
   kein Kern-Zug vor der Buchung des vorigen; Kette nach 2 Abgaben ohne gekipptes Kriterium angehalten.
3. Buchung je Kriterium: `buche.sh:56-63` bucht die Gewinne (Kriterien, die von ROT/UNGEMESSEN auf GRÜN gehen) und hält ein frisch gefallenes
   Kriterium auf seinem gebuchten Stand, bis der Richter den Täter nennt — statt der Summen-Wand, die alles hält. Kein Soll, keine Schwelle,
   keine Ratsche bewegt: das gefallene Paar bleibt ROT benannt in `buche-verlust.cjs`.
**Leser-Liste (vor dem Schnitt an Stufe 3):** `pm/zug/dienst/buche-dienst.sh:6` (zitiert die Wand) · `pm/zug/dienst/werkzeug/buche-verlust.cjs:3`
(nennt die Verlierer, Leser von buche.sh) · `zug/budget.txt` (Zeile `karte=`, gelesen von buche.sh:56 und dem Kurs-Tab, buche.sh:51-52) ·
`punkte.cjs buchen --kopf` (buche.sh:34, liefert stand.json) · die Seite `meisterkarte.html` (buche.sh:50). Nicht gelesen: ob `punkte.cjs`
die Ratsche je Kriterium schon hält (ratsche-gesetz, 30.10.) — wenn ja, sitzt der Schnitt NUR an buche.sh:57.
**Kosten-Zeile:** 0 Laufzeit-Byte im Spiel; kein neuer Prüf-Apparat (eine Bedingung in einem bestehenden Skript); Brief-Kopf ~6 Zeilen.
**Kriterien der Meisterkarte:** kein einzelnes — Summe gebucht 221 ↔ Soll 330 (UEBERGABE:81). Maß: P/% je Tag; Ist 12.11. ~0,03, 13.11. ≤ 0;
Bestwert 26.10. 0,81. Station: die Buchungs-Zeilen in `zug/budget.txt` je Tag.

## Was schon liegt
- 191f0684 (punkte-maschine): stummer Absturz = UNGEMESSEN (UEBERGABE:53) — die halbe Stufe 3; die echte Fall-Wand steht noch.
- Brief-Kurs im Gedächtnis (`kurs-1311-kriterium-je-auftrag.md:19-23`) und UEBERGABE:23 — aber die vier WIP-Zweige (`w28-studio-seiten`,
  `w28-weg-koerper`, `w28-ziel-plan-wip`, `w28-wiese-fern`, UEBERGABE:69-72) heißen nach Dingen; welche Kriterien sie kippen, steht in den
  Briefen dieser Sitzung (nicht gelesen) und nicht im Zweig.
- Kein Zweig trägt Stufe 3. Fehlt: ein Arbeiter an buche.sh mit Selbsttest (Mutante: ein Gewinn + ein Fall in derselben Fahrt → bucht +1, hält −1).

## Ehrlich offen
- Nicht gelesen: `punkte.cjs` (Ratsche je Kriterium, ~6400 Zeilen), `wochen-reflexion-2110/2410/2510/0211/0511/0711`, `reflexion-konto9`,
  `punkte-netto`, `punkte-statt-karussell` im Volltext — ihre Zahlen stammen aus kurs-F, das sie zitiert.
- Budget-% je Tag teils geschätzt (kurs-F:13,25,30); P/% des 12.11. bezieht sich auf „alle"-Modelle, der 26.10. auf die Woche eines Kontos.
- Widerspruch offen (kurs-F:94): Kandidat messen VOR dem Landen (punkte-netto) gegen ABAB als Nachwache (profiband-merge) — die Nachwache läuft
  gar nicht (UEBERGABE:60), also gilt faktisch weder noch.
- Ob die Gewinne 12.–13.11. existieren, ist ungemessen: die erste Fahrt nach 191f0684 behielt 57 Stationen, 5 GRÜN, von CI abgebrochen (UEBERGABE:53).
- main stand bei Abfrage auf 7f778d44 (z427 w28-karte-stamm gelandet 20:47), nicht mehr ec281422.

## Rang
Wirkung im Takt 5 (bestimmt, ob Landungen zu Punkten werden; 0,03 → Ziel 0,5+ P/%) · Aufwand S (Brief-Kopf) + S (buche.sh-Bedingung mit
Selbsttest) · Risiko: eine Buchung je Kriterium könnte einen echten Rückschritt verstecken, wenn das gefallene Paar nicht ROT benannt bleibt —
darum hält Stufe 3 den Fall auf dem alten Stand und nennt ihn, statt ihn zu verrechnen.

# 52 Hundertmal benannt, nie geheilt

## Was es den Spieler kostet (mit Bildpfad)
- BILD `scratchpad/dorf-main-0.5.png` und `scratchpad/genom-spiel/gruppe.png` (Dorf der Ankunft, Mittag, vor und nach z426): die beiden Bilder sind
  für mein Auge praktisch gleich. Gesehen: der Himmel am Mittag dunkles Marineblau, der Hang aus großen flachen gelben Gras-Zacken, der Boden ein
  brauner Sprenkel-Teppich mit verwaschenen violetten Streifen ohne Kante, das Haus rechts ein glatter weißer Kasten ohne Stoff, die Bewohner mit
  aufgeblähten Hemden, alle stehend, keiner tut etwas. Jeder dieser fünf Mängel steht seit Tagen in mindestens drei Dokumenten (Liste unten).
- Takt: FUND-REGISTER.md trägt 258 Zeilen; seit 02.11. kamen in 159 Commits 282 Zeilen dazu, 25 gingen (git log --numstat origin/koordination),
  die letzte Zeile, die mit ihrem Schnitt starb, ist efd0ede8 vom 06.11. Seitdem wird gefunden, nicht geerntet.

## Was die Quelle sagt
Das Register hat KEINEN Leser. Kopf `FUND-REGISTER.md:3` „Wer eine Zeile heilt, löscht sie im selben Commit. Stand 02.11." — Gedächtnis
`pfadfinder-register.md:24` „Nach jeder Welle das Register ernten". Belegt ist das Gegenteil:
- GEHEILT, steht aber noch als offen (das Register kennt sich selbst nicht; main ec281422 gelesen):
  900er-Kappe der Wege (`stamm/siedlung-wege.js:1413` „Bis hier hielt eine stille Kappe von 900") · Leib als Täter der Sicht
  (`scripts/lib/kamera-nah.cjs:108-110`) · Exit schlägt Urteil (`.github/workflows/gpu-probe.yml:307-309`) · Tag an der Wanduhr
  (`stamm/bild-himmel.js:2536` „Bis w28-nacht-licht …") · Tiere vor dem Bild (`kreatur-verhalten.js` ohne `headless || hasPending`) ·
  Bestand-Kennung (`_annahmeN` 0 Treffer in `stamm/kreatur-leben.js`) · `_genesisPortalRing` (0 Treffer).
- Dieselben Funde stehen in fünf Dokumenten ohne gemeinsame Kennung: FUND-REGISTER, HEBEL-KARTE (24 Hebel), TIEFEN-KARTE (47), AUGEN-KARTE
  (466 Funde), UEBERGABE-2026-11-13 §3/§6 — kein Dokument verweist mit einer Id auf das andere; jeder Schwarm zählt neu.

Die 30, die am öftesten wiederkehren (offen an main ec281422 nachgelesen; Zahl = Dokumente, die ich gelesen habe und die ihn nennen):
| # | Fund · Stelle an main | genannt | warum er nie fiel |
|---|---|---|---|
| 1 | Laub-Konfetti / laub-kante · `phyto-core.js` `karteSaumSchluessel` (FUND 201: :4340) | 6 (PFLICHT A, FUND 146/201/226, HEBEL 9/10, TIEFEN 16, AUGEN 2.2, kurs-A §2) | Kreis: 10 Landungen in 13 Tagen, jede schob den Fehler in die Nachbar-Stufe (kurs-A:69) |
| 2 | Wiese ferne Zacken · `stamm/daten.js:563` `streckMax: 14`, Streckung nur am Abstand | 5 (FUND 55, 104(1), kurs-A §2, UEBERGABE §3, Schöpfer 13.11.) | Kreis: 9 Landungen; w28-wiese-fern WIP 476a3ed9, Ego +7,8 ms |
| 3 | Himmel am Mittag dunkel-marine · Wurzel nicht gelesen | 2 (UEBERGABE §3 „NIEMAND sitzt daran", §6) | kein Besitzer, kein Zweig, keine Station mit Himmels-Farbe |
| 4 | Poncho als Voxel-Hülle · `koerper-core.js:254` `dicke: top === "poncho" ? 0` | 4 (AUGEN 2.11, FUND 239/251, UEBERGABE §3) | Zweig w28-leib-nah ace30e73 WIP ohne Abgabe |
| 5 | Häuser glatte Kästen, Fenster ohne Gewände · `fachwerk-core.js:1062` `const fr='holz'` | 4 (TIEFEN §1, AUGEN §4, FUND 248, UEBERGABE §3) | w28-fassade b038852b hängt hinter stadt-grammatik (kurs-A #6) |
| 6 | Wege violett ohne Kante, kein Gehsteig · `siedlung-wege.js` `_wegeKarteMale` | 3 (UEBERGABE §3/§4, kurs C laut FUND 244) | w28-weg-koerper b1ffbea3 WIP, baut auf stadt-grammatik |
| 7 | Kein Wagen im Stadtbild · `stamm/siedlung-ort.js:840/856` `spurfrei` | 5 (FUND 156(3)/191/209, TIEFEN 2, AUGEN 2.1 „19 Pakete") | Abnahme verlangt Ziel frei UND Wagen ≥ 0,5 % — Zielkonflikt (FUND 209) |
| 8 | Block-Leiber ab 5–8 m · `stamm/siedlung-bewohner.js:3482/3484` `nahM: 8`, `nahLeiber: 4` | 3 (FUND 156(1), AUGEN 2.3, TIEFEN §1) | kein Zweig; lod.K5 misst den Leib nie (FUND 156) |
| 9 | Bewohner ohne Tätigkeit, Statuen · `b.akt` jetzt mit Leser `siedlung-bewohner.js:1818` | 3 (AUGEN 2.14, TIEFEN §7, kurs-A #3) | w28-ziel-plan 58acfa5e als „GELANDET" gemeldet, nie in main (kurs-A:13) |
| 10 | Mehrspieler-Wand kippt · `stamm/kreatur-leben.js:1687` `_bodenKlasseAt` | 5 (FUND 98/231/234/236/249/253) | w28-mp-boden f97fe692 WIP; Kipper an main-Zweigen wieder unbenannt (UEBERGABE:89) |
| 11 | Absturz ohne Wort 0xC0000409 / Exit 139 | 6 (FUND 149, 185–189, 214, 230, UEBERGABE §5) | nur das Urteil geheilt (pm 191f0684 = UNGEMESSEN), Ursache nie gesucht |
| 12 | Blob-CSP schaltet die Platte still ab · `index.html:35` `connect-src` ohne `blob:` | 3 (FUND 135/141, kurs-A #12) | Heilung liegt auf w28-weltbild-kalt bdb060ad, 461 hinter main, ohne Arbeiter |
| 13 | Seed ohne Schreiber · `stamm/koerper-leib.js:1470` `state.worldSeed` | 1 (FUND 162) | „Nicht geschnitten (kein Auftrag)" — S, ein Absenz-Grep |
| 14 | Nadel-Farbe als Zwilling · `foundry-core.js:2610/2719` `vegFarbe(0x2e5526)` gegen `phyto-core.js:2081` | 2 (FUND 20, 56) | seit 05.11. „S", nie vergeben (Gebot 4 verletzt) |
| 15 | Kontakt-Verdeckung hat EINEN Leser · `stamm/stoff-material.js:1924` | 3 (TIEFEN 7, §7, AUGEN §4) | kein Zweig |
| 16 | Fell-Glanz als Emission · `stamm/studio-stoff.js:542` `else if (add) mat.emissiveNode = add` | 2 (TIEFEN §1, 14) | kein Zweig |
| 17 | Sonnenbahn ohne Saison · `bild-himmel.js:1307` `_sonnenWinkel(t)` nur aus der Uhr | 1 (AUGEN 2.6) | „Deklination" 0 Treffer in stamm/; kein Zweig |
| 18 | Nacht = abgedunkelter Tag | 2 (AUGEN 2.5, §6) | w28-nacht-licht nahm nur die Uhr |
| 19 | Stachelhaar · `koerper-core.js:409` `haarStreu` | 2 (AUGEN 2.4, §7) | kein Zweig |
| 20 | PFLICHT A nennt tote Klasse · `docs/PFLICHT-OFFEN.md` A „fimp:atlas:L2 0,2635 … 17.10." | 3 (HEBEL 9, AUGEN §8, kurs-A:70) | „geht mit dem nächsten laub-kante-Schnitt" — der kam 10× und nahm es nicht mit |
| 21 | lod.K1#1 Tafel-Pose „Ziel tanne nicht gezeichnet" | 2 (FUND 149, 227 „ungeheilt") | Werkzeug-Täter, kein Besitzer |
| 22 | Nachwache ABAB ist Text, kein Lauf (`zug/abab.txt` leer seit 11.11.) | 3 (kurs-G:27, #7, UEBERGABE §6) | niemand streicht den Text, niemand fährt den Lauf |
| 23 | `package.json:20` check:statik = 76 `&&` (erste Rote verbirgt alle) | 1 (FUND 9) | seit 02.11. „S–M", nie vergeben |
| 24 | Zug lässt Konflikt-Abgaben still draußen | 2 (FUND 130, kurs-A „Stilles Loch" ziel-plan) | nur in `/tmp/claude/w4/zug-nie-leer.wartet` |
| 25 | GPU-Schloss als verwaist gelöst, Halter lebt | 2 (FUND 147 „OFFEN, dieselbe Klasse", 217) | halbe Klasse geschnitten (pm), `gpu-schloss.sh` nicht |
| 26 | Rundbau wirft `geomsZuGruppe` null.vo · `fachwerk-core.js` | 1 (FUND 144 „nicht geheilt, nur genannt") | kein Rezept trägt rund — niemand trifft es |
| 27 | Wege-Stummel in Häusern, 15 gesperrte Kanten · main | 2 (FUND 183, kurs C) | an stadt-grammatik gebunden |
| 28 | Gras in Gassen der Stadt (Kappe fiel, Gras blieb?) | 3 (FUND 156(2), AUGEN 2.8, TIEFEN 8) | Kappe geheilt; ob das Gras ging: kein Bild gesehen |
| 29 | Kies als Pixel-Rauschen · `stamm/daten.js:708` `mikroPx: 3` | 2 (AUGEN 2.9, FUND 119) | teilweise (1 → 3); im Bild oben weiter Sprenkel-Teppich |
| 30 | Brand-Riesenhalme 40 m · Bild `w3/brand-blick-bilder/paar-4o-jung.png` | 1 (FUND 52, „vermutlich") | Bild nicht gesehen, Wurzel geraten, kein Zweig |

## Die EINE begrenzende Entscheidung
Kein Fund wird ein sechstes Mal benannt: jede offene Zeile hängt ab heute als STUFE an genau EINER Klasse eines besetzten Zweigs (sie steht in
dessen Brief und Leser-Liste und stirbt im Commit seiner Landung) — oder sie fällt offen als TOT mit Grund. Kein neuer Schwarm, keine neue Karte,
bevor das Register geerntet ist.

## Der Schnitt
Stufen (die Klasse „Register ohne Leser" fällt ganz):
1. ERNTE: die sieben geheilten Funde oben (900-Kappe, Leib-Täter, Exit-Urteil, Wanduhr-Tag, Tiere-vor-Bild, `_annahmeN`, Portal-Ring) aus
   FUND-REGISTER.md löschen, je mit dem Commit, der sie heilte; Kopfzeile `:3` „Stand" auf das Datum der Ernte.
2. ZUORDNEN der 30 auf die fünf besetzten Klassen (UEBERGABE §4): Kleid `w28-leib-nah` ← 4, 8, 9, 19 · Stadt/Weg `w28-stadt-grammatik`,
   `w28-weg-koerper`, `w28-fassade` ← 5, 6, 7, 10, 27, 28 · Karte `w28-karte-stamm` ← 1, 20, 21 · Wiese `w28-wiese-fern` ← 2, 29 ·
   Licht (NEUE Klasse, einziger unbesetzter Bildfehler mit Gewicht) ← 3, 15, 16, 17, 18 · Ankunft-Kosten-Zeile ← 12. Je Brief: „diese FUND-Zeilen
   sterben mit deiner Landung".
3. SOFORT, je ein S-Schnitt ohne Klassen-Zweig (Gebot 4, kein Bild-Risiko): 13 `koerper-leib.js:1470` liest `state.worldMeta.seed` wie
   `vegetation-baum.js:1080` · 14 `foundry-core.js:2610/2719` liest `P.leafCol`/LC conifer statt Literal · 12 `blob:` in `index.html:35`
   (aus `w28-weltbild-kalt` bdb060ad, Datei `studio-bruecke.js` gegen `w28-platte-fein` gelandet z425 prüfen).
4. TOT, offen gestrichen: 22 (Text „Nachwache ABAB" aus dem Lande-Log, kurs-G #7), 30 (ohne Bild und Wurzel), 26 (kein Rezept trägt rund —
   bleibt im Register nur, wenn ein Rezept rund bekommt).
Leser-Liste: FUND-REGISTER.md (Koordinator), `pfadfinder-register.md` (Gedächtnis), Brief-Baustein `/tmp/claude/w3/brief-regeln.md`
(PFADFINDER-Zeile, nicht gelesen), Kopf `docs/PFLICHT-OFFEN.md` A (gate:betriebsgesetz liest die Datei). Für 13: `_menschAnkerFarben`
hat EINEN Leser-Pfad (Boot-Leib, Peer ohne Übergabe, Ofen-Vorrat, FUND 162) und ändert den Platten-Schlüssel des Leibs.
Kosten-Zeile: 0 neue Programme, 0 Dreiecke; 13 baut die Leib-Platte einmal neu (ein Boot), 12 macht Boots mit Spieler-Buch schneller (ungemessen).
Kriterien der Meisterkarte: lod.K4#1 Ist 2,26 % ↔ Soll < 2 % (Radeon, FUND 192) · lod.K1#1 Strauch 0,275 ↔ ≤ 0,22 (FUND 227) ·
vegetation.K1#1 −18,3 % ↔ ≤ 15 % (FUND 193) · mensch.K4#1 hoehleA 6,04–7,08 ↔ [−2, 6] (FUND 179) · pflicht C ohne Bild-Station (AUGEN §4) ·
pipeline.K4/ultiversum.K4 (12) — Stationen in `meisterkarte-quelle/punkte/stationen/` g2/g3 (nicht gelesen).

## Was schon liegt
- `w28-leib-nah` ace30e73 (WIP, Bildpaare `probe-post/w28-leib-nah/7–13`, nicht angesehen) · `w28-weg-koerper` b1ffbea3 · `w28-wiese-fern` 476a3ed9
  · `w28-karte-stamm` 9597ffb2 (z427 in Fahrt) · `w28-mp-boden` f97fe692 · `w28-stadt-grammatik` 156cc903 · `w28-fassade` b038852b ·
  `w28-weltbild-kalt` bdb060ad (Blob-CSP, 461 hinter) · `w28-ziel-plan-wip` 3005322c (Tätigkeit der Bewohner).
- Es fehlt: der Licht-Zweig (Himmel, Kontakt, Fell, Sonnenbahn, Nacht) — keiner existiert; die Ernte-Commits im Register.

## Ehrlich offen
- Nicht gelesen: die Wurzel des Mittag-Himmels; kurs-C, -D, -E, -F; AUGEN-/TIEFEN-REGISTER (nur die Karten); FUND-REGISTER Zeilen 163–257
  nur in den ersten 330 Zeichen; die PFADFINDER-Zeile im Brief-Baustein; die Bilder in probe-post/ und PM.
- „genannt" zählt nur die Dokumente, die ich gelesen habe, nicht die Chat-Protokolle; die echte Zahl ist größer.
- Widerspruch: TIEFEN 8 erwartet „Gras im Fußband −80 %" nach der Kappe — die Kappe fiel, ein Stadt-Bild danach habe ich nicht gesehen.
- Ob die sieben geheilten Funde auch im Bild geheilt sind, ist nicht gemessen (nur Code-Absenz).

## Rang
- Ernte + Zuordnen (Stufe 1–2): Wirkung im Takt 5 (jeder Schwarm beginnt sonst bei null) · S · Risiko: keins am Spiel, nur Doku in `koordination`.
- Licht-Klasse (3, 15–18): Wirkung im Bild 5 (der Himmel trägt jedes Bild) · M–L · Risiko: Programm-Text wächst (B-Kosten-Zeile Pflicht).
- S-Schnitte 12/13/14: Wirkung im Bild 2 (Haut je Welt, Nadel-Farbe), im Takt 3 (Platte mit Buch) · S · Risiko: 13 verschiebt Haut aller Default-Menschen.

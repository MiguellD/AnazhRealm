# Lesen (b): Tragwerk und Verband — main 18058dba

**Feld:** `fachwerk-core.js` (12 518 Z.; Kern: `HAUS` Z. 168–1800, Bau-Gesetz Z. 2121–2276, VERBAND_GESETZ Z. 1847) ·
`stamm/bau-teile.js` (3 135 Z.) · zum Abgleich gelesen: `schmiede-core.js` STOFF_GESETZ (Z. 2860–2962), `stamm/bau-buch.js`
`_failsUnderLoad` (Z. 1869) und PHYSIS (Z. 2592). Abkürzungen: fc = fachwerk-core.js, bt = stamm/bau-teile.js, bb = stamm/bau-buch.js, sc = schmiede-core.js.

**Kurzbefund.** Kein einziges Tragwerks-Maß des Hauses folgt aus Statik oder Stoff: Ständer, Schwelle, Rähm, Balkenlage, Sparren,
Pfetten, Riegel, Streben, Geschosshöhen und Fundament sind EIN Default-Block von Literalen (fc:170–182), den kein Rezept, keine
Kultur, kein Stil und kein Ort je überschreibt (Grep über das ganze Repo: 0 externe Schreiber). Stoff-Kennwerte mit Quelle existieren
(sc:2892–2893 Stein/Holz: ρ, E, σ nach CRC/Ashby; Euler-Knicken sc:2959), aber `fachwerk-core.js` liest sie an keiner Stelle
(Grep `STOFF_GESETZ|__schmiedeCore|tragSpannung`: 0 Treffer), und die einzige Statik im Spiel (bb:1869) schließt Studio-Bauten
ausdrücklich aus (bt:2490–2494). Aus dem Samen folgen nur Hülle und Figur (W, D, Geschosse, Neigung, Strebenfigur) als Wurf um
gesetzte Kultur-Mittelwerte. Der Stil tauscht Farbrollen, nie Maße: eine Klinker- oder Putzwand ist so dick wie ein Eichenständer (0,16 m, fc:678).

## (1) WAS TRÄGT — konsumierte Gesetze und ihre Leser

| Gesetz | Ort | Leser (gelesen) |
|---|---|---|
| `HAUS(THREE,mat,PARAMS)` — die Fabrik; Default-Maße | fc:168–182 | `stapelBau` fc:2734/2738/2740; `stufe0Bau` fc:6144; Labor worlds/fachwerk/fachwerk.js:102 |
| `stapelBau` — Turm-Stapel ab 12 Geschossen (11 + Rest) | fc:2731–2740 | `fragFuer` fc:3569/3571; `stufe0Bau` fc:6142; Maß-Bau fc:5835/5881 |
| `buildInstance` — die EINE Welt-Bau-Funktion | fc:6321 | Worker foundry-bruecke.js:892–893 |
| `fragFuer(B,stufe)` — Stufen 1/2/3 | fc:3564 | fc:2674, 6242, 6258; Labor fachwerk.js:87 |
| `levels` — Geschossfolge aus egH/ogH | fc:214 | eaveY fc:215 → ridgeY fc:216; geruest fc:471; wallSpec fc:491 |
| `axis()` — Ständer-Raster aus `bayMax` | fc:418–424 | postsRing fc:452–454; Balkenlage fc:467; wallSpec/Fenster fc:488–489 |
| `fundament()` — Sockelplatte, Keller | fc:426–449 | Subsystem-Liste fc:1765, Reihenfolge fc:1786 |
| `geruest()` — Ständer-/Rähm-Ring + Balkenlage | fc:458–474 | fc:1765; aus in DESTNUR/TURMNUR/MASSNUR/LOD1F fc:2296/2302/2304/2436 |
| `riegel()` / `streben()` / `gefache()` / `wandFelder()` | fc:649 / 660 / 691 / 678 | fc:1765; GLATT-Weiche fc:207 |
| `dachwerk()` — Pfetten, Sparren, Kehlbalken, Stuhl | fc:773–795 | fc:1765 (nur ROOFMODE 'sattel') |
| `vorkragung()` / `pilotis()` / `turm()` / `portikus()` / `veranda()` | fc:1585 / 1592 / 1682 / 1721 / 1554 | fc:1765 über `P.vorkragung` usw. |
| `bauRezept` + `_bauweiseWurf` — Samen × Kultur → W, D, Geschosse, Neigung | fc:2204–2231 | Welt-Dorf fc:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473; PRESETS fc:5775; Labor fachwerk.js:35, 628–629 |
| `bauProgramm` — Haushalt × Nutzung → Form | fc:2245–2276 | NUR wenn `haushalt` ≠ null (fc:2229) — einziger solcher Rufer: Labor fachwerk.js:629 |
| `grenzNeigung` / STIL_GRENZNEIGUNG | fc:160–166 | HAUS fc:208; bauRezept fc:2230 |
| `VERBAND_GESETZ.fachwerk/mauerwerk/naturstein` | fc:1847–1853 | Verbands-Zeile fc:1919; Fern-Teilung fc:1935–1937; Textur fc:1951, 1985; Wirt phyto-core.js:6022/6505 |
| (nicht im Haus) `_failsUnderLoad` — Euler/Druck aus STOFF_GESETZ | bb:1869–1918 | `_workshopPhysicsVerdict` werkstatt-vorschau.js:652 → `_werkGesetzSetzen` bt:2497 — überspringt Studio-Werke bt:2490–2494 |

## (2) DIE GRÖSSEN

G = GESETZT, F = FOLGT. „Anker" = was der Kommentar als Herkunft der ZAHL nennt.

| # | Name | Wert | Einh. | Ort | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | foundH Sockel | 0,55 | m | fc:178 | keiner | fc:211, 429–441 | G |
| 2 | egH Erdgeschoss | 2,55 | m | fc:178 | keiner | fc:214, 521, 971, 1364, 1503, 1555, 1628–1642 | G |
| 3 | ogH Obergeschoss | 2,35 | m | fc:178 | keiner | fc:214, 1598 | G |
| 4 | post Ständer | 0,16 | m | fc:179 | keiner | fc:220 (ps), 452–454, 678, 733, 1800 | G |
| 5 | sill Schwelle | 0,18 | m | fc:179 | keiner | fc:444–449, 491, 679 | G |
| 6 | raehm Rähm | 0,16 | m | fc:179 | keiner | fc:456–457, 471–472, 491, 731, 971 | G |
| 7 | balkenB Deckenbalken | 0,15 | m | fc:179 | keiner | fc:469–470 | G |
| 8 | balkenH Deckenbalken | 0,21 | m | fc:179 | keiner | fc:469–470, 1261, 1271 | G (Spannweite = volle Tiefe D bis 11 m, kein Unterzug) |
| 9 | spar Sparren | 0,10 | m | fc:180 | keiner | fc:780–781, 787, 795, 1319, 1416 | G |
| 10 | sparH Sparrenhöhe | 0,15 | m | fc:180 | keiner | 0 (Grep `P.sparH`: 0) | G, TOT |
| 11 | pfetteB | 0,14 | m | fc:180 | keiner | fc:776–777 | G |
| 12 | pfetteH | 0,18 | m | fc:180 | keiner | fc:775–777 | G |
| 13 | bayMax Feld | 1,7 | m | fc:181 | keiner | fc:420 → Ständer, Balkenlage, Fenster | G |
| 14 | ovEave Traufüberstand | 0,42 | m | fc:181 | keiner | fc:707, 1800; scripts/diag-haus-fern.cjs:300 | G |
| 15 | ovRake Ortgang | 0,32 | m | fc:181 | keiner | fc:707, 1800 | G |
| 16 | jetty | 0,0 | m | fc:171 | keiner | 0 (Grep `jetty`: nur fc:171) | G, TOT |
| 17 | kellerH | 2,40 | m | fc:213 | keiner | fc:213–214, 414, 431–434 | G |
| 18 | Kellerwand kwT | 0,30 | m | fc:432 | keiner | fc:433–434 | G |
| 19 | Kellerboden | 0,12 | m | fc:431 | keiner | fc:431 | G |
| 20 | Sockel-Überstand | 0,25 | m | fc:429, 437, 440 | „25 cm vor der Wand" (fc:439), ohne Grund | fc:439, 442 | G |
| 21 | Pilotis-Hub | 2,6 | m | fc:211 | Typ-Wort (Corbusier), keine Zahl | fc:211, 1593 | G |
| 22 | Pilotis-Stütze / Raster / Platte | 0,34 / 2,4 / 0,24 | m | fc:1593–1596 | keiner | fc:1595–1596 | G |
| 23 | Riegel | 0,10 × 0,13 | m | fc:651 | keiner | fc:654, 657 | G |
| 24 | Fensterstiel | 0,10 × 0,13 | m | fc:652 | keiner | fc:655 | G |
| 25 | Strebe | 0,10 | m | fc:661 | keiner | fc:663–668 | G |
| 26 | Kopf-/Fußband | H · 0,5 | – | fc:667–668 | keiner | fc:672 | G |
| 27 | Strebenfigur `brace` | andreas/k/mann/wild/none | – | KULTUR fc:2122–2153 | Kultur | fc:201, 663–666; Kultur je Baujahr-Pool fc:4435 | F (Samen → Kultur-Pool je Baujahr) |
| 28 | Gefach-Backstein | 0,32 × 0,15, Fuge 0,025, Dicke 0,085 | m | fc:641 | keiner | fc:641ff (infill) | G |
| 29 | Lehmfeld | 0,09 | m | fc:640 | keiner | fc:640 | G |
| 30 | Giebel-Mauer | 0,075 (GLATT: post) | m | fc:733 | keiner | fc:733 | G |
| 31 | Wanddicke der glatten Wand (Putz/Stein/Klinker/Glas) | = post 0,16 | m | fc:678 | keiner | fc:678–690 | G (stoffblind) |
| 32 | Brandwand Doppelhaus | 0,34 | m | fc:1773 | keiner | fc:1773 | G |
| 33 | Turmwand twT | 0,26 | m | fc:1683 | keiner | fc:1683ff | G |
| 34 | Innenwand t | 0,12 | m | fc:897 | keiner | fc:898 | G |
| 35 | Diele | 0,06 dick, 0,28 breit | m | fc:860 | keiner | fc:860–861 | G |
| 36 | Sparrenteilung | W/0,85 (≥ 3) | – | fc:778 | keiner | fc:779–781 | G |
| 37 | Kehlbalken-Lage | ≥ eaveY + 1,98 | m | fc:783 | Spielerhöhe PH 1,7 (Begehbarkeit, nicht Statik) | fc:784–787 | G (Wort-Anker) |
| 38 | Kehlbalken-Querschnitt | spar × 0,12 | m | fc:787 | keiner | fc:787 | G |
| 39 | Firststuhl-Stiel | 0,14 × 0,16, jeder 2. | m | fc:792–794 | „authentischer Stuhl-Abstand", ohne Quelle | fc:794 | G |
| 40 | Gratsparren | spar × 1,1 | – | fc:795 | keiner | fc:795 | G |
| 41 | Schwellrähm Giebel | 0,12 | m | fc:731 | keiner | fc:731 | G |
| 42 | Balkenkopf | 0,13 × (balkenH + 0,02) | m | fc:1261 | keiner | fc:1271ff | G |
| 43 | Holznagel | 0,035 × 0,135 | m | fc:1259 | keiner | fc:1259ff | G |
| 44 | Vorkragung ov | 0,45 | m | fc:1586 | „mittelalterl. Fachwerk" (Epoche-Wort, keine Zahl) | fc:1587–1588 | G |
| 45 | Vorkragung Brüstung / Knagge | 1,05 × 0,24; 0,1 × 0,18 alle 0,7 | m | fc:1588 | keiner | fc:1588 | G |
| 46 | Flügel: Raum-Modul / Tiefe | 3,3; 0,42 · W in [2,8; 4,2] | m | fc:513–515 | keiner | fc:515–523 | G |
| 47 | Flügel-Traufe | egH · 0,86 | – | fc:521 | keiner | fc:522 | G |
| 48 | Turm Seite / Höhe | clamp(0,22 W; 1,4; 2,2); + max(4,5; 2,0 · st) | m | fc:1683 | keiner | fc:1684–1686 | G |
| 49 | Portikus Tiefe / Säulen-r / Achse | 2,4; 0,20; W/2,6 | m | fc:1722, 1728 | „griech. Tempel" (keine Ordnung gelesen) | fc:1723–1730 | G |
| 50 | Veranda Tiefe / Pfosten | 1,5; min(2,6; 0,9 egH) | m | fc:1555 | keiner | fc:1556ff | G |
| 51 | Rundbau Lagenhöhe | egH für jede Lage | – | fc:1628, 1632, 1634, 1642 | keiner | dort | G |
| 52 | Geschoss-Deckel / Stapelnaht | 12 / 11 | – | fc:183, 2734 | keiner | fc:2734–2740 | G |
| 53 | W Breite | Kultur-W ± 1,1, ½-m-Raster, [5; 15] | m | fc:2208 | Kultur-Mittel | HAUS fc:220; Stadt fc:4437, 4439 | F (Samen × Kultur; Mittel G) |
| 54 | D Tiefe | Kultur-D ± 0,9, [4; 11] | m | fc:2209 | Kultur-Mittel | HAUS fc:220 | F (dto.) |
| 55 | storeys | Kultur-st (± 1,5 ab st ≥ 4) | – | fc:2210 | Kultur-Mittel | fc:214; Stadt fc:4441–4446 | F (Samen, Baujahr, wohl, Stadtlage) |
| 56 | pitchDeg | Kultur-pitch ± 2,5, [8; 62] | ° | fc:2207 | Kultur-Mittel | fc:208, 2230 | F (dto.) |
| 57 | STIL_GRENZNEIGUNG | modern 14 · huette 30 · stein 18 · glas 4 · klinker 22 · stroh 38 · alt 28 | ° | fc:160, 165 | „so flach trägt die Deckung", ohne Quelle | fc:208, 2230 | G (Wort-Anker) |
| 58 | KULTUR-Mittel pitch/W/D/st (32 Zeilen) | z. B. alemannisch 55/8/9/2 | °, m, – | fc:2122–2153 | Region im Label | `_bauweiseWurf` fc:2204 | G (Wort-Anker) |
| 59 | BAU_NUTZUNG `mass` (Schmiede 5,5×5, Rathaus ≥ 13×10 · 3 G., Wohnturm 6×6 · 6 G. …) | 16 Zeilen | m, – | fc:2184–2200 | keiner | fc:2227–2228 | G |
| 60 | Raumprogramm Wohnhaus | 20 + 20 · wohl | m²/Person | fc:2183 | keiner | fc:2248 (nur Labor-Pfad) | G |
| 61 | Parzellen-Deckel capK / capL | 1,3 · 1,6 · 0,55; ≤ 165 m²; 1,6 · 2,6 | – | fc:2256 | keiner | fc:2261–2268 | G |
| 62 | Stadt-Breitenfaktor | 0,84 + 0,30 · wohl; 0,80 + 0,38 · t | – | fc:4437, 4439 | keiner | fc:4437, 4439 | G |
| 63 | Stadt-Geschossfaktor | 1,85 − 1,45 · t; 7 + rnd·5; 6 + rnd·5 | – | fc:4441–4443 | „europäische Wahrheit", keine Zahl | dort | G |
| 64 | VERBAND fachwerk feldM / riegelM / staenderM / riegelStarkM | 1,7 / 0,85 / 0,16 / 0,13 | m | fc:1848 | „bayMax des Gerüsts" — als Literal kopiert | fc:1919, 1935–1937 | G (Zwilling) |
| 65 | VERBAND mauerwerk Stein / Höhe / Fuge | 0,24 / 0,071 / 0,011 | m | fc:1850 | keiner im Code (Zahl entspricht dem NF-Format, nicht genannt) | fc:1951; Wirt phyto-core.js:6022 | G |
| 66 | VERBAND naturstein | 0,46 × 0,28, Fuge 0,016 | m | fc:1853 | keiner | fc:1985 | G |
| 67 | Dachziegel im Bau | 0,26 × 0,34, Reihe 0,205 | m | fc:233 | keiner | fc:236–238 | G (Zwilling zu deckung 0,18/0,32 fc:1851) |
| 68 | Möbel-HOLZ spanMax / legK | weich 0,78/1,20 · hart 1,12/0,84 | m, – | fc:1121–1122 | „geringere/höhere Festigkeit", qualitativ | fc:1128, 1138, 1148 | G (Wort-Anker) |
| 69 | Tischbein | 0,056 · legK · (1 + 0,14 A) | m | fc:1128 | keiner | fc:1128ff | G |
| 70 | BRUECKE feldM (Jochfeld) | 4 | m | fc:4662 | keiner (lichtM: Wagenbreite) | fc:4725–4732, 7982 | G |
| 71 | STOFF holz E / σ_y / σ_B | 1,1e10 / 5e7 / 9e7 (ρ aus RHO_VON) | Pa | sc:2893, 2910 | CRC 97, Ashby (sc:2846) | bb:1892 (Werk) — fc: 0 | F (Messwert), im Haus ungelesen |
| 72 | STOFF stein ρ / E / σ_y | 2650 / 5e10 / 1,3e8 | kg/m³, Pa | sc:2892 | dto. | bb:1892 — fc: 0 | F, im Haus ungelesen |
| 73 | PHYSIS knick-/druckSicherheit / wallBraceRatio | 500 / 10 / 4 | – | bb:2592–2596 | Begründung „Vorkrümmung, Schiefstand" (bb:1860), keine Zahl | bb:1880, 1892 | G (Wort-Anker) |
| 74 | CLASSICAL_ORDERS Schlankheit / Joch | dorisch 7 / 2,25 · ionisch 9 / 2,4 | – | bt:2982–3005 | Säulenordnung (Kodifikation) | bt:1298–1299 — kein Spiel-Pfad (bt:1287), nur scripts/playtest/bau.cjs:329 | F (Ordnung), im Spiel TOT |
| 75 | Tempel-Modul D | 0,85 | m | bt:1296 | keiner | bt:1298–1299 | G, im Spiel TOT |

**Gegenrechnung des Lesers (nicht im Code, nur zur Einordnung):** Deckenbalken 0,15 × 0,21 bei Achsabstand 1,7 m (Zeile 13) und
angenommen 2,5 kN/m² ergeben Biegespannung 23,6 MPa bei D = 7 m und 58,3 MPa bei D = 11 m. Die Durchbiegung mit dem E des
STOFF_GESETZ (1,1e10) ist 104 mm bzw. 636 mm, erlaubt wären L/300 = 23 mm bzw. 37 mm (`node -e`). Das Spiel kennt diese Grenze nicht: Die Tiefe wächst
bis 11 m (fc:2209), der Balken bleibt 0,21 m.

## (3) ZWILLINGE UND TOTE

- **Fachwerk-Raster doppelt:** `bayMax 1.7` / `post 0.16` / Riegel 0,13 (fc:181, 179, 651) und `VERBAND_GESETZ.fachwerk {feldM 1.7, staenderM 0.16, riegelStarkM 0.13}` (fc:1848) sind kopierte Literale ohne Bezug aufeinander. Wird bayMax geändert, steht die Fernwand der Stufe 2 auf einem anderen Raster als die Nahwand.
- **Backstein doppelt, mit verschiedenen Werten:** Im Gefach baut das Spiel 0,32 × 0,15 (fc:641, fc:733), in der Verbandskarte 0,24 × 0,071 (fc:1850). Nah und fern liegen also zwei Steinformate.
- **Dachziegel doppelt, mit verschiedenen Werten:** Gebaut wird 0,26 × 0,34 / 0,205 (fc:233), in der Karte 0,18 × 0,32 (fc:1851).
- **Wanddicke fünffach, nirgends aus dem Stoff:** glatte Wand = post 0,16 (fc:678), Brandwand 0,34 (fc:1773), Kellerwand 0,30 (fc:432), Turmwand 0,26 (fc:1683), Innenwand 0,12 (fc:897).
- **Spannbreite W/D dreifach geklemmt:** Würfel [5; 15]/[4; 11] (fc:2208–2209), Raumprogramm [4,5; 15]/[4; 11] (fc:2269–2270), Regler PARAMS [6; 14]/[5; 10] (fc:5731–5732). Die Kultur gotisch D = 11 (fc:2151) liegt jenseits des Reglers.
- **Wohlstand doppelt, mit vereinfachtem Parallelpfad:** `bauProgramm` (fc:2245) ist das deklarierte Gesetz „Haushalt → Form". In der Welt rufen alle acht `bauRezept`-Stellen mit `haushalt = null` (fc:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473), damit läuft `bauProgramm` dort nie (fc:2229). Stattdessen würfelt das Dorf `wohl` (fc:4438) und skaliert W linear (fc:4439) bzw. hebt ein Geschoss (fc:4444). Nur das Labor ruft den Haushalt (worlds/fachwerk/fachwerk.js:629).
- **Fläche je Person doppelt:** 20 + 20 · wohl in BAU_NUTZUNG.wohnhaus (fc:2183) und in LEUTE_GESETZ `flaeche 20, wohlFlaeche 20` (fc:9526), zwei Literale für dieselbe Größe.
- **Portikus ohne Ordnung:** Der Säulenradius 0,20 und die Achse W/2,6 (fc:1722, 1728) sind frei gesetzt. `CLASSICAL_ORDERS` (bt:2982) leitet Säulen aus der Ordnung ab, hat aber keinen Spiel-Leser (bt:1287).
- **Rundbau-Zwilling der Geschossfolge:** `levels` verwendet egH/ogH (fc:214), der Rundbau dagegen nLev · egH (fc:1628, 1632).
- **Tote Felder:** `jetty: 0.0` (fc:171, 0 Leser repo-weit; die Vorkragung liest stattdessen `P.vorkragung` mit festem ov 0,45, fc:1586). `sparH: 0.15` (fc:180, Grep `P.sparH`: 0).
- **Statik geht am Haus vorbei:** `_werkGesetzSetzen` kehrt für Foundry-Preset und `studioGestalt` sofort zurück (bt:2490–2494), damit urteilt `_failsUnderLoad` (bb:1869, Euler aus STOFF_GESETZ) nie über ein Haus.
- **Holzart ohne Stoff:** Hart oder weich wählt ein Positions-Hash (`woodFor`, fc:1123), nicht Ort, Wald oder Epoche.

## (4) WAS DER SAMEN ERREICHT

| Eingang | kommt an? | Beleg |
|---|---|---|
| Samen (Instanz) | ja, aber nur Hülle und Ausfachung: W, D, st, Neigung (fc:2205–2210); Fenstertakt und OG-Putz (fc:479–480); Backstein- oder Lehm-Giebel (fc:733); Flügel-Lage (fc:516) | kein Querschnitt, keine Höhe, kein Raster liest `rnd` |
| Kultur (aus Samen + Baujahr-Pool) | ja: Mittelwerte von W/D/st/Neigung, Strebenfigur, Stil, Dachform (fc:2122–2153, 2211–2214; Pool fc:4435) | Kultur-Mittel sind Stellwerte ohne Quelle |
| Epoche / Baujahr | indirekt über den Kultur-Pool (fc:4435), Zinnen/Arkade über `band` (fc:2186), Stadthöhe nach Jahr (fc:4440–4443), Zierrat (fc:3538–3557) | kein Holzquerschnitt, keine Geschosshöhe und keine Wandstärke hängt am Jahr |
| Stoff (holz/stein/backstein/putz) | nein für Maße: `STILMODE.RM` tauscht nur die Farbrolle (fc:190–205); GLATT streicht das Gerüst (fc:207), die Wand bleibt 0,16 m (fc:678) | STOFF_GESETZ (sc:2860) hat 0 Leser in fc |
| Wohlstand | Welt: grober Zwilling (W-Faktor fc:4439, +1 Geschoss fc:4444); Gesetz `bauProgramm` nur im Labor (fachwerk.js:629) | Querschnitte und Geschosshöhen unberührt |
| Ort (Region, Dichte, Lage) | Region/Band nur in `mass`-Bedingungen (fc:2184, 2186); Dichte nur im Labor-Pfad (fc:2256); Stadtlage t9 skaliert st (fc:4441) | kein Baugrund, kein Klima, keine Last (Schnee/Wind) — nicht gefunden (gesucht: `schnee`, `wind`, `last`, `unterzug`, `lastpfad` in fc: 0 tragwerksbezogene Treffer) |
| Statik / Stoff-Kennwerte | nein | Grep in fc nach `E-Modul`, `Festigkeit`, `Biegung`, `STOFF_GESETZ`, `tragSpannung`: nur Möbel-Kommentar fc:1121 (qualitativ) und die geometrische Biegung des Verformungsfelds fc:270–279 |

**Schluss:** 75 Größen gesamt · 62 GESETZT ohne Zahlen-Anker (davon 2 tot, 3 nur in Labor/Playtest: #60, #61, #75) · 8 FOLGT (5 im Hausbau, alle nur Samen × gesetzte Kultur-Mittel; 3 Stoff-/Ordnungs-Zeilen mit Quelle, aber ohne Haus-Leser) · 5 GESETZT mit Wort-Anker ohne Zahlenquelle.

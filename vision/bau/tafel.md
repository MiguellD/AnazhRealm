# TAFEL — Stellwerte, Zwillinge, Details, Tote (Bau-Zensus, main 18058dba, nur gelesen)

Gelesen: die acht Lese-Blätter a–h ganz (vision/bau/lesen-*.md), das Muster vision/leben/entscheid.md (Form), CLAUDE.md
„Die goldene Definition“. Bilder: Bestand unter koordination/bericht/17xx–18xx und p3/n1711, p3/n1811, jedes zitierte mit dem
Read-Werkzeug angesehen. Kein Code gelesen außer über die Blätter — jede datei:zeile hier ist die des Blatts (Kürzel: FC =
fachwerk-core.js · SB = stamm/siedlung-bewohner.js · SW = stamm/siedlung-wege.js · ORT = stamm/siedlung-ort.js · KC = koerper-core.js ·
LAB = worlds/fachwerk/fachwerk.js). Blatt-Verweis „a#12“ = Blatt a, Zeile 12 seiner Größen-Tafel; „h“ = Blatt h (2), Parameter-Tafel.

## SUMME

Gezählt mit node aus den Zeilen von Teil 1 (Skript tafel-rows.cjs/tafel-gen.cjs im Scratchpad, nicht im Repo). Eine Größe, die in
mehreren Blättern steht, zählt EINMAL, in der Domäne, in der ihr Bild hängt.

| Domäne | Größen gesamt | GESETZT ohne Anker | GESETZT mit Anker | FOLGT |
|---|---|---|---|---|
| D1 Nutzung, Raumprogramm, Innenraum | 87 | 72 (21 Zeilen) | 11 | 4 |
| D2 Tragwerk, Geschosse, Wände | 57 | 52 (18 Zeilen) | 2 | 3 |
| D3 Öffnungen | 61 | 47 (17 Zeilen) | 5 | 9 |
| D4 Dach, Kamin, Rauch, Wasser | 68 | 54 (21 Zeilen) | 1 | 13 |
| D5 Stoffe und Farben | 402 | 385 (19 Zeilen) | 9 | 8 |
| D6 Stadtplan und Ort | 137 | 112 (22 Zeilen) | 17 | 8 |
| D7 LOD-Stufen und Ferne | 49 | 31 (6 Zeilen) | 13 | 5 |
| D8 Kultur-Tafel und Kern-Defaults | 21 | 16 (3 Zeilen) | 0 | 5 |
| **GESAMT** | **882** | **769** (127 Zeilen) | **58** | **55** |

**Abweichung von den Schlusszeilen der Blätter.** Die Blätter zählen zusammen 1 047 Größen (a 97 · b 75 · c 66 · d 84 · e 420 ·
f 153 · g 152; h zählt Parameter, 51, keine Größen) und 842 GESETZT ohne Anker (75 · 62 · 51 · 55 · 402 · 128 · 69). Hier stehen
882 Größen und 769 ohne Anker. Die Differenz kommt aus vier Quellen:
1. **Dubletten einmal gezählt** (der größte Teil): egH/ogH/foundH stehen in a, b, d, g, h; ovEave/ovRake in b, d, g, h; STADT_MASSEN in a, d, f, g;
   die Viertel-Grammatik in a und f; LEUTE_GESETZ in a, b, f; Region-Würfel in d, e, f; FENSTER_SCHLAF in c und e; glas/glasdunkel in c und e;
   die 19 Fabrik-Maße aus h sind alle schon in D2/D3/D4.
2. **Urteil verschoben, mit Grund:** b#57 STIL_GRENZNEIGUNG und b#58 KULTUR-Mittel („Wort-Anker“) stehen hier OHNE Anker — ein Etikett
   ohne Zahl ist kein Anker (d#6/d#2 urteilen ebenso). a#41–43 (wohl, Ring-Breite; a: FOLGT/Kommentar) und a#51–52 (Downtown, Halle;
   a: Epochen-Kommentar) stehen OHNE Anker wie in f#64–69 — die Konstanten selbst haben keine Quelle. REGION_HIST und EPOCHEN (e: 15
   GESETZT) stehen MIT Anker wie in f#55–56 (Historie). Die TEILS-Zeilen von c (#5, #34) zähle ich unter FOLGT, c#33 Giebelfenster unter
   GESETZT (wie d#60).
3. **Bündel anders geschnitten:** g#19 LOD_SCHIRM.fehler zählt g als 64, hier als 1 Block (EINE Messung, 64 Ablesungen); D1 zählt die
   BAU_NUTZUNG-Zeilen einzeln (11 ohne + 6 mit Kommentar), b#59 als 1.
4. **Blatt a in sich:** die Tafel a trägt 17 Zeilen mit Kommentar-Anker, wenn #54 (Kirchen-Marke, „Region/Jahr (Wahl), Maß keiner“)
   mitzählt; die Schlusszeile a nennt 16/75 — sie zählt #54 ohne Anker. So auch hier.

## TEIL 1 — STELLWERTE OHNE ANKER

Je Zeile: Name · Wert · datei:zeile · Leser · was im Bild daran hängt · n (Zahl der Größen) · Blätter. Darunter je Domäne die Größen
MIT Anker und die, die FOLGEN (nur benannt, sie sind keine Stellwerte).


### D1 Nutzung, Raumprogramm, Innenraum — 72 ohne Anker in 21 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| wohnhaus.geschosse · grundriss | [1; 4] · I/L | FC:2183 | FC:2257, 2260 (nur Labor) | nichts — nur Labor | 2 | a#1–2 |
| Fläche je Person (zweimal geschrieben) | 20 + 20·wohl m² | FC:2183; FC:9526 | FC:2248 (Labor); FC:9536 → SB:779, 839 | Zahl der Bewohner je Haus | 3 | a#3, 4, 37 · b#60 · f#150 |
| LEUTE_GESETZ.max | 12 Pers. | FC:9526 | FC:2274, 9531, 9537 | Deckel der Bewohner | 1 | a#38 · f#150 |
| BAU_NUTZUNG.mass ohne Kommentar (gasthaus, schmiede, zunfthaus, pfarrhaus, kapelle, torhaus, zeughaus, werkstatt, backhaus, speicher, patrizierhaus) | 11 Maß-Zeilen, z. B. schmiede 5,5 × 5 m · 1 G. | FC:2184–2200 | FC:2227 ← 4382, 4468 | Außenmaß der Rollen-Bauten (Grammatik-Stadt) | 11 | a#5–21 · b#59 · h (arkade/turm/zinnen) |
| Packer-Konstanten capK · Deckel · capL · F0 · Mindestfuß · W/D-Klammer | 1,6/1,3/0,55 · 165 m² · 2,6/1,6 · 20 m² · 0,45·F0 · 4,5–15/4–11 m | FC:2255–2270 | nur Labor (LAB:629) | nichts in der Welt | 6 | a#22–25, 30, 31 · b#61 |
| Grundriss-Schwellen hof/U-T/kreuz/L-Flügel, Anbau-Zelle | ≥20/≤42 · ≥24/≤30 · ≥36/≤45 · ≥8/≤15 · 18 m² | FC:2261–2271 | unerreichbar | nichts | 5 | a#26–29, 32 |
| Los-Würfel Keller · Anbau · arm · Balkon · Grundriss | 0,35 · 0,25 · wohl < 0,72 · wohl > 0,95 ∧ 0,5 · I 0,85/0,68 | FC:4446–4449 | FC:212, 185, 6138 … | Keller, Anbau, Balkon, leere Innenräume | 5 | a#46–50 · h (keller, annexN, balcony, arm) |
| +1 Geschoss | städtisch ∧ wohl > 0,9 ∧ st < 4 | FC:4444 | Haus-Bau | Höhe reicher Stadthäuser | 1 | a#44 |
| Stadtkörper | st·(1,85 − 1,45·t); Turm 7–11 G. | FC:4440–4443 | Haus-Bau | Höhe zur Stadtmitte | 1 | a#45 · f#67 · b#63 (dort Wort-Anker) |
| Burg-Maß · wohl im Burg-Viertel | 13–14 × 11 m, 3 G. · 1,2 | FC:4473–4474, 4399 | Haus-Bau | Burg | 2 | a#53, 57 |
| Kirchen-Marke je Region | barock 14 × 11, gotisch 7 × 9 … | FC:4461 | FC:4462 | Kirche | 1 | a#54 |
| Scheunen-Quote · Scheunen-Maß · Hof-Anbau-Neigung | .75/.55/.28/.06/.04/.03 · min(7, min(W,D)−2) · max(28°, p−6) | FC:4476–4481 | FC:4478 | Scheunen je Ortsklasse | 3 | a#55, 56 · f#72 · d#9 |
| Viertel-Grammatik: herrAb, Grund-Satz Gasthaus/Schmiede, Kirchhof-, Markt-, Handwerk-Lose, je-Folgen, Wohnturm-/Patrizier-Regel, fremde Kulturen | 49 · ab 8/10 Losen · [2,3/4] · 4+klemm(0,07n) · … · je 4/9/7/5 | FC:4322–4340 | FC:4384–4392, 4468, 4470 | welcher Bau-Typ auf welchem Los | 11 | a#59–69 · f#71, 74–79 |
| Raum-Gewichte · Mindest-Raumtiefe · Herd-Schnitt · Raum min | [2,3; 1,3] … · max(1,75; 3,7/n) · 1,35 · 1,2 m | FC:601–621 | FC:617 | Raumteilung nah | 4 | a#75–78 |
| Innenwand · Innentür | 0,12 · 1,0 × 2,0 m | FC:897 | FC:898–905 | Innenwände Stufe 0 | 1 | a#80 · b#34 |
| Möbel-Würfel Kammer · Stube · Küche | Schrank 0,78 … Hocker 0,5 | FC:1232–1240 | FC:1248 | Einrichtung | 3 | a#81–83 |
| Möbel-Maße · Tischbein | Bett 1,95 × 1,0 … · 0,056·legK·(1+0,14A) | FC:1127–1206 | FC:1234–1240 | Möbel | 2 | a#84 · b#69 |
| Keller-Inventar · Möbel aus | 2 Regale … · st ≥ 6 ∨ arm | FC:1254; FC:6138 | FC:1250; stufe0Param | Keller; leere Häuser | 2 | a#87, 88 |
| Herd-Körper | 1,5 × 1,1 m | FC:589, 592 | FC:590, 922, 1244 | Herd, Kamin-Lage | 1 | a#89 · d#70 |
| Hof (nur Labor): gap, Frontleben, Holzstapel, Beete/Leine, Efeu, Tonne | ≥ 0,6 m · 0,38 · arm ∨ < 1890 · 0,62/0,45 · < 1800 · > 1930 | FC:3531–3557 | nur Labor (LAB:88, 773) | nichts in der Welt | 6 | a#90–95 · h (4) |
| Angebot je Rolle (TAGES_GESETZ) | wohnhaus besuch 1 · gasthaus 2/8/8 … | KC:5177–5187 | SB:784 → KC:5243 | Tageswege der Bewohner | 1 | a#96 |

Mit Anker (11): rathaus.mass (a#7) · kaufhaus.mass (a#8) · kontor.mass (a#9) · bergfried.mass (a#13) · gerberei.mass (a#19) · wohnturm.mass (a#20) · LEUTE_GESETZ.nutz 0,7 (a#35) · LEUTE_GESETZ.flaeche 20 „Kammer der Armen“ (a#36) · LEUTE_GESETZ.rolle (a#39) · Möbel-HOLZ spanMax/legK (a#85 · b#68) · Bewegungsfläche 1,05 „DIN“ ohne Nummer (a#86).  
FOLGT (4): Programm-Ausgabe (a#33, Labor) · hp.leute (a#34, Labor) · Leute je Haus leuteVon (a#40) · Raumfunktion aus Herd-Lage (a#79).

### D2 Tragwerk, Geschosse, Wände — 52 ohne Anker in 18 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| foundH Sockel | 0,55 m | FC:178 | FC:211, 429–441 | Sockel, Traufhöhe | 1 | b#1 · d#13 · g#1 · h |
| egH · ogH | 2,55 · 2,35 m | FC:178 | FC:214 → eaveY 215 | Traufhöhe, Lage der Fenster | 2 | a#70–71 · b#2–3 · d#14 · g#2–3 · h |
| Holzquerschnitte post · sill · raehm · balkenB · balkenH · spar · sparH · pfetteB · pfetteH | 0,16 · 0,18 · 0,16 · 0,15 · 0,21 · 0,10 · 0,15 · 0,14 · 0,18 m | FC:179–180 | FC:452–795 (sparH: 0 Leser) | Ständer, Balken, Sparren nah | 9 | b#4–12 · d#51 · h |
| bayMax Feld | 1,7 m | FC:181 | FC:420 → Ständer, Balkenlage, Fenster | Fachwerk-Raster, Fensterzahl | 1 | b#13 · c#10 · h |
| jetty | 0,0 m | FC:171 | 0 Leser | nichts (tot) | 1 | b#16 · h |
| Keller: Höhe · Default an · Wand · Boden | 2,40 · an · 0,30 · 0,12 m | FC:212–213, 431–432 | FC:390, 414, 433 | Keller | 4 | a#72–73 · b#17–19 |
| Sockel-Überstand | 0,25 m | FC:429, 437, 440 | FC:439, 442 | Sockelkante | 1 | b#20 |
| Pilotis Hub · Stütze/Raster/Platte | 2,6 · 0,34/2,4/0,24 m | FC:211, 1593–1596 | FC:1593–1596 | nie in der Welt (keine Kultur setzt pilotis) | 2 | b#21–22 · h |
| Riegel · Fensterstiel · Strebe · Kopf-/Fußband | 0,10×0,13 · 0,10×0,13 · 0,10 · H·0,5 | FC:651–668 | FC:654–672 | Fachwerk-Figur nah | 4 | b#23–26 |
| Gefach-Backstein · Lehmfeld · Giebel-Mauer | 0,32×0,15/0,025/0,085 · 0,09 · 0,075 m | FC:640–641, 733 | infill, Giebel | Gefach nah | 3 | b#28–30 |
| Wanddicken glatt · Brandwand · Turm · Loch-Wand | = post 0,16 · 0,34 · 0,26 · 0,22/0,24/0,26 m | FC:678, 1773, 1683, 1513, 1534 | dort | Laibungstiefe (stoffblind) | 4 | b#31–33 · c#44 |
| Diele | 0,06 × 0,28 m | FC:860 | FC:860–861 | Boden Stufe 0 | 1 | b#35 |
| Dachstuhl-Teile: Sparrenteilung, Kehlbalken-Querschnitt, Firststuhl-Stiel, Gratsparren, Schwellrähm, Balkenkopf, Holznagel | W/0,85 · spar×0,12 · 0,14×0,16 · spar×1,1 · 0,12 · 0,13×… · 0,035×0,135 | FC:731–795, 1259–1261 | dort | Dachwerk Stufe 0 | 7 | b#36, 38–43 |
| Vorkragung ov · Brüstung/Knagge | 0,45 · 1,05×0,24, 0,1×0,18 alle 0,7 m | FC:1586–1588 | FC:1587–1588 | Vorkragung | 2 | b#44–45 |
| Flügel: Modul/Tiefe · Traufe · First | 3,3; 0,42·W · min(egH·0,86; eaveY−0,8) · ≤ eaveY−0,3 | FC:513–521 | FC:515–523, 1411 | Flügel | 4 | b#46–47 · d#61–62 |
| Turm · Portikus · Veranda · Rundbau-Lage | clamp(0,22W;1,4;2,2) · 2,4/0,20/W/2,6 · 1,5 · egH je Lage | FC:1555, 1628, 1683, 1722 | dort | Anbauten | 4 | b#48–51 |
| Geschoss-Deckel / Stapelnaht | 12 / 11 | FC:183, 2734 | FC:214, 2734–2740 | Turmhäuser | 1 | b#52 · g#8 |
| Tempel-Modul D | 0,85 m | bau-teile.js:1296 | kein Spiel-Pfad | nichts (tot) | 1 | b#75 |

Mit Anker (2): Kehlbalken-Lage ≥ eaveY+1,98 (Spielerhöhe, b#37 · d#52) · PHYSIS knick-/druckSicherheit/wallBraceRatio (b#73).  
FOLGT (3): STOFF holz E/σ (b#71, im Haus ungelesen) · STOFF stein ρ/E/σ (b#72, im Haus ungelesen) · CLASSICAL_ORDERS (b#74, im Spiel tot).

### D3 Öffnungen — 47 ohne Anker in 17 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| winEG/winOG off · ch | 0,95/0,95 · 0,80/0,92 m (modern 1,18/1,55 · 1,02/1,45) | FC:476 | FC:491–495 | Brüstung 0,655/0,50, Sturz 1,605/1,42 m — unter Augenhöhe 1,7 | 4 | c#1–4 |
| Mindest-Feldbreite · Achs-Sperre · Fenstertakt | 0,98 · 0,28 m · rnd < 0,5 → 1/2 | FC:478–485 | FC:485 | Zahl der Fenster je Wand | 3 | c#6–8 |
| winW-Fallback (praktisch tot) | min(hi−lo−0,3; 1,1) | FC:631 | FC:634 … (nur ohne win.wd) | keins | 1 | c#12 |
| Sturz · Fensterbank · Pfosten | (w+0,2)×0,10×0,18 · (w+0,22)×0,10×0,24 · 0,10×(h+0,1)×0,18 | FC:1081–1087 | fensterAt | Rahmen 5–6 cm vor der Wand, keine Laibung | 3 | c#14–16 |
| Flügel-Öffnung nach AUSSEN | 0,62 rad | FC:1084, 1089 | strahlFluegel FC:339; Zwilling FC:2788 | die graue Tafel vor jedem Fenster | 1 | c#17 |
| Bogen-Spann · Bogen-Deckel | w·0,58, +0,12 · 0,22 m | FC:1080–1086 | bogenRahmen FC:1049 | Bogenfenster | 2 | c#18–19 |
| Flügel-Rahmen · Kreuz · Scheibe | 0,06/0,05 · 0,04×0,045 · 0,025, −0,012 m | FC:1010–1020 | windowSash | Flügel und Scheibe | 3 | c#20–22 |
| FENSTER_SCHLAF · Schlaf-Raster | 0,45 · 0,25 m | FC:2751–2756 | fensterSchlaeft FC:2758 | 45 % der Fenster opak dunkel | 2 | c#25–26 · e#98 |
| LICHT_GESETZ.fenster | 2800 K · abend 0,42 · nacht 0,85 | FC:6433 | stoff-material.js:713, 2100 | Fensterglut nachts | 1 | c#27 |
| Möbel-Freizone vor Fenster | 0,40 m | FC:634 | addCircR 635 | Möbel-Lage | 1 | c#28 |
| Französischer Balkon | stein ∧ pitch ≥ 45: H 1,0 · vor 0,20 · wd+0,5 · Stab 0,16 | FC:1092–1096 | — | Balkongitter | 1 | c#32 |
| Teilbau-Fenster: Anbau, Flügel-Traufe, Flügel-Giebel, Hof-Arm, Terrasse, Turm, Rundbau, Tambour | 8 eigene Maß-Sätze, z. B. Anbau 0,8 × 0,55 | FC:1277–1754 | je Rufer | elf Fenster-Antworten auf eine Frage | 8 | c#35–42 |
| Wand-Ausfachung um die Öffnung | Lehm 0,06 · Backstein 0,085 · GLATT 0,16 m | FC:640–644, 678 | gefache FC:702–704 | Laibungstiefe | 1 | c#43 |
| Türen: doorW×doorH, Türstock/Sturz, Oberlicht, Haustür offen, Hintertür, Balkontür, Flügel-Durchgang, Flügel-Giebeltür, TUER_GESETZ, Anbau-Tor, Turm-Portal, Terrassentür | 1,1×2,05 · … · 1,15 rad · … · 1,95 rad/0,5 | FC:181, 968–991, 1373–1378, 1612, 1686, 1797; porta-core.js:1695 | siedlung-tor.js:719, 826, 841 | Türen | 12 | c#45–56 · h (doorW, doorH) |
| Fern-Scheibe/Glas/Kreuz vor der Wand · Fern-Rahmen-Kasten | +0,01/+0,02/+0,03 · (w+0,2)×(h+0,2) | FC:2806–2812 | fensterFern | Fern-Tafel 11 cm vor der Wand | 2 | c#61–62 |
| Innenkörper L1 | Einzug 0,55 · Höhe eY−0,25 | FC:3580–3584 | bakeLOD FC:3585 | graue Fläche hinter dem Loch | 1 | c#64 |
| PROXYHAUS-Fenster (nur Labor) | 0,85 × 1,2 × 0,1 | FC:4553–4557 | LAB:52, 59 (nie gerufen) | nichts | 1 | c#66 |

Mit Anker (5): RAHMEN_TIEFE 0,10 (c#57) · SCHEIBE_RAND 0,06 (c#58) · KREUZ 0,02 (c#59) · FLUEGEL_LAGE cos/sin 0,62 (c#60) · INNEN_DAEMMER 0,92 gemessen (c#63 · e#97).  
FOLGT (9): Symmetrie (c#9) · Fenster-Sockel yLo (c#11) · Ort der Öffnung (c#13) · Kamin-Korridor (c#29) · Anbau-Okklusion (c#30) · Flügel-Dach-Okklusion (c#31) · Raum-Durchlass 1−0,42 (c#65) · TEILS: Fensterbreite, Kappe 1,05/0,34 gesetzt (c#5) · TEILS: Gaube-Fenster (c#34).

### D4 Dach, Kamin, Rauch, Wasser — 54 ohne Anker in 21 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| pitchDeg Default | 50° | FC:171 | FC:208 (vom Rezept überschrieben) | Studio-Grundhaus | 1 | d#1 · h |
| Neigungs-Streuung · Rezept-Klemme · HAUS-Deckel | ±2,5° · 8–62° · 62° | FC:2207, 208 | FC:216 | Dachneigung | 3 | d#3–5 · g#6 |
| STIL_GRENZNEIGUNG + alt | modern 14 · huette 30 · stein 18 · glas 4 · klinker 22 · stroh 38 · alt 28° | FC:160, 165 | FC:208, 2230 | flachste Dächer je Stil | 7 | b#57 (Wort-Anker) · d#6–7 · g#7 |
| ovEave · ovRake | 0,42 · 0,32 m | FC:181 | FC:707, 1800 → 3086–3087 | Dachrand jedes Hauses aller 32 Kulturen | 2 | b#14–15 · d#18–19 · g#4–5 · h |
| Quergiebel eOv/vOv · Kreuzdach zOuter | 0,32/0,30 · +0,3 m | FC:1391, 1411 | FC:1393–1424 | Flügeldächer | 2 | d#20–21 |
| hip Default | 0 | FC:172 | FC:224, 708, 1800 | Satteldach als Regel | 1 | d#23 |
| Sonderdächer Pyramide · Mansard · Kegel · Schmetterling · Rundbau-Spitze | max(2, W·0,42) · 0,55/0,45 · rad·1,8 · eaveY−0,3 · rad·1,3/1,7 | FC:1629, 1713–1718 | nur Labor (dachTyp nie gesetzt) | nichts in der Welt | 5 | d#29–33 |
| Schwung-Hub | 1,35·curve, Exponent 2,2 | FC:272/274 (Zwilling 3034/3038) | Deform-Feld | geschwungene Dächer (2 Kulturen) | 1 | d#35 |
| Ziegel tw/tl/tt/cs · Lift | 0,26/0,34/0,03/0,205 · 0,08/0,10 m | FC:233, 839 | alle Deckungs-Aufrufe | Ziegelreihen nah (auch für Stroh, Schiefer) | 2 | b#67 · d#36–37 |
| Unterdach · roofY-Offset · Firstziegel · Windbrett | 0,055 · 0,13 · 0,16×0,24 · 0,13 m | FC:724, 805, 849, 855 | Bild | Dachkanten | 4 | d#42–43, 45–46 |
| Traufrinne Haupt · Flügel/Quergiebel · Kehlblech | 0,11×0,13 +0,09 · 0,13×0,11/0,12 · 0,26 m | FC:837, 1399, 1408, 1415 | nur Bild (Rolle 'dunkel') | Rinne ohne Wasser, kein Fallrohr | 3 | d#47–49 |
| Treppengiebel Stufe/Sims | 0,42 / 0,13 m | FC:766 | Bild | Treppengiebel | 1 | d#50 |
| Kniestock | 1,15 m | FC:887 | FC:887 | Dachgeschoss | 1 | d#54 |
| Gaube: Bedingung · Lage (Samen) · Breite · Tiefe/Rücklage/Mindesthöhe · Zahl | !modern ∧ hip<0,45 ∧ D>5,5 · ((seed%5)−2)·0,5 · clamp(W·0,16;1,15;1,6) · 1,0/−0,22D/0,85 · ≤ 1 | FC:256 | dachwerk FC:796, 838 | eine Gaube oder keine | 5 | d#55–59 · c#34 |
| Giebelfenster | hip<0,6 · Δ>1,25 · w 0,8 · h 0,66 · cy min(0,95; 0,42Δ) | FC:713–714 | giebel FC:729, Licht 1793 | Giebelfenster | 1 | d#60 · c#33 (dort TEILS) |
| Anbau-Pult Gefälle · Anbau-Traufe · Anbau-Breite (Samen) | 0,20 (≈ 11,3°) · baseY+2,18 · 2,9–3,7 m | FC:538–541 | FC:1278 | Anbau-Dach unter jeder Grenzneigung | 3 | d#64–66 |
| Balkon-Pultdächlein | yF+2,05, Abfall 0,35 m | FC:1450–1452 | Bild | Balkondach | 1 | d#67 |
| Kamin: Existenz · Herd-Lage (Samen) · Kopf über First · STACK_W · Verwahrung/Kopfplatte | 1 je Haus · (chS−0,5)·1,7 · +0,9 · 0,84 · +0,22/+0,14 m | FC:219, 586–592, 919–930 | chimney FC:932 → Rauch | Kamin, Küche folgt ihm (FC:588) | 5 | d#68–69, 71–73 |
| RAUCH_GESETZ · Rauch immer an · RAUCH_BILD | 26 Teilchen … · ohne Tag/Bewohner · 8 / 160 m | FC:11239–11250; SB:95–107, 3871–3872 | SB:80–107 | jeder Kamin raucht mittags | 3 | d#75, 77–78 |
| NAESSE dachPlätze/Umkreis/Schritt · dachArten | 8 / 64 / 4 · marktstand, brunnen, gate | stoff-material.js:3793–3796 | stoff-dach.js:170, 269 | Regenschutz-Abfrage | 2 | d#80–81 |
| PROXYHAUS Geschoss/Überstand/Kamin | 2,75 · 0,45 · x=W·0,24 | FC:4542, 4559, 4565 | nur Labor | nichts | 1 | d#83 · h |

Mit Anker (1): NORM.kopfSpar 1,90 „SIA 500 / DIN 18065“ (d#53 · a#74).  
FOLGT (13): ridgeY (d#10) · mS (d#11) · eaveY (d#12) · Treppengiebel → hip 0 (d#25) · flacher Stil → hip 0 (d#26) · ROOFMODE-Wahl (d#27) · Deckungs-Stoff je Stil (d#39) · Dachtrim-Stoff (d#41) · Traufabwurf (d#44) · Kreuzdach eYw/rYw (d#63) · Rauch-Spitze (d#74) · Rauch-Wind (d#76) · Decken-Höhe (d#79).

### D5 Stoffe und Farben — 385 ohne Anker in 19 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| Rollen-Block: 27 Stoffe × Farbe · Rauheit · Metall · Emissiv · Deckkraft | z. B. holz 0x5a4632 r .88 · glas 0x33576a r .15 opak .42 · glasdunkel 0x2b4457 opak .92 | FC:2065–2091 | _colFor FC:2325; foundry-bruecke.js:671 | jede Hausfarbe, jede Scheibe | 85 | e (Rollen-Block) · c#23–24 |
| DEFCOL (Byte-Kopie des Rollen-Blocks) | 15 Hex | FC:2119 | _colFor, tintM | Rückfall-Farbe | 15 | e |
| KULTUR.col (32 Kulturen) | 99 Hex | FC:2122–2153 | _bauweiseWurf FC:2215 → bakeLOD | Palette je Kultur, ortsblind | 99 | e · d#40 |
| STILMODE.RM | 7 Stile × Rollentausch | FC:190–197 | HAUS-Bau | Putz statt Holz usw. | 7 | e |
| VERBAND mauerwerk versatz · ton · fuge · grund | 0,5 · [0,84 0,3] · 0xb7b0a2 · 0x964e3e | FC:1850 | verbandZeilen 1913 | Backstein fern | 4 | e |
| VERBAND deckung (Biberschwanz) | 0,18 · 0,32 · 2 · 1 · 3 · 0,27 · 0,5 · [0,82 0,32] · 0x9c4a35 | FC:1851 | verbandZeilen 1914, texDach 1963 | EIN Deckungsraster für jedes Dach | 9 | e · d#38 · b#67 |
| VERBAND putz (Welt: Identität, zugWelt 0) | 5200 · [0,86 0,2] · … · zugWelt 0 | FC:1852 | nur Labor wirksam | kein Korn, kein Zug | 10 | e |
| VERBAND naturstein | 0,46 × 0,28, Fuge 0,016 … | FC:1853 | verbandZeilen 1917 | Sockel-Quader | 7 | e · b#66 |
| VERBAND fachwerk feldM/riegelM/staenderM/riegelStarkM | 1,7 / 0,85 / 0,16 / 0,13 m (Kopie bayMax/post) | FC:1848 | verbandZeilen 1919, _wandLage 1929 | Fachwerk ab Stufe 2 | 4 | e · b#64 |
| pxJeM · texDach-Literal + 5 Karten-Samen | 128 px/m · 0x803a28 · 7/11/13/17/23 | FC:1849, 2063 | Labor-Karten | Labor | 7 | e |
| VERBAND_WELLE | [1,7 0,73 0,5] · 1,3 · 2,065 | studio-stoff.js:896 | studio-stoff.js:197–198 | Unruhe der Reihen | 3 | e |
| NOISEAMP | 18 Rollen 0,02–0,08 | FC:2320 | FC:2426, 2468 | Lage-Rauschen der Farbe | 18 | e |
| woodTint · Balken-Licht-Boden · Kontakt-AO · INNEN_HOLZ · tintM blockholz · _wandFaktor-Klemme | 5 · ≥ 0,14 · 0,76/2,6/4,2 · 5 · ×1,4 · 0,25–1,7 | FC:267, 2318–2346, 2162, 2944 | Bake | Holz-Patina, Ecken-Dunkel, Innenholz | 17 | e |
| STEIN_GESETZ übrige + farbe | 15 Werte · granit 0x8e939a, sandstein 0xb59a74, pflaster 0x70747a | porta-core.js:302–304 | SW:1334, 1590 | Pflaster, Tor-Stein | 18 | e |
| WEG_GESETZ.ton | fahr .84 · rinne .72 · bord 1,12 · flanke .62 · kant .8 · schatten .42 | FC:10099 | SW:1376 ff. | Wegbord | 6 | e |
| Gestalt-Paletten ausFarben + AUS_PLANE + NATURTUCH · tuch/ware | 42 · 4 | FC:8886–8900, 6535–6536 | ausHuelle FC:8879 | Marktstand, Laterne, Grabstein | 46 | e |
| AUS_SILBER · FRISCH · ROST · BELAG · MOOS_NORD · RUSS | 6 lineare Tripel | FC:6845, 6861–6865 | Werke mit verwitterung | Werke, nie Häuser | 6 | e |
| WERK_ALTER · ALTER-Tage | tauTage 40 … seh {stoff→stein} · 8 Tage-Werte | siedlung-satz.js:1971–1981; bau-vorlagen.js:1685–1690 | _satzAlter, _werkAlter | jedes Haus altert als Stein | 17 | e |
| Zaun-Holz · GLANZ_RAUHEIT · Werkstatt-Stoffe · STOFF_GESETZ glas | 0x6a4e32 · [0,25 0,45] · 3 Hex · 0,05 | SW:2731; welt-licht.js:880; bau-vorlagen.js:1756–1773; schmiede-core.js:2924 | dort | Zaun, Glanz, Werkstatt | 7 | e |

Mit Anker (9): Mauerwerk steinM 0,24 NF (e#76 · b#65) · Mauerwerk hoeheM 0,071 NF (e#76) · Mauerwerk fugeM 0,011 NF (e#76) · sRGB→linear IEC 61966-2-1 (e#86) · kopfstein steinM DIN EN 1342 (e#99) · kopfstein fuge DIN 18318 (e#99) · ALTER.holz USDA (e#107) · ALTER.eisen FeO(OH) (e#108) · STOFF_GESETZ rauheit eisen MERL (e#115).  
FOLGT (8): Verband-Zeilen der Welt (e#85) · Fugen-Ton (e#87) · innenTon (e#93) · wandTon (e#95) · ALTER.stein Moos nord (e#109) · ALTER.stein Flechte (e#109) · ALTER.stein Moos lauf (e#109) · Alters-Tempo je Ort (e#111).

### D6 Stadtplan und Ort — 112 ohne Anker in 22 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| Zelle und Größe: cellM, rarity, nHMin, nHSpan, reichM kern/jeWurzel, Anker-Jitter, Epochen-Legende, GROESSE_N, GROESSE_WAND, GROESSE_BAND | 256 m · 2 · 8 · 10 · 30/22 m · ±0,25 Zelle · jede 3. · 6…220 · 500 · 8…141 | FC:3662–3722, 4147 | FC:3702–3769; ORT:1449 | wo und wie groß ein Ort ist (Hash, nicht Gelände) | 11 | f#1–4, 8–14 · g#45 |
| STADTMAUER wand/krone/turm-dach · FUSS | 5,6/1,6/0,6 · 5,9/0,7/2,0 · 3,6×8,4 … · 1,5 m | FC:3687–3690; siedlung-bauten.js:3432 | SW:2747, 2752 | Stadtmauer | 4 | f#15–18 |
| STADT_FUNKTION schritt · rest | 1 · 8 | FC:3818 | ORT:1499; FC:3928 | Kachel-Stadt | 2 | f#20–21 |
| STADT_NETZ tore · spiel · torLuecke · mauerInnen · turmJe | 5 · 0,4 · 3,5 · 2,4 · 42 m | FC:3819 | FC:3830–4046 | Netz der Kachel-Stadt | 5 | f#22–23, 25–27 · g#46 |
| Netz-Schritt DS · Nebenstraße | 3 m (dreimal) · strasseW·0,78 (dreimal) | FC:3845/5263/5362 · 3857/5297/5322 | dort | Straßenbreite | 2 | f#28–29 |
| STADT_FORM übrige 12 | spiel 0,5 · kleinTeil 0,065 · hoch 3,3/0,3 · 2/1,6 · mauerTeil 0,55 · ton 0,2/3/16 · Rampe · schlank 1,5 · stab 2 · breit/tief 7,5/11 | FC:3892, 3966 | FC:3928–4027, 4492–4494 | Höhe, Ton, Breite der Kachel-Stadt | 10 | f#33–42 · g#47 |
| DORF_NORM gap · strasseW · laneW · gehweg · budget (tot) · laneiv | 2,5 · 5,0 · 3,2 · 1,2 · 170 000 · 17 m | FC:3649, 4516 | FC:5358, 10075; budget nur Labor | Dorf-Gassen | 6 | f#49–54 |
| DORF-Würfel: Region, Jahr/Spanne, Epochen-Jitter, nZiel, Kernel, Gründung gr0, Ersatzbau | .30/.46/.64/.76/.88 · 880+680u · ±25 · 18/4 · .45/.78 · min(…) · 0,12 | FC:4409–4431 | FC:4424–4501 | Kultur und Alter des Orts aus dem Würfel | 7 | f#57–63 · d#84 · e#74 |
| Parzellen-Gedächtnis · Wohl-Gradient · Breite aus Wohl | W·(0,80+0,38t) · (1,22−0,5t)(0,78+0,44u) · W·(0,84+0,30w) | FC:4437–4439 | FC:4439–4512, 9533 | Breite und Rang der Häuser | 3 | f#64–66 · a#41–43 (a: Anker/FOLGT) · b#62 |
| DOWNTOWN · GEWERBE-Halle | i<0,22n, p .72, 8–23 G., ab 1905 · ab 1850, 0,78n, p .6, 14° | FC:4453–4460 | Export | Hochhäuser, Hallen | 2 | f#68–69 · a#51–52 (a: Epochen-Kommentar) · d#8 |
| Kirche ab · Burg-Regel | 8 Lose · jahr<1700, n≥16, .5 | FC:4463, 4470 | FC:4465, 4471 | Kirche, Burg | 2 | f#70–71 |
| Stände/Gräber-Raster | 5,2×4,6/12 · 2,3×3,1/36 | FC:4329, 4332 | FC:5443–5445 | Markt, Friedhof | 1 | f#80 |
| STADT_DICHTE: gasseTeilung, gasseAb/Hinter, gasseMin/Lang, flucht/mauer, markt, stand/gang, wasserM, zug*, friedhof | 28 · 14/22 · 18/54 · 7/16 · 1,3/[12,24] · 2,6/3,2 · 3 · 24/16 · 170/0,6/300 · 7,5/1,4/1,5 | FC:4353–4356 | FC:5439–5606 | Gassennetz der Stadt | 10 | f#82–91 |
| platzFass/Fuge · standTrasse · hafen/raster | 30/1,5 · 3 · 14/8 m | FC:4365–4369 | FC:5442, 5608, 9094 | Platz, Hafen | 3 | f#94–96 |
| Graph: Krümmung, Triebe, Schritte, maxE, Trieb-Länge, Snap, Abzweig, Dämpfung, Verbindungspass | .006/.016/.010/.003 · 2/3/4 · 6–17 · 8…150 · 34+30u · 16/13 · .72/.6/.28 · 0,028 · 8/4/3/1 | FC:5264–5312 | strassengraph | Form der Straßen | 9 | f#97, 99–106 |
| Mauer: mauerRing, MAUER_BIS, MAUER_SAUM, Tor-Abstand | NV 30, Turm je 5. · 1750 · 6 m · 0,5 rad | FC:5328–5351 | dorfLayout | Ringmauer | 4 | f#107–110 |
| Layout: jitAmp, Quergassen, Straßen-Gedächtnis, flen, Faubourg, Platz, Setzer-Fuge, Mauerband | .05/.9/.45/.2 · qMax 8/6/4/2 … · ab 1700 · 230/110/70 · … · max(7, 5+0,3n) · 26 × 1,1 · 2,0/2,2/1,2 | FC:5361–5532 | Setzer | Lage der Häuser | 8 | f#112–119 |
| ORT_GESETZ glaett, treppe, trasse, saum, vorplatz/gasse, hang, bruecke, um/kreuz, trasseLenk-Suche | 6 · 0,3 · 0,09 · 0,6 · 1,6/5 · 1,5/4 · 8 · 0,25/10/0,34 · 0,1×15 | FC:4605, 9998–10010 | FC:4602–11434; ORT:34 | Erdbau, Brücken, Treppen | 9 | f#120, 122–129 |
| WEG_ZWISCHEN | steilMax .3 · hang 4 · glaett 16 · furt 20 | FC:4654 | FC:4739, 4762 | Feldwege zwischen Orten | 1 | f#132 |
| Ort-Wahl: WEGENETZ, WERK_LAND_M, ORT_WAHL, nearM, spawnClear, siteProbe, startRinge | 720/3,4/… · 0,2 · 16/8/2/.05/6 · 260 · 320 · [0,15 0,3] · [24 48 72] | ORT:3559–3624; gelaende-boden.js:3179 | ORT:1687–3313 | Wege-Netz, Erwachen | 7 | f#135, 137–139, 141–143 · g#48 |
| ORT_SIEDLUNG mensch/naehrt | [−0,3, −0,012] / 0,5 | gelaende-core.js:5762 | ORT:1431, 1710 | wo Menschen siedeln dürfen | 1 | f#146 |
| Wachstum-Takt · Wachstumskraft · ORT_AUSSTATTUNG · DORF_LICHT_WEG · Kachel-Außenkasten | 300 s · 1/1800 · 5/12/12/36 · 25 m · 400 m | ORT:3579–3604; FC:4254, 5686, 9748 | dort | Wachsen, Brunnen, Laternen | 5 | f#148–149, 151–153 |

Mit Anker (17): rang[0] Zipf (f#5) · rang[1] Zipf (f#6) · STADT_NETZ.jeKachel 190 Spike 15.11. (f#24 · g#46) · STADT_FORM.randTeil Clark (f#30) · STADT_FORM.kern Clark (f#31) · EPOCHEN (f#55 · e: 9) · REGION_HIST (f#56 · e: 6) · STADT_GRAMMATIK.zeit (f#73 · a#58) · STADT_DICHTE.gasseM (f#81) · torplatz (f#92) · Raster-Stadt (f#98) · ORT_GESETZ.gefaelle Nordstern (f#121) · BRUECKE_GESETZ (f#133 · b#70 dort ohne Anker) · BELAG_GESETZ (f#134) · WEGENETZ.entwurfKmh RASt 06 (f#136) · vorlauf/bereit Fahrt-Probe (f#140 · g#48) · ERDBAU.boeschung Mess-Dorf (f#145).  
FOLGT (8): Größe Pareto (f#7) · STADT_FUNKTION.voll (f#19) · λ/Radius/Ringe (f#32) · gehwegFahrM (f#93) · Mauerradius Rw (f#111) · trasseRahmen (f#130) · wasserReich (f#131) · ORT_REICH_ZELLEN (f#144).

### D7 LOD-Stufen und Ferne — 31 ohne Anker in 6 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| KOERPER_RANG · KOERPER_INNEN wand/dach | 14 Ränge · 0,015/0,03 m | FC:2952, 2873 | FC:2956, 2976–2977 | Körperliste fern | 3 | g#12–13 · d#82 |
| LOD_SCHIRM.hyst · KAM_FOV_GRAD · ARCH_QUALITY_RADIUS_MAX | 0,1 · 75° · 150 m | vegetation-streu.js:2898; koerper-fahrt.js:3251; dirigent-regler.js:2119 | studio-bruecke.js:2943; vegetation-streu.js:2999 | Stufen-Grenzen | 3 | g#18, 20–21 |
| WELT_MARCH satzPx · satzBand · weichFaktor | 16 px² · 0,1 · 1,25 | dienst.js:2322–2324 | dienst.js:739–746 | Satz-Horizont | 3 | g#22–24 |
| STADT_FERNE reich · strassen · bandSpiel · bandHub · bandDick · sockel · ueber · jeTakte · nahM | 3000 · 1200 · 64 · 0,6 · 3 · 2,5 · 0,5 · 6 · 300 m | SW:2975–2985 | SW:2030–2321; studio-bruecke.js:3656 | Sprung an 300 m; nichts jenseits 3 km | 9 | g#26–27, 29–35 · f#147 · d#22 |
| STADT_MASSEN einzug · platz · ecke · geschossM · sockelM · flachGrad · strasseJe · Masse-Literale (4) | 4,2 · 11 · 9 · 2,7 · 0,5 m · 8° · 4 · 3/0,8/0,6/1 m | FC:4072, 4110 | FC:4092–4120, 4492–4494 | Traufe fern 5,90 statt 5,45; Lose der Kachel | 11 | g#36–43 · f#43–48 · a#97 · d#15–16 |
| Band-Mindestbreite · Wasser-Rand der Ferne | 1,2 · 0,2 m | SW:2310, 2238 | SW:2310, 2316, 2367 | Straßen-Band, Ufer | 2 | g#44, 49 |

Mit Anker (13): kindStages.haus (g#9) · budget.haus L0 (g#10) · budget.haus L1 (g#10) · budget.haus L2 (g#10) · budget.haus S3 (g#10) · KOERPER_TEILE_MAX (g#11) · lod.d0 12 (g#14) · lod.d1 26 (g#15) · LOD_SCHIRM.px (g#16) · LOD_SCHIRM.zeilen (g#17) · Hülle-fern-Viertel (g#25) · STADT_FERNE.bandAbM (g#28) · LOD_SCHIRM.fehler.haus — 64 Messwerte als 1 Block (g#19).  
FOLGT (5): Grenze L1/L2 (g#50) · Pixel-Horizont (g#51) · Traufe/First S0–S3 (g#52) · Ton der Kachel (g#53) · Stadt-First tan·D/2 (d#17).

### D8 Kultur-Tafel und Kern-Defaults — 16 ohne Anker in 3 Zeilen

| Name | Wert | datei:zeile | Leser | im Bild | n | Blätter |
|---|---|---|---|---|---|---|
| KULTUR-Mittel pitch/W/D/st | 32 Zeilen, z. B. alemannisch 55°/8/9/2 | FC:2122–2153 | _bauweiseWurf FC:2204–2210 | Grundform jedes Hauses | 1 | b#58 (Wort-Anker „Region im Label“) · d#2 (Etikett) |
| KULTUR-Einzelwerte hip · roofCurve · treppgiebel · kuppel · portikus · veranda · terrasse · bogenTyp · dachTyp · pilotis | z. B. chinesisch hip 0,85 · curve 0,95; dachTyp in 0 Kulturen; pilotis in 0 | FC:2135–2153, 2211–2214 | FC:224, 272 … | Dachform je Kultur; pilotis/dachTyp nie | 10 | h · d#24, 28, 34 |
| Studio-Defaults bend · terrAsym · doppel · wing · terrain | 0 · 0 · 0 · 1 · 0 | FC:5734–5736, HAUS 175, 5815 | von der Welt nie gesetzt | Verformungsfeld läuft nur mit bend 0 | 5 | h |

Mit Anker (0): keine.  
FOLGT (5): W (b#53 · h) · D (b#54 · h) · storeys (b#55 · h) · pitchDeg (b#56 · h) · Strebenfigur brace aus Kultur-Pool (b#27).

## TEIL 2 — ZWILLINGE

Jede Größe, die an zwei oder mehr Orten mit eigenem Wert (oder als eigenes Literal) steht.

| # | Größe | Fundstellen (Wert) | sichtbare Folge |
|---|---|---|---|
| Z1 | **Traufhöhe** (2 Geschosse) | HAUS 0,55 + 2,55 + 2,35 = **5,45 m** (FC:178, 214) · Stadt-Ferne n·2,7 + 0,5 = **5,90 m** (FC:4072, 4120) · PROXYHAUS n·2,75 = **5,50 m** (FC:4542) — d (3), g Z1, h (3) | an 300 m (`nahM`, SW:2985) wächst jedes Stadthaus um 0,45 (2 G.) / 1,15 (4 G.) / 2,55 m (8 G.), der First mit (g Z1) |
| Z2 | **Geschosshöhe** | egH/ogH 2,55/2,35 (FC:178) · STADT_MASSEN.geschossM 2,7 + sockelM 0,5 (FC:4072) — auch der Grundriss des NAHEN Hauses wächst nach geschossM (FC:4492, 4494) · PROXYHAUS 2,75 · Rundbau nLev·egH (FC:1628, 1632) — a (3), b (3), g Z1 | Höhe springt fern; Rundbau-OG höher als Haus-OG |
| Z3 | **Sockel** | foundH 0,55, Pilotis +2,6 (FC:178, 211) · sockelM 0,5, pilotis ignoriert (FC:4072/4120) · STADT_FERNE.sockelM 2,5 unter Grund (SW:2242) — g Z3 | Pfahlhaus fällt fern auf den Grund |
| Z4 | **Dachüberstand** | 0,42/0,32 (FC:181) · Quergiebel 0,32/0,30 (FC:1411) · Kreuzdach +0,3 (FC:1391) · PROXYHAUS 0,45 (FC:4559) · ueberM 0,5 gesamt = 0,25 je Seite (SW:2983) — d (3), g Z2 | Dach schrumpft an 300 m um 0,17 m je Traufseite |
| Z5 | **Glas** (fünffach + Kopie) | glas 0x33576a r .15 opak .42 (FC:2071) · glasdunkel 0x2b4457 opak .92 (FC:2089) · glasfern 0x46687e r .22 m .45 (FC:2091) · Kultur-Glas 0x9fb8c4/0x80a1b6 (FC:2130–2131) · STOFF_GESETZ glas r 0,05 (schmiede-core.js:2924) · laternenglas = Byte-Kopie von glas (FC:2090) — e (3), c (3) | 45 % der Fenster fast opak; raumVon rechnet für alle mit 0,42 (FC:6023, c (3)) |
| Z6 | **Backstein-Format nah/fern** | Gefach 0,32 × 0,15, Fuge 0,025 (FC:641, 733) · VERBAND mauerwerk 0,24 × 0,071, Fuge 0,011 (FC:1850, NF) — b (3) | zwei Steinformate an derselben Wand, je nach Stufe |
| Z7 | **Dachziegel nah/fern** | Geometrie 0,26 × 0,34, Reihe 0,205 (FC:233; dieselben Literale FC:841) · Textur Biberschwanz 0,18 × 0,32 (FC:1851) — b (3), d (3) | Reihenmaß springt mit der Stufe; dasselbe Raster für Schiefer, Mönch-Nonne, Stroh (e (3)) |
| Z8 | **Fachwerk-Raster** | bayMax 1,7 · post 0,16 · Riegel 0,13 (FC:181, 179, 651) · VERBAND_GESETZ.fachwerk 1,7/0,85/0,16/0,13 (FC:1848) — b (3), c (3), e (3) | Fernwand Stufe 2 steht auf einem anderen Raster als die Nahwand, sobald bayMax sich ändert; schon heute springt es am Wechsel 1→2 (Bericht 1711-haus-stoff/README.md:210–211, nicht gemessen) |
| Z9 | **Fläche je Person** | wohnhaus.raeume 20 + 20·wohl (FC:2183) · LEUTE_GESETZ flaeche 20, wohlFlaeche 20 (FC:9526) — a (3), b (3) | Labor füllt das Haus aus Leuten, Welt rechnet Leute aus dem Haus |
| Z10 | **Raumteilung** | bauProgramm Räume in m² (FC:2248) · prog/layout Gewichte (FC:601–618) — a (3) | Innenraum liest keinen Haushalt |
| Z11 | **Rollen-Tafeln** (vierfach) | BAU_NUTZUNG 18 Typen (FC:2182) · LEUTE_GESETZ.rolle 9 (FC:9526) · TAGES_GESETZ.angebot 10 + sonst (KC:5176) · hofFuer-Zweige (FC:3517–3559) — a (3) | 11 Viertel-Typen fallen in die Flächenformel, fast alle in angebot.sonst |
| Z12 | **Maß-Pfade neben BAU_NUTZUNG** | Kirche FC:4461–4462 · Burg 4473–4474 · Halle 4459 · Downtown 4456 · Scheune 4480 — a (3) | fünf Bau-Typen außerhalb der Tafel |
| Z13 | **Wohlstand** | bauProgramm (FC:2245, nur Labor) · Welt: wohl-Würfel → W-Faktor (FC:4439), +1 G. (4444) — b (3), h (4) | der Haushalt formt das Welt-Haus nicht |
| Z14 | **W/D-Klammer** (dreifach) | Würfel [5;15]/[4;11] (FC:2208–2209) · Programm [4,5;15]/[4;11] (FC:2269–2270) · Regler [6;14]/[5;10] (FC:5731–5732) — b (3) | gotisch D = 11 liegt jenseits des Reglers |
| Z15 | **Wanddicke** (fünffach, stoffblind) | glatt = post 0,16 (FC:678) · Brandwand 0,34 (1773) · Keller 0,30 (432) · Turm 0,26 (1683) · Innen 0,12 (897) · Loch-Wand 0,22/0,24/0,26 (1513, 1534, 1683) — b (3), c (2) | Klinker- und Putzwand so dick wie ein Eichenständer |
| Z16 | **Lehm-Ausfachung** | Lehmfeld 0,09 (b#29, FC:640) · Lehm 0,06 (c#43, FC:640–644) — **Vermutung**: dieselbe Zeile, zwei Lesungen (Dicke vs. Vorstand?); nicht an der Quelle geprüft | offen (s. Erste Punkte) |
| Z17 | **Fenstermaß je Teilbau** (elffach) | Haupt FC:476 · Flügel-Traufe 1370–1372 · Flügel-Giebel 1376 · Giebel 713 · Gaube 799 · Anbau 1290 · Hof 1518 · Terrasse 1604 · Turm 1686 · Rundbau 1637 · Tambour 1754 — c (3) | elf Fenster-Antworten, keine liest einen Raum |
| Z18 | **Fensterbreite** | wallSpec min(1,05; wdt−0,34) (FC:495) · winW-Fallback min(hi−lo−0,3; 1,1) (FC:631) — c (3) | Fallback praktisch tot |
| Z19 | **Anbau-Fenster** | Bau 0,8 × 0,55 bei wy0+1,2 (FC:1290–1292) · Fern-Liste dieselben Literale (FC:1795) — c (3) | stiller Bruch bei Änderung einer Stelle |
| Z20 | **Fenster nah/fern** | L0 Flügel 0,62 rad (FC:1084) · FLUEGEL_LAGE cos/sin als Literal (FC:2788) · RAHMEN_TIEFE 0,10 gegen L0 0,09/0,12 · Fern-Scheibe frontal 0,11 m vor der Wand (FC:2810) — c (3) | fern zwei Scheiben, nah keine in der Öffnung |
| Z21 | **Licht-Liste / Fern-Liste** | LICHT (FC:322) · windowOpenings (FC:1789); vereint per Nähe-Probe 0,3/0,6 m (FC:6007–6011) — c (3) | Pflaster für den Zwilling |
| Z22 | **Kamin** (dreifach) | HAUS am Herd (FC:928) · PROXYHAUS x = W·0,24 ohne Herd (FC:4565) · Stadt-Ferne ohne Kamin (SW:2224–2246) — d (3) | Kamin fällt fern |
| Z23 | **Schwung** | DEF_cA = 1,35·curve, Exp. 2,2 (FC:272/274) · cA = 1,35·m.curve, 2,2 (FC:3034/3038) — d (3) | gleich, zwei Literale |
| Z24 | **Sonderdächer nah/fern** | Pyramide FC:1713 ≡ 3092 · Kegel 1715 ≡ 3093 · Mansard/Tonne fern Sattel (FC:3094–3095) — d (3) | Silhouette weicht (nur Labor) |
| Z25 | **Dachform/-farbe/Wandfarbe fern** | S0–S3 aus B.masse (FC:1800, 2940–2945) · hausMasse: immer Sattel, ziegel, ohne wandTon (FC:4119–4123; SW:2177–2187) — g Z4–Z8, d (3) | Walm, Kuppel, Stroh, Moderne, Flügel, Turm fallen an 300 m in Kasten + Ziegelsattel |
| Z26 | **Flach-Schwelle** | Glas trägt ab 4° (FC:160, 208) · fern unter 8° kein First (FC:4072, 4119) — g Z5 | Glasdach 4–8° verschwindet fern |
| Z27 | **Lose der Kachel** | Stufe 1 kachelMassen platzM 11/einzugM 4,2 (FC:4086–4110) · Stufe 2 dorfLayout/tryPlace (FC:5487) — f (3), g Z9, h (3) | jedes Haus springt beim Erwachen an ein anderes Los |
| Z28 | **Mauer** (dreifach) | mauerRing NV 30, Turm je 5. Ecke (FC:5328) · schnittMauer +6 (FC:5344) · kachelMauer turmJeM 42 (FC:4037) — f (3) | drei Turmabstände |
| Z29 | **Rw / flen** | dorfLayout min(195, 26+8,4√nG), flen 230/110/70 (FC:5364, 5421) · wasserReich dieselben Literale (FC:4626) — f (3) | Wasser-Lesen bricht still |
| Z30 | **DS = 3 · strasseW·0,78** | je dreimal (FC:3845/5263/5362 · 3857/5297/5322) — f (3) | — |
| Z31 | **WERK_LAND_M** | _landAt(x, z, 0.2) (ORT:1689) statt WERK_LAND_M (ORT:3572) — f (3) | — |
| Z32 | **gap** | DORF_NORM.gap 2,5 (FC:3649) · Stadt 0,06/0,6 (FC:4516) — f (3) | Tafelwert gilt nur fürs Dorf |
| Z33 | **Region-Zweig** | markBei (FC:4461) · herr/bk (FC:4325, 4472) „nordisch → norwegisch“ — f (3) | — |
| Z34 | **Stein** (vierfach) | stein 0x8d857a (FC:2068) · Werkstatt 0x7a7a7a (bau-vorlagen.js:1756) · granit 0x8e939a / pflaster 0x70747a (porta-core.js:303) · Grabstein 0xa8a294… (FC:8896) — e (3) | — |
| Z35 | **Holz** (fünffach) | 0x5a4632 (FC:2065) · lattung 0x967852 · Gestalt 0x8e7860 (FC:8894) · Zaun 0x6a4e32 (SW:2731) · Werkstatt 0x5e3a1c (bau-vorlagen.js:1763) — e (3) | — |
| Z36 | **Silbergraues Holz · Rost · Moos · Metall** | AUS_SILBER [.2 .2 .19] ↔ ALTER.holz .147/.133/.112 (USDA) · AUS_ROST ↔ ALTER.eisen (G 78 % verschieden) · AUS_MOOS_NORD = Literal-Kopie FELS.moos · metall r .5 m .55 ↔ eisen r .54 m 1 (MERL) — e (3) | Werke und Häuser altern verschieden |
| Z37 | **Verband gegen DEFCOL** | verbandZeilen() ohne Argument, rechnet gegen DEFCOL (FC:1883, 1894) · DEFCOL = Rollen-Block (FC:2119) · texDach-Literal = ziegel2 (FC:2063) — e (3) | ferner Balken nicht der Balken der Kultur (niedersächsisch) |
| Z38 | **Portikus / Ordnung** | Säule 0,20, Achse W/2,6 (FC:1722, 1728) · CLASSICAL_ORDERS (bau-teile.js:2982) ohne Spiel-Leser — b (3) | Säulen ohne Ordnung |
| Z39 | **Haus-Substanz** | haus_basis 6,4 × 4,8 × 3,1 (siedlung-satz.js:1890–1936) · massBau.ext des Kerns (FC:5842) — h (3) | Spawn-Abstand und Bau-Phantom am falschen Kasten |
| Z40 | **Studio ↔ Welt** | Editor ruft HAUS direkt (LAB:721) · Welt buildInstance (FC:6321); werk reicht nur 21 Regler (LAB:1139–1143) — h (3) | bei storeys 12 ein anderer Bau; Figur/Stil/Dachtyp verfallen |

## TEIL 3 — DETAILS, DIE IM NAH-BILD NICHT TRAGEN

Bilder aus dem Bestand; Stand der Aufnahme steht dabei — keines ist am main 18058dba geschossen. Pfade relativ zu
C:\Users\micha\Desktop\AnazhRealm-OMEN\.

| # | Befund (Blatt) | Bild | was man darin sieht |
|---|---|---|---|
| B1 | **Die graue Fenster-Tafel** — Flügel 0,62 rad nach AUSSEN in jedem Fenster (FC:1084/1089), Scheibe im Flügel, 45 % glasdunkel opak 0,92, Öffnung selbst leer; fern Scheibe 0,11 m vor der Wand (FC:2810) (c (4)) | koordination/bericht/1711-haus-stoff/paar2-tag-nah.jpg | jedes Fenster der weißen Giebelwand ist eine flache dunkel blaugraue Tafel ohne Laibung, ohne Innen, ohne Laden (links d3ddb51c, rechts 41dd9e32b, Stufe 1) |
| B1b | dieselbe Tafel fern (c (4) Schritt 5) | koordination/bericht/1711-haus-stoff/blatt-welt-1.jpg | rechte Spalten (L2): helle bzw. dunkle Rechtecke liegen als Flecken auf dem braunen Körper (Stand 08a8397b) |
| B2 | **Raumprogramm ohne Haushalt** — bauProgramm nur im Labor, alle Welt-Rufe haushalt = null; das Haus wird gewürfelt, Leute folgen ihm (a Kurzbefund, h (4)) | koordination/bericht/1711-haus-stoff/welt-tag-fern.jpg | vierzehn gleich große weiße Putz-Kästen in Reihe, gleicher Grundriss, zwei Dachfarben — kein Rang, kein Gewerbe, kein Anbau sichtbar (Stand 08a8397b) |
| B3 | **Innenraum ohne Nutzung** — Schmiede innen Stube/Kammer wie Wohnhaus (a (4)) | kein Bild im Bestand | — |
| B4 | **Moos auf Fachwerkholz** — WERK_ALTER.seh.stoff = "stein" (siedlung-satz.js:1980): Balken bekommen Moos/Flechte, das USDA-Silber erreicht kein Haus; Verwitterung ab Welttag 0 (e (3)) | kein Bild im Bestand — paar2-fachwerk-26m.jpg / -40m.jpg zeigen das alemannische Haus nah, aber kein Moos auf den Balken erkennbar; Welttag der Aufnahme nicht vermerkt | — |
| B5 | **Rinnen ohne Wasser** — Traufrinne als Balken 'dunkel' (FC:837, 1399, 1415), kein Fallrohr, kein Ablauf; Regenschutz endet an der Wand (d (3)) | koordination/bericht/1711-rauch-bild/rauch-nach-kamin-nah.png | Traufe des blauen Dachs von oben: an der Kante ein schmales dunkles Band (Vermutung: die Rinne FC:837), an der Hausecke kein Fallrohr, kein Wasser |
| B6 | **Der Sprung an der 300-m-Grenze** — Traufe +0,45…2,55 m, Walm/Flügel/Stil-Dachfarbe/wandTon fort (g Z1–Z8) | kein Bild des Wechsels im Bestand. Beide Seiten der Grenze in EINEM Bild: p3/n1811/netz/lk-nach-1/bild2-aus-90m.png | vorn Häuser mit Fensterreihen (Satz/Mesh), dahinter gleiche beige Kästen mit orangem Sattel-Prisma ohne Fenster — die Grenze ist sichtbar, der Sprung eines Hauses nicht |
| B7 | **Ferne Stadt = Kasten + Satteldach** — hausMasse kennt nur [W, D, Traufe, First] (FC:4119–4120; g Z4, Z8; h (3).1) | koordination/bericht/1811-stadt/netz/kopf-4750-ueber-260m.png | die ganze Stadt aus Quadern mit einheitlich orangem Sattel; kein Walm, kein Flügel, kein Hof |
| B8 | **Fachwerk ab Stufe 2 brauner Kasten / Raster aus der Tafel** (e (3), b Z8) | koordination/bericht/1711-haus-stoff/paar2-fachwerk-40m.jpg | links (d3ddb51c) das Fachwerkhaus als glattes Braun; rechts (41dd9e32b) Gefüge im starren 1,7-m-Raster der Tafel, ohne Streben |
| B9 | **Rauch immer an** — kein Tag, kein Bewohner, kein Herd-Betrieb (SB:95–107; d#77) | koordination/bericht/1711-haus-stoff/welt-tag-fern.jpg | mittags raucht nahezu jeder Kamin des Dorfs |
| B10 | **Kein Hof, kein Dazwischen** — hofFuer reist nicht in buildInstance (a (1), h (4)) | koordination/bericht/1711-haus-stoff/welt-tag-fern.jpg | Häuser stehen auf blankem Boden am Weg; kein Zaun, Stapel, Beet, Karren |
| B11 | **Stürze unter Augenhöhe** — EG-Sturz 1,605 m, OG 1,42 m über Schwelle (c (2) Rechnung) | kein Bild im Bestand mit Maßstab (Figur neben Fenster) | — |
| B12 | **Eine Deckung für jedes Dach** — Biberschwanz-Raster für Schiefer, Mönch-Nonne, Stroh (e (3), d (4)) | kein Bild im Bestand, das Schiefer/Stroh nah zeigt (blatt-welt-1.jpg: franzoesisch violett, Reihen nicht auflösbar) | — |
| B13 | **19 Fabrik-Maße in jedem Haus gleich** — Geschosshöhe, Holzquerschnitt, Überstand, Tür (h (2)) | koordination/bericht/1711-haus-stoff/blatt-welt-1.jpg | acht Kulturen, gleiche Traufkante, gleicher Dachrand, gleiche Sockelplatte — nur Farbe und Neigung wechseln |
| B14 | **Studio → Welt verliert Figur, Stil, Dachtyp, Bogen, Farbe** (h (4)) | kein Bild im Bestand (kein Paar Editor ↔ Welt desselben Werks) | — |
| B15 | **Sonderdächer und pilotis nie in der Welt** (d (3), h (2)) | kein Bild im Bestand (Abwesenheit; Beleg ist Grep, d (3)) | — |
| B16 | **Regen unter dem Überstand, kein Schnee auf dem Dach** (d (3)) | kein Bild im Bestand | — |

## TEIL 4 — TOTE

Deklariert, aber ungelesen, unerreichbar oder von der Welt nie gerufen.

| Feld / Pfad | datei:zeile | Beleg | Blatt |
|---|---|---|---|
| `jetty` 0,0 | FC:171 | 0 Leser repo-weit | b (3), h (4) |
| `sparH` 0,15 | FC:180 | Grep `P.sparH`: 0 | b (3) |
| `bauProgramm` in der Welt | FC:2245–2276 | alle Welt-Rufe von bauRezept mit haushalt = null (FC:4381 … 4473, 5775); einziger Haushalt LAB:629 | a (3), b (3), h (4) |
| `hp.programm` | FC:2274 | kein Leser | a (3) |
| `hp.parzelle`, `rahmen.dicht` | FC:2255 | ohne Erzeuger | a (3) |
| Grundriss hof/U/T/kreuz, Lagen anbau/keller/laube/turm/fluegel/offen, `N.personen` | FC:2246–2273 | einzige Raum-Zeile wohnhaus trägt nur wohnen/kern, I/L | a (3) |
| Räume `dach`, `getrennt` | FC:2249 | übersprungen | a (3) |
| `dims.rooms` + `func` | FC:1809 | außerhalb FC:1234–1240 ohne Leser | a (3) |
| `hofFuer` in der Welt | FC:3513–3562 | 0 Leser in stamm/ | a (3), h (4) |
| Labor `formSetzen` verwirft hp.leute; applyMeta verwirft keller/turm/leute/programm | LAB:630–631 | — | a (3), h (4) |
| `CLASSICAL_ORDERS`, Tempel-Modul | bau-teile.js:2982, 1296 | kein Spiel-Pfad (bau-teile.js:1287) | b (2) |
| `_failsUnderLoad` am Haus | bau-buch.js:1869 | _werkGesetzSetzen kehrt für Studio-Werke zurück (bau-teile.js:2490–2494) | b (3) |
| STOFF_GESETZ im Haus | schmiede-core.js:2860 | 0 Leser in fachwerk-core.js | b (1) |
| winW-Fallback | FC:631 | wd immer gesetzt (FC:495) | c (3) |
| „kleine Fenster“ (mittelalterlich) | FC:2125 | Kommentar ohne Feld | c (3) |
| Läden | — | kein Bau (Grep nach Laden/Läden/shutter) | c (3) |
| PROXYHAUS (Fenster, Geschoss, Kamin) | FC:4540–4565 | proxyGroup in LAB:52/59 zweimal definiert, nie gerufen | c (3), d (3), h (4) |
| `glasfern` als Fenster-Stoff | FC:2091 | nur Wand-Rolle des Glas-Stils (FC:2938) | c (3) |
| `dachTyp` mansard/pyramide/kegel/pult/tonne/schmetterling | FC:1711–1718 | kein Welt-Schreiber außer 'flach'/'sattel' (FC:2735, 4457, 4482) | d (3) |
| Stil `stroh` | FC:160, 196 | in keiner der 32 KULTUR-Zeilen | d (3) |
| `ovEave`/`ovRake` in KULTUR, Etikett „weite Dachüberstände“ | FC:2134 | _bauweiseWurf gibt sie nicht aus | d (3) |
| Putz-Verband (8 von 10 Feldern) in der Welt | FC:1852 | zugWelt 0 → Zeile 3 Identität (FC:1909, 1916) | e (3) |
| `naturstein.stein` als Farbe | FC:1853 | bestimmt nur Fuge/Stein-Verhältnis | e (3) |
| ALTER.holz (USDA-Silber) für Häuser | bau-vorlagen.js:1685 | seh.stoff = "stein" (siedlung-satz.js:1980) | e (3) |
| `kulturFromSeed` | FC:2164 | Leser nur Labor | e (3) |
| `DORF_NORM.budget` | FC:3649 | Leser nur LAB:222, 262 | f (3) |
| Kachel-Stadt aus der Welt | FC:3706, 3871, 9729 | siedlungsGroesse klemmt auf GROESSE_WAND, Kachel verlangt nH > voll — nur das Wort öffnet sie | f (3) |
| pilotis, bend, terrAsym, doppel, wing in der Welt | FC:2213, 5734–5736 | nie gesetzt; Verformungsfeld nur mit bend 0 | h (2), h (4) |
| `wohl`, `programm`, `leute`, `viertel`, `turmbau`, `sektor`, `mark`, `parent` im slot.ov | FC:5923 | HAUS liest keinen davon | h (4) |
| Gestalt-Zahl `_foundryVariantFor` | studio-gestalt.js:999 | ov.seed überstimmt sie (FC:6330) | h (4) |
| `gelaende`-Parzelle | HAUS FC:1488 | Welt build({gelaende:false}), terrain 0 (FC:6145, 5815) | h (4) |

## ERSTE PUNKTE DER NÄCHSTEN RUNDE

1. **Bild des 300-m-Sprungs**: dasselbe Stadthaus an 290 m und 310 m (`nahM`, SW:2985), selbe Kamera — B6 hat nur beide Seiten in einem Bild.
2. **Bild Moos auf Fachwerk**: ein Fachwerkhaus nah nach N Welttagen Regen (WERK_ALTER, siedlung-satz.js:1971) — B4 hat keins.
3. **Bild Innenraum Schmiede ↔ Wohnhaus** (B3), **Editor ↔ Welt desselben Werks** (B14), **Figur neben Fenster** für die Sturzhöhe (B11), **Schiefer/Stroh nah** (B12), **Regen unter dem Überstand** (B16) — je ein Schuss oder der Befund fällt mit Grund.
4. **Z16 Lehm 0,09 ↔ 0,06** an FC:640–644 lesen: ein Zwilling oder zwei verschiedene Größen.
5. **Urteils-Streit der Blätter** schließen: Ring-Breite (a#43 Kommentar ↔ f#64 G), Downtown/Halle (a#51–52 ↔ f#68–69), REGION_HIST/EPOCHEN (e ↔ f), Kehlbalken (b#37 Wort-Anker ↔ d#52 FOLGT). Hier entschieden wie in Teil 1 Summe Punkt 2; das Gesetz-Blatt übernimmt oder widerspricht mit Grund.
6. **Bilder am main 18058dba neu**: alle Bilder dieser Tafel stammen von 08a8397b … 41dd9e32b (1711-haus-stoff) bzw. der Netz-Wache 18.11.; ob haus-stoff 509212d68 in 18058dba liegt, habe ich nicht geprüft (kein git) — B1, B8, B13 können am main anders aussehen.

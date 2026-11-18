# Lesen (a): Raumprogramm und Nutzung — main 18058dba

**Feld:** `fachwerk-core.js` (12 518 Z.: BAU_NUTZUNG/bauRezept/bauProgramm 2165–2276, DORF/STADT_GRAMMATIK 4303–4517, Innenraum 585–630 · 897–1255, hofFuer 3513–3562, LEUTE_GESETZ 9519–9538, hausZeile 5908–5933) · `koerper-core.js` (9 722 Z.: TAGES_GESETZ.angebot 5176–5188, tagesOrte 5240) · `stamm/siedlung-bewohner.js` (3 933 Z.: Bewohner je Haus 760–899) · `worlds/fachwerk/fachwerk.js` (1 148 Z.: Labor-Haushalt 624–632, 809) · gelesen ohne Programm-Befund: `stamm/siedlung-ort.js` (3 676), `stamm/siedlung-bauten.js` (3 345: Stufen/LOD), `stamm/bau-vorlagen.js` (2 123) und `stamm/bau-buch.js` (3 014: Werkstatt-Baupläne des Spielers, kein Siedlungshaus).

**Kurzbefund.** Das Raumprogramm-Gesetz (`bauProgramm`, Personen × Wohlstand → Fläche → Geschosse/Grundriss) existiert, läuft aber **nur im Labor** (worlds/fachwerk/fachwerk.js:629); jeder Welt-Aufruf von `bauRezept` übergibt `haushalt = null` (FC:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473). In der Welt ist die Richtung umgekehrt: Maß und Geschosse des Hauses werden gewürfelt (FC:4436–4449), danach rechnet `leuteVon` aus der Fläche zurück, wie viele darin wohnen (FC:9535), und der Beruf ist die Rolle des Hauses (SB:874–875). Die Nutzung (Gewerbe) ist je Bau-Typ eine feste Maß-Tafel (BAU_NUTZUNG FC:2184–2200, 17 Zeilen ohne Räume); welcher Typ auf welchem Los steht, ergibt sich aus Viertel-Rang × Epochen-Band × Wohlstand (FC:4384–4394). Innenräume und Möbel kennen weder Nutzung noch Bewohner noch Epoche: Küche/Stube/Kammer/Vorrat ergeben sich allein aus der Lage des Herds und der Raumgröße (FC:623–630), Rolle und Baujahr liest der Bau nirgends (Grep `P\.(rolle|wohl|leute|baujahr|nutzung)` in fachwerk-core.js: 0 Treffer).

Kürzel: FC = fachwerk-core.js · KC = koerper-core.js · SB = stamm/siedlung-bewohner.js · LAB = worlds/fachwerk/fachwerk.js

## (1) WAS TRÄGT

| Gesetz | Ort | Leser (wer ruft, datei:zeile) | in der Welt? |
|---|---|---|---|
| `bauRezept(z, haushalt, seed)`: legt die Maß-Ops der Nutzung über das Los, ruft bei Haushalt `bauProgramm` | FC:2221–2232 | FC:4381, 4382 (stadtViertel), 4398, 4436, 4450, 4462, 4468, 4473 (DORF), 5775 (PRESETS); LAB:35, 628, 629, 841 | ja, aber nur der `mass`-Zweig (haushalt immer null) |
| `BAU_NUTZUNG.*.mass` (die Ops `setze/plus/mindestens/hoechstens`) | FC:2184–2200 | FC:2227–2228 | ja: gasthaus/schmiede in jedem Ort ab 8/10 Losen (FC:4468), die übrigen 15 nur in der Grammatik-Stadt (städtisch, Jahr 500–1800, FC:4469, 4487) |
| `bauProgramm(N, hp, haushalt, rahmen)`: der Packer | FC:2245–2276 | nur FC:2229 ← nur LAB:629 | **nein** |
| `stadtViertel`: Los → Viertel → Bau-Typ nach Band und Rang | FC:4376–4401 | FC:4487 | ja |
| `DORF`: je Los Kultur, Baujahr, wohl, Maß, Keller, Anbau, Grundriss | FC:4403–4517 | Plan-Export → `hausZeile` (FC:5912) trägt `rolle`, `baujahr`, `ov` (das ganze hp) in den Slot (FC:5921–5923) | ja |
| `leuteVon(hp)`: Leute je Haus | FC:9527–9538 | SB:779, SB:839 (Bewohner je Tür), FC:4512 (Chronik des Wachstums), scripts/lib/kreatur-mensch.cjs:390 | ja |
| `tagesOrte` / `TAGES_GESETZ.angebot`: was ein Haus seiner Rolle nach bietet | KC:5176–5188, 5240–5251 | SB:784, SB:822 (`tagesBindung`) | ja |
| Raumteilung `prog`/`layout`/`rooms` und Raumfunktion | FC:600–630 | FC:911 (`innenwaende`), FC:1248 (`furnish`) | ja (Stufe 0 der Nähe, `stufe0Param` FC:6134) |
| `moebel()` (F.tisch … F.fass, furnish, Keller-Inventar) | FC:1099–1255 | Stufe 0; ausgeschaltet bei `storeys ≥ 6 ∨ arm` (FC:6138, LAB:101) | ja |
| `hofFuer(B)`: Hof, Beete, Holzstapel, Kisten | FC:3513–3562 | LAB:88, 773, 776, 904 | **nein** — laut Schnitt-Grenze (a) FC:43–46 und 6123 nicht in der Welt; Grep `hofFuer` in stamm/: 0 Treffer |

## (2) DIE GRÖSSEN

| # | Name | Wert | Einheit | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | wohnhaus.geschosse | [1, 4] | Geschosse | FC:2183 | keiner | FC:2257 (nur Labor) | GESETZT |
| 2 | wohnhaus.grundriss | ['I','L'] | Formen | FC:2183 | keiner | FC:2260 | GESETZT |
| 3 | wohnhaus Raum „wohnen“ je Person | 20 | m² | FC:2183 | keiner | FC:2248 | GESETZT |
| 4 | wohnhaus „wohnen“ je Person und wohl | 20 | m² | FC:2183 | keiner | FC:2248 | GESETZT |
| 5 | gasthaus.mass | W+2,5 ≤ 15 · D+1 ≤ 11 · st ≥ 2 · Arkade in mitteleuropa/mediterran | m / Gesch. | FC:2184 | keiner | FC:2227 ← 4468 | GESETZT (Arkade folgt der Region) |
| 6 | schmiede.mass | 5,5 × 5 · 1 Gesch. · Grundriss I | m | FC:2185 | keiner | FC:2227 ← 4468 | GESETZT |
| 7 | rathaus.mass | W ≥ 13 · D ≥ 10 · 3 Gesch. · Turm · Keller · Zinnen (MA) / Arkade (sonst) | m | FC:2186 | Epoche (Kommentar „der wehrhafte Rat des Mittelalters“) | FC:2227 ← 4382 | GESETZT (Zinnen/Arkade folgen dem Band) |
| 8 | kaufhaus.mass | W ≤ 8,5 · D ≥ 10 · ≥ 3 Gesch. | m | FC:2187 | Kommentar „schmal und tief am Platz“ | FC:2227 ← 4382 | GESETZT |
| 9 | kontor.mass | ≥ 10 × 10 · 3 Gesch. · Arkade | m | FC:2188 | Kommentar „Fondaco“ | FC:2227 ← 4382 | GESETZT |
| 10 | zunfthaus.mass | ≥ 11 × 9 · 3 Gesch. · Portikus | m | FC:2189 | keiner | FC:2227 ← 4382 | GESETZT |
| 11 | pfarrhaus.mass | 8 ≤ W ≤ 10 · 2 Gesch. | m | FC:2190 | keiner | FC:2227 ← 4382 | GESETZT |
| 12 | kapelle.mass | 7 × 8 · 1 Gesch. | m | FC:2191 | keiner | FC:2227 ← 4382 | GESETZT |
| 13 | bergfried.mass | 8 × 8 · 5 Gesch. · Zinnen | m | FC:2192 | Kommentar „der Turm des Herrn“ | FC:2227 ← 4382 | GESETZT |
| 14 | torhaus.mass | 7,5 × 6,5 · 2 Gesch. | m | FC:2193 | keiner | FC:2227 ← 4382 | GESETZT |
| 15 | zeughaus.mass | 12 × 8 · 2 Gesch. | m | FC:2194 | keiner | FC:2227 ← 4382 | GESETZT |
| 16 | werkstatt.mass | W ≤ 8 · ≤ 2 Gesch. · 1 Anbau | m | FC:2195 | keiner | FC:2227 ← 4382 | GESETZT |
| 17 | backhaus.mass | 6 × 6 · 1 Gesch. | m | FC:2196 | keiner | FC:2227 ← 4382 | GESETZT |
| 18 | speicher.mass | W ≥ 9 · D 11 · 4 Gesch. | m | FC:2197 | keiner | FC:2227 ← 4382 | GESETZT |
| 19 | gerberei.mass | W ≥ 9 · 2 Gesch. · Veranda | m | FC:2198 | Kommentar „Trockenboden“ | FC:2227 ← 4382 | GESETZT |
| 20 | wohnturm.mass | 6 × 6 · 6 Gesch. | m | FC:2199 | Kommentar „Geschlechterturm“ | FC:2227 ← 4382 | GESETZT |
| 21 | patrizierhaus.mass | W ≥ 10 · ≥ 3 Gesch. · Balkon | m | FC:2200 | keiner | FC:2227 ← 4382 | GESETZT |
| 22 | capK-Faktor frei · dicht · turmig | 1,6 · 1,3 · 0,55 | × Parzelle | FC:2256 | keiner | FC:2265, 2267 | GESETZT |
| 23 | capK-Deckel | 165 | m² | FC:2256, 2268 | keiner | FC:2267 | GESETZT |
| 24 | capL frei · dicht | 2,6 · 1,6 | × Parzelle | FC:2256 | keiner | FC:2261–2264 | GESETZT |
| 25 | F0 mindestens | 20 | m² | FC:2255 | keiner | FC:2256 | GESETZT |
| 26 | Hof-Schwelle · Flügel-Kappe | ≥ 20 · ≤ 42 | m² | FC:2261 | keiner | unerreichbar (s. 3) | GESETZT |
| 27 | U/T-Schwelle · Kappe | ≥ 24 · ≤ 30 | m² | FC:2262 | keiner | unerreichbar | GESETZT |
| 28 | Kreuz-Schwelle · Kappe | ≥ 36 · ≤ 45 | m² | FC:2263 | keiner | unerreichbar | GESETZT |
| 29 | L-Flügel Schwelle · Kappe | ≥ 8 · ≤ 15 | m² | FC:2264 | keiner | FC:2266 | GESETZT |
| 30 | Mindestfuß | 0,45 · F0 | m² | FC:2268 | keiner | FC:2269 | GESETZT |
| 31 | W · D Programm-Klammer | 4,5–15 · 4–11, Halbmeter | m | FC:2269–2270 | keiner | LAB:630 | GESETZT |
| 32 | Anbau-Zelle | 18, höchstens 2 | m² | FC:2271 | keiner | unerreichbar (keine Anbau-Räume) | GESETZT |
| 33 | Programm-Ausgabe W/D/Geschosse/Grundriss | aus Personen × (20 + 20·wohl) / 0,7 | — | FC:2245–2270 | Haushalt | LAB:630–631 | FOLGT (Haushalt → Fläche → Form; nur Labor) |
| 34 | hp.leute aus dem Programm | = Personen, ≤ 12 | Pers. | FC:2274 | Haushalt | FC:9531 (in der Welt nie gesetzt: Grep `\.leute\s*=`: nur FC:2274) | FOLGT (nur Labor) |
| 35 | LEUTE_GESETZ.nutz | 0,7 | Anteil | FC:9526 | Kommentar „Wände, Stiege“ | FC:2246, 2258, 9535 | GESETZT |
| 36 | LEUTE_GESETZ.flaeche | 20 | m²/Pers. | FC:9526 | Kommentar „Kammer der Armen“ | FC:9536 | GESETZT |
| 37 | LEUTE_GESETZ.wohlFlaeche | 20 | m²/Pers./wohl | FC:9526 | keiner | FC:9536 | GESETZT |
| 38 | LEUTE_GESETZ.max | 12 | Pers. | FC:9526 | keiner | FC:2274, 9531, 9537 | GESETZT |
| 39 | LEUTE_GESETZ.rolle | scheune 0 · halle 0 · kirche 1 · schmiede 2 · kapelle 0 · speicher 0 · zeughaus 0 · backhaus 2 · torhaus 2 | Pers. | FC:9526 | Kommentar „ihren Pfarrer … Meister und Gesellen“ | FC:9530 | GESETZT |
| 40 | Leute je Haus (Ausgabe) | round(W·D·st·0,7 / (20+20·wohl)), 1–12 | Pers. | FC:9532–9537 | Fläche × wohl | SB:779, SB:839, FC:4512 | FOLGT (aus Haus-Maß und wohl) |
| 41 | wohl je Los | (1,22 − 0,5·Rang) · (0,78 + 0,44·rnd) | — | FC:4438 | keiner | FC:4439, 4444, 4447, 4448, 4340, 4512, 9533 | FOLGT (Los-Rang + Samen; Konstanten gesetzt) |
| 42 | Breite nach wohl | W · (0,84 + 0,30·wohl) | m | FC:4439 | keiner | Haus-Bau über ov | FOLGT (aus wohl) |
| 43 | Ring-Breite | W · (0,80 + 0,38·Rang) | m | FC:4437 | Kommentar „Parzellen-Gedächtnis“ | Haus-Bau | GESETZT |
| 44 | +1 Geschoss | städtisch ∧ wohl > 0,9 ∧ st < 4 | Gesch. | FC:4444 | keiner | Haus-Bau | GESETZT |
| 45 | Stadtkörper | st · (1,85 − 1,45·t); Turm 7–11 Gesch. (t < 0,16, > 1920, 0,6) | Gesch. | FC:4441–4442 | keiner | Haus-Bau | GESETZT |
| 46 | Keller-Würfel | 0,35 | P | FC:4446 | keiner | FC:212, 390, 1250 | GESETZT |
| 47 | Anbau-Würfel | 0,25 | P | FC:4446 | keiner | FC:185 | GESETZT |
| 48 | arm | n ≥ 16 ∧ wohl < 0,72 | — | FC:4447 | keiner | FC:6138 (keine Möbel), FC:3543 (Labor) | GESETZT |
| 49 | Balkon | wohl > 0,95 ∧ st ≥ 2 ∧ 0,5 | P | FC:4448 | keiner | Haus-Bau | GESETZT |
| 50 | Grundriss-Würfel | I 0,85 (Stadt) / 0,68 (Dorf), L bis 0,9 | P | FC:4449 | keiner | Haus-Bau | GESETZT |
| 51 | Downtown | Lose < 22 %, 0,72; 8–23 Gesch.; W 12–17; D 10–14; Glas 0,62 | m / Gesch. | FC:4453–4457 | Epoche ≥ 1905 (Kommentar) | Haus-Bau | GESETZT |
| 52 | Halle | ab 78 % Rang, 0,6; W 12–15 · D 9–12 · 1 Gesch. · 14° | m | FC:4458–4460 | Epoche (Kommentar: vor 1850 keine Halle) | Haus-Bau; FC:9526 (0 Leute) | GESETZT |
| 53 | Burg | W 13–14 · D 11 · 3 Gesch. · wohl 1,2 | m | FC:4473–4474 | keiner | Haus-Bau | GESETZT |
| 54 | Kirchen-Marke je Region | z. B. barock 14 × 11, gotisch 7 × 9 | m | FC:4461 | Region/Jahr (Wahl), Maß keiner | FC:4462 | GESETZT |
| 55 | Scheunen-Quote | weiler 0,75 · dorf 0,55 · markt 0,28 · stadt 0,06 · grossstadt 0,04 · metropole 0,03 | P | FC:4476 | keiner | FC:4478 | GESETZT |
| 56 | Scheunen-Maß | min(7, min(W,D) − 2), 1 Gesch., Neigung ≥ 28° | m | FC:4479–4481 | keiner | Haus-Bau | GESETZT |
| 57 | wohl im Burg-Viertel | 1,2 | — | FC:4399 | keiner | — | GESETZT |
| 58 | Bänder der Zeit | mittelalter 500–1500 · fruehneuzeit 1500–1800 | Jahr | FC:4321 | Epoche | FC:4377, 4469 | GESETZT |
| 59 | herrAb | 49 | Lose | FC:4322 | keiner | FC:4470 | GESETZT |
| 60 | Grund-Satz Gasthaus | ab 8 Losen, Los 1 | Lose | FC:4323 | keiner | FC:4386, 4468 | GESETZT |
| 61 | Grund-Satz Schmiede | ab 10 Losen, Los 0,62·n | Lose | FC:4323 | keiner | FC:4386, 4468 | GESETZT |
| 62 | Kirchhof-Lose | [2, 3] bzw. [2, 4] ab n ≥ 27 | Lose | FC:4327 | keiner | FC:4384 | GESETZT |
| 63 | Markt-Lose | 4 + klemm(0,07·n, 2, 18) | Lose | FC:4330 | keiner | FC:4384 | GESETZT |
| 64 | Handwerk-Lose | max(6+…, 0,55·n) + 0,14·n | Lose | FC:4333 | keiner | FC:4384 | GESETZT |
| 65 | Handwerk je-Folge | backhaus je 9 · speicher je 7 (MA) / 6 (FNZ) · gerberei je 5 · Rest werkstatt | Lose | FC:4334 | keiner | FC:4392 | GESETZT |
| 66 | Markt je-Folge | rathaus 1 · zunfthaus 1 (FNZ) · kontor je 4 · Rest kaufhaus | Lose | FC:4331 | keiner | FC:4392 | GESETZT |
| 67 | Wohnturm-Regel | je 5, wohl ≥ 1,1, Rang < 0,45 | — | FC:4340 | keiner | FC:4390 | GESETZT |
| 68 | Patrizier-Regel | wohl ≥ 1,1 / 1,05 · Rang < 0,45 / 0,5 | — | FC:4340 | keiner | FC:4390 | GESETZT |
| 69 | fremde Kulturen je Region | z. B. mitteleuropa holländisch/italienisch | — | FC:4324 | keiner | FC:4379 | GESETZT |
| 70 | Geschosshöhe EG | 2,55 | m | FC:178 | keiner | FC:214 | GESETZT |
| 71 | Geschosshöhe OG | 2,35 | m | FC:178 | keiner | FC:214 | GESETZT |
| 72 | Kellerhöhe | 2,40 | m | FC:213 | keiner | FC:390, 414 | GESETZT |
| 73 | Keller ohne Angabe | 1 (an) | — | FC:212 | keiner | FC:259, 390, 1250 | GESETZT |
| 74 | Dachraum nutzbar ab | 1,90 | m über Traufe | FC:254–255 | Kommentar „nutzbarer Dachraum“ (Norm-Name, ohne Quelle) | FC:255, 382 | GESETZT |
| 75 | Raum-Gewichte | EG Wohnen [2,3; 1,3] 0,40 / [1]; Küche [1,6; 1] / [1,7; 1; 0,8]; OG [1,8; 1,2] 0,6 / [2,2]; [1,7; 1] / [1,6; 1; 0,8] | Verhältnis | FC:601–605 | keiner | FC:617 | GESETZT |
| 76 | Mindest-Raumtiefe | max(1,75; 3,7 / Streifen) | m | FC:607 | keiner | FC:609, 612 | GESETZT |
| 77 | Schnitt-Abstand vom Herd | 1,35 | m | FC:609 | keiner | FC:609 | GESETZT |
| 78 | Raum mindestens | 1,2 | m | FC:621 | keiner | FC:621 | GESETZT |
| 79 | Raumfunktion | Küche = nächster am Herd · Stube = größter EG · Rest EG Vorrat · OG Kammern, kleinster Vorrat ab 3 | — | FC:623–630 | Herd-Lage, Größe | FC:1234–1240 | FOLGT (aus Geometrie und Samen; nicht aus Nutzung) |
| 80 | Innenwand · Innentür | 0,12 · 1,0 × 2,0 | m | FC:897 | keiner | FC:898–905 | GESETZT |
| 81 | Kammer-Möbel | Bett, Truhe fest; Schrank 0,78 · Kommode 0,55 · Hocker 0,4 · Regal 0,45 | P | FC:1234 | keiner | FC:1248 | GESETZT |
| 82 | Stube-Möbel | Tisch mittig; Stuhl je Seite 0,7 · Regal 0,65 · Truhe 0,55 · Kommode 0,5 | P | FC:1232, 1235–1237 | keiner | FC:1248 | GESETZT |
| 83 | Küche-Möbel | Tisch, Regal, Fass fest; 2. Fass 0,6 · Bank 0,6 · Kommode 0,55 · Hocker 0,5 | P | FC:1238–1239 | keiner | FC:1248 | GESETZT |
| 84 | Möbel-Maße | Bett 1,95 × 1,0 · Tisch 1,4 × 0,85 × 0,74 · Schrank 1,1 × 0,55 × 1,85 · Kommode 1,05 × 0,5 × 0,82 · Truhe 1,1 × 0,55 × 0,44 · Stuhl Sitz 0,45 | m | FC:1127, 1148, 1158, 1175, 1187, 1206 | keiner | FC:1234–1240 | GESETZT |
| 85 | Holz-Gesetz | weich spanMax 0,78 · legK 1,20 / hart 1,12 · 0,84 | m / × | FC:1121–1122 | Material (Kommentar Festigkeit Fichte/Eiche) | FC:1128, 1138, 1148 | GESETZT (die Beinzahl FOLGT daraus, FC:1138) |
| 86 | Bewegungsfläche vor Tür | 1,05 | m | FC:1243 | Kommentar „DIN-Bewegungsflächen“ (Norm-Nummer fehlt) | FC:1224 | GESETZT |
| 87 | Keller-Inventar | 2 Regale, Tisch, 3 Fässer, Truhe, Kommode + 3 Würfel (0,7 / 0,6 / 0,6) | Stück | FC:1254 | keiner | FC:1250 | GESETZT |
| 88 | Möbel aus | st ≥ 6 ∨ arm | — | FC:6138 | keiner | Stufe 0 der Welt (`stufe0Param`); LAB:101 | GESETZT |
| 89 | Herd-Körper | 1,5 × 1,1 (Box 1,05 × 1,5) | m | FC:589, 592 | keiner | FC:590, 1244 | GESETZT |
| 90 | ländlicher Hof ab | gap ≥ 0,6 | m | FC:3531 | keiner | FC:3532–3554 (nur Labor) | GESETZT |
| 91 | Frontleben | 0,38 | P | FC:3532 | keiner | nur Labor | GESETZT |
| 92 | Holzstapel | arm ∨ Baujahr < 1890 | Jahr | FC:3543 | keiner | nur Labor | GESETZT |
| 93 | Beete · Leine | 0,62 · 0,45 | P | FC:3547, 3551 | keiner | nur Labor | GESETZT |
| 94 | Efeu | Baujahr < 1800, 0,35 | Jahr / P | FC:3557 | keiner | nur Labor | GESETZT |
| 95 | Tonne im Stadthof | Baujahr > 1930 | Jahr | FC:3538 | keiner | nur Labor | GESETZT |
| 96 | Angebot je Rolle | wohnhaus besuch 1 · gasthaus arbeit 2/mahl 8/treff 8 · schmiede 2 · burg 6 · halle 6 · turm 4 · sonst arbeit 3/treff 1 … | Güte | KC:5177–5187 | keiner | KC:5243, 5250 ← SB:784 | GESETZT |
| 97 | Stadt-Geschoss · Sockel | 2,7 · 0,5 | m | FC:4072 | keiner | FC:4492, 4494 | GESETZT |

## (3) ZWILLINGE UND TOTE

**Zwillinge**
- **Fläche je Person, zweimal:** `wohnhaus.raeume` 20 + 20·wohl m² (FC:2183) und `LEUTE_GESETZ.flaeche/wohlFlaeche` 20/20 (FC:9526). Das sind dieselben Zahlen an zwei Orten, die eine füllt das Haus mit Räumen (Labor), die andere rechnet Bewohner aus dem Haus (Welt).
- **Geschosshöhe, zweimal:** egH/ogH 2,55/2,35 und foundH 0,55 (FC:178) gegen `STADT_MASSEN.geschossM` 2,7 und sockelM 0,5 (FC:4072, gelesen FC:4492–4494 für die Stadtform).
- **Vier Rollen-Tafeln mit verschiedenen Namen:** BAU_NUTZUNG (FC:2182, 18 Typen), LEUTE_GESETZ.rolle (FC:9526, 9 Typen), TAGES_GESETZ.angebot (KC:5176, 10 Typen + sonst), hofFuer-Zweige (FC:3517, 3555, 3559). Rathaus, Kontor, Kaufhaus, Zunfthaus, Pfarrhaus, Bergfried, Werkstatt, Gerberei, Wohnturm, Patrizierhaus und Gasthaus fehlen in LEUTE_GESETZ.rolle und fallen in die Flächenformel. Bis auf schmiede und gasthaus fallen alle Viertel-Typen in `angebot.sonst`.
- **Maß-Pfade neben der Tafel:** Kirche (FC:4461–4462), Burg (FC:4473–4474), Halle (FC:4459), Downtown-Turm (FC:4456) und Scheune (FC:4480) setzen ihr Maß inline. FC:2172 nennt BAU_NUTZUNG als die Tafel der Nutzungsmaße, diese fünf Typen stehen aber nicht darin.
- **Raumteilung, zweimal:** `bauProgramm` (Räume in m², FC:2248) und `prog`/`layout` im Haus-Bau (Gewichte, FC:601–618). Die Gewichte lesen weder die Räume noch die Personen des Programms.

**Tote** (deklariert, aber ungelesen oder unerreichbar)
- `bauProgramm` in der Welt: alle 9 Welt-Aufrufe von `bauRezept` übergeben `null` als Haushalt (FC:4381, 4382, 4398, 4436, 4450, 4462, 4468, 4473, 5775). Der einzige Haushalt kommt aus LAB:629 (Regler LAB:809).
- `hp.programm` (FC:2274): Grep `\.programm` zeigt keinen Leser dieses Felds (die Treffer in netz-identitaet.js meinen ein anderes Objekt).
- `hp.parzelle` (FC:2255): ohne Erzeuger (Grep `\.parzelle|parzelle:`: nur FC:2236, 2255).
- `rahmen.dicht` (FC:2255): ohne Erzeuger. Die Rahmen der Welt sind `{region, band}` (FC:4382) und `{region, jahr}` (FC:4468). `jahr` liest keine Bedingung, die Bedingungen lesen region/band/stil (FC:2184–2200).
- Grundriss-Zweige hof/U/T/kreuz (FC:2261–2263), Lagen anbau/keller/laube/turm/fluegel/offen (FC:2249–2253, 2271–2273) und `N.personen` (FC:2246) sind unerreichbar: die einzige Zeile mit Räumen (wohnhaus) trägt nur `wohnen/kern` und ['I','L'].
- Räume `dach` und `getrennt` werden übersprungen (FC:2249). Einen Dachboden als Raum gibt es nicht, nur den Lauf zum Speicher (`hasAttic` FC:255, 259).
- `dims.rooms` samt `func` (Export FC:1809): außerhalb von FC:1234–1240 ohne Leser (Grep `\.rooms\b`/`\.func\s*===`: nur netz-p2p-Lobby, fachwerk-core selbst).
- `hofFuer` in der Welt: 0 Leser in stamm/ (Grep). Die Regeln Armut → Holzstapel und Rolle → Kisten/Trog (FC:3543, 3555, 3559) gibt es nur im Labor.
- Labor: `formSetzen` übernimmt W/D/Geschosse/Anbau/Balkon, nicht aber `hp.leute` (LAB:630).

## (4) WAS DER SAMEN ERREICHT

| Eingang | kommt an? | Beleg |
|---|---|---|
| **Samen** | ja | Kultur und Haus-Samen je Los (FC:4435); Würfel für Keller, Anbau, Grundriss, Balkon (FC:4446–4449); Raumschnitte und Möbel über `rndI` aus P.seed (FC:598); Kaminlage (FC:586) |
| **Ort/Region** | teils | Kultur-Pool (FC:4424), fremde und herrschaftliche Kultur des Bau-Typs (FC:4378–4379), Gasthaus-Arkade (FC:2184), Kirchen-Marke (FC:4461). Raumprogramm und Innenraum: nein |
| **Epoche** | teils | Das Band wählt den Bau-Typ je Viertel (FC:4389–4394), Rathaus Zinnen/Arkade (FC:2186), Halle ab 1850 (FC:4458), Downtown ab 1905 (FC:4452). Innenraum und Möbel: nein (Grep `P\.baujahr` in FC: 0). Hof (Holzstapel/Efeu/Tonne): nur Labor |
| **Bewohner** | **nein (als Eingang)** | Die Welt reicht keinen Haushalt an `bauRezept`. Es läuft umgekehrt: Haus → `leuteVon` (FC:9535) → so viele Bewohner (SB:839–845) |
| **Gewerbe/Nutzung** | teils | Rolle → Außenmaß (BAU_NUTZUNG.mass, FC:2227) und Angebot/Beruf (KC:5250, SB:874–875). Innenräume, Möbel und Keller-Inventar lesen keine Rolle: die Schmiede hat innen Stube/Kammer wie das Wohnhaus (FC:623–630) |
| **Wohlstand** | teils | wohl → Breite (FC:4439), +1 Geschoss (FC:4444), arm (FC:4447) → keine Möbel (FC:6138), Balkon (FC:4448), Wohnturm/Patrizier (FC:4340), Leute (FC:9536). Die Raumgröße bestimmt wohl in der Welt nicht (nur bauProgramm, Labor) |

**Antwort auf die Frage:** In der Welt ist das Programm eines Hauses je Bau-Typ eine feste Tabelle plus gewürfelte Los-Maße, keine Folge aus Bewohnern. Bewohner und Beruf leiten sich aus dem Haus ab, nicht das Haus aus ihnen. Das Gesetz, das es umdrehen würde (`bauProgramm`), läuft nur im Labor und trägt dort nur die Zeile wohnhaus.

**Schluss:** Größen gesamt 97 · davon GESETZT ohne Anker 75 · davon FOLGT 6 (Nr. 33, 34, 40, 41, 42, 79; 33/34 nur im Labor) · GESETZT mit Anker (nur Kommentar, keine Quelle) 16.

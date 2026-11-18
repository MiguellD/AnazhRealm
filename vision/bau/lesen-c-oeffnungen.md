# Lesen (c): Öffnungen — main 18058dba

**Feld:** fachwerk-core.js (12 518 Z.) · stamm/siedlung-tor.js (863) · stamm/stoff-material.js (3 859) · porta-core.js (1 855) · foundry-bruecke.js (1 060). Nur gelesen (Read/Grep), kein Bild, kein Lauf.

**Kurzbefund.** Die Öffnungen haben EINEN Bauer (`fensterAt` fachwerk-core.js:1080), aber keinen Samen: Breite folgt halb dem Ständer-Raster (Feldbreite − 0,34, gekappt bei 1,05 m), Höhe, Brüstung und Sturz sind zwei feste Paare je EG/OG (476), die Zahl würfelt der Same ohne Raum (479 „jedes / jedes zweite Feld"). Jeder Teilbau (Flügel, Hof, Turm, Terrasse, Gaube, Anbau, Rundbau, Kuppel) ruft `fensterAt` mit eigenen wörtlichen Maßen — elf Maß-Sätze für dasselbe Ding. Licht-Bedarf, Epoche und Glasgröße erreichen das Fenster nicht: der Raum liest das Licht AUS den Öffnungen (`raumVon` 5999), nie umgekehrt; `baujahr` liest kein Fenster-Code; „kleine Fenster" (mittelalterlich, 2125) ist nur ein Kommentar. Die graue Tafel hat eine benannte Wurzel: der Flügel steht in JEDEM Fenster JEDER Stufe 0,62 rad nach AUSSEN offen (1084/1089), seine Scheibe (45 % der Fenster `glasdunkel`, Deckkraft 0,92) steht als Tafel bis 0,58·w vor der Wand, während die Öffnung selbst leer ist; in der Fern-Stufe liegt zusätzlich eine Scheibe 11 cm VOR der Wandfläche (2810).

## (1) WAS TRÄGT

| Gesetz / Funktion | datei:zeile | Leser |
|---|---|---|
| `wallSpec` — Rolle je Gefach-Feld (window/pier/door/corner), Fenster-Maße | fachwerk-core.js:477-497 | `WALLS` 498 → `fenster()` 1091, `riegel()` 653-655, `streben()` 669-670, `gefache()` 702-704, `wandFelder()` 689, Möbel-Freizone 633-636, `_oeffnungenDerEinheit` 1792 |
| `axis` / `bxFront` / `bx` / `bz` — Ständer-Raster (bayMax) | 418-424 | `patternFor` 481-482 (Feldbreite `wdt`) |
| `fensterAt` — Rahmen, Bogen-Deckel, Flügel, Licht-Eintrag | 1080-1090 | 764, 799, 1091, 1292, 1358, 1522 (2×), 1619 (2×), 1620 (2×), 1702 (2×), 1703 (2×) |
| `windowSash` — Flügel-Rahmen, Kreuz, Scheibe (nah + Flächen-Stufe) | 1010-1021 | `fensterAt` 1083, 1088 |
| `lichtAuf` → `LICHT` | 322-323 | `fensterAt` 1080, Flügel-Tür 1347, Rundbau 1635/1637; Export `licht:LICHT` 1803 → `raumVon` 6012 |
| `fensterSchlaeft` (EIN Würfel je Fenster) | 2752-2759 | 1080, 1520, 1700, 1791, 2804 |
| `windowOpenings` / `fensterVon` | 1789-1796, 2846 | `fensterFern` 2790 (via 3569, 3586), `raumVon` 6001 |
| `fensterFern` — Fern-Fenster (Kasten, Scheibe, Kreuz, Flügel) | 2790-2823 | `fragFuer` 3569, 3586 |
| `_innenFaktor` / Innenkörper der L1 | 2768-2774, 3578-3585 | `fensterFern` 2794, `fragFuer` 3578 |
| `tueren()` — Haustür, Oberlicht, Hintertür | 968-991 | Subsystem `tueren` (order 1786); Flügel-DATEN `side/offen` → siedlung-tor.js:837-841 |
| `LICHT_GESETZ.fenster` + `M.glas.userData.__licht` | 6433, 2098 | foundry-bruecke.js:709 (`out.mat.licht`) → stoff-material.js:713, 2096-2102 (`lichtGlut`) |
| `TUER_GESETZ` | porta-core.js:1695 | siedlung-tor.js:719, 826, 840 (`_tuerOffenRad`, `_tuerFernAnteil`) |
| `bakeLOD(…, alles)` — Fenster werden Teil des Bakes | 2444-2478 | `fragFuer` 3561, 3574, 3585; Rolle je Stoff `_roleByMat` 2454 |

## (2) DIE GRÖSSEN

Urteil: FOLGT (Kette) · GESETZT (Anker keiner) · GESETZT/Anker (Messung oder L0-Zwilling) · TEILS.

| # | Name | Wert | Einheit | datei:zeile | Anker | Leser | Urteil |
|---|---|---|---|---|---|---|---|
| 1 | winEG.off (Fenstermitte über Schwelle) | 0,95 · modern 1,18 | m | 476 | keiner | 491-495 | GESETZT |
| 2 | winEG.ch (Fensterhöhe EG) | 0,95 · modern 1,55 | m | 476 | keiner | 495, 492 | GESETZT |
| 3 | winOG.off | 0,80 · modern 1,02 | m | 476 | keiner | 491-495 | GESETZT |
| 4 | winOG.ch | 0,92 · modern 1,45 | m | 476 | keiner | 495, 492 | GESETZT |
| 5 | Fensterbreite wd | min(1,05 · modern 1,7; wdt − 0,34) | m | 495 | Feldbreite aus `axis` | 631, 1091, 655, 689, 702 | TEILS — FOLGT Raster, Kappe 1,05/0,34 gesetzt |
| 6 | Mindest-Feldbreite für Fenster | wdt > 0,98 | m | 485 | keiner | 485 | GESETZT |
| 7 | Achs-Sperre (Ständer/Treppe) | 0,28 | m | 478 | keiner | 485 | GESETZT |
| 8 | Fenstertakt | rnd < 0,5 → 1 · 2 (modern 1) | Feld | 479 | Same, kein Raum | 485 | GESETZT |
| 9 | Symmetrie i ↔ n−1−i | — | — | 484-485 | Ständer-Raster | 485 | FOLGT (Raster) |
| 10 | bayMax (Feld ≤) | 1,7 | m | 181 | keiner | `axis` 420 | GESETZT |
| 11 | Fenster-Sockel yLo | L.y + sill 0,18 / raehm 0,16 | m | 491, 179 | Schwelle/Rähm | 492, 495 | FOLGT (Tragwerk) |
| 12 | winW-Fallback | min(hi−lo−0,3; 1,1) | m | 631 | keiner | 634, 655, 689, 702, 1091, 1093, 1792 | GESETZT (Zwilling zu #5) |
| 13 | Ort der Hauptwand-Öffnung | ±(Dp/2 − 0,02) bzw. ±(W/2 − 0,02) | m | 488-489 | Wandachse | 1091 | FOLGT |
| 14 | Sturz in fensterAt | (w+0,2) × 0,10 × 0,18, +0,05 | m | 1081, 1086 | keiner | — | GESETZT |
| 15 | Fensterbank | (w+0,22) × 0,10 × 0,24 | m | 1081, 1086 | keiner | — | GESETZT |
| 16 | Pfosten | 0,10 × (h+0,1) × 0,18 bei ±(w/2+0,05) | m | 1082, 1087 | keiner | — | GESETZT |
| 17 | Flügel-Öffnung | 0,62 (nach außen) | rad | 1084, 1089 | keiner | `strahlFluegel` 339; Zwilling #59 | GESETZT |
| 18 | Bogen über Fenster | Spann w·0,58, Fuß +0,12 | m | 1081, 1086 | Bogentyp aus Preset (2143, 2151, 2153) | `bogenRahmen` 1049 | GESETZT |
| 19 | Bogen-Deckel Doppel-Sample | 0,22 | m | 1080 | keiner | `bogenRahmen` cap | GESETZT |
| 20 | Flügel-Rahmen sw · Stärke t | 0,06 · 0,05 | m | 1010 | keiner | 1011-1020 | GESETZT |
| 21 | Fensterkreuz | 0,04 × 0,045 | m | 1017, 1020 | keiner | — | GESETZT |
| 22 | Scheibe im Flügel | 0,025 dick, −0,012 versetzt | m | 1017, 1020; flächig 1014 | keiner | — | GESETZT |
| 23 | Stoff `glas` | 0x33576a, Deckkraft 0,42, Rauheit 0,15 | — | 2071 | keiner | `windowSash` 1010, 973, 1637, 1754, 2811, 2820, 6023 | GESETZT |
| 24 | Stoff `glasdunkel` (Schlaf) | 0x2b4457, Deckkraft 0,92 | — | 2089 | keiner | 1080, 2794-2795 | GESETZT |
| 25 | FENSTER_SCHLAF | 0,45 | Anteil | 2751 | keiner | 2758 | GESETZT |
| 26 | Schlaf-Raster | 0,25 (u·4, cy·4) | m | 2754-2756 | keiner | 2758 | GESETZT |
| 27 | LICHT_GESETZ.fenster | 2800 K; abend 0,42, nacht 0,85 | K / Faktor | 6433 | keiner | stoff-material.js:713, 2100 | GESETZT |
| 28 | Möbel-Freizone vor Fenster | 0,40 tief, ±0,1 | m | 634 | keiner | `addCircR` 635-636 | GESETZT |
| 29 | Kamin-Korridor | STACK_W/2 + doorW/2 | m | 596-597 | Kaminlage | WALLS | FOLGT (Herd) |
| 30 | Anbau-Okklusion | ±0,3, −0,05 | m | 546 | Anbau-Zelle | WALLS | FOLGT |
| 31 | Flügel-Dach-Okklusion | Unterkante < roofAt | m | 583-584 | Flügeldach | WALLS | FOLGT |
| 32 | Französischer Balkon | stil stein ∧ pitch ≥ 45; H 1,0, vor 0,20, Breite wd+0,5, Stab 0,16 | m | 1092-1096 | keiner | — | GESETZT |
| 33 | Giebelfenster | wz 0,8 · hy 0,66 · cy min(0,95; 0,42·Δ), Δ > 1,25, hip < 0,6 | m | 713-714 | Giebelhöhe | 764, 1793 | TEILS (Lage folgt Δ, Maße gesetzt) |
| 34 | Gaube-Fenster | gW−0,30 × (frontTop−baseY2)−0,25, +0,05, z+0,02; gW = clamp(W·0,16; 1,15; 1,6) | m | 256, 799 | W | 799 | TEILS |
| 35 | Anbau-Fenster | 0,8 × 0,55, wy0 + 1,2 (wy0 = 0,06) | m | 1277, 1290-1292 | keiner | 1292; Zwilling 1795 | GESETZT |
| 36 | Flügel-Traufwand-Fenster | wd clamp(breadth−1,4; 0,85; 1,2); cy yB+1,25 / +1,0; ch 0,95 / 0,9 | m | 1370-1372 | keiner | `panel` 1353-1358 | GESETZT (Zwilling zu #1-4) |
| 37 | Flügel-Giebel-OG-Fenster | wd clamp(breadth−1,6; 0,8; 1,1); cy yB+1,0; ch 0,9 | m | 1376 | keiner | 1358 | GESETZT |
| 38 | Hof-Arm-Fenster | n = round(lz/2,2); cy min(wH−0,55; 1,5); w min(0,8; lz/n·0,4); h 0,9 | m | 1518-1522 | keiner | 1522, 1520 | GESETZT |
| 39 | Terrassen-Fenster | h 1,0; cy y+tH·0,5; n = round(w/2,8); w min(0,85; Feld·0,5); Ort Außenfläche −0,02 | m | 1598, 1604, 1619-1620 | keiner | 1619-1620 | GESETZT |
| 40 | Turm-Fenster | w min(0,85; tw·0,5); h 1,05; cy 1,8 + s·2,4; Ort Außenfläche −0,02 | m | 1686, 1699-1703 | keiner | 1702-1703, 1700 | GESETZT |
| 41 | Rundbau-Fenster | jedes 2. Segment; w chord·0,5·0,9; h max(0,5; wH−1,9); Glas 0,10 dick, fest | m | 1636-1638 | keiner | — | GESETZT |
| 42 | Kuppel-Tambour-Fenster | W·0,13 × (springY−base)·0,42, 3 je Seite, Glas 0,05 | m | 1754 | keiner | — | GESETZT |
| 43 | Wand-Ausfachung (Tiefe um die Öffnung) | Lehm 0,06 · Backstein 0,085 · GLATT P.post 0,16 | m | 640-644, 678 | keiner | `gefache` 702-704 | GESETZT |
| 44 | Loch-Wand (Hof/Turm/Terrasse) | 0,22 · 0,24 · 0,26 | m | 1513, 1534, 1683 | keiner | `lochWand` | GESETZT |
| 45 | Haustür doorW × doorH | 1,1 × 2,05 | m | 181 | keiner | 220, 968-984, 1347, 423 | GESETZT |
| 46 | Türstock · Sturz | 0,14 × (h+0,12) × 0,26 · (doorW+0,36) × 0,16 × 0,26 | m | 969-970 | keiner | — | GESETZT |
| 47 | Oberlicht | ≤ 0,42 hoch, Glas 0,035, 3 Sprossen | m | 971-975 | keiner | — | GESETZT |
| 48 | Haustür offen | 1,15 | rad | 968, 981 | keiner | siedlung-tor.js:841 (`t.offen`) | GESETZT |
| 49 | Hintertür | offen 1,05 rad; Breite min(1,0; Lücke−0,2); Lücke ±0,62 | rad / m | 968, 985, 687, 693 | keiner | 990-991 | GESETZT |
| 50 | Balkontür | Lücke ±0,52; Höhe levels[1].y + 2,06 | m | 686-687, 699 | keiner | wandFelder/gefache | GESETZT |
| 51 | Flügel-Durchgang | dw min(0,55; …−0,12) | m | 572 | keiner | 687, 696 | GESETZT |
| 52 | Flügel-Giebeltür | gdc ± 0,49; Schwing 0,95 rad | m / rad | 1373, 1378 | keiner | 1375, 1377 | GESETZT |
| 53 | TUER_GESETZ | offen 1,95 rad, fern 0,5 | rad / Anteil | porta-core.js:1695 | keiner | siedlung-tor.js:719, 826 | GESETZT |
| 54 | Anbau-Tor · Personentür | min(2,45; gw−0,55) × 2,0 · 0,85 × 2,0 | m | 1797-1799 | keiner | `annexDoors` → 6020-6022 | GESETZT |
| 55 | Turm-Portal | pw2 min(0,6; tw·0,36); pH 1,55 | m | 1686, 1693, 1698 | keiner | — | GESETZT |
| 56 | Terrassentür | 0,95 × min(2,05; tH−0,18) | m | 1612-1614 | keiner | — | GESETZT |
| 57 | RAHMEN_TIEFE (fern) | 0,10 | m | 2785 | L0 0,09 / Bank 0,12 | 2806 | GESETZT/Anker (Zwilling) |
| 58 | SCHEIBE_RAND (fern) | 0,06 | m | 2786 | L0 sw 0,06 | 2809, 2816 | GESETZT/Anker (Zwilling) |
| 59 | KREUZ (fern) | 0,02 | m | 2787 | L0 0,04/2 | 2812-2813 | GESETZT/Anker (Zwilling) |
| 60 | FLUEGEL_LAGE (fern) | [0,8138785; 0,5810352] | cos/sin | 2788 | L0 0,62 rad | 2815 | GESETZT/Anker (Zwilling) |
| 61 | Fern-Scheibe / Glas / Kreuz | d1+0,01 · +0,02 · +0,03 vor der Wand | m | 2810-2812 | keiner | — | GESETZT |
| 62 | Fern-Rahmen-Kasten | (w+0,2) × (h+0,2), 2 cm in die Wand | m | 2806 | L0-Sturz w+0,2 | — | GESETZT |
| 63 | INNEN_DAEMMER | 0,92 | Faktor | 2767 | gemessen 176 vs 60 (2760-2761) | 2772 → 2794, 3578 | GESETZT/Anker (Messung) |
| 64 | Innenkörper L1 | Einzug 0,55; Höhe eY−0,25; +0,05 | m | 3580-3584 | keiner | `bakeLOD` 3585 | GESETZT |
| 65 | Raum-Durchlass des Glases | 1 − glas.opacity = 0,58 | Anteil | 6023 | Stoff #23 | `raumVon` → `deckenZeile` | FOLGT (Stoff) |
| 66 | PROXYHAUS-Fenster (nur Labor) | 0,85 × 1,2 × 0,1; n round(W/2,4); y g·2,75+1,55 | m | 4553-4557 | keiner | worlds/fachwerk/fachwerk.js:52, 59 | GESETZT |

Gemessene Folgerung aus #1-4 und #11 (Rechnung): EG-Brüstung 0,18+0,95−0,475 = 0,655 m, EG-Sturz 1,605 m über Schwelle; OG-Brüstung 0,16+0,80−0,46 = 0,50 m, OG-Sturz 1,42 m — beide Stürze UNTER Augenhöhe (Spieler 1,7, Kommentar 783), bei egH 2,55 / ogH 2,35 (178). Keine Kette verbindet Sturz und Geschosshöhe.

## (3) ZWILLINGE UND TOTE

- **Fensterbreite zweimal:** wallSpec `min(1,05; wdt−0,34)` (495) gegen `winW`-Fallback `min(hi−lo−0,3; 1,1)` (631). Der Fallback greift nur ohne `win.wd` — bei jedem Hauptwand-Fenster ist `wd` gesetzt (495), der Fallback ist praktisch tot.
- **Fenster-Maße je Teilbau elfmal:** Haupt (476), Flügel-Traufe (1370-1372), Flügel-Giebel (1376), Giebel (713), Gaube (799), Anbau (1290), Hof (1518), Terrasse (1604), Turm (1686), Rundbau (1637), Tambour (1754). Dieselbe Frage („wie groß ist ein Fenster in diesem Raum") hat elf Antworten, keine liest einen Raum.
- **Anbau-Fenster doppelt:** Bau `0,8 × 0,55` bei `wy0+1,2` (1290-1292) und Fern-Liste `w:0.8, h:0.55, cy:0.06+1.2` (1795) — zwei Literale, dieselbe Zahl.
- **Nah ↔ Fern:** Die Fern-Stufe (`fensterFern` 2790) baut das L0-Fenster mit eigenen Konstanten nach (#57-60). `FLUEGEL_LAGE` ist cos/sin von 0,62 als Literal (2788) — ändert sich 1084, bleibt der Fern-Flügel stehen. RAHMEN_TIEFE 0,10 nähert L0 0,09/0,12 (Kommentar 2776-2777).
- **Fern zeigt, was Nah nicht hat:** L0 hat in der Öffnungsebene KEINE Scheibe (der Flügel ist offen, 1083-1084); die Fern-Stufe legt eine geschlossene Scheibe + Innenkörper-Fläche frontal vor die Wand (2810-2811) UND den offenen Flügel mit zweiter Scheibe (2817-2820). Zwei Scheiben fern, keine in der Öffnung nah.
- **Fern-Liste unvollständig:** `windowOpenings` (1792-1796) trägt Stockwerk, Giebel, Anbau, Turm/Hof (FERNFENSTER) — nicht Gaube (799), Terrasse (1619-1620, `_fT` überspringt sie), Rundbau (1637), Tambour (1754). DESTNUR schaltet `dachwerk:false` (2296), damit fällt das Gauben-Fenster fern ganz; `fluegel` steht nicht in DESTNUR, seine Fenster baut die L2 als volle `fensterAt`-Geometrie (1358).
- **Licht-Liste ≠ Fern-Liste:** `LICHT` (322) und `windowOpenings` (1789) sind zwei Listen derselben Öffnungen; `raumVon` vereint sie per Nähe-Probe (6007-6011, 0,3/0,6 m) — ein Pflaster für den Zwilling.
- **raumVon liest falsches Glas:** Durchlass 1 − 0,42 (6023) gilt für jedes Fenster; 45 % schlafen in `glasdunkel` 0,92 (2089, 2751), und der Flügel steht offen (keine Scheibe in der Öffnung) — die Rechnung beschreibt keines der beiden.
- **PROXYHAUS** (4540-4557): dritter Fenster-Pfad (dunkle Kästen 0,85 × 1,2); Leser nur das Labor worlds/fachwerk/fachwerk.js:52/59, Grep in stamm/ ohne Treffer.
- **`glasfern`** (2091) ist kein Fenster-Stoff: einziger Bau-Leser ist die Wand-Rolle des Glas-Stils (2938); die Fern-Fenster nehmen `M.glas`/`M.putz` (2810-2820).
- **Tot:** „kleine Fenster" (mittelalterlich, 2125) — Kommentar ohne Feld (Grep `kleine Fenster|winScale|P\.fenster` nur 2125). Läden: kein Bau (Grep `Laden|Läden|shutter` trifft nur Möbel/Kaufhaus 1186, 2187, 2378). `bayMax` 1,7 (181) und `VERBAND_GESETZ.fachwerk.feldM` 1,7 (1848) sind dieselbe Zahl zweimal.

## (4) DIE GRAUE TAFEL

**Wurzel (belegt):** `fensterAt` fachwerk-core.js:1084 / 1089 — `L.rotation.y=(cz<0?0.62:-0.62)` bzw. `(cx<0?-0.62:0.62)`. Der Flügel hängt am Scharnier `cx−w/2` in der Wandachse (1084) und dreht für jede Wandseite nach AUSSEN (Vorzeichen-Prüfung: lokaler Punkt (w,0,0) unter R_y(+0,62) → z = −w·sin 0,62 bei der Front cz<0; Bestätigung im Code-Kommentar 334-335: „freies Ende 0,58 × die Fenster-Breite vor der Wand-Mitte"). Kein Parameter, kein Same, keine Tageszeit: jedes Fenster jedes Hauses steht offen.

**Kette bis zum Pixel:**
1. `fensterAt` 1080: Stoff `gl` = `glasdunkel` wenn `fensterSchlaeft` (45 %, 2751), sonst `glas`.
2. `windowSash` 1017/1020 bzw. flächig 1014: die Scheibe sitzt IM Flügel, also mit ihm gedreht — eine Tafel w−0,12 × h−0,12, die in der Ansicht ~81 % der Öffnung (cos 0,62) überdeckt und bis 0,58·w (0,41–0,61 m bei w 0,71–1,05) vor der Wand steht.
3. In der Öffnungsebene selbst steht nichts: Rahmen (1081-1082) umfasst ein Loch; dahinter L0 der echte Raum, L1 der Innenkörper (3578-3584: Kasten 0,275 m hinter der Wandachse im Putz × Raum × 0,92) — eine graue Fläche HINTER dem Loch.
4. `bakeLOD(…, alles=true)` (3574, 2444-2475) bakt Flügel und Scheibe in die Rollen-Geometrie `glas`/`glasdunkel`; Stoff 2071/2089: 0x2b4457 bei Deckkraft 0,92 ist eine fast opake grau-blaue Fläche, 0x33576a bei 0,42 eine getönte; tags glüht `glas` nicht (LICHT_GESETZ.fenster mittag 0, 6433).
5. Fern (`fensterFern` 2804-2820): die Scheibe liegt frontal bei d1+0,01 = 0,11 m VOR der Wandfläche, also 1 cm vor der Rahmen-Front (0,10) — die Fern-Tafel steht buchstäblich vor der Wand, schlafend opak (`M.putz` × schlafF, 2810), dazu der offene Flügel.
6. Turm und Terrasse: `fensterAt` sitzt 2 cm VOR der Außenfläche einer 0,24–0,26 m dicken Lochwand (Turm 1687 `zF=tz−tw/2+twT/2` gegen 1702 `tz−tw/2−0,02`; Terrasse 1608 gegen 1619) — Rahmen, Flügel und Scheibe stehen vor der Wand, die Laibung bleibt leer.
7. Fachwerk-Wand: Ausfachung 0,06–0,085 dick um die Achse (640-644), Rahmen 0,18 tief (1081) — 5–6 cm Vorstand, keine Laibung; GLATT 0,16 (678): 8 cm Laibung ohne Bekleidung.

**Vermutung (nicht belegt, ohne Bild):** Welche Stufe das „Nah-Bild" zeigt, habe ich nicht gelesen (Stufen-Grenzen des Hauses nicht gefunden; foundry-core.js:433-434 d0 12 / d1 26 gilt Pflanzen). Ob der Welt-Stoff die Deckkraft trägt, ist über foundry-bruecke.js:723-724 (`out.mat.opacity`) nur für den Zweit-Kern-Pfad gelesen, nicht für die Siedlungs-Fragmente. Bauwissen, nicht im Code: deutsche Drehflügel schlagen nach INNEN.

## (5) WAS DER SAMEN ERREICHT

- **Erreicht:** die Zahl der Fenster je Wand über Ständer-Raster + Takt-Würfel (479-485, Same `rnd`); die Breite über die Feldbreite (495, gekappt); Schlaf je Fenster (`fensterSchlaeft`, Same + Lage, 2753); die Gauben-Lage (`P.seed%5`, 256); der Bogentyp über das Preset (Stil, 1081).
- **Erreicht nicht:** Höhe, Brüstung, Sturz (vier Literale, 476); Licht-Bedarf (Raum-Nutzung `r.func` 630 liest kein Fenster; `raumVon` 5999 rechnet nur rückwärts); Epoche (`baujahr` 3538-3557 nur Efeu, Holzstapel, Tonne); Glasgröße/Werkzeug (eine Scheibe je Flügel, Kreuz 0,04 fest, 1017); Klima/Orientierung; Läden; Öffnungszustand (0,62 rad fest, `P.doorClosed` nur Türen 981).
- **Urteil:** Die Öffnung ist eine Funktion des Gefach-Rasters in der Breite und eine Konstante in allem anderen; ab dem Teilbau sind es Maße je Rufer.

Größen gesamt 66 · davon GESETZT ohne Anker 51 (dazu GESETZT mit Anker 5, TEILS 3) · davon FOLGT 7

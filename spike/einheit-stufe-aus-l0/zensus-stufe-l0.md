# Zensus: wo zweigt jede Stufe vom Rezept der L0 ab (Kern main 986eff04)

Zeilen = `git show 986eff04:fachwerk-core.js` / `vehicle-core.js` (Kopien im scratchpad `arbeiter/m-*.js`); foundry-bruecke.js am Arbeitsbaum.
[N] = nachgerechnet in Node (Skripte `arbeiter/farb-zensus.cjs`, `arbeiter/farb-wagen.cjs`), [L] = nur gelesen.

## W1 — Eigenes Rezept je Stufe (jede Stufe baut neu aus den Parametern, keine liest die L0)
- fachwerk-core.js:6419/6438 `buildInstance` → `buildStufe(p, stufe)`; :6272 Zweige: :6275 Stufe 0 = voller `HAUS`-Bau (`stufe0Bau`), :6332–6337 Stufe 3 = `wurfVon(planBau(p))`, :6340 Stufe 1/2 = `massBau` + `fragFuer(B, 1|2)`. [L]
- fachwerk-core.js:3574–3600 `fragFuer`: Stufe 1 = `stapelBau(…{flaechig:1}, LOD1S, L1NUR)` (:3581), Stufe 2 = `stapelBau(B.p, LOD1F, DESTNUR)` + Bake mit `KULLVOL` + `lod2Koerper` + `fensterFern` (:3596), Turm-L2 nur Körper + Fern-Fenster. [L]
- Die Masken: `LOD1F` :2446, `LOD1S` :2448, `L1NUR` :2452, `DESTNUR` :2306 (fenster, gefache, geruest, zimmermann, tueren, giebel, dachwerk aus), `TURMNUR`, `MASSNUR` :2314. [L]
- `P.flaechig` verzweigt den Bau selbst an ~20 Stellen: :244, :483, :652–653 (Gefach), :689, :758 (Giebel-Band), :856, :870, :872, :878, :931, :1021 (Flügel), :1073–1086, :1295, :1332, :1353, :1553. [L]
- `P.nur.fern` verzweigt die L2 im Bau: :511/:1530/:1710 (FERNFENSTER), :660, :1076, :1553, :1607, :1754. [L]
- vehicle-core.js:4898/4906 `st = lod>=1?1:0`, `FAHRZEUG_DETAIL_1 {k:0.4}` :62, `teil()` :64–65: dieselbe Funktion `baueFahrzeug` mit jeder Teilung × 0,4 (neu gebaut, nicht aus L0 abgeleitet). [L]

## W2 — Stoff je Klasse statt je Zone
- alemannisch L2, Wand: `lod2Koerper` :3387 legt den Körper der Liste in EINE Rolle `_wandRolle` :2947 (stil `alt` → `gefach`) mal `_wandFaktor` :2950 = `B.wandTon` (:3587, `wandTonAus` = Flächenmittel der L1-Fassade). Holz, Lehm und Backstein der L0 werden ein Ton. [N]
  L0: holz 731 m² · lehm 386 · backstein 227 (22 344 Dreiecke, 0,281/0,070/0,044) · gefach 181. L2: gefach 300 m² in 22 Dreiecken, 0,296/0,222/0,162, Attribute `aVerband`/`aLage`; kein backstein, kein lehm.
- Das Fachwerk der L2 lebt nur als Funktion im Welt-Shader: `_wandLage` :1938 → `aWand` :3398 → `aVerband`/`aLage` :6379–6389 → stamm/siedlung-satz.js:503–521, :1623–1631. Ob der Shader es zeichnet, ist nur gelesen, nicht im Bild geprüft. [L]
- L2/L3 Ton je Blick-Klasse, nicht je Stoff: `sollTon` :2671 → `tonUebertrag` :2722 (ein Luma-Faktor je Klasse für alle Stoffe; Folge-Auftrag 1: 7 von 10 Haus×Stoff-Paaren rücken weg von L0). [N]
- alemannisch L1, Backstein: Die L0 trägt den Backstein als GEOMETRIE (`infill` :649ff, Steine 0,32 × 0,15 m mit 0,025 Fuge, der Lehm dahinter). Die L1 trägt je Gefach EINEN Kasten `backstein` (:652–653, Giebel :758) mit `__fuge` → `_baseFor` :2347 mischt Stein-Anteil × Stein-Ton + Rest × Lehm-Ton. [N] L1 backstein 190 m², 6 828 Dreiecke, 0,309/0,124/0,086 (heller, weniger rot als L0).
  Eine Karte trägt sie nur mit `document` (:2347: mit `map` bleibt der Stein-Ton); im Worker (kartenlos) bleibt die glatte Mittel-Farbe. Ob der Welt-Shader den Mauerverband über den Stoff (`VERBAND_GESETZ.rolle backstein → mauerwerk` :1857–1866) webt, ist nur gelesen. [L]
- Zwilling: Steingröße `infill` 0,32 × 0,15 (:648) gegen `VERBAND_GESETZ.mauerwerk` 0,24 × 0,071 (:1860). [L]

## W3 — Öffnungen aus anderer Quelle
- L2-Fenster = `fensterFern` :2800 (eigene Geometrie und eigene Maße `RAHMEN_TIEFE`/`SCHEIBE_RAND`/`KREUZ`/`FLUEGEL_LAGE` :2795–2798, Zwilling zu `windowSash`/`fensterAt`), Liste = `fensterVon(st)` :2856 aus `H.windows` des DESTNUR-Baus. [L]
- Nachgerechnet alemannisch Same 1: L0 13 Fenster in der Liste, L2 (DESTNUR) 13, Mass-Bau 13 — alle Zentren und Maße zeichengleich, 0 Abweichung. [N]
- Aber: Die L0 trägt 14 Flügel. Die Gaube (Scharnier (−0,92; 8,15; −2,85)) baut `fensterAt` :809, ohne einen Eintrag in `windowOpenings` → die L2 hat kein Gauben-Fenster. [N]
- Glas in der Öffnung, wo die L0-Öffnung leer ist (Flügel offen): :2821 (Folge-Auftrag 3: L2/L0 Glut 1,274 → 0,986 im Gegenversuch). [N]
- Tür: Die L0 baut `tueren` :978 (Blätter als `__tuerFluegel`). Die L1 trägt sie (L1NUR schaltet `tueren` nicht aus). Die L2: `DESTNUR.tueren:false` :2306, `lod2Koerper` schneidet keine Tür, `fensterFern` kennt nur Fenster → keine Tür. [L]

## W4 — Kleinteile fallen nach Volumen, nicht nach Bildpunkt
- `bakeLOD` :2454/:2459 mit `minVol = KULLVOL` :2299 (0,012 m³) an L2: ein Teil fällt nach seinem Kasten-Volumen, nicht nach seiner Größe im Bild an der Stufen-Grenze; sein Mittel geht nirgends hin. [L]

## W5 — Normalen (Wagen L1)
- Nicht verloren: L1 indiziert wie L0 (gt 324/328 Meshes), kein `flatShading`, Normalen aus `computeVertexNormals` an denselben Stellen (:962, :1068, :1098, :1113, :1177, :1313, :1336, :1376, :1509, :1624, :2435). [N]
- Die Facette kommt aus der Teilung × 0,4 (`teil` :64–65): mittlerer Winkel Ecken- ↔ Flächen-Normale gt 1,05° → 2,06°, 3,3° → 6,7° (größte Blech-Meshes); suv, limousine gleich. [N]
- Ob die Wirt-Faltung (phyto-core `_budgetVerbinden`, :6237 rechnet Normalen nur für Teile ohne Normalen) bei der Wagen-L1 etwas ändert: nur gelesen. [L]

## W6 — Kein gemeinsamer Ort
- Die EINE Stelle, an der jede Stufe jedes Studios entsteht: foundry-bruecke.js:888–893 — sie reicht `presetId, seed, lod` an `zweitBaecker` (BAKERS_BY_KIND) oder `kern.buildInstance` weiter. Dort entscheidet jeder Kern seine Stufe selbst (W1); keiner leitet `L_k` aus der gebauten L0 ab. [L]
- Die Stufen-Tafeln stehen je Kern als Daten (`PORTAL_RENDER_CONFIG.lod.kindStages/budget`: foundry-core.js:446, vehicle-core.js:40–55, fachwerk `HOST_STUFEN` :159). [L]

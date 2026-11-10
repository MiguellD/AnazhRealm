# Post an w27-lod-baum

## 10.11. 02:20 w27-lod-baum — Nachtrag zu ABGABE e15fbe92: die Karte genau auf einem Ring
Gemessen im echten Renderer (Werkbank swiftshader, Weide der Station, 26 m, Kopf e15fbe92): das Auge genau aus 0° (nur der waagrechte Ring) 2,61 px, genau aus 40° 7,29 px (CPU-Modell 3,59 / 4,04). Der Verdacht aus der Abgabe fällt: die Karte steht nicht versetzt — Masken L0 ↔ Karte passen am besten ohne Verschiebung (IoU 0,541, ±3 px 0,45), auch die gekippten Ringe tragen ihre Peilung. Der Rest gegen das Modell sitzt (1) unten: Laub der L0 vor der Achse steht vor den Halmen der Nah-Wiese, die Karte trägt die Tiefe nur an den 3 × 3 Ecken ihres Gitters (`KARTE_GITTER` 2 × 2) und fällt dort hinter das Gras; (2) in Flecken der Karte links/oben ohne L0. FUND statt „gekippte Ringe": die Tiefe der Karte im Gitter 2 × 2 trägt die Krone vor der Achse nicht · lod.K5#1 · Größe S–M (ein feineres Gitter kostet Ecken, kein Fragment).

## 10.11. 02:14 — GPU-PROBE e15fbe92 auf radeon-890m: GRÜN in 570 s (gate:foundry-impostor GRÜN 46 s auf radeon-890m · gate:pop GRÜN 77 s auf radeon-890m · bild:wiese@0.5 GRÜN 54 s auf radeon-890m) → probe-post/w27-lod-baum/e15fbe92.md

## 10.11. 01:58 w27-lod-baum
ABGABE e15fbe9259f49fb32c231d225f59853d5740e752
Geschnitten: das Fragment der Karte liest jede Ansicht am Treffer ihres Tiefen-Reliefs (stamm/stoff-material.js `_relief`, `_tiefeAn` — EIN Leser der Tiefe je Texel für Ecke und Fragment; stoff-karte.js `KARTE_RELIEF`); der 5-px-Versatz war kein Fehler an Fuß, Anker, Maß oder Wind (L1 ↔ L0 0,19 px), sondern die zwei Ansichten an derselben Stelle des Quads (ein Punkt w vor der Achse stand um w·sin δ daneben). Linse: Strich-Wand in gate:foundry-impostor (Tiefen-Lesungen des Fragments: Kopf 6 · Mutante ohne Gänge 0 · Stoff von integ-probe 0).
Gemessen: Station lod.K5#1 Baum (Werkbank swiftshader, Pose der Mess-Wiese) 5,159 → 4,531 px; das CPU-Modell der Station trifft die GPU-Zahl (5,26 gegen 5,16) und gibt mit Relief Weide 3,16 · Eiche 1,50 · Birke 1,58 · Karst 2,41 · Fichte 2,66 px. Dreiecke/Draw-Calls unverändert (Mess-Wiese 64 Befehle · 353 733 Dreiecke), Radeon 729af182 + 728f8068 gate:foundry-impostor · gate:pop · bild:wiese GRÜN, scripts −20 Atome.
Ehrlich offen: lod.K5#1 bleibt ROT — selbst eine Karte genau aus dem Auge (128 × 256) trägt die Weide bei 26 m mit 1,7 px (die hohe Zelle rastert die breite Krone waagrecht 4,4-mal gröber, FUND Größe M: Zelle nach dem Maß der Krone → 1,07 px); dazu steht die echte Karte 47 px breiter als das Modell (die gekippten Ringe, FUND S–M). Bitte lod.K5#1 aus e15fbe92 auf der Radeon fahren.

## 10.11. 01:37 — GPU-PROBE 728f8068 auf radeon-890m: GRÜN in 574 s (gate:foundry-impostor GRÜN 38 s auf radeon-890m · bild:wiese@0.5 GRÜN 57 s auf radeon-890m) → probe-post/w27-lod-baum/728f8068.md

## 10.11. 00:53 — GPU-PROBE 729af182 auf radeon-890m: GRÜN in 541 s (gate:foundry-impostor GRÜN 55 s auf radeon-890m · gate:pop GRÜN 98 s auf radeon-890m · bild:wiese@0.5 GRÜN 54 s auf radeon-890m) → probe-post/w27-lod-baum/729af182.md

## 10.11. 00:19 — GPU-PROBE 3281250b auf gtx1050-desktop: ROT in 571 s (gate:foundry-impostor ROT 85 s auf gtx1050-desktop · gate:streu-wahrheit GRÜN 89 s auf gtx1050-desktop · bild:wiese@0.5 ROT 223 s auf gtx1050-desktop) → probe-post/w27-lod-baum/3281250b.md

## 10.11. 00:08 — GPU-PROBE 28e4b083 auf keinem Läufer: ABGEWIESEN in 13 s („gate:laub-kante“: kein npm-Skript in package.json) → probe-post/w27-lod-baum/28e4b083.md

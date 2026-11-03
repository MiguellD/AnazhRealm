# w6-g3-linsen — fünf g3-Stationen messen ihr Gesetz (Radeon 890M, 03.11.)

Station `meisterkarte-quelle/punkte/stationen/g3.js` (DIE NEUN, eine Probe der Sitzung am Ort dorf, Teil B 640 × 360). Gemessen mit der
Probe wörtlich (Befehl der Station, Werkbank `--echt` an der Radeon über `gpu-lauf.sh`), je Lauf ≤ 50 s. Probe 7,3–7,6 s (Budget 8,5 s, alle
neun gemessen), Deckel 10 s unverändert, Fahrt Radeon 1 798 s · GTX 1 799 s. `punkte.cjs selbsttest --ohne 3c` GRÜN 131/131, `liste` Fehler 0.

| Station | main 0e3eadad | Spiel-Zweig | Mutante |
|---|---|---|---|
| licht.K4 (Durchlass, lotrecht 600 m) | ROT: σ 0, kein Wurf | w5-fernschatten 35414866 **GRÜN**: r 0,967 @ [0,−3] (11,2 m/s), r0 0,874, der Zug erklärt 0,74 | Karte des Wurfs zur festen Uhr (live, 35414866): ROT r 0,998 @ [0,0], erklärt 0 · Proben: altes Maß Bild/Bild, Form statt Zug (erklärt 0,23), Blick im Schatten |
| ferne.K4 (das Auge wählt die Höhe, N·V ≥ 0,2) | ROT: 0,70 aus 21/64 Orten, Auge 1 500 m | w5-fernschatten 35414866 **ROT**: 0,71 aus 21/64 (das alte 0,24 aus 3/7 maß den Rücken der Hänge) | Proben: altes Auge 80 m (3/7), kein Abendschatten (0,71) |
| schatten.K3 (Platz ohne Halm-Marke, Armlänge, Sicht je Punkt) | ROT: Band 1,000 / 1,000 | w5-kontakt 8ed70734 **GRÜN**: Fuß 0,414, Sockel 0,328, 20/20 Punkte gesehen | Proben: Gras deckt das Band (4/20), Platz mit Halmen (Grün 1), altes Maß ohne Sicht |
| schatten.K2 (Reprojektion der Kamera-Bewegung) | **GRÜN** 0,12 % (alt: 4,63 % Parallaxe) | w5-kontakt 8ed70734 GRÜN 0,12 % | Richtlicht ±1° je Bild im Render (live, main): ROT 0,61 % · Proben: altes Maß, Flimmern |
| schatten.K5 (Auge lotrecht 5 m, Pfosten im Blick, Kontrolle je Pose) | ROT: 1,474 : 1 = ohne Pfosten | w5-licht-sprung b4bb2f62 **GRÜN**: 9,26 : 1, ohne Pfosten 1,45 | Proben: Pfosten nicht im Blick (Schilf), altes Maß von der Seite |

Die Seite der Probe steht nicht mehr im Befehl (33 298 > 32 767 Zeichen): die Probe lädt sie aus `{KOORD}/…/g3.js` und prüft ihren sha1
gegen den Befehl (NEUN-BRUCH bei Abweichung, kein Urteil).

## FUND (Spiel)

- Halm auf getretenem Grund: `_bodenSichtAt` aus.gruen liest Rasen und Pflaster, nie den Belag Erde — um jeden Glutbrunnen am Dorf
  (`_wegeBelagAt` erde ≈ 1) Grün 1, die Wiese steht bis an das Feuer (schatten.K5 sieht 0 % Boden, misst den Halm).
- w5-fernschatten 35414866: kein Abendschatten an den Hängen, die dem Auge zugewandt sind — Schatten/Licht 0,71 wie main 0,70 (21/64 Orte).
- Vegetation wechselt zwischen zwei Schüssen ohne Takt: am K3-Platz (−739/−837) erscheint ein Farn, sobald die Probe-Körper verborgen
  sind (Täter ungelesen).

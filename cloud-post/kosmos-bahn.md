# Stand-Blatt `kosmos-bahn` (Zweig `kosmos-bahn`, von origin/main 2da17e2e) — ZWISCHENSTAND

## Täter-Messung (vor dem Schnitt, node, an der echten Stationsfunktion nachgebaut)

- **bahn-klima#2** — Station `k2-zusammenspiel.js` S2 (punkte-maschine d1793366/4dc9120): sie misst 20 Saaten
  `planet.kopplung.bahn-klima-s2-*`, deren Neigung sie aus `planetPlan(q)` OHNE Körper liest (3,10° … 35,79°), und fragt den
  Faden ohne `koerper` — der Faden baut jede Saat mit PLANET_ERDE. Gemessen am Weg des Fadens (`planetPlanVon` +
  `planetOrtAuftrag`, Skript Scratchpad `mess/bahnklima.cjs`): **amp0 68,0 %, amp45 0,998** — die Amplitude kann der
  Neigung der Station nicht folgen, sie wird nie gelesen. **Urteil: Station.** Der Stations-Text „PLANET_ERDE fest“ ist
  veraltet (voxel-worker.js:1502 liest `msg.koerper` längst).
- Zweiter Täter (Spiel, planet-core): mit GENANNTEM Körper (0° / 45°) über denselben Faden-Weg trägt die Heimat-Saat
  0,268 K = 1,3 % und 2,092× — an den 20 Saaten der Station aber **bis 63,2 %** bei 0°: der Jahreszeiten-Vertrag
  (`planetOrt`, das Δ des Gangs) reiste die Spanne als DIFFERENZ, der Rest des Ankers (Spanne der Heimat − Spanne des
  Ankers der Saat) blieb jedem Körper.
- **systeme#1** — Station `k2-kosmos.js` S1: die Planeten stehen gegen ihre Ephemeride (Fächer, 0,022°), der Mond hat
  KEINE Bahn: welt-licht.js:919 `mondRichtung` = −Sonne, stamm/bild-himmel.js:1390 und :2921 negieren die Sonne. Die Station
  setzt ihr `leser` ohne Bedingung. **Urteil: Spiel (das Gesetz fehlt) + Station (misst den Mond nicht).**

## Geschnitten (Stand dieses Kopfs)

1. planet-core.js `planetOrt`: die halbe Spanne des Jahres-Gangs reist als VERHÄLTNIS zur Spanne des Ankers (wie
   `spendeVerh`), das Mittel als Differenz. Am Anker exakt 0 (r − 1 = 0, Mittel x − x = 0).

## Gemessen (bahn-klima#2, Weg des Fadens, 21 Saaten × 15°/45°/75°, genannter Körper gegen den Körper der Erde derselben Saat)

| Maß | vorher | nachher |
|---|---|---|
| amp0 (Heimat-Saat) | 1,3 % | 0,00 % |
| amp0 max je Saat (20 Saaten) | 63,2 % | 0,00 % |
| amp45 (Heimat-Saat) | 2,092 | 2,106 |
| amp45 gepoolt (21 Saaten × 3 Breiten) | — | 2,239 |
| amp45 je Saat min / mittel / max | 1,235 (min) | 1,617 / 2,175 / 3,381 (13 von 21 ≥ 2) |

## Offen / Fragen

- Das Soll „45°: ≥ 2×“ hat in der Station keine gelesene Quelle; die Einstrahlung allein trägt an JEDER Breite 1,777×
  (S0·sin φ·sin ε zur Sonnwende, exakt auch jenseits der Polarkreise) — der Rest muss aus Schnee und Kontinentalität kommen.
  8 von 21 Saaten liegen darunter (min 1,617). Frage an den Koordinator: gilt das Soll gepoolt (2,239) oder je Saat?
- Mond-Bahn (systeme#1): in Arbeit.

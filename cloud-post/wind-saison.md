# wind-saison — ZWISCHENSTAND (Radeon, champion)

Kopf: Zweig `wind-saison` auf main c9da3a64. Karte 2: 82 von 1 718 (Stand-Datei der Karte im Zweig punkte-maschine a48cde1c).

## Je Sprosse (Maß der Station am Wirt in node nachgerechnet)
- `leben.pflanzen.kraft#2` — laufzeitAbw 53,426 % (Lag 9,5 s gegen 6,19 s, die Böe zog mit ω/k = 10,4 m/s) → 6,781 % (Lag 6,5 s gegen 6,09 s), r 0,958, Varianz Sturm ÷ Ruhe 14 526. Schnitt: phyto-core `boeTempo` (Taylor 1938, 0,9 × der mittlere Wind), stamm `_boeWeg`/`_boePhase`, EINE Phase für CPU (`_windAt`) und GPU (`uBoePhase`: Gras, Krone, Karte); die vier Zwillinge `uWindTime·ω` sind tot. Linse gate:wetter-wache (Ö), Täter ω/k rot.
- `planet.kopplung.stadtklima#1` — 30,645° an 1 118 Wege-Stücken (frei 45,73°), unverändert. OFFEN.
- `leben.pflanzen.jahreslauf#2` — rang 0, unverändert. OFFEN.

## Offen am Ort
- stadtklima#1 · Grund: die Station mittelt über jedes Wege-Stück, 34 % ohne Haus in 15 m (43,8°, kein Kanal); in der Schlucht beidseits 3,5°; der Spike „Fassade längs“ gab 35,81° (nein) · Messname `abweichungGrad` + Zeuge `schatten` · Leser: fachwerk `gassenWind` über `_gassenWind`; die Pfütze im Schatten hat keinen Leser (`_trockenRate` kennt keinen Schatten, `state.naesse` ist EIN Film).
- jahreslauf#2 · Grund: STATIONS-FUND — die Station jahreslauf (Zweig punkte-maschine, Zeile 1024) `kalender = laub.map(() => austrieb)` gibt jeder Art denselben Austrieb, der Rang ist 0 bei jeder Welt · Messname `rang` · Leser: stamm/bild-himmel.js `_saisonPraesenz` (ohne Art), `uLaubPraesenz` EINE Uniform.

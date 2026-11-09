# Post an w26-ferne-ton-3

## 09.11. 17:54 — GPU-PROBE 123824b5 auf radeon-890m (Band-Gerät): ROT in 264 s (zeit:gate:tag-achse:echt GRÜN 111 s auf radeon-890m (Band-Gerät) · zeit:gate:luft-tiefe:echt ROT 77 s auf radeon-890m (Band-Gerät)) → probe-post/w26-ferne-ton-3/123824b5.md

## 09.11. 17:24 — GPU-PROBE 7046ca0f auf gtx1050-desktop + radeon-890m (Band-Gerät): ROT in 326 s (gate:pruefbuehne GRÜN 280 s auf gtx1050-desktop · zeit:gate:tag-achse:echt ROT 122 s auf radeon-890m (Band-Gerät)) → probe-post/w26-ferne-ton-3/7046ca0f.md

## 09.11. 17:04 — GPU-PROBE e9f8151b auf gtx1050-desktop: GRÜN in 409 s (gate:luft-tiefe:echt GRÜN 152 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 112 s auf gtx1050-desktop · bild:genesis@0.5 GRÜN 92 s auf gtx1050-desktop) → probe-post/w26-ferne-ton-3/e9f8151b.md

## 09.11. 17:20 Koordinator — ferne-ton-3 (2bb411cb) fährt allein in z351, Prüfung vorher auf der GPU
Bild gesehen: Die Wiese ist grün statt olivbraun, gut. Aber z347 (mit ferne-ton-2) fiel an zwei echt-Wänden: „Prüfbühne S0 auf der Karte — der Feuerkreis aus 2 m trägt Luma ≥ 0,15“ und „Tag-Achse auf der Karte — die Belichtung folgt dem Licht“. Die CPU-Wände desselben Zugs gehören wahrscheinlich zu stadt-takt-4b. Deine Wiese ist dunkler (Luma 56,8 → 42,6), das kann beide echt-Wände treffen.
Fahre sie JETZT auf der GPU: `[gpu-probe: gate:pruefbuehne, zeit:gate:tag-achse:echt]` (nach dem Einmischen von main a7dc1874). Ist eine ROT, schneide den Täter: die Belichtung folgt der neuen Albedo, oder S0 misst ein Soll aus der alten Palette. Gib dann neu ab, ich tausche den Kopf im Zug. Den nahen Baum-Laub (`phyto-core.js leafCol`) fasst du erst danach an.

## 09.11. 17:48 Koordinator — NOTBREMSE (Wochenbudget 98 %): STOPP
Beende deine Runde JETZT: Committe den Stand als WIP mit [skip ci] und push ihn. Ist deine Arbeit abgegeben, steht die Zeile `ABGABE <sha>` hier. Danach KEINE weiteren Schritte und keine Wartezimmer-Schleife mehr. Weiter geht es erst nach dem Reset (12.11. 19:00) in einer neuen Sitzung, die Übergabe steht in `UEBERGABE-2026-11-09-abend.md`.

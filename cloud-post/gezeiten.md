# Post an gezeiten

## Koordinator 26.11. 07:31 — gezeiten#1 am Gerät ROT: Hub 0 m in der echten Sitzung

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

**Befund (GTX 1050, Runde 35, Kopf 64fcf12e):** die Station `planet.wasser.gezeiten#1` urteilt Richter ROT, Preis GRÜN. Der Hub der Gezeit steht an 12 Küsten × 25 h und an der Heimat bei 0 m. Die 3,45 m deiner Abgabe lebten nur in `heim-messung.cjs` (Null-Renderer) — im Spiel liest `_koerperWasser` nach `_pegelTakt` keinen Gezeiten-Term.

**Auftrag:** der Pegel der echten Sitzung trägt die Gezeit. EIN Leser: derselbe Pegel, den Körper, Ufer und Wasser-Bild lesen — kein zweiter Rechen-Weg neben `_pegelTakt`. Beweis: die Station selbst an der Radeon-Probe oder per `werkbank --echt`-Rezept im Brief; Zahl vorher 0 m ↔ nachher an denselben 12 Küsten × 25 h.

**Form der Abgabe:** EIN glatter Vorprüf-Kopf auf main (aktuell 64fcf12e), Betreff `Vorprüfung gezeiten n (auf main <kopf8>): … [gpu-probe: a, b, c, d] [ci voll]`, Probe-Einträge mit Komma getrennt, höchstens vier, je ≤ 480 s; vor dem Schub `npm run check:statik` und `sh artifacts/profiband/werkzeug/zug.sh probe-tag`. **Keinen PR öffnen** — der PR-Lauf fährt die Batterie ein zweites Mal.

## 25.11. 23:11 — GPU-PROBE 2f1c74c9 auf radeon-890m: GRÜN in 1384 s (gate:pruefbuehne-licht GRÜN 59 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 151 s auf radeon-890m · gate:studio-begehen GRÜN 166 s auf radeon-890m · gate:webgl-probe GRÜN 52 s auf radeon-890m) → probe-post/gezeiten/2f1c74c9.md

## 25.11. 21:40 — GPU-PROBE c765fea8 auf radeon-890m: GRÜN in 910 s (gate:pruefbuehne-licht GRÜN 59 s auf radeon-890m · gate:weltbild-frost:echt GRÜN 130 s auf radeon-890m · gate:studio-begehen GRÜN 151 s auf radeon-890m · gate:webgl-probe GRÜN 55 s auf radeon-890m) → probe-post/gezeiten/c765fea8.md

## 25.11. 20:16 — GPU-PROBE 93673ea2 auf gtx1050-desktop: ROT in 2223 s (gate:worker-dichte ROT 982 s — DECKEL 960 s auf gtx1050-desktop · gate:pruefbuehne-licht GRÜN 89 s auf gtx1050-desktop · gate:weltbild-frost:echt GRÜN 297 s auf gtx1050-desktop · gate:studio-begehen GRÜN 469 s auf gtx1050-desktop · gate:webgl-probe GRÜN 97 s auf gtx1050-desktop) → probe-post/gezeiten/93673ea2.md

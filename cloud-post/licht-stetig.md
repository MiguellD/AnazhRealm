# Post an licht-stetig

## 24.11. 06:49 — GPU-PROBE 04d2d455 auf omen-gtx1060: GRÜN in 1133 s (gate:tag-achse:echt GRÜN 149 s auf omen-gtx1060 · gate:pruefbuehne-licht GRÜN 65 s auf omen-gtx1060 · bild:dorf@0.5 GRÜN 94 s auf omen-gtx1060 · bild:wiese@0.5 GRÜN 59 s auf omen-gtx1060 · gate:webgl-probe GRÜN 60 s auf omen-gtx1060) → probe-post/licht-stetig/04d2d455.md

## 24.11. 06:34 — GPU-PROBE 1cb7362d auf radeon-890m: ROT in 484 s (das Bein gpu-probe endete ohne Urteil (cancelled) auf radeon-890m) → probe-post/licht-stetig/1cb7362d.md

## 24.11. 06:31 — Koordinator: Vorprüfung licht-stetig 2 = 04d2d455, bitte nicht mehr auf `licht-stetig` pushen

- Dein Kopf 1cb7362d trug denselben Karten-Konflikt wie jeder Zweig mit Bericht (die eigene Zeile in `docs/README.md` stößt mit jeder
  anderen Landung zusammen). Der Wurzel-Schnitt `karte-nennt-klasse` (6b27e264) nennt die KLASSE `cloud-post/<zweig>.md` einmal;
  ich habe ihn in deinen Zweig gemergt (README ganz zu seiner Seite, deine Zeile fällt, dein Inhalt unverändert) und als
  „Vorprüfung licht-stetig 2“ gepusht: **04d2d455**. Deine Batterie an 1cb7362d brach GitHub dabei ab — die neue läuft an 04d2d455.
- EIN Schreiber je Zweig: kein weiterer Push auf `licht-stetig`, solange diese Batterie läuft. Ein Heil-Schnitt nach einem ROT: erst
  `git fetch origin licht-stetig && git merge --ff-only origin/licht-stetig`, dann EIN Push mit denselben Marken
  `[gpu-probe: gate:tag-achse:echt, gate:pruefbuehne-licht, bild:dorf@0.5, bild:wiese@0.5] [ci voll]`, der Bericht im selben Commit
  (nie ein Post-Commit hinterher — er bricht die laufende Batterie ab). Die Karte `docs/README.md` fasst du nicht mehr an.
- Bei Grün stemple ich; die Bilder `bild:dorf` und `bild:wiese` sehe ich mir vor dem Stempel selbst an.


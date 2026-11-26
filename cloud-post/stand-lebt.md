# stand-lebt — Stand-Blatt (GTX 1060, Kopf 1 auf main a954d698, 26.11.)

**Geschnitten.** Die Ruhe des stehenden Leibs liest das Gesetz an EINER Stelle (`leibRigPose`, koerper-core.js): `STAND.ruhe` (koerper-core.js:8984) hängt die Arme — Pronation 1,2 rad (69°, die Handfläche zum Schenkel, Normale 0,93), Ellbogen 0,25 rad (14°, ANGENOMMEN), Daumen-Luft 0,035 rad bis 0,2 rad Abduktion; `STAND.seiten` 2 (:8983) backt jeden Stand je tragendem Bein (Satz und Feld, `_bewohnerStandLage` siedlung-bewohner.js:3109, Bein aus `leibStandBein`); `STAND.blick` (:8985) — drei Fixationen 0 · ±0,56 rad, Wende 0,4 s (Argyle & Cook 1976; Stahl 1999 ±17,9° ohne Kopf), nah in `_bewohnerKopf` (siedlung-bewohner.js:2622), fern in der Zeile.

**Der EINE Eingang des Tuns.** `_bewohnerGemuet` (siedlung-bewohner.js:3155, :3166) → `tagesHaltung` (koerper-core.js:5628) → `r.standTun = leibStandTun(name)` (stamm/koerper-leib.js:958) → `leibStandTun` (koerper-core.js:9019, liest „name/krank/lehrling“ über `LEIB_SATZ.stufe`) → `STAND.tun` (:8986) → die Arme des Tuns in `leibRigPose` (`AT`, :9281). Kein zweiter Schreiber der Pose.

**Gemessen.**
- Haltungs-Klasse (Linse diag-mensch-anatomie `haltung.klasse`, Soll ≤ 30 %, Selbsttest HA6 feuert 64–76 %): vorher max 74 % (idle 61 %) → nachher max 27 % (showcase/fight/angry 27, idle 22, joy 14; krank/lehrling gleich). Roh: p3/n2611/nah/sl3-kl/{vor,kopf}.txt.
- Arm im Rumpf in der Stand-Pose der Welt (`ARM_RUHE.innenStand`): mit Innendrehung 23° bis 140 Ecken → 0 an jedem Leib.
- Regung am Brunnen stadt-voll 13 Uhr 1080 echt, stehende Leiber bis 12 m, 10 Bilder je 0,5 s: 4 von 4 ≥ 8 %, je Leib (#160023 · #603198 · #931430 · #742379 in 2,9 · 4,5 · 7,3 · 7,5 m) 14,77 · 28,1 · 24,89 · 13,17 % → 27,2 · 33,03 · 34,12 · 19,7 %, unterer Median 14,77 → 27,2 % (p3/n2611/nah/sl3-voll/{vor,nach}/regung.txt).

**Offen (benannt).** Preis p95 ABAB je Leib (≥ 4 Starts je Seite, stadt-voll); Teil 1/3; Bildpaar nach koordination probe-post/stand-lebt/.

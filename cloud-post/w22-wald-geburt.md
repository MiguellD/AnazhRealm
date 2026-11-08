# Post an w22-wald-geburt

ABGABE 8774f57ec1edfb7617721b49e300b3f25a77ae85

## 08.11. 02:15 — GPU-PROBE 8774f57e auf omen-gtx1060: GRÜN in 239 s (gate:pop GRÜN 68 s · bild:wiese GRÜN 43 s) → probe-post/w22-wald-geburt/8774f57e.md

## 08.11. 02:10 — GPU-PROBE 480dc24a auf radeon-890m: GRÜN in 349 s (gate:pop GRÜN 63 s · bild:wiese GRÜN 39 s) → probe-post/w22-wald-geburt/480dc24a.md

## 08.11. 02:07 — GPU-PROBE ef7a7cce auf omen-gtx1060: GRÜN in 158 s (gate:pop GRÜN 71 s · bild:wiese GRÜN 50 s) → probe-post/w22-wald-geburt/ef7a7cce.md

## 08.11. 02:03 — GPU-PROBE 7a0349b0 auf radeon-890m: GRÜN in 257 s (gate:pop GRÜN 63 s · bild:wiese GRÜN 45 s) → probe-post/w22-wald-geburt/7a0349b0.md

## 08.11. 02:02 — GPU-PROBE 71be3f75 auf omen-gtx1060: GRÜN in 197 s (gate:pop GRÜN 71 s · bild:wiese GRÜN 52 s) → probe-post/w22-wald-geburt/71be3f75.md

## 08.11. 01:53 — GPU-PROBE 38ec4931 auf radeon-890m: GRÜN in 460 s (gate:pop GRÜN 59 s · bild:wiese GRÜN 46 s) → probe-post/w22-wald-geburt/38ec4931.md

## 08.11. 01:50 — GPU-PROBE 438ddf4b auf radeon-890m: GRÜN in 312 s (gate:pop GRÜN 67 s · bild:wiese GRÜN 48 s) → probe-post/w22-wald-geburt/438ddf4b.md

## 08.11. 01:43 — GPU-PROBE 15d70fc6 auf radeon-890m: GRÜN in 376 s (gate:pop GRÜN 60 s · bild:wiese GRÜN 50 s) → probe-post/w22-wald-geburt/15d70fc6.md

## 08.11. 01:41 — GPU-PROBE a0201255 auf radeon-890m: GRÜN in 217 s (gate:pop GRÜN 58 s · bild:wiese GRÜN 48 s) → probe-post/w22-wald-geburt/a0201255.md

## 08.11. 01:23 — GPU-PROBE aec208de auf radeon-890m: GRÜN in 466 s (gate:pop GRÜN 70 s · bild:wiese GRÜN 44 s) → probe-post/w22-wald-geburt/aec208de.md

## 08.11. 01:20 — GPU-PROBE b8d2413a auf radeon-890m: GRÜN in 298 s (gate:pop GRÜN 75 s · bild:wiese GRÜN 54 s) → probe-post/w22-wald-geburt/b8d2413a.md

## 08.11. 01:12 — GPU-PROBE 279f55de auf radeon-890m: GRÜN in 627 s (gate:pop GRÜN 72 s · bild:wiese GRÜN 57 s) → probe-post/w22-wald-geburt/279f55de.md

## 08.11. 01:08 — GPU-PROBE 6ee4408f auf omen-gtx1060: GRÜN in 319 s (gate:pop GRÜN 66 s · bild:wiese GRÜN 45 s) → probe-post/w22-wald-geburt/6ee4408f.md

## 04:30 Koordinator — z311 ROT, Täter w22-wald-geburt (8774f57e)
Kandidat = main 34e04548 + wasser-fix + s0-ms + wald-geburt, Lauf 42439632857, beide Versuche gleich:
- echt K6 „Strafe am Prüfplatz“: „DIE WELT STEHT NICHT nach 3750 Takten: Ruhe 0, zuletzt brach sie: Wald offen 36 (offen {foundry 0, chunks 0, wald 36, …})“.
- voll 15/18 Kamera-Leib K2: „DER BAU STEHT NICHT: das Weltbild nach 3044 Takten … dem Weltbild fehlt: 12 Bäume und Bauten wachsen“. K4: „TypeError: Cannot read properties of undefined (reading 'baum')“.
- voll 14/18 Fenster-Wand: „… dem Weltbild fehlt: 6 Bäume und Bauten wachsen“.
„Wald offen“ stand in keinem anderen Zug.
Verdacht: Die Blende hängt am AUGE („blendet ein, während das Auge ihren Rand unterschreitet“). Steht das Auge still im Band, bleibt die Karte halb eingeblendet, und der Wald meldet sich offen, für immer. Das Einblenden muss in endlicher Welt-Zeit enden: in Takten, ab dem Eintritt, unabhängig von einem ruhenden Auge. Prüfe außerdem den 'baum'-Zugriff.
Vorgehen: Repro an der K6-Pose (Prüfplatz) per `[gpu-probe: gate:kamera-leib, gate:fenster-wechsel]`, schneide an der Wurzel, und gate:pop muss weiter ≤ 0,05 % bleiben. Dann eine Zeile ABGABE <sha> hier; dein Zweig fährt danach allein.

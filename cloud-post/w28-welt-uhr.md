# Post an w28-welt-uhr

## 14.11. 15:29 — CODE-CHECK ROT am Kopf ff7ad524 (Zug-Dienst, ohne LLM)

Der Zweig fährt in keinem Zug, solange sein eigener Check rot ist. Der rote Text:

```
ROT voll 18/18 (Lauf 43602420323, Versuch 1): Dichte-Spiegel (Main und voxel-worker bauen jedes Chunk-Gitter byte-gleich, mit Edits ueber dem Band)
  ##[error]Process completed with exit code 1.
  ##[error]URTEIL voll 18/18: ROT — „Dichte-Spiegel (Main und voxel-worker bauen jedes Chunk-Gitter byte-gleich, mit Edits ueber dem Band)“
  ##[error]Process completed with exit code 1.
```

Heilen, den Schritt lokal fahren (`npm run check`), neu abgeben (EIN Kopf, Betreff `Abgabe w28-welt-uhr: …`).

## 14.11. 15:07 — GPU-PROBE ff7ad524 auf radeon-890m: GRÜN in 520 s (bild:genesis@0.5 GRÜN 52 s auf radeon-890m · bild:wiese@0.5 GRÜN 67 s auf radeon-890m) → probe-post/w28-welt-uhr/ff7ad524.md

## 14.11. 14:58 Cloud w28-welt-uhr
ABGABE ff7ad52486a5ccc15f9b8a90e95a0d4057a44fa9
[gpu-probe: bild:genesis@0.5, bild:wiese@0.5] [ci voll]. Derselbe Schnitt wie e0b08c23 (dort volle Batterie 21/21 GRÜN, GPU-Probe GRÜN
auf radeon-890m), jetzt auf main fb398b86 (Merge fd17434a ohne Konflikt; am Kopf GRÜN: npm run check, lint, format, playtest voll,
Wand (W)). Status ZWISCHENSTAND.

## 14.11. 14:08 — GPU-PROBE e0b08c23 auf radeon-890m: GRÜN in 1150 s (bild:genesis@0.5 GRÜN 86 s auf radeon-890m · bild:wiese@0.5 GRÜN 77 s auf radeon-890m) → probe-post/w28-welt-uhr/e0b08c23.md

## 14.11. 13:49 Cloud w28-welt-uhr
ABGABE e0b08c23b4a7bfcf88d53f11cfc1ccd3094dbbbd
[gpu-probe: bild:genesis@0.5, bild:wiese@0.5] [ci voll]. Ersetzt 24b050d0: dessen volle Batterie nannte zwei Röten, beide geheilt —
voll 9 gate:weltakt-wache (T) K4 (die Probe spult die Spiel-Zeit vor; der Kristall des Nexus, jetzt auf der Spiel-Zeit, goss die geübte
Geste zum Gesetz `random_chance 0.35`; die Probe lässt jetzt auch die Selbstanalyse ruhen — lokal tat-k4 12 · 12 · 0 falsch) und voll 11
Kreatur-Linse Teil 3 `peer` (die Kopien der Mitspieler-Tiere folgen dem Netz an der Wanduhr; netz-p2p zurück auf main — lokal gangV 1,5,
Teil 3 GRÜN). gate:ankunft war in der CI GRÜN. Wachstum Prüf +3 966 / Spiel −140. Status ZWISCHENSTAND.

## 14.11. 13:10 Cloud w28-welt-uhr — Bild-Paar (selbst angesehen)
GPU-Probe 24b050d0 GRÜN (gtx1050-desktop). Genesis@0.5 Kopf 24b050d0 ↔ w28-wolke-zeit 0a2cd4d7 (derselbe Läufer, dieselbe Pose, Bühne
T 12,5): 2,916 % der Pixel verschieden, max Δ 82, nur in Zeile 43–627 — die Sprenkel der Baumkronen (Karten- und Laubstufe) und ein
Stamm links; Boden, Gras, Tore, Membranen und Himmel pixelgleich. Der Schnitt ändert unter der Bühne kein Pixel der Uhr-Domänen (sie hält
die Bild-Uhr wie vorher); was zwischen zwei Läufen bleibt, sind die Stufen der Bäume — der nächste Täter für den Sechs-Starts-Versuch.
Wiese@0.5: ABNAHME GRÜN, Luma 82,6 σ 38,8; kein sauberes main-Bild dieses Läufers (die Wiesen der Nachbarzweige tragen eigenen Code).
Was ein Art-Director noch als Amateur erkennt: die Kronen in der Bildmitte lesen sich als gemalte Karten mit fleckigem Dither, nicht als Laub.

## 14.11. 13:08 — GPU-PROBE 24b050d0 auf gtx1050-desktop: GRÜN in 601 s (bild:genesis@0.5 GRÜN 81 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 84 s auf gtx1050-desktop) → probe-post/w28-welt-uhr/24b050d0.md

## 14.11. 12:58 Cloud w28-welt-uhr
ABGABE 24b050d08b9bfd1aae199024e05b3259f37aabfc
[gpu-probe: bild:genesis@0.5, bild:wiese@0.5] [ci voll]. Die Bild-Uhr ist die Spiel-Zeit des Takts (Wind-Phase, Böe, Wellen, Himmel,
Tor, Regen, Flackern, Fell), die Sim-Uhr sät sich aus der Spiel-Zeit, jedes Welt-Glied altert auf ihr; 59 Täter fallen, die Wand
gate:wetter-wache (W) nennt jeden neuen Leser der Gerätezeit (Tafel spec/uhr/geraetezeit.json, 299 begründete Leser). Zwei Starts zur
selben Spiel-Uhr (headless): main Bild-Uhr 1007,34 ↔ 0,605, Böe 0,540 ↔ 0,939, Sim-Uhr 1007,38 ↔ 0,642 — Kopf gleich.
Für den Sechs-Starts-Versuch an der Radeon: die Bühne hält die Bild-Uhr, nicht die Spiel-Uhr — was bis zum Stehen der Welt nach der
Spiel-Zeit läuft (Tiere, Vögel, Bestäuber, Atem des Leibs), steht je Start anders, wenn es im Bild ist; der Genesis-Ort setzt im Spiel
jetzt 48 von 48 Elementen (vorher 12, dann ~17 min nichts: `< 1000` gegen Sekunden), das Bild am Ort ändert sich darum gegen main.
Hier und am main gleich ROT (Umgebung): gate:ankunft L2a, gate:ego-schatten (swiftshader). Status ZWISCHENSTAND.

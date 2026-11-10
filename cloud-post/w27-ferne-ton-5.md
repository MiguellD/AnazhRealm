# Post an w27-ferne-ton-5

## 10.11. 08:35 — GPU-PROBE 37324a09 auf gtx1050-desktop + omen-gtx1060 (Band-Gerät): GRÜN in 185 s (gate:luft-tiefe:echt GRÜN 141 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt GRÜN 78 s auf omen-gtx1060 (Band-Gerät)) → probe-post/w27-ferne-ton-5/37324a09.md

## 10.11. 08:26 — GPU-PROBE aa646657 auf omen-gtx1060 + radeon-890m (Band-Gerät): ROT in 601 s (gate:luft-tiefe:echt GRÜN 79 s auf omen-gtx1060 · zeit:gate:luft-tiefe:echt ROT 103 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/aa646657.md

## 10.11. 08:14 — GPU-PROBE ed5eeb7f auf radeon-890m + omen-gtx1060 (Band-Gerät): ROT in 594 s (gate:luft-tiefe:echt ROT 113 s auf radeon-890m · zeit:gate:luft-tiefe:echt GRÜN 83 s auf omen-gtx1060 (Band-Gerät)) → probe-post/w27-ferne-ton-5/ed5eeb7f.md

## 10.11. 03:03 — GPU-PROBE ef2bac5a auf radeon-890m (Band-Gerät): ROT in 500 s (zeit:gate:luft-tiefe:echt ROT 101 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/ef2bac5a.md

## 10.11. 02:28 — GPU-PROBE 80bcd308 auf radeon-890m: ROT in 367 s (gate:luft-tiefe:echt ROT 85 s auf radeon-890m · bild:wiese@0.5 GRÜN 67 s auf radeon-890m) → probe-post/w27-ferne-ton-5/80bcd308.md

ABGABE 80bcd3089d038480f1988b8794799c473ae94f36

Hinter der Abgabe lag ein Diagnose-WIP (ef2bac5a), der Kopf des Zweigs trägt wieder genau den Baum von 80bcd308 (die Abgabe bleibt 80bcd308). Befund auf der Radeon: die Horizont-Karte ist aktiv und gemalt, der Schuss β 1 mit ruhender Karte ist bit-gleich grau (0,1279/0,118/0,1059) — der Luftschatten (`luftSicht`) ist NICHT der Täter; die graue In-Streuung kommt aus der Himmels-Sicht selbst (`himmelFarbe`, stamm/bild-himmel.js), auf swiftshader blau 0,2515/0,2584/0,2672.

## 10.11. 02:24 — w27-ferne-ton-5: ABGABE 80bcd3089d038480f1988b8794799c473ae94f36

ABGABE 80bcd3089d038480f1988b8794799c473ae94f36 — Abgabe w27-ferne-ton-5 (Zweig von w26-ferne-ton-4, main 20a01782 im Kopf). Die fünf offenen Punkte des Vorgängers fallen ganz.

- **Geschnitten.**
  1. Werk im Wasser A: der Strand ist ein Stoff — die Zeile `sand` der Stoff-Tafel (stamm/bau-vorlagen.js:1624, Rad 0,25/0,35 nach Peurifoy, η 0,3, Korn 0,4 mm für das Schritt-Gesetz aus main), der EINE Leser `_strandAt` (stamm/gelaende-boden.js:2481; Farbe, Deckung, `_fahrHaft`, `_kontaktStoffAt` lesen ihn). Dazu die Wurzel unter dem Wasser: die Narbe endet am Spiegel (stamm/gelaende-boden.js:2441, voxel-worker.js:3113) — der Seegrund in 1 m trug die Deckung des nassen Grunds (Grün 0,6–0,8), das Rad bremste dort wie auf Gras.
  2. DECKE: scripts/ +1 474 → −21 Atome, ohne Ausnahme-Liste: der Spiegel-Band des Playtests (Faden ↔ Haupt-Faden) je Feld aus EINER Tafel (−1 027, er trägt jetzt den Stoff), der Selbsttest von gate:weg-boden aus EINER Tafel, die Ufer-Probe baut über `_attachVoxelFieldColors` statt einer eigenen Schleife, der tote Ring-Griff in diag-stand-takt. werkbank.cjs 3 975 Zeilen.
  3. K7 und 4. K10 hatten EINE Wurzel: die Holz-Wahl der Welt ohne Bild fragte den WebGL2-Rückfall des Browsers (Chromium 153 reicht unter --disable-gpu swiftshader → kienspan, Ring 2; Chrome 148 der CI keinen → voll, Ring 4). Der Null-Renderer fragt kein Gerät (stamm/dirigent-regler.js:496); Linse: JEDES-HOLZ im Playtest (Mutante „fragt das Gerät“ ROT, Gegenprobe kienspan).
  5. Das Boden-Fragment liest den Stoff des Grunds, nie die Albedo: EIN Feld je Vertex (Deckung · Nässe) vom Faden über den Satz (`aStoff` snorm8x4) bis ins Fragment (stamm/stoff-material.js:2813), unter den Schichten der Wege-Karte (`_wegeBodenFarbe` `aus.stoff`, stamm/siedlung-wege.js:772); Halm-Relief, Moos und Glanz sind Relief der Nähe. Die 4 B zahlt die Ziel-Farbe des Geomorphs (gamma8, unorm8x4 mit √c): der Boden-Satz bleibt 48 B je Vertex. `gruenSchwelle` und `mossDamp*` fallen (gate:altlasten).
- **Gemessen.**
  - ferne.K1#2 (gate:luft-tiefe:echt, GTX 1050, 78b11fb7): LUFT GRÜN, Farbton 8 km 0,03–2,71° (Uhr 0,5: 2,57 · 2,51 · 2,06 · 1,23°) — vorher main auf derselben Karte K1-2 ROT (6b7d389a, FARBTON nur durch `offen` verborgen), GTX 1060 an da0e790f 1,38–13,77°. swiftshader 0,11–2,46°.
  - Wand A: der Wagen taucht 1,41 → 1,14 m (Dach 1,20; main 1,13), vA 8,94 → 6,84 m/s.
  - K7: 459 → 1 906 Büschel, 40 → 980 Pflanzen neben dem Rand-Streifen (Selbsttests „wiese“ und „ring“ wieder sehend). K10: 8 → 178 Proben.
  - Spiegel Faden ↔ Haupt-Faden: Lage, Normale, Index, Farbe, Stoff, Karte je 0 Stellen. Ufer-Parität 2 411 Ecken, 0 abweichend.
  - Bild wiese@0,5 GTX 1050 Luma 44,1 (vorher 43,9), kein Rückfall gesehen.
  - Lokal am Kopf GRÜN (Chrome 148 wie die CI): check · lint · format · playtest voll · playtest:fast · welt-boot · Fernwald · Werk im Wasser · Körper-Stand · Wasser-Leben · weg-boden · chunk-satz · asset-contract · post-kette und ego-schatten (kein [ERROR] STOFF).
- **Ehrlich offen.**
  - Die Probe der Abgabe 80bcd308 lief auf der Radeon: ROT mit genau den Zahlen von main (6b7d389a, Vorher am main-Baum) — K1-2 ist auf der
    GTX 1050 GRÜN an 78b11fb7 (derselbe Baum vor den Merges mit main fbbeb318 und 20a01782; sie berühren die Luft nicht).
  - ferne.K1#2 auf der Radeon ROT, an main identisch (6b7d389a): HIMMEL „nicht blau“ 0,1287/0,1182/0,1066, JE KANAL Uhr 0,27 ungemessen, KANTE 2,15 %. Der Horizont trägt die In-Streuung ohne die einfache Streuung der Sonne — der Luftschatten ist widerlegt (ef2bac5a); die Station der Radeon (Sitzung) maß an 87537d3f nur FARBTON. Nicht geschnitten.
- FUND: stamm/bild-himmel.js `himmelFarbe` (die Himmels-Sicht der Atmosphäre) · auf der Radeon im Weg `--eigen` grau-warm am Horizont (0,128/0,118/0,106), die Horizont-Karte widerlegt (ef2bac5a) · ferne.K1#2 Radeon (HIMMEL, JE KANAL, KANTE, FARBTON) · M
- FUND: scripts/lib/welt-boot.cjs Rezept `null` · lokale Linsen fahren Chromium 153 (PUPPETEER_EXECUTABLE_PATH), die CI Chrome 148 — andere Welt ohne Bild bis zu dieser Abgabe · Linsen-Parität · S
- Die Besten: Unreal Landscape (die Layer-Weight-Map trägt das Physical Material, Haftung und Klang lesen die Schicht, nie die Textur); Frostbite Terrain (Schicht-Gewichte als Vertex-Kanal neben der Farbe).

## 10.11. 01:26 — GPU-PROBE 78b11fb7 auf gtx1050-desktop: GRÜN in 528 s (gate:luft-tiefe:echt GRÜN 160 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 112 s auf gtx1050-desktop) → probe-post/w27-ferne-ton-5/78b11fb7.md

## 10.11. 01:15 — GPU-PROBE 5f49c06a auf gtx1050-desktop + radeon-890m (Band-Gerät): ROT in 545 s (gate:luft-tiefe:echt ROT 164 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 110 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt ROT 65 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/5f49c06a.md

## 10.11. 01:04 — GPU-PROBE c56ce6f9 auf radeon-890m + radeon-890m (Band-Gerät): ROT in 1849 s (gate:luft-tiefe:echt ROT 81 s auf radeon-890m · bild:wiese@0.5 GRÜN 50 s auf radeon-890m · zeit:gate:luft-tiefe:echt ROT 73 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/c56ce6f9.md

## 10.11. 00:57 — GPU-PROBE 6b7d389a auf gtx1050-desktop + radeon-890m (Band-Gerät): ROT in 1724 s (gate:luft-tiefe:echt GRÜN 173 s auf gtx1050-desktop · zeit:gate:luft-tiefe:echt ROT 88 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/6b7d389a.md

## 10.11. 00:26 — GPU-PROBE 00fdd106 auf gtx1050-desktop + radeon-890m (Band-Gerät): GRÜN in 577 s (bild:wiese@0.5 GRÜN 114 s auf gtx1050-desktop · gate:pruefbuehne GRÜN 249 s auf gtx1050-desktop · zeit:gate:tag-achse:echt GRÜN 114 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/00fdd106.md

## 10.11. 00:19 — GPU-PROBE 536c1aac auf keinem Läufer: ABGEWIESEN in 137 s („zeit:gate:luft-tiefe:echt“: kein npm-Skript in package.json) → probe-post/w27-ferne-ton-5/536c1aac.md

## 10.11. 00:12 — GPU-PROBE 53e59239 auf radeon-890m + radeon-890m (Band-Gerät): ROT in 759 s (gate:luft-tiefe:echt ROT 87 s auf radeon-890m · bild:wiese@0.5 GRÜN 62 s auf radeon-890m · zeit:gate:luft-tiefe:echt ROT 106 s auf radeon-890m (Band-Gerät)) → probe-post/w27-ferne-ton-5/53e59239.md

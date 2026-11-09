

## 09.11. 14:26 — GPU-PROBE bb75c460 auf gtx1050-desktop: GRÜN in 2341 s (gate:luft-tiefe:echt GRÜN 148 s · bild:genesis@0.5 GRÜN 117 s · bild:wiese@0.5 GRÜN 107 s) → probe-post/w26-ferne-ton/bb75c460.md

## 09.11. 13:47 — GPU-PROBE ea197372 auf ?: ROT in 167 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-ferne-ton/ea197372.md

## 09.11. 13:46 — GPU-PROBE 53cc7242 auf gtx1050-desktop: ROT in 1963 s (gate:luft-tiefe:echt ROT 153 s) → probe-post/w26-ferne-ton/53cc7242.md
## 11:20 Koordinator — Messung der GTX
ferne.K1#2 auf der GTX (OMEN, main 87537d3f): Farbton 8 km bis 13,76° (Soll ≤ 10°). Radeon: bis 10,65°. Die GTX ist dein schwererer Fall.

## 09.11. 15:35 Cloud w26-ferne-ton
ABGABE a34160aac0b8cd27443b07b48c0f5381fc08bb22
Täter am Azimut 0° (Uhr 0,5, 8 km) ist die Atmosphäre gegen den Maßstab. Gemessen gegen den Horizont S trägt die Luft allein (Boden schwarz) auf der GTX 10,2° von 13°, der Boden 2,8° (gelb-oliv, B/G 0,66). Der Horizont zur Sonne ist fast grau (Mie-Aureole, 3–4 Stufen Buntheit). Die Luft filtert je Kanal, also misst die Linse ihr eigenes Spektrum mit; auf swiftshader sind es nur 2,7°. Geschnitten: `tonDerFerne` misst gegen die Luft vor einem schwarzen Ziel in derselben Entfernung (β der Referenz). Die Toleranz bleibt 10°, und die Mutante „gegen S“ steht ROT im Selbsttest.
GTX 1050 bb75c460: LUFT GRUEN, K1-2 GRUEN, 8 km Uhr 0,5: 5,22 · 5,72 · 3,88 · 3,48°, Uhr 0,27: 0,36 · 0,4 · 3,36 · 0,38°. Bilder genesis/wiese GRÜN, unverändert gegen main. Radeon und GTX 1060 messe ich nicht selbst.

## 14:35 Koordinator
ABGABE a34160aa ist angenommen und fährt als **z346**. Die Referenz der Luft in der Entfernung (Koschmieder, schwarzes Ziel) statt des fast grauen Himmels S ist eine Korrektur: 1 % je Kanal drehte den Ton um 7°, die Größe war schlecht gestellt. Der Selbsttest fällt an der Wiese vor dem Bestand rot.
Der Schöpfer hat zu Recht gesagt, dass Punkte aus Linsen allein nicht AAAA sind. Darum ist dein nächster Auftrag das Spiel selbst, deine beiden FUNDE:
1. Der Boden der Ferne trägt Ton 63° (halb Fels-Grund, Studio-Palette, `foundry-core.js` PORTAL_GROUND.rock/SAISON_GESETZ).
2. Das Blau des Halms ist 0,13 × Grün, das Blatt-Spektrum liegt bei ~0,35.
Schneide beides an der Wurzel, ein Gesetz der Farbe aus dem Spektrum. Beweis: der Ton je Azimut auf GTX und Radeon, dazu `[gpu-probe: bild:genesis@0.5, bild:wiese@0.5]` gegen main.

## 09.11. 16:20 Cloud w26-ferne-ton-2
ABGABE 8299cdd2989684fac86a36f630e542e08b579037
Zweig `w26-ferne-ton-2` (von a34160aa, main a7dc1874 gemischt). Beide Funde sind an der Wurzel geschnitten, als EIN Gesetz der Farbe aus dem Spektrum (`foundry-core.js` FARB_SPEKTRUM: CIE 1931 × D65 × sRGB je 10 nm):
- Der Halm ist das Grasblatt nach PROSPECT-D: Spitze 0,0795/0,1343/0,0317 statt 0,172/0,349/0,046, B/G 0,13 → 0,24. Die Wurzel ist 0,6 × das Blatt (`mead`).
- Die ferne Wiese ist der Bestand nach 4SAIL (LAI 2,5, 5 % dürres Blatt wie die Nähe): B/G 0,15 → 0,39. Der Hand-Faktor halmSchatten fällt.
- Der Fels ist Munsell N4, flach 0,12: B/R 0,66 → 1.
Nur die vier Gras-Goldens sind neu gemünzt (Farbe), alles andere ist byte-gleich.
GTX 1050 58b780c4: LUFT GRUEN. FARBTON 8 km Uhr 0,5: 2,75 · 2,22 · 1,83 · 1,33° (vorher 5,22 · 5,72 · 3,88 · 3,48°), Uhr 0,27: 0,43 · 0,17 · 3 · 0,2°.
Bilder: Genesis Luma 102,5 (main 105,1); Wiese 44,2 (main 56,8), dunkler und oliv. Ein echtes Blatt ist R/G 0,59, der alte Halm war 0,49.
Ehrlich offen: Die Radeon messe ich nicht selbst. Die Nah-Wiese liest oliv statt neon — das ist die Physik des Blatts, bitte ansehen.

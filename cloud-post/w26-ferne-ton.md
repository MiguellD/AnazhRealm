

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

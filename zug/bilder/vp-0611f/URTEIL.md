# vp-0611f — GTX-Bild-Vorprüfung w14-wiese-saum (OMEN, GTX 1060, 06.11. 13:47–14:30)

Verglichen wurden main db431cf0 (links bzw. oben) und w14-wiese-saum d0912123 (rechts bzw. unten). Der Zweig steht auf main db431cf0.

Je Seite lief eine warme Welt (`werkbank start --echt --ort wiese`) mit denselben Posen:

1. **Third 0,5 Uhr:** die Pose der Station vegetation.K1#1 (`umstellen --ort wiese --sicht third`, die Kamera des Spiels, das Blickziel auf dem gezeichneten Boden), `bild` mit Uhr 0,5 und Abstandsringen.
2. **Ego stehend:** dasselbe aus Ego.
3. **Hang:** die Richtung mit dem höchsten Geländewinkel in 20–200 m. An der Mess-Wiese ist das nur ein flacher Anstieg von 3,6° in 120 m; einen steileren zugewandten Hang gibt es dort nicht.
4. **Weg:** der nächste getretene Grund (`_wegeFeldAt` 0,76) in 14 m, Blick aus 9 m.
5. **Weg von oben:** derselbe Punkt aus 6 m Höhe, der Blickpunkt so gewählt, dass kein Baum im Bild steht.

Je Pose habe ich gemessen:
- `zaehlen --alle`: Befehle und Dreiecke, die Nah-Wiese L1/L2 einzeln;
- `gpu-bank`: GPU-ms je Frame, 12 Frames × 3 Runden.

Dazu lief die Station vegetation.K1#1 auf der GTX an beiden Köpfen, jede in einer eigenen Sitzung. Jedes Paar habe ich selbst angesehen; die Pixel-Abstände stehen in `diff.txt`.

## Urteil: w14-wiese-saum d0912123 GRÜN im Bild — vegetation.K1#1 bleibt auf der GTX ROT

### Bild

- **Teppich-Look:**
  - main: Ab etwa 10–20 m liegt das Gras flach. Die Halme sind zu langen, schräg verschmierten Strichen gestreckt (`1-third-ausschnitt.jpg`, `2-ego-ausschnitt.jpg`, oberes Band links).
  - Zweig: Das Gras steht bis an den Waldrand aufrecht, als dichte Spitzen gleicher Richtung. Den Teppich gibt es dort nicht mehr. Die Ferne wirkt dafür gleichförmig gezahnt.
- **Harte Ring-Kante bei 10 m:**
  - In Third, Ego und am Hang sehe ich am Zweig keine Kante. Der Übergang vom Nah- zum Ferngras ist stetig.
  - Von oben (`5-weg-oben-ausschnitt.jpg`) zeigen beide Seiten einen Bogen, an dem feines Nahgras in gröberes Ferngras übergeht. Am Zweig ist er nicht schärfer als an main.
- **Büschel über Wege:**
  - Der Weg-Punkt in 14 m ist ein Feuerplatz mit Belag 0,76. Aus Augenhöhe verdeckt das hohe Gras davor den Weg auf beiden Seiten (`4-weg.jpg`).
  - Von oben steht das Gras um den Feuerplatz auf beiden Seiten gleich. Am Zweig wachsen keine zusätzlichen Büschel über den Grund.
- **Ähre am Stängel:** Bei dieser Auflösung sehe ich keinen Unterschied. In Ego und am Weg stehen die Ähren auf beiden Seiten an den Halmen.
- **Luma:**
  - Third 52,4 ↔ 52,8, Ego 57,9 ↔ 59,8; das Fernband ist am Zweig etwas heller, weil die Halme aufrecht statt flach stehen.
  - Hang 59,1 ↔ 59,1, Weg 74,8 ↔ 74,8.

### Frame und Dreiecke (main → Zweig)

| Pose | GPU ms/Frame | Dreiecke gesamt | Nah-Wiese L1 + L2 (Dreiecke) | Befehle |
|---|---|---|---|---|
| Third 0,5 Uhr | 18,58 → 18,70 | 360 283 → 379 229 | 42 430 + 21 118 → 42 430 + 9 728 | 69 → 69 |
| Ego stehend | 19,54 → 18,75 | 342 493 → 363 720 | 37 056 + 22 118 → 37 056 + 10 130 | 67 → 67 |
| Hang 120 m | 19,02 → 18,52 | 362 130 → 382 338 | 63 089 → 51 477 | 68 → 68 |
| Weg 14 m | 16,36 → 15,58 | 342 264 → 344 258 | 63 207 → 50 995 | 64 → 64 |

- Die Nah-Wiese L2 halbiert sich, etwa 21 k → 10 k Dreiecke.
- Gesamt kommen 2 bis 21 k Dreiecke dazu (am Weg 2 k, in den Weitblicken rund 20 k). Am Zweig erscheint die neue Klasse `nahWiese:Lf`, die Fern-Wiese; sie trägt den Saum.
- Die GPU-Zeit ist gleich bis 0,8 ms besser. Die Befehle bleiben gleich.

### Station vegetation.K1#1 (GTX, eigene Sitzung, Fahrt 78–79 s)

| | LAI 2–5 m | 5–10 m | 10–20 m | 20–40 m | Nah-Wiese |
|---|---|---|---|---|---|
| main db431cf0 | 2,44 | 2,24 | 1,87 | 1,71 | 4 Befehle / 63 548 Dreiecke |
| w14-wiese-saum d0912123 | 2,44 | 2,24 | 1,98 | 1,67 | 4 Befehle / 52 158 Dreiecke |

Beide Köpfe sind ROT mit „Saum springt > 15 %“:
- An main springt er von 5–10 auf 10–20 m (−16,5 %).
- Am Zweig ist dieser Schritt geheilt (−11,6 %). Der Sprung sitzt jetzt einen Ring weiter, von 10–20 auf 20–40 m (−15,7 %), knapp über der Schwelle.
- Der Farbton bei 2–5 m ist gleich (13,52° ↔ 13,53°).

## Ehrlich offen

- **Hang:** Einen steileren zugewandten Hang in 20–200 m gibt es an der Mess-Wiese nicht. Der Blick zeigt einen flachen Anstieg von 3,6° in 120 m.
- **Weg:** Aus Augenhöhe ist der Weg nicht zu sehen, und der Weg-Punkt ist ein Feuerplatz statt eines langen Pfads. „Büschel über Wege“ trägt nur der Blick von oben.
- **Flimmern** an der Übergabe ist an Standbildern nicht prüfbar.
- **Ringbänder:** `bild --abstand` nennt an beiden Köpfen andere Bänder (main mit 14 m, der Zweig ohne). Die Tabelle der Station nutzt die festen Ringe und ist vergleichbar.

Rohdaten und Treiber auf der OMEN: `p3/n0611/vps/{main,kand}/{erg.json,erg-weg-oben.json,vp.log,bilder/}`, `p3/n0611/vps/k1-*.out` und `p3/n0611/vp-saum.cjs`.

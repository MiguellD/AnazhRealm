# w5-stufen 4dcd8810 — Blick der GTX 1060 (OMEN, 03.11.) · haar.K5 · lod.K4

**Urteil: GRÜN für haar.K5 (Fell-Entscheid), lod.K4 ROT mit benanntem Täter.** An der GTX ist das Fell an bei 4,1 und 8,2 m und aus ab
15,5 m (main: an bis 130 m), ohne Kosten. Der lod.K4-Sprung bleibt 8,21 %. Täter ist die **Birken-Krone `f:birke`**: 63 % der
Wechsel-Pixel, ihr Ton kippt beim Stufen-Wechsel um −24 … −30 %. **Aber:** die Wölfe der Herde sind an der GTX nicht im Bild (0 Befehle `tier:wolf`). Die
Befehls-Grenze „tier ≤ 30“ ist dort also blind, und das Fell ist nicht zu sehen.

## Zahlen (Adapter nvidia/pascal)

| Kriterium | vorher main 5fba36ea | nachher 4dcd8810 | Soll |
|---|---|---|---|
| haar.K5 Fell an je Abstand | an 4,1 · 8,2 · 15,5 · 25,8 · 40,8 · 60,5 · 90,4 · 130,2 m | **an 4,1 · 8,2 m, aus 15,5–130,2 m** | nah an, fern (≥ 40 m) aus ✓ |
| haar.K5 tier-Befehle | 1 (`tier:bestaeuber`) | 1 (`tier:bestaeuber`) | ≤ 30: **blind, kein Wolf gezeichnet** |
| haar.K5 Szene gesamt | 113 Befehle, 369 912 Dreiecke | 113 Befehle, 369 868 Dreiecke | |
| lod.K4 Sprung | 8,24 % über 18 647 px | 8,21 % über 18 630 px | < 2 % ✗ |

Fell-Probe: `fellHaushaltSzene` (g2.js) wörtlich an der Wiese, Ego, nach den 40 Takten, Aufnahme 960 × 540 (`stufen-fell-herde.jpg`).

## lod.K4: der Täter je Klasse (main 5fba36ea, Pose der Station, Auge der Stufen +4 m, Strahl je Masken-Pixel)

| Klasse (`archInstanceKey`, Stufe) | Proben | Luma vorher → nachher | Sprung, Schatten an | Sprung, **Schatten aus** |
|---|---|---|---|---|
| **f:birke Stufe 1** (404 Ecken) | 424 / 421 | 0,0897 → 0,0683 | −21,6 % | **−23,8 %** |
| **f:birke Stufe 0** (588 Ecken) | 335 / 346 | 0,0836 → 0,0583 | −16,9 % | **−30,3 %** |
| f:eiche Stufe 1 | 144 / 128 | 0,0381 → 0,0334 | −16,1 % | −12,4 % |
| f:fichte Stufe 1 | 69 / 56 | 0,0359 → 0,0299 | −16,1 % | −16,7 % |
| bodenSatz (Boden) | 100 / **7** | | −19,1 % | −0,7 % |
| fern-ring | 72 / **0** | | −16,9 % | — |

Mit den Kaskaden aus (Intensität 0, wie schatten.K2) fallen Boden und Fern-Ring aus der Maske. Ihr Anteil war der wechselnde Wurf der Kronen. Was
bleibt, ist der **Ton der Krone selbst**: die Birke mit 63 % der Pixel und −24 … −30 %. Am Dorf ist es also die Birke, nicht die Weide aus dem headless-Befund
des Zweigs (die steht hier nicht im Blick). Der Stoff ist der Krone-Stoff `foliageTex` mit `laubLicht: atlas`, `foundryCrossfade` Kanal farbe; die Ecken zählen
L1 404 gegen L0 588. Verdacht wie im Zweig: das Laub-Licht der Stufe misst an den eigenen Ecken (N·L je Stufe). Die Krone L0 wird dunkler, sobald das
Auge näher kommt.

## Kosten an der GTX (1 Boot)

gpu-bank Wiese 16,42 ms (main 16,15–16,57), Dorf 14,46 (main 13,70–14,43); lauf Wiese 56,9 fps. Kein Unterschied über dem Rauschen.

## Bilder

- `stufen-fell-herde.jpg`: die Herde 4–130 m vor dem Auge. **Kein Wolf im Bild**, in beiden Bäumen. Der Fell-Schalter (`_fellAn`) entscheidet
  richtig, aber das Auge sieht kein Fell. Die GTX zeichnet die bestellten Wölfe der Szene nicht (Zensus: 0 Befehle `tier:wolf`; Stand
  `herde: 8`). FUND für die Station: haar.K5 urteilt an der GTX die Befehls-Grenze über eine Herde, die nicht gezeichnet wird.
- `stufen-lod-K4-maske.jpg`: Maske des Wechsels (magenta), links mit, rechts ohne Schatten: der Busch links (Birke) und die Kronen am Hang.
- `stufen-lod-K4-birke.jpg`: Schatten aus, Auge der Stufen am Spieler gegen +4 m: die Birke links kippt im Ton.
- `stufen-wiese-ego.jpg`: Wiese Ego. Gleich zu main.

## Belege

`p3/n0311/w5/aus/4dcd8810/` (neun.json, fell.json, Kosten, bilder/), main `aus/5fba36ea/`, Klassen `aus2/5fba36ea-1332/lod.json`
(Schatten an) und `aus2/5fba36ea-1346/lodS.json` (Schatten aus), Treiber `nach.cjs`. Läufe unter `p3/gpu-lauf.sh`. Nichts gebucht.

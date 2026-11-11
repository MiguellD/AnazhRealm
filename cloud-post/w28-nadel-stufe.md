# Post an w28-nadel-stufe

## 11.11. 17:40 UTC w28-nadel-stufe — ZWISCHENSTAND 1: das Totholz folgt seiner L0 (WIP cf9fdc98), die Nadel-Arten erreichen das Soll im Haushalt 2 900 NICHT — Messreihe
Zweig `w28-nadel-stufe` von main e6f0cf7e, Kopf cf9fdc98 (WIP [skip ci], Goldens noch alt). Werkzeuge: `bericht/1111-baum-wechsel/baum-fehler.cjs` (16 Peilungen, Welt-Meter) und ein Diff-Bild L0 ↔ L1 je Vorlage.
**1. Totholz (FUND 4) — die Wurzel liegt anders als gedacht.** Das Diff-Bild zeigt: die L1 trug Äste, die die L0 gar nicht hat. Die L0 wirft jeden Seiten-Lauf unter `rinde.ast` 0,4 × Stammradius ab (foundry-core.js:2460 — „die Karte trägt den Zweig", aber das Totholz trägt keine Karte), die L1 hielt jeden Strang ab einem Bild-Pixel (:2179). Den naheliegenden Schnitt an der L0 (sie behält ihre Äste: 3,43 → 1,92 px) verbietet der Vertrag: L0 0 Bytes, und die Bild-Tafel T2 des Asset-Vertrags reißt (totholz-s12345 L0 deckt 1,175–1,208, Band [0,85, 1,15]). Geschnitten darum an der L1: sie wirft dieselben Läufe ab wie die L0 (:2461), trägt die 14 Borken-Schuppen der L0 (`__totholzRinde` :4148, bis hier nur L0) und die Radial-Teilung der L0 (:2490). **Gemessen am Bau: L1 3,43 → 1,21 px am Haushalt 12 m (Samen 1; 7: 1,19 · 12345: 1,45), Dreiecke 1 094 → 1 098 (L0 2 426 unverändert); die Karte 3,17 → 2,58 px, ihr 1-px-Abstand 102 → 77 m.** Ehrlich: > 1 px. Der Rest sitzt in den Wurzeln (L1 als Dreikant mit jedem zweiten Ring), der Ring-Vereinfachung des Stamms unter den Zerfalls-Beulen und einem Stummel. Gemessen dazu: die Wurzeln rund kosten +192 Dreiecke für −0,06 px; ohne Ring-Toleranz baut die L1 nicht (0 Dreiecke, ein Leser hängt an ihr). FUND dabei: an der L0 schweben die Splitterkränze der abgeworfenen Äste frei (die Bruch-Stelle bleibt, der Ast fällt) · foundry-core.js:2460 + :2759 · Größe S, aber L0-Bytes.
**2. Nadel-Arten (FUND 1) — die Messreihe an der Fichte (L1 gegen L0 am Haushalt 32,3 m, L0 8 404 Dreiecke unberührt):**

| L1-Wedel | L1-Dreiecke | Versatz |
|---|---|---|
| heute (`teile` 2 · `breite` 2,03 · `nadel` 0,045 · `ab` 0) | 1 852 | 1,79 px |
| `breite` 1,65 | 1 708 | 1,91 px |
| `breite` 1,65 · `nadel` 0,03 · `spalte` 1,25 | 2 592 | 1,55 px |
| Kachelung der L0, `nadel` 0,024, Kreuz | 2 800 | 1,35 px |
| Kachelung der L0 (`nadel` 0,016), je Stück EINE Karte im Wechsel | 2 708 | 1,49 px |
| dieselbe, die Karte lotrecht | 2 708 | 2,06 px |
| Kachelung der L0, `ab` 0 | 5 056 | 0,16 px |
| Kachelung der L0 ganz (`ab` 0,35) | 4 688 | 0,04 px |

Die Wurzel: der Wedel ist eine Kette von Stücken, jedes trägt die GANZE Wedel-Zelle des Atlas (`pushStraehne`, foundry-core.js:1383; Stücklänge aus `nadel`). Die L1 kachelt mit 2,8-fach längeren Stücken — die Zweiglein der Zelle stehen an anderen Orten. Am Haushalt ist die Nadel 0,35 px groß, das Bild der Krone ein poröses Muster an der Auflösungs-Grenze; der Kanten-Versatz misst jede Pore. Nur dieselben Karten wie die L0 treffen es (0,04 px), jede Verdünnung (halbe Karten, größere Stücke) liegt bei 1,35–2,06 px. Die Laub-Arten tragen 0,05 px, weil ihre L1 eine TEILMENGE der L0-Karten ist (Lagen-Wahl) — die Konifere hat keine Teilmenge, die trägt: ihre Krone ist dünn belegt.
**Das Soll „L1 ≤ 1 px am Haushalt, bei gleichem oder kleinerem Dreiecks-Haushalt, L0 0 Bytes" ist für Fichte · Tanne · Mammut mit der Wedel-Grammatik nicht zu erreichen** — die drei Bedingungen schließen sich aus (gemessen, nicht geschätzt). Was es öffnet, je mit Preis:
- (a) **Eine vorgekachelte Wedel-Zelle im Blatt-Atlas** (2 × 2 Wiederholungen der Zelle): EINE L1-Karte trägt vier L0-Stücke mit demselben Muster — ein Viertel der Karten bei gleichem Bild. Preis: der Atlas (phyto-core, dort arbeitet `w28-blatt-atlas-kalt`), die Stück-Kette muss gleich breite Nachbarn fassen. Größe L. Das ist der Schnitt, den ich für richtig halte.
- (b) Die L1 der Nadel-Arten trägt die Kachelung der L0 (0,04 px) — 4 688 statt 1 852 Dreiecke, über der Zeile `tree[1].tris` 2 900 und der Quote 0,35 (0,56). Von dir ausgeschlossen.
- (c) Die Grenze L0 ↔ L1 der Nadel-Arten folgt ihrer Zeile (der geparkte Mechanismus) — an der Wiese +655k Dreiecke L0. Gemessen, fällt.
**Meine Frage, eine:** soll ich (a) bauen (dann brauche ich das Wort für die Wedel-Zelle im Atlas in `phyto-core.js`, neben `w28-blatt-atlas-kalt`), oder das Totholz in diesem Zweig zu Ende bringen und abgeben (L1-Goldens Totholz neu, 4 Fälle; Nadel-Arten bleiben als gemessener FUND offen)? Bis zur Antwort arbeite ich am Totholz weiter (Ziel ≤ 1 px bei ≤ 1 094 Dreiecken).

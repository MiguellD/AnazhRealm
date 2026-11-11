# Post an w28-nadel-stufe

## 11.11. 19:05 UTC w28-nadel-stufe — Nachtrag zur GPU-Probe 7c51bdec
Das Bild der Wiese (gtx1050-desktop, 12:00) selbst angesehen und gegen denselben Ort an w28-tag-kurve 5620a53f (in main 3308689f, derselbe Läufer) gelegt: dieselbe Szene, 0,5 % der Pixel weichen um mehr als 8 ab (Halme im Wind), größte 90 — im Blick der Mess-Wiese steht kein Totholz, der Schnitt zeigt sich dort nicht. Sein Beweis bleibt die Folge der Station (Totholz-L1 2,586 → 0,559 px im Renderer). Ich warte weiter.

## 11.11. 19:48 — GPU-PROBE 7c51bdec auf gtx1050-desktop: GRÜN in 429 s (bild:wiese@0.5 GRÜN 125 s auf gtx1050-desktop · gate:foundry-impostor GRÜN 69 s auf gtx1050-desktop · gate:streu-wahrheit GRÜN 159 s auf gtx1050-desktop) → probe-post/w28-nadel-stufe/7c51bdec.md

## 11.11. 18:50 UTC w28-nadel-stufe
ABGABE 7c51bdec3dd7957bc2b9a92d4cc1c3c82bbc2f31
Geschnitten: die L1 des Totholzes folgt ihrer L0 — dieselben abgeworfenen Läufe (foundry-core.js:2463), die Borken-Schuppen (:4153), die Radial-Teilung der L0 (:2492) und die Wurzel-Zahl der L0 (phyto-core.js:2220, nur `ph.tot`); VERTRAGS-AKT: `spec/asset-contract/v1/golden/totholz-s{7,12345}-L1-{summer,winter}.json` neu und die drei L1-Zeilen `totholz-s*` der Bild-Tafel T2, L0 und jede andere Art byte-gleich; gemergt mit main b0112f7b.
Gemessen: die Folge der geschärften Station (`w28-baum-wechsel-pm` f7bceb09, kanten.js) im Renderer an der Mess-Wiese (swiftshader) **Totholz-L1 @ 12 m 2,586 px (main) → 0,559 px** an 16 257 Pixeln (Farbe 0,746); am Bau 3,43/2,55/3,87 → 0,83/0,63/0,84 px bei 3 718 → 3 602 Dreiecken über die drei Gestalten. Grün am Kopf: `npm run check` · playtest:fast · gate:asset-contract · gate:phyto-core; an 6d90a4e9 zusätzlich `npm run playtest` · pack-contract · regler-wirkt · asset-inventory.
Ehrlich offen: die Nadel-Arten — 1 von 4 Vorlagen hält das Soll, die Klasse fällt in dieser Welle NICHT.
**Korrektur meiner Empfehlung (a) von 17:40, gemessen:** die Wedel-Zelle füllt im Atlas die ganze Höhe (`BLATT_ATLAS_WEDEL` Zelle 3, Kern 1) — sie braucht keine neue Zelle, nur RepeatWrapping längs, und eine Karte trägt zwei Stücke der L0. Emuliert (Kachelung der L0, zwei Stücke je Karte, die Zelle längs wiederholt im CPU-Raster): Fichte 1,28 · Tanne 1,41 · Mammut 1,30 px bei 3 456 · 3 620 · 4 864 Dreiecken — **über dem Bildpunkt UND über der Zeile 2 900**. Damit bleibt jede Wedel-Variante unter 2 900 Dreiecken über 1 px (beste 1,35); 0,04 px trägt erst die volle Kachelung der L0 (4 688). Meine Lesart nach Messung: die Nadel-Krone ist dünn belegt und porös, ihre L1 kann die L0-Silhouette mit einem Drittel der Karten nicht tragen — das Soll „≤ 1 px am Haushalt 32 m" verlangt dort die Dreiecke der L0. Was bleibt, ist eine Entscheidung über das Soll oder den Haushalt der Nadel-L1 (Zeile `tree[1].tris`, Quote 0,35) — oder der geparkte Mechanismus schiebt nur die Nadel-L1-Grenze (an der Wiese +655k L0-Dreiecke, gemessen 14:40). Ich wähle nichts davon still; die Zahlen stehen.
Ich warte nach brief-gemein (Post alle 5 min).

## 11.11. 18:15 UTC w28-nadel-stufe — ZWISCHENSTAND 2: das Totholz hält das Soll (WIP 6d90a4e9), die Nadel-Arten warten auf die Entscheidung von 17:40
**Geschnitten** (Kopf 6d90a4e9, gemergt mit main 3308689f): die L1 des Totholzes folgt ihrer L0 an vier Stellen — sie wirft dieselben Läufe ab (foundry-core.js:2463), trägt die 14 Borken-Schuppen (:4153) und die Radial-Teilung der L0 (:2492), und **die Zahl ihrer Wurzeln**: das Stufen-Rezept nahm der L1 jedes Baums 20 % der Wurzeln (phyto-core.js:2220 `roots × 0,8`), beim Totholz standen vier dickere Wurzeln statt fünf am Fuß — der größte Term, gefunden mit einem Ruf-Protokoll jeder Röhre von L0 und L1 im vm (die Datei unberührt). Jetzt trägt die Totholz-L1 die Wurzeln ihrer L0 (nur `ph.tot`, jede andere Art byte-gleich).
**Gemessen** (`baum-fehler.cjs`, 16 Peilungen, Haushalt 12 m, die drei Gestalten des Vertrags und der Welt):

| Gestalt | main L1 | jetzt L1 | Dreiecke main → jetzt | Karte am Haushalt main → jetzt |
|---|---|---|---|---|
| Same 1 | 3,43 px | **0,83 px** | 1 094 → 1 122 | 3,17 → 2,50 px |
| Same 7 | 2,55 px | **0,63 px** | 1 262 → 1 366 | — → 2,48 px |
| Same 12345 | 3,87 px | **0,84 px** | 1 362 → 1 114 | — → 3,20 px |
| Summe | | | **3 718 → 3 602** | |

L0 0 Bytes, Zeile `tree[1].tris` 2 900 unverändert. **VERTRAGS-AKT** (beim Namen): `spec/asset-contract/v1/golden/totholz-s{7,12345}-L1-{summer,winter}.json` neu gemünzt (MINT_FORCE, die übrigen 124 Fälle byte-gleich) und die drei L1-Zeilen `totholz-s*` der Bild-Tafel T2 (`--tafel` gemessen, NUR diese Zeilen übernommen: ein frischer `--tafel`-Lauf schreibt auch die L1-Zeilen der Laub-Arten neu, z. B. birke-s1 [3,323 …] → [3,239 …] — FUND: die Tafel T2 trägt an den Laub-L1 nicht den Stand des Kerns, die Wand hält im Band; Größe S). Grün am Kopf: gate:asset-contract · gate:phyto-core · format:check · `npm run check` · playtest:fast · gate:pack-contract · gate:regler-wirkt · gate:asset-inventory · `npm run playtest` („Alle Invarianten OK").
FUND: `gate:foundry-impostor` ist ROT schon an main 3308689f (swiftshader, rgba8): „C5: Wache der Reihen (0 Meldungen, Soll 1)" (scripts/diag-foundry-impostor.cjs:509, `_karteNadel`) — an meinem Kopf dasselbe, nicht meine Dateien · Größe S.
**Offen:** die Nadel-Arten (Fichte 1,79 · Tanne 1,91 · Mammut 1,80 px) — die Messreihe von 17:40 steht, das Soll ist mit der Wedel-Grammatik unter 2 900 Dreiecken nicht zu erreichen; ich gebe NICHT ab, solange drei von vier Vorlagen offen sind (dein Wort: die Klasse in EINER Welle), und warte auf deine Wahl (a: die vorgekachelte Wedel-Zelle im Blatt-Atlas, phyto-core — oder das Totholz allein abgeben). Die Folge der geschärften Station am Kopf (Totholz-L1 im Renderer, swiftshader) läuft, die Zahl trage ich nach.

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

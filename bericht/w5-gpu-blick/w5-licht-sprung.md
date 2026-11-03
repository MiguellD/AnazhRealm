# w5-licht-sprung 59d8aec1 (Abgabe-Kopf) — Blick der GTX 1060 (OMEN, 03.11.) · schatten.K4 · schatten.K5

**Urteil: ROT.** schatten.K4 bleibt 0,0 %: die Wand ist am echten Bild **bytegleich main** (LA = LB = 0,1626). schatten.K5 fällt von 0,768 auf **0,992 : 1**,
weil der Wurf des Feuers den ganzen Platz verdunkelt: das Licht am Boden sinkt von 0,161 auf **0,0149 (−91 %)**, hinter dem Pfosten und daneben
gleich. Am Mittag kostet der Zweig +0,9 ms GPU an der Wiese; die Kaskaden k0/k1 sind schwerer.

## Zahlen (Station g3 NEUN wörtlich, punkte-maschine 6444b257, Ort dorf, Teil B 640 × 360, Adapter nvidia/pascal)

| Kriterium | vorher main 5fba36ea | nachher 59d8aec1 | Soll |
|---|---|---|---|
| schatten.K4 Gewinn (LA / LB) | 0,0 % (0,1626 / 0,1626) | **0,0 % (0,1626 / 0,1626)** | ≥ 10 % ✗ |
| schatten.K5 Kontrast | 0,768 : 1 (ohne Pfosten 0,768) | **0,992 : 1 (ohne Pfosten 0,992)** | ≥ 3 : 1 ✗ |
| schatten.K5 Licht / Schatten am Boden | 0,161 / 0,2095 | **0,0149 / 0,0150** | |
| Quelle | glutbrunnen 6,27 m | glutbrunnen 6,27 m | |

## Kosten an der GTX (Mittag, wo der Wurf laut Zweig 0 kostet)

| | main (3 Boots) | 59d8aec1 (2 Boots) | Δ |
|---|---|---|---|
| gpu-bank Wiese | 16,15 · 16,43 · 16,57 | 17,35 · 17,20 | **+0,9 ms** |
| gpu-bank Dorf | 14,43 · 13,70 · 14,01 | 15,06 · 14,40 | +0,7 ms |
| Pässe Wiese k0 / k1 | 0,26 / 0,22 | **0,64 · 0,62 / 0,58 · 0,47** | +0,6 ms |
| Pass `rueckstrahl:boden` | — | 0,10 | |
| lauf Wiese fps | 57,6 · 53,0 · 52,8 | 53,8 · 52,4 | |

Die Kaskaden k0 und k1 zeichnen am Mittag in beiden Boots mehr als doppelt so lange. Einschränkung: w5-stufen zeigte in einem Boot einmal k0 0,62, k1 aber 0,22.

## Bilder

- `licht-sprung-schatten-K4.jpg`: die weiße Wand vor besonnter Wiese, main gegen Zweig: gleich.
- `licht-sprung-schatten-K4-platte.jpg`: im Zweig Wiese davor gegen Platte Albedo 0 davor: die Wand ist bytegleich.
- `licht-sprung-schatten-K5.jpg`: **Mitternacht am Glutbrunnen: main warm ausgeleuchtet, Zweig fast schwarz.** Nur einzelne Halme rechts
  tragen noch Licht. Die Kamera der Station steht im Schilf um die Quelle; jeder Halm wirft in die Würfel-Karte, und der Boden liegt
  überall im Wurf.
- `licht-sprung-dorf-third.jpg`: Third am Dorf (Mittag). Gleich zu main.

## Das Auge: wo es falsch aussieht

1. **K4 erreicht das Bild nicht.** Der Rückstrahl ändert den Frame der Station um kein Byte, weder vor der Wiese noch vor der Platte. Verdacht:
   `_rueckstrahlZeichne` (`stamm/bild-schatten.js:152`) läuft nur im Loop NACH dem Bild (`stamm/dirigent-takt.js:1810`); im Zweig
   `direkt` setzt dieselbe Stelle den Leser auf 0 (`_rueckstrahlLeser().an.value = 0`). Eine Aufnahme
   (`__ausgabeAufnahme`, Loop angehalten) frischt die 2 × 1-Karte nie auf, und `_spiegelUmgebung` liest so den Boden des letzten echten Bilds. Am Ort
   des Spielers ist das nicht die Wiese vor der Wand. Der Gewinn von +11,2 % stammt von der Bühne des Zweigs, nicht vom Ausgabe-Pfad.
2. **K5: der Wurf ist zu viel, nicht zu wenig.** Die Quelle verliert 91 % ihres Lichts am Boden, auch dort, wo kein Pfosten steht. Täter-
   Kandidaten: die Werfer in der Reichweite (Gras und Schilf um den Glutbrunnen werfen in den Würfel), oder ein Tiefen-Vergleich der
   `PointShadowNode`-Karte, der überall „verdeckt“ liefert (nahe Ebene 0,38 m, Reichweite 9 m, `_lichtPoolTerm` `stamm/stoff-material.js`). Ein
   Feuer, das seinen eigenen Platz ins Dunkel wirft, trägt kein AAAA.
3. FUND für die Station: der Platz der Probe liegt im Schilf. Ein Pfosten 2 m von einer Quelle in dichter Vegetation misst den Wurf der Halme mit.

## Belege

`p3/n0311/w5/aus/59d8aec1/` (neun.json, Kosten, bilder/), `aus2/59d8aec1-1341/` (Kosten 2. Boot), main `aus/5fba36ea/`,
`aus2/5fba36ea-1332|1343/`. Läufe unter `p3/gpu-lauf.sh`. Nichts gebucht. Gemessen am Kopf 59d8aec1 (Nachtrag des Koordinators statt 5a9265f0).

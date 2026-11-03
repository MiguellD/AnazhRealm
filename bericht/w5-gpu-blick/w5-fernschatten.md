# w5-fernschatten c369570f — Blick der GTX 1060 (OMEN, 03.11.) · licht.K4 · ferne.K4

**Urteil: ROT.** Der Wolken-Wurf ist im Bild (σ 0,0019 → 0,0597), aber das Muster zieht nicht: r 0,9027 bei Verschiebung [0,0]. Das ist
der Mutant der Station „ein gemaltes Muster steht“. ferne.K4 fällt im Verhältnis auf 0,24, steht aber weiter auf 3/7 Orten. Und die Kosten an der
GTX sind **+6,9 ms GPU an der Wiese** (Schätzung des Zweigs: ≤ 0,3 ms).

## Zahlen (Station g3 NEUN wörtlich, punkte-maschine 6444b257, Ort dorf, Teil B 640 × 360, Adapter nvidia/pascal)

| Kriterium | vorher main 5fba36ea | nachher c369570f | Soll |
|---|---|---|---|
| licht.K4 σ | 0,0019 | **0,0597** | ≥ 0,03 ✓ |
| licht.K4 r @ Verschiebung | 0,9752 @ [0,0] (r0 0,9752) | **0,9027 @ [0,0]** (r0 0,9027) | r ≥ 0,6, Verschiebung ≠ 0 ✗ |
| ferne.K4 Verhältnis | 0,4914 (Ls 0,0435 / Ll 0,0886) | **0,2415** (Ls 0,0212 / Ll 0,0879) | ≤ 0,4 ✓ |
| ferne.K4 Orte im Bild | 3/7 | 3/7 | ≥ 5/5 ✗ (der FUND des Zweigs, die Orts-Wahl der Station) |
| schatten.K2 (Wache) | 4,64 % / 3,89 % | 4,65 % / 3,86 % | unverändert |

Die Zahlen von main an der GTX treffen die Radeon-Zahlen fast genau (r 0,98 @ [0,0], 0,4766 ↔ 0,4914, 3/7): Gerät und Probe sind gleich.

## Kosten an der GTX (gpu-bank 120 × 3 ms/Frame · lauf 20 s, Ego, je Boot)

| | main (3 Boots) | c369570f (2 Boots) | Δ |
|---|---|---|---|
| gpu-bank Wiese | 16,15 · 16,43 · 16,57 | 22,95 · 23,57 | **+6,9 ms** |
| gpu-bank Dorf | 14,43 · 13,70 · 14,01 | 19,15 · 19,54 | **+5,3 ms** |
| lauf Wiese fps / GPU-Durchsatz p50 | 57,6 · 53,0 · 52,8 / 17,0 | 41,4 · 36,9 / 24,1–24,6 | −14 fps |
| lauf Dorf fps | 65,5 · 67,1 · 65,6 | 50,0 · 46,8 | −17 fps |

Keine der gestempelten Pässe trägt das (horizont-karte 0,02 → 0,06 ms, k0/k1/haupt gleich). Die Last liegt also je Fragment im Licht aller
Empfänger: der Wolken-Wurf (2 × fbm2 à 5 Oktaven) in `_sonnenSicht`. An der GTX zahlt das Bild rund 7 ms, nicht ≤ 0,3 ms. Damit ist das Profi-Band
(p95 ≤ 33 ms) an der Wiese gefährdet: lauf p95 41,8 ms im zweiten Boot.

## Bilder

- `fernschatten-licht-K4-S.jpg`: S = Bild(Deckung 0,4)/Bild(0), oben zur Uhr t, unten zu t + 5 s. Bei main ist kein Wurf zu sehen (nur Fluss-Linien). Im
  Zweig ist ein Wurf da, aber **nah steht das Muster, fern kippen Blöcke in vollen Schatten (S < 0,75) und ändern ihre FORM**, statt
  zu wandern.
- `fernschatten-licht-K4-bild.jpg`: dieselbe Pose, Deckung 0,4.
- `fernschatten-ferne-K4.jpg`: Sonne 5°: die Hänge unter dem Grat werden dunkler, die besonnten Felder bleiben hell (das Verhältnis trägt).
- `fernschatten-wiese-ego.jpg`: **Wiese Ego, Mittag, Wetter sunny (Deckung 0,3): die ganze Wiese liegt im Wolken-Schatten**, die Sonnen-
  Flecken unter den Kronen sind fort, das Bild wirkt wie ein grauer Tag. Bei „sunny“ trägt das AAAA nicht.
- `fernschatten-dorf-third.jpg`: Third am Dorf.

## Das Auge: wo es falsch aussieht

1. **Das Muster zieht nicht.** Die Uhr ist es NICHT: Nachmessung `aus2/c369570f-1336/wolke.json` zeigt `skyboxUniforms.time` je Aufnahme
   bei 12,5 → 17,5 → 42,5 (= Bild-Uhr der Bühne). Verdacht: `_wolkenMenge` (`stamm/bild-himmel.js:93`) projiziert vom AUGE
   (`sp = dir.xz/(dir.y + projY) + auge.xz/((1+projY)·hoeheM)`). Das ist nur im Zenit eine in der Welt feste Schicht. Für schräge Strahlen
   (Station: Auge 90 m, 70°) verzerrt sich das Feld nichtlinear, und nA (+drift) gegen nB (−1,6·drift) verformt es, statt es zu verschieben. Der Nachbau in JS
   (r 0,7445 @ [18,−6]) gibt den GPU-Frame nicht wieder.
2. **Die Deckung 0,3 von „sunny“ dunkelt den Mittag flächig ab** (Wiese-Bild). Gesehen, nicht gezählt.
3. Banding oder Flimmern des Wurfs habe ich im 640er-Bild nicht gesehen; die Gang-Wache schatten.K2 bleibt gleich (4,65 %).

## Belege

`p3/n0311/w5/` auf der OMEN: `blick.cjs` (die NEUN-Seite wörtlich + Aufnahmen), `aus/c369570f/` (neun.json, gpu-bank-*.out,
lauf-*.out, bilder/), `aus2/c369570f-1336/` (wolke.json + Kosten, 2. Boot), `aus/5fba36ea/`, `aus2/5fba36ea-1332|1343/` (main). Jeder Lauf unter
`p3/gpu-lauf.sh` (Schloss omen-w5-*), Ports 7811/27811. Nichts gebucht.

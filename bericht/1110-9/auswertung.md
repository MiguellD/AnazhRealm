## Je Boot

| Boot | Ort | Urteil | Frame p95 | CPU-Takt p95 | Takt MHz | Befehle | Dreiecke | VRAM MB | Tiere |
|---|---|---|---|---|---|---|---|---|---|
| d1 | dorf | GRUEN | – | – | – | 105 | 604900 | 125.6 | – |
| d2 | dorf | GRUEN | – | – | – | 105 | 605474 | 124.7 | – |
| g1 | genesis | GRUEN | 25.1 | 7.5 | 1710.9 | 226 | 2273805 | 141.8 | 10 |
| g2 | genesis | GRUEN | 25.1 | 7.6 | 1732.6 | 226 | 2273711 | 141.8 | 10 |
| g3 | genesis | GRUEN | 25.1 | 8.1 | 1699.4 | 226 | 2273555 | 141.5 | 10 |
| w1 | wiese | GRUEN | 16.8 | 5.1 | 1711.0 | 82 | 472252 | 112.4 | 11 |
| w2 | wiese | GRUEN | 16.8 | 5.4 | 1719.8 | 83 | 468080 | 112.4 | 11 |
| w3 | wiese | GRUEN | 16.8 | 5.6 | 1730.5 | 83 | 471483 | 112.5 | 11 |

## E: Kriterium × Ort (Median der Boots)

| Kriterium | Soll | Wiese | Genesis | Dorf |
|---|---|---|---|---|
| Frame p95 ms (Regler voll) | 33 | 16.8 (-16.2) | 25.1 (-7.9) | – |
| CPU-Takt p95 ms | 5.8 | 5.4 (-0.4) | 7.6 (+1.8 ÜBER) | – |
| Befehle | 208 | 83.0 (-125.0) | 226.0 (+18.0 ÜBER) | 105.0 (-103.0) |
| Dreiecke | 680000 | 471483 (-208517) | 2273711 (+1593711 ÜBER) | 605187 (-74813) |
| VRAM MB | 118 | 112.4 (-5.6) | 141.8 (+23.8 ÜBER) | 125.2 (+7.2 ÜBER) |

## Täter je Ort (Boot mit dem höchsten VRAM)

### wiese (w3)

VRAM je Erzeuger: buf:szene 27.4 · tex:TRAANode.history 19.8 · tex:TRAANode.resolve 15.8 · tex:kaskade0 8 · tex:kaskade1 8 · tex:output 7.9 · tex:depth 7.9 · tex:szene 4

| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |
|---|---|---|---|
| boden | 8 (12) | 166726 (200000) | bodenSatz 3 · fern-ring 3 · wasserSatz 1 |
| baum | 39 (40) | 122630 (150000) | fscatter:fichte:L1 8 · f:tanne:L1 6 · f:fichte:L1 6 |
| nahWiese | 4 (4) | 54994 (80000) | nahWiese:L1 2 · nahWiese:L2 2 |
| einzelstuecke | 13 (25) | 49817 (15000) | spieler 5 · dsl-insel 3 · feld-pass 2 |
| streu | 5 (9) | 28540 (40000) | streuSatz 5 |
| bau | 4 (40) | 19002 (60000) | bauSatz 2 · bauWurf 2 |
| busch | 6 (8) | 18360 (40000) | f:strauch:L1 4 · f:strauch:L0 2 |
| formationen | 3 (20) | 10240 (30000) | formationenSatz 3 |

ROT des Bands: einzelstuecke k0: 5 befehle über der Ratsche 0 (Täter: spieler, dsl-insel, feld-pass) · einzelstuecke k0: 37964 dreiecke über der Ratsche 0 (Täter: spieler, dsl-insel, feld-pass)

### genesis (g1)

VRAM je Erzeuger: buf:szene 56.5 · tex:TRAANode.history 19.8 · tex:TRAANode.resolve 15.8 · tex:kaskade0 8 · tex:kaskade1 8 · tex:output 7.9 · tex:depth 7.9 · tex:szene 4

| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |
|---|---|---|---|
| bau | 156 (40) | 1805627 (60000) | f:maurentor:L0 25 · f:drachentor:L0 24 · f:verkalkt:L0 24 |
| boden | 8 (12) | 261411 (200000) | bodenSatz 3 · fern-ring 3 · farWater 1 |
| einzelstuecke | 24 (25) | 127409 (15000) | dsl-insel 7 · spieler 5 · portal-membran 4 |
| baum | 27 (40) | 48572 (150000) | f:tanne:L1 6 · f:birke:L1 6 · f:fichte:L1 4 |
| formationen | 5 (20) | 23600 (30000) | formationenSatz 5 |
| streu | 2 (9) | 5072 (40000) | streuSatz 2 |
| nahWiese | 3 (4) | 1268 (80000) | nahWiese:L2 2 · nahWiese:L1 1 |
| karten | 1 (1) | 846 (1000) | fimp:atlas:L2 1 |

ROT des Bands: boden k1: 70141 dreiecke über der Ratsche 64204 (Täter: bodenSatz, fern-ring, farWater) · einzelstuecke k0: 8 befehle über der Ratsche 3 (Täter: dsl-insel, spieler, portal-membran) · einzelstuecke k0: 47028 dreiecke über der Ratsche 9064 (Täter: dsl-insel, spieler, portal-membran)

### dorf (d1)

VRAM je Erzeuger: buf:szene 40.3 · tex:TRAANode.history 19.8 · tex:TRAANode.resolve 15.8 · tex:kaskade0 8 · tex:kaskade1 8 · tex:output 7.9 · tex:depth 7.9 · tex:szene 4

| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |
|---|---|---|---|
| boden | 8 (12) | 157946 (200000) | bodenSatz 3 · fern-ring 3 · wasserSatz 1 |
| baum | 43 (40) | 123272 (150000) | fscatter:fichte:L1 8 · f:fichte:L1 7 · f:tanne:L1 6 |
| einzelstuecke | 18 (25) | 87781 (15000) | spieler 10 · dsl-insel 3 · feld-pass 2 |
| busch | 6 (8) | 69696 (40000) | f:strauch:L1 4 · f:strauch:L0 2 |
| streu | 5 (9) | 53076 (40000) | streuSatz 5 |
| nahWiese | 4 (4) | 45686 (80000) | nahWiese:L1 2 · nahWiese:L2 2 |
| bau | 15 (40) | 45191 (60000) | bauSatz 11 · bauWurf 2 · bau-fundament 1 |
| formationen | 5 (20) | 21320 (30000) | formationenSatz 5 |

ROT des Bands: baum haupt: 30 befehle über der Ratsche 26 (Täter: fscatter:fichte:L1, f:fichte:L1, f:tanne:L1) · baum haupt: 105234 dreiecke über der Ratsche 99330 (Täter: fscatter:fichte:L1, f:fichte:L1, f:tanne:L1) · Summe (gebunden) 105 Befehle über der Ratsche 97

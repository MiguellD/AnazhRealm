## Je Boot

| Boot | Ort | Urteil | Frame p95 | CPU-Takt p95 | Takt MHz | Befehle | Dreiecke | VRAM MB | Tiere |
|---|---|---|---|---|---|---|---|---|---|
| gA1 | vorher | GRUEN | 25.1 | 7.1 | 1745.6 | 226 | 2273761 | 141.8 | 10 |
| gA2 | vorher | GRUEN | 25.1 | 7.5 | 1746.3 | 226 | 2277289 | 141.6 | 10 |
| gA3 | vorher | GRUEN | 25.1 | 7.7 | 1709.7 | 226 | 2276006 | 141.6 | 10 |
| gB1 | nachher | GRUEN | 25.1 | 7.6 | 1723.8 | 226 | 976364 | 121.6 | 10 |
| gB2 | nachher | GRUEN | 25.1 | 7.8 | 1739.2 | 226 | 977475 | 121.6 | 10 |
| gB3 | nachher | GRUEN | 25.1 | 7.8 | 1718.2 | 226 | 979884 | 121.6 | 10 |

## Genesis: Kriterium × Seite (Median der Boots), Rest zum E-Soll in Klammern

| Kriterium | Soll | vorher | nachher | Δ nachher − vorher |
|---|---|---|---|---|
| Frame p95 ms (Regler voll) | 33 | 25.1 (-7.9) | 25.1 (-7.9) | 0.0 |
| CPU-Takt p95 ms | 5.8 | 7.5 (+1.7 ÜBER) | 7.8 (+2.0 ÜBER) | +0.3 |
| Befehle | 208 | 226.0 (+18.0 ÜBER) | 226.0 (+18.0 ÜBER) | 0.0 |
| Dreiecke | 680000 | 2276006 (+1596006 ÜBER) | 977475 (+297475 ÜBER) | -1298531 |
| VRAM MB | 118 | 141.6 (+23.6 ÜBER) | 121.6 (+3.6 ÜBER) | -20.0 |

## Täter je Seite (Boot mit dem höchsten VRAM)

### vorher (gA1)

VRAM je Erzeuger: buf:szene 56.5 · tex:TRAANode.history 19.8 · tex:TRAANode.resolve 15.8 · tex:kaskade0 8 · tex:kaskade1 8 · tex:output 7.9 · tex:depth 7.9 · tex:szene 4

| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |
|---|---|---|---|
| bau | 156 (40) | 1805627 (60000) | f:maurentor:L0 25 · f:drachentor:L0 24 · f:verkalkt:L0 24 |
| boden | 8 (12) | 261367 (200000) | bodenSatz 3 · fern-ring 3 · farWater 1 |
| einzelstuecke | 24 (25) | 127409 (15000) | dsl-insel 7 · spieler 5 · portal-membran 4 |
| baum | 27 (40) | 48572 (150000) | f:tanne:L1 6 · f:birke:L1 6 · f:fichte:L1 4 |
| formationen | 5 (20) | 23600 (30000) | formationenSatz 5 |
| streu | 2 (9) | 5072 (40000) | streuSatz 2 |
| nahWiese | 3 (4) | 1268 (80000) | nahWiese:L2 2 · nahWiese:L1 1 |
| karten | 1 (1) | 846 (1000) | fimp:atlas:L2 1 |

ROT des Bands: boden k1: 70097 dreiecke über der Ratsche 64204 (Täter: bodenSatz, fern-ring, farWater) · einzelstuecke k0: 8 befehle über der Ratsche 3 (Täter: dsl-insel, spieler, portal-membran) · einzelstuecke k0: 47028 dreiecke über der Ratsche 9064 (Täter: dsl-insel, spieler, portal-membran)

### nachher (gB1)

VRAM je Erzeuger: buf:szene 36.5 · tex:TRAANode.history 19.8 · tex:TRAANode.resolve 15.8 · tex:kaskade0 8 · tex:kaskade1 8 · tex:output 7.9 · tex:depth 7.9 · tex:szene 4

| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |
|---|---|---|---|
| bau | 156 (40) | 509477 (60000) | f:maurentor:L0 25 · f:drachentor:L0 24 · f:verkalkt:L0 24 |
| boden | 8 (12) | 260120 (200000) | bodenSatz 3 · fern-ring 3 · farWater 1 |
| einzelstuecke | 24 (25) | 127409 (15000) | dsl-insel 7 · spieler 5 · portal-membran 4 |
| baum | 27 (40) | 48572 (150000) | f:tanne:L1 6 · f:birke:L1 6 · f:fichte:L1 4 |
| formationen | 5 (20) | 23600 (30000) | formationenSatz 5 |
| streu | 2 (9) | 5072 (40000) | streuSatz 2 |
| nahWiese | 3 (4) | 1268 (80000) | nahWiese:L2 2 · nahWiese:L1 1 |
| karten | 1 (1) | 846 (1000) | fimp:atlas:L2 1 |

ROT des Bands: einzelstuecke k0: 8 befehle über der Ratsche 3 (Täter: dsl-insel, spieler, portal-membran) · einzelstuecke k0: 47028 dreiecke über der Ratsche 9064 (Täter: dsl-insel, spieler, portal-membran)

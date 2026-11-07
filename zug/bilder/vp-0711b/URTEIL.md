**Urteil: ROT in 1 von 17 Schritten — `gate:naesse:echt`: „dorf Regenbild 1.025 × so hell wie die Sonne“. Täter: w18-innen-licht (a96dbeb9). main 5fb21e29 und die Kette bis einschließlich bild-weg: 0,951 GRÜN; ab + innen-licht: 1,025 ROT (3 Läufe); main + innen-licht allein: 1,025 ROT. Die übrigen 16 Schritte GRÜN, auch pruefbuehne-licht, wasser-leben:bild, weltbild-frost.**

# vp-0711b: echt-Vorprüfung mess-z281 b78996bc (OMEN, GTX 1060, 07.11. 02:51–03:57)

Der Kandidat ist main 5fb21e29 (z278) plus grund-post, sicht-fov, pegel-peers, lod-sprung, ki-strom-2, herde-hang, bild-weg, innen-licht, kamera-haus und laub-kante. Gefahren wurden die Schritte des Jobs „echt (GPU-Wände auf der Karte)“ am Kopf, der Reihe nach, mit ihren Fristen. Die Umgebung war wie bei vp-0611k: frischer Baum mit `npm ci`, Node 22.23.3, `CI_KLASSE=gpu LINSE_GPU=karte CI=true`.

| Gate | Urteil | Dauer | ❌-Zeile |
|---|---|---|---|
| fern-ring | GRÜN | 72 s |  |
| schatten-bias | GRÜN | 3 s |  |
| ziel-zensus | GRÜN | 30 s |  |
| analog-nah | GRÜN | 28 s |  |
| foundry-impostor | GRÜN | 26 s |  |
| pruefbuehne-licht | GRÜN | 16 s |  |
| wasser-leben:bild | GRÜN | 26 s |  |
| post-kette | GRÜN | 19 s |  |
| portal-membran | GRÜN | 81 s |  |
| ego-schatten | GRÜN | 29 s |  |
| kamera-leib:echt | GRÜN | 58 s |  |
| verdeckungs-abfrage | GRÜN | 29 s |  |
| weltbild-frost:echt | GRÜN | 141 s |  |
| tag-achse:echt | GRÜN | 79 s |  |
| licht-weg:echt | GRÜN | 58 s |  |
| naesse:echt | **ROT** | 106 s | NÄSSE ROT: dorf Regenbild 1.025 × so hell wie die Sonne |
| gpu-fehler | GRÜN | 21 s |  |

Σ 822 s.

## naesse:echt — der Täter

Die Probe hat drei Posen: Mess-Wiese, Wiese Third (neu ab der Kette) und das nächste Haus im Dorf von innen durch die offene Tür. Sie misst bei klarem Wetter, bei frischem Regen und nach 10 min Regen. Das Regenbild ist das Bild im Regen gegen das Bild in der Sonne.

| Stand | Dorf Regenbild | Dorf außen (Verhältnis) | Urteil |
|---|---|---|---|
| z274 (vp-0611k, main 323cc9f3 + 3) | 0,952 | 0,69 | GRÜN |
| main 5fb21e29 | 0,951 | 0,751 | GRÜN |
| + grund-post … bild-weg (6bdbc7f2) | 0,951 | 0,751 | GRÜN (nach einer Verdrängung durch die CI neu gefahren) |
| + innen-licht (5c2302b5) | **1,025** | 0,751 | ROT |
| + kamera-haus (dda4e498) | 1,025 | 0,751 | ROT |
| + laub-kante (b78996bc, der Kandidat) | 1,025 | 0,751 | ROT |
| main 5fb21e29 + innen-licht allein | **1,025** | 0,751 | ROT |

- **Unverändert:** Die Wiese steht auf jedem Stand bei 0,88 / 0,916. Innen unter dem Dach bleibt es trocken (Verhältnis 1, Regen innen 0), die Dach-Bauten sind trocken (2/2).
- **Der Sprung:** Er kommt allein mit innen-licht (fachwerk-core.js +25, stamm/stoff-material.js 69 Zeilen, „das Gesetzbuch nennt seine Decken, der Dach-Pool liest sie“). Das Dorf-Bild durch die Tür wird im Regen heller als in der Sonne.

Belege: `lauf.log`, `naesse-echt-z281.log`, `naesse-bisekt.txt`, `naesse-*.log` je Stand.

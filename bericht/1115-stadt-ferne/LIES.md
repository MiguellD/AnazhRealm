# stadt-ferne — die Ferne aus Stufe 1 (OMEN, GTX 1060, 15.11.2026) — ZWISCHENSTAND zur Abgabe auf w28-stadt-netz

Messort: die Netz-Stadt „dorf 7 4750“ (5 × 5 Kacheln), 3 × 3 wach, 1920 × 1080, 12 Uhr. Der Zweig trägt march-schirm a16016c4.

## Die Bilder

| Kamera | vorher (march-schirm allein) | nachher |
|---|---|---|
| aus 260 m | `../1115-march-schirm/nachher-ueber-260m.png` — neun Kacheln auf der Wiese | `ferne-ueber-260m.png` — die ganze Stadt mit Straßennetz |
| aus 90 m nach Osten | `../1115-march-schirm/nachher-ost-90m.png` — die Stadt endet nach zwei Kacheln | `ferne-ost-90m.png` — Dächer bis an die Hügel |
| aus 1 km | — (neu) | `ferne-ueber-1km.png` — 25 Kacheln, Straßen und Dächer bis zum Rand |
| vom Boden | `../1115-march-schirm/nachher-boden-ost.png` | `ferne-boden-ost.png` |

`ferne-ueber-260m-ohne-strassen.png` ist der Stand davor (Massen auf der Wiese).

## Geschnitten

- Kern fachwerk `kachelMassen(samen, nH, i, k, epoche)`: die Häuser-Liste der Kachel (`DORF` über `viertelWort` — dieselbe, aus der
  Stufe 2 ihre Lose baut: Zahl, Maße, Geschosse, Dachneigung, Ton) an Plätzen längs der Straßen von `kachelNetz`, dazu ihr
  Straßennetz mit Belag und Saum des Belag-Gesetzes; 1,2–3 ms je Kachel.
- Wirt `_stadtFerneTakt`: je Haus eine Kiste und ein Satteldach in zwei Pools der EINEN Kiste (2 Draws für die ganze Stadt, bis
  3000 m); die Straßen als Formen der Wege-Karte bis 1200 m; beides fällt, wenn die Siedlung der Kachel steht.

## Gemessen (Läufe `p3/n1511/ferne/lauf1…3`, Stand in Ruhe: lauf2)

| | march-schirm heute | mit der Ferne |
|---|---|---|
| Kacheln im Bild | 9 | 25 (15 als Massen, 2874 Häuser) |
| Bild p95 / fps | 33,3 ms / 51–59 | 25,1 ms / 66 (lauf1 ohne Straßen: 33,4 / 54) |
| Befehle | 56 | 59 |
| Dreiecke | 1,03 Mio. | 1,10 Mio. |
| VRAM | 158–160 MB | 155 MB |
| Heap nach GC | 651–836 MB | 876 MB |

## Offen, beim Namen

- Der Wechsel Massen → Häuser beim Erwachen: dieselbe Zahl (~200 je Kachel) an anderen Losen, in ~430–460 m; während des Zugs
  stehen beide.
- Die Mauer am fernen Stadtrand fehlt (sie kommt mit dem Plan der Kachel).
- Die Kapsel-Liste wächst weiter mit den wachen Häusern — der nächste Schnitt: volle Häuser nur im Nah-Ring, eine Kachel, die
  stand, trägt jenseits davon die Massen ihres ECHTEN Plans.

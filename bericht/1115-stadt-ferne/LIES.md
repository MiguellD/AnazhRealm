# stadt-ferne — die Ferne aus Stufe 1 (OMEN, GTX 1060, 15.11.2026) — ZWISCHENSTAND, WIP 42c35b2b auf w28-stadt-netz

Messort: die Netz-Stadt „dorf 7 4750“ (25 Kacheln), 3 × 3 wach, 1920 × 1080, 12 Uhr. Der Zweig trägt march-schirm a16016c4 gemergt.

| Kamera | vorher (march-schirm allein) | nachher |
|---|---|---|
| aus 260 m | `../1115-march-schirm/nachher-ueber-260m.png` — neun Kacheln auf der Wiese | `ferne-ueber-260m.png` — die ganze Stadt, 25 Kacheln |
| aus 90 m nach Osten | `../1115-march-schirm/nachher-ost-90m.png` — die Stadt endet nach zwei Kacheln | `ferne-ost-90m.png` — Dächer bis an die Hügel |

- Geschnitten: Kern fachwerk `kachelMassen` — die Häuser-Liste der Kachel (`DORF` über `viertelWort`: Zahl, Maße, Geschosse, Ton) an den
  Straßen von `kachelNetz`, 1,2–3 ms je Kachel; Wirt `_stadtFerneTakt` — je Haus eine Kiste und ein Satteldach in zwei Pools der
  EINEN Kiste, 2 Draws für die ganze Stadt; die Massen einer Kachel fallen, wenn ihre Siedlung steht.
- Gemessen (Lauf `p3/n1511/ferne/lauf1`): 15 ferne Kacheln, 2874 Häuser als Massen; Bild p95 33,4 ms (vorher 33,3), Befehle 56 → 58,
  Dreiecke 1,03 → 1,13 Mio., VRAM 155 MB.
- Offen: die Straßen der fernen Kacheln (sie stehen auf Wiese), der Wechsel Massen → Häuser beim Erwachen (dieselbe Zahl, andere
  Lose), Mauer am fernen Stadtrand, Gehen und Fahren an stadt-voll, die Abgabe (nach der Landung von march-schirm).

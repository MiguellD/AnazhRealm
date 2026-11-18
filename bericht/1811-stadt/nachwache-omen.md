# Nachwache der Netz-Stadt an der GTX 1060 (OMEN) — 18.11., ZWISCHENSTAND

Gemessen 04:52–05:57, ein Boot des Geräts, je Lauf ein eigener Boot der Welt unter dem GPU-Schloss.
Treiber `p3/n1411/netz/stadt-netz.cjs` (Modus `voll` und `stand`), `/lauf` 20 s nach 10 s Einschwingen, Regler frei, 1920 × 1080.
Roh: `nachwache/<lauf>.json` (dieser Ordner), am OMEN `p3/n1811/netz/<lauf>/` mit `lauf.roh.json`.

## 1. stadt-voll: main-vorher 21f279f5 ↔ c1e6f29a (Netz-Stadt gelandet), 3 Boots je Seite im Wechsel

| Lauf | Kopf | Frame p50 / p95 / p99 ms | CPU-Takt p50 / p95 ms | GPU ms p50 / p95 | dc mittel / p95 | Tris | VRAM MB | Heap MB |
|---|---|---|---|---|---|---|---|---|
| vor-1 | 21f279f5 | 16,65 / 25,04 / 41,63 | 12,40 / 21,23 | 1,99 / 2,91 | 218 / 270 | 1 117 440 | 176,5 | 449,0 |
| vor-2 | 21f279f5 | 16,64 / 25,01 / 33,37 | 12,25 / 19,21 | 2,01 / 3,23 | 224 / 258 | 1 128 485 | 176,8 | 445,7 |
| vor-3 | 21f279f5 | 16,63 / 25,07 / 33,35 | 11,13 / 19,15 | 2,01 / 3,13 | 233 / 273 | 1 126 044 | 177,2 | 447,5 |
| nach-1 | c1e6f29a | 16,61 / 25,10 / 33,24 | 10,57 / 16,46 | 2,03 / 3,03 | 224 / 259 | 1 128 182 | 177,3 | 445,5 |
| nach-2 | c1e6f29a | 16,61 / 25,07 / 25,40 | 9,79 / 14,24 | 2,01 / 2,90 | 229 / 272 | 1 128 265 | 178,2 | 459,6 |
| nach-3 | c1e6f29a | 16,61 / 25,04 / 25,41 | 10,17 / 15,96 | 2,01 / 3,16 | 242 / 272 | 1 129 628 | 178,0 | 460,1 |

Lesen: Frame p95 steht auf beiden Seiten auf der Vsync-Stufe 25 ms (25,01–25,07 ↔ 25,04–25,10) — kein Preis-Maß an diesem Ort.
GPU ms p50 gleich (1,99–2,01 ↔ 2,01–2,03). Der CPU-Takt liegt nachher in allen drei Boots tiefer
(p50 11,13–12,40 ↔ 9,79–10,57; p95 19,15–21,23 ↔ 14,24–16,46). dc und Tris im Rauschen der Boots.
Heap in zwei von drei Boots nachher ~+13 MB (445,7–449,0 ↔ 445,5–460,1) — offen benannt, nicht zerlegt.
Kein Rückfall an stadt-voll durch die Landung.

## 2. Die zwei Worte am c1e6f29a, im Stand (aus `--ort wiese`, 3 × 3 Kacheln erwacht, Spieler auf der Hauptstraße)

| Wort | Frame p50 / p95 / p99 ms | CPU-Takt p50 / p95 ms | GPU ms p50 / p95 | dc mittel / p95 | Tris | VRAM MB | Heap MB | Häuser mit Bild |
|---|---|---|---|---|---|---|---|---|
| dorf 7 4750 (9 × 9 Kacheln, 81) | 16,59 / 24,95 / 25,08 | 9,06 / 12,78 | 2,35 / 3,11 | 60 / 65 | 707 713 | 173,0 | 463,5 | 1,000 (1 398 von 1 398) |
| dorf 7 42750 (29 × 29 Kacheln, 841) | 16,63 / 25,04 / 41,70 | 10,59 / 17,70 | 2,21 / 2,87 | 58 / 63 | 1 510 275 | 181,4 | 497,1 | 1,000 (1 549 von 1 549) |

Radeon-Vergleich aus dem Übergabe-Blatt: 4750 → 41,7 ms · 12,3 / 21,3 ms · 58 · 173 MB · 0,926; 42750 → 41,9 ms · 12,5 / 21,5 · 56 · 184 MB · 0,968.

Lesen: die neunfache Stadt kostet an der GTX +0,09 ms Frame p95 (Vsync-Stufe), −0,14 ms GPU p50, −2 Befehle, +8,4 MB VRAM,
+33,6 MB Heap, +1,5 ms CPU-Takt p50 (+4,9 ms p95). Die Ferne ist Funktion: 841 Kacheln, davon 823 als Massen (44 991 Massen an,
Pools 46 531 von 65 536), 18 wach. Kein Haus ohne Bild in beiden Worten (Satz 699 / 676, Masse 699 / 873, Mesh 179 / 179).
3 × 3 erwacht nach 168 s (4750) und 176 s (42750); die Welt ruht nach 93 s / 97,5 s (alle Zähler `_weltOffen` 0).

## 3. Was die Messung nicht deckt
- Stand, nicht Gang: Hänger beim Gehen über Kachel-Kanten sind hier nicht gemessen.
- Zwei Läufe wurden von CI verdrängt und liefen von vorn (vor-2 nach 71 s, stand-42750 nach 277 s); gezählt ist je der ganze zweite Lauf.
- Heap-Anstieg an stadt-voll (+13 MB in 2 von 3 Boots) ohne Halter-Zerlegung.
- Bild: Gasse main ↔ w28-haus-stoff liegt in `gasse/`; die Wege tragen keinen Körper (Auftrag w28-weg-koerper).

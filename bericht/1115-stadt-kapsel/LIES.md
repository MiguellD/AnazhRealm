# stadt-kapsel — der Satz der Stadt endet am Nah-Ring (OMEN, GTX 1060, 15.11.2026) — ZWISCHENSTAND zur Abgabe auf w28-stadt-netz

Messort: die Netz-Stadt „dorf 7 4750“ (5 × 5 Kacheln), 1920 × 1080, 12 Uhr; vorher = 3de2b281 (die Ferne aus Stufe 1).

## Die Bilder

`kapsel-ueber-260m.png`, `kapsel-ueber-1km.png`, `kapsel-ost-90m.png`, `kapsel-boden-ost.png` — gegen
`../1115-stadt-ferne/ferne-*.png` (dieselben Kameras): die Stadt liest sich gleich; der Unterschied liegt in der Liste.

## Geschnitten

- Kern fachwerk `planMassen(plan)`: die Massen-Regel der Stufe 1 (`hausMasse`, EINE Regel beider Stufen) an den ECHTEN Losen
  des Plans.
- Wirt: ein Haus der Stadt trägt sein Mesh in der Mesh-Zone, seinen Satz im Welt-March bis `STADT_FERNE.nahM` (300 m),
  dahinter — und solange es weder Mesh noch Satz trägt — seine Masse an seinem Los (`_stadtMasseRegt` am Weckruf des Baus).
- Die Kachel wechselt auf die Massen ihres Plans, sobald ihr Vorrat bereit liegt (zwei Ringe um den Spieler, vor dem
  Erwachen): das Erwachen stellt kein Haus mehr um, und Massen und Häuser stehen nie doppelt.

## Gemessen (Läufe `p3/n1511/ferne/kapsel2`, `kapselgang`; vorher `lauf2`, `gang-nach`, `gang-vor`)

| | vorher (3de2b281) | nachher |
|---|---|---|
| Kapsel-Liste, 3 × 3 wach | 6779 von 8192 | 4199 von 8192 (10 Kacheln stehen) |
| Häuser: Satz / Masse / Mesh / ohne Bild / doppelt | 1442 / – / 199 / 1 / – | 606 / 1024 / 199 / 0 / 0 |
| Kacheln im Bild | 25 (15 Stufe 1) | 25 (6 Stufe 1, 19 an echten Losen) |
| Stand: Bild p95 / fps | 25,05 ms / 66 | 25,02 ms / 64,5 |
| Befehle / Dreiecke | 59 / 1,10 Mio. | 59 / 1,12 Mio. |
| VRAM / Heap nach GC | 154,7 MB / 876 MB | 161,5 MB / 877 MB |
| Gang 4 m/s über drei Kacheln: Bilder > 33 ms | 35,2 % (ohne Ferne 40,6 %) | 16,2 % |
| Gang: Bild p50 / p95 / Bilder > 100 ms | 25 / 100 ms / 243 | 16,7 / 41,6 ms / 15 |

Je ein Lauf. Der Gang-Lauf „vorher“ startete, während im selben Baum schon geschrieben wurde (fehlerfrei, Stand nicht
sicher 3de2b281) — der Lauf ohne Ferne (ad88b634, 40,6 %) ist sauber.

## Offen, beim Namen

- Der Zug ist langsamer je Sekunde (4,8 statt 5,6 Häuser/s; die Bilder sind dafür flüssig): Kachel 4,1 endet 55 m HINTER
  ihrer Kante (vorher 17 m), Kachel 5,1 67 m davor (vorher 92 m dahinter).
- Der Wechsel Stufe 1 → echte Lose bleibt, liegt aber am Rand des Vorrats (zwei Kacheln voraus) statt am Erwachen.
- Die Masse ist Kasten und Satteldach — Turm, Kuppel und Flügel trägt erst der Satz (bis 300 m) oder das Mesh.
- Die Größe (7 × 7, 15 × 15) ist der nächste Lauf.

# Bericht 2310 ABAB Zug 2 40d00ade gegen main 1ef4042c: nicht langsamer — Stadt gehend 35,9 → 41,0 fps; M36 Bau-Hash gleich, Erwachen-Bild 460 → 108/125 ms, erstes Haus bei nH 300 erst nach 4,7 s

GTX 1060, `--echt` 1920×1080, Regler voll.
- **A** = n2010-b2b (main 1ef4042c).
- **B** = n2010-b2a (40d00ade = V18.546.70 = main + stadt-erwachen be20b015 + wackler-klasse 301228ba).
- **Instrument:** die Werkbank aus B; beide Bäume sauber.
- **Je Boot:** frisch, Schloss, Seiten-Wache; die Serie startete nach dem echt-Lauf 39868337785 (Schloss frei 01:13).
- **Folge:** A1 B1 A2 B2.
- **Urteil je Größe:** Δ ≤ max(2σ gepoolt, Auflösung) (`auswertung-gehen.cjs`). Gezählt wird je Boot über `lauf`.

## Zellen

| Zelle | Größe | A | B | Urteil |
|---|---|---|---|---|
| Dorf Ego 8 Uhr steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,3 · 12,38 | 16,8 · 5,5 · 12,38 | gleich (2σ CPU 0,4) |
| | Befehle · Dreiecke · VRAM | 57 · 421,6k · 113,7 | 57 · 421,5k · 114,9 | VRAM **+1,2 MB** (Puffer, gleiche Zahl) |
| Stadt geht (Hauptgasse) | fps · Frame p95 · CPU-Takt p95 | 35,9 · 54,3 · 49,2 | 41,0 · 49,8 · 40,1 | **schneller**; 49,8 > 33, also weiter ROT |
| | Frame max · Frame p99 | 292 / 258 · 100 | 142 / 142 · 83 | **halbiert** |
| | Befehle · Dreiecke Mittel · VRAM | 72 · 1,65 M · 184,5 | 72 · 1,64 M · 199,4 | VRAM **+14,9 MB** |
| Stadt steht | Frame p95 · CPU-Takt p95 · VRAM | 16,8 · 6,7 · 149,0 | 16,8 · 6,8 · 142,1 | gleich, VRAM −6,9 |
| Wiese Ego steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 4,5 · 12,35 | 16,8 · 4,4 · 12,25 | gleich |
| Wiese Ego geht | fps · Frame p95 · CPU-Takt p95 | 61,0 · 25,1 · 18,6 | 60,8 · 25,1 · 18,9 | gleich (2σ 0,6) |
| | Befehle · Dreiecke p95 · VRAM | 85 · 396k · 112,1 | 85 · 396k · 112,1 | gleich |
| Genesis Third steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,9 · 11,53 | 16,7 · 6,0 · 11,43 | gleich (+0,1 = Auflösung) |
| | Befehle · Dreiecke · VRAM | 78 · 318,7k · 113,8 | 78 · 318,7k · 113,8 | gleich |

**Stadt-VRAM gehend:** `buf:?` 102,0 → 116,8 MB, bei 793 statt 802 Puffern, also größere Puffer. Im 30-s-Fenster wächst der Speicher bei B um +18,1 MB, bei A schrumpft er um 10,8 MB; die Spitze liegt bei 290,8 statt 254,8 MB. Vermutlich hält das Erwachen in Raten (Erdbau-Delta, Platz-Netz) Puffer über das Fenster; mit `werkbank puffer` nicht weiter zerlegt.

Die ersten Wiese-Banken lagen diesmal einig bei 12,18–12,44, also nicht bimodal.

## M36 siedlung.K5 an B 40d00ade
- **Aufbau:** wie am 22.10. (`m36-erstes-haus.js`): Station dorf, Zelle −4,−6, der Spieler geht ab 450 m mit 4 m/s, 4 frische Boots 12 / 300 / 12 / 300.
- **Neu:** das längste Bild in den 300 Bildern ab dem Erwachen (`nachErwachen`).

| Boot | nH | gesetzt | im Sichtradius | gezeichnet | Latenz ab Sichtradius | längstes Bild nach dem Erwachen (Bild Nr.) · Bilder > 33 ms | erstes Haus (Same, Abstand) | Bau-Hash |
|---|---|---|---|---|---|---|---|---|
| b1 | 12 | 7,3 ms | 33 198 ms | 33 330 ms | **132 ms** | 66,7 (127) · 16 | fraenkisch 905543, 104,6 m | f5558d2c |
| b3 | 12 | 6,9 ms | 33 648 ms | 33 776 ms | **128 ms** | 99,9 (122) · 19 | fraenkisch 905543, 102,8 m | f5558d2c |
| b2 | 300 | 3,8 ms | 4 487 ms (201 Bilder) | **4 668 ms** | **180 ms** | **108,4** (81) · 39 | mittelalterlich 346163, 31,1 m | 68df1b3c |
| b4 | 300 | 7,3 ms | 4 567 ms (189 Bilder) | **4 820 ms** | **253 ms** | **125,0** (94) · 35 | mittelalterlich 346163, 30,8 m | 68df1b3c |

- **Bau-Hash GLEICH** an beiden Größen, 2/2 je nH; am 22.10. war nH 300 ungleich. nH 12 trägt denselben Hash wie am 22.10.
- **Hänger beim Erwachen fort:** das längste Bild sinkt von 461–469 auf 108 / 125 ms (4×). In den 300 Bildern danach bleiben 35–39 Bilder über 33 ms.
- **nH 300, erstes Haus im Bild:** gesetzt wird im ersten Takt (ein fernes Haus). Ein Haus im Sichtradius und im Kegel gibt es erst nach 189–201 Bildern (4,5 s), gezeichnet nach **4,67 / 4,82 s**; am 22.10. waren es 0,65 s. Dieses erste Haus liegt rund 220 m vom Anker entfernt auf der Seite des Spielers. Passend zu „ein Slot im Grund des Spielers wartet im Zug“ (be20b015) kommen die spielernahen Häuser zuletzt.
- **Ab dem Sichtradius** halten beide Größen ≤ 0,5 s (128–253 ms).

**Urteil M36:**
- Bit-gleich und der Hänger: GRÜN.
- Erwachen → erstes Haus ≤ 0,5 s: nH 300 ROT mit 4,7 s, Täter ist die Reihenfolge der Raten (nah zuletzt).
- nH 12 wie bisher über den Sichtradius (33 s Gehen, dann 0,13 s).

## Urteil ABAB
**nicht langsamer.**
- An keiner Zelle ist eine Zeitgröße langsamer; Stadt gehend ist schneller.
- Benannt offen: VRAM Stadt gehend +14,9 MB (wachsende Puffer im Fenster) und Dorf +1,2 MB.

Zeile in `zug/abab.txt`: `40d00adec2bf4d3582b24b0ddd97691d0c14fae5 nicht-langsamer 2310-abab-zug2`.

Roh: `bericht/2310-abab-zug2/gehen/` (je Boot `*-steht.txt`, `*-geht-1.txt`, `*-bank.txt`, `*-smi.csv`; Auswertung `auswertung-gehen-<zelle>.md|json`), `m36/b*-nh*.txt`, `serie.sh`, `m36.sh`, `m36-erstes-haus.js`, `fortschritt.log`; OMEN `p3/n2210/zug2/`.

**Status ZWISCHENSTAND + Übergabe:**
- Zug 2 gemessen, die Zeile steht; landen per `zug.sh landen` liegt beim Koordinator.
- Offen benannt:
  - M36 nH 300: erstes Haus 4,7 s nach dem Erwachen; die Raten bauen spielernah zuletzt.
  - Stadt gehend: 49,8 > 33 ms, VRAM +14,9 MB.
  - Dorf: VRAM +1,2 MB.
- Als Nächstes setze ich die pausierte abab-stufe fort (A-gegen-A).

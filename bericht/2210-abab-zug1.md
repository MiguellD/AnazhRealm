# Bericht 2210 ABAB Zug-Kandidat 1ef4042c gegen main 73f28224: nicht langsamer — Stadt gehend 3 → 35 fps, Sturm gehend −34 % Befehle, Wiese-Bank-Ausschlag ist Sitzungs-Zustand

GTX 1060, `--echt` 1920×1080, Regler voll.
- A = n2010-b2a (main 73f28224), B = n2010-b2b (1ef4042c = V18.546.69 = main + stadt-takt + tier-satz), Instrument = werkbank aus B, beide Bäume sauber.
- Je Boot frisch, mit Schloss, Seiten-Wache (Fingerabdruck vor und nach dem Boot gleich), Nachtruhe und Vorfahrt für einen Runner.Worker.
- Folge A1 B1 A2 B2; Wiese Ego wegen des Bank-Ausschlags auf 4+4 verlängert.
- Urteil je Größe: Δ ≤ max(2σ gepoolt, Auflösung) (`auswertung-gehen.cjs`).
- Gezählt wird je Boot über `lauf`: Befehle, Dreiecke, VRAM jetzt.

## Zellen

| Zelle | Größe | A | B | Urteil |
|---|---|---|---|---|
| Wiese Ego steht (4+4) | Frame p95 · CPU-Takt p95 | 16,8 · 4,8 | 16,8 · 4,8 | gleich |
| | gpu-bank ms | 12,16 (12,11–12,20) | 12,69 (12,54–12,88) | +0,53 — siehe unten, nicht reproduzierbar |
| | Befehle · Dreiecke · VRAM | 38 · 266k · 109,9 | 38 · 264k · 108,7 | gleich |
| Wiese Ego geht (4+4) | Frame p95 · CPU-Takt p95 · fps | 25,1 · 19,9 · 59,8 | 25,1 · 19,8 · 59,8 | gleich |
| Genesis Third steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,9 · 11,30 | 16,8 · 6,0 · 11,43 | gleich (2σ 0,2 / 0,30) |
| | Befehle · Dreiecke · VRAM | 78 · 318,7k · 113,8 | 78 · 318,7k · 113,9 | gleich |
| Sturm + 50 Tiere geht | Frame p95 · CPU-Takt p95 · fps | 33,4 · 30,3 · 44,6 | 33,3 · 28,8 · 47,9 | **schneller** (CPU-Takt p50 20,1 → 18,4) |
| | Befehle Mittel · p95 | 115 · 157 | 76 · 110 | **−34 %** |
| | Dreiecke p95 | 857k | 645k | **−25 %** |
| | VRAM | 116,0 | 118,7 | **+2,6 MB** |
| Sturm steht | Frame p95 · CPU-Takt p95 | 16,8 · 4,6 | 16,8 · 4,7 | gleich |
| Stadt geht (Hauptgasse) | fps · Frame p95 · CPU-Takt p95 | 3,2 · 467 · 451 | 34,6 · 58,3 · 51,1 | **8× schneller**; 58 > 33, also weiter ROT |
| | Befehle · Dreiecke Mittel · VRAM | 80 · 1,60 M · 183,9 | 71 · 1,65 M · 183,3 | gleich |
| Stadt steht | CPU-Takt p95 · Belegung p95 · VRAM | 7,2 · 10,75 · 150,9 | 6,5 · 9,70 · 148,8 | schneller (Texturen 85,8 → 81,9) |
| Dorf Ego steht 8 Uhr | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,6 · 12,40 | 16,8 · 5,4 · 12,37 | gleich |
| | Befehle · Dreiecke · VRAM | 57 · 421,6k · 116,2 | 57 · 421,6k · 113,1 | gleich (VRAM −3 MB) |

### Sturm, VRAM +2,6 MB
Der Zuwachs liegt in unbenannten Puffern (`buf:?`, 772 statt 677 Stück, +2,0 MB) und in 4 Texturen (+0,3 MB). Das gehört zum Tier-Satz, der 50 Tiere als Instanzen hält. Damit stehen 118,4/118,9 MB knapp über dem E-Haushalt von 118 MB; der gilt für den Stand, und stehend ist der VRAM gleich.

### Wiese Ego, gpu-bank +0,53
- **Aufbau der Probe** (`tier/`): je Boot 3 Banken auf derselben Welt — mit Tieren, ohne Tiere (`toggleCreatures(false)` + `lauf 3`), wieder mit (+ `lauf 3`); 2+2.

  | Boot | Bank mit | Bank ohne | Bank mit 2 |
  |---|---|---|---|
  | A1 | 12,87 | 12,00 | 12,12 |
  | A2 | 14,19 | 12,36 | 12,26 |
  | B1 | 12,32 | 12,25 | 12,16 |
  | B2 | 14,08 | 12,21 | 11,98 |

- **Erste Bank nach dem Einschwingen:** 2 von 4 Boots liegen über 14 ms, an beiden Seiten. Das ist der bekannte bimodale Wiese-Zustand, kein B-Term.
- **Zweite und dritte Bank:** A 12,00/12,36 und 12,12/12,26 gegen B 12,25/12,21 und 12,16/11,98 — gleich.
- **Tiere:** aus ±0,1, an keiner Seite ein Term. Tier-Satz ist am Bank-Ausschlag unschuldig.
- **Alle ersten Banken gepoolt (6+6):** A 12,61, B 12,86, Δ +0,25 bei einer Streuung bis 14,2 — nicht trennbar.
- **Im echten Bild:** GPU-Durchsatz p50 13,05 gegen 13,13 und Frame p95 gleich.

## Urteil
**nicht langsamer.**
- Größer wird nur der VRAM der Sturm-Fahrt (+2,6 MB), dagegen stehen −34 % Befehle und −25 % Dreiecke.
- Stadt gehend bleibt ROT gegen 33 ms (58,3 ms), ist aber achtmal schneller als main.

Zeile in `zug/abab.txt`: `1ef4042c332c43b7f682bad3cdbdda076dbaf83d nicht-langsamer 2210-abab-zug1`.

Roh: `bericht/2210-abab-zug1/gehen/` (je Boot `*-steht.txt`, `*-geht-1.txt`, `*-bank.txt`, `*-smi.csv`, `*-zensus-*.txt`, Auswertung `auswertung-gehen-<zelle>.md|json`), `tier/` (Probe), `serie.sh`, `fortschritt.log`; OMEN `p3/n2210/zug1/`.

**Status ZWISCHENSTAND + Übergabe:**
- ABAB 1ef4042c gemessen, die Zeile steht; landen per `zug.sh landen` liegt beim Koordinator.
- Offen benannt: Stadt gehend 58,3 > 33 ms; Sturm-VRAM +2,6 MB (unbenannte Satz-Puffer, `buf:?`); die erste Wiese-Bank nach dem Einschwingen ist bimodal (Messregel: Bank nach einem kurzen Lauf).
- Als Nächstes setze ich die pausierte abab-stufe fort (A-gegen-A).

# z9-abab — ABAB a2b28770 gegen f7dd313c: nicht-langsamer

GTX 1060, `--echt` 1920×1080, Regler voll, Messplatz-Dienst (zug/messplatz.md). A = f7dd313c5e8d716b3f28df3d0f1420e78c12e2c4, B = a2b28770a83f96fb18d6657131c741312fcef266, Instrument aus B. Je Zelle 2+2, verlängert auf 4+4 nur bei Kern-Anschlag oder einer Größe zwischen 1σ und 2σ. Urteil je Größe Δ ≤ max(2σ gepoolt, Auflösung).

| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |
|---|---|---|---|---|---|---|---|---|
| **w-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| **g-third** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| **d-ego** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| **stadt** | 2+2 | | **Urteil** | | | | | **nicht-langsamer** |
| fahrt | 4+4 | volle Fahrt | fps | 38.1 | 51.7 | 13.6 | 4.16 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p95 | 41.7 | 33.35 | -8.35 | 0.17 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Frame p99 | 83.3 | 45.85 | -37.45 | 14.38 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | CPU-Takt p95 | 41.4 | 29.4 | -12 | 3.46 | nicht langsamer |
| fahrt | 4+4 | volle Fahrt | Belegung p95 | 43.46 | 31.61 | -11.85 | 2.98 | nicht langsamer |
| fahrt | 2+4 | Zählung | Befehle | 63 | 61.25 | -1.75 | – | – |
| fahrt | 2+4 | Zählung | Dreiecke p95 | 439346 | 444625 | 5280 | – | – |
| fahrt | 2+4 | Zählung | VRAM MB | 117.5 | 115.85 | -1.65 | – | – |
| fahrt | – | volle Fahrten | A4 B1 B3 | | | | | |
| **fahrt** | 4+4 | | **Urteil** | | | | | **nicht-langsamer** |

Instrument je Boot: f7dd313c5 (fahrt-A3, fahrt-A4, fahrt-B3, fahrt-B4)

Roh: `bericht/z9-abab/`.

## BERICHTIGUNG (OMEN-Sitzung, 23.10.)
Das Urteil „nicht-langsamer“ oben ist FALSCH, richtig ist **UNENTSCHIEDEN**.
- **Was fehlte:** Alle A-Boots der Gehen-Zellen sind leer. Die Werkbank aus B (a2b28770) wartet in `welt-boot.cjs` auf `anazhRealm.erwacht`, das A (f7dd313c) nicht trägt. Darum wurde sie an A nie bereit, und jeder Befehl scheiterte mit ECONNREFUSED.
- **Warum der Richter es übersah:** `p3/messplatz/urteil.cjs` ließ die leeren Kern-Größen („–“) fallen, statt UNENTSCHIEDEN zu urteilen.
- **Behoben:**
  - Fehlt einer Seite eine Kern-Größe des Stands, ist die Zelle jetzt UNENTSCHIEDEN.
  - Das Instrument ist nun die Werkbank von main, mit Rückfall je Boot auf die eigene Seite.
- **Neu gemessen:** Der Kandidat läuft als `z9c-abab` (B = 13c95713).
- **Zeile:** `zug/abab.txt` trägt dafür `<a2b28770…> UNENTSCHIEDEN z9-abab-berichtigt`.

# Bericht 2310 ABAB Zug 3 3528f2d0 gegen main cfb563bf: nicht langsamer — Fahrt bei voller Fahrt CPU-Takt p95 30,9 → 29,6, Dorf Belegung und außer Takt gleich

GTX 1060, `--echt` 1920×1080, Regler voll.
- **A** = n2010-b2b (main cfb563bf).
- **B** = n2010-b2a (3528f2d0 = V18.546.71 = main + material-albedo 86e5d92a + fahrt-takt f36c1dff).
- **Instrument:** die Werkbank aus B; beide Bäume sauber.
- **Start:** nach dem echt-Lauf 39887887404 an 3528f2d0 (Schloss frei 04:25), Folge A1 B1 A2 B2.
- **Je Boot:** frisch, Schloss, Seiten-Wache.
- **Urteil je Größe:** Δ ≤ max(2σ gepoolt, Auflösung); Mittel A → B.

## Zellen

| Zelle | Größe | A | B | Urteil |
|---|---|---|---|---|
| GT-Fahrt (Third, Wechsel nach Ego je 240 Takte) | fps · Frame p95 · Frame p99 · Frame max | 52,8 · 33,3 · 45,9 · 108 | 53,5 · 33,3 · 41,8 · 100 | gleich |
| | CPU-Takt p50 · p95 · Belegung p95 · außer Takt p95 | 14,5 · 28,9 · 31,7 · 2,47 | 14,7 · 28,8 · 30,9 · 2,38 | gleich |
| | GPU-Durchsatz p50 · Befehle Mittel · Dreiecke p95 · VRAM | 17,2 · 63 · 475k · 120,4 | 16,9 · 64 · 459k · 118,8 | gleich |
| Dorf Ego 8 Uhr steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,4 · 12,28 | 16,8 · 5,3 · 12,45 | gleich (2σ 0,42) |
| | **Belegung p50 · p95 · außer Takt p95** | 5,38 · 7,18 · 0,74 | 5,38 · 7,15 · 0,73 | **gleich** |
| | Befehle · Dreiecke · VRAM | 57 · 421,7k · 114,1 | 57 · 421,5k · 114,6 | gleich |
| Wiese Ego steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 4,3 · 12,22 (11,92 · 12,53) | 16,8 · 4,2 · 12,99 (13,60 · 12,38) | gleich (2σ 1,36; B1 = die bimodale erste Bank) |
| Wiese Ego geht | fps · Frame p95 · CPU-Takt p95 · Belegung p95 | 61,6 · 25,1 · 18,3 · 22,2 | 62,0 · 25,1 · 18,3 · 21,8 | gleich |
| | Befehle · Dreiecke p95 · VRAM | 53 · 397k · 113,3 | 53 · 392k · 112,4 | gleich |
| Genesis Third steht | Frame p95 · CPU-Takt p95 · gpu-bank | 16,8 · 5,8 · 11,36 | 16,8 · 5,8 · 11,52 | gleich (2σ 0,59) |
| | Befehle · Dreiecke p95 · VRAM | 78 · 356,9k · 113,8 | 78 · 356,9k · 113,8 | gleich |

### Fahrt
Die Fahrten streuen zwischen den Boots. An jeder Seite blieb ein Boot hängen und kam kaum auf Tempo:

| Boot | Weg m | v50 | Anteil 8–12 m/s | Ego-Anteil |
|---|---|---|---|---|
| A1 | 134 | 3,8 | 0,39 | 0,52 |
| B2 | 119 | 2,7 | 0,32 | 0,41 |
| A2 | 162 | 9,9 | 0,65 | 0,34 |
| B1 | 177 | 10,0 | 0,72 | 0,29 |

Paarweise verglichen:
- **Volle Fahrt** (A2 gegen B1): fps 50,0 → 50,6, CPU-Takt p95 30,9 → 29,6, Frame p99 50,1 → 41,8, Belegung p95 34,1 → 32,2.
- **Hängende Fahrt** (A1 gegen B2): fps 55,5 → 56,4, CPU-Takt p95 26,9 → 27,9.

Der Geomorph-Gewinn der Radeon (2,6 → 1,6–1,9 ms) zeigt sich an der GTX nicht als eigene Größe: der GPU-Durchsatz p50 sinkt 17,2 → 16,9 innerhalb von 2σ 2,6, und das Bild hängt am VSync-Raster 33,3.

### Dorf, die Bake-Zeit der fernen Stufen (L2 45 → 66, L3 24 → 40 ms)
- Belegung und außer Takt sind am stehenden Dorf gleich.
- Der Bake fällt beim Stand in die Einschwing-Phase vor dem Messfenster. Im 30-s-Fenster liegt kein ferner Haus-Bau.
- Frame max 41,7/33,3 gegen 41,7/50 liegt im Rauschen einzelner Bilder.

## Urteil
**nicht langsamer.**

Zeile in `zug/abab.txt`: `3528f2d0f4426d7d06e39685d92c1e9491674f97 nicht-langsamer 2310-abab-zug3`.

Roh: `bericht/2310-abab-zug3/`
- `gehen/`: je Boot `*-steht.txt`, `*-geht-1.txt`, `*-bank.txt`, `*-smi.csv`; die Auswertung je Zelle `auswertung-gehen-<zelle>.md|json`.
- `fahrt/`: je Boot `*-lauf.txt`, `*-pruef.txt`, `*-auf.txt`; dazu `fahrt-auswertung.md` (`ausw-lauf.cjs`).
- `serie.sh`, `warte-echt.sh`, `fortschritt.log`.
- OMEN `p3/n2210/zug3/`.

**Status ZWISCHENSTAND + Übergabe:**
- Zug 3 gemessen, die Zeile steht; landen per `zug.sh landen` liegt beim Koordinator.
- Offen benannt: Die Fahrt-Zelle streut mit dem Fahrer (hängt an 2 von 4 Boots). Für ein schärferes Fahrt-Urteil braucht sie eine stabile Bahn.
- Als Nächstes setze ich die pausierte abab-stufe fort (A-gegen-A ab Genesis Ego B3).

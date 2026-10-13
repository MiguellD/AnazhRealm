# Bericht 1310-3 — Frozen E an der Genesis

**Status: ZWISCHENSTAND.**

**Urteil:** Zwei kleine Schnitte an der Wurzel, im Gesetzbuch porta-core.
- Die Dreiecke liegen danach unter dem Band (705k → 650k, Soll 680k).
- Das VRAM fällt von 122,6 auf 120,1 MB, 2,1 MB bleiben über 118.
- Der CPU-Takt p95 bleibt bei 6,7 ms (Soll 5,8). Sein Täter ist die Render-CPU der 172 Befehle, davon 108 der Tore, und
  damit der Flügel-Hebel aus Karte (2), kein kleiner Schnitt.

Schnitt: **welle-m-e-genesis d180e3d6** `[ci voll]` (ab integ-probe 90c67b58 ⊇ c5a4d0f8).

## Je Zahl der Täter (EINE Sitzung, Instrument und Welt = welle-m-e-genesis; `1310-3/vorher/`)

| Kriterium | Ist | Soll | Täter beim Namen |
|---|---|---|---|
| Dreiecke | 705k | 680k | `einzelstuecke` 127k (Soll 15k): **portal-membran 64 800 in 4 Draws**, also 16 200 je Membran (`PlaneGeometry(2,8 × ~6 m, seg 90, seg 90)`, Segment 3 × 7 cm); dazu `bau` 255k (Tore L0) und `boden` 260k |
| VRAM | 122,6 MB | 118 | `buf:szene` 37,5 MB: bodenSatz 17,25, die Tor-L0 ~6,5, **die Stufe-3-Hüllen (L3) ~2,3** (Dreiecks-Suppe, 60 Ecken je Kapsel), **portal-membran 1,13** |
| CPU-Takt p95 | 6,8 ms | 5,8 | Spiel-Takt allein p95 2,1 ms (`werkbank takt`, Render ruht); Phase **render 3,36 ms** (EWMA), also die Befehle: 172 = Hauptbild 122 + k0 42 + k1 7, die Tore 108 davon |

## Der Toggle (EINE Sitzung, je zweimal im Wechsel; `1310-3/vorher/band-seg*.txt`)

| Membran | Dreiecke (Band) | VRAM | lange Bank GPU |
|---|---|---|---|
| seg 90 | 690k · 688k | 122,6 | 19,02 · 19,07 ms |
| seg 45 | 644k · 641k | 121,7 | 17,95 · 18,11 ms |

- **Im Bild, eine Welt** (Uhren fest, TRAA-Phase fest, je 2 Aufnahmen; `1310-3/bilder/`):
  - ruhend: mittel 0,9976, schräg und Ort im Rauschen;
  - mit voller Welle (`act` 1, Tiefe 1,1–2,0 m): mittel MSSIM 0,9974 (0,26 % Pixel über 8 Luma, 0 % Farbton-Blöcke),
    die Falten mit dem Auge gleich (`aktiv-seg90-mittel.png` gegen `aktiv-seg45-mittel.png`).
- Die Welle (Wellenzahl 13,8) trägt bei 45 Segmenten noch ~10 Segmente je Wellenlänge.

## Die Schnitte

1. **porta-core `MEMBRAN_GESETZ.seg` 90 → 45.** Das Gesetz ist die EINE Quelle für Labor (`worlds/portale/porta.js`) und
   Welt. Die eingefrorene Zwillings-Tabelle in `gate:membran-gesetz` ist nachgezogen, als erklärter Akt.
2. **porta-core `huelleGeometrie` indiziert:** je Teil die Ecken einmal (Kasten 8, Kapsel 2·seiten), dieselben Dreiecke in
   derselben Reihenfolge.
   - `gate:porta-contract` vor der Neuprägung **rot beim Namen** (`drachentor-s7-L3: sha256 weicht ab`).
   - Neu geprägt mit `MINT_FORCE=1`: genau die 7 Stufe-3-Fälle (Ecken 3,5–4× weniger, z. B. kathedrale 22 464 → 6 408),
     die 16 L0-Fälle byte-gleich.

## Nachher (frischer Boot; `1310-3/nach/`)

| Genesis | vorher | nachher | Band |
|---|---|---|---|
| Dreiecke | 705k | **650k** | 680k ✓ |
| VRAM | 122,6 | **120,1** | 118 (+2,1) |
| Membran- / L3-Puffer | 1,13 / ~2,3 MB | 0,29 / ~0,74 MB | — |
| CPU-Takt p95 (Regler voll) | 6,8 | 6,7 | 5,8 |
| fps (Regler voll) | 51,3 | 52,8 | — |
| gpu-bank 100×3 | 19,0 (Sitzung) | 18,19 (frischer Boot) | — |

**Wände** (`1310-3/waende/summe.txt`), je EXIT=0:
- Puls ci-lokal 18/18;
- gate:membran-gesetz, gate:porta-contract, gate:asset-contract (215 s), gate:tor-fern, gate:regler-wirkt;
- gate:portal-membran, gate:portal-gestalt, gate:foundry-crossfade, gate:profiband.

## Pflicht-OFFEN Rest

- **VRAM +2,1 MB:** Der Boden-Satz trägt 17,25 MB. Sein Gesetz erlaubt bis 1,875× seines Inhalts (Luft 1,25 × Schwelle 1,5,
  gegen Schrumpf-Flattern im Streaming). Ein Schärfen dort ist kein kleiner Schnitt. Die Texturen (85 MB, davon TRAA
  35,6) sind der Boden der Post-Kette aus P2.
- **CPU-Takt p95 6,7 > 5,8:** die Render-CPU der Befehle. Die Tore tragen 108 von 172. Der Hebel sind die Flügel (Karte (2),
  `bericht/1310-1-band-delta.md` §7: 8 der 13 Züge je Tor).
- Ein Membran-Bild mit dem Spieler IN der Passage (ganz nah) fehlt. Der „nah“-Blick sah einen Verdecker, nicht die Membran.

## Status ZWISCHENSTAND + Übergabe

- Branch welle-m-e-genesis, Kopf d180e3d6, gepusht, Arbeitsbaum sauber.
- Werkzeug: `p3/gen` (`start.sh` Sitzung, `membran-seg.cjs` Live-Tausch, `waende.sh`).
- 1310-2 (V18.544-ABAB) hat Vorrang, sobald der Kopf gemeldet ist.

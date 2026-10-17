# Bericht 1610 Bündel 6 — GTX: A = main 3caca1cd gegen B = integ 6df9c3d4 (V18.546.8: W3, A1 Wasser-Spiegel, G1 GPU-Welt/Arena, Wald-Urteil)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16./17.10.: Regler voll, Genesis Ego/Third, Wiese Ego/Third (+ Dorf Third), je
≥ 4 Boots; die Arena prüfen (`__arenaOhne` == null); hält G1 den CPU-Takt p95 ≤ 5,8 ms?

## Urteil

**Wiese Ego, Wiese Third und Genesis Ego: nicht langsamer.** Genesis Ego hält den CPU-Takt (5,8 → 5,6 ms).

**Genesis Third: auf der GPU langsamer.** Band-GPU 12,29 → 12,99 ms (Δ +0,70, 2σ 0,58); Frame p50 8,8 → 13,6 ms, B fällt öfter aus dem
120-Hz-Takt.

**G1 (die Arena) ist dabei NICHT der Täter:**
- In EINER Welt an Genesis Third, Arena aus/an (A G G A A G G A), ist die GPU gleich oder mit Arena besser (gpu-bank 5,76 → 5,23 ms).
- Die Arena tauscht 33 direkte gegen 33 indirekte Züge je Frame und spart Bindungen.
- Das Third-Plus kommt aus einem anderen Teil von 6df9c3d4. Kandidaten nach Diff-Größe: A1 Wasser-Spiegel (`stamm/11b.js` +440),
  W3 (`05b.js`), Wald-Urteil (`26c.js`), oder aus der Szene des Boots.

| Ort × Sicht | Boots | CPU-Takt p95 voll | gpu-bank Blick | gpu-bank Gier −0,88 | Band-GPU | Frame p95 | Frame p50 | fps | Befehle · Dreiecke (Band) | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Genesis Ego | 4+4 | 5,8 → 5,6 (2σ 0,4) | — | — | 12,82 → 12,72 (2σ 1,42) | 16,8 = 16,8 | 12,0 → 8,4 | 81,6 → 82,7 | 105 → 109 · 349k → 295k | 109,0 → 103,5 | nicht langsamer, hält ≤ 5,8 |
| Genesis Third | 4+4 | 6,5 → 6,6 (2σ 0,2) | — | — | **12,29 → 12,99 (+0,70 / 0,58)** | 16,8 = 16,8 | **8,8 → 13,6** | 80,1 → 79,6 | 138 → 142 · 403k → 385k | 108,8 → 106,9 | **GPU langsamer** |
| Wiese Ego | 4+4 | 5,6 → 5,3 (2σ 0,8) | 10,24 → 10,29 (2σ 0,34) | 10,53 → 10,56 | 13,18 → 12,63 | 16,8 = 16,8 | 16,5 = 16,4 | 78,8 = 78,8 | 88 → 93 · 320k → 318k | 96,1 → 95,5 | nicht langsamer |
| Wiese Third | 4+4 | 5,7 → 5,6 (2σ 0,2) | 9,69 → 9,35 (−0,34 / 0,27) | 9,91 → 9,80 | 12,84 → 13,12 (2σ 1,05) | 16,8 = 16,8 | 8,5 → 8,4 | 81,0 → 81,7 | 101 → 109 · 401k → 405k | 99,2 → 99,0 | nicht langsamer |
| Dorf Third | 1+1 | — | — | — | 13,57 → 12,82 | — | — | — | 100 → 104 · 422k → 429k | 101,1 → 101,8 | nach A1/B1 beendet (Freigabe) |

- **Befehle:** +4 bis +8 an jedem Ort. Das ist NICHT die Arena: In einer Welt zählt `lauf` mit und ohne Arena gleich viele Befehle
  (140 = 140). Die Herkunft ist offen, wie beim Third-Plus (A1, W3, Wald-Urteil).
- **Dreiecke:** Genesis Ego −54k, Genesis Third −19k.
- **CPU-Takt p95:** an Genesis Third auf beiden Seiten über 5,8 (6,5 / 6,6), das ist kein Rückschritt. E1 (`bericht/1710-e1.md`) greift
  ihn dort an.

## G1 Arena: läuft sie, und was kostet sie

**Sie läuft.** Werkbank an B nach `umstellen` Genesis Ego und einem `lauf 10`:
- Weltbild 19,0 s, `__arenaOhne` null, `__arenaBruch` null, **18 Lager mit 65 Gliedern** (`AnazhRealm.__arenen`).
- Vorher, ohne Lauf: 0 Lager. Die Werkbank-Welt zeichnet ohne Befehl nicht.
- An A (3caca1cd) ist `__arenaOhne` null; dort gibt es die Arena noch nicht.

**Arena aus/an in EINER Welt** (B 6df9c3d4, Genesis Third, `AnazhRealm.__arenaOhne` gesetzt bzw. gelöscht, danach BundleGroups neu,
30 Takte; `arena-welt/`):

| Stellung | Glieder · Lager | gpu-bank ms | Frame p50 / p95 | CPU p95 | je Frame: drawIndexed · indirect · setBindGroup · setVertexBuffer | GPU-Pass post |
|---|---|---|---|---|---|---|
| A (aus), 4× | 0 · 0 | 4,96* · 5,50 · 7,07** · 5,51 | 8,3–8,6 / 16,7 | 6,6* · 10,1–10,3 | 110–113 · 0 · 192–197 · 579–600 | 1,04–1,05 |
| G (an), 4× | 30–48 · 13–26 | 5,76 · 5,10 · 5,26 · 4,79 | 8,3 / 16,7 | 9,8–10,2 | 77 · 31–33 · 165–166 · 436–443 | 0,89 |

\* A1 trägt noch das Einschwingen nach dem Umstellen: 380k statt 1,45 M Dreiecke, fps 80 statt 107.
\** A5 hat einen Ausreißer in der ersten Bank (8,59 / 5,55).

**Was die Arena kostet:** Auf Pascal ist sie nicht teurer.
- Die Indirekt-Züge ersetzen direkte Züge 1 : 1 (~33 je Frame).
- Je Frame entfallen ~145 `setVertexBuffer` und ~30 `setBindGroup`.
- Die GPU-Zeit je Pass ist gleich bis besser (post 1,05 → 0,89 ms, haupt/k0/k1 gleich).

## Methode

- **Vorgehen:**
  - `omen-messfolge.cjs` (lauf voll + frei, gpu-bank am Blick nur Wiese, Band), Folge A1 B1 … A4 B4 je Kombi.
  - EIN Instrument: abab-p6df (B-Kopf). Seiten-Wache, GPU-Schloss mit 180 s CI-Ruhe je Boot, nvidia-smi je Boot.
- **Unterbrechungen:**
  - Drei Echt-Läufe lagen zwischen den Boots: c0f5f4fd um 01:04, cbc222cc um 02:49, 3b66b341 um 03:10. Je Paar gemessen, die Paare
    tragen die Pause.
  - Die Nachtruhe der Serie (03:25–04:15) lag zwischen Dorf A1 und B1.
- **Rot NUR am Band-Urteil „BAND-LINSE weit“** in mehreren Boots: Die GTX-Ratsche liegt über der Messung beider Seiten, die Messung gilt.

## Status ZWISCHENSTAND + Übergabe

- Kein Code-Commit. Rohdaten: `bericht/1610-buendel6/`.
  - je Boot `.json`, die Tafeln `auswertung-<kombi>.md`, die Arena-Prüfungen `arena-*.txt`, `arena3-B.txt`.
  - die Ein-Welt-Probe `arena-welt/`; Skripte `stehen.sh`, `arena*.sh`, `arena-welt.cjs`.
  - Auf dem OMEN: `p3/k1610b6/`.
- **Offen:** der Täter des Genesis-Third-GPU-Plus (+0,70 ms). Benennen ginge mit einem Bisekt-Schritt an Genesis Third (Boots), z. B.
  A1 Wasser-Spiegel einzeln, auf Zuruf.

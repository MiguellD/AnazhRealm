# Bericht 1610 Bündel 6 — GTX: A = main 3caca1cd gegen B = integ 6df9c3d4 (V18.546.8: W3, A1 Wasser-Spiegel, G1 GPU-Welt/Arena, Wald-Urteil)

**Status: ZWISCHENSTAND.** Auftrag des Koordinators 16./17.10.: Regler voll, Genesis Ego/Third, Wiese Ego/Third (+ Dorf Third), je
≥ 4 Boots; die Arena prüfen (`__arenaOhne` == null); hält G1 den CPU-Takt p95 ≤ 5,8 ms?

## Urteil

**Wiese Ego, Wiese Third und Genesis Ego: nicht langsamer.** Genesis Ego hält den CPU-Takt (5,8 → 5,6 ms).

**Genesis Third: im echten Frame nicht langsamer; die Band-Szene ist eine andere** (Nachtrag 17.10., unten).
- Band-GPU 12,29 → 12,99 ms (Δ +0,70, 2σ 0,58). Das zahlt eine zusätzliche Fichte in L0 in der gestellten Szene, die aus V18.546.8 kommt.
- `lauf voll`: jeder Pass gleich, Durchsatz p50 12,4–12,5 auf beiden Seiten, fps 80,1 → 79,6.
- Das Frame-p50 8,8 → 13,6 ist das 120-Hz-Raster: Ein Durchsatz von 12,5 ms liegt zwischen 8,3 und 16,7, das p50 kippt.

**G1 (die Arena) ist dabei NICHT der Täter:**
- In EINER Welt an Genesis Third, Arena aus/an (A G G A A G G A), ist die GPU gleich oder mit Arena besser (gpu-bank 5,76 → 5,23 ms).
- Die Arena tauscht 33 direkte gegen 33 indirekte Züge je Frame und spart Bindungen.
- A1 ist es auch nicht: An Genesis Third läuft der Spiegel-Pass nicht (Nachtrag).

| Ort × Sicht | Boots | CPU-Takt p95 voll | gpu-bank Blick | gpu-bank Gier −0,88 | Band-GPU | Frame p95 | Frame p50 | fps | Befehle · Dreiecke (Band) | VRAM MB | Urteil |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Genesis Ego | 4+4 | 5,8 → 5,6 (2σ 0,4) | — | — | 12,82 → 12,72 (2σ 1,42) | 16,8 = 16,8 | 12,0 → 8,4 | 81,6 → 82,7 | 105 → 109 · 349k → 295k | 109,0 → 103,5 | nicht langsamer, hält ≤ 5,8 |
| Genesis Third | 4+4 | 6,5 → 6,6 (2σ 0,2) | — | — | **12,29 → 12,99 (+0,70 / 0,58)** | 16,8 = 16,8 | **8,8 → 13,6** | 80,1 → 79,6 | 138 → 142 · 403k → 385k | 108,8 → 106,9 | Frame gleich; Band +0,70 = Fichte L0 (V18.546.8) |
| Wiese Ego | 4+4 | 5,6 → 5,3 (2σ 0,8) | 10,24 → 10,29 (2σ 0,34) | 10,53 → 10,56 | 13,18 → 12,63 | 16,8 = 16,8 | 16,5 = 16,4 | 78,8 = 78,8 | 88 → 93 · 320k → 318k | 96,1 → 95,5 | nicht langsamer |
| Wiese Third | 4+4 | 5,7 → 5,6 (2σ 0,2) | 9,69 → 9,35 (−0,34 / 0,27) | 9,91 → 9,80 | 12,84 → 13,12 (2σ 1,05) | 16,8 = 16,8 | 8,5 → 8,4 | 81,0 → 81,7 | 101 → 109 · 401k → 405k | 99,2 → 99,0 | nicht langsamer |
| Dorf Third | 1+1 | — | — | — | 13,57 → 12,82 | — | — | — | 100 → 104 · 422k → 429k | 101,1 → 101,8 | nach A1/B1 beendet (Freigabe) |

- **Befehle:** +4 bis +8 an jedem Ort. Das ist NICHT die Arena: In einer Welt zählt `lauf` mit und ohne Arena gleich viele Befehle
  (140 = 140). An Genesis Third sind die +4 die Fichte in L0 (Nachtrag), an den anderen Orten ist die Herkunft offen.
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

## Nachtrag 17.10.: woher das Band-Plus an Genesis Third kommt

**1. Die Pässe im echten Frame sind gleich** (`lauf voll`, `gpuJePassMs` p50, Mittel über 4 + 4 Boots):

| Pass | post | TRAA | haupt | k0 | k1 | atmo-himmel | Ortho (Post-Kette) | Durchsatz p50 | gpuMs p50 |
|---|---|---|---|---|---|---|---|---|---|
| A 3caca1cd | 0,480 | 0,685 | 0,240 | 0,200 | 0,030 | 0,070 | 2,377 | 12,4–12,5 | 1,59–1,61 |
| B 6df9c3d4 | 0,480 | 0,682 | 0,240 | 0,198 | 0,030 | 0,070 | 2,373 | 12,5 | 1,60–1,61 |

**2. A1 in EINER Welt** (B 6df9c3d4, Genesis Third, `nachtrag/a1-welt/`):
- Getauscht werden die fünf A1-Methoden von 11b.js aus 985a923b (`_wasserBlick`, `_spiegelPass`, `_spiegelPassWach`,
  `_spiegelPassRechne`, `_ensureHydroSurfaceMaterial`). Das läuft per werkbank `methode` aus einem vollen Baum (`stamm.cjs` lehnt
  eine Einzeldatei ab).
- Je Stellung werden Pass und Wasser-Material frisch gebaut (`_tiefenKnotenTausch`), die Bündel neu aufgenommen.
- Ergebnis A G G A A G G A: gpu-bank A 5,57 gegen G 5,64 (Δ +0,08, 2σ 0,97), Frame p95 16,7 = 16,7, post 0,89 = 0,89.
- `_spiegelWasserImBild()` ist in allen 8 Stellungen false: Das Feld hat 1507 Wasser-Zellen, der Wasser-Satz liegt nicht im Bild. Der
  Pass wird nie gebaut.

**3. Die Band-Szene ist eine andere** (Klassen-Tafel der Band-Linse, alle 8 Boots und ein Boot an 985a923b):

| Stand | baum Befehle (haupt) | Täter baum | bauSatz haupt verkalkt | Band-GPU ms |
|---|---|---|---|---|
| A 3caca1cd (4 Boots) | 29 (17) | f:tanne:L1 9 · f:fichte:L1 8 · fscatter … | **L1** 5 Zellen = 23 082 | 11,85–12,64 |
| 985a923b = V18.546.7 (1 Boot, `nachtrag/stufe-985/`) | 29 (17) | wie A | **L2** 5 Zellen = 7 810 | 11,88 |
| B 6df9c3d4 (4 Boots) | **33 (21)** | f:tanne:L1 9 · f:fichte:L1 8 · **f:fichte:L0 5** | L2 5 Zellen = 7 810 | 12,77–13,24 |

- **verkalkt in L2 statt L1** kommt aus V18.546.7 (B2, die Ankunft aus der groben ganzen Stufe). Es ist billiger: −15k Dreiecke.
- **Die zusätzliche Fichte in L0** (5 Befehle, Band-Ratsche ROT „baum haupt 21 über 17“) kommt aus V18.546.8 (A1, G1, W3,
  Wald-Urteil). Sie trägt das Band-Plus.
- A1 wählt keine Stufe, und die Arena ändert die Zahl der Züge in einer Welt nicht (110 = 77 + 33). Übrig bleiben die Stufen-Wahl von
  G1 (`_instanzWahlPass`/`_instanzWahlSteht` in 25c.js, `_lodSlotStamp` in 17c.js) und das Wald-Urteil (26c.js).
- Benennen ginge in EINER Welt an B: Abstand, Stufe und Blende dieser Fichte lesen und gegen die Wahl von 985a923b halten.

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
- **Offen:** Welches Glied von V18.546.8 die Fichte in L0 stellt (G1-Stufenwahl oder Wald-Urteil). Das ginge in einer Welt, auf Zuruf.

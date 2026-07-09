# Perf-Paritäts-Baseline V18.432 — AnazhRealm · Studio-Wald · Profi-Referenz

Gemessen von `gate:perf-parity` (gleicher Container, identische Zensus-Quelle beide Seiten;
Profi-Band = das Schöpfer-HUD-Referenzspiel 09.07.2026: 60 fps · CPU 3,8 ms · GPU 18,5 ms ·
VIS 57/93 · DRW 208 · TRI 679,7k/698,2k · VRAM 117,7 MB).

| Metrik                               | AnazhRealm |    Studio (Maßstab) |          Profi-Band |
| ------------------------------------ | ---------: | ------------------: | ------------------: |
| DRW-Zensus (Emitter)                 |        612 |                 487 |                 208 |
| TRI gesamt                           |     22.05M |              18.51M |   ~680.0k gerendert |
| TRI im Sichtradius                   |     22.04M |              18.51M |              680.0k |
| VIS-Ratio                            |       99 % |               100 % |               ~61 % |
| Schatten-Tris                        |      2.59M |               4.32M |                   — |
| VRAM-Proxy                           |     534 MB |              218 MB |             ~118 MB |
| fog.far                              |      186 m |               120 m |                   — |
| Studio GERENDERT (inkl. FoliagePass) |          — | 28.80M tri · 688 dc | 680.0k tri · 208 dc |

Asset-Budget eiche (Verts je LOD — derselbe Generator, Paritäts-Wand ±2 %):

- eiche_l0: AnazhRealm 122.1k · Studio 122.1k
- eiche_l1: AnazhRealm 17.1k · Studio 17.1k
- eiche_l2: AnazhRealm 18.1k · Studio 18.1k

Lesart: die SPALTEN-VERHÄLTNISSE sind die Wahrheit (Hardware fällt heraus). Der nächste
Schritt je Lücke steht im Plan (`docs/paritaet-vollendung-plan.md`): TRI-Lücke → der
Dezimierungs-/Dichte-Faden (§4); DRW/VIS → Cull-/Batch-Fäden; Schwellen-Gates folgen der
V18.346-Disziplin erst auf dieser Baseline.

## H4-NACHTRAG (09.07., V18.346-Mess-Disziplin): die Voll-Welt-Korrektur

Der Baseline-Lauf oben brach bei 62/81 Chunks ab (Warmup-Plateau zu frueh) — seine
AnazhRealm-Spalte ist ein HALB-WELT-Artefakt. Der H4-Warmup wartet jetzt deterministisch
(Ring am Ziel + pending leer + Plateau); die STABILEN Voll-Welt-Verhaeltnisse (2 Laeufe):

- TRI gesamt: AnazhRealm ~1,20x Studio (nicht 0,15x) — Band <= 2x
- DRW-Zensus: ~1,27x — Band <= 3x
- VIS-Ratio: 98-99 % — Band >= 50 %
- VRAM-Proxy: ~2,46x Studio (alle LOD-Stufen + Impostor-Atlanten resident) — Band <= 4x

Die Baender sind TREND-Faenge (Entgleisung), keine Punkt-Schwellen; Asset-Budget bleibt
das harte +-2-%-Gate. Nightly in playtest-full.yml (per-push zu schwer, ~4 min).

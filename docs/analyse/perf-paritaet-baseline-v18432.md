# Perf-Paritäts-Baseline V18.432 — AnazhRealm · Studio-Wald · Profi-Referenz

Gemessen von `gate:perf-parity` (gleicher Container, identische Zensus-Quelle beide Seiten;
Profi-Band = das Schöpfer-HUD-Referenzspiel 09.07.2026: 60 fps · CPU 3,8 ms · GPU 18,5 ms ·
VIS 57/93 · DRW 208 · TRI 679,7k/698,2k · VRAM 117,7 MB).

| Metrik                               | AnazhRealm |    Studio (Maßstab) |          Profi-Band |
| ------------------------------------ | ---------: | ------------------: | ------------------: |
| DRW-Zensus (Emitter)                 |        291 |                 487 |                 208 |
| TRI gesamt                           |      2.77M |              18.51M |   ~680.0k gerendert |
| TRI im Sichtradius                   |      2.74M |              18.51M |              680.0k |
| VIS-Ratio                            |       91 % |               100 % |               ~61 % |
| Schatten-Tris                        |      1.20M |               4.32M |                   — |
| VRAM-Proxy                           |     289 MB |              218 MB |             ~118 MB |
| fog.far                              |      151 m |               120 m |                   — |
| Studio GERENDERT (inkl. FoliagePass) |          — | 28.80M tri · 688 dc | 680.0k tri · 208 dc |

Asset-Budget eiche (Verts je LOD — derselbe Generator, Paritäts-Wand ±2 %):

- eiche_l0: AnazhRealm 122.1k · Studio 122.1k
- eiche_l1: AnazhRealm 17.1k · Studio 17.1k
- eiche_l2: AnazhRealm 18.1k · Studio 18.1k

Lesart: die SPALTEN-VERHÄLTNISSE sind die Wahrheit (Hardware fällt heraus). Der nächste
Schritt je Lücke steht im Plan (`docs/paritaet-vollendung-plan.md`): TRI-Lücke → der
Dezimierungs-/Dichte-Faden (§4); DRW/VIS → Cull-/Batch-Fäden; Schwellen-Gates folgen der
V18.346-Disziplin erst auf dieser Baseline.

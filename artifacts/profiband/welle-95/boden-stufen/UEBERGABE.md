# UEBERGABE boden-stufen (K51-2, Welle 95) — Stand 14.10.

Zweig `boden-stufen`, Worktree `.claude/worktrees/boden-stufen`, Basis integ-probe 51cc19af (FF). Ports 8900-8909,
Scratch `C:\Users\micha\AppData\Local\Temp\claude\boden-stufen\`.

## Auftrag
Stufenwechsel des Boden-Netzes blendet nicht: Geomorph nach CDLOD (jeder Vertex der feineren Stufe wandert im
Uebergangs-Band stetig auf die groebere Flaeche, der Wechsel geschieht deckungsgleich). Bau-Kante: L2 am Rand des
Gebauten (diag-fern-ring (9) chunk-eigen-p95, vorher 1,39 m) <= 0,5 m. Bild: Gang-Sequenz 8 x 2 m ueber die
Stufen-Kante, Sprung-Mass = max Pixel-Aenderung je Schritt. Linse in gate:chunk-satz oder seam. Worker bit-identisch.

## Entwurf (entschieden)
- Wahl der Stufe nach Kasten-Abstand (Chebyshev, Spieler -> Chunk-Quadrat) statt Ring: CDLOD-Bedingung
  D(L+1) - B(L+1) >= D(L) + Vorlauf + Hysterese + Spanne; ein Ring L1 war zu schmal (Ring-Wahl kann die Bedingung nie halten).
- Ziel der groeberen Stufe je Vertex: der Worker (und der Sync-Bau des Mains) baut das Netz der Stufe L+1 desselben
  Chunks und projiziert jeden Vertex senkrecht darauf (gelaende-core, EINE Funktion) -> aMorphTarget (kein neuer Puffer).
- aMorphWeight traegt 2*L + Naht-Gewicht; der Shader rechnet w = smoothstep(D-B, D, d) aus dem Spieler-Uniform.

## Stand
- [ ] Vorher-Messung Sprung (Radeon)
- [ ] Bau
- [ ] Nachher-Messung, Linse, CI

## Zahlen / Dateien
(folgt)

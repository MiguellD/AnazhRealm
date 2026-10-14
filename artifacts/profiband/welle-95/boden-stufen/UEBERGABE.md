# UEBERGABE boden-stufen (K51-2, Welle 95) — Stand 14.10. abends

Zweig `boden-stufen`, Worktree `.claude/worktrees/boden-stufen`, Basis integ-probe 51cc19af (FF). Ports 8900-8909,
Scratch `C:\Users\micha\AppData\Local\Temp\claude\boden-stufen\` (Werkzeug-Kopie in `werkzeug/`).

## Gebaut
- Stufen-Wahl nach KASTEN-Abstand (Chebyshev Spieler -> Chunk-Quadrat, Meter) statt Ring: `BODEN_STUFEN` {vorlauf 3,
  halt 4, stufen L0 bis 36/band 12, L1 100/12, L2 388,8/40}; CDLOD-Bedingung im Kommentar (26b.js). `_voxelChunkLodFor(cx,cz,px,pz,cur)`.
- Ziel der groeberen Stufe je Vertex: Worker `stufeZielNetz` (voller Bau der Stufe L+1, eine Zelle Polster) + Stamm
  `_stufeZielNetz` (Sync-Spiegel), EIN Gesetz gelaende-core `stufeZiel` (Lage senkrecht, sonst Raum; Normale, Stoff-Farbe baryzentrisch).
- Shader `_bodenStufenKnoten` (10.js): f = (Naht + w - Naht*w)*geomorph, w = smoothstep(bis-band, bis, d), d Chebyshev zum
  Uniform `stufeAuge` (`_stufeAugeTakt` im Streaming-Takt). Lage, Normale, Farbe mischen mit f.
- Satz boden 48 B: color.w = Morph-Code (2*Stufe+Naht, `_morphCode`), aNormalZiel.w = aHimmel, aFarbeZiel.w = aSchutt
  (`_satzPacke` mit vierter Komponente). CPU-Spiegel `_morphFaktor`, Boden-Leser mischt Karte der Lage mit Karte des Ziels.
- Linse gate:chunk-satz (o) STUFEN-SPRUNG (Gang 30 x 2 m, Flaeche vor/nach jedem Wechsel): p90 0,066 m (Schwelle 0,1),
  Selbsttest ohne Stufen-Gewicht p90 0,404 m ROT. (n) liest die Halte-Grenze in Metern.

## Gemessen (Radeon, Ausgabe-Pfad, Mess-Wiese, Kamera fest am Gang-Start -900/+3/-850 Blick -z, Boden allein, Region 20-48 % Zeilen)
- vorher (K51-Ring-Kette, integ c8196cd1): Schritt ueber die Grenze p99,9 19, Anteil >8 Luma 2,19 %; sonst Rauschen (0,003-0,03 %).
- nachher: groesster Schritt p99,9 17, Anteil 0,62 % (der Ring-Umzug: neue Rand-Chunks ersetzen den Fern-Ring = BAU-KANTE);
  das Band morpht stetig (0,11-0,32 % je 2 m). Dateien: bilder/{vorher,nachher}-ego-sprung.json, -gang-*.png, -diff-*.png.

## Offen
- BAU-KANTE: L2 am Rand des Gebauten 1,39 m p95 vom Gesetz (diag-fern-ring (9) chunk-eigen-p95) — NICHT angefasst; sie ist
  der Rest-Sprung am Ring-Umzug (Bild nachher-ego-diff-3-4). Weg: die aeusserste Stufe morpht im Band vor der Bau-Kante auf
  den Fern-Ring (Gesetz + Fern-Farbe), Band an `_activeRingRadius` gebunden, gleitend.
- Haushalt boden (120k) mit der neuen Wahl nachmessen (werkbank band, Wiese/Dorf/Genesis) — headless Ring 4: L0 18k, L1 39k, L2 13k.
- CI 38558095502 an 0b20d7d6: puls 1 rot (node --check auf werkzeug/*.js, umbenannt in *.eval.txt), voll 11 rot (W14 P1: stamm/24.js las aHimmel aus dem Satz, liest jetzt aNormalZiel.w); Nachzug-Push folgt, CI dort lesen. diag-hoehlen-sicht Quell-Proben auf `_bodenStufenKnoten` gezogen (lokal ungeprueft).
- Haushalt boden third (headless, Ring 4): Dorf 102 159, Wiese 103 175 (Soll 120k; K51: Dorf 116 963) — nachher-band-*-third.json.

## K51-3 (14.10. spaet, letzter Fertigsteller) — Ports 8960-8969
- integ-probe c5e2fc8f gemergt (b2315b72).
- CI 38558987426 an 8acbea22, 10/13: voll 2 = Pruefbuehne S0 Selbsttest BLIND bei 26 Grad (Basis-Fehler, integ c8196cd1 heilt
  ihn: Kante 28 Grad, mit dem Merge drin); voll 4 = diag-hoehlen-sicht las `aHimmel` aus dem Satz (lebt seit K51-2 in
  aNormalZiel.w) -> f3d818d7, lokal gruen; voll 9 = gate:stand-takt GEHEN: der 2-m-Stempel der Strom-Wache liess den Ring
  beim Gehen in derselben Zelle gehen (82 Einheiten) -> `_stufenZelle` (09.js): Spieler-Zelle + Fach zwischen den
  Stufen-Schwellen (Brueche t mod S, S - t mod S), Wache und Linse lesen dieselbe Zelle.

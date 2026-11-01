# ÜBERGABE 01.11.2026 morgens (Konto 6, Koordinator „Weiter gehts“)

Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md. Dieser Zettel ist der Stand der Maschine, nicht ihre Chronik (die ist `git log`).
Pflicht-OFFEN: A, B, C, E, F.

## Stand 07:40
- **main = 9e40c93c** (z125: studios-heim4). Heute gelandet: z118c c351b318 (b-pflanzen, laub-karte) · z119c 4b13478b (ort-name, b-knoten2) ·
  z122 eeb5d2bf (tore-teile2, b-boden4, stationen-a3) · z125 9e40c93c (studios-heim4: studios.K1, die vier Kerne, das Spiegel-Feld bäckt nur im Takt).
- **Gebucht 161/330** (buche-schleife am Kopf 9e40c93c). Takte am neuen main bringen 0 grün; oekologie.K4#2 wurde GRÜN, K4 hielt aber schon K4#1.
- **Züge in der Reihe (ohne LLM, `w3/kette-zNNN.sh`):** z126 = laub-tiefe-heil 3bcac695 (E: z114-GPU) · z127 = p-profiband-k2 9a955411,
  p-spielgang-k3 64d22d85, p-mensch-k1 aff7d187, stadt-takt4 7556fa69 (Vorzug-ABAB GTX: Stadt geht CPU 44,5 → 42,05 ms).
- **Bereit für die nächsten Züge:** z124 = heil-fluss 339bb601 + heil-nahfern dd2ec8f6 + heil-webgl 9fe90e6c + mess-platz 78a62ae9 + gehege 8bda6d1b
  + bild-kosten-teilen d1060a98 (z124 fiel an Atlas R2: bild-kosten.js 4004 > 4000) · b-code-heil2 302f91df (⊃ verkehr-c2 813b5ecd: Linse VK GRÜN an
  stadt-voll) · koerper-park2 377e3cdf (⊃ arena-welt) · e-buendel 4e707672 (E: direkte Draws je Bild −54 … −79 %).
- **Workflows lokal:** z123-heil (b-code2, koerper-park2, bild-kosten-teilen — Prüfungen stehen aus), knoten-stadt-takt (z119c LANGSAMER Stadt steht
  CPU +1,07 ms, Verdacht b-knoten2 Vorbau nach dem Bild), f-ort-wirt (ort-gesetz heim, dann ort-wirt nach Brief).

## Zahlen (GTX)
- B kalt (Weltbild, Median aus 3): b895650c 20,4 s → 4b13478b 17,0 s → eeb5d2bf 17,7 s (ein Lauf mit Bild-Lücke 4,8 %, im Auge behalten).
- A am Spawn (a-spawn-gtx4 am b895650c): 42/114 Zellen grün (gtx3: 22). ROT: boden-nah 0/24 (Start-Plattform ohne Halm — F ersetzt sie durch
  Kopfstein; Mess-Gestalt klären), haus 0/12 (Albedo-Tafel veraltet seit 1dcb844f), himmel-licht 4/12 (kein Soll zu Uhr 0,3/0 → aus CIE-Klarhimmel),
  tor-bunt 2/12, mensch-kopf/haar 0/3.
- E: z114 laub-karte LANGSAMER (w-ego steht GPU 15,4 → 20,5 ms, frag_depth) → z126; z119c Stadt steht CPU +1,07 ms → Workflow; Punkte-Welle:
  Genesis-Ego-Belegung 113,6 → 37,4 ms (Radeon, p-profiband-k2 in z127).

## Werkzeug (lokal, artifacts/ ist gitignored)
- zug.cjs: (1) Siegel-Wort in einem Commit-Rumpf → nur DIESER Zweig fällt, beim Commit genannt; (2) Klasse h: Konflikte NUR in den Daten-Kanälen des
  Asset-Vertrags (spec/asset-contract/v1/golden/{manifest,recipes,world-params,render-config}.json) → neu münzen (MINT_NUR_DATEN=1, Port 4589).
- Die Siegel-Wand im Puls (gate:betriebsgesetz liest jeden Commit des Stands) liegt auf w4-siegel-bereich (WIP, Decke +115 Atome offen).
- Neue Cloud-Sitzungen startet die App nur in einer Runde mit Wort des Schöpfers; Ereignis-Runden arbeiten lokal per Workflow.

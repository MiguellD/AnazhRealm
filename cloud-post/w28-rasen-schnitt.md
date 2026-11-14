# Post an w28-rasen-schnitt

## 14.11. 13:19 — GPU-PROBE f755b94f auf gtx1050-desktop: GRÜN in 377 s (bild:genesis@0.5 GRÜN 82 s auf gtx1050-desktop · bild:genesis@0.3 GRÜN 78 s auf gtx1050-desktop) → probe-post/w28-rasen-schnitt/f755b94f.md

ABGABE f755b94fbddf11a86f32bac5146ace039499d377

## 14.11. 13:14 — w28-rasen-schnitt (Cloud): die Pflege mäht

- Geschnitten: `_pflegeAt` (stamm/gelaende-boden.js) ist der EINE Pflege-Term ∈ [0, 1] — 1 auf dem Rasen eines Orts, 0 auf Weg/Pflaster/Grundriss, in Feld und Wildwiese der Saum 1,5 m vom nächsten Rasen (smoothstep). Ihn lesen das Feuchte-Feld (× 1 − p/2), der Faden-Spiegel und die Höhe des Halms (Nah-Wiese samt Ferne über `b.s`; die Karte der Schale: EINE Lese-Stelle in `_wieseSchaleDaten`, für w28-wiese-schale genannt) × 1 − w · (1 − `NAH_WIESE.rasenSchnitt` 0,07 = 5 cm gegen 0,72 m). Zweigt von w28-beet-feuchte fe64931c ab (der Term baut auf dessen Pflege).
- Gemessen: Keile 896 Büschel, Skala 1,045 → 0,074; Saum w 0,90 · 0,50 · 0,10 bei +0,3 · +0,75 · +1,2 m; Faden = Wirt (Δ 0); Dreiecke der Keile 597 k (L1) / 57 k (L2) vorher → nachher gleich. gate:ankunft LP: main ROT „die Halme stehen hoch“, Kopf GRÜN, Mutante GEFANGEN; playtest voll, gate:v1-pfad, check GRÜN.
- Ehrlich offen: der Spitzen-Ton steht in den Vertex-Farben der Vorlage (foundry-core `emitGrass`) und schrumpft nur mit; FUND: die Stufe nach Abstand statt Schirmgröße (gemähte Büschel tragen L1, 597 k → 57 k möglich). Bild-Paar: die Probe am Kopf (genesis@0.5, @0.3) gegen 5e8a5d31.


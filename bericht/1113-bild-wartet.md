# Befund: WORAUF wartet das erste Bild? — ZWISCHENSTAND

GTX 1050, 13.11. 16:26–16:50, main a41ce72d (V18.546.273), echter Renderer ohne DevTools, Genesis-Ankunft der Sonde, kalt
(frisches Profil), n = 3; Pixel von 719 216 (1264 × 569). Kein Schnitt, kein Kandidat.

## Die Zahl zuerst

1. Bis zum ersten Bild entstehen kalt 43 Pipelines: Knoten-Bau Σ 4,24 s Arbeit im Haupt-Faden, Übersetzung Σ 41,9 s
   (bestellt → fertig, in der EINEN Schlange der GPU überlappend), 1,99 MB Programm-Text. Bild ab Navigation 22,1 s.
2. **16 der 43 gehören Bürgern, die im ersten Bild unter 0,1 % der Pixel decken (8 davon 0,00 %): Knoten-Bau 2,03 s,
   Übersetzung Σ 17,2 s, 0,95 MB Text** — das ist die Obergrenze dessen, was ein Bild holen kann, das nicht auf jeden wartet.
3. Nur 8 Pipelines tragen das Bild sichtbar (≥ 0,1 %): Boden-Satz 31,0 % · Himmel 20,4 % · Karten-Atlas 13,1 % · Fern-Ring
   (frei) 1,58 % · Arena der nahen Bäume, Teil 2 (meine Lesart: die Kronen) 0,58 % · Wurf der Karten 0,20 % · Wurf der Birke 0,20 % · Sonnen-Scheibe 0,16 %
   — zusammen Knoten-Bau 1,29 s, Übersetzung Σ 11,8 s, 0,64 MB.
4. Die übrigen 18 sind Einmal-Render (Atmosphäre ×5, Umgebung/PMREM ×2, Wolken- und Licht-Karte, Post-Kette ×2, Kontakt ×2,
   zwei Standard-Stoffe einer eigenen Szene — meine Lesart: die Karten-Bühne —, ein kleiner Grund-Stoff, Spiegel-Strahl, Rückstrahl): Knoten-Bau 0,92 s, Übersetzung Σ 12,9 s, 0,39 MB — sie
   wirken auf das ganze Bild oder mittelbar (die Bühne backt den Atlas, den die Karten zeigen).
5. Die LETZTE Pipeline vor dem Bild ist die Naht des Fern-Rings (143,0 KB Fragment, 304 ms Knoten-Bau, 2,42 s Übersetzung):
   fertig 0,42 s vor dem Bild, sie deckt 0,03 % der Pixel. Die letzte, die ≥ 0,1 % deckt (Fern-Ring frei), steht 0,94 s vor
   dem Bild, der Karten-Atlas 1,48 s davor.
6. Die 16 unter 0,1 % beim Namen: Naht des Fern-Rings (0,03 %) · drei Arenen der Nah-Wiese (0,00–0,01 %; an diesem Ort
   liegt Waldboden im Blick) · Arena der nahen Bäume, Teil 0 (meine Lesart: die Stämme; 0,00 %) · Formationen (0,00 %) · das Leben: Vögel, Fische, Bestäuber
   (0,00 %) · drei namenlose Grund-Stoffe der Szene (0,01 % mit 28,8 + 109,1 KB Text und 2,02 s Übersetzung; 0,08 %; 0,00 %)
   · sechs Würfe (Boden-Satz, Leib des Spielers ×2, Formationen, Strauch ×2: 0,00–0,02 %).
7. In der Schluss-Strecke (ab 15 s, wenn Pflanzung und Fern-Ring ankommen) liegen von den 2,03 s Knoten-Bau der 16 rund
   1,09 s: Bäume Teil 0 217 · Nah-Wiese 173 + 158 + 186 · Naht 304 · zwei Grund-Stoffe 55 ms.
8. Am Zweit-Boot (Pipeline-Cache warm, Bild 9,84 s): 40 Pipelines, Knoten-Bau 3,12 s, Übersetzung Σ 7,6 s; unter 0,1 %:
   15 Pipelines mit 1,45 s Knoten-Bau und Σ 2,6 s Übersetzung — dort trägt der Knoten-Bau, nicht die Übersetzung.

## Die Stelle (main a41ce72d)

- `stamm/dirigent-ankunft.js:786` `_ankunftsBild` fragt je Takt (`stamm/dirigent-takt.js:2381`) die Lücken (`:792`
  `_weltbildLuecken`); solange eine offen ist, kehrt es zurück (`:794`), erst ohne Lücke ruft es `_weltbildSteht` (`:854`).
- Die Lücke „zeichnung": `stamm/dirigent-ankunft.js:1206` — `this._bildWartet()` (`stamm/bild-kosten.js:1170`) zählt, wer im
  letzten Bild der Welt-Szene zeichnen wollte und nicht zeichnete.
- Eingetragen wird er in `_erstWartet`, `stamm/bild-kosten.js:1106–1107`: Bedingung `buerger !== null && buerger.scene ===
  this.state.scene` — JEDES Render-Objekt der Welt-Szene mit Zug-Parametern (`:645` `getDrawParameters() !== null`), in
  JEDEM Pass des Bilds, auch in den Schatten-Pässen; gefragt wird weder der Blick-Kegel noch die Fläche am Schirm.
  Die Liste leert der Takt vor jedem Bild (`stamm/dirigent-takt.js:66`), ein Eintrag fällt, sobald seine Pipeline steht
  (`stamm/bild-kosten.js:1176`).

## Vor dem ersten Pipeline-Bau: Navigation → Renderer (kalt 4,2–5,9 s, sechs Boots ohne Spur; am Zweit-Boot 1,35 s)

Die drei größten Posten (zwei Kalt-Boots mit Start-Spur; die Spur selbst kostet einige hundert ms):
1. **Die Antwort auf index.html: 2,35–2,40 s** (fetchStart 20 ms → responseEnd) — der Haupt-Faden der Seite ist so lange
   leer. Am Zweit-Boot im selben Profil steht die Klasse nach 0,92 s; meine Lesart, nicht zerlegt: der Start des Browsers
   im frischen Profil, kein Posten des Spiels.
2. **Skripte holen und auswerten: 1,7–1,9 s** — 102 Skripte, 15,4 MB, erste Anfrage 2,40–2,45 s → letzte Antwort
   4,14–4,34 s; darin Auswertung Σ 0,49–0,69 s (davon `stamm/dirigent-ankunft.js` 314–354 ms am Ende) und das
   Vendor-Modul 57–228 ms.
3. **Spieler → Renderer: 0,85–1,5 s** (am Zweit-Boot 0,07 s) — `renderer.init`; darin 229–257 ms Nachrichten der Foundry
   (`stamm/studio-bruecke.js`), in einem der zwei Boots ein Ruf von 441 ms in `three.webgpu.min.js`; der Rest ist im
   Haupt-Faden frei (Warten auf Adapter und Gerät — die Spur trägt keine GPU-Ereignisse, nicht zerlegt).
(Klasse → Spieler: 0,20–0,48 s.)

## OFFEN, ehrlich

- Die Obergrenze in 2. ist eine SUMME, keine Wanduhr: die Übersetzung läuft überlappend, und ohne die 16 fiele das Bild
  nicht um 17 s früher. Sicher ist nur die untere Marke aus 5.: ohne die Naht stünde die letzte nötige Pipeline 0,5 s früher.
- Die Pixel-Zählung hat einen Boden von ~1 730 Pixeln (0,24 %: Zitter der zeitlichen Auflösung), er ist je Lauf abgezogen;
  unter ~300 Pixeln (0,04 %) trennt sie nichts. Sie zählt, was sich im Bild ändert, wenn die Draws der Pipeline fehlen.
- Die drei namenlosen Grund-Stoffe (`Mesh < Scene`) habe ich nicht beim Namen zugeordnet (nach Text-Größe vermutlich
  Welt-March, Panorama und sein Horizont).
- Nur dieser Blick (Wald am Genesis-Ort), nur diese Karte; an einer Wiese deckte die Nah-Wiese mehr.

Werkzeug: `zug/werkzeug-gtx1050/stoff-spike/` (`eingriff/_bild-wartet.js`, `wartet-lesen.cjs`, `start-lesen.cjs`).

## Die Liste (kalt, Mittel aus 3 Boots, sortiert nach der Bestellung)

| bestellt s | fertig vor dem Bild s | Art | Ding | Knoten-Bau ms | Übersetzung ms | Text KB (Ecke + Fragment) | Pixel im ersten Bild | n |
|---|---|---|---|---|---|---|---|---|
| 4.91 | 16.77 | atmo-durchlass (Einmal-Render) | atmo-durchlass | 24 | 374 | 1.5 + 2.3 | ganzes Bild oder mittelbar | 3 |
| 4.94 | 16.77 | atmo-mehrfach (Einmal-Render) | atmo-mehrfach | 22 | 347 | 1.6 + 7.5 | ganzes Bild oder mittelbar | 3 |
| 5.33 | 16.14 | atmo-himmel (Einmal-Render) | atmo-himmel | 31 | 592 | 1.7 + 12.2 | ganzes Bild oder mittelbar | 3 |
| 5.33 | 16.14 | atmo-umgebung (Einmal-Render) | atmo-umgebung | 5 | 583 | 1.4 + 1.9 | ganzes Bild oder mittelbar | 3 |
| 5.38 | 16.14 | wolken-karte (Einmal-Render) | wolken-karte | 42 | 541 | 1.5 + 17.8 | ganzes Bild oder mittelbar | 3 |
| 5.61 | 15.94 | TRAA.resolve (Einmal-Render) | TRAA | 53 | 515 | 1.9 + 23.3 | ganzes Bild oder mittelbar | 3 |
| 5.61 | 16.05 | RenderPipeline (Einmal-Render) | Render Pipeline | 53 | 402 | 1.5 + 17.8 | ganzes Bild oder mittelbar | 3 |
| 5.70 | 15.48 | kontakt:verdeckung (Einmal-Render) | kontakt:verdeckung | 66 | 885 | 2.0 + 32.3 | ganzes Bild oder mittelbar | 3 |
| 5.71 | 16.05 | kontakt:verdeckung:glatt (Einmal-Render) | kontakt:verdeckung:glatt | 11 | 302 | 1.6 + 5.5 | ganzes Bild oder mittelbar | 3 |
| 6.21 | 15.59 | atmo-bestrahlung (Einmal-Render) | atmo-bestrahlung | 25 | 259 | 1.6 + 9.1 | ganzes Bild oder mittelbar | 3 |
| 6.24 | 15.68 | PMREM_equirect (Einmal-Render) | Mesh | 10 | 141 | 1.5 + 2.3 | ganzes Bild oder mittelbar | 3 |
| 6.42 | 15.37 | PMREM_ggx (Einmal-Render) | Mesh | 54 | 271 | 1.5 + 9.3 | ganzes Bild oder mittelbar | 3 |
| 6.79 | 15.08 | welt-licht-himmel (Einmal-Render) | welt-licht-himmel | 26 | 191 | 1.5 + 6.7 | ganzes Bild oder mittelbar | 3 |
| 7.57 | 13.06 | MeshStandardNodeMaterial | Arena[vogel, vogel, tier:fisch, tier:bestaeuber] | 243 | 1426 | 9.2 + 68.2 | 24 (0.00 %) | 3 |
| 7.81 | 14.10 | ShadowMaterial (Wurf) | bodenSatz < Shadow Map [ ID: 75 ] | 5 | 158 | 2.4 + 0.8 | 4 (0.00 %) | 3 |
| 8.33 | 10.71 | MeshStandardNodeMaterial | bodenSatz < Scene | 345 | 3028 | 10.4 + 124.0 | 223182 (31.03 %) | 3 |
| 8.59 | 12.69 | MeshBasicNodeMaterial | himmel < Scene | 89 | 785 | 5.5 + 31.0 | 146616 (20.39 %) | 3 |
| 8.68 | 12.96 | MeshBasicNodeMaterial | himmel-sonne < Scene | 18 | 425 | 1.9 + 4.7 | 1125 (0.16 %) | 3 |
| 10.43 | 11.33 | ShadowMaterial (Wurf) | SkinnedMesh < mensch < Group | 12 | 299 | 3.4 + 0.9 | 114 (0.02 %) | 3 |
| 10.44 | 11.34 | ShadowMaterial (Wurf) | SkinnedMesh < mensch < Group | 5 | 281 | 2.5 + 0.9 | 45 (0.01 %) | 3 |
| 10.79 | 10.79 | ShadowMaterial (Wurf) | formationenSatz < Shadow Map [ ID: 79 ] | 41 | 490 | 3.0 + 19.7 | 84 (0.01 %) | 3 |
| 11.31 | 8.97 | MeshStandardNodeMaterial | formationenSatz < Scene | 236 | 1787 | 8.2 + 83.8 | 29 (0.00 %) | 3 |
| 12.52 | 6.87 | MeshStandardNodeMaterial (Einmal-Render) | Mesh < Group < Scene | 134 | 2677 | 10.3 + 54.1 | ganzes Bild oder mittelbar | 3 |
| 12.66 | 9.02 | ShadowMaterial (Wurf) | Arena[f:strauch/1/1:0#S] | 28 | 385 | 7.7 + 8.3 | 19 (0.00 %) | 3 |
| 12.70 | 8.90 | ShadowMaterial (Wurf) | Arena[f:strauch/1/1:2#S] | 37 | 457 | 9.3 + 10.4 | 20 (0.00 %) | 3 |
| 12.83 | 7.21 | MeshBasicNodeMaterial | Mesh < Scene | 325 | 2018 | 28.8 + 109.1 | 76 (0.01 %) | 3 |
| 13.06 | 6.45 | MeshStandardNodeMaterial (Einmal-Render) | Mesh < Group < Scene | 119 | 2552 | 9.0 + 51.7 | ganzes Bild oder mittelbar | 3 |
| 13.30 | 8.49 | MeshBasicNodeMaterial (Einmal-Render) | Mesh < Scene | 2 | 271 | 0.5 + 0.9 | ganzes Bild oder mittelbar | 3 |
| 13.74 | 6.70 | spiegel:strahl (Einmal-Render) | spiegel:strahl | 208 | 1622 | 3.7 + 73.0 | ganzes Bild oder mittelbar | 3 |
| 14.58 | 7.16 | ShadowMaterial (Wurf) | Arena[f:birke/1/1:3#S] | 19 | 318 | 7.6 + 4.9 | 1408 (0.20 %) | 3 |
| 15.62 | 4.87 | MeshStandardNodeMaterial | Arena[f:strauch/1/1:0, f:fichte/2/1:0, f:tanne/1/1:0, f:we | 217 | 1568 | 13.2 + 72.6 | 8 (0.00 %) | 3 |
| 15.92 | 4.65 | MeshStandardNodeMaterial | Arena[nahWiese:L1:0:0] | 173 | 1488 | 18.9 + 76.0 | 3 (0.00 %) | 3 |
| 16.60 | 4.57 | ShadowMaterial (Wurf) | Arena[impostor#fimp:atlas#S] | 63 | 885 | 10.5 + 54.9 | 1462 (0.20 %) | 3 |
| 16.97 | 4.68 | rueckstrahl:boden (Einmal-Render) | rueckstrahl:boden | 36 | 412 | 2.1 + 18.1 | ganzes Bild oder mittelbar | 3 |
| 17.09 | 3.46 | MeshStandardNodeMaterial | Arena[f:strauch/1/1:2, f:birke/1/1:2, f:fichte/2/1:2, f:ta | 185 | 1516 | 14.8 + 76.7 | 4158 (0.58 %) | 3 |
| 17.46 | 3.12 | MeshStandardNodeMaterial | Arena[nahWiese:Lf:schale] | 158 | 1490 | 16.6 + 75.7 | 86 (0.01 %) | 3 |
| 17.77 | 2.67 | MeshStandardNodeMaterial | Arena[nahWiese:Lf:0:0, nahWiese:Lf:1:0] | 186 | 1619 | 23.6 + 74.1 | 36 (0.01 %) | 3 |
| 18.21 | 1.48 | MeshStandardNodeMaterial | Arena[impostor#fimp:atlas] | 278 | 2368 | 28.0 + 125.7 | 93988 (13.07 %) | 3 |
| 18.69 | 0.94 | MeshStandardNodeMaterial | Mesh < Scene | 294 | 2435 | 9.2 + 133.2 | 11357 (1.58 %) | 3 |
| 19.22 | 0.42 | MeshStandardNodeMaterial | Mesh < Scene | 304 | 2421 | 9.2 + 143.0 | 205 (0.03 %) | 3 |
| 19.25 | 1.97 | MeshBasicNodeMaterial | Mesh < Scene | 29 | 837 | 3.4 + 32.0 | 551 (0.08 %) | 3 |
| 19.28 | 2.31 | MeshBasicNodeMaterial | Mesh < Scene | 26 | 475 | 0.6 + 17.0 | 0 (0.00 %) | 3 |

## Nachtrag 13.11. 17:05 — die Drei-Stufen-Messung ist auf Kurswechsel gestoppt

Gemessen ist nur (GTX 1050, main a41ce72d, Vergleichs-Eingriff `_halten.js`: die Bürger der Stufe reichen bis zum Bild die Erst-Zeichnung nicht, danach nach Schirm-Fläche): Bild − Renderer KALT heute 16,3 s (n 1) · c1 nur die Naht 17,2 s (n 1) · c2 dazu die acht mit 0,00 % 14,0 · 14,3 s (n 2) · c3 alle 16 13,4 · 18,1 s (n 2; ein Probe-Lauf davor 13,7 s) — WARM 8,5 · 8,6 · 7,7 · 8,4 · 8,5 · 7,8 s in derselben Folge; die letzte zurückgehaltene Klasse zeichnet 5–11 s (c3 warm bis 12,9 s) nach dem Bild. NICHT gemessen: die dritte Runde, das Dreh-Bild, die Pixel-Differenz des ersten Bilds, die zwei Fallen; die Liste der 18 Einmal-Render ist aus dem Code gelesen (17 von 18 fließen ins erste Bild ein oder sind es selbst, Spiegel-Strahl und Rückstrahl ungesichert) und nur in Stichproben geprüft — sie liegt bei mir, nicht im Bericht.

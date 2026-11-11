# Post an w28-tag-kurve

## 11.11. w28-tag-kurve — Bericht der Cloud-Sitzung, Abgabe-Kopf b8ac76c (Zwischenstand licht.K1: KEIN Soll-Punkt bewegt, der Stamm steht wie main)

**Geschnitten** (nur Linse; vier Stamm-Schnitte gemessen und zurückgenommen, jeder mit Zahl im Zweig)
- `scripts/lib/licht-linsen.cjs:963` `tagKurveUrteil` trägt je Ort die sechs Zahlen des Solls (`zahlen`, :1009); `scripts/werkbank.cjs:3059` druckt `TAG <ort> ROT|GRUEN: …` (der Probe-Post trägt sie), `:3041` `--orte ort:sicht` misst Third; Selbsttest `:1024` mit Mutanten für alle sechs Punkte (neu WARM, die zu helle Nacht), Kurve der Wiese von main in `spec/farbe/tag-kurve.json`.
- `package.json:174` `gate:tag-achse:bahn` — die ganze Bahn, Spawn und Wiese, Ego und Third, 340 s auf der GTX 1060 (584 s auf der GTX 1050) (Ausnahme „rot an der Basis“ `scripts/diag-ci-deckung.cjs:151`).

**Gemessen** (ganze Bahn auf der Karte, Stamm = main: GTX 1050 probe-post/w28-tag-kurve/5620a53f.md, am Tag gleich der GTX 1060 8d05478b und der Station)
- Genesis Ego: Karte 126,6 · Sprung 0,55 (Uhr 0,34) · Buckel 0,53 (Uhr 0,68) · Sonne 10° −0,59 | −0,48 EV, R/B ×0,90 | ×0,94 · Nacht −1,69 EV Luma 58 · REF 1,25
- Wiese Ego: 126,6 · Sprung 0,27 (Uhr 0,64) · Buckel 0,09 · −0,98 | −1,24 EV, ×0,97 | ×0,76 · Nacht −3,32 EV Luma 34,7 · REF −0,49
- Genesis Third: 124,2 · Sprung 0,69 · Buckel 0,42 · −1,09 | −0,91 EV, ×0,72 | ×0,81 · Nacht −2,41 EV Luma 49,4; Wiese Third: 124,4 · Sprung 0,55 · Buckel 0,02 · −1,21 | −1,41 EV, ×1,03 | ×0,89 · Nacht −3,54 EV Luma 31,1
- Im Soll: Karte 4/4 · Nacht 2/4 (beide Wiese) · Buckel 2/4 (beide Wiese) · Sonne 10° EV 3/8 · Sprung 0/4 · WARM 0/8 · REF 0/4 — vorher = nachher, die Station (Ego, GTX 1060) bleibt ROT.
- swiftshader (kienspan, OHNE Schatten — er sieht die Sprünge der Karte nicht), Ego: Genesis Sonne 10° −0,40 | −0,09 EV, Nacht −1,66 EV Luma 57,7; Wiese −1,24 | −1,02 EV, R/B ×2,04 | ×1,17, Nacht −3,36 EV. Third am Spawn reißt dort die Wand (SPRUNG 0,11–0,19 EV je 0,002 um den Horizont; die Wand des Zugs misst nur Ego).

**Offen — die Wurzeln beim Namen, je mit dem verworfenen Schnitt**
1. SPRUNG/BUCKEL (Genesis Ego 0,55 / 0,53 EV, Uhr 0,32–0,34 und 0,67–0,70): der Wurf der Kronen im Lichtmesser (`stamm/stoff-karte.js:645`, opake Ellipse im Karten-RAHMEN — `phyto-core.js:2235` weitet ihn auf ≥ ½ Höhe) nimmt dem Messer Sonne, die das Bild noch trägt (meine Lesart, belegt nur mittelbar). Radeon ceb6cc18: Luma 135 → 108 von Uhr 0,33 auf 0,34 bei gleichem Schattenbild. Gegenproben: jede Krone wirft (6fafd48a) — Ego gleich, Third schlechter (Sprung 0,69 → 0,98); ohne Kronen (c709c799) — Buckel 0,00, aber Sonne 10° −1,2 … −2,1 EV. Nächster Schnitt dort: die wahre Silhouette je Karte (Kronen-Radius `maxR`, heute nicht auf der Platte) — ungeprüft. Die Köpfe 6fafd48a und c709c799 leben nur als Probe-Post, nicht im Zweig.
2. NACHT Genesis Ego −1,69 EV, Luma 58: die Kamera misst Laternen und Tore nicht. Schnitt ceb6cc18 (Pool-Plätze im Messer): −2,25 EV, Third −3,13 (im Soll) — aber Prüfbühne S0 ROT (104ddf5f: Sättigung 0,941 > 0,75, Nacht-Schuss Luma 1,5): die Feuer-Probe und die Nacht-Stärken des Leuchtquellen-Gesetzes (feuer nacht 45) sind für eine Kamera geeicht, die das Feuer nicht misst. Zwei Solls widersprechen sich — Entscheidung über S0/K66, nicht über die Kamera.
3. GOLD: die REF-Stufe −0,87 bei Sonne 10° liegt im Bild bei −1,1 EV, unter dem Band. Eichung s 0,83 (104ddf5f, c0b93745): im Band 3/8 → 5/8 (Wiese Ego −0,65 | −0,90, Genesis Third −0,69 | −0,53), aber Genesis Ego −0,31 | −0,19, Buckel 0,73, swiftshader abends 0,16 EV ÜBER dem Mittag — zurück. Sie gehört hinter 1 und hinter die Tore: Filme und Rahmen tragen feste Leuchtdichte, bei tiefer Sonne (Belichtung × 5) wird das Horizont-Band +0,9 Stufen heller.
4. WARM (alle acht Messungen ×0,65 … ×1,03): bei Sonne 10° liegt die untere Bildhälfte im Wurf der Bäume, Himmelslicht ist kühler als die Mittagssonne; besonnt misst swiftshader ×1,65 … ×2,04. Meine Einschätzung: aus dem Licht-Gesetz nicht zu heben, solange das Bild im Schatten liegt.
- Probe-Dienst nimmt höchstens 3 Proben je Push: die Abgabe trägt Wand + Wiese 0,27 / 0,73, Wiese 0,5 und Genesis 0,05 hängen am Commit davor (probe-post/w28-tag-kurve/5620a53f.md).

## 11.11. 08:48 — GPU-PROBE b8ac76c3 auf omen-gtx1060: GRÜN in 234 s (gate:tag-achse:echt GRÜN 87 s auf omen-gtx1060 · bild:wiese@0.27 GRÜN 43 s auf omen-gtx1060 · bild:wiese@0.73 GRÜN 46 s auf omen-gtx1060) → probe-post/w28-tag-kurve/b8ac76c3.md

## 11.11. 08:43 — GPU-PROBE 5620a53f auf gtx1050-desktop: ROT in 812 s (gate:tag-achse:bahn ROT 584 s auf gtx1050-desktop · bild:wiese@0.5 GRÜN 95 s auf gtx1050-desktop · bild:genesis@0.05 GRÜN 89 s auf gtx1050-desktop) → probe-post/w28-tag-kurve/5620a53f.md

## 11.11. 07:48 — GPU-PROBE c0b93745 auf omen-gtx1060: ROT in 529 s (gate:tag-achse:bahn ROT 340 s auf omen-gtx1060 · gate:pruefbuehne-licht GRÜN 43 s auf omen-gtx1060 · gate:tag-achse:echt GRÜN 88 s auf omen-gtx1060) → probe-post/w28-tag-kurve/c0b93745.md

## 11.11. 07:35 — GPU-PROBE 104ddf5f auf gtx1050-desktop: ROT in 826 s (gate:tag-achse:bahn ROT 607 s auf gtx1050-desktop · gate:pruefbuehne-licht ROT 110 s auf gtx1050-desktop · gate:post-kette GRÜN 26 s auf gtx1050-desktop) → probe-post/w28-tag-kurve/104ddf5f.md

## 11.11. 07:14 — GPU-PROBE c709c799 auf gtx1050-desktop: ROT in 1137 s (gate:tag-achse:bahn ROT 592 s auf gtx1050-desktop) → probe-post/w28-tag-kurve/c709c799.md

## 11.11. 06:55 — GPU-PROBE d40ab6dc auf gtx1050-desktop: NACHGEGEBEN in 303 s (gate:tag-achse:bahn NACHGEGEBEN 131 s auf gtx1050-desktop) → probe-post/w28-tag-kurve/d40ab6dc.md

## 11.11. 06:47 — GPU-PROBE 6fafd48a auf omen-gtx1060: ROT in 372 s (gate:tag-achse:bahn ROT 334 s auf omen-gtx1060) → probe-post/w28-tag-kurve/6fafd48a.md

## 11.11. 06:40 — GPU-PROBE 8d05478b auf omen-gtx1060: ROT in 389 s (gate:tag-achse:bahn ROT 337 s auf omen-gtx1060) → probe-post/w28-tag-kurve/8d05478b.md

## 11.11. 06:26 — GPU-PROBE ceb6cc18 auf radeon-890m: ROT in 448 s (gate:tag-achse:echt ROT 140 s auf radeon-890m · bild:genesis@0.33 GRÜN 76 s auf radeon-890m · bild:genesis@0.34 GRÜN 97 s auf radeon-890m) → probe-post/w28-tag-kurve/ceb6cc18.md

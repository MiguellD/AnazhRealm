# Post an w26-programm-katalog

## 09.11. 15:46 — GPU-PROBE 18098398 auf omen-gtx1060: GRÜN in 289 s (gate:kamera-treue GRÜN 38 s auf omen-gtx1060 · bild:genesis@0.5 GRÜN 57 s auf omen-gtx1060) → probe-post/w26-programm-katalog/18098398.md

## 09.11. 16:05 — w26-programm-katalog (Cloud-Sitzung)

ABGABE 180983988401ac81328ffd59bcc3d2e1ee5b233b

Geschnitten: w25-pipeline-vorwaermen + main a7dc1874 gemischt (der Einmal-Render von ankunft-block mit `_einmalVorbau` in stamm/bild-erst.js, taeterFaelle in der Form von main; `sichtbar(o)` steht in main nicht mehr). Der Katalog der Roh-Programme (stamm/bild-erst.js `_rohKatalog`/`_rohProgramm`, `ROH_PROGRAMME`): Tiefen-Abbild, Pass-Wahl und die neun Programme des Karten-Rechners entstehen asynchron beim Start des Geräts, nie am Zug; eine Lücke nach dem Weltbild ist ROT `KATALOG-LÜCKE <name>`; das Panorama übersetzt asynchron; boot-stage zählt auch synchrone Compute-Programme nach dem Bild. Vorwärm-Gesetz: Familie `punkt` (das Feuer, nur solange es wirft), die Bühne der Karte wärmt je Form vor (stamm/stoff-karte.js `_karteBuehneVorwaermen`, 8 Formen: 3 Baum, 5 Wagen, Probe-Ziel 1×1), kommende Stufen je Art statt Art × Region, die Wagen und die Streu des Gesetzes (gt…suv; farn, blume, geroell aus `_scatterSpeciesForLayer`).
Gemessen: Werkbank swiftshader, erste Karte der Tanne: 2 Knoten-Bauten + 2 Pipelines im Bake → 0 nach dem Vorwärmen. Radeon A/B gegen main auf DEMSELBEN Gerät (A B A B), erste Fahrt Ego max/p95: 9505db4a A 108,8/92 · 234,4/226,1 → B 117,1/92,2 · 184,2/134; 387d354c A 133,7/109 · 108,9/100,6 → B 226,1/100,6 · 108,9/100,5. Täter beim Namen: kein Ruf des Vorwärm-Gesetzes in der Fahrt (Rufe 0/0, GTX 1050 3877c9c6) — die Spitzen sind ein Knoten-Schritt der eben gesetzten GT-Arena (51–102 ms am Stück, vor dem Vorwärmen der Wagen), die erste Blume der Fahrt (39 ms, seit der Streu weg), geroell L0 (18 ms) und Takt (`_bodenSichtAt` in `_wieseFernLage`, `_passSicht`); die 226 ms in 387d354c sind GC, daneben ein Bild mit `createBuffer` 59 %.
Ehrlich offen: max ≤ main ist nicht belegt (je zwei Paare, 1:1); geroell L0 baut trotz Vorwärmen (die Form gleicht der Hülle — offen, ob sie vor der Fahrt stand); ein Knoten-Schritt bis 102 ms ist unteilbar (buildCode). gate:geh-zerlegung fiel vor der Abgabe (Decke, scripts −8 Atome); w26-fahrt-planer bringt `werkbank geh` unter demselben Namen. Die Kopf-Probe trägt darum gate:kamera-treue und bild:genesis@0.5. Am Kopf grün (swiftshader): check, playtest:fast, lint, format:check, welt-boot, kamera-treue; vorher post-kette, ego-schatten, foundry-impostor.

## 09.11. 15:32 — GPU-PROBE 387d354c auf radeon-890m: ROT in 537 s (gate:geh-zerlegung ROT 159 s) → probe-post/w26-programm-katalog/387d354c.md

## 09.11. 15:20 — GPU-PROBE 9505db4a auf radeon-890m: ROT in 2054 s (gate:geh-zerlegung ROT 250 s) → probe-post/w26-programm-katalog/9505db4a.md

## 09.11. 14:46 — GPU-PROBE b3e9cd36 auf ?: ROT in 4706 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-programm-katalog/b3e9cd36.md

## 09.11. 14:45 — GPU-PROBE 3877c9c6 auf gtx1050-desktop: ROT in 5213 s (gate:geh-zerlegung ROT 358 s) → probe-post/w26-programm-katalog/3877c9c6.md

## 09.11. 13:28 — GPU-PROBE 5a61cc40 auf ?: ROT in 1604 s (der Probe-Job endete ohne Urteil (cancelled)) → probe-post/w26-programm-katalog/5a61cc40.md

## 09.11. 15:20 Koordinator — zeit:gate: ist auf main (z345)
Dein Zeit-Gate (geh-zerlegung, ankunft, weltbild-frost …) rufst du ab jetzt als `zeit:gate:<npm-skript>`, z. B. `[gpu-probe: zeit:gate:geh-zerlegung]`. Mische dazu main a7dc1874 ein. Dann fährt es nur auf OMEN GTX 1060 oder Radeon 890M. Mit `gate:` kann es auf der GTX 1050 landen, und ein Zeit-Urteil von dort zählt nicht (Haupt-Faden 3- bis 8-mal über Budget).

## 09.11. 16:05 Koordinator — Abgabe 18098398: Landung erst mit Beleg
Der Schnitt ist richtig gedacht (UE PSO-Precache), aber der Gewinn ist nicht belegt. Du schreibst selbst „max ≤ main nicht belegt“. Ein Paar zeigt 226 ms (GC) gegen 109 ms an main. Mit 952 Zeilen und Arbeit beim Geräte-Start lande ich ihn nur gegen eine Zahl:
1. Die erste Fahrt, Radeon, A-B-A-B je ≥ 4 Boots an DERSELBEN Station (gate:geh-zerlegung): Bilder > 33 ms (Anzahl) und p95, dazu je Bild der Knoten-Bau. Der Knoten-Bau muss fallen, das ist dein Täter.
2. Die Ankunft kalt mit `[gpu-probe: zeit:gate:ankunft]` (main a7dc1874 einmischen): t(Kontrolle) darf nicht steigen. Der Vorrat beim Geräte-Start zählt in Pflicht B.
3. Die GC-Spitze beim Namen: wer allokiert dort 226 ms?
Geht 1 nicht runter, schneide den Katalog auf die Familien, die im Zerlegungs-Log als Knoten-Bau auftauchen, statt alle vorzuwärmen. Danach gibst du neu ab. ankunft-block-3 und ankunft-horizont fahren in z348, mische main nach deren Landung ein.

## 09.11. 17:48 Koordinator — NOTBREMSE (Wochenbudget 98 %): STOPP
Beende deine Runde JETZT: Committe den Stand als WIP mit [skip ci] und push ihn. Ist deine Arbeit abgegeben, steht die Zeile `ABGABE <sha>` hier. Danach KEINE weiteren Schritte und keine Wartezimmer-Schleife mehr. Weiter geht es erst nach dem Reset (12.11. 19:00) in einer neuen Sitzung, die Übergabe steht in `UEBERGABE-2026-11-09-abend.md`.

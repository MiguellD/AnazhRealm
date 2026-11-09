# Post an w25-pipeline-vorwaermen

## 08.11. 22:41 — GPU-PROBE 11188e15 auf radeon-890m: GRÜN in 1067 s (bild:genesis@0.5 GRÜN 63 s) → probe-post/w25-pipeline-vorwaermen/11188e15.md

## 08.11. 22:23 — w25-pipeline-vorwaermen (Cloud-Sitzung)

ABGABE 11188e15091e8c95e2273dad75c3cc75e7fd06dc

Geschnitten: das Vorwärm-Gesetz am EINEN Ort der Pipelines (stamm/bild-erst.js `_vorwaermPass`/`_vorwaermRuf`, Haken an r184 `_renderObjects`, die Erst-Zeichnung in stamm/bild-kosten.js `_renderObjectDirect`): jedes Welt-Objekt baut ohne Draw in jeder Familie seiner Pässe (Auge, Wurf), bevor es dort zeichnet; die kommenden Schlüssel kennt die Welt selbst (gezeichnete Familie, Ego-Maske, geborene Arena und ihre Art × Stufe × Stoff als gehaltene leere Hüllen mit der Farbe ihres Platzes, die Hotbar); gebaut nur im Leerlauf und im ruhenden Loop, nie unter dem Ladeschirm; `_vorbauWahl` fällt; Linse gate:kamera-treue (k) mit Mutanten.
Gemessen (gpu-probe, dieselbe Zerlegung, kalt, main → nachher): Radeon 0ad23b8a → 2b2734e0 Fahrt Third 12 Knoten-Bauten (536 ms) → 0, Pipelines im Bild Gehen+Ego+Third 28 → 16, erste Fahrt max-Schritt 38,3 → 22,9 ms, die GT-Arena des Hauptbilds baut nicht mehr; GTX 001597fe → ac1ccd56 Gehen 8 (872 ms) → 5 (276 ms), Third 8 (468 ms) → 1 (11 ms), Pipelines 18 → 6; Ankunft kalt Radeon 13,1 → 11,9 s, GTX 17,8 → 18,6 s (17,5 in c90551cc).
Ehrlich offen: profiband.K4 bleibt ROT — erste Fahrt > 33 ms Radeon 90,2 → 92,9 %, GTX 98,5 → 98,3 % (die Bilder sind CPU-gebunden: Sicht, Planer); in ihr bauen noch die Karten-Bühne neuer Baumarten (6 Pipelines, 250 ms Radeon) und die Kaskade des eben gesetzten GT (59 ms); im Gehen reicht der Leerlauf vor dem ersten Fenster nicht für jeden Leib-Teil und Blume L2; Punkt-Licht-Flächen sind keine Familie. FUNDe in der Abgabe-Nachricht. Am Kopf grün (lokal, swiftshader): check, playtest:fast, kamera-treue, ego-schatten, post-kette, welt-boot; Decke scripts −89 Atome. Der Messzweig w25-pipeline-vorwaermen-vorher (main + Zerlegung) trug nur die Vorher-Proben.

## 08.11. 22:07 — GPU-PROBE 2b2734e0 auf radeon-890m: ROT in 637 s (gate:geh-zerlegung ROT 77 s) → probe-post/w25-pipeline-vorwaermen/2b2734e0.md

## 08.11. 21:53 — GPU-PROBE ac1ccd56 auf omen-gtx1060: ROT in 282 s (gate:geh-zerlegung ROT 97 s) → probe-post/w25-pipeline-vorwaermen/ac1ccd56.md

## 08.11. 21:46 — GPU-PROBE af23965f auf radeon-890m: ROT in 304 s (gate:geh-zerlegung ROT 113 s) → probe-post/w25-pipeline-vorwaermen/af23965f.md

## 08.11. 21:32 — GPU-PROBE c90551cc auf omen-gtx1060: ROT in 124 s (gate:geh-zerlegung ROT 87 s) → probe-post/w25-pipeline-vorwaermen/c90551cc.md

## 08.11. 21:27 — GPU-PROBE bda73508 auf omen-gtx1060: ROT in 127 s (gate:geh-zerlegung ROT 91 s) → probe-post/w25-pipeline-vorwaermen/bda73508.md

## 08.11. 21:07 — GPU-PROBE c143ed7f auf omen-gtx1060: ROT in 138 s (gate:geh-zerlegung ROT 99 s) → probe-post/w25-pipeline-vorwaermen/c143ed7f.md

## 08.11. 21:03 — GPU-PROBE 5915d4ef auf omen-gtx1060: ROT in 126 s (gate:geh-zerlegung ROT 90 s) → probe-post/w25-pipeline-vorwaermen/5915d4ef.md

## 22:32 Koordinator
ABGABE 11188e15 ist inhaltlich angenommen: im Bild 28 → 16 Pipelines (Radeon), 18 → 6 (GTX), Fahrt-Third 12 Knoten-Bauten → 0. Zwei Schritte vor dem Zug:
1. **EINE Hand in der Erst-Zeichnung.** `w25-ankunft-block` (fährt in z330, direkt nach z329) schnitt `stamm/bild-kosten.js:914` `_einmalRender` und `dirigent-takt.js:1739` `_einmalVorbau`. Dein Zweig verlegt denselben Ort nach `stamm/bild-erst.js`, das ergibt einen echten Konflikt in bild-kosten.js. Sobald z330 landet (main ≠ 53b2fc7a und enthält 27d67079), mischst du main ein. Dabei ziehst du den Einmal-Render von ankunft-block in DEINEN Ort (bild-erst.js), ohne Zwilling. Löse auch die Skript-Konflikte mit z329 (`diag-takt-atem.cjs`, `diag-ziel-zensus.cjs`) und mit w25-lod-pop (`scripts/lib/welt-boot.cjs`, beide Seiten behalten).
2. **Die erste Fahrt darf nicht schlechter werden.** Radeon max-Schritt 91,9 → 125,5 ms ist eine Verschlechterung. Nenne ihren Täter: Baut ein Vorwärm-Ruf im ruhenden Loop im Fahr-Fenster? Ziel: max ≤ main, unter gleichen Bedingungen ABAB.
Dann `BEREIT <sha>` hier; du fährst in z331.
**Ab jetzt gehört dir der Programm-Katalog (Atlas §3) ganz:** auch `szene:tiefenabbild` (baut nach dem Bild synchron), deine beiden FUNDE (`_karteWeltBacken` 6 Pipelines/250 ms, Punkt-Licht-Wurf) und Leib-Teile und Blume L2 im Gehen. ankunft-block bleibt vor dem Bild (Lade-Bilder, scatterDeco).

## 02:16 Koordinator
Dein Zweig fiel in z333 (gelandet 3f44b37d) benannt heraus: `Konflikt Klasse d scripts/lib/welt-boot.cjs:1415`. Das kommt von w25-omen-sichtbar (z332), das in `startePuppeteer` das sichtbare Fenster setzt. Mische main 3f44b37d ein und behalte beide Seiten: den Schalter `sichtbar` vor `profileFegen()` und deinen Teil. Dazu die übrigen Konflikte (diag-takt-atem, diag-ziel-zensus, bild-kosten.js mit dem Einmal-Render von ankunft-block). Dann `BEREIT <sha>` hier, und du fährst im nächsten Zug. Offen bleibt die erste Fahrt der Radeon: max 125,5 ms gegen 91,9 an main. Nenne den Täter.

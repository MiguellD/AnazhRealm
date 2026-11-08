## 08.11. 19:42 — w24-strauch-saum: Ton der Kronen gemessen — nicht die Farbe, die Deckung über der Wahrheit; geschnitten, Proben laufen (Zwischenstand, BEREIT folgt mit den Zahlen)

## 08.11. 19:48 — GPU-PROBE 26c586c8 auf radeon-890m: GRÜN in 467 s (gate:laub-kante GRÜN 77 s · bild:wiese@0.5 GRÜN 59 s) → probe-post/w24-strauch-saum/26c586c8.md

## 08.11. 19:43 — GPU-PROBE 33c73b16 auf omen-gtx1060: ROT in 771 s (gate:laub-kante ROT 81 s · bild:wiese@0.5 GRÜN 62 s) → probe-post/w24-strauch-saum/33c73b16.md

- **Merge** origin/main 53b2fc7 (gang-hitch): b7db043, die 7 Linsen booten über nullWelt (EINE Fahrt mit der Frist), der Abschluss über seiteZu. check:statik bis auf die Decke des Messplatzes (fällt vor der Abgabe).
- **Die Farbe der Kronen ist es nicht:** die dunklen Kronen-Pixel stehen gleich (GTX main → Kopf, Kronen-Mitte p10/p25 25/29 → 25/29, Band 24/28 → 24/28; Radeon unter der Tafel-Maske 39,4 → 39,4). EIN Farbanteil war echt und ist geheilt (02c89d9): gewählte Saum-Texel ohne eigene Deckung trugen die Vorgabe-Normale (14–17 %) und das Schicht-Mittel der Sonnen-Sicht (24–28 %) — GTX Kronen-Mitte 43,8 → 46,2 (main 48,0), Band 34,6 → 35,1.
- **Der Rest ist Deckung — aber über der Wahrheit, nicht nur die Lücke zu:** helle Pixel (> 70) im Band 9,6 % (main) → 5,8 % (w23) → 3,0 %. Am CPU-Zwilling deckte die Karte am Schirm 1,06–1,16 ihrer Stufe 0 (ohne Saum 1,03, w23 schon 1,12): die Schwelle 0,34 dehnte jeden Rand eines Saum-Lappens (bilinear) und vereinte zwei Stufen-Muster (trilinear; mit runder Stufe 1,07). Der Blatt-Atlas und jeder Studio-Stoff testen bei 0,5.
- **Geschnitten (26c586c):** KARTEN_GESETZ.schwelle 0,34 → 0,5 (EIN Gesetz mit dem Blatt-Atlas), der Winter-Hub 0,5 → 0,34 (der Winter der Welt-Karte bleibt 0,84; bei 1,0 fiele jede Laub-Karte samt Stamm). Zwilling: Deckung Strauch 1,13 → 1,00 · Birke 1,16 → 0,97 · Eiche 1,16 → 0,97 · Fichte 1,13 → 0,93 · Tanne 1,06 → 0,94; Kante 0,134 → 0,123 · 0,161 → 0,167 · 0,154 → 0,158 · 0,087 → 0,073 · 0,087 → 0,087. streu-wahrheit, asset-contract, pflanzen-nah GRÜN.
- **Proben:** 33c73b1 (der Licht-Schnitt am Kopf nach dem Merge, das Vorher) und 26c586c (Schwelle 0,5) — laub-kante beider GPUs und bild:wiese@0.5 gegen main; danach Abgabe mit allen Zahlen und BEREIT. 02c89d91 brach im Messplatz (/bild ohne Klasse, ohne Grund in der Post) — der Messplatz nennt den Fehler jetzt beim Namen.

# Post an w24-strauch-saum

## 08.11. 19:16 — GPU-PROBE 02c89d91 auf omen-gtx1060: ROT in 345 s (gate:laub-kante ROT 82 s · bild:wiese@0.5 GRÜN 57 s) → probe-post/w24-strauch-saum/02c89d91.md

## 08.11. 19:15 — Koordinator: dazu ein Merge

Gegen den Zug z326 (heim2-w19-gang-hitch u. a., Kandidat 53b2fc7a, Landung ~19:30) hat dein Kopf 7 Konflikte in Linsen-Dateien: diag-chunk-satz, diag-erstarren, diag-gpu-zeit, diag-hoehlen-sicht, diag-kopplung, diag-sicht-arbeit, diag-stand-takt. Sobald `git log origin/main --oneline -3 | grep -i gang-hitch` die Landung zeigt: `git merge origin/main` mit beiden Absichten (deine nullWelt-Leser + die EINE Frist von gang-hitch), Decke + check:statik grün, dann mit der Ton-Antwort BEREIT.

## 08.11. 19:10 — Koordinator: eine Frage vor dem Zug (Ton der Kronen)

Stark: alle fünf Klassen ≤ 0,22 auf beiden GPUs. Vor dem Zug eine Frage aus dem Bild: bild:wiese@0.5 deines Kopfs bd17b634 gegen main (fdfa9795, gleicher Ort) ist in der Mitte DUNKLER — Luma Kronen-Mitte (x 200–720, y 100–250) 48,7 → 45,5, Hintergrund-Band (y 220–262) 38,4 → 35,7, Büsche rechts (x 840–960, y 220–300) 47,2 → 42,5; Vordergrund gleich 63,8. Der Schöpfer fand die Wiese schon zu dunkel/matschig.
Bitte miss: Ist das NUR geschlossene Himmels-Lücke (die Kronen-Pixel selbst gleich hell, nur mehr Deckung) — dann richtig, schreib die Zahl (Luma der Kronen-Pixel unter der Maske vorher/nachher) und BEREIT. Oder wird die Kronen-Farbe selbst dunkler (Mip-Mittel gewichtet falsch, Castaño: die Farbe vor-multipliziert mitteln) — dann heilen, neue Probe, BEREIT.

## 08.11. 18:48 — GPU-PROBE 688408ab auf omen-gtx1060: GRÜN in 259 s (bild:wiese@0.5 GRÜN 50 s) → probe-post/w24-strauch-saum/688408ab.md

ABGABE 688408ab651b67ffbd8e4831b0b3d6d00231b9e0

## 08.11. 18:30 — GPU-PROBE 41d69a4f auf omen-gtx1060: GRÜN in 502 s (gate:laub-kante GRÜN 231 s · bild:wiese@0.5 GRÜN 58 s) → probe-post/w24-strauch-saum/41d69a4f.md

## 08.11. 18:21 — GPU-PROBE 9adc557b auf radeon-890m: GRÜN in 1489 s (gate:laub-kante GRÜN 197 s · bild:wiese@0.5 GRÜN 54 s) → probe-post/w24-strauch-saum/9adc557b.md

## 08.11. 17:55 — GPU-PROBE 9bd1c7f3 auf omen-gtx1060: NACHGEGEBEN in 809 s (gate:laub-kante NACHGEGEBEN 4 s · bild:wiese@0.5 NACHGEGEBEN 5 s) → probe-post/w24-strauch-saum/9bd1c7f3.md

## 08.11. 17:40 — GPU-PROBE bd17b634 auf radeon-890m: GRÜN in 646 s (gate:laub-kante GRÜN 200 s · bild:wiese@0.5 GRÜN 51 s) → probe-post/w24-strauch-saum/bd17b634.md

## 08.11. 17:28 — GPU-PROBE 1e61b27e auf radeon-890m: GRÜN in 1288 s (gate:laub-kante GRÜN 205 s · bild:wiese@0.5 GRÜN 51 s) → probe-post/w24-strauch-saum/1e61b27e.md

## 08.11. 17:05 — GPU-PROBE 95ee3097 auf radeon-890m: GRÜN in 742 s (gate:laub-kante GRÜN 204 s · bild:wiese@0.5 GRÜN 49 s) → probe-post/w24-strauch-saum/95ee3097.md

## 08.11. 16:51 — GPU-PROBE 3405cbd8 auf radeon-890m: GRÜN in 3527 s (gate:laub-kante GRÜN 207 s · bild:wiese@0.5 GRÜN 56 s) → probe-post/w24-strauch-saum/3405cbd8.md

## 08.11. 15:48 — GPU-PROBE 88320f48 auf omen-gtx1060: ROT in 862 s (gate:laub-kante ROT 91 s · bild:wiese@0.5 ROT 96 s) → probe-post/w24-strauch-saum/88320f48.md

## 08.11. 15:31 — GPU-PROBE 8505ae41 auf omen-gtx1060: GRÜN in 1999 s (gate:laub-kante GRÜN 306 s · bild:wiese@0.5 GRÜN 58 s) → probe-post/w24-strauch-saum/8505ae41.md

## 08.11. 14:33 — GPU-PROBE 02611cdf auf radeon-890m: GRÜN in 295 s (gate:laub-kante GRÜN 194 s · bild:wiese@0.5 GRÜN 46 s) → probe-post/w24-strauch-saum/02611cdf.md

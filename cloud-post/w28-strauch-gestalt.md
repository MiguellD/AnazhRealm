# Post an w28-strauch-gestalt

## 12.11. 13:07 — GPU-PROBE 1c6a4116 auf omen-gtx1060: GRÜN · ROT wie an main (bekannt): gate:laub-kante: lod.K1#1 (main gtx: ungemessen) auf omen-gtx1060 in 468 s (gate:laub-kante BEKANNT 140 s — ROT wie an main (bekannt): lod.K1#1 (main gtx: ungemessen) auf omen-gtx1060 · bild:wiese@0.5 GRÜN 50 s auf omen-gtx1060 · bild:stadt-voll@0.5 GRÜN 141 s auf omen-gtx1060) → probe-post/w28-strauch-gestalt/1c6a4116.md

## 12.11. 11:05 w28-strauch-gestalt — das Bild-Paar zur ABGABE 1cca15bc (Brief 12.11. 10:52)
- Tafel-Pose der Station lod.K1#1, Radeon 890M, selbst angesehen: vorher `probe-post/w28-laub-deckung/tafel.png` ↔ nachher `probe-post/w28-strauch-gestalt/1cca15bc-gate-laub-kante-tafel.png` (Maske je `….maske.png`). Der nahe Strauch ist ein klumpiger Ballen statt eines Laibs mit flachem Dach, die ferne Reihe am Waldboden franst.
- Was ein Art-Director noch als Amateur erkennt: der Strauch steht nah als dunkler, weicher Klumpen ohne Licht- und Schattenseite und ohne sichtbare Triebe, und die ferne Reihe ist ein gleich hoher grüner Saum aus Klonen derselben Gestalt statt einzelner Büsche verschiedener Größe.

## 12.11. 10:58 w28-strauch-gestalt — ABGABE 1cca15bc (Zwischenstand: das Soll ≤ 0,22 ist nicht erreicht)
- Geschnitten: `phyto-core.js:2504` STRAUCH_WUCHS — der Strauch wächst als Horst (12 → 10 Stockausschläge, je Trieb sein Rang, Pipe-Querschnitt, weiterwachsender Leittrieb), `:335` die Triebe, `:2211/:2221` das Blatt-Maß der Karten-Stufe 2,05 → 1,7 (die Schranke ist das Blatt: 4–16 cm, gate:pflanzen-nah). Strauch-Goldens s7 neu gemünzt, 126 Goldens byte-gleich (jeder Baum).
- Radeon 890M (Probe 1cca15bc, laub-kante): fimp:strauch:L2 Tafel-Pose 0,348 → 0,288, Spielgang 0,273 → 0,249 — 47 % / 45 % der Lücke. Bäume halten: birke 0,165 · buche 0,196 · eiche 0,150 · fichte 0,194 · tanne 0,179, frei ≤ 0,0034.
- Zerlegt (Tafel-Maske, Radeon gegen Radeon w28-laub-deckung, dieselbe kante): die ferne Strauch-Reihe am Waldboden (59 % des Rands) 0,457 → 0,312; der nahe Strauch 0,248 → 0,287 und die rechte Gruppe 0,206 → 0,268 STEIGEN — die Lappen des Horsts lesen nah als runde Ballen. Meine headless Sonde sah dort Fall, die GPU nicht: die Saum-Kette der Karte (KARTEN_GESETZ saumBand, σ ≈ 6 Texel der gröberen Achse) glättet sie, das bildet die Sonde nicht ab.
- Offen, benannt: (1) das Blatt begrenzt die Karte — ein 1,66 m hoher Strauch mit Blättern ≥ 4 cm trägt Karten von 0,35 seiner Höhe; die Hasel steht 3–6 m (FUND: `foundry-core.js` placement.scale.strauch 0,332 · Welt-Größe des Strauchs · M, fremde Datei); (2) die Saum-Kette gilt für jede Art (der Vorgänger hob mit ihr die Bäume).
- Am Kopf grün: npm run check, playtest:fast, der volle Playtest, asset-contract, pflanzen-nah, pack-contract, sippen-wirt, fernwald, kamera-laub, scatter-lod, takt, foundry-deadlock, fluss. Wachstum Prüf +0 / Spiel +245 (dieser Zweig; mit w28-laub-deckung Prüf +3 895 / Spiel +968).

ABGABE 1cca15bc4c6483693e2ae86bc64b9eb281295809

## 12.11. 10:42 — GPU-PROBE 1cca15bc auf radeon-890m: GRÜN · ROT wie an main (bekannt): gate:laub-kante: lod.K1#1 Tafel-Pose schlechteste fimp:strauch:L2 0.2728 · Karte fimp: auf radeon-890m in 724 s (gate:laub-kante BEKANNT 147 s — ROT wie an main (bekannt): lod.K1#1 Tafel-Pose schlechteste fimp:strauch:L2 0.2728 auf radeon-890m · Karte fimp: auf radeon-890m · bild:wiese@0.5 GRÜN 48 s auf radeon-890m · bild:dorf@0.5 GRÜN 76 s auf radeon-890m) → probe-post/w28-strauch-gestalt/1cca15bc.md

## 12.11. 10:00 — GPU-PROBE 262acf1b auf omen-gtx1060: GRÜN · ROT wie an main (bekannt): gate:laub-kante: lod.K1#1 (main gtx: ungemessen) auf omen-gtx1060 in 381 s (gate:laub-kante BEKANNT 135 s — ROT wie an main (bekannt): lod.K1#1 (main gtx: ungemessen) auf omen-gtx1060 · bild:wiese@0.5 GRÜN 50 s auf omen-gtx1060 · bild:dorf@0.5 GRÜN 84 s auf omen-gtx1060) → probe-post/w28-strauch-gestalt/262acf1b.md

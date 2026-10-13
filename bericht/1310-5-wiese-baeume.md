# Bericht 1310-5 — der GPU-Mehrpreis von V18.544 an der Wiese

**Status: ZWISCHENSTAND.**

**Urteil:** Der Mehrpreis sitzt in den Bäumen, und zwar im Pixel ihrer Stoffe.
- Ohne Bäume zeichnen main (bb554abf) und V18.544 (785cca46) an der Wiese gleich: gpu-bank 9,18 gegen 9,20 ms.
- Mit Bäumen zahlt V18.544 mehr.
- Geometrie und Platzierung sind gleich: dieselben Instanzen, Skalen und Dreiecke je Instanz.
- Die Tanne ist es nicht, und je Art trennt der Toggle nicht. Es gibt keinen kleinen Schnitt an EINER Zeile — nur der Name.

## Die Toggles

Je Stand EINE Sitzung an der Wiese, Gier 0, Neigung 0. Alle 48 Baum-Gruppen werden an/aus geschaltet, die Bündel nehmen
neu auf; gpu-bank 12 × 3, der Takt läuft mit (nvidia-smi, Mittel). Daten in `1310-5/A`, `1310-5/B`, `auswertung.txt`.

| Stand | Bäume aus | Bäume an | Baum-Preis | Takt |
|---|---|---|---|---|
| A main bb554abf | 9,18 (9,14–9,23) | 13,71 (13,64–13,77) | 4,53 ms | 1731–1746 |
| B V18.544 785cca46 | 9,20 (9,13–9,30) | 14,77 (14,55–14,98) | 5,56 ms | 1700–1746 |

Bei gleichem Takt (B Bank 1 bei 1735 gegen A Bank 3 bei 1742 MHz) bleiben +0,83 ms.

**Je Art** (eine zweite Sitzung je Stand, je Art an/aus zweimal; `1310-5/art-A`, `1310-5/art-B`):
- Baum-Preis A → B: birke 1,79 → 2,03 · tanne 0,82 → 0,87 · fichte 0,71 → 0,40 · strauch 0,64 → 0,24 · eiche 0,15 → 0,30 ·
  weide −0,22 → 0,17 ms.
- Die Einzel-Toggles streuen um ±0,3 ms; keine Art trägt den Mehrpreis allein.
- Alle Bäume an: in dieser Sitzung A ~13,7 gegen B ~14,05 ms (+0,35, die Größe der Serie 1310-2).
- Die Masse je Art ist gleich (`mass.txt`): dieselben Instanzen, Welt-Skala und Dreiecke je Instanz in beiden Welten. Einzige
  Abweichung: fichte 45 → 42 Instanzen und tanne 1 089 → 1 084 Dreiecke je Instanz.
- Die Tanne-L0 trägt ihn also nicht.

## Der Name

- V18.544 baut die Bäume gleich, färbt und formt ihre Stoffe aber aus der Phänotyp-Zeile: K24 f4527629 und das WIP 2cca63df,
  `artPhaenotyp`.
- `leafShape` und `leafCol` stehen nicht mehr in den foundry-core PRESETS. phyto-core `treeParams` gibt jedem Baum eine eigene
  Laubfarbe, `hexOffsetHSL(ph.leafCol, …)`.
- Gleiche Dreiecke bei mehr GPU im Blick auf die Bäume: Der Preis liegt im Pixel der Baum-Stoffe, etwa in Deckung oder Form der
  Laub-Karten. Welche Zeile ihn trägt, nennt ein Toggle je Phänotyp-Feld — kein kleiner Schnitt, daher kein Zweig.

**Nebenbefund:** Auch ohne Bäume rechnet B mehr CPU je Bank-Frame: 2,76–2,88 gegen 2,23–2,48 ms. Das passt zum CPU-Takt p95 +0,4
der Serie an der Wiese. Nicht vermessen.

## Nachtrag 1310-6 — leafShape trennt nicht

Byte-Beweis statt Messung (Gebot 9):
- `leafShape` erreicht die Karten-Bäume nicht. Die Karte wählt ihre Atlas-Zelle reihum (foundry-core
  `zelle = _strauchKarte ? GROSS : _lq++ % BREIT.zellen`, in A und B dieselbe Zeile), den Atlas malt phyto-core
  `bakeLeafAtlasCanvas` (A = B byte-gleich). `P.leafShape` liest nur der Zweig ohne Karte (`pushLeaf`).
- Die Studio-Goldens main bb554abf gegen V18.544 (`spec/asset-contract/v1/golden`): birke, eiche, buche, weide, karst, totholz
  und die Sträucher sind byte-gleich; neu geprägt sind nur fichte, tanne und mammut (36 Goldens, 1abe2b5f).
- Laut 1abe2b5f sind die 180 Fälle „byte-gleich bis auf whorlSpacing (54 Koniferen-Fälle)“: Laubfarbe und Form sind gleich, nur
  der Quirl-Abstand der Nadelbäume ändert sich.

Der Name wird enger: der Quirl-Abstand der Koniferen (`whorlSpacing` aus treeParams, fichte/tanne) oder der Wirts-Stoff der
Bäume. Die Laubbäume sind byte-gleich und können den Preis nicht tragen; ihre Einzel-Toggles (±0,3 ms) sind Rauschen. Kein
Schnitt.

## Pflicht-OFFEN Rest

- Der Pixel-Preis der Baum-Stoffe von V18.544 an der Wiese, +0,35 bis +1,0 ms GPU je Sitzung: benannt, nicht geschnitten.
- Die CPU je Frame +0,5 ms an der Wiese ohne Bäume: beobachtet, nicht benannt.

## Status ZWISCHENSTAND + Übergabe

- Werkzeug `p3/k24`: `sitzung.sh` (alle Bäume), `sitzung-art.sh` (je Art), `baeume.cjs`, `art.cjs`, `auswertung.cjs`.
- Kein Zweig, kein Commit am Code.
- 1310-4: welle-m-e-fluegel 46d49ac9 `[ci voll]` (CI 38463803387 läuft) trägt den Fix der roten CI.

# Befund VRAM: woraus die 134,3 MB an der Mess-Wiese bestehen (ZWISCHENSTAND, nur gelesen)

Kopf: main 41ec3a96 (gelesen per `git show origin/main:`), vendor r184 nur gelesen. Zahlen der Posten: Akte
`vision/richter/leben.pflanzen.kraft.1.337846dc-radeon.json` (Radeon 890M, Mess-Wiese -280/-1046, nach zwei GC, 14.11.),
Groessen und Formate aus dem Schluessel des VRAM-Abgriffs (`scripts/lib/vram-abgriff.cjs`: Format + Breite x Hoehe x Schichten,
Bytes = alle Mips x Schichten x Bytes je Texel). Schirm 1920 x 1080, Szenen-Skala 0,75 (`SZENE_SKALA`, bild-kosten.js:3703) -> der
Szenen-Pass rendert 1440 x 810, die zeitliche Aufloesung loest auf 1920 x 1080 auf. Gelesen 14.11.2026 18:34.

## 1. „buf:?" beim wahren Namen — ein Fund am Zaehler, kein Bild-Ziel

- `buf:?` 32,4 MB sind die **Geometrie-Puffer** der Szene (Vertex, Index, Instanz-Matrizen, Speicher-Attribute). r184 legt jeden
  Attribut-Puffer mit `label: attribute.name` an (vendor/three.webgpu.min.js, `createAttribute`: `createBuffer({label:r.name, ...})`),
  der Name ist fast immer leer -> der Abgriff bucht `buf:?`. Puffer gesamt an der Wiese 33,0 MB, davon 32,4 unbenannt (98 %).
- Benannt wuerden sie von `__pufferZensus` (scripts/lib/draw-zaehler.cjs:340, Umbuchen nach `buf:szene:<Klasse>` · `bild:` ·
  `ruhend:` · `verwaist:`). **Der Fund:** `/puffer` der Werkbank (scripts/werkbank.cjs:2613–2626) baut sein Ergebnis als
  Objekt-Literal und liest `liste: __vramBericht(top)` (Zeile 2624) **vor** `puffer: __pufferZensus()` (Zeile 2626) — JS wertet in
  Reihenfolge aus, die Liste steht, bevor ein Puffer umgebucht ist. Darum traegt jede Akte des Preis-Laufs `buf:?` statt der Klassen,
  waehrend die Band-Ratsche vom 14.10. dieselben Bytes als `buf:szene` 27,5 MB (Ego) / 33,7 MB (Third) fuehrt und `buf:?` 0.
  Die Zerleg-Linse (lod.K1_1 gang, 337846dc) zeigt dasselbe: `buf:?` 34,6 MB in 330 Puffern.
- Die Halter am Spawn (klang.K5_2, 7c6f4b49, 11.11.): `szene` 30,85 MB, `bild` 0 — kein ruhend/verwaist. Ob an der Wiese nach 35 min
  Weg ein Teil `ruhend`/`verwaist` ist (= Leck, faellt nach dem Band-Gesetz ganz), sagt erst die Lesung in richtiger Reihenfolge.
- Die wahrscheinlichen Klassen (Hypothese, aus dem Halter-Zensus der Typed-Arrays derselben Akte — dieselben Bytes liegen als
  CPU-Kopie neben dem GPU-Puffer): Voxel-Chunks 15,3 · Bau-Instanzen 7,3 · Spieler 6,8 · Szene 4,9 · Wiese nah 4,7 MB.

Zweiter Fund am Zaehler: die Akte schneidet die Liste bei 90 % (`POSTEN_ANTEIL`, punkte.cjs `postenListe`). An der Wiese stehen so
121,7 von 134,3 MB beim Namen, **12,6 MB Schwanz ohne Namen**. Bei der Ratsche vom 14.10. deckte die Liste alles (112,6 von 112,5).

## 2. Die Tafel je Ziel (sortiert nach MB Ersparnis je Risiko; Risiko 1 gering · 2 mittel · 3 hoch)

| # | Ziel | Wer legt an (Datei:Zeile, main) | Groesse x Format | MB | Leser · Kanaele · Genauigkeit | Billigste GLEICHWERTIGE Form | MB Ersparnis | Risiko fuers Bild (was sichtbar, welche Pose) |
|---|------|------|------|------|------|------|------|------|
| 1 | Schatten-Kaskaden 1 + 2 (`kaskade1:tiefe`, `kaskade2:tiefe`) | Geburt dirigent-ankunft.js:408 (`CSMShadowNode`, cascades 3, Brueche 15 m · 108 m · 306 m); Groesse bild-schatten.js:1100–1116 (`_kaskadenKarten`: `2 ** ceil(log2(bedarf))`, karteMax 2048); Format bild-schatten.js:1137–1205 (depth16, ohne Farbe) | je 2048² depth16unorm | 8,0 + 8,0 | der Schatten-Filter jedes Empfaengers (`_schattenFilter`, bild-schatten.js ab 1037; PCF 5 Vogel-Punkte, k1/k2 ohne Kegel-Suche); eine Tiefe, 16 bit (≤ 1 cm je Stufe); Gesetz `SCHATTEN_KASKADE.texelM` 0,17 / 0,47 m | die Karte auf den Bedarf des Gesetzes, auf 16 gerastet statt auf die naechste Zweierpotenz: bei 75° (KAM_FOV_GRAD) Bedarf 1900 / 1828 Texel -> 1904² / 1840² | 1,09 + 1,54 = **2,63** | 1 — der Texel ist danach genau das Gesetz (heute 7 % bzw. 12 % feiner als verlangt); sichtbar hoechstens weichere Kanten ferner Schatten 15–306 m. Pruefen: Wiese Third Mittag (Baumschatten 20–100 m) + tiefe Sonne, Station schatten.K1 |
| 2 | Feld-Panorama (`feld-pass-panorama`) | bild-sicht.js:1666 (DataTexture Float, `FELD_PANO` 768 x 160), Upload bild-sicht.js:2545 | 768 x 160 rgba32float | 1,88 | Feld-Pass-Fragment `feldPanorama` (bild-sicht.js:2064–2093, Ausgabe 2200): rgb Rampen-Farbe, a Trefferdistanz -> Dunst (`imDunst`) | rgba16float (Upload als HalfFloat; die Daten kommen ohnehin per CPU vom Compute) | **0,94** (dazu die halbe CPU-Kopie) | 1 — fp16 traegt die Distanz auf 2⁻¹¹ relativ (≤ 20 m bei 40 km), unter der Aufloesung des Dunsts; Farbe in fp16 wie jedes HDR-Ziel. Pruefen: Wiese Third Horizont, Gipfel-Blick |
| 3 | Punkt-Schatten (`PointShadowDepthTexture`) | bild-schatten.js:399–422 (`_lichtWurf`, `kartePx` 256), angelegt von r184 `PointShadowNode.setupRenderTarget` beim ersten Stoff-Bau des Licht-Pools (stoff-material.js:2427) | 256² x 6 depth24plus | 1,50 | der Pool-Term: Faktor des EINEN werfenden Platzes (schatten.K5); Reichweite wenige m, nahe Ebene ≥ 0,05 m | depth16unorm (derselbe Haken wie die Kaskaden: `depthTexture.type = UnsignedShortType`) | **0,75** | 1 — bei 3 m Abstand 2,7 mm je Stufe. An der Wiese mittags wirft kein Platz (das Ziel steht, kein Bild liest es). Pruefen: Dorf Nacht am Glutbrunnen (Station schatten.K5) |
| 4 | Punkt-Schatten, Anlage erst beim ersten Wurf | wie 3 | 1² x 6 bis zum ersten Wurf | 0,75 (nach 3) | wie 3 | Wachsen IN der Textur ueber den einen Abschied (`_texturAbschied`, wie der Karten-Atlas `_impostorAtlasTexturen`) | **0,75** an jeder Pose ohne Feuer | 2 — Mechanik: Buendel muessen neu binden (Pfad existiert); das erste Bild am Feuer koennte ohne Wurf stehen. Pruefen: Dorf Nacht, Ankunft am Feuer |
| 5 | Licht-Karte (`karte-licht:atlas`) | stoff-karte.js:368 (DataArrayTexture rgba8, Schichten in Schritten `KARTEN_ATLAS_SCHRITT` 2, stoff-karte.js:340) | 32 x 896 x 20 rgba8unorm | 2,19 | Karten-Stoff der fernen Baeume: vier Beiwerte des linearen Sonnen-Felds (w14-nadel-licht), Linear, ohne Mips | BC7 (GPU-Kodierung wie Albedo in `_karteAblage`) | **1,64** | 2 — vier Beiwerte quantisiert; sichtbar als Stufen im Licht ferner Kronen. Pruefen: Wiese Third tiefe Sonne, lod.K5-Peilung |
| 6 | TRAA-Flackern (`TRAANode.flacker`) | bild-kosten.js:1576–1587 (`zielBau`, zweites MRT-Ziel des Resolve, zwei Ziele im Wechsel) | 2 x 1920 x 1080 r8unorm | 3,96 | nur der Resolve (bild-kosten.js:1817–1828): Deckungs-Gedaechtnis je Ausgabe-Pixel, 8 bit | halbe Aufloesung | 2,97 | 3 — das Gedaechtnis verwischt an Laub-Kanten, das Flackern (A3b) kehrt zurueck; laub-kante ist in PFLICHT-OFFEN A schon ROT. Pruefen: Tafel-Pose laub-kante |
| 7 | Kaskade 2 auf 1024² | wie 1 | 1024² depth16 | 8,0 -> 2,0 | wie 1 | — (nicht gleichwertig: Texel 0,47 -> 0,84 m) | 6,0 | 3 — ferne Schatten 108–306 m doppelt grob, Baumschatten am Hang zerfallen. Pruefen: Wiese Third, Fern-Hang |
| 8 | TRAA-Resolve/Geschichte (`TRAANode.resolve`) | bild-kosten.js:1576–1592 (`zielBau`: zwei RenderTarget count 2 HalfFloat, Groesse = Ausgabe in `updateBefore` 1681); die Vendor-Ziele fallen (1585) | 2 x 1920 x 1080 rgba16float | 31,64 | Resolve liest die Geschichte (rgb + a = Vortiefe fuer die Disokklusion, 3x3 um die Stelle), die Kette (Bloom, Grading) liest rgb des neuen Ziels | keine: zwei Ziele sind das Minimum (lesen + schreiben im selben Pass geht nicht); rg11b10 posterisierte (W7) und hat keinen Kanal fuer die Vortiefe | 0 | — |
| 9 | Ausgabe des Szenen-Passes (`output`) | bild-kosten.js:2085–2090 (`pass(scene, camera)`, Skala 2089, Format `_ausgabeFormat` 1890–1917) | 1440 x 810 rg11b10ufloat | 4,45 | TRAA-Eingang (3x3 Texel je Ausgabe-Pixel), rgb | keine: schon 4 Byte, schon 0,75 Skala | 0 | — |
| 10 | Tiefe des Szenen-Passes (`depth`) | r184 PassNode zu Zeile 2085 | 1440 x 810 depth24plus | 4,45 | Tiefentest; TRAA-Kamera-Bewegung (`_traaKameraBewegung`, 2138), Kontakt-Verdeckung (bild-schatten.js:1594), Quelle des Tiefenabbilds | keine: depth16 bricht fernen Boden (z-fighting) | 0 | — |
| 11 | Tiefenabbild (`szene:tiefenabbild`) | bild-sicht.js:33 (DataTexture r32float), Groesse und Zug bild-sicht.js:79–160 (`_tiefenAbbild`, halbe Breite, Max des Paars) | 720 x 810 r32float | 2,23 | Wasser (optischer Weg, weiche Ufer), Feld-Pass (March-Grenze), Rauch-Saum (`_tiefenSaum`); nicht-lineare Tiefe nahe 1 | keine: r16float verliert die Tiefe nahe 1 | 0 | — |
| 12 | Albedo-Karte (`karte-albedo:atlas`) | stoff-karte.js:363 | 128 x 3584 x 20 bc1-srgb, Mips | 5,83 | Karten-Stoff der fernen Baeume (Impostor), Farbe | keine (schon BC1); hoechstens die freie Schicht des Schritts 2 (≤ 1 Schicht aller vier Karten ≈ 0,6 MB) | 0 (≤ 0,6) | — |
| 13 | Normal-Karte (`karte-normal:atlas`) | stoff-karte.js:366 | 64 x 1792 x 20 bc5, Mips | 2,90 | Karten-Stoff, Normale xy | keine (BC5, halbe Aufloesung der Albedo) | 0 | — |
| 14 | Tiefen-Karte (`karte-tiefe:atlas`) | stoff-karte.js:372 | 64 x 1792 x 20 bc4, Mips | 1,45 | Karten-Stoff, Tiefe je Texel (w4-laub-karte) | keine (BC4) | 0 | — |
| 15 | Wege-Karte (`wege-karte`) | siedlung-wege.js:56 (`karte`, Schichten nah 0,5 m / fern 2 m, `WEGE_KARTE` 1860) | 1024² x 2 rg8unorm | 4,00 | Boden-Stoff (`_terrainGeologyAlbedo`), Wiese (`_pfadFeldAt`, CPU dieselben Bytes); zwei Belage je Kanal | keine | 0 | — |
| 16 | Fluss-Karte (`fluss-karte`) | siedlung-wege.js:62 | 1024² x 2 r8unorm | 2,00 | Fern-Ring je Fragment (`_flussKarteNode` siedlung-wege.js:734–746, Stoff stoff-material.js:935), beide Schichten | keine | 0 | — |
| 17 | Kronen-Streu (`kronen-streu`) | siedlung-wege.js:61 (Schichten nah, fern, Neigung des Fern-Rings) | 512² x 3 rg8unorm | 1,50 | Boden-Stoff (R Laubstreu, G Asche), Fern-Ring (Neigung) | keine | 0 | — |
| 18 | Laub-Atlas (`laub-cluster-atlas`) | vegetation-baum.js:148 (BC3 aus der phyto-Fracht) | 2048 x 512 bc3-srgb, Mips | 1,33 | Laub-Karten aller Baeume, glatte Alpha der Mip-Kette (K20) | keine (BC1 traegt ein Bit Alpha, K20 verwarf es) | 0 | — |

Nicht in der Akte (Schwanz 12,6 MB, aus dem Code gerechnet, nicht gemessen): Kontakt-Verdeckung 2 x 720 x 405 rg16float (bild-schatten.js:1363,
1601) ≈ 2,2 · Horizont-Karte 320² rgba16float + 768² r16float (dirigent-ankunft.js:1452–1467) ≈ 1,9 · Spiegel-Feld 384² rgba16float +
384² rgba8 (bild-sicht.js:244–259) ≈ 1,8 · Spiegel-Strahl ¼ Schirm rgba16float (bild-sicht.js:629) ≈ 1,0 · PMREM ≈ 1 · Rausch-Atlas 0,8 ·
Welt-March 0,8 · Wolken-Karte 0,34 · Rest (Bindungs-Puffer, kleine Karten). Summe ≈ 10–11 MB.

## 3. Die Summe

Risiko-arm (Zeilen 1–3): **4,3 MB** — 134,3 -> 130,0 MB. Mit den mittleren (4, 5): 6,7 MB -> 127,6 MB. **Die Bild-Ziele tragen die 20 MB
NICHT.** 66 MB der 134,3 sind TRAA (35,6) und Szenen-Ausgabe + Tiefe (8,9) — sie haben keine gleichwertige billigere Form.

Der naechste Hebel sind die **Geometrie-Puffer** (32,4 MB, 24 % des VRAM, heute `buf:?`):
1. Am Zaehler: in `/puffer` (werkbank.cjs:2613–2626) `__pufferZensus()` VOR `__vramBericht(top)` lesen, und die Akte fuehrt jede
   Zeile ≥ 0,25 MB statt bei 90 % zu schneiden — dann steht jeder Puffer als `buf:szene:<Klasse>` / `ruhend` / `verwaist` beim Namen.
2. Mit einer Lesung an der Wiese (EIN `/puffer`, keine neue Messung noetig): was `ruhend`/`verwaist` ist, faellt ganz (Leck nach dem
   Band-Gesetz); die Klassen-Kandidaten aus dem Heap-Zensus sind Voxel-Chunks (~15 MB), Bau-Instanzen (~7), Spieler (6,8 — der Leib
   traegt in Ego kaum ein Pixel) und Wiese nah (4,7).
3. Der Schwanz von 12,6 MB ist seit der Ratsche um ~10 MB gewachsen und steht in keiner Akte beim Namen.

## 4. Gegen die Ratsche vom 14.10. (spec/profiband/ratsche-wiese-radeon-ego.json, 112,5 MB; Third 118,7)

| Posten | 14.10. | 14.11. | Delta | wirklich neu? | Leser, der das Bild beobachtbar aendert |
|------|------|------|------|------|------|
| Kaskade 2 | — (2 Kaskaden je 2048²) | k0 1024² 2,0 · k1 8,0 · k2 8,0 | +2,0 netto | ja (Kontakt-Kaskade schatten.K1 davor, k0 schrumpfte 8 -> 2) | ja: Schatten 108–306 m; Pass k2 laeuft (3,85 ms im gang lod.K1_1) |
| TRAA-Flackern | in `TRAANode.resolve` 35,6 | resolve 31,64 + flacker 3,96 = 35,6 | 0 | nein — nur eigener Name | ja: Resolve (Deckungs-Gedaechtnis, A3b) |
| Tiefenabbild | `tex:szene` 4,0 (960 x 1080) | 2,23 (720 x 810) | −1,8 | nein — derselbe Posten, Skala 0,75 | ja: Wasser, Feld-Pass, Rauch-Saum |
| Licht-Karte | — | 2,19 | +2,19 | ja (w14-nadel-licht) | ja: Licht der fernen Kronen |
| Tiefen-Karte | — | 1,45 | +1,45 | ja (w4-laub-karte) | ja: Karten-Stoff |
| Fluss-Karte | — | 2,0 | +2,0 | ja (K16) | ja: Fluss-Kante im Fern-Ring (der Bach der Wiese) |
| Punkt-Schatten | — | 1,5 | +1,5 | ja (schatten.K5) | **an der Wiese nein** (kein Feuer), am Feuer ja -> Anlage bei Bedarf (Zeile 4), nicht streichen |
| Albedo / Normal | 2,7 / 1,3 | 5,83 / 2,9 | +3,1 / +1,6 | mehr Schichten (20; am Dorf 22) — waechst mit dem Weg, schrumpft nie | ja |
| Kronen-Streu | 0,5 | 1,5 | +1,0 | dritte Schicht (Neigung) + Raster | ja |
| Ausgabe + Tiefe | 7,9 + 7,9 | 4,45 + 4,45 | −6,9 | Skala 0,75 | ja |
| Szenen-Puffer | `buf:szene` 27,5 (Third 33,7) | `buf:?` 32,4 | +4,9 (−1,3 gegen Third) | Zaehler-Fund (Abschnitt 1) | Klassen offen |
| Schwanz | ≈ 0 | 12,6 | ≈ +10 | ohne Namen | offen |

Jeder neue Posten hat einen Leser, der das Bild beobachtbar aendert; der Punkt-Schatten nur am Feuer. Kein Ziel faellt ganz.

## Ehrlich offen

- Keine Zahl dieses Befunds ist neu gemessen; die Schwanz-Posten und die Puffer-Klassen sind gerechnet bzw. Hypothese.
- Die 20 MB tragen nur die Geometrie-Puffer; ihr Name steht erst nach der korrigierten Lesung an der Wiese.

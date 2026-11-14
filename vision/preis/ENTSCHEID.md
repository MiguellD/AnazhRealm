# ENTSCHEID: der Preis des Orts — EINE Entscheidung, drei Schnitte (ZWISCHENSTAND)

Stand 14.11.2026 20:20. Gelesen: die drei Befunde (voll), die Preis-Treppe, die Quelle an jeder genannten Datei:Zeile im Baum
41ec3a96 (gegen main ffb005db änderten sich nur `stamm/koerper-leib.js`, `stamm/dirigent-kern.js` und ein diag-Skript — jede Zeile
unten gilt am Kopf). Keine neue GPU-Messung. Zwei eigene Lesungen aus dem Schnappschuss `heap-weg/snap-0-wiese.heapsnapshot` des
Heap-Befunds (Werkzeug `artifacts/profiband/auge/w28-preis-ort/heap-kl.cjs`, Ergebnis `kl-ec-0.json`, `attr-0.json` daneben).
Jede Zahl trägt ihre Herkunft: **[g]** gemessen · **[r]** gerechnet · **[s]** Schwelle.

## Die Entscheidung

**Gehalten wird nur, was ein Leser liest.** Der Preis fällt an drei Wurzeln, in dieser Reihenfolge, jede auf dem Baum der vorigen:
1. **VRAM:** die Bild-Ziele auf ihr Gesetz und das Eck-Format der EINEN Pipe (`_foundryBuildMesh`) auf das Format, das der
   Chunk-Satz schon trägt. Die Geometrie-Puffer tragen den Schnitt, nicht die Bild-Kette.
2. **HEAP:** EIN Gesetz „der Speicher folgt dem Blick“ mit drei Nähten — das Render-Objekt stirbt mit seiner Geometrie, die Saat
   geht mit ihrem Chunk, der Knoten-Bau fällt mit seinem Ergebnis.
3. **GRÖSSTES BILD:** der Vorbau der Bedienung wird ein Bauer der EINEN Frist; was die Frist nicht teilen kann, verlässt den Takt.

Die Bild-Kette bleibt in allen drei Schnitten stehen (TRAA 35,6 MB [g], 22 ms GPU je Bild ohne Stempel [g]) — siehe „Nicht getan“.

## Was die Befunde nicht trugen (selbst nachgesehen)

| Befund sagt | Die Quelle zeigt | Folge |
|---|---|---|
| VRAM §1: Puffer-Klassen „wahrscheinlich Voxel-Chunks 15,3 · Bau-Instanzen 7,3 · Spieler 6,8“ (Hypothese) | der Zensus selbst steht richtig in `heap-weg/pose-0-wiese.json` (`puffer_zensus`, 18:46 [g]): Geometrie-Arena 14,91 · Tiere 7,61 (Fuchs 2,67 · Wolf 2,56 · Wesen 2,38; 20 Tiere, 188 Puffer) · Boden-Satz 4,26 · Kamm-Krone 2,20 · Spieler 2,15 · Fern-Ring 1,27 · Bau-Satz 1,12 · verwaist 0,14 · ruhend 0 — Summe 34,81 MB | kein Leck in den Puffern; der Hebel ist das Format je Ecke, nicht ein Halter |
| VRAM §3: „der nächste Hebel sind die Geometrie-Puffer“, ohne MB | Attribut-Zensus der gezeichneten Attribute (311 Render-Objekte, 970 Attribute, 40,93 MB CPU-Spiegel [g]): Lage f32 8,93 · Normale f32 7,72 · Farbe f32 7,38 · Stempel `aLodLevel`+`aH0`+`aH0L` 4,24 · verschränkt uv+`aCenter`+`aType` 3,95 · `skinIndex` u32 1,97 · `skinWeight` u16 0,99 | 47 % der Eck-Bytes sind Normale, Farbe und drei je Gestalt konstante Stempel in 32 bit |
| Heap: „die Rückkehr ≈ Wiese“ nach zwei Nähten | gerechnet aus der Tafel des Befunds: 511,4 − 60,2 − 24,7 − 6,3 − 3,2 = **417 MB** [r]; die Posen 2–4 enden bei 411 · 415 · 414 [r] | zwei Nähte reißen 400 an jeder Pose nach der ersten |
| Heap „ehrlich offen“: der Programm-Bau (85 MB) falle mit den Render-Objekten | 56 Knoten-Bauer (`WGSLNodeBuilder`) leben nach ihrem Bau [g]; 49 hält `renderer._nodes` über die `update`-Closures der Update-Knoten (4 867 Kontexte tragen den Bauer als Variable), 3 die Inseln, 3 der Licht-Wurf, genau 1 das `R.b` des Stamms (`kl-ec-0.json`). `_renderObjekteLoesen` wirft den Knoten-Stand geteilter Schlüssel mit Absicht nie (stoff-instanz.js:2083–2085) | der Bau fällt nicht von selbst; er braucht die dritte Naht |
| Heap: Render-Objekte „für jedes Objekt außer Senke und Leib“ | 311 → 334 Render-Objekte, gehalten 9,16 → 58,11 MB [g]; davon am Stoff der Kamm-Krone 8 → 40 mit 8,56 → 54,11 MB [g] (`ro-0`, `ro-4`); zwei Stellen: gelaende-fern.js:744 und :901 | EIN gemessener Täter, die Klasse fällt am Register |
| Bild: der Vorbau gehe durch `_bauStueck` „wie jeder Bauer des Planers“ | das Tor der Bauer ist `_bauer(wer, lauf, a)` (dirigent-takt.js:1965); `_bauStueck` (:2047) ist das Stück eines Lesers ohne Tor | der Vorbau geht durch `_bauer` |
| Bild: Bilder über 100 ms „in der stehenden Welt“ | stehend nach 10 s (60 s, Radeon): 0 Bilder über 100 ms mit Ursache, 1 × 108,7 ms ohne Ursache 0,3 s vor dem Ende des Laufs (TAKT 17 ms, GPU 0 [g]); die zwei Zwillinge max 58,6 und 67,1 ms [g] | alle benannten Bilder über 100 ms liegen im Einlauf oder im Vorbau |

## Schnitt 1 — VRAM

**Annahme:** VRAM nach GC an der Mess-Wiese ≤ 118 MB [s] auf der Radeon; kein Bildpaar schlechter als main.

| # | Schritt | Datei:Zeile (main) | MB | Bildpaar, das ihn annimmt |
|---|---|---|---|---|
| 1.0 | **Der Zähler nennt jeden Puffer.** `__pufferZensus()` wird VOR `__vramBericht(top)` gelesen; die Akte führt jede Zeile ≥ 0,25 MB statt bis 90 % | scripts/werkbank.cjs:2624 und :2626 (Objekt-Literal, Reihenfolge) · punkte.cjs:2883 `POSTEN_ANTEIL`, :2906 `postenListe` | 0 | keins (Zähler); Beweis: `buf:?` 0, Liste = Summe |
| 1.1 | **Kaskade 1 und 2 auf den Bedarf ihres Gesetzes**, auf 16 gerastert statt auf die nächste Zweierpotenz (2048² → 1904² und 1840²; `texelM` 0,17 / 0,47 bleibt) | stamm/bild-schatten.js:1115 (`_kaskadenKarten`) | −2,63 [r] | Schatten-Kante: Wiese Third Mittag (Baumschatten 20–100 m) und tiefe Sonne, Station schatten.K1 |
| 1.2 | **Feld-Panorama rgba32float → rgba16float** | stamm/bild-sicht.js:1666 (Anlage), :2545 (Ladung) | −0,94 [r] | Farb-Abrisse im Himmel: Wiese Third Horizont bei Dämmerung (Uhr um 0,25 und 0,75), Gipfel-Blick |
| 1.3 | **Punkt-Schatten depth16 und Anlage erst beim ersten Wurf** (1 × 1 × 6 bis dahin, Wachsen über `_texturAbschied`) | stamm/bild-schatten.js:399–422 (`_lichtWurf`, `kartePx` :422) | −1,50 an der Wiese [r] (0,75 am Feuer) | Dorf Nacht am Glutbrunnen (schatten.K5), dazu das erste Bild der Ankunft am Feuer |
| 1.4 | **Das Eck-Format der EINEN Pipe:** Float32 trägt nur die Lage. Normale → `snorm8` × 4, Farbe → `half` × 4 (beide Formen trägt der Chunk-Satz heute: siedlung-bauten.js:2057–2066, Boden- und Bau-Satz zeichnen damit); die drei Stempel `aLodLevel`·`aH0`·`aH0L` je Gestalt statt je Ecke (höchstens EIN Attribut zu 4 B); `skinIndex` u32 × 4 → u8 × 4; die verschränkte Ecke uv+`aCenter`+`aType` 24 B → 12 B (uv `unorm16` × 2, wo sie in [0, 1] liegt; die Mitte als `half`-Versatz zur Lage, der Typ in ihrer vierten Stelle). Reihenfolge nach MB: Normale, Stempel, Farbe, verschränkte Ecke, `skinIndex` | stamm/studio-gestalt.js:217–298 (`_foundryBuildMesh`: :225 Normale, :228–244 Farbe, :296–298 Stempel, :306 `skinIndex`); die Arena kopiert nach Konstruktor und `normalized` und bleibt unberührt (stamm/stoff-instanz.js:1131–1150); Kamm-Krone stamm/gelaende-fern.js:838 | −9,9 … −10,9 [r] (CPU-Spiegel: Normale −5,15 · Stempel −2,83 … −4,24 · Farbe −2,46 · Ecke −1,97 · `skinIndex` −1,48 = −13,9 … −15,3 von 40,93, also −34 … −37 % auf 29,1 MB Eck-Bytes der GPU) | Wiese Ego und Third nah (Laub, Rinde, Halm), Genesis (Wagen-Lack und Tor: Glanz-Bänder der Normale), Dorf (Haus), Mensch nah (Haut, Tuch); Kanten in Bewegung: Tafel-Pose laub-kante unverändert |
| 1.5 | **Licht-Karte rgba8 → zwei BC5** (je zwei der vier Beiwerte; der GPU-Kodierer der Normal-Karte steht, `_karteAblage`) | stamm/stoff-karte.js:368 | −1,09 [r] | Licht ferner Kronen: Wiese Third tiefe Sonne (lod.K5-Peilung) |

**Die Rechnung.** Akte 134,3 MB [g] → nach 1.1–1.3: 129,2 → nach 1.4: 118,3 … 119,3 → nach 1.5: **117,2 … 118,2 MB [r]**. Vom Stand
der Heap-Fahrt (132,5 [g], dieselbe Pose, frische Sitzung): 115,4 … 116,4 [r]. Ohne die 20 Tiere (Rückkehr 125,4 [g]) 111 [r].
**Ehrlich: mit 20 Tieren im Bild liegt die Wiese auf der Schwelle, nicht sicher darunter.** Steht die Messung nach 1.5 über 118,
steht sie als ROT mit Zahl; der nächste gesetzte Posten ist die Instanz-Matrix 4 × 3 statt 4 × 4 (`_anazhIM` 1,84 MB CPU [g],
−0,3 MB [r]) — kein Bild-Ziel fällt dafür.

**Leser-Liste.** 1.0: `punkte.cjs` `preisPosten`, `richter-akte.cjs`, die Band-Wand (`band-urteil.cjs` `erzeugerOf`). 1.1: der
Schatten-Filter (`_schattenFilter`, Texel aus `mapSize`), `_schattenBias`, `csm._anazhKarten`. 1.2: `feldPanorama`
(bild-sicht.js:2064–2093), `_feldPanoramaRechnen` (die CPU-Werte bleiben Float32, die Ladung wandelt). 1.3: der Pool-Term
(stoff-material.js:2427), `_lichtWurfKarte`, jedes Bündel, das die Würfel-Textur bindet. 1.4: der EINE Stoff
(`_foundryTreeMaterial`: `attribute("color")`, die drei Stempel), `_arenaForm` (neue Form = neue Lager-Familie), und jeder
CPU-Leser der Arrays — `_mergeBlueprintByMaterial`, der Karten-Bäcker, `_foundryGroupBytes`, `_foundryFlat`, das Tuch-Gitter,
`_hautGewicht`; die Liste per `npm run atlas -- --find` VOR dem Schnitt, sie steht im Commit.

**Linse.** Band-Wand `gate:profiband` (`scripts/lib/band-urteil.cjs`, `spec/profiband/ratsche-wiese-radeon-{ego,third}.json`): die
Ratschen der Erzeuger fallen auf die Messung, nie hinauf. Drei Regeln, je ein Mutant: (a) `buf:?` ≥ 0,25 MB in einer Lesung ist
ROT `unbenannt` (Mutant: Liste vor Zensus); (b) eine gezeichnete Foundry-Geometrie mit Float32-Normale, -Farbe oder Stempel je
Ecke ist ROT beim Namen der Täter-Klasse (Mutant: ein Teil mit Float32-Normale; Familie `gate:asset-contract`); (c) ein Ziel ohne
Leser im Bild — `tex:PointShadowDepthTexture` über 1 × 1 ohne werfenden Platz — ist ROT (Mutant: Anlage beim Boot).

**Nicht getan.** TRAA-Resolve in der inneren Auflösung (−15,6 MB [r]): die zeitliche Auflösung auf volle Ausgabe IST die EINE
Skala (Lehre 23); innen aufgelöst und danach gestreckt verliert das stehende Bild die Schärfe, die sie baut — schlechter als main.
TRAA-Geschichte in rg11b10: posterisiert (W7) und trägt die Vortiefe nicht. Flackern in halber Auflösung (−2,97): laub-kante ist in
PFLICHT-OFFEN A schon ROT. Kaskade 2 auf 1024² (−6,0): Texel 0,47 → 0,84 m, nicht gleichwertig. Licht-Karte in BC7: vier
unabhängige Beiwerte liegen in keinem Block auf einer Linie. Lage in Float16: 1,6 cm Stufe am 20-m-Baum. Tiere, die eine Gestalt
teilen: der Leib kommt aus dem Genom (w28-leib-genom). Spiegel-Ziele bei Bedarf: der Pass `spiegel:strahl` zeichnet an der Wiese
in 4 % der Bilder [g], er hat einen Leser.

## Schnitt 2 — HEAP: „der Speicher folgt dem Blick“

**Das Gesetz:** ein Halter lebt, solange ein Leser im Blick oder in Reichweite ihn liest; verlässt der Leser Blick und
Reichweite, fällt der Halter im selben Takt — und was wiederkehrt, wächst aus dem Samen. **Annahme:** gehaltener Heap ≤ 400 MB [s]
an jeder der vier Posen in EINER Sitzung, Wachstum ≤ 5 MB/min [s], die Rückkehr zur ersten Pose zeigt dasselbe Bild ohne Loch und
ohne Bild über 100 ms.

| Naht | Halter (Wachstum Wiese → Rückkehr [g]) | Grenze | Räumung (Datei:Zeile) | Kosten der Rückkehr |
|---|---|---|---|---|
| **N1** Das Render-Objekt stirbt mit seiner Geometrie | Render-Objekte am geteilten Stoff 71,8 → 132,0 (+60,2); Täter Kamm-Krone 8 → 40 Render-Objekte, 8,56 → 54,11 MB; ihre `vertexBuffers` 7,38 → 46,64, die Index-Spiegel `_anazhIx` 6,15 → 12,6 | die Geometrie: fällt sie, hat das Render-Objekt keinen Leser | am Register stamm/stoff-instanz.js:2138 (`createRenderObject`): der Hörer `onGeometryDispose` trägt die volle Lösung EINES Render-Objekts (der Rumpf von `_renderObjekteLoesen` :2076–2101: Hörer von Stoff und Geometrie ab, eigene Bindegruppen, Sampler-Hörer) und wandert mit `setGeometry` (:2150); nie `ro.dispose()` (gäbe die Pipeline frei). Kein Rufer wird geflickt — gelaende-fern.js:744 und :901 heilen am Register | keine: das neue Netz baut sein Render-Objekt, Programm und Pipeline liegen im Cache ihres Schlüssels |
| **N2** Die Saat geht mit ihrem Chunk | Bäume als Welt-Einträge `state.architectures` 12,1 → 36,8 (+24,7; 2 620 → 7 568 Einträge, davon `blockerAABBs` 8,2 → 24,9) · Wald-Gedächtnisse +3,2 · Hydro-Kacheln 4,7 → 11,0 (+6,3) | der Chunk-Ring (`voxelChunks`, 81 Chunks an jeder Pose [g]) für Saat und Gedächtnis; die Reichweite des Wasser-Bands für die Kachel | stamm/gelaende-chunks.js:2014 (`_disposeVoxelChunk`): die Einträge `_ausGesetz` seines Gebiets fallen still (`removeArchitecture`, werkstatt-bauen.js:892), sein Schlüssel verlässt `voxelPopulatedChunks` (vegetation-baum.js:2457) — außer er steht in `worldMeta.feldStand` (gelaende-boden.js:301–308: ein alter Stand trug seine Würfe selbst) —, seine Zellen verlassen die Gedächtnisse. Hydro: gelaende-boden.js:399 und der Faden voxel-worker.js:131 räumen dieselbe Kachel | die Saat des Chunks im Takt des Wald-Fadens (`_tickSaat` unter der EINEN Frist), die Körper aus dem Foundry-Cache oder von der Platte; Taten trägt der Stand (`_tatAm`, feld-leben.js:3305), nie der Bestand. Hydro: eine Region im Voxel-Faden (`_hydroBestellen` :359), nie am Haupt-Faden |
| **N3** Der Knoten-Bau fällt mit seinem Ergebnis | 56 → 59 Bauer; ihr Graph steht unter `_lichtWurfK.roh` 46,6 → 58,8 und `_naesseHimmelK` 38,7 → 41,0: **85,3 → 99,8 MB** (+14,6) | der Bau selbst: mit `_createNodeBuilderState` hat der Bauer keinen Leser mehr | stamm/bild-kosten.js:933 (`_knotenRate`) und die eine Stelle des Vendor-Baus am Stück (`Nodes.getForRender`, gepinnt in `gate:vendor-anker`): nach dem Stand werden die Felder des Bau-Graphen am Bauer entkernt (Cache, Stapel, Fluss-Knoten und -Code, Knoten-Listen); `object`·`material`·`renderer`·`camera`·`scene` bleiben. Jedes entkernte Feld wirft beim Lesen laut „BAU ENTKERNT: <Feld>“ — kein stiller Rückfall | keine: der Stand bleibt im Cache seines Schlüssels, ein neues Render-Objekt übernimmt ihn |

**N3 beginnt mit dem Spike** (eine warme Welt, drei Fälle: Wiese stehend · Seelenwechsel · Dorf Nacht mit Licht-Wurf): entkernen,
60 s spielen, Heap nach zwei GC, kein Wurf „BAU ENTKERNT“. Trägt er ≥ 40 MB [s für den Bau], wird gebaut; wirft ein Feld, bleibt
genau dieses Feld stehen und steht mit seinem Leser im Commit.

**Die Rechnung.** N1 + N2: 384 · 411 · 415 · 414 · 417 MB [r] — **ROT an vier von fünf Lesungen**. Mit N3 bei der halben Last des
Baus (−42,7 an der ersten Pose, −49,9 danach): 342 · 361 · 365 · 364 · 367 [r], dazu der tote Teil der Kamm-Krone schon an der
ersten Pose (−7,5 [r]) und das Eck-Format aus Schnitt 1 an den CPU-Spiegeln (−14 … −15 [r]). Wachstum: 127 MB in 17,2 min = 7,4 MB/min [g] → Rest Foundry-Cache
+4,1 · Bau-Verschmelzung +2,5 · ohne Halter +6 = 0,7 MB/min [r]. **Fällt der Spike N3 aus, hält Schnitt 2 die 400 nicht** (411–417
[r], mit dem Eck-Format 396–403 [r]) — das steht dann als ROT mit Zahl, nicht als GRÜN.

**Leser-Liste.** N1: `__pufferZensus` (`__renderObjekte`, draw-zaehler.cjs:365), die Diät (Geometrie-Wächter), `_gpuKehraus`,
`_chunkSatzGeometrie` (tauscht am selben Mesh, der Hörer wandert). N2: jeder Leser von `state.architectures`
(`_blockerUmPlatz`, `_kronenStreu`, die Karten-Stufe, der Klang, `_saumRaeumen` vegetation-baum.js:1110, `_waldNachwuchs` :1139,
der Speicher speicher-welten.js:1011), `_tickSaat`, `_waldPflanzWarten` (vegetation-wiese.js:2903 pflanzt einen Chunk, der ging —
er pflanzt dann nicht mehr), `_computeHydroBand` (gelaende-boden.js:416). N3: r184 `NodeBuilderState`, die `update`-Closures der
Update-Knoten, `_knotenRate` (`d.rate`, `E.imFlug`).

**Linse.** Das Gang-Urteil der Band-Familie (`werkbank puffer --gang`, `gangUrteil` scripts/lib/draw-zaehler.cjs:560, `GANG`
5 MB/min) fährt die Posen-Fahrt Wiese · Wiese-Ost · Dorf · West · Wiese (die Fahrt des Befunds, `heap-weg.cjs`, wird sein Gang);
Ratsche nach unten je Pose. Drei Mutanten: eine entsorgte Geometrie, deren Render-Objekt am Stoff bleibt (ROT beim Namen des
Stoffs); ein Chunk, der geht und dessen Saat steht; ein Bauer, der nach dem Stand lebt (Zahl lebender `WGSLNodeBuilder` > Bauten
im Flug).

**Nicht getan.** Foundry-Cache-Deckel (512 MB / Ruhe 64 MB, studio-gestalt.js:1459–1467): gewachsen +4,1 MB auf 11,7 [g], die LRU
begrenzt ihn — kein Hebel heute. `_archMergeCache` (12,0 → 14,5; siedlung-bauten.js:1130): begrenzt durch die Zahl der Baupläne
(199 → 203), sein Gewicht fällt mit dem Eck-Format (Lage·Normale·Farbe je 3,95 MB f32 [g]). Kreaturen: lebende Menge, kein
Weg-Wachstum. `blockerAABBs` als Typed-Array: fällt mit N2 im Verhältnis. `ro.dispose()` statt der Lösung: jede Rückkehr
kompilierte neu (Frost-Nachbesserung 5).

## Schnitt 3 — das größte Bild

**Annahme:** kein Bild über 100 ms [s] in der stehenden Welt nach dem Einlauf, auf beiden Geräten.

| Ursache [g] | Datei:Zeile | Was fällt |
|---|---|---|
| Der Vorbau der Bedienung läuft je Takt NACH dem Bild, außerhalb der EINEN Frist; sein Tor ist nur „Welt steht, Eingabe ruht“ — der Zustand jedes Preis-Laufs. Takte von 113 und 189 ms (Akte kraft, t+8,8 s und t+20,3 s) | stamm/siedlung-bauten.js:1365, gerufen stamm/dirigent-takt.js:408; die Frist `_fristStellen` :1875, das Tor `_bauer` :1965 | `_vorbauBedienung` geht durch `_bauer("vorbau", …)` in der Frist DESSELBEN Takts (nie eine eigene über `_fristAufgabe`): höchstens ein Stück je Takt, nach der Frist nur als das EINE Pflicht-Stück |
| Tuch-Gitter 159,0 ms in EINEM Bild | stamm/koerper-fahrt.js:327 (`_tuchVorbau`) → `tuchGitter` koerper-core.js:8329 | reiner Kern: es entsteht im Faden und kommt per Transfer als Typed-Arrays (dazu fällt `playerMesh.userData._tuch` 9,1 MB Objekt-Heap [g]) |
| Rezeptbuch 175,6 ms · Werkstatt 159,1 ms | stamm/werkstatt-hud.js:2767 (`_uiVorbau`) → `renderRecipeBook` werkstatt-hof.js:224, `_workshopRenderTail` werkstatt-vorschau.js:248 | die DOM-Vorzeichnung verlässt den rAF: `requestIdleCallback` mit seiner Frist, je Rezept ein Stück |
| Gast-Bau 50–134 ms je Bild (Σ 1 973 ms in 20 s; ein Fluss-Knoten baut am Stück, `bauMs` 64,4) | stamm/bild-kosten.js:861 (`_knotenRate`), :922 (`F[R.k].build(b)`); die Gäste stamm/koerper-leib.js:270, `_geistVorbau` siedlung-bauten.js:1381 | ein Gast baut nur im Zwischen-Takt der gespannten Leine (69–81 % der Takte der Radeon [g]) und nie zwei Gäste in einem Bild; der größte unteilbare Knoten bleibt 64 ms [g] |
| Der Einlauf nach dem Wechsel der Probe: 15 von 15 Bildern über 100 ms in den ersten 2,6 s, Takt ≤ 21 ms — GPU (29 asynchrone Pipelines, 48 Shader-Module, Uploads 5–7 MB je Bild) | Leine stamm/dirigent-takt.js:799, `GPU_FRAMES_IM_FLUG` welt-licht.js:148; das Fenster richter-akte.cjs:47 (`preisImFenster`), der Lauf punkte.cjs:2894 (`ein: 30`) | (a) die Akte urteilt über das Fenster `sek` des Laufs nach seinem eigenen Einlauf und führt „größtes Bild im Einlauf“ als Lesewert daneben — der Zähler folgt dem Lauf, kein Soll bewegt sich; (b) Pipelines und Uploads gehen durch dasselbe Tor, höchstens ein Paket je Bild |

**Die Rechnung.** Stehend nach dem Einlauf bleibt als größtes Stück ein unteilbarer Knoten-Bau von 64 ms [g] auf ein Bild von
26–34 ms: **≤ 98 ms [r]** — die Annahme hält mit 2 ms Luft, solange nie zwei Stücke in einem Bild liegen.

**Das p95 der Radeon — ehrlich.** Schnitt 3 nimmt die Bilder über 100 ms, kein GPU-ms. Erreichbar danach: **p95 33,8 ms im guten
Zustand des Geräts** (Zwilling 1 [g]) — 0,8 ms über dem Preis —, **50–59 ms im gedrosselten** (Zwilling 2, Hänger stehend [g]).
Am Gerät hängt: (1) die 120-Hz-Anzeige stuft — 26,3 ms GPU je Bild [g] werden 33,3 ms, ≤ 33 verlangt 95 % der Bilder in 25,0 ms,
also ≤ 23 ms GPU; (2) der Zustand der iGPU — dieselbe Pose, dieselben 113 Befehle, 2,5 min später 26,2 → 44,7 ms Durchsatz [g]
(die Referenzfahrt urteilt das, f 1,14); (3) die Füllrate — der Spawn mit 53 Befehlen kostet schon 22,1 ms [g]. An der Welt hängt:
von 26,3 ms stehen 3,8 ms in einem Stempel (haupt 1,21 · TRAA 0,98 · post 0,60 · kontakt 0,45 · k0 0,62 je 2. Bild [g]),
**22 ms stehen in keinem**. Erst wenn sie beim Namen stehen, ist ≤ 33 an der Radeon eine Bau-Frage. GTX: p95 33,34 und 191,65 ms
stammen aus dem Fenster MIT Einlauf; der Strom der GTX liegt nicht vor — ungelesen.

**Leser-Liste.** `_bauHunger` und `_bauPflichtGang` (ein neuer Bauer „vorbau“ tritt in den Vortritt), `gate:takt` T12/T13, die
Hänger-Linse (`werkbank haenger`), `_tuchZustandAn` und `tuchTakt` (lesen das Gitter), `_uiVorbauStand`, `_vorbauFehlt`,
`buche-2.cjs` und `richter-akte.cjs` (das Fenster).

**Linse.** `gate:takt` (scripts/diag-takt.cjs, Familie der EINEN Frist): „Arbeit nach der Frist: vorbau X ms“ urteilt wie jeder
Bauer; Mutant: ein Vorbau-Schritt am Tor vorbei ist ROT beim Namen. Die Hänger-Linse am Stand der Wiese (60 s nach dem Einlauf)
hält 0 Bilder über 100 ms als Ratsche; Mutant: das Tuch-Gitter am Haupt-Faden.

**Nicht getan.** Die Bild-Kette in der inneren Auflösung: dieselbe Entscheidung wie in Schnitt 1. Ein Schnitt an den 22 ms ohne
Stempel: ungemessen, Messname `werkbank zerlegen --ort wiese` (Radeon, zerlege-linse ABBA) — erst die Zahl, dann der Schnitt.
Die Bühne nur bei Änderung setzen (ausgabe-aufnahme.cjs:351): Verdacht ohne Messung, er fällt mit (b), wenn er stimmt. Den
unteilbaren Fluss-Knoten im Vendor teilen: vendor/ wird nie editiert.

## Die Abnahme je Schnitt (dieselbe Fahrt wie die Messung)

1. `werkbank start --echt --ort wiese` · `/puffer` nach zwei GC · Akte über `punkte.cjs` — VRAM ≤ 118, `buf:?` 0, die Bildpaare
   gegen main an identischen Kameras (Bildpaar-Rezept der Werkbank) nach `artifacts/profiband/auge/w28-preis-ort/`.
2. `heap-weg.cjs` (fünf Lesungen, nach zwei GC) — jede ≤ 400, Wachstum ≤ 5 MB/min; Bildpaar Pose 0 gegen Pose 4 nach dem
   Einschwingen, dazu die Hänger-Linse über die Rückkehr.
3. `werkbank haenger` stehend 60 s nach dem Einlauf an Wiese und Genesis, Radeon und GTX — 0 Bilder über 100 ms; `gate:takt`.

## Ehrlich offen

- Keine MB-Zahl von Schnitt 1.4 ist an der GPU gemessen: sie steht aus dem CPU-Spiegel der gezeichneten Attribute gerechnet.
- Die Wiese mit 20 Tieren endet gerechnet bei 117,2–118,2 MB — auf der Schwelle.
- N3 ist ohne Spike eine Lesung des Schnappschusses, kein Beweis; ohne N3 reißt der Heap an vier Lesungen.
- 22 ms GPU je Bild der Radeon stehen in keinem Stempel; das p95 ≤ 33 an der Radeon ist mit diesen drei Schnitten nicht erreicht.
- Die GTX-Seite der Bilder über 100 ms ist ungelesen.

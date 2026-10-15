# Durchbruch-Plan 15.10. (Workflow wf_389eb460-ad6)

Die Wand des Profi-Bands ist nicht die GPU, sondern die CPU. Sie entscheidet Objekt für Objekt (Render-Pfad ≈ 0,8 ms + 25 µs je Befehl, CPU-Takt p95 5,5–6,5 gegen 5,8 ms) und trägt im Gehen die Folge-Arbeit jedes Chunks (9,4 ms je Frame); darum wandert zuerst die Wahl auf die GPU (Compute + drawIndexedIndirect) und die Folge-Kette in den Voxel-Faden. Frei wird die GPU dort, wo sie heute jeden Frame dieselbe unveränderte Funktion neu rechnet: beim Boden (−2,2 ms) und bei der Membran (−1,3 ms am Tor nah). Ausgegeben wird das Freie, wo Asset-Spiele Speicher brauchen und wir eine Funktion haben: Licht aus EINER Atmosphäre (0,1 ms, 0,6 MB), Verdeckung exp(−G·LAI) aus dem Gesetz (0 Dreiecke, 0 Befehle), Halme aus der Dichte im Compute, das Ziel des Tors als Panorama seines Gesetzes, der Spiegel aus dem eigenen Bild. Was im Band nicht geht, steht offen da, jeweils mit dem Weg drumherum: Multi-Draw-Indirect, Software-Raster nach Nanite, Raytracing-GI, Planar-Spiegel, Splats und Oktaeder-Karten über dem VRAM-Rand.

# Durchbruch-Plan: Profi-Band und fast fotoreal

**Grundlage**
- Gelesen: integ-probe e8a370ad (`C:\Users\micha\AnazhRealm-integ`), dazu die Zweige K68, K69, K60-2 und K62 sowie `koordination` (UEBERGABE-2026-10-14.md, bericht/1510-k55-abab.md).
- PFLICHT-OFFEN am Kopf: B und E. C ist mit K10-6 gefallen.
- Die Tafel-Ist-Werte stammen von V18.546.2 und sind gegen e8a370ad veraltet.
- K68 hat die Laub-Wirkung schon von 0,775 auf 0,005 gesenkt: zweiton 0,0349 → 0,0001 (bbaaff31). Der neue Rang 1 der Tafel ist laub-kante mit 0,305 gegen Soll 0,22 (K68-N2, 7ba8d17d).

## Der Hebel der Funktion

Die Funktion trägt an zwei Stellen:
- **(a)** wo heute dieselbe Funktion jeden Frame neu gerechnet wird, obwohl sie sich nicht ändert (gegen Gebot 7);
- **(b)** wo ein Asset-Spiel Speicher bräuchte, den das Band nicht hat (VRAM 104–114 von 118 MB).

| Klasse | Asset-Spiel speichert | wir rechnen aus dem Gesetz | heute (Datei:Zeile) | Karte |
|---|---|---|---|---|
| Boden, Fels | virtuelle Textur, 10 Texel/cm (Far Cry 4, Chen GDC 2015) | gelaende-core-WGSL (96–150k Zeichen) je Texel und nur bei Änderung | je Pixel und Frame: `_felsRechenwerkTSL` stamm/10.js:1434–1439 | D5 |
| Licht im Inneren | gebackene AO-Karten | V = exp(−G·LAD·d), d aus Anker und Kronenradius (Monsi & Saeki 1953) | Himmels-Sicht nur am Boden: 10.js:921 | D4 |
| Gras | Halm-Meshes und -Karten | `groundCover.grass` → Halm-Lagen im Compute, Halm aus `vertex_index` | JS je Büschel: 11c.js:204–232, 310–365 | D9 |
| Himmel und Licht | HDR-Himmel | Atmosphären-Gesetz → 4 LUTs, 0,6 MB (Hillaire EGSR 2020) | 4 Näherungen: 24.js:331, 24.js:986, 05b.js:1963, 05b.js:2795 | D3 |
| Tor | Postkarte oder zweite Szene | Gelände-Gesetz der Ziel-Welt → Panorama (dasselbe Compute wie 11d.js:907) | 12-Schritt-March: porta-core.js:921 | D8 |
| Wasser | Planar-Spiegel (zweite Szene) | das eigene Bild (SSR, McGuire & Mara JCGT 2014) | spiegelt nur den Himmel: 11b.js:2173 | D7 |
| Sicht-Wahl | – | die GPU wählt je Frame, die CPU zahlt je Signatur (Haar & Aaltonen SIGGRAPH 2015) | JS je Instanz: 25c.js:1760–1800 | D2 |

Wo die Funktion **nicht** trägt:
- die Silhouette der Fernkarte, denn Auflösung ist Speicher;
- das Gesicht, denn dort ist die Gestalt das Gesetz (`KOPF_SOLL`), kein Render-Hebel.

## Budget freimachen

Ist-Werte:
- GTX, Regler voll, stehend: K55 B.
- Radeon: Stand 14.10. (29cdeb16, 8a00348e).
- GPU je Klasse: Hochrechnung ×0,5625 aus 1110-1 und 1310-1, weil am Kopf nach K50 keine Zerlegung existiert.

| Budget | Band | heute | frei durch | ausgegeben durch | nach Welle C (Hochrechnung) |
|---|---|---|---|---|---|
| CPU-Takt p95 (W-Ego · W-Third · G-Ego · G-Third) | 5,8 | 5,7 · 6,1 · 5,5 · 6,5 (14.10.: 6,0–7,8) | D2: −0,7 · −1,0 · −0,9 · −1,55 | D3 +0,03, D9 Dispatch +0,05 (JS-Büschel −0,1…−0,3) | 5,0 · 5,1 · 4,6 · 4,9 |
| CPU p50 gehend / Frame p95 gehend | – / 33 | 10,4 / 25,0; Dorf beim Einströmen 41,6 | D6: −5…−8 | – | 3,5–5 / ≤ 16,7; Dorf ≤ 25 |
| GPU GTX Genesis | 16,7 | 12,7–13,3 | D1 −0,25 · D5 −2,2…−2,5 · D8 −0,5…−0,8 | D2 +0,15…+0,3 · D3 +0,1 · D4 +0,2…+0,4 | 9,8–10,8 |
| GPU GTX Wiese (gpu-bank Third) | 16,7 | 9,07 | D1 −0,25 · D5 −0,8…−0,9 | D2 +0,2 · D3 +0,1 · D4 +0,3 · D9 +0,5…+1,0 · D7 +0,3…+0,8 nur mit Wasser | 9–10 |
| GPU Radeon Genesis | 16,7 | 17,8 (33,3-ms-Stufe) | GTX-Freimacher ×1,45–1,9: −4,7…−6,2 | ≈ +1,0 | 12,5–14 (60-Hz-Stufe) |
| Befehle | 208 | 75–191 | D8 −1 je Tor | D9 +2 | ≤ 190 |
| Dreiecke | 680k | 287k–589k (K64: Tor-Klasse 166k → 113k) | D2 Hi-Z/Horizont −5…−15 % | D9 ≤ 80k (heute 60–66k) | ≤ 560k |
| VRAM G-Third GTX / Radeon | 118 | 106,1 / 113,7 | D1 −5…−9 · D5 −4,0 (Wege-Karte) | D2 +2 · D3 +0,6 · D4 +0,5 · D5 +7,9 · D8 +1 je Ziel · D9 +1 · D7 +4,7 nur mit Wasser | ≈ 107–110 / ≈ 115–117 |

**Korrekturen an den Blickwinkeln (die Zahl führt):**
- **Ping-Pong spart kein VRAM.** Lesen und Schreiben brauchen weiter zwei Ziele. rg11b10 für die Geschichte ist verworfen, weil es die Wolken posterisierte (25c.js:311–312). Der Gewinn ist nur die Kopie, 0,23–0,29 ms. Die −15,8 MB fallen weg.
- **VRAM kommt aus anderen Quellen:** Vertex-Quantisierung −4…−8 MB, Wege-Karte im Cache −4 MB, Panorama auf 16 Bit −0,94 MB.
- **MRT-Bewegung ist mit Grund verworfen** (25c.js:690–697). K68 schaffte zweiton 0,0001 ohne sie.
- **Bloom als Mip-Kette** kostet +6 Quad-Züge, also ≈ +0,15 ms CPU, gegen die E-Wand. Sie kommt erst nach D2.
- **Indirekte Züge bleiben Züge.** Die Band-Zahl der Befehle bleibt ±0; D2 macht die Züge billig, nicht weniger. Die Zähl-Linse trennt Render-Objekte (CPU) von Zügen (GPU).

**Reihenfolge der Freimachung:**
1. CPU, denn dort reißt E.
2. Radeon-GPU (Genesis 17,8 > 16,7).
3. Radeon-VRAM (4,3 MB Rand) vor jeder Ausgabe über +2 MB.

## Klassen-Wellen

| Klasse (Wirkung) | läuft schon | D-Karte | geschärftes Soll | Kosten ← woher |
|---|---|---|---|---|
| laub (0,775 → 0,005; laub-kante 0,168) | K68: Kante, Kronen-Normale; Nadel-Wedel offen | D4: Kronen-Innen, Himmels-Sicht | detail ≥ 0,25 (heute L2 0,058), kontrast ≥ 0,6 (0,43–0,63), C*ab ≤ 30 (43–47) | GPU ≈ 0, VRAM +0,6 MB ← D1 |
| boden-nah (0,458) | K70: Narbe im 14-m-Ring, Farb-Gesetz | D9 Wiese bis 30 m, D5 Boden-Stoff | laiWirk ≥ 1,7 als Minimum je Band bis 30 m (0,82/0,43/0,33/0,03); detail Halm ≥ 0,25; Boden ≥ 0,15 (0,023) | GPU +0,5…+1,0 ← D5 −0,85, D1 −0,25; Dreiecke ≤ 80k |
| himmel-licht (0,166) | – | D3 Atmosphäre und Eichung, D4 Verdeckung und Kontakt | Quotient [5; 12,5] (4,226); schattenAnteil 0,08–0,20 (0,237); Kontakt ≥ 30 % Abfall in ≤ 0,1 m | +0,1 ms + 0,3 ms ← D1 |
| wasser (0,074) | – | D7 | Spiegel-Treue r ≥ 0,6 (0,114); uferWeiss ≤ 1 % (7,1 %); fließend detail ≥ 0,2 | +0,3…+0,8 ms nur auf Wasser ← D5; +4,7 MB ← D1 |
| tor-fern (0,046) | K64: Stufe 2 ab 12 m | D8 | milchweiss ≤ 0,05 (0,426); C*ab ≥ 20; Ziel-Treue r ≥ 0,5 | frei −1,3 ms am Tor nah |
| haus (0,038) | K66: Form | D3 Albedo Labor = Welt, D4 Traufe, Laibung, Sockel | albedoVerhaeltnis [0,9; 1,1] (0,529); Fassade/Dach detail ≥ 0,10 offen (fachwerk-Gesetz, Folge) | ≈ 0 |
| fels (grün, Soll zu niedrig) | – | D5 | detail ≥ 0,10 und kontrast ≥ 0,25 aus 30–60 m (0,025–0,029 / 0,09–0,16) | im Cache-Budget |
| mensch-kopf (0,003) | K57 KOPF_SOLL | – | Iris-Band [0,9; 0,97] | offen, kein Render-Hebel |
| Ferne > 200 m (keine Klasse; 0,030 gegen 0,185) | – | D3 Luftperspektive, D5 Stufen bis 160 m | neue Klasse `ferne` (das Maß baut D3) | – |

## Reihenfolge

**Wirkung je Token.** R2 kostet etwa 1–1,5 M Tokens, R3 etwa 3–4 M (Entscheid 15.10.). Höchstens drei R3-Karten laufen gleichzeitig, jede zweigt vom Kopf von integ-probe ab (Lehre 12).

**Schritt 0 (OMEN, ~1 h):** `werkbank zerlegen` an Wiese und Genesis am Kopf. Diese Zerlegung fehlt seit K50 und ist der Richter jeder GPU-Zahl dieses Plans.

**Welle A, sofort, keine Berührung mit K66/K68/K69/K70/K60-2:**
- D1 `ausgabe-speicher` (R2, 8580–8599): klein, Voraussetzung für D5 und D7 auf der Radeon.
- D2 `gpu-wahl` (R3, 8600–8619): zuerst Zähl-Linse und Spike. Der Spike entscheidet in Stunden, ob die größte Karte überhaupt baut. K62 (je Objekt billiger) addiert sich; die Zahl liefert OMEN `1510-k62-abab`.
- D3 `eine-atmosphaere` (R3, 8620–8639): Bildanteil 1 bei 0,1 ms.

**Welle B:**
- D4 `verdeckung-gesetz` (R2, 8640–8659) nach dem K68-Merge.
- D5 `boden-cache` (R3, 8660–8679) nach D1.
- D6 `gehender-takt` (R3, 8680–8699) nach K60-2 und K69.

**Welle C:**
- D7 `wasser-spiegel` (R2, 8700–8719) nach D1 und D3.
- D8 `tor-fenster` (R3, 8720–8739).
- D9 `wiese-compute` (R3, 8740–8759) nach D2, D5 und K70.

**Konfliktgrenzen:**
- D1 quantisiert am Upload, D2 verallgemeinert `_satzPacke`. Die D1-Quantisierung landet vor dem Pool von D2.
- D3 und D7 teilen die Umgebung: D7 liest D3.
- D4 und D9 teilen den Halm-Term: D9 liest D4.

## Risiken

**Was im Band nicht geht, und der Weg drumherum:**
- **Multi-Draw-Indirect** (experimentell, 0,25 % unter Windows): N indirekte Züge auf EINEM Puffer in EINEM Render-Objekt. Die Dawn-Validierung kostet dann 10 µs statt 3 ms (toji.dev, indirect-draws).
- **Nanite und Software-Raster** (keine 64-Bit-Atomics): Cluster-Culling aus dem Studio (meshoptimizer clusterlod, 2025) im Compute von D2. Das ist eine Folge, wenn die Tore nach K64 noch über 100k liegen.
- **DDGI, Radiance Cascades, VXGI** bei streamender Welt: Himmels-Sicht aus dem Gesetz (D4) plus LUT-Umgebung (D3). SSGI erst, wenn eine Zahl es fordert.
- **Planar-Spiegel** (zweite Szene = doppelte Befehle): SSR plus Sky-View-Rückfall (D7). Was außerhalb des Schirms liegt, spiegelt nicht; das ist benannt.
- **Splats**: Asset statt Gesetz, Licht gebacken. Verworfen.
- **Oktaeder-Karten**: 8×8 Ansichten à 128² sind das 4-fache der heutigen Texel je Art, also etwa +20 MB, über dem Radeon-Rand.
  - Die Fernkarte bleibt 2,2-fach unter Pixel bei d1 = 26 m (foundry-core.js:605, Zellen 128×256). Offen, Messname `kartenVergroesserung` ≤ 1.
  - Weg: nach D2 wird L1 billiger, dann d1 ≥ 57 m, sobald L1 ≤ 35 % von L0 an Dreiecken hält.
- **Volumetrische Wolken** (1,1–2,0 ms bei halber Auflösung): erst wenn nach D5 und D8 auf der Radeon ≥ 2 ms Luft stehen.

**Mess- und Bau-Risiken:**
- **D2:** Die Kosten eines `drawIndexedIndirect` in Dawn sind ungemessen (angenommen ≤ 3 µs). Falls `indirect-first-instance` fehlt, teilen sich die Listen auf mehrere Render-Objekte, und der CPU-Gewinn halbiert sich. Der Spike entscheidet.
- **WebGL2 (gate:webgl-probe):** Entscheid: dieselbe TSL-Wahl läuft über r184s Transform-Feedback-Compute, unsichtbare Instanzen kollabieren im Vertex, der Rückfall ist LAUT. Kein CPU-Zwilling.
- **Zähl-Wahrheit:** Bei indirekten Zügen bucht r184 `info` aus CPU-Werten. Ohne einen mapAsync-Leser der Args ist E nicht beweisbar; darum kommt die Linse zuerst.
- **Radeon-VRAM** (113,7 MB, also 4,3 MB Rand):
  - D1 muss ≥ −8 MB bringen, damit D5 und D7 zugleich an Genesis tragen.
  - Sonst schrumpft der Cache auf 4 Stufen (6,3 MB) oder wird im Compute BC-komprimiert (7,9 → 2 MB).
  - Warum die Radeon 7,6 MB über der GTX liegt, ist ungeklärt; Messname `werkbank puffer`.
- **Studio unter Byte-Beweis** bei D3 (`ATMO_GESETZ`, phytogenesis), D4 (Attribut, fachwerk) und D8 (porta): Das Neu-Münzen der Goldens ist ein Vertrags-Akt (gate:asset-contract 128/128).
- **Schätzungen:** Alle GPU-Zahlen sind Hochrechnungen. Richter ist die gpu-bank am OMEN (gleiche Szene oder ≥ 4 Boots je Seite) und das Radeon-ABAB am Kopf, das noch aussteht.
- **E gehend:** Zählt das ABAB auch gehend (die Merge-Regel misst es mit), dann liegt der CPU-Takt p95 dort bei 14,8–16 ms, also 2,6-fach über dem Band. E trägt dann erst nach D6 und D2.
- **Überzeichnung je Klasse ist ungemessen.** Der Prepass bzw. Visibility-Buffer ist darum keine Karte: Erst misst ein Fragment-Zähler (atomicAdd) nach dem Hi-Z aus D2. Ein Visibility-Buffer verliert bei hoher Instanzzahl (cinevva: 5,44 → 7,80 ms bei 200k Karten).
- **B (Ankunft) liegt bei K60-2.** Fernes Gelände als GPU-Clipmap (Asirvatham & Hoppe 2005, kamera-relativ nach Lehre 17) ist der B-Hebel nach dessen Termen.

**Quellen:**
- Haar & Aaltonen, „GPU-Driven Rendering Pipelines“, SIGGRAPH 2015
- Wihlidal, GDC 2016
- toji.dev, indirect-draws und render-bundles
- Hillaire, CGF 39(4), 2020; AirGuanZ/AtmosphereRenderer (GTX 1060: 0,036 / 0,03 ms)
- Wohllaib, „Procedural Grass in Ghost of Tsushima“, GDC 2021
- Chen, „Adaptive Virtual Texture Rendering in Far Cry 4“, GDC 2015
- McGuire & Mara, JCGT 3(4), 2014
- Lagarde & Zanuttini, SIGGRAPH 2012
- Monsi & Saeki 1953
- Liu & Jordan 1960
- Kapoulkine, meshoptimizer 2025

## Karten

### D1 — Ausgabe und Speicher frei: Ping-Pong der Geschichte, Vertex-Quantisierung, Panorama 16 Bit (E (VRAM Radeon, GPU Radeon) – Budget, R2)
- Technik: TRAA-Geschichte als Ping-Pong statt copyTextureToTexture (stamm/25c.js:203) · Vertex-Quantisierung der Foundry-Gestalten am EINEN Upload (Position snorm16 im festen Rahmen ±64 m = 2 mm, Normale snorm8, UV unorm16; Präzedenz Sätze 17b.js:705-709) · feld-pass-panorama rgba32float → rgba16float
- Soll: VRAM Genesis Third −5 MB oder mehr (GTX 106,1 → ≤ 101; Radeon 113,7 → ≤ 108,7; Ziel −8 MB) · zerlegen-Posten traa −0,2 ms (GTX) · Bild der Geschichte byte-gleich bei eingefrorener Welt · Positionsfehler ≤ 2 mm · Befehle ±0
- Budget: frei: VRAM −5…−9 MB (Quantisierung −4…−8, Panorama −0,94), GPU −0,23…−0,29 ms GTX (Radeon −0,35…−0,55); kostet: 0 Befehle, 0 Dreiecke, 0 ms CPU
- Spike: Radeon, EINE Welt (werkbank methode): die Positionen der Klasse baum quantisieren, `werkbank puffer --top` vorher/nachher an Genesis Third. Ist der Vertex-Anteil der Puffer ≥ 50 % (Genesis 27,1 MB in 932 Puffern), trägt die Quantisierung ≥ 4 MB → Bau. Zweitens Ping-Pong per Methoden-Tausch; Bild-Diff 0 und `zerlegen --nur traa` −0,2 ms entscheiden.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `ausgabe-speicher` vom Kopf von integ-probe, Ports 8580–8599.

ZIEL: Budget für E freimachen, ohne ein Pixel zu ändern.
- VRAM Radeon Genesis Third: 113,7 von 118 MB.
- GPU Radeon Genesis: 17,8 > 16,7 ms (Stand 14.10.).

SCHNITT 1 — Ping-Pong der Geschichte.
- `ZeitAufloesung` (stamm/25c.js:130–305) schreibt den Resolve in das Ziel, das im nächsten Frame die Geschichte ist.
- `r.copyTextureToTexture(this._resolveRenderTarget.texture, g.texture)` (25c.js:203) fällt.
- Die Texturknoten von Geschichte und Resolve tauschen ihren value je Frame.
- Achtung: rg11b10 für die Geschichte ist verworfen (25c.js:311–312, Wolken posterisiert). VRAM bleibt hier gleich, der Gewinn ist die Kopie.
- Beweis: byte-gleiches Bild nach 32 Frames bei eingefrorener Welt (scripts/lib/ausgabe-aufnahme.cjs, feste Uhr). Dieselbe Mathematik muss dieselben Bytes liefern.
- K68 hat das Anlaufen der Geschichte angefasst: bei Konflikt seinen Block übernehmen, nicht doppeln.

SCHNITT 2 — Vertex-Quantisierung der Foundry-Gestalten am EINEN Upload.
- Position snorm16 in EINEM festen Rahmen ±64 m (2 mm), eine Konstante je Programm, keine Uniform je Geometrie (sonst zahlt die CPU je Objekt).
- Normale snorm8, UV unorm16. Präzedenz: die Sätze (17b.js:705–709).
- Lies zuerst scripts/diag-asset-contract.cjs:
  - Hasht der Golden die Kern-Ausgabe, quantisiert die Brücke (foundry-bruecke.js) NACH dem Kern. Der Transfer halbiert sich mit, und die 128 Goldens bleiben byte-gleich.
  - Sonst ist es ein Vertrags-Akt: im Commit begründen.
- Der positionNode rechnet in r184 VOR der Instanz-Matrix (Lehre 22). Wind, Blende und Blick lesen weiter die EINE Naht `_weltNaht`.

SCHNITT 3 — Panorama auf 16 Bit.
- feld-pass-panorama von rgba32float auf rgba16float.
- Maß: relative Panorama-Differenz ≤ 1/1024.

LINSE VORHER ROT in der Familie gate:profiband / `werkbank puffer`, mit Selbsttest und ≤ 3 min CI. Sie nennt den Täter beim Namen:
- Posten `vertexBytes` je Gestalt, Soll ≤ 16 B/Vertex (heute 32).
- Posten `kopie:traa` = 0 je Frame.
- Posten `positionsFehler` ≤ 2 mm (Byte-Diff dequantisiert gegen float über alle Gestalten einer Sitzung).
- Konsum-Leser: gate:profiband.

MESSEN:
- `werkbank puffer` und `werkbank zaehlen` an Genesis Third und Wiese Ego, vorher/nachher (Radeon lokal, `werkbank --echt`).
- `werkbank zerlegen --nur traa,post`.
- GPU-Zeit misst der OMEN: gpu-bank ABAB Genesis, Auftrag an `koordination`.
- Bild-Paar vorher↔nachher aus dem Ausgabe-Pfad (Armlänge + 30 m): Geschichte byte-gleich, Quantisierung ≤ Rausch-Boden.

SOLL:
- VRAM Genesis Third −5 MB oder mehr (Ziel −8 MB).
- traa −0,2 ms.
- Befehle ±0.

NICHT hier: die Bloom-Mip-Kette (+6 Züge, ≈ +0,15 ms CPU gegen die E-Wand) kommt erst nach D2.

LOKAL:
- Stamm nur über scripts/lib/stamm.cjs, danach `diag-atlas --check` und `npm run stamm:lint`.
- Puls der berührten Methoden, `playtest:fast`, `npm run check`.
- Exit-Codes explizit (`echo EXIT=$?`).

COMMIT: deutsch, emoji-frei, Rumpf ≤ 600 Zeichen, die Zahl (MB, ms) drin, keine Siegel-Wörter. Seriell committen.

Bericht = Zwischenstand: Geschnitten · Gemessen (Zahl) · ehrlich offen.

### D2 — Die GPU wählt: Compute-Wahl mit drawIndexedIndirect, EIN Render-Objekt je Programm und Pass (E CPU-Takt (alle Klassen; Voraussetzung für D9), R3)
- Technik: Zähl-Linse (Args per mapAsync) · Geometrie-Pool je Vertex-Form (verallgemeinerter `_satzPacke` 17b.js:731) · EIN TSL-Compute je Pass (haupt, k0, k1): Frustum, Stufe aus `_lodAuge`, Hi-Z aus dem Tiefen-Abbild des Vorframes, Horizont → instanceCount und kompakte Liste in EINEM IndirectStorageBufferAttribute · `geometry.setIndirect(args, offsets[])`, r184 setzt je Offset drawIndexedIndirect ab (vendor/three.webgpu.min.js, Zweig getIndirect) · die JS-Wahlen fallen
- Soll: CPU-Takt p95 GTX ≤ 5,0 ms an Wiese und Genesis × Ego und Third (heute 5,7/6,1/5,5/6,5, K55 B) · Steigung render-EWMA je Zug ≤ 3 µs (heute 25 µs) · Bündel-Neuaufnahmen gehend 0 je Frame (heute ~0,8) · Render-Objekte Genesis Third ≤ 50 (heute ≈ 115 Befehle im Mittel) · Compute ≤ 0,1 ms je Pass
- Budget: frei: CPU −0,7 (Wiese Ego) … −1,55 ms (Genesis Third), Dreiecke −5…−15 % durch Hi-Z und Horizont (Schätzung); kostet: GPU +0,05…+0,1 ms je Pass (≤ 0,3 ms), VRAM +1,5…+2,5 MB (Args, Listen, Hi-Z 720×405 r32f mit Mips), Befehle ±0 (indirekte Züge bleiben Züge)
- Spike: Die Klasse baum an der Mess-Wiese (33–35 Befehle) als EIN Render-Objekt über einem Pool, setIndirect(offsets[]), die Instanz-Zahl noch von der CPU in die Args geschrieben; render-EWMA-Steigung je indirektem Zug auf der Radeon (lokal) und der GTX (OMEN). ≤ 5 µs → Bau; > 12 µs → die Karte fällt offen mit der Zahl. Dazu `indirect-first-instance` in adapter.features beider Geräte.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `gpu-wahl` vom Kopf von integ-probe, Ports 8600–8619.

ZIEL: E reißt am CPU-Takt: p95 5,5–6,5 gegen 5,8 ms (GTX, bericht/1510-k55-abab.md), am 14.10. 6,0–7,8.
- Der Render-Pfad kostet ≈ 0,8 ms + 25 µs je Befehl, weil r184 je Objekt projiziert, bindet und zeichnet.
- Die Wahl je Instanz läuft in JS: `_instanzWahlPass` (stamm/25c.js:1760–1800) mit Slot-Tausch.
- Jeder Wechsel der Zahl nimmt das Bündel neu auf (`_archMeshBundleTouch`, 25c.js:1797), etwa 0,8-mal je gehendem Frame (17b.js:278).

SCHRITT 1 — ZÄHL-LINSE ZUERST, sonst ist nichts beweisbar.
- Mit indirekten Zügen bucht r184 `info` aus CPU-Werten.
- Baue in der Familie gate:profiband einen Leser, der die Args per mapAsync zurückholt (1–2 Frames alt).
- Er zählt Render-Objekte (CPU) getrennt von Zügen und Dreiecken (GPU); `werkbank zaehlen` zeigt beides.
- Dazu die Probe „Steigung render-EWMA je Zug ≤ 3 µs“, heute ROT mit 25 µs. Selbsttest, ≤ 3 min CI, benannter Konsum-Leser.

SCHRITT 2 — SPIKE (Stunden).
- Die Klasse baum an der Mess-Wiese als EIN Render-Objekt über einem Geometrie-Pool.
- `geometry.setIndirect(IndirectStorageBufferAttribute, offsets[])`; die Instanz-Zahl schreibt noch die CPU in die Args.
- Messen auf der Radeon (`werkbank --echt`) und der GTX (OMEN-Auftrag an `koordination`).
- Entscheid: ≤ 5 µs je Zug → Bau. > 12 µs → die Karte fällt offen mit der Zahl.
- `indirect-first-instance` beider Geräte prüfen. Ohne dieses Feature teilen sich die Listen auf Render-Objekte; das im Bericht beziffern.

SCHRITT 3 — BAU.
- Geometrie-Pool je Vertex-Form: `_satzPacke` (17b.js:731) wird verallgemeinert, je (Gestalt × Stufe) ein Bereich (firstIndex, baseVertex).
- EIN Compute je Pass (haupt, k0, k1) im Haken von `_passSicht` (25c.js:1287). Er prüft:
  - Frustum je Pass bzw. Kaskade;
  - Stufe aus `_lodAuge`;
  - Hi-Z aus dem Tiefen-Abbild des Vorframes (`_tiefenAbbild`, 11b.js:2006 → Mip-Kette per textureStore);
  - Horizont.
- Er schreibt instanceCount und eine kompakte Liste in EINEN Puffer mit Offset je (Gestalt × Stufe).
- 20c.js:1413 liest `element(liste.element(instanceIndex))`. Die Fassade (20c.js:1360–1361) trägt setIndirect statt instanceCount.

WAS FÄLLT, in DERSELBEN Welle (kein CPU-Zwilling):
- `_instanzWahlPass` mit Slot-Tausch;
- die Bündel-Neuaufnahme bei Zahl-Wechsel;
- die JS-Sicht je Büschel (11c.js:310–365), soweit die Senke mitfährt.

WEBGL2 (gate:webgl-probe): dieselbe TSL-Wahl über r184s Transform-Feedback-Compute. Unsichtbare Instanzen kollabieren im Vertex. Der Rückfall ist LAUT; W3 erweitern.

ZEITSTEMPEL: `_perfGpuSample` liest auch 'compute'.

SOLL:
- CPU-Takt p95 GTX ≤ 5,0 ms an Wiese und Genesis, Ego und Third.
- Steigung ≤ 3 µs.
- Neuaufnahmen gehend 0.
- Render-Objekte Genesis Third ≤ 50.
- Compute ≤ 0,1 ms je Pass.
- Bild-Paar ≤ Rausch-Boden (Ausgabe-Pfad, scripts/lib/ausgabe-aufnahme.cjs, Armlänge + 10/30/80 m).
- Kosten vorher/nachher: `werkbank zaehlen`, `werkbank puffer`, `band --ort wiese|genesis`.

BEWEIS: OMEN-ABAB stehend UND gehend gegen integ-probe.

K62 (render-objekt, je Objekt billiger) addiert sich: nicht warten, nicht doppeln.

LOKAL:
- Stamm nur über scripts/lib/stamm.cjs, danach `diag-atlas --check` und `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`; Exit-Codes explizit.

COMMIT: deutsch, Zahl im Rumpf (≤ 600 Zeichen), seriell, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D3 — EIN Licht aus EINER Atmosphäre: Hillaire-LUTs, Umgebung aus dem Himmel, die Licht-Kette als Eichung (himmel-licht (0,166, Anteil 1); haus (Albedo Labor = Welt); Buntheit aller Vegetation; Ferne > 200 m, R3)
- Technik: Daten `ATMO_GESETZ` additiv in foundry-core (Rayleigh-β, Mie-β/g, Ozon, Skalenhöhen, Erdradius) · TSL-Compute: Transmittance 256×64 und Mehrfachstreuung 32² einmal, Sky-View 192×108 je `_sonnenStufe`, Luftperspektive 32³ je Kamera-Sprung, in storageTextures · Sonne aus T, Himmel aus Sky-View (die HIMMEL_GESETZ-Wolken bleiben, beleuchtet aus der LUT), Umgebung = pmremTexture aus Sky-View, Luft aus Luftperspektive · die vier alten Näherungen fallen in Welt und Studio · Tonkurve und Albedo-Eichung gemessen getrennt
- Soll: lichtVerhaeltnis 4,226 → [5; 12,5] (Tafel) · schattenAnteil (Bodenschatten/besonnte Wiese, Mittag) 0,237 → [0,08; 0,20] · C*ab Vegetation 41–47 → ≤ 30 · haus albedoVerhaeltnis 0,529 → [0,9; 1,1] · Umgebung azimut-abhängig: E_umgebung Gegenlicht/Mitlicht ≥ 1,2 · neue Klasse `ferne` mit Maß
- Budget: kostet: GPU +0,05…+0,1 ms (GTX: Sky-View 0,036 ms, Luftperspektive 0,03 ms bei 64² bzw. 64²×32, AirGuanZ), VRAM +0,6…+0,8 MB, Befehle ±0 (Compute nur bei Änderung, die Kuppel bleibt EIN Zug); frei: das CPU-Malen der Umgebung (05b.js:2795–2910, je ≤ 6 s) fällt
- Spike: Radeon, EINE Welt (werkbank methode): Transmittance und Sky-View als TSL-Compute, Sonne und Umgebung daraus, Mittag; `werkbank licht --ist himmel-licht` → E_alle/E_umgebung. ≥ 5 bei unveränderter Belichtung → Bau. Zweite Zahl an derselben Pose: C*ab der Vegetation mit ACES gegen AgX bzw. Neutral (trennt Kurve und Albedo).
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `eine-atmosphaere` vom Kopf von integ-probe, Ports 8620–8639.

ZIEL himmel-licht (Wirkung 0,166, jedes Pixel). Heute stehen vier Näherungen nebeneinander:
- CPU-Beer-Lambert der Sonne: `_atmosphere`, stamm/24.js:331;
- Nebula-Kuppel: 05b.js:1963–2060;
- Koschmieder-Luft: 24.js:986–1030;
- CPU-gemalte Umgebung 128×64, azimut-konstant: 05b.js:2795–2910.

Ihr Verhältnis ist getunt, nicht gerechnet: E Himmel 2,26 gegen E Sonne 7,29, also Schatten bei 23,7 % der Besonnung. Real sind es am klaren Mittag 8–20 % (Liu & Jordan 1960).

SPIKE (Stunden), Radeon, EINE Welt: Transmittance und Sky-View per `werkbank methode`, Sonne und Umgebung daraus. Dann `werkbank licht --ist himmel-licht` am Mittag. Ergebnis ≥ 5 → Bau.

SCHNITT — EIN Atmosphären-Gesetz nach Hillaire (CGF 39(4), 2020).
- Daten `ATMO_GESETZ` additiv in foundry-core.js neben HIMMEL_GESETZ (Z. 114): Rayleigh-β, Mie-β/g, Ozon, Skalenhöhen, Erdradius.
- TSL-Compute in storageTextures:
  - Transmittance 256×64 und Mehrfachstreuung 32²: einmal;
  - Sky-View 192×108: je `_sonnenStufe`;
  - Luftperspektive 32³: je Kamera-Sprung.
- Leser:
  - Sonnenfarbe und -stärke = Transmittance;
  - Himmel = Sky-View; die Wolkenebene nach HIMMEL_GESETZ bleibt, beleuchtet aus der LUT;
  - Umgebung = `pmremTexture` aus der Sky-View;
  - Luft = Luftperspektive;
  - Wasser (`_wasserBlick`, 11b.js:2173) liest dieselbe Umgebung.
- Kosten an Änderung (Gebot 7).

WAS FÄLLT, in DERSELBEN Welle: die vier alten Näherungen (Def + Maschine + Spiegel + Tests + Doku, Lehre 3).
- Auch im Studio phytogenesis, denn `_atmosphere` ist sein byte-treuer Port: Labor = Welt.
- Studio-Code nur unter Byte-Beweis. Das Neu-Münzen der Goldens ist ein Vertrags-Akt mit Begründung (gate:asset-contract).

TEIL 2 — DIE EICHUNG (Lehre 21).
- C*ab der Vegetation 41–47 gegen real 27–28: ACES-Filmic (25a.js:1166) an derselben Pose gegen AgX bzw. Neutral messen. Den Anteil von Kurve und Albedo als Zahl ausweisen, dann EIN Schnitt.
- haus albedoVerhaeltnis 0,529 (Labor 0,084 gegen Welt 0,159): die Wurzel per `werkbank albedo --tafel` in der Farb- und Licht-Kette lesen und schneiden.

LINSE VORHER ROT in K5 (scripts/lib/abnahme-urteil.cjs `klassenMasse`), mit Selbsttest:
- neue Maße `schattenAnteil` (Band [0,08; 0,20]) und `umgebungAzimut` (≥ 1,2);
- ein Maß für die Klasse `ferne` (detail > 200 m; real 0,185, heute 0,030);
- Absenz-Grep über `window.__codeOf`: kein Leser der alten vier.

MESSEN:
- `werkbank licht` vorher/nachher.
- Bild-Paare aus dem Ausgabe-Pfad: Mittag, Abend, Gegenlicht; Wiese, Genesis, Dorf.
- `werkbank zaehlen`, `werkbank puffer`.
- GPU misst der OMEN (gpu-bank).

SOLL:
- lichtVerhaeltnis in [5; 12,5];
- schattenAnteil 0,08–0,20;
- C*ab ≤ 30;
- haus [0,9; 1,1];
- GPU ≤ +0,1 ms, VRAM ≤ +0,8 MB, Befehle ±0.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`.
- Kerne nie mit `prettier --write`.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D4 — Verdeckung als Funktion: Himmels-Sicht jeder Gestalt aus dem Gesetz, Kronen-Innen, Kontaktschatten (laub (detail, kontrast), himmel-licht (Lücken 2 und 3), boden-nah (Halmfuß), haus (Traufe, Laibung, Sockel), R2)
- Technik: EIN Leser `_himmelsSicht` als aoNode jedes Welt-Stoffs (`_buildPbrNodeMaterial` 10.js:328, `_foundryMaterial`), heute nur Boden (10.js:921) · gespeist aus dem Gesetz als EIN unorm8-Attribut je Vertex: Krone V = exp(−G·LAD·d) mit d aus Anker und Kronenradius (phyto-core), Halm V = exp(−0,5·LAI·(1−h)), Haus aus fachwerk-core (Laibung, Traufe, Sockel) · dasselbe d dämpft das direkte Licht im Kroneninneren · die L2-Karte backt es ein · Kontaktschatten: 8-Schritt-Strahl zur Sonne gegen das reprojizierte Tiefen-Abbild des Vorframes im EINEN Schatten-Term
- Soll: laub detail ≥ 0,25 (heute L2 0,058, Nadel-L1 0,073–0,127; Buche real 0,32–0,42) und kontrast ≥ 0,6 (0,43–0,63) an der Tafel-Pose, 10/30/80 m · Bodenschatten unter geschlossener Krone ≤ 10 % der besonnten Wiese · Kontakt: Luma-Abfall ≥ 30 % in ≤ 0,1 m an Steinfuß, Spielerfuß und Laibung
- Budget: kostet: 0 Dreiecke, 0 Befehle, VRAM +0,3…+0,6 MB (1 B je Vertex), GPU Krone ≈ 0, Kontakt +0,2…+0,4 ms (Schätzung, OMEN misst); bezahlt aus D1
- Spike: Radeon, Tafel-Pose von K68, EINE Welt: aoNode der Laub-Stoffe = exp(−k·(R − |p − c|)) aus positionGeometry und der Begrenzungskugel der Gestalt als Uniform, direktes Licht × derselbe Term; `werkbank bild --klasse laub` detail/kontrast vorher/nachher. kontrast ≥ 0,6 und detail ≥ 0,2 → Bau mit gebackenem Attribut; sonst trägt die Kugel die Krone nicht, und das Gesetz liefert die Hülle je Blatt.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `verdeckung-gesetz` vom Kopf von integ-probe, ERST NACH dem Merge von K68 (laub-volumen: `_kronenNormalenAuf`, `_laubStoffNormale`, `_laubKante`). Ports 8640–8659.

ZIEL: Das Innere ist dunkel, wo das Gesetz es weiß.
- Heute sieht nur der Boden den Himmel verdeckt (`mat.aoNode`, stamm/10.js:921).
- Krone, Halm, Wand und Stamm bekommen im Schatten den vollen Himmel.
- Die Kaskade (Texel 0,17/0,47 m, 26c.js:1443) löst weder Kronen-Selbstschatten noch Kontakt unter 0,35 m.
- Gemessen: laub detail L2 0,058, kontrast 0,43–0,63.

SPIKE (Stunden), Radeon, Tafel-Pose von K68:
- aoNode = exp(−k·(R − |p − c|)) aus positionGeometry und der Begrenzungskugel als Uniform.
- `werkbank bild --klasse laub` vorher/nachher.
- kontrast ≥ 0,6 und detail ≥ 0,2 → Bau.

SCHNITT:
- EIN Leser `_himmelsSicht` als aoNode JEDES Welt-Stoffs, im Chokepoint `_buildPbrNodeMaterial` (10.js:328) und `_foundryMaterial`.
- Gespeist aus dem Gesetz je Gestalt als EIN unorm8-Attribut (Kosten ins Asset, Lehre 19; die Welt liest Vertex-Daten):
  - Krone: phyto-core rechnet je Blatt die Tiefe d unter der Kronen-Hülle aus Anker und Kronenradius. V = exp(−G·LAD·d) (Monsi & Saeki 1953).
  - Halm: V = exp(−0,5·LAI·(1−h)), 43 % am Fuß bei LAI 1,7. Damit trägt D9 den Halmfuß.
  - Haus: fachwerk-core für Laibung, Traufe und Sockel.
  - Boden: wie heute.
- Dasselbe d dämpft das direkte Licht im Kroneninneren, im EINEN Schatten-Term.
- Der Bäcker der L2-Karte liest das Attribut, damit Karte = Gestalt.
- Kontaktschatten:
  - 8 Schritte, ≤ 0,5 m, zur Sonne gegen das Tiefen-Abbild des Vorframes;
  - reprojiziert mit `_traaReprojektion`, im EINEN Schatten-Term;
  - 0 Befehle.
- Studio-Gestalten unter Byte-Beweis: Das neue Attribut ist ein Vertrags-Akt (gate:asset-contract neu gemünzt, Begründung im Commit). Labor = Welt: das Labor liest dasselbe Attribut.

LINSE VORHER ROT in K5 (`klassenMasse`), mit Selbsttest und ≤ 3 min CI:
- Maße `kronenInnen` (Bodenschatten unter Krone / besonnt) und `kontaktAbfall`.
- Absenz-Linse über die Laufzeit-Marke: jeder Welt-Stoff trägt sein aoNode aus `_himmelsSicht`; ein Täter ohne wird beim Namen genannt.
- Konsum-Leser: die Tafel.

MESSEN:
- Bild-Paare aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs): Armlänge, 10/30/80 m, von unten.
- `werkbank zaehlen`, `werkbank puffer`.
- GPU misst der OMEN (gpu-bank Wiese).

SOLL:
- laub detail ≥ 0,25 und kontrast ≥ 0,6.
- kronenInnen ≤ 0,10.
- Kontakt ≥ 30 % Abfall in ≤ 0,1 m.
- 0 Dreiecke, 0 Befehle, VRAM ≤ +0,6 MB, GPU ≤ +0,4 ms.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`, gate:pflanzen-nah.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D5 — Der Boden als Cache seiner Funktion: Runtime-Virtual-Texture-Clipmap im Compute (E GPU (Boden = teuerste Klasse), boden-nah (Stoff), fels, Wege, R3)
- Technik: Clipmap in Welt-XZ, 5 Stufen × 512² (2/4/8/16/32 cm bis 160 m), Albedo und Rauheit rgba8, Normale rg8 · EIN TSL-Compute rechnet DASSELBE Boden-Gesetz (gelaende-core WGSL, `_felsRechenwerkTSL` 10.js:1434–1439) je Texel nur für den Rand bei Bewegung und für Edits (`_voxelEditKarte`) · Steilflächen und Höhlen rufen dieselbe Funktion direkt · die Wege-Karte geht im Cache auf · das freie Budget je Texel trägt Fein-Relief, Fels-Schichtung, nassen Saum und den Boden in Halmfarbe
- Soll: gpu-bank Genesis GTX −2,0 ms oder mehr (Boden ~3,1 von 12,7–13,3), Radeon −3,0 ms · Boden detail Genesis-Platz 0,023 → ≥ 0,15 (real 0,32) · fels detail ≥ 0,10 und kontrast ≥ 0,25 aus 30–60 m (0,025–0,029 / 0,09–0,16) · Cache = Gesetz ≤ 2/255 an 1 000 Proben · VRAM netto ≤ +4 MB · Bake ≤ 0,2 ms je Frame gehend
- Budget: frei: GPU −2,2…−2,5 ms Genesis / −0,8…−0,9 ms Wiese (GTX; Radeon ×1,45–1,9), VRAM −4,0 MB (Wege-Karte 2 × rg8 1024²), CPU: das Wege-Malen (17c.js:1315) fällt; kostet: VRAM +7,9 MB (netto +3,9), Compute ≤ 0,2 ms gehend, Befehle ±0
- Spike: Verfahren 1110-7: `werkbank methode _buildPbrNodeMaterial --terrain` mit konstanter Albedo in EINER Welt, gpu-bank Genesis und Wiese (Radeon lokal, GTX am OMEN). Prozedur-Anteil des Boden-Fragments ≥ 50 % → Bau; < 30 % → die Karte fällt offen mit der Zahl (dann kostet Raster/Überzeichnung, und D2s Hi-Z trägt).
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `boden-cache` vom Kopf von integ-probe, NACH D1 (VRAM-Rand Radeon 4,3 MB). Ports 8660–8679.

ZIEL: Der Boden ist die teuerste Klasse: GTX ~3,1 ms an Genesis und ~1,15 ms an der Wiese, Radeon ×1,45–1,9.
- Jedes Pixel rechnet in jedem Frame das Boden-Gesetz neu: gelaende-core.js:2201, 96–150k Zeichen WGSL; `_felsRechenwerkTSL`, stamm/10.js:1434–1439.
- Der Boden ändert sich dabei nicht. Das verletzt Gebot 7.

SPIKE ZUERST (Verfahren 1110-7):
- `werkbank methode _buildPbrNodeMaterial --terrain` mit konstanter Albedo in EINER Welt.
- gpu-bank Genesis und Wiese (Radeon lokal, GTX per OMEN-Auftrag an `koordination`).
- Prozedur-Anteil ≥ 50 % → Bau. < 30 % → die Karte fällt offen mit der Zahl.

SCHNITT — Runtime-Virtual-Texture-Clipmap in Welt-XZ (Chen, GDC 2015):
- 5 Stufen × 512² (2/4/8/16/32 cm, bis 160 m): Albedo und Rauheit rgba8, Normale rg8; 7,9 MB.
- EIN TSL-Compute rechnet DASSELBE Gesetz je Texel, nur für den Rand bei Bewegung und für Edits (`_voxelEditKarte`).
- Der Boden-Stoff liest den Cache.
- Steilflächen (|n.y| < 0,5) und Höhlen rufen dieselbe WGSL-Funktion direkt: EIN Gesetz, zwei Abtastorte.
- Die Halm-Schalen bleiben im Fragment, weil sie vom Blick abhängen.

WAS FÄLLT, in DERSELBEN Welle: die Wege-Karte (CPU-Malen `_wegeKarteMale`, 17c.js:1315; 2 × rg8 1024² = 4 MB). Sie geht im Cache auf, EINE Quelle.

DAS FREIE BUDGET JE TEXEL (10–50×) trägt:
- Fein-Relief unter 1,8 m als Normale aus feineren Oktaven. Nach Lehre 22 ändert der Cache nur die Schattierung; Körper stehen weiter auf dem Gesetz, die Form trägt das Mesh, `_bodenSichtAt` bleibt.
- Fels-Schichtung und Klüfte.
- Nasser Saum aus der Wasser-Wahrheit `_werkBoden` (D7 liest ihn).
- Den Boden unter der Wiese in Halmfarbe mit Eigenschatten („der Boden ist nie frei“; D9 liest ihn).

LINSE VORHER ROT, mit Selbsttest, ≤ 3 min CI und benanntem Konsum-Leser:
- K5 neues Maß `bodenStoff`: detail Genesis-Platz, heute 0,023.
- Fels detail und kontrast aus 30–60 m.
- Linse `cacheGesetz`: Cache gegen direkte Abtastung an 1 000 Proben, ≤ 2/255.
- gate:profiband-Posten Boden-GPU.

MESSEN:
- Bild-Paare aus dem Ausgabe-Pfad (Armlänge, 10/30/80 m, Hang), Genesis-Platz und Wiese.
- `werkbank zaehlen`, `werkbank puffer`.
- Compute-Zeitstempel.
- GPU-Zeit misst der OMEN: gpu-bank ABAB, gleiche Szene oder ≥ 4 Boots je Seite.

SOLL:
- Genesis GTX −2,0 ms oder mehr, Radeon −3,0 ms.
- Boden detail ≥ 0,15.
- fels detail ≥ 0,10, kontrast ≥ 0,25.
- VRAM netto ≤ +4 MB.
- Befehle ±0.

AUSWEG, falls die Radeon über 118 MB geht: 4 Stufen (6,3 MB) oder BC-Kompression im Compute. Mit Zahl entscheiden.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Worker-Spiegel bit-identisch (`gate:worker-dichte`).
- Puls, `playtest:fast`, `npm run check`.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D6 — Der gehende Takt: die Folge-Kette jedes Chunks im Voxel-Faden (E CPU gehend, Dorf-Einströmen, Voraussetzung jeder Dichte, R3)
- Technik: Die deterministische Folge-Arbeit rechnet der voxel-worker zusammen mit dem Chunk (Gesetz bit-identisch nach Lehre 7, Ergebnis per Transfer nach Lehre 24, Γ5-Seed-Streams): Sichthöhen (`_lodTreeVisHeight`, `_foundrySichtHoehe`), Freistand (`_forestStehtFrei`), Wald-Darts (`_forestCellDarts`, soweit K60-2/K69 sie nicht schon tragen), `_bodenKarteAusMesh`; das Einsetzen des Chunks (`_finalizeVoxelChunkBuild`, `_rebuildVoxelChunk`, `_completeVoxelRebuild`) schrumpft auf das, was Szene-Objekte anfasst
- Soll: Haupt-Faden-Selbstzeit der Folge-Kette gehend ≤ 1 ms je Frame (heute 9,4 ms von loop 20,0, bericht/1410-boden2-abab.md) · CPU p50 gehend Wiese 10,4 → ≤ 5 ms · Frame p95 gehend 25,0 → ≤ 16,7 ms · Dorfweg beim Einströmen 41,6 → ≤ 25 ms · Bäume und Freistand byte-gleich (Plan-Hash)
- Budget: frei: CPU −5…−8 ms je gehendem Frame; kostet: Worker-Zeit (nicht im Haupt-Faden), Transfer ~KB je Chunk, 0 GPU, 0 VRAM, 0 Befehle
- Spike: Einström-Profil an der Mess-Wiese gehend am Kopf nach K60-2 und K69 (werkbank takt/profil, Radeon) → Selbstzeit je Term; dann die Sichthöhen per werkbank methode in den Worker. Haupt-Faden −1,2 ms oder mehr bei byte-gleichen Sichthöhen → Bau der Klasse.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `gehender-takt` vom Kopf von integ-probe, ERST NACH dem Merge von K60-2 (ankunft-kalt-2) und K69 (dorf-einstroemen). Ports 8680–8699.

ZIEL: Gehend trägt der Haupt-Faden die Folge-Arbeit jedes Chunks.
- loop 20,0 ms, davon `_loopVoxelStreaming`/`_runFrameScheduler` 9,4 ms (bericht/1410-boden2-abab.md, Einström-Profil).
- CPU p50 gehend 10,4 gegen 3,8 im Stand; Frame p95 gehend 25,0.
- Dorfweg beim Einströmen: 41,6 ms (bericht/1510-k10-abab.md).
- Jede Dichte (Wald, Dorf, Gras) wächst dort linear.

ERST LESEN: was K60-2 (Wald-Darts unter dem Ladeschirm, Lade-Takt) und K69 (`_forestDartsFallen`, `_erdbauSetzen` in seiner Reichweite) schon geschnitten haben. Kein Term doppelt, keine zweite Wahrheit.

SPIKE:
- Einström-Profil an der Mess-Wiese gehend am Kopf (`werkbank takt`, `werkbank profil`, Radeon): Selbstzeit je Term.
- Dann die Sichthöhen per `werkbank methode` in den Worker.
- Haupt-Faden −1,2 ms oder mehr bei byte-gleichen Sichthöhen → Bau.

SCHNITT — die KLASSE in EINER Welle. Die deterministische Folge-Kette rechnet der voxel-worker zusammen mit dem Chunk:
- Sichthöhen (`_lodTreeVisHeight`, `_foundrySichtHoehe`, ≈ 1,5 ms);
- Freistand (`_forestStehtFrei`, 0,5–2,3 ms);
- Wald-Darts (`_forestCellDarts`, 0,9 ms), falls noch im Haupt-Faden;
- `_bodenKarteAusMesh` (0,16 ms).

Das Einsetzen des Chunks (`_finalizeVoxelChunkBuild`, `_rebuildVoxelChunk`, `_completeVoxelRebuild`, ≈ 1,0 ms) schrumpft auf den Teil, der Szene-Objekte anfasst.

REGELN DES WORKERS:
- Gesetz bit-identisch (Lehre 7): Sheet und Density in BEIDE, diag-worker-watersheet maxDiff 0, gate:worker-dichte.
- Substanz aus Γ5-Seed-Streams.
- Ergebnisse per Transfer, nie als Klon (Lehre 24).
- Jede versionierte Datei trägt `?v=` (Lehre 10).

LINSE VORHER ROT in gate:takt (scripts/diag-takt.cjs, neue Phase), mit Selbsttest und ≤ 3 min CI:
- Haupt-Faden-Selbstzeit der Folge-Kette gehend ≤ 1 ms je Frame, heute 9,4.
- Täter beim Methoden-Namen.

BYTE-BEWEIS: Bäume, Freistand und Sichthöhen gleich (Plan-Hash, gate:settlement Teil O bleibt grün).

MESSEN:
- Radeon lokal gehend.
- OMEN-ABAB gehend und stehend an Wiese, Genesis und Dorfweg.
- Bild-Paar aus dem Ausgabe-Pfad: dieselbe Welt, gleiche Bäume.

SOLL:
- Selbstzeit ≤ 1 ms.
- CPU p50 gehend ≤ 5 ms.
- Frame p95 gehend ≤ 16,7 ms (Wiese), Dorfweg ≤ 25 ms.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`; Exit-Codes explizit.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D7 — Wasser spiegelt die Welt: Bildschirm-Spiegelung im EINEN Wasser-Baustein (wasser (0,074), R2)
- Technik: SSR im EINEN Baustein `_wasserBlick` (11b.js:2159–2195): 16 lineare + 4 binäre Schritte gegen das Tiefen-Abbild (11b.js:2006; Hi-Z aus D2, sobald da), Farbe aus einer Kopie des Szenen-Ziels (rg11b10, 1440×810) am SELBEN Bruch wie die Tiefen-Kopie, Rückfall die Sky-View aus D3 · weißes Uferband an der Wurzel · nasser Saum aus dem Cache von D5 · kein reflector()
- Soll: neues Tafel-Maß spiegelTreue r ≥ 0,6 an ruhigem Wasser (heute 0,114, realer See 0,743) · uferWeiss ≤ 1 % (7,1 %) · fließend detail ≥ 0,2 (0,029–0,051, realer Bach 0,24) · Messort mit Wasser in haushalt.json
- Budget: kostet: 0 Befehle, GPU +0,3…+0,8 ms nur auf Wasser-Pixeln (Schätzung, OMEN misst), VRAM +4,7 MB, angelegt nur solange Wasser im Bild ist (Gebot 7); bezahlt aus D1 (VRAM) und D5 (GPU)
- Spike: Radeon, See-Pose k37, EINE Welt: `_wasserBlick` per werkbank methode mit SSR gegen `_tiefenAbbild` und einer Farb-Kopie; Spiegel-Treue r mit der Rechnung aus mess-spiegel.cjs (Scratchpad 6fa51df3). r ≥ 0,5 im ersten Wurf → Bau.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `wasser-spiegel` vom Kopf von integ-probe, NACH D1 und D3. Ports 8700–8719.

ZIEL wasser (Wirkung 0,074):
- Heute spiegelt das Wasser nur den Himmel: `texture(this._himmelUmgebungTex(), …)`, stamm/11b.js:2173.
- Spiegel-Treue r = 0,114 gegen 0,743 am realen See (Llyn Padarn).
- Weißes Uferband auf 7,1 % der Wasser-Pixel.

ERST DAS SOLL. Die Tafel-Zeile wasser (detail ≥ 0,05) ist falsch geformt: Der echte ruhige See misst 0,0325 und wäre ROT, ein bloßes Rausch-Normal besteht.
- In K5 (scripts/lib/abnahme-urteil.cjs `klassenMasse`) die Maße bauen:
  - `spiegelTreue`: Korrelation der Luma zwischen Wasser und dem an der Uferlinie gespiegelten Bild, 8×8-Blöcke; die Rechnung aus mess-spiegel.cjs im Scratchpad 6fa51df3;
  - `uferWeiss`.
- Selbsttest mit Foto-Referenz.
- Einen Messort mit Wasser in spec/profiband/haushalt.json eintragen (Tafel-Vermerk).
- Die Linse ist VORHER ROT am Täter.

SPIKE (Radeon, See-Pose k37, EINE Welt): SSR per `werkbank methode`. r ≥ 0,5 → Bau.

SCHNITT im EINEN Baustein `_wasserBlick` (11b.js:2159–2195):
- Bildschirm-Strahl nach McGuire & Mara (JCGT 2014): 16 lineare + 4 binäre Schritte gegen das Tiefen-Abbild (11b.js:2006; mit dem Hi-Z aus D2, sobald es steht).
- Farbe aus einer Kopie des Szenen-Ziels (rg11b10, 1440×810, 4,7 MB) am SELBEN Bruch wie die Tiefen-Kopie, also kein zweiter Neustart des Hauptpasses.
- Rückfall: die Sky-View aus D3. Die Schirmkante wird ausgeblendet.
- Die Kopie lebt nur, solange Wasser im Bild ist (Gebot 7).
- Weißes Uferband an der Wurzel: welcher Term (Schaum, Fresnel, Glitzer)? Per Term-Abschaltung messen, dann EIN Schnitt.
- Nasser, dunkler Saum aus dem Boden-Cache von D5 (Wasser-Wahrheit `_werkBoden`).
- Kein `reflector()`: eine zweite Szene kostet doppelte Befehle.
- Das Studio-Wasser (WASSER_GESETZ, terrain-Studio) folgt dem Leser: Labor = Welt, unter Byte-Beweis.

MESSEN:
- Bild-Paare aus dem Ausgabe-Pfad (scripts/lib/ausgabe-aufnahme.cjs): See ruhig, Bach, Uferlinie, Armlänge.
- `werkbank zaehlen`, `werkbank puffer`.
- GPU misst der OMEN (gpu-bank am Wasser-Messort).

SOLL:
- spiegelTreue ≥ 0,6.
- uferWeiss ≤ 1 %.
- fließend detail ≥ 0,2.
- 0 Befehle; GPU ≤ +0,8 ms und VRAM +4,7 MB, beides nur mit Wasser im Bild.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D8 — Das Tor als Fenster: die Ziel-Welt als Panorama ihres Gesetzes (tor-fern (0,046), E GPU am Tor nah und am Genesis-Ring, R3)
- Technik: Die Ziel-Welt ist eine Funktion: ihr Panorama rechnet DERSELBE Panorama-Compute wie die eigene Ferne (`_feldPanoramaRechnen` 11d.js:907–982) mit dem Gelände-Stand der Ziel-Welt, einmal je Ziel-Wechsel, direkt in eine storageTexture (die Rundreise mapAsync + DataTexture fällt auch für das eigene Panorama) · die Membran liest es parallaxen-korrigiert (Interior Mapping, Lagarde & Zanuttini 2012) mit den Seifenfilm-Bändern aus `membranPalette` (porta-core.js:875) · der 12-Schritt-March (porta-core.js:921) und der Portal-Nebel-Kasten fallen in Welt und porta-Studio
- Soll: milchweiss 0,426 → ≤ 0,05 (Tafel) · C*ab der Öffnung ≥ 20 · Korrelation Öffnung ↔ Ziel-Panorama r ≥ 0,5 · GPU der Membran am Tor nah ~1,65 ms (2,93 ms voll vor K50, ×0,5625) → ≤ 0,3 ms
- Budget: frei: GPU −1,3 ms am Tor nah (dem ersten Bild jeder Welt), −0,5…−0,8 ms am Genesis-Ring (einzelstuecke ~1,1 ms), Befehle −1 je Tor (Nebel-Kasten); kostet: VRAM +1 MB je Ziel (512×256 rgba16float), Compute einmal je Ziel-Wechsel
- Spike: Radeon, Genesis Tor nah, EINE Welt: das Panorama eines fremden Seeds per werkbank methode in eine storageTexture, die Membran liest es; milchweiss und gpu-bank vorher/nachher. milchweiss ≤ 0,1 und Membran ≤ 0,5 ms → Bau.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `tor-fenster` vom Kopf von integ-probe. Ports 8720–8739. Baut auf K64 (Tor-Stufe 2 ab 12 m) auf.

ZIEL tor-fern (milchweiss 0,426, Soll ≤ 0,05) UND GPU:
- Die Membran marcht 12 Schritte je Pixel (porta-core.js:921–922). Am Tor nah kostete sie 2,93 ms voll vor K50 (bericht/1410-1-instanz.md), unter TAAU etwa 1,65 ms.
- Weiß sind die Membran L1 zu 41 %, die Membran L3 zu 34 % und der Nebel zu 49 % der Pixel.
- Die Öffnung zeigt kein Ziel.

HEBEL DER FUNKTION: Die Ziel-Welt ist ein Gesetz.
- Ihr Panorama rechnet DERSELBE Panorama-Compute wie die eigene Ferne (`_feldPanoramaRechnen`, stamm/11d.js:907–982).
- Eingabe ist der Gelände-Stand der Ziel-Welt: Seed und Parameter aus dem Welt-Index (05a.js:1567; ERST LESEN, wo die Parameter einer fremden Welt ohne Laden stehen).
- Er läuft einmal je Ziel-Wechsel und schreibt direkt eine storageTexture (rgba16float).
- Damit fällt auch für das eigene Panorama die Rundreise GPU→CPU→GPU (mapAsync + DataTexture-Upload). Abstimmen mit D1, das dessen Format halbiert.

SPIKE (Radeon, Genesis Tor nah, EINE Welt): das Panorama eines fremden Seeds in die Membran. milchweiss ≤ 0,1 und Membran ≤ 0,5 ms → Bau.

SCHNITT:
- Die Membran liest das Panorama parallaxen-korrigiert (Interior Mapping, Lagarde & Zanuttini 2012).
- Die Seifenfilm-Bänder aus `membranPalette` (porta-core.js:875) liegen als dünner Film darüber.
- Der March und der Portal-Nebel-Kasten fallen in Welt UND porta-Studio in DERSELBEN Welle: Labor = Welt, kein Zwilling.
- porta-core ist Studio-Code unter Byte-Beweis: gate:porta-contract, diag-membran-gesetz. Das Neu-Münzen der Goldens ist ein Vertrags-Akt mit Begründung; Kerne nie mit `prettier --write`.

LINSE VORHER ROT in K5, mit Selbsttest:
- Maße `oeffnungBunt` (C*ab ≥ 20) und `zielTreue` (r Öffnung ↔ Ziel-Panorama ≥ 0,5).
- diag-tor-fern nennt den Täter beim Namen.
- Konsum-Leser: die Tafel.

MESSEN:
- Bild-Paare aus dem Ausgabe-Pfad: Tor nah, 30 m, L3.
- `werkbank zaehlen`, `werkbank puffer`.
- GPU misst der OMEN (gpu-bank Tor nah und Genesis-Ring).

SOLL:
- milchweiss ≤ 0,05.
- C*ab ≥ 20.
- r ≥ 0,5.
- Membran ≤ 0,3 ms am Tor nah.
- Befehle −1 je Tor.
- VRAM ≤ +1 MB je Ziel.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

### D9 — Die Wiese als Gesetz im Compute bis 30 m (boden-nah (0,458), R3)
- Technik: Satz nach Ghost of Tsushima (Wohllaib, GDC 2021): EIN TSL-Compute je Kachel-Wechsel rechnet aus `groundCover.grass` und K70s Farb-Gesetz die Halm-Lagen (Voronoi-Klumpen, Höhe, Breite, Neigung und Trockenheit je Halm aus Γ5-Seed-Streams, Boden-Höhe aus dem Mesh nach Lehre 22) · D2s Wahl kullt je Frame · EIN indirekter Zug je Stufe · der Halm aus vertex_index (15/7/3 Ecken nach Abstand), Breite im View-Raum, gekippte Normalen, opak · Fuß aus D4, Boden darunter aus D5 · Büschel-Senke und JS-Pfade fallen; jenseits 30 m tragen die Halm-Schalen als Fernstufe desselben Gesetzes
- Soll: laiWirk ≥ 1,7 als Minimum in jedem Band 2–5/5–10/10–14/14–30 m (heute 0,82/0,43/0,33/0,03) · Halm detail ≥ 0,25 (0,133) · C*ab ≤ 30 (41) · Halm-Kontrast auf Armlänge ≥ 10 (7,95) · nahWiese ≤ 80k Dreiecke, ≤ 2 Render-Objekte je Pass · CPU-Takt p95 nicht höher
- Budget: kostet: GPU +0,5…+1,0 ms Wiese (Schätzung; bezahlt aus D5 −0,85 und D1 −0,25), Dreiecke ≤ 80k (heute 60–66k), VRAM +0,6…+1 MB (Halm-Lagen 40k × 16 B), Befehle +2; frei: CPU −0,1…−0,3 ms (m4.compose je Kachel und Sicht je Büschel fallen; Schätzung)
- Spike: Radeon, Mess-Wiese Ego, EINE Welt: EINE 6-m-Kachel als Compute-Halme mit EINEM indirekten Zug neben der heutigen Wiese; gpu-bank je 10k Halme. ≤ 0,25 ms → 40k Halme passen ins Band → Bau.
- Auftrag: Lies zuerst DIE GOLDENE DEFINITION in CLAUDE.md — sie ist bindend.

Du läufst als champion (.claude/agents/champion.md). Zweig `wiese-compute` vom Kopf von integ-probe, ERST NACH D2 (Compute-Wahl und indirekte Züge), D5 (Boden-Cache) und dem Merge von K70 (boden-nah: Grasnarbe und Farb-Gesetz). Ports 8740–8759.

ZIEL boden-nah: laiWirk 0,647 gegen Soll ≥ 1,7.
- Je Band: 0,82 (2–5 m) · 0,43 · 0,33 · 0,03 (14–30 m). Bei 14–30 m sind 82 % der Pixel Grund.
- Die Nah-Wiese endet bei 14 m (`NAH_WIESE.radius`, stamm/09.js:261).
- Höchstens 185 Halme/m² gegen 5 000–15 000 Triebe/m² real.
- Die Lage je Kachel entsteht in JS per m4.compose (11c.js:204–232), die Sicht je Büschel in JS (11c.js:310–365).

ERST LESEN: was K70 an Gesetz und Soll gesetzt hat. Kein zweites Farb-Gesetz, keine zweite Dichte.

SPIKE (Radeon, Mess-Wiese Ego, EINE Welt): EINE 6-m-Kachel als Compute-Halme mit EINEM indirekten Zug. gpu-bank je 10k Halme ≤ 0,25 ms → Bau.

SCHNITT (Wohllaib, GDC 2021):
- EIN TSL-Compute je Kachel-Wechsel (Kosten an Änderung) rechnet aus `groundCover.grass` und dem Farb-Gesetz die Halm-Lagen:
  - Voronoi-Klumpen;
  - Höhe, Breite, Neigung und Trockenheit je Halm aus Γ5-Seed-Streams;
  - Boden-Höhe aus dem Mesh nach Lehre 22, als Höhen-Clip.
- D2s Wahl kullt je Frame; EIN indirekter Zug je Stufe.
- Der Halm entsteht aus `vertex_index`, ohne Vertex-Puffer: 15/7/3 Ecken nach Abstand, Breite im View-Raum, gekippte Normalen, opak (Early-Z bleibt).
- Der Fuß dunkelt aus D4 (Monsi-Saeki), der Boden darunter trägt die Halmfarbe aus D5.
- Der Wind liest die EINE Naht `_weltNaht`.

WAS FÄLLT, in DERSELBEN Welle (kein Zwilling): die Büschel-Senke und ihre JS-Pfade.
- Jenseits 30 m tragen die Halm-Schalen (10.js:1512–1590) als Fernstufe DESSELBEN Dichte-Gesetzes.
- Das Studio-Labor (terrain) zeigt dieselben Halme: Labor = Welt, Studio-Code unter Byte-Beweis (gate:asset-contract).

LINSE VORHER ROT in K5, mit Selbsttest und ≤ 3 min CI:
- `laiWirk` als Minimum je Abstandsband bis 30 m, statt heute als Pixel-Mittel im 14-m-Ring.
- Halm-detail, C*ab und Halm-Kontrast auf Armlänge.
- gate:profiband-Zeile nahWiese.
- Konsum-Leser: die Tafel.

MESSEN:
- Bild-Paare aus dem Ausgabe-Pfad: Armlänge, 5/14/30 m, Ego und Third.
- `werkbank zaehlen`, `werkbank puffer`.
- GPU misst der OMEN (gpu-bank Wiese Ego und Third).
- OMEN-ABAB beim CPU-Takt p95, stehend und gehend.

SOLL:
- laiWirk ≥ 1,7 in jedem Band bis 30 m.
- detail ≥ 0,25.
- C*ab ≤ 30.
- Kontrast auf Armlänge ≥ 10.
- ≤ 80k Dreiecke, ≤ 2 Render-Objekte je Pass.
- GPU ≤ +1,0 ms.

LOKAL:
- Stamm über scripts/lib/stamm.cjs, `diag-atlas --check`, `stamm:lint`.
- Puls, `playtest:fast`, `npm run check`.

COMMIT: deutsch, Zahl im Rumpf, keine Siegel-Wörter.

Bericht = Zwischenstand.

## Gegenprüfung

**Gegenprüfung des Durchbruch-Plans (integ-probe e8a370ad, nur gelesen)**

Gelesen habe ich `stamm/*`, Vendor r184 (`vendor/three.webgpu.min.js` und `three.core.min.js`), `porta-core.js`, `foundry-core.js`, `gelaende-core.js`, `scripts/lib/abnahme-urteil.cjs`, `spec/abnahme/soll-tafel.json`, die koordination-Berichte 1510-k55, 1410-boden2 und 1110-7, die Commits K50, K62 und K68 sowie zwei Web-Quellen.

## (a) Zahlen und Quellen

**Bestätigt:**
- **CPU-Takt p95:** 5,7 / 6,1 / 5,5 / 6,5 ms (1510-k55-abab.md:21–27, 92–97).
- **Stamm-Stellen:**
  - Kopie der Geschichte: 25c.js:203.
  - rg11b10 verworfen: 25c.js:311–312.
  - MRT-Bewegung verworfen: 25c.js:690–697.
  - ~0,8 Neuaufnahmen je Frame: 17b.js:278.
  - Bündel-Neuaufnahme: 25c.js:1797.
  - Fassade: 20c.js:1360–1361.
  - Wasser spiegelt nur den Himmel: 11b.js:2173.
  - Nah-Wiese 14 m: 09.js:261.
  - Schatten-Texel 0,17/0,47 m: 26c.js:1444.
- **Kerne:** d1 = 26 und Zelle 128×256 (foundry-core.js:261, 605); March mit 12 Schritten (porta-core.js:922).
- **Hillaire:** LUT-Größen stimmen; Monsi & Saeki und Liu & Jordan korrekt zitiert.
- **toji.dev:** 412 Einzelpuffer kosten 3 ms, EIN Puffer gut 10 µs. Zusatz von dort: die Validierungs-Dispatches tauchen in keinem Pass-Zeitstempel auf.
- **AirGuanZ (GTX 1060):** Sky-View 64×64 kostet 0,036 ms, Luftperspektive 64×64×32 kostet 0,03 ms.

**Falsch oder veraltet:**
- **Radeon gpu-bank Genesis:** 8a00348e nennt 33,9/25,6 → 18,3/17,3 ms. Die Zahlen „29,7 → 17,8“ des Plans stehen in keinem Commit.
- **Befehle und Dreiecke:** K55 B misst Genesis Third 140 Befehle · 460k Dreiecke und Genesis Ego 106 · 351k (1510-k55-abab.md:24–27). Der Plan rechnet mit 191 / 589k aus den Ratschen von V18.546.0. Dreiecke und Befehle binden also noch weniger.
- **D3:** Der Plan setzt die Kosten von 64² an, baut aber 192×108. Das sind 5× so viele Texel, also etwa 0,1–0,2 ms je Neuberechnung.
- **D5:** „96–150k Zeichen WGSL“ ist die Größe des Boden-Programms aus K17, vor der Falte (gelaende-core.js:2201–2203).
- **D6:** „9,4 ms Folge-Kette“ ist falsch gelesen.
  - 9,4 → 12,9 ms ist der ganze `_loopVoxelStreaming` inklusive, A gegen B (1410-boden2-abab.md:40).
  - Die Kette besteht aus B−A-Deltas, die ineinander liegen: Wald netto +2,2 · Sichthöhen +1,47 · Neubau +1,0 · Boden-Karte +0,16 ms.
  - Der Bericht trägt einen Basis-Vorbehalt (Z. 51–52).
  - Realistisch sind gehend −2,5…−4 ms, nicht −5…−8.
- **D2:** `_satzPacke` (17b.js:731) packt nur die Vertex-Form. Der Pool ist der Satz mit seinen Teilbereichen (17b.js:690–703).

## (c) Was r184 im Vendor wirklich kann

- **Indirekte Züge:** Der Zweig `getIndirect` ruft `drawIndexedIndirect` je Offset in einer Schleife. Danach bucht er EINMAL `t.update(l,r,s)` aus den CPU-Werten. Die Zähl-Linse ist also Pflicht, und `info` lügt auch bei mehreren Offsets.
- **`getDrawParameters` gibt `null` zurück:**
  - wenn die CPU-Instanzzahl 0 ist;
  - wenn eine Geometrie weder Index noch `position` hat und der Zeichenbereich unendlich ist.
  - Folgen: Die Fassade muss Instanzzahl ≥ 1 halten. D9 braucht `setDrawRange(0, n)`.
- **`_getVertexFormat`:**
  - Bei `itemSize` 1 kennt r184 nur Int32/Int16/Uint32/Uint16/Float32. Mit Uint8Array baut kein Programm, das „unorm8-Attribut“ aus D4 gibt es also nicht.
  - Nicht normalisiertes Int16 weitet `createAttribute` auf Int32 (doppelte Bytes).
  - Gepolstert werden nur Speicher-Attribute. Darum braucht D1 `itemSize` 4 und `normalized: true`.
- **Vorhanden:** `textureStore`, `Storage3DTexture`, `receivedShadowNode`, `viewportSharedTexture`, `resolveTimestampsAsync('compute')`.
- **WebGL2:** r184 rechnet dort Compute per Transform-Feedback. Das kennt nur Attribute, keine Atomics und kein `textureStore`.

## (b), (d), (e) Urteil je Karte

**D1 – umbauen (R3 statt R2).**
- **Ping-Pong:** stimmt mit ±0 MB. Nach dem K68-Merge, denn K68 fasst das Anlaufen der Geschichte an (25c.js, „Vortiefe in Kanal a“).
- **Quantisierung bricht still:**
  - `_foundryGruppenHoehe` (20c.js:299–318) liest `attributes.position.array` mit Schritt 3 in Metern. Mit Int16×4 entstehen falsche Sichthöhen, also der fail-soft-Bruch.
  - `boundingSphere` aus dem normierten Attribut (20c.js:1350) wäre in [−1; 1] gerechnet. Damit liegen Cull und `_lodAuge` falsch.
- **Pflicht:**
  - Die Brücke liefert Grenzen und Höhe als Daten.
  - EIN Dequant-Knoten für jeden Leser von `positionGeometry` (Lehre 22).
  - Absenz-Linse über die CPU-Leser.
- **Spike in Minuten statt Stunden:** `info.memory.attributesSize` an Genesis Third ist die Obergrenze des Gewinns.
- **Synergie:** Die freie 4. Komponente der Normale trägt V aus D4 für 0 B.

**D2 – tragfähig im Kern, umbauen.**
- **Nach K62, nicht daneben:** `render-objekt` f1e0e96e baut Befehls-Bündel am r184-`_draw` (Radeon je Draw 12 → 7–8 µs) in derselben Maschine (Lehre 12).
- **Ersparnis neu rechnen:** Der Plan rechnet mit 25 µs vor K62. Nach K62 sinkt der Gewinn an der Radeon um etwa die Hälfte. Richter ist 1510-k62-abab.
- **Hebel liegt in k0:** Der p95-Frame ist der k0-Frame. Schatten-Pässe sammeln nie Bündel (25c.js:1281–1282) und zahlen darum den vollen Objekt-Pfad. D2 beginnt in k0/k1.
- **Hi-Z raus:** Hi-Z kauft Dreiecke (nicht bindend: 460k von 680k), keine CPU. Dazu kommen etwa 9 Mip-Dispatches mit CPU-Kosten je `compute()` und das Pop-Risiko aus dem Vorframe.
- **WebGL:** „Dieselbe TSL-Wahl über Transform-Feedback“ ist falsch, denn ohne Atomics gibt es keine Kompaktierung. Der Weg ist die W3-Wand (diag-webgl-probe.cjs:15–16): alle Instanzen zeichnen, die Maske `uLodAuge` wählt, LAUT.
- **Null-Renderer:** Compute ist dort ein noop (07.js:1555). gate:sicht-arbeit (I) verliert seinen Gegenstand und muss benannt umziehen.
- **Spike in Stunden:**
  - nicht „Klasse baum als EIN Pool“: das dauert Tage, denn die Matrizen-Puffer hängen je Objekt (20c.js:1385–1405);
  - sondern EINE bestehende Senke in k0, Instanzzahl von der CPU in die Args, Steigung je Offset gegen je Render-Objekt messen;
  - Nebeneffekt: Die indirekte Zahl hält den K62-Stempel („Anzahl“), das Bündel nimmt nicht neu auf.

**D3 – umbauen.**
- **Umgebung zu oft:** `_sonnenStufe` fällt 10–25-mal je Sekunde (24.js:246–249). PMREM je Stufe hieße etwa 20 Render-Züge 10–25-mal je Sekunde, also ein p95-Bruch. Die Umgebung bleibt beim groben Takt von heute (≤ 1 je 6 s).
- **Sky-View ist kein Equirekt.** Vor `fromEquirectangular` (05b.js:2876) braucht es einen Wandel-Pass.
- **Luftperspektive:** Sie hängt am Frustum und rechnet je Frame (≤ 0,03 ms), nicht „je Kamera-Sprung“.
- **WebGL:** Compute-LUTs hätten dort keinen Himmel (W5 rot) oder bräuchten einen Zwilling. Die LUTs gehören als Fragment-Pässe in RenderTargets: EIN Pfad für beide Backends, +1 Zug je Aktualisierung.
- **Spike:** Den LUT-Port in Stunden halte ich für knapp. Schneller entscheidet die Hillaire-Rechnung offline in node mit `ATMO_GESETZ` am Mittag: E_Himmel/E_Sonne.

**D4 – tragfähig nach K68 und D1, umbauen.**
- V reist im w der snorm8x4-Normale (Präzedenz: der w-Platz von `_satzPacke`, 17b.js:726–729). Ein eigenes Attribut gibt es in r184 nicht.
- `aoNode` dämpft nur das indirekte Licht (10.js:919–920). Das direkte Licht dämpft `receivedShadowNode`, den es schon gibt (26c.js:1440).
- Der r128-Kartenbäcker im Foundry-Worker muss das Attribut lesen (foundry-bruecke.js:244–300).
- Der Spike geht in Stunden.

**D5 – umbauen; der Spike entscheidet, misst aber falsch.**
- **Wenig zu cachen:** Der Fels-Term läuft nur auf Fels oder Schutt, die Wiese zahlt ihn nicht (10.js:1434–1435). Der Genesis-Platz trägt keinen Fels (26b.js:2889–2893).
- **Bleibt im Fragment:** Der teure Teil an beiden Messorten ist vermutlich die blickabhängige 8-Schicht-Parallaxe des Grases (10.js:1507–1550).
- **Spike falsch:** „Konstante Albedo“ nimmt die Parallaxe mit und überschätzt den Cache. Zwei Toggles:
  - A: blickunabhängige Terme konstant, Parallaxe bleibt;
  - B: Parallaxe aus.
  - Bau nur, wenn A ≥ 50 % trägt.
- **Geometrie der Clipmap:**
  - 512 × 32 cm ergibt ±82 m, nicht 160 m; für ±164 m braucht es eine 6. Stufe (+1,6 MB).
  - 2 cm auf Armlänge (Pixel dort ~3 mm) ist eine Regression gegen das Beweis-Paket von E. Darum Stufe 0 ≤ 1 cm oder ein direkter Ring unter 3 m.
- **Was nicht in den Cache gehört:** sonnenabhängige Terme („Halmfarbe mit Eigenschatten“).
- **Mehrlagige Stellen:** Höhlenböden mit n.y > 0,5 unter der Oberfläche bekommen eine y-Probe gegen die gespeicherte Höhe.
- **WebGL:** überall der direkte Pfad (dieselbe Funktion), LAUT.

**D6 – umbauen.**
- **Zwilling:** `_foundrySichtHoehe` liest das Höhen-Buch `f.hoehen` im Haupt-Faden und bestellt Bauten (15b.js:2126–2160). `_forestStehtFrei` fragt `_wildnisTraegt` und `_ortWand`, also Grundrisse (20d.js:55–62). Beides im Worker wäre ein Zustands-Spiegel, gegen Lehre 7.
- **Wurzel steht im Bericht selbst:** Ein Stufen-Wechsel, der nur morpht, darf Wald und Sichthöhen nicht neu setzen (1410-boden2-abab.md:49–51). Das ist Gebot 7 am Auslöser: R2, Spike per `werkbank methode` in Stunden.
- **Danach in den Worker:** nur der gesetzes-reine Rest, also `_bodenKarteAusMesh` (08.js:1532) und die Darts.

**D7 – tragfähig, nachrangig.**
- Bruch und Format passen: `_tiefenAbbild` (11b.js:2000–2006), Ausgabe in rg11b10 (25c.js:308–316). Die Kopie kostet 4,67 MB, ohne das Feature 9,3 MB.
- Laut Tafel steht an Wiese und Genesis kein Wasser im Blick. Das heißt: kein Risiko für E, aber auch keine messbare Wirkung, bis ein Messort mit Wasser im Haushalt steht.
- Spike per `viewportSharedTexture` in Stunden.

**D8 – umbauen; die Prämisse ist falsch.**
- **Die Ziele sind Studios.** Die Tore des Genesis-Rings sind die Studio-Tore (soll-tafel tor-fern; 26b.js:2889–2893, „das Tor des Terrain-Studios“). Ihre Ziele sind Labore, keine gelaende-core-Welten mit Seed. 05a.js:1567 ist `switchToWorld` für eigene Saves.
- **Kein „gleicher Compute“:** `_feldPanoramaRechnen` (11d.js:907–982) liest ein Polar-Feld, dessen Fern-Farbe die CPU mit Funktionen der eigenen Welt malt (11c.js:3380–3426). Mit einem anderen Seed geht das nur über einen zweiten Welt-Zustand.
- **Teilen in zwei Schnitte:**
  - **GPU und milchweiss:** March → ein Parallaxen-Zugriff plus Seifenfilm. Der Nebel-Kasten fällt (Byte-Beweis für porta). Das trägt unabhängig vom Zielbild.
  - **Zielbild:** der EINE Export des Studios (Postkarte je SHA), kein Host-Zwilling.
- Spike mit einem beliebigen Equirekt in Stunden.

**D9 – umbauen.**
- **Abhängigkeit von D5 fällt.** `laiWirk` zählt Pixel nach Klasse ^halm: gegen ^grund$ (abnahme-urteil.cjs:951–985). Ein Boden in Halmfarbe bleibt „grund“.
- **Budget reicht nicht.** Überschlag: P ≤ e^(−0,85/cos θ) bei 14–30 m braucht etwa 10 Halm-Treffer je Pixelspalte. Das ergibt etwa 70k Halme und 200–230k Dreiecke. Das ist ≥ 2,5× die 80k-Zeile. 40k Halme × 16 B erreichen 1,7 nicht.
- **Entweder oder:**
  - nahWiese auf ~200k anheben (das Band trägt es: Wiese Ego 279k von 680k);
  - oder das Soll je Band nur bis 14 m.

**Fehlende Hebel:**
- **Horizont-Karte** jenseits der Kaskaden (512² r16f, 0,5 MB, je Sonnen-Stufe, ~0 ms je Frame). Sie steht im Render-Pfad-Blickwinkel, fehlt aber im Plan.
- **Radeon-Frame:** Bei 17,3–18,3 ms GPU an Genesis quantisiert VSync auf 33,3 ms. Das liegt über dem 33-ms-Rand von E: Die Radeon reißt E womöglich allein an der GPU.
- **Bloom:** 9 Abtastungen bei voller Ausgabe-Auflösung (25c.js:597–612). Ein Hell-Pass in halber Auflösung kostet +1 Zug. Kleiner Hebel, vorrangig an der Radeon.
- **B:** Der Plan hat keine Karte, B liegt bei K60-2. Das steht als benannte Lücke.

**Scope:** PFLICHT-OFFEN trägt nur B und E; die Roadmap sagt Feature-Stopp bis v1.0. Die Bild-Karten D3, D4, D7, D8b und D9 brauchen einen Eintrag, den nur der Schöpfer setzt (Betriebsgesetz 2). Ohne ihn sind sie erfundene Wellen.

## Korrigierte Reihenfolge

**0. Messen (≤ 1 Tag, parallel):**
- OMEN: `zerlegen` an Wiese und Genesis, dazu 1510-k62-abab.
- Radeon: ABAB am Kopf und `zerlegen` Genesis.
- Proben in Minuten: `info.memory.attributesSize` (D1), Boden-Toggles A/B (D5), Anteil von k0 am p95.

**A. E-CPU:**
1. K62 mergen.
2. D6a: Auslöser-Schnitt (R2).
3. D2: zuerst k0, ohne Hi-Z, W3-Wand für WebGL.

**B. E-Radeon-GPU:**
4. D8a: Membran-GPU.
5. D1a: Ping-Pong, nach K68.
6. D1b: Quantisierung (R3).
7. D5: nur wenn A ≥ 50 %.

**C. Bild (nur mit dem Eintrag des Schöpfers):**
8. D3 (LUTs als Fragment-Pässe) zusammen mit der Horizont-Karte.
9. D4 (nach K68 und D1b).
10. D9 (nach D2, Budget neu).
11. D8b: Zielbild aus dem Studio-Export.
12. D7: nach dem Messort mit Wasser.

Belegdateien: `C:\Users\micha\AnazhRealm-integ\vendor\three.webgpu.min.js`, `C:\Users\micha\AnazhRealm-integ\stamm\20c.js`, `\stamm\25c.js`, `\stamm\15b.js`, `\stamm\20d.js`, `\stamm\10.js`, `\stamm\11d.js`, `\stamm\11c.js`, `\stamm\26b.js`, `C:\Users\micha\AnazhRealm-integ\scripts\lib\abnahme-urteil.cjs`, `C:\Users\micha\AnazhRealm-profiband\.claude\worktrees\koordination\bericht\1410-boden2-abab.md`, `…\bericht\1510-k55-abab.md`.
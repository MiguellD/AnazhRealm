# Spike SICHT der EINHEIT (E7) — „gezeichnet wird, was Pixel trägt"

Zweig `einheit-sicht` ab origin/main 986eff04e9. Gerät: Radeon 890M (Laptop), `werkbank start --echt`, Schirm des Hauptbilds wie im Spiel.

## Schritt 0 — die Zählung am echten Bild

Gezählt am 19.11. an der Radeon 890M (`werkbank start --echt --pixel`, Hauptbild 1080 × 1080, Genesis Ego 720 × 720 nach der Auflösungs-Skala des Bands),
je Ort ein Frame nach dem Einschwingen des Bau-Takts, Rohdaten `probe5.json` (Zensus-Lauf, Stand 986eff04e9 ohne Schnitt).
„ohne Pixel" = gezeichnet, aber kein Fragment überlebt die Tiefe dieses Frames. „verdeckt" = rastert, das Original-Fragment
überlebt, aber die Tiefe des Frames liegt davor (das, was eine Tiefen-Pyramide fängt). „unter dem Bildpunkt" = rastert erst
bei vierfacher Dichte (das, was nur die STUFE fängt, nie die Sicht). „Rest" = rastert weder bei vierfacher Dichte noch auf
dem vierfach geweiteten Schirm (entartete oder geparkte Instanzen, Dreiecke unter 1/16 Pixel, Ecken hinter dem Auge oder
hinter der Fern-Ebene — der Zensus trennt diese vier nicht).

| Ort · Sicht | System | gezeichnet | ohne Pixel | davon verdeckt | davon unter dem Bildpunkt | übrige ohne Pixel (außerhalb · rückseitig · alpha-leer · Rest) |
|---|---|--:|--:|--:|--:|---|
| wiese · third | Siedlung | 14.875 | 99.7 % | 14.6 % | 50.0 % | 7.4 · 2.1 · 0.0 · 25.5 % |
| wiese · third | Vegetation | 311.501 | 80.3 % | 13.9 % | 10.1 % | 13.8 · 3.1 · 1.4 · 38.0 % |
| wiese · third | Gelände | 40.249 | 91.7 % | 25.3 % | 8.6 % | 13.3 · 2.6 · 0.2 · 41.6 % |
| wiese · third | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| wiese · third | Kreatur | 44.598 | 94.6 % | 5.5 % | 50.4 % | 0.2 · 9.0 · 0.0 · 29.5 % |
| wiese · third | Himmel | 2.464 | 97.6 % | 8.3 % | 0.0 % | 18.9 · 0.0 · 0.0 · 70.5 % |
| **wiese · third** | **alle** | **413.687** | **83.8 %** | **14.1 %** | **15.7 %** | 12.1 · 3.6 · 1.1 · 37.2 % |
| wiese · ego | Siedlung | 14.875 | 99.5 % | 17.7 % | 48.9 % | 4.9 · 2.5 · 0.0 · 25.6 % |
| wiese · ego | Vegetation | 303.008 | 80.2 % | 17.1 % | 11.0 % | 15.1 · 3.4 · 1.1 · 32.4 % |
| wiese · ego | Gelände | 40.626 | 94.5 % | 26.4 % | 8.3 % | 12.1 · 2.8 · 0.3 · 44.7 % |
| wiese · ego | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| wiese · ego | Kreatur | 4.536 | 99.6 % | 0.1 % | 8.9 % | 3.2 · 0.5 · 0.0 · 86.9 % |
| wiese · ego | Himmel | 2.464 | 96.3 % | 6.9 % | 0.0 % | 18.3 · 0.0 · 0.0 · 71.2 % |
| **wiese · ego** | **alle** | **365.509** | **82.9 %** | **17.9 %** | **12.1 %** | 14.2 · 3.3 · 1.0 · 34.5 % |
| genesis · third | Siedlung | 48.563 | 66.5 % | 15.8 % | 10.1 % | 12.8 · 18.4 · 3.8 · 5.6 % |
| genesis · third | Vegetation | 129.796 | 92.1 % | 14.2 % | 12.3 % | 8.9 · 1.8 · 1.3 · 53.6 % |
| genesis · third | Gelände | 39.540 | 95.8 % | 32.0 % | 11.0 % | 13.4 · 1.8 · 0.2 · 37.4 % |
| genesis · third | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| genesis · third | Kreatur | 40.470 | 94.1 % | 5.9 % | 54.3 % | 0.0 · 9.6 · 0.0 · 24.3 % |
| genesis · third | Himmel | 2.464 | 97.1 % | 7.9 % | 0.0 % | 18.7 · 0.0 · 0.0 · 70.5 % |
| **genesis · third** | **alle** | **260.833** | **88.2 %** | **15.8 %** | **18.1 %** | 9.0 · 6.1 · 1.4 · 37.8 % |
| genesis · ego | Siedlung | 43.781 | 74.4 % | 12.8 % | 13.0 % | 21.9 · 15.3 · 2.9 · 8.5 % |
| genesis · ego | Vegetation | 147.105 | 92.4 % | 16.3 % | 13.1 % | 6.3 · 2.0 · 1.9 · 52.8 % |
| genesis · ego | Gelände | 39.028 | 97.2 % | 29.2 % | 11.5 % | 12.7 · 1.4 · 0.3 · 42.2 % |
| genesis · ego | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| genesis · ego | Kreatur | 640 | 99.5 % | 0.3 % | 5.3 % | 0.0 · 0.8 · 0.0 · 93.1 % |
| genesis · ego | Himmel | 2.464 | 95.9 % | 6.4 % | 0.0 % | 18.3 · 0.0 · 0.0 · 71.2 % |
| **genesis · ego** | **alle** | **233.018** | **89.9 %** | **17.6 %** | **12.7 %** | 10.4 · 4.3 · 1.8 · 43.0 % |
| dorf · third | Siedlung | 6.564 | 97.6 % | 14.9 % | 23.7 % | 43.6 · 4.8 · 0.0 · 10.5 % |
| dorf · third | Vegetation | 368.408 | 92.9 % | 10.9 % | 7.4 % | 28.7 · 4.9 · 1.4 · 39.7 % |
| dorf · third | Gelände | 47.632 | 93.9 % | 39.0 % | 6.4 % | 15.2 · 2.0 · 0.2 · 31.0 % |
| dorf · third | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| dorf · third | Kreatur | 46.254 | 91.9 % | 2.7 % | 48.1 % | 0.2 · 8.9 · 0.0 · 32.0 % |
| dorf · third | Himmel | 2.464 | 99.4 % | 10.1 % | 0.0 % | 18.7 · 0.0 · 0.0 · 70.5 % |
| **dorf · third** | **alle** | **471.322** | **93.0 %** | **13.0 %** | **11.5 %** | 24.7 · 5.0 · 1.1 · 37.8 % |
| dorf · ego | Siedlung | 7.754 | 99.0 % | 9.9 % | 19.4 % | 6.9 · 4.0 · 0.0 · 58.8 % |
| dorf · ego | Vegetation | 470.583 | 92.2 % | 17.5 % | 9.1 % | 23.2 · 3.7 · 1.2 · 37.6 % |
| dorf · ego | Gelände | 47.630 | 97.4 % | 39.0 % | 6.6 % | 14.6 · 1.9 · 0.2 · 35.2 % |
| dorf · ego | Wagen | 0 | – % | – % | – % | – · – · – · – % |
| dorf · ego | Kreatur | 6.304 | 100.0 % | 0.1 % | 3.5 % | 3.1 · 0.2 · 0.0 · 93.1 % |
| dorf · ego | Himmel | 2.464 | 99.0 % | 9.6 % | 0.0 % | 18.3 · 0.0 · 0.0 · 71.2 % |
| **dorf · ego** | **alle** | **534.735** | **92.9 %** | **19.1 %** | **8.9 %** | 21.9 · 3.5 · 1.0 · 38.5 % |

Wagen: an keinem der drei Orte fährt ein Wagen im Bild (0 Dreiecke; die Trassen tragen am Spawn keinen Verkehr).

Die Haufen (128 Dreiecke in Index-Folge, das Maß der Spike-Haufen): ganz ohne Pixel sind 51,9 % der Dreiecke an Wiese Third,
51,6 % Wiese Ego, 58,7 % Genesis Third, 65,2 % Genesis Ego, 74,6 % Dorf Third, 76,5 % Dorf Ego; davon ganz VERDECKT 13,2 ·
13,2 · 21,6 · 24,0 · 18,5 · 25,6 %. Die Treue des Wiederspiels (Pixel des Ausgangs, die vom Spiel abweichen): Wiese 1,7 % /
0,7 %, Genesis 5,4 % / 4,4 %, Dorf 25,5 % / 13,5 % — die Ursache am Dorf ist nicht getrennt (Verdacht: Puffer, die vor dem Wiederspiel
neu geschrieben wurden); seine Zeilen sind die unschärfsten. Der Draw-Zähler des Spiels liest am selben Frame
13–16 % weniger Dreiecke im Hauptpass als der Zensus (Wiese Third 358 787 gegen 413 687), an Genesis Third 7 % mehr; die Differenz ist nicht zugeordnet.

**STOP-Probe: ohne Pixel an Wiese Third 83,8 % ≥ 30 % — gebaut.**

**Wo die Sicht greift und wo nicht.** Über alle Systeme ist ein Siebtel bis ein Fünftel der gezeichneten Dreiecke verdeckt
(13,0–19,1 %) und ein Zehntel bis ein Viertel außerhalb des Schirms (9,0–24,7 %); unter dem Bildpunkt liegen 8,9–18,1 %, und
der größte Block (34,5–43,0 %) rastert gar nicht. Für die Häuser (Siedlung) heißt das: an der Wiese ist ihr Bild zu 99,7 %
ohne Pixel, aber nur 14,6 % sind verdeckt — die Hälfte liegt unter dem Bildpunkt (die Häuser stehen fern); an Genesis
(48 563 Dreiecke, die Häuser nah) verdeckt 15,8 %, außerhalb 12,8 %, rückseitig 18,4 %, unter dem Bildpunkt 10,1 %. Die Sicht
allein fängt an den Häusern also höchstens ein Drittel; den Rest fängt nur die Stufe (der Zweig `einheit-stufe-aus-l0`).

### Die Methode (gezählt, nicht gerechnet)

`scripts/lib/pixel-zensus.cjs` + `scripts/diag-pixel-zensus.cjs` (Start `werkbank start --echt --pixel`):

1. Ein Frame des Spiels nach dem Einschwingen des Bands, aufgenommen auf WebGPU-Ebene — jeder Pass, jedes Bündel, jeder Zug
   mit Pipeline, Bindegruppen, Puffern und den Argumenten der indirekten Züge (aus ihren Auftrags-Puffern zurückgelesen).
   Die Pässe des Hauptbilds benennt der Chokepoint `renderer._renderScene` (haupt · k0 · k1 · post).
2. Je Dreieck × Instanz EIN `drawIndexed(3, 1, …)` in EINER Occlusion-Query, mit Zwillings-Pipelines desselben Layouts und
   derselben Vertex-Stufe:
   - `ras1` Tiefe allein, Cull des Originals → rastert es überhaupt ein Sample?
   - `rasA` das Original-Fragment (Alpha-Test/discard), Tiefe `always` → überlebt ein Fragment?
   - `vis` das Original-Fragment gegen die Tiefe DIESES Frames (`less-equal`, nichts geschrieben) → trägt es einen Pixel?
   - `ras2` ohne Cull (rückseitig), `dicht` bei K = 4-facher Dichte (unter dem Bildpunkt), `weit` mit 1/K geschrumpftem
     Clip-Raum auf K-fachem Ziel (außerhalb des Schirms).
3. Klassen je Dreieck: sichtbar · verdeckt · alpha-leer · rückseitig · unter-px · außerhalb · Rest; je Klasse des Täters
   (`_taeterKlasse`, Glied der Arena / `__instanzQuelle`) und je Haufen (128 Dreiecke in Index-Folge), Instanz und Zug.
4. Die Treue: der Frame wird aus den aufgenommenen Befehlen noch einmal in seine Ziele gespielt und Pixel für Pixel verglichen.

## Zensus — wo heute Sicht und Stufe entschieden werden (Datei:Zeile)

| System | Sicht (gezeichnet ja/nein) | Stufe (welche Gestalt) |
|---|---|---|
| alle (das EINE Gesetz der Pass-Wahl) | `stamm/bild-wahl.js:516` `_passTrifft` (Frustum + Kaskaden-Kapsel, Box/Kugel) · `:565` `_passTrifftBox` · `:14` `_passSicht` (Haken je Pass) · `stamm/dirigent-takt.js:1068` `_loopFrustumCulling` | — |
| Siedlung (Bau-Satz: Häuser, Felsen, Ausstattung) | `stamm/siedlung-bauten.js:2904` `_chunkSatzPass` → `:3008` `_chunkSatzAbschnitt` (Zelle je Instanz, Frustum) · `stamm/siedlung-satz.js:22` `_bauSatzArt` (wer in den Satz geht) | `stamm/siedlung-bauten.js:142` `_tickArchitectureLOD` · `:393` `_archStufeSpiel` · `:450` `_archStufeUrteil` · `:117` `_occlusionOccludes` (die Kronen-Dichte: hebt die Stufe, schneidet nie) · `:628` `_switchArchitectureLOD` · `:751` `_updateFoundryLodBand` · `stamm/studio-bruecke.js:2935` `_archStufenGrenzen` · `:2891` `_foundryFernStufe` · `stamm/stoff-instanz.js:2639` `_foundryLodForEntry` |
| Siedlung/Vegetation (Region-Bündel) | `stamm/siedlung-instanz.js:169` `_archRegionBundleCull` (Frustum) · `:134` `_bergSchattenVerdeckt` (Berg, in Schritt 1 gefallen) · `:229` `_bundleQueryTick` (Wald-vor-Wald, Query-Kasten, in Schritt 1 gefallen) · `stamm/bild-wahl.js:67` `_werferWahlPass` (Kaskaden) · `stamm/siedlung-instanz.js:1208` `_cullArchitectureMesh` | wie Bau-Satz (Foundry-Stufe je Eintrag) |
| Vegetation (globale Gruppen, Wiese, Streu) | `stamm/bild-wahl.js:618` `_instanzWahlGpu` + `:943` `PASS_WAHL_WGSL` (GPU je Instanz: Frustum, Kapsel, Fenster der Stufe) · `stamm/stoff-instanz.js:1400` `_wahlVor` · `:1429` `_wahlSicht` · `:1883`/`:1929` (Arena-Frustum) · `stamm/vegetation-baum.js:2726` `tickArchitectureCulling` (Distanz) · `:3078` `_cullWache` | `stamm/vegetation-streu.js:1125` `_tickScatterLod` · `:2081` `_chooseLODForDistance` · `:1909` `_nahStufe` · `stamm/stoff-karte.js:432` `_karteStufe` · `PASS_WAHL_WGSL` Art 1–7 (Blende, Nähe, Ferne) |
| Gelände | Boden-Satz über `_chunkSatzPass` (wie oben) · `stamm/gelaende-fern.js:408`, `:631`, `:1097` (Ringe ohne Cull) | `stamm/gelaende-boden.js:2778` `_voxelChunkLodFor` · `:2803` `_stufenZelle` · `:2826` `_stufeGewicht` |
| Wagen | three-Frustum je Mesh · `stamm/koerper-fahrt.js:213` | `stamm/siedlung-bauten.js:1828` `_archTraegt` (das Komposit erbt) · `stamm/siedlung-verkehr.js:1416` ff. (Sim-Stufe) · `stamm/stoff-material.js:3273` `_lodAuge` |
| Kreatur | `stamm/kreatur-leben.js:1829` · `stamm/kreatur-fauna.js:153` · `stamm/kreatur-verhalten.js:3045`, `:3069` · `stamm/feld-leben.js:57` | `stamm/kreatur-leben.js:2978` `_tierSatzWahl` · `stamm/studio-glieder.js:530` `_leibSatzStufe` · `:341` `_leibStufeTauschen` · `stamm/koerper-leib.js:408` `_gelenkStufe` |

Befund (Stand 986eff04e9): elf Orte entscheiden SICHT, fünfzehn die STUFE. Kein Ort liest die Tiefe des Bilds je Haufen.
Verdeckung kennen nur die Region-Bündel (Berg aus der Makro-Höhe, Wald-vor-Wald als Query-Kasten mit 1–2 Bildern Verzug); die
Kronen-Dichte des Bau-Satzes marschiert eine Sichtlinie durch ein 3-m-Raster der Kronen, aber nur, um die Stufe zu heben — sie
schneidet keinen Körper. Bau-Satz, GPU-Wahl, Wagen und Kreatur zeichnen alles im Frustum.

## Vendor-Befund (three r184, `vendor/three.webgpu.min.js`)

1. **drawIndexedIndirect:** `backend.draw` zieht je Eintrag von `geometry.getIndirectOffset()` (Zahl oder Liste) EIN
   `drawIndexedIndirect(buffer, offset)` — kein Multi-Draw (WebGPU-Kern kennt keins). `info.update` bucht dabei die drawParams
   des Objekts, nie die Argumente auf der GPU: `renderer.info` lügt für jeden indirekten Zug (der Draw-Zähler liest darum zurück).
2. **IndirectStorageBufferAttribute:** `createIndirectStorageAttribute` legt den Puffer mit STORAGE | INDIRECT | COPY_SRC |
   COPY_DST an — ein Compute schreibt die Argumente, der Zug liest sie. Der Index: `createIndexAttribute` setzt STORAGE dazu,
   sobald das Index-Attribut ein `StorageBufferAttribute` ist — ein Compute kann den Index eines Satzes verdichten.
3. **Compute:** `renderer.compute` / `computeAsync`, `dispatchWorkgroupsIndirect`, `atomicAdd` im WGSL-Erzeuger; der Stamm rechnet
   schon heute rohes WGSL auf `backend.device` (`_wahlRechnen`, ein Compute je Kamera, eigene Bindegruppen).
4. **Tiefe des letzten Bilds:** `copyFramebufferToTexture` kennt Tiefe (`isDepthTexture` → die Tiefe des Render-Targets oder
   `getDepthBuffer`), der WGSL-Erzeuger kennt `texture_depth_2d` und `texture_depth_multisampled_2d` — die Tiefe des Hauptbilds ist
   in einem Compute per `textureLoad` lesbar, wenn ihr GPU-Textur TEXTURE_BINDING trägt. Gebaut wurde die Pyramide trotzdem
   nicht auf der Tiefen-Textur, sondern auf dem Tiefen-Abbild, das der Stamm im Pass-Bruch schon zeichnet (`_tiefenAbbild`,
   r32float, `stamm/bild-sicht.js:74`): `copyFramebufferToTexture` beendet den Szenen-Pass, kopiert auf DEMSELBEN Encoder und
   beginnt ihn mit `load` neu — in dieser Lücke rechnet die Sicht die Pyramide und den späten Zug, ohne eigenen Pass und ohne
   zweite Kopie der Tiefe.
5. **Storage und Indirect sind Flaggen:** `StorageBufferAttribute` und `IndirectStorageBufferAttribute` sind in r184 nur
   BufferAttribute mit `isStorageBufferAttribute` / `isIndirectStorageBufferAttribute` (`class Ex extends we{…}`,
   `class YC extends Ex{…}`), und das globale THREE aus `vendor/three-bootstrap.js` trägt beide Klassen nicht. Der Stamm setzt
   die Flaggen an EINER Stelle (`_sichtSpeicher`); beide Anker stehen in `spec/vendor-anker.json` („DIE SICHT DER EINHEIT"),
   `gate:vendor-anker` wird ROT, wenn ein Vendor-Wechsel sie umbenennt.

## Schritt 1 — die Sicht der Einheit an den Häusern

### Gebaut: EIN Modul `stamm/bild-tiefe.js` (Bild/tiefe)

- **Die Pyramide** (`_sichtTiefeBruch`, `_sichtPyramideStufen`): das Tiefen-Abbild des Hauptbilds (`_tiefenAbbild`, r32float,
  die opake Tiefe im Pass-Bruch) wird auf DEMSELBEN Encoder, bevor der Szenen-Pass wieder beginnt, zur Pyramide aus linearer
  Tiefe (fernste, nächste) je Block und jeder Halbierung darüber. Jedes Hauptbild schuldet den Bruch: bricht kein Leser der
  Szenen-Tiefe, zeichnet der Auslöser (`_sichtAusloeser`, ein Leser ohne Fläche nach allen opaken Körpern).
- **Das EINE Gesetz `verdeckt(Kiste, Weg, Schirm)`** (WGSL, `SICHT_TIEFE_WGSL`): die Kiste in der Lage des Bilds der Pyramide,
  ihr Rechteck geweitet um den Rand und die Parallaxe des Wegs; verdeckt ist sie, wenn ihre nächste Ecke hinter der FERNSTEN
  Tiefe des Rechtecks liegt. Ein Haufen zählt nur den Teil im Schirm (ganz außerhalb = verdeckt); ein Bündel, dessen Urteil eine
  Drehung des Kopfs überlebt, ist sichtbar, sobald es nicht ganz im Bild liegt.
- **Der Haufen-Schnitt in zwei Zügen** (`_sichtSatz` aus `_chunkSatzPass`, `_sichtTiefeRechnen`): der Abschnitt des Hauptbilds
  eines opaken Bau-Satzes zerfällt in Haufen zu 128 Dreiecken (Index-Folge, Kiste aus den Ecken). FRÜH (im Haken des
  Hauptbilds) prüft EIN Compute jeden Haufen gegen die Pyramide des LETZTEN Bilds, summiert die Plätze und kopiert die Indizes der
  sichtbaren dicht in den Sicht-Index — der Satz zeichnet als EIN `drawIndexedIndirect`. SPÄT (im Bruch) prüft er jeden früh
  verdeckten Haufen gegen die Pyramide DIESES Bilds; die nun sichtbaren zeichnet der späte Zug im selben Bild — kein Pop, keine
  Wanduhr, kein Rand für Bewegung.
- **Die Region-Bündel** (`_sichtBuendelVerdeckt` in `_archRegionBundleCull`): jede Region-Kugel als Kiste durch dasselbe Gesetz
  gegen die Pyramide des letzten Bilds mit dem Weg 4 m; das Urteil liest der Takt zurück (1–3 Bilder) und gilt, solange das Auge
  samt bewegtem Verdecker im Weg bleibt.
- **Das Speicher-Attribut** (`_sichtSpeicher`): r184 kennt Storage und Indirect nur als Flagge am BufferAttribute, das globale
  THREE (`vendor/three-bootstrap.js`) trägt die Klassen nicht — der Stamm setzt die Flaggen an EINER Stelle, gepinnt in
  `spec/vendor-anker.json` („DIE SICHT DER EINHEIT", `class Ex extends we{…isStorageBufferAttribute=!0}`,
  `class YC extends Ex{…isIndirectStorageBufferAttribute=!0}`). `vendor/` unberührt.
- **Kein fail-soft:** ein Renderer ohne WebGPU-Gerät meldet `SICHT-TIEFE: der Renderer trägt kein WebGPU-Gerät` als ERROR beim
  Namen (`_sichtTiefeGeraet`); nur der Null-Renderer schweigt (er zeichnet nie).
- **Im Trace:** `sicht` (`_sichtTiefeZahl`: Bilder, ohne Tiefe, Haufen, früh/spät, verdeckt, Dreiecke von Satz und Sicht-Index,
  Bündel) ersetzt `bergCull` im Regler-Trace.

### Gefallen (kein Zwilling, kein Flag)

| was fiel | wo es stand (HEAD 986eff04e9) |
|---|---|
| der Berg aus der Makro-Höhe (drei Sichtlinien je Region) + `AnazhRealm.BERG_CULL` | gefallen: `stamm/siedlung-instanz.js:134` `_bergSchattenVerdeckt`, `:137`/`:180` |
| Wald-vor-Wald (Query-Kasten je Bündel, jeder zehnte Frame) + Proxy-Tod | gefallen: `stamm/siedlung-instanz.js:229` `_bundleQueryTick`, `:311` `_bundleQueryProxyTod`, `stamm/siedlung-bauten.js:1959` |
| die drei Vendor-Umhüllungen der Occlusion-Query (gefallen: `__anazhVerdeckung`) um copyFramebufferToTexture, finishRender und resolveOccludedAsync | `stamm/bild-kosten.js:404`–`:476` |
| die Query-Sicht der Arenen (`renderer.isOccluded` je Eltern-Kette) | `stamm/stoff-instanz.js:1693` |
| `bergCull` im Regler-Trace, `occl-proxy` im Haushalt, der Berg-Eintrag des Fall-Wächters | `stamm/dirigent-regler.js:1743`, `spec/profiband/haushalt.json:676`, `scripts/diag-fall-waechter.cjs:102` |

Absenz-Grep der gefallenen Namen am Kopf (`_bergSchattenVerdeckt|BERG_CULL|_bundleQueryTick|_bundleQueryProxyTod|__anazhVerdeckung|occlusionTest|isOccluded|occl-proxy|bergCull`
über stamm/ scripts/ spec/ index.html): 0 Code-Stellen; zwei Zeilen Prosa nennen, was fiel (Kopf der Linse `scripts/diag-verdeckungs-abfrage.cjs:5`, „warum" des Vendor-Ankers).

Die Kronen-Dichte des Bau-Satzes (`_occlusionOccludes`, `stamm/siedlung-bauten.js:117`) bleibt: sie ist keine Sicht, sondern
eine Demotion der STUFE (`_archStufeUrteil :511`) — Gebiet von `einheit-stufe-aus-l0`.

### Die Linse (Familie Verdeckung, `scripts/diag-verdeckungs-abfrage.cjs`, `npm run gate:verdeckungs-abfrage`, check.yml:1313)

Dieselbe Wand mit neuem Inhalt (WebGPU auf swiftshader, `LINSE_GPU=software`, 124 s): ein Haus des Bau-Satzes, eine Wand
davor. VERDECKT: 75 Haufen hinter der Wand, 0 gezeichnet (5 Bilder mit Pyramide, jedes brach). FREI: die Wand fällt — im
ersten Bild 75 früh verdeckt, 75 spät gezeichnet, 0 Pop gegen 69 eingeschwungene. Selbsttest: blind (der frühe Zug zeichnet
alles) fällt ROT „HAUFEN TROTZ VOLLER VERDECKUNG GEZEICHNET", ohne späten Zug fällt ROT „POP" (69). 0 WebGPU-Validierungsfehler.
Konsum-Leser: `_chunkSatzPass` (der Zug des Satzes im Hauptbild) und `_archRegionBundleCull` (das Haupt-Urteil der Bündel).

### S1–S5 (Radeon 890M, `spike/einheit-sicht/mess-sicht.cjs`, A = 986eff04e9, B = der Schnitt, je Boot eine frische Welt)

Gemessen am 19.11. 20:44–20:57, Radeon 890M, `werkbank start --echt`, Third am Spieler-Platz der Spec, je Boot eine frische
Welt bis der Bau ruht, dann 60 Einzel-Bilder der Bank (`__bankRunde`, Bühne, Skala offen). Rohdaten `spike/einheit-sicht/mess.json`
(Treiber `spike/einheit-sicht/mess-sicht.cjs`). A = 986eff04e9, B = dieser Zweig.

| Ort · Third | Seite | Boots | Bau-Satz Dreiecke | Bau-Satz Züge | Hauptbild Dreiecke | Hauptbild Züge | Frame p50 ms | Frame p95 ms (je Boot) | eingeschwungen |
|---|---|--:|--:|--:|--:|--:|--:|---|---|
| wiese | A | 4 | 14.875 | 2 | 358.827 | 99 | 58,53 | 71,07 (73,38 · 68,77 · 63,91 · 78,14) | ja 54 s · ja 53 s · ja 54 s · ja 51 s |
| wiese | B | 4 | 13.887 | 4 | 357.168 | 103 | 60,10 | 72,31 (70,56 · 68,78 · 78,49 · 74,06) | ja 54 s · ja 55 s · ja 57 s · ja 50 s |
| genesis | A | 1 | 26.541 | 8 | 276.405 | 80 | 48,73 | 55,81 (55,81) | ja 49 s |
| genesis | B | 1 | 23.001 | 14 | 216.674 | 81 | 42,99 | 50,23 (50,23) | ja 66 s |

| Soll | Messung | Urteil |
|---|---|---|
| **S1** gezeichnete Dreiecke im Blick ≤ 50 % (Häuser, Bau-Satz) | Wiese 13 887 / 14 875 = **93,4 %** (Median 4 Boots), Genesis 23 001 / 26 541 = **86,7 %** (1 Boot); im Flug durch den Wald 561 877 / 1 791 871 = 31,4 % | **ROT** |
| **S2** ≤ 1 % der Masken-Pixel > 8/255 Luma (ruhend) | Genesis Bild 0: **0,000 %** von 138 079 Masken-Pixeln (0 Pixel im ganzen Bild) — `genesis-third-blind0.png` gegen `genesis-third-mit0.png` | **GRÜN** |
| **S3** Züge ≤ heute | Hauptbild Wiese 99 → **103**, Genesis 80 → **81** (Bau-Satz 2 → 4 und 8 → 14: je Satz ein früher und ein später indirekter Zug) | **ROT** |
| **S4** Frame p95 ≤ heute (ABAB, ≥ 4 Boots je Seite) | Wiese Median p95 71,07 → **72,31 ms** (+1,7 %; A 63,9–78,1, B 68,8–78,5 — die Streuung je Seite ist über zehnmal der Abstand); Genesis 1 Boot 55,81 → 50,23 ms | **ROT** (in der Streuung, nicht getrennt) |
| **S5** Bildpaar + Flug ohne sichtbares Poppen | Flug 24 × 1,5 m längs des Blicks an Genesis: Bild 0–17 unter 1 %, Bild 18–23 über 1 %, schlimmstes Bild 23 mit **15,0 %**; gegen A gegen A (Prüfung 1 unten) über dem Rauschen nur Bild 21–23 mit +2,9 bis +3,6 Prozentpunkten — `genesis-third-schlimmst.png` (rot: > 8/255, grau: Maske), `genesis-third-schlimmstMit.png` | **ROT** |

**Was die Zahlen sagen.** Die Sicht schneidet an den Häusern, was die Tiefe verdeckt, und nicht mehr: an der Wiese stehen die
Häuser fern, ihr Bild ist zu 50 % UNTER dem Bildpunkt und nur zu 14,6 % verdeckt (Schritt 0) — gemessen fallen 6,6 %, weil ein
Haufen nur ganz fällt. 50 % erreicht an den Häusern nur die STUFE aus der EINEN Haufen-Hierarchie (Zweig `einheit-stufe-aus-l0`),
die Sicht trägt das verdeckte Siebtel dazu. Die Bündel-Verdeckung urteilte an Wiese und Genesis 0 von rund 2 250 Urteilen
verdeckt (die Region-Kugeln sind größer als jeder Verdecker). Die Abweichungen des Flugs liegen auf Grashalmen und einem
Schatten-Fleck des Rasens, nicht an den Kanten der Häuser; die Ursache ist nicht getrennt — zu prüfen: der späte Zug zeichnet
nach den durchsichtigen Körpern (`ordnung` 9997) und deckt ihre Farbe, und die Kaskaden des Bilds, in dem der Satz im Hauptbild
ruht.

**Ehrlich offen (mit Grund):** S1 braucht die Stufe (nicht dieser Zweig, Dateien des Zweigs `einheit-stufe-aus-l0` unberührt);
S3 kostet der zweite Zug je Satz — er fällt erst, wenn der späte Zug in den frühen Auftrag schreibt (EIN Zug mit
`drawIndexedIndirect` am Ende des Bruchs); S4 trennt erst ein Lauf mit mehr Boots, wo die Häuser verdeckt stehen (Dorf, Genesis);
S5 trägt die offene Ursache oben; Vegetation, Gelände, Wagen und Kreatur laufen noch nicht durch die Sicht (Schritt 1 war der
Bau-Satz) — die Tafel nennt ihren verdeckten Anteil (Vegetation 11–18 %, Gelände 25–39 %).

Abdruck (`node scripts/werkbank.cjs abdruck --gegen 986eff04e9`, headless): Genesis und Wiese in allen neun Domänen byte-gleich;
am Dorf 4 Tier-Bestände anders (bär · fuchs · wesen · wolf) — derselbe Kopf gegen sich selbst (`--a-gegen-a`) zeigt am Dorf
ebenfalls 1 Ding anders (Bewohner-Netz), der Dorf-Takt schwankt (eingeschwungen nach 360 gegen 442 Takten).

### Die drei Prüfungen an S5 (Entscheid des Koordinators, 19.11. abends)

1. **A gegen A** (derselbe Kopf, derselbe Flug, ein zweiter blinder Flug gegen den ersten auf derselben Maske — der Boden des
   Rauschens je Bild, `rauschen` in `mess-sicht.cjs`), Radeon 19.11. 21:14, Genesis Third, 24 × 1,5 m: zwei blinde Flüge am selben Kopf weichen in Bild 21–23 schon um
   7,4 / 14,1 / 19,4 % der Maske voneinander ab (in Bild 0–4 und 17 um 0,0–0,3 %) — der größte Teil der S5-Zahl ist Rauschen
   desselben Kopfs, nicht der Schnitt. Die Sicht gegen blind im selben Lauf: 10,3 / 17,3 / 23,0 %. Über dem Rauschen bleiben
   3 von 24 Bildern mehr als 1 Prozentpunkt (Bild 21–23: +2,9 / +3,2 / +3,6), Bild 5–13 liegen +0,6 bis +0,9 darüber, der Rest
   unter +0,5. **S5 bleibt ROT** — Rest-Ursache, benannt, nicht bewiesen: die Leser der Szenen-Tiefe (Wasser, Feld-Pass, jeder
   Knoten auf `_szeneTiefe`) lesen das Abbild des Bruchs, und der späte Zug zeichnet NACH dem Bruch — was im Flug frisch
   aufgedeckt wird, fehlt ihrer Tiefe. Die Heilung an der Wurzel ist ein zweites Abbild nach dem späten Zug oder der späte Zug
   vor dem Abbild der Leser; beides ist nicht gebaut (Budget-Sicherung bei 98 %).
2. **Schatten — die Kaskaden urteilen nie mit der Pyramide.** Die indirekten Züge werfen keinen Schatten
   (`stamm/bild-tiefe.js:202` `castShadow = false`) und ruhen in jedem Haken außer dem Hauptbild (`stamm/bild-wahl.js:43`
   `_sichtTiefeRuht`); `verdeckt` rechnet nur im Hauptbild (`stamm/bild-wahl.js:48` `_sichtTiefeRechnen`, der Bruch
   `stamm/bild-sicht.js:161`); der Satz geht nur im Hauptbild in die Sicht (`stamm/siedlung-bauten.js:2947`, `haupt`). Den im
   Hauptbild ruhenden Satz stellt JEDER Haken zuerst zurück (`stamm/bild-wahl.js:16` → `:133`, das geteilte `S.ab` aus
   `_kaskadenSchmier`, `stamm/bild-schatten.js:642`) — die Kaskade zeichnet den vollen Satz mit ihrem eigenen Abschnitt. Die
   Bündel: das Haupt-Urteil liest nur der Hauptpass (`stamm/siedlung-instanz.js:144` `_sichtHaupt`), jeder Schatten-Pass wählt
   seine Werfer selbst. Ein Haufen, den das Auge nicht sieht, wirft also weiter.
3. **Der späte Zug liegt vor allem Durchsichtigen.** Er trägt den Stoff seines Satzes (opak; ein durchsichtiger Satz geht nie in
   die Sicht, `stamm/bild-tiefe.js:172`), steht damit in der OPAKEN Liste, und r184 zeichnet die opake Liste ganz, bevor die
   durchsichtige beginnt (`vendor/three.webgpu.min.js`: erst `this.opaque` über renderObjects, dann `this.transparent` über
   renderTransparents). `ordnung` 9997 ordnet ihn nur INNERHALB der opaken Liste: nach allen opaken Körpern und dem
   Auslöser (9996,5), vor Feld-March (9998) und Panorama (9999). Direkt hinter den frühen Zug kann er nicht: seine Argumente
   schreibt erst der Bruch, und der kommt nach den opaken Verdeckern, deren Tiefe die späte Prüfung braucht.

### E9 — die Leser der Szenen-Tiefe hinter dem späten Zug (GTX 1050, 20.11.)

**Geschnitten.** Das EINE Abbild bricht zu zwei Zeitpunkten (`stamm/bild-sicht.js` `_tiefenAbbild(frame, abbild, punkt)`): „sicht"
löst der Auslöser mit EIGENEM Knoten aus (`stamm/bild-tiefe.js` `_sichtAusloeser`, r184 bucht `updateBefore` je
`updateReference` — ein Knoten auf derselben Textur wie die Leser liefe nur einmal je Render), die Pyramide misst darin; „leser"
bricht der Knoten der Leser (Wasser, Feld-Pass, Rauch-Saum, Spiegel) NACH dem späten Zug, nur wenn der Bruch der Sicht in diesem
Render Aufträge trug (`A.spaet`). Die Bündel-Urteile laufen an der Welt-Uhr (`spielZeit`, s) statt an der Gerätezeit: der
bewegte Verdecker fährt in ihr, die Pause hält ihn (Wanduhr-Wand (W) grün, die gefallene Frist `_archRegionBundleCull` aus der Tafel).

**Linse** (Familie Verdeckung, `gate:verdeckungs-abfrage`): der Leser-Zeuge kopiert das Abbild nach dem Bruch der Sicht und nach
dem Hauptbild — am Kopf vor dem Schnitt ROT „LESER OHNE SPÄTEN ZUG (FREI): 75 Haufen spät gezeichnet, 0 von 28 800 Texeln",
mit dem Schnitt 806 von 28 800; der Mutant „ohne Leser-Bruch" fällt ROT, der Schritt der Frei-Phase ist EIN Hauptbild nach dem
EINEN Einschwingen (`__weltStehtNach`; auf der GTX 1050 lagen sonst 400 Renders ohne Hauptbild zwischen zweien).

**Gemessen** (GTX 1050, Genesis Third, ein Boot je Lauf, `mess-sicht.cjs --nur-b --orte "" --flug genesis`):

| | mit Leser-Bruch | ohne (vorher) |
|---|--:|--:|
| GPU je Frame, ABBA × 8 zu 24 Bildern im selben Boot, Lauf 1 · Lauf 2 | 26,308 · 26,506 ms | 26,268 · 26,440 ms |
| Render-Pässe · draw · drawIndexed · drawIndexedIndirect je Frame | 9,83 · 8 · 23 · 62,5 | 7,83 · 7 · 23 · 62,5 |
| S5 Flug Bild 23, Anteil der Maske > 8/255 gegen blind (Lauf 1 · 2) | 14,56 · 11,74 % | 14,35 · 11,72 % |

Der Bruch kostet +0,04 bis +0,07 ms (+0,2 %, die Runden überlappen) und zwei Render-Pässe samt einem Zug je Frame. **S5 bewegt er
nicht** — die benannte Rest-Ursache (die Leser) ist widerlegt; ebenso das Bündel-Urteil (Sicht an, Bündel nie verdeckt: Bild 23
7,36 gegen 7,21 % mit Urteil). Was bleibt, färbt beidseitig (Bild 23: 10 711 Pixel heller, 16 013 dunkler, Quotient 1,008) auf
Halmen und Lichtflecken des Rasens, nicht an Häusern — ein Versatz des Musters, kein fehlender Haufen.

**Das Werkzeug:** der Flug markierte die Schatten-Map einmal je Fahrt (gegen Lehre 17); je Schuss neu fällt das Rauschen A gegen A
in Bild 4–20 von bis zu 3,14 % auf ≤ 1,82 %. In Bild 21–23 springt es von Lauf zu Lauf (Bild 23: 9,77 · 1,17 · 0,92 · 6,63 %) —
dort trennt der Flug die Sicht nicht vom Rauschen. **S5 bleibt ROT**, offen mit Grund: die Quelle des Versatzes in Bild 21–23
ist nicht benannt (Messname `FLUG genesis/third VORZEICHEN`).

### S5 — der wandernde Schatten beim Namen (GTX 1050, 20.11. 04:16–04:28)

**Der Zeuge** (je Schuss des Flugs: Tempo des Auges, Sonne, Fit jeder Kaskade): die Sonne steht in allen fünf Flügen gleich
(0 · 0,962 · 0,272), der Fit der nahen Kaskade nicht — Bild 23 x0 −52,27 und −52,32 m (blind, 15,5 und 15,7 m/s) gegen −44,62 m
bei Breite 16,97 statt 24,52 m (mit, 0 m/s). Täter: `_augeWegJetzt` (`stamm/bild-wahl.js`) rechnete das Tempo an der Gerätezeit
(`performance.now()`, Schwelle 250 ms), und die Box der Kaskaden liegt über den Weg, den es trägt (`_kaskadenPassen`): dauerte
ein Schuss länger, fiel das Tempo auf 0 und die Box schrumpfte; im Spiel dasselbe je Gerät und Last.

**Geschnitten:** das Tempo liest die Welt-Uhr (`spielZeit`, ein Schritt ohne Welt-Zeit ist ein Sprung); die Tafel der Wanduhr
verliert die Ausnahme `laden _augeWegJetzt`, die Wand (W) hält den Rückfall; die Fahrt der Linse sicht-arbeit (F) läuft 33 ms
Welt-Uhr je Bild statt 33 ms Wanduhr, durch die EINE Tür der Uhr von außen (`_weltUhrNimm`, die Ein-Schreiber-Wand nannte
`st.spielZeit +=` in der Linse einen Täter).

**Gemessen** (drei Läufe, je ein Boot, Genesis Third, 24 × 1,5 m): A gegen A und Sicht gegen blind in JEDEM Bild **0,00 %** der
Maske (138 099 bis 1 519 757 Pixel), im ganzen Bild 0 Pixel > 8/255 — vorher Bild 23 9,77 · 1,17 · 0,92 · 6,63 % Rauschen und
7,2 bis 14,6 % Sicht gegen blind. Die Sicht arbeitet dabei: 14 106 Haufen geprüft, 779 verdeckt, 169 spät gezeichnet, Dreiecke des
Satzes im Blick 240 903 → 167 140 (−30,6 %). **S5 GRÜN** (Soll: kein Bild über 1 % — 0 von 24).

# DICHTE UND FERNE — wie die Besten es zeichnen, und der Weg für AnazhRealm (Koordinator 02.11.2026, für den nächsten Agenten)

**Auftrag des Schöpfers (02.11. 22:20):** Die volle Prüfbühne ist NICHT das Maximum — Dichte wächst parametrisch und durch Spieler; der Blick
vom Hochhaus/Berg über die dichte Ferne ist dasselbe Problem. Die Wirklichkeit (New York vom Hochhaus) laggt nicht, AAAA auch nicht. → Zellen
„bühne-voll“ und „turm-blick“ gehören ins Profi-Band (E). Gesetz bleibt Gebot 7: **Kosten an Schirm + Änderung, nie an Weltgröße.**

## Was die Besten tun (Kern-Prinzipien)
1. **Ein Fehler-Maß: Pixel auf dem Schirm.** Nanite (UE5, City Sample der Matrix Awakens: Nanite + World Partition + HLOD + Mass-AI für Menge)
   wählt Geometrie-Cluster nach projiziertem Fehler; Kosten skalieren mit Bildpunkten, nicht mit Dreiecken der Welt. Für uns ohne Nanite:
   die Stufenwahl JEDES Systems (Bau-Satz, Streu-Satz, Fern-Ring, Bewohner) nach Bildschirm-Fehler aus EINER Funktion.
2. **HLOD: Gruppen verschmelzen mit der Entfernung.** Ferne Gebäude-Gruppen → ein gebackenes Mesh je Block/Kachel → noch weiter ein Impostor
   je Block (BlockMaps, Unity MegaCity-HLOD mit Octahedral-Impostoren: ~500k Dreiecke gespart). Achtung aus der Forschung: in der Ferne
   dominieren FASSADEN-FARBEN das Stadtbild — ein Impostor muss die Fassaden-Albedo tragen, sonst kippt das Bild; Schatten fehlen sichtbarer
   als Geometrie-Details.
3. **Octahedral-Impostoren** sind der heutige Standard für ferne Einzelobjekte (three.js-Beispiel: 200k Bäume); Preis ist Overdraw → Alpha-Test
   statt Blend, Größe der Karte nach Schirm.
4. **GPU-getriebenes Zeichnen:** Culling (Frustum + Hi-Z-Verdeckung) im Compute, Draw-Argumente auf der GPU, wenige indirekte Draws.
   **WebGPU-Grenze (Stand der Recherche):** multi-draw-indirect ist in Dawn/Chrome ein OPTIONALES Feature (`multi-draw-indirect`), nicht im
   Kern-Spec; einzelne `drawIndirect` je Stoff sind überall möglich. Falle: jeder indirekte Puffer wird von Chrome per Compute validiert —
   ALLE Argumente in EINEN Puffer legen (toji.dev: getrennte Puffer kosteten die Hälfte des Render-Pass).
5. **Verdeckung:** three.js hat keine Standard-Occlusion; WebGPURenderer hat Occlusion-Queries (Beispiel webgpu_occlusion). Hi-Z (rastergrid)
   ist der GPU-Weg. In einer dichten Stadt verdeckt die erste Häuserzeile fast alles — der größte Hebel für „bühne-voll“.
6. **Simulation in Stufen** (Mass-AI): nahe Agenten einzeln, ferne als Statistik/Menge, Kosten an Änderung (bei uns bewiesen: Stand-Suche der
   Bewohner 2,6 s → 0,2 s, als sie an Änderung statt an die Welt gebunden wurde).
7. **Zeitlich verteilen:** Ferne/Statisches nicht jedes Bild neu (Fern-Ring über N Bilder), Shader-Varianten vor dem ersten Bild (PSO-Cache;
   bei uns die Stoff-Foundry: 55 Varianten → wenige Graphen).

## Abbildung auf AnazhRealm (wo es heute bricht, wo der Hebel sitzt)
- **Bau-Satz / GeometrieArena** (`stamm/stoff-instanz.js`): je Stoff ein Zeichner, Arenen — die Basis für EINEN indirekten Puffer je Stoff ist da.
  Nächster Schritt: Sichtbarkeit (Frustum + Hi-Z) als Compute über die Instanz-Liste, Ergebnis in den Argument-Puffer.
- **Block-HLOD aus dem Karten-Bäcker** (pipeline.K2, Karte aus derselben Rechnung wie L0): statt je Werk eine Karte → je Siedlungs-Block/Kachel
  ein gebackenes Mesh + Fassaden-Impostor; die Stadt in der Ferne = Dutzende Draws statt Tausende.
- **Fern-Ring** (`stamm/gelaende-fern.js`): schon ein Ring mit Saum; die Stadt muss IN den Fern-Ring (Block-Impostoren als Teil der Ferne),
  sonst endet die Stadt am Rand des Bau-Rings.
- **Streu/Vegetation:** Octahedral-Impostoren für Bäume existieren (fimp:atlas); dieselbe Bahn für Häuser-Blöcke.
- **Bewohner/Verkehr:** Leib nur nah; fern Menge als Instanz-Strom ohne Einzel-Takt.
- **GPU-Leine** (`_gpuLeineStraff`): GPU-Arbeit ohne Bild nie — gilt für jede neue Ferne-Arbeit (Lehre affekt 02.11.).

## Reihenfolge (Zahl führt)
1. Zellen „bühne-voll“ (Prüfplatz F, alle Assets geladen) und „turm-blick“ (Blick von der Höhe über die Stadt) ins ABAB/Profi-Band; je Zelle:
   Draws, Dreiecke, CPU-Takt, GPU-ms, VRAM (GTX 1060 + Radeon 890M). Täter beim Namen (welcher Satz/Stoff trägt die ms).
2. Hi-Z/Occlusion für den Bau-Satz (größter Hebel in der dichten Stadt), dann EIN Argument-Puffer je Stoff.
3. Block-HLOD aus dem Karten-Bäcker + Stadt im Fern-Ring.
4. Stoff-Foundry (Varianten vor dem ersten Bild) — hilft B (Ankunft) und Dichte zugleich.

## Quellen
- City Sample (Matrix Awakens): https://dev.epicgames.com/documentation/unreal-engine/city-sample-project-unreal-engine-demonstration
- Chrome „What's next for WebGPU“ (multi-draw-indirect, bindless, subgroups): https://developer.chrome.com/blog/next-for-webgpu
- Dawn multi_draw_indirect: https://dawn.googlesource.com/dawn/+/cc32bc406cca3397cbcdcd29b8ea8e4a93c995ad/docs/dawn/features/multi_draw_indirect.md
- WebGPU indirect-draw best practices (toji.dev): https://toji.dev/webgpu-best-practices/indirect-draws
- GPU-controlled rendering (Imagination): https://docs.imgtec.com/sdk-documentation/html/whitepapers/GPUControlledRendering.html
- BlockMaps (Stadt-Impostoren): https://www.crs4.it/vic/data/papers/vast2009-blockmaps.pdf · Massive cityscapes: https://vcg-legacy.isti.cnr.it/Publications/2009/DCGGMS09/massivecityscapes_sub.pdf
- HLOD + Octahedral-Impostoren (Unity MegaCity): https://discussions.unity.com/t/hlod-streaming-octahedral-impostors-using-megacity-subscenes/742223
- Impostoren (c0de517e): https://c0de517e.com/007_impostors.htm · three.js Wald aus Octahedral-Impostoren: https://discourse.threejs.org/t/a-forest-of-octahedral-impostors/85735
- three.js BatchedMesh + BVH-Culling: https://threejs.org/examples/webgl_batch_lod_bvh.html · Occlusion in three.js: https://discourse.threejs.org/t/in-three-js-have-occlusion-culling/15076
- Hi-Z (rastergrid): https://www.rastergrid.com/?p=85

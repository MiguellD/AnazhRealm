# Die WASSER-FINALE-FORM — eine Fläche, vom Tiefenpuffer versöhnt (der Profi-Weg)

> **Status:** PLAN + im Bau (05.06.2026, Schöpfer-Auftrag „bring das gesamtsystem wasser endlich in die finale form, synergetisch — von den genialsten lernen, ordnung höherer stufe, keine halben sachen"). Gegründet auf zwei tiefe Lesungen: (1) den eigenen Code als Fremder kartiert (12 Kontradiktionen), (2) wie die Riesen es lösen (Minecraft/Distant-Horizons · Sea of Thieves · No Man's Sky · Unreal Water · GDC 2023 „Photon Water").
>
> **Vor Arbeit an Wasser / Wasser-Render / Wasser-LOD / Ufer / Ozean-Ferne ZUERST lesen.**

---

## Die EINE Wurzel (gemessen, nicht behauptet)

**Unser Wasser ist ein VOLUMEN (Flood-Fill-Zellen → geschlossene Surface-Nets-Iso-Hülle), das mit dem Terrain durch ZELL-Abgleich versöhnt wird (OOB-Nachbar-Lesen, LOD0-überall). Jede ausgelieferte, gefeierte Wasser-Welt macht das Gegenteil: Wasser ist eine FLÄCHE (einseitige Oberseite), die mit dem Terrain durch den TIEFENPUFFER versöhnt wird (nach den Opaken gezeichnet, tiefen-getestet).**

Externe Bestätigung (das stärkste Indiz): der **Distant-Horizons**-Mod ist das einzige andere ausgelieferte LOD-Voxel-Wasser — sein Bug-Tracker trägt unsere exakten Symptome (#424 Seiten-Cull zeigt Void · #503 LOD-Naht, schlimmer je mehr LODs · #606 Höhen-Disagreement → Grid-Glitch). Ihre Heilung: konsistente Höhen-Ableitung + keine sichtbare Unterseite.

Drei Symptome → eine Wurzel:
1. **„Klettert Strukturen/Ufer hoch"** — die GEOMETRIE entscheidet die Uferlinie. Profi: die Uferlinie ist ein Pro-Pixel-Tiefen-Effekt (`sceneDepth − waterDepth`), folgt dem Terrain exakt, egal wie grob das Wasser-Mesh. (Wir haben `waterThick`/V13.5 — trägt die Last nur noch nicht allein.)
2. **„Wasser auf der falschen Seite des Bodens" (unter der Karte)** — ein VOLUMEN hat Unterseite + Seiten; eine FLÄCHE nicht. `mat.side = DoubleSide` zeigt sie von unten. Unterwasser-Blick trägt der Voll-Bild-Tint (`playerEyesUnderwater`), nicht das Mesh → einseitig ist sicher.
3. **„Schlimmer an LOD/±1024"** — zwei Skalen (Wasser LOD0 über Terrain LOD2/3) + zwei Klassifikatoren an der Atlas-Grenze (eingefrorener Atlas vs. mutierbarer `state.waterLevel`).

## Die finale Architektur (Hybrid — der GDC-2023-„Photon-Water"-Weg, an unsere Vision angepasst)

Harte Bedingung: **reaktives Nah-Wasser** (graben/dämmen → Zellen → Wasser reagiert) schließt eine reine Ozean-Schale aus. Also das disziplinierte Hybrid:

- **Die ZELLEN bleiben die Wahrheit** (reaktiv, manipulierbar — die Vision, V9.69). Unangetastet.
- **Die RENDER-Schicht wird vom Volumen zur FLÄCHE**: einseitige Oberseite, von Terrain per TIEFE versöhnt (nach Opaken, depth-getestet, Ufer im Shader).
- **Fern reitet das Wasser die Terrain-LOD** (statt erzwungenem LOD0) — feines Wasser schwebt nie mehr über grobem Terrain.
- **Jenseits ±1024 ist der Ozean DIESELBE logische Sea-Level-Fläche** wie das Nah-Atlas-Wasser — die Grenze ist ein LOD-Wechsel, keine Klassifikator-Kante; das Nah-Feld faded seine Höhen-Abweichung an `waterLevel`.

## Der Bogen (jeder Schritt: Ziel · Mechanik · Messung · Risiko · Sign-off)

### **W1+B6 — Flächen-Werdung → reine OBERSEITE (der Schlussstein, reaktivitäts-sicher)** — ✅ GEBAUT (gemessen, headless)

> **V18.3-Vollendung (kritischer Review):** W1 (BackSide + Unterseiten weg) war unvollständig — die fast-vertikalen SEITEN-WÄNDE blieben = das „Klettern" (der Tiefen-Shader verblasst nur dünnes Ufer-Wasser, nicht tiefe Wände). **B6: `_cullWaterToTopSurface` behält NUR die Oberseite (`ny<−0.2`)** → Wände+Unterseiten 100%→0% (gemessen), die Uferlinie trägt der Tiefen-Shader ALLEIN (die Riesen-Regel: Geometrie definiert nie die Uferlinie). **B1: der Wasserfall-Pool teilt das `hydroSurfaceMaterial`** → BackSide machte ihn von oben unsichtbar → Pool-Drehung `+PI/2` (Rückseite oben). **B5 (offen, Browser):** der Unterwasser-Blick verliert mit BackSide die Wasserdecke → ein Unterwasser-Pass ist Folge-Arbeit.
- **Ziel.** Wasser rendert als einseitige Oberseite, nicht als geschlossenes Volumen. Tötet „unter der Karte" + die Seiten-Wände. Zellen unangetastet.
- **Mechanik.** (a) `mat.side = FrontSide` (Rückseiten-Cull — von unten unsichtbar; Unterwasser trägt der `playerEyesUnderwater`-Tint). (b) Nach dem Iso die nach-UNTEN zeigenden Dreiecke verwerfen (`_cullDownFacingWaterTris`, Face-Normal `ny < −downCull`) → keine sichtbare Unterseite, die grobes Fern-Terrain nicht verdeckt. (c) Die Uferlinie trägt der Tiefen-Shader allein (V13.5 `waterThick`, schon da).
- **Messung.** `diag-water-surface.cjs`: Wicklung (Oberseiten `ny>0`?), Down-Faces vor/nach (→ ~0), Zellen unverändert (Reaktivität), Mesh nicht leer.
- **Risiko.** Niedrig (Zellen + Nah-Look der Oberseite unberührt). Pixel-Wahrheit = Browser.
- **Sign-off.** Unter der Karte sauber; Nah-Wasser unverändert schön.

### **W2 — Wasser reitet die Terrain-LOD (Zwei-Skalen)** — ⛔ V18.2 GEBAUT, V18.3 ZURÜCKGEROLLT (Shortcut → reproduzierte DH #606/#503); braucht KONSISTENTE Höhe + Stitching

> **ZURÜCKGEROLLT V18.3 (kritischer Review, GEMESSEN):** der V18.2-Weg war, das Iso-GRID fern zu vergröbern (`gridStep=step·2^waterLod`), während die Zellen LOD0 bleiben. Der Review MASS: das vergröbert auch die Wasser-HÖHE (Interpolation zwischen groben Y-Gitterpunkten → ~3 m Verschiebung gegen den feinen Nachbarn) + der grobe Pad quillt ~6–12 m über den Footprint → eine Höhen-STUFE + Überlappung am Band-1↔2-Rand = EXAKT Distant-Horizons #606/#503, die wir als Lehre ZITIERT hatten. „Die Diskrepanz in den Fog parken" ist der profi-untypische Shortcut. **Der richtige Weg (eigener Bogen): KONSISTENTE Höhe ableiten (die grobe Iso an die feine Nachbar-Höhe klemmen) + die Cross-LOD-Naht STITCHEN/MORPHEN (Unreal-Quadtree 4↔1/16↔4) ODER eine einzelne Ozean-Schale fürs Fernfeld** (Sea-of-Thieves) — nicht reines Grid-Coarsening. Bis dahin lebt Wasser auf EINER Skala (LOD0), naht-frei. Die ALTE FPS-/Fern-Klettern-Wurzel:
- **Ziel.** Fernes Wasser (Band 2/3) meshet auf der Chunk-LOD statt erzwungenem LOD0 → grobes Terrain verdeckt es korrekt, kein Fern-Ufer-Versatz (dein „klettert zum Kliff"). = U2 der Detail-Kaskade, aber als KORREKTHEITS-Fix.
- **Mechanik.** `_buildVoxelChunkWaterIsoSurface` liest `_detailBand(r).waterLod`; nah LOD0 (naht-frei), fern grob. Die Cross-LOD-Naht via Morph/Weld (Unreal-Quadtree-Stil: 4↔1/16↔4) ODER Fog-Tarnung (§2 der Kaskade). **Die V9.93-Falle (Wasser-LOD-auf-Terrain-LOD gab die Naht) wird durch die W1-Flächen-Werdung + Skirts + Tiefen-Versöhnung entschärft** — die Naht ist nicht mehr ein Iso-Positions-Klaffen, sondern eine Tiefen-getestete Fläche.
- **Messung.** Fern-Wasser-Vertices LOD0→LOD2 ~16× weniger; kein Fern-Ufer-Versatz headless-messbar (Wasser-Top vs. Terrain-Top am Fern-Chunk).
- **Risiko.** Mittel (LOD-Naht-Geschichte). Browser-Sign-off Pflicht.

### **W3 — Die ±1024-Grenze: eine kohärente Fläche** — ✅ GEMESSEN: NON-BUG (kein Fix nötig)

> **GEMESSEN V18.2 (`diag-water-fill.cjs`): der Ozean ist schon EINE kohärente Sea-Level-Fläche.** Der Ozean-Atlas-`wY` ist uniform −3 = `state.waterLevel`; `_atlasWaterLevelAt` knapp innen (-1020) vs. außen (-1030) der Grenze = **0 m Stufe** über alle z-Proben. V17.117 (H3) leitet den fernen Ozean schon vom selben `waterLevel` ab → keine Klassifikator-Kante, kein W3-Fix (keine Nicht-Bugs heilen). Die unter-der-Karte-Sicht bei −1048 war das VOLUMEN + die Zwei-Skalen (W1+W2), nicht eine Spiegel-Stufe. (Ferne Seen/Flüsse jenseits ±1024 existieren nicht — region-lokal — also auch dort keine Stufe.) Die alte Hypothese (Atlas-Klassifikator-Kante):
- **Ziel.** Nah-Atlas-Wasser + Fern-Global-Ozean = dieselbe Sea-Level-Fläche; das Nah-Feld faded seine Abweichung an `waterLevel` an der Grenze (Sea-of-Thieves-Wellen-Attenuation / Unreal Water Zone).
- **Mechanik.** `_atlasWaterLevelAt` glättet den Übergang in-region→beyond statt harter Quell-Umschaltung; der Iso behandelt die Grenze als LOD-Wechsel.
- **Messung.** Wasserspiegel-Stetigkeit über ±1024 (kein Sprung); `diag-far-water.cjs` erweitert.

### **W4 — „Seen füllen sich nicht"** — ◐ GEMESSEN: die Zellen FÜLLEN (Render → Browser)

> **GEMESSEN V18.2: die Wasser-ZELLEN füllen Seen korrekt** (der Bergsee-Playtest-Invariant „Bergsee-Cells über waterLevel sind WATER" ist grün; `diag-water-fill.cjs` konnte headless keinen Bergsee in den nahen Ring streamen, aber der bestehende Test deckt die Klassifikation). → „füllt sich nicht" ist ein RENDER-Symptom (die W1/W2-Flächen-Werdung macht die Füllung sichtbar — vorher verdeckte das Volumen/die Unterseite/die Zwei-Skalen sie) + Browser-Sign-off. WENN es im Browser persistiert, ist die nächste Messung an der Schöpfer-SEESTELLE: (a) baut der Iso für den See-Chunk (Queue-Starvation?), (b) trocknet der V13.14-Sky-Filter den See unter neuer Überhang-Topologie, (c) Hydrologie-Spiegel vs. V14-Becken-Tiefe. Die Kandidaten (zu MESSEN an der echten Stelle, nicht raten):
- **Ziel.** Nach der V14-Terrain-Umwälzung füllen Seen sichtbar. Wurzel-Kandidaten (zu MESSEN, nicht raten): (a) Flood-Zellen werden bei Nachbar-Load nicht neu geflutet (Kontradiktion 11), (b) der Sky-Open-Filter (V13.14) trocknet See-Wasser unter neuer Überhang-Topologie, (c) die Hydrologie-Atlas-Spiegel passen nicht zur neuen Becken-Tiefe.
- **Messung.** `diag-lake-fill.cjs`: ein Becken streamen, Wasser-Zell-Füllung vs. Becken-Volumen.

### **W5 (Nordstern, optional) — Felder → adaptives CDLOD-Mesh**
- Wenn Flow/Wellen/Schaum fern glatt aus-LODen sollen: das reaktive Nah-Feld zu (Höhe/Geschwindigkeit/Schaum)-Feldern → adaptives CDLOD-Mesh, das in den Fern-Ozean blendet (die GDC-2023-Architektur). Nicht nötig für die Bugs; die Decke.

## Was NICHT zu tun (die Anti-Lehre)
- Wasser NICHT als geschlossenes Volumen auf einer ANDEREN LOD als das Terrain halten — diese Kombination IST der Bug.
- Die Uferlinie NICHT in der Geometrie heilen (Zell-Klassifikation/Klettern), wenn die TIEFE sie pro Pixel exakt löst.
- KEINE 3D-GPU-Fluid-Sim (die Heilige-Lektion-Sünde — killt die FPS, löst die statische Becken-Begrenzung nicht).

## Quellen (die Riesen)
Minecraft Wiki (Fluid/Water-Cull) · Distant-Horizons Issues #424/#503/#606 (das Profi-LOD-Voxel-Wasser mit unseren exakten Bugs) · Johanson Projected-Grid-Thesis · Unreal Water Meshing (Quadtree-Morph 4↔1/16↔4, Water Zones, per-Body-Höhe) · GDC 2023 „Photon Water" (LIGHTSPEED, unified sim+render, CDLOD) · Cyanilux/Roystan/IceFall (Tiefen-Ufer) · DynDOLOD (Terrain-LOD leicht runter, Vertices welden) · UE Single Layer Water (einseitig + depth).

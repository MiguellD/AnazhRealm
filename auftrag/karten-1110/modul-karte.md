# Modul-Karte des Stamms (11.10.2026)

Diese Karte folgt dem Auftrag der Entscheidung 11.10. §6.6: „Neubau je Domäne von innen; die Modul-Zielkarte wird vorgezogen; jede Karte, die eine Zone anfasst, zieht sie als Modul heraus, K09 zuerst". Die Messbasis ist `anazhRealm.js` im Worktree `schau-v18537` = 66005ca6 (V18.538), nur gelesen.

- **Eigene Messung:** acorn-AST über die EINE Klasse, 2 528 Glieder (2 527 Methoden + constructor).
  - Probe: `…\scratchpad\modul-karte\grenzen.cjs` mit den Rohdaten `stamm.json` und `fremd-schreib.json`.
  - Zuschnitt: `module4.cjs` → `zuschnitt.json`, `m4.json`, `tafel.txt`.
  - Schichten-Kosten: `kosten.cjs`.
  - `…` steht für `C:\Users\micha\AppData\Local\Temp\claude\C--Users-micha-AnazhRealm-profiband\3dfb47a4-adf9-43a5-abe0-d203f372df5e`.
- **Die drei Leser:**
  - `…\scratchpad\drittel1-z0109\` mit `bloecke.cjs` (38 Blöcke §01–§09);
  - `…\scratchpad\drittel2-t2\` mit `cluster.cjs` (62 Teil-Gruppen §10–§18);
  - die Blockspannen §18–§26 aus dem dritten Leser.
- **Zählweise:**
  - **Schreibstelle** = Zuweisung, `++`/`--`, `delete`, Mutator (`push` · `splice` · `set` · `add` · `delete` · `clear` · `sort` · `fill` …) oder `Object.assign` auf `this.state.X`, `this.X` oder `AnazhRealm.X`. Aliase zählen mit: `const st = this.state`, `const p = this.state.player`, Destrukturierung.
  - Der constructor zählt nicht, denn dort ist es Geburt.
  - **Ruf** = `this.X` / `AnazhRealm.X` auf ein Klassen-Glied.
  - **Zeilen** = Methoden-Zeilen ohne Zwischen-Kommentare.

---

## §0 Drei Sätze

1. Der Stamm zerfällt in 16 Fach-Module und den Dirigenten. Geschnitten wird nach Besitz und Schicht, nicht nach Atlas-Zone. Heute schreiben 201 Methoden an 572 Stellen Zustand, den ein anderes Modul besitzt, und 503 von 2 097 modulübergreifenden Rufen gehen aufwärts.
2. Ein Modul wandert als klassische `defer`-Datei unter `realm/`. Sie registriert eine Klasse, deren Methoden der Stamm vor dem Boot fail-closed an `AnazhRealm.prototype` hängt. Das geschieht byte-gleich, bewiesen per Hash je Methode, und lässt Instanz-API, `__codeOf` und die 206 playtest-Namen unverändert.
3. Die Schienen und der Pilot (§18 Lebens-Feld) sind Schritt 0 von K09. Danach zieht jede Karte ab K09 ihre Zone vor der Änderung byte-gleich heraus; den Rest trägt H1 am Nullpunkt der Zweige. Die Wand `gate:grenzen` (≤ 3 s) hält Besitz, Richtung und Register mit einer namentlichen Ratsche, die nur fallen darf.

---

## §1 Die Ziel-Module

### 1.1 Regeln des Zuschnitts

1. **Die Einheit des Schnitts ist der BLOCK** (eine zusammenhängende Methoden-Spanne je Thema), nie die Atlas-Zone.
   - §03, §05, §07, §11, §13, §15, §17, §20 und §25 tragen je 4–14 Domänen.
   - Die Etiketten von §20 „Spawn-Ökologie" und §25 „HUD" führen in die Irre.
2. **Besitz:** Jeder state-Schlüssel und jedes `this._`-Feld hat genau EIN besitzendes Modul. Nur dieses schreibt; alle anderen lesen oder rufen seinen Port. Der Besitz steht in der Registrierung der Modul-Datei (§2.1), also EINE Quelle neben dem Code.
3. **Schichten:** Die Module stehen in einer festen Ordnung (1.2). Abwärts wird gerufen; aufwärts gibt es nur drei Wege, nie einen Ruf:
   - **Lage lesen:** Der Besitzer schreibt einen Schnappschuss in seinen state-Schlüssel, Höhere lesen ihn, Tiefere lesen ihn read-only.
   - **Melden:** Ein Ereignis geht an den Dirigenten oder den Dienst `_uiDirty(raum)`; der Höhere holt es in seinem Takt ab.
   - **Kern:** Das Gesetz wandert in einen `*-core.js`, den alle von unten lesen (das K09-Muster).
4. **Dienste (Schicht 0)** darf jeder rufen. Sie wohnen beim Dirigenten und rufen nie ein Fach-Modul. Was oben wohnt (UI, Speicher), registriert sich beim Boot als Abnehmer (Inversion).
5. **Datei ≤ ~3 000 Zeilen:** Ein Modul ist die Besitz-Einheit und hat 1–4 Dateien. Die Datei ist die Lese-Einheit. Eine Karte liest ihre Datei plus die Ports, nie den Stamm.
6. **Daten wandern mit ihrem Leser:** 338 von 464 Statics in §26 liest genau eine Zone. Der Gelände-Teil der Statics geht in den Kern: DC_*, AQUIFER_TIEFE_M, CELL_STATE, MACRO_ANKER, FEUCHTE, HYDROSPHERE, EROSION und TARN, die heute im voxel-worker als Literal-Zwillinge stehen. Im Dirigenten bleiben die 11 Knoten-Statics und der Gesetz-Leser §26b.

### 1.2 Schichten-Tafel (unten → oben)

| Schicht | Modul | Methoden-Zeilen | Blöcke (Zone · Spanne bzw. Gruppen-Start) | ziehende Karte |
|---|---|---|---|---|
| 0 | **Dienste** (im Dirigenten) | 1 194 | log/logError/flushLog (§01) · `_el`/`_elAppend` (25a) · Journal 13380–13494 · `getGameMode` · Takt-Budgets (§11 Welt-March/Takt) · `saveState` als Anstoß · `_uiDirty` · `_queueDispose` · `_spielerSagt` · `setVec` | Schritt 0 |
| 1 | **Gelände** (+ Kern `gelaende-core`) | 6 065 | §07A 23174–23933 · §07E + §08 + §09A 26116–29104 · §11 Chunk-Bau, Feld-Abfrage/Strahl, Blocker-Netz, Fern-Ring, Streaming/Edits · `_runRaycast` 90980 · `getTerrainHeightAt` 98522 | K09 |
| 2 | **Wasser** | 3 628 | §09C 29372–30725 · §11 Hydro-Abfrage, Hydro-Genese · §20j 78745–79898 | H1 (K02 läuft vor den Schienen) |
| 3 | **Stoff** | 2 841 | §05E Gras-Stoff/Wind 16059–16355 · §10 30726–32400 · §17 Impostor-/Karten-Atlas · §19 71214–71458 · §20g Instanz-Senken 77213–77676 | H1 |
| 4 | **Studio-Brücke** (Foundry-Host) | 3 946 | §20b 71791–72547 · §20d–f 73680–77212 | H1 |
| 5 | **Bau** | 5 867 | §02C 3926–4115 · §15 Affordanz-Prädikate, Teil-Geometrie/Varianten-Bauer · §16 60313–63988 · §22-Bauplan-CRUD 84922–85201 | H1 |
| 6 | **Siedlung** | 6 164 | §14 Membran/Nebel/Tor/Dorf-Render · §15 Varianten/Okklusion/Arch-LOD · §17 Arch-Mesh, Arch-Flatten, Chunk-Satz, Bau-Satz/Werfer, LOD-Slots, Fundament/Wege/Kronen, Arch-Instanzen · §20c 72548–73679 | K10 |
| 7 | **Vegetation** | 5 651 | §11 Nah-Wiese, Nah-Streu · §15 Gebackene Regionen+Streu, LOD-Wahrnehmung, Baum-Wuchs · §17 Baum-Geometrie/Laub-Atlas · §20a 71459–71790 · §20i 77879–78744 · §20k 79899–80281 | H1 |
| 8 | **Bild** | 6 675 | §05E Himmel 15425–16058 + 16356–16472 · §07B 23934–24542 · §11 Szene-Tiefe, Feld-Pass, Feld-Panorama · §17 Höhlen-Sicht · §20h 77677–77878 · §24 89756–90979 · §25j–l 95899–97961 | K11 (Himmel), H1 (Pipeline) |
| 9 | **Klang** | 1 336 | §03D 9793–10254 · §03F + §04A 10312–11423 | K11 |
| 10 | **Körper** (mit Fahrzeug und Kamera) | 7 036 | §03E 10255–10311 · §06B–D 16963–19414 · §13 Spieler-Seele, Ausrüstung/Held · §14 Konsum/Seele · §15 Mensch-Avatar, Fahrzeug/Ritt, Affordanz-Ticks, Spieler-Seele/Stats, Wind/Duft/Anim · §25c 93009–93157 · §25e–f 93801–95030 · §25i 95592–95898 | K06 (Kamera), K07 (Rig/Gang), H1 (Rest) |
| 11 | **Kreatur** | 3 626 | §06A 16473–16962 · §06E 19415–20061 · §06G–H 20481–23173 · Fauna 91005–91283 | H1 |
| 12 | **Kampf** | 1 094 | §21b–c 81159–82493 | H1 (K13 läuft vor den Schienen) |
| 13 | **Netz** | 6 293 | §03A 5388–8666 · §13 Vibe-Pass, Regionen, Pins/Hallen, Sicht/Bann/Schlüssel/Provenienz · §14 Portal-Eintritt/Netz/Dwelling, Studio-Übergabe, Portal-Server, Einladungen | K04 |
| 14 | **Feld** (lebendiges Feld + Sprache) | 6 345 | §02A–B 1210–3925 · §02D 4116–5387 · §03B–C 8667–9792 · §07C–D 24543–26115 · §17 Welt-Feld/Aura · §18 71040–71213 | Schritt 0 (§18), H1 |
| 15 | **Speicher** | 3 423 | §05B 12928–13379 · §11 Serialisierung · §12 40930–41435 · §13 Bibliothek/Manifest/Vendor, loadState-Kette, Welt-Tor/Fusion | H1 |
| 16 | **Werkstatt/UI** | 11 677 (4 Dateien) | §04B + §05A 11424–12927 · §13 Welt-Info-UI, Feed/Sozial · §20l + §21a 80282–81158 · §21d + §22-UI 82494–84921 · §23 85202–89384 · §25a 91284–92255 · grok* (§01) | H1 |
| oben | **Dirigent** (bleibt `anazhRealm.js`) | 4 366 | §01 constructor · §05D Regler 13495–15424 · §23-Schwanz 89385–89755 · §25b init · §25d Loop · §25g–h · §25m · §26b + Knoten-Statics | — |

Die Daten (§06F Welt-Statics 20062–20480, §09B 29105–29371; 517 Zeilen) wandern mit ihren Lesern oder in den Kern.

Die Summe der Methoden-Zeilen ist 87 744. Das größte Modul nach Dateien ist Werkstatt/UI mit 11,7k Zeilen in 4 Dateien; jede Fach-Datei liegt bei ≤ 3k Zeilen gegen heute 104 222. Der dritte Leser hat es gemessen: wer die Kamera ändert, liest heute §25 mit 7 250 Zeilen statt der 307 Zeilen von Block 25i.

### 1.3 Je Modul: Verantwortung · Schnittstelle · Besitz · Abhängigkeit

Zu den Feldern:
- **Port (Soll):** die Methoden, die andere rufen dürfen; in Klammern die heutigen Rufstellen von außen. Der Rest wird modul-intern.
- **Auf:** heutige Aufwärts-Rufe in der Ordnung von 1.2, mit dem Weg, auf dem sie brechen.

**1 · Gelände** (Kern `gelaende-core.js` + `realm/gelaende-boden.js`, `-chunks.js`, `-kollision.js`)
- **Verantwortung:** Der Boden als Funktion:
  - Makro-Höhe, Dichte, Erosion, Hydro-Kacheln, Feuchte, Pfad-Feld;
  - Chunks als Iso-Cache mit Worker-Brücke und IDB;
  - die Boden-Karte aus dem gebauten Mesh (Lehre 22);
  - Strahl und Kollisions-Hüllen (Blocker-Netz).
- **Port:** `getTerrainHeightAt` (39), `_voxelChunkConfig` (37), `_voxelSurfaceY` (28), `_feuchteAt` (19), `_slopeAt` (15), `_genVersion` (14), `_terrainMacroSurfaceY` (7, wird Kern-Ruf), `_blockerMit` (7), `_hydroFor` (6), `_chunkSurfaceAt`, `_fieldRaycast`, `_segmentAABB`, `_fahrzeugGesetzFor`. Heute sind es 66 Namen mit 286 Stellen.
- **Besitz (59):** voxelChunks, dirtyVoxelChunks, voxelMesh*/voxelDensity*/voxelBaseDensityCache, voxelWorker*, _chunkIdb, _voxelNoise/_macroAnker*/_macroRidgeNoise, erosion(-Tiles), hydroTiles, hydrosphere, hydroBand, tarns, terrainSteepness, terrainBaseHeight, fernRing, rigidBodies.
- **Ab:** nur Kerne und Dienste.
- **Auf (73):**
  - Wasser 27: Das Wasser-Gesetz (`_waterLevelAt`, `_atlasWaterLevelAt`, `_hydroRiverAt`, `_hydroSpiegelQuer`) geht in den Kern. Wasser-Zellen und Iso melden sich als **Chunk-Bau-Stufe** an, und Gelände ruft die registrierte Stufe, nie den Namen.
  - Vegetation 13 und Siedlung 9: ebenfalls als Stufen (Gras/Bewuchs bzw. Chunk-Satz).
  - Studio 6: Preset-Abfrage über die Lage.
- **Spiegel:**
  - voxel-worker trägt 30 Methoden mit 1 537 Zeilen bit-identisch;
  - feld-wgsl `spiegelEingaben(realm)` liest lebend `_voxelNoise`, `_macroAnker`, `_macroRidgeNoise` und `_erosionFor`. Diese bleiben Instanz-Glieder und überstehen den Umzug unverändert.

**2 · Wasser** (`realm/wasser-*.js`)
- **Verantwortung:** Wasser-Zellen und Sheet, Seen, Flüsse und Wasserfälle, Wasser-CA mit Stau, Iso-Fläche, Körper im Wasser.
- **Port:** `_isAboveWaterAt` (22), `_koerperWasser` (12, K02), `_waterLevelAt` (6), `_waterFlowAt`, `_computeHydrosphere`, `_buildVoxelChunkWaterCells` (als Chunk-Stufe), `_enqueueWaterIso`, `_invalidateWaterCapsAround`.
- **Besitz (17):** voxelChunkWaterIso, pendingWaterIso, waterSourceCols, waterCABand, waterCapJ, waterLevelCells, waterStauFields, waterCAActive, hydrosphereMeshes, waterLevel.
- **Ab:** Gelände 51.
- **Auf (6):** `_ensureHydroSurfaceMaterial` gehört zu Stoff; die Chunk-Satz-Rufe werden Stufen.
- **Spiegel:** `buildChunkWaterCells` und `buildWaterSheetGeometry` stehen bit-identisch im Worker (diag-worker-watersheet maxDiff 0). Der Sync-Fallback in `_tryWorkerWaterSheet` ist fail-soft und fällt beim Umzug in den Kern.

**3 · Stoff** (`realm/stoff-*.js`)
- **Verantwortung:** Die Material-Fabrik (PBR/Toon, Substanz-Antwort, Geologie-Albedo, LOD-Maske, Durchsicht). Dazu die **EINE Uniform-Heimat** für alle Sätze (atmo · wind · lod · hydroSurface · season · sky · starField · post), die Instanz-Senken, der Karten-Atlas, die Stoff-Regler §19 und der Gras-Stoff mit Wind.
- **Port:** `_instanzZahl` (19), `_instanzMesh` (10), `_instanzAbschied` (10), `_buildToonNodeMaterial` (8), `_buildPbrNodeMaterial`, `_uniformHeimatTeilen`, `_materialObserverDiaet`, `_lodCrossfadeMaskNode`, `_kameraDurchsichtNode`, `_grassInstanceMat`, `_windSwayOffset`, `_impostorAtlas`, die §19-Setter und **`_uniformSetzen(satz, name, wert)`** (neu: Bild und Dirigent setzen `.value` nur über diesen Port).
- **Besitz (24):** atmosphere, *Uniforms (alle Sätze, auch `_ensureSeasonUniforms` aus §20h), lodUniforms, die Impostor-Bake-Schlange.
- **Ab:** Kerne.
- **Auf (13):** `_ensureSeasonUniforms` und `_applyDayNightToScene` werden Lage; der Blatt-Atlas wird Port von Vegetation-Daten im Kern.
- **Bruch heute:** Die Sätze werden lazy im ersten Bauer angelegt und von 3 Zonen beschrieben (§10/§19/§24, §05/§24/§25). Danach legt Stoff alle Sätze im Boot an, und die Schreiber rufen den Port.

**4 · Studio-Brücke** (`realm/studio-*.js`)
- **Verantwortung:** Der Foundry-Host:
  - Ingest und Transport-Schale `_foundrySchale`;
  - Auftrag mit Pumpe (Schlange nah zuerst, 12 im Flug);
  - Presets und Wort-Katalog;
  - BuildMesh, Cache und Flatten;
  - Impostor und Feld-Splat;
  - Arch-Fits, Kreatur-Glieder und Baum-Stoff `_foundryTreeMaterial`. Dieser ist die Vorbedingung des Shell-Ports, Entscheidung §3.4.
- **Port:** `_foundryEnabled` (30), `_foundryPresetForEntry` (27), `_foundryPresetFor` (14), `_foundryFlattenFor` (14), `_foundryPresetIsTree` (9), `_ensureAssetFoundry` (7), `_foundryVariantFor` (6), `_foundryRequest` (5), `_studioBlueprintForWord`, `_foundryTreeMaterial`.
- **Besitz (31):** `_foundry`, `_foundryMats`, `_foundryBarkNormal`, `_blattAtlasBild`, die Forst-Memos. Die heute **veränderlichen Klassen-Statics** `_studioRenderConfig`, `_studioSky` und `_siedlungGesetzMemo` werden Modul-Zustand, also keine verdeckten Globale mehr.
- **Ab:** Stoff 23.
- **Auf (35):**
  - Siedlung 11 (`_archIsRendered`, `_rebuildArchitectureMesh`): Die Fits melden „Asset bereit", Siedlung holt es ab.
  - Körper 10: `_artifactStudioOv` und `_studioOvHash` sind falsch einsortiert (§13 Ausrüstungs-Gruppe) und wandern hierher.

**5 · Bau** (`realm/bau-*.js`)
- **Verantwortung:** Das Bauplan-Buch: Default-Bücher (Baupläne, Materialien, Werkzeuge), Rolle/Qualität/Präzision, Teile-Operationen mit Undo, Form- und Raum-Tags, Verbindung/Statik, Varianten-Bauer, Affordanz-Prädikate, Validierung, CRUD.
- **Port:** `computeCompoundTags` (26; 35 Rufer in 12 Zonen), `_displayRole` (14), `_buildFromBlueprint` (13), `selectBlueprintForEdit`, `computeSpatialTags`, `_rollGenome`, `validateBlueprintParts`, `computeBlueprintQuality`, `_attachPointFor`, `_compoundVisualExtent`, CRUD (`createBlueprint` … `updatePart`), `defineMaterial`.
- **Besitz (10):** blueprints (87 Schreibstellen, heute 51 davon fremd), materials, tools, blueprintEditHistory, _bpEditTick, die Raum-Tag-Memos.
- **Ab:** Stoff, Gelände.
- **Auf (40):**
  - Werkstatt 25 (`_renderWorkshopDOM`, `_workshopUpdateManipulatorButtons`, `resetWorkshopCamera`): melden über `_uiDirty("werkstatt")`.
  - Körper 10 (`playerSoulDefs`, `_canPayMana`, `_drainMana`): Die Mana-Kasse ist Körper-Port und wird von oben übergeben (der Werkstatt-Prozess ruft Bau mit dem Bezahl-Ergebnis).
- **Zyklus gebrochen:** §15↔§16 (44/32) löst sich auf, weil Varianten-Bauer und Prädikate in dieses Modul kommen.

**6 · Siedlung** (`realm/siedlung-*.js`)
- **Verantwortung:** Die Bauten in der Welt:
  - Arch-Instanzen/Spawn, Mesh/Merge/Ghost, Flatten/Bundles;
  - Chunk-Satz und Bau-Satz, LOD-Slots;
  - Fundament, Wege-Karte, Kronen-Streu-Weg, Zaun;
  - Siedlung/Genesis/Portal-Ring/Auto-Siedlung;
  - Tor-, Membran-, Nebel- und Dorf-Rauch-Render.
- **Port:** `spawnArchitecture` (11; 32 externe Dateien), `_archIsRendered` (14), `_rebuildArchitectureMesh`, `_cullArchitectureMesh`, `_chunkSatzAus`/`_chunkSatzEin`, `_katalogSichtbar`, `_bauSame`/`_samenStrom`, `_kronenStreuWeg`, `_spawnSettlementSlot` (K10).
- **Besitz (91):** architectures, archInstanceGroups, archMergedGeomCache, archFundament, wegeKarte, chunkSaetze, satzStoffe, dorfRauch, floatingIslands, ufos, _bauFreiBox.
- **Ab:** Studio 41, Stoff 39, Gelände 31, Bau 14, Wasser 11.
- **Auf (52):**
  - Vegetation 25: Die LOD-Wahrnehmung (`_lodTreeVisHeight`, `_lodPerceptionDistance`) wandert nach Stoff. Die Bauplatz-Räumung wird Lage: Siedlung schreibt ihre Bauplatz-Karte, Vegetation räumt selbst. Die Streu-Beförderung (`_scatterMarkCellPromoted`, `_scatterRegisterCell`) gehört Vegetation.
  - Bild 10: Pass-Wahl und Höhlen-Sicht lesen Siedlung von oben, nie umgekehrt.
  - Feld 6 (`_chatEcho`): Dienst.

**7 · Vegetation** (`realm/vegetation-*.js`)
- **Verantwortung:** Nah-Wiese, Nah-Streu mit Ernte, Streu-Regionen, Baum-Wuchs (Phyto), Baum-Geometrie/Laub-Atlas, Wald-Pflanzung, Natur-Plätze, Affinität und Boden-Material.
- **Port:** `_istNatur`, `_naturSetzen`, `_growTreeBlueprintRich`, `_treeRecipeDials`, `_blattAtlasProbe`, `_forestStandDensity` sowie die Chunk-Stufen „Gras" und „Bewuchs".
- **Besitz (64):** nahWiese, nahStreu, scatterLookup, scatterPromoted, scatterCounters, bakedRegionFields, pendingVegSpawns, pendingGrass, voxelChunkGrass(+Lod), _growTreeRing, _bakedRegionRing.
- **Ab:** Gelände 83, Studio 56, Siedlung 47, Wasser 19, Bau 10, Stoff 9.
- **Auf (21):** `worldFieldAt` 9 kommt aus dem Kern, die übrigen Rufe werden Meldungen.

**8 · Bild** (`realm/bild-pipeline.js`, `-schatten.js`, `-feld.js`, `-himmel.js`)
- **Verantwortung:**
  - Renderer-Patches und Erst-Wache (`_configureRenderer`, Vendor-Vertrag Lehre 23/26);
  - Pass- und Instanz-Wahl, Ausgabe/TRAA/Post, Schatten-Kaskaden;
  - Feld-Pass, Feld-Panorama und Szene-Tiefe (rohes WebGPU), Höhlen-Sicht;
  - Himmel, Luft, Tag/Nacht, Wetter, Saison und — mit K11 — das EINE Leuchtquellen-Verzeichnis.
- **Port:** `_applyDayNightToScene` (6), `setTimeOfDay`, `_setWeather`, `_passTrifftBox`, `_instanzWahlGruppen`, `_ensurePostProcessing`, `_luftEnsure`. Dazu die **Himmels-Lage** `state.himmelLage = {zeit, sonne, wetter, nass}`, die je Takt geschrieben wird und `_weatherIsWet`, `_weatherFieldFor` und `_sonnenWinkel` für Tiefere ersetzt.
- **Besitz (92):** scene (Szene-Port `_szeneDazu/_szeneWeg`, heute 31 fremde Schreibstellen aus 8 Modulen), renderer, die Lichter, csmNode, weather, timeOfDay, wetterWort, luft, feldPass, die TRAA- und Tiefen-Puffer.
- **Ab:** Gelände 20, Stoff 15, Siedlung 10.
- **Auf (14):** `auraAt`/`worldFieldAt` kommen aus dem Kern und der Feld-Lage; `_buehneSteht` wird Lage.

**9 · Klang** (`realm/klang.js`)
- **Verantwortung:** Lofi-Symphonie, Umwelt-Klang, Tier-Ruf, Glut-Klang, Schritt-Klang, Substanz-Klang.
- **Port:** `initSymphony`, `symphonyTick`, `_tierRuf` (6), `_substanzKlang` (4), `_schrittKlangTick` (K07), `_playKampfOneShot` (K13), `_lofiPlayChord`, `playInventoryHoverPing`.
- **Besitz (8):** symphony (heute 13 fremde Schreibstellen, gebiert init), _schrittKlang, klangPreset, die Lofi-Memos.
- **Ab:** Wasser, Gelände, Bild (Himmels-Lage), Bau.
- **Auf (6):** `auraAt` kommt aus dem Kern; Körper-Maße werden Lage.
- Das Glut-Wissen liest Klang nach K11 aus dem Leuchtquellen-Verzeichnis (Bild), nie aus einem eigenen Sweep.

**10 · Körper** (`realm/koerper-leib.js`, `-seele.js`, `-bewegung.js`, `-fahrt.js`, `-kamera.js`)
- **Verantwortung:** Leib, Rig, Gang und IK, der Ofen (Guss), Tier-Animation und Motion-Rollen. Dazu Spieler-Seele mit Stats, Mana, Vitalität und Ausrüstung, Inventar, Sprung, Schwimmen, Charakter-Physik, Fahrzeug und Ritt sowie die Kamera.
- **Port:** `playerSoulDefs` (14), `_disposeSoulGroup` (14), `_blickVorn` (8), `applyPlayerSoul` (7), `recomputePlayerStats`, `_animateCompoundMotion`, `computeMotionRoles`, `_gaitTick` (K07), `_fadenkreuzStrahl`, `addMaterialToInventory`, `equipHeld`, `damagePlayer`, `mountArchitecture`. Neu im Soll: **`_schrittRein(zustand, eingabe) → zustand`** (reine Bewegung) und der Spieler-Port statt direkter `player`-Schreibe.
- **Besitz (89):** player (158 Schreibstellen; heute 99 fremd aus 10 Modulen), playerMesh, playerVel, die Boden-Caches (_groundedCache, groundNormalY, onSteepSlope …), _fieldVy, isInAir, isJumping, yaw, pitch, camera, customSouls, _mountedEntry, die Fahr-Hülle.
- **Ab:** Bau 52, Gelände 50, Studio 17.
- **Auf (68):**
  - Werkstatt 33 (`_refreshIchIfOpen` 10): melden.
  - Kreatur 11 (`_creatureSkeleton`): Skelett-Daten aus tetrapoda-core.
  - Feld 9: melden.
- **Warum Fahrzeug hier:** Das Fahrzeug schreibt Körper-Zustand (player, _fieldVy) an 20 Stellen, und der Lockstep-Geist steppt `_rittSchritt` mit; als eigenes Modul wäre das ein Zyklus 5/11.

**11 · Kreatur** (`realm/kreatur-*.js`)
- **Verantwortung:** Spawn, Entfernen und Serialisieren, Kampf-Stats und Gedächtnis, Aufgaben, Jagd, Leib-Kontakt und Schwimmen, Bühnen-Phasen, `updateCreatures`, Fauna-Lebenszyklus, die Persona-Rede.
- **Port:** `spawnCreatureAt`, `removeCreature`, `damageCreature` (K01), `assignCreatureTask` (6), `_creatureRemember` (12), `_buehneSteht` (→ Lage), `computeCreatureStats`, `updateCreatures` (Tick).
- **Besitz (47):** creatures, creatureEmotions, creatureAnimationTime, faunaLifecycle, die Herden- und Duft-Pools.
- **Ab:** Körper 35, Bau 13, Gelände 9, Klang 7, Wasser 7.
- **Auf (44):**
  - Feld 33: `_creatureSpeakProactive` 8 wird zu Kreatur gezogen; der LLM-Transport `llmCall` ist ein Dienst.
  - `auraAt`/`worldFieldAt` 10 kommen aus dem Kern.
  - `_feel*`/`_depositLife` 10 werden Meldung.

**12 · Kampf** (`realm/kampf.js`)
- **Verantwortung:** Schwung, Sweep, Urteil, Bogen und Pfeile, Gerät-Profil, Abbau, Klick-Pfad (`tryMouseBreak`, `_pickCreatureAtCrosshair`).
- **Port:** `_playerAttackCreature` (K01), `_beginPlayerSwing`, `tryMouseBreak` (K13). Heute sind es 20 Namen mit 26 Stellen; der Block ist geschlossen.
- **Besitz (9):** _pfeile, _bogenHud, _tmpRaycaster, die Kampf-Memos.
- **Ab:** Körper 21, Bau 18, Studio 6, Kreatur 3.
- **Auf (26):** Die Ausdauer (`_consumeMouseStamina`, `_mouseActionStaminaGate`, 9) ist aus §21a falsch einsortiert und gehört zum Körper; `renderInventoryUI` wird gemeldet.

**13 · Netz** (`realm/netz-p2p.js`, `-portal.js`, `-identitaet.js`)
- **Verantwortung:** WS/WebRTC, Lobby, Welt-Bündel, Stimme, Lockstep, Portal-Reise und Dwelling, Portal-Server, Einladungen, Studio-Übergabe, Vibe-Pass mit Signatur, Bann und Provenienz, Regionen-Handoff, Pins und Hallen.
- **Port:** `initP2PSync`, `p2pSend` (5), `_p2pSendChannelTo`, `_p2pBroadcastSoul`, `joinWorldFromCode`, `_vibeFingerprint` (8), `_vibeVerify`, `_isKeyRevoked` (8), `_sanitizeProvenance`, `_studioUebergabeValidate`.
- **Besitz (19):** p2p (105 Schreibstellen), _portalOverlay, vibePass, revokedKeys, signedWorlds, grantedCapabilities, die Portal-Memos.
- **Ab:** Körper 24, Bau 4.
- **Auf (57):**
  - Speicher 24 (`_worldEntry`, `buildStateSnapshot`): Das Welt-Bündel ist ein Port des Speichers, beim Boot an Netz übergeben.
  - Werkstatt 21: melden.
  - Feld 12 (`dslRun`): Netz liefert DSL-Nachrichten als Ereignis, und Feld führt sie in seinem Takt aus.
- **Größter einzelner Täter:** `_lockstepStepGhost` mit 51 fremden Schreibstellen. Er tauscht etwa 26 Bewegungs-Schlüssel des Körpers ein und wieder aus. Er bricht erst mit `_schrittRein` (Körper), und vorher steht er namentlich in der Ratsche.

**14 · Feld** (`realm/feld-leben.js`, `-sprache.js`, `-dsl.js`, `-llm.js`)
- **Verantwortung:** Das lebendige Feld (docs/das-lebendige-feld.md):
  - Leben, Emotion, Welt-Feld und Aura;
  - Emotion und Bewertung;
  - DSL-Kern mit Welt-Regeln und Fitness, Pfad-Lernen;
  - Chat→DSL, Chat-Befehle, Nexus und Selbstanalyse;
  - LLM-Persona und LLM-UI.
- **Port:** `dslRun` (8), `processChatCommand`, `parseChatToDsl`, `describeProgram` sowie die Melde-Eingänge `_feelAction`/`_depositLife`/`_depositEmotion` (heute 17 + 4 Aufrufe von unten, künftig Ereignisse). `auraAt` und `worldFieldAt` (17 + 16) werden Kern-Funktion: das Welt-Feld-Gesetz in gelaende-core, denn der Worker trägt dieselbe Konstruktion schon (voxel-worker.js:922). Das Overlay-Gitter ist Lage.
- **Besitz (30):** dsl, worldRules, llm, knowledgeBase, selfAwareness, nexusWirk, nexusEvolutionQueue, lifeField, emotionField, worldField, wohlBaseline, gravity.
- **Ab:** Kreatur 37, Siedlung 24, Körper 23, Bau 15, Gelände 13.
- **Auf (34):** `grokSpeak`/`grokRender` 10 werden Meldung an die Oberfläche.
- **Verb-Port:** `dslEffects` (1 007 Zeilen, Fan-out in 23 Blöcke) ruft nur noch Ports der Module darunter. Das ist dieselbe Fassade, nur ohne Schreibzugriff.

**15 · Speicher** (`realm/speicher-*.js`)
- **Verantwortung:** Der Welt-Stand. Dazu gehören Snapshot, IDB als Wahrheit und localStorage als Spiegel, die loadState-Kette, Welt-Index und Welten, Welt-Tor/Fusion, Bibliothek/Manifest/Vendor und Serialisierung.
- **Port:** `loadState`, `buildStateSnapshot`, `worldsIndex*`, `createNewWorld`, `switchToWorld`, `activeWorldSet`, `triggerStateDownload`, `_worldEntry`. `saveState` (59 Rufer) bleibt Name auf der Instanz und wird ein Dienst-Anstoß, der den beim Boot registrierten Schreiber ruft.
- **Besitz (10):** worldMeta (heute 31 fremde Schreibstellen), customWorlds, worldJournal, versionHistory, pendingImport, die IDB-Felder.
- **Ab:** Netz 23, Stoff 12, Körper 10 und andere.
- **Scheiben-Vertrag:** Heute liest der Snapshot 38 fremde Felder, und die loadState-Kette schreibt 40. Künftig liefert jedes Modul `scheibeSchreiben()` / `scheibeLesen(s)` für seinen Besitz, und Speicher ruft sie abwärts. Die Täter heute: `_loadStateRestoreWorldMeta` 11, `…SoulAndAtmosphere` 10, `…BasicState` 9.

**16 · Werkstatt/UI** (`realm/werkstatt-viewer.js`, `-bauen.js`, `ui-shell.js`, `ui-raeume.js`)
- **Verantwortung:**
  - der Werkstatt-Viewer mit eigenem Renderer/RAF, Gizmo, Paletten und Ofen-Vorschau;
  - Bauen in der Welt: Kosten-Tore, confirmBuild, Phantom, Ernte;
  - Drawer, Omnibox, Help und Konsole/Status;
  - Hotbar, Inventar, Hof und Ich;
  - Einstellungen und Tastenbelegung;
  - Welt-Info, Feed/Sozial und Grok.
- **Port:** `_renderWorkshopDOM`, `renderInventoryUI`, `_renderHotbarDOM`, `updateWorldInfo`, `toggleDrawer`, `grokSpeak`. **Von unten** kommt nur `_uiDirty(raum)` (Dienst): Jeder Raum registriert seinen Zeichner beim Boot. Heute gehen 132 Aufwärts-Rufe direkt in diese Schicht.
- **Besitz (44):** workshop, buildMode, hotbar, grok, keybindings, inventoryOpen, hof-/ichStage, abilities und die DOM-Referenzen.
- **Ab:** Bau 76, Körper 55, Netz 34, Speicher 28 und andere.
- **Vorbedingung:** `_el` wird eine freie DOM-Funktion (Dienst; 250 Rufstellen).

**Dirigent** (`anazhRealm.js`)
- **Verantwortung:** Wurzel des state-Baums, Boot-Reihenfolge (`init`), `startEternalLoop` (etwa 35 Tick-Verben), Frame-Scheduler und Stand-Wache, der Regler (PID, Holz-Profile, Flugschreiber, Täter-Klassen), Spielmodus, Kamera-Modus, Input und UI-Fokus, `_loopRender`, der Gesetz-Leser `AnazhRealm.Gesetz`/`_kernPflichtBruch`, das Modul-Register.
- **Besitz (97):** weltMarch, flightRecorder, perfSense, keys, die Regler-Ausgänge (`_activeRingRadius`, `foliageRadius`, `architectureCullingRadius`, `_renderScale`, `_shadowMinInterval` — andere LESEN sie), _gpuLeine, _standWache.
- **Fremd heute 87:**
  - `init` 30: der zweite Konstruktor, er wird zu Boot-Haken je Modul;
  - `_loopRender` 16: geht über die Ports von Bild und Stoff.

### 1.4 Die Zyklen und ihr Bruch (die größten Aufwärts-Paare, Ordnung 1.2)

Heute gibt es 72 Modul-Paare mit Aufwärts-Rufen. Die 503 Aufwärts-Stellen zerfallen in:
- 132 Rufe in die Oberfläche → melden;
- 31 Feld-Lesungen → Kern;
- 31 Feld-Meldungen → Ereignis;
- 33 Rufe in Dirigenten-Methoden, die keine Dienste sind → Dienst oder Umzug;
- 276 Struktur-Fälle → falsch einsortierte Methode (wandert) oder Inversion (Stufe/Port beim Boot).

| Paar | Stellen | Täter (Rufe) | Bruch |
|---|---|---|---|
| Körper → Werkstatt/UI | 33 | `_refreshIchIfOpen` 10, `_refreshSoulSelect`, `renderInventoryUI`, `_renderCreatureListUI`, `_renderHotbarDOM` | melden `_uiDirty("ich"/"hotbar")` |
| Kreatur → Feld | 33 | `_creatureSpeakProactive` 8, `auraAt` 7, `_feelCreatureAction` 4, `_feelAction` 4, `worldFieldAt` 3 | Persona-Rede zu Kreatur, `llmCall` als Dienst · Aura/Welt-Feld → Kern · Feld-Ereignis |
| Gelände → Wasser | 27 | `_getVoxelChunkMaterial`, `_waterLevelAt`, `_computeHydrosphere`, `_buildVoxelChunkWaterCells`, `_enqueueWaterIso` | Wasser-Gesetz → gelaende-core (Worker-Spiegel fällt) · Chunk-Bau-Stufen per Register |
| Siedlung → Vegetation | 25 | Bauplatz-Abfrage 3, `_lodTreeVisHeight`, `_lodPerceptionDistance`, `_scatterMarkCellPromoted`, `_scatterRegisterCell` | LOD-Wahrnehmung → Stoff · Bauplatz-Karte als Lage · Streu-Beförderung zu Vegetation |
| Bau → Werkstatt/UI | 25 | `_renderWorkshopDOM` 8, `_workshopUpdateManipulatorButtons` 4, `resetWorkshopCamera` 4 | CRUD meldet `_uiDirty("werkstatt")` |
| Netz → Speicher | 24 | `_worldEntry` 5, `buildStateSnapshot` 4, `activeWorldSet` 3 | Welt-Bündel-Port, beim Boot übergeben |
| Netz → Werkstatt/UI | 21 | `renderLibraryUI`, `updateWorldInfo`, Sozial-Empfang, Banner | melden |
| Kampf → Werkstatt/UI | 19 | `_consumeMouseStamina` 5, `_mouseActionStaminaGate` 4 | Ausdauer wandert zum Körper |
| Feld → Werkstatt/UI | 17 | `grokSpeak` 6, `grokRender` 4 | melden |
| Gelände → Vegetation | 13 | `_populateVoxelChunkVegetation`, `_enqueueGrass`, `_disposeVoxelChunkGrass` | Chunk-Stufe „Gras/Bewuchs" |
| Netz → Feld | 12 | `dslRun` 4, `_isRuleEffectAllowed`, `describeProgram` | DSL-Kanal als Ereignis |
| Vegetation → Feld | 11 | `worldFieldAt` 9 | Kern |
| Studio → Siedlung | 11 | `_archIsRendered`, `_rebuildArchitectureMesh`, `_cullArchitectureMesh` | „Asset bereit" melden |

Die Zonen-Zyklen der Leser (§11↔§20 50/49, §17↔§20 47/61, §15↔§20 28/54, §15↔§16 44/32) verschwinden im Zuschnitt. Sie liefen über die Studio-Brücke und die Instanz-Senken, die jetzt in den Schichten 3–4 unten stehen, und über Bau, der Varianten-Bauer und Prädikate aufnimmt.

### 1.5 Abweichung von der Liste in §6.6 (gemessen, nicht geschmeckt)

- **Render** wird **Stoff** (Schicht 3) und **Bild** (Schicht 8). Material-Fabrik und Instanz-Senken werden von außen an 135 Stellen gerufen, vor allem aus Siedlung (39), Studio (23), Bild (15) und Speicher (12). Die Pass-Wahl liest umgekehrt Siedlung und Vegetation. EIN Modul säße in zwei Schichten.
- **Fahrzeug** wird Datei im **Körper**: 20 fremde Schreibstellen auf player/_fieldVy und der Zyklus 5/11 lösen sich so auf.
- **Werkstatt** wird **Bau** (Schicht 5) und **Werkstatt/UI** (Schicht 16): Körper↔Werkstatt lief 37/30 über `computeCompoundTags` und `_buildFromBlueprint`.
- **Neu** sind **Studio-Brücke** (3 946 Zeilen, Fan-in 178, Knoten der vier Zonen-Zyklen) und **Feld** (Lesen · Schreiben · Werten der Welt, docs/das-lebendige-feld.md).

---

## §2 Das Extraktions-Muster

### 2.1 Die Form

Die Datei je Block ist ein klassisches Skript mit `defer`. Es wird **vor** `anazhRealm.js` geladen und trägt dasselbe `?v=` wie der Stamm (`bump-version.cjs` ersetzt jedes `?v=` in index.html ohnehin).

```js
// realm/feld-leben.js — Modul feld · Block §18 Lebens-Feld (aus anazhRealm.js 71040–71213, byte-gleich)
class RealmFeldLeben {
    _depositLife(x, z, amount) {
        // … Methoden-Text unverändert, Einrückung 4 wie im Stamm …
    }
}
(globalThis.__realmModule ||= new Map()).set("feld-leben", {
    modul: "feld",
    besitz: ["lifeField", "emotionField", "lifeFieldLastPrune", "emotionFieldLastPrune"],
    klasse: RealmFeldLeben,
});
```

Im Stamm stehen nach §26 und vor `_bootAnazhRealm()` zwei Zeilen; der Dirigent kennt sein Orchester:

```js
AnazhRealm.MODULE = Object.freeze(["feld-leben" /* , … Ladeordnung = index.html */]);
AnazhRealm._moduleEinhaengen(); // fail-closed
```

`_moduleEinhaengen` arbeitet in fünf Schritten:
1. Registrierte Namen ≡ `MODULE`. Fehlt eine Datei oder ist eine zu viel, folgt `throw` mit Ladeschirm-Text und dem Dateinamen.
2. Für jede Klasse: alle eigenen Glieder von `klasse.prototype` außer `constructor` per `Object.getOwnPropertyDescriptor` → `Object.defineProperty(AnazhRealm.prototype, …)`. Getter, Nicht-Aufzählbarkeit und `toString()` bleiben erhalten.
3. Statics ebenso, ohne `length`, `name` und `prototype`.
4. Ein Name, der schon am Stamm oder in einer anderen Datei steht, ergibt `throw "Zwilling: <name>"`.
5. Kein `try/catch` mit Weiterlauf: ein fehlendes Modul ist ein lauter Boot-Bruch, nie ein stilles No-op.

### 2.2 Warum diese Form

- **Byte-Gleichheit trägt den Beweis.** Die Klasse hat 0 `super`, 0 `this.#`, 0 Instanz-Felder (gemessen: 2 407 Methoden, 8 Getter, 34 static-Methoden, 77 static-Getter, 1 static-Feld). Eine Methode, die ihr Text mit gleicher Einrückung in eine Klassen-Deklaration auf Spalte 0 trägt, hat dasselbe `Function.prototype.toString()`. Damit bleiben gleich:
  - `__codeOf(r._x)` (518 Aufrufe in den Linsen, Lehre 6) und jede Absenz-/Präsenz-Probe zur Laufzeit;
  - die Zähl-Hüllen der Werkbank;
  - `window.anazhRealm._x` (playtest ruft allein 206 §13-Namen über die Instanz);
  - prettier: dieselbe Einrückung, also kein Umbruch.
- **Vor statt nach dem Stamm laden.** `_bootAnazhRealm()` ruft `new AnazhRealm()` **synchron am Ende von anazhRealm.js**, sobald `window.THREE` steht. Eine Datei, die nach dem Stamm `Object.assign(AnazhRealm.prototype, …)` macht, kommt im schnellen Pfad zu spät. Klassische `defer`-Skripte laufen in Dokument-Ordnung; das Register vorher ist deterministisch.
- **Gegen ES-Module:**
  - Der Stamm und die Kerne sind Klassik-Globale.
  - Ein ES-Modul braucht `import`-Spezifizierer mit eigenem `?v=` (Lehre 10 vervielfacht sich).
  - `node --check` scheitert an `import` in `.js`, eslint bräuchte `sourceType: module`.
  - Die Worker laden per `importScripts`, also klassisch.
  - Es gibt keinen Gewinn, der das trägt.
- **Gegen Worker-Laden:** Ein Realm-Modul ist Host-Code (es liest `this.state`) und wird **nie** von einem Worker geladen. Was Stamm UND Worker brauchen, ist Gesetz und gehört in einen Kern (`*-core.js`, Manifest, Studio-Vertrag v1.2, `importScripts` mit `?v=`); das ist das K09-Muster. Zwei Arten, nie vermischt: **Kern** (rein, geteilt) und **Modul** (Host, nur Haupt-Thread).
- **Gegen delegierende Stubs** (`_x(...a) { return Feld._x(this, ...a); }`): Ein Stub am Prototyp macht jede Absenz-Probe über `__codeOf` falsch-GRÜN und jede Präsenz-Probe ROT (der dritte Leser hat es gemessen). Außerdem wäre er ein Zwilling.

### 2.3 Die Schienen (vor dem ersten Umzug, alles in Schritt 0)

| Schiene | Heute | Danach |
|---|---|---|
| **EINE Stamm-Quelle** `scripts/lib/stamm-quelle.cjs`: `stammDateien()` (liest `AnazhRealm.MODULE` aus dem Stamm-Text), `stammText()`, `methodenQuelle(name)` (acorn-Spanne über alle Dateien), `stammLaden(ctx)` | 76 Skripte nennen den Pfad, **54** lesen ihn direkt per `readFileSync`, 14 tragen eine eigene `fnBody`-Kopie, 10 der Stamm-Leser werten Code per `new Function`/vm aus (z. B. diag-profiband und diag-arch-fachwerk-fit in `npm run check`) | alle über die Quelle, in EINER Welle; sonst wird jede Absenz-Wand durch Leere grün (Linsen-Vakuum) |
| **cut-method.cjs `--move <datei>`** und `--block <von>..<bis>` | kann nur zeigen und löschen | dieselbe acorn-Spanne (mit `--with-comment`) wandert in die Ziel-Klasse; `node --check` auf beide Dateien; bei Bruch beide Dateien zurück; die Probe „entfernter Text ≡ eingefügter Text" läuft je Spanne |
| **Register** `AnazhRealm.MODULE` + `_moduleEinhaengen` | — | fail-closed (2.1) |
| **index.html** | 1 Stamm-Tag | je Datei ein `<script src="realm/…js?v=…" defer>` vor dem Stamm-Tag. `bump-version.cjs` hebt die Tags mit; playtest V8.41 prüft den Buster über die Liste |
| **eslint** | `files: ["anazhRealm.js"]` | `["anazhRealm.js", "realm/*.js"]`, gleiche Globale + `__realmModule` |
| **prettier / format:check** | 5 feste Dateien | + `realm/*.js`. Module sind Stamm-Code, keine Gesetzbücher; die Kerne bleiben außerhalb (Lehre 11) |
| **`npm run check`** | `node --check anazhRealm.js` … | dazu `node --check` je Datei aus `stammDateien()` |
| **diag-atlas** | Marker in EINER Datei, `--check` Registry ≡ Marker | Atlas über Dateien: Zonen im Stamm + je Datei ein Kopf-Marker; `--check` vergleicht zusätzlich MODULE ≡ Dateien ≡ index.html |
| **diag-altlasten / diag-source-probes** | `verboten: [..., "anazhRealm.js"]`, Proben nur im Stamm | über `stammDateien()` |
| **Stapel-Linsen** (haenger-linse, ausgabe-aufnahme) | filtern Frames per `datei === "anazhRealm.js"` | Regex über `stammDateien()`; sonst verschwinden umgezogene Frames aus dem Täter-Stapel |

### 2.4 Der Beweis je Umzug (proportional, Gebot 9)

1. **Byte:** `node scripts/diag-stamm-verbund.cjs --basis <sha>` vergleicht über alle Verbund-Dateien `Name → sha256(Methoden-Spanne)` mit `git show <sha>:anazhRealm.js` (+ Modul-Dateien der Basis). ROT bei:
   - fehlender Methode;
   - Zwilling;
   - geändertem Hash;
   - einer Methode in einer Datei außerhalb von MODULE;
   - einer umgezogenen Methode, die nicht im Commit-Rumpf genannt ist.

   Laufzeit ≈ 1 s (acorn-Parse des Stamms gemessen 0,38–1,05 s).
2. **Laufzeit:** Eine Probe in `playtest:fast` prüft die Prototyp-Glieder (heute 2 416 = 2 407 Methoden + 8 Getter + constructor) und die Klassen-Glieder vorher ≡ nachher und die `toString()`-Hashes der umgezogenen Namen gegen die AST-Hashes. Damit ist die Kopie bewiesen, nicht nur die Datei.
3. **Die Wände der Zone** (je Modul fest benannt):
   - Gelände: gate:worker-dichte maxDiff 0, diag-worker-watersheet, gate:dritter-spiegel;
   - Stoff/Bild: gate:kamera-treue am echten WebGPU + `werkbank zaehlen` mit Programmen und Pipelines gleich (Lehre 23/26);
   - Siedlung: diag-chunk-satz, diag-altlasten;
   - Netz: smoke-copresence, smoke-webrtc, diag-portal-konformanz;
   - Speicher: diag-persistence, diag-taille;
   - Körper: diag-fahr-leben, diag-blocker-netz;
   - Feld: diag-v1-pfad.
4. **Risiko-Stufe:** Ein byte-gleicher Umzug ist R1 (Puls grün). Stoff und Bild (Vendor-Patches, rohes WebGPU) sind R2 mit `[ci voll]`.
5. **Erlebnis:** Einmal, beim Piloten, ein Bild der Mess-Wiese aus dem Ausgabe-Pfad vorher↔nachher (Luminanz-Δ 0) im echten Browser. Danach trägt der Byte-Beweis; ein Umzug ändert kein Pixel.

### 2.5 Ablauf eines Umzugs (seriell, Lehre 12)

1. `cut-method --move realm/<datei>.js --block <von>..<bis>` (Dry-Run, dann `--apply`).
2. `node --check` + eslint über den Verbund.
3. `diag-stamm-verbund` GRÜN.
4. `gate:grenzen` (§4): die neue Datei bringt ihre Brüche namentlich mit; neu darf keiner sein.
5. Commit 1: „Umzug <Block> nach realm/<datei>.js" mit Namensliste.
6. Commit 2 (dieselbe Karte): die `typeof this.X === "function"`-Wachen auf die umgezogenen Namen fallen. Heute gibt es 318 solche Wachen im Stamm; das Register macht sie tot, und tot heißt löschen (Gebot: die Klasse fällt).
7. Erst danach kommt die eigentliche Änderung der Karte im Modul.

---

## §3 Die Reihenfolge entlang der Karten

### 3.1 Schritt 0 = K09 vorne (Platz 1, vor dem Kern-Schnitt)

Die Schienen aus 2.3, die Wand aus §4 und der **Pilot Feld-Leben** (§18).

- **Warum dieser Pilot:** 8 Methoden mit 174 Zeilen. Er besitzt alle 4 Schlüssel und hat 0 fremde Schreib- und Lesestellen. Er hat 14 Rufstellen aus 6 Zonen, 2 Text-Leser und 2 Commits in 30 Tagen. Keine offene Karte und kein Zweig berührt ihn.
- **Beweis:** alles aus 2.4 inklusive des einen Bildes.
- **Kosten:** etwa 0,5 Tag, R1.

K09 ist damit die erste Karte, die herauszieht, wie §6.6 es verlangt.

### 3.2 Welche Karte welches Modul zieht

Die Regel: Eine Karte, die nach dem Merge von Schritt 0 **startet**, zieht ihren Block zuerst byte-gleich heraus und ändert dann im Modul. Karten, die vorher starten oder auf einem schon laufenden Zweig sitzen (K01, K02, K03, K05, K08, K12, K13; ebenso K06 und K04, falls sie vor Schritt 0 starten), ziehen nicht nach; ihr Block geht an H1. Ein Umzug auf einen fremden heißen Zweig ist Merge-Gift.

| Karte | Platz · Version | zieht | Hinweis |
|---|---|---|---|
| **K09** gelaende-core | 1 · V18.542 | Kern `gelaende-core.js` (Makro-Höhe; die Worker-Kopie fällt, MACRO_ANKER/FEUCHTE/DC_* werden Kern-Daten), danach **Gelände** als Modul (§07A, §08, §09A, §11 Chunk/Feld/Blocker/Streaming) | Kern-Schnitt zuerst (Byte-Beweis SHA 64×64), dann Umzug. feld-wgsl liest weiter `realm._voxelNoise` usw. |
| **K06** Kamera-Leib | 2 · V18.542 | **Körper** wird geboren: `realm/koerper-kamera.js` (25i, 307 Zeilen) | Die Kamera-Kugel sitzt danach im Modul; `_fieldRaycast` bleibt Gelände-Port |
| **K04** P2P-Tür | 3 · V18.542 | **Netz** (§03A, §14 Portal-Netz, §13 Identität/Regionen/Pins) | `_lockstepStepGhost` (51 Brüche) steht namentlich in der Ratsche, bis `_schrittRein` steht |
| **K07** Gang-Gesetz | 2 · V18.543 | **Körper** wächst: `koerper-leib.js` (§06B–D Rig/Gang/IK/Ofen/Tier-Anim) + `koerper-bewegung.js` (25c, 25f, §15 Mensch-Avatar) | `_schrittKlangTick` liegt in Klang; seriell mit K11 mergen (§3.1 der Entscheidung) |
| **K11** Leuchtquellen | 3 · V18.543 | **Klang** (§03D/F, §04A) + **Bild-Himmel** (§24, §05E-Himmel, §20h) | Das Leuchtquellen-Verzeichnis entsteht in Bild als EINE Quelle; der Glut-Sweep in Klang fällt und liest die Lage |
| **K10** Ort auf dem Gelände | 1 · V18.544 | **Siedlung** (§20c, §17 Arch-*/Fundament/Wege, §14 Tor/Dorf-Render, §15 Arch-LOD) | `_archFundamentBox` (Gelände/Kollision) bleibt Gelände-Port; Plan v2 + ERDBAU ändern danach im Modul |

### 3.3 H1 am Nullpunkt der Zweige (Entscheidung §3.4)

H1 ist reine Mechanik: je Modul ein Umzug-Commit plus ein Wachen-Commit, seriell. **Kalt zuerst** (wenig Churn, keine Zweig-Kollision):
1. Speicher (§13 ≤ 2 % frisch);
2. Bau (§16 7 Commits);
3. Werkstatt/UI (§22/§23/25a kalt);
4. Feld-Rest (DSL/LLM/Chat);
5. Kreatur (nach K07 nur noch 3,6k Zeilen);
6. Kampf (nach K13 gemergt);
7. Wasser;
8. Körper-Fahrt und -Seele.

**Heiß zuletzt:**
1. Vegetation;
2. Studio-Brücke (§20f 59 Commits);
3. Stoff;
4. Bild-Pipeline (25j–l zu 78–100 % jünger als 30 Tage; R2, kamera-treue).

Danach folgen in eigenen Commits die Abschiede, die über Byte-Gleichheit hinausgehen:
- **Scheiben-Geburt:** `static anfang()` je Modul. Der constructor (922 Zeilen, davon 322 frisch, der Merge-Magnet jeder Karte) schrumpft auf die Wurzel.
- **Boot-Haken** statt der 30 fremden Schreibstellen von `init`.
- **Kern-Schritt 2:** Dichte, Mesh und Wasser-Gesetz in gelaende-core. Der Worker-Spiegel von §08 (56 %) und §09 (60 %) fällt ganz, und `worldFieldAt` wird Kern.
- **`_schrittRein`:** P2P-Geist ohne State-Tausch.
- **Ratsche auf 0** je Modul, über Port-Rufe.

### 3.4 Der Endzustand: der dünne Dirigent

`anazhRealm.js` behält:
- `class AnazhRealm` mit constructor (`state = Wurzel ∪ Modul.anfang()`);
- `init` als Boot-Reihenfolge der Modul-Haken;
- `startEternalLoop` (die Tick-Verben je Modul) mit Frame-Scheduler und Stand-Wache;
- den Regler (Takt: PID, Holz-Profile, Flugschreiber, Täter-Klassen; er besitzt die Regler-Ausgänge);
- `_loopRender` (ruft Bild);
- Spielmodus, Kamera-Modus, Input und UI-Fokus;
- die Dienste (log, `_el`, Journal, `getGameMode`, Takt-Budgets, `saveState`-Anstoß, `_uiDirty`);
- `AnazhRealm.Gesetz`, `GESETZ_KERNE` und `_kernPflichtBruch` mit den 11 Knoten-Statics;
- `MODULE` mit `_moduleEinhaengen` und `_bootAnazhRealm`.

Gemessen heute: Dirigent 4 366 + Dienste 1 194 Methoden-Zeilen. Nach der Scheiben-Geburt sind es ≈ 4 500 Zeilen gegen 104 222. Jede Fach-Karte liest ihre Datei (≤ 3k Zeilen) und die Port-Liste ihres Moduls.

---

## §4 Die Wand: `gate:grenzen`

- **Familie:** `scripts/diag-atlas.cjs`, der die Zonen schon kennt: `node scripts/diag-atlas.cjs --grenzen --selftest && node scripts/diag-atlas.cjs --grenzen`. Sie läuft in `npm run check` und damit im Puls (K14).
- **Konsum-Leser:** jeder Umzug-Commit (2.5 Schritt 4) und die Rückgabe jeder Karte (Zahl A/B).

### 4.1 Die Regeln

- **A · Besitz:** Eine Schreibstelle (Zählweise wie im Kopf, mit Aliasen) auf einen Schlüssel oder ein Feld, das eine andere Einheit besitzt, ist ein Bruch.
  - Einheit = Modul-Datei; ihr Besitz steht in der `besitz`-Liste der Registrierung.
  - Für Code, der noch im Stamm steht, ist die Einheit seine Atlas-Zone. Besitzer ist dann die Zone mit den meisten Schreibstellen; der constructor ist Geburt.
- **B · Richtung:** Ein Ruf aus einer Modul-Datei in eine Methode eines Moduls höherer Schicht (Ordnung = `MODULE`) ist ein Bruch. Dienste sind frei.
- **C · Register:** Ein Bruch liegt vor bei:
  - `MODULE` ≠ `realm/*.js` ≠ index.html-Tags (gleiches `?v=`);
  - einem Methoden-Namen in zwei Dateien (Zwilling);
  - einer `realm/`-Datei in irgendeinem `importScripts`.
- **D · Leser:** `readFileSync`/Pfad auf `anazhRealm.js` außerhalb von `stamm-quelle.cjs` ist ein Bruch.

### 4.2 Die Ratsche

`scripts/lib/grenzen-schuld.json` führt jeden heutigen Bruch **beim Namen** (Einheit · Methode · Schlüssel bzw. Ziel).
- Ein **neuer** Bruch ist ROT mit Namen.
- Ein Eintrag **ohne Treffer** ist ROT („Schuld getilgt — Zeile löschen"). Die Liste kann nicht verschimmeln und wird nie als Beweis zitiert, nur als Zähler, der fällt.
- Jede Karten-Rückgabe nennt A/B vorher↔nachher.
- Beim Umzug wechselt die Einheit eines Bruchs von Zone zu Datei. Der Umzug-Commit schreibt die Liste um (`--umschreiben`); erlaubt nur, wenn die Summe nicht steigt.

### 4.3 Vorher ROT am heutigen Stamm (`--streng`, ohne Schuldliste)

| Regel | Zahl heute | Täter beim Namen (Spitze) |
|---|---|---|
| A, Zonen-Einheiten | **603** Schreibstellen (560 state + 43 Felder), 236 Methoden, 21 Zonen, 149 Schlüssel mit ≥ 2 Schreib-Zonen | state.player 123 (12 Schreib-Zonen), blueprints 51, scene 28, worldMeta 28, playerMesh 24, symphony 22, dsl 16 |
| A, Modul-Zuschnitt dieser Karte | **572** (533 state + 39 Felder), 201 Methoden | `_lockstepStepGhost` 51 · `init` 30 · `_loopRender` 16 · `updatePlayerEmotions` 15 · `slidersInitDOM` 15 · `dslEffects` 11 · `_loadStateRestoreWorldMeta` 11 · `tryMouseBreak` 10 |
| B, Modul-Zuschnitt | **503** von 2 097 Rufstellen (24,0 %), 72 Paare | Tafel 1.4 |
| C | heute 0 Modul-Dateien, also nichts zu prüfen; Selbsttest-Fall 5 zeigt ROT | — |
| D | **54** Skripte | jede Datei namentlich |

Erzwungen werden ab Schritt 0: A auf Zonen-Ebene als Ratsche (603 darf nur fallen), A und B hart für jede **neue** Stelle in einer Modul-Datei, C und D hart. Der Zuschnitt-Wert 572/503 ist die Zielzahl, die H1 und die Port-Arbeit auf 0 drücken.

### 4.4 Selbsttest und Kosten

**Selbsttest** (synthetisch, im Speicher):
1. `this.state.player.hp = 0` in einer Modul-Datei → ROT „realm/x.js · _probe schreibt state.player (Besitz koerper)";
2. Alias `const st = this.state; st.creatures.push(k)` → ROT;
3. ein Aufwärts-Ruf → ROT;
4. ein Schuld-Eintrag ohne Treffer → ROT;
5. Zwilling Stamm + Datei → ROT;
6. 0 gelesene Dateien → ROT (Linsen-Vakuum);
7. der saubere Fall → GRÜN.

**Kosten:** gemessen 0,49–1,41 s für den ganzen Stamm (Parse + Lauf, `grenzen.cjs`); mit 17 Dateien und Selbsttest ≤ 3 s. Das liegt unter der Linsen-Grenze von 3 min und im Puls-Budget ≤ 2 min.

---

## §5 Risiken

| Risiko | Wo | Gegenmittel |
|---|---|---|
| **Linsen-Vakuum:** Text-Leser sehen umgezogenen Code nicht, Absenz-Wände werden durch Leere grün | 54 Direkt-Leser, 14 `fnBody`-Kopien, `verboten`-Listen in diag-altlasten, diag-source-probes, Stapel-Filter | Stamm-Quelle VOR dem ersten Umzug, Regel D, Selbsttest-Fall 6 |
| **fail-soft an der Modul-Grenze:** ein nicht geladenes Modul macht Wachen zu stillen No-ops | 318 `typeof this.X === "function"` | Register fail-closed (lauter Boot-Bruch), Wachen fallen im Commit nach jedem Umzug |
| **Boot-Zeitpunkt:** die Instanz entsteht vor dem Einhängen | `_bootAnazhRealm()` synchron am Stamm-Ende | Module laden vor dem Stamm, `_moduleEinhaengen()` steht vor `_bootAnazhRealm()`; der Pilot beweist es im echten Browser |
| **Byte-Gleichheit bricht leise** (prettier-Umbruch, Kopf-Kommentar verloren) | jede Datei | Einrückung 4 auf Spalte-0-Klasse; „entfernt ≡ eingefügt" je Spanne; diag-stamm-verbund; format:check im Umzug-Commit |
| **Vendor-Patches und rohes WebGPU** wandern mit (`this` = Renderer, `renderer.backend.device`) | §07B, §11 Feld-Pass/Panorama, 25j–l | R2, `[ci voll]`, gate:kamera-treue am echten WebGPU, `werkbank zaehlen` mit Programmen und Pipelines gleich; headless ist hier blind (Lehre 16) |
| **Worker-/WGSL-Spiegel:** ein Umzug darf keinen dritten Ort schaffen | §08 56 %, §09 60 % gespiegelt; feld-wgsl liest lebend Instanz-Glieder | Module nie im Worker (Regel C); das Gesetz geht nur über das Kern-Muster; Glieder bleiben am Prototyp, `spiegelEingaben(realm)` unberührt |
| **Merge-Gift** durch Umzug heißer Blöcke unter laufenden Zweigen | §17 61 %, §11 48 %, §06 45 % frisch; 7 offene Zweige | ziehen nur die Karte, die die Zone selbst anfasst, oder H1 am Nullpunkt; seriell, je Umzug ein Commit |
| **Statics:** Text-Umzug ist nicht byte-gleich (`AnazhRealm.X = …` → `static X = …`) | 464 Statics, 77 static-Getter, Ladeordnung in §26 | Statics bleiben im ersten Durchgang im Stamm. Wandern sie mit H1, dann mit Wert-Gleichheit (`JSON.stringify` vorher ≡ nachher); veränderliche Statics werden Modul-Zustand |
| **Ratsche wird Dauer-Erlaubnis** | grenzen-schuld.json | Stale-Eintrag ROT, Summe nur fallend, Zahl in jeder Rückgabe; die Port-Arbeit hat Täter-Namen (Tafel 4.3) |
| **Kontext-Gewinn verfehlt**, weil Module zu groß sind | Werkstatt/UI 11,7k, Körper 7,0k | Datei ≤ 3k Zeilen als Atlas-Regel (`--check` meldet Übergröße beim Namen) |
| **Fehler-Stapel und Zeilenbezüge** ändern sich (DevTools, Täter-Stapel, `:Zeile`-Zitate in Karten) | haenger-linse, ausgabe-aufnahme, Karten-Texte | Stapel-Filter über `stammDateien()`; Karten zitieren nach dem Umzug `datei:zeile`, der Atlas druckt beide |
| **CI-Zeit** | Puls ≤ 2 min | `gate:grenzen` ≤ 3 s, diag-stamm-verbund ≈ 1 s, `node --check` je Datei < 1 s |

Pflicht-OFFEN bleibt unberührt (A, B, C, E in docs/PFLICHT-OFFEN.md). Diese Karte setzt keinen Eintrag; sie ist die Zielkarte aus Entscheidung §6.6.

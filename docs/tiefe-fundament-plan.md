# Tiefe-Fundament-Plan — der Plan unter der Oberfläche (Stand V17.100, 04.06.2026)

Schöpfer-Befund (Browser-Audit, drei Screenshots): das Terrain ist nahe + ruckelt in neue Chunks; die Console/Save/Nexus ruckeln im 10-s-Takt; ein Licht-Bug ("Trapeze" tagsüber, weg nach 18:00) + Stein/Eisen nachts schwarz + Strukturen ohne Mikrostruktur; Höhlen sind mit dem gigantisch gewordenen Terrain NICHT mitgewachsen (mickrige Schläuche, keine Eingänge/Canyons); Wasser klebt an Höhlenwänden / unter dem Boden, die Schwimmmechanik greift über Lufthöhlen.

## Stand-Übersicht (V17.100) — was gebaut ist

- **A — 10-s-Ruckel:** ✅ A1 (Gras deferred, V17.92) + A2 (surface-aware Gras-Keep, V17.97). Per-Chunk-Rebuild 75 → 48.8 ms.
- **B / H1 — Falsch-Schwimm:** ✅ V17.93 (`_waterCellAt`) + V17.95 (`_playerWaterContext`, Cell-Spiegel statt 2.5D-Spalte).
- **C — Strukturen schwarz/flach:** ✅ C1 (Schwarz-Floor emissive, V17.94) + C2 (Aerial-MELT via outputNode, V17.99). **Aber: C2 heilte das Symptom auf einem PARALLELEN Pfad → siehe Render-Harmonie-Bogen unten.**
- **D — Trapeze:** ✅ teil-geheilt — AO gedämpft (V17.99) + Gradient-Normalen geglättet (eps 1.5, V17.100). **Rest (Cel-Härte) = Render-Harmonie-Bogen.**
- **F — Effiziente Höhe (KEYSTONE):** ✅ V17.96 (Hülle dimY 200/100, tanh-Deckel 225, Band-Skip bit-identisch, Berge 244 m, 0 Durchbrüche).
- **G — Große Kavernen:** ✅ Kern V17.98 (niederfrequentes Kavernen-Feld, subsurface gegated). Offen: G3 Oberflächen-Eingänge/Canyons (braucht H).
- **H — Aquifer:** ✅ V17.99 (caveDry: See flutet Höhlen darunter nicht; 0 Höhlen-Blasen, Seen intakt). Offen: H3 ferne-Chunk-Wasser (>1024 m).
- **I — Tote Infra:** ✅ V17.20.
- **E — Weite LOD-Pyramide:** ⏳ OFFEN (jetzt von F entriegelt — billige Chunks).

**Der Render-Harmonie-Bogen (J) — J1+J2 ✅ GEBAUT (V17.101), J3/J4 = Browser-Dials.** Er ist die Wurzel-Heilung des „Strukturen reagieren anders als Terrain auf Licht/Nebel"-Befundes, den C2 nur als Parallel-Pfad symptom-behandelt hat. **J1 (geteilte `_applyAerialOutput`, alle Ebenen post-lighting identisch) + J2 (output-seitige Mikro-Tiefe für Strukturen) sind gebaut + KONSUM-verifiziert (7 Invarianten); der Schöpfer-Browser-Sign-off der vereinten Atmosphäre + J3 (Wasser-Glitzer) + J4 (Cel-Härte) sind die pixel-blinden Reste.**

## 0. Die EINE Wurzel (vier der sechs Befunde teilen sie)

Die **vertikale Chunk-Hülle ist beim V14-Terrain-Bogen NICHT mitgewachsen.** Sie ist fix an `base` (≈0) verankert (`_voxelChunkConfig` `anazhRealm.js:18231`: `floorDrop 90`, `dimY 136 × step 1.8` → `base−90 .. base+154.8`). Das Terrain wuchs auf −15..+235 m (`_terrainMacroSurfaceY`, `cont0` λ7100 m) und wird per `tanh`-Deckel bei 110/136 m gekappt (`:17390`). Die Höhlen sind ebenfalls base-verankert (`_terrainBaseDensityAt:17448`, Band `base−35..surf−16`, λ≈33 m). Das Wasser ist 2.5D (`_hydroWaterLevelAt:21030`, ignoriert y).

Der Backlog-Faden **#11 "Effiziente Höhe"** (adaptives Vertikalband) ist der **Keystone**: er koppelt die Vertikal-Domäne wieder an die Oberfläche → gewaltige Berge + mitwachsende Höhlen + sauberes Wasser-Sampling werden erst dadurch möglich. Die anderen zwei Befunde (10-s-Ruckel, Trapeze/schwarze Strukturen) sind eigene Wurzeln (Timing/Render).

## 0.1 Die Narben, an denen sich dieser Plan messen lässt (Disziplin)

- **V9.69 — eine Welt-Substanz lebt in EINER Skala, sonst zerbricht sie an der Naht.**
- **V9.70 — Skirts gebaut, "visuell wirkungslos": die Naht ist nicht die Geometrie.**
- **V9.77 — PRO-CHUNK-Variablen in der Klassifikations-Logik sind fast immer Naht-Bug-Quellen.**
- **V9.79/V13.13.2 — naht-frei per Konstruktion verlangt Pad+Crop; ein zweiter Konsument einer Welt-Wahrheit MUSS sie LESEN, nie neu raten.**
- **V13 — Symptom-Patches auf einem System, dessen Wurzel benannt ist, sind Flickenteppich.**
- **V9.58 / V17.90 — messen vor schneiden; "Last-Flake" ist die bequeme Diagnose, bevor du sie akzeptierst, MISS.**
- **V17.31 — Passagier-Trugschluss: KONSUM verifizieren, nicht Existenz.**
- **V17.91 — UI-Ort-Bug: prüfe, ob das neue Element default-sichtbar ist + der Schöpfer dort hinschaut.**
- **Heilige Lektion — Verdichtung auf dem einen Stamm, kein Parallel-System, kein Rewrite.**

## 0.2 Verifikations-Doktrin

Jede Welle: `node --check anazhRealm.js` → `npm run format:check` → `npm run lint` → `npm run playtest` ("Alle Invarianten OK") → Commit (ein Commit + ein `handover.md`-Eintrag). **Render-Wellen (C/D) + LOD-Feel (E) sind pixel-blind headless** → headless beweist Konstruktion/KONSUM/keine Page-Errors, die VISUELLE Wahrheit ist der Schöpfer-Browser-Sign-off (explizit als Wartepunkt markiert, nicht "grün = fertig"). **Worldgen-Wellen (F/G/H)** brechen Determinismus (Welt-Aussehen) → Schöpfer-Sign-off + `diag`-Mess-Baseline VOR dem Schnitt + Worker-Mirror bit-identisch.

---

## Welle A — Der 10-Sekunden-Ruckel — GEMESSEN, Wurzel REDIRECTED

**A0-MESSUNG (`scripts/diag-stutter.cjs` + `diag-edit-perf.cjs`, 03.06.) widerlegt die Annahme.** In einer repräsentativen Welt (46 Bauten, 17 Kreaturen, 39 KB Snapshot): **Journal-Rebuild 1.8 ms · Save gesamt 1 ms (Snapshot 0.2 + stringify 0.3 + localStorage 0.5) · Nexus-Frame 4.1 ms** — KEINE blockiert einen Frame (>16 ms). Die ursprünglich geplanten Fixes (idle-Save, inkrementelles Journal) zielten auf ein Nicht-Problem (V17.90-Lehre: messen, bevor du "Last-Flake" akzeptierst).

**Die ECHTE Wurzel (gemessen).** Ein **Per-Chunk-Rebuild kostet 75 ms** (`diag-edit-perf`): Gras **34 ms** (dominant) · Density+Data 22 ms · Wasser-Iso 18.7 ms · BVH 8 ms. Der Ruckel ist der **deferred Rebuild-Drain**: ein Nexus-Struktur-Spawn ruft `_remeshVoxelChunksAround(skirt=1)` → markiert ~9 Chunks dirty (billig, 0.1 ms) → `_tickDirtyVoxelChunks:22749` rebuildet sie **1/Frame à 75 ms** → ~9 Frames Stutter (~13 FPS). **Das ist DIESELBE Wurzel wie "FPS-Einbruch in neue Chunks"** (der Streaming-Finalize baut Gras 34 ms + Wasser-Iso 18.7 ms + BVH main-thread). Zwei Schöpfer-Befunde vereinen sich in EINEM Hebel: die Per-Chunk-Main-Thread-Kosten.

**Der Schlüssel-Befund: ein Struktur-Spawn-Remesh ändert NUR die Wasser-Cells, NICHT Terrain/Gras** — der Rebuild regeneriert Gras (34 ms) umsonst (`_rebuildVoxelChunk:19579` → `_finalizeVoxelChunkBuild` → `_buildVoxelChunkGrass:19503`).

**Vorgehen (REDIRECTED — der gemessene #1-Hebel: Gras von der Rebuild-Kritik-Pfad nehmen).**

- **A1 — Gras deferred** (wie Scatter V17.1): `_buildVoxelChunkGrass` aus dem synchronen `_finalizeVoxelChunkBuild` in eine `_enqueueGrass`/`_tickPendingGrass`-Queue (≤budget/Frame, nahe zuerst); Dispose verwirft die pending. Senkt den Rebuild-/Streaming-Spike 75 → ~40 ms.
- **A2 — Wasser-only-Remesh hält Gras** (optional, größerer Hebel): ein Struktur-Spawn-Remesh (`_remeshVoxelChunksAround`) reklassifiziert nur Wasser-Cells → er muss Gras NICHT disposen/neu bauen (es ist unverändert). Spart 34 ms je gespawntem-Struktur-Rebuild.
- **A3 — Takt-Versatz** (trivial, billig): Save (12 s) vs Nexus (10 s) phasen-versetzen, damit ihre kleinen Kosten nie im selben Frame liegen.
- **VERWORFEN (gemessen unnötig)**: idle-Save (1 ms), inkrementelles Journal (1.8 ms) — kein messbarer Gewinn, nur Risiko.

**Messung.** `diag-edit-perf` vorher/nachher: Per-Chunk-Rebuild-ms + die Komponenten-Aufschlüsselung (Gras aus dem Sync-Pfad → fällt der Rebuild < 40 ms). Playtest: Gras-Pool-Leak-Test (maxPoolSize=1) bleibt grün; das Test-Naht-Drain (`_drainDirtyVoxelChunks`) drainet auch die Gras-Queue (V9.56-i).

**Abnahme (erfüllt wenn).** (1) `diag-edit-perf` zeigt Per-Chunk-Rebuild < 45 ms (Gras raus aus dem Sync-Pfad); (2) Gras-Leak-Test grün (kein Pool-Snowball); (3) ein Struktur-Spawn behält das Gras (A2, Invariante); (4) Playtest "Alle Invarianten OK". **Browser-Sign-off**: "kein Ruckeln bei Nexus-Spawns + sanfteres Chunk-Laden".

**Risiko.** Niedrig-mittel. Gras-Defer ändert WANN Gras erscheint (1 Frame später, imperzeptibel) → Test-Naht muss die Gras-Queue drainen (V9.56-i, wie Scatter/dirty-Chunks).

---

## Welle B — Die Falsch-Schwimm-Mechanik (3D-Zelle statt 2.5D-Spalte)

**Ziel.** Der Auftrieb liest die echte 3D-Wasserzelle an der Spieler-Position, nicht die 2.5D-Spalte.

**Wurzel (gemessen).** `:44857–44898`: `submerged = scaledY < _hydroWaterLevelAt(x,z)` — Spalten-Lookup ohne y. Der `scaledY >= wTerrainY − 22`-Guard (`:44884`) fängt nur tiefe Glitches, nicht flache Lufthöhlen unter Seen. Der Auftrieb ist der **DRITTE Konsument der Wasser-Wahrheit, der sie 2.5D neu rät statt die Cells zu lesen** (V13.13.2-Muster: erst Iso-Mesher-OOB, dann Seeding, jetzt Auftrieb).

**Vorgehen.** Ein Helper `_waterCellAt(x,y,z)` → liest `entry.waterCells` des gestreamten Chunks am 3D-Index (`i + k·dim + j·dim·dim`, `oy/step` aus `_voxelChunkConfig`). Der Auftrieb gated zusätzlich auf `_waterCellAt === WATER`. Fallback auf den 2.5D-Wert nur, wenn der Chunk (noch) nicht gestreamt ist (Backward-Compat am Streaming-Rand).

**Messung.** `diag-water-truth.cjs`-Muster erweitern: ein synthetischer Aufbau (Lufthöhle unter einem See-Spiegel) → der Auftrieb darf NICHT greifen; ein echter See → greift. Playtest-Invariante: `_waterCellAt` an einer trockenen Höhlen-Zelle unter Wasserspiegel = nicht-WATER → kein `submerged`.

**Abnahme (erfüllt wenn).** (1) synthetische Lufthöhle unter See → `playerUnderwater === false` (Invariante); (2) echtes See-Wasser → `submerged === true` (Invariante, kein Regress); (3) Streaming-Rand-Fallback funktioniert; (4) Playtest "Alle Invarianten OK". **Browser-Sign-off**: "schwimme nicht mehr unter dem Boden".

**Risiko.** Niedrig. Berührt nur den Auftrieb-Read, nicht die Wasser-Cells.

---

## Welle C — Strukturen schwarz/flach (Tiefe-colorNode für Flach-Materialien)

**Ziel.** Stein/Eisen-Strukturen fallen nachts nicht mehr nach Schwarz; Strukturen tragen Mikro-Textur/Tiefe wie das Terrain.

**Wurzel.** Mikro-Textur (V15.1) + Kavitäts-AO (V15.2) + Aerial-Perspektive (V15.4) sind auf `opts.vertexColors` gegated (`:19084`) → nur Terrain. Strukturen (`_buildFromBlueprint:31110`) sind Flach-Farb-`MeshToon` ohne das Flag. V17.7 hob nur den Ambient-Floor (laut eigener Notiz `:41890` für colorNode-lose Materialien wirkungsarm).

**Vorgehen.**

- **C1 ✅ GEBAUT (V17.94) — der Schwarz-Floor (native, headless-sicher)**: ein schwaches Eigen-Leuchten (`mat.emissive` in der EIGENEN Materialfarbe, `emissiveIntensity` 0.07) auf Flach-Farb-Toon-Materials (nicht-`vertexColors`, nicht transparent) → Stein/Eisen glimmen nachts schwach in ihrem Ton statt nach Schwarz zu fallen; tags von der Sonne überstimmt. KEIN TSL-/outputNode-Risiko, KEIN colorNode (der die dynamischen Marking-/Emotion-Farben bräche — CLAUDE.md-Gotcha). `AnazhRealm.STRUCTURE_EMISSIVE` browser-justierbar. GEMESSEN-KONSUM (`diag-structure-color`): Struktur trägt das Leuchten, Terrain/Phantom nicht, dynamische Farbe weiter setzbar, kein Page-Error.
- **C2 — die Aerial-MELT + Mikro-Textur der Strukturen (pixel-blind, BROWSER-iteriert)**: der „flach/pappig"-Teil (Strukturen schmelzen in dieselbe Atmosphäre wie das Terrain + tragen Mikro-Tiefe). Via `outputNode` (post-lighting, gegen dynamische Farben gegated) — aber der WebGPU-outputNode-Mechanismus + das Feel sind pixel-blind → NICHT blind bauen (V10.0-g.r „Render-Disharmonie vor technische Ambition; Rollback ist Disziplin"); der Schöpfer-Browser-Loop justiert es.

**Messung.** `diag-structure-color.cjs`: `material` nach `outputNode`-Bau headless deterministisch lesbar — beweist KONSUM (Struktur-Helligkeit bei Nacht-Licht > Schwarz-Schwelle), nicht nur Existenz. Page-Error-Probe (kein `AttributeNode`-Crash, V15.1.1-Klasse).

**Abnahme (erfüllt wenn).** (1) `outputNode` gesetzt + kein Marker/Page-Error; (2) headless: Struktur-Output bei Nacht-Intensität hebt sich messbar über Schwarz; (3) dynamische Avatar-/Kreatur-Farben unberührt (Invariante); (4) Playtest "Alle Invarianten OK". **Browser-Sign-off (pixel-blind, zwingend)**: "nicht mehr schwarz, jetzt tief".

**Risiko.** Mittel — der `outputNode`-Pfad muss strikt gegen dynamische Material-Farben gegated sein.

---

## Welle D — Die Trapeze (Facetten-Cel-Shading)

**Ziel.** Die hellen Rauten-Facetten verschwinden — die Oberfläche wirkt tief, nicht flach-facettiert.

**Wurzel (Dev-Notiz `:19117`).** Vertex-Farbe linear interpoliert über große Surface-Nets-Dreiecke + hartes Toon-Cel-Shading → sonnenzugewandte Facetten poppen als helle Rauten; abends dominiert Ambient/Hemi → Kontrast bricht zusammen → weg. V17.12/.13/.14 überdeckten dreimal die ALBEDO; die BELEUCHTUNGS-/Normalen-Facette blieb. **Disziplin: kein vierter Überdeck-Patch.**

**Vorgehen.**

- **D0 — MESSEN zuerst (Browser-Toggle)**: Schatten aus / Cel→Lambert / Aerial aus → in 3 Klicks isolieren, ob Cel-Härte, Schatten-Acne, Aerial-Höhenband oder Vertex-Interp die Wurzel ist. KEIN Vorab-Commit auf einen Fix.
- **D1 — führender Kandidat: Cel-Gradient glätten** (die Beleuchtungs-Härte, der wurzel-nächste + billigste Hebel) — mehr/weichere Cel-Stufen, sodass die Bänder nicht an Facetten-Grenzen snappen.
- **D2 — falls Restanteil**: per-Pixel-Normal-Detail (triplanar Normal-Perturbation, bricht die flache Facette ohne Geometrie-Änderung) ODER Schatten-Bias slope-skaliert / CSM.

**Messung.** D0 ist die Messung (Browser, isolierende Toggles). Headless: der colorNode/gradientMap-Bau kompiliert + kein Page-Error.

**Abnahme (erfüllt wenn).** (1) D0 hat die Wurzel isoliert (dokumentiert); (2) der gewählte Fix kompiliert headless ohne Page-Error; (3) Playtest "Alle Invarianten OK". **Browser-Sign-off (pixel-blind, zwingend)**: "keine Trapeze mehr, tags wie nachts".

**Risiko.** Render-only, aber pixel-blind → strikt Browser-iteriert.

---

## Welle F — KEYSTONE: Effiziente Höhe (fixes globales Vertikal-Section-Raster) [#11]

**Ziel.** Gewaltige Berge (Deckel weg) + billigere Chunks (leere Luft kostet nichts) → trägt E + G.

**Wurzel.** Jeder Chunk sampelt die volle 136-Zellen-Säule; der `tanh`-Deckel (`:17390`) kappt Berge. Die V14.6-Notiz nennt den Deckel selbst die "Zwischenlösung".

**Vorgehen (gemessen, in zwei Stufen — F1 sicher, F2 look-ändernd).** GEMESSEN (`:17761` `_voxelSampleDensityGrid`): die Density wird als volles `Nx×(dimY+1)×Nz`-Grid (137 vertikale Ebenen) gesampelt — die `sample()`-Aufrufe sind der teure Teil (22 ms, `diag-edit-perf`).

- **F1 — Band-Skip-Sampling (SICHER, bit-identisch, echte Effizienz):** innerhalb der BESTEHENDEN Hülle nur die j-Ebenen um die Oberfläche `sample()`-n; Ebenen über `surfMax+Marge` mit AIR (konstant < 0), unter dem Höhlen-Boden (`base−35`) mit SOLID (konstant > 0) FÜLLEN — ohne `sample()`. Gleiche Geometrie (kein Sign-Change in den Konstant-Zonen → identisches Mesh), weniger Sample-Calls → billigere Chunks (hilft den Stutter-Wurzel-Rest + E). Seam-frei (das Band hat Marge + enthält jeden Sign-Change inkl. Edit-Bounds; die Band-Grenzen aus `_terrainMacroSurfaceY` sind deterministisch). Worker-Mirror bit-identisch (Determinismus-Test), Edit-Delta bleibt separat (V12.0-perf.b). **Das ist der sichere Effizienz-Hebel — KEINE Hüllen-/Deckel-Änderung, kein Look-Wechsel.**
- **F2 — gewaltige Berge (LOOK-ÄNDERND, Determinismus-Bruch, Schöpfer-Sign-off):** den `tanh`-Deckel (`:17390`) lösen + die Hülle der Oberfläche folgen lassen (Decke = `surfMax + Marge` pro Chunk-Region, NICHT per-Chunk-variabel → ein globales Section-Raster, leere Sections übersprungen; V9.77-naht-sicher). Berge bis +235 m ohne Durchbruch. **Ändert das Welt-Aussehen → Browser-Sign-off zwingend (genau dein End-Audit).**

**Messung.** `diag-radius.cjs` (Decken-Marge radial ±5 km, 0 Durchbrüche) + `diag-relief.cjs` (Berg-Höhen-Verteilung erreicht jetzt > 136 m) + ein Determinismus-Test (Main- vs Worker-Density bit-identisch) + ein Naht-Test (Nachbar-Chunk-Boundary-Iso identisch) + Per-Chunk-Zell-Zahl (gesunken).

**Abnahme (erfüllt wenn).** (1) Berge erreichen messbar > 136 m, 0 Decken-Durchbrüche bei jedem Radius (`diag-radius`); (2) Worker bit-identisch (Determinismus-Test); (3) keine neuen Nähte (Boundary-Iso-Test); (4) Per-Chunk-Kosten gesunken (Zell-Zahl/Build-Zeit); (5) Playtest "Alle Invarianten OK". **Schöpfer-Sign-off** (Determinismus-Bruch): "gewaltige Berge, kein Loch, kein FPS-Verlust".

**Risiko.** HOCH — Mesh-Fundament + Worker-Mirror + Naht-Garantie. Sub-Schritte mit Determinismus-Wächter, `cp`-Backup vor sed-Chirurgie (V17.20-Lehre).

---

## Welle E — Weite Terrain + LOD-Pyramide + Stitching

**Ziel.** Terrain bis hinter den Fog-Horizont, sanftes Laden über viele Stufen, kein Pop-in, kein Sync-Build-Spike.

**Wurzel.** View-Ring 4 (≈173 m) endet vor dem Fog (450 m); nur 2 LOD-Stufen, harter Pop, Naht am LOD-Rand (`:18224`); Sync-CPU-Build-Fallback (~126 ms) wenn der Worker hinterherhinkt.

**Vorgehen (SEAM-SAFE, korrigiert).**

- **E1 — LOD-Pyramide**: LOD2 (step 7.2 m) + LOD3 (14.4 m) für ferne Ringe (64× weniger Zellen). Vorbedingung F (billige Chunks).
- **E2 — View bis Fog-Horizont**: Ringe füllen ~450 m → Pop-in jenseits der Sichtbarkeit.
- **E3 — kein Sync-Streaming-Build**: nur der Spieler-Chunk darf sync; ferne warten auf den Worker, alter Chunk bleibt sichtbar (der Sync-Fallback ist der Spike).
- **E4 — LOD-Stitching (ERST-KLASSE)**: die V9.70-Skirts haben Nähte NICHT geheilt → ein echtes Stitching/Geomorphing am LOD-Übergang (Clipmap-Transition-Region) + dithered Crossfade. KEINE blanken Skirts.

**Messung.** Headless: Chunk-Zahl/LOD-Verteilung; kein Sync-Build im Streaming-Pfad (Invariante: nur Spieler-Chunk sync); Worker-Determinismus über LODs. Naht-Test am LOD2/LOD3-Rand.

**Abnahme (erfüllt wenn).** (1) Terrain reicht bis Fog-Horizont (Chunk-Verteilungs-Invariante); (2) kein Sync-Build außer Spieler-Chunk (Invariante); (3) LOD-Naht-Test grün; (4) Playtest "Alle Invarianten OK". **Browser-Sign-off (pixel-blind)**: "weite Sicht, sanftes Laden, kein Pop-in, keine LOD-Naht".

**Risiko.** Hoch — LOD-Nähte sind die historische Wunde (V9.70). Nach F.

---

## Welle H — Wasser-3D-Wahrheit (V18 Wasser-Finish) [#10]

**Ziel.** Wasser ist überall 3D-konsistent; ferne Chunks tragen Wasser; Carve frame-sauber.

**Wurzel.** Cells korrekt (V13.14), aber Seeds 2.5D (`_atlasWaterLevelAt(x,z,∞):19963`), Auftrieb 2.5D (= B), Hydrosphäre nur ±1024 m.

**Vorgehen.** H1 = B (Auftrieb 3D, vorgezogen). H2 — Seeds 3D-konsistent (nur fluten, was über nicht-soliden Raum mit einer Quelle verbunden ist; der Flood macht's, die Seeds müssen nachziehen). H3 — Hydrosphäre-Region mit dem Spieler mitwandern ODER Ozean-Default global vom `waterLevel` entkoppeln. H4 — frame-sauberer Sub-Region-Carve.

**Messung.** `diag-water-truth.cjs` (under-lid 0, >3 m über Quelle 0, Phantom-Seam 0) an mehreren Orten; ferner Chunk trägt Wasser (Invariante).

**Abnahme (erfüllt wenn).** (1) `diag-water-truth` an 3 Orten sauber; (2) ferner Chunk (> 1024 m) trägt Wasser (Invariante); (3) Playtest "Alle Invarianten OK". **Browser-Sign-off** (Spawn ≠ Fehlstelle, V13.0-Mess-Falle): Dump an der echten Stelle vor H2/H3.

**Risiko.** Hoch (headless reproduziert Browser-Artefakte nicht).

---

## Welle G — Höhlen, die mit dem Terrain wachsen (Canyons/Eingänge)

**Ziel.** Höhlen skalieren mit dem Terrain; große Kavernen + Ravines + kontrollierte Oberflächen-Eingänge.

**Wurzel.** Höhlen base-verankert + dünn; `surf−16`-Decke verbietet bewusst Eingänge (war der V14.5-Water-Bleed-Fix).

**Vorgehen (STRIKT NACH H — Eingänge brauchen 3D-Wasser-Wahrheit/Aquifer, sonst Bleed).** G1 — Höhlen-Tiefe relativ zur Oberfläche (an F gekoppelt). G2 — Typen: große Kavernen (niederfrequent) + Tunnel (λ33 m) + Ravines (vertikal). G3 — `surf−16`-Decke selektiv öffnen (Ravine/Cheese) → Canyons. G4 — Aquifer (lokaler Höhlen-Wasserspiegel statt globaler Spalte; Eingang flutet die Höhle nicht).

**Messung.** Erweitertes `diag-relief.cjs`: Höhlen-Volumen/Tiefe-Verteilung skaliert mit der Surface; Eingangs-Zahl > 0; kein Water-Bleed an Eingängen (`diag-water-truth`).

**Abnahme (erfüllt wenn).** (1) Höhlen-Tiefe skaliert mit Surface (Mess-Baseline); (2) Eingänge existieren ohne Water-Bleed; (3) Playtest "Alle Invarianten OK". **Schöpfer-Sign-off** (Determinismus-Bruch): "Höhlen wie Minecraft, Canyons in die Unterwelt".

**Risiko.** Hoch (Worldgen + Wasser-Kopplung). Letzte Welle des Bogens.

---

## Welle I — Tote Infra schneiden [#12] — ✅ BEREITS ERLEDIGT (V17.20)

GEMESSEN (04.06.): das GPU-Density-WGSL-Cluster (`WGSL_DENSITY_GRID`/`_voxelGpu*`) ist seit V17.20 entfernt (nur Erklär-Kommentare bleiben bei `:19480`); `mxFractal` existiert nicht mehr; `npm run lint` ist warning-frei; keine Hot-Swap-Reste. Die Mirror-Last für F ist damit schon reduziert. Kein Schnitt nötig.

---

## Welle J — DER RENDER-HARMONIE-BOGEN (der neue aktive Faden, V17.101+)

**Schöpfer-Befund (04.06., Browser-Audit nach V17.100):** „Strukturen wie Bäume, Türme tragen fast die Himmelsfarbe, bei rainy völlig nebelig — reagieren ANDERS als das Terrain auf die Fog-Distanz. Trapeze/Streifen driften mit dem Licht (Schatten wo Licht sein sollte). Die Sonnenreflexion im Wasser ist versetzt. Ist das wie Aura/Werkstatt eine Matrix, die alle Ebenen gleich lesen?"

### J.0 — Die GEMESSENE Wurzel (im Code verifiziert, `anazhRealm.js`)

Die acht Render-Ebenen teilen KEINE gemeinsame Atmosphäre — sie lesen **sieben divergente Approximationen**. Die zwei kritischen Divergenzen, gerechnet:

- **Terrain-Aerial (`:19401-19411`) liegt auf der ALBEDO (`colorNode`, VOR dem Licht)** → `_haze = distHaze(cap 0.35) + heightHaze·0.6`, cap 0.85, dann `mix(albedo, skyColor, haze)`. Die Beleuchtung dunkelt die gemeltete Albedo danach ab → das Terrain bleibt *neblig-aber-beleuchtet* (atmosphärisch).
- **Struktur-Aerial (`:19222-19231`) liegt auf der FERTIGEN lit-Farbe (`outputNode`, NACH dem Licht)** → `_haze = distHaze(cap 0.35) + heightHaze·0.5`, cap 0.8, dann `mix(output.xyz, skyColor, haze)`. Das Licht ist schon drin → die Melt überschreibt es → die Struktur wird flach zur reinen Himmelsfarbe, **lichtunabhängig**.
- **Doppel-Nebel:** Strukturen tragen `scene.fog` (post, `:44468`) UND die outputNode-Melt (post) → zweifache Distanz-Haze; das Terrain trägt `scene.fog` (post) + colorNode-Melt (pre).
- **Rainy-Rechnung** (gemessen `_dayNightApplyHemiAndFog:42287-42301`): `density 0.0145`, `hazeTop 95 m`. Ein Baum auf einem V17.96-Berg (Boden y≥100) → `smoothstep(40, 95, 100)=1.0` → Struktur-haze ≥0.5 **post-lighting** → Endfarbe ≥50 % reiner Himmel, egal wie das Licht fällt = „völlig nebelig". Das Terrain am selben Ort melt'et zwar auch, bleibt aber lit. **Das ist die Disharmonie, gerechnet.**
- **Mikro-Textur + Kavitäts-AO (`:19251`)** sind auf `opts.vertexColors` gegated → NUR Terrain/Inseln. Strukturen/Bäume sind flach-pappig.

**Eigen-Befund (Disziplin):** meine C2-Welle (V17.99) heilte das Symptom auf einem PARALLELEN Pfad (eine zweite, andere Aerial-Mathematik für Strukturen) — statt sie in DENSELBEN Pfad wie das Terrain zu führen. Das ist die V9.82-Parallel-Pfade-Sünde in Render-Gestalt + die V13-„Symptom-Patch auf benannter Wurzel"-Narbe.

### J.1 — Der wahre Weg: EINE Atmosphäre, die alle Ebenen identisch lesen (wie die Aura)

Die Riesen (Genshin/BotW/Ghibli-Engines) haben EINE geteilte Atmosphären-Funktion, die jede opake Ebene am Ende identisch aufruft — physikalisch korrekt **post-lighting** (die Luft streut Licht zwischen Oberfläche und Auge, unabhängig von der Oberflächen-Beleuchtung):

```
finalColor = applyAtmosphere( litColor, worldPos, viewDist )   // ein Term, viele Leser
```

- **EIN geteilter `outputNode`-Helper** (`_applyAerialOutput(mat)`) mit IDENTISCHER Mathematik (dieselbe `atmoUniforms`-Quelle, dieselben Gewichte, derselbe Cap) für Terrain, Inseln, Strukturen, Bäume, Kreaturen.
- **`scene.fog = false` auf diesen Materialien** (`material.fog = false`) → genau EIN Atmosphären-Pfad, kein Doppel-Nebel. (Gras/Wasser bleiben Sonderfälle mit eigenem Shader — sie rufen denselben Helper-Term, wo möglich.)
- **Terrain von colorNode-Aerial auf outputNode-Aerial umstellen** → es melt'et dann wie alles andere post-lighting. **Das ändert den Terrain-Look (heute light-modulated) → Browser-Sign-off ZWINGEND (Determinismus-Bruch im Aussehen).**
- **Mikro-Textur/AO für Strukturen** über den Output-Pfad verfügbar machen (NICHT colorNode — der bräche die dynamischen Marking-/Emotion-`material.color`, CLAUDE.md-Gotcha) → Strukturen verlieren das Pappige, ohne die Farb-Mutation zu brechen.

Das schneidet KEINE System-Tiefe — es macht die Atmosphäre *einheitlich* tief: „ein Feld, viele Leser", exakt analog zur Aura.

### J.2 — Trapeze (Cel-Härte, der Rest nach V17.100)

Die Trapeze sind die Iso-Konturen von `dot(Normale, Sonne)` im Cel-Shading — sie wandern mit der Sonne, weg nach 18:00 (Ambient dominiert). **NICHT die Biomdurchmischung.** V17.100 glättete die Normalen (eps 1.5); der Rest ist die Cel-Stufen-HÄRTE. Hebel: mehr/weichere Cel-Stufen (Cel-Levels-Slider) ODER den Cel-Term nur auf den Sonnen-Beitrag beschränken (AO/Ambient glatt). Pixel-blind → Browser-iteriert.

### J.3 — Wasser-Sonnenreflexion-Versatz (NICHT headless verifizierbar)

Verifiziert: das Glitzern (`:21645-21648`, Blinn-Phong) nutzt DENSELBEN `sunDir` wie DirectionalLight + Skybox-Glow (`:42214/42219/42352`, alle aus `_dayNightSunDirection`). Ein Blinn-Phong-Glitzern IST physikalisch die Spiegelung der Sonne → naturgemäß versetzt (unter der Sonne). **Browser-Check:** läuft das Glitzern mit der Sonne mit (gleiche senkrechte Ebene), wenn die Zeit fortschreitet? Ja → korrekt (Spiegel-Versatz). Seitlicher Drift → echter Bug (Wasser-Mesh-Normal/Eye-Position, nicht sunDir).

### J — Vorgehen, Messung, Abnahme

- **J1 — der geteilte Aerial-Helper ✅ GEBAUT (V17.101):** `_applyAerialOutput(mat, opts)` extrahiert; Terrain/Inseln/Strukturen/Bäume/Kreaturen rufen ihn am Ende von `_buildToonNodeMaterial` IDENTISCH (post-lighting auf `TSL.output`); der alte Struktur-outputNode (C2) + der Terrain-colorNode-Aerial (V15.4) sind ENTFERNT. **Arbeitsteilung korrigiert (Path X statt fog=false): scene.fog trägt die DISTANZ uniform (umhüllt den outputNode — vom Symptom „Strukturen MEHR nebelig" bewiesen), `_applyAerialOutput` trägt die HÖHE → kein Doppel-Distanz-Term mehr.** GEMESSEN-KONSUM (7 Invarianten im V8.28-Band): Terrain UND Struktur bekommen DENSELBEN outputNode, EINE Quelle (kein `__structAerialError`), dynamische Farbe heil, Phantom gegated, kein Node-Fehler. **OFFEN: Browser-Sign-off** „Strukturen + Terrain schmelzen IDENTISCH, kein Pappig bei rainy".
- **J2 — Mikro-Textur/AO für Strukturen ✅ GEBAUT (V17.101):** output-seitiger Mikro-Shade (mx_noise ±10 %) + Kavitäts-AO, multiplikativ auf `output.xyz` (nicht colorNode → dynamische Farbe heil); nur Flach-Farb-Bauten (`microTexture: !vertexColors`). **OFFEN: Browser** „Strukturen tragen Tiefe wie das Terrain".
- **J3 — Wasser-Glitzer-Versatz ⏳ Browser-Check:** das Blinn-Phong-Glitzern nutzt denselben `sunDir` wie Sonne+Skybox → physikalisch die Spiegelung (naturgemäß versetzt). Browser-Messung: läuft es mit der Sonne mit (gleiche senkrechte Ebene)? ja=korrekt, seitlicher Drift=Bug am Wasser-Mesh-Normal/Eye. **NICHT blind gebaut.**
- **J4 — Trapeze-Cel-Härte ⏳ Browser-Dial:** nach der V17.100-Normalen-Glättung ist der Rest die Cel-Stufen-Härte → Cel-Levels-Slider. **Pixel-blind, Browser-iteriert.**

**Risiko.** J1/J2 render-only + pixel-blind + look-ändernd (Terrain pre→post) → headless beweist die VEREINHEITLICHUNG (try/catch + `window.__aerialOutputError`-Marker V17.12 + KONSUM-Invarianten), das FEEL ist der Browser-Sign-off (V10.0-g.r). Dials: `AnazhRealm.AERIAL` + `hazeBase`/`hazeTop` (atmoUniforms), falls die Höhen-Melt bei den 244-m-Bergen zu stark/schwach ist.

---

## Reihenfolge & Abhängigkeiten

```
✅ A → ✅ B → ✅ C1/C2 → ✅ D(teil) → ✅ I → ✅ F → ✅ G(Kern) → ✅ H(Aquifer)
                                                          │
                                            JETZT: J (Render-Harmonie) ◄── der aktive Faden
                                                   + offen: E (LOD-Pyramide), G3 (Eingänge), H3 (ferne Wasser)
```

**Erledigt (V17.92–.101):** A, B, C, D(teil), F, G-Kern, H-Aquifer, I, **J1+J2 (Render-Harmonie-Kern, V17.101)**.
**Wartet auf Browser-Sign-off:** **J** (die vereinte Atmosphäre — fühlt sie sich harmonisch an? + J3 Wasser-Glitzer + J4 Cel-Härte, beide pixel-blinde Dials).
**Offen daneben:** E (weite LOD-Pyramide, von F entriegelt) · G3 (Oberflächen-Eingänge/Canyons, braucht H) · H3 (ferne-Chunk-Wasser >1024 m) · Kreatur-FPS-Dirigent (gemessen: `getTerrainHeightAt` 50 % von 49 ms @ 90 Kreaturen → Ground-Cache + Frame-Budget).

## Abdeckungs-Matrix

| Schöpfer-Befund                               | Welle            | Status |
| --------------------------------------------- | ---------------- | ------ |
| Weite Terrain / Ring max / soft / kein Pop-in | E (+ F billiger) | ⏳ E offen |
| FPS-Einbruch in neue Chunks                   | A1 + F           | ✅ (E vertieft) |
| Speichern/Nexus ruckelt (10s)                 | A1/A2            | ✅ V17.92/.97 |
| Trapeze nach 18:00                            | D + J2           | ◐ Normalen V17.100, Cel-Härte → J2 |
| Stein/Eisen schwarz                           | C1               | ✅ V17.94 |
| Strukturen ohne Mikrostruktur / pappig        | C2 → **J1/J2**   | ◐ C2 Parallel-Pfad → J Wurzel |
| Strukturen reagieren anders auf Licht/Nebel   | **J1**           | ⏳ aktiv |
| Wasser-Sonnenreflexion versetzt               | **J3**           | ⏳ Browser-Check |
| Höhlen nicht mitgewachsen / kleine Schläuche  | F + G-Kern       | ✅ V17.96/.98 |
| Keine Eingänge/Canyons                        | G3               | ⏳ offen (nach H) |
| Wasser an Höhlenwänden/unter Boden            | B + H-Aquifer    | ✅ V17.95/.99 |
| Schwimmmechanik falsch                        | B/H1             | ✅ V17.95 |
| Berg-Höhenlayerband (#11)                     | F                | ✅ V17.96 |
| Kreatur-FPS @ 80-90                           | Dirigent         | ⏳ gemessen, offen |

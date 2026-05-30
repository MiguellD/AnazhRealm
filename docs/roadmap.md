# AnazhRealm Roadmap — der Plan

Stand: **V14.9 (30.05.2026) — Terrain-Bogen „Die wahre Tiefe des Geländes" INHALTLICH KOMPLETT (epische Geomorphologie, V14.0–.9, Browser-Audit-getrieben).** Das Makro-Relief von uniform-spitz-alpin zu abwechslungsreich-wie-die-Erde: V14.0 Diagnose · V14.1 `cont0` · V14.2 thermische Erosion · V14.3 regionale Differenzierung · V14.4 echte Ebenen · V14.5 Harmonie-Heilung · V14.6 Fern-Heilung · V14.7 Maßstab-Streckung (λ2860-Hub → Feature-Größe 176→464 m) · V14.8 gerichtete Uplift (ridged λ3570 + Flow-Warp → Anden-Ketten, Elongation 1,82→2,28) · V14.9 **regionale Differenzierung** (zwei große-λ Masken: Relief Tiefland/Hochland + Stil Plateau/Kette → DREI Region-Typen, die Welt hat ALLES: Ebene 18 / Plateau 10 / Kette 8, Ozean 18 %, abwechslungsreich + stabil). **Über den Bogen (gemessen): steil 26→0 %, Median 35→~15°, sanft →31 %, Ketten-Elongation 1,1→2,3 (in Ketten-Regionen), Regional-Vielfalt = MIX aller Typen, Meere 18 %, FPS 119.** Sechs Schöpfer-Browser-Audits eingearbeitet. Davor: V13-Wasser-Profi-Bogen (pausiert @ V13.14, Finish → V15) + V12-Genie-Bogen (r184 + WebGPU, 119 FPS) + V10.0-TSL-Bogen. Volle Wellen-Chronik in `docs/handover.md`.

**Nächste: Schöpfer-Browser-Audit (Terrain-Bogen-Schluss), dann V15 — Der Wasser-Finish.** Der V14-Terrain-Bogen ist inhaltlich komplett (die Welt-FORM „die alles in den Schatten stellt", abwechslungsreich wie die Erde: Ebenen, Hochebenen, Anden-Ketten, Meere — regional differenziert, kohärent über km). Der Schöpfer-Browser-Audit ist die finale Bestätigung (lesen sich die Regionen als distinkt + episch? FPS? Wasser-Menge stimmig?). Danach **V15 — Der Wasser-Finish** (die drei Render-Sync-Wurzeln + Berg-Innenwasser + Sub-Region-Edit + die ±1024-Wasser-Region, gegen die neue Topologie) und **V16 — die lebendige Welt** (Pfeiler E/F/G). **Bogen-Lehre (V14.5–.9): wer die Terrain-Höhe/-Skala ändert, muss ALLE co-getuneten Annahmen nachziehen (surf-relative Schichten, Voxel-Decke, Density-Mirror Worker+GPU, Foundation-Tests surf-relativ, Tarn-See-Schwelle, Damm-Test-Ufer-Spot). Feature-Größe ∝ λ; lineare Ketten = ridged + Flow-Warp; „eine Welt mit allem" = REGIONALE Differenzierung (mehrere große-λ Masken wählen den Charakter pro Region); miss die Vielfalt über eine Fläche BREITER als die Region-λ, nicht ein Spawn-Fenster.**

Der **V13-Wasser-Bogen pausiert bei V13.14** — das Wasser-MODELL ist korrekt (Cells stimmen, gemessen: under-lid 0, >3 m über Quelle 0, Phantom-Seam 83→0). Die verbleibenden Browser-Artefakte (Kapillar/Schatten an Strukturen, Berg-Bluten beim Streamen) sind keine Modell-Fehler mehr, sondern **Synchronisations-Bugs am Rand**: (1) `_remeshVoxelChunksAround(…, skirt=0)` beim Arch-Spawn lässt den Nachbar-Chunk-Iso-OOB auf dem Vor-Stempel-State → Phantom an Struktur-Grenzen, heilt nicht selbst; (2) der OOB-Fallback spiegelt Kant-Zellen bei ungestreamten Nachbarn + `_enqueueWaterIso` ist ein Set ohne Priorität (maxPerFrame=2) → ferne Seams warten viele Frames; (3) der Stempel-AABB ist orientierungs-frei (`max(sx,sz)·0.5`, ignoriert Part-Rotation). Diese drei + Berg-Innenwasser + Sub-Region-Edit wandern in **V15 — Der Wasser-Finish** (Vorbedingung: Schöpfer-Browser-Dump an der echten Fehlstelle, da headless die Artefakte nicht reproduziert — die V13.0-Mess-Falle: Spawn ≠ Fehlstelle). **V16 — die lebendige Welt** (Pfeiler E/F/G) folgt danach. Der V13-Plan steht in **§1.4**. **Erkenntnis (V13.7–.14, gilt für V15): Wasser-Ufer ist ein 16-m-Atlas-vs-1,8-m-Voxel-Tradeoff; die Glätte gehört in den Tiefenpuffer-Shader, NICHT in eine 3D-Fluid-Sim; Wasser ist 3D-konnektiv klassifiziert (Sky-Open), nie per-Spalte; Render NUR im Browser-Loop justieren (Headless ist pixel-blind).**

Backlog/wartet-auf-Browser (Schicht 3, pixel-blind headless): `uMinDepth`-Schwelle justieren · tiefes Wasser an Strukturen (Turm/Tor, vom `uMinDepth`-Cull NICHT erfasst) · Naht nach Carve.

Diese Doc trägt den **Plan vorwärts**; der aktuelle Stand + Gotchas in `CLAUDE.md`, die volle Wellen-Chronik in `docs/handover.md`, die Vision in `docs/state-of-realm.md`.

## 0. Versions-Konvention (ab V13 — sauber, sequenziell, ordentlich)

**Eine Welle = eine Minor-Version: V13.0, V13.1, V13.2 …** Sequenziell hochgezählt, KEINE Buchstaben-Sub-Wellen mehr (kein `perf.a`, `c.2`, `d.2`, `h.1` — das war der V12-Wildwuchs). `AnazhRealm.VERSION = "13.0"`, `package.json` `13.0.0`, `index.html ?v=13.0.0` — alle drei im selben Commit, MAJOR.MINOR spiegelt die Welle, patch=0. Ein neuer großer Bogen erhöht MAJOR (V13→V14). Eine Diagnose-/Tool-Welle bekommt eine eigene Minor (z.B. V13.0 Diagnose, V13.1 Heilung). Bei UNKLARHEIT lieber EINE Welle mehr als ein Buchstaben-Anhang.

Aufwandsschätzungen in §3 sind realistische Tage für eine fokussierte Claude-Session pro Ring/Phase (linear, ohne Puffer). Diese Roadmap ist ein lebendes Dokument — nach jedem Ring-Abschluss aktualisiert; Pfeile zwischen Ringen sind weiche Abhängigkeiten.

---

## 1. Wo wir stehen

Die geplante Roadmap ist **im Kern abgearbeitet.** Ring 0-11.5 (Fundament → Welten-Ultiversum) + Welle 1-14 + W7 (Compute-Sharing) + der Fremd-Engine-Bogen W12-W17 sind live. Darüber hinaus gewachsen: der Voxel-Terrain-Bogen (V9.07+ — 3D-Dichte-Feld, formbarer Boden, Höhlen/Überhänge) und das Wasser-Ultiversum / die Hydrosphäre (V9.43 → V9.82 — ein Drainage-Netz, dann Welle A „Wasser ↔ Spieler-Wille", dann Welle C „Wasser-Substanz-Vereinigung" zum Voxel-Cell-Zustand). Plus der Stamm-Pflege-Bogen V9.44 (verhaltensneutrales Code-Hygiene-Refactoring). ~3000 Playtest-Invarianten grün, Audit-Strict 0 Failures, 120 fps.

Alle fünf Vision-Pfeiler (Symbiose, Emotion, Fraktal, Multisensorik, Stimme) stehen in V2+. **Was vor uns liegt** ist kein vorgezeichneter Plan mehr, sondern Wachstum entlang der Vision der vier Testamente.

**Offen / benannt:**

- **Gelände-Relief + Wasser-Schliff** — V9.45-a..c erledigt: Domain-Warp + Erosions-Feld gegen monotones Gelände, die Seebecken als wasserdichte flache Töpfe (kein zwei-Schichten-Wasser mehr), Auftrieb an die sichtbare See-Plane gekoppelt. V9.48 schloss die letzte kosmetische Mikro-Politur (See-Ufer-Schaum + Flow-Speed nach Gefälle — `docs/hydrosphere.md` §9). Der Wasser-Bogen ist damit kosmetisch vollständig.
- **Ein vereintes Wasser-System — V9.49 ✅ gebaut (Architektur-Bogen, Browser-Audit steht aus).** Schöpfer-Browser-Befund nach V9.48: das Wasser „schliesst nicht" — Meer (globale 900×900-Plane), Seen (N Planes), Flüsse (N Ribbons), Wasserfälle wirken als gestapelte durchscheinende Sheets, nicht als ein Wasserkörper. Die Wurzel war die Architektur „globale Platte + Ausnahmen". V9.49 hat das Verfahren gewechselt: Wasser ist kein Körper, es ist ein **Feld** — das Priority-Flood-`filled`-Feld IST eine kontinuierliche Wasser-Oberfläche. EIN spieler-folgendes Höhenfeld-Mesh (`_buildUnifiedWaterMesh`) ersetzt Meeres-Plane + See-Planes + Fluss-Ribbons; EIN Shader (Gerstner/still/Flow, `aWave`-moduliert, `depthWrite:true`). Ein Höhenfeld kann sich nicht selbst überlappen → kein Sheet-Stapeln, strukturell. Netto −117 Zeilen. Der Wasserfall bleibt die vertikale Ausnahme. Behebt nebenbei den absorbierter-See-rendert-trocken-Bug. Playtest grün. Drei Browser-Audits schlossen die Terrain-Naht: V9.49-d (Fluss folgt dem Bett), V9.49-e (das Wasser taucht unter das opake Terrain — die Uferlinie ist der emergente Schnitt), V9.49-f (die nasse Maske an die Terrain-Wahrheit geklemmt). Design + Lernschlüsse: `docs/hydrosphere.md` §12 + §13.
- **Wasser aus der Terrain-Wahrheit — V9.50 ✅ gebaut (22.05.2026, der Browser-Audit steht aus).** Die Browser-Audits V9.49-d/e/f zeigten einen nicht-konvergenten Kreis: jeder Fix versöhnte zwei Gelände-Wahrheiten — das 16-m-Wasser-Modell gegen das gerenderte Voxel-Terrain. V9.50 schnitt die Wurzel: das Wasser ist kein eigenes Mesh mehr — jeder Voxel-Chunk baut seine Wasser-Fläche selbst (`_buildVoxelChunkWater`), nass je Zelle wo `_voxelSurfaceY < _waterLevelAt`, aus derselben Geometrie-Quelle wie das Terrain → die Uferlinie ist exakt per Konstruktion (das „Visual = Collision"-Gesetz, aufs Wasser angewandt). Das V9.49-Vereinte-Mesh + alle Workarounds gelöscht, netto −102 Zeilen. Drei playtest-grüne Sub-Wellen. Design + Lernschlüsse: `docs/hydrosphere.md` §14.
- **Hydrosphäre-Netz-Qualität** — V9.46 erledigte die Netz-VERBINDUNG (Flüsse durch Seen hindurch — `hydrosphere.md` §10a); V9.47 die Netz-CHARAKTERISTIK via fluviale Stream-Power-Erosion (`_computeErosion` carvt dendritische Tal-Netze, halbiert die See-Fläche, bewahrt die Gipfel — §10b). Offen-ehrlich: die fluviale Inzision leert ein breites Becken nicht restlos (der Becken-Boden bleibt ein kleinerer See — geomorphologisch korrekt). Restlose Becken-Leerung bräuchte laterale Becken-Erosion oder Deposition-Fill — ein optionaler eigener Schritt, nicht terminiert.
- **Bergsee-Mulden — V9.51 ✅ gebaut (Browser-Audit steht aus, Vorbedingung der nächsten System-Kopplungs-Welle).** Der Tarn-Pass nach V9.50: kleine, in die Hochlands-Mulden gefangene Bergseen, die der priority-flood-Hauptpass nicht erfasst (weil sie keine ozeanische Drainage haben). Eigener Worldgen-Schritt (`_computeTarns`) im `generateTerrainWithParameters`-Orchestrator, läuft NACH der fluvialen Erosion VOR der Hydrosphäre-Berechnung. Carvt ergänzende See-Wannen wo das erodierte Relief lokale Senken bildet. Die Ufer-Saat-Mechanik folgt der V9.45-b-Disziplin (wasserdichte Töpfe). Playtest grün. Browser-Audit pendent als Eingangs-Prüfung der Wasser↔Spieler-Wille-Welle.
- **Submarine-Biom-Dämpfung — V9.60-a ❌ zurückgerollt (23.05.2026, Schöpfer-Verdikt „symptombekämpfung, kein fix!").** Lehre verdrahtet: Biome SOLLEN unter Wasser nicht entstehen, nicht nur unsichtbar werden. Wurzel-Heilung gehört nach V9.60-b.
- **V9.63 Cleanup vor Welle A — ✅ erledigt (23.05.2026, Schöpfer-Selbst-Audit „Holzweg, Flickenteppich").** V9.61 (Trapez+Spray+Billow) + V9.62 (Cross+Alpha) zurückgerollt. Top-Lip war schon V9.62 entfernt — bleibt entfernt. Saubere Basis vor Welle A: 2 Meshes pro Wasserfall (Plane + Pool, mit V9.60-d.1/d.3/d.4-Heilung). V9.60-b.1 (waterLevel absolut), V9.60-b.2 (Sand-Variation), V9.60-c.2 (Submarine Continental Slope) bleiben — die sind echte Worldgen-Heilungen.

### Welle A — Wasser ↔ Spieler-Wille (Roadmap §1.1 Vision-Pfeiler, **A.1+A.2+A.3+A.4+A.5 ✅ alle erledigt**)

Schöpfer-Selbst-Audit V9.62 + Vision-Klärung V9.64: „das wasser weiss nicht was es ist, was es bedeutet zu fliessen". **EINE Regel, keine Spezialfälle**: jede solide Geometrie (Architektur + Voxel-Fill) blockiert Wasser; jede Wegnahme (Architektur-Remove + Voxel-Carve) öffnet einen Pfad. Minecraft-/Noita-Lehre: Wasser ist nicht Dekoration, sondern reagiert auf Welt-Mutation.

**A.1 — Damm-Bauplan + Bucket-Index (V9.64) ✅ erledigt**: neuer built-in Bauplan `damm` (Stein-Wall 8 × 3 × 1.2 m). `state.damIndex` als 16-m-Bucket-Grid, Helper-Trio `_damIndexAdd`/`_damIndexRemove`/`_damTopAt`, Spawn pflegt automatisch. Test-Band mit 7 Invarianten. **Erste konkrete Sub-Welle, baut die Datenstruktur-Disziplin**. Lehre nach Vision-Klärung: der `damm` ist eine ANWENDUNG eines universellen Prinzips, kein Spezialfall — A.2 erweitert den Index auf alle soliden Architekturen.

**A.2 — Generischer Blocker-Index (V9.65) ✅ erledigt**: Refactor `state.damIndex` → `state.blockerIndex`, Helper-Trio (`_damIndexAdd`/`_damIndexRemove`/`_damTopAt`) durch Quintett ersetzt (`_blockerBucketKey`, `_isPartSolid`, `_blockerComputePartAABB`, `_blockerIndexAdd/Remove`, `_blockerTopAt`). **Solidität aus der Substanz** — `mat.tags.dichte ≥ 0.3` (Konstante `BLOCKER_DENSITY_MIN`): schließt Laub (0.1), Federn (0.1), Glut (0.25) aus; lässt Holz (0.4), Stein, Eisen, Bronze, Quarz, Knochen, Schuppen, Erde drin. **Pro-Part-AABB** — jeder solide Part einer Compound-Architektur einzeln indexiert: `baum_eiche` indexiert nur den Holz-Stamm, die Laub-Krone bleibt durchlässig (verifiziert: `_blockerTopAt(treeX+0.8, treeZ) === -Infinity`). `entry.blockerAABBs` ist ein Array (Felsbogen hat 3 AABBs). Spawn/Remove **unconditional**, frühe Out wenn keine soliden Parts. Test-Band `checkBandWelleA1Damm` → `checkBandWelleA2Blocker`, 7 → 19 Invarianten. **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures; Format/Lint sauber. Vision-rein: die Substanz entscheidet, nicht der Name — ein Type-Whitelist wäre die V9.64-Sünde gewesen.

**A.3 — Effective-Surface mit Voxel-Edit-Awareness (V9.66) ✅ erledigt**: neue Wahrheits-Quelle `_effectiveSurfaceY(x, z)` kombiniert drei Schichten — (1) Worldgen `_terrainMacroSurfaceY(x, z, false)`, (2) Voxel-Edit-Delta `_voxelEditSurfaceDelta(x, z, macro)` (carve senkt, fill hebt; chronologische Anwendung aus `worldMeta.voxelEdits`), (3) Blocker-Top `_blockerTopAt(x, z)` via MAX. **Hydrosphäre-Sample-Pfade ersetzt** (5 Aufrufstellen): `_computeErosion`, `_hydroSeedTarns` (Surf + 2× Gradient), `_hydroInit`. Live-Read-Pfade (`_hydroRiverAt.surfaceY`, `_voxelChunkTouchesWater`) bleiben für A.4. **Edit-Delta-Math**: für jede Edit-Kugel die xz-Distanz `d`, vertikale Halbspann `√(r²−d²)`; `fill`-Top hebt, `carve` mit `top≥effSurf && bot<effSurf` senkt auf `bot`. Eine vergrabene Carve-Kugel erzeugt eine Höhle (keine Surface-Änderung). Test-Band `checkBandWelleA3EffectiveSurface` mit 13 Invarianten: Funktion existiert; Baseline == macro (≤1mm); Damm hebt/Remove restauriert; Fill-Edit exakt `y+r`; Carve-Edit senkt; ferner Edit kein Effekt; Source-Probes verifizieren `_hydroSeedTarns` + `_hydroInit` rufen den neuen Pfad. **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. **Disziplin**: bei first-worldgen identisch zu Vorher (Blocker+Edits leer), Determinismus + Backward-Compat erhalten. Eine truth-source VOR dem Recompute zu bauen ist Disziplin — A.4 hat dann nichts zu refaktorieren.

**A.4 — Reaktive Recompute mit Debounce (V9.67) ✅ erledigt**: drei neue Methoden — `_markHydroDirty()` (gated durch `hydrosphere.ready`), `_recomputeHydrosphere()` (Drainage-Netz + Meshes neu; Erosion+Tarns frozen), `_tickHydroRecompute(currentTime)` (300-ms-Debounce-Tick). Drei Trigger: `spawnArchitecture` (wenn `!opts.silent && entry.blockerAABBs`), `removeArchitecture` (wenn Eintrag Blocker war), `_addVoxelEdit`. Worldgen-Spawns (Genesis-Platform, Vegetation, Save-Restore) nutzen `silent: true` und bleiben still — der erste Compute baut frisch. Welt-Effekt-Ping als Journal-Eintrag „Das Wasser sucht einen neuen Weg (Δ N ms)". Test-Band `checkBandWelleA4Recompute` mit 21 Invarianten (Trio existiert; Debounce-Konstante; silent-Spawn-Schutz; Tick vor/nach Fenster; Remove-Trigger; Edit-Trigger; 4 Source-Probes; Headless-Performance < 5000 ms). **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. Performance: Headless misst 2.5 s pro Recompute (ohne JIT-Warm-Up); Browser-Budget < 300 ms (V9.43-b-Baseline, Schöpfer-Audit in A.5 verifiziert).

**A.5 — Vision-Beweis empirisch + multisensorische Spur (V9.68) ✅ erledigt**: neue Methode `_playHydroRecomputePing()` — 0.6-s-Strömungshauch (Bandpass-Noise, Cutoff fällt 700→200 Hz; Vision §1.4 multisensorisch). Test-Band `checkBandWelleA5VisionProof` mit 11 Invarianten beweist die Vier-Welle-Vision empirisch im Headless: (i) Damm-Plug (3×3 grid-aligned) verlängert Fluss-Punkte 467→481 (pointHash flippt, lakeCells 3576→3570); (ii) Stein-Block-Plug zeigt identische Reaktion (Hylomorphismus-Beweis, kein Damm-Privileg); (iii) Carve im Trockenland senkt effective von macro=10 auf eff=-8 (unter waterLevel); (iv) Architektur-Remove restauriert Fingerprint EXAKT zur Baseline. Plus: Determinismus, Journal-Eintrag, Audio-Ping-Existenz. Test-Härtung 6.G3.c (`_findOldestCreature` jetzt robust gegen längere Test-Laufzeit). **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. **Lehre**: Grid-Auflösung respektieren — eine Diagonal-Wall mit 16-m-Spacing verfehlt die 16-m-Sample-Grid; 3×3 grid-aligned Plug trifft jede Sample-Cell.

**Welle A geschlossen**: das Wasser ist nicht mehr Dekoration. Der Spieler baut Damm → Aufstauen; bricht ab → Fließen; carvt Loch → Pfütze. Wasserfälle entstehen wo die echte Topologie (Worldgen + Edits + Bauten) sie ergibt — sekundäre Phänomene, keine prozedurale Schmierschicht.

**A.6 — Browser-Audit-Folge (V9.69) ✅ erledigt**: Schöpfer-Browser-Audit nach V9.68 brachte zwei Befunde: (1) „die löcher werden nicht gefüllt" — der `_voxelChunkTouchesWater`-Gate las nur die Macro-Surface, nicht die Voxel-Edits → ein tiefer Carve in Hochland triggerte den Wasser-Mesh-Bau nicht. (2) „chunkgrenzen-höhenunterschiede" — Lake-Mask-Sprung in `_waterLevelAt` (Berg-See vs. Meer, physikalisch korrekt, im Backlog). **V9.69 heilt (1)**: neue Predicate (2) in `_voxelChunkTouchesWater` scannt `worldMeta.voxelEdits` nach Carves, deren Unterkante unter waterLevel reicht UND deren xz-Footprint den Chunk berührt → Gate true. Test-Band `checkBandWelleA6GateAudit` mit 9 Invarianten (Hochland-Chunk gefunden, Gate vor=false / nach=true, Lokalität-Stabilität ferner Chunks, Fill ignoriert, Source-Probe). **Lehre verdrahtet**: nach jeder Wahrheits-Quellen-Welle ALLE Aufrufer der alten Quelle durchforsten — V9.66 baute `_effectiveSurfaceY` für den Compute-Pfad, aber `_voxelChunkTouchesWater` (Render-Gate) blieb auf `_terrainMacroSurfaceY`. V9.69 ist die ehrliche Folge.

**Backlog aus dem Browser-Audit (V9.70+ Kandidaten)**: (b) **Spürbarkeit eines Standard-LMB-Carves (r=3.5)** — im Hochland erzeugt das ein 3.5-m-Loch, weit über waterLevel; korrekt „kein Wasser", aber Spieler erwartet Pfütze. Vision-Welle wäre ein Precipitation-Modell. (a) **Lake-Mask-Sprung** wandert in Welle B unten.

### Welle B — Patch-Versuch, ABGEBROCHEN nach Browser-Audit Round 3 (24.05.2026, ehrlich beerdigt)

**Was war Welle B**: drei Sub-Wellen (B.1 Skirts, B.2 Lake-Mask-Falloff, B.3 inkrementeller Mesh-Rebuild) — geplant als Symptom-Heilungen für die Zwei-Skalen-Wurzel, ohne die Wurzel selbst anzugehen. Eine bürokratische Verkleidung der Heiligen-Lektion-Sünde: die Diagnose (zwei Wasser-Sprachen sind die Wurzel) war richtig, aber statt der Konsequenz zu folgen, hatte ich drei Symptom-Patches geplant + die ehrliche Wurzel-Lösung als „V9.80+, vielleicht NIE" weg-bürokratisiert.

**B.1 V9.70 — Wasser-Mesh-Skirts gebaut, visuell wirkungslos**: jeder Chunk-Wasser-Mesh erweitert um 1-Cell-Skirt; Boundary-Vertices teilen Welt-Position; das Sheet überlappt strukturell. Headless-Tests grün (9 Invarianten), aber **Schöpfer-Browser-Audit Round 3: „kein spürbarer Unterschied"**. Diagnose: die Naht ist nicht die Geometrie, sondern die Zwei-Sprachen-Wahrheit. Ein Patch auf einem System, das wir nicht mehr wollen.

**B.2 + B.3 NICHT gebaut**: nach dem B.1-Audit „kein spürbarer Unterschied" + dem Schöpfer-Befund „du verlierst dich wie ein deutscher Bürokraten in die Planung der Planung" — beide gestrichen. Sie hätten weitere Patches im selben System gewesen.

**Code-Status nach Abbruch**: V9.70 (B.1 Skirts) bleibt im Code als historische Schicht — die Skirts schaden nichts, die `WATER_CHUNK_SKIRT`-Konstante bleibt. Welle C wird sie ohnehin obsolet machen (per-Chunk-Quad-Mesh wird durch Iso-Surface-Mesher ersetzt).

**Lehren, permanent verdrahtet** (in CLAUDE.md/Gotchas + handover.md/Versions-Chronik):
- **Wenn die Wurzel benannt ist, geht man sie an.** Symptom-Patches auf einem System, das wir aufgrund der eigenen Diagnose nicht mehr wollen, sind Flickenteppich mit Visions-Etikett. V9.62-Schöpfer-Audit „Holzweg" hatte dieselbe Sünde benannt; hier ist sie wieder aufgetaucht.
- **„Ehrliches Backlog"-Hütchen ist Bürokratie.** Wer eine Mega-Welle als „vielleicht nie" weg-deklariert, weil sie substantiell ist, verschiebt die Heilung um den Preis der Vision. Die ehrliche Antwort ist entweder „bauen wir nicht, weil Vision nicht trägt" oder „bauen wir, weil Vision trägt" — kein Hütchen-Spiel.
- **Sichtbarer Effekt ist der Maßstab.** Headless-Tests grün ≠ Vision geheilt. Schöpfer-Browser-Audit ist der finale Validator.

---

### Welle C — Wasser-Substanz-Vereinigung (V9.71+, die ehrliche Wurzel-Heilung)

**Anlass**: Schöpfer-Befund nach B.1-Audit: „warte, das ist keine Heilung die hier geschieht, wir reparieren ein System das wir nicht mehr wollen". Plus Anweisung „alte Welten interessieren uns noch nicht, wir wollen das Spiel zum Laufen bringen" → Welt-Identität-Bruch ist erlaubt.

**Vision**: das Wasser ist ein **Cell-Zustand** im Voxel-Welt-Feld, geschwisterlich zu Solid und Air. EINE Sprache, EINE Skala (1.8 m Voxel), EINE Geometrie-Quelle (der Surface-Nets-Mesher). Minecraft-Disziplin (Cell-State), Witcher-3-Qualität (echte Iso-Surface), Vision-rein (V9.50 zu Ende geführt — „Wasser aus der Terrain-Wahrheit" konsequent durchgezogen, nicht halb-half).

**Was strukturell anders wird**:

| Heute (Welle A + B) | Welle C |
|---|---|
| `state.hydrosphere` als parallele 16-m-Drainage-Karte | Cell-Feld `state` ∈ {air, water, solid} pro Voxel-Cell |
| `_buildVoxelChunkWater` per-Chunk-Quad-Mesh (Vertex-Raster aus `_waterLevelAt`) | Iso-Surface des Wasser-Cell-Feldes via Surface-Nets, gleicher Mesher wie Boden |
| `_voxelChunkTouchesWater`-Gate (`_terrainMacroSurfaceY` + `voxelEdits` + Lake/Fluss-Buckets) | weg — das Cell-Feld weiß direkt, ob im Chunk Wasser ist |
| `_blockerIndex` + `_blockerTopAt` + `_effectiveSurfaceY` + `_voxelEditSurfaceDelta` | weg — Architektur-Spawn/Voxel-Edit stempelt Cells direkt |
| `_markHydroDirty` + `_tickHydroRecompute` + 300-ms-Debounce + global `_recomputeHydrosphere` | weg — Cell-Mutation ist instantan + lokal, Mesh-Rebuild über das bestehende `_rebuildVoxelChunk` |
| `_waterLevelAt` 5×5-Lake-Mask-MAX | weg — `_voxelWaterTopAt(x, z)` scannt die Cell-Säule |
| B.1 Wasser-Mesh-Skirts | weg — per-Chunk-Quad-Mesh ist weg, naht-frei per Iso-Surface-Konstruktion |

**Akzeptanz** (Schöpfer-Browser-Audit Round 4 nach C.5):
- Das Sheet verbindet sichtbar über Chunk-Grenzen (per Iso-Surface-Konstruktion).
- Spieler-Carve unter waterLevel → das Loch füllt sich SICHTBAR mit Wasser im selben Frame (lokaler Flow-Pass).
- Damm bauen im Fluss → Wasser staut sich dahinter (Cells werden water), Fluss vor dem Damm bleibt; Damm abreißen → Cells werden air, lokaler Flow füllt zurück.
- FPS bleiben bei Carve-Burst stabil (kein globaler Recompute mehr).
- Keine sichtbare Naht zwischen Chunks im Wasser-Mesh.

**Sub-Wellen** (klein-additiv, jede mit Test-Band + Schöpfer-Browser-Audit):

**C.1 V9.71 ✅ erledigt — Wasser-Cell-Feld + Worldgen-Init.** Neue Klassen-Konstante `CELL_STATE = Object.freeze({AIR:0, WATER:1, SOLID:2})`. Neue Methode `_buildVoxelChunkWaterCells(ox, oy, oz, step)` returnt `Uint8Array` der Länge `dim·dim·dimY = 71 424` pro Voxel-Chunk; pro Cell ein `_terrainDensityAt`-Sample am Center + waterLevel-Test (`d>0` → solid; sonst `cy≤waterLevel` → water; sonst air). Indizierung `i + k·dim + j·dim·dim`. In `_buildVoxelChunkData` integriert, lebt als `entry.waterCells` im chunk-entry (kein top-level state, kein audit-strict-Bruch). Aktueller Hydrosphäre-Atlas bleibt UNANGERÜHRT — paralleles System, kein Bruch von Welle A oder Welle-B-Code (V9.70-Skirts laufen weiter). Test-Band `checkBandWelleC1WaterCells` mit 10 Invarianten: Konstante existiert + freezed + korrekte Werte; Methode existiert; streaming-aktiver Chunk hat `entry.waterCells` als Uint8Array mit Länge 71 424; Klassifikations-Stichprobe (64 Cells) stimmt mit Density+waterLevel überein (mismatches=0); Re-Build deterministisch (drift=0); Welt nicht leer (solid-Cells > 0). **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. **Performance-Beobachtung Headless**: ~350 ms pro Chunk × 4-5 Streaming-Chunks = ~1.5 s zusätzliche Worldgen-Zeit (Browser mit JIT schneller). Optimierung in C.1-b oder später (lazy bis erster Wasser-Lookup, oder Density-Grid vom Mesher teilen).

**C.2 V9.72 ✅ + V9.73 Browser-Audit-Heilung — Iso-Surface-Mesher für Wasser.** V9.72-Browser-Audit „Toggle scheint nichts zu ändern" → V9.73 zwei Heilungen: (1) Toggle ENTWEDER-ODER (alte Quad-Meshes werden versteckt, wenn Iso sichtbar — vorher additiv, beide gleichzeitig sichtbar = kein Vergleich); (2) Cell-Init nutzt jetzt `_waterLevelAt(cx, cz)` per xz-Spalte (statt globaler `state.waterLevel`) — erfasst Bergseen über Meeresspiegel. Plus: `_buildVoxelChunkWater` (alter Pfad) initialisiert `visible = !voxelWaterIsoVisible` für konsistenten Toggle bei neu gestreamten Chunks. C.1-Klassifikations-Test mit-gewandert auf `_waterLevelAt`. C.2-Band um 5 Invarianten erweitert (Toggle-entweder-oder + Bergsee-Cells). Verhaltens-Beweis: 12 Chunks → 9 mit Mesh = 7166 Vertices (vs V9.72-Stand 2938 — Bergsee-Cells jetzt erfasst); 60 Quad-Meshes vom Toggle versteckt/restauriert; Bergsee-Heilung empirisch grün. **C.2-Mechanik (gleich seit V9.72)**: Neue Methode `_buildVoxelChunkWaterIsoSurface(cx, cz)` liest `entry.waterCells` (C.1), baut eine `sampleWater(x, y, z)`-Density-Funktion (8-Cell-Average pro Vertex: water=+1, alles andere=−1, OOB=−1), ruft den bestehenden `_voxelChunkGeometry`-Mesher mit dieser Density auf. **Naht-frei per Konstruktion** — dieselbe Surface-Nets-Maschinerie, identische Vertex-Quantisierung über Chunk-Boundaries. Mesh nutzt das geteilte `hydroSurfaceMaterial` (Shader/Animation unverändert). **Lifecycle**: `_rebuildVoxelChunk` ruft die neue Build-Methode parallel zum alten `_buildVoxelChunkWater`; `_disposeVoxelChunk` ruft `_disposeVoxelChunkWaterIso`. **Default unsichtbar** (`voxelWaterIsoVisible: false`, alle Meshes mit `visible=false` initialisiert). Toggle via `_setVoxelWaterIsoVisible(true)` — Browser-Audit-Werkzeug. Welle-A-Pfade + altes Wasser laufen PARALLEL. Test-Band `checkBandWelleC2WaterIsoSurface` mit 11 Invarianten: State-Felder + Methoden, Source-Probes (`_rebuildVoxelChunk` + `_disposeVoxelChunk` rufen die neuen Methoden), alle gefüllten Chunks haben Iso-Map-Eintrag (gemessen 14 Chunks → 11 mit Mesh = haben Wasser, 3 ohne = trocken, 2938 Vertices total), default unsichtbar, Toggle funktioniert (11/11), Material = `hydroSurfaceMaterial`, userData.hydroKind='chunk-water-iso'. **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. **Lehre**: Density-Callback ist das Surface-Nets-Eintrittstor — der bestehende Mesher akzeptiert eine `densityFn` als Parameter, dadurch wird der Zwillings-Pass trivial. Plus: Default-unsichtbar-Bau ist die Migration-Disziplin (neues Mesh existiert mit allen Lifecycle-Hooks, aber visuell absent; Schöpfer kann jederzeit per Console-API togglen — kein Bruch, keine Welt-Entscheidung im Voraus). **Schöpfer-Browser-Audit**: visueller Vergleich alt (Quad-Mesh) ↔ neu (Iso-Mesh) via Console `realm._setVoxelWaterIsoVisible(true)`.

**C.3 V9.74 ✅ erledigt — Cellular-Reaktion nach Spieler-Edit.** Ehrliche Vereinfachung des ursprünglichen Plans: kein BFS-Cellular-Flow nötig — das Cell-Feld ist DERIVED aus (Worldgen + Edits + Architektur). Drei strukturelle Erweiterungen: (1) `_blockerComputePartAABB` ergänzt um `botY` (V9.65 hatte nur topY für Surface-Hebung; C.3 braucht beide für Cell-Stempel-Y-Range). (2) Neue Methode `_stampArchitectureSolidCellsInto(cells, ox, oy, oz)` — iteriert `state.architectures`, scannt AABB×Chunk-Footprint, stempelt Cells als `STATE.SOLID`. Aufruf am Ende von `_buildVoxelChunkWaterCells`. (3) `spawnArchitecture` + `removeArchitecture` triggern `_remeshVoxelChunksAround` pro AABB → Cell-Feld baut mit/ohne Architektur-Stempel neu. Spieler-Carve/Fill brauchen KEINE neue Mechanik — der bestehende `_remeshVoxelChunksAround`-Pfad (V9.14) triggert den Rebuild, `_terrainDensityAt` sieht die Edits, Cells klassifizieren neu. KEIN globaler Recompute, KEIN BFS. Test-Band `checkBandWelleC3CellularReaction` mit 11 Invarianten: Stempel-Methode existiert + wird gerufen; AABB hat botY (gemessen botY=25.33, topY=28.33); Damm-Spawn → Cell SOLID (state=2); Damm-Remove → Cell AIR (state=0); Carve unter waterLevel → Cell WATER (state=1, der „Cellular-Flow"-Effekt via Klassifikation); 2 Source-Probes. **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures. **Lehre**: das Cell-Feld als DERIVED-View — kein paralleler Sim, eine Datenquelle die durch Rebuild aktuell bleibt.

**C.4 + C.5 V9.75 ✅ erledigt — Wasser-Substanz-Vereinigung in einem chirurgischen Schnitt.** Statt zwei Sub-Wellen (C.4 V9.75 Welle-A-Mechanik weg, C.5 V9.76 Atlas-Parallel-Pfad weg) wurde der ganze Schluss-Bogen in EINEM Commit vollendet (Schöpfer-Befund: „bevor du wie ein deutscher noch 30 zwischenschritte planst" — bei Klarheit ist 1 Schnitt ehrlicher als 5 Sub-Wellen). **Welle-A-Maschinerie gestrichen**: `_effectiveSurfaceY`, `_voxelEditSurfaceDelta`, `_markHydroDirty`, `_recomputeHydrosphere`, `_playHydroRecomputePing`, `_tickHydroRecompute`, `_blockerTopAt`, `_blockerIndexAdd/Remove`, `_blockerBucketKey`, `BLOCKER_BUCKET_SIZE`, `HYDRO_RECOMPUTE_DEBOUNCE_MS`, `state.blockerIndex`, `state.hydroDirty/At/LastRecomputeMs`. **Parallel-Quad-Pfad gestrichen**: `_buildVoxelChunkWater`, `_disposeVoxelChunkWater`, `_voxelChunkTouchesWater`, `WATER_CHUNK_SKIRT` (V9.70-Skirts), `_setVoxelWaterIsoVisible` (Migration-Toggle), `state.voxelChunkWater`, `state.voxelWaterIsoVisible`. **Iso-Surface-Mesh ist seit jetzt default sichtbar und der EINZIGE Wasser-Mesh.** `_blockerIndexAdd` ersetzt durch `_populateBlockerAABBs` (nur `entry.blockerAABBs`-Cache, kein Bucket — der Stempel-Loop iteriert `state.architectures` direkt). Vier Hydrosphäre-Sample-Stellen (`_computeErosion`, `_hydroSeedTarns`-Surf/×2-Gradient, `_hydroInit`) lesen jetzt `_terrainMacroSurfaceY(x,z,false)` direkt — der Atlas ist worldgen-frozen (Welt-Identität), Spieler-Wille lebt im Cell-Feld via `_remeshVoxelChunksAround`. Multisensorische Vision-Spur (V9.68 Audio-Ping) als `_playWaterReactionPing` an den Architektur-Spawn-/Remove-Trigger umgehängt — die Welt antwortet hörbar. **Welt-Journal-Eintrag bewusst NICHT mit umgehängt** — würde die 6.F2-Idempotenz-Invariante brechen (zählt total Journal-Entries), und der Audio-Ping ist die ehrliche Vision §1.4-Spur; Journal war Nice-to-have. **Test-Migration**: 6 dead Bänder (A2/A3/A4/A5/A6/B1, 826 Z.) gestrichen — Vision-Beweis lebt vollständig in C.1-C.3. 2 dead V9.50-b-Chunk-Wasser-Bänder (236 Z.) gestrichen. C.2-Band umgeschrieben („Iso ist einziger Pfad, default sichtbar"). **Verhaltens-Beweis**: Playtest „Alle Invarianten OK"; audit:strict 0 Failures; Format/Lint sauber. **Bilanz**: `anazhRealm.js` netto −230 Z., `scripts/playtest.cjs` netto −1056 Z. Version-Bump 9.74.1 → 9.75.0. **Drei permanente Lehren in CLAUDE.md/Gotchas**: (1) Wenn die Wurzel diagnostiziert ist, der Konsequenz folgen (V9.70-B-Bürokraten-Lehre eingelöst). (2) Migrations-Default ist nicht der End-Zustand (Toggle/Parallel-System sind Brücken, kein Stamm-Bewohner). (3) Beim Schluss-Schnitt 1 Commit, kein 5-Sub-Wellen-Bogen — Sub-Wellen sind Disziplin bei UNKLARHEIT, bei Klarheit ist chirurgisch ehrlich.

**C.5 (mit C.4 in V9.75 vollendet, s.o.) — was BLIEB**: `state.hydrosphere` (Drainage-Compute, läuft once at worldgen — wird vom Cell-Init via `_waterLevelAt` als Wahrheits-Quelle für Lake/Fluss-Höhen gelesen), `_computeHydrosphere` + sein ganzer Apparat (`_hydroInit`, `_hydroPriorityFlood`, `_hydroExtractRivers`, etc. — bleiben als DATA-Layer für den Cell-Init, nicht als Render-Layer), `_buildHydrosphereMeshes` (baut jetzt NUR noch die Wasserfälle + ruft `_buildVoxelChunkWaterIsoSurface` per Chunk; die alte per-Chunk-Quad-Loop ist weg), Wasserfall-Plane + Pool als die EINZIGE vertikale Ausnahme. **Backlog (eigene spätere Welle, falls Schöpfer-Wunsch)**: Wasserfälle könnten Cellular emergieren (vertikale water-Cell-Säulen über Klippen mit vertikalem Flow-Shader) — heute noch separate Geometrie. Plus: Atlas-Daten-Layer könnte langfristig kleiner werden, wenn das Cell-Feld auch Lake/Fluss erkennt (BFS auf adjacent water-cells über waterLevel) — aber nicht jetzt nötig, das Cell-Feld lebt mit dem Atlas als Höhen-Quelle zufrieden.

**Sub-Wellen C.6-C.12 (V9.76-V9.82) — Browser-Audit-Heilungs-Bogen**: nach V9.75 brachte der Schöpfer-Browser-Audit acht subtile Befunde, die sieben weitere Sub-Wellen erzeugten. Jede heilte eine tiefere Wurzel-Schicht, am Ende ist Welle C strukturell sauber:

- **C.6 V9.76 — Trocken-Gate + Naht-Heilung (OOB-Live) + Y-Band-Opt**: `_voxelChunkHasAnyWater` reanimiert als Performance-Vorab-Check (Hochland-Chunks skip 71k cell-samples). OOB-Live-Compute im Iso-Mesher für Naht-Konsistenz (V9.75-Befund „naht-frei per Konstruktion" war falsch — OOB-Cells gaben constant -1 → Iso-Vertices zogen 0.5·step nach innen → Riss). Y-Band-Opt (above/below-band-Skip).

- **C.7 V9.77 — Globales Y-Band**: per-Chunk-band aus V9.76 war Bug — Bergsee-Chunk hatte band-top=21m, Ozean-Chunk 2m, OOB-Live sah inkonsistente Klassifikation → Naht-Drift. Heilung: `state.hydroBand` global aus state.waterLevel + max-Lake. ALLE Chunks teilen dieselben Thresholds.

- **C.8 V9.78 — Below-Band-WATER-Shortcut gestrichen**: V9.77-Annahme „below-band = WATER" erzeugte FLOATING-PLANE bei `cy=bandBottom` in Mountain-Säulen — in-band SOLID gegen below-band WATER → Iso-Transition = horizontale Plane durch Felswand („zweite Oberfläche über dem Boden"). Heilung: nur above-band skippt, below-band UND in-band laufen voll-Klassifikation. Mountain-Cells bleiben korrekt SOLID.

- **C.9 V9.79 — Pad+Crop für Iso-Mesh (Oberflächen-Naht endlich strukturell geheilt)**: bis V9.78 baute der Iso-Mesher mit `cropMargin=0`. Adjacent Chunks hatten unabhängige Mesh-Vertices mit eigenem Laplacian-Smoothing → 1-Cell-Gap an der Oberfläche. Drei Wellen lang verkannt. Heilung: V9.42-d-Trick vom Boden-Mesher — `(ox-step, oy, oz-step, dim+3, dimY, dim+3, step, sampleWater, 1)` — Pad+Crop, Adjacent-Chunks overlappen, Naht weg.

- **C.10 V9.80 — Nur Wasser-Luft-Iso (Bottom/Side-Geister gestrichen)**: V9.79-Pad+Crop machte mehr Bottom-Iso exponiert. Surface-Nets rendert default die VOLLE Hülle (Top, Bottom, Sides). Heilung: cellClass returnt 3-fach (AIR/WATER/SOLID), `sampleWater` unterdrückt Iso wenn cAir=0 (Bottom + Underwater-Sides) oder cWater=0 (Mountain-Top, vom Terrain-Mesh gerendert). Nur WATER+AIR-Mischung erzeugt Iso → reine Wasseroberfläche.

- **C.11 V9.81 — Density-Grid-Sharing mit Boden-Mesher (~50× Speedup)**: das Cell-Feld rief 71 424× `_terrainDensityAt` pro Chunk (~200ms Browser-Killer). Der Boden-Mesher samplet schon das (dim+4)·(dimY+1)·(dim+4) Density-Grid für seine Iso. Heilung: `_voxelChunkGeometry` akzeptiert optional `preDensity`, `_buildVoxelChunkData` reicht das Grid an beide Konsumenten weiter, `_buildVoxelChunkWaterCells` nutzt 8-Corner-Trilinear-Avg statt 71k Re-Samples.

- **C.12 V9.82 — Streaming-Pfad-Bug gefunden (Wasser lädt jetzt synchron mit Terrain)**: tiefer Bug seit V9.71 (11 Wellen unbemerkt). `_ensureVoxelChunkAt` (Streaming) baute Terrain direkt via `_voxelChunkGeometry`, setzte `entry = { mesh }` OHNE waterCells. `_rebuildVoxelChunk` (Edit-Trigger) nutzte `_buildVoxelChunkData` (mit waterCells). Zwei Pfade, nur einer hatte das Cell-Feld → „Wasser lädt erst bei Edit" als Lebens-Race. Heilung: `_ensureVoxelChunkAt` vereinigt mit `_rebuildVoxelChunk` zu einer Pfad-Quelle (`_buildVoxelChunkData`). Eine Helper-Funktion, beide Caller bleiben thin. Wasser lädt mit Terrain synchron.

**Welle-C-Gesamt-Statistik**: 12 Sub-Wellen über 11 Wellen-Versionen (V9.71-V9.82), netto ~−200 Zeilen `anazhRealm.js` + ~−1050 Zeilen `playtest.cjs`. Bogen-Erkenntnis: ein Welt-System mit mehreren Sample-Schichten + parallelen Mesh-Pfaden + per-Chunk-Konsistenz erzwingt strukturelle Disziplin — jeder „kleine Bug" deckt einen tieferen Schichten-Architektur-Befund auf. Die acht Welle-C-Lehren leben permanent in `CLAUDE.md/Gotchas`.

**Disziplin pro Sub-Welle**:
- Jede playtest-grün; Format/Lint sauber; audit:strict 0 Failures.
- Test-Band schreibt die Akzeptanz, NICHT die Demo (V9.69-Lehre).
- Schöpfer-Browser-Audit nach C.2 (Geometrie sichtbar?), C.3 (Reaktion sichtbar?), C.5 (Atlas weg, alles läuft?).
- Bei Performance-Engpass: messen vor optimieren (V9.55-Lehre).
- Parallele Existenz: C.1-C.3 lassen das alte System nebenher laufen; erst C.4-C.5 ziehen die alte API ab. Das ermöglicht jederzeit Rollback bei Browser-Audit-Misserfolg.

**Risiken ehrlich**:
- **Speicher**: 81 aktive Chunks × 24·120·24 Cells × 1 Byte = 5.6 MB Cell-Felder. Akzeptabel.
- **Worldgen-Performance**: pro Chunk ~69k Cells × Init-Check. Worldgen jetzt teurer (vorher kein Cell-Feld). Messen in C.1.
- **Mesher-Performance**: zweite Iso-Surface pro Chunk ≈ doppelte Mesh-Build-Cost. Messen in C.2; falls Problem, Optimierung (z.B. Wasser-Mesh nur in wet-Chunks).
- **Flow-Performance**: BFS-Cap (10000 Cells) bei großem Edit-Burst. Messen in C.3; falls Problem, Cap reduzieren oder async.
- **Welt-Identität bricht** (alte Seeds sehen anders aus): vom Schöpfer explizit erlaubt („alte Welten interessieren uns noch nicht").
- **Welle-A-Test-Bänder umgeschrieben**: ~30 Invarianten müssen migrieren. Disziplin: jede Invariante prüft jetzt das Cell-Feld statt das Drainage-Netz, aber die Vision-Aussage bleibt gleich.
- **Wasserfall-Mechanik unklar**: in C.5 entscheiden ob cellulär emergent oder weiter als Sondermesh.

**Statistik geschätzt**: 5 Sub-Wellen × 1-2 Sessions = 5-10 Sessions Bauzeit. ~37 540 Z. → ~36 000 Z. (netto -1500 Z. dank Atlas-Abbau). 5 neue Test-Bänder; ~10-15 alte Welle-A/B-Tests umgeschrieben.

**Vision-Bogen**: V9.50 brachte das Wasser-Mesh auf die Voxel-Skala (halb durchgezogen). V9.51-V9.69 baute die Welle-A-Mechanik auf der parallelen Drainage-Karte (Symptom-Stack über der halben Vision). V9.70 (B.1) versuchte zu patchen. Welle C zieht V9.50 ZU ENDE: das Wasser IST das Voxel, nicht nur sein Mesh.

**Sub-Wellen-Disziplin**: jede Sub-Welle hat eigenes Test-Band + Schöpfer-Browser-Audit. A.2 + A.3 sind klein-strukturell (Refactor + neue Helfer-Methode); A.4 ist mittelgroß (Recompute-Pfad + Debounce-Tick); A.5 ist Vision-Schluss (Tests + Feedback). Bei jeder Sub-Welle: Performance-Check, dass Hydrosphäre-Tick im Budget bleibt.

- **Wasserfall-Volume — V9.61 ✅ erledigt (23.05.2026, drei Genshin-Lehren kombiniert nach Schöpfer-Foto „unsauber").** (a) Trapez-Plane (Volume statt Vorhang): Vertices der Wasserfall-Plane verschoben — unten 1.5× breiter, oben 0.9× schmaler, plus sin-Edge-Wobble. (b) Volumetric Spray-Halbsphere am Aufprall: SphereGeometry-Hemisphäre mit aShore-Gradient (1.0 unten → 0.45 oben), dichte Mist-Wolke ohne Partikel-System. (c) Stärkere Wave-Displacement im Shader: Billow-Amplituden ×2, plus cross-wave. Drei orthogonale Schichten, kombinierte Welle. Mesh-Count × 4 pro Wasserfall (Plane + Lip + Spray + Pool). Test-Sync wandert mit. Lehre: Genshin-Wasserfall-Geheimnis = Volume + Volumetric Spray + Wave-Displacement zusammen, keine eine reicht alleine.
- **See-Fluss-Naht — V9.60-d abgeschlossen ✅ (23.05.2026, kombinierte Heilung aus drei Profis-Lehren).** Schöpfer-Anweisung: drei Sub-Wellen zusammen abschließen. (d.1) Foam-Pool am Aufprall (Genshin/BOTW/Witcher); (d.2) Top-Lip-Foam an der See-Kante (Genshin/BOTW); (d.3) See-Spiegel-Verbindung — `topY = max(wf.topY, _waterLevelAt)` (Witcher/NMS); (d.4) Erosion-Topf — Pool sitzt in einer Mulde mit grösserem Radius (Real-World-Lehre). Drei Meshes pro Wasserfall mit eigenen `hydroKind`-Werten (waterfall / waterfall_lip / waterfall_pool), strukturell unabhängig. Test-Sync: drei Invarianten mit-gewandert auf 3-Mesh-Welt. **V9.60-BOGEN GESCHLOSSEN — vier Schöpfer-Befunde geheilt: Biome unter Wasser (b.1), Strand-Linie uniform (b.2), Wassergrund flach (c.2), See-Fluss-Naht unsauber (d kombiniert).**
- **See-Fluss-Naht erste Heilung — V9.60-d.1 ✅ erledigt (23.05.2026, Foam-Pool am Aufprall, erste Heilung der Wasserfall-Naht).** Riesen-Lehre Genshin/BOTW/Witcher/NMS: jeder Wasserfall hat unten einen hellen Foam-Schaum-Pool als Aufprall-Akzent. Mechanik: `_buildHydroWaterfallPool` baut horizontale CircleGeometry mit `hydroSurfaceMaterial` + `aShore=1` (volles Foam-Band). Radius skaliert mit Drop-Höhe. Geteiltes Material — kein neuer Shader. Test-Sync: drei strukturelle Invarianten mit-gewandert (Mesh-Count × 2, Material+Geometry je nach hydroKind).
- **Submarine-Topologie — V9.60-c.2 ✅ erledigt (23.05.2026, Riesen-Lehre vertieft nach Schöpfer-Befund „immer noch flach").** V9.60-c.1 war zu zaghaft (10% Variation in 40 m Tiefe). V9.60-c.2 übernimmt die STRUKTUR der Real-World-Ozeanografie + Subnautica: Shelf (Schutz vor Klippen am Ufer) + Continental Slope (linearer slopeDrop -0.6m pro m ab 4m Tiefe) + Abyssal Plain (tiefen-skalierte Hügel ±3..9m) + Mid-Ocean Ridge (ridged-Octave Bergketten/Trenches). Resultat: surfMin -43 → -62 m, Ozean-Anteil 5% → 9.3%. Sicherheits-Math überprüft (keine Phantom-Inseln). **Offen für V9.60-d (See-Fluss-Naht unsauber)**: Vision-Pfeiler Wasser↔Wille der Welle A, Hydrosphäre-Code-Schicht (Wasserfall-Übergänge zwischen Hochseen + Tiefland sauber rendern). Substantielle Welle.
- **Sand-Variation — V9.60-b.2 ✅ erledigt (23.05.2026, drei Noise-Modulationen statt einer Schwelle nach Schöpfer-Audit „uniform").** Far-Cry/Witcher-Stil Beach-Texturing: `widthNoise` λ~570m moduliert Glocken-Profil-Breite [0.5, 1.9 m], `intenseNoise` λ~290m moduliert Sand-Intensität [0.25, 0.8], karge Fels-Patches bei `widthNoise < 0.18`.
- **Hydrosphäre-Topologie — V9.60-b.1 ✅ erledigt (23.05.2026, Wurzel-Heilung in einer Zeile dank Riesen-Lehre Minecraft 1.18+ Sea Level).** Vor-Versuche scheiterten (V9.60-b.diag empirische Baseline, V9.60-b.1 v1 tanh-Bipolarisierung, v2/v3 asymmetrische Tektonik), bis Wurzel-Erkenntnis: 340-m-Sample-Region war kleiner als 7150-m-Tektonik-Wellenlänge → adaptives 35-Perzentil war faktisch fest. Heilung: `state.waterLevel = (terrainBaseHeight || 0) − 3` (absolut, statt Perzentil-Magie). Alle V9.60-b.diag-Akzeptanz-Schwellen überschritten (Land-Marge +0.8 → +21.4 m, Land-Anteil 48.9% → 69.3%, Fluss-Längen-Median 80 → 1536 m, See-Höhen-StdAbw 6.3 → 10.9 m, Hochseen 18 → 47). **Offen für V9.60-b.2 (falls Schöpfer-Audit es verlangt)**: Ozean-Anteil fiel auf 4.9% — drastisch land-dominiert; ein moderaterer Sea-Level (z.B. `terrainBaseHeight − 8`) würde mehr Wasser-Welt geben. Schöpfer-Browser-Audit zwischen V9.60-b.1 und b.2.
- **Welt-Awareness — V9.59 ✅ erledigt (23.05.2026, Wurzel-Heilung nach Schöpfer-Audit „die umgebung scheint nicht zu verstehen wo das wasser platziert wurde").** Drei Sub-Wellen: (a) neue Wurzel-Funktion `_isAboveWaterAt(x, z, marge=0)` als EINE semantische Quelle für alle Welt-Schichten; (b) Vegetation-Mask in `_vegetationSampleSpawn` (Bäume/Felsen/Geoden, 0.4 m Marge); (c) Gras-Mask in `_buildVoxelChunkGrass` (0.1 m Marge — Ufer-Gras erlaubt). Diagnose-Tool erweitert um „Architekturen + Gras-Halme unter Wasser"-Counter: 0/0 nach V9.59, von 10/3824 total → klare empirische Akzeptanz. Lehre verdrahtet: jede neue Welt-Spawn-Schicht muss `_isAboveWaterAt` konsultieren. **Offen für V9.59-d (Optional-Schliff)**: Küsten-Biom als POSITIVE Schicht (Strand-Streifen, Schilf, „Wiese spürt das Wasser") — wartet auf Schöpfer-Feedback ob die negative Maske reicht. **Offen für V9.60**: Hydrosphäre-Topologie-Heilung für den zweiten Schöpfer-Befund (Seen auf ähnlicher Höhe, keine langen Flüsse, unsaubere Verbindungen) — Multi-Plateau-Tektonik, längere Flüsse aus dem Hochland, See-Fluss-Naht.
- **Relief-Vertiefung — V9.57/V9.58 ✅ erledigt (23.05.2026, Wurzel-Heilung nach Schöpfer-Audit).** Browser-Befund nach §1.1-Phase-0 (V9.50/V9.51-Audit): keine sichtbaren Hochseen, Berge zu wenig hoch + zu wenig weit + nicht über weite Phasen aufbauend. **V9.57** baute den Diagnose-Pass (`scripts/diag-relief.cjs`, 4000 Sample-Punkte + Hydrosphäre-Stats + Tarn-Bilanz + 2 Screenshots). Empirie: Surface-Max nur 60.9 m (Theorie sagte +80 m), p95 33.7 m, See-Spiegel-Max 9.7 m. **V9.58** heilte drei Wurzeln in drei Sub-Wellen: (a) Tektonik-Octave λ~7150 m ±35 m + `mtn`-Feld-λ von 1850 → 4500 m gestreckt (räumlich aufbauende Bergregionen); (b) `ridgeAmp` `9+33·mtn²` → `12+55·mtn²` + zweite ridged-Oktave bei λ/2 + Voxel-Chunk-Decke `dimY 100 → 124, floorDrop 74 → 90`; (c) Tarn-Konstanten skaliert (`reliefPercentile 0.58 → 0.55`, `minReliefAbs 14 → 30`, `maxSlope 0.25 → 0.35`, `depthMin 22 → 28`). **Bilanz**: Surface-Max +95%, p95 +82%, See-Spiegel-Max +322%, Hochseen 10 → 18. Lehre verdrahtet (`CLAUDE.md/Terrain + Chunks`): Empirie statt Theorie bei Worldgen-Parametern; Sub-Wellen mit Diagnose-Validierung zwischen jeder; Folge-Klemmungen bidirektional prüfen; Voxel-Decke proportional mit-skalieren.
- **Theme-Konsistenz-Schliff — V9.56-l ✅ erledigt (23.05.2026).** Audit-Folge-Welle nach `/audit`: vier ungebundene CSS-Vars (`--parch-bg`, `--parch-line`, `--parch-mid`, `--brass-mid`) als Aliase auf existierende Wurzel-Vars in `:root` verdrahtet + eine neue `--overlay-bg` für die Welt-Overlay-Semantik der Inventory-Modal-Z.582. Behebt **Vision-Sünde**: 12 UI-Stellen ignorierten den Tag/Nacht-Theme-Wechsel der Welt. Lehre als Gotcha permanent verdrahtet (`CLAUDE.md/Wichtige Gotchas/UI · Theme`). +12 Z. in `index.html`, audit:strict CSS-Var-Warnings 4 → 0.
- **B-WASM** — ein Rust→WASM-Server in einem Peer-Tab (der letzte offene Punkt des Fremd-Engine-Bogens W17; bewusst per-Projekt, kein Auto-Pfad).
- **Ein zweiter Code-Hygiene-Bogen — VOLLSTÄNDIG GESCHLOSSEN (V9.56-a..k, 23.05.2026)** + Theme-Konsistenz-Schliff V9.56-l (siehe Postscript). **11 Funktionen geschnitten (1 pro Sub-Welle), 77 neue benannte Helfer, Datei netto +95 Zeilen über 11 Sub-Wellen.** UI-Etappe (a/b/c/d, 4 Funktionen): renderPlayerEquipUI 213→19, renderSoulEditorUI 232→13, renderLibraryUI 241→9, _workshopRenderStatsPanel 319→15. Kontrollfluss-Etappe (e/f/g/h/i/j/k, 7 Funktionen): fuseWorlds 239→114, _tickCreatureTaskDirection 267→8, _voxelChunkGeometry 269→25, processChatCommand 285→21, _applyDayNightToScene 305→16, generateTerrainWithParameters 346→73, loadState 380→21. Vier netto-negative Sub-Wellen (d −2, i −30, j −54 — Kommentar-/Duplikat-Konsolidierung). **Bogen-Lehren (acht permanent in CLAUDE.md verdrahtet)**: (1) Block-Grenzen-Inspektion ist eine HIERARCHIE; (2) Side-Effect-Stream + Math.random-Reihenfolge bit-identisch; (3) Pipeline-Kopplung kann einseitig sein; (4) Try-Pattern-Konvention für Multi-Branch-Dispatcher; (5) Cleanup-Asymmetrie preservieren; (6) Strukturelle Test-Invarianten klassifizieren (positive mit-wandern, negative robust); (7) Helfer-Granularität folgt Kosten/Nutzen; (8) thematische Gruppierung > Phase-pro-Helfer bei Ordnungs-Abhängigkeiten. **Disziplin (V9.40 eingelöst)**: keine 200+-Funktion bleibt im Projekt. Der nächste Bogen wäre erst nötig, wenn neue 200+-Funktionen gewachsen sind.
- **Stamm-Hygiene über den Code hinaus** — seit V9.44 sind Tests + Doku Teil des Stamms und brauchen dieselbe Hygiene-Disziplin: `playtest.cjs` war 31 574 Z., EINE Funktion mit Median-Einrückung 20 (die zweitgrößte Reibung des Projekts). Der **Playtest-Pflege-Bogen ist GESCHLOSSEN** (V9.52-a..f): jetzt 29 554 Z., schlanker Orchestrator-IIFE 207 Z., 41 Band-Funktionen + 5 Helfer, Median-Einrückung 8, `safeEvaluate(page,fn)` ersetzt 196 inline evaluate-catch-Stellen. §6-Akzeptanz erfüllt, voller Bogen-Bericht in `docs/archiv/playtest-hygiene.md` §7. Die Doku-Schicht braucht weiterhin periodisches Archivieren fertiger Konzept-Dokumente — sonst wächst das „Projektgedächtnis" zur Halde, eine Schicht über der Heiligen Lektion. Voller Schnitt-Plan in `docs/archiv/playtest-hygiene.md` (§3 unten). Die Doku-Schicht braucht periodisches Archivieren fertiger Konzept-Dokumente (Konsolidierung 21.05.2026 + erneut diese Session) — sonst wächst das „Projektgedächtnis" zur Halde, eine Schicht über der Heiligen Lektion.
- **Crafting-Tiefe — Maschinen-Antrieb + echte Verbindungs-Physik** — der `docs/crafting-konzept.md`-Entwurf beschreibt zwei Schichten, die nie gebaut wurden: die Antriebs-Topologie (Energiequellen Hand/Wasserrad/Dampf/magisch, §4.1/§7.5 — der alte Welle-6-Teilschritt 6.F3) und echte Ammo-Constraints zwischen Compound-Teilen (`btHingeConstraint`/`btFixedConstraint` für Wippe/Tür/Marionette — 6.F5). Der Hylomorphismus-Kern (W4+W5) steht; diese zwei sind Polish-Erweiterungen, keine Fundament-Lücke. Eigene Welle, falls je gewünscht.
- **Kleinere UX-Politur** — die Bauplan-Signatur-Zeile im Werkstatt-Stats-Panel ist wenig auffindbar (Schöpfer-Befund V8.56). Ein Auffindbarkeits-Punkt für eine spätere Polish-Runde.
- **Vision-Pfeiler-Vertiefung — System-Kopplungen** (Schöpfer-Befund nach V9.51: „das Gelände kann ich formen, das Wasser bleibt statisch; ein paralleles System das nicht kommuniziert"). Eine ehrlich benannte offene Front: die Welt hat starke Sub-Systeme (Wasser, Emotion, Hylomorphismus, Kreaturen, Bauten, P2P), aber sie sprechen wenig miteinander. Echte Vision-Tiefe (§3 Welt-Atmen, §1.4 multisensorisch, §1.3 fraktal) entsteht aus **konkreten Kopplungen**, nicht aus einer Meta-Schicht (die Heilige Lektion). Kandidaten-Wellen — JEDE ein eigener Wachstumsring mit konkretem Mechanic + Playtest-Invariante + Schöpfer-Browser-Audit:
  - **Wasser ↔ Spieler-Wille** — heute ist das Wasser nach Worldgen fix. Ein Damm-Bau (Voxel-Fill am Bach) sollte den Fluss umleiten / einen kleinen See stauen. Konkret denkbar: ein `_hydroRecomputeLocal(bbox)`-Pass, der die Hydrosphäre LOKAL re-rechnet nach einem Voxel-Edit im Fluss-Bereich; oder als kleinere Welle: nur die Carve-Index-Polylinie umrouten + den Chunk-Wasser-Rebuild antoggen. **Vorbedingung: V9.50 + V9.51 Browser-Audit** (das vereinte Voxel-Wasser + die Tarn-Becken müssen optisch konvergiert sein, bevor wir sie zur Spieler-Geste reagieren lassen — sonst heilen wir auf einer instabilen Grundlage).
  - **Wasser ↔ Kreaturen** — Tier-Tasks erkennen Wasser (Trinken am Ufer, Scheuen vor tiefem Wasser, Schwimmen). `_hydroWaterLevelAt` existiert — eine `_tickCreatureTaskDirection`-Erweiterung kann ihn lesen. Kleine, additive Welle.
  - **Emotion ↔ lokale Welt** — Spieler-Emotion lokal moduliert Wasser-Schaum-Tempo / Ambient-Audio im Umkreis. Heute treibt Emotion globales Wetter; eine LOKALE Resonanz-Schicht würde §1.2 vertiefen. EINE Funktion (`_localEmotionPulseAt(x,z)`), ein Shader-Uniform, ein Wachstumsring.
  - **Hylomorphismus-Cluster-Resonanz** — Bauten mit übereinstimmenden Tags (z. B. mehrere `lebendig`-Bauten beieinander) verstärken ihre Tag-Wirkung im Umkreis (eine kleine Aura). Heute sind Bauten Solo-Compounds — ein Cluster ist nur eine Distanz-Statistik. Eine echte Tag-Cluster-Aura wäre eine schöne emergente Bau-Sprache.
  - **Multi-Spieler-Vibe-Verstärkung** — mehrere Spieler am selben Ort mit ähnlicher Emotion → eine sichtbare Aura-Verstärkung. Heute ist Multi-User-State unabhängig.

  **Disziplin (V9.51-Reflexion)**: NICHT als „Resonance Layer" über allem (das ist die 19-Modul-Versuchung in akademisch eleganter Verpackung). JEDE Kopplung als eigener additiver Wachstumsring, klein + konkret + Spieler-sichtbar. Reihenfolge nach Schöpfer-Wertigkeit. Der semantisch reichste Faden zuerst: **Wasser ↔ Spieler-Wille** ist der Kandidat, der die V9.51-Schöpfer-Frage am direktesten beantwortet.
- Aus der Stand-vs-Vision-Matrix offen: `evolveCommunity` (Kreatur-Kulturen), VR, IndexedDB-Persistenz.

Die §3-Detailsektionen unten sind die Plan-Referenz pro Ring/Bogen — abgeschlossene Ringe als Journal des Weges, offene mit Aufwand + Vorbedingung.

---

## 1.1 Sequenz-Plan vorwärts (V9.57+)

Diese Sektion ordnet die §1-Offenen-Punkte in eine **arbeitbare Reihenfolge** mit Vorbedingungen, Sub-Wellen und Akzeptanz-Kriterien. Die Logik: harte Vorbedingungen zuerst (Browser-Audit als Eingangs-Schloss), danach Schöpfer-Wertigkeit (V9.51-Befund), danach Daten-Wurzel-Abhängigkeit (Welle E braucht Welle C als Wurzel). Disziplin pro Welle nach V9.56-Bogen-Lehre: kleine fokussierte Sub-Wellen × ~1 Session, jede playtest-grün, Side-Effect-Reihenfolge bit-identisch, Browser-Audit als Phasen-Schluss.

| Phase | Welle | Vorbed. | Sub-Wellen | Akzeptanz |
|---|---|---|---|---|
| **0** ✅ | **Browser-Audit V9.50 + V9.51** | – | Schöpfer-Audit-Befund: keine sichtbaren Hochseen, Berge zu wenig hoch + zu wenig weit + nicht über weite Phasen aufbauend. → **V9.57 Diagnose-Pass** (`scripts/diag-relief.cjs`, empirische Sample-Stats statt Theorie) → **V9.58 Relief-Vertiefung in drei Sub-Wellen** (a Tektonik-Octave + mtn-λ-Streckung; b ridgeAmp + 2. ridged-Oktave + Voxel-Decke geweitet; c Tarn-Konstanten skaliert) | ✅ erfüllt — Surface-Max 60.9 → 118.7 m (+95%), See-Spiegel-Max 9.7 → 41 m (+322%), Hochseen 10 → 18 (+80%) |
| **A** ✅ | **Wasser ↔ Spieler-Wille** (semantisch reichster Faden, V9.51-Schöpfer-Befund) | Phase 0 ✅ | A.1 V9.64 (Damm-Bauplan + Bucket-Index) → A.2 V9.65 (generischer Blocker-Index aus der Substanz) → A.3 V9.66 (`_effectiveSurfaceY` als Wahrheits-Quelle) → A.4 V9.67 (reaktive `_recomputeHydrosphere` mit Debounce) → A.5 V9.68 (Vision-Beweis empirisch + multisensorische Spur) → A.6 V9.69 (Chunk-Water-Gate Voxel-Edit-aware nach Browser-Audit) | ✅ erfüllt — Vision-Beweis empirisch: Damm-Plug verlängert Fluss-Punkte 467→481, Stein-Block-Plug zeigt identische Reaktion (Hylomorphismus), Carve im Trockenland senkt effective auf −8 m (unter waterLevel), Architektur-Remove restauriert Fingerprint exakt zur Baseline |
| **B** ❌ | **Wasser-Naht & Performance** (B.1 V9.70 als Skirts-Patch) | – | B.1 Wasser-Mesh-Skirts (1-Cell-Überlapp) — gebaut, headless grün, **visuell wirkungslos** im Browser-Audit Round 3 | ❌ BEERDIGT (Schöpfer-Befund „du verlierst dich wie ein deutscher Bürokrat") — die Naht ist nicht die Geometrie, sondern die Zwei-Sprachen-Wahrheit. Welle C ist die ehrliche Wurzel-Heilung statt Symptom-Patch auf einem nicht-mehr-gewollten System |
| **C** ✅ | **Wasser-Substanz-Vereinigung** (V9.71-V9.82, 12 Sub-Wellen — Wurzel-Heilung der V9.69-Diagnose „zwei Wasser-Sprachen" + Browser-Audit-Heilungs-Bogen) | Welle A + B-Diagnose | C.1 V9.71 (Cell-Feld parallel) → C.2 V9.72/V9.73 (Iso-Mesher + Bergsee-Init) → C.3 V9.74 (DERIVED-Reaktion) → C.4+C.5 V9.75 (Welle-A + Atlas-Quad streichen) → C.6 V9.76 (Trocken-Gate + Naht-Heilung OOB-Live + Y-Band) → C.7 V9.77 (globales Y-Band gegen Per-Chunk-Drift) → C.8 V9.78 (Below-Band-WATER weg, Floating-Plane geheilt) → C.9 V9.79 (Pad+Crop für Iso, Oberflächen-Naht endlich strukturell geheilt) → C.10 V9.80 (nur Wasser-Luft-Iso, Bottom/Side-Geister gestrichen) → C.11 V9.81 (Density-Grid-Sharing ~50× Speedup) → C.12 V9.82 (Streaming-Pfad-Bug seit V9.71 gefunden, Wasser lädt synchron mit Terrain) | ✅ erfüllt — EIN Wasser-Mesh pro Chunk (Iso-Surface, nur Wasser-Luft), EINE Skala (1.8 m Voxel-Cell), EINE Geometrie-Quelle (gleicher Surface-Nets-Mesher wie der Boden), naht-frei per Pad+Crop, Performance via Density-Grid-Sharing, Streaming + Rebuild als EINE Pfad-Quelle. Netto ~−200 Z. anazhRealm.js, ~−1050 Z. playtest.cjs |
| **C-Brücke** ✅ | **V9.83 CI-Playtest-Flake-Heilung + Performance-Audit** | Welle C ✅ | V9.83 deterministische `_gameLoopTick`-Pumpe im Playtest-Warmup (Headless-rAF ist auf ~1 Hz gedrosselt; passives `setTimeout(DURATION_MS)` bricht unter CI-Last) + PLAYTEST_SECONDS 20 → 30 s; parallel drei Code-Audits (Game-Loop / Chunk-Build / Allokationen+Renderer) für die Performance-Welle | ✅ erfüllt — 3× `taskset -c 0 PLAYTEST_SECONDS=30 npm run playtest` alle grün (25/26/26 Chunks); 14 Heilungen priorisiert in `docs/archiv/performance.md` |
| **Perf-1** ✅ | **Performance-Welle 1 — billige Twists** (V9.84, sechs Sub-Wellen a-f, ~80 % des Gewinns ohne Welt-Tiefe-Verlust) | C-Brücke ✅ | a Shadow-PCF (16→4 Samples) + MeshToonMaterial-Singleton (81+→1, V9.43-c-Lehre vom hydroSurfaceMaterial) · b `isInFrustum` poolt Frustum + Matrix4 + Sphere · c Kreatur-Emotion-Color-Pool · d Task-Direktionen auf geteilten Scratch-Vector3 · e Visual-Updates gated auf `inFrustum` (Distance-LOD für Aura+Sprite+Color-Lerp) · f Spatial-Hash für Flocking (5-m-Bucket-Grid mit Pool-Recycle) | ✅ erfüllt — alle Sub-Wellen playtest-grün, ~600 weniger Allokationen/Sekunde, Flocking 10–20× schneller bei verteilten Crowds. Shadow-Map 2048² + `pixelRatio=1` blieben (V8.47-Bias-Stack kalibriert auf 2048; pixelRatio war schon optimal). Browser-Audit pendent |
| **Perf-2** ✅ | **Performance-Welle 2 Kern — Chunk-Build + Welt-Aufbau-Hebel** (V9.85, vier Sub-Wellen, alle V9.84-Browser-Audit-Wurzeln adressiert) | Perf-1 ✅ | a Frame-Time-Budget statt `MAX_PER_FRAME=1` für Streaming (Subnautica/NMS-Pattern) · b Stable Shadow Maps via Texel-Snap (Witcher-3-Lehre, heilt Schatten-Rauschen bei WASD) · c Mountain-Mulden-Filter (Minecraft/Subnautica-Lehre, heilt Wasserflecken in Bergwänden) · d `_voxelGradientNormals` nutzt das V9.81-`preDensity`-Grid via Trilinear-Lookup (−30–45 ms/Chunk) | ✅ erfüllt — alle Sub-Wellen playtest-grün. **In V9.86 erweitert (Perf-2 ext.a)**: 2.c-Filter ersetzt durch Atmosphären-Konnektivität (bewahrt Carve-Vision, heilt C.3-Flake) |
| **Perf-2 ext.a** ✅ | **Architektur-Spawn-Skirt=0 + Konnektivitäts-Filter + Versions-Sync** (V9.86, drei Heilungen nach V9.85-Browser-Audit, ein Commit) | Perf-2 ✅ | (1) `_remeshVoxelChunksAround(x,z,r,skirt=1)` mit `skirt=0` für spawnArchitecture/removeArchitecture — ~89 % weniger dirty-Chunks beim Bauen · (2) Mountain-Mulden-Filter via `airAbove`-Top-Down-Pass statt SOLID-darüber-Check (semantisch korrekt + Carve-Vision-bewahrt) · (3) `AnazhRealm.VERSION`-Konstante statt hardcoded V7.82 in log() | ✅ erfüllt — 4/4 Playtest-Läufe grün (vorher 2/4 wegen C.3-Flake — der Flake ist GEHEILT). Browser-Audit V9.86 pendent. **Perf-2 ext.b** im Backlog: Macro-Surface-Grid pre-sample (~50–80 ms/Chunk) + Distance-priorisierte Min-Heap-Streaming-Queue |
| **Perf-3** ✅ | **Performance-Welle 3 — Worker + LOD + Lazy-BVH** (V9.87-V9.92, sechs Sub-Wellen, AAA-Catch-up) | Perf-2 ext.a ✅ | ✅ V9.87 Atlas-Strict-Wasser-Gate (Wurzel-Heilung) · ✅ V9.88 Distance-LOD (8× weniger Cells) · ✅ V9.89 Worker-Foundation (Determinismus bit-identisch) · ✅ V9.90 Density-Cutover (BufferGeometry bit-identisch) · ✅ V9.91 Voller Mesh im Worker (Iso+Cells+Colors bit-identisch) · ✅ V9.92 Lazy-BVH (Sicherheits-Wand-Lehre) | ✅ erfüllt — Main-Spike ~150ms → ~5-10ms. 9 Lehren verdrahtet. 47 Determinismus-Invarianten grün. **Aber EHRLICH (V9.93.r-Reflexion)**: das ist solide AAA-Catch-up (Subnautica/NMS-Standard), kein epochaler Wurf. Die echte Bibliothek wartet in Vision-Reset. |
| **Wasser-LOD-Naht** ⚠️ | **V9.93 Pragmatic Workaround** (Wasser-Cells uniform LOD 0) | Perf-3 ✅ | Wasser-Iso bekommt uniformen LOD-0-Step, Naht-frei per Konstruktion. Workaround, KEIN Profi-Stitching. | ⚠️ Pragmatic Fix — wird in V9.98-Geometry-Stitching durch echtes Profi-Stitching ersetzt (Terrain UND Wasser LOD-aware, Boundary-Triangles gestitcht wie Witcher 3 / BotW / Nanite). |
| **Vision-Reset** ⏳ | **Die wahre Bibliothek von Alexandria** (V9.94-V9.99, der epochale Wurf — was V9.86-Brainstorm visionierte, aber V9.87-V9.93 als Catch-up untergrub) | V9.93 ✅ + Schöpfer-Konfrontation 26.05.2026 | ✅ **V9.94** WebGPU-Compute-Diagnose · ⚠️ **V9.94.r** Bürokraten-Reflexion (Lehre 3-Stufen-Hierarchie verdrahtet) · ✅ **V9.95-a** WebGPU-Foundation (Adapter/Device/Trivial-Shader/Determinismus-Beweis) · ✅ **V9.95-b** WGSL-Density-Pipeline · ✅ **V9.95-c** Logging-Heilung · ✅ **V9.95-d** Polish (adapter.info + Telemetry) · ✅ **V9.95-e** EHRLICHE GPU-Abklemmung (Architektur-Wurzel: WebGPU-Compute mit WebGL-Renderer = immer mapAsync-Roundtrip; V11+ Three.js-WebGPU-Renderer-Migration aktiviert das später) | V9.95-Bogen ist abgeschlossen — Foundation steht für V10.0/V11.x. Browser-Audit-Bilanz: WebGPU-Compute funktioniert auf RDNA-3, aber zero-copy-Win erst mit WebGPU-Renderer (V10.0-Bogen). |
| **Performance-Heilungen** ✅ | **Echter Bottleneck-Fix nach V9.95-Bürokraten-Bogen** (V9.96, gezielt am Spawn-Burst statt am vermeintlichen Density-Hebel) | V9.95-e ✅ + Schöpfer-Konfrontation „du hast einfach die Arbeit resetet" | ✅ **V9.96** Per-Frame-Spawn-Budget (FIFO-Queue + 4 Spawns/Frame); `_populateVoxelChunkVegetation` enqueued statt direkt → 200-500ms Frame-Spike strukturell weg | Lehre verdrahtet: Performance-Welle bei Bauchgefühl-„das könnte teuer sein" ist Bürokratie; Browser-Logs PARALLEL zu FPS-Drops scannen → Wurzel in 5 Minuten. |
| **Three.js-Modernisierung** ⏳ | **V10.0-Bogen: alte Krücken lösen** (r134 → r160, ESM-Loading, WebGPURenderer-Foundation) | V9.96 ✅ + Schöpfer-Auftrag „Umstellen auf die Zukunft" | ✅ **V10.0-a** Three.js r134 → r160 Vendor + Bridge-Heilungen · ✅ **V10.0-b** ESM-Loading-Pattern (Inline-Importmap + CSP-Hash) · ✅ **V10.0-c** WebGPURenderer-Addon vendored (238 Files, ~1.5 MB) · ✅ **V10.0-d** Renderer-Auswahl-Logik mit Async-init + defensive Fallback · ✅ **V10.0-e** Hot-Swap zu WebGL bei ShaderMaterial-Inkompatibilität · ⏳ **V10.0-f** TSL-Migration der 4 Custom-ShaderMaterials (Multi-Session-Bogen): **V10.0-f-1** skyboxMaterial, **V10.0-f-2** starsMaterial, **V10.0-f-3** waterfallMaterial, **V10.0-f-4** hydroSurfaceMaterial. Erst nach V10.0-f-4 entfällt Hot-Swap-Pfad + WebGPU rendert dauerhaft. | V10.0-a..e ist die solide Foundation. V10.0-f-1..4 = Multi-Session-Bogen mit voller Qualität pro Material (KEIN Trade-off via vereinfachte Varianten). |
| **V11 Mesh-Pool** ⚠️ Eingefroren | **Mesh-Pool-Pattern als Hybrid eingefroren in Three.js v160** — V11.0-a/b/c/d gebaut + V11.0-d.2.fix Flakiness geheilt. Drei Gras-Visibility-Heilungs-Versuche (gras1/gras2) scheiterten am v160-Vendor-Bug (WebGPU-InstancedMesh-Re-Use-Cache). V11.0-d.fix.gras3 klemmt Pool-Lifecycle ab, V10.0-j.j-Workaround zurück. Pool-API bleibt im Stamm als V12-Vorarbeit (33 Inv grün). | V10.0-j.j ✅ | ✅ V11.0-a/b/c/d Pool-API + Stress · ✅ V11.0-d.2.fix · ❌ V11.0-d.fix.gras1/gras2 (v160-Bug) · ⚠️ V11.0-d.fix.gras3 Pool abgeklemmt | V11-Reaktivierung in V12.0-d nach r184-Upgrade (r182's Bind Group Layout cache system heilt v160's Cache-Bug strukturell). |
| **V12 Genie-Pfad** ⏳ | **WebGL ehrlich entfernen + Three.js v160 → r184 Vendor-Upgrade + WebGPU-native Code-Audit** (Schöpfer-Vision 27.05.2026: „der wahre weg, die vision, der genieweg, die zukunft, keine halben sachen"). Vollendung der V10.0-Vision die V10.0-j als Workaround dokumentiert hat. r184 hat compileAsync truly non-blocking + Bind Group Layout cache system + Major shadow mapping modernization + PCF Vogel disk + basic reversed depth buffer support — V10.0-j-Race + V11-Pool-Workaround vermutlich BEIDE obsolet. | V11 ✅ Hybrid + Schöpfer-Auftrag | **diag** → **vendor** (r160→r184) → **a** (Renderer-Vereinfachung) → **b** (WebGL-Legacy-Patch raus) → **c** (Conditional Gates streichen) → **d** (Buffer-Lifecycle-Race auf r184 neu prüfen, V11-Pool ggf obsolet) → **e** (WebGPU-Compute aktivieren, GPU→Renderer zero-copy) → **f** (Code-Review jeder Funktion, höhere Ordnung) → **g** (Schöpfer-Browser-Audit). Detail in §1.3. | „nicht zerstört sondern in höherer ordnung bestehend, umgewandelt" — Welt-Synergie zurück, Vendor-Race-Workarounds weg, WebGPU-native Pipeline EINE Sprache. ~15-25h Multi-Session. |
| **V13 Wasser-Profi-Bogen** ✅ pausiert @ V13.14 (Finish → V15) | **Voxel-Wasser EFFIZIENT + KORREKT + in SYNERGIE + 3D-verbunden**. Das Wasser-MODELL ist korrekt (Cells stimmen: under-lid 0, >3 m über Quelle 0, Phantom-Seam 83→0). Detail §1.4. | V12 ✅ | **V13.0–.8 ✅** Diagnose→3D-Flood · **V13.9 ✅** Schicht-3-Cull · **V13.10 ✅** Klettern-Cap (verworfen) · **V13.11 ✅** Austritt-Cull (ersetzt) · **V13.12 ✅** Vertikal-offen · **V13.13.0–.2 ✅** Iso-Memo (−61 %) + scale-Stempel + Iso-liest-Wahrheit (Phantom 83→0) · **V13.14 ✅** die EINE robuste Regel (Sky-Konnektivität, Überhang-Bucht 54/54). **Der Wasser-Finish (Sync-Bugs + Berg-Innenwasser + Sub-Region-Edit) wandert nach V15** — gegen die V14-Topologie justiert. | Wasser-Modell wie die Riesen: kohärent, 3D-verbunden, reaktiv (Damm staut, Carve flutet). Render-Rand-Bugs → V15. |
| **V14 — Die wahre Tiefe des Geländes** ✅ inhaltlich komplett (V14.0–.9, Browser-Audit pendent) | **Epische Geomorphologie** (Schöpfer-Auftrag 30.05.2026: anden/everest, lange Flüsse, epische Felder, Vielfalt wie die Erde). Wurzel (empirisch + Code): Alpen-Miniatur-Maßstab — dominante Gebirgs-λ≈77 m, fehlende kontinentale Basis + Differenzierung + thermische Erosion. Heilt das Terrain UND die fragmentierte Hydrologie an EINER Wurzel. Detail §1.5. | V13.14 ✅ | **V14.0–.6 ✅** Diagnose/cont0/Erosion/Differenzierung/Ebenen/Harmonie/Fern-Heilung · **V14.7 ✅** Maßstab-Streckung (λ2860-Hub → Feature-Größe 176→464 m; terrainSteepness verdrahtet) · **V14.8 ✅** gerichtete Uplift (ridged λ3570 + Flow-Warp → Anden-Ketten, Elongation 1,82→2,28) · **V14.9 ✅** regionale Differenzierung (Relief- + Stil-Maske → DREI Region-Typen: Ebene 18 / Plateau 10 / Kette 8, Ozean 18 %, abwechslungsreich + stabil) · **Schöpfer-Browser-Audit** = Bogen-Schluss | Über den Bogen: steil 26→0 %, Median 35→~15°, sanft →31 %, Ketten-Elongation 1,1→2,3 (Ketten-Regionen), Regional-Vielfalt = MIX aller Typen, Meere 18 %, FPS 119. Determinismus-Bruch gewollt. |
| **V15 — Der Wasser-Finish** ⏳ | **Die drei Synchronisations-Wurzeln** (aus der V13.14-Analyse, gegen die NEUE V14-Topologie justiert) + Berg-Innenwasser + Sub-Region-Edit + **die ±1024-Wasser-Region** (Schöpfer-Befund V14.6: ferne Chunks tragen keine See-/Meer-Oberfläche). | V14 ✅ + Schöpfer-Browser-Dump | **V15.0** Browser-Dump an der echten Fehlstelle (Vorbedingung — Spawn reproduziert nicht) · **V15.0b** Hydrosphäre-Region-Grenze: Erosion + Wasser-Atlas leben nur in ±1024 m (`regionSize=2048`) → `_voxelChunkHasAnyWater` sagt fern „kein Wasser" → keine Oberfläche. Heilung: Region mit dem Spieler MITWANDERN ODER Ozean global vom `waterLevel` ableiten (entkoppelt vom region-bound Atlas) + Lakes/Rivers region-lokal · **V15.1** Arch-Spawn-Remesh deckt die Iso-OOB-Nachbarn ab (skirt-Wurzel) · **V15.2** `_enqueueWaterIso` als distanz-priorisierte Queue (statt Set) · **V15.3** Stempel-AABB rotations-aware (`_blockerComputePartAABB`) · **V15.4** Sub-Region-Edit-Remesh (frame-sauberer Carve, das 6× verschobene V13-Versprechen) · **V15.5** Browser-Audit-Schluss | Kein Kapillar/Schatten an Strukturen, kein Berg-Bluten beim Streamen, frame-sauberer Carve, **Wasser/Drainage auch jenseits ±1024 m**. |
| **V16 — die lebendige Welt** ⏳ | **System-Kopplungs-Pfeiler E/F/G** (NACH dem Fundament, V9.51-Disziplin). Pfeiler D Kern erledigt (Wasser↔Kreaturen). | V15 ✅ | **V16.0** Pfeiler E (Emotion ↔ lokale Welt — `_localEmotionPulseAt(x,z)`, Wasser-Schaum-Tempo + Ambient + Licht lokal moduliert) · **V16.1** Pfeiler F (Hylomorphismus-Cluster-Resonanz — 3× lebendig-Bauten = sichtbare Aura, lockt Fauna) · **V16.2** Pfeiler G (Multi-Spieler-Vibe) · **V16.3** D.4-Polish (Splash-Ping, autonome Trink-Geste) · Backlog: IndexedDB-Welt-Gedächtnis, Predictive Prefetch | Welt fühlt sich erinnert + emotional reaktiv an, atmet als EIN Wesen. JEDE Welle additiv + klein-fokussiert, keine Meta-Schicht (Heilige Lektion). |
| **Toon-Polish + LOD-Cross-Fade** ⏳ | **Render-Schicht-Welle** (V11+, V9.92-Audit-Befund „Berg-Treppen-Textur" + „LOD-Pop-In") | V10.0-Bogen ✅ | Toon-Material-Polish, Cross-Fade-Alpha über 1-2 Frames beim LOD-Wechsel, ggf. 3-4 LOD-Stufen statt 2 | Render-Schicht-Welle, separate Diagnose. |
| **D** ✅ Kern | **Wasser ↔ Kreaturen** (klein additiv, derselbe Hydro-Layer — KERN ABGESCHLOSSEN 27.05.2026, Schöpfer-Browser-getestet „schwimmen sehe ich"; D.4-Polish im Backlog) | Perf-1 ✅ + V10.0-Bogen ✅ | ✅ **D.1** `_creatureWaterContextAt(creature)` Foundation (V11.0-d.1, 27.05.2026 — EINE Wahrheits-Quelle für inWater/depthBelow/submerged/distToShore/shoreDir aus den V9.25/V9.50/V9.59-Atlas-Funktionen, 200 Calls < 50ms, 14 Test-Invarianten grün) · ✅ **D.2** Tiefen-Scheue + Schwimm-Surface im wander-Loop (V11.0-d.2, 27.05.2026 — Direction-Bias zum Ufer bei `inWater && depth>1.5`, Y-Override auf `waterY - 0.3` für Schwimmen, Distance-LOD <50m, 9 Test-Invarianten + empirischer Tick-Test grün, Schöpfer-Browser-Bestätigung „schwimmen sehe ich") · ✅ **D.3** `drink`-Task als 6. CREATURE_TASKS (V11.0-d.3, 27.05.2026 — 3 Phasen suchen→walken→trinken-2.5s + Happiness-Boost, Aura azur/210, Ping A5/880Hz, Chat „trinke"/„alle trinken", 17 Test-Invarianten grün, `_findNearestWaterPoint(40m, 8 Richtungen)` als Suche) · ⏳ **D.4 Polish-Backlog** Schöpfer-Browser-Audit D.3 + Splash-Ping bei Wasser-Eintritt (§1.2 multisensorisch) + autonome Trink-Geste (happy+Ufer triggert spontan drink) + optional Kopf-Bobbing-Animation während Pause — NICHT zwingend nächste Welle, wartet auf V11-Integral-Plan | Eine Kreatur findet ohne Skript-Hilfe Wasser, trinkt sichtbar (✅ Kern), schwimmt durch flaches Wasser (✅), scheut tiefes (✅) — Polish-Pflege offen |
| **E** | **Emotion ↔ lokale Welt** (öffnet den Daten-Pfad für Welle F) | – | E1 `_localEmotionPulseAt(x,z)` — die Daten-Funktion: Spieler-Emotion mit räumlichem Falloff (Gauss, Radius ~30 m), in `state.emotion.localField` · E2 `hydroSurfaceMaterial` bekommt `aLocalEmotion`-Uniform — Wasser-Schaum-Tempo + Tint modulieren · E3 Symphonie-Ambient (Filter-Cutoff + Gain) lokal moduliert · E4 Schöpfer-Audit | Bei `awe`-Spike pulsiert das Wasser im 30-m-Umkreis sichtbar; Ambient verändert sich; Effekt klingt mit Distanz ab |
| **F** | **Hylomorphismus-Cluster-Resonanz** (unabhängig, Bau-Sprache vertiefen) | – | F1 `_compoundClusterAt(x,z, tag)` — Tag-Cluster-Erkennung (`lebendig`/`magie-geladen`/`weich` etc. in Distanz N) · F2 Aura-Schicht: ein Cluster ≥ 3 Bauten desselben Tags erzeugt einen Pulse-Mesh (semi-transparenter Ring) · F3 Welt-Reaktion: `lebendig`-Cluster lockt Fauna; `magie-geladen`-Cluster modifiziert lokale Tag-Wirkungen · F4 Schöpfer-Audit | Drei `lebendig`-Bauten beieinander erzeugen eine sichtbare Aura; eine Kreatur wandert in den Cluster hinein |
| **G** | **Multi-Spieler-Vibe-Verstärkung** (braucht E als Wurzel) | Welle E ✅ | G1 `_localEmotionPulseAt` über P2P broadcasten (`vibe-local`-Nachricht, ~1 Hz, peer-id + Position + Emotion) · G2 Empfänger akkumuliert in `state.p2p.peerEmotions` · G3 Aura-Verstärkungs-Pass: zwei Peers mit ähnlicher Emotion am selben Ort → 1.5× Aura-Intensität · G4 Zwei-Browser-Audit (smoke-webrtc erweitern) | Zwei Browser, beide Spieler in 20 m mit `peace`: die Aura ist sichtbar stärker als ein Spieler allein |
| **Backlog** | **Polish-Pool** (kein Sequenz-Zwang) | – | (a) Wasserfall-Cellular-Emergenz (vertikale water-Cell-Säulen über Klippen als „Wasserfall-Spalte" — heute noch separate Geometrie); (b) Lake-Mask-Falloff (Schöpfer-Audit-Backlog nach V9.69, weicher See-Mask-Rand); (c) lokales Regen/Pfützen-Modell (Precipitation, Standard-Carve im Hochland soll Pfütze geben); (d) Crafting-Tiefe — Welle 6.F3 (Maschinen-Antrieb) + 6.F5 (echte Ammo-Constraints), falls je gewünscht; (e) B-WASM (per-Projekt); (f) Vision-Matrix-Reste: `evolveCommunity`, VR, IndexedDB-Welt-Gedächtnis (das nie-gebaute V9.97) + Predictive-Prefetch (V9.98-Velocity-Cone); (g) **effiziente Höhe** — adaptives vertikales Chunk-Band / Sub-Chunk-Culling (Minecraft-Pattern: leere Luft kostet nichts → gewaltige Berge OHNE FPS-Kosten; der V14.6-Soft-Clamp ist nur der Deckel-Workaround — Schöpfer-Wunsch „so gewaltige berge, aber effizient"); (h) **Geometry-Stitching** für LOD-Boundaries (das nie-gebaute V9.98-Versprechen — ersetzt den V9.93-Wasser-uniform-LOD-0-Workaround durch echtes Triangle-Fan-Stitching, Witcher3/BotW/Nanite); (i) **zweiter Code-Hygiene-Bogen** — ~7 Kontrollfluss-Giganten >200 Z. (`loadState`/`processChatCommand`/`generateTerrainWithParameters`/`_voxelChunkGeometry`/`_tickCreatureTaskDirection`/`_applyDayNightToScene`/`fuseWorlds`) + 4 UI-Builder (V9.44-Schmerzgrenze, `code-hygiene.md` §6); (j) **Alt-Vision-Reste** (frozen-Snapshot-Alter, einzeln low-priority — hier festgehalten, damit sie nicht „verloren" gelten, V14.6-Audit): DSL Phase 3 `build_path` (Straßen) + `research_blueprint` (Rezept-Erfindung, bewusst aufgeschoben, `wave-6-design.md` §12.2); alte V7.71-Audit-UX-Lücken (Onboarding/Intro, Mobile/Touch, Accessibility/ARIA, i18n, DSL-per-Peer-Rate-Limit — `system-audit.md`); ~~`terrainSteepness` toter Parameter~~ ✅ V14.7 VERDRAHTET (×ridgeAmp, Main+Worker) | – |

**Pro Welle, vor dem Beginn (V9.56-Bogen-Disziplin):**

1. **Block-Grenzen-Inspektion** zuerst — welche existierenden Funktionen werden berührt, welche shared State gibt es, wo sind die Side-Effect-Streams?
2. **`grep -n '<funktionsname>\.toString' scripts/playtest.cjs`** — strukturelle Invarianten identifizieren, die mit-wandern müssen (V9.56-i-Lehre).
3. **Playtest-Invariante VOR dem Schnitt schreiben** — die Akzeptanz wird der Test, nicht die Demo.
4. **Sub-Welle = ein git-Commit** + ein Chronik-Eintrag oben in `handover.md` (Doku-Disziplin).
5. **Browser-Audit am Phasen-Schluss**, nicht in der Mitte — eine Welle ist erst „fertig" wenn der Schöpfer es sieht.

**Bewusst nicht einsequenziert:**

- **Welle B vs. A**: B ist vorbedingungsfrei (`_hydroWaterLevelAt` existiert), könnte VOR A laufen — aber A ist der Schöpfer-Prioritäts-Faden (V9.51-Befund). A zuerst.
- **Welle D vor C**: D ist unabhängig — aber C öffnet den Daten-Pfad für E. C zuerst, damit E unmittelbar folgen kann (zwei verwandte Wellen am Stück).
- **Crafting-Tiefe (6.F3/6.F5)** bleibt im Backlog statt sequenziert — V9.51-Schöpfer-Befund priorisiert System-Kopplungen über Crafting-Erweiterungen. Eigene Welle bei explizitem Wunsch.

---

## 1.3 V12 — der Genie-Pfad: r184 + WebGPU-required + Code-höhere-Ordnung (substanziell durch, 28.05.2026)

> **Stand 29.05.2026**: V12.0-diag/vendor.1/2/3/4/a/d/e + f/f.1/f.2 (Toon-Migration + Avatar-Farb-Heilungen) + **perf.a/b** (Edit-Rebuild-Freeze geheilt: Kaskaden-Unifikation + Basis-Density-Cache) ✅ committed. Schöpfer-Browser bestätigt FPS 60+ auf RDNA-3 + „Gras passt". **Rest**: der **Architektur-Instancing-Bogen** (perf.c.diag/c/d/e — der ANDERE FPS-Sturm: Laufen in dichte Architektur-Regionen, vier Wurzeln A-D, Design in `docs/archiv/performance.md` §9) + V12.0-g (final Audit).

Nach V11.0-d.fix.gras2 (V11-Mesh-Pool als Hybrid stabilisiert) zeigte der Schöpfer-Browser-Audit: das ist nicht der Endzustand. Die Welt fühlt sich „nicht synergetisch wie zuvor" an — FPS=7, Schatten-Wandern, Pop-In-Strukturen, V11.0-d.fix.gras wirkte nur teilweise. Der Schöpfer hat den ehrlichen Weg artikuliert:

> **„sollten wir nicht beginnen, das alte system zu entfernen (WebGL) und beim entfernen erneut den code prüfen, ob die jeweiligen funktionen und flüsse im webgpu optimal eingepflegt, nicht zerstört sondern in höherer ordnung bestehend, umgewandelt, und so das system endlich ohne ineffiziente umwege fortzufahren, wahre ordnung, oder bin ich da falsch? ist das nicht der weg? die vision? der genieweg, die zukunft?"**

> **„dies scheint wichtig in der planung zu berücksichtigen, sicher klären ob es einen sicheren, stabilen, genialen pfad gibt, was genies, profis hier machen, keine halben sachen"**

Er hat recht. V10.0 hat WebGPU-Renderer gebaut, aber WebGL als Sicherheits-Wand BEHALTEN — Hot-Swap, Legacy-Bridge, conditional Gates. Das Resultat ist Doppel-Pflege + Workarounds (V10.0-j.j-Memory-Trade, V11-Mesh-Pool-Hybrid). Die echte V12-Vision: **WebGL ehrlich entfernen + Three.js v160 → r184 Vendor-Upgrade + WebGPU-native Code-Audit**.

### Why Three.js r184 (Profi-Recherche, github.com/mrdoob/three.js)

V160 ist von Januar 2024 — **24 Releases hinten**. Was r161-r184 in WebGPU verbessert haben (Auszug):

- **r184**: „compileAsync truly non-blocking" — direkter Bezug zu V10.0-j-Buffer-Lifecycle-Race (pending Submits vs. async dispose)
- **r183**: „Add basic reversed depth buffer support" + WebGPU compatibility improvements
- **r182**: „Major shadow mapping modernization" + „Improve Bind Group Layout cache system" + „PCF shadow filtering with Vogel disk sampling" — V10.0-h.b/V10.0-j Shadow-Bogen wäre obsolet
- **r181**: Shadow pipeline fixes for first-frame rendering + GGX VNDF importance sampling

**Genie-Pfad-Erkenntnis**: V10.0-j-Bogen (10 Sub-Wellen am Buffer-Lifecycle-Race) + V11-Mesh-Pool-Workaround sind vermutlich BEIDE obsolet auf r184. Three.js' Vendor-Team hat in 24 Releases die Wurzel-Heilung gemacht — wir haben dagegen kompensiert.

### V12-Bogen-Plan (Multi-Session, ~15-25h)

| Sub-Welle | Was | Aufwand | Akzeptanz |
|---|---|---|---|
| ✅ **V12.0-diag** | Code-Inventar (28.05.2026): rendererKind-Gates (5), Hot-Swap-Pfad (`_swapToWebGLRenderer` 80 Z. + `_replaceWorldCanvas` 25 Z.), webgl-legacy-Side-Effect-Import, Bridge-Heilungen (ColorManagement, useLegacyLights), 0 raw ShaderMaterial, 16+ V10.0-j-Race-Defer-Points, V11-Pool-API komplett. Plus Stage-1-Release-Notes-Scan r161-r184 (r164 hat WebGLNodeBuilder entfernt → WebGPU-required Konsequenz). | ~1-2h | Risiko-Map klar, r164-Wende artikuliert |
| ✅ **V12.0-vendor.1** | r184-Bytes-Tausch (4 ESM-Bundles core/module/webgpu/tsl, 1.4 MB statt 670 KB + 1.5 MB Addons). Bootstrap umgeschrieben auf `three/webgpu` + `three/tsl` Import-Pfade mit defensiven `requireWebGPU()`-Probes. Drei TSL-API-Renames: `WebGPU.isAvailable()` → `navigator.gpu`, `tslFn` → `Fn`, `cond` → `select`. CSP-SHA256-Hash neu. | ~2-3h | Welt rendert auf r184, headless WebGL2-Fallback greift |
| ✅ **V12.0-vendor.2** | useLegacyLights-Bridge als toter No-Op gestrichen (Diag-Probe bewies `"useLegacyLights" in renderer === false` auf r184). Welt-Optik unverändert (Schöpfer-Browser-bestätigt). | ~30min | Toter Bridge-Code raus, Clean-Up |
| ✅ **V12.0-vendor.3** | ColorManagement re-aktiviert (`enabled=true`) + sRGB-Texture-Tagging (3 Canvas-Texturen). V9.56-i-Test-Doku-Sync V8.27 via `convertLinearToSRGB()`. | ~1-2h | Round-Trip sRGB↔linear cancelt visuell |
| ✅ **V12.0-vendor.4** | `transformedNormalWorld` → `normalWorld` global gerenamed (9 Stellen). FPS-Kollaps von 5 auf 60+ am Schöpfer-Browser geheilt — Deprecation-Warnings mit Stack-Capture waren Performance-Bomben. Plus Stage-1-Deprecation-Scan im Vendor: nur 4 deprecated TSL-Symbole, 3 nicht aktiv genutzt. | ~30min | FPS-Heilung + Lehre „Deprecation-Warnings sind Performance-Bomben, nicht Diag-Hinweise" |
| ✅ **V12.0-a** | Hot-Swap-Pfad streichen (`_swapToWebGLRenderer` + `_replaceWorldCanvas` + 80-Z-Render-Promise-Reject-Catch). `state.rendererKind` + `state.rendererInkompatibel` weg. Zwei `rendererKind === "webgpu"`-Gates unconditional. `_configureRenderer(renderer, kind)` → `(renderer)`. WebGPU-required Bootstrap-Wand mit User-Banner statt schwarze Welt. | ~2h | ~150 Z. gestrichen, ~50 Z. neu (netto -139 Z.), EIN Pipeline-Pfad |
| ✅ **V12.0-d** | V11-Mesh-Pool reaktiviert auf r184 — `_buildVoxelChunkGrass` ruft `_acquireGrassMesh()`, `_disposeVoxelChunkGrass` ruft `_releaseGrassMesh()`. V11.0-d.fix.gras-2-Workaround (fresh instanceMatrix per acquire, 16 KB/acquire) gestrichen — r184's Bind-Group-Layout-Cache heilt v160-stale-Buffer strukturell. V10.0-j.j-Memory-Trade obsolet (~500 KB GPU-Heap pro Welt-Wechsel gespart). Identity-Test grün: Re-Build recycelt das gleiche Mesh-Objekt. Schöpfer-Browser bestätigt „Gras passt". | ~3-4h | Echtes Pool-Recycling, V11.0-d.fix.gras-Bogen-Vision endlich erfüllt |
| ✅ **V12.0-e** | V9.95-WebGPU-Compute-Pipeline reaktiviert — V9.95-e-Abklemmungs-Wurzel (cross-backend mapAsync-Stall auf WebGL-Renderer) ist auf r184's WebGPURenderer obsolet (same-device-mapAsync ~5-15 ms). 15-Z-Cutover-Reaktivierung in `_ensureVoxelChunkAt`: Vier-Stufen-Hierarchie Worker-Mesh > GPU-Density > Worker-Density > sync-CPU. V9.95-Foundation (~600 Z. WGSL + JS) war schon im Stamm. | ~30min Code, ~3-4h Welle-Effort | GPU-Compute produktiv für pristine Streaming-Chunks, ~30-40 ms/chunk gespart |
| ⏳ **V12.0-f-full** | Code-Review jeder berührten Funktion. MeshToonNodeMaterial existiert in r184 — `_buildToonNodeMaterial`-V10.0-g.diag-Workaround (manuelles Toon-Lighting via MeshBasicNodeMaterial-colorNode) obsolet. Three.js' interne Lighting+Shadow-Pipeline aktivieren (lights=true via MeshToonNodeMaterial) → `_renderShadowMapPass` + `state.toonLightUniforms` potenziell obsolet. ~250 Z. netto-Streichung erwartet. | ~3-4h | „nicht zerstört sondern in höherer ordnung bestehend, umgewandelt" — Schöpfer-Wortlaut eingelöst |
| ⏳ **V12.0-g** | Schöpfer-Browser-Audit AMD RDNA-3. 10-min Welt-Reise. FPS-Verlauf stabil. Schatten ruhig. Strukturen smooth ohne Pop-In. Memory-Tab kein Snowball. Welt fühlt sich synergetisch an. | ~30min | V12-Bogen offiziell zu, V13+ Vision-Pfeiler-Bogen kann starten |
| ✅ **V12.0-perf.a/b** | Edit-driven Chunk-Rebuild FPS-Heilung. Wurzel: `_rebuildVoxelChunk` lief SYNC (~229 ms/Chunk, Density-Sampling 126 ms = 55%). **perf.b** Basis-Density-Cache (`_terrainBaseDensityAt` worldgen-frozen + cachebar, Edit-Delta billig drauf) → 229→128 ms. **perf.a** Kaskaden-Unifikation (Edit-Rebuild erbt die Streaming-Kaskade Worker-Mesh→GPU-Density→Worker-Density→Sync; Nachbar-Chunks async off-main-thread, Spieler-Chunk sync). | ✅ erledigt — Edit-Freeze geheilt. A's Nachbar-Async-Win headless nicht messbar (swiftshader) → Browser-Audit. |
| 🔄 **V12.0-perf.c/d/e** (Architektur-Instancing-Bogen) | Der ANDERE FPS-Sturm: Laufen in dichte Architektur-Regionen (Kristallfelder/Wälder) → FPS 6-9. Vier diagnostizierte Wurzeln: **(A)** kein Instancing (`_buildFromBlueprint` = ein Mesh/Part → hunderte Draw-Calls/Frame); **(B)** `tickArchitectureCulling` ohne Per-Frame-Budget (Dutzende Mesh-Builds in einem Tick); **(C)** Eager-Collision für alles in 150 m; **(D)** Nexus-Pflaster (`gravity *= 0.9` → Welt schwebt). **Heilung (Wurzeln, kein Pflaster)**: ✅ perf.c.diag (Messung: 572→40 Draw-Calls = ×14.3, 183 Ammo-Bodies) → ✅ perf.c.1 (Foundation: Matrix-Bit-Gleichheit) → ✅ perf.c.2 (Cutover: Vegetation instanced via `instanced`-Flag, 4 entry.mesh-Fäden geheilt, LMB-Pick funktional) → ✅ perf.d (budgetierter Culling-Build Wurzel B + Lazy-Proxy-Collision Wurzel C, perf.d.2) → ✅ perf.e (Nexus → adaptiver Qualitäts-Governor, Wurzel D — Gravitations-Pflaster geheilt). Design in `docs/archiv/performance.md` §9. | ~8-12h Multi-Session | Welt dicht mit instanced Leben bei 60 FPS, Physik leicht, Nexus regelt Qualität statt Gravitation zu brechen. |

### Risiken ehrlich

- **Browser ohne WebGPU sehen NICHTS** (kein Fallback). Aber: Chrome stable seit Mai 2023 (~2.5 Jahre), Safari 18+ seit Sept 2024 (~14 Monate), Firefox kommt. Mobile zunehmend supportet. WebGPU IST die Zukunft, wir hängen am alten System aus Verlust-Angst.
- **r184 könnte neue Bugs haben** die r160 nicht hatte. Diagnose vor jeder Sub-Welle, Test-Band als Wand.
- **Multi-Session-Bogen** wie V10.0 (23 Sub-Wellen). Aber strukturell klarer weil REMOVAL statt PORT. Code wird WENIGER, nicht mehr.
- **Vendor-Upgrade r160 → r184** ist 24 Releases. Breaking-Changes erwartet. Bridge-Modus + schrittweise Migration in V12.0-vendor.

### Disziplin (V9.56-Bogen-Lehre + V10.0-Bogen-Reflexion)

- Jede Sub-Welle: klein + fokussiert (≤ ~3h), playtest-grün vor Commit
- Playtest-Invariante VOR dem Schnitt (Test ist die Akzeptanz)
- Browser-Audit am Bogen-Schluss (V12.0-g), nicht in der Mitte
- Sub-Welle = ein git-Commit + Chronik-Eintrag oben in `handover.md`
- V10.0-Workaround-Markierungen werden in V12.0-d entfernt + durch r184-native-Doku ersetzt
- **„Keine halben Sachen, was Profis machen"** (Schöpfer-Auftrag) — keine Mid-Air-Kompromisse mehr, der Vendor-Upgrade ist der Anker

### Vorbedingung

V11.0-d.fix.gras2-Browser-Test ZUERST. Wenn Gras kommt → V12.0-diag startet. Wenn nicht → V11 sowieso in V12.0-d neu geprüft (vermutlich obsolet auf r184), kein separater V11-Rollback nötig.

---

## 1.4 V13 — Wasser-Profi-Bogen (der wahre Pfad, sauber sequenziell)

> **PAUSIERT @ V13.14 (30.05.2026).** Das Wasser-MODELL ist korrekt (Cells stimmen, gemessen: under-lid 0, >3 m über Quelle 0, Phantom-Seam 83→0). Die verbleibenden drei Browser-Artefakte sind Render-Rand-**Synchronisations-Bugs** (skirt-beim-Arch-Spawn lässt Nachbar-Iso-OOB stale; `_enqueueWaterIso` ist ein Set statt distanz-priorisierter Queue; Stempel-AABB orientierungs-frei `max(sx,sz)·0.5`) — sie + Berg-Innenwasser + Sub-Region-Edit wandern in **V15 — Der Wasser-Finish** (§1.1), bewusst NACH dem V14-Terrain-Bogen, weil das neue Relief die Hydrologie umkrempelt (große Becken statt 50 Fitzel-Seen, Uferlinien-Index 47→<10) und der Finish gegen die NEUE Topologie justiert wird. Die V13.15–.17-Zeilen unten sind nach V15 umgewidmet.

**Schöpfer-Befund (29.05.2026, Browser):** „wasser ist schon ewig in bereichen, an hängen oder um strukturen als schatten, glaube die berechnung der positionen des wassers noch nicht so genial wie die profis". Plus: Edit flackert + ganzer Chunk rechnet neu; Streaming droppt noch.

**Die ehrliche Wurzel (im Code verifiziert, nicht spekuliert — meine erste Reflexion „zurück zu flachen Planes" war Ausweichen):** Wir machen Voxel-Wasser FALSCH, nicht der Voxel-Ansatz ist falsch. Minecraft/Subnautica/Vintage-Story beweisen: zell-basiertes Wasser ist manipulierbar, fließend, reaktiv UND effizient. Drei verifizierte Fehler:

1. **Falscher Mesher.** `_buildVoxelChunkWaterIsoSurface` läuft Surface-Nets über das ganze `(dim+3)·dimY·(dim+3)`-Zell-Grid (~90 400 Cells: extract+quads+Laplacian-smooth+crop+OOB-Density) = **~124–166 ms/Chunk** (V13.0 gemessen, schlimmer als die alte 78-ms-Schätzung) → nur ~7–10k Output-Dreiecke (die ~flache Fläche). Eine Wasseroberfläche ist FLACH — die Riesen meshen nur die **Wasser-Luft-Grenzflächen** (Face-Culling + Greedy-Meshing, ~ein paar hundert Quads, ~1 ms). Surface-Nets ist für glatte Iso-Volumen, nicht für flache Wasserspiegel.
2. **Falsche Klassifikation (= Wasserschatten).** `_buildVoxelChunkWaterCells` Z17033-17035: `if (d>0) SOLID; else if (cy <= colWaterY) WATER`. **V13.0 quantifiziert + präzisiert die Wurzel:** der Schatten ist NICHT der Ozean-Default (nur 0–2 %), sondern der **16-m-See-Dilatations-Bleed** in `_waterLevelAt` (V9.73, Z18011–18019: 3×3-MAX über waterKind===2 hebt den See-Spiegel auf den Ring der Spalten um den See → Hang-Zellen unter diesem Pegel werden WATER → Wasser klebt am Hang). **43–54 % aller WATER-Cells** sind dieser Bleed (Küste→Bergsee). Die Riesen füllen von QUELLEN (flood-fill / Atlas-strict) — Wasser ist nur, wo es wirklich ist.
3. **Edit = ganzer Chunk.** `_remeshVoxelChunksAround` markiert ganze Chunks dirty → `_rebuildVoxelChunk` rechnet den ganzen 24×24×124-Chunk neu. Minecraft remeshed nur die berührte 16er-Sektion.

**Die Drei-Schichten-Architektur (V13.4-Reflexion — der Schöpfer fing den „Loch stopfen, anderes entsteht"-Thrash):** der V13.1–V13.4-Bogen thrashte, weil ich die SCHICHTEN verwechselte (V13.2 Perf→blockig, V13.4 Glättung→Makro schlechter = Geometrie reparieren für ein Erscheinungs-Problem). Wasser ist DREI Schichten, jede mit EINER Aufgabe, wie die Riesen: **(1) Wahrheit/Zellen** — *wo* ist Wasser (atlas-strict, reaktiv auf Carve/Damm) = die lebendige, manipulierbare Substanz (V9.69-Vision, das eigentliche Ziel). **(2) Geometrie/Mesh** — eine DUMME flache Fläche am Spiegel, billig, mehr nicht; NICHT glätten (Geometrie kann keine natürlichen Übergänge tragen). **(3) Erscheinung/Shader** — ALLE Schönheit + Lebendigkeit aus dem TIEFENPUFFER: weiche Uferlinie („Oberflächenspannung") via `viewportLinearDepth` (pro-Pixel-Gradient, folgt dem Terrain exakt — egal wie blockig das Mesh), Tiefen-Farbe, Gerstner-Wellen, Fresnel, + Emotions-Kopplung (die Welt atmet). **Render-Korrektheit (V13) ist Fundament für das lebendige Ultiversum (V16), nicht Selbstzweck — keine endlose Wasser-Politur.**

**Der Bogen (sauber sequenziell, jede Welle = ein Commit + Chronik-Eintrag + Playtest grün):**

| Welle | Was | Heilt |
|---|---|---|
| **V13.0** ✅ | Wasser-Profi-Diagnose (`scripts/diag-water-perf.cjs`, 2 Orte: Küste + Body-Teleport zum höchsten Bergsee). **Vorher-Zahl:** W1 Mesher **~124–166 ms/Chunk** (90 400 Grid-Cells → ~7–10k Output-Dreiecke); W2 Schatten **43–54 %** der WATER-Cells in exact-Atlas-Land (= 16-m-See-Dilatations-Bleed in `_waterLevelAt` Z18011–18019, NICHT der Ozean-Default der nur 0–2 % macht); W3 Edit berührt ~0,04 % der Cells, baut 100 %. **Reframe-Lehre:** die erste 3×3-Schatten-Messung spiegelte den Bug → zeigte „nur 2 %"; exact-Cell deckte 43–54 % auf. | Messen vor Schneiden — und mit der STRENGSTEN Definition, nicht der bequemsten |
| **V13.1** ✅ | Klassifikations-Heilung: `_atlasWaterLevelAt(x,z,terrainTopY)` ersetzt den 16-m-See-Dilatations-Bleed durch exact-Atlas + **Depth-Gate**: exact-Ozean/See (any depth) + Fluss; Atlas-Land-Rand nur wenn Terrain ≤ `WATER_RIM_BAND_M` (3.6 m ≈ 2 Cells) unter dem Nachbar-Spiegel (flacher Quantisierungs-Rand bleibt → kein Mesh-Loch; tiefer Hang = Schatten → trocken). EINE Quelle für Cell-Build + Iso-OOB (OOB-Spiegel pro Pad-Spalte gecacht). Worker-Mirror (`atlasWaterLevelAt`) mit-gewandert. **Ergebnis (diag):** tiefer Hang-Schatten **36,7→4,6 %** (Küste) / **51,7→0,1–0,3 %** (Bergsee); flacher Rand erhalten (6,7 % / 2,1 %); am Bergsee fiel die Gesamt-WATER-Zahl 10125→4753 (die Hälfte war Schatten). **Verhaltens-Wende:** ein Carve im isolierten Hochland füllt NICHT mehr mit Phantom-Wasser (war derselbe Ozean-Default-Mechanismus) — der reaktive „Pond"-Wunsch wandert in den Flood-Fill-Backlog unten. **Transient:** Iso-Mesher +~30 ms (OOB-`_voxelSurfaceY`) bis V13.2 ihn ersetzt. | Wasserschatten an Hängen/Strukturen (43–54 % → ~rim) |
| **V13.2** ✅ | Grenzflächen-Meshing: Surface-Nets-Wasser-Iso → zell-getriebene Wasser-Luft-Boundary-Quads (pro WATER-Cell ein Quad je AIR-Nachbar; `cellClass`-OOB cullt an Chunk-Grenzen → naht-frei ohne Pad+Crop). **KEIN Greedy-Merge** — per-Cell-Vertex-Dichte bleibt für V13.4-Gerstner-Wellen (Greedy-Mega-Quad hätte keine Interior-Vertices). **Ergebnis:** Build **~150 ms → 2,2–4,7 ms** (~40×), Output **~7–10k → ~447–513 Dreiecke/Chunk** (~18× = Render-Win), V13.1-OOB-Aufschlag weg. Visueller Trade: flach-facettiert statt geglättet (für stehendes Wasser identisch flach). Worker unberührt (Iso ist Main-only). | ~150 ms → ~3 ms, Streaming-Hitch, Naht |
| **V13.3** ✅ | Flow-Richtungs-Bias geheilt (Schöpfer-Hypothese, gemessen): D8-Flow wählte steilsten DROP statt steilstes GEFÄLLE → Diagonal-Bevorzugung (65 % statt 50 %) + Tie-Break-Einrichtungs-Drift (↖ 19 % statt 12,5 %) → richtungs-abhängiger Erosions-/Wasser-Grain („Treppe seit ewig"). Fix: `drop/dist` (√2 für Diagonalen) in Erosion + Hydrosphäre → ↖ 19→8,1 %, eine-Richtungs-Drift weg (Rest 4-fach-symmetrisch). Determinismus-brechend (Schöpfer „jetzt fixen"), byte-identisch reproduzierbar, Hydrosphäre intakt (8 Flüsse, 50 Seen, 4/4 Tarns). | Diagonal-Drainage-Grain in EINE Richtung |
| **V13.4** ✅ | Wasser-Glättung (Schöpfer-Audit V13.3: „würfelartige Flüsse, vertikale Wasserkante" = V13.2-Boundary-Trade): `_weldAndSmoothWater` verschweißt die Boundary-Quad-Suppe + Laplacian-Smooth (2 Iter, λ=0.5) → rundet vertikale Kanten zu weichen Ufern, glättet Würfel-Flüsse zu Kanälen; Chunk-Rand-Vertices gepinnt (kein Seam); Lake-Innenflächen bleiben flach. +~1-2 ms/Chunk (Build ~3 ms, weit unter Surface-Nets ~150 ms). Visueller Beweis = Schöpfer-Audit (headless liest keine GPU-Pixel). | Würfel-Wasser, vertikale Kanten |
| **V13.5** ✅ | **Schicht-3-Shader**: Tiefenpuffer-Uferlinie im Fragment-Shader: `waterThick = viewportLinearDepth − linearDepth(depth)` (Wasser-Dicke pro Pixel, ~0 an der Uferlinie) → weicher Schaum-Saum + Alpha-Fade („Oberflächenspannung", pro-Pixel) + Tiefen-Farbe + Emotions-Haken `uEmotion`. Drei justierbare Uniforms (shoreWidth/depthRange/emotion). (Die V13.4-Geometrie-Glättung wurde hier zunächst zu Boundary-Faces + Weld zurückgenommen — V13.6 ersetzt das durch die Iso.) | Schicht-3-Erscheinung |
| **V13.6** ✅ | **Synergie zurück: Surface-Nets-Iso wie das Terrain, band-limitiert.** Schöpfer-Audit V13.5: das V13.2-Boundary-Meshing (flache Quads) hatte die Synergie geopfert („das Terrain hat mehr Flow als das Wasser"). V13.6 holt die gemeinsame Surface-Nets-Iso zurück (`_voxelChunkGeometry` + `sampleWater`, Pad+Crop) → fließt wie der Boden, sub-zellige Uferlinie. Perf-Wurzel war die volle 124-Zellen-Säule, nicht Surface-Nets → Y-Bereich aufs globale `hydroBand` beschränkt (~28 statt 124, ~4-5×, seam-frei; `_voxelCropPad` schneidet nur X/Z) + V12.0-perf.h-Defer-Queue. `_weldWaterBoundary` (toter Code) entfernt. **(Davor der Fehl-Pfad: Höhenfeld-Sheet — vom Schöpfer gestoppt, da nicht reaktiv/zwei Skalen, V9.49-Lektion.)** Headless grün; visuelle Wahrheit (fließt es?) = Browser-Audit. | „Terrain hat mehr Flow als Wasser", Treppen/Lücken |
| **V13.7** ✅ | **Verbundenes Wasser: die Ufer-Wände weg.** Diag (`diag-water-shore.cjs`): 33 % der Wasser-Fläche waren vertikale Wände, weil das V13.1-Rim-Gate (`rim − terrainTopY <= 3,6 m`) tief-unterwasser Ufer-Spalten als „Hang" ablehnte. Fix (1 Zeile, `_atlasWaterLevelAt` main + Worker-Mirror): Gate auf `terrainTopY < rim` → fülle bis zum Body-Spiegel, jede Tiefe (tiefe Wände >3 m → 0 %; Wand-Zellen 251→88). Nutzt die Atlas-priority-flood-Konnektivität → kein Hang-Schatten (Terrain über Spiegel bleibt trocken), kein Phantom (nur neben echtem Atlas-Wasser). **Bonus: Carve nahe Quelle füllt sich reaktiv** (Welle-A-Vision realisiert). `WATER_RIM_BAND_M` (toter Code) raus. Determinismus: Wasser-Zellen ändern sich, Atlas-Hydrosphäre unberührt. Test mit-gewandert (V9.56-i): Phantom-Schutz testet jetzt quellenfreien Spot. | „Oberfläche schliesst vertikal zum Grund", Ufer-Wände |
| **V13.8** ✅ | **Echtes verbundenes Wasser: 3D-Flood-Fill.** V13.7s per-Spalten-Klassifikation war 2,5D → blutete an Bergwänden (Wand-Spalte unter hohem See-Spiegel gefüllt) + verfehlte getauchte Höhlen (Luftblasen). V13.8: `_buildVoxelChunkWaterCells` (+ Worker-Mirror) = SOLID/AIR aus Density → Architektur-Stempel VOR dem Flood (Damm blockt) → Seeds = Atlas-Wasser/Fluss (`_atlasWaterLevelAt(...,+Infinity)`, kein Rim) in-chunk + OOB-Ring → BFS durch nicht-solide Nachbarn `cy<=Body-Spiegel`. Wasser nur wo VERBUNDEN → kein Bluten, keine Luftblase, kein Hang-Schatten, kein Phantom, Carve flutet reaktiv. Diag: Wand-Zellen 88→0, Luftblasen 0, tiefe Wände 0 %; Worker-Density bit-identisch → seam-frei. Ersetzt per-Spalten-Klassifikation + airAbove-Pass; toter Code raus. C.1-Test auf Flood-Invarianten migriert. | Bergwand-Bluten, Höhlen-Luftblasen, unsauberer Carve-Fluss |
| **V13.9** ✅ | **Schicht-3-Cull `uMinDepth`** (default 0 = altes Bild): dünnes Wand-Bluten pro Pixel cullen (`alphaCulled = cond(waterThick < uMinDepth, 0, alpha)` + `alphaTest`), browser-live justierbar. Ehrlich: blickwinkel-abhängiges Pflaster, nicht die Wurzel (die heilte V13.12/.14). | dünnes Wand-Bluten (Schicht 3) |
| **V13.10** ✅ verworfen | Klettern-Cap (`waterClimbMax`): senkte Ufer-Wasser an steilen Spalten → Küstenlöcher + traf die Blasen gar nicht (höhenbasierte-Metrik-Falle). Sauber zurückgerollt. | — (Fehl-Pfad, dokumentiert) |
| **V13.11** ✅ ersetzt | Austritt-Cull (Mesher-`isSkyOpen`): subterranes Höhlen-Wasser im Mesher verdeckt (kaschieren). In V13.12 redundant (Zellen schon getrocknet) → entfernt (−17 ms/Iso). | — (kaschieren, ersetzt) |
| **V13.12** ✅ | **Vertikal-offenes Wasser** (Genre-Modell): Post-Pass pro Spalte trocknet WATER unter SOLID-Deckel → Sub-Terrain-Blasen 429→0. (In V13.14 durch die robuste 3D-Sky-Regel ersetzt, da per-Spalte die Überhang-Bucht fälschlich trocknete.) | Sub-Terrain-Blasen |
| **V13.13.0** ✅ | **Iso-Build-Speedup**: `cellClass`-OOB-Memo → Build-Zeit −61 %, Geometrie bit-identisch (kein Mesher-Wechsel). | ~80-ms-Iso-Catch-up-Hitch |
| **V13.13.1** ✅ | **scale-Stempel**: `_blockerComputePartAABB` wendet `entry.scale` an (Mesh+Kollision skalierten, der Wasser-Stempel nicht) → Stempel = Mesh deckungsgleich. | Form-Schatten an skalierten Strukturen |
| **V13.13.2** ✅ | **Iso-Mesher liest die Wahrheit statt zu raten**: der OOB-Ring las die echten Nachbar-`waterCells` statt per-Spalte neu zu klassifizieren (2,5D-Re-Guess) → Phantom-Wasser am Seam 83→0. Heilt Berg-Seam-Faces/Gebäude-unter-Wasser/Rim-Würfel an der Wurzel (V9.82 parallele Pfade). | Phantom-Wasser an Chunk-Grenzen |
| **V13.14** ✅ | **Die EINE robuste Regel: 3D-Sky-Konnektivität** (`_skyOpenWaterFilter` + Worker-Mirror) ersetzt den per-Spalten-Trocken-Pass: Wasser nur wo durch Wasser mit der offenen Atmosphäre verbunden. Synthetik: offener See bleibt, Überhang-Bucht BLEIBT (54/54 — Carve-Bug geheilt), Blase trocknet. | Überhang-Carve-Trocknung, „klettern" als Modell |
| **V13.15–.17 → V15** | Der **Wasser-Finish** wandert in einen eigenen Bogen NACH V14 (Terrain). Inhalt: die drei Render-Sync-Wurzeln (skirt-beim-Arch-Spawn / `_enqueueWaterIso` als distanz-priorisierte Queue / Stempel-AABB rotations-aware) + Berg-Innenwasser (Browser-Dump-getrieben, reproduziert sich headless NICHT — V13.0-Mess-Falle) + Sub-Region-Edit-Remesh (frame-sauberer Carve) + Browser-Audit-Schluss. Gegen die neue V14-Topologie justiert. Voller Plan: §1.1-Tabelle (V15-Zeile). | Kapillar/Schatten an Strukturen, Berg-Bluten beim Streamen, Edit-Drops, Berg-Innenwasser |
| **V13.x (Backlog)** | (a) **Dynamisches Equilibrium statt statischem Fill** (falls Browser-Audit ein Über-Füllen langer Abfluss-Kanäle zeigt). (b) **Globaler statt per-Chunk-Flood** (falls exotische Schleifen-Topologie seamt; auch der Sky-Open-Filter ist per-Chunk). (c) **Volle Flow-Isotropie via MFD/D∞** (V13.3-Rest-Achsen-Präferenz 33/67). (d) **Schicht-3-Browser-Politur**: `uMinDepth`-Schwelle, tiefes Wasser an Strukturen (Turm/Tor), LOD-Cross-Fade. | Kanal-Über-Füllung, Schleifen-Seam, Achsen-Grid-Grain, Render-Politur |

**Riesen-Lehre verdrahtet (V13.6-Korrektur):** Voxel-Wasser ist nicht das Problem, und der Surface-Nets-Mesher war es auch NICHT — er ist die Synergie-Quelle (Wasser fließt wie das Terrain, weil es denselben Mesher teilt). Das Problem war (a) der Klassifikator („unter Pegel" statt Atlas-strict, V13.1 fix) und (b) die volle 124-Zellen-Säule (V13.6 band-limitiert sie). Mein V13.2-Schluss „Surface-Nets ist falsch, nimm Boundary-Faces" war eine **Perf-Optimierung, die die Vision-Synergie wegoptimierte** — ein verkleideter Rückschritt, vom Schöpfer-Audit gefangen. Flache Planes/Sheets sind erst recht Rückschritt (nicht reaktiv, zwei Skalen — V9.49-Lektion). **Disziplin: erst messen/im-Code-verifizieren, dann pronouncieren; und eine Optimierung an einer Vision-Qualität messen, nicht nur an ms.**

---

## 1.5 V14 — Die wahre Tiefe des Geländes (epische Geomorphologie)

**Schöpfer-Auftrag (30.05.2026, Browser):** „die karte scheint noch steil, berge bilden sich nicht über lange strecken, sondern sind stark erodiert, werden sehr spitzig und steil, noch kein langsam aufbauendes gebiet, anden, mounteverestmässig, riesig über weite distanzen, lange grosse flüsse, noch kein riesigen felder und epische gegenden … wir wollen genial, alles in den schatten stellen … wie unrealengine, dune … effizient, stabil, simpel, fraktale tiefe, heuristik." Schöpfer-Wahl: **erst das Terrain in die wahre Tiefe, im Anschluss der Wasser-Finish (V15).**

**Die ehrliche Wurzel (empirisch gemessen + im Code verifiziert, nicht spekuliert):** Episches Terrain war NIE ein eigenes Vision-Ziel — das Relief wuchs als NEBENPRODUKT der Wasser-Arbeit (V9.45 Domain-Warp, V9.47 Erosion FÜR die Drainage, V9.58 nur die HÖHE 60→118 m). Der Befund „zu wenig weit, nicht über weite Phasen aufbauend" steht wörtlich seit Phase 0 (§1.1) — die Höhe wurde geheilt, die CHARAKTERISTIK nie. Drei im Code verifizierte Fehler:

1. **Die dominante Gebirgs-Frequenz ist λ≈77 m (Alpen-Miniatur-Maßstab).** Die ridged-Oktave `ranges` (`_terrainMacroSurfaceY`, freq 0.013, Amp 12–67 m) trägt das Hauptrelief; `ranges2` λ≈38 m doppelt es. Echte Gebirgszüge (Anden, 500+ km) brauchen λ ≫ 10 000 m. Wir bauen ein Hochgebirge im 1:20-Maßstab: Amplituden fast realistisch (67 m), Wellenlängen Größenordnungen zu klein → steil, zackig, ohne lange Vorstufen. **Es fehlt die niederfrequente kontinentale Basis** (λ ~5–20 km, Amp ~150–400 m), die breite Becken + Hochland-Sockel formt, auf denen die Gipfel sitzen. Die vorhandene `tect`-Oktave ist zu schwach (±35 m) + zu kurzwellig (λ 1136 m — der Code-Kommentar „λ~7150 m" ist FALSCH, nach einem Frequenz-Bump nie aktualisiert).
2. **Die ridged-Formel `(1−|N|)²` erzeugt Cusps (Kanten), nicht runde Rampen** → bei 67 m über 38 m Distanz ≈ 60°-Wände. Plus `mtn=(1−ero)²` ist quadratisch → die meisten Flächen flach (mtn≈0,1), wenige Spots Vollgebirge mit voller Amplitude OHNE Basis-Rampe → vereinzelte Zacken statt durchgehender Ketten.
3. **Keine thermische Erosion.** `_computeErosion` ist NUR Stream-Power-Inzision (Täler bis 18 m tiefer via `maxDelta`, Grate via `channelMinArea=14` geschützt) → sie SCHÄRFT den Kontrast (Täler tief, Gipfel scharf). Es fehlt der Angle-of-Repose-/Talus-Pass, der Hänge über dem Ruhewinkel abträgt + im Tal deponiert (World Machine/Gaea „thermal weathering"). Plus: `terrainSteepness` ist ein TOTER Parameter (gespeichert, in Welt-Fusionen geblendet, aber nie in eine Noise-/Density-Rechnung multipliziert — ein Relikt der Heightfield-Ära).

**Empirie (`diag-relief`, 4000 Samples / 2048² Region, 30.05.2026):** Höhen-Histogramm stark rechtsschief (~80 % zwischen −10 m und +40 m, Berge >80 m nur ~1 %); Uferlinien-Index **47** (gesund: Kreis ~3,5, Buchten >5, fraktale Küste >7) → mikro-zerfranst; 50 Seen, viele 6–12 Zellen klein; Land-Marge +21 m, lange Flüsse 4 (✓). Das ist „spitz, isoliert, fragmentiert" in harten Zahlen — die Höhe IST da (Max 118 m), die VERTEILUNG ist dünne Spitzen statt breiter Massive.

**Die fraktale Verbindung (warum dieser Bogen VOR dem Wasser-Finish kommt):** Das Terrain-Problem und das Wasser-Problem sind DASSELBE Problem an zwei Enden. Der zerklüftete λ≈77-m-Mikro-Maßstab erzeugt BEIDES — die spitzen Berge UND die fragmentierte Hydrologie (jedes Mikro-Relief staut ein Fitzel-Becken → 50 winzige Seen, Uferlinien-Index 47, ein kapillarer Wasser-Rand an jeder zerfransten Kante, in den dann Strukturen gebaut werden). **Wasser ist der Spiegel des Terrains.** Eine kontinentale Basis + lineare Uplift-Maske gäbe von SELBST: große kohärente Seen statt 50 Fitzel, lange Flüsse durch breite Täler, glatte Küsten (Index → <10), weniger Struktur-Wasser-Konflikte (Bauten auf breitem Land statt in zerfransten Rändern). EINE Maßstab-Korrektur heilt beide Symptom-Familien an der Wurzel. Darum: erst das Fundament (V14), dann der Wasser-Finish gegen die NEUE Topologie (V15).

**Profi-Pattern (die Riesen, ehrlich getrennt):** Die Welt-FORM „in den Schatten stellen" ist Worldgen-MATHEMATIK, kein Hardware-Problem — Nanite/Lumen (UE) sind eine andere Achse (GPU-Geometrie-Streaming, RT-GI; 119 FPS auf WebGPU steht schon). Die Maßstab-Hierarchie der Profis (World Machine, Gaea, Houdini-Terrain): (a) **kontinentale Basis** — eine sehr niederfrequente Oktave macht Becken + Hochländer; (b) **gerichtete Uplift-Maske** statt isotropes Mountain-Noise — echte Gebirge folgen Plattengrenzen, eine Linie/Kurve aus dem Seed gibt lange Ketten statt verstreute Zacken (tektonische Uplift / Fastscape-Vorbild); (c) **thermische + hydraulische Erosion ko-evolvieren** — thermisch glättet, hydraulisch carvt; (d) **Domain-Warp auf der GROSSEN Skala** für mäandernde Ketten + Täler. Leitsatz: „erst die große Form, dann die Verzierung" — die DOMINANTE Skala muss die GRÖSSTE sein; bei uns ist sie heute die kleinste.

**Der Bogen (sauber sequenziell, jede Welle = ein Commit + Chronik-Eintrag + Playtest grün). Determinismus-Bruch ist GEWOLLT + Schöpfer-bestätigt — jede Welle ändert das Welt-Aussehen (wie V13.3 Flow-Bias):**

| Welle | Was | Heilt |
|---|---|---|
| **V14.0** ✅ | Geomorphologie-Diagnose: `diag-relief` um ZIEL-Metriken erweitert (Hochland-Plateau-Anteil, Hang-Neigungs-Verteilung, Gebirgsketten-Kohärenz/Längen, Becken-Größen-Histogramm) + ein robuster Berg-Überblick-Screenshot (Spieler-Body-Teleport zum höchsten Spot, Streaming-Pump, Schräg-Sicht + Top-Down). Die Akzeptanz wird die Metrik, nicht die Demo (V13.0-/V9.58-Disziplin: messen vor schneiden, strengste Definition). | Mess-Falle (Spawn ≠ Berg); Akzeptanz definieren |
| **V14.1** ✅ | **Kontinentale Basis-Oktave** `cont0` (λ~7100 m, asymmetrisch `max(0,cBase)·130 + cBase·15` — hebt bis +145 m, senkt nur bis −15 m) in `_terrainMacroSurfaceY` + Worker-Mirror bit-identisch. **Ergebnis (gemessen):** Fluss-Längen median 128→1152 m (lange Drainage!), Land-Marge +15,5 m, Surface-Max nur 110 m → **KEINE Hülle nötig, null Performance-Kosten**. Messfalle gefangen: symmetrischer Erstwurf ertränkte 46 % → asymmetrisch geheilt. **Empirie-Erkenntnis: die Basis heilt die STEILHEIT NICHT** (Median 36°, steil 29 %, Feature 112 m unverändert) → V14.2 vorgezogen. | „keine weiten Phasen", kurze Flüsse ✓; Steilheit offen |
| **V14.2** ✅ | **Thermische Erosion (Angle-of-Repose)** — Talus-Pass `_thermalErosionPass` (Musgrave, mass-conserving, separater Akkumulator = deterministisch, main-only → Worker erbt das Delta als Daten) ko-evolviert mit der Inzision, `talusAngle=25°`. **Ergebnis (gemessen): steil (>45°) 29 %→13 %, Median 36°→29°, Feature 112→160 m** — Berge/Land/lange Flüsse erhalten, keine Hülle. `maxDelta` 18→26, `TARN.depthMin` 28→34 (V9.51-Co-Tuning). 3 Invarianten mit-gewandert (V9.56-i: Talus deponiert + glättet flächig). **Rest: Median 29° = die `ranges`-λ77-m-Cusps unter dem 16-m-Grid → V14.4.** | 60°-Wände halbiert (Hauptbefund); Rest-Steilheit → V14.4 |
| **V14.3** ✅ | **Regionale Terrain-Typ-Differenzierung (Multi-Noise)** — VORGEZOGEN (Schöpfer-Browser-Audit „uniform alpin, nicht abwechslungsreich wie die erde" — die tiefere Wurzel als Steilheit). Die `ero`/`mtn`-Ruggedness-Maske großräumig (λ714 m→**λ2000 m**, ~46 Chunks) + `ridgeAmp` 12+55·mtn → **5+62·mtn** (Ebenen flach Amp 5, Gebirge schroff 67) + `cont0`+12-Offset (Land-Marge erhalten). **Ergebnis: steil 13 %→6,7 %, Median 29°→25,8°, Plateau 3,5 %→4,9 %, Hochland-Kohäsion →0,72, breite Höhen-Verteilung** (Ebenen + Gebirge). Trade-off: Flüsse kürzer (4 lange bleiben) + Feature 128 m → V14.4. 3 Carve/Damm-Tests auf Flach-Spot-Suche mit-gewandert (V9.56-i). | uniform-alpin → Vielfalt |
| **V14.4** ✅ | **Browser-Audit-Folge: echte Ebenen + See-Oberflächen-Queue.** (a) `mtn` moduliert jetzt ALLE Relief-Oktaven (`cont`=noise·(8+28·mtn), `detail`=noise·(1+3·mtn)) statt nur `ridgeAmp` → **sanft 10 %→24,1 %, Median 25,8°→18,7°, Plateau 4,9 %→11,2 %, lange Flüsse 4→9** (echte ebene Bereiche + Hochebenen). (b) `_tickPendingWaterIso` nach Spieler-Distanz priorisiert + ferne verworfen + Rate 2→4 → Seen verlieren nicht mehr „nach einer Weile" ihr Iso-Mesh. (c) Chunknähte sehr selten unsauber — niedrige Prio, benannt. | „keine ebenen bereiche"; See-Oberfläche verschwindet |
| **V14.5** ✅ | **Harmonie-Heilung: Wurm-Höhlen-Decke nachgezogen.** Schöpfer-Befund (Browser): chunkfehler / löcher / höhenversetzt / wasser-unter-oberfläche. Wurzel GEMESSEN (`diag-harmony`/`diag-ceiling`): Decke ✓, Worker ✓ — aber die Höhlen-Decke (`surf−6`) lag in der flachen V14-Welt (surf ~12 m) unter der roughness-variablen Oberfläche → Durchbrüche (2/25). Heilung: `surf−6` → `surf−16` (bit-identisch im Worker) → Durchbrüche 0/25. **Permanente Lehre: surf-relative Schichten (Höhlen, Wasser-Band, Tarn) co-tunen, wenn die Terrain-Skala sich ändert.** | Löcher, höhenversetzt, Wasser-unter-Oberfläche |
| **V14.6** ✅ | **Fern-Heilung: Voxel-Decke + stale GPU-Mirror an die hohe cont0-Welt nachgezogen.** Schöpfer-Befund (Browser): „chunks fehlerhaft, nach einiger Zeit in EINE RICHTUNG zerfällt die Welt". Wurzel GEMESSEN (`diag-radius.cjs`, radial ±5 km — NICHT das ±1100-m-Spawn-Fenster): cont0 (λ7100 m) hebt die Surface fern bis 235 m über die `base+133`-Decke → Löcher, Anteil wächst mit Distanz (0 %@spawn → 18 %@4,5 km). Heilung: dimY 124→136 (Decke +22 m) + tanh-Soft-Clamp (>110 m → asympt. 136 m, 0 Verletzungen alle Radien) + GPU-Density-Stufe-2 abgeklemmt (stale WGSL ohne cont0, V9.82). **Permanente Lehre: Höhen-Änderung → DECKE + ALLE Density-Mirror (Worker+GPU) nachziehen; Decken-Diagnose radial > λ_cont0.** | Fern-Löcher, höhenversetzte Nähte (in eine Richtung) |
| **V14.7** ✅ | **Maßstab-Streckung**: eine GLATTE asymmetrische Hub-Oktave `upland = max(0, noise2D(λ~2860))·95` macht die DOMINANTE Skala die GRÖSSTE (Feature-Größe **176→464 m kontinental**) + `cont`/`ranges`/`ranges2` gestreckt + `ridgeAmp` 62→38 gedämpft; `terrainSteepness` VERDRAHTET (×ridgeAmp, Main+Worker, Default 1 = identisch); tect-Kommentar-Lüge geheilt. Gemessen: steil 4,4→0 %, Kohäsion 0,67→0,95, Plateau →14,8 %, 12 lange Flüsse, Hülle bei ±5 km sicher (`diag-radius`). Foundation/Carve/Fill-Tests auf surf-relativ migriert (V9.56-i). **Lehre: corrLen ∝ Wellenlänge (nicht Amplitude — symmetrisch flutet, patchig dominiert nicht). Trade-off: Median-Surface ~20→50 m (Hochplateau-Welt).** | Mikro-Cusps (λ77 m), kleine Feature-Größe |
| **V14.8** ✅ | **Gerichtete Uplift-Maske (Anden-Ketten)**: der Höhen-Hub wird RIDGED `(1−|noise|)²` bei λ3570 + eine Flow-Warp (λ5000, ±300) → lineare, gekrümmte Gebirgs-Ketten entlang der Noise-Nullfläche statt isotroper Blobs. **Ketten-Elongation 1,82→2,28** (neue diag-relief-Metrik: Connected-Component-Elongation), Median-Surface 50→39 m (mehr Tieftal-Kontrast). **Trade-off (ehrlich): isotrope corrLen 464→336 (Anisotropie-Artefakt — Ketten quer dünn), Plateau 14,8→9,8 %.** Test-Mitwanderung: Tarn-See-Schwelle 0,7→0,6, Damm-Test sucht Ufer-Spot mit Wasser. **Lehre: eine Oktave ist ridged ODER broad — Ketten UND Plateaus brauchen REGIONALE Differenzierung (V14.9-Refinement).** | „spitzig isoliert" statt langer Ketten |
| **V14.9** ✅ | **Regionale Differenzierung (Bogen-Schluss)**: zwei unabhängige große-λ Masken — Relief (λ5300, Tiefland/Felder/Meere vs Hochland) + Stil (λ4500, Plateau `broad` vs Kette `ridged`) → DREI Region-Typen, die Welt hat ALLES (Ebene 18 / Plateau 10 / Kette 8, Ozean 18 %, Median 20 m), abwechslungsreich + STABIL (km-kohärente Regionen). Neue Regional-Vielfalt-Metrik in diag-relief. **Lehre: „eine Welt mit allem" = REGIONALE Differenzierung; miss die Vielfalt über eine Fläche breiter als die Region-λ.** Browser-Audit = finale Bestätigung, dann V15. | repetitiv/uniform → abwechslungsreich, stabile Bereiche |

**Risiken ehrlich:**
- **Determinismus-Bruch pro Welle** (jede Octave-/Erosions-Änderung re-erodiert die Welt). Gewollt + Schöpfer-bestätigt. Die Determinismus-INVARIANTE (selber Seed → bit-identisch über Re-Build) bleibt grün — sie prüft Reproduzierbarkeit, nicht Konstanz über Versionen.
- **Worker-Mirror-Pflicht** (V9.89): jede `_terrainMacroSurfaceY`-/`_terrainBaseDensityAt`-/`_computeErosion`-Änderung MUSS bit-identisch in `voxel-worker.js` mit-wandern, sonst Chunk-Naht-Bruch (Worker baut LOD-Meshes, Main baut Sync-Mesh — Drift = sichtbare Naht). Determinismus-Test ist die Wand.
- **Decken-Marge** (V9.58/V9.26/V14.6): höhere Amplituden brauchen evtl. eine größere Voxel-Hülle (`dimY`/`floorDrop`) ODER einen tieferen Soft-Clamp. **V14.6-Stand**: Decke `base+155 m` (dimY 136), Surface durch tanh-Clamp asymptotisch ≤ 136 m → garantiert unter der Decke bei JEDER Distanz. Vor jeder Amplituden-Erhöhung `diag-radius.cjs` laufen (radial bis ±5 km, NICHT das ±1100-m-Spawn-Fenster — cont0-λ ist 7100 m!) + den Clamp-Asymptoten ggf. nachziehen.
- **Performance**: thermische Erosion ist iterativ (wie Stream-Power, 36 Iter über 128² Grid). Im Worldgen-Budget messen (V9.58-Empirie-Disziplin) — Worldgen läuft einmal, ist aber spürbar.
- **Hydrosphäre-Kopplung**: das neue Relief ändert Drainage/Seen/Tarns. Die Hydrosphäre läuft NACH der Erosion (V9.47-Ordnung) → sie sieht das neue Terrain automatisch. Tarn-Adaptiv-Gates (V9.51, 62. Perzentil) skalieren mit; absolute Konstanten ggf. nachziehen.

**Vision-Pfeiler-Check:** §1.3 fraktal (die Maßstab-Hierarchie IST fraktale Tiefe — jede Skala addiert, die dominante ist die größte) · Heilige Lektion (Octaves + ein Erosions-Pass, KEINE Fluid-/Plattentektonik-Sim — deterministisch, gut fundiert, EIN Wachstumsring auf dem Worldgen-Stamm) · „messen vor schneiden" (V14.0 zuerst, V9.58-Empirie-Disziplin: Theorie lügt, Empirie entscheidet).

---

## 1.2 V11 — Mesh-Pool-Pattern (✅ in V12.0-d auf r184 reaktiviert, 28.05.2026)

> **Stand**: V11.0-a/b/c/d gebaut + V11.0-d.fix.gras-Bogen scheiterte am v160-Vendor-Bug → V11.0-d.fix.gras3 klemmte den Pool temporär ab (V10.0-j.j-Memory-Trade zurück). **V12.0-d hat den Pool auf r184 reaktiviert** — Bind-Group-Layout-Cache + compileAsync-non-blocking heilen den v160-stale-Buffer-Race strukturell, echtes zero-copy-Recycling, V10.0-j.j-Memory-Trade obsolet (~500 KB GPU-Heap/Welt-Wechsel gespart). Sektion bleibt als historische Dokumentation der V11-Bogen-Vision + Lehre.

### Historische Vision (Schöpfer-Korrektur 27.05.2026)

Nach V11.0-d.3 + Schöpfer-Browser-Bestätigung „schwimmen sehe ich" + initialer Plan-Wende („v11 der weg, die wahre vision, die vollendung, keine halben sachen") schlug ich zunächst einen integrierten D/E/F/G-Pfeiler-Bogen vor — eine Welt-Atem-Vision in fünf additiven Wachstumsringen.

**Der Schöpfer hat korrigiert (ehrlich + scharf):**

> **„dachte mehr an den wahren plan auf der roadmap, scheinst das komplexeste zu weichen, obwohl es essentiell ist, du dies doch bei initialisierung selbst als 1stes erwähnt: V11 Mesh-Pool-Pattern (~6-8h, der ehrliche Bogen-Schluss) — Genshin's instancing-system, BotW's geometry-recycling als echtes Refactor. Disposed Gras-Meshes recyceln statt im Heap halten. V10.0-j.j-Memory-Cost strukturell heilen. Substantiell aber klar — Pattern existiert in der Industrie."**

**Der wahre V11 ist Mesh-Pool-Pattern.** Meine erste Session-Antwort heute hatte das als Option 1 vorgeschlagen. Der Schöpfer wählte „weiter gehts" — ich griff aber zu Pfeiler D (sich-schneller-anfühlende Feature-Welle) statt zur strukturellen Schuld-Heilung. Bürokraten-Sünde: technische Schuld umgehen + neue Features bauen.

### Die Wurzel (V10.0-j.j-Workaround, ehrlich markiert)

V10.0-j.j sagte EXPLIZIT „ein ehrlicher Workaround, kein Endzustand":

- `_disposeVoxelChunkGrass(chunk)` macht `scene.remove(grass)` aber NICHT `geometry.dispose()`.
- Wurzel: Three.js-v160-WebGPU-Buffer-Lifecycle-Race. `geometry.dispose()` SOFORT (`WebGPUAttributeUtils.destroyAttribute` Z168), aber `renderer.render()` ist async — pending Submits referenzieren den destroyed Buffer → Crash.
- Memory-Trade akzeptiert: ~500 KB GPU-Heap pro Welt-Lifetime. Mit Streaming-Welt linear-wachsend (unbegrenzt).
- V10.0-Lehre permanent verdrahtet: „Mesh-Memory > Race-Crashes — wenn ein Vendor-Race nach 5+ Sub-Wellen nicht heilbar ist, ist Memory-Trade die ehrliche Profi-Antwort".
- ABER: das war Workaround-Disziplin, NICHT Vollendungs-Disziplin. Der ehrliche Bogen-Schluss ist Mesh-Pool.

### Profi-Pattern Genshin/BotW: dispose nie, recycle immer

- **Genshin Instancing-System**: tausende von Gras-Halmen pro Chunk in einer InstancedMesh, beim Chunk-Despawn wird die InstancedMesh nicht zerstört, sondern in einen zentralen Pool zurück. Neuer Chunk: Pool gibt eine ungenutzte InstancedMesh, die Position/Rotation/Count werden neu beschrieben.
- **BotW Geometry-Recycling**: identisches Pattern, mit Pool-Cap (~32 Meshes) + LRU-Discard bei Überlauf (auf weit-weg-gereiste Spieler trifft das selten, aber bounded).
- **Was wir bekommen**: Memory bounded statt linear-wachsend, kein Race-Crash (nichts wird disposed, nichts kann racen), bit-identische visuelle Qualität (gleiche Geometry, gleiches Material, neue Instance-Data).

### Sub-Wellen-Plan (~6-8h, jede Sub-Welle ein git-Commit + Chronik-Eintrag)

| Sub-Welle | Was | Aufwand | Akzeptanz |
|---|---|---|---|
| **V11.0-a** | Pool-Foundation. `state._grassMeshPool` als Array (InstancedMesh-Objekte). API: `_acquireGrassMesh(maxBlades)` → returns pooled-or-new + cleared instanceMatrix; `_releaseGrassMesh(mesh)` → mesh.visible=false + scene.remove + push pool. Pool-Cap = `GRASS_POOL_CAP = 32` mit LRU-Discard wenn voll (oldest pop + echtes dispose). | ~1.5h | API existiert, acquire/release/acquire returnt das gleiche Mesh (Pool-Identity-Beweis). Test-Band: 50 acquire/release-Zyklen, Pool-Größe konvergiert zu 1 (single-use-pattern). |
| **V11.0-b** | Build-Pfad recycle-aware. `_buildVoxelChunkGrass(chunk)` ruft `_acquireGrassMesh` statt `new InstancedMesh`. Geometry-Reuse: Singleton `state._grassConeGeometry` bleibt (V10.0-j.j-Pattern korrekt). InstanceMatrix.array wird neu beschrieben + needsUpdate=true. | ~1.5h | Visuelle Identität bit-identisch (gleiche Anzahl Halme, gleiche Positionen, gleiche Farben). Source-Probe: `_buildVoxelChunkGrass.toString()` enthält `_acquireGrassMesh`, NICHT `new THREE.InstancedMesh`. |
| **V11.0-c** | Dispose-Pfad recycle-aware. `_disposeVoxelChunkGrass(chunk)` ruft `_releaseGrassMesh`. V10.0-j.j-Memory-Workaround entfernt (Geometry darf wieder disposed werden NUR beim Pool-LRU-Discard, weil Mesh sonst im Pool ist + kein late-writeBuffer mehr). Defensive: bei Welt-Wechsel `_drainGrassMeshPool` räumt komplett. | ~1h | Pool-Identity beim normalen Despawn (mesh im Pool wiederfindbar). Welt-Wechsel räumt Pool vollständig. |
| **V11.0-d** | Test-Band + Memory-Beweis. 50 spawn+despawn-Zyklen (`_buildVoxelChunkGrass`/`_disposeVoxelChunkGrass`), Pool-Größe stabil bei ≤ Cap. `performance.memory.usedJSHeapSize`-Delta unter Toleranz (kein Wachstum). Stress-Test: simuliere Spieler-Teleport-Loop. | ~1h | Pool stagniert, kein Memory-Snowball, alle Source-Probes für Build/Dispose-Recycling. |
| **V11.0-e** | Schöpfer-Browser-Audit auf AMD RDNA-3. 10-min Welt-Reise, Memory-Tab des Browsers prüfen, FPS-Verlauf. Welt visuell identisch zu V10.0-j.j, kein Race-Crash, kein Memory-Snowball. | ~30min | Bogen offiziell zu. V10.0-Lehre „Mesh-Memory > Race-Crashes" wird zu „Mesh-Pool > Mesh-Memory" — ehrlicher Vollendungs-Schluss. |

### Disziplin (V9.56-Bogen-Lehre angewandt)

- Jede Sub-Welle: klein + fokussiert (≤ ~1.5h), playtest-grün vor dem Commit
- Playtest-Invariante VOR dem Schnitt (Test ist die Akzeptanz, nicht die Demo)
- Browser-Audit am Bogen-Schluss (V11.0-e), nicht in der Mitte
- Jede Sub-Welle ein git-Commit + Chronik-Eintrag oben in `handover.md`
- V10.0-j.j-Workaround-Markierungen im Code (Kommentare „V10.0-j.j Memory-Trade") werden in V11.0-c entfernt + durch V11.0-Recycling-Doku ersetzt

### Reflexions-Lehre verdrahtet (für nächste Sessions, permanent)

**Bei „weiter gehts" nach mehreren angebotenen Optionen die Reihenfolge der EIGENEN Vorschläge ernst nehmen.** Option 1 war meistens der ehrlichste Plan, bevor die Versuchung kommt, ihn zu weichen (zur Feature-Welle, zur Spektakel-Welle, zum sich-schneller-anfühlenden Pfad). Wenn der Schöpfer nicht aktiv eine andere Option nennt, ist Option 1 die Wahl — sie war meine ehrliche Antwort auf seine Frage „wohin?".

**D/E/F/G-Vision-Pfeiler kommen NACH V11-Fundament-Schliff** (V9.51-Disziplin: Vision-Wellen nach Fundament-Schliff, nicht zwischenein). V12+ wird die System-Kopplungs-Vollendung — aber erst wenn V10.0-j.j-Workaround ehrlich entfernt ist.

**Nächster Schritt: V11.0-a starten** (Pool-Foundation, ~1.5h). Kein weiterer Plan-Reflexions-Schritt nötig — der Plan ist klar.

---

## 2. Pfad-D Übersicht (Ringe 0-11+)

| Ring | Pfeiler | Status | Aufwand | Vorbed. |
|---|---|---|---|---|
| 0 | Stabiles Fundament (Bewegung, Physik, Chunks, Save, CI) | ✅ erledigt | – | – |
| 1 | Grok-Stimme (`dialogue-box`, narrative Reflexion) | ✅ V1 live | – | – |
| 2 | DSL als gemeinsame Sprache | ✅ Phase 1-7 vollständig | – | – |
| 3 | Player-Emotionen → Welt | ✅ V1+V2 live | – | – |
| 4 | `anazhSymphony` V1 (Web Audio) | ✅ V1 live | – | – |
| UI | Bedien-Oberfläche (Painterly) | ✅ V1+V2 live, V3 optional | 2-3 h Rest | – |
| 5 | `createPlayerSoul` (Mensch/Phönix/Drache) | ✅ V1+V2 live | – | – |
| 6 | `architectureTemplates` V1+V2 (Bauplan-Universum mit Hotbar + Werkstatt) | ✅ V1+V2 live | – | Ring 2 Phase 3 |
| 7 | **IQ-Schicht statt brain.js** (lernt aus Verhalten + Emotion + 4 LLM-Provider) | ✅ Schicht 1+2 live | – | Ring 3 + Ring 2 Phase 3 |
| W1 | **Welt-Journal + LLM-Selbstwissen** (Welt erinnert, weiß wer sie ist) | ✅ live | – | Ring 7 |
| W2 | **Schöpfer-Ops + Fraktale Baupläne** (define_blueprint/ability, blueprint-Refs) | ✅ live | – | Ring 6.6 |
| W3 | **Welt-Initiative + Welt-Tor** (Grok V2-Trigger, Welt-Info, Teilen/Empfangen) | ✅ live | – | W1 |
| W4 | **Hylomorphismus atomar** — Materialien + Aktivierungs-Matrix + Werkzeuge | ✅ P1+P2+P3 live | – | Ring 6 + Ring 7 |
| W5 | **Hylomorphismus räumlich + mechanisch + rekursiv** — Verbindungen (§5.1) + 5 räumliche Prinzipien (§5.2) + Bauplan-als-Werkzeug (§4.3) | ✅ A+B+C live | – | W4 |
| 8 | Welt-Identität als Multi-Welt-Verwaltung (mehrere worldIds parallel) | ✅ **8 + 8.1 + 8.2 live** — Welt-Index + Per-Welt-Save + Switch/Create/Delete + Person-Übernahme + Per-Welt-Seed + Spieler-Position-Restore + Status-Bar-Welt | – | W3 |
| 9 | Welt-Export/Import (erweitert) — Drei-Wahl Ersetzen/Daneben/Fusionieren | ✅ **live** — `<dialog>` mit drei Aktionen, `importWorldBeside` mit parentWorlds-Spur + Slug-Kollisions-Auflösung + Witness-Journal, Fusion-Button disabled bis Ring 10 | – | Ring 8 |
| 10 | Welt-Fusion + Cascade-Rewire (zwei DSL-Programm-Sets mergen mit parentWorlds) | ✅ **live** — drei Strategien (sequence/random-mix/tag-merge), 2-Spalten-Dialog, Stammbaum mit klickbaren Eltern-Welt-Links, Cascade-Bugfix (sourceBlueprint + refName folgen Rename), Schema 10.0-fusion-v1 | – | Ring 9 |
| 10.1 | Rezepte aus anderer Welt holen (ohne Fusion) | ✅ **live** — `importRecipesFromWorld(srcId)`, 1:1-Inhalt, `-import`-Suffix bei Kollision, Cascade-Rewire wie Fusion, „Rezepte holen"-Button pro Welt-Picker-Reihe | – | Ring 10 |
| 10.5 | Welt-Modifizierbarkeit (pro-Chunk DSL-Delta) | ✅ **live** — V9.36 ersetzte die Heightfield-Schicht (`state.worldMeta.chunkDeltas` + `modify_terrain` + 6 Helpers + FIFO-Cap, ~289 Z. weg) durch zwei broadcastable DSL-Ops `voxel_carve(x, y, z, r)` + `voxel_fill(x, y, z, r)` im 3D-Voxel-Feld (V9.14/V9.15-Mechanik). Chat `grabe loch`/`hebe hügel` umgeroutet, CREATURE_PROPOSED_OPS-Whitelist trägt die Voxel-Ops, alte `chunkDeltas`-Saves defensiv ignoriert (kein Migrations-Pfad — Heightfield-Höhen-Deltas haben in einer Voxel-Welt keinen Sinn). Vision (Welt-Mod überlebt Reload, multi-user-synchron) unverändert, Schicht radikal verschlankt. | – | Ring 10 |
| 11 V1 | Multi-User Position-Sync via WebSocket-Broker | ✅ **live** — `signaling-server.js` (RFC-6455 von Hand, zero deps), `state.p2p` mit peers-Map, 30 Hz pos-Broadcast, Remote-Peer-Avatare als Cone+Sphere-Group (HSL-Hash aus peerId), UI-Toggle in Einstellungen, CSP um ws:// erweitert, Sandbox-Grenze (KEIN p2p-DSL-Op) — KEIN DSL-Sync | – | Ring 10.5 |
| 11 V2 | DSL-AST-Broadcast für Welt-Synchronisation | ✅ **live** — Chat-DSL eines Spielers wird via `p2pBroadcastDsl(program)` an alle Mitspieler gesendet, jeder Empfänger ruft `dslRun(program, {source: "remote:<peerId>"})` auf. Drei Loop-Schutz-Schichten (source-Check, peerId-Filter, Server-except-Sender). LLM-/Nexus-DSL bleibt lokal. V9.36: voxel_carve + voxel_fill + weather + spawn_creature synchronisieren beide Welten. | – | Ring 11 V1 |
| 11 V2.1 | LAN-Fähigkeit + Sync-Korrektheit (Bug-Fixes) | ✅ **live** — signaling-server bind 0.0.0.0 (LAN reachable, LAN-IPs werden geloggt), CSP `connect-src ws: wss:` allgemein (statt enge IP-Whitelist), `state.p2p.roomOverride` für ad-hoc-Räume, spawn_*-Chat-Patterns embedden Position+Seed bei Build-Zeit (Empfänger spawnt am SENDER-Ort, gleicher Seed → gleiche Geometrie), `NON_BROADCASTABLE_OPS`-Set für Spieler-private Ops (player_jump_power, player_speed, player_size_mul, player_soul, set_visible werden NIE gesendet) | – | Ring 11 V2 |
| 11.5 | Intuitiver Multi-User-Setup (Modus-Wahl + Einladungs-Code) | ✅ **live** — Neue-Welt-Dialog mit Modus (Allein/Mit-anderen) + Rolle (Host/Joinen). Host: Banner mit `anazh://lan-ip:port/worldId` + Copy-Button, Auto-P2P-Start nach Reload. Join: temp-WS sendet `world-request` → empfängt `world-snapshot` vom Host → `_importGuestWorld` schreibt Welt unter host-worldId mit `role:"guest"`+`hostInfo`, Auto-P2P-Start nach Reload. Server: targeted-delivery via `{to: peerId}`, LAN-Adressen im welcome, Frame-Cap 1 MiB. Schema `11.5-multiuser-v1`. | – | Ring 11 V2.1 |
| W6 | **Crafting-Polish + UX + Stats + Welt-Sinne + Kreaturen-Aufträge** — acht Sub-Blöcke (A–H) | ✅ **Welle 6.A/B/C/D/E/F(1-2)/G(1-4)/H V2 live**, 6.G Phase-3-Rest (Höhlen/Tunnel/Überhänge) im Voxel-Bogen ab V9.07 aufgelöst (siehe §3 Detail-Sektion); 6.F3 (Maschinen-Antrieb) + 6.F5 (echte Ammo-Constraints) nie gebaut — siehe §1 „Crafting-Tiefe" | 22-28 Sessions verteilt, ~26 abgeschlossen | W5 + Rings 8-11.5 |
| W9 | **Werkzeug-Domains + Welt-Werkstätten + emergente Bauplan-Rolle** (B+C Hybrid) | ✅ **9a-d live (V8.07)** — 6 TOOL_DOMAINS, 5 neue Domain-Werkzeuge, 5 Workshop-Station-Bauplane, Maschinen-Bonus, Seelen-Bauplane | – | W4 + W5 |
| W10 | **Präzision-Multiplikator + Compound-Tag-Affordances** | ✅ **10a + 10b.1-3 live (V8.07)** — Präzision moduliert Stat-Pipe pro Quelle, Affordances als Welt-Schicht (moveable/magnifying/focusing) mit räumlicher Analyse + Tag-Sprache (kein Form-Whitelist). Drei Welt-Reaktionen: E-Mount, Z-Zoom, Sunny-Brennglas-Ignite | – | W9 |
| W10 ext. | **Weitere Affordances** — balancing/broadcasting/lifting/radiating als kleine Erweiterungen | ✅ **vollständig (V8.97-V9.01)** — sieben Affordances, ein Muster: `radiating` (V8.97, awe+peace), `broadcasting` (V8.98, Relais-Reichweite), `balancing` (V9.00, senkt chaos), `lifting` (V9.01, erste physik-gekoppelte Affordance — magie-geladenes leichtes Compound erzeugt Auftriebs-Feld), plus Stärke-Politur (V8.99, Affordance-Wirkung skaliert mit der Substanz statt boolescher Gate). | – | W10 Foundation |
| **W6.X** | **Polish-Sammel (Audit 17.05.2026)** — fünf Sub-Phasen: 6.X.1 Bug-Quartett (A1 Jump-Stand, A2 Ghost-rot-Block, A3 Armor-UI+Markier-Filter, A4 1st-Person-Aura-Hide), 6.X.2 UI-Politur (B1 Logbuch-Toggle, B2 Welt-Bauwerke entfernen, B4 Scrollrad-Hotbar), 6.X.3 Vision-Quick-Wins (C1 Spawn-Offset, C3 Soul-bound-Sprung), 6.X.4 Stats-HUD+Audio-Slider+Begleiter-Name (B3+D2+F1), 6.X.5 Performance-Caching (D1: isPlayerGrounded-Cache) | ✅ **live (V8.08-V8.12, 17.05.2026)** — alle fünf Sub-Phasen in einer Sitzung, +78 Invarianten (1791→1869) | – | – |
| W6.G3 | **Welt-Lebendigkeit** — Tag-Nacht-Zyklus, sanfte Wetter-Übergänge, Fauna-Lifecycle. | ✅ **V1 live (V8.24)** + ✅ **V2 Welt-LEBT-statt-animiert live (V8.25, 17.05.2026)** — V1: drei Schichten (timeOfDay/Slider/Status, requestWeatherTransition 45s, Fauna mit Trauer). V2-Heilung nach Schöpfer-Audit: drei Wurzel-Helper (_affinityPickFromCandidates, _tagToFrequency, _emotionModulate), acht Hardcode-Wunden geheilt (Soul-Wahl via Affinity-Pick; Lebewohl-Frequenz aus Tags; Spawn-Position-Affinity; FAUNA_TARGET emergiert aus lebendig; Birth/Death-Wahrscheinlichkeit emotion-moduliert; Sky-Tint × Welt-Feld-Tint × Emotion-Tint; Wetter-Dauer emotion-moduliert), Sonne+Mond als sichtbare Meshes folgen DirectionalLight, Sterne im Skybox-Shader nur nachts via neuem `starIntensity`-Uniform, Symphonie-Ambient atmet mit Tageszeit (Gain + Filter-Cutoff). Plus audit-strict 5. Schicht „Atmosphäre-Hardcode-Audit" (Pattern-Match auf `[ATMOSPHERE]`-markierte Methoden) + 28 Vision-Tests (Emergenz, nicht Mechanik). +28 Vision-Invarianten 1938→1966. | – | W6.X |
| W6.G4 | **Atmosphäre-Tiefe** (V8.27-V8.33) — Welt-unter-wandernder-Sonne (Hemisphere+Lambert+Fog), Welt-Atem-Vollendung (Sterne-als-Points, Terrain aus Affinität, Cel-Shading, Wind/Wolken/Wasser), Die lebendige Welt (Instanced-Gras, adaptives Wasser, Genesis-Plattform), Schnittstellen-Politur (Sterne-Tiefe, Avatar-Korrektur, Wasser-Wellen+Physik, Fog an Custom-Shader), Wasser-Vollendung (Tauchen, Schwimm-Animation, Gerstner). | ✅ **komplett (V8.27-V8.33)** — 1976→2061 Invarianten. **Polish-Punkte alle in V8.33 (6.G4.e) geschlossen**: (a) **Tauchen+Auftauchen** — reiner Helper `_swimVerticalVelocity`, Shift taucht ab / Space hebt (Minecraft-Konvention, kontextuell statt neue Keybinding-Taste — eine `sneak`-Taste ohne Land-Crouch wäre ein halbes Feature gewesen). (b) **Schwimm-Animation** — `animatePlayerSoul` reicht `playerUnderwater` durch, alle drei Seelen neigen sich + stroken/paddeln/wellen, `rotation.order = "YXZ"` für den lokalen Vorwärts-Lehnen. (c) **Gerstner-Wellen** — horizontale Vertex-Stauchung zu den Kämmen → spitze Kämme, Kreuzprodukt-Normalen. Wasser-Physik bleibt bewusst flach (Wellen visuell ±~1 m). | ✅ **komplett (V8.27-V8.33)** | – | W6.G3 |
| W11 V3 | **Soul-Sync (Multi-User echt körperlich)** — Peer-Avatar wird der echte Soul des Mitspielers (Mensch/Phönix/Drache/Custom), nicht Cone+Sphere. | ✅ **live (V8.34)** — neue WS-Nachricht `soul` (event-driven: Join + Soul-Wechsel) trägt soulName + bodyParts + Avatar-Namen; Empfänger baut den Avatar (Built-in via `def.build()`, Custom via `_buildFromBlueprint`), Cone+Sphere bleibt Platzhalter bis die Seele bekannt ist. Voll animiert: `_p2pUpdatePeer` leitet isMoving/underwater aus dem Positions-Stream ab → `def.animate` (Geh-/Schwimm-Zyklus, keine Extra-Bandbreite). **Aura-Sync** über die `aura`-Nachricht (~1 Hz, dominante Tag-Hue + Intensität); Peer-Aura ist immer sichtbar (der lokale 1st-Person-Hide gilt nur die eigene Kamera) — Audit-Punkt C2 geschlossen. **Name-Schild** über jedem Peer (Avatar-Name) — zwei Spieler mit derselber Seele bleiben unterscheidbar. `player_soul` bleibt in `NON_BROADCASTABLE_OPS` — Soul-Sync ist ein dedizierter Kanal, keine DSL-Mutation. +17 Invarianten 2061→2078, smoke-multiuser um soul/aura-Relay erweitert. | – | Ring 11.5 |
| W11 ext. | **Substanz-Rolle (Hylomorphismus auf Steroiden)** — emergente Rollen aus der ganzen Substanz: Soul aus Körper-Symmetrie, Werkzeug/Rüstung/Maschine/Konsumable aus der opChain-Domain, Nahrung aus lebendig+weicher Substanz, Bauwerk als Default. „Eine Sprache, beliebige Identitäten." | ✅ **live (V8.35)** — `computeBlueprintRole` ist eine Prioritäts-Kaskade: (1) opChain-Krafting-Domain, (2) intrinsische Form (`_isBodyShaped`: bilateral-symmetrischer Glieder-Körper + Vertikalitäts-Kriterium → soul), (3) intrinsisches Material (`_isFoodLike`: lebendig ≥ 0.6 + härte ≤ 0.5 → consumable), (4) architecture. Neue form-agnostische Helfer `_compoundSymmetry`/`_isBodyShaped`/`_isFoodLike` im `_isMoveable`-Stil. KEIN 11. Tag (Heilige Lektion — Nahrung emergiert aus den 10 bestehenden Tags). `consumableMeta` jetzt optional → emergente Nahrung ist essbar. Domain-Priorität zuerst (sonst hijackt jede symmetrische Form die Domain-Rolle — im Playtest gefangen). +15 Invarianten 2078→2093. | – | W6.X + W10 Foundation |
| W4 V2 | **Lofi-Musik-Schicht** — Pad-Layer (60 BPM, Minor-7th-Akkorde), Emotion-Modulation (hope→Major, sorrow→Tempo-Down). Web-Audio nativ, kein Asset. Antwort auf Audit-Punkt #3 (F2). | ✅ **live (V8.84)** | erledigt | Ring 4 V1 |
| W4 V3 | **Die generative Symphonie** — die feste Lofi-Schleife wächst zu einer seed- + emotion-getriebenen vierschichtigen Symphonie: Harmonie (Markov-Akkordfolge), Melodie (improvisierende Lead-Stimme), Groove (synthetische Trommeln + Swing), Orchester (Bass + Stimmen-Reichtum). Detail in §3 „W4 V3". | ✅ **komplett (V8.85-V8.93)** | erledigt | W4 V2 |
| W11 V4 | **Voice-Sync (Begleiter-Stimme im Multi-User)** — nach Soul-Sync (V3): andere Spieler hören deinen Companion-Output. Broadcast: `companion-say { peerId, text, voice }`. Empfänger spielt SpeechSynthesis mit gewählter Voice ab. Vision §1.4 Multisensorik durch alle Peers. Vorbedingung W11 V3. | ✅ **live (V8.67)** — `companion-say`-Broadcast aus `grokRender`, Empfänger-SpeechSynthesis gegated auf den eigenen Stimme-Toggle, wählbare Begleiter-Stimme | erledigt | W11 V3 |
| W7 | **Compute-Sharing (WebRTC-Mesh)** — P1 echte WebRTC-DataChannels, P2 Welt-Snapshot mesh-nativ (chunked), P3 LLM-Pool über Peers (eine geteilte Stimme), P4 Public-Lobby (Räume browsbar). Plus Multi-User-Bau-Sync + Kreatur-Sicht-Sync. „Distributed Chunk-Pre-Gen" entfiel bewusst (deterministisches Terrain rechnet jeder Client selbst — die echte Last war der Snapshot). | ✅ live (V8.62-V8.66) | erledigt | — |
| W12 | **Welt-Portal (Bibliothek von Alexandria, V8.23 umbenannt von WebGPU)** — Bauplan-Rolle „portal" + portalMeta (engine + manifest). Sub-Engine-Adapter in iframe/Worker mit Sandbox. DSL als Universal-Bridge zwischen Engines (jede Engine implementiert DSL-Subset). Welt-Manifest-Schema (engine + dsl_subset + signature). PoC mit `three-fluid-fx` (13 KB, klare DSL-Subset, visueller WOW). Detail in `docs/world-portal.md`. | ✅ **Phase 1+2+3 komplett (V8.51-V8.53)** — Phase 1: Portal-Skelett (emergente Rolle „portal", sandboxed iframe, Betreten/Pause/Rückkehr). Phase 2: zwei fremde Engines (three-fluid-fx + three.terrain.js), das generische DSL-Protokoll (Manifest pro Welt), die `WORLD_REGISTRY` + spieler-erreichbares Portal-Zielen, avatar-abgeleitete Tor-Größe. Phase 3: der Rückkanal (Sub-Welt → Heimat-Journal, geloggt nie ausgeführt — die Asymmetrie ist die Sicherheits-Wand) + die native Manifest-Stufe (jede Welt bringt ihr `manifest.json` mit; Drei-Stufen-Klarheit ausgestellt/übersetzt/nativ). Schöpfer-Browser-Test bestätigt P1+P2. Der KI-Übersetzer (fremdes Repo automatisch andocken) bleibt W14. | ✅ komplett | W11 ext. + audit:strict |
| W13 | **Vibe-Pass (Self-Sovereign Identity)** — Crypto-Keypair (ed25519, lokal generiert). Schöpfer signiert eigene Baupläne/Welten. Avatar-Identifier = Public-Key. Kein Coin/NFT-Hype, nur Authentizität. Vorbedingung für Welt-Portale die Authentizität brauchen. | ✅ **komplett (V8.54-V8.56)** — Phase 1: Schlüssel-Grundlage (ed25519-Keypair, WebCrypto nativ; Sign/Verify-Primitive; globale localStorage-Persistenz `anazh.vibePass`, nie im Welt-Save). Phase 2: Bauplan-Signaturen — `signBlueprint`/`verifyBlueprintSignature` signieren die Substanz (nicht den Namen), vier Status-Stufen, Werkstatt-Anzeige, Signatur reist durch Save/Welt-Tor/Fusion. Phase 3: Vibe-Pass-Identität im Multi-User — der `vibe`-WS-Typ trägt vibePassId + einen peerId-gebundenen Beweis, der Mitspieler ist beweisbar sein Schlüssel, verifiziertes Name-Schild. | ✅ komplett | W12 ✅ |
| W14 | **Bibliothek (Welt-Registry)** — die letzte große Vision-Schicht. Browsbarer Bibliothek-Tab + „Portal holen" (P1 ✅ V8.58); der Spieler signiert eine Welt mit dem Vibe-Pass, „signiert von <Autor>" + W13 V2 (P2 ✅ V8.60); fremde Welt-Manifeste exportieren/importieren, die Bibliothek wird ein wachsender Index (P3 ✅ V8.61). Der KI-Übersetzer ist mit V8.68/V8.69 vollständig; V8.70 (Untrusted-Welt-Tor) lässt eine echte, ungeprüfte fremde Engine null-origin sandgesichert laufen. | ✅ **komplett (V8.58/V8.60/V8.61)** | — | W13 ✅ |
| W13 V2 | **Vibe-Pass trägt das Schaffen (§4)** — der Pass speichert nicht nur den Schlüssel, sondern die Avatar-Anpassungen: Custom-Seele, eigene Materialien, eigene Werkzeuge reisen mit, wenn der Spieler durch ein Portal in eine fremde Welt geht (`world-portal.md` §4). | ✅ live (V8.60, W14 P2 Teil B) | — | W13 ✅ |
| W11 V4 | **Voice-Sync (Begleiter-Stimme im Multi-User)** — Mitspieler hören deinen Companion-Output (`companion-say`-Broadcast → SpeechSynthesis). Schließt den Präsenz-Bogen sehen/spüren/kennen/**hören**. | ✅ **live (V8.67)** | erledigt | W11 V3 ✅ |

**Summe verbleibend**: die grossen Roadmap-Ringe sind gebaut. **Stand nach V8.93**: Atmosphäre ✅ → Multi-User-Tiefe ✅ → Hylomorphismus-Vollausbau ✅ (V8.35) → Welt-Portal-Protokoll ✅ (W12) → souveräne Identität ✅ (W13) → Bibliothek ✅ (W14 Phase 1-3) → Compute-Sharing ✅ (W7 Phase 1-4) → Voice-Sync ✅ (W11 V4) → KI-Übersetzer ✅ (V8.68/V8.69) → Untrusted-Welt-Tor ✅ (V8.70) → Auto-Vendor-Pfad ✅ (W15 — V8.71/V8.72) → Mesh-Welt-Verteilung ✅ (W16 — V8.73/V8.74) → **Multiplayer-Sub-Welten ✅ vollständig (W17 — Phase A V8.75, B-Relay V8.76, C V8.77, Multiplayer-Welt-Deklaration V8.78, B-JS-Compute Phase 1 V8.79, Phase 2 Host-Migration V8.80)** inkl. der `serverMode`-Vendor-Ketten-Naht ✅ (V8.82) → **die generative Symphonie ✅ vollständig (W4 V3 — Harmonie V8.85, Melodie V8.87/90, Groove V8.91/92, Orchester V8.93)**. **Offen im Fremd-Engine-Bogen**: nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — bewusst per-Projekt, nicht automatisch).

**Hinweis**: WebGPU+TSL ist nicht mehr eine eigene Welle — es ist eine **optionale Renderpipeline für eine andere Welt-Engine** im Welt-Portal-Konzept. Wenn jemand eine WebGPU-Welt veröffentlicht, läuft sie als Sub-Engine im iframe. Kein Pflicht-Migrationspfad für den AnazhRealm-Kern.

---

## 3. Detail pro Ring

> **Hinweis (V14.6-Doc-Audit, 30.05.2026):** Diese Sektion ist HISTORISCHES Ring-Detail aus der Bau-Zeit. Einige „offen"/„~X d"-Marker sind überholt — z. B. Ring 11 V2 (DSL-AST-Broadcast, §3 unten noch „offen") ist via dem W7/W17-WebRTC-Bogen LÄNGST live (DSL- + Soul- + Voice-Sync, siehe `smoke-webrtc.cjs` + `state-of-realm.md` §3-Matrix Zeile „Ring 11"). **Der aktuelle, gepflegte Status lebt in §1.1 (Sequenz-Plan) + `state-of-realm.md` (Stand-Matrix); §3 ist Referenz/Design-Detail, KEIN Live-Status.** Wer hier „offen" liest, gegen §1.1 + die Matrix gegenprüfen.

### Ring 2: DSL als Brücke (Restarbeit Phase 3-7)

**Ziel**: Mensch und Nexus teilen vollständig eine Sprache. Alle Chat-Befehle gehen durch dieselben DSL-Primitives, die der Generator nutzt. `new Function`/`eval` komplett raus, strict CSP wird möglich.

**Phase 3 — Chat-Parser → DSL** (1-2 d)

**Phase 3a ✅ erledigt** (dieser Commit): `parseChatToDsl(text)` und `chatSuggest(text)` (Levenshtein, Distanz ≤ 4) live. Acht welt-betreffende Chat-Befehle laufen jetzt durch denselben Interpreter wie der Nexus:

| Chat | DSL |
|---|---|
| `setze wetter sunny/rainy` | `["weather", $1]` |
| `spawne kreaturen <n>` | `["repeat", n, ["spawn_creature", ["at_player"], 1, "happy"]]` |
| `ändere sternenhimmel <color>` | `["skybox_color", color]` |
| `setze terrain steilheit <v>` | `["terrain_steepness", v]` |
| `setze terrain basishöhe <v>` | `["terrain_base_height", v]` |
| `erhöhe sprungkraft um <n>` | `["player_jump_power", current+n]` |
| `heile welt` | `["chain", ["weather","sunny"], ["creatures_emotion","happy"], ["gravity",-14.715]]` |
| `vereine chaos ordnung` | `["chain", ["terrain_steepness",1.0], ["creatures_color","white"]]` |

Sechs neue Playtest-Invarianten verifizieren Parser, End-to-end-Routing und Levenshtein-Vorschlag. `state.dsl.lastUserProgram` + `state.dsl.lastUserOutcome` halten den letzten Menschen-Befehl für Diagnose/Persistenz fest.

**Phase 3b ✅ erledigt** (dieser Commit): Zwei neue DSL-Primitives `set_visible(target, visible)` (Whitelist „terrain"/„creatures", unbekannte Targets werden geloggt) und `record_narrative(text)` (Cap 500 Zeichen, schreibt in `state.knowledgeBase`). Fünf neue Chat-Patterns: `boden/kreaturen × aktivieren/deaktivieren` + `erzähle <text>`. Vier neue Playtest-Invarianten. Damit gehen 13 von ~25 Chat-Befehlen durch die DSL.

**Verbleibend nicht-migriert** (Phase 4/5 oder Ring 4):
- `lerne/entwickle fähigkeit`, `füge code` → Phase 5 mit `new Function`-Cleanup + Save-Migration
- `aktiviere anazh-symphonie` → Ring 4 (Web Audio)
- System-IO (`speichere/lade/lade datei`), `aktiviere version`, `füge trainingsdaten`, `behebe physik-tunneling`, `optimiere physik`, `boden nicht sichtbar`, `aktiviere/deaktiviere debug-logs`, `spawne neue welt` bleiben bewusst legacy (System-Ops, kein Welt-Effekt)

**Phase 4 ✅ erledigt** (dieser Commit-Block): `buildStateSnapshot` persistiert `dslAbilities` als Quelle der Wahrheit, die Legacy-`abilities`-Namensliste fliegt raus. `loadState` rehydriert das Array UND legt die zugehörigen `state.abilities[name]`-Wrapper an, damit „Führe Fähigkeit aus" und Keyboard-Loop nach Reload weiter funktionieren. Alte Saves (mit `abilities: string[]`) gehen weiter durch `restoreAbility` → Legacy-Namen-Mapping. `worldMeta.schemaVersion === "7.66-dsl-v1"` bleibt das Vertrags-Feld.

**Phase 5 ✅ erledigt** (dieser Commit-Block): `createDynamicAbility`, `codeParser`, `developAdvancedPhysics`, `developAdvancedRenderer` gelöscht. Chat-Befehle `füge code` und `entwickle fähigkeit` raus. `learnAbility` produziert DSL-Programme via `parseAbilityDescriptionToDsl` (5 Pattern + Catch-All als `say`). `addNewAbility` akzeptiert ausschließlich DSL-Arrays. `aktiviere anazh-symphonie` wird als statisches DSL-Programm gespeichert (V1-Stub, echte Web-Audio mit Ring 4). `processOptimization` ruft direkt `optimizePhysics()`, der Legacy-`evolution.impl`-Pfad in der Loop fliegt raus. CI-Gate „kein `new Function`/`eval` im Bundle" hart aktiviert (fail), Playtest verifiziert dass die toten Methoden weg sind.

**Phase 6 ✅ erledigt** (dieser Commit): `<meta http-equiv="Content-Security-Policy">` in `index.html` aktiviert. `default-src 'self'`, `object-src 'none'`, `base-uri 'self'` strict. Drei dokumentierte Konzessionen:
- `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval'` — Ammo (WASM) braucht das erste, TF.js (WebGL-Kernel-Compilation) das zweite. Unser eigener Code nutzt **kein** eval; CI-Gate „Verbotenes dynamisches Auswerten" sichert das hart.
- `style-src 'self' 'unsafe-inline'` — Three.js setzt Inline-Styles aufs `<canvas>` für Größe/Position. Risiko gering, kein User-CSS injizierbar.
- `worker-src 'self' blob:` — TF.js erstellt einen Backend-Worker aus blob-URL.

Plus: inline-styles aus `index.html` entfernt (`#fps`, `#state-file-input`), Inline-Bootstrap-`<script>` durch `<script src="anazhRealm.js" defer>` ersetzt. Sechs neue Playtest-Invarianten verifizieren CSP-Meta + dass über die Laufzeit keine CSP-Violations im Console-Buffer landen.

**Phase 7 ✅ erledigt** (dieser Commit): `dslSelectByFitness` (Roulette-Wheel über `state.dsl.history`; Gewicht `max(0.05, 1 − fpsDamage/100)`, Floor verhindert Aussterben), `dslMutate` (Sub-AST-Replacement, ±20 % Numeric-Shift, Chain-Wurzel-Schutz), `dslCompose({ historyProbability })` defaults auf 0.3 mit History ≥ 3 — der Nexus startet random, lernt aber zunehmend aus eigenen Outcomes. Fünf neue Playtest-Invarianten: high-fitness wird ≥ 2× häufiger gewählt (gemessen 11.2×), Selektion null-frei, Mutation behält `chain`-Root + Array-Sub-Strukturen, Compose nutzt History bei `historyProbability=1` zu 30/30.

**Akzeptanz Ring 2 vollständig** ✅ — alle Phasen 1-7 abgeschlossen.

---

### Ring 3: Player-Emotionen → Welt

**Ziel**: Spieler-Emotionen sind ein zentraler Welt-Treiber, nicht nur ein UI-Detail.

**V1 ✅ erledigt** (dieser Commit):
- `state.player.emotions = { joy, awe, sorrow, hope, peace, chaos }` (6 Achsen, 0..1)
- `collectPlayerEmotions(text)` regelbasiert: deutsche Stichwörter (z. B. „schön/fröhlich/liebe" → joy, „traurig/dunkel/trauer" → sorrow, „chaos/wild/sturm" → chaos). Jeder Treffer +0.1, geclampt.
- Eingehängt in `processChatCommand` → jeder Chat-Befehl füttert die Achsen.
- `updatePlayerEmotions(currentTime)` läuft im Hauptloop: Decay 0.005/s, drei Schwellen-Trigger als DSL-Programme (joy > 0.7 → `["skybox_color", "#f7d358"]`, sorrow > 0.7 → `["weather", "rainy"]`, chaos > 0.7 → `["creatures_speed_mul", 1.5]`). 30 s Cooldown pro Achse verhindert Spam.
- Neue DSL-Condition `emotion_above(name, threshold)` — der Nexus kann selbst auf Emotionen reagieren.
- Save persistiert `playerEmotions`. Sieben neue Playtest-Invarianten (Collect, Decay, Trigger, Cooldown, DSL-Cond, Save).

**V2 ✅ erledigt** (dieser Commit): drei stille Achsen (awe, hope, peace) bekommen Welt-Kopplungen — awe→`["skybox_color", "#d4a3ff"]` (magisches Lila), hope→`["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]]` (Licht), peace→`["creatures_speed_mul", 0.7]` (Beruhigung). Generator-Bias in `dslComposeAtomic`: joy verschiebt sunny-/happy-Wahrscheinlichkeit nach oben, sorrow nach unten (±0.3 sanft, Clamp 0.05..0.95). Fünf neue Playtest-Invarianten verifizieren die drei neuen Trigger und die Generator-Bias-Richtung statistisch (1000 Samples, Ratio > 2× gemessen). **Bug nebenbei gefunden und gefixt**: `skybox_color`-DSL-Op schrieb in `tintColor`, das Skybox-Uniform heißt aber `nebulaColor` — war seit Phase 1 stiller No-Op.

**V3 offen** (später, wenn nötig):
- Mehr Achsen (`longing`, `melancholy`) wenn Vokabular es einfordert.
- Grok-Stimme: neuer Trigger „emotionShift" wenn eine Achse abrupt steigt.

**Akzeptanz** ✅: 5 Min chatten mit emotionalem Vokabular → die Welt antwortet sichtbar (Skybox, Wetter, Kreatur-Geschwindigkeit).

---

### Ring 4: anazhSymphony

**Ziel**: Multisensorik. Welt hat Klang, der mit ihrem Zustand atmet.

**V1 ✅ erledigt** (dieser Commit):
- `state.symphony = { ctx, enabled, masterGain, ambient, weather, lastWeather, creaturePingCount }` lazy initialisiert.
- Drei Klangschichten gebaut:
  - **Ambient**: zwei verstimmte Sägezahn-Oszillatoren (110 / 111.5 Hz) → langsame Schwebung. Tiefpass-Filter mit LFO (0.08 Hz) auf Cutoff. Atmet konstant.
  - **Wetter**: White-Noise-Loop → Bandpass 1500 Hz → Gain. Bei `weather === "rainy"` Cross-Fade auf 0.18, sunny → 0. `symphonyTick()` ist idempotent (nur Wechsel triggern Rampe).
  - **Kreatur-Pings**: `playCreaturePing(emotion)` mit kurzem Sinus + ADSR-Envelope. Happy = 659 Hz (E5), sad = 220 Hz (A3). Aufgerufen aus `spawnCreatureAt` (DSL-Spawns), initialer Spawn-Loop ausgenommen.
- Toggle-Button `#anazh-symphony-toggle` (analog Grok-Stimme): erster Klick startet AudioContext, weitere Klicks muten via `masterGain`.
- `disposeSymphony()` räumt komplett auf (osc.stop, ctx.close, alle Referenzen null). Acht neue Playtest-Invarianten.
- Headless-Tests funktionieren mit `--autoplay-policy=no-user-gesture-required` als Puppeteer-Arg.

**V2 offen** (später, klein, additiv):
- Emotion-Modulation der Klangschichten: hohe joy → Filter-Cutoff höher (heller), hohe sorrow → tiefer (dunkler). Höhe peace → Master-Gain leiser, chaos → LFO schneller.
- Player-Y-Position moduliert Ambient-Pitch (höher oben → höher in Frequenz).
- Reverb-Send für Echo-Effekte (Halle bei großer Höhe).

**Akzeptanz** ✅: Spieler hört die Welt — alles synthetisiert, kein Asset geladen, keine externe Library.

---

### Bedien-Oberfläche / UI (V1+V2 live, V3 offen)

**Ziel**: Sichtbare Welt-Steuerung — was im Code passiert, soll auch ohne DevTools fühlbar sein.

**V1 ✅ erledigt** (4 Commits): Status-Panel mit Welt-Daten + Emotion-Balken, Quick-Action-Buttons, Hilfe-Drawer mit allen Chat-Befehlen klickbar, Abilities-Liste mit Run-Button + Source-Tag, Save/Load-Aktionen, Live-Tuning-Slider für emotionThreshold/Decay/Cooldown. DOM-Cache + 0.4 s Throttle.

**V2 ✅ erledigt** (3 Commits — Mockup-Adaption):
- **Painterly Identity** (`36d2364`): vendored Cinzel + IM Fell English + JetBrains Mono (~190 KB Latin-Subset, CSP-strict), Color-Tokens als CSS-Custom-Properties (`--parch-*` / `--iron-*` / `--brass-*` / `--violet-*` + Emotion-Farben), Tag/Nacht-Theme via `body[data-theme]` mit localStorage-Persistenz, Pergament-Hintergrund (SVG-Noise) + Eisen-Rahmen mit Eckschrauben.
- **Topbar + Tab-Drawer-System** (`2eb6771`): aus dem langen Status-Panel werden sechs Drawer pro Tab plus eine Topbar mit Titel + Tabs + Latch-Toggles plus eine Status-Bar mit Live-Welt-Daten. `state.uiActiveDrawer` trackt den aktiven Tab.
- **Konsole + Brass-Scrollbars** (`4f638cb`): Chat + Logbuch + Input werden ein einklappbares `#console`-Panel links. Custom-Brass-Scrollbars für alle scrollbaren Container (Webkit + Firefox).

**V3 offen** (~2-3 h, optional/Polish):
- **Astrolabium** als rotierendes SVG-Live-Element in der Topbar (rotierende Ringe als „Anazh-Stein"). Live-Daten: Spieler-Position, Wetter, Anomalien.
- **Custom-Slider mit Rail/Knob** statt nativem `<input type="range">` — passt zum Painterly-Aesthetic. Drei Slider in Einstellungen-Drawer + zwei potenzielle für Terrain (Welt-Drawer).
- **Toggle-Cards für Wetter** mit Icon (Sonne/Regen) statt Buttons.
- **Logbuch separat darstellen** mit Zeitstempeln aus `state.logBuffer` (statt rohem Log-String).
- **Welt-Modifikatoren in Welt-Drawer**: Slider für Terrain-Steilheit / Basishöhe (mit Klippen-Warnung, weil Welt-Regen nur bei nächstem Worldgen greift).

**Akzeptanz V1+V2** ✅: Welt-Status, Emotionen, Fähigkeiten und alle Befehle ohne DevTools sichtbar und manipulierbar. Painterly-Theme spiegelt die Vision (Pergament + Eisen + Portal-Violett).

---

### Ring 5: createPlayerSoul (~1-2 d)

**Ziel**: Spieler ist nicht mehr der rote Würfel. Er wählt seine Form.

- Spielstart-Menü (`<dialog>`-Element): „Wer bist du?" mit 4 Optionen + „Frei" (random)
  - **Mensch**: speed 6, jump 12, size 1, color skin
  - **Phönix**: speed 8, jump 18, size 0.8, color orange + leichtes Glühen
  - **Drache**: speed 5, jump 14, size 1.3, color dunkelgrün
  - **Riese**: speed 4, jump 10, size 2.0, color grau
- `state.playerSoul` persistiert in localStorage und im Save
- Mesh wird entsprechend gestaucht/gefärbt (kein neues Modell — Box-Geometry mit Skalierung + Farbe reicht für V1)
- Spätere Erweiterung: Soul-spezifische DSL-Ops (z. B. `phoenix_dash`, `dragon_breathe`)

**Akzeptanz**: nach Auswahl spielt sich die Welt fühlbar anders — Phönix springt höher, Riese ist schwerer.

---

### Ring 6: architectureTemplates V1 (~2 d)

**Ziel**: Aus „Spawne Häuser" wird wirkliche Architektur.

- Drei DSL-Primitive (zusätzlich zum bestehenden Pool):
  - `spawn_village(position, size)`: 3-8 Boxen unterschiedlicher Größe in lockerer Anordnung, Holz-/Stein-Farbtöne
  - `spawn_temple(position)`: zentrale Säule + 4 umgebende Säulen + Plattform
  - `spawn_waterfall(position, height)`: vertikale Linie von THREE.PointsMaterial-Partikeln, fließt nach unten
- Alle prozedural, kein Asset. Geometrie aus simplen Three.js-Meshes.
- Generator-Pool um diese drei erweitern (geringe Gewichte, ~2-3 % je)
- Chat: „bau ein dorf bei mir" → `["spawn_village", ["near_player", 20], 5]`

**Akzeptanz**: nach 5 Min Nexus-Evolution stehen 1-2 Dörfer oder Tempel in der Welt; via Chat kann der Spieler gezielt eines bauen.

---

### Ring 7: brain.js-Welt (~3-4 d)

**Ziel**: Welt lernt selbst aus dem Spieler.

- `brain.js` aus `vendor/` einbinden (kleines Neural-Net-Modul, ~20 KB)
- `state.worldNeural`: 2-Schicht Net, Input = Spieler-Position-Trajectory (letzte N Punkte) + aktuelle Emotionen, Output = Empfehlung (DSL-Op + Argumente)
- Training: jeden Frame `state.dsl.history` als Trainings-Set nutzen — Programme mit hoher Fitness werden positiver beispielhaft
- Vorhersage: alle 30 s wird der Output abgefragt und als zusätzlicher Nexus-Vorschlag in die Evolution-Queue gelegt
- Test: nach 10 Min Spiel sind die generierten DSL-Programme erkennbar an die Spieler-Vorlieben angepasst (z. B. wenn der Spieler oft springt, kommen mehr Sprungkraft-Buffs)

**Akzeptanz**: messbar — die durchschnittliche Fitness der Generator-Outputs in den letzten 50 Programmen ist >0.7, gegenüber initial ~0.5.

---

### Welle 6: Crafting-Polish + UX + Stats (sechs Blöcke A–F, bewusst nachgelagert)

**Status**: 🟡 in Arbeit — **Phase 1-6 (V7.72) erledigt**: 6.A komplett (Wall-Sliding, Erdung, Slope-Anti-Klebe, Raycast-Place, Stabilitäts-Visual), 6.E1+E2 (Fähigkeit-Beschreibung + Intro), 6.F1+F2 (Verbindungs-Linien + Brech-Warning), **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b: STAT_FROM_TAGS-Matrix, Seele-als-Bauplan-aus-Körperteilen, define_soul DSL, visueller Avatar-Editor, Boosts aus 3 Quellen, Phönix-Wandlung + persistente Tod-Wunde, Min-Regel-Hybrid decay 0.7, Werkzeug-Kosten, Rüstung-Stacking, Aura-Glow). **1014 Playtest-Invarianten grün**.

**Gesamt-Schätzung**: ~18-22 Sessions, verteilt auf 3-4 Monate Echtzeit, in sechs Blöcken **6.A bis 6.F** organisiert.

**Detaillierte Design-Notizen + Brainstorm** in [`docs/archiv/wave-6-design.md`](./archiv/wave-6-design.md). Roadmap-Eintrag hier ist die Milestone-Übersicht; die Begründungs- und Konzept-Tiefe lebt im Design-Doc.

#### Sechs Blöcke

| Block | Themen | Aufwand | Vorbedingung |
|---|---|---|---|
| **6.A — Interaktion-Polish** | Wall-Sliding (no-stick) ✅, Erdung auf Strukturen ✅, **Slope-Anti-Klebe ✅** (6.A3 neu), Bau-Phantom mit Raycast-Place ✅, Stabilitäts-Visual ✅ (6.A5), Maus-Aktionen LMB/RMB (6.A3 alt — wartet) | 3-4 Sessions, **5/6 erledigt** | – |
| **6.B — CAD-Werkstatt** ✅ vollständig (V7.99-V8.07) | 3D-Preview + Orbit/Pan/Zoom-zum-Cursor, voller Tinkercad-Manipulator (Move/Rotate/Scale/Connect/Snap), HTML5-Drag-Sources (Formen+Material+Werkzeug+Farbe), Klick-Klick-Connection-Erzeugung, Stats-Panel mit Stern-Rating für emergente Tags, Resize-Handles + Default-Werkstatt-Größe. Drei Phasen + sieben UX-Iterationen aus Schöpfer-Browser-Tests. | abgeschlossen | 6.F1 (Linien-Renderer) |
| **6.C — Inventar + Modi + Keys** | Erweitertes Inventar mit Tag-Profilen, **frieden/pfad/schöpfer**-Modi, Keybindings-UI | 4 Sessions | 6.D (Stats für pfad-Modus) |
| **6.D — Stats fraktal** ⭐ | Soul × Soul-Material → Tags → Stats; Boosts (Konsum + Emotion + Welt-Effekt); Min-Regel-Hybrid (decay 0.7); Tod = Phönix-Wandlung + Welt-Trauer | 3-4 Sessions | W5 + 6.F2 |
| **6.E — Lesbarkeit** | Fähigkeit-Beschreibung ✅ (6.E1), Intro-Overlay ✅ (6.E2), subtile Tooltips (6.E3 — wartet) | 2 Sessions, **2/3 erledigt** | – |
| **6.F — Original-Crafting (alt 6.1-6.7)** | Visuelle Verbindungs-Linien, Brech-Mechanik, Energiequellen, Kreaturen-Körper als Baukasten, Physik-Constraints (Ammo Hinge/Fixed), Rüstung → in 6.D integriert | 8-10 Sessions | W5 |
| **6.G — Welt-Sinne** (NEU, 13.05.2026) | **Phase 1 ✅ V7.73** + **Phase 1.5 ✅ V7.74** + **Phase 2 ✅ V7.75** (Welt-Affinitäts-Feld — 4 SimplexNoise-Schichten als Tag-Sprache, populateChunkVegetation füllt Chunks via Affinity-Resonanz, drei neue Baupläne stein_block/kristall_geode/glutbrunnen, organische Region-Emergenz ohne Biome-Tabelle, Schöpfer-Vision „wie kommt Welt-Leben rein" beantwortet). Phase 3 grösstenteils ✅ von W6.G4 (V8.27-V8.33: Schatten, Shader, Sterne-Stabilisierung + Variation, Wasser als Material+Layer). Phase 3 W6.G-P3-Rest **Phase 1 ✅ V9.03** (Felsformationen — `felsbogen` + `felsturm`). Echte Höhlen/Tunnel/Überhänge → der **Voxel-Terrain-Bogen** (ab V9.07, §3) — das Heightfield wird ein 3D-Dichte-Feld | 7-9 Sessions, **Phase 1+1.5+2 + W6.G4 + P3-Felsformationen erledigt**, der Rest läuft im Voxel-Bogen | – (Phase 1+2) / 6.D (Phase 3) |
| **6.H — Kreaturen-Aufträge** (NEU, 13.05.2026) | Autonome Co-Schöpfer. **Phase 1 ✅ V7.79** (wander/follow_player/wait + Aura + Audio + Journal). **Phase 2A ✅ V7.80** (Hylomorphismus — Kreaturen sind Compounds aus bodyParts×Material wie Spieler+Architektur). **Phase 2B.1 ✅ V7.81** (gather + memory). **Phase 2B.5 ✅ V7.82** (harvestArchitecture als Wurzel-Funktion + Material-Inventar + carrying-Bring-Phase). **Phase 2C ✅ V7.83** (computeBuildCost als wertneutrale Spiegelung, modus-symmetrisch). **Phase 2B.2 ✅ V7.84** (Kreatur baut für Spieler — Geste-Umkehrung zu gather: take→walk→spawn). **Phase 2D ✅ V7.85** (Spezialisierung aus Memory: gather:material und build:blueprint je 3 Erfolge ein Level, max 5; Speed-Bonus +15 %/Level; Audio + Journal bei Level-Up; UI-Pills Sammler/Bauer in Liste; KEINE Persistenz — Vision §1.1 konsequent). **Phase 2E 🔴 offen** (Konversationen — „Nira, was hast du gesehen?" via LLM-Provider mit pro-Kreatur memory + Specs als System-Prompt-Erweiterung; Specs sind jetzt Identitäts-Anker). 4-5 Sessions Original-Schätzung; aktuell 7 Sessions investiert (V7.79-V7.85) — bewusst tiefer als Plan, weil Hylomorphismus-Wurzel sich beim Bauen offenbarte | original 4-5 Sessions, jetzt 7/8 erledigt | 6.F4 (Multi-Mesh-Kreaturen, in 6.H P2A integriert) + 6.A4 (Raycast, in 6.A6 erledigt) |

**Vision-Hebel der Welle**: Block 6.D macht den Spieler zum **Compound im selben Hylomorphismus-System** wie Materialien und Bauwerke. `STAT_FROM_TAGS`-Matrix analog `FORM_TAG_ACTIVATION`. Wenn das Stat-System ohne Bezug zu `MATERIAL_TAG_KEYS` funktioniert, wurde die Vision verfehlt — explizite Warnung im Design-Doc §9.

**Beschlossene Reihenfolge** (Schöpfer hat 13.05.2026 freie Hand gegeben, Entscheidungen in `docs/archiv/wave-6-design.md` §10.6):
1. 6.A1+A2 (Sliding + Erdung) ✅ V7.72
2. 6.A3 (Slope-Anti-Klebe, ad-hoc) ✅ V7.72
3. 6.A4+A5 (Raycast-Place + Stabilitäts-Visual) ✅ V7.72
4. 6.E1+E2 (Ability-Beschreibung + Intro-Overlay) ✅ V7.72
5. 6.F1+F2 (Verbindungs-Linien + Brech-Warning) ✅ V7.72
6. **6.D Stat-System komplett** (Etappen 1+1.5+1.6+1.7+2+3a+3b) ✅ V7.72 — der Vision-Pfeiler ist live
7. **Schöpfer-Reflexions-Polish** ✅ V7.72 — sechs Reflexions-Runden in Welle 6.D fanden + behoben: Avatar-Editor-UI (Etappe 1.7), Konsumables aus Compound-Tags (Logik statt Tabelle), Werkzeug-Stamina-Kosten (Anti-Stapeln), persistente Tod-Wunde, Aura-Glow (Sprite + Radial-Gradient), WASD-Geometrie + Drache-Animation-Wahrnehmung, **Sprint-Bug-Fix** (player_speed sync't sprintSpeed), **Tag-Clamp [0,1]** in computePlayerStats für die Stat-Pipe, Speed-Base 6→7
8. ✅ **6.G Welt-Sinne Phase 1** V7.73 — fliegende Inseln + Bäume kollidierbar (btBvhTriangleMeshShape für Inseln aus echten Vertices, btCylinderShape am Baumstamm), drei tote DSL-Ops aktiviert, toter needsPhysics-Pfad gelöscht, 24 neue Invarianten → 1038 total
8.6. ✅ **6.G Welt-Sinne Phase 2** V7.75 — **Schöpfer-Vision-Antwort auf „organische Verteilung"**: Welt-Affinitäts-Feld. Vier SimplexNoise-Schichten (lebendig/dichte/glut/magieleitung) bilden ein Tag-Feld; jeder Bauplan resoniert über Dot-Product seiner Compound-Tags mit dem Welt-Feld. `worldFieldAt(x,z)` + `spawnAffinityForBlueprint(name,x,z)` + `populateChunkVegetation(cx,cz)` — drei neue Methoden auf AnazhRealm (Heilige Lektion: kein Modul). Drei neue Built-in-Baupläne (stein_block/kristall_geode/glutbrunnen) decken die vier Welt-Achsen. Hook in `ensureChunkAt` für neue Chunks + Initial-Worldgen für 64 Chunks. Idempotent via state.populatedChunks. Silent-Opt verhindert Welt-Effekt-Flut. Bug-Fixes: Stamm 0.5→0.8, Culling 1→2Hz. 18 neue Invarianten → 1066 total.
8.5. ✅ **6.G Welt-Sinne Phase 1.5** V7.74 — **Schöpfer-Vision-Korrektur**: Hylomorphismus-Unification. Bäume sind jetzt Compound-Architekturen über baum_eiche/baum_kiefer-Baupläne (Stamm:holz + Krone:laub/laub-cone), laub als 12. Built-in-Material, spawn_tree DSL-Op routet durch spawnArchitecture, Worldgen-Bäume in state.architectures, eigene spawnTreeAt + _buildTreeCollision gelöscht (Parallelcode weg), Insel-Visual-Fix (Vollkörper + Lambert), Topbar-Version-Sync, 32 6.G P1.5-Invarianten total → 1048 total
9. ✅ **6.C2 Spielmodi** V7.76 — drei Welt-Beziehungs-Modi (frieden/pfad/schöpfer). worldMeta.gameMode-Persistenz, setGameMode/getGameMode-Methoden, set_mode DSL-Op in NON_BROADCASTABLE_OPS (Multi-User-privat), Chat-Patterns mit dt./engl. Aliasen, UI-Radio in Einstellungen-Drawer + #status-mode Status-Bar. damagePlayer-Gate (frieden+schöpfer blockieren) + applyOpToPart-Stamina-Gate (nur pfad kostet 10). 26 neue Invarianten → 1092 total.
10. ✅ **6.C1 Hylomorphismus-Inventar + Drag&Drop** V7.77+ — 27-Slot-Overlay mit Tab-Toggle, Tag-Resonanz emergiert aus Compound-Tags (resoniert summt + brennend glüht + magieleitung schimmert + lebendig sprießt + dichte schattet), Audio-Hover-Ping mit Tag-spezifischen Frequenzen. **Drag&Drop nach vier Schöpfer-Iterationen**: alle vier Pfade konsistente Move-Semantik (inv↔inv Swap, inv→hot Slot-Move, hot↔hot Swap, hot→inv Move/Stack mit Daten-Schutz). HTML5-Drag mit Pointer-Lock-Management (exitPointerLock beim Open, kein Re-Lock beim Close), Tab-Listener auf Capture-Phase, WASD bleibt aktiv (Minecraft-Konvention), state.drag mit Top-of-method Cleanup. Click-State-Workflow parallel als Touch/Keyboard-Fallback. add_to_inventory DSL-Op in NON_BROADCASTABLE_OPS, state.player.inventory persistiert. 34 + 16 (Drag) + 5 (Lock) + 4 (Iteration-3) + 4 (Iteration-4) Invarianten = **127 total für 6.C1** → 1153 invariants overall.
11. **6.A-Maus + 6.C3** ← jetzt offen (LMB/RMB-Aktionen für Welt-Interaktion + Keybindings-UI)
    - 6.A3 Maus-Aktionen: LMB = abbauen (Architektur in Raycast-Reichweite via apply_op-Pfad), RMB = platzieren (heutiges F-Verhalten als Maus-Geste). F bleibt als Tastatur-Alternative.
    - 6.C3 Keybindings-UI: Sektion in Einstellungen-Drawer, Liste aller Game-Actions, Klick→Rebind→localStorage-Persistenz, Konflikt-Erkennung.
10. 6.C1 + 6.A-Maus + 6.C3 (Inventar + LMB/RMB + Keybindings-UI)
11. 6.B (CAD-Werkstatt — minimal magic)
12. 6.G Phase 2 (Schatten, Wasser, Höhlen, Sterne)
13. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
5. **6.D** Stats komplett (Vision-Pfeiler) ⭐
6. 6.G Phase 1 (Inseln + Bäume kollidierbar)
7. 6.C2 (Modi frieden/pfad/schöpfer)
8. 6.C1 + 6.A3 + 6.C3 (Inventar + Maus + Keybinds)
9. 6.B (CAD minimal)
10. 6.G Phase 2 (Schatten + Wasser + Höhlen + Sterne)
11. 6.F3 + 6.F4 + 6.F5 (Energie + Kreaturen-Körper + Constraints)
12. **6.H** (Kreaturen-Aufträge — autonome Co-Schöpfer)

**Beschlossene Antworten zu §10**:
- **Modi-Namen**: `frieden` / `pfad` / `schöpfer` statt friedlich/survival/kreativ — antik-modern verschmolzen
- **Stats-Sichtbarkeit**: Auren default, Zahlen bei Hover/Inspect (Inspect-Panel)
- **Tod im pfad-Modus**: Phönix-Wandlung (5 min) + Welt-Trauer (sorrow +0.3, awe +0.2) + Journal-Eintrag; im frieden/schöpfer kein Tod
- **CAD-Komplexität**: Min Viable Magic — 3D-Preview + Drag + Grid-Snap. KEIN Boolean/MultiSelect/Symmetrie. Wer mehr will, geht zum Code-Editor
- **Min-Regel-Hybrid**: für Werkzeug-Präzision `min + (max-min) × 0.7^N`-Decay (poliert kann teilweise heben), für Verbindungs-Last + Compound-Tags bleibt min/max streng
- **6.G Welt-Sinne** als eigener Block (fliegende Inseln + Bäume kollidierbar, Schatten, Shader, Sterne, Höhlen, Wasser) — siehe Design-Doc §11

**Was beachten (Welle 6 als Ganzes)**:
1. **Heilige Lektion**: 6.B, 6.C, 6.D sind die Stamm-gefährdenden Blöcke — Reflex „separates Modul" abwehren.
2. **Schema-Bumps** bei 6.C1, 6.C2, 6.D, 6.F5 — defensive Migration testen.
3. **Diskriminations-Tests** pro Block (Beispiele in Design-Doc §9.3).
4. **Reflexions-Pausen** zwischen 6.A→6.E, 6.F1+F2→6.D, Rest.
5. **Vision-Treue von 6.D** ist nicht-verhandelbar: Spieler-Stats müssen aus Tag-Aggregation kommen, nicht als separates RPG-System danebenstehen.

#### Alt-Plan-Archiv

Der ursprüngliche Welle-6-Plan (sieben Teilschritte 6.1-6.7) ist vollständig in den Block **6.F** überführt. Details siehe `docs/archiv/wave-6-design.md` §7. 6.6 (Rüstung) wird Teil von 6.D (Stats), 6.7 (Min-Regel) wird Teil von 6.D §5.5.

---

### Welle 6 ALT — ursprünglicher Plan (jetzt 6.F)

(Bleibt unten zur Referenz, ist aber durch die Sechs-Blöcke-Struktur oben ersetzt. Beim Implementieren ist die Detail-Tiefe der 6.1-6.7-Teilschritte hilfreich — daher nicht gelöscht.)



**Status**: 🔴 offen — **bewusst nach Ringe 8-10 verschoben** (Entscheidung 13.05.2026). Die Hylomorphismus-Schicht ist mechanisch vollständig (W4 + W5 A+B+C), Welle 6 ist Polish + Erweiterung, kein Fundament. Rings 8-10 (Welten-Ultiversum) ziehen die Vision-Krönung vor; Welle 6 läuft danach als Feinabstimmung.

**Ziel**: Die Crafting-Schicht visuell + mechanisch + körperlich „atmen" lassen. Heute existieren Verbindungen, Lasten, Tags, Werkzeuge nur als Datenschicht und Stern-Anzeige — Welle 6 macht sie sichtbar, fühlbar und konsequent.

**Teilschritt 6.1 — Visuelle Verbindungs-Linien** (~1 Session)

- Three.js-Tube/Cylinder/Line zwischen `bp.parts[a].position` und `bp.parts[b].position`, gerendert pro Connection in `state.blueprints[].connections`
- Pro Connection-Type eigener visueller Stil: `lashing` = Tube mit braunem Seil-Material, `pinning` = Cylinder mit Eisen-Material, `welding` = kurze geometrische Naht, `magic_bind` = emissive Linie mit awe-Farbe, `hafting` = keilförmiger Übergang, `gluing` = dünne flache Naht, `masonry` = Mörtel-Streifen, `sewing` = gestrichelte Linie
- Pro-Spawn-Renderpfad in `_buildFromBlueprint` nach Part-Render, vor Compound-Group-Return
- Editor-Vorschau: dieselben Linien im Workshop-Mesh-Preview (sobald 6.6 — Realtime-Preview — fertig ist; sonst nur bei gespawntem Compound)

**Caveats:**
- Linien dürfen **nicht** Kollisionen erzeugen — sie sind rein dekorativ, gehen nicht in den Compound-Body
- Mesh-Culling muss greifen: bei `tickArchitectureCulling` ebenso disposed wie der Rest
- Bei W5-A Lastfaktor < 0.7 (heute rötliche Stern-Anzeige) → Linien-Material rötlich tinten als „diese Verbindung trägt nicht"

**Teilschritt 6.2 — Brech-Mechanik bei zu schwacher Last** (~1-2 Sessions)

- Trigger: beim Spawn eines Compounds mit `connection.load < 0.7` (oder konfigurierbar `WORLD_EFFECT_THRESHOLDS.connection_brittle`)
- Drei Varianten zur Wahl:
  - **Sanft**: Compound spawnt, aber Part(s) hinter schwacher Verbindung visuell „abgehängt" — leicht ge-offset, halb-transparent, ohne Kollision für den unverbundenen Sub-Tree
  - **Hart**: Beim ersten Welt-Effekt-Trigger (`_applyCompoundWorldEffects`) zerteilt sich der Compound in N separate dynamische `btRigidBody`s, die mit Schwerkraft fallen
  - **Editor-Warn-Only**: Stern-Anzeige bleibt + Tooltip „diese Verbindung würde brechen", aber kein Spawn-Effekt — sicherste Variante, behält die heutige Semantik
- Empfehlung: **6.2 startet mit Editor-Warn-Only** als „opt-out: bauen geht weiter", dann separat-Commit für Spawn-Effekt
- Journal-Eintrag bei Bruch: `journalAppend("structure_failure", "Die ${name} hielt ihre Last nicht.")` — die Welt erinnert das Versagen

**Caveats:**
- **Min-Regel-Entscheidung (Learning #95) muss vor 6.2 fallen**. Heute deckelt der schlechteste opChain-Schritt; bei harter Brech-Mechanik wäre das doppelt grausam (schlechte Präzision → schlechte Tags → schwache Last → Bruch). Drei Optionen: (a) min bleibt, Brechen ist UX-Bestrafung; (b) später-poliert hebt (max statt min); (c) Decay-Modell (jeder Op multipliziert mit eigenem Faktor, end-Wert = Produkt). Schöpfer-Entscheidung in einem expliziten Commit dokumentieren.
- Body-Recreate-Pfad für zerteilte Sub-Bodies ist nicht trivial (Compound→Liste-of-Bodies + 8 Half-Extent-Berechnungen + correct Welt-Position) — Test-First

**Teilschritt 6.3 — Energiequellen für Maschinen** (~1-2 Sessions)

- Konzept §4.1: vier Quellen — `hand` / `wasserrad` / `dampf` / `magisch`
- Erweitert `state.tools[name]` um `{energySource, energyAvailable}` (default `"hand"` / `1.0` für alle Built-ins)
- Welt-Effekt: ein Compound mit `tags.fließend ≥ 0.7` + nahem Bauplan mit `toolMeta` → Wasserrad-Bonus, hebt `energyAvailable` von 0.6 auf 1.0 → opChain-Cap multipliziert mit `energyAvailable`
- DSL-Op `set_energy_source(toolName, source)` für Schöpfer-Hand
- UI: Energie-Quelle als Auswahl-Feld in der Werkzeug-Liste, neben opClass und precisionCap

**Caveats:**
- **Nicht im `dslComposeAtomic`-Pool** (gleiche Regel wie `apply_op`, `define_material`) — Nexus darf keine Werkzeuge willkürlich umkonfigurieren
- Snapshot-Cap-Regel (Welle 5 C) bleibt: `precisionCap` wird beim Register eingefroren, aber `energyAvailable` ist Live-Lookup gegen Welt-Kontext (Wasserrad in der Nähe = ja/nein) — das ist OK, weil es ein Zustand, kein Wert ist
- Wasser-Animation-Hook in `tickArchitectures` muss „nahe genug" effizient finden — KD-Tree wäre Overkill, einfache Distanz-Schleife reicht bei <50 Architekturen sichtbar

**Teilschritt 6.4 — Kreaturen-Körper als Baukasten** (~2 Sessions)

- Kreaturen sind heute Single-Mesh (Würfel/Kugel mit Farbe). Spieler-Seele V2 hat schon Multi-Mesh-Group mit Walk-Cycle (Mensch/Phönix/Drache). Welle 6 zieht die gleiche Schicht in Kreaturen hoch.
- `state.creatureSouls` analog `playerSoulDefs` — drei Built-ins (z. B. Pflanzenfresser/Räuber/Geist), jeder mit `build()` + `animate(g, t, ph, mv)` Multi-Mesh
- DSL-Op `creature_soul(name)` setzt die Standard-Form für neu gespawnte Kreaturen
- **Bridge zur Bauplan-Schicht**: Kreaturen als Baupläne ausdrücken, wenn man Ring 5 V3 Idee #3 (Spieler-Seele aus Werkstatt) mitnimmt — eine Kreatur ist dann ein Bauplan mit `role: "creature"` + `creatureMeta: {animatePattern, speed, jumpPower}`
- Material-Tags auf Kreaturen-Compound → Welt-Effekte ähnlich Architekturen (eine Quarz-Kreatur singt, eine Eisen-Kreatur ist robust)

**Caveats:**
- Performance: heute spawnen wir 10 Kreaturen initial; Multi-Mesh mit Walk-Cycle ist pro Kreatur ~5-10× teurer in Vertex-Count + per-frame `animate`-Hook. Cap evtl. von 50 auf 20 senken, oder LOD (nahe = Multi-Mesh, fern = Single-Mesh-Proxy)
- Movement-Worker (off-screen Kreaturen) muss Multi-Mesh aushalten — der heutige Worker rechnet nur `position`, das reicht; Animation läuft im Main-Thread bei sichtbaren Kreaturen
- Bei Bauplan-als-Kreatur muss `spawnArchitecture` vs. `spawnCreature` getrennt bleiben — beide leben in unterschiedlichen Welt-Schichten (Architekturen sind statisch + cullbar, Kreaturen sind bewegt + physikalisch)

**Teilschritt 6.5 — Physik-Baukasten für Compound-Körper** (~2-3 Sessions, anspruchsvoll)

- Heute: Compound-Bodies aus `btBoxShape` pro Sub-Mesh (Architektur) ODER Single-Body (Kreatur, Spieler)
- Vision: Verbindungen aus W5-A werden zu **echten Ammo-Constraints** — `hafting` → `btFixedConstraint`, `pinning` → `btHingeConstraint` (1 DoF), `lashing` → `btGeneric6DofSpringConstraint` (weich), `magic_bind` → distanz-erhaltendes Constraint
- Erlaubt physikalische Spielzeuge: Wippe (Achse + Brett mit Pinning), Schaukel (Lashing), Tür (Hinge), Marionetten-Kreaturen
- Brech-Mechanik (6.2) bekommt damit Substanz: `constraint.setBreakingImpulseThreshold(load * factor)` lässt das echte Solver-System entscheiden, ob die Verbindung hält
- Pro Bauplan optional `dynamic: true` — dann werden Parts zu separaten dynamischen Bodies, verbunden durch Constraints, statt zu einem Compound

**Caveats:**
- **Ammo-Constraint-Binding-Lücken** (ähnlich zu `getHalfExtentsWithMargin`-Problem): nicht alle Constraint-Typen sind in der JS-Schicht vollständig erreichbar. Vor Start: Spike mit `btHingeConstraint` + `btFixedConstraint`, sehen was geht.
- **Performance**: 6 Parts mit 5 Constraints = 6 Bodies + 5 Constraints, der Solver kann bei dichten Compounds (Dorf mit 30 Häusern, je 8 Parts) explodieren. Defaults dynamic=false halten, dynamic nur opt-in pro Bauplan.
- **Sleep-Falle wie Player-Teleport** (CLAUDE.md): nach Constraint-Erzeugung `body.activate(true)` auf beiden Seiten, sonst hängen die Parts in der Luft
- Save-Schema: `bp.dynamic` + `bp.constraints` (mit hinge-axis etc.) ergänzen — Schema-Version-Bump fällig

**Teilschritt 6.6 — Rüstung (tragbare Compounds)** (~2 Sessions)

- Bauplan mit `role: "armor"` + `armorMeta: {slot, tagsToPlayer}` — z. B. `slot: "head"`, „helmet"
- `state.player.armor = {head, body, legs}` — drei Slots, jeder hält einen Bauplan-Namen oder null
- Material-Tags + räumliche Tags der Rüstung **wirken auf den Spieler**: `magieleitung` → Spell-Schutz, `härte` → Damage-Reduction, `sprödigkeit` → HP-Penalty (Konsequenz statt Bestrafung), `resoniert` + hohe Präzision → Sing-Effekt, der Kreaturen besänftigt
- **Vorbedingung — Spieler-Stats-System**: heute hat der Spieler nur Bewegung, keine HP/Resistance/Damage. Welle 6.6 muss ein minimales Stat-System einführen: `state.player.stats = {hp, maxHp, defense, magicResist}` + Tick-Damage z. B. bei Lava-Berührung (heute noch nicht modelliert).
- DSL-Ops `equip_armor(slot, bp)` und `unequip_armor(slot)`
- Visuell: Rüstungs-Bauplan rendert um die Spieler-Mesh herum, skaliert auf 1.2× Spieler-Größe, folgt yaw

**Caveats:**
- **Größter Eingriff in Welle 6** — Stat-System ist neuer Welt-Pfeiler, nicht nur Polish. Wenn das zu groß wirkt: 6.6 könnte rein kosmetisch starten (Rüstung visuell tragen, keine Stat-Effekte), dann später Stats nachziehen.
- Animations-Sync: bei Player-Soul-Wechsel (Mensch ↔ Drache) muss die Rüstung mit-skalieren oder verschwinden — Drache trägt keinen Mensch-Helm sinnvoll
- Save: `armor` in `playerSoul`-Sektion, mit defensive Migration (alte Saves haben keine Rüstung → `null` pro Slot)

**Teilschritt 6.7 — Min-Regel-Entscheidung dokumentieren** (~0.5 Sessions, in 6.1 oder 6.2 inkludiert)

- Learning #95 als expliziter Commit mit drei dokumentierten Optionen + Schöpfer-Entscheidung
- Konzept-Doc `docs/crafting-konzept.md` §2.3 aktualisieren (heute „min", evtl. „min mit nachträglich-poliert hebt Stein-für-Stein um 20 %")
- Test-Invarianten anpassen: heute prüft Welle 4 P3 Diskriminations-Schwelle 0.4 vs. 0.97 — bei neuer Regel evtl. andere Werte

**Akzeptanz Welle 6 gesamt**: 
- Verbindungen sind im 3D-Bild sichtbar, Connection-Type erkennbar an Look
- Eine schwach verbundene Konstruktion zeigt Konsequenz (Warnung oder Bruch)
- Maschinen können energiegekoppelt sein (Wasserrad-Drehbank)
- Kreaturen haben Multi-Mesh-Körper mit Walk-Cycle
- Mindestens 2 der 8 Verbindungstypen funktionieren als echtes Constraint
- Rüstung lässt sich tragen, hat (zumindest visuell) Konsequenz
- Min-Regel-Diskussion ist mit klarem Commit beendet

**Vorbedingung**: W5 abgeschlossen ✅. Ring 8-10 müssen NICHT fertig sein, aber **wir verschieben Welle 6 bewusst nach 8-10**, um die Welten-Schicht nicht durch Polish zu verzögern.

**Was beachten (Welle 6 als Ganzes):**
1. **Heilige Lektion**: 6.4 + 6.5 + 6.6 sind die schwersten Brocken — wenn der Reflex „separate Kreaturen-Datei + Physik-Modul + Stat-Manager" auftaucht, ist es ein Smell. Stamm bleibt, Wachstumsringe wachsen IN `anazhRealm.js`.
2. **Schema-Version bumpen** bei 6.5 (constraints) und 6.6 (armor + stats) — Save-Migration testen mit alten Saves vor dem Commit.
3. **Diskriminations-Tests** für 6.1 (visuelle Linien) und 6.3 (energy): zwei minimal verschiedene Setups, prüfen dass Welt-Reaktion zwischen ihnen liegt.
4. **Reflexions-Pause** zwischen 6.3 und 6.4 — der Übergang von Crafting-Mechanik zu Kreaturen/Körper ist konzeptionell groß genug, um nochmal die Vision-Treue zu prüfen.

---

### Ring 8: Welt-Identität & Sichtbarkeit (~2-3 d)

**Ziel**: jede Welt ist ein identifizierbares Universum mit eigenen Regeln.

- `state.worldMeta`-Felder sind bereits da (worldId, slug, creator, visibility, parentWorlds, schemaVersion). Jetzt: **Logik dahinter**.
- Chat-Befehle:
  - „benenne welt <slug>" → `state.worldMeta.slug` ändern
  - „mach welt öffentlich/privat" → `visibility` toggeln
  - „neue welt" → frische worldId, vorhandene Welt wird in localStorage unter `anazhRealmState_<worldId>.json` archiviert
- localStorage-Struktur: ein Index-File `anazhRealmWorlds` mit `[{worldId, slug, lastPlayed}]` + ein Daten-File pro Welt
- UI: ein kleiner Welt-Picker (`<select>`-Element, zeigt slug + lastPlayed) zum Welt-Wechseln
- Pro Welt eigenes Save, eigener Seed, eigener `chunkMap`, eigene DSL-Abilities

**Akzeptanz**: der Spieler hat 3 Welten, wechselt zwischen ihnen, jede behält ihren Zustand.

**Vorbedingung**: Ring 2 Phase 4 (Save-Migration), damit alte Single-World-Saves sauber in das neue Multi-World-Schema überführt werden.

---

### Ring 9: Welt-Export/Import (~2 d)

**Ziel**: Welten sind teilbar.

- „welt exportieren": JSON-Datei mit allen DSL-Programmen, Seeds, Metadaten — **nicht** mit Mesh-Snapshots (die sind aus DSL+Seed regenerierbar)
- „welt importieren": drag-drop oder File-Dialog. Drei Wahlmöglichkeiten:
  - Ersetzen: importierte Welt wird aktuelle Welt
  - Neu daneben: importierte Welt bekommt eine neue worldId und wird zur Liste hinzugefügt
  - Fusionieren: → Ring 10
- Signing optional V2 (für vertrauenswürdige Provenienz): SHA-256 der Welt-JSON in einem `signature`-Feld, vom Spieler-Schlüssel signiert. V1 nur Hash.
- Test: Welt exportieren, localStorage clearen, importieren → identische Welt wieder da.

**Akzeptanz**: ich kann eine Welt mit einem Freund tauschen (per Datei oder Link).

---

### Ring 10: Welt-Fusion (~3-4 d)

**Ziel**: zwei Welten begegnen sich und werden eine dritte.

- DSL-Programme zweier Welten werden gemerged:
  - **Naive Strategie**: `[chain, weltA_root, weltB_root]` — beide laufen sequentiell
  - **Random-Mix**: pro Generations-Tick wird mit 50:50 ein Programm aus A oder B gewählt
  - **Conflict-Resolution**: wenn beide Welten widersprechende terrain_steepness setzen, wird gewichtet (zb 70 % A, 30 % B)
- Neue Welt: `worldId` neu, `parentWorlds: [worldA.id, worldB.id]`
- UI: 2-Spalten-Picker, „diese ⊕ diese → neue Welt"
- Test: Fusion zweier Welten ergibt eine dritte, deren Verhalten erkennbar Elemente beider zeigt.

**Akzeptanz**: Stammbaum-Visualisierung in `parentWorlds` ist navigierbar.

---

### Ring 11: Multi-User-Sync

**Ziel**: zwei Spieler erleben dieselbe Welt zur gleichen Zeit.

#### V1 ✅ (13.05.2026, live) — Position-Sync via WebSocket-Broker

Geliefert in einer Session (in Kombination mit Ring 10.5 für die Vorbedingung):

- **`signaling-server.js`**: Mini-WebSocket-Broker (~225 Zeilen, ZERO npm-Dependencies). RFC-6455 Frame-Handling von Hand, Health-Endpoint `/health`, HOST/PORT via env.
- **Protokoll**: `join { room, peerId }` → `welcome { peers[] }`, `pos { x, y, z, yaw }` wird an alle Mitglieder desselben Raums broadcastet, ohne den Absender.
- **Client (`state.p2p`)**: `peerId`, `room`, `ws`, `peers: Map<peerId, {x,y,z,yaw,mesh,lastSeen}>`, 30 Hz pos-Broadcast im Game-Loop (intern gedrosselt), Idle-Purge nach >10 s ohne Update.
- **Remote-Avatare**: THREE.Group aus Cone + Sphere, deterministische HSL-Farbe aus peerId-Hash.
- **UI**: Toggle + URL-Input + Status-Anzeige im Einstellungen-Drawer. Auto-Connect nach Init wenn `p2p.enabled === true` in localStorage.
- **CSP**: `connect-src` erweitert um `ws://127.0.0.1:4313` + `ws://localhost:4313` + wss-Varianten.
- **Trust-Boundary**: KEIN neuer DSL-Op (`p2p_send`/`peer_dsl`/`remote_run`) — V1 trägt strikt nur Position + Rotation. Playtest-Invariante prüft die Abwesenheit explizit.
- **Heilige-Lektion-Disziplin**: EINE neue Datei (signaling-server.js), zehn Methoden auf der einen `AnazhRealm`, drei Sub-Hooks im Game-Loop. KEIN P2PManager-Modul.

**Ehrliche V1-Grenzen** (V2-Aufgaben):
- Modifikationen (Ring 10.5 `modify_terrain`, Architekturen, Kreaturen) werden NICHT zwischen Spielern synchronisiert. Jeder erlebt seine eigene Welt-Variante.
- Avatar ist immer Cone+Sphere, nicht die echte Spieler-Seele (Phönix/Drache).
- Kein DSL-AST-Broadcast — Chat-Befehle wirken nur lokal.

**Acceptance-Test** (manuell): `npm run signaling` + zwei Browser-Tabs derselben Welt → in Einstellungen Multi-User aktivieren → beide Spieler bewegen sich sichtbar als bunte Kegel.

#### V2 (offen, ~3-5 d): DSL-AST-Broadcast für Welt-Sync

- Chat-Befehle werden als DSL-AST über WebSocket an alle Mitglieder gesendet
- Eingehender AST läuft durch denselben `dslRun`-Sandbox-Pfad wie eigene Programme (identische Budget-Limits, Op-Whitelist, kein Bypass)
- `modify_terrain`-Ops werden so synchron — beide Spieler sehen dasselbe Loch
- Nexus-Programm-IDs (statt ganzem Programm) für Outcome-Dedup
- Public Welten: `visibility: "public"`, jeder mit der worldId kann beitreten
- Private Welten: Schöpfer generiert Token-Link

**Vorbedingung**: Ring 11 V1 (Position-Sync stabil) + saubere DSL-Sandbox (existiert seit Ring 7).

---

### Welle 6.X: Polish-Sammel (Audit 17.05.2026, ~4-5 Sessions)

**Ziel**: 18 vom Schöpfer kuratierte Bugs/UX/Vision-Punkte in einer fokussierten Welle abarbeiten BEVOR neue Atmosphäre/Mechanik kommt. Logik: ein Spieler der in Reibung steckt, kann die nächsten Vision-Schichten nicht spüren.

**6.X.1 — Bug-Quartett (1 Session)**
- **A1 Jump-im-Stehen**: `playerBody.activate(true)` vor `setLinearVelocity` in beiden Jump-Pfaden (`handleJump` Zeile 22593 + Loop-Jump Zeile 22895). Ammo-Sleep-State weckt sich sonst nicht.
- **A2 Ghost-rot-aber-platzierbar**: in `confirmBuild` vor `spawnArchitecture` prüfen `if (getGameMode() === "pfad" && !bm.phantomOnGround) return false;`. Frieden+Schöpfer bleiben durchlässig (Vision §10.1).
- **A3 Rüstung-Markier-Filter**: `renderPlayerEquipUI` zeigt JETZT alle eigenen Baupläne in Markier-Sektion, außer `bp.roleManual === true` — emergente Welle-9-Rolle blockt nicht mehr explizite Geste. Plus Stat-Panel-Zeilen „Trägt: <armor>" + „Werkzeug: <tool>".
- **A4 1st-Person-Aura-Hide**: `tickPlayerAura` setzt `glow.visible = state.cameraMode !== "first"`. Mitspieler-Sicht unverändert (P2P sync't keine Aura).

**6.X.2 — UI-Politur (1 Session)**
- **B1 Logbuch-Toggle**: `#log` und Section-Wrapper bleibt im DOM, aber default `hidden`. Toggle in Einstellungen-Drawer „Logbuch sichtbar". Power-User-Pfad bleibt offen.
- **B2 Welt-Bauwerke entfernen**: Vier Quick-Spawn-Buttons (Dorf/Tempel/Wasserfall/Fraktal) aus dem world-drawer entfernen. Hotbar+Werkstatt ersetzt sie.
- **B4 Scrollrad-Hotbar**: `wheel`-Listener auf Canvas, `e.deltaY > 0 ? next : prev` modulo 9. Im Build-Mode deaktiviert (zukünftig: Phantom-Distance-Wheel).

**6.X.3 — Vision-Quick-Wins (1 Session)**
- **C1 Struktur-Spawn-Offset**: neuer DSL-Resolver `at_player_forward(dist=5)` der `p + yaw-Vektor × dist` liefert. Chat-Patterns „Baue Dorf hier" → `["spawn_village", ["at_player_forward", 8]]` statt `["at_player"]`. Vision §11 — Welt-Geste wirkt selbst-entschieden.
- **C3 Soul-bound-Sprung**: Jump-Block prüft `if (state.onSteepSlope) return` PLUS soul-abhängige Steilheits-Toleranz: `maxJumpFromSlope = soul.tags.lebendig * 0.7 - dichte * 0.3` o.ä. Phönix klettert wo Drache nicht. Hylomorphismus-Pipeline (Vision §1.3 fraktal).

**6.X.4 — Stats-HUD + Audio-Slider + Begleiter-Name (1-2 Sessions)**
- **B3 HP/Stamina-Bar**: SVG-Bars über `#hotbar`, painterly-Style (Pergament+Kupfer). Refresh-Loop pro Frame mit `hp/hpMax`. Tooltip auf Hotbar-Items für slow Stats (Damage/Speed/Präzision) — schneller Stat oben, langsamer im Tooltip ("satisfying slow Stats").
- **D2 Audio-Slider**: drei Slider in Einstellungen (Master / Kreatur-Pings / Chunk-Distance 3..9-Ring).
- **F1 Begleiter-Name + Avatar-Name**: `state.llm.companionName` (default "Grok") + `state.player.name` (default "Schöpfer"). Beide editierbar im UI, in System-Prompts referenziert. Optional: Voice-Auswahl aus `speechSynthesis.getVoices()`.

**6.X.5 — Performance-Caching (1 Session)**
- **D1 Raycast-Throttle**: `isPlayerGrounded()` Result cachen für 2 Frames (Variable `_groundedCache` + `_groundedAt`). 540 → 270 Raycasts/Sek. Aura-Update alle 5 Frames (Atem-Animation via performance.now sowieso).
- Plus Parallel-Code-Audit-Sweep: Suche nach Doppel-Pfaden seit Welle 6.G P1.5 (alle wahrscheinlich sauber, aber Vision-Disziplin).

**Akzeptanz Welle 6.X**: 1791 → ~1840 Playtest-Invarianten. Spieler kann 30 Min spielen ohne Reibung, Welt fühlt sich aufgeräumt + lebendig an.

---

### Welle 11 V3: Soul-Sync (Multi-User echt körperlich, ~2-3 Sessions)

**Ziel**: Mitspieler werden echte Phönixe/Drachen/Custom-Souls, nicht Cone+Sphere.

**Architektur**: bei jedem `applyPlayerSoul`/`applyPlayerSoulFromBlueprint` broadcastet der Spieler einen `soul-snapshot { peerId, soulName?, soulBauplan? }`-Frame. Empfänger ruft `_buildFromBlueprint(bp)` und ersetzt den Cone+Sphere-Group durch das echte Soul-Mesh. Soul-Compound-Tags werden NICHT übertragen (Empfänger berechnet sie eh aus dem Bauplan emergent). Bandbreite: ~2-5 KB einmalig pro Soul-Change.

**Multi-User-Disziplin**: Soul-Sync ist KEIN DSL-Op (würde Loop-Schutz brechen), sondern eigene Message-Type. Welcome-Frame enthält aktive Souls aller Peers. P2P-Welt-Snapshot beim Join (Ring 11.5) erweitert um Soul-Liste.

**Akzeptanz**: zwei Browser-Tabs, ein Spieler wechselt zu Phönix → Mitspieler sieht ihn flatterten statt Kegel. Custom-Soul via define_soul → Mitspieler sieht das Multi-Part-Mesh.

---

### Welle 11 ext.: Substanz-Rolle (Hylomorphismus auf Steroiden, ~3-4 Sessions)

**Ziel** (Audit-Punkt #13 / C5, eines der größten Vision-Worte): Bauplan-Rolle emergiert vollständig aus Substanz, ohne `setBlueprintAs*`-Manualität. „Universum-Freiheit mit wenigen Stabilisierungs-Mechanismen."

**Vier Stabilisatoren** (so wenig wie möglich):
1. **`bp.bodyParts`-Marker** (Soul): hat eine humanoide/quadruped/winged räumliche Symmetrie + ≥3 Glied-Compounds → Identität = Avatar/Kreatur
2. **opChain-Domain-Dominanz** (Werkzeug/Rüstung/Trank): bereits in Welle 9a — forging+scharf → tool, forging+dicht → armor, alchemy → consumable
3. **`compoundTags.nahrhaft`** (Nahrung): neues Tag `nahrhaft = lebendig × verarbeitung_alchemy`. Compounds > 0.5 ohne Domain → Nahrung-Rolle, regeneriert HP/Stamina bei Konsum
4. **Default → Bauwerk** (alles andere geht als Architektur in die Welt)

**Plus**: Schöpfer-Override via `bp.roleManual = true` bleibt (Welle 9a-Disziplin) — explizite Geste sticht Emergenz.

**Vision-Wort**: „**Substanz-Rolle**" — Identität geht aus der Substanz hervor, nicht aus Etikette. Wie im echten Universum: ein Stein wird Stein, weil er Stein-Material ist, nicht weil jemand ihn als „Stein" markiert hat.

**Akzeptanz**: Schöpfer baut einen Bauplan ohne explizite Rolle → System erkennt korrekt, was er gebaut hat (Schwert / Helm / Trank / Brot / Turm). Markier-UI wird optional — ein „Was wäre wenn"-Button zum überschreiben der emergenten Rolle.

---

### Ring 4 V2: Lofi-Chill-Musik (~1-2 Sessions, Audit-Punkt #3 / F2)

**Ziel**: Welt-Musik atmet langsamer, „minecraft relax", lofi hip hop vibes. Web-Audio nativ, keine Assets.

**Drei neue Schichten** (additive zu V1 ambient + weather + creature):
- **Chord-Pad**: drei Sinus-Oszillatoren spielen Akkord (Default F#m7 = F# + A + C# + E). LFO 0.05 Hz auf Filter-Cutoff. Akkord-Wechsel alle 8 Takte zufällig aus [F#m, A, C#m, E].
- **Soft Kick** (optional): Sinus 60 Hz mit kurzem Decay bei Beat 1 von 4 (60 BPM). −18 dB, fast subliminal.
- **Vinyl-Crackle**: White-Noise + Bandpass 2-4 kHz + sehr leise Gain (−25 dB). Lofi-Charakter.

**Emotion-Modulation**:
- `hope > 0.6` → Major-Akkord-Pool [F#, A, D, E]
- `sorrow > 0.6` → 50 BPM statt 60, Filter dunkler
- `peace > 0.7` → Vinyl-Crackle aus (zu klar), Tempo 45 BPM
- `chaos > 0.6` → Dissonante Sus2-Akkorde

**Toggle**: separat zu V1 (Spieler darf nur Drone oder Drone+Lofi). Default off.

---

### Welle 12 + 13: ✅ erledigt (Detail in `world-portal.md` + `CLAUDE.md`)

**W12 Welt-Portal (V8.51-V8.53)** und **W13 Vibe-Pass (V8.54-V8.56)** sind vollständig live. Der ausführliche Wellen-Eintrag steht in `CLAUDE.md` (V8.51-V8.56), die Vision-Tiefe in `docs/world-portal.md` §3-§4. Kurz: W12 baute das Tor (sandboxed iframe, zwei fremde Engines, generische DSL-Brücke, beidseitiger Kanal, native Manifest-Stufe), W13 die Identität (ed25519-Schlüssel, Bauplan-Signaturen über die Substanz, peerId-gebundene Multi-User-Identität). Beide sind die Vorbedingung für W14.

---

### Welle 14: Bibliothek (Welt-Registry) — die letzte große Vision-Schicht (~8-10 Sessions, 3 Phasen)

**Ziel** (`docs/world-portal.md` §2 Schicht 3, §9): AnazhRealm wird das Tor, das andere Welten *sammelt*. Eine Welt-Registry, in der man fremde Welten browst, mit einem Klick einen Portal-Bauplan ins Inventar legt, ihn in der Heimat-Welt platziert und immer wieder hindurchgeht. W12 baute das Tor, W13 die Identität — **W14 baut die Bibliothek dahinter**. „Die Bibliothek von Alexandria der Vibecode-Ära."

**Die Schnittstellen, auf die W14 aufsetzt** (alles steht schon — W14 verbindet, baut keinen neuen Stamm):

- `AnazhRealm.WORLD_REGISTRY` (W12) — die EINE Quelle, welche Sub-Welten es gibt (`{id, label, world, dsl}`). Heute Daten ohne Browse-Sicht.
- `aimBlueprintAtWorld(blueprint, welt)` + DSL-Op `set_portal` (W12) — ein Bauplan wird auf eine Welt gerichtet.
- `_portalReceiveManifest` + die Drei-Stufen-Marke ausgestellt/übersetzt/nativ (W12 P3) — eine Welt beschreibt sich über ihr `manifest.json`.
- `_vibeSign` / `_vibeVerify` / `vibePassId()` (W13) — die Krypto-Primitive, um ein Manifest zu signieren und zu prüfen.
- `addToInventory(name, count)` (Welle 6.C1) — der Pfad, einen Bauplan ins Inventar zu legen.
- Welt-Tor Export/Import (Ring 9) — der bestehende Welt-Teilen-Mechanismus (JSON-Datei).

**Phase 1 — die Bibliothek wird ein Ort** ✅ **live (V8.58)** (~1-2 Sessions):

1. Ein neuer „Bibliothek"-Tab (8. Drawer in der Topbar) listet die `WORLD_REGISTRY`-Einträge browsbar.
2. Pro Welt eine Karte: Label, DSL-Vokabular (was die Welt versteht), Drei-Stufen-Marke, kurze Beschreibung.
3. Aktion „Portal holen" → `aimBlueprintAtWorld` baut einen Portal-Bauplan für die Welt → `addToInventory`. Der Spieler platziert ihn in seiner Welt und betritt ihn.
4. Playtest-Invarianten + Schöpfer-Browser-Test.

→ Damit wird die Registry vom Entwickler-Datum zum **spieler-erreichbaren Ort**. (W12 notierte selbst: „die 3 Welten wirken hardcoded" — Phase 1 schließt genau das.) **Umgesetzt in V8.58**: `renderLibraryUI`/`obtainPortalForWorld`/`libraryInitDOM`, `WORLD_REGISTRY` um ein `desc`-Feld erweitert, achter Topbar-Tab „Bibliothek", 13 neue Invarianten — Detail in `CLAUDE.md` V8.58.

**Phase 2 — eine Welt veröffentlichen + signieren** ✅ **live (V8.60)** (~2-3 Sessions):

1. Eine eigene (Sub-)Welt in die Bibliothek eintragen.
2. Beim Veröffentlichen signiert der Vibe-Pass das `manifest.json`: `authorPubKey` + `signature` (`world-portal.md` §3.3) — `_vibeSign` über den kanonischen Manifest-Inhalt.
3. Das Portal-Overlay prüft die Signatur bei `_portalReceiveManifest` via `_vibeVerify` und zeigt „signiert von &lt;Autor&gt;" / „unsigniert". **Hier trifft W13 auf W14.**
4. Hier landet auch **W13 V2** (Vibe-Pass §4): der Pass trägt das Schaffen des Spielers — Custom-Seele, eigene Materialien, eigene Werkzeuge reisen mit, wenn er durch ein Portal in eine fremde Welt geht.

**Phase 3 — fremde Welten empfangen** ✅ **live (V8.61)** (~3-4 Sessions, Horizont):

1. Welten teilen + in die eigene Bibliothek importieren (der dezentrale Teil — `world-portal.md` §2 Schicht 3).
2. Realistischer Anfang: die bestehende Welt-Tor-JSON (Ring 9) IST der Teilen-Mechanismus; die Bibliothek wird ein Index importierbarer Welten. Kein IPFS, keine zentrale Authority (Heilige Lektion — kein neuer Dienst, wo ein bestehender reicht).
3. Der KI-Übersetzer ist die Krönung — **vollständig (Phase 1 V8.68 + Phase 2 V8.69)**: Phase 1 die Manifest-Übersetzung (eine fremde Welt-Beschreibung → ein sanitiertes Portal-Manifest, LLM-Output als Daten); Phase 2 die deklarative Szene + der generische Renderer `worlds/translated/` — die übersetzte Welt wird betretbar. Der LLM-Output bleibt durchgehend DATEN, kein ausgeführter Code: statt einen fremden Adapter zu vendorn, wird die Welt in AnazhRealms eigene deklarative Sprache wiedergeboren.

**Folgerung / Disziplin**: W14 ist groß, aber kein neuer Stamm — eine browsbare Registry + Portal-Baupläne sind ein Wachstumsring auf W12+W13. Phase 1 + 2 sind klar umrissen und browser-testbar; Phase 3 (Dezentralisierung) ist ein Horizont, der konkret ausgearbeitet wird, *wenn* P1+P2 stehen — nicht vorher (keine Spec für ein Szenario, das es noch nicht gibt).

**Akzeptanz**: der Schöpfer öffnet den Bibliothek-Tab, sieht die verfügbaren Welten, holt sich mit einem Klick ein Portal, platziert es, geht hindurch — und beim Betreten einer veröffentlichten Welt steht „signiert von &lt;Autor&gt;".

**Vision-Wort**: „**Andere bauen Welten FÜR Spieler. Wir bauen das Tor, das sie alle verbindet.**" Der Knotenpunkt, durch den man geht.

---

### Der Fremd-Engine-Bogen (W15–W17): das echte automatische Welt-Tor

**Stand**: der Fremd-Engine-Bogen ist im Kern **vollständig**. Das Untrusted-Welt-Tor (V8.70) ist der Schlüsselstein — eine echte, ungeprüfte fremde Engine läuft null-origin sandgesichert hinter dem Portal (`worlds/schwarm/` beweist es). **W15 — der Auto-Vendor-Pfad — ist gebaut (V8.71 Bündel-Pfad, V8.72 GitHub-Fetch)**: ein fremdes Repo dockt ohne Handarbeit an. **W16 — die Mesh-Welt-Verteilung — ist komplett (V8.73 Welt-Bündel-Transport, V8.74 der browsbare Welt-Katalog)**: eine vendorte Welt reist peer-to-peer zu einem Mitspieler, und die Mesh-Bibliothek ist browsbar. **W17 — die Multiplayer-Sub-Welten — ist komplett (V8.75 Transport-Shim, V8.76 Mesh-als-Server, V8.77 Gruppen-Portal, V8.78 Multiplayer-Welt-Deklaration, V8.79 B-JS-Compute Phase 1 Compute-Host, V8.80 B-JS-Compute Phase 2 Host-Migration)**: eine Gruppe taucht gemeinsam in eine vendorte Relay- ODER JS-Compute-Multiplayer-Welt, und verlässt der Compute-Host das Mesh, übernimmt ein deterministisch gewählter Nachfolger. Niemand muss die Bibliothek verlassen, um gemeinsam ein Buch zu lesen. Offen bleibt nur B-WASM (ein Rust→WASM-Server in einem Peer-Tab — bewusst per-Projekt, nicht automatisch) + eine kleine Vendor-Ketten-Naht (`serverMode` durch die ganze Vendor-Kette).

**Das Vollbild — fünf Schichten.** Jede baut auf der vorigen; eine fremde Welt nutzt so viele, wie sie braucht.

| Schicht | Was | Stand |
|---|---|---|
| 0 — Sandbox | das null-origin-iframe: fremder Code läuft voll, kann AnazhRealm nicht berühren | ✅ V8.70 |
| 1 — DSL-Brücke | der universelle Befehls-Kanal (postMessage, JSON, asymmetrisch) | ✅ W12 |
| 2 — Transport-Shim | die Netz-APIs der fremden Welt (`WebSocket`/`fetch`/`RTCPeerConnection`) werden durch AnazhRealm umgeleitet | ✅ V8.75 (`WebSocket`; `fetch`/`RTC` spätere Schichten) |
| 3 — Mesh-als-Server | AnazhRealms W7-Mesh trägt den Verkehr; ein Peer hostet die Server-Logik | ✅ V8.76 Relay-Welten + V8.79 JS-Compute Phase 1 (Compute-Host) + V8.80 Phase 2 (Host-Migration) |
| 4 — Gruppen-Portal | eine Gruppe tritt gemeinsam durch ein Tor, teilt den Mesh-Raum der Sub-Welt | ✅ V8.77 (`portal-invite` + In-Game-Prompt + `joinPortalInvite`) |

**Die ehrliche Server-Taxonomie.** Nicht jede fremde Welt ist gleich. Der Auto-Vendor (W15) fragt vor jeder Welt: *was tut ihr Server — falls sie einen hat?*

1. **Rein-clientseitige Welt** (three-fluid-fx, THREE.Terrain, die Schwarm-Welt) — kein Server. Läuft schon vollständig (V8.70). ✅
2. **Relay-Server-Welt** — der „Server" ist nur ein Nachrichten-Verteiler (A sendet, der Server broadcastet an B/C/D). **Voll lösbar:** der Transport-Shim leitet die `WebSocket` der Welt auf AnazhRealms W7-Mesh um — das Mesh IST der Relay. Die Welt läuft komplett peer-to-peer, ohne je einen echten Server.
3. **JS-Compute-Server-Welt** — der Server rechnet autoritativ (Node/JS). **Lösbar:** JS läuft im Browser — ein Peer der Gruppe wird der Compute-Host (sein Tab IST der Server), das Mesh trägt den Verkehr, Host-Migration fängt das Verlassen ab. Der Multiplayer-Shooter (WS-Server, meist Relay + etwas Logik) fällt hierher.
4. **Native-Compute-Server-Welt** (voxelize — Rust-Server) — **zwei Wege:** (a) Rust kompiliert zu **WASM** — lässt sich der Server `wasm32`-bauen, läuft er in einem Peer-Browser wie ein JS-Server; (b) lässt er sich nicht client-seitig bauen (echte TCP-Sockets, Datenbank, OS-Zugriff), ist die Welt eine **Brücken-Welt**: ihr Server läuft extern (der Vibecoder hostet ihn, oder ein Community-Seed-Knoten), AnazhRealm verbindet sich dorthin. **Auch dann verlässt niemand die Bibliothek** — man tritt durch das AnazhRealm-Portal, mit seiner Gruppe, über das Mesh; nur die schwere Server-Maschine steht draußen. Das Buch wird durch ein Fenster gelesen — aber gemeinsam, von hier aus.

Der Auto-Vendor klassifiziert jede Welt in diese vier Stufen und schreibt die Stufe ins Manifest (`portalMeta.server`). Das Portal weiß dann, was zu tun ist.

#### W15 — Auto-Vendor-Pfad (~3–5 Sessions)

**Stand:** **✅ komplett (V8.71 + V8.72)**. **Phase 1 (V8.71)** baute die Schreib-Seite: der `/api/vendor-world`-Endpunkt nimmt ein hochgeladenes Bündel + schreibt es nach `worlds/<id>/` (strenge Wand — Punkt 1+2 unten), `vendorWorldBundle` registriert die Welt als `customWorlds`-Eintrag mit `trust:"sandboxed"`. **Phase 2 (V8.72)** fügte die Fetch-Seite hinzu: derselbe Endpunkt nimmt auch eine GitHub-Repo-URL — `parseGithubRepoUrl` parst sie zu owner/repo/branch, `vendorFromGithub` löst den Default-Branch auf, liest den Baum (Trees-API), holt die Text-Dateien (Raw-Fetch, zero-dep `https`) und reicht sie an dieselbe Phase-1-Schreib-Seite (`applyVendorBundle`). Kein SSRF — die API-/Raw-Bases sind operator-konfigurierbar (`VENDOR_GH_*`), nicht request-gesteuert. Der LLM-Manifest-Schritt (Punkt 3 unten) blieb bewusst offen — der Spieler tippt id/Name/DSL, oder die Welt bringt ihr `manifest.json` selbst mit.

**Ziel:** ein fremdes Repo dockt ohne Handarbeit an. Heute sind `worlds/fluid/`, `worlds/terrain/`, `worlds/schwarm/` hand-vendort; W15 automatisiert das.

1. Der save-server (läuft lokal, hat schon den V7.96-LLM-Proxy) bekommt einen `/api/vendor-world`-Endpunkt: er nimmt eine Repo-URL (oder ein hochgeladenes Bundle), holt die Dateien, schreibt sie nach `worlds/<id>/`.
2. **Sicherheits-Disziplin** (wie der LLM-Proxy): URL-Whitelist (`github.com`/`raw.githubusercontent.com`/npm), Größen-Deckel, Pfad-Sanitizing (kein `..`-Ausbruch aus `worlds/`), kein Ausführen beim Vendoren — nur Schreiben.
3. Ein LLM-Schritt liest das Repo + schreibt das Manifest (`{id, label, desc, dsl, engine-entry, server-Stufe}`). Der LLM schreibt **nicht** die Engine (das ist der fremde Code, unangetastet) — nur das Bindeglied: bei einer ES-Modul-Welt den bare-Import-Patch (wie three-fluid-fx in W12 hand-gemacht), bei einer Server-Welt den vorangestellten Transport-Shim.
4. Die vendorte Welt ist `trust:"sandboxed"` (V8.70) — sie läuft null-origin. Sie landet in `worlds/<id>/` + bekommt einen Registry-Eintrag.
5. **Der git-Kern ist die unzerstörbare Bibliothek:** eine vendorte + committete Welt ist für jeden Spieler dauerhaft da — versioniert, brennt nie. Der save-server-Pfad funktioniert in der Dev-Umgebung; ein Mensch reviewt + committet; danach hat es jeder.

**Ehrlicher Umfang:** W15 vendort rein-clientseitige + Relay-Welten zuerst (sie laufen sofort). Compute-Server-Welten werden vendort + klassifiziert, aber erst mit W17 spielbar.

**Akzeptanz:** der Schöpfer gibt eine GitHub-URL eines kleinen Three.js-Projekts ein, klickt „andocken", und nach dem Vendoren steht die Welt in der Bibliothek + ist betretbar. ✅ erfüllt (V8.72).

**Offene Ränder von W15 (ehrlich benannt — denkbares „W15.1"-Polish, kein Blocker für W16):**
- **Binär-Assets werden nicht vendort.** Beide Pfade vendoren nur Text (`html/js/css/json/…`); der GitHub-Fetch filtert Binär-Endungen (`.png`/`.glb`/`.wasm`) aus dem Baum. Eine fremde Welt mit Texturen/Modellen verliert sie. Eine spätere Schicht müsste Binär base64-kodiert mitschreiben (der save-server-Endpunkt + `applyVendorBundle` müssten ein `encoding`-Feld lernen).
- **Der LLM-Manifest-Schritt (Punkt 3) ist nicht gebaut.** Der Spieler tippt id/Name/Beschreibung/DSL selbst, oder die Welt bringt ihr `manifest.json` mit (W12 P3 native Stufe). Ein LLM, der das Repo liest + das Manifest schreibt, wäre der bequeme letzte Schritt.
- **Branch-Namen mit Slash** (`feature/x`) werden nicht aufgelöst — die Trees-API bekommt den Branch roh; einfache Branches (`main`/`master`/`dev`) gehen. Ein slashed Branch bräuchte erst eine SHA-Auflösung.
- **Das echte GitHub-Antwort-Schema ist nicht CI-getestet** — `smoke-vendor.cjs` Teil C nutzt ein Fake-GitHub, das das dokumentierte Schema spiegelt (wie `llmCall` nie gegen den echten Provider läuft). Ein Schema-Drift bei GitHub fiele erst im echten Gebrauch auf.

#### W16 — Mesh-Welt-Verteilung (~3–4 Sessions)

**Stand:** **✅ komplett (V8.73/V8.74)**. **Phase 1 (V8.73)** baute den Welt-Bündel-Transport: zwei kanal-exklusive Nachrichten `world-bundle-pull`/`world-bundle-chunk` (Spiegel von W7 P2 `world-pull`/`world-chunk`); `requestWorldBundleFromPeer(worldId, peerId)` holt eine vendorte Welt von genau einem Peer, der Sender liest sein Bündel über die save-server-Lese-Seite `GET /api/vendor-bundle` zurück, der Empfänger reassembliert + reicht es an die erprobte `vendorWorldBundle`-Schreib-Seite (ein dritter Eingang nach lokalem Bündel + GitHub). Eine peer-empfangene Welt läuft `trust:"sandboxed"`. **Phase 2 (V8.74)** fügte den browsbaren Welt-Katalog hinzu (Punkt 1 unten): jeder Mitspieler annonciert seine vendorten Welten als `[{id,label,hash}]` über den `soul`-Kanal (wie `worldRole`/`voiceShared`), der Bibliothek-Drawer rendert sie pro Peer mit einem Holen-Knopf — das blanke worldId-Feld + Peer-Dropdown der Phase 1 ist weg. Ein deterministischer sha256-Content-Hash (der save-server rechnet ihn — `applyVendorBundle`/`readVendorBundle` liefern ihn als `bundleHash`) gibt einer Welt eine peer-unabhängige Identität; `_haveWorldByHashOrId` dedupt über id ODER Hash → die Katalog-Zeile zeigt „✓ vorhanden" statt eines Knopfes. `_vendorRegisterWorld` re-annonciert den `soul` → eine frisch angedockte Welt propagiert über das Mesh. Punkt 2-4 unten waren mit Phase 1 erfüllt.

**Ziel:** Welten reisen peer-to-peer. Eine Welt, die ein Spieler hat, kann ein anderer betreten, ohne dass sie im Repo liegt — die Spieler tragen die Bibliothek.

1. Eine vendorte Welt wird **content-adressiert** (Hash über ihr Bundle). W7 P2 streamt schon den Welt-Snapshot in 16-KiB-Stücken über die DataChannels — derselbe Mechanismus trägt ein Welt-Bundle (`world-bundle-pull`/`world-bundle-chunk`, Spiegel von `world-pull`).
2. Will ich das Portal einer Welt betreten, die ein Mitspieler hat und ich nicht, holt mein Client das Bundle peer-to-peer von ihm.
3. **Die ehrliche Schicht-Trennung:** das git-Repo ist die *persistente* Bibliothek (was committet ist, ist immer da); das Mesh ist die *lebende* Verteilung (Welten reisen zwischen Online-Spielern). Ein Browser-Tab ist ein schwacher Knoten — fällt er weg, ist die Welt nicht verloren, nur über das Repo oder einen anderen Peer zu holen. Keine reine Browser-Wolke trägt die Bibliothek allein; das Repo ist der Boden.
4. Eine peer-empfangene Welt läuft `trust:"sandboxed"` — eine fremde Welt von einem fremden Peer ist per Konstruktion ungeprüft; der Sandbox (V8.70) ist die Wand.

**Akzeptanz:** zwei Spieler im selben Mesh-Raum; einer hat eine Welt vendort, der andere nicht; der zweite holt ihr Bündel peer-to-peer, beide haben sie in der Bibliothek. ✅ erfüllt von Phase 1 (V8.73 — `smoke-webrtc.cjs` beweist es). Phase 2: er findet sie BROWSBAR im Katalog (kein worldId-Raten) + die Welt trägt einen Content-Hash. ✅ erfüllt von Phase 2 (V8.74 — `smoke-webrtc.cjs` prüft, dass A's Welt mit Label + echtem sha256-Hash in B's Katalog erscheint).

**Offene Ränder von W16 (ehrlich benannt — kein Blocker, denkbares Polish):**
- **Dev-verankert auf BEIDEN Enden.** Der Sender liest sein Bündel über `GET /api/vendor-bundle` (braucht seinen save-server), der Empfänger schreibt über `POST /api/vendor-world` (braucht seinen). Auf githack (kein save-server) degradiert es anmutig (`save_server_unreachable`/`world-bundle-fail`), aber W16 lebt in der Dev-Umgebung — wie W15. Eine save-server-lose Verteilung (ein Service-Worker, der ein In-Memory-Bündel ins Portal-iframe serviert) ist eine eigene spätere Schicht.
- **Nur Text- + `vendored`-Welten.** W15-Erbe: Binär-Assets werden nicht übertragen; eine importierte Manifest-Welt (kein `vendored`) hat keine lokalen Dateien → erscheint nicht im Katalog + wird nicht herausgegeben. Eine übersetzte Welt (`worlds/translated/` + `scene`) wäre metadaten-only transferierbar (kein Datei-Bündel) — eine denkbare spätere Ergänzung.
- **Kein Pull-Timeout.** Verstummt der Sender mitten im Chunk-Strom (Tab geschlossen), bleibt `pendingBundlePull` gesetzt, bis der nächste Pull es überschreibt (der `world-bundle-fail`-Pfad deckt nur „Sender kann nicht liefern", nicht „Sender verschwand"). Mirror von W7 P2 (`pendingWorldSnapshot` hat auch keinen Timeout) — ein weicher Timeout ist eine Politur.
- **Keine Hash-Verifikation des empfangenen Bündels.** Der Katalog trägt den Content-Hash, aber der Empfänger prüft nach dem Pull NICHT, ob sein selbst-berechneter Hash dem angekündigten gleicht. Die harten Wände stehen (die `worldId`-Annahme-Wand + die Sandbox); die Hash-Verifikation als zusätzliche Integritäts-Schicht ist eine denkbare Politur. Der Transport `requestWorldBundleFromPeer` bleibt id-basiert — die hash-bewusste Dedup sitzt allein in der UI.


#### W17 — Multiplayer-Sub-Welten: der Transport-Shim + das Mesh-als-Server (~6–8 Sessions, mehrere Phasen)

**Die Antwort auf „wie tauchen wir gemeinsam in eine Server-Welt?".** Niemand verlässt die Bibliothek.

**Phase A — der Transport-Shim.** Eine fremde Browser-Welt kann nur über `WebSocket`, `fetch`, `RTCPeerConnection`, `XMLHttpRequest` netzwerken — und alle vier sind globale Objekte. Der Auto-Vendor (W15) stellt der Welt-`index.html` ein kleines, von AnazhRealm geschriebenes **Shim-`<script>`** voran, das diese Globalen überschreibt, BEVOR der fremde Code läuft. Das Shim-`WebSocket` öffnet keinen echten Socket — es `postMessage`t an AnazhRealm. Die fremde Welt glaubt, sie habe einen Server; in Wahrheit fließt ihr Verkehr durch AnazhRealm. **Ein null-origin-iframe braucht dafür GAR KEINE Netz-Berechtigung** — `postMessage` quert die Sandbox-Grenze ohne CSP. Eine sandgesicherte Multiplayer-Welt ist so voll vernetzt, ohne je selbst ins Netz zu dürfen.

**Phase B — das Mesh-als-Server.** AnazhRealm empfängt den Shim-Verkehr und routet ihn über das W7-Mesh:
- **Relay-Welt:** das Mesh broadcastet — es IST der Server. Kein Host, kein externer Knoten.
- **JS-Compute-Welt:** ein Peer der Gruppe wird der **Compute-Host** — die Server-Logik der Welt (JS) läuft in seinem Tab; das Mesh trägt den Verkehr. Verlässt der Host, wandert die Rolle (Host-Migration — W7s `worldRole`-Mechanik kennt Host/Guest schon).
- **Native-Compute-Welt:** der Server als WASM in einem Peer-Tab, oder die Brücken-Welt (externer Server).

**Phase C — das Gruppen-Portal.** Ein Mesh-Raum gruppiert schon Spieler (W7 P4 Lobby). Öffnet einer ein Portal, bekommen die anderen einen Prompt „X öffnete ein Tor nach <Welt> — mitkommen?". Sagen sie ja, betritt jeder sein eigenes Portal-iframe; die iframes sind über das Mesh verbunden (jeder AnazhRealm relayt für sein eigenes iframe). Die Gruppe ist gemeinsam in der fremden Welt, ihr Multiplayer läuft auf dem geteilten Mesh. „Meta" (man sieht sich als AnazhRealm-Avatare im Vorraum) UND „direkt" (man ist zusammen IN der fremden Engine) — je nachdem, was die Welt zulässt.

**Phasen-Reihenfolge:** A (Shim) ✅ → B-Relay (das Einfachste, voll p2p) ✅ → C (Gruppen-Portal) ✅ → B-JS-Compute Phase 1 (der Compute-Host) ✅ V8.79 → B-JS-Compute Phase 2 (Host-Migration) ✅ V8.80 → B-WASM (per-Projekt, offen). Jede Phase eine eigene, browser-verifizierte Welle.

#### Phasen-Detailplan (Sub-Schritte, ausgearbeitet — Stand V8.80; Phase A + B-Relay + C + Multiplayer-Welt-Deklaration + B-JS-Compute Phase 1 + Phase 2 gebaut, offen nur B-WASM)

**Phase A — der Transport-Shim ✅ komplett (V8.75).** Ziel: der `WebSocket`-Verkehr einer fremden Welt quert die Sandbox-Grenze als `postMessage`; AnazhRealm empfängt ihn. Phase A routet noch NICHT (das ist B) — die Akzeptanz ist ein Loopback. Alle vier Sub-Schritte gebaut, playtest-grün (+9 Invarianten), browser-verifiziert (`smoke-shim.cjs`):
- **A1 ✅ der Shim selbst.** Die Konstante `PORTAL_TRANSPORT_SHIM` (JS-String im save-server, ~50 Zeilen): ersetzt `window.WebSocket` durch eine Shim-Klasse. Pro Instanz eine Kanal-id; `send(data)` → `parent.postMessage({__anazhNet:true, kind:"ws-send", channel, data}, "*")`; ein `message`-Listener fängt `{kind:"ws-recv"}` und feuert `onmessage`. `readyState`/`onopen`/`onclose` modelliert (das `onopen` nach einem Microtask). Unterstützt BEIDE Idiome (`ws.onmessage = …` UND `ws.addEventListener`). Phase A shimt NUR `WebSocket` (`fetch`/`XHR`/`RTCPeerConnection` sind bewusst spätere Schichten).
- **A2 ✅ Injektion zur Serve-Zeit.** `sendStaticFile` injiziert den Shim als ERSTES `<script>` in `<head>` einer Welt-`index.html`, wenn die Anfrage `?anazh-shim=1` trägt (der Query ändert die Basis-URL NICHT — relative Ressourcen lösen weiter auf; gelesen VOR dem V8.41-Query-Strip). Vor jeder Welt-CSP. Die Welt-Dateien auf der Platte bleiben unberührt. Dev-verankert wie W15/W16. — **Die offene Design-Frage (Serve-Zeit vs. eingebacken) wurde zugunsten der Serve-Zeit-Injektion entschieden** (Dateien bleiben rein).
- **A3 ✅ die Portal-Seite.** `portalMeta` trägt `multiplayer:true` (`_sanitizePortalMeta` whitelistet es, `buildStateSnapshot` persistiert es feldweise — V8.59-Lehre). `_buildPortalOverlay` lädt eine Multiplayer-Welt mit dem `?anazh-shim=1`-Marker. `_portalNetReceive` (im `onMessage`-Zweig `else if (msg.__anazhNet === true)`) nimmt die `__anazhNet`-Nachrichten an (Envelope + Kanal-id validiert, gegated auf `po.multiplayer`).
- **A4 ✅ Akzeptanz: Loopback.** `_portalNetReceive` echot ein `ws-send` direkt als `ws-recv` an dasselbe iframe zurück. `smoke-shim.cjs` beweist es: eine Test-Welt im echten `sandbox="allow-scripts"`-iframe öffnet einen Shim-`WebSocket`, sendet einen Ping, empfängt das Echo.

**Phase B-Relay — das Mesh-als-Server ✅ komplett (V8.76).** Ziel: der Shim-Verkehr aller Gruppen-Mitglieder wird über das W7-Mesh gebroadcastet — das Mesh IST der Server, kein Host. Alle drei Sub-Schritte gebaut, playtest-grün (+7 Invarianten), Zwei-Browser-verifiziert (`smoke-webrtc.cjs`):
- **B1 ✅ der `subworld-net`-Kanal.** Ein neuer Mesh-Nachrichtentyp `subworld-net` (`{worldId, data}`) — Zeile für Zeile das `companion-say`-Muster (Kanal-`ALLOWED`-Whitelist + expliziter signaling-server-Handler). `_portalNetReceive` macht aus einem `ws-send` einen `subworld-net`-Broadcast via `p2pSend` (broadcastet nur an Peers — der Sender bekommt seinen Verkehr nicht zurück, wie ein echter Relay-Server). `ws-open`/`ws-close` verfolgen die offenen Kanäle des iframes; `_portalNetDeliver` (der neue Empfänger) stellt eine mesh-empfangene Nachricht als `ws-recv` in jeden offenen Kanal zu.
- **B2 ✅ die Sub-Raum-Eingrenzung.** Der Sub-Raum-Schlüssel ist der Welt-Pfad (`po.world`); `_portalNetDeliver` verwirft eine Nachricht, deren `worldId` nicht zum eigenen Portal passt — sonst sähe ein Mesh-Mitspieler ohne Portal (oder in einem anderen Portal) fremden Sub-Welt-Verkehr.
- **B3 ✅ Rate-Limit + Größen-Deckel.** `_portalNetReceive` deckelt mit einem Fenster-Zähler (`SUBWORLD_NET_RATE_MAX` 120/s) + verwirft Übergröße/Nicht-String (`SUBWORLD_NET_MAX_BYTES` 16 KiB) auf BEIDEN Pfaden; der signaling-server deckelt als Backstop.
- **Akzeptanz ✅:** zwei Browser betreten dasselbe Relay-Multiplayer-Portal; A's `ws-send` erscheint bei B als `ws-recv` — peer-to-peer, kein echter Server (`smoke-webrtc.cjs`, beide Richtungen). Trägt Relay-Welten (Server = blosser Rebroadcast: viele einfache .io-Spiele, geteilter Zustand per Broadcast); NICHT Welten mit autoritativer Server-Rechnung (das ist B-JS-Compute).

**Phase C — das Gruppen-Portal ✅ komplett (V8.77).** Ziel: öffnet einer ein Portal, bekommen die anderen einen „mitkommen?"-Prompt. Alle drei Sub-Schritte gebaut, playtest-grün (+18 Invarianten), Zwei-Browser-verifiziert (`smoke-webrtc.cjs`):
- **C1 ✅ der `portal-invite`.** `enterPortal` ruft `_p2pBroadcastPortalInvite()` — broadcastet einen `portal-invite` (`{worldId, label}`, Mesh-Nachricht, Zeile für Zeile das `companion-say`-Muster: `ALLOWED`-Whitelist + signaling-server-Handler). Nur ein Multiplayer-Portal lädt ein; `_resolvePortalWorldId` löst die worldId aus dem Portal-Welt-Pfad gegen `_libraryWorlds()` auf (eine nicht-library-bekannte Welt lädt niemanden ein). `aimBlueprintAtWorld` trägt jetzt `multiplayer` aus dem Eintrag.
- **C2 ✅ der Prompt.** `_p2pHandlePortalInvite` legt die Einladung in `state.p2p.pendingInvite` + rendert `#portal-invite-banner` (ein fixes Tor-grünes Overlay-Element mit Mitkommen-/Schließen-Knopf). Gegated: nicht, wenn der Empfänger selbst gerade in einem Portal ist; verlässt der einladende Peer das Mesh, verfällt die Einladung.
- **C3 ✅ annehmen → mitreisen.** `joinPortalInvite` ruft `obtainPortalForWorld` + betritt das Portal direkt via `_buildPortalOverlay` — der Overlay erzwingt `multiplayer:true` (der Empfang der Einladung BEWEIST, dass die Welt multiplayer ist), sodass die B2-Sub-Raum-Eingrenzung die Gruppe verbindet. Hat der Spieler die Welt nicht, ehrlicher Hinweis (erst aus dem Welt-Katalog holen — W16).
- **Akzeptanz ✅:** A betritt ein Multiplayer-Portal, B bekommt den Prompt, nimmt an, beide sind im selben Multiplayer-Portal (`smoke-webrtc.cjs`).

**Phase B-JS-Compute Phase 1 ✅ komplett (V8.79) — der Compute-Host.** Für Welten, deren Server eine echte autoritative JS-Logik ist (nicht blosser Relay): ein Peer der Gruppe wird Compute-Host. `portalMeta.serverMode` (`relay`/`js-compute` — `_sanitizePortalMeta` whitelistet es + erzwingt `multiplayer`, `aimBlueprintAtWorld` trägt es, `buildStateSnapshot` persistiert es feldweise). Host-Wahl OHNE Präsenz-Tabelle: wer ein js-compute-Portal direkt betritt, wird Host (`enterPortal` → `computeRole:"host"`); wer einer Phase-C-Einladung folgt, wird Gast des Einladenden (`joinPortalInvite` → `hostPeerId = inv.peerId` — die Einladung trägt die Host-Identität schon). Der Host baut ein zweites, verborgenes null-origin-iframe — den Server-Kontext (`?anazh-server=1`, der save-server injiziert `PORTAL_SERVER_SHIM`, ein `WebSocketServer`-Global; fremder Server-Code läuft `sandbox="allow-scripts"` ALLEIN). Host-geroutetes Transport: ein Gast-`ws-send` geht NUR an den Host (`subworld-srv`, kanal-exklusiv), der Host feeds es in den Server-Kontext, die Server-JS rechnet, die Antwort kommt gezielt zurück (`subworld-cli`). +19 Invarianten, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — eine laufende Summe 12=7+5, von EINEM Server autoritativ berechnet).

**Phase B-JS-Compute Phase 2 ✅ komplett (V8.80) — Host-Migration.** Phase 1's ehrliche Grenze: verlässt der Compute-Host das Mesh, endet die Sub-Welt. Phase 2 schliesst sie: der Compute-Host annonciert seine Mitglieder-Roster (`subworld-roster`, kanal-exklusiv) an jeden Gast bei jeder `serverConns`-Änderung; jeder Gast cacht sie (`_portalRosterReceive`). Verlässt der Host das Mesh, ruft `_p2pRemovePeer` bei jedem Gast `_portalMigrateHost` — jeder wählt aus der gecachten Roster deterministisch denselben Nachfolger (die kleinste peerId ohne den Abgegangenen — wie die W7-P1-Initiator-Regel; kein Wahl-Protokoll, kein Announce). Der Nachfolger (`_portalPromoteToHost`) flippt `computeRole` guest→host + baut einen FRISCHEN Server-Kontext (`_portalSpawnServerContext`, aus `_buildPortalOverlay` extrahiert); die übrigen Gäste zeigen auf ihn + melden ihre Verbindung neu an. Ehrliche Grenze: der Server-Zustand geht verloren (der neue Kontext startet frisch — ein Handoff bräuchte, dass der alte Host vor dem Gehen serialisiert, unmöglich bei einem Absturz). +12 Invarianten, Zwei-Browser-verifiziert (`smoke-webrtc.cjs` — A verlässt das Mesh, B wird Compute-Host, B's Verkehr läuft durch B's frischen Server, die Summe startet bei 0).

**Phase B-WASM (per-Projekt, offen).** Ein Rust→WASM-Server in einem Peer-Tab, oder die Brücken-Welt (externer Server). Bewusst „per-Projekt, nicht automatisch" — manche native Server portieren sauber, manche nie; der Auto-Vendor klassifiziert ehrlich. Eine kleine Naht bleibt: `serverMode` durch die ganze Vendor-/Mesh-Kette tragen, damit eine VENDORTE js-compute-Welt sich selbst deklariert (wie V8.78 für `multiplayer` — V8.79/V8.80 deklarieren `serverMode` über die Portal-Nähte, nicht die volle Vendor-Kette).

**Akzeptanz (Gesamt-W17):** eine Gruppe in einem AnazhRealm-Raum tritt gemeinsam durch ein Portal in eine vendorte Relay-Multiplayer-Welt; sie sehen einander dort, ihr Verkehr fließt peer-to-peer über das Mesh, kein echter Server existiert.

**Ehrliche Grenzen des Bogens:**
- Ein Browser-Tab als Compute-Host ist schwach (Hintergrund-Drosselung, begrenzte CPU, schließt jederzeit) — Host-Migration mildert, beseitigt es nicht. Gut für Koop, rau für kompetitive Twitch-Spiele.
- Latenz: ein peer-gehosteter Server hat die Latenz des Hosts.
- Rust→WASM ist nicht automatisch — manche native Server portieren sauber, manche nie. Der Auto-Vendor klassifiziert ehrlich; eine nicht-portierbare Welt wird eine Brücken-Welt, kein Versprechen-Bruch.
- Eine Brücken-Welt braucht einen externen Server — Repo + Mesh tragen sie nicht allein. Aber der Eintritt bleibt das AnazhRealm-Portal, mit der Gruppe.

**Vision-Wort:** „**Man muss die Bibliothek nicht verlassen, um gemeinsam ein Buch zu lesen.** Manche Bücher liest man von den Regalen der Bibliothek selbst, manche durch ein Fenster zu einem fernen Turm — aber immer von hier aus, immer zusammen."

---

### Offene Punkte nach V8.80 — eingeplant (Audit 2026-05-18)

Ein Selbst-Audit nach V8.80 sammelte alle ehrlich-benannten offenen Punkte und plant sie hier nach Priorität ein. Drei Kategorien: **konkrete Wellen** (klar umrissen, abschließbar), **bewusst per-Projekt** (kein Versäumnis — die Heilige Lektion korrekt angewandt) und **Doc-Sync**.

**Konkrete Wellen — in Reihenfolge:**

| # | Welle | Was | Aufwand | Stand |
|---|---|---|---|---|
| 1 | **W12 P3-Härtung** | `_portalReceiveEvent`-Rate-Limit — der Portal-Rückkanal (Sub-Welt → Heimat-Journal) deckelt die Ereignisse je Sekunde (Fenster-Zähler, Spiegel von `_portalNetReceive` B3). V8.53 als „W14 (fremde Welten) MUSS" geflaggt; mit den vendorten Sandbox-Welten (V8.70/71/73) ist das Szenario real geworden — eine flutende fremde Welt verdrängte sonst das 200-Eintrag-Journal in Sekunden. | ~1 Session | ✅ **live (V8.81)** |
| 2 | **W17 P-Vendor** | die `serverMode`-Vendor-Ketten-Naht — `serverMode` fliesst durch die ganze Vendor-/Mesh-Kette (Spiegel von V8.78 für `multiplayer`): `_sanitizeImportedManifest`, `_vendorRegisterWorld`, `vendorWorldBundle`/`-FromRepo`, `_p2pBuildCatalog`/`-Sanitize`/Katalog-Signatur, signaling-server-`soul`-Handler, Bündel-Transfer, `exportWorldManifest`, ein `serverMode`-Vendor-Bedienelement. Ohne sie verliert eine VENDORTE js-compute-Welt still ihren `serverMode` → sie degradiert zu relay, die autoritative Server-JS läuft nie. | ~1 Session | ✅ **live (V8.82)** |
| 3 | **W4 V2** | Lofi-Musik-Schicht (Pad-Layer 60 BPM, emotion-moduliert) — siehe §2-Tabelle. | 1-2 Sessions | ✅ **live (V8.84)** |
| 4 | **W16-Politur** | (a) Hash-Verifikation des empfangenen Welt-Bündels (der Katalog trägt den Content-Hash, der Empfänger prüft ihn nach dem Pull — bei Abweichung wird die Welt verworfen); (b) ein weicher Pull-Timeout (`_p2pCheckBundlePullTimeout` aus `p2pTick` gibt einen hängenden Pull nach 30 s frei). | ~1 Session | ✅ **live (V8.96)** |
| 5 | **W10 ext.** | ✅ **VOLLSTÄNDIG** — vier weitere Affordances, räumliche Analyse + Welt-Reaktion, KEIN Form-Whitelist. `radiating` (V8.97) + `broadcasting` (V8.98) + Stärke-Politur (V8.99, die Wirkung skaliert mit der Substanz) + `balancing` (V9.00) + `lifting` (V9.01 — ein magie-geladenes leichtes Compound erzeugt ein Auftriebs-Feld, die erste physik-gekoppelte Reaktion). Sieben Affordances, ein Muster. | erledigt | ✅ 4/4 + Stärke-Politur |
| 6 | **W15-Politur** | Branch-Namen mit Slash (`feature/x`) im GitHub-Fetch auflösen (braucht eine SHA-Auflösung vor der Trees-API). | ~0.5 Session | ✅ **live (V9.02)** |
| 7 | **W6.G P3-Rest** | Terrain-Höhlen/Überhänge/Klippen. **Phase 1 ✅ (V9.03 — Felsformationen)**: `felsbogen` + `felsturm` als emergente Compound-Architekturen. **Echte Höhlen/Tunnel/Überhänge** sind seit V9.07 in den **Voxel-Terrain-Bogen** überführt (siehe unten — der Schöpfer-Reframe: das Heightfield wird ein 3D-Dichte-Feld; die alte „Portal-Höhle Phase 2" ist damit überholt). | Phase 1 erledigt; der Rest → Voxel-Bogen | ✅ Phase 1 (V9.03); Rest → Voxel |
| 8 | **W6.G P4 — das Terrain wird Materie** | Schöpfer-Befund: alles Materielle spricht die Hylomorphismus-Sprache, nur das Terrain nicht — der Boden abbauen gab nichts. Ein Grabe-Hieb yieldet jetzt Material aus `_terrainMaterialAt` (die dominante `worldFieldAt`-Achse → erde/stein/glut/quarz) — die Farbe = das Material. Kein Voxel-Rewrite, keine Biom-Tabelle. | erledigt | ✅ **live (V9.04)** |
| 9 | **Visuelle Synergie Struktur/Terrain** | Volumenkörper (Bauwerke, Felsen) wirken aufgesetzt-starr auf dem Terrain-Sheet — kein Einbetten, keine Verzahnung (Schöpfer-Befund V9.03). Ein Sockel/Saum am Strukturfuss, leichte Terrain-Verformung um die Standfläche, weniger Box-Starrheit. Ästhetik-Welle. | 1-2 Sessions | 🔴 offen |

#### W4 V3 — die generative Symphonie (Schöpfer-Wunsch 18.05.2026) — ✅ VOLLSTÄNDIG (V8.85-V8.93)

Der Schöpfer-Befund nach V8.84: die Lofi-Schicht ist „noch starr, hardcoded, keine Melodien" — „Symphony, doch ein Brummen". Die Antwort: Musik wächst aus wenigen Regeln + einem Seed, wie die Welt selbst. Ein Song = `worldMeta.seed` + Regel-Schichten; jede Welt bekommt ihr eigenes Lied, es atmet mit Emotion/Welt-Feld/Tageszeit. Genre (Jazz/HipHop/Lofi) = ein **Parameter-Preset** EINER Engine, kein eigenes System. Alle vier Phasen sind gebaut (V8.85 Harmonie, V8.87/90 Melodie, V8.91/92 Groove, V8.93 Orchester); ein Genre-Wähler-UI bleibt eine benannte kleine Folge-Naht. Vier Phasen:

| Phase | Was | Stand |
|---|---|---|
| 1 — Harmonie | die feste Akkord-Schleife → eine seed- + emotion-getriebene funktionale Markov-Progression (Tonleiter + Stufen-Übergangs-Gewichte; joy/hope → helle Stufen, sorrow → dunkle) | ✅ **live (V8.85)** |
| 2 — Melodie | eine Lead-Stimme improvisiert über den aktuellen Akkord (Akkord-/Durchgangston-Regel, Kontur, Dichte aus Emotion) — das fehlende „keine Melodien" | ✅ **live (V8.87)** |
| 3 — Groove | eine Rhythmus-Schicht (Kick/Snare/Hihat synthetisch) + Swing; Genre = Parameter-Preset (Swing, Tempo, Akzente, Timbre) | ✅ **live (V8.91)** — Kick/Snare/Hihat + Swing; Genre-Wähler-UI eine kleine Folge-Naht |
| 4 — Orchester | mehr Synth-Stimmen (Bass folgt den Akkord-Wurzeln, Pad, Lead), Stimmen-Zahl wächst mit der Welt-Stimmung | ✅ **live (V8.93)** — Bass auf den Kick-Schritten + emotion-gesteuerte Oktav-Dopplung des Pads |

**Tradeoff:** generative Musik kann ziellos klingen — jede Phase braucht ein Schöpfer-Browser-Ohr (wie die Shader: headless prüft Funktion, der Browser prüft Erfahrung).

**Bewusst per-Projekt / dauerhaft aufgeschoben (kein Versäumnis — die Heilige Lektion):**
- **B-WASM** — ein Rust→WASM-Server im Peer-Tab, Stufe 4 der Server-Taxonomie. Kein baubares Feature: manche native Server portieren sauber nach `wasm32`, manche nie; der Compute-Host-Mechanismus (V8.79/80) trägt einen wasm-Server strukturell schon. Vorbedingung: Binär-Asset-Vendoring + eine echte Test-Welt. Spekulativ zu bauen verletzte „keine Validierung für Szenarien, die nicht eintreten".
- **Binär-Asset-Vendoring** — der Vendor-Pfad trägt nur Text; `.png`/`.glb`/`.wasm` werden gefiltert. Wird konkret, sobald B-WASM eine echte Welt hat (dann base64-kodiert mitschreiben).
- **fetch/XHR/RTC-Transport-Shims** — Phase A shimt nur `WebSocket`; die übrigen Netz-APIs sind bewusste spätere Schichten (gebaut, wenn eine Sub-Welt sie braucht).
- **save-server-lose Verteilung** (Service-Worker) — eine eigene Architektur-Schicht.

**Doc-Sync (mit diesem Audit erledigt):** §1-Header V8.70→V8.80; Ring-5-Zeile (war „🔴 offen", ist seit V2 live); der 6.G-Phase-3-Text in der „Welle 6 ALT"-Tabelle (listete W6.G4-erledigte Punkte noch als offen). Rest-Drift im historischen „Welle 6 ALT"-Block (z. B. 6.H Phase 2E) bewusst stehen gelassen — der §2-Tabellenkopf ist die kanonische Status-Quelle.

---

#### Der Voxel-Terrain-Bogen — das formbare Terrain (geplant, 19.05.2026)

**Schöpfer-Einsicht nach V9.06:** „Voxel-Terrain scheint der wahre Weg — alles andere fake, nicht die volle Vision." Richtig. Das Heightfield ist eine HALB-formbare Welt: man kann Säulen heben/senken, nicht schnitzen. Der Felsbogen (V9.03, ein Trilithon AUF dem Terrain) und die Portal-Höhle (ein separater Raum) sind ehrliche Ingenieursarbeit MIT einem Heightfield — aber Workarounds. Die Vision (§1.3 fraktal, der Spieler als Co-Schöpfer, Materie ist formbar) verlangt, dass der **Boden selbst** wahre, formbare Materie ist: echte Tunnel, echte Höhlen, echte Überhänge — in den Hügel geschnitzt, nicht daneben gestellt.

**Zur Heiligen Lektion:** sie warnt vor *Komplexität OHNE Fundament* (der 19-Modul-Kollaps). Ein Voxel-Terrain ist NICHT 20 Module — es ist EIN Subsystem (das Heightfield) durch seine wahrere Form ersetzt, auf einem heute soliden Fundament (~2850 Invarianten, ein erprobtes Chunk-System). Es ist ein grosser Wachstumsring, kein Re-Komplexifizieren — solange er **phasiert + parallel + jede Phase playtest-grün** gebaut wird.

**Was das Projekt schon trägt** (es ist überraschend gut positioniert):
- Chunk-Streaming + Distance-Culling — bleibt unverändert.
- `btBvhTriangleMeshShape`-Kollision aus Chunk-Vertices — bleibt (ein Voxel-Mesh liefert dieselbe Kollision).
- `caveNoise.noise3D()` — die 3D-Noise-Infrastruktur ist schon da.
- `aField`-per-Vertex (Terrain-Shader) — trägt über.
- `chunkDeltas` (persistierte Welt-Modifikationen) — werden 3D-Edits statt 2D.
- V9.03 Felsformationen + V9.04 Terrain-als-Materie — bleiben (Felsen + Grabe-Yield AUF/IN dem Voxel-Terrain).

**Disziplin:** das Voxel-Terrain wird PARALLEL gebaut + bewiesen, bevor es das Heightfield ablöst — nie das Funktionierende brechen. Hinter einem Flag, bis solide.

**Phasen:**
1. **✅ ERLEDIGT (V9.07) — das Dichte-Feld + Surface Nets (ein Chunk).** `_terrainDensityAt(x,y,z)` — 3D-Noise, >0 fest / <0 Luft, mit echten Höhlen + Überhängen. `_voxelChunkGeometry` — Surface Nets (statt einer fehler-anfälligen 256-Marching-Cubes-Tabelle die explizite Zwei-Pass-Form). `_spawnVoxelTestChunk` + Chat `voxel test` — der Beweis-Chunk. Parallel-System, kein Eingriff ins Heightfield. +10 Invarianten.
2. **Kollision + Chunk-Streaming.** **Phase 2a ✅ ERLEDIGT (V9.08) — Voxel-Chunk-Kollision.** Der gemeshte Voxel-Chunk bekommt `btBvhTriangleMeshShape` über den generisch extrahierten `_buildStaticTriMeshCollision` (eine Sprache für Inseln + Voxel-Chunks); `_spawnVoxelTestChunk` baut + räumt die Kollision. **Phase 2b ✅ ERLEDIGT (V9.09) — der Voxel-Chunk-Ring.** Voxel-Chunks streamen um den Spieler (`_ensureVoxelChunkAt`/`_tickVoxelChunkStreaming`/`_pruneDistantVoxelChunks` — Spiegel des Heightfield-Streamings); `state.voxelTerrainActive` (Default aus) schaltet um — aktiv ruht das Heightfield (`_setHeightfieldDormant`: Mesh/Gras unsichtbar, Kollision aus dem physicsWorld, reversibel), der Voxel-Ring streamt; Chat `voxel terrain on`/`off`. Der Spieler geht durchgehend auf Voxel-Terrain. +9 Invarianten. **Phase 2b-Politur ✅ ERLEDIGT (V9.10/V9.11)** — Schöpfer-Browser-Befund „Übergänge nicht sauber, alles ein Biom": V9.10 = der 1-Zellen-Naht-Skirt (`_ensureVoxelChunkAt` mesht `dim+1` Zellen → Überlappung) + per-Vertex-Welt-Feld-Farbe (`_attachVoxelFieldColors`). V9.11 = die Naht-Wurzelheilung: in `_voxelChunkGeometry` Pass 2 aliaste `ci(dim,j,k)` an der Randebene in einen fremden Zell-Slot → ein Streck-Dreieck an jeder Chunk-Naht; ein `cv(i,j,k)`-Helfer (−1 für jeden out-of-range Index) schliesst es. V9.12 = der Chunk fasst das ganze Oberflächen-Band: er war ein 45-m-Würfel, das Band reicht aber ~`base±30` → Klipp-Löcher; `_voxelChunkGeometry` ist jetzt nicht-würfelförmig (`dimX/dimY/dimZ`), der Chunk eine 72-m-Säule. +8 Invarianten. **Phase 2c ✅ ERLEDIGT (V9.13) — per-Welt-Persistenz.** `setVoxelTerrainActive` schreibt `worldMeta.voxelTerrain` + `saveState` (das `gameMode`-Muster); `_restoreVoxelTerrain` aktiviert das Voxel-Terrain beim Welt-Aufbau, wenn das Flag gesetzt ist — eine Welt bleibt voxel-basiert über Reload + Welt-Wechsel. +6 Invarianten. (Das „Voxel"-Häkchen im Neue-Welt-Dialog ✅ V9.21 — eine Welt wird voxel-basiert geboren, `createNewWorld({voxelTerrain})` setzt `worldMeta.voxelTerrain`.)
3. **✅ ERLEDIGT (V9.14/V9.15) — 3D-Graben + Aufschütten.** `carveVoxelSphere` schnitzt eine Kugel „Luft", `fillVoxelSphere` schüttet eine Kugel „Fest" auf (gemeinsamer `_addVoxelEdit`, `mode:"carve"|"fill"`); der Edit landet in `worldMeta.voxelEdits` (persistiert, FIFO-256), `_terrainDensityAt` zieht ab / addiert, die Voxel-Chunks werden neu gemesht. LMB gräbt, RMB schüttet auf (bei aktivem Voxel-Terrain ohne Bau-Modus); Chat `voxel carve`/`voxel fill`. +13 Invarianten. Der Voxel-Boden ist voll formbar. **Politur (V9.16)**: die Voxel-Normalen kommen aus dem Dichte-Gradienten (`−∇d`) statt aus `computeVertexNormals` — kein hartes Facetten-Rauten-Muster mehr. **Phase 3c (V9.17)**: der Material-Erhaltungs-Kreis — im pfad-Modus kostet das Aufschütten Material aus dem Inventar (`_voxelFillGate`, Spiegel von `_buildMaterialGate`), in frieden + schöpfer frei.
4. **✅ ERLEDIGT (V9.18 + Politur V9.19 + Grösse V9.20) — Höhlen + Überhänge + Massstab in der Generierung.** `_terrainDensityAt` trägt: eine fraktale 2D-Oberfläche aus drei Oktaven (kontinental `0.0042×26` ≈ 35 Chunks, ridged `(1−|noise|)²×22` für Grate/Felswände, fein `0.045×4`), die zwei V9.17-3D-Roughness-Bänder (Crags, Überhänge) + Wurm-Höhlen aus EINEM ridged-Noise-Feld (`1−|noise3D|`, der Grat folgt der Noise-Nullfläche → zusammenhängende begehbare Kavernen). Eine Tiefen-Hüllkurve hält die Höhlen zwischen `surf-6` und `base-28`. Der Voxel-Chunk wuchs mit dem Band (V9.20: `dimY` 40→68, `oy=base-50`, 122-m-Säule — fasst `base-50..base+72`, die V9.12-Garantie hält). V9.19 heilte zwei V9.18-Befunde (feines Band restauriert, Höhlen aus einem Feld), V9.20 den V9.19-Befund (Massstab durch Oktaven-Hierarchie). +3 Invarianten.
5. **Materialien + Shader + Politur + Ablösung.** Cel-Shading (MeshToonMaterial), per-Vertex-Welt-Feld-Farbe (V9.10), Terrain-Material-Harvest (V9.04, geteilt seit V9.14) sind ✅ live. **Voxel-Gras ✅ V9.22** — der Voxel-Boden grünt mit eigenem Instanced-Gras. **Phase 5a ✅ V9.23 — Voxel als Default für neue Welten** (Schöpfer-Wahl „schrittweise"): `createNewWorld` baut neue Welten per Default voxel-basiert, die Dialog-Checkbox ist zum Heightfield-Opt-out gekippt; alte Welten + die Eingangs-Welt behalten ihr Heightfield. **V9.24 — die Verbindungen geheilt**: der Sicht-Ring-Regler greift jetzt in einer Voxel-Welt (`_voxelChunkConfig().ringRadius` folgt `chunkRingRadius`), und die Welt-Affinitäts-Vegetation streamt mit den Voxel-Chunks (`_populateVoxelChunkVegetation`, Strukturen auf dem Voxel-Boden). **Phase 5b ✅ V9.25 — die Voxel-Welt wird höhen-ehrlich**: `getTerrainHeightAt` ist voxel-aware (`_voxelSurfaceY`), Wasser/Killplane/`findSurfaceAbove`/Kreatur-Spawn/Genesis-Plattform erben die wahre Höhe. **Phase 5c-Start ✅ V9.26**: (a) Chunk-Loch-Heilung — `dimY` 68→80, `oy=base-58`, Marge ~22 gegen ridged-Spike-Löcher am erweiterten Sicht-Ring (der V9.20-Chunk passte nicht für die Rand-Chunks bei Sicht-Ring 4-8); (b) Migrations-Flip in `ensureWorldMeta` — eine GELADENE alte Welt ohne `voxelTerrain`-Flag wird voxel-basiert; eine FRISCHE Eingangs-Welt (Playtest, brandneuer Spieler) bleibt heightfield; ein expliziter Heightfield-Opt-out bleibt heightfield. **Phase 5c.1 ✅ V9.27 — die Heightfield-Generierung für Voxel-Welten übersprungen**: der Gate in `generateTerrainWithParameters` liest `worldMeta.voxelTerrain` (von V9.26-Migration + `_preloadActiveWorldMeta` gesetzt, BEVOR `generateNewWorld` läuft); bei `true` wird der 64-Chunk-Initial-Loop ganz übersprungen, das `terrainMaterial` bleibt erhalten (Reversibilität: `voxel terrain off` lädt vom Streaming-Ring nach). +3 Invarianten. **Phase 5c.1+ ✅ V9.28 — V9.25 Phase 5b ehrlich abgeschlossen + heightData-Skip**: (a) `updateCreatures` war der letzte missed Höhen-Konsument aus V9.25 (las `groundHeightField` direkt am voxel-aware `getTerrainHeightAt` vorbei) — jetzt route auch dieser Pfad voxel-aware; (b) damit liest in einer Voxel-Welt niemand mehr `groundHeightField`/`minHeight`/`maxHeight` → die 256×256×3-Float-Allokation (~768 KB) + die 65k-Noise-Schleife wird komplett übersprungen, der Heightfield-Waterfall-Loop (las heightData direkt) mit-gegated. +7 Invarianten. **Phase 5c.1++ ✅ V9.29 — Ammo-Heap-Leck-Fix der Heightfield-Chunks**: `Ammo.destroy(body)` cascadiert NICHT zu seinen Auxiliars; V9.29 zentralisiert in `_disposeChunkPhysics(mesh)` (drei Konsumenten — Welt-Regen, Streaming-Prune, Ring 10.5 terrain-Mod). Build-Pfade speichern alle Ammo-Refs in userData. +5 Invarianten. **Phase 5c.2.a ✅ V9.30 — Heightfield-Code-Entfernung Schritt 1: tote Methoden**: `generateChunk` (~97 Z.) + `addTerrainPhysics` (~104 Z.) als nachweislich tote Methoden gelöscht (V9.28-Befund — Zeile-13549-Versprechen erfüllt). ~200 Z. Heightfield-Altcode weg, NULL Verhaltens-Änderung. +5 Invarianten (Lösch-Beweis + 3 Regression-Schutzanker). **Phase 5c.2.b-Vorbereitung ✅ V9.31 — Ammo-motionState-Leck + voxel-aware Boden-Selbstanalyse**: der erste Versuch des Eingangs-Welt-Flips deckte zwei vorbestehende Bugs auf — (i) `_buildStaticTriMeshCollision` (Inseln + Voxel-Chunks) leakte `btDefaultMotionState`; V8.26-§6.4-Muster auf statische Tri-Mesh-Kollisionen NICHT angewandt, mit 81 Voxel-Chunks × Welt-Regens kam OOM. (ii) `selfAwarenessAnalyze` + Game-Loop-Boden-Check prüften nur `groundChunks` — in einer Voxel-Welt LEGITIM leer, Welt-Regen-Death-Spiral wäre die Folge gewesen. V9.31 heilt beide; 5c.2.b (Eingangs-Welt-Flip + ~25 Test-Migrationen) wartet auf eine eigene saubere Welle. +3 Invarianten. **Phase 5d-Mini ✅ V9.32 — Voxel-Wasserfälle aus der Klippen-Steilheit**: `_buildVoxelChunkWaterfalls(cx, cz)` sampelt pro Voxel-Chunk 6×6 Stellen, misst Steilheit via `_voxelSurfaceY`-Gradient, spawnt Partikel-Wasserfall bei ≥4 m Höhen-Drop. Partikel teilen `state.waterfalls`-Animation; Lifecycle analog Gras (V9.22) + Vegetation (V9.24). Vierte Voxel-Chunk-Schicht in derselben Spawn-Sprache. +6 Invarianten. **Phase 5c.2.b ✅ V9.33 — der Eingangs-Welt-Flip + die ~7 pre-existing Heilungen**: V9.31 nannte das Versprechen — V9.33 liefert es. (1) `ensureWorldMeta` ohne `!fresh`-Gate → fresh-Welten erben den Voxel-Default; (2) `createNewWorld` setzt `voxelTerrain` EXPLIZIT (sonst trägt der `_buildEmptyWorldSnapshot`-Spread den `voxelTerrain:true`-Wert der laufenden Voxel-Eingangs-Welt in eine Opt-out-Welt — V8.59-Lehre); (3) `chunkMap.clear()` symmetrisch zu `groundChunks=[]` in `generateTerrainWithParameters`-Cleanup (pre-existing Bug seit `ensureChunkAt`-Geburt); (4) `generateNewWorld` synct `voxelTerrainActive` mit `worldMeta.voxelTerrain` (sonst akkumulierten Voxel-Chunks bei V9.27-style Test-Welt-Regens, OOMs durch die Decke); (5) `_buildStaticTriMeshCollision` mit Partial-Build-Cleanup im try/finally — bei OOM partway werden ALLE bis-dahin allokierten Ammo-Auxiliars destroyed (vorher: jeder partial-OOM leakte seinen Heap → Snowball); (6) `state.chunkGrass = new Map()` explizit in init (Audit-Strict-Heilung — voxel skippt Heightfield-Lazy-Init); (7) ~7 Playtest-Tests voxel-aware (Pre-P1-Reset via setVoxelTerrainActive(false), 6.A3 Cache-Invalidate, 6.A4 Tempel-y=200 über Voxel-Surface, W10 natürliche Strahler cleanup, 6.G3.b weather-200s-Offset). +3 neue Invarianten (Eingangs-Welt voxel-default + voxelTerrainActive true + Welt-Terrain gefüllt — voxel ODER heightfield), −1 alte (V9.09 „defaultOff" durch „defaultActive"-finalState-Probe ersetzt). 5/5 Playtest-Runs grün, Audit-Strict 0 Failures. **Noch offen — Phase 5c.2.c**: das schlafende heightfield-Skelett vollständig ablösen (`_terrainHeightAtWorld`, `ensureChunkAt`, `groundHeightField`, `_setHeightfieldDormant`, `populateChunkVegetation`-Heightfield-Pfad). Eine eigene grosse Welle — V9.33 ist die Voraussetzung, jetzt erfüllt.

**Ehrliches Risiko:** gross. Marching Cubes ist rechenintensiver als ein Heightfield-Grid; die Save-Migration alter Heightfield-Welten; die schiere Menge (Mehr-Sessions-Bogen). Darum die Disziplin: parallel, phasiert, jede Phase grün — und ein Browser-Beweis pro Phase (headless prüft die Mechanik, das Schöpfer-Auge die Erfahrung).

---

### Voxel-Surface-Politur (V9.40+) — Schöpfer-Audit nach V9.39 (Browser-Test, 20.05.2026)

Phase 5c.2.c.3 hat die heightfield-only Chunk-Pipeline vollständig zurückgebaut (V9.39). Ein Schöpfer-Browser-Test danach brachte fünf substanzielle Befunde — alle ehrlich, alle auf einer Wurzel-Ebene. Sie sind in Wellen V9.40–V9.43 eingeplant; Disziplin: vom *fühlbaren* Bug zur Politur, in disziplinierten Schritten.

| # | Welle | Was | Wurzel | Aufwand | Stand |
|---|---|---|---|---|---|
| A.1 | **V9.40-a** ✅ | Maus-Voxel-Edits via P2P-Broadcast: `tryMouseBreak`/`tryMousePlace` rufen jetzt `dslRun(["voxel_carve"|"voxel_fill", x, y, z, r], {source:"human"})` statt der DSL-Op zu umgehen — Spiegel von V8.64-confirmBuild. Lokal identisches Verhalten (DSL-Op ruft am Ende dieselbe Funktion), aber `dslRun` mit `source:"human"` broadcastet automatisch. Material-Yield + Inventar-Ping + Material-Konsum-Gate bleiben lokal nach dem dslRun-Call (Spieler-private Inventar-Gesten). | Pfad-Doppelung Maus-vs-Chat. | ~30 Min | ✅ V9.40-a |
| A.2 | **V9.40-b** ✅ | V9.24-Symptom-Geste an der Wurzel umgekehrt: `_buildVoxelChunkData` baut den frischen Chunk isoliert; `_rebuildVoxelChunk` ist der atomare Swap (bei OOM bleibt der alte stehen, kein Loch); `_remeshVoxelChunksAround` ruft `_rebuildVoxelChunk` statt `_disposeVoxelChunk + _ensureVoxelChunkAt`. Synchron wie das Original (das Async-Versprechen war ein Test-Bremser — die Voxel-Initial-Spawn-Tests sind timing-flaky im Headless, ein zusätzlicher Game-Loop-Hook verschiebt das Timing in den roten Bereich; siehe V9.40-c). `_ensureVoxelChunkAt` (Initial-Spawn) bleibt unverändert beim erprobten V9.07-Pattern. | V9.24-Symptom-Heilung wurde Schuld. | ~1 Session | ✅ V9.40-b |
| A.5 | **V9.40-e** ✅ | Drei Heilungen nach zweitem Schöpfer-Browser-Audit: (1) `_addVoxelEdit` clampt Y + verwirft Edits weit außerhalb des Chunk-Bands (Schöpfer-Hinweis ehren). (2) `_disposeVoxelChunk` räumt `voxelRebuildAttempts` mit (Memory-Hygiene). (3) `_ensureVoxelChunkAt` (Streaming-Pfad) bekommt Retry-Counter wie der Re-Mesh-Pfad — vor V9.40-e Asymmetrie: Edit-Chunks bekamen 3 Versuche, Stream-Chunks 1; jetzt symmetrisch. Bei Stream-OOM: kein Map-Eintrag → nächster Tick retried; nach 3 Fails empty. 9 neue Invarianten, 5/5 Läufe grün. | Schöpfer-Befund „neu generierte Chunks fehlerhaft" + V9.40-d-Asymmetrie zwischen Bau-Pfaden. | ~1 Session | ✅ V9.40-e |
| A.6 | **V9.40-f** ✅ | **Ammo-Heap an der WASM-Wurzel geheilt.** Schöpfer-Browser-Test nach V9.40-e: weiterhin OOMs (Ring 8 = 17×17 = 289 Chunks eingestellt). Wurzel an WASM-Schicht gemessen: vendored `ammo.wasm.wasm` ist Emscripten ohne `ALLOW_MEMORY_GROWTH=1` gebaut, Memory-Section `initial=max=1024 pages` (64 MB, NICHT growable). V9.40-a..e haben Symptom-Schicht geheilt, Wurzel blieb. Zwei-Schicht-Heilung: (1) `scripts/patch-ammo-memory.cjs` patcht WASM-Header `max 1024→4096 pages` (256 MB), idempotent, via `postinstall`-Hook automatisch. (2) `vendor/ammo-bootstrap.js` setzt `Module.instantiateWasm` mit pre-grow auf 256 MB direkt nach Instantiate (Emscripten-Allocator ruft `memory.grow()` ohne Build-Flag NIE selbst). Drei subtile Fallen: (a) CSP blockt inline → externes Script Pflicht, (b) Ammo's IIFE liest NUR sein Argument → `Ammo(window.Module)` statt `Ammo()`, (c) `ArrayBuffer.maxByteLength` ist Snapshot, der Beweis ist `mem.grow()`-Test. Browser-Verifikation: Default Ring 4 → 0 OOMs, 0 empty. Ring 8 → -69 % OOMs + -69 % empty. | V9.40-a..e symptom-Heilungen; WAHRE Wurzel war WASM-Memory-Cap. | ~3 Sessions | ✅ V9.40-f |
| A.4 | **V9.40-d** ✅ | Dispose-Before-Build heilt Ammo-Heap-OOMs: `_rebuildVoxelChunk` disposed ZUERST den alten (Kollision + Geometrie + Heap-Speicher), DANN baut den frischen. Alter + neuer teilen sich nie den Ammo-Heap → keine OOM-Kaskaden mehr. Plus `voxelRebuildAttempts`-Retry-Counter: bei Fail wird der Chunk wieder dirty markiert + Counter inkrementiert; nach 3 Fails ehrlich `{empty:true}`. **Schöpfer-Browser-Test nach V9.40-c**: Wurzel war V9.40-b's Pre-Build-Pattern (alter+neuer parallel im Heap). V9.40-b's „alter bleibt bei OOM"-Versprechen war zirkulär — es maskierte die wahre Wurzel. 6 neue Invarianten, 8/8 Läufe grün. | V9.40-b's Pre-Build-Pattern liess alten+neuen parallel im Ammo-Heap leben. | ~1 Session | ✅ V9.40-d |
| A.3 | **V9.40-c** ✅ | Async-Rebuild: `state.dirtyVoxelChunks` Set; `_remeshVoxelChunksAround` markiert dirty; `_tickDirtyVoxelChunks(playerPos)` im Game-Loop rebuildet ≤1 Chunk/Frame (nächster am Spieler zuerst); `_drainDirtyVoxelChunks()` ist die **Test-Naht** für sync-Drain. `_disposeVoxelChunk` räumt dirty-Marker mit. Bisect-Lehre aus V9.40-b: Code-seitige Workarounds (Throttle, conditional registration) für das Timing-Verschieben des Hooks scheiterten alle; die Test-Naht ist der ehrliche Pfad — voxelP2bResults ruft `_drainDirtyVoxelChunks()` + 50× `_tickVoxelChunkStreaming` synchron, BEVOR die Asserts laufen (Mess-Punkt an die Mechanik, V8.57-Disziplin). Heilt das Ruckeln bei häufigen Edits. 6 neue Invarianten, 6/6 Läufe grün. | Ruckel beim Carve/Fill (synchroner Rebuild aller 9 Skirt-Nachbarn). | ~1 Session | ✅ V9.40-c |
| B | **V9.41** ✅ | Schach-Brett-Diagonalen. `quad(a, b, c, d, parity)` triangulieren gerade Parität a→c, ungerade b→d. Drei Emit-Stellen geben `parity = (i+j+k) & 1` mit. Geometrie-Kosten null, Winding bleibt CCW. Browser-Headless-Beweis: 964 a-c vs 885 b-d. Aber: Schöpfer sah „keine Änderung" → die Wurzel der sichtbaren Streifen war eine andere (Voxel-Treppen). Lehre: messbare Mechanik ≠ wirksame Welle. | Surface-Nets-Quad-Diagonalen. | ~1 Session | ✅ V9.41 |
| B.2 | **V9.41-b** ✅ | Laplacian-Smooth-Pass nach Surface-Nets. Pro Vertex: Mittelwert seiner topologischen Nachbarn aus dem Index-Buffer; Vertex bewegt sich mit Lambda 0.5 auf halben Weg zum Mittel. 1 Iteration, Normalen bleiben V9.16-Dichte-Gradient. Test-Mesh Y-Abweichung 0.13 (Schwelle 0.25, step 1.8); echtes Welt-Mesh ~0.11 (war pre-Smooth 0.3-0.5). 1 neue Invariante, alle grün. Cel-Slider-Test des Schöpfers schloss Cel-Banding als Quelle aus → Treppen-Geometrie war die wahre Wurzel. | Surface-Nets-Auflösungs-Grenze: benachbarte Zellen teilen Y-Slot → Voxel-Treppen. | ~1 Session | ✅ V9.41-b |
| C.3 | **V9.42-c/d** ✅ | Schöpfer-Browser-Test der V9.42-b: „Inseln schliessen die Oberfläche nicht" + „Terrain-Naht nicht sauber". (c) Insel-Material: Headless zeigte die Insel-Geometrie ist 0-Boundary (geschlossen) — die „Löcher" waren das Terrain-`ShaderMaterial` auf einer Geometrie ohne `aField`/`uv`. Alle Inseln nutzen jetzt `MeshToonMaterial` + `vertexColors` (Vision §1.3 wie der Voxel-Boden), `_attachIslandColors` färbt per Normale (Gras/Erde/Fels). Der ~180-Zeilen-Terrain-Shader-Block ist als toter Code gelöscht. (d) Naht: die Skirt-Zone war 146/148 exakt geteilt — der Schöpfer sah den V9.42-b-ungesmootht-Streifen (1,8 m Treppen je Naht). Ein erster Fix (Rand-Ebenen-Smooth) verschlechterte auf 6,7 % Spalt; die korrekte Lösung ist das pad: `_voxelChunkGeometry` bekommt `cropMargin`, der Chunk mesht `dim+3`, smootht voll, croppt den Überhang → jeder Naht-Vertex voll-deterministisch gesmootht. 141/146 < 1 mm. +3 Invarianten. Rest-Grenze: 5 Vier-Chunk-Eck-Vertices. | V9.42-b-Skirt liess Naht ungesmootht; Insel-Terrain-Shader passte nicht zur Surface-Nets-Geometrie. | ~1 Session | ✅ V9.42-c/d |
| C.2 | **V9.42-b** ✅ | Drei Schöpfer-Browser-Befunde + ein kritischer Skirt-Regressions-Fix. (a) **Skirt-Disziplin im Smooth-Pass**: `_voxelChunkGeometry` trackt `vertCells.push(i,j,k)` pro Vertex; Vertices in Rand-Zellen (i==0/dimX-1, k==0/dimZ-1) bleiben im Laplacian-Smooth unverschoben → Nachbar-Chunks teilen identische Naht-Vertex-Positionen. Headless: 1510 Vertices identisch zwischen 9 Chunks. (b) **`_islandDensityAt` skaliert mit `height`**: neuer `ampScale = max(1, height × 0.35)` faktorisiert alle drei Noise-Oktaven + Basis-Lift; eine height=20-Insel ist 4× höher als eine height=5-Insel. (c) **Worldgen-Insel-Block (180 Zeilen) auf `spawnIslandAt` geroutet**: Spawn-Y aus `_voxelSurfaceY + 50..140 m` (Inseln schweben echt über dem Boden, nicht im `maxHeight`-Phantom = 0 in Voxel-Welten), variable Grösse 14..44 m, variable Wölbung 6..16 m, `opts.material` für Cel/Fog/Shadow-Shader-Material. (d) **DSL `spawn_island` 5. Argument `size`**: Schöpfer kann Insel-Größe via Chat steuern (6..48 m). +3 Invarianten. | (a) V9.41-b-Regression: Smooth verschob auch Skirt-Vertices → Spalt zwischen Chunks. (b+c+d) V9.42-a hatte nur den DSL-Pfad gerichtet; der Worldgen-Pfad trug seit V7.74 eigene Annahmen (maxHeight-Spawn, fix height=5). | ~1 Session | ✅ V9.42-b |
| C | **V9.42-a** ✅ | Inseln teilen die Surface-Nets-Pipeline. `_voxelChunkGeometry` bekommt 8. Parameter `densityFn` (Default = Welt-Density, NULL Verhaltens-Änderung für Voxel-Chunks). Neue `_islandDensityAt(lx,ly,lz, radius, height, noise)` liefert per-Insel-Density in lokalen Koords: außerhalb `radius` hart Luft (gekapselt, kein Boden-Anker), innerhalb Iso-Schicht aus `topY = noise2D-Hügel mit Rim-Falloff` (spiegelt V7.74-Pfad Zeile-für-Zeile) und `botY = -max(2, height×0.4) × factor`. `spawnIslandAt` ersetzt 80-Zeilen-Vertex-Schleife durch EINEN `_voxelChunkGeometry`-Aufruf. Material/Collision/State-Liste bleiben. **V9.42-b ist trivial**: `_buildIslandCollision` ist schon ein 1-Zeilen-Wrapper um `_buildStaticTriMeshCollision` (V9.08). Vision §1.3 fraktal erfüllt. Browser-Screenshot: drei sichtbare Inseln. +5 Invarianten, 1 Test umgewidmet. | Inseln (V7.74) sind separate radiale-Noise-Geometrie — Vision-Inkonsistenz. | ~2-3 Sessions geplant, in 1 Session geliefert | ✅ V9.42-a |
| D | **V9.43 — das Wasser-Ultiversum** | **Schöpfer-Browser-Test der V9.43-a (21.05.2026): die isolierten Wasserfall-Planes wirken als „fliegende Sheets" — ein Wasserfall ohne Fluss darüber + Becken darunter ist kontextlos. Schöpfer-Wahl: das volle Drainage-Netz mit echten Fluss-Betten.** Der Profi-Weg (Gaea/World-Machine-Pattern): Flow-Accumulation aus der Voxel-Surface → Flüsse/Seen/Wasserfälle als EIN deterministisches Hydrosphären-Netz; Flüsse carven echte Betten ins Terrain, alles mündet ins Meer, alles ein Wasser-Shader mit `uFlowDir`. **Ausführliche Planung: `docs/hydrosphere.md`** (Algorithmus, Datenstrukturen, Risiken). Geschnitten in V9.43-a ✅ + b ✅ + c ✅ + d ✅ + e. | drei Wasser-Sprachen (Plane / Partikel / nichts für Flüsse+Seen) — Vision-Inkonsistenz §1.3. | ~4-5 Sessions | 🟡 a–d ✅, e geplant |
| D.2 | **V9.43-b** | **Hydrosphären-Atlas** — `_computeHydrosphere()` berechnet das Drainage-Netz: Surface-Sampling über eine 2-km-Region (128² Zellen) → Priority-Flood-Depression-Filling (Barnes 2014, füllt Senken → Seen) → D8-Flow-Direction → Flow-Accumulation → Netz-Extraktion (Fluss-Polylinien mit Breite ∝ √Akkumulation, See-Senken, Wasserfall-Punkte). Reine Daten in `state.hydrosphere`, KEIN Rendering, KEIN Carven — vollständig headless-prüfbar. Deterministisch aus dem Seed → multiplayer-sicher. Zwei Wurzel-Bugs an der echten Messung geheilt (Detail-Oktave-Aliasing → glatte Makro-Surface; jede Unter-Meeresspiegel-Zelle als Auslass → `_hydroMarkOcean` rand-verbundene Komponente). Ergebnis: 6 Flüsse, 12 Seen, maxAccum 4521, Perf 17 ms. | ein Fluss-Netz braucht eine Berechnung, bevor es Geometrie werden kann. | ~1-2 Sessions | ✅ V9.43-b (21.05.2026, +12 Invarianten) |
| D.3 | **V9.43-c** ✅ | **Flüsse + Seen werden sichtbar** — `_buildHydrosphereMeshes()`: See-Planes (ein Quad je See-Zelle auf der Füll-Höhe) + Fluss-Ribbon-Meshes (Breite ∝ √A, Flow im per-Vertex-`aFlow`-Attribut) — beide teilen EIN horizontales Wasser-`ShaderMaterial` (`_ensureHydroSurfaceMaterial`). Wasserfälle re-verankert gegen die echte Voxel-Surface (`_hydroSampleRiverSurfaces` + `_hydroExtractWaterfalls`): eine V9.43-a-Plane an jedem Fluss-Klippen-Kreuz. Der per-Chunk-Zufalls-Wasserfall-Spawner (`_buildVoxelChunkWaterfalls`) ist gelöscht (Material + Plane wiederverwendet). `waterfallSlope` 0.55→0.4 gegen die Voxel-Surface getunt. **Ehrlicher Browser-Befund**: das Wasser rendert sichtbar (große, klare Seen), aber das V9.43-b-Netz ist see-dominant — 12 Seen, die Flüsse sind kurze 32-48-m-Verbinder; lange frei fließende Flüsse sind eine Netz-Qualitäts-Frage für eine Folge-Welle (Flüsse durch Seen hindurchführen / weniger Basin-y Surface), kein V9.43-c-Render-Bug. | das Netz braucht Geometrie; die V9.43-a-Wasserfälle brauchen Fluss-Kontext. | ~1-2 Sessions | ✅ V9.43-c (21.05.2026, +11 Invarianten netto) |
| D.3.2 | **V9.43-c.2** ✅ | **Das Wasser wird synergetisch** — Schöpfer-Browser-Befund: die Seen/Flüsse schweben ein paar Meter über dem Meer, nicht synergetisch. Höhen-Messung trennte Bug von Hydrologie (Meer y=4.8, Seen y=5–14 — Seen ÜBER dem Meer = korrekt). Zwei Bugs geheilt: (1) `_buildRiverRibbon` bekommt ein `mouthY` — die Ribbon-Höhe blendet über die letzten ~40 % auf den Mündungs-Wasserspiegel (`waterLevel` / Ziel-See-Level) → der Fluss fließt sichtbar INS Wasser statt 2 m darüber zu enden; (2) `_hydroWaterLevelAt(x,z)` liefert den effektiven Wasserspiegel (See-Level über einer See-Zelle, sonst `waterLevel`) → die Schwimm-Physik in `_loopPhysicsSync` macht Seen schwimm-/tauchbar wie das Meer. +5 Invarianten. | ein Wasser-System ist erst synergetisch, wenn die Körper sich berühren + man überall schwimmt. | ~0.5 Session | ✅ V9.43-c.2 (21.05.2026) |
| D.4 | **V9.43-d** ✅ | **Flüsse carven echte Betten** — `_terrainDensityAt` fragt die Hydrosphäre über `_hydrosphereCarveAt`: ein O(1)-Bucket-Index (`riverBuckets`) liefert das nächste Fluss-Segment, ein Flachboden-Profil senkt die Dichte (volle Tiefe bis zur halben Fluss-Breite, dann eine smoothstep-Bank-Rampe); See-Becken senkt ein bilinear interpoliertes Cut-Feld (`lakeCutCell` + `lakeNear`-Early-Out). Der Chunk-Mesher produziert echte Rinnen mit Ufern + gemuldete Becken; `_buildRiverRibbon` sampelt `_voxelSurfaceY` live → das Wasser liegt sichtbar IN der Furche (heilt das V9.43-c.2-„flache Sheets"-Rest-Bild). Zirkel-frei über das transiente `_hydroComputing`-Suppress-Flag — ein Re-Compute carvt nicht in die eigene Berechnung. Ehrliche Grenze: gelegentliche Roughness-Crag-Inseln in grossen Seen. | das Wasser soll in einer echten Furche liegen, nicht aufgemalt. | ~1 Session | ✅ V9.43-d (21.05.2026, +14 Invarianten) |
| D.5 | **V9.43-e** ✅ | **Politur + Klang** — `_buildHydroAudioLayer` baut zwei positions-modulierte White-Noise-Layer in `state.symphony.hydroAudio` (Fluss = heller Bandpass / Bach-Rauschen, Wasserfall = dunkler Lowpass / Donnern); `_tickHydrosphereAudio` (aus `symphonyTick`, ~7 Hz) misst je Tick die Spieler-Distanz zur Fluss-Mittellinie (`_pointSegDist2D` — Segment-Distanz) + zum Wasserfall, ein quadratischer Falloff setzt das Gain-Ziel. Das V9.32-Audio-Versprechen + Vision §1.4 eingelöst. Sentinel-Falle (`lastTick: 0` → `-Infinity`, die `CLAUDE.md`-Gotcha) ehrlich benannt. Rest-Naht: See-Ufer-Schaum + Flow-Speed nach Gefälle bleiben kosmetische Mikro-Politur. | ein Wasser-System ist erst fertig, wenn man es hört. | ~1 Session | ✅ V9.43-e (21.05.2026, +14 Invarianten) |
| D.1 | **V9.43-a** ✅ | **Wasserfälle werden Wasser-Planes (Befund #5, erster ehrlicher Schnitt).** `_ensureWaterfallMaterial()` baut EIN welt-global geteiltes `ShaderMaterial` — eine vertikale Flow-Plane mit `uFlowDir` (0,−1) + `uFlowSpeed`, die Schaum-Streifen + Turbulenz die Plane hinab scrollt. Teilt die Wasser-Substanz-Uniforms mit dem Meer (`uDeep`/`uShallow`/`uSunDir`/`uLight`/`fog*`), von derselben `_applyDayNightToScene`-Quelle gespeist. `_buildVoxelChunkWaterfalls` baut statt `THREE.Points`-Partikel je Klippe eine `PlaneGeometry`, gedreht so dass die Normale die Klippe hinab zeigt (Richtung des steilsten `_voxelSurfaceY`-Nachbarn). Die Animation läuft über `uTime` (zentral im Game-Loop gebumpt) — der per-Partikel-Velocity-Loop ist gelöscht. `_disposeVoxelChunkWaterfalls` disposed NUR die Geometrie (das Material ist geteilt). +8 Invarianten. **Ehrlicher Schnitt**: V9.43-a vereinheitlicht die Wasser-SPRACHE (Plane + Wasser-Shader + Flow-Vektor + geteilte Uniforms) für die Wasserfälle; ein literaler EINZIGER Shader-String für Meer + Wasserfall (horizontale Gerstner-Plane vs. vertikale Flow-Plane sind genuin verschiedene Geometrien) bleibt eine mögliche spätere Verfeinerung, kein Vision-Erfordernis. | V9.32-Partikel-Wasserfälle = zweite Wasser-Sprache neben der Gerstner-Plane. | ~1 Session | ✅ V9.43-a |
| C.4 | **V9.42-e (bedingt)** | Vier-Chunk-Eck-Vertices: V9.42-d heilte die durchgehende Naht (141/146 < 1 mm), aber 5 Vertices an Vier-Chunk-Ecken haben einen Rest-Versatz (~1 m). Der pad-Smooth deckt die X- und Z-Naht je einzeln; an der Ecke, wo vier Chunks sich treffen, ist der pad-Kontext nicht vollständig symmetrisch. Lösung wäre ein Diagonal-pad (das gemeshte Volumen auch in die Diagonal-Nachbarn ausdehnen) ODER ein 2-Zellen-pad. **Nur bauen, wenn der Schöpfer die Eck-Vertices im Browser sichtbar findet** — sonst ignorierbar (5 Vertices pro Vier-Chunk-Ecke). | pad-Verfahren deckt X/Z-Naht einzeln, nicht die Vier-Chunk-Ecke. | ~1 Session | 🟡 bedingt — nur falls sichtbar |
| E | **V9.44 (optional)** | Bullet `btTriangleMesh`-Soft-Update statt Rebuild bei kleinen Edits — die `InternalEdgeUtility`-API erlaubt es, Vertices in-place zu ändern ohne neue Shape. Spart 90 % der WASM-Heap-Last bei dichten Edit-Sequenzen. Komplexität hoch — eigene Sub-Welle, nur wenn V9.40-Async-Rebuild nicht reicht. | Voxel-Chunk-Kollision wird bei jedem Edit komplett neu gebaut. | ~2 Sessions | 🟡 erst nach V9.40-Auswertung |

**Lehren aus dem Schöpfer-Audit** (sollten in JEDE nächste Welle einfliessen):

1. **Eine Symptom-Heilung wird in einer späteren Welle Schuld.** V9.24 entfernte das Voxel-Mesh bei null-Kollision (damals sinnvoll: kein Mesh ohne Kollision, sonst Fall-durch-Loch). Eine Welle später schlug OOM bei häufigen Edits zu, und der „Schutz" wurde zum „Edit löscht ganzen Chunk"-Bug. → **Disziplin**: wer eine Symptom-Geste baut, notiert ihr Verfallsdatum in `roadmap.md`, nicht nur im Code-Kommentar. Eine Symptom-Geste ist ein TODO, kein Fertig.

2. **Pfad-Doppelung Maus-vs-Chat ist immer ein Sync-Loch.** Beide sind dieselbe Spieler-Geste — sie MÜSSEN durch denselben Broadcast-Anker. Der DSL-Op ist die Wurzel; ein direkter API-Call im Maus-Handler ist eine Lücke. V8.64 hatte das für Architekturen schon ehrlich gelöst — bei Voxel-Edits wurde es nicht nachgezogen. → **Disziplin**: nach JEDEM neuen DSL-Op prüfen, ob es einen Maus-Pfad gibt, der ihn umgehen könnte.

3. **Vereinheitlichung ist Vision-Arbeit, nicht Cosmetik.** Inseln neben Voxel-Boden, Partikel-Wasserfälle neben Plane-Wasser — beide kosmetisch akzeptabel, brechen aber §1.3 fraktal. Der Schöpfer sieht es im Browser, der headless-Test fängt es nie. → **Disziplin**: bei jeder neuen Schicht (V9.32-Partikel-Wasserfälle) den Vision-Pfeiler §1.3 prüfen — ist das eine neue Sprache oder ein vorhandenes Muster?

4. **Ein Browser-Audit fängt, was Headless nie fängt.** Trapez-Geometrie-Falten auf hellen Hügeln sind kein Test-Versagen — die Geometrie IST korrekt, sie sieht nur schlecht aus. → **Disziplin**: nach JEDER grossen Welle einen Schöpfer-Browser-Audit einfordern, BEVOR die nächste startet. Test-Pyramide: Headless prüft Mechanik, Schöpfer-Auge prüft Ästhetik.

5. **Profi-Pattern lebt im Code-Audit eines reifen Voxel-Spiels.** Minecraft/Teardown/No Man's Sky lösen Chunk-Edit-Performance durch Dirty-Queue + Async-Rebuild + Geometry-only-Refresh; die Lösung steht nicht in einem Paper, sondern in ihren Open-Source-Forks (Cuberite, Voxel.js, Polkadot). → **Disziplin**: vor V9.40 einen Exploration-Pass durch erprobte Voxel-Engines, statt das Rad neu zu erfinden.

---

### Der Stamm-Pflege-Bogen (V9.44) — Code-Hygiene-Audit (21.05.2026)

Ein externes Code-Audit + eine eigene grep/awk-Vermessung am Quellcode (`anazhRealm.js`, 34 811 Zeilen, eine Klasse, 761 Methoden) fanden strukturelle Reibung, die jede künftige Welle verteuert. **Schöpfer-Wahl: dieser Bogen kommt VOR der Hydrosphäre (V9.43-b)** — „scheint prio, damit die Weiterentwicklung danach sauberer ist". **Ausführliche Planung: `docs/archiv/code-hygiene.md`** (Befund, Vision-Abgleich, Disziplin, Sub-Wellen-Detail, bewusste Nicht-Wellen) — der Bogen ist abgeschlossen, das Dokument archiviert.

**Der Befund** (Kurzfassung): ≈29 % der Datei (10 002 Zeilen) leben in Methoden > 150 Zeilen; die längsten Kontrollfluss-Funktionen sind `startEternalLoop` (696 Z.), `_renderWorkshopDOM` (658 Z.), `loadState` (435 Z.), `p2pHandleMessage` (290 Z., 19-Branch-`if`-Kette, 6 Ebenen tief). `buildStateSnapshot`↔`loadState` koppeln den Bauplan-Feld-Satz von Hand an zwei Stellen (V8.59 war ein Bug genau hier). Gekoppelte Felder (`speed`/`sprintSpeed`) ohne kanonischen Setter (V7.72-Sprint-Bug-Klasse). Magic Values lückenhaft konstantisiert (Ports/URLs ×8, Backpressure-Schwelle, Spawn-Fallback ×16).

**Vision-Abgleich**: dieser Bogen modularisiert NICHT — kein neues Modul, kein State-Manager, keine neue Abstraktionsschicht (das wäre der Heilige-Lektion-Verstoß). Er zerlegt Großfunktionen in kleinere benannte Methoden DERSELBEN Klasse und stellt EINE Quelle her, wo heute zwei sind. Das ist die fraktale Disziplin (§1.3) auf den Code selbst angewandt + das Einlösen aufgelaufener Struktur-Schuld (V9.40-Lehre). Eine 696-Zeilen-Funktion IST Komplexität ohne inneres Fundament — der Bogen reduziert Komplexität, er fügt keine hinzu. Präzedenz: V9.30/V9.39 (Dead-Code-Wellen). Reines, verhaltensneutrales Refactoring — der sicherste Wellen-Typ; die ~2974 bestehenden Invarianten SIND der Beweis (bleiben sie grün, ist das Verhalten unverändert).

| # | Welle | Was | Aufwand | Risiko | Stand |
|---|---|---|---|---|---|
| a | **V9.44-a** | Persistenz-Schema vereinheitlichen — `_serializeBlueprint`/`_deserializeBlueprint` als EINE Quelle des Feld-Satzes (spiegelt das erprobte `_serializeCreature`-Muster), beide Save-Pfade routen hindurch. Heilt die V8.59-Bug-Klasse an der Wurzel. | ~1 Session | niedrig | ✅ V9.44-a — drei Aufrufer geroutet (auch `_buildEmptyWorldSnapshot`, dessen `inheritPlayer`-Pfad gedriftet war: Portal-Rolle + Signatur gingen bei „Person übernehmen" still verloren — ehrlich mitgeheilt). |
| b | **V9.44-b** | Kanonische Setter für gekoppelte Felder — `_applyPlayerSpeed(v)` setzt `speed`+`sprintSpeed` konsistent; weitere echte Kopplungen prüfen. KEIN State-Manager. Schließt die Sprint-Bug-Klasse. | ~0.5 Session | sehr niedrig | ✅ V9.44-b — `_applyPlayerSpeed` geroutet (beide Schreibpfade). `hp`/`stamina`/`jumpPower` geprüft: keine echte Kopplung (je ein Schreibpfad bzw. unabhängige ranged-Werte) — kein Setter, ehrlicher `prüfen-ob`-Schluss. |
| c | **V9.44-c** | Der Mesh-Router wird ein Dispatch-Table — `p2pHandleMessage`s 18-Branch-`if`-Kette → `_p2pMessageHandlers`-Tabelle + `_p2pHandle<Type>`-Methoden; der Router schrumpft auf einen ~5-Zeilen-Dispatcher. | ~1 Session | niedrig-mittel | ✅ V9.44-c — `AnazhRealm.P2P_MESSAGE_HANDLERS` + 18 `_p2pMsg<Type>`-Methoden (`_p2pMsg`-Präfix statt `_p2pHandle` — drei Branches delegieren schon an gleichnamige Worker, Kollision vermieden). smoke-webrtc end-to-end verifiziert. |
| d | **V9.44-d** | Infrastruktur-Konstanten konsolidieren — Ports/URLs/Backpressure in den bestehenden `AnazhRealm.X`-Block; Spawn-Fallback als `_defaultSpawnPos()`-Factory (kein geteiltes Literal). | ~0.5 Session | niedrig | ✅ V9.44-d — `OLLAMA_DEFAULT_ENDPOINT` (5×) + `P2P_DEFAULT_WS_URL` (6×) + `P2P_BACKPRESSURE_BYTES` (= 16 × `P2P_WORLD_CHUNK_SIZE`) + `_defaultSpawnPos()` (15×). `INVITE_PROTOCOL` + Log-`slice`-Vereinheitlichung ehrlich verworfen (1 Code-Stelle bzw. absichtlich verschiedene Limits — keine Konsolidierung). Plus getrennter Commit: drei flaky Journal-Cap-Tests geheilt (V8.96-Klasse). |
| e | **V9.44-e** | Die UI-Giganten zerlegen — `_renderWorkshopDOM` (658 Z.) + `initStatusPanel` (174 Z.) in benannte Sub-Render-Methoden; die 4× `data-cmd`-Delegation → ein `_wireCmdDelegation`-Helper. | ~1-2 Sessions | niedrig-mittel | ✅ V9.44-e — `_renderWorkshopDOM` → Orchestrator + 8 `_workshopRender<X>`-Methoden (Grenzen-Schnitt, kein Re-Indent); `_wireCmdDelegation(id, closeDrawers)` ersetzt die 4 Delegations-Blöcke. `initStatusPanel` bewusst nicht weiter gesplittet (~150 Z., unter der Ceiling). |
| f | **V9.44-f** | Der Game-Loop bekommt Phasen-Struktur — `startEternalLoop` (696 Z.) Loop-Body in benannte Phasen-Methoden (`_loopPhysicsSync`/`_loopPlayerMovement`/`_loopCamera`/…), geteilte lokale Werte als explizite Parameter. Bewusst zuletzt; Browser-Test verpflichtend. | ~2 Sessions | mittel | ✅ V9.44-f — `startEternalLoop` → Orchestrator (157 Z.) + 13 `_loop<Phase>`-Methoden; `delta`/`currentTime` als Parameter; 7 Source-Scan-Tests umgewidmet; Browser-verifiziert (0 Page-Errors, Welt baut sich, Spieler auf Terrain). **Der Stamm-Pflege-Bogen ist vollständig.** |

**Bewusst NICHT im Bogen** (ehrlich benannt): Daten-/Dispatch-Tabellen (`dslEffects` 892 Z., `chatDslPatterns` 443 Z., `_defaultBlueprints` 648 Z. — Daten-Länge, kein Komplexitäts-Problem); die `playtest.cjs`-Ko-Evolution (der bewusste Preis der Test-Disziplin); die Doc-Größe (das „Projektgedächtnis"-Design); die `_p2p*`-vs-`p2p*`-Namens-Inkonsistenz (Umbenennen öffentlicher Methoden = Risiko ohne Funktionsgewinn). Detail-Begründung in `docs/archiv/code-hygiene.md` §5.

**Bau-Reihenfolge**: V9.44-a..f ZUERST, dann V9.43-b/c/d/e (Hydrosphäre). Die Nummern-Folge spiegelt zwei parallel geplante Bögen, nicht die Bau-Reihenfolge; `docs/hydrosphere.md` bleibt unverändert. Warum zuerst: die Hydrosphäre dockt an `state.hydrosphere` (persistente Struktur → V9.44-a) + den Game-Loop (`uTime`-Bumps → V9.44-f) an — den Stamm zuerst gerade ziehen, dann den Ring ansetzen.

---

### Das vereinte Wasser-System (V9.49) — der Architektur-Bogen (22.05.2026)

Schöpfer-Browser-Befund nach V9.48: das Wasser „schliesst nicht" — Meer, Seen, Flüsse, Wasserfälle wirken als gestapelte, durchscheinende Sheets, nicht als ein Wasserkörper. Schöpfer-Wahl: nicht die Naht polieren (depthWrite, Y-Abgleich = Symptom-Heilung, Lehre 1), sondern das Verfahren wechseln. **Voller Design + die Lernschlüsse: `docs/hydrosphere.md` §12** (Wurzel-Einsicht, Algorithmus, Datenstrukturen, Vision-Abgleich).

**Die Wurzel**: vier getrennte Render-Schichten — die globale 900×900-Gerstner-Meeres-Plane, N See-Planes (`_buildLakeMesh`), N Fluss-Ribbons (`_buildRiverRibbon`), N Wasserfall-Planes — alle transparent mit `depthWrite:false`. „Globale Platte + Ausnahmen". **Der geniale Pfad**: Wasser ist kein Körper, es ist ein **Feld**. Das Priority-Flood-`filled`-Feld ist per Konstruktion EINE kontinuierliche Wasser-Oberfläche; ein spieler-folgendes Höhenfeld-Mesh, das sich in die gecarvten Kanäle senkt, lässt Fluss/See/Meer aus einem Mesh entstehen — der Fluss IST das Feld, das in eine Rinne taucht. Ein Höhenfeld kann sich nicht selbst überlappen → keine Nähte, kein Stapeln, strukturell.

**Vision-Abgleich**: Konsolidierung — drei Bau-Funktionen (`_buildLakeMesh`, `_buildRiverRibbon`, `_buildWaterPlane`) werden EINE; kein neues Modul, die Heilige Lektion gewahrt. §1.1/§1.3: „dieselbe Materie an verschiedenen Punkten des Gefälles" wird in der Geometrie wörtlich. Lehre 3 (V9.43): „Vereinheitlichung ist Vision-Arbeit, nicht Cosmetik."

| # | Welle | Was | Aufwand | Risiko | Stand |
|---|---|---|---|---|---|
| a | **V9.49-a** | Das Wasser-Feld als Wahrheit — `_hydroBuildWaterField` rechnet ein per-Zelle-Feld (`waterY` aus `filled`, `waterKind` 0 Land/1 Ozean/2 See) und legt es auf `state.hydrosphere.water`. Reine Daten, headless-prüfbar. | ~0.5 Session | niedrig | ✅ V9.49-a (+4 Invarianten: Feld-Form, waterKind-Validität, deckt sich exakt mit den Netz-Zählern 5403 Ozean + 1489 See, Determinismus) |
| b | **V9.49-b** | Das vereinte Mesh — `_buildUnifiedWaterMesh`: ein spieler-folgendes Höhenfeld-Raster (384 m, 3-m-Zelle, gesnappt), je Vertex das Wasser-Feld bilinear (Ozean/See) + `_unifiedNearestRiverSeg` (Fluss via `riverBuckets`) → nasse Quads. Ersetzt `_buildLakeMesh` + `_buildRiverRibbon` + die Gerstner-Meeres-Plane; `_tickUnifiedWater` folgt dem Spieler. `depthWrite:true`. | ~1-2 Sessions | mittel | ✅ V9.49-b (netto −117 Zeilen, vier Bau-Pfade → einer) |
| c | **V9.49-c** | Der vereinte Shader — `_ensureHydroSurfaceMaterial`: Gerstner (Ozean, pro-Vertex `aWave`-moduliert, weich aufs Ufer ausgeblendet), Still-Schimmer (See), Flow-Schaum (`aFlow`), tiefen-getriebener Ufer-Schaum (`aShore`, ersetzt den V9.48-BFS) + Ozean-Schaumkämme. Wasserfall bleibt die vertikale Ausnahme. | ~1 Session | mittel | ✅ V9.49-c |
| d | **V9.49-d** | Browser-Audit-Fix: an steilen Stellen schwebte die Fluss-Oberfläche (ein Fluss-Vertex sass auf `filled` = der fast flachen Flut-Oberfläche). `_hydroBuildWaterField` hebt zusätzlich `terrainY` (Makro-Gelände); Fluss-Vertices + die Ufer-Kante folgen `terrainY`, nur See/Ozean `waterY` → fliessendes Wasser hugt den Hang. +1 Invariante (`waterY ≥ terrainY`). | ~0.5 Session | niedrig | ✅ V9.49-d |

**Akzeptanz**: das Wasser liest sich als EIN Körper — keine gestapelten Sheets, kein toter See in der Ferne, der Fluss folgt seinem Bett und mündet nahtlos. Playtest grün (V9.49 +~21 Invarianten netto). **Erster Schöpfer-Browser-Audit erfolgt** (V9.49-d: die steilen-Stellen-Naht geheilt) — ein zweiter Befund → eine V9.49-e-Politur. Die Physik (`state.waterLevel`, `_hydroWaterLevelAt`-Auftrieb) blieb unverändert — sie liest Daten, kein Mesh.

**Plan-Abweichung (ehrlich benannt, V9.43-Disziplin)**: §12.3 entwarf den Fluss als „Feld dipt in die gecarvte Rinne" (nass ⟺ `filled > gecarvtes Gelände`); die Implementierung findet die Fluss-Zellen über den `riverBuckets`-Polylinien-Index, weil eine billige exakte „gecarvtes Gelände"-Funktion nicht existiert. Ergebnis gleichwertig — Detail in `docs/handover.md` V9.49.

---

### Der Playtest-Pflege-Bogen — Test-Hygiene (✅ ABGESCHLOSSEN, 23.05.2026 — alle sechs Sub-Wellen a-f sind drin)

Eine Strukturanalyse von `scripts/playtest.cjs` fand die zweitgrößte Reibung des Projekts: **31 574 Zeilen in EINER async-IIFE-Funktion**, Median-Einrückung 20 Spaces, 199 `### `-Sektionen als bloße Inline-Kommentare (keine Funktionsgrenzen), ~3060 `check()`-Invarianten, ~200 `page.evaluate`-Roundtrips mit wiederholtem Boilerplate. Strukturell ist die Test-Datei in schlechterer Verfassung, als `anazhRealm.js` vor V9.44 war (dort war der schlimmste Gegner 696 Z.). Es ist die V9.44-Wurzel — Wachstum ohne Funktions-Größengrenze — eine Schicht versetzt: der Code-Stamm bekam mit V9.44 seine Grenze, der Test-Stamm nie.

**Der Bogen** zerlegt die eine IIFE in benannte Sektions-Funktionen DERSELBEN Datei — KEIN Test-Runner (Jest/Mocha = Re-Komplexifizierung), KEIN Datei-Split. Reines verhaltensneutrales Refactoring, sechs Sub-Wellen a-f (Gerüst + `ctx`/`safeEvaluate`-Helfer, dann vier Bänder, dann Helfer-Durchzug), ~7-8 Sessions. **Riskanter als V9.44**: der Playtest IST das Sicherheitsnetz — der Beweis ist der Diff der geordneten Invarianten-Namen-Liste vor/nach jedem Schnitt (bit-identisch modulo dem ±2-3-Konsolen-Drift). **Vollständiger Schnitt-Plan: `docs/archiv/playtest-hygiene.md`** (Befund, Vision-Abgleich, Disziplin, Sub-Wellen, bewusste Nicht-Wellen) — vor dem ersten Code-Block ZUERST lesen.

**Status (Stand 23.05.2026): ABGESCHLOSSEN — alle sechs Sub-Wellen a-f sind drin** (V9.52-a: Gerüst + 4 Funktionen; V9.52-b: 11 Band-Funktionen; V9.52-c: 8 Band-Funktionen; V9.52-d: 8 Band-Funktionen; V9.52-e: 10 Band-Funktionen — Inline-Topf erschöpft; V9.52-f: Helfer-Durchzug `safeEvaluate(page,fn)` rollt durch 196 Inline-Stellen). **§6-Akzeptanz erfüllt** (Orchestrator-IIFE 207 Z., 41 Band-Funktionen + 5 Helfer, Median-Einrückung 8, geordnete Invarianten-Namen-Liste bit-identisch zum Vor-Bogen-Stand). Datei: 31 574 → 29 554 Z. (−2020, −6.4%). **Ehrliche Rest-Grenze** in `docs/archiv/playtest-hygiene.md` §7: eine Funktion >1200 Z. (`checkBandWelle6DSoul` 1396 Z., kohärenter 6.D-Etappen-Verbund, bewusst nicht gespalten), fünf single-line evaluates ohne catch (intentional loud-failure), drei innere Promise-Catches in evaluate-Bodies (legitime innere Logik). Der Bogen ist geschlossen.

---


Alle drei Sub-Schritte in einem Commit, playtest-grün (+6 Invarianten): (1) `_lofiWorldField` → `_lofiApplyWorldTimbre` färbt die Klangfarbe (`lebendig` → Pad-Filter 750-1050 Hz, `dichte` → `bassGain` 0.40-0.56, `magieleitung` → verstimmter Oktav-Schimmer, `glut` → schärferes Hihat); (2) `_lofiNextDegree` bekommt den schwachen Welt-Feld-Bias (Gewicht 0.4 gegen Emotion 0.8 — seed-fix gemessen, dass die Emotion dominant bleibt); (3) `_lofiNearResonantArchitecture` gated die Pad-Stimmen-Dopplung — ein resonantes Bauwerk „singt mit". Synergie-Welle, kein neuer Stamm. Detail: `CLAUDE.md` V8.95.

Der Schöpfer-Befund nach V8.94: die generative Symphonie (W4 V3) ist hörbar — sie wächst aus Seed + Emotion + Tageszeit + Wetter. **Was noch fehlt**: die Musik hört das **Welt-Affinitäts-Feld** (die vier SimplexNoise-Tag-Schichten aus W6.G P2 — `worldFieldAt(x,z)` → `{lebendig, dichte, glut, magieleitung}`, die schon regeln, *was wo wächst*) und die **Architektur-Resonanz** (`computeSpatialTags.resoniert`) nicht. Eine `magieleitung`-Region klingt heute wie eine `glut`-Region. W4 V4 schliesst diese Synergie — kein neuer Stamm, keine neue Engine: die vorhandenen Welt-Daten fliessen in die schon stehende vierschichtige Symphonie ein. Eine **Synergie-Welle** — der Wert emergiert aus dem Verdrahten erprobter Systeme.

**Vision-Pfeiler**: §1.3 fraktal (eine Sprache — die 10 Material-Tags / das Welt-Feld — regelt Form, Verteilung UND jetzt Klang) + §1.4 multisensorisch (man HÖRT, wo man steht).

| Sub-Schritt | Was | Disziplin |
|---|---|---|
| 1 — Welt-Feld → Timbre | `worldFieldAt` am Spieler moduliert die Klangfarbe, nicht die Noten: `lebendig` → wärmeres Pad (sanftere Filter-Öffnung), `dichte` → tieferer/schwererer Bass-Anteil, `magieleitung` → ein Schimmer (eine leise verstimmte Oktav-Stimme, das `_lofiPlayChord`-Dopplungs-Muster), `glut` → eine Spur Spannung (eine kleine Sekunde / ein schärferer Hihat). | Timbre, NICHT Tonhöhe — die Markov-Harmonie bleibt die Noten-Autorität; das Welt-Feld färbt nur. |
| 2 — Welt-Feld → sanfter Harmonie-Bias | `magieleitung`/`lebendig` heben die hellen Markov-Stufen, `glut` die dunklen — ein **schwacher** zweiter Bias neben dem Emotion-Bias (V8.85). Die zwei Kanäle dürfen sich nicht überschreien: das Welt-Feld biast mit halbem Gewicht, Emotion bleibt der stärkere. | Anti-Doppel-Modulation — erst messen (über N Picks), dass Emotion dominant bleibt, bevor das Gewicht festgezurrt wird. |
| 3 — Architektur-Resonanz → Reichtum | steht der Spieler nahe einer Struktur mit hohem `computeSpatialTags.resoniert` (≥ `WORLD_EFFECT_THRESHOLDS.resonance_strong`), verdichtet sich die Symphonie — mehr Stimmen-Dopplung im Pad (das V8.93-`voiceMults`-Muster, jetzt resonanz-gegated statt nur emotion-gegated). Ein resonantes Bauwerk „singt mit". | spiegelt den schon bestehenden V8.84-`_applyCompoundWorldEffects`-Singing-Sinus — dieselbe Quelle, jetzt in die Symphonie statt einer Einzel-Sinus-Schicht. |

**Tradeoff** (wie W4 V3): generative Modulation kann ziellos klingen — jeder Sub-Schritt braucht ein Schöpfer-Browser-Ohr (headless prüft, DASS das Welt-Feld die Klangfarbe ändert; ob es SCHÖN klingt, prüft das Ohr). **Honest geschnitten**: W4 V4 ist die Synergie-Naht; ein dynamischer Genre-Wechsel (Jazz/HipHop/Lofi als Welt-Feld-abgeleitetes Preset) bleibt eine benannte spätere Folge-Naht, kein stilles Versprechen.

---

## 4. Meilensteine

Gruppierung der Ringe in größere Phasen mit deutlichen User-Eindrücken.

### Meilenstein A — „Lebendige Welt" (Ringe 2-Rest + 3 + 4)

**Ziel**: Welt fühlt sich lebendig an. Mensch + Welt sprechen, hören, fühlen.

- Ring 2 Phase 3-7 (DSL voll)
- Ring 3 (Emotionen)
- Ring 4 (Symphony)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: Welt reagiert hörbar und sichtbar auf den Spieler-Zustand.

### Meilenstein B — „Du bist jemand" (Ringe 5 + 6)

**Ziel**: Spieler-Identität + reichhaltigere Welt-Strukturen.

- Ring 5 (Soul)
- Ring 6 (architectureTemplates)

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: Spieler ist nicht mehr der Würfel, Welt hat Dörfer und Tempel.

### Meilenstein C — „Welt lernt" (Ring 7)

**Ziel**: System wird intelligent.

**Geschätzter Aufwand**: 3-4 Tage  
**Wann „fertig"**: messbares Lernen über Zeit (Fitness-Score steigt).

### Meilenstein D — „Welten existieren" (Ringe 8-10)

**Ziel**: Welten sind portierbar, fusionierbar, gehören jemandem.

- Ring 8 (Identität)
- Ring 9 (Export/Import)
- Ring 10 (Fusion)

**Geschätzter Aufwand**: 7-9 Tage  
**Wann „fertig"**: ein Stammbaum aus 3+ Welten existiert, dokumentierbar.

### Meilenstein E — „Begegnung" (Ring 11)

**Ziel**: Mehrere Spieler in einer Welt.

**Geschätzter Aufwand**: 5-7 Tage  
**Wann „fertig"**: Multi-Browser-Tab-Demo läuft.

### Meilenstein F — „Bibliothek von Alexandria" (Welle 12-14 + 7)

**Ziel**: AnazhRealm wird nicht eine Welt, sondern ein Tor zu Welten. Der Spieler geht durch Portale in fremde Engines, trägt eine souveräne Identität, browst eine Registry anderer Welten.

- Welle 12 (Welt-Portal) ✅ — das Tor in fremde Engines
- Welle 13 (Vibe-Pass) ✅ — die souveräne Identität
- Welle 14 (Bibliothek) ✅ — die Welt-Registry (Phase 1+2+3 komplett, V8.58/V8.60/V8.61; KI-Übersetzer ✅ vollständig — V8.68 Manifest, V8.69 deklarative Szene; Untrusted-Welt-Tor ✅ V8.70 — eine echte fremde Engine läuft null-origin sandgesichert; Auto-Vendor-Pfad ✅ komplett V8.71/V8.72 — ein fremdes Bündel ODER ein GitHub-Repo dockt sandgesichert an; Mesh-Welt-Verteilung W16 ✅ komplett V8.73/V8.74 — eine vendorte Welt reist peer-to-peer + die Mesh-Bibliothek ist browsbar; W17 Multiplayer-Sub-Welten ✅ vollständig — Phase A V8.75 + B-Relay V8.76 + C V8.77 + Multiplayer-Welt-Deklaration V8.78 + B-JS-Compute Phase 1 V8.79 + Phase 2 Host-Migration V8.80, offen nur B-WASM per-Projekt)
- Welle 7 (Compute-Sharing) ✅ — WebRTC-Mesh (Phase 1-4 komplett, V8.62-V8.66; Kanäle → Welt-Snapshot → LLM-Pool → Public-Lobby + Multi-User-Bau-/Kreatur-Sync)

**Wann „fertig"**: der Schöpfer browst im Bibliothek-Tab fremde Welten, holt sich ein Portal, geht hindurch — und seine Identität reist mit.

**Gesamt-Roadmap**: ~25-33 Arbeitstage in fokussierten Sessions, realistisch 3-4 Monate kalendarisch.

---

## 5. Querschnitts-Themen

Themen, die kein eigener Ring sind, sondern durch alle Ringe ziehen.

### 5.1 Test-Coverage (CI-Gate)

- Stand V9.20: **~2910 Invarianten** in `scripts/playtest.cjs` (Headless-Chromium, ~25 s Log-Sammlung) + `audit-strict.cjs` (5 generische Audit-Schichten) + `smoke-multiuser.cjs` + `smoke-webrtc.cjs` + `smoke-translated.cjs` + `smoke-sandbox.cjs` + `smoke-vendor.cjs` + `smoke-shim.cjs`
- Pro Welle +6-35 neue Invarianten (Effekt sichtbar, kein Crash, Save-Schema OK, Emergenz statt Mechanik)
- Disziplin: nach jeder substanziellen Änderung das Playtest-Gate, nicht nur Code-Analyse

### 5.2 Performance

- Heute: 120 fps mit BVH-Triangle-Meshes, im Headless-Playtest 52 fps avg
- Eskalations-Pfade falls FPS irgendwann zu niedrig wird:
  1. `btTriangleIndexVertexArray` statt `btTriangleMesh` (~2× schneller Trace)
  2. LoD pro Chunk (weiter weg = niedrigere Vertex-Dichte)
  3. Web Worker für Chunk-Generation
- Performance-Invariante im Playtest: avg-FPS muss >30 bleiben

### 5.3 CSP & Security

- Stand V8.57: CSP **strict** seit Ring 2 Phase 6 — `script-src` ohne `eval`/`inline`, nur dokumentierte Vendor-Konzessionen (`wasm-unsafe-eval` für Ammo, `unsafe-inline` style für Three.js, `worker-src blob:`). CI-Gate erzwingt „kein dynamisches Auswerten im eigenen Bundle".
- Multi-User: eingehende DSL läuft durch dieselbe `dslRun`-Sandbox wie eigene Programme (Op-Whitelist + Budget-Limits). `NON_BROADCASTABLE_OPS` schützt Spieler-private Ops, `CREATURE_PROPOSED_OPS` die Kreatur-Welt-Aktion.
- W13 Vibe-Pass: WebCrypto-Ed25519 nativ (keine CSP-Lockerung), privater Schlüssel global in `localStorage`, NIE im teilbaren Welt-Save.

### 5.4 Doku-Pflege

- Nach jedem Ring: `state-of-realm.md` §3 (Matrix), §4 (Commit-Archiv), §5 (Pfad-D-Tabelle) aktualisieren
- Nach jedem Meilenstein: `roadmap.md` Status-Updates + nächste Phase aufschlagen
- `CLAUDE.md`: bei substanzieller Architektur-Änderung Gotchas-Sektion ergänzen

### 5.5 Browser-Reichweite

- Heute: Chrome/Edge funktionieren, andere Browser ungetestet
- Vor Ring 11 (Multi-User): cross-browser smoke test (Safari, Firefox)
- WebRTC kann in manchen Setups problematisch sein → Fallback-Plan: WebSocket über signaling-server

---

## 6. Risiken & Mitigation

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Performance bricht bei Ring 7 ein (brain.js + viele Chunks) | mittel | Performance-Invariante hält das auf; falls Crash: brain.js training in Web Worker auslagern |
| Multi-User (Ring 11) ist mehr Arbeit als geschätzt | hoch | Falls Zeit knapp: V1 nur Position-Sync, kein DSL-Sharing |
| Save-Schema-Bruch bei Ring 8 frustriert bestehende Spieler | mittel | Schema-Version + Migration-Hook (Phase 4) muss vorher sauber stehen |
| Welt-Fusion (Ring 10) ergibt unspielbare Resultate | mittel | Conflict-Resolution mit gewichteter Random-Wahl, Player kann manuell wieder „splitten" |
| Heilige-Lektion-Verstoß: irgendwann doch in Module gesplittet | hoch | jeder Code-Review prüft auf Stamm-Treue; bei Zweifel `state-of-realm.md` §2 nachlesen |
| CSP-strict bricht eine Browser-Funktion | niedrig | Phase 6 testet vor merge; Fallback: `'wasm-unsafe-eval'` für Ammo behalten |

---

## 7. Wann ist das Projekt „fertig"?

Es ist nicht fertig — es ist ein **lebendes Werk**. Aber es gibt natürliche Stops:

- **Nach Meilenstein A**: AnazhRealm ist eine lebendige Solo-Welt, fühlbar reaktiv. Eine spielbare Demo.
- **Nach Meilenstein C**: Welt lernt aus dem Spieler. Ein echtes „Ultiversum"-Erlebnis im Kleinen.
- **Nach Meilenstein D**: das Co-Creation-Werk hat Persistenz und Geschichte. Welten haben Eltern, Geschwister.
- **Nach Meilenstein E**: das Ultiversum ist offen. Spieler begegnen sich.

Nach E ist die Roadmap nicht zu Ende — neue Ringe (VR, prozedurale Quests, Welten-Marktplatz, KI-Mitspieler über die Anthropic API) werden dann sinnvoll. Aber dann ist es kein „Projekt aufbauen" mehr, sondern **eine Welt pflegen**.

---

## 8. Wie diese Doc gepflegt wird

- Nach jedem Ring-Abschluss: Status in §2 + §3 aktualisieren, Aufwand auf 0 setzen, **was tatsächlich umgesetzt wurde** kurz dokumentieren
- Nach jedem Meilenstein: §4 mit echtem Datum versehen
- Bei größeren Vision-Verschiebungen (z. B. neuer Pfeiler aus User-Feedback): §1 + `state-of-realm.md` §11 entsprechend ergänzen, dann hier neue Ringe ergänzen
- Beim Lesen aus einer neuen Session: zuerst §1 (Stand), dann §2 (Übersicht), dann den aktuellen Ring vertiefen

Die Roadmap ist **kein Vertrag**, sondern eine **Karte**. Wenn der Schöpfer mitten in der Reise sagt „eigentlich brauchen wir erst Y bevor X", wird Y eingeschoben und die Tabelle nachgezogen.

---

*Geschrieben nach Commit `9fcf1ff`. Wird nach jedem nennenswerten Schritt aktualisiert.*

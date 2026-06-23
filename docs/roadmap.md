# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der aktive Tisch.** Dieses Doc beantwortet beim nächsten Schritt **vier Fragen**, nicht eine:
> **Wohin?** (§2–3) · **Wurde das schon probiert?** (§4 Narben) · **Existiert das schon?** (§5
> Teilsysteme) · **Schneide ich einen Samen?** (§6 Samen). Das Detail lebt in der Bibliothek
> (`docs/archiv/handover.md` Chronik · `docs/archiv/roadmap-chronik-bis-v18.83.md` der alte Backlog ·
> `docs/archiv/README.md` der Bogen-Index). Ein Bogen erwacht → sein Plan kommt auf den Tisch.
>
> **Stand 19.06.2026 (V18.267):** DER AKTIVE BOGEN ist **`docs/wahrerguss.md`** (DER WAHRE GUSS —
> die Konvergenz von FORM·PHYSIK·ANBLICK in EIN Gesetz) + seine Sub-Bögen
> (`docs/lebendiger-koerper-plan.md` · `docs/koerper-neuanlage-plan.md`). Die NORMATIVEN Referenzen
> dazu liegen in der Bibliothek: **`docs/archiv/wahrerbauplan.md`** (Ω-PHYSIS · der Physik-Richter im
> Code) + **`docs/archiv/wahreranblick.md`** (Ω-OPSIS · Anblick-Tiefe, in wahrerguss System A absorbiert).
> Der Live-Stand + die Reflexion:
> der **„Aktueller Stand"-Kopf in `CLAUDE.md`**. **DIESES Doc trägt den BACKLOG vorwärts + die GEMERKTEN FÄDEN** (§4) — die
> Fäden, die NICHT im aktiven Bogen liegen, aber dem Schöpfer alle wichtig sind. (Die alten
> „EINE-Plan"-Pläne `abschluss-plan` + `gigant-fortsetzung-plan` sind archiviert/abgelöst.)

---

## ⚠️ TEMP-DEV-DROSSELN (V18.257/.259 — REVERT vor dem nächsten Merge/v1.0)

Während der Entwicklung temporär gedrosselt, damit Cold-Start + Iteration schnell sind (Schöpfer-Wunsch
„weniger Bäume/Strukturen, schneller iterieren"). **Sie tragen die Code-Marker `V18.257 TEMP` /
`V18.259 DEV-DROSSEL`.** Der echte BACKLOG ist nicht das Zurückdrehen, sondern den **Cold-Start effizient**
zu machen (dann fällt die Drossel von selbst): Chunk-Mesh-Streaming + Vegetation-Spawn-Budget + die
per-Frame-swiftshader-Render-Kosten. **V18.260 hob den Render-Hebel teilweise:** placed-Strukturen (Tempel
109 Parts → 2 Meshes) fließen jetzt durch denselben Material-Merge wie die instanzierten Bäume
(`_buildArchMeshMerged`), das senkt die Draw-Calls drastisch. **V18.262 hob den Kreatur-Render** (der
V18.260-Folge-Hebel): das statische Gesicht der Skin-Kreaturen (Augen/Funken/Ohren) pro Material gemergt
6→3 + eine Distanz-LOD blendet es jenseits ~42 m·L aus → `wesen` 7→4 nah / 7→1 fern (gemessen
`scripts/diag-creature-render.cjs`; s. handover V18.262). **V18.264 maß die GANZE Render-Last** (der
Session-blinde Fleck: 4.61M Dreiecke + ein 2.32M-Schatten-Pass) → der Schatten-CACHE (Stand) + **V18.265
die SCHATTEN-DISTANZ** (ferne LOD1/LOD2-Bäume werfen keinen Schatten → −44 % Schatten-Pass) → **V18.266
der KIESEL-HEBEL** (noiserock-Detail skaliert mit Grösse: kiesel 589k→147k, der grösste view-unabhängige
Posten war über-tesselliertes Klein-Deko) → **V18.267 KONSOLEN-AUFRÄUMUNG + Baum-Entlastung** (RenderPipeline
statt deprecated PostProcessing · der `instanceColor`-Fehler GEHEILT · Scatter-Caps tree 900→300/under
800→250/litter 250→150). **OFFENE FÄDEN aus dem Render-Bogen:**
- **~~`instanceColor not found`~~ GEHEILT (V18.267):** das manuelle `albedo.mul(attribute("instanceColor"))`
  in `_grassInstanceMat` + `_scatterMaterial` entfernt — der Tint kommt über Three.js' nativen
  InstanceNode-Pfad (`setupDiffuseColor` multipliziert instanceColor automatisch), DERSELBE wie das Laub.
- **~~PostProcessing/ShaderMaterial-Warnung~~ GEHEILT (V18.267):** der Bootstrap kopiert jetzt
  `RenderPipeline` (NodeMaterial-basiert) statt des deprecated `PostProcessing` (ShaderMaterial-basiert).
  Offen bleibt nur ein 2× vendor-interner `ShaderMaterial`-Hinweis (nicht aus unserem Code, harmlos).
- **~~Der view-unabhängige Haupt-Pass~~ TEILS GEHEILT (V18.300):** die STREU-Laub-Gruppen sind jetzt
  pro 256-m-Region gekeyt (`useRegionFoliageCull`) → lokale Bounding-Sphere → `frustumCulled=true` →
  Umsehen cullt ~60 % der Laub-Last (die alte V18.265-These „per-Region lohnt nicht" verwechselte
  DISTANZ- mit FRUSTUM-Culling: eine Region HINTER dem Blick fällt aus dem Frustum, egal wie nah).
  OFFEN bleibt: die **globalen PLACED-Gruppen** (`_archInstanceAdd`, bewusst global) + der wahre
  Hebel für sie = GPU-Culling/Indirect-Draw, look-bound (Schöpfer-Browser). Plus der **AVATAR-SKIN-
  WORKER** (die ~9.6-s-Boot-Blockade, `diag-startup-cost`) — die Mathe ist THREE-frei → Worker. **Der
  DETERMINISMUS-BOGEN ist VOLLENDET (V18.331):** Ammo ist physisch raus, die Kollision feld-nativ aus
  dem Dichtefeld → der per-Chunk-BVH-Build (der Lauf-Freeze an der Wurzel) ist WEG, der Boden
  deterministisch (öffnet P4 Lockstep/Replay als eigenen Bogen). Voll-Stand in
  `docs/archiv/eigene-physik-plan.md`. FPS-Beweis bleibt der Schöpfer-WebGPU-Browser (Regel #0).

- **Vegetation/Scatter-Dichte** (`_populateVoxelChunkVegetation` `SAMPLES 10→4`) — deckt Bäume UND alle
  Streu-Strukturen ab (Felsen/Kristalle/Glut/Landmark-Formationen teilen `_vegetationSampleSpawn`). REVERT → 10.
- **Fliegende Inseln** (`_worldgenSpawnFloatingIslands` `numIslands 3→1`). REVERT → 3.
- **Planeten** (`createGalaxySkybox` `numPlanets 3→1`). REVERT → 3.

(Nicht gedrosselt, weil Einzel-Platzierung, kein Dichte-Effekt: village/temple/genesis-Plattform.)

---

## §1 · Regel #0 — die eine Wahrheit (über allem) · präzisiert 09.06.2026

**Keine Proxy-METRIK entscheidet einen Look-Befund — AUGEN entscheiden.** Die alte Form („Render ist
pixel-blind headless") war FALSCH (Schöpfer-Korrektur 09.06., dreimal bestätigt): meine
swiftshader-Screenshots sind TREU — mit der richtigen Methodik (settled · Augenhöhe · nah · A/B
alt-vs-neu, `diag-settled-view`) prüft MEIN Auge jede Welle selbst. Was lügen kann, ist eine
headless-ZAHL (Falten-%, Neigung — V18.87: Glätte gemessen, Füllung verloren). Das SCHÖPFER-Auge
bleibt das MERGE-Gate (echtes WebGPU-FPS/Feel; er ist der Schöpfer): nie 2+ Look-Wellen stapeln
ohne sein Auge, ein bestätigter Bogen wird gemergt, bevor der nächste beginnt. Mein Auge pro
Welle, sein Auge pro Merge — Regel #0 ist ein Werkzeug, keine Bremse.

## §2 · Wo wir stehen

Das **Fundament steht und ist RUND** (Stand 11.06.2026): Voxel-Terrain mit Höhlen/Canyons ·
Erosion · **das Wasser VOLLENDET** (CA fließt + ruht V18.84–.94 · Stau-Spiegel V18.129 ·
Küsten-Aquifer V18.125 · ferne Binnengewässer-Kacheln V18.132) · **PHASE A KOMPLETT** (Naht ·
Spawn · Fog · Kollision) · LOD-Kaskade U1–U5 (U4-Fernfeld V18.131 · U5-CSM V18.130) · das
lebendige Feld + Emotion-Kern + Lebenszyklus · Crafting-Resonanz + Foraging (V18.133) ·
Robustheit R0–R5 rund · Rekursion bootet · der soziale Bogen begonnen (Zeugnisse + Lesezeichen
V18.134/.135). Was JETZT (Stand 18.06.) noch fehlt: die S-Browser-Sign-offs (gigant-plan §6.3) ·
F2-Stern. (✓ seit dem 11.06.-Snapshot: ~~F4-Folgen/Kommentare~~ · ~~W18~~ V18.144–.146 ·
~~Phase E~~ V18.148 · ~~Taille Ω0–Ω6~~ V18.137–.141.)

---

## §3 · Der Plan vorwärts — die Reihenfolge

> **Der Master-Blick über allem: `docs/archiv/gigant-plan.md`** (10.06.2026 — das umfassende gemessene
> Bild: die NEUN Säulen G1 Motion-Resonanz · G2 Rekursion · G3 sich-speisendes P2P-Netz ·
> G4 Kreatur-Innenleben · G5 δ-als-Währung · G6 Licht+Terrain · G7 Maßstab · G8 Robustheit (✓ rund) ·
> G9/Ω die gefrorene Taille (✓ rund V18.137–.141; `docs/taille-spec.md` NORMATIV, Historie
> `docs/archiv/taille-plan.md`) + die Zwillings-Karte + die Reihenfolge §5 + **DIE GEMERKTEN
> FÄDEN** (§5-Ende — Schöpfer 11.06.: „alle wichtig, nie vergessen")).
> Dieser §3 bleibt die operative Kurz-Form; der Gigant-Plan trägt das Warum + die Anker.

**⭐ DER AKTIVE LEAD-BOGEN — DER WAHRE GUSS (der Master-Plan, `docs/wahrerguss.md`):** der Schöpfer-Katalog
(16.06., `scripts/diag-werk-render.cjs`, mit eigenen Augen geprüft) zeigte: die Fidelität LANDET, wo das
Gesetz scharf ist (Tempel·Schwert·Wagen·Esse·Kristall·Portal), aber das LEBENDIGE Herz ist Blob (Avatar =
zerfallener Strichmann · Kreatur ~10 % · Glutwesen lose Kegel) und ALLES low-poly+flach-einfarbig (selbst
der Tempel „immer ähnlich"). **Die REFLEXION (Schöpfer „der Weg den Profis kaum sehen, die Zukunft"):** jede
Iteration (T1–T6-Genom, F1–F6-Fidelität) bekämpfte den Blob am OBJEKT-Niveau (mehr Meshes = Amateur-Instinkt).
Der Profi-Weg: das Objekt NICHT anfassen, **vier GETEILTE Systeme bauen**, durch die jeder Bauplan fließt —
**Detail·Schönheit·Vielfalt·Leben sind Auslesewerte dieser Pässe:** (A) **SUBSTANZ** (prozedurales PBR aus
Krümmung/AO/Gradient/Tags — der breiteste Hebel, hebt jedes Werk auf einmal) · (B) **KÖRPER** (Skelett+Haut+
Bewegung+Rüstung-konform — das lebendige Herz) · (C) **GRAMMATIK-TIEFE** (rekursiv/kombinatorisch → tötet
„immer ähnlich" + ein geteiltes Vokabular, heilt die scale+tint-Reste) · (D) **DETAIL-PASS** (Subdivision/
Displacement). Das Genom (T1–T6, GEBAUT+GEMESSEN) reitet OBEN, der Richter (Ω-PHYSIS) garantiert, das **TOR**
(`wahrerguss §4` — Fidelität als Resonanz-Achse) erzwingt die Detail-Treue (kein Blob kommt durch), das Auge
richtet (Wand 1). **WEG: Substanz zuerst, dann Körper, dann Tor/Tiefe/Detail.** Fast nichts wird erfunden —
Surface-Nets-Mesher · triplanarer Albedo · L-System-Bäume · Metaball-Haut sind die Beweise, die nur
GENERALISIERT werden. Physik-Referenz `docs/archiv/wahrerbauplan.md`; die alten Gesichter-Pläne (FORM-Genom-
Detail, ANBLICK-Pfeiler Ω-O1..O16) in `docs/archiv/wahrerwuchs.md` + `docs/archiv/wahreranblick.md`.

**⭐ Die EINE Wurzel — die Chunk-Naht (Schöpfer-Befund 09.06.2026, gemessen):** blobiges Terrain ·
Edit-/LOD-Naht · die Wasser-Naht (30 Wellen) · „Wasser fließt nicht" sind **fünf Symptome EINER Wurzel**:
independent gebaute Chunks, deren Ränder nur approximativ + verspätet zusammenfinden. Der vereinte
Bogen ist **`docs/archiv/terrain-koharenz-plan.md`** (DIE EINE GRENZE).

**GEBAUT + GEMESSEN + Playtest-grün (T0–T8, alle Worker-gespiegelt, Determinismus 0/6885):** T0–T3 die
kohärente Grenze (T1 zeitlich · T2 Cross-LOD-Geomorph · T3 Dual-Contouring-QEF) · **T4 der Wasser-CA**
(zellbasierter Automat über `waterCells`, fließt im Modell+Welt, Render folgt dem Live-Level — die
30-Wellen-Wurzel „fließt nicht" ist GELÖST) · T5–T7a das kontinentale Drama (Canyons bis 83 m · weite
Felder · Mesa-Terrassen slope-gated · Hallen) · T7b-ii+T8 das weite Band + die Löcher geheilt (Boden 0 ·
Meer-Aquifer 0 · Mesa-Treppe 0 %).

**⭐ AKTIV — die LOD/Naht-VOLLENDUNG (derselbe Kohärenz-Bogen, §11):** der Schöpfer-Browser zeigt nach
T0–T8: Chunks resetten/höhenversetzt/Spalt-durchsehen (das Wasser nur das Symptom). GEMESSEN
(`diag-chunk-seam`): die **Cross-LOD-T-junction ist der Riss** (LOD0-Ring nur 3×3 → Grenze ~50 m · 0 %
geteilt · ~14.2 % sichtbare >1-m-Spalten); der Geomorph (T2) ist ein RENDER-ONLY-Halbfix (schliesst nur
die Grenz-Zeile, Kollision gappt) + Edit/LOD re-meshet den GANZEN Chunk (das „Reset"). **Der Plan:
N1 Cross-LOD watertight (Transvoxel [Lengyel] ODER Geomorph→Kollision+volle Zone) · N2 Sub-Region-Edit ·
N3 stabiles LOD (grösserer LOD0-Ring + Hysterese).** (Subsumiert das alte „E4-Stitching".)

**Phase 2 — das Fundament sauber schließen (nach der Naht-Vollendung)** ~~H3~~ ✓ V18.132 (Kacheln) → G3
(weitere Höhleneingänge) → LOD-Kaskade-Rest (U2 Wasser-LOD · ~~U4~~ ✓ V18.131 · ~~U5~~ ✓ V18.130 · U6) → Render-Sign-offs (R1/R2/R3/R5) ·
das Wasser-RENDER T7c/T7d (Fluss-Edit-Löcher + lake/river-Naht, burnte Zone, Schöpfer-Auge) · der Spawn
liegt in einer T6d-Kaverne (Spawn-Höhe heben). Detail: `archiv/lod-kaskade-plan.md`.

**Phase 3 — die Seele** Crafting-Schluss (~~S6-B~~ ✓ V18.133 · S9-Sign-off · S11 · ~~S7-C~~ ✓ V18.127) · ~~**Phase E**~~ ✓ V18.148 (Bedrohung/Furcht — der
letzte Emotion-Kern-Konsument) · ~~Mana-Symmetrie~~ ✓ V18.196 · Emotion→Regel-Emergenz · ~~**Nexus-Lern-Vereinheit-
lichung** (Geste→Gesetz)~~ ✓ V18.112 (`_crystallizeGestureRule`, live im 5-s-Loop). Detail: `archiv/kampf-plan.md` · `docs/das-lebendige-feld.md`.

**Quer dazu (eigene Bögen):** ~~der **soziale Mesh-Bogen**~~ **✓ RUND V18.134–.147** (Bewerten ·
Lesezeichen · Folgen · Kommentare · „Für dich"; Kür-Vermerk nur die Portal-Ring-Vorschau) ·
~~**W18** (in fremden Welten leben)~~ **✓ RUND V18.144–.146** (`archiv/world-portal-w18-plan.md`;
benannt-fern nur der Übersetzer-Avatar-Hook) · ~~Ω die gefrorene Taille~~
**✓ RUND V18.137–.141** (`docs/taille-spec.md` NORMATIV · `docs/archiv/taille-plan.md` Historie ·
`spec/golden/v1/` EINGEFROREN).

---

## §4 · Die offenen Fäden + DIE GEMERKTEN FÄDEN

> **Stand 18.06.2026 (V18.264):** Der AKTIVE BOGEN (das, was JETZT gebaut wird) ist
> **`docs/wahrerguss.md`** (+ Sub-Bögen `lebendiger-koerper-plan.md` · `koerper-neuanlage-plan.md`);
> die NORMATIVEN Referenzen `docs/archiv/wahrerbauplan.md` (Ω-PHYSIS) + `docs/archiv/wahreranblick.md`
> (Ω-OPSIS) liegen in der Bibliothek. Der Live-
> Stand + die Reflexion (erledigt/offen/Chaos) im **`CLAUDE.md`-Stand**. **Dieser §4 ist die
> EINE Quelle für die Fäden, die NICHT im aktiven Bogen liegen** — die gemerkten Fäden, die
> dem Schöpfer alle wichtig sind („nie vergessen, nie still streichen").

**Wo finde ich was offen ist:**

- **`docs/wahrerguss.md`** (+ Sub-Bögen) — der aktive Bogen; **`docs/archiv/wahrerbauplan.md` + `docs/archiv/wahreranblick.md`** — die NORMATIVEN Referenzen (Physik + Anblick), Welle für Welle
- **`CLAUDE.md` „Aktueller Stand"** — die auto-geladene Wahrheit: aktuelle Welle · Live-Stand · die Reflexion (Parallelcode/Chaos zu vereinheitlichen)
- **`docs/archiv/handover.md`** — die volle Wellen-Chronik (jüngste oben) + das Schöpfer-Audit-Gedächtnis (der alte `rueckmeldung.md`-Korpus liegt als Snapshot in `archiv/`)
- **`docs/archiv/gigant-plan.md` §5** — der historische Master-Blick der neun Säulen (Karte über den Detail-Plänen)

**DIE GEMERKTEN FÄDEN** (Schöpfer-Weck-Moment — alle wichtig, nie still streichen; Stand 18.06.2026, mit `handover.md` synchronisiert):

**ERFÜLLT** (sichtbar behalten, NICHT gestrichen — `handover.md` markiert sie V18.148–.196):
**Phase E** Bedrohung/Furcht ✓ V18.148 (HP→`threatened` · Raubtier-Trieb `_creatureHuntDrive` · `glutwesen`) ·
**R6** Selbst-Erweiterung ✓ V18.152 (`_portalReceiveCapability`/`grantCapability` — Capability-Inversion durch die dslRun-Sandbox) ·
**Mana-Symmetrie** ✓ V18.196 (`magieleitung`→Mana-Regen + Geste-Kosten ∝ Substanz) ·
**IndexedDB** ✓ (die 5-MB-localStorage-Wand fällt; große Snapshots additiv+graceful) ·
**Fahrzeug-Fahr-Tiefe** ✓ V18.150 (`_vehicleProfile` emergent: Räder→Tempo, Masse→Trägheit, Auftrieb) ·
**Statusbar-Tiefe** ✓ V18.149 (auf Essenz geschlankt, F3-Muster).

**NOCH OFFEN:**
**KI als volle Co-Schöpferin** (LLM schlägt DSL-Regeln durch dieselbe Sandbox vor — Infra steht, ephemer+fitness-getestet; offen = die opt-in-Adoption als Politur) ·
das echte **V18→V19-Zeit-Portal** (der Empfang ist gebaut+grün getestet via `smoke-zeitportal`; offen = ein ECHTER Alt-Build emittiert ein Artefakt, das ein Folge-Build isst) ·
**VR/WebXR** (0 Code — echt offen) ·
**Wasser-Zwei-Naturen-Vereinigung** (die CA-Flut IST gebaut V18.84–.94 — NICHT „Fluid bauen"; offen = das statische `L`-Substrat + die CA zu EINER Natur vereinen + Wasserfall-Render-Politur) ·
B1 Wasser-Sheet→Worker (bewusst vertagt, V18.104-Entscheid).

**DER OFF-THREAD-BAU-BOGEN — DER BÄCKER (FREEZE-FIX GESCHLOSSEN V18.314–.316; V18.313-Diagnose, Schöpfer-Idee „ein baker für den bau aller dinge"):**
GEMESSEN (`diag-startup-cost`): jeder Kreatur-/Avatar-Skin-Bau (Metaball-Isosurface in `_buildCreatureSkinGeometryUncached`) blockt den Main-Thread **~4 s synchron**, deferiert nach der Kontrolle (V18.308) → die wiederkehrenden 3–8-s-Freezes (Schöpfer-Browser „stehe still, friert"). Das war der EINE synchrone Block, den die ganze Perf-Welle (V18.260–.313) übrig ließ — das gemeldete „Leck" war ein Boot-Ramp-Fehlalarm (`diag-scene-leak` flach, die Linse fing es). FIX = **EIN gemeinsamer Bäcker-Worker:** schwere Geometrie-Konstruktion läuft off-thread, der Main-Thread bleibt frei.
- **Architektur:** `bake-core.js` = die Skin-Mathe THREE-frei (Arrays rein/raus, **EINE Quelle**, von Main+Worker geladen — KEIN bit-Mirror nötig wie `voxel-worker.js`, weil Skin-Geometrie pro-Kreatur/standalone ist, nicht naht-/MP-kritisch) · `bake-worker.js` = der Bäcker-Thread (`importScripts`).
- **Stufen 1–3 GEBAUT + verifiziert (der Freeze ist tot):** (1) **V18.314** `bake-core` extrahiert + **Determinismus-A/B** (byte-identisch zum Live-Pfad, maxDiff=0 über 3 Seelen × 3 opts) · (2) **V18.315** Async-Swap für KREATUREN (off-thread + spawn-fern ≥130 m: die Haut backt während der Anreise, das Wesen taucht schon-fertig aus der Distanz auf — der Profi-Weg statt Platzhalter; headless SYNCHRON = gate-treu) · (3) **V18.316** der AVATAR-RIG off-thread (Bones+Gesicht sofort, Haut via `skinPromise.then(attachMesh)`; First-Person verbirgt den eigenen Körper → die Verzögerung ist unsichtbar). **DAMIT SIND ALLE SKIN-BAUTEN OFF-THREAD.**
- **Stufe 4 (`_buildArchMeshMerged` off-thread) — GEMESSEN VERWORFEN als Freeze-Fix:** der Bauplan-Merge ist seit **V18.299 schon gecacht** (WeakMap, EINMAL pro Bauplan mergen, danach nur klonen) → `diag-startup-cost` misst **3–4 ms max / 19 ms total über 15 Spawns**, drei Größenordnungen unter den ~4 s Skin-Builds. Off-thread zu schieben würde eine bereits-gecachte, vernachlässigbare Op async machen + die load-bearing Architektur-Spawn-Pipeline (Platzhalter/Swap/A/B für eine zweite Geometrie-Mathe) verkomplizieren — für ~3 ms einmal pro Bauplan-Typ. „Miss zuerst, die Zahl führt" + „erzwungener Parallelcode" → **NICHT bauen**, bis eine Messung einen echten Architektur-Bau-Freeze zeigt. (Die verdeckte-Flächen-Cull bliebe ein reiner Render-/Look-Gewinn, kein Freeze — eigener Faden, Schöpfer-Auge.)
- **CPU, nicht GPU:** der Worker (CPU off-thread) nimmt die Last bei niedrigem Risiko; ein GPU-Compute-Rewrite ist VERWORFEN (§5-Narbe: der GPU-Density-Mirror driftete + wurde V17.20 geschnitten; „KEIN GPU-Compute-Rewrite des load-bearing Pipelines").
- **Weitere Off-Thread-Kandidaten (dieselbe Bug-Klasse — schwere synchrone Main-Thread-Arbeit; NICHT ein Stamm-Thema-Split):** der **Worldgen-Monolith** (Erosion/Hydrosphäre ~5 s am Boot, deterministische Mathe → Worker; der nächste echte Hebel, wenn der Boot-Sync-Block dran ist) · das Wasser-CA-Sheet (B1, oben). **DISZIPLIN (Heilige Lektion, geschärft):** schwere Off-Thread-RECHNUNG an einer echten Grenze trennen — JA; den Stamm nach Thema zerteilen — NEIN (die 2025-Falle).

**DER GENIALITÄTS-BOGEN — DIE DREI SCHWERSTEN ALGORITHMEN BYTE-IDENTISCH ERSCHLAGEN (V18.319–.321, GESCHLOSSEN; Schöpfer „Leistung durch Genialität, nicht durch Stutzen — sei ein Gigant, forge was kaum ein zweiter kann"):** dasselbe Profi-Muster dreimal — Redundanz an der Wurzel tilgen (narrow-band / eine Quelle), ein Byte-Orakel als Linse statt Wachsamkeit (Gesetz #0). Kein Verlust: jede Welle maxDiff EXAKT 0.

- **V18.319 — Skin-Isosurface 4,4×:** das brute O(G³·Knochen)-Metaball-Backen (`bake-core`) räumlich akzeleriert (OpenVDB-„bone grid": pro Zelle nur die lokal beitragenden Knochen, `field()` liest die kurze Liste statt aller ~270). accel==brute (`diag-bake-bench`). res-128 wird damit bezahlbar.
- **V18.320 — Chunk-Density-Band-Skip ~3×:** der Worker-Mesher (`buildChunkMesh`) liest die EINE Band-Skip-Quelle `computeDensityGrid` (Mirror von `_voxelSampleDensityGrid`) statt der duplizierten Voll-Schleife. band==full (`diag-chunk-band`) · worker==main (`diag-worker-chunk`).
- **V18.321 — Chunk-Density-Spalten-Hoist:** die GEMESSENE 61 % rein-2D-Makro-Arbeit (`_terrainMacroSurfaceY` + Roughness/Canyon/Hydro) EINMAL pro Spalte statt pro Voxel (`_terrainColumnContext` + `_terrainBaseDensityAtCol`, beide Mirrors). alt==neu über **137k Punkte** (`diag-density-refactor`). → Chunk-Bau zusammen **6-12× vs. Brute**, der Lauf-Freeze an der Wurzel.
- **DIE RENDER-SONDIERUNG (zur Wand geprobt, nicht gehand-wavt — Schöpfer „du brauchst nicht meinen browser, du kannst das selbst"):** der „GPU-driven-Culling-Gigant" ist KEINER — die GPU CLIPPT off-frustum-Geometrie schon vor der Rasterung (ein Vertex-Degenerate-Cull spart NICHTS), `THREE.TSL.instanceMatrix` ist `undefined` (Instanz-Zentrum nicht greifbar), der Compute+Indirect-Weg ist high-risk mit nur marginalem Mehrwert über das schon-gebaute 60%-Region-Cull (V18.300). Der Render ist NAHE-OPTIMAL; die Fragment/Overdraw-Last senkt nur WENIGER/feiner-LOD-Geometrie (look-bound, Schöpfer-Auge) — kein Genialität-ohne-Verlust-Hebel mehr. Der Terrain-Selbstschatten ist look-essenziell (Pixel-Linse `diag-shadow-pixel`: ~7 % der Pixel). **Volle Befunde in `docs/archiv/handover.md` (Render-Sondierung).** Der Determinismus-Bogen ist seither VOLLENDET (V18.331 — Ammo raus, der BVH-Lauf-Freeze tot); der verbliebene „Gigant" (GPU-Dichte-Ceiling) ist ZUKUNFTS-ARCHITEKTUR/Vision-Enabler, kein aktueller Perf-Schmerz, und P4 (Replay/Lockstep) ist der eigene Folge-Bogen, den der deterministische Boden erst öffnet.

---

## §5 · Die Narben — probiert & VERWORFEN (nicht wiederholen)

> Lies das, bevor du einen Wasser-/Render-Ansatz vorschlägst — die Sackgassen sind teuer bezahlt.
> **Die Meta-Narbe:** 30 Wellen (V18.0–.31) drehten am Render-**Mesh**, während die Wurzel (kein
> Fluid) unberührt blieb — pixel-blind tweaken statt die Wurzel benennen ist die Spirale selbst.

**Wasser-Render:**

- Wasser-Fläche auf die Zell-Maske klippen (V18.7/.8/.9) → revertiert V18.10, **Sägezahn** (die
  Uferlinie gehört in den Tiefenpuffer, NIE in die Geometrie).
- Flacher Fluss-Querschnitt (V18.12) → revertiert V18.13, „Leben raus" — **und WIEDER (V18.26) →
  revertiert V18.27. ZWEIMAL dieselbe verworfene Architektur. Nicht ein drittes Mal.**
- Fluss-Anheben (V18.19) → revertiert V18.20, Bank-Sägezahn.
- Auslauf-Übergang-Regler / Dichte-Scan-skirt (V18.25/.30/.31) → Pflaster, verschlimmerte das Falten.
- Boundary-Face-Wasser-Mesh statt Surface-Nets (V13.2) → flach/gappy. **ABER: auch V13.6s
  Gegen-These („Wasser teilt den Iso-Mesher des Bodens = die Synergie") ist ÜBERHOLT** — die
  geschlossene Zell-Iso-Hülle war GEMESSEN selbst eine Wurzel (V18.1: sichtbare Unterseiten/Seiten
  = DH #424/#503; §0-Kanon: klettert/blockig/Zentrum-Delle). Der überlebende Kern von V13.6:
  EINE Skala + die Zellen als Wahrheit + das Glätten-PRINZIP — der Render ist ein
  Oberflächen-SHEET (wasser-plan §0), kein geteilter Volumen-Mesher.
- 3D-GPU-Fluid-Sim → als „falsches Werkzeug" markiert (Heilige-Lektion-Sünde; der gewählte Weg ist ein
  _zellulärer Automat_, nicht eine GPU-Sim).

**GPU/Render:**

- GPU-Density-WGSL-Pfad → abgeklemmt V14.6, geschnitten V17.20 (WebGPU-Roundtrip teurer als Worker-CPU).
- Cel/Schatten/Wind für WebGPU geopfert (V10.0-g) → Rollback V10.0-g.r (502 Issues/Frame, r160-Vendor-
  Bug; nativ geheilt in V12.0-f mit r184).
- Geometrie-eps gegen die Trapeze → falscher Hebel (bricht den Schatten via `normalBias`; die Wurzel
  war die Facetten-Lichtung, geheilt via Shading-`normalNode`, V17.107).

**Hydrosphäre:**

- Submarine-Biom-Dämpfung (V9.60-a) → zurückgerollt, Symptom-Pflaster (Wurzel: Biome unter Wasser).
- Perzentil-waterLevel-Magie + tanh-Bipolarisierung → verworfen (Sample-Region ≪ modulierende
  Wellenlänge; eine adaptive Konstante über zu kleine Region ist faktisch fest).

**Spawn:**

- Architektur-Optik-Aufwertung (Turm/Kristall, V17.16) → revertiert, entfesselte die Material-Resonanz
  (Baum-Spawn fiel auf 0) — eine Optik-Anreicherung MUSS tag-neutral sein (4 Achsen vorher/nachher messen).

---

## §6 · Die Teilsysteme — was EXISTIERT (nicht parallel bauen)

> Vor jedem „neuen" System: existiert es schon? (V17.9 — der Scatter-Baum war ein Parallel-Pfad.)

- **Welt-Substanz:** Terrain-Density (`_terrainBaseDensityAt`, 5 Oktaven + Höhlen; main+Worker, WGSL
  abgeklemmt) · Hydrosphäre (`_computeHydrosphere`, frozen ±1024 m) · Wasser-Pipeline (6 Schichten,
  `_atlasWaterLevelAt`→`waterCells`→Surface-Mesh→Shader) · Voxel-Streaming (`_tickVoxelChunkStreaming`,
  Ring + LOD-Kaskade + BVH + Worker).
- **Lebendiges:** das Feld (`auraAt` lesen · `_deposit*` schreiben · Vorhersagefehler-δ werten) ·
  Emotion-Kern (W1–W5, dimensional) · Kreaturen (Compound + `computeCreatureStats` + KI-Tick-LOD) ·
  der Nexus (ZWEI Lern-Pools: Gesten `dsl.history` + Gesetze `worldRules`; `_crystallizeGestureRule`
  [V18.112] kristallisiert bewährte Gesten zu stehenden Regeln — der Cross-Feed IST gebaut + live) ·
  DSL/Weltregeln (`dslRun`-Sandbox · `_tickWorldRules`).
- **Schöpfung:** Crafting-Resonanz (`_blueprintProductVector` → Rolle/Domäne/Op/Stat) · Werkstatt
  (Mach-Akte über `_makeCostGate` + `fertigeBlueprint`) · Hylomorphismus (`FORM_TAG_ACTIVATION`).
- **Render:** PBR (`_buildToonNodeMaterial` — der Name ist Umbenennungs-Schuld, baut IMMER PBR; Toon GESTRICHEN V18.237) · das FREQUENZBAND (`_applySubstanceResponse` — EIN Band-Empfänger, Antennen-Profile aus der Substanz; eye-relative Aerial) ·
  Schatten (Light-Space-Snap, EINE Map) · LOD-Kaskade (`DETAIL_CASCADE`, `_detailBand`) · Vegetation
  (Gras-HISM + Scatter).
- **Welt/Sozial:** Portal/Sub-Welten (W12–17) · Vibe-Pass (ed25519) · Bibliothek/Feed (`feedRatings`
  lokal) · Mesh (signaling + WebRTC + Compute-Sharing) · Fremd-Engine-Tor (Sandbox + Auto-Vendor).
- **Spieler/UI:** `computePlayerStats` (equip-Fold) · Inventar/Hotbar/Equip (`_blueprintUseKind`:
  Hand/Wear/Embody/Drink/Place) · Avatar/Seele · die 6 Räume + Designsystem (`.spec-*` · Omnibox).

---

## §7 · Die Samen — bewusst aufbewahrt, sollen BLÜHEN (nicht schneiden)

> Der „tot = raus"-Reflex ist falsch. Diese ruhen mit Begründung — schneide nur, was VERIFIZIERT
> durch Tieferes ersetzt wurde (V17.20/V18-Lehre).

- `_fieldWohlErlebt` · `_fieldWohlBaselineAt` — die WERTEN-Infrastruktur (das dritte Verb),
  test-verankert. `_observeFieldWohl` ist KEIN Samen — LIVE (2 Produktions-Aufrufer: Regel-Fitness +
  Spieler-Baseline, V18.285-Messung). Gemessen kein Runaway.
- `_archInstanceUpdate` + Instancing-Gating (`instanceable`/`breaksInstancing`) — für künftige
  bewegliche Instanzen + das Schloss gegen GPU-Memory-Bomben.
- `_drainGrassMeshPool` · `_drainScatterMeshPools` — Leak-Schutz (test-verankert, im Produktions-
  Pfad nicht genutzt, weil Reload aufräumt; der frühere `_drainPools`-Name existierte nie, V18.285).
- `_waterCellAt`-Inline (in `_playerWaterContext`) — bewusste Verdichtung, nie standalone.
- Chat-DSL-Skeleton (Nexus-Parser) — ruhender Vision-Faden, Phase E / S7-C konsumiert ihn.
- Die frozen Resonanz-Signaturen (`FORM_TAG_ACTIVATION` · `FORM_ROLE_SIGNATURES` · `computeBlueprintRole`)
  — emergent-korrekt, KEIN Ad-hoc-Tuning; die Struktur, auf der Rezeptbuch/Equip/Avatar bauen.
- **Die Code-Sweep-Samen (10.06., gigant-plan §5-D5/F4):** das Wetter-ambient-Array
  (`snow/embers/motes` :27292 — deklariert, nie geschaltet → D5a Wetter-Polyvalenz) · die
  anazhSymphony-Emotion→Tonalität-Lücke (Pfeiler 4 halb — das magieleitung-Shimmer :9658 ist das
  Vorbild → D5b) · `journal share/witness` (Typen ohne Schreiber — der Sozial-Bogen F4 schreibt
  sie; NICHT schneiden).
- **Die gebaut-aber-unverdrahtete öffentliche API ganzer fertiger Subsysteme (V18.286-Messung `diag-sediment`):**
  Archipel (`createPortalHall`/`signPortalHall`/`listPortalHalls`/…) · Robustheit (`setWorldVisibility`/
  `banPeer`/`banVibePassKey`/`_robustnessCorpus`) · Compute-Sharing (`signComputeContribution`/
  `recordPlaytestRun`/`listComputeContributions`) · `pinCurrentWorld`/`setRegionsActive`/`_portalForwardDsl`
  — ~19 Methoden, funktionsfähig + teils smoke-getestet, aber ohne UI-Knopf (`index.html`=0). KEIN
  Sediment — eine ruhende Fähigkeit, die UI-Verdrahtung verdient (eigener UX-Bogen), kein Schnitt.

---

## §8 · Was gebaut ist (stichwortmäßig — Detail in der Chronik)

- **Voxel-Terrain** (V9.07–.19) · **Hydrosphäre** (V9.43–.49) · **Multi-User + Fremd-Engine** (W12–17)
- **Render/Tiefe** (V12–17) — r184+WebGPU · Toon/Cel · ACES · Mikro-Textur · Gras-Riese · Ghibli-Bäume
- **Das lebendige Feld** (V17.21–.50) — lesen·schreiben·werten + Emotion-Kern · **DSL-Weltregeln** (V17.33–.40)
- **Crafting/Resonanz** (V17.59–.85) — ein Produkt-Vektor, viele Leser
- **Tiefe-Fundament** (V17.92–.118) — Ruckel·Schwimm·Trapeze·effiziente Höhe·Kavernen·Aquifer·Render-Harmonie·H3-Ozean·Worker
- **Wasser-Render** (V18.0–.31) — die Fläche-auf-`L` (statisch) · **Wasser-CA T4** (V18.84–.86,
  Modell+Welt+Render-Hybrid; die VEREINIGUNG W-A/B/C ist Phase 1)
- **UI-Putz-Bogen** (V18.32–.83) — 8 Tabs → 6 Räume · Omnibox · der freie Bildschirm

## §9 · Die operative Disziplin

1. **Regel #0** — pixel-blinde Arbeit browser-validiert, bevor die nächste Welle stapelt.
2. **Miss, rate nicht** — die 73 diag-Skripte; der Reproducer mit Output-Lesen _vor_ dem Fix.
3. **Verdichte, baue nie parallel** (V17.9, §6) · **Harmonie statt Revert** (V17.23) · **verifiziere
   KONSUM, nicht Existenz** (V17.31).
4. **Keine halben Schritte** (V17.30) — Plan klar + Gap benannt → das ganze Subsystem an die Wurzel.
5. **Eine verworfene Architektur nicht wieder anfassen** (§4) — ein Revert ist ein Signal, dass die
   Wurzel woanders liegt.
6. **Merge-Rhythmus** — ein validierter Bogen = ein Merge. **Der Tisch bleibt schlank** (ein fertiger
   Plan wandert sofort in die Bibliothek).
7. **Read-as-stranger VOR jeder Präsentation** (V18.3, verallgemeinert 09.06.) — bevor ein Plan, eine
   Analyse, ein „fertig" den Schöpfer erreicht, lies es feindlich, als wäre es von einem Fremden:
   _wirklich gemessen oder behauptet? aktuellster Stand oder nur die Klassiker? Hypothese als Hypothese
   markiert? Samen/Fäden verwoben oder vergessen?_ Der Selbst-Review ist mein Reflex, nicht die Frage des
   Schöpfers — er fand schon einen geshippten Bug (V18.3) UND einen zu selbstsicheren Plan (09.06.).

## §10 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (`V18.84` = die nächste). Pro Welle: ein Commit +
ein Chronik-Eintrag oben in `docs/archiv/handover.md`. Eine dauerhafte Lehre → eine Zeile in
`CLAUDE.md / Wichtige Gotchas`.

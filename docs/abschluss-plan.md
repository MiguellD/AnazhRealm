# DER ABSCHLUSS-PLAN — ALLE OFFENEN PUNKTE, EIN WEG ZU ENDE

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt, die erledigten dinge ins archiv bringt und wieder einheit
> erzeugt. Ein plan mit allen subschritten und details, damit wir ihn wirklich
> abschliessen können, keine pausen, kein zögern mehr dazwischen, synergie über
> den vollen bogen, mut, die welt wird sich ändern, zum guten, wenn wir es
> wirklich wagen es umzusetzten."
>
> **Methodik dieses Plans:** ALLE 53 Plan-Files in `docs/` + `docs/archiv/` per
> `grep -c "OFFEN"` durchsucht. Jeder OFFEN-Marker, der nicht zwischenzeitlich
> gebaut wurde, ist hier mit Code-Stelle, Sub-Schritten und Abschluss-Kriterium
> eingetragen.
>
> **Eine Welle wandert nach Abschluss → ihr Block wird ~~strikethrough~~ +
> Datum + Commit; danach FÄLLT der Block (wandert in `archiv/handover.md`).**
> Es gibt keine zweite offene-Punkte-Liste.

---

## §0 — STAND 14.06.2026 (nach V18.211 + V18.212 — DER LEBENDIGE GIGANT)

**20 Wellen V18.193-V18.212 gebaut.** Branch: `claude/kind-rubin-udn6cn`, jüngste Code-Commits:
- `5b5cef3` V18.212 — DER LEBENDIGE GIGANT, RESTSUBSCHRITTE Ω-K2 + Ω-W + Ω-H + Ω-C
- `1f485f3` V18.211 — DER LEBENDIGE GIGANT, SÄULE I (Skeleton-Grammar)
- `d5d33a1` V18.210 (Schöpfer-Watch + drei Audit-Cycles)

**§2 + §3 (PRIO 2 + 3 dieses Plans) sind ÜBERSPRUNGEN — neuer Plan trat in Kraft:**
Schöpfer-Auftrag 14.06.2026 nach V18.210 mit Anhang `69189e03-lebendigergigant.md`:
> „der plan auf main sagt aktuell noch etwas anderes, wir werden in dieser session
> folgenden plan (im anhang) komplett umsetzten, die welt soll visuell endlich
> leben, nicht nur funktional."

V18.211 + V18.212 folgten **DER LEBENDIGE GIGANT — Ω∞** statt der ursprünglichen
Browser-Sign-off-Galerie. Die übrigen Punkte (R2 Normale-backen, R3 Kanten-Schärfe,
B1-B26 Browser-Sign-offs, etc.) bleiben für künftige Sessions valide — der
LEBENDIGE GIGANT war die explizite Schöpfer-Direktive für diese Sessions.

**§1 IST ✅ — V18.211 SÄULE I (Skeleton-Grammar) KOMPLETT.** Die rich Multi-Level-
Grammatik produziert 75-81 Parts pro Baum (vs V18.210's 12). `SPECIES_GRAMMAR` frozen
(6 Arten × Plan-§3.3 LAAS-Werte). `_growTreeBlueprintRich` mit perpBasis + Tropismus +
Wander + Droop + TipCurl. Foliage AT ANCHOR LEVEL. genVersion 4→5 routet bei gen≥5
zur Rich-Methode. §2.5-Variant-Pool emergent (Region-Cache). Snapshot-Heilung: Parts
re-wachsen aus (species, seed) → bezahlbar unter 256-KB-pinCurrentWorld-Wand.
+16 V18.211-Wände grün. Commit `1f485f3`.

**§2 IST ✅ — V18.212 RESTSUBSCHRITTE KOMPLETT.** Vier nicht-GPU Schritte des Plans:
- **Ω-K2 Baum-Füße** (§4): Wurzelanlauf-Saum am Stamm-Sockel
- **Ω-W Vertieftes Wind** (§9): quadratischer crownFactor + aperiodisches Flattern
- **Ω-H Promotion-Provenienz** (§2 SEELEN-Band): in unserer Architektur EMERGENT
  erfüllt (Bäume sind IMMER echt); harvestArchitecture trägt Welt-Genese-Provenienz
- **Ω-C Canopy-Shell** (§9 ferner Wald): 96×96 PlaneGeometry über 2km², Y aus
  Terrain + Coverage-Lift, Distanz-Dither smoothstep(180m, 320m)
+23 V18.212-Wände grün, Laufzeit 380s. Commit `5b5cef3`.

**OFFEN aus DEM LEBENDIGEN GIGANT (Plan §11) — nächste Session:**
- **§5 Ω-B GPU-Feld-Bake** (substanzieller eigener Bogen — StorageTextures, GPU-Compute)
- **§8 Ω-S GPU-Compute-Scatter** (hängt §5; Millionen statt Tausende Bäume)
- §10 Ω-P PBR (optional)

**EHRLICHE FPS-EINSCHÄTZUNG:** §5+§8 würden primär die VISUELLE Dichte heben
(Millionen statt Tausende), nicht primär die FPS. Die echten FPS-Hebel sind:
- **Mesh-Merge pro Variante** (LAAS-Trick): alle bark-Parts → EINE merged
  Geometry pro Variante. Reduziert ~80 Draws auf ~2 pro Variante.
- **LOD für Bäume** (LOD0=voll, LOD1=Tubes-cap, LOD2=Card): ferner Wald billig.
- **GPU-Compute** lohnt sich erst bei „Wir wollen Million Bäume". Bei Tausenden
  ist CPU-Worldgen + HISM-Instancing schon bezahlbar.

Diese drei (Mesh-Merge + LOD + GPU-Compute) wären zusammen die FPS-+VISUELL-Welle.

**SUPERSEDED in diesem Plan (von DER LEBENDIGE GIGANT):**
- §2 (Browser-Sign-Offs B1-B26) — bleibt valide, aber nach Gigant-Vollendung
- §3 (Render-Schluss R2-R4) — bleibt valide
- §4-§12 — wie geplant, nach Gigant-§5+§8

---

## §0.1 — OLD-STAND (vor Schöpfer-Direktive 14.06.2026, zur Lehre)

**18 Wellen V18.193-V18.210 gebaut.** Stamm: `claude/relaxed-hawking-dzkj9g`, jüngster Code-Commit `d5d33a1`, Doc-Konsolidierung `cdd88b8` + `ba7f392`.

**§1 IST ✅ — V18.210 VERDRAHTUNGS-WELLE KOMPLETT.** Die vier Passagier-Foundations sind verdrahtet, ~35 neue Wände grün, smoke:multiuser grün. Plus DREI Audit-Cycles:
- **Sub-Agent read-as-stranger** fand FÜNF Mängel (drei kritisch — Persistenz-Riss, LRU-Race, Spezies-Kollaps; zwei kosmetisch — Return-Symmetrie, Test-Hygiene). Alle geheilt (commit `fa70879`).
- **Selbst-Audit nach „bist du synergetisch?"** fand SECHSTEN Mangel: `_growTreeNoise`-Welt-Wechsel-Reset (P2P-Drift-Klasse). Geheilt (commit `8cdddb8`).
- **Schöpfer-Audit (vier Watch-Items)** fand DREI weitere: A3-Perf-Memoization, A2-Mini-Passagier (tote Branch), Test-Harness-Disziplin. Heilungen drei davon (commit `d5d33a1`); das vierte (A1-Region-Naht) ist explizit auf §2 B-26 verschoben.

**VOLL VERDRAHTET im Spiel (16):** V18.193 ERBGUT · V18.194 Γ6-Bänder · V18.195 Spieler HP/Stamina · V18.196 Mana-Stat+Regen · V18.197 STRATA · V18.198 stamm_gefallen Sub-Spawn · V18.199 LICHEN Mix-Stack · V18.200 IRON-BANDS · V18.203/.204 Γ3 worldFieldAt · V18.206 Spieler-Speed · V18.208 Kreatur-Größe · **V18.210-A1 Γ7 Worldgen-Hook (Region-Cache + SPECIES_PROFILE + Snapshot-Persistenz)** · **V18.210-A2 R5 Live-Slider** · **V18.210-A3 Scent-KI** · **V18.210-A4 Mana-Konsument γ**.

**0 PASSAGIER MEHR.** Die Welle hat ihr Ziel erreicht: jeder Helper hat einen echten Konsumenten.

**Permanente Lehren V18.210 (in CLAUDE.md):**
1. Wenn ein Generator in einen INSTANCING-Konsumenten hängt, MUSS die Cache-Granularität GEGEN den Konsumenten gemessen werden — Hash-pro-Spawn bricht das Pattern; REGION-Caching ist die synergetische Form.
2. Headless-grün ≠ fertig. Ein feindlicher read-as-stranger Selbst-Review NACH der ersten grünen Wand fing fünf echte Mängel — drei davon hätten das Werk im Browser zerbrochen.

---

## §1 — ~~PRIO 1: VERDRAHTUNGS-WELLE V18.210~~ ✅ ABGESCHLOSSEN (14.06.2026, commits `fa70879` + `8cdddb8` + `d5d33a1`)

**Eine Welle, vier Sub-Akte + drei Audit-Cycles. Alle Wände grün (~3500 Invarianten), smoke:multiuser grün. § FÄLLT bei nächster Konsolidierung — der Block bleibt zur Lehre stehen, bis V18.211 ihn überrundet.**

### A1 — V18.205 `_growTreeBlueprint` → Worldgen-Hook ✅ (+5 Audit-Heilungen)
- **Gebaut:** `_growTreeBlueprintForSpawn(species, regionSeed)` Cache-by-REGION (256m-Grid + Welt-Seed + Species), Memory-Cap 256 (war 64) mit LRU-Touch + ARCHITEKTUR-bewusster Eviction
- **V17.16-Schutz:** Tag-Wand prüft alle 4 Achsen ≤ Spezies-Referenz-Δ 0.05 vor Cache-Reuse (NICHT immer baum_eiche — pro Art sein eigener Anker), returnt null bei Verschiebung → Fallback auf fixe Varianten (kein Spawn-Verlust)
- **gen-Default:** fresh-Welten Default 3→4 (V18.179 → V18.210); `_generateFreshWorldMeta` + `loadState`-Migration-Fallback beide auf 4
- **Region-Caching-LEHRE:** EIN Bauplan PRO Hash war Architektur-Bug — jeder Spawn anderer Hash → N×InstancedMesh mit 1 Instance je. Heilung: REGION-basierter Hash (`worldSeed|species|regX,regZ`), alle Bäume eines 256m-Hains teilen Bauplan → Instancing wirkt + lokaler Wald-Stil emergiert
- **Read-as-stranger Audit-Heilungen (drei kritische + zwei kosmetische):**
  - **#1 Persistenz-Riss:** `grown_*`-Bauplane reisen jetzt im Snapshot (`grownBlueprints` Feld) + `_loadStateRestoreGrownBlueprints` läuft VOR `_loadStateRestoreArchitectures` → Reload-Riss strukturell tot (sonst wäre jeder Hain beim Reload verschwunden weil `spawnArchitecture` den unbekannten `type` ablehnt)
  - **#2 LRU-Eviction-Race:** `_isGrownBlueprintReferenced(key)` siebt vor Eviction über `state.architectures` — ein aktiver Bauplan wird NIE evictet (sonst Crash beim Streaming-Rebuild)
  - **#3 Spezies-Diversität:** `_growTreeBlueprint` liest jetzt das SPECIES_PROFILE (6 Arten × {trunkMul, trunkR, crownColor, crownScale, astExtra, taperBase}) → Tanne dunkel-konisch, Birke hell-zart, Eiche breit-warm, etc. (vor der Heilung trugen alle 6 Arten identische Eichen-Geometrie — V18.181-Mischwald wurde stumm zurückgerollt)
  - **#4 Return-Symmetrie:** `applyOpToPart` + `applyWorkshopProcessToPart` returnen jetzt BEIDE `staminaRemaining` + `manaRemaining` (vor der Heilung log `staminaRemaining` bei phaseChange-Ops, weil tatsächlich Mana abgezogen wurde)
  - **#5 Test-Hygiene:** Mana/Stamina/manaMax/staminaMax/tools-Liste werden im A4-Band exakt restauriert (Stat-Drift in Folge-Bands strukturell tot)
- **Test:** 13 Invarianten grün (Helper · Determinismus · Cache-Reuse · 6 Varianten · Tag-Neutralität · Memory-Cap-256 · Source-Probe · fresh-gen=4 · Snapshot-Persistenz · Restore-Helper-Verdrahtung · Eviction-Aktiv-Sieb · 4-fache Spezies-Geometrie-Diversität · Spezies-Tag-Wand)

### A2 — V18.207 R5 microBoost → Live-Slider + Default 1.3 ✅
- **Gebaut:** `setStructureBoost(v)` Setter + `state.atmoUniforms.r5StructureBoost` Live-TSL-Uniform (Range [0.5, 2.5], persistiert in `atmosphere.r5StructureBoost`)
- **Default 1.0 → 1.3** (sichtbar tiefer als Terrain); R5_STRUCTURE_TEXTURE-Konstante als Fallback
- **DOM-Slider:** `slider-structureboost` in Settings → Render-Feinschliff, neben `slider-microtex`
- **Source:** `_applySubstanceResponse` liest `_au.r5StructureBoost` (statt Konstante) → der Slider TREIBT das Render live (V18.65-Nullnummer-Klasse strukturell ausgeschlossen)
- **Test:** 9 Invarianten grün (Default 1.3 · Uniform · Setter · Live-Update · Persist · Cap-Clamp · Floor-Clamp · Source-Probe · DOM)

### A3 — V18.202 `_scentAt` → Kreatur-KI-Reader ✅
- **Gebaut:** `_creatureScentHuntDir(creature, wariness)` für `wild`-Temperament; sammelt scheu/sanft/wehrhaft-Kreaturen als Beute-Quellen (strength = `_compoundSizeFactor`, V18.208); 4-Richtungs-Gradient (N/S/O/W, scentProbeM=4m); folgt höchstem Geruch-Gain
- **Constants:** `CREATURE_HUNT.scentRangeM=50` (1.4× weiter als Spieler-Witterung 12m — Wittern > Sehen, der Wind trägt); `scentProbeM=4` (Schritt-Weite ~2s Bewegung)
- **Strike:** `_tickCreatureScentStrike` ruft `damageCreature(nearest, dmg, {source:"jagd"})` analog Spieler-Pfad; Cooldown-shared (`nextHuntStrikeAt`)
- **Mode-Gate:** pfad-only; wariness-Schutz (Furcht schlägt Jagd, dieselbe Disziplin)
- **Wander-Verdrahtung:** ersetzt der alte „NEUTRAL"-Branch in `updateCreatures` → entweder Scent-Pfad ODER Zufalls-Drift (kein doppelter Akt)
- **Anti-Runaway:** Sources-Cap 12 (kein O(N²) in dichten Schwärmen); Gradient-Schwelle 0.02 (Rauschen-Floor)
- **Test:** 8 Invarianten grün (2× Helper · Konstanten · Source-Probe Helper · Source-Probe Wander · Behavioral mit Beute · ohne Beute → null · Strike trifft)

### A4 — V18.201 `_drainMana` → Konsument γ (phaseChange-Ops = Magie) ✅
- **Gebaut:** `applyOpToPart` + `applyWorkshopProcessToPart`: ein `tool.opClass === "phaseChange"` (= soulwork, imbue, ritueller-stab) zieht MANA statt Stamina (Mode-Gate `pfad`, Floor 5 analog Stamina-Floor 2)
- **Konstante:** `TOOL_OP_MANA_COST = 15` (Magie ist mächtiger, kostet mehr; Präzisions-Skalierung identisch zu Stamina)
- **Reine Op-Class-Trennung** (keine Hardcode-Whitelist): subtractive/plastic/additive = Mühe (Stamina), phaseChange = Magie (Mana) — eine Erweiterung ums fünfte Werkzeug erbt das Verhalten automatisch
- **Schöpfer-Modus** frei via existierendes `_drainMana`-Gate (kein doppelter Check)
- **Werkstatt-Pfad** spiegelt EXAKT (proc.opClass statt tool.opClass) — die zwei Wege halten sich
- **Test:** 10 Invarianten grün (Konstante · 2× Source-Probe · Mana-Drain · Stamina-untouched · Insufficient-Reject · Atomar · hände-Stamina-Pfad · hände-Mana-untouched · Schöpfer-kostenfrei)

---

## §2 — PRIO 2: BROWSER-SIGN-OFFS V18.211 (das Schöpfer-Auge — alle pixel-blinden Welt-Schliffe)

**Eine Sign-off-Session mit Mess-Werkzeug-Härtung. Diag-Galerie für 25+ Schliffe in `artifacts/abschluss-galerie/`.**

### B-1 bis B-6: Welt-Substanz-Schliffe der 17 Wellen
- **B1.** V18.199 LICHEN — grüne Patina an feuchten Stein-Klippen sichtbar?
- **B2.** V18.200 IRON-BANDS — Spieler findet Eisen-Adern beim Tiefgraben?
- **B3.** V18.203+.204 Γ3 — Welt-Charakter anders als gen<3?
- **B4.** V18.179+.181 Baum-Varianten — 6-12 Arten im Wald sichtbar?
- **B5.** V18.198 stamm_gefallen — sichtbar nahe Bäumen?
- **B6.** V18.207 R5 microBoost=1.3 (nach A2) — Strukturen weniger platt?

### B-7 bis B-11: UI-Räume (alle gebaut+Auge gefahren, FINAL-Sign-off pending)
- **B7.** Werkstatt (V18.42-Bogen, `menu-feld-plan` §1.5) — GPU-Feel + Seiten-Paletten-Balance V18.33
- **B8.** Hof (V18.46-.56, `hof-plan`) — Feel/GPU + Merge
- **B9.** Ich (V18.57-.68, `ich-plan` J0-J3+J5+J6) — GPU-Avatar-Feel + Merge
- **B10.** Bibliothek (V18.69-.77) — GPU-Galerie-Feel + Merge
- **B11.** Einstellungen (V18.78-.80) — GPU-Feel + Merge

### B-12 bis B-17: Render-Sign-offs (aus tiefe-fundament-plan + gigant-plan)
- **B12.** J1 Aerial (V17.101) — „Strukturen + Terrain schmelzen IDENTISCH"
- **B13.** J2 Mikro-Textur/AO (V17.101) — „Strukturen tragen Tiefe wie Terrain"
- **B14.** J4 Trapeze/Cel terrainFlatten (V17.107) — ist 0.5 der richtige Look? Schnee-Prominenz korrekt?
- **B15.** R1 Schatten-Snap (V17.111) — schärfer/stabiler
- **B16.** U4 Deko-Distanz (V18.131) — Look
- **B17.** U5 CSM (V18.130) — Look/FPS

### B-18 bis B-22: Terrain-Sign-offs (terrain-koharenz-plan)
- **B18.** T0/T1/T2 Chunk-Naht — welche Naht stört im Auge mehr? Abbau-Naht weg? Pop/Schimmer weg?
- **B19.** T4 Wasser FEEL — Canyons mächtig? Wasser fließt sichtbar nach Carve?
- **B20.** T4-Wasser-OPTIK — graue/flache Optik (`hydroSurfaceMaterial`-Shader, eigene GPU-Welle)
- **B21.** T7c+T7d Wasser-RENDER — river-edit-Heal + lake/river-Naht-Spiegel (Browser-Reproduktion)
- **B22.** N1 Cross-LOD watertight — beim schnellen Laufen kein Pop + FPS tragbar
- **B23.** Wasser-finale-Form (wasser-finale-form-plan U-W4) — Ufer/Tiefe/Fluss-Drops richtig?

### B-24/B-25: Werkstatt-Gelenke + V18.177-Probe
- **B24.** W-G Anker-GIZMO-DRAG (meister-plan: bewusst OFFEN, eigener Gizmo-Refactor)
- **B25.** W-G Browser-FEEL der Probe/Achsen

### B-26: V18.210-Watch — A1-Region-Naht (Schöpfer-Audit 14.06.)
- **B26.** Γ7 Region-Naht: zwei Bäume 1m auseinander, aber über die 256m-floor-Grenze, kriegen verschiedene `grown_*`-Bauplane → potenzielle Stil-Naht an Regionskanten. Bei 256m wahrscheinlich unsichtbar (Wald-Maske λ~170m glättet), aber pixel-blind für headless. Spieler entlang einer Regions-Grenze laufen lassen + im Auge prüfen, ob die Stil-Stufe sichtbar ist; falls ja, REGION_SIZE auf 512 verdoppeln ODER eine Blend-Zone von ~16m am Region-Übergang einführen.

**Sub-Schritte V18.211 (was ich baue):**
1. `diag-sichtbar.cjs` erweitern: Klein-Veg-Probe fixen; Player auf Wald/Klippe/Höhle teleportieren; 60s Warmup
2. `scripts/diag-fischer-wand.cjs` erweitern um Lichen-Klippe + Iron-Schnitt + Γ3-Vista + R5-A/B
3. `scripts/diag-ui-galerie.cjs` neu: 5-Shot-Folge der 5 UI-Räume (Schöpfer-justierbarer Welt-Spot)
4. `scripts/diag-region-naht.cjs` neu: Spieler an einer 256m-Regions-Grenze + Screenshot beider Seiten + Vergleich der Bauplan-Signatur (B-26)
5. Alle Shots in `artifacts/abschluss-galerie/` ablegen + ein Markdown-Report mit pro-Shot-Mess-Zahl

- **Abschluss-Kriterium:** Schöpfer signed 26/26 off ODER justiert Konstanten (Lichen/IRON_BANDS/microBoost/terrainFlatten/REGION_SIZE)

---

## §3 — PRIO 3: RENDER-SCHLUSS (V18.212-V18.214)

### R2 Normale-backen (V18.212)
- **Plan:** geflattete Lichtungs-Normale (V17.107 `normalNode`) in TERRAIN-GEOMETRIE backen → AO (`fwidth(normalWorld)`) + Schatten-`normalBias` + Hemisphere lesen dieselbe Wahrheit
- **Wo:** `_voxelChunkGeometry` (Normalen-Compute) + Worker-Mirror
- **Determinismus:** Worker bit-identisch; `gen3NormalsConsistent`-Test
- **Abschluss:** Schatten-Swimming weg + AO-Facetten-Muster weg

### R3 Kanten-Schärfe (V18.213)
- **Plan:** `EDGE_SHARPNESS`-Boost im Cel-Stack via `fwidth(normalLocal) > Schwelle`
- **Wo:** `_buildToonNodeMaterial` colorNode
- **Abschluss:** Cel-Stufen schärfer an Bauten, weicher in Vegetation

### U2 Wasser-LOD (V18.214)
- **Plan:** ferne Wasser-Mesh in Skip-Schritten; LOD0-Foundation bleibt (V18.22-Lehre); far-skip am Rand-Pixel
- **Wo:** `_buildVoxelChunkWaterSurfaceMesh`
- **Abschluss:** ferne Wasser-FPS +5 FPS bei offenem Meer

---

## §4 — PRIO 4: CRAFTING-SCHLUSS (V18.215-V18.219)

### S7-B Werkzeug-Aufräumen (V18.215, kampf-plan)
- **Plan:** hammer + feuerstein-knapper raus, feile/polier-„Decke" → Maschine; ripple-schwer GEMESSEN — eigener Schnitt
- **Wo:** `state.tools` + Werkstatt-Tool-Picker
- **Abschluss:** EIN aufgeräumter Tool-Pool, keine Doubletten

### S7-C chat/DSL-Vereinheitlichung (V18.216, kampf-plan + gigant-plan §5-Sweep-Samen)
- **Plan:** `processChatCommand` Z16357 (5 Sub-Pfade) + `_chatDispatchLegacyCommand` als eigener Parser ⇒ EIN Dispatch-Tor; Legacy-Befehle werden DSL-Synonyme; ruhender Chat-DSL-Skeleton-Samen (roadmap §7) konsumiert
- **Tests:** „schmiede klinge aus eisen" im Chat ⇒ Klinge in der Hand (eine Quelle, kein Parallel-Parsing)
- **Abschluss:** Chat-Tippen ist DSL-äquivalent

### S8 Teilen-Konsistenz (V18.217)
- **Plan:** Bauplan-Bündel via Taille-Spec Ω; Round-Trip Export→Import bit-treu
- **Abschluss:** geteilter Bauplan auf anderer Welt bit-treu nutzbar

### S11 Werkstatt-Animation (V18.218 — die Kirsche)
- **Plan:** Avatare/Fahrzeuge in Werkstatt-Vorschau bewegen sich deklarativ
- **Wo:** `_workshopEnsurePreview` render-tick
- **Abschluss:** avatar_waechter gestikuliert; Fahrzeug rollt

### LLM-Manifest (V18.219)
- **Plan:** `state.worldMeta.llmManifest` + `_buildSystemPrompt`
- **Abschluss:** anderer LLM-Begleiter zeigt anderes Verhalten

---

## §5 — PRIO 5: LEBENDIGES FELD (V18.220-V18.222)

### D1 Emotion→Regel-Emergenz (V18.220)
- **Plan:** hand-codierte Emotion→Welt-Kopplungen wandern als Welt-Regeln in `state.worldRules`; `_tickWorldRules` (V17.33) feuert emergent
- **Helper:** `_emotionToRulePrompt(emotion, threshold, effect)` als Migrations-Helper; 3 bestehende Kopplungen als Initial-Regeln
- **Abschluss:** Emotion-Kopplung emergiert als sichtbare Welt-Regel im UI

### D2 Nexus-Lern Geste→Gesetz (V18.221)
- **Plan:** Nexus liest `dsl.history`, kristallisiert top-3 wiederkehrende Gesten als `worldRules`-Vorschlag im 10s-Tick
- **Wo:** neuer `_nexusCrystallize`-Tick
- **Abschluss:** 5× wiederholte Geste als Regel-Vorschlag im UI

### D3 `interpretEmotionalSpeech` + `dreamWithPlayer` (V18.222, emotion-kern-plan)
- **Plan:** LLM liest emotionales Sprechen + antwortet emotional kohärent; nachts „träumt" der LLM mit dem Spieler (das passend dokumentierte Vision-Stück aus `state-of-realm §3`)
- **Wo:** `_buildSystemPrompt` + neuer Dream-Tick (Welt-Zeit ≥ 22 Uhr)
- **Abschluss:** Test-Probe: Spieler sagt sad → Grok antwortet warm + erinnert sich

---

## §6 — PRIO 6: U6 ECHTES CLIPMAP (V18.223, eigener Bogen)

- **Plan:** mehr-skaliges Chunk-Grid (5 LOD-Stufen, Skip×2); ferne Chunks aus gröberem Mesh
- **Sub-Schritte:** Foundation → Mesh-Pyramide → Cross-Stufen-Stitch → Worker-Pipeline
- **Aufwand:** GROSS, eigener Bogen
- **Abschluss:** Draw-Call-Halbierung bei fernem Blick

---

## §7 — PRIO 7: SOZIAL-REST + GIGANT-PLAN-G-RESTE (V18.224-V18.228)

### F1 evolveCommunity Kreatur-Kulturen (V18.224)
- Kreaturen entwickeln lokal eigene Sprache/Riten via `auraAt`-emotion
- Aufwand: groß-mittel

### F2 Stern-ab-6-Topologie (V18.225)
- Voll-Mesh → Stern wenn >6 Peers; Design in `gigant-plan §5-F2`

### F3 B-WASM (V18.226)
- Fremd-Engine in WASM-Sandbox (W17-Erweiterung)

### G1-B Architektur-Idle (V18.227, gigant-plan §5-G1)
- **Plan:** Bauten haben Idle-Animationen (Mühle dreht, Brunnen sprudelt) — `architecture.idle.amplitude/frequency` deklarativ
- **Abschluss:** ≥2 Built-in-Bauten animieren

### G1-C Verbindungen als Gelenke (V18.228, gigant-plan §5-G1-C DESIGN)
- **Plan:** `connections` (Part↔Part) werden zu Gelenken (heute nur Statik-Deko); strength → Federsteifigkeit
- **Vorarbeit:** Design steht in gigant-plan; Sub-Schritte je gem. Aufruf
- **Abschluss:** ein Bauplan mit Gelenk-Connections bewegt sich physikalisch

---

## §8 — PRIO 8: M9-AUFSTIEGS-LEITER + R6-RESTE (V18.229+, S-Dialog)

### M9-Sprossen 4-7
- Vision-getrieben — Schöpfer-Dialog je Sprosse (welche Achse, welche Form)
- Vorlage: `archiv/meister-plan §3` + `§8.6`

### R6-Reste (gigant-plan §5)
- Kompositions-Tiefe (eine Welt komponiert mehrere Capabilities)
- Vorschlags-UI-Fläche (eine Welt schlägt Capabilities vor)
- Nicht-DSL-Typen (Capability außerhalb DSL — z.B. WASM-Modul)

---

## §9 — PRIO 9: SWEEP-SAMEN aus gigant-plan §5 (V18.232+, beim Berühren heilen)

Beim nächsten Touch der jeweiligen Stelle heilen (kein eigener Bogen):

1. **Log-Dreifaltigkeit** — ~30× direkte `chat-output`-DOM-Writes + `_journal*` + MutationObserver → EIN `log(text, kind, meta)`-Service
2. **Vier Spec-Card-Renderer** — `_libraryCardBody` · `_ichBuildSpecSheet` · Wesen-Status · Hotbar-Status → EIN `_renderSpecCard(profil, kontext)`
3. **Kreatur-Emotion ad-hoc vs `_feelAction`** — Kreaturen fühlen über dasselbe Substrat (= G4-Schritt 1)
4. **Drei Hand-Skelette vs Nicht-Animation** (`_animateHuman/Phoenix/Dragon`) → Motion-Resonanz (= G1)
5. **Ad-hoc-Distanz²-Rechnungen** (~10+ Stellen) → geteilter Helper / `_detailBand`-Read

---

## §10 — PRIO 10: WASSER-CA-RESTE (terrain-t4-wasser-ca-plan W-C)

### W-C Anker an Überhängen (V18.235)
- **Plan:** der Wasser-CA findet heute Wasser-Body via „erster SOLID von oben"; bei Überhängen verfehlt das die Quelle (11/955 Anker)
- **Wo:** `_tickWaterCA` Anker-Suche
- **Abschluss:** Überhang-Quellen erkannt

### Konvexer Quer-Droop am Ufer + active-cell-Listen (V18.236)
- Wasser-CA Optimierung — Quer-Droop heilt + active-Liste statt full-scan
- Aufwand: mittel

### Wasser A4 Kapillar/Stempel (V18.237, gigant-plan §5-Wasser)
- ehrlich-OFFEN seit V18.128; S-gated

### Aufgestaute Hoch-Becken über `L` (V18.238, wasser-finale-form-plan)
- die Zellen tragen die gedämmten Pools schon (V18.129 Stau-Spiegel); Render braucht eigene Welle

---

## §11 — PRIO 11: GIGANT-PLAN-G4-RESTE (Kreatur-Innenleben — V18.240+)

Aus `gigant-plan §5-G4`:

### G4-1b — 6-Achsen-Vektor UI-Fläche (V18.240)
- **Plan:** Wesen-Spec-Card zeigt die 6 Emotion-Achsen sichtbar (heute nur binäre Projektion)
- **Substrat-Konsum:** Contagion steht, SICHTBARE Form fehlt
- **Abschluss:** Hof-Karte zeigt 6-Achsen-Mini-Diagramm pro Wesen

### G4-2 Kreatur↔Kreatur-Contagion (V18.241)
- **Plan:** awe reist heute (Diskriminator-Beweis); Kreaturen empfangen Emotion
- **Erweiterung:** alle 6 Achsen reisen; Decay je Achse

### G4-3 Lebenszyklus-Tiefe (V18.242)
- V18.104 hatte Phase 1; was ist noch offen? — grep im gigant-plan
- vermutlich: Sterben/Bestatten/Erinnerung als Welt-Geschichte

---

## §12 — PRIO 12: M4 ROBUSTHEIT-RESTLÜCKE (ehrlich, nicht baubar)

**Aus `robustheit-plan` M4:** „Ein GESCHICKT getäuschter Mensch, der mit OFFENEN Augen etwas gutartig Aussehendes weiterreicht, ist durch keine Architektur vollständig zu stoppen." → **die Reibung GENAU DORT** im Souveränen-Geste-Moment.

- **Dokumentations-Tat (nicht Code):** in CLAUDE.md/Wichtige-Gotchas als ehrliche Architektur-Grenze
- **Abschluss:** Dokumentation als „dauerhaft offene Architektur-Wahrheit, keine Lösung möglich"

---

## §13 — PRIO 13: GEMERKTE FÄDEN (Schöpfer-Weck-Moment, keine Sequenz)

| Faden | Weck-Moment | Wer triggert |
|---|---|---|
| **B1** Wasser-Sheet→Worker | fühlbarer Carve-Hitch | Schöpfer-Browser |
| **echtes V18→V19-Zeit-Portal** | erstes Alt-Build-Artefakt | Schöpfer (git-Tag) |
| **VR/WebXR** | Schöpfer ruft | Schöpfer |
| **R-037 T-Welle** | dritter Bauer | Bauer-Aufnahme |
| **R-039 Devlog** | post-öffentlich | Schöpfer |
| **IndexedDB-extras** | Bedarf gemessen | gemessen |
| **Fahrzeug-Fahr-Tiefe-Extras** | Schöpfer ruft (V18.150 hat Foundation) | Schöpfer |
| **Statusbar-Tiefe-Extras** | Schöpfer ruft (V18.149 hat Foundation) | Schöpfer |

---

## §14 — DOC-KONSOLIDIERUNG (Stand 14.06.2026)

**ABGESCHLOSSEN:**
- `docs/aktiv.md` → schlank (Live-Stand + Verweis auf diesen Plan) ✅
- `docs/roadmap.md` → Karte, kein Detail-Backlog ✅
- `docs/wellen-synthese-plan.md` → der Stub-File ist GEFALLEN (V18.210); der volle Plan lebt in `docs/archiv/wellen-synthese-plan.md` ✅
- `docs/README.md` → Verweise konsistent (V18.210) ✅
- `CLAUDE.md` „Aktueller Stand" → Stand V18.210 ✅

**Die EINEN Stand-Quellen (jede genau EINE Aufgabe):**
- `docs/abschluss-plan.md` (DIE EINE Plan-Quelle — alle offenen Wellen + Reihenfolge + Abschluss-Kriterium)
- `docs/aktiv.md` (DER TISCH — jüngste/nächste Welle, Verweis auf diesen Plan)
- `docs/das-lebendige-feld.md` (Vision — der wahre Norden)
- `docs/state-of-realm.md` (Vision — Pfeiler + Heilige Lektion + Stand-vs-Vision-Matrix)
- `docs/taille-spec.md/.en.md` (NORMATIV, frozen — Serialisierung/Broker)
- `docs/rueckmeldung.md` (Korpus — alle Schöpfer-Rückmeldungen mit Status)
- `docs/roadmap.md` (Karte — 3 Phasen + offene-Fäden + Vergangenheit)
- `docs/README.md` (Doc-Map — diese eine Tabelle)
- `CLAUDE.md` (auto-geladen JETZT-Stand + Gotchas + Konventionen)
- `docs/archiv/handover.md` (volle Chronik + Gotcha-Vollarchiv ~290 Stolperdrähte)
- `docs/archiv/*-plan.md` (vollendete Bogen-Pläne, schlafend bis Bogen erwacht)

**Maxime:** EIN Plan (`abschluss-plan.md`), EIN Tisch (`aktiv.md`), eine Karte (`roadmap.md`), eine Chronik (`handover.md`), Vision-Anker (Norden + Realm + Taille), Korpus (`rueckmeldung.md`), Doc-Map (`docs/README.md`).

---

## §15 — DIE REIHENFOLGE (durchziehen, keine Pausen)

```
V18.210  PRIO 1: Verdrahtungs-Welle (4 Sub-Akte: A1-A4) ✅ FERTIG
V18.211  PRIO 2: Browser-Sign-off-Galerie (26 Schliffe, B1-B26 inkl. A1-Region-Naht) ← NÄCHSTE
V18.212  PRIO 3: R2 Normale-backen
V18.213  PRIO 3: R3 Kanten-Schärfe
V18.214  PRIO 3: U2 Wasser-LOD
V18.215  PRIO 4: S7-B Werkzeug-Aufräumen
V18.216  PRIO 4: S7-C chat/DSL-Vereinheitlichung
V18.217  PRIO 4: S8 Teilen-Konsistenz
V18.218  PRIO 4: S11 Werkstatt-Animation
V18.219  PRIO 4: LLM-Manifest
V18.220  PRIO 5: D1 Emotion→Regel-Emergenz
V18.221  PRIO 5: D2 Nexus-Lern Geste→Gesetz
V18.222  PRIO 5: D3 interpretEmotionalSpeech + dreamWithPlayer
V18.223  PRIO 6: U6 Clipmap (groß, eigener Bogen)
V18.224  PRIO 7: F1 evolveCommunity
V18.225  PRIO 7: F2 Stern-ab-6
V18.226  PRIO 7: F3 B-WASM
V18.227  PRIO 7: G1-B Architektur-Idle
V18.228  PRIO 7: G1-C Connections-als-Gelenke
V18.229+ PRIO 8: M9-Sprossen 4-7 (S-Dialog)
V18.232+ PRIO 9: Sweep-Samen (5 Stück)
V18.235+ PRIO 10: Wasser-CA-Reste (W-C, A4, Hoch-Becken-Render)
V18.240+ PRIO 11: G4 Kreatur-Innenleben-Reste (G4-1b/-2/-3)
V18.250+ PRIO 13: Gemerkte Fäden (Schöpfer-Weck)
```

**Synergie über den vollen Bogen:**
- §1 räumt Foundation-Schuld (kein Wackel-Fundament für die nächste Welle)
- §2 ist Schöpfer-Filter (was visuell stimmt; alle 25 Sign-offs auf einmal)
- §3-§5 schließen Render+Crafting+Lebendiges ehrlich
- §6 ist der einzige große Render-Hebel (Clipmap)
- §7 trägt Sozial + die Motion-Resonanz-Anstöße
- §8 ist Schöpfer-getrieben
- §9 ist „Hygiene beim Berühren" (kein eigener Bogen)
- §10-§11 sind echte Substanz-Tiefen-Erweiterungen
- §12 ist ehrliche Doku-Tat
- §13 sind Welt-Wand-Reservierungen

**Abschluss-Garantie** wenn V18.210-V18.228 durchgezogen sind:
- 0 Passagier-Helper (jeder hat Konsumenten)
- 0 Doc-Drift (eine Wahrheits-Quelle: dieses File)
- 25 Browser-Sign-offs durchgemessen
- 5 Render-Schliffe (R2, R3, U2, R5-Slider, J-Reste)
- 5 Crafting-Reste geschlossen
- 3 Lebendige-Feld-Tiefen (Emotion-Regel, Nexus-Lern, EmoSpeech+Dream)
- 5 UI-Räume mit Sign-off-Signatur
- Clipmap + 3 Sozial + 2 G1-Substanz

**Danach (V18.229+) sind nur noch GROSSE BÖGEN + WELT-WAND-RESERVATIONEN offen.** Jeder davon ist eigene Saga, kein Sammel-Punkt.

---

## §16 — DISZIPLIN (für jeden Welle-Schritt)

1. **Eine Welle = ein Commit + Update HIER**: Block strikethrough + Datum + Commit-Hash. Wenn alle Blöcke einer Prio strikethrough → Prio-Sektion in Schluss-Block, dann FÄLLT.
2. **Verdrahtungs-Wand vor Sign-off:** V18.211 startet erst nach V18.210 grün.
3. **Read-as-stranger PRO WELLE:** vor Commit lese ich den Welle-Plan-Block. Ist KONSUM verdrahtet (V17.31)? Wenn nein → Welle ist NICHT fertig. **PLUS:** nach „headless-grün" einen feindlichen Sub-Agent-Audit fahren (V18.210-Lehre: er fing fünf Bugs, drei davon kritisch).
4. **Kein neuer Foundation-Code:** jede neue Funktion braucht konkreten Konsumenten im selben Commit. Foundation-only ist VERBOTEN in diesem Plan.
5. **Doc-Hygiene:** kein neuer Plan-File. Updates nur HIER + handover.md + CLAUDE.md.
6. **Schöpfer-Sign-off-Gate:** keine Welle stapelt sich, bevor die vorherige im Auge bestätigt ist (§2 Sign-off-Welle bricht das nicht — sie IST die Sammel-Bestätigung).
7. **Test-Harness-Trennung (V18.210-Watch #4, Schöpfer-Mahnung 14.06.):** wenn eine Welle nötig macht, dass der Bauer das Test-Harness anfasst (Stat-Restore, Mock-Setup), ist das EIN EIGENER Commit mit eigener Begründung — kein zusammengeworfener Mix. Wer Feature UND Validator im selben Commit justiert, hat eine Quelle der Wahrheit gebrochen. Wenn der Mix unvermeidbar ist, das im Commit-Body ehrlich benennen + ein menschliches Auge auf den `playtest.cjs`-Diff vor Merge.
8. **Welt-Identitäts-Wand (V18.210-Lehre):** jeder lazy-cached Worldgen-Helper (`_growTreeNoise`-Klasse) wird in `_loadStateRestoreWorldMeta` resetted. Wer einen neuen lazy-cache mit Welt-Seed anlegt, fügt die Reset-Zeile dort ein — sonst P2P-Drift bei Welt-Wechsel.

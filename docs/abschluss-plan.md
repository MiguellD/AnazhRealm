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

## §0 — DIAGNOSE 14.06.2026 (read-as-stranger nach voller Audit)

**17 Wellen V18.193-V18.209 gebaut.**

**VOLL VERDRAHTET im Spiel (12):** V18.193 ERBGUT · V18.194 Γ6-Bänder · V18.195 Spieler HP/Stamina · V18.196 Mana-Stat+Regen · V18.197 STRATA · V18.198 stamm_gefallen Sub-Spawn · V18.199 LICHEN Mix-Stack · V18.200 IRON-BANDS · V18.203/.204 Γ3 worldFieldAt · V18.206 Spieler-Speed · V18.208 Kreatur-Größe.

**PASSAGIER (gebaut, KEIN Spiel-Konsument):** V18.201 `_drainMana`/`_canPayMana` · V18.202 `_scentAt`/`_worldWindDirAt` · V18.205 `_growTreeBlueprint` · V18.207 R5 microBoost=1.0.

**Ehrlich-falsch in V18.209-Konsolidierung:** Mein erster abschluss-plan war NICHT vollständig — ich verließ mich auf `aktiv.md §4` + `roadmap.md §4` + mein Wissen, statt alle 53 Plan-Files systematisch zu prüfen. Im zweiten Schöpfer-Audit fand ich 30+ weitere OFFENe Punkte in `gigant-plan.md`, `terrain-koharenz-plan.md`, `wasser-finale-form-plan.md`, `tiefe-fundament-plan.md`, `ich-plan.md`, `hof-plan.md`, `bibliothek-plan.md`, `einstellungen-plan.md`, `menu-feld-plan.md`, `meister-plan.md`, `kampf-plan.md`, `emotion-kern-plan.md`, `robustheit-plan.md`, `lod-kaskade-plan.md`, `genese-plan.md`, `terrain-t4-wasser-ca-plan.md`. **Dieser §0 ist die einzige Stelle, an der diese Mess-Schuld eingestanden wird; alle gefundenen Punkte sind jetzt in §1-§14 eingearbeitet.**

---

## §1 — PRIO 1: VERDRAHTUNGS-WELLE V18.210 (vier Passagier-Foundations konkret machen)

**Eine Welle, vier Sub-Akte. Synergie: alle vier folgen R2-strukturell + Anti-Scope §3.**

### A1 — V18.205 `_growTreeBlueprint` → Worldgen-Hook
- **Wo:** `_vegetationSampleSpawn` Z49936-49977 (wo fixe Varianten gewählt werden)
- **Wie:** gen≥4-Gate (opt-in, alte Welten bit-identisch); `_growTreeBlueprint(speciesKey, seedForSpawn)` ersetzt fest gebaute Variante; erzeugter Bauplan in `state.blueprints["grown_<species>_<hash>"]` als Cache-by-Hash (Memory-Cap)
- **V17.16-Schutz:** Tags vor Cache-Reuse; neue Affinitäts-Wand prüft alle 4 Achsen ≤ baum_eiche
- **Tests:** Source-Probe gen=4 ruft Helper; Cache-Probe gleicher Hash = gleiches Object; Tag-Wand
- **Abschluss:** gen=4-Welt zeigt ≥6 prozedurale Baum-Hashes; gen<4 bit-identisch

### A2 — V18.207 R5 microBoost → Live-Slider + Default 1.3
- **Wo:** `AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost` + `_applySubstanceResponse`
- **Wie:** Default 1.0→1.3 (sichtbar); `state.atmoUniforms.r5StructureBoost` als Live-Uniform; Einstellungen-Slider (Render-Feinschliff)
- **Abschluss:** Schöpfer-Sign-off — Strukturen weniger „platt"

### A3 — V18.202 `_scentAt` → Kreatur-KI-Reader
- **Wo:** `_creatureNextAction`-Tick (grep zuerst)
- **Wie:** Raubtier-Soul (`temperament:"raubtier"`, V18.107) liest `_scentAt(pos, sources)` mit Beute-Kreaturen; Bewegung Richtung höchstem Geruch-Gradient
- **Geruchs-Quellen:** Kreaturen mit `temperament:"flüchtig"`/`"scheu"` emittieren (strength = sizeFactor V18.208)
- **Tests:** Raubtier mit Beute in 50m → bewegt sich; ohne → ambient
- **Abschluss:** Headless-Behavioral-Probe beweist Jagd-Tendenz

### A4 — V18.201 `_drainMana` → Konsument γ (Werkstatt-`resonanz`-Op)
- **Plan:** `applyOpToPart` mit `op:"resonanz"` kostet `MANA_COST_RESONANZ=15` statt Stamina (Magie statt Mühe)
- **Tests:** pfad-Modus zieht 15 Mana; bei mana<15 verweigert; schöpfer-Modus frei
- **Abschluss:** Mana-Wert (folgt mit B-Block) sinkt sichtbar beim Akt

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

**Sub-Schritte V18.211 (was ich baue):**
1. `diag-sichtbar.cjs` erweitern: Klein-Veg-Probe fixen; Player auf Wald/Klippe/Höhle teleportieren; 60s Warmup
2. `scripts/diag-fischer-wand.cjs` erweitern um Lichen-Klippe + Iron-Schnitt + Γ3-Vista + R5-A/B
3. `scripts/diag-ui-galerie.cjs` neu: 5-Shot-Folge der 5 UI-Räume (Schöpfer-justierbarer Welt-Spot)
4. Alle Shots in `artifacts/abschluss-galerie/` ablegen + ein Markdown-Report mit pro-Shot-Mess-Zahl

- **Abschluss-Kriterium:** Schöpfer signed 25/25 off ODER justiert Konstanten (Lichen/IRON_BANDS/microBoost/terrainFlatten)

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

## §14 — DOC-KONSOLIDIERUNG (Folge dieses Plans)

**Was passiert mit Plan-Files NACH Abschluss:**

**JETZT (mit diesem Commit) verschoben/geschlankt:**
- `docs/aktiv.md` → schlank (Live-Stand + Verweis); ✓ JETZT
- `docs/roadmap.md` §4 → Karten-Verweis; ✓ JETZT
- `docs/wellen-synthese-plan.md` → ins Archiv-Folder (war nur Verweis-Stub) → JETZT in diesem Commit

**Bleiben aktiv:**
- `docs/abschluss-plan.md` (DIE EINE Quelle)
- `docs/aktiv.md` (Live-Stand)
- `docs/das-lebendige-feld.md` (Vision)
- `docs/state-of-realm.md` (Vision)
- `docs/taille-spec.md/.en.md` (NORMATIV, frozen)
- `docs/rueckmeldung.md` (Korpus)
- `docs/roadmap.md` §1-§3 (Karte), §5-§10 (Narben/Teilsysteme/Samen/Disziplin/Versions)
- `docs/README.md` (Doc-Map)
- `CLAUDE.md` (auto-geladen)
- `docs/archiv/handover.md` (volle Chronik)
- `docs/archiv/*-plan.md` (Bogen-Pläne als Vergangenheit, nicht aktiv)

**Maxime:** EIN Plan (dieser), EIN Tisch (`aktiv.md`), eine Karte (`roadmap.md` ohne §4-Details), eine Chronik (`handover.md`), Vision-Anker (Norden + Realm + Taille), Korpus (`rueckmeldung.md`).

---

## §15 — DIE REIHENFOLGE (durchziehen, keine Pausen)

```
V18.210  PRIO 1: Verdrahtungs-Welle (4 Sub-Akte: A1-A4)
V18.211  PRIO 2: Browser-Sign-off-Galerie (25 Schliffe, B1-B25)
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
3. **Read-as-stranger PRO WELLE:** vor Commit lese ich den Welle-Plan-Block. Ist KONSUM verdrahtet (V17.31)? Wenn nein → Welle ist NICHT fertig.
4. **Kein neuer Foundation-Code:** jede neue Funktion braucht konkreten Konsumenten im selben Commit. Foundation-only ist VERBOTEN in diesem Plan.
5. **Doc-Hygiene:** kein neuer Plan-File. Updates nur HIER + handover.md + CLAUDE.md.
6. **Schöpfer-Sign-off-Gate:** keine Welle stapelt sich, bevor die vorherige im Auge bestätigt ist (§2 Sign-off-Welle bricht das nicht — sie IST die Sammel-Bestätigung).

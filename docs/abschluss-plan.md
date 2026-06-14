# DER ABSCHLUSS-PLAN — ALLE OFFENEN PUNKTE, EIN WEG ZU ENDE

> **Auftrag Schöpfer 14.06.2026:** „Bringe einen plan zusammen, der alle offenen
> punkte aufnimmt, die erledigten dinge ins archiv bringt und wieder einheit
> erzeugt. Ein plan mit allen subschritten und details, damit wir ihn wirklich
> abschliessen können, keine pausen, kein zögern mehr dazwischen, synergie über
> den vollen bogen, mut, die welt wird sich ändern, zum guten, wenn wir es
> wirklich wagen es umzusetzten."
>
> **Dieses File trägt JEDEN offenen Punkt mit Sub-Schritten und Abschluss-
> Kriterium. Es ersetzt `aktiv.md §4`, `roadmap.md §4`, alle verstreuten
> offenen-Punkte-Markierungen. Eine Welle wandert nach Abschluss → ihr Block
> wird ~~strikethrough~~ + Datum + Commit; danach FALLT der Block.** Es gibt
> keine zweite offene-Punkte-Liste.
>
> **Reihenfolge ist Synergie**, nicht Willkür: erst die VIER PASSAGIER-
> Schulden verdrahten (sonst trägt jede neue Welle die Last weiter), dann die
> Browser-Sign-offs (das Schöpfer-Auge entscheidet), dann der Render-Schluss,
> dann Crafting/Lebendig, dann der GROSSE Bogen U6 + Sozial + M9 + Gemerkte
> Fäden.

## §0 — DIAGNOSE 14.06.2026 (read-as-stranger)

**17 Wellen V18.193-V18.209 gebaut. Davon:**

- **VOLL VERDRAHTET im Spiel (12):** V18.193 ERBGUT · V18.194 Γ6-Bänder · V18.195 Spieler HP/Stamina · V18.196 Mana-Stat+Regen · V18.197 STRATA · V18.198 stamm_gefallen Sub-Spawn · V18.199 LICHEN Mix-Stack · V18.200 IRON-BANDS · V18.203/.204 Γ3 worldFieldAt · V18.206 Spieler-Speed · V18.208 Kreatur-Größe
- **PASSAGIER (gebaut, KEIN Spiel-Konsument, GEMESSEN via grep-c):** V18.201 `_drainMana`/`_canPayMana` (2 Hits) · V18.202 `_scentAt`/`_worldWindDirAt` (3 Hits) · V18.205 `_growTreeBlueprint` (1 Hit) · V18.207 R5 microBoost=1.0 (no-op)
- **KONSOLIDIERUNG:** V18.209 — die KONS-Welle selbst (CLAUDE.md+package.json+rueckmeldung.md+F4 synchronisiert)

**Lehre:** 4/17 = 24 % Passagier-Quote. Foundation-Markierung ist EHRLICH, aber sie ist HALBER Wert bis ein Konsument zieht. Plus: 53 Plan-Files in `docs/` — Landschaft statt Plan. Plus: `aktiv.md` wuchs zur Halde. **Heilung: dieses File. EIN Plan, alte → Archiv.**

---

## §1 — PRIO 1: VERDRAHTUNGS-WELLE V18.210 (die vier Foundations konkret machen)

**Eine Welle, vier Sub-Akte. Jede mit Test-Wand. Synergie: alle vier folgen demselben Disziplin-Pattern (R2-strukturell, Anti-Scope §3 — KEIN neuer DSL-Op).**

### A1 — V18.205 `_growTreeBlueprint` → Worldgen-Hook

- **Wo:** `_vegetationSampleSpawn` (Z49936-49977) — wo die fixen Varianten gewählt werden
- **Wie:** gen≥4-Gate (opt-in, alte Welten bit-identisch); bei gen 4 wird `_growTreeBlueprint(speciesKey, seedForSpawn)` aufgerufen statt fester Variante; der erzeugte Bauplan wird als `state.blueprints["grown_<speciesKey>_<hash>"]` registriert + zurückverwendet (Cache-by-Hash, sonst Memory-Bombe)
- **V17.16-Schutz:** Tags neu-berechnen vor Cache-Reuse; wenn neuer Hash → neue Affinitäts-Wand prüfen (alle 4 Achsen ≤ baum_eiche)
- **Test:** Source-Probe (gen=4 ruft `_growTreeBlueprint`); Cache-Probe (zweite Anfrage zum selben Hash gibt selbes Object); Tag-Wand (≤ baum_eiche)
- **Abschluss-Kriterium:** gen=4-Welt zeigt ≥6 unterschiedliche prozedurale Baum-Hashes (gemessen via `state.blueprints`-Count); gen=1/2/3-Welt bit-identisch zu Pre-V18.210

### A2 — V18.207 R5 microBoost → Live-Slider + Default 1.3

- **Wo:** `AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost` (Konstante, heute 1.0) + `_applySubstanceResponse`-Hook
- **Wie:** Default-Wert von 1.0 → 1.3 (Erst-Wurf-sichtbar); zusätzlich `state.atmoUniforms.r5StructureBoost` als Live-Uniform (analog `microStrength`-Uniform); Einstellungen-Slider (Render-Feinschliff-Sektion) browser-justierbar
- **Test:** Konstante existiert (Default 1.3); Uniform existiert; Source-Probe `_applySubstanceResponse` liest Uniform; Default-Wert sichtbar
- **Abschluss-Kriterium:** Schöpfer-Browser-Sign-off — Strukturen wirken weniger "platt" als vorher

### A3 — V18.202 `_scentAt` → Kreatur-KI-Reader (Raubtier riecht Beute)

- **Wo:** `_creatureNextAction` (oder ähnlicher KI-Tick-Pfad — erst grep für den richtigen Hook)
- **Wie:** Kreatur mit `temperament:"raubtier"` (V18.107-Temperament) liest `_scentAt(pos, sources)` mit Beute-Kreaturen als Source-Array; wenn Geruch > Schwelle UND in Richtung möglich → Bewegung Richtung höchstem Geruch-Gradient
- **Geruchs-Quellen:** alle Kreaturen mit `temperament:"flüchtig"` ODER `"scheu"` emittieren Geruch (strength = sizeFactor, V18.208)
- **Anti-Scope:** KEIN DSL-Op `set_scent_source` (Geruch emergiert aus Kreatur-Form, kein Skript-Override)
- **Test:** Raubtier-Soul mit Beute in 50 m → bewegt sich in Beute-Richtung; ohne Beute → ambient-Bewegung
- **Abschluss-Kriterium:** Behavioral-Probe headless beweist Jagd-Tendenz

### A4 — V18.201 `_drainMana` → ein konkreter Konsument

- **Konzept (Schöpfer-Entscheid):** WAS soll Mana kosten? Optionen:
  - **Option α:** Boost-Manifestation — Spieler kann einen Boost manuell aktivieren (`manifestBoost(boostId)`), kostet MANA_COST_MANIFEST=20, verdoppelt Dauer
  - **Option β:** Soul-Wechsel — `applyPlayerSoul` zieht MANA_COST_SOUL=30 (heikel: Restore/Boot brechen → Mode-Gate auf pfad+schöpfer)
  - **Option γ:** Magie-Akte im Werkstatt — `applyOpToPart` mit `op:"resonanz"` kostet 15 Mana statt Stamina (Magie statt Mühe)
- **Mein Vorschlag: Option γ** (kleinster Eingriff, klarer Magie-Charakter, NICHT-broadcast-DSL respektiert)
- **Test:** im pfad-Modus zieht der Resonanz-Akt 15 Mana; bei Mana < 15 → Akt verweigert; schöpfer-Modus frei
- **Abschluss-Kriterium:** der Mana-Wert im HUD (folgt aus A2-B2 unten) sinkt sichtbar beim Resonanz-Akt

---

## §2 — PRIO 2: BROWSER-SIGN-OFFS — das Schöpfer-Auge (V18.211, eine Mess-Session)

**Was offen ist (alle pixel-blind headless):**

- **B1.** V18.199 LICHEN — wirkt grüne Patina an feuchten Stein-Klippen?
- **B2.** V18.200 IRON-BANDS — sieht der Spieler beim Tiefgraben Eisen-Adern?
- **B3.** V18.203+V18.204 Γ3 — fühlt sich Welt-Charakter anders an als gen<3?
- **B4.** V18.179+V18.181 Baum-Varianten — sind 6-12 Arten sichtbar im Wald?
- **B5.** V18.198 Totholz — sieht der Spieler stamm_gefallen in der Nähe der Bäume?
- **B6.** V18.207 R5 microBoost=1.3 (nach A2) — sind Strukturen weniger platt?
- **B7.** Alle alten Sign-offs aus aktiv.md §4.C: J4 (Atmosphäre) · E1-E3 (Worker-Mesh, V17.118) · R1 (Schatten-Snap) · U4 (Deko-Distanz V18.131) · U5 (CSM V18.130)

**Mein Job (V18.211):** Diag-Werkzeug härten + 8-Shot-Galerie erzeugen (Lichen-Klippe, Iron-Schnitt, Γ3-Vista, Wald-Vielfalt, Totholz-Nähe, R5-vorher/nachher) — der Schöpfer sieht 8 Bilder + bestätigt grün/rot/justieren.

**Sub-Schritte V18.211:**
1. `diag-sichtbar.cjs` erweitern: Klein-Veg-Probe fixen (korrekte scatter-Feld-Suche); Player auf einen Wald-Spot teleportieren (höhere Architektur-Dichte); 60s Warmup statt 30s
2. `scripts/diag-fischer-wand.cjs` erweitern um Lichen-Klippe + Iron-Schnitt-Shot
3. 8 PNG-Shots in `artifacts/abschluss-galerie/` ablegen
4. ein zusammenfassender Report mit pro-Shot-Mess-Zahl (lichen-avg, iron-count, baum-arten-count)
- **Abschluss-Kriterium:** Schöpfer signed 8/8 off ODER justiert Konstanten (Lichen-strength, IRON_BANDS.threshold etc.)

---

## §3 — PRIO 3: RENDER-SCHLUSS (V18.212-V18.214, drei kleine Wellen)

### R2 Normale-backen (V18.212)
- **Plan:** die geflattete Lichtungs-Normale (V17.107 `normalNode`) in die TERRAIN-GEOMETRIE backen → AO (`fwidth(normalWorld)`) + Schatten-`normalBias` + Hemisphere lesen dieselbe Wahrheit (V17.108 Kavität-AO-Falle strukturell tot)
- **Wo:** `_voxelChunkGeometry` (Normalen-Compute) + Worker-Mirror
- **Determinismus:** Worker bit-identisch; ein neuer Test `gen3NormalsConsistent` prüft Main↔Worker
- **Abschluss:** Schatten-Swimming weg + AO-Facetten-Muster weg

### R3 Kanten-Schärfe (V18.213)
- **Plan:** ein neuer `EDGE_SHARPNESS`-Boost im Cel-Stack (vergrößert Cel-Schritt an Geometrie-Kanten via `fwidth(normalLocal) > Schwelle`); Default-Wert browser-justierbar
- **Wo:** `_buildToonNodeMaterial` colorNode
- **Abschluss:** Cel-Stufen schärfer an Bauten/Felsen, weicher in Vegetation

### U2 Wasser-LOD (V18.214)
- **Plan:** ferne Wasser-Mesh wird in Skip-Schritten gebaut (LOD-Step×2 ab Distanz X); konsistente Höhe via 4-Eck-Average gegen LOD-Naht-Riss
- **Wo:** `_buildVoxelChunkWaterSurfaceMesh` (das Surface-Mesh wird seit V18.6 IMMER auf LOD0 gebaut — V18.22-Lehre); R5-Variante: Surface-Mesh BLEIBT LOD0 (kein T-junction-Riss), aber far-skip am Rand-Pixel
- **Abschluss:** ferne Wasser-FPS messbar besser (target +5 FPS bei voller Sicht ins offene Meer)

---

## §4 — PRIO 4: CRAFTING-SCHLUSS (V18.215-V18.218, vier kleine Wellen)

### S7-C chat/DSL-Vereinheitlichung (V18.215)
- **Plan:** Spieler kann im Chat einen Crafting-Befehl tippen (z.B. „schmiede klinge aus eisen") und der Werkstatt-Fluss feuert äquivalent — EIN Pfad, kein paralleles Chat-Parsing
- **Wo:** `processChatCommand` ruft `dslRun` für craft-Programme; `dslRun` route zu `forgeMaterialAndFreeze`/`brewConsumable`/etc.
- **Abschluss:** "schmiede klinge aus eisen" im Chat ⇒ Klinge in der Hand

### S8 Teilen-Konsistenz (V18.216)
- **Plan:** Bauplan-Bündel-Export + Import via Taille-Spec (V18.137-141 Ω) — Manifest+Sig+Provenance; ein Empfänger importiert es bit-treu (Worker-Asymmetrie, Φ-Bogen-Lehre)
- **Test:** Round-Trip Export→Import → bit-identische Replik
- **Abschluss:** ein geteilter Bauplan ist auf einer anderen Welt nutzbar

### S11 Werkstatt-Animation (V18.217 — die Kirsche)
- **Plan:** Avatare/Fahrzeuge in der Werkstatt-Vorschau bewegen sich (deklarativ via Bauplan-Sub-Animation-Tag)
- **Wo:** `_workshopEnsurePreview` render-tick erweitert
- **Abschluss:** ein „avatar_waechter"-Bauplan in der Vorschau gestikuliert; ein Fahrzeug rollt

### LLM-Manifest (V18.218)
- **Plan:** Begleiter-Welt-Manifest deklariert die LLM-Spezialitäten (welche Modelle, welche Welt-Hilfe-Themen); im Chat-Kontext gelesen
- **Wo:** `state.worldMeta.llmManifest` + `_buildSystemPrompt`
- **Abschluss:** ein anderer LLM-Begleiter (Claude/Sonnet) zeigt anderes Verhalten als Grok

---

## §5 — PRIO 5: LEBENDIGES FELD (V18.219-V18.220)

### D1 Emotion→Regel-Emergenz (V18.219)
- **Plan:** hand-codierte Emotion→Welt-Kopplungen (z.B. joy → spawn-creature-Gewicht in `at_field_need`) wandern als Welt-Regeln in `state.worldRules` — der `_tickWorldRules` (V17.33) feuert sie emergent
- **Wo:** `_emotionToRulePrompt(emotion, threshold, effect)` als Migrations-Helper; 3 bestehende Kopplungen als initiale Welt-Regeln im Boot eingespielt
- **Determinismus:** Welt-Regeln sind schon reaktive Schicht (NICHT im Snapshot), worldRules-Cap (64) gewahrt
- **Abschluss:** Emotion-Kopplung emergiert als sichtbare Welt-Regel im UI

### D2 Nexus-Lern-Vereinheitlichung — Geste→Gesetz (V18.220)
- **Plan:** der Nexus lernt aus den Gesten (`dsl.history`) und kristallisiert eine bewährte Geste als stehende Welt-Regel (`worldRules`-Eintrag)
- **Wo:** ein `_nexusCrystallize`-Tick (10s Intervall), der die top-3 wiederkehrenden Gesten erkennt und vorschlägt
- **Abschluss:** eine 5-mal wiederholte Geste wird vom Nexus als Regel-Vorschlag im UI angeboten

---

## §6 — PRIO 6: GROSSER RENDER-BOGEN U6 Clipmap (V18.221, eigener Bogen)

- **Plan:** mehr-skaliges Chunk-Grid (Clipmap-Pattern); ferne Chunks aus gröberem Mesh; größter Draw-Call-Hebel
- **Sub-Schritte:** Foundation (LOD-Stufen-Definition) → Mesh-Pyramide (5 Stufen, Skip×2) → Cross-Stufen-Stitch → Worker-Pipeline
- **Aufwand:** groß, eigener Bogen — kann nach §1-§5 starten

---

## §7 — PRIO 7: SOZIAL-REST (V18.222-V18.224)

### F1 evolveCommunity — Kreatur-Kulturen (V18.222)
- Kreaturen entwickeln lokal eigene Sprache/Riten; via lebendes Feld (`auraAt`-emotion) gefüttert
- Aufwand: groß-mittel, eigener Bogen

### F2 Stern-ab-6 Topologie (V18.223)
- wenn Voll-Mesh nicht mehr trägt (>6 Peers), eine Stern-Topologie mit Mesh-Backbone
- Design in `gigant-plan §5-F2` schon gemessen

### F3 B-WASM (V18.224)
- Fremd-Engine in WASM-Sandbox (W17-Erweiterung)

---

## §8 — PRIO 8: M9-AUFSTIEGS-LEITER Sprossen 4-7 (Schöpfer-Dialog)

- **Sprosse 4-7**: jeweils Vision-getrieben — der Schöpfer entscheidet, welche Achse, welche Form
- Plan-Vorlage: `docs/archiv/meister-plan.md §3` + `§8.6` (archiviert)

---

## §9 — PRIO 9: GEMERKTE FÄDEN (Schöpfer-Weck-Moment)

| Faden | Weck-Moment | Wer triggert |
|---|---|---|
| **B1** Wasser-Sheet→Worker | fühlbarer Carve-Hitch | Schöpfer (Browser) |
| **echtes V18→V19-Zeit-Portal** | erstes Alt-Build-Artefakt geladen | Schöpfer |
| **VR/WebXR** | Schöpfer ruft | Schöpfer |
| **R-037 T-Welle** | dritter Bauer mit-tippt | Bauer-Aufnahme |
| **R-039 Devlog** | post-öffentlich | Schöpfer |
| **IndexedDB-extras** | Bedarf gemessen | gemessen |
| **Fahrzeug-Fahr-Tiefe** | Schöpfer ruft | Schöpfer |
| **Statusbar-Tiefe** | Schöpfer ruft | Schöpfer |

---

## §10 — DOC-KONSOLIDIERUNG (Folge dieses Plans)

**Was passiert mit den anderen Plan-Files NACH Abschluss dieses Plans:**

- **`docs/aktiv.md`:** wird RADIKAL geschlankt — nur Verweis auf diesen Plan + Live-Status der laufenden Welle. Die ~~strikethrough~~-Tabelle wandert ins handover-Archiv. **JETZT mit V18.210-Start (siehe unten §11).**
- **`docs/roadmap.md`:** ALLE §4-Backlog-Inhalte sind in diesem Plan. Roadmap wird auf §1-§3 (Vision, Stand, Plan) reduziert; §4 wird durch `[siehe abschluss-plan.md]` ersetzt. **JETZT mit V18.210.**
- **`docs/rueckmeldung.md`:** bleibt (Schöpfer-Audit-Korpus, nur als WARTE-PUNKT für S-Abnahmen, kein Plan).
- **`docs/archiv/handover.md`:** bleibt (volle Chronik, jüngste oben).
- **CLAUDE.md:** bleibt (auto-geladen); der "Aktueller Stand"-Block verweist auf diesen Plan.
- **`docs/wellen-synthese-plan.md`** + andere Schwester-Files: bleiben im Archiv-Folder ihrer Schicht.
- **`docs/das-lebendige-feld.md` + `docs/state-of-realm.md` + `docs/taille-spec.md/en.md`:** bleiben (Vision + NORMATIV).

**Maxime:** EIN Plan, EIN Tisch, alles andere ist Vergangenheit (Chronik) oder Vision (Norden). Keine zweite offene-Punkte-Liste.

---

## §11 — DIE REIHENFOLGE (durchziehen, keine Pausen)

```
V18.210  Verdrahtungs-Welle (4 Sub-Akte: Γ7 Worldgen · R5 Slider · _scentAt KI · Mana-Konsum)
V18.211  Browser-Sign-off-Galerie (diag-Härtung + 8 Shots + Schöpfer-Auge)
V18.212  R2 Normale-backen
V18.213  R3 Kanten-Schärfe
V18.214  U2 Wasser-LOD
V18.215  S7-C chat/DSL-Vereinheitlichung
V18.216  S8 Teilen-Konsistenz
V18.217  S11 Werkstatt-Animation
V18.218  LLM-Manifest
V18.219  Emotion→Regel-Emergenz
V18.220  Nexus-Lern Geste→Gesetz
V18.221  U6 Clipmap (eigener Bogen)
V18.222  evolveCommunity
V18.223  Stern-ab-6
V18.224  B-WASM
V18.225+ M9-Sprossen 4-7 (Schöpfer-Dialog)
V18.230+ Gemerkte Fäden (je Schöpfer-Weck-Moment)
```

**Synergie über den vollen Bogen:** §1 räumt die Foundation-Schuld weg (kein neuer Code wird auf Wackel-Foundation gebaut); §2 ist der Schöpfer-Filter (was visuell stimmt, was nicht); §3-§4 schließen die Render+Crafting-Resten ehrlich; §5 hebt das lebendige Feld in die Welt-Regel-Sprache (Emergenz statt Hardcode); §6 ist der einzige große Render-Hebel (Clipmap); §7 trägt die soziale Schicht; §8/§9 sind Schöpfer-getrieben.

**Abschluss-Garantie:** wenn V18.210-V18.220 durchgezogen sind, ist die Welt:
- 0 Passagier-Helper (jeder Helper hat einen Konsument)
- 0 Doc-Drift (eine Wahrheits-Quelle: dieses File)
- 4 Renderschulden bezahlt (R2, R3, U2, R5-Slider)
- 4 Crafting-Reste geschlossen
- Lebendiges Feld emergiert via Welt-Regeln (statt Hardcode)
- 12 sichtbare Welt-Schliffe (Lichen, Iron, Γ3, R5, Baum-Vielfalt, Totholz, etc.)

**Danach (V18.221+) sind nur noch GROSSE BÖGEN offen** (Clipmap, Sozial-3, M9, Gemerkte Fäden). Jeder davon ist eine eigene Saga, kein Sammel-Punkt mehr.

---

## §12 — DISZIPLIN (für diesen Plan-Lauf)

1. **Eine Welle = eine PR/Commit + Update HIER**: der jeweilige Block wird `~~strikethrough~~` + `[gebaut V18.X, commit-hash]` markiert. Wenn alle Blöcke einer Prio strikethrough sind, wird die Prio-Sektion in den Archiv-Schluss-Block verschoben.
2. **Verdrahtungs-Wand:** keine V18.211 startet, bevor V18.210 grün ist. Keine V18.212 startet, bevor V18.211-Sign-off da ist (oder explizit deferred mit Vermerk).
3. **Read-as-stranger PRO WELLE:** vor dem Commit lese ich den Welle-Plan-Block + frage: ist KONSUM verdrahtet (V17.31)? Wenn nein → Welle ist NICHT fertig.
4. **Kein neuer Foundation-Code:** jede neue Funktion braucht einen konkreten Konsumenten im selben Commit. Foundation-only ist verboten in diesem Plan.
5. **Doc-Hygiene:** kein neuer Plan-File. Updates nur HIER + handover.md + CLAUDE.md.

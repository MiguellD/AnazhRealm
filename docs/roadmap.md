# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der aktive Tisch.** Dieses Doc beantwortet beim nächsten Schritt **vier Fragen**, nicht eine:
> **Wohin?** (§2–3) · **Wurde das schon probiert?** (§4 Narben) · **Existiert das schon?** (§5
> Teilsysteme) · **Schneide ich einen Samen?** (§6 Samen). Das Detail lebt in der Bibliothek
> (`docs/archiv/handover.md` Chronik · `docs/archiv/roadmap-chronik-bis-v18.83.md` der alte Backlog ·
> `docs/archiv/README.md` der Bogen-Index). Ein Bogen erwacht → sein Plan kommt auf den Tisch.
>
> **Stand: V18.83 (`main`), 09.06.2026.**

---

## §1 · Regel #0 — die eine Wahrheit (über allem)

**Render · Wasser · Schatten · Hand-Optik sind PIXEL-BLIND headless.** Der Schöpfer-Browser ist die
einzige Wahrheit. Nie 2+ pixel-blinde Wellen tief ohne sein Auge dazwischen; ein bestätigter Bogen
wird gemergt, bevor der nächste beginnt.

## §2 · Wo wir stehen

Das **Fundament steht**: Voxel-Terrain mit echten Höhlen · Stream-Power-Erosion · das Wasser-
*Datenmodell* (3D-Zellen, Physik, Reaktivität, globaler Ozean) · das Rückgrat der LOD-Kaskade (U1+U3) ·
das lebendige Feld (lesen·schreiben·werten) + Emotion-Kern · die Crafting-Resonanz · der UI-Putz-Bogen.
Was fehlt: **eine** große Sache — die Wasser-*Dynamik* — plus die Fundament-Reste, die LOD-Vollendung,
der soziale Bogen und die offenen Render-Sign-offs.

---

## §3 · Der Plan vorwärts — die Reihenfolge

**⭐ Die tiefere Wurzel (Schöpfer-Befund 09.06.2026, gemessen):** Phase 1+2 teilen EINE Wurzel — die
**Chunk-Naht** (independent gebaute Chunks, deren Ränder nur approximativ + verspätet zusammenfinden).
Blobiges Terrain · Edit-/LOD-Naht · die Wasser-Naht (30 Wellen) · „Wasser fließt nicht" sind **fünf
Symptome davon**. Der vereinte Architektur-Bogen, der sie an der Wurzel heilt, ist
**`docs/terrain-koharenz-plan.md`** (DIE EINE GRENZE — IPERKA, alle Schnittstellen, die These geprüft;
von den Größten: Dual Contouring · Stable-LOD/Geomorph · Wasser-CA). Die physikalische Kette:
**`Naht-Kohärenz (T1–T2) → {kantiges Terrain T3 · Wasser-CA T4} → G3-Canyons T5`** — niemals Wasser vor
der Naht (das war die Spirale).

**Phase 1 — Wasser: echte Fluid-Dynamik ⭐** Die Wurzel: Wasser ist ein statisches Höhenfeld `L`,
fließt nie nach (kein Automat). Ziel: ein zellbasierter Automat (Level 0–7) über `entry.waterCells` —
Wasser fließt nach wie Minecraft, der Render speist sich aus den Fluid-Zellen (heilt auch das Mesh-
Falten). Eigener Plan zuerst (Tick-Budget · Determinismus · frozen↔live · Persistenz). Detail:
`archiv/wasser-render-architektur-plan.md` + `archiv/hydrosphere.md`.

**Phase 2 — das Fundament sauber schließen** H3 (ferne Binnengewässer) → G3 (Höhleneingänge +
Canyons, braucht H3) → LOD vollenden (U2/U4/U5/U6 + E4-Stitching) → Render-Sign-offs (R1/R2/R3/R5).
Detail: `archiv/lod-kaskade-plan.md`.

**Phase 3 — die Seele** Crafting-Schluss (S6-B/S9/S11/S7-C) · **Phase E** (Bedrohung/Furcht — der
letzte Emotion-Kern-Konsument) · Mana-Symmetrie · Emotion→Regel-Emergenz · **Nexus-Lern-Vereinheit-
lichung** (Geste→Gesetz). Detail: `archiv/kampf-plan.md` · `docs/das-lebendige-feld.md`.

**Quer dazu (eigene Bögen):** der **soziale Mesh-Bogen** (Bewerten-Aggregation → Lesezeichen → Folgen
→ Kommentare/Chat) · **W18** (in fremden Welten leben, `archiv/world-portal-w18-plan.md`).

---

## §4 · Die offenen Fäden — die VOLLSTÄNDIGE Karte (nichts vergessen)

**Wasser** — Fluid-Dynamik (Phase 1, ⭐) · gefaltetes Auslauf-Mesh · Fluss-Naht (4-Chunk-Ecken) ·
`aFlow`-Foam-Strähnen · Wasserfall-Plane (bleibt/raus?) · aufgestaute Hoch-Becken (über `L`, brauchen
Zellen) · Unterwasser-Decken-Pass (V18.3 B5) · Kapillar/Stempel an Gebäuden.

**Terrain/Fundament** — H3 ferne Seen/Flüsse (Region mitwandern) · G3 Höhleneingänge + Canyons (braucht
H3) · E4 echtes Cross-LOD-Stitching/Geomorph · Haupt-Fog an die Ring-Kante koppeln (heute separat).

**LOD/Render** — U2 Wasser-LOD (heute fest LOD0) · U4 Deko-Distanz/Dichte/Impostor · U5 Schatten-CSM ·
U6 Clipmap (Draw-Call-Hebel) · R1 Schatten-Snap (gebaut, Sign-off offen) · R2 Normale in Geometrie
backen · R3 Kanten-Schärfe · R5 Struktur-Textur · E3 Worker-Mesh (gebaut V17.118, Sign-off offen) ·
Kreatur-FPS-Frame-Budget (falls Boden-Cache nicht reicht) · Browser-Sign-offs (J4 · E1–E3).

**Crafting/Kampf** — S6-B erntbare Flora · S9 Gerät in der Hand (gebaut, Sign-off offen) · S11
Werkstatt-Animation (die Kirsche) · S7-C chat/DSL-Vereinheitlichung · S8 Teilen-Konsistenz · A2
Crafting-Fluss-Audit · Avatar-Größe→HP · Zwei-Hand-Modell · Rüstung am Avatar sichtbar · LLM-Manifest.

**Lebendiges Feld/Nexus** — Phase E Bedrohung/Furcht (der letzte Konsument) · Mana-Symmetrie
(`magieleitung` → zweite Ausdauer-Achse) · Emotion→Regel-Emergenz (hand-codierte Kopplungen via DSL
emergent) · Nexus-Lern-Vereinheitlichung (Geste→Gesetz: EIN Lern-Substrat, bewährte Geste kristallisiert
zur Regel).

**Sozial/Multi-User** — Bewertungs-Aggregation (Mesh, ed25519-signiert) · Lesezeichen (lokal-first) ·
Folgen (Vibe-Pass-Identität) · Kommentare + Chat (Persistenz + P2P + Moderation) · B-WASM (Fremd-Engine-
Rest) · evolveCommunity (Kreatur-Kulturen).

**UI** — Statusbar schlanken (auf Essenz) · der Schöpfer-Browser-Sign-off des GPU-Galerie-Feels.

**Fern (Schöpfer-Entscheid)** — Fahrzeug-Fahr-Tiefe (Sitz/Steuerung/Trägheit) · VR (`vrMenu.js` da,
nicht im Gate) · IndexedDB-Persistenz (statt localStorage).

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
- Boundary-Face-Wasser-Mesh statt Surface-Nets (V13.2) → V13.6 FALSCH, flach/gappy (Wasser teilt den
  Iso-Mesher des Bodens — das ist die Synergie).
- 3D-GPU-Fluid-Sim → als „falsches Werkzeug" markiert (Heilige-Lektion-Sünde; der gewählte Weg ist ein
  *zellulärer Automat*, nicht eine GPU-Sim).

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
  der Nexus (ZWEI Lern-Pools: Gesten `dsl.history` + Gesetze `worldRules` — feeden nicht cross,
  das ist die offene Vereinheitlichung) · DSL/Weltregeln (`dslRun`-Sandbox · `_tickWorldRules`).
- **Schöpfung:** Crafting-Resonanz (`_blueprintProductVector` → Rolle/Domäne/Op/Stat) · Werkstatt
  (Mach-Akte über `_makeCostGate` + `fertigeBlueprint`) · Hylomorphismus (`FORM_TAG_ACTIVATION`).
- **Render:** Toon/Cel (`_buildToonNodeMaterial`) · Aerial-Atmosphäre (`_applyAerialOutput`, eye-relativ) ·
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

- `_fieldWohlErlebt` · `_fieldWohlBaselineAt` · `_observeFieldWohl` — die WERTEN-Infrastruktur (das
  dritte Verb); ein künftiger Konsument (Phase E) konsumiert sie. Gemessen kein Runaway.
- `_archInstanceUpdate` + Instancing-Gating (`instanceable`/`breaksInstancing`) — für künftige
  bewegliche Instanzen + das Schloss gegen GPU-Memory-Bomben.
- `_drainPools` — Leak-Schutz für künftige Wellen (unverdrahtet, weil Reload aufräumt).
- `_waterCellAt`-Inline (in `_playerWaterContext`) — bewusste Verdichtung, nie standalone.
- Chat-DSL-Skeleton (Nexus-Parser) — ruhender Vision-Faden, Phase E / S7-C konsumiert ihn.
- Die frozen Resonanz-Signaturen (`FORM_TAG_ACTIVATION` · `FORM_ROLE_SIGNATURES` · `computeBlueprintRole`)
  — emergent-korrekt, KEIN Ad-hoc-Tuning; die Struktur, auf der Rezeptbuch/Equip/Avatar bauen.

---

## §8 · Was gebaut ist (stichwortmäßig — Detail in der Chronik)

- **Voxel-Terrain** (V9.07–.19) · **Hydrosphäre** (V9.43–.49) · **Multi-User + Fremd-Engine** (W12–17)
- **Render/Tiefe** (V12–17) — r184+WebGPU · Toon/Cel · ACES · Mikro-Textur · Gras-Riese · Ghibli-Bäume
- **Das lebendige Feld** (V17.21–.50) — lesen·schreiben·werten + Emotion-Kern · **DSL-Weltregeln** (V17.33–.40)
- **Crafting/Resonanz** (V17.59–.85) — ein Produkt-Vektor, viele Leser
- **Tiefe-Fundament** (V17.92–.118) — Ruckel·Schwimm·Trapeze·effiziente Höhe·Kavernen·Aquifer·Render-Harmonie·H3-Ozean·Worker
- **Wasser-Render** (V18.0–.31) — die Fläche-auf-`L` (das *statische* Modell; die Dynamik ist Phase 1)
- **UI-Putz-Bogen** (V18.32–.83) — 8 Tabs → 6 Räume · Omnibox · der freie Bildschirm

## §9 · Die operative Disziplin

1. **Regel #0** — pixel-blinde Arbeit browser-validiert, bevor die nächste Welle stapelt.
2. **Miss, rate nicht** — die 73 diag-Skripte; der Reproducer mit Output-Lesen *vor* dem Fix.
3. **Verdichte, baue nie parallel** (V17.9, §6) · **Harmonie statt Revert** (V17.23) · **verifiziere
   KONSUM, nicht Existenz** (V17.31).
4. **Keine halben Schritte** (V17.30) — Plan klar + Gap benannt → das ganze Subsystem an die Wurzel.
5. **Eine verworfene Architektur nicht wieder anfassen** (§4) — ein Revert ist ein Signal, dass die
   Wurzel woanders liegt.
6. **Merge-Rhythmus** — ein validierter Bogen = ein Merge. **Der Tisch bleibt schlank** (ein fertiger
   Plan wandert sofort in die Bibliothek).

## §10 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (`V18.84` = die nächste). Pro Welle: ein Commit +
ein Chronik-Eintrag oben in `docs/archiv/handover.md`. Eine dauerhafte Lehre → eine Zeile in
`CLAUDE.md / Wichtige Gotchas`.

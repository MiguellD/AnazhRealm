# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der aktive Tisch.** Dieses Doc beantwortet beim nächsten Schritt **vier Fragen**, nicht eine:
> **Wohin?** (§2–3) · **Wurde das schon probiert?** (§4 Narben) · **Existiert das schon?** (§5
> Teilsysteme) · **Schneide ich einen Samen?** (§6 Samen). Das Detail lebt in der Bibliothek
> (`docs/archiv/handover.md` Chronik · `docs/archiv/roadmap-chronik-bis-v18.83.md` der alte Backlog ·
> `docs/archiv/README.md` der Bogen-Index). Ein Bogen erwacht → sein Plan kommt auf den Tisch.
>
> **Stand: `main` @ V18.172 (Merge `claude/bold-bardeen-ky7gmx`, 12.06.2026) — der aktive Marsch lebt in `docs/archiv/meister-plan.md` §8.8.**

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
V18.134/.135). Was fehlt: die S-Browser-Sign-offs (gigant-plan §6.3) · F4-Rest (Folgen/
Kommentare) · F2-Stern · W18 · Phase E · die Taille Ω0–Ω6.

---

## §3 · Der Plan vorwärts — die Reihenfolge

> **Der Master-Blick über allem: `docs/archiv/gigant-plan.md`** (10.06.2026 — das umfassende gemessene
> Bild: die NEUN Säulen G1 Motion-Resonanz · G2 Rekursion · G3 sich-speisendes P2P-Netz ·
> G4 Kreatur-Innenleben · G5 δ-als-Währung · G6 Licht+Terrain · G7 Maßstab · G8 Robustheit (✓ rund) ·
> G9/Ω die gefrorene Taille (✓ rund V18.137–.141; `docs/taille-spec.md` NORMATIV, Historie
> `docs/archiv/taille-plan.md`) + die Zwillings-Karte + die Reihenfolge §5 + **DIE GEMERKTEN
> FÄDEN** (§5-Ende — Schöpfer 11.06.: „alle wichtig, nie vergessen")).
> Dieser §3 bleibt die operative Kurz-Form; der Gigant-Plan trägt das Warum + die Anker.

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

**Phase 3 — die Seele** Crafting-Schluss (~~S6-B~~ ✓ V18.133 · S9-Sign-off · S11 · ~~S7-C~~ ✓ V18.127) · **Phase E** (Bedrohung/Furcht — der
letzte Emotion-Kern-Konsument) · Mana-Symmetrie · Emotion→Regel-Emergenz · **Nexus-Lern-Vereinheit-
lichung** (Geste→Gesetz). Detail: `archiv/kampf-plan.md` · `docs/das-lebendige-feld.md`.

**Quer dazu (eigene Bögen):** ~~der **soziale Mesh-Bogen**~~ **✓ RUND V18.134–.147** (Bewerten ·
Lesezeichen · Folgen · Kommentare · „Für dich"; Kür-Vermerk nur die Portal-Ring-Vorschau) ·
~~**W18** (in fremden Welten leben)~~ **✓ RUND V18.144–.146** (`archiv/world-portal-w18-plan.md`;
benannt-fern nur der Übersetzer-Avatar-Hook) · ~~Ω die gefrorene Taille~~
**✓ RUND V18.137–.141** (`docs/taille-spec.md` NORMATIV · `docs/archiv/taille-plan.md` Historie ·
`spec/golden/v1/` EINGEFROREN).

---

## §4 · Die offenen Fäden — die VOLLSTÄNDIGE Karte (nichts vergessen)

**Wasser** — Fluid-Dynamik (Phase 1, ⭐) · gefaltetes Auslauf-Mesh · Fluss-Naht (4-Chunk-Ecken) ·
`aFlow`-Foam-Strähnen · ~~Wasserfall-Plane (bleibt/raus?)~~ **ENTSCHIEDEN+GEBAUT (V18.111–.114):
die Plane FIEL (S-Entscheid), der STEIL-SPLIT formt vertikales Wasser im Zell-Sheet (Lippe +
Vorhang, aSlope-Wildwasser; Tour-gehärtet: Split nur nass↔nass, Strähnen-Schaum) — das
Abwärts-Material bleibt als Saat** · ~~aufgestaute Hoch-Becken (über `L`)~~
**GEBAUT (V18.129 — der STAU-SPIEGEL):** ein Spieler-Damm staut über rim
(bounded Spill-Scan + Stau-Tropf; Pfeiler stauen strukturell nicht; GEMESSEN
`diag-stau.cjs` — Pool +2.68 m EBEN, settled; Kron-ÜBERLAUF als Wasserfall =
offene Kür) · Unterwasser-Decken-Pass (V18.3 B5) · Kapillar/Stempel an Gebäuden.

**Terrain/Naht (PHASE A VOLLENDET bis auf S-Wellen, §11 + gigant-plan §5)** — ~~N1 Cross-LOD watertight~~
**GEBAUT (V18.103):** Morph-Cap + Stitch-Band (`_rebuildLodStitchBand` — der Arme-Leute-Transvoxel;
GEMESSEN 0 sichtbare >1-m-Spalten ungedeckt; Transvoxel bleibt bewusst ungeweckt) · ~~N2 Sub-Region-Edit~~
**GEMESSEN AUFGELÖST (V18.103):** der Rebuild ist geometrisch unsichtbar (Vertex-Delta 0/3180 lokal;
Splice = reine Perf ≤10 ms, bewusst deferred [V13.9-Backlog]) · ~~N3~~ GEBAUT (V18.86) ·
~~SPAWN-RESTBEFUND~~ **GEHEILT (V18.95):** die Wurzel war Hypothese b —
der leere createNewWorld-Snapshot trug `playerPosition (0,50,0)` → der Reload-Restore setzte
`terrainEverGenerated=true` → der Erst-Spawn lief im Browser nie; Fix: `playerPosition:null` =
„vor Erst-Spawn", Restore lässt das Flag false (Browser-Pfad-Sonde `diag-genesis-spawn.cjs`
rot→grün) · ~~Haupt-Fog an die Ring-Kante koppeln~~ **GEBAUT (V18.103 A5):** fog.far ≤
(ringRadius+0.5)·span · **A6 Körper-Kollision GEBAUT (V18.103):** Begraben-Rettung + Sprung-Klemme +
Ego-Auge-Clip. ~~H3 ferne Seen/Flüsse~~ **GEBAUT (V18.132: seed-deterministische
KACHELN statt „Region mitwandern" — f(seed, Koordinate) bricht den Determinismus NICHT; Worker
gespiegelt, Heimat bit-identisch, GEMESSEN Worker==Main 0/32144).**

**LOD/Render** — U2 Wasser-LOD (heute fest LOD0) · ~~U4 Deko-Distanz/Dichte/Impostor~~ **GEBAUT (V18.131: Band-getrieben + das EINE Fernfeld-Impostor-Mesh pro Art; Look-Sign-off offen)** · ~~U5 Schatten-CSM~~ **GEBAUT (V18.130: r184-CSMShadowNode an den DETAIL_CASCADE-Band-Kanten, Snap pro Kaskade eingebaut; Look/FPS-Sign-off offen)** ·
U6 Clipmap (Draw-Call-Hebel) · R1 Schatten-Snap (gebaut, Sign-off offen) · R2 Normale in Geometrie
backen · R3 Kanten-Schärfe · R5 Struktur-Textur · E3 Worker-Mesh (gebaut V17.118, Sign-off offen) ·
Kreatur-FPS-Frame-Budget (falls Boden-Cache nicht reicht) · Browser-Sign-offs (J4 · E1–E3).

**Crafting/Kampf** — ~~S6-B erntbare Flora~~ **GEBAUT (V18.133: Scatter pflückbar, kraut/essenz, Trank zieht gepflückte Zutaten)** · S9 Gerät in der Hand (gebaut, Sign-off offen) · S11
Werkstatt-Animation (die Kirsche) · S7-C chat/DSL-Vereinheitlichung · S8 Teilen-Konsistenz · A2
Crafting-Fluss-Audit · Avatar-Größe→HP · ~~Zwei-Hand-Modell~~ **GEBAUT (V18.109: Off-Hand-Slot +
Key G + linker Arm)** · ~~Rüstung am Avatar sichtbar~~ **GEBAUT (V18.104 + V18.110: sitzt am
TORSO via C7-Trage-Punkt)** · LLM-Manifest.

**Lebendiges Feld/Nexus** — ~~Phase E Bedrohung/Furcht~~ **✓ V18.148 (Raubtier-Seele · Jagd ·
Furcht/Triumph/Schuld — der Emotion-Kern ist RUND; Vermerk: ambiente Glut-Region-Geburt = eigene
Mess-Welle)** · Mana-Symmetrie
(`magieleitung` → zweite Ausdauer-Achse) · Emotion→Regel-Emergenz (hand-codierte Kopplungen via DSL
emergent) · Nexus-Lern-Vereinheitlichung (Geste→Gesetz: EIN Lern-Substrat, bewährte Geste kristallisiert
zur Regel).

**Sozial/Multi-User** — ~~Bewertungs-Aggregation~~ ✓ V18.134 · ~~Lesezeichen~~ ✓ V18.135 ·
~~Folgen~~ ✓ V18.142 · ~~Kommentare~~ ✓ V18.143 (signierte Worte übers Mesh; Chat/Moderation =
spätere Kür) · ~~„Für dich"~~ ✓ V18.147 (die LESBARE Summe der eigenen Signale — F4 ist RUND;
Kür-Vermerk nur die Portal-Ring-Welt-Vorschau) · ~~W18 in fremden Welten LEBEN~~ ✓ V18.144–.146
(Ko-Präsenz-Injektion + Tier-Wahrheit · Input-Brücke · Wohnen/Boot-Rückkehr/„wohnt in"/
Persistenz-Slot; `npm run smoke:copresence`; benannt-fern nur der Übersetzer-Avatar-Hook) ·
B-WASM (Fremd-Engine-Rest) · evolveCommunity (Kreatur-Kulturen) · Stern-ab-6-Topologie
(gigant-plan §5-F2, Design gemessen).

**UI** — ~~Statusbar schlanken~~ **✓ V18.149 (Essenz + ···-Toggle für die Werkstatt-Zahlen)**.

**GENESE (der Γ-Bogen, `docs/archiv/genese-plan.md`)** — ~~Feuchte-Feld + Kronen-Lesarten + Stream-Gesetz~~
✓ V18.166 (Γ0/Γ5/Γ2/Γ1-Kern; diag-genese + 9 Invarianten) · Γ1-FARB-Lesart (Terrain satter/dunkler
bei feuchte — der bit-identische Worker-Spiegel-Schnitt) · Γ6-Beförderung (snowband/chunk-seam/
false-swim/arch-water-solid → stehende Bänder) · **Γ4 MAKRO-ANKER** (der große Wurf: designte
Geographie gejittert, Abfluss-Invariante ab Tag 1, `worldMeta.macro` als Erbgut) · Γ3 Feld-Charakter
(optional) · Γ7 Baum-Grammatik (video-getrieben zuletzt) · Totholz/Ψ2-Nase (Vermerke).

**DIE GEMERKTEN FÄDEN (Schöpfer 11.06.2026: „alle wichtig — vergesse die bitte nicht"; die
verbindliche Voll-Liste mit Weck-Momenten lebt in `archiv/gigant-plan.md` §5-Ende; FORTSCHREIBUNG: `docs/archiv/meister-plan.md` §5):** ~~R6 Selbst-
Erweiterung~~ ✓ KERN V18.152 (Rest des Bogens benannt) · ~~Phase E Bedrohung/Furcht~~ ✓ V18.148 ·
B1 Wasser-Sheet→Worker (weckt der fühlbare Carve-Hitch) · das ECHTE V18→V19-Zeit-Portal (weckt
das erste Alt-Build-Artefakt) · VR (startet bei null, WebXR) · ~~IndexedDB-Persistenz~~ ✓ V18.151 ·
~~Fahrzeug-Fahr-Tiefe~~ ✓ V18.150 (Profil emergent · Sattel-Kurven · Ausrichtung · EINS-Regel) ·
~~Statusbar schlanken~~ ✓ V18.149.

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
- **Render:** Toon/Cel (`_buildToonNodeMaterial`) · das FREQUENZBAND (`_applySubstanceResponse` — EIN Band-Empfänger, Antennen-Profile aus der Substanz; eye-relative Aerial) ·
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
- **Die Code-Sweep-Samen (10.06., gigant-plan §5-D5/F4):** das Wetter-ambient-Array
  (`snow/embers/motes` :27292 — deklariert, nie geschaltet → D5a Wetter-Polyvalenz) · die
  anazhSymphony-Emotion→Tonalität-Lücke (Pfeiler 4 halb — das magieleitung-Shimmer :9658 ist das
  Vorbild → D5b) · `journal share/witness` (Typen ohne Schreiber — der Sozial-Bogen F4 schreibt
  sie; NICHT schneiden).

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
2. **Miss, rate nicht** — die 73 diag-Skripte; der Reproducer mit Output-Lesen *vor* dem Fix.
3. **Verdichte, baue nie parallel** (V17.9, §6) · **Harmonie statt Revert** (V17.23) · **verifiziere
   KONSUM, nicht Existenz** (V17.31).
4. **Keine halben Schritte** (V17.30) — Plan klar + Gap benannt → das ganze Subsystem an die Wurzel.
5. **Eine verworfene Architektur nicht wieder anfassen** (§4) — ein Revert ist ein Signal, dass die
   Wurzel woanders liegt.
6. **Merge-Rhythmus** — ein validierter Bogen = ein Merge. **Der Tisch bleibt schlank** (ein fertiger
   Plan wandert sofort in die Bibliothek).
7. **Read-as-stranger VOR jeder Präsentation** (V18.3, verallgemeinert 09.06.) — bevor ein Plan, eine
   Analyse, ein „fertig" den Schöpfer erreicht, lies es feindlich, als wäre es von einem Fremden:
   *wirklich gemessen oder behauptet? aktuellster Stand oder nur die Klassiker? Hypothese als Hypothese
   markiert? Samen/Fäden verwoben oder vergessen?* Der Selbst-Review ist mein Reflex, nicht die Frage des
   Schöpfers — er fand schon einen geshippten Bug (V18.3) UND einen zu selbstsicheren Plan (09.06.).

## §10 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (`V18.84` = die nächste). Pro Welle: ein Commit +
ein Chronik-Eintrag oben in `docs/archiv/handover.md`. Eine dauerhafte Lehre → eine Zeile in
`CLAUDE.md / Wichtige Gotchas`.

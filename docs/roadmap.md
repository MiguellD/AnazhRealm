# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der aktive Tisch.** Vier Fragen vor dem nächsten Schritt: **Wohin?** (§0) · **Wurde das schon
> probiert?** (§2 Narben) · **Existiert das schon?** (§3 Teilsysteme) · **Schneide ich einen
> Samen?** (§4 Samen/Fäden). Alles Erledigte lebt in der git-Historie (`git log` = die Chronik;
> die gefallenen Plan-Docs sind dort durchsuchbar: `git log --all --oneline -- docs/`).

## §0 · DER TISCH — was offen ist

### §0.v1 · Die v1.0-Ziellinie (gesetzt 30.09.2026)

v1.0 ist EIN gespielter Pfad, kein Feature-Katalog:

1. **Ankommen** — Boot bis Kontrolle ≤ 5 s, kein Fall, kein Freeze.
2. **Laufen + sehen** — die Welt trägt Wiese · Wald · Wasser · Ferne.
3. **Bauen** — in der Werkstatt einen Bauplan wählen/formen und platzieren (≤ 3 Klicks).
4. **Mit der KI erschaffen** — ein Satz wird über den Rezept-Katalog zu Foundry-Assets in der
   Welt. GEBAUT (V18.493: `spawn_studio` · `near_water` · Prompt mit den LIVE-Wörtern · Satz
   ohne Schlüssel; Band `checkBandV18493CoSchoepferStudio`). Offen: der Lauf mit echtem Schlüssel
   (Drehbuch Schritt 18) · Regler-Wörter („knorrig", „hoch") auf die B4-Regler.
5. **Benutzen / teilen** — betreten · fahren · halten · als Bauplan teilen.

**Der FPS-Boden:** p95 ≤ 33 ms in der Standard-Szene auf JEDEM Standardgerät — der Richter ist das
PROFI-BAND (60 fps · 208 DRW · ~680k TRI · 118 MB VRAM), nicht ein einzelner Rechner (Schöpfer-Wort 02.10.:
„richter ist nicht mein rechner … die werte sind bekannt"); gemessen hardware-unabhängig (`werkbank zaehlen` ·
`takt` · `fluss`) und mit dem Flugschreiber-Export (`anazhRealmPerf.json`). Der Richter-Befehl ist `werkbank band`:
jeder Befehl, jedes Dreieck, jedes MB beim Täter-Namen gegen den Haushalt und die Ratsche (`spec/profiband/`, Wand
`gate:profiband`; die volle Welt eingeschwungen, das Band ROT, solange ein Ist darüber liegt; die Ratsche ist die Hülle
einer Serie der echten GPU — `werkbank ratsche` —, eine Klasse darf nur fallen). **Feature-Stopp bis v1.0** — nur, was einen der fünf
Schritte oder den FPS-Boden trägt.

### §0.frozen · Die Frozen-Liste

Die EINE Offen-Wahrheit ist `docs/PFLICHT-OFFEN.md` (A–E, gesetzt 21.07. mit dem Schöpfer-Wort
„analog!"). Stand V18.496: Schöpfer-Wort 30.09. „am Ende AAA-Niveau, nicht Kapseln" — nah und
mittel das Studio-Mesh mit seiner LOD-Kette, das Feld nur fern; die Mesh-Zone steht (0 ungebaut,
`docs/abnahme-analog.md`); die Vegetation trägt seit V18.506 das Farb-Gesetz (Laub 0,42 → 0,16),
seit V18.507 EIN Himmel am Tag und die Belichtung aus dem Licht (Karte 212 → 173), seit V18.508 nah
die Nah-Wiese auf der Boden-Karte (D gefallen); offen: das Profi-Band auf jedem Standardgerät
(Schöpfer-Wort 02.10.: „richter ist nicht mein rechner").

### §0.reste · Benannte Reste mit Wartebedingung (nichts erfinden)

- **typeof-Ratchet** (`gate:apparat`) sinkt nur mit Konsum-Urteil je Probe, nie blind.
- N5.4 scatter-Verdrahtung [erstes scatter-Rezept] · N6.5 spring/pitch [M4-Entscheid] ·
  Rüstung/Trank-Rezepte + Geräte-Gestalten [Lab-Presets] · W-A2 Auto-Impostor [eine Worldgen-
  Massen-Domäne ohne ehrliche Stufen] · plantForest ↔
  planForestCell [nur unter Byte-Beweis] · start_plattform [bis fachwerk sie deckt].
- **Totholz** — die Streu-Schicht `litter` (der Alias `baum_totholz → eiche`, eine belaubte 21-m-Eiche) fiel FINAL
  (W1 + Integration 05.10., `gate:altlasten`), mit ihr der Genese-Kandidat, Grammatik · Baum-Parameter · Tag-Variation.
  Seit dem Waldboden (04.10., integriert 05.10.) ist Totholz Studio: liegend (Totstamm, Stumpf) trägt es die Nah-Streu
  der Welt, stehend (`totholz`, Boden-Zeile ring "wald") pflanzt es der Labor-Wald; die Welt hat keinen Erzeuger für
  stehendes Totholz (die Genese-Zeile bleibt gefallen — Integrations-Entscheid, kein Alias kehrt zurück).
- **Benannt gestrichen (Waldboden 04.10.):** mit dem Klein-Vegetations-Zwilling fielen final die Leucht-Sporen
  und der Pollen (die einzige Essenz-Ernte — das Studio trägt keine Schwebe-Teilchen), das Kreuz-Fernfeld und
  die Deck-Streu (jenseits der Nah-Streu trägt der Boden) und das minGen-Tor des Schilfs (es wächst am
  gemessenen Ufer jeder Welt).
- **Bewusst rot:** diag-genom „0 Gigant" (heilen oder begründen) · diag-atmosphere Fill-NACHT
  (Waise seit V18.464).
- **Das Drehbuch** (`docs/abnahme-drehbuch.md`): `npm run look-golden -- --mint` auf echter GPU.

## §1 · Das Fischer-Prinzip (über allem — „Regel #0" GESTRICHEN V18.356)

Ich MESSE (Gate · Diag · hardware-unabhängiger Proxy), ich SEHE (settled swiftshader-Schüsse sind
farbtreu; Methodik: settled · Augenhöhe · nah · A/B), ich URTEILE, ich VOLLENDE — das Neue wird
DER Pfad (default-an), kein Hedge. Der Schöpfer wertet das ERGEBNIS und bleibt das Merge-Gate für
den LOOK — er ist NIE die Ausrede, etwas halb/AUS zu lassen. MECHANIK braucht eine ZAHL, LOOK
braucht ein BILD (eine headless-Zahl als Look-Beweis kann lügen).

## §2 · Die Narben — probiert & VERWORFEN (nicht wiederholen)

> Die Meta-Narbe: 30 Wellen drehten am Render-Mesh, während die Wurzel (kein Fluid) unberührt
> blieb — pixel-blind tweaken statt die Wurzel benennen ist die Spirale selbst.

- **Wasser:** Fläche auf Zell-Maske klippen → Sägezahn (Uferlinie gehört in den Tiefenpuffer,
  nie in die Geometrie) · flacher Fluss-Querschnitt ZWEIMAL gebaut, ZWEIMAL revertiert — nicht
  ein drittes Mal · Fluss-Anheben → Bank-Sägezahn · Auslauf-Regler/Dichte-skirt → Pflaster ·
  Boundary-Face-Mesh statt Surface-Nets → flach/gappy; der Render ist ein Oberflächen-SHEET,
  kein geteilter Volumen-Mesher · 3D-GPU-Fluid-Sim = falsches Werkzeug (der Weg ist ein CA).
- **GPU/Render:** GPU-Density-WGSL → geschnitten (Roundtrip teurer als Worker-CPU; KEIN
  GPU-Compute-Rewrite der load-bearing Pipeline) · Cel/Schatten für WebGPU opfern → Rollback ·
  Geometrie-eps gegen Trapeze → falscher Hebel (Wurzel war die Facetten-Lichtung, `normalNode`) ·
  „GPU-driven-Culling-Gigant" zur Wand geprobt (Juni): verworfen; der gezielte Hebel (Feld-Cull
  V18.488: Compute-Kompaktierung + indirekte Draws für die @s:-Fernstufen der Streu) fiel 05.10.
  mit seinem Ziel — die Fernstufe ist seit dem EINEN Atlas eine Karte; gemessen griff er nur noch
  beim Wandern an Geröll-L0 und verwarf dort vor allem freie Slots, im Hauptbild allein, für die
  Band-Linse unsichtbar (indirekter Draw). Die Narbe: kein GPU-Cull für Familien unter ~100 Instanzen.
- **Hydro/Spawn:** Submarine-Biom-Dämpfung → Symptom-Pflaster · Perzentil-waterLevel-Magie →
  Sample-Region ≪ Wellenlänge · Architektur-Optik-Aufwertung entfesselte die Material-Resonanz
  (Optik-Anreicherung MUSS tag-neutral sein, 4 Achsen vorher/nachher messen).
- **Off-Thread:** `_buildArchMeshMerged` off-thread GEMESSEN VERWORFEN (3–4 ms, schon gecacht);
  schwere RECHNUNG an einer echten Grenze trennen JA — den Stamm nach Thema zerteilen NEIN
  (die 2025-Falle). Transvoxel = falsches Werkzeug für Streaming (Nachbar-LOD-Rebuild-Churn);
  cross-LOD-Normalen für-nichts (Shading liest `up+bump`) — vor Naht-Arbeit dieses Urteil zuerst.

## §3 · Die Teilsysteme — was EXISTIERT (nicht parallel bauen)

- **Welt-Substanz:** Terrain-Density (`_terrainBaseDensityAt`, main+Worker bit-identisch) ·
  Hydrosphäre (`_computeHydrosphere`, frozen) · Wasser-Pipeline (CA `waterCells` → Sheet →
  Shader; Fern-Wasser-Atlas) · Voxel-Streaming (`_tickVoxelChunkStreaming`, Ring+LOD+BVH+Worker).
- **Lebendiges:** das Feld (`auraAt` lesen · `_deposit*` schreiben · δ werten) · Emotion-Kern ·
  Kreaturen (bauTier-Baum + CPG-Gang + Fern-Guss) · der Nexus (Gesten `dsl.history` + Gesetze
  `worldRules`; `_crystallizeGestureRule` live) · DSL/Weltregeln (`dslRun`-Sandbox).
- **Schöpfung:** Crafting-Resonanz (`_blueprintProductVector`) · Werkstatt (`_makeCostGate` +
  `fertigeBlueprint`) · Hylomorphismus (`FORM_TAG_ACTIVATION`, frozen Signaturen — emergent-
  korrekt, kein Ad-hoc-Tuning) · die EINE Pipe (Foundry `build-asset` für ALLE Gattungen) · ihr Transport
  (`_foundrySchale` IM Worker: Platte · Konsum-Wand `FOUNDRY_LESEN` · Uint16-Index · Transfer — der Haupt-
  Thread fasst keinen Asset-Cache an, `gate:fluss`) · ihre Schlange (`_foundryAuftrag`: der Host hält sie, 12 je
  Studio-Faden, nah zuerst, ab 6 s Alter abwechselnd der Älteste — `gate:takt` T5/T6; die Karte bäckt im eigenen
  Bäcker-Faden `_foundryBaecker`, nie zwischen den Körpern — T7).
- **Render:** PBR (`_buildToonNodeMaterial` — Name ist Umbenennungs-Schuld, baut IMMER PBR) ·
  Frequenzband (`_applySubstanceResponse`) · Schatten (2 CSM-Kaskaden; jede LOD-Maske misst vom Auge
  `uLodAuge`, ein L0-Baum wirft seine L1 — `gate:foundry-crossfade`) · LOD-Kaskade (`DETAIL_CASCADE`) ·
  Vegetation (Gras-HISM + Scatter + Impostor-Bäckerei + die Nah-Streu: die Studio-Bodenarten im Kachel-Ring
  um die Kamera, gesetzt nach dem Boden-Gesetz `placement.boden` / `bodenGewicht`).
- **Welt/Sozial:** Portal/Sub-Welten · Vibe-Pass (ed25519) · Bibliothek/Feed · Mesh (signaling +
  WebRTC + Compute-Sharing) · Fremd-Engine-Tor (Sandbox + Auto-Vendor).
- **Spieler/UI:** `computePlayerStats` (equip-Fold) · Inventar/Hotbar/Equip · die 6 Räume +
  Designsystem (`.spec-*` · Omnibox). **Gebaut-aber-UI-los (~19 Methoden, KEIN Sediment —
  verdient den UX-Bogen):** Archipel (`createPortalHall`/`signPortalHall`/…) · Robustheit
  (`setWorldVisibility`/`banPeer`/…) · Compute-Sharing (`signComputeContribution`/…) ·
  `pinCurrentWorld`/`setRegionsActive`/`_portalForwardDsl`.

## §4 · Die Samen + DIE GEMERKTEN FÄDEN (Schöpfer-Wort: alle wichtig, nie still streichen)

**Samen (ruhen mit Begründung — schneide nur, was VERIFIZIERT durch Tieferes ersetzt wurde):**
`_fieldWohlErlebt`/`_fieldWohlBaselineAt` (WERTEN-Infrastruktur) · `_archInstanceUpdate` +
Instancing-Gating (bewegliche Instanzen + GPU-Memory-Schloss) · Drain-Pools (Leak-Schutz,
test-verankert) · Chat-DSL-Skeleton (Vision-Faden) · Wetter-ambient-Array (`snow/embers/motes` —
deklariert, nie geschaltet → Wetter-Polyvalenz) · anazhSymphony-Emotion→Tonalität-Lücke
(das magieleitung-Shimmer ist das Vorbild) · `journal share/witness` (Typen ohne Schreiber —
der Sozial-Bogen schreibt sie).

**Gemerkte Fäden (offen):** Orakel-Posten (ungebaut, nach v1.0): Ripple/Splash/Kielwasser ·
Szenen-Refraktion · Host-Sequencer + Zustands-CRC für MP · Fahr-Kinematik (Gierrate∝Input×Tempo) ·
Sync-Edit-Remesh im Worker · Kachel-Erosion async · Bloom-Mip-Kette · seeded PRNG für alle
Gameplay-Würfe · Impostor-Elevation · Avatar-Kleider =
Studio · VR/WebXR (0 Code) · das echte V18→V19-Zeit-Portal (Empfang gebaut;
offen: ein ECHTER Alt-Build emittiert ein Artefakt, das ein Folge-Build isst) · Wasser-Zwei-
Naturen-Vereinigung (statisches `L`-Substrat + CA zu EINER Natur + Wasserfall-Politur) ·
Lockstep-MP Stufe 3 (Fixed-Point/cross-Maschine) · Fern-Wasser Zone B (>720 m, 43,2-m-Step) +
Handoff-LOOK an der Ring-Kante (Schöpfer-Auge) · Gras: Halm liest die VOLLE Geologie-Albedo +
echte Dichte (perf-gebunden, Worker-Klasse wie B1) · Worldgen-Monolith off-thread (~5 s Boot-
Sync, der nächste echte Hebel, wenn der Boot-Block dran ist).

## §5 · Die operative Disziplin

Die tragenden Lehren leben in `CLAUDE.md` (auto-geladen). Zusätzlich hier: **Read-as-stranger
vor jeder Präsentation** (wirklich gemessen oder behauptet?) · **Merge-Rhythmus** = ein
validierter Bogen = ein Merge, der Tisch bleibt schlank · **eine verworfene Architektur nicht
wieder anfassen** (ein Revert ist ein Signal, dass die Wurzel woanders liegt).

## §6 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (`V18.469` = die nächste). Pro Welle: ein
thematischer Commit — **die Commit-Message IST der Chronik-Eintrag** (git log = die Chronik).
PATCH ist ein Fix INNERHALB einer Welle — nie eine Konstante, nie ein Stempel (September 2026:
586 Patch-Versionen für Lab-Literal-Hebungen in 2 Sammel-Commits = die Narbe). Alle Träger
setzt EIN Befehl: `npm run bump -- x.y.z` (`--check` meldet Drift).
Eine dauerhafte Lehre → eine Zeile in `CLAUDE.md`, nie Epen.

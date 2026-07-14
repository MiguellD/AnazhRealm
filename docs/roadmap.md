# AnazhRealm — Roadmap (der Entscheidungs-Kompass)

> **Der aktive Tisch.** Vier Fragen vor dem nächsten Schritt: **Wohin?** (§0) · **Wurde das schon
> probiert?** (§2 Narben) · **Existiert das schon?** (§3 Teilsysteme) · **Schneide ich einen
> Samen?** (§4 Samen/Fäden). Alles Erledigte lebt in der git-Historie (`git log` = die Chronik;
> die gefallenen Plan-Docs sind dort durchsuchbar: `git log --all --oneline -- docs/`).

## §0 · DER TISCH — was offen ist (Stand V18.471)

1. **DER SCHÖPFER-BROWSER-BEFUND (14.07.2026 — der aktive Bogen; die Runde FAND statt, ihr
   Urteil: „nichts vollständig"):**
   (a) **PERFORMANCE — DER ERSTE ECHTE TRACE IST GELESEN (14.07., V18.473):** die Maschine
   des Schöpfers ist RENDER-GEBUNDEN — steady 85 ms/Frame, davon ~72 ms CPU-Render-Submit
   bei ~1733 Draw-Calls (GPU-Lücke steady nur ~6 ms); die Sekunden-Stalls (bis 8,7 s) sind
   GPU-Events bei Tri-Spikes auf 20–26M Dreiecke. GEBAUT V18.473: der EXISTENZ-BODEN des
   Dispatchers (`gate:existenz-boden` — Budget dauerhaft leer ließ pendingWaterIso/Scatter/
   Gras monoton wachsen [Heap +1,6 MB/s]: Schwimm-Physik ohne sichtbares Wasser; jetzt
   fließt Substanz JEDEN Frame, Deko jeden 4.) · die TRI-ATTRIBUTION im Flugschreiber
   (Freeze-Snapshots tragen die Top-5-Teilbäume nach Dreiecken — der nächste Trace NENNT
   den 26M-Wal; Verdacht: Kreaturen ~1M+ Tris/Stück ohne LOD, s. (c)) · die NACHT-KARTEN-
   Dimmung (tagLicht-Uniform: eingebackenes Studio-Tageslicht fällt mit der Sonne).
   OFFEN (die zwei gemessenen Steady-Hebel): **die DRAW-CALL-DIÄT der Fern-Gruppen**
   (V18.303-Notiz: ~1000 winzige LOD2-Gruppen durch per-Region-Keying — Impostor-Quads
   gröber keyen) und **Kreatur-Tris/LOD** (Matrix (c)). Der Transport steht (V18.472
   Panel + Export; Narbe respektiert: adaptive Auflösung bleibt aus — Submit-Kosten,
   nicht Fill, tragen den steady state).
   (b) **Baum-L2: DIE BÄCKER-VEREINIGUNG IST AUF ECHTEM HOLZ BESTÄTIGT** (Schöpfer-Trace
   14.07.: Zensus 204 gebacken · 0 gescheitert · 0 wartend — jede Ferne trägt echte
   Studio-Karten). Nacht-Glühen-Klasse gefixt V18.473 (tagLicht-Uniform: das eingebackene
   Studio-Tageslicht fällt mit der Sonne, Boden 0.12 = Mond-Silhouette — Schöpfer-Auge
   bestätigt es nachts). OFFEN: die ZWEIT-KERN-BÄCKEREI im Studio (Tor-Records fallen bis
   dahin ehrlich auf die Skelett-Silhouette — der Pflanzen-Bäcker kennt sie nicht).
   (c) **Regler+LOD-Vollständigkeit — jetzt GEMESSEN (`gate:konsum-matrix`, V18.470):**
   9 Gattungen × 8 Facetten, 55 Zellen verankert, 20 Differenzen benannt. Die größten:
   LOD-Leitern — haus [0,1,2] EHRLICH bewiesen · fahrzeug/tor/klinge [0] bewusst (Wirt
   gradiert; Fahrzeug-Fernstufe fehlt real: 328 Meshes je Distanz) · kreatur/koerper/klang
   ganz ohne Stufen-Zeile (wolf 81 Meshes, mensch/tier ohne Geometrie-LOD) ·
   Bäcker-Vereinigung BEIDSEITIG GEBAUT (s. (b), Konsum-Matrix-Probe ✅) ·
   mensch/tier ohne Geometrie-LOD · Straßensystem = 0 Treffer ·
   klinge/streu ohne Kollision (bewusst? urteilen) · haus ohne Betreten-Verb.
   (d) **Tiefe statt Oberfläche — VOLLENDE-WELLE V18.474 (kein Aufschieben):**
   GEBAUT+bewiesen: DC-Diät der Fern-Gruppen (Super-Region-Keying am EINEN Chokepoint,
   16→1 Gruppen bei 4×4; gate:scatter-lod F-Block) · FAHRZEUG ganz (Geist liest die
   Studio-Gestalt; der Fahr-Tick bewegt den EINTRAG über den Matrix-Chokepoint, 14,4 m
   bewiesen, Reiter-Kollisions-Skip, persistiert; gate:vehicle-drive) · TIERE entstapeln
   + differenzieren sich (Separations-Kraft, NaN-fest, ohne Math.random; Stats/Emotion
   modulieren Radius/Tempo; gate:tier-separation) · ZWEIT-KERN-BÄCKEREI (Tor-Karten echt,
   gate:baecker-kanal drachentor nicht-leer; Welt-Wächter geweitet). DIE WASSER-WAHRHEIT
   IST GEBAUT (V18.475, gate:wasser-wahrheit 4 Fixtures + Selbst-Tests): Höhen-Gate des
   Dach-Blurs in BEIDEN Spiegeln (Wand-Kriechen tot; gate:worker-watersheet WIEDER
   STEHEND, maxDiff 0) · Rim-Wand (terrainTopY=−∞ heißt unbekannt, nie nass — der
   Spiegel-Film über Land fällt) · Verdunstungs-Boden (settled Zungen unter Render-
   Schwelle verdunsten, Quellen nie — die ewigen Blobs fallen) · Stau-Qualifikation nach
   Profi-Maßstab (nur geerdete, geschlossene Basen dämmen — Pfosten/Stege nie; echte
   Dämme leben). OFFEN danach: Avatar-Kleider/Bewegung ≠ Studio · Kreatur-Tris/LOD
   (Tri-Zensus im nächsten Trace) · Fahrzeugphysik-Tiefe · Körpermechanik (Fuß-IK) ·
   Schwertschwung · Stadtpflanzung/Straßen — Reihung folgt dem Profi-Orakel-Audit.
2. **Das formale Abnahme-Drehbuch bleibt offen** (`docs/abnahme-drehbuch.md`):
   `npm run look-golden -- --mint` (dein Auge einmal, die MSSIM-Maschine für immer) ·
   Nervensystem-DoD 5 · E-C/E-E/E-F.
3. **typeof-Voll-Wanderung** — bewusst NUR-SINKENDER Ratchet (`gate:apparat`, 891 Proben in
   playtest.cjs bei 22 Katalog-Ankern); die Wanderung verlangt Konsum-Urteil je Probe, eine
   blinde Massen-Migration würde die Beweise schwächen (Urteil V18.467). Kein Jetzt-Schluss.
4. **Die Kommentar-Diät des Stamms** (Folge der Informations-Diät V18.468): anazhRealm.js trägt
   ~26k Kommentarzeilen, davon ~3,3k Versions-Archäologie. FALLE: Linsen ankern auf Kommentaren
   (Source-Proben zitieren Kommentar-Text; Absenz-Greps laufen über `window.__codeOf`, WEIL
   Kommentare gefallene Namen zitieren) — die Diät verlangt Anker-Wanderung in derselben Welle,
   nie blindes Strippen.
5. **Der nächste GROSSE Bogen (Schöpfer-Wahl, erst wenn 1 steht):** (a) der lebendige Körper
   (Fuß-IK/Foot-Lock/Blending/Spring; Stoff-Textur · Säume · SDF-Politur als Lab-Erlebnis) ·
   (b) Seelen-Vertiefung (Emotion→Regel-EMERGENZ · KI als volle Co-Schöpferin opt-in ·
   Emotion→Farbe-Konstanten in `dslComposeFieldColor`) · (c) der UX-Bogen (§3-Ende: die ~19
   gebauten-aber-UI-losen Subsystem-APIs verdrahten) · (d) die gemerkten Fäden (§4).
   Empfehlung: (a) → (b).
6. **Benannte Kleinreste MIT WARTEBEDINGUNG (bewusst geurteilt — nichts erfinden):**
   N5.4 scatter-Verdrahtung [wartet aufs erste scatter-Rezept] · N6.5 spring/pitch [M4-Entscheid] ·
   Rüstung/Trank-Rezepte + Geräte-Gestalten + L1-Diät [warten auf Lab-Presets/-Entscheide] ·
   W-A2 Auto-Impostor [wartet auf eine Worldgen-Massen-Domäne ohne ehrliche Stufen] · TAA-Lite
   [dann rotiert `uDitherT` wieder] · Zwei-Pass-Laub-Composite [ruhend] · Pflanzen-B4/B5-Daten-
   blöcke · plantForest↔planForestCell [NUR unter Byte-Beweis] · Totholz-Saat + start_plattform
   [bis fachwerk sie deckt] · Frisur/Schnitt-Technik-Reichtum (Lab-Builder) als künftige
   Gesetz-Zeilen · diag-genom-Bänder-Wanderung.
7. **Bewusst-rote Zustände (benannt, nicht vergessen):** diag-genom „0 Gigant" (Refactor-Leiche,
   heilen oder dauerhaft begründen) · diag-atmosphere Fill-NACHT (der Nacht-Fill stirbt mit der
   Sonne — seit V18.464 Gesetz, die Linse ist Waise; bei Wieder-Bedarf aus git holen).

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
  „GPU-driven-Culling-Gigant" zur Wand geprobt: existiert nicht (GPU clippt schon; Region-Cull
  60 % steht; Compute+Indirect high-risk/marginal) — der Render ist nahe-optimal.
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
  korrekt, kein Ad-hoc-Tuning) · die EINE Pipe (Foundry `build-asset` für ALLE Gattungen).
- **Render:** PBR (`_buildToonNodeMaterial` — Name ist Umbenennungs-Schuld, baut IMMER PBR) ·
  Frequenzband (`_applySubstanceResponse`) · Schatten (Light-Space-Snap, EINE Map) · LOD-Kaskade
  (`DETAIL_CASCADE`) · Vegetation (Gras-HISM + Scatter + Impostor-Bäckerei).
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

**Gemerkte Fäden (offen):** VR/WebXR (0 Code) · das echte V18→V19-Zeit-Portal (Empfang gebaut;
offen: ein ECHTER Alt-Build emittiert ein Artefakt, das ein Folge-Build isst) · Wasser-Zwei-
Naturen-Vereinigung (statisches `L`-Substrat + CA zu EINER Natur + Wasserfall-Politur) ·
Lockstep-MP Stufe 3 (Fixed-Point/cross-Maschine) · Fern-Wasser Zone B (>720 m, 43,2-m-Step) +
Handoff-LOOK an der Ring-Kante (Schöpfer-Auge) · Gras: Halm liest die VOLLE Geologie-Albedo +
echte Dichte (perf-gebunden, Worker-Klasse wie B1) · Worldgen-Monolith off-thread (~5 s Boot-
Sync, der nächste echte Hebel, wenn der Boot-Block dran ist).

## §5 · Die operative Disziplin

Die 14 tragenden Lehren leben in `CLAUDE.md` (auto-geladen). Zusätzlich hier: **Read-as-stranger
vor jeder Präsentation** (wirklich gemessen oder behauptet?) · **Merge-Rhythmus** = ein
validierter Bogen = ein Merge, der Tisch bleibt schlank · **eine verworfene Architektur nicht
wieder anfassen** (ein Revert ist ein Signal, dass die Wurzel woanders liegt).

## §6 · Versions-Konvention

MAJOR ist teuer (ein Zeitalter), MINOR ist die Welle (`V18.469` = die nächste). Pro Welle: ein
thematischer Commit — **die Commit-Message IST der Chronik-Eintrag** (git log = die Chronik).
Eine dauerhafte Lehre → eine Zeile in `CLAUDE.md`, nie Epen.

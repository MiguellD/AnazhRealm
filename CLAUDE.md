# AnazhRealm — Projektgedächtnis

**Was das ist:** das Ultiversum — eine Welt, die aus GESETZEN wächst statt aus Assets, gemeinsam
erschaffen von Mensch (Schöpfer/Null) und KI, mit der Welt selbst als drittem Mitspieler: das Feld,
das liest · schreibt · WERTET (`docs/das-lebendige-feld.md`). Die acht Schöpfer-Studios (worlds/:
terrain·garage·portale·schmiede·fachwerk·klang·koerperstudio·tetrapoda) sind die Gesetzbücher;
**AnazhRealm erzeugt nichts, was ein Studio kann — es ist Boden · Speicher · Spieler · Anschluss.**

## Stand (V18.491.3 — MATRIX GRÜN + Trace-Wellen: Kamera-Kleber tot, Grenzzyklus-Schnitt, Gnadenfrist, Kein-WebGPU bewiesen)

**18.07., sechste Welle (vierter Trace: die Linsen überführen den GRENZZYKLUS — Radius
atmete 58↔130 m, Churn-Linse nennt fscatter:blume ×6/1132 Wiederkehrer, GPU echt blieb
10–15 ms in den 5-s-Frames [die Proxy-Verdikte LOGEN — 5–6.4-s-LongTasks vom Worker-
Reply-Ingest deckten die Lücke]):**
- GRENZZYKLUS-SCHNITT: der Radius-Aktuator bekommt die Zeit-Wand — WACHSEN nur nach
  PERF_FOLIAGE_GROW_RUHE_S (4) Sim-Sekunden ohne Über-Budget-Frame (jede Welle setzt
  die Uhr zurück; Sim-Zeit via sense.frameMs, gate-deterministisch), SCHRUMPFEN erst
  ab PERF_FOLIAGE_SHRINK_TOTBAND (8 m) Ziel-Abstand. Der Kreis „wachsen→Ingest-Sturm→
  Kollaps→schrumpfen→Zellen frei→wachsen" ist tot. gate:regler-sim S6 (11/11):
  gepulster Kopfraum Δ 0 · anhaltende Ruhe wächst 75→216.
- PROXY-LÜGEN-WAND im Verdikt: deckt der LongTask-Akku >60 % der gpuGap-Lücke, urteilt
  der Flugschreiber HAUPTTHREAD-BLOCKIERT (Worker-Reply-Ingest/Compile) statt „GPU-
  gebunden" — echtes timestamp-gpuMs bleibt die Wahrheit.
- Die Wale sind benannt: die fünf 4kV-InstancedMeshes sind das Studio-GRAS (3564-Vert-
  Büschel, castShadow aus, ~12M der 18M Tris) — GPU trägt sie (echt 10–15 ms); OFFEN
  bleibt die per-Draw-Uniform-Bahn (20M Klein-Uploads) + der synchrone Reply-Ingest
  (der nach dem Zyklus-Tod nur noch beim echten Streamen feuert).

**18.07., vierte Welle (zweiter Schöpfer-Trace 6.7 fps + Konsole urteilen — GPU echt 17 ms,
CPU-render 88 ms: der Wal ist die CPU-Submit-/Fehler-Bahn, nie die GPU):**
- WGSL-SPEC-WAND: der Feld-Pass-Raymarch mischte `i32 % u32` + `clamp(i32,·,u32)`
  (textureDimensions = vec2<u32>) — das Schöpfer-Chrome-150-Dawn warf CreateShaderModule,
  die invalide Pipeline riss JEDEN Queue.Submit ihres Render-Kontexts mit (weiße Welt,
  21.9-s-Frames); der swiftshader-Dawn der Gates war nachsichtig. Einmal i32-casten;
  gate:fern-ring Band 8 bleibt grün (echte Render-Probe).
- ATTRIBUT-WAND: 957 Direkt-Konsumenten der geteilten foundry-Masken-Materialien
  (Kreatur-Ofen u.a.) liefen ungestempelt → three warnte je RenderObject (aH0/aH0L/
  aLodLevel-Konsolen-Flut). Null-Stempel am EINEN Konversions-Chokepoint
  (_foundryBuildMesh, byte-gleiches Rendering); gate:foundry-crossfade ATTRIBUT-WAND-Band
  (957 geprüft/0) + Band Z folgt jetzt dem LIVE-Formel-Zwilling (die 12.6-Kante war stale —
  LOD_TRI_BUDGET_MUL macht thresh01 12/Kante 4.6; das Band war seit T2 nie grün).
- UPLOAD-KLASSEN: der writeBuffer-Tap zählt Größen-Klassen (≤16K/≤256K/≤2M/>2M) —
  die 38–53 MB/s Dauer-Uploads des Traces bekommen in der nächsten Datei einen Namen.
- Der zweite Trace bestätigt die dritte Welle: Impostoren 115/115 gebacken, 0 wartend
  (Kleber-Wand + Bake-Fluss leben), Seed klasse=mittel 0.6 konsumiert; OFFEN benannt:
  Heap-Sägezahn (~25 MB/s Müll, GC-LongTasks 335 s/535 s) + CPU-render 88 ms bei 1281 dc
  (die Nicht-Bundle-Draws) = die nächsten Wale, jetzt mit Mess-Namen.

**18.07., fünfte Welle (dritter Trace: uploadKlassen überführt 12.8M Klein-Uploads ≤16K
[2.4 GB, ~55k writeBuffer/s = die per-Draw-Uniform-Bahn ÜBER ALLE PÄSSE] + Gruppen-Churn
+366/176 s bei stehendem Spieler):**
- GNADENFRIST DES LEER-DISPOSE: Familien oszillieren beim Wandern/LOD-Wechsel um
  liveCount 0 — der Sofort-Reap (V18.485) machte jede Oszillation zum Voll-Dispose +
  Re-Mint (Pipeline-Cache-Eintrag · voller Matrix-Upload [795 MB ≤256K-Klasse] ·
  Heap-Müll). Der EINE Leer-Chokepoint `_archGroupLeerDispose`: headless reapt SOFORT
  (byte-alte Gates), echt hält ARCH_LEER_GNADE_MS (10 s) + `_tickArchGruppenReaper`;
  Realloc in der Frist = 0 Re-Mints. gate:foundry-crossfade GNADENFRIST-Band (4 Sätze).
- CHURN-LINSE: die zwei Gruppen-Münz-Chokepoints + der Disposer zählen Mints/Tode,
  ein Ring nennt die Top-WIEDERKEHRER-Schlüssel — steadyState.gruppenChurn im Export.
- OFFEN (mit Mess-Namen): die per-Draw-Uniform-Bahn (~55k Klein-Uploads/s ≈ CPU-render
  86 ms — Hebel: weniger Draws in die Bundles/Batches, Pass-Zahl) · Heap-Sägezahn.

**Davor: 18.07., dritte Welle (der erste Schöpfer-Trace urteilt — 2.8 fps auf starkem Holz +
„Objekte hängen an der Kamera"):**
- KAMERA-KLEBER-WAND: tote Impostor-Slots (`_archGroupFree` Null-3×3 + lebende Translation)
  machten den Normal-Probe singulär (0/0→NaN bzw. 1e-5-Clamp→_sInst 1e5) — ein welt-
  spannendes camera-facing Quad mit dem Familien-Atlas (Fels/Kristall/Auto/Feueresse …).
  Die Wand am EINEN Shader-Chokepoint: `_lebt = probe²>1e-12` + select (NaN·0=NaN!) ⇒
  toter Slot: _sInst 0 UND _alpha 0. gate:foundry-impostor Teil C (echtes WebGPU):
  Monster 3936 px (Selbsttest) · nach Free 0 px.
- GERÄTE-PROFIL = REGLER-SEED: `_geraeteProfil` (EINE Quelle für Flugschreiber UND PID) —
  Klasse schwach/mittel/stark × Pixel-Zuschlag → loadScale-STARTWERT (Prior, nie Urteil;
  headless byte-alt). gate:regler-sim S5.
- KEIN-WEBGPU BEWIESEN: `_gpuComputeFaehig` (Backend-Urteil, Existenz-Prüfungen waren
  blind) wall Feld-Cull · Fullscreen-Feld-Pass (rohes WGSL) · Region-Bundles (API lebt NUR
  im WebGPU-Backend — Crash-Klasse); Rückfall EINMAL laut (WARN), rendererType ehrlich
  (webgl-fallback). gate:webgl-probe (forceWebGL-Hook, alle 5 Renderer-Münzstellen):
  lebende sichtbare Welt auf swiftshader-GL, 0 Seiten-Fehler.
- TRACE-BLINDSTELLEN GEHEILT: triZensus nennt Wale (Marker+Struktur-Label, Chunk-Boden
  benannt) · steadyState trägt ALLE Stellgrößen · gruppenKlassen (Präfix-Zensus des
  660er-Wachstums) · materialZensus (der Pipeline-Münzer der nächsten Datei).

**Davor: 18.07., zweite Welle (ABSOLUTE VOLLENDUNG — die DoD-Matrix aus dem lebenden Code, jede
Zelle grün oder final gestrichen; Merge-Gate + npm run check komplett grün):**
- WAISEN-NULL: der Konsum-Wächter urteilt über DREI Flächen (Stamm · Ofen · Kern-Maschine,
  3 Selbsttests) — die 136-Eintrag-Lern-Liste war Linsen-Blindheit, sie ist LEER; tote
  Kern-Exporte fielen physisch (ANTHROPOS-Rest · DESTNUR/TURMNUR/NOISEAMP/_MAPPED/
  LOD1SKIP · gapStadt), laneiv wird byte-gleich konsumiert.
- KATALOG EIN EINTRAG: `_katalogSichtbar` = der EINE Sicht-Chokepoint (Werkstatt ·
  Rezeptbuch · Omnibox · Auftrag-Select) — grown_*/Varianten-Doppel treten nirgends auf.
- SIEDLUNG GANZ: Zäune + Äcker (Wege-Pool) · Marktstände (marktstand_dorf) · Hof-Bäume
  (Studio-Bäume) leben; der Export trägt NUR gelebte Schichten (gate:settlement C-S6).
- FELS-HÜLLE: Streu-Formationen (fels/kristall_var*) decken die GEMESSENE Studio-Hülle
  (fx.huelle, im Worker über 4 Varianten vermessen) — vierter Gesetz-Blocker-Zweig.
- ZWILLINGS-NULL: sprintMul/FAHR+hostEmergent fail-closed (_sprintMulGesetz/_fahrGesetz,
  Gültigkeits-Wände), Parkour-Rutsch-Ternaries + tetrapoda-Motion-Drittsätze tot, die
  Kampf-Kapsel liest ARENA (kapselRK/RMin/Y0/Y1), die Emotionen erreichen den Mensch-Rig.

**Davor am selben Tag — DIE VOLLENDUNGS-SCHNITTE (erste Welle, je Riss EIN Commit):**
- HAUS-DOPPELBAU tot: slot.ov reist als studioOv — Kirche/Gasthaus/Armut bauen die Export-
  Wahrheit (Optik == Blocker); gate:settlement C-S5 + lebende ov-Hash-Trennung.
- FAHRZEUG-DONOR tot: exportDrive trägt sitz+huelle (Kern-Stationen); Blocker-Chokepoint +
  mountArchitecture lesen `_fahrzeugGesetzFor` (Tor-Klasse, Lockstep-fest); Donor bleibt
  NUR Substanz/Judge + Emergenz-Quelle der User-Compounds. gate:vehicle-drive sitz/huelleKern.
- EINHEITSBREI tot: schmiede.kampfMasze (prepP+measure) misst jede Gattung — Dauer ∝ √I
  (dauerProSqrtIKg), Reichweite = S.L, Schaden × mEff/mEffRefKg (ARENA additiv);
  gate:kampf-gefuehl: byte-gleiche Donor-Parts ⇒ ≥3 distinkte Dauern/Reichweiten/Faktoren.
- DIAL-/PALETTE-ZWILLING tot: foundry-core PRESETS reist SYNCHRON (__terrainCore.PHYTO_PRESETS)
  — gefühlt == gesehen (buche→mammut, erle→weide, karst/palme/zypresse folgen ihrer Seen-Map);
  Literale physisch raus (Rückkehr-Wand 35 Namen).
- HIMMEL/WASSER-ZWILLINGE tot: terrain steht in GESETZ_KERNE (__terrainCore), beide Leser
  fail-closed (_kernPflichtBruch); Inline-Fallback-Wand (gate:studio-vertrag) + der Konsum-
  Wächter rastert die Welt-Look-Gesetze (foundry-core 185 Blätter statt blind).
- PORTA-FOG lebt: mu.fog speist den TSL-Bodennebel am Tor-Fuß (buildFog-Port, nähe-aktiviert)
  + EIN geteiltes Portal-Licht (Lab-Atem-Formel); gate:portal-membran N-Block: Dial→mu→
  Uniform→Draw lebendig.
- GENRE-STIMMEN leben: inst.harmony/lead/bass wählen Wellenform+Pegel+Anschlag, tilt (dB)
  mischt alle vier Rollen, form rahmt die Progression; der Konsum-Wächter urteilt inst/tilt
  per KOMPOSITUM (die Wort-Kollisions-Blindheit ist geheilt, Selbsttest feuert).
- BOOT-LITERALE tot: Haut/Haar aus SKIN_TONES/HAIR_COLORS (Γ5-Anker aus dem Welt-Seed), EIN
  Farb-/Key-Münzer für Guss UND Prefetch (der Boot-Avatar trifft warm), das Peer-Identitäts-
  Leck ist zu; der Bäcker-Default = benannte Kern-Anker (karamell/darkbrown, fail-closed).
- AUGEN-GLUT tot: der Bäcker liest kl.ei (0.3 statt 2.8×-Phantom-Default); foundry-core
  steht mit in der Rückkehr-Wand.

VISIONSSCOPE GESTRICHEN (final, kein Backlog): Stadtmauer-/Laternen-Schichten des
Settlement-Exports (Stadt-Gestalt ohne Welt-Mechanik — nur ein neuer Schöpfer-Auftrag
öffnet das wieder) · Klang = WAHL+Parameter am Host-Ofen (Genre wählt Stimmen/Mixer/Form/
Raum; die Lab-Synthese-Engine bleibt Shell — DAS ist die eine Klang-Wahrheit) · Nebel ohne
Depth-Soft-Pre-Pass (depthTest deckt) · blume-Palette neutral (kein Farb-Gesetz im Studio).
OFFEN (das letzte Wort): die Schöpfer-Abnahme — docs/abnahme-drehbuch.md (20 Schritte,
deckt die Matrix) + `npm run look-golden -- --mint` auf dem Schöpfer-Holz.

Davor V18.489 — DIE SCHLUSS-WELLE (17.07. nachts): die 9 Tetrapoda-Zeilen fallen (VERHALTEN,
fail-closed, Absenz-Wand 18 Namen) · 4 Teils→Ganz (Zorn-Achse→angry · schmiede-Vertrags-Akt
[10 tote Exporte] · klang-RAUM [hall/echo/Sends] · Lab-Vorschau deklariert) · Feld-Cull-
Puffer-Tod (Churn → Grundlinie 0/0/0, Leck-Selbsttest rot) · selbst gespielt (echtes WebGPU).

Davor V18.488 — DIE OFFENEN PUNKTE FALLEN (17.07. abends): DER FULLSCREEN-FELD-PASS (Ferne
jenseits der Schalen = NULL Vertices: Polar-Höhenfeld 192×48 bis 40 km vom
GPU-Feld-Zeichner + Fullscreen-WGSL-Raymarch als letzter Draw; gate:fern-ring
Band 8: Texel==Gesetz worst 9.1 mm, echte Render-Probe 4608 Treffer-Pixel) ·
DER FELD-CULL (Compute-Frustum-Cull + indirekte Draws, atomicAdd-Kompaktierung,
setIndirect; gate:feld-cull: 11/11 → 0 bei 180°-Drehung, Selbsttest rot; halb
~10 %: Puffer-Destroy beim Churn unvermessen) · DER ZENSUS-REST (alle 94
Matrix-Befunde gestempelt: +20 ganz [Genre-Engine 22 Genres · Fahrzeug-Rest ·
Kampf-Rest · Bewegungs-P3] · 4 teils · 23 offen mit Grund) · DER WAISEN-ABBAU
(281→136: klang 121 + EPOCHEN 14 + BOGENMAT 6 wirklich konsumiert) ·
KREATUR-FEINSCHLIFF mit AUGEN (Blick-Sonde, tetrapoda-Winkel).

Davor V18.487 — DIE VOLLENDUNGS-WELLE: erst erstellen, dann reparieren.

**Das Schöpfer-Wort (17.07., bindend): „fertig" heißt IM ECHTEN SPIEL eingefädelt —
halb Gebautes heißt ehrlich halb (mit %), fail-soft ist der Bruch.** Gebaut:
KERN-PFLICHT (fachwerk-/klang-core FEHLTEN in index.html — Gesetze existierten
nur im Testrahmen! Jetzt laden alle 10, `_kernPflichtWand` schreit rot) · DER
EINE GESETZ-STROM (`AnazhRealm.Gesetz("kern:Weg")` — Namensraum/PRESETS-fx, memo,
8 Leser-Familien) · DIE FALLBACK-ZWILLINGE FALLEN (17 Stamm-Größen weg
[SCHWIMM/LUFT/SPRUNG/SCHRITT/VERHALTEN/ARENA_FALLBACK · SWING_/BOGEN_LAWS ·
COMBAT_REACH_M · MOUSE_ACTION_STAMINA_COST · CREATURE_*/TEMPERAMENT_*]; alle
Leser fail-closed via `_kernPflichtBruch`; ZWILLINGS-ABSENZ-WAND + Selbsttest in
gate:studio-vertrag; 12 Playtest-Stellen + 2 Gates gewandert) · DORF-ERLEBNIS
(Straßen/Platz/Brunnen aus dem Siedlungs-Export heben mit [`_stlWege*`,
Rebuild-Gedächtnis über Reload]; Häuser BETRETBAR: Tür-Flügel-Separation im
fachwerk-Kern [Vertrags-Akt, Goldens neu gemintet] + tuer-Zeile im Export →
Blocker mit Tür-Lücke + `_tickHausTueren` öffnet dem Reisenden) · DER
FELD-ZEICHNER (feld-wgsl IM SPIEL konsumiert: voller Fern-Ring-Refresh = EIN
GPU-Compute, Horizont steht im nächsten Frame, CPU verfeinert aufs f64-Gesetz
ab Live-Cursor; gate:fern-ring Band 7 mit echtem WebGPU: ready bei Cursor
600/2880, worst 3.2 mm auf 8 km) · KONSUM-WÄCHTER (gate:konsum-bilanz, 281
Waisen als Lern-Liste) · GENESIS-PORTAL-RING (alle Welt-Portale R 11 m um den
ersten Spawn). OFFEN (ehrlich, kein Warte-Tor): GPU-Cull/indirekte Draws +
Fullscreen-Feld-Pass (§0b) · Matrix-Prio-2/3-Rest + Waisen-Abbau (§0c) ·
Kreatur-Aktions-Feinschliff am Schöpfer-Auge.

Davor V18.486 — DER SPIEGEL-ZENSUS (17.07., Schöpfer-Wette bestätigt):
6-Domänen-Matrix (94 Befunde) + Abbau — das „darf" fiel (Vertrag+Validator für
fx.bewegung/VERHALTEN/ARENA/FAHR.lenkung) · REALITÄTS-EICHUNG (Gehen 1.5 m/s ·
sprintMul 4.5 · Sprung 0.53 m · g 9.81 · Klettern 0.6 · Schwimmen 1.0/speedMul
0.85; gesetz-relative Floors; vmax-Anker des Ritts; 10 Bänder gewandert) ·
STEIGUNGS-DREIKLANG (Hangabtrieb + Gelände-Nick/Wank + Probestrecken-Hügel aus
EINER bodenY-Quelle) · KAMPF-/KREATUR-ZENSUS (Geometrie/Stoß/Kipp/Flug→ARENA,
Quartett→koerper, Verhalten→tetrapoda, Waffen-GÜTE in den Schaden).

Davor V18.485 — DIE WARME MASCHINE: aus der eigenen Telemetrie gebaut.

**Die Ultracode-Welle (16.07.): die eigenen Messwerkzeuge (Hitch-Telemetrie + Selbstspiel)
nannten die Hebel, der Wander-Zensus entschied, alles GEMESSEN:** DER PIPELINE-WARM-OFEN
(das V18.367-Loch: gewärmt wurde PLAIN, konsumiert wird InstancedMesh+Fassade+Tint/
BatchedMesh — andere Pipeline-Keys, ~15.8 Sync-Kompilate/s IM SPIEL; jetzt merkt
`_pipeOfenMerke` an den zwei Gruppen-Münz-Chokepoints jede neue Familie und
`_pipeOfenTick` wärmt 1 Posten/Frame unter Budget mit der LEBENDEN Gruppe [Key matcht
exakt] durch den EINEN `_warmCompilePipeline`; gate:hitch-telemetrie Band 7: 11 Familien
gemünzt→gewärmt→Queue 0, Trace trägt pipelines.ofen*) · DIE RÜCK-WANDERUNG (Wander-
Zensus: 1 km Wandern ⇒ 14.8M GEFRORENE private L1-Boden-Tris [B2-Einweg-Freeze, ~9×
die sichtbare steady-Last]; Wurzel-Fix: die Null-Skala ERBT die Instanz-Position
[der Ursprungs-Sphere-Hazard fällt, WEGEN dem B2 existierte] + Demote-Gate im LOD-Tick
[nur → Fern-Stufe, Fade-Marge; Promotions bleiben Region-Lifecycle]; GEMESSEN
14.8M→4.4M [−70 %; Rest = einstufige geroell-Buchhaltung, gleiche Geometrie je Stufe];
gate:scatter-lod +4 D-Bänder, scatter-ab/slice byte-grün) · MULTI-SEED-SPIEGEL
(gate:dritter-spiegel sweept 3 Welten in EINEM Boot — chirurgische Regenesis der 6
seed-abhängigen Größen [wm.macro-ERBGUT fällt mit, sonst gewinnt es über den Seed];
alle in mm-Klasse: meanAbs 0.47/0.86/0.94 mm) · ERLEBNIS-RESTE (Rutsch-Pose aus
koerper-core `parkour.slidePose` [Überschreib-Schicht NACH dem Rig-Grundlauf, nur der
lokale Spieler] · Bogen-Auszug-HUD [vierte Stats-Row, `_tickBogenZug` frame-genau]).

Davor V18.484 — DAS FELD ZEICHNET, DER GRUNDSTEIN: der Renderer wird ein Leser des Feldes.

**Die Schöpfer-Vision (16.07., normativ `docs/das-feld-zeichnet.md`): die Welt ist eine
FUNKTION, kein Sack — Render-Kosten binden an den SCHIRM, nicht an die Welt. V18.484
gießt den Grundstein, alles GEMESSEN:** DER DRITTE SPIEGEL (`feld-wgsl.js` +
`gate:dritter-spiegel`: das Terrain-Makro-Gesetz komplett in WGSL, GPU trifft f64-JS auf
meanAbs 0.86 mm/p95 3.1 mm/max 8.3 mm über 5184 Proben; SEH-Spiegel, nie Physik-Wahrheit;
Tabellen/Overlays aus den LEBENDEN Quellen) · HITCH-TELEMETRIE (`gate:hitch-telemetrie`:
LongTasks·GC-Ring·Pipeline-Compiles·Upload-Bytes-Tap [queue.writeBuffer-Wrap, vendor
byte-alt] in Flugschreiber/Panel/Trace — fing sofort 4.2-s-LongTask + 153 Pipeline-
Compiles im Boot) · DAS FELD URTEILT (Dither-Wal: Nicht-Baum-Scatter ALLER Stufen
region-gekeyt → `@s:`-Super-Region-Cull; nie-geculltes Foliage 3.14M→1.74M Tris [−43 %];
gate:scatter-ab byte-grün) · WARM-START (`gate:warm-start`: uneditierte Chunk-Bytes in
IDB [Foundry-Disziplin, VERSION|genVersion|anker-Stempel], zweiter Boot ~1.7×, Byte-
Gleichheit per FNV, Edit-Bypass ehrlich) · FERN-RING (`gate:fern-ring`: 3 Schalen bis
8 km aus `_terrainMacroSurfaceY(x,z,false)`, welt-gesnappt, budgetiert, quantisiert;
Höhen==Gesetz worst 0.0000). SELBST GESPIELT (ich-spiele-Sonde, echtes WebGPU: steady
1.66M Tris/40 dc [alt 20–26M/1733]) — zwei Sicht-Blocker gefunden+gefixt: KAMERA-KLIPPE
(camera.far 1000 clippte die 8-km-Schalen → Ring-eigene Weitung + Dispose-Rücknahme) ·
HÖHEN-ÖFFNUNG (fog.far öffnet sich NUR über der Umgebung [4 takt-gecachte Proben,
FERN_RING.oeffnung*]; Waldboden byte-alt — Schöpfer-Wort geehrt). OFFEN benannt:
Stufe-2-Vollausbau (GPU-Cull/indirekte Draws + Fullscreen-Feld-Pass) NUR nach
Trace-Urteil (roadmap §0b) — Ofen/Rück-Wanderung/Multi-Seed fielen an V18.485.

Davor V18.483 DIE GEFÜHLS-NAHT (die Erlebnisräume der Studios erreichen die Welt,
sechs Wellen, Kerne rein additiv: Dorf-in-Terrain [Footprint-Höhe + `_archFundamentBox`
= EINE Wahrheit für Blocker+Podest] · Schwimm-Heimat [`fx.bewegung.schwimmen`] ·
Kreatur-Leben [Körper-Zustand führt die Motion-Brücke + `fx.verhalten` 12 Aktionen/
6 Stimmungen, FNV-deterministisch] · Arena-Gefühl [`ARENA`: energie-skalierter
Hit-Stop, Bogen-Vereinigung + Auszug] · Fahr-Gefühl [`FAHR.lenkung`: fahrzeug-eigener
Ritt, Drift] · Parkour [`fx.bewegung.parkour`: Wand-/Doppelsprung, Klettern, Rutsch];
benannt-offen: Fahrzeug-Billboard-LOOK + P2P-Kreatur-Gestalt · klang ohne Stufen-Zeile
[meshfrei] · Kreatur-Aktions-Feinschliff; Detail = git log) ·
V18.482 DIE VERBINDUNGEN (Dörfer 0.1→7/km² + Start-Dorf · Submit-Wal: CPU
4.28→1.23 ms, dc 1566→0 in der Sonde · Physik byte-paritätisch + Bogen-Verb komplett) ·
V18.481 ERLEBNIS-VOLLENDUNG (T2 Kaskaden 32→30M · T3 Bundles · T4 Fell×Fläche · T6
Körper-UI · T7 Boden) · V18.480 KANON (35 Alt-Doppel→0, Werkstatt-LOD-Knöpfe daten-
getrieben) · V18.479 ERLEBNIS-ZIEL (roadmap §0.0 normativ + T0 AUGEN [`npm run blick`:
echtes WebGPU headless via swiftshader-Vulkan] + T1 Blob-Tod + T2 Messung) · V18.478
NAHT-VOLLENDUNG (P2P-Gestalt · Reload-Treue · §8.5-Stufenzeile · Bäcker-ov) · V18.477
NIVEAU-VOLLENDUNG (Prägung-Welt · Fahrzeug-Fernstufe · Tier-Hysterese · Studio-
Übergabe) · V18.476 ORAKEL-UMSETZUNG (acht Tier-1-Linsen; Detail = git log). Der Bogen
darüber: **der Schöpfer spielt V18.483, der Flugschreiber-Trace urteilt** (GPU echt +
Tri-Zensus, POSTet automatisch → committen; V18.481-Trace maß noch 96.9 ms CPU-Render
VOR dem Submit-Wal-Fix). OFFEN daneben: Kommentar-Diät des Stamms (roadmap §0) ·
typeof-Ratchet (nur-sinkend) · Abnahme-Drehbuch (look-golden --mint · DoD 5) ·
Bogen-1-Rest (Kreatur-GPU-Skinning, roadmap §0.5).

## Architektur (die Karte)

- **Stamm** `anazhRealm.js` (~91k, EINE Klasse, `npm run atlas` = 26 Zonen): Boden (Chunks/Wasser/
  Genese/Ökologie) · Speicher (Snapshot/Taille) · Spieler (Seelen/Bewegung/Werkstatt/Ökonomie) ·
  Anschluss (P2P/Portale) + die Verben (appear·place·body·drive·wield·portal·rule) + KIND_POLICY.
- **Kerne** (10, cores.manifest.json): reine Daten+Mathe; Vertrag v1.2 = `PARAMS_BY_KIND` + must-ignore
  + fail-closed (`docs/studio-vertrag.md`). Der Host ist der OFEN (bauMensch-/bauTier-Guss + Lofi).
- **Worker:** Foundry (= terrain-Brücke; Kanäle `get-book` 1×Boot · `build-asset(id,seed,lod,ov)` ·
  `export-settlement`; IDB disk-first, SHA-Stempel der Quellen) · voxel-worker (bit-identischer
  Spiegel).
- **Server:** save-server (state/.bak · perf-trace · llm-proxy · vendor) · signaling (WS→WebRTC;
  Kanäle pos·input-Lockstep·dsl·soul·vibe).

## Die tragenden Lehren

1. **Gesetz #0:** EINE kanonische Größe je Domäne, alle LESEN sie; nach jeder Fehler-Klasse die
   LINSE bauen (Gate/Verdikt), nie auf Wachsamkeit bauen.
2. **EINE Quelle, kein Parallelpfad;** Invarianten in den CHOKEPOINT, nicht an Aufrufer.
3. **Ganz oder gar nicht:** Abschied = Def+Maschine+Spiegel+Tests+Doku in EINER Welle, physisch.
   must-ignore gilt FREMDEN Artefakten (Taille), nie dem eigenen System. `gate:altlasten` wächst mit.
4. **Ich entscheide, geliefert wird Gebautes** — der Schöpfer wertet Ergebnisse, nie Optionslisten;
   Bericht = drei Sätze, kein Theater. Ein benannter Fehler → die ganze KLASSE in derselben Welle.
5. **Miss zuerst, die Zahl führt;** verifiziere KONSUM, nicht Existenz; SPIELEN/sehen vor behaupten
   (headless beweist Mechanik, nie das Erlebnis; swiftshader-Screenshots sind farbtreu —
   schauen schlägt greppen).
6. **Tests wandern mit dem Code;** Absenz-Greps über `window.__codeOf` (Kommentare zitieren).
7. **Worker-Spiegel bit-identisch** (Main ↔ voxel-worker; jede Sheet-/Density-Änderung in BEIDE +
   `diag-worker-watersheet` maxDiff 0). Welt-Substanz zieht aus Γ5-Seed-Streams, nie Math.random.
8. **Spawn-Affinität ist TAG-NEUTRAL** (winner-take-all; die Tiere sind bewusst tag-identisch —
   Differenzierung über die Größen-/Gattungs-Achse, nie über Tags).
9. **`gate | tail` maskiert Exit-Codes** — Exits IMMER explizit (`echo EXIT=$?`).
10. **Jede versionierte Datei braucht den `?v=`-Cache-Buster** (Worker/Bootstrap/importScripts).
11. **Studio-Code nur unter BYTE-BEWEIS anfassen** — die Benchmark bewegt sich nie; Goldens sind
    eingefroren, ein Re-Mint ist ein begründeter Vertrags-Akt. Kerne leben AUSSERHALB des
    format:check-Scopes — nie `prettier --write` auf Gesetzbücher (verbatim-Blöcke!), neue
    Abschnitte rein additiv. `__`-Schlüssel in ov sind STEUER-Passagiere (nie in Bau-Parameter).
12. **Monolith-Chirurgie:** `cut-method` (AST-sicher) · sofort `node --check` + eslint ·
    seriell committen, nie Batch; worktree-Agenten zweigen von main ab.
13. **Der Loop/Regler:** Streaming ist heilig (prio 0), Bewegung hängt nie am Render-Signal;
    EIN PID, Totband 59–77 fps; NaN-Wände vor jedem EWMA-Gedächtnis; Existenz vor Framerate —
    der Ring wächst bis `RING_EXIST_FLOOR` OHNE fps-Gate, der PID atmet nur darüber.
14. **Schwere deterministische Arbeit:** gecacht + im Idle vorgebacken + frame-adaptiv, nie synchron
    auf dem Interaktions-Pfad.
15. **git ist das Archiv:** kein Doppel-Archiv im Baum — Chronik = Commit-Messages, vollendete
    Pläne fallen (git trägt sie), dauerhafte Lehren = EINE Zeile hier, Offenes = roadmap §0.
    Vor jedem Datei-Schnitt: KONSUM prüfen (Gates/CI/Docs, transitiv), nicht Existenz raten.

## Workflows

Dev-Loop: `npm run playtest:fast` (~20 s) · Merge-Gate: `npm run playtest` (Verdikt
„Alle Invarianten OK" zählt, nie der Zähler) · Statik: `npm run check` (inkl. source-probes ·
constitution · studio-vertrag · altlasten · apparat) · `npm run lint` / `format:check` ·
Navigation: `npm run atlas` (+ `--find <regex>`). Gates je Domäne: `gate:*` in package.json.
Commits klein + thematisch, emoji-frei, deutsch — **die Message ist der Chronik-Eintrag**;
Push auf den Feature-Branch; PR nur auf Wunsch.

## Doc-Map (die EINE Karte: docs/README.md)

`docs/roadmap.md` §0 = was offen ist (+ Narben · Teilsysteme · Samen/gemerkte Fäden) ·
`docs/studio-vertrag.md` = die Naht (normativ) · `docs/taille-spec.md` = die Taille (normativ) ·
`docs/neues-kleid-verfassung.md` = die Pipeline-Verfassung (normativ) ·
`docs/das-lebendige-feld.md` = der wahre Norden (vor Feld/Emotion/Nexus/DSL zuerst) ·
`docs/state-of-realm.md` = Vision · `docs/abnahme-drehbuch.md` = die EINE Schöpfer-Runde ·
Chronik + alles Gefallene: `git log`.

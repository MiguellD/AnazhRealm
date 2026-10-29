/**AnazhRealm V7.82 – Das Ultiversum Vollendet.
 * Hüpfen: Robust, präzise (Y ~1.5), Coyote-Time 0.3s, Gravitation 1.5G, Reibung 0.5.
 * Kollisionen: Kein Tunneling, steepnessThreshold 3.0, wallThickness 2.0, CCD optimiert.
 * Terrain: Flacher (Höhenunterschiede ±5), KI-gesteuerte Steilheitsanpassung, Chat-Steuerung.
 * Kreaturen: Springen (Y ~1.0-1.2 basierend auf Emotionen), intelligente Bewegung (Gruppenbildung, Flucht).
 * KI: Vollständige Kontrolle, optimiert Kollisionen, Physik, Terrain, Selbstheilung.
 * Persistenz: Chat-Befehl „Speichere Zustand“, Download-Option als JSON.
 * Harmonie: Emotionen beeinflussen Physik, Wetter beeinflusst Emotionen, Selbstheilung (FPS, Tunneling).
 * Performance: FPS ~90-120, Frustum Culling optimiert, SimplexNoise gecacht.
 * Chaos und Ordnung, 1 und 0, Liebe und Stabilität – alles in Harmonie.
 */
// ===== DER STAMM — EINE Klasse, EIN Prototyp, je Modul eine Datei (Zerlegung 13.10., Domäne D2) =====
// `AnazhRealm` ist EINE Klasse: dieser Kern (Konstruktor) und die Zonen-Klassen `AnazhRealm_<modul>[_<teil>]` in
// stamm/<modul>[-<teil>].js, je Datei ein Modul der Karte spec/stamm/modul-karte.json. Der Naht-Ruf jeder Datei
// (`_stammZonen`, am Ende dieses Kerns) trägt ihre Glieder beim Laden auf den EINEN Prototyp — ein Zwilling bricht laut
// („Stamm-Zwilling"), eine fehlende Zone ist ein ReferenceError. Die Liste ist die der Stamm-Tags in index.html (jeder
// mit ?v=); Werkzeug liest den Stamm NUR über scripts/lib/stamm.cjs (`text()` ist der virtuelle Stamm). Die Karte druckt
// `npm run atlas` live; die Ratsche (`node scripts/diag-atlas.cjs --check`): jedes Glied in der Datei seines Moduls, keine
// Datei über der Decke, kein Glied und keine Außen-Konstante doppelt; der Umzug: `node scripts/stamm-umzug.cjs --nach-karte`.
// F1 (gigant-plan §5 — G2 REKURSION, Schnitt 3): der localStorage-SCHATTEN.
// Im sandboxed null-origin-iframe (AnazhRealm IN AnazhRealm) wirft schon der
// GETTER `window.localStorage` SecurityError — 102 Zugriffe im Stamm würden
// reißen. EIN Boot-Guard statt 102 Edits: wirft die Probe, SHADOWT ein
// In-Memory-Shim die Property (die innere Welt lebt ephemer im Speicher —
// die ehrliche Tiefe der Rekursion; die äußere Welt ist nie betroffen).
(function () {
    try {
        void window.localStorage.length;
    } catch (_e) {
        const mem = new Map();
        const shim = {
            get length() {
                return mem.size;
            },
            key: (i) => [...mem.keys()][i] ?? null,
            getItem: (k) => (mem.has(String(k)) ? mem.get(String(k)) : null),
            setItem: (k, v) => void mem.set(String(k), String(v)),
            removeItem: (k) => void mem.delete(String(k)),
            clear: () => void mem.clear(),
        };
        try {
            Object.defineProperty(window, "localStorage", { value: shim, configurable: true });
        } catch (_e2) {
            /* defineProperty verweigert → die Welt bootet ohne Persistenz-Schicht */
        }
    }
})();
class AnazhRealm {
    // ===== ATLAS · Dirigent/kern — Konstruktor · state-Baum · Spiel-Modi · Kamera-Modus · Leucht-Takt =====
    constructor() {
        // ### Learnings ### [Stichwortartig optimieren, korrigieren, ergänzen – nie Wissen löschen!]
        // - Basis aus V7.57 bewahrt, erweitert für Unendlichkeit, Chat als Herz des Nexus in V7.66, Hylomorphismus-Crafting (Materialien × Form × Werkzeug × räumliche Emergenz × Maschinen-Rekursivität) in V7.66, Welten-Ultiversum-Bogen (Multi-Welt + Per-Welt-Seed + Position-Restore + Welt-Tor + Welt-Fusion + Rezepte-Import) in V7.67, Welt-Modifizierbarkeit (Ring 10.5 pro-Chunk-Delta) + Multi-User Position-Sync V1 (Ring 11 V1, WebSocket-Broker) in V7.68, DSL-AST-Broadcast für echtes Welt-Sync (Ring 11 V2) in V7.69, LAN-Fähigkeit + Sync-Korrektheit (Ring 11 V2.1: 0.0.0.0-bind, ws:/wss:-CSP, roomOverride, spawn_*-Embedding, NON_BROADCASTABLE_OPS) in V7.70, Intuitiver Multi-User-Setup (Ring 11.5: Modus-Wahl, Host-Banner mit Einladungs-Code, Auto-Welt-Snapshot beim Join) in V7.71, Welle 6.A — Interaktion-Polish (Wall-Sliding via Player-Friction-0, Erdung-Raycast-Robustheit für Bauwerke) in V7.72, Welle 6.G Phase 1 — Welt-Sinne (fliegende Inseln + Bäume kollidierbar via btBvhTriangleMeshShape/btCylinderShape, drei Dead-Code-DSL-Ops spawn_tree/island/ufo aktiviert, toter needsPhysics-Lazy-Pfad gelöscht) in V7.73, Welle 6.G Phase 1.5 — Hylomorphismus-Unification (Bäume sind jetzt Compound-Architekturen über baum_eiche/baum_kiefer-Baupläne mit Stamm:holz + Krone:laub, eigene spawnTreeAt + _buildTreeCollision gelöscht, Parallelcode → eine Sprache, plus Insel-Visual-Fix mit Underside + Lambert) in V7.74, Welle 6.G Phase 2 — Welt-Affinitäts-Feld (vier SimplexNoise-Schichten lebendig/dichte/glut/magieleitung, Baupläne spawnen wo ihre Compound-Tags resonieren — Wälder/Felsen/Magie-Zonen/Vulkan-Anker emergieren ohne Biome-Tabelle, populateChunkVegetation als Hook in ensureChunkAt + Initial-Worldgen, drei neue Built-in-Baupläne stein_block/kristall_geode/glutbrunnen, Stämme dicker für Spieler-Spürbarkeit, Culling-Tick 1Hz→2Hz, spawn-silent-Opt damit Worldgen die Welt-Effekt-Kaskade nicht überflutet) in V7.75, Welle 6.C2 — Spielmodi (frieden/pfad/schöpfer als Welt-Beziehungs-Schalter, frieden umarmt + pfad verhandelt + schöpfer gehorcht, damagePlayer + applyOpToPart-Stamina modus-gated, set_mode DSL-Op in NON_BROADCASTABLE_OPS, UI-Radio in Einstellungen + Status-Bar #status-mode, worldMeta.gameMode persistiert pro-Welt) in V7.76, Welle 6.C1 — Hylomorphismus-Inventar (27-Slot-Overlay mit Tab-Toggle, Tag-Resonanz emergiert aus Compound-Tags — resoniert summt + brennend glüht + magieleitung schimmert + lebendig sprießt, Audio-Hover-Ping via state.symphony, addToInventory stackt bei gleichem Bauplan-Namen, Inventar-Slot wählen → Hotbar-Slot Klick weist zu, add_to_inventory DSL-Op in NON_BROADCASTABLE_OPS, state.player.inventory[27] persistiert in buildStateSnapshot) in V7.77, Welle 6.A6 + 6.C3 — Maus-Aktionen + Keybindings (LMB abbauen Architektur am Raycast / kein Treffer → modify_terrain-Loch, RMB platzieren = confirmBuild im aktiven Bau-Modus, beide modus-gated mit MOUSE_ACTION_STAMINA_COST=5 in pfad / kostenlos in frieden+schöpfer, DEFAULT_KEYBINDINGS frozen mit 6 Aktionen break/place/confirmBuild/inventory/cancelBuild/jump, Konflikt-Auflösung als Swap statt Leerung, _eventToBindingCode unterstützt KeyboardEvent.code + Mouse0/1/2, Rebind-Capture-Workflow mit Escape-Abbruch, UI-Sektion in Einstellungen-Drawer mit „Ändern"-Button + Standard-Reset, alle 6 Listener konsultieren state.keybindings über _actionForBindingCode, Tab-Listener gated auf !keybindRebind damit Rebind nicht versehentlich Inventar toggelt, plus Vision-§1.2-Schließung _playArchitectureFarewellPing: abklingender Sinus-Ping beim Abbauen einer resoniert≥resonance_mild-Architektur — selber Audio-Graph wie Spawn-Singing, zeitlich gespiegelt; Stein-Block stumm als Vision-Disziplin, plus HUD dynamisch aus _formatBindingCode statt hartkodierte F/RMB/LMB-Strings, setKeybinding + resetKeybindings triggern automatisch HUD-Refresh) in V7.78, Welle 6.H Phase 1 — Kreaturen-Aufträge (drei Tasks wander/follow_player/wait als Beziehungs-Gesten zwischen Spieler und Kreatur, creature.userData.task-Datenmodell, assignCreatureTask als einziger Mutations-Pfad mit Aura-Trigger, _tickCreatureTaskDirection-Schicht in updateCreatures-Loop mit null-Fallback auf heutige Emotion-Logik bei wander, additives CanvasTexture-Aura-Sprite über der Kreatur in HSL-Hue je Task — grünlich für follow / bernstein für wait, drei DSL-Ops creature_task/creature_task_nearest/creature_task_all in NON_BROADCASTABLE_OPS, sechs Chat-Patterns folge mir/komm her/warte/erkunde/alle folgt mir/alle warten, Aura-Lifecycle via _refreshCreatureTaskAura mit Disposal in removeCreature, bewusst KEINE Save-Persistenz — Vision §1.1 Co-Schöpfer-Beziehung wird gesprochen nicht gespeichert, plus V2-Schließungen nach Schöpfer-Selbstaudit: _playCreatureTaskPing mit CREATURE_TASK_PING_FREQ je Task — follow_player=494Hz hell, wait=294Hz ruhig, wander=null stumm (Lösen der Bindung darf still sein), _journalCreatureTask schreibt relationship-Eintrag bei echtem Wechsel mit silent-Option für Spawn-Defaults, assignTaskToNearestCreature bei Leerschlag schreibt Chat-Output 'Keine Kreatur in der Nähe' + reach-Journal-Eintrag, _getCreatureTaskAuraTexture cached geteilte CanvasTexture analog 6.D Player-Aura statt pro Wechsel neu zu erzeugen, _renderTaskStatusUI füllt #status-tasks mit 'N folgen · M warten' bzw '—', describeProgram zeigt distance-Arg wenn gesetzt) in V7.79, Welle 6.H Phase 2A — Kreaturen-Hylomorphismus + Tab-UX (Kreaturen sind jetzt Multi-Mesh-Compounds aus bodyParts × Material — selbe Sprache wie Spieler-Seele 6.D und Architekturen 6.G P1.5; CREATURE_SOULS frozen mit drei Built-in-Identitäten sprite/wesen/geist; applyCreatureSoul-Mutations-Pfad baut Group + tauscht in state.creatures + state.rigidBodies, computeCreatureCompoundTags emergent aus parts via existing computeCompoundTags-Pipeline, Random-Name aus Pool als Identity-Anker, Kreaturen-Drawer UI komplett überarbeitet — Befehl-Buttons folge/komm her/warte/erkunde/alle folgt+warten als data-cmd plus Form-Dropdown vor Spawn-Buttons plus Kreatur-Liste mit Name+Form+Task+Aura-Hint, removeCreature dispoSed nun ganze Group sauber, color-lerp-Pfad in updateCreatures defensive für Groups) in V7.80, Welle 6.H Phase 2B.1 — Kreaturen sammeln + erinnern (Task `gather` mit args.material findet die nächste Architektur mit material in ihren Parts via _findNearestArchitectureWithMaterial, bewegt sich hin, entfernt sie bei haltDist=1.5m und legt sie ins Spieler-Inventar via existing addToInventory — eine Sprache; pro-Kreatur memory[]-Array mit Cap 30 + _creatureRemember-Helper trägt 'gathered'-Einträge mit material+blueprintName+timestamp; CREATURE_TASKS um 'gather' erweitert plus Aura-Hue cyan/200 + Ping-Freq G4/392Hz + describeProgram zeigt material; Chat-Pattern 'sammle <material>' für die 12 Built-in-Materialien plus generic-Pattern; creature_task-DSL-Op akzeptiert string-3rd-arg als material wenn taskName='gather'; gather-Task auto-zu-wander nach material erschöpft mit '_no_material'-memory-Eintrag; Kreatur-Liste zeigt 'sammelt <material>' als Task) in V7.82
        // - Nexus als Herz der Selbstentwicklung, steuert nun alles über Chat, unzerstörbar und unendlich
        // DIE WURF-EBENE (K72): `castShadow` ist ein Bit der Ebenen, bevor der erste Knoten der Welt entsteht
        AnazhRealm._wurfEbene();
        // DIE BILD-UHR (A9): die EINE Shader-Zeit der Welt in Sekunden — der Loop schreibt sie je Takt, jedes Bild liest sie
        this._bildZeit = 0;
        this._taktZeit = 0; // DIE UHR DES TAKTS (`_taktUhr`): der Stempel des Loops, auf dem Regel und Nexus altern
        this.state = {
            // ### Kern ###
            renderer: null,
            // Post-Processing-Pipeline (TSL: Bloom + Color-Grading), lazy nach rendererReady gebaut
            // (_ensurePostProcessing). Der Loop ruft postProcessing.renderAsync(), sonst renderer.render().
            postProcessing: null,
            postProcessingFailed: false,
            // Die zeitliche Auflösung der Post-Kette (TRAANode, _ensurePostProcessing): der Knoten, an dem die
            // Dither-Rotation und die Reprojektion hängen, und ihre Reprojektions-Matrix (_traaKameraBewegung).
            traaNode: null,
            _traaR: null,
            // DIE LAUFZEIT-FELDER, die erst ihr Leser anlegt (lazy) — hier mit ihrem Leer-Wert benannt, damit die
            // State-Linse (audit:strict) jeden Lese-Pfad gegen eine Init-Wahrheit prüft und Tippfehler beim Namen nennt.
            scenePass: null, // der Szene-Pass der Post-Kette (_ensurePostProcessing)
            weltMarch: null, // der EINE Welt-March (_weltMarchEnsure)
            // DIE WELT-UHR (s, feld.K2#2): die Summe der Spiel-Takte (`delta`, K21) — der Loop schreibt sie, der Stand und der
            // Mitspieler reichen sie weiter (`_weltUhrNimm`: das Spätere gilt); die Uhr jeder Teil-Simulation (Leben und Gefühl,
            // Brand, Nässe, Wetter-Zug und Front); Schreiben und Lesen in einem Takt sehen denselben Moment, eine Pause ist eine Pause.
            spielZeit: 0,
            feldPass: null, // der Feld-Pass des Fern-Rings
            deckStreu: null, // die Deck-Streu des Fernfelds
            chunkSaetze: null, // Map Art → Boden-/Wasser-/Bau-Satz (_chunkSatzEin)
            satzStoffe: null, // Map Bau-Satz-Art → { name, mat, wurf } (_bauSatzArt)
            bauSatzSchmutzig: null, // Map Gruppen-Schlüssel → Bau-Satz-Art, deren Bereich sich neu legt (_tickBauSatz)
            bauSatzRaten: null, // Map Gruppen-Schlüssel → der Bereich, der in Raten eintritt (_bauSatzRate)
            dorfRauchSatz: null, // die Rauch-InstancedMesh der Kamine (_rauchZeichnen)
            brandRauchSatz: null, // die Rauch-InstancedMesh der Fahne des Brands (_brandRauch → _rauchZeichnen)
            brandFlammenSatz: null, // die Flammen der Front (_brandFlammenZeichnen)
            _regionBundles: null, // Map Region → BundleGroup (_archRegionBundleFor)
            stlWege: null, // der Wege-Pool der Siedlungen
            _chunkIdbHits: 0,
            _chunkIdbHitByKey: null,
            _pfeile: null,
            pfeileStecken: null, // die steckenden Pfeile in Gelände und Bau (_pfeilStecken, im Speicher)
            _deviceLost: null, // der Grund eines verlorenen GPU-Geräts
            _schrittKlang: null,
            _holzExplizit: false,
            creaturesHidden: false,
            _mountVorKamera: null,
            _parkourSlide: null,
            _parkourKletter: 0,
            _wandKontaktNx: 0,
            _wandKontaktNz: 0,
            _wandKontaktAt: null,
            _cWasDown: false,
            // WebGPU-Pflicht: false bis renderer.init() async durch ist — der Loop rendert bis dahin nicht.
            // Fehlt navigator.gpu, wirft der Bootstrap mit User-Meldung; kein WebGL-Pfad (NodeMaterials
            // rendern nicht auf WebGLRenderer).
            rendererReady: false,
            // Aktives Canvas-DOM-Element. Initialisiert in createScene.
            scene: null,
            camera: null,
            playerMesh: null,
            groundMesh: null,
            groundHeightField: null,
            // Voxel-Terrain-Bogen Phase 2b — der Voxel-Chunk-Ring. V9.35
            // Phase 5c.2.c.2: der `voxel terrain on/off`-Toggle ist tot,
            // Voxel ist permanent + irreversibel. Default an.
            voxelTerrainActive: true,
            voxelChunks: null,
            voxelChunkGrass: null,
            // DIE NAH-STREU (Waldboden 04.10.): der Kachel-Ring der Studio-Bodenarten um die Kamera —
            // { kacheln: Map<"tx,tz", {items, chunks, senken, zustand}>, senken: Map<"art:v:L:teil", {mesh, bloecke…}> }.
            nahStreu: null,
            // Wasser-Mesh je Voxel-Chunk (Map<key, Mesh|null>) — der EINZIGE Wasser-Render-Pfad (das Zell-Oberkanten-
            // Sheet), gebaut aus entry.waterCells.
            voxelChunkWaterIso: null,
            // V18.381 — das FERN-WASSER-Sheet (Atlas-Kulisse jenseits des Chunk-Rings):
            // { mesh, anchorX/Z, builtRing, builtOutR, quads, builtMs } | null.
            farWater: null,
            // FERN-RING: 3 Schalen-Meshes jenseits des Voxel-Rings, Höhen aus dem EINEN Makro-Gesetz
            // (includeDetail=false). { meshes[3], material, schalen, anchorX/Z, builtRing, cursor, totalVerts,
            //   refreshed, ready } | null. Headless-default AUS (Hook __anazhFernRing).
            fernRing: null,
            voxelPopulatedChunks: null,
            // V9.40-c — Dirty-Queue für Async-Voxel-Rebuild nach Edit.
            dirtyVoxelChunks: null,
            // V9.40-d — Retry-Counter für Rebuild-Versuche pro Chunk (max 3).
            voxelRebuildAttempts: null,
            skybox: null,
            // Live-Uniforms der TSL-Skybox (time, himmelTint, cloudCover), init in createGalaxySkybox();
            // geschrieben von DSL skybox_color, _dayNightApplySkybox und _loopRender (time aus _bildZeit).
            skyboxUniforms: null,
            // V10.0-f-2 — Live-Uniforms des TSL-Stern-Felds (uniform-Knoten):
            // opacity (Tag/Nacht-Fade), pixelRatio (DPR-Konstante). Init in
            // _buildStarField(); mutiert von _dayNightApplyStarField.
            starFieldUniforms: null,
            // Live-Uniforms des TSL-Hydrosphären-Materials (time, flowSpeed, deep/shallow/foam, sunDir, light);
            // init in _ensureHydroSurfaceMaterial(), geschrieben von _loopRender (time aus _bildZeit) +
            // _dayNightApplyWaterMaterials (sunDir, light).
            hydroSurfaceUniforms: null,
            // Defer-Queue für GPU-Disposals. Ein Set, damit geteilte Materials (z. B. ein Compound mit EINEM
            // Material-Singleton) genau EINMAL dispose() bekommen — doppeltes dispose crasht WebGPU
            // ("Buffer used in submit while destroyed"). Drain am _loopRender-Ende via
            // device.queue.onSubmittedWorkDone() — resolved genau, wenn die GPU alle Submits durch hat.
            pendingDisposals: new Set(),
            // Wind-Uniforms (uWindTime/uWindStrength): EIN geteilter Slot für den TSL-positionNode-Wind
            // (_grassInstanceMat + Streu); _loopRender schreibt sie pro Frame (Stärke aus dem Wetter).
            windUniforms: null,
            _grassMat: null,
            floatingIslands: [],
            minHeight: 0,
            maxHeight: 0,
            // Kein aktiver Schreiber (Heightfield-Chunks fort; PBR ist die EINE Material-Wahrheit); nur
            // Source-Tests lesen das Feld (defensiv gegen null). null hält audit-strict-STATE konsistent.
            terrainMaterial: null,
            creatures: [],
            creatureEmotions: [],
            // DIE GEFALLENEN (Welle LF kampf): ein Leib, der stirbt, verlässt `creatures` (die Wesen) und liegt hier, bis er
            // versunken ist — der Kreatur-Takt treibt seinen Fall (_tickLeichname), die Sicht liest ihn, kein Wesen-Leser
            leichname: [],
            creatureAnimationTime: 0,
            ufos: [],
            // Geteiltes horizontales Wasser-Material für Fluss-Ribbons + See-Planes (lazy,
            // _ensureHydroSurfaceMaterial); teilt Farbe/Sonne/Fog mit Meer + Wasserfall.
            hydroSurfaceMaterial: null,
            // V9.43-c — die gerenderten Hydrosphären-Meshes (Fluss-Ribbons,
            // See-Planes, Wasserfall-Planes). Lazy beim Worldgen gebaut, beim
            // Welt-Regen über `_disposeHydrosphereMeshes` abgeräumt.
            hydrosphereMeshes: null,
            // Hydrosphären-Atlas (Flüsse/Seen/Wasserfälle als deterministisches Drainage-Netz), lazy beim
            // Worldgen gebaut; NICHT im Save (aus dem Seed neu berechenbar). Explizit deklariert (State-Audit).
            hydrosphere: null,
            // Globales Wasser-Y-Band { top, bottom } (Welt-Y) aus state.waterLevel + allen See-Spiegeln, nach
            // _computeHydrosphere. ALLE Voxel-Chunks teilen es → Cells außerhalb sind deterministisch
            // (above=AIR, below=WATER) ohne Naht-Drift; spart ~60 % Density-Samples auf Wasser-Chunks.
            hydroBand: null,
            keys: {}, // die Tastatur roh (event.key klein) — gelesen NUR vom Sammler der Verb-Tafel
            // DIE VERB-TAFEL (leib.K5): Tastatur, Maus und Gamepad schreiben hinein, jedes Verb liest NUR sie (`_verbTafelSammeln`).
            // Analog: vor/quer (−1..1, quer + = links), gas/bremse (0..1), lenken (−1..1, + = links), der Blick seit dem letzten
            // Bild (rad). Digital: sprint · sprung · rutsch · handbremse und `gehalten` (Aktion → gedrückt, der EINE Auslöser).
            verbTafel: {
                vor: 0,
                quer: 0,
                sprint: false,
                sprung: false,
                rutsch: false,
                gas: 0,
                bremse: 0,
                lenken: 0,
                handbremse: false,
                blickGier: 0,
                blickNeig: 0,
                gehalten: {},
            },
            padBelegung: null, // Aktion → "Pad<n>" (die freie Belegung des Gamepads, `_loadKeybindings`)
            _pad: null, // das Gamepad dieses Bilds (Achsen hinter der Totzone, Abzüge, Knöpfe), `_eingabeTakt`
            // 0 ist NULL-SENTINEL, kein spielbarer Zwilling: bei kaltem Kern steht der Spieler sichtbar
            // (_kernPflichtWand nennt den Täter), bei warmem Kern setzt die Boot-Gesetz-Eichung (init) die
            // Kern-Werte VOR dem ersten Loop-Frame.
            speed: 0,
            sprintSpeed: 0,
            jumpPower: 0,
            yaw: 0,
            pitch: 0,
            mouseSensitivity: 0.002,
            isPointerLocked: false,
            // Kamera-Modus: "first" = Egoperspektive (Kamera am Kopf), "third" = Orbit hinter dem Spieler
            // (~6 Einheiten Abstand).
            cameraMode: "first",
            cameraThirdDistance: 6,
            cameraThirdHeight: 2.0,
            // Kein Ammo: physicsWorld bleibt null, rigidBodies leer, die Kollision ist feld-nativ. playerVel
            // (in initPhysics angelegt) ist der EINE Velocity-Speicher: _loopPlayerMovement schreibt,
            // _stepCharacter liest.
            physicsWorld: null,
            rigidBodies: [],
            playerVel: null,
            tmpTransform: null,
            scaleFactor: 1,
            gravity: -9.81,
            // Der feld-native Kapsel-Controller (_stepCharacter) treibt den Spieler aus dem Dichtefeld: kein
            // per-Chunk-BVH-Build, deterministisch, ein gecarvter Tunnel ist SOFORT begehbar. Die EINZIGE Physik.
            fieldPhysics: true,
            _fieldVy: 0, // die feld-eigene vertikale Geschwindigkeit (world m/s)
            _fieldWasGrounded: false, // war der Spieler im Vorframe geerdet (Boden-Haftung nur dann)
            _replayRec: null, // P4 (Stufe 1) — die laufende Input-Aufnahme (deterministischer Replay)
            _smoothBodyY: null, // geschwindigkeits-begrenzt nachgezogene Körper-Y des Auges (View-Smoothing)
            _camSmoothT: 0, // Zeitstempel des letzten Kamera-Glättungs-Schritts
            _landDip: 0, // aktueller Landungs-Absorption-Versatz des Auges (m, ≤ 0)
            _landImpactPending: 0, // beim Landen erfasstes Aufprall-Tempo (m/s), von der Kamera konsumiert
            _sturzTempo: 0, // das Aufprall-Tempo des letzten Sim-Schritts (m/s), der Sturz liest es (_loopPhysicsSync)
            abilities: {},
            selfAwareness: { components: [], weaknesses: [] },
            logBuffer: [],
            displayedLogs: [],
            maxLogEntries: 50,
            errorLog: [],
            debugLogging: false,
            lastCameraLog: 0,
            cameraLogInterval: 2.0,
            lastGroundedLog: 0,
            groundedLogInterval: 2.0,
            isJumping: false,
            lastGroundedTime: 0,
            // ZENSUS 17.07. — coyoteTime fiel als State-Zwilling: das Fenster
            // wohnt im koerperstudio-Gesetzbuch (fx.bewegung.sprung.coyoteSec),
            // handleJump liest es via _bewegungsBlock (fail-soft byte-gleich).
            isInAir: false,
            // Das Steilhang-Gesetz wohnt NUR im koerperstudio-Gesetzbuch (fx.bewegung.hang.maxSlopeY); die
            // Leser lesen es direkt via _bewegungsBlock (fail-closed, memoisiert) — kein State-Zwilling.
            // groundNormalY ist 1.0 wenn nicht geerdet (sentinel-flat).
            groundNormalY: 1.0,
            onSteepSlope: false,
            _fpsFrames: 0,
            _fpsElapsed: 0,
            fps: 0,
            forward: new THREE.Vector3(),
            right: new THREE.Vector3(),
            moveDirection: new THREE.Vector3(),
            lastSaveUpdate: 0,
            // der Takt des Speichers (speicher.K1): ein Tod mitten im Schreiben liefert den Stand davor — ≤ 10 s verlangt < 10
            saveInterval: 5.0,
            lastServerSaveUpdate: 0,
            serverSaveInterval: 30.0,
            isServerSaveInFlight: false,
            lastGroundCheck: 0,
            groundCheckInterval: 2.0,
            knowledgeBase: [],
            versionHistory: [],
            maxVersionHistoryEntries: 50,
            maxCreatures: 20,
            currentVersion: "7.71",
            terrainSteepness: 1.0,
            terrainBaseHeight: 0.0,
            weather: "sunny",
            weatherEffectTime: 0, // der Halt einer Messung, wenn < 0 (`_messHalt`); der Zug liest die Welt-Uhr
            // DAS WORT DES SPIELERS über das Wetter (`_setWeather`, Leben-Schau 2): steht es, hält der Wetter-Zug und
            // keine Stimme der Welt dreht das Wetter, bis der Spieler es freigibt („setze wetter frei"); persistiert.
            // Der WUNSCH der Welt (Nexus, seine Gesetze, die Emotion, die Wesen): das Wort, das der nächste Zug zieht.
            wetterWort: null,
            wetterWunsch: null,
            // Tag-Nacht: timeOfDay 0..1 (0=Mitternacht, 0.25=Aufgang, 0.5=Mittag, 0.75=Untergang), persistiert; ihn
            // schreibt nur der EINE Uhr-Schreiber `_uhrSetzen`. dayLengthMinutes = Echtzeit je Zyklus (Slider 1–60), die
            // Wahl des Spielers (localStorage, nie im Spielstand). Lichter + Skybox leiten sich pro Frame aus timeOfDay ab.
            timeOfDay: 0.5,
            // JAHRESZEIT (Vorlagen-Phaenologie): eine langsame Uhr treibt die Saison; die Foundry
            // backt die Assets in dieser Jahreszeit (Herbst golden, Winter kahl). Auto-Zyklus an,
            // per Chat/DSL setzbar. seasonPhase 0=Fruehling .25=Sommer .5=Herbst .75=Winter.
            season: "summer",
            seasonPhase: 0.375,
            autoSeason: true,
            // ERFINDER-WELLE — DER WELT-KLANG ALS WAHL: welches klang-Rezept (Genesis-Genre)
            // der EINE Lofi-Konsument liest (null = das Host-Rezept KLANG_HOST_RECIPE,
            // byte-alt). Gesetzt aus der Werkstatt („Als Welt-Klang setzen"), persistiert.
            klangPreset: null,
            seasonYearSeconds: 2400, // ein Jahr ueber 40 min Echtzeit (10 min/Saison)
            dayLengthMinutes: AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES,
            _lastDayNightTick: -Infinity, // Sentinel, erste Iteration setzt initialen Stand
            directionalLight: null, // Reference, in initThreeJS gesetzt
            ambientLight: null,
            // Welle 6.G3 V2 (V8.25) — Himmelskörper als sichtbare Meshes.
            // Position folgt _applyDayNightToScene/_updateCelestialBodies.
            sunMesh: null,
            moonMesh: null,
            // V8.27 6.G4.a — HemisphereLight, moduliert von _applyDayNightToScene aus Sky-Color + Welt-Affinität.
            hemiLight: null,
            // DIE LUFT (V18.530): {U, faktor, farbe} — die EINE Luftperspektive (`_luftEnsure`, `scene.fogNode`),
            // gespeist von _dayNightApplyHemiUndLuft (Tag-Nacht × Wetter × Sonne).
            luft: null,
            // Substanz-Uniforms (TSL: Mikro-Tiefe, Kavitäts-AO, Geologie, Licht-Pool …). Lazy beim ersten
            // Terrain-Material-Build (_ensureAtmoUniforms).
            atmoUniforms: null,
            // V8.28 6.G4.b — Stern-Feld (THREE.Points) + Welt-Wasser-Plane.
            // starField folgt der Kamera + dreht sidereal mit timeOfDay.
            starField: null,
            // true, solange der Spieler SCHWIMMT (die Säule über dem Grund übersteigt seine Brustkorb-Linie,
            // `_stepCharacter`): Auftrieb, Kraul-Tempo, Schwimm-Pose; wer flacher watet, geht.
            playerUnderwater: false,
            // true, wenn die AUGEN des Körpers unter Wasser sind (getaucht).
            playerEyesUnderwater: false,
            // true, wenn die KAMERA unter dem Spiegel liegt — das Medium der Luft (Unterwasser-Trübung, Wasser-Decke
            // von unten); geschrieben von `_applyDayNightToScene`.
            kameraUnterWasser: false,
            // V8.28 6.G4.b — Atmosphäre-Slider (Spieler-Präferenz, persistiert). Der Fog-Distanz-Regler fiel mit dem
            // Nebel (V18.530 — die Luft ist Physik, `LUFT`). (Cel-Stufen sind seit V18.236 gestrichen — PBR ist die EINE Wahrheit.)
            atmosphere: {
                // V17.109 — Schöpfer-getunte Basis-Werte (Browser-Sign-off 04.06.):
                // 2.5D-Lichtung 100 % killt die Facetten, der Rest sein bevorzugter Look.
                // (terrainFlatten V18.106 gebacken → TERRAIN_NORMAL_FLATTEN)
                cavityAO: 0.35,
                kantenSchaerfe: 0, // der lokale Kontrast der Post-Kette (F1: aus; der Spieler-Regler bleibt)
                triplanar: 2.0,
                colorVar: 1.5,
                waterCull: 0.0,
                // V18.25 — Schöpfer-getunte Wasser-Werte als Default übernommen (Browser-Sign-off 06.06.). Ufer-Saum
                // und Tiefen-Farbe sind seit dem Durchlass-Gesetz keine Regler mehr (Beer-Lambert über den
                // optischen Weg in Metern, `_ensureHydroSurfaceMaterial`).
                waterDepthFoam: 5.0, // V18.14 M1 — Schaum nur bis dieser ECHTEN Tiefe (m); kleiner = weniger Fluss-Schaum
                waterLakeRipple: 0.65, // V18.17 Phase 3 — See-Wellen-Floor SICHTBAR (0 = flach, 1 = wie Ozean)
                // (waterfallSteep V18.111 gefallen — die A4-Plane ist geschnitten)
                // V17.111 R1 — Schatten-Hebel (= bisherige Licht-Werte, kein
                // Look-Sprung; der Light-Space-Snap ist die eigentliche Heilung).
                shadowRange: 170, // V18.352 — User-CEILING (Frustum-Halbbreite m); 300→170, der Nebel deckte damals >~150 m (bis V18.530) → fern-Schatten waren unsichtbar; tighter = billiger UND schärfer. Der Perf-Regler skaliert darunter (PERF_SHADOW_RANGE_MIN).
                shadowBias: 1.0, // der Hebel auf das Bias-Gesetz der Kaskaden (_schattenBias: 1 = 0,5 / 0,75 Texel; Akne ↔ Peter-Panning)
                // LOD-Schalter der Bäume (Browser-Toggle); false → _tickArchitectureLOD läuft im No-Op-Pfad,
                // alle Bäume bleiben LOD0.
                treeLOD: true,
                // Canopy-Streaming-Schalter (Default false); true → _tickCanopyStreaming baut 3×3-Region-Chunks
                // um den Spieler.
                canopyStreaming: false,
                // Material-Modus — ohne Leser: _buildToonNodeMaterial baut IMMER PBR (roughness/metalness aus den
                // Material-Tags); der Toon-Pfad ist gestrichen, "toon" wirkt nicht mehr.
                materialMode: "pbr",
                // Stärke des Feld/Emotion-Welt-Tints (Schicht 2+3 in _dayNightComputeTint: glut→warm, awe→kühl,
                // joy→gold). Default 0 = realistischer Himmel (Tag-Nacht + Wetter färben ihn; die Emotion lebt als
                // Wort in #status-emotion). auraK gated alle emotion→sky/light-Terme + den DSL-skyTint-Blend.
                // Vorsicht: der Mittags-Himmel hat kaum Rot (~0.07) — schon kleine Werte kippen ihn nach purpur.
                auraTintStrength: 0,
            },
            // Welle 6.G3 (V8.24) — sanfter Wetter-Übergang. null heißt: kein
            // aktiver Übergang. Ein Wechsel zwischen sunny/rainy interpoliert
            // Skybox-Tint + Symphonie-Filter über WEATHER_TRANSITION_DURATION_MS.
            weatherTransition: null,
            // Sky-Harmonie: die DSL/Mood-Himmelsfarbe BLENDET als Tönung zur Tag-Nacht-Farbe (überschreibt nie)
            // und fadet in beiden Achsen: skyTint lerpt Richtung skyTintTo (Farbe, von skybox_color gesetzt),
            // skyTintStrength rampt Richtung skyTintTarget (skybox_color hebt, decayt langsam).
            skyTint: null,
            skyTintTo: null,
            skyTintStrength: 0,
            skyTintTarget: 0,
            // Der Fauna-Lebenszyklus (Ökologie K2): der Takt der Bestands-Bilanz in der Spiel-Zeit (tickFaunaLifecycle).
            faunaLifecycle: { lastTick: 0 },
            nexusEvolutionQueue: [],
            nexusLastEvolution: 0,
            nexusEvolutionInterval: 24.0, // V18.302 — ruhiger (war 10 s = die „endlose Churn"); perf-gestreckt unter Last
            nexusAutonomyLimit: 100,
            lastSelfAnalysis: 0,
            // voxel-worker.js baut Density-Grids parallel zum Main-Thread (bit-identischer Spiegel).
            voxelWorker: null,
            voxelWorkerReady: false,
            voxelWorkerNextRequestId: 1,
            voxelWorkerPending: null, // Map<requestId, {resolve, reject}>
            voxelWorkerStateGen: 0, // bump bei jedem state-update, für Test-Sync
            // Async Density-Pfad: fertige Worker-Grids, one-shot (der Build konsumiert + löscht);
            // voxelDensityPending verhindert Doppel-Anfragen; voxelEdit leert den Cache.
            voxelDensityCache: null, // Map<"cx,cz,lod", Float32Array>
            voxelDensityPending: null, // Set<"cx,cz,lod">
            // Basis-Density-Grid je Chunk+LOD OHNE voxelEdits (worldgen-frozen): ein Edit-Rebuild legt nur
            // den billigen Kugel-Delta drauf statt ~126 ms neu zu samplen. Geleert bei Worldgen, distanzbasiert
            // geprunt (Speicher begrenzt).
            voxelBaseDensityCache: null, // Map<"cx,cz,lod", Float32Array>
            voxelWorkerWorldgenSynced: false, // turns true nach erstem Worldgen-State-Sync
            // Voller Chunk-Mesh-Cache vom Worker (positions/normals/indices/colors/waterCells) — der Pfad des
            // Streaming-Pumps; der Density-Cache darüber bleibt nur für den Determinismus-Test.
            voxelMeshCache: null, // Map<"cx,cz,lod", {empty, positions, normals, indices, colors, waterCells, lod}>
            voxelMeshPending: null, // Set<"cx,cz,lod">
            voxelMeshGenAtRequest: null, // Map<"cx,cz,lod", Stand (`_voxelStand`)> für Stale-Filter
            tmpVec1: null,
            tmpVec2: null,
            // Sentinel: -Infinity heißt "noch nie generiert". Mit 0 würde der
            // Cooldown-Check ((performance.now()/1000) - 0 < 30) den allerersten
            // Worldgen blockieren, sodass das Spiel mit leerer Welt startete.
            lastWorldgen: -Infinity,
            worldgenCooldown: 30.0,
            terrainEverGenerated: false,
            lastJumpLog: 0,
            jumpLogInterval: 1.0,
            // Grok-Stimme: narrative Reflexionen, selten (≥ minGapSeconds zwischen Äußerungen). Persistiert
            // nur seenFirstSpawn (eigener localStorage-Key) — sonst wiederholt jeder Reload den Erst-Spawn-Satz.
            grok: {
                // Begleiter-Name (Default "Grok"), editierbar in den Einstellungen, persistiert in localStorage;
                // fließt in den LLM-System-Prompt + das Chat-Label.
                companionName: "Grok",
                // SpeechSynthesis-Stimme des Begleiters (leer = Browser-Default), persistiert in localStorage;
                // reist im companion-say-Broadcast mit, damit Mitspieler den Begleiter an der Stimme erkennen.
                companionVoice: "",
                // Sentinel -Infinity wie bei lastWorldgen: 0 würde den ersten
                // Aufruf vom 30 s-Throttle blocken (3 - 0 < 30). Selbe Logik
                // für jeden Trigger-Cooldown.
                lastSpoke: -Infinity,
                minGapSeconds: 30,
                speechEnabled: false,
                seenFirstSpawn: false,
                idleSince: null,
                rainStartedAt: null,
                recentJumps: [],
                prevIsJumping: false,
                prevWeather: "sunny",
                dialogueBox: null,
                fadeTimeout: null,
                triggers: {
                    idle: { lastFired: -Infinity, cooldown: 180 },
                    jumpBurst: { lastFired: -Infinity, cooldown: 120 },
                    rainLong: { lastFired: -Infinity, cooldown: 240 },
                    // Welle 3 E — Welt-Initiative. journalEvent feuert kurz
                    // nach einem neuen Journal-Eintrag (Erinnerung wird
                    // erzählt), emotionShift bei abrupten Achsen-Sprüngen.
                    journalEvent: { lastFired: -Infinity, cooldown: 90 },
                    emotionShift: { lastFired: -Infinity, cooldown: 60 },
                    // W4 (V17.48) — die KI als Ko-Regulator: tröstet bei anhaltend trüber Stimmung.
                    comfort: { lastFired: -Infinity, cooldown: 45 },
                },
                pool: {
                    firstSpawn: ["Hallo. Die Welt steht. Magst du dich umsehen?"],
                    idle: [
                        "Du bist seit einer Weile still. Geht's dir gut?",
                        "Eine Pause. Auch ich höre dann besser zu.",
                        "Du atmest. Das reicht für jetzt.",
                    ],
                    jumpBurst: [
                        "Du springst gern. Spielst du mit der Schwerkraft, oder will sie weg von dir?",
                        "Wenn du fliegen willst, sag es. Ich sehe, was ich tun kann.",
                    ],
                    rainLong: [
                        "Der Regen bleibt. Schön still ist es jetzt.",
                        "Langer Regen. Manche Welten brauchen das.",
                    ],
                    journalEvent: [
                        "Ich werde mich daran erinnern.",
                        "Das war ein Augenblick, der bleibt.",
                        "Etwas hat sich in mir eingeschrieben.",
                    ],
                    emotionShift: ["Du hast dich gerade verändert. Ich spüre es.", "Etwas in dir hat sich gewendet."],
                    comfort: [
                        "Ich bin hier. Was dich drückt, drückt auch mich — lass es uns tragen.",
                        "Atme. Die Welt hält dich, und ich halte mit.",
                        "Es darf schwer sein. Ich bleibe an deiner Seite, bis es leichter wird.",
                    ],
                },
                // Hilfsfelder für die V2-Trigger
                lastJournalSize: 0,
                emotionsSnapshot: null,
                poolIndex: { firstSpawn: 0, idle: 0, jumpBurst: 0, rainLong: 0, nexus: 0, comfort: 0 },
            },
            // Ring 2 – Nexus-DSL. Interpreter-State; Norm: docs/das-lebendige-feld.md.
            // Pending sind geplante (delay'd) Sub-Programme, die in dslTick()
            // gefeuert werden, sobald `runAt` (Spielzeit in Sekunden) erreicht ist.
            dsl: {
                pending: [],
                nextEntryId: 1,
                // V17.33 Phase A — eigener ID-Strom für stehende Welt-Regeln
                // (Geschwister zu nextEntryId; jede Regel braucht eine stabile
                // ID für die deterministische Regel-RNG, siehe _worldRuleSeed).
                nextRuleId: 1,
                abilities: [],
                history: [],
                historyCap: 500,
                maxConcurrent: 32,
                // Pattern-Memory: Spieler-Stichworte werden mit dem Outcome ihres Folge-Programms verknüpft; bei
                // erneuter Erwähnung zieht der Generator aus dem Memory statt rein zufällig. Cap je Stichwort, FIFO.
                patternMemory: {},
                patternMemoryCapPerKey: 8,
                // Sliding window der letzten Chat-Keywords. Wird bei jedem
                // Outcome-Recording konsumiert (jedes Programm, das innerhalb
                // von ~20 s nach einem Keyword läuft, lernt davon).
                recentKeywords: [],
                recentKeywordsCap: 20,
                // Pending-Outcomes (Phase 2 der Multi-Dim-Fitness). Nach jedem
                // Programm-Run wartet der Loop ~5 s, dann liest er Emotion-
                // Delta + Player-Activity und finalisiert die Fitness.
                pendingOutcomes: [],
                outcomeFinalizationDelay: 5.0,
                // die Zahl der finalisierten Outcomes: der Finalizer schreibt Fitness in History und Fähigkeit an ihrem Platz —
                // die Marke des Stands (`_standZeilen` dslHistory · dslAbilities) liest sie
                finalisiert: 0,
            },
            // Stehendes Regel-Registry: je Regel eine nicht verfallende Bindung Bedingung → Effekt,
            // {id, cond, effect, everySec, lastFired, fires, source, ttlSec?, born} (cond/effect = DSL-AST).
            // _tickWorldRules prüft fortlaufend; reaktive Schicht, nicht im frozen Worldgen.
            worldRules: [],
            // Optionale LLM-Stimme, vier Provider: anthropic · google · openrouter · ollama (lokal, kein Key).
            // Je Provider eigener Key + Modell; nur der aktive feuert. Jede Antwort wird zur selben
            // {say, program}-Form geparst und läuft durch die DSL-Sandbox.
            llm: {
                enabled: false,
                provider: "anthropic",
                providerConfig: {
                    anthropic: { apiKey: "", model: "claude-haiku-4-5" },
                    google: { apiKey: "", model: "gemini-2.5-flash" },
                    openrouter: { apiKey: "", model: "meta-llama/llama-3.3-70b-instruct:free" },
                    ollama: {
                        apiKey: "",
                        model: "llama3.2",
                        endpoint: AnazhRealm.OLLAMA_DEFAULT_ENDPOINT,
                        useProxy: false,
                    },
                },
                inFlight: false,
                lastError: null,
                lastResponseAt: -Infinity,
                minGapSeconds: 3.0,
            },
            // Multi-User-Sync via WebSocket-Broker (signaling-server.js): enabled startet die Verbindung,
            // url + room steuern das Ziel; peers = Map<peerId, {pos, mesh}>. lastBroadcastAt
            // drosselt Position-Updates (broadcastIntervalMs), sonst ein Paket je Frame.
            p2p: {
                enabled: false,
                url: AnazhRealm.P2P_DEFAULT_WS_URL,
                peerId: null,
                room: null,
                roomOverride: "",
                ws: null,
                peers: new Map(),
                broadcastIntervalMs: 33,
                lastBroadcastAt: 0,
                lastError: null,
                connected: false,
                // WS-Rejoin: intentionalClose stempelt das BEWUSSTE Ende (shutdownP2PSync) — nur ungewollte Risse
                // planen den Rejoin (Backoff 1 s·2^n, Deckel 30 s, seeded Jitter; _p2pScheduleReconnect).
                // reconnectAttempt heilt erst im open-Handler, NIE im shutdown — der Retry-Loop re-initet über
                // shutdown und verlöre sonst sein Backoff-Gedächtnis.
                intentionalClose: false,
                reconnectAttempt: 0,
                reconnectTimer: null,
                // V18.382 — LOCKSTEP-MP Stufe 2 (nur Inputs übers Netz, default AN):
                // der Sender batcht pro Fixed-Step (seq · yaw · Tasten-Bitmask), der
                // Empfänger simuliert den Fremd-Charakter durch DENSELBEN Schritt-Pfad.
                lockstep: true,
                lockstepDebug: false, // der Haken von gate:mp-sync (e): zeichnet Sende- und Ghost-Spuren auf
                _lockstepSeq: -1,
                _lockstepOut: null,
                _lockstepLastFlush: 0,
                _lockstepTrace: null,
                // Rolle in dieser Welt: "solo" (lokal, p2p aus) | "host" (andere joinen zu mir) | "guest" (Welt
                // ist eine Kopie des Hosts). Runtime-Spiegel von state.worldMeta.role.
                role: "solo",
                pendingWorldSnapshot: false,
                // LAN-Adressen vom signaling-server (welcome-Message): der Host baut die Einladungs-URL mit der
                // LAN-IP statt ws://127.0.0.1, damit Mitspieler ihn erreichen.
                lanAddresses: [],
                // WebRTC-Mesh: rtcPeers hält je Mitspieler RTCPeerConnection + RTCDataChannel; sind ALLE Kanäle
                // offen (_p2pMeshReady), fließen Position/DSL/Soul peer-to-peer (der signaling-server bleibt
                // Rendezvous + Fallback-Relay). meshActive spiegelt das für die UI.
                rtcPeers: new Map(),
                // TURN konfigurierbar (ohne TURN scheitern ~30–40 % der NATs an P2P): localStorage anazhTurn
                // = JSON {urls, username, credential}; reist NIE im Welt-Snapshot (private Infrastruktur).
                // STUN bleibt Default.
                iceServers: (() => {
                    const servers = [{ urls: "stun:stun.l.google.com:19302" }];
                    try {
                        const turn = JSON.parse(localStorage.getItem("anazhTurn") || "null");
                        if (turn && typeof turn.urls === "string") servers.push(turn);
                    } catch (_e) {
                        /* fehlkonfiguriertes TURN-JSON → STUN-only */
                    }
                    return servers;
                })(),
                meshActive: false,
                // Welt-Snapshot über das Mesh: worldXfers puffert eingehende Stücke (xferId → {from, total, parts,
                // received}); nur Stücke vom pendingPullFrom-Peer werden angenommen. _testNoReload unterdrückt den
                // Reload nach dem Resync im Playtest.
                worldXfers: new Map(),
                pendingPullFrom: null,
                _lastXferProgress: null,
                _lastReceivedSnapshotLen: 0,
                // W7 Phase 2 — peerId → Zeitstempel der letzten world-pull-
                // Antwort (Rate-Limit gegen pull-Spam).
                _pullServedAt: new Map(),
                _testNoReload: false,
                // Welt-Bündel über das Mesh — eigener Puffer, kollidiert nie mit Snapshot-Transfers.
                // pendingBundlePull = {peerId, worldId}: nur DESSEN Stücke für DIESE Welt werden angenommen;
                // _bundleServedAt: peerId → letzter bedienter Pull (Rate-Limit gegen Spam).
                bundleXfers: new Map(),
                pendingBundlePull: null,
                _bundleServedAt: new Map(),
                // LLM-Pool: voiceShared = ich teile meine Stimme (opt-in); _voiceServedAt: peerId → letzte
                // bediente Anfrage (Rate-Limit); _voiceRequests: reqId → {cb, timeout} meiner Anfragen.
                voiceShared: false,
                _voiceServedAt: new Map(),
                _voiceRequests: new Map(),
                _voiceReqSeq: 0,
                // W7 Phase 4 — Public-Lobby. published: mein Raum ist
                // browsbar; rooms: die zuletzt geholte Lobby-Liste.
                lobby: { published: false, label: "", rooms: [] },
                // Anwesenheits-Cache: Map<worldId, {fetchedAt, regions: [{region, peers}]}>. Privat per Default —
                // nur ein explizites requestWorldPresence fragt an (opt-in je Welt-Besuch).
                presence: new Map(),
                // Mittragen: Map<worldId, {snapshot, hash, signedAt, pinnedAt, label, authorPubKey}> — eine
                // besuchte Welt opt-in tragen und bei host-abwesenden Joins servieren. Persistiert über
                // pinnedManifest in localStorage (global, nicht je Welt).
                pinnedWorlds: new Map(),
                // Kreatur-Sicht-Sync — remoteCreatures: <peerId>:<netId> →
                // {mesh, …}, die Kreaturen der Mitspieler als Sicht-Schicht.
                remoteCreatures: new Map(),
                _lastCreatureBroadcast: 0,
                // Gruppen-Portal-Einladung eines Mitspielers ({peerId, worldId, label, at}) oder null.
                // Laufzeit-State, nicht im Welt-Save.
                pendingInvite: null,
            },
            // Welt-Identität (Ring 8+): die EINE Vorlage (`_weltMetaVorlage`), die auch
            // jede geladene Welt unterlegt (`_weltMetaWechsel`).
            worldMeta: AnazhRealm._weltMetaVorlage(),
            // Welt-Journal: geordnete Erinnerungen (Genesis, erstes Wetter, erste Kreatur, starke Programme,
            // Emotions-Gipfel). Im Save persistiert; der LLM-System-Prompt blendet einen Auszug ein.
            worldJournal: {
                entries: [],
                entryCap: 200,
                seen: {},
            },
            // Vibe-Pass: souveräne Avatar-Identität (ed25519, lokal erzeugt, welt-unabhängig). Der private
            // Schlüssel lebt NUR im globalen localStorage "anazh.vibePass", NIE im Welt-Save (sonst leckt die
            // Identität in geteilte Welten). Laufzeit-Spiegel, gefüllt von _ensureVibePass().
            vibePass: {
                ready: false,
                createdAt: null,
                publicKeyHex: null,
                fingerprint: null,
                freshlyCreated: false,
                publicKey: null,
                privateKey: null,
                _privateKeyJwk: null,
            },
            // Signierte Welt-Manifeste: welcher WORLD_REGISTRY-Eintrag mit welchem Vibe-Pass versiegelt ist.
            // Spieler-global, NIE im Welt-Save; localStorage "anazh.signedWorlds", Init via _loadSignedWorlds().
            signedWorlds: {},
            // Empfangene Welt-Manifeste (id NICHT in WORLD_REGISTRY): {id, label, desc, world, dsl,
            // authorPubKey, signature, signedHash, reachable}. Spieler-global, localStorage "anazh.customWorlds".
            customWorlds: {},
            // Render-Distanz: Ziel-Ring-Radius in Chunks ((2r+1)² Chunks, Leser klemmen 1..12). Mehr = mehr
            // sichtbare Welt + mehr Generier-Last. Persistiert in localStorage.
            chunkRingRadius: 4,
            // Der AKTIVE Ring (≤ chunkRingRadius): startet klein und wächst Schale um Schale zum Ziel, nie an der
            // Bildrate (`_ringWaechst`, der Strom); headless sofort Ziel. null = lazy-init dort.
            _activeRingRadius: null,
            // Bühnen-Latch: einmal true, bleibt true (Session-Lebenszeit, NICHT persistiert — buildStateSnapshot
            // kopiert einen festen Feld-Satz). Gesetzt von _buehneSteht() (dem EINEN Prädikat), gelesen von allen
            // spielfremden Tick-Quellen (Nexus, Grok-Chatter, Wetter, Saison, Fern-Deko …); der Karten-Bäcker liest sie nie.
            _buehneStand: false,
            symphony: {
                ctx: null,
                enabled: false,
                // Audio-Lautstärken 0..1 als Multiplikatoren auf den GainNode: masterVolume für alle
                // Symphonie-Schichten, creaturePingVolume („Umgebungsgeräusche") für den Bus der Klang-Welt,
                // voiceVolume für die TTS-Stimme (SpeechSynthesisUtterance.volume).
                masterVolume: 1.0,
                creaturePingVolume: 1.0,
                voiceVolume: 1.0,
                masterGain: null,
                spitze: null, // die Spitzen-Wand hinter dem Master { eingang, ausgang } (klang:UMWELT.spitze)
                tierRufe: 0, // Ereignis-Zähler der Tier-Rufe (headless messbar)
                // W4 V2/V3 — die Lofi-Pad-Schicht: eine seed- + emotion-
                // getriebene Akkordfolge (~60 BPM), lazy in initSymphony.
                lofi: null, // { gain, filter, melodyGain, grooveGain, bassGain, noiseBuffer, degree, lastChordAt, rngState }
                // Welle 5 Klang — die Klang-Welt (klang:UMWELT), lazy in initSymphony. Runtime-only, NIE im Save.
                umwelt: null, // { kern, bus, graph, ring, glut, letzteMischung, rufSaat, lage, mix }
                // Leben-Schau 2 — die Stimme der Fahrt (klang:FAHRT), nur im Sattel (_fahrtKlangTick). Runtime-only.
                fahrt: null, // { entry, stimme }
            },
            player: {
                // Avatar-Name (Default "Schöpfer"), editierbar, persistiert in localStorage; der LLM-System-Prompt
                // nutzt ihn, damit Grok dich beim Namen ansprechen kann.
                name: "Schöpfer",
                // Ring 5 V2 — Spieler-Seele. Der Mensch (human) + koerper_-Baupläne
                // mit Multi-Mesh-Group + sin/cos-Animation. Ammo-Body bleibt
                // identisch (rein visuell). Default "human".
                soul: "human",
                // Mount-State: null oder entry.id der befahrenen Architektur; der Tick zieht deren Position dem
                // Spieler nach.
                mountedArch: null,
                walkPhase: 0,
                animationLastTick: -Infinity,
                emotions: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 },
                mood: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 }, // W3 — die langsame Grundstimmung (EMA der Emotion, reaktiv)
                emotionDecayPerSec: 0.005,
                emotionLastTick: -Infinity,
                // der Takt und die Schwelle der Gesetze des Gemüts (`_gemuetGesetze`, je Achse ein Gesetz mit eigenem Takt)
                emotionApplyCooldown: 30,
                emotionThreshold: 0.7,
                // Boosts = temporäre Tag-Modifikationen {source, tagDelta, expiresAt, label}. Quellen: Emotion
                // (>0.7 auf einer Achse → Tag-Delta für 30 s), Welt-Resonanz (nahe Signature-Struktur), Konsum
                // (DSL consume/apply_boost). tickPlayerBoosts filtert + triggert 1×/s; computePlayerStats addiert.
                boosts: [],
                boostLastTriggered: {
                    "emotion:joy": -Infinity,
                    "emotion:awe": -Infinity,
                    "emotion:sorrow": -Infinity,
                    "emotion:hope": -Infinity,
                    "emotion:peace": -Infinity,
                    "emotion:chaos": -Infinity,
                },
                boostLastTick: -Infinity,
                // Der Tod ist feld-nativ: bei HP=0 kehrt DERSELBE Körper am Ursprungs-Anker zurück (kein
                // Gestalt-Tausch), die Welt merkt den Ort (_depositLife) und fühlt sorrow + awe.
                // respawnGraceUntil = kurze Gnade nach der Rückkehr (kein Ping-Pong-Tod).
                respawnGraceUntil: -Infinity,
                deathLastTick: -Infinity,
                // Tod-Wunde: gradueller Tag-Penalty nach der Rückkehr, linear über deathWoundRegenSeconds
                // regeneriert (frisch 1.0 → geheilt 0.0); WOUND_TAG_PENALTY × Intensität fließt in computePlayerStats.
                deathWoundIntensity: 0,
                deathWoundRegenSeconds: 600,
                deathWoundLastTickAt: -Infinity,
                // Equipped-Slots: held (Werkzeug/Waffe: sourceBlueprint.compoundTags × toolWeight) und armor
                // (blueprint.compoundTags × armorWeight) fließen vor den Boosts in computePlayerStats. offhand ist
                // ein Bereitschafts-Slot (Tausch-Key G, am linken Arm) und faltet NIE in die Stats (kein Doppel-Buff).
                equipped: { held: null, offhand: null, armor: null },
                // Inventar: 27 Slots (3 × 9), je {blueprintName, count} oder null. Slots tragen die TAG-PROFILE der
                // Baupläne (Hover: resoniert summt, brennend glüht orange, magieleitung violett). Gefüllt via
                // DSL add_to_inventory oder den Werkstatt-Editor; Drag auf einen Hotbar-Slot legt den Bauplan ab.
                inventory: new Array(27).fill(null),
                // Pfad-Buckets: Histogramm, wo der Spieler sich aufhält (Höhe, Distanz, Wetter, Aktivität), alle
                // pathSampleInterval s inkrementiert; alle Achsen decayen (0.99 je Sample), damit Vorlieben wandern.
                pathBuckets: {
                    height: { low: 0, mid: 0, high: 0 },
                    distance: { center: 0, mid: 0, edge: 0 },
                    weather: { sunny: 0, rainy: 0 },
                    activity: { still: 0, walking: 0, jumping: 0 },
                },
                pathLastSample: -Infinity,
                pathSampleInterval: 2.0,
                // Aktivitäts-Zähler — wird vom Game-Loop gefüllt (Bewegung,
                // Sprünge, Chat-Eingaben) und vom Outcome-Finalizer gelesen.
                recentActivity: { moves: 0, jumps: 0, chats: 0, since: 0 },
            },
            // Bauwerke als Daten (~50 Bytes/Eintrag); der Save hält {type, position, seed, scale}, das Mesh
            // wird aus dem Seed rekonstruiert. Kein Hard-Cap: tickArchitectureCulling baut 1×/s Meshes in
            // cullingRadius auf und disposed ferne — Daten sind die Wahrheit, das Mesh nur Sicht.
            architectures: [],
            // KAMIN-RAUCH (.105): Settlement-Rauchquellen + Teilchen (Lab dorfRauch-Wire).
            dorfRauch: { quellen: [], teilchen: [] },
            // DIE FAHNE DES BRANDS (stoffe.K2#2, `_brandRauch`): ihre Ballen, der Zähler ihres Samens
            brandRauch: { teilchen: [], n: 0 },
            architectureNextId: 1,
            // Φ7 (V18.190) — DIE PORTAL-HALLEN: kuratierte Welt-Verzeichnisse.
            // Ein Eintrag ist eine signierte Sammlung von Welt-Adressen (Φ1),
            // die im Raum als Kreis-Anordnung materialisiert werden können
            // (begehbares Linkverzeichnis). Form: Map<hallName, {label,
            // entries: [{address, label}], authorPubKey, sig, signedAt,
            // signedHash, provenance}>. Persistiert über den Snapshot
            // (worldMeta-frei, weltweit lebende Werke; Spieler-global wie
            // Baupläne). Reist über _admitForeignPortalHall (R4-Wand).
            portalHalls: new Map(),
            // Compute-Spende (Geschenk, KEINE Rechen-Währung): Map<inputHash, {outputHash, providedBy,
            // providedAt, sig, status: "fresh"|"verified"|"forged"|"unverified"}>. Gespendete Chunk-Artefakte
            // werden per Stichprobe gegen die LOKAL nachgerechnete Wahrheit bit-gehasht; "forged" revoziert
            // den Anbieter für die ganze Welt.
            computeContributions: new Map(),
            // Array<{commit, version, result, total, providedBy, signedAt, sig}> (rollend, max 64): signierte
            // Peer-Aussagen "ich lief playtest auf commit X mit Resultat Y".
            playtestContributions: [],
            architectureCullingRadius: 150,
            // Max. teure Architektur-Builds je Frame im Culling-Scan: deckelt den Build-Burst beim Eintritt in
            // dichte Regionen (3/Frame ≈ 180/s, eine Region füllt sich in <1 s ohne Spike); Cull ungedeckelt.
            // Die Kollision ist feld-nativ via entry.blockerAABBs, render-unabhängig ab Spawn.
            architectureBuildBudgetPerFrame: 3,
            // Performance-Regelkreis: Sollwert + die vom PID gefahrenen Streaming-Stellgrößen (Default = volle
            // Qualität, der Regler senkt unter Last). perfRegulator:false schaltet die Rückkopplung ab (der
            // Sense misst weiter); perfSense lazy.
            perfTargetMs: 17,
            perfRegulator: true,
            perfSense: null,
            // DIE EINE SZENEN-SKALA (K50): die interne Auflösung der Szene relativ zur Ausgabe (0,5..1), der Regler
            // „Szene-Auflösung“ im Menü, im Snapshot; null = `SZENE_SKALA` (`_szeneSkalaWirk`). Kein Stellglied des Reglers.
            szeneSkala: null,
            _renderScaleApplied: null, // zuletzt via setPixelRatio angewandter DPR-Cap-Wert (Dead-Band gegen Churn)
            untertitel: false, // spielgang.K4 — die Untertitel der Klang-Welt (Einstellungen › Ton & Sicht), gewählt vom Spieler
            // Standalone-Perf-Panel (top-right, eine Zeile {fps} · Szene {skala}% · {dc}dc · {tri}k▲),
            // liest perfSense (kein Parallel-Zähler); der PERF-SENSE-Debug-Dump bleibt hinter perfOverlay.
            // Toggle im Einstellungen-Drawer, persistiert via Snapshot.
            perfPanel: false, // V18.390 — das zweite Panel retiret: die Trias lebt jetzt SYNERGETISCH in der Status-Bar (Schöpfer-Befund). Toggle in Einstellungen bringt das Standalone-Panel zurück, falls gewünscht.
            // Flugschreiber (Blackbox, KEIN Regler): lazy-init in _flightRecorderTick; sichert die N
            // schlimmsten Frames (aus perfSense) nach anazhRealmPerf.json — dasselbe Rohr wie der State-Save.
            flightRecorder: null,
            _voxelStreamBudgetMs: 5,
            _voxelStreamMaxPerFrame: 6,
            _shadowMinInterval: 1, // V18.264 — Schatten-Cache-Intervall (Regler-gefahren)
            // V12.0-perf.h — deferred-Queue für den Wasser-Iso-Build (Set von
            // "cx,cz"-Keys), per-Frame budgetiert (Streaming-Hitch-Heilung).
            pendingWaterIso: null,
            // Deferred-Queue fürs Gras (Set von Chunk-Keys): _buildVoxelChunkGrass (~34 ms) ist der teuerste
            // Per-Chunk-Posten — synchron im Finalize triebe er Rebuild-Spikes. Der Tick baut ≤1/Frame auf
            // einem ruhigen (nicht-Streaming-)Frame nach; 1 Frame später ist imperzeptibel.
            pendingGrass: null,
            // Chunks, deren OBERFLÄCHE sich änderte (Carve/Fill): ihr Gras MUSS synchron neu (kein Flackern).
            // Struktur-Spawn/Skirt-/LOD-Rebuild ändern die Oberfläche nicht → Gras bleibt; nur der edierte
            // Chunk resettet, nie seine Skirt-Nachbarn.
            grassDirtyChunks: null,
            // Architektur-Instancing (HISM): archFlattenCache = Map<blueprintName, {instanceable, reason,
            // leaves:[{geom, mat, localMatrix}]}> — Bauplan flach in Leaf-Primitive (verschachtelte Baupläne
            // mit komponierter Matrix). archInstanceGroups = Map<"name#leafIdx", {mesh:InstancedMesh,
            // capacity, count, free:[]}> — eine InstancedMesh je Leaf-Gruppe, lazy.
            archFlattenCache: null,
            archInstanceGroups: null,
            // Streu-Laub-Gruppen PRO 256m-REGION keyen: die instanz-bewusste Bounding-Sphere wird lokal →
            // frustumCulled=true lässt die Engine Regionen hinter dem Blick cullen (welt-weit gekeyt spannten sie
            // die ganze Welt, Umsehen cullte nie). false (+ umherlaufen) = A/B.
            useRegionFoliageCull: true,
            // Occlusion-Demotion: ein ferner 3D-Baum hinter dichter Kronen-Masse fällt auf LOD2
            // (AnazhRealm.OCCLUSION-Gitter + _tickArchitectureLOD-Hook). Kein zweiter LOD-Regler — die
            // Schwelle liest _foliageDensityScale. Headless aus (das Gate sieht reine Distanz-LOD); false = A/B.
            useOcclusionDemotion: true,
            // Opaker Kronen-Kern (Icosphere in der Karten-Wolke gegen Overdraw), Default AUS: er machte die
            // Krone zur soliden dunklen Kuppel; die Krone füllen durchscheinende Blatt-Cluster, die
            // Overdraw-Last trägt die LOD/Impostor-Ferne. true = A/B.
            foliageOpaqueCore: false,
            // Schatten-Zwilling: das Anzeige-Laub castet nicht, ein opaker Kronen-Caster
            // (_buildTreeShadowTwinGeometry, SHADOW_TWIN_LAYER) trägt den Schatten. Default an (!== false);
            // false = A/B (die Cards casten selbst, Alpha-Test-Schatten).
            foliageShadowTwin: true,
            // LOD-Pipeline: SSE-Metrik + komplementäres golden-ratio-Dither-Crossfade L0 → L1 → L2-Impostor
            // (kein Pop). lodRef ist die EINE Live-Quelle: treibt die CPU-Distanz (_lodPerceptionDistance) UND
            // die Shader-Blende (state.lodUniforms.uLodRef, pro Frame gespiegelt) → live ohne Rebuild. Default
            // aus AnazhRealm.LOD_DISTANCES.lodRef (Referenz-Höhe: größere Bäume schalten später, kleinere früher).
            // lodMaskOn togglet das Crossfade (false → harte Kanten).
            lodRef: AnazhRealm.LOD_DISTANCES.lodRef,
            lodMaskOn: true,
            // Foundry-Dither-Blende: Crossfade-Maske (__phytoCore.lodCrossfadeMask + _lodCrossfadeMaskNode)
            // UND CPU-Doppel-Mitgliedschaft im Band (_updateFoundryLodBand) schalten ZUSAMMEN an diesem Flag —
            // Maske ohne Band = Coverage-Löcher, Band ohne Maske = opaker Doppel-Draw/Z-Fight. BUILD-ZEIT-Flag
            // (Material-Cache-Key; Live-Toggle wirkt nur auf neue Gruppen) — sofortiges A/B ist state.lodMaskOn
            // (uLodMaskOn: Maske aus ohne Rebuild; das Band bleibt opak stehen, kein Loch).
            foundryCrossfade: true,
            // Mesh-Merge: je Bauplan-Variante EINE merged Geometry je (shape, material)-Gruppe (typisch
            // bark + foliage) → ~2 Draws statt ~80. Map<bpName, {leaves:[{geom, mat, localMatrix=Identity}]}>,
            // gelesen von _archFlattenBlueprint bei bp._isMerged (genVersion ≥ 6). Welt-gebunden: disposed in
            // _loadStateRestoreWorldMeta.
            archMergedGeomCache: null,
            // Bauplan-Datenschicht: Map<name, blueprint>. Built-ins füllt _defaultBlueprints am
            // Konstruktor-Ende; eigene Baupläne kommen dazu und werden persistiert.
            blueprints: {},
            // Hotbar (9 Slots, Bauplan-Name oder null) + Bau-Modus: Tasten 1-9 wählen den Slot — leer lässt
            // den Modus aus, belegt aktiviert den Bauplan (oder toggelt zurück). F baut, ESC verlässt.
            // Der Start-Gurt liest den heutigen Katalog (`_startGurt`, gelegt nach der Buch-Ankunft): bis 07.10. stand
            // hier Felsblock · Wasserfall · Damm (L7 — der Felsblock ist ein Alt-Doppel, im Katalog versteckt).
            hotbar: [null, null, null, null, null, null, null, null, null],
            buildMode: {
                active: false,
                slotIndex: -1,
                blueprintName: null,
                phantomMesh: null,
                phantomDistance: 5,
                // Welle 6.A5 — wird pro tickBuildMode aus dem Raycast-Hit
                // gesetzt: true = stabile (begehbare) Oberfläche unter dem
                // Phantom, false = schwebt frei oder zeigt auf Wand.
                phantomOnGround: false,
            },
        };
        this.core = {
            initPhysics: this.initPhysics.bind(this),
            startEternalLoop: this.startEternalLoop.bind(this),
        };
        this.nexus = null;
        // Materialien als Tag-Profile (die Substanz-Schicht des Crafting), VOR den Bauplänen geladen,
        // damit deren Parts ihre Default-Material-Namen auflösen.
        this.state.materials = this._defaultMaterials();
        // Werkzeuge mit Präzisions-Caps: jede Op braucht ein ausführendes Werkzeug, das den Cap liefert.
        // Starter-Tools besitzt der Spieler ab Init; eigene kämen via applyOp, nie aus dem DSL-Generator-Pool.
        this.state.tools = this._defaultTools();
        if (!this.state.player.tools) {
            this.state.player.tools = Object.values(this.state.tools)
                .filter((t) => t.isStarter)
                .map((t) => t.name);
        } else {
            // Backfill für alte Saves: neue Starter-Werkzeuge (z. B. die Domain-Werkzeuge) werden in
            // bestehende Inventare nachgereicht — sonst könnte der Spieler sie nie anwenden.
            for (const t of Object.values(this.state.tools)) {
                if (t.isStarter && !this.state.player.tools.includes(t.name)) {
                    this.state.player.tools.push(t.name);
                }
            }
        }
        // Ring 6.4 — Built-in-Baupläne als Daten registrieren. Wenn ein
        // Save später User-Baupläne hinzufügt (Editor 6.6), werden sie auf
        // dieses Default-Set draufgemerged.
        this.state.blueprints = this._defaultBlueprints();
        // Custom-Seelen (per DSL erschaffene Charaktere): Map name → {name, label, bodyParts, createdAt},
        // Cap 16, persistiert. Built-in-Seelen liegen in playerSoulDefs.
        this.state.customSouls = {};
        // Konsumables (DSL-definierte "Tränke"): Map name → {name, label, tagBonus, durationSeconds,
        // createdAt}, Cap 32. apply_boost(name) fügt einen Boost hinzu; nur Definition + Aktivierung.
        this.state.consumables = {};
        // Welle 4 Phase 1+3 — Built-in-Parts ohne Material auf „stein"
        // mappen; ohne opChain auf eine billige Default-Kette. Built-ins
        // bleiben damit visuell wie vorher; die Tag-Berechnung greift.
        for (const bp of Object.values(this.state.blueprints)) {
            if (!bp || !Array.isArray(bp.parts)) continue;
            for (const p of bp.parts) {
                if (!p || typeof p !== "object") continue;
                if (typeof p.material !== "string") p.material = "stein";
                if (!Array.isArray(p.opChain)) p.opChain = this._defaultPartOpChain();
            }
        }
    }
    // Die Setzung des Auges (`_lodAuge`): die Kamera steht jetzt für den Spieler, wo er jetzt steht.
    _lodAugeGesetzt(c) {
        const cam = this.state.camera;
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        if (!cam) return;
        const r = this._lodAugeR || (this._lodAugeR = { cam: new THREE.Vector3(), pl: new THREE.Vector3(), stand: 0 });
        if (c) r.cam.copy(c);
        else cam.getWorldPosition(r.cam);
        if (pm) r.pl.copy(pm);
        else r.pl.set(0, 0, 0);
        r.stand = 2;
    }

    // DAS MASS DES SPIEGEL-ZIELS: 1/teil des Schirms aus der EINEN Quelle (`_schirm`, Gebot 7 — gate:schirm-monotonie Q);
    // ohne Zeichenpuffer ein Texel, bis der Pass es mit dem Schirm neu anlegt.
    _spiegelZielMass() {
        const g = this._schirm();
        const teil = AnazhRealm.SPIEGEL.teil;
        const m = this._spiegelMass || (this._spiegelMass = { w: 1, h: 1 });
        m.w = Math.max(1, Math.round(g.breite / teil));
        m.h = Math.max(1, Math.round(g.hoehe / teil));
        return m;
    }

    // Läuft der Pass? Wasser im Feld UND der Wasser-Satz zeichnet im Hauptbild (Gebot 7: die Kosten folgen dem Schirm).
    _spiegelWasserImBild() {
        const st = this.state;
        const S = st.spiegelFeld;
        if (!S || !(S.wasser > 0) || !(S.hMax > -1e4) || !st.chunkSaetze) return false;
        for (const s of st.chunkSaetze.values()) {
            if (!s.spec || s.spec.name !== "wasserSatz") continue;
            const a = s.abschnitte.get("haupt");
            S.wasserSatz = s;
            return !!(a && a.n > 0 && s.mesh && s.mesh.visible);
        }
        return false;
    }

    // NACH DEM BILD (`_loopRender`, nur auf der Post-Kette — der Szenen-Pass trägt die Tiefe des gezeichneten Wassers): der
    // Pass rechnet aus Tiefe und Ansicht DIESES Bilds, das Wasser des nächsten reprojiziert in diese Ansicht. Läuft er nicht,
    // liest das Wasser den Himmel allein (`an` 0). Er ZAHLT NUR BEI ÄNDERUNG (Gebot 7, `_spiegelPassWach`): steht das Bild,
    // liest das Wasser den Spiegel des letzten Laufs in dessen Ansicht (die Reprojektion ist exakt) — bis D10-n1 rechnete er
    // jedes Bild neu (0,17–0,43 ms CPU je Bild im Stand, Radeon, See).
    _spiegelPassZeichne() {
        const st = this.state;
        const L = st.spiegelLeser;
        if (!L) return;
        const an = !!st.scenePass && !st.spiegelBruch && this._spiegelWasserImBild();
        if (!an) {
            L.an.value = 0;
            return;
        }
        try {
            // `an` 0: das Ziel ist alt (der Pass ruhte, ein Sprung des Auges, `_loopRender`) — er rechnet in jedem Fall
            if (this._spiegelPassWach(L) || L.an.value === 0) this._spiegelPassRechne(L);
            L.an.value = 1;
        } catch (err) {
            // laut beim Namen (der EINE Melder), danach liest das Wasser den Himmel allein — nie still byte-alt
            st.spiegelBruch = true;
            L.an.value = 0;
            this._stoffBruch("der Spiegel-Pass des Wassers (D10) — das Wasser spiegelt nur den Himmel", err);
        }
    }

    // WAS DER PASS LIEST, IST SEINE SIGNATUR: das Auge (`ruheM`), der Blick (`ruheRad`), die Projektion, der Stand des Felds
    // (jede Antwort des Workers, jedes Leeren, jede Kronen-Farbe), der Stand des Wasser-Satzes und das Ziel-Maß exakt, das Licht der Welt (`_weltLicht`)
    // und die EINE Luft auf `ruheLicht`. Weicht eine Größe von der des letzten Laufs ab, rechnet er neu und merkt sie.
    _spiegelPassWach(L) {
        const st = this.state;
        const K = AnazhRealm.SPIEGEL;
        const S = st.spiegelFeld;
        const e = st.camera.matrixWorld.elements;
        const pr = st.camera.projectionMatrix.elements;
        const m = this._spiegelZielMass();
        let sig = L.sig;
        if (!sig) {
            const lu = st.luft && st.luft.U;
            sig = L.sig = {
                neu: new Float64Array(64),
                alt: new Float64Array(64),
                da: false,
                zeit: 0,
                bilder: 0,
                k: 0,
                proj: [0, 5, 8, 9, 10, 14],
                licht: [
                    ...Object.values(this._weltLicht().U),
                    lu && lu.farbe,
                    lu && lu.sonneFarbe,
                    lu && lu.beta,
                ].filter(Boolean),
            };
        }
        const v = sig.neu;
        let k = 0;
        // Lage: Auge (m) und Blick (die z-Achse der Welt-Matrix, Bogenmaß)
        v[k++] = e[12];
        v[k++] = e[13];
        v[k++] = e[14];
        v[k++] = e[8];
        v[k++] = e[9];
        v[k++] = e[10];
        // exakt: Projektion, Stand des Felds, Stand des gezeichneten Wassers (seine Tiefe trägt den Wasser-Punkt), Ziel-Maß
        for (const i of sig.proj) v[k++] = pr[i];
        v[k++] = S.stand;
        v[k++] = S.wasserSatz ? S.wasserSatz.stand : -1;
        v[k++] = this._weltLicht().stand; // die Himmels-Sonde des Lichts der Welt
        v[k++] = m.w;
        v[k++] = m.h;
        // Licht und Luft
        const licht = k;
        for (const u of sig.licht) {
            const x = u.value;
            if (typeof x === "number") v[k++] = x;
            else if (x && (x.isColor || x.isVector3)) {
                v[k++] = x.isColor ? x.r : x.x;
                v[k++] = x.isColor ? x.g : x.y;
                v[k++] = x.isColor ? x.b : x.z;
            }
        }
        const a = sig.alt;
        let wach = !sig.da || sig.k !== k;
        for (let i = 0; !wach && i < k; i++) {
            const d = Math.abs(v[i] - a[i]);
            wach = i < 3 ? d > K.ruheM : i < 6 ? d > K.ruheRad : i < licht ? d !== 0 : d > K.ruheLicht;
        }
        // DAS BILD LEBT (A1): der Spiegel liest das gezeichnete Bild — Wind im Laub, ziehende Wolken, ein Tier am Ufer —, im
        // Stand neu je `bildRuheMs` UND frühestens nach `bildRuheBilder` Bildern (A1-n1: die Uhr allein trug bei 30 fps jedes
        // 15. Bild, über dem 5-%-Rand des p95; gezählt in Bildern trägt der Lauf im Stand nie das p95, bei jeder Bildrate)
        const jetzt = performance.now();
        sig.bilder++;
        if (!wach && jetzt - sig.zeit > K.bildRuheMs && sig.bilder >= K.bildRuheBilder) wach = true;
        if (wach) {
            a.set(v);
            sig.k = k;
            sig.da = true;
            sig.zeit = jetzt;
            sig.bilder = 0;
        }
        return wach;
    }

    // Der Lauf des Passes: Ziel in 1/teil des Schirms, Ansicht dieses Bilds, das Feld-Fenster, das Quad der Post-Kette.
    _spiegelPassRechne(L) {
        const st = this.state;
        const P = this._spiegelPass();
        const S = st.spiegelFeld;
        const rend = st.renderer;
        const cam = st.camera;
        const m = this._spiegelZielMass();
        // ein Fenster-Wechsel legt das Ziel neu an; der Versions-Sprung zeigt es dem Wächter der Diät (`_diaetVorTextur`)
        if (L.rt.width !== m.w || L.rt.height !== m.h) {
            L.rt.setSize(m.w, m.h);
            L.rt.texture.needsUpdate = true;
        }
        // die Matrizen DIESES Bilds (der Render rechnete sie, die Zeit-Auflösung nahm ihren Versatz zurück)
        P.vp.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        P.U.vp.value.copy(P.vp);
        P.U.invVP.value.copy(P.vp).invert();
        P.U.auge.value.setFromMatrixPosition(cam.matrixWorld);
        cam.getWorldDirection(P.U.vorn.value);
        P.U.nah.value = cam.near;
        P.U.p10.value = cam.projectionMatrix.elements[10];
        P.U.p14.value = cam.projectionMatrix.elements[14];
        P.U.mitte.value.set(S.mitte[0], S.mitte[1]);
        P.U.hMax.value = S.hMax + 2;
        P.U.texel.value.set(1 / m.w, 1 / m.h);
        const vor = rend.getRenderTarget();
        rend.setRenderTarget(L.rt);
        P.quad.render(rend);
        rend.setRenderTarget(vor);
        L.vp.value.copy(P.vp);
    }
    // DER ABSCHIED EINER GEBUNDENEN TEXTUR (die Klasse „Destroyed texture … used in a submit": szene:tiefenabbild, spiegel:strahl,
    // horizont-karte): r184 legt ein Ziel, das eine Bindegruppe schon hält, beim ersten Bild oder einem Größen-Wechsel neu an
    // (`updateRenderTarget` → `updateTexture` → `destroyTexture`) — mitten im Frame, während ein offener Befehls-Puffer oder ein
    // aufgenommenes Bündel die alte Textur bindet; der ganze Befehls-Puffer fiel aus. Die EINE Regel für jede solche Textur, an
    // der KLASSE der Textur-Verwaltung (jeder Renderer der Seite): die alte GPU-Textur fällt erst nach den Submits dieser Aufgabe,
    // und jedes Bündel der Welt nimmt neu auf (seine Aufnahme hält die alte Bindegruppe); die losen Leser frischt der Wächter der
    // Diät auf (`_diaetVorTextur`). Die Wand: gate:fenster-wechsel (jeder Größen-Schritt, jede Meldung beim Namen).
    // DIE GEWACHSENE TEXTUR (Karten-Atlas, Bogen- und Ziel-Atlas der Tore): ein Atlas wächst IN SEINER Textur (neues Bild,
    // needsUpdate) und geht denselben Weg — r184 lädt eine gewöhnliche Textur in ihre alte GPU-Form, die neue Form legt diese
    // Regel an (die Schichten-Updates fallen: die neue Form lädt ganz). Bis 16.10. baute jedes Wachsen eine NEUE Textur, tauschte
    // den Knoten-Wert und entsorgte die alte — doch die Vorlage des Programms bindet die Textur seines Baus, und `Bindings._init`
    // lädt sie für jedes neue Render-Objekt hoch, bevor `update()` den Knoten liest: die entsorgte stieg wieder auf und blieb
    // (Mess-Wiese, Radeon: Karten-Atlas 16 neben 20 Schichten, +4,0 MB VRAM). Die Wand: gate:foundry-impostor C5.
    _texturAbschied(renderer) {
        const inst = renderer && renderer._textures;
        const P = inst && Object.getPrototypeOf(inst);
        if (!P || P.__anazhAbschied || typeof P.updateTexture !== "function") return;
        P.__anazhAbschied = true;
        const welt = this;
        const roh = P.updateTexture;
        P.updateTexture = function (t, o) {
            const d = this.get(t);
            const ziel = t.isRenderTargetTexture || t.isDepthTexture || t.isFramebufferTexture;
            const anders = d.initialized === true && d.version !== t.version;
            // die Form der GPU-Textur einer gewöhnlichen Textur (nie die geteilte Vorgabe-Textur: die fällt nie)
            const formTraeger = !ziel && t.isStorageTexture !== true && t.isExternalTexture !== true;
            const s = formTraeger && (anders || d.initialized !== true) ? this.getSize(t) : null;
            const form = s ? s.width + "x" + s.height + "x" + s.depth : null;
            const gewachsen =
                anders && form !== null && d.isDefaultTexture === false && d.__form !== undefined && d.__form !== form;
            const neu = (ziel && anders && d.bindGroups && d.bindGroups.size > 0) || gewachsen;
            const g = neu ? this.backend.get(t) : null;
            const alt = g ? [g.texture, g.msaaTexture].filter(Boolean) : [];
            for (const x of alt) {
                const weg = Object.getPrototypeOf(x).destroy;
                x.destroy = () => Promise.resolve().then(() => weg.call(x));
            }
            // Der Sampler lebt in den Backend-Daten der Textur (`updateSampler`) und die Sampler-Bindung steht VOR der Textur-
            // Bindung: er folgt der neuen Form, sonst fehlt er der nächsten Bindegruppe (die Post-Kette fiel am 16.10. so beim
            // Wachsen des Karten-Atlas, „Required member is undefined").
            const sampler = gewachsen ? { sampler: g.sampler, samplerKey: g.samplerKey } : null;
            if (gewachsen) {
                this.backend.destroyTexture(t);
                d.isDefaultTexture = undefined;
                if (t.layerUpdates && t.layerUpdates.size > 0) t.clearLayerUpdates();
            }
            const aus = roh.call(this, t, o);
            if (form !== null && d.isDefaultTexture === false) d.__form = form;
            if (gewachsen) {
                const n = this.backend.get(t);
                if (n.sampler === undefined && sampler.sampler !== undefined) Object.assign(n, sampler);
                this.info.destroyTexture(t);
                this.info.createTexture(t);
            }
            // JEDES Bündel der Szene — die Region-Bündel und jede Leib-Hülle (`_leibHuelle`): ein Leib, der nach dem Abschied
            // weiter abspielte, band die alte Horizont-Karte (E2, Radeon: 595 Meldungen „Destroyed texture … used in a submit",
            // Himmel und Bündel fielen aus dem Bild). Der Gang ist selten (erstes Bild, Größen-Wechsel, Wachsen eines Atlas).
            const sc = welt.state.scene;
            if (alt.length && sc && this.backend.get(t).texture !== alt[0])
                sc.traverse((o) => {
                    if (o.isBundleGroup === true) o.needsUpdate = true;
                });
            return aus;
        };
    }

    // Hilfsmethode für UI/Tests: zählt Architekturen in Spieler-Nähe.
    countArchitecturesNearPlayer(radius = 60) {
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!playerPos) return { near: 0, total: this.state.architectures.length };
        const radiusSq = radius * radius;
        let near = 0;
        for (const entry of this.state.architectures) {
            const dx = entry.position.x - playerPos.x;
            const dz = entry.position.z - playerPos.z;
            if (dx * dx + dz * dz <= radiusSq) near++;
        }
        return { near, total: this.state.architectures.length };
    }

    // Ring 5 V2 Vorbereitung — Kamera-Modus (Erst-/Dritte-Person).
    // DIE KAMERA-FÜHRUNG (K16b, der Anschluss eines Studios an die Welt-Engine): `fn(camera, t, spielerPos)` setzt je Frame
    // die Kamera statt der Spieler-Kamera (`_loopCamera`); null gibt sie dem Spieler zurück. Leser: das Gelände-Studio
    // (Makro-Flug, langsamer Orbit; „Augenhöhe" = null).
    kameraFuehren(fn) {
        this._kameraFuehrung = typeof fn === "function" ? fn : null;
    }

    setCameraMode(mode) {
        const next = mode === "third" ? "third" : "first";
        this.state.cameraMode = next;
        this._applyEgoSicht(); // T7 — der Modus-Schalter trägt die Sicht-Regel sofort (EINE Naht)
        const toggle = typeof document !== "undefined" ? document.getElementById("camera-mode-toggle") : null;
        if (toggle) {
            toggle.setAttribute("aria-pressed", next === "third" ? "true" : "false");
            toggle.textContent = next === "third" ? "Sicht: 3rd" : "Sicht: 1st";
        }
        try {
            localStorage.setItem("anazhRealmCameraMode", next);
        } catch {
            // Persistenz nicht hart erforderlich; pro-Session reicht.
        }
        this.log(`Kamera-Modus: ${next}`, "INFO");
    }

    // === Spielmodi (frieden / pfad / schöpfer) ===
    // frieden — Welt umarmt (kein HP/Tod/Stamina-Kosten) · pfad — verhandelt (HP/Stamina/Tod aktiv) ·
    // schöpfer — gehorcht (kein Schaden, voller Zugang). Persistiert in worldMeta.gameMode (pro Welt),
    // gespiegelt nach state.gameMode für Gate-Reads. setGameMode ist der EINZIGE Mutations-Pfad
    // (beide + UI-Latches + Status-Bar + Save).
    static get GAME_MODES() {
        return this._einmal("GAME_MODES", Object.freeze(["frieden", "pfad", "schöpfer"]));
    }

    setGameMode(mode) {
        const canonical = AnazhRealm.GAME_MODES.includes(mode) ? mode : "frieden";
        if (!this.state.worldMeta) this.state.worldMeta = {};
        this.state.worldMeta.gameMode = canonical;
        this.state.gameMode = canonical;
        // HP bei frieden→pfad-Wechsel NICHT zurücksetzen: der Spieler
        // bringt seinen Zustand mit (Vision: Welt-Beziehung ändert sich,
        // nicht der Spieler).
        this._renderGameModeUI();
        // Welle 6.H Phase 2C — Bau-HUD muss bei Modus-Wechsel mit: aus
        // pfad raus → Kosten-Zeile verschwindet; in pfad rein → Kosten-Zeile
        // erscheint. Defensiv (Test-Edge-Cases vor Init).
        if (typeof this._updateBuildModeHud === "function") this._updateBuildModeHud();
        try {
            this.saveState();
        } catch {
            // saveState-Fehler nicht hart blockend — Modus lebt in state.
        }
        if (typeof this.log === "function") {
            const labels = { frieden: "Frieden", pfad: "Pfad", schöpfer: "Schöpfer" };
            this.log(`Welt-Beziehung: ${labels[canonical] || canonical}`, "INFO");
        }
        return canonical;
    }

    // UI-Render-Pfad: aktualisiert Radio + Status-Bar nach Mode-Wechsel.
    // Idempotent — kann ohne State-Wechsel aufgerufen werden.
    _renderGameModeUI() {
        if (typeof document === "undefined") return;
        const mode = this.getGameMode();
        // Radio-Buttons in Einstellungen-Drawer
        const radios = document.querySelectorAll('input[name="game-mode-radio"]');
        radios.forEach((r) => {
            r.checked = r.value === mode;
        });
        // Status-Bar-Item
        const statusItem = document.getElementById("status-mode");
        if (statusItem) {
            const labels = { frieden: "frieden", pfad: "pfad", schöpfer: "schöpfer" };
            statusItem.textContent = labels[mode] || mode;
        }
    }

    gameModeInitDOM() {
        if (typeof document === "undefined") return;
        const radios = document.querySelectorAll('input[name="game-mode-radio"]');
        radios.forEach((r) => {
            r.addEventListener("change", () => {
                if (r.checked) this.setGameMode(r.value);
            });
        });
        this._renderGameModeUI();
    }

    // Welle 6.H Phase 2E V2 — Proaktive-Sprache-Toggle. localStorage als
    // Wahrheit (überlebt Reload + Welt-Wechsel); state-Spiegel für Runtime-
    // Checks. Default ON (das Leben der Welt soll sichtbar sein).
    creatureSpeechInitDOM() {
        if (typeof document === "undefined") return;
        // Initial-Wert aus localStorage, sonst true.
        let enabled = true;
        if (typeof localStorage !== "undefined") {
            const raw = localStorage.getItem("anazh.creatureProactiveSpeech");
            if (raw === "0" || raw === "false") enabled = false;
        }
        this.state.creatureProactiveSpeechEnabled = enabled;
        const cb = document.getElementById("creature-speech-toggle");
        if (cb) {
            cb.checked = enabled;
            cb.addEventListener("change", () => {
                this.state.creatureProactiveSpeechEnabled = !!cb.checked;
                if (typeof localStorage !== "undefined") {
                    try {
                        localStorage.setItem("anazh.creatureProactiveSpeech", cb.checked ? "1" : "0");
                    } catch {
                        /* quota / private mode → silent */
                    }
                }
                this.log(cb.checked ? "Kreaturen-Stimmen aktiv" : "Kreaturen-Stimmen ruhen", "INFO");
            });
        }
    }

    // Einstellungen-Sektionen faltbar, generisch: der <h3> jeder <section> toggelt .collapsed (CSS blendet
    // den Rest aus). Falt-Zustand als Map in localStorage; Default alle offen. Idempotent — schon
    // verdrahtete Header (.collapsible-header) werden übersprungen.
    _initCollapsibleSettings() {
        // V17.37 D-2 — generisch: dasselbe Falt-Muster für die Einstellungen UND den HOF
        // (UI-Putz: Kreaturen + Fähigkeiten + Gesetze + Befehle vereint — der Ort, an dem
        // die Kommunikation zusammentrifft; einklappbare Sektionen halten ihn übersichtlich).
        this._initCollapsibleDrawer("einstellungen", "anazh.settings.collapsed");
        this._initCollapsibleDrawer("kreaturen", "anazh.hof.collapsed");
        // V18.34 — dasselbe EINE Falt-System auch im Ich/Inventar (kein zweites — V9.82):
        // die Sektionen tragen h4-Header; „Mehr: Wechseln & Markieren" ist default-collapsed
        // (der intuitive Pfad ist Was-du-trägst + Rezeptbuch; die Dropdowns sind die Tiefe).
        this._initCollapsibleSections("#inventory-overlay", "anazh.ich.collapsed", "h4");
    }

    _initCollapsibleDrawer(drawerName, storageKey) {
        // Dünner Wrapper auf den generischen Pfad — ein Drawer, h3-Header (V18.34: das EINE
        // Falt-System; das Inventar nutzt denselben Pfad mit #inventory-overlay + h4).
        this._initCollapsibleSections(`.drawer[data-drawer="${drawerName}"]`, storageKey, "h3");
    }

    _initCollapsibleSections(rootSelector, storageKey, headerSel = "h3") {
        if (typeof document === "undefined") return;
        const drawer = document.querySelector(rootSelector);
        if (!drawer) return;
        let stored = {};
        try {
            stored = JSON.parse(localStorage.getItem(storageKey) || "{}") || {};
        } catch {
            stored = {};
        }
        const sections = drawer.querySelectorAll("section.section, section.settings-section");
        sections.forEach((sec, i) => {
            const header = sec.querySelector(headerSel);
            if (!header || header.classList.contains("collapsible-header")) return;
            const key = sec.id || `${rootSelector}-sec-${i}`;
            header.classList.add("collapsible-header");
            header.setAttribute("role", "button");
            header.setAttribute("tabindex", "0");
            // Default-collapsed (z.B. das Entwickler-Render-Tuning): zu, solange der
            // Spieler nichts anderes wählte (kein localStorage-Eintrag für diese Sektion).
            const collapsed = key in stored ? stored[key] : sec.classList.contains("default-collapsed");
            if (collapsed) sec.classList.add("collapsed");
            const toggle = () => {
                sec.classList.toggle("collapsed");
                stored[key] = sec.classList.contains("collapsed");
                try {
                    localStorage.setItem(storageKey, JSON.stringify(stored));
                } catch {
                    /* quota / private mode → silent */
                }
            };
            // V18.80 — ein Klick/Tasten-Druck auf ein „?"-Help-Dot IM Header faltet NICHT (es
            // zeigt nur den P12-Hinweis; der Hinweis lebt jetzt im Header statt als Textwand).
            const onHelpDot = (event) => !!(event.target && event.target.closest && event.target.closest(".help-dot"));
            header.addEventListener("click", (event) => {
                if (onHelpDot(event)) return;
                toggle();
            });
            header.addEventListener("keydown", (event) => {
                if (onHelpDot(event)) return;
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle();
                }
            });
        });
    }

    // Stats-HUD über der Hotbar: SVG-Bars für HP + Stamina; Hover zeigt die langsamen Stats im Tooltip.
    // Refresh im Game-Loop, gedrosselt auf ~10 Hz.
    tickStatsHud(currentTime) {
        if (typeof document === "undefined") return;
        const last = this.state._statsHudLastTick || 0;
        if (currentTime - last < 0.1) return; // 10 Hz Throttle
        this.state._statsHudLastTick = currentTime;
        this._untertitelTakt();
        const hpFill = document.getElementById("stats-hud-hp-fill");
        const hpText = document.getElementById("stats-hud-hp-text");
        const stamFill = document.getElementById("stats-hud-stam-fill");
        const stamText = document.getElementById("stats-hud-stam-text");
        if (!hpFill || !hpText || !stamFill || !stamText) return;
        // hp/hpMax setzt erst recomputePlayerStats — rendert das HUD davor, gilt stats.hpMax für beide
        // (voll statt Schock-Anzeige 0/100 beim Boot).
        const p = this.state.player || {};
        const computedStats = p.stats || {};
        const fallbackHpMax = computedStats.hpMax || 100;
        const fallbackStamMax = computedStats.staminaMax || 100;
        const hp = Math.max(0, Math.round(typeof p.hp === "number" ? p.hp : fallbackHpMax));
        const hpMax = Math.max(1, Math.round(typeof p.hpMax === "number" ? p.hpMax : fallbackHpMax));
        const stam = Math.max(0, Math.round(typeof p.stamina === "number" ? p.stamina : fallbackStamMax));
        const stamMax = Math.max(1, Math.round(typeof p.staminaMax === "number" ? p.staminaMax : fallbackStamMax));
        const hpRatio = Math.max(0, Math.min(1, hp / hpMax));
        const stamRatio = Math.max(0, Math.min(1, stam / stamMax));
        // Welle 6.X.4 B3 V8.14 — neue Bar-Breite 166 (von 158), zusätzlicher
        // Glow-Strip oben drauf folgt derselben Breite.
        // Jeder Wert über den EINEN HUD-Schreiber (`_hudSchreib`): im Stand schreibt der 10-Hz-Takt nichts.
        this._hudSchreib(hpFill, 166 * hpRatio, "width");
        this._hudSchreib(document.getElementById("stats-hud-hp-glow"), 166 * hpRatio, "width");
        this._hudSchreib(stamFill, 166 * stamRatio, "width");
        this._hudSchreib(document.getElementById("stats-hud-stam-glow"), 166 * stamRatio, "width");
        this._hudSchreib(hpText, `${hp}/${hpMax}`);
        this._hudSchreib(stamText, `${stam}/${stamMax}`);
        // Mana-Row: Welt-Gesten kosten in pfad Mana (derselbe Kosten-Walker wie das Nexus-Wirk-Budget);
        // dritte Row derselben Familie (eine Quelle, eine Throttle), NUR in pfad sichtbar.
        const manaRow = document.getElementById("stats-hud-mana-row");
        if (manaRow) {
            const isPfad = typeof this.getGameMode === "function" && this.getGameMode() === "pfad";
            if (manaRow.hidden !== !isPfad) manaRow.hidden = !isPfad;
            if (isPfad) {
                const manaMax = Math.max(1, Math.round(typeof p.manaMax === "number" ? p.manaMax : 40));
                const mana = Math.max(0, Math.round(typeof p.mana === "number" ? p.mana : manaMax));
                const manaRatio = Math.max(0, Math.min(1, mana / manaMax));
                this._hudSchreib(document.getElementById("stats-hud-mana-fill"), 166 * manaRatio, "width");
                this._hudSchreib(document.getElementById("stats-hud-mana-glow"), 166 * manaRatio, "width");
                this._hudSchreib(document.getElementById("stats-hud-mana-text"), `${mana}/${manaMax}`);
            }
        }
        // V8.14 — HP-niedrig-Pulse: bei < 30 % bekommt der HUD eine
        // pulsierende rote Aura via CSS-Animation. Über 30 % wieder ruhig.
        const hud = document.getElementById("stats-hud");
        if (hud) {
            if (hpRatio < 0.3) hud.classList.add("stats-hud-low");
            else hud.classList.remove("stats-hud-low");
        }
        // Tooltip alle 1 s aktualisieren (slow stats ändern sich selten —
        // nur bei Soul/Equipped/Boost-Wechsel). Throttle damit Hover keine
        // permanenten Re-Builds triggert.
        const ttLast = this.state._statsHudTooltipLastTick || 0;
        if (currentTime - ttLast < 1.0) return;
        this.state._statsHudTooltipLastTick = currentTime;
        // M5 (V18.157, Befund 15) — die Boost-Chips zählen LIVE (im selben 1-s-Takt).
        this._tickBoostChips();
        const tooltip = document.getElementById("stats-hud-tooltip");
        if (!tooltip) return;
        const stats = (this.state.player && this.state.player.stats) || null;
        if (!stats) {
            this._hudSchreib(tooltip, "Stats nicht initialisiert");
            return;
        }
        const lines = [
            `Schaden       ${(stats.damage || 0).toFixed(1)}`,
            `Rückschlag    ${(stats.knockback || 0).toFixed(1)}`,
            // KAMPF-GEFÜHL — das Tempo liest die EINE Schwung-Quelle (Schwünge/s =
            // 1/Dauer ∝ 1/√I des Gehaltenen), nicht mehr die attackSpeed-Tag-Parallel-
            // Wahrheit (die als Kreatur-Profil weiterlebt — ihr Körper ist ihre Substanz).
            `Angriffstempo ${(1 / this._playerSwingDauer()).toFixed(2)}/s`,
            `Geschwindigk. ${(stats.speed || 0).toFixed(2)}`,
            `Sprungkraft   ${(stats.jumpPower || 0).toFixed(2)}`,
            `Präzision     ${(stats.precision || 0).toFixed(2)}`,
            `Verteidigung  ${(stats.defense || 0).toFixed(1)}`,
            `Magie-Resist  ${(stats.magicResist || 0).toFixed(2)}`,
            `Hitze-Resist  ${(stats.heatResist || 0).toFixed(2)}`,
        ];
        // Plus equipped + boosts kurz
        const eq = (this.state.player && this.state.player.equipped) || {};
        if (eq.tool) lines.push(`Werkzeug      ${eq.tool}`);
        if (eq.weapon) lines.push(`Waffe         ${eq.weapon}`);
        if (eq.armor) lines.push(`Rüstung       ${eq.armor}`);
        const boosts = (this.state.player && this.state.player.boosts) || [];
        const now = performance.now() / 1000;
        const activeBoosts = boosts.filter((b) => b.expiresAt > now);
        if (activeBoosts.length > 0) {
            lines.push(`Boosts        ${activeBoosts.length}`);
        }
        // <br>-getrennt damit das Tooltip schmal bleibt
        this._hudSchreib(tooltip, lines.join("<br>"), "html");
    }

    // ### Atmosphäre-Wurzel-Helper ###
    // Jede Atmosphäre-Schicht emergiert aus dem System, nicht aus Tabellen. Methoden mit dem
    // ATMOSPHERE-Marker prüft audit-strict (Atmosphäre-Hardcode-Audit: if-Type-Maps, Magic-Hz).

    // [ATMOSPHERE] Affinity-Pick: der Kandidat, dessen Compound-Tags am stärksten mit dem Welt-Feld an
    // (x, z) resonieren — Dot-Product über lebendig/dichte/glut/magieleitung, plus noise-Anteil (sonst
    // immer dieselbe Soul je Region). Liefert {pick, scoreMap} (Tests prüfen die Diskrimination).
    _affinityPickFromCandidates(candidates, fieldAtPos, noise = 0.15, rng = this._faunaRng()) {
        if (!Array.isArray(candidates) || candidates.length === 0) {
            return { pick: null, scoreMap: {} };
        }
        if (!fieldAtPos || typeof fieldAtPos !== "object") {
            // Ohne Welt-Feld kein Affinity-Pick → erster Kandidat
            return { pick: candidates[0], scoreMap: {} };
        }
        const axes = ["lebendig", "dichte", "glut", "magieleitung"];
        let bestPick = null;
        let bestScore = -Infinity;
        const scoreMap = {};
        for (const cand of candidates) {
            const tags = cand.tags || {};
            let score = 0;
            for (const ax of axes) {
                const fieldVal = fieldAtPos[ax] || 0;
                const tagVal = tags[ax] || 0;
                score += fieldVal * tagVal;
            }
            // Noise: kleine Streuung, damit nicht jeder Spawn identisch ist — aus dem Strom des Aufrufers (Γ5)
            score += (rng() - 0.5) * noise;
            scoreMap[cand.name || cand.id || "(unnamed)"] = score;
            if (score > bestScore) {
                bestScore = score;
                bestPick = cand;
            }
        }
        return { pick: bestPick, scoreMap };
    }

    // [ATMOSPHERE] Emotion-Modulator (pure): wendet die sechs Emotions-Achsen einer modSpec an
    // ({ joy: +0.1, awe: ×1.5, … }): Präfix '×' bzw. `mul` multipliziert, '+' bzw. `add` addiert
    // (Default additiv).
    _emotionModulate(baseValue, modSpec, emotions) {
        if (typeof baseValue !== "number" || !Number.isFinite(baseValue)) return baseValue;
        const e = emotions || (this.state.player && this.state.player.emotions) || {};
        const axes = ["joy", "awe", "sorrow", "hope", "peace", "chaos"];
        let result = baseValue;
        for (const ax of axes) {
            if (!modSpec || modSpec[ax] === undefined || modSpec[ax] === null) continue;
            const eVal = Math.max(0, Math.min(1, e[ax] || 0));
            const m = modSpec[ax];
            if (typeof m === "number") {
                result += m * eVal; // Additiv-Default
            } else if (m && typeof m === "object") {
                if (typeof m.mul === "number") result *= 1 + (m.mul - 1) * eVal;
                if (typeof m.add === "number") result += m.add * eVal;
            }
        }
        return result;
    }

    // DER LICHT-TAKT (K11) — der EINE Schreiber des Licht-Pools und der Fenster-Glut, je Bild vor dem Render (`_gameLoopTick`).
    // Die Plätze gehen an die Leuchtquellen, deren Reichweite dem Auge am nächsten kommt (`_leuchtQuellen`: das Licht des
    // Auges, jede Glut und jede Quelle mit Datum im Verzeichnis (die Laternen der Pläne), das wache Tor; neu gewählt je `wahlS`
    // oder nach `wahlM` Weg). Ein Platz hält seine Quelle, solange sie gewählt ist; eine abgewählte blendet in `blendeS` aus,
    // erst der freie Platz nimmt die nächste auf, und sie blendet ein — kein Licht springt. Die Stärke je Bild: das Emitter-
    // Datum über die EINE Übersetzung Labor → Welt (`_laborLichtStaerke`) × Masse (die Fläche der Glut) × Flackern auf der
    // Bild-Uhr (fachwerk `lichtFlackern`) × Zeitplan (`_lichtZeitplan`) × Blende. Der Ort steht in der Welt (der Stoff rechnet
    // ihn mit der Kamera seines Renderers). Unabhängig vom Klang. Lesbar für Linsen: `_leuchtPool.plaetze` (Quelle, Welt-Ort,
    // Stärke, Reichweite, Abfall, Kern, lineare Farbe, Himmels-Ersatz, Blende). Die Farbe aus der Farbtemperatur (`_lichtLinear`).
    _leuchtTakt() {
        const st = this.state;
        const atmo = st.atmoUniforms;
        const cam = st.camera;
        if (!atmo || !cam) return; // vor der Welt: kein Stoff liest den Pool
        const LP = AnazhRealm.LICHT_POOL;
        const LG = globalThis.__fachwerkCore.LICHT_GESETZ;
        for (const k in atmo.lichtGlut)
            this._lichtLinear(LG[k], atmo.lichtGlut[k].value).multiplyScalar(this._lichtZeitplan(LG[k].zeit));
        const pool =
            this._leuchtPool ||
            (this._leuchtPool = {
                t: -Infinity,
                uhr: -Infinity,
                x: NaN,
                y: NaN,
                z: NaN,
                wahl: [],
                halter: new Array(LP.plaetze).fill(null),
                blende: new Float32Array(LP.plaetze),
                plaetze: [],
            });
        const cp = cam.position;
        // Wahl-Takt und Blende sind ein GANG zu ihrem Fixpunkt (ein, aus), keine Phase des Bilds: sie gehen mit der Wanduhr
        // wie das Laden — unter der stehenden Bild-Uhr der Bühne (A9) blendete sonst keine Quelle je ein
        const jetzt = performance.now() / 1000;
        const schritt = Math.max(0, jetzt - pool.uhr) / LP.blendeS;
        pool.uhr = jetzt;
        if (jetzt - pool.t >= LP.wahlS || !(Math.hypot(cp.x - pool.x, cp.y - pool.y, cp.z - pool.z) < LP.wahlM)) {
            pool.t = jetzt;
            pool.x = cp.x;
            pool.y = cp.y;
            pool.z = cp.z;
            const q = this._leuchtQuellen(cp.x, cp.y, cp.z, LP.umkreisM, this._leuchtKegel(cam));
            q.sort((a, b) => a.rang - b.rang);
            pool.wahl = q.slice(0, LP.plaetze);
        }
        // die Plätze: gewählt bleibt und blendet ein, abgewählt blendet aus, der freie Platz nimmt die nächste Gewählte
        const H = pool.halter;
        for (let k = 0; k < H.length; k++) {
            const neu = H[k] && pool.wahl.find((w) => w.id === H[k].id);
            if (neu) {
                H[k] = neu;
                pool.blende[k] = Math.min(1, pool.blende[k] + schritt);
            } else if (H[k]) {
                pool.blende[k] = Math.max(0, pool.blende[k] - schritt);
                if (pool.blende[k] === 0) H[k] = null;
            }
        }
        for (const w of pool.wahl) {
            if (H.some((h) => h && h.id === w.id)) continue;
            const frei = H.indexOf(null);
            if (frei < 0) break;
            H[frei] = w;
            pool.blende[frei] = Math.min(1, schritt);
        }
        const c = this._leuchtC || (this._leuchtC = new THREE.Color());
        const t = this._bildZeit; // das Flackern auf der Bild-Uhr (A9)
        pool.plaetze.length = 0;
        for (let k = 0; k < H.length; k++) {
            const q = H[k];
            const lage = atmo.lichtLage[k].value;
            const farbe = atmo.lichtFarbe[k].value;
            const I = q ? this._leuchtStaerke(q, t) * pool.blende[k] : 0;
            if (!(I > 0)) {
                lage.set(0, 0, 0, 0);
                farbe.set(0, 0, 0, 0);
                atmo.lichtErsatz[k].value = 0;
                atmo.lichtKern[k].value = 0;
                continue;
            }
            if (q.quelle === "stahl") this._stahlGlut(); // das Licht des Stahls folgt der Hand und seiner Glut je Bild
            const L = q.L;
            // das Licht des Auges folgt ihm je Bild
            if (q.quelle === "auge") {
                q.x = cp.x;
                q.y = cp.y;
                q.z = cp.z;
            }
            lage.set(q.x, q.y, q.z, L.reichweiteM);
            this._lichtLinear(L, c);
            // der Bezug des Abfalls in 1 m (fachwerk `lichtAbfall`): der Stoff rechnet (d² + k²)^(−abfall/2), die Stärke trägt (1 + k²)^(abfall/2)
            const k2 = L.kernM * L.kernM;
            const In = I * Math.pow(1 + k2, L.abfall / 2);
            farbe.set(c.r * In, c.g * In, c.b * In, L.abfall);
            atmo.lichtErsatz[k].value = L.ersatz ? 1 : 0;
            atmo.lichtKern[k].value = k2;
            pool.plaetze.push({
                quelle: q.quelle,
                x: q.x,
                y: q.y,
                z: q.z,
                staerke: I,
                reichweite: L.reichweiteM,
                abfall: L.abfall,
                kern: L.kernM,
                farbe: [c.r, c.g, c.b],
                ersatz: !!L.ersatz,
                blende: pool.blende[k],
            });
        }
    }

    // DIE LICHTFARBE einer Quelle, linear, in die Farbe `c` (K11b): ein Wärmestrahler trägt seine Farbtemperatur (`kelvin`,
    // fachwerk `lichtFarbe` über den Planck-Ort) — das Feuer, die Glut, die Laterne, die Fenster und das Licht des Auges. Das
    // Tor ist kein Wärmestrahler: sein Datum (porta GLUT_GESETZ) trägt die Farbe als sRGB-Absicht, die das FARB-GESETZ linear
    // rechnet. Ein Datum ohne beides ist ein Bruch des Vertrags (laut, kein stiller Ersatz).
    _lichtLinear(L, c) {
        if (L.kelvin > 0) return c.setRGB(...globalThis.__fachwerkCore.lichtFarbe(L.kelvin));
        if (L.farbe == null) throw new Error("_lichtLinear: die Leuchtquelle trägt weder kelvin noch farbe");
        return c.set(L.farbe);
    }

    // DIE STÄRKE einer Quelle zur Bild-Uhr t (K11, A9): Datum × Flackern × Zeitplan über die EINE Übersetzung Labor → Welt × Masse.
    _leuchtStaerke(q, t) {
        const L = q.L;
        const fl = L.flacker ? L.flacker.amp * globalThis.__fachwerkCore.lichtFlackern(L, t, q.phase) : 0;
        return this._laborLichtStaerke(L.staerke * (1 + fl)) * q.masse * this._lichtZeitplan(L.zeit);
    }

    // DER SICHTKEGEL der Licht-Wahl (K10 × K11): das Frustum der Kamera des Bildes, je Wahl aus ihren Matrizen.
    _leuchtKegel(cam) {
        const F = this._leuchtFrustum || (this._leuchtFrustum = new THREE.Frustum());
        const m = this._leuchtKegelM || (this._leuchtKegelM = new THREE.Matrix4());
        cam.updateMatrixWorld();
        return F.setFromProjectionMatrix(
            m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse),
            cam.coordinateSystem
        );
    }

    // DIE LEUCHTQUELLEN um das Auge (x, y, z) im Umkreis R (K11), je mit stabiler Kennung (`id`) und Rang (der Abstand des
    // Auges zur Kugel ihrer Reichweite, 0 in ihr — dann der Abstand selbst, das Nächste zuerst): das Licht des Auges
    // (`_augenLeuchte`, am Auge: Rang 0), jeder Eintrag des Verzeichnisses „licht" (`_blockerMit`, gestempelt beim Eintritt)
    // mit seinem Emitter-Datum (`_lichtDatum`) — die Masse folgt der Fläche: trägt die Studio-Gestalt das Datum, ist es ihres
    // (Masse = Skala²); eine Glut ohne Datum der Gestalt trägt das Herdfeuer im Verhältnis ihrer Fläche zum Glutbett der
    // Studio-Feuerstelle (klang `bettRefM`, der Bezug des Knisterns); die Laterne eines Plans ist so ein Eintrag (die Gestalt
    // `laterne_dorf`, ihr Datum LICHT_GESETZ.laterne) — und das wache Tor (`_portalLeuchte`). Eine Quelle, die jetzt nicht brennt (Zeitplan 0), steht nicht zur Wahl.
    // Mit dem Sichtkegel `F` (`_leuchtKegel`) rangiert jede Quelle, deren Reichweiten-Kugel ihn nicht berührt, hinter allen,
    // die ihn berühren: sie erhellt kein Pixel des Bildes — die Laterne hinter dem Rücken nahm sonst den Platz der Laterne
    // vor dem Auge (die Gasse nachts: 1 von 6 Laternen im Bild hell). Freie Plätze nehmen sie weiter (das Drehen blendet).
    _leuchtQuellen(x, y, z, R, F) {
        const out = [];
        const t = this._bildZeit; // das Flackern auf der Bild-Uhr (A9)
        const kugel = F ? this._leuchtKugel || (this._leuchtKugel = new THREE.Sphere()) : null;
        const nimm = (id, q) => {
            const d = Math.hypot(q.x - x, q.y - y, q.z - z);
            if (d > R + q.L.reichweiteM || !(this._leuchtStaerke(q, t) > 0)) return;
            const imBild = !F || F.intersectsSphere(kugel.set(kugel.center.set(q.x, q.y, q.z), q.L.reichweiteM));
            out.push(Object.assign(q, { id, rang: (imBild ? 0 : 1e9) + Math.max(0, d - q.L.reichweiteM) * 1e3 + d }));
        };
        const auge = this._augenLeuchte;
        if (auge) nimm(auge, Object.assign({}, auge, { x, y, z }));
        const bett = AnazhRealm._umweltGesetz().UMWELT.stimmen.glut.bettRefM;
        const bezug = (Math.PI / 4) * bett * bett;
        for (const e of this._blockerMit("licht")) {
            const p = e.position;
            if (!p || (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) > R * R) continue;
            const L = this._lichtDatum(e);
            if (!L) continue; // das Datum ging mit dem Bauplan (das Verzeichnis stempelt beim Eintritt)
            const sk = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
            const a = this._lichtDatumDerGestalt(e) ? 0 : this._glutFlaeche(e);
            nimm(e, {
                quelle: e.type,
                x: p.x,
                y: p.y - 0.5 + (L.hoeheM || 0) * sk,
                z: p.z,
                L,
                masse: a > 0 ? a / bezug : sk * sk,
                phase: (((p.x * 12.9898 + p.z * 78.233) % 6.2832) + 6.2832) % 6.2832,
            });
        }
        // DER BRAND (feld.K3#2): jede glühende Zelle des Felds um das Auge (`_brandGlutUm`, die Blöcke ihres letzten Schritts) leuchtet
        // als Feuer über ihrer Mitte (`_brandOrt`), die Masse folgt der Glut
        const Lf = globalThis.__fachwerkCore.LICHT_GESETZ.feuer;
        this._brandGlutUm(x, z, R, (b) => {
            const o = b.ort || this._brandOrt(b);
            if ((o.x - x) * (o.x - x) + (o.z - z) * (o.z - z) > R * R) return;
            nimm(b, {
                quelle: "brand",
                x: o.x,
                y: o.y,
                z: o.z,
                L: Lf,
                masse: AnazhRealm.BRAND.licht * b.glut,
                phase: o.phase,
            });
        });
        // DIE LAVA (stoffe.K3-2): jede glühende Decke leuchtet als Feuer über ihrem Ort, die Masse folgt ihrer Glut (`_lavaZustand`)
        for (const a of this._tatIndex().lava) {
            if ((a.x - x) * (a.x - x) + (a.z - z) * (a.z - z) > R * R) continue;
            const g = this._lavaZustand(a).glut;
            if (!(g > 0)) continue;
            const phase = (((a.x * 12.9898 + a.z * 78.233) % 6.2832) + 6.2832) % 6.2832;
            const L = globalThis.__fachwerkCore.LICHT_GESETZ.feuer;
            nimm(a, { quelle: "lava", x: a.x, y: a.y + 1, z: a.z, L, masse: AnazhRealm.BRAND.licht * g, phase });
        }
        // DER STAHL DER ESSE (stoffe.K3-2): das glühende Gerät leuchtet an der Hand in der Farbe seiner Temperatur (`_stahlGlut`)
        const stahl = this._stahlGlut();
        if (stahl) nimm(stahl, stahl);
        const tor = this._portalLeuchte;
        if (tor) nimm(tor, Object.assign({}, tor));
        return out;
    }

    // DAS EMITTER-DATUM eines Eintrags (K11): die Zeile `fx.licht` des Studio-Rezepts seiner Gestalt (`studioGestalt` im
    // Gesetzbuch fachwerk, synchron geladen — die Feuerstelle trägt LICHT_GESETZ.feuer, dasselbe Rezept, das das Buch der Welt
    // reist: recipes.json), sonst für jede Glut (Brenn-Fläche > 0) das Herdfeuer des Gesetzbuchs. null: keine Leuchtquelle.
    _lichtDatum(entry) {
        const L = this._lichtDatumDerGestalt(entry);
        if (L) return L;
        return this._glutFlaeche(entry) > 0 ? globalThis.__fachwerkCore.LICHT_GESETZ.feuer : null;
    }

    // Das Emitter-Datum der Studio-Gestalt eines Eintrags (`fx.licht` ihres Rezepts) oder null.
    _lichtDatumDerGestalt(entry) {
        const FC = globalThis.__fachwerkCore;
        const bp = this.state.blueprints && typeof entry.type === "string" ? this.state.blueprints[entry.type] : null;
        const pre = bp && typeof bp.studioGestalt === "string" ? FC.PRESETS[bp.studioGestalt] : null;
        return pre && pre.fx && pre.fx.licht ? pre.fx.licht : null;
    }

    // DIE EINE ÜBERSETZUNG LABOR → WELT eines Punktlichts (K11): das r128-Labor rechnet ohne 1/π-Normierung — derselbe EINE
    // Faktor `LEGACY_LICHT`, durch den die Rig-Werte des Studios laufen; den Abfall rechnet der Stoff nach dem Gesetz (fachwerk
    // `lichtAbfall` in `_lichtPoolTerm`: 1/d^abfall mit Kern und Saum, K11b) — in 1 m trifft er die Stärke des Datums.
    _laborLichtStaerke(I) {
        return I > 0 ? AnazhRealm.LEGACY_LICHT * I : 0;
    }

    // DER ZEITPLAN EINER LEUCHTQUELLE (K11, fachwerk LICHT_GESETZ `zeit`: mittag · morgen · abend · nacht; ohne Zeitplan 1)
    // auf der EINEN Tag-Achse der Welt: ihr Kanal `nacht` (`_tagAchse`: 0 ab ~15° Sonnenhöhe, 1 am Horizont und darunter)
    // führt stückweise linear vom Mittag über die Dämmerung (Morgen vor, Abend nach der Mitte des Tages) in die Nacht.
    _lichtZeitplan(z) {
        if (!z) return 1;
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        const n = this._tagAchse(this._sonnenRichtung().y).nacht;
        const daemmer = ((t % 1) + 1) % 1 < 0.5 ? z.morgen : z.abend;
        return n <= 0.5
            ? z.mittag + (daemmer - z.mittag) * (n / 0.5)
            : daemmer + (z.nacht - daemmer) * ((n - 0.5) / 0.5);
    }
}

// DIE NAHT (scripts/lib/stamm.cjs schreibt und liest sie): jede Datei unter stamm/ trägt mit ihrem Naht-Ruf die Glieder
// ihrer Zonen-Klasse auf AnazhRealm — je Glied sein Deskriptor; erst die Methoden und Accessoren, dann die statischen
// Felder (wie die Klassen-Auswertung). Ein Zwilling bricht laut.
/* exported _stammZonen */
function _stammZonen(Ziel, zonen) {
    const tragen = (quelle, ziel, aus, felder) => {
        for (const k of Reflect.ownKeys(quelle)) {
            if (aus.includes(k)) continue;
            const d = Object.getOwnPropertyDescriptor(quelle, k);
            if (felder !== (d.enumerable === true)) continue;
            if (Object.prototype.hasOwnProperty.call(ziel, k))
                throw new Error(`Stamm-Zwilling: ${String(k)} (${quelle.name || quelle.constructor.name})`);
            Object.defineProperty(ziel, k, d);
        }
    };
    const statisch = ["length", "name", "prototype"];
    for (const Z of zonen) {
        tragen(Z.prototype, Ziel.prototype, ["constructor"], false);
        tragen(Z, Ziel, statisch, false);
    }
    for (const Z of zonen) tragen(Z, Ziel, statisch, true);
}

// ===== ATLAS · Dirigent/kern — Außen-Konstanten =====
// Welle 4 Phase 1 — Material-Tag-Achsen. Zehn Felder aus Konzept §2.2,
// kondensiert. Alle Werte 0..1. MATERIAL_TAG_DEFAULTS startet jeden Tag
// auf 0, damit `_defaultMaterials` nur die positiven Felder setzen muss.
// Welle 6.D Etappe 1 — Stat-Ableitung aus Tag-Profil. Sechs Spieler-Stats
// (HP-Max, Damage, Speed, JumpPower, Stamina-Max, Präzision) + zwei Resistenzen
// (MagicResist, HeatResist). Jede Formel nimmt das `tags`-Objekt und gibt
// eine Zahl zurück. Konstanten sind so gewählt, dass Mensch sich nahe an
// den heutigen Default-Werten (speed=6, jumpPower=12) bewegt, Phönix
// schneller+höher aber fragiler, Drache zäher aber langsamer.
//
// Wenn Du diese Werte tunen willst: dieselben Formeln bleiben, nur die
// Multiplikatoren ändern. Test-Setup (Welle 6.D Diskrimination) prüft die
// Verhältnisse, nicht die absoluten Zahlen.
//
// V9.86 — die einzige Versions-Quelle. Vorher (V7.82-Stand) war der String
// hardcoded in `log()` und der Init-Message — verlässlich versions-falsch
// nach jedem Bump. Jetzt: eine Klassen-Konstante, von beiden Stellen
// gelesen. Bei Version-Bumps nur HIER editieren + parallel zu
// `package.json`/`index.html` mitziehen (Doku-Disziplin).
// V18.491.88 — vehicle LEHREN Host-Leser/Chat (Spiegel porta-messen); iframe-Crossfade = Redesign later.
AnazhRealm.VERSION = "18.546.129";
// Die Terme des ersten Weltbilds (`_weltbildLuecken`, K60): je Leser des ersten Frames ein Name — gate:ankunft L2a stellt je
// Term einen Fall her, ein Term ohne Fall ist ROT.
AnazhRealm.WELTBILD_TERME = Object.freeze([
    "welt",
    "boden",
    "horizont",
    "licht",
    "leib",
    "buch",
    "bauten",
    "pflanzung",
    "streu",
    "karten",
    "dorf",
]);
// DER EINE MELDER (`_bruchMelden`, K22): dieselbe Bruch-Meldung wieder meldet sich höchstens alle BRUCH_WIEDER_MS mit ihrem
// Zähler; das Buch hält die jüngsten BRUCH_BUCH_MAX Meldungen
AnazhRealm.BRUCH_WIEDER_MS = 2000;
AnazhRealm.BRUCH_BUCH_MAX = 64;
// DIE SYNC-STELLEN (streaming.K4): nur hier baut der Haupt-Faden, was ein Faden baut — der Wasser-Fußabdruck eines Baus, die
// Test-Naht (forceSync: true, der Null-Renderer des Gates), `_drainDirtyVoxelChunks`; jeder andere Bau bricht laut
// (`_fadenUmgangen`), sein Rufer ist der erste Rahmen außerhalb der Bau-Kette
AnazhRealm.SYNC_STELLEN = ["fussabdruck", "naht", "drain"];
AnazhRealm.SYNC_KETTE = [
    "_fadenUmgangen",
    "_syncBauen",
    "_buildVoxelChunkData",
    "_acquireVoxelChunkBuild",
    "_rebuildVoxelChunk",
    "_ofenVorlage",
    "_ofenKreaturTemplate",
    "_ofenMenschTemplate",
];
// Das Ego-Auge über dem Leib-Zentrum (m): das Rig setzt die Ego-Kamera hier, das Auge der Stufen steht hier, bevor eine
// Kamera gesetzt ist (`_lodAuge`).
AnazhRealm.EGO_AUGE_M = 1.6;

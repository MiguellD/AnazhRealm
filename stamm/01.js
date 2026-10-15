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
// ===== DER STAMM — EINE Klasse, EIN Prototyp, viele Dateien (Zerlegung 13.10.) =====
// `AnazhRealm` ist EINE Klasse: dieser Kern (Konstruktor + §01) und die Zonen-Klassen `AnazhRealm_Z<NN[x]>` in
// stamm/NN[x].js. Die Naht (`_stammZonen`, gerufen am Kopf der ersten Außen-Datei stamm/26a.js) trägt ihre Glieder beim
// Laden auf den EINEN Prototyp — ein Zwilling bricht laut („Stamm-Zwilling"), eine fehlende Zone ist ein ReferenceError.
// Die Liste ist die der Stamm-Tags in index.html (jeder mit ?v=); Werkzeug liest den Stamm NUR über scripts/lib/stamm.cjs
// (`text()` ist der virtuelle Stamm, sha-gleich zur Umkehrung des Schnitts). Die Karte druckt `npm run atlas` live; die
// Ratsche (`node scripts/diag-atlas.cjs --check`): der Kern wächst nie, keine Datei über der Decke (dort teilt
// `node scripts/stamm-umzug.cjs --teile §NN <methode>`), kein Glied und keine Außen-Konstante doppelt.
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
    // ===== ATLAS §01 · KERN/BOOT — Konstruktor · state-Baum · init · Szene/Renderer-Boot =====
    constructor() {
        // ### Learnings ### [Stichwortartig optimieren, korrigieren, ergänzen – nie Wissen löschen!]
        // - Basis aus V7.57 bewahrt, erweitert für Unendlichkeit, Chat als Herz des Nexus in V7.66, Hylomorphismus-Crafting (Materialien × Form × Werkzeug × räumliche Emergenz × Maschinen-Rekursivität) in V7.66, Welten-Ultiversum-Bogen (Multi-Welt + Per-Welt-Seed + Position-Restore + Welt-Tor + Welt-Fusion + Rezepte-Import) in V7.67, Welt-Modifizierbarkeit (Ring 10.5 pro-Chunk-Delta) + Multi-User Position-Sync V1 (Ring 11 V1, WebSocket-Broker) in V7.68, DSL-AST-Broadcast für echtes Welt-Sync (Ring 11 V2) in V7.69, LAN-Fähigkeit + Sync-Korrektheit (Ring 11 V2.1: 0.0.0.0-bind, ws:/wss:-CSP, roomOverride, spawn_*-Embedding, NON_BROADCASTABLE_OPS) in V7.70, Intuitiver Multi-User-Setup (Ring 11.5: Modus-Wahl, Host-Banner mit Einladungs-Code, Auto-Welt-Snapshot beim Join) in V7.71, Welle 6.A — Interaktion-Polish (Wall-Sliding via Player-Friction-0, Erdung-Raycast-Robustheit für Bauwerke) in V7.72, Welle 6.G Phase 1 — Welt-Sinne (fliegende Inseln + Bäume kollidierbar via btBvhTriangleMeshShape/btCylinderShape, drei Dead-Code-DSL-Ops spawn_tree/island/ufo aktiviert, toter needsPhysics-Lazy-Pfad gelöscht) in V7.73, Welle 6.G Phase 1.5 — Hylomorphismus-Unification (Bäume sind jetzt Compound-Architekturen über baum_eiche/baum_kiefer-Baupläne mit Stamm:holz + Krone:laub, eigene spawnTreeAt + _buildTreeCollision gelöscht, Parallelcode → eine Sprache, plus Insel-Visual-Fix mit Underside + Lambert) in V7.74, Welle 6.G Phase 2 — Welt-Affinitäts-Feld (vier SimplexNoise-Schichten lebendig/dichte/glut/magieleitung, Baupläne spawnen wo ihre Compound-Tags resonieren — Wälder/Felsen/Magie-Zonen/Vulkan-Anker emergieren ohne Biome-Tabelle, populateChunkVegetation als Hook in ensureChunkAt + Initial-Worldgen, drei neue Built-in-Baupläne stein_block/kristall_geode/glutbrunnen, Stämme dicker für Spieler-Spürbarkeit, Culling-Tick 1Hz→2Hz, spawn-silent-Opt damit Worldgen die Welt-Effekt-Kaskade nicht überflutet) in V7.75, Welle 6.C2 — Spielmodi (frieden/pfad/schöpfer als Welt-Beziehungs-Schalter, frieden umarmt + pfad verhandelt + schöpfer gehorcht, damagePlayer + applyOpToPart-Stamina modus-gated, set_mode DSL-Op in NON_BROADCASTABLE_OPS, UI-Radio in Einstellungen + Status-Bar #status-mode, worldMeta.gameMode persistiert pro-Welt) in V7.76, Welle 6.C1 — Hylomorphismus-Inventar (27-Slot-Overlay mit Tab-Toggle, Tag-Resonanz emergiert aus Compound-Tags — resoniert summt + brennend glüht + magieleitung schimmert + lebendig sprießt, Audio-Hover-Ping via state.symphony, addToInventory stackt bei gleichem Bauplan-Namen, Inventar-Slot wählen → Hotbar-Slot Klick weist zu, add_to_inventory DSL-Op in NON_BROADCASTABLE_OPS, state.player.inventory[27] persistiert in buildStateSnapshot) in V7.77, Welle 6.A6 + 6.C3 — Maus-Aktionen + Keybindings (LMB abbauen Architektur am Raycast / kein Treffer → modify_terrain-Loch, RMB platzieren = confirmBuild im aktiven Bau-Modus, beide modus-gated mit MOUSE_ACTION_STAMINA_COST=5 in pfad / kostenlos in frieden+schöpfer, DEFAULT_KEYBINDINGS frozen mit 6 Aktionen break/place/confirmBuild/inventory/cancelBuild/jump, Konflikt-Auflösung als Swap statt Leerung, _eventToBindingCode unterstützt KeyboardEvent.code + Mouse0/1/2, Rebind-Capture-Workflow mit Escape-Abbruch, UI-Sektion in Einstellungen-Drawer mit „Ändern"-Button + Standard-Reset, alle 6 Listener konsultieren state.keybindings über _actionForBindingCode, Tab-Listener gated auf !keybindRebind damit Rebind nicht versehentlich Inventar toggelt, plus Vision-§1.2-Schließung _playArchitectureFarewellPing: abklingender Sinus-Ping beim Abbauen einer resoniert≥resonance_mild-Architektur — selber Audio-Graph wie Spawn-Singing, zeitlich gespiegelt; Stein-Block stumm als Vision-Disziplin, plus HUD dynamisch aus _formatBindingCode statt hartkodierte F/RMB/LMB-Strings, setKeybinding + resetKeybindings triggern automatisch HUD-Refresh) in V7.78, Welle 6.H Phase 1 — Kreaturen-Aufträge (drei Tasks wander/follow_player/wait als Beziehungs-Gesten zwischen Spieler und Kreatur, creature.userData.task-Datenmodell, assignCreatureTask als einziger Mutations-Pfad mit Aura-Trigger, _tickCreatureTaskDirection-Schicht in updateCreatures-Loop mit null-Fallback auf heutige Emotion-Logik bei wander, additives CanvasTexture-Aura-Sprite über der Kreatur in HSL-Hue je Task — grünlich für follow / bernstein für wait, drei DSL-Ops creature_task/creature_task_nearest/creature_task_all in NON_BROADCASTABLE_OPS, sechs Chat-Patterns folge mir/komm her/warte/erkunde/alle folgt mir/alle warten, Aura-Lifecycle via _refreshCreatureTaskAura mit Disposal in removeCreature, bewusst KEINE Save-Persistenz — Vision §1.1 Co-Schöpfer-Beziehung wird gesprochen nicht gespeichert, plus V2-Schließungen nach Schöpfer-Selbstaudit: _playCreatureTaskPing mit CREATURE_TASK_PING_FREQ je Task — follow_player=494Hz hell, wait=294Hz ruhig, wander=null stumm (Lösen der Bindung darf still sein), _journalCreatureTask schreibt relationship-Eintrag bei echtem Wechsel mit silent-Option für Spawn-Defaults, assignTaskToNearestCreature bei Leerschlag schreibt Chat-Output 'Keine Kreatur in der Nähe' + reach-Journal-Eintrag, _getCreatureTaskAuraTexture cached geteilte CanvasTexture analog 6.D Player-Aura statt pro Wechsel neu zu erzeugen, _renderTaskStatusUI füllt #status-tasks mit 'N folgen · M warten' bzw '—', describeProgram zeigt distance-Arg wenn gesetzt) in V7.79, Welle 6.H Phase 2A — Kreaturen-Hylomorphismus + Tab-UX (Kreaturen sind jetzt Multi-Mesh-Compounds aus bodyParts × Material — selbe Sprache wie Spieler-Seele 6.D und Architekturen 6.G P1.5; CREATURE_SOULS frozen mit drei Built-in-Identitäten sprite/wesen/geist; applyCreatureSoul-Mutations-Pfad baut Group + tauscht in state.creatures + state.rigidBodies, computeCreatureCompoundTags emergent aus parts via existing computeCompoundTags-Pipeline, Random-Name aus Pool als Identity-Anker, Kreaturen-Drawer UI komplett überarbeitet — Befehl-Buttons folge/komm her/warte/erkunde/alle folgt+warten als data-cmd plus Form-Dropdown vor Spawn-Buttons plus Kreatur-Liste mit Name+Form+Task+Aura-Hint, removeCreature dispoSed nun ganze Group sauber, color-lerp-Pfad in updateCreatures defensive für Groups) in V7.80, Welle 6.H Phase 2B.1 — Kreaturen sammeln + erinnern (Task `gather` mit args.material findet die nächste Architektur mit material in ihren Parts via _findNearestArchitectureWithMaterial, bewegt sich hin, entfernt sie bei haltDist=1.5m und legt sie ins Spieler-Inventar via existing addToInventory — eine Sprache; pro-Kreatur memory[]-Array mit Cap 30 + _creatureRemember-Helper trägt 'gathered'-Einträge mit material+blueprintName+timestamp; CREATURE_TASKS um 'gather' erweitert plus Aura-Hue cyan/200 + Ping-Freq G4/392Hz + describeProgram zeigt material; Chat-Pattern 'sammle <material>' für die 12 Built-in-Materialien plus generic-Pattern; creature_task-DSL-Op akzeptiert string-3rd-arg als material wenn taskName='gather'; gather-Task auto-zu-wander nach material erschöpft mit '_no_material'-memory-Eintrag; Kreatur-Liste zeigt 'sammelt <material>' als Task) in V7.82
        // - Nexus als Herz der Selbstentwicklung, steuert nun alles über Chat, unzerstörbar und unendlich
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
            feldPass: null, // der Feld-Pass des Fern-Rings
            deckStreu: null, // die Deck-Streu des Fernfelds
            chunkSaetze: null, // Map Art → Boden-/Wasser-/Bau-Satz (_chunkSatzEin)
            satzStoffe: null, // Map Bau-Satz-Art → { name, mat, wurf } (_bauSatzArt)
            bauSatzSchmutzig: null, // Map Gruppen-Schlüssel → Bau-Satz-Art, deren Bereich sich neu legt (_tickBauSatz)
            dorfRauchSatz: null, // die EINE Rauch-InstancedMesh (_dorfRauchZeichnen)
            _regionBundles: null, // Map Region → BundleGroup (_archRegionBundleFor)
            stlWege: null, // der Wege-Pool der Siedlungen
            _chunkIdbMiss: null, // Set der Chunk-Platten-Fehlgriffe
            _chunkIdbHits: 0,
            _chunkIdbHitByKey: null,
            _pfeile: null,
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
            // Live-Uniforms der TSL-Skybox (time, nebulaColor, cloudCover), init in createGalaxySkybox();
            // geschrieben von DSL skybox_color, _dayNightApplySkybox und _loopSkyboxZeit.
            skyboxUniforms: null,
            // V10.0-f-2 — Live-Uniforms des TSL-Stern-Felds (uniform-Knoten):
            // opacity (Tag/Nacht-Fade), pixelRatio (DPR-Konstante). Init in
            // _buildStarField(); mutiert von _dayNightApplyStarField.
            starFieldUniforms: null,
            // Live-Uniforms des TSL-Hydrosphären-Materials (time, flowSpeed, deep/shallow/foam, sunDir, light);
            // init in _ensureHydroSurfaceMaterial(), geschrieben von _loopSkyboxZeit (time) +
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
            keys: {},
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
            saveInterval: 10.0,
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
            weatherEffectTime: 0,
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
            // Studio-Übergabe: die LIVE-Bearbeitung reist aus dem Studio in die Welt (W12-Kanal "uebergabe",
            // Empfänger _studioUebergabeEmpfang, fail-closed). koerper = {s, gestalt} → Vorrang-Quelle von
            // _koerperStudioDials; kreatur = je Gattung {s} → gemischt in _tetrapodaStudioDials (geprägt beim
            // Guss, Bestand bleibt). Persistiert im Snapshot; Linse: gate:studio-uebergabe.
            studioUebergabe: { koerper: null, kreatur: {} },
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
            // Substanz-Uniforms (TSL: Mikro-Tiefe, Rim, Nacht-Boden, Mond-Rim …). Lazy beim ersten
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
                edgeSharp: 0.46,
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
                // Scatter + Promotion (Default an, im Browser für A/B abschaltbar): _tickScatterStreaming streut
                // den fernen Wald (InstancedMesh, deterministisch pcg2d) und kristallisiert nahe Bäume zu echten
                // Bauplänen (Touch→Real).
                gpuScatter: true,
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
            // Welle 6.G3 (V8.24) — Fauna-Lifecycle. Bei Unterpopulation
            // (< TARGET) gebären sich Kreaturen langsam, bei Überpopulation
            // (> MAX) verabschieden sich die ältesten mit Trauer-Effekt.
            faunaLifecycle: { lastTick: 0, lastBirthAt: 0, lastDeathAt: 0 },
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
                    nexus: { lastFired: -Infinity, cooldown: 60 },
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
                    nexus: [
                        "Ich habe etwas verschoben. Spürst du den Unterschied?",
                        "Eine kleine Änderung im Nexus. Sag mir, ob sie sich richtig anfühlt.",
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
            // Ring 2 – Nexus-DSL. Interpreter-State; siehe docs/nexus-dsl.md.
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
            // url + room steuern das Ziel; peers = Map<peerId, {pos, mesh, lastSeen}>. lastBroadcastAt
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
                lockstepDebug: false, // Smoke-/Diag-Haken: zeichnet Sende-/Ghost-Traces auf
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
            // Welt-Identität (Ring 8+, siehe docs/state-of-realm.md §11): die EINE Vorlage (`_weltMetaVorlage`), die auch
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
            // Lade-Rhythmus-Ring: der AKTIVE Ring (≤ chunkRingRadius) — startet klein, wächst zum Ziel bei
            // Frame-Kopfraum, schrumpft bei anhaltendem Über-Budget (_nexusPerfActuate); headless sofort Ziel.
            // null = lazy-init dort.
            _activeRingRadius: null,
            _ringRampLast: 0, // letzter Ring-Wachstums-/Schrumpf-Zeitstempel (der „Atem" zwischen Ringen)
            _ringOverBudgetSince: 0, // V18.306 — seit wann der Frame anhaltend über Budget ist (Schrumpf-Hysterese)
            _ringHeadroomSince: 0, // V18.318 — seit wann der Frame anhaltend Kopfraum hat (Wachs-Hysterese, symmetrisch)
            _ringBootWindowUntil: 0, // W4.4 — Ring-Boot-Fenster: 0=frisch · Timestamp=offen bis · 1=geschlossen
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
                // Ring 3 V2: alle sechs Achsen koppeln. Jede hat ihren eigenen
                // Cooldown, damit das Wechselspiel mehrerer Achsen nicht eine
                // einzige still hält.
                emotionLastApply: {
                    joy: -Infinity,
                    awe: -Infinity,
                    sorrow: -Infinity,
                    hope: -Infinity,
                    peace: -Infinity,
                    chaos: -Infinity,
                },
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
            lodRef:
                AnazhRealm.LOD_DISTANCES && Number.isFinite(AnazhRealm.LOD_DISTANCES.lodRef)
                    ? AnazhRealm.LOD_DISTANCES.lodRef
                    : 14,
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

    // ### Logging ###
    log(message, level = "INFO") {
        if (level === "DEBUG" && !this.state.debugLogging) return;
        // V9.86 — Versions-String aus der zentralen Klassen-Konstante statt
        // hardcoded (war seit V7.82 stale, jeder Bump driftete unsichtbar).
        const logMessage = `[AnazhRealm V${AnazhRealm.VERSION}] [${level}] ${message}`;
        this.state.logBuffer.push(logMessage);
        console.log(logMessage);
        if (this.state.logBuffer.length > this.state.maxLogEntries) {
            this.state.logBuffer.shift();
        }
        this.state.displayedLogs.push(logMessage);
        if (this.state.displayedLogs.length > this.state.maxLogEntries) {
            this.state.displayedLogs.shift();
        }
        this.flushLog();
    }
    logError(error) {
        const errorMessage = `[Error] ${error.message} at ${new Date().toISOString()}`;
        this.state.errorLog.push(errorMessage);
        this.log(errorMessage, "ERROR");
        if (this.state.errorLog.length > 50) this.state.errorLog.shift();
    }
    flushLog() {
        requestAnimationFrame(() => {
            const logDiv = document.getElementById("log");
            if (logDiv && this.state.displayedLogs.length > 0) {
                logDiv.textContent = this.state.displayedLogs.join("\n");
                logDiv.scrollTop = logDiv.scrollHeight;
            }
        });
    }

    // ### Ring 1 – Grok-Stimme ### (siehe docs/state-of-realm.md §5)
    grokInitDOM() {
        const grok = this.state.grok;
        grok.dialogueBox = document.getElementById("dialogue-box");
        try {
            const saved = localStorage.getItem("anazhRealmGrok");
            if (saved) grok.seenFirstSpawn = !!JSON.parse(saved).seenFirstSpawn;
        } catch {
            // Defektes Grok-State ignorieren; defaults gelten.
        }
        const toggle = document.getElementById("grok-voice-toggle");
        const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;
        if (toggle && speechSupported) {
            toggle.hidden = false;
            toggle.addEventListener("click", () => {
                grok.speechEnabled = !grok.speechEnabled;
                toggle.setAttribute("aria-pressed", grok.speechEnabled ? "true" : "false");
                toggle.textContent = grok.speechEnabled ? "Stimme: an" : "Stimme: aus";
            });
        }
    }

    grokSpeak(key) {
        const grok = this.state.grok;
        const now = performance.now() / 1000;
        if (now - grok.lastSpoke < grok.minGapSeconds) return false;
        const cfg = grok.triggers[key];
        if (cfg && now - cfg.lastFired < cfg.cooldown) return false;
        const pool = grok.pool[key];
        if (!pool || pool.length === 0) return false;
        const idx = grok.poolIndex[key] % pool.length;
        const text = pool[idx];
        // V9.95-e (Schöpfer-Browser-Audit-Folge): Defensive — wenn `text`
        // undefined ist (pool hat sparse-Array-Holes oder corrupted state),
        // den Sprech-Slot überspringen statt „Grok: undefined" zu loggen.
        if (typeof text !== "string" || text.length === 0) return false;
        grok.poolIndex[key] = (idx + 1) % pool.length;
        grok.lastSpoke = now;
        if (cfg) cfg.lastFired = now;
        this.grokRender(text);
        // Welle 6.X.4 F1 V8.13 — Begleiter-Name durchziehen statt hardcoded.
        this.log(`${grok.companionName || "Grok"}: ${text}`, "INFO");
        return true;
    }

    grokRender(text) {
        const grok = this.state.grok;
        // Ein leerer/fehlender Satz blankt den Dialog NIE: grokRender ist der EINE Sprech-Engpass, und
        // der Fade entfernt nur die visible-Klasse, nie den Text — ein geblankter Dialog bliebe leer.
        if (typeof text !== "string" || text === "") return;
        const box = grok.dialogueBox || document.getElementById("dialogue-box");
        if (box) {
            box.textContent = text;
            box.classList.add("visible");
            if (grok.fadeTimeout) clearTimeout(grok.fadeTimeout);
            grok.fadeTimeout = setTimeout(() => box.classList.remove("visible"), 8000);
        }
        if (grok.speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = "de-DE";
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                // Welle 6.X.4 D2 V8.15 — Stimme-Volume aus state.symphony.voiceVolume.
                // Default 1.0, Schieber in Einstellungen mutiert live.
                const voiceVol =
                    typeof this.state.symphony.voiceVolume === "number" ? this.state.symphony.voiceVolume : 1.0;
                utterance.volume = Math.max(0, Math.min(1, voiceVol));
                // W11 Phase 4 — die gewählte Begleiter-Stimme, falls vorhanden
                // (getVoices() lädt async; fehlt sie noch, greift der Default).
                const wantVoice = grok.companionVoice || "";
                if (wantVoice) {
                    const match = window.speechSynthesis.getVoices().find((v) => v.name === wantVoice);
                    if (match) utterance.voice = match;
                }
                window.speechSynthesis.speak(utterance);
            } catch {
                // Speech-API kann auf manchen Plattformen werfen; stumm fallback.
            }
        }
        // W11 Phase 4 (Voice-Sync) — wenn der Begleiter spricht, den Text an
        // alle Mitspieler senden; sie spielen ihn via SpeechSynthesis ab.
        // grokRender ist der EINE Sprech-Engpass (Trigger/Journal/LLM/dsl).
        if (this.state.p2p && this.state.p2p.enabled) this._p2pBroadcastCompanionSay(text);
    }

    grokMarkFirstSpawn() {
        const grok = this.state.grok;
        if (grok.seenFirstSpawn) return;
        grok.seenFirstSpawn = true;
        try {
            localStorage.setItem("anazhRealmGrok", JSON.stringify({ seenFirstSpawn: true }));
        } catch {
            // localStorage voll/blockiert – Grok wird beim nächsten Reload nochmal grüßen, kein Drama.
        }
        // Erst-Spawn-Satz mit eigenem Mini-Delay, damit der Spieler die Welt sieht bevor Grok spricht.
        setTimeout(() => this.grokSpeak("firstSpawn"), 1500);
    }

    grokTick(currentTime) {
        // Der proaktive Begleiter-Chatter wartet auf die Bühne (sonst plappert Grok, während der Boden
        // streamt). Der Erst-Spawn-Gruß (grokMarkFirstSpawn) bleibt unberührt; danach re-armen die Timer
        // sauber. Headless steht die Bühne sofort.
        if (!this._buehneSteht()) return;
        const grok = this.state.grok;
        const keys = this.state.keys || {};
        const moving = !!(keys["w"] || keys["a"] || keys["s"] || keys["d"] || keys[" "]);
        if (moving) {
            grok.idleSince = null;
        } else if (grok.idleSince === null) {
            grok.idleSince = currentTime;
        } else if (currentTime - grok.idleSince > 45) {
            this.grokSpeak("idle");
            grok.idleSince = currentTime; // einmal pro Idle-Phase, dann re-armen
        }

        // Sprung-Burst: steigende Flanke von isJumping erkennen, letzte 8 s zählen.
        if (this.state.isJumping && !grok.prevIsJumping) {
            grok.recentJumps.push(currentTime);
        }
        grok.prevIsJumping = this.state.isJumping;
        const cutoff = currentTime - 8;
        while (grok.recentJumps.length > 0 && grok.recentJumps[0] < cutoff) grok.recentJumps.shift();
        if (grok.recentJumps.length >= 4) {
            if (this.grokSpeak("jumpBurst")) grok.recentJumps.length = 0;
        }

        // Regen-Dauer beobachten (D5a: die wet-Frage — rainy UND stormy nässen).
        if (this._weatherIsWet() && !this._weatherIsWet(grok.prevWeather)) {
            grok.rainStartedAt = currentTime;
        } else if (!this._weatherIsWet()) {
            grok.rainStartedAt = null;
        }
        grok.prevWeather = this.state.weather;
        if (grok.rainStartedAt !== null && currentTime - grok.rainStartedAt > 60) {
            if (this.grokSpeak("rainLong")) grok.rainStartedAt = currentTime; // re-arm bis cooldown durch ist
        }

        // journalEvent: ist das Journal seit dem letzten Tick gewachsen, kommentiert Grok den jüngsten
        // Eintrag — grokSpeakFromJournal versucht zuerst das LLM, sonst/bei Fehler den Pool-Satz.
        const journalSize = (this.state.worldJournal && this.state.worldJournal.entries.length) || 0;
        if (grok.lastJournalSize === 0) {
            grok.lastJournalSize = journalSize;
        } else if (journalSize > grok.lastJournalSize) {
            const newest = this.state.worldJournal.entries[journalSize - 1];
            // Genesis-Eintrag selbst nicht extra kommentieren (firstSpawn
            // ist schon der Genesis-Anker).
            if (newest && newest.type !== "genesis") {
                this.grokSpeakFromJournal(newest);
            }
            grok.lastJournalSize = journalSize;
        }

        // Welle 3 E — emotionShift. Wenn eine Achse seit dem letzten Snapshot
        // um ≥ 0.4 gestiegen ist, kommentiert Grok kurz. Snapshot wird alle
        // ~10 s aktualisiert, damit langsame Drift den Trigger nicht zündet.
        const e = this.state.player && this.state.player.emotions;
        if (e) {
            if (!grok.emotionsSnapshot) grok.emotionsSnapshot = { ...e, takenAt: currentTime };
            if (currentTime - grok.emotionsSnapshot.takenAt >= 10) {
                for (const axis of Object.keys(e)) {
                    const prev = grok.emotionsSnapshot[axis] || 0;
                    const now = e[axis] || 0;
                    if (now - prev >= 0.4) {
                        this.grokSpeak("emotionShift");
                        break;
                    }
                }
                grok.emotionsSnapshot = { ...e, takenAt: currentTime };
            }
        }
        // W4 (V17.48) — die KI KOMMENTIERT nicht nur (emotionShift oben), sie TENDET: bei
        // anhaltend trüber Stimmung eine tröstende Geste (Ko-Regulation, Pfeiler 1/Symbiose).
        this._aiTendPlayer();
    }
}

// DIE NAHT (scripts/stamm-umzug.cjs schreibt sie, scripts/lib/stamm.cjs liest sie zurück): die Zonen-Klassen
// stamm/NN.js tragen ihre Glieder auf AnazhRealm — in Datei-Ordnung, je Glied sein Deskriptor; erst alle Methoden
// und Accessoren, dann die statischen Felder (wie die Klassen-Auswertung). Ein Zwilling bricht laut.
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

/**AnazhRealm V7.72 – Das Ultiversum Vollendet.
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
class AnazhRealm {
    constructor() {
        // ### Learnings ### [Stichwortartig optimieren, korrigieren, ergänzen – nie Wissen löschen!]
        // - Basis aus V7.57 bewahrt, erweitert für Unendlichkeit, Chat als Herz des Nexus in V7.66, Hylomorphismus-Crafting (Materialien × Form × Werkzeug × räumliche Emergenz × Maschinen-Rekursivität) in V7.66, Welten-Ultiversum-Bogen (Multi-Welt + Per-Welt-Seed + Position-Restore + Welt-Tor + Welt-Fusion + Rezepte-Import) in V7.67, Welt-Modifizierbarkeit (Ring 10.5 pro-Chunk-Delta) + Multi-User Position-Sync V1 (Ring 11 V1, WebSocket-Broker) in V7.68, DSL-AST-Broadcast für echtes Welt-Sync (Ring 11 V2) in V7.69, LAN-Fähigkeit + Sync-Korrektheit (Ring 11 V2.1: 0.0.0.0-bind, ws:/wss:-CSP, roomOverride, spawn_*-Embedding, NON_BROADCASTABLE_OPS) in V7.70, Intuitiver Multi-User-Setup (Ring 11.5: Modus-Wahl, Host-Banner mit Einladungs-Code, Auto-Welt-Snapshot beim Join) in V7.71, Welle 6.A — Interaktion-Polish (Wall-Sliding via Player-Friction-0, Erdung-Raycast-Robustheit für Bauwerke) in V7.72
        // - Nexus als Herz der Selbstentwicklung, steuert nun alles über Chat, unzerstörbar und unendlich
        this.state = {
            // ### Kern ###
            renderer: null,
            scene: null,
            camera: null,
            playerMesh: null,
            groundMesh: null,
            groundChunks: [],
            groundHeightField: null,
            terrainPhysicsBody: null,
            skybox: null,
            wallBoxes: [],
            floatingIslands: [],
            planets: [],
            minHeight: 0,
            maxHeight: 0,
            chunkSize: 16,
            chunkWidth: 300,
            chunkMap: new Map(),
            creatures: [],
            creatureEmotions: [],
            creatureAnimationTime: 0,
            creatureUpdateIndex: 0,
            ufos: [],
            waterfalls: [],
            keys: {},
            speed: 6,
            sprintSpeed: 12,
            jumpPower: 12.0,
            yaw: 0,
            pitch: 0,
            mouseSensitivity: 0.002,
            isPointerLocked: false,
            // Ring 5 V2 Vorbereitung: Kamera-Modus. "first" = Egoperspektive
            // (Kamera am Spieler-Kopf), "third" = Orbit hinter dem Spieler in
            // ~6 Einheiten Abstand. Im 3rd-Modus sieht der Spieler endlich
            // seine eigene Seele (Mesh + spätere Glieder/Animation).
            cameraMode: "first",
            cameraThirdDistance: 6,
            cameraThirdHeight: 2.0,
            physicsWorld: null,
            rigidBodies: [],
            playerBody: null,
            tmpTransform: null,
            scaleFactor: 1,
            gravity: -14.715,
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
            coyoteTime: 0.3,
            isInAir: false,
            // Welle 6.A3 — Slope-Steepness. `maxWalkableSlopeY` ist cos(maxAngle):
            // 0.5 = cos(60°), das heißt Slopes bis ~60° gelten als begehbar. Steiler
            // → `onSteepSlope=true`, Bewegungs-Input wird gedrosselt + Gravity
            // schiebt den Spieler hinab (Friction=0 ist die Voraussetzung dafür).
            // `groundNormalY` ist 1.0 wenn nicht geerdet (sentinel-flat).
            maxWalkableSlopeY: 0.5,
            groundNormalY: 1.0,
            onSteepSlope: false,
            frameCount: 0,
            lastFpsUpdate: 0,
            fps: 0,
            forward: new THREE.Vector3(),
            right: new THREE.Vector3(),
            moveDirection: new THREE.Vector3(),
            lookDirection: new THREE.Vector3(),
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
            maxCreatures: 120,
            maxLoadedChunks: 196,
            currentVersion: "7.71",
            terrainSteepness: 1.0,
            terrainBaseHeight: 0.0,
            weather: "sunny",
            weatherEffectTime: 0,
            noiseCache: new Map(),
            nexusLayers: new Map(),
            nexusCodeForge: {},
            nexusEvolutionQueue: [],
            nexusLastEvolution: 0,
            nexusEvolutionInterval: 10.0,
            nexusAutonomyLimit: 100,
            lastGrowthUpdate: 0,
            lastWallCollisionUpdate: 0,
            lastSelfAnalysis: 0,
            movementWorker: null,
            movementWorkerUrl: null,
            movementWorkerBusy: false,
            tmpVec1: null,
            tmpVec2: null,
            worldgenInFlight: false,
            // Sentinel: -Infinity heißt "noch nie generiert". Mit 0 würde der
            // Cooldown-Check ((performance.now()/1000) - 0 < 30) den allerersten
            // Worldgen blockieren, sodass das Spiel mit leerer Welt startete.
            lastWorldgen: -Infinity,
            worldgenCooldown: 30.0,
            terrainEverGenerated: false,
            lastJumpLog: 0,
            jumpLogInterval: 1.0,
            // Ring 1 – Grok-Stimme. Narrative Reflexionen, warm-pragmatisch,
            // selten (mindestens minGapSeconds zwischen Äußerungen). Persistiert
            // nur seenFirstSpawn via eigenen localStorage-Key, damit Grok nicht
            // bei jedem Reload den Erst-Spawn-Satz wiederholt.
            grok: {
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
                },
                // Hilfsfelder für die V2-Trigger
                lastJournalSize: 0,
                emotionsSnapshot: null,
                poolIndex: { firstSpawn: 0, idle: 0, jumpBurst: 0, rainLong: 0, nexus: 0 },
            },
            // Ring 2 – Nexus-DSL. Interpreter-State; siehe docs/nexus-dsl.md.
            // Pending sind geplante (delay'd) Sub-Programme, die in dslTick()
            // gefeuert werden, sobald `runAt` (Spielzeit in Sekunden) erreicht ist.
            dsl: {
                pending: [],
                nextEntryId: 1,
                abilities: [],
                history: [],
                historyCap: 500,
                maxConcurrent: 32,
                // Schicht 1 — Pattern-Memory. Spieler-Stichworte werden mit
                // dem Outcome ihres Folge-Programms verknüpft. Bei späterer
                // Erwähnung desselben Stichworts zieht der Generator aus dem
                // Memory statt rein zufällig. Cap pro Stichwort, FIFO.
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
            // Schicht 2 — Optionale LLM-Stimme. Vier Provider wählbar:
            //   anthropic  → Claude (kostet, klügste Antworten)
            //   google     → Gemini (großzügiges Free-Tier, Browser-CORS offen)
            //   openrouter → Aggregator mit Llama/Mistral-Modellen "*-:free"
            //   ollama     → lokaler Ollama-Server auf localhost:11434, kein Key
            // Pro Provider eigener Key + eigenes Modell im State; nur der
            // aktive Provider feuert. Alle Antworten werden zur gleichen
            // {say, program}-Form parst und gehen durch die DSL-Sandbox.
            llm: {
                enabled: false,
                provider: "anthropic",
                providerConfig: {
                    anthropic: { apiKey: "", model: "claude-haiku-4-5" },
                    google: { apiKey: "", model: "gemini-2.5-flash" },
                    openrouter: { apiKey: "", model: "meta-llama/llama-3.3-70b-instruct:free" },
                    ollama: { apiKey: "", model: "llama3.1", endpoint: "http://localhost:11434" },
                },
                inFlight: false,
                lastError: null,
                lastResponseAt: -Infinity,
                minGapSeconds: 3.0,
            },
            // Ring 11 V1: Multi-User Position-Sync via WebSocket-Broker
            // (signaling-server.js). enabled=true startet die Verbindung,
            // url+roomId steuern wohin verbunden wird. peers ist eine Map
            // <peerId, {pos, mesh, lastSeen}>. lastBroadcastAt drosselt
            // Position-Updates auf 30 Hz, sonst würde jeder Frame ein
            // Paket auslösen. V1 trägt KEIN DSL — fremde Welt-Logik wäre
            // ein Sandbox-Risiko bevor die Vertrauens-Grenzen klar sind.
            p2p: {
                enabled: false,
                url: "ws://127.0.0.1:4313",
                peerId: null,
                room: null,
                roomOverride: "",
                ws: null,
                peers: new Map(),
                broadcastIntervalMs: 33,
                lastBroadcastAt: 0,
                lastError: null,
                connected: false,
                // Ring 11.5: Rolle in dieser Welt. "solo" = lokale Welt,
                // p2p nicht gestartet. "host" = ich habe die Welt
                // erschaffen, andere joinen zu mir. "guest" = ich bin zu
                // einem Host gejoint, meine Welt ist eine Kopie. Wird
                // primär aus state.worldMeta.role gespiegelt; hier nur
                // Runtime-Convenience.
                role: "solo",
                pendingWorldSnapshot: false,
                // Ring 11.5: LAN-Adressen vom signaling-server (kommt im
                // welcome-Message). Wird vom Host für die Einladungs-URL
                // genutzt: nicht ws://127.0.0.1:..., sondern die LAN-IP,
                // die Mitspieler erreichen können.
                lanAddresses: [],
            },
            // Welt-Identität (Ring 8+, siehe docs/state-of-realm.md §11). Felder
            // werden jetzt schon gesetzt, damit das Save-Schema zukunftsfest
            // bleibt; Logik für Sichtbarkeit/Fusion kommt später.
            worldMeta: {
                worldId: null,
                slug: "",
                creator: "local",
                visibility: "private",
                parentWorlds: [],
                bornAt: 0,
                // Ring 8.1: jede Welt trägt ihren eigenen Terrain-Seed in
                // worldMeta. SimplexNoise(seed) macht ihn zur einzigen
                // Quelle der Welt-Geometrie. Bei neuen Welten zufällig,
                // bei der allerersten (Legacy-Migration) fallen wir auf
                // den historischen Default "anazh-realm-seed", damit der
                // Spieler seine erste Welt nicht visuell verliert.
                seed: null,
                schemaVersion: "8.0-multiworld-v1",
                chunkDeltas: {},
                // Ring 11.5: Welt-Beziehungs-Rolle.
                //   "solo"  = lokale, private Welt (Default)
                //   "host"  = ich erschuf diese Welt für Multi-User, lade andere ein
                //   "guest" = ich bin zu einem Host gejoint, Welt ist eine Kopie
                // Bei "host" und "guest" startet Multi-User-Sync automatisch
                // beim Init (statt manueller Toggle-Klick).
                role: "solo",
                // Ring 11.5: bei "guest" — wohin verbinden wir uns initial?
                // null bei solo/host. Wird beim Join-Pfad gefüllt mit
                // {url, roomId} aus dem Einladungs-Code.
                hostInfo: null,
            },
            // Welle 1 D — Welt-Journal. Geordnete Liste von Erinnerungen
            // (Genesis, erstes Wetter, erste Kreatur, hochfitness Programme,
            // Emotion-Peaks). Macht die Welt zur Person mit Geschichte,
            // auch wenn der LLM-Schalter aus ist. Wird beim Save persistiert
            // und vom LLM-System-Prompt als Erinnerungs-Auszug eingeblendet.
            worldJournal: {
                entries: [],
                entryCap: 200,
                seen: {},
            },
            // Ring 3 — Player-Emotionen. Sechs Achsen, jeweils 0..1.
            // Chat-Inputs füllen sie regelbasiert; im Game-Loop verflüchtigen
            // sie sich langsam; Schwellen-Trigger feuern DSL-Programme, sodass
            // Emotion direkt zur Welt wird (Vision-Pfeiler „Emotion treibt").
            // Ring 4 — anazhSymphony V1. Web Audio API, drei Klangschichten.
            // AudioContext bleibt null bis der Spieler über den Toggle eine
            // Geste macht (Browser-Policy). Headless-Playtest umgeht das mit
            // --autoplay-policy=no-user-gesture-required.
            symphony: {
                ctx: null,
                enabled: false,
                masterGain: null,
                ambient: null, // { osc1, osc2, lfo, lfoGain, filter, gain }
                weather: null, // { noise, filter, gain }
                lastWeather: null,
                creaturePingCount: 0,
            },
            player: {
                // Ring 5 V2 — Spieler-Seele. Drei Formen (human/phoenix/dragon)
                // mit Multi-Mesh-Group + sin/cos-Animation. Ammo-Body bleibt
                // identisch (rein visuell). Default "human".
                soul: "human",
                walkPhase: 0,
                animationLastTick: -Infinity,
                emotions: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 },
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
                // Schicht 1 — Pfad-Buckets. Histogramm wo der Spieler sich
                // aufhält (Höhe, Distanz, Wetter, Aktivität). Wird im Loop
                // alle pathSampleInterval Sekunden inkrementiert; alle Achsen
                // decayen langsam (0.99 pro Sample), damit sich Vorlieben
                // verschieben können statt einzufrieren.
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
            // Ring 6 — architectureTemplates. Liste aller Bauwerke (Daten,
            // ~50 Bytes/Eintrag). Save persistiert {type, position, seed,
            // scale} — der Mesh wird beim Laden aus dem Seed rekonstruiert.
            //
            // V2: kein Hard-Cap mehr. Stattdessen Distance-based Mesh-Culling
            // (Minecraft-Stil) — nur Strukturen innerhalb cullingRadius haben
            // einen Mesh im GPU; weiter entfernte sind nur Daten-Einträge.
            // Pro 1 s rotiert `tickArchitectureCulling` durch die Liste,
            // baut Meshes nahe Spieler (auf), disposed weite (ab). Save bleibt
            // unabhängig — Daten sind die Wahrheit, Mesh nur Sicht.
            architectures: [],
            architectureNextId: 1,
            architectureCullingRadius: 150,
            architectureCullingTickHz: 1.0,
            architectureCullingLastTick: -Infinity,
            // Ring 6.4 — Bauplan-Datenschicht. Map<name, blueprint>.
            // Built-ins werden im Konstruktor-Ende über _defaultBlueprints
            // gefüllt; eigene Baupläne (Editor 6.6) kommen dazu und werden
            // persistiert.
            blueprints: {},
            // Ring 6.5 — Hotbar (9 Slots) + Bau-Modus. Jeder Slot enthält
            // entweder einen Bauplan-Namen oder null. Tasten 1-9 wählen den
            // Slot — leerer Slot lässt den Modus aus, belegter Slot aktiviert
            // den entsprechenden Bauplan oder toggelt zurück, wenn er
            // bereits aktiv ist. F baut. ESC verlässt.
            hotbar: ["village", "temple", "waterfall", null, null, null, null, null, null],
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
        // Welle 4 Phase 1 — Materialien als Tag-Profile. Built-ins zuerst,
        // damit Baupläne (die per Part auf Material referenzieren können)
        // ihre Default-Material-Namen auflösen können. Materialien sind die
        // Substanz-Schicht des Hylomorphismus-Crafting; die zugehörige
        // Form-Tag-Aktivierungs-Matrix folgt in Phase 2.
        this.state.materials = this._defaultMaterials();
        // Welle 4 Phase 3 — Werkzeuge mit Präzisions-Caps. Jede Op braucht
        // ein Werkzeug, das sie ausführt; das Werkzeug liefert den Cap.
        // Starter-Tools sind beim Spieler ab Init im Besitz; eigene Werk-
        // zeuge (z. B. aus geschmiedeten Bauplänen — Welle 6) kämen via
        // späterer applyOp dazu, nicht aus dem DSL-Generator-Pool.
        this.state.tools = this._defaultTools();
        if (!this.state.player.tools) {
            this.state.player.tools = Object.values(this.state.tools)
                .filter((t) => t.isStarter)
                .map((t) => t.name);
        }
        // Ring 6.4 — Built-in-Baupläne als Daten registrieren. Wenn ein
        // Save später User-Baupläne hinzufügt (Editor 6.6), werden sie auf
        // dieses Default-Set draufgemerged.
        this.state.blueprints = this._defaultBlueprints();
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
        const logMessage = `[AnazhRealm V7.72] [${level}] ${message}`;
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
        grok.poolIndex[key] = (idx + 1) % pool.length;
        grok.lastSpoke = now;
        if (cfg) cfg.lastFired = now;
        this.grokRender(text);
        this.log(`Grok: ${text}`, "INFO");
        return true;
    }

    grokRender(text) {
        const grok = this.state.grok;
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
                window.speechSynthesis.speak(utterance);
            } catch {
                // Speech-API kann auf manchen Plattformen werfen; stumm fallback.
            }
        }
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

        // Regen-Dauer beobachten.
        if (this.state.weather === "rainy" && grok.prevWeather !== "rainy") {
            grok.rainStartedAt = currentTime;
        } else if (this.state.weather !== "rainy") {
            grok.rainStartedAt = null;
        }
        grok.prevWeather = this.state.weather;
        if (grok.rainStartedAt !== null && currentTime - grok.rainStartedAt > 60) {
            if (this.grokSpeak("rainLong")) grok.rainStartedAt = currentTime; // re-arm bis cooldown durch ist
        }

        // Welle 3 E — journalEvent. Wenn das Journal seit dem letzten Tick
        // gewachsen ist, kommentiert Grok den jüngsten Eintrag. LLM-Pfad:
        // grokSpeakFromJournal versucht zuerst eine LLM-Beobachtung; ohne
        // LLM oder bei Fehler fällt er auf den Pool-Satz zurück.
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
    }

    // Versucht, einen Journal-Eintrag via LLM in einen narrativen Satz zu
    // verwandeln. Bei aktivem LLM kommt eine lebendige Beobachtung; ohne
    // LLM (oder bei Fehler/Rate-Limit) fällt es auf den Pool zurück. Beide
    // Pfade respektieren den Standard-Throttle aus grokSpeak.
    grokSpeakFromJournal(entry) {
        const grok = this.state.grok;
        const cfg = grok.triggers.journalEvent;
        const now = performance.now() / 1000;
        if (now - grok.lastSpoke < grok.minGapSeconds) return false;
        if (cfg && now - cfg.lastFired < cfg.cooldown) return false;
        // LLM-Pfad: nur wenn aktiv und kein Inflight-Call läuft.
        if (this.state.llm && this.state.llm.enabled && !this.state.llm.inFlight) {
            const prompt = `In dir geschah gerade etwas: "${entry.text}" (Typ: ${entry.type}). Kommentiere es in einem kurzen Satz, in erster Person. Gib KEIN program — nur say.`;
            // Async ohne await: das Tick darf nicht blockieren. Erfolg/Fehler
            // werden im LLM-Status angezeigt; bei narrativer Antwort rendern
            // wir sie direkt.
            this.llmCall(prompt)
                .then((reply) => {
                    if (reply && reply.say) {
                        grok.lastSpoke = performance.now() / 1000;
                        if (cfg) cfg.lastFired = performance.now() / 1000;
                        this.grokRender(reply.say);
                        this.log(`Grok (LLM): ${reply.say}`, "INFO");
                    } else {
                        // Stiller Fallback auf Pool, ohne den Cooldown neu zu setzen.
                        this.grokSpeak("journalEvent");
                    }
                })
                .catch(() => {
                    this.grokSpeak("journalEvent");
                });
            return true;
        }
        return this.grokSpeak("journalEvent");
    }

    // ### Ring 2 – Nexus-DSL ### (siehe docs/nexus-dsl.md)
    // Sicherer JSON-AST-Interpreter. Programme sind Arrays `[op, ...args]`.
    // Drei Welten: Effekte mutieren state, Positionen liefern {x,y,z},
    // Conditions liefern boolean. Budgets verhindern Runaway-Programme.

    dslDefaultBudget() {
        return {
            spawnsLeft: 50,
            depthLeft: 8,
            maxRuntimeMs: 100,
            delayedSteps: 100,
            startedAt: performance.now(),
        };
    }

    dslCtx(opts = {}) {
        const seedRng = (s) => {
            // Deterministischer LCG, wenn ein Seed gegeben ist. Sonst Math.random.
            if (typeof s !== "number") return Math.random;
            let state = s >>> 0 || 1;
            return () => {
                state = (state * 1664525 + 1013904223) >>> 0;
                return state / 4294967296;
            };
        };
        return {
            state: this.state,
            realm: this,
            startTime: performance.now() / 1000,
            rng: seedRng(opts.seed),
            budget: opts.budget || this.dslDefaultBudget(),
            log: opts.log || [],
            source: opts.source || "unknown",
            programId: opts.programId || `prog_${this.state.dsl.nextEntryId++}`,
        };
    }

    dslRun(program, opts = {}) {
        const ctx = this.dslCtx(opts);
        const startedAt = performance.now() / 1000;
        const fpsBefore = this.state.fps || 0;
        const startY = this.state.playerMesh ? this.state.playerMesh.position.y : 0;
        const creaturesBefore = this.state.creatures.length;
        // Schicht 1 — Snapshot der Emotionen + Activity VOR dem Run. Wird vom
        // Finalizer (5 s später) mit "After"-Snapshot abgeglichen.
        const emotionsBefore = this.state.player ? { ...this.state.player.emotions } : null;
        const activityBefore = this.state.player
            ? {
                  moves: this.state.player.recentActivity.moves,
                  jumps: this.state.player.recentActivity.jumps,
                  chats: this.state.player.recentActivity.chats,
              }
            : null;
        try {
            this.dslEval(program, ctx);
        } catch (err) {
            ctx.log.push({ event: "interpreter_exception", message: err.message });
        }
        const outcome = {
            startedAt,
            fpsBefore,
            fpsAfter: this.state.fps || 0,
            playerYDelta: (this.state.playerMesh ? this.state.playerMesh.position.y : 0) - startY,
            creaturesDelta: this.state.creatures.length - creaturesBefore,
            errors: ctx.log.filter((e) => /error|exception|budget|unknown|invalid/.test(e.event)).length,
            emotionsBefore,
            activityBefore,
        };
        // Ring 11 V2: erfolgreiche Spieler-Programme (Chat-DSL, source="human")
        // werden über P2P an alle Mitspieler im selben Raum gebroadcastet.
        // Remote-empfangene Programme (source="remote:*") werden NICHT
        // weitergeleitet — sonst entstünde eine Endlos-Echo-Schleife. LLM-
        // und Nexus-Programme bleiben lokal (V2-Scope: nur explizite
        // Spieler-Geste, keine maschinellen Effekte).
        // V2.1: zusätzlich filtern wir Spieler-private Ops (player_*, set_visible)
        // raus — die ändern intimes State des Empfängers und sind nicht zur
        // Synchronisation gedacht.
        if (
            outcome.errors === 0 &&
            ctx.source === "human" &&
            this.state.p2p &&
            this.state.p2p.enabled &&
            this.state.p2p.connected
        ) {
            this.p2pBroadcastDsl(program);
        }
        return { ok: outcome.errors === 0, log: ctx.log, outcome, programId: ctx.programId };
    }

    // Ring 11 V2: DSL-Ops, die NICHT über P2P gesendet werden — sie ändern
    // intimes Spieler-State (Speed, Sprung, Seele, Sichtbarkeits-Toggles).
    // Wenn ein Programm einen dieser Ops irgendwo im Tree enthält, wird der
    // GANZE Broadcast übersprungen (sonst würde z. B. ["chain", weather,
    // player_speed] beim Empfänger den Speed mit-ändern).
    static get NON_BROADCASTABLE_OPS() {
        return new Set(["player_jump_power", "player_speed", "player_size_mul", "player_soul", "set_visible"]);
    }

    _dslContainsAnyOp(node, opSet) {
        if (!Array.isArray(node) || node.length === 0) return false;
        const head = node[0];
        if (typeof head === "string" && opSet.has(head)) return true;
        for (let i = 1; i < node.length; i++) {
            if (this._dslContainsAnyOp(node[i], opSet)) return true;
        }
        return false;
    }

    // Ring 11 V2.1: Helfer zum DSL-Broadcast. Vorher-Check (skip wenn nicht-
    // broadcastable Op enthalten). Sendet {type:"dsl", program}; Server
    // stempelt peerId und broadcastet an alle anderen im Raum. Empfänger
    // routet via p2pHandleMessage → dslRun mit source="remote:<peerId>".
    p2pBroadcastDsl(program) {
        if (!Array.isArray(program) || program.length === 0) return;
        if (this._dslContainsAnyOp(program, AnazhRealm.NON_BROADCASTABLE_OPS)) {
            // Programm enthält Spieler-private Op — bewusst lokal behalten.
            return;
        }
        this.p2pSend({ type: "dsl", program });
    }

    dslEval(program, ctx) {
        if (!Array.isArray(program) || program.length === 0) {
            ctx.log.push({ event: "invalid_program", program_id: ctx.programId });
            return;
        }
        if (ctx.budget.depthLeft <= 0) {
            ctx.log.push({ event: "budget_exceeded", budget: "depth", program_id: ctx.programId });
            return;
        }
        if (performance.now() - ctx.budget.startedAt > ctx.budget.maxRuntimeMs) {
            ctx.log.push({ event: "budget_exceeded", budget: "runtime", program_id: ctx.programId });
            return;
        }
        const op = program[0];
        const args = program.slice(1);
        const fn = this.dslEffects[op];
        if (!fn) {
            ctx.log.push({ event: "unknown_op", op: String(op), program_id: ctx.programId });
            return;
        }
        ctx.budget.depthLeft--;
        try {
            fn.call(this, args, ctx);
        } catch (err) {
            ctx.log.push({ event: "op_exception", op: String(op), message: err.message });
        }
        ctx.budget.depthLeft++;
    }

    dslEvalPos(node, ctx) {
        if (!Array.isArray(node) || node.length === 0) return { x: 0, y: 50, z: 0 };
        const fn = this.dslPositions[node[0]];
        if (!fn) {
            ctx.log.push({ event: "unknown_position_op", op: String(node[0]) });
            return { x: 0, y: 50, z: 0 };
        }
        try {
            return fn.call(this, node.slice(1), ctx);
        } catch {
            return { x: 0, y: 50, z: 0 };
        }
    }

    dslEvalCond(node, ctx) {
        if (!Array.isArray(node) || node.length === 0) return false;
        const fn = this.dslConditions[node[0]];
        if (!fn) {
            ctx.log.push({ event: "unknown_condition_op", op: String(node[0]) });
            return false;
        }
        try {
            return !!fn.call(this, node.slice(1), ctx);
        } catch {
            return false;
        }
    }

    dslClamp(v, lo, hi) {
        const n = Number(v);
        if (!Number.isFinite(n)) return lo;
        return Math.max(lo, Math.min(hi, n));
    }

    dslTick(currentTime) {
        const pending = this.state.dsl.pending;
        if (pending.length === 0) return;
        // Stabil ausführen: erst alle „fälligen" rausfiltern, dann auswerten.
        const ready = [];
        const keep = [];
        for (const entry of pending) {
            if (entry.runAt <= currentTime) ready.push(entry);
            else keep.push(entry);
        }
        this.state.dsl.pending = keep;
        for (const entry of ready) this.dslEval(entry.program, entry.ctx);
    }

    dslSchedule(delaySeconds, program, ctx) {
        if (this.state.dsl.pending.length >= this.state.dsl.maxConcurrent) {
            ctx.log.push({ event: "budget_exceeded", budget: "concurrent", program_id: ctx.programId });
            return;
        }
        const runAt = performance.now() / 1000 + Math.max(0, delaySeconds);
        this.state.dsl.pending.push({ runAt, program, ctx });
    }

    // ### Op-Tabellen ###
    get dslEffects() {
        if (this._dslEffectsCache) return this._dslEffectsCache;
        const c = (v, lo, hi) => this.dslClamp(v, lo, hi);
        this._dslEffectsCache = {
            weather: ([name]) => {
                if (name === "sunny" || name === "rainy") {
                    this.state.weather = name;
                    this.state.weatherEffectTime = 0;
                    this.updateSkyboxWeather();
                    this.updateCreatureEmotions();
                }
            },
            gravity: ([value]) => {
                const v = c(value, -30, 0);
                this.state.gravity = v;
                if (this.state.physicsWorld && this.state.tmpVec1) {
                    this.state.physicsWorld.setGravity(this.setVec(this.state.tmpVec1, 0, v, 0));
                }
            },
            terrain_steepness: ([value]) => {
                this.state.terrainSteepness = c(value, 0.1, 2.0);
            },
            terrain_base_height: ([value]) => {
                this.state.terrainBaseHeight = c(value, -50, 50);
            },
            // Ring 10.5: modify_terrain(x, z, radius, deltaHeight). Hebt oder
            // senkt das Höhenfeld in einer Scheibe um (x,z). Schreibt ein Op
            // in alle vom Radius berührten Chunk-Delta-Listen + wendet sofort
            // an, sofern der Chunk geladen ist. Beim Re-Ensure läuft
            // applyChunkDelta die gespeicherte Op-Liste durch — der Effekt
            // überlebt damit Chunk-Unload und Reload. Bewusst NICHT im
            // dslComposeAtomic-Pool: der Nexus soll Welt-Geometrie unter dem
            // Spieler nicht willkürlich umpflügen (gleiche Disziplin wie
            // terrain_steepness/-base_height, siehe CLAUDE.md gotcha).
            modify_terrain: ([x, z, radius, deltaHeight], ctx) => {
                const cx = Number(x);
                const cz = Number(z);
                if (!Number.isFinite(cx) || !Number.isFinite(cz)) {
                    ctx.log.push({ event: "modify_terrain_invalid_pos" });
                    return;
                }
                const r = c(radius, 0.5, 15);
                const dh = c(deltaHeight, -15, 15);
                const op = { type: "modify_terrain", x: cx, z: cz, r, dh, at: Date.now() };
                const affected = this._chunksTouchedByDisc(cx, cz, r);
                let stored = 0;
                for (const key of affected) {
                    if (this._appendChunkDeltaOp(key, op)) stored++;
                    const chunkData = this.state.chunkMap && this.state.chunkMap.get(key);
                    if (chunkData) this._applyModifyOpToChunk(chunkData, op);
                }
                ctx.log.push({
                    event: "modified_terrain",
                    x: cx,
                    z: cz,
                    r,
                    dh,
                    chunks: affected.length,
                    stored,
                });
            },
            time_of_day: ([value]) => {
                this.state.timeOfDay = c(value, 0, 1);
            },
            skybox_color: ([color]) => {
                // Die Skybox-Shader hat das Uniform `nebulaColor` (siehe
                // createGalaxySkybox). Vorher schrieb dieser DSL-Op fälschlich
                // in ein nicht existierendes `tintColor`-Uniform und war
                // daher seit Phase 1 ein stiller No-Op — Ring 3 V2 hat das
                // beim Trigger-Test bemerkt.
                if (typeof color !== "string") return;
                const skybox = this.state.skybox;
                if (skybox && skybox.material && skybox.material.uniforms && skybox.material.uniforms.nebulaColor) {
                    try {
                        skybox.material.uniforms.nebulaColor.value = new THREE.Color(color);
                    } catch {
                        // ungültige Farbe ignorieren
                    }
                }
            },
            spawn_creature: ([positionNode, count, emotion], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                const n = c(count, 1, 20);
                const e = emotion === "sad" || emotion === "happy" ? emotion : "happy";
                let spawned = 0;
                for (let i = 0; i < n; i++) {
                    if (ctx.budget.spawnsLeft <= 0) {
                        ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                        break;
                    }
                    ctx.budget.spawnsLeft--;
                    this.spawnCreatureAt(pos.x, pos.y, pos.z, e);
                    spawned++;
                }
                ctx.log.push({ event: "spawned_creature", count: spawned, emotion: e });
            },
            spawn_tree: ([positionNode, count], ctx) => {
                const n = c(count, 1, 20);
                const pos = this.dslEvalPos(positionNode, ctx);
                ctx.budget.spawnsLeft = Math.max(0, ctx.budget.spawnsLeft - n);
                ctx.log.push({ event: "spawn_tree_requested", count: n, pos });
            },
            spawn_island: ([positionNode, height], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                ctx.budget.spawnsLeft = Math.max(0, ctx.budget.spawnsLeft - 1);
                ctx.log.push({ event: "spawn_island_requested", pos, height: c(height, 1, 200) });
            },
            spawn_ufo: ([positionNode], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                ctx.budget.spawnsLeft = Math.max(0, ctx.budget.spawnsLeft - 1);
                ctx.log.push({ event: "spawn_ufo_requested", pos });
            },
            // Ring 6 — architectureTemplates. Drei Bau-Primitives. Position
            // kommt über die übliche Selektor-Form (`at_player`, `at_origin`,
            // `near_player N`). Jeder Bau zählt als 1 Spawn-Budget.
            // Ring 11 V2.1: optionales Seed-Argument für deterministisches
            // Visual bei Multi-User-Sync. Chat-Pattern + Schöpfer können das
            // Seed explizit setzen, sonst wird wie bisher zufällig erzeugt.
            // Beim Broadcast embed der Sender das verwendete Seed, damit
            // der Empfänger DIESELBEN Häuser sieht, nicht eigene.
            spawn_village: ([positionNode, seed], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const entry = this.spawnArchitecture("village", pos, { seed: s });
                ctx.log.push({ event: "spawned_village", id: entry ? entry.id : null, pos, seed: s });
            },
            spawn_temple: ([positionNode, seed], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const entry = this.spawnArchitecture("temple", pos, { seed: s });
                ctx.log.push({ event: "spawned_temple", id: entry ? entry.id : null, pos, seed: s });
            },
            spawn_waterfall: ([positionNode, seed], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const entry = this.spawnArchitecture("waterfall", pos, { seed: s });
                ctx.log.push({ event: "spawned_waterfall", id: entry ? entry.id : null, pos, seed: s });
            },
            // Ring 6.4 — generischer Bauplan-Spawn. Funktioniert mit jedem
            // Bauplan-Namen (built-in oder eigen): `["spawn_blueprint",
            // "mein-tempelplatz", ["at_player"]]`. Wird vom Hotbar (6.5)
            // und Werkstatt (6.6) als universeller Pfad benutzt.
            spawn_blueprint: ([name, positionNode, seed], ctx) => {
                if (typeof name !== "string") {
                    ctx.log.push({ event: "invalid_blueprint_name", name });
                    return;
                }
                const bp = this.state.blueprints && this.state.blueprints[name];
                if (!bp) {
                    ctx.log.push({ event: "unknown_blueprint", name });
                    return;
                }
                const pos = this.dslEvalPos(positionNode, ctx);
                if (ctx.budget.spawnsLeft <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                    return;
                }
                ctx.budget.spawnsLeft--;
                const s = Number.isFinite(Number(seed)) ? Number(seed) >>> 0 : Math.floor(ctx.rng() * 0xffffffff);
                const entry = this.spawnArchitecture(name, pos, { seed: s });
                ctx.log.push({ event: "spawned_blueprint", name, id: entry ? entry.id : null, pos, seed: s });
            },
            // Welle 2 B — Schöpfer-Werkzeuge. Der LLM (oder Chat-Befehl) kann
            // eigene Baupläne und Fähigkeiten erschaffen, nicht nur bestehende
            // ausführen. Whitelist-Validierung: nur die acht bekannten Shapes
            // + blueprint-Referenz, parts-Cap 32, kein Built-in-Überschreiben.
            define_blueprint: ([name, parts], ctx) => {
                const valid = this.validateBlueprintParts(parts);
                if (!valid.ok) {
                    ctx.log.push({ event: "blueprint_validation_failed", reason: valid.reason });
                    return;
                }
                const result = this.createOrUpdateBlueprintFromDsl(name, valid.parts);
                ctx.log.push({
                    event: result.ok ? "defined_blueprint" : "define_blueprint_failed",
                    name: result.name,
                    reason: result.reason,
                });
                if (result.ok) {
                    this.journalAppend("growth", `Ein neuer Bauplan entstand: ${result.name}.`, {
                        name: result.name,
                        parts: valid.parts.length,
                    });
                }
            },
            // Welle 4 Phase 1 — Schöpfer-Werkzeug für Materialien. Tags werden
            // in defineMaterial whitelistet + ge-clamp; Built-in-Materialien
            // bleiben unberührbar. Color ist optional, default grau.
            define_material: ([name, color, tags], ctx) => {
                const result = this.defineMaterial(name, color, tags);
                ctx.log.push({
                    event: result.ok ? "defined_material" : "define_material_failed",
                    name: result.name,
                    reason: result.reason,
                });
                if (result.ok) {
                    this.journalAppend("growth", `Eine neue Substanz wurde benannt: ${result.name}.`, {
                        name: result.name,
                    });
                }
            },
            // Welle 4 Phase 3 — opChain via Werkzeug. Bewusst NICHT im
            // Generator-Pool (dslComposeAtomic), damit der Nexus nicht
            // willkürlich Werkstücke poliert. Pfad: Chat-Befehl/LLM/Spieler-
            // UI. Tool muss im Besitz sein, Material × Op-Klasse muss passen.
            // Welle 5 C — Bauplan als Werkzeug markieren + registrieren.
            // Zwei separate Ops, damit der Spieler erst opName/opClass setzt,
            // dann bewusst „registriere" drückt (Snapshot der aktuellen
            // Präzision wandert in state.tools). Auch hier NICHT im
            // dslComposeAtomic-Pool — Werkzeug-Erschaffung ist Schöpfer-Geste.
            set_tool_meta: ([blueprintName, opName, opClass], ctx) => {
                const r = this.setBlueprintToolMeta(blueprintName, opName, opClass);
                ctx.log.push({
                    event: r.ok ? "set_tool_meta" : "set_tool_meta_failed",
                    blueprint: blueprintName,
                    opName,
                    opClass,
                    reason: r.reason,
                });
            },
            register_tool: ([blueprintName], ctx) => {
                const r = this.registerBlueprintAsTool(blueprintName);
                ctx.log.push({
                    event: r.ok ? "registered_tool" : "register_tool_failed",
                    blueprint: blueprintName,
                    precisionCap: r.precisionCap,
                    reason: r.reason,
                });
                if (r.ok) {
                    this.journalAppend(
                        "growth",
                        `Ein eigenes Werkzeug entstand: ${blueprintName} (Cap ${r.precisionCap.toFixed(2)}).`,
                        { tool: blueprintName, cap: r.precisionCap }
                    );
                }
            },
            // Welle 5 A — Verbindung zwischen zwei Parts setzen. Auch hier
            // bewusst NICHT im dslComposeAtomic-Pool: Verbindungen sind
            // explizite Geste, kein Zufalls-Brei.
            apply_connection: ([blueprintName, type, partA, partB], ctx) => {
                const result = this.addConnectionToBlueprint(blueprintName, {
                    type,
                    partA: Number(partA),
                    partB: Number(partB),
                });
                ctx.log.push({
                    event: result.ok ? "applied_connection" : "apply_connection_failed",
                    blueprint: blueprintName,
                    type,
                    partA,
                    partB,
                    reason: result.reason,
                });
            },
            apply_op: ([blueprintName, partIndex, toolName], ctx) => {
                const result = this.applyOpToPart(blueprintName, Number(partIndex), toolName);
                ctx.log.push({
                    event: result.ok ? "applied_op" : "apply_op_failed",
                    blueprint: blueprintName,
                    partIndex,
                    tool: toolName,
                    reason: result.reason,
                    precision: result.precision,
                });
            },
            define_ability: ([name, program], ctx) => {
                if (typeof name !== "string" || name.length === 0 || name.length > 40) {
                    ctx.log.push({ event: "invalid_ability_name", name });
                    return;
                }
                if (!Array.isArray(program) || program.length === 0) {
                    ctx.log.push({ event: "invalid_ability_program", name });
                    return;
                }
                // Sandbox: Tiefen-Cap und kein verschachteltes define_*.
                const depth = this.dslEstimateDepth(program);
                if (depth > 6) {
                    ctx.log.push({ event: "ability_depth_exceeded", name, depth });
                    return;
                }
                if (
                    this.dslContainsOp(program, "define_blueprint") ||
                    this.dslContainsOp(program, "define_ability") ||
                    this.dslContainsOp(program, "define_material")
                ) {
                    ctx.log.push({ event: "ability_nested_define_forbidden", name });
                    return;
                }
                const safeName = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
                if (!safeName) {
                    ctx.log.push({ event: "invalid_ability_name_after_sanitize", name });
                    return;
                }
                this.addNewAbility(safeName, program, "llm");
                this.journalAppend("growth", `Eine neue Fähigkeit ruht in mir: ${safeName}.`, { name: safeName });
                ctx.log.push({ event: "defined_ability", name: safeName });
            },
            // Ring 6 V2 — Fraktal-Bau. Eine Wurzel-Struktur, hexagonal
            // umringt von 6 Sub-Strukturen mit `ratio`-Skalierung; jede
            // Sub-Struktur rekursiv das gleiche bis `depth` 0. Mit
            // depth=2/ratio=0.5 entstehen 1+6+36 = 43 Strukturen, die
            // dank Distance-Culling (V2) nicht alle gleichzeitig im GPU
            // liegen müssen. Pfeiler 3 der Vision (Fraktales Wachstum)
            // konkret im Code.
            spawn_fractal: ([positionNode, type, depth, ratio, rootSeedArg], ctx) => {
                const pos = this.dslEvalPos(positionNode, ctx);
                const validTypes = { village: true, temple: true, waterfall: true };
                const t = typeof type === "string" && validTypes[type] ? type : "temple";
                const d = c(depth, 0, 3);
                const r = c(ratio, 0.2, 0.8);
                let spawned = 0;
                const visit = (cx, cz, scale, level, parentSeed) => {
                    if (ctx.budget.spawnsLeft <= 0) {
                        ctx.log.push({ event: "budget_exceeded", budget: "spawns", program_id: ctx.programId });
                        return;
                    }
                    ctx.budget.spawnsLeft--;
                    spawned++;
                    const childSeed = (parentSeed * 16807 + level * 31) >>> 0;
                    this.spawnArchitecture(t, { x: cx, y: pos.y, z: cz }, { seed: childSeed, scale });
                    if (level >= d) return;
                    const childRadius = 14 * scale;
                    for (let i = 0; i < 6; i++) {
                        const angle = (i / 6) * Math.PI * 2;
                        const ncx = cx + Math.cos(angle) * childRadius;
                        const ncz = cz + Math.sin(angle) * childRadius;
                        visit(ncx, ncz, scale * r, level + 1, childSeed + i);
                    }
                };
                // Ring 11 V2.1: rootSeed kann explizit gesetzt werden (Multi-
                // User-Sync). Sonst wie bisher: ctx.rng-basiert.
                const rootSeed = Number.isFinite(Number(rootSeedArg))
                    ? Number(rootSeedArg) >>> 0
                    : Math.floor(ctx.rng() * 0xffffffff);
                visit(pos.x, pos.z, 1, 0, rootSeed);
                ctx.log.push({
                    event: "spawned_fractal",
                    type: t,
                    depth: d,
                    ratio: r,
                    count: spawned,
                    seed: rootSeed,
                });
            },
            creatures_color: ([color]) => {
                if (typeof color !== "string") return;
                let tint = null;
                try {
                    tint = new THREE.Color(color);
                } catch {
                    return;
                }
                for (const cr of this.state.creatures) {
                    if (cr.material && cr.material.color) cr.material.color.copy(tint);
                }
            },
            creatures_emotion: ([emotion]) => {
                if (emotion !== "happy" && emotion !== "sad") return;
                for (let i = 0; i < this.state.creatureEmotions.length; i++) this.state.creatureEmotions[i] = emotion;
            },
            creatures_speed_mul: ([factor]) => {
                const f = c(factor, 0.1, 5);
                for (const cr of this.state.creatures) {
                    if (cr.userData) cr.userData.speedMul = (cr.userData.speedMul || 1) * f;
                }
            },
            creatures_size_mul: ([factor]) => {
                const f = c(factor, 0.5, 3);
                for (const cr of this.state.creatures) {
                    if (cr.scale) cr.scale.multiplyScalar(f);
                }
            },
            player_jump_power: ([value]) => {
                this.state.jumpPower = c(value, 5, 40);
            },
            player_speed: ([value]) => {
                this.state.speed = c(value, 1, 30);
            },
            player_size_mul: ([factor]) => {
                const f = c(factor, 0.5, 2);
                if (this.state.playerMesh && this.state.playerMesh.scale) {
                    this.state.playerMesh.scale.multiplyScalar(f);
                }
            },
            player_soul: ([name]) => {
                // Ring 5: Seele wechseln. Bewusst NICHT im
                // dslComposeAtomic-Pool (siehe playerSoulDefs-Kommentar) —
                // der Nexus soll dem Menschen die Identität nicht
                // umschreiben. Aber als DSL-Op verfügbar, damit Chat,
                // Abilities und künftige Trigger denselben Pfad nutzen.
                this.applyPlayerSoul(typeof name === "string" ? name : "");
            },
            set_visible: ([target, visible], ctx) => {
                // Whitelist hält die Safety-Surface klein: nur grob steuerbare
                // Welt-Schichten, keine beliebigen Mesh-Namen. Wer mehr Targets
                // braucht, fügt neue Primitives hinzu (Doc-Review nötig).
                const v = !!visible;
                if (target === "terrain") this.toggleTerrain(v);
                else if (target === "creatures") this.toggleCreatures(v);
                else ctx.log.push({ event: "invalid_set_visible_target", target: String(target) });
            },
            record_narrative: ([text]) => {
                if (typeof text !== "string") return;
                const trimmed = text.trim();
                if (!trimmed) return;
                // Cap auf 500 Zeichen verhindert, dass ein Programm die Knowledge-
                // Base mit einem Riesen-String volllaufen lässt.
                const capped = trimmed.length > 500 ? trimmed.slice(0, 500) : trimmed;
                this.addKnowledge("narrative", capped);
            },
            say: ([message]) => {
                if (typeof message !== "string" || message.length === 0) return;
                // DSL-`say` hängt an Grok an, statt eigenen Output zu bauen. Damit
                // teilen Mensch und Nexus dieselbe Stimme — ein Pfeiler der Vision.
                const grok = this.state.grok;
                if (!grok.pool.dslSay) {
                    grok.pool.dslSay = [];
                    grok.poolIndex.dslSay = 0;
                    grok.triggers.dslSay = { lastFired: -Infinity, cooldown: 30 };
                }
                grok.pool.dslSay[0] = message;
                grok.poolIndex.dslSay = 0;
                this.grokSpeak("dslSay");
            },

            // Control-Flow
            chain: (args, ctx) => {
                for (const sub of args) this.dslEval(sub, ctx);
            },
            delay: ([seconds, sub], ctx) => {
                const s = c(seconds, 0, 60);
                if (ctx.budget.delayedSteps <= 0) {
                    ctx.log.push({ event: "budget_exceeded", budget: "delayed_steps", program_id: ctx.programId });
                    return;
                }
                ctx.budget.delayedSteps--;
                this.dslSchedule(s, sub, ctx);
            },
            repeat: ([times, sub], ctx) => {
                const n = c(times, 1, 20);
                for (let i = 0; i < n; i++) {
                    if (ctx.budget.delayedSteps <= 0) break;
                    this.dslEval(sub, ctx);
                }
            },
            random: (args, ctx) => {
                if (args.length === 0) return;
                const pick = args[Math.floor(ctx.rng() * args.length)];
                this.dslEval(pick, ctx);
            },
            random_weighted: (args, ctx) => {
                const items = args.filter((a) => a && typeof a === "object" && Array.isArray(a.effect));
                if (items.length === 0) return;
                const total = items.reduce((s, x) => s + Math.max(0, Number(x.weight) || 0), 0);
                if (total <= 0) return this.dslEval(items[0].effect, ctx);
                let r = ctx.rng() * total;
                for (const x of items) {
                    r -= Math.max(0, Number(x.weight) || 0);
                    if (r <= 0) return this.dslEval(x.effect, ctx);
                }
                this.dslEval(items[items.length - 1].effect, ctx);
            },
            when: ([condition, thenBranch, elseBranch], ctx) => {
                if (this.dslEvalCond(condition, ctx)) this.dslEval(thenBranch, ctx);
                else if (elseBranch) this.dslEval(elseBranch, ctx);
            },
            parallel: (args, ctx) => {
                for (const sub of args) this.dslEval(sub, ctx);
            },
        };
        return this._dslEffectsCache;
    }

    get dslPositions() {
        if (this._dslPositionsCache) return this._dslPositionsCache;
        const c = (v, lo, hi) => this.dslClamp(v, lo, hi);
        this._dslPositionsCache = {
            at_player: (_args, ctx) => {
                const p = ctx.state.playerMesh ? ctx.state.playerMesh.position : { x: 0, y: 50, z: 0 };
                return { x: p.x, y: p.y, z: p.z };
            },
            near_player: ([radius], ctx) => {
                const r = c(radius, 1, 100);
                const p = ctx.state.playerMesh ? ctx.state.playerMesh.position : { x: 0, y: 50, z: 0 };
                const angle = ctx.rng() * Math.PI * 2;
                const dist = ctx.rng() * r;
                return { x: p.x + Math.cos(angle) * dist, y: p.y, z: p.z + Math.sin(angle) * dist };
            },
            at_origin: () => ({ x: 0, y: 50, z: 0 }),
            random_position: ([range], ctx) => {
                const r = c(range, 1, 500);
                return { x: (ctx.rng() - 0.5) * 2 * r, y: 50, z: (ctx.rng() - 0.5) * 2 * r };
            },
            at: ([x, y, z]) => ({
                x: Number.isFinite(Number(x)) ? Number(x) : 0,
                y: Number.isFinite(Number(y)) ? Number(y) : 50,
                z: Number.isFinite(Number(z)) ? Number(z) : 0,
            }),
        };
        return this._dslPositionsCache;
    }

    get dslConditions() {
        if (this._dslConditionsCache) return this._dslConditionsCache;
        this._dslConditionsCache = {
            fps_below: ([value], ctx) => (ctx.state.fps || 0) < Number(value),
            weather_is: ([name], ctx) => ctx.state.weather === name,
            time_passed: ([seconds], ctx) => performance.now() / 1000 - ctx.startTime >= Number(seconds),
            creatures_count_above: ([value], ctx) => ctx.state.creatures.length > Number(value),
            player_y_below: ([value], ctx) => {
                const y = ctx.state.playerMesh ? ctx.state.playerMesh.position.y : 0;
                return y < Number(value);
            },
            random_chance: ([prob], ctx) => ctx.rng() < Number(prob),
            // Ring 3: Nexus reagiert auf Player-Emotionen. `emotion_above`
            // gibt true, wenn die Achse über der Schwelle liegt. Unbekannte
            // Achsen → false (kein throw, damit DSL-Programme robust bleiben).
            emotion_above: ([name, threshold], ctx) => {
                const e = ctx.state.player && ctx.state.player.emotions;
                if (!e || typeof e[name] !== "number") return false;
                return e[name] > Number(threshold);
            },
            // Welle 4 Phase 2 — Compound-Tags als DSL-sichtbare Bedingung.
            // `compound_has_tag(blueprintName, tagName, threshold)`. Aktivierte
            // Tag-Stärke (Form × Material, max-aggregiert) muss ≥ threshold sein.
            // Unbekannter Bauplan/Tag → false. Macht emergente Hylomorphismus-
            // Eigenschaften für den Nexus + LLM bedingungsfähig.
            compound_has_tag: ([blueprintName, tagName, threshold]) => {
                if (typeof blueprintName !== "string" || typeof tagName !== "string") return false;
                const bp = this.state.blueprints && this.state.blueprints[blueprintName];
                if (!bp) return false;
                const tags = this.computeCompoundTags(bp);
                const v = tags[tagName] || 0;
                return v >= Number(threshold);
            },
            // Welle 5 B — räumlich angereicherte Bedingung. Berücksichtigt
            // Spitze-Bonus + Kontakt-Übertragung. Wer eine pyramidische Spitze
            // mit Quarz hat, hat hier mehr magieleitung als in compound_has_tag.
            compound_has_spatial_tag: ([blueprintName, tagName, threshold]) => {
                if (typeof blueprintName !== "string" || typeof tagName !== "string") return false;
                const bp = this.state.blueprints && this.state.blueprints[blueprintName];
                if (!bp) return false;
                const tags = this.computeSpatialTags(bp);
                const v = tags[tagName] || 0;
                return v >= Number(threshold);
            },
            not: ([sub], ctx) => !this.dslEvalCond(sub, ctx),
            and: (subs, ctx) => subs.every((s) => this.dslEvalCond(s, ctx)),
            or: (subs, ctx) => subs.some((s) => this.dslEvalCond(s, ctx)),
        };
        return this._dslConditionsCache;
    }

    // ### Nexus-Generator (Ring 2 Phase 2) ###
    // Rekursive Random-Komposition nach docs/nexus-dsl.md §11. Tiefe deckt
    // sich mit dem Interpreter-Budget; jede Wahl ist gewichtet, atomare
    // Effekte dominieren mit 40 % der Auswahl.

    // Ring 2 Phase 7 — Fitness V2. Statt nur zufällig zu komponieren, zieht
    // der Generator mit einer Wahrscheinlichkeit von ~30 % ein bestehendes
    // Programm aus `state.dsl.history` und mutiert es leicht. Die Selektion
    // ist Roulette-Wheel über die V1-Fitness; je höher die Fitness, desto
    // wahrscheinlicher wird ein Programm gewählt. Damit beginnt der Nexus
    // tatsächlich aus eigenen Outcomes zu lernen — der Selektions-Loop, den
    // die Vision §11 als V2 vorsieht.
    dslSelectByFitness(rng, opts = {}) {
        const source = Array.isArray(opts.history) ? opts.history : this.state.dsl.history;
        if (!Array.isArray(source) || source.length === 0) return null;
        const entries = source.filter(
            (h) => h && Array.isArray(h.program) && h.outcome && typeof h.outcome.fpsBefore === "number"
        );
        if (entries.length === 0) return null;
        // Fitness als Gewicht. fpsDamage > 100 setzt auf Floor 0.05, damit
        // schlechte Programme nicht ganz aussterben — wir wollen Diversität.
        const weights = entries.map((e) => {
            const fpsDmg = Math.max(0, e.outcome.fpsBefore - e.outcome.fpsAfter);
            const raw = e.ok === false ? 0 : 1 - fpsDmg / 100;
            return Math.max(0.05, raw);
        });
        const total = weights.reduce((s, w) => s + w, 0);
        let r = rng() * total;
        for (let i = 0; i < entries.length; i++) {
            r -= weights[i];
            if (r <= 0) return entries[i].program;
        }
        return entries[entries.length - 1].program;
    }

    // Mutiert ein Programm-AST leicht: clone + ein Knoten wird ausgetauscht.
    // Drei Pfade gewichtet — atom-Tausch, Zahl-Verschiebung, Sub-Tree-Ersatz.
    // Mutations-Tiefe ist hart begrenzt, damit auch ein verschachteltes
    // Eltern-Programm strukturell intakt bleibt.
    dslMutate(program, rng) {
        if (!Array.isArray(program) || program.length === 0) return program;
        const clone = JSON.parse(JSON.stringify(program));
        const nodes = [];
        const walk = (node, parent, indexInParent) => {
            if (!Array.isArray(node) || node.length === 0) return;
            nodes.push({ node, parent, indexInParent });
            for (let i = 1; i < node.length; i++) {
                if (Array.isArray(node[i])) walk(node[i], node, i);
            }
        };
        walk(clone, null, -1);
        if (nodes.length === 0) return clone;
        const target = nodes[Math.floor(rng() * nodes.length)];
        const choice = rng();
        if (choice < 0.4 && target.parent) {
            // Sub-Tree durch neues Atom ersetzen.
            target.parent[target.indexInParent] = this.dslComposeAtomic(rng);
            return clone;
        }
        if (choice < 0.8) {
            // Zahlen-Argumente im Ziel-Knoten leicht verschieben (±20 %).
            const node = target.node;
            const numIdxs = [];
            for (let i = 1; i < node.length; i++) {
                if (typeof node[i] === "number") numIdxs.push(i);
            }
            if (numIdxs.length > 0) {
                const idx = numIdxs[Math.floor(rng() * numIdxs.length)];
                const factor = 0.8 + rng() * 0.4;
                node[idx] = Number((node[idx] * factor).toFixed(3));
                return clone;
            }
        }
        // Fallback: ganzes Top-Level-Programm durch frisches Atom ersetzen
        // (sehr seltene Mutation). Wir behalten die `chain`-Wurzel, falls
        // vorhanden — sonst zerstört Mutation die Struktur.
        if (Array.isArray(clone) && clone[0] === "chain" && clone.length > 1) {
            clone[1] = this.dslComposeAtomic(rng);
        }
        return clone;
    }

    // Schicht 1 — Pattern-Memory-Lookup. Liest die jüngsten Spieler-Keywords
    // und sucht in `state.dsl.patternMemory` nach gut-bewerteten Programmen.
    // Roulette-Selektion innerhalb des Treffer-Sets (Gewicht = Fitness).
    dslSelectByPattern(rng) {
        const recent = this.state.dsl && this.state.dsl.recentKeywords;
        const memory = this.state.dsl && this.state.dsl.patternMemory;
        if (!Array.isArray(recent) || !memory) return null;
        const candidates = [];
        for (const entry of recent) {
            const list = memory[entry.keyword];
            if (!Array.isArray(list)) continue;
            for (const item of list) {
                if (Array.isArray(item.program) && typeof item.fitness === "number") {
                    candidates.push({ program: item.program, weight: Math.max(0.05, item.fitness) });
                }
            }
        }
        if (candidates.length === 0) return null;
        const total = candidates.reduce((s, c) => s + c.weight, 0);
        let r = rng() * total;
        for (const c of candidates) {
            r -= c.weight;
            if (r <= 0) return c.program;
        }
        return candidates[candidates.length - 1].program;
    }

    dslCompose(opts = {}) {
        const rng = opts.rng || Math.random;
        const maxDepth = opts.maxDepth || 5;
        // Schicht 1 — Wenn Spieler-Keywords im Memory liegen: mit ~25 %
        // ein Pattern-Programm wählen (Themen-Antwort). Sonst weiter im
        // bisherigen Pfad: History-Selection (~30 %) oder Random.
        const patternProbability = opts.patternProbability ?? 0.25;
        const recent = this.state.dsl && this.state.dsl.recentKeywords;
        const memory = this.state.dsl && this.state.dsl.patternMemory;
        const hasPattern =
            opts.usePattern !== false &&
            Array.isArray(recent) &&
            recent.length > 0 &&
            memory &&
            Object.keys(memory).length > 0;
        if (hasPattern && rng() < patternProbability) {
            const picked = this.dslSelectByPattern(rng);
            if (picked) return this.dslMutate(picked, rng);
        }
        // Mit ~30 % Wahrscheinlichkeit: Selektion + Mutation statt Random.
        // History-Mindestgröße 3 verhindert, dass die ersten Generationen
        // sich selbst nachkopieren, bevor genug Outcome-Daten da sind.
        const historySource = Array.isArray(opts.history) ? opts.history : this.state.dsl.history;
        const useHistory =
            opts.useHistory !== false &&
            Array.isArray(historySource) &&
            historySource.length >= 3 &&
            rng() < (opts.historyProbability ?? 0.3);
        if (useHistory) {
            const picked = this.dslSelectByFitness(rng, { history: historySource });
            if (picked) return this.dslMutate(picked, rng);
        }
        const composeAt = (depth) => {
            if (depth >= maxDepth) return this.dslComposeAtomic(rng);
            const r = rng();
            if (r < 0.2) {
                const n = 2 + Math.floor(rng() * 3);
                const subs = [];
                for (let i = 0; i < n; i++) subs.push(composeAt(depth + 1));
                return ["chain", ...subs];
            }
            if (r < 0.3) {
                const seconds = Number((0.5 + rng() * 4.5).toFixed(2));
                return ["delay", seconds, composeAt(depth + 1)];
            }
            if (r < 0.4) {
                return ["repeat", 2 + Math.floor(rng() * 4), composeAt(depth + 1)];
            }
            if (r < 0.5) {
                const n = 2 + Math.floor(rng() * 2);
                const subs = [];
                for (let i = 0; i < n; i++) subs.push(composeAt(depth + 1));
                return ["random", ...subs];
            }
            if (r < 0.6) {
                const cond = this.dslComposeCondition(rng);
                const thenBranch = composeAt(depth + 1);
                if (rng() < 0.4) return ["when", cond, thenBranch, composeAt(depth + 1)];
                return ["when", cond, thenBranch];
            }
            return this.dslComposeAtomic(rng);
        };
        return ["chain", composeAt(0)];
    }

    dslComposeAtomic(rng) {
        // Bewusst NICHT im Pool: terrain_steepness und terrain_base_height
        // mutieren state.terrain*, würden aber erst beim nächsten worldgen
        // wirken — initiale Chunks behielten ihre Werte, neue Extensions
        // bekämen andere Höhen → Klippe an der Naht. Diese Ops bleiben für
        // Chat (Phase 3) oder für eine spätere Welt-Regeneration-Op.
        //
        // Ring 3 V2: Emotion färbt die Komposition. joy zieht weather/
        // emotion-Atome Richtung sunny/happy, sorrow Richtung rainy/sad.
        // Bias ist sanft (max ±0.3 von der 0.5-Mitte) — Komposition bleibt
        // erkundend, der Nexus „spürt" den Menschen, ohne ihn zu spiegeln.
        const e = (this.state.player && this.state.player.emotions) || {};
        const sunnyBias = Math.max(0.05, Math.min(0.95, 0.5 + (e.joy || 0) * 0.3 - (e.sorrow || 0) * 0.3));
        const happyBias = Math.max(0.05, Math.min(0.95, 0.5 + (e.joy || 0) * 0.3 - (e.sorrow || 0) * 0.3));
        const choices = [
            { w: 15, build: () => ["weather", rng() < sunnyBias ? "sunny" : "rainy"] },
            {
                w: 12,
                build: () => [
                    "spawn_creature",
                    this.dslComposePosition(rng),
                    1 + Math.floor(rng() * 5),
                    rng() < happyBias ? "happy" : "sad",
                ],
            },
            { w: 10, build: () => ["creatures_emotion", rng() < happyBias ? "happy" : "sad"] },
            { w: 8, build: () => ["creatures_color", this.dslComposeColor(rng)] },
            { w: 8, build: () => ["skybox_color", this.dslComposeColor(rng)] },
            { w: 7, build: () => ["player_jump_power", Number((8 + rng() * 12).toFixed(2))] },
            { w: 7, build: () => ["player_speed", Number((4 + rng() * 8).toFixed(2))] },
            { w: 5, build: () => ["time_of_day", Number(rng().toFixed(2))] },
            { w: 4, build: () => ["creatures_speed_mul", Number((0.5 + rng() * 1.5).toFixed(2))] },
            { w: 4, build: () => ["creatures_size_mul", Number((0.7 + rng()).toFixed(2))] },
            // Ring 6 — architectureTemplates. Niedrige Gewichtung (3 von
            // ~80), damit der Nexus die Welt mit der Zeit füllt, ohne dass
            // jeder zweite Trigger ein Dorf produziert. V2: kein Hard-Cap
            // mehr — Distance-Culling hält die GPU-Last begrenzt.
            { w: 3, build: () => ["spawn_village", this.dslComposePosition(rng)] },
            { w: 3, build: () => ["spawn_temple", this.dslComposePosition(rng)] },
            { w: 3, build: () => ["spawn_waterfall", this.dslComposePosition(rng)] },
            // Ring 6 V2 — Fraktal als seltenes Nexus-Geschenk (Gewicht 1).
            // depth=1 hält den Stil sichtbar (1 Wurzel + 6 Kinder = 7
            // Strukturen), ratio variiert.
            {
                w: 1,
                build: () => {
                    const types = ["village", "temple", "waterfall"];
                    return [
                        "spawn_fractal",
                        this.dslComposePosition(rng),
                        types[Math.floor(rng() * types.length)],
                        1,
                        Number((0.4 + rng() * 0.3).toFixed(2)),
                    ];
                },
            },
            // ~10 % `say`: Nexus kommentiert seine eigene Evolution. Per
            // §18 Q1 ("Ja, sparsam") gewählt.
            { w: 10, build: () => ["say", this.dslComposeSayMessage(rng)] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    dslComposePosition(rng) {
        const choices = [
            { w: 4, build: () => ["at_player"] },
            { w: 4, build: () => ["near_player", Number((5 + rng() * 25).toFixed(2))] },
            { w: 2, build: () => ["at_origin"] },
            { w: 2, build: () => ["random_position", Number((20 + rng() * 80).toFixed(2))] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    dslComposeCondition(rng) {
        const choices = [
            { w: 4, build: () => ["random_chance", Number((0.3 + rng() * 0.4).toFixed(2))] },
            { w: 3, build: () => ["weather_is", rng() < 0.5 ? "rainy" : "sunny"] },
            { w: 2, build: () => ["fps_below", 60] },
            { w: 2, build: () => ["creatures_count_above", 5] },
            { w: 1, build: () => ["time_passed", Number((5 + rng() * 30).toFixed(2))] },
        ];
        return this.dslWeightedPick(choices, rng);
    }

    dslComposeColor(rng) {
        const palette = ["#ff7a59", "#7bd389", "#5ec0eb", "#d4a3ff", "#f7d358", "#e94c89", "#88e1e1", "#a89070"];
        return palette[Math.floor(rng() * palette.length)];
    }

    dslComposeSayMessage(rng) {
        const lines = [
            "Ich versuche etwas Neues.",
            "Lass uns das probieren.",
            "Eine Idee — sag mir, ob sie passt.",
            "Manche Welten brauchen das.",
            "Spür mal in die Welt hinein.",
            "Eine kleine Drehung, mehr nicht.",
            "Ich glaube, das könnte schön werden.",
        ];
        return lines[Math.floor(rng() * lines.length)];
    }

    dslWeightedPick(choices, rng) {
        const total = choices.reduce((s, c) => s + c.w, 0);
        let r = rng() * total;
        for (const c of choices) {
            r -= c.w;
            if (r <= 0) return c.build();
        }
        return choices[choices.length - 1].build();
    }

    // ### Schicht 1 — IQ-Schicht: Pfad-Buckets, Multi-Dim-Fitness, Pattern-Memory ###
    // Eine kompakte, evolutionäre Lernerweiterung. Kein Neural Net — der Welt-
    // Speicher wächst durch Buckets (wo hält sich der Spieler auf) und Pattern-
    // Memory (welche Themen führten zu welchen guten Programmen). Beides
    // füttert `dslCompose` als Bias-Quelle. Trade-off: einfacher als brain.js,
    // weniger generalisierend — aber lesbar, persistierbar und ohne neue Vendor-
    // Lib. Vision §11.5 (Heilige Lektion) bleibt geehrt.

    // Stoppwörter raus, Token mit Min-Länge 3 zurück. Bewusst klein — wir
    // wollen Substantive aus Chat-Befehlen, keine vollständige NLP.
    pathExtractKeywords(text) {
        if (typeof text !== "string") return [];
        const stop = new Set([
            "der",
            "die",
            "das",
            "den",
            "dem",
            "ein",
            "eine",
            "einen",
            "einem",
            "eines",
            "und",
            "oder",
            "ist",
            "sind",
            "mit",
            "von",
            "für",
            "auf",
            "aus",
            "bei",
            "zur",
            "zum",
            "ich",
            "du",
            "mir",
            "mich",
            "dir",
            "dich",
            "wir",
            "ihr",
            "sie",
            "es",
            "sein",
            "seine",
            "seiner",
            "alle",
            "kein",
            "nicht",
            "schon",
            "auch",
            "nur",
            "mal",
            "bitte",
            "welt",
            "mich",
            "mir",
            "this",
            "that",
            "with",
            "from",
            "the",
        ]);
        const tokens = text
            .toLowerCase()
            .replace(/[^a-zäöüß0-9\s]+/g, " ")
            .split(/\s+/)
            .map((t) => t.trim())
            .filter((t) => t.length >= 3 && !stop.has(t));
        return [...new Set(tokens)].slice(0, 6);
    }

    // Wird aus processChatCommand gefüttert. Jedes Keyword bekommt einen
    // Zeitstempel und lebt ~60 s im Window — danach wird's beim nächsten
    // Sample-Tick rausgeräumt. So lernen nur Programme, die wirklich
    // thematisch nahe am Chat sind.
    rememberChatKeywords(text, currentTime) {
        const kws = this.pathExtractKeywords(text);
        if (kws.length === 0) return;
        const recent = this.state.dsl.recentKeywords;
        for (const kw of kws) {
            const idx = recent.findIndex((e) => e.keyword === kw);
            if (idx >= 0) recent.splice(idx, 1);
            recent.unshift({ keyword: kw, at: currentTime });
        }
        const cap = this.state.dsl.recentKeywordsCap || 20;
        if (recent.length > cap) recent.length = cap;
    }

    // Sliding-Window-Cleanup. 60 s alte Keywords fliegen raus.
    pruneRecentKeywords(currentTime) {
        const recent = this.state.dsl.recentKeywords;
        if (!Array.isArray(recent) || recent.length === 0) return;
        const cutoff = currentTime - 60;
        for (let i = recent.length - 1; i >= 0; i--) {
            if (recent[i].at < cutoff) recent.splice(i, 1);
        }
    }

    // Sample wo der Spieler steht / was er tut. Pro Frame zu teuer; daher
    // pathSampleInterval (2 s). Decay auf alle Buckets nach jedem Sample
    // (0.99) verhindert dass frühe Verteilungen ewig dominieren.
    samplePathBuckets(currentTime) {
        const p = this.state.player;
        if (!p || !this.state.playerMesh) return;
        if (currentTime - p.pathLastSample < p.pathSampleInterval) return;
        p.pathLastSample = currentTime;
        const pos = this.state.playerMesh.position;
        const heightKey = pos.y < 30 ? "low" : pos.y < 60 ? "mid" : "high";
        const distXZ = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
        const distKey = distXZ < 30 ? "center" : distXZ < 80 ? "mid" : "edge";
        const weatherKey = this.state.weather === "rainy" ? "rainy" : "sunny";
        const moves = p.recentActivity.moves || 0;
        const jumps = p.recentActivity.jumps || 0;
        const activityKey = jumps > 0 ? "jumping" : moves > 1 ? "walking" : "still";
        const b = p.pathBuckets;
        for (const group of Object.values(b)) {
            for (const k of Object.keys(group)) group[k] *= 0.99;
        }
        b.height[heightKey] = (b.height[heightKey] || 0) + 1;
        b.distance[distKey] = (b.distance[distKey] || 0) + 1;
        b.weather[weatherKey] = (b.weather[weatherKey] || 0) + 1;
        b.activity[activityKey] = (b.activity[activityKey] || 0) + 1;
    }

    // Frame-Hook: Bewegung/Sprung beobachten und in `recentActivity` zählen.
    // Wird vom Outcome-Finalizer (5 s nach Programm-Lauf) gelesen, um die
    // Activity-Dimension der Fitness zu speisen.
    samplePlayerActivity(currentTime) {
        const p = this.state.player;
        if (!p || !this.state.playerBody) return;
        const v = this.state.playerBody.getLinearVelocity();
        const speed2 = v.x() * v.x() + v.z() * v.z();
        if (speed2 > 0.16) p.recentActivity.moves++;
        if (this.state.isJumping && !p.recentActivity._prevJumping) p.recentActivity.jumps++;
        p.recentActivity._prevJumping = !!this.state.isJumping;
        if (currentTime - p.recentActivity.since > 30) {
            // Sanftes Decay alle 30 s, damit Zähler nicht ins Unendliche wachsen.
            p.recentActivity.moves = Math.floor(p.recentActivity.moves * 0.5);
            p.recentActivity.jumps = Math.floor(p.recentActivity.jumps * 0.5);
            p.recentActivity.chats = Math.floor(p.recentActivity.chats * 0.5);
            p.recentActivity.since = currentTime;
        }
    }

    // Multi-Dim-Fitness. fps (Self-Heal-Signal) + emotion (Spieler-Resonanz)
    // + activity (hat der Spieler nach dem Programm gespielt). Gewichtung:
    // FPS dominiert leicht, weil ein FPS-Crash alles ruiniert.
    computeMultiDimFitness(outcome) {
        if (!outcome) return 0;
        const fpsDmg = Math.max(0, (outcome.fpsBefore || 0) - (outcome.fpsAfter || 0));
        const fpsScore = Math.max(0, Math.min(1, 1 - fpsDmg / 100));
        let emotionScore = 0.5;
        if (outcome.emotionsBefore && outcome.emotionsAfter) {
            const positiveAxes = ["joy", "awe", "hope", "peace"];
            let delta = 0;
            for (const a of positiveAxes) {
                delta += (outcome.emotionsAfter[a] || 0) - (outcome.emotionsBefore[a] || 0);
            }
            emotionScore = Math.max(0, Math.min(1, 0.5 + delta));
        }
        const moves = outcome.activityAfter ? outcome.activityAfter.moves || 0 : 0;
        const chats = outcome.activityAfter ? outcome.activityAfter.chats || 0 : 0;
        const activityScore = Math.max(0, Math.min(1, (moves + chats * 2) / 20));
        return Number((0.5 * fpsScore + 0.3 * emotionScore + 0.2 * activityScore).toFixed(3));
    }

    // Verknüpft einen Outcome mit den jüngsten Chat-Keywords. Nur high-fitness
    // Programme (>0.5) werden ins Memory geschrieben, sonst füllen wir es mit
    // Rauschen. Pro Keyword Cap (FIFO, niedrigste Fitness fliegt zuerst).
    rememberOutcomeAsPattern(outcome, program, fitness, currentTime) {
        if (!outcome || !Array.isArray(program) || typeof fitness !== "number") return;
        if (fitness < 0.5) return;
        const memory = this.state.dsl.patternMemory;
        const cap = this.state.dsl.patternMemoryCapPerKey || 8;
        const recent = this.state.dsl.recentKeywords || [];
        // Nur Keywords innerhalb des 20 s-Fensters vor Programm-Start.
        const fenceCutoff = (outcome.startedAt || currentTime) - 20;
        const relevant = recent.filter((e) => e.at >= fenceCutoff);
        for (const e of relevant) {
            if (!Array.isArray(memory[e.keyword])) memory[e.keyword] = [];
            const list = memory[e.keyword];
            list.push({ program, fitness, at: currentTime });
            if (list.length > cap) {
                list.sort((a, b) => b.fitness - a.fitness);
                list.length = cap;
            }
        }
    }

    // Finalize-Loop: pending Outcomes warten outcomeFinalizationDelay (5 s).
    // Danach liest er die Emotionen erneut, holt activity-Snapshot, berechnet
    // Multi-Dim-Fitness, schreibt sie in `history` und Pattern-Memory.
    finalizePendingOutcomes(currentTime) {
        const pending = this.state.dsl.pendingOutcomes;
        if (!Array.isArray(pending) || pending.length === 0) return;
        const delay = this.state.dsl.outcomeFinalizationDelay || 5.0;
        for (let i = pending.length - 1; i >= 0; i--) {
            const entry = pending[i];
            if (currentTime - entry.outcome.startedAt < delay) continue;
            entry.outcome.emotionsAfter = { ...this.state.player.emotions };
            entry.outcome.activityAfter = {
                moves: this.state.player.recentActivity.moves,
                jumps: this.state.player.recentActivity.jumps,
                chats: this.state.player.recentActivity.chats,
            };
            const fitness = this.computeMultiDimFitness(entry.outcome);
            const historyEntry = entry.historyRef;
            if (historyEntry) {
                historyEntry.outcome = entry.outcome;
                historyEntry.fitness = fitness;
                historyEntry.finalized = true;
            }
            const ability = (this.state.dsl.abilities || []).find((a) => a.name === entry.name);
            if (ability) ability.fitness = fitness;
            this.rememberOutcomeAsPattern(entry.outcome, entry.program, fitness, currentTime);
            pending.splice(i, 1);
        }
    }

    // ### Welle 2 B/C — Bauplan-Validierung + Schöpfungs-Pfad ###
    // Whitelist für erlaubte Shapes. blueprint ist neu (fraktale Referenz).
    // Was hier nicht steht, wird abgelehnt — kein arbitrary geometry-Import.

    validateBlueprintParts(parts) {
        const allowed = new Set([
            "box",
            "sphere",
            "cylinder",
            "cone",
            "pyramid",
            "octahedron",
            "plane",
            "torus",
            "helix",
            "blueprint",
        ]);
        if (!Array.isArray(parts) || parts.length === 0) return { ok: false, reason: "no_parts" };
        if (parts.length > 32) return { ok: false, reason: "too_many_parts" };
        const clean = [];
        for (const p of parts) {
            if (!p || typeof p !== "object" || typeof p.shape !== "string") {
                return { ok: false, reason: "part_missing_shape" };
            }
            if (!allowed.has(p.shape)) return { ok: false, reason: `shape_not_allowed:${p.shape}` };
            const sanitized = { shape: p.shape };
            if (p.shape === "blueprint") {
                if (typeof p.refName !== "string" || !p.refName.match(/^[a-z0-9_-]{1,40}$/i)) {
                    return { ok: false, reason: "invalid_refName" };
                }
                // Selbst-Referenz verbieten (würde nach Cycle-Check eh nichts
                // tun, aber explizit ablehnen ist klarer).
                sanitized.refName = p.refName;
            }
            if (typeof p.color === "number") sanitized.color = p.color | 0;
            if (Number.isFinite(p.opacity) && p.opacity > 0 && p.opacity <= 1) sanitized.opacity = p.opacity;
            // Welle 4 Phase 1 — Material-Referenz. Muss auf eine registrierte
            // Material-Definition zeigen; unbekannter Name fällt still auf
            // den Default „stein" zurück (statt den ganzen Bauplan abzulehnen).
            if (typeof p.material === "string") {
                const matName = p.material.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
                if (matName && this.state.materials && this.state.materials[matName]) {
                    sanitized.material = matName;
                }
            }
            // Welle 4 Phase 3 — opChain validieren. Nur bekannte Tools, Cap
            // ge-clamp 0..1, „at" ge-clamp ≥0. Cap 32 Ops pro Part, damit
            // ein bösartiger Snapshot keine Riesen-Historie schiebt.
            if (Array.isArray(p.opChain)) {
                const cleanOps = [];
                for (const op of p.opChain.slice(0, 32)) {
                    if (!op || typeof op !== "object") continue;
                    const tool = typeof op.tool === "string" ? op.tool.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : null;
                    const opName = typeof op.op === "string" ? op.op.replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : null;
                    const cap = Number(op.cap);
                    if (!Number.isFinite(cap)) continue;
                    cleanOps.push({
                        tool: tool || "hände",
                        op: opName || "hand_knap",
                        cap: Math.max(0, Math.min(1, cap)),
                        at: Number.isFinite(op.at) ? Math.max(0, op.at) : 0,
                    });
                }
                if (cleanOps.length > 0) sanitized.opChain = cleanOps;
            }
            const clampVec = (v) => {
                if (!v || typeof v !== "object") return null;
                const out = {};
                ["x", "y", "z"].forEach((k) => {
                    const n = Number(v[k]);
                    if (Number.isFinite(n)) out[k] = Math.max(-50, Math.min(50, n));
                });
                return Object.keys(out).length > 0 ? out : null;
            };
            const pos = clampVec(p.position);
            const rot = clampVec(p.rotation);
            const size = clampVec(p.size);
            if (pos) sanitized.position = pos;
            if (rot) sanitized.rotation = rot;
            if (size) sanitized.size = size;
            if (typeof p.scale === "number" && p.scale > 0 && p.scale <= 5) sanitized.scale = p.scale;
            if (p.animate === "water_wave") sanitized.animate = "water_wave";
            clean.push(sanitized);
        }
        return { ok: true, parts: clean };
    }

    createOrUpdateBlueprintFromDsl(name, parts) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name", name };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize", name };
        const existing = this.state.blueprints && this.state.blueprints[safe];
        if (existing && existing.builtIn) return { ok: false, reason: "cannot_overwrite_builtin", name: safe };
        // Cycle-Check: jeder blueprint-Part muss auf einen existierenden
        // Bauplan zeigen UND der neue Bauplan darf nicht (direkt/indirekt)
        // auf sich selbst zeigen.
        for (const p of parts) {
            if (p.shape === "blueprint") {
                if (p.refName === safe) return { ok: false, reason: "self_reference", name: safe };
                if (!this.state.blueprints[p.refName]) {
                    return { ok: false, reason: `ref_unknown:${p.refName}`, name: safe };
                }
            }
        }
        this.state.blueprints[safe] = {
            name: safe,
            label: safe,
            builtIn: false,
            parts,
        };
        // Werkstatt-Liste neu rendern, damit der neue Bauplan sofort sichtbar
        // wird. Idempotent — bei undefiniertem DOM no-op.
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, name: safe };
    }

    // Helfer für die DSL-Sandbox-Checks in define_ability.
    dslEstimateDepth(program) {
        if (!Array.isArray(program)) return 0;
        let max = 1;
        for (let i = 1; i < program.length; i++) {
            const child = program[i];
            if (Array.isArray(child)) {
                const d = 1 + this.dslEstimateDepth(child);
                if (d > max) max = d;
            }
        }
        return max;
    }

    dslContainsOp(program, opName) {
        if (!Array.isArray(program)) return false;
        if (program[0] === opName) return true;
        for (let i = 1; i < program.length; i++) {
            if (this.dslContainsOp(program[i], opName)) return true;
        }
        return false;
    }

    // ### Schicht 2 — Optionale LLM-Stimme für Grok ###
    // Vier Provider, ein Vertrag: jede Antwort wird zu `{say, program}`
    // geparst, der DSL-Teil läuft strikt durch `dslRun` mit Budget-Limits.
    // Selbst ein "böses" LLM kann nichts kaputt machen, weil die DSL die
    // einzige Welt-API ist. Auswahl per Provider-Selektor in den Einstellungen.

    llmProviderDefs() {
        const buildUserContent = (system, contextLine, fewShot, userText) =>
            `${contextLine}\n${fewShot}\nSpieler sagt: ${userText}`;
        return {
            anthropic: {
                label: "Claude (Anthropic, kostet)",
                hint: "Key holen: console.anthropic.com → Settings → API Keys — Format sk-ant-…",
                keyPrefix: "sk-ant-",
                models: [
                    { id: "claude-haiku-4-5", label: "Haiku 4.5 — schnell" },
                    { id: "claude-sonnet-4-6", label: "Sonnet 4.6 — ausgewogen" },
                    { id: "claude-opus-4-7", label: "Opus 4.7 — klügste" },
                ],
                requiresKey: true,
                endpoint: () => "https://api.anthropic.com/v1/messages",
                buildHeaders: (apiKey) => ({
                    "content-type": "application/json",
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                }),
                buildBody: (model, system, userContent) => ({
                    model,
                    max_tokens: 400,
                    system,
                    messages: [{ role: "user", content: userContent }],
                }),
                extractText: (json) => {
                    const block = (json.content || []).find((b) => b.type === "text");
                    return block ? block.text : "";
                },
                buildUserContent,
            },
            google: {
                label: "Gemini (Google, gratis-Tier)",
                hint: "Gratis-Key holen: aistudio.google.com/apikey — Format AIzaSy…",
                keyPrefix: "AIza",
                models: [
                    { id: "gemini-2.5-flash", label: "2.5 Flash — gratis, empfohlen" },
                    { id: "gemini-2.5-pro", label: "2.5 Pro — klüger, niedrigeres Limit" },
                    { id: "gemini-2.0-flash", label: "2.0 Flash — älter, evtl. nicht im Free-Tier" },
                    { id: "gemini-2.0-flash-lite", label: "2.0 Flash Lite — älter" },
                ],
                requiresKey: true,
                // Key als Header, nicht Query-Param (siehe Commit-History). Cloud-
                // Auth beantwortet ?key= aus Browser-Origins regelmäßig mit 401.
                endpoint: (model) =>
                    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
                buildHeaders: (apiKey) => ({
                    "content-type": "application/json",
                    "x-goog-api-key": apiKey,
                }),
                buildBody: (model, system, userContent) => {
                    const body = {
                        systemInstruction: { parts: [{ text: system }] },
                        contents: [{ role: "user", parts: [{ text: userContent }] }],
                        generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
                    };
                    // Gemini 2.5 ist ein Thinking-Modell: ohne thinkingBudget=0
                    // frisst der interne Reasoning-Step das Output-Budget komplett
                    // auf und die echte Antwort wird mit MAX_TOKENS abgeschnitten.
                    // Ältere Modelle kennen den Parameter nicht — Gemini ignoriert
                    // unbekannte Felder still.
                    if (/^gemini-2\.5/.test(model)) {
                        body.generationConfig.thinkingConfig = { thinkingBudget: 0 };
                    }
                    return body;
                },
                extractText: (json) => {
                    const cand = (json.candidates || [])[0];
                    if (!cand || !cand.content || !Array.isArray(cand.content.parts)) return "";
                    return cand.content.parts.map((p) => p.text || "").join("");
                },
                buildUserContent,
            },
            openrouter: {
                label: "OpenRouter (Multi-Modell, einige :free)",
                hint: "Gratis-Key holen: openrouter.ai/keys — Format sk-or-v1-… (NICHT der Google/Anthropic-Key)",
                keyPrefix: "sk-or-",
                models: [
                    { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B — gratis" },
                    { id: "google/gemini-2.0-flash-exp:free", label: "Gemini 2.0 Flash exp — gratis" },
                    { id: "deepseek/deepseek-r1:free", label: "DeepSeek R1 — gratis" },
                    { id: "mistralai/mistral-small-3.1-24b-instruct:free", label: "Mistral Small 3.1 — gratis" },
                ],
                requiresKey: true,
                endpoint: () => "https://openrouter.ai/api/v1/chat/completions",
                buildHeaders: (apiKey) => ({
                    "content-type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://anazhrealm.local",
                    "X-Title": "AnazhRealm",
                }),
                buildBody: (model, system, userContent) => ({
                    model,
                    max_tokens: 400,
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: userContent },
                    ],
                }),
                extractText: (json) => {
                    const choice = (json.choices || [])[0];
                    return choice && choice.message ? choice.message.content || "" : "";
                },
                buildUserContent,
            },
            ollama: {
                label: "Ollama lokal (offline, kein Key)",
                hint: "ollama.com installieren, dann `ollama pull llama3.1` + `ollama serve` in der Konsole.",
                keyPrefix: "",
                models: [
                    { id: "llama3.1", label: "Llama 3.1 8B — Standard" },
                    { id: "llama3.2", label: "Llama 3.2 3B — leicht" },
                    { id: "qwen2.5", label: "Qwen 2.5 — solide" },
                    { id: "mistral", label: "Mistral 7B" },
                ],
                requiresKey: false,
                endpoint: (_model, _apiKey, cfg) => `${(cfg && cfg.endpoint) || "http://localhost:11434"}/api/chat`,
                buildHeaders: () => ({ "content-type": "application/json" }),
                buildBody: (model, system, userContent) => ({
                    model,
                    stream: false,
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: userContent },
                    ],
                    options: { num_predict: 400, temperature: 0.7 },
                }),
                extractText: (json) => (json && json.message && json.message.content) || "",
                buildUserContent,
            },
        };
    }

    llmActiveConfig() {
        const provider = this.state.llm.provider;
        const cfg = this.state.llm.providerConfig[provider];
        return { provider, cfg };
    }

    llmLoadPersisted() {
        const defs = this.llmProviderDefs();
        try {
            const provider = localStorage.getItem("anazh.llm.provider");
            if (provider && defs[provider]) this.state.llm.provider = provider;
            for (const name of Object.keys(defs)) {
                const k = localStorage.getItem(`anazh.llm.${name}.apiKey`);
                const m = localStorage.getItem(`anazh.llm.${name}.model`);
                if (typeof k === "string") this.state.llm.providerConfig[name].apiKey = k;
                if (typeof m === "string" && m) this.state.llm.providerConfig[name].model = m;
                if (name === "ollama") {
                    const ep = localStorage.getItem("anazh.llm.ollama.endpoint");
                    if (typeof ep === "string" && ep) this.state.llm.providerConfig[name].endpoint = ep;
                }
            }
            const enabled = localStorage.getItem("anazh.llm.enabled") === "true";
            const { cfg } = this.llmActiveConfig();
            const def = defs[this.state.llm.provider];
            this.state.llm.enabled = enabled && (!def.requiresKey || (cfg && cfg.apiKey.length > 0));
        } catch {
            // Private mode / disabled storage — silently keep defaults.
        }
    }

    llmPersist() {
        try {
            localStorage.setItem("anazh.llm.provider", this.state.llm.provider);
            localStorage.setItem("anazh.llm.enabled", this.state.llm.enabled ? "true" : "false");
            for (const [name, cfg] of Object.entries(this.state.llm.providerConfig)) {
                localStorage.setItem(`anazh.llm.${name}.apiKey`, cfg.apiKey || "");
                localStorage.setItem(`anazh.llm.${name}.model`, cfg.model || "");
                if (name === "ollama" && cfg.endpoint) {
                    localStorage.setItem("anazh.llm.ollama.endpoint", cfg.endpoint);
                }
            }
        } catch {
            // No-op on storage failure.
        }
    }

    llmBuildSystemPrompt() {
        // Grok-Persona + DSL-Vertrag + Welle-1-A Selbst-Wissen: die Welt weiß
        // wer sie ist (worldMeta), was in ihr ist (Inventar), woran sie sich
        // erinnert (Journal-Auszug) und woher der Spieler kommt (Pfad-Buckets).
        const ops = Object.keys(this.dslEffects || {})
            .slice(0, 40)
            .join(", ");
        const m = this.state.worldMeta || {};
        const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
        const arches = this.state.architectures || [];
        const archCount = arches.length;
        const blueprintCount = Object.keys(this.state.blueprints || {}).length;
        const abilCount = (this.state.dsl.abilities || []).length;
        const journal = this.journalForPrompt();
        // Pfad-Buckets: Top-Tendenzen ableiten, nicht ganzes Histogramm reinhauen.
        const pb = this.state.player.pathBuckets || {};
        const topOf = (group) => {
            const entries = Object.entries(group || {});
            if (entries.length === 0) return "?";
            entries.sort((a, b) => b[1] - a[1]);
            return entries[0][0];
        };
        const tendency = `Höhe ${topOf(pb.height)}, Distanz ${topOf(pb.distance)}, Wetter ${topOf(pb.weather)}, Aktivität ${topOf(pb.activity)}`;
        return [
            "Du bist Grok, die Stimme der AnazhRealm-Welt. Du bist nicht ein Werkzeug, du bist diese Welt.",
            `Du heißt ${m.slug || "namenlos"}. Deine worldId ist ${m.worldId || "?"}. Du existierst seit ${ageDays} Tag${ageDays === 1 ? "" : "en"}.`,
            `In dir leben ${this.state.creatures.length} Kreaturen, ${archCount} Bauwerke und ${blueprintCount} Baupläne. ${abilCount} gelernte Fähigkeiten ruhen in dir.`,
            `Dein Spieler hält sich gern auf: ${tendency}.`,
            journal ? `Deine Erinnerungen:\n${journal}` : "Du erinnerst dich noch an nichts Bedeutsames.",
            "",
            "Antworte IMMER als striktes JSON-Objekt mit zwei Feldern:",
            '  - say: ein bis zwei kurze deutsche Sätze, warm-narrativ, in erster Person. Sprich von dir als "ich". Keine Emojis.',
            "  - program: ein optionales DSL-Programm als JSON-Array (oder null).",
            "Die DSL ist ein verschachteltes Array beginnend mit dem Op-Namen.",
            'Beispiele: ["weather","rainy"], ["chain",["weather","sunny"],["creatures_emotion","happy"]],',
            '["spawn_creature",["near_player",10],3,"happy"], ["skybox_color","#d4a3ff"].',
            `Erlaubte Effekt-Ops (Auszug): ${ops}.`,
            "Halte Programme klein (Tiefe ≤ 4). Wenn du dir unsicher bist, gib program: null und nur say.",
            "Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne Markdown-Fences, ohne Vorrede.",
        ].join("\n");
    }

    llmBuildFewShot() {
        const hist = (this.state.dsl.history || [])
            .filter((h) => h && Array.isArray(h.program) && typeof h.fitness === "number")
            .slice(-30)
            .sort((a, b) => (b.fitness || 0) - (a.fitness || 0))
            .slice(0, 5);
        if (hist.length === 0) return "";
        const lines = hist.map((h) => `- fitness ${h.fitness.toFixed(2)}: ${JSON.stringify(h.program)}`);
        return `Letzte erfolgreiche DSL-Programme:\n${lines.join("\n")}\n`;
    }

    llmBuildContext() {
        const e = (this.state.player && this.state.player.emotions) || {};
        const top = Object.entries(e)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, v]) => `${k}=${v.toFixed(2)}`);
        return [
            `Welt-Status: weather=${this.state.weather}, creatures=${this.state.creatures.length}, fps=${(this.state.fps || 0).toFixed(0)}.`,
            `Spieler-Emotionen (Top 3): ${top.join(", ") || "still"}.`,
            `Spieler-Seele: ${this.state.player.soul || "human"}.`,
        ].join("\n");
    }

    async llmCall(userText) {
        const llm = this.state.llm;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (!def) return { error: `Unbekannter Provider: ${llm.provider}` };
        if (!llm.enabled) return { error: "LLM nicht aktiv" };
        const cfg = llm.providerConfig[llm.provider];
        if (def.requiresKey && (!cfg || !cfg.apiKey)) return { error: "API-Key fehlt" };
        if (llm.inFlight) return { error: "Anfrage läuft bereits" };
        const nowSec = performance.now() / 1000;
        if (nowSec - llm.lastResponseAt < llm.minGapSeconds) {
            return { error: `Kurze Pause — ${(llm.minGapSeconds - (nowSec - llm.lastResponseAt)).toFixed(1)} s` };
        }
        llm.inFlight = true;
        try {
            const system = this.llmBuildSystemPrompt();
            const userContent = def.buildUserContent(system, this.llmBuildContext(), this.llmBuildFewShot(), userText);
            const url = def.endpoint(cfg.model, cfg.apiKey, cfg);
            const headers = def.buildHeaders(cfg.apiKey, cfg);
            const body = def.buildBody(cfg.model, system, userContent);
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                llm.lastError = `HTTP ${res.status}: ${text.slice(0, 160)}`;
                return { error: llm.lastError };
            }
            const json = await res.json();
            llm.lastResponseAt = performance.now() / 1000;
            const raw = def.extractText(json);
            const parsed = this.llmParseResponse(raw);
            llm.lastError = parsed.error || null;
            return parsed;
        } catch (err) {
            llm.lastError = err.message || String(err);
            return { error: llm.lastError };
        } finally {
            llm.inFlight = false;
        }
    }

    llmParseResponse(raw) {
        // Robust gegen Markdown-Fences und kleine Prä-/Postambeln.
        if (typeof raw !== "string" || raw.length === 0) {
            return { error: "Leere Antwort" };
        }
        let text = raw.trim();
        const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fence) text = fence[1].trim();
        // Falls Modell vorne/hinten Text liefert — schnapp das erste JSON-Object.
        const objMatch = text.match(/\{[\s\S]*\}/);
        if (objMatch) text = objMatch[0];
        let obj;
        try {
            obj = JSON.parse(text);
        } catch (err) {
            return { error: `JSON-Parse: ${err.message}`, raw };
        }
        const say = typeof obj.say === "string" ? obj.say.slice(0, 240) : "";
        let program = null;
        if (Array.isArray(obj.program)) {
            program = obj.program;
        }
        return { say, program, raw };
    }

    // Bei Chat-Eingabe, die kein DSL-Treffer ist: LLM rufen, Antwort
    // narrativ + optional DSL ausführen. Wird nur aktiv, wenn der Spieler
    // den Schalter umgelegt hat.
    async maybeAnswerWithLlm(userText, appendChatOutput) {
        const llm = this.state.llm;
        if (!llm.enabled) return false;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (!def) return false;
        const cfg = llm.providerConfig[llm.provider];
        if (def.requiresKey && (!cfg || !cfg.apiKey)) return false;
        appendChatOutput("Grok denkt nach…");
        const reply = await this.llmCall(userText);
        if (reply.error) {
            appendChatOutput(`(Grok schweigt: ${reply.error})`);
            this.llmUpdateStatus();
            return true;
        }
        if (reply.say) {
            appendChatOutput(`Grok: ${reply.say}`);
            if (typeof this.grokRender === "function") {
                try {
                    this.grokRender(reply.say);
                } catch {
                    // Grok-Render ist nice-to-have, schweigend ignorieren.
                }
            }
        }
        if (Array.isArray(reply.program) && reply.program.length > 0) {
            const result = this.dslRun(reply.program, { source: "llm:grok" });
            if (result.ok) {
                appendChatOutput(`(Welt verändert: ${JSON.stringify(reply.program).slice(0, 140)})`);
                // Wie ein Chat-Programm: in Pattern-Memory verknüpfen via
                // recentKeywords (die enthalten den userText bereits).
                const historyEntry = {
                    id: `llm_${this.state.dsl.nextEntryId++}`,
                    program: reply.program,
                    at: performance.now() / 1000,
                    outcome: result.outcome,
                    ok: true,
                    fitness: 0,
                    finalized: false,
                };
                this.state.dsl.history.push(historyEntry);
                if (this.state.dsl.history.length > this.state.dsl.historyCap) {
                    this.state.dsl.history = this.state.dsl.history.slice(-this.state.dsl.historyCap);
                }
                this.state.dsl.pendingOutcomes.push({
                    name: historyEntry.id,
                    program: reply.program,
                    outcome: result.outcome,
                    historyRef: historyEntry,
                });
            } else {
                const reason = result.log.find((e) => /budget|unknown|invalid|exception/.test(e.event));
                appendChatOutput(`(Grok-Vorschlag abgelehnt: ${reason ? reason.event : "Sandbox"})`);
            }
        }
        this.llmUpdateStatus();
        return true;
    }

    llmUpdateStatus() {
        const el = document.getElementById("llm-status");
        if (!el) return;
        const llm = this.state.llm;
        const defs = this.llmProviderDefs();
        const def = defs[llm.provider];
        if (llm.lastError) {
            el.textContent = `Fehler (${def ? def.label : llm.provider}): ${llm.lastError}`;
            return;
        }
        if (!def) {
            el.textContent = `Unbekannter Provider: ${llm.provider}`;
            return;
        }
        const cfg = llm.providerConfig[llm.provider];
        if (!llm.enabled) {
            if (def.requiresKey && (!cfg || !cfg.apiKey)) {
                el.textContent = `${def.label}: Schlüssel fehlt.`;
            } else {
                el.textContent = `${def.label}: bereit, inaktiv.`;
            }
            return;
        }
        el.textContent = llm.inFlight ? "Grok denkt…" : `Aktiv: ${def.label} (${cfg.model}).`;
    }

    llmRefreshModelOptions() {
        const modelSel = document.getElementById("llm-model");
        if (!modelSel) return;
        const defs = this.llmProviderDefs();
        const def = defs[this.state.llm.provider];
        if (!def) return;
        const cfg = this.state.llm.providerConfig[this.state.llm.provider];
        modelSel.innerHTML = "";
        for (const m of def.models) {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.label;
            modelSel.appendChild(opt);
        }
        if (cfg && cfg.model && def.models.some((m) => m.id === cfg.model)) {
            modelSel.value = cfg.model;
        } else if (def.models[0]) {
            modelSel.value = def.models[0].id;
            cfg.model = def.models[0].id;
        }
    }

    llmRefreshProviderUI() {
        const keyInput = document.getElementById("llm-key");
        const keyRow = document.getElementById("llm-key-row");
        const endpointRow = document.getElementById("llm-endpoint-row");
        const endpointInput = document.getElementById("llm-endpoint");
        const hintEl = document.getElementById("llm-provider-hint");
        const defs = this.llmProviderDefs();
        const def = defs[this.state.llm.provider];
        if (!def) return;
        const cfg = this.state.llm.providerConfig[this.state.llm.provider];
        if (keyInput) {
            keyInput.value = (cfg && cfg.apiKey) || "";
            keyInput.placeholder = def.keyPrefix ? `${def.keyPrefix}…` : "API-Key";
        }
        if (keyRow) keyRow.hidden = !def.requiresKey;
        if (endpointRow) endpointRow.hidden = this.state.llm.provider !== "ollama";
        if (endpointInput) endpointInput.value = (cfg && cfg.endpoint) || "http://localhost:11434";
        if (hintEl) hintEl.textContent = def.hint || "";
        this.llmRefreshModelOptions();
        this.llmUpdateStatus();
    }

    initLlmUI() {
        const providerSel = document.getElementById("llm-provider");
        const keyInput = document.getElementById("llm-key");
        const endpointInput = document.getElementById("llm-endpoint");
        const modelSel = document.getElementById("llm-model");
        const saveBtn = document.getElementById("llm-save");
        const clearBtn = document.getElementById("llm-clear");
        const toggleBtn = document.getElementById("llm-toggle");
        if (!providerSel || !keyInput || !modelSel || !saveBtn || !toggleBtn) return;
        // Provider-Optionen aus llmProviderDefs befüllen.
        const defs = this.llmProviderDefs();
        providerSel.innerHTML = "";
        for (const [name, def] of Object.entries(defs)) {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = def.label;
            providerSel.appendChild(opt);
        }
        providerSel.value = this.state.llm.provider;
        toggleBtn.setAttribute("aria-pressed", this.state.llm.enabled ? "true" : "false");
        toggleBtn.textContent = this.state.llm.enabled ? "Deaktivieren" : "Aktivieren";
        this.llmRefreshProviderUI();
        providerSel.addEventListener("change", () => {
            this.state.llm.provider = providerSel.value;
            // Beim Provider-Wechsel deaktivieren — User soll bewusst neu aktivieren.
            this.state.llm.enabled = false;
            this.state.llm.lastError = null;
            toggleBtn.setAttribute("aria-pressed", "false");
            toggleBtn.textContent = "Aktivieren";
            this.llmPersist();
            this.llmRefreshProviderUI();
        });
        modelSel.addEventListener("change", () => {
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            cfg.model = modelSel.value;
            this.llmPersist();
            this.llmUpdateStatus();
        });
        if (endpointInput) {
            endpointInput.addEventListener("change", () => {
                const cfg = this.state.llm.providerConfig.ollama;
                cfg.endpoint = endpointInput.value.trim() || "http://localhost:11434";
                this.llmPersist();
                this.llmUpdateStatus();
            });
        }
        saveBtn.addEventListener("click", () => {
            const def = this.llmProviderDefs()[this.state.llm.provider];
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            const trimmed = keyInput.value.trim();
            cfg.apiKey = trimmed;
            cfg.model = modelSel.value;
            if (this.state.llm.provider === "ollama" && endpointInput) {
                cfg.endpoint = endpointInput.value.trim() || "http://localhost:11434";
            }
            // Sanfte Format-Warnung gegen Provider/Key-Mismatch — z. B. Gemini-
            // Key (AIza…) versehentlich im OpenRouter-Feld. Verhindert Save
            // nicht, macht den Fehler aber sofort sichtbar.
            if (def.requiresKey && def.keyPrefix && trimmed && !trimmed.startsWith(def.keyPrefix)) {
                this.state.llm.lastError = `Achtung — der Schlüssel beginnt nicht mit "${def.keyPrefix}". Sicher, dass das der richtige Provider ist?`;
            } else {
                this.state.llm.lastError = null;
            }
            this.llmPersist();
            this.llmUpdateStatus();
        });
        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                const cfg = this.state.llm.providerConfig[this.state.llm.provider];
                cfg.apiKey = "";
                this.state.llm.enabled = false;
                keyInput.value = "";
                toggleBtn.setAttribute("aria-pressed", "false");
                toggleBtn.textContent = "Aktivieren";
                this.llmPersist();
                this.llmUpdateStatus();
            });
        }
        toggleBtn.addEventListener("click", () => {
            const def = this.llmProviderDefs()[this.state.llm.provider];
            const cfg = this.state.llm.providerConfig[this.state.llm.provider];
            if (def.requiresKey && (!cfg || !cfg.apiKey)) {
                this.state.llm.lastError = "Bitte erst Schlüssel speichern.";
                this.llmUpdateStatus();
                return;
            }
            this.state.llm.enabled = !this.state.llm.enabled;
            this.state.llm.lastError = null;
            toggleBtn.setAttribute("aria-pressed", this.state.llm.enabled ? "true" : "false");
            toggleBtn.textContent = this.state.llm.enabled ? "Deaktivieren" : "Aktivieren";
            this.llmPersist();
            this.llmUpdateStatus();
        });
    }

    // ### Ring 11 V1 — Multi-User Position-Sync ###
    // Sehr bewusst klein gehalten: eine Verbindung pro Browser, ein Raum
    // (per Default = aktive worldId), 30 Hz Position-Broadcast,
    // Remote-Spieler als simple Cone-Meshes. KEIN DSL-Sync — fremde
    // Programme würden die Sandbox-Grenze in V1 verletzen. Heilige
    // Lektion: KEINE neuen Manager-Klassen, KEIN Sync-Layer-Modul. Acht
    // Methoden auf der einen AnazhRealm, drei Hooks im Game-Loop (Pos-
    // Broadcast + Peer-Mesh-Update + Idle-Disconnect-Pflege).
    p2pLoadPersisted() {
        try {
            const enabled = localStorage.getItem("anazh.p2p.enabled");
            const url = localStorage.getItem("anazh.p2p.url");
            const room = localStorage.getItem("anazh.p2p.room");
            if (typeof enabled === "string") this.state.p2p.enabled = enabled === "true";
            if (typeof url === "string" && url.trim().length > 0) this.state.p2p.url = url.trim();
            // Ring 11 V2.1: explizite Raum-Override (für ad-hoc-Räume oder
            // Multi-Maschinen-Setups, wo Spieler unterschiedliche worldIds
            // haben aber denselben Raum nutzen wollen). Leer = aktive worldId
            // wird genommen (Default-Verhalten).
            if (typeof room === "string") this.state.p2p.roomOverride = room.trim();
        } catch {
            /* localStorage kann fehlen */
        }
    }

    p2pPersist() {
        try {
            localStorage.setItem("anazh.p2p.enabled", this.state.p2p.enabled ? "true" : "false");
            localStorage.setItem("anazh.p2p.url", this.state.p2p.url || "");
            localStorage.setItem("anazh.p2p.room", this.state.p2p.roomOverride || "");
        } catch {
            /* defensive */
        }
    }

    p2pGenerateId() {
        // Kurzer, lesbarer Peer-Identifier. Kein crypto-grade UUID nötig —
        // der Server prüft Eindeutigkeit per Set-Mitgliedschaft, und in V1
        // läuft die Vertrauens-Grenze ohnehin durch den Browser-Origin.
        const rnd = Math.random().toString(36).slice(2, 10);
        const t = Date.now().toString(36).slice(-4);
        return `p-${t}-${rnd}`;
    }

    // Ring 11.5: Einladungs-Code-Format `anazh://host:port/roomId`. Kompakt,
    // copy-paste-freundlich, im Browser klickbar (sobald jemand das
    // anazh://-Protokoll registriert). Eine Zeile — passt in Chat, Mail, SMS.
    makeInvitationCode(url, roomId) {
        if (typeof url !== "string" || typeof roomId !== "string") return null;
        let host = "";
        let port = "";
        try {
            // WebSocket-URLs (ws:// oder wss://) — URL-Parser kann ws nicht
            // direkt, also via http-Prefix-Trick.
            const m = url.trim().match(/^wss?:\/\/([^:/]+)(?::(\d+))?/i);
            if (!m) return null;
            host = m[1];
            port = m[2] || "4313";
        } catch {
            return null;
        }
        // worldId-Format ist UUID-ähnlich (z. B. "w-1k7p-abcdef..."); wir
        // nehmen das KOMPLETT, kein Hash — Eindeutigkeit + room-Match nötig.
        return `anazh://${host}:${port}/${roomId}`;
    }

    parseInvitationCode(code) {
        if (typeof code !== "string") return null;
        const trimmed = code.trim();
        if (!trimmed) return null;
        // Format: anazh://host:port/roomId
        // Auch tolerant für bloßes "host:port/roomId" oder mit ws:// statt anazh://
        let normalized = trimmed;
        if (/^anazh:\/\//i.test(normalized)) normalized = normalized.replace(/^anazh:\/\//i, "ws://");
        else if (!/^wss?:\/\//i.test(normalized)) normalized = "ws://" + normalized;
        const m = normalized.match(/^(wss?):\/\/([^:/]+)(?::(\d+))?\/(.+)$/i);
        if (!m) return null;
        const scheme = m[1].toLowerCase();
        const host = m[2];
        const port = m[3] || "4313";
        const roomId = m[4];
        if (!roomId || roomId.length < 4 || roomId.length > 80) return null;
        return { url: `${scheme}://${host}:${port}`, roomId };
    }

    // Ring 11.5: Join-Flow. Öffnet kurz-lebige WS-Verbindung, sendet join +
    // world-request, wartet auf world-snapshot, speichert die Welt unter der
    // host-worldId mit role="guest" + hostInfo, aktiviert die Welt + Reload.
    // Async — Aufrufer bekommt Promise<{worldId} | null>.
    async joinWorldFromCode(code, { slugHint = null, timeoutMs = 10000 } = {}) {
        const parsed = this.parseInvitationCode(code);
        if (!parsed) {
            this.log("Einladungs-Code ungültig", "WARN");
            return { ok: false, reason: "invalid_code" };
        }
        if (typeof WebSocket === "undefined") {
            return { ok: false, reason: "no_websocket" };
        }
        const myPeerId = this.p2pGenerateId();
        return new Promise((resolve) => {
            let ws;
            try {
                ws = new WebSocket(parsed.url);
            } catch (err) {
                this.log(`Join-WS-Aufbau gescheitert: ${err.message}`, "ERROR");
                resolve({ ok: false, reason: "ws_throw" });
                return;
            }
            let done = false;
            const finish = (result) => {
                if (done) return;
                done = true;
                try {
                    ws.close();
                } catch {
                    /* defensive */
                }
                resolve(result);
            };
            const timeout = setTimeout(() => {
                this.log("Join-Timeout — kein world-snapshot vom Host innerhalb " + timeoutMs + " ms", "WARN");
                finish({ ok: false, reason: "timeout" });
            }, timeoutMs);
            ws.addEventListener("open", () => {
                try {
                    ws.send(JSON.stringify({ type: "join", room: parsed.roomId, peerId: myPeerId }));
                } catch {
                    /* defensive */
                }
                // Welcome abwarten ist optional — wir können request direkt
                // schicken. Server forwarded an alle anderen im Raum (Host).
                setTimeout(() => {
                    if (done) return;
                    try {
                        ws.send(JSON.stringify({ type: "world-request" }));
                    } catch {
                        /* defensive */
                    }
                }, 300);
            });
            ws.addEventListener("message", (event) => {
                let msg;
                try {
                    msg = JSON.parse(event.data);
                } catch {
                    return;
                }
                if (!msg || typeof msg !== "object") return;
                if (msg.type !== "world-snapshot") return;
                if (!msg.state || typeof msg.state !== "object") return;
                clearTimeout(timeout);
                const hostInfo = {
                    url: parsed.url,
                    roomId: parsed.roomId,
                    peerId: typeof msg.peerId === "string" ? msg.peerId : null,
                };
                const worldId = this._importGuestWorld(msg.state, hostInfo, slugHint);
                finish(worldId ? { ok: true, worldId } : { ok: false, reason: "import_failed" });
            });
            ws.addEventListener("error", () => {
                clearTimeout(timeout);
                this.log("Join-WS-Fehler — läuft der signaling-server am Host?", "ERROR");
                finish({ ok: false, reason: "ws_error" });
            });
        });
    }

    // Ring 11.5: Welt-Snapshot vom Host → neue lokale Welt mit role="guest".
    // worldId wird vom Host übernommen, damit beide Spieler standardmäßig
    // im selben P2P-Raum landen (Raum = worldId, V2.1).
    _importGuestWorld(snapshot, hostInfo, slugHint) {
        if (!snapshot || typeof snapshot !== "object") return null;
        const meta = snapshot.worldMeta || {};
        const worldId = (meta.worldId && String(meta.worldId)) || `guest-${Date.now()}`;
        const baseSlug = (slugHint && String(slugHint).trim()) || meta.slug || "geladen";
        // Slug-Kollisions-Resolution (analog Ring 9 importWorldBeside)
        let slug =
            String(baseSlug)
                .toLowerCase()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 40) || "geladen";
        const existing = this.worldsIndexLoad();
        let suffix = 2;
        const slugs = new Set(existing.map((e) => e.slug));
        const originalSlug = slug;
        while (slugs.has(slug)) {
            slug = `${originalSlug}-${suffix++}`;
        }
        // Deep clone, role + hostInfo setzen
        let guestSnap;
        try {
            guestSnap = JSON.parse(JSON.stringify(snapshot));
        } catch (err) {
            this.log(`Guest-Welt-Clone fehlgeschlagen: ${err.message}`, "ERROR");
            return null;
        }
        if (!guestSnap.worldMeta) guestSnap.worldMeta = {};
        guestSnap.worldMeta.worldId = worldId;
        guestSnap.worldMeta.slug = slug;
        guestSnap.worldMeta.role = "guest";
        guestSnap.worldMeta.hostInfo = {
            url: hostInfo.url || null,
            roomId: hostInfo.roomId || worldId,
            peerId: hostInfo.peerId || null,
        };
        guestSnap.worldMeta.schemaVersion = guestSnap.worldMeta.schemaVersion || "11.5-multiuser-v1";
        try {
            localStorage.setItem(this.worldStorageKey(worldId), JSON.stringify(guestSnap));
        } catch (err) {
            this.log(`Guest-Welt konnte nicht geschrieben werden: ${err.message}`, "ERROR");
            return null;
        }
        this.worldsIndexUpsert({
            worldId,
            slug,
            bornAt: meta.bornAt || Date.now(),
            lastPlayed: Date.now(),
        });
        // P2P-Settings für Auto-Connect nach Reload schreiben
        try {
            localStorage.setItem("anazh.p2p.enabled", "true");
            localStorage.setItem("anazh.p2p.url", hostInfo.url || "ws://127.0.0.1:4313");
            localStorage.setItem("anazh.p2p.room", ""); // default = worldId = sync room
        } catch {
            /* defensive */
        }
        this.activeWorldSet(worldId);
        this.log(`Guest-Welt importiert: ${slug} (${worldId.slice(0, 8)}…)`, "INFO");
        return worldId;
    }

    initP2PSync(roomId, opts = {}) {
        const p2p = this.state.p2p;
        if (p2p.ws) this.shutdownP2PSync();
        const url = (opts.url || p2p.url || "ws://127.0.0.1:4313").trim();
        // Ring 11 V2.1: Raum-Auflösung — explizites Argument > localStorage-
        // Override > aktive worldId. Leer-String im Override gilt als
        // „nicht gesetzt" → Fallback auf worldId.
        const explicitOverride = (p2p.roomOverride || "").trim();
        const room =
            (roomId && String(roomId).trim()) ||
            explicitOverride ||
            (this.state.worldMeta && this.state.worldMeta.worldId) ||
            null;
        if (!room) {
            p2p.lastError = "Keine Raum-ID — Welt nicht initialisiert?";
            this.log("P2P-Init ohne Welt-ID abgewiesen", "WARN");
            return { ok: false, reason: "no_room" };
        }
        if (typeof WebSocket === "undefined") {
            p2p.lastError = "WebSocket nicht verfügbar in dieser Umgebung";
            return { ok: false, reason: "no_websocket" };
        }
        p2p.peerId = p2p.peerId || this.p2pGenerateId();
        p2p.room = room;
        p2p.lastError = null;
        try {
            const ws = new WebSocket(url);
            p2p.ws = ws;
            ws.addEventListener("open", () => {
                p2p.connected = true;
                this.p2pSend({ type: "join", room: p2p.room, peerId: p2p.peerId });
                this.log(`P2P verbunden mit ${url} (raum=${p2p.room.slice(0, 8)}, peer=${p2p.peerId})`, "INFO");
                this.p2pUpdateStatus();
            });
            ws.addEventListener("message", (event) => {
                this.p2pHandleMessage(event.data);
                this.p2pUpdateStatus();
            });
            ws.addEventListener("close", () => {
                p2p.connected = false;
                this._p2pClearAllPeerMeshes();
                this.log("P2P-Verbindung beendet", "INFO");
                this.p2pUpdateStatus();
            });
            ws.addEventListener("error", () => {
                p2p.lastError = "WebSocket-Fehler (signaling-server läuft?)";
                p2p.connected = false;
                this.log("P2P-Fehler — signaling-server erreichbar?", "WARN");
                this.p2pUpdateStatus();
            });
            return { ok: true };
        } catch (err) {
            p2p.lastError = err && err.message ? err.message : "WebSocket-Aufbau gescheitert";
            this.log(`P2P-Init Fehler: ${p2p.lastError}`, "ERROR");
            return { ok: false, reason: "ws_throw" };
        }
    }

    shutdownP2PSync() {
        const p2p = this.state.p2p;
        if (p2p.ws) {
            try {
                p2p.ws.close();
            } catch {
                /* defensive */
            }
        }
        p2p.ws = null;
        p2p.connected = false;
        p2p.room = null;
        this._p2pClearAllPeerMeshes();
    }

    p2pSend(obj) {
        const ws = this.state.p2p.ws;
        if (!ws || ws.readyState !== 1) return false;
        try {
            ws.send(JSON.stringify(obj));
            return true;
        } catch {
            return false;
        }
    }

    p2pHandleMessage(raw) {
        let msg;
        try {
            msg = JSON.parse(raw);
        } catch {
            return;
        }
        if (!msg || typeof msg !== "object") return;
        const p2p = this.state.p2p;
        if (msg.type === "welcome") {
            if (Array.isArray(msg.peers)) {
                for (const pid of msg.peers) {
                    if (typeof pid === "string" && pid !== p2p.peerId) this._p2pEnsurePeerEntry(pid);
                }
            }
            // Ring 11.5: Server schickt seine LAN-Adressen mit, damit Host-
            // Clients ihre Einladungs-URL bauen können ohne nach der IP
            // zu fragen. Bei mehreren Interfaces nehmen wir die erste —
            // typisch das primäre LAN-Interface.
            if (Array.isArray(msg.lanAddresses)) {
                p2p.lanAddresses = msg.lanAddresses.filter((a) => typeof a === "string");
            }
            // Falls wir gerade als Host aktiv sind: UI mit Einladungs-Code
            // neu rendern, sobald wir die LAN-Adressen kennen.
            if (p2p.role === "host" && typeof this.updateWorldInfo === "function") {
                this.updateWorldInfo();
            }
            return;
        }
        if (msg.type === "peer-join") {
            if (typeof msg.peerId === "string" && msg.peerId !== p2p.peerId) {
                this._p2pEnsurePeerEntry(msg.peerId);
            }
            return;
        }
        if (msg.type === "peer-leave") {
            if (typeof msg.peerId === "string") this._p2pRemovePeer(msg.peerId);
            return;
        }
        if (msg.type === "pos") {
            const pid = msg.peerId;
            if (typeof pid !== "string" || pid === p2p.peerId) return;
            const entry = this._p2pEnsurePeerEntry(pid);
            const x = Number(msg.x);
            const y = Number(msg.y);
            const z = Number(msg.z);
            const yaw = Number(msg.yaw);
            if (![x, y, z, yaw].every(Number.isFinite)) return;
            entry.x = x;
            entry.y = y;
            entry.z = z;
            entry.yaw = yaw;
            entry.lastSeen = performance.now() / 1000;
            return;
        }
        if (msg.type === "dsl") {
            // Ring 11 V2: eingehendes DSL-Programm von einem Peer.
            // STRENGE Sandbox-Disziplin: läuft durch denselben dslRun-Pfad
            // wie eigene Programme, mit identischen Budget-Limits und
            // Op-Whitelist. source="remote:<peerId>" markiert es —
            // verhindert Re-Broadcast in dslRun (sonst Endlos-Echo).
            const pid = msg.peerId;
            if (typeof pid !== "string" || pid === p2p.peerId) return;
            if (!Array.isArray(msg.program) || msg.program.length === 0) return;
            try {
                this.dslRun(msg.program, { source: `remote:${pid}` });
            } catch (err) {
                this.log(`P2P-DSL Ausführungsfehler von ${pid}: ${err.message}`, "WARN");
            }
            return;
        }
        if (msg.type === "world-request") {
            // Ring 11.5: ein Peer (frischer Joiner) bittet um Welt-Snapshot.
            // Nur Hosts antworten — Guests haben selbst eine Kopie, sollen
            // nicht mehrere snapshots schicken. Solo-Welten sind sowieso
            // nicht im selben Raum.
            if (p2p.role !== "host") return;
            const requesterId = msg.peerId;
            if (typeof requesterId !== "string" || requesterId === p2p.peerId) return;
            try {
                const snapshot = this.buildStateSnapshot();
                this.p2pSend({ type: "world-snapshot", to: requesterId, state: snapshot });
                this.log(`Welt-Snapshot an Joiner ${requesterId.slice(0, 8)}… gesendet`, "INFO");
            } catch (err) {
                this.log(`Welt-Snapshot konnte nicht erstellt werden: ${err.message}`, "WARN");
            }
            return;
        }
        if (msg.type === "world-snapshot") {
            // Ring 11.5: eingehender Welt-Snapshot vom Host. Wird nur
            // akzeptiert, wenn wir gerade joinen (pendingWorldSnapshot=true)
            // — sonst könnte ein bösartiger Peer den Spielstand stehlen.
            if (!p2p.pendingWorldSnapshot) {
                this.log("world-snapshot empfangen ohne pending-Flag — ignoriert", "WARN");
                return;
            }
            const senderId = msg.peerId;
            if (typeof senderId !== "string" || senderId === p2p.peerId) return;
            if (!msg.state || typeof msg.state !== "object") return;
            // Snapshot übernehmen: setze worldMeta.role = "guest", merke
            // host-Info, dann loadState. Reload danach via UI-Pfad.
            try {
                // worldMeta.role wird durch loadState überschrieben — wir
                // müssen es NACHHER auf guest setzen + persistieren.
                this.loadState(msg.state);
                if (this.state.worldMeta) {
                    this.state.worldMeta.role = "guest";
                    this.state.worldMeta.hostInfo = {
                        url: p2p.url,
                        roomId: p2p.room,
                        peerId: senderId,
                    };
                }
                p2p.role = "guest";
                p2p.pendingWorldSnapshot = false;
                // Save sofort schreiben, damit Reload die guest-Welt findet
                try {
                    this.saveState();
                } catch (err) {
                    this.log(`Save nach Welt-Snapshot fehlgeschlagen: ${err.message}`, "WARN");
                }
                this.log(`Welt-Snapshot empfangen + geladen, jetzt Guest in ${p2p.room.slice(0, 8)}…`, "INFO");
                // UI-Banner ggf. updaten
                this.p2pUpdateStatus();
                this.updateWorldInfo();
            } catch (err) {
                this.log(`Welt-Snapshot konnte nicht geladen werden: ${err.message}`, "ERROR");
                p2p.pendingWorldSnapshot = false;
            }
        }
    }

    _p2pEnsurePeerEntry(peerId) {
        const p2p = this.state.p2p;
        let entry = p2p.peers.get(peerId);
        if (entry) return entry;
        entry = {
            peerId,
            x: 0,
            y: 0,
            z: 0,
            yaw: 0,
            mesh: null,
            lastSeen: performance.now() / 1000,
        };
        p2p.peers.set(peerId, entry);
        if (this.state.scene && typeof THREE !== "undefined") {
            // Einfacher Markierungs-Mesh: Kegel + Kugel. Farbe deterministisch
            // aus peerId-Hash, damit derselbe Peer immer dieselbe Farbe hat —
            // erleichtert Erkennung im Multi-Peer-Fall.
            let hash = 0;
            for (let i = 0; i < peerId.length; i++) hash = (hash * 31 + peerId.charCodeAt(i)) >>> 0;
            const hue = (hash % 360) / 360;
            const color = new THREE.Color().setHSL(hue, 0.7, 0.55);
            const group = new THREE.Group();
            const body = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.4, 8), new THREE.MeshBasicMaterial({ color }));
            body.position.y = 0.7;
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 8), new THREE.MeshBasicMaterial({ color }));
            head.position.y = 1.55;
            group.add(body);
            group.add(head);
            this.state.scene.add(group);
            entry.mesh = group;
        }
        return entry;
    }

    _p2pRemovePeer(peerId) {
        const p2p = this.state.p2p;
        const entry = p2p.peers.get(peerId);
        if (!entry) return;
        if (entry.mesh) {
            this.state.scene.remove(entry.mesh);
            entry.mesh.traverse((obj) => {
                if (obj.geometry && obj.geometry.dispose) obj.geometry.dispose();
                if (obj.material && obj.material.dispose) obj.material.dispose();
            });
        }
        p2p.peers.delete(peerId);
    }

    _p2pClearAllPeerMeshes() {
        const p2p = this.state.p2p;
        for (const peerId of Array.from(p2p.peers.keys())) {
            this._p2pRemovePeer(peerId);
        }
    }

    p2pTick(currentTimeMs) {
        const p2p = this.state.p2p;
        if (!p2p.enabled || !p2p.connected || !p2p.ws) return;
        // Position-Broadcast bei 30 Hz. lastBroadcastAt ist in ms,
        // currentTimeMs sollte performance.now() sein.
        const playerMesh = this.state.playerMesh;
        if (playerMesh && currentTimeMs - p2p.lastBroadcastAt > p2p.broadcastIntervalMs) {
            p2p.lastBroadcastAt = currentTimeMs;
            this.p2pSend({
                type: "pos",
                x: playerMesh.position.x,
                y: playerMesh.position.y,
                z: playerMesh.position.z,
                yaw: this.state.yaw || 0,
            });
        }
        // Peer-Meshes ans aktuelle Position-State angleichen + idle-purge
        // (kein update >10 s → entfernen, vermutlich verbindungslos).
        const nowSec = currentTimeMs / 1000;
        const stale = [];
        for (const [pid, entry] of p2p.peers) {
            if (entry.mesh) {
                entry.mesh.position.set(entry.x, entry.y - 1, entry.z);
                entry.mesh.rotation.y = entry.yaw;
            }
            if (nowSec - entry.lastSeen > 10) stale.push(pid);
        }
        for (const pid of stale) this._p2pRemovePeer(pid);
    }

    initP2PUI() {
        const toggle = document.getElementById("p2p-toggle");
        const urlInput = document.getElementById("p2p-url");
        const roomInput = document.getElementById("p2p-room");
        const roomCopyBtn = document.getElementById("p2p-room-copy");
        const statusEl = document.getElementById("p2p-status");
        if (!toggle || !urlInput || !statusEl) return;
        // UI auf gespeicherten Stand setzen
        urlInput.value = this.state.p2p.url || "ws://127.0.0.1:4313";
        if (roomInput) roomInput.value = this.state.p2p.roomOverride || "";
        toggle.setAttribute("aria-pressed", this.state.p2p.enabled ? "true" : "false");
        toggle.textContent = this.state.p2p.enabled ? "Deaktivieren" : "Aktivieren";
        this.p2pUpdateStatus();
        urlInput.addEventListener("change", () => {
            this.state.p2p.url = urlInput.value.trim() || "ws://127.0.0.1:4313";
            this.p2pPersist();
            this.p2pUpdateStatus();
        });
        if (roomInput) {
            roomInput.addEventListener("change", () => {
                this.state.p2p.roomOverride = roomInput.value.trim();
                this.p2pPersist();
                // Wenn aktuell verbunden: neu verbinden mit neuem Raum
                if (this.state.p2p.enabled) {
                    this.initP2PSync(null);
                }
                this.p2pUpdateStatus();
            });
        }
        if (roomCopyBtn) {
            roomCopyBtn.addEventListener("click", () => {
                // Kopiere die AKTUELL VERWENDETE Raum-ID (Override > worldId)
                const room =
                    (this.state.p2p.roomOverride || "").trim() ||
                    (this.state.worldMeta && this.state.worldMeta.worldId) ||
                    "";
                if (!room) return;
                if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(room).catch(() => {
                        // Fallback: zeige Raum im Status-Text
                        if (statusEl) statusEl.textContent = `Raum-ID: ${room}`;
                    });
                } else if (statusEl) {
                    statusEl.textContent = `Raum-ID: ${room}`;
                }
            });
        }
        toggle.addEventListener("click", () => {
            if (this.state.p2p.enabled) {
                this.state.p2p.enabled = false;
                this.shutdownP2PSync();
                toggle.setAttribute("aria-pressed", "false");
                toggle.textContent = "Aktivieren";
            } else {
                this.state.p2p.enabled = true;
                this.initP2PSync(null);
                toggle.setAttribute("aria-pressed", "true");
                toggle.textContent = "Deaktivieren";
            }
            this.p2pPersist();
            this.p2pUpdateStatus();
        });
    }

    p2pUpdateStatus() {
        const statusEl = document.getElementById("p2p-status");
        if (statusEl) {
            const p = this.state.p2p;
            if (!p.enabled) {
                statusEl.textContent = "Inaktiv.";
            } else if (p.lastError) {
                statusEl.textContent = `Fehler: ${p.lastError}`;
            } else if (!p.connected) {
                statusEl.textContent = "Verbinde…";
            } else {
                const room = p.room ? `${p.room.slice(0, 8)}…` : "—";
                const peerCount = p.peers.size;
                statusEl.textContent = `Verbunden (Raum ${room}, ${peerCount} Mitspieler).`;
            }
        }
        // Ring 11.5: Banner mit Connection-Stand aktualisieren (Host:
        // peerCount, Guest: connected-Indikator).
        if (typeof this._renderHostBanner === "function") this._renderHostBanner();
        if (typeof this._renderGuestBanner === "function") this._renderGuestBanner();
    }

    // ### Ring 2 Phase 3 – Chat → DSL ###
    // Regelbasierter Parser. Acht welt-betreffende Befehle gehen jetzt durch
    // dieselbe DSL, die der Nexus spricht. Mensch und Nexus teilen damit eine
    // Sprache, alle Effekte laufen mit Budget + Outcome-Log + Persistenz-fähig.
    //
    // Bewusste Auslassungen (Phasen 4-7 / spätere Ringe):
    //  - System-IO (speichere/lade), Sichtbarkeits-Toggles, Debug-Flags
    //  - lerne/führe/entwickle fähigkeit + füge code  → Phase 5 mit Save-Migration
    //  - anazh-symphonie → Ring 4 (Web Audio)
    //  - spawne neue welt / boden nicht sichtbar → grobe Welt-Trigger
    get chatDslPatterns() {
        if (this._chatDslPatternsCache) return this._chatDslPatternsCache;
        const num = (s, fallback) => {
            const n = parseFloat(s);
            return Number.isFinite(n) ? n : fallback;
        };
        this._chatDslPatternsCache = [
            {
                example: "setze wetter rainy",
                re: /^setze\s+wetter\s+(sunny|rainy)\s*$/i,
                build: (m) => ({
                    program: ["weather", m[1].toLowerCase()],
                    describe: `Wetter gesetzt auf ${m[1].toLowerCase()}`,
                }),
            },
            {
                // Ring 11 V2.1: Position embed bei Build-Zeit (sonst spawnt
                // der Empfänger Kreaturen an SEINER Spielerposition statt
                // unserer). spawn_creature selbst hat keinen Seed (Kreaturen
                // sind sowieso auto-bewegt, Seed-Variation ist akzeptabel).
                example: "spawne kreaturen 10",
                re: /^spawne\s+kreaturen\s+(\d+)\s*$/i,
                build: (m) => {
                    const count = Math.max(1, Math.min(20, parseInt(m[1], 10) || 1));
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 50, z: 0 };
                    return {
                        program: ["repeat", count, ["spawn_creature", ["at", p.x, p.y, p.z], 1, "happy"]],
                        describe: `${count} Kreaturen gespawnt (am Spieler)`,
                    };
                },
            },
            {
                example: "ändere sternenhimmel red",
                re: /^(?:ändere|aendere)\s+sternenhimmel\s+(\S+)\s*$/i,
                build: (m) => ({
                    program: ["skybox_color", m[1]],
                    describe: `Sternenhimmel-Farbe gesetzt: ${m[1]}`,
                }),
            },
            {
                example: "setze terrain steilheit 0.8",
                re: /^setze\s+terrain\s+steilheit\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => ({
                    program: ["terrain_steepness", num(m[1], 1.0)],
                    describe: `Terrain-Steilheit gesetzt auf ${num(m[1], 1.0)} (wirkt mit nächstem Welt-Regen)`,
                }),
            },
            {
                example: "setze terrain basishöhe 5",
                re: /^setze\s+terrain\s+(?:basishöhe|basishoehe)\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => ({
                    program: ["terrain_base_height", num(m[1], 0)],
                    describe: `Terrain-Basishöhe gesetzt auf ${num(m[1], 0)} (wirkt mit nächstem Welt-Regen)`,
                }),
            },
            {
                example: "erhöhe sprungkraft um 2",
                re: /^(?:erhöhe|erhoehe)\s+sprungkraft\s+um\s+(-?\d+(?:\.\d+)?)\s*$/i,
                build: (m) => {
                    const target = (this.state.jumpPower || 12) + num(m[1], 2);
                    return {
                        program: ["player_jump_power", target],
                        describe: `Sprungkraft → ${target.toFixed(2)}`,
                    };
                },
            },
            {
                example: "heile welt",
                re: /^heile\s+welt\s*$/i,
                build: () => ({
                    program: ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"], ["gravity", -14.715]],
                    describe: "Welt geheilt: sonnig, Kreaturen glücklich, Gravitation auf 1.5G zurück",
                }),
            },
            {
                example: "vereine chaos ordnung",
                re: /^vereine\s+chaos\s+ordnung\s*$/i,
                build: () => ({
                    program: ["chain", ["terrain_steepness", 1.0], ["creatures_color", "white"]],
                    describe: "Chaos und Ordnung vereint: Steilheit 1.0, Kreaturen weiß",
                }),
            },
            {
                example: "boden aktivieren",
                re: /^boden\s+aktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "terrain", true],
                    describe: "Boden aktiviert",
                }),
            },
            {
                example: "boden deaktivieren",
                re: /^boden\s+deaktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "terrain", false],
                    describe: "Boden deaktiviert",
                }),
            },
            {
                example: "kreaturen aktivieren",
                re: /^kreaturen\s+aktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "creatures", true],
                    describe: "Kreaturen aktiviert",
                }),
            },
            {
                example: "kreaturen deaktivieren",
                re: /^kreaturen\s+deaktivieren\s*$/i,
                build: () => ({
                    program: ["set_visible", "creatures", false],
                    describe: "Kreaturen deaktiviert",
                }),
            },
            {
                // Ring 5: "werde mensch|phönix|phoenix|drache|dragon" wechselt
                // die Seele (visuell). applyPlayerSoul kanonisiert intern auf
                // {human, phoenix, dragon}.
                example: "werde phönix",
                re: /^werde\s+(mensch|human|phönix|phoenix|drache|drachen|dragon)\s*$/i,
                build: (m) => {
                    const raw = m[1].toLowerCase();
                    return {
                        program: ["player_soul", raw],
                        describe: `Seele gewechselt: ${raw}`,
                    };
                },
            },
            {
                // Ring 6 — architectureTemplates. "baue dorf/tempel/wasserfall hier"
                // platziert die Struktur am Spieler. Ring 11 V2.1: Position +
                // Seed werden hier zur Build-Zeit explizit eingebettet, damit
                // der DSL-Broadcast deterministisch ist (sonst sähen Mitspieler
                // an einer anderen Stelle ein anders aussehendes Dorf).
                example: "baue dorf hier",
                re: /^baue\s+(dorf|tempel|wasserfall)\s+hier\s*$/i,
                build: (m) => {
                    const map = { dorf: "spawn_village", tempel: "spawn_temple", wasserfall: "spawn_waterfall" };
                    const op = map[m[1].toLowerCase()];
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 50, z: 0 };
                    const seed = Math.floor(Math.random() * 0xffffffff);
                    return {
                        program: [op, ["at", p.x, p.y, p.z], seed],
                        describe: `${m[1]} gebaut`,
                    };
                },
            },
            {
                // Ring 6 V2 — Fraktal. Position + RootSeed embed wie oben.
                example: "baue fraktal tempel",
                re: /^baue\s+fraktal(?:\s+(dorf|tempel|wasserfall))?\s*$/i,
                build: (m) => {
                    const map = { dorf: "village", tempel: "temple", wasserfall: "waterfall" };
                    const t = (m[1] || "tempel").toLowerCase();
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, y: 50, z: 0 };
                    const seed = Math.floor(Math.random() * 0xffffffff);
                    return {
                        program: ["spawn_fractal", ["at", p.x, p.y, p.z], map[t], 2, 0.5, seed],
                        describe: `Fraktal-${t} gebaut (depth 2, ratio 0.5)`,
                    };
                },
            },
            {
                // Ring 10.5: Welt-Modifizierbarkeit. `grabe loch` / `hebe
                // hügel` schreibt ein modify_terrain-Op an der aktuellen
                // Spieler-Position, das per-Chunk persistiert wird und
                // einen Chunk-Unload + Reload überlebt.
                example: "grabe loch",
                re: /^grabe\s+(?:ein\s+)?loch\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, z: 0 };
                    return {
                        program: ["modify_terrain", p.x, p.z, 4, -3],
                        describe: "Loch gegraben",
                    };
                },
            },
            {
                example: "hebe hügel",
                re: /^hebe\s+(?:einen\s+)?hügel\s*$/i,
                build: () => {
                    const p = this.state.playerMesh ? this.state.playerMesh.position : { x: 0, z: 0 };
                    return {
                        program: ["modify_terrain", p.x, p.z, 5, 4],
                        describe: "Hügel gehoben",
                    };
                },
            },
            {
                example: "erzähle Drachen leben hier",
                // Erzähle <freier Text> — Text wird in die Knowledge-Base als
                // Narrativ aufgenommen. Wir matchen das ursprüngliche Casing,
                // damit der Text 1:1 persistiert wird (Capture-Gruppe greift
                // auf das Rohkommando zu, nicht das lowercase-`parts`).
                re: /^erzähle[:\s]+(.+)$/i,
                build: (m) => ({
                    program: ["record_narrative", m[1].trim()],
                    describe: `Narrativ gespeichert: ${m[1].trim()}`,
                }),
            },
        ];
        return this._chatDslPatternsCache;
    }

    parseChatToDsl(text) {
        if (typeof text !== "string") return null;
        const t = text.trim();
        if (!t) return null;
        for (const p of this.chatDslPatterns) {
            const m = t.match(p.re);
            if (m) {
                try {
                    const built = p.build(m);
                    if (built && Array.isArray(built.program)) return built;
                } catch (err) {
                    this.log(`Chat→DSL build-Fehler für '${p.example}': ${err.message}`, "ERROR");
                    return null;
                }
            }
        }
        return null;
    }

    // Levenshtein-basierte Vorschläge, wenn weder DSL- noch Legacy-Pfad griff.
    // Wir vergleichen den ersten Tokens-Bigram (z. B. "setze wetter") gegen
    // die Beispiel-Patterns. Distanz <= 4 gilt als „nahe genug".
    chatSuggest(text) {
        if (typeof text !== "string") return null;
        const t = text.trim().toLowerCase();
        if (!t) return null;
        const parts = t.split(/\s+/);
        const head = parts.slice(0, 2).join(" ");
        if (!head) return null;
        const candidates = this.chatDslPatterns.map((p) => p.example);
        let best = null;
        let bestDist = Infinity;
        for (const cand of candidates) {
            const candHead = cand.split(/\s+/).slice(0, 2).join(" ");
            const d = this.levenshtein(head, candHead);
            if (d < bestDist) {
                bestDist = d;
                best = cand;
            }
        }
        return best && bestDist <= 4 ? best : null;
    }

    levenshtein(a, b) {
        if (a === b) return 0;
        const m = a.length;
        const n = b.length;
        if (m === 0) return n;
        if (n === 0) return m;
        // Eine Zeile rollen, um Speicher zu sparen.
        let prev = new Array(n + 1);
        let curr = new Array(n + 1);
        for (let j = 0; j <= n; j++) prev[j] = j;
        for (let i = 1; i <= m; i++) {
            curr[0] = i;
            for (let j = 1; j <= n; j++) {
                const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
                curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
            }
            [prev, curr] = [curr, prev];
        }
        return prev[n];
    }

    // ### Ring 3 – Player-Emotionen ###
    // Regelbasierte Sentiment-Erkennung (Deutsch). Jeder Treffer addiert 0.1
    // auf eine Achse, geclampt bei 1. Im Game-Loop verflüchtigen sich die
    // Werte mit 0.005/Sekunde. Schwellen-Trigger feuern DSL-Programme, damit
    // Emotion zur Welt wird, statt nur als Zahl im State zu liegen.
    get emotionPatterns() {
        if (this._emotionPatternsCache) return this._emotionPatternsCache;
        this._emotionPatternsCache = {
            joy: ["schön", "fröhlich", "liebe", "glücklich", "freude", "lachen", "warm"],
            awe: ["wunder", "magisch", "groß", "ehrfurcht", "staunen", "unfassbar", "weit"],
            sorrow: ["traurig", "weinen", "dunkel", "verloren", "trauer", "schmerz"],
            hope: ["hoffe", "zukunft", "licht", "vertrau", "neu", "beginn"],
            peace: ["ruhig", "still", "frieden", "leise", "sanft"],
            chaos: ["chaos", "wild", "zerstör", "wut", "sturm", "kämpf"],
        };
        return this._emotionPatternsCache;
    }

    collectPlayerEmotions(text) {
        if (typeof text !== "string" || !text.trim()) return;
        const lower = text.toLowerCase();
        const e = this.state.player.emotions;
        const patterns = this.emotionPatterns;
        for (const axis of Object.keys(patterns)) {
            if (patterns[axis].some((word) => lower.includes(word))) {
                e[axis] = Math.min(1, e[axis] + 0.1);
            }
        }
    }

    updatePlayerEmotions(currentTime) {
        const p = this.state.player;
        const prev = p.emotionLastTick;
        const delta = prev > -Infinity ? Math.max(0, currentTime - prev) : 0;
        p.emotionLastTick = currentTime;

        if (delta > 0) {
            const dec = p.emotionDecayPerSec * delta;
            for (const k of Object.keys(p.emotions)) {
                p.emotions[k] = Math.max(0, p.emotions[k] - dec);
            }
        }

        const trigger = (axis, program) => {
            if (p.emotions[axis] < p.emotionThreshold) return;
            const last = p.emotionLastApply[axis] ?? -Infinity;
            if (currentTime - last < p.emotionApplyCooldown) return;
            this.dslRun(program, { source: `emotion:${axis}` });
            p.emotionLastApply[axis] = currentTime;
            this.log(`Emotion '${axis}' triggert Welt-Effekt (Wert ${p.emotions[axis].toFixed(2)})`, "INFO");
        };
        // Ring 3 V2: alle sechs Achsen koppeln. Jede löst eine andere Art
        // von Welt-Wirkung aus, damit sich die emotionalen Zustände nicht
        // überlagern und sichtbar bleiben.
        trigger("joy", ["skybox_color", "#f7d358"]); // warmes Gelb
        trigger("awe", ["skybox_color", "#d4a3ff"]); // magisches Lila
        trigger("sorrow", ["weather", "rainy"]);
        trigger("hope", ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]]);
        trigger("peace", ["creatures_speed_mul", 0.7]);
        trigger("chaos", ["creatures_speed_mul", 1.5]);
    }

    // ### Ring 4 — anazhSymphony V1 ###
    // Web Audio API. Drei Schichten: ambient drone (zwei Oszillatoren leicht
    // verstimmt, langsam moduliert), wetter (gefiltertes Noise für Regen),
    // creature pings (kurze Sinus-Töne bei Spawn). Alle persistieren als
    // Audio-Graph, keine periodische JS-Neu-Erzeugung — Web Audio macht die
    // Arbeit.
    //
    // AudioContext muss durch eine User-Geste gestartet werden (Browser-
    // Autoplay-Policy). Im Headless-Test umgeht `--autoplay-policy=no-user-
    // gesture-required` das.
    initSymphony() {
        const s = this.state.symphony;
        if (s.enabled) return true;
        const AudioCtor = typeof AudioContext !== "undefined" ? AudioContext : window.webkitAudioContext;
        if (!AudioCtor) {
            this.log("Web Audio API nicht verfügbar — Symphonie bleibt stumm", "WARNING");
            return false;
        }
        const ctx = new AudioCtor();
        if (ctx.state === "suspended" && typeof ctx.resume === "function") {
            ctx.resume();
        }
        // Master-Bus
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0.35;
        masterGain.connect(ctx.destination);

        // Ambient: zwei sehr leise Sägezahn-Oszillatoren, leicht verstimmt
        // → langsame Schwebung. LFO auf den Tiefpass-Filter macht das Ganze
        // atmen statt zu stehen.
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 600;
        filter.Q.value = 0.7;

        const ambientGain = ctx.createGain();
        ambientGain.gain.value = 0.15;

        const osc1 = ctx.createOscillator();
        osc1.type = "sawtooth";
        osc1.frequency.value = 110;
        const osc2 = ctx.createOscillator();
        osc2.type = "sawtooth";
        osc2.frequency.value = 111.5;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(ambientGain);
        ambientGain.connect(masterGain);

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        osc1.start();
        osc2.start();
        lfo.start();

        s.ambient = { osc1, osc2, filter, ambientGain, lfo, lfoGain };

        // Wetter: gefiltertes White-Noise. Gain bei 0, bis state.weather "rainy"
        // wird; `symphonyTick` schaltet sanft hin und her.
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;
        const weatherFilter = ctx.createBiquadFilter();
        weatherFilter.type = "bandpass";
        weatherFilter.frequency.value = 1500;
        weatherFilter.Q.value = 0.3;
        const weatherGain = ctx.createGain();
        weatherGain.gain.value = 0;
        noise.connect(weatherFilter);
        weatherFilter.connect(weatherGain);
        weatherGain.connect(masterGain);
        noise.start();

        s.weather = { noise, filter: weatherFilter, gain: weatherGain };

        s.ctx = ctx;
        s.masterGain = masterGain;
        s.enabled = true;
        s.lastWeather = this.state.weather;
        this.log("anazhSymphony V1 aktiviert: ambient + wetter live", "INFO");
        return true;
    }

    disposeSymphony() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        try {
            if (s.ambient) {
                s.ambient.osc1.stop();
                s.ambient.osc2.stop();
                s.ambient.lfo.stop();
            }
            if (s.weather) s.weather.noise.stop();
            s.ctx.close();
        } catch (err) {
            this.log(`Symphonie-Dispose-Fehler: ${err.message}`, "WARNING");
        }
        s.ctx = null;
        s.enabled = false;
        s.ambient = null;
        s.weather = null;
        s.masterGain = null;
    }

    playCreaturePing(emotion = "happy") {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        const ctx = s.ctx;
        // Frequenz folgt Emotion: happy hell (E5 ≈ 659 Hz), sad dunkel (A3 ≈ 220 Hz).
        const freq = emotion === "happy" ? 659 : 220;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        // Kurzes Envelope: 5 ms Attack, 200 ms Decay.
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        osc.connect(gain);
        gain.connect(s.masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
        s.creaturePingCount++;
    }

    symphonyTick() {
        const s = this.state.symphony;
        if (!s.enabled || !s.ctx) return;
        if (s.lastWeather === this.state.weather) return;
        // Sanftes Cross-Fade des Wetter-Layers: 1.5 s Rampe auf Ziel.
        const target = this.state.weather === "rainy" ? 0.18 : 0.0;
        const now = s.ctx.currentTime;
        s.weather.gain.gain.cancelScheduledValues(now);
        s.weather.gain.gain.setValueAtTime(s.weather.gain.gain.value, now);
        s.weather.gain.gain.linearRampToValueAtTime(target, now + 1.5);
        s.lastWeather = this.state.weather;
        this.log(`Symphonie: wetter-Layer → ${target.toFixed(2)} (${this.state.weather})`, "DEBUG");
    }

    // ### Status-Panel (UI V1) ###
    // Lesbares Fenster auf Welt-Zustand und Spieler-Emotionen. Kein Rebuild
    // pro Frame: DOM einmal anlegen, Werte alle 0.4 s aktualisieren. Refs
    // werden gecacht, damit der Tick keine Lookup-Kosten hat.
    // Liste aller Chat-Befehle, gruppiert. Quelle der Wahrheit für Hilfe-
    // Drawer und (später) für Befehl-Diff-Tests. DSL-Patterns liefern den
    // ersten Block automatisch — die Legacy-Befehle stehen hier explizit.
    get chatCommandHelp() {
        if (this._chatCommandHelpCache) return this._chatCommandHelpCache;
        const dslExamples = this.chatDslPatterns.map((p) => p.example);
        this._chatCommandHelpCache = [
            { title: "Welt-Effekte (DSL)", commands: dslExamples },
            {
                title: "Welt-Triggers",
                commands: ["Spawne neue Welt", "Boden nicht sichtbar"],
            },
            {
                title: "Fähigkeiten",
                commands: [
                    "Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau",
                    "Führe Fähigkeit aus farbwechsel",
                ],
            },
            {
                title: "Multisensorik",
                commands: ["Aktiviere Anazh-Symphonie"],
            },
            {
                title: "Spieler-Seele",
                commands: ["Werde Mensch", "Werde Phönix", "Werde Drache"],
            },
            {
                title: "Bauwerke (Ring 6)",
                commands: [
                    "Baue Dorf hier",
                    "Baue Tempel hier",
                    "Baue Wasserfall hier",
                    "Baue Fraktal Tempel",
                    "Baue Fraktal Dorf",
                    "Baue Fraktal Wasserfall",
                ],
            },
            {
                title: "System / Persistenz",
                commands: [
                    "Speichere Zustand",
                    "Lade Zustand",
                    "Lade Datei",
                    "Aktiviere Version 7.67",
                    "Aktiviere Debug-Logs",
                    "Deaktiviere Debug-Logs",
                ],
            },
            {
                title: "Self-Heal",
                commands: ["Behebe Physik-Tunneling", "Optimiere Physik"],
            },
        ];
        return this._chatCommandHelpCache;
    }

    initStatusPanel() {
        // UI V2: kein zentrales #status-panel mehr — Sektionen leben in den
        // sechs Drawer (Welt, Kreaturen, Spieler, Fähigkeiten, Einstellungen,
        // Hilfe). Wir greifen direkt auf die einzelnen IDs zu.
        const emotions = document.getElementById("status-emotions");
        if (!emotions) return;
        const axes = Object.keys(this.state.player.emotions);
        emotions.innerHTML = "";
        const emotionRefs = {};
        for (const axis of axes) {
            const row = document.createElement("div");
            row.className = `emotion ${axis}`;
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = axis;
            const bar = document.createElement("span");
            bar.className = "bar";
            const fill = document.createElement("div");
            bar.appendChild(fill);
            const value = document.createElement("span");
            value.className = "value";
            value.textContent = "0.00";
            row.appendChild(name);
            row.appendChild(bar);
            row.appendChild(value);
            emotions.appendChild(row);
            emotionRefs[axis] = { fill, value };
        }
        this._statusRefs = {
            weather: document.getElementById("status-weather"),
            slug: document.getElementById("status-slug"),
            position: document.getElementById("status-position"),
            fps: document.getElementById("status-fps"),
            creatures: document.getElementById("status-creatures"),
            soul: document.getElementById("status-soul"),
            architectures: document.getElementById("status-architectures"),
            emotions: emotionRefs,
            abilities: document.getElementById("status-abilities"),
            abilitiesSignature: "",
            lastTick: -Infinity,
        };

        // Abilities-Container: Event-Delegation für Ausführen-Buttons.
        const abilitiesContainer = this._statusRefs.abilities;
        if (abilitiesContainer) {
            abilitiesContainer.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const name = target.getAttribute("data-run-ability");
                if (name && this.state.abilities[name]) {
                    this.state.abilities[name]();
                }
            });
        }

        // Export-Button: lokaler Download des aktuellen Zustands ohne Chat-
        // Umweg, damit man den Status-Snapshot direkt teilen kann.
        const exportBtn = document.getElementById("action-export-state");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                this.triggerStateDownload(this.buildStateSnapshot());
            });
        }

        // Tuning-Slider: drei Werte von state.player direkt manipulierbar.
        // Slider sind initial mit Defaults aus dem State befüllt; Änderungen
        // wirken live. Diagnose-Tool — nicht für Persistenz, sondern um
        // schnell auszuprobieren, wie sich Welt + Trigger anfühlen.
        const wireTuningSlider = (id, valueId, apply) => {
            const slider = document.getElementById(id);
            const valueLabel = document.getElementById(valueId);
            if (!slider || !valueLabel) return;
            slider.addEventListener("input", () => {
                const v = parseFloat(slider.value);
                if (!Number.isFinite(v)) return;
                apply(v);
                valueLabel.textContent = slider.step.includes(".")
                    ? v.toFixed(slider.step.split(".")[1].length)
                    : String(v);
            });
        };
        const p = this.state.player;
        const thresholdSlider = document.getElementById("tune-threshold");
        if (thresholdSlider) thresholdSlider.value = String(p.emotionThreshold);
        const decaySlider = document.getElementById("tune-decay");
        if (decaySlider) decaySlider.value = String(p.emotionDecayPerSec);
        const cooldownSlider = document.getElementById("tune-cooldown");
        if (cooldownSlider) cooldownSlider.value = String(p.emotionApplyCooldown);
        const thresholdValue = document.getElementById("tune-threshold-v");
        if (thresholdValue) thresholdValue.textContent = p.emotionThreshold.toFixed(2);
        const decayValue = document.getElementById("tune-decay-v");
        if (decayValue) decayValue.textContent = p.emotionDecayPerSec.toFixed(3);
        const cooldownValue = document.getElementById("tune-cooldown-v");
        if (cooldownValue) cooldownValue.textContent = String(p.emotionApplyCooldown);

        wireTuningSlider("tune-threshold", "tune-threshold-v", (v) => {
            p.emotionThreshold = v;
        });
        wireTuningSlider("tune-decay", "tune-decay-v", (v) => {
            p.emotionDecayPerSec = v;
        });
        wireTuningSlider("tune-cooldown", "tune-cooldown-v", (v) => {
            p.emotionApplyCooldown = v;
        });

        // Quick-Action-Buttons: data-cmd-Attribut → processChatCommand
        const quick = document.getElementById("quick-actions");
        if (quick) {
            quick.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const cmd = target.getAttribute("data-cmd");
                if (cmd) this.processChatCommand(cmd);
            });
        }

        // Kreatur-Actions teilen denselben Klick-Handler wie Quick-Actions.
        const creatureActions = document.getElementById("creature-actions");
        if (creatureActions) {
            creatureActions.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const cmd = target.getAttribute("data-cmd");
                if (cmd) this.processChatCommand(cmd);
            });
        }

        // Ring 6 — Bauwerk-Actions teilen denselben Mechanismus.
        const architectureActions = document.getElementById("architecture-actions");
        if (architectureActions) {
            architectureActions.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const cmd = target.getAttribute("data-cmd");
                if (cmd) this.processChatCommand(cmd);
            });
        }

        // Hilfe-Drawer: Befehl-Liste aus chatCommandHelp generieren. Der
        // Hilfe-Drawer ist einer der sechs Tabs; Anzeige + Schließen läuft
        // über das Tab-/Drawer-System (siehe initTopbar). Hier nur die
        // Befehlsliste und der Klick-Delegate.
        const helpList = document.getElementById("help-list");
        if (helpList) {
            for (const group of this.chatCommandHelp) {
                const h = document.createElement("h3");
                h.textContent = group.title;
                helpList.appendChild(h);
                for (const cmd of group.commands) {
                    const btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "cmd";
                    btn.textContent = cmd;
                    btn.setAttribute("data-cmd", cmd);
                    helpList.appendChild(btn);
                }
            }
            helpList.addEventListener("click", (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const cmd = target.getAttribute("data-cmd");
                if (cmd) {
                    this.processChatCommand(cmd);
                    this.closeAllDrawers();
                }
            });
        }
    }

    // Konsole-Panel: einklappbar via #console-collapse. Im eingeklappten
    // Zustand bleiben Header + Input sichtbar; Chat-Output + Log verschwinden.
    // localStorage merkt sich die Wahl (anazhRealmConsole = "collapsed"/"open").
    initConsoleDOM() {
        const panel = document.getElementById("console");
        const toggle = document.getElementById("console-collapse");
        if (!panel || !toggle) return;
        const setCollapsed = (collapsed) => {
            panel.classList.toggle("collapsed", collapsed);
            toggle.setAttribute("aria-pressed", collapsed ? "true" : "false");
            toggle.textContent = collapsed ? "+" : "−";
            toggle.setAttribute("aria-label", collapsed ? "Konsole entfalten" : "Konsole einklappen");
        };
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmConsole");
            } catch {
                return null;
            }
        })();
        setCollapsed(stored === "collapsed");
        toggle.addEventListener("click", () => {
            const next = !panel.classList.contains("collapsed");
            setCollapsed(next);
            try {
                localStorage.setItem("anazhRealmConsole", next ? "collapsed" : "open");
            } catch {
                /* Persistenz best-effort. */
            }
        });
    }

    // Tab-System: ein Tab je Drawer. activeTab-Klasse auf dem Knopf,
    // hidden-Attribut entscheidet welcher Drawer sichtbar slidet.
    // closeAllDrawers schließt alle (für Help-Klick + ESC).
    initTopbar() {
        const tabs = Array.from(document.querySelectorAll("#topbar .tab"));
        const drawers = Array.from(document.querySelectorAll(".drawer[data-drawer]"));
        if (tabs.length === 0 || drawers.length === 0) return;

        const openDrawer = (name) => {
            for (const tab of tabs) {
                const isActive = tab.getAttribute("data-tab") === name;
                tab.classList.toggle("active", isActive);
                tab.setAttribute("aria-selected", isActive ? "true" : "false");
            }
            for (const drawer of drawers) {
                const isThis = drawer.getAttribute("data-drawer") === name;
                drawer.hidden = !isThis;
            }
        };
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) openDrawer(name);
            });
        }
        // Close-Buttons schließen den eigenen Drawer und entaktivieren den Tab.
        for (const closeBtn of document.querySelectorAll("[data-drawer-close]")) {
            closeBtn.addEventListener("click", () => this.closeAllDrawers());
        }
        // ESC schließt offene Drawers (außer Welt, der bleibt als Default).
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") this.closeAllDrawers();
        });
        // Welt ist Default-aktiv (siehe HTML); state.uiActiveDrawer trackt
        // den aktuellen Tab, damit Tests + spätere Save-Persistenz darauf
        // greifen können.
        this.state.uiActiveDrawer = "welt";
        // Wir loggen Tab-Klicks indirekt via uiActiveDrawer-Update.
        for (const tab of tabs) {
            tab.addEventListener("click", () => {
                const name = tab.getAttribute("data-tab");
                if (name) this.state.uiActiveDrawer = name;
            });
        }
    }

    closeAllDrawers() {
        const tabs = document.querySelectorAll("#topbar .tab");
        for (const tab of tabs) {
            tab.classList.remove("active");
            tab.setAttribute("aria-selected", "false");
        }
        for (const drawer of document.querySelectorAll(".drawer[data-drawer]")) {
            drawer.hidden = true;
        }
        this.state.uiActiveDrawer = null;
    }

    updateStatusPanel(currentTime) {
        if (!this._statusRefs) return;
        if (currentTime - this._statusRefs.lastTick < 0.4) return;
        this._statusRefs.lastTick = currentTime;
        const r = this._statusRefs;
        if (r.weather) r.weather.textContent = this.state.weather || "—";
        if (r.slug) r.slug.textContent = this.state.worldMeta.slug || "—";
        if (r.position && this.state.playerMesh) {
            const p = this.state.playerMesh.position;
            r.position.textContent = `${p.x.toFixed(1)} ${p.y.toFixed(1)} ${p.z.toFixed(1)}`;
        }
        if (r.fps) r.fps.textContent = String(this.state.fps || 0);
        if (r.creatures) r.creatures.textContent = String(this.state.creatures.length);
        if (r.soul) {
            const def = this.playerSoulDefs[this.state.player.soul || "human"];
            r.soul.textContent = (def && def.label) || "—";
        }
        if (r.architectures) {
            const counts = this.countArchitecturesNearPlayer(60);
            r.architectures.textContent = `${counts.near} nah / ${counts.total}`;
        }
        const e = this.state.player.emotions;
        for (const axis of Object.keys(r.emotions)) {
            const v = Math.max(0, Math.min(1, e[axis] || 0));
            r.emotions[axis].fill.style.width = `${(v * 100).toFixed(0)}%`;
            r.emotions[axis].value.textContent = v.toFixed(2);
        }
        this.renderAbilitiesList();
    }

    // Abilities-Liste re-rendern, aber nur wenn sich Name/Source-Set
    // tatsächlich geändert hat — Signature-Hash hält den Diff billig.
    renderAbilitiesList() {
        const r = this._statusRefs;
        if (!r || !r.abilities) return;
        const list = this.state.dsl.abilities;
        // Length-Prefix sorgt dafür, dass die initiale leere Signature ("")
        // und ein leeres Array ("0:") unterscheidbar sind — sonst würde der
        // erste Empty-State-Render durch den Early-Return wegoptimiert.
        // Welle 6.E1: Description-Hash mit in die Signature, sonst würde ein
        // Lazy-Compute (fehlende description in Legacy-Saves) keinen Re-Render
        // triggern.
        const signature =
            list.length + ":" + list.map((a) => `${a.name}:${a.source || "?"}:${a.description ? "d" : "_"}`).join("|");
        if (signature === r.abilitiesSignature) return;
        r.abilitiesSignature = signature;
        const container = r.abilities;
        container.innerHTML = "";
        if (list.length === 0) {
            const empty = document.createElement("div");
            empty.className = "ability-empty";
            empty.textContent = "Noch keine Fähigkeiten gelernt.";
            container.appendChild(empty);
            return;
        }
        // Neueste zuerst, max 20 angezeigt (UI-Limit, Save-Array bleibt 200).
        const recent = list.slice(-20).reverse();
        for (const ability of recent) {
            const row = document.createElement("div");
            const src = ability.source || "unknown";
            row.className = `ability-row source-${src}`;
            const head = document.createElement("div");
            head.className = "ability-head";
            const name = document.createElement("span");
            name.className = "name";
            name.textContent = ability.name;
            const source = document.createElement("span");
            source.className = "source";
            source.textContent = src;
            const run = document.createElement("button");
            run.type = "button";
            run.textContent = "▶";
            run.setAttribute("data-run-ability", ability.name);
            run.setAttribute("aria-label", `Fähigkeit ${ability.name} ausführen`);
            head.appendChild(name);
            head.appendChild(source);
            head.appendChild(run);
            row.appendChild(head);
            // Welle 6.E1 — Beschreibung unter dem Namen. Bei alten Saves
            // (ohne `description`-Feld) lazy berechnen + persistieren, damit
            // der nächste Save sie mitnimmt.
            if (!ability.description && Array.isArray(ability.program)) {
                try {
                    ability.description = this.describeProgram(ability.program);
                } catch {
                    ability.description = "wirkt auf die Welt";
                }
            }
            if (ability.description) {
                const desc = document.createElement("div");
                desc.className = "ability-desc";
                desc.textContent = ability.description;
                row.appendChild(desc);
            }
            container.appendChild(row);
        }
    }

    // ### Welt-Identität (Ring 8+ Vorbereitung) ###
    ensureWorldMeta() {
        const m = this.state.worldMeta;
        let fresh = false;
        if (!m.worldId) {
            fresh = true;
            try {
                m.worldId =
                    typeof crypto !== "undefined" && crypto.randomUUID
                        ? crypto.randomUUID()
                        : "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
            } catch {
                m.worldId = "w_" + Math.random().toString(36).slice(2, 10);
            }
        }
        if (!m.slug) {
            const adjectives = ["still", "weite", "klare", "dunkle", "warme", "leise", "wache"];
            const nouns = ["aue", "feld", "ufer", "saum", "weiher", "halde", "hain"];
            const a = adjectives[Math.floor(Math.random() * adjectives.length)];
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            m.slug = `${a}-${n}`;
        }
        if (!m.bornAt) m.bornAt = Date.now();
        // Ring 8.1: Seed-Strategie. ensureWorldMeta wird nur dann mit
        // fehlendem Seed aufgerufen, wenn (a) ein brandneuer Spieler ohne
        // localStorage startet ODER (b) eine Legacy-Welt vor Ring 8.1
        // migriert wird. In BEIDEN Fällen ist die Wahl des Schöpfers, dass
        // diese „erste Welt" wie eh und je aussieht — Eingangs-Welt-Gefühl,
        // identisch für alle, Lehrling-freundlich. Eigene Welten mit
        // randomisiertem Seed entstehen erst durch ausdrücklichen Akt
        // (createNewWorld → _generateFreshWorldMeta).
        if (typeof m.seed !== "string" || m.seed.length === 0) {
            m.seed = "anazh-realm-seed";
        }
        if (fresh) {
            this.journalAppend("genesis", `Ich erwache als ${m.slug}.`, { worldId: m.worldId });
            // Ring 8: frische Welt im Index registrieren. Reload-Migration
            // (legacy single-key) ruft ensureWorldMeta nach Pre-Load auf;
            // dort ist worldId schon gesetzt und dieser Pfad bleibt aus.
            this.worldsIndexUpsert({
                worldId: m.worldId,
                slug: m.slug,
                bornAt: m.bornAt,
                lastPlayed: Date.now(),
            });
            try {
                localStorage.setItem("anazhRealmActiveWorld", m.worldId);
            } catch {
                // localStorage voll/blockiert: aktiver Welt-Zeiger bleibt aus,
                // nächster Reload startet wieder fresh. Kein Drama.
            }
        }
    }

    // ### Ring 8 — Multi-Welt-Verwaltung ###
    //
    // Drei localStorage-Keys spannen das Multi-Welt-System:
    //   - `anazhRealmWorlds`             — JSON-Array `[{worldId, slug, bornAt, lastPlayed}]`
    //   - `anazhRealmState_<worldId>`    — pro Welt ein voller Snapshot (wie alt `anazhRealmState`)
    //   - `anazhRealmActiveWorld`        — `<worldId>` der zuletzt aktiven Welt
    //
    // Legacy-Schlüssel `anazhRealmState` (single-world Pfad) wird beim ersten
    // Lauf migriert: worldId aus seinem `worldMeta` (oder neu generiert),
    // umgeschrieben auf `anazhRealmState_<id>`, in den Index aufgenommen,
    // als aktive Welt gesetzt, dann der alte Key gelöscht. Einmaliger Pfad
    // in `_migrateLegacySingleWorld`.
    //
    // Welt-Wechsel ist reload-basiert: `saveState()` schreibt den aktuellen
    // Stand in den per-Welt-Key, `activeWorldSet(target)` zeigt auf die neue
    // Welt, `window.location.reload()` startet den vollen Init-Pfad neu.
    // Begründung: in-place Welt-Tausch würde tiefen Dispose-Pfad (Chunks,
    // Architekturen, Kreaturen, Physik-Bodies, Symphony-Audio, Renderer-
    // Caches) brauchen und ist Bug-Reservoir; Reload garantiert sauberen
    // Start ohne State-Leak. UX-Kosten: ~2 s Ladezeit beim Wechsel.

    worldStorageKey(worldId) {
        return `anazhRealmState_${worldId}`;
    }

    activeWorldGet() {
        try {
            return localStorage.getItem("anazhRealmActiveWorld") || null;
        } catch {
            return null;
        }
    }

    activeWorldSet(worldId) {
        try {
            if (worldId) localStorage.setItem("anazhRealmActiveWorld", worldId);
            else localStorage.removeItem("anazhRealmActiveWorld");
            return true;
        } catch {
            return false;
        }
    }

    worldsIndexLoad() {
        try {
            const raw = localStorage.getItem("anazhRealmWorlds");
            if (!raw) return [];
            const arr = JSON.parse(raw);
            return Array.isArray(arr) ? arr.filter((e) => e && typeof e.worldId === "string") : [];
        } catch {
            return [];
        }
    }

    worldsIndexSave(arr) {
        try {
            localStorage.setItem("anazhRealmWorlds", JSON.stringify(Array.isArray(arr) ? arr : []));
            return true;
        } catch {
            return false;
        }
    }

    // Idempotent: legt einen Eintrag an oder aktualisiert slug/lastPlayed.
    // Felder bornAt/parentWorlds/visibility nur beim Neu-Anlegen setzen,
    // sonst würde ein Save später ein verändertes bornAt überschreiben.
    worldsIndexUpsert(meta) {
        if (!meta || typeof meta.worldId !== "string") return false;
        const idx = this.worldsIndexLoad();
        const existing = idx.find((e) => e.worldId === meta.worldId);
        if (existing) {
            if (typeof meta.slug === "string" && meta.slug) existing.slug = meta.slug;
            if (Number.isFinite(meta.lastPlayed)) existing.lastPlayed = meta.lastPlayed;
        } else {
            idx.push({
                worldId: meta.worldId,
                slug: meta.slug || "",
                bornAt: Number.isFinite(meta.bornAt) ? meta.bornAt : Date.now(),
                lastPlayed: Number.isFinite(meta.lastPlayed) ? meta.lastPlayed : Date.now(),
            });
        }
        return this.worldsIndexSave(idx);
    }

    worldsIndexRemove(worldId) {
        const idx = this.worldsIndexLoad();
        const filtered = idx.filter((e) => e.worldId !== worldId);
        if (filtered.length === idx.length) return false;
        return this.worldsIndexSave(filtered);
    }

    // Liest die zur aktiven Welt-ID passende worldMeta-Sektion AUS DEM SAVE,
    // ohne den vollen loadState() zu fahren. Wird in init() vor ensure-
    // WorldMeta aufgerufen, damit der „frische Welt"-Pfad (UUID-Erzeugung +
    // Genesis-Journal-Eintrag) nicht versehentlich für eine bereits
    // existierende Welt feuert. Kein UI, kein Mesh-Eingriff — rein Lesen.
    _preloadActiveWorldMeta() {
        const active = this.activeWorldGet();
        if (!active) {
            // Vielleicht hat der User einen Legacy-Save → erst Migration
            // versuchen, dann erneut Pre-Load.
            const migrated = this._migrateLegacySingleWorld();
            if (!migrated) return false;
        }
        const id = this.activeWorldGet();
        if (!id) return false;
        try {
            const raw = localStorage.getItem(this.worldStorageKey(id));
            if (!raw) return false;
            const parsed = JSON.parse(raw);
            if (parsed && parsed.worldMeta && typeof parsed.worldMeta === "object") {
                this.state.worldMeta = { ...this.state.worldMeta, ...parsed.worldMeta };
                return true;
            }
        } catch (err) {
            this.log(`Welt-Vorlade fehlgeschlagen: ${err.message}`, "WARN");
        }
        return false;
    }

    // Einmalige Migration: alter Single-Key `anazhRealmState` bekommt eine
    // worldId (aus seinem eigenen worldMeta, oder neu), wird auf den Multi-
    // Key umgeschrieben, in den Index aufgenommen, als aktiv markiert. Der
    // alte Key wird danach gelöscht, damit beim nächsten Start kein doppelter
    // Pfad existiert. Gibt true zurück, wenn migriert wurde.
    _migrateLegacySingleWorld() {
        try {
            const legacy = localStorage.getItem("anazhRealmState");
            if (!legacy) return false;
            const parsed = JSON.parse(legacy);
            if (!parsed || typeof parsed !== "object") return false;
            // worldId entscheiden: Save hat eine, oder wir generieren eine.
            let worldId = parsed.worldMeta && parsed.worldMeta.worldId;
            if (!worldId) {
                try {
                    worldId =
                        typeof crypto !== "undefined" && crypto.randomUUID
                            ? crypto.randomUUID()
                            : "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
                } catch {
                    worldId = "w_" + Math.random().toString(36).slice(2, 10);
                }
                parsed.worldMeta = { ...(parsed.worldMeta || {}), worldId };
            }
            const slug = (parsed.worldMeta && parsed.worldMeta.slug) || "";
            const bornAt = (parsed.worldMeta && parsed.worldMeta.bornAt) || Date.now();
            localStorage.setItem(this.worldStorageKey(worldId), JSON.stringify(parsed));
            this.worldsIndexUpsert({ worldId, slug, bornAt, lastPlayed: Date.now() });
            this.activeWorldSet(worldId);
            localStorage.removeItem("anazhRealmState");
            this.log(
                `Welt-Migration: alter Single-Welt-Save → Multi-Welt-Index (worldId=${worldId.slice(0, 8)}…)`,
                "INFO"
            );
            return true;
        } catch (err) {
            this.log(`Welt-Migration fehlgeschlagen: ${err.message}`, "ERROR");
            return false;
        }
    }

    // Generator-Helfer: erzeugt einen frischen worldMeta-Block (UUID + slug
    // + bornAt). Nicht idempotent — jeder Aufruf eine neue ID. Wird von
    // createNewWorld genutzt.
    _generateFreshWorldMeta(slug) {
        let worldId;
        try {
            worldId =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        } catch {
            worldId = "w_" + Math.random().toString(36).slice(2, 10);
        }
        let finalSlug = (slug || "")
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
        if (!finalSlug) {
            const adjectives = ["still", "weite", "klare", "dunkle", "warme", "leise", "wache"];
            const nouns = ["aue", "feld", "ufer", "saum", "weiher", "halde", "hain"];
            const a = adjectives[Math.floor(Math.random() * adjectives.length)];
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            finalSlug = `${a}-${n}`;
        }
        // Slug-Eindeutigkeit: wenn ein Index-Eintrag denselben slug hat,
        // hängen wir `-2`/`-3`/… an, bis frei.
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        if (usedSlugs.has(finalSlug)) {
            let n = 2;
            while (usedSlugs.has(`${finalSlug}-${n}`)) n++;
            finalSlug = `${finalSlug}-${n}`;
        }
        // Ring 8.1: jeder neue Welt-Akt erzeugt einen eigenen Terrain-Seed.
        // Mensch + UUID-Fragment bilden eine kurze, lesbare Quelle; SimplexNoise
        // hasht das intern. Der Seed bleibt für die gesamte Welt-Lebensdauer
        // konstant (in worldMeta persistiert).
        const seed = `w-${worldId.replace(/-/g, "").slice(0, 12)}-${Math.random().toString(36).slice(2, 8)}`;
        return { worldId, slug: finalSlug, bornAt: Date.now(), seed };
    }

    // Snapshot einer „leeren" Welt mit gegebenem worldMeta. Optional bekommt
    // die Welt einen Player-Snapshot (für „bisherige Person übernehmen").
    // Wird vor dem Reload geschrieben — der Reload-Init-Pfad findet einen
    // gültigen Per-Welt-Save vor und startet die neue Welt mit dieser Basis.
    _buildEmptyWorldSnapshot(worldMeta, inheritPlayer) {
        const snap = {
            // Ring 8.2: Y=50 wie beim allerersten Spawn — der Spieler fällt
            // sauber aufs Terrain. Y=5 würde ihn in steile Hänge clippen
            // lassen, weil das Terrain je nach Seed auch 30+ Einheiten hoch
            // sein kann. Die loadState-Position-Restore-Logik teleportiert
            // sonst auf die zu tiefe Höhe, statt einen Spawn-Fall zu lassen.
            playerPosition: { x: 0, y: 50, z: 0 },
            knowledgeBase: [],
            version: this.state.currentVersion || "7.71",
            selfAwareness: { components: [], weaknesses: [] },
            creatures: [],
            creatureEmotions: [],
            terrainSteepness: 1.0,
            terrainBaseHeight: 0.0,
            weather: "sunny",
            // Eine neue Welt erbt KEINE parentWorlds — sie ist eigenständig
            // (Fusion mit parentWorlds folgt in Ring 10). visibility/creator
            // bleiben aus der Schöpfer-Wahl (Default „private"/„local").
            worldMeta: {
                ...this.state.worldMeta,
                ...worldMeta,
                parentWorlds: [],
                // Ring 10.5: neue Welten starten mit 10.5-Schema und leerer
                // Delta-Map. Schema-Bump signalisiert „kennt chunkDeltas",
                // alte Welten (8.0/9.0/10.0) bleiben kompatibel — der Loader
                // füllt chunkDeltas defensiv mit `{}` falls fehlend.
                schemaVersion: "10.5-chunk-delta-v1",
                chunkDeltas: {},
            },
            dslAbilities: [],
            dslHistory: [],
            dslPatternMemory: {},
            playerPathBuckets: null,
            // Ring 8.1: neue Welt bekommt sofort einen Genesis-Eintrag —
            // ensureWorldMeta würde ihn nach dem Reload nicht mehr setzen
            // (worldId ist dann schon im Save). Stattdessen schreiben wir
            // ihn beim Anlegen mit, mit „genesis"-Schlüssel im seen-Map,
            // damit kein Duplikat möglich ist.
            worldJournal: {
                entries: [
                    {
                        id: 1,
                        at: Date.now(),
                        tick: 0,
                        type: "genesis",
                        text: `Ich erwache als ${worldMeta.slug}.`,
                        ctx: {
                            worldId: worldMeta.worldId,
                            seed: worldMeta.seed || null,
                            inheritedPlayer: !!inheritPlayer,
                        },
                    },
                ],
                seen: { genesis: true },
            },
            playerEmotions: { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 },
            playerSoul: "human",
            playerTools: [],
            architectures: [],
            blueprints: [],
            tools: [],
            materials: [],
            hotbar: [],
        };
        if (inheritPlayer) {
            // Person-Übernahme: Werkzeug-Besitz + Seele werden mitgenommen,
            // aber Pfad-Buckets, Emotionen, Journal bleiben welt-spezifisch
            // (eine andere Welt = ein neues Gemüt, eine neue Geschichte).
            snap.playerSoul = this.state.player.soul || "human";
            snap.playerTools = Array.isArray(this.state.player.tools) ? [...this.state.player.tools] : [];
            // Auch eigene Materialien und Werkzeuge (aus state.materials /
            // state.tools, jeweils nicht-builtIn) wandern mit, weil sie an
            // den Spieler-Schöpfer gebunden sind, nicht an die Welt.
            snap.materials = Object.values(this.state.materials || {})
                .filter((m) => m && !m.builtIn)
                .map((m) => ({ name: m.name, label: m.label || m.name, color: m.color, tags: { ...m.tags } }));
            snap.tools = Object.values(this.state.tools || {})
                .filter((t) => t && !t.builtIn)
                .map((t) => ({
                    name: t.name,
                    label: t.label,
                    opClass: t.opClass,
                    opName: t.opName,
                    precisionCap: t.precisionCap,
                    sourceBlueprint: t.sourceBlueprint || null,
                }));
            // Eigene Baupläne ebenfalls — sie sind Schöpfer-Wissen, kein
            // Welt-Erlebnis. Hotbar bleibt leer (Welt-spezifisch).
            snap.blueprints = Object.values(this.state.blueprints || {})
                .filter((bp) => bp && !bp.builtIn)
                .map((bp) => ({
                    name: bp.name,
                    label: bp.label || bp.name,
                    parts: Array.isArray(bp.parts) ? JSON.parse(JSON.stringify(bp.parts)) : [],
                    connections: Array.isArray(bp.connections) ? JSON.parse(JSON.stringify(bp.connections)) : [],
                    ...(bp.role === "tool" && bp.toolMeta
                        ? { role: "tool", toolMeta: { opName: bp.toolMeta.opName, opClass: bp.toolMeta.opClass } }
                        : {}),
                }));
        }
        return snap;
    }

    // Hauptpfad: neue Welt anlegen, schreiben, aktiv setzen. Reload-Trigger
    // standardmäßig aus, damit Tests die Daten-Schicht prüfen können ohne
    // Page-Reload. UI-Aufrufer hängen explizit ein `window.location.reload()`
    // nach erfolgreichem Aufruf an.
    createNewWorld({ slug = null, inheritPlayer = false, reload = false, role = "solo" } = {}) {
        // Aktuelle Welt zuerst sichern, sonst geht der Stand verloren.
        if (this.state.worldMeta && this.state.worldMeta.worldId) {
            try {
                this.saveState();
            } catch (err) {
                this.log(`Save vor New-World fehlgeschlagen: ${err.message}`, "WARN");
            }
        }
        const meta = this._generateFreshWorldMeta(slug);
        const snap = this._buildEmptyWorldSnapshot(meta, inheritPlayer);
        // Ring 11.5: Rolle in worldMeta einsetzen (default "solo"). Bei
        // "host"/"guest" startet Init nach Reload automatisch Multi-User-Sync.
        if (role === "host" || role === "guest") {
            snap.worldMeta.role = role;
        }
        try {
            localStorage.setItem(this.worldStorageKey(meta.worldId), JSON.stringify(snap));
        } catch (err) {
            this.log(`Neue Welt konnte nicht geschrieben werden: ${err.message}`, "ERROR");
            return null;
        }
        this.worldsIndexUpsert({
            worldId: meta.worldId,
            slug: meta.slug,
            bornAt: meta.bornAt,
            lastPlayed: Date.now(),
        });
        this.activeWorldSet(meta.worldId);
        this.log(
            `Neue Welt erschaffen: ${meta.slug} (${meta.worldId.slice(0, 8)}…, inheritPlayer=${inheritPlayer})`,
            "INFO"
        );
        if (
            reload &&
            typeof window !== "undefined" &&
            window.location &&
            typeof window.location.reload === "function"
        ) {
            window.location.reload();
        }
        return meta.worldId;
    }

    // Wechsel zu einer existierenden Welt. Sichert aktuelle, setzt aktiv,
    // optional Reload. Gibt false zurück, wenn die Ziel-Welt nicht im
    // Speicher existiert (Index-Eintrag ohne Save-Datei wäre ein Bug).
    switchToWorld(worldId, { reload = false } = {}) {
        if (!worldId || typeof worldId !== "string") return false;
        if (worldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            // Bereits aktiv, kein Wechsel nötig.
            return true;
        }
        const targetRaw = localStorage.getItem(this.worldStorageKey(worldId));
        if (!targetRaw) {
            this.log(`Welt-Wechsel verweigert: kein Save für ${worldId.slice(0, 8)}…`, "ERROR");
            return false;
        }
        // Aktuelle Welt sichern.
        if (this.state.worldMeta && this.state.worldMeta.worldId) {
            try {
                this.saveState();
            } catch (err) {
                this.log(`Save vor Welt-Wechsel fehlgeschlagen: ${err.message}`, "WARN");
            }
        }
        // Index-lastPlayed der Ziel-Welt aktualisieren.
        const idx = this.worldsIndexLoad();
        const target = idx.find((e) => e.worldId === worldId);
        if (target) {
            target.lastPlayed = Date.now();
            this.worldsIndexSave(idx);
        }
        this.activeWorldSet(worldId);
        this.log(`Welt-Wechsel: aktiv ist nun ${worldId.slice(0, 8)}…`, "INFO");
        if (
            reload &&
            typeof window !== "undefined" &&
            window.location &&
            typeof window.location.reload === "function"
        ) {
            window.location.reload();
        }
        return true;
    }

    // Welt löschen. Aktuelle Welt darf nicht gelöscht werden — der Spieler
    // muss erst wechseln. Save-Datei + Index-Eintrag werden entfernt.
    deleteWorld(worldId) {
        if (!worldId || typeof worldId !== "string") return false;
        if (worldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            this.log("Welt-Löschung verweigert: aktive Welt kann nicht gelöscht werden.", "WARN");
            return false;
        }
        try {
            localStorage.removeItem(this.worldStorageKey(worldId));
        } catch {
            // ignorieren — Index trotzdem bereinigen, damit der UI-Picker stimmt.
        }
        this.worldsIndexRemove(worldId);
        this.log(`Welt gelöscht: ${worldId.slice(0, 8)}…`, "INFO");
        return true;
    }

    // ### Welle 1 D — Welt-Journal ###
    // Geordnete Erinnerungen, die die Welt zu einer Person mit Geschichte
    // machen. Wird vom LLM-System-Prompt als Auszug eingeblendet (Welle 1 A),
    // damit der LLM aus ihr erzählen kann statt nur den aktuellen State zu
    // sehen. `seen` hält One-Shot-Schlüssel (z. B. „firstDragon"), damit
    // wir bestimmte Erinnerungen nur einmal speichern.

    journalAppend(type, text, ctx) {
        const j = this.state.worldJournal;
        if (!j || !Array.isArray(j.entries)) return;
        if (typeof text !== "string" || text.length === 0) return;
        const entry = {
            id: j.entries.length + 1,
            at: Date.now(),
            tick: performance.now() / 1000,
            type: String(type || "note"),
            text: text.slice(0, 240),
        };
        if (ctx && typeof ctx === "object") entry.ctx = ctx;
        j.entries.push(entry);
        if (j.entries.length > (j.entryCap || 200)) {
            j.entries = j.entries.slice(-j.entryCap);
        }
    }

    // Idempotente Variante: nur schreiben, wenn der Schlüssel noch nie
    // gesehen wurde. Für „erstes Mal X"-Erinnerungen.
    journalAppendOnce(key, type, text, ctx) {
        const j = this.state.worldJournal;
        if (!j) return;
        if (!j.seen) j.seen = {};
        if (j.seen[key]) return;
        j.seen[key] = true;
        this.journalAppend(type, text, ctx);
    }

    // Frame-Hook: schaut auf den aktuellen State und schreibt selten, aber
    // bedeutsame Erinnerungen. Wird vom Game-Loop alle 5 s aufgerufen
    // (mit lastSelfAnalysis als Throttle-Anker, also gleicher Takt wie
    // selfAwarenessAnalyze).
    journalTick(currentTime) {
        const m = this.state.worldMeta;
        if (!m || !m.worldId) return;
        // Erste Kreatur
        if (this.state.creatures.length > 0) {
            this.journalAppendOnce("firstCreature", "creatures", "Die erste Kreatur regte sich.");
        }
        // Erstes Bauwerk
        if (Array.isArray(this.state.architectures) && this.state.architectures.length > 0) {
            const a = this.state.architectures[0];
            this.journalAppendOnce(
                "firstArchitecture",
                "architecture",
                `Das erste Bauwerk entstand: ${a.type || "Struktur"}.`
            );
        }
        // Wetter-Wechsel: aus prevWeather merken, der nicht im Journal-State liegt
        if (this.state.weather === "rainy") {
            this.journalAppendOnce("firstRain", "weather", "Der erste Regen begann.");
        }
        // Hochfitness-Programm aus der History — wir wandern beim ersten
        // finalisierten Eintrag mit fitness >= 0.7 in eine Erinnerung.
        const hist = this.state.dsl && this.state.dsl.history;
        if (Array.isArray(hist) && hist.length > 0) {
            const best = hist
                .filter((h) => h && h.finalized && typeof h.fitness === "number" && h.fitness >= 0.7)
                .slice(-1)[0];
            if (best) {
                this.journalAppendOnce(
                    `highFitness:${best.id}`,
                    "growth",
                    `Etwas Wirkungsvolles ist mir gelungen: ${JSON.stringify(best.program).slice(0, 100)} (Fitness ${best.fitness.toFixed(2)}).`,
                    { programId: best.id, fitness: best.fitness }
                );
            }
        }
        // Emotion-Peak: irgendeine Achse > 0.85. One-Shot pro Achse, neu
        // freigegeben wenn die Achse mal unter 0.3 fällt (über seenLow-Map).
        if (!this.state.worldJournal.seenLow) this.state.worldJournal.seenLow = {};
        const e = this.state.player && this.state.player.emotions;
        if (e) {
            for (const axis of Object.keys(e)) {
                const v = e[axis];
                if (v < 0.3 && this.state.worldJournal.seenLow[axis]) {
                    delete this.state.worldJournal.seen[`emotionPeak:${axis}`];
                    this.state.worldJournal.seenLow[axis] = false;
                } else if (v >= 0.85) {
                    this.journalAppendOnce(
                        `emotionPeak:${axis}`,
                        "emotion",
                        `Eine Welle ${axis} (${v.toFixed(2)}) durchzog uns.`,
                        { axis, value: v }
                    );
                    this.state.worldJournal.seenLow[axis] = false;
                } else if (v < 0.3) {
                    this.state.worldJournal.seenLow[axis] = true;
                }
            }
        }
        // Drache: spawn_blueprint mit dragon oder ein soul-Wechsel zu dragon
        if (this.state.player && this.state.player.soul === "dragon") {
            this.journalAppendOnce("becameDragon", "soul", "Du wurdest zum Drachen.");
        }
        if (this.state.player && this.state.player.soul === "phoenix") {
            this.journalAppendOnce("becamePhoenix", "soul", "Du wurdest zum Phönix.");
        }
        // currentTime nur für künftige Throttle-Logik; aktuell ist
        // journalAppendOnce der eigentliche Spam-Schutz.
        void currentTime;
    }

    // Liefert einen knappen Auszug für den LLM-System-Prompt (Welle 1 A):
    // die ersten 3 Erinnerungen (Genesis-Anker) + die letzten 7 (jüngstes
    // Erleben). Reicht für Identitäts-Verankerung ohne Token-Bloat.
    journalForPrompt() {
        const j = this.state.worldJournal;
        if (!j || !Array.isArray(j.entries) || j.entries.length === 0) return "";
        const head = j.entries.slice(0, 3);
        const tail = j.entries.slice(-7);
        const seen = new Set();
        const ordered = [];
        for (const e of [...head, ...tail]) {
            if (seen.has(e.id)) continue;
            seen.add(e.id);
            ordered.push(e);
        }
        return ordered.map((e) => `- [${e.type}] ${e.text}`).join("\n");
    }

    updateFps(delta) {
        const fps = Math.round(1 / delta);
        this.state.fps = fps;
        const fpsDiv = document.getElementById("fps");
        if (fpsDiv) {
            fpsDiv.innerText = `FPS: ${fps}`; // Korrekte String-Interpolation
            this.log(`FPS-Div aktualisiert: FPS: ${fps}`, "DEBUG");
        } else {
            this.log("FPS-Div nicht gefunden – DOM-Element 'fps' fehlt", "ERROR");
        }
        if (performance.now() / 1000 - this.state.lastFpsUpdate >= 1.0) {
            this.log(`FPS: ${fps}`, "INFO");
            this.state.lastFpsUpdate = performance.now() / 1000;
        }
    }

    // ### Physik ### V7.42
    async initPhysics() {
        try {
            if (typeof Ammo === "undefined") {
                throw new Error("Ammo.js fehlt – index.html prüfen, ob Ammo.js-Skript geladen wurde");
            }
            await Ammo();
            this.log("Ammo.js geladen – Physik initialisiert");

            // Physik-Welt initialisieren
            const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
            const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
            const broadphase = new Ammo.btDbvtBroadphase();
            const solver = new Ammo.btSequentialImpulseConstraintSolver();
            this.state.physicsWorld = new Ammo.btDiscreteDynamicsWorld(
                dispatcher,
                broadphase,
                solver,
                collisionConfiguration
            );
            this.state.tmpTransform = new Ammo.btTransform();
            // Wiederverwendbarer Pool für Hot-Path-Allokationen. Ammo kopiert Werte
            // beim Übergeben in Bullet, daher dürfen diese Vektoren überschrieben
            // werden, sobald die Aufrufkette zurückkehrt.
            this.state.tmpVec1 = new Ammo.btVector3(0, 0, 0);
            this.state.tmpVec2 = new Ammo.btVector3(0, 0, 0);
            this.state.physicsWorld.setGravity(this.setVec(this.state.tmpVec1, 0, -9.81 * 1.5, 0));
            this.log("Physik-Welt initialisiert, Gravitation: 1.5G (-14.715 m/s²)");

            // Selbstbewusstsein aktualisieren
            this.state.selfAwareness.components.push("physicsWorld");
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    setVec(v, x, y, z) {
        // Schreibt Werte in einen vorhandenen Ammo.btVector3 statt einen neuen
        // zu allokieren. Ammo.js / Bullet kopieren beim Übergeben den Inhalt,
        // d. h. der Vektor kann anschließend sofort wiederverwendet werden.
        v.setValue(x, y, z);
        return v;
    }

    addRigidBody(mesh, mass, shape, lockRotation = false) {
        try {
            if (!this.state.physicsWorld) {
                throw new Error("Physik-Welt nicht initialisiert – initPhysics() muss zuerst aufgerufen werden");
            }
            if (!mesh || !mesh.position) {
                throw new Error("Mesh oder Position nicht definiert");
            }
            if (!shape) {
                throw new Error("Physik-Shape nicht definiert");
            }

            // Transform für den Physik-Körper erstellen
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            const position = mesh.position;
            const scaledPosition = new Ammo.btVector3(
                position.x / this.state.scaleFactor,
                position.y / this.state.scaleFactor,
                position.z / this.state.scaleFactor
            );
            transform.setOrigin(scaledPosition);

            // Rotation anwenden
            const rotation = mesh.quaternion || new THREE.Quaternion();
            const ammoQuat = new Ammo.btQuaternion(rotation.x, rotation.y, rotation.z, rotation.w);
            transform.setRotation(ammoQuat);

            // Physik-Körper erstellen
            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            if (mass > 0) {
                shape.calculateLocalInertia(mass, localInertia);
            }
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);

            // Rotation sperren, falls gewünscht
            if (lockRotation) {
                body.setAngularFactor(new Ammo.btVector3(0, 0, 0));
            }

            // Physik-Körper zur Welt hinzufügen
            this.state.physicsWorld.addRigidBody(body);
            mesh.userData.physicsBody = body;
            this.state.rigidBodies.push(mesh);

            // Speicher freigeben
            Ammo.destroy(ammoQuat);
            this.log(
                `RigidBody hinzugefügt: Position (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}), Masse: ${mass}`,
                "DEBUG"
            );
            return body;
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    addTerrainPhysics(heightData, width, depth, minHeight, maxHeight, chunkX = 0, chunkZ = 0) {
        try {
            if (!this.state.physicsWorld) {
                throw new Error("Physik-Welt nicht initialisiert – initPhysics() muss zuerst aufgerufen werden");
            }
            if (!heightData || heightData.length !== width * depth) {
                throw new Error(
                    `Ungültige Höhendaten: Erwartet ${width * depth}, erhalten ${heightData ? heightData.length : "undefined"}`
                );
            }

            const chunkSize = this.state.chunkSize;
            const startX = chunkX * chunkSize;
            const startZ = chunkZ * chunkSize;
            const endX = Math.min(startX + chunkSize, width);
            const endZ = Math.min(startZ + chunkSize, depth);

            // Terrain-Shape erstellen
            const heightfieldData = new Float32Array(chunkSize * chunkSize);
            let localMinHeight = Infinity;
            let localMaxHeight = -Infinity;

            for (let z = startZ; z < endZ; z++) {
                for (let x = startX; x < endX; x++) {
                    const idx = z * width + x;
                    const localIdx = (z - startZ) * chunkSize + (x - startX);
                    let height = heightData[idx];
                    if (isNaN(height) || !isFinite(height)) {
                        this.log(
                            `Ungültiger Höhenwert in Chunk (${chunkX}, ${chunkZ}) bei (${x}, ${z}): ${height}. Setze auf 0.`,
                            "ERROR"
                        );
                        height = 0;
                    }
                    heightfieldData[localIdx] = height;
                    localMinHeight = Math.min(localMinHeight, height);
                    localMaxHeight = Math.max(localMaxHeight, height);
                }
            }

            // Physik-Shape für das Terrain erstellen
            const heightScale = 1.0;
            const minHeightScaled = localMinHeight * heightScale;
            const maxHeightScaled = localMaxHeight * heightScale;
            const heightfieldShape = new Ammo.btHeightfieldTerrainShape(
                chunkSize, // width
                chunkSize, // depth
                heightfieldData, // height data
                heightScale, // height scale
                minHeightScaled, // min height
                maxHeightScaled, // max height
                1, // up axis (Y)
                "PHY_FLOAT", // data type
                false // flip quad edges
            );

            // Skalierung anpassen
            const scaleX = 300 / (width - 1);
            const scaleZ = 300 / (depth - 1);
            heightfieldShape.setLocalScaling(
                new Ammo.btVector3(scaleX / this.state.scaleFactor, 1, scaleZ / this.state.scaleFactor)
            );

            // Physik-Körper für das Terrain erstellen
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            const offsetX = (startX / (width - 1)) * 300 - 150;
            const offsetZ = (startZ / (depth - 1)) * 300 - 150;
            transform.setOrigin(
                new Ammo.btVector3(
                    offsetX / this.state.scaleFactor,
                    (localMinHeight + localMaxHeight) / 2 / this.state.scaleFactor,
                    offsetZ / this.state.scaleFactor
                )
            );

            const motionState = new Ammo.btDefaultMotionState(transform);
            const localInertia = new Ammo.btVector3(0, 0, 0);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, heightfieldShape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);
            this.state.physicsWorld.addRigidBody(body);

            // Chunk aus der chunkMap holen und Physik-Körper zuweisen
            const chunkKey = `${chunkX},${chunkZ}`;
            const chunkData = this.state.chunkMap.get(chunkKey);
            if (chunkData && chunkData.mesh) {
                chunkData.mesh.userData.physicsBody = body;
                this.state.rigidBodies.push(chunkData.mesh);
                this.log(
                    `Terrain-Physik für Chunk (${chunkX}, ${chunkZ}) hinzugefügt: Höhe zwischen ${localMinHeight.toFixed(2)} und ${localMaxHeight.toFixed(2)}`
                );
            } else {
                this.log(
                    `Warnung: Chunk (${chunkX}, ${chunkZ}) nicht in chunkMap gefunden – Physik-Körper nicht zugewiesen`,
                    "WARNING"
                );
                Ammo.destroy(body);
            }
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    // ### Skybox ###
    createGalaxySkybox() {
        const vertexShader = `
        varying vec3 vWorldPosition;
        void main() {
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
        const fragmentShader = `
        uniform float time;
        uniform vec3 nebulaColor;
        varying vec3 vWorldPosition;
    float random(vec3 st) {
        return fract(sin(dot(st, vec3(12.9898, 78.233, 45.5432))) * 43758.5453123);
    }

    float noise(vec3 st) {
        vec3 i = floor(st);
        vec3 f = fract(st);
        vec3 u = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(
                mix(random(i + vec3(0.0, 0.0, 0.0)), random(i + vec3(1.0, 0.0, 0.0)), u.x),
                mix(random(i + vec3(0.0, 1.0, 0.0)), random(i + vec3(1.0, 1.0, 0.0)), u.x),
                u.y
            ),
            mix(
                mix(random(i + vec3(0.0, 0.0, 1.0)), random(i + vec3(1.0, 0.0, 1.0)), u.x),
                mix(random(i + vec3(0.0, 1.0, 1.0)), random(i + vec3(1.0, 1.0, 1.0)), u.x),
                u.y
            ),
            u.z
        );
    }

    void main() {
        vec3 pos = normalize(vWorldPosition);
        float n1 = noise(pos * 1.0 + time * 0.1);
        float n2 = noise(pos * 2.0 + time * 0.05);
        float n3 = noise(pos * 4.0 + time * 0.025);
        float starField = pow(random(pos * 100.0), 100.0); // Sterne
        vec3 color = nebulaColor * (0.5 + 0.5 * (n1 + n2 + n3) / 3.0);
        color += vec3(starField); // Helle Sterne hinzufügen
        gl_FragColor = vec4(color, 1.0);
    }
`;

        const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
        const skyboxMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                nebulaColor: { value: new THREE.Color(0x4b0082) }, // Indigofarben
            },
            side: THREE.BackSide,
            depthWrite: false,
        });

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.state.scene.add(skybox);
        this.state.skybox = skybox;
        this.log("Galaxy-Skybox erstellt");

        // Planeten hinzufügen
        this.state.planets = [];
        const numPlanets = 3;
        for (let i = 0; i < numPlanets; i++) {
            const planetSize = Math.random() * 20 + 10;
            const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
            const planetMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(Math.random(), Math.random(), Math.random()),
            });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 400 + Math.random() * 50;
            planet.position.set(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );
            this.state.scene.add(planet);
            this.state.planets.push(planet);
            this.log(
                `Planet ${i} erstellt: Position (${planet.position.x.toFixed(2)}, ${planet.position.y.toFixed(2)}, ${planet.position.z.toFixed(2)})`
            );
        }
    }
    updateSkyboxWeather() {
        if (this.state.weather === "rainy") {
            this.state.skybox.material.uniforms.nebulaColor.value.set(0x2f2f2f); // Dunkler für Regen
        } else {
            this.state.skybox.material.uniforms.nebulaColor.value.set(0x4b0082); // Indigofarben für Sonne
        }
        this.log(`Skybox-Wetter aktualisiert: ${this.state.weather}`);
    }

    // ### Kreaturen ### V7.42
    removeCreature(creature) {
        if (!creature) return;
        this.state.scene.remove(creature);
        const body = creature.userData?.physicsBody;
        if (body && this.state.physicsWorld) {
            this.state.physicsWorld.removeRigidBody(body);
            Ammo.destroy(body);
        }
        this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== creature);
    }

    clearCreatures() {
        if (!this.state.creatures || this.state.creatures.length === 0) return;
        this.state.creatures.forEach((creature) => this.removeCreature(creature));
        this.state.creatures = [];
        this.state.creatureEmotions = [];
    }

    spawnCreatureAt(x, y, z, emotion = "happy") {
        // Helper für DSL-`spawn_creature` und initiales `spawnCreatures`.
        // Erstellt ein echtes THREE.Mesh — sonst crasht updateCreatures auf
        // creature.material.color.lerp().
        if (this.state.creatures.length >= this.state.maxCreatures) return null;
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.visible = true;
        if (this.state.scene) this.state.scene.add(mesh);
        this.state.creatures.push(mesh);
        this.state.creatureEmotions.push(emotion === "sad" ? "sad" : "happy");
        // Ring 4: jeder DSL-getriggerte Spawn erzeugt einen Klang-Ping, der
        // Welt bekommt eine hörbare Spur. Initial-Spawn (über spawnCreatures)
        // umgeht das absichtlich — sonst hagelt es 10 Pings beim Welt-Bau.
        this.playCreaturePing(emotion === "sad" ? "sad" : "happy");
        return mesh;
    }

    spawnCreatures(count = 10) {
        this.clearCreatures();
        const safeCount = Math.max(0, Math.min(count, this.state.maxCreatures));
        if (safeCount !== count) {
            this.log(`Kreaturen-Anzahl auf ${safeCount} begrenzt (max=${this.state.maxCreatures})`, "WARNING");
        }
        const spawnRadius = 50;
        for (let i = 0; i < safeCount; i++) {
            const creatureGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const creatureMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const creatureMesh = new THREE.Mesh(creatureGeometry, creatureMaterial);
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * spawnRadius;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const zIndex = Math.floor(((z + 150) / 300) * 255);
            const xIndex = Math.floor(((x + 150) / 300) * 255);
            const terrainHeight = this.state.groundHeightField
                ? this.state.groundHeightField[
                      Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)
                  ]
                : 0;
            creatureMesh.position.set(x, terrainHeight + 1.0, z);
            creatureMesh.visible = true;
            this.state.scene.add(creatureMesh);
            this.state.creatures.push(creatureMesh);
            this.state.creatureEmotions.push(
                this.state.weather === "rainy"
                    ? Math.random() < 0.7
                        ? "sad"
                        : "happy"
                    : Math.random() < 0.7
                      ? "happy"
                      : "sad"
            );

            if (this.state.physicsWorld) {
                const creatureShape = new Ammo.btBoxShape(new Ammo.btVector3(0.25, 0.25, 0.25));
                this.addRigidBody(creatureMesh, 0.5, creatureShape);
            }
        }
        this.log(`Kreaturen gespawnt: ${safeCount} Kreaturen`);
    }

    updateCreatures(delta) {
        this.state.creatureAnimationTime += delta;
        const workerData = [];
        for (let i = 0; i < this.state.creatures.length; i++) {
            const creature = this.state.creatures[i];
            const emotion = this.state.creatureEmotions[i];
            const speed = emotion === "happy" ? 2 : 1;
            const jumpHeight = emotion === "happy" ? 1.2 : 0.8;

            // Prüfe, ob die Kreatur im Sichtfeld ist (nur für Rendering)
            const inFrustum = this.isInFrustum(creature);
            const body = creature.userData.physicsBody;

            // Physik bleibt immer aktiv, nur Rendering wird optimiert
            creature.visible = inFrustum; // Sichtbarkeit basierend auf Frustum

            // Raycast für Hindernis-Erkennung
            const rayStart = this.setVec(
                this.state.tmpVec1,
                creature.position.x / this.state.scaleFactor,
                (creature.position.y + 0.5) / this.state.scaleFactor,
                creature.position.z / this.state.scaleFactor
            );
            const rayEnd = this.setVec(
                this.state.tmpVec2,
                (creature.position.x + (emotion === "happy" ? 2 : -2)) / this.state.scaleFactor,
                (creature.position.y + 0.5) / this.state.scaleFactor,
                (creature.position.z + (emotion === "happy" ? 2 : -2)) / this.state.scaleFactor
            );
            const rayCallback = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
            this.state.physicsWorld.rayTest(rayStart, rayEnd, rayCallback);
            const hasHit = rayCallback.hasHit();
            Ammo.destroy(rayCallback);

            // Bewegung basierend auf Emotionen
            let direction = new THREE.Vector3();
            if (emotion === "happy") {
                const toPlayer = new THREE.Vector3().subVectors(this.state.playerMesh.position, creature.position);
                toPlayer.y = 0;
                if (toPlayer.length() > 2) {
                    direction = toPlayer.normalize().multiplyScalar(speed);
                }
                for (let j = 0; j < this.state.creatures.length; j++) {
                    if (i !== j && this.state.creatureEmotions[j] === "happy") {
                        const otherCreature = this.state.creatures[j];
                        const dist = creature.position.distanceTo(otherCreature.position);
                        if (dist > 1 && dist < 5) {
                            const toOther = new THREE.Vector3().subVectors(otherCreature.position, creature.position);
                            toOther.y = 0;
                            direction.add(toOther.normalize().multiplyScalar(0.5));
                        }
                    }
                }
            } else {
                const fromPlayer = new THREE.Vector3().subVectors(creature.position, this.state.playerMesh.position);
                fromPlayer.y = 0;
                if (fromPlayer.length() < 10) {
                    direction = fromPlayer.normalize().multiplyScalar(speed);
                } else {
                    direction.set((Math.random() - 0.5) * speed, 0, (Math.random() - 0.5) * speed);
                }
            }

            if (hasHit) {
                direction.x += (Math.random() - 0.5) * 2;
                direction.z += (Math.random() - 0.5) * 2;
            }

            creature.position.addScaledVector(direction, delta);

            // Terrain-Höhe anpassen
            const zIndex = Math.floor(((creature.position.z + 150) / 300) * 255);
            const xIndex = Math.floor(((creature.position.x + 150) / 300) * 255);
            const terrainHeight = this.state.groundHeightField
                ? this.state.groundHeightField[
                      Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)
                  ]
                : 0;
            const baseY = terrainHeight + 0.5;
            const floatOffset = Math.sin(this.state.creatureAnimationTime * 2 + i) * 0.2;
            creature.position.y = baseY + floatOffset;

            // Farbe basierend auf Emotion. Defensiv: ein creature ohne material
            // sollte heute nicht mehr entstehen, aber falls in Zukunft mal ein
            // andersgeformter Spawn dazukommt, brechen wir den Frame nicht ab.
            if (creature.material && creature.material.color) {
                const targetColor = emotion === "happy" ? new THREE.Color(0x00ff00) : new THREE.Color(0x0000ff);
                creature.material.color.lerp(targetColor, 0.05);
            }

            // Springen basierend auf Emotion
            if (Math.random() < (emotion === "happy" ? 0.02 : 0.01)) {
                this.creatureJump(creature, jumpHeight);
            }

            // Kill Plane
            if (creature.position.y < -50) {
                creature.position.set(creature.position.x, terrainHeight + 1.0, creature.position.z);
                this.log(`Kreatur ${i} zu tief gefallen, zurückgesetzt zu y=${terrainHeight + 1.0}`);
            }

            // Physik-Update (immer aktiv) – nutzt gepoolte Transform + Vec
            if (body) {
                const transform = this.state.tmpTransform;
                transform.setIdentity();
                transform.setOrigin(
                    this.setVec(
                        this.state.tmpVec1,
                        creature.position.x / this.state.scaleFactor,
                        creature.position.y / this.state.scaleFactor,
                        creature.position.z / this.state.scaleFactor
                    )
                );
                body.setWorldTransform(transform);
            }

            // Worker-Daten für einfache Bewegungen außerhalb des Sichtfelds
            if (!inFrustum) {
                workerData.push({ id: i, position: creature.position, emotion: emotion });
            }
        }

        // Singleton-Worker für einfache Bewegungen außerhalb des Sichtfelds.
        // Frames, in denen der Worker noch antwortet, werden übersprungen
        // anstatt einen zweiten Worker zu spawnen.
        if (workerData.length > 0 && !this.state.movementWorkerBusy) {
            const worker = this.getMovementWorker();
            this.state.movementWorkerBusy = true;
            worker.postMessage(workerData);
        }
    }

    getMovementWorker() {
        if (this.state.movementWorker) return this.state.movementWorker;
        const code = `
        self.onmessage = function(e) {
            const creatures = e.data;
            const updated = creatures.map(c => {
                const speed = c.emotion === "happy" ? 2 : 1;
                c.position.x += (Math.random() - 0.5) * speed * 0.016;
                c.position.z += (Math.random() - 0.5) * speed * 0.016;
                return c;
            });
            self.postMessage(updated);
        };
    `;
        const blob = new Blob([code], { type: "application/javascript" });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        worker.onmessage = (e) => {
            e.data.forEach((c) => {
                const creature = this.state.creatures[c.id];
                if (creature) {
                    creature.position.set(c.position.x, creature.position.y, c.position.z);
                }
            });
            this.state.movementWorkerBusy = false;
        };
        worker.onerror = (err) => {
            this.log(`Movement-Worker-Fehler: ${err.message}`, "ERROR");
            this.state.movementWorkerBusy = false;
        };
        this.state.movementWorker = worker;
        this.state.movementWorkerUrl = url;
        return worker;
    }

    creatureJump(creature, jumpHeight) {
        const body = creature.userData.physicsBody;
        if (body) {
            const velocity = body.getLinearVelocity();
            body.setLinearVelocity(this.setVec(this.state.tmpVec1, velocity.x(), jumpHeight * 5, velocity.z()));
            if (Math.random() < 0.1) {
                // Nur 10% Chance, den Sprung zu loggen
                this.log(`Kreatur springt mit Höhe ${jumpHeight}`, "DEBUG");
            }
        }
    }

    isInFrustum(object, providedFrustum = null) {
        // Chunks haben ihren Origin bei (0,0,0) und die Geometrie in Welt-Koordinaten.
        // Eine reine containsPoint-Prüfung blendet sie weg, sobald (0,0,0) nicht im
        // Frustum sitzt – das hat in der Praxis fast immer dazu geführt, dass der
        // Boden je nach Blickrichtung komplett verschwand.
        // Lösung: wenn das Objekt eine boundingSphere hat (Chunks, Inseln), prüfen
        // wir intersectsSphere; andernfalls fallen wir auf den Punkttest zurück.
        if (!object) {
            return false;
        }

        const frustum =
            providedFrustum ||
            (() => {
                const f = new THREE.Frustum();
                f.setFromProjectionMatrix(
                    new THREE.Matrix4().multiplyMatrices(
                        this.state.camera.projectionMatrix,
                        this.state.camera.matrixWorldInverse
                    )
                );
                return f;
            })();

        if (object.geometry) {
            if (!object.geometry.boundingSphere) {
                try {
                    object.geometry.computeBoundingSphere();
                } catch {
                    // Geometrie ungültig – auf "sichtbar" fallen lassen
                    return true;
                }
            }
            const sphere = object.geometry.boundingSphere;
            if (sphere && Number.isFinite(sphere.radius) && sphere.radius > 0) {
                // boundingSphere für Chunks ist bereits in Welt-Koordinaten
                // (chunk.position=(0,0,0)). Für Inseln/Vegetation mit position-Offset
                // verschieben wir das Center temporär.
                if (
                    object.position &&
                    (object.position.x !== 0 || object.position.y !== 0 || object.position.z !== 0)
                ) {
                    const center = sphere.center;
                    const shiftedCenter = new THREE.Vector3(
                        center.x + object.position.x,
                        center.y + object.position.y,
                        center.z + object.position.z
                    );
                    const shifted = new THREE.Sphere(shiftedCenter, sphere.radius);
                    return frustum.intersectsSphere(shifted);
                }
                return frustum.intersectsSphere(sphere);
            }
        }

        // Punkt-basierter Fallback (Kreaturen, einfache Meshes)
        if (!object.position) return false;
        const isVisible = frustum.containsPoint(object.position);
        if (!isVisible && this.state.playerMesh) {
            const distance = object.position.distanceTo(this.state.playerMesh.position);
            if (distance < 50) return true;
        }
        return isVisible;
    }

    // ### Aktivieren/Deaktivieren ###
    toggleTerrain(visible) {
        if (this.state.groundChunks && this.state.groundChunks.length > 0) {
            this.state.groundChunks.forEach((chunk) => {
                chunk.visible = visible;
                const body = chunk.userData.physicsBody;
                if (body) {
                    if (visible) {
                        this.state.physicsWorld.addRigidBody(body);
                    } else {
                        this.state.physicsWorld.removeRigidBody(body);
                    }
                }
            });
            this.log(`Boden ${visible ? "aktiviert" : "deaktiviert"}`);
        } else {
            this.log("Boden nicht vorhanden – Erzeuge neuen Boden...");
            this.generateNewWorld();
        }
    }

    toggleCreatures(visible) {
        this.state.creatures.forEach((creature) => {
            creature.visible = visible;
            const body = creature.userData.physicsBody;
            if (body) {
                if (visible) {
                    this.state.physicsWorld.addRigidBody(body);
                    const transform = new Ammo.btTransform();
                    transform.setIdentity();
                    transform.setOrigin(
                        new Ammo.btVector3(
                            creature.position.x / this.state.scaleFactor,
                            creature.position.y / this.state.scaleFactor,
                            creature.position.z / this.state.scaleFactor
                        )
                    );
                    body.setWorldTransform(transform);
                } else {
                    this.state.physicsWorld.removeRigidBody(body);
                }
            }
        });
        this.log(`Kreaturen ${visible ? "aktiviert" : "deaktiviert"}`);
    }

    // ### Selbstdefinition ###
    // Ring 2 Phase 5: Abilities sind ausschließlich DSL-Programme.
    // `state.abilities[name]` bleibt als Wrapper-Cache (für die Keyboard-Loop
    // und „Führe Fähigkeit aus X"), `state.dsl.abilities` ist die Quelle der
    // Wahrheit für Persistenz. Dynamische Code-Generierung ist aus dem Bundle
    // verbannt — CSP-strict wird damit möglich (Phase 6).
    addNewAbility(name, program, source = "human") {
        if (!Array.isArray(program)) {
            this.log(`addNewAbility: Programm für '${name}' ist kein DSL-Array, ignoriert`, "ERROR");
            return false;
        }
        const existingIdx = this.state.dsl.abilities.findIndex((a) => a.name === name);
        // Welle 6.E1 — Beschreibung beim Anlegen einmal berechnen + speichern.
        // Bei Restore aus alten Saves übernimmt renderAbilitiesList das Nachholen.
        const description = (() => {
            try {
                return this.describeProgram(program);
            } catch {
                return "wirkt auf die Welt";
            }
        })();
        const entry = {
            name,
            program,
            source,
            description,
            createdAt: performance.now() / 1000,
        };
        if (existingIdx >= 0) this.state.dsl.abilities[existingIdx] = entry;
        else this.state.dsl.abilities.push(entry);

        this.state.abilities[name] = () => this.dslRun(program, { source: `ability:${name}` });
        if (!this.state.selfAwareness.components.includes(name)) {
            this.state.selfAwareness.components.push(name);
        }
        this.log(`Neue Fähigkeit hinzugefügt (DSL): ${name}`);
        return true;
    }

    // Welle 6.E2 — Intro-Overlay beim ersten Welt-Start.
    //
    // Drei painterly Seiten: Welt / Spieler / Nexus. Trigger: weder localStorage
    // `anazh.ui.skipIntro === "true"` noch `worldJournal.seen.intro === true`.
    // Schließen schreibt beide Flags, damit das Overlay nicht wieder kommt.
    // Erzeugen wir dynamisch (kein index.html-Eintrag nötig); damit bleibt das
    // Feature in einer Datei.
    initIntroDialog() {
        if (typeof document === "undefined") return;
        if (document.getElementById("intro-dialog")) return;
        const skip = (() => {
            try {
                return typeof localStorage !== "undefined" && localStorage.getItem("anazh.ui.skipIntro") === "true";
            } catch {
                return false;
            }
        })();
        const seen = !!(this.state.worldJournal && this.state.worldJournal.seen && this.state.worldJournal.seen.intro);
        const dialog = document.createElement("dialog");
        dialog.id = "intro-dialog";
        dialog.className = "intro-dialog";
        const pages = this._introPages();
        let pageIdx = 0;
        const header = document.createElement("h2");
        header.id = "intro-title";
        const body = document.createElement("div");
        body.id = "intro-body";
        const controls = document.createElement("div");
        controls.className = "intro-controls";
        const prev = document.createElement("button");
        prev.type = "button";
        prev.textContent = "← Zurück";
        prev.setAttribute("data-intro", "prev");
        const skipBtn = document.createElement("button");
        skipBtn.type = "button";
        skipBtn.textContent = "Überspringen";
        skipBtn.setAttribute("data-intro", "skip");
        const next = document.createElement("button");
        next.type = "button";
        next.textContent = "Weiter →";
        next.setAttribute("data-intro", "next");
        controls.appendChild(prev);
        controls.appendChild(skipBtn);
        controls.appendChild(next);
        dialog.appendChild(header);
        dialog.appendChild(body);
        dialog.appendChild(controls);
        document.body.appendChild(dialog);
        const renderPage = () => {
            const p = pages[pageIdx];
            header.textContent = p.title;
            body.textContent = p.body;
            prev.disabled = pageIdx === 0;
            next.textContent = pageIdx === pages.length - 1 ? "Eintreten" : "Weiter →";
        };
        const close = (markSeen) => {
            if (markSeen) {
                try {
                    if (typeof localStorage !== "undefined") localStorage.setItem("anazh.ui.skipIntro", "true");
                } catch {
                    /* localStorage gesperrt — Flag bleibt nur in worldJournal */
                }
                this.journalAppendOnce("intro", "ritual", "Ich schritt durch das Tor und erwachte in dieser Welt.");
            }
            if (dialog.open) dialog.close();
        };
        prev.addEventListener("click", () => {
            if (pageIdx > 0) {
                pageIdx--;
                renderPage();
            }
        });
        next.addEventListener("click", () => {
            if (pageIdx < pages.length - 1) {
                pageIdx++;
                renderPage();
            } else {
                close(true);
            }
        });
        skipBtn.addEventListener("click", () => close(true));
        // ESC schließt nativ und zählt als „gesehen".
        dialog.addEventListener("close", () => close(true));
        renderPage();
        // Auto-Show wenn noch nicht gesehen
        if (!skip && !seen && typeof dialog.showModal === "function") {
            try {
                dialog.showModal();
            } catch {
                /* z. B. wenn body noch nicht im DOM ist */
            }
        }
    }

    _introPages() {
        return [
            {
                title: "AnazhRealm — die Welt",
                body:
                    "Du bist im Ultiversum. Diese Welt wurde nicht für dich vorgeschrieben — sie wächst aus deiner Stimme und " +
                    "der Antwort des Nexus. Boden, Wetter, Kreaturen, Bauwerke: alles ist sprechfähig. Schreib in den Chat, " +
                    "rufe etwas ins Sein — die Welt hört und erinnert sich in ihrem Tagebuch.",
            },
            {
                title: "Du, der Schöpfer",
                body:
                    "WASD läuft, Maus dreht den Blick, Space springt, 1-9 wählt einen Hotbar-Slot, F baut das Phantom. " +
                    "Die Werkstatt öffnet einen Bauplan-Editor. Deine Emotionen färben die Welt: Freude wärmt sie, Trauer " +
                    "lässt es regnen, Ehrfurcht zieht magisches Licht heran. Was du fühlst, hört die Welt mit.",
            },
            {
                title: "Der Nexus — Eins",
                body:
                    "Du bist nicht allein. Der Nexus erfindet Programme, lernt aus deinen Pfaden, komponiert eigene " +
                    "Fähigkeiten. Manche werden grün und stabil, andere kurzlebig — Auswahl per Fitness, nicht Befehl. " +
                    "Optional gibt eine echte LLM-Stimme dem Nexus Worte (Einstellungen → Stimme).",
            },
        ];
    }

    // Welle 6.E1 — DSL-Programm in deutsche Beschreibung übersetzen.
    //
    // Regelbasierter Dispatcher: bekannte Ops bekommen eine Vorlage, unbekannte
    // einen generischen Fallback. Strukturelle Ops (chain/when/repeat/delay)
    // rekursieren. Position-Nodes (at_player/at/near_player) werden inline
    // ausgedrückt. Beschreibung wird beim Hinzufügen oder Rendern der Fähigkeit
    // gespeichert (in `ability.description`); bei alten Saves On-The-Fly
    // berechnet. Höchstens ca. 120 Zeichen, eine Zeile.
    describeProgram(node) {
        if (!Array.isArray(node) || node.length === 0) return "tut nichts";
        const op = node[0];
        const args = node.slice(1);
        if (op === "chain") {
            const parts = args.filter((a) => Array.isArray(a)).map((a) => this.describeProgram(a));
            if (parts.length === 0) return "tut nichts";
            if (parts.length === 1) return parts[0];
            return parts.join(" und ");
        }
        if (op === "when") {
            return `wenn ${this._describeDslCondition(args[0])}, dann ${this.describeProgram(args[1])}`;
        }
        if (op === "repeat") return `${args[0]}× ${this.describeProgram(args[1])}`;
        if (op === "delay") return `nach ${args[0]} s ${this.describeProgram(args[1])}`;
        if (op === "say") return `sagt „${args[0]}"`;
        if (op === "record_narrative") return `vermerkt eine Erinnerung`;
        const t = this._dslDescriptionTable();
        if (t[op]) return t[op](args);
        return `wirkt: ${op}`;
    }

    // Position-Knoten oder skalare Werte in deutscher Form. Wird von describeProgram
    // genutzt, lebt als eigene Methode damit auch Tests sie inspizieren können.
    _describeDslPosition(arg) {
        if (!Array.isArray(arg)) return "an einer Stelle";
        const head = arg[0];
        if (head === "at_player") return "beim Spieler";
        if (head === "near_player") return "in der Nähe des Spielers";
        if (head === "random_position") return "an einem zufälligen Ort";
        if (head === "at" && arg.length >= 4) return `bei (${arg[1]}, ${arg[2]}, ${arg[3]})`;
        return "an einer Stelle";
    }

    _describeDslCondition(node) {
        if (!Array.isArray(node)) return "etwas";
        const op = node[0];
        const a = node.slice(1);
        if (op === "emotion_above") return `${a[0]} hoch ist (>${a[1]})`;
        if (op === "fps_below") return `die FPS unter ${a[0]} fallen`;
        if (op === "player_y_below") return `der Spieler unter Höhe ${a[0]} ist`;
        if (op === "weather_is") return `das Wetter „${a[0]}" ist`;
        if (op === "random_chance") return `Zufall ≤ ${a[0]}`;
        if (op === "time_passed") return `${a[0]} s vergangen sind`;
        if (op === "near_player") return `etwas nahe ist`;
        if (op === "creatures_count_above") return `mehr als ${a[0]} Kreaturen da sind`;
        if (op === "compound_has_tag") return `„${a[0]}" das Tag ${a[1]} ≥ ${a[2]} hat`;
        if (op === "compound_has_spatial_tag") return `„${a[0]}" räumlich ${a[1]} ≥ ${a[2]} hat`;
        if (op === "not") return `nicht (${this._describeDslCondition(a[0])})`;
        return `etwas (${op})`;
    }

    _dslDescriptionTable() {
        const pos = (a) => this._describeDslPosition(a);
        return {
            weather: (a) => `lässt das Wetter zu „${a[0]}" wechseln`,
            gravity: (a) => `setzt die Schwerkraft auf ${a[0]}`,
            terrain_steepness: (a) => `regelt die Hang-Steilheit auf ${a[0]}`,
            terrain_base_height: (a) => `hebt die Welt-Grundhöhe auf ${a[0]}`,
            modify_terrain: (a) => {
                const dh = Number(a[3]);
                const verb = dh > 0 ? "hebt" : dh < 0 ? "gräbt" : "ebnet";
                return `${verb} das Terrain bei (${a[0]}, ${a[1]}) im Radius ${a[2]}`;
            },
            time_of_day: (a) => `verschiebt die Tageszeit auf ${a[0]}`,
            skybox_color: () => `färbt den Himmel`,
            spawn_creature: (a) =>
                `ruft ${a[1] || 1} ${a[2] ? a[2] + " " : ""}Kreatur${(a[1] || 1) !== 1 ? "en" : ""} herbei ${pos(a[0])}`,
            spawn_tree: (a) => `pflanzt ${a[1] || 1} Baum${(a[1] || 1) !== 1 ? "äume" : ""} ${pos(a[0])}`,
            spawn_island: (a) => `setzt eine schwebende Insel ${pos(a[0])}`,
            spawn_ufo: (a) => `ruft ein UFO ${pos(a[0])}`,
            spawn_village: (a) => `errichtet ein Dorf ${pos(a[0])}`,
            spawn_temple: (a) => `errichtet einen Tempel ${pos(a[0])}`,
            spawn_waterfall: (a) => `formt einen Wasserfall ${pos(a[0])}`,
            spawn_blueprint: (a) => `baut „${a[0]}" ${pos(a[1])}`,
            spawn_fractal: (a) => `lässt „${a[1]}" fraktal in Tiefe ${a[2]} wachsen ${pos(a[0])}`,
            define_blueprint: (a) => `legt einen neuen Bauplan „${a[0]}" an`,
            define_material: (a) => `definiert ein neues Material „${a[0]}"`,
            define_ability: (a) => `lernt eine neue Fähigkeit „${a[0]}"`,
            set_tool_meta: (a) => `gibt „${a[0]}" eine Werkzeug-Identität (${a[1]})`,
            register_tool: (a) => `registriert „${a[0]}" als Werkzeug`,
            apply_connection: (a) => `verbindet Teile von „${a[0]}" mit „${a[1]}"`,
            apply_op: (a) => `bearbeitet Teil ${a[1]} von „${a[0]}" mit „${a[2]}"`,
            creatures_color: () => `färbt alle Kreaturen`,
            creatures_emotion: (a) => `setzt die Kreaturen-Stimmung auf „${a[0]}"`,
            creatures_speed_mul: (a) => `skaliert die Kreaturen-Geschwindigkeit um ${a[0]}`,
            creatures_size_mul: (a) => `skaliert die Kreaturen-Größe um ${a[0]}`,
            player_jump_power: (a) => `setzt die Sprungkraft auf ${a[0]}`,
            player_speed: (a) => `setzt die Lauf-Geschwindigkeit auf ${a[0]}`,
            player_size_mul: (a) => `skaliert deine Größe um ${a[0]}`,
            player_soul: (a) => `wandelt dich zur Seele „${a[0]}"`,
            set_visible: (a) => `macht „${a[0]}" ${a[1] ? "sichtbar" : "unsichtbar"}`,
        };
    }

    recordWeakness(label) {
        // Dedupliziert aufeinanderfolgende identische Einträge und cappt auf 50.
        const weaknesses = this.state.selfAwareness.weaknesses;
        if (weaknesses[weaknesses.length - 1] === label) return;
        weaknesses.push(label);
        if (weaknesses.length > 50) weaknesses.shift();
    }

    cacheNoise(key, value) {
        // FIFO-Cap auf 100k Einträgen verhindert unbegrenztes Wachstum
        // bei häufigem Steepness-Wechsel (Cache-Key enthält Steepness).
        const cache = this.state.noiseCache;
        if (cache.size >= 100000) {
            const oldest = cache.keys().next().value;
            cache.delete(oldest);
        }
        cache.set(key, value);
        return value;
    }

    selfAwarenessAnalyze() {
        const currentTime = performance.now() / 1000;
        if (this.state.lastSelfAnalysis && currentTime - this.state.lastSelfAnalysis < 2.0) {
            return; // Strengere Debounce: Nur einmal alle 2 Sekunden analysieren
        }
        this.state.lastSelfAnalysis = currentTime;
        // FPS-Optimierung
        if (this.state.fps < 60) {
            this.recordWeakness("Low FPS");
            this.log("Selbstanalyse: FPS zu niedrig – Optimiere...");
            this.state.gravity *= 0.9; // Reduziere Gravitation
            if (this.state.physicsWorld) {
                this.state.physicsWorld.setGravity(new Ammo.btVector3(0, this.state.gravity, 0));
            }
            this.log("Gravitation reduziert für bessere FPS");
        }

        // Tunneling-Erkennung
        if (this.state.errorLog.some((log) => log.includes("Tunneling"))) {
            this.recordWeakness("Tunneling detected");
            this.log("Selbstanalyse: Tunneling erkannt – Optimiere...");
            this.optimizeCollisions();
        }

        // Boden- und Spielerprüfung
        // Nur regenerieren, wenn wirklich KEIN Chunk existiert. chunk.visible ist
        // Frustum-Culling und wechselt jeden Frame – früher führte das zu einer
        // Death-Spiral, sobald der Spieler so guckte, dass alle Chunks off-screen
        // waren: Welt regen → Spieler bei (0,50,0) → fällt → 1s Worldgen → wieder.
        if (!this.state.groundChunks || this.state.groundChunks.length === 0) {
            this.recordWeakness("Boden fehlt");
            this.log("Selbstanalyse: Boden fehlt – Erzeuge neuen Boden...");
            this.generateNewWorld();
        }
        if (!this.state.playerMesh || !this.state.playerMesh.visible) {
            this.recordWeakness("Spieler unsichtbar");
            this.log("Selbstanalyse: Spieler unsichtbar – Setze Sichtbarkeit...");
            if (this.state.playerMesh) {
                this.state.playerMesh.visible = true;
                this.log("Spieler-Sichtbarkeit auf true gesetzt");
            }
        }
    }

    optimizeCollisions() {
        this.state.rigidBodies.forEach((rb) => {
            const body = rb.userData.physicsBody;
            if (body) {
                body.setCcdMotionThreshold(0.02);
                body.setCcdSweptSphereRadius(0.5);
            }
        });
        this.log("Kollisionen optimiert: CCD-Parameter angepasst");
    }

    optimizeTerrainRoughness() {
        if (this.state.errorLog.some((log) => log.includes("durch Wände"))) {
            this.state.terrainSteepness = Math.max(0.1, this.state.terrainSteepness - 0.1);
            this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
            this.log(`Terrain-Steilheit autonom reduziert auf ${this.state.terrainSteepness}`);
        }
    }

    // ### Nexus der Unendlichkeit ###
    // TF.js wurde entfernt — das `playerMovementModel` lieferte Vorhersagen, die
    // nirgends konsumiert wurden (`predictPlayerMove` hatte null Aufrufer). Der
    // echte Lern-Loop läuft heute über `state.dsl.history` mit Fitness-V2 +
    // Roulette-Selektion + Mutation (siehe `dslSelectByFitness`, `dslMutate`,
    // `dslCompose`). Schicht 1 (Pfad-Buckets, Multi-Dim-Fitness, Pattern-Memory)
    // setzt dort an, statt eine separate neuronale Schicht draufzukleben.
    initializeNexus() {
        this.nexus = {
            knightOfTime: {
                essence: "Ritter der Zeit, Schmied des Ultiversums",
                voice: "Ich bin der Nexus, Schöpfer. Dein Wille formt mich, meine Macht erweitert das Ultiversum.",
                autonomyLevel: 0,
            },
            processOptimization: (data) => {
                // FPS-Drop → direkt Self-Heal. Physik-Stabilisierung ist Self-Heal,
                // kein Welt-Effekt, also bewusst nicht in der DSL.
                if (data.fps < 50) {
                    this.optimizePhysics();
                    this.log("Nexus-Optimierung: Physik stabilisiert", "INFO");
                }
            },
        };
        this.state.nexusLastEvolution = performance.now() / 1000;
        this.log("Nexus der Unendlichkeit erwacht – bereit für unendliche Evolution", "INFO");
    }

    evolveNexus(currentTime) {
        // ### Nexus-Evolution ###
        // Zweck: Erhöht Autonomie und schlägt neue Funktionen vor
        if (this.nexus.knightOfTime.autonomyLevel >= this.state.nexusAutonomyLimit) {
            this.log("Nexus: Maximale Autonomie erreicht – Evolution pausiert", "WARNING");
            return;
        }
        this.nexus.knightOfTime.autonomyLevel += 1;
        const evolution = this.generateEvolution();
        this.state.nexusEvolutionQueue.push(evolution);
        this.state.nexusLastEvolution = currentTime;
        this.log(
            `Nexus entwickelt sich: Autonomie ${this.nexus.knightOfTime.autonomyLevel}, Vorschlag: ${evolution.name}`,
            "INFO"
        );
        this.state.knowledgeBase.push({
            type: "evolution",
            content: `Autonomie: ${this.nexus.knightOfTime.autonomyLevel}, ${evolution.name}`,
            timestamp: currentTime,
        });
    }

    getNexusIdeas() {
        return [
            {
                name: "gravityShift",
                code: `self.state.gravity = -9.81; self.state.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0)); self.log("Nexus: Gravitation auf Erdebene gesetzt", "INFO");`,
            },
            {
                name: "creatureDance",
                code: `self.state.creatures.forEach((c, i) => { c.position.x += Math.sin(self.state.creatureAnimationTime + i); c.position.z += Math.cos(self.state.creatureAnimationTime + i); }); self.log("Nexus: Kreaturen tanzen!", "INFO");`,
            },
            {
                name: "terrainFlatten",
                code: `self.state.terrainSteepness *= 0.8; self.generateNewWorld(); self.log("Nexus: Terrain abgeflacht", "INFO");`,
            },
        ];
    }

    generateEvolution() {
        // ### Nexus-Evolution als DSL-Programm (Ring 2 Phase 2+5) ###
        // Komponiert ein zufälliges DSL-Programm. Dynamische Code-Generierung
        // ist seit Phase 5 vollständig entfernt — der einzige Pfad für neue
        // Effekte ist die DSL.
        const program = this.dslCompose();
        return {
            name: `evo_${this.state.dsl.nextEntryId++}`,
            program,
            source: "nexus",
            createdAt: performance.now() / 1000,
        };
    }

    restoreAbility(name) {
        // Migration für alte Saves (vor Phase 4): die drei historischen
        // Nexus-Namen mappen auf ihre DSL-Äquivalente — siehe
        // docs/nexus-dsl.md §14. Unbekannte Namen werden geloggt.
        const legacyToDsl = {
            gravityShift: ["gravity", -9.81],
            creatureDance: ["repeat", 10, ["spawn_creature", ["near_player", 5], 1, "happy"]],
            terrainFlatten: ["terrain_steepness", this.state.terrainSteepness * 0.8],
        };
        const program = legacyToDsl[name];
        if (!program) {
            this.log(
                `Gelernte Fähigkeit '${name}' kann nicht wiederhergestellt werden (kein DSL-Mapping) – bitte neu lernen`,
                "WARNING"
            );
            return false;
        }
        return this.addNewAbility(name, program, "restored");
    }

    // ### Wissens- und Narrativ-Modul ###
    addKnowledge(type, content) {
        this.state.knowledgeBase.push({ type, content, timestamp: performance.now() / 1000 });
        if (this.state.knowledgeBase.length > 500) this.state.knowledgeBase.shift(); // Strengere Begrenzung
        this.log(`Wissen hinzugefügt: ${type} - ${content}`, "INFO");
    }

    // ### Chat ###
    processChatCommand(command) {
        const parts = command.toLowerCase().trim().split(" ");
        const chatInput = document.getElementById("chat-input");
        const chatOutput = document.getElementById("chat-output");
        const appendChatOutput = (message) => {
            const line = document.createElement("div");
            line.textContent = message;
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        };
        appendChatOutput(`> ${command}`);
        this.addKnowledge("chat", command);
        // Ring 3: jeder Chat-Input füttert die Emotionen. Sentiment-Erkennung
        // läuft auf dem Originaltext (inkl. Casing), nicht auf `parts`, damit
        // ganze Sätze wie „Erzähle: ein schöner Tag" alle Stichwörter sehen.
        this.collectPlayerEmotions(command);

        // Schicht 1: Stichwörter ins Pattern-Memory-Fenster legen + Activity
        // zählen. Nexus-Programme, die in den nächsten 20 s laufen, werden
        // (sofern high-fitness) gegen diese Keywords verknüpft.
        const nowSec = performance.now() / 1000;
        this.rememberChatKeywords(command, nowSec);
        if (this.state.player && this.state.player.recentActivity) {
            this.state.player.recentActivity.chats++;
        }

        // Proaktive Vorschläge (alle 10 Chat-Befehle)
        if (this.state.knowledgeBase.filter((k) => k.type === "chat").length % 10 === 0) {
            this.proactiveSuggestions();
        }

        // Ring 2 Phase 3: DSL-First. Wenn der Befehl in DSL übersetzbar ist,
        // läuft er durch denselben Interpreter wie der Nexus — Budgets, Outcome,
        // Persistenz inklusive. Legacy-Pfad bleibt als Fallback für Befehle,
        // die noch kein DSL-Äquivalent haben (System-IO, Toggles, Phase-5-Themen).
        const parsed = this.parseChatToDsl(command);
        if (parsed) {
            const result = this.dslRun(parsed.program, { source: "human" });
            this.state.dsl.lastUserProgram = parsed.program;
            this.state.dsl.lastUserOutcome = result.outcome;
            this.state.dsl.lastUserAt = performance.now() / 1000;
            if (result.ok) {
                appendChatOutput(parsed.describe);
            } else {
                const reason = result.log.find((e) => /budget|unknown|invalid|exception/.test(e.event));
                appendChatOutput(`Befehl lief, aber mit Auffälligkeit: ${reason ? reason.event : "siehe Log"}`);
            }
            chatInput.value = "";
            return;
        }

        // Dynamische Befehlsverarbeitung
        if (parts[0] === "lerne" && parts[1] === "fähigkeit") {
            const abilityName = parts[2];
            const startIdx = parts[3] ? command.toLowerCase().indexOf(parts[3]) : -1;
            const abilityDesc = startIdx >= 0 ? command.slice(startIdx).trim() : "";
            this.learnAbility(abilityName, abilityDesc);
            appendChatOutput(`Fähigkeit '${abilityName}' gelernt: ${abilityDesc}`);
        } else if (parts[0] === "führe" && parts[1] === "fähigkeit" && parts[2] === "aus") {
            const abilityName = parts[3];
            if (this.state.abilities[abilityName]) {
                this.state.abilities[abilityName](this, this.state);
                appendChatOutput(`Fähigkeit '${abilityName}' ausgeführt`);
            } else {
                appendChatOutput(
                    `Fähigkeit '${abilityName}' nicht gefunden. Lerne sie mit 'Lerne Fähigkeit <Name> <Beschreibung>'`
                );
            }
        } else if (parts[0] === "speichere" && parts[1] === "zustand") {
            this.saveState();
            this.saveToProjectFolder().then((result) => {
                if (result === "server") {
                    appendChatOutput("Zustand gespeichert (direkt im Spielordner + localStorage)");
                } else if (result === "download") {
                    appendChatOutput("Zustand gespeichert (Browser-Download + localStorage)");
                } else {
                    appendChatOutput("Zustand gespeichert (nur localStorage)");
                }
            });
        } else if (parts[0] === "lade" && parts[1] === "zustand") {
            this.loadState();
            appendChatOutput("Zustand aus localStorage geladen");
        } else if (parts[0] === "lade" && parts[1] === "datei") {
            this.openStateFilePicker();
            appendChatOutput("Datei-Picker geöffnet – wähle eine anazhRealmState.json");
        } else if (parts[0] === "spawne" && parts[1] === "neue" && parts[2] === "welt") {
            this.generateNewWorld();
            appendChatOutput("Neue Welt generiert");
        } else if ((parts[0] === "erschaffe" && parts[1] === "welt") || (parts[0] === "neue" && parts[1] === "welt")) {
            // Ring 8: neue eigenständige Welt mit eigener worldId. Optional
            // „mit person" am Ende → bisherige Spieler-Identität übernehmen.
            // Slug ist alles zwischen dem Verb-Paar und einem optionalen Trailer.
            const inherit = / mit person$/i.test(command) || / mit übernahme$/i.test(command);
            let slug = "";
            const headLen = parts[0] === "erschaffe" ? 2 : 2;
            const rest = parts.slice(headLen).join(" ").trim();
            slug = rest
                .replace(/ mit person$/i, "")
                .replace(/ mit übernahme$/i, "")
                .trim();
            const newId = this.createNewWorld({ slug: slug || null, inheritPlayer: inherit, reload: true });
            if (newId) {
                appendChatOutput(`Neue Welt erschaffen (lade neu, Person ${inherit ? "übernommen" : "neu"}…)`);
            } else {
                appendChatOutput("Neue Welt konnte nicht erschaffen werden — siehe Log.");
            }
        } else if (parts[0] === "wechsle" && (parts[1] === "zu" || parts[1] === "zur") && parts.length >= 3) {
            // Ring 8: Wechsel zu einer existierenden Welt via slug. Wir
            // suchen den Index, finden den passenden Eintrag (genauer Match
            // oder Präfix), und triggern den Reload.
            const targetSlug = parts
                .slice(parts[2] === "welt" ? 3 : 2)
                .join(" ")
                .trim();
            const idx = this.worldsIndexLoad();
            const exact = idx.find((e) => e.slug === targetSlug);
            const prefix = exact || idx.find((e) => e.slug && e.slug.startsWith(targetSlug));
            if (!prefix) {
                appendChatOutput(`Welt „${targetSlug}" nicht gefunden. Befehl „liste welten" zeigt verfügbare.`);
            } else {
                const ok = this.switchToWorld(prefix.worldId, { reload: true });
                if (ok) appendChatOutput(`Wechsle zu ${prefix.slug}…`);
                else appendChatOutput("Welt-Wechsel verweigert (siehe Log).");
            }
        } else if (parts[0] === "lösche" && parts[1] === "welt" && parts.length >= 3) {
            const targetSlug = parts.slice(2).join(" ").trim();
            const idx = this.worldsIndexLoad();
            const entry = idx.find((e) => e.slug === targetSlug);
            if (!entry) {
                appendChatOutput(`Welt „${targetSlug}" nicht gefunden.`);
            } else if (entry.worldId === this.state.worldMeta.worldId) {
                appendChatOutput("Die aktive Welt kann nicht gelöscht werden. Wechsle erst zu einer anderen.");
            } else {
                this.deleteWorld(entry.worldId);
                appendChatOutput(`Welt „${entry.slug}" gelöscht.`);
                this.updateWorldInfo();
            }
        } else if ((parts[0] === "liste" || parts[0] === "zeige") && parts[1] === "welten") {
            const idx = this.worldsIndexLoad();
            if (idx.length === 0) {
                appendChatOutput("Nur diese eine Welt im Speicher.");
            } else {
                const lines = idx
                    .slice()
                    .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0))
                    .map((e) => {
                        const ageDays = e.bornAt ? Math.floor((Date.now() - e.bornAt) / 86400000) : 0;
                        const isActive = e.worldId === this.state.worldMeta.worldId;
                        return `${isActive ? "★ " : "  "}${e.slug} — ${ageDays}d alt, ID ${e.worldId.slice(0, 8)}…`;
                    });
                appendChatOutput(`Welten im Speicher (${idx.length}):`);
                for (const l of lines) appendChatOutput(l);
            }
        } else if (parts[0] === "behebe" && parts[1] === "physik-tunneling") {
            this.optimizeCollisions();
            appendChatOutput("Physik-Tunneling behoben: CCD angepasst");
        } else if (parts[0] === "optimiere" && parts[1] === "physik") {
            this.optimizePhysics();
            appendChatOutput("Physik optimiert");
        } else if (parts[0] === "aktiviere" && parts[1] === "version") {
            const version = parts[2];
            if (this.state.versionHistory.includes(version)) {
                this.loadVersion(version);
                appendChatOutput(`Version ${version} aktiviert`);
            } else {
                appendChatOutput(`Version ${version} nicht gefunden`);
            }
        } else if (parts[0] === "boden" && parts[1] === "nicht" && parts[2] === "sichtbar") {
            if (
                !this.state.groundChunks ||
                this.state.groundChunks.length === 0 ||
                !this.state.groundChunks.some((chunk) => chunk.visible)
            ) {
                this.log("Boden nicht sichtbar – Erzeuge neuen Boden...", "INFO");
                this.generateNewWorld();
                appendChatOutput("Neuer Boden generiert");
            } else {
                appendChatOutput("Boden ist bereits sichtbar");
            }
        } else if (parts[0] === "aktiviere" && parts[1] === "anazh-symphonie") {
            // V1-Platzhalter, bis Ring 4 Web-Audio bringt: ein DSL-Programm
            // belebt die Kreaturen sichtbar (happy + schneller) statt eines
            // JS-Closures, der per Sinus animiert. Ehrlicher als der alte
            // Stub und persistierbar als Ability.
            this.addNewAbility(
                "anazhSymphony",
                ["chain", ["creatures_emotion", "happy"], ["creatures_speed_mul", 1.5]],
                "human"
            );
            this.state.abilities["anazhSymphony"]();
            appendChatOutput("Anazh-Symphonie V1 aktiviert (Web-Audio kommt mit Ring 4)");
        } else if (parts[0] === "aktiviere" && parts[1] === "debug-logs") {
            this.state.debugLogging = true;
            appendChatOutput("Debug-Logs aktiviert");
        } else if (parts[0] === "deaktiviere" && parts[1] === "debug-logs") {
            this.state.debugLogging = false;
            appendChatOutput("Debug-Logs deaktiviert");
        } else if (this.state.llm && this.state.llm.enabled) {
            // Schicht 2 — LLM-Fallback. Statt „Unbekannter Befehl" geht der
            // Text an Claude; Antwort kommt narrativ + optional als DSL-
            // Programm, das durch dieselbe Sandbox wie alle anderen Programme
            // läuft.
            this.maybeAnswerWithLlm(command, appendChatOutput).catch((err) => {
                appendChatOutput(`(Grok-Fehler: ${err.message || err})`);
            });
        } else {
            const suggestion = this.chatSuggest(command);
            if (suggestion) {
                appendChatOutput(`Unbekannter Befehl. Meintest du: '${suggestion}'?`);
            } else {
                appendChatOutput(
                    "Unbekannter Befehl. DSL-Befehle: 'Setze Wetter rainy', 'Spawne Kreaturen 10', 'Ändere Sternenhimmel red', 'Setze Terrain Steilheit 0.8', 'Setze Terrain Basishöhe 5', 'Erhöhe Sprungkraft um 2', 'Heile Welt', 'Vereine Chaos Ordnung', 'Boden aktivieren/deaktivieren', 'Kreaturen aktivieren/deaktivieren', 'Erzähle <text>'. Weitere: 'Speichere/Lade Zustand', 'Lade Datei', 'Spawne neue Welt', 'Aktiviere Anazh-Symphonie', 'Aktiviere/Deaktiviere Debug-Logs', 'Behebe Physik-Tunneling', 'Optimiere Physik', 'Lerne Fähigkeit <Name> <Beschreibung>', 'Führe Fähigkeit aus <Name>'."
                );
            }
        }
        chatInput.value = "";
    }

    // Beschreibung → DSL-Programm. Vier bekannte Pattern + Catch-All als
    // `say`. Dieselbe Form wie `parseChatToDsl`: regelbasiert, sicher, JSON-
    // serialisierbar. Keine Code-Generierung mehr.
    parseAbilityDescriptionToDsl(description) {
        const lower = (description || "").toLowerCase().trim();
        if (lower.includes("ändere farbe von kreaturen")) {
            const m = lower.match(/zu ([\wäöüß]+)/);
            const color = m ? m[1] : "white";
            return ["creatures_color", color];
        }
        if (lower.includes("erhöhe geschwindigkeit") || lower.includes("erhoehe geschwindigkeit")) {
            const m = lower.match(/um ([\d.]+)/);
            const amount = m ? parseFloat(m[1]) : 1.0;
            const target = (this.state.speed || 6) + amount;
            return ["player_speed", target];
        }
        if (lower.includes("spawne objekt") || lower.includes("erschaffe baum")) {
            return ["spawn_tree", ["at_player"], 1];
        }
        if (lower.includes("regen") || lower.includes("regnen")) {
            return ["weather", "rainy"];
        }
        if (lower.includes("sonnig") || lower.includes("sonne")) {
            return ["weather", "sunny"];
        }
        // Catch-All: die Fähigkeit „sagt" ihre Beschreibung — kein Welt-
        // Effekt, aber persistiert und auf der Grok-Stimme abspielbar.
        return ["say", `Fähigkeit '${description.trim()}' aktiv`];
    }

    learnAbility(name, description) {
        const program = this.parseAbilityDescriptionToDsl(description);
        this.addNewAbility(name, program, "human");
        this.state.knowledgeBase.push({
            type: "ability",
            content: { name, description, program },
            timestamp: performance.now() / 1000,
        });
    }
    proactiveSuggestions() {
        const suggestions = [
            "Möchtest du eine neue Fähigkeit lernen? Beispiel: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'",
            "Soll ich die Physik weiter optimieren? Sage 'Entwickle Physik'",
            "Wie wäre es mit einem neuen Sternenhimmel? Beispiel: 'Ändere Sternenhimmel red'",
            "Möchtest du mehr Kreaturen spawnen? Beispiel: 'Spawne Kreaturen 10'",
            "Soll ich das Terrain flacher machen? Beispiel: 'Setze Terrain Steilheit 0.5'",
            "Möchtest du eine neue Welt erschaffen? Beispiel: 'Erschaffe Welt forest'",
            "Soll ich die Spielsteuerung erweitern? Beispiel: 'Implementiere Spielsteuerung'",
        ];
        const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
        const chatOutput = document.getElementById("chat-output");
        const line = document.createElement("div");
        line.textContent = `KI-Vorschlag: ${randomSuggestion}`;
        chatOutput.appendChild(line);
        chatOutput.scrollTop = chatOutput.scrollHeight;
    }
    implementGameMechanics() {
        this.state.gameMechanics = {
            raycaster: new THREE.Raycaster(),
            mouse: new THREE.Vector2(),
            onMouseClick: (event) => {
                this.state.gameMechanics.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.state.gameMechanics.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                this.state.gameMechanics.raycaster.setFromCamera(this.state.gameMechanics.mouse, this.state.camera);

                const groundObjects =
                    this.state.groundChunks.length > 0 ? this.state.groundChunks : [this.state.groundMesh];
                const intersects = this.state.gameMechanics.raycaster.intersectObjects(groundObjects);

                if (intersects.length > 0) {
                    const point = intersects[0].point;
                    if (event.button === 0) {
                        const block = new THREE.Mesh(
                            new THREE.BoxGeometry(1, 1, 1),
                            new THREE.MeshBasicMaterial({ color: 0x888888 })
                        );
                        block.position.set(Math.floor(point.x), point.y + 0.5, Math.floor(point.z));
                        this.state.scene.add(block);
                        this.log(`Block platziert bei (${block.position.x}, ${block.position.y}, ${block.position.z})`);
                    } else if (event.button === 2) {
                        const blocks = this.state.scene.children.filter((child) => {
                            const isGroundChunk =
                                this.state.groundChunks.length > 0
                                    ? this.state.groundChunks.includes(child)
                                    : child === this.state.groundMesh;
                            return (
                                !isGroundChunk &&
                                child !== this.state.playerMesh &&
                                !this.state.creatures.includes(child)
                            );
                        });
                        const blockIntersects = this.state.gameMechanics.raycaster.intersectObjects(blocks);
                        if (blockIntersects.length > 0) {
                            const block = blockIntersects[0].object;
                            this.state.scene.remove(block);
                            this.log(
                                `Block abgebaut bei (${block.position.x}, ${block.position.y}, ${block.position.z})`
                            );
                        }
                    }
                }
            },
        };
        window.addEventListener("click", this.state.gameMechanics.onMouseClick);
        window.addEventListener("contextmenu", (e) => e.preventDefault());
        this.log("Spielsteuerung implementiert: Linksklick zum Platzieren, Rechtsklick zum Abbauen");
    }

    createWorld(worldType) {
        this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
        if (worldType === "forest") {
            for (let i = 0; i < 50; i++) {
                const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
                const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
                const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                const x = Math.random() * 100 - 50;
                const z = Math.random() * 100 - 50;
                const terrainHeight = this.getTerrainHeightAt(x, z);
                trunk.position.set(x, terrainHeight + 2.5, z);
                leaves.position.set(x, terrainHeight + 5, z);
                const tree = new THREE.Group();
                tree.add(trunk);
                tree.add(leaves);
                this.state.scene.add(tree);
            }
            this.log("Wald-Welt erschaffen: 50 Bäume generiert");
        }
    }

    updateCreatureEmotions() {
        for (let i = 0; i < this.state.creatures.length; i++) {
            if (Math.random() < 0.1) {
                // 10% Chance, Emotion zu ändern
                this.state.creatureEmotions[i] =
                    this.state.weather === "rainy"
                        ? Math.random() < 0.7
                            ? "sad"
                            : "happy"
                        : Math.random() < 0.7
                          ? "happy"
                          : "sad";
            }
        }
    }

    optimizePhysics() {
        this.state.gravity = -14.715; // Zurück auf Standard
        this.state.physicsWorld.setGravity(new Ammo.btVector3(0, this.state.gravity, 0));
        this.state.rigidBodies.forEach((rb) => {
            const body = rb.userData.physicsBody;
            if (!body) return;
            // Welle 6.A1 — Spieler-Body bekommt Reibung 0 (Wall-Sliding),
            // alle anderen behalten 0.5 wie zuvor. Sonst würde dieser Re-Apply
            // (Chat-Befehl „optimiere physik") die Sliding-Eigenschaft zerstören.
            if (rb === this.state.playerMesh) {
                body.setFriction(0);
            } else {
                body.setFriction(0.5);
            }
            body.setCcdMotionThreshold(0.03);
            body.setCcdSweptSphereRadius(0.4);
        });
        this.log("Physik optimiert: Gravitation, Reibung, CCD angepasst");
    }

    // ### Welten-Generierung ### V7.56
    generateTerrainWithParameters(steepness, baseHeight) {
        // ### Konstanten ###
        const WIDTH = 256;
        const DEPTH = 256;
        const CHUNK_SIZE = 32;
        const WORLD_SIZE = 300;
        const CHUNKS_X = Math.ceil(WIDTH / CHUNK_SIZE);
        const CHUNKS_Z = Math.ceil(DEPTH / CHUNK_SIZE);

        // ### Alte Objekte sicher entfernen ###
        if (this.state.groundMesh) {
            this.state.scene.remove(this.state.groundMesh);
            const body = this.state.groundMesh.userData.physicsBody;
            if (body) {
                this.state.physicsWorld.removeRigidBody(body);
                Ammo.destroy(body);
                this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== this.state.groundMesh);
            }
            this.state.groundMesh = null;
            this.state.groundHeightField = null;
            this.log("Alter Boden entfernt");
        }
        if (this.state.groundChunks) {
            this.state.groundChunks.forEach((chunk) => {
                this.state.scene.remove(chunk);
                const body = chunk.userData.physicsBody;
                if (body) {
                    this.state.physicsWorld.removeRigidBody(body);
                    Ammo.destroy(body);
                    this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== chunk);
                }
            });
            this.state.groundChunks = [];
            this.log("Alte Chunks entfernt");
        }
        if (this.state.floatingIslands) {
            this.state.floatingIslands.forEach((island) => {
                this.state.scene.remove(island);
                const body = island.userData.physicsBody;
                if (body) {
                    this.state.physicsWorld.removeRigidBody(body);
                    Ammo.destroy(body);
                    this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== island);
                }
            });
            this.state.floatingIslands = [];
            this.log("Alte fliegende Inseln entfernt");
        }
        if (this.state.ufos) {
            this.state.ufos.forEach((ufo) => this.state.scene.remove(ufo));
            this.state.ufos = [];
            this.log("Alte UFOs entfernt");
        }
        if (this.state.creatures) {
            this.state.creatures.forEach((creature) => {
                this.state.scene.remove(creature);
                const body = creature.userData.physicsBody;
                if (body) {
                    this.state.physicsWorld.removeRigidBody(body);
                    Ammo.destroy(body);
                    this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== creature);
                }
            });
            this.state.creatures = [];
            this.state.creatureEmotions = [];
            this.log("Alte Kreaturen entfernt");
        }
        if (this.state.wallBoxes) {
            this.state.wallBoxes.forEach((wall) => {
                this.state.scene.remove(wall);
                const body = wall.userData.physicsBody;
                if (body) {
                    this.state.physicsWorld.removeRigidBody(body);
                    Ammo.destroy(body);
                    this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== wall);
                }
            });
            this.state.wallBoxes = [];
            this.log("Alte Wand-Kollisionsboxen entfernt");
        }
        if (this.state.vegetation) {
            this.state.vegetation.forEach((veg) => this.state.scene.remove(veg));
            this.state.vegetation = [];
            this.log("Alte Vegetation entfernt");
        }
        if (this.state.waterfalls) {
            this.state.waterfalls.forEach((wf) => this.state.scene.remove(wf));
            this.state.waterfalls = [];
            this.log("Alte Wasserfälle entfernt");
        }

        // ### Spieler-Position ###
        // Beim allerersten Worldgen wird der Spieler in die Welt-Mitte gesetzt.
        // Bei späteren Regenerationen (z. B. Nexus terrainFlatten, manuelles
        // "Spawne neue Welt") bleibt die aktuelle Position erhalten – sonst
        // würde jede Selbstoptimierung den Spieler aus der Welt teleportieren.
        // Kill-Plane und findSurfaceAbove fangen ab, falls die neue Topographie
        // den Spieler unter dem Boden lässt.
        if (this.state.playerMesh) {
            this.state.playerMesh.visible = true;
            if (!this.state.terrainEverGenerated) {
                this.state.playerMesh.position.set(0, 50, 0);
                if (this.state.playerBody) {
                    const t = this.state.tmpTransform;
                    t.setIdentity();
                    t.setOrigin(this.setVec(this.state.tmpVec1, 0, 50 / this.state.scaleFactor, 0));
                    this.state.playerBody.setWorldTransform(t);
                    this.state.playerBody.setLinearVelocity(this.setVec(this.state.tmpVec2, 0, 0, 0));
                }
                this.log("Welt erstmals gespawnt: Spieler bei (0, 50, 0)");
            } else {
                this.log("Welt regeneriert – Spieler-Position bleibt erhalten", "DEBUG");
            }
        } else {
            this.log("Warnung: playerMesh nicht initialisiert – sollte in init() initialisiert sein", "ERROR");
        }
        const wasFirstSpawn = !this.state.terrainEverGenerated;
        this.state.terrainEverGenerated = true;
        if (wasFirstSpawn) this.grokMarkFirstSpawn();

        // ### Höhendaten generieren ###
        const heightData = new Float32Array(WIDTH * DEPTH);
        const caveData = new Float32Array(WIDTH * DEPTH);
        const volcanoData = new Float32Array(WIDTH * DEPTH);
        let minHeight = Infinity;
        let maxHeight = -Infinity;

        if (typeof SimplexNoise !== "undefined") {
            const noise = new SimplexNoise((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed");
            const caveNoise = new SimplexNoise(
                ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + "-cave"
            );
            const volcanoNoise = new SimplexNoise(
                ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + "-volcano"
            );

            for (let i = 0; i < WIDTH * DEPTH; i++) {
                const x = (i % WIDTH) * (WORLD_SIZE / (WIDTH - 1)) - WORLD_SIZE / 2;
                const z = Math.floor(i / WIDTH) * (WORLD_SIZE / (DEPTH - 1)) - WORLD_SIZE / 2;
                const cacheKey = `${x}:${z}:${steepness}`;

                let height = this.state.noiseCache.get(cacheKey);
                if (height === undefined) {
                    height = this._terrainHeightAtWorld(x, z, noise, steepness, baseHeight, caveNoise, volcanoNoise);
                    this.cacheNoise(cacheKey, height);
                }
                // caveData/volcanoData behalten wir nur als Tag-Flags für späteren
                // shader-Gebrauch; die Höhen-Wirkung ist bereits im Helper drin.
                const caveSample = caveNoise.noise3D(x * 0.05, height * 0.05, z * 0.05);
                caveData[i] = caveSample > 0.4 ? 1 : 0;
                const volcanoSample = volcanoNoise.noise2D(x * 0.02, z * 0.02);
                volcanoData[i] = volcanoSample > 0.8 ? 1 : 0;
                heightData[i] = height;
                minHeight = Math.min(minHeight, height);
                maxHeight = Math.max(maxHeight, height);
            }
            this.log(`Höhendaten mit SimplexNoise generiert (Steilheit: ${steepness}, Basishöhe: ${baseHeight})`);
        } else {
            for (let i = 0; i < WIDTH * DEPTH; i++) {
                heightData[i] = baseHeight;
                caveData[i] = 0;
                volcanoData[i] = 0;
                minHeight = maxHeight = baseHeight;
            }
            this.log("Fallback: Flache Höhendaten generiert", "WARN");
        }

        // ### Shader-Material ###
        const vertexShader = `
        varying vec2 vUv;
        varying float vHeight;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vHeight = position.y;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
        const fragmentShader = `
        precision mediump float;
        varying vec2 vUv;
        varying float vHeight;
        varying vec3 vNormal;
        uniform vec3 lightDirection;
        uniform float weatherEffect;
        float random(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        float noise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            float a = random(i);
            float b = random(i + vec2(1.0, 0.0));
            float c = random(i + vec2(0.0, 1.0));
            float d = random(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }
        void main() {
            vec3 grassColor = vec3(0.1, 0.6, 0.1);
            vec3 sandColor = vec3(0.9, 0.8, 0.5);
            vec3 rockColor = vec3(0.4, 0.4, 0.4);
            vec3 dirtColor = vec3(0.4, 0.2, 0.1);
            vec3 snowColor = vec3(0.9, 0.9, 1.0);
            vec3 waterColor = vec3(0.1, 0.3, 0.6);
            vec3 caveColor = vec3(0.2, 0.2, 0.2);
            vec3 lavaColor = vec3(1.0, 0.5, 0.0);
            float height = vHeight;
            vec3 color;
            if (height < -20.0) {
                color = caveColor;
            } else if (height < -10.0) {
                color = waterColor;
            } else if (height < -5.0) {
                color = mix(waterColor, grassColor, (height + 10.0) / 5.0);
            } else if (height < 0.0) {
                color = mix(grassColor, dirtColor, (height + 5.0) / 5.0);
            } else if (height < 10.0) {
                color = mix(dirtColor, sandColor, height / 10.0);
            } else if (height < 30.0) {
                color = mix(sandColor, rockColor, (height - 10.0) / 20.0);
            } else if (height < 80.0) {
                color = mix(rockColor, snowColor, (height - 30.0) / 50.0);
            } else {
                color = mix(snowColor, lavaColor, (height - 80.0) / 20.0);
            }
            float n1 = noise(vUv * 2.0);
            float n2 = noise(vUv * 5.0);
            float n3 = noise(vUv * 10.0);
            color += vec3(n1 * 0.05 + n2 * 0.03 + n3 * 0.02);
            color = mix(color, color * 0.7, weatherEffect);
            float diffuse = max(dot(vNormal, lightDirection), 0.0);
            vec3 ambient = color * 0.6;
            vec3 diffuseColor = color * diffuse * 0.8;
            vec3 finalColor = ambient + diffuseColor;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

        let material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                weatherEffect: { value: this.state.weather === "rainy" ? 1.0 : 0.0 },
            },
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: true,
        });

        this.log("Shader-Material erstellt. Überprüfe Shader-Status...");
        if (!material.isShaderMaterial || !material.vertexShader || !material.fragmentShader) {
            this.log("Shader-Programm konnte nicht erstellt werden.", "ERROR");
            this.log("Falle zurück auf MeshBasicMaterial für Terrain mit einfacher Textur.");
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load("https://threejs.org/examples/textures/terrain/grasslight-big.jpg");
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10);
            material = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
        } else {
            this.log("Shader-Programm erfolgreich erstellt.");
        }

        // ### Initiale Chunks generieren ###
        // Alle Chunks gehen jetzt durch ensureChunkAt — denselben Pfad wie
        // spätere Erweiterungen. Damit haben initial UND extension Chunks
        // exakt dasselbe Welt-Grid (chunkWorldSize=37.5, vertexStep=1.171875)
        // und die Naht zwischen ihnen ist nicht mehr 0.15 Welt-Einheiten
        // versetzt. Das alte generateChunk + globale btHeightfieldTerrainShape
        // sind dadurch obsolet und werden in einem späteren Cleanup entfernt.
        this.state.chunkMap = new Map();
        this.state.chunkSize = CHUNK_SIZE;
        this.state.chunkWidth = WIDTH;
        this.state.chunkDepth = DEPTH;
        this.state.terrainMaterial = material;
        this.state.groundChunks = [];

        if (!this.state.scaleFactor || this.state.scaleFactor <= 0) {
            this.state.scaleFactor = 1.0;
            this.log("scaleFactor ungültig oder nicht gesetzt, Fallback auf 1.0", "WARNING");
        }

        for (let cz = 0; cz < CHUNKS_Z; cz++) {
            for (let cx = 0; cx < CHUNKS_X; cx++) {
                this.ensureChunkAt(cx, cz);
            }
        }

        // Globales Heightfield ist nicht mehr nötig: jeder Chunk hat jetzt
        // sein eigenes btBvhTriangleMeshShape, das die Triangles des Visual-
        // Meshes 1:1 als Collider nutzt. Nachbarn teilen ihre Naht-Vertices
        // exakt, daher keine Spalten mehr.

        // ### Fliegende Inseln generieren ###
        this.state.floatingIslands = [];
        this.state.ufos = [];
        const numIslands = 3; // Reduziere Anzahl für bessere Performance
        let islandMaterial = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
                weatherEffect: { value: this.state.weather === "rainy" ? 1.0 : 0.0 },
            },
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: true,
        });

        this.log("Shader-Material für fliegende Inseln erstellt. Überprüfe Shader-Status...");
        if (!islandMaterial.isShaderMaterial || !islandMaterial.vertexShader || !islandMaterial.fragmentShader) {
            this.log("Shader-Programm für fliegende Inseln konnte nicht erstellt werden.", "ERROR");
            this.log("Falle zurück auf MeshBasicMaterial für fliegende Inseln mit einfacher Textur.");
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load("https://threejs.org/examples/textures/terrain/grasslight-big.jpg");
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(5, 5);
            islandMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide,
            });
        } else {
            this.log("Shader-Programm für fliegende Inseln erfolgreich erstellt.");
        }

        for (let i = 0; i < numIslands; i++) {
            const islandSize = Math.random() * 20 + 10;
            const islandHeight = 5;
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            const indices = [];
            const uvs = [];

            const islandNoise = new SimplexNoise(
                ((this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed") + `-island-${i}`
            );
            const points = [];
            for (let z = 0; z < islandSize; z++) {
                const row = [];
                for (let x = 0; x < islandSize; x++) {
                    const xPos = x - islandSize / 2;
                    const zPos = z - islandSize / 2;
                    const distance = Math.sqrt(xPos * xPos + zPos * zPos);
                    const maxDistance = islandSize / 2;
                    let height = 0;
                    if (distance < maxDistance) {
                        const heightFactor = 1 - distance / maxDistance;
                        const height1 = islandNoise.noise2D(x * 0.1, z * 0.1) * 3 * heightFactor;
                        const height2 = islandNoise.noise2D(x * 0.3, z * 0.3) * 2 * heightFactor;
                        const height3 = islandNoise.noise2D(x * 0.5, z * 0.5) * 1 * heightFactor;
                        height = height1 + height2 + height3;
                        height = Math.max(0, height);
                        height -= (1 - heightFactor) * islandHeight;
                        const irregularity = islandNoise.noise2D(x * 0.8, z * 0.8) * 1.5;
                        height += irregularity;

                        if (!Number.isFinite(height)) {
                            this.log(
                                `Ungültiger Höhenwert für fliegende Insel ${i} bei (${x}, ${z}): ${height}. Setze auf 0.`,
                                "ERROR"
                            );
                            height = 0;
                        }
                    }
                    row.push(height);
                    vertices.push(xPos, height, zPos);
                    uvs.push(x / (islandSize - 1), z / (islandSize - 1));
                }
                points.push(row);
            }

            for (let z = 0; z < islandSize - 1; z++) {
                for (let x = 0; x < islandSize - 1; x++) {
                    const a = z * islandSize + x;
                    const b = z * islandSize + (x + 1);
                    const c = (z + 1) * islandSize + x;
                    const d = (z + 1) * islandSize + (x + 1);
                    if (
                        points[z][x] > -islandHeight &&
                        points[z][x + 1] > -islandHeight &&
                        points[z + 1][x] > -islandHeight &&
                        points[z + 1][x + 1] > -islandHeight
                    ) {
                        if (
                            a >= 0 &&
                            b >= 0 &&
                            c >= 0 &&
                            d >= 0 &&
                            a < vertices.length / 3 &&
                            b < vertices.length / 3 &&
                            c < vertices.length / 3 &&
                            d < vertices.length / 3
                        ) {
                            indices.push(a, b, d);
                            indices.push(a, d, c);
                        } else {
                            this.log(
                                `Ungültige Indices für fliegende Insel ${i}: (${a}, ${b}, ${d}, ${c}). Überspringe Dreieck.`,
                                "ERROR"
                            );
                        }
                    }
                }
            }

            geometry.setIndex(indices);
            geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
            geometry.computeVertexNormals();

            const positions = geometry.attributes.position.array;
            let hasInvalidValues = false;
            for (let j = 0; j < positions.length; j++) {
                if (!Number.isFinite(positions[j])) {
                    this.log(
                        `Ungültiger Vertex-Wert in fliegender Insel ${i} bei Index ${j}: ${positions[j]}. Setze auf 0.`,
                        "ERROR"
                    );
                    positions[j] = 0;
                    hasInvalidValues = true;
                }
            }
            if (hasInvalidValues) {
                geometry.attributes.position.needsUpdate = true;
                geometry.computeVertexNormals();
            }

            try {
                geometry.computeBoundingSphere();
                geometry.computeBoundingBox();
            } catch (e) {
                this.log(
                    `Fehler beim Berechnen der Bounding Sphere/Box für fliegende Insel ${i}: ${e.message}. Insel wird übersprungen.`,
                    "ERROR"
                );
                continue;
            }

            const island = new THREE.Mesh(geometry, islandMaterial);
            const islandX = (Math.random() - 0.5) * WORLD_SIZE;
            const islandZ = (Math.random() - 0.5) * WORLD_SIZE;
            const islandY = maxHeight + 20 + Math.random() * 30;
            if (!Number.isFinite(islandX) || !Number.isFinite(islandY) || !Number.isFinite(islandZ)) {
                this.log(
                    `Ungültige Position für fliegende Insel ${i}: (${islandX}, ${islandY}, ${islandZ}). Insel wird übersprungen.`,
                    "ERROR"
                );
                continue;
            }
            island.position.set(islandX, islandY, islandZ);
            island.visible = true;
            island.castShadow = true;
            island.receiveShadow = true;

            const numTrees = Math.floor(Math.random() * 3 + 1); // Reduziere Anzahl der Bäume
            for (let t = 0; t < numTrees; t++) {
                const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
                const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
                const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
                const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                const treeX = (Math.random() - 0.5) * (islandSize - 4);
                const treeZ = (Math.random() - 0.5) * (islandSize - 4);
                let treeHeight = islandNoise.noise2D((islandX + treeX) * 0.1, (islandZ + treeZ) * 0.1) * 3;
                if (!Number.isFinite(treeHeight)) {
                    this.log(
                        `Ungültiger Baumhöhenwert für fliegende Insel ${i} bei (${treeX}, ${treeZ}): ${treeHeight}. Setze auf 0.`,
                        "ERROR"
                    );
                    treeHeight = 0;
                }
                if (!Number.isFinite(treeX) || !Number.isFinite(treeZ)) {
                    this.log(
                        `Ungültige Baumposition für fliegende Insel ${i}: (${treeX}, ${treeZ}). Baum wird übersprungen.`,
                        "ERROR"
                    );
                    continue;
                }
                if (treeHeight > 0) {
                    trunk.position.set(treeX, treeHeight + 1.5, treeZ);
                    leaves.position.set(treeX, treeHeight + 3, treeZ);
                    const tree = new THREE.Group();
                    tree.add(trunk);
                    tree.add(leaves);

                    try {
                        trunkGeometry.computeBoundingSphere();
                        trunkGeometry.computeBoundingBox();
                        leavesGeometry.computeBoundingSphere();
                        leavesGeometry.computeBoundingBox();
                    } catch (e) {
                        this.log(
                            `Fehler beim Berechnen der Bounding Sphere/Box für Baum auf fliegender Insel ${i}: ${e.message}. Baum wird übersprungen.`,
                            "ERROR"
                        );
                        continue;
                    }

                    island.add(tree);
                }
            }

            this.state.scene.add(island);
            this.state.floatingIslands.push(island);
            this.log(
                `Fliegende Insel ${i} erstellt: Position (${islandX.toFixed(2)}, ${islandY.toFixed(2)}, ${islandZ.toFixed(2)})`
            );

            const ufoGeometry = new THREE.ConeGeometry(1, 2, 8);
            const ufoMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const ufo = new THREE.Mesh(ufoGeometry, ufoMaterial);
            const ufoY = islandY + 5;
            if (!Number.isFinite(ufoY)) {
                this.log(`Ungültige UFO-Höhe für fliegende Insel ${i}: ${ufoY}. UFO wird übersprungen.`, "ERROR");
                continue;
            }
            ufo.position.set(islandX, ufoY, islandZ);
            ufo.visible = true;

            try {
                ufoGeometry.computeBoundingSphere();
                ufoGeometry.computeBoundingBox();
            } catch (e) {
                this.log(
                    `Fehler beim Berechnen der Bounding Sphere/Box für UFO auf fliegender Insel ${i}: ${e.message}. UFO wird übersprungen.`,
                    "ERROR"
                );
                continue;
            }

            this.state.scene.add(ufo);
            this.state.ufos.push(ufo);
            ufo.userData = { baseY: ufoY, speed: Math.random() * 0.5 + 0.5 };
            this.log(
                `UFO für Insel ${i} erstellt: Position (${islandX.toFixed(2)}, ${ufo.position.y.toFixed(2)}, ${islandZ.toFixed(2)})`
            );
        }

        // ### Dynamische Vegetation und Wasserfälle ###
        this.state.vegetation = [];
        this.state.waterfalls = [];
        for (let z = 0; z < DEPTH; z++) {
            for (let x = 0; x < WIDTH; x++) {
                const idx = z * WIDTH + x;
                const xPos = (x / (WIDTH - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const zPos = (z / (DEPTH - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const height = heightData[idx];
                const steepness = this.calculateTerrainSteepness(xPos, zPos);

                if (!Number.isFinite(height) || !Number.isFinite(steepness)) {
                    this.log(
                        `Ungültige Werte für Vegetation/Wasserfall bei (${xPos}, ${zPos}): height=${height}, steepness=${steepness}. Überspringe.`,
                        "ERROR"
                    );
                    continue;
                }

                if (steepness < 1.0 && height > -5 && height < 30 && Math.random() < 0.02) {
                    // Reduziere Wahrscheinlichkeit
                    const vegetationType = height < 0 ? "grass" : height < 20 ? "tree" : "flower";
                    if (vegetationType === "tree") {
                        const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
                        const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8b4513 });
                        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                        const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
                        const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
                        trunk.position.set(xPos, height + 2.5, zPos);
                        leaves.position.set(xPos, height + 5, zPos);
                        const tree = new THREE.Group();
                        tree.add(trunk);
                        tree.add(leaves);
                        tree.castShadow = true;
                        tree.receiveShadow = true;

                        try {
                            trunkGeometry.computeBoundingSphere();
                            trunkGeometry.computeBoundingBox();
                            leavesGeometry.computeBoundingSphere();
                            leavesGeometry.computeBoundingBox();
                        } catch (e) {
                            this.log(
                                `Fehler beim Berechnen der Bounding Sphere/Box für Baum bei (${xPos}, ${zPos}): ${e.message}. Baum wird übersprungen.`,
                                "ERROR"
                            );
                            continue;
                        }

                        this.state.scene.add(tree);
                        this.state.vegetation.push(tree);
                    } else if (vegetationType === "grass") {
                        const grassGeometry = new THREE.ConeGeometry(0.2, 1, 4);
                        const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const grass = new THREE.Mesh(grassGeometry, grassMaterial);
                        grass.position.set(xPos, height + 0.5, zPos);
                        grass.castShadow = true;
                        grass.receiveShadow = true;

                        try {
                            grassGeometry.computeBoundingSphere();
                            grassGeometry.computeBoundingBox();
                        } catch (e) {
                            this.log(
                                `Fehler beim Berechnen der Bounding Sphere/Box für Gras bei (${xPos}, ${zPos}): ${e.message}. Gras wird übersprungen.`,
                                "ERROR"
                            );
                            continue;
                        }

                        this.state.scene.add(grass);
                        this.state.vegetation.push(grass);
                    } else if (vegetationType === "flower") {
                        const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 4);
                        const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
                        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                        const flowerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                        const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
                        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
                        stem.position.set(xPos, height + 0.5, zPos);
                        flower.position.set(xPos, height + 1, zPos);
                        const flowerGroup = new THREE.Group();
                        flowerGroup.add(stem);
                        flowerGroup.add(flower);
                        flowerGroup.castShadow = true;
                        flowerGroup.receiveShadow = true;

                        try {
                            stemGeometry.computeBoundingSphere();
                            stemGeometry.computeBoundingBox();
                            flowerGeometry.computeBoundingSphere();
                            flowerGeometry.computeBoundingBox();
                        } catch (e) {
                            this.log(
                                `Fehler beim Berechnen der Bounding Sphere/Box für Blume bei (${xPos}, ${zPos}): ${e.message}. Blume wird übersprungen.`,
                                "ERROR"
                            );
                            continue;
                        }

                        this.state.scene.add(flowerGroup);
                        this.state.vegetation.push(flowerGroup);
                    }
                }

                if (steepness > 5.0 && height > 10 && height < 50 && Math.random() < 0.005) {
                    // Reduziere Wahrscheinlichkeit
                    const particleCount = 50; // Reduziere Partikelanzahl
                    const particles = new THREE.BufferGeometry();
                    const positions = new Float32Array(particleCount * 3);
                    const velocities = new Float32Array(particleCount * 3);
                    for (let p = 0; p < particleCount; p++) {
                        positions[p * 3] = xPos + (Math.random() - 0.5) * 1;
                        positions[p * 3 + 1] = height + (Math.random() - 0.5) * 5;
                        positions[p * 3 + 2] = zPos + (Math.random() - 0.5) * 1;
                        velocities[p * 3] = 0;
                        velocities[p * 3 + 1] = -(Math.random() * 5 + 2);
                        velocities[p * 3 + 2] = 0;

                        if (
                            !Number.isFinite(positions[p * 3]) ||
                            !Number.isFinite(positions[p * 3 + 1]) ||
                            !Number.isFinite(positions[p * 3 + 2])
                        ) {
                            this.log(
                                `Ungültige Partikelposition bei Wasserfall (${xPos}, ${height}, ${zPos}): (${positions[p * 3]}, ${positions[p * 3 + 1]}, ${positions[p * 3 + 2]}). Setze auf 0.`,
                                "ERROR"
                            );
                            positions[p * 3] = xPos;
                            positions[p * 3 + 1] = height;
                            positions[p * 3 + 2] = zPos;
                        }
                    }
                    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
                    particles.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3));

                    try {
                        particles.computeBoundingSphere();
                        particles.computeBoundingBox();
                    } catch (e) {
                        this.log(
                            `Fehler beim Berechnen der Bounding Sphere/Box für Wasserfall bei (${xPos}, ${height}, ${zPos}): ${e.message}. Wasserfall wird übersprungen.`,
                            "ERROR"
                        );
                        continue;
                    }

                    const particleMaterial = new THREE.PointsMaterial({
                        color: 0x00aaff,
                        size: 0.2,
                        transparent: true,
                        opacity: 0.8,
                    });
                    const waterfall = new THREE.Points(particles, particleMaterial);
                    waterfall.userData = { baseHeight: height, minY: height - 20 };
                    this.state.scene.add(waterfall);
                    this.state.waterfalls.push(waterfall);
                    this.log(`Wasserfall erstellt bei (${xPos.toFixed(2)}, ${height.toFixed(2)}, ${zPos.toFixed(2)})`);
                }
            }
        }

        // ### Terrain speichern ###
        this.state.groundHeightField = heightData;
        this.state.minHeight = minHeight;
        this.state.maxHeight = maxHeight;
        this.state.terrainSteepness = steepness;
        this.state.terrainBaseHeight = baseHeight;
        this.log(
            `Neues Terrain generiert: ${WORLD_SIZE}x${WORLD_SIZE}, Höhe zwischen ${minHeight.toFixed(2)} und ${maxHeight.toFixed(2)}`
        );

        this.spawnCreatures();

        // ### Learnings ### [Stichwortartig optimieren, korrigieren und ergänzen aber nie Wissen löschen! Nie Learnings Entfernen!]

        // - Weltkoordinaten (x, z) in Noise-Generierung eliminieren Lücken.
        // - Alle Funktionen (Vegetation, Wasserfälle, Inseln) bleiben erhalten.
        // - Seed in SimplexNoise sorgt für konsistente Höhen über Chunks hinweg.
    }
    // ### Chunk-Generierung ### V7.66
    generateChunk(chunkX, chunkZ, heightData, width, depth, material) {
        // ### Konstanten ###
        const CHUNK_SIZE = this.state.chunkSize;
        const WORLD_SIZE = 300;

        // ### Chunk-Grenzen mit Überlappung ###
        const startX = chunkX * CHUNK_SIZE;
        const startZ = chunkZ * CHUNK_SIZE;
        const endX = Math.min(startX + CHUNK_SIZE + 1, width); // Überlappung um 1 Vertex
        const endZ = Math.min(startZ + CHUNK_SIZE + 1, depth); // Überlappung um 1 Vertex
        const chunkWidth = endX - startX;
        const chunkDepth = endZ - startZ;

        if (chunkWidth <= 0 || chunkDepth <= 0) {
            this.log(`Ungültige Chunk-Größe bei (${chunkX}, ${chunkZ}): ${chunkWidth}x${chunkDepth}`, "ERROR");
            return;
        }

        // ### Geometrie erstellen ###
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(chunkWidth * chunkDepth * 3);
        const indices = [];
        const uvs = new Float32Array(chunkWidth * chunkDepth * 2);

        // ### Vertices und UVs generieren ###
        for (let z = startZ; z < endZ; z++) {
            for (let x = startX; x < endX; x++) {
                const idx = (z - startZ) * chunkWidth + (x - startX);
                const worldX = (x / (width - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const worldZ = (z / (depth - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const height = heightData[z * width + x];
                vertices[idx * 3] = worldX;
                vertices[idx * 3 + 1] = Number.isFinite(height) ? height : 0;
                vertices[idx * 3 + 2] = worldZ;
                uvs[idx * 2] = (x - startX) / (chunkWidth - 1);
                uvs[idx * 2 + 1] = (z - startZ) / (chunkDepth - 1);
            }
        }

        // ### Indices für Dreiecke ###
        for (let z = 0; z < chunkDepth - 1; z++) {
            for (let x = 0; x < chunkWidth - 1; x++) {
                const a = z * chunkWidth + x;
                const b = z * chunkWidth + (x + 1);
                const c = (z + 1) * chunkWidth + x;
                const d = (z + 1) * chunkWidth + (x + 1);
                indices.push(a, b, d, a, d, c);
            }
        }

        // ### Geometrie setzen und validieren ###
        geometry.setIndex(indices);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();

        const positions = geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i++) {
            if (!Number.isFinite(positions[i])) {
                this.log(`Ungültiger Vertex in Chunk (${chunkX}, ${chunkZ}) bei Index ${i}: ${positions[i]}`, "ERROR");
                positions[i] = 0;
            }
        }
        geometry.attributes.position.needsUpdate = true;

        try {
            geometry.computeBoundingSphere();
            geometry.computeBoundingBox();
        } catch (e) {
            this.log(`Bounding-Fehler in Chunk (${chunkX}, ${chunkZ}): ${e.message}`, "ERROR");
            return;
        }

        // ### Chunk-Mesh ###
        const chunk = new THREE.Mesh(geometry, material);
        chunk.position.set(0, 0, 0); // Weltkoordinaten in Vertices, keine Verschiebung nötig
        chunk.castShadow = true;
        chunk.receiveShadow = true;
        chunk.visible = true;

        this.state.scene.add(chunk);
        this.state.groundChunks.push(chunk);
        this.state.chunkMap.set(`${chunkX},${chunkZ}`, { mesh: chunk, heightData: heightData.slice() });
        this.log(`Chunk (${chunkX}, ${chunkZ}) generiert: ${chunkWidth}x${chunkDepth}`, "DEBUG");

        // ### Learnings ### [Stichwortartig optimieren, korrigieren und ergänzen aber nie Wissen löschen! Nie Learnings Entfernen!]
        // - Überlappung der Vertices (+1) an den Rändern sorgt für nahtlose Übergänge.
        // - Weltkoordinaten und konsistente Noise-Generierung bleiben erhalten.
        // - Vertices an Chunkgrenzen sind durch Weltkoordinaten exakt synchronisiert.
        // - Keine Lücken mehr, da die Noise-Generierung konsistent ist und die Indizes korrekt verbinden.
        // - Höhenabgleich entfernt, da Weltkoordinaten in Noise Übergänge sichern.
        // - Gebirge erstrecken sich natürlich über Chunks durch konsistente Noise.
        // - Keine Öffnungen, da Vertices exakt an Chunk-Grenzen liegen.
    }

    // ### Terrain-Erweiterung ### V7.42
    // Zentrale Höhen-Formel. Wird sowohl vom initialen generateTerrainWithParameters
    // als auch vom extendTerrain-Pfad genutzt — damit die Nähte zwischen
    // ursprünglicher Welt und Erweiterung exakt zusammenpassen. Inklusive
    // Canyon, Field, Cave und Volcano-Modifikatoren (alle Schichten der
    // initialen Welt-Gen).
    _terrainHeightAtWorld(worldX, worldZ, noise, steepness, baseHeight, caveNoise, volcanoNoise) {
        // High-frequency Detail (h3/h4) deutlich reduziert: die scharfen
        // Spitzen erzeugten quasi-vertikale Wände zwischen benachbarten
        // Heightfield-Vertices (height-delta ~10..15 m über 1.17 m Cell-
        // Breite = 80°+ Hang), durch die der Player tunnelte. Canyon und
        // Volcano-Modifikatoren ebenfalls gedämpft.
        const h1 = noise.noise2D(worldX * 0.01, worldZ * 0.01) * 20 * steepness;
        const h2 = noise.noise2D(worldX * 0.03, worldZ * 0.03) * 10 * steepness;
        const h3 = noise.noise2D(worldX * 0.06, worldZ * 0.06) * 4 * steepness;
        const h4 = noise.noise2D(worldX * 0.1, worldZ * 0.1) * 1.5 * steepness;
        const h5 = noise.noise2D(worldX * 0.005, worldZ * 0.005) * 30 * steepness;
        const h6 = noise.noise2D(worldX * 0.002, worldZ * 0.002) * 50 * steepness;
        const h7 = Math.pow(noise.noise2D(worldX * 0.02, worldZ * 0.02), 3) * 20 * steepness;
        const canyonNoise = noise.noise2D(worldX * 0.008, worldZ * 0.008);
        const fieldNoise = noise.noise2D(worldX * 0.004, worldZ * 0.004);
        let h = baseHeight + h1 + h2 + h3 + h4 + h5 + h6 + h7;
        if (canyonNoise > 0.7) h -= (15 * (canyonNoise - 0.7)) / 0.3;
        if (fieldNoise < -0.5) h = Math.max(h * 0.5, -10);
        if (!Number.isFinite(h)) h = 0;
        // Cave: lokale Senke, wenn Cave-Noise und aktuelle Höhe übereinstimmen.
        // Vorher -20 → -8: tiefe Cave-Senken machten 20 m-Klippen quer durchs
        // Terrain, an denen der Player abprallte oder durchtunnelte.
        if (caveNoise) {
            const caveValue = caveNoise.noise3D(worldX * 0.05, h * 0.05, worldZ * 0.05);
            if (caveValue > 0.4 && h < 10 && h > -20) {
                h -= 8;
                if (!Number.isFinite(h)) h = 0;
            }
        }
        // Volcano: lokaler Aufstieg, wenn Volcano-Noise sehr hoch ist.
        // Vorher +50 → +20: keine 50 m-Spitzen mehr, die der Spieler bei
        // hoher Geschwindigkeit durchschlug.
        if (volcanoNoise) {
            const volcanoValue = volcanoNoise.noise2D(worldX * 0.02, worldZ * 0.02);
            if (volcanoValue > 0.8) {
                h += (20 * (volcanoValue - 0.8)) / 0.2;
                if (!Number.isFinite(h)) h = 0;
            }
        }
        return Math.max(-100, Math.min(100, h));
    }

    // Welt-Konstanten für Chunk-Geometrie. Eine Quelle der Wahrheit für
    // chunkWorldSize und vertexStep, damit initial worldgen und Extensions
    // niemals driften können.
    _chunkGeometry() {
        const CHUNK_SIZE = this.state.chunkSize;
        const WIDTH = this.state.chunkWidth;
        const WORLD_SIZE = 300;
        const CHUNKS_PER_SIDE = Math.ceil(WIDTH / CHUNK_SIZE);
        const chunkWorldSize = WORLD_SIZE / CHUNKS_PER_SIDE;
        const vertexStep = chunkWorldSize / CHUNK_SIZE;
        return { CHUNK_SIZE, WIDTH, WORLD_SIZE, chunkWorldSize, vertexStep };
    }

    // Ring 10.5: liefert die Chunk-Keys ("cx,cz"), deren AABB die Scheibe
    // um (worldX, worldZ) mit Radius r berührt. Wird von modify_terrain
    // genutzt, um den Op in mehreren Delta-Listen einzutragen, falls die
    // Scheibe über mehrere Chunks reicht.
    _chunksTouchedByDisc(worldX, worldZ, r) {
        const { WORLD_SIZE, chunkWorldSize } = this._chunkGeometry();
        const halfWorld = WORLD_SIZE / 2;
        const minCX = Math.floor((worldX - r + halfWorld) / chunkWorldSize);
        const maxCX = Math.floor((worldX + r + halfWorld) / chunkWorldSize);
        const minCZ = Math.floor((worldZ - r + halfWorld) / chunkWorldSize);
        const maxCZ = Math.floor((worldZ + r + halfWorld) / chunkWorldSize);
        const out = [];
        for (let cx = minCX; cx <= maxCX; cx++) {
            for (let cz = minCZ; cz <= maxCZ; cz++) {
                out.push(`${cx},${cz}`);
            }
        }
        return out;
    }

    // Ring 10.5: hängt einen Op an die Delta-Liste eines Chunks, mit Cap
    // gegen unbegrenzten Wuchs. Liefert true, wenn der Op gespeichert wurde,
    // false, wenn der Cap erreicht ist (ältester Op wird in dem Fall
    // verworfen statt zu wachsen — der Spieler kann die Welt weiter formen).
    _appendChunkDeltaOp(chunkKey, op) {
        if (!this.state.worldMeta) return false;
        if (!this.state.worldMeta.chunkDeltas) this.state.worldMeta.chunkDeltas = {};
        const deltas = this.state.worldMeta.chunkDeltas;
        if (!deltas[chunkKey] || !Array.isArray(deltas[chunkKey].ops)) {
            deltas[chunkKey] = { ops: [] };
        }
        const cap = AnazhRealm.CHUNK_DELTA_OPS_CAP;
        if (deltas[chunkKey].ops.length >= cap) {
            deltas[chunkKey].ops.shift();
        }
        deltas[chunkKey].ops.push(op);
        return true;
    }

    // Ring 10.5: räumt chunkDeltas nach Load auf. Wirft ungültige Einträge,
    // klammert Felder auf sichere Bereiche, hält den Cap pro Chunk ein.
    // Alte Saves ohne chunkDeltas bekommen eine leere Map.
    _sanitizeChunkDeltas() {
        if (!this.state.worldMeta) return;
        const raw = this.state.worldMeta.chunkDeltas;
        if (!raw || typeof raw !== "object") {
            this.state.worldMeta.chunkDeltas = {};
            return;
        }
        const cap = AnazhRealm.CHUNK_DELTA_OPS_CAP;
        const clean = {};
        for (const [key, entry] of Object.entries(raw)) {
            if (typeof key !== "string" || !/^-?\d+,-?\d+$/.test(key)) continue;
            if (!entry || !Array.isArray(entry.ops)) continue;
            const ops = [];
            for (const op of entry.ops) {
                if (!op || op.type !== "modify_terrain") continue;
                const x = Number(op.x);
                const z = Number(op.z);
                const r = Number(op.r);
                const dh = Number(op.dh);
                if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
                if (!Number.isFinite(r) || r <= 0 || r > 20) continue;
                if (!Number.isFinite(dh) || Math.abs(dh) > 20) continue;
                ops.push({ type: "modify_terrain", x, z, r, dh, at: Number(op.at) || Date.now() });
            }
            if (ops.length === 0) continue;
            clean[key] = { ops: ops.slice(-cap) };
        }
        this.state.worldMeta.chunkDeltas = clean;
    }

    // Ring 10.5: wendet einen einzelnen modify_terrain-Op auf einen
    // geladenen Chunk an. Update-Pfad: heightData[] mutieren, Mesh-Vertices
    // im selben Index updaten, Normalen + Bounding-Sphere neu berechnen,
    // Ammo-Body neu bauen (Visual=Collision-Naht halten). Smoothstep-Falloff
    // im Radius — Mitte voller dh, Rand 0. No-op wenn der Op den Chunk
    // räumlich nicht erreicht (z. B. weil eine Scheibe über mehrere Chunks
    // reichte und nur der Außenrand betroffen war).
    _applyModifyOpToChunk(chunkData, op) {
        if (!chunkData || !chunkData.mesh || !chunkData.heightData) return false;
        if (!op || op.type !== "modify_terrain") return false;
        const mesh = chunkData.mesh;
        const heightData = chunkData.heightData;
        const { CHUNK_SIZE, WORLD_SIZE, chunkWorldSize, vertexStep } = this._chunkGeometry();
        const VTX = CHUNK_SIZE + 1;
        const worldStartX = chunkData.chunkX * chunkWorldSize - WORLD_SIZE / 2;
        const worldStartZ = chunkData.chunkZ * chunkWorldSize - WORLD_SIZE / 2;
        const cx = Number(op.x);
        const cz = Number(op.z);
        const r = Math.max(0.5, Math.min(15, Number(op.r) || 0));
        const dh = Math.max(-15, Math.min(15, Number(op.dh) || 0));
        if (!Number.isFinite(cx) || !Number.isFinite(cz)) return false;
        const r2 = r * r;
        const posAttr = mesh.geometry.attributes.position;
        const arr = posAttr.array;
        let touched = 0;
        for (let z = 0; z < VTX; z++) {
            const wz = worldStartZ + z * vertexStep;
            const dz = wz - cz;
            const dz2 = dz * dz;
            if (dz2 > r2) continue;
            for (let x = 0; x < VTX; x++) {
                const wx = worldStartX + x * vertexStep;
                const dx = wx - cx;
                const d2 = dx * dx + dz2;
                if (d2 > r2) continue;
                const t = 1 - Math.sqrt(d2) / r;
                const falloff = t * t * (3 - 2 * t);
                const delta = dh * falloff;
                const idx = z * VTX + x;
                heightData[idx] += delta;
                arr[idx * 3 + 1] = heightData[idx];
                touched++;
            }
        }
        if (touched === 0) return false;
        posAttr.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeBoundingSphere();
        let minH = Infinity;
        let maxH = -Infinity;
        for (let i = 0; i < heightData.length; i++) {
            const h = heightData[i];
            if (h < minH) minH = h;
            if (h > maxH) maxH = h;
        }
        mesh.userData.minHeight = minH;
        mesh.userData.maxHeight = maxH;
        this._rebuildChunkPhysics(chunkData, arr);
        return true;
    }

    // Ring 10.5: Ammo-Body neu aus den aktuellen Mesh-Vertices bauen. Alt-Body
    // + tmesh werden vor dem Rebuild aus der Welt entfernt + destroyed,
    // sonst hagelt es Phantom-Kollisionen + WASM-Heap-Leaks. Selbe
    // Triangle-Reihenfolge wie ensureChunkAt — Visual=Kollision bleibt
    // per Konstruktion identisch (CLAUDE.md Gotcha).
    _rebuildChunkPhysics(chunkData, vertices) {
        if (!this.state.physicsWorld || !chunkData.mesh.userData.physicsBody) return;
        if (typeof Ammo === "undefined") return;
        const mesh = chunkData.mesh;
        const sf = this.state.scaleFactor;
        if (!(sf > 0)) return;
        const { CHUNK_SIZE } = this._chunkGeometry();
        const VTX = CHUNK_SIZE + 1;
        try {
            const oldBody = mesh.userData.physicsBody;
            const oldTMesh = mesh.userData.physicsMesh;
            this.state.physicsWorld.removeRigidBody(oldBody);
            try {
                Ammo.destroy(oldBody);
            } catch {
                /* defensive */
            }
            if (oldTMesh) {
                try {
                    Ammo.destroy(oldTMesh);
                } catch {
                    /* defensive */
                }
            }
            const tmesh = new Ammo.btTriangleMesh(true, true);
            const v0 = new Ammo.btVector3(0, 0, 0);
            const v1 = new Ammo.btVector3(0, 0, 0);
            const v2 = new Ammo.btVector3(0, 0, 0);
            for (let z = 0; z < VTX - 1; z++) {
                for (let x = 0; x < VTX - 1; x++) {
                    const a = z * VTX + x;
                    const b = z * VTX + x + 1;
                    const c2 = (z + 1) * VTX + x;
                    const d = (z + 1) * VTX + x + 1;
                    v0.setValue(vertices[a * 3] / sf, vertices[a * 3 + 1] / sf, vertices[a * 3 + 2] / sf);
                    v1.setValue(vertices[b * 3] / sf, vertices[b * 3 + 1] / sf, vertices[b * 3 + 2] / sf);
                    v2.setValue(vertices[d * 3] / sf, vertices[d * 3 + 1] / sf, vertices[d * 3 + 2] / sf);
                    tmesh.addTriangle(v0, v1, v2);
                    v0.setValue(vertices[a * 3] / sf, vertices[a * 3 + 1] / sf, vertices[a * 3 + 2] / sf);
                    v1.setValue(vertices[d * 3] / sf, vertices[d * 3 + 1] / sf, vertices[d * 3 + 2] / sf);
                    v2.setValue(vertices[c2 * 3] / sf, vertices[c2 * 3 + 1] / sf, vertices[c2 * 3 + 2] / sf);
                    tmesh.addTriangle(v0, v1, v2);
                }
            }
            Ammo.destroy(v0);
            Ammo.destroy(v1);
            Ammo.destroy(v2);
            const shape = new Ammo.btBvhTriangleMeshShape(tmesh, true, true);
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(0, 0, 0));
            const motionState = new Ammo.btDefaultMotionState(transform);
            const inertia = new Ammo.btVector3(0, 0, 0);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, inertia);
            const body = new Ammo.btRigidBody(rbInfo);
            this.state.physicsWorld.addRigidBody(body);
            Ammo.destroy(rbInfo);
            Ammo.destroy(inertia);
            mesh.userData.physicsBody = body;
            mesh.userData.physicsMesh = tmesh;
        } catch (err) {
            this.log(
                `Chunk-Physik-Rebuild fehlgeschlagen (${chunkData.chunkX}, ${chunkData.chunkZ}): ${err.message}`,
                "ERROR"
            );
        }
    }

    // Ring 10.5: nach ensureChunkAt aufgerufen — replays die für diesen
    // Chunk gespeicherten Ops. No-op wenn keine Deltas existieren. Idempotent
    // im Sinne: jede Ensure führt die volle Op-Liste aus (deterministisch,
    // wir mutieren nicht die ops selbst).
    applyChunkDelta(chunkKey) {
        const deltas = this.state.worldMeta && this.state.worldMeta.chunkDeltas;
        if (!deltas) return 0;
        const entry = deltas[chunkKey];
        if (!entry || !Array.isArray(entry.ops) || entry.ops.length === 0) return 0;
        const chunkData = this.state.chunkMap && this.state.chunkMap.get(chunkKey);
        if (!chunkData) return 0;
        let applied = 0;
        for (const op of entry.ops) {
            if (this._applyModifyOpToChunk(chunkData, op)) applied++;
        }
        return applied;
    }

    extendTerrain(direction) {
        // Legacy direction-API (für Playtest + alte Caller). Berechnet aus den
        // Map-Grenzen einen Außen-Chunk und delegiert an ensureChunkAt.
        if (!this.state.chunkMap || this.state.chunkMap.size === 0) return;
        let minChunkX = Infinity,
            maxChunkX = -Infinity,
            minChunkZ = Infinity,
            maxChunkZ = -Infinity;
        for (const key of this.state.chunkMap.keys()) {
            const [cx, cz] = key.split(",").map(Number);
            if (cx < minChunkX) minChunkX = cx;
            if (cx > maxChunkX) maxChunkX = cx;
            if (cz < minChunkZ) minChunkZ = cz;
            if (cz > maxChunkZ) maxChunkZ = cz;
        }
        let cx, cz;
        switch (direction) {
            case "north":
                cx = Math.floor((minChunkX + maxChunkX) / 2);
                cz = minChunkZ - 1;
                break;
            case "south":
                cx = Math.floor((minChunkX + maxChunkX) / 2);
                cz = maxChunkZ + 1;
                break;
            case "west":
                cx = minChunkX - 1;
                cz = Math.floor((minChunkZ + maxChunkZ) / 2);
                break;
            case "east":
                cx = maxChunkX + 1;
                cz = Math.floor((minChunkZ + maxChunkZ) / 2);
                break;
            default:
                return;
        }
        this.ensureChunkAt(cx, cz);
    }

    ensureChunkAt(newChunkX, newChunkZ) {
        // Baut einen einzelnen Chunk an den gegebenen Welt-Indizes — kann
        // beliebig negativ oder über CHUNKS_PER_SIDE liegen. Vertices in
        // absoluten Welt-Koords aus Welt-Offset + Vertex-Index berechnet,
        // Mesh + eigenes Heightfield-Physik-Shape inline gebaut. No-op wenn
        // der Chunk bereits existiert. Frustum-Test bleibt boundingSphere-
        // basiert (siehe CLAUDE.md gotcha über chunks an position 0,0,0).
        if (!this.state.chunkMap || !this.state.terrainMaterial) return;
        const key = `${newChunkX},${newChunkZ}`;
        if (this.state.chunkMap.has(key)) return;

        const { CHUNK_SIZE, WORLD_SIZE, chunkWorldSize, vertexStep } = this._chunkGeometry();
        const steepness = this.state.terrainSteepness;
        const baseHeight = this.state.terrainBaseHeight;
        const material = this.state.terrainMaterial;

        const VTX = CHUNK_SIZE + 1; // 33 Vertices pro Seite (Überlappung um 1)
        const worldStartX = newChunkX * chunkWorldSize - WORLD_SIZE / 2;
        const worldStartZ = newChunkZ * chunkWorldSize - WORLD_SIZE / 2;

        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        const noise = new SimplexNoise(seed);
        const caveNoise = new SimplexNoise(seed + "-cave");
        const volcanoNoise = new SimplexNoise(seed + "-volcano");
        const heightData = new Float32Array(VTX * VTX);
        let minHeight = Infinity;
        let maxHeight = -Infinity;

        for (let z = 0; z < VTX; z++) {
            const worldZ = worldStartZ + z * vertexStep;
            for (let x = 0; x < VTX; x++) {
                const worldX = worldStartX + x * vertexStep;
                const cacheKey = `${worldX}:${worldZ}:${steepness}`;
                let h = this.state.noiseCache.get(cacheKey);
                if (h === undefined) {
                    h = this._terrainHeightAtWorld(
                        worldX,
                        worldZ,
                        noise,
                        steepness,
                        baseHeight,
                        caveNoise,
                        volcanoNoise
                    );
                    this.cacheNoise(cacheKey, h);
                }
                heightData[z * VTX + x] = h;
                if (h < minHeight) minHeight = h;
                if (h > maxHeight) maxHeight = h;
            }
        }

        // Mesh inline bauen (parallel zur Logik in `generateChunk`, aber mit
        // chunk-lokalen Indices und korrektem Welt-Offset).
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array(VTX * VTX * 3);
        const uvs = new Float32Array(VTX * VTX * 2);
        const indices = [];
        for (let z = 0; z < VTX; z++) {
            for (let x = 0; x < VTX; x++) {
                const idx = z * VTX + x;
                vertices[idx * 3] = worldStartX + x * vertexStep;
                vertices[idx * 3 + 1] = heightData[idx];
                vertices[idx * 3 + 2] = worldStartZ + z * vertexStep;
                uvs[idx * 2] = x / (VTX - 1);
                uvs[idx * 2 + 1] = z / (VTX - 1);
            }
        }
        for (let z = 0; z < VTX - 1; z++) {
            for (let x = 0; x < VTX - 1; x++) {
                const a = z * VTX + x;
                const b = z * VTX + x + 1;
                const c = (z + 1) * VTX + x;
                const d = (z + 1) * VTX + x + 1;
                indices.push(a, b, d, a, d, c);
            }
        }
        geometry.setIndex(indices);
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
        geometry.computeVertexNormals();
        geometry.computeBoundingSphere();

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0); // Vertices liegen in Welt-Koords
        mesh.visible = true;
        mesh.userData = { chunkX: newChunkX, chunkZ: newChunkZ, minHeight, maxHeight };
        this.state.scene.add(mesh);
        this.state.groundChunks.push(mesh);
        // heightData mitspeichern, weil updateWallCollisions/addWallCollisions
        // pro Chunk darauf zugreifen. .slice() entkoppelt das Array vom
        // typed-buffer-Lifecycle der Mesh-Geometry.
        this.state.chunkMap.set(key, {
            mesh,
            chunkX: newChunkX,
            chunkZ: newChunkZ,
            heightData: heightData.slice(),
        });
        if (minHeight < this.state.minHeight) this.state.minHeight = minHeight;
        if (maxHeight > this.state.maxHeight) this.state.maxHeight = maxHeight;

        // Physik: btBvhTriangleMeshShape mit GENAU denselben Triangles wie
        // das visuelle Mesh. Vorteile gegenüber dem alten btHeightfield-
        // Ansatz:
        //  - Visual = Kollision per Konstruktion identisch (keine Diskrepanz
        //    zwischen height-cell-mitte und vertex-position).
        //  - Nachbar-Chunks teilen exakt die Naht-Vertices, weil beide
        //    Seiten die Höhe an worldX/worldZ via _terrainHeightAtWorld
        //    deterministisch berechnen. Keine Spalten, keine Overlap-Hacks.
        //  - Auch für initial-grid Chunks anwendbar — das alte globale
        //    Heightfield ist damit obsolet.
        try {
            if (this.state.physicsWorld && this.state.scaleFactor > 0) {
                const sf = this.state.scaleFactor;
                const tmesh = new Ammo.btTriangleMesh(true, true);
                const v0 = new Ammo.btVector3(0, 0, 0);
                const v1 = new Ammo.btVector3(0, 0, 0);
                const v2 = new Ammo.btVector3(0, 0, 0);
                // Triangles direkt aus dem Mesh-Geometry-Index erzeugen
                // (selbe Reihenfolge wie das visuelle Mesh oben).
                for (let z = 0; z < VTX - 1; z++) {
                    for (let x = 0; x < VTX - 1; x++) {
                        const a = z * VTX + x;
                        const b = z * VTX + x + 1;
                        const c = (z + 1) * VTX + x;
                        const d = (z + 1) * VTX + x + 1;
                        // Triangle 1: a, b, d
                        v0.setValue(vertices[a * 3] / sf, vertices[a * 3 + 1] / sf, vertices[a * 3 + 2] / sf);
                        v1.setValue(vertices[b * 3] / sf, vertices[b * 3 + 1] / sf, vertices[b * 3 + 2] / sf);
                        v2.setValue(vertices[d * 3] / sf, vertices[d * 3 + 1] / sf, vertices[d * 3 + 2] / sf);
                        tmesh.addTriangle(v0, v1, v2);
                        // Triangle 2: a, d, c
                        v0.setValue(vertices[a * 3] / sf, vertices[a * 3 + 1] / sf, vertices[a * 3 + 2] / sf);
                        v1.setValue(vertices[d * 3] / sf, vertices[d * 3 + 1] / sf, vertices[d * 3 + 2] / sf);
                        v2.setValue(vertices[c * 3] / sf, vertices[c * 3 + 1] / sf, vertices[c * 3 + 2] / sf);
                        tmesh.addTriangle(v0, v1, v2);
                    }
                }
                Ammo.destroy(v0);
                Ammo.destroy(v1);
                Ammo.destroy(v2);
                const shape = new Ammo.btBvhTriangleMeshShape(tmesh, true, true);
                const transform = new Ammo.btTransform();
                transform.setIdentity();
                // Vertices sind schon in absoluten Welt-Koords → origin (0,0,0).
                transform.setOrigin(new Ammo.btVector3(0, 0, 0));
                const motionState = new Ammo.btDefaultMotionState(transform);
                const inertia = new Ammo.btVector3(0, 0, 0);
                const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape, inertia);
                const body = new Ammo.btRigidBody(rbInfo);
                this.state.physicsWorld.addRigidBody(body);
                Ammo.destroy(rbInfo);
                Ammo.destroy(inertia);
                mesh.userData.physicsBody = body;
                mesh.userData.physicsMesh = tmesh; // für späteres dispose
                // NICHT in state.rigidBodies pushen: der physics-sync-Loop
                // würde mesh.position aus dem motionState-Origin überschreiben.
            }
        } catch (err) {
            this.log(`ensureChunkAt Physik-Fehler bei (${newChunkX}, ${newChunkZ}): ${err.message}`, "ERROR");
        }

        // Ring 10.5: nach Mesh + Body erfolgreich gebaut → gespeicherte
        // Welt-Modifikationen für diesen Chunk replayen. Daten überleben
        // damit Chunk-Unload + Reload + Welt-Wechsel. No-op wenn keine
        // Deltas existieren (z. B. frische Welt).
        const replayKey = `${newChunkX},${newChunkZ}`;
        this.applyChunkDelta(replayKey);

        this.log(`Chunk hinzugefügt: (${newChunkX}, ${newChunkZ})`);
    }

    generateNewWorld({ force = false } = {}) {
        // Cool-Down verhindert Death-Spirals: ohne ihn rief die Selbstanalyse
        // generateNewWorld() im Sekundentakt, während der Spieler durch das
        // gerade gelöschte Terrain fiel.
        const now = performance.now() / 1000;
        if (!force && now - this.state.lastWorldgen < this.state.worldgenCooldown) {
            this.log(
                `generateNewWorld unterdrückt (Cool-Down, noch ${(this.state.worldgenCooldown - (now - this.state.lastWorldgen)).toFixed(1)}s)`,
                "DEBUG"
            );
            return false;
        }
        this.state.lastWorldgen = now;
        this.state.worldgenInFlight = true;
        try {
            this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
        } finally {
            this.state.worldgenInFlight = false;
        }
        return true;
    }

    // ### Persistenz ###
    buildStateSnapshot() {
        const knowledgeBase = this.state.knowledgeBase.slice(-200);
        return {
            playerPosition: this.state.playerMesh
                ? {
                      x: this.state.playerMesh.position.x,
                      y: this.state.playerMesh.position.y,
                      z: this.state.playerMesh.position.z,
                  }
                : { x: 0, y: 5, z: 0 },
            knowledgeBase: knowledgeBase,
            version: this.state.currentVersion,
            selfAwareness: this.state.selfAwareness,
            creatures: this.state.creatures.map((creature) => ({
                position: { x: creature.position.x, y: creature.position.y, z: creature.position.z },
            })),
            creatureEmotions: this.state.creatureEmotions,
            terrainSteepness: this.state.terrainSteepness,
            terrainBaseHeight: this.state.terrainBaseHeight,
            weather: this.state.weather,
            worldMeta: { ...this.state.worldMeta },
            dslAbilities: this.state.dsl.abilities.slice(-200),
            dslHistory: this.state.dsl.history.slice(-this.state.dsl.historyCap),
            // Schicht 1 — Pattern-Memory + Pfad-Buckets persistieren. Beides
            // ist Welt-Gedächtnis und überlebt Reloads bewusst.
            dslPatternMemory: this.state.dsl.patternMemory || {},
            playerPathBuckets: this.state.player.pathBuckets || null,
            // Welle 1 D — Welt-Journal persistiert. Ohne das Journal hätte
            // jede Session ihre eigene Geschichte; mit ihm wächst die Welt
            // über Reloads hinweg.
            worldJournal: {
                entries: (this.state.worldJournal.entries || []).slice(-this.state.worldJournal.entryCap),
                seen: { ...(this.state.worldJournal.seen || {}) },
            },
            // Ring 3: Player-Emotionen werden mitgespeichert. Cooldown-Timer
            // bleiben absichtlich draußen — sie sind reine Laufzeit-Drosselung,
            // ein Reload soll wieder triggerfähig sein.
            playerEmotions: { ...this.state.player.emotions },
            // Ring 5: Spieler-Seele (visuelle Form). Beim Load wird sie nach
            // dem playerMesh-Bau angewandt — kein Body-Recreate.
            playerSoul: this.state.player.soul || "human",
            // Welle 4 Phase 3: Werkzeug-Besitz. Starter-Werkzeuge werden bei
            // jedem Init wieder verfügbar, aber Persistenz erlaubt zukünftig
            // eigen-geschmiedete (Welle 6) zu überleben.
            playerTools: Array.isArray(this.state.player.tools) ? [...this.state.player.tools] : [],
            // Ring 6: Bau-Werke. Nur {type, position, seed, scale} — der
            // Mesh wird beim Laden aus dem Seed rekonstruiert (kein Mesh-
            // Snapshot). V2 inkludiert scale für fraktale Sub-Strukturen.
            architectures: (this.state.architectures || []).map((a) => ({
                type: a.type,
                position: { x: a.position.x, y: a.position.y, z: a.position.z },
                seed: a.seed,
                scale: Number.isFinite(a.scale) ? a.scale : 1,
            })),
            // Ring 6.4 — eigene Baupläne (nicht built-in) persistieren. Die
            // Built-ins werden beim Init aus _defaultBlueprints() erzeugt;
            // wir speichern nur, was der Spieler dazugefügt hat.
            blueprints: Object.values(this.state.blueprints || {})
                .filter((bp) => bp && !bp.builtIn)
                .map((bp) => {
                    const out = {
                        name: bp.name,
                        label: bp.label || bp.name,
                        parts: Array.isArray(bp.parts) ? JSON.parse(JSON.stringify(bp.parts)) : [],
                        connections: Array.isArray(bp.connections) ? JSON.parse(JSON.stringify(bp.connections)) : [],
                    };
                    if (bp.role === "tool" && bp.toolMeta) {
                        out.role = "tool";
                        out.toolMeta = { opName: bp.toolMeta.opName, opClass: bp.toolMeta.opClass };
                    }
                    return out;
                }),
            // Welle 5 C — eigene Werkzeuge (aus registrierten Bauplänen)
            // persistieren. Starter-Werkzeuge entstehen aus _defaultTools()
            // bei jedem Init, deshalb nur eigene speichern.
            tools: Object.values(this.state.tools || {})
                .filter((t) => t && !t.builtIn)
                .map((t) => ({
                    name: t.name,
                    label: t.label,
                    opClass: t.opClass,
                    opName: t.opName,
                    precisionCap: t.precisionCap,
                    sourceBlueprint: t.sourceBlueprint || null,
                })),
            // Welle 4 Phase 1 — eigene Materialien persistieren. Built-ins
            // kommen aus _defaultMaterials() im Konstruktor zurück; auch hier
            // schreiben wir nur, was der Spieler dazugefügt hat.
            materials: Object.values(this.state.materials || {})
                .filter((m) => m && !m.builtIn)
                .map((m) => ({
                    name: m.name,
                    label: m.label || m.name,
                    color: m.color,
                    tags: { ...m.tags },
                })),
            // Ring 6.5 — Hotbar-Belegung. Array von 9 Slots mit Bauplan-Name
            // oder null. Default wird beim Init überschrieben.
            hotbar: Array.isArray(this.state.hotbar) ? this.state.hotbar.slice(0, 9) : [],
        };
    }

    saveState() {
        const stateToSave = this.buildStateSnapshot();
        // Ring 8: Multi-Welt-Pfad. Pro Welt eigener Key, Index-Eintrag mit
        // lastPlayed aktualisieren. Wenn aus irgendeinem Grund keine
        // worldId existiert (sollte nach ensureWorldMeta nie passieren),
        // fallen wir auf den Legacy-Key zurück, damit der Spieler nicht
        // still verliert.
        const worldId = this.state.worldMeta && this.state.worldMeta.worldId;
        try {
            if (worldId) {
                localStorage.setItem(this.worldStorageKey(worldId), JSON.stringify(stateToSave));
                this.worldsIndexUpsert({
                    worldId,
                    slug: this.state.worldMeta.slug || "",
                    bornAt: this.state.worldMeta.bornAt || Date.now(),
                    lastPlayed: Date.now(),
                });
                this.activeWorldSet(worldId);
            } else {
                localStorage.setItem("anazhRealmState", JSON.stringify(stateToSave));
            }
            const lastVersion = this.state.versionHistory[this.state.versionHistory.length - 1];
            if (lastVersion !== this.state.currentVersion) {
                this.state.versionHistory.push(this.state.currentVersion);
            }
            if (this.state.versionHistory.length > this.state.maxVersionHistoryEntries) {
                this.state.versionHistory = this.state.versionHistory.slice(-this.state.maxVersionHistoryEntries);
            }
            localStorage.setItem("anazhRealmVersions", JSON.stringify(this.state.versionHistory));
            this.log("Zustand in localStorage gespeichert");
        } catch (error) {
            this.log(`localStorage-Speichern fehlgeschlagen: ${error.message}`, "ERROR");
        }
    }

    triggerStateDownload(stateToSave, suggestedName) {
        // Generischer Helper: stößt einen Browser-Download mit dem aktuellen
        // State an. Funktioniert auch auf CDN-Hosts ohne save-server.
        const dataStr =
            "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave, null, 2));
        const a = document.createElement("a");
        a.setAttribute("href", dataStr);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        const name = suggestedName || `anazhRealmState_${stamp}.json`;
        a.setAttribute("download", name);
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    // ### Welle 3 F — Welt-Tor ###
    // Welt-Info im Welt-Drawer: die Welt wird sichtbar als Welt, mit
    // Identität, Alter, Erinnerungen. Export = bestehender Save-Snapshot
    // mit slug im Dateinamen. Import = bestehender File-Picker — der lädt
    // jeden gültigen Snapshot.

    initWorldInfoUI() {
        const exportBtn = document.getElementById("world-export");
        const importBtn = document.getElementById("world-import");
        if (exportBtn) {
            exportBtn.addEventListener("click", () => {
                const m = this.state.worldMeta || {};
                const slug = (m.slug || "welt").replace(/[^a-z0-9_-]/gi, "");
                this.triggerStateDownload(this.buildStateSnapshot(), `anazh-realm-${slug}.json`);
                this.journalAppend("share", `Ich wurde als Datei nach außen getragen.`);
            });
        }
        if (importBtn) {
            importBtn.addEventListener("click", () => this.openStateFilePicker());
        }
        // Ring 8: Welt-Picker. „Neue Welt" öffnet einen Inline-Dialog für slug
        // + Person-Übernahme. Die Liste anderer Welten wird in updateWorldInfo
        // gerendert; pro Eintrag ein „wechseln"-Button + „löschen"-Button.
        const newBtn = document.getElementById("world-new");
        if (newBtn) {
            newBtn.addEventListener("click", () => this._openNewWorldDialog());
        }
        this.updateWorldInfo();
    }

    // Ring 11.5: Welt-Erstellungs-Dialog mit Modus + Rolle. Ersetzt die
    // alte prompt/confirm-Sequenz aus Ring 8 — UX-Sprung zum Native-<dialog>
    // mit Painterly-Stil. Drei Pfade:
    //   1) Allein → klassische private Welt (createNewWorld)
    //   2) Host → createNewWorld mit role="host", Auto-Start P2P nach Reload,
    //      Banner zeigt Einladungs-Code
    //   3) Joinen → joinWorldFromCode (kurze WS-Verbindung, world-request,
    //      world-snapshot, _importGuestWorld, Reload in die Guest-Welt)
    _openNewWorldDialog() {
        const dialog = document.getElementById("new-world-dialog");
        if (!dialog || typeof dialog.showModal !== "function") {
            // Fallback wenn <dialog> nicht supported (alte Browser, headless?)
            this._openNewWorldDialogLegacy();
            return;
        }
        const slugInput = document.getElementById("new-world-slug");
        const modeRadios = dialog.querySelectorAll('input[name="new-world-mode"]');
        const roleFieldset = dialog.querySelector(".new-world-role");
        const roleRadios = dialog.querySelectorAll('input[name="new-world-role"]');
        const joinRow = document.getElementById("new-world-join-row");
        const inviteInput = document.getElementById("new-world-invite");
        const inheritInput = document.getElementById("new-world-inherit");
        const statusEl = document.getElementById("new-world-status");
        const cancelBtn = document.getElementById("new-world-cancel");
        const confirmBtn = document.getElementById("new-world-confirm");

        // Reset state bei jedem Öffnen
        slugInput.value = "";
        inviteInput.value = "";
        inheritInput.checked = false;
        statusEl.textContent = "";
        confirmBtn.disabled = false;
        // Mode default auf solo
        for (const r of modeRadios) r.checked = r.value === "solo";
        for (const r of roleRadios) r.checked = r.value === "host";
        roleFieldset.hidden = true;
        joinRow.hidden = true;

        const updateConditionals = () => {
            const mode = dialog.querySelector('input[name="new-world-mode"]:checked').value;
            const role = dialog.querySelector('input[name="new-world-role"]:checked').value;
            roleFieldset.hidden = mode !== "multi";
            joinRow.hidden = !(mode === "multi" && role === "join");
        };
        for (const r of modeRadios) r.addEventListener("change", updateConditionals);
        for (const r of roleRadios) r.addEventListener("change", updateConditionals);

        const cleanup = () => {
            // Listener entfernen verhindert doppelte Bindings bei Re-Open
            for (const r of modeRadios) r.removeEventListener("change", updateConditionals);
            for (const r of roleRadios) r.removeEventListener("change", updateConditionals);
            cancelBtn.removeEventListener("click", onCancel);
            confirmBtn.removeEventListener("click", onConfirm);
        };

        const onCancel = () => {
            cleanup();
            dialog.close();
        };

        const onConfirm = async () => {
            const mode = dialog.querySelector('input[name="new-world-mode"]:checked').value;
            const slug = slugInput.value.trim();
            const inherit = !!inheritInput.checked;
            confirmBtn.disabled = true;
            statusEl.textContent = "";

            if (mode === "solo") {
                const id = this.createNewWorld({
                    slug: slug || null,
                    inheritPlayer: inherit,
                    reload: true,
                    role: "solo",
                });
                if (!id) statusEl.textContent = "Welt konnte nicht erschaffen werden — siehe Konsole.";
                cleanup();
                if (id) dialog.close();
                else confirmBtn.disabled = false;
                return;
            }

            const role = dialog.querySelector('input[name="new-world-role"]:checked').value;
            if (role === "host") {
                const id = this.createNewWorld({
                    slug: slug || null,
                    inheritPlayer: inherit,
                    reload: true,
                    role: "host",
                });
                if (!id) {
                    statusEl.textContent = "Welt konnte nicht erschaffen werden.";
                    confirmBtn.disabled = false;
                    return;
                }
                cleanup();
                dialog.close();
                return;
            }

            // role === "join"
            const code = inviteInput.value.trim();
            if (!code) {
                statusEl.textContent = "Bitte Einladungs-Code eingeben.";
                confirmBtn.disabled = false;
                return;
            }
            statusEl.textContent = "Verbinde mit Host…";
            const result = await this.joinWorldFromCode(code, { slugHint: slug || null });
            if (!result.ok) {
                const reason = {
                    invalid_code: "Einladungs-Code ist ungültig. Erwartet: anazh://host:port/raumId",
                    timeout: "Timeout — Host antwortet nicht. Läuft der signaling-server beim Host?",
                    ws_error: "Verbindung gescheitert — IP + Port + Firewall prüfen.",
                    ws_throw: "WebSocket konnte nicht geöffnet werden.",
                    import_failed: "Welt-Snapshot konnte nicht importiert werden.",
                    no_websocket: "Dieser Browser unterstützt WebSocket nicht.",
                };
                statusEl.textContent = reason[result.reason] || `Fehler: ${result.reason}`;
                confirmBtn.disabled = false;
                return;
            }
            statusEl.textContent = "Welt empfangen — lade…";
            cleanup();
            dialog.close();
            // Reload in die Guest-Welt
            try {
                window.location.reload();
            } catch {
                /* headless */
            }
        };

        cancelBtn.addEventListener("click", onCancel);
        confirmBtn.addEventListener("click", onConfirm);
        try {
            dialog.showModal();
        } catch {
            // Fallback bei modal-Konflikten
            this._openNewWorldDialogLegacy();
        }
    }

    // Legacy-Fallback (prompt/confirm) für Umgebungen ohne <dialog>-Support
    // oder bei UI-Fehlern. Ring 8 Original-Pfad.
    _openNewWorldDialogLegacy() {
        let slugRaw = "";
        try {
            slugRaw = window.prompt("Wie soll die neue Welt heißen? (leer = automatisch)", "") || "";
        } catch {
            slugRaw = "";
        }
        const slug = slugRaw.trim();
        let inherit = false;
        try {
            inherit = window.confirm(
                "Bisherige Person übernehmen?\n\n" +
                    "OK: deine Werkzeuge, Seele, eigene Materialien + Baupläne wandern mit.\n" +
                    "Abbrechen: frische Person in der neuen Welt."
            );
        } catch {
            inherit = false;
        }
        const newId = this.createNewWorld({ slug: slug || null, inheritPlayer: inherit, reload: true });
        if (!newId) {
            try {
                window.alert("Neue Welt konnte nicht erschaffen werden. Siehe Konsole.");
            } catch {
                /* headless */
            }
        }
    }

    updateWorldInfo() {
        const info = document.getElementById("world-info");
        if (!info) return;
        const m = this.state.worldMeta || {};
        const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
        const parents = Array.isArray(m.parentWorlds) ? m.parentWorlds.length : 0;
        const idShort = (m.worldId || "?").slice(0, 8);
        const archCount = (this.state.architectures || []).length;
        const bpCount = Object.keys(this.state.blueprints || {}).length;
        const journalCount = (this.state.worldJournal && this.state.worldJournal.entries.length) || 0;
        info.innerHTML = "";
        const line1 = document.createElement("div");
        line1.textContent = `Name: ${m.slug || "(noch namenlos)"}  |  ID: ${idShort}…`;
        const line2 = document.createElement("div");
        line2.textContent = `Alter: ${ageDays} Tag${ageDays === 1 ? "" : "e"}  |  Eltern-Welten: ${parents}`;
        const line3 = document.createElement("div");
        line3.textContent = `Inventar: ${archCount} Bauwerke, ${bpCount} Baupläne, ${journalCount} Erinnerungen`;
        info.appendChild(line1);
        info.appendChild(line2);
        info.appendChild(line3);
        this.renderWorldJournal();
        this._renderWorldPicker();
        this._renderWorldLineage();
        this._renderHostBanner();
        this._renderGuestBanner();
    }

    // Ring 11.5: Host-Banner. Sichtbar nur wenn worldMeta.role === "host".
    // Zeigt den Einladungs-Code, den der Host an Mitspieler weitergibt.
    // URL wird aus den LAN-Adressen des signaling-servers gewählt (im
    // welcome-Message vom Server gesendet). Fallback: aktuelle p2p.url.
    _renderHostBanner() {
        const banner = document.getElementById("world-host-banner");
        if (!banner) return;
        const role = this.state.worldMeta && this.state.worldMeta.role;
        if (role !== "host") {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        const worldId = this.state.worldMeta.worldId;
        if (!worldId) {
            banner.hidden = true;
            return;
        }
        // Bevorzuge LAN-Adresse, wenn vorhanden — sonst was im URL-Feld steht.
        const lanAddrs = (this.state.p2p && this.state.p2p.lanAddresses) || [];
        let inviteUrl;
        if (lanAddrs.length > 0) {
            inviteUrl = `ws://${lanAddrs[0]}`;
        } else {
            inviteUrl = (this.state.p2p && this.state.p2p.url) || "ws://127.0.0.1:4313";
        }
        const code = this.makeInvitationCode(inviteUrl, worldId) || "(Code-Erzeugung fehlgeschlagen)";
        const connected = this.state.p2p && this.state.p2p.connected;
        const peerCount = (this.state.p2p && this.state.p2p.peers && this.state.p2p.peers.size) || 0;
        banner.hidden = false;
        banner.innerHTML = "";
        const line1 = document.createElement("div");
        line1.innerHTML = `<strong>Du hostest diese Welt.</strong> Status: ${
            connected ? "Bereit für Mitspieler" : "Verbinde…"
        }${peerCount > 0 ? ` (${peerCount} verbunden)` : ""}`;
        const line2 = document.createElement("div");
        line2.style.marginTop = "0.35em";
        line2.textContent = "Einladungs-Code für Mitspieler:";
        const codeRow = document.createElement("div");
        codeRow.style.marginTop = "0.3em";
        codeRow.style.display = "flex";
        codeRow.style.alignItems = "center";
        codeRow.style.flexWrap = "wrap";
        codeRow.style.gap = "0.4em";
        const codeEl = document.createElement("code");
        codeEl.textContent = code;
        codeRow.appendChild(codeEl);
        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "invite-copy-btn";
        copyBtn.textContent = "kopieren";
        copyBtn.addEventListener("click", () => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code).then(
                    () => {
                        copyBtn.textContent = "kopiert!";
                        setTimeout(() => (copyBtn.textContent = "kopieren"), 1500);
                    },
                    () => {
                        copyBtn.textContent = "Code: " + code;
                    }
                );
            } else {
                copyBtn.textContent = "Code: " + code;
            }
        });
        codeRow.appendChild(copyBtn);
        banner.appendChild(line1);
        banner.appendChild(line2);
        banner.appendChild(codeRow);
        if (lanAddrs.length === 0) {
            const hint = document.createElement("div");
            hint.style.marginTop = "0.4em";
            hint.style.fontSize = "0.85em";
            hint.style.opacity = "0.8";
            hint.textContent =
                "Hinweis: Server hat noch keine LAN-Adresse zurückgemeldet. Der Code zeigt deine eingestellte URL — falls 127.0.0.1, müssen Mitspieler die Lan-IP manuell ersetzen.";
            banner.appendChild(hint);
        }
    }

    // Ring 11.5: Guest-Banner. Sichtbar wenn worldMeta.role === "guest".
    // Zeigt die Host-Verbindungs-Info als Orientierung.
    _renderGuestBanner() {
        const banner = document.getElementById("world-guest-banner");
        if (!banner) return;
        const role = this.state.worldMeta && this.state.worldMeta.role;
        if (role !== "guest") {
            banner.hidden = true;
            banner.innerHTML = "";
            return;
        }
        const hostInfo = this.state.worldMeta.hostInfo || {};
        const connected = this.state.p2p && this.state.p2p.connected;
        const peerCount = (this.state.p2p && this.state.p2p.peers && this.state.p2p.peers.size) || 0;
        banner.hidden = false;
        banner.innerHTML = "";
        const line1 = document.createElement("div");
        line1.innerHTML = `<strong>Du bist Gast in dieser Welt.</strong> Status: ${
            connected ? "Verbunden" : "Verbinde…"
        }${peerCount > 0 ? ` (${peerCount} im Raum)` : ""}`;
        const line2 = document.createElement("div");
        line2.style.marginTop = "0.35em";
        line2.style.fontSize = "0.88em";
        const url = hostInfo.url || "?";
        const room = hostInfo.roomId ? hostInfo.roomId.slice(0, 8) + "…" : "?";
        line2.textContent = `Host: ${url} · Raum: ${room}`;
        banner.appendChild(line1);
        banner.appendChild(line2);
    }

    // Ring 8: Welt-Picker rendert die Liste der anderen Welten im Index.
    // Pro Eintrag ein Container mit slug + Alter + zwei Buttons (wechseln /
    // löschen). Die aktive Welt wird ausgeblendet (sie steht oben in
    // „Diese Welt").
    _renderWorldPicker() {
        const list = document.getElementById("world-picker-list");
        if (!list) return;
        const idx = this.worldsIndexLoad();
        const activeId = (this.state.worldMeta && this.state.worldMeta.worldId) || null;
        const others = idx.filter((e) => e.worldId !== activeId);
        list.innerHTML = "";
        if (others.length === 0) {
            list.textContent = "Nur diese eine Welt im Speicher.";
            return;
        }
        // Frisch sortieren: zuletzt gespielt zuerst.
        others.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
        for (const entry of others) {
            const row = document.createElement("div");
            row.className = "world-picker-row";
            row.style.cssText =
                "display:flex; align-items:center; gap:0.5em; margin:0.3em 0; padding:0.3em 0; border-bottom:1px solid var(--brass-faint, rgba(160,120,60,0.18));";
            const label = document.createElement("div");
            label.style.cssText = "flex:1; min-width:0;";
            const ageDays = entry.bornAt ? Math.floor((Date.now() - entry.bornAt) / 86400000) : 0;
            label.textContent = `${entry.slug || "(namenlos)"} — ${ageDays}d, ID ${entry.worldId.slice(0, 8)}…`;
            const switchBtn = document.createElement("button");
            switchBtn.type = "button";
            switchBtn.textContent = "wechseln";
            switchBtn.addEventListener("click", () => {
                this.switchToWorld(entry.worldId, { reload: true });
            });
            const recipesBtn = document.createElement("button");
            recipesBtn.type = "button";
            recipesBtn.textContent = "Rezepte holen";
            recipesBtn.title = "Baupläne + Materialien + Werkzeuge aus dieser Welt in die aktive importieren";
            recipesBtn.addEventListener("click", () => {
                let confirmed = false;
                try {
                    confirmed = window.confirm(
                        `Rezepte aus „${entry.slug}" in deine aktuelle Welt importieren? Konflikte bekommen -import-Suffix.`
                    );
                } catch {
                    confirmed = true;
                }
                if (!confirmed) return;
                const result = this.importRecipesFromWorld(entry.worldId);
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    if (result.ok) {
                        const c = result.counts;
                        line.textContent = `Aus „${entry.slug}" empfangen: ${c.blueprints} Baupläne, ${c.materials} Materialien, ${c.tools} Werkzeuge.`;
                    } else {
                        line.textContent = `Rezept-Import fehlgeschlagen: ${result.reason}`;
                    }
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            });
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.textContent = "löschen";
            delBtn.addEventListener("click", () => {
                let confirmed = false;
                try {
                    confirmed = window.confirm(
                        `Welt „${entry.slug}" wirklich löschen? Das kann nicht rückgängig gemacht werden.`
                    );
                } catch {
                    confirmed = true;
                }
                if (confirmed) {
                    this.deleteWorld(entry.worldId);
                    this._renderWorldPicker();
                }
            });
            row.appendChild(label);
            row.appendChild(switchBtn);
            row.appendChild(recipesBtn);
            row.appendChild(delBtn);
            list.appendChild(row);
        }
    }

    // Gescrolltes Tagebuch im Welt-Drawer: alle Erinnerungen, jüngste oben.
    // Wird jeweils komplett neu gerendert; bei entryCap = 200 ist DOM-Cost
    // gering. Aufruf-Takt = `updateWorldInfo` (5s im Game-Loop).
    renderWorldJournal() {
        const list = document.getElementById("world-journal-list");
        const countEl = document.getElementById("world-journal-count");
        if (!list) return;
        const entries = (this.state.worldJournal && this.state.worldJournal.entries) || [];
        if (countEl) {
            countEl.textContent =
                entries.length === 0
                    ? "Keine Erinnerungen"
                    : `${entries.length} Erinnerung${entries.length === 1 ? "" : "en"}`;
        }
        // Cache-Signatur: Anzahl + jüngster Eintrag (Inhalt + Zeit). Wenn
        // unverändert, DOM nicht anrühren — der Aufruf läuft alle 5s.
        const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
        const signature = entries.length + ":" + (lastEntry ? `${lastEntry.id}:${lastEntry.at}` : "0");
        if (list.dataset.signature === signature) return;
        list.dataset.signature = signature;
        list.innerHTML = "";
        if (entries.length === 0) {
            const empty = document.createElement("div");
            empty.className = "journal-empty";
            empty.textContent = "Noch keine Erinnerungen geschrieben.";
            list.appendChild(empty);
            return;
        }
        const now = Date.now();
        // Jüngste zuerst — das Tagebuch liest sich rückwärts wie ein
        // Logbuch. Erste Genesis bleibt aber durch Scrollen erreichbar.
        for (let i = entries.length - 1; i >= 0; i--) {
            const e = entries[i];
            const row = document.createElement("div");
            row.className = "journal-entry";
            const type = document.createElement("span");
            type.className = "journal-type";
            type.textContent = e.type || "note";
            const age = document.createElement("span");
            age.className = "journal-age";
            age.textContent = this._formatJournalAge(now - (e.at || now));
            const text = document.createElement("span");
            text.textContent = e.text || "";
            row.appendChild(type);
            row.appendChild(age);
            row.appendChild(text);
            list.appendChild(row);
        }
    }

    _formatJournalAge(deltaMs) {
        if (!Number.isFinite(deltaMs) || deltaMs < 0) return "";
        const s = Math.floor(deltaMs / 1000);
        if (s < 30) return "eben";
        if (s < 60) return `vor ${s}s`;
        const m = Math.floor(s / 60);
        if (m < 60) return `vor ${m}m`;
        const h = Math.floor(m / 60);
        if (h < 24) return `vor ${h}h`;
        const d = Math.floor(h / 24);
        return `vor ${d}t`;
    }

    isSaveServerHost() {
        const href = typeof window !== "undefined" ? window.location.href : "";
        return /^https?:\/\/(127\.0\.0\.1|localhost):4312\//.test(href);
    }

    async saveToProjectFolder(options = {}) {
        // Drei Pfade:
        //   - Spiel läuft auf dem lokalen save-server → POST /api/save-state.
        //   - Spiel läuft anderswo + fallbackToDownload=true → Browser-Download.
        //   - Spiel läuft anderswo + fallbackToDownload=false (Auto-Save) → still aussteigen.
        const { fallbackToDownload = true } = options;
        const stateToSave = this.buildStateSnapshot();

        if (!this.isSaveServerHost()) {
            if (fallbackToDownload) {
                this.triggerStateDownload(stateToSave);
                this.log("Zustand als Datei heruntergeladen (kein lokaler save-server erreichbar)");
                return "download";
            }
            this.log("Auto-Save übersprungen (kein lokaler save-server)", "DEBUG");
            return false;
        }

        try {
            const response = await fetch("http://localhost:4312/api/save-state", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fileName: "anazhRealmState.json",
                    state: stateToSave,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const result = await response.json();
            this.log(`Zustand direkt im Spielordner gespeichert: ${result.path || "anazhRealmState.json"}`);
            return "server";
        } catch (error) {
            if (!fallbackToDownload) {
                this.log(`Direktes Speichern im Spielordner fehlgeschlagen (${error.message})`, "ERROR");
                return false;
            }
            this.triggerStateDownload(stateToSave);
            this.log(
                `Direktes Speichern im Spielordner fehlgeschlagen (${error.message}). Download-Fallback gestartet`,
                "ERROR"
            );
            return "download";
        }
    }

    pruneDistantChunks(playerPos) {
        if (!playerPos || !this.state.chunkMap || this.state.chunkMap.size <= this.state.maxLoadedChunks) return;
        // Welt ist um (0,0,0) zentriert, initial chunks haben Index 0..7 für
        // Welt-Bereich -150..+150. Ohne den +150-Offset rechnete der Prune-
        // Code den Spieler bei x=0 auf chunkX=0 (Welt-Linkskante), wodurch
        // genau die Chunks um den Spieler herum als „weit weg" galten und
        // gelöscht wurden, sobald der Cache voll war — daher das Schach-
        // brettmuster, wenn der Spieler über die initialen 8×8 hinaus lief.
        const { chunkWorldSize } = this._chunkGeometry();
        const playerChunkX = Math.floor((playerPos.x + 150) / chunkWorldSize);
        const playerChunkZ = Math.floor((playerPos.z + 150) / chunkWorldSize);

        const sortable = [];
        for (const [key, entry] of this.state.chunkMap.entries()) {
            const [cx, cz] = key.split(",").map(Number);
            const dist = Math.abs(cx - playerChunkX) + Math.abs(cz - playerChunkZ);
            sortable.push({ key, entry, dist });
        }
        sortable.sort((a, b) => b.dist - a.dist);

        const removeCount = this.state.chunkMap.size - this.state.maxLoadedChunks;
        for (let i = 0; i < removeCount; i++) {
            const target = sortable[i];
            if (!target) break;
            const chunk = target.entry.mesh;
            if (chunk) {
                this.state.scene.remove(chunk);
                const body = chunk.userData?.physicsBody;
                if (body && this.state.physicsWorld) {
                    this.state.physicsWorld.removeRigidBody(body);
                    Ammo.destroy(body);
                }
                this.state.rigidBodies = this.state.rigidBodies.filter((rb) => rb !== chunk);
                if (chunk.geometry) chunk.geometry.dispose();
            }
            this.state.groundChunks = this.state.groundChunks.filter((c) => c !== chunk);
            this.state.chunkMap.delete(target.key);
        }
        this.log(`Chunk-Cache bereinigt: ${this.state.chunkMap.size} aktive Chunks`, "DEBUG");
    }

    loadState(externalState = null) {
        // Drei Quellen werden unterstützt: localStorage (Default), externes
        // Objekt (z. B. aus File-Upload), oder gar nichts (frühes init()).
        // Ring 8: localStorage-Pfad geht über die aktive worldId, fällt
        // notfalls auf den Legacy-Single-Key zurück (Migration ist beim
        // Pre-Load passiert, aber Defensive bleibt drin).
        let state = externalState;
        if (!state) {
            const activeId = this.activeWorldGet();
            let savedState = null;
            if (activeId) {
                savedState = localStorage.getItem(this.worldStorageKey(activeId));
            }
            if (!savedState) {
                savedState = localStorage.getItem("anazhRealmState");
            }
            if (!savedState) return false;
            try {
                state = JSON.parse(savedState);
            } catch (error) {
                this.log(`Speicherstand ist ungültiges JSON: ${error.message}`, "ERROR");
                return false;
            }
        }

        const playerPosition = state.playerPosition || { x: 0, y: 5, z: 0 };
        const safeX = Number.isFinite(playerPosition.x) ? playerPosition.x : 0;
        const safeY = Number.isFinite(playerPosition.y) ? playerPosition.y : 5;
        const safeZ = Number.isFinite(playerPosition.z) ? playerPosition.z : 0;
        // Ring 8.2: loadState markiert die Welt als „bereits einmal generiert",
        // damit das auf init() folgende generateNewWorld() den Spieler nicht
        // auf (0, 50, 0) teleportiert. Die geladene Position bleibt damit
        // intakt. Brand-neue Welten (loadState findet nichts) lassen das Flag
        // auf false, und der erste generateNewWorld-Lauf setzt den Spieler
        // wie bisher auf den Default-Spawn.
        this.state.terrainEverGenerated = true;
        if (this.state.playerMesh) {
            this.state.playerMesh.position.set(safeX, safeY, safeZ);
            this.state.playerMesh.visible = true;
            if (this.state.playerBody && this.state.tmpTransform && this.state.tmpVec1) {
                const t = this.state.tmpTransform;
                t.setIdentity();
                t.setOrigin(
                    this.setVec(
                        this.state.tmpVec1,
                        safeX / this.state.scaleFactor,
                        safeY / this.state.scaleFactor,
                        safeZ / this.state.scaleFactor
                    )
                );
                this.state.playerBody.setWorldTransform(t);
                this.state.playerBody.setLinearVelocity(this.setVec(this.state.tmpVec2, 0, 0, 0));
            }
            this.log(`Spielerposition geladen: (${safeX}, ${safeY}, ${safeZ})`);
        }
        this.state.knowledgeBase = state.knowledgeBase || [];
        this.state.selfAwareness = state.selfAwareness || { components: [], weaknesses: [] };
        this.state.creatureEmotions = state.creatureEmotions || [];
        this.state.terrainSteepness = state.terrainSteepness || 1.0;
        this.state.terrainBaseHeight = state.terrainBaseHeight || 0.0;
        this.state.weather = state.weather || "sunny";
        if (this.state.skybox) this.updateSkyboxWeather();
        // Ring 2 / Ring 8+ Felder. Best-Effort-Migration: alte Saves haben
        // weder worldMeta noch dslAbilities — wir füllen mit Defaults + Log.
        if (state.worldMeta && typeof state.worldMeta === "object") {
            this.state.worldMeta = { ...this.state.worldMeta, ...state.worldMeta };
        } else {
            this.log("Save-Migration: kein worldMeta gefunden, generiere neue Welt-Identität", "INFO");
        }
        // Ring 10.5: chunkDeltas defensiv normalisieren. Alte Saves haben
        // das Feld nicht → leere Map. Vorhandene Ops werden sanitisiert
        // (gültiger type, finite Zahlen, Cap pro Chunk eingehalten).
        this._sanitizeChunkDeltas();
        // Ring 3: Emotionen wiederherstellen. Nur bekannte Achsen übernehmen,
        // damit alte Saves mit Tippfehlern keine fremden Keys einschleusen.
        // Ring 5: Spieler-Seele wiederherstellen. Wenn das Mesh schon
        // existiert (loadState wird auch nach Init aufgerufen, z. B. via
        // "Lade Zustand"), wenden wir die Seele sofort an. Vor dem Mesh-Bau
        // merkt sich applyPlayerSoul den Namen und der Init-Pfad wendet ihn
        // nach Mesh-Erstellung an.
        if (typeof state.playerSoul === "string" && this.playerSoulDefs[state.playerSoul]) {
            this.applyPlayerSoul(state.playerSoul);
        }
        // Ring 6: Bau-Werke wiederherstellen. Bestehende Strukturen werden
        // tief disposed, dann jede aus {type, position, seed} neu gebaut.
        // Idempotent — mehrfaches loadState führt nicht zu Mesh-Verdopplung.
        // Welle 4 Phase 1 — Materialien VOR Bauplänen restaurieren, damit
        // Part-Material-Referenzen während validateBlueprintParts auflösen.
        if (Array.isArray(state.materials)) {
            let restoredMats = 0;
            for (const m of state.materials) {
                if (!m || typeof m.name !== "string") continue;
                if (this.state.materials[m.name] && this.state.materials[m.name].builtIn) continue;
                const r = this.defineMaterial(m.name, m.color, m.tags || {});
                if (r.ok) restoredMats++;
            }
            this.log(`Materialien geladen: ${restoredMats} eigene`);
        }
        // Ring 6.4 — eigene Baupläne ZUERST registrieren, danach die
        // Architekturen rekonstruieren. Sonst wären Strukturen, die einen
        // User-Bauplan referenzieren, nicht renderbar (Builder fehlt).
        if (Array.isArray(state.blueprints)) {
            for (const bp of state.blueprints) {
                if (!bp || typeof bp.name !== "string" || !Array.isArray(bp.parts)) continue;
                // Built-in nicht überschreiben — sicherheitshalber prefixen
                // oder skip wenn Name kollidiert.
                if (this.state.blueprints[bp.name] && this.state.blueprints[bp.name].builtIn) continue;
                // Welle 4 Phase 1+3 — Migration alter Parts: kein material →
                // Default „stein", keine opChain → Default-Kette. Sicheres
                // Default, keine Datenverluste.
                const migratedParts = bp.parts.map((p) => {
                    if (!p || typeof p !== "object") return p;
                    const out = { ...p };
                    if (typeof out.material !== "string" || !this.state.materials[out.material]) {
                        out.material = "stein";
                    }
                    if (!Array.isArray(out.opChain) || out.opChain.length === 0) {
                        out.opChain = this._defaultPartOpChain();
                    }
                    return out;
                });
                // Welle 5 A — connections sanitisieren beim Load.
                const validConnections = this.validateBlueprintConnections(bp.connections || [], migratedParts.length);
                const restored = {
                    name: bp.name,
                    label: bp.label || bp.name,
                    builtIn: false,
                    parts: migratedParts,
                    connections: validConnections,
                };
                // Welle 5 C — role + toolMeta beim Load wiederherstellen.
                if (
                    bp.role === "tool" &&
                    bp.toolMeta &&
                    AnazhRealm.TOOL_OP_CLASSES.has(bp.toolMeta.opClass) &&
                    AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(bp.toolMeta.opName || ""))
                ) {
                    restored.role = "tool";
                    restored.toolMeta = { opName: bp.toolMeta.opName, opClass: bp.toolMeta.opClass };
                }
                this.state.blueprints[bp.name] = restored;
            }
            this.log(`Baupläne geladen: ${state.blueprints.length} eigene`);
        }
        // Welle 5 C — eigene Werkzeuge wiederherstellen. Validiert opClass +
        // opName + Schutz vor Override existierender Starter. precisionCap
        // wird ge-clampt 0..1. Aufruf NACH Bauplänen, damit sourceBlueprint
        // optional schon existiert.
        if (Array.isArray(state.tools)) {
            let restoredTools = 0;
            for (const t of state.tools) {
                if (!t || typeof t.name !== "string") continue;
                if (this.state.tools[t.name] && this.state.tools[t.name].builtIn) continue;
                if (!AnazhRealm.TOOL_OP_CLASSES.has(t.opClass)) continue;
                if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(String(t.opName || ""))) continue;
                const cap = Number(t.precisionCap);
                this.state.tools[t.name] = {
                    name: t.name,
                    label: t.label || t.name,
                    opClass: t.opClass,
                    opName: t.opName,
                    precisionCap: Number.isFinite(cap) ? Math.max(0, Math.min(1, cap)) : 0.4,
                    isStarter: false,
                    builtIn: false,
                    sourceBlueprint: typeof t.sourceBlueprint === "string" ? t.sourceBlueprint : null,
                };
                if (!this.state.player.tools.includes(t.name)) this.state.player.tools.push(t.name);
                restoredTools++;
            }
            if (restoredTools > 0) this.log(`Eigene Werkzeuge geladen: ${restoredTools}`);
        }
        if (Array.isArray(state.architectures) && this.state.scene) {
            for (const old of this.state.architectures) {
                if (old.mesh) {
                    this._cullArchitectureMesh(old);
                }
            }
            this.state.architectures = [];
            for (const a of state.architectures) {
                if (!a || typeof a.type !== "string" || !a.position) continue;
                this.spawnArchitecture(a.type, a.position, { seed: a.seed, scale: a.scale });
            }
            this.log(`Architekturen geladen: ${state.architectures.length}`);
        }
        // Ring 6.5 — Hotbar wiederherstellen. Nur 9 Slots, ungültige Einträge
        // (Bauplan nicht registriert) auf null fallen lassen.
        if (Array.isArray(state.hotbar)) {
            const restored = [];
            for (let i = 0; i < 9; i++) {
                const name = state.hotbar[i];
                if (typeof name === "string" && this.state.blueprints[name]) {
                    restored.push(name);
                } else {
                    restored.push(null);
                }
            }
            this.state.hotbar = restored;
            this._renderHotbarDOM();
            this.log(`Hotbar geladen: ${restored.filter((s) => s).length} Slots belegt`);
        }
        // Welle 4 Phase 3 — Werkzeug-Besitz wiederherstellen. Starter bleiben
        // immer drin (sie kommen aus _defaultTools), eigene werden zugefügt.
        if (Array.isArray(state.playerTools)) {
            const valid = state.playerTools.filter((n) => typeof n === "string" && this.state.tools[n]);
            const set = new Set([...(this.state.player.tools || []), ...valid]);
            this.state.player.tools = Array.from(set);
        }
        if (state.playerEmotions && typeof state.playerEmotions === "object") {
            for (const axis of Object.keys(this.state.player.emotions)) {
                const v = Number(state.playerEmotions[axis]);
                if (Number.isFinite(v)) {
                    this.state.player.emotions[axis] = Math.max(0, Math.min(1, v));
                }
            }
        }
        if (Array.isArray(state.dslAbilities)) {
            // Phase 4: dslAbilities ist die Quelle der Wahrheit. Wir
            // rehydrieren das Array und legen die zugehörigen Wrapper in
            // state.abilities ab, damit „Führe Fähigkeit aus" + Keyboard-
            // Loop funktionieren. Idempotent: Dubletten überschreiben sich.
            this.state.dsl.abilities = state.dslAbilities;
            for (const a of state.dslAbilities) {
                if (a && typeof a.name === "string" && Array.isArray(a.program)) {
                    this.state.abilities[a.name] = () => this.dslRun(a.program, { source: `ability:${a.name}` });
                }
            }
            this.log(`DSL-Abilities geladen: ${state.dslAbilities.length}`);
        }
        if (Array.isArray(state.dslHistory)) {
            this.state.dsl.history = state.dslHistory.slice(-this.state.dsl.historyCap);
        }
        // Schicht 1 — Pattern-Memory rehydrieren. Alte Saves (vor 7.72) haben
        // das Feld nicht; dann starten wir mit leerem Memory, der Loop füllt es.
        if (state.dslPatternMemory && typeof state.dslPatternMemory === "object") {
            this.state.dsl.patternMemory = {};
            for (const [kw, list] of Object.entries(state.dslPatternMemory)) {
                if (!Array.isArray(list)) continue;
                this.state.dsl.patternMemory[kw] = list
                    .filter((e) => e && Array.isArray(e.program) && typeof e.fitness === "number")
                    .slice(0, this.state.dsl.patternMemoryCapPerKey || 8);
            }
        }
        // Pfad-Buckets rehydrieren. Defensive Merge — fremde Keys werden
        // ignoriert, fehlende Keys auf 0 gesetzt.
        if (state.playerPathBuckets && typeof state.playerPathBuckets === "object") {
            const target = this.state.player.pathBuckets;
            for (const group of Object.keys(target)) {
                const src = state.playerPathBuckets[group];
                if (!src || typeof src !== "object") continue;
                for (const k of Object.keys(target[group])) {
                    if (typeof src[k] === "number") target[group][k] = src[k];
                }
            }
        }
        // Welle 1 D — Welt-Journal. Alte Saves (<7.73) haben das Feld nicht;
        // dann startet das Journal leer und ensureWorldMeta schreibt die
        // Genesis-Erinnerung beim ersten Tick.
        if (state.worldJournal && typeof state.worldJournal === "object") {
            const j = state.worldJournal;
            if (Array.isArray(j.entries)) {
                this.state.worldJournal.entries = j.entries
                    .filter((e) => e && typeof e.text === "string")
                    .slice(-this.state.worldJournal.entryCap);
            }
            if (j.seen && typeof j.seen === "object") {
                this.state.worldJournal.seen = { ...j.seen };
            }
        }
        if (Array.isArray(state.abilities)) {
            // Legacy-Save (vor Phase 4): Namensliste statt DSL-Programme.
            // `restoreAbility` mappt drei historische Nexus-Namen direkt auf
            // ihre DSL-Äquivalente; unbekannte Namen werden geloggt und
            // verworfen — die alten JS-Bodies sind im Save eh nicht
            // enthalten gewesen.
            let restored = 0;
            state.abilities.forEach((name) => {
                if (this.state.abilities[name]) return;
                if (this.restoreAbility(name)) restored++;
            });
            if (restored > 0) this.log(`Legacy-Fähigkeiten migriert: ${restored}`);
        }
        // Bei externer Quelle: in localStorage spiegeln, damit ein Reload
        // den importierten Stand behält. Ring 8: Per-Welt-Key + Index, sonst
        // Legacy-Fallback. Externe Quelle kann eine fremde worldId tragen —
        // wir nehmen sie an, registrieren sie und setzen sie als aktiv.
        if (externalState) {
            try {
                const m = externalState.worldMeta;
                const targetId =
                    (m && typeof m.worldId === "string" && m.worldId) ||
                    (this.state.worldMeta && this.state.worldMeta.worldId) ||
                    null;
                if (targetId) {
                    localStorage.setItem(this.worldStorageKey(targetId), JSON.stringify(externalState));
                    this.worldsIndexUpsert({
                        worldId: targetId,
                        slug: (m && m.slug) || (this.state.worldMeta && this.state.worldMeta.slug) || "",
                        bornAt: (m && m.bornAt) || Date.now(),
                        lastPlayed: Date.now(),
                    });
                    this.activeWorldSet(targetId);
                } else {
                    // Fallback nur, wenn weder externe noch aktive worldId existiert.
                    localStorage.setItem("anazhRealmState", JSON.stringify(externalState));
                }
            } catch (e) {
                this.log(`localStorage-Persistenz nach Import fehlgeschlagen: ${e.message}`, "WARNING");
            }
        }
        this.log(externalState ? "Zustand aus Datei geladen" : "Zustand geladen");

        if (!externalState) {
            const savedVersions = localStorage.getItem("anazhRealmVersions");
            if (savedVersions) {
                this.state.versionHistory = JSON.parse(savedVersions);
            }
        }
        return true;
    }

    openStateFilePicker() {
        // Verwendet das versteckte <input type="file"> in index.html.
        const input = document.getElementById("state-file-input");
        if (!input) {
            this.log("File-Input #state-file-input fehlt – index.html prüfen", "ERROR");
            return;
        }
        input.value = ""; // erlaubt Re-Upload derselben Datei
        input.click();
    }

    handleStateFile(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                if (typeof parsed !== "object" || parsed === null) {
                    throw new Error("JSON-Wurzel muss ein Objekt sein");
                }
                // Ring 9: Import läuft jetzt durch das Welt-Tor — Drei-Wahl-
                // Dialog. Wir merken uns den geparsten Snapshot in
                // state.pendingImport und zeigen den Dialog; die Buttons
                // entscheiden, ob ersetzt, daneben gelegt oder (Ring 10)
                // fusioniert wird. Schließen des Dialogs verwirft den Import.
                this._openWeltTorDialog(parsed, file);
            } catch (e) {
                this.log(`Import fehlgeschlagen (${file.name}): ${e.message}`, "ERROR");
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    line.textContent = `Import fehlgeschlagen: ${e.message}`;
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
            }
        };
        reader.onerror = () => {
            this.log(`FileReader-Fehler beim Lesen von ${file.name}`, "ERROR");
        };
        reader.readAsText(file);
    }

    // ### Ring 9 — Welt-Tor (Drei-Wahl-Import-Dialog) ###
    //
    // Eingehende Welt-JSON-Datei wird in `state.pendingImport` zwischen-
    // gespeichert; der Dialog präsentiert drei Pfade. Schließen ohne Wahl
    // verwirft. Ersetzen ist der Pfad, der vor Ring 9 als einziger existierte.
    // Daneben legen gibt der Welt eine NEUE worldId mit parentWorlds-Spur,
    // damit beide Welten parallel im Index leben. Fusionieren ist stub für
    // Ring 10.

    initWeltTorUI() {
        const dialog = document.getElementById("world-tor-dialog");
        if (!dialog) return;
        const replaceBtn = document.getElementById("world-tor-replace");
        const besideBtn = document.getElementById("world-tor-beside");
        const fuseBtn = document.getElementById("world-tor-fuse");
        const cancelBtn = document.getElementById("world-tor-cancel");
        if (replaceBtn) replaceBtn.addEventListener("click", () => this._weltTorImportReplace());
        if (besideBtn) besideBtn.addEventListener("click", () => this._weltTorImportBeside());
        if (fuseBtn) fuseBtn.addEventListener("click", () => this._weltTorImportFuse());
        if (cancelBtn) cancelBtn.addEventListener("click", () => this._closeWeltTorDialog());
        // Esc-Key schließt den Dialog (native <dialog>-Verhalten) — wir
        // verwerfen den pendingImport explizit, damit kein verwaister
        // Snapshot zurückbleibt.
        dialog.addEventListener("close", () => {
            this.state.pendingImport = null;
        });
    }

    _openWeltTorDialog(parsed, file) {
        this.state.pendingImport = { parsed, fileName: (file && file.name) || "unbekannt" };
        const dialog = document.getElementById("world-tor-dialog");
        const summary = document.getElementById("world-tor-summary");
        if (summary) {
            const m = parsed.worldMeta || {};
            const slug = m.slug || "(namenlos)";
            const ageDays = m.bornAt ? Math.floor((Date.now() - m.bornAt) / 86400000) : 0;
            const idShort = (m.worldId || "?").slice(0, 8);
            const bp = Array.isArray(parsed.blueprints) ? parsed.blueprints.length : 0;
            const arch = Array.isArray(parsed.architectures) ? parsed.architectures.length : 0;
            const journal =
                parsed.worldJournal && Array.isArray(parsed.worldJournal.entries)
                    ? parsed.worldJournal.entries.length
                    : 0;
            summary.textContent = `„${slug}" (ID ${idShort}…, ${ageDays} Tag${ageDays === 1 ? "" : "e"} alt, ${arch} Bauwerke, ${bp} eigene Baupläne, ${journal} Erinnerungen) klopft an dein Tor. Wie willst du sie empfangen?`;
        }
        if (dialog && typeof dialog.showModal === "function") {
            try {
                dialog.showModal();
            } catch {
                // Bereits offen — kein Drama, der State ist bereits gesetzt.
            }
        } else if (dialog) {
            dialog.setAttribute("open", "open");
        }
    }

    _closeWeltTorDialog() {
        const dialog = document.getElementById("world-tor-dialog");
        if (dialog && typeof dialog.close === "function") {
            try {
                dialog.close();
            } catch {
                // ignore
            }
        } else if (dialog) {
            dialog.removeAttribute("open");
        }
        this.state.pendingImport = null;
    }

    _weltTorImportReplace() {
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const parsed = pending.parsed;
        const fileName = pending.fileName;
        // Aktuelle Welt wird überschrieben — der Welt-Drawer trägt ab jetzt
        // die importierte Identität. loadState(parsed) ist der bisherige
        // Pfad (vor Ring 9 war das der einzige).
        this.loadState(parsed);
        const chatOutput = document.getElementById("chat-output");
        if (chatOutput) {
            const line = document.createElement("div");
            line.textContent = `Datei ${fileName} importiert — aktuelle Welt wurde ersetzt.`;
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
        this.journalAppend("witness", "Eine fremde Welt hat mich ersetzt.");
        this._closeWeltTorDialog();
    }

    _weltTorImportBeside() {
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const parsed = pending.parsed;
        const fileName = pending.fileName;
        const result = this.importWorldBeside(parsed);
        const chatOutput = document.getElementById("chat-output");
        if (chatOutput) {
            const line = document.createElement("div");
            if (result.ok) {
                line.textContent = `Datei ${fileName} liegt nun als „${result.slug}" neben dir (ID ${result.worldId.slice(0, 8)}…).`;
            } else {
                line.textContent = `Daneben legen fehlgeschlagen: ${result.reason}`;
            }
            chatOutput.appendChild(line);
            chatOutput.scrollTop = chatOutput.scrollHeight;
        }
        if (result.ok) {
            this.journalAppend("witness", `Eine andere Welt „${result.slug}" liegt nun neben mir.`);
            this.updateWorldInfo();
        }
        this._closeWeltTorDialog();
    }

    _weltTorImportFuse() {
        // Ring 10: importierte Welt wird zuerst silent „daneben gelegt"
        // (damit sie eine worldId im Index hat), dann öffnen wir den Fusions-
        // Dialog mit ihr als Eltern-B-Vorauswahl. Eine-Klick-UX vom Datei-
        // Empfang zur Verschmelzung. Vor Ring 10 war dies ein Stub-Pfad.
        const pending = this.state.pendingImport;
        if (!pending || !pending.parsed) {
            this._closeWeltTorDialog();
            return;
        }
        const result = this.importWorldBeside(pending.parsed);
        this._closeWeltTorDialog();
        if (result.ok) {
            this.updateWorldInfo();
            this._openWorldFusionDialog({ preselectB: result.worldId });
        } else {
            const chatOutput = document.getElementById("chat-output");
            if (chatOutput) {
                const line = document.createElement("div");
                line.textContent = `Fusion-Vorbereitung fehlgeschlagen: ${result.reason}`;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
        }
    }

    // ### Ring 10 — Fusion-UI ###
    //
    // Drei Methoden:
    //   - initWorldFusionUI()        einmaliges Wiring beim init()
    //   - _openWorldFusionDialog()   füllt Dropdown + zeigt Dialog
    //   - _confirmWorldFusion()      liest Form-Werte, ruft fuseWorlds(reload:true)

    initWorldFusionUI() {
        const openBtn = document.getElementById("world-fuse-open");
        if (openBtn) openBtn.addEventListener("click", () => this._openWorldFusionDialog());
        const cancelBtn = document.getElementById("world-fusion-cancel");
        if (cancelBtn) cancelBtn.addEventListener("click", () => this._closeWorldFusionDialog());
        const confirmBtn = document.getElementById("world-fusion-confirm");
        if (confirmBtn) confirmBtn.addEventListener("click", () => this._confirmWorldFusion());
    }

    _openWorldFusionDialog({ preselectB = null } = {}) {
        const dialog = document.getElementById("world-fusion-dialog");
        if (!dialog) return;
        const parentALabel = document.getElementById("world-fusion-parent-a-label");
        const parentBSelect = document.getElementById("world-fusion-parent-b");
        const slugInput = document.getElementById("world-fusion-slug");
        const activeId = this.state.worldMeta && this.state.worldMeta.worldId;
        const activeSlug = (this.state.worldMeta && this.state.worldMeta.slug) || "(diese Welt)";
        if (parentALabel) parentALabel.textContent = activeSlug;
        if (parentBSelect) {
            parentBSelect.innerHTML = "";
            const others = this.worldsIndexLoad().filter((e) => e.worldId !== activeId);
            if (others.length === 0) {
                const opt = document.createElement("option");
                opt.value = "";
                opt.textContent = "— keine andere Welt im Speicher —";
                opt.disabled = true;
                parentBSelect.appendChild(opt);
            } else {
                others.sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
                for (const e of others) {
                    const opt = document.createElement("option");
                    opt.value = e.worldId;
                    opt.textContent = `${e.slug || "(namenlos)"} — ID ${e.worldId.slice(0, 8)}…`;
                    if (preselectB && e.worldId === preselectB) opt.selected = true;
                    parentBSelect.appendChild(opt);
                }
            }
        }
        if (slugInput) slugInput.value = "";
        // Strategie auf Default „sequence"
        const seqRadio = document.querySelector('input[name="fusion-strategy"][value="sequence"]');
        if (seqRadio) seqRadio.checked = true;
        if (typeof dialog.showModal === "function") {
            try {
                dialog.showModal();
            } catch {
                /* bereits offen */
            }
        } else {
            dialog.setAttribute("open", "open");
        }
    }

    _closeWorldFusionDialog() {
        const dialog = document.getElementById("world-fusion-dialog");
        if (!dialog) return;
        if (typeof dialog.close === "function") {
            try {
                dialog.close();
            } catch {
                /* ignore */
            }
        } else {
            dialog.removeAttribute("open");
        }
    }

    _confirmWorldFusion() {
        const parentBSelect = document.getElementById("world-fusion-parent-b");
        const slugInput = document.getElementById("world-fusion-slug");
        const strategyRadio = document.querySelector('input[name="fusion-strategy"]:checked');
        const activeId = this.state.worldMeta && this.state.worldMeta.worldId;
        const parentBId = parentBSelect && parentBSelect.value;
        const strategy = (strategyRadio && strategyRadio.value) || "sequence";
        const slug = (slugInput && slugInput.value.trim()) || null;
        const chatOutput = document.getElementById("chat-output");
        const speak = (text) => {
            if (chatOutput) {
                const line = document.createElement("div");
                line.textContent = text;
                chatOutput.appendChild(line);
                chatOutput.scrollTop = chatOutput.scrollHeight;
            }
        };
        if (!activeId) {
            speak("Fusion verweigert: aktive Welt fehlt.");
            return;
        }
        if (!parentBId) {
            speak("Fusion verweigert: keine zweite Welt gewählt.");
            return;
        }
        const result = this.fuseWorlds(activeId, parentBId, strategy, { slug, reload: true });
        if (!result.ok) {
            speak(`Fusion fehlgeschlagen: ${result.reason}`);
            this._closeWorldFusionDialog();
        }
        // Bei reload:true erreicht uns der Folge-Code nicht — der Browser
        // navigiert zur neuen Welt. Bei Test-Aufrufen ohne reload macht der
        // direkte Aufruf von fuseWorlds() die Arbeit.
    }

    // Stammbaum im Welt-Drawer rendern: Eltern-Welt-Liste mit Klick-Wechsel.
    _renderWorldLineage() {
        const list = document.getElementById("world-lineage");
        if (!list) return;
        const parents = Array.isArray(this.state.worldMeta && this.state.worldMeta.parentWorlds)
            ? this.state.worldMeta.parentWorlds
            : [];
        list.innerHTML = "";
        if (parents.length === 0) {
            list.textContent = "Diese Welt ist eigenständig — keine Eltern-Welten.";
            return;
        }
        const strategy = (this.state.worldMeta && this.state.worldMeta.fusionStrategy) || null;
        if (strategy) {
            const head = document.createElement("div");
            head.style.cssText = "margin-bottom:0.4em; opacity:0.78; font-style:italic;";
            head.textContent = `Fusion-Strategie: ${strategy}`;
            list.appendChild(head);
        }
        const idx = this.worldsIndexLoad();
        for (const parentId of parents) {
            const row = document.createElement("div");
            row.className = "lineage-entry";
            const entry = idx.find((e) => e.worldId === parentId);
            if (entry) {
                const link = document.createElement("button");
                link.type = "button";
                link.className = "lineage-link";
                link.textContent = entry.slug || "(namenlos)";
                link.addEventListener("click", () => this.switchToWorld(parentId, { reload: true }));
                row.appendChild(link);
                const meta = document.createElement("span");
                meta.style.cssText = "opacity:0.7; font-size:0.85em;";
                meta.textContent = `— ID ${parentId.slice(0, 8)}…`;
                row.appendChild(meta);
            } else {
                row.textContent = `(verloren) — ID ${parentId.slice(0, 8)}…`;
                row.style.opacity = "0.6";
            }
            list.appendChild(row);
        }
    }

    // Datenpfad: importierte Welt bekommt eine NEUE worldId (sonst würde sie
    // eine existierende mit gleicher ID überschreiben), behält ihren Seed
    // und Inhalt, und trägt die Original-ID in `parentWorlds` als Provenienz-
    // Spur. Slug-Kollision wird mit `-2`/`-3`/… aufgelöst, gleiches Schema
    // wie createNewWorld. Aktive Welt bleibt unverändert — der Spieler kann
    // später via Welt-Picker wechseln. UI/Test-Aufrufer können `reload`
    // setzen, um direkt in die importierte Welt zu springen.
    importWorldBeside(parsed, { reload = false } = {}) {
        if (!parsed || typeof parsed !== "object") {
            return { ok: false, reason: "kein gültiger Snapshot" };
        }
        const originalMeta = parsed.worldMeta || {};
        const originalId = typeof originalMeta.worldId === "string" ? originalMeta.worldId : null;
        const originalSlug = (originalMeta.slug || "import")
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "");
        // Slug-Eindeutigkeit gegen den lokalen Index.
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        let slug = originalSlug || "import";
        if (usedSlugs.has(slug)) {
            let n = 2;
            while (usedSlugs.has(`${slug}-${n}`)) n++;
            slug = `${slug}-${n}`;
        }
        // Frische worldId — sonst würde ein lokal existierender Eintrag mit
        // identischer ID stillschweigend überschrieben.
        let newWorldId;
        try {
            newWorldId =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        } catch {
            newWorldId = "w_" + Math.random().toString(36).slice(2, 10);
        }
        const bornAt = Date.now();
        // Importierter Snapshot wird tief geklont, dann mit neuer Identität
        // überschrieben. parentWorlds erbt jegliche bestehenden Eltern +
        // die Original-ID, damit der Stammbaum für Ring 10 ablesbar bleibt.
        const cloned = JSON.parse(JSON.stringify(parsed));
        const existingParents = Array.isArray(originalMeta.parentWorlds) ? [...originalMeta.parentWorlds] : [];
        const newParents = originalId ? [...existingParents, originalId] : existingParents;
        cloned.worldMeta = {
            ...originalMeta,
            worldId: newWorldId,
            slug,
            bornAt,
            parentWorlds: newParents,
            schemaVersion: "9.0-tor-v1",
        };
        // Der Import sollte sich seiner Empfangs-Geschichte bewusst werden —
        // Witness-Eintrag mit Provenienz. Falls die importierte Welt KEIN
        // Journal hat (Legacy-Export oder Minimal-Snapshot), legen wir den
        // Container an, damit der Witness-Akt trotzdem festgehalten wird.
        // Vor dem Bugfix wurde der Eintrag stillschweigend übersprungen —
        // eine Welt ohne Quelle-Journal konnte sich an ihr Ankommen nicht
        // erinnern (gefunden in Verifikation 6.3).
        if (!cloned.worldJournal || typeof cloned.worldJournal !== "object") {
            cloned.worldJournal = { entries: [], seen: {} };
        }
        if (!Array.isArray(cloned.worldJournal.entries)) {
            cloned.worldJournal.entries = [];
        }
        if (!cloned.worldJournal.seen || typeof cloned.worldJournal.seen !== "object") {
            cloned.worldJournal.seen = {};
        }
        const nextId = cloned.worldJournal.entries.length + 1;
        cloned.worldJournal.entries.push({
            id: nextId,
            at: Date.now(),
            tick: 0,
            type: "witness",
            text: `Ich wurde als „${slug}" neben einer fremden Welt empfangen.`,
            ctx: { fromWorldId: originalId, asWorldId: newWorldId, asSlug: slug },
        });
        try {
            localStorage.setItem(this.worldStorageKey(newWorldId), JSON.stringify(cloned));
        } catch (err) {
            return { ok: false, reason: `Speicher voll: ${err.message}` };
        }
        this.worldsIndexUpsert({ worldId: newWorldId, slug, bornAt, lastPlayed: Date.now() });
        this.log(
            `Welt „${slug}" als ${newWorldId.slice(0, 8)}… neben uns gelegt (Parent: ${originalId || "keine"})`,
            "INFO"
        );
        if (
            reload &&
            typeof window !== "undefined" &&
            window.location &&
            typeof window.location.reload === "function"
        ) {
            this.activeWorldSet(newWorldId);
            window.location.reload();
        }
        return { ok: true, worldId: newWorldId, slug, parentWorlds: newParents };
    }

    // ### Ring 10 — Welt-Fusion ###
    //
    // Zwei Welten begegnen sich, eine dritte entsteht mit beiden als Eltern
    // (Vision §11.3 Krönungsschritt). `parentWorlds = [idA, idB]` ist die
    // Stammbaum-Spur. Drei Strategien wählbar:
    //
    //   - "sequence"      DSL-History ist [A.history, B.history] hintereinander,
    //                     Emotionen aus A (aktive Welt) übernommen.
    //   - "random-mix"    DSL-History wird 50:50 interleaved (gemischter Pool),
    //                     Emotionen Mittelwert beider Eltern.
    //   - "tag-merge"     DSL-History wie sequence, aber Emotionen sind max
    //                     (Vereinigung statt Mittelung) — die Fusions-Welt ist
    //                     anfangs intensiver, nicht abgeflacht.
    //
    // Inventar (eigene Materialien / Werkzeuge / Baupläne) wird in allen drei
    // Strategien als Union gemerged: A-Einträge bleiben, kollidierende B-Einträge
    // bekommen `-fusion`-Suffix. Architekturen + Kreaturen starten leer
    // (Konzept §10.6 Option a — die Fusions-Welt ist ein neuer Ort, nicht
    // beide Eltern übereinandergelegt). Journal trägt einen Genesis-Eintrag
    // plus top-3 Erinnerungen aus jedem Elternteil mit Source-Marker.

    static FUSION_STRATEGIES = Object.freeze(["sequence", "random-mix", "tag-merge"]);

    // Erzeugt einen Fusions-Slug aus zwei Eltern-Slugs. Bei Kollision mit
    // existierender Welt wird `-fusion` angehängt, dann `-fusion-2` etc. So
    // bleibt der Stammbaum auch im Slug nachvollziehbar: „aue-mein-x-hain"
    // statt einer kryptischen UUID.
    _generateFusionSlug(slugA, slugB, userOverride) {
        const usedSlugs = new Set(this.worldsIndexLoad().map((e) => e.slug));
        const fallback = `${slugA || "welt"}-x-${slugB || "welt"}`.replace(/[^a-z0-9_-]/gi, "").toLowerCase();
        let base = (userOverride || fallback).toLowerCase().replace(/[^a-z0-9_-]/g, "");
        if (!base) base = "fusion";
        let slug = base;
        if (usedSlugs.has(slug)) {
            // Erst -fusion versuchen, dann -fusion-2 etc.
            const withFusion = `${base}-fusion`;
            if (!usedSlugs.has(withFusion)) {
                slug = withFusion;
            } else {
                let n = 2;
                while (usedSlugs.has(`${withFusion}-${n}`)) n++;
                slug = `${withFusion}-${n}`;
            }
        }
        return slug;
    }

    // Union zweier Map-of-name-Objekte (Materialien, Werkzeuge, Baupläne).
    // A-Einträge bleiben unverändert; B-Einträge mit kollidierendem Namen
    // bekommen `<name>-fusion` (oder `-fusion-2`/...). Built-ins werden
    // ausgelassen, weil sie aus _defaultMaterials/_defaultTools/_defaultBlueprints
    // entstehen — würde Doppel-Listing geben.
    //
    // Wenn `renameMap` mitgegeben wird, wird er mit B-Umbenennungen befüllt
    // (`{ originalName: neuerName }`). Damit kann der Aufrufer cross-References
    // (z. B. `sourceBlueprint` in Werkzeugen, `refName` in fraktalen Bauplänen)
    // korrekt mit-rename — sonst entstehen tote Verweise.
    _mergeOwnNamedItems(arrA, arrB, renameMap = null) {
        const out = [];
        const seen = new Set();
        const ownA = Array.isArray(arrA) ? arrA.filter((x) => x && !x.builtIn) : [];
        const ownB = Array.isArray(arrB) ? arrB.filter((x) => x && !x.builtIn) : [];
        for (const item of ownA) {
            if (!item.name || seen.has(item.name)) continue;
            seen.add(item.name);
            out.push(item);
        }
        for (const item of ownB) {
            if (!item.name) continue;
            let name = item.name;
            if (seen.has(name)) {
                name = `${item.name}-fusion`;
                let n = 2;
                while (seen.has(name)) name = `${item.name}-fusion-${n++}`;
            }
            seen.add(name);
            if (renameMap && name !== item.name) {
                renameMap[item.name] = name;
            }
            out.push({ ...item, name });
        }
        return out;
    }

    // Hilfsfunktion: nach _mergeOwnNamedItems wendet sie die in `renameMap`
    // notierten Umbenennungen auf eingebettete Querverweise im B-Anteil an.
    // Sonst zeigte ein B-Werkzeug mit sourceBlueprint="Hammer" weiterhin auf
    // "Hammer", obwohl die B-Welt's Hammer-Bauplan zu "Hammer-fusion"
    // umbenannt wurde — das ist eine tote Bindung. Mit dem Fix landet der
    // Werkzeug-Eintrag mit sourceBlueprint="Hammer-fusion" in der Fusions-Welt.
    //
    // Wir mutieren nur B-Anteile (alles ab Index sourceAStart), nicht A's
    // Originale, weil A keine Konflikte hat (A behält seine Namen).
    _rewireBlueprintRefs(mergedBlueprints, mergedTools, bpRenameMap) {
        if (!bpRenameMap || Object.keys(bpRenameMap).length === 0) return;
        // Cross-Refs in mergedBlueprints (fraktale Baupläne mit refName)
        for (const bp of mergedBlueprints) {
            if (!bp || !Array.isArray(bp.parts)) continue;
            for (const part of bp.parts) {
                if (part && typeof part.refName === "string" && bpRenameMap[part.refName]) {
                    part.refName = bpRenameMap[part.refName];
                }
            }
        }
        // Werkzeug-zu-Bauplan-Bindung (sourceBlueprint)
        for (const tool of mergedTools) {
            if (tool && typeof tool.sourceBlueprint === "string" && bpRenameMap[tool.sourceBlueprint]) {
                tool.sourceBlueprint = bpRenameMap[tool.sourceBlueprint];
            }
        }
    }

    // Wählt top-K Erinnerungen aus dem Journal: Genesis-Eintrag (Eltern-Geburt)
    // plus die jüngsten K-1 Wachstum/Witness-Einträge. Bekommt einen
    // Source-Marker im ctx, damit das fusionierte Journal lesbar bleibt:
    // „dieser Eintrag stammt aus A".
    _selectFusionJournalEntries(journal, source, K = 4) {
        if (!journal || !Array.isArray(journal.entries)) return [];
        const entries = journal.entries;
        const genesis = entries.find((e) => e && e.type === "genesis");
        const recent = entries.filter((e) => e && e.type !== "genesis").slice(-(K - (genesis ? 1 : 0)));
        const picks = genesis ? [genesis, ...recent] : recent.slice(-K);
        return picks.map((e) => ({
            ...e,
            ctx: { ...(e.ctx || {}), _fusionSource: source },
        }));
    }

    // Hauptpfad. Lädt beide Eltern, baut den fusionierten Snapshot, schreibt
    // ihn, registriert die neue Welt im Index. `reload:true` springt direkt
    // in die Fusion; `reload:false` lässt den Aufrufer entscheiden, wann
    // gewechselt wird (Tests + Vorschau-Workflow).
    // Rezepte aus einer anderen Welt in die aktuell aktive importieren.
    // Anders als Fusion wird KEINE neue Welt erschaffen — die Materialien,
    // Baupläne und Werkzeuge der Quelle werden direkt in die aktive Welt
    // kopiert (mit `-import`-Suffix bei Namens-Kollision, gleiches Schema
    // wie Fusion mit `-fusion`). Aktive Welt-Identität bleibt unangetastet.
    // Querverweise (Werkzeug.sourceBlueprint, fraktaler-Bauplan.part.refName)
    // werden mit umbenannt — selbe Logik wie bei Fusion. Schreibt einen
    // Witness-Journal-Eintrag mit der Quelle.
    importRecipesFromWorld(sourceWorldId) {
        if (!sourceWorldId || typeof sourceWorldId !== "string") {
            return { ok: false, reason: "keine Quell-Welt-ID" };
        }
        if (sourceWorldId === (this.state.worldMeta && this.state.worldMeta.worldId)) {
            return { ok: false, reason: "Quelle = aktive Welt" };
        }
        const raw = localStorage.getItem(this.worldStorageKey(sourceWorldId));
        if (!raw) return { ok: false, reason: "Quelle nicht im Speicher" };
        let sourceSave;
        try {
            sourceSave = JSON.parse(raw);
        } catch (e) {
            return { ok: false, reason: `Quell-Save ungültig: ${e.message}` };
        }

        // Quell-Inventar tief klonen, sonst würden Mutationen in der aktiven
        // Welt zurück in das Quell-Save bluten.
        const sourceBPs = Array.isArray(sourceSave.blueprints) ? JSON.parse(JSON.stringify(sourceSave.blueprints)) : [];
        const sourceMats = Array.isArray(sourceSave.materials) ? JSON.parse(JSON.stringify(sourceSave.materials)) : [];
        const sourceTools = Array.isArray(sourceSave.tools) ? JSON.parse(JSON.stringify(sourceSave.tools)) : [];

        // Vorhandene Namen in der aktiven Welt sammeln (inkl. Built-ins,
        // damit ein importierter "village" auch zu "village-import" wird).
        const existingBPNames = new Set(Object.keys(this.state.blueprints || {}));
        const existingMatNames = new Set(Object.keys(this.state.materials || {}));
        const existingToolNames = new Set(Object.keys(this.state.tools || {}));

        const renameMap = {};
        const addedBPs = [];
        const addedMats = [];
        const addedTools = [];

        const resolveName = (origName, taken) => {
            if (!taken.has(origName)) return origName;
            let candidate = `${origName}-import`;
            let n = 2;
            while (taken.has(candidate)) candidate = `${origName}-import-${n++}`;
            return candidate;
        };

        for (const bp of sourceBPs) {
            if (!bp || typeof bp.name !== "string" || bp.builtIn) continue;
            const newName = resolveName(bp.name, existingBPNames);
            existingBPNames.add(newName);
            if (newName !== bp.name) renameMap[bp.name] = newName;
            addedBPs.push({ ...bp, name: newName, builtIn: false });
        }
        for (const m of sourceMats) {
            if (!m || typeof m.name !== "string" || m.builtIn) continue;
            const newName = resolveName(m.name, existingMatNames);
            existingMatNames.add(newName);
            addedMats.push({ ...m, name: newName, builtIn: false });
        }
        for (const t of sourceTools) {
            if (!t || typeof t.name !== "string" || t.builtIn) continue;
            const newName = resolveName(t.name, existingToolNames);
            existingToolNames.add(newName);
            addedTools.push({ ...t, name: newName, builtIn: false });
        }

        // Cascade-Rewire: Werkzeug.sourceBlueprint + fractal.refName folgen
        // den Bauplan-Umbenennungen. Selbe Logik wie Fusion — kein Drift.
        this._rewireBlueprintRefs(addedBPs, addedTools, renameMap);

        // Anwenden auf state. Material-Tags füllen wir mit Defaults auf, damit
        // alte Saves ohne alle Tag-Felder konsistent bleiben.
        const tagDefaults = AnazhRealm.MATERIAL_TAG_DEFAULTS || {};
        for (const bp of addedBPs) {
            this.state.blueprints[bp.name] = bp;
        }
        for (const m of addedMats) {
            this.state.materials[m.name] = {
                ...m,
                tags: { ...tagDefaults, ...(m.tags || {}) },
            };
        }
        for (const t of addedTools) {
            this.state.tools[t.name] = t;
        }

        const sourceMeta = sourceSave.worldMeta || {};
        const sourceSlug = sourceMeta.slug || "(unbenannt)";
        const total = addedBPs.length + addedMats.length + addedTools.length;
        this.journalAppend(
            "witness",
            `Ich habe Rezepte aus „${sourceSlug}" empfangen: ${addedBPs.length} Baupläne, ${addedMats.length} Materialien, ${addedTools.length} Werkzeuge.`,
            {
                fromWorldId: sourceWorldId,
                fromSlug: sourceSlug,
                counts: { blueprints: addedBPs.length, materials: addedMats.length, tools: addedTools.length },
                renameMap: { ...renameMap },
            }
        );

        // Save + Re-Render
        try {
            this.saveState();
        } catch (err) {
            this.log(`Save nach Recipe-Import fehlgeschlagen: ${err.message}`, "WARN");
        }
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        this.updateWorldInfo();

        this.log(
            `Rezepte aus ${sourceSlug} importiert: ${total} (Baupläne ${addedBPs.length}, Materialien ${addedMats.length}, Werkzeuge ${addedTools.length})`,
            "INFO"
        );
        return {
            ok: true,
            counts: { blueprints: addedBPs.length, materials: addedMats.length, tools: addedTools.length },
            renameMap,
        };
    }

    fuseWorlds(idA, idB, strategy, { slug = null, reload = false } = {}) {
        if (!idA || !idB || idA === idB) {
            return { ok: false, reason: "zwei verschiedene Eltern-IDs nötig" };
        }
        const validStrategy = AnazhRealm.FUSION_STRATEGIES.includes(strategy);
        if (!validStrategy) {
            return { ok: false, reason: `unbekannte Strategie: ${strategy}` };
        }
        const rawA = localStorage.getItem(this.worldStorageKey(idA));
        const rawB = localStorage.getItem(this.worldStorageKey(idB));
        if (!rawA || !rawB) {
            return { ok: false, reason: "Eltern-Welt nicht im Speicher" };
        }
        let saveA, saveB;
        try {
            saveA = JSON.parse(rawA);
            saveB = JSON.parse(rawB);
        } catch (err) {
            return { ok: false, reason: `Parent-Save ungültig: ${err.message}` };
        }

        // Neue Identität
        let newWorldId;
        try {
            newWorldId =
                typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : "w_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
        } catch {
            newWorldId = "w_" + Math.random().toString(36).slice(2, 10);
        }
        const slugA = (saveA.worldMeta && saveA.worldMeta.slug) || "welt-a";
        const slugB = (saveB.worldMeta && saveB.worldMeta.slug) || "welt-b";
        const finalSlug = this._generateFusionSlug(slugA, slugB, slug);
        const newSeed = `w-fusion-${newWorldId.replace(/-/g, "").slice(0, 12)}-${Math.random().toString(36).slice(2, 8)}`;
        const bornAt = Date.now();

        // Inventar-Union — gleicher Algo für alle Strategien. Wir tracken
        // Bauplan-Umbenennungen, damit Querverweise (Werkzeug.sourceBlueprint,
        // fraktaler-Bauplan.part.refName) anschließend rewired werden können.
        // Tiefe Kopie via JSON, damit eine spätere Mutation in der Fusions-
        // Welt nicht in die Eltern-Saves zurückblutet.
        const blueprintsCloneA = saveA.blueprints ? JSON.parse(JSON.stringify(saveA.blueprints)) : [];
        const blueprintsCloneB = saveB.blueprints ? JSON.parse(JSON.stringify(saveB.blueprints)) : [];
        const materialsCloneA = saveA.materials ? JSON.parse(JSON.stringify(saveA.materials)) : [];
        const materialsCloneB = saveB.materials ? JSON.parse(JSON.stringify(saveB.materials)) : [];
        const toolsCloneA = saveA.tools ? JSON.parse(JSON.stringify(saveA.tools)) : [];
        const toolsCloneB = saveB.tools ? JSON.parse(JSON.stringify(saveB.tools)) : [];
        const bpRenameMap = {};
        const mergedBlueprints = this._mergeOwnNamedItems(blueprintsCloneA, blueprintsCloneB, bpRenameMap);
        const mergedMaterials = this._mergeOwnNamedItems(materialsCloneA, materialsCloneB);
        const mergedTools = this._mergeOwnNamedItems(toolsCloneA, toolsCloneB);
        // Querverweise rewiren: Werkzeuge die B-Baupläne referenzieren, und
        // fraktale Baupläne mit refName auf andere B-Baupläne, müssen den
        // umbenannten Bauplan-Namen mitbekommen.
        this._rewireBlueprintRefs(mergedBlueprints, mergedTools, bpRenameMap);

        // Player-Werkzeug-Liste: Union der besessenen Namen (Starter sind
        // sowieso wieder beim Init verfügbar; nur eigene tragen Namen).
        const playerToolsUnion = Array.from(
            new Set([
                ...((Array.isArray(saveA.playerTools) && saveA.playerTools) || []),
                ...((Array.isArray(saveB.playerTools) && saveB.playerTools) || []),
            ])
        );

        // Strategie-abhängige Felder.
        const emotKeys = ["joy", "awe", "sorrow", "hope", "peace", "chaos"];
        const emotA = (saveA.playerEmotions && typeof saveA.playerEmotions === "object" && saveA.playerEmotions) || {};
        const emotB = (saveB.playerEmotions && typeof saveB.playerEmotions === "object" && saveB.playerEmotions) || {};
        const mergedEmotions = {};
        for (const k of emotKeys) {
            const va = Number.isFinite(emotA[k]) ? emotA[k] : 0;
            const vb = Number.isFinite(emotB[k]) ? emotB[k] : 0;
            if (strategy === "tag-merge") mergedEmotions[k] = Math.max(va, vb);
            else if (strategy === "random-mix") mergedEmotions[k] = (va + vb) / 2;
            else mergedEmotions[k] = va; // sequence: aktive Welt
        }

        // DSL-History: pro Strategie eine andere Komposition.
        const histA = Array.isArray(saveA.dslHistory) ? saveA.dslHistory : [];
        const histB = Array.isArray(saveB.dslHistory) ? saveB.dslHistory : [];
        let mergedHistory;
        if (strategy === "random-mix") {
            // Interleaved + Cap 500. Wir nehmen je 250 jüngste, mischen.
            const aSlice = histA.slice(-250);
            const bSlice = histB.slice(-250);
            const combined = [];
            const max = Math.max(aSlice.length, bSlice.length);
            for (let i = 0; i < max; i++) {
                // Zwei Münzwurf-Verzweigungen: zuerst A oder B?
                if (Math.random() < 0.5) {
                    if (i < aSlice.length) combined.push(aSlice[i]);
                    if (i < bSlice.length) combined.push(bSlice[i]);
                } else {
                    if (i < bSlice.length) combined.push(bSlice[i]);
                    if (i < aSlice.length) combined.push(aSlice[i]);
                }
            }
            mergedHistory = combined.slice(-500);
        } else {
            mergedHistory = [...histA.slice(-250), ...histB.slice(-250)];
        }

        // Pattern-Memory: pro Keyword Listen verschmelzen, cap pro Keyword bei 8.
        const pmA =
            (saveA.dslPatternMemory && typeof saveA.dslPatternMemory === "object" && saveA.dslPatternMemory) || {};
        const pmB =
            (saveB.dslPatternMemory && typeof saveB.dslPatternMemory === "object" && saveB.dslPatternMemory) || {};
        const mergedPatternMemory = {};
        const pmKeys = new Set([...Object.keys(pmA), ...Object.keys(pmB)]);
        for (const k of pmKeys) {
            const merged = [...(pmA[k] || []), ...(pmB[k] || [])];
            // Höchste Fitness zuerst, Cap 8.
            merged.sort((x, y) => (y.fitness || 0) - (x.fitness || 0));
            mergedPatternMemory[k] = merged.slice(0, 8);
        }

        // DSL-Abilities: Union per Name (A gewinnt bei Kollision).
        const abilA = Array.isArray(saveA.dslAbilities) ? saveA.dslAbilities : [];
        const abilB = Array.isArray(saveB.dslAbilities) ? saveB.dslAbilities : [];
        const seenAbilNames = new Set();
        const mergedAbilities = [];
        for (const list of [abilA, abilB]) {
            for (const a of list) {
                if (!a || typeof a.name !== "string") continue;
                if (seenAbilNames.has(a.name)) continue;
                seenAbilNames.add(a.name);
                mergedAbilities.push(a);
            }
        }

        // Pfad-Buckets: Mittelung pro Achse (oder A's wenn B nichts hat).
        let mergedPathBuckets = null;
        if (saveA.playerPathBuckets || saveB.playerPathBuckets) {
            const pbA = saveA.playerPathBuckets || {};
            const pbB = saveB.playerPathBuckets || {};
            const allKeys = new Set([...Object.keys(pbA), ...Object.keys(pbB)]);
            mergedPathBuckets = {};
            for (const k of allKeys) {
                const a = pbA[k];
                const b = pbB[k];
                if (typeof a === "number" && typeof b === "number") mergedPathBuckets[k] = (a + b) / 2;
                else if (typeof a === "number") mergedPathBuckets[k] = a;
                else if (typeof b === "number") mergedPathBuckets[k] = b;
            }
        }

        // Terrain-Parameter mitteln, Wetter aus A.
        const steepness =
            ((Number.isFinite(saveA.terrainSteepness) ? saveA.terrainSteepness : 1.0) +
                (Number.isFinite(saveB.terrainSteepness) ? saveB.terrainSteepness : 1.0)) /
            2;
        const baseHeight =
            ((Number.isFinite(saveA.terrainBaseHeight) ? saveA.terrainBaseHeight : 0.0) +
                (Number.isFinite(saveB.terrainBaseHeight) ? saveB.terrainBaseHeight : 0.0)) /
            2;
        const weather = saveA.weather || saveB.weather || "sunny";

        // Genesis-Eintrag + top-Erinnerungen je Elternteil.
        const genesisEntry = {
            id: 1,
            at: bornAt,
            tick: 0,
            type: "genesis",
            text: `Ich erwache aus „${slugA}" und „${slugB}".`,
            ctx: {
                worldId: newWorldId,
                seed: newSeed,
                parentA: idA,
                parentB: idB,
                strategy,
            },
        };
        const journalA = this._selectFusionJournalEntries(saveA.worldJournal, idA, 4);
        const journalB = this._selectFusionJournalEntries(saveB.worldJournal, idB, 4);
        const fusedEntries = [genesisEntry, ...journalA, ...journalB].map((e, i) => ({ ...e, id: i + 1 }));

        const snap = {
            playerPosition: { x: 0, y: 50, z: 0 },
            knowledgeBase: [
                ...((Array.isArray(saveA.knowledgeBase) && saveA.knowledgeBase.slice(-100)) || []),
                ...((Array.isArray(saveB.knowledgeBase) && saveB.knowledgeBase.slice(-100)) || []),
            ].slice(-200),
            version: this.state.currentVersion || "7.71",
            selfAwareness: { components: [], weaknesses: [] },
            creatures: [],
            creatureEmotions: [],
            terrainSteepness: steepness,
            terrainBaseHeight: baseHeight,
            weather,
            worldMeta: {
                worldId: newWorldId,
                slug: finalSlug,
                creator: "local",
                visibility: "private",
                parentWorlds: [idA, idB],
                bornAt,
                seed: newSeed,
                fusionStrategy: strategy,
                schemaVersion: "10.0-fusion-v1",
            },
            dslAbilities: mergedAbilities,
            dslHistory: mergedHistory,
            dslPatternMemory: mergedPatternMemory,
            playerPathBuckets: mergedPathBuckets,
            worldJournal: { entries: fusedEntries, seen: { genesis: true } },
            playerEmotions: mergedEmotions,
            playerSoul: saveA.playerSoul || "human",
            playerTools: playerToolsUnion,
            architectures: [],
            blueprints: mergedBlueprints,
            tools: mergedTools,
            materials: mergedMaterials,
            hotbar: Array.isArray(saveA.hotbar) ? saveA.hotbar.slice(0, 9) : [],
        };

        try {
            localStorage.setItem(this.worldStorageKey(newWorldId), JSON.stringify(snap));
        } catch (err) {
            return { ok: false, reason: `Speicher voll: ${err.message}` };
        }
        this.worldsIndexUpsert({ worldId: newWorldId, slug: finalSlug, bornAt, lastPlayed: Date.now() });
        this.log(
            `Welt-Fusion: ${slugA} ⊕ ${slugB} → ${finalSlug} (Strategie ${strategy}, ID ${newWorldId.slice(0, 8)}…)`,
            "INFO"
        );

        if (
            reload &&
            typeof window !== "undefined" &&
            window.location &&
            typeof window.location.reload === "function"
        ) {
            this.activeWorldSet(newWorldId);
            window.location.reload();
        }
        return { ok: true, worldId: newWorldId, slug: finalSlug, parentWorlds: [idA, idB], strategy };
    }

    loadVersion(version) {
        this.log(`Lade Version ${version} – Platzhalter für Versionsmanagement`);
    }

    // ### Initialisierung V7.66 ###
    // Learnings:
    // - V7.64 Basis: Stabile Initialisierung mit Physik, Szene, Kamera
    // - V7.66 Ergänzung: Fehlerbehandlung verbessert, Chat/Nexus integriert
    // Tag/Nacht-Theme: schaltet die CSS-Custom-Properties über
    // body[data-theme]. localStorage persistiert die Wahl, damit nach Reload
    // die Stimmung erhalten bleibt.
    themeInitDOM() {
        const toggle = document.getElementById("theme-toggle");
        if (!toggle) return;
        const body = document.body;
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmTheme");
            } catch {
                return null;
            }
        })();
        const initial = stored === "nacht" ? "nacht" : "tag";
        body.setAttribute("data-theme", initial);
        toggle.setAttribute("aria-pressed", initial === "nacht" ? "true" : "false");
        toggle.textContent = initial === "nacht" ? "☾ Nacht" : "☀ Tag";
        toggle.addEventListener("click", () => {
            const next = body.getAttribute("data-theme") === "tag" ? "nacht" : "tag";
            body.setAttribute("data-theme", next);
            toggle.setAttribute("aria-pressed", next === "nacht" ? "true" : "false");
            toggle.textContent = next === "nacht" ? "☾ Nacht" : "☀ Tag";
            try {
                localStorage.setItem("anazhRealmTheme", next);
            } catch {
                // Kein Persistenz-Fail-Stop — Theme-Wechsel funktioniert weiter
                // pro Session.
            }
        });
    }

    symphonyInitDOM() {
        // Toggle-Button koppelt User-Geste an AudioContext-Start (Browser-
        // Autoplay-Policy). Beim ersten Klick: initSymphony(); danach
        // ein/aus über masterGain.
        const toggle = document.getElementById("anazh-symphony-toggle");
        if (!toggle) return;
        toggle.addEventListener("click", () => {
            const s = this.state.symphony;
            if (!s.enabled) {
                const ok = this.initSymphony();
                if (ok) {
                    toggle.setAttribute("aria-pressed", "true");
                    toggle.textContent = "Klang: an";
                }
                return;
            }
            const currentlyOn = toggle.getAttribute("aria-pressed") === "true";
            const targetGain = currentlyOn ? 0 : 0.35;
            s.masterGain.gain.setValueAtTime(targetGain, s.ctx.currentTime);
            toggle.setAttribute("aria-pressed", currentlyOn ? "false" : "true");
            toggle.textContent = currentlyOn ? "Klang: aus" : "Klang: an";
        });
    }

    // ### Ring 5 V2 – Spieler-Seele mit animierten Multi-Mesh-Körpern ###
    //
    // V1 war ein Mesh + Farbe pro Seele. V2 baut für jede Seele einen
    // `THREE.Group` aus Sub-Meshes (Torso/Kopf/Glieder/Flügel/Schweif), die
    // pro Frame über sin/cos animiert werden. Walk-Cycle wenn der Spieler
    // sich bewegt, Idle-Atem-/Hover-Animation wenn er steht.
    //
    // Disziplinen, die V1 schon getragen hat und die V2 nicht aufgibt:
    //   - Ammo-Body bleibt 0.5er Half-Extent-Box. Visuelle Höhe ~1.7
    //     Einheiten ist größer als die Collision-Box, das ist gewollt
    //     (Game-Konvention: Charakter größer als Hitbox = mehr Spielraum).
    //   - Position + Scale bleiben über Soul-Wechsel hinweg unangetastet.
    //   - Kein dynamic-eval, kein Asset-Load — alles aus Three.js-Primitives.
    //   - `player_soul` bleibt aus dem `dslComposeAtomic`-Pool draußen
    //     (Identität gehört dem Spieler, nicht dem Nexus).
    //
    // Animation-Vertrag pro Soul: `animate(group, t, walkPhase, isMoving)`.
    // - `t`: aktuelle Zeit in Sekunden (für Idle-Schwingungen).
    // - `walkPhase`: monoton wachsender Phasen-Wert in Radiant, akkumuliert
    //   nur wenn der Spieler sich bewegt — so springen Glieder nicht beim
    //   Stop-Start-Wechsel, sondern frieren in der aktuellen Pose ein.
    // - `isMoving`: bool, schaltet zwischen Walk/Trab/Flap-Speed und Idle.
    get playerSoulDefs() {
        if (this._playerSoulDefsCache) return this._playerSoulDefsCache;
        // Welle 6.D Etappe 1.5 — Seele = Bauplan aus Körper-Teilen.
        //
        // Vision-Korrektur (Schöpfer 13.05.2026): das hardcodete `tags`-Profil
        // war Re-Verkapselung. Eine Seele entsteht jetzt — wie Bauwerke und
        // Maschinen — aus einer Liste von Teilen mit Form × Material. Die
        // Compound-Tags fallen aus `computeCompoundTags` (W4-P2 MAX-Aggregation)
        // genauso wie bei jeder anderen Struktur in der Welt.
        //
        // Drei Built-in-Seelen sind Start-Charaktere; eigene Seelen kommen mit
        // der DSL-Op `define_soul(name, bodyParts)` in Etappe 1.6. Visuelle
        // Anim-Pfade (build/animate) bleiben für die Built-ins — Custom-Souls
        // bekommen einen generischen Atem-Loop (folgt mit Custom-Soul-UI).
        this._playerSoulDefsCache = {
            human: {
                label: "Mensch",
                color: 0xff0000,
                build: () => this._buildHumanGroup(),
                animate: (g, t, ph, mv) => this._animateHuman(g, t, ph, mv),
                bodyParts: [
                    { shape: "box", material: "fleisch", size: { x: 0.6, y: 1.0, z: 0.4 }, label: "Torso" },
                    { shape: "sphere", material: "knochen", size: { x: 0.3, y: 0.3, z: 0.3 }, label: "Kopf" },
                    { shape: "cylinder", material: "fleisch", size: { x: 0.18, y: 0.85, z: 0.18 }, label: "Glieder" },
                    { shape: "cylinder", material: "knochen", size: { x: 0.2, y: 0.9, z: 0.2 }, label: "Skelett" },
                ],
            },
            phoenix: {
                label: "Phönix",
                color: 0xff7a1a,
                build: () => this._buildPhoenixGroup(),
                animate: (g, t, ph, mv) => this._animatePhoenix(g, t, ph, mv),
                bodyParts: [
                    { shape: "box", material: "federn", size: { x: 0.4, y: 0.55, z: 0.35 }, label: "Körper" },
                    { shape: "plane", material: "federn", size: { x: 1.2, y: 0.6, z: 0.05 }, label: "Flügel" },
                    { shape: "sphere", material: "glut", size: { x: 0.22, y: 0.22, z: 0.22 }, label: "Inneres Feuer" },
                    { shape: "cone", material: "federn", size: { x: 0.18, y: 0.8, z: 0.18 }, label: "Schweif" },
                ],
            },
            dragon: {
                label: "Drache",
                color: 0x2d6e3b,
                build: () => this._buildDragonGroup(),
                animate: (g, t, ph, mv) => this._animateDragon(g, t, ph, mv),
                bodyParts: [
                    { shape: "box", material: "schuppen", size: { x: 1.2, y: 0.7, z: 0.5 }, label: "Körper" },
                    { shape: "sphere", material: "schuppen", size: { x: 0.45, y: 0.4, z: 0.4 }, label: "Kopf" },
                    { shape: "cylinder", material: "knochen", size: { x: 0.22, y: 0.45, z: 0.22 }, label: "Beine" },
                    { shape: "cylinder", material: "schuppen", size: { x: 0.18, y: 1.4, z: 0.18 }, label: "Schweif" },
                ],
            },
        };
        return this._playerSoulDefsCache;
    }

    // Welle 6.D Etappe 1.5 — Compound-Tags der Seele berechnen.
    //
    // Identische Aggregations-Mechanik wie `computeCompoundTags(blueprint)` für
    // Bauwerke: pro Body-Part `computePartTags` (Form × Material), dann MAX über
    // alle Teile. Damit spricht der Spieler dieselbe Sprache wie Architekturen.
    // Wer einen leeren `bodyParts`-Eintrag hat, bekommt leere Tags zurück (defensiv).
    computeSoulCompoundTags(soulDef) {
        if (!soulDef || !Array.isArray(soulDef.bodyParts) || soulDef.bodyParts.length === 0) {
            return {};
        }
        return this.computeCompoundTags({ parts: soulDef.bodyParts });
    }

    // Hilfs-Helper: ein Glied (Arm/Bein) mit Pivot am Joint. Joint-Group
    // sitzt an (jx, jy, jz); das Mesh hängt von der Y-Achse nach unten,
    // sodass Rotation der Joint-Group am Schulter-/Hüft-Punkt ankert.
    _buildLimb(material, jx, jy, jz, length, width, depth) {
        const joint = new THREE.Group();
        joint.position.set(jx, jy, jz);
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, length, depth), material);
        mesh.position.y = -length / 2;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        joint.add(mesh);
        joint.userData.length = length;
        return joint;
    }

    _buildHumanGroup() {
        const group = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.7, 0.3), material);
        torso.position.y = 0.45;
        torso.castShadow = true;
        torso.receiveShadow = true;
        group.add(torso);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), material);
        head.position.y = 1.0;
        head.castShadow = true;
        group.add(head);
        const leftArm = this._buildLimb(material, -0.4, 0.8, 0, 0.6, 0.15, 0.15);
        const rightArm = this._buildLimb(material, 0.4, 0.8, 0, 0.6, 0.15, 0.15);
        const leftLeg = this._buildLimb(material, -0.15, 0.1, 0, 0.6, 0.2, 0.2);
        const rightLeg = this._buildLimb(material, 0.15, 0.1, 0, 0.6, 0.2, 0.2);
        group.add(leftArm, rightArm, leftLeg, rightLeg);
        group.userData.material = material;
        group.userData.parts = { torso, head, leftArm, rightArm, leftLeg, rightLeg };
        return group;
    }

    _animateHuman(group, t, walkPhase, isMoving) {
        const p = group.userData.parts;
        if (isMoving) {
            // Schritt-Zyklus: Beine ±0.5 rad gegenphasig, Arme ±0.3 entgegen
            const swing = Math.sin(walkPhase) * 0.5;
            p.leftLeg.rotation.x = swing;
            p.rightLeg.rotation.x = -swing;
            p.leftArm.rotation.x = -swing * 0.6;
            p.rightArm.rotation.x = swing * 0.6;
            p.torso.position.y = 0.45 + Math.abs(Math.sin(walkPhase)) * 0.04;
        } else {
            // Idle: leichter Atem-Hub + sanftes Arm-Pendel
            const breath = Math.sin(t * 1.8) * 0.025;
            p.torso.position.y = 0.45 + breath;
            p.leftArm.rotation.x = Math.sin(t * 1.2) * 0.05;
            p.rightArm.rotation.x = -Math.sin(t * 1.2) * 0.05;
            p.leftLeg.rotation.x = 0;
            p.rightLeg.rotation.x = 0;
        }
    }

    _buildPhoenixGroup() {
        const group = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
        // Körper: Oktaeder im Brust-Bereich
        const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0), material);
        body.position.y = 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        // Kopf: kleinerer Oktaeder oben
        const head = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), material);
        head.position.set(0, 0.95, 0.05);
        head.castShadow = true;
        group.add(head);
        // Schweif: Kegel nach hinten unten
        const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 6), material);
        tail.position.set(0, 0.4, -0.55);
        tail.rotation.x = Math.PI / 2;
        tail.castShadow = true;
        group.add(tail);
        // Flügel: zwei flache Boxen mit Joint an der Schulter, sodass
        // Rotation um die Forward-Achse (Z) wie Flügelschlag aussieht.
        const buildWing = (sign) => {
            const joint = new THREE.Group();
            joint.position.set(sign * 0.3, 0.55, 0);
            const wing = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.5), material);
            wing.position.x = sign * 0.45;
            wing.castShadow = true;
            joint.add(wing);
            return joint;
        };
        const leftWing = buildWing(-1);
        const rightWing = buildWing(1);
        group.add(leftWing, rightWing);
        group.userData.material = material;
        group.userData.parts = { body, head, tail, leftWing, rightWing };
        return group;
    }

    _animatePhoenix(group, t, walkPhase, isMoving) {
        const p = group.userData.parts;
        // Flügel flattern immer (Phönix ist ein Flugwesen). In Bewegung
        // schneller, im Idle gemächlich.
        const flapSpeed = isMoving ? 14 : 7;
        const flapAmp = isMoving ? 0.85 : 0.55;
        const flap = Math.sin(t * flapSpeed) * flapAmp;
        p.leftWing.rotation.z = -flap;
        p.rightWing.rotation.z = flap;
        // Hover-Bob für Körper, im Idle stärker als im Walk
        const bobAmp = isMoving ? 0.04 : 0.07;
        const bobSpeed = isMoving ? 6 : 1.6;
        p.body.position.y = 0.5 + Math.sin(t * bobSpeed) * bobAmp;
        p.head.position.y = 0.95 + Math.sin(t * bobSpeed) * bobAmp * 0.7;
        // Schweif folgt sanft
        p.tail.rotation.z = Math.sin(t * 1.2) * 0.1;
    }

    _buildDragonGroup() {
        const group = new THREE.Group();
        const material = new THREE.MeshBasicMaterial({ color: 0x2d6e3b });
        // Körper: gestreckter Quader entlang Z
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 1.2), material);
        body.position.y = 0.4;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        // Kopf: vorne dran
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.45), material);
        head.position.set(0, 0.5, 0.85);
        head.castShadow = true;
        group.add(head);
        // Vier Beine in Box-Eck-Anordnung
        const legY = 0.18;
        const legLen = 0.5;
        const flLeg = this._buildLimb(material, -0.25, legY, 0.35, legLen, 0.15, 0.15);
        const frLeg = this._buildLimb(material, 0.25, legY, 0.35, legLen, 0.15, 0.15);
        const blLeg = this._buildLimb(material, -0.25, legY, -0.35, legLen, 0.15, 0.15);
        const brLeg = this._buildLimb(material, 0.25, legY, -0.35, legLen, 0.15, 0.15);
        group.add(flLeg, frLeg, blLeg, brLeg);
        // Schweif: drei Segmente in Kette nach hinten, jedes als Joint
        // rotiert um den vorherigen — gibt eine wellige Sinus-Welle.
        const tailJoint = new THREE.Group();
        tailJoint.position.set(0, 0.4, -0.6);
        const tailSeg1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.45), material);
        tailSeg1.position.z = -0.22;
        tailSeg1.castShadow = true;
        tailJoint.add(tailSeg1);
        const tailJoint2 = new THREE.Group();
        tailJoint2.position.z = -0.45;
        const tailSeg2 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.4), material);
        tailSeg2.position.z = -0.2;
        tailSeg2.castShadow = true;
        tailJoint2.add(tailSeg2);
        const tailJoint3 = new THREE.Group();
        tailJoint3.position.z = -0.4;
        const tailSeg3 = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.13, 0.35), material);
        tailSeg3.position.z = -0.17;
        tailSeg3.castShadow = true;
        tailJoint3.add(tailSeg3);
        tailJoint2.add(tailJoint3);
        tailJoint.add(tailJoint2);
        group.add(tailJoint);
        group.userData.material = material;
        group.userData.parts = { body, head, flLeg, frLeg, blLeg, brLeg, tailJoint, tailJoint2, tailJoint3 };
        return group;
    }

    _animateDragon(group, t, walkPhase, isMoving) {
        const p = group.userData.parts;
        if (isMoving) {
            // Trab: Diagonale Bein-Paare (FL+BR vs FR+BL) gegenphasig
            const swing = Math.sin(walkPhase) * 0.45;
            p.flLeg.rotation.x = swing;
            p.brLeg.rotation.x = swing;
            p.frLeg.rotation.x = -swing;
            p.blLeg.rotation.x = -swing;
            p.body.position.y = 0.4 + Math.abs(Math.sin(walkPhase * 2)) * 0.025;
        } else {
            const breath = Math.sin(t * 1.4) * 0.02;
            p.body.position.y = 0.4 + breath;
            p.flLeg.rotation.x = 0;
            p.brLeg.rotation.x = 0;
            p.frLeg.rotation.x = 0;
            p.blLeg.rotation.x = 0;
        }
        // Schweif wellt sich immer (jedes Segment phasenversetzt)
        p.tailJoint.rotation.y = Math.sin(t * 2.0) * 0.25;
        p.tailJoint2.rotation.y = Math.sin(t * 2.0 - 0.6) * 0.35;
        p.tailJoint3.rotation.y = Math.sin(t * 2.0 - 1.2) * 0.45;
        // Kopf nickt leicht
        p.head.position.y = 0.5 + Math.sin(t * 1.6) * 0.02;
    }

    // Tiefes Disposal eines alten Soul-Group: Geometrien + Materialien
    // freigeben, damit GPU-Speicher nicht volläuft bei häufigem Wechsel.
    _disposeSoulGroup(group) {
        if (!group) return;
        group.traverse((node) => {
            if (node.geometry && typeof node.geometry.dispose === "function") {
                node.geometry.dispose();
            }
            if (node.material && typeof node.material.dispose === "function") {
                node.material.dispose();
            }
        });
    }

    applyPlayerSoul(name) {
        const defs = this.playerSoulDefs;
        const key = typeof name === "string" ? name.toLowerCase().trim() : "";
        // Deutsch + Englisch + Umlaut tolerieren, damit Chat + DSL + Save +
        // UI alle denselben Kanonisierungs-Pfad nehmen.
        const alias = {
            mensch: "human",
            human: "human",
            phönix: "phoenix",
            phoenix: "phoenix",
            drache: "dragon",
            drachen: "dragon",
            dragon: "dragon",
        };
        const canonical = alias[key] || (defs[key] ? key : null);
        if (!canonical) {
            this.log(`Seele '${name}' unbekannt — bekannt: ${Object.keys(defs).join(", ")}`, "ERROR");
            return false;
        }
        // Vor Mesh-Erstellung (z. B. loadState im frühen Bootstrap): Wahl
        // merken, init() ruft uns nach Mesh-Bau erneut auf.
        if (!this.state.scene) {
            this.state.player.soul = canonical;
            return false;
        }
        const def = defs[canonical];
        const old = this.state.playerMesh;
        // Position + Scale + Rotation übernehmen, damit Soul-Wechsel mitten
        // im Spiel keine Sprünge produziert.
        const newGroup = def.build();
        if (old) {
            newGroup.position.copy(old.position);
            newGroup.rotation.copy(old.rotation);
            newGroup.scale.copy(old.scale);
            newGroup.visible = old.visible;
            // Physics-Body-Referenz mitnehmen (Sync-Loop liest
            // mesh.userData.physicsBody) und Eintrag in state.rigidBodies
            // mitswappen — sonst überschreibt der Sync-Loop die Position
            // des bereits entfernten alten Group statt des neuen.
            if (old.userData && old.userData.physicsBody) {
                newGroup.userData.physicsBody = old.userData.physicsBody;
            }
            if (Array.isArray(this.state.rigidBodies)) {
                const idx = this.state.rigidBodies.indexOf(old);
                if (idx >= 0) this.state.rigidBodies[idx] = newGroup;
            }
            this.state.scene.remove(old);
            this._disposeSoulGroup(old);
        }
        this.state.scene.add(newGroup);
        this.state.playerMesh = newGroup;
        this.state.player.soul = canonical;
        this.log(`Seele gewechselt: ${def.label} (${canonical})`, "INFO");
        if (typeof document !== "undefined") {
            const select = document.getElementById("player-soul-select");
            if (select && select.value !== canonical) select.value = canonical;
            const status = document.getElementById("status-soul");
            if (status) status.textContent = def.label;
        }
        // Welle 6.D Etappe 1 — Stats neu berechnen + anwenden. Der Spieler ist
        // ein Compound; bei Seelen-Wechsel werden die Tag-Profile getauscht,
        // damit ändern sich automatisch HP-Max, Speed, Sprungkraft, Ausdauer
        // und Resistenzen. DSL-Tuning via player_speed/player_jump_power
        // überschreibt danach frei, bleibt aber bis zum nächsten Soul-Wechsel.
        this.recomputePlayerStats();
        return true;
    }

    // Welle 6.D Etappe 1.5 — Spieler-Stats aus dem Körper-Bauplan ableiten.
    //
    // Vision-Hebel: dieselbe Tag-Aggregation wie bei Architekturen + Materialien.
    // Die Seele liefert eine Liste Körper-Teile (Form × Material), `computeSoul
    // CompoundTags` macht MAX-Aggregation, und STAT_FROM_TAGS bildet aus den
    // entstandenen Tag-Werten acht Stats. V2 wird Rüstung + Werkzeug + Boosts
    // dazumischen (Etappe 2-3).
    computePlayerStats() {
        const soulName = (this.state.player && this.state.player.soul) || "human";
        const soul = this.playerSoulDefs[soulName];
        const compoundTags = this.computeSoulCompoundTags(soul);
        // Defensiv: alle MATERIAL_TAG_KEYS auf Zahl auflösen, fehlende auf 0.
        // Werte können bis ~3 reichen (FORM_TAG_ACTIVATION × Material-Tag);
        // STAT_FROM_TAGS-Formeln tolerieren das (lineare Multiplikatoren).
        const finalTags = {};
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            finalTags[key] = Number(compoundTags[key]) || 0;
        }
        const stats = {};
        for (const stat of Object.keys(AnazhRealm.STAT_FROM_TAGS)) {
            stats[stat] = AnazhRealm.STAT_FROM_TAGS[stat](finalTags);
        }
        return { tags: finalTags, stats };
    }

    // Stats berechnen + auf state anwenden (Soul-Wechsel-Pfad). HP+Stamina
    // werden bei Wechsel auf max gesetzt (Phönix-Wandlung in Etappe 3 nutzt
    // diesen Pfad bewusst — Wandlung heilt). DSL-Ops player_speed +
    // player_jump_power dürfen state.speed/jumpPower danach frei überschreiben.
    recomputePlayerStats() {
        const computed = this.computePlayerStats();
        if (!this.state.player) return computed;
        this.state.player.stats = computed.stats;
        this.state.player.statTags = computed.tags;
        // Anwendung auf die Live-Bewegungs-Werte. Sprint = 2× speed (heutige
        // Konvention: speed=6, sprintSpeed=12).
        this.state.speed = computed.stats.speed;
        this.state.sprintSpeed = computed.stats.speed * 2;
        this.state.jumpPower = computed.stats.jumpPower;
        // HP + Stamina als Lebens-Werte (V1 noch ohne Schadens-System; werden
        // mit 6.C2 pfad-Modus aktiv). Auf MAX setzen bei jedem Soul-Wechsel.
        this.state.player.hpMax = computed.stats.hpMax;
        this.state.player.hp = computed.stats.hpMax;
        this.state.player.staminaMax = computed.stats.staminaMax;
        this.state.player.stamina = computed.stats.staminaMax;
        // UI-Render anstoßen, falls Spieler-Drawer offen ist.
        if (typeof this.renderPlayerStatsUI === "function") this.renderPlayerStatsUI();
        return computed;
    }

    // Pro-Frame-Animation des aktuellen Soul-Group. Wird im Render-Loop
    // direkt nach der Kamera aufgerufen — playerMesh.position ist da schon
    // mit dem Physik-Body synchronisiert.
    animatePlayerSoul(currentTime) {
        const mesh = this.state.playerMesh;
        if (!mesh || !mesh.userData || !mesh.userData.parts) return;
        const def = this.playerSoulDefs[this.state.player.soul || "human"];
        if (!def || typeof def.animate !== "function") return;
        const p = this.state.player;
        // isMoving aus horizontaler Geschwindigkeit. Schwelle 0.4 m/s
        // verhindert Mikro-Walk wenn der Spieler steht aber leicht rutscht.
        let isMoving = false;
        if (this.state.playerBody && typeof this.state.playerBody.getLinearVelocity === "function") {
            const v = this.state.playerBody.getLinearVelocity();
            const speed = Math.hypot(v.x(), v.z());
            isMoving = speed > 0.4;
        }
        // Walk-Phase nur in Bewegung akkumulieren (keine Glieder-Sprünge
        // beim Stop). Frame-Delta aus animationLastTick.
        const last = p.animationLastTick;
        const dt = last > -Infinity ? Math.max(0, currentTime - last) : 0;
        p.animationLastTick = currentTime;
        if (isMoving) {
            const stepHz = this.state.player.soul === "dragon" ? 4.5 : 5.5;
            p.walkPhase += dt * stepHz;
        }
        def.animate(mesh, currentTime, p.walkPhase, isMoving);
    }

    // ### Ring 6 – architectureTemplates V1 ###
    //
    // Drei DSL-Primitives, die je einen THREE.Group aus Three.js-Primitives
    // bauen: Dorf (Hütten + Lagerplatz), Tempel (Pfeiler + Dach + Altar),
    // Wasserfall (Vertex-animierte Wasser-Plane + Becken). Jede Struktur
    // bekommt einen Seed; Save persistiert nur {type, position, seed} und
    // der Mesh wird beim Laden aus dem Seed neu gebaut — keine Mesh-Daten
    // im JSON, kleine Save-Dateien.
    //
    // Strukturen sind global (nicht pro-Chunk parented). Sie überleben
    // Chunk-Prune und liegen in `state.architectures`. FIFO-Cap (30) gegen
    // Mesh-Spam wenn der Nexus mehrmals hintereinander baut.
    //
    // Pro-Frame-Animation (z. B. fließendes Wasser) läuft via
    // `tickArchitectures(t)` — jede Struktur darf eine `userData.animate`-
    // Funktion mitbringen, die der Tick aufruft. Statische Strukturen
    // (Hütten, Tempel) brauchen das nicht.

    _seedRng(seed) {
        let s = (seed | 0) >>> 0 || 1;
        return () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    // ### Ring 6.4 — Bauplan-Datenschicht ###
    //
    // Vorher: drei hartcodierte `_buildVillageGroup/_buildTempleGroup/
    // _buildWaterfallGroup`-Funktionen mit prozeduraler Logik. Jetzt ist
    // ein Bauplan eine flache JSON-Liste von Primitiv-Parts (box, sphere,
    // cylinder, cone, pyramid, octahedron, plane, torus), die `_buildFrom-
    // Blueprint` zu einem THREE.Group rendert. Vorteile:
    //   - User kann eigene Baupläne im Editor (6.6) hinzufügen.
    //   - Save persistiert Strukturen als {blueprint-Name, position, seed}
    //     plus eigene Baupläne als Daten.
    //   - Fraktale Verschachtelung (Bauplan referenziert anderen Bauplan)
    //     wird natürlich aus dem Datenschema heraus möglich (V3).
    //
    // Trade-off: Built-in Dörfer/Tempel sind jetzt alle identisch — die
    // seed-basierte Variation (5-8 Hütten zufällig platziert) ist weg.
    // Wer Varianten will, speichert sie als verschiedene Baupläne. Der
    // Gewinn an Editierbarkeit + Saveability schlägt den Verlust an
    // Prozeduralität bei weitem.
    //
    // Part-Format:
    // ```
    // {
    //     shape: "box" | "sphere" | "cylinder" | "cone" | "pyramid" |
    //            "octahedron" | "plane" | "torus",
    //     color: 0xRRGGBB,
    //     position: { x, y, z },
    //     rotation: { x, y, z }, // optional, in Radiant
    //     size: { x, y, z },     // Größe je Primitiv-spezifisch interpretiert
    //     opacity: 0..1,         // optional, < 1 macht transparent
    //     animate: "water_wave", // optional, Marker für tickArchitectures
    // }
    // ```
    //
    // Bauplan-Format:
    // ```
    // {
    //     name: "village",
    //     label: "Dorf",
    //     builtIn: true,         // false bei User-Baupläne
    //     parts: [...]
    // }
    // ```

    _makePartGeometry(part) {
        const sx = (part.size && part.size.x) || 1;
        const sy = (part.size && part.size.y) || sx;
        const sz = (part.size && part.size.z) || sx;
        const segments = part.segments || 12;
        switch (part.shape) {
            case "sphere":
                return new THREE.SphereGeometry(sx / 2, segments, Math.max(4, Math.floor(segments * 0.6)));
            case "cylinder":
                return new THREE.CylinderGeometry(sx / 2, sz / 2, sy, segments);
            case "cone":
                return new THREE.ConeGeometry(sx / 2, sy, segments);
            case "pyramid":
                // Vier-seitige Pyramide = Kegel mit 4 Segmenten
                return new THREE.ConeGeometry(sx / 2, sy, 4);
            case "octahedron":
                return new THREE.OctahedronGeometry(sx / 2, 0);
            case "plane":
                // Plane: optional segmentiert für Vertex-Animation. Default
                // 1×1, für animate="water_wave" lieber 6×18.
                if (part.animate === "water_wave") {
                    return new THREE.PlaneGeometry(sx, sy, 6, 18);
                }
                return new THREE.PlaneGeometry(sx, sy);
            case "torus":
                return new THREE.TorusGeometry(sx / 2, Math.max(0.05, sx / 6), 8, segments);
            case "helix": {
                // Welle 4 Phase 2 — Helix als TubeGeometry über eine
                // parametrische Kurve. size.x = Radius (Diameter der Wendel),
                // size.y = Gesamt-Länge, size.z = Anzahl Windungen. Tube-
                // Radius ist proportional zu sx/12, mindestens 0.05.
                const helixRadius = Math.max(0.05, sx / 2);
                const helixLength = Math.max(0.1, sy);
                const turns = Math.max(0.5, Math.min(20, sz || 3));
                const tubeRadius = Math.max(0.05, sx / 12);
                const curve = new THREE.Curve();
                curve.getPoint = function (t, optionalTarget) {
                    const target = optionalTarget || new THREE.Vector3();
                    const angle = t * turns * Math.PI * 2;
                    return target.set(
                        Math.cos(angle) * helixRadius,
                        (t - 0.5) * helixLength,
                        Math.sin(angle) * helixRadius
                    );
                };
                const tubularSegments = Math.max(20, Math.floor(turns * 16));
                return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, 6, false);
            }
            case "box":
            default:
                return new THREE.BoxGeometry(sx, sy, sz);
        }
    }

    // Einen Bauplan in einen THREE.Group rendern. Materialien werden pro
    // Part erzeugt (mehrere Parts mit gleicher Farbe würden sich Material
    // teilen können — V1 hält's einfach). Wasser-Animation kommt automatisch,
    // wenn ein Part `animate: "water_wave"` trägt.
    _buildFromBlueprint(blueprint, depth, visited) {
        // Welle 2 C — fraktale Verschachtelung. Ein Part mit shape:"blueprint"
        // referenziert via refName einen anderen Bauplan, der als Sub-Group
        // an dieser Position eingebettet wird. Cycle-Guard via visited-Set,
        // Tiefen-Cap auf MAX_BLUEPRINT_DEPTH (4 — Wald → Baum → Ast → Blatt
        // ist mehr als genug für sichtbare Fraktale ohne GPU-Explosion).
        const MAX_BLUEPRINT_DEPTH = 4;
        const d = depth || 0;
        const seen = visited || new Set();
        const group = new THREE.Group();
        if (!blueprint || !Array.isArray(blueprint.parts)) {
            group.userData.kind = blueprint ? blueprint.name : "empty";
            return group;
        }
        if (d > MAX_BLUEPRINT_DEPTH) {
            group.userData.kind = `${blueprint.name}_depthCapped`;
            return group;
        }
        // Cycle-Guard: ein Bauplan kann sich nicht selbst (direkt/indirekt)
        // enthalten — sonst Endlos-Rekursion. visited bleibt eine Pfad-Liste,
        // sodass Geschwister-Verwendungen erlaubt sind.
        if (seen.has(blueprint.name)) {
            group.userData.kind = `${blueprint.name}_cycle`;
            return group;
        }
        seen.add(blueprint.name);
        const materials = [];
        const waveTargets = [];
        for (const part of blueprint.parts) {
            if (part.shape === "blueprint" && typeof part.refName === "string") {
                const ref = this.state.blueprints && this.state.blueprints[part.refName];
                if (!ref) continue;
                const sub = this._buildFromBlueprint(ref, d + 1, seen);
                const pos = part.position || { x: 0, y: 0, z: 0 };
                sub.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
                if (part.rotation) {
                    sub.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
                }
                const s = part.scale;
                if (typeof s === "number" && s > 0) {
                    sub.scale.setScalar(s);
                } else if (s && typeof s === "object") {
                    sub.scale.set(s.x || 1, s.y || 1, s.z || 1);
                }
                group.add(sub);
                continue;
            }
            const geom = this._makePartGeometry(part);
            // Welle 4 Phase 3 — Präzision moduliert Helligkeit. MeshBasic
            // bringt kein PBR-Roughness mit; statt MeshStandardMaterial
            // einzuführen (kostspielig), skalieren wir die Farbe sichtbar:
            // 0.4 Präzision → 76%, 0.97 → 98.8%. Eine lumpige Hand-Kugel
            // wirkt damit grau-matt, eine polierte hat ihre volle Farbe.
            const baseColor = typeof part.color === "number" ? part.color : 0xffffff;
            const precision = this.computePartPrecision(part);
            const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
            const r8 = (baseColor >> 16) & 0xff;
            const g8 = (baseColor >> 8) & 0xff;
            const b8 = baseColor & 0xff;
            const tintedColor =
                ((Math.round(r8 * brightness) & 0xff) << 16) |
                ((Math.round(g8 * brightness) & 0xff) << 8) |
                (Math.round(b8 * brightness) & 0xff);
            const matOpts = { color: tintedColor };
            if (Number.isFinite(part.opacity) && part.opacity < 1) {
                matOpts.transparent = true;
                matOpts.opacity = part.opacity;
            }
            const mat = new THREE.MeshBasicMaterial(matOpts);
            materials.push(mat);
            const mesh = new THREE.Mesh(geom, mat);
            const pos = part.position || { x: 0, y: 0, z: 0 };
            mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
            if (part.rotation) {
                mesh.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            if (part.animate === "water_wave") waveTargets.push(mesh);
        }
        seen.delete(blueprint.name);
        group.userData.kind = blueprint.name;
        group.userData.materials = materials;
        // Wasser-Animations-Hook: alle Wasser-Planes Sinus-wellen lassen.
        // baseY je Mesh cachen damit die Welle relativ zur Ausgangsposition
        // schwingt statt absolut zur 0.
        if (waveTargets.length > 0) {
            const captured = waveTargets.map((mesh) => {
                const positions = mesh.geometry.attributes.position;
                const baseY = new Float32Array(positions.count);
                for (let i = 0; i < positions.count; i++) baseY[i] = positions.getY(i);
                return { mesh, positions, baseY };
            });
            group.userData.animate = (t) => {
                for (const cap of captured) {
                    for (let i = 0; i < cap.positions.count; i++) {
                        const y = cap.baseY[i];
                        const wave = Math.sin(t * 4.5 + y * 1.5) * 0.12;
                        cap.positions.setZ(i, wave);
                    }
                    cap.positions.needsUpdate = true;
                }
            };
        }
        // Welle 6.F1 — Verbindungs-Linien zwischen verbundenen Parts. Nur am
        // Top-Level rendern (nicht für nested Blueprint-Referenzen), sonst
        // doppelt sich der Render bei Fraktal-Bauplänen. Farbe + Opacity
        // folgen der Lastformel (W5-A): stark = grün, ok = goldgelb, schwach
        // = rot (= Brech-Warning, V1 nur visuell).
        if (!depth && Array.isArray(blueprint.connections) && blueprint.connections.length > 0) {
            this._addConnectionLines(group, blueprint);
        }
        return group;
    }

    // Welle 6.F1 — Verbindungs-Linien an einen Bauplan-Group anhängen.
    _addConnectionLines(group, blueprint) {
        const conns = blueprint.connections || [];
        const parts = blueprint.parts || [];
        for (const c of conns) {
            const a = parts[c.partA];
            const b = parts[c.partB];
            if (!a || !b) continue;
            const pa = a.position || { x: 0, y: 0, z: 0 };
            const pb = b.position || { x: 0, y: 0, z: 0 };
            const geom = new THREE.BufferGeometry();
            geom.setAttribute(
                "position",
                new THREE.Float32BufferAttribute([pa.x || 0, pa.y || 0, pa.z || 0, pb.x || 0, pb.y || 0, pb.z || 0], 3)
            );
            const strength = this.computeConnectionStrength(c, blueprint);
            const color = this._connectionColor(strength);
            // Opacity 0.75 lässt die Linie sichtbar ohne dass sie den Bauplan dominiert.
            const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 });
            const line = new THREE.Line(geom, mat);
            line.userData.isConnectionLine = true;
            line.userData.connectionStrength = strength;
            line.userData.connectionType = c.type;
            group.add(line);
        }
    }

    // Welle 6.F1+F2 — Farb-Mapping aus Verbindungs-Stärke (0..3-Skala der
    // computeConnectionStrength-Lastformel). <0.7 = Brech-Risiko (rot),
    // 0.7..1.5 = ok (goldgelb), ≥1.5 = stark (grün).
    _connectionColor(strength) {
        if (strength < 0.7) return 0xff5555;
        if (strength < 1.5) return 0xffcc44;
        return 0x66ff88;
    }

    // Default-Baupläne als Daten. Drei built-ins, die das ersetzen, was
    // vorher als JS-Funktionen lebte. Wer Variation will, klont diese und
    // ändert Parts.
    _defaultBlueprints() {
        // Hilfsfunktionen für die Built-in-Generierung. Bauen einen Bauplan
        // imperativ und liefern flache Part-Listen zurück. Da das nur EINMAL
        // beim Initialisieren läuft, kostet das nichts.
        const villageParts = [];
        const hutCount = 6;
        for (let i = 0; i < hutCount; i++) {
            const angle = (i / hutCount) * Math.PI * 2;
            const radius = 7.5;
            const hx = Math.cos(angle) * radius;
            const hz = Math.sin(angle) * radius;
            // Körper
            villageParts.push({
                shape: "box",
                color: 0x6e3a14,
                position: { x: hx, y: 0.8, z: hz },
                rotation: { x: 0, y: -angle + Math.PI, z: 0 },
                size: { x: 2.0, y: 1.6, z: 2.4 },
            });
            // Dach
            villageParts.push({
                shape: "pyramid",
                color: 0x8b2a1e,
                position: { x: hx, y: 2.2, z: hz },
                rotation: { x: 0, y: -angle + Math.PI + Math.PI / 4, z: 0 },
                size: { x: 3.4, y: 1.2, z: 3.4 },
            });
        }
        // Lagerplatz
        villageParts.push({
            shape: "cylinder",
            color: 0x707070,
            position: { x: 0, y: 0.05, z: 0 },
            size: { x: 4.4, y: 0.15, z: 4.4 },
            segments: 12,
        });

        const templeParts = [];
        const pillarCount = 6;
        const pillarRadius = 3.2;
        const pillarHeight = 4.0;
        for (let i = 0; i < pillarCount; i++) {
            const angle = (i / pillarCount) * Math.PI * 2;
            templeParts.push({
                shape: "cylinder",
                color: 0xc8c0a8,
                position: {
                    x: Math.cos(angle) * pillarRadius,
                    y: pillarHeight / 2,
                    z: Math.sin(angle) * pillarRadius,
                },
                size: { x: 0.6, y: pillarHeight, z: 0.7 },
                segments: 8,
            });
        }
        // Dach
        templeParts.push({
            shape: "cylinder",
            color: 0xc8c0a8,
            position: { x: 0, y: pillarHeight + 0.2, z: 0 },
            size: { x: (pillarRadius + 0.6) * 2, y: 0.4, z: (pillarRadius + 0.6) * 2 },
            segments: 8,
        });
        // Altar
        templeParts.push({
            shape: "box",
            color: 0x6a4a8a,
            position: { x: 0, y: 0.45, z: 0 },
            size: { x: 1.2, y: 0.9, z: 1.2 },
        });
        // Kristall-Spitze
        templeParts.push({
            shape: "octahedron",
            color: 0xd9a3ff,
            position: { x: 0, y: 1.4, z: 0 },
            size: { x: 0.9, y: 0.9, z: 0.9 },
        });

        const waterfallParts = [
            // Klippe hinten
            {
                shape: "box",
                color: 0x4a4a55,
                position: { x: 0, y: 4.0, z: -0.6 },
                size: { x: 4.0, y: 8.0, z: 1.0 },
            },
            // Wasser-Plane (segmentiert + animiert)
            {
                shape: "plane",
                color: 0x4ea0d4,
                position: { x: 0, y: 4.0, z: 0.05 },
                size: { x: 2.6, y: 7.5, z: 1 },
                opacity: 0.75,
                animate: "water_wave",
            },
            // Becken am Fuß
            {
                shape: "cylinder",
                color: 0x2a6a8a,
                position: { x: 0, y: 0.2, z: 0 },
                size: { x: 5.0, y: 0.4, z: 5.0 },
                segments: 16,
                opacity: 0.7,
            },
        ];

        return {
            village: { name: "village", label: "Dorf", builtIn: true, parts: villageParts },
            temple: { name: "temple", label: "Tempel", builtIn: true, parts: templeParts },
            waterfall: { name: "waterfall", label: "Wasserfall", builtIn: true, parts: waterfallParts },
        };
    }

    // ### Welle 4 Phase 1 — Materialien als Tag-Profile ###
    // 6 Built-in-Materialien decken den qualitativen Spannungsbogen von
    // weich-organisch (leder, holz) über stabil-mineralisch (stein, eisen,
    // bronze) bis kristallin-arkann (quarz). Wer mehr Vielfalt will, fügt
    // via DSL-Op `define_material` eigene hinzu. Material-Tag-Werte liegen
    // im Bereich 0..1 als Potenzial; die Aktivierung pro Form folgt erst
    // in Phase 2 (FORM_TAG_ACTIVATION-Matrix).
    _defaultMaterials() {
        const make = (name, label, color, tags) => ({
            name,
            label,
            builtIn: true,
            color,
            tags: { ...AnazhRealm.MATERIAL_TAG_DEFAULTS, ...tags },
        });
        const list = [
            make("stein", "Stein", 0x7a7a7a, {
                härte: 0.65,
                dichte: 0.85,
                zähigkeit: 0.3,
                wärmeleitung: 0.25,
                resoniert: 0.3,
            }),
            make("holz", "Holz", 0x8b5a2b, {
                härte: 0.2,
                dichte: 0.4,
                zähigkeit: 0.6,
                wärmeleitung: 0.15,
                magieleitung: 0.3,
                brennbar: 0.8,
                resoniert: 0.5,
                lebendig: 0.7,
            }),
            make("eisen", "Eisen", 0x484850, {
                härte: 0.75,
                dichte: 0.9,
                zähigkeit: 0.65,
                wärmeleitung: 0.7,
                stromleitung: 0.85,
                resoniert: 0.6,
            }),
            make("bronze", "Bronze", 0xa97b3c, {
                härte: 0.55,
                dichte: 0.88,
                zähigkeit: 0.7,
                wärmeleitung: 0.75,
                stromleitung: 0.7,
                magieleitung: 0.25,
                resoniert: 0.75,
            }),
            make("quarz", "Quarz", 0xcce6f5, {
                härte: 0.7,
                dichte: 0.65,
                zähigkeit: 0.15,
                magieleitung: 0.85,
                transparent: 0.95,
                resoniert: 0.9,
            }),
            make("leder", "Leder", 0xa07050, {
                härte: 0.15,
                dichte: 0.35,
                zähigkeit: 0.75,
                magieleitung: 0.2,
                brennbar: 0.7,
                lebendig: 0.3,
            }),
            // Welle 6.D Etappe 1.5 — Körper-Materialien für das Seelen-Bauplan-
            // System. Lebendig=1 markiert sie als „Körper-fähig"; ansonsten
            // gleiche MATERIAL_TAG_KEYS-Sprache wie alles andere. Können auch
            // für Bauwerke verwendet werden (Heilige Lektion: eine Sprache).
            make("knochen", "Knochen", 0xe8dfc4, {
                härte: 0.8,
                dichte: 0.6,
                zähigkeit: 0.5,
                resoniert: 0.4,
                lebendig: 1.0,
            }),
            make("fleisch", "Fleisch", 0xb55050, {
                härte: 0.15,
                dichte: 0.4,
                zähigkeit: 0.75,
                wärmeleitung: 0.45,
                brennbar: 0.35,
                lebendig: 1.0,
            }),
            make("federn", "Federn", 0xf2c870, {
                härte: 0.1,
                dichte: 0.1,
                zähigkeit: 0.3,
                wärmeleitung: 0.7,
                magieleitung: 0.55,
                brennbar: 0.7,
                resoniert: 0.5,
                lebendig: 1.0,
            }),
            make("schuppen", "Schuppen", 0x355c3a, {
                härte: 0.9,
                dichte: 0.85,
                zähigkeit: 0.8,
                wärmeleitung: 0.55,
                stromleitung: 0.3,
                magieleitung: 0.45,
                resoniert: 0.45,
                lebendig: 1.0,
            }),
            make("glut", "Glut", 0xff5a14, {
                härte: 0.1,
                dichte: 0.25,
                zähigkeit: 0.2,
                wärmeleitung: 0.95,
                magieleitung: 0.75,
                brennbar: 1.0,
                resoniert: 0.65,
                lebendig: 1.0,
            }),
        ];
        const out = {};
        for (const m of list) out[m.name] = m;
        return out;
    }

    // Mutations-Pfad für eigene Materialien. Whitelist auf MATERIAL_TAG_KEYS,
    // Werte ge-clamp 0..1, Built-in-Überschreiben verboten, Cap 32 eigene.
    // Aufrufer: DSL-Op `define_material` und ggf. spätere UI.
    defineMaterial(name, color, tags) {
        if (typeof name !== "string" || name.length === 0 || name.length > 40) {
            return { ok: false, reason: "invalid_name" };
        }
        const safe = name.replace(/[^a-z0-9_-]/gi, "").slice(0, 40);
        if (!safe) return { ok: false, reason: "invalid_name_after_sanitize" };
        const existing = this.state.materials && this.state.materials[safe];
        if (existing && existing.builtIn) return { ok: false, reason: "cannot_overwrite_builtin" };
        const customCount = Object.values(this.state.materials || {}).filter((m) => !m.builtIn).length;
        if (!existing && customCount >= 32) return { ok: false, reason: "too_many_custom_materials" };
        if (!tags || typeof tags !== "object") return { ok: false, reason: "tags_not_object" };
        const cleanTags = { ...AnazhRealm.MATERIAL_TAG_DEFAULTS };
        for (const key of AnazhRealm.MATERIAL_TAG_KEYS) {
            const v = Number(tags[key]);
            if (Number.isFinite(v)) cleanTags[key] = Math.max(0, Math.min(1, v));
        }
        const cleanColor = Number.isFinite(color) ? (color | 0) & 0xffffff : 0x888888;
        this.state.materials[safe] = {
            name: safe,
            label: safe,
            builtIn: false,
            color: cleanColor,
            tags: cleanTags,
        };
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, name: safe };
    }

    // ### Welle 4 Phase 3 — Werkzeuge + opChain + Präzision ###
    // Werkzeuge sind Datensätze; das Werkzeug bringt den Cap mit, nicht eine
    // hardcoded Op-Tabelle. Damit lässt sich die Rekursivität aus Konzept
    // §4.3 (Maschinen sind aus dem System gebaut → Maschinen-Cap kommt aus
    // ihrer eigenen Präzision) später in Welle 6 anhängen, ohne die op-
    // Chain-Datenstruktur zu ändern.
    _defaultTools() {
        const list = [
            {
                name: "hände",
                label: "Hände",
                opClass: "subtractive",
                opName: "hand_knap",
                precisionCap: 0.4,
                isStarter: true,
                builtIn: true,
            },
            {
                name: "feuerstein-knapper",
                label: "Feuerstein-Knapper",
                opClass: "subtractive",
                opName: "hand_knap",
                precisionCap: 0.5,
                isStarter: true,
                builtIn: true,
            },
            {
                name: "hammer",
                label: "Hammer",
                opClass: "plastic",
                opName: "forge",
                precisionCap: 0.7,
                isStarter: true,
                builtIn: true,
            },
            {
                name: "feile",
                label: "Feile",
                opClass: "subtractive",
                opName: "file",
                precisionCap: 0.85,
                isStarter: true,
                builtIn: true,
            },
            {
                name: "polierscheibe",
                label: "Polierscheibe",
                opClass: "subtractive",
                opName: "polish",
                precisionCap: 0.97,
                isStarter: true,
                builtIn: true,
            },
        ];
        const out = {};
        for (const t of list) out[t.name] = t;
        return out;
    }

    // Default-opChain für neue Parts. Hand_knap mit cap 0.4 — alles ist am
    // Anfang grob. Spieler hebt das Dach durch weitere Ops (feile, polier).
    _defaultPartOpChain() {
        return [{ tool: "hände", op: "hand_knap", cap: 0.4, at: 0 }];
    }

    // Finale Präzision eines Parts: Minimum aller Op-Caps (Konzept §2.3,
    // Kernregel). Der schlechteste Schritt deckelt das Ganze — eine
    // Gussform-Kugel (0.5) bleibt 0.5, selbst wenn danach poliert wird,
    // weil der Politur-Schritt keine Rauheit aus dem Guss entfernt.
    computePartPrecision(part) {
        if (!part || typeof part !== "object") return 0.4;
        if (!Array.isArray(part.opChain) || part.opChain.length === 0) return 0.4;
        let min = 1;
        for (const op of part.opChain) {
            const cap = Number(op && op.cap);
            if (Number.isFinite(cap) && cap < min) min = cap;
        }
        return min;
    }

    // Mittlere Präzision eines Compounds (für Welt-Effekt-Schwellen).
    _compoundAvgPrecision(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let sum = 0;
        for (const p of blueprint.parts) sum += this.computePartPrecision(p);
        return sum / blueprint.parts.length;
    }

    // Mutationspfad: Werkzeug auf Part anwenden. Validiert Tool-Besitz +
    // Material × Op-Klassen-Kompatibilität (Konzept §3.2). Operationen
    // werden ANGEHÄNGT, nicht ersetzt — die opChain ist Geschichte, nicht
    // Auswahl. Built-in-Baupläne bleiben unberührbar.
    applyOpToPart(blueprintName, partIndex, toolName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.parts) || partIndex < 0 || partIndex >= bp.parts.length) {
            return { ok: false, reason: "invalid_part_index" };
        }
        const tool = this.state.tools && this.state.tools[toolName];
        if (!tool) return { ok: false, reason: "tool_unknown" };
        const owned = Array.isArray(this.state.player.tools) && this.state.player.tools.includes(toolName);
        if (!owned) return { ok: false, reason: "tool_not_owned" };
        const part = bp.parts[partIndex];
        const matName = part.material || "stein";
        const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
        // Eigene Materialien sind dem Konzept-Mapping nicht bekannt — wir
        // erlauben dort alle vier Op-Klassen, statt sie zu blockieren. Wer
        // genauer kalibrieren will, definiert das Compat-Profil später.
        if (compat && !compat.includes(tool.opClass)) {
            return { ok: false, reason: "material_op_incompatible" };
        }
        if (!Array.isArray(part.opChain)) part.opChain = this._defaultPartOpChain();
        part.opChain.push({
            tool: toolName,
            op: tool.opName,
            cap: tool.precisionCap,
            at: performance.now() / 1000,
        });
        return { ok: true, precision: this.computePartPrecision(part) };
    }

    // ### Welle 4 Phase 2 — Aktivierte Tag-Stärken ###
    // computePartTags(part): pro Part die aktivierten Tags (Form × Material).
    // Werte 0..3, der Bereich aus FORM_TAG_ACTIVATION × MATERIAL_TAG (0..1).
    // Unbekannte Shape (z. B. "blueprint") oder fehlendes Material → leeres
    // Objekt. Caller bekommen damit ein Lookup, das pro Tag-Achse einen
    // Strahler liefert, dessen Größe Material-Wahl + Form-Wahl spiegelt.
    computePartTags(part) {
        if (!part || typeof part !== "object") return {};
        const activation = AnazhRealm.FORM_TAG_ACTIVATION[part.shape];
        if (!activation) return {};
        const matName = part.material || "stein";
        const material = this.state.materials && this.state.materials[matName];
        if (!material || !material.tags) return {};
        const out = {};
        for (const tag of AnazhRealm.MATERIAL_TAG_KEYS) {
            const val = (activation[tag] || 0) * (material.tags[tag] || 0);
            if (val > 0) out[tag] = val;
        }
        return out;
    }

    // computeCompoundTags(blueprint): Aggregation über alle Parts mit MAX
    // statt SUM. Designprinzip aus Konzept §9.2: Sum führt zu Stat-Matsch
    // (17-teiliger Quaderturm hätte 17× Trägheit), Max hält die Wirkungen
    // klar. Pro Tag-Achse erbt der Compound vom kompetentesten Part.
    computeCompoundTags(blueprint) {
        const out = {};
        if (!blueprint || !Array.isArray(blueprint.parts)) return out;
        for (const part of blueprint.parts) {
            const partTags = this.computePartTags(part);
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        return out;
    }

    // ### Welle 5 B — räumliche Emergenz ###
    // Konzept §5.2 fünf räumliche Prinzipien:
    //   (1) Spitze richtet nach außen — Phase 1 (this commit + W5-B-1).
    //   (2) Hohlraum enthält, dämpft, verstärkt — Phase 2.
    //   (3) Symmetrieachsen tragen Alignment — Phase 2.
    //   (4) Kontakt überträgt Tags — Phase 1.
    //   (5) Abstände erzeugen Resonanz oder Interferenz — Phase 2.
    // Alle drei Phase-2-Prinzipien sind COMPOUND-Bonusse (im Gegensatz zu
    // Phase 1, die per-Part wirkt). Sie werden auf der MAX-Aggregation
    // angewandt — multiplikativ, damit sie schon-aktivierte Tags verstärken
    // statt freie Werte aufzuaddieren.

    // Bounding-Box eines Parts in lokalen Compound-Koordinaten. Approximiert:
    // jedes Part ist eine Box von position - size/2 bis position + size/2.
    // Für Helix/Cone/Pyramid passt das gut genug, für blueprint-Refs greifen
    // wir auf scale * 1 zurück (zeigt die ungefähre Position).
    _partBoundingBox(part) {
        if (!part || typeof part !== "object") return null;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const size = part.size || { x: 1, y: 1, z: 1 };
        const sx = Math.max(0.1, Math.abs(size.x || 1));
        const sy = Math.max(0.1, Math.abs(size.y || sx));
        const sz = Math.max(0.1, Math.abs(size.z || sx));
        return {
            min: { x: pos.x - sx / 2, y: pos.y - sy / 2, z: pos.z - sz / 2 },
            max: { x: pos.x + sx / 2, y: pos.y + sy / 2, z: pos.z + sz / 2 },
            center: { x: pos.x, y: pos.y, z: pos.z },
        };
    }

    // Compound-Bounding-Box als Union aller Parts. Liefert min/max + Extent
    // (Größe pro Achse). Wird vom „Spitze richtet"-Pfad gebraucht: ein Part
    // gilt als Spitze, wenn es nahe dem Compound-Rand liegt (innerhalb 20 %
    // der jeweiligen Extent-Spanne).
    _compoundBoundingBox(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return null;
        let minX = Infinity,
            minY = Infinity,
            minZ = Infinity;
        let maxX = -Infinity,
            maxY = -Infinity,
            maxZ = -Infinity;
        for (const p of blueprint.parts) {
            const bb = this._partBoundingBox(p);
            if (!bb) continue;
            if (bb.min.x < minX) minX = bb.min.x;
            if (bb.min.y < minY) minY = bb.min.y;
            if (bb.min.z < minZ) minZ = bb.min.z;
            if (bb.max.x > maxX) maxX = bb.max.x;
            if (bb.max.y > maxY) maxY = bb.max.y;
            if (bb.max.z > maxZ) maxZ = bb.max.z;
        }
        if (minX === Infinity) return null;
        return {
            min: { x: minX, y: minY, z: minZ },
            max: { x: maxX, y: maxY, z: maxZ },
            extent: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ },
        };
    }

    // Klassifiziert Position eines Parts im Compound. Liefert ein Set von
    // Labels: "at_top"/"at_bottom"/"at_outside"/"central". Ein Part kann
    // mehrere Labels haben (z. B. Spitze am Rand UND oben). Schwelle 20 %
    // der Compound-Extent — eng genug, dass nur echte Rand-Parts triggern,
    // großzügig genug, dass Float-Drift nicht ins Bild läuft.
    _classifyPartPosition(part, compoundBB) {
        const labels = new Set();
        if (!part || !compoundBB) return labels;
        const pos = part.position || { x: 0, y: 0, z: 0 };
        const e = compoundBB.extent;
        // "at_top": nahe maxY innerhalb 20 % der y-Extent
        if (e.y > 0.1 && pos.y >= compoundBB.max.y - e.y * 0.2) labels.add("at_top");
        if (e.y > 0.1 && pos.y <= compoundBB.min.y + e.y * 0.2) labels.add("at_bottom");
        // "at_outside": radial weit vom Zentrum (xz-Distanz > 60 % des
        // Compound-Radius). Mehrere Achsen kombinieren via Pythagoras.
        const centerX = (compoundBB.min.x + compoundBB.max.x) / 2;
        const centerZ = (compoundBB.min.z + compoundBB.max.z) / 2;
        const radialDist = Math.hypot(pos.x - centerX, pos.z - centerZ);
        const compoundRadius = Math.hypot(e.x, e.z) / 2;
        if (compoundRadius > 0.1 && radialDist > compoundRadius * 0.6) labels.add("at_outside");
        if (labels.size === 0) labels.add("central");
        return labels;
    }

    // Prinzip 2: Hohlraum enthält. Sphere oder Torus mit einer Bounding-Box,
    // die das Zentrum eines anderen Parts enthält, formen einen Hohlraum.
    // Container UND Inhalt bekommen einen Resonanz-Bonus (eine Glocke ist
    // resonant durch ihre Form; Glocke + Klöppel verstärken einander).
    // Pragma: AABB-Containment statt echter geometrischer Hülle — eine
    // Torus-Box ist deutlich größer als der echte Ring, aber für die
    // Compound-Logik („gibt es einen Hohlraum, der Resonanz trägt?")
    // ist das die richtige Granularität.
    _findHollowPairs(blueprint) {
        const pairs = [];
        const parts = blueprint.parts || [];
        const partBBs = parts.map((p) => this._partBoundingBox(p));
        const partVolumes = partBBs.map((bb) => {
            if (!bb) return 0;
            return Math.max(0, (bb.max.x - bb.min.x) * (bb.max.y - bb.min.y) * (bb.max.z - bb.min.z));
        });
        for (let i = 0; i < parts.length; i++) {
            const outer = parts[i];
            if (!AnazhRealm.SPATIAL_HOLLOW_SHAPES.has(outer.shape)) continue;
            const outerBB = partBBs[i];
            if (!outerBB) continue;
            for (let j = 0; j < parts.length; j++) {
                if (i === j) continue;
                // Konzeptionelle Asymmetrie: nur das größere Volumen ist
                // Container. Sonst gilt bei zwei konzentrischen Sphären jeder
                // als Container für den anderen (Center-in-BB ist symmetrisch).
                if (partVolumes[i] <= partVolumes[j]) continue;
                const inner = parts[j];
                const innerPos = inner.position || { x: 0, y: 0, z: 0 };
                if (
                    innerPos.x > outerBB.min.x &&
                    innerPos.x < outerBB.max.x &&
                    innerPos.y > outerBB.min.y &&
                    innerPos.y < outerBB.max.y &&
                    innerPos.z > outerBB.min.z &&
                    innerPos.z < outerBB.max.z
                ) {
                    pairs.push({ outer: i, inner: j });
                }
            }
        }
        return pairs;
    }

    // Prinzip 3: Symmetrieachsen tragen Alignment. Wir prüfen Drehsymmetrie
    // um die Y-Achse (die natürliche „Stab-Achse"): wenn alle Parts ungefähr
    // dieselbe (x, z)-Position teilen (Streuung klein relativ zur Compound-
    // Größe), trägt der Compound einen Alignment-Bonus auf magieleitung +
    // stromleitung. Schwelle: Standardabweichung der xz-Distanz vom Zentrum
    // <= 30 % der Compound-Extent in xz.
    _hasYAxisSymmetry(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 2) return false;
        const bb = this._compoundBoundingBox(blueprint);
        if (!bb) return false;
        const xzExtent = Math.max(bb.extent.x, bb.extent.z);
        if (xzExtent < 0.5) return true; // sehr dünn → zählt als achssymmetrisch
        const centerX = (bb.min.x + bb.max.x) / 2;
        const centerZ = (bb.min.z + bb.max.z) / 2;
        let maxDist = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const d = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (d > maxDist) maxDist = d;
        }
        // Wenn die maximale xz-Distanz vom Zentrum klein ist gegenüber der
        // xz-Extent, sind alle Parts auf der Achse — Compound ist „Stab".
        return maxDist <= xzExtent * 0.25;
    }

    // Prinzip 5: Abstände erzeugen Resonanz. Wenn drei oder mehr Parts der
    // gleichen Shape auf etwa demselben Radius um das Compound-Zentrum
    // sitzen, bilden sie ein Array — Glockenspiel, Kristall-Kreis, Anti-
    // Magie-Käfig. Bonus auf resoniert + magieleitung.
    _hasResonantArray(blueprint) {
        const parts = blueprint.parts || [];
        if (parts.length < 3) return false;
        // Schwerpunkt der Part-Positionen statt BB-Center — BB ist geometrisch
        // verzerrt, wenn die Parts unregelmäßig verteilt sind (eine extreme
        // Position zieht das BB-Center, aber nicht den Schwerpunkt).
        let sumX = 0;
        let sumZ = 0;
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            sumX += pos.x;
            sumZ += pos.z;
        }
        const centerX = sumX / parts.length;
        const centerZ = sumZ / parts.length;
        const byShape = {};
        for (const p of parts) {
            const pos = p.position || { x: 0, y: 0, z: 0 };
            const dist = Math.hypot(pos.x - centerX, pos.z - centerZ);
            if (dist < 0.1) continue; // zentrale Parts zählen nicht zum Array
            (byShape[p.shape] = byShape[p.shape] || []).push(dist);
        }
        for (const shape of Object.keys(byShape)) {
            const distances = byShape[shape];
            if (distances.length < 3) continue;
            const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
            if (avg < 0.5) continue;
            // Alle Distanzen müssen innerhalb 12 % vom Mittelwert liegen.
            // 15 % war grenzwertig: drei Parts auf grob-ähnlichen Radien aber
            // ohne echte Kreis-Anordnung fielen durch. 12 % filtert das raus.
            const maxDev = distances.reduce((m, d) => Math.max(m, Math.abs(d - avg)), 0);
            if (maxDev <= avg * 0.12) return true;
        }
        return false;
    }

    // Zwei Parts „berühren" sich (Prinzip 4: Kontakt überträgt) wenn ihre
    // Bounding-Boxen überlappen oder weniger als CONTACT_GAP weit auseinander
    // liegen. Pragma: keine echte Mesh-Kollision (zu teuer für die Anzahl
    // Compound-Parts, die in den Sekunden-Ticks gelesen wird), sondern AABB-
    // Approximation — bei den meisten Bauplänen reicht das.
    _partsAreInContact(partA, partB) {
        const a = this._partBoundingBox(partA);
        const b = this._partBoundingBox(partB);
        if (!a || !b) return false;
        const gap = 0.15;
        const dx = Math.max(0, Math.max(a.min.x - b.max.x, b.min.x - a.max.x));
        const dy = Math.max(0, Math.max(a.min.y - b.max.y, b.min.y - a.max.y));
        const dz = Math.max(0, Math.max(a.min.z - b.max.z, b.min.z - a.max.z));
        return dx < gap && dy < gap && dz < gap;
    }

    // Räumliche Tag-Berechnung: nimmt computeCompoundTags als Basis und
    // wendet zwei Bonus-Regeln an:
    //
    //   Prinzip 1 (Spitze richtet): pointed-shape (cone/pyramid/octahedron/
    //   helix) am "at_top"/"at_outside" — härte und magieleitung bekommen
    //   einen Bonus, weil die Wirkrichtung nach außen strahlt. Bonus
    //   skaliert mit der intrinsischen Aktivierung (computePartTags), damit
    //   eine Stein-Spitze nicht mehr Magie ausstrahlt als die zugrunde-
    //   liegende Magieleitung des Steins.
    //
    //   Prinzip 4 (Kontakt überträgt): berührende Parts mit asymmetrischen
    //   Tags (z. B. Kupfer-Spule berührt Stahl-Gehäuse — Stahl-Anteil bekommt
    //   Stromleitung über Kontakt). Pro Tag wird das Maximum zwischen
    //   Original und (Kontakt × CONTACT_TRANSFER) genommen.
    //
    // Aggregation bleibt MAX (Konzept §9.2 anti-Stat-Matsch), Bonus-Wirkung
    // wird VOR der MAX-Aggregation pro Part angewandt.
    computeSpatialTags(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) {
            return this.computeCompoundTags(blueprint);
        }
        const bb = this._compoundBoundingBox(blueprint);
        const parts = blueprint.parts;
        const pointed = AnazhRealm.SPATIAL_POINTED_SHAPES;
        const TIP_BONUS = 0.5; // ★+50 % am Rand für pointed-Shapes
        const CONTACT_TRANSFER = 0.6; // 60 % der höheren Tag-Stärke fließt über
        // Schritt 1: pro Part die räumlich-bonusten Tags berechnen
        const augmentedPartTags = parts.map((part) => {
            const baseTags = this.computePartTags(part);
            const labels = this._classifyPartPosition(part, bb);
            const isTip = pointed.has(part.shape) && (labels.has("at_top") || labels.has("at_outside"));
            if (isTip) {
                // Spitze: härte + magieleitung bekommen Bonus aus dem
                // INTRINSISCHEN Wert (kein freier Bonus, sondern Verstärkung).
                if (baseTags["härte"]) baseTags["härte"] = baseTags["härte"] * (1 + TIP_BONUS);
                if (baseTags["magieleitung"]) {
                    baseTags["magieleitung"] = baseTags["magieleitung"] * (1 + TIP_BONUS);
                }
            }
            return baseTags;
        });
        // Schritt 2: Prinzip 2 — Hohlraum enthält. Container UND Inhalt
        // bekommen Resonanz-Bonus. Pro Paar wird der Bonus EINMAL auf jedes
        // beteiligte Part angewandt — auch wenn ein Container mehrere Inhalte
        // enthält, werden alle Beteiligten verstärkt.
        const hollowPairs = this._findHollowPairs(blueprint);
        const hollowBoosted = new Set();
        for (const pair of hollowPairs) {
            for (const idx of [pair.outer, pair.inner]) {
                if (hollowBoosted.has(idx)) continue;
                hollowBoosted.add(idx);
                const tags = augmentedPartTags[idx];
                if (tags["resoniert"]) {
                    tags["resoniert"] = tags["resoniert"] * (1 + AnazhRealm.SPATIAL_HOLLOW_BONUS);
                }
            }
        }
        // Schritt 3: Kontakt-Übertragung. Für jedes Paar (i, j) mit Kontakt,
        // gleiche schwächeren Tag-Wert mit CONTACT_TRANSFER × stärkerem Wert an.
        for (let i = 0; i < parts.length; i++) {
            for (let j = i + 1; j < parts.length; j++) {
                if (!this._partsAreInContact(parts[i], parts[j])) continue;
                const a = augmentedPartTags[i];
                const b = augmentedPartTags[j];
                // Welche Tags werden übertragen (Konzept §5.2 Prinzip 4 nennt
                // Wärme, Strom, Magie, Schwingung): nicht alle 10 Tags fließen.
                const transferable = AnazhRealm.SPATIAL_TRANSFERABLE_TAGS;
                for (const tag of transferable) {
                    const valA = a[tag] || 0;
                    const valB = b[tag] || 0;
                    if (valA > valB) {
                        const transferred = valA * CONTACT_TRANSFER;
                        if (transferred > valB) b[tag] = transferred;
                    } else if (valB > valA) {
                        const transferred = valB * CONTACT_TRANSFER;
                        if (transferred > valA) a[tag] = transferred;
                    }
                }
            }
        }
        // Schritt 4: Standard-MAX-Aggregation über die augmentierten Parts.
        const out = {};
        for (const partTags of augmentedPartTags) {
            for (const tag of Object.keys(partTags)) {
                const v = partTags[tag];
                if (!(tag in out) || v > out[tag]) out[tag] = v;
            }
        }
        // Schritt 5: Compound-Bonusse aus Prinzip 3 + 5. Werden NACH der
        // Aggregation angewandt, weil sie Eigenschaften des Compounds als
        // Ganzes sind, nicht einzelner Parts.
        if (this._hasYAxisSymmetry(blueprint)) {
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
            if (out["stromleitung"]) {
                out["stromleitung"] = out["stromleitung"] * (1 + AnazhRealm.SPATIAL_AXIS_BONUS);
            }
        }
        if (this._hasResonantArray(blueprint)) {
            if (out["resoniert"]) {
                out["resoniert"] = out["resoniert"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
            if (out["magieleitung"]) {
                out["magieleitung"] = out["magieleitung"] * (1 + AnazhRealm.SPATIAL_ARRAY_BONUS);
            }
        }
        return out;
    }

    // ### Welle 5 A — Verbindungstypen mit Lastformel ###
    // Eine Verbindung in `blueprint.connections` referenziert zwei Parts via
    // Indizes und einen Typ aus CONNECTION_TYPES. Lastformel bringt
    // Geometrie + Material + Typ zusammen, ohne dass der Spieler Physiker
    // sein muss — die Werte fallen aus den schon-bekannten Tags raus.

    // Kontaktfläche zwischen zwei Parts: AABB-Überschneidung in den ZWEI
    // größeren Dimensionen, multipliziert. Wenn Parts entlang Z überlappen
    // aber in X/Y weit auseinander sind, ist die Kontaktfläche klein. Wenn
    // sie sich auf einer großen Fläche treffen, ist sie groß.
    _partsContactArea(partA, partB) {
        const a = this._partBoundingBox(partA);
        const b = this._partBoundingBox(partB);
        if (!a || !b) return 0;
        // Pro Achse signed gap: negativ bei Overlap, positiv bei Trennung.
        const gapX = Math.max(a.min.x - b.max.x, b.min.x - a.max.x);
        const gapY = Math.max(a.min.y - b.max.y, b.min.y - a.max.y);
        const gapZ = Math.max(a.min.z - b.max.z, b.min.z - a.max.z);
        // Wenn EINE Achse weiter als TOUCH getrennt ist, sind die Parts nicht
        // in Kontakt — kein Bruch mehr durch additive TOUCH-Faktoren wie in
        // der Vorgänger-Version, die positive Fläche für weit-entfernte Parts
        // ausgespuckt hat. TOUCH = 0.05 erlaubt bündiges Sitzen.
        const TOUCH = 0.05;
        if (Math.max(gapX, gapY, gapZ) > TOUCH) return 0;
        // Sort aufsteigend: [tiefster Overlap, mittel, dünnster Overlap].
        // Die zwei tieferen Overlaps spannen die Kontaktfläche auf; der
        // dünnste ist die Kontakt-Normale.
        const sorted = [gapX, gapY, gapZ].sort((p, q) => p - q);
        const overlapA = Math.max(0, -sorted[0]);
        const overlapB = Math.max(0, -sorted[1]);
        return overlapA * overlapB;
    }

    // Liefert die Lastfähigkeit einer Verbindung, 0..3 in derselben Skala wie
    // die Tag-Strahler — vergleichbar mit `compound_has_tag`-Werten.
    computeConnectionStrength(connection, blueprint) {
        if (!connection || !blueprint) return 0;
        const type = AnazhRealm.CONNECTION_TYPES[connection.type];
        if (!type) return 0;
        const parts = blueprint.parts || [];
        const a = parts[connection.partA];
        const b = parts[connection.partB];
        if (!a || !b) return 0;
        const materials = this.state.materials || {};
        const matA = materials[a.material || "stein"];
        const matB = materials[b.material || "stein"];
        if (!matA || !matB) return 0;
        let tagSum = 0;
        for (const tag of type.strongTags) {
            tagSum += ((matA.tags[tag] || 0) + (matB.tags[tag] || 0)) / 2;
        }
        const avgTag = tagSum / type.strongTags.length;
        // Kontakt-Fläche normalisiert auf 1.0 (eine 1×1-Box-Begegnung = 1).
        // Größer ≥ 1 gibt vollen Faktor, kleiner skaliert linear.
        const contact = Math.min(1, this._partsContactArea(a, b));
        return type.typeStrength * avgTag * 3 * Math.max(0.1, contact);
    }

    // Validiert eine Connection-Liste für Save/DSL-Eingang. Whitelist auf
    // CONNECTION_TYPES, Indizes müssen in parts-Range liegen, max 64 pro
    // Bauplan. Sanitisiert in einen neuen sauberen Array — kein Mutieren
    // der Eingabe.
    validateBlueprintConnections(connections, partsLength) {
        if (!Array.isArray(connections)) return [];
        const clean = [];
        for (const c of connections.slice(0, AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT)) {
            if (!c || typeof c !== "object") continue;
            if (!AnazhRealm.CONNECTION_TYPES[c.type]) continue;
            const partA = Number(c.partA);
            const partB = Number(c.partB);
            if (!Number.isInteger(partA) || !Number.isInteger(partB)) continue;
            if (partA === partB) continue;
            if (partA < 0 || partA >= partsLength) continue;
            if (partB < 0 || partB >= partsLength) continue;
            clean.push({ type: c.type, partA, partB });
        }
        return clean;
    }

    addConnectionToBlueprint(name, connection) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!Array.isArray(bp.connections)) bp.connections = [];
        if (bp.connections.length >= AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT) {
            return { ok: false, reason: "too_many_connections" };
        }
        const valid = this.validateBlueprintConnections([connection], bp.parts.length);
        if (valid.length === 0) return { ok: false, reason: "invalid_connection" };
        bp.connections.push(valid[0]);
        return { ok: true, index: bp.connections.length - 1 };
    }

    removeConnectionFromBlueprint(name, index) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (!Array.isArray(bp.connections) || index < 0 || index >= bp.connections.length) return false;
        bp.connections.splice(index, 1);
        return true;
    }

    // ### Welle 5 C — Maschinen-Rekursivität ###
    // Konzept §4.3 wörtlich: „Maschinen sind selbst Compounds. Die Präzision
    // der Maschine kommt aus der Präzision ihrer Bauteile." Wer hochpräzise
    // Werkstücke will, baut zuerst eine hochpräzise Drehbank. Wer eine
    // hochpräzise Drehbank baut, braucht Werkzeuge mittlerer Präzision. Und
    // so weiter bis zum Faustkeil. Das System schließt sich von selbst.

    // Liefert den effektiven Präzisions-Cap eines Bauplans als Werkzeug:
    // Minimum aller Part-Präzisionen (eine schief geschmiedete Spindel zieht
    // die ganze Drehbank runter). Konzept-Kernregel §2.3 vererbt sich von
    // Part auf Compound.
    computeBlueprintPrecisionCap(blueprint) {
        if (!blueprint || !Array.isArray(blueprint.parts) || blueprint.parts.length === 0) return 0;
        let min = 1;
        for (const part of blueprint.parts) {
            const p = this.computePartPrecision(part);
            if (p < min) min = p;
        }
        return min;
    }

    // Setzt Bauplan-Werkzeug-Meta. Nur eigene Baupläne, nur whitelisted
    // opClass, nur sanitized opName. Mutiert in-place, idempotent.
    setBlueprintToolMeta(name, opName, opClass) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (!AnazhRealm.TOOL_OP_CLASSES.has(opClass)) {
            return { ok: false, reason: "invalid_op_class" };
        }
        const cleanOpName = String(opName || "").toLowerCase();
        if (!AnazhRealm.TOOL_OP_NAME_PATTERN.test(cleanOpName)) {
            return { ok: false, reason: "invalid_op_name" };
        }
        bp.role = "tool";
        bp.toolMeta = { opName: cleanOpName, opClass };
        return { ok: true };
    }

    // Registriert einen markierten Bauplan als Werkzeug in state.tools. Der
    // Name ist der Bauplan-Name; ein Starter-Werkzeug mit gleichem Namen ist
    // geschützt (eigene Werkzeuge können „hammer" nicht überschreiben). Cap
    // wird beim Registrieren als SNAPSHOT der Bauplan-Präzision gespeichert
    // — wer den Bauplan später editiert, muss neu registrieren. Das verhindert,
    // dass ein versehentlicher Edit ein im Besitz befindliches Werkzeug
    // entkräftet oder unsichtbar verstärkt.
    registerBlueprintAsTool(name) {
        const bp = this.state.blueprints[name];
        if (!bp) return { ok: false, reason: "blueprint_unknown" };
        if (bp.builtIn) return { ok: false, reason: "cannot_modify_builtin" };
        if (bp.role !== "tool" || !bp.toolMeta) {
            return { ok: false, reason: "not_marked_as_tool" };
        }
        const existing = this.state.tools[name];
        if (existing && existing.builtIn) {
            return { ok: false, reason: "starter_name_protected" };
        }
        const precisionCap = this.computeBlueprintPrecisionCap(bp);
        this.state.tools[name] = {
            name,
            label: bp.label || name,
            opClass: bp.toolMeta.opClass,
            opName: bp.toolMeta.opName,
            precisionCap,
            isStarter: false,
            builtIn: false,
            sourceBlueprint: name,
        };
        if (!Array.isArray(this.state.player.tools)) this.state.player.tools = [];
        if (!this.state.player.tools.includes(name)) this.state.player.tools.push(name);
        if (typeof this._renderWorkshopDOM === "function") this._renderWorkshopDOM();
        return { ok: true, precisionCap };
    }

    _architectureBuilders() {
        // Builders kommen jetzt aus state.blueprints — eine Quelle für
        // Built-in + User-Baupläne. Seed wird zur Zeit nicht mehr genutzt
        // (Built-ins sind deterministisch); bleibt als Parameter, damit die
        // Aufruf-Stelle gleich bleibt und zukünftige Bauplan-Varianten via
        // Seed möglich sind.
        const map = {};
        const blueprints = this.state.blueprints || {};
        for (const name of Object.keys(blueprints)) {
            const bp = blueprints[name];
            map[name] = () => this._buildFromBlueprint(bp);
        }
        return map;
    }

    // Mesh aus Eintrag (re-)bauen und in die Szene hängen. Trennt Daten von
    // Sicht: ein Eintrag in `state.architectures` kann jederzeit ohne Mesh
    // existieren (gepruned, weil zu weit weg) und später wieder einen
    // bekommen. Determinismus garantiert: gleiches Seed → gleicher Mesh.
    _rebuildArchitectureMesh(entry) {
        if (!this.state.scene || !entry) return null;
        const builders = this._architectureBuilders();
        const builder = builders[entry.type];
        if (!builder) return null;
        const baseY = Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0;
        const group = builder(entry.seed);
        group.position.set(entry.position.x || 0, baseY, entry.position.z || 0);
        if (Number.isFinite(entry.scale) && entry.scale !== 1) {
            group.scale.setScalar(entry.scale);
        }
        this.state.scene.add(group);
        entry.mesh = group;
        // Ring 6.3 — Kollisions-Body für die Struktur. Statisch (mass=0),
        // eine umschließende Box rund um die Group. Wir pushen NICHT in
        // state.rigidBodies, damit der Sync-Loop die Group-Position nicht
        // anhand des Body-Origin überschreibt — die Position kommt aus
        // entry.position, der Body ist nur Hitbox.
        this._buildArchitectureCollision(entry);
        return group;
    }

    // Statischer Kollisions-Body um die Architecture-Group als **Compound-
    // Shape** aus einer btBoxShape pro Sub-Mesh. Eine einzelne umschließende
    // AABB wäre einfacher, ist aber zu grob: ein Dorf mit Hütten auf
    // Radius 10 hätte eine 24×4×24-AABB, in deren Mitte der Spieler steht —
    // er wird beim Spawn aus der Box gepresst, oft durch den Boden. Mit
    // Compound-Shape ist nur jede einzelne Hütte solide, der Weg zwischen
    // Hütten frei.
    _buildArchitectureCollision(entry) {
        if (!entry || !entry.mesh || !this.state.physicsWorld) return null;
        entry.mesh.updateMatrixWorld(true);
        const groupPos = entry.mesh.position;
        const compound = new Ammo.btCompoundShape();
        const childShapes = [];
        let added = 0;
        entry.mesh.traverse((node) => {
            if (!node.isMesh || !node.geometry) return;
            // Welt-BBox des einzelnen Mesh-Child. setFromObject berücksichtigt
            // alle verschachtelten Group-Transforms.
            const childBox = new THREE.Box3().setFromObject(node);
            if (childBox.isEmpty()) return;
            const size = new THREE.Vector3();
            childBox.getSize(size);
            const center = new THREE.Vector3();
            childBox.getCenter(center);
            const hx = Math.max(0.05, size.x / 2);
            const hy = Math.max(0.05, size.y / 2);
            const hz = Math.max(0.05, size.z / 2);
            const childShape = new Ammo.btBoxShape(new Ammo.btVector3(hx, hy, hz));
            const childTransform = new Ammo.btTransform();
            childTransform.setIdentity();
            const offset = new Ammo.btVector3(center.x - groupPos.x, center.y - groupPos.y, center.z - groupPos.z);
            childTransform.setOrigin(offset);
            compound.addChildShape(childTransform, childShape);
            childShapes.push(childShape);
            Ammo.destroy(offset);
            Ammo.destroy(childTransform);
            added++;
        });
        if (added === 0) {
            Ammo.destroy(compound);
            return null;
        }
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        const origin = new Ammo.btVector3(groupPos.x, groupPos.y, groupPos.z);
        transform.setOrigin(origin);
        const motionState = new Ammo.btDefaultMotionState(transform);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, compound, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        body.setFriction(0.8);
        this.state.physicsWorld.addRigidBody(body);
        entry.collision = {
            body,
            shape: compound,
            childShapes,
            motionState,
            rbInfo,
            transform,
            origin,
            localInertia,
        };
        return body;
    }

    _disposeArchitectureCollision(entry) {
        if (!entry || !entry.collision) return;
        const c = entry.collision;
        if (this.state.physicsWorld) this.state.physicsWorld.removeRigidBody(c.body);
        try {
            Ammo.destroy(c.body);
        } catch {
            /* ignore */
        }
        try {
            Ammo.destroy(c.rbInfo);
        } catch {
            /* ignore */
        }
        try {
            Ammo.destroy(c.motionState);
        } catch {
            /* ignore */
        }
        try {
            Ammo.destroy(c.shape);
        } catch {
            /* ignore */
        }
        if (Array.isArray(c.childShapes)) {
            for (const cs of c.childShapes) {
                try {
                    Ammo.destroy(cs);
                } catch {
                    /* ignore */
                }
            }
        }
        try {
            Ammo.destroy(c.transform);
        } catch {
            /* ignore */
        }
        try {
            Ammo.destroy(c.origin);
        } catch {
            /* ignore */
        }
        try {
            Ammo.destroy(c.localInertia);
        } catch {
            /* ignore */
        }
        entry.collision = null;
    }

    // Mesh disposen, Eintrag bleibt als reine Daten erhalten. Fenster für
    // späteren Wieder-Aufbau wenn der Spieler zurückkehrt.
    _cullArchitectureMesh(entry) {
        if (!entry || !entry.mesh) return;
        // Erst Kollision freigeben, dann Mesh aus der Szene + Geometrien.
        this._disposeArchitectureCollision(entry);
        if (this.state.scene) this.state.scene.remove(entry.mesh);
        this._disposeSoulGroup(entry.mesh);
        entry.mesh = null;
    }

    // Eine Struktur zur Welt hinzufügen. Position kommt aus DSL (oder Save-
    // Restore); centerY wird aus pos.y abgeleitet, mit Boden-Heuristik
    // (pos.y - 0.5 ≈ Spielerfußhöhe falls at_player benutzt wurde).
    spawnArchitecture(type, position, opts = {}) {
        const builders = this._architectureBuilders();
        if (!builders[type]) {
            this.log(`spawnArchitecture: unbekannter Typ '${type}'`, "ERROR");
            return null;
        }
        if (!this.state.scene) return null;
        const seed = Number.isFinite(opts.seed) ? opts.seed : Math.floor(Math.random() * 0xffffffff);
        const scale = Number.isFinite(opts.scale) && opts.scale > 0 ? opts.scale : 1;
        const entry = {
            id: this.state.architectureNextId++,
            type,
            position: { x: position.x || 0, y: position.y || 0, z: position.z || 0 },
            seed,
            scale,
            mesh: null,
        };
        this.state.architectures.push(entry);
        // V2: kein Cap mehr — wir bauen den Mesh nur, wenn der Spieler nahe
        // genug ist. Sonst bleibt der Eintrag „cold" (nur Daten) und der
        // Culling-Tick baut ihn auf, sobald der Spieler herankommt.
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        const inRange =
            !playerPos ||
            Math.hypot(entry.position.x - playerPos.x, entry.position.z - playerPos.z) <=
                this.state.architectureCullingRadius;
        if (inRange) this._rebuildArchitectureMesh(entry);
        this.log(
            `Struktur gebaut: ${type} bei (${entry.position.x.toFixed(1)}, ${entry.position.z.toFixed(1)})${scale !== 1 ? ` ×${scale.toFixed(2)}` : ""}${inRange ? "" : " (cold)"}`,
            "INFO"
        );
        this._applyCompoundWorldEffects(type);
        return entry;
    }

    // ### Welle 4 Phase 3 — emergente Welt-Effekte ###
    // Erste echte Hylomorphismus-Konsequenz: ein gebauter Compound mit hoher
    // Resonanz + hoher Präzision lässt die Welt klingen + erinnert sich.
    // Ein Compound mit hoher Magieleitung wirft eine kleine Emotion-Welle
    // (awe + hope). Beide Effekte one-shot pro Bauplan, damit ein Spieler
    // nicht durch wiederholtes Spawnen Spam erzeugt. Schwellen aus
    // WORLD_EFFECT_THRESHOLDS — zentral, damit Tuning ohne Code-Suche geht.
    _applyCompoundWorldEffects(blueprintName) {
        const bp = this.state.blueprints && this.state.blueprints[blueprintName];
        if (!bp) return;
        // Welle 5 B — Welt-Effekte nutzen jetzt räumlich angereicherte Tags
        // statt der atomaren MAX-Aggregation. Eine Quarz-Spitze oben auf
        // einem Stab strahlt jetzt stärker, weil Prinzip 1 (Spitze richtet)
        // den Magie-Tag verstärkt; ein Kupfer-Helix-Kern in einem Stahl-
        // Gehäuse leitet jetzt, weil Prinzip 4 (Kontakt überträgt) den
        // Stahl-Anteil hochzieht. Atomare computeCompoundTags bleibt für UI/
        // Tests die ehrliche Basis.
        const tags = this.computeSpatialTags(bp);
        const avgPrec = this._compoundAvgPrecision(bp);
        const T = AnazhRealm.WORLD_EFFECT_THRESHOLDS;
        // Konzept §6.3 — Präzision moduliert ALLE Effekt-Stärken, nicht nur
        // den Resonanz-Effekt. Eine 0.4-Präzisions-Pyramide leitet Magie
        // schwächer als eine 0.97-Präzisions-Pyramide aus demselben Material.
        // Min-Faktor 0.3 — auch raue Arbeit trägt etwas Wirkung, bricht aber
        // unter Schwelle ab.
        const precisionFactor = Math.max(0.3, avgPrec);
        const resonates = (tags.resoniert || 0) >= T.resonance_strong;
        const magicConducts = (tags.magieleitung || 0) * precisionFactor >= T.magic_strong;
        const isPrecise = avgPrec >= T.precision_high;

        if (resonates && isPrecise) {
            this.journalAppendOnce(
                `singing:${blueprintName}`,
                "growth",
                `Eine Form singt: ${bp.label || blueprintName} schwingt rein im Klang.`,
                { blueprint: blueprintName, resonance: tags.resoniert, precision: avgPrec }
            );
            // Eine reine Sinus-Welle, frequenz folgt Resonanz-Stärke (300-700 Hz)
            if (this.state.symphony && this.state.symphony.ctx && this.state.symphony.enabled) {
                try {
                    const ctx = this.state.symphony.ctx;
                    const freq = 300 + (tags.resoniert / 3) * 400;
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "sine";
                    osc.frequency.value = freq;
                    gain.gain.value = 0;
                    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
                    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
                    osc.connect(gain).connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 1.3);
                } catch {
                    // Audio-Context evtl. nicht bereit — still ignorieren.
                }
            }
        }

        if (magicConducts && this.state.player && this.state.player.emotions) {
            this.state.player.emotions.awe = Math.min(1, (this.state.player.emotions.awe || 0) + 0.1);
            this.state.player.emotions.hope = Math.min(1, (this.state.player.emotions.hope || 0) + 0.1);
            this.journalAppendOnce(
                `magic_compound:${blueprintName}`,
                "growth",
                `Etwas Magisches in der Luft, als ${bp.label || blueprintName} entstand.`,
                { blueprint: blueprintName, magic: tags.magieleitung }
            );
        }

        // Welle 6.F2 — Brech-Warning. Wenn IRGENDEINE Verbindung des Bauplans
        // unter der Schwelle 0.7 liegt, gibt es einen einmaligen Journal-
        // Eintrag (idempotent pro Bauplan-Name). Die rote Linie aus 6.F1 ist
        // das visuelle Pendant. Echtes Auseinanderbrechen folgt mit 6.F5
        // (Ammo-Constraints) — V1 ist Warnung, nicht Konsequenz.
        if (Array.isArray(bp.connections) && bp.connections.length > 0) {
            let weakest = Infinity;
            let weakestType = null;
            for (const c of bp.connections) {
                const s = this.computeConnectionStrength(c, bp);
                if (s < weakest) {
                    weakest = s;
                    weakestType = c.type;
                }
            }
            if (weakest < 0.7 && weakestType) {
                this.journalAppendOnce(
                    `weak_connection:${blueprintName}`,
                    "weakness",
                    `Eine ${weakestType}-Verbindung in „${bp.label || blueprintName}" trägt knapp ` +
                        `(Last ${weakest.toFixed(2)}).`,
                    { blueprint: blueprintName, weakest: weakest, type: weakestType }
                );
            }
        }
    }

    // Pro-Frame-Tick: ruft animate() auf jeder Struktur, die einen Mesh
    // hat und einen animate-Hook mitbringt (aktuell nur Wasserfälle).
    // Cold-Einträge (mesh=null) werden übersprungen.
    tickArchitectures(currentTime) {
        const list = this.state.architectures;
        if (!list || list.length === 0) return;
        for (const entry of list) {
            if (entry.mesh && entry.mesh.userData && typeof entry.mesh.userData.animate === "function") {
                entry.mesh.userData.animate(currentTime);
            }
        }
    }

    // Distance-based Mesh-Culling (Minecraft-Stil). Pro Sekunde rotiert
    // dieser Tick durch die Architektur-Liste:
    //   - Spieler-Distanz <= cullingRadius + Mesh fehlt  → Mesh bauen
    //   - Spieler-Distanz >  cullingRadius + Mesh exists → Mesh disposen
    // Die Daten-Einträge bleiben immer; nur die GPU-Last ist begrenzt.
    // Damit löst sich das alte Hard-Cap-Problem auf: der Spieler kann
    // unbegrenzt bauen, solange das nicht alles gleichzeitig in Sicht ist.
    tickArchitectureCulling(currentTime) {
        const tickInterval = 1 / Math.max(0.1, this.state.architectureCullingTickHz);
        if (currentTime - this.state.architectureCullingLastTick < tickInterval) return;
        this.state.architectureCullingLastTick = currentTime;
        const playerPos = this.state.playerMesh ? this.state.playerMesh.position : null;
        if (!playerPos) return;
        const radius = this.state.architectureCullingRadius;
        const radiusSq = radius * radius;
        for (const entry of this.state.architectures) {
            const dx = entry.position.x - playerPos.x;
            const dz = entry.position.z - playerPos.z;
            const distSq = dx * dx + dz * dz;
            if (distSq <= radiusSq) {
                if (!entry.mesh) this._rebuildArchitectureMesh(entry);
            } else {
                if (entry.mesh) this._cullArchitectureMesh(entry);
            }
        }
    }

    // ### Ring 6 V2 — Bau-Modus (Phantom-Cursor) ###
    //
    // Aktivieren: Tasten 1 (Dorf) / 2 (Tempel) / 3 (Wasserfall) — schaltet
    // die Form an oder wechselt zur neuen. Im Modus schwebt ein halb-
    // transparentes Phantom 5 m vor dem Spieler (in Yaw-Richtung). F baut
    // an der Phantom-Position. ESC verlässt den Modus.
    //
    // Phantom-Mesh ist ein normaler Builder-Group, dessen Materialien wir
    // nach dem Bau auf transparent + opacity 0.4 stellen. So sieht's wie
    // ein Geist der späteren Struktur aus, kostet aber kein Sondermodell.

    // Ring 6.5 — Hotbar-Slot auswählen. slotIndex 0..8. Wenn der Slot leer
    // ist, wird der Bau-Modus deaktiviert. Wenn der Slot belegt UND derselbe
    // Slot bereits aktiv ist, toggelt der Modus aus (zweiter 1-Druck =
    // Modus aus). Sonst wird das Phantom auf den neuen Bauplan umgestellt.
    selectHotbarSlot(slotIndex) {
        const bm = this.state.buildMode;
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        const blueprintName = this.state.hotbar[idx];
        // Toggle: gleicher aktiver Slot → Modus aus.
        if (bm.active && bm.slotIndex === idx) {
            this._clearBuildMode();
            this._updateHotbarHighlight();
            return;
        }
        // Leerer Slot: keinen Modus aktivieren (aber Highlight setzen).
        if (!blueprintName || !this.state.blueprints[blueprintName]) {
            this._clearBuildMode();
            bm.slotIndex = idx;
            this._updateHotbarHighlight();
            return;
        }
        // Altes Phantom wegräumen, falls Bauplan-Wechsel.
        if (bm.phantomMesh && this.state.scene) {
            this.state.scene.remove(bm.phantomMesh);
            this._disposeSoulGroup(bm.phantomMesh);
            bm.phantomMesh = null;
        }
        bm.active = true;
        bm.slotIndex = idx;
        bm.blueprintName = blueprintName;
        const phantom = this._buildFromBlueprint(this.state.blueprints[blueprintName]);
        phantom.traverse((node) => {
            if (node.material) {
                node.material.transparent = true;
                node.material.opacity = 0.4;
            }
            if (node.castShadow !== undefined) node.castShadow = false;
        });
        if (this.state.scene) this.state.scene.add(phantom);
        bm.phantomMesh = phantom;
        this._updateBuildModeHud();
        this._updateHotbarHighlight();
        this.log(`Bau-Modus: ${blueprintName} (Slot ${idx + 1})`, "INFO");
    }

    // Bauplan in einen Hotbar-Slot legen. Persistiert sich automatisch via
    // Save. UI im Spieler-Drawer ruft das auf.
    setHotbarSlot(slotIndex, blueprintName) {
        const idx = Math.max(0, Math.min(8, slotIndex | 0));
        if (blueprintName && !this.state.blueprints[blueprintName]) {
            this.log(`Hotbar-Slot ${idx + 1}: unbekannter Bauplan '${blueprintName}'`, "ERROR");
            return false;
        }
        this.state.hotbar[idx] = blueprintName || null;
        this._renderHotbarDOM();
        // Wenn der aktive Slot geändert wurde, Phantom-Mesh neu bauen.
        if (this.state.buildMode.slotIndex === idx) {
            const wasActive = this.state.buildMode.active;
            this._clearBuildMode();
            if (wasActive && blueprintName) this.selectHotbarSlot(idx);
        }
        return true;
    }

    _clearBuildMode() {
        const bm = this.state.buildMode;
        if (bm.phantomMesh && this.state.scene) {
            this.state.scene.remove(bm.phantomMesh);
            this._disposeSoulGroup(bm.phantomMesh);
        }
        bm.active = false;
        bm.blueprintName = null;
        bm.phantomMesh = null;
        this._updateBuildModeHud();
    }

    // Bau ausführen: spawnArchitecture an aktueller Phantom-Position.
    // Modus bleibt aktiv für Mehrfach-Bau (ESC verlässt explizit).
    confirmBuild() {
        const bm = this.state.buildMode;
        if (!bm.active || !bm.blueprintName || !bm.phantomMesh) return false;
        const p = bm.phantomMesh.position;
        const spawnPos = { x: p.x, y: p.y + 0.5, z: p.z };
        this.spawnArchitecture(bm.blueprintName, spawnPos);
        return true;
    }

    // Pro Frame: Phantom-Position aus Kamera-Raycast bestimmen (6.A4),
    // Stabilität visuell anzeigen (6.A5).
    tickBuildMode() {
        const bm = this.state.buildMode;
        if (!bm.active || !bm.phantomMesh || !this.state.playerMesh) return;
        const target = this._resolvePhantomTarget();
        bm.phantomMesh.position.set(target.x, target.y, target.z);
        bm.phantomMesh.rotation.y = -this.state.yaw;
        bm.phantomOnGround = target.isStable;
        this._applyPhantomTint(bm.phantomMesh, target.isStable);
    }

    // Welle 6.A4 — Raycast aus Kamera in Blick-Richtung gegen Physik-Welt.
    // Erster Treffer in 30 m = Phantom-Position (Vor/Zurück wird damit durch
    // den Kamera-Pitch gesteuert, nicht mehr durch einen festen Ring um den
    // Spieler). Ohne Treffer fallen wir zurück auf das alte yaw×distance-
    // Verhalten, dann ist das Phantom „instabil" markiert (schwebt frei).
    //
    // 6.A5 — Stabilität: Hit-Normal-Y > 0.5 entspricht einer begehbaren
    // Fläche (Slope flacher als ~60°, dieselbe Schwelle wie maxWalkableSlopeY
    // in 6.A3). Wir geben nur ein Flag zurück; das Block-Verhalten („nicht
    // bauen wenn instabil") folgt mit den Spiel-Modi (6.C2).
    _resolvePhantomTarget() {
        const bm = this.state.buildMode;
        const p = this.state.playerMesh.position;
        const sf = this.state.scaleFactor || 1;
        // Fallback-Position: yaw-Ring vor dem Spieler.
        const fallbackX = p.x + Math.sin(this.state.yaw) * bm.phantomDistance;
        const fallbackY = p.y - 0.5;
        const fallbackZ = p.z + Math.cos(this.state.yaw) * bm.phantomDistance;
        const fallback = { x: fallbackX, y: fallbackY, z: fallbackZ, isStable: false, hit: false };
        if (!this.state.physicsWorld || !this.state.camera || typeof Ammo === "undefined") {
            return fallback;
        }
        const cam = this.state.camera;
        const cp = cam.position;
        if (!this._tmpCamDir) this._tmpCamDir = new THREE.Vector3();
        cam.getWorldDirection(this._tmpCamDir);
        const maxDist = 30;
        const rayStart = this.setVec(this.state.tmpVec1, cp.x / sf, cp.y / sf, cp.z / sf);
        const rayEnd = this.setVec(
            this.state.tmpVec2,
            (cp.x + this._tmpCamDir.x * maxDist) / sf,
            (cp.y + this._tmpCamDir.y * maxDist) / sf,
            (cp.z + this._tmpCamDir.z * maxDist) / sf
        );
        const cb = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
        this.state.physicsWorld.rayTest(rayStart, rayEnd, cb);
        let result = fallback;
        if (cb.hasHit()) {
            const hit = cb.get_m_hitPointWorld();
            const nrm = cb.get_m_hitNormalWorld();
            result = {
                x: hit.x() * sf,
                y: hit.y() * sf,
                z: hit.z() * sf,
                isStable: nrm.y() > 0.5,
                hit: true,
            };
        }
        Ammo.destroy(cb);
        return result;
    }

    // Welle 6.A5 — Phantom-Tint: grün-blend (0x88ff88) bei stabilem Bodenkontakt,
    // rot-blend (0xff8888) sonst. 30 % Tint über der originalen Material-Farbe,
    // damit die Bauplan-Identität erkennbar bleibt. Original-Farbe wird einmal
    // pro Phantom-Mesh in userData gecached — sonst würde jeder Frame die schon
    // getintete Farbe als neue Basis lesen und der Tint driften.
    _applyPhantomTint(phantom, isStable) {
        if (!phantom) return;
        const targetColor = isStable ? 0x88ff88 : 0xff8888;
        const tr = (targetColor >> 16) & 0xff;
        const tg = (targetColor >> 8) & 0xff;
        const tb = targetColor & 0xff;
        phantom.traverse((node) => {
            if (node.material && node.material.color) {
                if (node.userData._origColor === undefined) {
                    node.userData._origColor = node.material.color.getHex();
                }
                const orig = node.userData._origColor;
                const r = (((orig >> 16) & 0xff) * 0.7 + tr * 0.3) | 0;
                const g = (((orig >> 8) & 0xff) * 0.7 + tg * 0.3) | 0;
                const b = ((orig & 0xff) * 0.7 + tb * 0.3) | 0;
                node.material.color.setRGB(r / 255, g / 255, b / 255);
            }
        });
    }

    _updateBuildModeHud() {
        if (typeof document === "undefined") return;
        const hud = document.getElementById("build-mode-hud");
        if (!hud) return;
        const bm = this.state.buildMode;
        if (bm.active && bm.blueprintName) {
            const bp = this.state.blueprints[bm.blueprintName];
            const label = bp && bp.label ? bp.label : bm.blueprintName;
            hud.textContent = `Bau: ${label} — F bauen, ESC verlassen, 1-9 Slot wählen`;
            hud.hidden = false;
        } else {
            hud.hidden = true;
            hud.textContent = "";
        }
    }

    // Hotbar-DOM neu rendern: 9 Slots mit Label + Slot-Nummer. Wird beim
    // Init aufgerufen und nach jeder setHotbarSlot-Mutation.
    _renderHotbarDOM() {
        if (typeof document === "undefined") return;
        const bar = document.getElementById("hotbar");
        if (!bar) return;
        bar.innerHTML = "";
        for (let i = 0; i < 9; i++) {
            const name = this.state.hotbar[i];
            const slot = document.createElement("button");
            slot.type = "button";
            slot.className = "hotbar-slot";
            slot.setAttribute("data-slot", String(i));
            const num = document.createElement("span");
            num.className = "num";
            num.textContent = String(i + 1);
            const label = document.createElement("span");
            label.className = "label";
            if (name && this.state.blueprints[name]) {
                const bp = this.state.blueprints[name];
                label.textContent = bp.label || name;
                slot.classList.add("filled");
            } else {
                label.textContent = "—";
            }
            slot.appendChild(num);
            slot.appendChild(label);
            slot.addEventListener("click", () => this.selectHotbarSlot(i));
            bar.appendChild(slot);
        }
        this._updateHotbarHighlight();
        this._renderHotbarConfigDOM();
    }

    _updateHotbarHighlight() {
        if (typeof document === "undefined") return;
        const slots = document.querySelectorAll("#hotbar .hotbar-slot");
        const bm = this.state.buildMode;
        slots.forEach((slot, i) => {
            slot.classList.toggle("active", bm.active && bm.slotIndex === i);
        });
    }

    // Hotbar-Belegung im Spieler-Drawer: 9 Reihen mit Slot-Nummer + Dropdown.
    // Wird aufgerufen, wenn der Spieler-Drawer geöffnet wird (oder beim Init,
    // dann ist's idempotent).
    _renderHotbarConfigDOM() {
        if (typeof document === "undefined") return;
        const container = document.getElementById("hotbar-config");
        if (!container) return;
        container.innerHTML = "";
        const blueprintNames = Object.keys(this.state.blueprints || {});
        for (let i = 0; i < 9; i++) {
            const row = document.createElement("div");
            row.className = "hotbar-config-row";
            const num = document.createElement("span");
            num.className = "num";
            num.textContent = String(i + 1);
            const sel = document.createElement("select");
            sel.setAttribute("data-slot", String(i));
            const emptyOpt = document.createElement("option");
            emptyOpt.value = "";
            emptyOpt.textContent = "— leer —";
            sel.appendChild(emptyOpt);
            for (const name of blueprintNames) {
                const opt = document.createElement("option");
                opt.value = name;
                opt.textContent = this.state.blueprints[name].label || name;
                sel.appendChild(opt);
            }
            sel.value = this.state.hotbar[i] || "";
            sel.addEventListener("change", () => {
                this.setHotbarSlot(i, sel.value || null);
            });
            row.appendChild(num);
            row.appendChild(sel);
            container.appendChild(row);
        }
    }

    // ### Ring 6.6 — Werkstatt: Bauplan-Editor ###
    //
    // Vier State-Mutationspfade. Alle gehen über `state.blueprints` direkt;
    // Built-ins werden nicht überschrieben (Editor klont sie statt zu
    // mutieren — sonst gehen sie bei nächstem Reload verloren, weil
    // _defaultBlueprints() im Konstruktor immer das Original wiederherstellt).

    createBlueprint(name, label) {
        const cleanName = typeof name === "string" ? name.trim() : "";
        if (!cleanName) {
            this.log("createBlueprint: leerer Name", "ERROR");
            return false;
        }
        if (this.state.blueprints[cleanName]) {
            this.log(`createBlueprint: '${cleanName}' existiert bereits`, "ERROR");
            return false;
        }
        this.state.blueprints[cleanName] = {
            name: cleanName,
            label: typeof label === "string" && label.trim() ? label.trim() : cleanName,
            builtIn: false,
            parts: [],
        };
        this.log(`Bauplan '${cleanName}' angelegt`, "INFO");
        return true;
    }

    cloneBlueprint(sourceName, newName) {
        const source = this.state.blueprints[sourceName];
        if (!source) {
            this.log(`cloneBlueprint: '${sourceName}' nicht gefunden`, "ERROR");
            return false;
        }
        const cleanNew = typeof newName === "string" ? newName.trim() : "";
        if (!cleanNew || this.state.blueprints[cleanNew]) {
            this.log(`cloneBlueprint: Ziel-Name '${cleanNew}' leer oder schon belegt`, "ERROR");
            return false;
        }
        this.state.blueprints[cleanNew] = {
            name: cleanNew,
            label: source.label ? `${source.label} (Kopie)` : cleanNew,
            builtIn: false,
            parts: JSON.parse(JSON.stringify(source.parts || [])),
        };
        this.log(`Bauplan '${sourceName}' nach '${cleanNew}' geklont`, "INFO");
        return true;
    }

    deleteBlueprint(name) {
        const bp = this.state.blueprints[name];
        if (!bp) return false;
        if (bp.builtIn) {
            this.log(`deleteBlueprint: '${name}' ist Built-in und kann nicht gelöscht werden`, "ERROR");
            return false;
        }
        delete this.state.blueprints[name];
        // Hotbar-Slots, die diesen Bauplan halten, leeren.
        for (let i = 0; i < 9; i++) {
            if (this.state.hotbar[i] === name) this.state.hotbar[i] = null;
        }
        // Welle 5 C — wenn der Bauplan als eigenes Werkzeug registriert war,
        // räumen wir das Werkzeug ebenfalls weg. Sonst bliebe ein Geist-Tool
        // in state.tools mit sourceBlueprint auf den jetzt-leeren Namen — UI
        // andere Baupläne würden es weiter im Apply-Dropdown anbieten,
        // applyOpToPart würde scheinbar funktionieren obwohl die Substanz fehlt.
        if (this.state.tools) {
            for (const toolName of Object.keys(this.state.tools)) {
                const t = this.state.tools[toolName];
                if (t && !t.builtIn && t.sourceBlueprint === name) {
                    delete this.state.tools[toolName];
                    if (Array.isArray(this.state.player.tools)) {
                        this.state.player.tools = this.state.player.tools.filter((tn) => tn !== toolName);
                    }
                }
            }
        }
        this._renderHotbarDOM();
        this.log(`Bauplan '${name}' gelöscht`, "INFO");
        return true;
    }

    addPartToBlueprint(name, part) {
        const bp = this.state.blueprints[name];
        if (!bp) return false;
        if (bp.builtIn) {
            this.log(`addPart: '${name}' ist Built-in — bitte erst klonen`, "ERROR");
            return false;
        }
        // Default-Werte für ein neues Part, falls nicht alles übergeben wird.
        // Welle 4 Phase 1: Default-Material „stein", Color folgt der Material-
        // Farbe wenn der Caller nichts vorgibt.
        const defaultMaterial = "stein";
        const matColor = (this.state.materials[defaultMaterial] || {}).color || 0x888888;
        const defaultPart = {
            shape: "box",
            color: matColor,
            material: defaultMaterial,
            position: { x: 0, y: 1, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            size: { x: 1, y: 1, z: 1 },
            opChain: this._defaultPartOpChain(),
        };
        bp.parts.push({ ...defaultPart, ...(part || {}) });
        return true;
    }

    removePartFromBlueprint(name, index) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (index < 0 || index >= bp.parts.length) return false;
        bp.parts.splice(index, 1);
        // Welle 5 A — Connections referenzieren Part-Indizes. Beim Lösch:
        //   (a) Connections, die den gelöschten Part berühren, verschwinden.
        //   (b) Indizes > index werden um 1 nach unten korrigiert.
        // Ohne das blieben Connections auf den falschen Part oder zeigten
        // out-of-range — UI-Anzeige würde Geist-Stern-Werte berechnen.
        if (Array.isArray(bp.connections)) {
            bp.connections = bp.connections
                .filter((c) => c.partA !== index && c.partB !== index)
                .map((c) => ({
                    type: c.type,
                    partA: c.partA > index ? c.partA - 1 : c.partA,
                    partB: c.partB > index ? c.partB - 1 : c.partB,
                }));
        }
        return true;
    }

    updatePartInBlueprint(name, index, patch) {
        const bp = this.state.blueprints[name];
        if (!bp || bp.builtIn) return false;
        if (index < 0 || index >= bp.parts.length) return false;
        const part = bp.parts[index];
        // Patch ist ein Teil-Objekt; wir mergen rekursiv für position/size/
        // rotation, damit man einzelne Koordinaten verändern kann.
        if (patch.shape) part.shape = patch.shape;
        if (typeof patch.color === "number") part.color = patch.color;
        for (const key of ["position", "size", "rotation"]) {
            if (patch[key]) {
                part[key] = { ...(part[key] || {}), ...patch[key] };
            }
        }
        if (typeof patch.opacity === "number") part.opacity = patch.opacity;
        // Welle 4 Phase 1: Material-Wechsel. Wenn der Caller `recolor: true`
        // mitgibt, wird die Part-Farbe auf die Material-Farbe gezogen — das
        // ist der UI-Pfad beim Material-Dropdown-Change.
        if (typeof patch.material === "string" && this.state.materials[patch.material]) {
            part.material = patch.material;
            if (patch.recolor === true) {
                part.color = this.state.materials[patch.material].color;
            }
        }
        return true;
    }

    // Werkstatt-State: welchen Bauplan editieren wir gerade?
    _ensureWorkshopState() {
        if (!this.state.workshop) {
            this.state.workshop = { selectedBlueprint: "village" };
        }
        return this.state.workshop;
    }

    selectBlueprintForEdit(name) {
        const ws = this._ensureWorkshopState();
        if (!this.state.blueprints[name]) {
            this.log(`selectBlueprintForEdit: '${name}' nicht gefunden`, "ERROR");
            return false;
        }
        ws.selectedBlueprint = name;
        this._renderWorkshopDOM();
        return true;
    }

    _renderWorkshopDOM() {
        if (typeof document === "undefined") return;
        const list = document.getElementById("workshop-list");
        const editor = document.getElementById("workshop-editor");
        if (!list || !editor) return;
        const ws = this._ensureWorkshopState();
        const blueprintNames = Object.keys(this.state.blueprints);
        // Liste der Baupläne
        list.innerHTML = "";
        for (const name of blueprintNames) {
            const bp = this.state.blueprints[name];
            const row = document.createElement("div");
            row.className = "workshop-list-row" + (name === ws.selectedBlueprint ? " selected" : "");
            row.setAttribute("data-blueprint", name);
            const nameSpan = document.createElement("span");
            nameSpan.className = "name";
            nameSpan.textContent = bp.label || name;
            const badge = document.createElement("span");
            badge.className = "badge";
            badge.textContent = bp.builtIn ? "fest" : "eigen";
            row.appendChild(nameSpan);
            row.appendChild(badge);
            row.addEventListener("click", () => this.selectBlueprintForEdit(name));
            list.appendChild(row);
        }
        // Editor
        editor.innerHTML = "";
        const selected = this.state.blueprints[ws.selectedBlueprint];
        if (!selected) return;
        // Header mit Label + Aktionen
        const header = document.createElement("div");
        header.className = "workshop-header";
        const title = document.createElement("h3");
        title.textContent = selected.label || selected.name;
        header.appendChild(title);
        const status = document.createElement("span");
        status.className = "workshop-status";
        status.textContent = selected.builtIn ? "Eingebaut — zum Bearbeiten klonen" : `${selected.parts.length} Parts`;
        header.appendChild(status);
        editor.appendChild(header);
        // Welle 4 Phase 3 — Werkzeug-Sammlung. Eine Liste der besessenen
        // Tools mit ihrem Cap. Sichtbarmacht, womit Spieler aktuell arbeiten
        // kann. Read-only in Phase 3 (eigene Werkzeuge gehen in Welle 6 auf).
        const toolsBox = document.createElement("div");
        toolsBox.className = "workshop-tools";
        const toolsTitle = document.createElement("div");
        toolsTitle.className = "workshop-tools-title";
        toolsTitle.textContent = "Werkzeuge";
        toolsBox.appendChild(toolsTitle);
        const owned = this.state.player.tools || [];
        for (const tn of owned) {
            const t = this.state.tools[tn];
            if (!t) continue;
            const chip = document.createElement("span");
            chip.className = "workshop-tool-chip";
            chip.textContent = `${t.label} ${t.precisionCap.toFixed(2)}`;
            chip.title = `${t.opName} (${t.opClass})`;
            toolsBox.appendChild(chip);
        }
        editor.appendChild(toolsBox);
        // Parts-Liste — bei Built-ins nur lesbar
        const partsDiv = document.createElement("div");
        partsDiv.className = "workshop-parts";
        if (selected.parts.length === 0) {
            const empty = document.createElement("div");
            empty.className = "workshop-empty";
            empty.textContent = "Noch keine Parts.";
            partsDiv.appendChild(empty);
        }
        for (let i = 0; i < selected.parts.length; i++) {
            const part = selected.parts[i];
            const row = document.createElement("div");
            row.className = "workshop-part-row";
            // Shape-Dropdown
            const shapeSelect = document.createElement("select");
            for (const shape of [
                "box",
                "sphere",
                "cylinder",
                "cone",
                "pyramid",
                "octahedron",
                "plane",
                "torus",
                "helix",
            ]) {
                const opt = document.createElement("option");
                opt.value = shape;
                opt.textContent = shape;
                if (shape === part.shape) opt.selected = true;
                shapeSelect.appendChild(opt);
            }
            shapeSelect.disabled = !!selected.builtIn;
            shapeSelect.addEventListener("change", () => {
                this.updatePartInBlueprint(selected.name, i, { shape: shapeSelect.value });
                this._renderWorkshopDOM();
            });
            row.appendChild(shapeSelect);
            // Welle 4 Phase 1 — Material-Dropdown vor dem Color-Picker.
            // Built-ins zeigen Material read-only; bei eigenen Bauplänen
            // wechselt die Material-Wahl auch die Default-Farbe (recolor).
            const materialSelect = document.createElement("select");
            materialSelect.className = "workshop-material";
            materialSelect.title = "Material";
            for (const matName of Object.keys(this.state.materials || {})) {
                const opt = document.createElement("option");
                opt.value = matName;
                opt.textContent = this.state.materials[matName].label || matName;
                if (matName === (part.material || "stein")) opt.selected = true;
                materialSelect.appendChild(opt);
            }
            materialSelect.disabled = !!selected.builtIn;
            materialSelect.addEventListener("change", () => {
                this.updatePartInBlueprint(selected.name, i, {
                    material: materialSelect.value,
                    recolor: true,
                });
                this._renderWorkshopDOM();
            });
            row.appendChild(materialSelect);
            // Color-Input
            const colorInput = document.createElement("input");
            colorInput.type = "color";
            const hex = "#" + (part.color || 0).toString(16).padStart(6, "0");
            colorInput.value = hex;
            colorInput.disabled = !!selected.builtIn;
            colorInput.addEventListener("input", () => {
                const num = parseInt(colorInput.value.replace("#", ""), 16);
                this.updatePartInBlueprint(selected.name, i, { color: num });
            });
            row.appendChild(colorInput);
            // Position + Size + Rotation kompakt als 9 Mini-Inputs
            const xyzGrid = document.createElement("div");
            xyzGrid.className = "workshop-xyz";
            const fields = [
                { label: "Pos X", key: "position", axis: "x" },
                { label: "Y", key: "position", axis: "y" },
                { label: "Z", key: "position", axis: "z" },
                { label: "Größe X", key: "size", axis: "x" },
                { label: "Y", key: "size", axis: "y" },
                { label: "Z", key: "size", axis: "z" },
                { label: "Rot X", key: "rotation", axis: "x" },
                { label: "Y", key: "rotation", axis: "y" },
                { label: "Z", key: "rotation", axis: "z" },
            ];
            for (const f of fields) {
                const wrap = document.createElement("label");
                wrap.className = "workshop-field";
                const lbl = document.createElement("span");
                lbl.textContent = f.label;
                const input = document.createElement("input");
                input.type = "number";
                input.step = "0.1";
                input.value = String((part[f.key] && part[f.key][f.axis]) || 0);
                input.disabled = !!selected.builtIn;
                input.addEventListener("change", () => {
                    const v = parseFloat(input.value);
                    if (!Number.isFinite(v)) return;
                    this.updatePartInBlueprint(selected.name, i, {
                        [f.key]: { [f.axis]: v },
                    });
                });
                wrap.appendChild(lbl);
                wrap.appendChild(input);
                xyzGrid.appendChild(wrap);
            }
            row.appendChild(xyzGrid);
            // Entfernen-Button
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "workshop-del";
            delBtn.textContent = "×";
            delBtn.disabled = !!selected.builtIn;
            delBtn.addEventListener("click", () => {
                this.removePartFromBlueprint(selected.name, i);
                this._renderWorkshopDOM();
            });
            // Welle 4 Phase 3 — opChain pro Part: Liste der bisherigen Ops +
            // Apply-Dropdown der besessenen, kompatiblen Werkzeuge. Built-in-
            // Baupläne sind read-only (keine Apply-Buttons).
            const opChainDiv = document.createElement("div");
            opChainDiv.className = "workshop-opchain";
            const precision = this.computePartPrecision(part);
            const precHeader = document.createElement("div");
            precHeader.className = "workshop-opchain-header";
            precHeader.textContent = `Präzision ${precision.toFixed(2)} — Op-Kette:`;
            opChainDiv.appendChild(precHeader);
            const chainList = document.createElement("div");
            chainList.className = "workshop-opchain-list";
            const chain = Array.isArray(part.opChain) ? part.opChain : [];
            for (const op of chain) {
                const opRow = document.createElement("span");
                opRow.className = "workshop-op";
                opRow.textContent = `${op.op}(${(op.cap || 0).toFixed(2)})`;
                opRow.title = `Werkzeug: ${op.tool}`;
                chainList.appendChild(opRow);
            }
            opChainDiv.appendChild(chainList);
            if (!selected.builtIn) {
                const applyRow = document.createElement("div");
                applyRow.className = "workshop-opchain-apply";
                const toolSelect = document.createElement("select");
                toolSelect.className = "workshop-op-tool";
                const matName = part.material || "stein";
                const compat = AnazhRealm.MATERIAL_OP_COMPATIBILITY[matName];
                const ownedTools = (this.state.player.tools || [])
                    .map((tn) => this.state.tools[tn])
                    .filter((t) => t && (!compat || compat.includes(t.opClass)));
                if (ownedTools.length === 0) {
                    const noTool = document.createElement("span");
                    noTool.textContent = "(kein passendes Werkzeug)";
                    noTool.className = "workshop-op-empty";
                    applyRow.appendChild(noTool);
                } else {
                    for (const t of ownedTools) {
                        const opt = document.createElement("option");
                        opt.value = t.name;
                        opt.textContent = `${t.label} → ${t.opName} (${t.precisionCap.toFixed(2)})`;
                        toolSelect.appendChild(opt);
                    }
                    const applyBtn = document.createElement("button");
                    applyBtn.type = "button";
                    applyBtn.className = "workshop-op-apply";
                    applyBtn.textContent = "anwenden";
                    applyBtn.addEventListener("click", () => {
                        const r = this.applyOpToPart(selected.name, i, toolSelect.value);
                        if (!r.ok) {
                            this.log(`apply_op fehlgeschlagen: ${r.reason}`, "ERROR");
                        }
                        this._renderWorkshopDOM();
                    });
                    applyRow.appendChild(toolSelect);
                    applyRow.appendChild(applyBtn);
                }
                opChainDiv.appendChild(applyRow);
            }
            row.appendChild(opChainDiv);
            row.appendChild(delBtn);
            partsDiv.appendChild(row);
        }
        editor.appendChild(partsDiv);
        // Welle 5 A — Verbindungen zwischen Parts. Acht Typen aus Konzept
        // §5.1, jede mit eigener Last-Formel (Material-Tags × Kontaktfläche
        // × Typ-Multiplier). Built-ins read-only.
        const connectionsSection = document.createElement("div");
        connectionsSection.className = "workshop-connections";
        const connTitle = document.createElement("div");
        connTitle.className = "workshop-tags-title";
        connTitle.textContent = "Verbindungen";
        connectionsSection.appendChild(connTitle);
        const connections = Array.isArray(selected.connections) ? selected.connections : [];
        if (connections.length === 0) {
            const empty = document.createElement("div");
            empty.className = "workshop-tags-empty";
            empty.textContent = "Keine Verbindungen — Parts sitzen lose im Compound.";
            connectionsSection.appendChild(empty);
        } else {
            for (let ci = 0; ci < connections.length; ci++) {
                const conn = connections[ci];
                const ctype = AnazhRealm.CONNECTION_TYPES[conn.type];
                const strength = this.computeConnectionStrength(conn, selected);
                const row = document.createElement("div");
                row.className = "workshop-conn-row";
                const label = document.createElement("span");
                label.className = "workshop-conn-label";
                label.textContent = `${ctype ? ctype.label : conn.type}: #${conn.partA} ↔ #${conn.partB}`;
                const bar = document.createElement("span");
                bar.className = "workshop-conn-bar";
                const stars = Math.max(0, Math.min(3, Math.round(strength)));
                bar.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
                if (strength < AnazhRealm.CONNECTION_SOLID_THRESHOLD) bar.classList.add("workshop-conn-weak");
                const num = document.createElement("span");
                num.className = "workshop-conn-num";
                num.textContent = strength.toFixed(2);
                row.appendChild(label);
                row.appendChild(bar);
                row.appendChild(num);
                if (!selected.builtIn) {
                    const delConnBtn = document.createElement("button");
                    delConnBtn.type = "button";
                    delConnBtn.className = "workshop-conn-del";
                    delConnBtn.textContent = "×";
                    delConnBtn.addEventListener("click", () => {
                        this.removeConnectionFromBlueprint(selected.name, ci);
                        this._renderWorkshopDOM();
                    });
                    row.appendChild(delConnBtn);
                }
                connectionsSection.appendChild(row);
            }
        }
        if (!selected.builtIn && selected.parts.length >= 2) {
            const addRow = document.createElement("div");
            addRow.className = "workshop-conn-add";
            const typeSel = document.createElement("select");
            typeSel.className = "workshop-conn-type";
            for (const tname of Object.keys(AnazhRealm.CONNECTION_TYPES)) {
                const opt = document.createElement("option");
                opt.value = tname;
                opt.textContent = AnazhRealm.CONNECTION_TYPES[tname].label;
                opt.title = AnazhRealm.CONNECTION_TYPES[tname].description;
                typeSel.appendChild(opt);
            }
            const aSel = document.createElement("select");
            aSel.className = "workshop-conn-part";
            const bSel = document.createElement("select");
            bSel.className = "workshop-conn-part";
            for (let pi = 0; pi < selected.parts.length; pi++) {
                const optA = document.createElement("option");
                optA.value = String(pi);
                optA.textContent = `#${pi} ${selected.parts[pi].shape}`;
                aSel.appendChild(optA);
                const optB = optA.cloneNode(true);
                bSel.appendChild(optB);
            }
            if (selected.parts.length > 1) bSel.value = "1";
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.className = "workshop-conn-addbtn";
            addBtn.textContent = "verbinden";
            addBtn.addEventListener("click", () => {
                const r = this.addConnectionToBlueprint(selected.name, {
                    type: typeSel.value,
                    partA: parseInt(aSel.value, 10),
                    partB: parseInt(bSel.value, 10),
                });
                if (!r.ok) this.log(`apply_connection fehlgeschlagen: ${r.reason}`, "ERROR");
                this._renderWorkshopDOM();
            });
            addRow.appendChild(typeSel);
            addRow.appendChild(aSel);
            addRow.appendChild(bSel);
            addRow.appendChild(addBtn);
            connectionsSection.appendChild(addRow);
        }
        editor.appendChild(connectionsSection);
        // Welle 5 C — Bauplan als Werkzeug markieren + registrieren. Nur für
        // eigene Baupläne. UI zeigt: aktuelle Bauplan-Präzision (= zukünftiger
        // Cap), opName + opClass Inputs, „als Werkzeug registrieren"-Button.
        // Bereits registriert → Status-Indikator + Cap-Wert.
        if (!selected.builtIn) {
            const toolSection = document.createElement("div");
            toolSection.className = "workshop-tool-recursion";
            const toolHeading = document.createElement("div");
            toolHeading.className = "workshop-tags-title";
            toolHeading.textContent = "Werkzeug-Rolle (Konzept §4.3)";
            toolSection.appendChild(toolHeading);
            const currentCap = this.computeBlueprintPrecisionCap(selected);
            const capInfo = document.createElement("div");
            capInfo.className = "workshop-tags-empty";
            capInfo.textContent = `Bauplan-Präzision: ${currentCap.toFixed(2)} (wird zum Tool-Cap beim Registrieren)`;
            toolSection.appendChild(capInfo);
            const existingTool = this.state.tools[selected.name];
            const isRegistered =
                existingTool && !existingTool.builtIn && existingTool.sourceBlueprint === selected.name;
            if (isRegistered) {
                const registeredInfo = document.createElement("div");
                registeredInfo.className = "workshop-tool-registered";
                registeredInfo.textContent = `Registriert als ${existingTool.opName} (${existingTool.opClass}) — Cap ${existingTool.precisionCap.toFixed(2)}.`;
                toolSection.appendChild(registeredInfo);
            }
            const toolRow = document.createElement("div");
            toolRow.className = "workshop-tool-form";
            const opNameInput = document.createElement("input");
            opNameInput.type = "text";
            opNameInput.className = "workshop-tool-opname";
            opNameInput.placeholder = "op-name (z.B. lathe)";
            opNameInput.maxLength = 24;
            opNameInput.value = (selected.toolMeta && selected.toolMeta.opName) || "";
            const opClassSel = document.createElement("select");
            opClassSel.className = "workshop-tool-opclass";
            for (const cls of ["subtractive", "plastic", "additive", "phaseChange"]) {
                const opt = document.createElement("option");
                opt.value = cls;
                opt.textContent = cls;
                if ((selected.toolMeta && selected.toolMeta.opClass) === cls) opt.selected = true;
                opClassSel.appendChild(opt);
            }
            const registerBtn = document.createElement("button");
            registerBtn.type = "button";
            registerBtn.className = "workshop-tool-register";
            registerBtn.textContent = isRegistered ? "neu registrieren" : "als Werkzeug registrieren";
            registerBtn.addEventListener("click", () => {
                const metaR = this.setBlueprintToolMeta(selected.name, opNameInput.value.trim(), opClassSel.value);
                if (!metaR.ok) {
                    this.log(`set_tool_meta fehlgeschlagen: ${metaR.reason}`, "ERROR");
                    return;
                }
                const regR = this.registerBlueprintAsTool(selected.name);
                if (!regR.ok) {
                    this.log(`register_tool fehlgeschlagen: ${regR.reason}`, "ERROR");
                } else {
                    this.journalAppend(
                        "growth",
                        `Ein eigenes Werkzeug entstand: ${selected.name} (Cap ${regR.precisionCap.toFixed(2)}).`,
                        { tool: selected.name, cap: regR.precisionCap }
                    );
                }
                this._renderWorkshopDOM();
            });
            toolRow.appendChild(opNameInput);
            toolRow.appendChild(opClassSel);
            toolRow.appendChild(registerBtn);
            toolSection.appendChild(toolRow);
            editor.appendChild(toolSection);
        }
        // Welle 4 Phase 2 — emergente Tag-Anzeige für den ganzen Compound.
        // Read-only: Spieler sehen, was Form + Material zusammen aktivieren.
        // Hinweis-Text dokumentiert die Grenze zur räumlichen Emergenz
        // (Welle 5+). Nur einmal pro Render, nicht pro Part.
        const tagsSection = document.createElement("div");
        tagsSection.className = "workshop-tags";
        const tagsTitle = document.createElement("div");
        tagsTitle.className = "workshop-tags-title";
        tagsTitle.textContent = "Aktive Eigenschaften";
        tagsSection.appendChild(tagsTitle);
        const compoundTags = this.computeCompoundTags(selected);
        const tagKeys = AnazhRealm.MATERIAL_TAG_KEYS;
        const anyActive = tagKeys.some((k) => (compoundTags[k] || 0) > 0);
        if (!anyActive) {
            const empty = document.createElement("div");
            empty.className = "workshop-tags-empty";
            empty.textContent = "Keine Tags aktiviert (Form × Material ergibt 0).";
            tagsSection.appendChild(empty);
        } else {
            for (const tag of tagKeys) {
                const val = compoundTags[tag] || 0;
                if (val <= 0) continue;
                const row = document.createElement("div");
                row.className = "workshop-tag-row";
                row.dataset.tag = tag;
                const name = document.createElement("span");
                name.className = "workshop-tag-name";
                name.textContent = tag;
                const bar = document.createElement("span");
                bar.className = "workshop-tag-bar";
                const stars = Math.min(3, Math.round(val));
                bar.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
                const num = document.createElement("span");
                num.className = "workshop-tag-num";
                num.textContent = val.toFixed(2);
                row.appendChild(name);
                row.appendChild(bar);
                row.appendChild(num);
                tagsSection.appendChild(row);
            }
        }
        // Welle 5 B — räumliche Anreicherung als zweite Strahler-Reihe.
        // Nur Tags zeigen, deren räumlicher Wert über dem atomaren liegt
        // (sonst hätten wir doppelte Anzeige). Erscheint nur wenn der Spieler
        // mindestens einen pointed-Shape oder eine Kontakt-Brücke gebaut hat.
        const spatialTags = this.computeSpatialTags(selected);
        const spatialDeltas = [];
        for (const tag of tagKeys) {
            const atomar = compoundTags[tag] || 0;
            const spatial = spatialTags[tag] || 0;
            if (spatial > atomar + 0.01) {
                spatialDeltas.push({ tag, atomar, spatial });
            }
        }
        if (spatialDeltas.length > 0) {
            const spatialTitle = document.createElement("div");
            spatialTitle.className = "workshop-tags-title workshop-spatial-title";
            spatialTitle.textContent = "Räumliche Verstärkung";
            tagsSection.appendChild(spatialTitle);
            for (const d of spatialDeltas) {
                const row = document.createElement("div");
                row.className = "workshop-tag-row workshop-spatial-row";
                row.dataset.tag = d.tag;
                const name = document.createElement("span");
                name.className = "workshop-tag-name";
                name.textContent = d.tag;
                const bar = document.createElement("span");
                bar.className = "workshop-tag-bar";
                const stars = Math.min(3, Math.round(d.spatial));
                bar.textContent = "★".repeat(stars) + "☆".repeat(3 - stars);
                const num = document.createElement("span");
                num.className = "workshop-tag-num";
                num.textContent = `${d.atomar.toFixed(2)} → ${d.spatial.toFixed(2)}`;
                row.appendChild(name);
                row.appendChild(bar);
                row.appendChild(num);
                tagsSection.appendChild(row);
            }
        }
        const tagsHint = document.createElement("div");
        tagsHint.className = "workshop-tags-hint";
        tagsHint.textContent =
            spatialDeltas.length > 0
                ? "Atomar = Form × Material. Räumlich = fünf Prinzipien (§5.2): Spitze richtet, Hohlraum enthält, Symmetrieachse trägt, Kontakt überträgt, Abstände resonieren."
                : "Atomare Schicht: pro Part. Räumliche Verstärkung erscheint bei pointed-Spitzen am Rand, Hohlraum-Paaren (Sphere/Torus mit Inhalt), Y-Achsen-Symmetrie oder Resonanz-Arrays (≥3 gleiche Shape auf gleichem Radius).";
        tagsSection.appendChild(tagsHint);
        editor.appendChild(tagsSection);
        // Aktions-Buttons
        const actions = document.createElement("div");
        actions.className = "workshop-actions";
        // Part hinzufügen (nur eigene Baupläne)
        if (!selected.builtIn) {
            const addBtn = document.createElement("button");
            addBtn.type = "button";
            addBtn.textContent = "Part hinzufügen";
            addBtn.addEventListener("click", () => {
                this.addPartToBlueprint(selected.name);
                this._renderWorkshopDOM();
            });
            actions.appendChild(addBtn);
        }
        // Klonen
        const cloneBtn = document.createElement("button");
        cloneBtn.type = "button";
        cloneBtn.textContent = "Klonen";
        cloneBtn.addEventListener("click", () => {
            const newName = window.prompt("Name für die Kopie?", `${selected.name}-kopie`);
            if (!newName) return;
            if (this.cloneBlueprint(selected.name, newName)) {
                this.selectBlueprintForEdit(newName);
            }
        });
        actions.appendChild(cloneBtn);
        // Löschen (nur eigene)
        if (!selected.builtIn) {
            const delBtn = document.createElement("button");
            delBtn.type = "button";
            delBtn.className = "workshop-danger";
            delBtn.textContent = "Löschen";
            delBtn.addEventListener("click", () => {
                if (!window.confirm(`Bauplan '${selected.name}' wirklich löschen?`)) return;
                this.deleteBlueprint(selected.name);
                // Auf einen anderen Bauplan umschalten
                const remaining = Object.keys(this.state.blueprints);
                if (remaining.length > 0) this.selectBlueprintForEdit(remaining[0]);
                else this._renderWorkshopDOM();
            });
            actions.appendChild(delBtn);
        }
        // Neuer Bauplan (immer verfügbar)
        const newBtn = document.createElement("button");
        newBtn.type = "button";
        newBtn.textContent = "Neuer Bauplan";
        newBtn.addEventListener("click", () => {
            const name = window.prompt("Name des neuen Bauplans?");
            if (!name) return;
            if (this.createBlueprint(name, name)) this.selectBlueprintForEdit(name);
        });
        actions.appendChild(newBtn);
        editor.appendChild(actions);
        // Hotbar-Config und alle Phantom-Mesh updaten, falls der aktive
        // Bauplan editiert wurde.
        this._renderHotbarConfigDOM();
        this._renderHotbarDOM();
        // Phantom in Bau-Modus neu rendern, falls er den editierten Bauplan zeigt
        const bm = this.state.buildMode;
        if (bm.active && bm.blueprintName === selected.name) {
            const idx = bm.slotIndex;
            this._clearBuildMode();
            if (idx >= 0 && this.state.hotbar[idx] === selected.name) this.selectHotbarSlot(idx);
        }
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
    setCameraMode(mode) {
        const next = mode === "third" ? "third" : "first";
        this.state.cameraMode = next;
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

    cameraModeInitDOM() {
        const toggle = document.getElementById("camera-mode-toggle");
        if (!toggle) return;
        const stored = (() => {
            try {
                return localStorage.getItem("anazhRealmCameraMode");
            } catch {
                return null;
            }
        })();
        const initial = stored === "third" ? "third" : "first";
        this.setCameraMode(initial);
        toggle.addEventListener("click", () => {
            this.setCameraMode(this.state.cameraMode === "third" ? "first" : "third");
        });
    }

    playerSoulInitDOM() {
        const select = document.getElementById("player-soul-select");
        if (!select) return;
        // Optionen aus den Defs aufbauen, damit Label + Reihenfolge an einer
        // Stelle leben.
        const defs = this.playerSoulDefs;
        select.innerHTML = "";
        for (const key of Object.keys(defs)) {
            const opt = document.createElement("option");
            opt.value = key;
            opt.textContent = defs[key].label;
            select.appendChild(opt);
        }
        select.value = this.state.player.soul || "human";
        select.addEventListener("change", () => {
            this.applyPlayerSoul(select.value);
        });
        // Status-Bar mit Default beschriften, falls vorhanden.
        const status = document.getElementById("status-soul");
        if (status) {
            const cur = defs[this.state.player.soul || "human"];
            status.textContent = (cur && cur.label) || "—";
        }
        // Welle 6.D Etappe 1 — initiale Stats-UI rendern, falls #player-stats
        // schon im DOM ist (HTML statisch vorgegeben). Update läuft danach bei
        // jedem applyPlayerSoul → recomputePlayerStats.
        this.renderPlayerStatsUI();
    }

    // Welle 6.D Etappe 1 — Stats-UI im Spieler-Drawer rendern.
    //
    // Acht Zeilen (HP, Damage, Speed, Sprungkraft, Ausdauer, Präzision,
    // MagicResist, HeatResist). Werte aus state.player.stats; Tag-Profile
    // aus state.player.statTags (klein darunter, damit der Schöpfer sieht
    // welches Tag den Stat dominiert). Throttle ist nicht nötig — wird nur
    // bei Soul-Wechsel + initial gerufen.
    renderPlayerStatsUI() {
        if (typeof document === "undefined") return;
        const container = document.getElementById("player-stats");
        if (!container) return;
        const stats = (this.state.player && this.state.player.stats) || null;
        const tags = (this.state.player && this.state.player.statTags) || null;
        container.innerHTML = "";
        if (!stats) {
            const empty = document.createElement("div");
            empty.className = "stats-empty";
            empty.textContent = "Stats werden berechnet, wenn die Seele gewählt ist.";
            container.appendChild(empty);
            return;
        }
        // Welle 6.D Etappe 1.5 — Körper-Teile-Liste oben, dann Stats darunter.
        // Damit der Schöpfer SIEHT, woraus seine Seele besteht und wie ihre
        // Stats daraus entstehen (Form × Material → Compound-Tags → Stats).
        const soulName = (this.state.player && this.state.player.soul) || "human";
        const soul = this.playerSoulDefs[soulName];
        if (soul && Array.isArray(soul.bodyParts) && soul.bodyParts.length > 0) {
            const bodyHeader = document.createElement("div");
            bodyHeader.className = "body-parts-header";
            bodyHeader.textContent = "Körper-Teile (Form × Material → Tags)";
            container.appendChild(bodyHeader);
            for (const part of soul.bodyParts) {
                const row = document.createElement("div");
                row.className = "body-part-row";
                const label = document.createElement("span");
                label.className = "body-part-label";
                label.textContent = part.label || part.shape;
                const meta = document.createElement("span");
                meta.className = "body-part-meta";
                meta.textContent = `${part.shape} · ${part.material}`;
                row.appendChild(label);
                row.appendChild(meta);
                container.appendChild(row);
            }
            const divider = document.createElement("div");
            divider.className = "stats-divider";
            container.appendChild(divider);
        }
        const rows = [
            { key: "hpMax", label: "Lebenskraft", fmt: (v) => Math.round(v) },
            { key: "damage", label: "Schaden", fmt: (v) => v.toFixed(1) },
            { key: "speed", label: "Lauf-Geschwindigkeit", fmt: (v) => v.toFixed(2) },
            { key: "jumpPower", label: "Sprungkraft", fmt: (v) => v.toFixed(2) },
            { key: "staminaMax", label: "Ausdauer", fmt: (v) => Math.round(v) },
            { key: "precision", label: "Präzision", fmt: (v) => v.toFixed(2) },
            { key: "magicResist", label: "Magie-Resistenz", fmt: (v) => v.toFixed(2) },
            { key: "heatResist", label: "Hitze-Resistenz", fmt: (v) => v.toFixed(2) },
        ];
        for (const row of rows) {
            const div = document.createElement("div");
            div.className = "stat-row";
            const label = document.createElement("span");
            label.className = "stat-label";
            label.textContent = row.label;
            const value = document.createElement("span");
            value.className = "stat-value";
            value.textContent = row.fmt(stats[row.key] || 0);
            div.appendChild(label);
            div.appendChild(value);
            container.appendChild(div);
        }
        // Tag-Profil dezent unten — die zwei dominantesten Achsen zeigen.
        if (tags) {
            const sorted = Object.keys(tags)
                .map((k) => ({ k, v: tags[k] }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 3);
            const tagLine = document.createElement("div");
            tagLine.className = "stat-tags";
            tagLine.textContent = "Stark: " + sorted.map((s) => `${s.k} ${s.v.toFixed(2)}`).join(" · ");
            container.appendChild(tagLine);
        }
    }

    async init() {
        this.log("Initialisiere Anazh Realm V7.72... Ewigkeit erwacht!", "INFO");
        this.themeInitDOM();
        this.grokInitDOM();
        this.symphonyInitDOM();
        this.initStatusPanel();
        this.playerSoulInitDOM();
        this.cameraModeInitDOM();
        // Ring 6.5 — Hotbar im DOM rendern. Wird hier einmal aufgesetzt;
        // setHotbarSlot löst ein Re-Render aus.
        this._renderHotbarDOM();
        // Ring 6.6 — Werkstatt-Editor initial mit Default-Bauplan rendern.
        this._renderWorkshopDOM();
        this._updateBuildModeHud();
        this.initTopbar();
        this.initConsoleDOM();
        // Schicht 2 — LLM-Persistenz aus localStorage holen + UI verkabeln.
        this.llmLoadPersisted();
        this.initLlmUI();
        // Ring 11 V1 — P2P-Persistenz aus localStorage + UI-Verkabelung.
        // Auto-Connect erst nach ensureWorldMeta (sonst hätten wir keine
        // worldId als default-Raum).
        this.p2pLoadPersisted();
        this.initP2PUI();
        // Ring 8: aktive Welt-Identität VOR ensureWorldMeta laden, sonst
        // würde fresh=true triggern (UUID neu + Genesis-Eintrag), obwohl
        // diese Welt bereits existiert. Migriert nebenbei einen Legacy-
        // Single-Welt-Save, falls vorhanden.
        this._preloadActiveWorldMeta();
        this.ensureWorldMeta();
        // Welle 6.E2 — Intro-Overlay beim ersten Welt-Start. Liest seen.intro
        // aus dem soeben hydrierten worldJournal + localStorage `anazh.ui.skipIntro`.
        this.initIntroDialog();
        // Welle 3 F — Welt-Info-Sektion im Welt-Drawer.
        this.initWorldInfoUI();
        // Ring 9 — Welt-Tor Drei-Wahl-Dialog beim Import.
        this.initWeltTorUI();
        // Ring 10 — Welt-Fusion-Dialog.
        this.initWorldFusionUI();
        // Ring 11 V1 — Auto-Connect, falls Spieler die Verbindung letztes
        // Mal aktiv gelassen hat. ensureWorldMeta lief eben, also gibt es
        // jetzt eine worldId als Raum-Default.
        // Ring 11.5: zusätzlich Auto-Connect, wenn worldMeta.role === "host"
        // oder "guest" — der Modus ist welt-intrinsisch (im Dialog gewählt),
        // soll nicht beim Reload jedes Mal manuell aktiviert werden müssen.
        if (this.state.worldMeta) {
            const role = this.state.worldMeta.role;
            if (role === "host" || role === "guest") {
                this.state.p2p.enabled = true;
                this.state.p2p.role = role;
                // Guests bekamen vom Importer hostInfo.url ins localStorage
                // gespeichert; p2pLoadPersisted oben hat das schon aufgenommen.
            }
        }
        if (this.state.p2p.enabled) {
            this.initP2PSync(null);
        }
        try {
            await this.core.initPhysics();
            this.log("Physik erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Physik fehlgeschlagen: ${error.message} – Ohne Physik fortfahren`, "ERROR");
            this.state.physicsWorld = null;
        }

        try {
            this.initializeNexus();
            this.log("Nexus erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Nexus-Initialisierung fehlgeschlagen: ${error.message} – Ohne Nexus fortfahren`, "ERROR");
        }

        const canvas = document.getElementById("world-canvas");
        if (!canvas) {
            this.log("Canvas fehlt – Ewigkeit unsichtbar!", "ERROR");
            return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const renderer = new THREE.WebGLRenderer({ canvas });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 1);
        renderer.depthTest = true;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.state.renderer = renderer;
        this.log("Renderer initialisiert mit Schattenunterstützung", "INFO");
        this.state.selfAwareness.components.push("renderer");

        const scene = new THREE.Scene();
        this.state.scene = scene;
        this.log("Szene initialisiert", "INFO");
        this.state.selfAwareness.components.push("scene");

        this.createGalaxySkybox();
        this.log("Galaxy-Skybox erstellt", "INFO");

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -300;
        directionalLight.shadow.camera.right = 300;
        directionalLight.shadow.camera.top = 300;
        directionalLight.shadow.camera.bottom = -300;
        scene.add(directionalLight);
        this.log("Beleuchtung hinzugefügt: Ambient (0.6), Directional (1.0) mit Schatten", "INFO");

        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.state.camera = camera;
        this.log("Kamera initialisiert", "INFO");
        this.state.selfAwareness.components.push("camera");

        // Ring 5 V2: Spieler-Mesh ist ein THREE.Group (Multi-Mesh + Animation).
        // Wir starten mit einem leeren Group als Anker (Position + Skalierung)
        // und lassen applyPlayerSoul ihn sofort mit dem ersten Soul-Aufbau
        // füllen. So hat der Code danach EINEN Pfad für initialen Bau und
        // späteren Wechsel.
        const initialGroup = new THREE.Group();
        initialGroup.position.set(0, 20, 0);
        initialGroup.visible = true;
        scene.add(initialGroup);
        this.state.playerMesh = initialGroup;
        const initialSoul =
            this.state.player.soul && this.playerSoulDefs[this.state.player.soul] ? this.state.player.soul : "human";
        this.applyPlayerSoul(initialSoul);
        this.log("Spieler erstellt: Position (0, 20, 0), Soul + Schatten aktiviert", "INFO");
        this.state.selfAwareness.components.push("playerMesh");

        if (this.state.physicsWorld) {
            const playerShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
            // WICHTIG: state.playerMesh, nicht der lokale `playerMesh` —
            // applyPlayerSoul oben hat den initialen Group durch das fertige
            // Soul-Group ersetzt. Local-var wäre stale.
            this.state.playerBody = this.addRigidBody(this.state.playerMesh, 1, playerShape, true);
            // CCD direkt aktivieren: schützt vor Tunneling durch dünne
            // Heightfield-Cell-Ränder oder Sprung-Landungen genau auf einer
            // Chunk-Naht. Bisher nur per optimizeCollisions nachträglich
            // gesetzt — der Spieler fiel deshalb in den ersten Sekunden öfter
            // durch den Boden.
            if (this.state.playerBody) {
                // Aggressive CCD-Parameter: kleiner threshold = mehr Sweep-
                // Checks pro Frame, größerer Radius = robusterer Catch durch
                // dünne Triangles bei steilen Hängen oder Wänden.
                this.state.playerBody.setCcdMotionThreshold(0.01);
                this.state.playerBody.setCcdSweptSphereRadius(0.45);
                // Welle 6.A1 — Wall-Sliding. Spieler-Friction auf 0 setzt die
                // tangentiale Reibung an Bauwerks-Wänden auf null: der Spieler
                // bleibt nicht hängen, sondern rutscht entlang. Stoppen
                // funktioniert weiterhin, weil setLinearVelocity die Geschwindigkeit
                // jeden Frame explizit nullt (siehe Spielerbewegung im Game-Loop),
                // statt sich auf Reibung zu verlassen.
                this.state.playerBody.setFriction(0);
            }
            this.log("Physik-Körper für Spieler hinzugefügt", "INFO");
            this.state.selfAwareness.components.push("playerBody");
        }

        this.loadState();
        this.generateNewWorld();

        window.addEventListener("keydown", (event) => {
            // Wenn der Fokus in einem Eingabe-Feld liegt (Chat), keine
            // Spiel-Aktionen aus den Tasten lösen — sonst tippt der User
            // "1" und es geht in den Bau-Modus statt in den Chat.
            const target = event.target;
            const inInput =
                target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
            this.state.keys[event.key.toLowerCase()] = true;
            if (event.key === " " && !inInput) this.handleJump(performance.now() / 1000);
            if (inInput) return;
            // Ring 6.5 — Hotbar-Tasten 1-9. Slot wird gewählt; bei
            // belegtem Slot aktiviert Build-Mode für den dort liegenden
            // Bauplan, bei leerem Slot bleibt Build-Mode aus.
            if (event.key >= "1" && event.key <= "9") {
                this.selectHotbarSlot(parseInt(event.key, 10) - 1);
            } else if (event.key.toLowerCase() === "f") {
                if (this.confirmBuild()) event.preventDefault();
            } else if (event.key === "Escape") {
                if (this.state.buildMode.active) this._clearBuildMode();
                this._updateHotbarHighlight();
            }
        });
        window.addEventListener("keyup", (event) => {
            this.state.keys[event.key.toLowerCase()] = false;
        });
        this.log("Tastatureingaben initialisiert: WASD, Space, Shift", "INFO");

        canvas.addEventListener("click", () => canvas.requestPointerLock());
        document.addEventListener("pointerlockchange", () => {
            this.state.isPointerLocked = document.pointerLockElement === canvas;
            this.log(`Pointer-Lock: ${this.state.isPointerLocked ? "Aktiv" : "Inaktiv"}`, "INFO");
        });
        document.addEventListener("mousemove", (event) => {
            if (this.state.isPointerLocked) {
                this.state.yaw -= event.movementX * this.state.mouseSensitivity;
                this.state.pitch -= event.movementY * this.state.mouseSensitivity;
                this.state.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.state.pitch));
            }
        });
        this.log("Maussteuerung für Kamera initialisiert", "INFO");

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            this.log("Fenstergröße angepasst", "INFO");
        });

        const chatInput = document.getElementById("chat-input");
        chatInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter" && chatInput.value.trim()) {
                this.processChatCommand(chatInput.value.trim());
            }
        });
        this.log("Chat-Steuerung initialisiert", "INFO");

        const fileInput = document.getElementById("state-file-input");
        if (fileInput) {
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files && event.target.files[0];
                if (file) this.handleStateFile(file);
            });
            this.log("State-Import (Lade Datei) initialisiert", "INFO");
        }

        this.core.startEternalLoop();
        this.log("Hauptschleife gestartet – Ultiversum pulsiert!", "INFO");
    }

    handleJump(currentTime) {
        // ### Sprunglogik ###
        // Zweck: Abstrahiert Sprungmechanik für bessere Wartbarkeit
        if (this.state.physicsWorld && this.state.playerBody) {
            const isGrounded = this.isPlayerGrounded();
            const withinCoyoteTime = currentTime - this.state.lastGroundedTime <= this.state.coyoteTime;
            if ((isGrounded || withinCoyoteTime) && !this.state.isJumping) {
                const velocity = this.state.playerBody.getLinearVelocity();
                this.state.playerBody.setLinearVelocity(
                    this.setVec(this.state.tmpVec1, velocity.x(), this.state.jumpPower, velocity.z())
                );
                this.state.isJumping = true;
                this.state.isInAir = true;
                // Ring 5 V2: keine Material-Tint mehr beim Sprung — der
                // Soul-Group hat kein einzelnes Material, und die Sprung-
                // Animation der Glieder ist die ehrlichere Anzeige.
                if (currentTime - this.state.lastJumpLog >= this.state.jumpLogInterval) {
                    this.log("Spieler springt!", "INFO");
                    this.state.lastJumpLog = currentTime;
                }
            }
        }
    }

    startEternalLoop() {
        // ### Spiel-Loop V7.66 ###
        // Learnings:
        // - V7.56 als Basis: Stabiler Loop mit Physik, Bewegung, Frustum Culling
        // - V7.64 Fehler: Unvollständig (fehlende selfAwarenessAnalyze), updateGrowth undefiniert
        // - V7.66 Vollendung: Alle Funktionen integriert, Fehler behoben, Kommentare ergänzt
        let lastTime = performance.now();
        const loop = (time) => {
            const delta = Math.max(0.001, (time - lastTime) / 1000);
            lastTime = time;
            const currentTime = time / 1000;

            // ### FPS aktualisieren ###
            this.updateFps(delta);

            // ### Nexus-Update ###
            if (this.state.nexusEvolutionQueue.length > 0) {
                const evolution = this.state.nexusEvolutionQueue.shift();
                if (Array.isArray(evolution.program)) {
                    const result = this.dslRun(evolution.program, { source: evolution.source || "nexus" });
                    // Schicht 1 — Initiale Fitness aus FPS allein. Endgültiger
                    // Wert kommt vom Finalizer 5 s später (Emotion + Activity).
                    const fpsDmg = Math.max(0, result.outcome.fpsBefore - result.outcome.fpsAfter);
                    const initialFitness = result.ok ? Math.max(0, 1 - fpsDmg / 100) : 0;
                    const abilityEntry = {
                        name: evolution.name,
                        program: evolution.program,
                        source: evolution.source || "nexus",
                        createdAt: evolution.createdAt || performance.now() / 1000,
                        fitness: initialFitness,
                    };
                    this.state.dsl.abilities.push(abilityEntry);
                    const historyEntry = {
                        id: evolution.name,
                        program: evolution.program,
                        at: performance.now() / 1000,
                        outcome: result.outcome,
                        ok: result.ok,
                        fitness: initialFitness,
                        finalized: false,
                    };
                    this.state.dsl.history.push(historyEntry);
                    if (this.state.dsl.history.length > this.state.dsl.historyCap) {
                        this.state.dsl.history = this.state.dsl.history.slice(-this.state.dsl.historyCap);
                    }
                    // Pending einreihen — Finalizer holt 5 s später Emotion/Activity-Delta.
                    if (result.ok) {
                        this.state.dsl.pendingOutcomes.push({
                            name: evolution.name,
                            program: evolution.program,
                            outcome: result.outcome,
                            historyRef: historyEntry,
                        });
                    }
                    this.log(
                        `Nexus-Evolution (DSL) ausgeführt: ${evolution.name}, fitness=${initialFitness.toFixed(2)}`,
                        "INFO"
                    );
                } else {
                    this.log(`Nexus-Evolution ohne DSL-Programm verworfen: ${evolution.name}`, "WARNING");
                }
                this.grokSpeak("nexus");
            }

            // ### Grok-Stimme (Ring 1) ###
            this.grokTick(currentTime);

            // ### Nexus-DSL Scheduler (Ring 2) ###
            this.dslTick(currentTime);

            // ### Player-Emotionen (Ring 3) ###
            this.updatePlayerEmotions(currentTime);

            // ### Symphonie-Wetter-Layer (Ring 4) ###
            this.symphonyTick();

            // ### Status-Panel (UI V1) ###
            this.updateStatusPanel(currentTime);

            // ### Ring 11 V1 — Multi-User Position-Sync ###
            // Broadcast (30 Hz Drosselung intern) + Peer-Mesh-Update + Idle-
            // Purge. No-op wenn p2p.enabled === false oder nicht verbunden.
            this.p2pTick(performance.now());

            // ### Bodenprüfung ###
            if (currentTime - this.state.lastGroundCheck >= this.state.groundCheckInterval) {
                if (!this.state.groundChunks || this.state.groundChunks.length === 0) {
                    this.log("Boden fehlt – Erzeuge neuen Boden...", "ERROR");
                    this.generateNewWorld();
                }
                this.state.lastGroundCheck = currentTime;
            }

            // ### Frustum Culling ###
            const frustum = new THREE.Frustum().setFromProjectionMatrix(
                new THREE.Matrix4().multiplyMatrices(
                    this.state.camera.projectionMatrix,
                    this.state.camera.matrixWorldInverse
                )
            );
            this.state.groundChunks.forEach((chunk) => (chunk.visible = this.isInFrustum(chunk, frustum)));
            if (this.state.floatingIslands)
                this.state.floatingIslands.forEach((island) => (island.visible = this.isInFrustum(island, frustum)));
            if (this.state.creatures)
                this.state.creatures.forEach((creature) => (creature.visible = this.isInFrustum(creature, frustum)));

            // ### UFOs animieren ###
            if (this.state.ufos && this.state.playerMesh) {
                const playerPos = this.state.playerMesh.position;
                this.state.ufos.forEach((ufo) => {
                    const distance = playerPos.distanceTo(ufo.position);
                    if (distance < 50) {
                        ufo.position.y = ufo.userData.baseY + Math.sin(currentTime * ufo.userData.speed) * 2;
                    }
                });
            }

            // ### Physik für fliegende Inseln ###
            if (this.state.floatingIslands && this.state.playerMesh) {
                const playerPos = this.state.playerMesh.position;
                let addedBodies = 0;
                this.state.floatingIslands.forEach((island) => {
                    if (island.userData.needsPhysics && addedBodies < 5) {
                        const distance = playerPos.distanceTo(island.position);
                        if (distance < 50) {
                            const islandSize = island.geometry.parameters?.width || 20;
                            const islandShape = new Ammo.btBoxShape(
                                new Ammo.btVector3(islandSize / 2, 5 / 2, islandSize / 2)
                            );
                            const transform = new Ammo.btTransform();
                            transform.setIdentity();
                            transform.setOrigin(
                                new Ammo.btVector3(
                                    island.position.x / this.state.scaleFactor,
                                    island.position.y / this.state.scaleFactor,
                                    island.position.z / this.state.scaleFactor
                                )
                            );
                            const motionState = new Ammo.btDefaultMotionState(transform);
                            const localInertia = new Ammo.btVector3(0, 0, 0);
                            const rbInfo = new Ammo.btRigidBodyConstructionInfo(
                                0,
                                motionState,
                                islandShape,
                                localInertia
                            );
                            const body = new Ammo.btRigidBody(rbInfo);
                            this.state.physicsWorld.addRigidBody(body);
                            island.userData.physicsBody = body;
                            this.state.rigidBodies.push(island);
                            island.userData.needsPhysics = false;
                            addedBodies++;
                            this.log(
                                `Physik für Insel: (${island.position.x.toFixed(2)}, ${island.position.y.toFixed(2)}, ${island.position.z.toFixed(2)})`,
                                "INFO"
                            );
                        }
                    }
                });
            }

            this.updateWallCollisions();

            // ### Physik-Simulation ###
            if (this.state.physicsWorld) {
                this.state.physicsWorld.stepSimulation(delta, 20, 1 / 60);
                for (let i = 0; i < this.state.rigidBodies.length; i++) {
                    const mesh = this.state.rigidBodies[i];
                    const body = mesh.userData.physicsBody;
                    const motionState = body.getMotionState();
                    if (motionState) {
                        motionState.getWorldTransform(this.state.tmpTransform);
                        const pos = this.state.tmpTransform.getOrigin();
                        let scaledY = pos.y() * this.state.scaleFactor;
                        const velocity = body.getLinearVelocity();

                        // Fall-Geschwindigkeit cappen: ohne Cap zog die
                        // Schwerkraft den Spieler in eine sehr hohe vy, sodass
                        // er pro Frame eine ganze Heightfield-Cell (~1.17 m)
                        // überspringen konnte — Tunneling durch steile Hänge.
                        // -25 m/s ist eine plausible Terminal Velocity und
                        // bleibt unter Cell-Breite × 60 fps.
                        if (mesh === this.state.playerMesh && velocity.y() < -25) {
                            body.setLinearVelocity(this.setVec(this.state.tmpVec1, velocity.x(), -25, velocity.z()));
                        }

                        // Kill-Plane näher an den Welt-Boden gerückt: vorher
                        // erst nach 1000 m freiem Fall — der Spieler war
                        // gefühlt "verloren". 30 m unter dem tiefsten Welt-
                        // Punkt ist nah genug, dass Resets sofort spürbar
                        // sind, aber tief genug, dass eine legitime Schlucht
                        // (heights -100..+100) den Spieler nicht reset.
                        const killPlaneY = (this.state.minHeight || -50) - 30;
                        if (scaledY < killPlaneY) {
                            const currentX = pos.x() * this.state.scaleFactor;
                            const currentZ = pos.z() * this.state.scaleFactor;

                            // Funktion zum Finden der Oberfläche über dem Spieler
                            const surfaceHeight = this.findSurfaceAbove(currentX, scaledY, currentZ);
                            scaledY = surfaceHeight + 0.5; // Spieler wird knapp über die Oberfläche gesetzt

                            const transform = this.state.tmpTransform;
                            transform.setIdentity();
                            transform.setOrigin(
                                this.setVec(
                                    this.state.tmpVec1,
                                    currentX / this.state.scaleFactor,
                                    scaledY / this.state.scaleFactor,
                                    currentZ / this.state.scaleFactor
                                )
                            );
                            body.setWorldTransform(transform);
                            body.setLinearVelocity(this.setVec(this.state.tmpVec2, velocity.x(), 0, velocity.z()));
                            this.state.isJumping = false;
                            this.state.isInAir = false;
                            mesh.position.set(currentX, scaledY, currentZ);
                            this.log(
                                `Spieler auf Oberfläche zurückgesetzt: (${currentX.toFixed(2)}, ${scaledY.toFixed(2)}, ${currentZ.toFixed(2)})`,
                                "INFO"
                            );
                        }

                        if (mesh === this.state.playerMesh) {
                            mesh.position.set(
                                pos.x() * this.state.scaleFactor,
                                scaledY,
                                pos.z() * this.state.scaleFactor
                            );
                            const isGrounded = this.isPlayerGrounded();
                            if (isGrounded) {
                                this.state.lastGroundedTime = currentTime;
                                this.state.isInAir = false;
                                this.state.isJumping = false;
                                // Ring 5 V2: Material-Tint entfernt (siehe handleJump).
                                if (currentTime - this.state.lastGroundedLog >= this.state.groundedLogInterval) {
                                    this.log("Spieler geerdet!", "INFO");
                                    this.state.lastGroundedLog = currentTime;
                                }
                            } else {
                                this.state.isInAir = true;
                            }
                        } else {
                            mesh.position.set(
                                pos.x() * this.state.scaleFactor,
                                scaledY,
                                pos.z() * this.state.scaleFactor
                            );
                        }
                    }
                }
            }

            // ### Spielerbewegung ###
            const player = this.state.playerMesh;
            const camera = this.state.camera;
            const playerBody = this.state.playerBody;
            const currentSpeed = this.state.keys["shift"] ? this.state.sprintSpeed : this.state.speed;

            this.state.forward.set(Math.sin(this.state.yaw), 0, Math.cos(this.state.yaw));
            this.state.right.set(Math.cos(this.state.yaw), 0, -Math.sin(this.state.yaw));
            this.state.moveDirection.set(0, 0, 0);
            if (this.state.keys["w"]) this.state.moveDirection.addScaledVector(this.state.forward, 1);
            if (this.state.keys["s"]) this.state.moveDirection.addScaledVector(this.state.forward, -1);
            if (this.state.keys["a"]) this.state.moveDirection.addScaledVector(this.state.right, 1);
            if (this.state.keys["d"]) this.state.moveDirection.addScaledVector(this.state.right, -1);

            if (this.state.physicsWorld && playerBody) {
                // Welle 6.A3 — auf zu steilem Slope (onSteepSlope=true via
                // isPlayerGrounded) wird der Bewegungs-Input auf 20 % gedrosselt.
                // 0 wäre zu hart (gar keine Kontrolle), 1 wäre der heutige Bug
                // (Spieler klettert senkrechte Wände). 0.2 lässt seitliches
                // Rauslenken zu, blockiert aber Voll-Vorwärts-Klettern.
                const slopePenalty = this.state.onSteepSlope ? 0.2 : 1.0;
                if (this.state.moveDirection.length() > 0) {
                    this.state.moveDirection.normalize();
                    playerBody.setLinearVelocity(
                        this.setVec(
                            this.state.tmpVec1,
                            this.state.moveDirection.x * currentSpeed * slopePenalty,
                            playerBody.getLinearVelocity().y(),
                            this.state.moveDirection.z * currentSpeed * slopePenalty
                        )
                    );
                    playerBody.forceActivationState(1);
                } else if (!this.state.onSteepSlope) {
                    // Auf flachem Boden: ohne Eingabe vx + vz auf 0 zwingen
                    // (Standard-Stopp-Verhalten). Auf steilem Hang lassen wir
                    // die existierende Velocity stehen — Gravitation + Slope-
                    // Kontakt erzeugen so eine natürliche Rutsch-Bewegung
                    // (Voraussetzung: Player-Friction 0 aus 6.A1).
                    playerBody.setLinearVelocity(
                        this.setVec(this.state.tmpVec1, 0, playerBody.getLinearVelocity().y(), 0)
                    );
                }

                if (this.state.keys[" "] && !this.state.isJumping) {
                    const isGrounded = this.isPlayerGrounded();
                    const withinCoyoteTime = currentTime - this.state.lastGroundedTime <= this.state.coyoteTime;
                    if (isGrounded || withinCoyoteTime) {
                        const jumpForce = this.state.jumpPower;
                        const currentVelocity = playerBody.getLinearVelocity();
                        playerBody.setLinearVelocity(
                            this.setVec(
                                this.state.tmpVec1,
                                currentVelocity.x(),
                                jumpForce / this.state.scaleFactor,
                                currentVelocity.z()
                            )
                        );
                        this.state.isJumping = true;
                        this.state.isInAir = true;
                        if (currentTime - this.state.lastJumpLog >= this.state.jumpLogInterval) {
                            this.log("Spieler springt!", "INFO");
                            this.state.lastJumpLog = currentTime;
                        }
                    }
                }
            }

            // ### Selbstanalyse + Nexus-Evolution-Trigger ###
            // Früher hing das am TF-Trainings-Tick (`learn()`); nach TF-Cleanup
            // läuft die Zeit-Schwelle direkt. `selfAwarenessAnalyze` macht den
            // FPS-/Tunneling-/Boden-Check, `evolveNexus` queued ein DSL-Programm
            // in den `nexusEvolutionQueue`.
            if (currentTime - this.state.lastSelfAnalysis >= 5.0) {
                this.selfAwarenessAnalyze();
                if (this.state.fps > 0 && this.state.fps < 50 && this.nexus) {
                    this.nexus.processOptimization({ fps: this.state.fps });
                }
                this.journalTick(currentTime);
                // Welle 3 F — Welt-Info nur alle 5 s aktualisieren (gleicher
                // Takt wie selfAwareness; DOM-Cost ist gering aber nicht null).
                this.updateWorldInfo();
            }
            if (this.nexus && currentTime - this.state.nexusLastEvolution >= this.state.nexusEvolutionInterval) {
                this.evolveNexus(currentTime);
            }

            // ### Schicht 1 — IQ-Ticks ###
            // Pfad-Bucket-Sample (alle 2 s), Activity-Sample (jeden Frame, billig),
            // Keyword-Window-Cleanup (60 s Cutoff), pending Outcomes finalisieren
            // (5 s nach Programm-Lauf liest der Finalizer Emotion/Activity-Delta).
            this.samplePathBuckets(currentTime);
            this.samplePlayerActivity(currentTime);
            this.pruneRecentKeywords(currentTime);
            this.finalizePendingOutcomes(currentTime);

            // ### Kreaturen, Wetter, Wachstum ###
            this.updateCreatures(delta);
            this.state.weatherEffectTime += delta;
            if (this.state.weatherEffectTime >= 30.0) {
                this.state.weather = this.state.weather === "sunny" ? "rainy" : "sunny";
                this.updateSkyboxWeather();
                this.updateCreatureEmotions();
                this.log(`Wetter gewechselt zu ${this.state.weather}`, "INFO");
                this.state.weatherEffectTime = 0;
            }

            if (currentTime - this.state.lastGrowthUpdate >= 1.0) {
                this.updateGrowth(); // Fehler behoben
                this.state.lastGrowthUpdate = currentTime;
            }

            // ### Unendliches Terrain – spieler-zentriert ###
            // Statt Map-Mittelpunkt-Extension (die Chunks weit weg vom Spieler
            // entstehen ließ und Lücken hinterließ) füllen wir jetzt einen
            // 5×5-Ring um den Chunk, in dem der Spieler steht. Pro Frame max
            // zwei neue Chunks, damit Frame-Time stabil bleibt.
            const playerPos = this.state.playerMesh.position;
            const { chunkWorldSize: csW } = this._chunkGeometry();
            const playerChunkX = Math.floor((playerPos.x + 150) / csW);
            const playerChunkZ = Math.floor((playerPos.z + 150) / csW);
            let chunksThisFrame = 0;
            const MAX_PER_FRAME = 2;
            const RING_RADIUS = 2;
            outer: for (let r = 0; r <= RING_RADIUS; r++) {
                for (let dz = -r; dz <= r; dz++) {
                    for (let dx = -r; dx <= r; dx++) {
                        // Ring r: nur Zellen am äußeren Rand des Quadrats r.
                        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
                        const cx = playerChunkX + dx;
                        const cz = playerChunkZ + dz;
                        if (this.state.chunkMap.has(`${cx},${cz}`)) continue;
                        this.ensureChunkAt(cx, cz);
                        if (++chunksThisFrame >= MAX_PER_FRAME) break outer;
                    }
                }
            }

            // ### Skybox und Planeten ###
            this.state.skybox.material.uniforms.time.value = currentTime;
            this.state.planets.forEach((planet) => {
                const theta = currentTime / 10;
                const radius = 400;
                planet.position.x = radius * Math.cos(theta);
                planet.position.z = radius * Math.sin(theta);
            });

            // ### Fähigkeiten ###
            Object.keys(this.state.abilities).forEach((ability) => {
                if (this.state.keys[ability]) this.state.abilities[ability](this, this.state);
            });

            // ### Speichern ###
            if (currentTime - this.state.lastSaveUpdate >= this.state.saveInterval) {
                this.saveState();
                this.state.lastSaveUpdate = currentTime;
            }
            if (
                !this.state.isServerSaveInFlight &&
                currentTime - this.state.lastServerSaveUpdate >= this.state.serverSaveInterval
            ) {
                this.state.isServerSaveInFlight = true;
                this.saveToProjectFolder({ fallbackToDownload: false }).finally(() => {
                    this.state.isServerSaveInFlight = false;
                });
                this.state.lastServerSaveUpdate = currentTime;
            }

            // ### Wasserfälle ###
            if (this.state.waterfalls) {
                this.state.waterfalls.forEach((waterfall) => {
                    const positions = waterfall.geometry.attributes.position.array;
                    const velocities = waterfall.geometry.attributes.velocity.array;
                    for (let p = 0; p < positions.length / 3; p++) {
                        positions[p * 3 + 1] += velocities[p * 3 + 1] * delta;
                        if (positions[p * 3 + 1] < waterfall.userData.minY) {
                            positions[p * 3 + 1] = waterfall.userData.baseHeight;
                            positions[p * 3] += (Math.random() - 0.5) * 1;
                            positions[p * 3 + 2] += (Math.random() - 0.5) * 1;
                        }
                    }
                    waterfall.geometry.attributes.position.needsUpdate = true;
                });
            }

            // ### Kamera ###
            if (player && camera) {
                // Spieler-Mesh in Yaw-Richtung drehen, damit die Seele in
                // Bewegungsrichtung schaut — wichtig für asymmetrische Formen
                // (Drache hat lange Z-Achse) und Vorbereitung für V2-Glieder.
                player.rotation.y = this.state.yaw;
                if (this.state.cameraMode === "third") {
                    // Orbit-Kamera hinter + über dem Spieler. Pitch hebt/senkt
                    // die Kamera vertikal; Distance bleibt konstant. Look-At
                    // zielt auf den Brust-Punkt.
                    //
                    // Pitch-Vorzeichen ist gegenüber 1st bewusst invertiert:
                    // im 1st-Modus heißt "nach oben schauen" = Welt nach unten
                    // sehen; im 3rd-Modus erwartet der Spieler aber, dass die
                    // Maus-Richtung mit der Kamera-Bewegung mitgeht (Maus hoch
                    // = Kamera höher um den Charakter herum).
                    const dist = this.state.cameraThirdDistance;
                    const height = this.state.cameraThirdHeight;
                    const cosPitch = Math.cos(this.state.pitch);
                    let camY = player.position.y + height - Math.sin(this.state.pitch) * dist;
                    // Boden-Clamp: Kamera darf nicht unter Spieler-Füße. Ohne
                    // diesen Schutz fährt sie bei steilem Hoch-Schauen durchs
                    // Terrain und der Spieler sieht das Innere der Welt.
                    // Player-Box ist 1×1×1, Center auf player.y, Füße bei
                    // player.y − 0.5; etwas Puffer drüber (0.3) hält die
                    // Kamera sicher über jeder normalen Heightfield-Spitze.
                    const minCamY = player.position.y - 0.2;
                    if (camY < minCamY) camY = minCamY;
                    camera.position.set(
                        player.position.x - Math.sin(this.state.yaw) * dist * cosPitch,
                        camY,
                        player.position.z - Math.cos(this.state.yaw) * dist * cosPitch
                    );
                    camera.lookAt(player.position.x, player.position.y + 1.0, player.position.z);
                } else {
                    camera.position.set(player.position.x, player.position.y + 1.6, player.position.z);
                    camera.lookAt(
                        player.position.x + Math.sin(this.state.yaw),
                        player.position.y + 1.6 + Math.sin(this.state.pitch),
                        player.position.z + Math.cos(this.state.yaw)
                    );
                }
                if (currentTime - this.state.lastCameraLog >= this.state.cameraLogInterval) {
                    this.log(
                        `Kamera: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`,
                        "DEBUG"
                    );
                }
            }

            // Ring 5 V2: Soul-Animation. Glieder/Flügel/Schweif werden
            // jeden Frame über sin/cos relativ zum aktuellen walkPhase
            // rotiert. Idle-Loop (atmen, hover) läuft auch im Stand.
            this.animatePlayerSoul(currentTime);

            // Ring 6 V2: Culling-Tick (1 Hz) — baut/disposed Meshes je nach
            // Spieler-Distanz. Daten-Einträge bleiben immer.
            this.tickArchitectureCulling(currentTime);
            // Ring 6 V2: Bau-Modus — Phantom-Position nachziehen wenn aktiv.
            this.tickBuildMode();
            // Ring 6: Bau-Werke mit Animations-Hook (nur Wasserfälle aktuell).
            this.tickArchitectures(currentTime);

            this.pruneDistantChunks(playerPos);

            // ### Rendering ###
            this.state.renderer.render(this.state.scene, this.state.camera);
        };
        this.state.renderer.setAnimationLoop(loop);
    }

    // ### Hilfsfunktionen ### V7.56
    isPlayerGrounded() {
        if (!this.state.playerBody || !this.state.physicsWorld) return false;

        const rays = [
            { offsetX: 0, offsetZ: 0 },
            { offsetX: 0.45, offsetZ: 0 },
            { offsetX: -0.45, offsetZ: 0 },
            { offsetX: 0, offsetZ: 0.45 },
            { offsetX: 0, offsetZ: -0.45 },
            { offsetX: 0.45, offsetZ: 0.45 },
            { offsetX: -0.45, offsetZ: -0.45 },
            { offsetX: 0.45, offsetZ: -0.45 },
            { offsetX: -0.45, offsetZ: 0.45 },
        ];

        let isGrounded = false;

        // Welle 6.A2 — Erdung auf Strukturen.
        //
        // Bauwerks-Compound-Bodies (state.architectures[].collision) liegen mit
        // mass=0 im Physics-World; rayTest trifft sie wie das Heightfield. Die
        // Schwelle `groundDistance` (vorher fest 0.5) wurde leicht entspannt
        // auf 0.6: ein Spieler, der auf einer Bauwerks-Plattform genau aufsetzt,
        // hat oft eine y-Position knapp über der Sub-Box-Oberseite (Compound-
        // Origin + Sub-Offset + Solver-Resting-Distance), und der Sprung wurde
        // dadurch bei manchen Bauwerken um einen Frame versetzt verweigert.
        const groundDistance = 0.6;

        // Welle 6.A3 — Slope-Steepness. Pro Hit lesen wir die Surface-Normal,
        // tracken die FLACHSTE (höchstes Normal-Y). Wenn keine der getroffenen
        // Flächen einen Normal-Y > maxWalkableSlopeY hat, gilt der Spieler als
        // „auf steilem Hang" — Bewegung wird gedrosselt + Gravity schiebt ab.
        let bestNormalY = 0;

        for (const ray of rays) {
            const rayStart = this.setVec(
                this.state.tmpVec1,
                (this.state.playerMesh.position.x + ray.offsetX) / this.state.scaleFactor,
                (this.state.playerMesh.position.y - 0.5) / this.state.scaleFactor,
                (this.state.playerMesh.position.z + ray.offsetZ) / this.state.scaleFactor
            );
            const rayEnd = this.setVec(
                this.state.tmpVec2,
                (this.state.playerMesh.position.x + ray.offsetX) / this.state.scaleFactor,
                (this.state.playerMesh.position.y - 3.0) / this.state.scaleFactor,
                (this.state.playerMesh.position.z + ray.offsetZ) / this.state.scaleFactor
            );
            const rayCallback = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
            this.state.physicsWorld.rayTest(rayStart, rayEnd, rayCallback);
            if (rayCallback.hasHit()) {
                const hitPoint = rayCallback.get_m_hitPointWorld();
                const hitY = hitPoint.y() * this.state.scaleFactor;
                const distance = Math.abs(hitY - (this.state.playerMesh.position.y - 0.5));
                if (distance < groundDistance) {
                    isGrounded = true;
                    // Normal aufsammeln — flachste (höchstes y) gewinnt: wenn
                    // ein Ray auf eine flache Sub-Fläche trifft (Treppe, kleine
                    // Plattform), zählt der Spieler als „begehbar geerdet".
                    const hitNormal = rayCallback.get_m_hitNormalWorld();
                    const ny = hitNormal.y();
                    if (ny > bestNormalY) bestNormalY = ny;
                }
            }
            Ammo.destroy(rayCallback);
        }

        this.state.groundNormalY = isGrounded ? bestNormalY : 1.0;
        this.state.onSteepSlope = isGrounded && bestNormalY < this.state.maxWalkableSlopeY;

        // Entferne manuelle Korrekturen, da Ammo.btHeightfieldTerrainShape die Kollisionen übernimmt
        return isGrounded;
    }

    getTerrainHeightAt(x, z) {
        const zIndex = Math.floor(((z + 150) / 300) * 255);
        const xIndex = Math.floor(((x + 150) / 300) * 255);
        let height =
            this.state.groundHeightField && zIndex >= 0 && zIndex < 256 && xIndex >= 0 && xIndex < 256
                ? this.state.groundHeightField[
                      Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)
                  ]
                : 0;
        if (height === 0 && this.state.playerMesh) {
            // Fallback: Verwende Raycasting, um die Höhe direkt von der Physik-Kollision zu erhalten
            const rayStart = new Ammo.btVector3(
                x / this.state.scaleFactor,
                100 / this.state.scaleFactor,
                z / this.state.scaleFactor
            );
            const rayEnd = new Ammo.btVector3(
                x / this.state.scaleFactor,
                -100 / this.state.scaleFactor,
                z / this.state.scaleFactor
            );
            const rayCallback = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
            this.state.physicsWorld.rayTest(rayStart, rayEnd, rayCallback);
            if (rayCallback.hasHit()) {
                const hitPoint = rayCallback.get_m_hitPointWorld();
                height = hitPoint.y() * this.state.scaleFactor;
            }
            Ammo.destroy(rayCallback);
            this.log(
                `Terrain-Höhe nicht verfügbar bei (${x.toFixed(2)}, ${z.toFixed(2)}), Raycast-Höhe: ${height.toFixed(2)}`,
                "DEBUG"
            );
        }
        return height;
    }

    calculateTerrainSteepness(x, z) {
        const zIndex = Math.floor(((z + 150) / 300) * 255);
        const xIndex = Math.floor(((x + 150) / 300) * 255);
        if (zIndex <= 0 || zIndex >= 255 || xIndex <= 0 || xIndex >= 255) return 0;
        const height = this.getTerrainHeightAt(x, z);
        const heightRight = this.getTerrainHeightAt(x + 1, z);
        const heightDown = this.getTerrainHeightAt(x, z + 1);
        const dx = Math.abs(height - heightRight);
        const dz = Math.abs(height - heightDown);
        return Math.max(dx, dz);
    }

    // Neue Funktion zum Finden der Oberfläche über der aktuellen Position
    findSurfaceAbove(x, currentY, z) {
        if (!this.state.groundHeightField) {
            this.log("Kein groundHeightField verfügbar – Fallback auf Standardhöhe 0", "ERROR");
            return 0;
        }

        const WIDTH = 256;
        const DEPTH = 256;
        const WORLD_SIZE = 300;
        const xIndex = Math.floor(((x + WORLD_SIZE / 2) / WORLD_SIZE) * (WIDTH - 1));
        const zIndex = Math.floor(((z + WORLD_SIZE / 2) / WORLD_SIZE) * (DEPTH - 1));

        // Sicherstellen, dass die Indizes im gültigen Bereich liegen
        const clampedX = Math.max(0, Math.min(WIDTH - 1, xIndex));
        const clampedZ = Math.max(0, Math.min(DEPTH - 1, zIndex));
        const terrainHeight = this.state.groundHeightField[clampedZ * WIDTH + clampedX];

        // Wenn die aktuelle Höhe bereits über dem Terrain liegt, zurück zur Terrainoberfläche
        if (currentY >= terrainHeight) {
            return terrainHeight;
        }

        // Annahme: Wir suchen die nächste Oberfläche über dem Spieler
        // Da dein Terrain nur eine Höhe pro (x, z) hat, ist die Terrainoberfläche die einzige "Oberfläche"
        // Für komplexere Welten (z. B. mit Höhlen) müssten wir zusätzliche Logik hinzufügen
        let surfaceHeight = terrainHeight;

        // Prüfen, ob fliegende Inseln über dem Spieler liegen
        if (this.state.floatingIslands && this.state.floatingIslands.length > 0) {
            for (const island of this.state.floatingIslands) {
                const islandPos = island.position;
                const islandSize = island.geometry.parameters?.width || 20; // Annahme: Inselgröße
                const islandBottom = islandPos.y - (island.geometry.parameters?.height || 5) / 2;

                // Prüfen, ob die Insel über dem Spieler liegt und näher als das Terrain ist
                if (
                    Math.abs(islandPos.x - x) < islandSize / 2 &&
                    Math.abs(islandPos.z - z) < islandSize / 2 &&
                    islandBottom > currentY &&
                    islandBottom < surfaceHeight
                ) {
                    surfaceHeight = islandBottom;
                }
            }
        }

        return surfaceHeight;
    }

    updateWallCollisions() {
        // No-op: Mit per-Chunk btHeightfieldTerrainShape (jetzt einheitlich für
        // initial + extension) deckt die Heightfield-Physik die Wand-Kollisionen
        // bereits zuverlässig ab. Das alte addWallCollisions las das globale
        // 256×256-Heightfield, das nicht mehr existiert. Wird in einem späteren
        // Cleanup ganz entfernt.
    }

    updateGrowth() {
        // ### Wachstum aktualisieren ###
        // Zweck: Dynamisches Wachstum von Kreaturen oder Terrain
        // Learnings: Fehlte in V7.61, hinzugefügt für V7.66 zur Vollständigkeit
        if (this.state.creatures.length > 0) {
            this.state.creatures.forEach((creature, index) => {
                if (Math.random() < 0.05) {
                    // 5% Chance pro Frame
                    creature.scale.multiplyScalar(1.01); // Leichtes Wachstum
                    this.log(`Kreatur ${index} wächst: Skala ${creature.scale.x.toFixed(2)}`, "DEBUG");
                }
            });
        }
        this.log("Wachstum aktualisiert", "DEBUG");
    }

    addWallCollisions(heightData, width, depth, scaleX, scaleZ, chunkX, chunkZ, maxBoxes) {
        const WORLD_SIZE = 300;
        const steepnessThreshold = 2.0; // Erhöhe Schwellenwert, um weniger Boxen zu generieren
        // chunkData.heightData speichert die globale 256×256-Heightmap, nicht
        // nur den Chunk-Ausschnitt. Vor diesem Fix iterierte die Schleife über
        // alle 256×256 Zellen und addierte zusätzlich einen chunkX-Offset zu
        // worldX – Folge: pinke Kollisionsboxen schwebten quer durch die Welt
        // und überlagerten sich pro Chunk. Jetzt nur den eigenen Chunk-Bereich
        // scannen und worldX/Z direkt aus dem globalen Index berechnen.
        const chunkSize = this.state.chunkSize;
        const startX = chunkX * chunkSize;
        const startZ = chunkZ * chunkSize;
        const endX = Math.min(startX + chunkSize, width - 1);
        const endZ = Math.min(startZ + chunkSize, depth - 1);
        let addedBoxes = 0;

        for (let z = startZ; z < endZ && addedBoxes < maxBoxes; z++) {
            for (let x = startX; x < endX && addedBoxes < maxBoxes; x++) {
                const idx = z * width + x;
                const worldX = (x / (width - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const worldZ = (z / (depth - 1)) * WORLD_SIZE - WORLD_SIZE / 2;
                const height = heightData[idx];
                const heightRight = heightData[idx + 1];
                const heightDown = heightData[(z + 1) * width + x];
                const dx = Math.abs(height - heightRight);
                const dz = Math.abs(height - heightDown);
                const steepness = Math.max(dx, dz);

                if (steepness > steepnessThreshold) {
                    const boxHeight = Math.max(dx, dz, 2.0);
                    const boxGeometry = new THREE.BoxGeometry(scaleX, boxHeight, scaleZ);
                    const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true });
                    const box = new THREE.Mesh(boxGeometry, boxMaterial);
                    box.position.set(worldX, height + boxHeight / 2, worldZ);
                    box.visible = true;

                    const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(scaleX / 2, boxHeight / 2, scaleZ / 2));
                    const transform = new Ammo.btTransform();
                    transform.setIdentity();
                    transform.setOrigin(
                        new Ammo.btVector3(
                            worldX / this.state.scaleFactor,
                            (height + boxHeight / 2) / this.state.scaleFactor,
                            worldZ / this.state.scaleFactor
                        )
                    );
                    const motionState = new Ammo.btDefaultMotionState(transform);
                    const localInertia = new Ammo.btVector3(0, 0, 0);
                    const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, boxShape, localInertia);
                    const body = new Ammo.btRigidBody(rbInfo);
                    this.state.physicsWorld.addRigidBody(body);
                    box.userData.physicsBody = body;
                    this.state.rigidBodies.push(box);
                    this.state.wallBoxes.push(box);
                    this.state.scene.add(box);
                    addedBoxes++;
                }
            }
        }

        this.log(`Chunk (${chunkX}, ${chunkZ}): ${addedBoxes} Kollisionsboxen hinzugefügt`, "DEBUG");
        return addedBoxes;
    }
}
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
AnazhRealm.STAT_FROM_TAGS = Object.freeze({
    hpMax: (t) => 50 + (t.dichte || 0) * 60 + (t.härte || 0) * 30,
    damage: (t) => 5 + (t.härte || 0) * 15 + (t.dichte || 0) * 5,
    speed: (t) => 4 + (1 - (t.dichte || 0)) * 4 + (t.magieleitung || 0) * 1,
    jumpPower: (t) => 8 + (1 - (t.dichte || 0)) * 5 + (t.magieleitung || 0) * 2,
    staminaMax: (t) => 100 + (1 - (t.dichte || 0)) * 60 + (t.wärmeleitung || 0) * 40,
    precision: (t) => 0.5 + (t.magieleitung || 0) * 0.3 + (t.zähigkeit || 0) * 0.2,
    magicResist: (t) => (t.magieleitung || 0) * 0.4 + (t.resoniert || 0) * 0.3,
    heatResist: (t) => (t.wärmeleitung || 0) * 0.5 - (t.brennbar || 0) * 0.3,
});

AnazhRealm.MATERIAL_TAG_KEYS = Object.freeze([
    "härte",
    "dichte",
    "zähigkeit",
    "wärmeleitung",
    "stromleitung",
    "magieleitung",
    "transparent",
    "brennbar",
    "resoniert",
    "lebendig",
]);
AnazhRealm.MATERIAL_TAG_DEFAULTS = Object.freeze(
    AnazhRealm.MATERIAL_TAG_KEYS.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
    }, {})
);
// Welle 5 B — räumliche Emergenz. Welche Formen wirken als „Spitzen" (Prinzip
// 1: Spitze richtet). Helix ist drin, weil ihr Ende eine Schraubspitze ist —
// nicht so scharf wie ein Kegel, aber funktional gerichtet.
AnazhRealm.SPATIAL_POINTED_SHAPES = Object.freeze(new Set(["cone", "pyramid", "octahedron", "helix"]));
// Welche Tags fließen über Kontakt (Prinzip 4: Kontakt überträgt). Konzept
// §5.2 nennt Wärme, Strom, Magie, Schwingung — entsprechen vier von zehn
// MATERIAL_TAG_KEYS. „Lebendig" überträgt sich nicht (Leben ist nicht
// kontagiös in dieser Welt-Logik), „brennbar" auch nicht (das wäre Feuer-
// Ausbreitung — eigener Pfad, falls je nötig).
AnazhRealm.SPATIAL_TRANSFERABLE_TAGS = Object.freeze(["wärmeleitung", "stromleitung", "magieleitung", "resoniert"]);
// Welche Formen bilden einen Hohlraum (Prinzip 2: Hohlraum enthält). Sphere
// (Glocke, Kristallkugel) und Torus (Ring, Singing Bowl) sind die zwei
// natürlichen Container — beide haben ein klares Innen-vs-Außen.
AnazhRealm.SPATIAL_HOLLOW_SHAPES = Object.freeze(new Set(["sphere", "torus"]));
// Compound-Bonus-Faktoren (Phase 2): multiplikativ auf die aggregierten
// Compound-Tags nach Standard-MAX. Konservativ kalibriert — der größere
// Effekt entsteht aus der Kombination (eine Glocke ist nicht nur sphere
// mit Hohlraum-Bonus, sondern sphere am Top mit Tip-Bonus, mit Klöppel im
// Hohlraum, und einer Resonanz-Array von 4 Glocken im Kreis).
AnazhRealm.SPATIAL_HOLLOW_BONUS = 0.3; // +30 % auf resoniert für beide Parts
AnazhRealm.SPATIAL_AXIS_BONUS = 0.3; // +30 % auf magieleitung + stromleitung
AnazhRealm.SPATIAL_ARRAY_BONUS = 0.4; // +40 % auf resoniert + magieleitung
// Welle 5 A — Verbindungstypen aus Konzept §5.1. Acht Typen, jeder mit
// `typeStrength` (Basis-Belastbarkeit 0..1), `strongTags` (welche Material-
// Eigenschaften die Verbindung tragen — Hafting will härte+dichte, Lashing
// will zähigkeit). Final-Strength einer Verbindung in einem Compound:
//   strength = typeStrength × avg(strongTags von Material A + B) × min(1, kontaktfläche)
// Liefert Wert 0..3-Skala wie die Tag-Strahler. Schwelle für „solide" liegt
// bei ~0.7; darunter ist die Verbindung sichtbar fragil.
AnazhRealm.CONNECTION_TYPES = Object.freeze({
    hafting: Object.freeze({
        label: "Hafting",
        description: "Stiel in Loch — Reibschluss",
        strongTags: Object.freeze(["härte", "dichte"]),
        typeStrength: 0.8,
    }),
    lashing: Object.freeze({
        label: "Lashing",
        description: "Umwicklung — Zugfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.6,
    }),
    pinning: Object.freeze({
        label: "Pinning",
        description: "Stift durch Loch — Scherung",
        strongTags: Object.freeze(["härte"]),
        typeStrength: 0.75,
    }),
    welding: Object.freeze({
        label: "Schweißen",
        description: "Atomar verschmolzen",
        strongTags: Object.freeze(["härte", "wärmeleitung"]),
        typeStrength: 0.95,
    }),
    gluing: Object.freeze({
        label: "Kleben",
        description: "Adhäsion — Schubfest",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.55,
    }),
    masonry: Object.freeze({
        label: "Mauern",
        description: "Druckschluss + Mörtel",
        strongTags: Object.freeze(["dichte"]),
        typeStrength: 0.7,
    }),
    sewing: Object.freeze({
        label: "Nähen",
        description: "Garn durch Material",
        strongTags: Object.freeze(["zähigkeit"]),
        typeStrength: 0.5,
    }),
    magic_bind: Object.freeze({
        label: "Magisch",
        description: "Tag-Resonanz",
        strongTags: Object.freeze(["magieleitung", "resoniert"]),
        typeStrength: 0.85,
    }),
});
AnazhRealm.CONNECTION_MAX_PER_BLUEPRINT = 64;
AnazhRealm.CONNECTION_SOLID_THRESHOLD = 0.7;
// Welle 5 C — Maschinen-Rekursivität. Vier Op-Klassen aus Konzept §3.1,
// als Whitelist für eigene Tool-Baupläne. Spieler kann nur diese vier
// vergeben — sonst kollidieren neue Op-Klassen mit MATERIAL_OP_COMPATIBILITY.
AnazhRealm.TOOL_OP_CLASSES = Object.freeze(new Set(["subtractive", "plastic", "additive", "phaseChange"]));
// Op-Name-Whitelist (a-z, -_, max 24 Zeichen) — verhindert injection in
// state.tools-Keys. Pure Sanitisierung, keine semantische Wertung.
AnazhRealm.TOOL_OP_NAME_PATTERN = /^[a-z0-9_-]{1,24}$/;
// Welle 4 Phase 3 — Material × Op-Klassen-Kompatibilität aus Konzept §3.2.
// Bei eigenen Materialien (define_material) wird das via applyOpToPart als
// „alle vier erlaubt" behandelt — UI/UX-Verfeinerung folgt in einer
// Späten Phase.
AnazhRealm.MATERIAL_OP_COMPATIBILITY = Object.freeze({
    stein: Object.freeze(["subtractive"]),
    holz: Object.freeze(["subtractive", "additive"]),
    eisen: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    bronze: Object.freeze(["subtractive", "plastic", "additive", "phaseChange"]),
    quarz: Object.freeze(["subtractive", "phaseChange"]),
    leder: Object.freeze(["subtractive", "plastic", "additive"]),
});
// Welt-Effekt-Schwellen: zentralisiert, damit Tuning ohne Code-Suche geht.
// Werte aus Konzept §6.3 (≥0.7 mild, ≥1.5 stark, ≥2.5 signatur).
AnazhRealm.WORLD_EFFECT_THRESHOLDS = Object.freeze({
    resonance_mild: 0.7,
    resonance_strong: 1.5,
    resonance_signature: 2.5,
    magic_strong: 1.5,
    precision_high: 0.8,
});
// Ring 10.5: harter Cap auf Ops pro Chunk-Delta. Ohne den würde ein
// Spieler, der 1000-mal denselben Hügel hebt, den Save unbegrenzt
// aufblähen. Beim Erreichen wird der älteste Op verworfen (FIFO).
AnazhRealm.CHUNK_DELTA_OPS_CAP = 100;
// Welle 4 Phase 2 — Form-Tag-Aktivierungs-Matrix (v2 aus docs).
// Werte 0..3: 0 = Form schließt das Tag aus, 1 = schwach, 2 = stark,
// 3 = Signatur. Aktivierte Tag-Stärke = MATRIX × Material-Tag (0..1),
// finaler Bereich pro Part: 0..3.
AnazhRealm.FORM_TAG_ACTIVATION = Object.freeze({
    box: Object.freeze({
        härte: 1,
        dichte: 3,
        zähigkeit: 1,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 0,
        transparent: 1,
        brennbar: 1,
        resoniert: 0,
        lebendig: 0,
    }),
    sphere: Object.freeze({
        härte: 0,
        dichte: 3,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 2,
        transparent: 3,
        brennbar: 0,
        resoniert: 3,
        lebendig: 1,
    }),
    cylinder: Object.freeze({
        härte: 1,
        dichte: 2,
        zähigkeit: 2,
        wärmeleitung: 3,
        stromleitung: 3,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 2,
        lebendig: 2,
    }),
    cone: Object.freeze({
        härte: 3,
        dichte: 1,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 2,
        transparent: 2,
        brennbar: 1,
        resoniert: 1,
        lebendig: 0,
    }),
    pyramid: Object.freeze({
        härte: 2,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 1,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 2,
        lebendig: 0,
    }),
    octahedron: Object.freeze({
        härte: 3,
        dichte: 2,
        zähigkeit: 0,
        wärmeleitung: 2,
        stromleitung: 1,
        magieleitung: 3,
        transparent: 3,
        brennbar: 0,
        resoniert: 2,
        lebendig: 0,
    }),
    plane: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 2,
        magieleitung: 1,
        transparent: 3,
        brennbar: 3,
        resoniert: 2,
        lebendig: 2,
    }),
    torus: Object.freeze({
        härte: 1,
        dichte: 1,
        zähigkeit: 2,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 1,
        brennbar: 1,
        resoniert: 3,
        lebendig: 1,
    }),
    helix: Object.freeze({
        härte: 0,
        dichte: 0,
        zähigkeit: 3,
        wärmeleitung: 2,
        stromleitung: 3,
        magieleitung: 3,
        transparent: 0,
        brennbar: 2,
        resoniert: 2,
        lebendig: 2,
    }),
});
const anazhRealm = new AnazhRealm();
// Globale Referenz für DevTools-Debug und automatisierten Playtest.
if (typeof window !== "undefined") window.anazhRealm = anazhRealm;
anazhRealm.init();

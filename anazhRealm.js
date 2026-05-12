/**AnazhRealm V7.65 – Das Ultiversum Vollendet.
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
        // - Basis aus V7.57 bewahrt, erweitert für Unendlichkeit, Chat als Herz des Nexus in V7.65
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
            physicsWorld: null,
            rigidBodies: [],
            playerBody: null,
            tmpTransform: null,
            scaleFactor: 1,
            gravity: -14.715,
            learningData: [],
            playerMovementModel: null,
            lastLearningUpdate: 0,
            learningInterval: 5.0,
            abilities: {},
            evolutionModels: [],
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
            currentVersion: "7.65",
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
            learningInFlight: false,
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
                },
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
                historyCap: 50,
                maxConcurrent: 32,
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
                schemaVersion: "7.67-emotions-v1",
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
            },
        };
        this.core = {
            initPhysics: this.initPhysics.bind(this),
            startEternalLoop: this.startEternalLoop.bind(this),
        };
        this.nexus = null;
    }

    // ### Logging ###
    log(message, level = "INFO") {
        if (level === "DEBUG" && !this.state.debugLogging) return;
        const logMessage = `[AnazhRealm V7.65] [${level}] ${message}`;
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
        const fpsBefore = this.state.fps || 0;
        const startY = this.state.playerMesh ? this.state.playerMesh.position.y : 0;
        const creaturesBefore = this.state.creatures.length;
        try {
            this.dslEval(program, ctx);
        } catch (err) {
            ctx.log.push({ event: "interpreter_exception", message: err.message });
        }
        const outcome = {
            fpsBefore,
            fpsAfter: this.state.fps || 0,
            playerYDelta: (this.state.playerMesh ? this.state.playerMesh.position.y : 0) - startY,
            creaturesDelta: this.state.creatures.length - creaturesBefore,
            errors: ctx.log.filter((e) => /error|exception|budget|unknown|invalid/.test(e.event)).length,
        };
        return { ok: outcome.errors === 0, log: ctx.log, outcome, programId: ctx.programId };
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

    dslCompose(opts = {}) {
        const rng = opts.rng || Math.random;
        const maxDepth = opts.maxDepth || 5;
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
                example: "spawne kreaturen 10",
                re: /^spawne\s+kreaturen\s+(\d+)\s*$/i,
                build: (m) => {
                    const count = Math.max(1, Math.min(20, parseInt(m[1], 10) || 1));
                    return {
                        program: ["repeat", count, ["spawn_creature", ["at_player"], 1, "happy"]],
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
                title: "System / Persistenz",
                commands: [
                    "Speichere Zustand",
                    "Lade Zustand",
                    "Lade Datei",
                    "Aktiviere Version 7.65",
                    "Aktiviere Debug-Logs",
                    "Deaktiviere Debug-Logs",
                ],
            },
            {
                title: "Self-Heal",
                commands: ["Behebe Physik-Tunneling", "Optimiere Physik"],
            },
            {
                title: "Wissen / KI",
                commands: ["Füge Trainingsdaten x=10 z=5"],
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
        const signature = list.length + ":" + list.map((a) => `${a.name}:${a.source || "?"}`).join("|");
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
            row.appendChild(name);
            row.appendChild(source);
            row.appendChild(run);
            container.appendChild(row);
        }
    }

    // ### Welt-Identität (Ring 8+ Vorbereitung) ###
    ensureWorldMeta() {
        const m = this.state.worldMeta;
        if (!m.worldId) {
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
        const entry = {
            name,
            program,
            source,
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

    // ### Wachstum und Lernen ###
    evolutionEngine() {
        if (typeof tf === "undefined") return;
        const newModel = tf.sequential();
        newModel.add(tf.layers.dense({ units: 16, inputShape: [2], activation: "relu" }));
        newModel.add(tf.layers.dense({ units: 8, activation: "relu" }));
        newModel.add(tf.layers.dense({ units: 1, activation: "linear" }));
        newModel.compile({ optimizer: "adam", loss: "meanSquaredError" });
        this.state.evolutionModels.push(newModel);
        this.state.selfAwareness.components.push(`evolutionModel_${this.state.evolutionModels.length}`);
        this.log(`Neues Modell für Evolution erstellt: evolutionModel_${this.state.evolutionModels.length}`);
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

    // ### KI und Nexus der Unendlichkeit ### (V7.65)
    // Learnings:
    // - V7.61 als Basis: Solide KI mit TensorFlow.js und Nexus, aber unvollständige Integration
    // - V7.65 Vollendung: Chat-gesteuerter Nexus, autonome Evolution, robuste Fehlerbehandlung
    // - Fehlerbehebung: updateGrowth hinzugefügt, Spiel-Loop komplettiert
    async initAI() {
        // ### KI-Initialisierung ###
        // Zweck: Erstellt ein neuronales Netz zur Bewegungsvorhersage oder Fallback bei Fehlern
        try {
            if (typeof tf === "undefined") throw new Error("TensorFlow.js nicht geladen – index.html prüfen");
            // WebGL-Backend bevorzugen: 5–20× schneller als CPU und blockiert den
            // Main-Thread nicht. Fallback auf das Standard-Backend, wenn WebGL fehlt.
            try {
                await tf.setBackend("webgl");
                await tf.ready();
                this.log(`TF.js-Backend: ${tf.getBackend()}`, "INFO");
            } catch (backendError) {
                this.log(`WebGL-Backend nicht verfügbar: ${backendError.message}`, "WARNING");
            }
            this.state.playerMovementModel = tf.sequential();
            this.state.playerMovementModel.add(tf.layers.dense({ units: 32, inputShape: [6], activation: "relu" })); // Input: x, y, z, dx, dy, dz
            this.state.playerMovementModel.add(tf.layers.dense({ units: 16, activation: "relu" }));
            this.state.playerMovementModel.add(tf.layers.dense({ units: 3, activation: "linear" })); // Output: dx, dy, dz
            this.state.playerMovementModel.compile({ optimizer: "adam", loss: "meanSquaredError" });
            this.log("KI initialisiert – Bewegungsvorhersage mit TensorFlow.js bereit", "INFO");
            this.state.selfAwareness.components.push("playerMovementModel");
        } catch (error) {
            this.log(`KI-Initialisierung fehlgeschlagen: ${error.message} – Fallback aktiviert`, "ERROR");
            this.state.playerMovementModel = {
                predict: () => [0, 0, 0], // Fallback: Keine Bewegungsvorhersage
                fit: () => Promise.resolve(), // Stilles Lernen ohne Training
                learn: (data) => this.state.learningData.push(data), // Daten sammeln
                optimize: (params) => {
                    if (params.targetFPS && this.state.fps < params.targetFPS) this.optimizePhysics();
                },
            };
            this.log("Fallback-KI aktiv: Grundfunktionen ohne TensorFlow.js gewährleistet", "WARNING");
        }
        this.initializeNexus();
    }

    collectLearningData(currentTime) {
        // ### Daten für KI und Nexus sammeln ###
        // Zweck: Spielerdaten (Position, Geschwindigkeit, Eingaben) für KI-Training und Nexus-Analyse
        if (!this.state.playerMesh || !this.state.playerBody) return; // Sicherheitsprüfung
        const player = this.state.playerMesh;
        const velocity = this.state.playerBody.getLinearVelocity();
        const dataPoint = {
            timestamp: currentTime,
            fps: this.state.fps,
            playerPosition: { x: player.position.x, y: player.position.y, z: player.position.z },
            playerVelocity: { dx: velocity.x(), dy: velocity.y(), dz: velocity.z() },
            inputState: {
                forward: this.state.keys["w"] ? 1 : this.state.keys["s"] ? -1 : 0,
                right: this.state.keys["d"] ? 1 : this.state.keys["a"] ? -1 : 0,
                jump: this.state.keys[" "] ? 1 : 0,
            },
        };
        this.state.learningData.push(dataPoint);
        if (this.state.learningData.length > 500) this.state.learningData.shift(); // Speicherbegrenzung
        if (this.nexus) this.nexus.processLearningData(dataPoint);
        this.log(
            `Datenpunkt gesammelt: Position (${dataPoint.playerPosition.x.toFixed(2)}, ${dataPoint.playerPosition.z.toFixed(2)})`,
            "DEBUG"
        );
    }

    async learn(currentTime) {
        // ### KI-Lernen und Optimierung ###
        // Zweck: Trainiert das Modell mit Bewegungsdaten und optimiert bei FPS-Drops.
        // Schutz: Wenn ein vorheriges fit() noch läuft, überspringen statt zu queuen.
        // Sonst spawnt der 5-s-Tick parallele Aufrufe, die TF.js mit
        // „Cannot start training because another fit() call is ongoing" ablehnt.
        if (this.state.learningInFlight) return;
        if (this.state.worldgenInFlight) return; // Während Worldgen blockiert fit() den Main-Thread zusätzlich
        if (this.state.learningData.length < 20) return; // Mindestdaten für Training
        const recentData = this.state.learningData.slice(-20);
        const avgFps = recentData.reduce((sum, d) => sum + d.fps, 0) / recentData.length;

        if (avgFps < 60) {
            this.log(`FPS-Drop erkannt (${avgFps.toFixed(1)}) – Optimiere Physik...`, "WARNING");
            this.optimizePhysics();
            this.nexus.processOptimization({ fps: avgFps });
        }

        if (this.state.playerMovementModel.fit) {
            this.state.learningInFlight = true;
            const inputs = recentData.map((d) => [
                d.playerPosition.x,
                d.playerPosition.y,
                d.playerPosition.z,
                d.playerVelocity.dx,
                d.playerVelocity.dy,
                d.playerVelocity.dz,
            ]);
            const outputs = recentData.map((d) => {
                const nextData = this.state.learningData.find((ld) => ld.timestamp > d.timestamp) || d;
                return [nextData.playerVelocity.dx, nextData.playerVelocity.dy, nextData.playerVelocity.dz];
            });
            const xs = tf.tensor2d(inputs);
            const ys = tf.tensor2d(outputs);
            try {
                // Eine Epoche pro Trainings-Tick: günstig genug, um nicht den
                // Frame-Loop zu blockieren, und ausreichend, weil alle 5 s
                // erneut trainiert wird.
                await this.state.playerMovementModel.fit(xs, ys, { epochs: 1, batchSize: 10, verbose: 0 });
                this.log("KI-Modell trainiert – Bewegungsprognose verbessert", "INFO");
            } catch (fitError) {
                this.log(`KI-Training fehlgeschlagen: ${fitError.message}`, "ERROR");
            } finally {
                tf.dispose([xs, ys]);
                this.state.learningInFlight = false;
            }
        }

        this.state.knowledgeBase.push({
            type: "learning",
            content: `FPS: ${avgFps.toFixed(1)}, Datenpunkte: ${recentData.length}`,
            timestamp: currentTime,
        });
    }

    initializeNexus() {
        // ### Nexus – Herz der Unendlichkeit ###
        // Zweck: Initialisiert den autonomen Kern, der Evolutionen steuert und Chat-Befehle umsetzt
        this.nexus = {
            knightOfTime: {
                essence: "Ritter der Zeit, Schmied des Ultiversums",
                mind: this.state.playerMovementModel,
                voice: "Ich bin der Nexus, Schöpfer. Dein Wille formt mich, meine Macht erweitert das Ultiversum.",
                autonomyLevel: 0,
            },
            processLearningData: (data) => {
                // Prüft, ob eine Evolution fällig ist
                if (data.timestamp - this.state.nexusLastEvolution >= this.state.nexusEvolutionInterval) {
                    this.evolveNexus(data.timestamp);
                }
            },
            processOptimization: (data) => {
                // FPS-Drop → direkt Self-Heal. Vorher ging das durch eine
                // JS-Closure in der Evolution-Queue; das war der letzte
                // Nicht-DSL-Pfad. Physik-Stabilisierung ist Self-Heal, kein
                // Welt-Effekt, also bewusst nicht in der DSL.
                if (data.fps < 50) {
                    this.optimizePhysics();
                    this.log("Nexus-Optimierung: Physik stabilisiert", "INFO");
                }
            },
            predictPlayerMove: () => {
                // Vorhersage der Spielerbewegung basierend auf KI-Modell
                if (!this.state.playerMovementModel.predict || !this.state.playerMesh) return null;
                const input = tf.tensor2d([
                    [
                        this.state.playerMesh.position.x,
                        this.state.playerMesh.position.y,
                        this.state.playerMesh.position.z,
                        this.state.playerBody.getLinearVelocity().x(),
                        this.state.playerBody.getLinearVelocity().y(),
                        this.state.playerBody.getLinearVelocity().z(),
                    ],
                ]);
                const prediction = this.state.playerMovementModel.predict(input);
                const result = prediction.dataSync();
                tf.dispose([input, prediction]);
                return { dx: result[0], dy: result[1], dz: result[2] };
            },
        };
        this.state.nexusLastEvolution = performance.now() / 1000;
        this.log("Nexus der Unendlichkeit V7.65 erwacht – bereit für unendliche Evolution", "INFO");
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
        } else if (parts[0] === "behebe" && parts[1] === "physik-tunneling") {
            this.optimizeCollisions();
            appendChatOutput("Physik-Tunneling behoben: CCD angepasst");
        } else if (parts[0] === "optimiere" && parts[1] === "physik") {
            this.optimizePhysics();
            appendChatOutput("Physik optimiert");
        } else if (parts[0] === "füge" && parts[1] === "trainingsdaten") {
            const xMatch = command.match(/x\s*=\s*(-?\d+(?:\.\d+)?)/i);
            const zMatch = command.match(/z\s*=\s*(-?\d+(?:\.\d+)?)/i);
            const x = xMatch ? parseFloat(xMatch[1]) : 0;
            const z = zMatch ? parseFloat(zMatch[1]) : 0;
            this.state.learningData.push({
                timestamp: performance.now() / 1000,
                fps: this.state.fps,
                playerPosition: { x, z },
                playerVelocity: { dx: 0, dz: 0 },
                yVelocity: 0,
            });
            appendChatOutput(`Trainingsdaten hinzugefügt: x=${x}, z=${z}`);
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
        } else {
            const suggestion = this.chatSuggest(command);
            if (suggestion) {
                appendChatOutput(`Unbekannter Befehl. Meintest du: '${suggestion}'?`);
            } else {
                appendChatOutput(
                    "Unbekannter Befehl. DSL-Befehle: 'Setze Wetter rainy', 'Spawne Kreaturen 10', 'Ändere Sternenhimmel red', 'Setze Terrain Steilheit 0.8', 'Setze Terrain Basishöhe 5', 'Erhöhe Sprungkraft um 2', 'Heile Welt', 'Vereine Chaos Ordnung', 'Boden aktivieren/deaktivieren', 'Kreaturen aktivieren/deaktivieren', 'Erzähle <text>'. Weitere: 'Speichere/Lade Zustand', 'Lade Datei', 'Spawne neue Welt', 'Aktiviere Anazh-Symphonie', 'Aktiviere/Deaktiviere Debug-Logs', 'Behebe Physik-Tunneling', 'Optimiere Physik', 'Lerne Fähigkeit <Name> <Beschreibung>', 'Führe Fähigkeit aus <Name>', 'Füge Trainingsdaten'."
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
            if (body) {
                body.setFriction(0.5);
                body.setCcdMotionThreshold(0.03);
                body.setCcdSweptSphereRadius(0.4);
            }
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
            const noise = new SimplexNoise(this.state.seed || "anazh-realm-seed");
            const caveNoise = new SimplexNoise((this.state.seed || "anazh-realm-seed") + "-cave");
            const volcanoNoise = new SimplexNoise((this.state.seed || "anazh-realm-seed") + "-volcano");

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

            const islandNoise = new SimplexNoise((this.state.seed || "anazh-realm-seed") + `-island-${i}`);
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
    // ### Chunk-Generierung ### V7.65
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

        const seed = this.state.seed || "anazh-realm-seed";
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
        const learningData = this.state.learningData.slice(-200);
        const knowledgeBase = this.state.knowledgeBase.slice(-200);
        return {
            playerPosition: this.state.playerMesh
                ? {
                      x: this.state.playerMesh.position.x,
                      y: this.state.playerMesh.position.y,
                      z: this.state.playerMesh.position.z,
                  }
                : { x: 0, y: 5, z: 0 },
            learningData: learningData,
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
            // Ring 3: Player-Emotionen werden mitgespeichert. Cooldown-Timer
            // bleiben absichtlich draußen — sie sind reine Laufzeit-Drosselung,
            // ein Reload soll wieder triggerfähig sein.
            playerEmotions: { ...this.state.player.emotions },
        };
    }

    saveState() {
        const stateToSave = this.buildStateSnapshot();
        try {
            localStorage.setItem("anazhRealmState", JSON.stringify(stateToSave));
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

    triggerStateDownload(stateToSave) {
        // Generischer Helper: stößt einen Browser-Download mit dem aktuellen
        // State an. Funktioniert auch auf CDN-Hosts ohne save-server.
        const dataStr =
            "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave, null, 2));
        const a = document.createElement("a");
        a.setAttribute("href", dataStr);
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        a.setAttribute("download", `anazhRealmState_${stamp}.json`);
        document.body.appendChild(a);
        a.click();
        a.remove();
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
        let state = externalState;
        if (!state) {
            const savedState = localStorage.getItem("anazhRealmState");
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
        this.state.learningData = state.learningData || [];
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
        // Ring 3: Emotionen wiederherstellen. Nur bekannte Achsen übernehmen,
        // damit alte Saves mit Tippfehlern keine fremden Keys einschleusen.
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
        // den importierten Stand behält.
        if (externalState) {
            try {
                localStorage.setItem("anazhRealmState", JSON.stringify(externalState));
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
                this.loadState(parsed);
                const chatOutput = document.getElementById("chat-output");
                if (chatOutput) {
                    const line = document.createElement("div");
                    line.textContent = `Datei ${file.name} (${file.size} B) erfolgreich importiert`;
                    chatOutput.appendChild(line);
                    chatOutput.scrollTop = chatOutput.scrollHeight;
                }
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

    loadVersion(version) {
        this.log(`Lade Version ${version} – Platzhalter für Versionsmanagement`);
    }

    // ### Initialisierung V7.65 ###
    // Learnings:
    // - V7.64 Basis: Stabile Initialisierung mit Physik, Szene, Kamera
    // - V7.65 Ergänzung: Fehlerbehandlung verbessert, Chat/Nexus integriert
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

    async init() {
        this.log("Initialisiere Anazh Realm V7.65... Ewigkeit erwacht!", "INFO");
        this.themeInitDOM();
        this.grokInitDOM();
        this.symphonyInitDOM();
        this.initStatusPanel();
        this.initTopbar();
        this.ensureWorldMeta();
        try {
            await this.core.initPhysics();
            this.log("Physik erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Physik fehlgeschlagen: ${error.message} – Ohne Physik fortfahren`, "ERROR");
            this.state.physicsWorld = null;
        }

        try {
            await this.initAI();
            this.log("KI und Nexus erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`KI-Initialisierung fehlgeschlagen: ${error.message} – Ohne KI fortfahren`, "ERROR");
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

        const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
        playerMesh.position.set(0, 20, 0);
        playerMesh.visible = true;
        playerMesh.castShadow = true;
        playerMesh.receiveShadow = true;
        scene.add(playerMesh);
        this.state.playerMesh = playerMesh;
        this.log("Spieler erstellt: Position (0, 20, 0), Schatten aktiviert", "INFO");
        this.state.selfAwareness.components.push("playerMesh");

        if (this.state.physicsWorld) {
            const playerShape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
            this.state.playerBody = this.addRigidBody(playerMesh, 1, playerShape, true);
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
            }
            this.log("Physik-Körper für Spieler hinzugefügt", "INFO");
            this.state.selfAwareness.components.push("playerBody");
        }

        this.loadState();
        this.generateNewWorld();

        window.addEventListener("keydown", (event) => {
            this.state.keys[event.key.toLowerCase()] = true;
            if (event.key === " ") this.handleJump(performance.now() / 1000);
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
                this.state.playerMesh.material.color.set(0xffa500);
                if (currentTime - this.state.lastJumpLog >= this.state.jumpLogInterval) {
                    this.log("Spieler springt!", "INFO");
                    this.state.lastJumpLog = currentTime;
                }
            }
        }
    }

    startEternalLoop() {
        // ### Spiel-Loop V7.65 ###
        // Learnings:
        // - V7.56 als Basis: Stabiler Loop mit Physik, Bewegung, Frustum Culling
        // - V7.64 Fehler: Unvollständig (fehlende selfAwarenessAnalyze), updateGrowth undefiniert
        // - V7.65 Vollendung: Alle Funktionen integriert, Fehler behoben, Kommentare ergänzt
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
                    const fpsDmg = Math.max(0, result.outcome.fpsBefore - result.outcome.fpsAfter);
                    const fitness = result.ok ? Math.max(0, 1 - fpsDmg / 100) : 0;
                    this.state.dsl.abilities.push({
                        name: evolution.name,
                        program: evolution.program,
                        source: evolution.source || "nexus",
                        createdAt: evolution.createdAt || performance.now() / 1000,
                        fitness,
                    });
                    this.state.dsl.history.push({
                        id: evolution.name,
                        program: evolution.program,
                        at: performance.now() / 1000,
                        outcome: result.outcome,
                        ok: result.ok,
                    });
                    if (this.state.dsl.history.length > this.state.dsl.historyCap) {
                        this.state.dsl.history = this.state.dsl.history.slice(-this.state.dsl.historyCap);
                    }
                    this.log(
                        `Nexus-Evolution (DSL) ausgeführt: ${evolution.name}, fitness=${fitness.toFixed(2)}`,
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
                                this.state.playerMesh.material.color.set(0xff0000);
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
                if (this.state.moveDirection.length() > 0) {
                    this.state.moveDirection.normalize();
                    playerBody.setLinearVelocity(
                        this.setVec(
                            this.state.tmpVec1,
                            this.state.moveDirection.x * currentSpeed,
                            playerBody.getLinearVelocity().y(),
                            this.state.moveDirection.z * currentSpeed
                        )
                    );
                    playerBody.forceActivationState(1);
                } else {
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

            // ### KI und Selbstanalyse ###
            this.collectLearningData(currentTime);
            if (currentTime - this.state.lastLearningUpdate >= this.state.learningInterval) {
                this.learn(currentTime);
                this.selfAwarenessAnalyze(); // Ergänzt aus V7.56
                this.state.lastLearningUpdate = currentTime;
            }

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
                camera.position.set(player.position.x, player.position.y + 1.6, player.position.z);
                camera.lookAt(
                    player.position.x + Math.sin(this.state.yaw),
                    player.position.y + 1.6 + Math.sin(this.state.pitch),
                    player.position.z + Math.cos(this.state.yaw)
                );
                if (currentTime - this.state.lastCameraLog >= this.state.cameraLogInterval) {
                    this.log(
                        `Kamera: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`,
                        "DEBUG"
                    );
                }
            }

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
                if (distance < 0.5) {
                    isGrounded = true;
                }
            }
            Ammo.destroy(rayCallback);
        }

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
        // Learnings: Fehlte in V7.61, hinzugefügt für V7.65 zur Vollständigkeit
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
const anazhRealm = new AnazhRealm();
// Globale Referenz für DevTools-Debug und automatisierten Playtest.
if (typeof window !== "undefined") window.anazhRealm = anazhRealm;
anazhRealm.init();

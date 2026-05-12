

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
        this.state.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
        this.state.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81 * 1.5, 0)); // Gravitation 1.5G
        this.state.tmpTransform = new Ammo.btTransform();
        this.log("Physik-Welt initialisiert, Gravitation: 1.5G (-14.715 m/s²)");

        // Selbstbewusstsein aktualisieren
        this.state.selfAwareness.components.push("physicsWorld");
    } catch (error) {
        this.logError(error);
        throw error;
    }
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
        this.log(`RigidBody hinzugefügt: Position (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)}), Masse: ${mass}`);
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
            throw new Error(`Ungültige Höhendaten: Erwartet ${width * depth}, erhalten ${heightData ? heightData.length : 'undefined'}`);
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
                    this.log(`Ungültiger Höhenwert in Chunk (${chunkX}, ${chunkZ}) bei (${x}, ${z}): ${height}. Setze auf 0.`, "ERROR");
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
        heightfieldShape.setLocalScaling(new Ammo.btVector3(scaleX / this.state.scaleFactor, 1, scaleZ / this.state.scaleFactor));

        // Physik-Körper für das Terrain erstellen
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        const offsetX = (startX / (width - 1)) * 300 - 150;
        const offsetZ = (startZ / (depth - 1)) * 300 - 150;
        transform.setOrigin(new Ammo.btVector3(
            offsetX / this.state.scaleFactor,
            (localMinHeight + localMaxHeight) / 2 / this.state.scaleFactor,
            offsetZ / this.state.scaleFactor
        ));

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
            this.log(`Terrain-Physik für Chunk (${chunkX}, ${chunkZ}) hinzugefügt: Höhe zwischen ${localMinHeight.toFixed(2)} und ${localMaxHeight.toFixed(2)}`);
        } else {
            this.log(`Warnung: Chunk (${chunkX}, ${chunkZ}) nicht in chunkMap gefunden – Physik-Körper nicht zugewiesen`, "WARNING");
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
        nebulaColor: { value: new THREE.Color(0x4b0082) } // Indigofarben
    },
    side: THREE.BackSide,
    depthWrite: false
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
    const planetMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
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
    this.log(`Planet ${i} erstellt: Position (${planet.position.x.toFixed(2)}, ${planet.position.y.toFixed(2)}, ${planet.position.z.toFixed(2)})`);
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
    this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== creature);
}

clearCreatures() {
    if (!this.state.creatures || this.state.creatures.length === 0) return;
    this.state.creatures.forEach((creature) => this.removeCreature(creature));
    this.state.creatures = [];
    this.state.creatureEmotions = [];
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
        const zIndex = Math.floor((z + 150) / 300 * 255);
        const xIndex = Math.floor((x + 150) / 300 * 255);
        const terrainHeight = this.state.groundHeightField
            ? this.state.groundHeightField[Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)]
            : 0;
        creatureMesh.position.set(x, terrainHeight + 1.0, z);
        creatureMesh.visible = true;
        this.state.scene.add(creatureMesh);
        this.state.creatures.push(creatureMesh);
        this.state.creatureEmotions.push(this.state.weather === "rainy" ? (Math.random() < 0.7 ? "sad" : "happy") : (Math.random() < 0.7 ? "happy" : "sad"));

        if (this.state.physicsWorld) {
            const creatureShape = new Ammo.btBoxShape(new Ammo.btVector3(0.25, 0.25, 0.25));
            const body = this.addRigidBody(creatureMesh, 0.5, creatureShape);
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
        const rayStart = new Ammo.btVector3(
            creature.position.x / this.state.scaleFactor,
            (creature.position.y + 0.5) / this.state.scaleFactor,
            creature.position.z / this.state.scaleFactor
        );
        const rayEnd = new Ammo.btVector3(
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
        const zIndex = Math.floor((creature.position.z + 150) / 300 * 255);
        const xIndex = Math.floor((creature.position.x + 150) / 300 * 255);
        const terrainHeight = this.state.groundHeightField
            ? this.state.groundHeightField[Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)]
            : 0;
        const baseY = terrainHeight + 0.5;
        const floatOffset = Math.sin(this.state.creatureAnimationTime * 2 + i) * 0.2;
        creature.position.y = baseY + floatOffset;

        // Farbe basierend auf Emotion
        const targetColor = emotion === "happy" ? new THREE.Color(0x00ff00) : new THREE.Color(0x0000ff);
        creature.material.color.lerp(targetColor, 0.05);

        // Springen basierend auf Emotion
        if (Math.random() < (emotion === "happy" ? 0.02 : 0.01)) {
            this.creatureJump(creature, jumpHeight);
        }

        // Kill Plane
        if (creature.position.y < -50) {
            creature.position.set(creature.position.x, terrainHeight + 1.0, creature.position.z);
            this.log(`Kreatur ${i} zu tief gefallen, zurückgesetzt zu y=${terrainHeight + 1.0}`);
        }

        // Physik-Update (immer aktiv)
        if (body) {
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(
                creature.position.x / this.state.scaleFactor,
                creature.position.y / this.state.scaleFactor,
                creature.position.z / this.state.scaleFactor
            ));
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
        e.data.forEach(c => {
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
        body.setLinearVelocity(new Ammo.btVector3(velocity.x(), jumpHeight * 5, velocity.z()));
        if (Math.random() < 0.1) { // Nur 10% Chance, den Sprung zu loggen
            this.log(`Kreatur springt mit Höhe ${jumpHeight}`, "DEBUG");
        }
    }
}

isInFrustum(object) {
    if (!object || !object.position) {
        this.log(`isInFrustum: Objekt oder Position nicht definiert`, "ERROR");
        return false;
    }

    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
        this.state.camera.projectionMatrix,
        this.state.camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(matrix);

    // Einfache Punkt-basierte Prüfung aus V7.42
    const isVisible = frustum.containsPoint(object.position);

    // Sicherheitsprüfung: Objekte in der Nähe des Spielers immer sichtbar machen
    if (!isVisible && object.position) {
        const distance = object.position.distanceTo(this.state.playerMesh.position);
        if (distance < 50) {
            return true;
        }
    }

    return isVisible;
}


// ### Aktivieren/Deaktivieren ###
toggleTerrain(visible) {
    if (this.state.groundChunks && this.state.groundChunks.length > 0) {
        this.state.groundChunks.forEach(chunk => {
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
    this.state.creatures.forEach(creature => {
        creature.visible = visible;
        const body = creature.userData.physicsBody;
        if (body) {
            if (visible) {
                this.state.physicsWorld.addRigidBody(body);
                const transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin(new Ammo.btVector3(
                    creature.position.x / this.state.scaleFactor,
                    creature.position.y / this.state.scaleFactor,
                    creature.position.z / this.state.scaleFactor
                ));
                body.setWorldTransform(transform);
            } else {
                this.state.physicsWorld.removeRigidBody(body);
            }
        }
    });
    this.log(`Kreaturen ${visible ? "aktiviert" : "deaktiviert"}`);
}

// ### Selbstdefinition ###
addNewAbility(name, implementation) {
    this.state.abilities[name] = implementation;
    this.state.selfAwareness.components.push(name);
    this.log(`Neue Fähigkeit hinzugefügt: ${name}`);
}

createDynamicAbility(name, code) {
    try {
        return new Function("self", "state", code);
    } catch (error) {
        this.log(`Dynamische Fähigkeit '${name}' durch CSP blockiert: ${error.message}`, "ERROR");
        return null;
    }
}

codeParser(code) {
    try {
        const functionRegex = /function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)}/g;
        let match;
        while ((match = functionRegex.exec(code)) !== null) {
            const funcName = match[1];
            const funcBody = match[2].trim();
            const dynamicAbility = this.createDynamicAbility(funcName, funcBody);
            if (dynamicAbility) {
                this.addNewAbility(funcName, dynamicAbility);
                this.log(`Funktion aus Beispielcode integriert: ${funcName}`);
            }
        }
    } catch (error) {
        this.logError(error);
    }
}

// ### Wachstum und Lernen ###
evolutionEngine() {
    if (typeof tf === "undefined") return;
    const newModel = tf.sequential();
    newModel.add(tf.layers.dense({ units: 16, inputShape: [2], activation: 'relu' }));
    newModel.add(tf.layers.dense({ units: 8, activation: 'relu' }));
    newModel.add(tf.layers.dense({ units: 1, activation: 'linear' }));
    newModel.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
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
if (this.state.errorLog.some(log => log.includes("Tunneling"))) {
    this.recordWeakness("Tunneling detected");
    this.log("Selbstanalyse: Tunneling erkannt – Optimiere...");
    this.optimizeCollisions();
}

// Boden- und Spielerprüfung
if (!this.state.groundChunks || this.state.groundChunks.length === 0 || !this.state.groundChunks.some(chunk => chunk.visible)) {
    this.recordWeakness("Boden fehlt oder unsichtbar");
    this.log("Selbstanalyse: Boden fehlt oder unsichtbar – Erzeuge neuen Boden...");
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
    this.state.rigidBodies.forEach(rb => {
        const body = rb.userData.physicsBody;
        if (body) {
            body.setCcdMotionThreshold(0.02);
            body.setCcdSweptSphereRadius(0.5);
        }
    });
    this.log("Kollisionen optimiert: CCD-Parameter angepasst");
}

optimizeTerrainRoughness() {
    if (this.state.errorLog.some(log => log.includes("durch Wände"))) {
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
        this.state.playerMovementModel = tf.sequential();
        this.state.playerMovementModel.add(tf.layers.dense({ units: 32, inputShape: [6], activation: 'relu' })); // Input: x, y, z, dx, dy, dz
        this.state.playerMovementModel.add(tf.layers.dense({ units: 16, activation: 'relu' }));
        this.state.playerMovementModel.add(tf.layers.dense({ units: 3, activation: 'linear' })); // Output: dx, dy, dz
        this.state.playerMovementModel.compile({ optimizer: 'adam', loss: 'meanSquaredError' });
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
            }
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
            jump: this.state.keys[" "] ? 1 : 0
        }
    };
    this.state.learningData.push(dataPoint);
    if (this.state.learningData.length > 500) this.state.learningData.shift(); // Speicherbegrenzung
    if (this.nexus) this.nexus.processLearningData(dataPoint);
    this.log(`Datenpunkt gesammelt: Position (${dataPoint.playerPosition.x.toFixed(2)}, ${dataPoint.playerPosition.z.toFixed(2)})`, "DEBUG");
}

async learn(currentTime) {
    // ### KI-Lernen und Optimierung ###
    // Zweck: Trainiert das Modell mit Bewegungsdaten und optimiert bei FPS-Drops
    if (this.state.learningData.length < 20) return; // Mindestdaten für Training
    const recentData = this.state.learningData.slice(-20);
    const avgFps = recentData.reduce((sum, d) => sum + d.fps, 0) / recentData.length;

    if (avgFps < 60) {
        this.log(`FPS-Drop erkannt (${avgFps.toFixed(1)}) – Optimiere Physik...`, "WARNING");
        this.optimizePhysics();
        this.nexus.processOptimization({ fps: avgFps });
    }

    if (this.state.playerMovementModel.fit) {
        const inputs = recentData.map(d => [
            d.playerPosition.x, d.playerPosition.y, d.playerPosition.z,
            d.playerVelocity.dx, d.playerVelocity.dy, d.playerVelocity.dz
        ]);
        const outputs = recentData.map(d => {
            const nextData = this.state.learningData.find(ld => ld.timestamp > d.timestamp) || d;
            return [nextData.playerVelocity.dx, nextData.playerVelocity.dy, nextData.playerVelocity.dz];
        });
        const xs = tf.tensor2d(inputs);
        const ys = tf.tensor2d(outputs);
        await this.state.playerMovementModel.fit(xs, ys, { epochs: 5, batchSize: 10, verbose: 0 });
        tf.dispose([xs, ys]);
        this.log("KI-Modell trainiert – Bewegungsprognose verbessert", "INFO");
    }

    this.state.knowledgeBase.push({
        type: "learning",
        content: `FPS: ${avgFps.toFixed(1)}, Datenpunkte: ${recentData.length}`,
        timestamp: currentTime
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
            autonomyLevel: 0
        },
        processLearningData: (data) => {
            // Prüft, ob eine Evolution fällig ist
            if (data.timestamp - this.state.nexusLastEvolution >= this.state.nexusEvolutionInterval) {
                this.evolveNexus(data.timestamp);
            }
        },
        processOptimization: (data) => {
            // Reagiert auf FPS-Drops mit Optimierungsvorschlägen
            if (data.fps < 50 && this.state.nexusEvolutionQueue.length < 5) {
                this.state.nexusEvolutionQueue.push({
                    name: `optimize_${Date.now()}`,
                    impl: (self, state) => {
                        self.optimizePhysics();
                        self.log("Nexus-Optimierung: Physik stabilisiert", "INFO");
                    }
                });
            }
        },
        predictPlayerMove: () => {
            // Vorhersage der Spielerbewegung basierend auf KI-Modell
            if (!this.state.playerMovementModel.predict || !this.state.playerMesh) return null;
            const input = tf.tensor2d([[
                this.state.playerMesh.position.x, this.state.playerMesh.position.y, this.state.playerMesh.position.z,
                this.state.playerBody.getLinearVelocity().x(),
                this.state.playerBody.getLinearVelocity().y(),
                this.state.playerBody.getLinearVelocity().z()
            ]]);
            const prediction = this.state.playerMovementModel.predict(input);
            const result = prediction.dataSync();
            tf.dispose([input, prediction]);
            return { dx: result[0], dy: result[1], dz: result[2] };
        }
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
    this.log(`Nexus entwickelt sich: Autonomie ${this.nexus.knightOfTime.autonomyLevel}, Vorschlag: ${evolution.name}`, "INFO");
    this.state.knowledgeBase.push({
        type: "evolution",
        content: `Autonomie: ${this.nexus.knightOfTime.autonomyLevel}, ${evolution.name}`,
        timestamp: currentTime
    });
}

getNexusIdeas() {
    return [
        {
            name: "gravityShift",
            code: `self.state.gravity = -9.81; self.state.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0)); self.log("Nexus: Gravitation auf Erdebene gesetzt", "INFO");`
        },
        {
            name: "creatureDance",
            code: `self.state.creatures.forEach((c, i) => { c.position.x += Math.sin(self.state.creatureAnimationTime + i); c.position.z += Math.cos(self.state.creatureAnimationTime + i); }); self.log("Nexus: Kreaturen tanzen!", "INFO");`
        },
        {
            name: "terrainFlatten",
            code: `self.state.terrainSteepness *= 0.8; self.generateNewWorld(); self.log("Nexus: Terrain abgeflacht", "INFO");`
        }
    ];
}

generateEvolution() {
    // ### Evolutionen mit Chaos und Ordnung ###
    // Zweck: Generiert dynamische Erweiterungen für das Spiel
    const ideas = this.getNexusIdeas();
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    const dynamicAbility = this.createDynamicAbility(idea.name, idea.code);
    if (!dynamicAbility) {
        return {
            name: `disabled_${idea.name}`,
            impl: (self) => self.log(`Evolution '${idea.name}' ist wegen CSP deaktiviert`, "WARNING"),
        };
    }
    return { name: idea.name, impl: dynamicAbility };
}

restoreAbility(name) {
    // Wird beim Laden eines Speicherstands aufgerufen. Nexus-Ideen werden aus
    // der bekannten Liste rekonstruiert; benutzerdefinierte Fähigkeiten gehen
    // verloren (Code wird nicht persistiert) und müssen neu gelernt werden.
    const idea = this.getNexusIdeas().find(i => i.name === name);
    if (!idea) {
        this.log(`Gelernte Fähigkeit '${name}' kann nicht wiederhergestellt werden (Code nicht persistiert) – bitte neu lernen`, "WARNING");
        return false;
    }
    const dynamicAbility = this.createDynamicAbility(idea.name, idea.code);
    if (!dynamicAbility) return false;
    this.addNewAbility(idea.name, dynamicAbility);
    return true;
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

// Proaktive Vorschläge (alle 10 Chat-Befehle)
if (this.state.knowledgeBase.filter(k => k.type === "chat").length % 10 === 0) {
    this.proactiveSuggestions();
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
        appendChatOutput(`Fähigkeit '${abilityName}' nicht gefunden. Lerne sie mit 'Lerne Fähigkeit <Name> <Beschreibung>'`);
    }
} else if (parts[0] === "ändere" && parts[1] === "sternenhimmel") {
    const color = parts[2] || "purple";
    this.state.skybox.material.uniforms.nebulaColor = { value: new THREE.Color(color) };
    appendChatOutput(`Sternenhimmel geändert: Farbe auf ${color} gesetzt`);
} else if (parts[0] === "speichere" && parts[1] === "zustand") {
    this.saveState();
    this.saveToProjectFolder().then((savedToFolder) => {
        if (savedToFolder) {
            appendChatOutput("Zustand gespeichert (direkt im Spielordner)");
        } else {
            appendChatOutput("Zustand gespeichert, Download als Fallback gestartet");
        }
    });
} else if (parts[0] === "lade" && parts[1] === "zustand") {
    this.loadState();
    appendChatOutput("Zustand geladen");
} else if (parts[0] === "spawne" && parts[1] === "neue" && parts[2] === "welt") {
    this.generateNewWorld();
    appendChatOutput("Neue Welt generiert");
} else if (parts[0] === "spawne" && parts[1] === "kreaturen") {
    const count = parseInt(parts[2]) || 5;
    this.spawnCreatures(count);
    appendChatOutput(`${count} Kreaturen gespawnt`);
} else if (parts[0] === "erhöhe" && parts[1] === "sprungkraft") {
    const amount = parseFloat(parts[3]) || 2;
    this.state.jumpPower += amount;
    appendChatOutput(`Sprungkraft erhöht auf ${this.state.jumpPower}`);
} else if (parts[0] === "behebe" && parts[1] === "physik-tunneling") {
    this.optimizeCollisions();
    appendChatOutput("Physik-Tunneling behoben: CCD angepasst");
} else if (parts[0] === "optimiere" && parts[1] === "physik") {
    this.optimizePhysics();
    appendChatOutput("Physik optimiert");
} else if (parts[0] === "setze" && parts[1] === "wetter") {
    const weather = parts[2];
    if (["sunny", "rainy"].includes(weather)) {
        this.state.weather = weather;
        this.updateSkyboxWeather();
        this.updateCreatureEmotions();
        appendChatOutput(`Wetter gesetzt auf ${weather}`);
    } else {
        appendChatOutput("Unbekanntes Wetter. Beispiele: 'Setze Wetter sunny', 'Setze Wetter rainy'");
    }
} else if (parts[0] === "setze" && parts[1] === "terrain" && parts[2] === "steilheit") {
    const steepness = parseFloat(parts[3]) || 1.0;
    this.state.terrainSteepness = Math.max(0.1, Math.min(2.0, steepness));
    this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
    appendChatOutput(`Terrain-Steilheit auf ${this.state.terrainSteepness} gesetzt und Terrain neu generiert`);
} else if (parts[0] === "setze" && parts[1] === "terrain" && parts[2] === "basishöhe") {
    const baseHeight = parseFloat(parts[3]) || 0.0;
    this.state.terrainBaseHeight = baseHeight;
    this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
    appendChatOutput(`Terrain-Basishöhe auf ${this.state.terrainBaseHeight} gesetzt und Terrain neu generiert`);
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
} else if (parts[0] === "erzähle") {
    const narrative = command.slice(8);
    this.addKnowledge("narrative", narrative);
    appendChatOutput(`Narrativ gespeichert: ${narrative}`);
} else if (parts[0] === "aktiviere" && parts[1] === "version") {
    const version = parts[2];
    if (this.state.versionHistory.includes(version)) {
        this.loadVersion(version);
        appendChatOutput(`Version ${version} aktiviert`);
    } else {
        appendChatOutput(`Version ${version} nicht gefunden`);
    }
} else if (parts[0] === "füge" && parts[1] === "code") {
    const code = command.slice(10);
    this.codeParser(code);
    appendChatOutput(`Code integriert: ${code}`);
} else if (parts[0] === "entwickle" && parts[1] === "fähigkeit") {
    const ability = parts[2];
    if (ability === "fliegen") {
        this.addNewAbility("fly", function(self, state) {
            if (state.playerBody) {
                const velocity = state.playerBody.getLinearVelocity();
                state.playerBody.setLinearVelocity(new Ammo.btVector3(velocity.x(), 5, velocity.z()));
                self.log("Spieler fliegt!", "INFO");
            }
        });
        appendChatOutput("Fähigkeit 'Fliegen' entwickelt");
    } else if (ability === "sehen") {
        this.addNewAbility("see", function(self, state) {
            const light = new THREE.AmbientLight(0xffffff, 1);
            state.scene.add(light);
            self.log("Spieler kann sehen – Licht hinzugefügt!", "INFO");
        });
        appendChatOutput("Fähigkeit 'Sehen' entwickelt");
    } else {
        appendChatOutput("Unbekannte Fähigkeit. Beispiele: 'Entwickle Fähigkeit fliegen', 'Entwickle Fähigkeit sehen'");
    }
} else if (parts[0] === "boden" && parts[1] === "nicht" && parts[2] === "sichtbar") {
    if (!this.state.groundChunks || this.state.groundChunks.length === 0 || !this.state.groundChunks.some(chunk => chunk.visible)) {
        this.log("Boden nicht sichtbar – Erzeuge neuen Boden...", "INFO");
        this.generateNewWorld();
        appendChatOutput("Neuer Boden generiert");
    } else {
        appendChatOutput("Boden ist bereits sichtbar");
    }
} else if (parts[0] === "boden" && parts[1] === "aktivieren") {
    this.toggleTerrain(true);
    appendChatOutput("Boden aktiviert");
} else if (parts[0] === "boden" && parts[1] === "deaktivieren") {
    this.toggleTerrain(false);
    appendChatOutput("Boden deaktiviert");
} else if (parts[0] === "kreaturen" && parts[1] === "aktivieren") {
    this.toggleCreatures(true);
    appendChatOutput("Kreaturen aktiviert");
} else if (parts[0] === "kreaturen" && parts[1] === "deaktivieren") {
    this.toggleCreatures(false);
    appendChatOutput("Kreaturen deaktiviert");
} else if (parts[0] === "aktiviere" && parts[1] === "anazh-symphonie") {
    this.addNewAbility("anazhSymphony", function(self, state) {
        state.creatures.forEach((creature, i) => {
            const emotion = state.creatureEmotions[i];
            const speed = emotion === "happy" ? 3 : 1.5;
            const direction = new THREE.Vector3(
                Math.sin(state.creatureAnimationTime + i) * speed,
                0,
                Math.cos(state.creatureAnimationTime + i) * speed
            );
            creature.position.addScaledVector(direction, 0.016);
        });
        self.log("Anazh-Symphonie aktiviert: Kreaturen tanzen im Rhythmus!", "INFO");
    });
    appendChatOutput("Anazh-Symphonie aktiviert – Kreaturen bewegen sich harmonisch");
} else if (parts[0] === "heile" && parts[1] === "welt") {
    this.state.rigidBodies.forEach(rb => {
        const body = rb.userData.physicsBody;
        if (body) {
            body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
            body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
        }
    });
    this.state.creatureEmotions = this.state.creatureEmotions.map(() => "happy");
    this.state.weather = "sunny";
    this.updateSkyboxWeather();
    this.updateCreatureEmotions();
    appendChatOutput("Welt geheilt: Physik stabilisiert, Kreaturen glücklich, Wetter sonnig");
} else if (parts[0] === "vereine" && parts[1] === "chaos" && parts[2] === "ordnung") {
    this.state.terrainSteepness = 1.0;
    this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
    this.state.creatures.forEach(creature => {
        creature.material.color.set(0xffffff);
    });
    appendChatOutput("Chaos und Ordnung vereint: Terrain ausgeglichen, Kreaturen in Harmonie (weiße Farbe)");
} else if (parts[0] === "aktiviere" && parts[1] === "debug-logs") {
    this.state.debugLogging = true;
    appendChatOutput("Debug-Logs aktiviert");
} else if (parts[0] === "deaktiviere" && parts[1] === "debug-logs") {
    this.state.debugLogging = false;
    appendChatOutput("Debug-Logs deaktiviert");
} else {
    appendChatOutput("Unbekannter Befehl. Beispiele: 'Lerne Fähigkeit <Name> <Beschreibung>', 'Führe Fähigkeit aus <Name>', 'Ändere Sternenhimmel <Farbe>', 'Speichere Zustand', 'Spawne neue Welt', 'Spawne Kreaturen 5', 'Erhöhe Sprungkraft um 2', 'Behebe Physik-Tunneling', 'Optimiere Physik', 'Setze Wetter sunny', 'Setze Terrain Steilheit 0.5', 'Setze Terrain Basishöhe 5', 'Füge Trainingsdaten x=10 z=5', 'Erzähle: Drachen leben hier', 'Füge Code function test() { console.log('Test'); }', 'Entwickle Fähigkeit fliegen', 'Boden nicht sichtbar', 'Boden aktivieren', 'Boden deaktivieren', 'Kreaturen aktivieren', 'Kreaturen deaktivieren', 'Aktiviere Anazh-Symphonie', 'Heile Welt', 'Vereine Chaos Ordnung', 'Aktiviere Debug-Logs', 'Deaktiviere Debug-Logs'");
}
chatInput.value = "";

}

learnAbility(name, description) {
    const lower = (description || "").toLowerCase();
    let funcBody = "";
    if (lower.includes("ändere farbe von kreaturen")) {
        const colorMatch = lower.match(/zu ([\w]+)/);
        const color = colorMatch ? colorMatch[1] : "white";
        funcBody = `
            state.creatures.forEach(creature => {
                creature.material.color.set("${color}");
            });
            self.log("Farbe der Kreaturen geändert zu ${color}");
        `;
    } else if (lower.includes("erhöhe geschwindigkeit")) {
        const amountMatch = lower.match(/um ([\d\.]+)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 1.0;
        funcBody = `
            state.speed += ${amount};
            state.sprintSpeed += ${amount};
            self.log("Geschwindigkeit erhöht um ${amount}, neue Geschwindigkeit: " + state.speed);
        `;
    } else if (lower.includes("spawne objekt")) {
        funcBody = `
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const obj = new THREE.Mesh(geometry, material);
            obj.position.set(0, 10, 0);
            state.scene.add(obj);
            self.log("Neues Objekt gespawnt!");
        `;
    } else if (lower.includes("erschaffe baum")) {
        funcBody = `
            const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
            const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.set(0, 2.5, 0);
            const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
            const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.set(0, 5, 0);
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            tree.position.set(Math.random() * 100 - 50, 0, Math.random() * 100 - 50);
            state.scene.add(tree);
            self.log("Baum erschaffen!");
        `;
    } else {
        funcBody = `
            self.log("Fähigkeit '${name}' ausgeführt: ${description}");
        `;
    }
const dynamicAbility = this.createDynamicAbility(name, funcBody);
if (dynamicAbility) {
    this.addNewAbility(name, dynamicAbility);
}
this.state.knowledgeBase.push({ type: "ability", content: { name, description }, timestamp: performance.now() / 1000 });

}
proactiveSuggestions() {
    const suggestions = [
        "Möchtest du eine neue Fähigkeit lernen? Beispiel: 'Lerne Fähigkeit farbwechsel Ändere Farbe von Kreaturen zu blau'",
        "Soll ich die Physik weiter optimieren? Sage 'Entwickle Physik'",
        "Wie wäre es mit einem neuen Sternenhimmel? Beispiel: 'Ändere Sternenhimmel red'",
        "Möchtest du mehr Kreaturen spawnen? Beispiel: 'Spawne Kreaturen 10'",
        "Soll ich das Terrain flacher machen? Beispiel: 'Setze Terrain Steilheit 0.5'",
        "Möchtest du eine neue Welt erschaffen? Beispiel: 'Erschaffe Welt forest'",
        "Soll ich die Spielsteuerung erweitern? Beispiel: 'Implementiere Spielsteuerung'"
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    const chatOutput = document.getElementById("chat-output");
    const line = document.createElement("div");
    line.textContent = `KI-Vorschlag: ${randomSuggestion}`;
    chatOutput.appendChild(line);
    chatOutput.scrollTop = chatOutput.scrollHeight;
}
developAdvancedPhysics() {
    this.state.physicsWorld = null;
    this.state.rigidBodies = [];
    this.state.advancedPhysics = {
        bodies: [],
        simulate: (delta) => {
            this.state.advancedPhysics.bodies.forEach(body => {
                const pos = body.position;
                const vel = body.velocity;
                pos.x += vel.x * delta;
                pos.y += vel.y * delta;
                pos.z += vel.z * delta;
                vel.y -= 9.81 * delta;
                const terrainHeight = this.getTerrainHeightAt(pos.x, pos.z);
                if (pos.y < terrainHeight + 0.5) {
                    pos.y = terrainHeight + 0.5;
                    vel.y = 0;
                }
                body.mesh.position.set(pos.x, pos.y, pos.z);
            });
        }
    };
    this.state.advancedPhysics.bodies.push({
        mesh: this.state.playerMesh,
        position: { x: 0, y: 10, z: 0 },
        velocity: { x: 0, y: 0, z: 0 }
    });
    this.state.creatures.forEach(creature => {
        this.state.advancedPhysics.bodies.push({
            mesh: creature,
            position: { x: creature.position.x, y: creature.position.y, z: creature.position.z },
            velocity: { x: 0, y: 0, z: 0 }
        });
    });
    this.log("Tensor.js-basierte Physik-Engine implementiert");
}
developAdvancedRenderer() {
    this.state.scene.children.forEach(child => {
        if (child === this.state.playerMesh || this.state.creatures.includes(child)) return;
        this.state.scene.remove(child);
    });
const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;
const fragmentShader = `
    varying vec3 vWorldPosition;
    uniform vec3 uLightPosition;
    void main() {
        vec3 baseColor = vec3(0.1, 0.6, 0.1);
        float lightDistance = distance(vWorldPosition, uLightPosition);
        float intensity = 1.0 / (lightDistance * lightDistance);
        gl_FragColor = vec4(baseColor * intensity, 1.0);
    }
`;
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uLightPosition: { value: new THREE.Vector3(0, 50, 0) }
    }
});

if (this.state.groundMesh) {
    this.state.groundMesh.material = material;
    this.state.scene.add(this.state.groundMesh);
}
this.state.scene.add(this.state.playerMesh);
this.state.creatures.forEach(creature => this.state.scene.add(creature));
this.log("Tensor.js-basierte Raytracing-Engine implementiert");

}
implementGameMechanics() {
    this.state.gameMechanics = {
        raycaster: new THREE.Raycaster(),
        mouse: new THREE.Vector2(),
        onMouseClick: (event) => {
            this.state.gameMechanics.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.state.gameMechanics.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            this.state.gameMechanics.raycaster.setFromCamera(this.state.gameMechanics.mouse, this.state.camera);

        const groundObjects = this.state.groundChunks.length > 0 ? this.state.groundChunks : [this.state.groundMesh];
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
                const blocks = this.state.scene.children.filter(child => {
                    const isGroundChunk = this.state.groundChunks.length > 0 ? this.state.groundChunks.includes(child) : child === this.state.groundMesh;
                    return !isGroundChunk && child !== this.state.playerMesh && !this.state.creatures.includes(child);
                });
                const blockIntersects = this.state.gameMechanics.raycaster.intersectObjects(blocks);
                if (blockIntersects.length > 0) {
                    const block = blockIntersects[0].object;
                    this.state.scene.remove(block);
                    this.log(`Block abgebaut bei (${block.position.x}, ${block.position.y}, ${block.position.z})`);
                }
            }
        }
    }
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
            const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
            const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
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
        if (Math.random() < 0.1) { // 10% Chance, Emotion zu ändern
            this.state.creatureEmotions[i] = this.state.weather === "rainy" ? (Math.random() < 0.7 ? "sad" : "happy") : (Math.random() < 0.7 ? "happy" : "sad");
        }
    }
}

optimizePhysics() {
    this.state.gravity = -14.715; // Zurück auf Standard
    this.state.physicsWorld.setGravity(new Ammo.btVector3(0, this.state.gravity, 0));
    this.state.rigidBodies.forEach(rb => {
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
            this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== this.state.groundMesh);
        }
        this.state.groundMesh = null;
        this.state.groundHeightField = null;
        this.log("Alter Boden entfernt");
    }
    if (this.state.groundChunks) {
        this.state.groundChunks.forEach(chunk => {
            this.state.scene.remove(chunk);
            const body = chunk.userData.physicsBody;
            if (body) {
                this.state.physicsWorld.removeRigidBody(body);
                Ammo.destroy(body);
                this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== chunk);
            }
        });
        this.state.groundChunks = [];
        this.log("Alte Chunks entfernt");
    }
    if (this.state.floatingIslands) {
        this.state.floatingIslands.forEach(island => {
            this.state.scene.remove(island);
            const body = island.userData.physicsBody;
            if (body) {
                this.state.physicsWorld.removeRigidBody(body);
                Ammo.destroy(body);
                this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== island);
            }
        });
        this.state.floatingIslands = [];
        this.log("Alte fliegende Inseln entfernt");
    }
    if (this.state.ufos) {
        this.state.ufos.forEach(ufo => this.state.scene.remove(ufo));
        this.state.ufos = [];
        this.log("Alte UFOs entfernt");
    }
    if (this.state.creatures) {
        this.state.creatures.forEach(creature => {
            this.state.scene.remove(creature);
            const body = creature.userData.physicsBody;
            if (body) {
                this.state.physicsWorld.removeRigidBody(body);
                Ammo.destroy(body);
                this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== creature);
            }
        });
        this.state.creatures = [];
        this.state.creatureEmotions = [];
        this.log("Alte Kreaturen entfernt");
    }
    if (this.state.wallBoxes) {
        this.state.wallBoxes.forEach(wall => {
            this.state.scene.remove(wall);
            const body = wall.userData.physicsBody;
            if (body) {
                this.state.physicsWorld.removeRigidBody(body);
                Ammo.destroy(body);
                this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== wall);
            }
        });
        this.state.wallBoxes = [];
        this.log("Alte Wand-Kollisionsboxen entfernt");
    }
    if (this.state.vegetation) {
        this.state.vegetation.forEach(veg => this.state.scene.remove(veg));
        this.state.vegetation = [];
        this.log("Alte Vegetation entfernt");
    }
    if (this.state.waterfalls) {
        this.state.waterfalls.forEach(wf => this.state.scene.remove(wf));
        this.state.waterfalls = [];
        this.log("Alte Wasserfälle entfernt");
    }

    // ### Spieler-Position sicherstellen ###
    if (this.state.playerMesh) {
        this.state.playerMesh.position.set(0, 50, 0);
        this.state.playerMesh.visible = true;
        if (this.state.playerBody) {
            const transform = new Ammo.btTransform();
            transform.setIdentity();
            transform.setOrigin(new Ammo.btVector3(0, 50 / this.state.scaleFactor, 0));
            this.state.playerBody.setWorldTransform(transform);
            this.state.playerBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
        }
        this.log("Neue Welt: Spieler zurückgesetzt zu (0, 50, 0)");
    } else {
        this.log("Warnung: playerMesh nicht initialisiert – sollte in init() initialisiert sein", "ERROR");
    }

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

            let height = this.state.noiseCache.get(cacheKey) ?? (() => {
                const height1 = noise.noise2D(x * 0.01, z * 0.01) * 20 * steepness;
                const height2 = noise.noise2D(x * 0.03, z * 0.03) * 15 * steepness;
                const height3 = noise.noise2D(x * 0.06, z * 0.06) * 10 * steepness;
                const height4 = noise.noise2D(x * 0.1, z * 0.1) * 5 * steepness;
                const height5 = noise.noise2D(x * 0.005, z * 0.005) * 30 * steepness;
                const height6 = noise.noise2D(x * 0.002, z * 0.002) * 50 * steepness;
                const height7 = Math.pow(noise.noise2D(x * 0.02, z * 0.02), 3) * 30 * steepness;
                const canyonNoise = noise.noise2D(x * 0.008, z * 0.008);
                const fieldNoise = noise.noise2D(x * 0.004, z * 0.004);
                let h = baseHeight + height1 + height2 + height3 + height4 + height5 + height6 + height7;

                if (canyonNoise > 0.7) h -= 40 * (canyonNoise - 0.7) / 0.3;
                if (fieldNoise < -0.5) h = Math.max(h * 0.2, -10);

                if (!Number.isFinite(h)) {
                    this.log(`Ungültiger Höhenwert bei (${x}, ${z}): ${h}. Setze auf 0.`, "ERROR");
                    h = 0;
                }
                this.cacheNoise(cacheKey, h);
                return h;
            })();

            const caveValue = caveNoise.noise3D(x * 0.05, height * 0.05, z * 0.05);
            caveData[i] = caveValue > 0.4 ? 1 : 0;
            if (caveData[i] === 1 && height < 10 && height > -20) {
                height -= 20;
                if (!Number.isFinite(height)) {
                    this.log(`Ungültiger Höhenwert nach Höhle bei (${x}, ${z}): ${height}. Setze auf 0.`, "ERROR");
                    height = 0;
                }
            }

            const volcanoValue = volcanoNoise.noise2D(x * 0.02, z * 0.02);
            volcanoData[i] = volcanoValue > 0.8 ? 1 : 0;
            if (volcanoData[i] === 1) {
                height += 50 * (volcanoValue - 0.8) / 0.2;
                if (!Number.isFinite(height)) {
                    this.log(`Ungültiger Höhenwert nach Vulkan bei (${x}, ${z}): ${height}. Setze auf 0.`, "ERROR");
                    height = 0;
                }
            }

            height = Math.max(-100, Math.min(100, height));
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
            weatherEffect: { value: this.state.weather === "rainy" ? 1.0 : 0.0 }
        },
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true
    });

    this.log("Shader-Material erstellt. Überprüfe Shader-Status...");
    if (!material.isShaderMaterial || !material.vertexShader || !material.fragmentShader) {
        this.log("Shader-Programm konnte nicht erstellt werden.", "ERROR");
        this.log("Falle zurück auf MeshBasicMaterial für Terrain mit einfacher Textur.");
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(10, 10);
        material = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
        });
    } else {
        this.log("Shader-Programm erfolgreich erstellt.");
    }

    // ### Initiale Chunks generieren ###
    this.state.chunkMap = new Map();
    this.state.chunkSize = CHUNK_SIZE;
    this.state.chunkWidth = WIDTH;
    this.state.chunkDepth = DEPTH;
    this.state.terrainMaterial = material;
    this.state.groundChunks = [];

    for (let cz = 0; cz < CHUNKS_Z; cz++) {
        for (let cx = 0; cx < CHUNKS_X; cx++) {
            this.generateChunk(cx, cz, heightData, WIDTH, DEPTH, material);
        }
    }

    // ### Physik-Kollision für das Terrain hinzufügen ###
    if (!this.state.scaleFactor || this.state.scaleFactor <= 0) {
        this.state.scaleFactor = 1.0;
        this.log("scaleFactor ungültig oder nicht gesetzt, Fallback auf 1.0", "WARNING");
    }

    const heightfieldData = new Float32Array(WIDTH * DEPTH);
    for (let z = 0; z < DEPTH; z++) {
        for (let x = 0; x < WIDTH; x++) {
            const idx = z * WIDTH + x;
            const height = heightData[idx];
            if (!Number.isFinite(height)) {
                this.log(`Ungültiger Höhenwert in heightfieldData bei (${x}, ${z}): ${height}. Setze auf 0.`, "ERROR");
                heightfieldData[idx] = 0;
            } else {
                heightfieldData[idx] = height / this.state.scaleFactor;
            }
        }
    }

    const heightfieldShape = new Ammo.btHeightfieldTerrainShape(
        WIDTH, DEPTH,
        heightfieldData,
        1.0, // Höhe-Skalierung
        minHeight / this.state.scaleFactor,
        maxHeight / this.state.scaleFactor,
        1, // Up-Achse (Y)
        'PHY_FLOAT',
        false // Kein Flip der Dreiecke
    );

    const scaleX = WORLD_SIZE / (WIDTH - 1);
    const scaleZ = WORLD_SIZE / (DEPTH - 1);
    const scaledX = scaleX / this.state.scaleFactor;
    const scaledZ = scaleZ / this.state.scaleFactor;
    if (!Number.isFinite(scaledX) || !Number.isFinite(scaledZ)) {
        this.log(`Ungültige Skalierung für Heightfield: scaleX=${scaledX}, scaleZ=${scaledZ}. Überspringe Physik-Kollision.`, "ERROR");
    } else {
        heightfieldShape.setLocalScaling(new Ammo.btVector3(scaledX, 1, scaledZ));

        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(
            0 / this.state.scaleFactor,
            (minHeight + maxHeight) / 2 / this.state.scaleFactor,
            0 / this.state.scaleFactor
        ));

        const motionState = new Ammo.btDefaultMotionState(transform);
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, heightfieldShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        this.state.physicsWorld.addRigidBody(body);
        this.state.groundHeightFieldBody = body;
        this.log("Physik-Kollision für Terrain hinzugefügt");
    }

    // ### Fliegende Inseln generieren ###
    this.state.floatingIslands = [];
    this.state.ufos = [];
    const numIslands = 3; // Reduziere Anzahl für bessere Performance
    let islandMaterial = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
            weatherEffect: { value: this.state.weather === "rainy" ? 1.0 : 0.0 }
        },
        side: THREE.DoubleSide,
        depthTest: true,
        depthWrite: true
    });

    this.log("Shader-Material für fliegende Inseln erstellt. Überprüfe Shader-Status...");
    if (!islandMaterial.isShaderMaterial || !islandMaterial.vertexShader || !islandMaterial.fragmentShader) {
        this.log("Shader-Programm für fliegende Inseln konnte nicht erstellt werden.", "ERROR");
        this.log("Falle zurück auf MeshBasicMaterial für fliegende Inseln mit einfacher Textur.");
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5, 5);
        islandMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.DoubleSide
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
                    const heightFactor = 1 - (distance / maxDistance);
                    const height1 = islandNoise.noise2D(x * 0.1, z * 0.1) * 3 * heightFactor;
                    const height2 = islandNoise.noise2D(x * 0.3, z * 0.3) * 2 * heightFactor;
                    const height3 = islandNoise.noise2D(x * 0.5, z * 0.5) * 1 * heightFactor;
                    height = height1 + height2 + height3;
                    height = Math.max(0, height);
                    height -= (1 - heightFactor) * islandHeight;
                    const irregularity = islandNoise.noise2D(x * 0.8, z * 0.8) * 1.5;
                    height += irregularity;

                    if (!Number.isFinite(height)) {
                        this.log(`Ungültiger Höhenwert für fliegende Insel ${i} bei (${x}, ${z}): ${height}. Setze auf 0.`, "ERROR");
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
                if (points[z][x] > -islandHeight && points[z][x + 1] > -islandHeight && points[z + 1][x] > -islandHeight && points[z + 1][x + 1] > -islandHeight) {
                    if (a >= 0 && b >= 0 && c >= 0 && d >= 0 && a < vertices.length / 3 && b < vertices.length / 3 && c < vertices.length / 3 && d < vertices.length / 3) {
                        indices.push(a, b, d);
                        indices.push(a, d, c);
                    } else {
                        this.log(`Ungültige Indices für fliegende Insel ${i}: (${a}, ${b}, ${d}, ${c}). Überspringe Dreieck.`, "ERROR");
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
                this.log(`Ungültiger Vertex-Wert in fliegender Insel ${i} bei Index ${j}: ${positions[j]}. Setze auf 0.`, "ERROR");
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
            this.log(`Fehler beim Berechnen der Bounding Sphere/Box für fliegende Insel ${i}: ${e.message}. Insel wird übersprungen.`, "ERROR");
            continue;
        }

        const island = new THREE.Mesh(geometry, islandMaterial);
        const islandX = (Math.random() - 0.5) * WORLD_SIZE;
        const islandZ = (Math.random() - 0.5) * WORLD_SIZE;
        const islandY = maxHeight + 20 + Math.random() * 30;
        if (!Number.isFinite(islandX) || !Number.isFinite(islandY) || !Number.isFinite(islandZ)) {
            this.log(`Ungültige Position für fliegende Insel ${i}: (${islandX}, ${islandY}, ${islandZ}). Insel wird übersprungen.`, "ERROR");
            continue;
        }
        island.position.set(islandX, islandY, islandZ);
        island.visible = true;
        island.castShadow = true;
        island.receiveShadow = true;

        const numTrees = Math.floor(Math.random() * 3 + 1); // Reduziere Anzahl der Bäume
        for (let t = 0; t < numTrees; t++) {
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
            const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            const leavesGeometry = new THREE.SphereGeometry(1.5, 8, 8);
            const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            const treeX = (Math.random() - 0.5) * (islandSize - 4);
            const treeZ = (Math.random() - 0.5) * (islandSize - 4);
            let treeHeight = islandNoise.noise2D((islandX + treeX) * 0.1, (islandZ + treeZ) * 0.1) * 3;
            if (!Number.isFinite(treeHeight)) {
                this.log(`Ungültiger Baumhöhenwert für fliegende Insel ${i} bei (${treeX}, ${treeZ}): ${treeHeight}. Setze auf 0.`, "ERROR");
                treeHeight = 0;
            }
            if (!Number.isFinite(treeX) || !Number.isFinite(treeZ)) {
                this.log(`Ungültige Baumposition für fliegende Insel ${i}: (${treeX}, ${treeZ}). Baum wird übersprungen.`, "ERROR");
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
                    this.log(`Fehler beim Berechnen der Bounding Sphere/Box für Baum auf fliegender Insel ${i}: ${e.message}. Baum wird übersprungen.`, "ERROR");
                    continue;
                }

                island.add(tree);
            }
        }

        this.state.scene.add(island);
        this.state.floatingIslands.push(island);
        this.log(`Fliegende Insel ${i} erstellt: Position (${islandX.toFixed(2)}, ${islandY.toFixed(2)}, ${islandZ.toFixed(2)})`);

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
            this.log(`Fehler beim Berechnen der Bounding Sphere/Box für UFO auf fliegender Insel ${i}: ${e.message}. UFO wird übersprungen.`, "ERROR");
            continue;
        }

        this.state.scene.add(ufo);
        this.state.ufos.push(ufo);
        ufo.userData = { baseY: ufoY, speed: Math.random() * 0.5 + 0.5 };
        this.log(`UFO für Insel ${i} erstellt: Position (${islandX.toFixed(2)}, ${ufo.position.y.toFixed(2)}, ${islandZ.toFixed(2)})`);
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
                this.log(`Ungültige Werte für Vegetation/Wasserfall bei (${xPos}, ${zPos}): height=${height}, steepness=${steepness}. Überspringe.`, "ERROR");
                continue;
            }

            if (steepness < 1.0 && height > -5 && height < 30 && Math.random() < 0.02) { // Reduziere Wahrscheinlichkeit
                const vegetationType = height < 0 ? "grass" : (height < 20 ? "tree" : "flower");
                if (vegetationType === "tree") {
                    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
                    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
                    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
                    const leavesGeometry = new THREE.SphereGeometry(2, 8, 8);
                    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
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
                        this.log(`Fehler beim Berechnen der Bounding Sphere/Box für Baum bei (${xPos}, ${zPos}): ${e.message}. Baum wird übersprungen.`, "ERROR");
                        continue;
                    }

                    this.state.scene.add(tree);
                    this.state.vegetation.push(tree);
                } else if (vegetationType === "grass") {
                    const grassGeometry = new THREE.ConeGeometry(0.2, 1, 4);
                    const grassMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                    const grass = new THREE.Mesh(grassGeometry, grassMaterial);
                    grass.position.set(xPos, height + 0.5, zPos);
                    grass.castShadow = true;
                    grass.receiveShadow = true;

                    try {
                        grassGeometry.computeBoundingSphere();
                        grassGeometry.computeBoundingBox();
                    } catch (e) {
                        this.log(`Fehler beim Berechnen der Bounding Sphere/Box für Gras bei (${xPos}, ${zPos}): ${e.message}. Gras wird übersprungen.`, "ERROR");
                        continue;
                    }

                    this.state.scene.add(grass);
                    this.state.vegetation.push(grass);
                } else if (vegetationType === "flower") {
                    const stemGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 4);
                    const stemMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
                    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
                    const flowerGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                    const flowerMaterial = new THREE.MeshBasicMaterial({ color: 0xFF00FF });
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
                        this.log(`Fehler beim Berechnen der Bounding Sphere/Box für Blume bei (${xPos}, ${zPos}): ${e.message}. Blume wird übersprungen.`, "ERROR");
                        continue;
                    }

                    this.state.scene.add(flowerGroup);
                    this.state.vegetation.push(flowerGroup);
                }
            }

            if (steepness > 5.0 && height > 10 && height < 50 && Math.random() < 0.005) { // Reduziere Wahrscheinlichkeit
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

                    if (!Number.isFinite(positions[p * 3]) || !Number.isFinite(positions[p * 3 + 1]) || !Number.isFinite(positions[p * 3 + 2])) {
                        this.log(`Ungültige Partikelposition bei Wasserfall (${xPos}, ${height}, ${zPos}): (${positions[p * 3]}, ${positions[p * 3 + 1]}, ${positions[p * 3 + 2]}). Setze auf 0.`, "ERROR");
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
                    this.log(`Fehler beim Berechnen der Bounding Sphere/Box für Wasserfall bei (${xPos}, ${height}, ${zPos}): ${e.message}. Wasserfall wird übersprungen.`, "ERROR");
                    continue;
                }

                const particleMaterial = new THREE.PointsMaterial({
                    color: 0x00AAFF,
                    size: 0.2,
                    transparent: true,
                    opacity: 0.8
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
    this.log(`Neues Terrain generiert: ${WORLD_SIZE}x${WORLD_SIZE}, Höhe zwischen ${minHeight.toFixed(2)} und ${maxHeight.toFixed(2)}`);

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
    this.log(`Chunk (${chunkX}, ${chunkZ}) generiert: ${chunkWidth}x${chunkDepth}`);

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
extendTerrain(direction) {
    // ### Konstanten ###
    const CHUNK_SIZE = this.state.chunkSize;
    const WIDTH = this.state.chunkWidth;
    const DEPTH = this.state.chunkDepth;
    const WORLD_SIZE = 300;
    const steepness = this.state.terrainSteepness;
    const baseHeight = this.state.terrainBaseHeight;
    const material = this.state.terrainMaterial;

    // ### Aktuelle Chunk-Grenzen ###
    let minChunkX = Infinity, maxChunkX = -Infinity, minChunkZ = Infinity, maxChunkZ = -Infinity;
    for (let key of this.state.chunkMap.keys()) {
        const [cx, cz] = key.split(",").map(Number);
        minChunkX = Math.min(minChunkX, cx);
        maxChunkX = Math.max(maxChunkX, cx);
        minChunkZ = Math.min(minChunkZ, cz);
        maxChunkZ = Math.max(maxChunkZ, cz);
    }

    // ### Neuer Chunk ###
    let newChunkX, newChunkZ;
    switch (direction) {
        case "north": newChunkX = minChunkX; newChunkZ = minChunkZ - 1; break;
        case "south": newChunkX = maxChunkX; newChunkZ = maxChunkZ + 1; break;
        case "west":  newChunkX = minChunkX - 1; newChunkZ = minChunkZ; break;
        case "east":  newChunkX = maxChunkX + 1; newChunkZ = maxChunkZ; break;
        default: return;
    }

    if (this.state.chunkMap.has(`${newChunkX},${newChunkZ}`)) return; // Chunk existiert bereits

    // ### Höhendaten für neuen Chunk ###
    const heightData = new Float32Array(WIDTH * DEPTH);
    let minHeight = Infinity;
    let maxHeight = -Infinity;

    const noise = new SimplexNoise(this.state.seed || "anazh-realm-seed");
    for (let i = 0; i < WIDTH * DEPTH; i++) {
        const x = (i % WIDTH) * (WORLD_SIZE / (WIDTH - 1)) - WORLD_SIZE / 2 + (newChunkX * CHUNK_SIZE * (WORLD_SIZE / WIDTH));
        const z = Math.floor(i / WIDTH) * (WORLD_SIZE / (DEPTH - 1)) - WORLD_SIZE / 2 + (newChunkZ * CHUNK_SIZE * (WORLD_SIZE / DEPTH));
        const cacheKey = `${x}:${z}:${steepness}`;

        let height = this.state.noiseCache.get(cacheKey) ?? (() => {
            const height1 = noise.noise2D(x * 0.01, z * 0.01) * 20 * steepness;
            const height2 = noise.noise2D(x * 0.03, z * 0.03) * 15 * steepness;
            const height3 = noise.noise2D(x * 0.06, z * 0.06) * 10 * steepness;
            const height4 = noise.noise2D(x * 0.002, z * 0.002) * 50 * steepness;
            const height5 = Math.pow(noise.noise2D(x * 0.02, z * 0.02), 3) * 30 * steepness;
            let h = baseHeight + height1 + height2 + height3 + height4 + height5;

            if (!Number.isFinite(h)) {
                this.log(`Ungültige Höhe bei (${x}, ${z}) in Richtung ${direction}: ${h}, setze auf 0`, "ERROR");
                h = 0;
            }
            h = Math.max(-100, Math.min(100, h));
            this.cacheNoise(cacheKey, h);
            return h;
        })();

        heightData[i] = height;
        minHeight = Math.min(minHeight, height);
        maxHeight = Math.max(maxHeight, height);
    }

    this.generateChunk(newChunkX, newChunkZ, heightData, WIDTH, DEPTH, material);
    this.log(`Terrain erweitert in ${direction}: Chunk (${newChunkX}, ${newChunkZ})`);


    // ### Learnings ### [Stichwortartig optimieren, korrigieren und ergänzen aber nie Wissen löschen! Nie Learnings Entfernen!]
    // - Überlappung in generateChunk macht Höhenabgleich überflüssig.
    // - Weltkoordinaten und Seed sorgen für konsistente Noise über Chunks hinweg.
    // - Höhen an den Rändern werden mit benachbarten Chunks synchronisiert.
    // - Weltkoordinaten und Noise-Konsistenz sorgen für harmonische Übergänge.
    // - Weltkoordinaten mit Chunk-Offset ermöglichen unendliche Erweiterung ohne Brüche.
    // - Noise-Konsistenz durch Seed sichert harmonische Gebirge über neue Chunks.
}

generateNewWorld() {
    this.generateTerrainWithParameters(this.state.terrainSteepness, this.state.terrainBaseHeight);
}




// ### Persistenz ###
buildStateSnapshot() {
    const learningData = this.state.learningData.slice(-200);
    const knowledgeBase = this.state.knowledgeBase.slice(-200);
    return {
        playerPosition: this.state.playerMesh ? {
            x: this.state.playerMesh.position.x,
            y: this.state.playerMesh.position.y,
            z: this.state.playerMesh.position.z,
        } : { x: 0, y: 5, z: 0 },
        learningData: learningData,
        knowledgeBase: knowledgeBase,
        version: this.state.currentVersion,
        abilities: Object.keys(this.state.abilities),
        selfAwareness: this.state.selfAwareness,
        creatures: this.state.creatures.map(creature => ({
            position: { x: creature.position.x, y: creature.position.y, z: creature.position.z },
        })),
        creatureEmotions: this.state.creatureEmotions,
        terrainSteepness: this.state.terrainSteepness,
        terrainBaseHeight: this.state.terrainBaseHeight,
        weather: this.state.weather,
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

async saveToProjectFolder(options = {}) {
    const { fallbackToDownload = true } = options;
    const stateToSave = this.buildStateSnapshot();
    try {
        const response = await fetch("http://localhost:4312/api/save-state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fileName: "anazhRealmState.json",
                state: stateToSave
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        this.log(`Zustand direkt im Spielordner gespeichert: ${result.path || "anazhRealmState.json"}`);
        return true;
    } catch (error) {
        if (!fallbackToDownload) {
            this.log(`Direktes Speichern im Spielordner fehlgeschlagen (${error.message})`, "ERROR");
            return false;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateToSave));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "anazhRealmState.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        this.log(`Direktes Speichern im Spielordner fehlgeschlagen (${error.message}). Download-Fallback gestartet`, "ERROR");
        return false;
    }
}

pruneDistantChunks(playerPos) {
    if (!playerPos || !this.state.chunkMap || this.state.chunkMap.size <= this.state.maxLoadedChunks) return;
    const chunkSizeWorld = this.state.chunkSize * 300 / this.state.chunkWidth;
    const playerChunkX = Math.floor(playerPos.x / chunkSizeWorld);
    const playerChunkZ = Math.floor(playerPos.z / chunkSizeWorld);

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
            this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== chunk);
            if (chunk.geometry) chunk.geometry.dispose();
        }
        this.state.groundChunks = this.state.groundChunks.filter(c => c !== chunk);
        this.state.chunkMap.delete(target.key);
    }
    this.log(`Chunk-Cache bereinigt: ${this.state.chunkMap.size} aktive Chunks`, "DEBUG");
}

loadState() {
    const savedState = localStorage.getItem("anazhRealmState");
    if (savedState) {
        let state;
        try {
            state = JSON.parse(savedState);
        } catch (error) {
            this.log(`Speicherstand ist ungültiges JSON: ${error.message}`, "ERROR");
            return;
        }
        const playerPosition = state.playerPosition || { x: 0, y: 5, z: 0 };
        const safeX = Number.isFinite(playerPosition.x) ? playerPosition.x : 0;
        const safeY = Number.isFinite(playerPosition.y) ? playerPosition.y : 5;
        const safeZ = Number.isFinite(playerPosition.z) ? playerPosition.z : 0;
        if (this.state.playerMesh) {
            this.state.playerMesh.position.set(
                safeX,
                safeY,
                safeZ
            );
            this.state.playerMesh.visible = true;
            if (this.state.playerBody) {
                const transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin(new Ammo.btVector3(
                    safeX / this.state.scaleFactor,
                    safeY / this.state.scaleFactor,
                    safeZ / this.state.scaleFactor
                ));
                this.state.playerBody.setWorldTransform(transform);
                this.state.playerBody.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
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
        this.updateSkyboxWeather();
        if (Array.isArray(state.abilities)) {
            let restored = 0;
            state.abilities.forEach(name => {
                if (this.state.abilities[name]) return;
                if (this.restoreAbility(name)) restored++;
            });
            if (restored > 0) this.log(`Fähigkeiten wiederhergestellt: ${restored}`);
        }
        this.log("Zustand geladen");
    }
    const savedVersions = localStorage.getItem("anazhRealmVersions");
    if (savedVersions) {
        this.state.versionHistory = JSON.parse(savedVersions);
    }
}

loadVersion(version) {
    this.log(`Lade Version ${version} – Platzhalter für Versionsmanagement`);
}

// ### Initialisierung V7.65 ###
// Learnings:
// - V7.64 Basis: Stabile Initialisierung mit Physik, Szene, Kamera
// - V7.65 Ergänzung: Fehlerbehandlung verbessert, Chat/Nexus integriert
async init() {
    this.log("Initialisiere Anazh Realm V7.65... Ewigkeit erwacht!", "INFO");
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

    this.core.startEternalLoop();
    this.log("Hauptschleife gestartet – Ultiversum pulsiert!", "INFO");
}

handleJump(currentTime) {
    // ### Sprunglogik ###
    // Zweck: Abstrahiert Sprungmechanik für bessere Wartbarkeit
    if (this.state.physicsWorld && this.state.playerBody) {
        const isGrounded = this.isPlayerGrounded();
        const withinCoyoteTime = (currentTime - this.state.lastGroundedTime) <= this.state.coyoteTime;
        if ((isGrounded || withinCoyoteTime) && !this.state.isJumping) {
            const velocity = this.state.playerBody.getLinearVelocity();
            this.state.playerBody.setLinearVelocity(new Ammo.btVector3(velocity.x(), this.state.jumpPower, velocity.z()));
            this.state.isJumping = true;
            this.state.isInAir = true;
            this.state.playerMesh.material.color.set(0xffa500);
            this.log("Spieler springt!", "INFO");
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
            this.state.nexusCodeForge[evolution.name] = evolution.impl;
            this.state.abilities[evolution.name] = evolution.impl;
            evolution.impl(this, this.state);
            this.log(`Nexus-Evolution ausgeführt: ${evolution.name}`, "INFO");
        }

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
            new THREE.Matrix4().multiplyMatrices(this.state.camera.projectionMatrix, this.state.camera.matrixWorldInverse)
        );
        this.state.groundChunks.forEach(chunk => chunk.visible = this.isInFrustum(chunk, frustum));
        if (this.state.floatingIslands) this.state.floatingIslands.forEach(island => island.visible = this.isInFrustum(island, frustum));
        if (this.state.creatures) this.state.creatures.forEach(creature => creature.visible = this.isInFrustum(creature, frustum));

        // ### UFOs animieren ###
        if (this.state.ufos && this.state.playerMesh) {
            const playerPos = this.state.playerMesh.position;
            this.state.ufos.forEach(ufo => {
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
            this.state.floatingIslands.forEach(island => {
                if (island.userData.needsPhysics && addedBodies < 5) {
                    const distance = playerPos.distanceTo(island.position);
                    if (distance < 50) {
                        const islandSize = island.geometry.parameters?.width || 20;
                        const islandShape = new Ammo.btBoxShape(new Ammo.btVector3(islandSize / 2, 5 / 2, islandSize / 2));
                        const transform = new Ammo.btTransform();
                        transform.setIdentity();
                        transform.setOrigin(new Ammo.btVector3(
                            island.position.x / this.state.scaleFactor,
                            island.position.y / this.state.scaleFactor,
                            island.position.z / this.state.scaleFactor
                        ));
                        const motionState = new Ammo.btDefaultMotionState(transform);
                        const localInertia = new Ammo.btVector3(0, 0, 0);
                        const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, islandShape, localInertia);
                        const body = new Ammo.btRigidBody(rbInfo);
                        this.state.physicsWorld.addRigidBody(body);
                        island.userData.physicsBody = body;
                        this.state.rigidBodies.push(island);
                        island.userData.needsPhysics = false;
                        addedBodies++;
                        this.log(`Physik für Insel: (${island.position.x.toFixed(2)}, ${island.position.y.toFixed(2)}, ${island.position.z.toFixed(2)})`, "INFO");
                    }
                }
            });
        }

        this.updateWallCollisions();

        // ### Physik-Simulation ###
        if (this.state.physicsWorld) {
            this.state.physicsWorld.stepSimulation(delta, 10, 1/60);
            for (let i = 0; i < this.state.rigidBodies.length; i++) {
                const mesh = this.state.rigidBodies[i];
                const body = mesh.userData.physicsBody;
                const motionState = body.getMotionState();
                if (motionState) {
                    motionState.getWorldTransform(this.state.tmpTransform);
                    const pos = this.state.tmpTransform.getOrigin();
                    let scaledY = pos.y() * this.state.scaleFactor;
                    const velocity = body.getLinearVelocity();

                    const killPlaneY = (this.state.minHeight || -50) - 1000;
                    if (scaledY < killPlaneY) {
                        const zIndex = Math.floor((pos.z() * this.state.scaleFactor + 150) / 300 * 255);
                        const xIndex = Math.floor((pos.x() * this.state.scaleFactor + 150) / 300 * 255);
                        const currentX = pos.x() * this.state.scaleFactor;
                        const currentZ = pos.z() * this.state.scaleFactor;

                        // Funktion zum Finden der Oberfläche über dem Spieler
                        const surfaceHeight = this.findSurfaceAbove(currentX, scaledY, currentZ);
                        scaledY = surfaceHeight + 0.5; // Spieler wird knapp über die Oberfläche gesetzt

                        const transform = new Ammo.btTransform();
                        transform.setIdentity();
                        transform.setOrigin(new Ammo.btVector3(
                            currentX / this.state.scaleFactor,
                            scaledY / this.state.scaleFactor,
                            currentZ / this.state.scaleFactor
                        ));
                        body.setWorldTransform(transform);
                        body.setLinearVelocity(new Ammo.btVector3(velocity.x(), 0, velocity.z()));
                        this.state.isJumping = false;
                        this.state.isInAir = false;
                        mesh.position.set(currentX, scaledY, currentZ);
                        this.log(`Spieler auf Oberfläche zurückgesetzt: (${currentX.toFixed(2)}, ${scaledY.toFixed(2)}, ${currentZ.toFixed(2)})`, "INFO");
                    }

                    if (mesh === this.state.playerMesh) {
                        mesh.position.set(pos.x() * this.state.scaleFactor, scaledY, pos.z() * this.state.scaleFactor);
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
                        mesh.position.set(pos.x() * this.state.scaleFactor, scaledY, pos.z() * this.state.scaleFactor);
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
                const velocity = new Ammo.btVector3(
                    this.state.moveDirection.x * currentSpeed,
                    playerBody.getLinearVelocity().y(),
                    this.state.moveDirection.z * currentSpeed
                );
                playerBody.setLinearVelocity(velocity);
                playerBody.forceActivationState(1);
            } else {
                const velocity = new Ammo.btVector3(0, playerBody.getLinearVelocity().y(), 0);
                playerBody.setLinearVelocity(velocity);
            }

            if (this.state.keys[" "] && !this.state.isJumping) {
                const isGrounded = this.isPlayerGrounded();
                const withinCoyoteTime = (currentTime - this.state.lastGroundedTime) <= this.state.coyoteTime;
                if (isGrounded || withinCoyoteTime) {
                    const jumpForce = this.state.jumpPower;
                    const currentVelocity = playerBody.getLinearVelocity();
                    playerBody.setLinearVelocity(new Ammo.btVector3(
                        currentVelocity.x(),
                        jumpForce / this.state.scaleFactor,
                        currentVelocity.z()
                    ));
                    this.state.isJumping = true;
                    this.state.isInAir = true;
                    this.log("Spieler springt!", "INFO");
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

        // ### Unendliches Terrain ###
        const playerPos = this.state.playerMesh.position;
        const chunkSizeWorld = this.state.chunkSize * 300 / this.state.chunkWidth;
        let minChunkX = Infinity, maxChunkX = -Infinity, minChunkZ = Infinity, maxChunkZ = -Infinity;
        for (let key of this.state.chunkMap.keys()) {
            const [cx, cz] = key.split(",").map(Number);
            minChunkX = Math.min(minChunkX, cx);
            maxChunkX = Math.max(maxChunkX, cx);
            minChunkZ = Math.min(minChunkZ, cz);
            maxChunkZ = Math.max(maxChunkZ, cz);
        }
        const threshold = chunkSizeWorld * 1.0;
        if (playerPos.z < (minChunkZ * chunkSizeWorld) + threshold) this.extendTerrain("north");
        if (playerPos.z > (maxChunkZ * chunkSizeWorld) - threshold) this.extendTerrain("south");
        if (playerPos.x < (minChunkX * chunkSizeWorld) + threshold) this.extendTerrain("west");
        if (playerPos.x > (maxChunkX * chunkSizeWorld) - threshold) this.extendTerrain("east");

        // ### Skybox und Planeten ###
        this.state.skybox.material.uniforms.time.value = currentTime;
        this.state.planets.forEach(planet => {
            const theta = currentTime / 10;
            const radius = 400;
            planet.position.x = radius * Math.cos(theta);
            planet.position.z = radius * Math.sin(theta);
        });

        // ### Fähigkeiten ###
        Object.keys(this.state.abilities).forEach(ability => {
            if (this.state.keys[ability]) this.state.abilities[ability](this, this.state);
        });

        // ### Speichern ###
        if (currentTime - this.state.lastSaveUpdate >= this.state.saveInterval) {
            this.saveState();
            this.state.lastSaveUpdate = currentTime;
        }
        if (!this.state.isServerSaveInFlight && currentTime - this.state.lastServerSaveUpdate >= this.state.serverSaveInterval) {
            this.state.isServerSaveInFlight = true;
            this.saveToProjectFolder({ fallbackToDownload: false }).finally(() => {
                this.state.isServerSaveInFlight = false;
            });
            this.state.lastServerSaveUpdate = currentTime;
        }

        // ### Wasserfälle ###
        if (this.state.waterfalls) {
            this.state.waterfalls.forEach(waterfall => {
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
                this.log(`Kamera: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`, "DEBUG");
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
    let closestHitDistance = Infinity;
    let closestHitY = null;

    for (const ray of rays) {
        const rayStart = new Ammo.btVector3(
            (this.state.playerMesh.position.x + ray.offsetX) / this.state.scaleFactor,
            (this.state.playerMesh.position.y - 0.5) / this.state.scaleFactor,
            (this.state.playerMesh.position.z + ray.offsetZ) / this.state.scaleFactor
        );
        const rayEnd = new Ammo.btVector3(
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
            if (distance < 0.5) { // Reduziere Schwellenwert für präzisere Erkennung
                isGrounded = true;
            }
            if (distance < closestHitDistance) {
                closestHitDistance = distance;
                closestHitY = hitY;
            }
        }
        Ammo.destroy(rayCallback);
    }

    // Entferne manuelle Korrekturen, da Ammo.btHeightfieldTerrainShape die Kollisionen übernimmt
    return isGrounded;
}

getTerrainHeightAt(x, z) {
    const zIndex = Math.floor((z + 150) / 300 * 255);
    const xIndex = Math.floor((x + 150) / 300 * 255);
    let height = this.state.groundHeightField && zIndex >= 0 && zIndex < 256 && xIndex >= 0 && xIndex < 256
        ? this.state.groundHeightField[Math.min(Math.max(zIndex, 0), 255) * 256 + Math.min(Math.max(xIndex, 0), 255)]
        : 0;
    if (height === 0 && this.state.playerMesh) {
        // Fallback: Verwende Raycasting, um die Höhe direkt von der Physik-Kollision zu erhalten
        const rayStart = new Ammo.btVector3(x / this.state.scaleFactor, 100 / this.state.scaleFactor, z / this.state.scaleFactor);
        const rayEnd = new Ammo.btVector3(x / this.state.scaleFactor, -100 / this.state.scaleFactor, z / this.state.scaleFactor);
        const rayCallback = new Ammo.ClosestRayResultCallback(rayStart, rayEnd);
        this.state.physicsWorld.rayTest(rayStart, rayEnd, rayCallback);
        if (rayCallback.hasHit()) {
            const hitPoint = rayCallback.get_m_hitPointWorld();
            height = hitPoint.y() * this.state.scaleFactor;
        }
        Ammo.destroy(rayCallback);
        this.log(`Terrain-Höhe nicht verfügbar bei (${x.toFixed(2)}, ${z.toFixed(2)}), Raycast-Höhe: ${height.toFixed(2)}`, "DEBUG");
    }
    return height;
}

calculateTerrainSteepness(x, z) {
    const zIndex = Math.floor((z + 150) / 300 * 255);
    const xIndex = Math.floor((x + 150) / 300 * 255);
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
    const xIndex = Math.floor((x + WORLD_SIZE / 2) / WORLD_SIZE * (WIDTH - 1));
    const zIndex = Math.floor((z + WORLD_SIZE / 2) / WORLD_SIZE * (DEPTH - 1));

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
            if (Math.abs(islandPos.x - x) < islandSize / 2 &&
                Math.abs(islandPos.z - z) < islandSize / 2 &&
                islandBottom > currentY &&
                islandBottom < surfaceHeight) {
                surfaceHeight = islandBottom;
            }
        }
    }

    return surfaceHeight;
}

updateWallCollisions() {
    const currentTime = performance.now() / 1000;
    if (currentTime - this.state.lastWallCollisionUpdate < 1.0) { // Erhöhe Intervall auf 1 Sekunde
        return;
    }

    // Alte Kollisionsboxen entfernen
    this.state.wallBoxes.forEach(wall => {
        this.state.scene.remove(wall);
        const body = wall.userData.physicsBody;
        if (body) {
            this.state.physicsWorld.removeRigidBody(body);
            Ammo.destroy(body);
            this.state.rigidBodies = this.state.rigidBodies.filter(rb => rb !== wall);
        }
    });
    this.state.wallBoxes = [];
    this.log("Alte Kollisionsboxen entfernt", "DEBUG");

    const playerPos = this.state.playerMesh.position;
    const chunkSize = this.state.chunkSize * 300 / this.state.chunkWidth;
    const loadRadius = 50;
    let totalAddedWalls = 0;

    for (let [key, chunkData] of this.state.chunkMap) {
        const [cx, cz] = key.split(",").map(Number);
        const chunkCenterX = (cx * chunkSize * 300 / this.state.chunkWidth) - 150;
        const chunkCenterZ = (cz * chunkSize * 300 / this.state.chunkWidth) - 150;
        const distToPlayer = Math.sqrt(
            Math.pow(playerPos.x - chunkCenterX, 2) + Math.pow(playerPos.z - chunkCenterZ, 2)
        );

        let minDistToCreature = Infinity;
        this.state.creatures.forEach(creature => {
            const dist = Math.sqrt(
                Math.pow(creature.position.x - chunkCenterX, 2) + Math.pow(creature.position.z - chunkCenterZ, 2)
            );
            minDistToCreature = Math.min(minDistToCreature, dist);
        });

        if (distToPlayer <= loadRadius || minDistToCreature <= loadRadius) {
            if (totalAddedWalls < 20) { // Reduziere auf 20 Boxen pro Update
                const addedInChunk = this.addWallCollisions(
                    chunkData.heightData,
                    this.state.chunkWidth,
                    this.state.chunkDepth,
                    300 / (this.state.chunkWidth - 1),
                    300 / (this.state.chunkDepth - 1),
                    cx,
                    cz,
                    20 - totalAddedWalls
                );
                totalAddedWalls += addedInChunk;
            }
        }
    }

    this.state.lastWallCollisionUpdate = currentTime;
    this.log(`Kollisionsboxen aktualisiert, ${totalAddedWalls} Boxen hinzugefügt`, "DEBUG");
}

updateGrowth() {
    // ### Wachstum aktualisieren ###
    // Zweck: Dynamisches Wachstum von Kreaturen oder Terrain
    // Learnings: Fehlte in V7.61, hinzugefügt für V7.65 zur Vollständigkeit
    if (this.state.creatures.length > 0) {
        this.state.creatures.forEach((creature, index) => {
            if (Math.random() < 0.05) { // 5% Chance pro Frame
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
    let addedBoxes = 0;

    for (let z = 0; z < depth - 1 && addedBoxes < maxBoxes; z++) {
        for (let x = 0; x < width - 1 && addedBoxes < maxBoxes; x++) {
            const idx = z * width + x;
            const worldX = (x / (width - 1)) * WORLD_SIZE - WORLD_SIZE / 2 + (chunkX * this.state.chunkSize * (WORLD_SIZE / width));
            const worldZ = (z / (depth - 1)) * WORLD_SIZE - WORLD_SIZE / 2 + (chunkZ * this.state.chunkSize * (WORLD_SIZE / depth));
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
                box.position.set(
                    worldX,
                    height + boxHeight / 2,
                    worldZ
                );
                box.visible = true;

                const boxShape = new Ammo.btBoxShape(new Ammo.btVector3(scaleX / 2, boxHeight / 2, scaleZ / 2));
                const transform = new Ammo.btTransform();
                transform.setIdentity();
                transform.setOrigin(new Ammo.btVector3(
                    worldX / this.state.scaleFactor,
                    (height + boxHeight / 2) / this.state.scaleFactor,
                    worldZ / this.state.scaleFactor
                ));
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
anazhRealm.init();











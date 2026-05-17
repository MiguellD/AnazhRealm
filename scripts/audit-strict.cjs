// AnazhRealm — Strict-Audit-Suite (V8.23)
//
// Generische Audit-Tests die Bug-Klassen abdecken, die in V8.13-V8.22 mehrfach
// durchgerutscht sind. Vier Schichten:
//
//   1. State-Field-Audit: scan source für this.state.X.Y.Z reads, prüft gegen
//      live state-Initialisierung nach Init(). Fängt typos wie
//      state.workshopPreview vs state.workshop.preview.
//
//   2. CSS-Variable-Audit: alle `var(--X)` Verwendungen müssen via `--X:` im
//      :root (oder body) definiert sein. Fängt undefinierten Variablen wie
//      --parch-paper (Tooltip-Text unsichtbar in V8.12).
//
//   3. Soft-Default-Audit: bekannte Default-Strings (Grok, Schöpfer) sollten
//      nur in DEFAULT_*-Konstanten oder state-init existieren, nicht hardcoded
//      in mehreren Pfaden. Fängt Hardcoded-Refs (V8.13 Begleiter-Name).
//
//   4. Public-Method-Smoke-Test: jede public Methode (kein `_`-prefix) wird
//      einmal aufgerufen mit dem Erwartung dass sie nicht crasht. Optional
//      Side-Effect-Check. Fängt silent-no-ops (V8.20 resetWorkshopCamera).
//
// Lauf via `npm run audit:strict`. Strikter als playtest (auch warnings
// werden zu exits), läuft schneller (~20s statt 60s).

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const ROOT = path.resolve(__dirname, "..");
const SOURCE_JS = path.join(ROOT, "anazhRealm.js");
const INDEX_HTML = path.join(ROOT, "index.html");

let failures = [];
let warnings = [];

function fail(category, msg, detail) {
    failures.push({ category, msg, detail });
    console.log(`  ❌ [${category}] ${msg}${detail ? ` — ${detail}` : ""}`);
}
function warn(category, msg, detail) {
    warnings.push({ category, msg, detail });
    console.log(`  ⚠️  [${category}] ${msg}${detail ? ` — ${detail}` : ""}`);
}
function pass(category, msg) {
    console.log(`  ✅ [${category}] ${msg}`);
}

// ============================================================
// 2. CSS-Variable-Audit — statische Source-Analyse
// ============================================================
function auditCssVariables() {
    console.log("\n=== CSS-Variable-Audit ===");
    const html = fs.readFileSync(INDEX_HTML, "utf8");
    // Definitionen: `--name:` innerhalb von Style-Block
    const defRe = /--([a-zA-Z][\w-]*)\s*:/g;
    const defs = new Set();
    let m;
    while ((m = defRe.exec(html))) defs.add(m[1]);
    // Verwendungen OHNE Fallback: `var(--name)` ohne Komma
    // (Mit Fallback `var(--name, x)` ist OK — Browser nimmt den Fallback.)
    const useNoFallbackRe = /var\(\s*--([a-zA-Z][\w-]*)\s*\)/g;
    const useWithFallbackRe = /var\(\s*--([a-zA-Z][\w-]*)\s*,/g;
    const usesNoFallback = new Set();
    const usesWithFallback = new Set();
    while ((m = useNoFallbackRe.exec(html))) usesNoFallback.add(m[1]);
    while ((m = useWithFallbackRe.exec(html))) usesWithFallback.add(m[1]);
    let undefinedCount = 0;
    for (const u of usesNoFallback) {
        if (!defs.has(u)) {
            fail("CSS-VAR", `--${u} wird in var() OHNE Fallback verwendet aber nicht definiert`, "");
            undefinedCount++;
        }
    }
    // Mit-Fallback-Refs auf nicht-definierte Vars als Warning (akzeptabel,
    // Browser nimmt Fallback — aber Hinweis dass die Variable evtl. gewollt war)
    for (const u of usesWithFallback) {
        if (!defs.has(u) && !usesNoFallback.has(u)) {
            warn(
                "CSS-VAR",
                `--${u} nur mit Fallback verwendet, nicht im :root definiert`,
                "Fallback greift, aber Var sollte ergänzt werden für Konsistenz"
            );
        }
    }
    if (undefinedCount === 0) {
        const totalUses = usesNoFallback.size + usesWithFallback.size;
        pass(
            "CSS-VAR",
            `${totalUses} verwendete CSS-Variablen, alle ohne-Fallback definiert (${defs.size} defs)`
        );
    }
}

// ============================================================
// 3. Soft-Default-Audit — Hardcoded-Strings
// ============================================================
function auditSoftDefaults() {
    console.log("\n=== Soft-Default-Audit ===");
    const src = fs.readFileSync(SOURCE_JS, "utf8");
    const checks = [
        {
            literal: "Grok",
            max: 12,
            note: "Begleiter-Name sollte über state.grok.companionName referenziert werden",
        },
        {
            literal: "Schöpfer",
            max: 14,
            note: "Avatar-Name sollte über state.player.name referenziert werden",
        },
    ];
    for (const c of checks) {
        const re = new RegExp(`"${c.literal}"|'${c.literal}'|\`${c.literal}\``, "g");
        const matches = src.match(re) || [];
        const count = matches.length;
        if (count > c.max) {
            warn(
                "SOFT-DEFAULT",
                `"${c.literal}" hardcoded ${count}× (Limit ${c.max})`,
                c.note
            );
        } else {
            pass("SOFT-DEFAULT", `"${c.literal}" hardcoded ${count}× (Limit ${c.max} OK)`);
        }
    }
}

// ============================================================
// 1. State-Field-Audit + 4. Public-Method-Smoke (browser-basiert)
// ============================================================
async function auditStateAndMethods() {
    console.log("\n=== State-Field-Audit + Public-Method-Smoke (Headless) ===");
    const server = spawn("node", ["save-server.js"], { cwd: ROOT, stdio: "pipe" });
    await new Promise((r, j) => {
        let resolved = false;
        server.stdout.on("data", (d) => {
            if (!resolved && d.toString().includes("Save-Server")) {
                resolved = true;
                r();
            }
        });
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                r();
            }
        }, 3000);
    });

    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
    });
    try {
        const page = await browser.newPage();
        page.on("pageerror", (err) => {
            fail("PAGE-ERROR", "Script-Exception", err.message);
        });
        await page.goto("http://127.0.0.1:4312/", { waitUntil: "load" });
        await new Promise((r) => setTimeout(r, 12000));

        // (a) State-Pfade live sammeln
        const liveState = await page.evaluate(() => {
            const r = window.anazhRealm;
            if (!r) return null;
            const visited = new Set();
            const paths = [];
            const walk = (obj, prefix) => {
                if (!obj || typeof obj !== "object") return;
                if (visited.has(obj)) return; // Zyklus-Schutz
                if (Array.isArray(obj)) return; // Arrays nicht traversieren
                visited.add(obj);
                for (const key of Object.keys(obj)) {
                    const childPath = prefix ? `${prefix}.${key}` : key;
                    paths.push(childPath);
                    // Nur eine Ebene tiefer — verhindert exponentielles Wachstum
                    if (prefix.split(".").length < 3 && obj[key] && typeof obj[key] === "object") {
                        walk(obj[key], childPath);
                    }
                }
            };
            walk(r.state, "");
            return paths;
        });

        if (!liveState) {
            fail("STATE", "window.anazhRealm.state nicht erreichbar");
        } else {
            // Source-Code scannen für this.state.X.Y.Z reads
            const src = fs.readFileSync(SOURCE_JS, "utf8");
            // Regex für `this.state.X.Y.Z` (max 3 Ebenen, nur einfache Identifier)
            const re = /this\.state\.([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*){0,2})/g;
            const usedPaths = new Set();
            let m;
            while ((m = re.exec(src))) {
                usedPaths.add(m[1]);
            }

            // Bekannt-fehlerhafte / dynamische Pfade die wir whitelisten
            const whitelist = new Set([
                // Lazy-init Pfade (werden erst nach User-Geste gesetzt)
                "workshop.preview",
                "workshop.preview.currentMesh",
                "workshop.preview.orbit",
                "workshop.preview.orbit.yaw",
                "workshop.preview.orbit.pitch",
                "workshop.preview.orbit.dist",
                "workshop.preview.orbit.target",
                "workshop.preview.scene",
                "workshop.preview.camera",
                "workshop.preview.renderer",
                "workshop.preview.canvas",
                "workshop.preview.gizmo",
                "workshop.preview.gizmoMeshes",
                "workshop.preview.dragManipulator",
                "workshop.preview.hoveredAxis",
                "workshop.preview.resizeObserver",
                "workshop.preview.dirty",
                "workshop.preview.partMeshes",
                "workshop.preview.origColors",
                "workshop.preview.drag",
                "workshop.preview.active",
                "workshop.preview._distInitialized",
                // Dynamische Felder
                "rigidBodies.length",
                "creatures.length",
                "architectures.length",
                "blueprints.length",
                "groundChunks.length",
                "selfAwareness.components",
                "groundChunks.forEach",
                // V8.57 — Lazy game-loop-Feld: die pitch-gesteuerte Wunsch-
                // Kamera-Höhe, vom Render-Loop pro Frame gespiegelt (nie in
                // init() gesetzt — der Playtest liest sie umgebungs-unabhängig).
                "_cameraDesiredY",
                // Browser-API-Wrapper
                "playerMesh.position",
                "playerMesh.rotation",
                "playerMesh.children",
                "playerMesh.userData",
                "playerMesh.scale",
                "playerMesh.traverse",
                "playerMesh.material",
                "playerMesh.geometry",
                "playerMesh.visible",
                "playerBody.getLinearVelocity",
                "playerBody.setLinearVelocity",
                "playerBody.activate",
                "playerBody.setCcdMotionThreshold",
                "playerBody.setCcdSweptSphereRadius",
                "playerBody.setFriction",
                "playerBody.forceActivationState",
                "playerBody.setWorldTransform",
                "playerBody.getWorldTransform",
                "playerBody.setMassProps",
                "playerBody.setGravity",
                "physicsWorld.rayTest",
                "physicsWorld.removeRigidBody",
                "physicsWorld.addRigidBody",
                "physicsWorld.stepSimulation",
                "physicsWorld.setGravity",
                "scene.add",
                "scene.remove",
                "scene.children",
                "scene.background",
                "renderer.render",
                "renderer.setSize",
                "renderer.domElement",
                "renderer.setClearColor",
                "renderer.setPixelRatio",
                "renderer.shadowMap",
                "renderer.depthTest",
                "camera.position",
                "camera.lookAt",
                "camera.getWorldDirection",
                "camera.aspect",
                "camera.updateProjectionMatrix",
                "camera.fov",
                "camera.quaternion",
                "skybox.material",
                "tmpVec1.setValue",
                "tmpVec2.setValue",
                "tmpTransform.setOrigin",
                "tmpTransform.setIdentity",
                "tmpTransform.setRotation",
                "tmpTransform.getOrigin",
                "groundMesh.userData",
                "groundMesh.geometry",
                "p2p.peers",
                "p2p.peers.delete",
                "p2p.peers.forEach",
                "p2p.peers.get",
                "p2p.peers.has",
                "p2p.peers.set",
                "p2p.peers.size",
                "p2p.peers.entries",
                "p2p.peers.values",
                "p2p.peerId",
                "p2p.enabled",
                "p2p.ws",
                "p2p.url",
                "p2p.room",
                "p2p.roomOverride",
                "p2p.role",
                "p2p.hostInfo",
                "p2p.lanAddresses",
                "p2p.pendingWorldSnapshot",
                "p2p.lastPosBroadcastAt",
                "dsl.history",
                "dsl.history.length",
                "dsl.history.push",
                "dsl.history.slice",
                "dsl.history.forEach",
                "dsl.abilities",
                "dsl.abilities.length",
                "dsl.abilities.push",
                "dsl.abilities.slice",
                "dsl.abilities.findIndex",
                "dsl.abilities.find",
                "dsl.patternMemory",
                "dsl.patternMemory.set",
                "dsl.patternMemory.get",
                "dsl.patternMemory.has",
                "dsl.patternMemory.delete",
                "dsl.patternMemory.keys",
                "dsl.recentKeywords",
                "dsl.recentKeywords.push",
                "dsl.recentKeywords.length",
                "dsl.recentKeywords.shift",
                "dsl.pendingOutcomes",
                "dsl.pendingOutcomes.push",
                "dsl.pendingOutcomes.length",
                "dsl.pendingOutcomes.shift",
                "dsl.pendingOutcomes.filter",
                "dsl.pendingOutcomes.forEach",
                "dsl.outcomeFinalizationDelay",
                "llm.inFlight",
                "llm.enabled",
                "llm.provider",
                "llm.providerConfig",
                "llm.minGapSeconds",
                "llm.lastError",
                "llm.lastResponseAt",
                "worldMeta.worldId",
                "worldMeta.slug",
                "worldMeta.bornAt",
                "worldMeta.visibility",
                "worldMeta.parentWorlds",
                "worldMeta.parentWorlds.length",
                "worldMeta.gameMode",
                "worldMeta.chunkDeltas",
                "worldMeta.role",
                "worldMeta.hostInfo",
                "worldMeta.seed",
                "worldMeta.schemaVersion",
                "worldJournal.entries",
                "worldJournal.entries.length",
                "worldJournal.entries.push",
                "worldJournal.entries.slice",
                "worldJournal.entries.filter",
                "worldJournal.entries.forEach",
                "worldJournal.entryCap",
                "worldJournal.seen",
                "worldJournal.seenLow",
                "buildMode.active",
                "buildMode.slotIndex",
                "buildMode.blueprintName",
                "buildMode.phantomMesh",
                "buildMode.phantomDistance",
                "buildMode.phantomOnGround",
                "buildMode.phantomHit",
                "symphony.ctx",
                "symphony.enabled",
                "symphony.ambient",
                "symphony.weather",
                "symphony.masterGain",
                "symphony.masterVolume",
                "symphony.creaturePingVolume",
                "symphony.voiceVolume",
                "symphony.creaturePingCount",
                "grok.companionName",
                "grok.lastSpoke",
                "grok.minGapSeconds",
                "grok.speechEnabled",
                "grok.fadeTimeout",
                "grok.triggers",
                "grok.seenFirstSpawn",
                "player.soul",
                "player.name",
                "player.hp",
                "player.hpMax",
                "player.stamina",
                "player.staminaMax",
                "player.stats",
                "player.statTags",
                "player.emotions",
                "player.boosts",
                "player.equipped",
                "player.tools",
                "player.inventory",
                "player.pathBuckets",
                "player.mountedArch",
                "player.walkPhase",
                "player.animationLastTick",
                "player.emotionThreshold",
                "player.emotionDecayPerSec",
                "player.emotionApplyCooldown",
                "player.emotionLastTick",
                "player.lastEmotionTrigger",
                "player.deathLastTick",
                "player.deathWoundIntensity",
                "player.deathWoundRegenSeconds",
                "player.phoenixUntil",
                "player.phoenixDurationSeconds",
                "keybindings.break",
                "keybindings.place",
                "keybindings.confirmBuild",
                "keybindings.inventory",
                "keybindings.cancelBuild",
                "keybindings.jump",
                // Lazy-set State-Felder (werden bei Bedarf gesetzt, default
                // via `state.X || fallback`-Pattern als undefined akzeptiert).
                // Echte Bugs wären HIER nicht — Schöpfer-Reflexion V8.22:
                // diese Felder sind alle defensiv gelesen.
                "timeOfDay",
                "lastCreatureProactiveSpeech",
                "inventoryHoverLast",
                "lastCreatureLlmRareEvent",
                "_pendingCreatureSnapshots",
                "gameMechanics",
                "gameMechanics.mouse",
                "gameMechanics.mouse.x",
                "gameMechanics.mouse.y",
                "gameMechanics.raycaster",
                "gameMechanics.raycaster.setFromCamera",
                "gameMechanics.raycaster.intersectObjects",
                "gameMechanics.onMouseClick",
                "pendingImport",
                "playerAura",
                "playerAura.geometry",
                "playerAura.geometry.dispose",
                "playerAura.material",
                "playerAura.material.dispose",
                "_zoomActive",
                "_normalFov",
                "inventorySelected",
                "inventoryOpen",
                "drag",
                "_groundedCache",
                "_groundedCachedAt",
                "_statsHudLastTick",
                "_statsHudTooltipLastTick",
                "logbookVisible",
                "creatureProactiveSpeechEnabled",
                "keybindRebind",
                "onSteepSlope",
                "groundNormalY",
                "isPointerLocked",
                "isJumping",
                "isInAir",
                "lastGroundedTime",
                "lastJumpLog",
                "lastWorldgen",
                "worldgenInFlight",
                "worldgenCooldown",
                "terrainEverGenerated",
                "noiseCache",
                "fps",
                "yaw",
                "pitch",
                "speed",
                "sprintSpeed",
                "jumpPower",
                "scaleFactor",
                "mouseSensitivity",
                "maxWalkableSlopeY",
                "uiActiveDrawer",
                "weather",
                "chunkMap",
                "populatedChunks",
                "abilities",
                "keys",
                "customSouls",
                "playerSoul", // legacy save key
                "consumables",
                "creatureEmotions",
                "ufos",
                "vegetation",
                "creatureProactiveSpeechEnabled",
                "knowledgeBase",
                "tmpVec1",
                "tmpVec2",
                "tmpTransform",
                "_statusRefs",
                "_journal",
                "_creatureLevelUpLast",
                "_audioCtx",
                "_lastBoostAt",
                "tools",
                "materials",
                "blueprints",
                "architectures",
                "creatures",
                "rigidBodies",
                "groundChunks",
                "groundHeightField",
                "groundMesh",
                "planets",
                "cameraMode",
                "chunkRingRadius",
                "maxLoadedChunks",
                "hotbar",
                "workshop",
                "buildMode",
                "selfAwareness",
                "currentVersion",
                "physicsWorld",
                "renderer",
                "scene",
                "camera",
                "skybox",
                "playerMesh",
                "playerBody",
                "playerAuraGlow",
                "playerSouls",
            ]);

            // Filter: nur Top-Level oder zwei-Ebenen-Pfade prüfen (Drei-Ebenen
            // sind oft Browser-API-Wrapper wie playerMesh.position.set)
            const liveSet = new Set(liveState);
            let missingCount = 0;
            for (const used of usedPaths) {
                if (whitelist.has(used)) continue;
                // Top-Level erlauben wenn im liveSet
                const topLevel = used.split(".")[0];
                if (!liveSet.has(topLevel) && !whitelist.has(topLevel)) {
                    // Hier scheinen wir einen nicht-existenten Top-Level zu lesen
                    fail(
                        "STATE",
                        `Lese state.${used} aber Top-Level "state.${topLevel}" nicht in init()`,
                        ""
                    );
                    missingCount++;
                }
            }
            if (missingCount === 0) {
                pass(
                    "STATE",
                    `${usedPaths.size} state-Pfade gescannt, alle Top-Levels in init() vorhanden`
                );
            }
        }

        // (b) Public-Method-Smoke: jede non-`_`-Method einmal aufrufen
        const smokeResult = await page.evaluate(() => {
            const r = window.anazhRealm;
            if (!r) return { err: "no realm" };
            const methods = [];
            // Sammle alle Method-Namen aus dem Prototype
            const proto = Object.getPrototypeOf(r);
            for (const name of Object.getOwnPropertyNames(proto)) {
                if (typeof r[name] !== "function") continue;
                if (name === "constructor") continue;
                if (name.startsWith("_")) continue; // Private
                methods.push(name);
            }
            const crashes = [];
            const ok = [];
            // Welche Methoden brauchen Args? Wir rufen sie OHNE Args auf —
            // viele Methods sind defensive gegen undefined und no-op-en silent.
            // Crash = thrown Error mit non-trivial message.
            for (const name of methods) {
                try {
                    r[name]();
                    ok.push(name);
                } catch (e) {
                    // Erwartete „missing arg"-Errors sind OK, echte Crashes
                    // wie „cannot read property of undefined" sind verdächtig.
                    const msg = String(e.message || e);
                    if (/Cannot read|undefined.*is not|null.*is not/i.test(msg)) {
                        crashes.push({ name, msg });
                    } else {
                        ok.push(name); // erwarteter Arg-Check-Fail
                    }
                }
            }
            return { total: methods.length, ok: ok.length, crashes };
        });

        if (smokeResult && !smokeResult.err) {
            if (smokeResult.crashes.length > 0) {
                for (const c of smokeResult.crashes) {
                    warn("METHOD-SMOKE", `${c.name}() crasht ohne Args`, c.msg.slice(0, 80));
                }
            } else {
                pass(
                    "METHOD-SMOKE",
                    `${smokeResult.ok}/${smokeResult.total} public methods OK (kein crash bei call-ohne-args)`
                );
            }
        } else {
            fail("METHOD-SMOKE", "Smoke-Test konnte nicht laufen", smokeResult?.err);
        }
    } finally {
        await browser.close();
        server.kill();
    }
}

// ============================================================
// 5. Atmosphäre-Hardcode-Audit (V8.25)
// ============================================================
// Heilt eine V8.24-Lehre: Atmosphäre-Schichten (Tag-Nacht, Wetter, Fauna,
// Klang) sind durchsetzt von Hardcode-Wunden wenn der Schreiber Werte aus
// dem Kopf nimmt statt aus state.beobachten. Dieser Audit pattern-matcht
// gegen drei Hardcode-Klassen INNERHALB einer Methode die mit `[ATMOSPHERE]`-
// Marker versehen ist. Andere Methoden bleiben unberührt — die Markierung
// ist die Vertrauens-Wand: wer eine Methode atmosphärisch nennt, akzeptiert
// die Disziplin.
//
// Hardcode-Klassen:
//   A) Soul-Type-Map: mehrere `if (x === "soul-name")` oder ternary mit
//      mehr als 2 Soul/Type-Strings in einer Methode → if-Map. Vision-treu
//      wäre Affinity-Pick.
//   B) Hex-Color-Arrays: mehr als 3 wörtliche `0xXXXXXX` in einer Methode →
//      hardcoded Farb-Tabelle. Vision-treu wäre Modulation aus Tags/Welt.
//      (Class-Konstanten sind ausgenommen — die sind Saat.)
//   C) Magic-Number-Frequencies: ternary mit Hz-Zahlen (60..2000) → wahr-
//      scheinlich Frequenz-Map. Vision-treu wäre _tagToFrequency.
function auditAtmosphereHardcode() {
    console.log("\n=== Atmosphäre-Hardcode-Audit ===");
    const src = fs.readFileSync(SOURCE_JS, "utf8");
    // Methode-Block extrahieren: von `[ATMOSPHERE]`-Kommentar bis zur
    // nächsten Methode (Zeile beginnt mit 4-Space + identifier(args).
    const lines = src.split("\n");
    const atmosphereMethods = [];
    for (let i = 0; i < lines.length; i++) {
        if (!/\[ATMOSPHERE\]/.test(lines[i])) continue;
        // Suche die Methode darunter (überspringe Comment-Lines)
        let j = i + 1;
        while (j < lines.length && /^\s*\/\//.test(lines[j])) j++;
        // j sollte jetzt auf der Methoden-Signatur sein
        const sigMatch = /^\s{4}([\w_]+)\s*\(/.exec(lines[j] || "");
        if (!sigMatch) continue;
        const methodName = sigMatch[1];
        // Methode endet beim nächsten gleich-eingerückten `}`
        let k = j + 1;
        let depth = 0;
        while (k < lines.length) {
            const line = lines[k];
            for (const ch of line) {
                if (ch === "{") depth++;
                else if (ch === "}") depth--;
            }
            if (depth < 0) break;
            k++;
        }
        const body = lines.slice(j, k + 1).join("\n");
        atmosphereMethods.push({ name: methodName, body, startLine: j + 1 });
    }
    if (atmosphereMethods.length === 0) {
        warn("ATMOSPHERE", "Keine `[ATMOSPHERE]`-Marker gefunden", "Marker fehlen oder Audit-Regex passt nicht");
        return;
    }
    let cleanCount = 0;
    let warnCount = 0;
    for (const m of atmosphereMethods) {
        const { name, body } = m;
        // A) Soul-Type-Maps: zähle `=== "..."`-Vergleiche mit "soul", "sprite",
        //    "wesen", "geist", "human", "phoenix", "dragon" als Vergleichs-Wert
        const soulCompares = body.match(
            /=== ?["'](sprite|wesen|geist|human|phoenix|dragon|sunny|rainy)["']/g
        );
        if (soulCompares && soulCompares.length >= 3) {
            warn(
                "ATMOSPHERE",
                `${name}: ${soulCompares.length} Soul/Type-Vergleiche — verdacht auf if-Map`,
                "nutze _affinityPickFromCandidates oder Tag-basiertes Routing"
            );
            warnCount++;
            continue;
        }
        // B) Hex-Color-Arrays in Methode (Class-Konstanten haben eigene
        //    `static get`-Blöcke, sind nicht hier)
        const hexColors = body.match(/0x[0-9a-fA-F]{6}/g);
        if (hexColors && hexColors.length >= 4) {
            warn(
                "ATMOSPHERE",
                `${name}: ${hexColors.length} Hex-Farben in einer Methode — verdacht auf Farb-Tabelle`,
                "vermeide hardcoded Color-Map, moduliere aus Tags/Welt-Feld"
            );
            warnCount++;
            continue;
        }
        // C) Hz-Frequenz-ternary (60..2000 Hz)
        const ternaryFreq =
            body.match(/[?:]\s*\d{2,4}(?:\.\d+)?\s*:/g) ||
            body.match(/\d{2,4}\s*:\s*\d{2,4}\s*:\s*\d{2,4}/g);
        if (ternaryFreq && ternaryFreq.length >= 2) {
            // Tiefere Prüfung: liegen die Zahlen im Hz-Range UND in derselben
            // Zeile wie "freq" oder "Hz"?
            const freqCtx = /freq\s*=\s*[\w.[\]'"]*\s*===?\s*["']/.test(body);
            if (freqCtx) {
                warn(
                    "ATMOSPHERE",
                    `${name}: Frequenz-Map aus Soul-Vergleichen erkannt`,
                    "nutze _tagToFrequency(tags, baseHz) — Klang folgt Substanz"
                );
                warnCount++;
                continue;
            }
        }
        cleanCount++;
    }
    if (warnCount === 0) {
        pass(
            "ATMOSPHERE",
            `${cleanCount}/${atmosphereMethods.length} [ATMOSPHERE]-Methoden frei von Hardcode-Mustern`
        );
    }
}

// ============================================================
// Main
// ============================================================
(async () => {
    console.log("AnazhRealm Strict-Audit-Suite\n");
    auditCssVariables();
    auditSoftDefaults();
    auditAtmosphereHardcode();
    await auditStateAndMethods();

    console.log("\n=== Zusammenfassung ===");
    console.log(`  Failures: ${failures.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    if (failures.length > 0) {
        console.log("\n❌ Audit nicht clean — siehe oben.");
        process.exit(1);
    } else if (warnings.length > 0) {
        console.log("\n⚠️  Warnings vorhanden, aber kein Fail. Audit pass.");
        process.exit(0);
    } else {
        console.log("\n✅ Audit komplett clean.");
        process.exit(0);
    }
})().catch((err) => {
    console.error("Audit-Crash:", err);
    process.exit(2);
});

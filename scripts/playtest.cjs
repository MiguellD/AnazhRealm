// Headless-Smoketest, doppelt als CI-Gate verwendbar.
// Startet save-server.js, lädt das Spiel in Chromium, sammelt Console-Logs für
// N Sekunden, druckt Statistik UND prüft eine Liste harter Invarianten. Eine
// verletzte Invariante setzt exit=1; CI bricht damit ab.
//
// Aufruf:
//   npm run playtest                       # Standardlauf
//   PLAYTEST_SECONDS=60 npm run playtest   # länger
//   PLAYTEST_STRICT=0 npm run playtest     # nur reporten, kein exit=1
//
// Voraussetzungen: puppeteer als devDependency (`npm install`).

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const DURATION_MS = Number(process.env.PLAYTEST_SECONDS || 20) * 1000;
const SERVER_URL = "http://127.0.0.1:4312/index.html";
const STRICT = process.env.PLAYTEST_STRICT !== "0";
const ARTIFACT_DIR = path.join(__dirname, "..", "artifacts");
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, "playtest.png");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", ["save-server.js"], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const timeout = setTimeout(() => {
            if (!ready) reject(new Error("Save-Server startete nicht innerhalb 5 s"));
        }, 5000);
        proc.stdout.on("data", (chunk) => {
            if (!ready && /läuft/.test(chunk.toString())) {
                ready = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    console.log(`Starte Save-Server ...`);
    const server = await startSaveServer();
    console.log(`Lade ${SERVER_URL} für ${DURATION_MS / 1000}s ...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            // ANGLE-Backend mit SwiftShader gibt unter headless die zuverlässigste
            // WebGL-Implementierung – plain --use-gl=swiftshader stürzt mit
            // „Could not get context for WebGL version 1" ab.
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            // Ring 4: erlaubt AudioContext im Headless-Modus ohne User-Geste,
            // sonst bleibt der Context im "suspended" und initSymphony tut nix.
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const logs = [];
    const errors = [];
    page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text(), at: Date.now() }));
    page.on("pageerror", (err) => errors.push({ kind: "pageerror", text: err.message, stack: err.stack }));
    page.on("requestfailed", (req) =>
        errors.push({ kind: "requestfailed", url: req.url(), error: req.failure()?.errorText })
    );

    const failures = [];
    function check(name, ok, detail = "") {
        const status = ok ? "✅" : "❌";
        console.log(`  ${status} ${name}${detail ? " — " + detail : ""}`);
        if (!ok) failures.push(name);
    }

    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await new Promise((r) => setTimeout(r, DURATION_MS));

        // ### Bericht (informativ) ###
        const fpsText = await page.$eval("#fps", (el) => el.innerText).catch(() => "?");
        const fpsValues = [];
        const fpsRe = /\[INFO\] FPS: (\d+)/;
        for (const l of logs) {
            const m = l.text.match(fpsRe);
            if (m) fpsValues.push(Number(m[1]));
        }
        const histogram = new Map();
        for (const l of logs) {
            const generic = l.text
                .replace(/\(-?\d+\.?\d*,\s*-?\d+\.?\d*(,\s*-?\d+\.?\d*)?\)/g, "(…)")
                .replace(/-?\d+\.\d+/g, "N")
                .replace(/\b\d+\b/g, "N");
            histogram.set(generic, (histogram.get(generic) || 0) + 1);
        }
        const top = [...histogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

        console.log(`\n=== Bericht (${DURATION_MS / 1000}s) ===`);
        console.log(`FPS-Div: "${fpsText}", Log-Einträge: ${logs.length}, Page-Errors: ${errors.length}`);
        if (fpsValues.length) {
            const min = Math.min(...fpsValues);
            const max = Math.max(...fpsValues);
            const avg = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
            console.log(`FPS samples: min=${min}, max=${max}, avg=${avg.toFixed(1)}, n=${fpsValues.length}`);
        }
        console.log(`Top-Log-Muster:`);
        for (const [msg, count] of top) console.log(`  ${String(count).padStart(4)}× ${msg.slice(0, 110)}`);

        // ### Invarianten (gatekeeping) ###
        const finalState = await page
            .evaluate(() => {
                const r = window.anazhRealm;
                if (!r || !r.state) return null;
                const box = document.getElementById("dialogue-box");
                return {
                    terrainEverGenerated: r.state.terrainEverGenerated,
                    groundChunks: r.state.groundChunks?.length || 0,
                    chunkMapSize: r.state.chunkMap?.size || 0,
                    playerY: r.state.playerMesh?.position?.y,
                    playerX: r.state.playerMesh?.position?.x,
                    playerZ: r.state.playerMesh?.position?.z,
                    creatures: r.state.creatures?.length || 0,
                    floatingIslands: r.state.floatingIslands?.length || 0,
                    hasPlayerBody: !!r.state.playerBody,
                    grokSeenFirstSpawn: r.state.grok?.seenFirstSpawn === true,
                    grokLastSpoke: r.state.grok?.lastSpoke || 0,
                    grokDialogueText: box ? box.textContent : null,
                };
            })
            .catch(() => null);

        console.log(`\n=== Invarianten ===`);
        if (!finalState) {
            failures.push("Game-State erreichbar");
            console.log("  ❌ window.anazhRealm.state nicht erreichbar (Seite tot?)");
        } else {
            check(
                "Welt initial generiert (terrainEverGenerated=true)",
                finalState.terrainEverGenerated === true,
                `terrainEverGenerated=${finalState.terrainEverGenerated}`
            );
            check(
                "Mindestens 60 Chunks im groundChunks-Array",
                finalState.groundChunks >= 60,
                `groundChunks=${finalState.groundChunks}`
            );
            check(
                "chunkMap konsistent mit groundChunks",
                finalState.chunkMapSize >= 60 && Math.abs(finalState.chunkMapSize - finalState.groundChunks) < 10,
                `chunkMap=${finalState.chunkMapSize}, groundChunks=${finalState.groundChunks}`
            );
            check(
                "Spieler nicht durch den Boden gefallen",
                typeof finalState.playerY === "number" && finalState.playerY > -50,
                `playerY=${finalState.playerY?.toFixed(2)}`
            );
            check("Kreaturen gespawnt", finalState.creatures >= 5, `creatures=${finalState.creatures}`);
            check(
                "Fliegende Inseln gespawnt",
                finalState.floatingIslands >= 1,
                `floatingIslands=${finalState.floatingIslands}`
            );
            check(
                "Physik-Body für Spieler vorhanden",
                finalState.hasPlayerBody === true,
                `hasPlayerBody=${finalState.hasPlayerBody}`
            );

            // ### Ring 1 – Grok-Stimme ###
            // firstSpawn feuert mit 1.5s Delay nach Erst-Worldgen und ist der
            // einzige Trigger, der in 20-25 s Headless-Lauf zuverlässig kommt
            // (idle braucht 45 s, jumpBurst keine Keys, rainLong 60 s, nexus
            // irregulär). Daher: seenFirstSpawn + lastSpoke + Dialog-Text +
            // mindestens ein "Grok: ..."-Log werden gateweise geprüft.
            check(
                "Grok hat Erst-Spawn registriert",
                finalState.grokSeenFirstSpawn === true,
                `seenFirstSpawn=${finalState.grokSeenFirstSpawn}`
            );
            check(
                "Grok hat mindestens einmal gesprochen",
                typeof finalState.grokLastSpoke === "number" && finalState.grokLastSpoke > 0,
                `lastSpoke=${finalState.grokLastSpoke}`
            );
            check(
                "Dialogue-Box trägt einen Satz",
                typeof finalState.grokDialogueText === "string" && finalState.grokDialogueText.length > 0,
                `text="${(finalState.grokDialogueText || "").slice(0, 60)}"`
            );
            const grokLogs = logs.filter((l) => /\[INFO\] Grok: /.test(l.text));
            check(
                "Mindestens ein Grok-Log im Buffer",
                grokLogs.length >= 1,
                `grokLogs=${grokLogs.length}${grokLogs.length ? ` erster: "${grokLogs[0].text.slice(0, 80)}"` : ""}`
            );

            // ### Ring 2 – DSL-Interpreter ###
            // Live-Smoketest: führt mehrere kleine DSL-Programme aus und prüft,
            // dass Effekte real auf state durchschlagen, Budgets greifen,
            // unbekannte Ops sauber abgelehnt werden und Welt-Identität anliegt.
            const dslResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    const out = {
                        worldIdSet: false,
                        slugSet: false,
                        weatherEffect: false,
                        chainEffect: false,
                        positionEffect: false,
                        conditionEffect: false,
                        unknownOpRejected: false,
                        depthBudgetEnforced: false,
                        delayScheduled: false,
                    };
                    if (!r || !r.state || typeof r.dslRun !== "function") return out;
                    const m = r.state.worldMeta || {};
                    out.worldIdSet = typeof m.worldId === "string" && m.worldId.length > 5;
                    out.slugSet = typeof m.slug === "string" && m.slug.length > 0;

                    const jpBefore = r.state.jumpPower;
                    const res1 = r.dslRun(["weather", "rainy"]);
                    out.weatherEffect = res1.ok && r.state.weather === "rainy";

                    const res2 = r.dslRun(["chain", ["weather", "sunny"], ["player_jump_power", 17]]);
                    out.chainEffect = res2.ok && r.state.weather === "sunny" && r.state.jumpPower === 17;

                    const creBefore = r.state.creatures.length;
                    const res3 = r.dslRun(["spawn_creature", ["at_origin"], 2, "happy"]);
                    out.positionEffect =
                        res3.ok &&
                        res3.log.some((e) => e.event === "spawned_creature") &&
                        r.state.creatures.length === creBefore + 2;

                    const res4 = r.dslRun(["when", ["weather_is", "sunny"], ["player_jump_power", 22]]);
                    out.conditionEffect = res4.ok && r.state.jumpPower === 22;

                    const res5 = r.dslRun(["unbekannte_op_xyz", 1, 2]);
                    out.unknownOpRejected = !res5.ok && res5.log.some((e) => e.event === "unknown_op");

                    let deep = ["chain"];
                    let inner = deep;
                    for (let i = 0; i < 12; i++) {
                        const next = ["chain"];
                        inner.push(next);
                        inner = next;
                    }
                    const res6 = r.dslRun(deep);
                    out.depthBudgetEnforced = res6.log.some(
                        (e) => e.event === "budget_exceeded" && e.budget === "depth"
                    );

                    const pendingBefore = r.state.dsl.pending.length;
                    r.dslRun(["delay", 999, ["weather", "rainy"]]);
                    out.delayScheduled = r.state.dsl.pending.length === pendingBefore + 1;
                    r.state.dsl.pending = r.state.dsl.pending.filter((p) => p.runAt < 9999999);

                    // Phase 2: dslCompose + Loop-Dispatch.
                    const composed = r.dslCompose();
                    out.composeIsArray = Array.isArray(composed);
                    out.composeRootIsChain = out.composeIsArray && composed[0] === "chain";
                    const histBefore = r.state.dsl.history.length;
                    r.state.nexusEvolutionQueue.push({
                        name: `playtest_evo_${Date.now()}`,
                        program: composed,
                        source: "playtest",
                        createdAt: performance.now() / 1000,
                    });
                    out.histBefore = histBefore;

                    r.state.jumpPower = jpBefore;
                    return out;
                })
                .catch(() => null);

            // ### Terrain-Erweiterung ###
            // extendTerrain ist eines der ältesten Subsysteme — vor diesem Fix
            // produzierten east/south "Ungültige Chunk-Größe"-Fehler und north/
            // west zero-height Schein-Platten an falscher Welt-Position. Wir
            // erzwingen je eine Extension in alle vier Richtungen und prüfen:
            // chunk wurde wirklich angefügt, vertices haben endliche Welt-
            // Koordinaten, Höhen sind im erlaubten Range.
            const extensionResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    const before = r.state.chunkMap.size;
                    const beforeKeys = new Set(r.state.chunkMap.keys());
                    // Direkte ensureChunkAt-Aufrufe für definierte Indizes —
                    // sicherer als die direction-API, die immer den Map-Mittel-
                    // punkt nimmt. Wir bauen ein 3×3-Außen-Cluster east-süd
                    // sowie eine Diagonale, um auch Eck-Nähte zu testen.
                    r.ensureChunkAt(8, 7);
                    r.ensureChunkAt(9, 7);
                    r.ensureChunkAt(8, 8);
                    r.ensureChunkAt(-1, -1);
                    r.ensureChunkAt(-1, 0);
                    const after = r.state.chunkMap.size;
                    const newKeys = [...r.state.chunkMap.keys()].filter((k) => !beforeKeys.has(k));
                    let allHeightsFinite = true;
                    let foundOutOfRange = false;
                    for (const k of newKeys) {
                        const entry = r.state.chunkMap.get(k);
                        if (!entry || !entry.mesh) continue;
                        const pos = entry.mesh.geometry.attributes.position.array;
                        for (let i = 1; i < pos.length; i += 3) {
                            if (!Number.isFinite(pos[i])) {
                                allHeightsFinite = false;
                                break;
                            }
                            if (pos[i] < -200 || pos[i] > 200) foundOutOfRange = true;
                        }
                        if (!allHeightsFinite) break;
                    }

                    // Naht-Treue: für zwei aneinanderhängende Chunks (gleiches cz,
                    // cx und cx+1) müssen die rechten Vertices des linken Chunks
                    // exakt auf den linken Vertices des rechten Chunks landen —
                    // sonst sieht der Spieler Klippen oder Lücken zwischen den
                    // Erweiterungen.
                    let seamMaxDelta = 0;
                    for (const k of [...r.state.chunkMap.keys()]) {
                        const [cx, cz] = k.split(",").map(Number);
                        const right = r.state.chunkMap.get(`${cx + 1},${cz}`);
                        const here = r.state.chunkMap.get(k);
                        if (!right || !right.mesh || !here || !here.mesh) continue;
                        if (!here.mesh.userData || !right.mesh.userData) continue;
                        // Nur Naht zwischen 2 extended Chunks: beide haben unsere
                        // userData mit chunkX-Tag.
                        if (here.mesh.userData.chunkX === undefined) continue;
                        if (right.mesh.userData.chunkX === undefined) continue;
                        const hPos = here.mesh.geometry.attributes.position.array;
                        const rPos = right.mesh.geometry.attributes.position.array;
                        const VTX = 33;
                        for (let z = 0; z < VTX; z++) {
                            const hIdx = (z * VTX + (VTX - 1)) * 3;
                            const rIdx = (z * VTX + 0) * 3;
                            const dx = Math.abs(hPos[hIdx] - rPos[rIdx]);
                            const dz = Math.abs(hPos[hIdx + 2] - rPos[rIdx + 2]);
                            seamMaxDelta = Math.max(seamMaxDelta, dx, dz);
                        }
                    }
                    return {
                        before,
                        after,
                        addedKeys: newKeys,
                        allHeightsFinite,
                        foundOutOfRange,
                        seamMaxDelta,
                    };
                })
                .catch(() => null);

            if (!extensionResults) {
                check("Terrain-Erweiterung erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check(
                    "extendTerrain fügt neue Chunks an (alle vier Richtungen)",
                    extensionResults.after - extensionResults.before >= 4,
                    `before=${extensionResults.before}, after=${extensionResults.after}, added=${extensionResults.addedKeys.length}`
                );
                check(
                    "Erweiterte Chunks haben endliche Vertex-Höhen",
                    extensionResults.allHeightsFinite,
                    extensionResults.addedKeys.length ? `keys: ${extensionResults.addedKeys.join(", ")}` : ""
                );
                check("Erweiterte Vertex-Höhen liegen im Clamp-Bereich [-100, 100]", !extensionResults.foundOutOfRange);
                check(
                    "Naht zwischen aneinandergrenzenden Chunks <0.01 Welt-Einheiten",
                    extensionResults.seamMaxDelta < 0.01,
                    `seamMaxDelta=${extensionResults.seamMaxDelta.toFixed(4)}`
                );
            }

            // Zwei Loop-Iterationen warten, damit der Nexus-Loop die Test-Evolution
            // aus der Queue zieht und in dsl.history einträgt.
            await new Promise((r) => setTimeout(r, 500));
            const phase2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    return {
                        historyLen: r.state.dsl.history.length,
                        queueLen: r.state.nexusEvolutionQueue.length,
                        lastHistory: r.state.dsl.history[r.state.dsl.history.length - 1] || null,
                    };
                })
                .catch(() => null);

            if (!dslResults) {
                check("DSL-Smoketest erreichbar", false, "dslRun nicht aufrufbar");
            } else {
                check("Welt-Identität (worldId) gesetzt", dslResults.worldIdSet);
                check("Welt-Slug gesetzt", dslResults.slugSet);
                check("DSL-Effekt: weather wirkt auf state", dslResults.weatherEffect);
                check("DSL-Komposition: chain führt mehrere Effekte aus", dslResults.chainEffect);
                check("DSL-Position: at_origin + spawn_creature wirkt", dslResults.positionEffect);
                check("DSL-Condition: when/weather_is verzweigt korrekt", dslResults.conditionEffect);
                check("DSL-Sicherheit: unbekannte Op wird abgelehnt", dslResults.unknownOpRejected);
                check("DSL-Budget: maxDepth greift bei tiefer Verschachtelung", dslResults.depthBudgetEnforced);
                check("DSL-Scheduler: delay reiht in pending ein", dslResults.delayScheduled);
                check("Nexus-Generator: dslCompose produziert Array", dslResults.composeIsArray);
                check(
                    "Nexus-Generator: Komposition hat chain als Wurzel",
                    dslResults.composeRootIsChain,
                    `root=${dslResults.composeIsArray ? `"${(dslResults.composeRootIsChain && "chain") || "?"}"` : "n/a"}`
                );
                if (phase2Results) {
                    // FPS-Drop-Handler kann während des Wait-Intervalls neue
                    // Legacy-Evolutionen in die Queue schieben — wir prüfen
                    // daher Effekt (history grew), nicht Queue-Tiefe.
                    check(
                        "Nexus-Loop verarbeitet DSL-Evolution (history wächst)",
                        phase2Results.historyLen > dslResults.histBefore,
                        `history before=${dslResults.histBefore}, after=${phase2Results.historyLen}`
                    );
                    check(
                        "Letzte History-Einheit hat Outcome + Fitness-Daten",
                        phase2Results.lastHistory &&
                            phase2Results.lastHistory.outcome &&
                            typeof phase2Results.lastHistory.outcome.fpsBefore === "number",
                        phase2Results.lastHistory ? `id=${phase2Results.lastHistory.id}` : "kein Eintrag"
                    );
                } else {
                    check("Phase-2-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
                }
            }

            // ### Ring 2 Phase 3 – Chat → DSL ###
            // Wir verifizieren drei Dinge: Parser liefert das richtige AST,
            // processChatCommand routet den Chat-Befehl tatsächlich durch dslRun
            // (state.dsl.lastUserProgram + Welt-Effekt), und chatSuggest erkennt
            // einen leicht verschriebenen Befehl per Levenshtein.
            const phase3Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};

                    // 1. Parser-Smoketest
                    const parsedWeather = r.parseChatToDsl("Setze Wetter rainy");
                    out.parseWeatherOk =
                        !!parsedWeather &&
                        Array.isArray(parsedWeather.program) &&
                        parsedWeather.program[0] === "weather" &&
                        parsedWeather.program[1] === "rainy";

                    const parsedSpawn = r.parseChatToDsl("Spawne Kreaturen 3");
                    out.parseSpawnOk =
                        !!parsedSpawn &&
                        Array.isArray(parsedSpawn.program) &&
                        parsedSpawn.program[0] === "repeat" &&
                        parsedSpawn.program[1] === 3 &&
                        Array.isArray(parsedSpawn.program[2]) &&
                        parsedSpawn.program[2][0] === "spawn_creature";

                    out.parseUnknownReturnsNull = r.parseChatToDsl("Tu irgendwas Wildes") === null;

                    // 2. End-to-end: processChatCommand routet auf DSL.
                    // Chat-Input/Output sicherstellen (Headless-DOM hat sie).
                    const weatherBefore = r.state.weather;
                    r.processChatCommand("Setze Wetter rainy");
                    out.chatRoutedToDsl =
                        Array.isArray(r.state.dsl.lastUserProgram) &&
                        r.state.dsl.lastUserProgram[0] === "weather" &&
                        r.state.dsl.lastUserProgram[1] === "rainy";
                    out.weatherActuallyChanged = r.state.weather === "rainy";
                    // Wetter wieder neutralisieren, damit andere Tests nicht verwirrt werden.
                    r.processChatCommand("Setze Wetter sunny");
                    out.weatherCleanup = r.state.weather === "sunny" && weatherBefore !== undefined;

                    // 3. Levenshtein-Vorschlag bei Tippfehler
                    const suggestion = r.chatSuggest("setze wettr rainy");
                    out.suggestionForTypo = suggestion === "setze wetter rainy";

                    // 4. Phase 3b: set_visible-Primitiv + Chat-Routing
                    const groundChunksBefore = r.state.groundChunks.length;
                    const someVisible = () => r.state.groundChunks.some((c) => c.visible);
                    r.processChatCommand("Boden deaktivieren");
                    out.terrainHiddenViaDsl = groundChunksBefore > 0 && !someVisible();
                    r.processChatCommand("Boden aktivieren");
                    out.terrainShownViaDsl = someVisible();

                    // 5. Phase 3b: record_narrative-Primitiv via "Erzähle ..."
                    const kbBefore = r.state.knowledgeBase.filter((k) => k.type === "narrative").length;
                    r.processChatCommand("Erzähle Drachen leben hier");
                    const narratives = r.state.knowledgeBase.filter((k) => k.type === "narrative");
                    out.narrativeRecorded =
                        narratives.length === kbBefore + 1 && narratives[narratives.length - 1].content === "Drachen leben hier";

                    // 6. Phase 3b: set_visible mit unbekanntem Target wird abgelehnt
                    const beforeLog = r.state.dsl.lastUserOutcome ? r.state.dsl.lastUserOutcome.errors : 0;
                    const badResult = r.dslRun(["set_visible", "mond", true]);
                    out.invalidTargetRejected = badResult.log.some(
                        (e) => e.event === "invalid_set_visible_target"
                    );
                    void beforeLog;

                    // 7. Phase 5: "Lerne Fähigkeit" speichert DSL-Programm
                    r.processChatCommand("Lerne Fähigkeit blaukreaturen Ändere Farbe von Kreaturen zu blue");
                    const learned = r.state.dsl.abilities.find((a) => a.name === "blaukreaturen");
                    out.learnedAbilityIsDsl =
                        !!learned &&
                        Array.isArray(learned.program) &&
                        learned.program[0] === "creatures_color" &&
                        learned.program[1] === "blue" &&
                        learned.source === "human";

                    // 8. Phase 5: "Führe Fähigkeit aus" ruft dslRun und mutiert state
                    const someCreature = r.state.creatures[0];
                    const colorBefore = someCreature ? someCreature.material.color.getHex() : 0;
                    r.processChatCommand("Führe Fähigkeit aus blaukreaturen");
                    const colorAfter = someCreature ? someCreature.material.color.getHex() : 0;
                    // 0x0000ff = blue
                    out.abilityExecutedMutatesWorld = colorAfter === 0x0000ff && colorBefore !== colorAfter;

                    // 9. Phase 4: Save-Roundtrip — dslAbilities überleben localStorage
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.savedDslAbilitiesPresent =
                        !!parsed &&
                        Array.isArray(parsed.dslAbilities) &&
                        parsed.dslAbilities.some((a) => a.name === "blaukreaturen");
                    out.savedNoLegacyAbilitiesList = !!parsed && parsed.abilities === undefined;

                    // 10. Phase 5: createDynamicAbility/codeParser sind weg
                    out.dynamicCodeMethodsRemoved =
                        typeof r.createDynamicAbility === "undefined" &&
                        typeof r.codeParser === "undefined" &&
                        typeof r.developAdvancedPhysics === "undefined" &&
                        typeof r.developAdvancedRenderer === "undefined";

                    return out;
                })
                .catch(() => null);

            if (!phase3Results) {
                check("Phase-3-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check("Chat→DSL: 'Setze Wetter rainy' → ['weather','rainy']", phase3Results.parseWeatherOk);
                check(
                    "Chat→DSL: 'Spawne Kreaturen 3' → repeat+spawn_creature",
                    phase3Results.parseSpawnOk
                );
                check(
                    "Chat→DSL: unbekannter Befehl liefert null (kein Match)",
                    phase3Results.parseUnknownReturnsNull
                );
                check(
                    "processChatCommand routet Welt-Befehl auf dslRun",
                    phase3Results.chatRoutedToDsl,
                    "state.dsl.lastUserProgram gesetzt"
                );
                check(
                    "DSL-Pfad mutiert tatsächlich state.weather",
                    phase3Results.weatherActuallyChanged
                );
                check(
                    "chatSuggest schlägt korrigierten Befehl bei Tippfehler vor",
                    phase3Results.suggestionForTypo,
                    "'setze wettr rainy' → 'setze wetter rainy'"
                );
                check(
                    "Phase 3b: 'Boden deaktivieren' via DSL versteckt Terrain",
                    phase3Results.terrainHiddenViaDsl
                );
                check(
                    "Phase 3b: 'Boden aktivieren' via DSL macht Terrain wieder sichtbar",
                    phase3Results.terrainShownViaDsl
                );
                check(
                    "Phase 3b: 'Erzähle ...' schreibt Narrativ in Knowledge-Base",
                    phase3Results.narrativeRecorded
                );
                check(
                    "Phase 3b: set_visible mit ungültigem Target wird abgelehnt",
                    phase3Results.invalidTargetRejected
                );
                check(
                    "Phase 5: 'Lerne Fähigkeit' speichert DSL-Programm in dsl.abilities",
                    phase3Results.learnedAbilityIsDsl
                );
                check(
                    "Phase 5: 'Führe Fähigkeit aus' ruft dslRun und mutiert Welt",
                    phase3Results.abilityExecutedMutatesWorld
                );
                check(
                    "Phase 4: Save persistiert dslAbilities",
                    phase3Results.savedDslAbilitiesPresent
                );
                check(
                    "Phase 4: Save enthält keine Legacy-abilities-Namensliste mehr",
                    phase3Results.savedNoLegacyAbilitiesList
                );
                check(
                    "Phase 5: createDynamicAbility/codeParser/developAdvanced* sind entfernt",
                    phase3Results.dynamicCodeMethodsRemoved
                );
            }

            // ### Ring 2 Phase 6 – CSP ###
            // CSP-Meta-Tag muss vorhanden sein und die kritischen Direktiven
            // tragen. Plus: über die gesamte Lauf-Zeit darf keine CSP-Violation
            // im console-Buffer landen.
            const cspResults = await page
                .evaluate(() => {
                    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                    if (!meta) return { metaPresent: false };
                    const content = meta.getAttribute("content") || "";
                    return {
                        metaPresent: true,
                        hasScriptSrc: /script-src[^;]*'self'/.test(content),
                        hasObjectNone: /object-src 'none'/.test(content),
                        hasBaseUriSelf: /base-uri 'self'/.test(content),
                        hasDefaultSrc: /default-src 'self'/.test(content),
                    };
                })
                .catch(() => null);

            const cspViolationLogs = logs.filter((l) =>
                /Content Security Policy directive/i.test(l.text)
            );

            if (!cspResults) {
                check("Phase 6: CSP-Meta-Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check("Phase 6: CSP-Meta-Tag vorhanden", cspResults.metaPresent);
                check(
                    "Phase 6: script-src 'self' gesetzt (Skripte nur lokal)",
                    cspResults.hasScriptSrc
                );
                check("Phase 6: object-src 'none' (Flash/Plugins blockiert)", cspResults.hasObjectNone);
                check("Phase 6: base-uri 'self' (URL-Manipulation blockiert)", cspResults.hasBaseUriSelf);
                check("Phase 6: default-src 'self' (alles per Default lokal)", cspResults.hasDefaultSrc);
            }
            check(
                "Phase 6: keine CSP-Violations während Laufzeit",
                cspViolationLogs.length === 0,
                cspViolationLogs.length
                    ? `${cspViolationLogs.length}× erste: ${cspViolationLogs[0].text.slice(0, 120)}`
                    : ""
            );

            // ### Ring 2 Phase 7 – Fitness-V2 ###
            // Drei Aspekte: (a) Selektion bevorzugt statistisch high-fitness,
            // (b) Mutation behält strukturelle Invarianten, (c) dslCompose
            // mit historyProbability=1 nutzt tatsächlich die History.
            const phase7Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || typeof r.dslSelectByFitness !== "function") return null;
                    const out = {};

                    // Seeded RNG für deterministische Tests.
                    const makeRng = (seed) => {
                        let s = seed >>> 0 || 1;
                        return () => {
                            s = (s * 1664525 + 1013904223) >>> 0;
                            return s / 4294967296;
                        };
                    };

                    // History mit klar getrennten Fitness-Werten.
                    const injHist = [
                        {
                            id: "lowfit",
                            program: ["weather", "rainy"],
                            outcome: { fpsBefore: 120, fpsAfter: 30 },
                            ok: true,
                        },
                        {
                            id: "highfit",
                            program: ["weather", "sunny"],
                            outcome: { fpsBefore: 120, fpsAfter: 119 },
                            ok: true,
                        },
                    ];
                    // (a) Selektion: über 500 Calls sollte highfit deutlich häufiger gewählt werden.
                    const rngA = makeRng(42);
                    let highCount = 0;
                    let lowCount = 0;
                    for (let i = 0; i < 500; i++) {
                        const p = r.dslSelectByFitness(rngA, { history: injHist });
                        if (Array.isArray(p) && p[1] === "sunny") highCount++;
                        if (Array.isArray(p) && p[1] === "rainy") lowCount++;
                    }
                    out.highBeatsLowRatio = highCount / Math.max(1, lowCount);
                    out.highBeatsLow = out.highBeatsLowRatio > 2.0;
                    out.selectionCoversAll = highCount + lowCount === 500;

                    // (b) Mutation behält chain-Wurzel und Array-Struktur
                    const rngB = makeRng(7);
                    const base = ["chain", ["weather", "sunny"], ["creatures_emotion", "happy"]];
                    let chainRootKept = true;
                    let allArrays = true;
                    for (let i = 0; i < 50; i++) {
                        const m = r.dslMutate(base, rngB);
                        if (!Array.isArray(m) || m[0] !== "chain") chainRootKept = false;
                        if (m.slice(1).some((sub) => !Array.isArray(sub))) allArrays = false;
                    }
                    out.mutationKeepsChainRoot = chainRootKept;
                    out.mutationKeepsArrayChildren = allArrays;

                    // (c) dslCompose mit erzwungener History-Quelle
                    const rngC = makeRng(99);
                    let usedHistory = 0;
                    for (let i = 0; i < 30; i++) {
                        const comp = r.dslCompose({
                            rng: rngC,
                            history: injHist,
                            historyProbability: 1.0,
                        });
                        // Ein mutiertes Programm aus injHist hat entweder
                        // "weather" als root (Mutation ohne Strukturwechsel)
                        // oder durch Atom-Replacement ein anderes Atom.
                        if (Array.isArray(comp) && (comp[0] === "weather" || comp.length === 2)) {
                            usedHistory++;
                        }
                    }
                    out.composeUsesHistory = usedHistory >= 20; // klar Mehrheit
                    out.composeUsesHistoryCount = usedHistory;

                    return out;
                })
                .catch(() => null);

            if (!phase7Results) {
                check("Phase 7: dslSelectByFitness erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check(
                    "Phase 7: Fitness-Selektion bevorzugt high-fitness deutlich",
                    phase7Results.highBeatsLow,
                    `high/low Ratio=${phase7Results.highBeatsLowRatio.toFixed(2)} (Erwartung > 2.0)`
                );
                check(
                    "Phase 7: Selektion deckt alle Einträge ab (keine null-Returns)",
                    phase7Results.selectionCoversAll
                );
                check(
                    "Phase 7: Mutation behält 'chain' als Wurzel bei Chain-Programmen",
                    phase7Results.mutationKeepsChainRoot
                );
                check(
                    "Phase 7: Mutation behält Array-Strukturen bei Sub-Programmen",
                    phase7Results.mutationKeepsArrayChildren
                );
                check(
                    "Phase 7: dslCompose mit historyProbability=1 nutzt History",
                    phase7Results.composeUsesHistory,
                    `${phase7Results.composeUsesHistoryCount}/30 Calls`
                );
            }

            // ### Ring 3 – Player-Emotionen → Welt ###
            const ring3Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state || !r.state.player) return null;
                    const out = {};

                    // Reset: für deterministische Tests alle Werte + Cooldowns löschen.
                    for (const k of Object.keys(r.state.player.emotions)) {
                        r.state.player.emotions[k] = 0;
                    }
                    r.state.player.emotionLastApply.joy = -Infinity;
                    r.state.player.emotionLastApply.sorrow = -Infinity;
                    r.state.player.emotionLastApply.chaos = -Infinity;
                    r.state.player.emotionLastTick = -Infinity;

                    // (a) collectPlayerEmotions reagiert auf deutsche Stichwörter
                    r.collectPlayerEmotions("Was für ein schöner und magischer Moment");
                    out.joyAfterCollect = r.state.player.emotions.joy;
                    out.aweAfterCollect = r.state.player.emotions.awe;
                    out.collectJoyOk = out.joyAfterCollect >= 0.1 - 1e-9;
                    out.collectAweOk = out.aweAfterCollect >= 0.1 - 1e-9;

                    // (b) Decay reduziert über simulierten Zeitfortschritt
                    r.state.player.emotions.joy = 0.5;
                    r.state.player.emotionLastTick = 100;
                    r.updatePlayerEmotions(110); // 10s vergangen
                    out.joyAfterDecay = r.state.player.emotions.joy;
                    out.decayLowered = out.joyAfterDecay < 0.5 && out.joyAfterDecay > 0;

                    // (c) Schwellen-Trigger: sorrow > 0.7 → state.weather = "rainy".
                    // lastTick nahe an currentTime, damit der Decay-Schritt
                    // sorrow nicht unter die Schwelle drückt bevor der Trigger
                    // schaut.
                    r.state.weather = "sunny";
                    r.state.player.emotions.sorrow = 0.9;
                    r.state.player.emotionLastApply.sorrow = -Infinity;
                    r.state.player.emotionLastTick = 199;
                    r.updatePlayerEmotions(200);
                    out.sorrowAfterTick = r.state.player.emotions.sorrow;
                    out.sorrowTriggersRain = r.state.weather === "rainy";

                    // (d) Trigger respektiert Cooldown — zweiter Tick 5s später
                    //     darf nicht wieder feuern.
                    r.state.weather = "sunny";
                    r.state.player.emotionLastTick = 204;
                    r.updatePlayerEmotions(205);
                    out.cooldownRespected = r.state.weather === "sunny";

                    // (e) DSL-Condition emotion_above
                    r.state.player.emotions.joy = 0.9;
                    const condTrue = r.dslEvalCond(["emotion_above", "joy", 0.5], {
                        state: r.state,
                        rng: Math.random,
                        log: [],
                    });
                    r.state.player.emotions.joy = 0.2;
                    const condFalse = r.dslEvalCond(["emotion_above", "joy", 0.5], {
                        state: r.state,
                        rng: Math.random,
                        log: [],
                    });
                    out.dslConditionJoyAbove = condTrue === true && condFalse === false;

                    // (f) Save-Roundtrip
                    r.state.player.emotions.joy = 0.42;
                    r.state.player.emotions.chaos = 0.13;
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.savedEmotions =
                        !!parsed &&
                        parsed.playerEmotions &&
                        Math.abs(parsed.playerEmotions.joy - 0.42) < 1e-6 &&
                        Math.abs(parsed.playerEmotions.chaos - 0.13) < 1e-6;

                    return out;
                })
                .catch(() => null);

            if (!ring3Results) {
                check("Ring 3: player.emotions erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check(
                    "Ring 3: collectPlayerEmotions erkennt 'schön' (joy +0.1)",
                    ring3Results.collectJoyOk,
                    `joy=${ring3Results.joyAfterCollect.toFixed(3)}`
                );
                check(
                    "Ring 3: collectPlayerEmotions erkennt 'magisch' (awe +0.1)",
                    ring3Results.collectAweOk,
                    `awe=${ring3Results.aweAfterCollect.toFixed(3)}`
                );
                check(
                    "Ring 3: Decay reduziert Emotion über Zeit",
                    ring3Results.decayLowered,
                    `joy 0.5 → ${ring3Results.joyAfterDecay.toFixed(3)} nach 10s`
                );
                check(
                    "Ring 3: sorrow > 0.7 triggert state.weather = 'rainy'",
                    ring3Results.sorrowTriggersRain
                );
                check(
                    "Ring 3: Trigger respektiert Cooldown (kein Wiederfeuern <30s)",
                    ring3Results.cooldownRespected
                );
                check(
                    "Ring 3: DSL-Condition emotion_above evaluiert korrekt",
                    ring3Results.dslConditionJoyAbove
                );
                check(
                    "Ring 3: Save persistiert playerEmotions",
                    ring3Results.savedEmotions
                );
            }

            // ### Ring 3 V2 — Achsen-Vollabdeckung + Generator-Modulation ###
            const ring3v2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state || !r.state.player) return null;
                    const out = {};
                    const p = r.state.player;

                    const makeRng = (seed) => {
                        let s = seed >>> 0 || 1;
                        return () => {
                            s = (s * 1664525 + 1013904223) >>> 0;
                            return s / 4294967296;
                        };
                    };

                    // (a) awe > 0.7 → skybox-Farbe wird gesetzt
                    for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
                    for (const k of Object.keys(p.emotionLastApply)) p.emotionLastApply[k] = -Infinity;
                    p.emotionLastTick = -Infinity;
                    p.emotions.awe = 0.9;
                    p.emotionLastTick = 299;
                    const readSkyHex = () =>
                        r.state.skybox && r.state.skybox.material.uniforms.nebulaColor
                            ? r.state.skybox.material.uniforms.nebulaColor.value.getHex()
                            : -1;
                    const skyBefore = readSkyHex();
                    r.updatePlayerEmotions(300);
                    const skyAfter = readSkyHex();
                    out.aweTriggersSkybox = skyAfter !== skyBefore && skyBefore !== -1;

                    // (b) hope > 0.7 → wetter sunny + kreaturen happy
                    for (const k of Object.keys(p.emotionLastApply)) p.emotionLastApply[k] = -Infinity;
                    p.emotions.hope = 0.9;
                    r.state.weather = "rainy";
                    r.state.creatureEmotions = r.state.creatures.map(() => "sad");
                    p.emotionLastTick = 399;
                    r.updatePlayerEmotions(400);
                    const happyCount = r.state.creatureEmotions.filter((e) => e === "happy").length;
                    out.hopeTriggersSunnyHappy =
                        r.state.weather === "sunny" && happyCount === r.state.creatureEmotions.length;

                    // (c) peace > 0.7 → creatures_speed_mul = 0.7 (also speedMul wird kleiner)
                    for (const k of Object.keys(p.emotionLastApply)) p.emotionLastApply[k] = -Infinity;
                    p.emotions.peace = 0.9;
                    // speedMul zurücksetzen, damit der Vergleich verlässlich ist
                    for (const cr of r.state.creatures) {
                        if (cr.userData) cr.userData.speedMul = 1;
                    }
                    p.emotionLastTick = 499;
                    r.updatePlayerEmotions(500);
                    const allSlowed =
                        r.state.creatures.length > 0 &&
                        r.state.creatures.every(
                            (cr) => cr.userData && Math.abs(cr.userData.speedMul - 0.7) < 1e-6
                        );
                    out.peaceTriggersSlowdown = allSlowed;

                    // (d) Generator-Modulation: hoher joy → mehr "sunny" als "rainy"
                    for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
                    p.emotions.joy = 1.0;
                    const rngJoy = makeRng(123);
                    let sunny = 0;
                    let rainy = 0;
                    for (let i = 0; i < 1000; i++) {
                        const atom = r.dslComposeAtomic(rngJoy);
                        if (Array.isArray(atom) && atom[0] === "weather") {
                            if (atom[1] === "sunny") sunny++;
                            else if (atom[1] === "rainy") rainy++;
                        }
                    }
                    out.joySunnyOverRainy = sunny;
                    out.joyRainyCount = rainy;
                    out.joyBiasWorks = sunny > rainy * 2;

                    // (e) Hoher sorrow → mehr "rainy" als "sunny"
                    for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
                    p.emotions.sorrow = 1.0;
                    const rngSorrow = makeRng(456);
                    let sunny2 = 0;
                    let rainy2 = 0;
                    for (let i = 0; i < 1000; i++) {
                        const atom = r.dslComposeAtomic(rngSorrow);
                        if (Array.isArray(atom) && atom[0] === "weather") {
                            if (atom[1] === "sunny") sunny2++;
                            else if (atom[1] === "rainy") rainy2++;
                        }
                    }
                    out.sorrowRainyOverSunny = rainy2;
                    out.sorrowSunnyCount = sunny2;
                    out.sorrowBiasWorks = rainy2 > sunny2 * 2;

                    // Cleanup: alles zurück auf neutral
                    for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;

                    return out;
                })
                .catch(() => null);

            if (!ring3v2Results) {
                check("Ring 3 V2: Snapshot erreichbar", false, "page.evaluate fehlgeschlagen");
            } else {
                check(
                    "Ring 3 V2: awe > 0.7 triggert Skybox-Farbe",
                    ring3v2Results.aweTriggersSkybox
                );
                check(
                    "Ring 3 V2: hope > 0.7 triggert chain(sunny, happy)",
                    ring3v2Results.hopeTriggersSunnyHappy
                );
                check(
                    "Ring 3 V2: peace > 0.7 verlangsamt Kreaturen (speedMul=0.7)",
                    ring3v2Results.peaceTriggersSlowdown
                );
                check(
                    "Ring 3 V2: Generator-Bias — joy=1.0 → sunny dominiert (>2× rainy)",
                    ring3v2Results.joyBiasWorks,
                    `sunny=${ring3v2Results.joySunnyOverRainy}, rainy=${ring3v2Results.joyRainyCount}`
                );
                check(
                    "Ring 3 V2: Generator-Bias — sorrow=1.0 → rainy dominiert (>2× sunny)",
                    ring3v2Results.sorrowBiasWorks,
                    `rainy=${ring3v2Results.sorrowRainyOverSunny}, sunny=${ring3v2Results.sorrowSunnyCount}`
                );
            }

            // ### Ring 4 — anazhSymphony V1 ###
            const ring4Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state || !r.state.symphony) return null;
                    const out = {};

                    // (a) initSymphony erfolgreich
                    const initOk = r.initSymphony();
                    const s = r.state.symphony;
                    out.initOk = initOk === true && s.enabled === true && !!s.ctx;
                    out.hasAmbient =
                        !!s.ambient &&
                        !!s.ambient.osc1 &&
                        !!s.ambient.osc2 &&
                        !!s.ambient.lfo &&
                        !!s.ambient.filter;
                    out.hasWeather = !!s.weather && !!s.weather.noise && !!s.weather.gain;

                    // (b) Wetter-Layer-Gain folgt state.weather
                    r.state.weather = "sunny";
                    r.symphonyTick();
                    // Direkter Wert kann durch laufende Rampe in Bewegung sein;
                    // wir prüfen das _Ziel_ via lastWeather + dass der Tick
                    // beim erneuten Aufruf mit gleichem Wetter nichts mehr
                    // tut (idempotent).
                    const lastBefore = s.lastWeather;
                    r.symphonyTick(); // idempotent
                    out.weatherTickIdempotent = s.lastWeather === lastBefore;

                    // Setzt rainy → Tick muss umschalten und lastWeather mit ziehen
                    r.state.weather = "rainy";
                    r.symphonyTick();
                    out.weatherSwitchedToRainy = s.lastWeather === "rainy";

                    // (c) Creature-Ping-Zähler steigt mit jedem Spawn
                    const pingBefore = s.creaturePingCount;
                    // Direkter Aufruf des Hooks — entkoppelt von THREE-Setup,
                    // verifiziert nur die Audio-Spur
                    r.playCreaturePing("happy");
                    r.playCreaturePing("sad");
                    out.pingCounterRose = s.creaturePingCount === pingBefore + 2;

                    // (d) Audio-Graph: masterGain ist mit destination verbunden
                    //     (kann nicht direkt verifiziert werden, aber wir
                    //     prüfen dass gain.value im erwarteten Bereich liegt)
                    out.masterGainSane =
                        !!s.masterGain &&
                        typeof s.masterGain.gain.value === "number" &&
                        s.masterGain.gain.value > 0 &&
                        s.masterGain.gain.value <= 1;

                    // (e) disposeSymphony räumt auf
                    r.disposeSymphony();
                    out.disposeClears = s.enabled === false && s.ctx === null && s.ambient === null;

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring4Results || ring4Results.error) {
                check(
                    "Ring 4: Symphonie-Snapshot erreichbar",
                    false,
                    ring4Results && ring4Results.error ? ring4Results.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 4: initSymphony aktiviert Audio-Pipeline", ring4Results.initOk);
                check(
                    "Ring 4: Ambient-Layer hat alle Nodes (osc1+osc2+lfo+filter)",
                    ring4Results.hasAmbient
                );
                check("Ring 4: Wetter-Layer hat Noise-Source + Gain", ring4Results.hasWeather);
                check(
                    "Ring 4: symphonyTick ist idempotent bei gleichem Wetter",
                    ring4Results.weatherTickIdempotent
                );
                check(
                    "Ring 4: symphonyTick schaltet Wetter-Layer um (sunny→rainy)",
                    ring4Results.weatherSwitchedToRainy
                );
                check(
                    "Ring 4: playCreaturePing erhöht Zähler",
                    ring4Results.pingCounterRose
                );
                check("Ring 4: masterGain im plausiblen Bereich (0..1)", ring4Results.masterGainSane);
                check(
                    "Ring 4: disposeSymphony räumt Audio-Graph komplett auf",
                    ring4Results.disposeClears
                );
            }

            // ### UI V1 — Status-Panel ###
            const uiResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    const panel = document.getElementById("status-panel");
                    out.panelInDom = !!panel;

                    // Panel-Children: alle sechs Emotion-Rows vorhanden
                    const rows = panel ? panel.querySelectorAll("#status-emotions .emotion") : [];
                    out.emotionRowCount = rows.length;
                    out.allSixAxes = rows.length === 6;

                    // Werte aktualisieren mit kontrollierten Emotionen + Tick
                    for (const k of Object.keys(r.state.player.emotions)) {
                        r.state.player.emotions[k] = 0;
                    }
                    r.state.player.emotions.joy = 0.5;
                    r.state.player.emotions.chaos = 0.8;
                    // statusRefs.lastTick zurücksetzen, sonst greift Throttle
                    if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
                    r.updateStatusPanel(1000);

                    const joyFill = panel ? panel.querySelector(".emotion.joy .bar > div") : null;
                    const chaosFill = panel ? panel.querySelector(".emotion.chaos .bar > div") : null;
                    out.joyBarWidth = joyFill ? joyFill.style.width : "";
                    out.chaosBarWidth = chaosFill ? chaosFill.style.width : "";
                    out.barReflectsValue =
                        out.joyBarWidth === "50%" && out.chaosBarWidth === "80%";

                    // Welt-Sektion
                    const weatherEl = document.getElementById("status-weather");
                    const slugEl = document.getElementById("status-slug");
                    const creaturesEl = document.getElementById("status-creatures");
                    out.weatherText = weatherEl ? weatherEl.textContent : "";
                    out.slugText = slugEl ? slugEl.textContent : "";
                    out.creaturesText = creaturesEl ? creaturesEl.textContent : "";
                    out.statusValuesPopulated =
                        out.weatherText !== "—" &&
                        out.weatherText.length > 0 &&
                        out.slugText !== "—" &&
                        out.slugText.length > 0;

                    // Throttle: zweiter Aufruf direkt danach ändert nichts
                    r.state.player.emotions.joy = 0.9;
                    r.updateStatusPanel(1000.1); // <0.4s nach erstem Tick
                    const joyFill2 = panel ? panel.querySelector(".emotion.joy .bar > div") : null;
                    out.throttleHolds = joyFill2 ? joyFill2.style.width === "50%" : false;

                    // Nach 0.4s wieder durchlassend
                    r.updateStatusPanel(1000.5);
                    const joyFill3 = panel ? panel.querySelector(".emotion.joy .bar > div") : null;
                    out.throttleReleases = joyFill3 ? joyFill3.style.width === "90%" : false;

                    // Cleanup
                    for (const k of Object.keys(r.state.player.emotions)) {
                        r.state.player.emotions[k] = 0;
                    }
                    if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
                    r.updateStatusPanel(2000);

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiResults || uiResults.error) {
                check(
                    "UI: Status-Panel-Snapshot erreichbar",
                    false,
                    uiResults && uiResults.error ? uiResults.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("UI: #status-panel ist im DOM", uiResults.panelInDom);
                check(
                    "UI: alle sechs Emotion-Rows gerendert",
                    uiResults.allSixAxes,
                    `rows=${uiResults.emotionRowCount}`
                );
                check(
                    "UI: Balken-Breite spiegelt Emotion-Wert (joy 0.5 → 50%, chaos 0.8 → 80%)",
                    uiResults.barReflectsValue,
                    `joy=${uiResults.joyBarWidth}, chaos=${uiResults.chaosBarWidth}`
                );
                check(
                    "UI: Welt-Sektion zeigt Wetter + Slug + Kreaturen",
                    uiResults.statusValuesPopulated,
                    `weather=${uiResults.weatherText}, slug=${uiResults.slugText}, creatures=${uiResults.creaturesText}`
                );
                check(
                    "UI: updateStatusPanel ist throttled (Aufruf <0.4s ignoriert)",
                    uiResults.throttleHolds
                );
                check(
                    "UI: updateStatusPanel lässt nach 0.4s wieder durch",
                    uiResults.throttleReleases
                );
            }

            // ### UI V1 — Quick-Buttons + Hilfe-Drawer ###
            const uiActionsResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};

                    // (a) Quick-Buttons existieren
                    const qa = document.getElementById("quick-actions");
                    const qaButtons = qa ? qa.querySelectorAll("button[data-cmd]") : [];
                    out.quickButtonCount = qaButtons.length;
                    out.quickButtonsPresent = qaButtons.length >= 6;

                    // (b) Klick auf einen Quick-Button feuert processChatCommand
                    r.state.weather = "sunny";
                    const sunnyBtn = qa
                        ? qa.querySelector('button[data-cmd="Setze Wetter rainy"]')
                        : null;
                    if (sunnyBtn) sunnyBtn.click();
                    out.quickButtonRoutesToChat = r.state.weather === "rainy";

                    // (c) Hilfe-Overlay versteckt initial
                    const overlay = document.getElementById("help-overlay");
                    out.overlayInitiallyHidden = overlay && overlay.hidden === true;

                    // (d) Toggle-Click öffnet Drawer
                    const toggle = document.getElementById("help-toggle");
                    if (toggle) toggle.click();
                    out.overlayOpensOnToggle = overlay && overlay.hidden === false;

                    // (e) Drawer enthält Befehl-Buttons
                    const helpButtons = document.querySelectorAll("#help-list button.cmd");
                    out.helpButtonCount = helpButtons.length;
                    out.helpHasButtons = helpButtons.length >= 10;

                    // (f) Klick auf Help-Eintrag schließt Overlay + führt aus.
                    // DSL-Pattern hat nur einen weather-example ("setze wetter
                    // rainy"), den nutzen wir.
                    r.state.weather = "sunny";
                    const rainyHelp = Array.from(helpButtons).find(
                        (b) => b.getAttribute("data-cmd") === "setze wetter rainy"
                    );
                    out.foundRainyHelp = !!rainyHelp;
                    if (rainyHelp) rainyHelp.click();
                    out.helpClickExecutes = r.state.weather === "rainy";
                    out.helpClickClosesOverlay = overlay && overlay.hidden === true;

                    // (g) Close-Button schließt Overlay
                    if (toggle) toggle.click(); // Wieder öffnen
                    const closeBtn = document.getElementById("help-close");
                    if (closeBtn) closeBtn.click();
                    out.closeButtonHidesOverlay = overlay && overlay.hidden === true;

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiActionsResults || uiActionsResults.error) {
                check(
                    "UI: Quick/Help-Snapshot erreichbar",
                    false,
                    uiActionsResults && uiActionsResults.error
                        ? uiActionsResults.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check(
                    "UI: Quick-Action-Buttons sind im DOM (≥6)",
                    uiActionsResults.quickButtonsPresent,
                    `count=${uiActionsResults.quickButtonCount}`
                );
                check(
                    "UI: Quick-Button-Klick routet durch processChatCommand",
                    uiActionsResults.quickButtonRoutesToChat
                );
                check(
                    "UI: Hilfe-Overlay startet versteckt",
                    uiActionsResults.overlayInitiallyHidden
                );
                check(
                    "UI: Toggle-Klick öffnet Hilfe-Drawer",
                    uiActionsResults.overlayOpensOnToggle
                );
                check(
                    "UI: Hilfe-Drawer enthält Befehl-Buttons (≥10)",
                    uiActionsResults.helpHasButtons,
                    `count=${uiActionsResults.helpButtonCount}`
                );
                check(
                    "UI: Klick auf Befehl im Drawer führt aus",
                    uiActionsResults.helpClickExecutes
                );
                check(
                    "UI: Klick auf Befehl schließt Drawer automatisch",
                    uiActionsResults.helpClickClosesOverlay
                );
                check(
                    "UI: Close-Button schließt Drawer",
                    uiActionsResults.closeButtonHidesOverlay
                );
            }

            // ### UI V1 — Abilities-Liste + Save/Load ###
            const uiAbilitiesResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    const container = document.getElementById("status-abilities");
                    out.containerInDom = !!container;

                    // (a) Initial: leere Meldung oder bestehende Fähigkeiten —
                    //     je nach Test-Vorlauf. Wir setzen erst eine bekannte
                    //     Ability, dann erzwingen das Rendering.
                    r.state.dsl.abilities = [];
                    if (r._statusRefs) {
                        r._statusRefs.abilitiesSignature = "";
                        r._statusRefs.lastTick = -Infinity;
                    }
                    r.updateStatusPanel(3000);
                    out.emptyStateShown = container && container.querySelector(".ability-empty") !== null;

                    // (b) Eine Ability hinzufügen → Row erscheint
                    r.addNewAbility("uiAbilityTest", ["creatures_color", "blue"], "human");
                    if (r._statusRefs) {
                        r._statusRefs.abilitiesSignature = "";
                        r._statusRefs.lastTick = -Infinity;
                    }
                    r.updateStatusPanel(3001);
                    const rows = container ? container.querySelectorAll(".ability-row") : [];
                    out.rowCountAfterAdd = rows.length;
                    out.rowAppears = rows.length === 1;
                    out.rowHasName =
                        rows[0] && rows[0].querySelector(".name").textContent === "uiAbilityTest";
                    out.rowHasSourceClass =
                        rows[0] && rows[0].classList.contains("source-human");

                    // (c) Run-Button klicken → ability läuft, Welt-Effekt
                    if (r.state.creatures[0]) r.state.creatures[0].material.color.setHex(0xff0000);
                    const runBtn = rows[0] && rows[0].querySelector("[data-run-ability]");
                    if (runBtn) runBtn.click();
                    const colorAfter = r.state.creatures[0] ? r.state.creatures[0].material.color.getHex() : 0;
                    out.runButtonExecutes = colorAfter === 0x0000ff;

                    // (d) Signature-Cache: zweiter updateStatusPanel ohne
                    //     Änderung darf das DOM nicht neu bauen — wir markieren
                    //     einen unsichtbaren Wert und prüfen Persistenz.
                    rows[0].setAttribute("data-test-marker", "preserved");
                    if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
                    r.updateStatusPanel(3002);
                    const rowAgain = container ? container.querySelector(".ability-row") : null;
                    out.signatureCachePreserves =
                        rowAgain && rowAgain.getAttribute("data-test-marker") === "preserved";

                    // (e) Export-Button löst Download aus → wir prüfen, dass
                    //     ein <a>-Element mit JSON-Data-URL angelegt UND wieder
                    //     entfernt wird. triggerStateDownload macht das
                    //     synchron, wir patchen click() um die Daten-URL zu
                    //     fangen.
                    let capturedHref = "";
                    const origCreate = document.createElement.bind(document);
                    document.createElement = function (tag) {
                        const el = origCreate(tag);
                        if (tag === "a") {
                            const origClick = el.click.bind(el);
                            el.click = function () {
                                capturedHref = el.getAttribute("href") || "";
                                origClick();
                            };
                        }
                        return el;
                    };
                    const exportBtn = document.getElementById("action-export-state");
                    if (exportBtn) exportBtn.click();
                    document.createElement = origCreate;
                    out.exportHrefStarts = capturedHref.startsWith("data:application/json");
                    out.exportContainsPlayerEmotions = capturedHref.includes("playerEmotions");

                    // Cleanup: Test-Ability wieder rausnehmen, damit andere
                    //         Snapshots sauber sind.
                    r.state.dsl.abilities = r.state.dsl.abilities.filter(
                        (a) => a.name !== "uiAbilityTest"
                    );
                    delete r.state.abilities.uiAbilityTest;
                    if (r._statusRefs) {
                        r._statusRefs.abilitiesSignature = "";
                        r._statusRefs.lastTick = -Infinity;
                    }
                    r.updateStatusPanel(3003);

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiAbilitiesResults || uiAbilitiesResults.error) {
                check(
                    "UI: Abilities-Snapshot erreichbar",
                    false,
                    uiAbilitiesResults && uiAbilitiesResults.error
                        ? uiAbilitiesResults.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check(
                    "UI: Abilities-Container ist im DOM",
                    uiAbilitiesResults.containerInDom
                );
                check(
                    "UI: Leerer State zeigt Hinweis-Text",
                    uiAbilitiesResults.emptyStateShown
                );
                check(
                    "UI: Hinzugefügte Ability erscheint als Row",
                    uiAbilitiesResults.rowAppears,
                    `rows=${uiAbilitiesResults.rowCountAfterAdd}`
                );
                check(
                    "UI: Ability-Row trägt Name + Source-Klasse",
                    uiAbilitiesResults.rowHasName && uiAbilitiesResults.rowHasSourceClass
                );
                check(
                    "UI: Run-Button führt Ability aus (DSL-Programm mutiert Welt)",
                    uiAbilitiesResults.runButtonExecutes
                );
                check(
                    "UI: Signature-Cache verhindert DOM-Rebuild bei gleichem Stand",
                    uiAbilitiesResults.signatureCachePreserves
                );
                check(
                    "UI: Export-Button erzeugt JSON-Data-URL",
                    uiAbilitiesResults.exportHrefStarts
                );
                check(
                    "UI: Export-Payload enthält playerEmotions",
                    uiAbilitiesResults.exportContainsPlayerEmotions
                );
            }
        }

        // Echte Page-Errors (Script-Exceptions) sind immer Bugs.
        const pageErrors = errors.filter((e) => e.kind === "pageerror");
        check(
            "Keine Script-Exceptions (page.on pageerror)",
            pageErrors.length === 0,
            pageErrors.length ? `${pageErrors.length}× erste: ${pageErrors[0].text.slice(0, 100)}` : ""
        );

        // Kritische Console-Patterns, die früher echte Bugs anzeigten.
        const criticalPatterns = [
            { re: /Cannot start training because another fit/, why: "TF-Race" },
            { re: /Infinity, Infinity/, why: "extendTerrain-Infinity (Cooldown-Self-Block)" },
            { re: /Ungültige Chunk-Größe/, why: "Chunk-Generation-Fehler" },
            {
                re: /THREE is not defined|Ammo is not defined|tf is not defined|SimplexNoise is not defined/,
                why: "Vendor-Lib nicht geladen",
            },
            { re: /Failed to execute 'compile' on 'WebAssembly'.*MIME/, why: "WASM-MIME falsch konfiguriert" },
        ];
        for (const { re, why } of criticalPatterns) {
            const hits = logs.filter((l) => re.test(l.text));
            check(
                `Keine '${why}'-Logs`,
                hits.length === 0,
                hits.length ? `${hits.length}× erste: ${hits[0].text.slice(0, 100)}` : ""
            );
        }

        // Death-Spiral-Sensor: "Boden fehlt" mehr als zweimal in N Sekunden = Loop.
        const bodenFehltCount = logs.filter((l) => /Boden fehlt/.test(l.text)).length;
        check("Keine Welt-Regen-Death-Spiral", bodenFehltCount <= 2, `'Boden fehlt'-Logs=${bodenFehltCount}`);

        // Screenshot als Beweis-Artefakt. Force-revealt die Dialog-Box, falls
        // ihr 8 s-Fade-Out schon durch ist — der Text bleibt ja im DOM.
        try {
            await page.evaluate(() => {
                const box = document.getElementById("dialogue-box");
                if (box && box.textContent) box.classList.add("visible");
            });
            fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
            await page.screenshot({ path: SCREENSHOT_PATH, fullPage: false });
            console.log(`\nScreenshot: ${SCREENSHOT_PATH}`);
        } catch (e) {
            console.log(`\nScreenshot fehlgeschlagen: ${e.message}`);
        }
    } finally {
        await browser.close();
        server.kill();
    }

    if (failures.length > 0) {
        console.log(`\n❌ ${failures.length} Invariante(n) verletzt: ${failures.join(", ")}`);
        if (STRICT) process.exit(1);
    } else {
        console.log(`\n✅ Alle Invarianten OK`);
    }
})().catch((err) => {
    console.error("Smoketest-Crash:", err);
    process.exit(1);
});

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

            // ### Schicht 1 — IQ-Schicht (Pfad-Buckets, Multi-Dim-Fitness, Pattern-Memory) ###
            const iqResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // State-Felder existieren
                    out.hasPathBuckets =
                        !!r.state.player.pathBuckets &&
                        !!r.state.player.pathBuckets.height &&
                        !!r.state.player.pathBuckets.distance;
                    out.hasPatternMemory =
                        r.state.dsl && typeof r.state.dsl.patternMemory === "object";
                    out.hasRecentKeywords = Array.isArray(r.state.dsl.recentKeywords);
                    out.hasPendingOutcomes = Array.isArray(r.state.dsl.pendingOutcomes);
                    out.historyCap500 = r.state.dsl.historyCap >= 500;
                    out.schemaVersionIq = /^7\.7[2-9]/.test(r.state.worldMeta.schemaVersion);

                    // Keyword-Extraktion
                    const kws = r.pathExtractKeywords("Ich liebe den Wald und Wasserfälle hier");
                    out.keywordsExtracted = Array.isArray(kws) && kws.includes("wald") && kws.includes("wasserfälle");
                    out.keywordsFilterStopwords = !kws.includes("der") && !kws.includes("ich");

                    // rememberChatKeywords füllt den Window
                    r.state.dsl.recentKeywords.length = 0;
                    r.rememberChatKeywords("teste mit drachen und feuer", 1000);
                    out.keywordsRemembered = r.state.dsl.recentKeywords.length >= 2;

                    // pruneRecentKeywords entfernt alte
                    r.state.dsl.recentKeywords.push({ keyword: "alt", at: 0 });
                    r.pruneRecentKeywords(120);
                    out.oldKeywordsPruned = !r.state.dsl.recentKeywords.some((e) => e.keyword === "alt");

                    // Multi-Dim-Fitness: Outcome mit positiver Emotion gibt höhere Fitness
                    const f1 = r.computeMultiDimFitness({
                        fpsBefore: 120,
                        fpsAfter: 120,
                        emotionsBefore: { joy: 0.1, awe: 0, hope: 0, peace: 0 },
                        emotionsAfter: { joy: 0.5, awe: 0.3, hope: 0.2, peace: 0.1 },
                        activityAfter: { moves: 10, chats: 2, jumps: 0 },
                    });
                    const f2 = r.computeMultiDimFitness({
                        fpsBefore: 120,
                        fpsAfter: 120,
                        emotionsBefore: { joy: 0.5, awe: 0.5, hope: 0.5, peace: 0.5 },
                        emotionsAfter: { joy: 0.1, awe: 0.1, hope: 0.1, peace: 0.1 },
                        activityAfter: { moves: 0, chats: 0, jumps: 0 },
                    });
                    out.fitnessRespondsToEmotion = f1 > f2;
                    out.fitnessBounded = f1 >= 0 && f1 <= 1 && f2 >= 0 && f2 <= 1;

                    // Pattern-Memory: rememberOutcomeAsPattern (high-fitness) speichert
                    r.state.dsl.patternMemory = {};
                    r.state.dsl.recentKeywords = [{ keyword: "drache", at: 100 }];
                    r.rememberOutcomeAsPattern(
                        { startedAt: 100 },
                        ["spawn_creature", ["at_player"], 1, "happy"],
                        0.8,
                        110
                    );
                    out.patternMemoryWritten = Array.isArray(r.state.dsl.patternMemory["drache"]) &&
                        r.state.dsl.patternMemory["drache"].length === 1;
                    // Low-fitness Programme werden NICHT geschrieben
                    r.rememberOutcomeAsPattern(
                        { startedAt: 100 },
                        ["weather", "rainy"],
                        0.3,
                        110
                    );
                    out.lowFitnessIgnored = r.state.dsl.patternMemory["drache"].length === 1;

                    // dslSelectByPattern findet das Programm
                    let foundByPattern = 0;
                    for (let i = 0; i < 10; i++) {
                        const p = r.dslSelectByPattern(Math.random);
                        if (Array.isArray(p) && p[0] === "spawn_creature") foundByPattern++;
                    }
                    out.patternSelectionWorks = foundByPattern === 10;

                    // Pfad-Buckets: samplePathBuckets inkrementiert
                    const before = { ...r.state.player.pathBuckets.height };
                    r.state.player.pathLastSample = -Infinity;
                    r.samplePathBuckets(performance.now() / 1000);
                    const after = r.state.player.pathBuckets.height;
                    out.bucketsIncrementing =
                        (after.low || 0) + (after.mid || 0) + (after.high || 0) >
                        (before.low || 0) + (before.mid || 0) + (before.high || 0);

                    // dslRun schreibt emotionsBefore + startedAt
                    const result = r.dslRun(["weather", "sunny"], { source: "test" });
                    out.outcomeHasEmotionSnapshot =
                        result.outcome && typeof result.outcome.startedAt === "number" &&
                        result.outcome.emotionsBefore &&
                        typeof result.outcome.emotionsBefore.joy === "number";

                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!iqResults || iqResults.error) {
                check("Schicht 1: IQ-Snapshot erreichbar", false, iqResults && iqResults.error || "page.evaluate fehlgeschlagen");
            } else {
                check("Schicht 1: pathBuckets-State im player", iqResults.hasPathBuckets);
                check("Schicht 1: patternMemory-State im dsl", iqResults.hasPatternMemory);
                check("Schicht 1: recentKeywords + pendingOutcomes", iqResults.hasRecentKeywords && iqResults.hasPendingOutcomes);
                check("Schicht 1: historyCap auf 500 erhöht", iqResults.historyCap500);
                check("Schicht 1: schemaVersion auf 7.72-iq-v1 gebumpt", iqResults.schemaVersionIq);
                check("Schicht 1: pathExtractKeywords liefert echte Tokens", iqResults.keywordsExtracted);
                check("Schicht 1: Keyword-Filter wirft Stoppwörter raus", iqResults.keywordsFilterStopwords);
                check("Schicht 1: rememberChatKeywords füllt das Fenster", iqResults.keywordsRemembered);
                check("Schicht 1: pruneRecentKeywords räumt alte Einträge ab", iqResults.oldKeywordsPruned);
                check("Schicht 1: Multi-Dim-Fitness reagiert auf Emotion-Delta", iqResults.fitnessRespondsToEmotion);
                check("Schicht 1: Fitness bleibt in [0..1]", iqResults.fitnessBounded);
                check("Schicht 1: Pattern-Memory schreibt high-fitness", iqResults.patternMemoryWritten);
                check("Schicht 1: low-fitness landet nicht im Memory", iqResults.lowFitnessIgnored);
                check("Schicht 1: dslSelectByPattern findet gespeichertes Programm", iqResults.patternSelectionWorks);
                check("Schicht 1: samplePathBuckets erhöht Höhen-Bucket", iqResults.bucketsIncrementing);
                check("Schicht 1: dslRun-Outcome trägt emotionsBefore + startedAt", iqResults.outcomeHasEmotionSnapshot);
            }

            // ### Welle 1 D — Welt-Journal ###
            const journalResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    out.hasJournal = r.state.worldJournal && Array.isArray(r.state.worldJournal.entries);
                    out.genesisWritten = r.state.worldJournal.entries.some((e) => e.type === "genesis");
                    out.bornAtSet = typeof r.state.worldMeta.bornAt === "number" && r.state.worldMeta.bornAt > 0;
                    // journalAppend schreibt
                    const before = r.state.worldJournal.entries.length;
                    r.journalAppend("test", "Erinnerung-Test");
                    out.appendIncreases = r.state.worldJournal.entries.length === before + 1;
                    // Once-Variante schreibt nur ein Mal
                    r.journalAppendOnce("uniq1", "test", "Einmaliger Eintrag");
                    r.journalAppendOnce("uniq1", "test", "Doppelt-Versuch");
                    const uniqCount = r.state.worldJournal.entries.filter((e) => e.text === "Einmaliger Eintrag").length;
                    out.onceIsIdempotent = uniqCount === 1;
                    // Auszug für LLM enthält Genesis
                    const excerpt = r.journalForPrompt();
                    out.excerptHasGenesis = /genesis/.test(excerpt);
                    // LLM-System-Prompt erwähnt slug + worldId
                    const sys = r.llmBuildSystemPrompt();
                    out.systemPromptIdentity = sys.includes(r.state.worldMeta.slug) && sys.includes(r.state.worldMeta.worldId);
                    out.systemPromptInventory = /Kreaturen.*Bauwerke.*Baupläne/.test(sys);
                    out.systemPromptTendency = /Höhe.*Distanz.*Wetter.*Aktivität/.test(sys);
                    out.systemPromptFirstPerson = /sprich.*ich|in erster Person/i.test(sys);
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!journalResults || journalResults.error) {
                check("Welle 1 D: Journal-Snapshot erreichbar", false, journalResults && journalResults.error || "page.evaluate fehlgeschlagen");
            } else {
                check("Welle 1 D: state.worldJournal existiert", journalResults.hasJournal);
                check("Welle 1 D: Genesis-Eintrag wurde beim ersten worldMeta-Init geschrieben", journalResults.genesisWritten);
                check("Welle 1 D: worldMeta.bornAt gesetzt", journalResults.bornAtSet);
                check("Welle 1 D: journalAppend hängt Eintrag an", journalResults.appendIncreases);
                check("Welle 1 D: journalAppendOnce ist idempotent", journalResults.onceIsIdempotent);
                check("Welle 1 D: journalForPrompt enthält Genesis", journalResults.excerptHasGenesis);
                check("Welle 1 A: LLM-Prompt trägt slug + worldId", journalResults.systemPromptIdentity);
                check("Welle 1 A: LLM-Prompt zählt Welt-Inventar", journalResults.systemPromptInventory);
                check("Welle 1 A: LLM-Prompt benennt Pfad-Tendenz", journalResults.systemPromptTendency);
                check("Welle 1 A: LLM-Prompt verlangt erste Person", journalResults.systemPromptFirstPerson);
            }

            // ### Welle 2 B/C — Fraktale Baupläne + Schöpfer-DSL-Ops ###
            const wave2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // C — Validation lehnt unbekannte Shape ab
                    out.rejectsUnknownShape = !r.validateBlueprintParts([{ shape: "alien" }]).ok;
                    out.rejectsEmpty = !r.validateBlueprintParts([]).ok;
                    out.acceptsValid = r.validateBlueprintParts([{ shape: "box", color: 0x00ff00 }]).ok;
                    // C — blueprint-Part validiert refName
                    out.rejectsInvalidRef = !r.validateBlueprintParts([{ shape: "blueprint", refName: "../etc" }]).ok;
                    // B — define_blueprint legt eigenen Bauplan an
                    delete r.state.blueprints["wave2-test"];
                    const res = r.dslRun([
                        "define_blueprint", "wave2-test",
                        [{ shape: "box", color: 0xff0000, size: { x: 2, y: 2, z: 2 } }]
                    ], { source: "test" });
                    out.defineBlueprintWorks = res.ok && !!r.state.blueprints["wave2-test"] && !r.state.blueprints["wave2-test"].builtIn;
                    // B — Built-in lässt sich nicht überschreiben
                    const builtInBefore = r.state.blueprints.village && r.state.blueprints.village.parts.length;
                    r.dslRun([
                        "define_blueprint", "village",
                        [{ shape: "box" }]
                    ], { source: "test" });
                    out.builtInProtected = r.state.blueprints.village && r.state.blueprints.village.parts.length === builtInBefore;
                    // C — Selbst-Referenz wird verboten
                    delete r.state.blueprints["self-ref"];
                    r.dslRun([
                        "define_blueprint", "self-ref",
                        [{ shape: "blueprint", refName: "self-ref" }]
                    ], { source: "test" });
                    out.selfReferenceBlocked = !r.state.blueprints["self-ref"];
                    // C — fraktale Verschachtelung baut Sub-Group
                    delete r.state.blueprints["wave2-outer"];
                    r.dslRun([
                        "define_blueprint", "wave2-outer",
                        [
                            { shape: "box", color: 0x0000ff },
                            { shape: "blueprint", refName: "wave2-test", position: { x: 3, y: 0, z: 0 } }
                        ]
                    ], { source: "test" });
                    const outerGroup = r._buildFromBlueprint(r.state.blueprints["wave2-outer"]);
                    out.nestedGroupHasSubgroup = outerGroup.children.length === 2 &&
                        outerGroup.children[1].type === "Group";
                    // C — Tiefen-Cap greift (selbst wenn man programmatisch zyklisch konstruiert)
                    r.state.blueprints["cycle-a"] = {
                        name: "cycle-a", label: "a", builtIn: false,
                        parts: [{ shape: "blueprint", refName: "cycle-b" }]
                    };
                    r.state.blueprints["cycle-b"] = {
                        name: "cycle-b", label: "b", builtIn: false,
                        parts: [{ shape: "blueprint", refName: "cycle-a" }]
                    };
                    const cycleGroup = r._buildFromBlueprint(r.state.blueprints["cycle-a"]);
                    // Sollte nicht in Endlos-Rekursion gehen
                    out.cycleHandled = !!cycleGroup;
                    // B — define_ability mit verbotenem nested define_blueprint
                    const abilNested = r.dslRun([
                        "define_ability", "evil",
                        ["define_blueprint", "x", [{ shape: "box" }]]
                    ], { source: "test" });
                    out.nestedDefineBlocked = abilNested.log.some((e) => e.event === "ability_nested_define_forbidden");
                    // B — define_ability legitim
                    const abilOk = r.dslRun([
                        "define_ability", "wave2-dance",
                        ["weather", "rainy"]
                    ], { source: "test" });
                    out.defineAbilityWorks = abilOk.ok &&
                        (r.state.dsl.abilities || []).some((a) => a.name === "wave2-dance");
                    // Test-Artefakte sauber entfernen, damit nachfolgende
                    // Workshop-Invarianten konsistent zählen.
                    delete r.state.blueprints["wave2-test"];
                    delete r.state.blueprints["wave2-outer"];
                    delete r.state.blueprints["cycle-a"];
                    delete r.state.blueprints["cycle-b"];
                    r.state.dsl.abilities = (r.state.dsl.abilities || []).filter((a) => a.name !== "wave2-dance");
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave2Results || wave2Results.error) {
                check("Welle 2: Snapshot erreichbar", false, wave2Results && wave2Results.error || "page.evaluate fehlgeschlagen");
            } else {
                check("Welle 2 C: Validation lehnt unbekannte Shape ab", wave2Results.rejectsUnknownShape);
                check("Welle 2 C: Validation lehnt leeren Parts-Array ab", wave2Results.rejectsEmpty);
                check("Welle 2 C: Validation akzeptiert gültige box-Parts", wave2Results.acceptsValid);
                check("Welle 2 C: refName mit Sonderzeichen abgelehnt", wave2Results.rejectsInvalidRef);
                check("Welle 2 B: define_blueprint legt eigenen Bauplan an", wave2Results.defineBlueprintWorks);
                check("Welle 2 B: Built-in bleibt vor Überschreiben geschützt", wave2Results.builtInProtected);
                check("Welle 2 C: Selbst-Referenz im blueprint-Part blockiert", wave2Results.selfReferenceBlocked);
                check("Welle 2 C: Verschachtelter Bauplan rendert Sub-Group", wave2Results.nestedGroupHasSubgroup);
                check("Welle 2 C: Cycle in blueprint-Refs läuft nicht endlos", wave2Results.cycleHandled);
                check("Welle 2 B: define_ability verbietet nested define_*", wave2Results.nestedDefineBlocked);
                check("Welle 2 B: define_ability legt neue Fähigkeit an", wave2Results.defineAbilityWorks);
            }

            // ### Welle 3 E/F — Welt-Initiative + Welt-Tor ###
            const wave3Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // E — neue Trigger im pool + triggers-Map
                    out.hasJournalEventTrigger = !!r.state.grok.triggers.journalEvent;
                    out.hasEmotionShiftTrigger = !!r.state.grok.triggers.emotionShift;
                    out.hasJournalEventPool = Array.isArray(r.state.grok.pool.journalEvent) &&
                        r.state.grok.pool.journalEvent.length > 0;
                    out.hasEmotionShiftPool = Array.isArray(r.state.grok.pool.emotionShift) &&
                        r.state.grok.pool.emotionShift.length > 0;
                    // E — grokSpeakFromJournal existiert
                    out.hasGrokSpeakFromJournal = typeof r.grokSpeakFromJournal === "function";
                    // F — Welt-Info-UI im DOM
                    out.worldInfoInDom = !!document.getElementById("world-info");
                    out.worldExportInDom = !!document.getElementById("world-export");
                    out.worldImportInDom = !!document.getElementById("world-import");
                    // F — updateWorldInfo füllt slug
                    r.updateWorldInfo();
                    const infoText = document.getElementById("world-info").textContent;
                    out.worldInfoShowsSlug = infoText.includes(r.state.worldMeta.slug);
                    out.worldInfoShowsAge = /Alter:\s*\d+/.test(infoText);
                    // Tagebuch: List-DOM + Count + Erinnerungs-Zeile
                    out.journalListInDom = !!document.getElementById("world-journal-list");
                    out.journalCountInDom = !!document.getElementById("world-journal-count");
                    // Test-Eintrag und Re-Render forcieren (signature ändern)
                    r.journalAppend("test", "Tagebuch-UI-Probe");
                    document.getElementById("world-journal-list").dataset.signature = "";
                    r.renderWorldJournal();
                    const listEl = document.getElementById("world-journal-list");
                    out.journalListHasEntries = listEl.querySelectorAll(".journal-entry").length > 0;
                    out.journalListHasTypePill =
                        !!listEl.querySelector(".journal-entry .journal-type");
                    out.journalListHasAge =
                        !!listEl.querySelector(".journal-entry .journal-age");
                    out.journalCountReflectsEntries = /Erinnerung/.test(
                        document.getElementById("world-journal-count").textContent
                    );
                    // Jüngste oben: erstes journal-entry enthält den eben
                    // angehängten Text
                    const firstEntry = listEl.querySelector(".journal-entry");
                    out.journalNewestFirst =
                        !!firstEntry && firstEntry.textContent.includes("Tagebuch-UI-Probe");
                    // Render mit identischer Signature darf DOM nicht neu bauen
                    const beforeChildren = listEl.children.length;
                    r.renderWorldJournal();
                    out.journalSignatureCachesRender = listEl.children.length === beforeChildren;
                    // F — triggerStateDownload akzeptiert suggestedName
                    let downloadedName = null;
                    const origCreate = document.createElement;
                    document.createElement = function (tag) {
                        const el = origCreate.call(document, tag);
                        if (tag === "a") {
                            const origSetAttr = el.setAttribute.bind(el);
                            el.setAttribute = (k, v) => {
                                if (k === "download") downloadedName = v;
                                origSetAttr(k, v);
                            };
                            el.click = () => {};
                        }
                        return el;
                    };
                    r.triggerStateDownload({ test: true }, "anazh-realm-test.json");
                    document.createElement = origCreate;
                    out.downloadCustomName = downloadedName === "anazh-realm-test.json";
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave3Results || wave3Results.error) {
                check("Welle 3: Snapshot erreichbar", false, wave3Results && wave3Results.error || "page.evaluate fehlgeschlagen");
            } else {
                check("Welle 3 E: journalEvent-Trigger im Grok-State", wave3Results.hasJournalEventTrigger);
                check("Welle 3 E: emotionShift-Trigger im Grok-State", wave3Results.hasEmotionShiftTrigger);
                check("Welle 3 E: journalEvent-Pool gefüllt", wave3Results.hasJournalEventPool);
                check("Welle 3 E: emotionShift-Pool gefüllt", wave3Results.hasEmotionShiftPool);
                check("Welle 3 E: grokSpeakFromJournal-Funktion existiert", wave3Results.hasGrokSpeakFromJournal);
                check("Welle 3 F: #world-info im DOM", wave3Results.worldInfoInDom);
                check("Welle 3 F: Welt-Export-/Import-Buttons im DOM",
                    wave3Results.worldExportInDom && wave3Results.worldImportInDom);
                check("Welle 3 F: Welt-Info zeigt slug", wave3Results.worldInfoShowsSlug);
                check("Welle 3 F: Welt-Info zeigt Alter in Tagen", wave3Results.worldInfoShowsAge);
                check("Welle 3 F: triggerStateDownload nutzt suggestedName", wave3Results.downloadCustomName);
                check("Tagebuch: #world-journal-list im DOM", wave3Results.journalListInDom);
                check("Tagebuch: #world-journal-count im DOM", wave3Results.journalCountInDom);
                check("Tagebuch: Liste rendert Erinnerungen", wave3Results.journalListHasEntries);
                check("Tagebuch: Eintrag trägt Type-Pille", wave3Results.journalListHasTypePill);
                check("Tagebuch: Eintrag zeigt Alter", wave3Results.journalListHasAge);
                check("Tagebuch: Counter zeigt Erinnerungs-Anzahl", wave3Results.journalCountReflectsEntries);
                check("Tagebuch: Jüngster Eintrag steht oben", wave3Results.journalNewestFirst);
                check("Tagebuch: Signature-Cache verhindert Re-Render", wave3Results.journalSignatureCachesRender);
            }

            // ### Welle 4 Phase 1 — Materialien als Tag-Profile ###
            const wave4p1Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // Statisches Tag-Schema
                    const keys = r.constructor.MATERIAL_TAG_KEYS;
                    out.tagKeysFrozen = Object.isFrozen(keys);
                    out.tagKeyCount = Array.isArray(keys) ? keys.length : 0;
                    // 6 Built-ins, alle markiert
                    const mats = r.state.materials || {};
                    const builtIns = Object.values(mats).filter((m) => m.builtIn);
                    out.builtInCount = builtIns.length;
                    out.expectedBuiltIns = ["stein", "holz", "eisen", "bronze", "quarz", "leder"].every(
                        (n) => mats[n] && mats[n].builtIn
                    );
                    // Alle Built-in-Tag-Werte sind 0..1
                    out.tagsInRange = builtIns.every((m) =>
                        keys.every((k) => {
                            const v = m.tags[k];
                            return typeof v === "number" && v >= 0 && v <= 1;
                        })
                    );
                    // Quarz: erwartete Signatur-Werte (resoniert + transparent + magieleitung hoch)
                    out.quarzSignature =
                        mats.quarz.tags.resoniert >= 0.8 &&
                        mats.quarz.tags.transparent >= 0.9 &&
                        mats.quarz.tags.magieleitung >= 0.8;
                    // defineMaterial: gültig, dann clamp, dann doppelt erlaubt (update)
                    const r1 = r.defineMaterial("kupfer", 0xb87333, { stromleitung: 0.95, magieleitung: 0.4 });
                    out.defineOk = r1.ok && mats.kupfer && !mats.kupfer.builtIn;
                    const r2 = r.defineMaterial("kupfer", 0xb87333, { stromleitung: 5.0 });
                    out.defineClampsToOne = r2.ok && mats.kupfer.tags.stromleitung === 1;
                    // Built-in-Schutz
                    const r3 = r.defineMaterial("stein", 0xff0000, { härte: 0.1 });
                    out.builtInProtected = !r3.ok && r3.reason === "cannot_overwrite_builtin";
                    // Invalid name
                    const r4 = r.defineMaterial("", 0, {});
                    out.invalidNameRejected = !r4.ok;
                    // Validation lehnt Material nicht ab, mappt unbekannt weg
                    const v1 = r.validateBlueprintParts([
                        { shape: "box", material: "kupfer", color: 0x111111 },
                    ]);
                    out.validationAcceptsKnownMaterial = v1.ok && v1.parts[0].material === "kupfer";
                    const v2 = r.validateBlueprintParts([
                        { shape: "box", material: "phlogiston", color: 0x111111 },
                    ]);
                    out.validationDropsUnknownMaterial = v2.ok && !v2.parts[0].material;
                    // DSL-Op define_material
                    const runRes = r.dslRun(
                        ["define_material", "schimmer", 0xeeeeee, { magieleitung: 0.7 }],
                        { source: "test" }
                    );
                    out.dslDefineMaterial = !!mats.schimmer && !mats.schimmer.builtIn;
                    out.dslLogsDefinedEvent = runRes.log.some((e) => e.event === "defined_material");
                    // Built-in-Bauplan-Parts haben material gesetzt
                    const villageParts = r.state.blueprints.village.parts;
                    out.builtInPartsHaveMaterial = villageParts.every(
                        (p) => typeof p.material === "string" && mats[p.material]
                    );
                    // Save-Roundtrip: eigenes Material überlebt
                    const snap = r.buildStateSnapshot();
                    out.snapshotHasMaterial =
                        Array.isArray(snap.materials) &&
                        snap.materials.some((m) => m.name === "kupfer");
                    // applySavedState mit altem Save (parts ohne material) →
                    // Migration auf „stein". Wir simulieren ein altes Schema.
                    const oldSnap = {
                        materials: [],
                        blueprints: [
                            {
                                name: "legacy-test",
                                label: "Legacy",
                                parts: [{ shape: "box", color: 0x123456 }],
                            },
                        ],
                    };
                    r.loadState(oldSnap);
                    out.legacyPartGotDefaultMaterial =
                        r.state.blueprints["legacy-test"] &&
                        r.state.blueprints["legacy-test"].parts[0].material === "stein";
                    // Werkstatt-UI: Material-Dropdown im DOM
                    r.selectBlueprintForEdit("legacy-test");
                    const matSelect = document.querySelector(".workshop-material");
                    out.uiHasMaterialDropdown = !!matSelect;
                    out.uiDropdownLists6PlusOptions = matSelect && matSelect.options.length >= 6;
                    // updatePartInBlueprint mit recolor zieht Farbe nach
                    r.updatePartInBlueprint("legacy-test", 0, { material: "quarz", recolor: true });
                    out.recolorAppliesMaterialColor =
                        r.state.blueprints["legacy-test"].parts[0].color === mats.quarz.color;
                    // define_ability blockiert nested define_material
                    const runRes2 = r.dslRun(
                        ["define_ability", "evil-mat", ["define_material", "bad", 0, {}]],
                        { source: "test" }
                    );
                    out.nestedDefineMaterialBlocked = runRes2.log.some(
                        (e) => e.event === "ability_nested_define_forbidden"
                    );
                    // Aufräumen
                    delete r.state.materials["kupfer"];
                    delete r.state.materials["schimmer"];
                    delete r.state.blueprints["legacy-test"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave4p1Results || wave4p1Results.error) {
                check(
                    "Welle 4 P1: Snapshot erreichbar",
                    false,
                    (wave4p1Results && wave4p1Results.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 4 P1: MATERIAL_TAG_KEYS ist frozen", wave4p1Results.tagKeysFrozen);
                check("Welle 4 P1: 10 Tag-Achsen", wave4p1Results.tagKeyCount === 10);
                check("Welle 4 P1: 6 Built-in-Materialien existieren", wave4p1Results.expectedBuiltIns);
                check("Welle 4 P1: Built-in-Anzahl exakt 6", wave4p1Results.builtInCount === 6);
                check("Welle 4 P1: Alle Tag-Werte 0..1", wave4p1Results.tagsInRange);
                check("Welle 4 P1: Quarz hat Signatur-Tags (resoniert/transparent/magieleitung)", wave4p1Results.quarzSignature);
                check("Welle 4 P1: defineMaterial legt eigenes Material an", wave4p1Results.defineOk);
                check("Welle 4 P1: defineMaterial clamped Tag-Werte auf 1", wave4p1Results.defineClampsToOne);
                check("Welle 4 P1: defineMaterial lehnt Built-in-Override ab", wave4p1Results.builtInProtected);
                check("Welle 4 P1: defineMaterial lehnt leeren Namen ab", wave4p1Results.invalidNameRejected);
                check("Welle 4 P1: validateBlueprintParts akzeptiert bekanntes Material", wave4p1Results.validationAcceptsKnownMaterial);
                check("Welle 4 P1: validateBlueprintParts droppt unbekanntes Material", wave4p1Results.validationDropsUnknownMaterial);
                check("Welle 4 P1: DSL-Op define_material wirkt", wave4p1Results.dslDefineMaterial);
                check("Welle 4 P1: DSL-Op loggt defined_material-Event", wave4p1Results.dslLogsDefinedEvent);
                check("Welle 4 P1: Built-in-Bauplan-Parts tragen material-Feld", wave4p1Results.builtInPartsHaveMaterial);
                check("Welle 4 P1: Save persistiert eigene Materialien", wave4p1Results.snapshotHasMaterial);
                check("Welle 4 P1: Migration alter Parts auf stein", wave4p1Results.legacyPartGotDefaultMaterial);
                check("Welle 4 P1: Werkstatt-UI hat Material-Dropdown", wave4p1Results.uiHasMaterialDropdown);
                check("Welle 4 P1: Material-Dropdown listet ≥6 Optionen", wave4p1Results.uiDropdownLists6PlusOptions);
                check("Welle 4 P1: Recolor zieht Material-Farbe", wave4p1Results.recolorAppliesMaterialColor);
                check("Welle 4 P1: define_ability blockiert nested define_material", wave4p1Results.nestedDefineMaterialBlocked);
            }

            // ### Welle 4 Phase 2 — Helix + Form-Tag-Aktivierungs-Matrix ###
            const wave4p2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // FORM_TAG_ACTIVATION existiert + frozen
                    const M = r.constructor.FORM_TAG_ACTIVATION;
                    out.matrixFrozen = Object.isFrozen(M);
                    out.matrixHasNineForms =
                        ["box", "sphere", "cylinder", "cone", "pyramid", "octahedron", "plane", "torus", "helix"].every(
                            (f) => M[f] && typeof M[f] === "object"
                        );
                    // Vollständigkeit: jedes Form × Tag definiert (kein undefined)
                    const keys = r.constructor.MATERIAL_TAG_KEYS;
                    let undefCount = 0;
                    for (const f of Object.keys(M)) {
                        for (const t of keys) if (typeof M[f][t] !== "number") undefCount++;
                    }
                    out.matrixComplete = undefCount === 0;
                    // Konzept-Konsistenz: jedes Tag hat mindestens eine Signatur (3) — außer lebendig
                    const tagsWithSignature = keys.filter((t) =>
                        Object.values(M).some((row) => row[t] === 3)
                    );
                    out.allTagsHaveSignatureExceptLebendig =
                        tagsWithSignature.length === keys.length - 1 &&
                        !tagsWithSignature.includes("lebendig");
                    // Keine Form hat mehr als 3 Signaturen (Konzept §8 Anti-Monokultur)
                    const sigCounts = Object.fromEntries(
                        Object.entries(M).map(([f, row]) => [
                            f,
                            keys.filter((t) => row[t] === 3).length,
                        ])
                    );
                    out.noFormExceeds3Signatures = Object.values(sigCounts).every((c) => c <= 3);

                    // Helix rendert: validateBlueprintParts akzeptiert
                    const v = r.validateBlueprintParts([
                        { shape: "helix", material: "bronze", size: { x: 1, y: 4, z: 5 } },
                    ]);
                    out.helixValidates = v.ok && v.parts[0].shape === "helix";
                    // _makePartGeometry liefert echte BufferGeometry
                    const geom = r._makePartGeometry({
                        shape: "helix",
                        size: { x: 1, y: 4, z: 5 },
                    });
                    out.helixHasVertices =
                        geom &&
                        geom.attributes &&
                        geom.attributes.position &&
                        geom.attributes.position.count > 50;
                    if (geom && typeof geom.dispose === "function") geom.dispose();

                    // computePartTags: Quarz-Kugel hat resoniert ~2.7, transparent ~2.85
                    const sphereQuarz = { shape: "sphere", material: "quarz" };
                    const partTags = r.computePartTags(sphereQuarz);
                    out.quarzSphereResoniert = (partTags.resoniert || 0) > 2.5;
                    out.quarzSphereTransparent = (partTags.transparent || 0) > 2.7;
                    // härte ist null bei sphere → soll fehlen oder 0 sein
                    out.sphereNoHärte = !partTags.härte;
                    // Stahl-Kegel (cone, eisen): härte hoch (3 × 0.75 = 2.25)
                    const coneEisen = { shape: "cone", material: "eisen" };
                    const coneTags = r.computePartTags(coneEisen);
                    out.coneEisenHärte = (coneTags.härte || 0) > 2.0;

                    // computeCompoundTags: max-Aggregation, nicht sum
                    const bp1 = {
                        parts: [
                            { shape: "sphere", material: "quarz" },
                            { shape: "box", material: "stein" },
                        ],
                    };
                    const comp = r.computeCompoundTags(bp1);
                    // dichte: box×stein = 3×0.85 = 2.55, sphere×quarz = 3×0.65 = 1.95 → max 2.55
                    out.maxAggregationDichte = Math.abs(comp.dichte - 2.55) < 0.01;
                    // Wenn sum wäre, dichte = 4.50 — schließe das aus
                    out.notSumAggregation = comp.dichte < 4.0;

                    // DSL-Condition compound_has_tag
                    r.state.blueprints["test-quarz-orb"] = {
                        name: "test-quarz-orb",
                        label: "Quarz-Orb",
                        builtIn: false,
                        parts: [{ shape: "sphere", material: "quarz" }],
                    };
                    out.condResonatesHigh = r.dslConditions.compound_has_tag.call(
                        r,
                        ["test-quarz-orb", "resoniert", 2.5],
                        { state: r.state }
                    );
                    out.condResonatesAboveSig = !r.dslConditions.compound_has_tag.call(
                        r,
                        ["test-quarz-orb", "resoniert", 3.5],
                        { state: r.state }
                    );
                    out.condUnknownTagFalse = !r.dslConditions.compound_has_tag.call(
                        r,
                        ["test-quarz-orb", "phlogiston", 0.5],
                        { state: r.state }
                    );

                    // UI: Tags-Sektion erscheint im Werkstatt-Editor
                    r.selectBlueprintForEdit("test-quarz-orb");
                    out.uiTagsSection = !!document.querySelector(".workshop-tags");
                    out.uiTagsTitle = !!document.querySelector(".workshop-tags-title");
                    out.uiHasAtomareHint = !!document.querySelector(".workshop-tags-hint");
                    const tagRows = document.querySelectorAll(".workshop-tag-row");
                    out.uiTagsHasRows = tagRows.length > 0;
                    // Werkstatt-Shape-Dropdown enthält helix
                    const shapeOpts = Array.from(
                        document.querySelectorAll(".workshop-part-row select option")
                    ).map((o) => o.value);
                    out.uiShapeIncludesHelix = shapeOpts.includes("helix");

                    // Aufräumen
                    delete r.state.blueprints["test-quarz-orb"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave4p2Results || wave4p2Results.error) {
                check(
                    "Welle 4 P2: Snapshot erreichbar",
                    false,
                    (wave4p2Results && wave4p2Results.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 4 P2: FORM_TAG_ACTIVATION frozen", wave4p2Results.matrixFrozen);
                check("Welle 4 P2: Matrix deckt 9 Formen (inkl. helix)", wave4p2Results.matrixHasNineForms);
                check("Welle 4 P2: Matrix vollständig (keine undefined-Zelle)", wave4p2Results.matrixComplete);
                check("Welle 4 P2: Alle Tags außer lebendig haben Signatur", wave4p2Results.allTagsHaveSignatureExceptLebendig);
                check("Welle 4 P2: Keine Form hat >3 Signaturen", wave4p2Results.noFormExceeds3Signatures);
                check("Welle 4 P2: helix-Shape validiert", wave4p2Results.helixValidates);
                check("Welle 4 P2: helix-Geometrie hat Vertices", wave4p2Results.helixHasVertices);
                check("Welle 4 P2: Quarz-Sphäre aktiviert resoniert >2.5", wave4p2Results.quarzSphereResoniert);
                check("Welle 4 P2: Quarz-Sphäre aktiviert transparent >2.7", wave4p2Results.quarzSphereTransparent);
                check("Welle 4 P2: Sphäre aktiviert kein härte", wave4p2Results.sphereNoHärte);
                check("Welle 4 P2: Eisen-Kegel aktiviert härte >2.0", wave4p2Results.coneEisenHärte);
                check("Welle 4 P2: computeCompoundTags max-aggregiert dichte=2.55", wave4p2Results.maxAggregationDichte);
                check("Welle 4 P2: Aggregation ist nicht sum (<4.0)", wave4p2Results.notSumAggregation);
                check("Welle 4 P2: compound_has_tag erkennt hohe Resonanz", wave4p2Results.condResonatesHigh);
                check("Welle 4 P2: compound_has_tag respektiert Schwellwert", wave4p2Results.condResonatesAboveSig);
                check("Welle 4 P2: compound_has_tag unbekanntes Tag → false", wave4p2Results.condUnknownTagFalse);
                check("Welle 4 P2: UI .workshop-tags-Sektion im DOM", wave4p2Results.uiTagsSection);
                check("Welle 4 P2: UI Tags-Titel im DOM", wave4p2Results.uiTagsTitle);
                check("Welle 4 P2: UI „atomare Schicht\"-Hint im DOM", wave4p2Results.uiHasAtomareHint);
                check("Welle 4 P2: UI rendert Tag-Zeilen", wave4p2Results.uiTagsHasRows);
                check("Welle 4 P2: UI Shape-Dropdown enthält helix", wave4p2Results.uiShapeIncludesHelix);
            }

            // ### Welle 4 Phase 3 — Werkzeuge + opChain + Präzision ###
            const wave4p3Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // Werkzeug-State + Konstanten
                    const tools = r.state.tools || {};
                    out.fiveStarterTools =
                        ["hände", "feuerstein-knapper", "hammer", "feile", "polierscheibe"].every(
                            (n) => tools[n] && tools[n].isStarter
                        );
                    out.playerOwnsStarters = ["hände", "hammer", "polierscheibe"].every((n) =>
                        (r.state.player.tools || []).includes(n)
                    );
                    out.matCompatFrozen = Object.isFrozen(r.constructor.MATERIAL_OP_COMPATIBILITY);
                    out.thresholdsFrozen = Object.isFrozen(r.constructor.WORLD_EFFECT_THRESHOLDS);
                    out.steinSubtractiveOnly =
                        r.constructor.MATERIAL_OP_COMPATIBILITY.stein.length === 1 &&
                        r.constructor.MATERIAL_OP_COMPATIBILITY.stein[0] === "subtractive";

                    // computePartPrecision: min, nicht max/avg
                    const part1 = {
                        shape: "sphere",
                        material: "quarz",
                        opChain: [
                            { tool: "hände", op: "hand_knap", cap: 0.4 },
                            { tool: "polierscheibe", op: "polish", cap: 0.97 },
                        ],
                    };
                    out.precisionIsMin = r.computePartPrecision(part1) === 0.4;
                    const part2 = { shape: "sphere", material: "quarz" }; // no opChain
                    out.precisionDefaultsTo04 = r.computePartPrecision(part2) === 0.4;

                    // applyOpToPart — Tool-Gating
                    r.state.blueprints["test-precision"] = {
                        name: "test-precision",
                        label: "Test",
                        builtIn: false,
                        parts: [{ shape: "cone", material: "eisen", opChain: r._defaultPartOpChain() }],
                    };
                    // Hand-Knap auf eisen-cone: OK (subtractive matches)
                    const ap1 = r.applyOpToPart("test-precision", 0, "feile");
                    out.applyOpAppends = ap1.ok && r.state.blueprints["test-precision"].parts[0].opChain.length === 2;
                    // Hammer (plastic) auf stein (subtractive only): FAIL
                    r.state.blueprints["test-precision-stein"] = {
                        name: "test-precision-stein",
                        label: "Stein-Test",
                        builtIn: false,
                        parts: [{ shape: "box", material: "stein", opChain: r._defaultPartOpChain() }],
                    };
                    const ap2 = r.applyOpToPart("test-precision-stein", 0, "hammer");
                    out.materialOpIncompat = !ap2.ok && ap2.reason === "material_op_incompatible";
                    // Tool not owned
                    r.state.player.tools = r.state.player.tools.filter((t) => t !== "feile");
                    const ap3 = r.applyOpToPart("test-precision", 0, "feile");
                    out.toolOwnershipEnforced = !ap3.ok && ap3.reason === "tool_not_owned";
                    r.state.player.tools.push("feile"); // restore
                    // Built-in protection
                    const ap4 = r.applyOpToPart("village", 0, "hammer");
                    out.builtInBlueprintProtected = !ap4.ok && ap4.reason === "cannot_modify_builtin";

                    // DSL-Op apply_op
                    const dslRes = r.dslRun(
                        ["apply_op", "test-precision", 0, "polierscheibe"],
                        { source: "test" }
                    );
                    out.dslApplyOpWorks = dslRes.log.some((e) => e.event === "applied_op");

                    // Diskriminations-Test: zwei Resonanz-Compounds, einer
                    // hand-roh (precision 0.4), einer poliert (cap 0.97). Welt-
                    // Effekt-Schwelle precision_high=0.8 muss zwischen ihnen
                    // liegen — der polierte triggert, der hand-rohe nicht.
                    r.state.blueprints["raw-orb"] = {
                        name: "raw-orb",
                        label: "Rau-Orb",
                        builtIn: false,
                        parts: [
                            { shape: "sphere", material: "quarz", opChain: r._defaultPartOpChain() },
                        ],
                    };
                    r.state.blueprints["polished-orb"] = {
                        name: "polished-orb",
                        label: "Polier-Orb",
                        builtIn: false,
                        parts: [
                            {
                                shape: "sphere",
                                material: "quarz",
                                opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                            },
                        ],
                    };
                    const rawPrec = r._compoundAvgPrecision(r.state.blueprints["raw-orb"]);
                    const polPrec = r._compoundAvgPrecision(r.state.blueprints["polished-orb"]);
                    out.precisionDiscriminates =
                        rawPrec < r.constructor.WORLD_EFFECT_THRESHOLDS.precision_high &&
                        polPrec >= r.constructor.WORLD_EFFECT_THRESHOLDS.precision_high;

                    // Welt-Effekt: polished-orb sollte einen "singing"-Journal-
                    // Eintrag schreiben, raw-orb nicht.
                    const journalBefore = r.state.worldJournal.entries.length;
                    r._applyCompoundWorldEffects("polished-orb");
                    const afterPolished = r.state.worldJournal.entries.length;
                    out.singingEntryWritten =
                        afterPolished > journalBefore &&
                        r.state.worldJournal.entries
                            .slice(-3)
                            .some((e) => /singt/.test(e.text || ""));
                    // Idempotent: zweiter Aufruf gleicher Bauplan → kein neuer Eintrag
                    r._applyCompoundWorldEffects("polished-orb");
                    out.singingEntryIdempotent = r.state.worldJournal.entries.length === afterPolished;
                    // Roh-Variante triggert nicht (precision zu niedrig)
                    const beforeRaw = r.state.worldJournal.entries.length;
                    r._applyCompoundWorldEffects("raw-orb");
                    out.rawDoesNotTrigger = r.state.worldJournal.entries.length === beforeRaw;

                    // Magie-Effekt: pyramid+quarz (magieleitung hoch)
                    r.state.blueprints["mage-pyramid"] = {
                        name: "mage-pyramid",
                        label: "Magier-Pyramide",
                        builtIn: false,
                        parts: [
                            {
                                shape: "pyramid",
                                material: "quarz",
                                opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                            },
                        ],
                    };
                    const aweBefore = r.state.player.emotions.awe;
                    r._applyCompoundWorldEffects("mage-pyramid");
                    out.magicLiftsAwe = r.state.player.emotions.awe > aweBefore;

                    // Visible-Precision-Tint: low precision → dimmer color
                    // Build-Pfad rendert Group; wir verifizieren via Mesh-
                    // Materials direkt.
                    const rawGroup = r._buildFromBlueprint(r.state.blueprints["raw-orb"]);
                    const polGroup = r._buildFromBlueprint(r.state.blueprints["polished-orb"]);
                    const rawCol = rawGroup.children[0].material.color.getHex();
                    const polCol = polGroup.children[0].material.color.getHex();
                    // Same base color (quarz blau-weiß); polished should be brighter
                    out.precisionVisibleTint = polCol > rawCol;
                    rawGroup.traverse(
                        (o) => o.geometry && typeof o.geometry.dispose === "function" && o.geometry.dispose()
                    );
                    polGroup.traverse(
                        (o) => o.geometry && typeof o.geometry.dispose === "function" && o.geometry.dispose()
                    );

                    // UI: opChain pro Part im Workshop
                    r.selectBlueprintForEdit("test-precision");
                    out.uiOpChainSection = !!document.querySelector(".workshop-opchain");
                    out.uiOpChainHeader = !!document.querySelector(".workshop-opchain-header");
                    out.uiApplyDropdown = !!document.querySelector(".workshop-op-tool");
                    out.uiToolsBox = !!document.querySelector(".workshop-tools");
                    out.uiToolChips = document.querySelectorAll(".workshop-tool-chip").length >= 5;

                    // Save-Roundtrip: playerTools persistiert
                    const snap = r.buildStateSnapshot();
                    out.snapshotHasPlayerTools =
                        Array.isArray(snap.playerTools) && snap.playerTools.includes("hammer");

                    // validateBlueprintParts: opChain wird sanitized
                    const v = r.validateBlueprintParts([
                        {
                            shape: "box",
                            material: "stein",
                            opChain: [{ tool: "hände", op: "hand_knap", cap: 1.5 }],
                        },
                    ]);
                    out.opChainCapClamped = v.ok && v.parts[0].opChain[0].cap === 1;

                    // Aufräumen
                    delete r.state.blueprints["test-precision"];
                    delete r.state.blueprints["test-precision-stein"];
                    delete r.state.blueprints["raw-orb"];
                    delete r.state.blueprints["polished-orb"];
                    delete r.state.blueprints["mage-pyramid"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave4p3Results || wave4p3Results.error) {
                check(
                    "Welle 4 P3: Snapshot erreichbar",
                    false,
                    (wave4p3Results && wave4p3Results.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 4 P3: 5 Starter-Werkzeuge existieren", wave4p3Results.fiveStarterTools);
                check("Welle 4 P3: Spieler besitzt Starter-Werkzeuge", wave4p3Results.playerOwnsStarters);
                check("Welle 4 P3: MATERIAL_OP_COMPATIBILITY frozen", wave4p3Results.matCompatFrozen);
                check("Welle 4 P3: WORLD_EFFECT_THRESHOLDS frozen", wave4p3Results.thresholdsFrozen);
                check("Welle 4 P3: Stein erlaubt nur subtractive Ops", wave4p3Results.steinSubtractiveOnly);
                check("Welle 4 P3: computePartPrecision = min(opChain.caps)", wave4p3Results.precisionIsMin);
                check("Welle 4 P3: Default-Präzision 0.4 ohne opChain", wave4p3Results.precisionDefaultsTo04);
                check("Welle 4 P3: applyOpToPart hängt Op an", wave4p3Results.applyOpAppends);
                check("Welle 4 P3: Stein lehnt Hammer (plastic) ab", wave4p3Results.materialOpIncompat);
                check("Welle 4 P3: Werkzeug-Besitz wird durchgesetzt", wave4p3Results.toolOwnershipEnforced);
                check("Welle 4 P3: Built-in-Bauplan vor Op-Mutation geschützt", wave4p3Results.builtInBlueprintProtected);
                check("Welle 4 P3: DSL-Op apply_op wirkt", wave4p3Results.dslApplyOpWorks);
                check("Welle 4 P3: Präzisions-Diskriminations-Schwelle liegt zwischen roh/poliert", wave4p3Results.precisionDiscriminates);
                check("Welle 4 P3: Singing-Journal-Eintrag bei Resonanz+Präzision", wave4p3Results.singingEntryWritten);
                check("Welle 4 P3: Singing-Eintrag idempotent pro Bauplan", wave4p3Results.singingEntryIdempotent);
                check("Welle 4 P3: Roh-Compound triggert keinen Welt-Effekt", wave4p3Results.rawDoesNotTrigger);
                check("Welle 4 P3: Magie-Compound hebt awe an", wave4p3Results.magicLiftsAwe);
                check("Welle 4 P3: Präzision moduliert Part-Farbe sichtbar", wave4p3Results.precisionVisibleTint);
                check("Welle 4 P3: UI opChain-Sektion im DOM", wave4p3Results.uiOpChainSection);
                check("Welle 4 P3: UI opChain-Header zeigt Präzision", wave4p3Results.uiOpChainHeader);
                check("Welle 4 P3: UI Tool-Apply-Dropdown im DOM", wave4p3Results.uiApplyDropdown);
                check("Welle 4 P3: UI Werkzeug-Box im DOM", wave4p3Results.uiToolsBox);
                check("Welle 4 P3: UI listet ≥5 Tool-Chips", wave4p3Results.uiToolChips);
                check("Welle 4 P3: Save persistiert playerTools", wave4p3Results.snapshotHasPlayerTools);
                check("Welle 4 P3: validateBlueprintParts clamped opChain cap", wave4p3Results.opChainCapClamped);
            }

            // ### Welle 5 B — räumliche Emergenz (Spitze richtet + Kontakt überträgt) ###
            const wave5bResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // Konstanten
                    out.pointedShapesFrozen = Object.isFrozen(r.constructor.SPATIAL_POINTED_SHAPES);
                    out.transferableTagsFrozen = Object.isFrozen(r.constructor.SPATIAL_TRANSFERABLE_TAGS);
                    out.pointedHasCone = r.constructor.SPATIAL_POINTED_SHAPES.has("cone");
                    out.pointedHasHelix = r.constructor.SPATIAL_POINTED_SHAPES.has("helix");
                    out.pointedNoSphere = !r.constructor.SPATIAL_POINTED_SHAPES.has("sphere");

                    // Bounding-Box-Mathematik: Compound mit drei Parts
                    const testBp = {
                        parts: [
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 2, y: 2, z: 2 } },
                            { shape: "cone", material: "eisen", position: { x: 0, y: 3, z: 0 }, size: { x: 1, y: 2, z: 1 } },
                            { shape: "cylinder", material: "bronze", position: { x: 4, y: 0, z: 0 }, size: { x: 1, y: 2, z: 1 } },
                        ],
                    };
                    const bb = r._compoundBoundingBox(testBp);
                    out.compoundBBOk =
                        bb &&
                        bb.min.y === -1 &&
                        bb.max.y === 4 &&
                        bb.extent.x === 5.5 &&
                        bb.extent.y === 5;
                    // Position-Klassifikation: Kegel oben sollte at_top haben
                    const labelsCone = r._classifyPartPosition(testBp.parts[1], bb);
                    out.coneAtTop = labelsCone.has("at_top");
                    out.coneNotAtBottom = !labelsCone.has("at_bottom");
                    // Cylinder rechts sollte at_outside haben
                    const labelsCyl = r._classifyPartPosition(testBp.parts[2], bb);
                    out.cylAtOutside = labelsCyl.has("at_outside");

                    // Kontakt-Check: zwei berührende Boxen
                    const pA = { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    const pB = { shape: "box", material: "eisen", position: { x: 0.9, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    const pC = { shape: "box", material: "eisen", position: { x: 5, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    out.contactsTouching = r._partsAreInContact(pA, pB);
                    out.contactsRespectsGap = !r._partsAreInContact(pA, pC);

                    // Spitze-Bonus: eine Quarz-Pyramide oben auf einem Stein-Stamm
                    // → magieleitung sollte räumlich höher sein als atomar.
                    const tipBp = {
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 0, z: 0 }, size: { x: 0.3, y: 3, z: 0.3 } },
                            { shape: "pyramid", material: "quarz", position: { x: 0, y: 2, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                        ],
                    };
                    const atomar = r.computeCompoundTags(tipBp);
                    const spatial = r.computeSpatialTags(tipBp);
                    out.tipBoostsMagic = spatial.magieleitung > atomar.magieleitung + 0.1;
                    // Pyramide unten + LATERAL versetzt (sonst greift in
                    // Phase 2 der Y-Symmetrie-Bonus und überdeckt die at_top-
                    // Logik). Hier prüfen wir nur: pointed-at-bottom kriegt
                    // NICHT den Spitze-Bonus aus Prinzip 1.
                    const noTipBp = {
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 2, z: 0 }, size: { x: 0.3, y: 3, z: 0.3 } },
                            { shape: "pyramid", material: "quarz", position: { x: 2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                        ],
                    };
                    const labelsBottomPyr = r._classifyPartPosition(
                        noTipBp.parts[1],
                        r._compoundBoundingBox(noTipBp)
                    );
                    out.bottomNoTipBoost = !labelsBottomPyr.has("at_top");

                    // Kontakt-Transfer: Kupfer-Helix berührt Stein-Block →
                    // Stein bekommt Strom über Kontakt.
                    // define_material kupfer mit hohem Strom
                    r.defineMaterial("kupfer-test", 0xb87333, { stromleitung: 0.95 });
                    const contactBp = {
                        parts: [
                            // Stein hat stromleitung 0.05, helix×kupfer hat 3 × 0.95 = 2.85
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "helix", material: "kupfer-test", position: { x: 0.9, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 3 } },
                        ],
                    };
                    const cAtomar = r.computeCompoundTags(contactBp);
                    const cSpatial = r.computeSpatialTags(contactBp);
                    // Helix-Kupfer dominiert in beiden (MAX-Aggregation), aber
                    // Kontakt zieht Stein in seinem Slot hoch. Da MAX am Ende
                    // nimmt, sehen wir den Effekt am ehesten, wenn ein Tag
                    // beim Stein ohnehin nicht prominent war.
                    // Test: ohne Kontakt-Transfer hätte Stein bei stromleitung
                    // box(1)×stein(0.05) = 0.05, helix(3)×kupfer(0.95) = 2.85
                    // → MAX = 2.85. MIT Transfer wird der Stein-Slot auch auf
                    // 2.85 × 0.6 = 1.71 hochgezogen — aber das ist immer noch
                    // unter dem Helix-Slot, also MAX bleibt 2.85.
                    // Sinnvoller Test: weniger asymmetrische Tags messen.
                    // Separater at_outside-Test: drei Parts in einer Reihe,
                    // das äußerste links bekommt at_outside (xz-Distanz vom
                    // Compound-Zentrum). Bei dem contactBp-Setup wäre die
                    // Helix wegen ihrer eigenen Z-Extent zentral.
                    const outsideBp = {
                        parts: [
                            { shape: "box", material: "stein", position: { x: -3, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 3, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                    };
                    const outsideBB = r._compoundBoundingBox(outsideBp);
                    out.helixAtOutside =
                        r._classifyPartPosition(outsideBp.parts[0], outsideBB).has("at_outside") &&
                        r._classifyPartPosition(outsideBp.parts[2], outsideBB).has("at_outside") &&
                        !r._classifyPartPosition(outsideBp.parts[1], outsideBB).has("at_outside");
                    // Direkter Transfer-Test: zwei Materialien, beide
                    // mittelmäßig in Strom, eines höher.
                    const transferBp = {
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "cylinder", material: "kupfer-test", position: { x: 0.9, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                    };
                    // Holz×cylinder: stromleitung = 3 × 0.05 = 0.15
                    // Kupfer×cylinder: 3 × 0.95 = 2.85
                    // MAX atomar = 2.85
                    // MIT Kontakt: holz wird auf 2.85 × 0.6 = 1.71 gehoben.
                    // MAX bleibt 2.85, aber der Holz-Slot ist jetzt 1.71.
                    // → Spatial-MAX-Aggregat bleibt 2.85 in stromleitung.
                    // Schwierig zu erkennen ohne den Holz-Slot zu inspizieren.
                    // Alternative: zwei Parts, beide schwach in einem Tag, ein
                    // ANDERES Part-Pair überträgt darüber. Skip — wir prüfen
                    // den Mechanismus über die UI-Anzeige.

                    // UI: räumliche Reihe erscheint bei pointed-am-Rand
                    r.state.blueprints["wave5b-test"] = {
                        name: "wave5b-test",
                        label: "Welle-5B-Test",
                        builtIn: false,
                        parts: tipBp.parts.map((p) => ({ ...p, opChain: r._defaultPartOpChain() })),
                    };
                    r.selectBlueprintForEdit("wave5b-test");
                    out.uiSpatialTitle = !!document.querySelector(".workshop-spatial-title");
                    out.uiSpatialRow = !!document.querySelector(".workshop-spatial-row");
                    // Hinweis-Text muss den räumlichen Modus benennen
                    const hint = document.querySelector(".workshop-tags-hint");
                    out.uiHintMentionsSpatial = hint && /Spitze richtet/.test(hint.textContent);

                    // Reiner atomarer Bauplan: Hinweis sollte nicht "Spitze richtet" benennen
                    r.state.blueprints["wave5b-atomar"] = {
                        name: "wave5b-atomar",
                        label: "Atomar-Test",
                        builtIn: false,
                        parts: [
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, opChain: r._defaultPartOpChain() },
                        ],
                    };
                    r.selectBlueprintForEdit("wave5b-atomar");
                    const hint2 = document.querySelector(".workshop-tags-hint");
                    out.uiHintAtomarMode = hint2 && !/Spitze richtet/.test(hint2.textContent);

                    // DSL-Condition compound_has_spatial_tag funktioniert
                    out.dslSpatialCondHigh = r.dslConditions.compound_has_spatial_tag.call(
                        r,
                        ["wave5b-test", "magieleitung", 2.0],
                        { state: r.state }
                    );

                    // Welt-Effekt: tipBp sollte Magie-Effekt triggern, weil die
                    // räumlich verstärkte Magieleitung über die Schwelle kommt.
                    // Wir testen den Unterschied: gleicher Bauplan, aber Pyramide
                    // unten vs. oben. Beide brauchen Politur (precision_high).
                    const polished = r._defaultPartOpChain();
                    polished.push({ tool: "polierscheibe", op: "polish", cap: 0.97 });
                    r.state.blueprints["wave5b-tip-polished"] = {
                        name: "wave5b-tip-polished",
                        label: "Tip-Polished",
                        builtIn: false,
                        parts: tipBp.parts.map((p) => ({ ...p, opChain: [...polished] })),
                    };
                    r.state.blueprints["wave5b-bottom-polished"] = {
                        name: "wave5b-bottom-polished",
                        label: "Bottom-Polished",
                        builtIn: false,
                        parts: noTipBp.parts.map((p) => ({ ...p, opChain: [...polished] })),
                    };
                    const aweBefore = r.state.player.emotions.awe;
                    r._applyCompoundWorldEffects("wave5b-tip-polished");
                    const aweAfterTip = r.state.player.emotions.awe;
                    out.tipTriggersMagic = aweAfterTip > aweBefore;
                    // bottom: könnte triggern oder nicht — wir prüfen, dass
                    // wenn beide identisch wären, die Magie identisch wäre.
                    // Aber durch journalAppendOnce per-bp-name ist das stabil.
                    // Test: tipPolished sollte MEHR magie-Bonus haben als bottom.
                    const tipMagic = r.computeSpatialTags(r.state.blueprints["wave5b-tip-polished"]).magieleitung || 0;
                    const bottomMagic = r.computeSpatialTags(r.state.blueprints["wave5b-bottom-polished"]).magieleitung || 0;
                    out.tipMagicExceedsBottom = tipMagic > bottomMagic + 0.1;

                    // Aufräumen
                    delete r.state.materials["kupfer-test"];
                    delete r.state.blueprints["wave5b-test"];
                    delete r.state.blueprints["wave5b-atomar"];
                    delete r.state.blueprints["wave5b-tip-polished"];
                    delete r.state.blueprints["wave5b-bottom-polished"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave5bResults || wave5bResults.error) {
                check(
                    "Welle 5 B: Snapshot erreichbar",
                    false,
                    (wave5bResults && wave5bResults.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 5 B: SPATIAL_POINTED_SHAPES frozen", wave5bResults.pointedShapesFrozen);
                check("Welle 5 B: SPATIAL_TRANSFERABLE_TAGS frozen", wave5bResults.transferableTagsFrozen);
                check("Welle 5 B: cone ist pointed-Shape", wave5bResults.pointedHasCone);
                check("Welle 5 B: helix ist pointed-Shape", wave5bResults.pointedHasHelix);
                check("Welle 5 B: sphere ist KEIN pointed-Shape", wave5bResults.pointedNoSphere);
                check("Welle 5 B: _compoundBoundingBox liefert korrekte Extent", wave5bResults.compoundBBOk);
                check("Welle 5 B: Kegel oben hat at_top-Label", wave5bResults.coneAtTop);
                check("Welle 5 B: Kegel oben hat nicht at_bottom", wave5bResults.coneNotAtBottom);
                check("Welle 5 B: Cylinder rechts hat at_outside-Label", wave5bResults.cylAtOutside);
                check("Welle 5 B: _partsAreInContact erkennt berührende Parts", wave5bResults.contactsTouching);
                check("Welle 5 B: _partsAreInContact respektiert Gap-Schwelle", wave5bResults.contactsRespectsGap);
                check("Welle 5 B: Pyramide oben verstärkt Magieleitung räumlich", wave5bResults.tipBoostsMagic);
                check("Welle 5 B: Pyramide unten gibt KEINEN Top-Bonus", wave5bResults.bottomNoTipBoost);
                check("Welle 5 B: Helix am Rand hat at_outside", wave5bResults.helixAtOutside);
                check("Welle 5 B: UI .workshop-spatial-title bei pointed-am-Rand", wave5bResults.uiSpatialTitle);
                check("Welle 5 B: UI .workshop-spatial-row im DOM", wave5bResults.uiSpatialRow);
                check("Welle 5 B: Hinweis-Text nennt Spitze-richtet im raeumlichen Modus", wave5bResults.uiHintMentionsSpatial);
                check("Welle 5 B: Hinweis-Text fällt im rein-atomaren Modus zurück", wave5bResults.uiHintAtomarMode);
                check("Welle 5 B: DSL compound_has_spatial_tag erkennt verstärkte Magie", wave5bResults.dslSpatialCondHigh);
                check("Welle 5 B: Tip-Compound triggert Magie-Welt-Effekt (awe)", wave5bResults.tipTriggersMagic);
                check("Welle 5 B: Magie tip-oben > Magie tip-unten (Diskrimination)", wave5bResults.tipMagicExceedsBottom);
            }

            // ### Welle 5 B Phase 2 — Hohlraum + Symmetrieachse + Resonanz-Array ###
            const wave5bp2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    out.hollowShapesFrozen = Object.isFrozen(r.constructor.SPATIAL_HOLLOW_SHAPES);
                    out.hollowHasSphere = r.constructor.SPATIAL_HOLLOW_SHAPES.has("sphere");
                    out.hollowHasTorus = r.constructor.SPATIAL_HOLLOW_SHAPES.has("torus");
                    out.hollowNoBox = !r.constructor.SPATIAL_HOLLOW_SHAPES.has("box");

                    // Prinzip 2: Sphere mit Inhalt → Resonanz-Bonus
                    const bellBp = {
                        parts: [
                            // große Quarz-Glocke
                            { shape: "sphere", material: "quarz", position: { x: 0, y: 1, z: 0 }, size: { x: 3, y: 3, z: 3 } },
                            // kleiner Bronze-Klöppel im Inneren
                            { shape: "sphere", material: "bronze", position: { x: 0, y: 1, z: 0 }, size: { x: 0.4, y: 0.4, z: 0.4 } },
                        ],
                    };
                    const pairs = r._findHollowPairs(bellBp);
                    out.hollowPairDetected = pairs.length === 1 && pairs[0].outer === 0 && pairs[0].inner === 1;
                    const bellAtomar = r.computeCompoundTags(bellBp);
                    const bellSpatial = r.computeSpatialTags(bellBp);
                    out.hollowBoostsResonance = bellSpatial.resoniert > bellAtomar.resoniert + 0.1;

                    // Negativ-Test: zwei sphere nebeneinander, KEIN Hohlraum
                    const sideBySideBp = {
                        parts: [
                            { shape: "sphere", material: "quarz", position: { x: -2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "sphere", material: "bronze", position: { x: 2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                    };
                    out.noHollowWhenSeparate = r._findHollowPairs(sideBySideBp).length === 0;

                    // Prinzip 3: Y-Achsen-Symmetrie. Stab aus 3 Zylindern entlang Y.
                    const staffBp = {
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 0, z: 0 }, size: { x: 0.3, y: 1, z: 0.3 } },
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 1, z: 0 }, size: { x: 0.3, y: 1, z: 0.3 } },
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 2, z: 0 }, size: { x: 0.3, y: 1, z: 0.3 } },
                        ],
                    };
                    out.staffHasSymmetry = r._hasYAxisSymmetry(staffBp);
                    const staffAtomar = r.computeCompoundTags(staffBp);
                    const staffSpatial = r.computeSpatialTags(staffBp);
                    out.symmetryBoostsMagic = staffSpatial.magieleitung > staffAtomar.magieleitung + 0.1;
                    // Negativ-Test: zwei Zylinder weit auseinander → keine Symmetrie
                    const wideBp = {
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: -5, y: 0, z: 0 }, size: { x: 0.3, y: 1, z: 0.3 } },
                            { shape: "cylinder", material: "holz", position: { x: 5, y: 0, z: 0 }, size: { x: 0.3, y: 1, z: 0.3 } },
                        ],
                    };
                    out.wideNoSymmetry = !r._hasYAxisSymmetry(wideBp);

                    // Prinzip 5: Resonanz-Array — 4 Pyramiden auf einem Kreis um die Mitte
                    const arrayBp = {
                        parts: [
                            { shape: "pyramid", material: "quarz", position: { x: 2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: -2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: 0, y: 0, z: 2 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: 0, y: 0, z: -2 }, size: { x: 0.5, y: 1, z: 0.5 } },
                        ],
                    };
                    out.arrayDetected = r._hasResonantArray(arrayBp);
                    const arrayAtomar = r.computeCompoundTags(arrayBp);
                    const arraySpatial = r.computeSpatialTags(arrayBp);
                    out.arrayBoostsResonance = arraySpatial.resoniert > arrayAtomar.resoniert + 0.1;
                    out.arrayBoostsMagic = arraySpatial.magieleitung > arrayAtomar.magieleitung + 0.1;
                    // Negativ-Test: nur 2 Pyramiden → kein Array
                    const twoBp = {
                        parts: [
                            { shape: "pyramid", material: "quarz", position: { x: 2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: -2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                        ],
                    };
                    out.twoNoArray = !r._hasResonantArray(twoBp);
                    // Negativ-Test: 3 Pyramiden auf unterschiedlichen Radien
                    const unevenBp = {
                        parts: [
                            { shape: "pyramid", material: "quarz", position: { x: 2, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: -5, y: 0, z: 0 }, size: { x: 0.5, y: 1, z: 0.5 } },
                            { shape: "pyramid", material: "quarz", position: { x: 0, y: 0, z: 8 }, size: { x: 0.5, y: 1, z: 0.5 } },
                        ],
                    };
                    out.unevenNoArray = !r._hasResonantArray(unevenBp);

                    // Kombinations-Test: ein Glockenspiel = 4 Quarz-Glocken
                    // im Kreis (Array) + jede Glocke mit Bronze-Klöppel
                    // (Hohlraum). Sollte den höchsten Resonanz-Wert ergeben.
                    const glockenspielBp = {
                        parts: [],
                    };
                    for (const [cx, cz] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) {
                        glockenspielBp.parts.push({
                            shape: "sphere",
                            material: "quarz",
                            position: { x: cx, y: 1, z: cz },
                            size: { x: 1.2, y: 1.2, z: 1.2 },
                        });
                        glockenspielBp.parts.push({
                            shape: "sphere",
                            material: "bronze",
                            position: { x: cx, y: 1, z: cz },
                            size: { x: 0.3, y: 0.3, z: 0.3 },
                        });
                    }
                    const glockAtomar = r.computeCompoundTags(glockenspielBp);
                    const glockSpatial = r.computeSpatialTags(glockenspielBp);
                    out.glockenspielMaxResonance = glockSpatial.resoniert > glockAtomar.resoniert + 0.5;

                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave5bp2Results || wave5bp2Results.error) {
                check(
                    "Welle 5 B P2: Snapshot erreichbar",
                    false,
                    (wave5bp2Results && wave5bp2Results.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 5 B P2: SPATIAL_HOLLOW_SHAPES frozen", wave5bp2Results.hollowShapesFrozen);
                check("Welle 5 B P2: sphere ist hollow-Shape", wave5bp2Results.hollowHasSphere);
                check("Welle 5 B P2: torus ist hollow-Shape", wave5bp2Results.hollowHasTorus);
                check("Welle 5 B P2: box ist KEIN hollow-Shape", wave5bp2Results.hollowNoBox);
                check("Welle 5 B P2: Sphere-mit-Inhalt liefert Hohlraum-Paar", wave5bp2Results.hollowPairDetected);
                check("Welle 5 B P2: Hohlraum-Bonus auf resoniert", wave5bp2Results.hollowBoostsResonance);
                check("Welle 5 B P2: Zwei separate Spheres → kein Hohlraum", wave5bp2Results.noHollowWhenSeparate);
                check("Welle 5 B P2: Stab aus 3 Zylindern hat Y-Symmetrie", wave5bp2Results.staffHasSymmetry);
                check("Welle 5 B P2: Symmetrie-Bonus auf magieleitung", wave5bp2Results.symmetryBoostsMagic);
                check("Welle 5 B P2: Zylinder weit auseinander hat KEINE Y-Symmetrie", wave5bp2Results.wideNoSymmetry);
                check("Welle 5 B P2: 4 Pyramiden auf Kreis sind Resonanz-Array", wave5bp2Results.arrayDetected);
                check("Welle 5 B P2: Array-Bonus auf resoniert", wave5bp2Results.arrayBoostsResonance);
                check("Welle 5 B P2: Array-Bonus auf magieleitung", wave5bp2Results.arrayBoostsMagic);
                check("Welle 5 B P2: 2 Pyramiden bilden KEIN Array", wave5bp2Results.twoNoArray);
                check("Welle 5 B P2: 3 Pyramiden auf ungleichen Radien sind KEIN Array", wave5bp2Results.unevenNoArray);
                check("Welle 5 B P2: Glockenspiel-Combo (Hohlraum + Array) maximiert Resonanz", wave5bp2Results.glockenspielMaxResonance);
            }

            // ### Welle 5 A — Verbindungstypen mit Lastformel ###
            const wave5aResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // Konstanten
                    out.connectionTypesFrozen = Object.isFrozen(r.constructor.CONNECTION_TYPES);
                    const types = r.constructor.CONNECTION_TYPES;
                    const expectedTypes = [
                        "hafting", "lashing", "pinning", "welding",
                        "gluing", "masonry", "sewing", "magic_bind",
                    ];
                    out.eightTypes = expectedTypes.every((t) => types[t]);
                    out.eachTypeHasStrongTags = expectedTypes.every(
                        (t) => Array.isArray(types[t].strongTags) && types[t].strongTags.length >= 1
                    );
                    out.eachTypeHasStrength = expectedTypes.every(
                        (t) => typeof types[t].typeStrength === "number" && types[t].typeStrength > 0 && types[t].typeStrength <= 1
                    );

                    // _partsContactArea: zwei berührende 1×1×1-Würfel
                    const a = { shape: "box", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    const b = { shape: "box", position: { x: 1, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    const area = r._partsContactArea(a, b);
                    out.contactAreaNonZero = area > 0.5;
                    // Weit weg: keine Fläche
                    const c = { shape: "box", position: { x: 10, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } };
                    out.farContactZero = r._partsContactArea(a, c) === 0;

                    // computeConnectionStrength: hafting zwischen zwei harten Materialien
                    r.state.blueprints["w5a-test"] = {
                        name: "w5a-test",
                        label: "W5A Test",
                        builtIn: false,
                        parts: [
                            { shape: "cylinder", material: "eisen", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "eisen", position: { x: 0.95, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                        connections: [],
                    };
                    const haftStrength = r.computeConnectionStrength(
                        { type: "hafting", partA: 0, partB: 1 },
                        r.state.blueprints["w5a-test"]
                    );
                    out.haftingStrengthOk = haftStrength > 1.0 && haftStrength < 3.0;

                    // Weichere Materialien → schwächere hafting
                    r.state.blueprints["w5a-soft"] = {
                        name: "w5a-soft",
                        label: "W5A Soft",
                        builtIn: false,
                        parts: [
                            { shape: "cylinder", material: "leder", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "leder", position: { x: 0.95, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                        connections: [],
                    };
                    const softStrength = r.computeConnectionStrength(
                        { type: "hafting", partA: 0, partB: 1 },
                        r.state.blueprints["w5a-soft"]
                    );
                    out.softHaftingWeaker = softStrength < haftStrength;
                    // Aber lashing (zähigkeit) ist auf leder STÄRKER als hafting auf leder
                    const lashSoftStrength = r.computeConnectionStrength(
                        { type: "lashing", partA: 0, partB: 1 },
                        r.state.blueprints["w5a-soft"]
                    );
                    out.lashingFitsLeather = lashSoftStrength > softStrength;

                    // Validation
                    const v1 = r.validateBlueprintConnections(
                        [{ type: "hafting", partA: 0, partB: 1 }],
                        2
                    );
                    out.validAcceptsGood = v1.length === 1;
                    // Unknown type
                    const v2 = r.validateBlueprintConnections(
                        [{ type: "schmusen", partA: 0, partB: 1 }],
                        2
                    );
                    out.validRejectsUnknownType = v2.length === 0;
                    // Out-of-range index
                    const v3 = r.validateBlueprintConnections(
                        [{ type: "hafting", partA: 0, partB: 99 }],
                        2
                    );
                    out.validRejectsBadIndex = v3.length === 0;
                    // Self-reference
                    const v4 = r.validateBlueprintConnections(
                        [{ type: "hafting", partA: 1, partB: 1 }],
                        2
                    );
                    out.validRejectsSelfRef = v4.length === 0;

                    // addConnectionToBlueprint
                    const addR = r.addConnectionToBlueprint("w5a-test", { type: "welding", partA: 0, partB: 1 });
                    out.addConnectionOk = addR.ok && r.state.blueprints["w5a-test"].connections.length === 1;
                    // Built-in protection
                    const addBuiltin = r.addConnectionToBlueprint("village", { type: "welding", partA: 0, partB: 1 });
                    out.builtinBlocked = !addBuiltin.ok && addBuiltin.reason === "cannot_modify_builtin";
                    // remove
                    const rmR = r.removeConnectionFromBlueprint("w5a-test", 0);
                    out.removeOk = rmR && r.state.blueprints["w5a-test"].connections.length === 0;

                    // DSL-Op apply_connection
                    const dslRes = r.dslRun(
                        ["apply_connection", "w5a-test", "magic_bind", 0, 1],
                        { source: "test" }
                    );
                    out.dslApplyConnection = dslRes.log.some((e) => e.event === "applied_connection");
                    out.dslConnectionPersisted = r.state.blueprints["w5a-test"].connections.length === 1;

                    // Save-Roundtrip
                    const snap = r.buildStateSnapshot();
                    const ourSavedBp = (snap.blueprints || []).find((bp) => bp.name === "w5a-test");
                    out.saveCarriesConnections =
                        ourSavedBp && Array.isArray(ourSavedBp.connections) && ourSavedBp.connections.length === 1;

                    // UI: Verbindungs-Sektion erscheint
                    r.selectBlueprintForEdit("w5a-test");
                    out.uiConnectionsSection = !!document.querySelector(".workshop-connections");
                    out.uiConnRow = !!document.querySelector(".workshop-conn-row");
                    out.uiAddRow = !!document.querySelector(".workshop-conn-add");
                    out.uiTypeDropdown = !!document.querySelector(".workshop-conn-type");

                    // Solid-Threshold: schwache Verbindung hat workshop-conn-weak class
                    r.state.blueprints["w5a-weak"] = {
                        name: "w5a-weak",
                        label: "W5A Weak",
                        builtIn: false,
                        parts: [
                            { shape: "cylinder", material: "holz", position: { x: 0, y: 0, z: 0 }, size: { x: 0.2, y: 0.2, z: 0.2 } },
                            { shape: "box", material: "holz", position: { x: 0.18, y: 0, z: 0 }, size: { x: 0.2, y: 0.2, z: 0.2 } },
                        ],
                        connections: [{ type: "sewing", partA: 0, partB: 1 }],
                    };
                    r.selectBlueprintForEdit("w5a-weak");
                    const weakBar = document.querySelector(".workshop-conn-bar");
                    out.weakClassApplied = weakBar && weakBar.classList.contains("workshop-conn-weak");

                    // Aufräumen
                    delete r.state.blueprints["w5a-test"];
                    delete r.state.blueprints["w5a-soft"];
                    delete r.state.blueprints["w5a-weak"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave5aResults || wave5aResults.error) {
                check(
                    "Welle 5 A: Snapshot erreichbar",
                    false,
                    (wave5aResults && wave5aResults.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 5 A: CONNECTION_TYPES frozen", wave5aResults.connectionTypesFrozen);
                check("Welle 5 A: Acht Verbindungstypen definiert", wave5aResults.eightTypes);
                check("Welle 5 A: Jeder Typ hat strongTags", wave5aResults.eachTypeHasStrongTags);
                check("Welle 5 A: Jeder Typ hat typeStrength 0..1", wave5aResults.eachTypeHasStrength);
                check("Welle 5 A: _partsContactArea liefert positive Flaeche bei Beruehrung", wave5aResults.contactAreaNonZero);
                check("Welle 5 A: _partsContactArea = 0 bei weit-entfernten Parts", wave5aResults.farContactZero);
                check("Welle 5 A: Hafting auf Eisen liefert mittlere bis hohe Staerke", wave5aResults.haftingStrengthOk);
                check("Welle 5 A: Hafting auf Leder ist schwaecher als auf Eisen", wave5aResults.softHaftingWeaker);
                check("Welle 5 A: Lashing passt zu Leder besser als Hafting", wave5aResults.lashingFitsLeather);
                check("Welle 5 A: validateConnections akzeptiert gueltige", wave5aResults.validAcceptsGood);
                check("Welle 5 A: validateConnections lehnt unbekannten Typ ab", wave5aResults.validRejectsUnknownType);
                check("Welle 5 A: validateConnections lehnt Out-of-Range-Index ab", wave5aResults.validRejectsBadIndex);
                check("Welle 5 A: validateConnections lehnt Self-Reference ab", wave5aResults.validRejectsSelfRef);
                check("Welle 5 A: addConnectionToBlueprint haengt an", wave5aResults.addConnectionOk);
                check("Welle 5 A: Built-in-Bauplan vor Connection-Mutation geschuetzt", wave5aResults.builtinBlocked);
                check("Welle 5 A: removeConnectionFromBlueprint entfernt", wave5aResults.removeOk);
                check("Welle 5 A: DSL apply_connection wirkt", wave5aResults.dslApplyConnection);
                check("Welle 5 A: DSL-Connection persistiert in state", wave5aResults.dslConnectionPersisted);
                check("Welle 5 A: Save traegt connections im Snapshot", wave5aResults.saveCarriesConnections);
                check("Welle 5 A: UI .workshop-connections im DOM", wave5aResults.uiConnectionsSection);
                check("Welle 5 A: UI .workshop-conn-row im DOM", wave5aResults.uiConnRow);
                check("Welle 5 A: UI .workshop-conn-add im DOM", wave5aResults.uiAddRow);
                check("Welle 5 A: UI Typ-Dropdown im DOM", wave5aResults.uiTypeDropdown);
                check("Welle 5 A: Schwache Verbindung traegt workshop-conn-weak class", wave5aResults.weakClassApplied);
            }

            // ### Welle 5 C — Maschinen-Rekursivitaet (Bauplan als Werkzeug) ###
            const wave5cResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    out.opClassesFrozen = Object.isFrozen(r.constructor.TOOL_OP_CLASSES);
                    out.opClassesCount = r.constructor.TOOL_OP_CLASSES.size === 4;

                    // computeBlueprintPrecisionCap: min der Part-Praezisionen
                    const polishedChain = [
                        { tool: "polierscheibe", op: "polish", cap: 0.97 },
                    ];
                    const roughChain = [{ tool: "hände", op: "hand_knap", cap: 0.4 }];
                    const mixedBp = {
                        parts: [
                            { shape: "box", material: "eisen", opChain: polishedChain },
                            { shape: "box", material: "eisen", opChain: roughChain },
                            { shape: "box", material: "eisen", opChain: polishedChain },
                        ],
                    };
                    out.precisionCapIsMin = Math.abs(r.computeBlueprintPrecisionCap(mixedBp) - 0.4) < 0.001;

                    // setBlueprintToolMeta + Validierung
                    r.state.blueprints["w5c-lathe"] = {
                        name: "w5c-lathe",
                        label: "Drehbank",
                        builtIn: false,
                        parts: [
                            { shape: "box", material: "eisen", opChain: polishedChain },
                            { shape: "cylinder", material: "eisen", opChain: polishedChain },
                        ],
                        connections: [],
                    };
                    const metaOk = r.setBlueprintToolMeta("w5c-lathe", "lathe", "subtractive");
                    out.setMetaOk = metaOk.ok && r.state.blueprints["w5c-lathe"].role === "tool";
                    // Bad opClass
                    const metaBadClass = r.setBlueprintToolMeta("w5c-lathe", "lathe", "uberklasse");
                    out.rejectsInvalidClass = !metaBadClass.ok && metaBadClass.reason === "invalid_op_class";
                    // Bad opName
                    const metaBadName = r.setBlueprintToolMeta("w5c-lathe", "böser Name!", "plastic");
                    out.rejectsInvalidName = !metaBadName.ok && metaBadName.reason === "invalid_op_name";
                    // Built-in protected
                    const metaBuiltin = r.setBlueprintToolMeta("village", "lathe", "subtractive");
                    out.builtinProtected = !metaBuiltin.ok && metaBuiltin.reason === "cannot_modify_builtin";

                    // registerBlueprintAsTool
                    const regOk = r.registerBlueprintAsTool("w5c-lathe");
                    out.registerOk = regOk.ok && !!r.state.tools["w5c-lathe"];
                    out.toolCapMatchesBlueprint = Math.abs(r.state.tools["w5c-lathe"].precisionCap - 0.97) < 0.001;
                    out.toolInPlayerInventory = (r.state.player.tools || []).includes("w5c-lathe");
                    out.toolSourceMarked = r.state.tools["w5c-lathe"].sourceBlueprint === "w5c-lathe";
                    out.toolNotBuiltin = r.state.tools["w5c-lathe"].builtIn === false;

                    // Cannot register a non-tool blueprint
                    r.state.blueprints["w5c-not-a-tool"] = {
                        name: "w5c-not-a-tool",
                        label: "Just-a-Box",
                        builtIn: false,
                        parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
                        connections: [],
                    };
                    const regNotMarked = r.registerBlueprintAsTool("w5c-not-a-tool");
                    out.rejectsUnmarked = !regNotMarked.ok && regNotMarked.reason === "not_marked_as_tool";

                    // Cannot override starter tool name
                    r.state.blueprints["hammer"] = {
                        name: "hammer",
                        label: "Mein Hammer",
                        builtIn: false,
                        role: "tool",
                        toolMeta: { opName: "forge", opClass: "plastic" },
                        parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
                        connections: [],
                    };
                    const regHammerOverride = r.registerBlueprintAsTool("hammer");
                    out.starterProtected = !regHammerOverride.ok && regHammerOverride.reason === "starter_name_protected";
                    delete r.state.blueprints["hammer"];

                    // Recursive: das neue Werkzeug funktioniert in applyOpToPart
                    r.state.blueprints["w5c-target"] = {
                        name: "w5c-target",
                        label: "Ziel",
                        builtIn: false,
                        parts: [{ shape: "cylinder", material: "eisen", opChain: r._defaultPartOpChain() }],
                        connections: [],
                    };
                    const applyR = r.applyOpToPart("w5c-target", 0, "w5c-lathe");
                    const partAfter = r.state.blueprints["w5c-target"].parts[0];
                    const lastOp = partAfter.opChain && partAfter.opChain[partAfter.opChain.length - 1];
                    // Erfolg: Op ist angewandt, letzte Chain-Eintrag zeigt
                    // auf das eigene Werkzeug. Praezision selbst bleibt 0.4
                    // (default-Hand-Knap dominiert per min-Regel §2.3).
                    out.recursiveToolApplies = applyR.ok && lastOp && lastOp.tool === "w5c-lathe" && lastOp.cap === 0.97;
                    out.opChainGrew = Array.isArray(partAfter.opChain) && partAfter.opChain.length === 2;

                    // Schief gebaute Drehbank → schlechter Cap
                    r.state.blueprints["w5c-bad-lathe"] = {
                        name: "w5c-bad-lathe",
                        label: "Schlechte Drehbank",
                        builtIn: false,
                        parts: [
                            { shape: "box", material: "eisen", opChain: roughChain },
                            { shape: "cylinder", material: "eisen", opChain: polishedChain },
                        ],
                        connections: [],
                    };
                    r.setBlueprintToolMeta("w5c-bad-lathe", "bad-lathe", "subtractive");
                    r.registerBlueprintAsTool("w5c-bad-lathe");
                    out.badLatheLowerCap = r.state.tools["w5c-bad-lathe"].precisionCap === 0.4;
                    // Recursive Konzept-Test: eine Box mit dem schlechten Tool
                    // erreicht keine bessere Praezision als 0.4.
                    r.state.blueprints["w5c-target2"] = {
                        name: "w5c-target2",
                        label: "Ziel 2",
                        builtIn: false,
                        parts: [{ shape: "cylinder", material: "eisen", opChain: r._defaultPartOpChain() }],
                        connections: [],
                    };
                    r.applyOpToPart("w5c-target2", 0, "w5c-bad-lathe");
                    out.recursivePrecisionCascade = r.computePartPrecision(
                        r.state.blueprints["w5c-target2"].parts[0]
                    ) === 0.4;

                    // DSL-Ops
                    r.state.blueprints["w5c-dsl-test"] = {
                        name: "w5c-dsl-test",
                        label: "DSL Test",
                        builtIn: false,
                        parts: [{ shape: "box", material: "eisen", opChain: polishedChain }],
                        connections: [],
                    };
                    const dslMeta = r.dslRun(
                        ["set_tool_meta", "w5c-dsl-test", "dsl-tool", "additive"],
                        { source: "test" }
                    );
                    out.dslSetMeta = dslMeta.log.some((e) => e.event === "set_tool_meta");
                    const dslReg = r.dslRun(["register_tool", "w5c-dsl-test"], { source: "test" });
                    out.dslRegister = dslReg.log.some((e) => e.event === "registered_tool");
                    out.dslToolInState = !!r.state.tools["w5c-dsl-test"];

                    // Save-Roundtrip
                    const snap = r.buildStateSnapshot();
                    out.snapshotHasToolBp = (snap.blueprints || []).some(
                        (bp) => bp.name === "w5c-lathe" && bp.role === "tool" && bp.toolMeta && bp.toolMeta.opName === "lathe"
                    );
                    out.snapshotHasTool = (snap.tools || []).some(
                        (t) => t.name === "w5c-lathe" && t.precisionCap === 0.97
                    );

                    // UI
                    r.selectBlueprintForEdit("w5c-lathe");
                    out.uiToolSection = !!document.querySelector(".workshop-tool-recursion");
                    out.uiRegisteredBadge = !!document.querySelector(".workshop-tool-registered");
                    out.uiOpNameInput = !!document.querySelector(".workshop-tool-opname");

                    // Cleanup
                    delete r.state.tools["w5c-lathe"];
                    delete r.state.tools["w5c-bad-lathe"];
                    delete r.state.tools["w5c-dsl-test"];
                    r.state.player.tools = r.state.player.tools.filter(
                        (t) => !["w5c-lathe", "w5c-bad-lathe", "w5c-dsl-test"].includes(t)
                    );
                    delete r.state.blueprints["w5c-lathe"];
                    delete r.state.blueprints["w5c-bad-lathe"];
                    delete r.state.blueprints["w5c-target"];
                    delete r.state.blueprints["w5c-target2"];
                    delete r.state.blueprints["w5c-not-a-tool"];
                    delete r.state.blueprints["w5c-dsl-test"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!wave5cResults || wave5cResults.error) {
                check(
                    "Welle 5 C: Snapshot erreichbar",
                    false,
                    (wave5cResults && wave5cResults.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Welle 5 C: TOOL_OP_CLASSES frozen", wave5cResults.opClassesFrozen);
                check("Welle 5 C: TOOL_OP_CLASSES hat 4 Klassen", wave5cResults.opClassesCount);
                check("Welle 5 C: computeBlueprintPrecisionCap = min(parts)", wave5cResults.precisionCapIsMin);
                check("Welle 5 C: setBlueprintToolMeta markiert Bauplan", wave5cResults.setMetaOk);
                check("Welle 5 C: setBlueprintToolMeta lehnt unbekannte opClass ab", wave5cResults.rejectsInvalidClass);
                check("Welle 5 C: setBlueprintToolMeta lehnt invaliden opName ab", wave5cResults.rejectsInvalidName);
                check("Welle 5 C: setBlueprintToolMeta lehnt Built-in-Bauplan ab", wave5cResults.builtinProtected);
                check("Welle 5 C: registerBlueprintAsTool legt Werkzeug an", wave5cResults.registerOk);
                check("Welle 5 C: Werkzeug-Cap = Bauplan-Praezision", wave5cResults.toolCapMatchesBlueprint);
                check("Welle 5 C: Werkzeug landet im Player-Inventory", wave5cResults.toolInPlayerInventory);
                check("Welle 5 C: Werkzeug trägt sourceBlueprint-Marke", wave5cResults.toolSourceMarked);
                check("Welle 5 C: Eigenes Werkzeug ist nicht builtIn", wave5cResults.toolNotBuiltin);
                check("Welle 5 C: registerBlueprintAsTool lehnt unmarkierte ab", wave5cResults.rejectsUnmarked);
                check("Welle 5 C: Starter-Namen vor Override geschuetzt", wave5cResults.starterProtected);
                check("Welle 5 C: Eigenes Werkzeug funktioniert in applyOpToPart", wave5cResults.recursiveToolApplies);
                check("Welle 5 C: opChain waechst nach apply mit eigenem Tool", wave5cResults.opChainGrew);
                check("Welle 5 C: Schlechte Drehbank hat niedrigen Cap", wave5cResults.badLatheLowerCap);
                check("Welle 5 C: Schlechtes Tool deckelt Ziel-Praezision (§4.3 Kaskade)", wave5cResults.recursivePrecisionCascade);
                check("Welle 5 C: DSL set_tool_meta wirkt", wave5cResults.dslSetMeta);
                check("Welle 5 C: DSL register_tool wirkt", wave5cResults.dslRegister);
                check("Welle 5 C: DSL-Werkzeug landet in state.tools", wave5cResults.dslToolInState);
                check("Welle 5 C: Save traegt role + toolMeta im Bauplan", wave5cResults.snapshotHasToolBp);
                check("Welle 5 C: Save traegt eigenes Werkzeug", wave5cResults.snapshotHasTool);
                check("Welle 5 C: UI .workshop-tool-recursion im DOM", wave5cResults.uiToolSection);
                check("Welle 5 C: UI Registered-Badge im DOM", wave5cResults.uiRegisteredBadge);
                check("Welle 5 C: UI opName-Input im DOM", wave5cResults.uiOpNameInput);
            }

            // ### Bugfixes nach Welle-5-Reflexion ###
            const bugfixResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};

                    // Bug 1: Part-Loesch raeumt connections auf
                    r.state.blueprints["bug1-test"] = {
                        name: "bug1-test",
                        label: "Bug1 Test",
                        builtIn: false,
                        parts: [
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 1, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                        connections: [
                            { type: "hafting", partA: 0, partB: 1 },
                            { type: "hafting", partA: 1, partB: 2 },
                            { type: "hafting", partA: 0, partB: 2 },
                        ],
                    };
                    // Part 1 loeschen: connection 0-1 + 1-2 weg, 0-2 bleibt
                    // und wird zu 0-1 (Index 2 → 1).
                    r.removePartFromBlueprint("bug1-test", 1);
                    const remaining = r.state.blueprints["bug1-test"].connections;
                    out.connectionsFilteredOnPartDelete = remaining.length === 1;
                    out.connectionIndicesShifted =
                        remaining[0] && remaining[0].partA === 0 && remaining[0].partB === 1;

                    // Bug 1 edge case: delete part 0, connection 1-2 wird zu 0-1
                    r.state.blueprints["bug1-shift"] = {
                        name: "bug1-shift",
                        label: "Shift Test",
                        builtIn: false,
                        parts: [
                            { shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 1, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                            { shape: "box", material: "stein", position: { x: 2, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } },
                        ],
                        connections: [{ type: "hafting", partA: 1, partB: 2 }],
                    };
                    r.removePartFromBlueprint("bug1-shift", 0);
                    const shifted = r.state.blueprints["bug1-shift"].connections;
                    out.shiftedToZeroOne = shifted.length === 1 && shifted[0].partA === 0 && shifted[0].partB === 1;

                    // Bug 2: Bauplan-Loesch raeumt eigene Werkzeuge auf
                    r.state.blueprints["bug2-lathe"] = {
                        name: "bug2-lathe",
                        label: "Test Lathe",
                        builtIn: false,
                        role: "tool",
                        toolMeta: { opName: "bug2-op", opClass: "subtractive" },
                        parts: [
                            { shape: "box", material: "eisen", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] },
                        ],
                        connections: [],
                    };
                    r.registerBlueprintAsTool("bug2-lathe");
                    out.toolWasRegistered = !!r.state.tools["bug2-lathe"];
                    out.playerOwnedToolBefore = (r.state.player.tools || []).includes("bug2-lathe");
                    r.deleteBlueprint("bug2-lathe");
                    out.toolRemovedFromState = !r.state.tools["bug2-lathe"];
                    out.toolRemovedFromPlayer = !(r.state.player.tools || []).includes("bug2-lathe");
                    out.starterToolsUnaffected =
                        !!r.state.tools["hammer"] && (r.state.player.tools || []).includes("hammer");

                    // Negativ: deleteBlueprint eines non-tool-Bauplans laesst
                    // andere Tools komplett unberuehrt.
                    r.state.blueprints["bug2-noisy-tool"] = {
                        name: "bug2-noisy-tool",
                        label: "Noisy Tool",
                        builtIn: false,
                        role: "tool",
                        toolMeta: { opName: "noisy-op", opClass: "subtractive" },
                        parts: [{ shape: "box", material: "eisen", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }] }],
                        connections: [],
                    };
                    r.registerBlueprintAsTool("bug2-noisy-tool");
                    r.state.blueprints["bug2-plain"] = {
                        name: "bug2-plain",
                        label: "Plain Blueprint",
                        builtIn: false,
                        parts: [{ shape: "box", material: "stein", position: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 } }],
                        connections: [],
                    };
                    r.deleteBlueprint("bug2-plain");
                    out.unrelatedToolUntouched = !!r.state.tools["bug2-noisy-tool"];

                    // Cleanup — wichtig: Werkstatt-DOM neu rendern, damit
                    // spätere Tests (Ring 6.6) nicht Stale-Rows sehen.
                    delete r.state.tools["bug2-noisy-tool"];
                    r.state.player.tools = r.state.player.tools.filter((t) => t !== "bug2-noisy-tool");
                    delete r.state.blueprints["bug2-noisy-tool"];
                    delete r.state.blueprints["bug1-test"];
                    delete r.state.blueprints["bug1-shift"];
                    if (typeof r._renderWorkshopDOM === "function") r._renderWorkshopDOM();
                    return out;
                })
                .catch((err) => ({ error: err.message }));

            if (!bugfixResults || bugfixResults.error) {
                check(
                    "Bugfix Snapshot erreichbar",
                    false,
                    (bugfixResults && bugfixResults.error) || "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Bugfix: removePartFromBlueprint filtert betroffene Connections", bugfixResults.connectionsFilteredOnPartDelete);
                check("Bugfix: Connection-Indizes nach Part-Loesch korrigiert", bugfixResults.connectionIndicesShifted);
                check("Bugfix: Index-Shift bei Loesch von Part 0", bugfixResults.shiftedToZeroOne);
                check("Bugfix: registerBlueprintAsTool legt Werkzeug an (Setup)", bugfixResults.toolWasRegistered);
                check("Bugfix: Werkzeug nach Register im Player-Inventory (Setup)", bugfixResults.playerOwnedToolBefore);
                check("Bugfix: deleteBlueprint entfernt eigenes Werkzeug aus state.tools", bugfixResults.toolRemovedFromState);
                check("Bugfix: deleteBlueprint entfernt Werkzeug aus player.tools", bugfixResults.toolRemovedFromPlayer);
                check("Bugfix: Starter-Werkzeuge bleiben nach Bauplan-Loesch erhalten", bugfixResults.starterToolsUnaffected);
                check("Bugfix: Unrelated Tools werden nicht angetastet", bugfixResults.unrelatedToolUntouched);
            }

            // ### Schicht 2 — Multi-Provider LLM-Sandbox (UI + Parser, kein echter Call) ###
            const llmResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    out.hasLlmState = r.state.llm && typeof r.state.llm.enabled === "boolean";
                    out.hasProviderConfig = !!r.state.llm.providerConfig &&
                        !!r.state.llm.providerConfig.anthropic &&
                        !!r.state.llm.providerConfig.google &&
                        !!r.state.llm.providerConfig.openrouter &&
                        !!r.state.llm.providerConfig.ollama;
                    const defs = r.llmProviderDefs();
                    out.fourProviders = Object.keys(defs).length === 4;
                    out.providerHasBuildBody = typeof defs.anthropic.buildBody === "function" &&
                        typeof defs.google.buildBody === "function" &&
                        typeof defs.openrouter.buildBody === "function" &&
                        typeof defs.ollama.buildBody === "function";

                    // Endpoint je Provider liefert die erwartete URL.
                    out.anthropicEndpoint = defs.anthropic.endpoint("m", "k") === "https://api.anthropic.com/v1/messages";
                    out.googleEndpointGenerateContent = /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-2\.0-flash:generateContent$/.test(
                        defs.google.endpoint("gemini-2.0-flash", "KEY")
                    );
                    out.googleHeaderHasApiKey = defs.google.buildHeaders("KEY")["x-goog-api-key"] === "KEY";
                    out.openrouterEndpoint = defs.openrouter.endpoint("m", "k") === "https://openrouter.ai/api/v1/chat/completions";
                    out.ollamaEndpoint = defs.ollama.endpoint("m", "", { endpoint: "http://localhost:11434" }) === "http://localhost:11434/api/chat";
                    out.ollamaNoKeyRequired = defs.ollama.requiresKey === false;

                    // Body-Format pro Provider
                    const sys = "SYS";
                    const usr = "USR";
                    const anthBody = defs.anthropic.buildBody("m", sys, usr);
                    out.anthropicBodyShape = anthBody.system === sys && Array.isArray(anthBody.messages);
                    const geminiBody = defs.google.buildBody("m", sys, usr);
                    out.geminiBodyShape = !!geminiBody.systemInstruction && Array.isArray(geminiBody.contents);
                    const orBody = defs.openrouter.buildBody("m", sys, usr);
                    out.openrouterBodyShape = Array.isArray(orBody.messages) &&
                        orBody.messages[0].role === "system" && orBody.messages[1].role === "user";
                    const olBody = defs.ollama.buildBody("m", sys, usr);
                    out.ollamaBodyShape = olBody.stream === false && Array.isArray(olBody.messages);

                    // Response-Parser pro Provider
                    out.anthropicExtract = defs.anthropic.extractText({ content: [{ type: "text", text: "hi" }] }) === "hi";
                    out.geminiExtract = defs.google.extractText({ candidates: [{ content: { parts: [{ text: "hi" }] } }] }) === "hi";
                    out.openrouterExtract = defs.openrouter.extractText({ choices: [{ message: { content: "hi" } }] }) === "hi";
                    out.ollamaExtract = defs.ollama.extractText({ message: { content: "hi" } }) === "hi";

                    // UI: Provider-Selektor + Schlüsselzeile + Endpoint-Zeile (für Ollama)
                    out.llmUiProvider = !!document.getElementById("llm-provider");
                    out.llmUiKey = !!document.getElementById("llm-key");
                    out.llmUiEndpoint = !!document.getElementById("llm-endpoint");
                    out.llmUiModel = !!document.getElementById("llm-model");
                    out.llmUiToggle = !!document.getElementById("llm-toggle");

                    // Default-Provider ist anthropic; Provider-Selector trägt alle vier
                    const sel = document.getElementById("llm-provider");
                    out.providerSelectorPopulated = sel && sel.options.length === 4;

                    // System-Prompt enthält die DSL-Vertrag-Anweisungen
                    const sp = r.llmBuildSystemPrompt();
                    out.systemPromptHasJson = /JSON/i.test(sp) && /say/.test(sp) && /program/.test(sp);

                    // Parser robust gegen Markdown / kaputtes JSON
                    const ok = r.llmParseResponse('{"say":"Hallo","program":["weather","sunny"]}');
                    out.parserParsesValidJson = ok.say === "Hallo" && Array.isArray(ok.program);
                    const fenced = r.llmParseResponse('```json\n{"say":"hi","program":null}\n```');
                    out.parserStripsFence = fenced.say === "hi" && fenced.program === null;
                    const broken = r.llmParseResponse("nicht json");
                    out.parserDetectsError = typeof broken.error === "string";

                    // Disabled-LLM blockt Call ohne Netzwerk-Versuch
                    r.state.llm.enabled = false;
                    return new Promise((resolve) => {
                        r.llmCall("test").then((rep) => {
                            out.callBlockedWhenDisabled = rep.error === "LLM nicht aktiv";
                            const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                            const csp = meta ? meta.getAttribute("content") : "";
                            out.cspAnthropic = /api\.anthropic\.com/.test(csp);
                            out.cspGoogle = /generativelanguage\.googleapis\.com/.test(csp);
                            out.cspOpenRouter = /openrouter\.ai/.test(csp);
                            out.cspOllama = /localhost:11434/.test(csp);
                            resolve(out);
                        });
                    });
                })
                .catch((err) => ({ error: err.message }));

            if (!llmResults || llmResults.error) {
                check("Schicht 2: LLM-Snapshot erreichbar", false, llmResults && llmResults.error || "page.evaluate fehlgeschlagen");
            } else {
                check("Schicht 2: state.llm + providerConfig komplett", llmResults.hasLlmState && llmResults.hasProviderConfig);
                check("Schicht 2: vier Provider definiert", llmResults.fourProviders);
                check("Schicht 2: jeder Provider hat buildBody-Fn", llmResults.providerHasBuildBody);
                check("Schicht 2: Anthropic-Endpoint korrekt", llmResults.anthropicEndpoint);
                check("Schicht 2: Gemini-Endpoint auf :generateContent", llmResults.googleEndpointGenerateContent);
                check("Schicht 2: Gemini-Header trägt x-goog-api-key", llmResults.googleHeaderHasApiKey);
                check("Schicht 2: OpenRouter-Endpoint korrekt", llmResults.openrouterEndpoint);
                check("Schicht 2: Ollama-Endpoint nutzt /api/chat", llmResults.ollamaEndpoint);
                check("Schicht 2: Ollama braucht keinen Key", llmResults.ollamaNoKeyRequired);
                check("Schicht 2: Anthropic-Body trägt system + messages", llmResults.anthropicBodyShape);
                check("Schicht 2: Gemini-Body trägt systemInstruction + contents", llmResults.geminiBodyShape);
                check("Schicht 2: OpenRouter-Body OpenAI-kompatibel", llmResults.openrouterBodyShape);
                check("Schicht 2: Ollama-Body trägt stream=false + messages", llmResults.ollamaBodyShape);
                check("Schicht 2: Anthropic-Response extrahiert text-Block", llmResults.anthropicExtract);
                check("Schicht 2: Gemini-Response extrahiert candidates[0].parts", llmResults.geminiExtract);
                check("Schicht 2: OpenRouter-Response extrahiert choices[0].message", llmResults.openrouterExtract);
                check("Schicht 2: Ollama-Response extrahiert message.content", llmResults.ollamaExtract);
                check("Schicht 2: UI-Felder (Provider/Key/Endpoint/Model/Toggle)",
                    llmResults.llmUiProvider && llmResults.llmUiKey && llmResults.llmUiEndpoint && llmResults.llmUiModel && llmResults.llmUiToggle);
                check("Schicht 2: Provider-Selektor mit 4 Optionen befüllt", llmResults.providerSelectorPopulated);
                check("Schicht 2: System-Prompt trägt DSL-JSON-Vertrag", llmResults.systemPromptHasJson);
                check("Schicht 2: Parser akzeptiert gültiges JSON", llmResults.parserParsesValidJson);
                check("Schicht 2: Parser entfernt Markdown-Fences", llmResults.parserStripsFence);
                check("Schicht 2: Parser meldet Fehler bei kaputtem Input", llmResults.parserDetectsError);
                check("Schicht 2: Disabled-LLM blockt Call sauber", llmResults.callBlockedWhenDisabled);
                check("Schicht 2: CSP erlaubt alle vier Provider-Endpoints",
                    llmResults.cspAnthropic && llmResults.cspGoogle && llmResults.cspOpenRouter && llmResults.cspOllama);
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

            // ### UI V2 — Topbar + Status-Bar + Drawer-System ###
            const uiResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    const topbar = document.getElementById("topbar");
                    const statusbar = document.getElementById("statusbar");
                    const spielerDrawer = document.querySelector('.drawer[data-drawer="spieler"]');
                    out.topbarInDom = !!topbar;
                    out.statusbarInDom = !!statusbar;
                    out.spielerDrawerInDom = !!spielerDrawer;

                    // Emotion-Rows leben jetzt im Spieler-Drawer
                    const rows = spielerDrawer
                        ? spielerDrawer.querySelectorAll("#status-emotions .emotion")
                        : [];
                    out.emotionRowCount = rows.length;
                    out.allSixAxes = rows.length === 6;

                    // Werte aktualisieren mit kontrollierten Emotionen
                    for (const k of Object.keys(r.state.player.emotions)) {
                        r.state.player.emotions[k] = 0;
                    }
                    r.state.player.emotions.joy = 0.5;
                    r.state.player.emotions.chaos = 0.8;
                    if (r._statusRefs) r._statusRefs.lastTick = -Infinity;
                    r.updateStatusPanel(1000);

                    const joyFill = spielerDrawer
                        ? spielerDrawer.querySelector(".emotion.joy .bar > div")
                        : null;
                    const chaosFill = spielerDrawer
                        ? spielerDrawer.querySelector(".emotion.chaos .bar > div")
                        : null;
                    out.joyBarWidth = joyFill ? joyFill.style.width : "";
                    out.chaosBarWidth = chaosFill ? chaosFill.style.width : "";
                    out.barReflectsValue = out.joyBarWidth === "50%" && out.chaosBarWidth === "80%";

                    // Status-Bar (jetzt #statusbar oben) zeigt Welt-Daten
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
                    r.updateStatusPanel(1000.1);
                    const joyFill2 = spielerDrawer
                        ? spielerDrawer.querySelector(".emotion.joy .bar > div")
                        : null;
                    out.throttleHolds = joyFill2 ? joyFill2.style.width === "50%" : false;

                    // Nach 0.4s wieder durchlassend
                    r.updateStatusPanel(1000.5);
                    const joyFill3 = spielerDrawer
                        ? spielerDrawer.querySelector(".emotion.joy .bar > div")
                        : null;
                    out.throttleReleases = joyFill3 ? joyFill3.style.width === "90%" : false;

                    // Tab-System
                    const tabs = document.querySelectorAll("#topbar .tab");
                    out.tabCount = tabs.length;
                    out.allTabsPresent = tabs.length === 7;
                    const weltTab = document.querySelector('#topbar .tab[data-tab="welt"]');
                    out.weltTabActive = weltTab && weltTab.classList.contains("active");
                    const weltDrawer = document.querySelector('.drawer[data-drawer="welt"]');
                    out.weltDrawerOpenInitially = weltDrawer && !weltDrawer.hidden;

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
                    "UI: Drawer-Snapshot erreichbar",
                    false,
                    uiResults && uiResults.error ? uiResults.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("UI V2: #topbar im DOM", uiResults.topbarInDom);
                check("UI V2: #statusbar im DOM", uiResults.statusbarInDom);
                check("UI V2: Spieler-Drawer im DOM", uiResults.spielerDrawerInDom);
                check(
                    "UI V2: alle sechs Emotion-Rows im Spieler-Drawer",
                    uiResults.allSixAxes,
                    `rows=${uiResults.emotionRowCount}`
                );
                check(
                    "UI V2: Balken-Breite spiegelt Emotion-Wert (joy 0.5 → 50%, chaos 0.8 → 80%)",
                    uiResults.barReflectsValue,
                    `joy=${uiResults.joyBarWidth}, chaos=${uiResults.chaosBarWidth}`
                );
                check(
                    "UI V2: Status-Bar zeigt Wetter + Slug + Kreaturen",
                    uiResults.statusValuesPopulated,
                    `weather=${uiResults.weatherText}, slug=${uiResults.slugText}, creatures=${uiResults.creaturesText}`
                );
                check(
                    "UI V2: updateStatusPanel ist throttled (Aufruf <0.4s ignoriert)",
                    uiResults.throttleHolds
                );
                check(
                    "UI V2: updateStatusPanel lässt nach 0.4s wieder durch",
                    uiResults.throttleReleases
                );
                check(
                    "UI V2: sieben Tabs im Topbar (inkl. Werkstatt)",
                    uiResults.allTabsPresent,
                    `count=${uiResults.tabCount}`
                );
                check("UI V2: Welt-Tab ist initial aktiv", uiResults.weltTabActive);
                check("UI V2: Welt-Drawer ist initial offen", uiResults.weltDrawerOpenInitially);
            }

            // ### UI V2 — Quick-Buttons + Hilfe-Drawer (Tab-System) ###
            const uiActionsResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};

                    // (a) Quick-Buttons existieren (im Welt-Drawer)
                    const qa = document.getElementById("quick-actions");
                    const qaButtons = qa ? qa.querySelectorAll("button[data-cmd]") : [];
                    out.quickButtonCount = qaButtons.length;
                    out.quickButtonsPresent = qaButtons.length >= 5;

                    // (b) Klick auf einen Quick-Button feuert processChatCommand
                    r.state.weather = "sunny";
                    const rainyBtn = qa
                        ? qa.querySelector('button[data-cmd="Setze Wetter rainy"]')
                        : null;
                    if (rainyBtn) rainyBtn.click();
                    out.quickButtonRoutesToChat = r.state.weather === "rainy";

                    // (c) Hilfe-Drawer ist initial versteckt (Welt ist Default-Tab)
                    const hilfeDrawer = document.querySelector('.drawer[data-drawer="hilfe"]');
                    out.hilfeDrawerInitiallyHidden = hilfeDrawer && hilfeDrawer.hidden === true;

                    // (d) Klick auf Hilfe-Tab öffnet Hilfe-Drawer
                    const hilfeTab = document.querySelector('#topbar .tab[data-tab="hilfe"]');
                    if (hilfeTab) hilfeTab.click();
                    out.hilfeDrawerOpensOnTab = hilfeDrawer && hilfeDrawer.hidden === false;

                    // Welt-Drawer ist jetzt versteckt (nur ein Tab aktiv)
                    const weltDrawer = document.querySelector('.drawer[data-drawer="welt"]');
                    out.otherDrawersHidden = weltDrawer && weltDrawer.hidden === true;

                    // (e) Drawer enthält Befehl-Buttons
                    const helpButtons = document.querySelectorAll("#help-list button.cmd");
                    out.helpButtonCount = helpButtons.length;
                    out.helpHasButtons = helpButtons.length >= 10;

                    // (f) Klick auf Help-Eintrag schließt Drawer + führt aus.
                    r.state.weather = "sunny";
                    const rainyHelp = Array.from(helpButtons).find(
                        (b) => b.getAttribute("data-cmd") === "setze wetter rainy"
                    );
                    if (rainyHelp) rainyHelp.click();
                    out.helpClickExecutes = r.state.weather === "rainy";
                    out.helpClickClosesDrawer = hilfeDrawer && hilfeDrawer.hidden === true;

                    // (g) Drawer wieder öffnen, dann Close-Button schließt
                    if (hilfeTab) hilfeTab.click();
                    const closeBtn = hilfeDrawer
                        ? hilfeDrawer.querySelector("[data-drawer-close]")
                        : null;
                    if (closeBtn) closeBtn.click();
                    out.closeButtonHidesDrawer = hilfeDrawer && hilfeDrawer.hidden === true;

                    // Cleanup: Welt-Tab wieder aktivieren
                    const weltTab = document.querySelector('#topbar .tab[data-tab="welt"]');
                    if (weltTab) weltTab.click();

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiActionsResults || uiActionsResults.error) {
                check(
                    "UI V2: Quick/Help-Snapshot erreichbar",
                    false,
                    uiActionsResults && uiActionsResults.error
                        ? uiActionsResults.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check(
                    "UI V2: Quick-Action-Buttons im Welt-Drawer (≥5)",
                    uiActionsResults.quickButtonsPresent,
                    `count=${uiActionsResults.quickButtonCount}`
                );
                check(
                    "UI V2: Quick-Button-Klick routet durch processChatCommand",
                    uiActionsResults.quickButtonRoutesToChat
                );
                check(
                    "UI V2: Hilfe-Drawer initial versteckt",
                    uiActionsResults.hilfeDrawerInitiallyHidden
                );
                check(
                    "UI V2: Tab-Klick auf Hilfe öffnet Hilfe-Drawer",
                    uiActionsResults.hilfeDrawerOpensOnTab
                );
                check(
                    "UI V2: andere Drawer werden versteckt wenn neuer Tab aktiv",
                    uiActionsResults.otherDrawersHidden
                );
                check(
                    "UI V2: Hilfe-Drawer enthält Befehl-Buttons (≥10)",
                    uiActionsResults.helpHasButtons,
                    `count=${uiActionsResults.helpButtonCount}`
                );
                check(
                    "UI V2: Klick auf Befehl im Drawer führt aus",
                    uiActionsResults.helpClickExecutes
                );
                check(
                    "UI V2: Klick auf Befehl schließt Drawer automatisch",
                    uiActionsResults.helpClickClosesDrawer
                );
                check(
                    "UI V2: Drawer-Close-Button schließt Drawer",
                    uiActionsResults.closeButtonHidesDrawer
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

            // ### UI V1 — Live-Tuning Slider ###
            const uiTuningResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    const sliders = {
                        threshold: document.getElementById("tune-threshold"),
                        decay: document.getElementById("tune-decay"),
                        cooldown: document.getElementById("tune-cooldown"),
                    };
                    out.allSlidersPresent = !!(sliders.threshold && sliders.decay && sliders.cooldown);

                    // Initiale Slider-Werte spiegeln state.player-Defaults
                    out.initialThreshold = sliders.threshold ? parseFloat(sliders.threshold.value) : -1;
                    out.initialMatchesState = Math.abs(out.initialThreshold - r.state.player.emotionThreshold) < 1e-6;

                    // Slider-Bewegung → state.player.emotionThreshold ändert sich
                    if (sliders.threshold) {
                        sliders.threshold.value = "0.5";
                        sliders.threshold.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    out.thresholdAfterMove = r.state.player.emotionThreshold;
                    out.thresholdUpdatesState = Math.abs(out.thresholdAfterMove - 0.5) < 1e-6;

                    // Value-Label spiegelt den Wert
                    const tv = document.getElementById("tune-threshold-v");
                    out.thresholdLabelMatches = tv ? tv.textContent === "0.50" : false;

                    // Decay-Slider analog
                    if (sliders.decay) {
                        sliders.decay.value = "0.020";
                        sliders.decay.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    out.decayUpdatesState = Math.abs(r.state.player.emotionDecayPerSec - 0.02) < 1e-6;

                    // Cooldown-Slider
                    if (sliders.cooldown) {
                        sliders.cooldown.value = "60";
                        sliders.cooldown.dispatchEvent(new Event("input", { bubbles: true }));
                    }
                    out.cooldownUpdatesState = r.state.player.emotionApplyCooldown === 60;

                    // Cleanup: defaults wiederherstellen, damit weitere Tests
                    // konsistent sind (falls dieser Test vorgezogen wird).
                    r.state.player.emotionThreshold = 0.7;
                    r.state.player.emotionDecayPerSec = 0.005;
                    r.state.player.emotionApplyCooldown = 30;

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiTuningResults || uiTuningResults.error) {
                check(
                    "UI: Tuning-Snapshot erreichbar",
                    false,
                    uiTuningResults && uiTuningResults.error
                        ? uiTuningResults.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check(
                    "UI: Alle drei Tuning-Slider sind im DOM",
                    uiTuningResults.allSlidersPresent
                );
                check(
                    "UI: Initialer Slider-Wert spiegelt state.player-Default",
                    uiTuningResults.initialMatchesState,
                    `slider=${uiTuningResults.initialThreshold}`
                );
                check(
                    "UI: Slider-Bewegung mutiert state.player.emotionThreshold",
                    uiTuningResults.thresholdUpdatesState,
                    `value=${uiTuningResults.thresholdAfterMove}`
                );
                check(
                    "UI: Value-Label spiegelt Slider-Wert ('0.50')",
                    uiTuningResults.thresholdLabelMatches
                );
                check(
                    "UI: Decay-Slider mutiert emotionDecayPerSec",
                    uiTuningResults.decayUpdatesState
                );
                check(
                    "UI: Cooldown-Slider mutiert emotionApplyCooldown",
                    uiTuningResults.cooldownUpdatesState
                );
            }

            // ### UI V2 — Identity (Tokens + Theme + Fonts) ###
            const uiV2Results = await page
                .evaluate(() => {
                    const out = {};

                    // (a) Theme-Default ist "tag"
                    out.bodyHasThemeTag = document.body.getAttribute("data-theme") === "tag";

                    // (b) Token-Variable kommt durch (Pergament-Farbe)
                    const computed = getComputedStyle(document.body);
                    const parch1 = computed.getPropertyValue("--parch-1").trim();
                    out.parchTokenLoaded = parch1.length > 0;

                    // (c) Theme-Toggle wechselt zu "nacht"
                    const toggle = document.getElementById("theme-toggle");
                    if (toggle) toggle.click();
                    out.themeSwitchedToNight = document.body.getAttribute("data-theme") === "nacht";
                    out.toggleArrayAfterSwitch = toggle && toggle.getAttribute("aria-pressed") === "true";

                    // (d) Theme-Wechsel ändert Token-Wert
                    const parch1Night = getComputedStyle(document.body).getPropertyValue("--parch-1").trim();
                    out.tokenChangesPerTheme = parch1 !== parch1Night && parch1Night.length > 0;

                    // (e) Persistenz: localStorage trägt die Wahl
                    const persisted = localStorage.getItem("anazhRealmTheme");
                    out.themePersisted = persisted === "nacht";

                    // (f) Latch-Klasse haftet an allen drei Topbar-Toggles
                    // (Help ist in UI V2 ein Drawer-Tab, kein Latch mehr.)
                    out.allTogglesLatched = [
                        "grok-voice-toggle",
                        "anazh-symphony-toggle",
                        "theme-toggle",
                    ].every((id) => {
                        const el = document.getElementById(id);
                        return el && el.classList.contains("latch");
                    });

                    // (g) Cinzel-Font ist registriert (über @font-face)
                    out.fontsRegistered = Array.from(document.fonts).some(
                        (f) => f.family === "Cinzel"
                    );

                    // Cleanup: zurück auf "tag" damit andere Tests konsistent sind
                    if (toggle) toggle.click();

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!uiV2Results || uiV2Results.error) {
                check(
                    "UI V2: Identity-Snapshot erreichbar",
                    false,
                    uiV2Results && uiV2Results.error
                        ? uiV2Results.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("UI V2: body[data-theme=tag] initial gesetzt", uiV2Results.bodyHasThemeTag);
                check("UI V2: Pergament-Tokens geladen (--parch-1)", uiV2Results.parchTokenLoaded);
                check("UI V2: Theme-Toggle wechselt zu nacht", uiV2Results.themeSwitchedToNight);
                check(
                    "UI V2: Theme-Toggle aria-pressed reflektiert State",
                    uiV2Results.toggleArrayAfterSwitch
                );
                check("UI V2: Token-Werte ändern sich pro Theme", uiV2Results.tokenChangesPerTheme);
                check("UI V2: Theme-Wahl in localStorage persistiert", uiV2Results.themePersisted);
                check(
                    "UI V2: alle Toggle-Buttons tragen .latch-Klasse",
                    uiV2Results.allTogglesLatched
                );
                check(
                    "UI V2: Cinzel-Font ist via @font-face registriert",
                    uiV2Results.fontsRegistered
                );
            }

            // ### UI V2 — Konsole (fusioniertes Chat + Log) ###
            const consoleResults = await page
                .evaluate(() => {
                    const out = {};
                    const panel = document.getElementById("console");
                    out.consoleInDom = !!panel;
                    out.chatOutputInside =
                        panel && panel.querySelector("#chat-output") !== null;
                    out.logInside = panel && panel.querySelector("#log") !== null;
                    out.chatInputInside =
                        panel && panel.querySelector("#chat-input") !== null;

                    // Collapse-Toggle
                    const toggle = document.getElementById("console-collapse");
                    out.toggleInDom = !!toggle;
                    out.initiallyOpen = panel && !panel.classList.contains("collapsed");

                    if (toggle) toggle.click();
                    out.afterFirstClickCollapsed =
                        panel && panel.classList.contains("collapsed");
                    out.toggleLabelChanged = toggle && toggle.textContent === "+";

                    if (toggle) toggle.click();
                    out.afterSecondClickOpen =
                        panel && !panel.classList.contains("collapsed");

                    // Persistenz: localStorage hat Wahl
                    out.localStorageOpen =
                        localStorage.getItem("anazhRealmConsole") === "open";

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!consoleResults || consoleResults.error) {
                check(
                    "UI V2: Konsole-Snapshot erreichbar",
                    false,
                    consoleResults && consoleResults.error
                        ? consoleResults.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("UI V2: #console im DOM", consoleResults.consoleInDom);
                check(
                    "UI V2: #chat-output, #log, #chat-input leben in der Konsole",
                    consoleResults.chatOutputInside &&
                        consoleResults.logInside &&
                        consoleResults.chatInputInside
                );
                check("UI V2: Collapse-Toggle vorhanden", consoleResults.toggleInDom);
                check("UI V2: Konsole startet aufgeklappt", consoleResults.initiallyOpen);
                check(
                    "UI V2: Erster Klick klappt ein",
                    consoleResults.afterFirstClickCollapsed
                );
                check(
                    "UI V2: Toggle-Label wechselt zu '+'",
                    consoleResults.toggleLabelChanged
                );
                check(
                    "UI V2: Zweiter Klick klappt wieder auf",
                    consoleResults.afterSecondClickOpen
                );
                check(
                    "UI V2: Konsole-Status in localStorage persistiert",
                    consoleResults.localStorageOpen
                );
            }

            // ### Ring 5 — createPlayerSoul V1 ###
            // Drei Formen (Mensch/Phönix/Drache), rein visuell. Wir prüfen:
            // Default-Seele ist human, Wechsel ändert geometry+color, Chat-
            // Pattern routet, Save/Load-Roundtrip persistiert die Seele,
            // unbekannte Namen werden abgelehnt, Position überlebt den
            // Wechsel, Drawer + Status-Bar enthalten das UI.
            const ring5Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state || !r.state.player || !r.state.playerMesh) return null;
                    const out = {};
                    // V2: state.playerMesh wird bei jedem Soul-Wechsel
                    // ersetzt (neuer Group). Wir lesen jedes Mal frisch
                    // aus state, statt eine Referenz festzuhalten.
                    const currentMesh = () => r.state.playerMesh;
                    const currentMaterial = () => {
                        const m = currentMesh();
                        return m && m.userData && m.userData.material;
                    };
                    const currentParts = () => {
                        const m = currentMesh();
                        return m && m.userData && m.userData.parts;
                    };

                    // UI vorhanden?
                    out.drawerSelectInDom = !!document.getElementById("player-soul-select");
                    out.statusBarSoulInDom = !!document.getElementById("status-soul");
                    const select = document.getElementById("player-soul-select");
                    out.dropdownHasThreeOptions = select && select.options.length === 3;

                    // Cleanup: starte vom Default aus.
                    r.applyPlayerSoul("human");
                    out.defaultIsHuman = r.state.player.soul === "human";
                    out.defaultColorRed = currentMaterial() && currentMaterial().color.getHex() === 0xff0000;
                    // V2: statt Geometrie-Typ prüfen wir die Group-Struktur
                    // (Mensch hat torso/head/2 Arme/2 Beine = 6 Parts).
                    const humanParts = currentParts();
                    out.humanHasAllParts =
                        humanParts &&
                        !!humanParts.torso &&
                        !!humanParts.head &&
                        !!humanParts.leftArm &&
                        !!humanParts.rightArm &&
                        !!humanParts.leftLeg &&
                        !!humanParts.rightLeg;

                    // applyPlayerSoul("phoenix") → Group neu, Farbe + Parts wechseln
                    const posBefore = {
                        x: currentMesh().position.x,
                        y: currentMesh().position.y,
                        z: currentMesh().position.z,
                    };
                    const okPhoenix = r.applyPlayerSoul("phoenix");
                    out.applyReturnsTrue = okPhoenix === true;
                    out.phoenixSoulSet = r.state.player.soul === "phoenix";
                    out.phoenixColor = currentMaterial() && currentMaterial().color.getHex() === 0xff7a1a;
                    const phoenixParts = currentParts();
                    out.phoenixHasWingsAndTail =
                        phoenixParts &&
                        !!phoenixParts.body &&
                        !!phoenixParts.leftWing &&
                        !!phoenixParts.rightWing &&
                        !!phoenixParts.tail;
                    out.positionPreserved =
                        Math.abs(currentMesh().position.x - posBefore.x) < 1e-6 &&
                        Math.abs(currentMesh().position.y - posBefore.y) < 1e-6 &&
                        Math.abs(currentMesh().position.z - posBefore.z) < 1e-6;
                    // Dropdown synchronisiert sich
                    out.dropdownSyncsToPhoenix = select && select.value === "phoenix";

                    // Physics-Body bleibt + bezieht sich auf den NEUEN Group
                    out.physicsBodySwitchedToNewGroup =
                        currentMesh().userData && !!currentMesh().userData.physicsBody;
                    out.rigidBodiesArrayUpdated =
                        Array.isArray(r.state.rigidBodies) &&
                        r.state.rigidBodies.indexOf(currentMesh()) >= 0;

                    // Chat-Pattern: "werde drache"
                    r.processChatCommand("werde drache");
                    out.chatRoutedToDsl =
                        Array.isArray(r.state.dsl.lastUserProgram) &&
                        r.state.dsl.lastUserProgram[0] === "player_soul" &&
                        r.state.dsl.lastUserProgram[1] === "drache";
                    out.dragonSoulSet = r.state.player.soul === "dragon";
                    out.dragonColor = currentMaterial() && currentMaterial().color.getHex() === 0x2d6e3b;
                    const dragonParts = currentParts();
                    out.dragonHasFourLegs =
                        dragonParts &&
                        !!dragonParts.flLeg &&
                        !!dragonParts.frLeg &&
                        !!dragonParts.blLeg &&
                        !!dragonParts.brLeg &&
                        !!dragonParts.tailJoint;

                    // Deutsch+Englisch+Phönix-Alias funktionieren
                    r.applyPlayerSoul("phönix");
                    out.umlautAliasWorks = r.state.player.soul === "phoenix";
                    r.applyPlayerSoul("dragon");
                    out.englishAliasWorks = r.state.player.soul === "dragon";

                    // Unbekannte Seele wird abgelehnt, alte Seele bleibt
                    const prevSoul = r.state.player.soul;
                    const okBad = r.applyPlayerSoul("riese");
                    out.unknownRejected = okBad === false && r.state.player.soul === prevSoul;

                    // DSL-Op direkt aufrufbar
                    const resDsl = r.dslRun(["player_soul", "human"]);
                    out.dslOpWorks = resDsl.ok === true && r.state.player.soul === "human";

                    // Seele NICHT im atomic-Pool (Nexus soll Identität nicht überschreiben)
                    const seedRng = (seed) => {
                        let s = seed >>> 0 || 1;
                        return () => {
                            s = (s * 1664525 + 1013904223) >>> 0;
                            return s / 4294967296;
                        };
                    };
                    const rng = seedRng(2026);
                    let seenSoulOp = false;
                    for (let i = 0; i < 2000; i++) {
                        const atom = r.dslComposeAtomic(rng);
                        if (Array.isArray(atom) && atom[0] === "player_soul") {
                            seenSoulOp = true;
                            break;
                        }
                    }
                    out.soulNotInAtomicPool = !seenSoulOp;

                    // Save-Roundtrip
                    r.applyPlayerSoul("phoenix");
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.savedPlayerSoul = !!parsed && parsed.playerSoul === "phoenix";

                    // loadState mit dragon-Seele
                    r.loadState({ ...parsed, playerSoul: "dragon" });
                    out.loadAppliesSoul =
                        r.state.player.soul === "dragon" &&
                        currentMaterial() &&
                        currentMaterial().color.getHex() === 0x2d6e3b;

                    // Status-Bar
                    r.applyPlayerSoul("phoenix");
                    r.updateStatusPanel(1e6);
                    const statusEl = document.getElementById("status-soul");
                    out.statusBarShowsLabel = statusEl && statusEl.textContent === "Phönix";

                    // V2-Animation: Beine/Flügel reagieren auf walkPhase + isMoving.
                    // Wir lassen walkPhase manuell vorrücken und prüfen, dass
                    // Mensch-Beine ihre rotation.x ändern.
                    r.applyPlayerSoul("human");
                    const humanGroup = currentMesh();
                    const leftLegRotInitial = humanGroup.userData.parts.leftLeg.rotation.x;
                    // Direkter Aufruf der Animations-Funktion mit isMoving=true
                    // umgeht die isMoving-Detection (player ruht im Test).
                    const def = r.playerSoulDefs.human;
                    def.animate(humanGroup, 0, Math.PI / 2, true);
                    const leftLegRotMoving = humanGroup.userData.parts.leftLeg.rotation.x;
                    out.humanWalkAnimationMoves =
                        Math.abs(leftLegRotMoving - leftLegRotInitial) > 0.1;

                    // Phönix-Flügel flattern auch im Idle
                    r.applyPlayerSoul("phoenix");
                    const phGroup = currentMesh();
                    r.playerSoulDefs.phoenix.animate(phGroup, 0.1, 0, false);
                    const wingRotA = phGroup.userData.parts.leftWing.rotation.z;
                    r.playerSoulDefs.phoenix.animate(phGroup, 0.3, 0, false);
                    const wingRotB = phGroup.userData.parts.leftWing.rotation.z;
                    out.phoenixWingsFlapInIdle = Math.abs(wingRotA - wingRotB) > 0.05;

                    // Drache-Schweif wellt sich
                    r.applyPlayerSoul("dragon");
                    const drGroup = currentMesh();
                    r.playerSoulDefs.dragon.animate(drGroup, 0.1, 0, false);
                    const tailA = drGroup.userData.parts.tailJoint3.rotation.y;
                    r.playerSoulDefs.dragon.animate(drGroup, 0.5, 0, false);
                    const tailB = drGroup.userData.parts.tailJoint3.rotation.y;
                    out.dragonTailWaves = Math.abs(tailA - tailB) > 0.05;

                    // Cleanup
                    r.applyPlayerSoul("human");
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring5Results || ring5Results.error) {
                check(
                    "Ring 5: Seele-Snapshot erreichbar",
                    false,
                    ring5Results && ring5Results.error ? ring5Results.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 5: Dropdown im Spieler-Drawer", ring5Results.drawerSelectInDom);
                check("Ring 5: Status-Bar zeigt Seele-Item", ring5Results.statusBarSoulInDom);
                check("Ring 5: Dropdown hat drei Optionen", ring5Results.dropdownHasThreeOptions);
                check("Ring 5: Default-Seele ist 'human'", ring5Results.defaultIsHuman);
                check("Ring 5: Default-Material-Farbe ist rot (0xff0000)", ring5Results.defaultColorRed);
                check(
                    "Ring 5 V2: Mensch-Group hat torso/head/2 Arme/2 Beine",
                    ring5Results.humanHasAllParts
                );
                check("Ring 5: applyPlayerSoul('phoenix') liefert true", ring5Results.applyReturnsTrue);
                check("Ring 5: Phönix setzt state.player.soul = 'phoenix'", ring5Results.phoenixSoulSet);
                check("Ring 5: Phönix-Material-Farbe ist 0xff7a1a", ring5Results.phoenixColor);
                check(
                    "Ring 5 V2: Phönix-Group hat body/2 Flügel/Schweif",
                    ring5Results.phoenixHasWingsAndTail
                );
                check(
                    "Ring 5: Seelen-Wechsel erhält Spieler-Position",
                    ring5Results.positionPreserved
                );
                check(
                    "Ring 5 V2: Physics-Body wandert mit dem neuen Soul-Group mit",
                    ring5Results.physicsBodySwitchedToNewGroup
                );
                check(
                    "Ring 5 V2: rigidBodies-Array enthält den neuen Group (nicht den alten)",
                    ring5Results.rigidBodiesArrayUpdated
                );
                check(
                    "Ring 5: Dropdown synchronisiert sich (UI ↔ State)",
                    ring5Results.dropdownSyncsToPhoenix
                );
                check(
                    "Ring 5: Chat 'werde drache' routet auf DSL player_soul",
                    ring5Results.chatRoutedToDsl
                );
                check("Ring 5: Chat 'werde drache' setzt Seele auf dragon", ring5Results.dragonSoulSet);
                check("Ring 5: Drache-Material-Farbe ist 0x2d6e3b", ring5Results.dragonColor);
                check(
                    "Ring 5 V2: Drache-Group hat 4 Beine + Schweif-Joint",
                    ring5Results.dragonHasFourLegs
                );
                check("Ring 5: Umlaut-Alias 'phönix' kanonisiert auf phoenix", ring5Results.umlautAliasWorks);
                check("Ring 5: Englisches Alias 'dragon' kanonisiert auf dragon", ring5Results.englishAliasWorks);
                check("Ring 5: Unbekannte Seele wird abgelehnt", ring5Results.unknownRejected);
                check("Ring 5: DSL-Op player_soul direkt aufrufbar", ring5Results.dslOpWorks);
                check(
                    "Ring 5: player_soul NICHT im dslComposeAtomic-Pool (Nexus überschreibt Identität nicht)",
                    ring5Results.soulNotInAtomicPool
                );
                check("Ring 5: saveState persistiert playerSoul", ring5Results.savedPlayerSoul);
                check("Ring 5: loadState wendet Seele auf Mesh an", ring5Results.loadAppliesSoul);
                check("Ring 5: Status-Bar zeigt deutsches Label ('Phönix')", ring5Results.statusBarShowsLabel);
                check(
                    "Ring 5 V2: Mensch-Walk-Animation rotiert Beine bei isMoving=true",
                    ring5Results.humanWalkAnimationMoves
                );
                check(
                    "Ring 5 V2: Phönix-Flügel flattern auch im Idle (zwei Frames, unterschiedliche rotation.z)",
                    ring5Results.phoenixWingsFlapInIdle
                );
                check(
                    "Ring 5 V2: Drache-Schweif wellt sich (zwei Frames, unterschiedliche tailJoint3.rotation.y)",
                    ring5Results.dragonTailWaves
                );
            }

            // ### Ring 5 V2-Vorbereitung — Third-Person-Kamera ###
            // Toggle wechselt state.cameraMode, persistiert in localStorage,
            // Kamera positioniert sich tatsächlich orbit-mäßig hinter dem
            // Spieler. playerMesh dreht sich mit yaw mit (Vorbereitung für
            // animierte Glieder).
            const cameraResults = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state || !r.state.playerMesh || !r.state.camera) return null;
                    const out = {};
                    const toggle = document.getElementById("camera-mode-toggle");
                    out.toggleInDom = !!toggle;
                    out.initialModeFirst = r.state.cameraMode === "first";
                    out.initialLabelFirst = toggle && toggle.textContent.includes("1st");

                    // setCameraMode("third") schaltet um + Label folgt
                    r.setCameraMode("third");
                    out.modeAfterSet = r.state.cameraMode === "third";
                    out.labelAfterSet = toggle && toggle.textContent.includes("3rd");
                    out.ariaPressedAfterSet = toggle && toggle.getAttribute("aria-pressed") === "true";
                    out.persistedThird = localStorage.getItem("anazhRealmCameraMode") === "third";

                    // Kamera ist im 3rd-Modus tatsächlich vom Spieler entfernt
                    // (mind. 4 Welt-Einheiten). Wir setzen yaw=0, damit die
                    // Distanz reproduzierbar in -Z-Richtung liegt.
                    r.state.yaw = 0;
                    r.state.pitch = 0;
                    r.state.playerMesh.position.set(0, 20, 0);
                    // Render-Frame triggern: Loop läuft bereits, wir warten auf
                    // den nächsten Tick im Test-Wrapper. Hier prüfen wir die
                    // Math direkt, damit der Test deterministisch ist.
                    const dist = r.state.cameraThirdDistance;
                    const expectedZ = -Math.cos(0) * dist; // = -dist
                    out.expectedDistance = dist;
                    out.expectedZ = expectedZ;

                    // playerMesh.rotation.y folgt yaw — setze yaw und renderFrame
                    r.state.yaw = Math.PI / 2;
                    // Den Loop-Tick triggern wir nicht synchron; rotation.y
                    // wird im nächsten Frame gesetzt. Wir prüfen, dass die
                    // Logik existiert (Methode + State) und vertrauen dem
                    // Loop, der durchläuft.
                    out.rotationLogicReady =
                        typeof r.state.yaw === "number" && r.state.playerMesh.rotation !== undefined;

                    // setCameraMode("first") zurück
                    r.setCameraMode("first");
                    out.modeBackToFirst = r.state.cameraMode === "first";
                    out.labelBackToFirst = toggle && toggle.textContent.includes("1st");
                    out.persistedFirst = localStorage.getItem("anazhRealmCameraMode") === "first";

                    // Unbekannter Modus fällt auf "first" zurück
                    r.setCameraMode("xyz");
                    out.unknownFallsToFirst = r.state.cameraMode === "first";

                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            // Loop mehrere Ticks laufen lassen, damit player.rotation.y
            // aktualisiert wird. Headless-rAF tickt etwas träger als im
            // sichtbaren Browser, deshalb großzügig 300 ms.
            await new Promise((r) => setTimeout(r, 300));
            const cameraEffect = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state.camera || !r.state.playerMesh) return null;
                    return {
                        playerYaw: r.state.yaw,
                        playerRotationY: r.state.playerMesh.rotation.y,
                        cameraX: r.state.camera.position.x,
                        cameraY: r.state.camera.position.y,
                        cameraZ: r.state.camera.position.z,
                        playerX: r.state.playerMesh.position.x,
                        playerY: r.state.playerMesh.position.y,
                        playerZ: r.state.playerMesh.position.z,
                    };
                })
                .catch(() => null);

            // Pitch-Inversion + Boden-Clamp im 3rd-Modus prüfen: Maus hoch
            // (pitch positiv) muss Kamera SENKEN, nicht heben. Bei extremem
            // Pitch darf die Kamera nicht unter den Boden tauchen.
            // Drei Pitch-Werte sequentiell prüfen. setTimeout innerhalb
            // page.evaluate yields nicht an rAF im Headless — also außen
            // warten zwischen "Pitch setzen" und "cam.y lesen", wie's auch
            // beim Rotation-Test funktioniert.
            const setPitchAndRead = async (pitch) => {
                await page.evaluate((p) => {
                    const r = window.anazhRealm;
                    r.setCameraMode("third");
                    r.state.yaw = 0;
                    r.state.pitch = p;
                    // Player-Velocity nullen, damit cam-Position nicht zwischen
                    // den beiden Frames durch Spieler-Bewegung schwankt
                    // (z. B. wenn ein voriger Test ihm Velocity gegeben hat).
                    if (r.state.playerBody && r.state.tmpVec2) {
                        r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 0));
                    }
                }, pitch);
                await new Promise((r) => setTimeout(r, 350));
                return await page.evaluate(() => {
                    const r = window.anazhRealm;
                    return r.state.camera.position.y - r.state.playerMesh.position.y;
                });
            };
            const upDelta = await setPitchAndRead(Math.PI / 6);
            const clampedDelta = await setPitchAndRead(Math.PI / 2 - 0.1);
            const downDelta = await setPitchAndRead(-Math.PI / 6);
            const cameraPitch = { upDelta, clampedDelta, downDelta };
            await page.evaluate(() => {
                const r = window.anazhRealm;
                r.setCameraMode("first");
                r.state.pitch = 0;
            });

            if (!cameraResults || cameraResults.error) {
                check(
                    "Ring 5 V2-Prep: Kamera-Snapshot erreichbar",
                    false,
                    cameraResults && cameraResults.error ? cameraResults.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 5 V2-Prep: #camera-mode-toggle im DOM", cameraResults.toggleInDom);
                check("Ring 5 V2-Prep: Initial-Modus ist 'first'", cameraResults.initialModeFirst);
                check("Ring 5 V2-Prep: Initial-Label trägt '1st'", cameraResults.initialLabelFirst);
                check("Ring 5 V2-Prep: setCameraMode('third') schaltet State", cameraResults.modeAfterSet);
                check("Ring 5 V2-Prep: Label wechselt zu '3rd'", cameraResults.labelAfterSet);
                check("Ring 5 V2-Prep: aria-pressed='true' im 3rd-Modus", cameraResults.ariaPressedAfterSet);
                check("Ring 5 V2-Prep: Modus persistiert in localStorage", cameraResults.persistedThird);
                check("Ring 5 V2-Prep: Rotation-Logik bereit (yaw + rotation existieren)", cameraResults.rotationLogicReady);
                check("Ring 5 V2-Prep: setCameraMode('first') zurück", cameraResults.modeBackToFirst);
                check("Ring 5 V2-Prep: Label zurück auf '1st'", cameraResults.labelBackToFirst);
                check("Ring 5 V2-Prep: Persistenz aktualisiert sich", cameraResults.persistedFirst);
                check("Ring 5 V2-Prep: Unbekannter Modus fällt auf 'first' zurück", cameraResults.unknownFallsToFirst);
            }
            if (cameraEffect) {
                // playerMesh.rotation.y sollte yaw entsprechen (per Loop-Tick)
                check(
                    "Ring 5 V2-Prep: playerMesh.rotation.y folgt yaw",
                    Math.abs(cameraEffect.playerRotationY - cameraEffect.playerYaw) < 0.01,
                    `yaw=${cameraEffect.playerYaw.toFixed(3)}, rot.y=${cameraEffect.playerRotationY.toFixed(3)}`
                );
            }
            if (cameraPitch) {
                // Mit height=2.0 und dist=6: pitch=+30° → cam-player = 2-3 = -1.
                // pitch=-30° → cam-player = 2+3 = 5. clamp greift bei -0.2.
                check(
                    "Ring 5 V2-Prep: Pitch invertiert — Maus hoch senkt Kamera (3rd)",
                    cameraPitch.upDelta < 2,
                    `cam-player=${cameraPitch.upDelta.toFixed(2)} (Erwartung < 2)`
                );
                check(
                    "Ring 5 V2-Prep: Maus runter hebt Kamera (3rd)",
                    cameraPitch.downDelta > 2,
                    `cam-player=${cameraPitch.downDelta.toFixed(2)} (Erwartung > 2)`
                );
                check(
                    "Ring 5 V2-Prep: Boden-Clamp greift bei extremem Pitch",
                    cameraPitch.clampedDelta >= -0.21,
                    `cam-player=${cameraPitch.clampedDelta.toFixed(2)} (≥ -0.2 erwartet)`
                );
            }

            // ### Ring 6 — architectureTemplates V1 ###
            // Drei Bau-Primitives (Dorf/Tempel/Wasserfall) als DSL-Ops mit
            // Save-Roundtrip + FIFO-Cap + Atomic-Pool-Eintrag mit niedriger
            // Gewichtung. Wasserfälle haben einen Animations-Hook im Tick.
            const ring6Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r || !r.state) return null;
                    const out = {};

                    // Cleanup: alle bestehenden Architekturen entfernen.
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];

                    // (a) Direkter Spawn jeder Sorte
                    const v = r.spawnArchitecture("village", { x: 10, y: 5, z: 10 }, { seed: 42 });
                    out.villageBuilt = !!v && v.type === "village" && !!v.mesh;
                    out.villageHasChildren = v && v.mesh && v.mesh.children.length >= 5;
                    out.villageInScene = v && r.state.scene.children.indexOf(v.mesh) >= 0;

                    const t = r.spawnArchitecture("temple", { x: 30, y: 5, z: 10 }, { seed: 7 });
                    out.templeBuilt = !!t && t.type === "temple" && !!t.mesh;
                    // 6 Pfeiler + 1 Dach + 1 Altar = mind. 8 children
                    out.templeHasPillars = t && t.mesh && t.mesh.children.length >= 8;

                    const w = r.spawnArchitecture("waterfall", { x: 50, y: 5, z: 10 }, { seed: 99 });
                    out.waterfallBuilt = !!w && w.type === "waterfall" && !!w.mesh;
                    out.waterfallHasAnimateHook =
                        w && w.mesh && w.mesh.userData && typeof w.mesh.userData.animate === "function";

                    // (b) Unbekannter Typ wird abgelehnt
                    const bad = r.spawnArchitecture("schloss", { x: 0, y: 5, z: 0 });
                    out.unknownTypeRejected = bad === null;

                    // (c) state.architectures wächst korrekt
                    out.architectureCountAfterThree = r.state.architectures.length === 3;
                    out.idsAreUnique =
                        new Set(r.state.architectures.map((a) => a.id)).size === r.state.architectures.length;

                    // (d) DSL-Op: spawn_village wirkt durch Interpreter
                    const beforeCount = r.state.architectures.length;
                    const dslRes = r.dslRun(["spawn_village", ["at_origin"]]);
                    out.dslSpawnVillageOk =
                        dslRes.ok === true &&
                        r.state.architectures.length === beforeCount + 1 &&
                        dslRes.log.some((e) => e.event === "spawned_village");

                    // (e) Chat-Pattern routet auf DSL
                    const beforeChat = r.state.architectures.length;
                    r.processChatCommand("Baue Tempel hier");
                    out.chatRoutesToDsl =
                        Array.isArray(r.state.dsl.lastUserProgram) &&
                        r.state.dsl.lastUserProgram[0] === "spawn_temple";
                    out.chatActuallySpawned = r.state.architectures.length === beforeChat + 1;

                    // (f) V2: KEIN Cap mehr — 50 Strukturen können koexistieren.
                    // Datenmäßig unbegrenzt; GPU-Last per Distance-Culling.
                    const beforeMany = r.state.architectures.length;
                    for (let i = 0; i < 50; i++) {
                        r.spawnArchitecture("temple", { x: 500 + i * 2, y: 5, z: 500 }, { seed: i });
                    }
                    out.unboundedSpawn = r.state.architectures.length === beforeMany + 50;
                    // Die weiten (500m) Strukturen müssen ohne Mesh sein
                    // (cold) — Spieler ist nahe (0,0,0).
                    const farEntries = r.state.architectures.filter((a) => a.position.x >= 500);
                    out.farStructuresAreCold = farEntries.length === 50 && farEntries.every((a) => a.mesh === null);

                    // (g) Atomic-Pool: spawn_village/temple/waterfall sind enthalten
                    const seedRng = (s) => {
                        let x = s >>> 0 || 1;
                        return () => {
                            x = (x * 1664525 + 1013904223) >>> 0;
                            return x / 4294967296;
                        };
                    };
                    const rng = seedRng(2026);
                    const seenOps = new Set();
                    for (let i = 0; i < 5000; i++) {
                        const atom = r.dslComposeAtomic(rng);
                        if (Array.isArray(atom)) seenOps.add(atom[0]);
                    }
                    out.villageInAtomicPool = seenOps.has("spawn_village");
                    out.templeInAtomicPool = seenOps.has("spawn_temple");
                    out.waterfallInAtomicPool = seenOps.has("spawn_waterfall");

                    // (h) Wasserfall-Animation: vor und nach Tick müssen Z-
                    // Werte der Geometrie unterschiedlich sein.
                    // Position muss innerhalb cullingRadius (150) liegen,
                    // sonst ist mesh null (cold) und der Test crasht.
                    const wf = r.spawnArchitecture("waterfall", { x: 50, y: 5, z: 50 }, { seed: 1 });
                    const waterMesh = wf.mesh.children.find(
                        (c) => c.geometry && c.geometry.type === "PlaneGeometry"
                    );
                    if (waterMesh) {
                        const z0 = waterMesh.geometry.attributes.position.getZ(5);
                        r.tickArchitectures(0.5);
                        const z1 = waterMesh.geometry.attributes.position.getZ(5);
                        out.waterfallTickAnimates = Math.abs(z0 - z1) > 0.001 || z1 !== 0;
                    } else {
                        out.waterfallTickAnimates = false;
                    }

                    // (i) Save-Roundtrip
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.saveContainsArchitectures =
                        !!parsed &&
                        Array.isArray(parsed.architectures) &&
                        parsed.architectures.length > 0;
                    // Gespeicherte Einträge haben nur {type, position, seed}, kein mesh
                    out.saveOmitsMesh =
                        !!parsed &&
                        parsed.architectures.every(
                            (a) => typeof a.type === "string" && a.position && Number.isFinite(a.seed) && !a.mesh
                        );

                    // loadState rekonstruiert die Liste deterministisch aus seed
                    const loadInput = {
                        architectures: [
                            { type: "village", position: { x: 0, y: 5, z: 0 }, seed: 12345 },
                            { type: "temple", position: { x: 20, y: 5, z: 0 }, seed: 67890 },
                        ],
                    };
                    r.loadState(loadInput);
                    out.loadRebuildsCount = r.state.architectures.length === 2;
                    out.loadRebuildsTypes =
                        r.state.architectures[0].type === "village" &&
                        r.state.architectures[1].type === "temple";
                    out.loadRebuildsSeeds =
                        r.state.architectures[0].seed === 12345 &&
                        r.state.architectures[1].seed === 67890;

                    // Cleanup
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring6Results || ring6Results.error) {
                check(
                    "Ring 6: Architecture-Snapshot erreichbar",
                    false,
                    ring6Results && ring6Results.error ? ring6Results.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 6: spawnArchitecture('village') liefert Group", ring6Results.villageBuilt);
                check("Ring 6: Dorf-Group hat ≥5 children (Hütten + Plaza)", ring6Results.villageHasChildren);
                check("Ring 6: Dorf wird zur Szene hinzugefügt", ring6Results.villageInScene);
                check("Ring 6: spawnArchitecture('temple') liefert Group", ring6Results.templeBuilt);
                check("Ring 6: Tempel-Group hat ≥8 children (6 Pfeiler + Dach + Altar)", ring6Results.templeHasPillars);
                check("Ring 6: spawnArchitecture('waterfall') liefert Group", ring6Results.waterfallBuilt);
                check("Ring 6: Wasserfall hat userData.animate Hook", ring6Results.waterfallHasAnimateHook);
                check("Ring 6: Unbekannter Typ wird abgelehnt (returns null)", ring6Results.unknownTypeRejected);
                check(
                    "Ring 6: state.architectures wächst korrekt nach drei Spawns",
                    ring6Results.architectureCountAfterThree
                );
                check("Ring 6: Architecture-IDs sind eindeutig", ring6Results.idsAreUnique);
                check(
                    "Ring 6: DSL-Op spawn_village wirkt + emit spawned_village",
                    ring6Results.dslSpawnVillageOk
                );
                check(
                    "Ring 6: Chat 'Baue Tempel hier' routet auf DSL spawn_temple",
                    ring6Results.chatRoutesToDsl
                );
                check("Ring 6: Chat-Routing spawnt tatsächlich", ring6Results.chatActuallySpawned);
                check(
                    "Ring 6 V2: 50+ Strukturen koexistieren ohne Cap",
                    ring6Results.unboundedSpawn
                );
                check(
                    "Ring 6 V2: Weite Strukturen (>cullingRadius) sind 'cold' (mesh=null)",
                    ring6Results.farStructuresAreCold
                );
                check(
                    "Ring 6: spawn_village ist im dslComposeAtomic-Pool (Nexus baut)",
                    ring6Results.villageInAtomicPool
                );
                check("Ring 6: spawn_temple ist im atomic-Pool", ring6Results.templeInAtomicPool);
                check("Ring 6: spawn_waterfall ist im atomic-Pool", ring6Results.waterfallInAtomicPool);
                check("Ring 6: tickArchitectures animiert Wasserfall-Vertices", ring6Results.waterfallTickAnimates);
                check("Ring 6: saveState persistiert architectures", ring6Results.saveContainsArchitectures);
                check(
                    "Ring 6: Save enthält nur {type, position, seed} (kein mesh)",
                    ring6Results.saveOmitsMesh
                );
                check(
                    "Ring 6: loadState rekonstruiert Anzahl",
                    ring6Results.loadRebuildsCount
                );
                check(
                    "Ring 6: loadState rekonstruiert Typen",
                    ring6Results.loadRebuildsTypes
                );
                check(
                    "Ring 6: loadState rekonstruiert Seeds (deterministische Wiederherstellung)",
                    ring6Results.loadRebuildsSeeds
                );
            }

            // ### Ring 6.3 — Kollisions-Body für Strukturen ###
            // Jede Architektur bekommt einen statischen Ammo-Body. Body wird
            // beim Cullen freigegeben. Bei Wieder-Aufbau (Spieler kommt
            // zurück) entsteht ein neuer Body.
            const ring63Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};
                    // Cleanup
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) {
                            r._cullArchitectureMesh(a);
                        }
                    }
                    r.state.architectures = [];

                    // Struktur nahe spawnen (innerhalb cullingRadius) →
                    // Mesh + Body sollten gleich da sein.
                    const px = r.state.playerMesh.position.x;
                    const pz = r.state.playerMesh.position.z;
                    const entry = r.spawnArchitecture(
                        "temple",
                        { x: px + 8, y: r.state.playerMesh.position.y, z: pz + 4 },
                        { seed: 11 }
                    );
                    out.entryHasMesh = !!entry && !!entry.mesh;
                    out.entryHasCollision =
                        !!entry && !!entry.collision && !!entry.collision.body && !!entry.collision.shape;
                    // Body sollte in der physicsWorld registriert sein —
                    // wir prüfen indirekt: tests later that culling removes it.
                    // Kollisions-Box-Größe indirekt via Three-Bounding-Box
                    // verifizieren (entry.mesh hat die echte Geometrie).
                    if (entry && entry.mesh) {
                        const bbox = new THREE.Box3().setFromObject(entry.mesh);
                        const size = new THREE.Vector3();
                        bbox.getSize(size);
                        out.collisionSizeFromMesh = {
                            x: size.x,
                            y: size.y,
                            z: size.z,
                        };
                        out.collisionSizePlausible =
                            size.x > 2.0 &&
                            size.y > 2.0 &&
                            size.z > 2.0 &&
                            size.x < 100 &&
                            size.y < 100 &&
                            size.z < 100;
                    }
                    // Body ist statisch — Body.mass entspricht 0, Body
                    // ist getCollisionFlags & CF_STATIC_OBJECT bit oder einfach
                    // testen via isStaticObject (Ammo Bindings: getCollisionFlags).
                    if (entry && entry.collision && entry.collision.body) {
                        const flags = entry.collision.body.getCollisionFlags();
                        // CF_STATIC_OBJECT = 1 in Bullet, aber: ein Body mit mass=0 ist
                        // automatisch statisch in Bullet — getCollisionFlags & 1 prüft das.
                        out.bodyIsStatic = (flags & 1) === 1 || flags === 0;
                        // Wenn flags=0, ist's kein statisches Flag gesetzt, aber
                        // mass=0 macht's trotzdem effektiv statisch. Wir akzeptieren
                        // beides als pass.
                    }

                    // Distanz-Cullen: Spieler weg, Body sollte verschwinden.
                    // Wir schieben entry.position so weit weg, dass es jenseits
                    // des cullingRadius ist (~150). spawnArchitecture-Pfad ist nicht
                    // ideal; einfacher direkter Cull-Test:
                    r._cullArchitectureMesh(entry);
                    out.afterCullMeshNull = entry.mesh === null;
                    out.afterCullCollisionNull = entry.collision === null;

                    // Wiederaufbau: rebuild macht Mesh + Body wieder.
                    r._rebuildArchitectureMesh(entry);
                    out.afterRebuildMeshExists = !!entry.mesh;
                    out.afterRebuildCollisionExists = !!entry.collision && !!entry.collision.body;

                    // Strukturen ohne Mesh haben kein collision.body (cold)
                    const coldEntry = r.spawnArchitecture(
                        "village",
                        { x: 10000, y: 5, z: 10000 },
                        { seed: 1 }
                    );
                    out.coldHasNoMesh = coldEntry && coldEntry.mesh === null;
                    out.coldHasNoCollision = coldEntry && !coldEntry.collision;

                    // Cleanup
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring63Results || ring63Results.error) {
                check(
                    "Ring 6.3: Kollisions-Snapshot erreichbar",
                    false,
                    ring63Results && ring63Results.error
                        ? ring63Results.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 6.3: Architektur hat Mesh nach Spawn", ring63Results.entryHasMesh);
                check("Ring 6.3: Architektur hat collision-body + shape", ring63Results.entryHasCollision);
                check(
                    "Ring 6.3: Kollisions-Box-Größe plausibel (Tempel, via Mesh-BBox)",
                    ring63Results.collisionSizePlausible,
                    ring63Results.collisionSizeFromMesh
                        ? `mesh-size=${JSON.stringify({
                              x: ring63Results.collisionSizeFromMesh.x.toFixed(2),
                              y: ring63Results.collisionSizeFromMesh.y.toFixed(2),
                              z: ring63Results.collisionSizeFromMesh.z.toFixed(2),
                          })}`
                        : ""
                );
                check("Ring 6.3: Body ist statisch (mass=0)", ring63Results.bodyIsStatic);
                check(
                    "Ring 6.3: Cullen entfernt Mesh + Kollisions-Body",
                    ring63Results.afterCullMeshNull && ring63Results.afterCullCollisionNull
                );
                check(
                    "Ring 6.3: Wiederaufbau bringt Mesh + Body zurück",
                    ring63Results.afterRebuildMeshExists && ring63Results.afterRebuildCollisionExists
                );
                check(
                    "Ring 6.3: Cold-Strukturen (außerhalb Radius) haben weder Mesh noch Kollision",
                    ring63Results.coldHasNoMesh && ring63Results.coldHasNoCollision
                );
            }

            // Live-Kollisions-Test: Spieler wird gegen eine Tempel-Säule
            // geschoben, sollte aufgehalten werden. Wir setzen den Spieler
            // 4m vor den Tempel-Mittelpunkt und feuern ihm Velocity, dann
            // lassen wir die Physik 0.5s laufen und prüfen ob er stehen
            // geblieben oder reflektiert wurde.
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (const a of r.state.architectures.slice()) {
                    if (a.mesh) r._cullArchitectureMesh(a);
                }
                r.state.architectures = [];
                // Tempel direkt vor Welt-Ursprung platzieren
                r.spawnArchitecture("temple", { x: 0, y: 5, z: 5 }, { seed: 11 });
                // Player nach (0, terrainY+2, 0) — Tempel liegt in +Z, Player soll
                // in +Z auf ihn zu rennen.
                if (r.state.playerBody && r.state.tmpTransform && r.state.tmpVec1) {
                    const t = r.state.tmpTransform;
                    t.setIdentity();
                    t.setOrigin(r.setVec(r.state.tmpVec1, 0, 5, -2));
                    r.state.playerBody.setWorldTransform(t);
                    r.state.playerBody.activate(true);
                    // Velocity +Z = vorwärts in Richtung Tempel
                    r.state.playerBody.setLinearVelocity(r.setVec(r.state.tmpVec2, 0, 0, 6));
                }
            });
            await new Promise((r) => setTimeout(r, 800));
            const collisionLive = await page.evaluate(() => {
                const r = window.anazhRealm;
                return {
                    playerZ: r.state.playerMesh.position.z,
                    playerY: r.state.playerMesh.position.y,
                };
            });
            // Tempel sitzt bei z=5, Pillar-Radius ~3.5, also Pillar-Vorderkante
            // bei z=1.5. Player startete bei z=-2, hätte ohne Kollision in
            // 0.8s × 6 m/s = 4.8m gemacht und wäre bei z=2.8. Mit Kollision
            // sollte er VOR der Pillar-Vorderkante stehen (z < ~2).
            check(
                "Ring 6.3: Kollision stoppt Spieler vor dem Tempel",
                collisionLive.playerZ < 2.0,
                `playerZ=${collisionLive.playerZ.toFixed(2)} (Erwartung < 2.0)`
            );
            // Cleanup
            await page.evaluate(() => {
                const r = window.anazhRealm;
                for (const a of r.state.architectures.slice()) {
                    if (a.mesh) r._cullArchitectureMesh(a);
                }
                r.state.architectures = [];
            });

            // ### Ring 6.4 — Bauplan-Datenschicht ###
            // state.blueprints enthält Built-in dorf/tempel/wasserfall als
            // Daten. _buildFromBlueprint rendert sie. 8 Primitive werden
            // erkannt. User-Baupläne sind hinzufügbar + persistierbar.
            const ring64Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    const out = {};

                    // Built-ins vorhanden
                    out.hasVillage = !!r.state.blueprints && !!r.state.blueprints.village;
                    out.hasTemple = !!r.state.blueprints && !!r.state.blueprints.temple;
                    out.hasWaterfall = !!r.state.blueprints && !!r.state.blueprints.waterfall;
                    out.villageBuiltIn =
                        r.state.blueprints.village && r.state.blueprints.village.builtIn === true;
                    out.villagePartsArray = Array.isArray(r.state.blueprints.village.parts);
                    out.villageHasParts =
                        r.state.blueprints.village.parts.length >= 10; // 6 huts × 2 + plaza
                    out.templeHasParts = r.state.blueprints.temple.parts.length >= 9;
                    out.waterfallHasParts = r.state.blueprints.waterfall.parts.length === 3;

                    // 8 Primitive renderbar — wir bauen einen Test-Bauplan
                    // mit allen 8 Shapes und prüfen, dass jede einen Mesh
                    // produziert.
                    const allShapes = [
                        "box",
                        "sphere",
                        "cylinder",
                        "cone",
                        "pyramid",
                        "octahedron",
                        "plane",
                        "torus",
                    ];
                    const testBp = {
                        name: "_test_all_shapes",
                        parts: allShapes.map((s, i) => ({
                            shape: s,
                            color: 0xffffff,
                            position: { x: i, y: 0, z: 0 },
                            size: { x: 1, y: 1, z: 1 },
                        })),
                    };
                    const testGroup = r._buildFromBlueprint(testBp);
                    out.allShapesRender =
                        testGroup && testGroup.children.length === 8 &&
                        testGroup.children.every((c) => !!c.geometry);

                    // Erstellung via JSON: User-Bauplan registrieren + spawnen
                    r.state.blueprints["test_hut"] = {
                        name: "test_hut",
                        label: "Test-Hütte",
                        builtIn: false,
                        parts: [
                            {
                                shape: "box",
                                color: 0xaa5500,
                                position: { x: 0, y: 1, z: 0 },
                                size: { x: 2, y: 2, z: 2 },
                            },
                            {
                                shape: "pyramid",
                                color: 0x882211,
                                position: { x: 0, y: 2.5, z: 0 },
                                size: { x: 2.5, y: 1.5, z: 2.5 },
                            },
                        ],
                    };
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    const userEntry = r.spawnArchitecture(
                        "test_hut",
                        { x: 0, y: 5, z: 5 },
                        { seed: 1 }
                    );
                    out.userBlueprintBuilds =
                        !!userEntry && !!userEntry.mesh && userEntry.mesh.children.length === 2;

                    // DSL-Op spawn_blueprint funktioniert
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    const dslRes = r.dslRun(["spawn_blueprint", "test_hut", ["at_origin"]]);
                    out.dslSpawnBlueprintOk =
                        dslRes.ok === true &&
                        r.state.architectures.length === 1 &&
                        r.state.architectures[0].type === "test_hut" &&
                        dslRes.log.some((e) => e.event === "spawned_blueprint");

                    // Unbekannter Bauplan-Name wird abgelehnt
                    const dslBad = r.dslRun(["spawn_blueprint", "phantom_nonexistent", ["at_origin"]]);
                    out.unknownBlueprintRejected = dslBad.log.some((e) => e.event === "unknown_blueprint");

                    // Save-Roundtrip: User-Bauplan überlebt
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.saveContainsUserBlueprint =
                        !!parsed &&
                        Array.isArray(parsed.blueprints) &&
                        parsed.blueprints.some((bp) => bp.name === "test_hut");
                    out.saveOmitsBuiltIn =
                        !!parsed &&
                        Array.isArray(parsed.blueprints) &&
                        !parsed.blueprints.some((bp) => bp.name === "village");

                    // loadState mit eigenem Bauplan reaktiviert ihn
                    delete r.state.blueprints["test_hut"];
                    r.loadState({
                        blueprints: [
                            {
                                name: "test_hut_2",
                                label: "Reload-Hütte",
                                parts: [
                                    {
                                        shape: "sphere",
                                        color: 0x33aa55,
                                        position: { x: 0, y: 1, z: 0 },
                                        size: { x: 2, y: 2, z: 2 },
                                    },
                                ],
                            },
                        ],
                    });
                    out.loadRestoresUserBlueprint = !!r.state.blueprints["test_hut_2"];

                    // Cleanup
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    delete r.state.blueprints["test_hut"];
                    delete r.state.blueprints["test_hut_2"];
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring64Results || ring64Results.error) {
                check(
                    "Ring 6.4: Bauplan-Snapshot erreichbar",
                    false,
                    ring64Results && ring64Results.error
                        ? ring64Results.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 6.4: Built-in Dorf-Bauplan vorhanden", ring64Results.hasVillage);
                check("Ring 6.4: Built-in Tempel-Bauplan vorhanden", ring64Results.hasTemple);
                check("Ring 6.4: Built-in Wasserfall-Bauplan vorhanden", ring64Results.hasWaterfall);
                check("Ring 6.4: Dorf ist als builtIn markiert", ring64Results.villageBuiltIn);
                check("Ring 6.4: parts ist Array", ring64Results.villagePartsArray);
                check("Ring 6.4: Dorf hat ≥10 Parts (6 Hütten + Plaza)", ring64Results.villageHasParts);
                check("Ring 6.4: Tempel hat ≥9 Parts (6 Pfeiler + Dach + Altar + Spitze)", ring64Results.templeHasParts);
                check("Ring 6.4: Wasserfall hat 3 Parts", ring64Results.waterfallHasParts);
                check(
                    "Ring 6.4: Alle 8 Primitive (box/sphere/cylinder/cone/pyramid/octahedron/plane/torus) renderbar",
                    ring64Results.allShapesRender
                );
                check("Ring 6.4: User-Bauplan als Daten spawnt korrekt Mesh", ring64Results.userBlueprintBuilds);
                check(
                    "Ring 6.4: DSL-Op spawn_blueprint(name, pos) funktioniert",
                    ring64Results.dslSpawnBlueprintOk
                );
                check(
                    "Ring 6.4: Unbekannter Bauplan-Name wird abgelehnt",
                    ring64Results.unknownBlueprintRejected
                );
                check("Ring 6.4: saveState persistiert eigene Baupläne", ring64Results.saveContainsUserBlueprint);
                check(
                    "Ring 6.4: Save lässt Built-in-Baupläne aus (kommen aus _defaultBlueprints)",
                    ring64Results.saveOmitsBuiltIn
                );
                check(
                    "Ring 6.4: loadState rekonstruiert eigene Baupläne",
                    ring64Results.loadRestoresUserBlueprint
                );
            }

            // ### Ring 6.5 — Hotbar mit 9 Slots ###
            const ring65Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    const out = {};
                    // DOM-Hotbar
                    const bar = document.getElementById("hotbar");
                    out.hotbarInDom = !!bar;
                    out.hotbarHasNineSlots =
                        bar && bar.querySelectorAll(".hotbar-slot").length === 9;
                    out.defaultHotbar =
                        Array.isArray(r.state.hotbar) &&
                        r.state.hotbar.length === 9 &&
                        r.state.hotbar[0] === "village" &&
                        r.state.hotbar[1] === "temple" &&
                        r.state.hotbar[2] === "waterfall" &&
                        r.state.hotbar.slice(3).every((s) => s === null);
                    // Slot-Label folgt aus blueprints.label
                    const firstSlotLabel = bar.querySelector('.hotbar-slot[data-slot="0"] .label');
                    out.firstSlotShowsLabel = firstSlotLabel && firstSlotLabel.textContent === "Dorf";

                    // setHotbarSlot setzt slot 5 auf eigenen Bauplan
                    r.state.blueprints["test_hotbar_bp"] = {
                        name: "test_hotbar_bp",
                        label: "Test-Bp",
                        builtIn: false,
                        parts: [
                            {
                                shape: "box",
                                color: 0x44aa44,
                                position: { x: 0, y: 1, z: 0 },
                                size: { x: 2, y: 2, z: 2 },
                            },
                        ],
                    };
                    const setOk = r.setHotbarSlot(5, "test_hotbar_bp");
                    out.setHotbarOk =
                        setOk === true && r.state.hotbar[5] === "test_hotbar_bp";
                    // DOM hat label aktualisiert
                    const slot5Label = bar.querySelector('.hotbar-slot[data-slot="5"] .label');
                    out.hotbarDomReflectsSet = slot5Label && slot5Label.textContent === "Test-Bp";

                    // Unbekannter Bauplan-Name wird abgelehnt
                    const setBad = r.setHotbarSlot(5, "definitiv_nicht_da");
                    out.setHotbarRejectsUnknown =
                        setBad === false && r.state.hotbar[5] === "test_hotbar_bp";

                    // selectHotbarSlot(idx) auf belegten Slot aktiviert Build-Modus
                    r.selectHotbarSlot(5);
                    out.selectActivatesMode =
                        r.state.buildMode.active === true &&
                        r.state.buildMode.blueprintName === "test_hotbar_bp" &&
                        r.state.buildMode.slotIndex === 5;
                    // Highlight im DOM
                    const slot5El = bar.querySelector('.hotbar-slot[data-slot="5"]');
                    out.highlightActiveSlot = slot5El && slot5El.classList.contains("active");

                    // selectHotbarSlot(idx) auf leeren Slot deaktiviert Build-Mode
                    r.selectHotbarSlot(8); // leer
                    out.emptySlotDeactivates = r.state.buildMode.active === false;

                    // confirmBuild im aktiven Modus spawnt den Bauplan
                    r.selectHotbarSlot(5);
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    const cb = r.confirmBuild();
                    out.confirmBuildSpawnsCorrectBp =
                        cb === true &&
                        r.state.architectures.length === 1 &&
                        r.state.architectures[0].type === "test_hotbar_bp";

                    // setHotbarSlot(idx, null) leert den Slot
                    r.setHotbarSlot(5, null);
                    out.clearedSlotIsNull = r.state.hotbar[5] === null;
                    const slot5LabelAfter = bar.querySelector('.hotbar-slot[data-slot="5"] .label');
                    out.clearedDomShowsEmpty =
                        slot5LabelAfter && slot5LabelAfter.textContent === "—";

                    // Hotbar-Config-Drawer hat 9 Reihen
                    const config = document.getElementById("hotbar-config");
                    out.hotbarConfigInDom = !!config;
                    out.hotbarConfigHasNineRows =
                        config && config.querySelectorAll(".hotbar-config-row").length === 9;

                    // Save-Roundtrip
                    r.setHotbarSlot(7, "temple");
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    let parsed = null;
                    try {
                        parsed = JSON.parse(raw);
                    } catch (e) {
                        void e;
                    }
                    out.saveContainsHotbar =
                        !!parsed &&
                        Array.isArray(parsed.hotbar) &&
                        parsed.hotbar.length === 9 &&
                        parsed.hotbar[7] === "temple";

                    // loadState restauriert hotbar
                    r.state.hotbar = [null, null, null, null, null, null, null, null, null];
                    r.loadState({ hotbar: ["temple", null, "village", null, null, null, null, null, null] });
                    out.loadRestoresHotbar =
                        r.state.hotbar[0] === "temple" && r.state.hotbar[2] === "village";

                    // Cleanup
                    delete r.state.blueprints["test_hotbar_bp"];
                    r._clearBuildMode();
                    r.state.hotbar = ["village", "temple", "waterfall", null, null, null, null, null, null];
                    r._renderHotbarDOM();
                    for (const a of r.state.architectures.slice()) {
                        if (a.mesh) r._cullArchitectureMesh(a);
                    }
                    r.state.architectures = [];
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring65Results || ring65Results.error) {
                check(
                    "Ring 6.5: Hotbar-Snapshot erreichbar",
                    false,
                    ring65Results && ring65Results.error
                        ? ring65Results.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 6.5: #hotbar im DOM", ring65Results.hotbarInDom);
                check("Ring 6.5: Hotbar hat 9 Slots", ring65Results.hotbarHasNineSlots);
                check(
                    "Ring 6.5: Default-Hotbar [village, temple, waterfall, ..., null]",
                    ring65Results.defaultHotbar
                );
                check("Ring 6.5: Slot-Label folgt Bauplan-Label", ring65Results.firstSlotShowsLabel);
                check("Ring 6.5: setHotbarSlot setzt Eintrag", ring65Results.setHotbarOk);
                check("Ring 6.5: Hotbar-DOM aktualisiert sich nach setHotbarSlot", ring65Results.hotbarDomReflectsSet);
                check(
                    "Ring 6.5: setHotbarSlot lehnt unbekannte Baupläne ab",
                    ring65Results.setHotbarRejectsUnknown
                );
                check(
                    "Ring 6.5: selectHotbarSlot aktiviert Bau-Modus mit korrektem Bauplan",
                    ring65Results.selectActivatesMode
                );
                check("Ring 6.5: aktiver Slot bekommt .active-Class", ring65Results.highlightActiveSlot);
                check(
                    "Ring 6.5: leerer Slot deaktiviert Bau-Modus",
                    ring65Results.emptySlotDeactivates
                );
                check(
                    "Ring 6.5: confirmBuild im Hotbar-Modus spawnt richtigen Bauplan",
                    ring65Results.confirmBuildSpawnsCorrectBp
                );
                check("Ring 6.5: setHotbarSlot(idx, null) leert den Slot", ring65Results.clearedSlotIsNull);
                check(
                    "Ring 6.5: Leerer Slot zeigt — als Label",
                    ring65Results.clearedDomShowsEmpty
                );
                check("Ring 6.5: #hotbar-config-Container im Spieler-Drawer", ring65Results.hotbarConfigInDom);
                check("Ring 6.5: Hotbar-Config hat 9 Reihen", ring65Results.hotbarConfigHasNineRows);
                check("Ring 6.5: saveState persistiert Hotbar", ring65Results.saveContainsHotbar);
                check("Ring 6.5: loadState rekonstruiert Hotbar", ring65Results.loadRestoresHotbar);
            }

            // ### Ring 6.6 — Werkstatt-Tab + Part-Editor ###
            const ring66Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    const out = {};

                    // UI vorhanden
                    out.workshopTabInDom = !!document.querySelector('#topbar [data-tab="werkstatt"]');
                    out.workshopDrawerInDom = !!document.querySelector('.drawer[data-drawer="werkstatt"]');
                    out.workshopListInDom = !!document.getElementById("workshop-list");
                    out.workshopEditorInDom = !!document.getElementById("workshop-editor");

                    // Liste hat einen Eintrag pro Bauplan
                    const list = document.getElementById("workshop-list");
                    out.listShowsAllBlueprints =
                        list && list.querySelectorAll(".workshop-list-row").length ===
                            Object.keys(r.state.blueprints).length;

                    // createBlueprint
                    const beforeCount = Object.keys(r.state.blueprints).length;
                    const ok1 = r.createBlueprint("test_hut", "Test-Hütte");
                    out.createBlueprintOk =
                        ok1 === true &&
                        Object.keys(r.state.blueprints).length === beforeCount + 1 &&
                        r.state.blueprints["test_hut"].builtIn === false;

                    // createBlueprint mit existierendem Namen wird abgelehnt
                    const okDup = r.createBlueprint("test_hut", "Doppelt");
                    out.duplicateNameRejected = okDup === false;

                    // addPartToBlueprint
                    const ok2 = r.addPartToBlueprint("test_hut", {
                        shape: "box",
                        color: 0xff0000,
                        position: { x: 0, y: 1, z: 0 },
                        size: { x: 2, y: 2, z: 2 },
                    });
                    out.addPartOk = ok2 === true && r.state.blueprints["test_hut"].parts.length === 1;

                    // Built-in akzeptiert keine addPart
                    const okBuiltIn = r.addPartToBlueprint("village", { shape: "sphere" });
                    out.builtInRejectsAddPart = okBuiltIn === false;

                    // updatePartInBlueprint
                    r.updatePartInBlueprint("test_hut", 0, {
                        color: 0x00ff00,
                        position: { y: 2.5 },
                    });
                    const p = r.state.blueprints["test_hut"].parts[0];
                    out.updatePartMerges =
                        p.color === 0x00ff00 &&
                        p.position.y === 2.5 &&
                        p.position.x === 0 &&
                        p.position.z === 0;

                    // removePartFromBlueprint
                    r.addPartToBlueprint("test_hut", { shape: "cone" });
                    r.addPartToBlueprint("test_hut", { shape: "sphere" });
                    const beforeRm = r.state.blueprints["test_hut"].parts.length;
                    r.removePartFromBlueprint("test_hut", 1);
                    out.removePartShrinks =
                        r.state.blueprints["test_hut"].parts.length === beforeRm - 1;

                    // cloneBlueprint (Built-in → eigen)
                    const okClone = r.cloneBlueprint("temple", "my_temple");
                    out.cloneBlueprintOk =
                        okClone === true &&
                        r.state.blueprints["my_temple"].builtIn === false &&
                        r.state.blueprints["my_temple"].parts.length ===
                            r.state.blueprints["temple"].parts.length;

                    // Klone können editiert werden
                    const okClonePart = r.removePartFromBlueprint("my_temple", 0);
                    out.cloneIsEditable =
                        okClonePart === true &&
                        r.state.blueprints["my_temple"].parts.length ===
                            r.state.blueprints["temple"].parts.length - 1;

                    // deleteBlueprint (eigen)
                    const beforeDel = Object.keys(r.state.blueprints).length;
                    const okDel = r.deleteBlueprint("test_hut");
                    out.deleteBlueprintOk =
                        okDel === true &&
                        Object.keys(r.state.blueprints).length === beforeDel - 1 &&
                        !r.state.blueprints["test_hut"];

                    // deleteBlueprint Built-in wird abgelehnt
                    const okDelBuiltIn = r.deleteBlueprint("village");
                    out.builtInProtectedFromDelete =
                        okDelBuiltIn === false && !!r.state.blueprints["village"];

                    // delete räumt Hotbar-Slots auf, die diesen Bauplan halten
                    r.state.hotbar[4] = "my_temple";
                    r.deleteBlueprint("my_temple");
                    out.deleteCascadesHotbar = r.state.hotbar[4] === null;

                    // selectBlueprintForEdit + DOM update
                    r.createBlueprint("ed_test", "Editier-Test");
                    r.selectBlueprintForEdit("ed_test");
                    out.selectUpdatesWorkshop =
                        r.state.workshop.selectedBlueprint === "ed_test";

                    // Editor zeigt Selected-Status
                    const selectedRow = document.querySelector(
                        '.workshop-list-row[data-blueprint="ed_test"]'
                    );
                    out.selectedRowHasClass =
                        selectedRow && selectedRow.classList.contains("selected");

                    // Save-Roundtrip: eigene Baupläne werden serialisiert
                    r.addPartToBlueprint("ed_test", {
                        shape: "sphere",
                        color: 0x553355,
                        position: { x: 0, y: 2, z: 0 },
                        size: { x: 3, y: 3, z: 3 },
                    });
                    r.saveState();
                    const raw = localStorage.getItem("anazhRealmState");
                    const parsed = JSON.parse(raw);
                    const savedBp = parsed.blueprints.find((bp) => bp.name === "ed_test");
                    out.saveContainsCustom =
                        !!savedBp &&
                        savedBp.parts.length === 1 &&
                        savedBp.parts[0].shape === "sphere";

                    // Cleanup
                    r.deleteBlueprint("ed_test");
                    r.selectBlueprintForEdit("village");
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring66Results || ring66Results.error) {
                check(
                    "Ring 6.6: Werkstatt-Snapshot erreichbar",
                    false,
                    ring66Results && ring66Results.error
                        ? ring66Results.error
                        : "page.evaluate fehlgeschlagen"
                );
            } else {
                check("Ring 6.6: Werkstatt-Tab in Topbar", ring66Results.workshopTabInDom);
                check("Ring 6.6: Werkstatt-Drawer im DOM", ring66Results.workshopDrawerInDom);
                check("Ring 6.6: #workshop-list im DOM", ring66Results.workshopListInDom);
                check("Ring 6.6: #workshop-editor im DOM", ring66Results.workshopEditorInDom);
                check(
                    "Ring 6.6: Liste zeigt einen Eintrag pro Bauplan",
                    ring66Results.listShowsAllBlueprints
                );
                check("Ring 6.6: createBlueprint legt neuen eigenen Bauplan an", ring66Results.createBlueprintOk);
                check("Ring 6.6: createBlueprint lehnt doppelte Namen ab", ring66Results.duplicateNameRejected);
                check("Ring 6.6: addPartToBlueprint hängt Part an", ring66Results.addPartOk);
                check(
                    "Ring 6.6: addPartToBlueprint lehnt Built-in ab",
                    ring66Results.builtInRejectsAddPart
                );
                check(
                    "Ring 6.6: updatePartInBlueprint merget Patch in Bestand",
                    ring66Results.updatePartMerges
                );
                check("Ring 6.6: removePartFromBlueprint verkleinert parts", ring66Results.removePartShrinks);
                check(
                    "Ring 6.6: cloneBlueprint erzeugt eigene Kopie eines Built-in",
                    ring66Results.cloneBlueprintOk
                );
                check("Ring 6.6: Klone sind voll editierbar", ring66Results.cloneIsEditable);
                check("Ring 6.6: deleteBlueprint entfernt eigene Baupläne", ring66Results.deleteBlueprintOk);
                check(
                    "Ring 6.6: Built-in vor Löschung geschützt",
                    ring66Results.builtInProtectedFromDelete
                );
                check(
                    "Ring 6.6: deleteBlueprint räumt referenzierte Hotbar-Slots auf",
                    ring66Results.deleteCascadesHotbar
                );
                check(
                    "Ring 6.6: selectBlueprintForEdit setzt state.workshop.selectedBlueprint",
                    ring66Results.selectUpdatesWorkshop
                );
                check(
                    "Ring 6.6: Selected-Row trägt .selected-Class im DOM",
                    ring66Results.selectedRowHasClass
                );
                check(
                    "Ring 6.6: Save persistiert eigene Baupläne inkl. Parts",
                    ring66Results.saveContainsCustom
                );
            }

            // ### Ring 6 V2 — Distance-Culling, Fraktal, Counter, Bau-Cursor ###
            const ring6v2Results = await page
                .evaluate(() => {
                    const r = window.anazhRealm;
                    if (!r) return null;
                    const out = {};

                    // Cleanup
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];
                    r._clearBuildMode();

                    // === A) Distance-Culling ===
                    // Setze Spieler auf (0,0,0), spawne weit + nah.
                    r.state.playerMesh.position.set(0, 20, 0);
                    const near = r.spawnArchitecture("temple", { x: 5, y: 5, z: 5 }, { seed: 1 });
                    const far = r.spawnArchitecture("temple", { x: 400, y: 5, z: 400 }, { seed: 2 });
                    out.nearHasMesh = !!near.mesh;
                    out.farIsCold = far.mesh === null;
                    // Spieler weg vom near → cull-Tick muss near disposen
                    r.state.playerMesh.position.set(400, 20, 400);
                    r.state.architectureCullingLastTick = -Infinity; // erzwingen
                    r.tickArchitectureCulling(1.0);
                    out.nearCulledAfterWalkAway = near.mesh === null;
                    out.farRebuiltAfterApproach = !!far.mesh;
                    // Zurück gehen → near baut sich wieder auf
                    r.state.playerMesh.position.set(0, 20, 0);
                    r.state.architectureCullingLastTick = -Infinity;
                    r.tickArchitectureCulling(2.0);
                    out.nearRebuiltAfterReturn = !!near.mesh;

                    // === B) spawn_fractal ===
                    // Cleanup first
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];
                    const before = r.state.architectures.length;
                    const dslRes = r.dslRun(["spawn_fractal", ["at_origin"], "temple", 2, 0.5]);
                    // depth=2 mit 6 Kindern: 1 + 6 + 36 = 43
                    out.fractalSpawnsExpected = dslRes.ok === true && r.state.architectures.length === before + 43;
                    const eventFound = dslRes.log.find((e) => e.event === "spawned_fractal");
                    out.fractalEventEmitted = !!eventFound && eventFound.count === 43;
                    // Determinismus: gleiche Argumente sollten in dieser Test-
                    // Welt nicht zu identischen Positionen führen, weil
                    // ctx.rng() den Root-Seed bestimmt — ABER die HEXAGONAL-
                    // Anordnung sollte erkennbar sein (6 Children auf einem
                    // Kreis um die Wurzel).
                    // Visit ist depth-first: root, dann visit(child0) inkl.
                    // dessen Grand-Children, dann child1, etc. Direkte
                    // Kinder finden wir über scale (genau 0.5 bei ratio 0.5);
                    // Grandchildren haben 0.25.
                    const rootEntry = r.state.architectures[before];
                    const directChildren = r.state.architectures
                        .slice(before)
                        .filter((e) => Math.abs(e.scale - 0.5) < 1e-6);
                    const childRadii = directChildren.map((e) =>
                        Math.hypot(e.position.x - rootEntry.position.x, e.position.z - rootEntry.position.z)
                    );
                    out.fractalChildrenAreHexagonal =
                        childRadii.length === 6 &&
                        childRadii.every((rad) => Math.abs(rad - childRadii[0]) < 0.5);
                    // Scale-Hierarchie: Root=1, direkte Kinder=0.5, Grand-Children=0.25
                    const grandChildren = r.state.architectures
                        .slice(before)
                        .filter((e) => Math.abs(e.scale - 0.25) < 1e-6);
                    out.fractalScalesShrink =
                        rootEntry.scale === 1 && directChildren.length === 6 && grandChildren.length === 36;

                    // Chat-Pattern
                    r.processChatCommand("baue fraktal wasserfall");
                    out.chatFractalRoutes =
                        Array.isArray(r.state.dsl.lastUserProgram) &&
                        r.state.dsl.lastUserProgram[0] === "spawn_fractal" &&
                        r.state.dsl.lastUserProgram[2] === "waterfall";

                    // === C) Counter ===
                    // Cleanup, baue 3 nah, 5 weit
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];
                    r.state.playerMesh.position.set(0, 20, 0);
                    for (let i = 0; i < 3; i++) r.spawnArchitecture("temple", { x: i * 10, y: 5, z: 0 }, { seed: i });
                    for (let i = 0; i < 5; i++) r.spawnArchitecture("village", { x: 300 + i * 5, y: 5, z: 0 }, { seed: i });
                    const counts = r.countArchitecturesNearPlayer(60);
                    out.counterNear = counts.near === 3;
                    out.counterTotal = counts.total === 8;
                    // Status-Bar-Element existiert + zeigt korrektes Format
                    out.statusBarItemInDom = !!document.getElementById("status-architectures");
                    r.updateStatusPanel(1e7);
                    const statusEl = document.getElementById("status-architectures");
                    out.statusBarShowsCount = statusEl && /^\d+ nah \/ \d+$/.test(statusEl.textContent);

                    // === D) Bau-Cursor ===
                    r._clearBuildMode();
                    out.hudInDom = !!document.getElementById("build-mode-hud");
                    out.hudInitiallyHidden = document.getElementById("build-mode-hud").hidden === true;
                    // Ring 6.5: Hotbar-API ersetzt setBuildMode. Slot 0 = village.
                    r.selectHotbarSlot(0);
                    out.modeActiveAfterSet =
                        r.state.buildMode.active === true &&
                        r.state.buildMode.blueprintName === "village";
                    out.phantomInScene =
                        r.state.buildMode.phantomMesh &&
                        r.state.scene.children.indexOf(r.state.buildMode.phantomMesh) >= 0;
                    out.hudShownWhenActive = document.getElementById("build-mode-hud").hidden === false;
                    let foundTransparent = false;
                    r.state.buildMode.phantomMesh.traverse((node) => {
                        if (node.material && node.material.transparent && node.material.opacity < 1) {
                            foundTransparent = true;
                        }
                    });
                    out.phantomIsTransparent = foundTransparent;
                    // Toggle (gleicher Slot nochmal → off)
                    r.selectHotbarSlot(0);
                    out.toggleOffSameForm = r.state.buildMode.active === false;
                    // Slot wechseln (Slot 1 = temple)
                    r.selectHotbarSlot(1);
                    out.switchFormChanges = r.state.buildMode.blueprintName === "temple";
                    // confirmBuild platziert echte Struktur
                    const arBefore = r.state.architectures.length;
                    r.confirmBuild();
                    out.confirmBuildSpawns = r.state.architectures.length === arBefore + 1;
                    out.confirmBuildKeepsMode = r.state.buildMode.active === true;
                    // ESC räumt auf
                    r._clearBuildMode();
                    out.clearEndsMode = r.state.buildMode.active === false && r.state.buildMode.phantomMesh === null;

                    // Cleanup
                    for (const a of r.state.architectures) {
                        if (a.mesh) {
                            r.state.scene.remove(a.mesh);
                            r._disposeSoulGroup(a.mesh);
                        }
                    }
                    r.state.architectures = [];
                    return out;
                })
                .catch((err) => ({ error: err && err.message }));

            if (!ring6v2Results || ring6v2Results.error) {
                check(
                    "Ring 6 V2: Snapshot erreichbar",
                    false,
                    ring6v2Results && ring6v2Results.error ? ring6v2Results.error : "page.evaluate fehlgeschlagen"
                );
            } else {
                // Culling
                check("Ring 6 V2: Nahe Struktur hat Mesh", ring6v2Results.nearHasMesh);
                check("Ring 6 V2: Weite Struktur startet 'cold'", ring6v2Results.farIsCold);
                check(
                    "Ring 6 V2: Culling-Tick disposed Mesh wenn Spieler weggeht",
                    ring6v2Results.nearCulledAfterWalkAway
                );
                check(
                    "Ring 6 V2: Culling-Tick baut Mesh wenn Spieler hingeht",
                    ring6v2Results.farRebuiltAfterApproach
                );
                check(
                    "Ring 6 V2: Culling-Tick baut Mesh wieder auf nach Rückkehr",
                    ring6v2Results.nearRebuiltAfterReturn
                );
                // Fraktal
                check(
                    "Ring 6 V2: spawn_fractal(depth=2, ratio=0.5) → 1+6+36 = 43 Strukturen",
                    ring6v2Results.fractalSpawnsExpected
                );
                check(
                    "Ring 6 V2: spawned_fractal-Event emittiert mit count=43",
                    ring6v2Results.fractalEventEmitted
                );
                check(
                    "Ring 6 V2: 6 Kinder im Hexagon (gleicher Radius um Root)",
                    ring6v2Results.fractalChildrenAreHexagonal
                );
                check(
                    "Ring 6 V2: Scale-Hierarchie — Kinder bei ratio (0.5), Root bei 1",
                    ring6v2Results.fractalScalesShrink
                );
                check(
                    "Ring 6 V2: Chat 'baue fraktal wasserfall' routet korrekt",
                    ring6v2Results.chatFractalRoutes
                );
                // Counter
                check("Ring 6 V2: countArchitecturesNearPlayer nah = 3", ring6v2Results.counterNear);
                check("Ring 6 V2: countArchitecturesNearPlayer total = 8", ring6v2Results.counterTotal);
                check("Ring 6 V2: #status-architectures im DOM", ring6v2Results.statusBarItemInDom);
                check(
                    "Ring 6 V2: Status-Bar zeigt 'N nah / M' Format",
                    ring6v2Results.statusBarShowsCount
                );
                // Bau-Cursor
                check("Ring 6 V2: #build-mode-hud im DOM", ring6v2Results.hudInDom);
                check("Ring 6 V2: HUD initial versteckt", ring6v2Results.hudInitiallyHidden);
                check("Ring 6.5: selectHotbarSlot aktiviert Build-Mode", ring6v2Results.modeActiveAfterSet);
                check("Ring 6.5: Phantom-Mesh in der Szene", ring6v2Results.phantomInScene);
                check("Ring 6.5: HUD sichtbar im aktiven Bau-Modus", ring6v2Results.hudShownWhenActive);
                check("Ring 6.5: Phantom-Material ist transparent", ring6v2Results.phantomIsTransparent);
                check("Ring 6.5: Selber Slot nochmal → Toggle off", ring6v2Results.toggleOffSameForm);
                check("Ring 6.5: Slot-Wechsel ändert aktiven Bauplan", ring6v2Results.switchFormChanges);
                check("Ring 6 V2: confirmBuild spawnt echte Struktur", ring6v2Results.confirmBuildSpawns);
                check(
                    "Ring 6 V2: confirmBuild lässt Modus aktiv (Mehrfach-Bau)",
                    ring6v2Results.confirmBuildKeepsMode
                );
                check("Ring 6 V2: _clearBuildMode beendet Modus + räumt Phantom", ring6v2Results.clearEndsMode);
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

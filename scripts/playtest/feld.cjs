"use strict";
// scripts/playtest/feld.cjs — der Richter von Feld (spec/stamm/modul-karte.json): Lebens-Feld · Aura · Wohl · Welt-Feld · Selbst-Analyse · DSL-Ops · Sandbox · Welt-Regeln · Chat-Tore · Nexus: Fitness · Mutation · Komposition · Gesten-Regeln · Chat → DSL · Emotionen · Wertung.
// 18 Band/Bänder in Lauf-Reihenfolge, je Band das Modul, dessen Glieder er am meisten ruft; gestellt von
// `node scripts/stamm-umzug.cjs --richter` — ein neuer Band steht hier und in der Reihe des Läufers scripts/playtest.cjs.

const { safeEvaluate } = require("../playtest.cjs");

// Ring 2: DSL-Sandbox live — Welt-Identität, Effekte auf state, Budget-Limits, Ablehnung unbekannter
// Ops, delay-Scheduler, dslCompose; plus Nexus-Loop-Dispatch (_gameLoopTick synchron treiben, da
// Headless-Chromium rAF auf ~1 Hz drosselt). EIN Block, weil beide dslResults + phase2Results teilen.
async function checkRing2Dsl(ctx) {
    const { page, check } = ctx;
    const dslResults = await safeEvaluate(page, () => {
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
        if (!r || !r.state) return out;
        const m = r.state.worldMeta || {};
        out.worldIdSet = typeof m.worldId === "string" && m.worldId.length > 5;
        out.slugSet = typeof m.slug === "string" && m.slug.length > 0;

        const jpBefore = r.state.jumpPower;
        // UHR UND WETTER GEHÖREN DEM SPIELER: die Probe spricht als Spieler — ein Programm ohne Quelle ist
        // eine Stimme der Welt und wünscht das Wetter nur (der Wetter-Zug zieht es in seinem Takt).
        const res0 = r.dslRun(["weather", "stormy"]);
        out.weltWuenscht =
            res0.ok &&
            r.state.weather !== "stormy" &&
            res0.log.some((e) => e.event === "wetter_gewuenscht" || e.event === "wetter_gehalten");
        const res1 = r.dslRun(["weather", "rainy"], { source: "human" });
        out.weatherEffect = res1.ok && r.state.weather === "rainy";

        // DIE KÖRPER-GESETZE SIND GESETZ: player_jump_power wiegt nur im Gesetz-Band des Leibs — der
        // Test wählt zwei Werte IM Band (17 und 22 lagen jenseits davon; dslEval weist sie benannt ab).
        const jBand = r._koerperGesetzBand("jumpPower");
        const jA = +(jBand.min + 0.3 * (jBand.max - jBand.min)).toFixed(3);
        const jB = +(jBand.min + 0.7 * (jBand.max - jBand.min)).toFixed(3);
        const res2 = r.dslRun(["chain", ["weather", "sunny"], ["player_jump_power", jA]], { source: "human" });
        out.chainEffect = res2.ok && r.state.weather === "sunny" && r.state.jumpPower === jA;

        const creBefore = r.state.creatures.length;
        // maxCreatures 120→20 (Schöpfer-Anordnung): Raum für die 2 sichern,
        // damit dieser Band den spawn_creature-INTENT misst, nicht den Cap (der Warmup
        // kann nahe 20 liegen). Der Test wandert mit dem Code (kein Revert der Senkung).
        const _saveMaxPos = r.state.maxCreatures;
        r.state.maxCreatures = creBefore + 2;
        const res3 = r.dslRun(["spawn_creature", ["at_origin"], 2, "happy"]);
        out.positionEffect =
            res3.ok &&
            res3.log.some((e) => e.event === "spawned_creature") &&
            r.state.creatures.length === creBefore + 2;
        r.state.maxCreatures = _saveMaxPos;

        const res4 = r.dslRun(["when", ["weather_is", "sunny"], ["player_jump_power", jB]]);
        out.conditionEffect = res4.ok && r.state.jumpPower === jB;

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
        out.depthBudgetEnforced = res6.log.some((e) => e.event === "budget_exceeded" && e.budget === "depth");

        const pendingBefore = r.state.dsl.pending.length;
        r.dslRun(["delay", 999, ["weather", "rainy"]]);
        out.delayScheduled = r.state.dsl.pending.length === pendingBefore + 1;
        r.state.dsl.pending = r.state.dsl.pending.filter((p) => p.runAt < 9999999);

        // Phase 2: dslCompose + Loop-Dispatch.
        const composed = r.dslCompose();
        out.composeIsArray = Array.isArray(composed);
        out.composeRootIsChain = out.composeIsArray && composed[0] === "chain";
        const histBefore = r.state.dsl.history.length;
        // Der Nexus ZAHLT am Wirk-Tor; ein von früheren Bändern verarmtes Budget ließe die Test-Evolution
        // korrekt ruhen. Geprüft wird der DISPATCH (Ökonomie: checkBandPhasenBF) → Budget decken.
        r.state.nexusWirk = r.constructor.NEXUS_WIRK.max;
        r.state.nexusEvolutionQueue.push({
            name: `playtest_evo_${Date.now()}`,
            program: composed,
            source: "playtest",
            createdAt: performance.now() / 1000,
        });
        out.histBefore = histBefore;

        // Keine Struktur-Batch-Bomben: generateEvolution erzeugt nie >1 schweren Welt-Bau pro Evolution
        // (`repeat N × spawn_village` liefe synchron als N Footprint-Remeshes = periodischer Nexus-Freeze).
        {
            const HEAVY = /spawn_(village|temple|island|fractal|waterfall)/g;
            let maxHeavy = 0;
            for (let i = 0; i < 120; i++) {
                const ev = r.generateEvolution();
                const n = (JSON.stringify(ev.program).match(HEAVY) || []).length;
                if (n > maxHeavy) maxHeavy = n;
            }
            out.evoMaxHeavy = maxHeavy;
        }

        r.state.jumpPower = jpBefore;
        return out;
    });

    const phase2Results = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        for (let k = 0; k < 5; k++) r._gameLoopTick(performance.now());
        return {
            historyLen: r.state.dsl.history.length,
            queueLen: r.state.nexusEvolutionQueue.length,
            lastHistory: r.state.dsl.history[r.state.dsl.history.length - 1] || null,
        };
    });

    if (!dslResults) {
        check("DSL-Smoketest erreichbar", false, "dslRun nicht aufrufbar");
    } else {
        // Welt-Identität (worldId) gesetzt
        check("Welt-Identität gesetzt", dslResults.worldIdSet);
        check("Welt-Slug gesetzt", dslResults.slugSet);
        // DSL-Effekt: weather wirkt auf state (Satz des Spielers)
        check("DSL-Effekt: weather wirkt auf state", dslResults.weatherEffect);
        // Leben-Schau 2: ein Programm ohne Quelle (die Welt) schreibt das Wetter nie selbst — es wünscht
        check(
            "Leben-Schau 2: ein Programm ohne Quelle schreibt das Wetter nie selbst",
            dslResults.weltWuenscht
        );
        check("DSL-Komposition: chain führt mehrere Effekte aus", dslResults.chainEffect);
        check("DSL-Position: at_origin + spawn_creature wirkt", dslResults.positionEffect);
        check("DSL-Condition: when/weather_is verzweigt korrekt", dslResults.conditionEffect);
        check("DSL-Sicherheit: unbekannte Op wird abgelehnt", dslResults.unknownOpRejected);
        check("DSL-Budget: maxDepth greift bei tiefer Verschachtelung", dslResults.depthBudgetEnforced);
        check("DSL-Scheduler: delay reiht in pending ein", dslResults.delayScheduled);
        check("Nexus-Generator: dslCompose produziert Array", dslResults.composeIsArray);
        check(
            `generateEvolution erzeugt keine Struktur-Batch-Bombe (max ${dslResults.evoMaxHeavy} schwerer Bau/Evolution ≤ 1, kein synchroner Footprint-Remesh-Stapel)`,
            dslResults.evoMaxHeavy <= 1
        );
        check(
            "Nexus-Generator: Komposition hat chain als Wurzel",
            dslResults.composeRootIsChain,
            `root=${dslResults.composeIsArray ? `"${(dslResults.composeRootIsChain && "chain") || "?"}"` : "n/a"}`
        );
        if (phase2Results) {
            // FPS-Drop-Handler kann während des Wait-Intervalls neue
            // Legacy-Evolutionen in die Queue schieben — wir prüfen
            // daher Effekt (history grew), nicht Queue-Tiefe.
            // Nexus-Loop verarbeitet DSL-Evolution (history wächst)
            check(
                "Nexus-Loop verarbeitet DSL-Evolution",
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
}

// Harmonie statt Revert: drei Kräfte verschmelzen, ohne zu überschreiben — Wetter (Feld weicht dem
// Willen: ×(1−emoSignal)), Sky (DSL-Tönung blendet mit Tag-Nacht + fadet), Spawn (Ring um den
// Spieler, nicht AUF ihm). Sky-Fade behavioral mit Restore, Rest Source-Probe (kein Spawn-Leak).
async function checkBandV1723Harmony(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        r.state.skyTint = null;
        r.state.skyTintTarget = 0;
        r.state.skyTintStrength = 0;
        r.dslRun(["skybox_color", "#d4a3ff"], { source: "test" });
        out.skyTintSet = !!r.state.skyTint && r.state.skyTintTarget > 0;
        const t0 = r.state.skyTintTarget;
        const tint = { skyR: 0.2, skyG: 0.3, skyB: 0.5 };
        for (let i = 0; i < 10; i++) r._dayNightApplySkybox(tint);
        out.skyRamped = r.state.skyTintStrength > 0.05; // smooth hoch-gerampt (kein Snap)
        out.skyDecays = r.state.skyTintTarget < t0; // Ziel fadet
        r.state.skyTint = null; // Restore — kein Leak
        r.state.skyTintTo = null;
        r.state.skyTintTarget = 0;
        r.state.skyTintStrength = 0;
        // Farb-Cross-Fade: skyTint lerpt von Rot zur Ziel-Farbe Blau (ein
        // Farbwechsel springt nicht, er fadet). Erst rot (init), dann blau (skyTint
        // bleibt rot), dann ticken → skyTint wandert Richtung blau.
        r.dslRun(["skybox_color", "#ff0000"], { source: "test" });
        r.dslRun(["skybox_color", "#0000ff"], { source: "test" });
        const beforeHex = r.state.skyTint.getHex();
        for (let i = 0; i < 25; i++) r._dayNightApplySkybox({ skyR: 0.2, skyG: 0.3, skyB: 0.5 });
        const afterHex = r.state.skyTint.getHex();
        out.colorCrossFades =
            (afterHex & 0xff) > (beforeHex & 0xff) && ((afterHex >> 16) & 0xff) < ((beforeHex >> 16) & 0xff);
        r.state.skyTint = null; // Restore
        r.state.skyTintTo = null;
        r.state.skyTintTarget = 0;
        r.state.skyTintStrength = 0;
        // drei Wesen am Spieler: sie stehen im Ring um ihn (4–6,5 m), nie auf ihm und nie gestapelt
        const pmR = r.state.playerMesh.position;
        const capR = r.state.maxCreatures,
            n0 = r.state.creatures.length;
        r.state.maxCreatures = n0 + 3;
        r.dslRun(["spawn_creature", ["at_player"], 3, "happy"], { source: "test" });
        const born = r.state.creatures.slice(n0);
        const dR = born.map((c) => Math.hypot(c.position.x - pmR.x, c.position.z - pmR.z));
        out.spawnRings =
            born.length > 0 &&
            dR.every((d) => d >= 4 - 1e-6 && d <= 6.5 + 1e-6) &&
            born.every((a, i) => born.every((b, j) => j <= i || Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z) > 0.05));
        born.forEach((c) => r.removeCreature(c));
        r.state.maxCreatures = capR;
        return out;
    });
    // Harmonie: skybox_color setzt eine Tönung (state.skyTint), snappt nicht himmelTint
    check("Harmonie: skybox_color setzt eine Tönung, snappt nicht himmelTint", res.skyTintSet);
    // Harmonie: die Sky-Tönung rampt smooth hoch (kein Snap)
    check("Harmonie: die Sky-Tönung rampt smooth hoch", res.skyRamped);
    // Harmonie: die Sky-Tönung fadet (Ziel decayt → verblasst, nicht abrupt)
    check("Harmonie: die Sky-Tönung fadet", res.skyDecays);
    // Harmonie: die Sky-FARBE cross-fadet (Farbwechsel springt nicht, er fadet)
    check("Harmonie: die Sky-FARBE cross-fadet", res.colorCrossFades);
    // Harmonie: Kreaturen ringen um den Spieler, nie AUF ihm (Spawn-Ring)
    check("Harmonie: Kreaturen ringen um den Spieler, nie AUF ihm", res.spawnRings);
}

// Feld-Richtung: der Nexus trägt Leben zum BEDARF (at_field_need = ärmster Punkt im Ring). Beweis:
// der Resolver findet das lebendig-Minimum, dslComposeAtomic nutzt ihn.
async function checkBandV1726FieldDirection(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        if (r.state.lifeField) r.state.lifeField.clear(); // V17.27 — at_field_need misst hier das frozen Ring-Minimum
        const pm = r.state.playerMesh.position;
        {
            const ctx2 = { state: r.state, rng: () => 0.5, log: { push() {} }, budget: {} };
            const need = r.dslPositions.at_field_need([50], ctx2);
            const needLeb = r.auraAt(need.x, need.z).lebendig;
            let minLeb = Infinity;
            for (let i = 0; i < 8; i++) {
                const ang = (i / 8) * Math.PI * 2;
                const leb = r.auraAt(pm.x + Math.cos(ang) * 50, pm.z + Math.sin(ang) * 50).lebendig;
                if (leb < minLeb) minLeb = leb;
            }
            out.needIsMin = Math.abs(needLeb - minLeb) < 1e-9; // der Bedarf-Punkt IST das Ring-Minimum
            out.onRing = Math.abs(Math.hypot(need.x - pm.x, need.z - pm.z) - 50) < 1.0; // liegt auf dem Ring
            out.needLeb = needLeb;
            out.minLeb = minLeb;
        }
        return out;
    });
    // Feld-Richtung: at_field_need findet den ÄRMSTEN Punkt im Ring (die Welt heilt sich)
    check(
        "Feld-Richtung: at_field_need findet den ÄRMSTEN Punkt im Ring",
        res.needIsMin,
        `needLeb=${res.needLeb} == min=${res.minLeb}`
    );
    // Feld-Richtung: der Bedarf-Punkt liegt auf dem Ring (Radius 50)
    check("Feld-Richtung: der Bedarf-Punkt liegt auf dem Ring", res.onRing);
}

// Emotion aus dem SEIN: alle sechs Achsen speisen sich aus TATEN (ACTION_TO_EMOTION an jeder
// Handlungs-Stelle), ZUSTAND (niedrige HP) und UMGEBUNG (Feld) — nicht nur aus Chat-Stichwörtern.
async function checkBandV1730EmotionFromBeing(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const A2E = r.constructor.ACTION_TO_EMOTION;
        // ALLE sechs Achsen werden von IRGENDEINER Tat erreicht (ueber alle Achsen)
        const axes = new Set();
        for (const t of Object.keys(A2E || {})) for (const a of Object.keys(A2E[t])) axes.add(a);
        out.allSixAxes = ["joy", "awe", "sorrow", "hope", "peace", "chaos"].every((a) => axes.has(a));
        const e = r.state.player.emotions;
        const reset = () => {
            for (const k of Object.keys(e)) e[k] = 0;
        };
        reset();
        r._feelAction("build");
        out.buildJoyHope = e.joy > 0 && e.hope > 0;
        reset();
        r._feelAction("damage");
        out.damageSorrowChaos = e.sorrow > 0 && e.chaos > 0;
        reset();
        r._feelAction("explore");
        out.exploreAwe = e.awe > 0;
        reset();
        r._feelAction("create_life");
        out.lifeJoyPeace = e.joy > 0 && e.peace > 0;
        reset();
        r._feelAction("bond");
        out.bondPeace = e.peace > 0;
        reset();
        return out;
    });
    // Pfeiler 2: ALLE sechs Achsen werden von Taten erreicht (ueber alle Achsen)
    check("Pfeiler 2: ALLE sechs Achsen werden von Taten erreicht", res.allSixAxes);
    check("Taten: bauen → joy + hope", res.buildJoyHope);
    check("Taten: Schaden/Gefahr → sorrow + chaos", res.damageSorrowChaos);
    check("Taten: erkunden → awe", res.exploreAwe);
    // Taten: Leben spawnen (Spieler) → joy + peace
    check("Taten: Leben spawnen → joy + peace", res.lifeJoyPeace);
    check("Taten: sich verbuenden → peace", res.bondPeace);
}

// rule-Primitiv: ein `when`, das NICHT verfällt — `rule` REGISTRIERT Bedingung→Effekt in
// state.worldRules, _tickWorldRules prüft fortlaufend. Gemessen u. a.: kein Sofort-Effekt, everySec,
// TTL, Frame-Budget, Dedup, Cap+Eviction, keine Same-Tick-Kaskade, deterministische Regel-RNG.
async function checkBandV1733WorldRules(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const K = r.constructor;
        const out = {};
        const now = () => performance.now() / 1000;

        // --- Verdrahtung ---
        out.cfgWired = !!K.WORLD_RULES && K.WORLD_RULES.cap === 64 && typeof K.WORLD_RULES.minEverySec === "number";
        out.registryArray = Array.isArray(r.state.worldRules);
        out.tickWired = window.__consumes(r, "_gameLoopTick", r, "_tickWorldRules", [performance.now()]); // der Takt ruft sie

        // Save world state we mutate
        const savedRules = r.state.worldRules.slice();
        const savedWeather = r.state.weather;
        const e = r.state.player.emotions;
        const savedEmotions = Object.assign({}, e);

        // --- (1) Registrierung statt Sofort-Effekt ---
        r.state.worldRules.length = 0;
        r.state.weather = "sunny";
        for (const k of Object.keys(e)) e[k] = 0;
        e.sorrow = 0.8;
        const reg = r.dslRun(["rule", ["emotion_above", "sorrow", 0.5], ["weather", "rainy"], { everySec: 0.5 }], {
            source: "human",
        });
        out.regOk = reg.ok === true;
        out.registeredOne = r.state.worldRules.length === 1;
        out.notFiredOnRegister = r.state.weather === "sunny"; // registriert, Effekt NICHT sofort

        // --- (2) Feuern bei wahrer Bedingung ---
        const t1 = now();
        r._tickWorldRules(t1);
        out.firesWhenTrue = r.state.weather === "rainy";

        // --- (3) everySec-Gate: sofortiger Re-Tick feuert nicht erneut ---
        r.state.weather = "sunny"; // wuerde wieder rainy, falls die Regel erneut feuerte
        r._tickWorldRules(t1); // gleicher Zeitpunkt < everySec nach lastFired
        out.everySecGate = r.state.weather === "sunny";

        // --- (4) Bedingung false → feuert nicht ---
        e.sorrow = 0.0;
        r.state.worldRules[0].lastFired = -Infinity; // Gate oeffnen → NUR die Bedingung entscheidet
        r._tickWorldRules(now());
        out.skipsWhenFalse = r.state.weather === "sunny";

        // --- (5) TTL entfernt die Regel ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "sunny"], { ttlSec: 1 }], { source: "nexus" });
        out.ttlRegistered = r.state.worldRules.length === 1;
        r.state.worldRules[0].born = now() - 5; // 5 s alt, ttl 1 s → abgelaufen
        r._tickWorldRules(now());
        out.ttlRemoves = r.state.worldRules.length === 0;

        // --- (6) Budget kappt Effekte/Frame ---
        r.state.worldRules.length = 0;
        const N = K.WORLD_RULES.budgetPerFrame + 3; // mehr eligible als Budget
        for (let i = 0; i < N; i++) {
            // distinct cond (Dedup-frei) + immer true (rng < 1+ε); everySec klein
            r.dslRun(["rule", ["random_chance", 1 + i * 0.0001], ["weather", "rainy"], { everySec: 0.5 }], {
                source: "nexus",
            });
        }
        out.budgetRegistered = r.state.worldRules.length === N;
        const tB = now();
        r._tickWorldRules(tB);
        const firedCount = r.state.worldRules.filter((x) => x.lastFired === tB).length;
        out.budgetCaps = firedCount === K.WORLD_RULES.budgetPerFrame;
        out.firedCount = firedCount;

        // --- (7) Dedup: dieselbe Regel zweimal → ein Eintrag ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"]], { source: "human" });
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"]], { source: "human" });
        out.dedup = r.state.worldRules.length === 1;

        // --- (8) Cap + Eviction (Mensch ueberlebt die Nexus-Flut) ---
        r.state.worldRules.length = 0;
        // eine Mensch-Regel zuerst (aelteste — darf NICHT verdraengt werden)
        r.dslRun(["rule", ["emotion_above", "joy", 0.99], ["weather", "rainy"], { everySec: 99 }], { source: "human" });
        for (let i = 0; i < K.WORLD_RULES.cap + 5; i++) {
            r.dslRun(["rule", ["random_chance", 1 + i * 0.0001], ["weather", "sunny"], { everySec: 99 }], {
                source: "nexus",
            });
        }
        out.capHolds = r.state.worldRules.length <= K.WORLD_RULES.cap;
        out.humanSurvives = r.state.worldRules.some((x) => x.source === "human");

        // --- (9) Re-Entrancy: ein Regel-Effekt, der eine Regel registriert,
        //         feuert die NEUE nicht im selben Tick ---
        r.state.worldRules.length = 0;
        r.state.weather = "sunny";
        r.dslRun(
            ["rule", ["random_chance", 1], ["rule", ["random_chance", 1], ["weather", "rainy"]], { everySec: 0.5 }],
            {
                source: "human",
            }
        );
        const tR = now();
        r._tickWorldRules(tR); // meta feuert → registriert child; child NICHT same-tick
        out.reentrancyNoCascade = r.state.weather === "sunny";
        out.childRegistered = r.state.worldRules.length === 2;
        r.state.worldRules[1].lastFired = -Infinity; // naechster Frame: child darf feuern
        r._tickWorldRules(now() + 1);
        out.childFiresNextFrame = r.state.weather === "rainy";

        // --- (10) deterministische Regel-RNG ---
        const fake = { id: 4242, fires: 0, source: "human" };
        const s0a = r._worldRuleSeed(fake, 0);
        const s0b = r._worldRuleSeed(fake, 0);
        const s1 = r._worldRuleSeed(fake, 1);
        out.seedStable = s0a === s0b;
        out.seedVariesPerFire = s0a !== s1;
        out.rngDeterministic = r.dslCtx({ seed: s0a }).rng() === r.dslCtx({ seed: s0b }).rng();

        // restore world state
        r.state.worldRules = savedRules;
        r.state.weather = savedWeather;
        for (const k of Object.keys(e)) e[k] = savedEmotions[k] || 0;
        return out;
    });

    // Welt-Regeln: WORLD_RULES-Konfig + Registry + Tick verdrahtet (im Loop)
    check(
        "Welt-Regeln: WORLD_RULES-Konfig + Registry + Tick verdrahtet",
        res.cfgWired && res.registryArray && res.tickWired
    );
    // Welt-Regeln: `rule` REGISTRIERT (statt den Effekt SOFORT auszufuehren)
    check(
        "Welt-Regeln: `rule` REGISTRIERT",
        res.regOk && res.registeredOne && res.notFiredOnRegister
    );
    // Welt-Regeln: die Regel FEUERT, wenn die Bedingung wahr wird (sorrow>0.5 → rainy)
    check("Welt-Regeln: die Regel FEUERT, wenn die Bedingung wahr wird", res.firesWhenTrue);
    check("Welt-Regeln: das everySec-Gate verhindert Per-Frame-Feuern", res.everySecGate);
    check("Welt-Regeln: bei falscher Bedingung feuert die Regel nicht", res.skipsWhenFalse);
    check("Welt-Regeln: ttlSec entfernt die abgelaufene Regel", res.ttlRegistered && res.ttlRemoves);
    check(
        "Welt-Regeln: das Frame-Budget kappt die Effekte/Frame",
        res.budgetRegistered && res.budgetCaps,
        `fired=${res.firedCount} budget=4`
    );
    // Welt-Regeln: Dedup — dieselbe Regel zweimal bleibt EIN Eintrag
    check("Welt-Regeln: Dedup", res.dedup);
    // Welt-Regeln: Cap haelt (Runaway-Schutz), Mensch-Regel ueberlebt die Nexus-Flut
    check(
        "Welt-Regeln: Cap haelt, Mensch-Regel ueberlebt die Nexus-Flut",
        res.capHolds && res.humanSurvives
    );
    // Welt-Regeln: Re-Entrancy — eine vom Effekt erzeugte Regel feuert nicht im selben Tick
    check(
        "Welt-Regeln: Re-Entrancy",
        res.reentrancyNoCascade && res.childRegistered && res.childFiresNextFrame
    );
    // Welt-Regeln: deterministische Regel-RNG (stabil pro fireIndex, variiert ueber die Zeit)
    check(
        "Welt-Regeln: deterministische Regel-RNG",
        res.seedStable && res.seedVariesPerFire && res.rngDeterministic
    );
}

// Feld-Kopplung: Regeln LESEN das Feld (field_above/field_below über auraAt, frozen + räumliche
// emotion) und SCHREIBEN es (deposit_life/deposit_emotion → Overlays) — ein Substrat. Kern-Probe:
// die Heilungs-Regel schließt den Loop (field_below lebendig → deposit_life → steigt → Regel
// stoppt); Default at_player; invalide Achse → no-op.
async function checkBandV1734FieldRules(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const now = () => performance.now() / 1000;
        const mkCtx = () => r.dslCtx({ source: "test" });

        // Save world state
        const savedLife = r.state.lifeField ? new Map(r.state.lifeField) : null;
        const savedEmo = r.state.emotionField ? new Map(r.state.emotionField) : null;
        const e = r.state.player.emotions;
        const savedEmotions = Object.assign({}, e);
        const savedRules = r.state.worldRules.slice();

        // clean slates
        if (r.state.lifeField) r.state.lifeField.clear();
        if (r.state.emotionField) r.state.emotionField.clear();
        for (const k of Object.keys(e)) e[k] = 0;
        r.state.worldRules.length = 0;

        // Scanne einen KARGEN Ort (niedrigste frozen lebendig) — so ist die
        // Heilungs-Regel robust (sie kann nur an einem Ort < Schwelle feuern).
        // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
        let A = { x: 40000, z: -30000 };
        let lebMin = Infinity;
        for (let i = 0; i < 16; i++) {
            const x = 40000 + i * 2000;
            const z = -30000 - i * 1700;
            const leb = r.auraAt(x, z).lebendig;
            if (leb < lebMin) {
                lebMin = leb;
                A = { x, z };
            }
        }
        // BÜHNE: Ferne ohne Welt — dort steht kein Gelände, nur der Abstand zählt
        const B = { x: -99999, z: 88888 };
        const posA = ["at", A.x, 0, A.z];
        const posB = ["at", B.x, 0, B.z];

        // --- (2) field_above/below liest die frozen lebendig-Achse ---
        const lebA = r.auraAt(A.x, A.z).lebendig;
        out.fieldRead =
            r.dslEvalCond(["field_above", "lebendig", lebA - 0.01, posA], mkCtx()) === true &&
            r.dslEvalCond(["field_above", "lebendig", lebA + 0.5, posA], mkCtx()) === false &&
            r.dslEvalCond(["field_below", "lebendig", lebA + 0.01, posA], mkCtx()) === true;

        // --- (4) deposit_life SCHREIBT → auraAt liest es zurueck ---
        const leb0 = r.auraAt(A.x, A.z).lebendig;
        r.dslEval(["deposit_life", posA], mkCtx());
        out.depositLifeReadBack = r.auraAt(A.x, A.z).lebendig > leb0;

        // --- (5) deposit_emotion SCHREIBT → field_above(emotion) liest es zurueck, RAEUMLICH ---
        r.state.emotionField.clear();
        r.dslEval(["deposit_emotion", "sorrow", 1.0, posB], mkCtx());
        out.depositEmotionReadBack = r.dslEvalCond(["field_above", "sorrow", 0.05, posB], mkCtx()) === true;
        out.depositEmotionSpatial = r.dslEvalCond(["field_above", "sorrow", 0.05, posA], mkCtx()) === false;
        out.emoSorrowB = r.auraAt(B.x, B.z).emotion.sorrow;

        // --- (6) Default-Position einer Feld-Op = at_player (nicht der Ursprung) ---
        r.state.lifeField.clear();
        const pm = r.state.playerMesh.position;
        const lebPlayer0 = r.auraAt(pm.x, pm.z).lebendig;
        r.dslEval(["deposit_life"], mkCtx()); // KEIN posNode → at_player
        out.defaultAtPlayer = r.auraAt(pm.x, pm.z).lebendig > lebPlayer0;

        // --- (7) DIE HEILUNGS-REGEL: der Feld-Loop schliesst sich ---
        r.state.lifeField.clear();
        r.state.worldRules.length = 0;
        const lebSeed = r.auraAt(A.x, A.z).lebendig; // frozen (overlay geleert)
        const T = Math.min(lebSeed + 0.3, 0.95); // erreichbar (overlay max 0.7), > lebSeed → field_below initial true
        r.dslRun(["rule", ["field_below", "lebendig", T, posA], ["deposit_life", posA], { everySec: 0.5 }], {
            source: "human",
        });
        const ruleObj = r.state.worldRules[0];
        let rose = false;
        let stopped = false;
        let prevLeb = lebSeed;
        for (let i = 0; i < 6; i++) {
            ruleObj.lastFired = -Infinity; // Gate oeffnen → nur die Bedingung entscheidet
            r._tickWorldRules(now());
            const lebNow = r.auraAt(A.x, A.z).lebendig;
            if (lebNow > prevLeb + 1e-6) rose = true;
            if (lebNow >= T) {
                ruleObj.lastFired = -Infinity; // ein weiterer Tick darf NICHT mehr heben (Bedingung jetzt false)
                r._tickWorldRules(now());
                stopped = Math.abs(r.auraAt(A.x, A.z).lebendig - lebNow) < 1e-3;
                break;
            }
            prevLeb = lebNow;
        }
        out.healRose = rose;
        out.healStopped = stopped;
        out.healT = T;
        out.healSeed = lebSeed;

        // --- (8) invalide emotion-Achse → no-op, kein throw ---
        r.state.emotionField.clear();
        let threw = false;
        try {
            r.dslEval(["deposit_emotion", "bogus", 1.0, posA], mkCtx());
        } catch {
            threw = true;
        }
        out.invalidAxisNoop = !threw && r.state.emotionField.size === 0;

        // restore
        r.state.worldRules = savedRules;
        if (r.state.lifeField) {
            r.state.lifeField.clear();
            if (savedLife) for (const [k, v] of savedLife) r.state.lifeField.set(k, v);
        }
        if (r.state.emotionField) {
            r.state.emotionField.clear();
            if (savedEmo) for (const [k, v] of savedEmo) r.state.emotionField.set(k, v);
        }
        for (const k of Object.keys(e)) e[k] = savedEmotions[k] || 0;
        return out;
    });

    check("Feld-Regeln: field_above/below LIEST die frozen lebendig-Achse korrekt", res.fieldRead);
    // Feld-Regeln: deposit_life SCHREIBT → auraAt liest es zurueck (write→read im Feld)
    check(
        "Feld-Regeln: deposit_life SCHREIBT → auraAt liest es zurueck",
        res.depositLifeReadBack
    );
    // Feld-Regeln: deposit_emotion → field_above(emotion) liest es zurueck, RAEUMLICH (A != B)
    check(
        "Feld-Regeln: deposit_emotion → field_above liest es zurueck, RAEUMLICH",
        res.depositEmotionReadBack && res.depositEmotionSpatial,
        `sorrowB=${res.emoSorrowB}`
    );
    // Feld-Regeln: Default-Position einer Feld-Op ist at_player (nicht der Ursprung)
    check("Feld-Regeln: Default-Position einer Feld-Op ist at_player", res.defaultAtPlayer);
    // Feld-Regeln: die HEILUNGS-Regel schliesst den Loop (field_below lebendig → deposit_life → steigt → stoppt)
    check(
        "Feld-Regeln: die HEILUNGS-Regel schliesst den Loop",
        res.healRose && res.healStopped,
        `T=${res.healT} seed=${res.healSeed}`
    );
    // Feld-Regeln: invalide emotion-Achse → no-op (kein throw, kein Feld-Schreiben)
    check("Feld-Regeln: invalide emotion-Achse → no-op", res.invalidAxisNoop);
}

// Der Nexus EVOLVIERT Regeln: _composeNexusRule komponiert aus Feld-Bedingungen + -Effekten
// (resonant, ephemer per ttlSec), bewertet über ein Lebens-Fenster (Fitness = Engagement + Kosten +
// Erfolg, attributierbar): bewährt → ERNEUERN, inert/erroring → VERFALLEN, Neue erben von
// Überlebenden. generateEvolution mischt Regel + Geste; dslMutate hält die Regel-Form.
async function checkBandV1735NexusEvolvesRules(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const K = r.constructor;
        const out = {};
        const now = () => performance.now() / 1000;
        const cfg = K.WORLD_RULES;
        const rng = r.dslCtx({ seed: 777 }).rng; // deterministischer LCG fuer die Komposition

        // --- (A) dslComposeRule: gueltige Regel-Struktur ---
        const prog = r.dslComposeRule(rng);
        out.composeStruct =
            Array.isArray(prog) &&
            prog[0] === "rule" &&
            Array.isArray(prog[1]) &&
            Array.isArray(prog[2]) &&
            prog[3] &&
            prog[3].everySec >= cfg.ruleEverySecMin &&
            prog[3].everySec <= cfg.ruleEverySecMax &&
            prog[3].ttlSec >= cfg.ruleTtlMin &&
            prog[3].ttlSec <= cfg.ruleTtlMax;

        // --- (B) der Nexus SCHREIBT das Feld: deposit_life + deposit_emotion erscheinen ---
        const effHeads = new Set();
        const condHeads = new Set();
        for (let i = 0; i < 80; i++) {
            effHeads.add(r.dslComposeRuleEffect(rng, null)[0]);
            condHeads.add(r.dslComposeRuleCondition(rng, null)[0]);
        }
        out.effWritesField = effHeads.has("deposit_life") && effHeads.has("deposit_emotion");
        // --- (C) der Nexus LIEST das Feld: field_below/field_above erscheinen ---
        out.condReadsField = condHeads.has("field_below") || condHeads.has("field_above");

        // --- (D) generateEvolution: Misch aus Regeln + Gesten ---
        const savedNextId = r.state.dsl.nextEntryId;
        let ruleCount = 0;
        const N = 80;
        for (let i = 0; i < N; i++) {
            const evo = r.generateEvolution();
            if (Array.isArray(evo.program) && evo.program[0] === "rule") ruleCount++;
        }
        out.evoMix = ruleCount > 2 && ruleCount < N - 2; // Misch (prob ~0.35 → ~28)
        out.ruleCount = ruleCount;
        r.state.dsl.nextEntryId = savedNextId; // den Zaehler zuruecksetzen (kein Seiteneffekt)

        // ===== Fitness/Lifecycle: kontrollierte Regeln auf sauberem Registry =====
        const savedRules = r.state.worldRules.slice();
        const savedEmo = r.state.emotionField ? new Map(r.state.emotionField) : null;
        const e = r.state.player.emotions;
        const savedEmotions = Object.assign({}, e);

        // --- (E) Fitness: eine billige, feuernde Regel → hohe Fitness ---
        r.state.worldRules.length = 0;
        r.dslRun(
            [
                "rule",
                ["random_chance", 1],
                ["deposit_emotion", "joy", 0.1, ["at_player"]],
                { everySec: 0.5, ttlSec: 1000 },
            ],
            {
                source: "nexus",
            }
        );
        const ruleE = r.state.worldRules[0];
        for (let i = 0; i < 3; i++) {
            ruleE.lastFired = -Infinity;
            r._tickWorldRules(now());
        }
        ruleE.value = 0.4; // bewährt: ihr δ trägt ihre Kosten (die Wertung selbst prüft V1743)
        out.fitnessFires = (ruleE.fires || 0) >= 1;
        out.fitnessHigh = r._worldRuleFitness(ruleE) >= cfg.renewFitness;
        out.fitnessVal = r._worldRuleFitness(ruleE);

        // --- (F) Erneuerung: gut bewaehrte Regel ueberlebt das ttl-Ende ---
        const idE = ruleE.id;
        ruleE.born = now() - ruleE.ttlSec - 1; // ttl ueberschritten
        r._tickWorldRules(now());
        const stillThere = r.state.worldRules.find((x) => x.id === idE);
        out.renewSurvives = !!stillThere && now() - stillThere.born < 5 && (stillThere.fires || 0) === 0; // erneuert: born frisch, Akkus zurueck

        // --- (G) Verfall: eine inerte (nie feuernde) Regel verfaellt ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 0], ["deposit_life", ["at_player"]], { everySec: 0.5, ttlSec: 1000 }], {
            source: "nexus",
        });
        const ruleG = r.state.worldRules[0];
        const idG = ruleG.id;
        ruleG.born = now() - ruleG.ttlSec - 1;
        r._tickWorldRules(now());
        out.inertExpires = !r.state.worldRules.find((x) => x.id === idG);

        // --- (H) Verfall: eine fehlerhafte Regel (100% errors) verfaellt ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 0], ["weather", "sunny"], { everySec: 0.5, ttlSec: 1000 }], {
            source: "nexus",
        });
        const ruleH = r.state.worldRules[0];
        const idH = ruleH.id;
        ruleH.fires = 5;
        ruleH.errors = 5;
        ruleH.costMsSum = 2;
        ruleH.born = now() - ruleH.ttlSec - 1;
        out.erroringFitness = r._worldRuleFitness(ruleH); // ~0.36 < renewFitness
        r._tickWorldRules(now());
        out.erroringExpires = !r.state.worldRules.find((x) => x.id === idH);

        // --- (I) dslMutate haelt die Regel-Form (kein throw) ---
        let mutOk = true;
        try {
            for (let i = 0; i < 8; i++) {
                const m = r.dslMutate(
                    ["rule", ["random_chance", 0.5], ["weather", "sunny"], { everySec: 2, ttlSec: 60 }],
                    rng
                );
                if (!Array.isArray(m) || m[0] !== "rule") mutOk = false;
            }
        } catch {
            mutOk = false;
        }
        out.mutateKeepsRule = mutOk;

        // --- (J) _composeNexusRule liefert immer eine gueltige Regel ---
        let composeOk = true;
        for (let i = 0; i < 5; i++) {
            const p = r._composeNexusRule(rng);
            if (!Array.isArray(p) || p[0] !== "rule") composeOk = false;
        }
        out.composeNexusRule = composeOk;

        // restore
        r.state.worldRules = savedRules;
        if (r.state.emotionField) {
            r.state.emotionField.clear();
            if (savedEmo) for (const [k, v] of savedEmo) r.state.emotionField.set(k, v);
        }
        for (const k of Object.keys(e)) e[k] = savedEmotions[k] || 0;
        return out;
    });

    // Nexus-Regeln: dslComposeRule liefert eine gueltige Regel (cond+effect+everySec+ttl in Spanne)
    check(
        "Nexus-Regeln: dslComposeRule liefert eine gueltige Regel",
        res.composeStruct
    );
    // Nexus-Regeln: der Nexus SCHREIBT das Feld (deposit_life + deposit_emotion komponiert)
    check(
        "Nexus-Regeln: der Nexus SCHREIBT das Feld",
        res.effWritesField
    );
    // Nexus-Regeln: der Nexus LIEST das Feld (field_below/field_above komponiert)
    check("Nexus-Regeln: der Nexus LIEST das Feld", res.condReadsField);
    // Nexus-Regeln: generateEvolution mischt Regeln + Gesten (der composeRuleProb-Hook)
    check(
        "Nexus-Regeln: generateEvolution mischt Regeln + Gesten",
        res.evoMix,
        `rules=${res.ruleCount}/80`
    );
    // Nexus-Regeln: per-Regel-Fitness — eine billige, feuernde Regel ist hoch-fit
    check(
        "Nexus-Regeln: per-Regel-Fitness",
        res.fitnessFires && res.fitnessHigh,
        `fit=${res.fitnessVal}`
    );
    // Nexus-Regeln: Erneuerung — eine bewaehrte Regel ueberlebt das ttl-Ende (Selektion+)
    check(
        "Nexus-Regeln: Erneuerung",
        res.renewSurvives
    );
    // Nexus-Regeln: Verfall — eine inerte (nie feuernde) Regel verfaellt am ttl-Ende
    check("Nexus-Regeln: Verfall", res.inertExpires);
    // Nexus-Regeln: Verfall — eine fehlerhafte Regel (100% errors) verfaellt
    check(
        "Nexus-Regeln: Verfall",
        res.erroringExpires,
        `fit=${res.erroringFitness}`
    );
    // Nexus-Regeln: dslMutate haelt die Regel-Form (Nachkomme bleibt eine Regel, kein throw)
    check(
        "Nexus-Regeln: dslMutate haelt die Regel-Form",
        res.mutateKeepsRule
    );
    // Nexus-Regeln: _composeNexusRule liefert immer eine gueltige Regel (frisch oder Nachkomme)
    check(
        "Nexus-Regeln: _composeNexusRule liefert immer eine gueltige Regel",
        res.composeNexusRule
    );
}

// Mensch-Regeln per Chat „wann immer X, dann Y“: Y über die bestehenden Chat-Patterns, X über
// _parseChatCondition (Feld + Stimmung). Whitelist-Wand: eine Mensch-Regel fasst den frozen
// Worldgen NICHT an. „zeige regeln“ listet, „vergiss regeln“ widerruft, unsichere Effekte → abgelehnt.
async function checkBandV1736HumanRules(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const now = () => performance.now() / 1000;
        const mkSink = () => {
            const msgs = [];
            return { input: { value: "x" }, append: (s) => msgs.push(String(s)), msgs };
        };

        // --- (2) _parseChatCondition: Sprache → DSL-Bedingung ---
        const cRain = r._parseChatCondition("es regnet");
        const cSad = r._parseChatCondition("du bist traurig");
        const cKarg = r._parseChatCondition("wenig Leben hier");
        out.condParse =
            JSON.stringify(cRain) === JSON.stringify(["weather_is", "rainy"]) &&
            Array.isArray(cSad) &&
            cSad[0] === "emotion_above" &&
            cSad[1] === "sorrow" &&
            Array.isArray(cKarg) &&
            cKarg[0] === "field_below" &&
            cKarg[1] === "lebendig" &&
            r._parseChatCondition("völliger unsinn xyz") === null;

        // --- (3) _parseChatEffect: reuse der Chat-Patterns ---
        const eW = r._parseChatEffect("setze wetter sunny");
        const eK = r._parseChatEffect("spawne kreaturen 3");
        out.effParse =
            JSON.stringify(eW) === JSON.stringify(["weather", "sunny"]) &&
            Array.isArray(eK) &&
            r._parseChatEffect("völliger unsinn xyz") === null;

        // --- (4) _isRuleEffectAllowed: Whitelist-Wand ---
        out.whitelist =
            r._isRuleEffectAllowed(["weather", "sunny"]) === true &&
            r._isRuleEffectAllowed(["deposit_life", ["at_player"]]) === true &&
            r._isRuleEffectAllowed(["spawn_creature", ["at_player"], 1, "happy"]) === true &&
            r._isRuleEffectAllowed(["terrain_steepness", 2]) === false &&
            r._isRuleEffectAllowed(["voxel_carve", 0, 0, 0, 3]) === false &&
            r._isRuleEffectAllowed(["spawn_village", ["at_player"]]) === false;

        // Save world state
        const savedRules = r.state.worldRules.slice();
        const savedWeather = r.state.weather;
        const e = r.state.player.emotions;
        const savedEmotions = Object.assign({}, e);

        // --- (5) End-to-end: „wann immer X, dann Y" erstellt eine Mensch-Regel ---
        r.state.worldRules.length = 0;
        const s1 = mkSink();
        const handled = r._chatTryRuleCommand("wann immer es regnet, dann setze wetter sunny", s1.input, s1.append);
        const rule = r.state.worldRules.find((x) => x.source === "human" && x.cond && x.cond[0] === "weather_is");
        out.ruleCreated =
            handled === true &&
            !!rule &&
            JSON.stringify(rule.effect) === JSON.stringify(["weather", "sunny"]) &&
            s1.msgs.some((m) => /Gesetz aufgestellt/.test(m));

        // --- (6) die Mensch-Regel FEUERT (über den Welt-Tick) ---
        r.state.weather = "rainy";
        if (rule) rule.lastFired = -Infinity;
        r._tickWorldRules(now());
        out.ruleFires = r.state.weather === "sunny";

        // --- (7) describeProgram(rule) menschen-lesbar ---
        const desc = r.describeProgram(["rule", ["weather_is", "rainy"], ["weather", "sunny"], { everySec: 3 }]);
        out.describeReadable = /wann immer/i.test(desc) && /Wetter/i.test(desc);
        out.descSample = desc;

        // --- (8) „zeige regeln" listet die Gesetze ---
        const s2 = mkSink();
        const listed = r._chatTryRulesListCommand("zeige regeln", s2.input, s2.append);
        out.rulesListed = listed === true && s2.msgs.some((m) => /wann immer/i.test(m) && /von du/.test(m));

        // --- (10) unsicherer Effekt (frozen Worldgen) wird abgelehnt — KEINE Regel ---
        const beforeUnsafe = r.state.worldRules.length;
        const s3 = mkSink();
        const h3 = r._chatTryRuleCommand("wann immer es regnet, dann setze terrain steilheit 2", s3.input, s3.append);
        out.unsafeRejected =
            h3 === true &&
            r.state.worldRules.length === beforeUnsafe &&
            s3.msgs.some((m) => /keine stehende Welt-Regel/.test(m));

        // --- (11) unbekannte Bedingung → sanftes Feedback, keine Regel ---
        const s4 = mkSink();
        const h4 = r._chatTryRuleCommand("wann immer blubb xyz, dann setze wetter sunny", s4.input, s4.append);
        out.unknownCond = h4 === true && s4.msgs.some((m) => /verstehe die Bedingung/.test(m));

        // --- (9) „vergiss regeln" widerruft die Mensch-Gesetze ---
        const s5 = mkSink();
        const forgot = r._chatTryRulesListCommand("vergiss regeln", s5.input, s5.append);
        out.rulesForgotten = forgot === true && !r.state.worldRules.some((x) => x.source === "human");

        // restore
        r.state.worldRules = savedRules;
        r.state.weather = savedWeather;
        for (const k of Object.keys(e)) e[k] = savedEmotions[k] || 0;
        return out;
    });

    // Mensch-Regeln: _parseChatCondition übersetzt Sprache → DSL-Bedingung (Wetter/Stimmung/Feld)
    check(
        "Mensch-Regeln: _parseChatCondition übersetzt Sprache → DSL-Bedingung",
        res.condParse
    );
    // Mensch-Regeln: _parseChatEffect reuse der bestehenden Chat-Patterns (jeder Effekt wird Regel-fähig)
    check(
        "Mensch-Regeln: _parseChatEffect reuse der bestehenden Chat-Patterns",
        res.effParse
    );
    // Mensch-Regeln: Whitelist-Wand — reaktive Effekte erlaubt, frozen Worldgen abgelehnt
    check("Mensch-Regeln: Whitelist-Wand", res.whitelist);
    // V17.36 Mensch-Regeln: „wann immer X, dann Y" erstellt eine Mensch-Regel (source=human, permanent)
    check(
        "V17.36 Mensch-Regeln: „wann immer X, dann Y\" erstellt eine Mensch-Regel",
        res.ruleCreated
    );
    // Mensch-Regeln: die Mensch-Regel FEUERT über den Welt-Tick (rainy → sunny)
    check("Mensch-Regeln: die Mensch-Regel FEUERT über den Welt-Tick", res.ruleFires);
    // Mensch-Regeln: describeProgram(rule) ist menschen-lesbar
    check("Mensch-Regeln: describeProgram ist menschen-lesbar", res.describeReadable, res.descSample);
    // V17.36 Mensch-Regeln: „zeige regeln" listet die aktiven Gesetze (von wem)
    check("V17.36 Mensch-Regeln: „zeige regeln\" listet die aktiven Gesetze", res.rulesListed);
    // Mensch-Regeln: ein unsicherer Effekt (frozen Worldgen) wird abgelehnt — KEINE Regel
    check(
        "Mensch-Regeln: ein unsicherer Effekt wird abgelehnt",
        res.unsafeRejected
    );
    check("Mensch-Regeln: eine unbekannte Bedingung → sanftes Feedback, keine Regel", res.unknownCond);
    check('V17.36 Mensch-Regeln: „vergiss regeln" widerruft die Mensch-Gesetze', res.rulesForgotten);
}

// Gesetze-Sektion in der BESTEHENDEN Fähigkeiten-UI (kein Parallel-Panel): state.worldRules im selben
// Drawer via describeProgram; eine Regel STEHT (kein ▶) → ✕ (vergiss, nur Mensch-Regeln) +
// aktiv/ruht-Indikator; beide Sektionen einklappbar.
async function checkBandV1737RulesUI(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const host = document.getElementById("status-worldrules");

        // Save state
        const savedRules = r.state.worldRules.slice();
        const forceRender = () => {
            r._statusRefs.worldrulesSignature = ""; // Signature-Diff zuruecksetzen → echtes Re-Render
            r.renderWorldRulesList();
        };

        // --- Empty-State ---
        r.state.worldRules.length = 0;
        forceRender();
        out.emptyState = /Noch keine Gesetze/.test(host.textContent);

        // --- Mensch-Regel: Row mit describeProgram + ✕ ---
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], { everySec: 3 }], { source: "human" });
        const humanRule = r.state.worldRules.find((x) => x.source === "human");
        forceRender();
        const humanBtn = host.querySelector("button[data-forget-rule]");
        out.humanRow =
            !!host.querySelector(".ability-row.source-human") &&
            /wann immer/i.test(host.textContent) &&
            !!humanBtn &&
            humanBtn.getAttribute("data-forget-rule") === String(humanRule.id);

        // --- Nexus-Regel: gelistet + V18.53 DIREKT steuerbar (📌 + ⏸ + ✕), kein ▶ (sie STEHT, wird nicht invoked) ---
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 3, ttlSec: 60 }], {
            source: "nexus",
        });
        forceRender();
        const nexusRow = host.querySelector(".ability-row.source-nexus");
        out.nexusRow =
            !!nexusRow &&
            !!nexusRow.querySelector("button[data-pin-rule]") &&
            !!nexusRow.querySelector("button[data-toggle-rule]") &&
            !!nexusRow.querySelector("button[data-forget-rule]") &&
            !nexusRow.querySelector("button[data-run-ability]");

        // --- der ✕-Klick vergisst die Mensch-Regel (echte Event-Delegation) ---
        const idBefore = humanRule.id;
        const btn = host.querySelector(`button[data-forget-rule="${idBefore}"]`);
        if (btn) btn.click();
        out.forgetWorks = !r.state.worldRules.some((x) => x.id === idBefore);
        // die Nexus-Regel bleibt (wir haben nur die Mensch-Regel ✕ geklickt)
        out.nexusSurvives = r.state.worldRules.some((x) => x.source === "nexus");

        // --- Collapsible: die Hof-Sektionen (UI-Putz: Fähigkeiten + Gesetze leben jetzt
        // im Hof mit den Kreaturen + den Befehlen) sind als collapsible-header verdrahtet ---
        const secs = document.querySelectorAll('.drawer[data-drawer="kreaturen"] section.section');
        out.collapsibleHeaders =
            secs.length >= 2 && Array.from(secs).every((s) => s.querySelector("h3.collapsible-header"));

        // Hof-Partitur — ZWEI Gruppen (Deine Gesetze | Der Nexus erprobt), Nexus nach gelerntem
        // WERT sortiert + auf Top-5 gekappt, mit Wert-Chip (der value-Vektor wird endlich gelesen).
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"]], { source: "human" });
        // Distinkte Bedingung je Regel → distinkte Dedup-Signatur (sonst kollabieren identische zu EINER).
        for (let i = 0; i < 8; i++)
            r.dslRun(["rule", ["random_chance", 0.1 + i * 0.05], ["weather", "rainy"], { ttlSec: 60 }], {
                source: "nexus",
            });
        const nx = r.state.worldRules.filter((x) => x.source === "nexus");
        nx.forEach((x, i) => {
            x.value = i * 0.1;
        }); // der letzte (0.70) ist der wertvollste
        r.state.hofNexusExpanded = false;
        forceRender();
        const heads = host.querySelectorAll(".worldrule-group-head");
        out.twoGroups =
            heads.length === 2 &&
            /Deine Gesetze/.test(heads[0].textContent) &&
            /Nexus erprobt/.test(heads[1].textContent);
        const nexusRows = host.querySelectorAll(".ability-row.source-nexus");
        out.nexusCappedTopN = nexusRows.length === 5 && nx.length === 8;
        out.nexusHasMoreLine = /\+\s*3\s*weitere/.test(host.textContent);
        const firstNexusChip = nexusRows[0] && nexusRows[0].querySelector(".rule-value-chip");
        out.nexusValueChipSorted = !!firstNexusChip && /\+0\.70/.test(firstNexusChip.textContent);
        r.state.hofNexusExpanded = true;
        forceRender();
        out.expandShowsAll = host.querySelectorAll(".ability-row.source-nexus").length === 8;
        r.state.hofNexusExpanded = false;

        // restore
        r.state.worldRules = savedRules;
        r._statusRefs.worldrulesSignature = "";
        return out;
    });

    // Hof-Partitur: zwei Gruppen (Deine Gesetze | Der Nexus erprobt)
    check("Hof-Partitur: zwei Gruppen", res.twoGroups);
    check(
        "Hof-Partitur: die Nexus-Experimente auf Top-5 gekappt + '+N weitere'-Zeile",
        res.nexusCappedTopN && res.nexusHasMoreLine
    );
    // Hof-Partitur: Nexus nach gelerntem Wert sortiert + Wert-Chip (V17.31 Konsum)
    check(
        "Hof-Partitur: Nexus nach gelerntem Wert sortiert + Wert-Chip",
        res.nexusValueChipSorted
    );
    check("Hof-Partitur: 'alle'-Toggle zeigt alle Nexus-Experimente", res.expandShowsAll);
    check("Gesetze-UI: Empty-State zeigt den Hinweis", res.emptyState);
    // Gesetze-UI: eine Mensch-Regel rendert als Row (describeProgram) mit ✕ (data-forget-rule)
    check(
        "Gesetze-UI: eine Mensch-Regel rendert als Row mit ✕",
        res.humanRow
    );
    // Gesetze-UI: eine Nexus-Regel ist gelistet + DIREKT steuerbar (📌+⏸+✕, kein ▶)
    check("Gesetze-UI: eine Nexus-Regel ist gelistet + DIREKT steuerbar", res.nexusRow);
    // Gesetze-UI: der ✕-Klick vergisst die Mensch-Regel (Event-Delegation), Nexus bleibt
    check(
        "Gesetze-UI: der ✕-Klick vergisst die Mensch-Regel, Nexus bleibt",
        res.forgetWorks && res.nexusSurvives
    );
    // Gesetze-UI: beide Sektionen (Faehigkeiten + Gesetze) sind einklappbar (collapsible-header)
    check(
        "Gesetze-UI: beide Sektionen sind einklappbar",
        res.collapsibleHeaders
    );
}

// Gesetze-UX: Persistenz-Label (permanent vs ~Ns), eigene Gesetze pausieren (Tick skippt)/löschen,
// Nexus-Regel per 📌 adoptieren (permanent + eviction-geschützt). Modus-Gating: eine FREMDE
// Nexus-Regel verwerfen ist Schöpfer-Geste; Favoriten oben.
async function checkBandV1739RulesUX(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const now = () => performance.now() / 1000;
        const host = document.getElementById("status-worldrules");
        const forceRender = () => {
            r._statusRefs.worldrulesSignature = "";
            r.renderWorldRulesList();
        };

        // Save state
        const savedRules = r.state.worldRules.slice();
        const savedWeather = r.state.weather;
        const savedMode = r.state.worldMeta.gameMode;

        // --- (A) Persistenz-Label: permanent / verfaellt / pausiert ---
        const human = { ttlSec: null, born: now(), fires: 0 };
        const nexus = { ttlSec: 60, born: now(), fires: 0 };
        const paused = { ttlSec: null, born: now(), fires: 0, disabled: true };
        out.labels =
            r._worldRuleStatusLabel(human, now()) === "permanent" &&
            /verf[äa]llt in ~\d+s/.test(r._worldRuleStatusLabel(nexus, now())) &&
            r._worldRuleStatusLabel(paused, now()) === "pausiert";

        // --- (B) Pause: ein pausiertes Gesetz feuert NICHT (Tick skippt) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 0.5 }], { source: "human" });
        const ruleB = r.state.worldRules[0];
        ruleB.disabled = true;
        r.state.weather = "sunny";
        ruleB.lastFired = -Infinity;
        r._tickWorldRules(now());
        const pausedDidNotFire = r.state.weather === "sunny";
        ruleB.disabled = false; // wieder aktiv → feuert
        ruleB.lastFired = -Infinity;
        r._tickWorldRules(now());
        out.pauseWorks = pausedDidNotFire && r.state.weather === "rainy";

        // --- (C) 📌-Klick adoptiert eine Nexus-Regel (pinned + ttlSec=null → permanent) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "sunny"], { everySec: 3, ttlSec: 60 }], {
            source: "nexus",
        });
        const ruleC = r.state.worldRules[0];
        forceRender();
        const pinBtn = host.querySelector(`button[data-pin-rule="${ruleC.id}"]`);
        if (pinBtn) pinBtn.click();
        out.pinAdopts = !!pinBtn && ruleC.pinned === true && ruleC.ttlSec == null;
        out.pinPermLabel = r._worldRuleStatusLabel(ruleC, now()) === "permanent";

        // --- (D) Eviction schuetzt eine angepinnte Regel ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1.5], ["weather", "sunny"], { everySec: 3, ttlSec: 60 }], {
            source: "nexus",
        });
        const keep = r.state.worldRules[0];
        keep.pinned = true;
        const keepId = keep.id;
        // das Registry mit ephemeren Nexus-Regeln ueber das Cap hinaus fluten
        for (let i = 0; i < r.constructor.WORLD_RULES.cap + 5; i++) {
            r.dslRun(["rule", ["random_chance", 1 + i * 0.0001], ["weather", "rainy"], { everySec: 3, ttlSec: 60 }], {
                source: "nexus",
            });
        }
        out.pinnedSurvivesEviction =
            r.state.worldRules.length <= r.constructor.WORLD_RULES.cap &&
            r.state.worldRules.some((x) => x.id === keepId);

        // --- (E) ein ephemeres Nexus-Experiment ist DIREKT steuerbar — ⏸ + ✕ in JEDEM Modus
        //         (kein pin-zuerst-Trap). Geheilter Schöpfer-Befund „muss zuerst pinnen, um zu stoppen". ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "sunny"], { everySec: 3, ttlSec: 60 }], {
            source: "nexus",
        });
        const ruleE = r.state.worldRules[0];
        r.state.worldMeta.gameMode = "frieden";
        forceRender();
        out.ephemeralControllable =
            !!host.querySelector(`button[data-toggle-rule="${ruleE.id}"]`) &&
            !!host.querySelector(`button[data-forget-rule="${ruleE.id}"]`);
        // der ✕-Klick verwirft das Experiment WIRKLICH — auch in frieden (kein Modus-Gate mehr).
        const xBtnE = host.querySelector(`button[data-forget-rule="${ruleE.id}"]`);
        if (xBtnE) xBtnE.click();
        out.ephemeralForgetWorks = !r.state.worldRules.some((x) => x.id === ruleE.id);
        r.state.worldMeta.gameMode = savedMode;

        // --- (F) Sortierung: angepinnte (Favoriten) zuerst ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 3 }], { source: "human" }); // id kleiner
        r.dslRun(["rule", ["random_chance", 1], ["weather", "sunny"], { everySec: 3 }], { source: "human" }); // id groesser
        r.state.worldRules[1].pinned = true; // die spaetere anpinnen
        const pinnedId = r.state.worldRules[1].id;
        forceRender();
        const firstRow = host.querySelector(".ability-row");
        const firstStar =
            firstRow && firstRow.querySelector(".source") && /★/.test(firstRow.querySelector(".source").textContent);
        out.sortPinnedFirst = !!firstStar; // die angepinnte (★) Regel rendert zuerst
        void pinnedId;

        // --- (G) Persistenz: pinned/disabled ueberleben Snapshot → Restore ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], { everySec: 3 }], { source: "human" });
        r.state.worldRules[0].pinned = true;
        r.state.worldRules[0].disabled = true;
        const snap = r.buildStateSnapshot();
        const snapHasFlags = snap.worldRules[0].pinned === true && snap.worldRules[0].disabled === true;
        r.state.worldRules.length = 0;
        r._loadStateRestoreWorldRules(snap);
        out.persistFlags =
            snapHasFlags && r.state.worldRules[0].pinned === true && r.state.worldRules[0].disabled === true;

        // restore
        r.state.worldRules = savedRules;
        r.state.weather = savedWeather;
        r.state.worldMeta.gameMode = savedMode;
        r._statusRefs.worldrulesSignature = "";
        return out;
    });

    // Gesetze-UX: Persistenz-Label — permanent / verfaellt in ~Ns / pausiert
    check("Gesetze-UX: Persistenz-Label", res.labels);
    check("Gesetze-UX: ein PAUSIERTES Gesetz feuert nicht; reaktiviert feuert es wieder", res.pauseWorks);
    // Gesetze-UX: der 📌-Klick ADOPTIERT eine Nexus-Regel (pinned + permanent)
    check(
        "Gesetze-UX: der 📌-Klick ADOPTIERT eine Nexus-Regel",
        res.pinAdopts && res.pinPermLabel
    );
    // Gesetze-UX: die Eviction schuetzt eine angepinnte Regel (ueberlebt die Nexus-Flut)
    check(
        "Gesetze-UX: die Eviction schuetzt eine angepinnte Regel",
        res.pinnedSurvivesEviction
    );
    // Gesetze-UX: ephemeres Nexus-Experiment direkt steuerbar (⏸+✕ in JEDEM Modus, kein pin-zuerst)
    check(
        "Gesetze-UX: ephemeres Nexus-Experiment direkt steuerbar",
        res.ephemeralControllable
    );
    // Gesetze-UX: der ✕-Klick verwirft das Experiment wirklich (auch in frieden)
    check(
        "Gesetze-UX: der ✕-Klick verwirft das Experiment wirklich",
        res.ephemeralForgetWorks
    );
    // Gesetze-UX: Sortierung — angepinnte Favoriten rendern zuerst
    check("Gesetze-UX: Sortierung", res.sortPinnedFirst);
    // Gesetze-UX: pinned/disabled ueberleben Snapshot → Restore (die Schoepfer-Wahl bleibt)
    check(
        "Gesetze-UX: pinned/disabled ueberleben Snapshot → Restore",
        res.persistFlags
    );
}

// Mensch · Nexus · LLM schreiben am SELBEN Regel-Satz: das LLM kennt die Regel-Grammatik (Prompt);
// die Effekt-Whitelist lebt am EINEN Chokepoint _registerWorldRule → auch LLM-Regeln berühren nur
// die reaktive Welt. LLM-Regeln sind EPHEMER (fitness-getestet, adoptierbar).
async function checkBandV1740LlmRules(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const now = () => performance.now() / 1000;

        const savedRules = r.state.worldRules.slice();
        const savedWeather = r.state.weather;

        // --- (1) die UNIVERSELLE Whitelist (in _registerWorldRule): eine LLM-Regel
        //         mit frozen-Worldgen-Effekt wird abgelehnt, ein reaktiver passiert ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["random_chance", 1], ["terrain_steepness", 2]], { source: "llm:grok" });
        out.unsafeRejected = !r.state.worldRules.some((x) => x.source === "llm:grok");
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "llm:grok" });
        const llmRule = r.state.worldRules.find((x) => x.source === "llm:grok");
        out.safeRegistered = !!llmRule;

        // --- (2) eine LLM-Regel ist EPHEMER per Default (fitness-getestet, adoptierbar) ---
        out.llmEphemeral = !!llmRule && typeof llmRule.ttlSec === "number" && llmRule.ttlSec > 0;

        // --- (3) die LLM-Regel ist voll funktional (feuert) ---
        if (llmRule) {
            r.state.worldRules = [llmRule];
            r.state.weather = "rainy";
            llmRule.lastFired = -Infinity;
            r._tickWorldRules(now());
        }
        out.llmFires = r.state.weather === "sunny";

        // die Regel-Grammatik im Prompt der KI (rule-Op + Feld-Bedingungen) wacht gate:weltakt-wache (K)

        // --- (5) die Gesetze-Console labelt eine LLM-Regel als „Grok" (source-llm) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"]], { source: "llm:grok" });
        r._statusRefs.worldrulesSignature = "";
        r.renderWorldRulesList();
        const host = document.getElementById("status-worldrules");
        const llmRow = host.querySelector(".ability-row.source-llm");
        out.consoleLabel = !!llmRow && /Grok/.test(llmRow.querySelector(".source").textContent);

        // restore
        r.state.worldRules = savedRules;
        r.state.weather = savedWeather;
        r._statusRefs.worldrulesSignature = "";
        return out;
    });

    // KI-Regeln: die UNIVERSELLE Whitelist (in _registerWorldRule) — LLM-Regel mit frozen-Effekt abgelehnt, reaktiver passiert
    check(
        "KI-Regeln: die UNIVERSELLE Whitelist",
        res.unsafeRejected && res.safeRegistered
    );
    // KI-Regeln: eine LLM-Regel ist EPHEMER per Default (fitness-getestet + adoptierbar)
    check(
        "KI-Regeln: eine LLM-Regel ist EPHEMER per Default",
        res.llmEphemeral
    );
    // KI-Regeln: die LLM-Regel ist voll funktional (feuert rainy → sunny)
    check("KI-Regeln: die LLM-Regel ist voll funktional", res.llmFires);
    // V17.40 KI-Regeln: die Gesetze-Console labelt eine LLM-Regel als „Grok" (source-llm)
    check("V17.40 KI-Regeln: die Gesetze-Console labelt eine LLM-Regel als „Grok\"", res.consoleLabel);
}

// Gesetzes-Faden, zwei Konsumenten der EINEN Spur lastFired/fires: (a) _worldRuleActivityLabel zeigt
// live „⚡ feuert“, (b) das erste Erwachen einer EIGENEN Mensch-Regel wird eine Welt-Erinnerung
// (einmal, idempotent über die Signatur; Nexus-Regeln nicht). Geprüft nach echtem Feuern.
async function checkBandV1741RuleThread(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const now = () => performance.now() / 1000;

        const savedRules = r.state.worldRules.slice();
        const savedWeather = r.state.weather;
        const savedEntries = r.state.worldJournal.entries.slice();
        const savedSeen = { ...r.state.worldJournal.seen };

        // --- (1) der Aktivitäts-Faden ist LIVE (nicht sticky-binär „⚡ aktiv") ---
        const tNow = now();
        const mk = (over) => Object.assign({ fires: 0, lastFired: -Infinity, disabled: false }, over);
        out.labelRuht = r._worldRuleActivityLabel(mk({}), tNow) === "ruht";
        out.labelFeuert = r._worldRuleActivityLabel(mk({ fires: 1, lastFired: tNow }), tNow) === "⚡ feuert";
        out.labelAktiv = r._worldRuleActivityLabel(mk({ fires: 3, lastFired: tNow - 999 }), tNow) === "⚡ aktiv · 3×";
        out.labelPausiert =
            r._worldRuleActivityLabel(mk({ fires: 2, lastFired: tNow, disabled: true }), tNow) === "pausiert";

        // --- (2) DOM-KONSUM: nach echtem Feuern zeigt der Namen-Span „⚡ feuert" + pulst ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "human" });
        const domRule = r.state.worldRules.find((x) => x.source === "human");
        r.state.weather = "rainy";
        domRule.lastFired = -Infinity;
        r._tickWorldRules(now());
        r._statusRefs.worldrulesSignature = "__force__"; // != aktuelle Signatur → echtes Re-Render
        r.renderWorldRulesList();
        const host = document.getElementById("status-worldrules");
        const nameSpan = host.querySelector(".ability-row.source-human .name");
        out.domShowsFeuert =
            !!nameSpan && /feuert/.test(nameSpan.textContent) && nameSpan.classList.contains("rule-firing");

        // --- (3) der Live-Faden treibt das Re-Render: feuert ein Gesetz, ändert sich
        //         die Signatur VON SELBST (kein manueller Reset → die 0.4-s-Render-
        //         Schleife pickt es auf, der Puls ist sichtbar) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "human" });
        const sigRule = r.state.worldRules.find((x) => x.source === "human");
        r._statusRefs.worldrulesSignature = "";
        r.renderWorldRulesList(); // rendert „ruht"
        const sigRuht = r._statusRefs.worldrulesSignature;
        r.state.weather = "rainy";
        sigRule.lastFired = -Infinity;
        r._tickWorldRules(now()); // feuert
        r.renderWorldRulesList(); // KEIN manueller Reset — die Signatur muss sich geändert haben
        const sigFeuert = r._statusRefs.worldrulesSignature;
        out.signatureLive = sigRuht !== sigFeuert && /feuert/.test(sigFeuert) && /ruht/.test(sigRuht);

        // --- (4) Journal-Erwachen: erstes Feuern einer MENSCH-Regel schreibt eine
        //         Welt-Erinnerung („Dein Gesetz erwachte — ...") ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "human" });
        const hRule = r.state.worldRules.find((x) => x.source === "human");
        delete r.state.worldJournal.seen["ruleAwoke:" + hRule._sig]; // sicherstellen: noch nicht erwacht
        const jBefore = r.state.worldJournal.entries.length;
        r.state.worldRules = [hRule];
        r.state.weather = "rainy";
        hRule.lastFired = -Infinity;
        r._tickWorldRules(now()); // fires===1 → Erwachen
        const awoke = r.state.worldJournal.entries
            .slice(jBefore)
            .find((e) => e.type === "rule" && /erwachte/.test(e.text));
        out.journalAwoke = !!awoke && r.state.weather === "sunny";

        // --- (5) idempotent über die Signatur: dieselbe Regel NEU aufgestellt (frische
        //         Akkus, fires zurück auf 0→1) + gefeuert schreibt KEINE zweite
        //         Erinnerung (seen[ruleAwoke:sig] hält über die Regel-Instanz hinweg) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "human" });
        const hRule2 = r.state.worldRules.find((x) => x.source === "human"); // gleiche Signatur
        const jBefore2 = r.state.worldJournal.entries.length;
        r.state.worldRules = [hRule2];
        r.state.weather = "rainy";
        hRule2.lastFired = -Infinity;
        r._tickWorldRules(now());
        out.journalIdempotent = r.state.worldJournal.entries.length === jBefore2;

        // --- (6) Gating: eine NEXUS-Regel, die feuert, schreibt KEINE Erinnerung
        //         (der Faden ist „weil DEIN Gesetz wirkte" — Nexus/LLM bleiben dem
        //         Live-Console-Faden vorbehalten, kein Journal-Flut) ---
        r.state.worldRules.length = 0;
        r.dslRun(["rule", ["weather_is", "sunny"], ["weather", "rainy"], { ttlSec: 60 }], { source: "nexus" });
        const nRule = r.state.worldRules.find((x) => x.source === "nexus");
        const jBeforeN = r.state.worldJournal.entries.length;
        r.state.worldRules = [nRule];
        r.state.weather = "sunny";
        nRule.lastFired = -Infinity;
        r._tickWorldRules(now());
        // die Nexus-Regel feuerte (sie wünscht das Wetter nur — Leben-Schau 2), und keine Erinnerung entstand
        out.nexusNoJournal = r.state.worldJournal.entries.length === jBeforeN && nRule.fires === 1;

        // restore
        r.state.worldRules = savedRules;
        r.state.weather = savedWeather;
        r.state.worldJournal.entries = savedEntries;
        r.state.worldJournal.seen = savedSeen;
        r._statusRefs.worldrulesSignature = "";
        return out;
    });

    // Gesetzes-Faden: _worldRuleActivityLabel ist LIVE (ruht / ⚡ feuert / ⚡ aktiv · N× / pausiert)
    check(
        "Gesetzes-Faden: _worldRuleActivityLabel ist LIVE",
        res.labelRuht && res.labelFeuert && res.labelAktiv && res.labelPausiert
    );
    // V17.41 Gesetzes-Faden: nach echtem Feuern zeigt der Console-Span „⚡ feuert" + pulst (.rule-firing) — DOM-Konsum
    check(
        "V17.41 Gesetzes-Faden: nach echtem Feuern zeigt der Console-Span „⚡ feuert\" + pulst",
        res.domShowsFeuert
    );
    // Gesetzes-Faden: das Feuern ändert die Render-Signatur VON SELBST (Live-ness im Diff, kein manueller Reset)
    check(
        "Gesetzes-Faden: das Feuern ändert die Render-Signatur VON SELBST",
        res.signatureLive
    );
    // V17.41 Gesetzes-Faden: das erste Erwachen einer MENSCH-Regel wird eine Welt-Erinnerung („Dein Gesetz erwachte")
    check(
        "V17.41 Gesetzes-Faden: das erste Erwachen einer MENSCH-Regel wird eine Welt-Erinnerung",
        res.journalAwoke
    );
    // Gesetzes-Faden: idempotent — dieselbe Regel neu aufgestellt + gefeuert schreibt KEINE zweite Erinnerung
    check(
        "Gesetzes-Faden: idempotent",
        res.journalIdempotent
    );
    // Gesetzes-Faden: eine NEXUS-Regel, die feuert, schreibt KEINE Erinnerung (der Faden ist DEIN Gesetz)
    check(
        "Gesetzes-Faden: eine NEXUS-Regel, die feuert, schreibt KEINE Erinnerung",
        res.nexusNoJournal
    );
}

// Lokal-attribuierte Regel-Fitness: reward = struktureller δ am Effekt-Ort über die Baseline, EMA in
// rule.value; _worldRuleFitness = valueScore × Erfolg × Kosten (neutral knapp unter der Schwelle). Geprüft: Heiler/neutral/
// Schädling diskriminieren; die Eviction wirft den wert-niedrigsten (nicht den ältesten); Mensch/pinned geschützt.
async function checkBandV1743RuleFitness(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};

        // --- (1) die Fitness DISKRIMINIERT (Heiler > neutral > Schädling) ---
        const mkF = (value) => ({ fires: 5, value, errors: 0, costMsSum: 0.1 });
        const fHeal = r._worldRuleFitness(mkF(1));
        const fNeutral = r._worldRuleFitness(mkF(0));
        const fHarm = r._worldRuleFitness(mkF(-1));
        out.fitnessDiscriminates = fHeal > 0.9 && fNeutral > 0.4 && fHarm < 0.1 && fHeal > fNeutral && fNeutral > fHarm;
        // renewFitness 0.5: der Heiler überlebt, neutral (sein δ trägt die Kosten nicht) und Schädling verfallen
        const renew = r.constructor.WORLD_RULES.renewFitness;
        out.harmerDecays = fHarm < renew && fNeutral < renew && fHeal >= renew;

        // --- (2) _ruleRewardPos: der Effekt-Ort (at) bzw. Spieler (positionslos) ---
        const ctx0 = r._worldRuleCtx({ id: 0, source: "nexus", fires: 0 });
        const pHeal = r._ruleRewardPos(["deposit_life", ["at", 333, 0, 444]], ctx0);
        out.rewardPosFromEffect = Math.abs(pHeal.x - 333) < 1e-6 && Math.abs(pHeal.z - 444) < 1e-6;
        const pm = r.state.playerMesh.position;
        const pW = r._ruleRewardPos(["weather", "sunny"], ctx0);
        out.rewardPosFallbackPlayer = Math.abs(pW.x - pm.x) < 1e-6 && Math.abs(pW.z - pm.z) < 1e-6;

        // --- (3) END-TO-END: eine heilende Regel akkumuliert POSITIVEN Wert ---
        const savedRules = r.state.worldRules.slice();
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        const savedWeather = r.state.weather;
        r.state.lifeField = new Map();
        r.state.wohlBaseline = new Map();
        // einen Spot mit Leben-Headroom finden (frozen lebendig < 0.6)
        let sx = 2000,
            sz = 2000;
        for (let i = 0; i < 24; i++) {
            const cx = 2000 + i * 41,
                cz = 2000 + i * 59;
            if (r._fieldWohlStruktur(r.auraAt(cx, cz, 0)) < 0.6) {
                sx = cx;
                sz = cz;
                break;
            }
        }
        r.state.worldRules = [];
        r.dslRun(
            ["rule", ["random_chance", 1], ["deposit_life", ["at", sx, 0, sz]], { everySec: 0.001, ttlSec: 9999 }],
            {
                source: "nexus",
            }
        );
        const heal = r.state.worldRules[0];
        heal.lastFired = -Infinity;
        r._tickWorldRules(1000); // Feuer 1: Baseline (niedrig) gesnapshottet, Leben deponiert
        heal.lastFired = -Infinity;
        r._tickWorldRules(1000.02); // Feuer 2: Reward gemessen (hoch − niedrig = +) → value > 0
        out.healerPositiveValue = heal.value > 0.05;

        // --- (3b) eine NEUTRALE Regel (Wetter, berührt lebendig nicht) → value ≈ 0 ---
        r.state.worldRules = [];
        r.dslRun(["rule", ["random_chance", 1], ["weather", "sunny"], { everySec: 0.001, ttlSec: 9999 }], {
            source: "nexus",
        });
        const neutral = r.state.worldRules[0];
        neutral.lastFired = -Infinity;
        r._tickWorldRules(2000);
        neutral.lastFired = -Infinity;
        r._tickWorldRules(2000.02);
        out.neutralZeroValue = Math.abs(neutral.value) < 0.05;

        // --- (4) Eviction wirft den wert-NIEDRIGSTEN ephemeren (nicht den ältesten) ---
        const rr = [
            { id: 1, source: "nexus", value: 0.8, born: 1, pinned: false },
            { id: 2, source: "nexus", value: -0.5, born: 2, pinned: false }, // niedrigster Wert
            { id: 3, source: "nexus", value: 0.2, born: 3, pinned: false },
        ];
        r._evictWorldRule(rr);
        out.evictsLowestValue = rr.length === 2 && !rr.some((x) => x.id === 2);
        // Mensch/pinned geschützt, auch bei niedrigstem Wert
        const rr2 = [
            { id: 1, source: "human", value: -0.9, born: 1, pinned: false },
            { id: 2, source: "nexus", value: 0.1, born: 2, pinned: false },
        ];
        r._evictWorldRule(rr2);
        out.evictProtectsHuman = rr2.some((x) => x.id === 1) && !rr2.some((x) => x.id === 2);

        // --- (6) value ist reaktiv (NICHT im Snapshot — wie die anderen Akkus) ---
        r.state.worldRules = [];
        r.dslRun(["rule", ["weather_is", "rainy"], ["weather", "sunny"], {}], { source: "human" });
        const snap = r.buildStateSnapshot();
        out.valueNotInSnapshot =
            Array.isArray(snap.worldRules) && snap.worldRules[0] && snap.worldRules[0].value === undefined;

        // restore
        r.state.worldRules = savedRules;
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        r.state.weather = savedWeather;
        return out;
    });

    // Wertung: _worldRuleFitness DISKRIMINIERT (Heiler > neutral > Schädling — die alte ≈0.99-Fitness konnte das nicht)
    check(
        "Wertung: _worldRuleFitness DISKRIMINIERT",
        res.fitnessDiscriminates
    );
    // Wertung: nur wessen δ seine Kosten trägt, bleibt über renewFitness (Schädling und neutral verfallen, affekt.K3)
    check(
        "Wertung: nur wessen δ seine Kosten trägt, bleibt über renewFitness",
        res.harmerDecays
    );
    // Wertung: _ruleRewardPos misst am Effekt-Ort (at) bzw. an der Spieler-Position (positionsloser Effekt)
    check(
        "Wertung: _ruleRewardPos misst am Effekt-Ort bzw. an der Spieler-Position",
        res.rewardPosFromEffect && res.rewardPosFallbackPlayer
    );
    // Wertung: END-TO-END — eine heilende Regel (deposit_life) akkumuliert POSITIVEN Wert (der Ort blüht auf)
    check(
        "Wertung: END-TO-END",
        res.healerPositiveValue
    );
    // Wertung: eine neutrale Regel (Wetter, berührt lebendig nicht) akkumuliert ~0 Wert
    check(
        "Wertung: eine neutrale Regel akkumuliert ~0 Wert",
        res.neutralZeroValue
    );
    // Wertung: Eviction wirft den wert-NIEDRIGSTEN ephemeren Eintrag (nicht den ältesten); Mensch/pinned geschützt
    check(
        "Wertung: Eviction wirft den wert-NIEDRIGSTEN ephemeren Eintrag; Mensch/pinned geschützt",
        res.evictsLowestValue && res.evictProtectsHuman
    );
    // Wertung: rule.value ist reaktiv — NICHT im Snapshot serialisiert (wie die anderen Akkus)
    check(
        "Wertung: rule.value ist reaktiv",
        res.valueNotInSnapshot
    );
}

// Emotionaler Kern, Substrat + FUSION: unter den sechs Gefühlen liegt ein Affekt-Raum
// (EMOTION_GEOMETRY: Valenz × Erregung). `_emotionState` liest dominantes Gefühl + Schwerpunkt +
// INTENSITÄT (6-dim Abstand vom Neutralen: bittersüß = Valenz~0, hohe Intensität). Sanfte Kohärenz
// in updatePlayerEmotions dämpft gegensätzliche Achsen; Konsum: die KI kennt die Stimmung.
async function checkBandV1745EmotionCore(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const GEO = r.constructor.EMOTION_GEOMETRY;
        const axes = r.constructor.EMOTION_AXES;

        // save
        const savedEmo = { ...p.emotions };
        const savedBase = p.wohlBaseline;
        const savedTick = p.emotionLastTick;
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        const savedEmoField = r.state.emotionField;
        const savedHp = p.hp;
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };

        // (1) Die Geometrie: alle 6 Achsen, prinzipielle Vorzeichen (Russell-Circumplex).
        out.geoComplete =
            !!GEO &&
            axes.every((a) => GEO[a] && typeof GEO[a].valenz === "number" && typeof GEO[a].erregung === "number");
        out.geoValenceSigns =
            GEO.joy.valenz > 0 &&
            GEO.hope.valenz > 0 &&
            GEO.peace.valenz > 0 &&
            GEO.sorrow.valenz < 0 &&
            GEO.chaos.valenz < 0;
        out.geoArousalOpposed = GEO.peace.erregung < 0 && GEO.chaos.erregung > 0; // peace↔chaos = Erregungs-Gegenpol

        // (2) Der Readout — ein KLARES dominantes Gefühl.
        setEmo({ joy: 0.8 });
        const sClear = r._emotionState();
        out.clearDominant =
            sClear.dominant === "joy" && sClear.valence > 0.5 && sClear.intensity > 0.7 && sClear.label === "Freude";

        // (3) Die FUSION — bittersüß: die VALENZ hebt sich auf, die INTENSITÄT bleibt HOCH.
        setEmo({ joy: 0.7, sorrow: 0.7 });
        const sMix = r._emotionState();
        out.bittersweetValenceCancels = Math.abs(sMix.valence) < 0.1;
        out.bittersweetIntensityHigh = sMix.intensity > 0.9; // das additive Modell verfehlt das
        out.bittersweetLabel =
            typeof sMix.label === "string" && sMix.label.includes("Zwiespalt") && Array.isArray(sMix.mix);

        // (4) Ruhe — wenig Aktivierung → ein ruhiger Grund-Affekt.
        setEmo({});
        const sCalm = r._emotionState();
        out.calmReadout = sCalm.intensity < 0.2 && sCalm.label === "ruhig";

        // (5) KONSUM (kein Passagier): die KI KENNT die Stimmung des Spielers
        // (llmBuildSystemPrompt — vorher trug der Persona-Prompt NULL Emotion).
        setEmo({ joy: 0.8 });
        out.promptClear = r.llmBuildSystemPrompt().includes("Freude");
        setEmo({ joy: 0.7, sorrow: 0.7 });
        out.promptMix = r.llmBuildSystemPrompt().includes("Zwiespalt");
        setEmo({});
        out.promptCalm = r.llmBuildSystemPrompt().includes("ruhig");

        // (6) Die KOHÄRENZ — ein Gegenpol (sorrow) dämpft joy; eine EINZELNE klare
        // Emotion wird NICHT gedämpft (der V17.30-Wächter: 0.7 bleibt erreichbar).
        // Differential gegen die gleiche Welt-Position → gemeinsame Feld-Drift kürzt sich.
        r.state.lifeField = new Map();
        r.state.emotionField = new Map();
        p.hp = (p.stats && p.stats.hpMax) || 100; // keine HP-Drift
        const pm = r.state.playerMesh.position;
        const sit = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));
        setEmo({ joy: 0.8, sorrow: 0.8 }); // joy + Gegenpol
        p.wohlBaseline = sit; // δ=0 → kein Appraisal
        p.emotionLastTick = 9000;
        r.updatePlayerEmotions(9001);
        const joyWithOpp = p.emotions.joy;
        setEmo({ joy: 0.8 }); // joy allein
        p.wohlBaseline = sit;
        p.emotionLastTick = 9000;
        r.updatePlayerEmotions(9001);
        const joyAlone = p.emotions.joy;
        out.coherenceDamps = joyAlone - joyWithOpp > 0.02; // der Gegenpol zieht joy herunter
        out.singleNotDamped = joyAlone > 0.75; // eine klare Emotion bleibt (0.7-Trigger heil)

        // restore
        setEmo(savedEmo);
        p.wohlBaseline = savedBase;
        p.emotionLastTick = savedTick;
        p.hp = savedHp;
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        r.state.emotionField = savedEmoField;
        return out;
    });

    // Emotion-Kern: EMOTION_GEOMETRY vollständig (alle 6 Achsen, Valenz × Erregung)
    check("Emotion-Kern: EMOTION_GEOMETRY vollständig", res.geoComplete);
    // Emotion-Kern: prinzipielle Valenz-Vorzeichen (joy/hope/peace +, sorrow/chaos −) — Russell
    check(
        "Emotion-Kern: prinzipielle Valenz-Vorzeichen",
        res.geoValenceSigns
    );
    // Emotion-Kern: peace ↔ chaos sind Erregungs-Gegenpol (die Geometrie trägt die Kohärenz)
    check(
        "Emotion-Kern: peace ↔ chaos sind Erregungs-Gegenpol",
        res.geoArousalOpposed
    );
    // Emotion-Kern: Readout — ein klares dominantes Gefühl (joy=0.8 → Freude, Valenz +)
    check(
        "Emotion-Kern: Readout",
        res.clearDominant
    );
    // Emotion-Kern: FUSION — bittersüß hebt die Valenz auf (~0)
    check("Emotion-Kern: FUSION", res.bittersweetValenceCancels);
    // Emotion-Kern: FUSION — bittersüß behält HOHE Intensität (das additive Modell verfehlt das)
    check(
        "Emotion-Kern: FUSION",
        res.bittersweetIntensityHigh
    );
    // V17.45 Emotion-Kern: FUSION — bittersüß labelt „Zwiespalt" + nennt die zwei Gefühle (mix)
    check(
        "V17.45 Emotion-Kern: FUSION",
        res.bittersweetLabel
    );
    // V17.45 Emotion-Kern: Ruhe — wenig Aktivierung → „ruhig"
    check("V17.45 Emotion-Kern: Ruhe", res.calmReadout);
    // Emotion-Kern: KONSUM — die KI (llmBuildSystemPrompt) kennt ein klares Gefühl (Freude)
    check(
        "Emotion-Kern: KONSUM",
        res.promptClear
    );
    // Emotion-Kern: KONSUM — die KI kennt den Zwiespalt (bittersüß)
    check("Emotion-Kern: KONSUM", res.promptMix);
    // Emotion-Kern: KONSUM — die KI kennt die Ruhe
    check("Emotion-Kern: KONSUM", res.promptCalm);
    // Emotion-Kern: Kohärenz — ein Gegenpol (sorrow) dämpft joy (der Zustand wird kohärent)
    check(
        "Emotion-Kern: Kohärenz",
        res.coherenceDamps
    );
    // Emotion-Kern: Kohärenz — eine EINZELNE klare Emotion wird NICHT gedämpft (0.7-Trigger heil)
    check(
        "Emotion-Kern: Kohärenz",
        res.singleNotDamped
    );
}

// Appraisal-Brücke: die Gefühls-Antwort auf eine Tat EMERGIERT aus den Substanz-Tags
// (computeCompoundTags → TAG_TO_EMOTION × Magnitude), nicht aus dem Tat-Namen — lebendiges Holz ≠
// toter Stein, Schöpfen feuert Stolz ∝ Komplexität. ACTION_TO_EMOTION bleibt Fallback für tag-lose
// Akte (explore/damage).
async function checkBandV1746EmotionSubstance(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const savedEmo = { ...p.emotions };
        const savedLife = r.state.lifeField;
        const savedEmoField = r.state.emotionField;
        r.state.lifeField = new Map();
        r.state.emotionField = new Map(); // Deposits gehen in eine Wegwerf-Map (kein Leak)
        const reset = () => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = 0;
        };

        // (2) _appraiseSubstance — die Substanz färbt das Gefühl
        const sLeb = r._appraiseSubstance({ lebendig: 1 }, 1);
        const sDic = r._appraiseSubstance({ dichte: 1 }, 1);
        const sBrn = r._appraiseSubstance({ brennbar: 1 }, 1);
        out.lebendigPeace = (sLeb.peace || 0) > (sLeb.hope || 0) && (sLeb.peace || 0) > 0; // lebendig → peace dominant
        out.dichteHope = (sDic.hope || 0) > (sDic.peace || 0) && (sDic.hope || 0) > 0; // dichte → hope dominant
        out.brennbarChaos = (sBrn.chaos || 0) > 0 && (sBrn.awe || 0) > 0; // brennbar → chaos + awe
        out.noLebInDichte = !((sDic.joy || 0) > 0); // dichte erzeugt KEINE lebendig-joy (Achsen sauber getrennt)
        const sLeb2 = r._appraiseSubstance({ lebendig: 1 }, 2);
        out.magnitudeScales = Math.abs((sLeb2.peace || 0) - 2 * (sLeb.peace || 0)) < 1e-9; // linear in Magnitude
        const sLeb3 = r._appraiseSubstance({ lebendig: 3 }, 1);
        out.tagsClamped = Math.abs((sLeb3.peace || 0) - (sLeb.peace || 0)) < 1e-9; // Tag-Stärke >1 geklemmt

        // (3) END-TO-END (der beweisbare Konsum): build(Holz/lebendig) ≠ build(Stein/dichte)
        reset();
        r._feelAction("build", { tags: { lebendig: 1 } });
        const woodPeace = p.emotions.peace;
        const woodHope = p.emotions.hope;
        reset();
        r._feelAction("build", { tags: { dichte: 1 } });
        const stonePeace = p.emotions.peace;
        const stoneHope = p.emotions.hope;
        out.woodMorePeace = woodPeace > stonePeace + 0.02; // lebendiges Holz → mehr Frieden
        out.stoneMoreHope = stoneHope > woodHope + 0.02; // toter Stein → mehr Hoffnung (Solidität)

        // (4) Magnitude end-to-end: eine große Schöpfung (Kathedrale) bewegt mehr als eine Box
        reset();
        r._feelAction("build", { tags: { lebendig: 1 }, magnitude: 1.5 });
        const big = p.emotions.joy + p.emotions.peace + p.emotions.hope;
        reset();
        r._feelAction("build", { tags: { lebendig: 1 }, magnitude: 0.7 });
        const small = p.emotions.joy + p.emotions.peace + p.emotions.hope;
        out.magnitudeEndToEnd = big > small + 0.05;

        // (5) der schöpferische Akt (Werkstatt/Chat): Stolz + Substanz-Färbung + Source-Gate
        reset();
        r._feelAction("create", { tags: { magieleitung: 1 }, magnitude: 1.5 });
        out.createPride = p.emotions.joy > 0 && p.emotions.hope > 0 && p.emotions.awe > 0; // Stolz (joy+hope) + Magie (awe)

        // (6) KEIN Regress: ohne Substanz exakt V17.30 (build → joy 0.1, hope 0.1; explore-Fallback)
        reset();
        r._feelAction("build");
        out.noRegressBuild = Math.abs(p.emotions.joy - 0.1) < 1e-9 && Math.abs(p.emotions.hope - 0.1) < 1e-9;
        reset();
        r._feelAction("explore"); // tag-los → Fallback ACTION_TO_EMOTION
        out.fallbackExplore = p.emotions.awe > 0;

        // restore
        for (const k of Object.keys(savedEmo)) p.emotions[k] = savedEmo[k];
        r.state.lifeField = savedLife;
        r.state.emotionField = savedEmoField;
        return out;
    });
    // Substanz: lebendig → peace (Nähren), dichte → hope (Solidität) — die Substanz färbt
    check(
        "Substanz: lebendig → peace, dichte → hope",
        res.lebendigPeace && res.dichteHope
    );
    // Substanz: brennbar → chaos + awe (Gefahr-Thrill)
    check("Substanz: brennbar → chaos + awe", res.brennbarChaos);
    // Substanz: die Achsen sind sauber getrennt (dichte erzeugt keine lebendig-joy)
    check("Substanz: die Achsen sind sauber getrennt", res.noLebInDichte);
    // Substanz: die Magnitude skaliert den Beitrag linear (Kathedrale > Box)
    check("Substanz: die Magnitude skaliert den Beitrag linear", res.magnitudeScales);
    // Substanz: Tag-Stärke >1 geklemmt (Richtung); die Komplexität trägt die Magnitude
    check("Substanz: Tag-Stärke >1 geklemmt; die Komplexität trägt die Magnitude", res.tagsClamped);
    // Substanz: KONSUM — build(lebendiges Holz) gibt mehr peace als build(toter Stein)
    check("Substanz: KONSUM", res.woodMorePeace);
    // Substanz: KONSUM — build(Stein) gibt mehr hope als build(Holz) — verschiedene Substanz, verschiedenes Gefühl
    check(
        "Substanz: KONSUM",
        res.stoneMoreHope
    );
    // Substanz: KONSUM — Magnitude end-to-end (große Schöpfung bewegt mehr)
    check("Substanz: KONSUM", res.magnitudeEndToEnd);
    // Substanz: der schöpferische Akt → Stolz (joy+hope) + Substanz-Färbung (Magie → awe)
    check(
        "Substanz: der schöpferische Akt → Stolz + Substanz-Färbung",
        res.createPride
    );
    // Substanz: KEIN Regress — _feelAction('build') ohne Substanz = exakt V17.30 (joy 0.1, hope 0.1)
    check(
        "Substanz: KEIN Regress",
        res.noRegressBuild
    );
    // Substanz: Fallback — ein tag-loser Akt (explore) nutzt weiter ACTION_TO_EMOTION
    check(
        "Substanz: Fallback",
        res.fallbackExplore
    );
}

// Fast/Slow: schnelle Emotion (Spike, Decay PRO ACHSE — Furcht kurz, Trauer lang) vs. langsame
// Stimmung (`mood`, EMA über Minuten), in die sie zerfällt; die Stimmung färbt die nächste Bewertung
// kongruent (gebounded gegen Feedback) und ist das, was die KI liest.
async function checkBandV1747FastSlow(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const DECAY = r.constructor.EMOTION_DECAY;
        const AX = r.constructor.EMOTION_AXES;
        const savedEmo = { ...p.emotions };
        const savedMood = p.mood ? { ...p.mood } : null;
        const savedBase = p.wohlBaseline;
        const savedTick = p.emotionLastTick;
        const savedLife = r.state.lifeField;
        const savedWohl = r.state.wohlBaseline;
        const savedEmoField = r.state.emotionField;
        const savedHp = p.hp;
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };
        const setMood = (o) => {
            if (!p.mood) p.mood = {};
            for (const k of AX) p.mood[k] = o[k] || 0;
        };
        r.state.lifeField = new Map();
        p.hp = (p.stats && p.stats.hpMax) || 100; // keine HP-Drift
        const pm = r.state.playerMesh.position;
        const sit = r._playerSituationWohl(r.auraAt(pm.x, pm.z, 0));

        // (1) die Decay-Tabelle: Furcht/chaos schnell, Trauer/peace langsam
        out.decayTable =
            !!DECAY && DECAY.chaos > DECAY.sorrow && DECAY.chaos > 1 && DECAY.sorrow < 1 && DECAY.peace < 1;

        // (2) PRO-ACHSE-Decay end-to-end: chaos (Furcht) verfliegt SCHNELLER als sorrow (Trauer)
        setEmo({ chaos: 0.8, sorrow: 0.8 });
        setMood({});
        p.wohlBaseline = sit; // δ=0 → kein Appraisal
        p.emotionLastTick = 7000;
        r.updatePlayerEmotions(7010); // 10s
        out.fearFadesFasterThanGrief = p.emotions.chaos < p.emotions.sorrow - 0.03;
        out.bothDecayed = p.emotions.chaos < 0.8 && p.emotions.sorrow < 0.8;

        // (3) die STIMMUNG ist eine langsame EMA (das Temperament): lagt, holt dann auf
        setEmo({ joy: 1 });
        setMood({});
        p.wohlBaseline = sit;
        p.emotionLastTick = 7100;
        r.updatePlayerEmotions(7110); // ein einzelner 10s-Tick: die mood lagt
        const moodAfter1 = p.mood.joy;
        out.moodLagsEmotion = moodAfter1 > 0 && moodAfter1 < 0.2;
        let t = 7110;
        for (let i = 0; i < 60; i++) {
            p.emotions.joy = 1; // das Gefühl anhaltend hoch halten
            t += 10;
            r.updatePlayerEmotions(t);
        }
        out.moodConverges = p.mood.joy > 0.8 && p.mood.joy > moodAfter1 + 0.5;

        // (4) STIMMUNGS-KONGRUENZ: eine trübe Stimmung dämpft die Freude eines guten Ereignisses
        setEmo({});
        setMood({});
        p.wohlBaseline = sit - 0.1; // ein REALES gutes Ereignis (δ_base = +0.1)
        p.emotionLastTick = 7800;
        r.updatePlayerEmotions(7801);
        const joyNeutralMood = p.emotions.joy;
        setEmo({});
        setMood({ sorrow: 0.9 }); // trübe Grundstimmung
        p.wohlBaseline = sit - 0.1; // dasselbe gute Ereignis
        p.emotionLastTick = 7800;
        r.updatePlayerEmotions(7801);
        const joySadMood = p.emotions.joy;
        out.moodColorsAppraisal = joyNeutralMood > joySadMood + 0.005;

        // (5) KEIN spontaner Runaway: eine trübe Stimmung bei KONSTANTER Situation (δ_base=0)
        // erzeugt KEINE Emotion (die Kongruenz ist gegated → die V17.44-Feedback-Lehre)
        setEmo({});
        setMood({ sorrow: 0.9 });
        p.wohlBaseline = sit; // δ_base = 0 (kein Ereignis)
        p.emotionLastTick = 8000;
        for (let i = 1; i <= 60; i++) r.updatePlayerEmotions(8000 + i);
        out.noMoodRunaway = p.emotions.sorrow < 0.05;

        // (6) KONSUM — die KI kennt die GRUNDSTIMMUNG (getrennt vom akuten Gefühl)
        setEmo({ joy: 0.8 });
        setMood({ sorrow: 0.8 });
        const prompt = r.llmBuildSystemPrompt();
        out.promptHasMood = /Grundstimmung/.test(prompt) && prompt.includes("Trauer");
        out.promptHasAcute = prompt.includes("Freude");

        // (7) V17.30 heil: anhaltendes Tun erreicht weiter 0.7
        setEmo({});
        for (let i = 0; i < 10; i++) r._feelAction("build");
        out.triggerReachable = p.emotions.joy >= 0.7;

        // restore
        setEmo(savedEmo);
        if (savedMood) setMood(savedMood);
        p.wohlBaseline = savedBase;
        p.emotionLastTick = savedTick;
        p.hp = savedHp;
        r.state.lifeField = savedLife;
        r.state.wohlBaseline = savedWohl;
        r.state.emotionField = savedEmoField;
        return out;
    });
    // Fast/Slow: EMOTION_DECAY-Tabelle (chaos/Furcht schnell, sorrow/peace langsam)
    check("Fast/Slow: EMOTION_DECAY-Tabelle", res.decayTable);
    // Fast/Slow: KONSUM — Furcht (chaos) verfliegt SCHNELLER als Trauer (sorrow) [pro-Achse-Decay]
    check(
        "Fast/Slow: KONSUM",
        res.fearFadesFasterThanGrief
    );
    // Fast/Slow: beide Achsen zerfallen (Decay wirkt)
    check("Fast/Slow: beide Achsen zerfallen", res.bothDecayed);
    // Fast/Slow: die STIMMUNG ist eine langsame EMA — sie lagt der Emotion (ein Tick → klein)
    check(
        "Fast/Slow: die STIMMUNG ist eine langsame EMA",
        res.moodLagsEmotion
    );
    // Fast/Slow: KONSUM — anhaltendes Gefühl → die Stimmung KONVERGIERT (das Temperament wächst)
    check(
        "Fast/Slow: KONSUM",
        res.moodConverges
    );
    // Fast/Slow: KONSUM — eine trübe Stimmung färbt das Erleben (dämpft die Freude eines guten Ereignisses)
    check(
        "Fast/Slow: KONSUM",
        res.moodColorsAppraisal
    );
    // Fast/Slow: KEIN Runaway — eine trübe Stimmung bei konstanter Situation manufakturiert KEINE Emotion (V17.44-Lehre)
    check(
        "Fast/Slow: KEIN Runaway",
        res.noMoodRunaway
    );
    // Fast/Slow: KONSUM — die KI kennt die GRUNDSTIMMUNG (Trauer), getrennt vom akuten Gefühl (Freude)
    check(
        "Fast/Slow: KONSUM",
        res.promptHasMood && res.promptHasAcute
    );
    // Fast/Slow: V17.30 heil — anhaltendes Tun erreicht weiter die 0.7-Trigger-Schwelle
    check(
        "Fast/Slow: V17.30 heil",
        res.triggerReachable
    );
}

// Soziales Gefühl: Emotion naher Kreaturen fließt zum Spieler (∝ Nähe × Bindung, gebounded), Bindung
// wächst mit gemeinsamer Zeit, Verlust schmerzt ∝ Bindung, die KI TENDET die Stimmung (tröstet).
async function checkBandV1748Social(ctx) {
    const { page, check } = ctx;
    const res = await page.evaluate(() => {
        const r = window.anazhRealm;
        const out = {};
        const p = r.state.player;
        const AX = r.constructor.EMOTION_AXES;
        const savedEmo = { ...p.emotions };
        const savedMood = p.mood ? { ...p.mood } : null;
        const savedCreatures = r.state.creatures;
        const savedCreatureEmotions = r.state.creatureEmotions;
        const pm = r.state.playerMesh.position;
        const setEmo = (o) => {
            for (const k of Object.keys(p.emotions)) p.emotions[k] = o[k] || 0;
        };
        const setMood = (o) => {
            if (!p.mood) p.mood = {};
            for (const k of AX) p.mood[k] = o[k] || 0;
        };
        // eine kontrollierte Kreatur AM Spieler-Ort (proximity 1)
        const fake = (bond, task) => ({
            position: { x: pm.x, y: pm.y, z: pm.z },
            userData: { bond, task: { name: task || "wait" } },
        });
        const inject = (emo, bond, task) => {
            r.state.creatures = [fake(bond, task)];
            r.state.creatureEmotions = [emo];
        };

        // (2) CONTAGION — ein freudiges Wesen nah HEBT joy + peace; ein leidendes betrübt
        setEmo({});
        inject("happy", 1);
        r._tickEmotionContagion(1);
        out.happyLifts = p.emotions.joy > 0 && p.emotions.peace > 0 && p.emotions.sorrow === 0;
        setEmo({});
        inject("sad", 1);
        r._tickEmotionContagion(1);
        out.sadGrieves = p.emotions.sorrow > 0 && p.emotions.joy === 0;

        // (2c) Der VEKTOR ist die Wahrheit: ein Wesen mit awe-Innenleben steckt mit AWE an — das binäre
        // happy-Target (CONTAGION_TARGET) kennt kein awe, nur der Vektor-Pfad transportiert es.
        setEmo({});
        r.state.creatures = [fake(1)];
        r.state.creatures[0].userData.emotions = { joy: 0, awe: 0.7, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
        r.state.creatureEmotions = ["happy"];
        r._tickEmotionContagion(1);
        out.vecContagionAwe = p.emotions.awe > 0;

        // (2d) V18.100 G4-1 — EIN Substrat: der Kreatur-Treffer fühlt über
        // ACTION_TO_EMOTION.damage (denselben Vektor-Eintrag wie der Spieler)
        // und die binäre "sad"-Projektion fällt aus der Valenz (Alt-Leser heil).
        const fcDmg = fake(0);
        r.state.creatures = [fcDmg];
        r.state.creatureEmotions = ["happy"];
        r._feelCreatureAction(fcDmg, "damage", 2.5);
        out.creatureFeelsDamage =
            !!fcDmg.userData.emotions && fcDmg.userData.emotions.sorrow > 0.2 && r.state.creatureEmotions[0] === "sad";

        // (2b) gebounded: die Contagion treibt joy NICHT über das Ziel (0.5) hinaus (kein Runaway)
        setEmo({ joy: 0.5 });
        inject("happy", 1);
        for (let i = 0; i < 200; i++) r._tickEmotionContagion(1);
        out.contagionBounded = p.emotions.joy <= 0.51;

        // (3) BINDUNG gewichtet die Contagion (eine gebundene Kreatur färbt mehr als eine fremde)
        setEmo({});
        inject("happy", 1);
        r._tickEmotionContagion(1);
        const joyBonded = p.emotions.joy;
        setEmo({});
        inject("happy", 0);
        r._tickEmotionContagion(1);
        const joyUnbonded = p.emotions.joy;
        out.bondWeights = joyBonded > joyUnbonded + 0.005;

        // (4) eine WARTENDE Kreatur baut keine Bindung auf (das Wachsen misst gate:kreatur-takt folgen)
        inject("happy", 0, "wait");
        r._tickEmotionContagion(2);
        out.waitNoBond = r.state.creatures[0].userData.bond === 0;

        // (5) BOND-LOSS — der Verlust einer GEBUNDENEN Kreatur schmerzt MEHR (∝ Bindung × Vitalität)
        const grief = (bond, leb) => 0.3 + bond * 1.2 + leb * 0.4; // die _creatureNaturalDeath-Formel
        setEmo({});
        r._feelAction("loss", { magnitude: grief(0, 0.5) });
        const sUnbonded = p.emotions.sorrow;
        setEmo({});
        r._feelAction("loss", { magnitude: grief(1, 0.5) });
        const sBonded = p.emotions.sorrow;
        out.bondLossHurts = sBonded > sUnbonded + 0.05;

        // (6) KO-REGULATION — die KI TENDET bei anhaltend trüber Stimmung (Hoffnung + Wort)
        setEmo({});
        setMood({ sorrow: 0.9 }); // moodValence stark negativ
        r.state.grok.lastSpoke = -Infinity;
        r.state.grok.triggers.comfort.lastFired = -Infinity;
        r._aiTendPlayer();
        out.tendComforts = p.emotions.hope > 0;
        setEmo({});
        setMood({}); // ausgeglichene Stimmung → KEIN Trost (kein Trost ohne Trübsal)
        r.state.grok.lastSpoke = -Infinity;
        r.state.grok.triggers.comfort.lastFired = -Infinity;
        r._aiTendPlayer();
        out.noTendWhenOk = p.emotions.hope === 0;

        // restore
        setEmo(savedEmo);
        if (savedMood) setMood(savedMood);
        r.state.creatures = savedCreatures;
        r.state.creatureEmotions = savedCreatureEmotions;
        return out;
    });
    // Soziales: KONSUM — ein freudiges Wesen nah HEBT joy + peace (Contagion)
    check("Soziales: KONSUM", res.happyLifts);
    // Soziales: KONSUM — ein leidendes Wesen nah betrübt (sorrow)
    check("Soziales: KONSUM", res.sadGrieves);
    // G4-1 KONSUM: die Contagion liest das 6-Achsen-Innenleben — ein awe-fühlendes Wesen steckt mit AWE an (binär unmöglich)
    check(
        "G4-1 KONSUM: die Contagion liest das 6-Achsen-Innenleben",
        res.vecContagionAwe
    );
    // G4-1: der Kreatur-Treffer fühlt über DASSELBE Substrat (ACTION_TO_EMOTION.damage → Vektor; 'sad' fällt aus der Valenz-Projektion)
    check(
        "G4-1: der Kreatur-Treffer fühlt über DASSELBE Substrat",
        res.creatureFeelsDamage
    );
    // Soziales: gebounded — die Contagion sättigt am Ziel (≤0.5), kein Runaway (V17.44-Lehre)
    check(
        "Soziales: gebounded",
        res.contagionBounded
    );
    // Soziales: KONSUM — die BINDUNG gewichtet die Contagion (gebunden färbt mehr als fremd)
    check(
        "Soziales: KONSUM",
        res.bondWeights
    );
    // Soziales: eine WARTENDE Kreatur baut keine Bindung auf (nur gemeinsame Zeit zählt)
    check("Soziales: eine WARTENDE Kreatur baut keine Bindung auf", res.waitNoBond);
    // Soziales: KONSUM — der Verlust einer GEBUNDENEN Kreatur schmerzt MEHR (Trauer ∝ Bindung)
    check(
        "Soziales: KONSUM",
        res.bondLossHurts
    );
    // Soziales: KONSUM — die KI TENDET bei anhaltend trüber Stimmung (Hoffnung + Trost)
    check("Soziales: KONSUM", res.tendComforts);
    // Soziales: kein Trost ohne Trübsal — bei ausgeglichener Stimmung TENDET die KI nicht
    check(
        "Soziales: kein Trost ohne Trübsal",
        res.noTendWhenOk
    );
}

// G8 R2 — die Irreversibilitäts-Wand (M3): SOVEREIGN_ACTIONS (frozen) disjunkt
// von jedem Auto-Pool + eine Host-gerenderte Geste. Eine vergiftete Welt/LLM/
// Regel kann einen souveränen Akt NIE auslösen — nur du, jetzt, über die Geste.
async function checkBandG8R2SovereignWall(ctx) {
    const { page, check } = ctx;
    const res = await safeEvaluate(page, () => {
        const r = window.anazhRealm;
        const K = r.constructor;
        const out = {};
        const SA = K.SOVEREIGN_ACTIONS;
        // (2) DISJUNKTHEIT: kein souveräner Akt ist ein dslEffect, in
        // NON_BROADCASTABLE_OPS, oder im Nexus-Auto-Pool (dslComposeAtomic).
        const effects = r.dslEffects;
        out.notDslOp = SA.every((a) => !(a in effects));
        const nb = K.NON_BROADCASTABLE_OPS;
        out.notBroadcast = SA.every((a) => !nb.has(a));
        let composeClean = true;
        for (let i = 0; i < 300; i++) {
            const prog = r.dslComposeAtomic(() => Math.random());
            if (Array.isArray(prog) && SA.includes(prog[0])) {
                composeClean = false;
                break;
            }
        }
        out.notComposed = composeClean;
        // (3) RUNTIME: ein DSL-Programm mit souveränem Op → sovereign_blocked
        // (NICHT unknown_op, NICHT ausgeführt).
        const run = r.dslRun(["wallet_transfer", "to", "someone"], { source: "human" });
        out.dslBlocks =
            Array.isArray(run.log) &&
            run.log.some((e) => e.event === "sovereign_blocked") &&
            !run.log.some((e) => e.event === "unknown_op");
        // genistet in einer Kette: der souveräne Op fällt, der legitime läuft.
        const savedWeather = r.state.weather;
        r.state.weather = "sunny";
        const run2 = r.dslRun(["chain", ["sign_manifest"], ["weather", "rainy"]], { source: "human" });
        out.chainBlocksSovereignNotRest =
            run2.log.some((e) => e.event === "sovereign_blocked") && r.state.weather === "rainy";
        r.state.weather = savedWeather;
        // (4) die Host-Geste: skipConfirm → true; ein NICHT-souveräner Akt → verweigert.
        out.gestureSkipConfirm = r._sovereignGesture("wallet_transfer", { what: "x" }, { skipConfirm: true }) === true;
        out.gestureRefusesUnknown = r._sovereignGesture("plant_a_tree", {}, { skipConfirm: true }) === false;
        // (6) eine Welt-REGEL kann keinen souveränen Effekt ausführen.
        const ctxr = r.dslCtx({ source: "rule-test" });
        r.dslEval(["grant_capability", "world", "domain"], ctxr);
        out.ruleEffectBlocked = ctxr.log.some((e) => e.event === "sovereign_blocked");
        return out;
    });
    if (!res) {
        check("G8 R2: Sovereign-Wall-Sonde lief", false, "evaluate warf");
        return;
    }
    // G8 R2: DISJUNKT von dslEffects ∪ NON_BROADCASTABLE ∪ dslComposeAtomic (die Wand)
    check(
        "G8 R2: DISJUNKT von dslEffects ∪ NON_BROADCASTABLE ∪ dslComposeAtomic",
        res.notDslOp && res.notBroadcast && res.notComposed
    );
    // G8 R2: ein souveräner Op im DSL wird sovereign_blocked (nie ausgeführt)
    check("G8 R2: ein souveräner Op im DSL wird sovereign_blocked", res.dslBlocks);
    check("G8 R2: in einer Kette fällt der souveräne Op, der legitime läuft", res.chainBlocksSovereignNotRest);
    // G8 R2: die Host-Geste (skipConfirm→ok · Nicht-souverän→verweigert)
    check(
        "G8 R2: die Host-Geste",
        res.gestureSkipConfirm && res.gestureRefusesUnknown
    );
    // G8 R2: eine Welt-REGEL kann keinen souveränen Effekt ausführen (blockiert beim Feuern)
    check(
        "G8 R2: eine Welt-REGEL kann keinen souveränen Effekt ausführen",
        res.ruleEffectBlocked
    );
}

module.exports = {
    checkRing2Dsl, checkBandV1723Harmony, checkBandV1726FieldDirection, checkBandV1730EmotionFromBeing,
    checkBandV1733WorldRules, checkBandV1734FieldRules, checkBandV1735NexusEvolvesRules, checkBandV1736HumanRules,
    checkBandV1737RulesUI, checkBandV1739RulesUX, checkBandV1740LlmRules, checkBandV1741RuleThread,
    checkBandV1743RuleFitness, checkBandV1745EmotionCore, checkBandV1746EmotionSubstance, checkBandV1747FastSlow,
    checkBandV1748Social, checkBandG8R2SovereignWall,
};

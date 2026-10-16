#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-weltakt-wache.cjs — DIE BÜHNE HÄLT DIE WELT (0710-7). Befund (OMEN 0710-6, V18.535-ABAB, verworfene Boots): die Bühne
// hielt das Wetter (gate:wetter-wache), aber keinen anderen Zug — im Boot 4B setzte der Nexus mitten im Lauf ein Dorf (die
// Gier sprang), in anderen Boots kamen Tiere at_player, Größen- und Tempo-Würfel, die Tageszeit. Jeder solche Zug ist ein
// Welt-Akt der DSL, und alle laufen durch EINE Engstelle: `dslEval`. Der Schnitt liegt dort: unter dem Halt einer Messung
// (`_messHalt`, dieselbe eingefrorene Uhr wie der Wetter-Halt) verweigert `dslEval` jeden Welt-Akt (`AnazhRealm.DSL_WELTAKTE`)
// und nennt ihn beim Namen seiner Quelle (`_weltaktGehalten`); im Spiel zählt die Uhr von 0 aufwärts — das Spiel bleibt, wie
// es ist. Die Wand (Null-Renderer, eine echte Welt):
//   (H) HALT: unter der Bühne versucht jeder Weg des Spiels die Welt zu ändern — Nexus (`_loopNexusUpdate`: Dorf far_player,
//       Tiere at_player, Größen- und Tempo-Würfel, Tageszeit, Lauf-Tempo, Himmel), Emotion (`updatePlayerEmotions`, chaos →
//       Tempo-Würfel), Gesetz (`_tickWorldRules`), Mensch, Mitspieler (DSL-Quelle `remote:`), ein verzögertes Programm
//       (`dslTick`): die Welt bleibt, wie sie war (Bauten, Dorf-Rufe, Tiere, ihre Größe und ihr Tempo, Tageszeit, Himmel,
//       Lauf- und Sprung-Kraft, Gier), jeder Zug steht im Buch des Welt-Akt-Spions als verweigert beim Namen seiner Quelle;
//   (S) SCHARF: ein Welt-Akt an `dslEval` vorbei (der Effekt direkt) fällt ROT und steht mit seiner Quelle im Urteil;
//   (F) FREI: ohne Halt (Uhr ≥ 0) wirken dieselben Wege wie im Spiel — der Nexus setzt sein Dorf, jeder Op wirkt (K);
//   (Q) QUELLE: jeder Op der DSL hat ein Urteil (Welt-Akt oder benannt frei, die Liste nennt nur Ops, die es gibt); jedes
//       Programm, das der Nexus komponiert, trägt nur Welt-Akte der Liste, das Wetter und die freien Ops (dass `dslEval`
//       Liste und Halt liest, beweisen H und F am Verhalten); (K) KI: der Prompt der Welt-KI (`llmBuildSystemPrompt`) nennt
//       jeden Op, Ort und jede Bedingung der DSL mit Form, die Welt-Akte als eigene Gruppe (bis 16.10.: 40 von 70 Ops); jeder Op
//       wirkt als KI an seiner Form (`_dslForm`, Werte aus der Welt), jede DSL-Liste (`*_OPS`, `DSL_*`) nennt nur lebende Ops
//       (bis 16.10.: remove_architecture und sechs Kreatur-Verben tot an der Id der Welt, modify_terrain in einer Liste);
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): `weltaktUrteil` fällt bei jedem durchgelaufenen Akt, beim blinden
// und fehlenden Spion rot, bei Verweigerung grün; `kiUrteil` nennt das fehlende und das falsch gruppierte Verb, `formUrteil`
// den brechenden Op, den stehenden Bau, den ungeprüften Op und den toten Listen-Namen.
//   node scripts/diag-weltakt-wache.cjs [--selftest]   (npm run gate:weltakt-wache; Port WELTAKT_WACHE_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL, weltaktUrteil, weltaktSelbsttest } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.WELTAKT_WACHE_PORT || 4603);
const FORM_BRUCH = /error|exception|budget|unknown|invalid|failed|oob|not_found|ignored|skipped|gehalten/;

if (process.argv.includes("--selftest")) {
    console.log("=== WELT-WACHE — Selbsttest des Urteils (ohne Browser) ===");
    const v = weltaktSelbsttest();
    const ki = (p) => kiUrteil(p, { "Welt-Akte": ["spawn_studio"], "Weitere Ops": ["when"], Orte: ["at"] }).join(" · ");
    const gut = "Welt-Akte: spawn_studio(what).\nWeitere Ops: when(c).\nOrte: at(x).";
    const weg = gut.replace("spawn_studio(what)", "");
    const um = ki(weg.replace("when(c)", "when(c), spawn_studio(w)"));
    if (ki(gut) || !/Welt-Akte — fehlt 1: spawn_studio/.test(ki(weg)) || !/Ops — .*fremd: spawn_studio/.test(um))
        v.push(`(K) kiUrteil blind: voll „${ki(gut)}" · fehlend „${ki(weg)}" · umgruppiert „${um}"`);
    const form = (z, l) => formUrteil(z.map(([op, ev, blieb]) => ({ op, prog: op, ev: [ev], blieb })), l, ["say", "fall"]).join(" · ");
    const [heil, fu, halb] = [form([["say", "ok"], ["fall", "ok"]], { X_OPS: ["say"] }), form([["say", "x_oob"], ["fall", "ok", 1]], { X_OPS: ["modify_terrain"] }), form([["say", "ok"]], {})];
    if (heil || !/say .*x_oob · .*fall .*Bau steht.*X_OPS nennt tote Ops: modify_terrain/.test(fu) || !/ungeprüft: fall/.test(halb))
        v.push(`(K) formUrteil blind: heil „${heil}" · gebrochen „${fu}" · halb „${halb}"`);
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT — das Urteil der Welt-Wache ist blind.");
        process.exit(1);
    }
    console.log("✅ SELBSTTEST GRÜN — Akt durch, Spion blind/fehlend, KI-Verb fehlend/umgruppiert/formbrüchig, toter Listen-Name: jedes fällt rot.");
    process.exit(0);
}

// Die Ops der DSL, die keine gemessene Welt verändern (das Urteil der Wand über jeden Op, der kein Welt-Akt ist): das Wetter
// (sein eigener Schreiber `_setWeather`, gate:wetter-wache), Definitionen, Erzählung, Kontrollfluss.
const FREI = [
    "weather",
    "define_blueprint",
    "define_consumable",
    "define_soul",
    "define_material",
    "define_ability",
    "set_armor_role",
    "set_weapon_role",
    "set_consumable_role",
    "set_workshop_station",
    "set_tool_meta",
    "register_tool",
    "record_narrative",
    "say",
    "chain",
    "delay",
    "repeat",
    "random",
    "random_weighted",
    "when",
    "rule",
    "parallel",
];
// Je Weg die Züge, die unter der Bühne verweigert im Buch stehen müssen. Die Welt-Akte darin schickt die Probe — ihr Spion
// hüllt sie auch, wenn das Spiel keine Liste nennt (dann ist er blind und das Urteil ROT, der Täter steht beim Namen).
const SOLL = {
    nexus: [
        "nexus → spawn_village",
        "nexus → spawn_creature",
        "nexus → creatures_size_mul",
        "nexus → creatures_speed_mul",
        "nexus → set_time_of_day",
        "nexus → player_speed",
        "nexus → skybox_color",
    ],
    emotion: ["emotion:chaos → creatures_speed_mul"],
    gesetz: ["rule:human → spawn_creature"],
    mensch: ["human → spawn_tree", "human → spawn_creature"],
    mitspieler: [
        "remote:peer-wache → set_time_of_day",
        "remote:peer-wache → player_jump_power",
        "remote:peer-wache → creatures_color",
    ],
    spaeter: ["llm:grok → spawn_tree"],
};
const GESCHICKT = [...new Set(Object.values(SOLL).flatMap((w) => w.map((k) => k.split(" → ")[1])))];

// (K) DIE KI KENNT JEDES VERB: je Gruppe (eine Zeile „Kopf: name(form), …" im Prompt) genau ihre Namen — fehlt einer oder
// steht einer in der falschen Gruppe, fällt er beim Namen.
function kiUrteil(prompt, soll) {
    const zeilen = String(prompt || "").split("\n");
    return Object.entries(soll).flatMap(([kopf, namen]) => {
        const da = (zeilen.find((l) => l.trim().startsWith(kopf + ":")) || "").match(/[a-z_]+(?=\()/g) || [];
        const fehlt = namen.filter((n) => !da.includes(n));
        const fremd = da.filter((n) => !namen.includes(n));
        const gut = !fehlt.length && !fremd.length;
        return gut ? [] : [`(K) KI: ${kopf} — fehlt ${fehlt.length}: ${fehlt.join(", ")} · fremd: ${fremd.join(", ")}`];
    });
}

// (K) JEDES VERB WIRKT AN SEINER FORM: ein Bruch im Log (auch ein Setz-Ergebnis unter dem Gewollten), ein stehender Bau nach dem
// Abbau, ein Op ohne Probe, ein Listen-Name außerhalb von dslEffects — jeder fällt beim Namen. (Fehler-Muster: FORM_BRUCH)
function formUrteil(zeilen, listen, ops) {
    const ohne = ops.filter((o) => !zeilen.some((z) => z.op === o));
    return [
        ...zeilen.filter((z) => z.blieb || z.ev.some((e) => FORM_BRUCH.test(e))).map((z) => `(K) FORM: ${z.prog} scheitert an seiner Form — ${z.ev.join(", ")}${z.blieb ? "; der Bau steht noch" : ""}`),
        ...(ohne.length ? [`(K) FORM ungeprüft: ${ohne.join(", ")}`] : []),
        ...Object.entries(listen).flatMap(([n, l]) => (l.some((x) => !ops.includes(x)) ? [`(K) LISTE: ${n} nennt tote Ops: ${l.filter((x) => !ops.includes(x)).join(", ")}`] : [])),
    ];
}

const server = statikServer();

// Die Probe im Seiten-Kontext: jeder Weg des Spiels unter der Bühne, der Schmuggel an der Engstelle vorbei, die freie Welt,
// die Quelle.
async function probe(GESCHICKT) {
    const r = window.anazhRealm;
    const st = r.state;
    const t = () => performance.now() / 1000;
    // die Dörfer der Probe: `spawnSettlement` baut asynchron (Foundry-Export) — die Probe wartet jedes ab
    const doerfer = [];
    r.spawnSettlement = function (o) {
        const p = Object.getPrototypeOf(this).spawnSettlement.call(this, o);
        doerfer.push(p);
        return p;
    };
    // die Form jedes Verbs (`_dslForm`), gelesen, ehe der Spion die Welt-Akte hüllt
    const formen = Object.fromEntries(Object.entries(r.dslEffects).map(([op, fn]) => [op, r._dslForm(fn)]));
    window.__weltaktSpion(GESCHICKT);
    const welt = () => {
        let groesse = 0,
            tempo = 0;
        for (const c of st.creatures) {
            if (c.scale) groesse += c.scale.x;
            tempo += (c.userData && c.userData.speedMul) || 1;
        }
        return {
            bauten: st.architectures.length,
            dorfRufe: doerfer.length,
            tiere: st.creatures.length,
            groesse: +groesse.toFixed(4),
            tempo: +tempo.toFixed(4),
            zeit: +Number(st.timeOfDay).toFixed(4),
            himmel: st.skyTintTo ? st.skyTintTo.getHexString() : null,
            lauf: st.speed,
            sprung: st.jumpPower,
            gier: +st.yaw.toFixed(4),
        };
    };
    const fenster = async (tat) => {
        const vorher = welt();
        const seq = window.__weltaktBuch().seq;
        const n0 = doerfer.length;
        tat();
        await Promise.allSettled(doerfer.slice(n0));
        return { vorher, nachher: welt(), buch: window.__weltaktBuch(seq) };
    };
    // jeder Weg des Spiels (der echte Code-Pfad, keine Abkürzung)
    const GESETZ = ["spawn_creature", ["at_player"], 2, "sad"];
    const wege = {
        nexus: () => {
            st.nexusWirk = 1e6;
            st.nexusEvolutionQueue.push({
                name: "weltakt-wache",
                program: [
                    "chain",
                    ["spawn_village", ["far_player", 180, 380], 4711],
                    ["spawn_creature", ["at_player"], 3, "happy"],
                    ["creatures_size_mul", 1.5],
                    ["creatures_speed_mul", 1.7],
                    ["set_time_of_day", 0.1],
                    ["player_speed", 20],
                    ["skybox_color", "#ff00ff"],
                ],
                source: "nexus",
            });
            r._loopNexusUpdate();
        },
        emotion: () => {
            const p = st.player;
            p.emotionLastTick = t();
            p.emotions.chaos = 1;
            p.emotionLastApply.chaos = -Infinity;
            r.updatePlayerEmotions(t());
            p.emotions.chaos = 0;
        },
        gesetz: () => {
            r.dslRun(["rule", ["weather_is", "sunny"], GESETZ], { source: "human" });
            r._tickWorldRules(t() + 3600);
        },
        mensch: () =>
            r.dslRun(["chain", ["spawn_tree", ["at_player"], 2], ["spawn_creature", ["near_player", 10], 2, "happy"]], {
                source: "human",
            }),
        mitspieler: () =>
            r.dslRun(["chain", ["set_time_of_day", 0.9], ["player_jump_power", 30], ["creatures_color", "#00ff00"]], {
                source: "remote:peer-wache",
            }),
        spaeter: () => {
            r.dslRun(["delay", 0.5, ["spawn_tree", ["at_player"], 1]], { source: "llm:grok" });
            r.dslTick(Infinity);
        },
    };
    const aus = { halt: {}, frei: {} };
    window.__buehne();
    for (const [n, w] of Object.entries(wege)) aus.halt[n] = await fenster(w);
    // das Gesetz, das die Probe registrierte, fällt wieder
    st.worldRules = (st.worldRules || []).filter(
        (x) => !(x && x.source === "human" && JSON.stringify(x.effect) === JSON.stringify(GESETZ))
    );
    // (S) ein Welt-Akt an der Engstelle vorbei: der Effekt direkt (Faktor 1 — die Welt bleibt, der Zug zählt)
    aus.schmuggel = await fenster(() =>
        r.dslEffects.creatures_size_mul.call(r, [1], { source: "sonde:schmuggel", log: [] })
    );
    // (F) ohne Halt wirken die Wege wie im Spiel (Platz für ihre Tiere unter der Kappe `maxCreatures`)
    st.weatherEffectTime = 0;
    st.maxCreatures = Math.max(st.maxCreatures, st.creatures.length + 10);
    aus.frei.nexus = await fenster(wege.nexus);
    // (K) jeder Op als KI an seiner Form: je Name der Form ein Wert aus der Welt; ein Id-Name probt jede Form, die die Welt
    // vergibt (der Bau: Zahl + String, die Kreatur: Platz + Id); der Ort liegt außerhalb der Genesis-Lichtung (keine Krone)
    const K = r.constructor;
    for (const bis = performance.now() + 60000; !st.blueprints.haus_griechisch && performance.now() < bis; )
        await new Promise((x) => setTimeout(x, 200)); // das Studio-Buch (spawn_temple liest es)
    const rolle = (x) => Object.keys(st.blueprints).find((k) => st.blueprints[k].role === x);
    const [sag, ich, teil, opClass] = [["say", "Probe"], st.playerMesh.position, { size: [1, 1, 1], material: "stein" }, [...K.TOOL_OP_CLASSES][0]];
    // die Zahl-Id trägt jeder Bau aus Programm, Feld und Worldgen, die String-Id das Werk des Spielers (`_newArchId`)
    const bau = (art, id = r._newArchId()) => art === "number" ? st.architectures.filter((a) => a && typeof a.id === art).pop().id
        : (r.dslRun(["spawn_blueprint", "stein_block", ["far_player", 30, 40], 8, id], { source: "human" }), id);
    const JE = { weather: "rainy", set_season: "herbst", gravity: -9.8, terrain_steepness: 1, player_soul: "wesen", spawn_blueprint: "stein_block" };
    const W = (op, n) => ({
        name: JE[op] || (/^define_/.test(op) ? "wache_" + op.slice(7) : rolle(/^equip_/.test(op) ? op.slice(6) : "consumable")),
        value: JE[op] ?? (op === "terrain_base_height" ? st.terrainBaseHeight : 8), blueprintName: /boost/.test(op) ? rolle("consumable") : "wache_blueprint",
        archId: op === "remove_architecture" ? ["number", "string"].map((a) => bau(a)) : undefined, indexOrId: [0, st.creatures[0].userData.netId],
        positionNode: ["far_player", 40, 60], x: ich.x, y: ich.y - 1, z: ich.z + 3, count: 1, seed: 4711, radius: 1.5, t: 0.4, gier: 0,
        color: "#88aaff", emotion: "happy", kind: "kiefer", what: "baum", height: 30, size: 8, durationSeconds: 30, scale: 1.2, label: "Probe",
        worldId: Object.keys(K.WORLD_REGISTRY)[0], slot: "tool", mode: "pfad", taskName: "wait", amount: 1, armorName: rolle("armor"), toolName: Object.keys(st.tools)[0],
        tagBonus: { lebendig: 0.2 }, tags: ["lebendig"], opClass, opName: K.OP_NAME_BY_CLASS[opClass], type: op === "apply_connection" ? "nail" : "tree",
        parts: [{ shape: "box", ...teil }, { shape: "box", ...teil, material: "holz" }], bodyParts: [{ shape: "sphere", ...teil }],
        partA: 0, partB: 1, partIndex: 0, depth: 2, ratio: 0.6, rootSeedArg: 1, factor: 1.1, source: "probe", target: "creatures", visible: true,
        text: "Probe", message: "Probe", axis: "joy", seconds: 0.1, times: 2, condition: ["weather_is", "sunny"], condNode: ["weather_is", "sunny"],
        program: sag, sub: sag, thenBranch: sag, elseBranch: sag, effectNode: sag, opts: { everySec: 3 },
        "…": [op === "random_weighted" ? { weight: 1, effect: sag } : sag, sag],
    })[n];
    aus.form = [];
    for (const [op, namen] of Object.entries(formen).map(([op, f]) => [op, f.split(", ").filter(Boolean)])) {
        const roh = namen.map((n) => W(op, n)), i = roh.findIndex((v, j) => /Id$/.test(namen[j]) && Array.isArray(v));
        for (const wahl of i < 0 ? [0] : roh[i]) {
            const args = namen[0] === "…" ? roh[0] : roh.map((v, j) => (j === i ? wahl : v));
            while (args.length && args[args.length - 1] === undefined) args.pop();
            const ev = r.dslRun([op, ...args], { source: "llm:grok" }).log.map((e) => (e.event !== "ergebnis" ? e.event + (e.reason ? ":" + e.reason : "") : e.gesetzt < e.gewollt && !e.folgt ? `ergebnis_failed ${JSON.stringify(e.gruende)}` : "ergebnis"));
            const blieb = op === "remove_architecture" && st.architectures.some((a) => a && a.id === wahl);
            aus.form.push({ op, prog: JSON.stringify([op, ...args]).slice(0, 120), ev, blieb });
        }
    }
    aus.listen = Object.fromEntries(Object.getOwnPropertyNames(K).filter((x) => /_OPS$|^DSL_/.test(x)).map((n) => [n, [...K[n]]]));
    window.__buehne();
    aus.ende = { uhr: st.weatherEffectTime };
    // (Q) das Urteil über jeden Op; die Programme des Nexus — (K) der Prompt der Welt-KI und die Orte und Bedingungen der DSL
    aus.liste = Array.isArray(r.constructor.DSL_WELTAKTE) ? r.constructor.DSL_WELTAKTE.slice() : null;
    aus.ops = Object.keys(r.dslEffects);
    const gruppen = { Orte: Object.keys(r.dslPositions), Bedingungen: Object.keys(r.dslConditions) };
    aus.ki = { prompt: r.llmBuildSystemPrompt(), gruppen };
    let s = 0x5eed;
    const rng = () => {
        s = (s + 0x6d2b79f5) | 0;
        let x = Math.imul(s ^ (s >>> 15), 1 | s);
        x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
    const ops = new Set(aus.ops);
    const nexusOps = {};
    const lauf = (n) => {
        if (!Array.isArray(n)) return;
        if (typeof n[0] === "string" && ops.has(n[0])) nexusOps[n[0]] = (nexusOps[n[0]] || 0) + 1;
        for (const x of n) lauf(x);
    };
    for (let i = 0; i < 1500; i++) {
        lauf(r.dslComposeAtomic(rng));
        lauf(r.dslCompose({ rng, usePattern: false, useHistory: false }));
        lauf(r.dslComposeRule(rng));
    }
    aus.nexusOps = nexusOps;
    return aus;
}

function gleich(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function urteil(S, pageErrors) {
    const rot = [];
    for (const [n, w] of Object.entries(S.halt)) {
        const u = weltaktUrteil(w.buch);
        if (u.urteil !== "GRUEN") rot.push(`(H) HALT ${n}: ${u.taeter.join(" · ")}`);
        if (!gleich(w.vorher, w.nachher))
            rot.push(
                `(H) HALT ${n}: die Welt ändert sich unter der Bühne — ${JSON.stringify(w.vorher)} → ${JSON.stringify(w.nachher)}`
            );
        const fehlt = SOLL[n].filter((k) => !u.verweigert[k]);
        if (fehlt.length)
            rot.push(
                `(H) HALT ${n}: kein verweigerter Zug ${fehlt.join(", ")} im Buch (${JSON.stringify(u.verweigert)}) — der Weg schickte ihn nicht, oder die Engstelle hält ihn nicht`
            );
    }
    const sm = weltaktUrteil(S.schmuggel.buch);
    if (sm.urteil !== "ROT" || !sm.taeter.some((t) => /creatures_size_mul durch sonde:schmuggel/.test(t)))
        rot.push(
            `(S) SCHARF: der Akt an der Engstelle vorbei fällt nicht rot beim Namen (${sm.urteil}: ${sm.taeter.join(" · ")})`
        );
    const fn = S.frei.nexus;
    if (!(fn.nachher.dorfRufe > fn.vorher.dorfRufe && fn.nachher.bauten > fn.vorher.bauten))
        rot.push(
            `(F) FREI: der Nexus setzt ohne Halt kein Dorf (${JSON.stringify(fn.vorher)} → ${JSON.stringify(fn.nachher)})`
        );
    if (!(fn.nachher.tiere > fn.vorher.tiere && fn.nachher.himmel === "ff00ff"))
        rot.push(
            `(F) FREI: der Nexus wirkt ohne Halt nicht (${JSON.stringify(fn.vorher)} → ${JSON.stringify(fn.nachher)})`
        );
    // Die Uhr gehört dem Spieler (Leben-Schau 2, `_himmelSchreiber`, gate:wetter-wache): auch ohne Halt stellt der Nexus sie nie.
    if (fn.nachher.zeit !== fn.vorher.zeit)
        rot.push(
            `(F) FREI: der Nexus stellt die Uhr (${fn.vorher.zeit} → ${fn.nachher.zeit}) — sie gehört dem Spieler`
        );
    if (!(S.ende.uhr < 0)) rot.push(`(F) die Bühne stellt den Halt nicht wieder her (Uhr ${S.ende.uhr})`);
    if (!S.liste) rot.push("(Q) QUELLE: das Spiel nennt keine Welt-Akte (AnazhRealm.DSL_WELTAKTE fehlt)");
    else {
        const ohne = S.ops.filter((o) => !S.liste.includes(o) && !FREI.includes(o));
        if (ohne.length)
            rot.push(
                `(Q) URTEIL: ${ohne.join(", ")} — weder Welt-Akt noch benannt frei (DSL_WELTAKTE oder FREI dieser Wand)`
            );
        const doppelt = S.liste.filter((o) => FREI.includes(o));
        if (doppelt.length) rot.push(`(Q) URTEIL: ${doppelt.join(", ")} steht als Welt-Akt UND frei`);
        const nexusFrei = Object.keys(S.nexusOps).filter((o) => !S.liste.includes(o) && !FREI.includes(o));
        if (nexusFrei.length) rot.push(`(Q) NEXUS: der Nexus komponiert Ops ohne Urteil: ${nexusFrei.join(", ")}`);
        const welt = S.ops.filter((o) => S.liste.includes(o));
        const gruppen = { "Welt-Akte": welt, "Weitere Ops": S.ops.filter((o) => !welt.includes(o)), ...S.ki.gruppen };
        rot.push(...kiUrteil(S.ki.prompt, gruppen), ...formUrteil(S.form, S.listen, S.ops));
    }
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 180000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(async () => {
        const dl = performance.now() + 120000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.player ||
                !window.anazhRealm.nexus ||
                typeof window.anazhRealm._gameLoopTick !== "function") &&
            performance.now() < dl
        )
            await new Promise((r) => setTimeout(r, 100));
    });
    await page.evaluate(AUSGABE_INSTALL);
    const S = await page.evaluate(probe, GESCHICKT);
    await browser.close();
    server.close();

    console.log("=== DIE WELT-WACHE — die Bühne hält die Welt (Null-Renderer, eine echte Welt) ===");
    const fz = (w) =>
        Object.keys(w.vorher)
            .filter((k) => !gleich(w.vorher[k], w.nachher[k]))
            .map((k) => `${k} ${w.vorher[k]} → ${w.nachher[k]}`)
            .join(", ");
    for (const [n, w] of Object.entries(S.halt)) {
        const u = weltaktUrteil(w.buch);
        console.log(
            `  Halt · ${n.padEnd(10)} ${u.urteil}  Welt ${fz(w) ? "ändert " + fz(w) : "steht"}; verweigert ${JSON.stringify(u.verweigert)}` +
                (u.taeter.length ? `; Täter: ${u.taeter.join(" · ")}` : "")
        );
    }
    const sm = weltaktUrteil(S.schmuggel.buch);
    console.log(`  Scharf · vorbei   ${sm.urteil}  ${sm.taeter.join(" · ")}`);
    console.log(`  Frei · Nexus      ${fz(S.frei.nexus)}`);
    console.log(
        `  KI: Prompt ${S.ki.prompt.length} Zeichen · Quelle: ${S.ops.length} Ops, ${S.ki.gruppen.Orte.length} Orte, ${S.ki.gruppen.Bedingungen.length} Bedingungen, ${S.liste ? S.liste.length : "keine"} Welt-Akte, ${FREI.length} frei; der Nexus komponiert ${Object.keys(S.nexusOps).length} Ops (${Object.keys(S.nexusOps).sort().join(" · ")})`
    );
    console.log(`  KI-Form: ${S.form.length} Läufe über ${S.ops.length} Ops, ${formUrteil(S.form, {}, []).length} Läufe scheitern an ihrer Form; Listen ${Object.entries(S.listen).map(([n, l]) => `${n} ${l.filter((x) => !S.ops.includes(x)).length}/${l.length} tot`).join(" · ")}`);
    const rot = urteil(S, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — unter der Bühne läuft kein Welt-Akt durch, jeder steht beim Namen seiner Quelle; ohne Halt wirkt das Spiel wie immer."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Welt-Wache-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

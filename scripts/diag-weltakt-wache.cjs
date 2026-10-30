#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-weltakt-wache.cjs — DIE BÜHNE HÄLT DIE WELT. Jeder solche Zug ist ein Welt-Akt der DSL, und alle laufen
// durch EINE Engstelle: `dslEval`. Der Schnitt liegt dort: unter dem Halt einer Messung (`_messHalt`, dieselbe
// eingefrorene Uhr wie der Wetter-Halt) verweigert `dslEval` jeden Welt-Akt (`AnazhRealm.DSL_WELTAKTE`) und nennt ihn
// beim Namen seiner Quelle (`_weltaktGehalten`); im Spiel zählt die Uhr von 0 aufwärts — das Spiel bleibt, wie es ist.
// Die Wand (Null-Renderer, eine echte Welt):
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
//       jeden Op, Ort und jede Bedingung der DSL mit Form, die Welt-Akte als eigene Gruppe; jeder Op
//       wirkt als KI an seiner Form (`_dslForm`, Werte aus der Welt), jede DSL-Liste (`*_OPS`, `DSL_*`) nennt nur lebende Ops
//       (modify_terrain in einer Liste);
//   (P) kein Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
//   (T) DIE TAT (affekt K1/K4, ohne Halt): 10 Pflegen je 30 s — |δ₁₀| ≤ 0,3 δ₁, der Chor-Teil der Wertung am Ort ≥ 3 dB, 32 m
//       daneben ≤ 0,5 dB, gestempelte Freude 0; Taten von Nexus und KI im Blick in ≤ 1 treuen Zeile je 30 s (`tat-k1`/`tat-k4`).
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): `weltaktUrteil` fällt bei jedem durchgelaufenen Akt, beim blinden
// und fehlenden Spion rot, bei Verweigerung grün; `kiUrteil` nennt das fehlende und das falsch gruppierte Verb, `formUrteil`
// den brechenden Op, den stehenden Bau, den ungeprüften Op und den toten Listen-Namen; `tatUrteil` jeden Bruch der Tat.
//   node scripts/diag-weltakt-wache.cjs [--selftest]   (npm run gate:weltakt-wache; Port WELTAKT_WACHE_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, nullRenderer, nullSeite, selbsttestEnde, hauptLauf, wandEnde } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL, weltaktUrteil, weltaktSelbsttest } = require("./lib/ausgabe-aufnahme.cjs");
const MESS = require("./lib/welt-orte.cjs").messort("wiese");

const PORT = Number(process.env.WELTAKT_WACHE_PORT || 4603);
const FORM_BRUCH = /error|exception|budget|unknown|invalid|failed|oob|not_found|ignored|skipped|gehalten/;

// (T) DAS URTEIL DER TAT (rein, über `tatProbe`) → Befunde
function tatUrteil(T) {
    const [t, S, rot] = [T.taten, T.stimme, []];
    const [a, z] = [t[0], t[t.length - 1]];
    // der stumme Chor (die Probe hörte bis zum Deckel keinen singenden Leib): ROT beim Namen der Tat, nie TypeError, nie still grün;
    // der Selbsttest schmuggelt die stumme Tat 2 und verlangt Tat, Ort und Deckel
    [...t, T.stempel].forEach((x, i) => {
        const k = Object.keys(x).filter((k) => !Number.isFinite(x[k]));
        if (k.length) rot.push(`K1 ${t[i] ? "Tat " + (i + 1) : "Stempel"} am Ort (${T.ort}) ohne ${k} nach ${T.deckel} Schritten Vogel-Uhr`);
    });
    if (!(a.delta > 0 && Math.abs(z.delta) <= 0.3 * a.delta)) rot.push(`K1 δ ${a.delta} → ${z.delta}: keine Wertung mit Gewöhnung`);
    if (!(a.antwort >= 3 && Math.abs(z.antwort) <= 0.3 * a.antwort)) rot.push(`K1 Antwort am Ort ${a.antwort} → ${z.antwort} dB`);
    if (t.some((x) => Math.abs(x.nachbar) > 0.5) || Math.abs(a.ausgabe - a.mischung) > 0.05 || T.stempel.delta || T.stempel.antwort)
        rot.push(`K1 Nachbar, Graph oder Stempel: ${JSON.stringify([a, T.stempel])}`);
    const soll = S.plan.reduce((n, p) => n + (p.welt && p.blick ? p.n : 0), 0);
    const gedeckt = S.zeilen.reduce((n, x) => n + 1 + x.weitere, 0);
    if (!soll || gedeckt !== soll || !S.plan.some((p) => p.welt && !p.blick) || S.plan.every((p) => p.welt))
        rot.push(`K4 ${soll} Taten im Blick, gedeckt ${gedeckt}`);
    S.zeilen.forEach((x, i) => {
        if (x.falsch.length || (i && x.t - S.zeilen[i - 1].t < 30)) rot.push(`K4 ${x.t} s ${x.falsch.join(", ")}: ${x.text}`);
    });
    if (S.zeilen.length && S.box !== S.zeilen[S.zeilen.length - 1].text) rot.push(`K4 die Box zeigt „${S.box}“`);
    return rot;
}
function tatSelbsttest() {
    const gut = () => ({
        ort: [12, -7],
        taten: [{ delta: 0.2, antwort: 6, nachbar: 0, ausgabe: -4, mischung: -4 }, { delta: 0, antwort: 0, nachbar: 0 }],
        stempel: { delta: 0, antwort: 0 },
        deckel: 24,
        stimme: { plan: [{ welt: true, blick: true, n: 2 }, { welt: true }, { blick: true }], zeilen: [{ t: 0, weitere: 1, falsch: [] }], box: undefined },
    });
    const faelle = { "taten.0.delta": null, "taten.1.delta": 0.2, "taten.0.antwort": 0.76, "taten.1.nachbar": 4, "taten.0.ausgabe": -9, "stempel.antwort": 4.8, "taten.0.nachbar": null, "taten.1.antwort": null,
        "stimme.plan.0.n": 3, "stimme.plan.1.blick": true, "stimme.plan.2.welt": true, "stimme.zeilen.0.falsch.0": "Ort", "stimme.zeilen.1": { t: 12, weitere: -1, falsch: [] }, "stimme.box": "Hallo." };
    const rot = (pfad) => {
        const [x, k] = [gut(), pfad.split(".")];
        if (pfad) k.slice(0, -1).reduce((o, s) => o[s], x)[k[k.length - 1]] = faelle[pfad];
        return tatUrteil(x);
    };
    return [...(rot("").length || !rot("taten.1.antwort").includes("K1 Tat 2 am Ort (12,-7) ohne antwort nach 24 Schritten Vogel-Uhr") ? ["(T) tatUrteil rot am heilen Fall oder die stumme Tat 2 ohne Namen"] : []), ...Object.keys(faelle).filter((f) => !rot(f).length).map((f) => `(T) tatUrteil blind: ${f}`)];
}

if (process.argv.includes("--selftest")) {
    console.log("=== WELT-WACHE — Selbsttest des Urteils (ohne Browser) ===");
    const v = weltaktSelbsttest();
    v.push(...tatSelbsttest());
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
    selbsttestEnde(v, "Akt durch, Spion blind/fehlend, KI-Verb fehlend/umgruppiert/formbrüchig, toter Listen-Name, Tat ohne Wertung/Gewöhnung/Antwort/Zeile/Treue: jedes fällt rot.");
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
    emotion: ["rule:emotion:chaos → creatures_speed_mul"],
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
            st.player.emotions.chaos = 1;
            r._tickWorldRules(t() + 3600); // das Gesetz des Gemüts `emotion:chaos` (affekt.K2)
            st.player.emotions.chaos = 0;
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
    await window.__weltDa(() => st.blueprints.haus_griechisch); // das Studio-Buch (spawn_temple liest es)
    const rolle = (x) => Object.keys(st.blueprints).find((k) => st.blueprints[k].role === x);
    const [sag, ich, teil, opClass] = [["say", "Probe"], st.playerMesh.position, { size: [1, 1, 1], material: "stein" }, [...K.TOOL_OP_CLASSES][0]];
    // die Zahl-Id trägt jeder Bau aus Programm, Feld und Worldgen, die String-Id das Werk des Spielers (`_newArchId`)
    const bau = (art, id = r._newArchId()) => art === "number" ? st.architectures.filter((a) => a && typeof a.id === art).pop().id
        : (r.dslRun(["spawn_blueprint", "stein_block", ["far_player", 30, 40], 8, id], { source: "human" }), id);
    const JE = { weather: "rainy", set_season: "herbst", gravity: -9.8, terrain_steepness: 1, player_soul: "wesen", spawn_blueprint: "stein_block" };
    // der Leib wiegt nur im Band seines Gesetzes (`AnazhRealm.DSL_WERTE`): die Probe nimmt den Rand des Bands
    for (const [op, stat] of [["player_jump_power", "jumpPower"], ["player_speed", "speed"]]) JE[op] = r._koerperGesetzBand(stat).min;
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
    // eine Liste von Op-Namen oder eine Tafel je Op (DSL_WERTE: ihre Schlüssel) — jeder Name muss leben
    const namen = (x) => (x[Symbol.iterator] ? [...x] : Object.keys(x));
    aus.listen = Object.fromEntries(Object.getOwnPropertyNames(K).filter((x) => /_OPS$|^DSL_/.test(x)).map((n) => [n, namen(K[n])]));
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

// (T) DIE TAT auf frischer Welt: der Nexus ruht, die Probe schickt jede Tat über den echten Weg; die Zeit ist die Spielzeit,
// die Misch-Uhr des Klangs wird je Messung fällig gestellt; die Wahrheit über K4 ist der Plan der Probe, nie das Buch.
async function tatProbe(m) {
    const [r, K] = [window.anazhRealm, window.__klangCore];
    const [st, P, pm] = [r.state, Object.getPrototypeOf(r), r.state.playerMesh.position];
    [r._loopNexusUpdate, st.worldRules] = [() => {}, []];
    pm.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z); // der Leib fällt einmal, je Takt hält die Probe x und z
    const stelle = (n) => {
        for (let i = 0; i < n; i++) pm.setX(m.x).setZ(m.z), r._gameLoopTick(performance.now()), pm.setX(m.x).setZ(m.z);
    };
    await window.__weltStehtNach(() => stelle(1));
    window.__buehne();
    st.weatherEffectTime = 0;
    r._setWeather("sunny", "regler");
    r.initSymphony();
    const um = st.symphony.umwelt;
    const D = (l) => K.umweltMischung(l).vogel.db;
    // der Chor am Ohr x oder in der Lage l des Misch-Takts (ohne Antwort abgezogen: der Teil der Wertung)
    const ohr = (x, l) => {
        pm.x = x;
        l = l || r._umweltLage();
        pm.x = m.x;
        return [D(l), D(l) - D({ ...l, antwort: null })];
    };
    const tat = (f) => (f(), st.taten ? +st.taten[st.taten.length - 1].delta.toFixed(4) : null);
    // DIE MESSUNG WARTET AUF DEN CHOR, nie auf die Wanduhr: die Vögel kreisen nach der Uhr der Welt (`spielZeit`, im Boot
    // lief sie mit der Wanduhr); hört ein Ohr keinen singenden Leib, ist die Messung blind (−∞ − −∞) — die Vogel-Uhr schreitet 5 s
    // Spielzeit, je Schritt 4 Takte, bis der Chor singt; der Deckel sind zwei Lied-Perioden des Vogel-Gesetzes
    const deckel = Math.ceil((2 * P.constructor._vogelGesetz().V.flug.periodeS) / 5);
    const taten = [];
    const hoere = (mess) => {
        for (let w = 0; ; w++, st.spielZeit += 5) {
            um.letzteMischung = -Infinity;
            stelle(4);
            const x = mess();
            if (Object.values(x).every(Number.isFinite) || w >= deckel) return x;
        }
    };
    for (let n = 1, t0 = st.spielZeit; n <= 10; n++, st.spielZeit = t0 += 30) {
        const delta = tat(() => r.processChatCommand("pflege das land"));
        taten.push({ delta, ...hoere(() => {
            const [mischung, antwort] = ohr(m.x, um.lage);
            return { antwort, nachbar: ohr(m.x + 32)[1], mischung, ausgabe: um.graph.zensus().find((v) => v.name === "vogel").db };
        }) });
    }
    st.spielZeit += 120;
    const stempel = { delta: tat(() => r.dslRun(["deposit_emotion", "joy", 0.8], { source: "human" })), ...hoere(() => ({ antwort: ohr(m.x)[1] })) };
    stelle(30);
    [st.taten, st.nexusWirk, st.llm.enabled] = [[], 1e6, true];
    delete r._loopNexusUpdate;
    const [cam, W] = [st.camera, "pflege den Ort vor mir"];
    const b = cam.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
    const vorn = (d, q) => ["at", +(m.x + b.x * d - b.z * q).toFixed(1), +pm.y.toFixed(1), +(m.z + b.z * d + b.x * q).toFixed(1)];
    const O = [vorn(20, 0), vorn(26, 8), vorn(-25, 0), vorn(18, -6)];
    r.llmCall = async () => ({ program: ["deposit_life", O[3]] });
    const evo = (name, ort) => (st.nexusEvolutionQueue.push({ name, program: ["deposit_life", ort], source: "nexus" }), P._loopNexusUpdate.call(r));
    let g;
    const plan = {
        0: () => evo("probe-a", O[0]),
        5: () => (r.dslRun(["rule", ["field_below", "lebendig", 1.01], ["deposit_life", O[1]], { everySec: 10, ttlSec: 600 }], { source: "nexus" }), (g = st.worldRules[0])),
        40: () => evo("probe-h", O[2]),
        50: () => r.processChatCommand("pflege das land"),
        95: () => (g.disabled = true),
        110: () => r.maybeAnswerWithLlm(W, () => {}),
    };
    const t0 = st.spielZeit;
    for (let s = 0, T = performance.now() / 1000; s <= 150; s += 5) {
        st.spielZeit = t0 + s;
        await (plan[s] || (() => {}))();
        r._tickWorldRules((T += 5));
        stelle(2);
    }
    const fr = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const plan2 = [["nexus", O[0], 1, "(Programm probe-a"], ["rule:nexus", O[1], g.fires, `weil lebendig am Ort niedrig ist (<1.01). (Gesetz Nr. ${g.id} des Nexus`], ["nexus", O[2], 1, "probe-h"], ["llm:grok", O[3], 1, `auf dein Wort „${W}“`], ["human", O[0], 1, "human"]];
    const S = plan2.map(([wer, o, n, soll]) => ({ wer, n, soll, o, welt: wer !== "human", blick: fr.containsPoint(new THREE.Vector3(o[1], o[2], o[3])) }));
    const RI = ["nördlich", "nordöstlich", "östlich", "südöstlich", "südlich", "südwestlich", "westlich", "nordwestlich"];
    const zeilen = st.taten.filter((e) => e.zeile).sort((x, y) => x.gesprochen - y.gesprochen).map((e) => {
        const p = S.find((q) => q.wer === e.wer && (e.wer !== "nexus" || q.soll.includes(e.programm)));
        const [dx, dz] = [p.o[1] - m.x, p.o[3] - m.z];
        const wo = ` — ${Math.round(Math.hypot(dx, dz))} m ${RI[Math.round((Math.atan2(dx, -dz) / Math.PI) * 4 + 8) % 8]} von dir, `;
        const name = { nexus: "Der Nexus ", "rule:nexus": "Ein Gesetz des Nexus ", "llm:grok": "Die KI " }[e.wer];
        const falsch = [wo, p.soll, ...(p.welt && p.blick ? [] : ["(im Blick)"])].filter((x) => !e.zeile.includes(x));
        return { t: e.gesprochen - t0, text: e.zeile, weitere: e.weitere, falsch: e.zeile.startsWith(name) ? falsch : [name, ...falsch] };
    });
    return { ort: [m.x, m.z], deckel, taten, stempel, stimme: { plan: S.map(({ o, ...p }) => p), zeilen, box: document.getElementById("dialogue-box").textContent } };
}

function gleich(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function urteil(S) {
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
    // Die Uhr gehört dem Spieler (`_himmelSchreiber`, gate:wetter-wache): auch ohne Halt stellt der Nexus sie nie.
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
    return rot;
}

hauptLauf(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 180000 });
    await server.zeige(page, 60000);
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state && r.state.player && r.nexus);
    });
    await page.evaluate(AUSGABE_INSTALL);
    const S = await page.evaluate(probe, GESCHICKT);
    await page.close();
    // (T) DIE TAT auf einer frischen Seite (die Welt der Wand oben trägt ihre Bauten, Seelen und Gesetze)
    const tatSeite = await browser.newPage();
    await nullRenderer(tatSeite);
    await server.zeige(tatSeite, 60000);
    await tatSeite.evaluate(() => window.__weltDa((r) => r.state && r.state.rendererReady && r.state.blueprints && r.nexus));
    await tatSeite.evaluate(AUSGABE_INSTALL);
    const T = await tatSeite.evaluate(tatProbe, MESS);
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
    const rot = urteil(S);
    // (T) die Zahlen je Kriterium (`tat-k1 {…}`, `tat-k4 {…}` — die Punkte-Maschine liest sie), die Befunde im Urteil
    const [tu, t, Z] = [tatUrteil(T), T.taten, T.stimme.zeilen];
    for (const z of Z) console.log(`  [${z.t | 0} s] ${z.text}`);
    const k1 = { delta: t.map((x) => x.delta), antwortDb: t.map((x) => +x.antwort?.toFixed(2)), nachbarDb: Math.max(...t.map((x) => Math.abs(x.nachbar))), stempel: T.stempel };
    const k4 = { imBlick: T.stimme.plan.reduce((n, p) => n + (p.welt && p.blick ? p.n : 0), 0), zeilen: Z.length, gedeckt: Z.reduce((n, z) => n + 1 + z.weitere, 0), falsch: Z.reduce((n, z) => n + z.falsch.length, 0) };
    for (const [k, w] of [["K1", k1], ["K4", k4]]) {
        w.gruen = !tu.some((x) => x.startsWith(k));
        console.log(`  ${w.gruen ? "✅" : "❌"} tat-${k.toLowerCase()} ${JSON.stringify(w)}`);
    }
    rot.push(...tu.map((x) => "(T) " + x));
    wandEnde(rot, "unter der Bühne läuft kein Welt-Akt durch, jeder steht beim Namen seiner Quelle; ohne Halt wirkt das Spiel wie immer.");
});

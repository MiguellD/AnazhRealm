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
//   (F) FREI: ohne Halt (Uhr ≥ 0) wirken dieselben Wege wie im Spiel — der Nexus setzt sein Dorf, der Mensch seine Tiere;
//   (Q) QUELLE: `dslEval` liest die Liste und den Halt (`_messHalt` liest die Uhr); jeder Op der DSL hat ein Urteil (Welt-Akt
//       oder benannt frei, die Liste nennt nur Ops, die es gibt); jedes Programm, das der Nexus komponiert (Atom, Programm,
//       Regel), trägt nur Welt-Akte der Liste, das Wetter (sein eigener Schreiber) und die freien Ops;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil der Wache (`weltaktUrteil`) fällt bei jedem
// durchgelaufenen Akt, beim blinden und beim fehlenden Spion rot und bleibt bei Verweigerung grün.
//   node scripts/diag-weltakt-wache.cjs [--selftest]   (npm run gate:weltakt-wache; Port WELTAKT_WACHE_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { AUSGABE_INSTALL, weltaktUrteil, weltaktSelbsttest } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.WELTAKT_WACHE_PORT || 4603);
const root = path.resolve(__dirname, "..");

if (process.argv.includes("--selftest")) {
    console.log("=== WELT-WACHE — Selbsttest des Urteils (ohne Browser) ===");
    const v = weltaktSelbsttest();
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT — das Urteil der Welt-Wache ist blind.");
        process.exit(1);
    }
    console.log("✅ SELBSTTEST GRÜN — durchgelaufene Akte, blinder und fehlender Spion fallen rot; Verweigerung grün.");
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
// Die Welt-Akte, die die Probe schickt — ihr Spion hüllt sie auch, wenn das Spiel keine Liste nennt (dann ist er blind und
// das Urteil ROT, der Täter steht trotzdem beim Namen).
const GESCHICKT = [
    "spawn_village",
    "spawn_creature",
    "spawn_tree",
    "creatures_size_mul",
    "creatures_speed_mul",
    "creatures_color",
    "set_time_of_day",
    "player_speed",
    "player_jump_power",
    "skybox_color",
];

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

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
    aus.frei.mensch = await fenster(wege.mensch);
    window.__buehne();
    aus.ende = { uhr: st.weatherEffectTime };
    // (Q) die Engstelle liest die Liste und den Halt; das Urteil über jeden Op; die Programme des Nexus
    const proto = Object.getPrototypeOf(r);
    const ev = window.__codeOf(proto.dslEval);
    const mh = typeof proto._messHalt === "function" ? window.__codeOf(proto._messHalt) : "";
    aus.engstelleLiest =
        /AnazhRealm\.DSL_WELTAKTE\.includes\(op\)/.test(ev) &&
        /this\._messHalt\(\)/.test(ev) &&
        /this\.state\.weatherEffectTime\s*<\s*0/.test(mh);
    aus.liste = Array.isArray(r.constructor.DSL_WELTAKTE) ? r.constructor.DSL_WELTAKTE.slice() : null;
    aus.ops = Object.keys(r.dslEffects);
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
    if (!(S.frei.mensch.nachher.tiere > S.frei.mensch.vorher.tiere))
        rot.push(`(F) FREI: der Mensch setzt ohne Halt keine Tiere (${JSON.stringify(S.frei.mensch)})`);
    if (!(S.ende.uhr < 0)) rot.push(`(F) die Bühne stellt den Halt nicht wieder her (Uhr ${S.ende.uhr})`);
    if (!S.engstelleLiest)
        rot.push(
            "(Q) QUELLE: `dslEval` liest die Welt-Akte und den Halt nicht (`AnazhRealm.DSL_WELTAKTE.includes(op)` · `this._messHalt()` · `_messHalt` liest `weatherEffectTime < 0`)"
        );
    if (!S.liste) rot.push("(Q) QUELLE: das Spiel nennt keine Welt-Akte (AnazhRealm.DSL_WELTAKTE fehlt)");
    else {
        const ohne = S.ops.filter((o) => !S.liste.includes(o) && !FREI.includes(o));
        if (ohne.length)
            rot.push(
                `(Q) URTEIL: ${ohne.join(", ")} — weder Welt-Akt noch benannt frei (DSL_WELTAKTE oder FREI dieser Wand)`
            );
        const tot = S.liste.filter((o) => !S.ops.includes(o));
        if (tot.length) rot.push(`(Q) URTEIL: DSL_WELTAKTE nennt Ops, die es nicht gibt: ${tot.join(", ")}`);
        const doppelt = S.liste.filter((o) => FREI.includes(o));
        if (doppelt.length) rot.push(`(Q) URTEIL: ${doppelt.join(", ")} steht als Welt-Akt UND frei`);
        const nexusFrei = Object.keys(S.nexusOps).filter((o) => !S.liste.includes(o) && !FREI.includes(o));
        if (nexusFrei.length) rot.push(`(Q) NEXUS: der Nexus komponiert Ops ohne Urteil: ${nexusFrei.join(", ")}`);
    }
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
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
    for (const [n, w] of Object.entries(S.halt)) {
        const u = weltaktUrteil(w.buch);
        const d = Object.keys(w.vorher).filter((k) => !gleich(w.vorher[k], w.nachher[k]));
        console.log(
            `  Halt · ${n.padEnd(10)} ${u.urteil}  Welt ${d.length ? "ändert " + d.map((k) => `${k} ${w.vorher[k]} → ${w.nachher[k]}`).join(", ") : "steht"}; verweigert ${JSON.stringify(u.verweigert)}` +
                (u.taeter.length ? `; Täter: ${u.taeter.join(" · ")}` : "")
        );
    }
    const sm = weltaktUrteil(S.schmuggel.buch);
    console.log(`  Scharf · vorbei   ${sm.urteil}  ${sm.taeter.join(" · ")}`);
    const fz = (w) =>
        Object.keys(w.vorher)
            .filter((k) => !gleich(w.vorher[k], w.nachher[k]))
            .map((k) => `${k} ${w.vorher[k]} → ${w.nachher[k]}`)
            .join(", ");
    console.log(`  Frei · Nexus      ${fz(S.frei.nexus)}`);
    console.log(`  Frei · Mensch     ${fz(S.frei.mensch)}`);
    console.log(
        `  Quelle: dslEval liest Liste und Halt: ${S.engstelleLiest}; ${S.ops.length} Ops, ${S.liste ? S.liste.length : "keine"} Welt-Akte, ${FREI.length} frei; der Nexus komponiert ${Object.keys(S.nexusOps).length} Ops (${Object.keys(S.nexusOps).sort().join(" · ")})`
    );
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

#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wetter-wache.cjs — DIE WACHE VON UHR UND WETTER: Halt heißt Halt (Welle K, 07.10.), und frei gehören Uhr und Wetter dem
// Spieler (Leben-Schau 2, 09.10.).
// Befund 1 (OMEN, V18.534, ein B-Boot von vier): die Wetter-Wache der Bühne hielt die Uhr des Auto-Zugs eingefroren, und das
// Wetter drehte trotzdem sunny → rainy (zweimal der Emotions-Effekt „sorrow → rainy", einmal ein Nexus-Programm). Schnitt: der
// EINE Wetter-Schreiber `_setWeather` verweigert jeden Zug, solange die Uhr unter 0 steht (der Halt der Bühne).
// Befund 2 (Leben-Schau 2, drei Fenster auf der echten Radeon, `artifacts/profiband/leben-schau-2/befund.md` §6 #1): 3 von 3
// Spuren nach 3–6 min Nacht — der Tag dauerte 8 min, zwei Nexus-Gesetze („wenn lebendig > 0,44, dann Tageszeit 0,17 / 0,144")
// warfen die Uhr 30-mal in 160 s, „setze uhrzeit mittag" hielt 1–5 s, „setze wetter sonnig" bis zum nächsten Zug (Regen alle
// 4,7 s), der Tageszeit-Regler zeigte 12:00 bei Welt 01:41. Schnitt: das GESETZ DER SCHREIBER (`_himmelSchreiber`) — die Uhr
// schreibt nur ihr eigener Gang, der Spieler und das Laden (der EINE Uhr-Schreiber `_uhrSetzen`); das Wort des Spielers über
// das Wetter steht, bis er es freigibt; die Welt (Nexus, seine Gesetze, die Emotion, die Wesen) schreibt die Uhr nie und das
// Wetter nie direkt — sie wünscht das nächste Wort des Wetter-Zugs, der im Takt `WETTER_ZUG_SEK` zieht.
// Die Wand (Null-Renderer, echte Welten):
//   (H) HALT: unter der Bühne versucht jeder Schreiber-Weg des Spiels das Wetter zu drehen — Emotion (`updatePlayerEmotions`,
//       sorrow), Nexus (`_loopNexusUpdate`), Gesetz (`_tickWorldRules`), Mensch, Mitspieler (DSL-Quelle `remote:`), Auto-Zug
//       (`_loopWeatherAndGrowth`): das Wetter bleibt „sunny", die Uhr eingefroren, jeder Zug steht im Buch des Wetter-Spions
//       als verweigert beim Namen seiner Quelle;
//   (S) SCHARF: ein roher Schreiber am `_setWeather` vorbei (`state.weather = …`) fällt ROT und steht als ROH im Urteil;
//   (F) FREI: ohne Halt wirkt das Spiel — der Mensch dreht das Wetter, sein Wort hält den Auto-Zug nach 120 s, nach „frei"
//       zieht der Zug weiter;
//   (G) GESETZ (eine frische Welt, das Spiel läuft getaktet mit seinem Nexus, `HIMMEL_MIN` Minuten Spiel-Zeit): der Spieler
//       sagt „setze uhrzeit mittag" und „setze wetter sonnig" (der echte Chat-Pfad); die Täter der Schau schreiben dagegen —
//       die Nexus-Gesetze auf die Uhr (der Zwilling `time_of_day` und `set_time_of_day`) und auf den Regen, die Würfel des
//       Nexus auf Uhr und Sturm, die Emotion sorrow — und JEDER Schreiber steht beim Namen (`himmelUrteil`): die Uhr geht nur
//       ihren Gang im Gesetz der Tag-Länge, das Wetter bleibt sonnig, jeder Täter steht im Buch;
//   (B) BAND: nach „setze wetter frei" schreibt nur der Wetter-Zug, nie schneller als sein Takt, und er zieht das Wort, das
//       die Welt sich wünscht;
//   (R) REGLER: der Tageszeit-Regler der Einstellungen zeigt die Welt-Zeit;
//   (T) TAG: die Tag-Länge einer frischen Welt trägt eine Szene (von Mittag bis Sonnenuntergang ≥ `TAG_SZENE_MINUTEN`), und
//       ein alter Spielstand setzt sie nicht zurück (die Wahl des Spielers lebt bei ihm, der Kopf trägt sie nur für die Taille);
//   (Q) QUELLE: im Stamm schreibt `state.weather` nur `_setWeather` und das Laden (genau zweimal), `state.timeOfDay` nur
//       `_uhrSetzen` (genau einmal), `_setWeather` liest den Halt; der Zwilling `time_of_day` ist fort; kein Würfel des Nexus
//       (4000 Atome, 4000 Gesetze, 4000 Mutationen) trägt einen Uhr-Op;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): die Urteile der Wache (`wetterUrteil`, `himmelUrteil`) fallen bei
// jedem eingeschmuggelten Täter rot — ein Schreiber, hin und zurück, roh, ohne Quelle, die tauende Uhr, ein blinder Spion; der
// Nexus an der Uhr, ein roher Uhr-Schreiber, der Sprung, der lahme Gang, der Zug gegen das Wort, ein fehlender Täter, die Welt,
// die selbst schreibt, der Zug im Galopp, die schweigende Welt — und bleiben bei Bühne, Verweigerung und Wunsch grün.
//   node scripts/diag-wetter-wache.cjs [--selftest]   (npm run gate:wetter-wache; Port WETTER_WACHE_PORT, HIMMEL_MIN)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const {
    AUSGABE_INSTALL,
    wetterUrteil,
    wetterSelbsttest,
    himmelUrteil,
    himmelSelbsttest,
} = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.WETTER_WACHE_PORT || 4602);
// Spiel-Minuten je Fenster (G und B): drei Takte des Wetter-Zugs (120 s), 77 Feuer eines 4,7-s-Gesetzes, 15 Nexus-Evolutionen.
const HIMMEL_MIN = Number(process.env.HIMMEL_MIN || 6);
const SCHRITT_SEK = 0.25;
// Die Szene, wenn das Spiel keine nennt (der alte Stand): die längste Szene der Leben-Schau 2 außer C-8 (A-5 11 min, A-7 9 min,
// C-9 12,3 min — aus den Zeitstempeln der Bilder).
const SZENE_SCHAU_MIN = 15;
const root = path.resolve(__dirname, "..");

if (process.argv.includes("--selftest")) {
    console.log("=== WETTER-WACHE — Selbsttest der Urteile (ohne Browser) ===");
    const v = wetterSelbsttest()
        .map((x) => "wetter: " + x)
        .concat(himmelSelbsttest().map((x) => "himmel: " + x));
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT — ein Urteil der Wache ist blind.");
        process.exit(1);
    }
    console.log(
        "✅ SELBSTTEST GRÜN — Schreiber, roh, tauende Uhr, blinder Spion; Nexus an der Uhr, Sprung, lahmer Gang, Zug gegen das " +
            "Wort, fehlender Täter, die Welt schreibt selbst, Zug im Galopp fallen rot; Bühne, Verweigerung und Wunsch grün."
    );
    process.exit(0);
}

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

// Die Probe im Seiten-Kontext: jeder Schreiber-Weg des Spiels unter der Bühne, der rohe Schmuggel, die freie Welt.
function probe() {
    const r = window.anazhRealm;
    const st = r.state;
    const t = () => performance.now() / 1000;
    const fenster = (tat) => {
        const vor = { wetter: st.weather, uhr: st.weatherEffectTime, seq: window.__wetterBuch().seq };
        tat();
        const b = window.__wetterBuch(vor.seq);
        return {
            vorher: vor.wetter,
            nachher: st.weather,
            uhrVorher: vor.uhr,
            uhrNachher: st.weatherEffectTime,
            buch: b.buch,
        };
    };
    // jeder Schreiber-Weg des Spiels (der echte Code-Pfad, keine Abkürzung)
    const wege = {
        emotion: () => {
            const p = st.player;
            p.emotionLastTick = t();
            p.emotions.sorrow = 1;
            p.emotionLastApply.sorrow = -Infinity;
            r.updatePlayerEmotions(t());
        },
        nexus: () => {
            st.nexusWirk = 1e6;
            st.nexusEvolutionQueue.push({
                name: "wache",
                program: ["repeat", 2, ["weather", "stormy"]],
                source: "nexus",
            });
            r._loopNexusUpdate();
        },
        gesetz: () => {
            r.dslRun(["rule", ["weather_is", "sunny"], ["weather", "rainy"]], { source: "human" });
            r._tickWorldRules(t() + 3600);
        },
        mensch: () => r.dslRun(["weather", "rainy"], { source: "human" }),
        mitspieler: () => r.dslRun(["weather", "stormy"], { source: "remote:peer-wache" }),
        // der Auto-Zug: sein Takt läuft (die Uhr zählt weiter), der Zug fällt nie, solange die Uhr unter 0 steht
        autoZug: () => r._loopWeatherAndGrowth(0.016, t()),
    };
    const aus = { halt: {}, frei: {} };
    window.__buehne();
    for (const [n, w] of Object.entries(wege)) aus.halt[n] = fenster(w);
    // die Gesetze, die die Probe registrierte, fallen wieder (die freie Welt prüft nur den Menschen und den Auto-Zug)
    st.worldRules = (st.worldRules || []).filter(
        (x) => !(x.source === "human" && JSON.stringify(x.effect) === '["weather","rainy"]')
    );
    // (S) der rohe Schreiber am `_setWeather` vorbei
    aus.roh = fenster(() => {
        st.weather = "rainy";
    });
    window.__wetterSetzen("sunny");
    // (F) ohne Halt wirkt das Spiel: der Mensch spricht, sein Wort hält den Zug, „frei" gibt ihn frei
    st.weatherEffectTime = 0;
    aus.frei.mensch = fenster(wege.mensch);
    st.weatherEffectTime = 120.5;
    aus.frei.wortHaelt = fenster(() => r._loopWeatherAndGrowth(0, t()));
    r.dslRun(["weather", "frei"], { source: "human" });
    st.weatherEffectTime = 120.5;
    aus.frei.autoZug = fenster(() => r._loopWeatherAndGrowth(0, t()));
    window.__buehne();
    aus.ende = { wetter: st.weather, uhr: st.weatherEffectTime };
    // (Q) der Halt in der Engstelle — direkt oder über den EINEN Leser des Halts (`_messHalt`, 0710-7: ihn liest auch die
    // Engstelle der Welt-Akte)
    const proto = Object.getPrototypeOf(r);
    const sw = window.__codeOf(proto._setWeather);
    const mh = typeof proto._messHalt === "function" ? window.__codeOf(proto._messHalt) : "";
    aus.engstelleLiest =
        /this\.state\.weatherEffectTime\s*<\s*0/.test(sw) ||
        (/this\._messHalt\(\)/.test(sw) && /this\.state\.weatherEffectTime\s*<\s*0/.test(mh));
    // (Q) der EINE Uhr-Schreiber schreibt die Uhr, der Zwilling `time_of_day` ist fort
    aus.uhrSchreiber =
        typeof proto._uhrSetzen === "function" &&
        /this\.state\.timeOfDay\s*=(?!=)/.test(window.__codeOf(proto._uhrSetzen));
    aus.zwilling = typeof r.dslEffects.time_of_day === "function";
    // (Q) die Würfel des Nexus: kein Atom, kein Gesetz, keine Mutation trägt einen Uhr-Op
    const uhrOps = new Set(["time_of_day", "set_time_of_day"]);
    const rng = r._samenStrom(4711);
    const N = 4000;
    const wuerfe = { atome: 0, gesetze: 0, mutationen: 0, n: N };
    for (let i = 0; i < N; i++) {
        if (r._dslContainsAnyOp(r.dslComposeAtomic(rng), uhrOps)) wuerfe.atome++;
        if (r._dslContainsAnyOp(r.dslComposeRule(rng), uhrOps)) wuerfe.gesetze++;
        const m = r.dslMutate(["rule", ["random_chance", 1], ["weather", "rainy"], { everySec: 5 }], rng);
        if (r._dslContainsAnyOp(m, uhrOps)) wuerfe.mutationen++;
    }
    aus.wuerfe = wuerfe;
    return aus;
}

// Die Himmels-Probe im Seiten-Kontext (eine FRISCHE Welt): das Spiel läuft getaktet (`_gameLoopTick`, Spiel-Zeit in Schritten
// von `o.schrittSek`), der Nexus und seine Gesetze, die Emotion und der Wetter-Zug laufen mit. Vorher spricht der Spieler.
function himmelProbe(o) {
    const r = window.anazhRealm;
    const st = r.state;
    const aus = {};
    // (T) die Tag-Länge einer frischen Welt, und was ein alter Spielstand (8-min-Tag, wie jeder Stand bis zur Schau) aus
    // ihr macht — das Laden des echten Restore-Wegs (`_loadStateRestoreSoulAndAtmosphere`)
    const tagMin = st.dayLengthMinutes;
    let alterStand = null;
    try {
        r._loadStateRestoreSoulAndAtmosphere({ dayLengthMinutes: 8, timeOfDay: st.timeOfDay });
        alterStand = st.dayLengthMinutes;
    } catch (e) {
        alterStand = "Fehler: " + e.message;
    }
    st.dayLengthMinutes = tagMin;
    aus.tag = {
        tagMin,
        standard: r.constructor.DAY_LENGTH_DEFAULT_MINUTES,
        szene: r.constructor.TAG_SZENE_MINUTEN,
        alterStand,
    };
    st.renderer.setAnimationLoop(null);
    const U = window.__uhrSpion();
    const W = window.__wetterSpion();
    const T0 = performance.now();
    let k = 0;
    window.__taktZeit = 0;
    const lauf = (sek) => {
        const n = Math.round(sek / o.schrittSek);
        for (let i = 0; i < n; i++) {
            k++;
            window.__taktZeit = k * o.schrittSek;
            // ein trauriger Spieler: die Emotion sorrow wirkt auf das Wetter (ihr Weg der Schau)
            st.player.emotions.sorrow = 1;
            r._gameLoopTick(T0 + k * o.schrittSek * 1000);
        }
        return n;
    };
    const fenster = (phase, sek, wort, freiAb, taeter) => {
        const sU = U.seq,
            sW = W.seq,
            g0 = Object.assign({}, U.gang),
            start = st.timeOfDay;
        const n = lauf(sek);
        const g = U.gang;
        return {
            phase,
            takt: { schritte: n, schrittSek: o.schrittSek, tagMin: st.dayLengthMinutes },
            uhr: {
                buch: U.buch.filter((e) => e.seq > sU),
                gang: { n: g.n - g0.n, weg: g.weg - g0.weg, max: g.max },
                start,
                ende: st.timeOfDay,
            },
            wetter: { buch: W.buch.filter((e) => e.seq > sW), wort, ende: st.weather, freiAb },
            zugSek: r.constructor.WETTER_ZUG_SEK || 120,
            taeter,
        };
    };
    lauf(2);
    // DER SPIELER SPRICHT (der echte Chat-Pfad)
    r.processChatCommand("setze uhrzeit mittag");
    r.processChatCommand("setze wetter sonnig");
    aus.wort = { uhr: st.timeOfDay, wetter: st.weather };
    // DIE TÄTER DER SCHAU: Nexus-Gesetze auf die Uhr (das Wort der Schau „Tageszeit 0,17" als der Zwilling `time_of_day` und
    // als `set_time_of_day`) und auf den Regen (alle 4,7 s), die Würfel des Nexus auf Uhr und Sturm
    st.nexusWirk = 1e6;
    const q = st.nexusEvolutionQueue;
    const regel = (wirkung) => ["rule", ["random_chance", 1], wirkung, { everySec: 4.7, ttlSec: 3600 }];
    q.push({ name: "schau-gesetz-uhr", program: regel(["time_of_day", 0.17]), source: "nexus" });
    q.push({ name: "schau-gesetz-uhr2", program: regel(["set_time_of_day", 0.144]), source: "nexus" });
    q.push({ name: "schau-gesetz-regen", program: regel(["weather", "rainy"]), source: "nexus" });
    q.push({ name: "schau-wurf-uhr", program: ["set_time_of_day", 0.25], source: "nexus" });
    q.push({ name: "schau-wurf-uhr2", program: ["time_of_day", 0.06], source: "nexus" });
    q.push({ name: "schau-wurf-sturm", program: ["weather", "stormy"], source: "nexus" });
    const gesetzUhr = {
        name: "Nexus-Gesetz Uhr (Schau 04:05)",
        wo: "uhr",
        quelle: "rule:nexus",
        stapel: "_tickWorldRules",
    };
    const regen = {
        name: "Nexus-Gesetz Regen (alle 4,7 s)",
        wo: "wetter",
        quelle: "rule:nexus",
        stapel: "_tickWorldRules",
    };
    const trauer = {
        name: "Emotion sorrow → Regen",
        wo: "wetter",
        quelle: "emotion:sorrow",
        stapel: "updatePlayerEmotions",
    };
    aus.gesetz = fenster("gesetz", o.fensterSek, "sunny", null, [
        gesetzUhr,
        { name: "Nexus-Wurf Uhr", wo: "uhr", quelle: "nexus", stapel: "_loopNexusUpdate" },
        regen,
        trauer,
        { name: "Nexus-Wurf Sturm", wo: "wetter", quelle: "nexus", stapel: "_loopNexusUpdate" },
    ]);
    // (R) der Regler der Einstellungen
    const sl = document.getElementById("slider-timeofday");
    const slv = document.getElementById("slider-timeofday-val");
    aus.regler = {
        wert: sl ? Number(sl.value) : null,
        text: slv ? slv.textContent : null,
        welt: st.timeOfDay,
        label: r._timeOfDayLabel(st.timeOfDay).replace(/^[^\s]+\s/, ""),
    };
    // (B) DAS BAND: der Spieler gibt das Wetter frei
    r.processChatCommand("setze wetter frei");
    aus.frei = fenster("frei", o.fensterSek, null, window.__taktZeit, [gesetzUhr, regen, trauer]);
    window.__taktZeit = undefined;
    return aus;
}

const hm = (t) => {
    const x = (((Number(t) % 1) + 1) % 1) * 24;
    const h = Math.floor(x);
    return `${String(h).padStart(2, "0")}:${String(Math.floor((x - h) * 60)).padStart(2, "0")}`;
};

// Die Täter eines Urteils je Tat gezählt: Uhrzeiten und Wetter-Worte fallen aus dem Schlüssel, das erste Beispiel bleibt.
function taeterGezaehlt(liste) {
    const g = new Map();
    for (const x of liste) {
        const k = x.replace(/\d\d:\d\d/g, "hh:mm").replace(/\b(sunny|rainy|stormy) → (sunny|rainy|stormy)\b/g, "… → …");
        const e = g.get(k);
        if (e) e[0]++;
        else g.set(k, [1, x]);
    }
    return [...g.values()];
}

function urteil(S, H, quelle, pageErrors) {
    const rot = [];
    const SOLL_QUELLE = {
        emotion: "emotion:sorrow",
        nexus: "nexus",
        gesetz: "rule:human",
        mensch: "human",
        mitspieler: "remote:peer-wache",
    };
    for (const [n, w] of Object.entries(S.halt)) {
        const u = wetterUrteil(w);
        if (u.urteil !== "GRUEN") rot.push(`(H) HALT ${n}: ${u.taeter.join(" · ")}`);
        if (w.nachher !== "sunny") rot.push(`(H) HALT ${n}: das Wetter ist „${w.nachher}" unter der Bühne`);
        const soll = SOLL_QUELLE[n];
        if (soll && !Object.keys(u.verweigert).some((k) => k.startsWith(soll + " → ")))
            rot.push(
                `(H) HALT ${n}: kein verweigerter Zug der Quelle „${soll}" im Buch (${JSON.stringify(u.verweigert)}) — der Weg schrieb nicht oder der Spion ist blind`
            );
    }
    const roh = wetterUrteil(S.roh);
    if (roh.urteil !== "ROT" || !roh.taeter.some((t) => /ROH am _setWeather vorbei/.test(t)))
        rot.push(
            `(S) SCHARF: der rohe Schreiber fällt nicht rot beim Namen (${roh.urteil}: ${roh.taeter.join(" · ")})`
        );
    if (S.frei.mensch.nachher !== "rainy")
        rot.push(`(F) FREI: der Mensch dreht das Wetter ohne Halt nicht (${S.frei.mensch.nachher})`);
    if (S.frei.wortHaelt.nachher !== S.frei.wortHaelt.vorher)
        rot.push(
            `(F) FREI: der Auto-Zug dreht das Wort des Spielers nach 120 s (${S.frei.wortHaelt.vorher} → ${S.frei.wortHaelt.nachher})`
        );
    if (S.frei.autoZug.nachher === S.frei.autoZug.vorher)
        rot.push(`(F) FREI: nach „frei" zieht der Auto-Zug nach 120 s nicht weiter (${S.frei.autoZug.nachher})`);
    if (S.ende.wetter !== "sunny" || !(S.ende.uhr < 0))
        rot.push(`(F) die Bühne stellt den Halt nicht wieder her (${JSON.stringify(S.ende)})`);
    if (!S.engstelleLiest)
        rot.push("(Q) QUELLE: `_setWeather` liest den Halt nicht (`this.state.weatherEffectTime < 0`)");
    if (quelle.wetter.n !== 2)
        rot.push(
            `(Q) QUELLE: \`this.state.weather =\` steht ${quelle.wetter.n}× im Stamm (soll 2: _setWeather und das Laden) — ein Schreiber am EINEN Schreiber vorbei: ${quelle.wetter.orte.join(", ")}`
        );
    if (quelle.uhr.n !== 1 || !S.uhrSchreiber)
        rot.push(
            `(Q) QUELLE: \`this.state.timeOfDay =\` steht ${quelle.uhr.n}× im Stamm (soll 1: der EINE Uhr-Schreiber \`_uhrSetzen\`${S.uhrSchreiber ? "" : " — es gibt ihn nicht"}): ${quelle.uhr.orte.join(", ")}`
        );
    if (S.zwilling) rot.push("(Q) QUELLE: der Zwilling `time_of_day` schreibt die Uhr neben `set_time_of_day`");
    const w = S.wuerfe;
    if (w.atome || w.gesetze || w.mutationen)
        rot.push(
            `(Q) WÜRFEL: der Nexus würfelt die Uhr — ${w.atome} von ${w.n} Atomen, ${w.gesetze} von ${w.n} Gesetzen, ${w.mutationen} von ${w.n} Mutationen tragen einen Uhr-Op`
        );
    // (G) und (B) — das Urteil des Himmels, je Täter gezählt (dieselbe Tat zu anderer Stunde ist derselbe Täter)
    for (const f of ["gesetz", "frei"]) {
        const u = himmelUrteil(H[f]);
        for (const [n, x] of taeterGezaehlt(u.taeter)) rot.push(`(${f === "gesetz" ? "G" : "B"}) ${n}× ${x}`);
    }
    if (H.wort.wetter !== "sunny" || Math.abs(H.wort.uhr - 0.5) > 1e-9)
        rot.push(`(G) der Satz des Spielers wirkt nicht (Uhr ${hm(H.wort.uhr)}, Wetter ${H.wort.wetter})`);
    // (R) der Regler zeigt die Welt-Zeit
    const R = H.regler;
    if (R.wert == null) rot.push("(R) REGLER: #slider-timeofday fehlt");
    else if (Math.abs(R.wert - R.welt * 1000) > 1.5 || R.text !== R.label)
        rot.push(`(R) REGLER: der Tageszeit-Regler zeigt ${R.text} (${R.wert}), die Welt steht bei ${R.label}`);
    // (T) die Tag-Länge trägt eine Szene, ein alter Spielstand setzt sie nicht zurück
    const T = H.tag;
    const szene = Number.isFinite(T.szene) ? T.szene : SZENE_SCHAU_MIN;
    if (!(0.25 * T.tagMin >= szene))
        rot.push(
            `(T) TAG: ein Tag von ${T.tagMin} min trägt von Mittag bis Sonnenuntergang ${(0.25 * T.tagMin).toFixed(1)} min — die Szene braucht ${szene} min`
        );
    if (!Number.isFinite(T.szene)) rot.push("(T) TAG: das Spiel nennt die Szene nicht (`TAG_SZENE_MINUTEN`)");
    if (T.alterStand !== T.tagMin)
        rot.push(
            `(T) TAG: ein alter Spielstand (8-min-Tag) setzt die Tag-Länge auf ${T.alterStand} — er hält den alten Tag fest`
        );
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

async function boot(browser, pageErrors) {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        window.__codeOf = (fnOrSrc) =>
            String(fnOrSrc)
                .replace(/\/\/.*$/gm, "")
                .replace(/\/\*[\s\S]*?\*\//g, "");
    });
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
    return page;
}

(async () => {
    // (Q) der Stamm: wer schreibt `this.state.weather` und `this.state.timeOfDay` (Kommentare zählen nicht)
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8").split("\n");
    const quelle = { wetter: { n: 0, orte: [] }, uhr: { n: 0, orte: [] } };
    stamm.forEach((z, i) => {
        const code = z.replace(/\/\/.*$/, "");
        if (/this\.state\.weather\s*=(?!=)/.test(code)) quelle.wetter.orte.push(`Zeile ${i + 1}`);
        if (/this\.state\.timeOfDay\s*=(?!=)/.test(code)) quelle.uhr.orte.push(`Zeile ${i + 1}`);
    });
    quelle.wetter.n = quelle.wetter.orte.length;
    quelle.uhr.n = quelle.uhr.orte.length;

    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 900000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const pageErrors = [];
    const page = await boot(browser, pageErrors);
    const S = await page.evaluate(probe);
    await page.close();
    // (G)(B)(R)(T) in einer FRISCHEN Welt: die Probe oben hat Gesetze, Bühne und Wort hinterlassen
    const page2 = await boot(browser, pageErrors);
    const t0 = Date.now();
    const H = await page2.evaluate(himmelProbe, { schrittSek: SCHRITT_SEK, fensterSek: HIMMEL_MIN * 60 });
    const laufS = (Date.now() - t0) / 1000;
    await browser.close();
    server.close();

    console.log("=== DIE WACHE VON UHR UND WETTER — Halt heißt Halt, frei gehören sie dem Spieler (Null-Renderer) ===");
    for (const [n, w] of Object.entries(S.halt)) {
        const u = wetterUrteil(w);
        console.log(
            `  Halt · ${n.padEnd(10)} ${u.urteil}  ${w.vorher} → ${w.nachher}, Uhr ${Math.round(w.uhrNachher)}; verweigert ${JSON.stringify(u.verweigert)}` +
                (u.taeter.length ? `; Täter: ${u.taeter.join(" · ")}` : "")
        );
    }
    const roh = wetterUrteil(S.roh);
    console.log(`  Scharf · roh      ${roh.urteil}  ${roh.taeter.join(" · ")}`);
    console.log(`  Frei · Mensch     ${S.frei.mensch.vorher} → ${S.frei.mensch.nachher}`);
    console.log(`  Frei · Wort hält  ${S.frei.wortHaelt.vorher} → ${S.frei.wortHaelt.nachher} (Auto-Zug nach 120 s)`);
    console.log(`  Frei · Auto-Zug   ${S.frei.autoZug.vorher} → ${S.frei.autoZug.nachher} (nach „frei")`);
    console.log(
        `  Quelle: \`this.state.weather =\` ${quelle.wetter.n}× (${quelle.wetter.orte.join(", ")}), \`this.state.timeOfDay =\` ` +
            `${quelle.uhr.n}× (${quelle.uhr.orte.join(", ")}); _setWeather liest den Halt: ${S.engstelleLiest}; _uhrSetzen: ${S.uhrSchreiber}; Zwilling time_of_day: ${S.zwilling}`
    );
    console.log(
        `  Würfel: Uhr-Ops in ${S.wuerfe.atome}/${S.wuerfe.n} Atomen, ${S.wuerfe.gesetze}/${S.wuerfe.n} Gesetzen, ${S.wuerfe.mutationen}/${S.wuerfe.n} Mutationen`
    );
    console.log(
        `  Tag: ${H.tag.tagMin} min (Standard ${H.tag.standard}, Szene ${H.tag.szene ?? `– (Schau ${SZENE_SCHAU_MIN})`}), Mittag → Sonnenuntergang ${(0.25 * H.tag.tagMin).toFixed(1)} min; nach einem alten Stand (8 min): ${H.tag.alterStand} min`
    );
    console.log(
        `  Wort des Spielers: Uhr ${hm(H.wort.uhr)}, Wetter ${H.wort.wetter} (getaktet ${HIMMEL_MIN} min je Fenster, ${laufS.toFixed(1)} s Wanduhr)`
    );
    for (const f of ["gesetz", "frei"]) {
        const g = H[f];
        const u = himmelUrteil(g);
        const uSp = g.uhr.buch.filter((e) => e.art !== "verweigert").length;
        const wSp = g.wetter.buch.filter((e) => e.art !== "verweigert" && e.art !== "gewuenscht").length;
        console.log(
            `  ${f === "gesetz" ? "Gesetz" : "Band  "} · ${u.urteil}  Uhr ${hm(g.uhr.start)} → ${hm(g.uhr.ende)} (Gang ${(g.uhr.gang.weg * g.takt.tagMin * 60).toFixed(1)} s in ${g.takt.schritte} Takten; ${uSp} fremde Schreiber), Wetter ${f === "gesetz" ? g.wetter.wort : "frei"} → ${g.wetter.ende} (${wSp} Schreiber, ${u.zuege} Züge)`
        );
        console.log(`           verweigert ${JSON.stringify(u.verweigert)}`);
        if (f === "frei") console.log(`           gewünscht ${JSON.stringify(u.gewuenscht)}`);
        for (const [n, x] of taeterGezaehlt(u.taeter)) console.log(`           Täter ${n}×: ${x}`);
    }
    console.log(`  Regler: ${H.regler.text} (${H.regler.wert}) bei Welt ${H.regler.label}`);
    const rot = urteil(S, H, quelle, pageErrors);
    if (rot.length) {
        console.error(`\nROT (${rot.length}):`);
        for (const e of rot.slice(0, 60)) console.error("  • " + e);
        if (rot.length > 60) console.error(`  … und ${rot.length - 60} weitere`);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — unter der Bühne dreht kein Schreiber das Wetter; frei gehen Uhr und Wetter nach dem Wort des Spielers, die Welt" +
            " wünscht nur, jeder Schreiber steht beim Namen."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Wetter-Wache-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

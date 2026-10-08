#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wetter-wache.cjs — HALT HEISST HALT (Welle K, 07.10.). Befund (OMEN, V18.534, ein B-Boot von vier): die Wetter-Wache der
// Bühne hielt die Uhr des Auto-Zugs eingefroren, und das Wetter drehte trotzdem sunny → rainy. Gemessen an der Mess-Wiese
// (Radeon, `werkbank lauf 240 --tiere frei`, alter Stand): drei Züge in vier Minuten — zweimal der Emotions-Effekt „sorrow →
// rainy" (`updatePlayerEmotions` ← trigger ← dslRun), einmal ein Nexus-Programm (`_loopNexusUpdate` ← dslRun ← repeat ←
// random). Die Wache hielt nur EINEN Schreiber (den Auto-Zug); jeder andere ging durch.
// Der Schnitt liegt in der Engstelle: der EINE Wetter-Schreiber `_setWeather` verweigert jeden Zug, solange die Uhr unter 0
// steht (der Halt der Bühne, scripts/lib/ausgabe-aufnahme.cjs); im Spiel zählt die Uhr von 0 aufwärts — das Spiel bleibt,
// wie es ist. Die Wand (Null-Renderer, eine echte Welt):
//   (H) HALT: unter der Bühne versucht jeder Schreiber-Weg des Spiels das Wetter zu drehen — Emotion (`updatePlayerEmotions`,
//       sorrow), Nexus (`_loopNexusUpdate`), Gesetz (`_tickWorldRules`), Mensch, Mitspieler (DSL-Quelle `remote:`), Auto-Zug
//       (`_loopWeatherAndGrowth`): das Wetter bleibt „sunny", die Uhr eingefroren, jeder Zug steht im Buch des Wetter-Spions
//       als verweigert beim Namen seiner Quelle;
//   (S) SCHARF: ein roher Schreiber am `_setWeather` vorbei (`state.weather = …`) fällt ROT und steht als ROH im Urteil;
//   (F) FREI: ohne Halt (Uhr ≥ 0) wirken dieselben Wege wie im Spiel — der Mensch dreht das Wetter, der Auto-Zug zieht nach
//       120 s weiter;
//   (Q) QUELLE: im Stamm schreibt `state.weather` nur `_setWeather` und das Laden eines Spielstands (`this.state.weather =`
//       genau zweimal), und `_setWeather` liest den Halt;
//   (P) kein Page-Error.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): das Urteil der Wache (`wetterUrteil`) fällt bei jedem Täter rot —
// ein Schreiber, hin und zurück, roh, der alte Stand ohne Quelle (Name aus dem Stapel), die tauende Uhr, ein blinder Spion —
// und bleibt bei Bühne und Verweigerung grün.
//   node scripts/diag-wetter-wache.cjs [--selftest]   (npm run gate:wetter-wache; Port WETTER_WACHE_PORT)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { AUSGABE_INSTALL, wetterUrteil, wetterSelbsttest } = require("./lib/ausgabe-aufnahme.cjs");

const PORT = Number(process.env.WETTER_WACHE_PORT || 4602);
const root = path.resolve(__dirname, "..");

if (process.argv.includes("--selftest")) {
    console.log("=== WETTER-WACHE — Selbsttest des Urteils (ohne Browser) ===");
    const v = wetterSelbsttest();
    for (const x of v) console.log("  ❌ " + x);
    if (v.length) {
        console.log("\n❌ SELBSTTEST ROT — das Urteil der Wetter-Wache ist blind.");
        process.exit(1);
    }
    console.log(
        "✅ SELBSTTEST GRÜN — Schreiber, roh, tauende Uhr und blinder Spion fallen rot; Bühne und Verweigerung grün."
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
    // (F) ohne Halt wirken die Wege wie im Spiel
    st.weatherEffectTime = 0;
    aus.frei.mensch = fenster(wege.mensch);
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
    return aus;
}

function urteil(S, quelle, pageErrors) {
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
    if (S.frei.autoZug.nachher === S.frei.autoZug.vorher)
        rot.push(`(F) FREI: der Auto-Zug zieht ohne Halt nach 120 s nicht weiter (${S.frei.autoZug.nachher})`);
    if (S.ende.wetter !== "sunny" || !(S.ende.uhr < 0))
        rot.push(`(F) die Bühne stellt den Halt nicht wieder her (${JSON.stringify(S.ende)})`);
    if (!S.engstelleLiest)
        rot.push("(Q) QUELLE: `_setWeather` liest den Halt nicht (`this.state.weatherEffectTime < 0`)");
    if (quelle.schreiber !== 2)
        rot.push(
            `(Q) QUELLE: \`this.state.weather =\` steht ${quelle.schreiber}× im Stamm (soll 2: _setWeather und das Laden) — ein Schreiber am EINEN Schreiber vorbei: ${quelle.orte.join(", ")}`
        );
    for (const e of pageErrors) rot.push(`(P) PAGE-ERROR: ${e}`);
    return rot;
}

(async () => {
    // (Q) der Stamm: wer schreibt `this.state.weather` (Kommentare zählen nicht)
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8").split("\n");
    const orte = [];
    stamm.forEach((z, i) => {
        const code = z.replace(/\/\/.*$/, "");
        if (/this\.state\.weather\s*=(?!=)/.test(code)) orte.push(`Zeile ${i + 1}`);
    });
    const quelle = { schreiber: orte.length, orte };

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
    const S = await page.evaluate(probe);
    await browser.close();
    server.close();

    console.log("=== DIE WETTER-WACHE — Halt heißt Halt (Null-Renderer, eine echte Welt) ===");
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
    console.log(`  Frei · Auto-Zug   ${S.frei.autoZug.vorher} → ${S.frei.autoZug.nachher}`);
    console.log(
        `  Quelle: \`this.state.weather =\` ${quelle.schreiber}× (${quelle.orte.join(", ")}), _setWeather liest den Halt: ${S.engstelleLiest}`
    );
    const rot = urteil(S, quelle, pageErrors);
    if (rot.length) {
        console.error("\nROT:");
        for (const e of rot) console.error("  • " + e);
        process.exit(1);
    }
    console.log(
        "\nGRÜN — unter der Bühne dreht kein Schreiber das Wetter, jeder steht beim Namen; ohne Halt wirkt das Spiel wie immer."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Wetter-Wache-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});

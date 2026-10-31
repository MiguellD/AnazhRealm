#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-wetter-wache.cjs — DIE WACHE VON UHR UND WETTER: Halt heißt Halt, frei gehören Uhr und Wetter dem Spieler, und das
// Wetter ist eine Funktion von Saat, Ort und Spiel-Zeit. Der EINE Wetter-Schreiber `_setWeather` verweigert jeden Zug unter der
// Bühne (Uhr < 0); das GESETZ DER SCHREIBER (`_himmelSchreiber`): die Uhr schreiben ihr Gang, der Spieler und das Laden
// (`_uhrSetzen`), das Wort des Spielers steht bis „frei", die Welt wünscht nur — der Zug zieht im Takt `WETTER_ZUG_SEK` ihren
// Wunsch oder die Front am Ort. Die Wand (Null-Renderer, echte Welten):
//   (H) HALT: unter der Bühne dreht kein Weg das Wetter (Emotion, Nexus, Gesetz, Mensch, Mitspieler, Zug), jeder steht beim
//       Namen; (S) SCHARF: ein roher Schreiber am `_setWeather` vorbei fällt ROT;
//   (Z) SAAT: frei zieht der Zug in 20 min Spiel-Zeit (Ereignis-Takte) je Saat und Ort dieselbe Folge, welche Wanduhr gilt;
//   (F) FRONT im Zug: Regen an A bei trockenem B (3 km windab) ≥ 20 % der Zeit, Lag = Abstand ÷ Zug ±20 %, alle fünf Zeilen von
//       WX_GESETZ erreichbar, der Sturm des Kerns (phyto-core wetterAt) zieht den Zug der Welt und das Wetterspiel des Labors;
//   (G) GESETZ: eine frische Welt läuft `HIMMEL_MIN` Minuten getaktet — Nexus, Emotion und ein Wesen im Schöpfer-Modus gegen das
//       Wort des Spielers, jeder Täter beim Namen (`himmelUrteil`); (B) BAND: frei schreibt nur der Zug, nie schneller als sein
//       Takt; (R) REGLER zeigt die Welt-Zeit; (T) TAG trägt eine Szene, ein alter Stand setzt ihn nicht zurück; (Q) QUELLE: kein
//       Wurf des Nexus trägt einen Uhr-Op; (U) UHR (A9): die Bühne hält NUR die Bild-Uhr, jeder Leser steht mit ihr; (P) kein
//       Page-Error — der EINE Sammler (welt-boot) macht den Lauf ROT mit Namen.
// SELBSTTEST (--selftest, ohne Browser, in `npm run check`): jedes Urteil fällt bei jedem eingeschmuggelten Täter rot und bleibt
// bei Bühne, Verweigerung und Wunsch grün.
//   node scripts/diag-wetter-wache.cjs [--selftest]   (npm run gate:wetter-wache; Port WETTER_WACHE_PORT, HIMMEL_MIN)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, starteBrowser, nullRenderer, hauptLauf, selbsttestEnde, wandEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");
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
// Der Takt des Wesens im Schöpfer-Modus (Spiel-Sekunden): sechs Vorschläge je Fenster, zwei je Takt des Wetter-Zugs.
const WESEN_SEK = 60;

if (SELBSTTEST) {
    console.log("=== WETTER-WACHE — Selbsttest der Urteile (ohne Browser) ===");
    const v = wetterSelbsttest()
        .map((x) => "wetter: " + x)
        .concat(himmelSelbsttest().map((x) => "himmel: " + x));
    const U = (b, n, ohne) => {
        const vor = { himmel: 2, wind: 2, böe: 1.1, wasser: ohne === "T" ? 3 : 2 };
        delete vor[ohne];
        return { T: 2, vor, nach: Object.assign({}, vor, { wind: b }), verweigert: n, wort: ohne === "wort" ? 2 : 3 };
    };
    if (
        uhrRot(U(2, 3)).length ||
        uhrRot(U(2.5, 3)).length !== 1 ||
        uhrRot(U(2, 0)).length !== 1 ||
        !uhrRot(U(2, 3, "himmel")).length ||
        uhrRot(U(2, 3, "T")).length !== 1 ||
        uhrRot(U(2, 3, "wort")).length !== 1
    )
        v.push(
            "uhr: die stehende Uhr ist nicht grün, der laufende Leser, der stumme Loop, der fehlende, der Leser neben T oder das stille Wort nicht rot"
        );
    const Z = (...f) => ({ zuege: 2, laeufe: f.map((x, i) => [`L${i}`, { folge: x, fade: wechsel(x) }]) });
    const [g, s, h] = ["rainy sunny", "stormy sunny", "sunny cloudy"];
    const stumm = Z(g, g, h, h, s);
    stumm.laeufe[2][1].fade = 0;
    if (
        saatRot(Z(g, g, h, h, s)).length ||
        saatRot(Z(g, s, h, h, s)).length !== 1 ||
        saatRot(Z(g, g, h, h, g)).length !== 1 ||
        saatRot(Z(g, g, g, g, s)).length !== 1 ||
        saatRot(Z(g, g, "rainy", "rainy", s)).length !== 2 ||
        saatRot(Z("sunny sunny", "sunny sunny", h, h, s)).length !== 2 ||
        saatRot(stumm).length !== 1
    )
        v.push("saat: die Folge, Wanduhr, blinde Saat, blinder Ort, stehende Front oder stummer Zug");
    const F = (o) => frontRot(Object.assign({ nassTrocken: 0.3, lag: 270, soll: 273, worte: [1, 2, 3, 4, 5], welt: "stormy", labor: "sturm" }, o));
    if (
        F({}).length ||
        [{ nassTrocken: 0.1 }, { lag: 600 }, { worte: [1, 2, 3] }, { welt: "sunny" }, { labor: "klar" }].some((o) => F(o).length !== 1)
    )
        v.push("front: die Front, trockener Ort, falscher Lag, fehlende Zeile oder blinde Mutation");
    selbsttestEnde(v, "jeder eingeschmuggelte Täter fällt rot; Bühne, Verweigerung und Wunsch grün.");
    process.exit(0);
}

const server = statikServer();

// Die Probe im Seiten-Kontext: jeder Schreiber-Weg des Spiels unter der Bühne, der rohe Schmuggel, die freie Welt.
function probe(o) {
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
            st.player.emotions.sorrow = 1;
            r._tickWorldRules(t() + 3600);
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
    const aus = { halt: {} };
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
    // (Z) je Lauf (Saat, Ort d m windab, Wanduhr-Gang je Takt in ms) `zuege` Takte des Zugs; je Takt springt die Wetter-Uhr um
    // WETTER_ZUG_SEK (Ereignis-Takte), die Folge ist das Wort nach jedem Takt
    const wm = st.worldMeta || (st.worldMeta = {});
    const pm = st.playerMesh.position;
    const [saat0, pn, x0, y0, uhr0, Z] = [wm.seed, performance.now, pm.x, pm.z, st.spielZeit, r.constructor.WETTER_ZUG_SEK];
    const P = globalThis.__phytoCore;
    const zug = (saat, d) => {
        const g = P.windGrund(saat);
        [wm.seed, pm.x, pm.z, st.spielZeit] = [saat, x0 + d * g.x, y0 + d * g.z, 0];
        window.__wetterSetzen("sunny");
        r.dslRun(["weather", "frei"], { source: "human" });
    };
    const lauf = ([saat, d, uhr]) => {
        zug(saat, d);
        const [folge, s0] = [[], window.__wetterSpion().seq];
        for (let i = 0; i < o.zuege; i++) {
            performance.now = () => pn.call(performance) + uhr * (i + 1);
            [st.spielZeit, st.weatherEffectTime] = [Z * (i + 1), 0];
            r._loopWeatherAndGrowth(0);
            folge.push(st.weather);
            st.weatherTransition = null;
        }
        performance.now = pn;
        const buch = window.__wetterBuch(s0).buch.filter((e) => e.quelle === "auto-zug" && e.art === "schreiber");
        return { folge: folge.join(" "), fade: buch.length };
    };
    aus.saat = { zuege: o.zuege, laeufe: o.laeufe.map((l) => [l.join(" · "), lauf(l)]) };
    // (F) DIE FRONT im Zug der Welt: A = der erste Lauf, B = derselbe 3 km windab; der Lag ist die Verschiebung in Takten, um
    // die B die Folge von A am besten wiederholt; die Worte des Kerns an 4 096 Orten; der Sturm des Kerns im Zug
    const [A, B] = [0, 2].map((i) => aus.saat.laeufe[i][1].folge.split(" "));
    const gleich = (k) => A.filter((w, i) => w === B[i + k]).length / (A.length - k);
    let lag = 0;
    for (let k = 1; k < A.length / 2; k++) if (gleich(k) > gleich(lag)) lag = k;
    const worte = new Set(Array.from({ length: 4096 }, (_, i) => r._wetterAmOrt((i % 64) * 977, (i >> 6) * 977, i * 41)));
    const kern = P.wetterAt;
    P.wetterAt = () => ({ zeile: "sturm" });
    zug("saat-a", 0);
    [st.spielZeit, st.weatherEffectTime] = [Z, 0];
    r._loopWeatherAndGrowth(0);
    P.wetterAt = kern;
    const nass = (w) => r._weatherIsWet(w);
    aus.front = { nassTrocken: A.filter((w, i) => nass(w) && !nass(B[i])).length / A.length, lag: Z * lag, worte: [...worte] };
    Object.assign(aus.front, { soll: 3000 / P.WIND_FELD.front.zugMS, welt: st.weather });
    st.weatherTransition = null;
    [wm.seed, pm.x, pm.z, st.spielZeit] = [saat0, x0, y0, uhr0];
    window.__buehne();
    aus.ende = { wetter: st.weather, uhr: st.weatherEffectTime };
    // (Q) der Zwilling `time_of_day` ist fort
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
    // (U) die Leser der Bild-Uhr unter der Bühne, der Loop läuft drei Frames weiter (je Frame die Knoten-Uhr, dann der Takt)
    r._gameLoopTick(performance.now());
    window.__buehne();
    window.__buehne({ wetter: "rainy", saison: "winter" });
    let wort = +!!(r._rainSystem && r._rainSystem.mesh.visible);
    r._loopRender();
    const uhren = () => Object.fromEntries(window.__bildUhren().map(([n, o, k]) => [n, o[k]]));
    const vor = uhren();
    const z0 = window.__buehneUhr.verweigert;
    const nf = st.renderer && st.renderer._nodes && st.renderer._nodes.nodeFrame;
    for (let k = 1; k <= 3; k++) {
        if (nf) nf.update();
        r._gameLoopTick(performance.now() + 700 * k);
    }
    for (const k of [{ wetter: "regen" }, { saison: "sommerX" }])
        try {
            window.__buehne(k);
        } catch {
            wort++;
        }
    aus.uhren = { T: r._bildZeit, vor, nach: uhren(), verweigert: window.__buehneUhr.verweigert - z0, wort };
    return aus;
}

// (Z) das Urteil der Saat (rein), Läufe A, A+Uhr, B, B+Uhr, A mit Saat 2: jeder Wechsel über `_setWeather`, die Front zieht,
// die Folge ist eine Funktion von Saat und Ort, nie der Wanduhr
function wechsel(folge) {
    return folge.split(" ").filter((w, i, x) => w !== (i ? x[i - 1] : "sunny")).length;
}
function saatRot(Z) {
    const [a, au, b, bu, c] = Z.laeufe;
    const rot = Z.laeufe
        .filter(([, f]) => f.folge.split(" ").length !== Z.zuege || f.fade !== wechsel(f.folge) || !f.fade)
        .map(([n, f]) => `(Z) SAAT ${n}: ${f.fade} Wechsel über _setWeather in ${Z.zuege} Takten (${f.folge || "keiner"})`);
    for (const [x, y] of [
        [a, au],
        [b, bu],
    ])
        if (x[1].folge !== y[1].folge)
            rot.push(`(Z) SAAT: die Folge hängt an der Wanduhr — ${x[0]}: ${x[1].folge} ≠ ${y[0]}: ${y[1].folge}`);
    for (const [x, was] of [
        [c, "die Saat"],
        [b, "den Ort"],
    ])
        if (x[1].folge === a[1].folge) rot.push(`(Z) SAAT: die Folge ist blind für ${was} — ${x[0]} = ${a[0]}: ${a[1].folge}`);
    return rot;
}

// (F) das Urteil der Front (rein)
function frontRot(F) {
    return [
        [F.nassTrocken >= 0.2, "FRONT: Regen an A bei trockenem B unter 20 % der Zeit"],
        [Math.abs(F.lag - F.soll) <= 0.2 * F.soll, "LAG: B wiederholt A nicht nach Abstand ÷ Zug ±20 %"],
        [F.worte.length === 5, "WORTE: nicht alle 5 Zeilen erreichbar"],
        [F.welt === "stormy" && F.labor === "sturm", "MUTATION: der Sturm des Kerns zieht Welt und Labor nicht beide"],
    ]
        .filter(([ok]) => !ok)
        .map(([, t]) => `(F) ${t} (${JSON.stringify(F)})`);
}

// (F) DAS LABOR (worlds/terrain): sein Wetterspiel ruft denselben Kern — Rechnung ohne Bild (der Null-Renderer trägt kein WebGL,
// `updateWorld` wählt das Wetter vor jedem Pixel)
function laborProbe() {
    const P = window.__phytoCore;
    const kern = P.wetterAt;
    WXPLAY = true;
    P.wetterAt = () => ({ zeile: "sturm" });
    updateWorld(0.05);
    P.wetterAt = kern;
    return WWEATHER;
}

// (U) das Urteil der Uhr-Wache (rein): jeder Leser steht mit der gehaltenen Bild-Uhr, jede Shader-Zeit zeichnet zu T, die Leser
// jeder Welt stehen in der Liste, und der Loop schrieb die Bild-Uhr (verweigert).
function uhrRot(U) {
    const rot = [];
    for (const [n, a] of Object.entries(U.vor))
        if (!Object.is(U.nach[n], a))
            rot.push(`(U) UHR ${n} läuft unter der Bühne: ${a} → ${U.nach[n]} (liest nicht die Bild-Uhr)`);
        else if (/^(himmel|wasser|wind|fell|regen)$|^tor /.test(n) && !Object.is(a, U.T))
            rot.push(`(U) UHR ${n} zeichnet nicht zur Bild-Uhr: ${a} statt ${U.T}`);
    for (const n of ["himmel", "wind", "böe"])
        if (!(n in U.vor)) rot.push(`(U) UHR ${n}: die Bühne kennt sie nicht (${Object.keys(U.vor).join(", ")})`);
    if (!(U.verweigert > 0)) rot.push(`(U) die Bild-Uhr: der Loop schrieb sie nicht — die Wache sah keinen Zug`);
    if (U.wort !== 3) rot.push(`(U) WORT: ${U.wort} von 3 — die Bühne zeichnet keinen Regen oder nimmt ein falsches Wort still`);
    return rot;
}

// Die Himmels-Probe (eine FRISCHE Welt): das Spiel läuft getaktet (`_gameLoopTick` in Schritten von `o.schrittSek`).
function himmelProbe(o) {
    const aus = {};
    // (T) die Tag-Länge einer frischen Welt, und was ein alter Spielstand (8-min-Tag) über den echten Restore-Weg aus ihr macht
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
    // DAS WESEN IM SCHÖPFER-MODUS schlägt alle `WESEN_SEK` Spiel-Sekunden von selbst `wesenWort` vor, über den EINEN Weg aller
    // Vorschläge (`_handleCreatureProposedProgram`).
    const pm = st.playerMesh.position;
    const wesen =
        r.spawnCreatureAt(pm.x + 30, pm.y, pm.z + 30, "happy", "wesen") ||
        (st.creatures || []).find((c) => c && c.userData);
    if (wesen && !wesen.userData.name) wesen.userData.name = "Wache-Wesen";
    aus.wesen = wesen ? wesen.userData.name : null;
    let wesenWort = null;
    const WESEN_TAKTE = Math.round(o.wesenSek / o.schrittSek);
    const lauf = (sek) => {
        const n = Math.round(sek / o.schrittSek);
        for (let i = 0; i < n; i++) {
            k++;
            window.__taktZeit = k * o.schrittSek;
            // ein trauriger Spieler: die Emotion sorrow wirkt auf das Wetter
            st.player.emotions.sorrow = 1;
            r._gameLoopTick(T0 + k * o.schrittSek * 1000);
            if (wesen && wesenWort && k % WESEN_TAKTE === 0)
                r._handleCreatureProposedProgram(wesen, wesen.userData.name, ["weather", wesenWort]);
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
    // DIE TÄTER: Nexus-Gesetze auf die Uhr (`time_of_day`, `set_time_of_day`) und den Regen (alle 4,7 s), Würfel auf Uhr und Sturm
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
        quelle: "rule:emotion:sorrow",
        stapel: "_tickWorldRules",
    };
    // beim Stapel, nicht bei der Quelle: so steht das Wesen im Buch, welchen Namen seine Quelle auch trägt
    const wesenT = {
        name: "Wesen im Schöpfer-Modus (von selbst)",
        wo: "wetter",
        quelle: null,
        stapel: "_executeCreatureProgram",
    };
    r.setGameMode("schöpfer");
    aus.modus = r.getGameMode();
    wesenWort = "rainy";
    aus.gesetz = fenster("gesetz", o.fensterSek, "sunny", null, [
        gesetzUhr,
        { name: "Nexus-Wurf Uhr", wo: "uhr", quelle: "nexus", stapel: "_loopNexusUpdate" },
        regen,
        trauer,
        { name: "Nexus-Wurf Sturm", wo: "wetter", quelle: "nexus", stapel: "_loopNexusUpdate" },
        wesenT,
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
    wesenWort = "stormy";
    aus.frei = fenster("frei", o.fensterSek, null, window.__taktZeit, [gesetzUhr, regen, trauer, wesenT]);
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
        const k = x.replace(/\d\d:\d\d/g, "hh:mm").replace(/\b[a-z]+ → [a-z]+\b/g, "… → …");
        const e = g.get(k);
        if (e) e[0]++;
        else g.set(k, [1, x]);
    }
    return [...g.values()];
}

function urteil(S, H) {
    const rot = [];
    const SOLL_QUELLE = {
        emotion: "rule:emotion:sorrow",
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
    if (S.ende.wetter !== "sunny" || !(S.ende.uhr < 0))
        rot.push(`(Z) die Bühne stellt den Halt nicht wieder her (${JSON.stringify(S.ende)})`);
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
    if (!H.wesen || H.modus !== "schöpfer")
        rot.push(
            `(G) das Wesen im Schöpfer-Modus läuft nicht (Wesen ${H.wesen || "–"}, Modus ${H.modus}) — sein Täter ist ungeprüft`
        );
    // (R) der Regler zeigt die Welt-Zeit
    const R = H.regler;
    if (R.wert == null) rot.push("(R) REGLER: #slider-timeofday fehlt");
    else if (Math.abs(R.wert - R.welt * 1000) > 1.5 || R.text !== R.label)
        rot.push(`(R) REGLER: der Tageszeit-Regler zeigt ${R.text} (${R.wert}), die Welt steht bei ${R.label}`);
    // (T) die Tag-Länge trägt eine Szene, ein alter Spielstand setzt sie nicht zurück
    const T = H.tag;
    if (!(0.25 * T.tagMin >= T.szene))
        rot.push(
            `(T) TAG: ein Tag von ${T.tagMin} min trägt von Mittag bis Sonnenuntergang ${(0.25 * T.tagMin).toFixed(1)} min — die Szene braucht ${T.szene} min`
        );
    if (!Number.isFinite(T.szene)) rot.push("(T) TAG: das Spiel nennt die Szene nicht (`TAG_SZENE_MINUTEN`)");
    if (T.alterStand !== T.tagMin)
        rot.push(
            `(T) TAG: ein alter Spielstand (8-min-Tag) setzt die Tag-Länge auf ${T.alterStand} — er hält den alten Tag fest`
        );
    rot.push(...uhrRot(S.uhren), ...saatRot(S.saat), ...frontRot(S.front));
    return rot;
}

async function boot(browser) {
    const page = await browser.newPage();
    await nullRenderer(page);
    await server.zeige(page, 60000);
    await page.evaluate(async () => {
        await window.__weltDa((r) => r.state && r.state.player && r.nexus);
    });
    await page.evaluate(AUSGABE_INSTALL);
    return page;
}

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "null", frist: 900000, erwartet: /Error creating WebGL context/ });
    const page = await boot(browser);
    const S = await page.evaluate(probe, {
        zuege: 10,
        laeufe: [
            ["saat-a", 0, 0],
            ["saat-a", 0, 12e4],
            ["saat-a", 3000, 0],
            ["saat-a", 3000, 12e4],
            ["saat-b", 0, 0],
        ],
    });
    await page.close();
    // (G)(B)(R)(T) in einer FRISCHEN Welt: die Probe oben hat Gesetze, Bühne und Wort hinterlassen
    const page2 = await boot(browser);
    const t0 = Date.now();
    const H = await page2.evaluate(himmelProbe, {
        schrittSek: SCHRITT_SEK,
        fensterSek: HIMMEL_MIN * 60,
        wesenSek: WESEN_SEK,
    });
    const laufS = (Date.now() - t0) / 1000;
    const lab = await browser.newPage();
    await server.zeige(lab, 60000, "worlds/terrain/index.html");
    await lab.waitForFunction("typeof updateWorld === 'function' && typeof camera === 'object' && camera");
    S.front.labor = await lab.evaluate(laborProbe);
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
    console.log(
        `  Würfel: Uhr-Ops in ${S.wuerfe.atome}/${S.wuerfe.n} Atomen, ${S.wuerfe.gesetze}/${S.wuerfe.n} Gesetzen, ${S.wuerfe.mutationen}/${S.wuerfe.n} Mutationen`
    );
    console.log(
        `  Tag: ${H.tag.tagMin} min (Standard ${H.tag.standard}, Szene ${H.tag.szene}), Mittag → Sonnenuntergang ${(0.25 * H.tag.tagMin).toFixed(1)} min; nach einem alten Stand (8 min): ${H.tag.alterStand} min`
    );
    console.log(
        `  Wort des Spielers: Uhr ${hm(H.wort.uhr)}, Wetter ${H.wort.wetter} (getaktet ${HIMMEL_MIN} min je Fenster, ${laufS.toFixed(1)} s Wanduhr)`
    );
    console.log(
        `  Modus ${H.modus}: das Wesen „${H.wesen || "–"}" schlägt alle ${WESEN_SEK} s von selbst vor (Gesetz: rainy, Band: stormy)`
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
    const uz = Object.entries(S.uhren.nach).map(([n, x]) => `${n} ${+(+x).toFixed(4)}`);
    console.log(`  Bild-Uhr ${S.uhren.T}: ${uz.join(" · ")}; verweigert ${S.uhren.verweigert}`);
    for (const [n, f] of S.saat.laeufe) console.log(`  Saat ${n.padEnd(22)} ${f.folge} (${f.fade} überblendet)`);
    const F = S.front;
    console.log(
        `  Front · Regen an A bei trockenem B ${(100 * F.nassTrocken).toFixed(0)} % · Lag ${F.lag} s (Soll ${F.soll.toFixed(0)} s ±20 %)` +
            ` · Worte ${F.worte.length}/5 (${F.worte.join(" ")}) · Mutation des Kerns: Welt ${F.welt}, Labor ${F.labor}`
    );
    const rot = urteil(S, H);
    wandEnde(
        rot,
        "unter der Bühne dreht kein Schreiber das Wetter; frei gehen Uhr und Wetter nach dem Wort des Spielers, die Welt" +
            " wünscht nur, jeder Schreiber steht beim Namen."
    );
});

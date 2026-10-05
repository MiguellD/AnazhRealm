// takt-linse.cjs — DIE TAKT-LINSE (V18.512): was der Spiel-Takt den Haupt-Thread kostet, je Subsystem. Befund
// 02.10. (Werkbank, eingeschwungene Mess-Wiese, Render aus): der Takt kostete p50 31 ms / p95 89 ms — davon Ø 20 ms
// in `_tickFocusingAffordances`, das bei Sonne für JEDEN der ~120 Bauten die Compound-Tags rechnete, bevor es die
// Reichweite eines Brennglases prüfte. Kein Gate sah es: jede Zahl im Flugschreiber war „der Frame".
//
// Die Linse hüllt die Loop-Subsysteme (und, über `extra`, beliebige tiefere Methoden) und lässt den Spiel-Takt
// n-mal laufen, der Render ruht (`_loopRender` gestubbt) — gemessen wird die CPU der Welt, nicht die GPU.
//
//   Seite:     window.__taktZerlegung({ n: 120, extra: ["_tickFernRing"] }) → { p50, p95, max, top }
//   Werkbank:  node scripts/werkbank.cjs takt [n] [--extra a,b,c]

const LOOP_METHODEN = [
    "updateFps",
    "_loopNexusUpdate",
    "grokTick",
    "dslTick",
    "_tickWorldRules",
    "updatePlayerEmotions",
    "tickPlayerBoosts",
    "tickCreatureBoosts",
    "tickPlayerVitals",
    "tickStatsHud",
    "tickDayNight",
    "tickWeatherTransition",
    "tickFaunaLifecycle",
    "_tickBootFernDeko",
    "updateStatusPanel",
    "_loopGroundCheck",
    "_loopFrustumCulling",
    "_loopAnimateUfos",
    "_loopFixedStep",
    "_tickHarvest",
    "_tickKampfSchwung",
    "_tickPfeile",
    "_tickBogenZug",
    "_loopSelfAnalysis",
    "_loopWeatherAndGrowth",
    "_loopVoxelStreaming",
    "_loopSkyboxZeit",
    "_tickPortalMembranes",
    "_tickHausTueren",
    "_updateDorfRauch",
    "_loopAutoSave",
    "_loopCamera",
    "tickArchitectureCulling",
    "tickBuildMode",
    "tickArchitectures",
    "tickAffordances",
    "_loopShadowUpdate",
    "_tickFoundryIngest",
];

function taktZerlegung(opts) {
    return (async () => {
        const o = opts || {};
        const r = window.anazhRealm;
        const P = Object.getPrototypeOf(r);
        const namen = (o.liste || []).concat(o.extra || []);
        const acc = {},
            orig = {};
        for (const n of namen) {
            if (typeof P[n] !== "function" || orig[n]) continue;
            orig[n] = P[n];
            const f = P[n];
            P[n] = function (...a) {
                const t = performance.now();
                try {
                    return f.apply(this, a);
                } finally {
                    const d = performance.now() - t;
                    const e = acc[n] || (acc[n] = { s: 0, max: 0 });
                    e.s += d;
                    if (d > e.max) e.max = d;
                }
            };
        }
        const render = r._loopRender;
        r._loopRender = function () {};
        const N = o.n || 120;
        const takte = [];
        let buehneMs = 0;
        try {
            for (let i = 0; i < N; i++) {
                // Die Bühne (Mittag · Sonne · Sommer) hält die Welt fest — außerhalb des gemessenen Takts.
                const tb = performance.now();
                if (window.__buehne) window.__buehne();
                buehneMs += performance.now() - tb;
                const t = performance.now();
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* ein reißender Takt zählt trotzdem */
                }
                takte.push(performance.now() - t);
                await new Promise((res) => setTimeout(res, 16));
            }
        } finally {
            for (const n in orig) P[n] = orig[n];
            r._loopRender = render;
        }
        const s = [...takte].sort((a, b) => a - b);
        const q = (x) => Math.round(s[Math.min(s.length - 1, Math.floor(x * s.length))] * 10) / 10;
        const top = Object.entries(acc)
            .map(([k, v]) => ({ name: k, mittel: Math.round((v.s / N) * 100) / 100, max: Math.round(v.max * 10) / 10 }))
            .sort((a, b) => b.mittel - a.mittel)
            .slice(0, o.top || 15);
        // Der Rest: Takt-Zeit, die kein gehülltes Subsystem erklärt (ungehüllte Glieder, GC, Microtasks).
        // (nur die Loop-Glieder zählen — `extra` sind meist tiefere, darin enthaltene Methoden)
        const oben = new Set(o.liste || []);
        const erklaert = Object.entries(acc).reduce((a, [k, v]) => (oben.has(k) ? a + v.s : a), 0);
        const gesamt = takte.reduce((a, b) => a + b, 0);
        const restMittel = Math.round(((gesamt - erklaert) / N) * 100) / 100;
        return {
            takte: N,
            p50: q(0.5),
            p95: q(0.95),
            max: q(0.999),
            restMittel,
            buehneMittel: Math.round((buehneMs / N) * 100) / 100,
            top,
        };
    })();
}

module.exports = {
    LOOP_METHODEN,
    TAKT_INSTALL: `window.__taktZerlegung = (o) => (${taktZerlegung.toString()})(Object.assign({ liste: ${JSON.stringify(LOOP_METHODEN)} }, o || {}));`,
};

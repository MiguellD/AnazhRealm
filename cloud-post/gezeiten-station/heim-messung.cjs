// LESER-KANDIDAT der Bahn „gezeiten“ (Regel 7: die Station bleibt unberührt — dieser Kandidat zeigt, was ihre Messfunktion
// am Stand des Zweigs liest).
//
// #1 (karte2.planet.wasser.gezeiten#1): die Heim-Adresse der Station `GEZEIT_AN` WÖRTLICH (origin/punkte-maschine,
// meisterkarte-quelle/punkte/stationen/k2-planet.js 3740–3790: die Küste aus `G.hoehe(L, x, z, false) < wl` in 16 Richtungen je
// 250 m vom Spawn, 11 Punkte zu 40 m quer über sie, der Spiegel `r._koerperWasser(sx, sz, -Infinity)` am See-Ende nach
// `st.spielZeit = alt + a.zeit · normS/24; r._pegelTakt()`, das Watt `r._nassAt(x, z)`), Stunden 0–24, und ihre Maße
// (`hubVon`, `periodeVon`, `benetztDiff` wörtlich).
//
// #2 (karte2.planet.wasser.gezeiten#2, Soll „Spring-Nipp-Takt 14,8 d ±2 %“ Schlüssel `springNippTage`): die Station misst nur den
// Mondwinkel des Himmels (`__weltLicht.mondRichtung`) und trägt KEINEN Leser für `springNippTage`. Der Kandidat: derselbe Leser
// des Spiels (`_koerperWasser` am See-Ende der Küste der Station) über 31 Tage der Welt-Uhr je Stunde, der Hub im gleitenden
// Fenster zweier Tiden (Hoch − Niedrig in 25 h), seine steigenden Durchgänge durch die Mitte zwischen Spring und Nipp
// (Hysterese 2 Stufen) →
// `springNippTage`, dazu `tage` (Soll ≥ 30).
//
//   node cloud-post/gezeiten-station/heim-messung.cjs [--json datei]
"use strict";
const path = require("path");
const WURZEL = path.resolve(__dirname, "..", "..");
const WB = require(path.join(WURZEL, "scripts/lib/welt-boot.cjs"));
const JSON_AUS = WB.argOpt("--json", null);
const server = WB.statikServer();

WB.hauptLauf(async () => {
    const t0 = Date.now();
    const { browser, page } = await WB.nullWelt(server, { da: (r) => r.state && r.state.player, frist: 600000 }, 120000);
    const w = await page.evaluate(async () => {
        const r = window.anazhRealm;
        r._gameLoopTick = () => {};
        const G = globalThis.__gelaendeCore, st = r.state;
        // ── die Station, wörtlich (GEZEIT_AN, Zweig heim) ──
        const L = r._gelaende();
        const wl = st.waterLevel;
        const nassIn = (x, z) => G.hoehe(L, x, z, false) < wl;
        const n0 = nassIn(0, 0);
        let quer = null;
        for (let d = 250; d <= 20000 && !quer; d += 250)
            for (let i = 0; i < 16 && !quer; i++) {
                const c = Math.cos((i * Math.PI) / 8), s = Math.sin((i * Math.PI) / 8);
                if (nassIn(d * c, d * s) === n0) continue;
                let e = d - 250;
                while (e < d && nassIn(e * c, e * s) === n0) e += 10;
                quer = [];
                for (let t = 0; t <= 10; t++) { const q = n0 ? e - (t - 5) * 40 : e + (t - 5) * 40; quer.push([q * c, q * s, G.hoehe(L, q * c, q * s, false)]); }
            }
        if (!quer) return { kueste: false };
        for (const [x, z] of [quer[0], quer[10]]) { let n = 0; while (r._ensureHydroTilesAround(x, z, 32) && n < 100) { await new Promise((f) => setTimeout(f, 50)); n++; } }
        const [sx, sz] = quer[10];
        const alt = st.spielZeit, stundeS = r._kalender().normS / 24;
        const lies = (zeit) => {
            try {
                st.spielZeit = alt + zeit * stundeS;
                r._pegelTakt();
                const spiegel = r._koerperWasser(sx, sz, -Infinity);
                return { zeit, spiegel: Math.round(spiegel * 1000) / 1000, nass: quer.filter(([x, z]) => r._nassAt(x, z)).length, k: r._gelaende().gezeit.k };
            } finally {
                st.spielZeit = alt;
                r._pegelTakt();
            }
        };
        const s1 = Array.from({ length: 25 }, (_, h) => lies(h));
        // ── der Kandidat #2: derselbe Leser über 31 Tage je Stunde ──
        const s2 = [];
        for (let h = 0; h <= 31 * 24; h++) s2.push(lies(h).spiegel);
        return { kueste: true, quer: quer.map(([x, z, y]) => [Math.round(x), Math.round(z), Math.round(y * 100) / 100]), s1, s2, stufe: G.GEZEIT.stufe, m2: G.GEZEIT.teile[0].stunden };
    });
    await browser.close();
    if (!w.kueste) throw new Error("keine Küste bis 20 km vom Spawn");
    // die Maße der Station, wörtlich (je Saat: hier die Heimat)
    const s = w.s1.map((x) => ({ a: { zeit: x.zeit }, w: x }));
    const hubVon = (s) => Math.max(...s.map((x) => x.w.spiegel)) - Math.min(...s.map((x) => x.w.spiegel));
    const periodeVon = (s) => {
        const v = s.map((x) => x.w.spiegel), m = v.reduce((p, y) => p + y, 0) / v.length, auf = [];
        for (let i = 1; i < v.length; i++) if (v[i - 1] < m && v[i] >= m) auf.push(s[i - 1].a.zeit + ((m - v[i - 1]) / (v[i] - v[i - 1])) * (s[i].a.zeit - s[i - 1].a.zeit));
        return auf.length > 1 ? (auf[auf.length - 1] - auf[0]) / (auf.length - 1) : null;
    };
    const benetztDiff = Math.max(...s.map((x) => x.w.nass)) - Math.min(...s.map((x) => x.w.nass));
    const R = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
    const eins = { hubM: R(hubVon(s)), periodeH: R(periodeVon(s)), benetztDiff, stunden: s.length, uhr: s.length };
    // der Kandidat #2: der Hub im gleitenden Fenster zweier Tiden, die steigenden Durchgänge der Hülle (Hysterese 2 Stufen)
    const F = Math.round(2 * w.m2);
    const hubJe = [];
    for (let i = 0; i + F <= w.s2.length; i++) { const t = w.s2.slice(i, i + F); hubJe.push(Math.max(...t) - Math.min(...t)); }
    const [spring, nipp] = [Math.max(...hubJe), Math.min(...hubJe)];
    const [mitte, band] = [(spring + nipp) / 2, 2 * w.stufe];
    const steigt = [];
    for (let i = 1, unten = false; i < hubJe.length; i++) {
        if (hubJe[i - 1] < mitte - band) unten = true;
        if (unten && hubJe[i - 1] < mitte && hubJe[i] >= mitte) { const [a, b] = [hubJe[i - 1] - mitte, hubJe[i] - mitte]; steigt.push((i - 1 + a / (a - b) + F / 2) / 24); unten = false; }
    }
    const zwei = { springNippTage: steigt.length >= 2 ? R((steigt[steigt.length - 1] - steigt[0]) / (steigt.length - 1)) : null, tage: (w.s2.length - 1) / 24, springM: R(spring), nippM: R(nipp), durchgaenge: steigt.length };
    const aus = { kueste: w.quer, eins, zwei, reihe1: w.s1, sekunden: Math.round((Date.now() - t0) / 1000) };
    console.log(`Küste der Station (quer, x|z|Makro-Höhe): ${w.quer.map((q) => q.join("|")).join(" · ")}`);
    console.log(`#1 heim (Station wörtlich, 25 Stunden): hubM ${eins.hubM} · periodeH ${eins.periodeH} (Soll 12,42 ±2 %) · benetztDiff ${eins.benetztDiff} · nass je Stunde ${w.s1.map((x) => x.nass).join("")}`);
    console.log(`#2 Kandidat (31 d je Stunde): springNippTage ${zwei.springNippTage} aus ${zwei.durchgaenge} Durchgängen (Soll 14,77 ±2 %) · tage ${zwei.tage} · Spring ${zwei.springM} m · Nipp ${zwei.nippM} m`);
    if (JSON_AUS) require("fs").writeFileSync(JSON_AUS, JSON.stringify(aus, null, 1));
    process.exit(0);
});

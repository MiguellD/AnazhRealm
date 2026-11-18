// b-volk.cjs — Probe b (gesetz.md §7): 100 000 Personen der Prüf-Stadt am 1700-07-02 12 Uhr gegen echte Verteilungen.
// Pyramide (CAMPOP/Wrigley & Schofield, Meisterkarte) · Größe nach Alter und Geschlecht (WHO 2006/2007) · Haushalt (Laslett, Kussmaul) · Erbe.
"use strict";
const P = require("./person.cjs");
const WHO = require("./who-referenz.json");
const { same, band, wahr, schreiben, zeigen, r, quantil } = require("./probe.cjs");
const ZIEL = 100000;
const Y = P.jahrVon(182, 12);
const ALTER = [1, 2, 5, 10, 15, 18];

function median(a) {
    return quantil(a, 0.5);
}
function sd(a) {
    const m = a.reduce((s, x) => s + x, 0) / a.length;
    return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1));
}
function lauf(s) {
    const S = P.fnv(s);
    const st = P.machStadt(S, 14, 14);
    const volk = [], haushalte = [];
    let lose = 0;
    for (let a = 0; a < st.lose && volk.length < ZIEL; a++) {
        const b = P.bewohner(S, st, a, Y);
        lose++;
        if (b.length) haushalte.push(b.length);
        for (const x of b) volk.push(x);
    }
    const N = volk.length;
    // Pyramide
    let alt60 = 0, jung15 = 0;
    for (const x of volk) {
        const J = Y - x.geburt;
        if (J >= 60) alt60++;
        if (J < 15) jung15++;
    }
    // e₀ über alle Geburten 1550–1650 der Häuser
    let nGeb = 0, sumL = 0;
    for (let a = 0; a < lose; a++) {
        const H = st.haus(a);
        for (const g of P.hauslauf(S, a, H.baujahr, Y))
            for (const c of g.kinder)
                if (c.geburt >= 1550 && c.geburt < 1650) {
                    nGeb++;
                    sumL += c.tod - c.geburt;
                }
    }
    // e₀ der Siler-Kurve allein (∫ S(x) dx, ohne Deckel) — trennt das Epochen-Datum vom Deckel des Leibs
    let e0Siler = 0;
    for (let x = 0; x < 130; x += 1 / 64) e0Siler += Math.exp(-P.silerH(x + 1 / 128)) / 64;
    // Größe
    const zellen = [];
    for (const A of ALTER)
        for (const sex of [0, 1]) {
            const hs = [];
            for (const x of volk) if (x.sex === sex && Math.abs(Y - x.geburt - A) <= 0.25) hs.push(P.leib(S, x, Y).H * 100);
            const o = sex ? WHO.w : WHO.m, M = o.hoeheCm[12 * A], SD = M * o.hoeheS[12 * A];
            const med = median(hs);
            zellen.push({ alter: A, sex: sex ? "w" : "m", n: hs.length, median: r(med, 2), who: M, whoSD: r(SD, 2), z: r((med - M) / SD, 3) });
        }
    const streuung = [0, 1].map((sex) => {
        const hs = [];
        for (const x of volk) {
            const J = Y - x.geburt;
            if (x.sex === sex && J >= 18 && J < 19) hs.push(P.leib(S, x, Y).H * 100);
        }
        const o = sex ? WHO.w : WHO.m, whoSD = o.hoeheCm[222] * o.hoeheS[222];
        return { sex: sex ? "w" : "m", n: hs.length, sd: r(sd(hs), 3), whoSD: r(whoSD, 3), verh: r(sd(hs) / whoSD, 3) };
    });
    // Reife Frau: Alter bei 0,9·M∞ (reifeS des Kerns, in Jahren über K)
    const reifeW = [];
    for (const x of volk) if (x.sex === 1) reifeW.push(P.LC.reifeS(P.masseInf(S, x)) / P.K);
    const reifeMittelFrau = P.LC.reifeS(P.LC.masseAdult(P.ART[1].Mbar, [0], [0])) / P.K;
    // Haushalt
    const mittel = N / haushalte.length;
    let in6 = 0;
    for (const n of haushalte) if (n >= 6) in6 += n;
    let gesinde = 0;
    for (const x of volk) if (x.rolle === "gesinde") gesinde++;
    // Erbe: Eltern derselben Adresse, Steigung lnM Kind auf Eltern-Mittel (je Geschlecht um ln M̄ zentriert)
    let kinder = 0, gleich = 0;
    const X = [], Yv = [];
    const lnz = (p) => Math.log(P.masseInf(S, p) / P.ART[p.sex].Mbar);
    for (const x of volk) {
        if (x.herkunft !== 1) continue;
        kinder++;
        if (x.mutter && x.vater && x.mutter.adr === x.adr && x.vater.adr === x.adr) gleich++;
        X.push((lnz(x.mutter) + lnz(x.vater)) / 2);
        Yv.push(lnz(x));
    }
    const mx = X.reduce((s, v) => s + v, 0) / X.length, my = Yv.reduce((s, v) => s + v, 0) / Yv.length;
    let cxy = 0, cxx = 0;
    for (let i = 0; i < X.length; i++) {
        cxy += (X[i] - mx) * (Yv[i] - my);
        cxx += (X[i] - mx) * (X[i] - mx);
    }
    const det = {
        personen: N, lose, haushalte: haushalte.length,
        pyramide: { anteil60: r(alt60 / N, 4), anteil0bis14: r(jung15 / N, 4), e0: r(sumL / nGeb, 3), e0Siler: r(e0Siler, 3), geburten: nGeb },
        groesse: zellen, streuung,
        reifeFrau: { median: r(median(reifeW), 3), mittelFrau: r(reifeMittelFrau, 3), n: reifeW.length },
        haushalt: { mittel: r(mittel, 3), anteilPersonenIn6: r(in6 / N, 4), gesindeAnteil: r(gesinde / N, 4), groessen: verteilung(haushalte) },
        erbe: { kinder, gleicheAdresse: gleich, anteil: r(gleich / kinder, 6), steigung: r(cxy / cxx, 4), paare: X.length },
    };
    return { det, zeit: null };
}
function verteilung(a) {
    const v = {};
    for (const n of a) v[n] = (v[n] || 0) + 1;
    return v;
}
module.exports = { lauf };
if (require.main === module) {
    const s = same();
    const { det } = lauf(s);
    const pruef = [
        band("Anteil 60+", det.pyramide.anteil60, 0.06, 0.1),
        band("Anteil 0–14", det.pyramide.anteil0bis14, 0.35, 1),
        band("e₀ (Geburten 1550–1650) J", det.pyramide.e0, 35, 40),
        ...det.groesse.map((z) => band("Größe " + z.sex + " " + z.alter + " J (z des Medians)", z.z, -1, 1)),
        ...det.streuung.map((z) => band("SD Größe 18–19 J " + z.sex + " ÷ WHO-SD", z.verh, 0.75, 1.25)),
        band("Reife Frau J (Median)", det.reifeFrau.median, 14.43 - 0.5, 14.43 + 0.5),
        band("Haushalt Mittel", det.haushalt.mittel, 4.25, 5.25),
        band("Personen in Haushalten ≥ 6", det.haushalt.anteilPersonenIn6, 0.5000001, 1),
        band("Gesinde-Anteil", det.haushalt.gesindeAnteil, 0.104, 0.164),
        band("Kinder mit Eltern derselben Adresse", det.erbe.anteil, 1, 1),
        band("Steigung lnM Kind auf Eltern-Mittel", det.erbe.steigung, 0.41, 0.51),
    ];
    zeigen(pruef);
    console.log(JSON.stringify({ personen: det.personen, haushalte: det.haushalte, verteilung: det.haushalt.groessen, n: det.groesse.map((z) => z.n), streuung: det.streuung, reife: det.reifeFrau, geburten: det.pyramide.geburten }));
    schreiben("b", { probe: "b Volk", same: s, pruef, det });
}

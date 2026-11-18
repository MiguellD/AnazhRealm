// d-bewegung.cjs — Probe d (gesetz.md §7): derselbe Regler auf Kind, Erwachsenem und Greis; Sprint, Weitsprung und Wurf ohne
// sport-eigene Parameter. Mittel-Person = Erbe 0 und Umwelt 0 (M∞ = M̄ der Art); die 1 000 Männer 20–30 J kommen aus der Prüf-Stadt.
"use strict";
const P = require("./person.cjs");
const { same, band, wahr, schreiben, zeigen, r } = require("./probe.cjs");
const Y = P.jahrVon(182, 12);

function mittel(sex, J) {
    const x = { adr: 0, g: 0, slot: 0, herkunft: 0, geburt: Y - J, sex, _a: [0], _e: [0], _M: P.LC.masseAdult(P.ART[sex].Mbar, [0], [0]) };
    return P.leib(0, x, Y);
}
function gangVon(B) {
    const g = P.gang(B);
    return { v: r(g.v, 4), schrittCm: r(g.schritt * 100, 2), H: r(B.H, 4) };
}
function sprung(B) {
    const s = P.standSprung(B);
    return { cm: r(s.weite * 100, 2), phiS: s.phiS, theta: s.theta };
}
function lauf(s) {
    const S = P.fnv(s);
    const gang = {
        m30: gangVon(mittel(0, 30)), w30: gangVon(mittel(1, 30)), m6: gangVon(mittel(0, 6)), w6: gangVon(mittel(1, 6)),
        w85: gangVon(mittel(1, 85)), m85: gangVon(mittel(0, 85)),
    };
    const stand = { m9: sprung(mittel(0, 9)), m17_9: sprung(mittel(0, 17.9)), w9: sprung(mittel(1, 9)), w17_9: sprung(mittel(1, 17.9)), m30: sprung(mittel(0, 30)), m75: sprung(mittel(0, 75)) };
    const B25 = mittel(0, 25), sp = P.sprint(B25), ws = P.weitSprung(B25), st25 = P.standSprung(B25);
    // F/W, das die Weyand-Formel für die Band-Unterkante 6,2 m/s bräuchte: v = L_c(2F/W − 1)/t_sw nach F/W aufgelöst
    const fwNoetig = (6.2 * sp.tSw / sp.Lc + 1) / 2;
    const mittelMann = { vTop: r(sp.vTop, 4), t100: r(sp.t100, 3), FW: r(sp.FW, 4), fwNoetig62: r(fwNoetig, 4), a0: r(sp.a0, 4), weit: r(ws.weite, 3), alpha: ws.alpha, stand: r(st25.weite, 3) };
    // 1 000 Männer 20–30 J der Prüf-Stadt
    const st = P.machStadt(S, 14, 14);
    const t100 = [], weit = [];
    let besterT = Infinity, besterW = 0, n = 0;
    for (let a = 0; a < st.lose && n < 1000; a++)
        for (const x of P.bewohner(S, st, a, Y)) {
            const J = Y - x.geburt;
            if (x.sex !== 0 || J < 20 || J >= 30 || n >= 1000) continue;
            n++;
            const B = P.leib(S, x, Y), q = P.sprint(B), w = P.weitSprung(B);
            t100.push(q.t100);
            weit.push(w.weite);
            if (q.t100 < besterT) besterT = q.t100;
            if (w.weite > besterW) besterW = w.weite;
        }
    const m = t100.reduce((s2, x) => s2 + x, 0) / n;
    const sdv = Math.sqrt(t100.reduce((s2, x) => s2 + (x - m) * (x - m), 0) / (n - 1));
    const volk = { n, besterT100: r(besterT, 3), mittelT100: r(m, 3), cv: r(sdv / m, 4), besterWeit: r(besterW, 3) };
    const wurf = P.wurf();
    return { det: { gang, stand, mittelMann, volk, wurf }, zeit: null };
}
module.exports = { lauf };
if (require.main === module) {
    const s = same();
    const { det } = lauf(s);
    const g = det.gang, st = det.stand, mm = det.mittelMann, v = det.volk;
    const pruef = [
        band("Gang Mann 30 J m/s", g.m30.v, 1.27, 1.46),
        band("Gang Frau 30 J m/s", g.w30.v, 1.27, 1.46),
        band("Gang Junge 6 J m/s", g.m6.v, 0.62, 1.04),
        band("Gang Mädchen 6 J m/s", g.w6.v, 0.62, 1.04),
        band("Gang Greisin 85 J m/s", g.w85.v, 0.8, 1.08),
        band("Schritt Greis 85 J cm", g.m85.schrittCm, 43.6, 59.0),
        band("Schritt Greisin 85 J cm", g.w85.schrittCm, 43.6, 59.0),
        band("Stand-Sprung Junge 9 J cm", st.m9.cm, 87, 131),
        band("Stand-Sprung Junge 17,9 J cm", st.m17_9.cm, 132, 198),
        band("Stand-Sprung Mädchen 9 J cm", st.w9.cm, 77, 115),
        band("Stand-Sprung Mädchen 17,9 J cm", st.w17_9.cm, 96, 144),
        wahr("Stand-Sprung 75 J < 30 J", st.m75.cm < st.m30.cm, true),
        band("Sprint Mittel-Mann 25 J v_top m/s", mm.vTop, 6.2, 11.1),
        band("Sprint Mittel-Mann 25 J 100 m s", mm.t100, 9.58, 17.6),
        band("Sprint Bester von 1 000 s", v.besterT100, 9.58, Infinity),
        band("Sprint CV der 100-m-Zeit", v.cv, 0.1, 0.2),
        band("Weitsprung Bester von 1 000 m", v.besterWeit, 0, 8.95),
        wahr("Weitsprung Mittel-Mann > eigener Stand-Sprung", mm.weit > mm.stand, true),
        wahr("Wurf: der Regler liefert einen Abwurf", det.wurf !== null, true),
    ];
    zeigen(pruef);
    console.log(JSON.stringify(det));
    schreiben("d", { probe: "d Bewegung", same: s, pruef, det });
}

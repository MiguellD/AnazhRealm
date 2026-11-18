// a-kosten.cjs — Probe a (gesetz.md §7): Treue der Abfrage gegen den Sack-Scan, Kosten je Abfrage bei 5·10³ / 5·10⁵ / 5·10⁶ Personen.
// Jede Abfrage bekommt eine frische Stadt (kein Puffer zwischen zwei Abfragen): gemessen wird die Kosten einer kalten Abfrage.
"use strict";
const P = require("./person.cjs");
const { same, band, schreiben, zeigen, r, quantil } = require("./probe.cjs");
const GROESSEN = [[3, 3], [29, 29], [93, 93]]; // Viertel je Seite: ≈ 5·10³ / 5·10⁵ / 5·10⁶ Personen (gezählt, nicht angenommen)
const RADIUS = 150;
const STUNDE = 12 + 40 / 60;

function zaehlen(S, QW, QH, Y) {
    let n = 0;
    for (let qz = 0; qz < QH; qz++) {
        const st = P.machStadt(S, QW, QH); // frisch je Viertel-Reihe: der Rechen-Puffer wächst nie mit der Stadt
        for (let a = qz * QW * 128; a < (qz + 1) * QW * 128; a++) n += P.bewohner(S, st, a, Y).length;
    }
    return n;
}
function ids(liste) {
    return liste.map(P.personId).sort();
}
function treue(S) {
    const st = P.machStadt(S, 3, 3);
    const zeilen = [];
    let abweichung = 0, leer = 0;
    for (let i = 0; i < 100; i++) {
        const a = Math.floor(P.u01(S, 9001, i, 0, 1) * st.lose), c = st.geo(a).door;
        const d = 7 * Math.floor(P.u01(S, 9001, i, 0, 2) * 520) + (i % 7);
        const h = ((i + P.u01(S, 9001, i, 0, 3)) * 24) / 100;
        const A = ids(P.abfrage(st, c.x, c.z, RADIUS, d, h).treffer), B = ids(P.sackScan(st, c.x, c.z, RADIUS, d, h));
        const gleich = A.length === B.length && A.every((x, j) => x === B[j]);
        if (!gleich) abweichung++;
        if (B.length === 0) leer++;
        zeilen.push([i, d, r(h, 4), A.length, B.length, gleich]);
    }
    return { abfragen: zeilen.length, abweichung, leer, zeilen };
}
function kosten(S) {
    const out = [];
    for (const [QW, QH] of GROESSEN) {
        const lose = QW * QH * 128;
        const Y = P.jahrVon(7 * 1000 + 3, STUNDE);
        const t0 = process.hrtime.bigint();
        const personen = zaehlen(S, QW, QH, Y);
        const zaehlS = Number(process.hrtime.bigint() - t0) / 1e9;
        const ms = [], kand = [], tr = [];
        for (let i = 0; i < 220; i++) {
            const st = P.machStadt(S, QW, QH);
            const a = Math.floor(P.u01(S, 9002, i, QW, 1) * lose), c = st.geo(a).door;
            const d = 7 * (1000 + (i % 50)) + 1 + (i % 6); // Werktage
            const t = process.hrtime.bigint();
            const q = P.abfrage(st, c.x, c.z, RADIUS, d, STUNDE);
            const dt = Number(process.hrtime.bigint() - t) / 1e6;
            if (i < 20) continue; // Aufwärmen (gleich für jede Größe)
            ms.push(dt);
            kand.push(q.kandidaten);
            tr.push(q.treffer.length);
        }
        let sackMs = null;
        if (lose <= 29 * 29 * 128) {
            const st = P.machStadt(S, QW, QH), c = st.geo(Math.floor(lose / 2)).door;
            const t = process.hrtime.bigint();
            P.sackScan(st, c.x, c.z, RADIUS, 7 * 1000 + 3, STUNDE);
            sackMs = Number(process.hrtime.bigint() - t) / 1e6;
        }
        const zeile = { viertel: QW * QH, lose, personen, p50ms: r(quantil(ms, 0.5), 3), p95ms: r(quantil(ms, 0.95), 3), kandidatenMittel: r(kand.reduce((s, x) => s + x, 0) / kand.length, 1), trefferMittel: r(tr.reduce((s, x) => s + x, 0) / tr.length, 1), sackScanMs: sackMs === null ? null : r(sackMs, 1), zaehlS: r(zaehlS, 1) };
        console.log("  " + JSON.stringify(zeile));
        out.push(zeile);
    }
    return out;
}
function lauf(s, opt) {
    const S = P.fnv(s);
    const det = { treue: treue(S) };
    const zeit = opt && opt.kosten === false ? null : { kosten: kosten(S) };
    return { det, zeit };
}
module.exports = { lauf };
if (require.main === module) {
    const s = same();
    const { det, zeit } = lauf(s);
    const k = zeit.kosten;
    const pruef = [
        band("Treue: Abweichungen in 100 Abfragen", det.treue.abweichung, 0, 0),
        band("Kosten: p50(5·10⁶) ÷ p50(5·10³)", r(k[2].p50ms / k[0].p50ms, 3), 0, 1.5),
    ];
    zeigen(pruef);
    schreiben("a", { probe: "a Kosten + Treue", same: s, pruef, det: { abweichung: det.treue.abweichung, leer: det.treue.leer, zeilen: det.treue.zeilen }, zeit });
}

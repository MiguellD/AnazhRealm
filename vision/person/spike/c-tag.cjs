// c-tag.cjs — Probe c (gesetz.md §7): eine Person × 7 Tage × 1 440 Minuten, dazu 1 000 Personen derselben Woche.
// Prüft: jede Schlaf-Minute am Bett im eigenen Los · Schritt je Minute ≤ Gehtempo·60 s (kein Sprung, auch über Mitternacht) · jede
// Person-Id genau einmal in der Stadt.
"use strict";
const P = require("./person.cjs");
const { same, band, schreiben, zeigen, r } = require("./probe.cjs");
const D0 = 7 * 1000; // ein Sonntag (Tag mod 7 = 0), 1719
const TAGE = 7;
const N = 1000;

function imLos(o, g) {
    return o.x >= g.lx && o.x <= g.x1 && o.z >= g.lz && o.z <= g.z1;
}
// die Person je Tag (Rolle am Tagesbeginn), oder null, wenn sie an einem Tagesbeginn fehlt
function wochePerson(S, st, adr) {
    const tage = [];
    for (let k = 0; k < TAGE; k++) {
        const m = new Map();
        for (const x of P.bewohner(S, st, adr, P.jahrVon(D0 + k, 0))) m.set(P.personId(x), x);
        tage.push(m);
    }
    const ende = P.jahrVon(D0 + TAGE, 0);
    const out = [];
    let raus = 0;
    for (const [id, x] of tage[0]) {
        if (x.tod <= ende || !tage.every((m) => m.has(id))) {
            raus++;
            continue;
        }
        out.push(tage.map((m) => m.get(id)));
    }
    return { out, raus };
}
function spur(S, st, tage, mitSpur) {
    let prev = null, vPrev = 0, schlaf = 0, schlafFehl = 0, schrittFehl = 0, maxVerh = 0, weg = 0;
    const minutenJeOrt = {};
    const wegJeTag = [];
    for (let k = 0; k < TAGE; k++) {
        const p = tage[k], d = D0 + k, g = p.haus.geo;
        let wegTag = 0;
        for (let m = 0; m < 1440; m++) {
            const h = m / 60, o = P.ort(S, st, p, d, h), v = P.tempo(S, p, P.jahrVon(d, h));
            if (o.ort === "bett" && !o.weg) {
                schlaf++;
                if (!imLos(o, g)) schlafFehl++;
            }
            if (o.weg) weg++;
            if (mitSpur) minutenJeOrt[o.ort] = (minutenJeOrt[o.ort] || 0) + 1;
            if (prev) {
                const s = Math.hypot(o.x - prev.x, o.z - prev.z), vmax = Math.max(v, vPrev) * 60;
                wegTag += s;
                if (s > vmax + 1e-6) schrittFehl++;
                if (s / vmax > maxVerh) maxVerh = s / vmax;
            }
            prev = o;
            vPrev = v;
        }
        wegJeTag.push(r(wegTag, 1));
    }
    return { schlaf, schlafFehl, schrittFehl, maxVerh: r(maxVerh, 4), wegMinuten: weg, minutenJeOrt: mitSpur ? minutenJeOrt : undefined, wegJeTagM: mitSpur ? wegJeTag : undefined };
}
function lauf(s) {
    const S = P.fnv(s);
    const st = P.machStadt(S, 3, 3);
    // die EINE Person: der erste Vater eines Tagelöhner-Hauses (der längste Weg der Stadt: Werk-Los in einem anderen Block)
    let eine = null;
    for (let a = 0; a < st.lose && !eine; a++) {
        if (st.haus(a).werkAdr === a) continue;
        const w = wochePerson(S, st, a);
        for (const t of w.out) if (t[1].rolle === "vater") {
            eine = t;
            break;
        }
    }
    const e = spur(S, st, eine, true);
    const einePerson = { id: P.personId(eine[0]), rolle: eine[1].rolle, gewerbe: eine[0].haus.gewerbe, werkLos: eine[0].haus.werkAdr, alter: r(P.jahrVon(D0, 0) - eine[0].geburt, 2), tempo: r(P.tempo(S, eine[1], P.jahrVon(D0 + 1, 8)), 4), ...e };
    // 1 000 Personen in Adress-Reihenfolge, die die ganze Woche in der Stadt sind
    const viele = [];
    let raus = 0;
    for (let a = 0; a < st.lose && viele.length < N; a++) {
        const w = wochePerson(S, st, a);
        raus += w.raus;
        for (const t of w.out) if (viele.length < N) viele.push(t);
    }
    const sum = { personen: viele.length, nichtGanzeWoche: raus, schlaf: 0, schlafFehl: 0, schrittFehl: 0, maxVerh: 0, wegMinuten: 0, rollen: {} };
    for (const t of viele) {
        const x = spur(S, st, t, false);
        sum.schlaf += x.schlaf;
        sum.schlafFehl += x.schlafFehl;
        sum.schrittFehl += x.schrittFehl;
        sum.wegMinuten += x.wegMinuten;
        if (x.maxVerh > sum.maxVerh) sum.maxVerh = x.maxVerh;
        sum.rollen[t[1].rolle] = (sum.rollen[t[1].rolle] || 0) + 1;
    }
    // jede Id genau einmal in der Stadt (Mittwoch 12 Uhr)
    const ids = new Set();
    let gesamt = 0;
    for (let a = 0; a < st.lose; a++)
        for (const x of P.bewohner(S, st, a, P.jahrVon(D0 + 3, 12))) {
            gesamt++;
            ids.add(P.personId(x));
        }
    return { det: { einePerson, viele: sum, ids: { gesamt, eindeutig: ids.size } }, zeit: null };
}
module.exports = { lauf };
if (require.main === module) {
    const s = same();
    const { det } = lauf(s);
    const e = det.einePerson, v = det.viele;
    const pruef = [
        band("eine Person: Schlaf-Minuten außerhalb des eigenen Loses", e.schlafFehl, 0, 0),
        band("eine Person: Schritte > Tempo·60 s", e.schrittFehl, 0, 0),
        band("1 000 Personen: Schlaf-Minuten außerhalb des eigenen Loses", v.schlafFehl, 0, 0),
        band("1 000 Personen: Schritte > Tempo·60 s", v.schrittFehl, 0, 0),
        band("Ids doppelt in der Stadt", det.ids.gesamt - det.ids.eindeutig, 0, 0),
    ];
    zeigen(pruef);
    console.log(JSON.stringify(det));
    schreiben("c", { probe: "c Tag", same: s, pruef, det });
}

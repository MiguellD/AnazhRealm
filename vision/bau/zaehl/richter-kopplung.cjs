// richter-kopplung.cjs — RICHTER v2 (entscheid-v2.md §2/§5): (1) ZWEITZÄHLUNG der V2-Vielfalt aus der Haus-Liste selbst
// (eigener Code, NICHT stadt-proto.cjs — vielfalt-zweit.cjs prüft nur heute/R1 gegen Runde 1 und druckt V2 aus demselben Lauf);
// (2) die Vielfalt der GEKOPPELTEN Kette: Los/Haushalt/Zeit aus Entwurf B, Tiefe und Geschosse aus dem Grundriss von Entwurf A
// (p3/n1811/bau-spike2/kopplung-richter.cjs → kopplung-richter*.json).
// Maß wie stadt-proto.cjs:111–118 (= pruef/analyse.cjs:49–56): Formen W×D×st, Breiten, Traufe Q90−Q10 (lineare Quantile), Anteil
// der häufigsten Form je Plan, davon Q50. W und D auf 0,5 m wie heute und V2 (halb, gewählt: A rechnet D stetig).
// Aufruf (aus AnazhRealm-OMEN):  node koordination/vision/bau/zaehl/richter-kopplung.cjs [kopplung-richter.json]
"use strict";
const fs = require("fs"), path = require("path");
const S2 = path.join(__dirname, "..", "..", "..", "..", "p3", "n1811", "bau-spike2");
const lies = (f) => { const p = path.join(S2, f); if (!fs.existsSync(p)) throw new Error("richter-kopplung: fehlt " + p); return JSON.parse(fs.readFileSync(p, "utf8")); };
const H = lies("stadt-v2-haeuser-basis.json"), K = lies(process.argv[2] || "kopplung-richter.json");
if (H.length !== 2595 || K.length !== 2595) throw new Error("richter-kopplung: erwartet 2 595/2 595, gelesen " + H.length + "/" + K.length);
const R1 = require(path.join(S2, "gesetz-proto-r1.cjs"));
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const halb = (x) => Math.round(x * 2) / 2, r2 = (v) => Math.round(v * 100) / 100;
function vielfalt(L) {   // L: [{plan, W, D, st, traufe}]
    const form = (h) => h.W + "x" + h.D + "x" + h.st, pp = {};
    for (const h of L) (pp[h.plan] ||= []).push(form(h));
    const modal = (a) => { const c = {}; for (const x of a) c[x] = (c[x] || 0) + 1; return Math.max(...Object.values(c)) / a.length; };
    const T = L.map((h) => h.traufe);
    return { n: L.length, formen: new Set(L.map(form)).size, breiten: new Set(L.map((h) => h.W)).size, spanne: r2(q(T, 0.9) - q(T, 0.1)),
        modalQ50: Math.round(1000 * q(Object.values(pp).map(modal), 0.5)) / 10 };
}
const planVon = (adr) => adr.split("#")[0];
// (1) V2 aus der Haus-Liste
const v2 = vielfalt(H.map((h) => ({ plan: planVon(h.adr), W: h.v2[0], D: h.v2[1], st: h.v2[2], traufe: h.v2[3] })));
const heute = vielfalt(H.map((h) => ({ plan: planVon(h.adr), W: h.heute[0], D: h.heute[1], st: h.heute[2], traufe: 0.55 + 2.55 + 2.35 * (h.heute[2] - 1) })));
// (2) gekoppelt: nur Häuser mit gültigem Grundriss (A); Höhe = Sockel + Σ geschossH(Jahr) (R1 BAU_GESETZ, wie B stadt-proto.cjs:242–244)
const hB = R1.kreuzholz(0.258).h, sockel = R1.BAU_GESETZ.sockel;
const aufstNach = (ev) => { let a = []; for (const e of ev) { const [art, y] = e.split(" "); if (art === "Brand" || art === "Teilung" || art === "Kauf") a = []; else if (art === "Aufstockung") a.push(+y); } return a.slice(0, 2); };
const A = [], AB = [];
for (let i = 0; i < H.length; i++) {
    const h = H[i], k = K[i]; if (k.adr !== h.adr) throw new Error("richter-kopplung: Reihe " + i + " " + k.adr + " ≠ " + h.adr);
    if (!k.ok) continue;
    const D = halb(k.D), jahre = Array(k.st).fill(h.bau);
    const tr = (js) => js.reduce((t, y) => t + R1.geschossH(y, hB), sockel);
    A.push({ plan: planVon(h.adr), W: halb(k.W), D, st: k.st, traufe: tr(jahre) });
    const js = jahre.concat(aufstNach(h.ereignis)); while (js.length > k.st && tr(js) > 2 * D) js.pop();   // stab 2 (FC:3892, gelesen FC:4494), wie B
    AB.push({ plan: planVon(h.adr), W: h.v2[0], D, st: js.length, traufe: tr(js) });
}
const zeile = (n, m) => `${n.padEnd(44)} n ${String(m.n).padStart(4)} · Formen ${String(m.formen).padStart(4)} · Breiten ${String(m.breiten).padStart(3)} · Traufe-Spanne ${m.spanne.toFixed(2)} m · häufigste Form Q50 ${m.modalQ50.toFixed(1)} %`;
console.log(zeile("heute (aus der Haus-Liste, Traufe pool.cjs:103)", heute));
console.log(zeile("V2 Entwurf B (Zweitzählung aus der Haus-Liste)", v2));
console.log(zeile("A-Grundriss auf B-Losen (W = Los, D/st aus A)", vielfalt(A)));
console.log(zeile("A-Grundriss + B-Zeit (W mit Torfahrt, +Aufst.)", vielfalt(AB)));

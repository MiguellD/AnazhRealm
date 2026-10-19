// 1910 B-Kette (OMEN, Messer): Auswerter der Kalt-Läufe mit Ketten-Instrument — je Lauf die letzten Terme, je wartender
// Streu-Region im Blick ihre Zyklen (neu · Scheibe fertig · Wecker mit Zusagen · Abriss) und die Kette ihrer letzten Zusage
// (Zug: Einreihen → Senden (Rang, Bahn) → Faden (Eingang · Studio · fertig, wer vor ihm rechnete) → Ankunft → Satz), die Wald-
// Schlange, die Bauten und die Karten am Ende.     node kette.cjs <roh>/<lauf>.json  > <lauf>-kette.txt
"use strict";
const fs = require("fs");
const j = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const WB = j.weltbildDa;
const s1 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const out = [];
const p = (...a) => out.push(a.join(" "));
const LF = j.lf || {};
const KT = j.kt || {};
const pr = (j.proben || []).filter((x) => Array.isArray(x.lk));
p(`# ${process.argv[2].replace(/.*[\\/]/, "")}  t(Weltbild) ${s1(WB)} s  Version ${j.version}  Adapter ${j.adapter}`);
if (KT.fehler && KT.fehler.length) p("Instrument-Fehler:", JSON.stringify(KT.fehler));
// ── die Terme ──
const term = {};
for (const x of pr) {
    if (WB && x.t > WB) break;
    for (const l of x.lk) {
        const t = l.split(":")[0];
        const z = term[t] || (term[t] = { ab: x.t, bis: x.t, n: [] });
        z.bis = x.t;
        z.n.push([x.t, l.slice(t.length + 1)]);
    }
}
p("\n## Terme (erste · letzte Probe mit dem Term, s)");
for (const [t, z] of Object.entries(term).sort((a, b) => a[1].bis - b[1].bis))
    p(`- ${t}: ${s1(z.ab)} → ${s1(z.bis)}  (Zahl am Ende ${z.n[z.n.length - 1][1]}; ab ${s1(WB - 6000)}: ${z.n.filter((q) => q[0] >= WB - 6000).filter((q, i, a) => i === 0 || q[1] !== a[i - 1][1]).map((q) => s1(q[0]) + "=" + q[1]).join(" ")})`);
// ── die Lieferungen ──
const sendeVon = new Map((LF.s || []).map((x) => [x[0], x]));
const anVon = new Map((LF.an || []).map((x) => [x[1], x]));
const erfVon = new Map((LF.erf || []).map((x) => [x[0], x]));
const satzVon = new Map();
for (const [t, k] of LF.satz || []) if (!satzVon.has(k)) satzVon.set(k, t);
const L = (LF.q || []).map((q, id) => {
    const [tq, key, d, blick, warteLen, pend, nachBild, kopf] = q;
    const s = sendeVon.get(id);
    const an = s ? anVon.get(s[2]) : null;
    const erf = erfVon.get(id);
    const kk = key.split("#")[1];
    const bahn = s ? (/w(\d+)_/.exec(s[2]) ? "w" + /w(\d+)_/.exec(s[2])[1] : "w0") : null;
    return {
        id, key, kk, tq, d, blick, warteLen, kopf,
        ts: s ? s[1] : null, req: s ? s[2] : null, dS: s ? s[3] : null, bS: s ? s[4] : null, wS: s ? s[5] : null, bahn,
        tan: an ? an[0] : null, platte: an ? an[3] : null, atlas: an ? an[6] : null, fein: an && Array.isArray(an[7]) ? an[7] : null,
        terf: erf ? erf[1] : null, tsatz: satzVon.has(kk) && satzVon.get(kk) >= tq ? satzVon.get(kk) : null,
    };
});
const nachKey = new Map();
for (const x of L) if (!nachKey.has(x.kk)) nachKey.set(x.kk, x);
const kette = (x) => {
    if (!x) return "(kein Auftrag im Instrument)";
    const f = x.fein || [];
    const st = f[1] || null;
    return `bestellt ${s1(x.tq)} (d ${x.d} m, ${x.blick ? "im Blick" : "außer Blick"}${x.kopf ? ", Kopf" : ""}, ${x.warteLen} wartend) → gesendet ${s1(x.ts)} an ${x.bahn} (Rang beim Senden d ${x.dS} ${x.bS ? "im Blick" : "außer"}, ${x.wS} wartend) → Faden: Eingang ${s1(f[0])} · Studio ${s1(st)} · fertig ${s1(f[2])} (rechnet ${st && f[2] ? ((f[2] - st) / 1000).toFixed(2) : "–"} s, wartet im Faden ${st && f[0] ? ((st - f[0]) / 1000).toFixed(2) : "–"} s) → an ${s1(x.tan)}${x.platte ? " (Platte)" : ""}${x.atlas ? " (wartet auf Atlas)" : ""} → erfüllt ${s1(x.terf)} → gesetzt ${s1(x.tsatz)}`;
};
// wer im Faden vor ihm rechnete: Studio-Läufe seiner Bahn, die zwischen seinem Eingang und seinem Studio-Start begannen
const vorIhm = (x) => {
    if (!x || !x.fein || !x.fein[0]) return "";
    const [e, st] = x.fein;
    const r = L.filter((y) => y !== x && y.bahn === x.bahn && y.fein && y.fein[1] && y.fein[1] >= e - 1 && y.fein[1] < st)
        .sort((a, b) => a.fein[1] - b.fein[1])
        .map((y) => `${y.kk.replace(/\|ov:.*/, "|ov")}(${((y.fein[2] - y.fein[1]) / 1000).toFixed(2)})`);
    return r.length ? `    vor ihm im Faden ${x.bahn} (${r.length}): ${r.join(" ")}` : "    vor ihm im Faden: niemand";
};
// wer in der Schlange vorging: gesendet zwischen seinem Einreihen und seinem Senden
const vorgaenger = (x) => {
    if (!x || x.ts == null) return "";
    const r = L.filter((y) => y !== x && y.ts != null && y.ts >= x.tq && y.ts < x.ts).sort((a, b) => a.ts - b.ts);
    const jeBahn = {};
    for (const y of r) (jeBahn[y.bahn] = jeBahn[y.bahn] || []).push(`${y.kk.replace(/\|ov:.*/, "|ov")}@${y.dS}${y.bS ? "" : "a"}`);
    return r.length ? `    in der Schlange vor ihm gesendet (${r.length}): ` + Object.entries(jeBahn).map(([b, a]) => `${b}: ${a.slice(0, 14).join(" ")}${a.length > 14 ? " …+" + (a.length - 14) : ""}`).join(" | ") : "    in der Schlange vor ihm gesendet: keiner";
};
// ── Streu ──
p("\n## Streu: die wartenden Regionen im Blick (Proben ab " + s1(WB - 6000) + " s)");
const res = KT.res || {};
const regionen = new Set();
for (const x of pr) if (x.t >= WB - 6000 && x.t <= WB && x.kt && x.kt.s) for (const r of x.kt.s) regionen.add(r[0].split(" ")[0]);
// die Proben je Region: Grund · Zustand · offene Zusagen (nur Wechsel)
for (const rk of regionen) {
    p(`\n### Region ${rk}`);
    const ev = [];
    for (const [t, k] of KT.rneu || []) if (k === rk) ev.push([t, "neu"]);
    for (const [t, k, def, n, nz] of KT.rfertig || []) if (k === rk) ev.push([t, `Scheibe fertig ${def ? "AUFGESCHOBEN" : "steht"} (${n} Instanzen)`]);
    for (const [t, k, labs] of KT.wk || []) if (k === rk) ev.push([t, `Wecker ${labs.length} Zusagen: ` + labs.map((l) => `${l}@${s1(res[l])}`).join(" ")]);
    for (const [t, k, g] of KT.disp || []) if (k === rk) ev.push([t, `Abriss zum Neubau (geweckt ${g})`]);
    ev.sort((a, b) => a[0] - b[0]);
    for (const [t, e] of ev) p(`- ${s1(t)} ${e}`);
    let vorher = "";
    for (const x of pr) {
        if (x.t > WB + 200 || !x.kt || !x.kt.s) continue;
        const r = x.kt.s.find((y) => y[0].split(" ")[0] === rk);
        const z = r ? `${r[0].slice(rk.length + 1)} [${r[1]}] offen ${r[3]}: ${(r[2] || []).join(" ")}` : "steht";
        if (z !== vorher) p(`  Probe ${s1(x.t)}: ${z}`);
        vorher = z;
    }
}
// die Zusagen, die zuletzt kamen (vor dem Bild, die letzten 12) und ihre Ketten
p("\n## Die letzten Zusagen der Streu-Wecker (Ankunft, s) und ihre Kette");
const inWk = new Set();
for (const [t, k, labs] of KT.wk || []) if (regionen.has(k)) for (const l of labs) inWk.add(l);
const spaet = [...inWk].map((l) => [l, res[l]]).sort((a, b) => (b[1] || 1e9) - (a[1] || 1e9)).slice(0, 12);
for (const [l, t] of spaet) {
    p(`- ${l} kam ${s1(t)}`);
    if (l.startsWith("zug:")) {
        const key = l.slice(4);
        const z = (KT.zug || []).find((y) => y[1] === key);
        if (z) p(`    Zug neu ${s1(z[0])} (d ${z[2]} m, ${z[3] ? "im Blick" : "außer"}, Streu-Sammler ${z[4]}) von ${z[5]}`);
        const x = nachKey.get(key);
        p("    " + kette(x));
        p(vorgaenger(x));
        p(vorIhm(x));
    }
}
// ── Wald ──
p("\n## Wald-Schlange (Proben: Schlange · im Flug Zellen · Aufträge · Pflanz-Warten · Gesetz wahr · Zusage offen) und der Wald-Faden");
let wv = "";
for (const x of pr) {
    if (x.t > WB + 200 || !x.kt || !x.kt.w) continue;
    const z = x.kt.w.join(" ");
    if (z !== wv) p(`  ${s1(x.t)}: ${z}`);
    wv = z;
}
const an = new Map((KT.waldAn || []).map((x) => [x[1], x]));
p("Wald-Faden-Aufträge (gesendet → [Start im Faden – fertig] → an; Zellen, Schlange, d min–max m):");
let waldRechnet = 0;
let waldWartet = 0;
let waldZellen = 0;
let waldLetzt = 0;
for (const x of KT.wald || []) {
    const a = an.get(x[1]);
    const b = a && a[2];
    if (b) {
        waldRechnet += b[1] - b[0];
        waldWartet += a[0] - b[1];
        waldLetzt = Math.max(waldLetzt, a[0]);
    }
    waldZellen += x[2];
    p(`  ${s1(x[0])} → ${b ? `[${s1(b[0])}–${s1(b[1])} = ${((b[1] - b[0]) / 1000).toFixed(2)} s]` : "[–]"} → ${s1(a && a[0])}  (${x[2]} Zellen, Q ${x[3]}, d ${x[5]}–${x[6]})`);
}
p(`Σ Wald-Faden vor dem Bild: ${(KT.wald || []).length} Aufträge, ${waldZellen} Zellen, rechnet ${(waldRechnet / 1000).toFixed(2)} s, fertig→an Σ ${(waldWartet / 1000).toFixed(2)} s, letzte Ankunft ${s1(waldLetzt)}`);
if (KT.wq) {
    p("Wer die Wald-Schlange füllt (neue Zellen · Rufe · erste–letzte s):");
    for (const [w, z] of Object.entries(KT.wq).sort((a, b) => b[1][0] - a[1][0]).slice(0, 10)) p(`  ${z[0]} · ${z[1]} · ${s1(z[2])}–${s1(z[3])}  ${w}`);
    p("Neue Zellen je Sekunde:", Object.entries(KT.wqSek || {}).map(([s, n]) => `${s}:${n}`).join(" "));
}
p("Schlange leer (vor dem Bild):", (KT.wpLeer || []).map((x) => s1(x[0]) + (x[1] ? "*" : "")).join(" "), " · waldplan-Zusagen:", (KT.wp || []).map((x) => `#${x[1]} ${s1(x[0])}(Q ${x[2]})→${s1(res["waldplan#" + x[1]])}`).join(" "));
// ── Bauten · Karten · Schlange am Ende ──
p("\n## Bauten und Karten am Ende (det, Proben ab " + s1(WB - 6000) + " s, nur Wechsel)");
let bv = "";
for (const x of pr) {
    if (x.t < WB - 6000 || x.t > WB || !x.det) continue;
    const z = `bauten ${JSON.stringify(x.det.bauten || {})} karten ${JSON.stringify(x.det.karten || {})} q ${JSON.stringify(x.kt && x.kt.q)}`;
    if (z !== bv) p(`  ${s1(x.t)}: ${z}`);
    bv = z;
}
const back = (KT.back || []).filter((b) => b[0] >= WB - 6000);
p(`Karten-Bakes ab ${s1(WB - 6000)} s (${back.length}; t ms Art im-Blick gebacken):`, back.map((b) => `${s1(b[0])} ${b[1]} ${b[2]} ${b[3]}${b[4]}`).join(" · "));
// die letzten Sätze (Lieferungen) vor dem Bild
const spaetSatz = L.filter((x) => x.tsatz != null && x.tsatz <= WB && x.tsatz >= WB - 5000).sort((a, b) => b.tsatz - a.tsatz).slice(0, 15);
p("\n## Die letzten 15 Sätze vor dem Bild (Lieferung beim Namen)");
for (const x of spaetSatz) {
    p(`- ${x.kk} gesetzt ${s1(x.tsatz)}: ` + kette(x));
}
p("\nStreu-Ticks vor dem Bild:", (KT.ticks || []).length, "· letzte:", (KT.ticks || []).slice(-12).map(s1).join(" "));
p("Lade-Bilder (_ankunftsBild) letzte:", (LF.tick || []).slice(-14).map(s1).join(" "));
console.log(out.join("\n"));

// 1910 S6-Takt: die Zahlen des Befunds in EINE Datei (zusammen.txt), jede mit ihrem Rohpfad.
//   node zusammen.cjs <s6takt-ordner>
// 1. CPU-Takt p95/p50 je Sitzung und Arm (welt/ welt2/ welt3/: A ohne S6 · B mit S6 · X = B-Code, Verband von Anfang an aus),
//    Paar-Δ (R1/R2: An–Bn; R3: Block-Paare A7–B8, A8–B9, A9–B10), t
// 2. Der Schalter in EINER Welt (schalter/B7): je Stellung CPU p50/p95/p99, Spanne der Herde; Mittel AN gegen AUS; Profile AN/AUS
// 3. Kandidaten aus dem Frame-Zerleger (welt/*/fz.json): Mittel je Seite (ms je gerendertem Frame) und Raten
// 4. Der Refresh-Zensus (welt2/*/rz.json)
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => {
    try {
        const t = fs.readFileSync(path.join(D, f), "utf8");
        return JSON.parse(t.slice(t.indexOf("{")));
    } catch (_e) {
        return null;
    }
};
const mit = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => Math.sqrt(a.reduce((s, x) => s + (x - mit(a)) ** 2, 0) / Math.max(1, a.length - 1));
const f = (v, n = 3) => (Number.isFinite(v) ? v.toFixed(n) : "–");
const L = [];
// 1
const S = {};
for (const r of ["welt", "welt2", "welt3"]) {
    const d = path.join(D, r);
    if (!fs.existsSync(d)) continue;
    for (const n of fs.readdirSync(d)) {
        const l = lies(`${r}/${n}/lauf.json`);
        if (l && l.cpuTaktMs) S[n] = Object.assign({ pfad: `${r}/${n}/lauf.json` }, l.cpuTaktMs);
    }
}
L.push("## 1. CPU-Takt (lauf 30 --ein 20 --ruhe 300 --regler voll --tiere frei, sauber) Genesis Third", "");
for (const arm of ["A", "B", "X"]) {
    const w = Object.keys(S).filter((n) => n[0] === arm).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
    if (!w.length) continue;
    L.push(`${arm} (${w.length}): p50 ${w.map((n) => S[n].p50).join(" ")} · Ø ${f(mit(w.map((n) => S[n].p50)))} | p95 ${w.map((n) => S[n].p95).join(" ")} · Ø ${f(mit(w.map((n) => S[n].p95)))} | p99 Ø ${f(mit(w.map((n) => S[n].p99)))} | p95 ≤ 5,8: ${w.filter((n) => S[n].p95 <= 5.8).length}/${w.length}`);
}
const paare = [[1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 8], [8, 9], [9, 10]].filter(([a, b]) => S["A" + a] && S["B" + b]);
for (const k of ["p50", "p95"]) {
    const d = paare.map(([a, b]) => S["B" + b][k] - S["A" + a][k]);
    L.push(`Paar-Δ B − A ${k} (${paare.map(([a, b]) => `A${a}/B${b}`).join(" ")}): ${d.map((x) => f(x, 2)).join(" ")} · Ø ${f(mit(d))} · sd ${f(sd(d))} · t ${f(mit(d) / (sd(d) / Math.sqrt(d.length)), 2)}`);
}
const r3 = (arm) => Object.keys(S).filter((n) => n[0] === arm && S[n].pfad.startsWith("welt3"));
L.push(`Runde 3 je Arm p95 Ø: A ${f(mit(r3("A").map((n) => S[n].p95)))} · B ${f(mit(r3("B").map((n) => S[n].p95)))} · X ${f(mit(r3("X").map((n) => S[n].p95)))}`);
// 2
L.push("", "## 2. Der Schalter in EINER B-Welt (schalter/B7): userData.verband aus/an (vb-aus.js / vb-an.js)", "");
const B7 = "schalter/B7";
const pos = fs.existsSync(path.join(D, B7)) ? fs.readdirSync(path.join(D, B7)).filter((x) => /^lauf-\d+-(AN|AUS)\.json$/.test(x)) : [];
pos.sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));
const st = { AN: [], AUS: [] };
for (const p of pos) {
    const [, i, s] = /^lauf-(\d+)-(AN|AUS)/.exec(p);
    const l = lies(`${B7}/${p}`);
    const z = lies(`${B7}/zensus-${i === "0" ? "0" : i + "-" + s}.json`);
    const g = z && z.ergebnis && z.ergebnis.gruppen && z.ergebnis.gruppen[0];
    const c = l.cpuTaktMs;
    L.push(`${i.padStart(2)} ${s.padEnd(3)} cpu ${c.p50}/${c.p95}/${c.p99} · Herde Spanne ${g ? g.spanneM : "–"} m · ${B7}/${p}`);
    if (i !== "0") st[s].push(c);
}
for (const k of ["p50", "p95", "p99"]) L.push(`${k}: AN Ø ${f(mit(st.AN.map((c) => c[k])))} (n ${st.AN.length}) · AUS Ø ${f(mit(st.AUS.map((c) => c[k])))} (n ${st.AUS.length}) · Δ AN − AUS ${f(mit(st.AN.map((c) => c[k])) - mit(st.AUS.map((c) => c[k])))}`);
const prof = (fn) => {
    const p = lies(`${B7}/${fn}`);
    const m = new Map();
    for (const z of (p && p.gesamt) || []) {
        const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(z);
        if (r) m.set(r[3].replace(/:(\d+)$/, ""), Number(r[2]) / p.frames);
    }
    return m;
};
for (const fn of ["profil-1-AN.json", "profil-2-AUS.json", "profil-3-AN.json", "profil-4-AUS.json"]) {
    const m = prof(fn);
    L.push(`${fn}: loop ${f(m.get("loop dirigent-takt.js"))} · _loopRender ${f(m.get("_loopRender dirigent-takt.js"))} · updateCreatures ${f(m.get("updateCreatures kreatur-verhalten.js"))} ms je Frame`);
}
for (const fn of fs.existsSync(path.join(D, B7)) ? fs.readdirSync(path.join(D, B7)).filter((x) => /^tacho-/.test(x)).sort() : []) {
    const t = lies(`${B7}/${fn}`);
    if (t && t.ergebnis) L.push(`${fn}: Takt-CPU Ø ${t.ergebnis.cpu.mittel} p95 ${t.ergebnis.cpu.p95} · feste Last ${t.ergebnis.tacho.mittel} ms`);
}
// 3
L.push("", "## 3. Kandidaten im Frame-Zerleger (welt/*/fz.json, ms je gerendertem Frame, Mittel über 4 Welten je Seite; Raten je s)", "");
const fzK = ["updateCreatures", "_kreaturVerbandZug", "_kreaturVerbandAlarm", "kern.verbandZug", "kern.herdeZug", "_creatureWariness",
    "_applyCreatureSeparation", "_tickKreaturRuhe", "_tickKreaturZiegel", "_animateCompoundMotion", "_leibBuendelStand", "matrixGang",
    "renderOben", "schatten", "wach", "knotenWach", "laeuft", "nAnim", "nKernZug", "nVerbandZug"];
const fz = { A: [], B: [] };
for (const n of fs.readdirSync(path.join(D, "welt")).sort()) {
    const j = lies(`welt/${n}/fz.json`);
    if (j && j.ergebnis) fz[n[0]].push(j.ergebnis);
}
for (const k of fzK) {
    const v = (s) => mit(fz[s].map((e) => (e.zusammen[k] ? e.zusammen[k].mittel : 0)));
    const sch = (s) => mit(fz[s].map((e) => (e.zusammen[k] ? e.zusammen[k].schwer : 0)));
    L.push(`${k.padEnd(26)} A ${f(v("A"), 4)} · B ${f(v("B"), 4)} · Δ ${f(v("B") - v("A"), 4)} | in den Frames ≥ p95: A ${f(sch("A"), 4)} · B ${f(sch("B"), 4)}`);
}
for (const k of ["stufenWechselJeS", "buendelNeuJeS", "gierKipp001JeTierS", "gierKipp005JeTierS", "gierKipp001JeVerbandsTierS", "gierKipp001JeFreiTierS"]) {
    const v = (s) => fz[s].map((e) => e.raten[k]).filter((x) => x != null);
    L.push(`${k.padEnd(28)} A ${v("A").map((x) => f(x, 3)).join(" ") || "–"} · B ${v("B").map((x) => f(x, 3)).join(" ")}`);
}
// 4
L.push("", "## 4. Refresh-Zensus (welt2/*/rz.json, je gerendertem Frame)", "");
for (const n of fs.existsSync(path.join(D, "welt2")) ? fs.readdirSync(path.join(D, "welt2")).sort() : []) {
    const j = lies(`welt2/${n}/rz.json`);
    if (j && j.ergebnis)
        L.push(`${n}: frames ${j.ergebnis.frames} · ${JSON.stringify(j.ergebnis.summe)} · Bündel neu ${j.ergebnis.buendel.reduce((a, b) => a + b.neu, 0)} · welt2/${n}/rz.json`);
}
fs.writeFileSync(path.join(D, "zusammen.txt"), L.join("\n") + "\n");
console.log(L.join("\n"));

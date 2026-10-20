// 2010 Bündel-ABAB: Auswertung PROFIL (g-third stehend, `profil 20 --top 60`: `_diaetRefresh` und seine Kinder inklusiv in ms je
// Frame = Gesamtzeit ÷ Frames des Profil-Fensters, nach Funktions-Namen ohne Zeile; Vorlage p3/n1910/be/e/auswertung.cjs) und
// FAHRT (lauf 20 in voller Fahrt mit Wechsel Third ↔ Ego: fps, Frame p95/p99, CPU-Takt p95/p99, GPU-Durchsatz; fahrt-pruef.js:
// Weg, v p50, Anteil 8–12 m/s, Wechsel). Je Größe Mittel je Seite (Werte je Boot), Δ B − A, 2σ gepoolt, t (Welch), Urteil
// „nicht langsamer", wenn Δ ≤ max(2σ, Auflösung).
//   node auswertung-rest.cjs <buendel-ordner>  → <ordner>/auswertung-rest.md
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{")));
        return j.ergebnis !== undefined ? j.ergebnis : j;
    } catch (_e) {
        return null;
    }
};
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const fx = (d) => (v) => (Number.isFinite(v) ? v.toFixed(d) : "–");
const urteil = (titel, w, fmt, aufl, richtung) => {
    const a = w.A.filter(Number.isFinite),
        b = w.B.filter(Number.isFinite);
    const ma = mittel(a),
        mb = mittel(b),
        d = mb - ma;
    const abw = [...a.map((x) => x - ma), ...b.map((x) => x - mb)];
    const sig = abw.length > 2 ? Math.sqrt(abw.reduce((s, x) => s + x * x, 0) / (abw.length - 2)) : NaN;
    const v = (q, m) => q.reduce((s, x) => s + (x - m) ** 2, 0) / Math.max(1, q.length - 1);
    const se = Math.sqrt(v(a, ma) / Math.max(1, a.length) + v(b, mb) / Math.max(1, b.length));
    const schlechter = richtung > 0 ? d : -d;
    const u = Number.isFinite(d) && Number.isFinite(sig) ? (schlechter <= Math.max(2 * sig, aufl) + 1e-9 ? "nicht langsamer" : "LANGSAMER") : "–";
    return `| ${titel} | ${fmt(ma)} (${w.A.map(fmt).join(" · ")}) | ${fmt(mb)} (${w.B.map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${se > 0 ? (d / se).toFixed(2) : "–"} | ${u} |`;
};
const KOPF = "| Größe | A 80258f0e | B f5b66780 | Δ B − A | 2σ | t | Urteil |\n|---|---|---|---|---|---|---|";
const o = [];
// PROFIL
const karte = (p, feld) => {
    const m = new Map();
    for (const z of (p && p[feld]) || []) {
        const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(z);
        if (!r) continue;
        const k = r[3].replace(/:(\d+)$/, "").trim();
        if (/pptr:evaluate/.test(k)) continue;
        m.set(k, (m.get(k) || 0) + Number(r[2]));
    }
    return m;
};
const G = path.join(D, "gehen");
const prof = {};
for (const f of fs.existsSync(G) ? fs.readdirSync(G).filter((x) => /^g-third-[AB]\d-profil\.json$/.test(x)).sort() : []) {
    const boot = f.replace("-profil.json", "").replace("g-third-", "");
    const P = lies(path.join(G, f));
    const g = karte(P, "gesamt"),
        s = karte(P, "selbst");
    const fr = (P && P.frames) || NaN;
    const finde = (m, name, exakt) => {
        let sum = 0;
        for (const [k, v] of m) {
            const kopf = k.split(" ")[0];
            if (kopf === name || (!exakt && kopf.endsWith("." + name))) sum += v; // exakt: nur der Vendor-Name (renderer._renderBundles umhüllt ihn)
        }
        return sum;
    };
    prof[boot] = { fr, loop: finde(g, "loop") / fr, ref: finde(g, "_diaetRefresh") / fr, refSelbst: finde(s, "_diaetRefresh") / fr, geteilt: finde(g, "_diaetGeteiltSchreiben") / fr, gang: finde(g, "_diaetObjektGang") / fr, render: finde(g, "_loopRender") / fr, needs: finde(g, "o.needsRefresh") / fr, bundles: finde(g, "_renderBundles", true) / fr };
}
const pw = (k) => ({ A: Object.keys(prof).filter((b) => b[0] === "A").sort().map((b) => prof[b][k]), B: Object.keys(prof).filter((b) => b[0] === "B").sort().map((b) => prof[b][k]) });
o.push("## Profil Genesis Third stehend (`profil 20 --regler voll --top 60 --tiere frei`, ms je Frame inklusiv; Roh gehen/g-third-<A|B><n>-profil.json)\n");
o.push(KOPF);
for (const [k, t] of [["ref", "`_diaetRefresh` inklusiv"], ["needs", "`o.needsRefresh` inkl. (alle Stellen)"], ["refSelbst", "`_diaetRefresh` selbst"], ["geteilt", "`_diaetGeteiltSchreiben` inkl."], ["gang", "`_diaetObjektGang` inkl."], ["render", "`_loopRender` inkl."], ["bundles", "`_renderBundles` (three) inkl."], ["loop", "`loop` (Takt im Profil) inkl."]])
    o.push(urteil(t, pw(k), fx(3), 0.001, 1));
o.push(`\nProfil-Frames je Boot: ${Object.entries(prof).map(([b, p]) => b + " " + p.fr).join(" · ")}\n`);
// FAHRT
const FA = path.join(D, "fahrt");
const fahrt = {};
for (const f of fs.existsSync(FA) ? fs.readdirSync(FA).filter((x) => /^fahrt-[AB]\d-lauf\.txt$/.test(x)).sort() : []) {
    const boot = f.replace("fahrt-", "").replace("-lauf.txt", "");
    fahrt[boot] = { l: lies(path.join(FA, f)), p: lies(path.join(FA, `fahrt-${boot}-pruef.txt`)) };
}
const fw = (fn) => ({ A: Object.keys(fahrt).filter((b) => b[0] === "A").sort().map((b) => fn(fahrt[b])), B: Object.keys(fahrt).filter((b) => b[0] === "B").sort().map((b) => fn(fahrt[b])) });
o.push("## Fahrt (Wiese, GT, Fahrer bis 10 m/s, Wechsel Third ↔ Ego je 120 Takte bei v ≥ 8; `lauf 20 --ein 2`; Roh fahrt/fahrt-<A|B><n>-{lauf,pruef,auf}.txt)\n");
o.push(KOPF);
const L = (g) => (x) => (x.l ? g(x.l) : NaN);
o.push(urteil("fps", fw(L((l) => l.fps)), fx(1), 0.1, -1));
o.push(urteil("Frame p95 ms", fw(L((l) => l.frameMs && l.frameMs.p95)), fx(1), 0.1, 1));
o.push(urteil("Frame p99 ms", fw(L((l) => l.frameMs && l.frameMs.p99)), fx(1), 0.1, 1));
o.push(urteil("CPU-Takt p95 ms", fw(L((l) => l.cpuTaktMs && l.cpuTaktMs.p95)), fx(1), 0.1, 1));
o.push(urteil("CPU-Takt p99 ms", fw(L((l) => l.cpuTaktMs && l.cpuTaktMs.p99)), fx(1), 0.1, 1));
o.push(urteil("GPU-Durchsatz p50 ms", fw(L((l) => l.gpuDurchsatzMs && l.gpuDurchsatzMs.p50)), fx(2), 0.01, 1));
o.push(urteil("über 33 ms %", fw(L((l) => l.ueber33)), fx(2), 0.01, 1));
const Pp = (g) => (x) => (x.p ? g(x.p) : NaN);
o.push("\n| Fahrt je Boot | Weg m | v p50 | Anteil 8–12 m/s | Wechsel | Ego-Anteil | sitzt |\n|---|---|---|---|---|---|---|");
for (const b of Object.keys(fahrt).sort((x, y) => x.slice(1).localeCompare(y.slice(1)) || x.localeCompare(y))) {
    const p = fahrt[b].p || {};
    o.push(`| ${b} | ${p.weg} | ${p.v50} | ${p.anteil8bis12} | ${p.wechsel} | ${p.egoAnteil} | ${p.geritten} |`);
}
o.push("\n" + KOPF.split("\n")[0].replace("Größe", "Fahrt-Größe") + "\n|---|---|---|---|---|---|---|");
o.push(urteil("Weg m", fw(Pp((p) => p.weg)), fx(1), 0.1, -1));
o.push(urteil("Anteil 8–12 m/s", fw(Pp((p) => p.anteil8bis12)), fx(3), 0.001, -1));
fs.writeFileSync(path.join(D, "auswertung-rest.md"), o.join("\n") + "\n");
console.log(o.join("\n"));

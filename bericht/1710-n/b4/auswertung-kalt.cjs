// 1710-n B4 Auswertung KALT: je Lauf t(Weltbild), Ring ganz (erste Probe ohne „der Boden wächst"), Horizont ganz (erste Probe
// ohne „der Horizont wächst"), `_diaetGang` Selbstzeit bis zum Weltbild (CPU-Profil 0,5 ms), Haupt-Faden blockiert (longtask-Summe
// bis Weltbild), GPU-Takt Median + Drossel (nvidia-smi je s); je Seite Median + Spannweite.  node auswertung-kalt.cjs <kalt-ordner>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2] || path.join(__dirname, "kalt");
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN;
};
const s2 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const ms0 = (v) => (Number.isFinite(v) ? String(Math.round(v)) : "–");
function ersteOhne(proben, re) {
    let sah = false;
    for (const p of proben) {
        if (!Array.isArray(p.fehlt)) continue;
        const traegt = p.fehlt.some((f) => re.test(f));
        if (traegt) sah = true;
        else if (sah) return p.t;
    }
    return sah ? NaN : 0; // nie gesehen = von Anfang an da
}
function selbstZeit(prof, re, bis) {
    if (!prof) return NaN;
    const byId = new Map(prof.nodes.map((n) => [n.id, n]));
    let t = prof.startTime,
        sum = 0;
    for (let i = 0; i < prof.samples.length; i++) {
        t += prof.timeDeltas[i];
        const n = byId.get(prof.samples[i]);
        const dt = i + 1 < prof.timeDeltas.length ? prof.timeDeltas[i + 1] : 0;
        if (n && re.test(n.callFrame.functionName)) sum += dt;
    }
    return sum / 1000; // µs → ms
}
const zeilen = [];
for (const n of fs.readdirSync(D).filter((x) => /^[AB]\d+\.json$/.test(x)).sort()) {
    const N = n.replace(".json", "");
    const j = JSON.parse(fs.readFileSync(path.join(D, n), "utf8"));
    const pf = path.join(D, N + ".cpuprofile");
    const prof = fs.existsSync(pf) ? JSON.parse(fs.readFileSync(pf, "utf8")) : null;
    const wb = j.weltbildDa;
    const lang = (j.lang || []).filter(([t]) => t <= wb).reduce((s, [, d]) => s + d, 0);
    let takt = NaN,
        drossel = "";
    const smi = path.join(D, N + "-smi.csv");
    if (fs.existsSync(smi)) {
        const z = fs.readFileSync(smi, "utf8").trim().split(/\r?\n/).map((l) => l.split(", "));
        takt = med(z.map((c) => parseFloat(c[1])).filter((v) => v > 300));
        const dr = new Map();
        for (const c of z) dr.set(c[6], (dr.get(c[6]) || 0) + 1);
        drossel = [...dr].map(([k, v]) => `${k}×${v}`).join(" ");
    }
    zeilen.push({
        lauf: N,
        seite: N[0],
        weltbild: wb,
        ring: ersteOhne(j.proben || [], /der Boden wächst/),
        horizont: ersteOhne(j.proben || [], /der Horizont wächst/),
        diaet: selbstZeit(prof, /_diaetGang/, wb),
        blockiert: lang,
        takt,
        drossel,
        version: j.version,
        adapter: j.adapter,
        dc: j.bild && j.bild.dc,
        dreiecke: j.bild && j.bild.dreiecke,
    });
}
console.log("| Lauf | Version | t(Weltbild) s | Ring ganz s | Horizont ganz s | `_diaetGang` ms | longtask bis Weltbild ms | GPU-Takt MHz | Drossel | Bild dc / Dreiecke |");
console.log("|---|---|---|---|---|---|---|---|---|---|");
for (const z of zeilen)
    console.log(
        `| ${z.lauf} | ${z.version} | ${s2(z.weltbild)} | ${s2(z.ring)} | ${s2(z.horizont)} | ${ms0(z.diaet)} | ${ms0(z.blockiert)} | ${ms0(z.takt)} | ${z.drossel} | ${z.dc} / ${z.dreiecke} |`
    );
console.log("\n| Größe | A Median (Spannweite) | B Median (Spannweite) | Δ B − A |\n|---|---|---|---|");
for (const [k, name, f] of [
    ["weltbild", "t(Weltbild) s", s2],
    ["ring", "Ring ganz s", s2],
    ["horizont", "Horizont ganz s", s2],
    ["diaet", "`_diaetGang` ms", ms0],
    ["blockiert", "longtask bis Weltbild ms", ms0],
    ["takt", "GPU-Takt MHz", ms0],
]) {
    const a = zeilen.filter((z) => z.seite === "A").map((z) => z[k]);
    const b = zeilen.filter((z) => z.seite === "B").map((z) => z[k]);
    const sp = (x) => {
        const y = x.filter(Number.isFinite);
        return y.length ? `${f(Math.min(...y))}–${f(Math.max(...y))}` : "–";
    };
    console.log(`| ${name} | ${f(med(a))} (${sp(a)}) | ${f(med(b))} (${sp(b)}) | ${f(med(b) - med(a))} |`);
}
fs.writeFileSync(path.join(D, "auswertung-kalt.json"), JSON.stringify(zeilen, null, 1));

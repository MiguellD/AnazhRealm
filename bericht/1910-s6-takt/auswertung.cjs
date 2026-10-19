// 1910 S6-Takt: Auswertung der Welten unter welt/<A|B><n>/ (lauf.json · profil.json · takt.json · fz.json · zensus-*.json).
//   node auswertung.cjs <s6takt-ordner> [--top 40]
// Schreibt auswertung.md + auswertung.json in den Ordner:
//   1. je Welt: CPU-Takt p50/p95/p99 (lauf, sauber), Tiere/Verbände, fz-Raten (Stufen-Wechsel/s, Bündel neu/s, Gier-Kippen)
//   2. Profil je Funktion NACH NAMEN (Name + Datei, ohne Zeile; anonyme je Datei zusammen): ms je Frame (gesampelt/Frames),
//      Median je Seite, Δ B − A, selbst und gesamt
//   3. Takt-Linse je Loop-Glied: Mittel je Takt, Median je Seite, Δ
//   4. Frame-Zerleger je Spalte: Mittel über alle gerenderten Takte und in den schweren Takten (cpu ≥ p95 der Welt), Median je
//      Seite, Δ — die schweren Takte zählen
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const TOP = Number((process.argv.indexOf("--top") > 0 && process.argv[process.argv.indexOf("--top") + 1]) || 40);
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        return JSON.parse(t.slice(t.indexOf("{")));
    } catch (_e) {
        return null;
    }
};
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = Math.floor(b.length / 2);
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const mit = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((s, x) => s + x, 0) / b.length : NaN;
};
const sd = (a) => {
    const b = a.filter(Number.isFinite);
    if (b.length < 2) return NaN;
    const m = mit(b);
    return Math.sqrt(b.reduce((s, x) => s + (x - m) ** 2, 0) / (b.length - 1));
};
const f = (v, n = 3) => (Number.isFinite(v) ? v.toFixed(n) : "–");
const welten = fs
    .readdirSync(path.join(D, "welt"))
    .filter((n) => /^[AB]\d+$/.test(n) && fs.existsSync(path.join(D, "welt", n, "fz.json")))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)) || a.localeCompare(b));
const W = {};
for (const n of welten) {
    const d = path.join(D, "welt", n);
    const lauf = lies(path.join(d, "lauf.json"));
    const profil = lies(path.join(d, "profil.json"));
    const takt = lies(path.join(d, "takt.json"));
    const fzj = lies(path.join(d, "fz.json"));
    const fz = fzj && fzj.ergebnis;
    const z0 = lies(path.join(d, "zensus-0.json"));
    const z1 = lies(path.join(d, "zensus-1.json"));
    W[n] = { seite: n[0], lauf, profil, takt, fz, z0: z0 && z0.ergebnis, z1: z1 && z1.ergebnis };
}
const seiten = { A: welten.filter((n) => n[0] === "A"), B: welten.filter((n) => n[0] === "B") };
const aus = { welten: {}, profil: {}, takt: {}, fz: {} };
const L = [];
L.push(`# S6-Takt Auswertung (${welten.join(" ")})`, "");
// 1. je Welt
L.push("## Je Welt", "", "| Welt | CPU p50 | p95 | p99 | Frame p95 | Tiere | Verbände ≥2 (Glieder) | wach Ø | läuft Ø | Flucht Ø | Stufen/s | Bündel neu/s | Gier-Kipp 0,01 je Tier-s | 0,05 | im Verband | frei | fz CPU p95 |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
for (const n of welten) {
    const w = W[n];
    const c = (w.lauf && w.lauf.cpuTaktMs) || {};
    const z = w.z0 || {};
    const vb = (z.verbaende || []).filter((v) => v.n >= 2);
    const zs = (w.fz && w.fz.zusammen) || {};
    const ra = (w.fz && w.fz.raten) || {};
    const e = {
        cpu: c,
        frameP95: w.lauf && w.lauf.frameMs ? w.lauf.frameMs.p95 : null,
        tiere: z.gesamt,
        verbaende: vb.map((v) => v.n),
        wach: zs.wach && zs.wach.mittel,
        laeuft: zs.laeuft && zs.laeuft.mittel,
        flucht: zs.flucht && zs.flucht.mittel,
        raten: ra,
        fzCpu: w.fz && w.fz.cpu,
    };
    aus.welten[n] = e;
    L.push(`| ${n} | ${f(c.p50, 2)} | ${f(c.p95, 2)} | ${f(c.p99, 2)} | ${f(e.frameP95, 1)} | ${e.tiere} | ${vb.length} (${e.verbaende.join("/")}) | ${f(e.wach, 1)} | ${f(e.laeuft, 1)} | ${f(e.flucht, 2)} | ${f(ra.stufenWechselJeS, 3)} | ${f(ra.buendelNeuJeS, 3)} | ${f(ra.gierKipp001JeTierS, 3)} | ${f(ra.gierKipp005JeTierS, 3)} | ${f(ra.gierKipp001JeVerbandsTierS, 3)} | ${f(ra.gierKipp001JeFreiTierS, 3)} | ${f(e.fzCpu && e.fzCpu.p95, 2)} |`);
}
const zeileSeite = (name, get, n = 3) => {
    const a = seiten.A.map(get),
        b = seiten.B.map(get);
    const ma = med(a),
        mb = med(b);
    return { name, A: ma, B: mb, d: mb - ma, mA: mit(a), mB: mit(b), sA: sd(a), sB: sd(b), a, b };
};
L.push("", "## Szene je Welt (lauf): Befehle und Dreiecke je Frame (Mittel), Stellgrößen", "");
for (const n of welten) {
    const l = W[n].lauf || {};
    const sg = l.stellgroessen || {};
    L.push(`- ${n}: Befehle ${l.befehle && l.befehle.mittel} · Dreiecke ${l.dreiecke && l.dreiecke.mittel} · loadScale ${sg.loadScale} · Ring ${sg.ring} · foliage ${sg.foliageRadius}/${sg.foliageDichte} · Schatten-Intervall ${sg.schattenIntervall} · fps ${l.fps} · Leine aus ${l.leine && l.leine.ausgesetztPct} %`);
}
L.push("", "## CPU-Takt (lauf, sauber) je Seite", "");
for (const k of ["p50", "p95", "p99"]) {
    const z = zeileSeite(k, (n) => W[n].lauf && W[n].lauf.cpuTaktMs && W[n].lauf.cpuTaktMs[k]);
    aus.welten["cpu_" + k] = z;
    L.push(`- ${k}: A ${f(z.A, 2)} (${z.a.map((x) => f(x, 2)).join(" ")}) · B ${f(z.B, 2)} (${z.b.map((x) => f(x, 2)).join(" ")}) · Δ med ${f(z.d, 3)} · Δ mittel ${f(z.mB - z.mA, 3)}`);
}
// 2. Profil
const profilKarte = (p, feld) => {
    const m = new Map();
    if (!p || !Array.isArray(p[feld])) return m;
    const frames = p.frames || 1;
    for (const zeile of p[feld]) {
        const r = /^\s*([\d.]+) %\s+(\d+) ms\s+(.*)$/.exec(zeile);
        if (!r) continue;
        const ms = Number(r[2]);
        let key = r[3].replace(/:(\d+)$/, "");
        m.set(key, (m.get(key) || 0) + ms / frames);
    }
    return m;
};
for (const feld of ["selbst", "gesamt"]) {
    const karten = {};
    for (const n of welten) karten[n] = profilKarte(W[n].profil, feld);
    const keys = new Set();
    for (const n of welten) for (const k of karten[n].keys()) keys.add(k);
    const zeilen = [];
    for (const k of keys) {
        const z = zeileSeite(k, (n) => (karten[n].has(k) ? karten[n].get(k) : NaN));
        z.nA = z.a.filter(Number.isFinite).length;
        z.nB = z.b.filter(Number.isFinite).length;
        if (z.nA >= Math.min(3, seiten.A.length) && z.nB >= Math.min(3, seiten.B.length)) zeilen.push(z);
    }
    zeilen.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    aus.profil[feld] = zeilen.slice(0, 120).map((z) => ({ name: z.name, A: z.A, B: z.B, d: z.d, a: z.a, b: z.b }));
    L.push("", `## Profil ${feld} je Funktion (ms je Frame, Median je Seite; nach |Δ|)`, "", "| Funktion | A | B | Δ | A je Welt | B je Welt |", "|---|---|---|---|---|---|");
    for (const z of zeilen.slice(0, TOP))
        L.push(`| ${z.name} | ${f(z.A)} | ${f(z.B)} | ${f(z.d)} | ${z.a.map((x) => f(x)).join(" ")} | ${z.b.map((x) => f(x)).join(" ")} |`);
}
L.push("", "Schwelle der Top-Liste (kleinster Eintrag, ms je Frame): " + welten.map((n) => n + " " + f(Math.min(...[...profilKarte(W[n].profil, "selbst").values()]))).join(" · "));
L.push("", "Frames je Profil: " + welten.map((n) => `${n} ${W[n].profil ? W[n].profil.frames : "–"} (${W[n].profil ? W[n].profil.gesampeltMs : "–"} ms)`).join(" · "));
// 3. Takt
{
    const keys = new Set();
    for (const n of welten) for (const e of (W[n].takt && W[n].takt.top) || []) keys.add(e.name);
    const zeilen = [];
    const get = (n, k, fld) => {
        const e = ((W[n].takt && W[n].takt.top) || []).find((x) => x.name === k);
        return e ? e[fld] : 0;
    };
    for (const k of keys) zeilen.push(Object.assign(zeileSeite(k, (n) => get(n, k, "mittel")), { maxA: med(seiten.A.map((n) => get(n, k, "max"))), maxB: med(seiten.B.map((n) => get(n, k, "max"))) }));
    zeilen.sort((x, y) => Math.abs(y.d) - Math.abs(x.d));
    aus.takt = { zeilen, p50: zeileSeite("p50", (n) => W[n].takt && W[n].takt.p50), p95: zeileSeite("p95", (n) => W[n].takt && W[n].takt.p95), rest: zeileSeite("rest", (n) => W[n].takt && W[n].takt.restMittel) };
    L.push("", "## Takt-Linse (Render gestubbt, 600 Takte) je Glied: ms je Takt, Median je Seite", "", `Takt p50 A ${f(aus.takt.p50.A, 2)} B ${f(aus.takt.p50.B, 2)} · p95 A ${f(aus.takt.p95.A, 2)} B ${f(aus.takt.p95.B, 2)} · Rest A ${f(aus.takt.rest.A)} B ${f(aus.takt.rest.B)}`, "", "| Glied | A | B | Δ | max A | max B |", "|---|---|---|---|---|---|");
    for (const z of zeilen.slice(0, 25)) L.push(`| ${z.name} | ${f(z.A)} | ${f(z.B)} | ${f(z.d)} | ${f(z.maxA, 1)} | ${f(z.maxB, 1)} |`);
}
// 4. Frame-Zerleger
{
    const keys = new Set();
    for (const n of welten) for (const k of Object.keys((W[n].fz && W[n].fz.zusammen) || {})) keys.add(k);
    const zeilen = [];
    for (const k of keys) {
        const g = (fld) => (n) => {
            const e = W[n].fz && W[n].fz.zusammen && W[n].fz.zusammen[k];
            return e ? e[fld] : 0;
        };
        const alle = zeileSeite(k, g("mittel"));
        const schwer = zeileSeite(k, g("schwer"));
        const p95 = zeileSeite(k, g("p95"));
        const p99 = zeileSeite(k, g("p99"));
        zeilen.push({ name: k, alle, schwer, p95, p99 });
    }
    zeilen.sort((x, y) => Math.abs(y.schwer.d) - Math.abs(x.schwer.d));
    aus.fz = zeilen.map((z) => ({ name: z.name, mittelA: z.alle.A, mittelB: z.alle.B, mittelD: z.alle.d, schwerA: z.schwer.A, schwerB: z.schwer.B, schwerD: z.schwer.d, p95A: z.p95.A, p95B: z.p95.B, p99A: z.p99.A, p99B: z.p99.B, schwerJe: { a: z.schwer.a, b: z.schwer.b } }));
    const cp = (k) => zeileSeite(k, (n) => W[n].fz && W[n].fz.cpu && W[n].fz.cpu[k]);
    L.push("", "## Frame-Zerleger (echter Loop mit Hüllen, 30 s): je Spalte ms je gerendertem Takt — alle Takte und die SCHWEREN (cpu ≥ p95 der Welt)", "", `fz CPU p50 A ${f(cp("p50").A, 2)} B ${f(cp("p50").B, 2)} · p95 A ${f(cp("p95").A, 2)} B ${f(cp("p95").B, 2)} · p99 A ${f(cp("p99").A, 2)} B ${f(cp("p99").B, 2)}`, "", "| Spalte | Ø A | Ø B | Δ Ø | schwer A | schwer B | Δ schwer | p95 A | p95 B | p99 A | p99 B | schwer je Welt A | B |", "|---|---|---|---|---|---|---|---|---|---|---|---|---|");
    for (const z of zeilen.slice(0, TOP))
        L.push(`| ${z.name} | ${f(z.alle.A)} | ${f(z.alle.B)} | ${f(z.alle.d)} | ${f(z.schwer.A)} | ${f(z.schwer.B)} | ${f(z.schwer.d)} | ${f(z.p95.A)} | ${f(z.p95.B)} | ${f(z.p99.A)} | ${f(z.p99.B)} | ${z.schwer.a.map((x) => f(x, 2)).join(" ")} | ${z.schwer.b.map((x) => f(x, 2)).join(" ")} |`);
}
fs.writeFileSync(path.join(D, "auswertung.md"), L.join("\n") + "\n");
fs.writeFileSync(path.join(D, "auswertung.json"), JSON.stringify(aus, null, 1));
console.log(L.slice(0, 40).join("\n"));

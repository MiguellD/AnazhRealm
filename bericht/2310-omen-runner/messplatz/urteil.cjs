// p3/messplatz/urteil.cjs — der Richter des Messplatz-Dienstes (koordination zug/messplatz.md): je Zelle aus den Roh-Dateien einer
// ABAB-Serie (MP_OUT) das Urteil, und ob die Zelle von 2+2 auf 4+4 verlängert wird.
//   node urteil.cjs <out> <zelle,zelle,…> [--md datei] [--json datei]
// Gehen-Zellen (w-ego, g-third, d-ego, stadt, sturm): werkzeug/auswertung-gehen.cjs, Kern = fps · Frame p95 · CPU-Takt p95 · gpu-bank ·
// Belegung p95, Δ ≤ max(2σ gepoolt, Auflösung). VERLÄNGERN, wenn der Kern-Richter anschlägt oder eine Kern-Größe in Richtung langsamer
// zwischen 1σ und 2σ liegt — nur bei n = 2 je Seite; den 1σ–2σ-Auslöser tragen nur CPU-Takt p95, gpu-bank und Frame p95 (fps und
// Belegung hängen an ihnen; mit neun Größen lag bei n = 2 fast jede Zelle zufällig irgendwo zwischen 1σ und 2σ — z7 verlängerte 5 von 5). Fahrt: nur volle Fahrten (v50 ≥ 8 m/s) gegeneinander; fehlt einer Seite nach 4+4
// eine volle Fahrt, ist die Zelle UNENTSCHIEDEN. Zählungen (Befehle, Dreiecke, VRAM) stehen in der Tabelle, sie urteilen nicht.
"use strict";
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const [OUT, ZL] = process.argv.slice(2);
const opt = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const WZ = path.join(__dirname, "werkzeug");
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
        return j.ergebnis || j;
    } catch (_e) {
        return null;
    }
};
const m = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const v = (a) => (a.length > 1 ? a.reduce((x, y) => x + (y - m(a)) ** 2, 0) / (a.length - 1) : 0);
const sigD = (a, b) => {
    const va = a.length > 1 ? v(a) : v(b), vb = b.length > 1 ? v(b) : v(a);
    return Math.sqrt((va + vb) / 2) * Math.sqrt(1 / a.length + 1 / b.length);
};
const f2 = (x) => (Number.isFinite(x) ? (Math.abs(x) >= 1000 ? String(Math.round(x)) : String(+x.toFixed(2))) : "–");
const boots = (dir, zelle, suffix) =>
    fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((f) => f.length === zelle.length + suffix.length + 8 && f.startsWith(zelle + "-") && f.endsWith("-" + suffix + ".txt")).map((f) => f.slice(zelle.length + 1, zelle.length + 3)).filter((b) => /^[AB][0-9]$/.test(b)).sort()
        : [];
const zaehl = (dir, zelle, suffix) => {
    const r = {};
    for (const b of boots(dir, zelle, suffix)) {
        const e = lies(path.join(dir, `${zelle}-${b}-${suffix}.txt`));
        if (!e) continue;
        for (const [k, f] of [["Befehle", (x) => x.befehle.mittel], ["Dreiecke p95", (x) => x.dreiecke.p95], ["VRAM MB", (x) => x.vramMB.jetzt]]) {
            let w;
            try { w = f(e); } catch (_e) { w = NaN; }
            if (!Number.isFinite(w)) continue;
            (r[k] = r[k] || { A: [], B: [] })[b[0]].push(w);
        }
    }
    return r;
};
const AUSLOESER = new Set(["Frame p95 ms", "CPU-Takt p95 ms", "GPU je Bild ms (gpu-bank)"]); // der 1σ–2σ-Auslöser der Verlängerung
// KLAR NACH 2+2 (30.10., z78-bisekt: CPU-Takt p95 7,4 → 9,8 ms = 12σ, geht Frame p95 41,7 → 50 ms — die 4+4 kosteten 25 GTX-Minuten ohne
// neue Auskunft): eine Kern-Größe, deren Δ in Richtung langsamer 4σ UND 10 % des A-Werts übersteigt, urteilt LANGSAMER schon bei n = 2;
// verlängert wird nur das Grenzband (2σ–4σ oder unter 10 %) und der 1σ–2σ-Auslöser. ZWEI stetige Größen müssen es tragen: Frame p95/p99
// liegen auf dem vsync-Raster (16,8 · 33,4 · 41,7 · 50 ms), bei n = 2 täuscht dort σ = 0 (z77-abab: geht Frame p95 33,4 → 41,7 nach 2+2,
// nach 4+4 nicht-langsamer) — eine stufige Größe urteilt nie allein
const klar = (ds, sig, ma) => Number.isFinite(sig) && sig > 0 && Number.isFinite(ma) && ds > 4 * sig && ds >= 0.1 * Math.abs(ma);
const STUFIG = new Set(["Frame p95", "Frame p99", "Frame p95 ms", "Frame p99 ms"]);
const ergebnisse = [];
for (const zelle of ZL.split(",").filter(Boolean)) {
    if (zelle === "fahrt") {
        const dir = path.join(OUT, "fahrt");
        const je = boots(dir, "fahrt", "pruef").map((b) => ({ b, l: lies(path.join(dir, `fahrt-${b}-lauf.txt`)), p: lies(path.join(dir, `fahrt-${b}-pruef.txt`)) }));
        const n = { A: je.filter((x) => x.b[0] === "A").length, B: je.filter((x) => x.b[0] === "B").length };
        const voll = je.filter((x) => x.l && x.p && x.p.v50 >= 8);
        const KERN = [["fps", (l) => l.fps, -1, 0.1], ["Frame p95", (l) => l.frameMs.p95, 1, 0.1], ["Frame p99", (l) => l.frameMs.p99, 1, 0.1], ["CPU-Takt p95", (l) => l.cpuTaktMs.p95, 1, 0.1], ["Belegung p95", (l) => l.belegung.belegungMs.p95, 1, 0.01]];
        const a = voll.filter((x) => x.b[0] === "A"), b = voll.filter((x) => x.b[0] === "B");
        const zeilen = [];
        let urteil = "nicht-langsamer", verlaengern = false, klarN = 0;
        if (!a.length || !b.length || a.length + b.length < 3) {
            if (Math.min(n.A, n.B) < 4) verlaengern = true;
            else urteil = "UNENTSCHIEDEN";
        }
        if (a.length && b.length)
            for (const [titel, f, richtung, aufl] of KERN) {
                const xa = a.map((x) => f(x.l)), xb = b.map((x) => f(x.l));
                const d = m(xb) - m(xa), s = a.length + b.length > 2 ? sigD(xa, xb) : NaN, ds = richtung * d;
                const langsam = Number.isFinite(s) ? ds > Math.max(2 * s, aufl) : false;
                if (langsam && titel !== "Frame p99") { if (!STUFIG.has(titel) && klar(ds, s, m(xa))) klarN++; if (Math.min(n.A, n.B) < 4) verlaengern = true; else urteil = "LANGSAMER"; }
                if ((titel === "Frame p95" || titel === "CPU-Takt p95") && Number.isFinite(s) && ds > s && ds <= 2 * s && Math.min(n.A, n.B) < 4) verlaengern = true;
                zeilen.push({ gang: "volle Fahrt", titel, A: m(xa), B: m(xb), d, zweiSigma: 2 * s, u: langsam ? "LANGSAMER" : "nicht langsamer" });
            }
        if (klarN >= 2) urteil = "LANGSAMER";
        if (urteil === "LANGSAMER") verlaengern = false;
        ergebnisse.push({ zelle, n, voll: voll.map((x) => x.b), urteil: verlaengern ? "VERLÄNGERN" : urteil, verlaengern, zeilen, zaehl: zaehl(dir, "fahrt", "lauf") });
        continue;
    }
    const dir = path.join(OUT, "gehen");
    const r = spawnSync(process.execPath, [path.join(WZ, "auswertung-gehen.cjs"), dir, zelle], { encoding: "utf8", env: process.env });
    const j = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, `auswertung-gehen-${zelle}.json`), "utf8")); } catch (_e) { return null; } })();
    const bs = j ? j.boots : [];
    const n = { A: bs.filter((x) => /-A\d$/.test(x)).length, B: bs.filter((x) => /-B\d$/.test(x)).length };
    if (!j || r.status !== 0 || !n.A || !n.B) {
        ergebnisse.push({ zelle, n, urteil: "UNENTSCHIEDEN", verlaengern: false, grund: "keine Auswertung: " + String(r.stderr || "").slice(0, 200), zeilen: [] });
        continue;
    }
    const KERN = new Set(["fps", "Frame p95 ms", "CPU-Takt p95 ms", "GPU je Bild ms (gpu-bank)", "Belegung p95 ms"]);
    const kern = j.urteile.filter((x) => KERN.has(x.titel) && x.u !== "–");
    // OHNE WERTE KEIN URTEIL (z9, 23.10.: alle A-Boots leer, das Instrument bootete die Seite nicht — die Kern-Größen fielen als „–“
    // heraus, und nichts urteilte LANGSAMER): fehlt einer Seite eine Kern-Größe des Stands, ist die Zelle UNENTSCHIEDEN
    const steht = j.urteile.filter((x) => KERN.has(x.titel) && x.gang === "steht" && x.titel !== "GPU je Bild ms (gpu-bank)");
    if (!kern.length || steht.some((x) => !Number.isFinite(x.ma) || !Number.isFinite(x.mb))) {
        ergebnisse.push({ zelle, n, urteil: "UNENTSCHIEDEN", verlaengern: false, grund: "eine Seite ohne Werte (Instrument bootete nicht?)", zeilen: [] });
        continue;
    }
    let langsam = false, verlaengern = false;
    for (const x of kern) {
        const ds = (x.titel === "fps" ? -1 : 1) * x.d;
        if (x.u !== "nicht langsamer") langsam = true;
        if (AUSLOESER.has(x.titel) && Number.isFinite(x.sig) && x.sig > 0 && ds > x.sig && ds <= 2 * x.sig) x.zwischen = true;
        if (x.u !== "nicht langsamer" && !STUFIG.has(x.titel) && klar(ds, x.sig, x.ma)) x.klar = true;
    }
    const klein = Math.min(n.A, n.B) < 4;
    if (klein && kern.filter((x) => x.klar).length < 2 && (langsam || kern.some((x) => x.zwischen))) verlaengern = true;
    const zeilen = kern.map((x) => ({ gang: x.gang, titel: x.titel, A: x.ma, B: x.mb, d: x.d, zweiSigma: 2 * x.sig, u: x.u + (x.zwischen ? " (1σ–2σ)" : "") }));
    const z = {};
    for (const s of ["steht", "geht-1"]) for (const [k, w] of Object.entries(zaehl(dir, zelle, s))) z[(s === "steht" ? "steht " : "geht ") + k] = w;
    ergebnisse.push({ zelle, n, urteil: verlaengern ? "VERLÄNGERN" : langsam ? "LANGSAMER" : "nicht-langsamer", verlaengern, zeilen, zaehl: z });
}
const gesamt = ergebnisse.some((e) => e.verlaengern) ? "VERLÄNGERN" : ergebnisse.some((e) => e.urteil === "LANGSAMER") ? "LANGSAMER" : ergebnisse.some((e) => e.urteil === "UNENTSCHIEDEN") ? "UNENTSCHIEDEN" : "nicht-langsamer";
const NL = String.fromCharCode(10);
let md = "| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |" + NL + "|---|---|---|---|---|---|---|---|---|" + NL;
for (const e of ergebnisse) {
    for (const x of e.zeilen) md += `| ${e.zelle} | ${e.n.A}+${e.n.B} | ${x.gang} | ${x.titel} | ${f2(x.A)} | ${f2(x.B)} | ${f2(x.d)} | ${f2(x.zweiSigma)} | ${x.u} |` + NL;
    for (const [k, w] of Object.entries(e.zaehl || {})) if (w.A.length && w.B.length) md += `| ${e.zelle} | ${w.A.length}+${w.B.length} | Zählung | ${k} | ${f2(m(w.A))} | ${f2(m(w.B))} | ${f2(m(w.B) - m(w.A))} | – | – |` + NL;
    if (e.voll) md += `| ${e.zelle} | – | volle Fahrten | ${e.voll.join(" ") || "keine"} | | | | | |` + NL;
    md += `| **${e.zelle}** | ${e.n.A}+${e.n.B} | | **Urteil** | | | | | **${e.urteil}** |` + NL;
}
// DAS INSTRUMENT JE BOOT (serie.sh schreibt <boot>-instrument.txt: die Werkbank, die bereit wurde; Vorgabe A, Rückfall die eigene Seite)
const instrument = {};
for (const d of ["gehen", "fahrt", "takt", "hieb"]) {
    const dir = path.join(OUT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
        const mm = f.match(/^(.*-[AB]\d)-instrument\.txt$/);
        if (mm) instrument[mm[1]] = fs.readFileSync(path.join(dir, f), "utf8").trim();
    }
}
if (Object.keys(instrument).length) {
    const je = {};
    for (const [b, s] of Object.entries(instrument)) (je[s] = je[s] || []).push(b);
    md += NL + "Instrument je Boot: " + Object.entries(je).map(([s, bs]) => s + " (" + bs.sort().join(", ") + ")").join(" · ") + NL;
}
const aus = { gesamt, ergebnisse, instrument };
if (opt("--md")) fs.writeFileSync(opt("--md"), md);
if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify(aus, null, 1));
console.log(JSON.stringify({ gesamt, zellen: ergebnisse.map((e) => ({ zelle: e.zelle, n: e.n, urteil: e.urteil })) }));

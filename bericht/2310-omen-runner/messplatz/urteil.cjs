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
// DAS WARME ABAB (serie.sh, 30.10.): je Zelle bootet jede Seite einmal, die Proben sind Mess-Fenster in den warmen Welten.
// <zelle>-warm.txt (Ordner der Zelle) nennt je Boot die Sitzung und je Fenster Zeiten und die Probe der Ruhe — die Tabelle zeigt
// die Boots je Seite, die Folge und die Last der ruhenden Seite (CPU-Sekunden ihrer Chrome-Prozesse im Fenster; die längste Stille ihres
// 1-Hz-Zeitgebers über die Ruhe gegen die Wanduhr der Ruhe: eingefroren schweigt er die ganze Ruhe, wach nie länger als ~1 s)
const warm = (dir, zelle) => {
    const f = path.join(dir, `${zelle}-warm.txt`);
    if (!fs.existsSync(f)) return null;
    const boots = { A: new Set(), B: new Set() }, fenster = [];
    for (const z of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
        const t = z.split(" "), w = Object.fromEntries([...z.matchAll(/(\w+)=(\S+)/g)].map((x) => [x[1], x[2]]));
        if (t[0] === "boot" && boots[t[1]]) boots[t[1]].add(w.sitzung);
        const r = /ruhte ([\d.]+) s schlief ([\d.]+) s/.exec(z);
        if (t[0] === "fenster")
            fenster.push({ n: t[1], start: +w.start, ende: +w.ende, cpu: +w.ruhe_cpu_s, renderer: +w.ruhe_renderer_s, gpu: +w.ruhe_gpu_s, mess: +w.mess_cpu_s, sys: +w.system_last_pct, neben: +w.neben_pct, fremd: +w.fremd_pct, frei: +w.frei_mb, vorher: w.vorher || "", wache: +w.wache, gaeste: w.gaeste || "", ruhte: r ? +r[1] : NaN, schlief: r ? +r[2] : NaN });
    }
    fenster.sort((a, b) => a.start - b.start);
    const max = (a) => (a.length ? Math.max(...a) : NaN);
    const min = (a) => (a.length ? Math.min(...a) : NaN);
    const je = (k, f) => f(fenster.map((x) => x[k]).filter(Number.isFinite));
    return {
        boots: { A: boots.A.size, B: boots.B.size },
        folge: fenster.map((x) => x.n).join(" "),
        fensterMin: fenster.length ? +(fenster.reduce((s, x) => s + x.ende - x.start, 0) / fenster.length / 60).toFixed(1) : NaN,
        ruheCpuMaxS: je("cpu", max),
        ruheRendererMaxS: je("renderer", max),
        ruheGpuMaxS: je("gpu", max),
        messCpuMinS: je("mess", min),
        fremdMaxPct: je("fremd", max), // die Fremdlast vor dem Fenster (beide Welten schliefen), die Vorfahrt wartet über 25 %
        freiMinMB: je("frei", min), // der freie Speicher vor dem Fenster (zwei Welten liegen im RAM)
        // DIE LAST NEBEN DEN WELTEN im Fenster (System-Last ohne die Chrome-Prozesse beider Seiten): über 25 % steht das Fenster beim
        // Namen in der Tabelle — ein fremder Lauf kam nach der Fremdlast-Vorfahrt (30.10. Radeon: 45 % in w-ego-A4, steht CPU-Takt p95 15,5
        // statt 5,5 ms); das Urteil bleibt, der Koordinator liest die Zeile
        gestoert: fenster.filter((x) => x.neben > 25).map((x) => `${x.n} ${x.neben} %`),
        // DIE GÄSTE AN DER PFORTE: ein fremder Klient hielt eine Verbindung zu :4312 (er lud von der gemessenen Seite; 30.10. 19:50–20:05
        // öffnete der Schöpfer localhost:4312 neben dem Prüfstand)
        gaeste: fenster.filter((x) => x.gaeste && x.gaeste !== "keine" && x.gaeste !== "-").map((x) => `${x.n} ${x.gaeste}`),
        // DIE RUHE GEBROCHEN: die ruhende Seite wachte — vor dem Fenster (die Nachwache fand ihren Zeitgeber kürzer still, als sie ruhte; sie
        // wurde erneut eingefroren) oder im Fenster (ihr Renderer rechnete über 3 s, schlafend ≤ 1,4 s je Fenster)
        gebrochen: fenster.filter((x) => /^gebrochen/.test(x.vorher) || x.renderer > 3 || x.wache > 0).map((x) => `${x.n} (${[/^gebrochen/.test(x.vorher) ? "vorher " + x.vorher.slice(9) : "", x.wache > 0 ? "im Fenster " + x.wache + "× nachgefroren" : "", x.renderer > 3 ? "Renderer " + x.renderer + " s" : ""].filter(Boolean).join(", ")})`),
        // die System-Last je Fenster (alle Kerne) — die gemessene Seite plus jede fremde Last; je Seite gemittelt, damit ein fremder Lauf neben
        // EINER Seite beim Namen steht
        systemLastPct: Object.fromEntries(
            ["A", "B"].map((s) => {
                const l = fenster.filter((x) => x.n[0] === s && Number.isFinite(x.sys)).map((x) => x.sys);
                return [s, l.length ? +(l.reduce((a, b) => a + b, 0) / l.length).toFixed(1) : NaN];
            })
        ),
        // der Anteil jeder Ruhe, in dem der Zeitgeber der Seite schwieg (1 = eingefroren vom Einfrieren bis zum Wecken)
        stilleMin: min(fenster.filter((x) => x.ruhte > 0 && Number.isFinite(x.schlief)).map((x) => Math.min(1, x.schlief / x.ruhte))),
        ruhteMinS: min(fenster.map((x) => x.ruhte).filter(Number.isFinite)),
    };
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
        ergebnisse.push({ zelle, n, voll: voll.map((x) => x.b), urteil: verlaengern ? "VERLÄNGERN" : urteil, verlaengern, zeilen, zaehl: zaehl(dir, "fahrt", "lauf"), warm: warm(dir, "fahrt") });
        continue;
    }
    const dir = path.join(OUT, "gehen");
    const r = spawnSync(process.execPath, [path.join(WZ, "auswertung-gehen.cjs"), dir, zelle], { encoding: "utf8", env: process.env });
    const j = (() => { try { return JSON.parse(fs.readFileSync(path.join(dir, `auswertung-gehen-${zelle}.json`), "utf8")); } catch (_e) { return null; } })();
    const bs = j ? j.boots : [];
    const n = { A: bs.filter((x) => /-A\d$/.test(x)).length, B: bs.filter((x) => /-B\d$/.test(x)).length };
    if (!j || r.status !== 0 || !n.A || !n.B) {
        ergebnisse.push({ zelle, n, urteil: "UNENTSCHIEDEN", verlaengern: false, grund: "keine Auswertung: " + String(r.stderr || "").slice(0, 200), zeilen: [], warm: warm(dir, zelle) });
        continue;
    }
    const KERN = new Set(["fps", "Frame p95 ms", "CPU-Takt p95 ms", "GPU je Bild ms (gpu-bank)", "Belegung p95 ms"]);
    const kern = j.urteile.filter((x) => KERN.has(x.titel) && x.u !== "–");
    // OHNE WERTE KEIN URTEIL (z9, 23.10.: alle A-Boots leer, das Instrument bootete die Seite nicht — die Kern-Größen fielen als „–“
    // heraus, und nichts urteilte LANGSAMER): fehlt einer Seite eine Kern-Größe des Stands, ist die Zelle UNENTSCHIEDEN
    const steht = j.urteile.filter((x) => KERN.has(x.titel) && x.gang === "steht" && x.titel !== "GPU je Bild ms (gpu-bank)");
    if (!kern.length || steht.some((x) => !Number.isFinite(x.ma) || !Number.isFinite(x.mb))) {
        ergebnisse.push({ zelle, n, urteil: "UNENTSCHIEDEN", verlaengern: false, grund: "eine Seite ohne Werte (Instrument bootete nicht?)", zeilen: [], warm: warm(dir, zelle) });
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
    ergebnisse.push({ zelle, n, urteil: verlaengern ? "VERLÄNGERN" : langsam ? "LANGSAMER" : "nicht-langsamer", verlaengern, zeilen, zaehl: z, warm: warm(dir, zelle) });
}
const gesamt = ergebnisse.some((e) => e.verlaengern) ? "VERLÄNGERN" : ergebnisse.some((e) => e.urteil === "LANGSAMER") ? "LANGSAMER" : ergebnisse.some((e) => e.urteil === "UNENTSCHIEDEN") ? "UNENTSCHIEDEN" : "nicht-langsamer";
const NL = String.fromCharCode(10);
let md = "| Zelle | n A+B | Gang | Größe | A | B | Δ B − A | 2σ | Urteil |" + NL + "|---|---|---|---|---|---|---|---|---|" + NL;
for (const e of ergebnisse) {
    for (const x of e.zeilen) md += `| ${e.zelle} | ${e.n.A}+${e.n.B} | ${x.gang} | ${x.titel} | ${f2(x.A)} | ${f2(x.B)} | ${f2(x.d)} | ${f2(x.zweiSigma)} | ${x.u} |` + NL;
    for (const [k, w] of Object.entries(e.zaehl || {})) if (w.A.length && w.B.length) md += `| ${e.zelle} | ${w.A.length}+${w.B.length} | Zählung | ${k} | ${f2(m(w.A))} | ${f2(m(w.B))} | ${f2(m(w.B) - m(w.A))} | – | – |` + NL;
    if (e.voll) md += `| ${e.zelle} | – | volle Fahrten | ${e.voll.join(" ") || "keine"} | | | | | |` + NL;
    if (e.warm) md += `| ${e.zelle} | ${e.warm.boots.A}+${e.warm.boots.B} Boots | warm | Folge ${e.warm.folge} · ${f2(e.warm.fensterMin)} min je Fenster · ruhende Seite: CPU ≤ ${f2(e.warm.ruheCpuMaxS)} s je Fenster (Renderer ≤ ${f2(e.warm.ruheRendererMaxS)}, GPU-Prozess ≤ ${f2(e.warm.ruheGpuMaxS)}; die gemessene ≥ ${f2(e.warm.messCpuMinS)} s), ihr Zeitgeber schwieg ≥ ${f2(100 * e.warm.stilleMin)} % jeder Ruhe (≥ ${f2(e.warm.ruhteMinS)} s) · System-Last in den Fenstern A ${f2(e.warm.systemLastPct.A)} % / B ${f2(e.warm.systemLastPct.B)} %, Fremdlast davor ≤ ${f2(e.warm.fremdMaxPct)} %, RAM frei ≥ ${f2(e.warm.freiMinMB)} MB${e.warm.gestoert.length ? ` · GESTÖRT (Last neben den Welten > 25 %): ${e.warm.gestoert.join(", ")}` : ""}${e.warm.gebrochen.length ? ` · RUHE GEBROCHEN: ${e.warm.gebrochen.join(", ")}` : ""}${e.warm.gaeste.length ? ` · GAST AN :4312: ${e.warm.gaeste.join(", ")}` : ""} | | | | | |` + NL;
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

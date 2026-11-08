// MESS-VEHIKEL w25-ankunft-block (nur WIP, fällt vor der Abgabe; aus w23-ankunft-faden): N kalte Boots `diag-boot-stage --kalt
// --echt` mit Spur und Bau-Haken (haken.cjs), die Zerlegung des Haupt-Fadens BIS ZUR KONTROLLE (ankunft.K5#1) je Klasse,
// Funktion, System, Sekunde und je Knoten-Bau (Stoff, Szene, Code-Länge). Teil 1 bootet und schreibt ≤ 10 Zeilen mit Marke
// (gpu-probe.yml liest die letzten 10 mit ✅/❌), `--teil 2` liest dieselben Läufe und schreibt die nächsten 10.
// ABAB, sobald vorher/tausch.json steht: zwischen den Boots tauschen die Dateien in vorher/ (A, main) gegen den Baum (B, der
// Schnitt), je Seite KALT_BOOTS. `--bild`: je Seite EIN Boot mit dem Bild der Kontrolle und seiner Ruhe (`diag-boot-stage
// --bild`; die PNG liegen in $RUNNER_TEMP/probe, die Probe-Post nimmt sie mit).
"use strict";
/* global process, console, __dirname */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const HL = require(path.resolve("scripts/lib/haenger-linse.cjs"));

const BILD = process.argv.includes("--bild");
const N = BILD ? 1 : Number(process.env.KALT_BOOTS || 4);
const AB = fs.existsSync(path.join(__dirname, "vorher", "tausch.json"));
const LAUF = path.join(__dirname, BILD ? "lauf-bild" : "lauf");
const PNG = path.join(process.env.RUNNER_TEMP || require("os").tmpdir(), "probe", String(process.env.GITHUB_SHA || "lokal").slice(0, 8) + "-kontrolle");
const TEIL = process.argv.includes("--teil") ? Number(process.argv[process.argv.indexOf("--teil") + 1]) : 1;
const TEIL2 = TEIL >= 2;
const med = (a) => {
    const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};
const sek = (ms) => (ms / 1000).toFixed(2);
const zeile = (s) => console.log(("✅ " + s).slice(0, 598));

// ── die Boots ──
function boote() {
    fs.rmSync(LAUF, { recursive: true, force: true });
    fs.mkdirSync(LAUF, { recursive: true });
    const VOR = path.join(__dirname, "vorher");
    const TAUSCH = AB ? JSON.parse(fs.readFileSync(path.join(VOR, "tausch.json"), "utf8")) : [];
    const neu = Object.fromEntries(TAUSCH.map((f) => [f, fs.readFileSync(f)]));
    const setze = (s) => {
        for (const f of TAUSCH) fs.writeFileSync(f, s === "A" ? fs.readFileSync(path.join(VOR, f.replace(/[\\/]/g, "__"))) : neu[f]);
    };
    const liste = [];
    try {
        for (let i = 0; i < (AB ? 2 * N : N); i++) {
            const seite = AB ? (i % 2 ? "B" : "A") : "B";
            setze(seite);
            const j = path.join(LAUF, `k${i}.json`);
            const s = path.join(LAUF, `s${i}.json`);
            const bild = BILD ? ["--bild", `${PNG}-${seite}.png`] : [];
            const p = spawnSync(process.execPath, ["-r", "./artifacts/ankunft-block/haken.cjs", "scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", j, "--spur", s, ...bild], {
                encoding: "utf8",
                timeout: BILD ? 240000 : 150000,
            });
            const txt = (p.stdout || "") + (p.stderr || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(txt) || [""])[0];
            const tK = /t\(Kontrolle\) kalt ([\d.]+) s/.exec(txt);
            if (!fs.existsSync(j) || !fs.existsSync(s)) {
                console.log(`❌ Boot ${i + 1} ${seite}: keine Ausgabe (Exit ${p.status}) ${txt.split(/\r?\n/).filter(Boolean).slice(-3).join(" | ").slice(0, 400)}`);
                continue;
            }
            const linse = (/(✅|❌) synchron nach dem Bild: [^\r\n]*/.exec(txt) || ["?"])[0];
            liste.push({ i, seite, j, s, ad, tK: tK ? Number(tK[1]) * 1000 : NaN, linse });
        }
    } finally {
        setze("B");
    }
    fs.writeFileSync(path.join(LAUF, "liste.json"), JSON.stringify(liste));
}

// ── die Zerlegung eines Boots bis zur Kontrolle ──
function zerlege(e) {
    const out = JSON.parse(fs.readFileSync(e.j, "utf8"));
    const { spur, seite } = JSON.parse(fs.readFileSync(e.s, "utf8"));
    const bis = e.tK;
    const a = HL.ankunftsHalter(spur, Object.assign({}, seite, { bis, meilensteine: Object.assign({}, seite.meilensteine, { Kontrolle: bis }) }), { top: 160 });
    const vor = (out.lang || []).filter(([s0]) => s0 < bis);
    const R = { e, out, a, belegt: a.belegtMs, langN: vor.length, langMs: vor.reduce((m, [s0, d]) => m + Math.min(d, bis - s0), 0), laengste: vor.reduce((m, x) => Math.max(m, x[1]), 0) };
    const sk = Math.floor(bis / 1000);
    R.klassen = Object.fromEntries(Object.entries(a.kosten || {}).map(([k, je]) => [k, Object.entries(je).reduce((m, [t, ms]) => (+t <= sk ? m + ms : m), 0)]));
    R.klassen.GC = (a.klasse || {})["(garbage collector)"] || 0;
    R.klassen.Programm = (a.klasse || {})["(program)"] || 0;
    const p = spur.profil;
    const kn = new Map(p.nodes.map((n) => [n.id, n]));
    let t = p.startTime;
    const zeiten = p.samples.map((_, i) => (t += p.timeDeltas[i] || 0));
    const bisUs = bis * 1000 + a.versatz;
    const datei = (c) => String(c.url || "").replace(/^[a-z]+:\/\/[^/]*\//, "").split("?")[0] || "(nativ)";
    R.selbst = new Map();
    R.datei = new Map();
    R.jeSek = [];
    for (let i = 0; i < p.samples.length && zeiten[i] < bisUs; i++) {
        const g = Math.max(0, Math.min(10, ((i + 1 < zeiten.length ? zeiten[i + 1] : zeiten[i] + 1000) - zeiten[i]) / 1000));
        const k = kn.get(p.samples[i]);
        if (!k || k.callFrame.functionName === "(idle)") continue;
        const c = k.callFrame;
        const nm = /^\(/.test(c.functionName) ? c.functionName : `${c.functionName || "(anonym)"} [${datei(c).split("/").pop()}:${c.lineNumber + 1}]`;
        R.selbst.set(nm, (R.selbst.get(nm) || 0) + g);
        const d = /^\(/.test(c.functionName) ? c.functionName : datei(c);
        R.datei.set(d, (R.datei.get(d) || 0) + g);
        const s0 = Math.max(0, Math.floor((zeiten[i] - a.versatz) / 1e6));
        R.jeSek[s0] = (R.jeSek[s0] || 0) + g;
    }
    R.inkl = new Map(a.summen.map((x) => [`${x.name}${x.ort ? ` [${x.ort.split("/").pop()}]` : ""}`, x.ms]));
    const bau = (out.bau || []).filter((x) => x[0] < bis);
    R.bau = { ms: 0, n: 0, len: 0, je: new Map(), szene: {}, art: {}, sekMs: [] };
    for (const [t0, ms, stoff, art, len, sz] of bau) {
        const z = R.bau.je.get(stoff) || { ms: 0, n: 0, len: 0, sz: new Set() };
        z.sz.add(sz);
        if (art === "f") {
            R.bau.n++;
            z.n++;
            z.len = Math.max(z.len, len);
            R.bau.len += len;
        } else {
            R.bau.ms += ms;
            z.ms += ms;
            R.bau.szene[sz] = (R.bau.szene[sz] || 0) + ms;
            R.bau.art[art] = (R.bau.art[art] || 0) + ms;
            const s0 = Math.floor(t0 / 1000);
            R.bau.sekMs[s0] = (R.bau.sekMs[s0] || 0) + ms;
        }
        R.bau.je.set(stoff, z);
    }
    return R;
}

// das Nach-Bild (haken.cjs `__kalt.nach`): die erste W-Taste nach dem Ladeschirm, das erste Halten in der Verb-Tafel, der erste Weg
// ≥ 1 cm, die Kontrolle — dazu Bilder (rAF) je Sekunde, die längste Lücke zwischen zwei rAF und die Leine (gerendert/ausgesetzt)
function nachZeile(z) {
    const da = z.out.weltbildDa;
    const N = z.out.nach || { keys: [], frames: [] };
    const F = N.frames;
    const k = N.keys.find((x) => x[0] >= da && !x[2]);
    const h = F.find((f) => f[6] && f[6] !== "?" && f[6] !== "");
    let weg = null;
    for (let i = 1; i < F.length && !weg; i++) if (Math.hypot(F[i][1] - F[i - 1][1], F[i][2] - F[i - 1][2]) >= 0.01) weg = F[i];
    let gap = 0;
    for (let i = 1; i < F.length; i++) gap = Math.max(gap, F[i][0] - F[i - 1][0]);
    const jeS = [0, 1, 2, 3].map((s) => F.filter((f) => f[0] - da >= s * 1000 && f[0] - da < (s + 1) * 1000).length);
    const L0 = F[0] || [];
    const L1 = F[F.length - 1] || [];
    const rel = (x) => (x ? Math.round(x[0] - da) : "–");
    return `Taste ${rel(k)} · Halten ${rel(h)}${h ? "(" + h[6] + ")" : ""} · Weg ${rel(weg)} · K ${Math.round(z.e.tK - da)} · rAF/s ${jeS.join("/")} · Lücke ${gap} · Bilder ${(L1[4] || 0) - (L0[4] || 0)} aus ${(L1[5] || 0) - (L0[5] || 0)}`;
}

// die GPU-Bauten (haken.cjs `__kalt.nach.gpu`): je Art Zahl und Ruf-Zeit vor dem Bild und danach (bis +4 s), Module mit Code
function gpuZeile(z) {
    const da = z.out.weltbildDa;
    const G = (z.out.nach && z.out.nach.gpu) || [];
    const teil = (L) =>
        ["s", "a", "c", "C", "m"]
            .map((a) => {
                const x = L.filter((g) => g[1] === a);
                return x.length ? `${a}${x.length}/${Math.round(x.reduce((m, g) => m + g[4], 0))}ms${a === "m" ? "/" + Math.round(x.reduce((m, g) => m + g[3], 0) / 1000) + "k" : ""}` : "";
            })
            .filter(Boolean)
            .join(" ");
    return `${teil(G.filter((g) => g[0] < da))} │ ${teil(G.filter((g) => g[0] >= da && g[0] < da + 4000))}`;
}
function gpuNamen(z) {
    const da = z.out.weltbildDa;
    const G = ((z.out.nach && z.out.nach.gpu) || []).filter((g) => g[0] >= da && g[0] < da + 4000);
    return G.map((g) => `${g[0] - da}${g[1]} ${(g[2] || "?").replace(/^(renderPipeline_|fragment_|vertex_)/, (m) => m[0])} ${g[1] === "m" ? Math.round(g[3] / 1000) + "k" : ""} ${g[5] || ""}`).join(" · ") || "keine";
}

// die Lade-Bilder (haken.cjs `__kalt.nach.lade`): je `_loopRender` vor dem Weltbild seine ms, davon der Knoten-Bau in Raten in
// ihm (Bau-Ereignisse „r“ in seinem Fenster); dazu die Jobs (`_runFrameScheduler`) vor dem Bild
function ladeZeile(z) {
    const N = z.out.nach || {};
    const L = (N.lade || []).filter((x) => !x[2]);
    const J = (N.jobs || []).filter((x) => !x[2]);
    const bau = (z.out.bau || []).filter((b) => b[3] === "r");
    let knoten = 0;
    for (const [t0, ms] of L) for (const b of bau) if (b[0] >= t0 && b[0] < t0 + ms) knoten += b[1];
    const sum = L.reduce((m, x) => m + x[1], 0);
    return `${L.length} Bilder Σ ${Math.round(sum)} ms (Knoten ${Math.round(knoten)}, Rest ${Math.round(sum - knoten)}, Ø Rest ${L.length ? Math.round((sum - knoten) / L.length) : 0}) · Jobs ${J.length}× Σ ${Math.round(J.reduce((m, x) => m + x[1], 0))} ms`;
}

function phasen(zs, pre) {
    const ph = new Map();
    for (const z of zs) for (const m of z.a.meilensteine || []) (ph.get(m.name) || ph.set(m.name, []).get(m.name)).push([m.t, m.belegtMs]);
    zeile(`${pre}PHASEN (t · belegt, Median): ${[...ph].filter(([k]) => !/^(HTML|Skripte|DOM|buch steht)/.test(k)).map(([k, v]) => `${k.replace(" steht", "")} ${sek(med(v.map((x) => x[0])))}·${sek(med(v.map((x) => x[1])))}`).join(" | ")}`);
}

// ABAB in je ≤ 10 Zeilen: Teil 1 die Zeit, das Nach-Bild, die Klassen, die Lade-Bilder und B − A; Teil 2 Phasen, Knoten-Bau,
// INKL, GPU-Bauten
function berichtAB(teil, Z) {
    const KL = (S) => Z.filter((z) => z.e.seite === S);
    const ad = Z[0].e.ad;
    const je = (f) => ["A", "B"].forEach((S) => KL(S).length && f(KL(S), S + " "));
    const stamm = (k) => /\[[a-z-]+\.js[:\]]/.test(k) && !/three\.(webgpu|core)/.test(k);
    if (teil === 1) {
        je((zs, pre) =>
            zeile(
                `${pre}KALT ${zs.length}× ${ad} V${zs[0].out.version} · t(Kontrolle) ${zs.map((z) => sek(z.e.tK)).join("/")} Median ${sek(med(zs.map((z) => z.e.tK)))} s · ` +
                    `Eigenmeldung ${zs.map((z) => sek(z.out.weltbildDa)).join("/")} Median ${sek(med(zs.map((z) => z.out.weltbildDa)))} · BELEGT bis Kontrolle ${zs.map((z) => sek(z.belegt)).join("/")} Median ${sek(med(zs.map((z) => z.belegt)))} s · ` +
                    `LongTasks ${zs.map((z) => z.langN).join("/")} · längste ${zs.map((z) => z.laengste).join("/")} ms`
            )
        );
        if (BILD) {
            je((zs, pre) => {
                const o = zs[0].out;
                zeile(`${pre}BILD ${PNG.split(/[\\/]/).pop()}-${pre.trim()}.png · Lücke gegen die Ruhe ${o.bild ? (100 * o.bild.luecke).toFixed(2) + " %" : "?"} · dc ${o.bild ? o.bild.a.dc : "?"} · Dreiecke ${o.bild ? o.bild.a.dreiecke : "?"} · offen im Bild ${(o.offen || []).join(" · ") || "nichts"} · halbes Weltbild ${(o.ohne || []).length ? "JA" : "nein"}`); // prettier-ignore
            });
            return;
        }
        je((zs, pre) => zeile(`${pre}NACH DEM BILD (ab Eigenmeldung, ms): ${zs.map((z) => nachZeile(z)).join(" | ")}`));
        je((zs, pre) => {
            const kl = new Set(zs.flatMap((z) => Object.keys(z.klassen)));
            zeile(`${pre}KLASSEN bis Kontrolle (Median s): ${[...kl].map((k) => [k, med(zs.map((z) => z.klassen[k] || 0))]).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${sek(v)}`).join(" · ")}`); // prettier-ignore
        });
        je((zs, pre) => zeile(`${pre}LINSE je Boot (Kalt-Zeile, synchron nach dem Bild): ${zs.map((z) => z.e.linse.replace(/^.*synchron nach dem Bild: /, z.e.linse[0] === "✅" ? "grün: " : "ROT: ").slice(0, 130)).join(" | ")}`)); // prettier-ignore
        const namen = new Set(Z.flatMap((z) => Object.keys(z.klassen)));
        const d = [...namen].map((k) => [k, med(KL("B").map((z) => z.klassen[k] || 0)) - med(KL("A").map((z) => z.klassen[k] || 0))]).filter(([, v]) => Math.abs(v) >= 20); // prettier-ignore
        zeile(`B − A je Klasse (Median s): ${d.sort((a, b) => a[1] - b[1]).map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${sek(v)}`).join(" · ")}`);
        zeile(
            `B − A: t(Kontrolle) ${sek(med(KL("B").map((z) => z.e.tK)) - med(KL("A").map((z) => z.e.tK)))} s · Eigenmeldung ${sek(med(KL("B").map((z) => z.out.weltbildDa)) - med(KL("A").map((z) => z.out.weltbildDa)))} s · belegt ` +
                `${sek(med(KL("B").map((z) => z.belegt)) - med(KL("A").map((z) => z.belegt)))} s (Median, je ${N} Boots abwechselnd)`
        );
        return;
    }
    if (teil === 3) {
        je((zs, pre) => {
            const namen = new Set(zs.flatMap((z) => Object.keys((z.out.nach && z.out.nach.glied) || {})));
            const w = [...namen].map((k) => [k, med(zs.map((z) => (((z.out.nach && z.out.nach.glied) || {})[k] || [0])[0]))]).sort((a, b) => b[1] - a[1]); // prettier-ignore
            zeile(`${pre}GLIEDER vor dem Bild (Median ms): ${w.filter(([k]) => !/:/.test(k) || /^(job|karte)/.test(k)).map(([k, v]) => `${k.replace(/^_tick/, "")} ${Math.round(v)}`).join(" · ")}`);
            const zahl = (k) => zs.map((z) => ((((z.out.nach && z.out.nach.glied) || {})[k] || [0, 0])[1])).join("/");
            zeile(`${pre}ZAHLEN vor dem Bild je Boot: Ferne gebaut ${zahl("fern:gebaut")} · gefallen ${zahl("fern:gefallen")} · Fern-Kacheln-Rufe ${zahl("_nahWieseFernKachel")} · Büschel-Rufe ${zahl("_nahWieseKachelBueschel")} · Lade-Bilder Uhr ${zahl("lade:uhr")} · Schuld ${zahl("lade:schuld")} · ganz ${zahl("lade:ganz")}`); // prettier-ignore
            // die Foundry bis zum Bild: wann die Schlange (wartend + im Werk) zuletzt nicht leer war, ihr Höchststand, und was dem Bild
            // in seiner letzten Sekunde fehlte
            const fo = (z) => {
                const P = (z.out.proben || []).filter((q) => q.t <= z.out.weltbildDa);
                const n = (q) => ((q.schlange || "").match(/\d+/g) || []).reduce((m, x) => m + +x, 0);
                const voll = P.filter((q) => n(q) > 0);
                const letzt = P.filter((q) => q.t > z.out.weltbildDa - 1000 && q.fehlt && q.fehlt.length).map((q) => q.fehlt.join("+"));
                return `leer ab ${voll.length ? sek(voll[voll.length - 1].t) : "–"} s, max ${Math.max(0, ...P.map(n))} · zuletzt fehlt ${letzt.slice(-2).join(" / ").slice(0, 90)}`;
            };
            zeile(`${pre}FOUNDRY bis zum Bild je Boot: ${zs.map(fo).join(" | ")}`);
            zeile(`${pre}FERNE: Bild aus der Ferne ${zs.map((z) => (z.out.nach && z.out.nach.fernbild ? sek(z.out.nach.fernbild) : "–")).join("/")} s → Weltbild ${zs.map((z) => sek(z.out.weltbildDa)).join("/")} s`); // prettier-ignore
        });
        return;
    }
    je((zs, pre) => phasen(zs, pre));
    je((zs, pre) => {
        const B = zs.map((z) => z.bau);
        zeile(`${pre}KNOTEN-BAU bis Kontrolle: ${B.map((b) => b.n).join("/")} fertig · Σ ${B.map((b) => Math.round(b.ms)).join("/")} ms · Raten ${Math.round(med(B.map((b) => b.art.r || 0)))} · am Stück ${Math.round(med(B.map((b) => b.art.v || 0)))} ms`); // prettier-ignore
    });
    je((zs, pre) => {
        const alle = new Set(zs.flatMap((z) => [...z.inkl.keys()]));
        const inkl = [...alle].filter(stamm).map((k) => [k, med(zs.map((z) => z.inkl.get(k) || 0))]).sort((a, b) => b[1] - a[1]).slice(0, 16).map(([k, ms]) => `${k} ${Math.round(ms)}`); // prettier-ignore
        zeile(`${pre}INKL: ${inkl.join(" · ")}`);
    });
    je((zs, pre) => zeile(`${pre}GPU-BAU je Boot (vor dem Bild │ nach dem Bild bis +4 s): ${zs.map((z) => gpuZeile(z)).join(" | ")}`));
    const b = KL("B")[0];
    zeile(`B GPU NACH (Boot ${b.e.i + 1}, t ab Bild ms + Art, Label, Code, Besteller): ${gpuNamen(b)}`);
    zeile(`B AUFGABEN (Boot ${b.e.i + 1}): ${b.a.aufgaben.slice(0, 6).map((x) => `${sek(x.t)} s ${x.ms} ms ${x.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")}`); // prettier-ignore
}

function bericht(teil) {
    const liste = JSON.parse(fs.readFileSync(path.join(LAUF, "liste.json"), "utf8"));
    if (!liste.length) return console.log("❌ keine Boots"), process.exit(1);
    const Z = liste.map(zerlege);
    if (AB || teil === 3) return berichtAB(teil, Z);
    const seiten = AB ? ["A", "B"] : ["B"];
    const ad = liste[0].ad;
    const medMap = (zs, key, top, filter = () => true) => {
        const alle = new Set(zs.flatMap((z) => [...z[key].keys()]));
        return [...alle]
            .filter(filter)
            .map((k) => [k, med(zs.map((z) => z[key].get(k) || 0))])
            .sort((a, b) => b[1] - a[1])
            .slice(0, top)
            .map(([k, ms]) => `${k} ${Math.round(ms)}`);
    };
    const stamm = (k) => /\[[a-z-]+\.js[:\]]/.test(k) && !/three\.(webgpu|core)/.test(k);
    for (const S of seiten) {
        const zs = Z.filter((z) => z.e.seite === S);
        const pre = AB ? `${S} ` : "";
        if (teil === 1) {
            zeile(
                `${pre}KALT ${zs.length}× ${ad} V${zs[0].out.version} · t(Kontrolle) ${zs.map((z) => sek(z.e.tK)).join("/")} Median ${sek(med(zs.map((z) => z.e.tK)))} s · ` +
                    `Eigenmeldung ${zs.map((z) => sek(z.out.weltbildDa)).join("/")} · BELEGT bis Kontrolle ${zs.map((z) => sek(z.belegt)).join("/")} Median ${sek(med(zs.map((z) => z.belegt)))} s · ` +
                    `LongTasks ${zs.map((z) => z.langN).join("/")} Σ ${zs.map((z) => sek(z.langMs)).join("/")} s · längste ${zs.map((z) => z.laengste).join("/")} ms`
            );
            if (BILD) {
                const o = zs[0].out;
                zeile(`${pre}BILD ${PNG.split(/[\\/]/).pop()}-${S}.png · Lücke gegen die Ruhe ${o.bild ? (100 * o.bild.luecke).toFixed(2) + " %" : "?"} · dc ${o.bild ? o.bild.a.dc : "?"} · Dreiecke ${o.bild ? o.bild.a.dreiecke : "?"} · offen im Bild ${(o.offen || []).join(" · ") || "nichts"} · halbes Weltbild ${(o.ohne || []).length ? "JA" : "nein"}`); // prettier-ignore
                continue;
            }
            if (!AB) phasen(zs, pre);
            const kl = new Set(zs.flatMap((z) => Object.keys(z.klassen)));
            zeile(`${pre}KLASSEN bis Kontrolle (Median s, verschachtelt je): ${[...kl].map((k) => [k, med(zs.map((z) => z.klassen[k] || 0))]).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${sek(v)}`).join(" · ")}`);
            const B = zs.map((z) => z.bau);
            const sz = ["W", "B", "K", "E", "?"].map((k) => `${k} ${Math.round(med(B.map((b) => b.szene[k] || 0)))}`).join(" · ");
            zeile(
                `${pre}KNOTEN-BAU bis Kontrolle: ${B.map((b) => b.n).join("/")} Bauten fertig · Σ ${B.map((b) => Math.round(b.ms)).join("/")} ms (Median ${Math.round(med(B.map((b) => b.ms)))}) · je Szene ${sz} · ` +
                    `Raten ${Math.round(med(B.map((b) => b.art.r || 0)))} · am Stück ${Math.round(med(B.map((b) => b.art.v || 0)))} ms · Code Σ ${Math.round(med(B.map((b) => b.len)) / 1000)}k Zeichen`
            );
            const stoffe = new Set(B.flatMap((b) => [...b.je.keys()]));
            const je = [...stoffe]
                .map((k) => {
                    const v = B.map((b) => b.je.get(k) || { ms: 0, n: 0, len: 0, sz: new Set() });
                    return [k, med(v.map((x) => x.ms)), med(v.map((x) => x.n)), Math.max(...v.map((x) => x.len)), [...new Set(v.flatMap((x) => [...x.sz]))].join("")];
                })
                .sort((a, b) => b[1] - a[1])
                .map(([k, ms, n, len, s]) => `${k} ${Math.round(ms)}/${n}/${Math.round(len / 1000)}k${s}`);
            if (!AB) zeile(`BAU je Stoff (ms/fertig/Code, Szene): ${je.slice(0, 12).join(" · ")}`);
            const inkl = medMap(zs, "inkl", 80, stamm);
            zeile(`${pre}INKL 1: ${inkl.slice(0, 14).join(" · ")}`);
            if (!AB) zeile(`INKL 2: ${inkl.slice(14, 30).join(" · ")}`);
            if (!AB) zeile(`SYSTEME selbst (Median ms): ${medMap(zs, "datei", 18).join(" · ")}`);
            zeile(`${pre}NACH DEM BILD je Boot (ab Eigenmeldung, ms): ${zs.map((z) => nachZeile(z)).join(" | ")}`);
            if (!AB)
                zeile(
                    `AUFGABEN (Boot 1, längste vor der Kontrolle): ${zs[0].a.aufgaben.slice(0, 6).map((x) => `${sek(x.t)} s ${x.ms} ms ${x.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")}`
                );
        } else {
            if (AB) phasen(zs, pre);
            const self = medMap(zs, "selbst", 40);
            zeile(`${pre}SELBST 1: ${self.slice(0, 14).join(" · ")}`);
            if (!AB) zeile(`SELBST 2: ${self.slice(14, 30).join(" · ")}`);
            const inkl = medMap(zs, "inkl", 120, stamm);
            zeile(AB ? `${pre}INKL 2: ${inkl.slice(14, 30).join(" · ")}` : `INKL 3: ${inkl.slice(30, 46).join(" · ")}`);
            if (!AB) zeile(`INKL 4: ${inkl.slice(46, 62).join(" · ")}`);
            zeile(`${pre}GPU-BAU je Boot (vor dem Bild │ nach dem Bild bis +4 s): ${zs.map((z) => gpuZeile(z)).join(" | ")}`);
            zeile(`${pre}GPU NACH (Boot ${zs[0].e.i + 1}, t ab Bild ms + Art, Label, Code, Besteller): ${gpuNamen(zs[0])}`);
            const S0 = Math.max(...zs.map((z) => z.jeSek.length));
            zeile(`${pre}BELEGT je Sekunde (Median ms): ${Array.from({ length: S0 }, (_, s) => `${s}:${Math.round(med(zs.map((z) => z.jeSek[s] || 0)))}`).join(" ")} · BAU je s: ${Array.from({ length: S0 }, (_, s) => `${s}:${Math.round(med(zs.map((z) => z.bau.sekMs[s] || 0)))}`).join(" ")}`);
            for (const z of zs.slice(1, AB ? 2 : 2))
                zeile(`${pre}AUFGABEN (Boot ${z.e.i + 1}): ${z.a.aufgaben.slice(0, 6).map((x) => `${sek(x.t)} s ${x.ms} ms ${x.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")}`);

        }
    }
    if (AB && teil === 1 && !BILD) {
        const KL = (S) => Z.filter((z) => z.e.seite === S);
        const namen = new Set(Z.flatMap((z) => Object.keys(z.klassen)));
        const d = [...namen].map((k) => [k, med(KL("B").map((z) => z.klassen[k] || 0)) - med(KL("A").map((z) => z.klassen[k] || 0))]).filter(([, v]) => Math.abs(v) >= 20); // prettier-ignore
        zeile(`B − A je Klasse (Median s): ${d.sort((a, b) => a[1] - b[1]).map(([k, v]) => `${k} ${v > 0 ? "+" : ""}${sek(v)}`).join(" · ")}`);
        zeile(
            `B − A: t(Kontrolle) ${sek(med(KL("B").map((z) => z.e.tK)) - med(KL("A").map((z) => z.e.tK)))} s · belegt ` +
                `${sek(med(KL("B").map((z) => z.belegt)) - med(KL("A").map((z) => z.belegt)))} s (Median, je ${N} Boots abwechselnd)`
        );
    }
}

if (!TEIL2) boote();
bericht(TEIL);
process.exit(0);

// MESS-VEHIKEL w23-ankunft-faden (nur WIP, fällt vor der Abgabe): N kalte Boots `diag-boot-stage --kalt --echt` mit Spur und
// Bau-Haken (haken.cjs), die Zerlegung des Haupt-Fadens BIS ZUR KONTROLLE (ankunft.K5#1: belegt ≤ 4 s, längste ≤ 250 ms) je
// Klasse, Funktion, System, Sekunde und je Knoten-Bau (Stoff, Szene, Code-Länge). Teil 1 bootet und schreibt ≤ 10 Zeilen mit
// Marke (gpu-probe.yml liest die letzten 10 mit ✅/❌), `--teil 2` liest dieselben Läufe und schreibt die nächsten 10.
// ABAB: `KALT_AB=1` tauscht zwischen den Boots die Dateien in vorher/ (A) gegen den Baum (B).
"use strict";
/* global process, console, __dirname */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const HL = require(path.resolve("scripts/lib/haenger-linse.cjs"));

const N = Number(process.env.KALT_BOOTS || 5);
const AB = process.env.KALT_AB === "1";
const LAUF = path.join(__dirname, "lauf");
const TEIL2 = process.argv.includes("--teil") && process.argv[process.argv.indexOf("--teil") + 1] === "2";
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
            const p = spawnSync(process.execPath, ["-r", "./artifacts/ankunft-faden/haken.cjs", "scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", j, "--spur", s], {
                encoding: "utf8",
                timeout: 150000,
            });
            const txt = (p.stdout || "") + (p.stderr || "");
            const ad = (/\[linse-gpu\][^\r\n]*/.exec(txt) || [""])[0];
            const tK = /t\(Kontrolle\) kalt ([\d.]+) s/.exec(txt);
            if (!fs.existsSync(j) || !fs.existsSync(s)) {
                console.log(`❌ Boot ${i + 1} ${seite}: keine Ausgabe (Exit ${p.status}) ${txt.split(/\r?\n/).filter(Boolean).slice(-3).join(" | ").slice(0, 400)}`);
                continue;
            }
            liste.push({ i, seite, j, s, ad, tK: tK ? Number(tK[1]) * 1000 : NaN });
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
    const a = HL.ankunftsHalter(spur, Object.assign({}, seite, { bis, meilensteine: Object.assign({}, seite.meilensteine, { Kontrolle: bis }) }), { top: 120 });
    const vor = (out.lang || []).filter(([s0]) => s0 < bis);
    const R = { e, out, a, belegt: a.belegtMs, langN: vor.length, langMs: vor.reduce((m, [s0, d]) => m + Math.min(d, bis - s0), 0), laengste: vor.reduce((m, x) => Math.max(m, x[1]), 0) };
    // die Klassen bis zur Sekunde der Kontrolle (wie die Station: verschachtelt je)
    const sk = Math.floor(bis / 1000);
    R.klassen = Object.fromEntries(Object.entries(a.kosten || {}).map(([k, je]) => [k, Object.entries(je).reduce((m, [t, ms]) => (+t <= sk ? m + ms : m), 0)]));
    R.klassen.GC = (a.klasse || {})["(garbage collector)"] || 0;
    R.klassen.Programm = (a.klasse || {})["(program)"] || 0;
    // selbst je Funktion und je Datei, belegt je Sekunde
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
    // der Knoten-Bau bis zur Kontrolle
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

function bericht(teil) {
    const liste = JSON.parse(fs.readFileSync(path.join(LAUF, "liste.json"), "utf8"));
    if (!liste.length) return console.log("❌ keine Boots"), process.exit(1);
    const Z = liste.map(zerlege);
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
    for (const S of seiten) {
        const zs = Z.filter((z) => z.e.seite === S);
        const pre = AB ? `${S} ` : "";
        if (teil === 1) {
            zeile(
                `${pre}KALT ${zs.length}× ${ad} V${zs[0].out.version} · t(Kontrolle) ${zs.map((z) => sek(z.e.tK)).join("/")} Median ${sek(med(zs.map((z) => z.e.tK)))} s · ` +
                    `Eigenmeldung ${zs.map((z) => sek(z.out.weltbildDa)).join("/")} · BELEGT bis Kontrolle ${zs.map((z) => sek(z.belegt)).join("/")} Median ${sek(med(zs.map((z) => z.belegt)))} s · ` +
                    `LongTasks ${zs.map((z) => z.langN).join("/")} Σ ${zs.map((z) => sek(z.langMs)).join("/")} s · längste ${zs.map((z) => z.laengste).join("/")} ms`
            );
            const ph = new Map();
            for (const z of zs) for (const m of z.a.meilensteine || []) (ph.get(m.name) || ph.set(m.name, []).get(m.name)).push([m.t, m.belegtMs]);
            zeile(`${pre}PHASEN (t · belegt, Median): ${[...ph].map(([k, v]) => `${k} ${sek(med(v.map((x) => x[0])))}·${sek(med(v.map((x) => x[1])))}`).join(" | ")}`);
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
            zeile(`${pre}BAU je Stoff (ms/fertig/Code, Szene): ${je.slice(0, 12).join(" · ")}`);
            if (!AB) zeile(`BAU je Stoff 2: ${je.slice(12, 30).join(" · ")}`);
            const inkl = medMap(zs, "inkl", 60, (k) => /\[[a-z-]+\.js[:\]]/.test(k) && !/three\.(webgpu|core)/.test(k));
            zeile(`${pre}INKL 1: ${inkl.slice(0, 14).join(" · ")}`);
            if (!AB) zeile(`INKL 2: ${inkl.slice(14, 30).join(" · ")}`);
            if (!AB) zeile(`SYSTEME selbst (Median ms): ${medMap(zs, "datei", 18).join(" · ")}`);
            if (!AB)
                zeile(
                    `AUFGABEN (Boot 1, längste vor der Kontrolle): ${zs[0].a.aufgaben.slice(0, 6).map((x) => `${sek(x.t)} s ${x.ms} ms ${x.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")}`
                );
        } else {
            const self = medMap(zs, "selbst", 40);
            zeile(`${pre}SELBST 1: ${self.slice(0, 14).join(" · ")}`);
            if (!AB) zeile(`SELBST 2: ${self.slice(14, 30).join(" · ")}`);
            const inkl = medMap(zs, "inkl", 80, (k) => /\[[a-z-]+\.js[:\]]/.test(k) && !/three\.(webgpu|core)/.test(k));
            zeile(`${pre}INKL 3: ${inkl.slice(30, 46).join(" · ")}`);
            if (!AB) zeile(`INKL 4: ${inkl.slice(46, 62).join(" · ")}`);
            const S0 = Math.max(...zs.map((z) => z.jeSek.length));
            zeile(`${pre}BELEGT je Sekunde (Median ms): ${Array.from({ length: S0 }, (_, s) => `${s}:${Math.round(med(zs.map((z) => z.jeSek[s] || 0)))}`).join(" ")} · BAU je s: ${Array.from({ length: S0 }, (_, s) => `${s}:${Math.round(med(zs.map((z) => z.bau.sekMs[s] || 0)))}`).join(" ")}`);
            for (const z of zs.slice(1, AB ? 2 : 3))
                zeile(`${pre}AUFGABEN (Boot ${z.e.i + 1}): ${z.a.aufgaben.slice(0, 6).map((x) => `${sek(x.t)} s ${x.ms} ms ${x.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")}`);
            if (!AB) {
                const pr = (zs[0].out.proben || []).filter((q) => q.t < zs[0].e.tK && q.t % 1000 < 200);
                zeile(`FEHLT je s (Boot 1): ${pr.map((q) => `${(q.t / 1000).toFixed(0)}:${(q.terme || []).join("+") || "–"}`).join(" ")}`);
            }
        }
    }
    if (AB && teil === 1)
        zeile(
            `B − A: t(Kontrolle) ${sek(med(Z.filter((z) => z.e.seite === "B").map((z) => z.e.tK)) - med(Z.filter((z) => z.e.seite === "A").map((z) => z.e.tK)))} s · belegt ` +
                `${sek(med(Z.filter((z) => z.e.seite === "B").map((z) => z.belegt)) - med(Z.filter((z) => z.e.seite === "A").map((z) => z.belegt)))} s (Median, je ${N} Boots abwechselnd)`
        );
}

if (!TEIL2) boote();
bericht(TEIL2 ? 2 : 1);
process.exit(0);

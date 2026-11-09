// MESS-VEHIKEL w26-ankunft-horizont (nur WIP, fällt vor der Abgabe; aus w25-ankunft-block): N kalte Boots `diag-boot-stage --kalt
// --echt` mit Spur, Bau-Haken und dem Weg des Horizonts (haken.cjs, hz-teile.cjs). Teil 1 bootet und schreibt die Zeit, die Terme
// je Boot und (ABAB) B − A; `--teil 2` liest dieselben Läufe: je Boot der Weg des Horizonts (Fäden, Ring, Teilung, Feld, Panorama,
// Gitter, Karte); `--teil 3`: was der Horizont im Haupt-Faden kostet (Takt, Programme), die Programme je Stoff und die Zeugen der
// Bauten. ABAB, sobald vorher/tausch.json steht: zwischen den Boots tauschen die Dateien in vorher/ (A, main) gegen den Baum (B).
"use strict";
/* global process, console, __dirname */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
require(path.resolve("scripts/lib/welt-boot.cjs")); // setzt den Helfer `rang`, den die Hänger-Linse liest
const HL = require(path.resolve("scripts/lib/haenger-linse.cjs"));
const { zeile: hzZeile } = require("./hz-teile.cjs");

const N = Number(process.env.KALT_BOOTS || 4);
const AB = fs.existsSync(path.join(__dirname, "vorher", "tausch.json"));
const LAUF = path.join(__dirname, "lauf");
const TEIL = process.argv.includes("--teil") ? Number(process.argv[process.argv.indexOf("--teil") + 1]) : 1;
const med = (a) => {
    const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};
const sek = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const zeile = (s) => console.log(("✅ " + s).slice(0, 598));

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
        // DAS BUDGET der Probe (8 min Deckel): weitere Boots nur, solange einer im Schnitt noch hineinpasst — GTX 1050 kalt ~60 s
        const t0 = Date.now();
        for (let i = 0; i < (AB ? 2 * N : N) && (i < 2 || ((Date.now() - t0) / i) * (i + 1) < 400000); i++) {
            const seite = AB ? (i % 2 ? "B" : "A") : "B";
            setze(seite);
            const j = path.join(LAUF, `k${i}.json`);
            const s = path.join(LAUF, `s${i}.json`);
            const p = spawnSync(process.execPath, ["-r", "./artifacts/ankunft-horizont/haken.cjs", "scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", j, "--spur", s], {
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
            fs.writeFileSync(path.join(LAUF, "liste.json"), JSON.stringify(liste));
        }
    } finally {
        setze("B");
    }
    fs.writeFileSync(path.join(LAUF, "liste.json"), JSON.stringify(liste));
}

// je Boot: die Ausgabe der Kalt-Zeile, die Belegung bis zur Kontrolle (Spur), die Stamm-Glieder inklusive
function zerlege(e) {
    const out = JSON.parse(fs.readFileSync(e.j, "utf8"));
    const { spur, seite } = JSON.parse(fs.readFileSync(e.s, "utf8"));
    const bis = e.tK;
    const a = HL.ankunftsHalter(spur, Object.assign({}, seite, { bis, meilensteine: Object.assign({}, seite.meilensteine, { Kontrolle: bis }) }), { top: 160 });
    const R = { e, out, a, belegt: a.belegtMs };
    R.inkl = new Map(a.summen.map((x) => [`${x.name}${x.ort ? ` [${x.ort.split("/").pop()}]` : ""}`, x.ms]));
    const da = out.weltbildDa;
    R.bau = new Map();
    for (const [t0, ms, stoff, art] of out.bau || []) {
        if (t0 >= da || art === "f") continue;
        const z = R.bau.get(stoff) || [0, 0];
        z[0] += ms;
        z[1]++;
        R.bau.set(stoff, z);
    }
    return R;
}

// die Terme je Boot: wann jeder zuletzt offen war (die Proben der Kalt-Zeile), der Horizont nach seinem Satz
const TERM = { w: /Horizont wächst/, t: /geteilt/, m: /Horizont wird gemalt/, k: /ferne Bäume/, b: /Bäume und Bauten/, p: /gepflanzt|bepflanzt/, s: /Wald-Stücke/, d: /Dorf|Häuser/, l: /Leib/, o: /Boden wächst/ };
function terme(z) {
    const P = (z.out.proben || []).filter((q) => q.t <= z.out.weltbildDa && q.fehlt && q.fehlt.length);
    const zu = Object.entries(TERM)
        .map(([k, re]) => [k, P.filter((q) => q.fehlt.some((f) => re.test(f))).reduce((m, q) => Math.max(m, q.t), 0)])
        .filter(([, t]) => t > 0);
    const fb = z.out.nach && z.out.nach.fernbild;
    return `${zu.map(([k, t]) => `${k}${sek(t)}`).join(" ")} F${sek(fb)} Bild${sek(z.out.weltbildDa)}`;
}

function bericht(teil) {
    const liste = JSON.parse(fs.readFileSync(path.join(LAUF, "liste.json"), "utf8"));
    if (!liste.length) return console.log("❌ keine Boots"), process.exit(1);
    const Z = liste.map(zerlege);
    const seiten = AB ? ["A", "B"] : ["B"];
    const KL = (S) => Z.filter((z) => z.e.seite === S);
    const pre = (S) => (AB ? S + " " : "");
    if (teil === 1) {
        for (const S of seiten) {
            const zs = KL(S);
            if (!zs.length) continue;
            zeile(
                `${pre(S)}KALT ${zs.length}× ${zs[0].e.ad} V${zs[0].out.version} · t(Kontrolle) ${zs.map((z) => sek(z.e.tK)).join("/")} Median ${sek(med(zs.map((z) => z.e.tK)))} s · ` +
                    `Eigenmeldung ${zs.map((z) => sek(z.out.weltbildDa)).join("/")} Median ${sek(med(zs.map((z) => z.out.weltbildDa)))} · BELEGT bis Kontrolle ${zs.map((z) => sek(z.belegt)).join("/")} Median ${sek(med(zs.map((z) => z.belegt)))} s`
            );
        }
        for (const S of seiten) zeile(`${pre(S)}TERME zuletzt offen (w wächst t geteilt m gemalt k Karten b Bauten p Pflanzung s Streu d Dorf l Leib o Boden, F Ferne): ${KL(S).map((z) => `B${z.e.i + 1} ${terme(z)}`).join(" | ")}`); // prettier-ignore
        if (AB)
            zeile(
                `B − A: t(Kontrolle) ${sek(med(KL("B").map((z) => z.e.tK)) - med(KL("A").map((z) => z.e.tK)))} s · Eigenmeldung ${sek(med(KL("B").map((z) => z.out.weltbildDa)) - med(KL("A").map((z) => z.out.weltbildDa)))} s · belegt ` +
                    `${sek(med(KL("B").map((z) => z.belegt)) - med(KL("A").map((z) => z.belegt)))} s (Median, je ${N} Boots abwechselnd)`
            );
        return;
    }
    if (teil === 2) {
        for (const z of Z) zeile(hzZeile(z.out.hz || {}, `${pre(z.e.seite)}B${z.e.i + 1}`));
        return;
    }
    // Teil 3: was der Horizont im Haupt-Faden bis zum Bild kostet — der Takt des Rings (`_tickFernRing` inklusive: Einhängen, Maske,
    // Teilung, Feld-Pass), die Programme seiner Stoffe (fern-ring, feld-pass) — die Programme je Stoff und die Zeugen der Bauten
    for (const S of seiten) {
        const zs = KL(S);
        const glied = (z, k) => ((z.out.nach && z.out.nach.glied) || {})[k] || [0, 0];
        const hzBau = (z, re) => [...z.bau].filter(([k]) => re.test(k)).reduce((m, [, v]) => [m[0] + v[0], m[1] + v[1]], [0, 0]);
        zeile(
            `${pre(S)}HORIZONT IM HAUPT-FADEN bis zum Bild je Boot: ${zs
                .map((z) => {
                    const r = glied(z, "_tickFernRing");
                    const a = hzBau(z, /@fern-ring/);
                    const b = hzBau(z, /@feld-pass/);
                    return `B${z.e.i + 1} Takt ${Math.round(r[0])} ms/${r[1]} · Prog Ring ${Math.round(a[0])} ms/${a[1]} Feld ${Math.round(b[0])} ms/${b[1]}`;
                })
                .join(" | ")}`
        );
        const stoffe = new Set(zs.flatMap((z) => [...z.bau.keys()]));
        const je = [...stoffe].map((k) => [k, med(zs.map((z) => (z.bau.get(k) || [0])[0])), med(zs.map((z) => (z.bau.get(k) || [0, 0])[1]))]).sort((a, b) => b[1] - a[1]);
        zeile(`${pre(S)}PROGRAMME vor dem Bild je Stoff (Median ms/Bauten): ${je.slice(0, 16).map(([k, ms, n]) => `${k} ${Math.round(ms)}/${n}`).join(" · ")}`);
        const stamm = (k) => /\[[a-z-]+\.js[:\]]/.test(k) && !/three\.(webgpu|core)/.test(k);
        const alle = new Set(zs.flatMap((z) => [...z.inkl.keys()]));
        const inkl = [...alle].filter(stamm).map((k) => [k, med(zs.map((z) => z.inkl.get(k) || 0))]).sort((a, b) => b[1] - a[1]).slice(0, 18).map(([k, ms]) => `${k} ${Math.round(ms)}`); // prettier-ignore
        zeile(`${pre(S)}INKL bis Kontrolle (Median ms): ${inkl.join(" · ")}`);
        for (const z of zs.slice(0, 2)) {
            const Zg = ((z.out.hz || {}).zeugen || []).filter((x) => x[0] <= z.out.weltbildDa);
            const wechsel = Zg.filter((x, i) => i === 0 || x[2] !== Zg[i - 1][2] || x[3] !== Zg[i - 1][3]).slice(-6);
            zeile(`${pre(S)}ZEUGEN B${z.e.i + 1} (t · Bauten n · Täter · Terme): ${wechsel.map((x) => `${sek(x[0])} ${x[1]} ${x[2]} [${x[3]}]`).join(" | ")}`);
        }
    }
}

if (TEIL === 1) boote();
bericht(TEIL);
process.exit(0);

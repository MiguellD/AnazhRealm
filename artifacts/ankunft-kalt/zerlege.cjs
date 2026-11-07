// MESS-VEHIKEL w22-ankunft-kalt (nur WIP, fällt vor der Abgabe): N kalte Boots `diag-boot-stage --kalt --echt` mit Spur, die Zerlegung
// des Haupt-Fadens bis zum Weltbild je System (Datei), je Funktion (selbst und inklusiv), je Klasse und die Phasen — in ≤ 10 Zeilen
// mit Marke, damit die Probe-Post sie trägt (gpu-probe.yml liest die letzten 10 Zeilen mit ✅/❌).
"use strict";
/* global process, console */
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const N = Number(process.env.KALT_BOOTS || 5);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ankunft-kalt-"));
const med = (a) => {
    const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};
const sek = (ms) => (ms / 1000).toFixed(2);
const boots = [];
let adapter = "";
for (let i = 0; i < N; i++) {
    const j = path.join(dir, `k${i}.json`);
    const s = path.join(dir, `s${i}.json`);
    const p = spawnSync(process.execPath, ["scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", j, "--spur", s], { encoding: "utf8", timeout: 200000 });
    const txt = (p.stdout || "") + (p.stderr || "");
    adapter = adapter || ((/\[linse-gpu\][^\r\n]*/.exec(txt) || [""])[0]);
    const tK = /t\(Kontrolle\) kalt ([\d.]+) s/.exec(txt);
    if (!fs.existsSync(j) || !fs.existsSync(s)) {
        console.log(`❌ Boot ${i + 1}: keine Ausgabe (Exit ${p.status}) ${txt.split(/\r?\n/).filter(Boolean).slice(-3).join(" | ").slice(0, 400)}`);
        continue;
    }
    boots.push({ out: JSON.parse(fs.readFileSync(j, "utf8")), ...JSON.parse(fs.readFileSync(s, "utf8")), tK: tK ? Number(tK[1]) * 1000 : NaN });
}
if (!boots.length) process.exit(1);

// die Proben bis zum Weltbild je Boot: selbst je Funktion, selbst je Datei (System), inklusiv je Funktion
function zerlege(b) {
    const p = b.spur.profil;
    const kn = new Map(p.nodes.map((n) => [n.id, n]));
    let t = p.startTime;
    const zeiten = p.samples.map((_, i) => (t += p.timeDeltas[i] || 0));
    const seite = b.seite;
    const n = Math.min(b.spur.marken.length, seite.marken.length);
    const paare = [];
    for (let i = 0; i < n; i++) paare.push(b.spur.marken[i] - seite.marken[i] * 1000);
    paare.sort((x, y) => x - y);
    const versatz = paare[n >> 1];
    const bisUs = seite.bis * 1000 + versatz;
    const datei = (c) => String(c.url || "").replace(/^[a-z]+:\/\/[^/]*\//, "").split("?")[0] || "(nativ)";
    const name = (c) => `${c.functionName || "(anonym)"} [${datei(c).split("/").pop()}:${c.lineNumber + 1}]`;
    const stapel = (id) => {
        const s = [];
        for (let k = kn.get(id); k; k = k.parent != null ? kn.get(k.parent) : null) s.push(k);
        return s;
    };
    const R = { selbst: new Map(), datei: new Map(), inkl: new Map(), belegt: 0 };
    for (let i = 0; i < p.samples.length; i++) {
        if (zeiten[i] >= bisUs) break;
        const g = Math.min(10, ((i + 1 < zeiten.length ? zeiten[i + 1] : zeiten[i] + 1000) - zeiten[i]) / 1000);
        const k = kn.get(p.samples[i]);
        if (!k) continue;
        const c = k.callFrame;
        if (c.functionName === "(idle)") continue;
        R.belegt += g;
        const nm = /^\(/.test(c.functionName) ? c.functionName : name(c);
        R.selbst.set(nm, (R.selbst.get(nm) || 0) + g);
        const d = /^\(/.test(c.functionName) ? c.functionName : datei(c);
        R.datei.set(d, (R.datei.get(d) || 0) + g);
        const da = new Set();
        for (const x of stapel(p.samples[i])) {
            const xc = x.callFrame;
            if (/^\(/.test(xc.functionName)) continue;
            const xn = name(xc);
            if (da.has(xn)) continue;
            da.add(xn);
            R.inkl.set(xn, (R.inkl.get(xn) || 0) + g);
        }
    }
    return R;
}
const Z = boots.map(zerlege);
const medMap = (key, top, filter = () => true) => {
    const alle = new Set(Z.flatMap((z) => [...z[key].keys()]));
    return [...alle]
        .filter(filter)
        .map((k) => [k, med(Z.map((z) => z[key].get(k) || 0))])
        .sort((a, b) => b[1] - a[1])
        .slice(0, top)
        .map(([k, ms]) => `${k} ${Math.round(ms)}`);
};
const O = boots.map((b) => b.out);
const zeile = (s) => console.log(("✅ " + s).slice(0, 598));
zeile(
    `KALT ${N}× ${adapter} V${O[0].version} · t(Kontrolle) ${boots.map((b) => sek(b.tK)).join("/")} Median ${sek(med(boots.map((b) => b.tK)))} s · ` +
        `Eigenmeldung ${O.map((o) => sek(o.weltbildDa)).join("/")} · belegt bis Weltbild ${Z.map((z) => sek(z.belegt)).join("/")} s · ` +
        `HTML ${med(O.map((o) => o.laden.html))} · Skripte ${med(O.map((o) => o.laden.skripte))} · DOM ${med(O.map((o) => o.laden.dom))} · Buch ${med(O.map((o) => o.buchDa))} ms`
);
const ph = new Map();
for (const o of O) for (const m of o.halter.meilensteine || []) (ph.get(m.name) || ph.set(m.name, []).get(m.name)).push([m.t, m.belegtMs]);
zeile(`PHASEN (t · belegt, Median): ${[...ph].map(([k, v]) => `${k} ${sek(med(v.map((x) => x[0])))}·${sek(med(v.map((x) => x[1])))}`).join(" | ")}`);
const kl = new Map();
for (const o of O) {
    const s = Math.floor(o.weltbildDa / 1000);
    for (const [k, je] of Object.entries(o.kosten || {})) (kl.get(k) || kl.set(k, []).get(k)).push(Object.entries(je).reduce((m, [t, ms]) => (+t <= s ? m + ms : m), 0));
}
zeile(`KLASSEN bis Weltbild (Median s, verschachtelt je): ${[...kl].map(([k, v]) => [k, med(v)]).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${sek(v)}`).join(" · ")} · GC ${sek(med(O.map((o) => o.halter.klasse["(garbage collector)"])))} · Programm ${sek(med(O.map((o) => o.halter.klasse["(program)"])))}`);
zeile(`SYSTEME selbst (Median ms): ${medMap("datei", 18).join(" · ")}`);
const self = medMap("selbst", 40);
zeile(`SELBST 1: ${self.slice(0, 13).join(" · ")}`);
zeile(`SELBST 2: ${self.slice(13, 28).join(" · ")}`);
const inkl = medMap("inkl", 60, (k) => /stamm\//.test(k) || /\[[a-z-]+\.js:/.test(k));
zeile(`INKL 1: ${inkl.slice(0, 14).join(" · ")}`);
zeile(`INKL 2: ${inkl.slice(14, 30).join(" · ")}`);
zeile(`INKL 3: ${inkl.slice(30, 46).join(" · ")}`);
zeile(
    `AUFGABEN (Boot 1, längste vor dem Bild): ${O[0].halter.aufgaben.slice(0, 6).map((a) => `${sek(a.t)} s ${a.ms} ms ${a.halter.slice(0, 2).map((h) => `${h.name} ${h.ms}`).join("+")}`).join(" | ")} · LongTasks ${O.map((o) => o.halter.aufgaben.length).join("/")}`
);
process.exit(0);

// MESS-VEHIKEL w22-ankunft-kalt (nur WIP, fällt vor der Abgabe): ABAB kalter Boots `diag-boot-stage --kalt --echt` mit Spur auf
// EINER Maschine — A mit den Stoff-Dateien vor dem Schnitt (vorher/), B mit dem Baum des Zweigs; je Seite t(Kontrolle), Weltbild,
// Belegung, Klassen, Phasen und die Systeme selbst — in ≤ 10 Zeilen mit Marke (gpu-probe.yml liest die letzten 10 mit ✅/❌).
"use strict";
/* global process, console, __dirname */
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const N = Number(process.env.KALT_BOOTS || 4); // je Seite (zweiter Läufer: derselbe Plan)
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ankunft-kalt-"));
const TAUSCH = ["stamm/studio-stoff.js", "stamm/stoff-material.js"];
const neu = Object.fromEntries(TAUSCH.map((f) => [f, fs.readFileSync(f)]));
const setze = (seite) => {
    for (const f of TAUSCH) fs.writeFileSync(f, seite === "A" ? fs.readFileSync(path.join(__dirname, "vorher", path.basename(f))) : neu[f]);
};
const med = (a) => {
    const s = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN;
};
const sek = (ms) => (ms / 1000).toFixed(2);
const boots = { A: [], B: [] };
let adapter = "";
try {
    for (let i = 0; i < 2 * N; i++) {
        const seite = i % 2 ? "B" : "A";
        setze(seite);
        const j = path.join(dir, `k${i}.json`);
        const s = path.join(dir, `s${i}.json`);
        const p = spawnSync(process.execPath, ["scripts/diag-boot-stage.cjs", "--kalt", "--echt", "--json", j, "--spur", s], { encoding: "utf8", timeout: 200000 });
        const txt = (p.stdout || "") + (p.stderr || "");
        adapter = adapter || (/\[linse-gpu\][^\r\n]*/.exec(txt) || [""])[0];
        const tK = /t\(Kontrolle\) kalt ([\d.]+) s/.exec(txt);
        if (!fs.existsSync(j) || !fs.existsSync(s)) {
            console.log(`❌ Boot ${i + 1} ${seite}: keine Ausgabe (Exit ${p.status}) ${txt.split(/\r?\n/).filter(Boolean).slice(-3).join(" | ").slice(0, 300)}`);
            continue;
        }
        boots[seite].push({ out: JSON.parse(fs.readFileSync(j, "utf8")), ...JSON.parse(fs.readFileSync(s, "utf8")), tK: tK ? Number(tK[1]) * 1000 : NaN });
    }
} finally {
    setze("B");
}
if (!boots.A.length || !boots.B.length) process.exit(1);

// die Proben bis zum Weltbild je Boot: selbst je Datei (System), selbst je Funktion
function zerlege(b) {
    const p = b.spur.profil;
    const kn = new Map(p.nodes.map((n) => [n.id, n]));
    let t = p.startTime;
    const zeiten = p.samples.map((_, i) => (t += p.timeDeltas[i] || 0));
    const n = Math.min(b.spur.marken.length, b.seite.marken.length);
    const paare = [];
    for (let i = 0; i < n; i++) paare.push(b.spur.marken[i] - b.seite.marken[i] * 1000);
    paare.sort((x, y) => x - y);
    const bisUs = b.seite.bis * 1000 + paare[n >> 1];
    const datei = (c) => String(c.url || "").replace(/^[a-z]+:\/\/[^/]*\//, "").split("?")[0] || "(nativ)";
    const R = { selbst: new Map(), datei: new Map(), belegt: 0 };
    for (let i = 0; i < p.samples.length && zeiten[i] < bisUs; i++) {
        const g = Math.min(10, ((i + 1 < zeiten.length ? zeiten[i + 1] : zeiten[i] + 1000) - zeiten[i]) / 1000);
        const k = kn.get(p.samples[i]);
        if (!k || k.callFrame.functionName === "(idle)") continue;
        const c = k.callFrame;
        R.belegt += g;
        const nm = /^\(/.test(c.functionName) ? c.functionName : `${c.functionName || "(anonym)"} [${datei(c).split("/").pop()}:${c.lineNumber + 1}]`;
        R.selbst.set(nm, (R.selbst.get(nm) || 0) + g);
        const d = /^\(/.test(c.functionName) ? c.functionName : datei(c);
        R.datei.set(d, (R.datei.get(d) || 0) + g);
    }
    return R;
}
const zeile = (s) => console.log(("✅ " + s).slice(0, 598));
const Z = { A: boots.A.map(zerlege), B: boots.B.map(zerlege) };
const medMap = (seite, key, top) => {
    const alle = new Set(Z[seite].flatMap((z) => [...z[key].keys()]));
    return [...alle]
        .map((k) => [k, med(Z[seite].map((z) => z[key].get(k) || 0))])
        .sort((a, b) => b[1] - a[1])
        .slice(0, top)
        .map(([k, ms]) => `${k} ${Math.round(ms)}`);
};
const kopf = (seite) => {
    const B = boots[seite];
    const O = B.map((b) => b.out);
    return (
        `${seite} ${B.length}× t(Kontrolle) ${B.map((b) => sek(b.tK)).join("/")} Median ${sek(med(B.map((b) => b.tK)))} s · Weltbild ` +
        `${O.map((o) => sek(o.weltbildDa)).join("/")} Median ${sek(med(O.map((o) => o.weltbildDa)))} · belegt ${sek(med(Z[seite].map((z) => z.belegt)))} s · ` +
        `LongTasks ${O.map((o) => (o.halter ? o.halter.aufgaben.length : "?")).join("/")}`
    );
};
const klassen = (seite) => {
    const kl = new Map();
    for (const o of boots[seite].map((b) => b.out)) {
        const s = Math.floor(o.weltbildDa / 1000);
        for (const [k, je] of Object.entries(o.kosten || {}))
            (kl.get(k) || kl.set(k, []).get(k)).push(Object.entries(je).reduce((m, [t, ms]) => (+t <= s ? m + ms : m), 0));
    }
    return [...kl].map(([k, v]) => [k, med(v)]).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${sek(v)}`).join(" · ");
};
const phasen = (seite) => {
    const ph = new Map();
    for (const o of boots[seite].map((b) => b.out)) for (const m of o.halter.meilensteine || []) (ph.get(m.name) || ph.set(m.name, []).get(m.name)).push(m.t);
    return [...ph].filter(([k]) => !/^(HTML|Skripte|DOM|buch steht)/.test(k)).map(([k, v]) => `${k.replace(" steht", "")} ${sek(med(v))}`).join(" | ");
};
zeile(`ABAB ${adapter} V${boots.B[0].out.version} · ${kopf("A")}`);
zeile(kopf("B"));
zeile(`KLASSEN A: ${klassen("A")}`);
zeile(`KLASSEN B: ${klassen("B")}`);
zeile(`PHASEN A: ${phasen("A")}`);
zeile(`PHASEN B: ${phasen("B")}`);
zeile(`SYSTEME A: ${medMap("A", "datei", 9).join(" · ")}`);
zeile(`SYSTEME B: ${medMap("B", "datei", 9).join(" · ")}`);
zeile(`SELBST B: ${medMap("B", "selbst", 14).join(" · ")}`);
const dt = med(boots.B.map((b) => b.tK)) - med(boots.A.map((b) => b.tK));
const dw = med(boots.B.map((b) => b.out.weltbildDa)) - med(boots.A.map((b) => b.out.weltbildDa));
zeile(`B − A: t(Kontrolle) ${dt >= 0 ? "+" : ""}${sek(dt)} s · Weltbild ${dw >= 0 ? "+" : ""}${sek(dw)} s (Median, ${boots.A.length}+${boots.B.length} Boots abwechselnd)`);
process.exit(0);

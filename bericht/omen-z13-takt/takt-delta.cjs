// takt-delta.cjs — die Zerlegung des CPU-Takts je Methode, A gegen B (z13, 24.10.): aus den Roh-Dateien von `werkbank takt`
// (<lauf>-takt.roh.json: Takte + Stichproben der Spur) je Methode die Selbst- und Gesamt-Zeit in ms je Takt, einmal über die Takte ab
// p95 (die Größe des ABAB, CPU-Takt p95) und einmal über alle Takte — OHNE die 0,25-ms-Schwelle der Tabelle (der ganze Δ ist 0,25 ms).
// Die Linse ist die des Instruments (scripts/lib/haenger-linse.cjs, ihre inneren Helfer per Anhang geladen, der Baum bleibt unberührt).
//   node takt-delta.cjs <instrument-baum> <A1.roh.json,A2…> <B1.roh.json,B2…> [--json aus.json] [--top 12]
"use strict";
const fs = require("fs");
const path = require("path");
const Module = require("module");
const [baum, aListe, bListe] = process.argv.slice(2);
const opt = (k, d) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : d);
const UNTER = opt("--unter");
const datei = path.join(baum, "scripts", "lib", "haenger-linse.cjs");
const m = new Module(datei, module);
m.filename = datei;
m.paths = Module._nodeModulePaths(path.dirname(datei));
m._compile(fs.readFileSync(datei, "utf8") + "\nmodule.exports.__intern = { profilLesen, probenIn, versatzVon, quantil };", datei);
const { profilLesen, probenIn, versatzVon, quantil } = m.exports.__intern;

function lauf(f) {
    const { roh, spur } = JSON.parse(fs.readFileSync(f, "utf8"));
    const T = roh.takte, P = profilLesen(spur.profil), v = versatzVon(spur, T, P);
    if (v == null) throw new Error(f + ": keine Takt-Marken auf der Spur");
    const url = new Map();
    for (const n of spur.profil.nodes) if (n.callFrame.url) url.set(P.name(n.id), n.callFrame.url.replace(/^.*?\/\/[^/]+\//, "").replace(/\?v=.*$/, ""));
    const cpu = (i) => T.c1[i] - T.c0[i];
    const ids = [...T.t.keys()].filter((i) => T.g[i]);
    const q = quantil(ids.map(cpu));
    const gruppe = (gr) => {
        const selbst = new Map(), ges = new Map();
        let gedeckt = 0;
        for (const i of gr) {
            const s = probenIn(P, v, T.c0[i], T.c1[i]);
            if (!s.length) continue;
            gedeckt++;
            const g = cpu(i) / s.length / gr.length;
            for (const leaf of s) {
                let namen = P.stapel(leaf).map((id) => P.name(id));
                // `--unter <name>`: nur die Rahmen unter dieser Methode (was in ihr teurer wurde)
                if (UNTER) {
                    const u = namen.indexOf(UNTER);
                    if (u < 0) continue;
                    namen = namen.slice(u);
                }
                const blatt = namen[namen.length - 1];
                selbst.set(blatt, (selbst.get(blatt) || 0) + g);
                for (const nm of new Set(namen)) ges.set(nm, (ges.get(nm) || 0) + g);
            }
        }
        return { selbst, ges, gedeckt, n: gr.length };
    };
    const sp = ids.filter((i) => cpu(i) >= q(0.95));
    return { datei: f, cpu: q.zahl, takte: ids.length, spitze: gruppe(sp), alle: gruppe(ids), url };
}
const A = aListe.split(",").map(lauf), B = bListe.split(",").map(lauf);
const mittel = (L, g, art, nm) => L.reduce((s, x) => s + (x[g][art].get(nm) || 0), 0) / L.length;
const namen = new Set([...A, ...B].flatMap((x) => [...x.spitze.ges.keys(), ...x.alle.ges.keys()]));
const url = new Map();
for (const x of [...A, ...B]) for (const [k, u] of x.url) if (!url.has(k)) url.set(k, u);
const r3 = (x) => +x.toFixed(3);
const zeilen = [...namen].map((nm) => {
    const z = { name: nm, datei: url.get(nm) || "" };
    for (const g of ["spitze", "alle"]) for (const art of ["selbst", "ges"]) {
        const a = mittel(A, g, art, nm), b = mittel(B, g, art, nm);
        z[`${g}.${art}`] = { A: r3(a), B: r3(b), d: r3(b - a), je: [...A, ...B].map((x) => r3(x[g][art].get(nm) || 0)) };
    }
    return z;
});
const top = Number(opt("--top", 12));
const nach = (k) => zeilen.filter((z) => !/^\((program|idle|root|garbage collector)\)$|^(loop|_gameLoopTick)$|^\(anonym\) \[werkbank|^e \[three/.test(z.name)).sort((x, y) => y[k].d - x[k].d).slice(0, top);
const c95 = (L) => L.map((x) => x.cpu.p95).join(" / ");
const aus = [
    `CPU-Takt p95 A ${c95(A)} · B ${c95(B)} ms; p50 A ${A.map((x) => x.cpu.p50).join(" / ")} · B ${B.map((x) => x.cpu.p50).join(" / ")}`,
    `Spitzen-Takte mit Proben A ${A.map((x) => x.spitze.gedeckt + "/" + x.spitze.n).join(" ")} · B ${B.map((x) => x.spitze.gedeckt + "/" + x.spitze.n).join(" ")}`,
];
for (const [k, titel] of [["spitze.selbst", "SELBST ms je Takt ab p95"], ["spitze.ges", "GESAMT ms je Takt ab p95"], ["alle.selbst", "SELBST ms je Takt (alle)"]]) {
    aus.push("", `${titel} — größtes Δ B−A (A · B):`);
    for (const z of nach(k)) aus.push(`  ${String(z[k].d).padStart(7)}  ${z[k].A} · ${z[k].B}  (je Boot ${z[k].je.join(" ")})  ${z.name}${z.datei ? "  [" + z.datei + "]" : ""}`);
}
console.log(aus.join("\n"));
if (opt("--json")) fs.writeFileSync(opt("--json"), JSON.stringify({ A: A.map((x) => ({ datei: x.datei, cpu: x.cpu })), B: B.map((x) => ({ datei: x.datei, cpu: x.cpu })), zeilen }, null, 1));

// 1910 F1 Auswertung FAHRT (fahrt.sh, Werkzeug der Radeon boot.sh): je Boot der `lauf 15 --ein 5 --tiere frei` im Ritt (GT im
// Kreis, Third) — fps, Frame p50/p95/p99, CPU-Takt p50/p95/p99, GPU-Durchsatz p50, VRAM; dazu die Fahrt (aufsitzen.js: ok, Takte
// bis zum Mesh; pruef.js: geritten, Weg, v, Sicht) und nvidia-smi (Takt, Temperatur). Je Größe das Mittel je Seite mit den Werten
// je Boot, Δ B − A, 2σ (gepoolt aus den Abweichungen vom Mittel je Seite) und Welch-t: „nicht langsamer", wenn Δ ≤ max(2σ, Auflösung).
//   node fahrt-auswertung.cjs <fahrt-ordner>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, "utf8");
        const j = JSON.parse(t.slice(t.indexOf("{")));
        return j.ergebnis !== undefined ? j.ergebnis : j;
    } catch (_e) {
        return null;
    }
};
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const boots = fs
    .readdirSync(D)
    .filter((x) => /^[AB][0-9]+-lauf\.json$/.test(x))
    .map((x) => {
        const n = x.replace("-lauf.json", "");
        const l = lies(path.join(D, x)) || {};
        const auf = lies(path.join(D, n + "-auf.json")) || {};
        const p = lies(path.join(D, n + "-pruef.json")) || {};
        const ein = lies(path.join(D, n + "-ein.json")) || {};
        let smi = { mhz: NaN, temp: NaN };
        try {
            const z = fs.readFileSync(path.join(D, n + "-smi.csv"), "utf8").split(String.fromCharCode(10)).map((s) => s.split(",").map((q) => q.trim())).filter((r) => r.length > 3);
            smi = { mhz: mittel(z.map((r) => parseFloat(r[1]))), temp: mittel(z.map((r) => parseFloat(r[3]))) };
        } catch (_e) {}
        const start = fs.existsSync(path.join(D, n + "-start.log")) ? fs.readFileSync(path.join(D, n + "-start.log"), "utf8") : "";
        const ad = (start.match(/\[linse-gpu\][^\r\n]*/) || [""])[0];
        return { boot: n, seite: n[0], l, auf, p, ein, smi, adapter: ad };
    })
    .sort((a, b) => a.boot.slice(1).localeCompare(b.boot.slice(1)) || a.seite.localeCompare(b.seite));
const GR = [
    ["fps", (b) => b.l.fps, f1, -1],
    ["Frame p50 ms", (b) => b.l.frameMs && b.l.frameMs.p50, f1, 1],
    ["Frame p95 ms", (b) => b.l.frameMs && b.l.frameMs.p95, f1, 1],
    ["Frame p99 ms", (b) => b.l.frameMs && b.l.frameMs.p99, f1, 1],
    ["CPU-Takt p50 ms", (b) => b.l.cpuTaktMs && b.l.cpuTaktMs.p50, f1, 1],
    ["CPU-Takt p95 ms", (b) => b.l.cpuTaktMs && b.l.cpuTaktMs.p95, f1, 1],
    ["CPU-Takt p99 ms", (b) => b.l.cpuTaktMs && b.l.cpuTaktMs.p99, f1, 1],
    ["GPU-Durchsatz p50 ms", (b) => b.l.gpuDurchsatzMs && b.l.gpuDurchsatzMs.p50, f2, 1],
    ["VRAM MB (lauf)", (b) => b.l.vramMB && b.l.vramMB.jetzt, f1, 0],
    ["Weg m (pruef)", (b) => b.p.weg, f1, 0],
    ["v m/s (pruef)", (b) => b.p.v, f1, 0],
    ["Takte bis Mesh (auf)", (b) => b.auf.takte, f1, 0],
    ["Takt MHz (smi)", (b) => b.smi.mhz, f1, 0],
    ["Temperatur °C (smi)", (b) => b.smi.temp, f1, 0],
];
let out = `## Fahrt — je Boot\n\n| Boot | auf ok | geritten | Sicht | ${GR.map((g) => g[0]).join(" | ")} |\n|${"---|".repeat(GR.length + 4)}\n`;
for (const b of boots) out += `| ${b.boot} | ${b.auf.ok} | ${b.p.geritten} | ${b.p.sicht} | ${GR.map(([, f, fmt]) => fmt(f(b))).join(" | ")} |\n`;
out += `\nAdapter je Boot: ${[...new Set(boots.map((b) => b.adapter))].join(" · ") || "–"}\n`;
out += `\n## Mittel je Seite (A 47c8b089 main · B e93134f4 integ-probe + F1)\n\n| Größe | A | B | Δ B − A | 2σ | t (Welch) | Urteil |\n|---|---|---|---|---|---|---|\n`;
const urteile = [];
for (const [titel, f, fmt, r] of GR) {
    const w = (s) => boots.filter((b) => b.seite === s).map(f).map(Number);
    const va = w("A").filter(Number.isFinite),
        vb = w("B").filter(Number.isFinite);
    const ma = mittel(va),
        mb = mittel(vb),
        d = mb - ma;
    const abw = [...va.map((x) => x - ma), ...vb.map((x) => x - mb)];
    const sig = abw.length > 2 ? Math.sqrt(abw.reduce((a, x) => a + x * x, 0) / (abw.length - 2)) : NaN;
    const s2 = (v, m) => v.reduce((a, x) => a + (x - m) * (x - m), 0) / Math.max(1, v.length - 1);
    const se = Math.sqrt(s2(va, ma) / Math.max(1, va.length) + s2(vb, mb) / Math.max(1, vb.length));
    const t = se > 0 ? d / se : NaN;
    let u = "–";
    if (r !== 0 && Number.isFinite(d) && Number.isFinite(sig)) {
        const aufl = fmt === f2 ? 0.01 : 0.1;
        u = (r > 0 ? d : -d) <= Math.max(2 * sig, aufl) + 1e-9 ? "nicht langsamer" : "LANGSAMER";
    }
    urteile.push({ titel, ma, mb, d, sig, t, u, a: va, b: vb });
    out += `| ${titel} | ${fmt(ma)} (${va.map(fmt).join(" · ")}) | ${fmt(mb)} (${vb.map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${Number.isFinite(t) ? t.toFixed(2) : "–"} | ${u} |\n`;
}
const KERN = new Set(["Frame p95 ms", "CPU-Takt p95 ms", "CPU-Takt p99 ms"]);
const langsam = urteile.filter((x) => KERN.has(x.titel) && x.u !== "nicht langsamer");
out += `\n**KERN-URTEIL FAHRT** (Frame p95 · CPU-Takt p95 · CPU-Takt p99; Δ ≤ max(2σ gepoolt, Auflösung)): ${langsam.length ? "LANGSAMER an " + langsam.map((x) => x.titel).join(", ") : "nicht langsamer"} (${boots.filter((b) => b.seite === "A").length}+${boots.filter((b) => b.seite === "B").length} Boots)\n`;
fs.writeFileSync(path.join(D, "auswertung-fahrt.md"), out);
fs.writeFileSync(path.join(D, "auswertung-fahrt.json"), JSON.stringify({ boots: boots.map((b) => ({ boot: b.boot, auf: b.auf, pruef: b.p, adapter: b.adapter })), urteile }, null, 1));
console.log(out);

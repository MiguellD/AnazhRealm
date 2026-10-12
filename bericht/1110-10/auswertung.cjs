// Auswertung 1110-10: V18.542 (B, integ-probe a0a05614) gegen main V18.541 (A, 2c8deda9), mit Takt je Bank und Lauf.
// Wiese und Genesis: je Boot gpu-bank (Wiese Gier 0 / −0,88, Genesis die Gier des Orts), Frame p50/p95 und CPU-Takt p95 unter
// Regler frei und voll, Befehle · Dreiecke · VRAM. Bühne: je Pose A gegen B, Δ, σ, 2σ-Band, Takt-Probe (±0,5 %). Dorf: VRAM.
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const mittel = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sigma = (a) => {
    const m = mittel(a);
    return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / Math.max(1, a.length - 1));
};
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "–");
const lies = (n) => {
    const p = path.join(DIR, n + ".json");
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null;
};
const urt = (j) => (j && j.urteil ? (typeof j.urteil === "string" ? j.urteil : j.urteil.text || JSON.stringify(j.urteil)) : "–");
let out = "";

function ortBoots(pre, n) {
    const S = { A: [], B: [] };
    for (let i = 1; i <= n; i++) {
        const X = i % 2 ? "A" : "B";
        const j = lies(`${pre}${i}${X}`);
        if (!j) continue;
        const k = j.kurz || {};
        const lf = k.laufFrei || {}, lv = k.laufVoll || {}, gb = k.gpuBank || {};
        const bank = Object.entries(gb).filter(([, b]) => b && Number.isFinite(b.gpuJeFrameMs));
        S[X].push({
            n: `${pre}${i}${X}`,
            urteil: urt(j),
            bank: Object.fromEntries(bank.map(([g, b]) => [g, b.gpuJeFrameMs])),
            bankMhz: Object.fromEntries(bank.map(([g, b]) => [g, b.takt ? b.takt.mhz : NaN])),
            p50f: lf.frameMs ? lf.frameMs.p50 : NaN,
            p95f: lf.frameMs ? lf.frameMs.p95 : NaN,
            cpu95f: lf.cpuTaktMs ? lf.cpuTaktMs.p95 : NaN,
            mhzf: lf.takt ? lf.takt.mhz : NaN,
            p50v: lv.frameMs ? lv.frameMs.p50 : NaN,
            p95v: lv.frameMs ? lv.frameMs.p95 : NaN,
            cpu95v: lv.cpuTaktMs ? lv.cpuTaktMs.p95 : NaN,
            ewmaV: lv.renderEwmaMs,
            cmds: lv.befehle ? lv.befehle.mittel : NaN,
            tris: lv.dreiecke ? lv.dreiecke.mittel / 1000 : NaN,
            vram: k.band ? k.band.vramMB : lv.vramMB,
            band: k.band ? k.band.urteil : "–",
            tiere: lv.tiere ? lv.tiere.gesamt : NaN,
        });
    }
    return S;
}
function ortTabelle(titel, S) {
    const giere = [...new Set([...S.A, ...S.B].flatMap((r) => Object.keys(r.bank)))];
    out += `## ${titel} (je Boot)\n\n| Boot | Urteil | ${giere.map((g) => `gpu-bank ${g} (MHz)`).join(" | ")} | frei: Frame p50 / p95 · CPU p95 (MHz) | voll: Frame p50 / p95 · CPU p95 | Befehle · Dreiecke k · VRAM MB | Band | Tiere |\n|---|---|${giere.map(() => "---|").join("")}---|---|---|---|---|\n`;
    const n = Math.max(S.A.length, S.B.length);
    for (let i = 0; i < n; i++)
        for (const X of ["A", "B"]) {
            const r = S[X][i];
            if (!r) continue;
            out += `| ${r.n} | ${r.urteil} | ${giere.map((g) => `${f2(r.bank[g])} (${f1(r.bankMhz[g])})`).join(" | ")} | ${r.p50f} / ${r.p95f} · ${r.cpu95f} (${f1(r.mhzf)}) | ${r.p50v} / ${r.p95v} · ${r.cpu95v} | ${f1(r.cmds)} · ${f1(r.tris)} · ${f1(r.vram)} | ${r.band} | ${r.tiere} |\n`;
        }
    out += `\n## ${titel}: Mediane A gegen B\n\n| Größe | A | B | B − A |\n|---|---|---|---|\n`;
    const zeile = (name, f) => {
        const a = med(S.A.map(f)), b = med(S.B.map(f));
        out += `| ${name} | ${f2(a)} | ${f2(b)} | ${f2(b - a)} |\n`;
        return { name, a, b, d: b - a };
    };
    const z = [];
    for (const g of giere) {
        z.push(zeile(`gpu-bank ${g} ms`, (r) => r.bank[g]));
        z.push(zeile(`gpu-bank ${g} MHz`, (r) => r.bankMhz[g]));
    }
    for (const [k, name] of [["p50f", "frei Frame p50"], ["p95f", "frei Frame p95"], ["cpu95f", "frei CPU-Takt p95"], ["p50v", "voll Frame p50"], ["p95v", "voll Frame p95"], ["cpu95v", "voll CPU-Takt p95"], ["ewmaV", "voll render-EWMA"], ["cmds", "Befehle (Lauf voll, Mittel)"], ["tris", "Dreiecke k (Lauf voll, Mittel)"], ["vram", "VRAM MB (Band)"]])
        z.push(zeile(name, (r) => r[k]));
    out += "\n";
    return z;
}
const W = ortBoots("w", 8), G = ortBoots("g", 8), D = ortBoots("d", 4);
const zW = ortTabelle("Wiese", W);
const zG = ortTabelle("Genesis", G);
out += "## Dorf (je Boot)\n\n| Boot | Urteil | Band | VRAM MB |\n|---|---|---|---|\n";
for (let i = 0; i < 2; i++) for (const X of ["A", "B"]) { const r = D[X][i]; if (r) out += `| ${r.n} | ${r.urteil} | ${r.band} | ${f1(r.vram)} |\n`; }
out += `\nDorf VRAM Median A ${f1(med(D.A.map((r) => r.vram)))} · B ${f1(med(D.B.map((r) => r.vram)))} MB\n\n`;

// ── Bühne ──
const P = {};
for (let i = 1; i <= 8; i++) {
    const X = i % 2 ? "A" : "B";
    const j = lies(`b${i}${X}`);
    if (!j) continue;
    for (const [k, b] of Object.entries(j.kurz.gpuBank || {})) {
        if (!b) continue;
        P[k] = P[k] || { A: [], B: [] };
        P[k][X].push({ n: `b${i}${X}`, ms: b.gpuJeFrameMs, mhz: b.takt ? b.takt.mhz : NaN, urteil: urt(j) });
    }
}
out += "## Bühne: je Pose A (2c8deda9) gegen B (a0a05614)\n\n| Pose | A ms (MHz) | B ms (MHz) | Mittel A | Mittel B | Δ B − A | σ A / σ B | 2σ (gepoolt) | Takt-Spanne aller 8 | Urteil |\n|---|---|---|---|---|---|---|---|---|---|\n";
const urteile = [];
for (const [k, s] of Object.entries(P)) {
    const a = s.A.map((r) => r.ms), b = s.B.map((r) => r.ms);
    const alle = s.A.map((r) => r.mhz).concat(s.B.map((r) => r.mhz));
    const tm = med(alle);
    const tAus = alle.filter((x) => !(Math.abs(x - tm) <= tm * 0.005));
    const d = mittel(b) - mittel(a);
    const band = 2 * Math.sqrt((sigma(a) ** 2 + sigma(b) ** 2) / 2);
    const dn = mittel(s.B.map((r) => (r.ms * r.mhz) / tm)) - mittel(s.A.map((r) => (r.ms * r.mhz) / tm));
    let u;
    if (alle.some((x) => !Number.isFinite(x))) u = "BLIND (kein Takt)";
    else if (tAus.length) u = `BLIND (Takt: ${tAus.length} Sitzungen außerhalb ±0,5 %; normiert Δ ${f3(dn)})`;
    else u = Math.abs(d) <= Math.max(band, 0.064) ? "IM BAND" : d > 0 ? "LANGSAMER" : "SCHNELLER";
    urteile.push({ k, d, band, u, dn, tm });
    out += `| ${k} | ${s.A.map((r) => `${f2(r.ms)} (${r.mhz.toFixed(0)})`).join(" · ")} | ${s.B.map((r) => `${f2(r.ms)} (${r.mhz.toFixed(0)})`).join(" · ")} | ${f3(mittel(a))} | ${f3(mittel(b))} | ${f3(d)} | ${f3(sigma(a))} / ${f3(sigma(b))} | ${f3(band)} | ${Math.min(...alle).toFixed(0)}–${Math.max(...alle).toFixed(0)} | ${u} |\n`;
}
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify({ wiese: W, genesis: G, dorf: D, buehne: P, urteile, zW, zG }, null, 1));
console.log(out);

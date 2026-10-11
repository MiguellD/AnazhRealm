// Auswertung 1110-8: V18.541 (B, 2c8deda9) gegen main (A, be1d6e57; an der Bühne A' = 953186f4), mit Takt je Bank.
// Wiese: je Boot gpu-bank je Blick (ms, MHz), Frame p50/p95 und CPU-Takt p95 unter Regler frei. Bühne: je Pose A' gegen B,
// Δ, σ je Seite, das 2σ-Band und die Takt-Probe (alle acht Sitzungen im ±0,5 % um den Median).
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2];
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
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f3 = (v) => (Number.isFinite(v) ? v.toFixed(3) : "–");
const lies = (n) => JSON.parse(fs.readFileSync(path.join(DIR, n + ".json"), "utf8"));
let out = "";

// ── Wiese ──
const W = { A: [], B: [] };
for (let i = 1; i <= 8; i++) {
    const X = i % 2 ? "A" : "B";
    const j = lies(`w${i}${X}`);
    const st = (n) => j.schritte.find((s) => s.name === n);
    const lf = st("lauf-frei").ergebnis;
    const lv = st("lauf-voll").ergebnis;
    const gb = j.kurz.gpuBank;
    W[X].push({
        n: `w${i}${X}`,
        urteil: j.urteil,
        b0: gb["0"].gpuJeFrameMs,
        b88: gb["-0.88"].gpuJeFrameMs,
        t0: gb["0"].takt ? gb["0"].takt.mhz : NaN,
        t88: gb["-0.88"].takt ? gb["-0.88"].takt.mhz : NaN,
        p50f: lf.frameMs.p50,
        p95f: lf.frameMs.p95,
        cpu95f: lf.cpuTaktMs.p95,
        p95v: lv.frameMs.p95,
        cpu95v: lv.cpuTaktMs.p95,
    });
}
out += "## Wiese (je Boot)\n\n| Boot | Urteil | gpu-bank 0 (MHz) | gpu-bank −0,88 (MHz) | frei: Frame p50 / p95 · CPU p95 | voll: Frame p95 · CPU p95 |\n|---|---|---|---|---|---|\n";
for (let i = 0; i < 4; i++)
    for (const X of ["A", "B"]) {
        const r = W[X][i];
        out += `| ${r.n} | ${r.urteil} | ${f2(r.b0)} (${r.t0.toFixed(0)}) | ${f2(r.b88)} (${r.t88.toFixed(0)}) | ${r.p50f} / ${r.p95f} · ${r.cpu95f} | ${r.p95v} · ${r.cpu95v} |\n`;
    }
const zW = (k, fmt = f2) => `| ${k} | ${fmt(med(W.A.map((r) => r[k])))} | ${fmt(med(W.B.map((r) => r[k])))} | ${fmt(med(W.B.map((r) => r[k])) - med(W.A.map((r) => r[k])))} |`;
out += "\n## Wiese: Mediane A gegen B (je 4 Boots)\n\n| Größe | A | B | B − A |\n|---|---|---|---|\n";
for (const k of ["b0", "b88", "t0", "t88", "p50f", "p95f", "cpu95f", "p95v", "cpu95v"]) out += zW(k) + "\n";

// ── Bühne ──
const P = {};
for (let i = 1; i <= 8; i++) {
    const X = i % 2 ? "A" : "B";
    const j = lies(`b${i}${X}`);
    for (const [k, b] of Object.entries(j.kurz.gpuBank || {})) {
        if (!b) continue;
        P[k] = P[k] || { A: [], B: [] };
        P[k][X].push({ n: `b${i}${X}`, ms: b.gpuJeFrameMs, mhz: b.takt ? b.takt.mhz : NaN, urteil: j.urteil });
    }
}
out += "\n## Bühne: je Pose A' (953186f4) gegen B (2c8deda9)\n\n| Pose | A' ms (MHz) | B ms (MHz) | Mittel A' | Mittel B | Δ B − A' | σ A' / σ B | 2σ (gepoolt) | Takt-Spanne aller 8 | Urteil |\n|---|---|---|---|---|---|---|---|---|---|\n";
const urteile = [];
for (const [k, s] of Object.entries(P)) {
    const a = s.A.map((r) => r.ms),
        b = s.B.map((r) => r.ms);
    const ta = s.A.map((r) => r.mhz),
        tb = s.B.map((r) => r.mhz);
    const alle = ta.concat(tb);
    const tm = med(alle);
    const tAus = alle.filter((x) => !(Math.abs(x - tm) <= tm * 0.005));
    const d = mittel(b) - mittel(a);
    const sp = Math.sqrt((sigma(a) ** 2 + sigma(b) ** 2) / 2);
    const band = 2 * sp;
    // Takt-normiert (Hilfe, nie das Urteil): ms × MHz / Median-MHz
    const na = s.A.map((r) => (r.ms * r.mhz) / tm),
        nb = s.B.map((r) => (r.ms * r.mhz) / tm);
    const dn = mittel(nb) - mittel(na);
    let u;
    if (alle.some((x) => !Number.isFinite(x))) u = "BLIND (kein Takt)";
    else if (tAus.length) u = `BLIND (Takt: ${tAus.length} Sitzungen außerhalb ±0,5 %; normiert Δ ${f3(dn)})`;
    else u = Math.abs(d) <= Math.max(band, 0.064) ? "IM BAND" : d > 0 ? "LANGSAMER" : "SCHNELLER";
    urteile.push({ k, d, band, u, dn, tm });
    out += `| ${k} | ${s.A.map((r) => `${f2(r.ms)} (${r.mhz.toFixed(0)})`).join(" · ")} | ${s.B.map((r) => `${f2(r.ms)} (${r.mhz.toFixed(0)})`).join(" · ")} | ${f3(mittel(a))} | ${f3(mittel(b))} | ${f3(d)} | ${f3(sigma(a))} / ${f3(sigma(b))} | ${f3(band)} | ${Math.min(...alle).toFixed(0)}–${Math.max(...alle).toFixed(0)} | ${u} |\n`;
}
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify({ wiese: W, buehne: P, urteile }, null, 1));
console.log(out);

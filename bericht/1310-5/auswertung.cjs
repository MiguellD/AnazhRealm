// 1310-5: je Sitzung die Bänke im Wechsel (Bäume an/aus) — GPU je Frame, Takt-Mittel (alle Proben und die unter Last, Drossel
// ≠ 0), je Modus Mittel; der Baum-Preis = aus − an. node auswertung.cjs <A|B>...
"use strict";
const fs = require("fs");
const path = require("path");
for (const L of process.argv.slice(2)) {
    const d = path.join(__dirname, L);
    const reihe = [];
    for (const f of fs.readdirSync(d).filter((x) => /^bank-\d+-(an|aus)\.txt$/.test(x)).sort((a, b) => parseInt(a.slice(5)) - parseInt(b.slice(5)))) {
        const t = fs.readFileSync(path.join(d, f), "utf8");
        const j = JSON.parse(t.slice(t.lastIndexOf("{\n")));
        const tk = fs.existsSync(path.join(d, f.replace("bank", "takt").replace(".txt", ".csv")))
            ? fs.readFileSync(path.join(d, f.replace("bank", "takt").replace(".txt", ".csv")), "utf8").trim().split(/\r?\n/).map((z) => z.split(",").map((s) => s.trim()))
            : [];
        const alle = tk.map((z) => Number(z[0])).filter(Number.isFinite);
        const last = tk.filter((z) => z[1] && !/^0x0+$/.test(z[1])).map((z) => Number(z[0]));
        const m = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
        reihe.push({ f, modus: f.match(/-(an|aus)\./)[1], gpu: j.gpuJeFrameMs, cpu: j.cpuJeFrameMs, takt: m(alle), taktLast: m(last), n: alle.length });
    }
    console.log(`== ${L}`);
    for (const r of reihe) console.log(`${r.f.padEnd(16)} ${r.modus.padEnd(4)} GPU ${r.gpu.toFixed(2)} ms · CPU ${r.cpu.toFixed(2)} · Takt ${r.takt.toFixed(0)} (Last ${r.taktLast.toFixed(0)}, ${r.n} Proben)`);
    const mm = (k, mo) => { const a = reihe.filter((r) => r.modus === mo).map((r) => r[k]); return a.reduce((s, x) => s + x, 0) / a.length; };
    console.log(`an  GPU ${mm("gpu", "an").toFixed(2)} · aus GPU ${mm("gpu", "aus").toFixed(2)} · Baum-Preis ${(mm("gpu", "an") - mm("gpu", "aus")).toFixed(2)} ms · Takt an/aus ${mm("takt", "an").toFixed(0)}/${mm("takt", "aus").toFixed(0)}`);
}

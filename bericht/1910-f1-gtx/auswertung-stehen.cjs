// Auswertung 1910 F1 STEHEN (Kopie von p3/n1810/s6/auswertung-stehen.cjs, Seiten umgestellt): A = n1910-f1a (main 47c8b089) · B = n1910-f1b (integ-probe e93134f4 = A + F1 Kamera-Rig). Instrument = A.
//   node auswertung-stehen.cjs <dir> <w-ego|w-third|g-ego|g-third>
// F6-Zusatz: Pass-Kosten nur über `rein` (unterer Gipfel) in gpuJePassMs, k0-Zustand je Welt (p50 + rein), Atlas-MB aus der
// VRAM-Liste des Bands (messung.roh.vram.liste = __vramBericht(100000)): tex:karte-albedo/normal/licht:atlas.
// je Boot: Lauf voll (fps, Frame p50/p95, CPU-Takt p95), Lauf frei (CPU p95), gpu-bank (je Gier, mit Takt), Band (GPU je Frame,
// Befehle, Dreiecke, VRAM); je Größe das Mittel je Seite mit den Werten je Boot, Δ B − A und 2σ (σ aus den Abweichungen vom
// Mittel je Seite, gepoolt): „nicht langsamer", wenn Δ ≤ 2σ.
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const KOMBI = process.argv[3] || "w-ego";
const mittel = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? b.reduce((x, y) => x + y, 0) / b.length : NaN;
};
const f2 = (v) => (Number.isFinite(v) ? v.toFixed(2) : "–");
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const fi = (v) => (Number.isFinite(v) ? String(Math.round(v)) : "–");
const muster = new RegExp("^" + KOMBI + "-([AB])[0-9]+\\.json$");
const zeilen = [];
const PASSE = new Set();
for (const n of fs.readdirSync(DIR).filter((x) => muster.test(x))) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const lv = (j.kurz && j.kurz.laufVoll) || {};
    const lf = (j.kurz && j.kurz.laufFrei) || {};
    const gb = Object.entries((j.kurz && j.kurz.gpuBank) || {});
    const st = (j.schritte || []).find((s) => s.name === "band");
    const m = (st && st.ergebnis && st.ergebnis.messung) || {};
    const g = (m.groessen || []).find((x) => x.name === "GPU ms/Frame");
    const z = {
        boot: n.replace(".json", ""),
        seite: muster.exec(n)[1],
        start: j.start,
        urteil: j.urteil,
        fps: lv.fps,
        frameP50: lv.frameMs ? lv.frameMs.p50 : NaN,
        frameP95: lv.frameMs ? lv.frameMs.p95 : NaN,
        cpuP95: lv.cpuTaktMs ? lv.cpuTaktMs.p95 : NaN,
        cpuP95frei: lf.cpuTaktMs ? lf.cpuTaktMs.p95 : NaN,
        band: g ? g.ist : NaN,
        befehle: m.summe ? m.summe.befehle : NaN,
        dreiecke: m.summe ? m.summe.dreiecke : NaN,
        vram: m.vram ? m.vram.mb : NaN,
    };
    // die Pass-Uhr des echten Laufs (lauf voll, gpuJePassMs p50 je Pass) + Durchsatz, Summe der Pässe, CPU p50/p99
    const lvs = (j.schritte || []).find((s) => s.name === "lauf-voll");
    const le = (lvs && lvs.ergebnis) || {};
    for (const [pn, pv] of Object.entries(le.gpuJePassMs || {})) if (pv && Number.isFinite(pv.rein)) { z["pass:" + pn] = pv.rein; PASSE.add(pn); }
    const k0 = (le.gpuJePassMs || {}).k0 || {};
    z.k0p50 = k0.p50; z.k0rein = k0.rein; z.k0anteilOben = k0.anteilOben;
    // Atlas-MB (MiB) aus der vollen VRAM-Liste des Bands
    const liste = (m.roh && m.roh.vram && m.roh.vram.liste) || [];
    const atl = (re) => liste.filter((e) => re.test(e.k)).reduce((a, e) => a + e.mb, 0);
    const hat = liste.length > 0;
    z.atlasAlbedo = hat ? atl(/^tex:karte-albedo:atlas/) : NaN;
    z.atlasNormal = hat ? atl(/^tex:karte-normal:atlas/) : NaN;
    z.atlasLicht = hat ? atl(/^tex:karte-licht:atlas/) : NaN;
    z.atlas = hat ? z.atlasAlbedo + z.atlasNormal + z.atlasLicht : NaN;
    z.atlasForm = liste.filter((e) => /^tex:karte-(albedo|normal|licht):atlas/.test(e.k)).map((e) => e.k).join(" | ");
    z.vramLauf = le.vramMB ? le.vramMB.jetzt : NaN;
    z.durchsatz = le.gpuDurchsatzMs ? le.gpuDurchsatzMs.p50 : NaN;
    z.gpuMs = le.gpuMs ? le.gpuMs.p50 : NaN;
    z.cpuP50 = le.cpuTaktMs ? le.cpuTaktMs.p50 : NaN;
    z.cpuP99 = le.cpuTaktMs ? le.cpuTaktMs.p99 : NaN;
    // S6: der KI-Takt (Sense-Phase „creatures", EWMA am Ende des Laufs) und die Tiere der Welt (tierZahl der Werkbank, kurz.laufVoll)
    z.kiEwma = le.phasenEwmaMs ? le.phasenEwmaMs.creatures : NaN;
    const ti = (j.kurz && j.kurz.laufVoll && j.kurz.laufVoll.tiere) || null;
    z.tiere = ti ? ti.gesamt : NaN;
    z.tiereSicht = ti ? ti.sicht : NaN;
    z.tierArten = ti ? Object.entries(ti.arten || {}).map(([a, n]) => a + " " + n).join(", ") : "–";
    // nvidia-smi je Boot (1 Hz, ganzer Boot): Takt, Temperatur, Anteil der Proben mit Drossel-Grund
    try {
        const smi = fs.readFileSync(path.join(DIR, n.replace(".json", "-smi.csv")), "utf8").split(String.fromCharCode(10)).map((l) => l.trim()).filter(Boolean).map((l) => l.split(",").map((x) => x.trim()));
        const mhz = smi.map((r) => parseFloat(r[1])).filter(Number.isFinite);
        z.smiMHz = mittel(mhz);
        z.smiTemp = mittel(smi.map((r) => parseFloat(r[3])));
        z.smiDrossel = (100 * smi.filter((r) => r[6] && !/^0x0+$/.test(r[6])).length) / Math.max(1, smi.length);
    } catch (_e) {
        z.smiMHz = z.smiTemp = z.smiDrossel = NaN;
    }
    gb.forEach(([gier, b], i) => {
        z["bank" + i] = b && b.gpuJeFrameMs;
        z["takt" + i] = b && b.takt ? b.takt.mhz : NaN;
        z["gier" + i] = (+gier).toFixed(2);
    });
    zeilen.push(z);
}
zeilen.sort((a, b) => String(a.start).localeCompare(String(b.start)));
const K = [
    ["fps (Regler voll)", "fps", f1, -1],
    ["Frame p50 ms", "frameP50", f1, 1],
    ["Frame p95 ms", "frameP95", f1, 1],
    ["CPU-Takt p95 voll ms", "cpuP95", f1, 1],
    ["CPU-Takt p95 frei ms", "cpuP95frei", f1, 1],
    ["gpu-bank ms (Gier " + (zeilen[0] ? zeilen[0].gier0 : "?") + ")", "bank0", f2, 1],
    ["Takt MHz (Bank 1)", "takt0", f1, 0],
    ["gpu-bank ms (Gier " + (zeilen[0] && zeilen[0].gier1 ? zeilen[0].gier1 : "–") + ")", "bank1", f2, 1],
    ["Band GPU ms je Frame", "band", f2, 1],
    ["GPU-Durchsatz p50 ms (lauf voll)", "durchsatz", f2, 1],
    ["GPU Pässe Summe p50 ms (lauf voll)", "gpuMs", f2, 1],
    ...[...PASSE].sort().map((pn) => ["Pass " + pn + " rein ms (lauf voll)", "pass:" + pn, f2, 1]),
    ["k0 p50 ms (Zustand)", "k0p50", f2, 0],
    ["k0 Anteil oben", "k0anteilOben", f2, 0],
    ["CPU-Takt p50 voll ms", "cpuP50", f2, 1],
    ["CPU-Takt p99 voll ms", "cpuP99", f1, 1],
    ["KI-Takt EWMA ms (creatures, lauf voll)", "kiEwma", f2, 1],
    ["Tiere gesamt", "tiere", fi, 0],
    ["Tiere im Sichtkegel", "tiereSicht", fi, 0],
    ["Befehle (Band)", "befehle", fi, 0],
    ["Dreiecke (Band)", "dreiecke", fi, 0],
    ["VRAM MB (Band)", "vram", f1, 0],
    ["VRAM MB (lauf voll)", "vramLauf", f1, 0],
    ["Atlas MB gesamt", "atlas", f2, 0],
    ["Atlas albedo MB", "atlasAlbedo", f2, 0],
    ["Atlas normal MB", "atlasNormal", f2, 0],
    ["Atlas licht MB", "atlasLicht", f2, 0],
    ["Takt MHz (nvidia-smi, Boot)", "smiMHz", f1, 0],
    ["Drossel-Anteil % (Boot)", "smiDrossel", f1, 0],
    ["Temperatur °C (Boot)", "smiTemp", f1, 0],
];
let out = `## ${KOMBI} — je Boot (Zeitfolge)\n\n| Boot | Urteil | ${K.map((k) => k[0]).join(" | ")} |\n|${"---|".repeat(K.length + 2)}\n`;
for (const z of zeilen) out += `| ${z.boot} | ${z.urteil} | ${K.map(([, k, fmt]) => fmt(z[k])).join(" | ")} |\n`;
out += `\n## Tiere je Boot (kurz.laufVoll.tiere)\n\n${zeilen.map((z) => `- ${z.boot}: ${fi(z.tiere)} (Sicht ${fi(z.tiereSicht)}; ${z.tierArten})`).join("\n")}\n`;
// S6: CPU-Takt p95 und p99 (lauf voll) je Seite mit Spannweite und Median, gegen das Soll 5,8 ms (PFLICHT-OFFEN E)
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN;
};
out += `\n## CPU-Takt lauf voll je Seite (Soll E: p95 ≤ 5,8 ms)\n\n| Größe | Seite | n | Mittel | Median | Spannweite | Boots ≤ 5,8 |\n|---|---|---|---|---|---|---|\n`;
const spanne = {};
for (const [titel, k] of [["p95", "cpuP95"], ["p99", "cpuP99"], ["p50", "cpuP50"]]) {
    for (const S of ["A", "B"]) {
        const v = zeilen.filter((z) => z.seite === S).map((z) => z[k]).filter(Number.isFinite);
        const lo = Math.min(...v),
            hi = Math.max(...v);
        spanne[titel + S] = { n: v.length, mittel: mittel(v), median: med(v), min: lo, max: hi, unterSoll: v.filter((x) => x <= 5.8 + 1e-9).length };
        out += `| CPU-Takt ${titel} | ${S} | ${v.length} | ${f2(mittel(v))} | ${f2(med(v))} | ${f1(lo)}–${f1(hi)} | ${titel === "p95" ? v.filter((x) => x <= 5.8 + 1e-9).length + " von " + v.length : "–"} |\n`;
    }
}
// Welch-t je Größe (Δ B − A über den Standardfehler aus beiden Seiten) — ein Maß, wie weit Δ über dem Rauschen liegt
out += `\n| Größe | Δ B − A | Standardfehler | t (Welch) |\n|---|---|---|---|\n`;
for (const [titel, k] of [["p95", "cpuP95"], ["p99", "cpuP99"], ["p50", "cpuP50"], ["KI-EWMA", "kiEwma"]]) {
    const va = zeilen.filter((z) => z.seite === "A").map((z) => z[k]).filter(Number.isFinite);
    const vb = zeilen.filter((z) => z.seite === "B").map((z) => z[k]).filter(Number.isFinite);
    const s2 = (v) => {
        const m = mittel(v);
        return v.reduce((a, x) => a + (x - m) * (x - m), 0) / Math.max(1, v.length - 1);
    };
    const d = mittel(vb) - mittel(va);
    const se = Math.sqrt(s2(va) / va.length + s2(vb) / vb.length);
    spanne["t-" + titel] = { d, se, t: se > 0 ? d / se : NaN };
    out += `| ${titel === "KI-EWMA" ? "KI-Takt EWMA" : "CPU-Takt " + titel} | ${(d > 0 ? "+" : "") + f2(d)} | ${f2(se)} | ${se > 0 ? (d / se).toFixed(2) : "–"} |\n`;
}
out += `\n## Mittel je Seite (Werte je Boot)\n\n| Größe | A 47c8b089 (main) | B e93134f4 (integ-probe + F1) | Δ B − A | 2σ | Urteil |\n|---|---|---|---|---|---|\n`;
const urteile = [];
const KERN = new Set(["frameP95", "cpuP95", "durchsatz", "bank0", "bank1"]);
for (const [titel, k, fmt, richtung] of K) {
    const w = (s) => zeilen.filter((z) => z.seite === s).map((z) => z[k]);
    const ma = mittel(w("A")),
        mb = mittel(w("B"));
    if (!Number.isFinite(ma) && !Number.isFinite(mb)) continue;
    const d = mb - ma;
    const abw = [];
    for (const S of ["A", "B"]) {
        const v = w(S).filter(Number.isFinite);
        const m = mittel(v);
        for (const x of v) abw.push(x - m);
    }
    const sig = abw.length > 2 ? Math.sqrt(abw.reduce((a, b) => a + b * b, 0) / (abw.length - 2)) : NaN;
    let u = "–";
    if (richtung !== 0 && Number.isFinite(d) && Number.isFinite(sig)) {
        const schlechter = richtung > 0 ? d : -d;
        const aufl = fmt === f2 ? 0.01 : fmt === f1 ? 0.1 : 1;
        u = schlechter <= Math.max(2 * sig, aufl) + 1e-9 ? "nicht langsamer" : "LANGSAMER";
        urteile.push({ titel, u, d, sig, kern: KERN.has(k) });
    }
    out += `| ${titel} | ${fmt(ma)} (${w("A").map(fmt).join(" · ")}) | ${fmt(mb)} (${w("B").map(fmt).join(" · ")}) | ${Number.isFinite(d) ? (d > 0 ? "+" : "") + fmt(d) : "–"} | ${fmt(2 * sig)} | ${u} |\n`;
}
const kernU = urteile.filter((x) => x.kern);
const langsam = kernU.filter((x) => x.u !== "nicht langsamer");
out += `
**KERN-URTEIL ${KOMBI}** (Frame p95 · CPU-Takt p95 voll · GPU-Durchsatz p50 · gpu-bank je Gier; Δ ≤ max(2σ gepoolt, Auflösung)): ${langsam.length ? "LANGSAMER an " + langsam.map((x) => x.titel).join(", ") : "nicht langsamer"} (${kernU.length} Größen)
`;
fs.writeFileSync(path.join(DIR, `auswertung-${KOMBI}.md`), out);
fs.writeFileSync(path.join(DIR, `auswertung-${KOMBI}.json`), JSON.stringify({ zeilen, urteile, spanne }, null, 1));
console.log(out);

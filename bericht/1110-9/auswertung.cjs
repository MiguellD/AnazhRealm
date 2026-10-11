// Auswertung 1110-9: E (frozen-a1) am Stand integ-probe da90ee92 auf der GTX 1060 — je Boot und Ort Frame p95 und CPU-Takt
// p95 unter Regler voll (lauf-voll, mit Takt), Befehle, Dreiecke und VRAM (band, eingeschwungen), dazu die Täter: die Klassen
// über ihrem Soll bzw. mit dem größten Anteil, der VRAM je Erzeuger. Mediane je Ort; Tabelle Kriterium × Ort × Wert × Soll ×
// Abstand × Täter.
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const SOLL = { frameP95: 33, befehle: 208, dreiecke: 680000, vramMB: 118, cpuP95: 5.8 };
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const f1 = (v) => (Number.isFinite(v) ? v.toFixed(1) : "–");
const boots = fs
    .readdirSync(DIR)
    .filter((n) => /^[wgd]\d+\.json$/.test(n))
    .sort();
const zeilen = [];
for (const n of boots) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const ort = { w: "wiese", g: "genesis", d: "dorf" }[n[0]];
    const lv = j.kurz && j.kurz.laufVoll;
    const st = (j.schritte || []).find((s) => s.name === "band");
    const m = st && st.ergebnis && st.ergebnis.messung;
    const z = { boot: n.replace(".json", ""), ort, urteil: j.urteil };
    if (lv && lv.frameMs) {
        z.frameP95 = lv.frameMs.p95;
        z.cpuP95 = lv.cpuTaktMs ? lv.cpuTaktMs.p95 : NaN;
        z.laufBefehleMax = lv.befehle ? lv.befehle.max : NaN;
        z.laufDreieckeMax = lv.dreiecke ? lv.dreiecke.max : NaN;
        z.taktMHz = lv.takt ? lv.takt.mhz : NaN;
        z.tiere = lv.tiere ? lv.tiere.gesamt : null;
    }
    if (m) {
        z.befehle = m.summe ? m.summe.befehle : NaN;
        z.dreiecke = m.summe ? m.summe.dreiecke : NaN;
        z.je = m.summe ? m.summe.je : null;
        z.vramMB = m.vram ? m.vram.mb : NaN;
        z.vramErzeuger = m.vram ? (m.vram.erzeuger || []).slice(0, 8).map((e) => [e.erzeuger, e.mb]) : [];
        z.klassen = (m.klassen || [])
            .map((k) => ({
                id: k.id,
                befehle: k.ist ? k.ist.befehle : 0,
                dreiecke: k.ist ? k.ist.dreiecke : 0,
                sollB: k.soll ? k.soll.befehle : null,
                sollD: k.soll ? k.soll.dreiecke : null,
                taeter: (k.taeter || []).slice(0, 3).map((t) => `${t.klasse} ${t.befehle}`),
            }))
            .sort((a, b) => b.dreiecke - a.dreiecke);
        z.rot = (m.rot || []).map((r) => r.text);
    }
    zeilen.push(z);
}
let out = "## Je Boot\n\n| Boot | Ort | Urteil | Frame p95 | CPU-Takt p95 | Takt MHz | Befehle | Dreiecke | VRAM MB | Tiere |\n|---|---|---|---|---|---|---|---|---|---|\n";
for (const z of zeilen)
    out += `| ${z.boot} | ${z.ort} | ${z.urteil} | ${f1(z.frameP95)} | ${f1(z.cpuP95)} | ${f1(z.taktMHz)} | ${z.befehle ?? "–"} | ${z.dreiecke ?? "–"} | ${f1(z.vramMB)} | ${z.tiere ?? "–"} |\n`;
const orte = ["wiese", "genesis", "dorf"];
const medi = {};
for (const o of orte) {
    const zz = zeilen.filter((z) => z.ort === o);
    medi[o] = {};
    for (const k of ["frameP95", "cpuP95", "befehle", "dreiecke", "vramMB", "taktMHz"]) medi[o][k] = med(zz.map((z) => z[k]));
}
out += "\n## E: Kriterium × Ort (Median der Boots)\n\n| Kriterium | Soll | Wiese | Genesis | Dorf |\n|---|---|---|---|---|\n";
const kr = [
    ["Frame p95 ms (Regler voll)", "frameP95"],
    ["CPU-Takt p95 ms", "cpuP95"],
    ["Befehle", "befehle"],
    ["Dreiecke", "dreiecke"],
    ["VRAM MB", "vramMB"],
];
for (const [titel, k] of kr) {
    const s = SOLL[k];
    const zelle = (o) => {
        const v = medi[o][k];
        if (!Number.isFinite(v)) return "–";
        const d = v - s;
        return `${k === "dreiecke" ? Math.round(v) : f1(v)} (${d > 0 ? "+" : ""}${k === "dreiecke" ? Math.round(d) : d.toFixed(1)}${d > 0 ? " ÜBER" : ""})`;
    };
    out += `| ${titel} | ${k === "dreiecke" ? s : s} | ${zelle("wiese")} | ${zelle("genesis")} | ${zelle("dorf")} |\n`;
}
out += "\n## Täter je Ort (Boot mit dem höchsten VRAM)\n";
for (const o of orte) {
    const zz = zeilen.filter((z) => z.ort === o && z.vramErzeuger);
    if (!zz.length) continue;
    const z = zz.sort((a, b) => b.vramMB - a.vramMB)[0];
    out += `\n### ${o} (${z.boot})\n\nVRAM je Erzeuger: ${z.vramErzeuger.map(([e, mb]) => `${e} ${mb}`).join(" · ")}\n\n`;
    out += "| Klasse | Befehle (Soll) | Dreiecke (Soll) | Täter |\n|---|---|---|---|\n";
    for (const k of z.klassen.slice(0, 8)) out += `| ${k.id} | ${k.befehle} (${k.sollB ?? "–"}) | ${k.dreiecke} (${k.sollD ?? "–"}) | ${k.taeter.join(" · ")} |\n`;
    if (z.rot && z.rot.length) out += `\nROT des Bands: ${z.rot.slice(0, 5).join(" · ")}\n`;
}
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);
fs.writeFileSync(path.join(DIR, "auswertung.json"), JSON.stringify({ zeilen, mediane: medi, soll: SOLL }, null, 1));
console.log(out);

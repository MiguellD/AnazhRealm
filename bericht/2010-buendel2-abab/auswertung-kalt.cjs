// 2010 Bündel-2-ABAB: Auswertung KALT (diag-boot-stage --kalt --echt mit Stations-Patch kalt-patch.cjs: je Probe 200 ms die Term-Namen
// der Lücken `terme` und die Brunnen `brunnen` = [Zahl brunnen_dorf, davon mit _servedLod != null]). Je Lauf: t(Weltbild) (weltbildDa,
// ms ab Navigation) · t(Leib) / t(Boden) / t(licht) = erste Probe, in der der Term nicht mehr fehlt · der letzte offene Term (die Terme
// der letzten Probe vor dem Bild) · Erst-Bau beim Bild (Bauten · ms Haupt-Thread · offene Pipelines) · Brunnen beim ersten Bild.
// Urteil nach Auftrag: B hält, wenn Median B − A ≤ +0,1 s ODER das Mehr allein an Läufen mit Brunnen hängt.
//   node auswertung-kalt.cjs <kalt-ordner>  → <ordner>/auswertung-kalt.md
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const s2 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const laeufe = fs
    .readdirSync(D)
    .filter((f) => /^[AB]\d\.json$/.test(f))
    .sort((a, b) => a[1] - b[1] || a.localeCompare(b));
const rows = [];
for (const f of laeufe) {
    const j = JSON.parse(fs.readFileSync(path.join(D, f), "utf8"));
    const WB = j.weltbildDa;
    const P = (j.proben || []).filter((p) => Array.isArray(p.terme));
    const vor = P.filter((p) => Number.isFinite(WB) && p.t <= WB);
    const weg = (term) => {
        // die erste Probe, ab der der Term nie mehr fehlt (vor dem Bild); fehlte er nie, die erste Probe mit Termen
        let last = -1;
        vor.forEach((p, i) => p.terme.includes(term) && (last = i));
        if (last < 0) return vor.length ? { t: vor[0].t, nie: true } : { t: NaN };
        const n = vor[last + 1];
        return { t: n ? n.t : WB };
    };
    const letzte = vor.length ? vor[vor.length - 1].terme : null;
    const nach = (j.proben || []).find((p) => p.da > 0 || (Number.isFinite(WB) && p.t >= WB));
    const lichtJe = vor.some((p) => p.terme.includes("licht"));
    const erst = nach && nach.erst ? nach.erst : vor.length ? vor[vor.length - 1].erst : null;
    rows.push({
        lauf: f.replace(".json", ""),
        seite: f[0],
        wb: WB,
        leib: weg("leib").t,
        boden: weg("boden").t,
        licht: lichtJe ? weg("licht").t : NaN,
        lichtJe,
        letzte: letzte ? letzte.join("+") || "(keiner)" : "–",
        brunnen: nach && nach.brunnen ? nach.brunnen : null,
        erst,
        version: j.version,
        adapter: j.adapter,
        ohne: (j.ohne || []).length,
    });
}
const o = [];
o.push("## Kalt je Lauf (`diag-boot-stage --kalt --echt`, Roh kalt/<A|B><n>.{json,log,png,-smi.csv})\n");
o.push("| Lauf | Version | t(Weltbild) s | t(Leib) | t(Boden) | t(licht) | letzter offener Term | Brunnen beim Bild (gebaut/alle) | Erst-Bau beim Bild (Bauten · ms · Pipelines) | halbes Weltbild |");
o.push("|---|---|---|---|---|---|---|---|---|---|");
for (const r of rows)
    o.push(`| ${r.lauf} | ${r.version} | ${s2(r.wb)} | ${s2(r.leib)} | ${s2(r.boden)} | ${r.lichtJe ? s2(r.licht) : "nie offen"} | ${r.letzte} | ${r.brunnen ? r.brunnen[1] + "/" + r.brunnen[0] : "–"} | ${r.erst ? r.erst.join(" · ") : "–"} | ${r.ohne} |`);
const seite = (s, k) => rows.filter((r) => r.seite === s).map((r) => r[k]);
o.push("\n| Größe (Median, Spanne) | A dc6702ab | B 8ba1510d | Δ B − A |\n|---|---|---|---|");
for (const [k, t] of [["wb", "t(Weltbild) s"], ["leib", "t(Leib) s"], ["boden", "t(Boden) s"]]) {
    const a = seite("A", k),
        b = seite("B", k);
    const sp = (x) => `${s2(Math.min(...x.filter(Number.isFinite)))}–${s2(Math.max(...x.filter(Number.isFinite)))}`;
    o.push(`| ${t} | ${s2(med(a))} (${sp(a)}) | ${s2(med(b))} (${sp(b)}) | ${Number.isFinite(med(b) - med(a)) ? ((med(b) - med(a)) / 1000 >= 0 ? "+" : "") + ((med(b) - med(a)) / 1000).toFixed(2) : "–"} |`);
}
const dWb = (med(seite("B", "wb")) - med(seite("A", "wb"))) / 1000;
const mitBrunnen = rows.filter((r) => r.brunnen && r.brunnen[1] > 0);
const ohneB = (s) => rows.filter((r) => r.seite === s && !(r.brunnen && r.brunnen[1] > 0)).map((r) => r.wb);
const dOhne = (med(ohneB("B")) - med(ohneB("A"))) / 1000;
o.push(`\n**Urteil KALT:** Median B − A = ${dWb >= 0 ? "+" : ""}${dWb.toFixed(2)} s → ${dWb <= 0.1 ? "B hält (≤ +0,1 s)" : `über +0,1 s; ohne Läufe mit gebautem Brunnen: ${Number.isFinite(dOhne) ? (dOhne >= 0 ? "+" : "") + dOhne.toFixed(2) + " s" : "–"} → ${Number.isFinite(dOhne) && dOhne <= 0.1 ? "das Mehr hängt an den Brunnen-Läufen, B hält" : "B hält NICHT"}`}.`);
o.push(`Läufe mit gebautem Brunnen beim ersten Bild: ${mitBrunnen.map((r) => r.lauf).join(", ") || "keiner"}. Wartet B auf „licht“: ${rows.filter((r) => r.seite === "B" && r.lichtJe).map((r) => `${r.lauf} bis ${s2(r.licht)} s${r.letzte.includes("licht") ? " (letzter Term)" : ""}`).join(", ") || "nie offen"}.`);
fs.writeFileSync(path.join(D, "auswertung-kalt.md"), o.join("\n") + "\n");
console.log(o.join("\n"));

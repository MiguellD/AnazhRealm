// auswertung.cjs — B2 (aus G2/FZ): je Boot der Kalt-Zeile (diag-boot-stage --kalt) die Weltbild-Zeit, die Haupt-Thread-Kosten je Art (Summe ms),
// der Erst-Bau (Pipelines, ms), die blockierte Zeit und wann jeder Grund zuletzt fehlte (s). Seiten A/B (GTX) und sA/sB (swiftshader).
//   node auswertung.cjs [ordner]
"use strict";
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2] || __dirname;
const GRUENDE = [
    ["Bauten", /Bäume und Bauten wachsen/],
    ["Pflanzen", /Bäume werden gepflanzt|Wald-Böden werden bepflanzt/],
    ["Wald-Gestalt", /Wald-Stücke warten/],
    ["ferne Bäume", /ferne Bäume werden gemalt/],
    ["Dorf geplant", /Dorf wird (geplant|gegründet)/],
    ["Dorf-Häuser", /Häuser des Dorfs/],
    ["Horizont", /Horizont wächst/],
    ["Boden", /Boden wächst/],
];
const mittel = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
const zeilen = [];
for (const n of fs.readdirSync(DIR).filter((x) => /^[sq]?[AB][0-9]+\.json$/.test(x)).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, n), "utf8"));
    const seite = n.replace(/[0-9]+\.json$/, "");
    const p = j.proben || [];
    const z = { boot: n.replace(".json", ""), seite, adapter: j.adapter, welt: j.weltbildDa ? j.weltbildDa / 1000 : NaN };
    for (const [k, v] of Object.entries(j.kosten || {})) z["k:" + k] = Object.values(v).reduce((a, b) => a + b, 0) / 1000;
    const erst = p.filter((x) => x.erst).pop();
    z.erstN = erst ? erst.erst[0] : NaN;
    z.erstS = erst ? erst.erst[1] / 1000 : NaN;
    z.blockiert = (j.lang || []).reduce((a, [, d]) => a + d, 0) / 1000;
    for (const [name, re] of GRUENDE) {
        const t = p.filter((x) => (!j.weltbildDa || x.t <= j.weltbildDa) && (x.fehlt || []).some((f) => re.test(f))).map((x) => x.t);
        z["g:" + name] = t.length ? Math.max(...t) / 1000 : 0;
    }
    const ev = (j.ev || []).find((e) => e[1] === "_foundryRequestSettlement an");
    z.settlement = ev ? ev[0] / 1000 : NaN;
    z.buch = j.buchDa ? j.buchDa / 1000 : NaN;
    zeilen.push(z);
}
const spalten = ["welt", "blockiert", "erstN", "erstS", ...[...new Set(zeilen.flatMap((z) => Object.keys(z).filter((k) => k.startsWith("k:"))))], "settlement", "buch", ...GRUENDE.map(([n]) => "g:" + n)];
const f = (v) => (typeof v === "number" ? (Number.isFinite(v) ? (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)) : "–") : String(v));
let out = `| Boot | ${spalten.join(" | ")} |\n|---|${"---|".repeat(spalten.length)}\n`;
for (const z of zeilen) out += `| ${z.boot} | ${spalten.map((k) => f(z[k])).join(" | ")} |\n`;
out += `\n| Mittel | ${spalten.join(" | ")} |\n|---|${"---|".repeat(spalten.length)}\n`;
for (const s of [...new Set(zeilen.map((z) => z.seite))]) {
    const w = zeilen.filter((z) => z.seite === s);
    out += `| ${s} (${w.length}) | ${spalten.map((k) => f(mittel(w.map((z) => z[k]).filter(Number.isFinite)))).join(" | ")} |\n`;
}
console.log("Spalten: welt = t(Weltbild) s · blockiert = Haupt-Thread > 50 ms (s) · erstN/erstS = Erst-Bau Pipelines / s · k:<Art> = Kosten s · g:<Grund> = zuletzt offen bei s\n");
console.log(out);
fs.writeFileSync(path.join(DIR, "auswertung.md"), out);

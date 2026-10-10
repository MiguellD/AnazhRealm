// 0910-6: das Band je Klasse (Befehle · Dreiecke) und der VRAM je Erzeuger — Wiese: Median je Seite über 4 Boots;
// Genesis: je Seite der eigene Boot (GESTELLT)
const fs = require("fs");
const path = require("path");
const DIR = process.argv[2];
const messung = (datei) => {
    const j = JSON.parse(fs.readFileSync(path.join(DIR, datei + ".json"), "utf8"));
    const s = j.schritte.find((x) => x.name === "band");
    return s.ergebnis.messung;
};
const med = (a) => {
    const b = a.filter((x) => Number.isFinite(x)).sort((x, y) => x - y);
    if (!b.length) return null;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const seite = (namen) => {
    const ms = namen.map(messung);
    const kl = {},
        vr = {};
    const ids = new Set(ms.flatMap((m) => m.klassen.map((k) => k.id)));
    for (const id of ids) {
        const je = ms.map((m) => m.klassen.find((k) => k.id === id));
        kl[id] = {
            befehle: med(je.map((k) => (k ? k.ist.befehle : 0))),
            dreieckeK: med(je.map((k) => (k ? k.ist.dreiecke / 1000 : 0))),
        };
    }
    const erz = new Set(ms.flatMap((m) => m.vram.erzeuger.map((e) => e.erzeuger)));
    for (const e of erz) vr[e] = med(ms.map((m) => (m.vram.erzeuger.find((x) => x.erzeuger === e) || { mb: 0 }).mb));
    return { kl, vr, mb: med(ms.map((m) => m.vram.mb)) };
};
const r = (x, d = 0) => (x == null ? "–" : (+x).toFixed(d));
const tafel = (titel, A, B) => {
    const L = [`### ${titel}`, "", "| Klasse | Befehle A → B | Dreiecke A → B (k) |", "|---|---|---|"];
    for (const k of new Set([...Object.keys(A.kl), ...Object.keys(B.kl)])) {
        const a = A.kl[k] || {},
            b = B.kl[k] || {};
        L.push(`| ${k} | ${r(a.befehle)} → ${r(b.befehle)} | ${r(a.dreieckeK)} → ${r(b.dreieckeK)} |`);
    }
    L.push("", `VRAM gesamt ${r(A.mb, 1)} → ${r(B.mb, 1)} MB; je Erzeuger (nur, was sich um ≥ 0,1 MB ändert):`, "", "| Erzeuger | A → B (MB) |", "|---|---|");
    for (const e of new Set([...Object.keys(A.vr), ...Object.keys(B.vr)])) {
        const a = A.vr[e] || 0,
            b = B.vr[e] || 0;
        if (Math.abs(a - b) >= 0.1) L.push(`| ${e} | ${r(a, 1)} → ${r(b, 1)} |`);
    }
    return L.join("\n");
};
const wiese = tafel("Wiese (Median je Seite, 4 Boots)", seite(["1A", "3A", "5A", "7A"]), seite(["2B", "4B", "6B", "8B"]));
const genesis = tafel("Genesis (je Seite der eigene Boot, GESTELLT)", seite(["genesis-A"]), seite(["genesis-B"]));
fs.writeFileSync(path.join(DIR, "band-klassen.md"), wiese + "\n\n" + genesis + "\n");
console.log(wiese + "\n\n" + genesis);

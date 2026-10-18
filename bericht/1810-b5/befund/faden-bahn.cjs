// 1810 B5 Finder: je Studio-Faden (w0 = Werk „buch", w1/w2 = Helfer) bis zum Weltbild aus den Faden-Stempeln (faden-patch):
// Studio-Bau Σ, Platten-Antworten, erste/letzte Antwort, und die längsten Bauten beim Namen.   node faden-bahn.cjs <roh> <lauf> …
"use strict";
const fs = require("fs");
const path = require("path");
const [D, ...laeufe] = process.argv.slice(2);
for (const N of laeufe) {
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    const LF = j.lf, WB = j.weltbildDa;
    const an = new Map(LF.an.map((a) => [a[1], a]));
    const zeilen = LF.s.map((s) => {
        const q = LF.q[s[0]] || [];
        const a = an.get(s[2]);
        const b = (/w(\d+)_/.exec(s[2]) || [0, "0"])[1];
        return { bahn: "w" + b, k: String(q[1] || "?").split("#")[1], ts: s[1], a, f: a && Array.isArray(a[7]) ? a[7] : null };
    });
    const out = [];
    for (const b of ["w0", "w1", "w2"]) {
        const r = zeilen.filter((x) => x.bahn === b && x.f && x.f[2] <= WB);
        const bau = r.filter((x) => x.f[1]).map((x) => ({ k: x.k, ms: x.f[2] - x.f[1], st: x.f[1] }));
        const sum = bau.reduce((s, x) => s + x.ms, 0);
        const lang = bau.sort((x, y) => y.ms - x.ms).slice(0, 4).map((x) => `${String(x.k).replace(/ov:[^|]+/, "ov")} ${x.ms} ms @${(x.st / 1000).toFixed(1)}`);
        const platte = r.filter((x) => !x.f[1]).length;
        out.push(`${b}: ${r.length} Antworten bis Bild (${platte} ohne Studio-Bau) · Studio-Bau Σ ${sum} ms · längste: ${lang.join(", ")}`);
    }
    console.log(`${N} (Weltbild ${(WB / 1000).toFixed(2)} s, Buch ${(j.buchDa / 1000).toFixed(2)}, Atlas ${(LF.atlas / 1000).toFixed(2)})\n  ` + out.join("\n  "));
}

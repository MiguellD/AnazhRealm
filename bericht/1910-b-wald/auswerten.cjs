// 1910 B-Wald (OMEN, Schneider): die Kalt-ABAB-Tafel — je Lauf t(Weltbild), t(Leib) (erstes applyPlayerSoul), die Wald-Schlange
// (erste und letzte leere Schlange vor dem Bild, letzte Faden-Antwort, Σ Rechnen, Σ fertig→an), die Zusagen der Streu-Wecker
// (die letzte waldplan-Zusage, die letzte Zusage überhaupt mit Namen) und der letzte Term vor dem Bild; dazu Median und
// Spannweite je Seite.        node auswerten.cjs > tafel.txt
"use strict";
const fs = require("fs");
const path = require("path");
const ROH = path.join(__dirname, "roh");
const s1 = (ms) => (Number.isFinite(ms) ? (ms / 1000).toFixed(2) : "–");
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    if (!b.length) return NaN;
    const m = b.length >> 1;
    return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2;
};
const laeufe = fs
    .readdirSync(ROH)
    .filter((f) => /^[AB][1-9]\.json$/.test(f))
    .sort((a, b) => a[1] - b[1] || a.localeCompare(b));
const zeilen = [];
const seite = { A: [], B: [] };
for (const f of laeufe) {
    const j = JSON.parse(fs.readFileSync(path.join(ROH, f), "utf8"));
    const WB = j.weltbildDa;
    const KT = j.kt || {};
    const res = KT.res || {};
    const leib = j.lf && j.lf.seele && j.lf.seele.length ? j.lf.seele[0][0] : NaN;
    const leer = (KT.wpLeer || []).map((x) => x[0]).filter((t) => t <= WB);
    const an = new Map((KT.waldAn || []).map((x) => [x[1], x]));
    let rechnet = 0;
    let wartet = 0;
    let letzt = NaN;
    let zellen = 0;
    for (const w of KT.wald || []) {
        zellen += w[2];
        const a = an.get(w[1]);
        if (!a) continue;
        letzt = Number.isFinite(letzt) ? Math.max(letzt, a[0]) : a[0];
        if (a[2]) {
            rechnet += a[2][1] - a[2][0];
            wartet += a[0] - a[2][1];
        }
    }
    // die Zusagen der Wecker der Regionen (vor dem Bild gespannt): die letzte waldplan-Zusage und die letzte überhaupt
    let wpLetzt = NaN;
    let letzte = ["", -Infinity];
    for (const [t, , labs] of KT.wk || []) {
        if (t > WB) continue;
        for (const l of labs) {
            const r = res[l];
            if (!Number.isFinite(r) || r > WB) continue;
            if (l.startsWith("waldplan#")) wpLetzt = Number.isFinite(wpLetzt) ? Math.max(wpLetzt, r) : r;
            if (r > letzte[1]) letzte = [l, r];
        }
    }
    // der letzte Term vor dem Bild (die letzte Probe, die ihn nennt)
    const term = {};
    for (const x of (j.proben || []).filter((p) => Array.isArray(p.lk) && p.t <= WB))
        for (const l of x.lk) term[l.split(":")[0]] = x.t;
    const T = Object.entries(term).sort((a, b) => b[1] - a[1]);
    const z = {
        lauf: f.replace(".json", ""),
        wb: WB,
        leib,
        leer0: leer.length ? leer[0] : NaN,
        leerN: leer.length ? leer[leer.length - 1] : NaN,
        letzt,
        rechnet,
        wartet,
        auftraege: (KT.wald || []).length,
        zellen,
        wpLetzt,
        letzte,
        terme: T.slice(0, 3).map(([k, t]) => `${k} ${s1(t)}`).join(" · "),
    };
    seite[f[0]].push(z);
    zeilen.push(
        `${z.lauf}  Weltbild ${s1(z.wb)}  Leib ${s1(z.leib)}  Schlange leer ${s1(z.leer0)} (zuletzt ${s1(z.leerN)})  ` +
            `Faden: ${z.auftraege} Aufträge/${z.zellen} Zellen, rechnet ${s1(z.rechnet)}, fertig→an Σ ${s1(z.wartet)}, letzte Antwort ${s1(z.letzt)}  ` +
            `letzte waldplan-Zusage ${s1(z.wpLetzt)}  letzte Zusage ${z.letzte[0]} ${s1(z.letzte[1])}  letzte Terme ${z.terme}`
    );
}
console.log("# 1910 B-Wald — Kalt-ABAB (GTX 1060, diag-boot-stage --kalt --echt, Instrument p3/n1910/kette byte-gleich)\n");
console.log(zeilen.join("\n"));
console.log("");
for (const k of ["A", "B"]) {
    const L = seite[k];
    if (!L.length) continue;
    const sp = (fn) => {
        const a = L.map(fn).filter(Number.isFinite);
        return `${s1(med(a))} (${s1(Math.min(...a))}–${s1(Math.max(...a))})`;
    };
    console.log(
        `${k} (${L.length}): Weltbild ${sp((z) => z.wb)} · Leib ${sp((z) => z.leib)} · Schlange leer ${sp((z) => z.leer0)} · ` +
            `letzte Faden-Antwort ${sp((z) => z.letzt)} · fertig→an Σ ${sp((z) => z.wartet)} · letzte waldplan-Zusage ${sp((z) => z.wpLetzt)}`
    );
}

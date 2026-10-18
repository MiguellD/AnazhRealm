// 1810 B5 Finder: die Ketten je Lauf (Leib · Dorf · Streu ohne Rang · Karten · Fäden) aus roh/<lauf>.json → zahlen.md
//   node zahlen-b5.cjs <roh>
"use strict";
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
const GRUPPEN = {
    kalt: ["K0", "K1", "K2", "K3", "P1a", "P2a", "P3a", "P4a", "B1", "B2", "B3"],
    zweit: ["P2b", "P3b", "P4b"],
    stufe: ["P2c", "P3c", "P4c"],
    ohneOrt: ["D1", "D2", "D3"],
    ohneStartDorf: ["E1", "E2", "E3"],
};
const s = (x) => (x == null || !Number.isFinite(x) ? "–" : (x / 1000).toFixed(2));
const med = (a) => {
    const b = a.filter(Number.isFinite).sort((x, y) => x - y);
    return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN;
};
const spann = (a) => {
    const b = a.filter(Number.isFinite);
    return b.length ? `${s(med(b))} (${s(Math.min(...b))}–${s(Math.max(...b))})` : "–";
};
const zeilen = {};
const out = [];
function lauf(N) {
    const j = JSON.parse(fs.readFileSync(path.join(D, N + ".json"), "utf8"));
    const LF = j.lf, WB = j.weltbildDa;
    const an = new Map(LF.an.map((a) => [a[1], a]));
    const send = new Map(LF.s.map((x) => [x[0], x]));
    const rows = LF.q.map((q, i) => {
        const x = send.get(i);
        const a = x && an.get(x[2]);
        return { tq: q[0], key: String(q[1]), d: q[2], blick: q[3], ts: x ? x[1] : null, req: x ? x[2] : null, tan: a ? a[0] : null, f: a && Array.isArray(a[7]) ? a[7] : null, platte: a ? a[3] : null };
    });
    // die Lücken: Ende = erste Probe ohne den Term nach seiner letzten
    const pr = (j.proben || []).filter((p) => Array.isArray(p.lk));
    const ende = (t) => {
        let letzte = null;
        for (const p of pr) if (p.t <= WB && p.lk.some((l) => l.startsWith(t + ":"))) letzte = p.t;
        if (letzte == null) return null;
        const n = pr.find((p) => p.t > letzte);
        return n ? Math.min(n.t, WB) : WB;
    };
    const L0 = rows.find((r) => /#mensch\|0\|0\|/.test(r.key));
    const L1 = rows.find((r) => /#mensch\|0\|1\|/.test(r.key));
    const ex = rows.find((r) => /^export-settlement/.test(r.key));
    const haus = rows.filter((r) => /#(schwarzwald|alpenchalet|skandinavisch|gotisch|alemannisch)\|/.test(r.key) && r.tq < WB);
    const rangfrei = rows.filter((r) => r.d === -1 && r.tq < WB && /#(gras|blume|geroell)\|/.test(r.key));
    const kartenL1 = rows.filter((r) => /#(eiche|fichte|tanne|birke|weide|mammut|buche|karst|strauch)\|\d+\|1$/.test(r.key) && r.tq < WB);
    const faden = {};
    for (const r of rows) {
        if (!r.f || !r.f[1] || r.f[2] > WB) continue;
        const b = "w" + ((/w(\d+)_/.exec(r.req) || [0, "0"])[1]);
        faden[b] = (faden[b] || 0) + (r.f[2] - r.f[1]);
    }
    return {
        N,
        WB,
        leib: ende("leib"),
        buch: j.buchDa,
        atlas: LF.atlas,
        L1an: L1 && L1.tan,
        L0ein: L0 && L0.f ? L0.f[0] : null,
        L0bau: L0 && L0.f && L0.f[1] ? L0.f[2] - L0.f[1] : 0,
        L0an: L0 && L0.tan,
        seele: LF.seele && LF.seele[0] ? LF.seele[0][0] : null,
        exS: ex && ex.ts,
        exAn: ex && ex.tan,
        dorf: ende("dorf"),
        hausErst: haus.length ? Math.min(...haus.map((r) => r.tq)) : null,
        hausN: haus.length,
        hausLetzt: haus.length ? Math.max(...haus.map((r) => r.tan || 0)) : null,
        bauten: ende("bauten"),
        karten: ende("karten"),
        kartenL1letzt: kartenL1.length ? Math.max(...kartenL1.map((r) => r.tan || 0)) : null,
        streu: ende("streu"),
        rangfreiN: rangfrei.length,
        rangfreiWarte: rangfrei.length ? med(rangfrei.map((r) => (r.ts || WB) - r.tq)) : null,
        rangfreiAn: rangfrei.length ? Math.max(...rangfrei.map((r) => r.tan || 0)) : null,
        boden: ende("boden"),
        horizont: ende("horizont"),
        fadenSum: Object.values(faden).reduce((a, b) => a + b, 0),
        takte: (LF.tick || []).length,
    };
}
for (const [g, ns] of Object.entries(GRUPPEN)) zeilen[g] = ns.filter((n) => fs.existsSync(path.join(D, n + ".json"))).map(lauf);
out.push("# 1810 B5 — die Ketten je Lauf (GTX 1060, integ-probe f45ee994 + Instrument; Zeiten in s ab Navigation)\n");
out.push("| Gruppe | Läufe | t(Weltbild) | t(Leib) | Boden steht | Horizont | bauten | karten | streu |");
out.push("|---|---|---|---|---|---|---|---|---|");
for (const [g, z] of Object.entries(zeilen)) {
    const c = (k) => spann(z.map((r) => r[k]));
    out.push(`| ${g} | ${z.map((r) => r.N).join(" ")} | ${c("WB")} | ${c("leib")} | ${c("boden")} | ${c("horizont")} | ${c("bauten")} | ${c("karten")} | ${c("streu")} |`);
}
out.push("\n## Leib (Median, Spannweite)\n");
out.push("| Gruppe | Buch | Blatt-Atlas | L1 an | L0 im Faden w0 ab | L0 Studio-Bau | L0 an | Seele | t(Leib) |");
out.push("|---|---|---|---|---|---|---|---|---|");
for (const [g, z] of Object.entries(zeilen)) {
    const c = (k) => spann(z.map((r) => r[k]));
    out.push(`| ${g} | ${c("buch")} | ${c("atlas")} | ${c("L1an")} | ${c("L0ein")} | ${c("L0bau")} | ${c("L0an")} | ${c("seele")} | ${c("leib")} |`);
}
out.push("\n## Dorf-Kette (Median, Spannweite)\n");
out.push("| Gruppe | Export gesendet | Export an | Lücke dorf Ende | erstes Haus bestellt | Haus-Lieferungen | letzte Haus-Ankunft | bauten Ende |");
out.push("|---|---|---|---|---|---|---|---|");
for (const [g, z] of Object.entries(zeilen)) {
    const c = (k) => spann(z.map((r) => r[k]));
    out.push(`| ${g} | ${c("exS")} | ${c("exAn")} | ${c("dorf")} | ${c("hausErst")} | ${med(z.map((r) => r.hausN))} | ${c("hausLetzt")} | ${c("bauten")} |`);
}
out.push("\n## Streu ohne Rang (Nah-Wiese gras, Gesetz-Fit blume/geroell) und Karten\n");
out.push("| Gruppe | rang-lose Aufträge | Warte in der Host-Schlange | letzte Ankunft | streu Ende | letzte Karten-L1 an | karten Ende | Faden-Studio-Bau Σ bis Bild | Lade-Bilder |");
out.push("|---|---|---|---|---|---|---|---|---|");
for (const [g, z] of Object.entries(zeilen)) {
    const c = (k) => spann(z.map((r) => r[k]));
    out.push(`| ${g} | ${med(z.map((r) => r.rangfreiN))} | ${c("rangfreiWarte")} | ${c("rangfreiAn")} | ${c("streu")} | ${c("kartenL1letzt")} | ${c("karten")} | ${c("fadenSum")} | ${med(z.map((r) => r.takte))} |`);
}
fs.writeFileSync(path.join(D, "..", "zahlen.md"), out.join("\n") + "\n");
console.log(out.join("\n"));

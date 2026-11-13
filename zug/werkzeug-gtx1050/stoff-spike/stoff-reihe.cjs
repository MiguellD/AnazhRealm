// stoff-reihe.cjs <ordner> — die Spike-Reihe je Fall und Boot-Art (kalt · warm): Mittel (min–max) über die Runden.
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
const je = {};
for (const f of fs.readdirSync(dir).filter((x) => /^[a-z]+\d+-(kalt|warm)\.json$/.test(x))) {
    const [, fall, , art] = f.match(/^([a-z]+)(\d+)-(kalt|warm)\.json$/);
    const b = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const W = b.weltbildMs;
    if (!W) continue;
    const P = (b.pipes || []).filter((e) => !String(e[2]).startsWith("sync"));
    const vor = P.filter((e) => e[0] <= W);
    const texte = new Map();
    for (const e of vor) for (const k of [e[3], e[4]]) if (k && /^\d+:/.test(k)) texte.set(k, Number(k.split(":")[0]));
    const S = (b.extra || {}).stoff || {};
    const lang = b.lang || [];
    const nach = lang.filter((e) => e[0] > W);
    const eigen = P.filter((e) => e[0] > W && e[1] > 0 && /MeshStandard/.test(e[2]));
    const null0 = vor.filter((e) => /stufe0/.test(e[2]) && e[1] > 0);
    const takt = S.takt || [];
    const z = {
        "Bild ab Navigation s": W / 1000,
        "ready s": b.readyMs / 1000,
        "Bild − ready s": (W - b.readyMs) / 1000,
        "Pipelines vor dem Bild": vor.length,
        "Programm-Text vor dem Bild MB": [...texte.values()].reduce((a, n) => a + n, 0) / 1e6,
        "Knoten-Bauten bis zum Bild": S.bild ? S.bild.bauN : NaN,
        "Knoten-Bau bis zum Bild ms": S.bild ? S.bild.bauMs : NaN,
        "Knoten-Bau der Grund-Stoffe ms": S.bild && S.bild.null0 ? S.bild.null0.bauMs : 0,
        "längste Aufgabe vor dem Bild ms": Math.max(0, ...lang.filter((e) => e[0] <= W).map((e) => e[1])),
        "längste Aufgabe nach dem Bild ms": Math.max(0, ...nach.map((e) => e[1])),
        "Σ lange Aufgaben nach dem Bild s": nach.reduce((a, e) => a + e[1], 0) / 1000,
        "Bild-Abstand 0–2 s nach dem Bild ms (Median)": takt[0] ? takt[0][2] : NaN,
        "Bild-Abstand 2–10 s nach dem Bild ms (Median der Fenster)": takt.length > 1 ? takt.slice(1, 5).map((t) => t[2]).sort((x, y) => x - y)[Math.min(takt.length - 2, 3) >> 1] : NaN,
        "letzte eigene Pipeline fertig, s nach dem Bild": eigen.length ? (Math.max(...eigen.map((e) => e[1])) - W) / 1000 : 0,
        "Ablösung: so viele eigene Pipelines wie Grund-Stoffe fertig, s nach dem Bild": null0.length && eigen.length ? (eigen.map((e) => e[1]).sort((x, y) => x - y)[Math.min(null0.length, eigen.length) - 1] - W) / 1000 : 0,
        "eigene Pipelines nach dem Bild": eigen.length,
        "Grund-Pipelines vor dem Bild": null0.length,
        "Grund-Pipeline bestellt → fertig s (Mittel)": null0.length ? null0.reduce((a, e) => a + (e[1] - e[0]), 0) / null0.length / 1000 : 0,
        "Grund-Fragment KB (Mittel)": null0.length ? null0.reduce((a, e) => a + Number(String(e[4]).split(":")[0]), 0) / null0.length / 1000 : 0,
        "Bürger in Stufe 0 im ersten Bild": S.bild && S.bild.null0 ? S.bild.null0.bild : 0,
    };
    ((je[art] ||= {})[fall] ||= []).push(z);
}
const fmt = (x) => (!Number.isFinite(x) ? "—" : Math.abs(x) >= 100 ? x.toFixed(0) : Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2));
for (const art of ["kalt", "warm"]) {
    const F = je[art] || {};
    const faelle = Object.keys(F);
    console.log(`\n== ${art.toUpperCase()} — ${faelle.map((f) => `${f} (n ${F[f].length})`).join(" · ")}`);
    for (const k of Object.keys((F[faelle[0]] || [{}])[0]))
        console.log(
            `  ${k.padEnd(76)} ` +
                faelle
                    .map((f) => {
                        const v = F[f].map((z) => z[k]).filter(Number.isFinite);
                        if (!v.length) return `${f}: —`.padEnd(34);
                        return `${f}: ${fmt(v.reduce((a, x) => a + x, 0) / v.length)} (${fmt(Math.min(...v))}–${fmt(Math.max(...v))})`.padEnd(34);
                    })
                    .join(" ")
        );
}

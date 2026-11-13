// stoff-lesen.cjs <lauf.json …> [--kette] — der Stoff-Spike je Lauf in einer Zeile: Weltbild ab Navigation · Bild − ready · Pipelines
// bestellt/fertig vor dem Bild · Programm-Text vor dem Bild (MB, verschiedene Texte) · Knoten-Bau (n, ms) bis zum Bild · längste
// Aufgabe vor / nach dem Bild · Bild-Abstände nach dem Bild · Stufe 0 (Bürger im ersten Bild, abgelöst nach ms). --kette: die
// letzten zwölf Pipelines vor dem Bild (bestellt → fertig, KB Vertex/Fragment, Etikett) und die Knoten-Bauten dazu.
const fs = require("fs");
const kette = process.argv.includes("--kette");
const s1 = (ms) => (ms / 1000).toFixed(2);
for (const f of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
    const b = JSON.parse(fs.readFileSync(f, "utf8"));
    const W = b.weltbildMs;
    const P = (b.pipes || []).filter((e) => !String(e[2]).startsWith("sync"));
    const vor = P.filter((e) => e[0] <= W);
    const fertigVor = vor.filter((e) => e[1] != null && e[1] >= 0 && e[1] <= W);
    const texte = new Map();
    for (const e of vor) for (const k of [e[3], e[4]]) if (k && /^\d+:/.test(k)) texte.set(k, Number(k.split(":")[0]));
    const mb = [...texte.values()].reduce((a, n) => a + n, 0) / 1e6;
    const S = (b.extra || {}).stoff || {};
    const lang = b.lang || [];
    const lv = Math.max(0, ...lang.filter((e) => e[0] <= W).map((e) => e[1]));
    const ln = Math.max(0, ...lang.filter((e) => e[0] > W).map((e) => e[1]));
    const sum = (a) => a.reduce((x, y) => x + y, 0);
    const lnSum = sum(lang.filter((e) => e[0] > W).map((e) => e[1]));
    const st0 = S.stufe0 || [];
    console.log(
        `${f.replace(/.*[\/]/, "").replace(".json", "").padEnd(10)} Bild ${s1(W)} s · ready ${s1(b.readyMs)} · Bild−ready ${s1(W - b.readyMs)} · Pipelines vor dem Bild ${vor.length} bestellt/${fertigVor.length} fertig · Text ${mb.toFixed(2)} MB in ${texte.size} · Knoten-Bau ${S.bild ? S.bild.bauN + " / " + S.bild.bauMs + " ms" : "?"} · längste Aufgabe vor ${lv} / nach ${ln} ms (Σ nach ${lnSum}) · Takt nach dem Bild ${(S.takt || []).slice(0, 6).map((t) => t[0] + "s:" + t[2] + "/" + t[3]).join(" ")}` +
            (st0.length ? ` · Stufe 0: ${st0[0][1]} Bürger im ersten Bild, ${Math.max(...st0.map((e) => e[2]))} Programme, abgelöst nach ${S.abgeloestMs == null ? "—" : s1(S.abgeloestMs) + " s"}` : "") +
            (S.spaet ? ` · 20 s danach Knoten-Bau ${S.spaet.bauN} / ${S.spaet.bauMs} ms, Pipelines ${S.spaet.pipeAsync}` : "") +
            (S.fehler ? ` · FEHLER ${S.fehler}` : "")
    );
    if (kette) {
        for (const e of vor.sort((x, y) => (x[1] ?? 1e9) - (y[1] ?? 1e9)).slice(-12))
            console.log(`     ${s1(e[0])} → ${e[1] == null ? "offen" : s1(e[1])} s (${e[1] == null ? "?" : ((e[1] - e[0]) / 1000).toFixed(2)}) · V ${(Number(String(e[3]).split(":")[0]) / 1000).toFixed(1)} KB F ${(Number(String(e[4]).split(":")[0]) / 1000).toFixed(1)} KB · ${String(e[2]).replace("renderPipeline_", "")}`);
        const prog = ((b.extra || {}).programme || []).filter((x) => x[0] <= W).sort((x, y) => (x[1] ?? 1e9) - (y[1] ?? 1e9));
        console.log(`     Knoten-Bauten bis zum Bild: ${prog.length}, die letzten sechs:`);
        for (const e of prog.slice(-6)) console.log(`     ${s1(e[0])} → ${e[1] == null ? "offen" : s1(e[1])} s (${e[2]} Rufe) · ${e[3]} ‹${String(e[4]).slice(0, 90)}›`);
    }
}

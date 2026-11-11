// abschnitt-lesen.cjs <lauf.json> … — wer trug die längste Aufgabe vor dem Bild? Aus dem Eingriff takt-abschnitte.js
// (`extra.abschnitt`): die Rufe der Takt-Abschnitte ≥ 150 ms, die im Fenster der längsten Aufgabe liegen, die langen Bild-Rahmen
// des Browsers (≥ 1 s) mit ihren Skripten, und jeder Bruch. AB=<ms> zeigt nur Läufe, deren längste Aufgabe mindestens so lang ist
// (Vorgabe 0 = jeden Lauf, EINE Zeile; ab 1500 ms mit allen Einzelheiten).
const fs = require("fs");
const AB = Number(process.env.AB || 0);
for (const datei of process.argv.slice(2)) {
    let b;
    try {
        b = JSON.parse(fs.readFileSync(datei, "utf8"));
    } catch (e) {
        continue;
    }
    if (!b.lang || !b.weltbildMs) continue;
    const g = b.lang.filter((e) => e[0] <= b.weltbildMs).sort((x, y) => y[1] - x[1])[0] || [0, 0];
    if (g[1] < AB) continue;
    const A = (b.extra || {}).abschnitt;
    const book = ((b.post || []).find((p) => p[1] === "buch" && p[3] === "book") || [null])[0];
    const m = b.marken || {};
    console.log(`${datei} · längste Aufgabe ${g[1]} ms ab ${g[0]} · Buch-Post ${book} ${book != null && book < m.spieler ? "VOR" : "nach"} Spieler ${m.spieler} · Klasse→Spieler ${m.spieler - m.klasse} ms · leib ${m.leib} · Bild ${b.weltbildMs}${A ? "" : " · OHNE takt-abschnitte"}`);
    if (!A || g[1] < 1500) continue;
    if (A.fehler || A.fehlt.length) console.log(`   ${A.fehler} ${A.fehlt.length ? "ohne Glied: " + A.fehlt.join(", ") : ""}`);
    const [von, bis] = [g[0] - 20, g[0] + g[1] + 20];
    const drin = A.ruf.filter((e) => e[1] + e[2] >= von && e[1] <= bis).sort((x, y) => x[1] - y[1] || x[3] - y[3]);
    console.log(drin.length ? "   ABSCHNITTE in der Aufgabe:" : "   KEIN Abschnitt ≥ 150 ms in der Aufgabe — kein benanntes Glied trägt sie");
    for (const e of drin) console.log(`     ${String(e[1]).padStart(6)}  ${String(e[2]).padStart(5)} ms  ${"· ".repeat(e[3])}${e[0]}`);
    for (const r of A.rahmen.filter((r) => r.ab + r.ms >= von && r.ab <= bis)) {
        const skript = r.skripte.reduce((s, x) => s + x.ms, 0);
        console.log(`   RAHMEN des Browsers ab ${r.ab}: ${r.ms} ms, blockiert ${r.blockiert}, Skripte Σ ${skript} ms${r.stilAb ? ", Stil und Layout ab " + r.stilAb : ""}`);
        for (const s of r.skripte) console.log(`     ${s.ms} ms · ${s.art} · ${s.rufer} · ${s.fn || "(ohne Namen)"} · ${s.datei}${s.pause ? " · Pause " + s.pause : ""}${s.layout ? " · erzwungenes Layout " + s.layout : ""}`);
    }
    for (const e of A.bruch.filter((e) => e[0] <= bis + 500)) console.log(`   BRUCH ${e[0]}  ${e[1]}`);
}

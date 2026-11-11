// schlange-lesen.cjs <lauf.json>… — DIE SCHLANGE VOR DEM BILD (die Vorher-Zahl für w28-baum-programm): je Lauf (FREI_ZERLEGE, mit
// bau-im-gang.js für die Namen) die Standard-Programme, die VOR dem ersten Weltbild bestellt wurden — wie viele, wie viele KB
// Fragment-Text, wie viele Sekunden Übersetzung (Σ bestellt → fertig; sie laufen nebeneinander) und die Spanne der Schlange
// (erste Bestellung → letzte fertig). LISTE=1 nennt jedes beim Namen seines Bürgers (der Knoten-Bau im Hauptbild), größte zuerst.
// LEIB=1: die Vertex-Texte der Leib-Stoffe (Render-Objekte unter einem Skelett, Mensch, Tier, Bewohner) — wie viele verschiedene.
const fs = require("fs");
const s = (ms) => (ms / 1000).toFixed(1);
const zahl = (x) => Number(String(x || "").split(":")[0]) || 0;
const alle = [];
for (const datei of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const X = b.extra || {};
    const t = X.luecke && X.luecke.amBild ? X.luecke.amBild[0] : b.weltbildMs;
    const name = datei.replace(/^.*[\\/]/, "").replace(/[.]json$/, "");
    // Stoff-id → der Name seines Bürgers (der Bau im Hauptbild zuerst)
    const wer = new Map();
    for (const e of (X.gang || {}).bau || []) {
        const id = (String(e[5]).match(/_(\d+)$/) || [])[1];
        if (id && (!wer.has(id) || e[6] === "haupt")) wer.set(id, e[4] + (e[9] ? " [" + e[9] + "]" : ""));
    }
    const P = (b.pipes || [])
        .filter((p) => p[0] <= t && !/^sync /.test(p[2]))
        .map((p) => ({ an: p[0], ab: p[1] == null ? t : p[1], offen: p[1] == null || p[1] > t, label: String(p[2]).replace("renderPipeline_", ""), id: (String(p[2]).match(/_(\d+)$/) || [])[1], v: p[3], f: p[4], fkb: zahl(p[4]) / 1000, vkb: zahl(p[3]) / 1000 }));
    const std = P.filter((p) => /MeshStandard/.test(p.label) && p.fkb > 50);
    const z = { name, t, buch: b.buchMs, n: std.length, kb: std.reduce((a, p) => a + p.fkb, 0), sek: std.reduce((a, p) => a + (p.ab - p.an), 0) / 1000, von: Math.min(...std.map((p) => p.an)), bis: Math.max(...std.map((p) => p.ab)), texte: new Set(std.map((p) => p.f)).size, alleP: P.length };
    alle.push(z);
    console.log("== " + name + " · Bild " + s(t) + " s · Buch " + s(b.buchMs) + " s · STANDARD-PROGRAMME vor dem Bild: " + z.n + " (" + z.texte + " verschiedene Fragment-Texte) · " + z.kb.toFixed(0) + " KB · Σ " + z.sek.toFixed(1) + " s Übersetzung · Schlange " + s(z.von) + " → " + s(z.bis) + " s (" + s(z.bis - z.von) + " s) · alle Pipelines vor dem Bild " + z.alleP);
    if (process.env.LISTE)
        for (const p of std.sort((x, y) => y.fkb - x.fkb))
            console.log("     " + p.fkb.toFixed(1).padStart(6) + " KB (Vertex " + p.vkb.toFixed(1) + ") · " + s(p.an) + " → " + s(p.ab) + " s (" + ((p.ab - p.an) / 1000).toFixed(2) + " s)" + (p.offen ? " OFFEN am Bild" : "") + " · " + p.label + " · " + (wer.get(p.id) || "?"));
    if (process.env.LEIB) {
        const leib = new Map();
        for (const e of (X.gang || {}).bau || []) if (/SkinnedMesh|mensch|tier|bewohner|leib|kreatur/i.test(e[4])) leib.set((String(e[5]).match(/_(\d+)$/) || [])[1], e[4]);
        const Q = (b.pipes || []).filter((p) => leib.has((String(p[2]).match(/_(\d+)$/) || [])[1]) && p[3]);
        const jeV = new Map();
        for (const p of Q) jeV.set(p[3], (jeV.get(p[3]) || new Set()).add(leib.get((String(p[2]).match(/_(\d+)$/) || [])[1])));
        console.log("   LEIB-STOFFE: " + leib.size + " Stoffe · " + Q.length + " Pipelines · " + jeV.size + " verschiedene Vertex-Texte: " + [...jeV].sort((x, y) => zahl(y[0]) - zahl(x[0])).map(([v, w]) => (zahl(v) / 1000).toFixed(1) + " KB (" + [...w].slice(0, 2).join("; ") + (w.size > 2 ? " …" : "") + ")").slice(0, 14).join(" · "));
    }
}
if (alle.length > 1) {
    const sp = (k, f = (x) => x) => Math.min(...alle.map((z) => z[k])) === Math.max(...alle.map((z) => z[k])) ? f(alle[0][k]) : f(Math.min(...alle.map((z) => z[k]))) + "–" + f(Math.max(...alle.map((z) => z[k])));
    console.log("ZUSAMMEN (" + alle.length + " Läufe): " + sp("n") + " Standard-Programme · " + sp("kb", (x) => x.toFixed(0)) + " KB · Σ " + sp("sek", (x) => x.toFixed(1)) + " s Übersetzung · Schlange " + sp("von", s) + " → " + sp("bis", s) + " s");
}

// gang-lesen.cjs <lauf.json>… — der Bau im Gang (Eingriff bau-im-gang.js, mit bild-luecke.js davor): was NACH dem ersten Weltbild
// neu entsteht. Je Objekt × Art × Stoff: wie viele Knoten-Bauten (je Render-Objekt einer), der erste und die Abstände, Rufe und
// die Zeit im Ruf (Haupt-Faden), wie viele Render-Kontexte und Bau-Schlüssel; dazu die Pipelines, die nach dem Bild bestellt
// wurden (bestellt → fertig, Text in KB), und wer auf eine Pipeline wartete. VOR=1 zeigt dieselbe Tafel für die Zeit vor dem Bild.
const fs = require("fs");
const s = (ms) => (ms / 1000).toFixed(2);
for (const datei of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const X = b.extra || {};
    const G = X.gang;
    const t0 = X.luecke && X.luecke.amBild ? X.luecke.amBild[0] : (b.marken || {}).weltbild || b.weltbildMs;
    console.log("== " + datei.replace(/^.*[\\/]/, "") + " · BILD " + s(t0) + " s · Ende " + s(b.jetzt || 0) + " s");
    if (!G) { console.log("   keine Messung des Baus im Gang"); continue; }
    if (G.fehler) console.log("   FEHLER " + G.fehler);
    const nach = process.env.VOR ? G.bau.filter((e) => e[0] <= t0) : G.bau.filter((e) => e[0] > t0);
    const je = new Map();
    for (const e of nach) {
        const k = e[4] + " ¦ " + e[6] + " ¦ " + e[5];
        const g = je.get(k) || { n: 0, t: [], rufe: 0, ms: 0, ctx: new Set(), schl: new Set(), licht: new Set(), offen: 0 };
        g.n++;
        g.t.push(e[0] - t0);
        g.rufe += e[2];
        g.ms += e[3];
        g.ctx.add(e[7]);
        g.schl.add(e[8]);
        if (e[9]) g.licht.add(e[9]);
        if (e[1] == null) g.offen++;
        je.set(k, g);
    }
    let [sumN, sumMs] = [0, 0];
    console.log("   KNOTEN-BAUTEN " + (process.env.VOR ? "vor" : "nach") + " dem Bild (Objekt ¦ Art ¦ Stoff): Zahl · erster · Abstände · Rufe · ms im Ruf · Kontexte · Schlüssel");
    for (const [k, g] of [...je].sort((x, y) => y[1].ms - x[1].ms)) {
        sumN += g.n;
        sumMs += g.ms;
        const ab = g.t.slice(1, 9).map((x, i) => x - g.t[i]).join(" ");
        console.log("     " + String(g.n).padStart(3) + "× · +" + String(g.t[0]).padStart(5) + " ms" + (ab ? " · Abst. " + ab : "") + " · " + g.rufe + " Rufe · " + g.ms.toFixed(0).padStart(5) + " ms · " + g.ctx.size + " Kontexte · " + g.schl.size + " Schlüssel" + (g.offen ? " · " + g.offen + " ohne Ende" : "") + (g.licht.size ? " · " + [...g.licht].slice(0, 3).join(" ") : "") + "  " + k);
    }
    console.log("   Σ " + sumN + " Bauten · " + sumMs.toFixed(0) + " ms im Ruf des Haupt-Fadens");
    const pipes = (b.pipes || []).filter((p) => (process.env.VOR ? p[0] <= t0 : p[0] > t0));
    if (!process.env.VOR) {
        console.log("   PIPELINES nach dem Bild (" + pipes.length + "): " + pipes.slice(0, 30).map((p) => "+" + (p[0] - t0) + "→" + (p[1] == null ? "offen" : "+" + (p[1] - t0)) + " " + String(p[2]).replace("renderPipeline_", "") + " " + (String(p[4] || "").split(":")[0] / 1000 || 0).toFixed(1) + " KB").join(" | "));
        const jw = new Map();
        for (const w of G.warte || []) {
            const k = w[2] + " ¦ " + w[3] + " ¦ " + w[1];
            const g = jw.get(k) || { n: 0, erst: w[0] - t0, letzt: 0 };
            g.n++;
            g.letzt = w[0] - t0;
            jw.set(k, g);
        }
        console.log("   WARTET AUF EINE PIPELINE nach dem Bild (Objekt ¦ Art ¦ Etikett): Rufe · erster … letzter");
        for (const [k, g] of [...jw].sort((x, y) => x[1].erst - y[1].erst)) console.log("     " + String(g.n).padStart(4) + " Rufe · +" + g.erst + " … +" + g.letzt + " ms  " + k);
    }
}

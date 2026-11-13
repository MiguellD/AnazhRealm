// wartet-lesen.cjs <ordner> [kalt|warm] — WORAUF WARTET DAS ERSTE BILD: die Läufe <fall><n>-<art>.json mit extra.wartet
// (Eingriff _bild-wartet.js) zusammengeführt je Pipeline über den Text ihres Fragments (Länge:Kennung) und ihre Folge im Boot:
// Zeit der Bestellung, Knoten-Bau (ms Arbeit), Übersetzung (bestellt → fertig), Text KB (Ecke + Fragment), Pixel im ersten Bild
// (über dem Boden der Zählung), Ding. Sortiert nach der Bestellung; darunter die Summen.
const fs = require("fs");
const path = require("path");
const [dir, art = "kalt"] = process.argv.slice(2);
const laeufe = fs.readdirSync(dir).filter((f) => new RegExp(`-${art}[.]json$`).test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
const med = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const mittel = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const je = new Map(); // Schlüssel → Messungen je Lauf
const boeden = [];
for (const b of laeufe) {
    const W = b.weltbildMs;
    const M = (b.extra || {}).wartet;
    const sonde = (b.pipes || []).filter((e) => !String(e[2]).startsWith("sync") && e[0] <= W).map((e) => ({ an: e[0], ab: e[1], label: String(e[2]), v: String(e[3]), f: String(e[4]), frei: true }));
    const meine = M.pipes.filter((e) => e[0] <= W + 50).sort((x, y) => x[0] - y[0]);
    // der Boden der Zählung: der Median der Schritte der unteren Hälfte (wer nichts deckt, zählt nur Zitter)
    const px = meine.map((e) => e[9]).filter((x) => x != null).sort((x, y) => x - y);
    const boden = px.length ? med(px.slice(0, Math.ceil(px.length / 2))) : 0;
    boeden.push(boden);
    const flaeche = M.px ? M.px.w * M.px.h : 1;
    const zaehler = new Map();
    for (const e of meine) {
        // die Bestellung der Sonde zum selben Etikett, der Zeit am nächsten (r184 legt an, die Sonde sieht createRenderPipelineAsync)
        const kand = sonde.filter((s) => s.frei && s.label === e[1]).sort((x, y) => Math.abs(x.an - e[0]) - Math.abs(y.an - e[0]))[0];
        if (kand) kand.frei = false;
        const art2 = e[1].replace("renderPipeline_", "").replace(/_\d+$/, "");
        const grund = (kand ? kand.f : "?") + "|" + art2 + "|" + (e[3] ? "W" : "B");
        const nr = (zaehler.get(grund) | 0) + 1;
        zaehler.set(grund, nr);
        const k = grund + "#" + nr;
        const o = je.get(k) || { art: art2, wurf: e[3], szene: e[4], ding: e[2], f: kand ? kand.f : "?", v: kand ? kand.v : "?", m: [] };
        o.m.push({ an: e[0], bild: W, bauMs: e[5], rufe: e[6], stueck: e[7], draws: e[8], px: e[9] == null ? null : Math.max(0, e[9] - boden), roh: e[9], ueb: kand && kand.ab > 0 ? kand.ab - kand.an : null, fertig: kand && kand.ab > 0 ? kand.ab : null, flaeche });
        je.set(k, o);
    }
    const ohne = sonde.filter((s) => s.frei);
    if (ohne.length) console.log(`  (Lauf Bild ${W}: ${ohne.length} Bestellung(en) der Sonde ohne Eintrag: ${ohne.map((s) => s.label.replace("renderPipeline_", "")).join(", ")})`);
}
const kb = (s) => Number(String(s).split(":")[0]) / 1000;
const zeilen = [...je.values()].filter((o) => o.m.length >= Math.ceil(laeufe.length / 2)).map((o) => {
    const g = (f) => mittel(o.m.map(f).filter((x) => x != null));
    const flaeche = o.m[0].flaeche;
    return { ...o, an: g((m) => m.an), vorBild: g((m) => m.bild - m.an), bauMs: g((m) => m.bauMs), ueb: g((m) => m.ueb), fertigVor: g((m) => (m.fertig == null ? null : m.bild - m.fertig)), px: o.m.some((m) => m.px != null) ? g((m) => m.px) : null, anteil: o.m.some((m) => m.px != null) ? (100 * g((m) => m.px)) / flaeche : null, n: o.m.length, kbV: kb(o.v), kbF: kb(o.f), flaeche };
});
zeilen.sort((x, y) => x.an - y.an);
const bild = mittel(laeufe.map((b) => b.weltbildMs));
console.log(`${art.toUpperCase()} · ${laeufe.length} Läufe · Bild ab Navigation ${(bild / 1000).toFixed(2)} s (${laeufe.map((b) => (b.weltbildMs / 1000).toFixed(1)).join(" · ")}) · ready ${(mittel(laeufe.map((b) => b.readyMs)) / 1000).toFixed(2)} s · Boden der Zählung ${boeden.map((x) => Math.round(x)).join(" · ")} px von ${zeilen[0] ? zeilen[0].flaeche : "?"}`);
console.log("| bestellt s | fertig vor dem Bild s | Art | Ding | Knoten-Bau ms | Übersetzung ms | Text KB (Ecke + Fragment) | Pixel im ersten Bild | n |");
console.log("|---|---|---|---|---|---|---|---|---|");
const f1 = (x, d = 0) => (x == null || !Number.isFinite(x) ? "—" : x.toFixed(d));
for (const z of zeilen)
    console.log(
        `| ${f1(z.an / 1000, 2)} | ${f1(z.fertigVor / 1000, 2)} | ${z.art}${z.wurf ? " (Wurf)" : ""}${z.szene ? "" : " (Einmal-Render)"} | ${z.ding.replace(/\|/g, "/").slice(0, 58)} | ${f1(z.bauMs)} | ${f1(z.ueb)} | ${f1(z.kbV, 1)} + ${f1(z.kbF, 1)} | ${z.px == null ? "ganzes Bild oder mittelbar" : f1(z.px) + " (" + f1(z.anteil, 2) + " %)"} | ${z.n} |`
    );
const sum = (a, f) => a.reduce((s, z) => s + (Number.isFinite(f(z)) ? f(z) : 0), 0);
const welt = zeilen.filter((z) => z.szene);
const klein = welt.filter((z) => z.px != null && z.anteil < 0.1);
const gross = welt.filter((z) => z.px != null && z.anteil >= 0.1);
const einmal = zeilen.filter((z) => !z.szene);
const s = (a) => `${a.length} Pipelines · Knoten-Bau ${Math.round(sum(a, (z) => z.bauMs))} ms · Übersetzung Σ ${Math.round(sum(a, (z) => z.ueb))} ms · Text ${(sum(a, (z) => z.kbV + z.kbF) / 1000).toFixed(2)} MB`;
console.log(`\nALLE: ${s(zeilen)}`);
console.log(`Bürger der Welt-Szene ≥ 0,1 % der Pixel: ${s(gross)}`);
console.log(`Bürger der Welt-Szene < 0,1 % der Pixel (auch 0): ${s(klein)} — davon Wurf ${klein.filter((z) => z.wurf).length}`);
console.log(`Einmal-Render (Atmosphäre, Umgebung, Post, Spiegel …): ${s(einmal)}`);
const letzte = [...zeilen].sort((x, y) => x.fertigVor - y.fertigVor).slice(0, 6);
console.log("Die letzten sechs vor dem Bild (fertig s vor dem Bild): " + letzte.map((z) => `${z.art}${z.wurf ? "(W)" : ""} ${z.ding.slice(0, 28)} ${f1(z.fertigVor / 1000, 2)} [${z.px == null ? "mittelbar" : f1(z.anteil, 2) + " %"}]`).join(" · "));

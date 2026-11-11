// luecke-lesen.cjs <lauf.json>… — die Lücke am Bild (Eingriff bild-luecke.js, je Bild gezählt): wer im Task des ersten Weltbilds
// zeichnen wollte und nicht zeichnete (Hauptbild · Wurf), sein erster Zug danach, das erste GANZE Bild (im Hauptbild fehlt
// keiner; mit Wurf: auch dort keiner). VERLAUF=1: jede Änderung ab 3 s vor dem Bild. Letzte Zeile je Lauf: die zwei Zahlen.
const fs = require("fs");
const s = (ms) => (ms == null ? "—" : (ms / 1000).toFixed(2));
const zaehl = (namen) => {
    const m = new Map();
    for (const n of namen) m.set(n, (m.get(n) || 0) + 1);
    return [...m];
};
for (const datei of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const L = (b.extra || {}).luecke;
    const kopf = "== " + datei.replace(/^.*[\\/]/, "");
    if (!L) { console.log(kopf + " · keine Lücken-Messung im Lauf"); continue; }
    if (L.fehler) console.log(kopf + " · FEHLER " + L.fehler);
    if (!L.amBild) { console.log(kopf + " · kein Stand am Bild (" + L.zuege + " Züge, " + L.bilder + " Bilder)"); continue; }
    const [t, haupt, wurf] = L.amBild;
    console.log(kopf + " · BILD " + s(t) + " s · im Hauptbild fehlen " + haupt.length + " · im Wurf " + wurf.length + " · GANZ " + s(L.ganz) + " s (+" + (L.ganz != null ? L.ganz - t : "?") + " ms) · mit Wurf " + s(L.ganzWurf) + " s (+" + (L.ganzWurf != null ? L.ganzWurf - t : "?") + " ms)");
    for (const [n, k] of zaehl(haupt)) console.log("     HAUPT " + (L.nach[n] != null ? "+" + String(L.nach[n] - t).padStart(5) + " ms" : "  nie bis Ende") + (k > 1 ? " ×" + k : "   ") + " · " + n);
    for (const [n, k] of zaehl(wurf)) console.log("     WURF               " + (k > 1 ? " ×" + k : "   ") + " · " + n);
    if (process.env.VERLAUF) for (const [tt, h, w] of L.verlauf) if (tt >= t - 3000) console.log("     " + s(tt) + " haupt " + h.length + " wurf " + w.length + (h.length ? " · " + [...new Set(h.map((x) => x.split(" ¦ ")[1]))].join(" ") : ""));
}

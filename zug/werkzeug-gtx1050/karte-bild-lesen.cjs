// karte-bild-lesen.cjs <lauf.json>… — die Karten-Frage am ersten Weltbild (Eingriff karte-bild.js): der Stand der Atlas-Gruppe
// im Task des Weltbilds, ihre erste Zeichnung, der Verlauf der Änderungen ab 2 s vor dem Bild.
const fs = require("fs");
const s = (ms) => (ms == null ? "—" : (ms / 1000).toFixed(2));
for (const datei of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const K = (b.extra || {}).karte;
    console.log("== " + datei.replace(/^.*[\/]/, "") + " · WELTBILD@" + s(b.weltbildMs) + " s");
    if (!K) { console.log("   kein Karten-Stand im Lauf"); continue; }
    if (K.fehler) console.log("   FEHLER " + K.fehler);
    const z = (e) => (e ? s(e[0]) + " s · Gruppe " + e[1].gruppe + " Instanzen · Arena-Glieder " + e[1].arena + " · Pässe [" + e[1].paesse + "] · vorgebaut " + e[1].vorgebaut + " · vorgemerkt " + e[1].vorgemerkt + " · Bäume im Blick L0/L1/Karte " + e[1].imBlick + " · Back-Schlange " + e[1].schlange + " · offen: " + (e[1].offen || "nichts") + " · Stoff " + e[1].stoff : "—");
    console.log("   AM BILD   " + z(K.amBild));
    console.log("   ERSTER ZUG " + z(K.erstZug) + (K.erstZug && K.amBild ? "   ⇒ " + (K.erstZug[0] - K.amBild[0] >= 0 ? "+" : "") + (K.erstZug[0] - K.amBild[0]) + " ms zum Bild" : ""));
    console.log("   SPÄT      " + z(K.spaet));
    console.log("   BILDER    " + (K.bilder || []).map((e) => e[0] + "@" + s(e[1]) + " " + e[2] + " (" + Math.round(e[3] / 1366) + " KB)").join(" · "));
    const ab = K.amBild ? K.amBild[0] - 2000 : 0;
    let vor = null;
    for (const [t, st] of K.verlauf || []) {
        if (t < ab) { vor = st; continue; }
        const d = [];
        for (const k of Object.keys(st)) if (!vor || vor[k] !== st[k]) d.push(k + "=" + st[k]);
        console.log("     " + s(t) + " " + d.join(" · "));
        vor = st;
    }
}

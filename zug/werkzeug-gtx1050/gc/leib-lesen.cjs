// leib-lesen.cjs <lauf.json> … — das Protokoll des Leibs aus dem Eingriff buch-vor-spieler.js / buch-nach-spieler.js (`extra.leib`):
// die Reihenfolge Buch ↔ Spieler, die Marken, die längste Aufgabe vor dem Bild, jeder Schritt des Leibs mit seiner Zeit, jeder
// Bruch. VOLL=1 zeigt jede Zeile, sonst die Zeilen bis zur Marke „leib" (+ 200 ms).
const fs = require("fs");
for (const datei of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(datei, "utf8"));
    const L = (b.extra || {}).leib;
    const lang = (b.lang || []).filter((e) => e[0] <= b.weltbildMs).sort((x, y) => y[1] - x[1])[0] || [0, 0];
    const book = (b.post.find((p) => p[1] === "buch" && p[3] === "book") || [null])[0];
    console.log(`== ${datei} · Buch-Post ${book} · Spieler ${b.marken.spieler} · Buch offen ${b.buchMs} · rendererReady ${b.marken.rendererReady} · leib ${b.marken.leib} · Bild ${b.weltbildMs} · längste Aufgabe ${lang[1]} ms ab ${lang[0]}`);
    if (!L) {
        console.log("   kein extra.leib");
        continue;
    }
    console.log(`   _weltAnkunft wartete ${L.warten} ms · Buch beim Wirt: ${L.buchBeimWirt}${L.fehler ? " · FEHLER " + L.fehler : ""}`);
    const bis = process.env.VOLL ? Infinity : (b.marken.leib || 0) + 200;
    let letzt = "", n = 0;
    const aus = [];
    for (const e of L.log) {
        if (e[0] > bis) break;
        const s = e.slice(1).filter((x) => x !== "").join(" · ");
        if (s === letzt) {
            n++;
            continue;
        }
        if (n) aus[aus.length - 1] += `  ×${n + 1}`;
        n = 0;
        letzt = s;
        aus.push(`   ${String(e[0]).padStart(6)}  ${s}`);
    }
    console.log(aus.join("\n"));
    for (const e of L.bruch) console.log(`   BRUCH ${e[0]}  ${e[1]}`);
    const init = (b.init || []).filter((e) => e[2] >= 300 && e[1] <= b.weltbildMs);
    if (init.length) console.log("   Ruf-Profil ≥ 300 ms: " + init.map((e) => `${"·".repeat(e[3])}${e[0]} ${e[2]} ms ab ${e[1]}`).join(" | "));
}

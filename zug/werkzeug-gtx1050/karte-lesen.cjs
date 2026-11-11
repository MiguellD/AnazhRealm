// karte-lesen.cjs <lauf.json> [art=karte] — je Frage einer Art (aus der Sicht des Haupt-Fadens, FREI_ZERLEGE): gesendet, Antwort
// gelesen, Wartezeit; gepaart je Faden in der Reihenfolge (die Schale antwortet je Faden in Ankunfts-Folge).
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const ART = process.argv[3] || "karte";
for (const f of [...new Set(b.post.map((e) => e[1]))]) {
    const an = b.post.filter((e) => e[1] === f && e[2] === "←" && e[3] === ART).map((e) => e[0]);
    const ab = b.post.filter((e) => e[1] === f && e[2] === "→" && e[3] === ART).map((e) => e[0]);
    if (!an.length) continue;
    const w = an.map((t, i) => (ab[i] != null ? ab[i] - t : null));
    const da = w.filter((x) => x != null);
    console.log(f + ": " + an.length + " Fragen „" + ART + "“, " + ab.length + " Antworten · Wartezeit Σ " + (da.reduce((a, x) => a + x, 0) / 1000).toFixed(1) + " s · max " + (Math.max(0, ...da) / 1000).toFixed(1) + " s");
    console.log("   " + an.map((t, i) => (t / 1000).toFixed(1) + "→" + (ab[i] != null ? (ab[i] / 1000).toFixed(1) + " (" + ((ab[i] - t) / 1000).toFixed(1) + ")" : "offen")).join(" · "));
}

// pipe-schlange.cjs <lauf.json> … — die Schlange der Pipelines im GPU-Prozess: erste Bestellung, letzte fertig vor dem Weltbild,
// wie lange mindestens eine im Flug war, die Leerlauf-Lücken ≥ 100 ms dazwischen, und die Folge der Fertigstellungen (Abstände).
const fs = require("fs");
for (const f of process.argv.slice(2)) {
    const b = JSON.parse(fs.readFileSync(f, "utf8"));
    const W = (b.marken && b.marken.weltbild) || 1e9;
    const P = (b.pipes || []).filter((e) => e[1] != null && e[1] >= 0 && !String(e[2]).startsWith("sync") && e[0] <= W).sort((x, y) => x[0] - y[0]);
    let belegt = 0, ende = -1;
    const luecken = [];
    for (const [a, e] of P) {
        if (a > ende && ende >= 0 && a - ende >= 100) luecken.push([ende, a]);
        if (e <= ende) continue;
        belegt += e - Math.max(a, ende);
        ende = e;
    }
    const fertig = P.map((e) => e[1]).sort((x, y) => x - y);
    const ab = fertig.slice(1).map((t, i) => t - fertig[i]);
    const med = ab.slice().sort((x, y) => x - y)[Math.floor(ab.length / 2)];
    console.log(f.split("/").slice(-2).join("/") + ": Weltbild " + (W / 1000).toFixed(1) + " s · " + P.length + " Pipelines bis dahin · erste bestellt " + (P[0][0] / 1000).toFixed(1) + " s · letzte fertig " + (Math.max(...fertig.filter((t) => t <= W + 500)) / 1000).toFixed(1) + " s");
    console.log("   mindestens eine im Flug: " + (belegt / 1000).toFixed(1) + " s von " + ((Math.min(ende, W) - P[0][0]) / 1000).toFixed(1) + " s · Leerlauf-Lücken ≥ 0,1 s: " + (luecken.map(([a, e]) => (a / 1000).toFixed(1) + "–" + (e / 1000).toFixed(1)).join(" · ") || "keine") + " · Abstand der Fertigstellungen Median " + med + " ms");
    const std = P.filter((e) => /MeshStandard/.test(e[2]));
    console.log("   Standard-Stoff: " + std.length + " · Dauer je " + std.map((e) => ((e[1] - e[0]) / 1000).toFixed(1)).join(" ") );
}

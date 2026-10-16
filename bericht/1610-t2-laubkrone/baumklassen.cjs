// je Boot-JSON der Mess-Folge: die Baum-Täter des Bands (Befehle, Dreiecke je Täter-Klasse; Laubbäume eiche/birke/buche einzeln)
// node baumklassen.cjs <boot.json>...
const fs = require("fs");
for (const f of process.argv.slice(2)) {
    const j = JSON.parse(fs.readFileSync(f, "utf8"));
    const b = j.schritte.find((s) => s.name === "band");
    const tief = [];
    const such = (x) => {
        if (Array.isArray(x)) x.forEach(such);
        else if (x && typeof x === "object") {
            if (typeof x.klasse === "string" && Number.isFinite(x.befehle) && /^f(scatter|imp)?:/.test(x.klasse)) tief.push(x);
            else Object.values(x).forEach(such);
        }
    };
    such(b && b.ergebnis);
    const seen = new Map();
    for (const x of tief) if (!seen.has(x.klasse)) seen.set(x.klasse, x);
    const rows = [...seen.values()].sort((a, c) => c.befehle - a.befehle || c.dreiecke - a.dreiecke);
    const sum = rows.reduce((a, x) => ({ b: a.b + x.befehle, d: a.d + x.dreiecke }), { b: 0, d: 0 });
    const laub = rows.filter((x) => /(eiche|birke|buche)/.test(x.klasse)).map((x) => `${x.klasse} ${x.befehle}/${(x.dreiecke / 1000).toFixed(1)}k`);
    console.log(`${f.replace(/.*[\/]/, "").replace(".json", "").padEnd(12)} Baum-Täter Σ ${sum.b} Befehle ${(sum.d / 1000).toFixed(1)}k | Laub: ${laub.join(" · ") || "—"}`);
}

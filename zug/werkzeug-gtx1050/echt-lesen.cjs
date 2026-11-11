// echt-lesen.cjs <lauf.json> [von ms] [bis ms] — die Zerlegung eines Laufs der frei-sonde (FREI_ZERLEGE=1, FREI_JSON): die Marken
// der Ankunft, die Lücken-Terme des Spiels über die Zeit, je Sekunde die Belegung des Haupt-Fadens (lange Aufgaben) und je
// Faden seine stehende Uhr und seine Nachrichten; dazu je Foundry-Faden jeder Auftrag mit Warte- und Bauzeit.
const fs = require("fs");
const b = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const VON = Number(process.argv[3] || 0);
const BIS = Number(process.argv[4] || (b.marken && b.marken.weltbild ? b.marken.weltbild + 500 : 60000));
const s = (ms) => (ms / 1000).toFixed(1).padStart(5);
console.log("MARKEN  " + Object.entries(b.marken || {}).sort((x, y) => x[1] - y[1]).map(([k, v]) => k + " " + s(v).trim() + " s").join(" · ") + " · ready " + s(b.readyMs).trim() + " · Buch " + s(b.buchMs).trim());
console.log("--- TERME (jede Änderung der Lücken des ersten Weltbilds)");
for (const [t, sig, zeuge] of b.terme || []) if (t >= VON && t <= BIS) console.log(s(t) + " s · " + (sig || "— keine Lücke —") + (zeuge ? "   {" + zeuge + "}" : ""));
// je Faden: die Nachrichten aus der Sicht des Fadens (fz) — Aufträge und Antworten paaren
const je = {};
for (const m of b.fz || []) (je[m.name] || (je[m.name] = [])).push(...m.log);
console.log("--- FÄDEN (Uhr steht = der Faden rechnet am Stück)");
const fadenBelegt = {};
for (const [n, l] of Object.entries(je)) {
    const luecken = l.filter((e) => e[0] === "LÜCKE der Faden-Uhr");
    const sum = luecken.filter((e) => e[1] >= VON && e[1] - e[2] <= BIS).reduce((a, e) => a + e[2], 0);
    fadenBelegt[n] = luecken.map((e) => [e[1] - e[2], e[1]]);
    console.log(n.padEnd(6) + " start " + s((l.find((e) => e[0] === "start") || [0, 0])[1]) + " s · Uhr steht Σ " + s(sum) + " s im Fenster · " + luecken.filter((e) => e[2] >= 700).map((e) => s(e[1] - e[2]).trim() + "–" + s(e[1]).trim() + " (" + (e[2] / 1000).toFixed(1) + ")").join(" · "));
}
console.log("--- AUFTRÄGE je Foundry-Faden (← an, → ab; Wartezeit im Faden = an bis ab)");
for (const [n, l] of Object.entries(je)) {
    const offen = new Map();
    const fertig = [];
    for (const [k, t, x] of l) {
        const id = String(x).split(" ").find((w) => /^w?\d|^[a-z]\d+_|_\d+$/.test(w)) || x;
        if (k.startsWith("←")) offen.set(k.slice(1) + "|" + id, [t, x]);
        else if (k.startsWith("→")) {
            const art = { asset: "build-asset", book: "get-book", settlement: "export-settlement", slot: "slot-plan" }[k.slice(1)] || k.slice(1);
            const a = offen.get(art + "|" + id);
            fertig.push([a ? a[0] : null, t, k.slice(1), x]);
            if (a) offen.delete(art + "|" + id);
        }
    }
    const imF = fertig.filter((f) => f[1] >= VON && f[1] <= BIS);
    console.log(n + ": " + imF.length + " Antworten im Fenster, " + offen.size + " offen am Ende");
    for (const f of imF.sort((x, y) => y[1] - (y[0] ?? y[1]) - (x[1] - (x[0] ?? x[1]))).slice(0, 14)) console.log("    " + s(f[0] ?? NaN) + " → " + s(f[1]) + " s (" + (f[0] != null ? ((f[1] - f[0]) / 1000).toFixed(1) : "?") + " s) · " + f[2] + " " + f[3]);
}
console.log("--- JE SEKUNDE: Haupt-Faden belegt (lange Aufgaben, ms) · stehende Uhr je Faden (ms) · Nachrichten ←/→ je Faden");
const lang = b.lang || [];
const post = b.post || [];
const namen = [...new Set(post.map((p) => p[1]))];
for (let t = Math.floor(VON / 1000) * 1000; t < BIS; t += 1000) {
    const ueber = (a, e) => Math.max(0, Math.min(e, t + 1000) - Math.max(a, t));
    const haupt = lang.reduce((x, [a, d]) => x + ueber(a, a + d), 0);
    const fz = Object.entries(fadenBelegt).map(([n, l]) => n + " " + String(Math.round(l.reduce((x, [a, e]) => x + ueber(a, e), 0))).padStart(4)).join(" · ");
    const pz = namen.map((n) => { const m = post.filter((p) => p[1] === n && p[0] >= t && p[0] < t + 1000); return n.slice(0, 5) + " " + m.filter((p) => p[2] === "←").length + "/" + m.filter((p) => p[2] === "→").length; }).join(" · ");
    console.log(s(t) + " s · Haupt " + String(Math.round(haupt)).padStart(4) + " · " + fz + " · " + pz);
}
const langste = lang.filter(([a]) => a >= VON && a <= BIS).sort((x, y) => y[1] - x[1]).slice(0, 12);
console.log("--- die längsten Aufgaben des Haupt-Fadens im Fenster: " + langste.map(([a, d]) => s(a).trim() + " s +" + d + " ms").join(" · "));
console.log("Haupt-Faden belegt im Fenster " + s(VON).trim() + "–" + s(BIS).trim() + " s: " + (lang.reduce((x, [a, d]) => x + Math.max(0, Math.min(a + d, BIS) - Math.max(a, VON)), 0) / 1000).toFixed(1) + " s (nur Aufgaben ≥ 50 ms)");

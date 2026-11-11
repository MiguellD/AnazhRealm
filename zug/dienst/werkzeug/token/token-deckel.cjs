// Simulation: was kostet dieselbe Arbeit, wenn jeder Arbeiter bei DECKEL Kontext an einen frischen Arbeiter uebergibt
// (Neustart = Sockel + Uebergabe-Notiz)? Zuwachs je Runde und Ausgabe bleiben gleich (dieselben Werkzeug-Ergebnisse).
const fs = require("fs");
const path = require("path");
const root = process.argv[2];
const DECKEL = Number(process.argv[3] || 250000);
const NEU = Number(process.argv[4] || 80000); // Sockel 62k + Uebergabe ~18k
function walk(d, o) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p, o);
        else if (/agent-.*\.jsonl$/.test(e.name)) o.push(p);
    }
    return o;
}
let ist = 0,
    soll = 0,
    neustarts = 0;
for (const f of walk(root, [])) {
    const seen = new Map();
    for (const l of fs.readFileSync(f, "utf8").split("\n")) {
        if (!l.trim()) continue;
        let j;
        try {
            j = JSON.parse(l);
        } catch {
            continue;
        }
        const m = j.message;
        if (m && m.role === "assistant" && m.usage) seen.set(m.id || j.uuid, m.usage);
    }
    let prev = null,
        sim = null;
    for (const u of seen.values()) {
        const ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        const out = u.output_tokens || 0;
        ist += (u.cache_read_input_tokens || 0) * 0.1 + (u.cache_creation_input_tokens || 0) * 1.25 + (u.input_tokens || 0) + out * 5;
        const inc = prev == null ? ctx : Math.max(0, ctx - prev); // Kompaktierung: Zuwachs nie negativ
        prev = ctx;
        if (sim == null) sim = ctx;
        else sim += inc;
        let w = 0;
        if (sim > DECKEL) {
            neustarts++;
            sim = NEU + inc;
            w += NEU * 1.25; // Sockel neu schreiben
        }
        w += Math.max(0, sim - inc) * 0.1 + inc * 1.25 + out * 5;
        soll += w;
    }
}
console.log(
    `DECKEL ${DECKEL / 1000}k: ist ${(ist / 1e6).toFixed(0)}M  soll ${(soll / 1e6).toFixed(0)}M  delta ${((100 * (soll - ist)) / ist).toFixed(1)}%  neustarts ${neustarts}`
);

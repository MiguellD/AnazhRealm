// Je Nachricht: Zeit, Kontext, Ausgabe -> Tages-Summen und Kontext-Eimer (dedupliziert per message.id).
const fs = require("fs");
const path = require("path");
const roots = process.argv.slice(2);
function walk(d, out) {
    if (!fs.existsSync(d)) return out;
    const st = fs.statSync(d);
    if (st.isFile()) {
        if (d.endsWith(".jsonl")) out.push(d);
        return out;
    }
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith(".jsonl") && e.name !== "journal.jsonl") out.push(p);
    }
    return out;
}
const msgs = new Map();
for (const r of roots)
    for (const f of walk(r, [])) {
        const isSub = f.includes("subagents");
        for (const l of fs.readFileSync(f, "utf8").split("\n")) {
            if (!l.trim()) continue;
            let j;
            try {
                j = JSON.parse(l);
            } catch {
                continue;
            }
            const m = j.message;
            if (!m || m.role !== "assistant" || !m.usage || !j.timestamp) continue;
            const u = m.usage;
            const ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
            msgs.set(f + "|" + (m.id || j.uuid), {
                t: j.timestamp,
                ctx,
                cr: u.cache_read_input_tokens || 0,
                cc: u.cache_creation_input_tokens || 0,
                inp: u.input_tokens || 0,
                out: u.output_tokens || 0,
                sub: isSub,
                model: m.model || "?",
            });
        }
    }
const days = {};
const buckets = [
    [0, 100e3],
    [100e3, 200e3],
    [200e3, 400e3],
    [400e3, 700e3],
    [700e3, 2e6],
];
const B = buckets.map(() => ({ n: 0, ctx: 0 }));
const models = {};
let tot = 0;
for (const v of msgs.values()) {
    const d = v.t.slice(0, 13); // Stunde
    const day = v.t.slice(0, 13);
    const D = (days[day] = days[day] || { n: 0, cr: 0, cc: 0, out: 0, sub: 0, haupt: 0 });
    D.n++;
    D.cr += v.cr;
    D.cc += v.cc;
    D.out += v.out;
    // kostengewichtet (Eingabe-Aequivalente): Lesen 0,1 · Schreiben 1,25 · Ausgabe 5
    const w = v.cr * 0.1 + v.cc * 1.25 + v.inp + v.out * 5;
    if (v.sub) D.sub += w;
    else D.haupt += w;
    tot += v.ctx;
    for (let i = 0; i < buckets.length; i++)
        if (v.ctx >= buckets[i][0] && v.ctx < buckets[i][1]) {
            B[i].n++;
            B[i].ctx += v.ctx;
        }
    models[v.model] = (models[v.model] || 0) + 1;
}
const M = (n) => (n / 1e6).toFixed(1) + "M";
for (const [d, D] of Object.entries(days).sort())
    console.log(
        `${d} msgs=${D.n} cacheRead=${M(D.cr)} cacheWrite=${M(D.cc)} out=${M(D.out)} gewichtet sub=${M(D.sub)} haupt=${M(D.haupt)}`
    );
buckets.forEach((b, i) =>
    console.log(
        `ctx ${b[0] / 1e3}-${b[1] / 1e3}k: msgs=${B[i].n} anteilKontext=${((100 * B[i].ctx) / tot).toFixed(1)}%`
    )
);
console.log("MODELLE", JSON.stringify(models));

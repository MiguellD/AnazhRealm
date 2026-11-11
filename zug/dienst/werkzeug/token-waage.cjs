// token-waage.cjs <workflow-dir> — was jeder Agent eines Workflows kostet: Schritte, Kontext, Cache-Lesen, Ausgabe, und
// wofür der Kontext draufgeht (Werkzeug-Ergebnisse je Kategorie, Bild ≈ 1,5k Tok, Lese-Disziplin, meist gelesene Dateien).
// Waage 18.10. (wf_d27440ef-a54, 8 Macher nach 40 min): je ~250 Schritte, 320–410k Kontext, 24–70 M Cache-Lesen,
// Code-Lesen 74 % der Werkzeug-Ergebnisse, atlas 22× gegen grep 539×, werkbank.cjs 124× gelesen.
const fs = require("fs");
const path = require("path");
const D = process.argv[2];
if (!D) throw new Error("Aufruf: node token-waage.cjs <workflow-dir>");
const lesen = (f) =>
    fs.readFileSync(path.join(D, f), "utf8").split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const kat = (u, c) => {
    if (!u) return "?";
    if (u.name === "Read" && /\.png$/i.test(c)) return "bild";
    if (/playtest/.test(c)) return "playtest";
    if (/until |sleep |ci-warte|ci-lesen|gpu-schloss/.test(c)) return "warten/schloss/ci";
    if (/node scripts|npm run (gate|diag)|werkbank/.test(c)) return "linse/werkbank";
    if (/git (diff|show|log|blame)/.test(c)) return "git diff/show/log";
    if (u.name === "Read" || u.name === "Grep" || /sed -n|cat |head |grep |rg /.test(c)) return "code lesen";
    if (u.name === "Edit" || u.name === "Write") return "edit";
    if (/npm ci|worktree add/.test(c)) return "setup";
    return "sonst";
};
const summe = {}, zahl = {}, dateien = {};
let atlas = 0, grep = 0;
const groessen = [];
for (const f of fs.readdirSync(D).filter((f) => f.startsWith("agent-") && f.endsWith(".jsonl"))) {
    let meta = {};
    try { meta = JSON.parse(fs.readFileSync(path.join(D, f.replace(".jsonl", ".meta.json")), "utf8")); } catch {}
    const uses = {};
    let schritte = 0, aus = 0, ctx = 0, cacheLesen = 0, cacheNeu = 0, t0 = null, t1 = null;
    for (const e of lesen(f)) {
        if (e.timestamp) { const t = Date.parse(e.timestamp); if (!t0) t0 = t; t1 = t; }
        const m = e.message;
        if (!m) continue;
        if (e.type === "assistant" && m.usage) {
            const u = m.usage;
            schritte++;
            aus += u.output_tokens || 0;
            cacheLesen += u.cache_read_input_tokens || 0;
            cacheNeu += u.cache_creation_input_tokens || 0;
            ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        }
        if (!Array.isArray(m.content)) continue;
        for (const b of m.content) {
            if (b.type === "tool_use") {
                uses[b.id] = b;
                const c = b.input.command || "";
                if (/atlas/.test(c)) atlas++;
                if (/grep|rg /.test(c) || b.name === "Grep") grep++;
                for (const mm of c.matchAll(/(stamm\/[a-z0-9-]+\.js|scripts\/[a-z0-9-]+\.cjs)/g)) dateien[mm[1]] = (dateien[mm[1]] || 0) + 1;
            }
            if (b.type === "tool_result") {
                const u = uses[b.tool_use_id];
                const c = u ? u.input.command || u.input.file_path || u.input.pattern || "" : "";
                const k = kat(u, c);
                const s = k === "bild" ? 6000 : JSON.stringify(b.content || "").length;
                summe[k] = (summe[k] || 0) + s;
                zahl[k] = (zahl[k] || 0) + 1;
                if (k === "code lesen") groessen.push(s);
            }
        }
    }
    const min = t0 ? Math.round((t1 - t0) / 60000) : 0;
    console.log(`${(meta.description || f).padEnd(24)} ${String(min).padStart(4)} min  ${String(schritte).padStart(4)} Schritte  Kontext ${Math.round(ctx / 1000)}k  Cache-Lesen ${(cacheLesen / 1e6).toFixed(1)} M  neu ${Math.round(cacheNeu / 1000)}k  Ausgabe ${Math.round(aus / 1000)}k`);
}
const ges = Object.values(summe).reduce((a, b) => a + b, 0);
console.log(`\nWerkzeug-Ergebnisse gesamt ~${Math.round(ges / 4000)}k Tok:`);
for (const [k, v] of Object.entries(summe).sort((a, b) => b[1] - a[1]))
    console.log(`${(100 * v / ges).toFixed(0).padStart(4)} %  ~${Math.round(v / 4000)}k Tok  ${zahl[k]} Aufrufe  ${k}`);
groessen.sort((a, b) => a - b);
const q = (p) => ((groessen[Math.floor(groessen.length * p)] || 0) / 1000).toFixed(1);
console.log(`\nLesen: ${groessen.length} Aufrufe, Median ${q(0.5)} KB, p90 ${q(0.9)} KB · atlas ${atlas}× gegen grep ${grep}×`);
console.log("meist gelesen: " + Object.entries(dateien).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([d, n]) => `${d} ${n}`).join(" · "));

// Token-Zensus je Workflow/Agent aus den Transkripten (usage je message.id, dedupliziert).
const fs = require("fs");
const path = require("path");
const root = process.argv[2];
function walk(d, out) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (e.name.endsWith(".jsonl") && e.name !== "journal.jsonl") out.push(p);
    }
    return out;
}
function zensus(file) {
    const seen = new Map();
    let first = null;
    let tFirst = null,
        tLast = null;
    let tools = {};
    const lines = fs.readFileSync(file, "utf8").split("\n");
    for (const l of lines) {
        if (!l.trim()) continue;
        let j;
        try {
            j = JSON.parse(l);
        } catch {
            continue;
        }
        if (j.timestamp) {
            const t = Date.parse(j.timestamp);
            if (!tFirst || t < tFirst) tFirst = t;
            if (!tLast || t > tLast) tLast = t;
        }
        const m = j.message;
        if (!m || m.role !== "assistant" || !m.usage) continue;
        const id = m.id || j.uuid;
        seen.set(id, m.usage);
        if (Array.isArray(m.content))
            for (const c of m.content) if (c.type === "tool_use") tools[c.name] = (tools[c.name] || 0) + 1;
        if (!first) first = m.usage;
    }
    const s = { msgs: 0, inp: 0, cr: 0, cc: 0, out: 0, maxCtx: 0 };
    for (const u of seen.values()) {
        s.msgs++;
        s.inp += u.input_tokens || 0;
        s.cr += u.cache_read_input_tokens || 0;
        s.cc += u.cache_creation_input_tokens || 0;
        s.out += u.output_tokens || 0;
        const ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        if (ctx > s.maxCtx) s.maxCtx = ctx;
    }
    s.firstCtx = first
        ? (first.input_tokens || 0) + (first.cache_read_input_tokens || 0) + (first.cache_creation_input_tokens || 0)
        : 0;
    s.min = tFirst && tLast ? Math.round((tLast - tFirst) / 60000) : 0;
    s.tools = tools;
    return s;
}
const files = walk(root, []);
const groups = {};
const agents = [];
for (const f of files) {
    const rel = path.relative(root, f);
    const parts = rel.split(path.sep);
    let g;
    const wi = parts.indexOf("workflows");
    if (wi >= 0) g = parts[wi + 1];
    else if (parts.includes("subagents")) g = "agent-tool";
    else g = "haupt:" + parts[0].slice(0, 8);
    const z = zensus(f);
    agents.push({ g, f: rel, ...z });
    const G = (groups[g] = groups[g] || { n: 0, msgs: 0, inp: 0, cr: 0, cc: 0, out: 0, firstCtx: [], min: 0 });
    G.n++;
    G.msgs += z.msgs;
    G.inp += z.inp;
    G.cr += z.cr;
    G.cc += z.cc;
    G.out += z.out;
    if (z.firstCtx) G.firstCtx.push(z.firstCtx);
    G.min += z.min;
}
const fmt = (n) => (n / 1e6).toFixed(2) + "M";
let T = { inp: 0, cr: 0, cc: 0, out: 0, msgs: 0, n: 0 };
const rows = Object.entries(groups).sort((a, b) => b[1].cr + b[1].cc - (a[1].cr + a[1].cc));
for (const [g, G] of rows) {
    G.firstCtx.sort((a, b) => a - b);
    const med = G.firstCtx.length ? G.firstCtx[G.firstCtx.length >> 1] : 0;
    console.log(
        `${g.padEnd(22)} agents=${String(G.n).padStart(3)} msgs=${String(G.msgs).padStart(5)} cacheRead=${fmt(G.cr).padStart(8)} cacheWrite=${fmt(G.cc).padStart(7)} in=${fmt(G.inp).padStart(6)} out=${fmt(G.out).padStart(6)} sockelMedian=${med} agentMin=${G.min}`
    );
    for (const k of ["inp", "cr", "cc", "out", "msgs", "n"]) T[k] += G[k];
}
console.log(
    `SUMME agents=${T.n} msgs=${T.msgs} cacheRead=${fmt(T.cr)} cacheWrite=${fmt(T.cc)} in=${fmt(T.inp)} out=${fmt(T.out)}`
);
// Tool-Mix gesamt
const tm = {};
for (const a of agents) for (const [k, v] of Object.entries(a.tools)) tm[k] = (tm[k] || 0) + v;
console.log("TOOLS", JSON.stringify(Object.entries(tm).sort((a, b) => b[1] - a[1]).slice(0, 15)));
// teuerste Agenten
agents.sort((a, b) => b.cr + b.cc - (a.cr + a.cc));
for (const a of agents.slice(0, 12))
    console.log(
        `TOP ${a.g} ${path.basename(a.f).slice(0, 26)} msgs=${a.msgs} cacheRead=${fmt(a.cr)} cw=${fmt(a.cc)} out=${fmt(a.out)} maxCtx=${a.maxCtx} min=${a.min}`
    );

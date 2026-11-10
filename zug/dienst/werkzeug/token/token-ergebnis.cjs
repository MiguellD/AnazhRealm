// Kosten je Taetigkeit: jeder Werkzeug-Aufruf traegt den Kontext der Runde, in der er faellt (Cache-Lesen je Runde).
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
const kat = (name, inp) => {
    if (name === "Read") {
        const f = String(inp.file_path || "");
        if (/anazhRealm\.js$/.test(f)) return "lesen:monolith";
        if (/\.(png|jpg|jpeg)$/i.test(f)) return "lesen:bild";
        if (/scripts[\\/]/.test(f)) return "lesen:scripts";
        if (/-core\.js$/.test(f)) return "lesen:kern";
        return "lesen:sonst";
    }
    if (name === "Grep" || name === "Glob") return "suchen";
    if (name === "Edit" || name === "Write") {
        const f = String(inp.file_path || "");
        if (/anazhRealm\.js$/.test(f)) return "schreiben:monolith";
        if (/scripts[\\/]|package\.json|check\.yml/.test(f)) return "schreiben:pruefcode";
        return "schreiben:sonst";
    }
    if (name === "Monitor" || name === "TaskStop") return "warten";
    if (name === "WebSearch" || name === "WebFetch") return "recherche";
    if (name === "Bash" || name === "PowerShell") {
        const c = String(inp.command || "");
        if (/\bsleep\b|pgrep|until |while .*do|Start-Sleep|wait-for|\btail -f/.test(c)) return "bash:warten";
        if (/npm run (check|playtest|gate:|lint|format)|scripts[\\/](diag-|gate-|werkbank)|werkbank\.cjs|playtest/.test(c))
            return "bash:pruefen";
        if (/gh (run|api|pr)|actions\/runs/.test(c)) return "bash:ci-lesen";
        if (/anazhRealm\.js/.test(c) && /(grep|sed -n|awk|rg |head|tail|cat |Select-String|node -e)/.test(c))
            return "bash:lesen-monolith";
        if (/^\s*(cd [^&;]+(&&|;)\s*)?git /.test(c) || /\bgit (log|diff|show|status|commit|push|merge|rebase|worktree|rev-parse|ls-remote|fetch|cherry-pick|checkout|add)\b/.test(c))
            return "bash:git";
        if (/\b(grep|sed -n|awk|rg|cat|head|tail|wc|ls|find)\b/.test(c)) return "bash:lesen-sonst";
        if (/\bnode\b/.test(c)) return "bash:node-sonst";
        return "bash:sonst";
    }
    return "sonst:" + name;
};
const agg = {}; const idKat = new Map(); const res = {};
let total = 0;
for (const f of walk(root, [])) {
    const seen = new Set();
    for (const l of fs.readFileSync(f, "utf8").split("\n")) {
        if (!l.trim()) continue;
        let j;
        try {
            j = JSON.parse(l);
        } catch {
            continue;
        }
        const m = j.message;
        if (!m || m.role !== "assistant" || !m.usage || !Array.isArray(m.content)) continue;
        const u = m.usage;
        const ctx = (u.input_tokens || 0) + (u.cache_read_input_tokens || 0) + (u.cache_creation_input_tokens || 0);
        for (const c of m.content) {
            if (c.type !== "tool_use" || seen.has(c.id)) continue;
            seen.add(c.id);
            const k = kat(c.name, c.input || {}); idKat.set(c.id, k);
            const A = (agg[k] = agg[k] || { n: 0, ctx: 0 });
            A.n++;
            A.ctx += ctx;
            total += ctx;
        }
    }
}
const rows = Object.entries(agg).sort((a, b) => b[1].ctx - a[1].ctx);
for (const [k, A] of rows)
    console.log(
        `${k.padEnd(22)} aufrufe=${String(A.n).padStart(5)} kontextLast=${((100 * A.ctx) / total).toFixed(1).padStart(5)}%  Ø-Kontext=${Math.round(A.ctx / A.n / 1000)}k`
    );
// Ergebnis-Groesse je Kategorie (was den Kontext waechst laesst)
let rt = 0;
for (const f of walk(root, [])) {
    for (const l of fs.readFileSync(f, "utf8").split("\n")) {
        if (!l.includes("tool_result")) continue;
        let j; try { j = JSON.parse(l); } catch { continue; }
        const m = j.message;
        if (!m || !Array.isArray(m.content)) continue;
        for (const c of m.content) {
            if (c.type !== "tool_result") continue;
            const k = idKat.get(c.tool_use_id) || "?";
            let len = 0;
            if (typeof c.content === "string") len = c.content.length;
            else if (Array.isArray(c.content)) for (const x of c.content) len += x.type === "text" ? (x.text || "").length : x.type === "image" ? 6000 : 0;
            const R = (res[k] = res[k] || { n: 0, ch: 0 });
            R.n++; R.ch += len; rt += len;
        }
    }
}
console.log("--- ERGEBNIS-GROESSE (Zeichen; Bild ~6000 angesetzt)");
for (const [k, R] of Object.entries(res).sort((a, b) => b[1].ch - a[1].ch).slice(0, 14))
    console.log(`${k.padEnd(22)} n=${String(R.n).padStart(5)} anteil=${((100 * R.ch) / rt).toFixed(1).padStart(5)}%  Ø=${Math.round(R.ch / R.n)} Zeichen`);
console.log("SUMME Zeichen", rt);

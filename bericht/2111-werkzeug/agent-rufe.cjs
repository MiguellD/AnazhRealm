// node agent-rufe.cjs <agent-id> [n] — die letzten n Werkzeug-Rufe eines Arbeiters (Befehl gekürzt) samt Ergebnis-Kopf, mit Zeit (lokal).
const fs = require("fs"), path = require("path");
const id = process.argv[2], n = +process.argv[3] || 6;
const f = path.join("C:\\Users\\micha\\.claude\\projects\\C--Users-micha-AnazhRealm-profiband\\8102ed24-705b-45e3-93c0-62b2433d4fab\\subagents", "agent-" + id + ".jsonl");
const zeilen = fs.readFileSync(f, "utf8").split("\n").filter(Boolean);
const aus = [];
for (const z of zeilen) {
    let o; try { o = JSON.parse(z); } catch (e) { continue; }
    const m = o.message; if (!m || !Array.isArray(m.content)) continue;
    const t = new Date(o.timestamp).toLocaleTimeString("de-DE");
    for (const c of m.content) {
        if (c.type === "tool_use") aus.push(t + " RUF " + c.name + ": " + JSON.stringify(c.input).slice(0, 700));
        else if (c.type === "tool_result") { const x = Array.isArray(c.content) ? c.content.map((y) => y.text || "").join("") : String(c.content || ""); aus.push(t + " ERG " + x.slice(0, 500).replace(/\n/g, " | ")); }
        else if (c.type === "text" && m.role === "user") aus.push(t + " POST " + c.text.slice(0, 500).replace(/\n/g, " | "));
    }
    if (typeof m.content === "string") aus.push(t + " POST " + m.content.slice(0, 500));
}
console.log(aus.slice(-n).join("\n"));

// node agent-ende.cjs <agent-id> [n] — die letzten n Text-Blöcke (Assistent) eines Arbeiters aus seinem Live-Protokoll, mit Zeit (lokal).
const fs = require("fs"), path = require("path");
const id = process.argv[2], n = +process.argv[3] || 1;
const f = path.join("C:\\Users\\micha\\.claude\\projects\\C--Users-micha-AnazhRealm-profiband\\8102ed24-705b-45e3-93c0-62b2433d4fab\\subagents", "agent-" + id + ".jsonl");
const zeilen = fs.readFileSync(f, "utf8").split("\n").filter(Boolean);
const texte = [];
for (const z of zeilen) {
    let o; try { o = JSON.parse(z); } catch (e) { continue; }
    const m = o.message; if (!m || m.role !== "assistant" || !Array.isArray(m.content)) continue;
    for (const c of m.content) if (c.type === "text" && c.text && c.text.trim()) texte.push([o.timestamp, c.text]);
}
for (const [t, x] of texte.slice(-n)) console.log("=== " + new Date(t).toLocaleTimeString("de-DE") + " ===\n" + x + "\n");

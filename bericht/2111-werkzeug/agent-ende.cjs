// liest die letzten n Text-Blöcke (assistant) und Werkzeug-Rufe eines Agenten-Verlaufs (JSONL) — nur die letzten 400 KB
const fs = require("fs");
const f = process.argv[2], n = Number(process.argv[3] || 4);
const st = fs.statSync(f), len = Math.min(st.size, 6000000), b = Buffer.alloc(len);
const fd = fs.openSync(f, "r"); fs.readSync(fd, b, 0, len, st.size - len); fs.closeSync(fd);
const out = [];
for (const z of b.toString("utf8").split("\n")) {
    let j; try { j = JSON.parse(z); } catch { continue; }
    const m = j && j.message; if (!m || m.role !== "assistant" || !Array.isArray(m.content)) continue;
    for (const c of m.content) {
        if (c.type === "text" && c.text.trim()) out.push((j.timestamp || "").slice(11, 19) + " TEXT " + c.text.replace(/\s+/g, " ").slice(0, 700));
        if (c.type === "tool_use") out.push((j.timestamp || "").slice(11, 19) + " RUF " + c.name + " " + JSON.stringify(c.input.description || c.input.command || c.input.file_path || "").slice(0, 220));
    }
}
console.log(out.slice(-n).join("\n"));

// die Klasse „die Wache urteilt ohne den Collector": je Messdatei die Einträge UNGEMESSEN „hält noch … — Heap ungemessen" und die Fälle,
// in denen die Wache NACH dem Collector urteilte („Heap nach der Rücknahme")
const { execSync } = require("child_process");
const ref = process.argv[2] || "origin/punkte-maschine";
const dateien = execSync(`git -C /home/user/AnazhRealm ls-tree --name-only ${ref} meisterkarte-quelle/punkte/messung/`).toString().split("\n").filter((f) => /\.json$/.test(f));
let sum = { ohne: 0, mit: 0, dateien: 0, ende: 0 };
const zeilen = [];
for (const f of dateien) {
  let j; try { j = JSON.parse(execSync(`git -C /home/user/AnazhRealm show ${ref}:${f}`, { maxBuffer: 1 << 30 }).toString()); } catch (e) { continue; }
  const ohne = new Set(), mit = new Set(), ende = new Set();
  const walk = (o, k) => { if (!o || typeof o !== "object") return; for (const [a, b] of Object.entries(o)) { if (b && typeof b === "object" && typeof b.zahl === "string") { if (/hält noch: .* — Heap ungemessen/.test(b.zahl)) ohne.add(a); if (/hält noch: .* — Heap nach der Rücknahme/.test(b.zahl)) mit.add(a); if (/misst nie über ein Neuladen: .*Wirt-Wache/.test(b.zahl)) ende.add(a); } walk(b, a); } };
  walk(j, "");
  if (ohne.size || mit.size || ende.size) { sum.dateien++; zeilen.push(f.split("/").pop() + " ohne Collector " + ohne.size + " · nach dem Collector " + mit.size + " · Dauer offen " + ende.size + " · " + [...ohne].slice(0, 6).join(" ")); }
  sum.ohne += ohne.size; sum.mit += mit.size; sum.ende += ende.size;
}
console.log(zeilen.join("\n"));
console.log("SUMME " + dateien.length + " Dateien, " + sum.dateien + " mit Wache: UNGEMESSEN ohne Collector " + sum.ohne + " · nach dem Collector " + sum.mit + " · Dauer offen über die Wache " + sum.ende);

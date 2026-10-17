// methoden-diff.cjs — je Stamm-Datei die Methoden, die zwischen zwei Ständen anders sind (Klassen-Methoden, 4 Leerzeichen)
const { execSync } = require("child_process");
const [A, B] = process.argv.slice(2);
const meth = (q) => { const m = new Map(); const re = /\n    (static )?(async )?(get )?([A-Za-z_$][\w$]*)\(([^)]*)\) \{\n/g; let x; while ((x = re.exec(q))) { const s = x.index + 1; const e = q.indexOf("\n    }\n", s); m.set(x[4], q.slice(s, e + 6)); } return m; };
const dateien = execSync(`git diff --name-only ${A} ${B} -- stamm/`).toString().trim().split(/\n/);
for (const d of dateien) {
  const get = (c) => { try { return execSync(`git show ${c}:${d}`, { maxBuffer: 1 << 28 }).toString(); } catch (_) { return ""; } };
  const ma = meth(get(A)), mb = meth(get(B)); const z = [];
  for (const [k, v] of mb) if (!ma.has(k)) z.push("+" + k); else if (ma.get(k) !== v) z.push("~" + k);
  for (const k of ma.keys()) if (!mb.has(k)) z.push("-" + k);
  console.log(d.padEnd(14), z.join(" ") || "(nur außerhalb von Methoden)");
}

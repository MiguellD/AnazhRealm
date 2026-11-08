// atome-je-datei.cjs <repo> <basis> <kopf> — Atom-Delta je scripts/-Datei (wie die DECKE: ohne Kommentare, Diff-Hunks)
const { execFileSync } = require("child_process"); const path = require("path");
const [repo, basis, kopf] = process.argv.slice(2);
const stamm = require(path.join(repo, "scripts/lib/stamm.cjs"));
const mass = (t) => (t.match(/[\p{L}\p{N}_$]+|[^\s\p{L}\p{N}_$]/gu) || []).length;
const atome = (p, t) => mass(/\.(?:[cm]?js|html|css)$/.test(p) ? stamm.ohneKommentare(t) : t);
const txt = execFileSync("git", ["-C", repo, "diff", "-U0", `${basis}..${kopf}`, "--", "scripts/"], { maxBuffer: 1 << 28 }).toString();
const s = new Map(); let p = null, h = false;
for (const z of txt.split("\n")) { if (z.startsWith("diff --git ")) { p = z.slice(13, 13 + (z.length - 16) / 2); s.set(p, [[], []]); h = false; } else if (z.startsWith("@@")) h = true; else if (h && z) for (const k of [0, 1]) if (z[0] !== "+-"[k]) s.get(p)[k].push(z.slice(1)); }
const r = [...s].map(([p, [a, n]]) => [p, atome(p, n.join("\n")) - atome(p, a.join("\n"))]).sort((x, y) => x[1] - y[1]);
let sum = 0; for (const [, d] of r) sum += d; console.log("Σ", sum);
for (const [p, d] of r) if (Math.abs(d) >= 15) console.log(String(d).padStart(6), p);

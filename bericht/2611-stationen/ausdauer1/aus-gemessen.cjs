const { execSync } = require("child_process");
const ref = "origin/punkte-maschine";
const dateien = execSync(`git -C /home/user/AnazhRealm ls-tree --name-only ${ref} meisterkarte-quelle/punkte/messung/`).toString().split("\n").filter((f) => /\.json$/.test(f));
for (const f of dateien) {
  let j; try { j = JSON.parse(execSync(`git -C /home/user/AnazhRealm show ${ref}:${f}`, { maxBuffer: 1 << 30 }).toString()); } catch (e) { continue; }
  const find = (o, k) => { if (!o || typeof o !== "object") return null; if (o[k] && typeof o[k] === "object" && "zahl" in o[k]) return o[k]; for (const v of Object.values(o)) { const r = find(v, k); if (r) return r; } return null; };
  const a = find(j, "karte2.same.preis.ausdauer#1");
  if (!a || a.ungemessen) continue;
  const z = String(a.zahl), sp = (/Spielgang ([\d.]+) min/.exec(z) || [])[1], gc = (/nach dem Collector ([-\d.]+) MB\/min/.exec(z) || [])[1], st = (/Steigung ([-\d.]+) MB\/min/.exec(z) || [])[1], hk = (/Heap-Kurve (\d+) Punkte/.exec(z) || [])[1];
  console.log(f.split("/").pop().padEnd(22), (a.gruen ? "GRÜN" : "ROT ").padEnd(5), "Spielgang", String(sp).padEnd(5), "roh", String(st).padEnd(7), "nachGC", String(gc).padEnd(6), "Punkte", hk, (/BLIND/.test(z) ? "BLIND" : ""), " — " + (z.split(" — ROT")[1] || "").slice(0, 120));
}

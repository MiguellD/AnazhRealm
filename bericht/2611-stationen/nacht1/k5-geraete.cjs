// die Messdateien von origin/punkte-maschine: je Eintrag schatten.K5#* das Urteil und die Zahl (der Pfosten der NEUN am Feuer)
const { execSync } = require("child_process");
const ref = process.argv[2] || "origin/punkte-maschine";
const dateien = execSync(`git -C /home/user/AnazhRealm ls-tree --name-only ${ref} meisterkarte-quelle/punkte/messung/`).toString().split("\n").filter((f) => /\.json$/.test(f));
for (const f of dateien) {
  const roh = execSync(`git -C /home/user/AnazhRealm show ${ref}:${f}`, { maxBuffer: 1 << 30 }).toString();
  if (!roh.includes("schatten.K5")) continue;
  let j; try { j = JSON.parse(roh); } catch (e) { continue; }
  const walk = (o) => { if (!o || typeof o !== "object") return; for (const [a, b] of Object.entries(o)) { if (/^schatten\.K5#\d$/.test(a) && b && typeof b === "object" && "zahl" in b) console.log(String(j.zeit).slice(5,16), f.split("/").pop().padEnd(22), a.padEnd(14), (b.gruen ? "GRÜN" : b.ungemessen ? "UNGEM" : "ROT").padEnd(6), String(b.zahl).slice(0, 300)); else walk(b); } };
  walk(j);
}

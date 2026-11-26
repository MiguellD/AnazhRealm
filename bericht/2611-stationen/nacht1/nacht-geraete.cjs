// die Messdateien von origin/punkte-maschine: je Eintrag karte2.erleben.bild.nacht#1 das Urteil, die Zahl, der Pfosten (Quelle, Abstand, Llicht, Kontrast)
const { execSync } = require("child_process");
const ref = process.argv[2] || "origin/punkte-maschine";
const dateien = execSync(`git -C /home/user/AnazhRealm ls-tree --name-only ${ref} meisterkarte-quelle/punkte/messung/`).toString().split("\n").filter((f) => /\.json$/.test(f));
for (const f of dateien) {
  const roh = execSync(`git -C /home/user/AnazhRealm show ${ref}:${f}`, { maxBuffer: 1 << 30 }).toString();
  if (!roh.includes("erleben.bild.nacht")) continue;
  let j; try { j = JSON.parse(roh); } catch (e) { continue; }
  const treffer = [];
  const walk = (o, k) => { if (!o || typeof o !== "object") return; for (const [a, b] of Object.entries(o)) { if (/erleben\.bild\.nacht#1$/.test(a) && b && typeof b === "object" && "zahl" in b) treffer.push([a, b]); walk(b, a); } };
  walk(j, "");
  for (const [a, b] of treffer) console.log(f.split("/").pop().padEnd(22), a.padEnd(36), (b.gruen ? "GRÜN" : b.ungemessen ? "UNGEM" : "ROT").padEnd(6), String(b.zahl).slice(0, 700));
}

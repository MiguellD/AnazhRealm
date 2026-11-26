// node geraete.cjs <messung-ordner> — die Folge von mensch.macht.recht#1 (und der Nachbar-Leiter verstaendigung#1) an den Geräten:
// Zeit · Datei · Kopf · Leiter · Sekunden · Urteil (EVAL40 = „/eval ohne Antwort binnen 40 s“)
const fs = require("fs"), dir = process.argv[2] || "meisterkarte-quelle/punkte/messung";
const rows = [];
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  let j; try { j = JSON.parse(fs.readFileSync(dir + "/" + f, "utf8")); } catch { continue; }
  for (const L of ["karte2.mensch.macht.recht#1", "karte2.mensch.kultur.verstaendigung#1"]) {
    const e = (j.je || {})[L] || (j.ungemessen || {})[L]; if (!e) continue;
    const z = (e.zahl || "").replace(/\s+/g, " ");
    rows.push([e.zeit || j.zeit, f, j.sha.slice(0, 8), L.split(".").slice(-1)[0], e.s ?? "", /\/eval ohne Antwort binnen 40 s/.test(z) ? "EVAL40" : z.slice(0, 90)]);
  }
}
rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
for (const r of rows) console.log(r.join(" | "));
const n = (L, f) => rows.filter((r) => r[3] === L && f(r)).length;
console.log("recht#1: EVAL40 " + n("recht#1", (r) => r[5] === "EVAL40") + " · gemessen (S1 ROT) " + n("recht#1", (r) => /^S1 /.test(r[5])) + " · andere " + n("recht#1", (r) => r[5] !== "EVAL40" && !/^S1 /.test(r[5])));

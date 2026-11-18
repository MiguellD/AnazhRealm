// Gegenlese: welche nummerierten Zeilen der Blätter b, c, d, f, g fehlen in der Spalte „Blätter“ der Tafel?
const fs = require("fs"), p = require("path");
const Z = p.join(__dirname, "..", "zensus");
const R = require("./tafel-daten.cjs");
const hat = {};
for (const e of R) {
  // Segmente "b 39,40,41 · c 46,47" ; Bereiche "g 28-30", "b 39–41"
  for (const seg of String(e.bl).split("·")) {
    const m = seg.trim().match(/^([a-h])\s+(.*)$/); if (!m) continue;
    const L = m[1]; hat[L] = hat[L] || new Set();
    for (const t of m[2].split(/[,\s]+/)) {
      const r = t.match(/^(\d+)[-–](\d+)$/);
      if (r) for (let i = +r[1]; i <= +r[2]; i++) hat[L].add(String(i));
      else if (/^\d+$/.test(t)) hat[L].add(t);
    }
  }
}
for (const [L, f] of [["b","b-feuer-lava-glut.md"],["c","c-leuchte-fenster-stadt.md"],["d","d-umgebung-nebel-luft.md"],["f","f-stoffe-programme.md"],["g","g-belichtung-tonkurve.md"]]) {
  const rows = fs.readFileSync(p.join(Z, f), "utf8").split(/\r?\n/).filter(l => /^\|\s*\d+\s*\|/.test(l));
  const fehlt = [];
  const gesehen = new Set();
  for (const l of rows) { const c = l.split("|").map(s => s.trim()); const id = c[1]; if (gesehen.has(id)) continue; gesehen.add(id); if (!(hat[L] && hat[L].has(id))) fehlt.push(id + " " + c[2].slice(0, 70)); }
  console.log("== " + L + ": " + gesehen.size + " Zeilen, fehlen " + fehlt.length); for (const x of fehlt) console.log("   " + x);
}

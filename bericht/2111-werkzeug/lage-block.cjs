// node lage-block.cjs <block-datei> <ziel-datei> [ersetze-praefix] — baut die neue LAGE.md: der Block (mit @@ZEIT@@ → jetzt) kommt
// unter die Titelzeile; nennt das dritte Wort den Anfang eines eigenen älteren Blocks (z. B. "**STAND 22.11. 00:44"), fällt
// dieser Block (bis vor die nächste Zeile, die mit "**" beginnt) — ein Konto schreibt seinen Block fort statt zu stapeln.
// Danach: node ko-datei.cjs <ziel-datei> LAGE.md <betreff-datei>.
const cp = require("child_process"), fs = require("fs");
const R = "C:/Users/micha/AnazhRealm-profiband";
const [blockDatei, ziel, weg] = process.argv.slice(2);
cp.execFileSync("git", ["fetch", "-q", "origin", "+refs/heads/koordination:refs/remotes/origin/koordination"], { cwd: R });
const alt = cp.execFileSync("git", ["show", "origin/koordination:LAGE.md"], { cwd: R, encoding: "utf8", maxBuffer: 256 << 20 });
const z = alt.split("\n");
const jetzt = new Date().toTimeString().slice(0, 5);
const block = fs.readFileSync(blockDatei, "utf8").replace("@@ZEIT@@", jetzt).replace(/\r/g, "").replace(/\n+$/, "").split("\n");
let gefallen = 0;
if (weg) {
  const a = z.findIndex((x) => x.startsWith(weg));
  if (a < 0) { console.log("FEHLER: kein Block beginnt mit " + weg); process.exit(1); }
  // das Ende des Blocks ist die nächste Zeile, die mit "**" beginnt — JEDER Block der Seite (STAND, GESTEMPELT, NACHTRAG):
  // am 22.11. schnitt die Suche nach "**STAND" drei Blöcke von Konto 16 mit fort (geheilt aus 8cf57f8d)
  let b = z.findIndex((x, i) => i > a && x.startsWith("**"));
  if (b < 0) b = z.length;
  gefallen = b - a;
  z.splice(a, gefallen);
}
const t = z.findIndex((x) => x.startsWith("# "));
// genau eine Leerzeile zwischen Titel, Block und Rest — der Rest der Seite bleibt byte-alt
let n = t + 1;
while (z[n] === "") z.splice(n, 1);
z.splice(n, 0, "", ...block, "");
const neu = z.join("\n");
fs.writeFileSync(ziel, neu);
console.log(`LAGE gebaut ${jetzt}: Block ${block.length} Zeilen, alter Block ${gefallen} Zeilen gefallen, ${alt.length} → ${neu.length} Zeichen`);

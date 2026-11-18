const R = require("./tafel-daten.cjs");
const ids = new Set(); for (const e of R) { if (ids.has(e.id)) throw new Error("doppelt " + e.id); ids.add(e.id); }
const sum = (f) => R.filter(f).reduce((a, e) => a + e.n, 0), cnt = (f) => R.filter(f).length;
const st = ["F", "GA", "GB", "G0", "UL"];
const line = (lab, f) => lab + ": Zeilen " + cnt(f) + " · Felder " + sum(f) + " | " + st.map(s => s + " " + cnt(e => f(e) && e.st === s) + "/" + sum(e => f(e) && e.st === s)).join(" · ");
console.log(line("ALLE", () => true));
console.log(line("ohne Technik/Kosmetik", e => !/[TK]/.test(e.fl)));
console.log(line("ohne Studios (9)", e => !e.sek.startsWith("9")));
console.log(line("Licht-Kette (ohne T/K, ohne Studios)", e => !/[TK]/.test(e.fl) && !e.sek.startsWith("9")));
for (const s of [...new Set(R.map(e => e.sek))]) console.log(line(s, e => e.sek === s));
console.log("an der Quelle gelesen (Q): Zeilen " + cnt(e => /Q/.test(e.fl)));
// Markdown
const esc = (s) => String(s).replace(/\|/g, "/");
let md = "", last = "";
for (const e of R) {
  if (e.sek !== last) { md += "\n### " + e.sek + "\n\n| # | Name | Wert | Einheit | Anker | Def | Leser | Status | n | Blätter |\n|---|---|---|---|---|---|---|---|---|---|\n"; last = e.sek; }
  const stl = { F: "FOLGT", GA: "GESETZT mit Anker", GB: "GESETZT, Anker eigenes Bild", G0: "**GESETZT ohne Anker**", UL: "**ohne Leser**" }[e.st];
  const fl = (/T/.test(e.fl) ? " · Technik" : "") + (/K/.test(e.fl) ? " · Kosmetik" : "") + (/Q/.test(e.fl) ? " · *an der Quelle gelesen*" : "");
  md += `| ${e.id} | ${esc(e.name)} | ${esc(e.wert)} | ${esc(e.einheit)} | ${esc(e.anker)} | ${esc(e.def)} | ${esc(e.leser)} | ${stl}${fl} | ${e.n} | ${esc(e.bl)} |\n`;
}
require("fs").writeFileSync(__dirname + "/tafel-tabelle.md", md);

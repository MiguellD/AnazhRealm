// kosten-lesen.cjs <lauf.json> <familie> — die Shader-Kosten-Linse (scripts/lib/shader-kosten.cjs `wgslKosten`) auf dem größten
// Fragment-Text einer Familie (wie baustein-lesen) und ihr Urteil gegen das Budget des Bodens (`STOFFE.boden.budget`).
const fs = require("fs");
const path = require("path");
const SK = require(path.resolve("C:/AnazhRealm/scripts/lib/shader-kosten.cjs"));
const [datei, familie] = process.argv.slice(2);
const b = JSON.parse(fs.readFileSync(datei, "utf8"));
const RE = { "Boden-Satz": /bodenSatz/, Nadel: /f:(fichte|tanne|kiefer|laerche)[^,\]]*:2/, "Karten-Atlas": /impostor#fimp:atlas/ }[familie];
if (!RE) throw new Error("Familie: Boden-Satz | Nadel | Karten-Atlas");
const ids = new Set();
for (const e of (b.extra || {}).programme || []) {
    const id = (String(e[3]).match(/_(\d+) ¦/) || [])[1];
    if (id && /MeshStandard/.test(e[3]) && RE.test(String(e[4] || e[3]))) ids.add(id);
}
let best = null;
for (const p of b.pipes || []) {
    const id = (String(p[2]).match(/_(\d+)$/) || [])[1];
    if (!ids.has(id) || !p[4]) continue;
    const t = (b.shader || {})[p[4]];
    if (t && (!best || t.length > best.length)) best = t;
}
if (!best) throw new Error("kein Text der Familie " + familie);
const k = SK.wgslKosten(best);
console.log(`${path.basename(datei)} ${familie}: ${best.length} Zeichen · Abtastungen ${JSON.stringify(k.abtastungen)} · Proben ${k.proben} · Vergleiche ${k.vergleiche} · Ladungen ${k.ladungen} · Schleifen ${k.schleifen} · Verzweigungen ${k.verzweigungen} · Ops ${k.ops} · Rauschen ${k.rauschen}`);
const u = SK.kostenUrteil(k, SK.STOFFE.boden.budget, familie);
console.log("  Budget boden: " + (u.length ? "ROT — " + u.join(" | ") : "GRÜN"));

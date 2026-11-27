// akten-je-geraet.cjs <sprosse…> — im pm-Baum (cwd): je Sprosse alle Akten vision/richter/<leiter>.<n>.<kopf8>-<geraet>.json mit Richter/Preis, jüngste zuletzt (nach Datei-Zeit im Feld "zeit" oder mtime)
const fs = require("fs"), path = require("path");
const dir = "vision/richter";
const alle = fs.readdirSync(dir);
for (const sp of process.argv.slice(2)) {
    const [l, n] = sp.split("#"), pre = l + "." + n + ".";
    const f = alle.filter((x) => x.startsWith(pre) && /^[0-9a-f]{8}-(gtx|radeon|gtx1050)\.json$/.test(x.slice(pre.length)));
    console.log("== " + sp + " · " + f.length + " Akten");
    const z = [];
    for (const x of f) {
        let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, x), "utf8")); } catch (e) { z.push({ t: "", s: x + " unlesbar" }); continue; }
        const fahrten = Array.isArray(j) ? j : [j];
        for (const a of fahrten) for (const g of a.geraete || []) {
            const u = (v) => (v && (v.urteil || v)) || "—";
            const t = (g.zeit || a.zeit || (g.preis && g.preis.fenster && g.preis.fenster.von) || "").slice(0, 16);
            z.push({ t, s: x.slice(pre.length).replace(".json", "") + " " + t + " Richter " + u(g.richter) + " · Preis " + u(g.preis) + " · " + String((g.richter && g.richter.wert) || "").slice(0, 170) });
        }
    }
    z.sort((a, b) => (a.t < b.t ? -1 : 1));
    for (const x of z.slice(-4)) console.log("   " + x.s);
}

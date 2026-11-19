const fs = require("fs"), path = require("path");
const dir = process.argv[2], aus = process.argv[3];
const m = JSON.parse(fs.readFileSync(path.join(dir, "f68dbf09-gtx.json"), "utf8"));
const alle = { ...m.ungemessen, ...m.je };
const art = (t) => {
    if (/Umfang nicht erzeugbar/.test(t)) {
        if (/Saat/.test(t)) return "BUEHNE Saaten: die Sitzung hält EINE Saat, verlangt sind viele";
        if (/Spieler/.test(t)) return "BUEHNE Spieler: die Sitzung trägt EINEN Spieler";
        if (/Galaxi|Stern|System|Planet/.test(t)) return "BUEHNE Kosmos: EIN System / EIN Planet, Sterne auf der Kuppel";
        if (/Siedlung|Bewohner/.test(t)) return "BUEHNE Menge: größte Siedlung / Bewohner-Zahl unter dem verlangten Umfang";
        return "BUEHNE Umfang (sonst)";
    }
    if (/Leser fehlt/.test(t)) return "SPIEL Leser fehlt (die Fähigkeit ist nicht gebaut)";
    if (/Frist der Probe/.test(t)) return "PROBE Frist gerissen";
    return "SONST";
};
const g = {}, bsp = {}, leiter = {};
let gruen = 0;
for (const [id, e] of Object.entries(alle)) {
    if (e.gruen && !e.ungemessen) { gruen++; continue; }
    const t = String(e.grund || e.zahl || "");
    const a = art(t);
    g[a] = (g[a] || 0) + 1;
    (leiter[a] = leiter[a] || new Set()).add(id.replace(/#\d+$/, ""));
    if (!bsp[a]) bsp[a] = id + ": " + t.slice(0, 230);
}
const z = Object.entries(g).sort((a, b) => b[1] - a[1]);
const n = Object.keys(alle).length;
let md = "# Hebel-Tafel — was die roten Stationen der Karte 2 am Kopf f68dbf09 (GTX, Stand " + m.zeit + ") wirklich blockiert\n\n" +
    "Urteile gelesen: " + n + " (grün " + gruen + "). Quelle: `punkte-maschine:meisterkarte-quelle/punkte/messung/f68dbf09-gtx.json`.\n\n| Stationen | Leitern | Was fehlt | Beispiel |\n|---|---|---|---|\n";
for (const [a, c] of z) md += "| " + c + " | " + leiter[a].size + " | " + a + " | " + bsp[a].replace(/\|/g, "/") + " |\n";
fs.writeFileSync(aus, md);
console.log("urteile", n, "gruen", gruen);
for (const [a, c] of z) console.log(c, "Stationen /", leiter[a].size, "Leitern —", a);
const son = Object.entries(alle).filter(([, e]) => !(e.gruen && !e.ungemessen) && art(String(e.grund || e.zahl || "")) === "SONST").slice(0, 6);
for (const [id, e] of son) console.log("SONST:", id, String(e.grund || e.zahl || "").slice(0, 170));
const sa = Object.entries(alle).filter(([, e]) => /Saat/.test(String(e.grund || e.zahl || ""))).slice(0, 3);
for (const [id, e] of sa) console.log("SAAT:", id, String(e.grund || e.zahl || "").slice(0, 260));

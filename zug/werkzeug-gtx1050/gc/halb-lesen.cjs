// halb-lesen.cjs <ordner> — die Übersetzungszeiten eines künstlichen Laufs (halb-bau.cjs → uebersetz-sonde, je Durchgang <x>.json):
// je Text die Pipeline-Zeit der Runde 1 (der ganze Text, allein) in jedem Durchgang, ihr Mittel und der Unterschied zum Stand
// derselben Familie (der Name bis zum ersten Bindestrich, `<familie>-stand`). Die Spanne der Durchgänge ist das Rauschen.
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
const laeufe = fs
    .readdirSync(dir)
    .filter((f) => /^[a-z0-9]+[.]json$/.test(f) && f !== "lauf.json")
    .sort()
    .map((f) => ({ f, e: JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) }));
if (!laeufe.length) throw new Error("kein Durchgang in " + dir);
const namen = Object.keys(JSON.parse(fs.readFileSync(path.join(dir, "lauf.json"), "utf8")).shader);
const ms = (e, name) => {
    const l = (e.laeufe || []).find((x) => x.runde === 1 && x.art === "ganz" && x.name === name);
    return l && l.pipelineMs != null ? l.pipelineMs : null;
};
const zeile = {};
for (const n of namen) {
    const w = laeufe.map((l) => ms(l.e, n)).filter((x) => x != null);
    zeile[n] = { w, mittel: w.length ? w.reduce((a, b) => a + b, 0) / w.length : null };
}
console.log(`ÜBERSETZUNG ALLEIN in ms (Runde 1) · Durchgänge ${laeufe.map((l) => l.f.replace(".json", "")).join(" ")} · Fehler: ${laeufe.map((l) => (l.e.fehler || []).length).join(" ")}`);
for (const n of namen) {
    const z = zeile[n];
    const st = zeile[n.split("-")[0] + "-stand"];
    const d = st && st !== z && z.mittel != null && st.mittel != null ? z.mittel - st.mittel : null;
    console.log(`${n.padEnd(30)} ${z.w.map((x) => String(x).padStart(6)).join(" ")}   Mittel ${z.mittel == null ? "—" : String(Math.round(z.mittel)).padStart(5)}${d == null ? "" : `   ${d >= 0 ? "+" : ""}${Math.round(d)} ms (${Math.round((d / st.mittel) * 100)} %)`}`);
}

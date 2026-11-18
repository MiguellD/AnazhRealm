"use strict";
// node vergleich.cjs <a.json> <b.json> [--rausch rausch.json] [--rausch-aus r.json] [--aus x.json]
// Ding = Ort|Klasse|Name. Objekt-Dinge (Halter, Stoffe) vergleichen je Unter-Schlüssel auf der Schnittmenge (fehlende Schlüssel = Takt,
// nicht Inhalt). RAUSCH: die Unter-Schlüssel (ortlos, Indizes zu []), die schon A gegen A abweichen — beim Namen, abgetrennt.
const fs = require("fs");
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const [A, B] = [2, 3].map((i) => JSON.parse(fs.readFileSync(process.argv[i], "utf8")));
const RAUSCH = arg("--rausch") ? new Set(JSON.parse(fs.readFileSync(arg("--rausch"), "utf8"))) : new Set();
const KLASSEN = ["halter", "saetze", "instanzen", "platte", "stoffe", "plan", "bestand", "licht", "boden"];
const DOM = [
    ["D4 Tiere", /creature|kreatur|tier[:.]|tierBaum|herde|rudel|gehege|tetrapod|wolf|vogel|bestaeuber/i],
    ["D5 Mensch", /bewohner|mensch|npc|leib|koerper|player|spieler|tritt/i],
    ["D6 Fahrzeug", /vehicle|fahr|wagen|verkehr|ritt|kamera|camera/i],
    ["D3 Siedlung", /settlement|siedlung|arch|haus|house|dorf|zelle:|plan:|bau|fachwerk|stadt|trasse|gasse|wege|weg[A-Z.:|]|ort[A-Z]|_ort|grundriss|platz|feuerstelle|zaun|brunnen/i],
    ["D2 Vegetation", /scatter|streu|forest|wald|tree|baum|veg|foliage|gras|halm|wiese|natur|phyto|wind|laub|strauch|busch|kraut|blume|bluete|flora|eiche|birke|buche|fichte|tanne|kiefer|f:/i],
    ["D1 Gelaende", /voxel|chunk|terrain|gelaende|boden|hydro|water|wasser|density|surf|pegel|fluss|see|fels|stein|hoehe|flaeche|formation/i],
    ["D7 Licht", /licht|light|sun|sonne|material|stoff|shader|tex|exposure|belicht|himmel|sky|atmo|post|wolke|nebel|fog|impostor/i],
    ["D8 Foundry", /foundry|studio|platte|asset|ofen|karte/i],
];
const domaene = (klasse, name) => {
    const s = klasse === "licht" ? "licht:" + name : klasse === "boden" ? "boden " + name : klasse === "bestand" && /^tier:/.test(name) ? "tier:" : name;
    for (const [d, re] of DOM) if (re.test(s)) return d;
    return "D9 Takt/Rest";
};
const dinge = (fp) => {
    const m = new Map();
    for (const [ort, o] of Object.entries(fp.orte))
        for (const k of KLASSEN) {
            const src = k === "platte" ? (o.platte && o.platte.aus) || {} : o[k] || {};
            for (const [g, v] of Object.entries(src)) m.set(`${ort}|${k}|${g}`, v);
        }
    return m;
};
const norm = (s) => s.replace(/\[\d+\]/g, "[]").replace(/#\d+$/, "#");
const [da, db] = [dinge(A), dinge(B)];
const je = {}, anders = [], rauschNeu = new Set();
const zaehle = (d, f, n = 1) => ((je[d] ||= { dinge: 0, anders: 0, nurA: 0, nurB: 0, rausch: 0 })[f] += n);
for (const k of new Set([...da.keys(), ...db.keys()])) {
    const [ort, klasse, ...rest] = k.split("|");
    const name = rest.join("|");
    const d = domaene(klasse, name);
    zaehle(d, "dinge");
    if (!da.has(k)) { zaehle(d, "nurB"); continue; }
    if (!db.has(k)) { zaehle(d, "nurA"); continue; }
    const a = da.get(k), b = db.get(k);
    const gen = `${klasse}|${norm(name)}`;
    if (typeof a === "object") {
        const ks = Object.keys(a).filter((p) => p in b);
        const diff = ks.filter((p) => a[p] !== b[p]);
        diff.forEach((p) => rauschNeu.add(`${gen}|${norm(p)}`));
        const echt = diff.filter((p) => !RAUSCH.has(`${gen}|${norm(p)}`));
        if (!diff.length) continue;
        if (!echt.length) { zaehle(d, "rausch"); continue; }
        zaehle(d, "anders");
        anders.push({ ding: k, domaene: d, det: `${echt.length}/${ks.length} anders: ${echt.slice(0, 3).join(" ; ").slice(0, 200)}` });
    } else if (a !== b) {
        rauschNeu.add(gen);
        if (RAUSCH.has(gen)) { zaehle(d, "rausch"); continue; }
        zaehle(d, "anders");
        anders.push({ ding: k, domaene: d, det: "" });
    }
}
console.log("Domäne".padEnd(16), "Dinge", "anders", "nurA", "nurB", "rausch");
for (const [d, z] of Object.entries(je).sort()) console.log(d.padEnd(16), String(z.dinge).padStart(5), String(z.anders).padStart(6), String(z.nurA).padStart(4), String(z.nurB).padStart(4), String(z.rausch).padStart(6));
for (const x of anders.slice(0, Number(process.env.ZEIGE || 40))) console.log(" ", x.domaene, "·", x.ding.slice(0, 110), x.det);
console.log("anders gesamt", anders.length, "· Domänen mit Änderung:", [...new Set(anders.map((x) => x.domaene))].sort().join(", "));
if (arg("--rausch-aus")) {
    const alt = fs.existsSync(arg("--rausch-aus")) ? JSON.parse(fs.readFileSync(arg("--rausch-aus"), "utf8")) : [];
    fs.writeFileSync(arg("--rausch-aus"), JSON.stringify([...new Set([...alt, ...rauschNeu])].sort(), null, 0));
}
if (arg("--aus")) fs.writeFileSync(arg("--aus"), JSON.stringify({ je, anders }, null, 1));

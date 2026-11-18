// pruef-quelle-v2.cjs — GEGENPRÜFER QUELLE v2 (pruefung-quelle-v2.md): fragt die Besitz-Tafel von bahnen-besitz.cjs (dieselben
// Tafeln, aus dem Skript-Text gelesen, nicht abgeschrieben) nach den Stellen, die Bahn 1 ÖFFNUNGEN berührt oder deren Leser sie
// bricht, und grept die Fenster-Namen im GANZEN Lese-Baum (auch spec/ und .json). Liest nur Dateien, kein git.
// Aufruf (aus AnazhRealm-OMEN):  node koordination/vision/bau/zaehl/pruef-quelle-v2.cjs
"use strict";
const fs = require("fs"), path = require("path"), vm = require("vm");
const WURZEL = path.join(__dirname, "..", "..", "..", "..", "n1011-hg");
const QUELLE = path.join(__dirname, "bahnen-besitz.cjs");
const src = fs.readFileSync(QUELLE, "utf8");
const ende = src.indexOf("// ── Prüfung der Besitz-Tafel selbst");
if (ende < 0) throw new Error("bahnen-besitz.cjs: Marke der Prüfung fehlt");
const ctx = { require, __dirname, module: {}, console };
vm.runInNewContext(src.slice(0, ende) + "\n;this.T={FC,LAB,SW,ZEILEN,BEREICH,DATEI,FALL,BLEIBE};", ctx);
const { FC, LAB, ZEILEN, BEREICH, DATEI } = ctx.T;
const zeilenBahn = {}; for (const [b, m] of Object.entries(ZEILEN)) for (const [f, ls] of Object.entries(m)) for (const l of ls) zeilenBahn[f + ":" + l] = b;
const ber = []; for (const [b, m] of Object.entries(BEREICH)) for (const [f, rs] of Object.entries(m)) for (const r of rs) ber.push({ b, f, r });
const dateiBahn = {}; for (const [b, fs2] of Object.entries(DATEI)) for (const f of fs2) dateiBahn[f] = b;
function besitzer(f, l) {
    if (zeilenBahn[f + ":" + l]) return zeilenBahn[f + ":" + l];
    for (const x of ber) if (x.f === f && l >= x.r[0] && l <= x.r[1]) return x.b;
    return dateiBahn[f] || "HERRENLOS";
}
const text = {}; const Z = (f) => (text[f] ||= fs.readFileSync(path.join(WURZEL, f), "utf8").split(/\r?\n/));
// (1) Stellen, die Bahn 1 nach der Quelle braucht (Grund je Zeile; die Zeile muss das Stichwort tragen, sonst wirft das Skript)
const STELLEN = [
    [FC, 1084, "window:true", "Flügel-userData {window, openA} (Schreiber)"],
    [FC, 2412, "userData.window", "bakeHaus: Flügel bleibt live (Leser des Schlüssels window)"],
    [FC, 2445, "userData.window", "bakeLOD: Flügel bleibt live, wenn !alles (Leser)"],
    [FC, 2098, "__licht='fenster'", "das WACHE Glas glüht nachts (glas), glasdunkel nicht"],
    [FC, 2089, "glasdunkel", "Schlaf-Glas (B1-Zeile)"],
    [FC, 6188, "fluegelL", "buildStufe Stufe 0: Trennung der Tür-Flügel (der Weg zum lebenden Flügel)"],
    [FC, 6191, "userData.door", "Auswahl nur door+side — Fenster werden mitgebakt"],
    [FC, 6230, "bakeLOD(st.g, p.col, geoms, 0, true)", "Stufe 0 bakt Fenster ein (alles=true)"],
    [FC, 6314, "__tuerFluegel", "Zusammenbau der Flügel-Gruppen"],
    [FC, 6352, "__tuerFluegel", "Flügel an die Ausgangs-Gruppe"],
    [FC, 334, "0,62 rad", "Kommentar zum offenen Flügel (strahlFluegel)"],
    [FC, 2300, "fensterFern", "Kommentar Fern-Flügel"],
    [LAB, 97, "userData.window", "Labor: Fenster in doorList (Dorf)"],
    [LAB, 727, "userData.window", "Labor: Fenster in doorList (Einzelhaus)"],
    [LAB, 1039, "openA", "Labor: dreht jeden doorList-Flügel um openA"],
    ["foundry-bruecke.js", 653, "userData.side", "Extraktor: nur Ahnen mit side werden Flügel (out.tuer)"],
    ["stamm/studio-gestalt.js", 347, "m.tuer", "Studio: Scharnier ans Mesh (__tuer)"],
    ["stamm/studio-gestalt.js", 1477, "lf.tuer", "Studio: Schwenk-Träger je Flügel"],
    ["stamm/siedlung-instanz.js", 518, "leaf.tuer", "Instanz: Flügel bleiben aus den Bündeln"],
    ["stamm/siedlung-instanz.js", 859, "leaf.tuer", "Instanz: ref.tuer"],
    ["stamm/gelaende-kollision.js", 867, "s.tuer", "_fluegelLeib sammelt Flügel mit tuer"],
    ["phyto-core.js", 6074, "m.tuer", "Budget: Flügel nie gefaltet"],
    ["phyto-core.js", 6545, "tuer", "Budget: Flügel-Feld reist"],
    ["stamm/siedlung-ort.js", 114, "_tickTorFluegel", "_tickHausTueren dreht ALLE Flügel des Eintrags"],
    ["stamm/siedlung-tor.js", 836, "f.tuer", "_tickTorFluegel liest f.tuer"],
    ["stamm/dirigent-takt.js", 268, "_tickHausTueren", "Ruf-Stelle des Tür-Takts"],
    ["scripts/diag-fachwerk-contract.cjs", 147, "__tuerFluegel", "Shell-Komposition der Stufe 0 (Byte-Parität, Goldens v6)"],
    ["scripts/diag-kamera-laub.cjs", 732, "Fenster-Flügel", "gate:kamera-leib: der offene Fenster-Flügel in der Kugel"],
    ["scripts/diag-haus-fern.cjs", 194, "__licht", "gate:haus-fern G: Glut je Stufe aus dem Stoff mit __licht fenster"],
];
console.log("(1) STELLEN, DIE BAHN 1 BRAUCHT ODER BRICHT — Besitzer nach bahnen-besitz.cjs");
const je = {};
for (const [f, l, wort, grund] of STELLEN) {
    const z = Z(f)[l - 1] || "";
    if (!z.includes(wort)) throw new Error(f + ":" + l + " trägt „" + wort + "“ nicht");
    const b = besitzer(f, l); je[b] = (je[b] || 0) + 1;
    console.log(`  ${(f + ":" + l).padEnd(40)} ${b.padEnd(9)} ${grund}`);
}
console.log("  je Besitzer: " + JSON.stringify(je));
// (2) die Lücke 2411–2479 (bakeHaus/bakeLOD) und 6170–6365 (buildStufe) in der Tafel
for (const [a, e] of [[2411, 2479], [6170, 6365]]) {
    const b = {}; for (let l = a; l <= e; l++) { const x = besitzer(FC, l); b[x] = (b[x] || 0) + 1; }
    console.log(`(2) FC:${a}–${e} Besitz je Zeile: ${JSON.stringify(b)}`);
}
// (3) Absenz-Grep der Bahn 1 (entscheid-v2 §4.3 Fällt-wenn) über den GANZEN Baum, auch spec/ und .json, ohne node_modules/.git/vendor
const OHNE = new Set(["node_modules", ".git", "vendor", ".claude"]);
const dateien = [];
(function lauf(d, rel) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (OHNE.has(e.name)) continue; const p = path.join(d, e.name), r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) lauf(p, r); else if (/\.(js|cjs|mjs|html|json|md)$/.test(e.name) && fs.statSync(p).size < 30e6) dateien.push(r); } })(WURZEL, "");
const MUSTER = { "glasdunkel|FLUEGEL_LAGE|?0.62:-0.62|?-0.62:0.62 (Absenz-Grep §4.3)": /glasdunkel|FLUEGEL_LAGE|\?0\.62:-0\.62|\?-0\.62:0\.62/,
    "userData.window / window:true": /userData\.window|window:true/, "fensterSchlaeft": /fensterSchlaeft/, "schlafF": /schlafF/ };
console.log("(3) GREP im ganzen Baum (" + dateien.length + " Dateien) — Treffer je Datei mit Besitzer");
for (const [n, re] of Object.entries(MUSTER)) {
    const T = {};
    for (const f of dateien) { const L = Z(f); for (let i = 0; i < L.length; i++) if (re.test(L[i])) (T[f] ||= []).push(i + 1 + "→" + besitzer(f, i + 1)); }
    console.log("  " + n + ": " + (Object.keys(T).length ? Object.entries(T).map(([f, ls]) => f + " [" + ls.join(", ") + "]").join(" · ") : "0"));
}

// bahnen-besitz.cjs — RICHTER v2 (entscheid-v2.md §4): der ausschließliche Besitz der Bahnen, am Lese-Baum nachgezählt.
// Liest NUR Dateien (fs, kein git) im Baum n1011-hg (main b7ed8419). Für jeden FALL-Namen (er muss nach der Landung seiner Bahn
// 0 Treffer haben) wird JEDER Treffer (Wort-Grep, *.js *.cjs *.mjs *.html, ohne vendor/ node_modules/ spec/ .git/) einer Bahn
// zugeordnet: zuerst die Zeilen-Liste `ZEILEN` (Vorrang), dann die Bereiche `BEREICH`, dann ganze Dateien `DATEI`.
// Urteil je Name: EIN BESITZER (alle Treffer in der Bahn, die ihn fällt) · FREMD (Treffer in einer anderen Bahn) · HERRENLOS
// (Treffer ohne Bahn). Für BLEIBE-Namen (Definition + Leser) wird der Besitzer der Definition gedruckt und die Treffer je Bahn.
// Wirft, wenn sich zwei Bereiche derselben Datei überlappen (Besitz wäre nicht ausschließlich) oder eine Datei fehlt.
// Aufruf (aus AnazhRealm-OMEN):  node koordination/vision/bau/zaehl/bahnen-besitz.cjs   (Exit 1, wenn ein Fall-Name nicht EIN BESITZER ist)
"use strict";
const fs = require("fs"), path = require("path");
const WURZEL = path.join(__dirname, "..", "..", "..", "..", "n1011-hg");
const FC = "fachwerk-core.js", LAB = "worlds/fachwerk/fachwerk.js", SW = "stamm/siedlung-wege.js";
// ── der Besitz (Zeilen am main b7ed8419; fachwerk-core.js ist seit 18058dba unverändert, zaehl.md:80) ──
const ZEILEN = {   // einzelne Zeilen mit Vorrang vor den Bereichen: Rufer in fremden Bereichen, Kommentare, Exporte
    B3: { [FC]: [2230] },
    B1: { [FC]: [339, 764, 799, 1292, 1358, 1520, 1522, 1619, 1620, 1700, 1702, 1703, 1791, 2057, 2089, 3575, 12503] },
    B2: { [FC]: [7, 24, 47, 3596, 10057, 10095, 12424, 12479, 10075, 12399, 12405, 12412, 12416, 12420, 12423] },
    B4: { [FC]: [56, 2058, 2090, 2097, 3685, 7533, 7559, 7560, 12474], [LAB]: [24, 25, 33, 35, 217, 712], [SW]: [2739, 2748, 2749], "stamm/stoff-material.js": [2074] },
};
const BEREICH = {
    B1: { [FC]: [[1010, 1021], [1080, 1097], [2745, 2823]], "foundry-bruecke.js": [[645, 665]], "stamm/siedlung-tor.js": [[800, 863]], "stamm/dirigent-takt.js": [[266, 270]] },
    B2: { [FC]: [[2165, 2244], [3609, 4146], [4147, 4518], [4519, 4594], [5262, 5813], [9028, 9098], [9519, 9552], [9722, 9996]], "koerper-core.js": [[5176, 5188]] },
    B3: { [FC]: [[155, 338], [340, 1009], [1022, 1079], [1098, 1839], [2245, 2276]] },
    B4: { [FC]: [[1840, 2164], [2277, 2410], [2480, 2744], [6842, 6954]] },
};
const DATEI = {   // ganze Dateien (nach Zeilen und Bereichen)
    B2: ["stamm/siedlung-ort.js", "stamm/studio-bruecke.js", LAB, SW, "stamm/vegetation-streu.js"],
    B4: ["porta-core.js", "stamm/siedlung-satz.js", "stamm/bau-vorlagen.js"],
    B5: ["stamm/siedlung-bewohner.js"],
    B6: ["scripts/diag-settlement.cjs", "scripts/diag-haus-fern.cjs", "scripts/diag-haus-welt.cjs", "scripts/diag-studio-huelle.cjs", "scripts/diag-fachwerk-contract.cjs",
        "scripts/lib/ort-proben.cjs", "scripts/lib/los-proben.cjs", "scripts/diag-altlasten.cjs", "worlds/huelle/huelle.js"],
};
const FALL = {   // Name → Bahn, die ihn fällt (Absenz-Grep nach ihrer Landung = 0)
    glasdunkel: "B1", FLUEGEL_LAGE: "B1",
    PROXYHAUS: "B2", proxyGroup: "B2", STADT_MASSEN: "B2", _bauweiseWurf: "B2",
    shaftCX: "B3", shaftRange: "B3", bxFront: "B3", layJoists: "B3", isAxis: "B3", STIL_GRENZNEIGUNG: "B3",
    DEFCOL: "B4", laternenglas: "B4", AUS_SILBER: "B4", AUS_ROST: "B4", AUS_MOOS_NORD: "B4",
};
const BLEIBE = { fensterSchlaeft: [FC, 2752], FENSTER_SCHLAF: [FC, 2751], DORF_NORM: [FC, 3649], STADT_FORM: [FC, 3892], kachelNetz: [FC, 3844], viertelWort: [FC, 4006], kachelMassen: [FC, 4074],
    hausMasse: [FC, 4119], exportSettlement: [FC, 9722], PRESETS: [FC, 5771], bauRezept: [FC, 2221], bauProgramm: [FC, 2245], fensterAt: [FC, 1080], wallSpec: [FC, 477], herd: [FC, 919] };
// ── Prüfung der Besitz-Tafel selbst ──
for (const [b, m] of Object.entries(BEREICH)) for (const [f, rs] of Object.entries(m)) if (!fs.existsSync(path.join(WURZEL, f))) throw new Error("Datei fehlt " + f + " (" + b + ")");
for (const [b, fs2] of Object.entries(DATEI)) for (const f of fs2) if (!fs.existsSync(path.join(WURZEL, f))) throw new Error("Datei fehlt " + f + " (" + b + ")");
const alleBereiche = []; for (const [b, m] of Object.entries(BEREICH)) for (const [f, rs] of Object.entries(m)) for (const r of rs) alleBereiche.push({ b, f, r });
for (let i = 0; i < alleBereiche.length; i++) for (let j = i + 1; j < alleBereiche.length; j++) { const x = alleBereiche[i], y = alleBereiche[j];
    if (x.f === y.f && x.r[0] <= y.r[1] && y.r[0] <= x.r[1]) throw new Error("Bereiche überlappen: " + x.b + " " + x.f + ":" + x.r + " ↔ " + y.b + ":" + y.r); }
const dateiBahn = {}; for (const [b, fs2] of Object.entries(DATEI)) for (const f of fs2) { if (dateiBahn[f]) throw new Error("Datei zweimal: " + f); dateiBahn[f] = b; }
const zeilenBahn = {}; for (const [b, m] of Object.entries(ZEILEN)) for (const [f, ls] of Object.entries(m)) for (const l of ls) { const k = f + ":" + l; if (zeilenBahn[k]) throw new Error("Zeile zweimal: " + k); zeilenBahn[k] = b; }
function besitzer(f, l) {
    if (zeilenBahn[f + ":" + l]) return zeilenBahn[f + ":" + l];
    for (const x of alleBereiche) if (x.f === f && l >= x.r[0] && l <= x.r[1]) return x.b;
    return dateiBahn[f] || null;
}
// ── der Grep ──
const OHNE = new Set(["vendor", "node_modules", "spec", ".git", ".claude"]);
const dateien = [];
(function lauf(d, rel) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (OHNE.has(e.name)) continue; const p = path.join(d, e.name), r = rel ? rel + "/" + e.name : e.name;
    if (e.isDirectory()) lauf(p, r); else if (/\.(js|cjs|mjs|html)$/.test(e.name)) dateien.push(r); } })(WURZEL, "");
const text = {}; const zeilen = (f) => (text[f] ||= fs.readFileSync(path.join(WURZEL, f), "utf8").split(/\r?\n/));
function treffer(name) { const re = new RegExp("(^|[^A-Za-z0-9_$])" + name.replace(/\$/g, "\\$") + "($|[^A-Za-z0-9_$])"), T = [];
    for (const f of dateien) { const Z = zeilen(f); for (let i = 0; i < Z.length; i++) if (re.test(Z[i])) T.push({ f, l: i + 1, b: besitzer(f, i + 1) }); } return T; }
let rot = 0;
console.log("FALL-NAMEN (Treffer heute → je Bahn; nach der Landung der Besitzer-Bahn muss jeder 0 sein)");
for (const [name, soll] of Object.entries(FALL)) {
    const T = treffer(name), je = {}; for (const t of T) je[t.b || "HERRENLOS"] = (je[t.b || "HERRENLOS"] || 0) + 1;
    const fremd = T.filter((t) => t.b !== soll);
    const urteil = !T.length ? "KEIN TREFFER" : !fremd.length ? "EIN BESITZER" : fremd.some((t) => !t.b) ? "HERRENLOS" : "FREMD";
    if (urteil !== "EIN BESITZER") rot++;
    console.log(`  ${name.padEnd(18)} ${String(T.length).padStart(3)} Treffer · ${JSON.stringify(je)} · ${urteil}` + (fremd.length ? " — " + fremd.map((t) => t.f + ":" + t.l + "→" + (t.b || "—")).join(", ") : ""));
}
console.log("BLEIBE-NAMEN (Definition → Besitzer; Treffer je Bahn, Leser außerhalb sind erlaubt)");
for (const [name, [f, l]] of Object.entries(BLEIBE)) {
    const T = treffer(name), je = {}; for (const t of T) je[t.b || "—"] = (je[t.b || "—"] || 0) + 1;
    const def = zeilen(f)[l - 1] || ""; if (!new RegExp(name).test(def)) throw new Error("Definition von " + name + " steht nicht an " + f + ":" + l);
    console.log(`  ${name.padEnd(18)} Def ${f}:${l} → ${besitzer(f, l)} · ${T.length} Treffer ${JSON.stringify(je)}`);
}
console.log(rot ? `ROT: ${rot} Fall-Namen ohne EINEN Besitzer` : "GRÜN: jeder Fall-Name hat genau EINEN Besitzer");
process.exitCode = rot ? 1 : 0;

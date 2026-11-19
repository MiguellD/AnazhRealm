// zaehl-faellt.cjs — BAU-ZENSUS Runde 3, Struktur: die Leser jeder Stelle, die das Gesetz v3 fallen lässt (gesetz-v3-struktur.md §2).
//
// Aufruf: node zaehl-faellt.cjs > zaehl-faellt.log      (LESEBAUM=…/n1011-hg, Vorgabe unten; nur Lesen, kein git, kein Schreiben)
//
// Je Name ein Muster (RegExp, je Zeile), gesucht in allen *.js/*.cjs/*.mjs des Lese-Baums ohne node_modules, vendor, .git, spec,
// dist, p3. „Definition" = die Zeile, die der Eintrag als Ort nennt (def: [datei, zeile]); Leser = jede andere Trefferzeile.
// Ein Treffer im Kommentar zählt mit (die Zeile wird gezeigt) — das Blatt sagt je Name, was davon Kode ist.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const BAUM = process.env.LESEBAUM || "C:/Users/micha/Desktop/AnazhRealm-OMEN/n1011-hg";
const AUS = new Set(["node_modules", "vendor", ".git", "spec", "dist", "p3", ".claude"]);
const dateien = [];
(function lauf(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (AUS.has(e.name)) continue;
        const p = path.join(d, e.name);
        if (e.isDirectory()) lauf(p);
        else if (/\.(js|cjs|mjs)$/.test(e.name) && !/\.min\.js$/.test(e.name)) dateien.push(p);
    }
})(BAUM);
const text = new Map(dateien.map((f) => [f, fs.readFileSync(f, "utf8").split(/\r?\n/)]));
const rel = (f) => path.relative(BAUM, f).replace(/\\/g, "/");
const FC = path.join(BAUM, "fachwerk-core.js");
console.log(`Lese-Baum ${BAUM} · ${dateien.length} Dateien · FC sha256 ${crypto.createHash("sha256").update(fs.readFileSync(FC)).digest("hex")}`);

// [Name, Muster, Definition (FC-Zeile oder null), Bemerkung]
const NAMEN = [
    ["tryPlace", /\btryPlace\b/, 5487, "Setzer: erste Stelle, an der die Hülle passt"],
    ["dorfLayout", /\bdorfLayout\s*\(/, 5357, "Lage NACH dem Haus"],
    ["edepth (Folge = Index)", /\bedepth\b/, 5369, "Zeiger-Metrik edepth·34 + cur"],
    ["_bauweiseWurf", /\b_bauweiseWurf\b/, 2204, "Maß-Jitter W/D/st/pitch FC:2207–2210"],
    ["Kultur-Würfel im Pool", /pool\[\(rnd\(\)\*pool\.length\)\|0\]/, 4435, "Kultur = Würfel im Pool"],
    ["poolAt", /\bpoolAt\b/, 4424, "Pool = Region × Ära des Baujahrs"],
    ["Wohlstand-Würfel", /\(1\.22-0\.5\*/, 4438, "wohl = (1,22 − 0,5t)(0,78 + 0,44·rnd)"],
    ["Wohl-Klemme der Breite", /0\.84\+0\.30\*w/, 4439, "W × (0,84 + 0,30·wohl), Klemme 5–15"],
    ["Wohl-Stufe +1 Geschoss", /w>0\.9&&p\.storeys<4/, 4444, "+1 Geschoss bei wohl > 0,9"],
    ["Ring-Breite (Parzellen-Gedächtnis)", /0\.80\+0\.38\*t9r/, 4437, "nur mit Jahresringen"],
    ["Keller/Anbau-Würfel", /p\.keller=\(rnd\(\)<0\.35\)/, 4446, "Keller 35 %, Anbau 25 % gewürfelt"],
    ["Balkon-Würfel", /p\.balcony=\(w>0\.95/, 4448, ""],
    ["Grundriss-Würfel I/L", /p\.grundriss=\(g2</, 4449, ""],
    ["arm-Schwelle", /p\.arm=\(n>=16&&w<0\.72\)/, 4447, ""],
    ["Ersatzbau-Würfel 12 %", /rnd\(\)<0\.12\) by=/, 4431, "nur mit Jahresringen"],
    ["Stadtkörper/Downtown/Gewerbe-Würfel", /STADTKOERPER|DOWNTOWN-GESETZ|GEWERBE-GESETZ/, null, "FC:4440–4443, 4453–4460 (jahr > 1880/1905/1850)"],
    ["BAU_NUTZUNG", /\bBAU_NUTZUNG\b/, 2182, "Maß-Zeilen der Rollen FC:2184–2200"],
    ["bauRezept", /\bbauRezept\s*\(/, 2221, "jeder Welt-Ruf mit haushalt null"],
    ["bauProgramm", /\bbauProgramm\s*\(/, 2245, "Packer, läuft in DORF nie"],
    ["hp.parzelle", /\.parzelle\b/, 2255, "Leser ohne Erzeuger"],
    ["wohl als Feld des Hauses (p.wohl/hp.wohl/v.wohl/.wohl)", /\.wohl\b/, 4438, "Folge-Leser des Wohlstand-Würfels"],
    ["Setzer-Jitter jitAmp", /\bjitAmp\b/, 5361, "Abstand zur Straße gewürfelt"],
    ["Setzer-Fuge (rnd()*0.15 / rnd()*1.2)", /rnd\(\)\*0\.15\*dN9/, 5530, "Fuge gewürfelt"],
    ["plan.lose (Los nur mit Chronik)", /plan\.lose\b|\blose\.push\(/, 4504, ""],
    ["STADT_GRAMMATIK", /\bSTADT_GRAMMATIK\b/, 4320, "Viertel nach Los-Index, Grund-Satz"],
    ["stadtViertel", /\bstadtViertel\s*\(/, 4376, "Rolle nach Index + wohl"],
    ["terrain 0 (Haus ohne Gelände)", /terrain\s*[:=]\s*0\b|P\.terrain/, 4436, "gelaende() leer FC:1488"],
    ["foundH", /\bfoundH\b/, 178, "fester Sockel 0,55 m"],
    ["layJoists", /\blayJoists\b/, 466, "Deckenbalken über volle Tiefe"],
    ["clipSpanZ", /\bclipSpanZ\b/, 357, "Loch ohne Wechsel"],
    ["bayMax", /\bbayMax\b/, 181, "Ständer-/Balkenteilung ≤ 1,7 m"],
    ["sparH", /\bsparH\b/, 180, "Sparrenhöhe, ungelesen"],
    ["rndI (Raumprogramm-Würfel)", /\brndI\b/, 598, "Raum-Gewichte gewürfelt FC:601–605"],
    ["Schnitte auf Ständerachsen (bz.filter im layout)", /const inner=bz\.filter/, null, "FC:609: Raum folgt Raster"],
    ["shaftCX (Seed-Lage der Treppe)", /\bshaftCX\b/, 370, ""],
    ["leuteVon", /\bleuteVon\b/, 9527, "Bewohner aus W·D·st·wohl"],
    ["LEUTE_GESETZ", /\bLEUTE_GESETZ\b/, 9526, ""],
    ["STADT_MASSEN", /\bSTADT_MASSEN\b/, 4072, "Traufe der Ferne geschossM 2,7 + sockelM 0,5"],
    ["hausMasse", /\bhausMasse\s*\(/, 4119, "zweite Traufe-Regel"],
    ["kachelMassen", /\bkachelMassen\b/, 4074, "Stufe 1: eigene Lose (breit = frei/n)"],
    ["STADT_FORM", /\bSTADT_FORM\b/, 3892, "breitMax/stab nur mit DP.erbe"],
    ["PASSUNG (früherer Bau schrumpft ins Los)", /\bPASSUNG_(LUFT|SCHRITTE)\b/, null, "FC:9780–9791"],
    ["massBauExport", /\bmassBauExport\s*\(/, 9659, "Hülle aus dem Haus → Los"],
    ["slot.hang (Leser)", /\b(sl|slot|s|ov|hp|v2s|k)\.hang\b|slots\[[^\]]*\]\.hang|hang\s*===\s*["'](plattform|hanghaus|stelzen)|["'](hanghaus|stelzen)["']/, 11177, "Klasse ohne Leser im Haus"],
    ["KULTUR[", /\bKULTUR\[/, null, "Tafel W/D/st je Kultur"],
];
let summe = 0;
const zeilen = [];
for (const [name, re, defZ, bem] of NAMEN) {
    const treffer = [];
    for (const [f, L] of text) L.forEach((z, i) => { if (re.test(z)) treffer.push([rel(f), i + 1, z.trim()]); });
    const leser = treffer.filter(([f, z]) => !(defZ && f === "fachwerk-core.js" && z === defZ));
    const jeDatei = {};
    for (const [f] of leser) jeDatei[f] = (jeDatei[f] || 0) + 1;
    summe += leser.length;
    zeilen.push([name, leser.length]);
    console.log(`\n== ${name} — Definition ${defZ ? "FC:" + defZ : "—"} · Leser ${leser.length} · ${bem}`);
    console.log("   je Datei: " + Object.entries(jeDatei).map(([f, n]) => `${f} ${n}`).join(" · "));
    for (const [f, z, t] of leser.slice(0, 14)) console.log(`   ${f}:${z}  ${t.slice(0, 110)}`);
    if (leser.length > 14) console.log(`   … ${leser.length - 14} weitere`);
}
console.log(`\nSUMME Leser über ${NAMEN.length} Namen: ${summe}`);
console.log(zeilen.map(([n, k]) => `${n} ${k}`).join(" | "));

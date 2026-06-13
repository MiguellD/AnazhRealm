// diag-atlas.cjs — W6 STAMM-ATLAS (meister-plan §8.8c, R-032): die LIVE-Karte
// des EINEN Stamms. Pures fs (kein Browser, <1 s) — das Navigations-Werkzeug
// gegen die „60'854 Zeilen / 4 Marker"-Reibung.
//
//   node scripts/diag-atlas.cjs              → die Karte (Zone · Start · Zeilen · Methoden)
//   node scripts/diag-atlas.cjs --check      → Registry ↔ Marker-Drift (exit 1 = rot;
//                                              läuft im npm-run-check-Gate)
//   node scripts/diag-atlas.cjs --find <rx>  → verortet Methoden-Definitionen (Regex)
//                                              in ihrer Zone (Zeile + §-Kontext)
//
// WAHRHEIT = die `// ===== ATLAS §NN · NAME — Themen =====`-Marker im Text;
// die Kopf-Registry (ATLAS-REGISTRY … -ENDE) ist ihre Zusammenfassung. Der
// Drift-Check erzwingt: gleiche IDs, gleiche Ordnung, gleiche Namen — ein
// neuer/verschobener Abschnitt OHNE Registry-Pflege wird rot. Zeilen-Nummern
// leben NIE in der Registry (sie rotten) — diese Karte druckt sie LIVE.
const fs = require("fs");
const path = require("path");
const STAMM = path.resolve(__dirname, "..", "anazhRealm.js");

const src = fs.readFileSync(STAMM, "utf8");
const lines = src.split("\n");

const MARKER_RX = /^\s*\/\/ ===== ATLAS §(\d+) · ([^—]+) — (.+?) =====\s*$/;
const REG_RX = /^\/\/ §(\d+) ([^—]+) — (.+)$/;
const METHOD_RX =
    /^    (?:async )?(?:static (?:get )?)?([a-zA-Z_$][a-zA-Z0-9_$]*)\(.*\) \{|^    static (?:get )?([a-zA-Z_$][a-zA-Z0-9_$]*)\b/;

// 1) Marker einsammeln (die Wahrheit).
const marker = [];
lines.forEach((l, i) => {
    const m = l.match(MARKER_RX);
    if (m) marker.push({ id: m[1], name: m[2].trim(), themen: m[3].trim(), line: i + 1 });
});

// 2) Registry einsammeln (zwischen ATLAS-REGISTRY und -ENDE).
const regStart = lines.findIndex((l) => l.includes("===== ATLAS-REGISTRY ("));
const regEnd = lines.findIndex((l) => l.includes("===== ATLAS-REGISTRY-ENDE"));
const registry = [];
if (regStart >= 0 && regEnd > regStart) {
    for (let i = regStart; i < regEnd; i++) {
        const m = lines[i].match(REG_RX);
        if (m) registry.push({ id: m[1], name: m[2].trim(), themen: m[3].trim() });
    }
}

// 3) Drift prüfen.
const fehler = [];
if (regStart < 0 || regEnd < 0) fehler.push("ATLAS-REGISTRY-Block fehlt am Stammkopf");
if (marker.length === 0) fehler.push("keine ATLAS-§-Marker im Stamm");
if (registry.length !== marker.length)
    fehler.push(`Registry (${registry.length}) ≠ Marker (${marker.length}) — Zonen-Zahl driftet`);
const n = Math.min(registry.length, marker.length);
for (let i = 0; i < n; i++) {
    if (registry[i].id !== marker[i].id || registry[i].name !== marker[i].name)
        fehler.push(
            `Position ${i + 1}: Registry §${registry[i].id} ${registry[i].name} ≠ Marker §${marker[i].id} ${marker[i].name}`
        );
}
for (let i = 1; i < marker.length; i++) {
    if (Number(marker[i].id) <= Number(marker[i - 1].id))
        fehler.push(`Marker-Ordnung bricht: §${marker[i - 1].id} → §${marker[i].id} (Zeile ${marker[i].line})`);
}

const argCheck = process.argv.includes("--check");
const findIdx = process.argv.indexOf("--find");

if (argCheck) {
    if (fehler.length) {
        console.error("ATLAS-DRIFT:");
        for (const f of fehler) console.error("  ✗ " + f);
        process.exit(1);
    }
    console.log(`Atlas OK — ${marker.length} Zonen, Registry ↔ Marker deckungsgleich.`);
    process.exit(0);
}

// Zonen-Spannen + Methoden-Zählung.
const zonen = marker.map((m, i) => {
    const ende = i + 1 < marker.length ? marker[i + 1].line - 1 : lines.length;
    let methoden = 0;
    for (let ln = m.line; ln < ende; ln++) {
        if (METHOD_RX.test(lines[ln])) methoden++;
    }
    return { ...m, ende, zeilen: ende - m.line + 1, methoden };
});

if (findIdx >= 0) {
    const rx = new RegExp(process.argv[findIdx + 1] || "$^");
    let hits = 0;
    lines.forEach((l, i) => {
        const m = l.match(METHOD_RX);
        const name = m && (m[1] || m[2]);
        if (name && rx.test(name)) {
            const z = zonen.filter((z) => z.line <= i + 1 && i + 1 <= z.ende).pop();
            console.log(`  ${String(i + 1).padStart(6)}  ${name}  →  §${z ? z.id + " " + z.name : "?"}`);
            hits++;
        }
    });
    if (!hits) console.log("  (kein Treffer)");
    process.exit(0);
}

console.log(`STAMM-ATLAS — ${path.basename(STAMM)} (${lines.length} Zeilen, ${zonen.length} Zonen)\n`);
for (const z of zonen) {
    console.log(
        `  §${z.id}  ${z.name.padEnd(28)} ${String(z.line).padStart(6)}–${String(z.ende).padEnd(6)} ` +
            `${String(z.zeilen).padStart(5)} Z. ${String(z.methoden).padStart(4)} M.  ${z.themen}`
    );
}
if (fehler.length) {
    console.log("\nDRIFT:");
    for (const f of fehler) console.log("  ✗ " + f);
    process.exit(1);
}

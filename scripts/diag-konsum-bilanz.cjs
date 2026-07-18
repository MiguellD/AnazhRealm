// diag-konsum-bilanz.cjs — DER KONSUM-WÄCHTER (Schöpfer 17.07.: „der Import
// wächst durch den Export — Anazh muss lernen können"). must-ignore bleibt der
// Absturz-Schutz, aber das SCHWEIGEN fällt: dieses Gate rastert die EXPORT-
// FLÄCHE jedes Kerns (Namensraum-Schlüssel + PRESETS.*.fx-Blätter, Tiefe 4)
// gegen den Stamm-Text — jeder Export ohne namentlichen Leser ist eine WAISE.
// Bekannte Waisen (Ist-Stand, unten eingecheckt) sind gelb; jede NEUE Waise
// ist ROT = benannte Arbeit statt stiller Verlust. Selbsttest: ein injizierter
// Fake-Export MUSS als neue Waise feuern.
//   node scripts/diag-konsum-bilanz.cjs
"use strict";
const vm = require("vm");
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

// Ist-Stand 17.07.2026 (erste Messung) — die BEKANNTEN Waisen. Jede Zeile ist
// benannte Schuld (Matrix/roadmap), KEINE Erlaubnis: fällt eine, Liste kürzen.
const BEKANNTE_WAISEN = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, "konsum-bilanz-waisen.json"), "utf8")));

function absorber() {
    const a = new Proxy(function () {}, { get: () => a, apply: () => a, construct: () => a });
    return a;
}
function ladeKern(entry) {
    const ctx = vm.createContext({
        THREE: absorber(),
        console: { log() {}, warn() {}, error() {} },
        performance: { now: () => 0 },
    });
    ctx.self = ctx;
    ctx.globalThis = ctx;
    let code = "";
    for (const dep of entry.deps) code += fs.readFileSync(path.join(root, dep), "utf8") + "\n;";
    code += fs.readFileSync(path.join(root, entry.file), "utf8");
    // ZWILLINGS-ABSCHIED 18.07.: der ns-lose Kern (foundry-core) rastert auch
    // seine Welt-Look-Gesetze (HIMMEL/WASSER via __terrainCore) — vorher waren
    // Funktions-Kern-Tabellen für den Wächter unsichtbar (0 foundry-Waisen als
    // Beweis der Blindheit).
    code += entry.ns
        ? `\n;__ns = typeof ${entry.ns} !== 'undefined' ? ${entry.ns} : null;`
        : `\n;__ns = Object.assign({ PRESETS: typeof PRESETS !== 'undefined' ? PRESETS : null }, typeof __terrainCore !== 'undefined' ? __terrainCore : null);`;
    vm.runInContext(code, ctx, { timeout: 30000, filename: entry.file });
    return ctx.__ns;
}
// Blatt-Pfade der Export-Fläche: Namensraum-Objekte (ohne Funktionen) + fx-Bäume.
function blaetter(obj, prefix, tiefe, out) {
    if (tiefe > 4 || !obj || typeof obj !== "object") return;
    for (const k of Object.keys(obj)) {
        const v = obj[k];
        const p = prefix ? prefix + "." + k : k;
        if (v && typeof v === "object" && !Array.isArray(v)) blaetter(v, p, tiefe + 1, out);
        else if (typeof v !== "function") out.push(p);
    }
}
(function main() {
    console.log("=== DER KONSUM-WÄCHTER (Export-Fläche vs Stamm-Leser) ===");
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const MANIFEST = JSON.parse(fs.readFileSync(path.join(root, "cores.manifest.json"), "utf8"));
    const CORES = MANIFEST.map((c) => ({
        file: c.vertrag,
        deps: (Array.isArray(c.scripts) ? c.scripts : []).filter((s) => s !== c.vertrag),
        ns: c.ns || null,
    }));
    // Ein Blatt gilt als GELESEN, wenn sein SCHLÜSSEL (oder der Eltern-Schlüssel
    // bei kurzen/generischen Namen) als Wort im Stamm vorkommt — grob, aber
    // false-negative-arm: die Gesetz-Schlüssel sind sprechend (tauchV, sfK …).
    const GENERISCH =
        /^(base|min|max|def|id|lab|x|y|z|s|c|k|n|v|w|h|world|label|name|kind|desc|grp|step|law|hint|pass|warn|dauer|tempo|profil|freq|stride)$/;
    // VORFAHREN-REGEL: ein Blatt reist mit seiner MASCHINE — wird IRGENDEIN
    // spezifischer Vorfahre des Pfads im Stamm gelesen (VERHALTEN, MOTION,
    // schwimmen …), gilt der Ast als konsumiert (Daten-Tabellen-Zeilen wie
    // aktionen.stalk.dauer sind keine Waisen; der Wächter jagt NEUE BLÖCKE,
    // nicht Felder gelesener Tabellen — bewusst false-negative-arm).
    const wortImStamm = (w) =>
        new RegExp("[^a-zA-Z0-9_]" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[^a-zA-Z0-9_]").test(stamm);
    const istGelesen = (pfad) => {
        const teile = pfad.split(".");
        let urteilbar = 0;
        for (let i = teile.length - 1; i >= 0; i--) {
            const t = teile[i];
            if (t.length < 4 || GENERISCH.test(t) || t === "PRESETS" || t === "fx") continue;
            urteilbar++;
            if (wortImStamm(t)) return true;
        }
        return urteilbar === 0; // nur generische Segmente → nie urteilen
    };
    const neueWaisen = [];
    const bekannteGesehen = [];
    for (const entry of CORES) {
        let ns = null;
        try {
            ns = ladeKern(entry);
        } catch (e) {
            console.log(`  ⚠ ${entry.file}: lädt nicht im vm (${(e && e.message) || e}) — übersprungen`);
            continue;
        }
        if (!ns) continue;
        const pfade = [];
        for (const top of Object.keys(ns)) {
            if (top === "PRESETS" && ns.PRESETS) {
                for (const rid of Object.keys(ns.PRESETS)) {
                    const fx = ns.PRESETS[rid] && ns.PRESETS[rid].fx;
                    if (fx) blaetter(fx, "PRESETS." + rid + ".fx", 0, pfade);
                }
            } else if (ns[top] && typeof ns[top] === "object" && !Array.isArray(ns[top])) {
                blaetter(ns[top], top, 1, pfade);
            }
        }
        let waisen = 0;
        for (const p of pfade) {
            if (istGelesen(p)) continue;
            const eintrag = entry.file + " :: " + p;
            if (BEKANNTE_WAISEN.has(eintrag)) {
                bekannteGesehen.push(eintrag);
                waisen++;
            } else {
                neueWaisen.push(eintrag);
            }
        }
        console.log(`  ${entry.file}: ${pfade.length} Export-Blätter · ${waisen} bekannte Waisen`);
    }
    if (bekannteGesehen.length) {
        console.log(`\n  LERN-LISTE (bekannt, benannte Schuld — ${bekannteGesehen.length}):`);
        for (const w of bekannteGesehen.slice(0, 40)) console.log("    ~ " + w);
    }
    // SELBSTTEST: ein injizierter Fake-Export MUSS als neue Waise feuern.
    const fake = "fake-core.js :: PRESETS.x.fx.zensusFakeExportXyz";
    const selbsttest = !BEKANNTE_WAISEN.has(fake) && !istGelesen("PRESETS.x.fx.zensusFakeExportXyz");
    console.log(`  ${selbsttest ? "✅" : "❌"} SELBSTTEST: injizierter Fake-Export fiele als neue Waise`);
    if (neueWaisen.length) {
        console.log(`\n❌ ROT — ${neueWaisen.length} NEUE Waise(n) (Anazh kennt noch nicht):`);
        for (const w of neueWaisen) console.log("    ! " + w);
        console.log(
            "  → Konsument bauen ODER bewusst in scripts/konsum-bilanz-waisen.json aufnehmen (benannte Schuld)."
        );
        process.exit(1);
    }
    if (!selbsttest) process.exit(1);
    console.log("\n✅ GRÜN — kein Export fällt still: alle Waisen sind BENANNT, jede neue wäre rot.");
    process.exit(0);
})();

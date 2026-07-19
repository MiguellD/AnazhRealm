#!/usr/bin/env node
// ============================================================================
// DIE VENDOR-ANKER-WAND — gate:vendor-anker (GOLD 3, 19.07.)
//
// Der Stamm patcht/liest den minifizierten three-r184-Vendor zur Laufzeit an
// fünf Organen (Observer-Diät · Uniform-Heimat · Reife-Wache · Batch-Textur-
// Wächter · Bundle-Pass-Physik). Jeder dieser Eingriffe hängt an EXAKTEN
// Vendor-Wahrheiten (Methoden-/Feld-Namen, Verhaltens-Signaturen). Ein
// three-Versions-Sprung würde sie STILL brechen — die Welt liefe, aber die
// Diät griffe nie, die Reife-Wache wache über nichts.
//
// Diese Wand pinnt: (1) den Fingerabdruck (Größe + FNV-Hash) jeder Vendor-
// Datei — ein Bump ist ein BEWUSSTER Akt (Hash hier nachziehen = der Vertrag,
// alle Anker neu zu beweisen); (2) die ANKER-Substrings, von denen unsere
// Laufzeit-Eingriffe abhängen. Fällt ein Anker, nennt die Wand den Täter und
// das abhängige Organ BEIM NAMEN.
//
// Selbst-Test: --selftest beweist, dass ein manipulierter Anker feuert.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

// FNV-1a (dieselbe Hash-Familie wie der Warm-Start-Byte-Beweis).
function fnv(buf) {
    let h = 0x811c9dc5;
    for (let i = 0; i < buf.length; i++) {
        h ^= buf[i];
        h = (h * 0x01000193) >>> 0;
    }
    return h.toString(16);
}

// Die gepinnten Vendor-Fingerabdrücke (Bump = Hash bewusst nachziehen).
const PINS = [
    { file: "vendor/three.webgpu.min.js", hash: null },
    { file: "vendor/three.core.min.js", hash: null },
    { file: "vendor/three.tsl.min.js", hash: null },
];

// Die Anker: Vendor-Substring → abhängiges Stamm-Organ.
const ANKER = [
    // Observer-Diät + Batch-Textur-Wächter (setupObserver-Naht + Monitor-Kurzschluss)
    { file: "vendor/three.webgpu.min.js", sub: "setupObserver(e){return new", organ: "_materialObserverDiaet (Diät-Naht)" },
    { file: "vendor/three.webgpu.min.js", sub: "this.hasNode=this.containsNode(", organ: "_materialObserverDiaet (hasNode-Kurzschluss)" },
    { file: "vendor/three.webgpu.min.js", sub: "needsRefresh(e,t){if(this.hasNode||this.hasAnimation", organ: "_materialObserverDiaet (Monitor-Bahn)" },
    // Uniform-Heimat (shared-Gruppen-Klon-Weiche + renderGroup-Export)
    { file: "vendor/three.webgpu.min.js", sub: "groupNode.shared", organ: "_uniformHeimatTeilen (Klon-Weiche)" },
    { file: "vendor/three.webgpu.min.js", sub: "setGroup(e){return this.groupNode=e,this}", organ: "_uniformHeimatTeilen (setGroup)" },
    // Reife-Wache (Record droppt unfertige Pipelines + versiegelt danach)
    { file: "vendor/three.webgpu.min.js", sub: "isReady(u)&&", organ: null, weich: true },
    { file: "vendor/three.webgpu.min.js", sub: "u.version=s.version", organ: "_bundleReifeWache (Record-Versiegelung)" },
    // Bundle-Pass-Physik (Wasser bleibt draußen, solange der Copy den Pass bricht)
    { file: "vendor/three.webgpu.min.js", sub: "currentPass.end()", organ: "Wasser-Bundle-Wand (copyFramebufferToTexture-Pass-Bruch)" },
    // Batch-Staging + Füllstands-Linse
    { file: "vendor/three.core.min.js", sub: "_nextVertexStart", organ: "heapZensus.batchFillPct (Residenz-Bilanz)" },
    { file: "vendor/three.core.min.js", sub: "setGeometrySize", organ: "_archBatchAddGeometry (Klein-Münze + Wachstum)" },
    // instanceMatrix-Versions-Wächter (Kern-Setter)
    { file: "vendor/three.core.min.js", sub: "set needsUpdate(", organ: "Diät-Versions-Wächter (Attribut-Versionen)" },
];

function main() {
    const selftest = process.argv.includes("--selftest");
    const errs = [];
    const srcCache = new Map();
    const les = (f) => {
        if (!srcCache.has(f)) srcCache.set(f, fs.readFileSync(path.join(root, f)));
        return srcCache.get(f);
    };
    // (1) Fingerabdrücke: beim ersten Lauf gepinnt (Datei anker.lock.json),
    // danach Pflicht-Gleichheit — ein Vendor-Bump ändert die Lock-Datei
    // BEWUSST (im Diff sichtbar = der Vertrags-Akt).
    const lockPfad = path.join(root, "vendor", "anker.lock.json");
    let lock = fs.existsSync(lockPfad) ? JSON.parse(fs.readFileSync(lockPfad, "utf8")) : null;
    const ist = {};
    for (const p of PINS) {
        const buf = les(p.file);
        ist[p.file] = { bytes: buf.length, fnv: fnv(buf) };
    }
    if (!lock) {
        fs.writeFileSync(lockPfad, JSON.stringify(ist, null, 4) + "\n");
        console.log("  ℹ anker.lock.json GEMINTET (erster Lauf) — ab jetzt ist jeder Vendor-Bump ein bewusster Akt.");
        lock = ist;
    }
    for (const f in ist) {
        if (!lock[f]) errs.push(`${f}: kein Lock-Eintrag (Lock nachziehen = bewusster Akt)`);
        else if (lock[f].fnv !== ist[f].fnv || lock[f].bytes !== ist[f].bytes)
            errs.push(`${f}: Fingerabdruck weicht vom Lock ab (${ist[f].bytes} B, fnv ${ist[f].fnv}) — Vendor-Bump? ALLE Anker neu beweisen + Lock nachziehen`);
    }
    // (2) Anker:
    let geprueft = 0;
    for (const a of ANKER) {
        if (a.weich) continue; // dokumentarisch, kein harter Substring (minifier-variabel)
        geprueft++;
        const src = les(a.file).toString("latin1");
        const sub = selftest && a.organ && a.organ.startsWith("_materialObserverDiaet (hasNode") ? a.sub + "_MANIPULIERT" : a.sub;
        if (!src.includes(sub)) errs.push(`ANKER GEFALLEN: "${a.sub}" fehlt in ${a.file} → Organ: ${a.organ}`);
    }
    if (selftest) {
        const feuert = errs.some((e) => e.includes("hasNode"));
        console.log(feuert ? "✅ SELBST-TEST: die Anker-Wand feuert (manipulierter Anker erkannt)" : "❌ SELBST-TEST: die Wand ist vakuös");
        process.exit(feuert ? 0 : 1);
    }
    if (errs.length) {
        console.error("⛔ DIE VENDOR-ANKER-WAND:");
        for (const e of errs) console.error("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE VENDOR-ANKER-WAND steht — ${PINS.length} Fingerabdrücke gepinnt, ${geprueft} Anker der 5 Laufzeit-Organe leben im Vendor.`
    );
}
main();

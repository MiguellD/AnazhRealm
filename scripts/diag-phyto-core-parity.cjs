// DAS NEUE KLEID Welle 0 — DIE PHYTO-CORE-PARITÄTS-LINSE.
// Beweist headless, dass die EINE geteilte Wuchs-Quelle (`phyto-core.js`) über BEIDE Lade-
// Pfade byte-identisch ist: (a) der Main-Thread-Pfad (`<script src="phyto-core.js">` →
// globalThis.__phytoCore) UND (b) der Worker-Pfad (`importScripts("phyto-core.js")` → self.
// __phytoCore). Wir simulieren den Worker-Scope in einem frischen VM-Context mit `self` als
// globalem Objekt (genau wie ein Web-Worker) und laden dieselbe Datei via vm — divergiert
// eine Konstante/Formel zwischen den Scopes (z.B. durch ein window/self-Leck), fällt die Linse.
// Das ist die Gesetz-#0-Wand: EINE Quelle, viele Leser, KEIN Mirror, der driften kann.
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const CORE_PATH = path.join(__dirname, "..", "phyto-core.js");
const src = fs.readFileSync(CORE_PATH, "utf8");

// mulberry32 — der deterministische Test-Strom (wie diag-phyto-tree).
function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// (a) MAIN-Pfad: require() → der IIFE-Seiteneffekt setzt globalThis.__phytoCore.
require("../phyto-core.js");
const mainCore = globalThis.__phytoCore;

// (b) WORKER-Pfad: ein frischer Context, in dem `self` das globale Objekt IST (Worker-Scope).
// Der IIFE-Root-Ausdruck `typeof self !== "undefined" ? self : ...` greift dann `self`.
const workerSandbox = {};
workerSandbox.self = workerSandbox; // im Worker ist self === globalThis
const workerCtx = vm.createContext(workerSandbox);
vm.runInContext(src, workerCtx, { filename: "phyto-core.js(worker)" });
const workerCore = workerSandbox.self.__phytoCore;

let fails = 0;
const ok = (name, cond, detail) => {
    console.log((cond ? "  ✅ " : "  ⛔ ") + name + (detail ? " — " + detail : ""));
    if (!cond) fails++;
};

console.log("=== DAS NEUE KLEID Welle 0 — Phyto-Core Main↔Worker-Parität ===");

ok("Main-Pfad exportiert __phytoCore.growSkeleton", mainCore && typeof mainCore.growSkeleton === "function");
ok("Worker-Pfad exportiert __phytoCore.growSkeleton", workerCore && typeof workerCore.growSkeleton === "function");
ok(
    "Beide Pfade sind SEPARATE Funktions-Instanzen (echt zwei Scopes)",
    mainCore.growSkeleton !== workerCore.growSkeleton
);

// Feine Signatur über alle Segment-Endpunkte + Blätter (dieselbe wie diag-phyto-tree).
const sig = (res) => {
    let acc = 0;
    for (const s of res.segs) acc = (acc + s.p1[0] * 13.1 + s.p1[1] * 7.7 + s.p1[2] * 3.3 + s.r1 * 101) % 1e6;
    let lacc = 0;
    for (const l of res.leaves) lacc = (lacc + l.pos[0] * 5.5 + l.pos[1] * 9.1 + l.scale * 71) % 1e6;
    return (
        res.segs.length +
        "|" +
        res.leaves.length +
        "|" +
        res.trunkR.toFixed(9) +
        "|" +
        acc.toFixed(6) +
        "|" +
        lacc.toFixed(6)
    );
};

const eiche = () => ({
    height: 9,
    slim: 0.42,
    apical: 0.32,
    trop: -0.1,
    delta: 2.3,
    leafD: 0.6,
    leafSize: 0.5,
    conifer: false,
    barkType: "smooth",
    maxDepth: 5,
    crownBase: 0.24,
    whorlSpacing: 0.12,
    coniferDroop: 0.05,
    basalStems: 0,
    windGain: 1,
});
const tanne = () =>
    Object.assign(eiche(), {
        height: 12,
        slim: 0.74,
        apical: 0.9,
        trop: 0.05,
        conifer: true,
        barkType: "conifer",
        maxDepth: 4,
        crownBase: 0.12,
        coniferDroop: 0.22,
    });
const weide = () => Object.assign(eiche(), { trop: 0.8, apical: 0.28, leafSize: 0.35 });
const strauch = () => Object.assign(eiche(), { basalStems: 5, height: 4 });

// Über eine Palette von Arten × Seeds: Main-Ergebnis MUSS byte-identisch zum Worker-Ergebnis sein.
const arten = [
    ["eiche", eiche],
    ["tanne", tanne],
    ["weide", weide],
    ["strauch", strauch],
];
let maxDivergent = 0,
    tested = 0;
for (const [nm, mk] of arten) {
    for (let s = 0; s < 12; s++) {
        const seed = 4242 + s * 131;
        const rM = mainCore.growSkeleton(mk(), mulberry32(seed));
        const rW = workerCore.growSkeleton(mk(), mulberry32(seed));
        tested++;
        if (sig(rM) !== sig(rW)) {
            maxDivergent++;
            if (maxDivergent <= 3)
                console.log("      DIVERGENZ " + nm + "/seed" + seed + ": M=" + sig(rM) + " W=" + sig(rW));
        }
    }
}
ok(
    "Main==Worker byte-identisch über 4 Arten × 12 Seeds",
    maxDivergent === 0,
    tested + " Läufe, " + maxDivergent + " divergent"
);

console.log(
    fails === 0
        ? "\n✅ PARITÄT GRÜN — phyto-core.js trägt Main + Worker aus EINER Quelle (Gesetz #0)."
        : "\n⛔ PARITÄT ROT — " + fails + " Verletzung(en)."
);
process.exit(fails === 0 ? 0 : 1);

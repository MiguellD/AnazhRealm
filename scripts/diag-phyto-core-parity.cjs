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

// ── P-ZWILLING (K24): EINE Ableitung Dials → P ──
// Der gesehene Baum (foundry-core `deriveParamsPlant`, wie `buildInstance` ihn ruft: __dials = Preset-Regler, SEED,
// __lod = Bau-Stufe) und das Gesetz (`__phytoCore.treeParams(s, Saat, Stufe, Art)`) müssen denselben P-Vektor
// liefern — Schlüssel für Schlüssel, je Art × Gestalt (Saat) × Stufe. Der Foundry-Worker-Scope wird wie im Worker
// gebaut (three-r128 → phyto-core → foundry-core); clamp/lerp/__dials/SEED/__lod/gv stellt dort die Shell
// (phytogenesis.js), hier ihr Ersatz. Konsum-Leser: `buildInstance` (Foundry-Worker, jeder Baum der Welt) und
// `build()` (Studio).
const TERR_LIB = path.join(__dirname, "..", "worlds", "terrain", "lib");
const fsb = { console, performance: { now: () => 0 } };
fsb.self = fsb;
fsb.globalThis = fsb;
const fctx = vm.createContext(fsb);
vm.runInContext(fs.readFileSync(path.join(TERR_LIB, "three-r128.min.js"), "utf8"), fctx, { filename: "three-r128" });
vm.runInContext(src, fctx, { filename: "phyto-core.js(foundry)" });
vm.runInContext(
    "var clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;" +
        "var __dials = null, SEED = 0, __lod = 0, subject = null, RNG = null, CURRENT = '';" +
        "function gv() { throw new Error('gv: der P-Zwilling liest nur Preset-Regler'); }",
    fctx
);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "foundry-core.js"), "utf8"), fctx, {
    filename: "foundry-core.js",
});
const P_ARTEN = ["eiche", "fichte", "birke", "weide", "mammut", "tanne", "buche", "karst", "totholz", "strauch"];
const P_SAMEN = [1, 2, 7, 12345];
const P_STUFEN = [0, 1, 2];
// Vergleich Schlüssel für Schlüssel (Werte per JSON — leafShape ist ein Objekt; ein fehlender Schlüssel ist undefined).
const pDiff = (A, B) => {
    const out = [];
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)]))
        if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) out.push(k);
    return out;
};
fsb.__pZwillingArgs = { arten: P_ARTEN, samen: P_SAMEN, stufen: P_STUFEN };
const pPaare = vm.runInContext(
    `(function () {
        const a = self.__pZwillingArgs, out = [];
        for (const id of a.arten) {
            const pre = PRESETS[id];
            for (const seed of a.samen)
                for (const lod of a.stufen) {
                    __dials = pre.s; SEED = seed; __lod = lod; CURRENT = id;
                    const gesehen = deriveParamsPlant(pre);
                    __dials = null;
                    const gesetz = self.__phytoCore.treeParams(pre.s, seed, lod, pre, __weltSkalaArt(id));
                    out.push({ fall: id + "/s" + seed + "/L" + lod, gesehen: JSON.stringify(gesehen), gesetz: JSON.stringify(gesetz) });
                }
        }
        return out;
    })()`,
    fctx
);
// Selbsttest: ein eingeschleuster Zwilling (Quirl-Abstand fehlt, Nadel-Stride anders) MUSS beim Namen fallen.
{
    const g = JSON.parse(pPaare.find((p) => p.fall === "fichte/s1/L1").gesetz);
    const zw = Object.assign({}, g, { _lf: g._lf + 0.3 });
    delete zw.whorlSpacing;
    const d = pDiff(zw, g);
    ok(
        "P-Zwilling Selbsttest: der eingeschleuste Zwilling fällt an whorlSpacing und _lf",
        d.length === 2 && d.includes("whorlSpacing") && d.includes("_lf"),
        d.join(",")
    );
}
const pAbw = {};
let pFaelleRot = 0;
for (const p of pPaare) {
    const d = pDiff(JSON.parse(p.gesehen), JSON.parse(p.gesetz));
    if (d.length) pFaelleRot++;
    for (const k of d) (pAbw[k] = pAbw[k] || []).push(p.fall);
}
for (const k of Object.keys(pAbw))
    console.log("      P-ZWILLING " + k + ": " + pAbw[k].length + " Fälle, z. B. " + pAbw[k].slice(0, 3).join(" "));
ok(
    "P-Zwilling: gesehener Baum (deriveParamsPlant) = Gesetz (treeParams), " +
        P_ARTEN.length +
        " Arten × " +
        P_SAMEN.length +
        " Gestalten × " +
        P_STUFEN.length +
        " Stufen",
    pFaelleRot === 0,
    pPaare.length + " Fälle, " + pFaelleRot + " abweichend" + (pFaelleRot ? " an " + Object.keys(pAbw).join(", ") : "")
);

// ── DAS SKELETT IM HAUPT-THREAD (Integration K20 × K16, 14.10.) ──
// Der gefühlte Baum (`_baumGestaltTeile` ← `_populateBlockerAABBs` ← `spawnArchitecture`) wächst `skelettDerGestalt` im
// Haupt-Thread — dort lädt die Seite phyto-core und foundry-core OHNE die Shell (index.html trägt kein phytogenesis.js):
// jeder Schritt des Wuchses, der einen Vektor-Helfer der Shell liest, bricht dort (baum_totholz warf „vlen is not
// defined", gate:brennglas-takt fand ihn im Brennpunkt der Kern-Landform). Der Scope wird wie im Haupt-Thread gebaut
// (three → phyto-core → foundry-core, KEINE Shell-Globale), jede Baum- und Strauch-Art je Gestalt und Stufe gewachsen.
// Konsum-Leser: `_growTreeBlueprintRich` (stamm/15b.js) — der Stamm liest das Skelett für die Kollision.
const hsb = { console, performance: { now: () => 0 } };
hsb.self = hsb;
hsb.globalThis = hsb;
const hctx = vm.createContext(hsb);
vm.runInContext(fs.readFileSync(path.join(TERR_LIB, "three-r128.min.js"), "utf8"), hctx, { filename: "three-r128" });
vm.runInContext(src, hctx, { filename: "phyto-core.js(haupt)" });
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "foundry-core.js"), "utf8"), hctx, {
    filename: "foundry-core.js(haupt)",
});
// Selbsttest: der Scope ist der des Haupt-Threads — ein Leser eines Shell-Globals fällt dort beim Namen
ok(
    "Skelett im Haupt-Thread Selbsttest: der Scope trägt keine Shell-Globale (ein Leser von vlen bricht beim Namen)",
    vm.runInContext(
        "(function () { try { vlen([1, 0, 0]); return false; } catch (e) { return /vlen/.test(String(e && e.message)); } })()",
        hctx
    ) === true
);
hsb.__skelettArgs = { samen: [1, 7, 12345], stufen: [0, 1, 2] };
const hFaelle = vm.runInContext(
    `(function () {
        const a = self.__skelettArgs, out = [];
        for (const id of Object.keys(PRESETS)) {
            const pre = PRESETS[id];
            if (!pre || (pre.kind !== "tree" && pre.kind !== "shrub")) continue;
            for (const seed of a.samen)
                for (const lod of a.stufen) {
                    const fall = id + "/s" + seed + "/L" + lod;
                    try {
                        const s = skelettDerGestalt(id, seed, lod);
                        out.push({ fall, segs: s && s.nodes && s.nodes.segs ? s.nodes.segs.length : 0 });
                    } catch (e) {
                        out.push({ fall, fehler: String((e && e.message) || e) });
                    }
                }
        }
        return out;
    })()`,
    hctx
);
const hRot = hFaelle.filter((f) => f.fehler || !(f.segs > 0));
for (const f of hRot.slice(0, 6)) console.log("      SKELETT " + f.fall + ": " + (f.fehler || "0 Segmente"));
ok(
    "Skelett im Haupt-Thread: skelettDerGestalt wächst jede Baum- und Strauch-Art ohne die Shell (" +
        new Set(hFaelle.map((f) => f.fall.split("/")[0])).size +
        " Arten × 3 Gestalten × 3 Stufen)",
    hFaelle.length > 0 && hRot.length === 0,
    hFaelle.length + " Fälle, " + hRot.length + " gebrochen" + (hRot.length ? " — " + hRot[0].fall + ": " + (hRot[0].fehler || "0 Segmente") : "")
);

console.log(
    fails === 0
        ? "\n✅ PARITÄT GRÜN — phyto-core.js trägt Main + Worker aus EINER Quelle (Gesetz #0)."
        : "\n⛔ PARITÄT ROT — " + fails + " Verletzung(en)."
);
process.exit(fails === 0 ? 0 : 1);

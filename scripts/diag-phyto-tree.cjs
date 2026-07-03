// DAS NEUE KLEID K0/K1-BEWEIS (`docs/neues-kleid-plan.md`) — die Phyto-Wuchs-Linse.
// Der Kern `_phytoGrowSkeleton` ist REIN + THREE-frei → headless in node beweisbar, OHNE
// Browser: (1) Determinismus (gleicher Seed ⇒ byte-identisch), (2) McMahon (Stammradius aus
// H/slim nachgerechnet), (3) da Vinci (Flächenerhaltung an den Gabeln, r^Δ), (4) Varianz
// (N Seeds ⇒ vaste Streuung, nie identisch), (5) Apikaldominanz (exkurrent hoch → schlanker
// Kegel · dekurrent niedrig → breite Krone). Wir laden die Klasse THREE-frei über einen
// minimalen Stub (die Methode braucht kein THREE — sie gibt reine Arrays).
"use strict";
const fs = require("fs");
const path = require("path");

// Die Methode aus der Klasse ziehen, ohne die ganze Engine zu booten: wir extrahieren die
// zwei reinen Methoden per Function-Konstruktor aus dem Quelltext (sie referenzieren kein
// `this`-State ausser den Argumenten → als freistehende Funktionen lauffähig).
const src = fs.readFileSync(path.join(__dirname, "..", "anazhRealm.js"), "utf8");

function extractMethod(name) {
    const marker = "    " + name + "(";
    const start = src.indexOf(marker);
    if (start < 0) throw new Error("Methode nicht gefunden: " + name);
    // Balancierte Klammern ab der öffnenden { des Methoden-Körpers.
    let i = src.indexOf("{", start);
    let depth = 0,
        end = -1;
    for (let j = i; j < src.length; j++) {
        const ch = src[j];
        if (ch === "{") depth++;
        else if (ch === "}") {
            depth--;
            if (depth === 0) {
                end = j + 1;
                break;
            }
        }
    }
    const body = src.slice(i + 1, end - 1);
    const sig = src.slice(start + 4 + name.length, i); // "(args) "
    const args = sig
        .replace(/[()\s]/g, "")
        .split(",")
        .filter(Boolean);
    return new Function(...args, body);
}

const _phytoGrowSkeleton = extractMethod("_phytoGrowSkeleton");

// Ein einfacher deterministischer Stream (mulberry32) für die Tests.
function mulberry32(a) {
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function grow(P, seedInt) {
    // _phytoGrowSkeleton nutzt `this` nicht — als freie Funktion via .call(null, ...).
    return _phytoGrowSkeleton.call(null, P, mulberry32(seedInt));
}

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

let fails = 0;
const ok = (name, cond, detail) => {
    console.log((cond ? "  ✅ " : "  ⛔ ") + name + (detail ? " — " + detail : ""));
    if (!cond) fails++;
};
const sig = (res) => {
    // Feine Signatur: Segment-/Blatt-Zahl + trunkR + eine Positions-Prüfsumme über alle
    // Segment-Endpunkte (zwei Bäume mit gleicher Zahl aber verschiedener Form ⇒ verschiedene Summe).
    let acc = 0;
    for (const s of res.segs) acc = (acc + s.p1[0] * 13.1 + s.p1[1] * 7.7 + s.p1[2] * 3.3 + s.r1 * 101) % 1e6;
    return res.segs.length + "|" + res.leaves.length + "|" + res.trunkR.toFixed(6) + "|" + acc.toFixed(4);
};

console.log("=== DAS NEUE KLEID K0 — Phyto-Wuchs-Kern (rein, headless) ===");

// (1) DETERMINISMUS: gleicher Seed ⇒ byte-identisch (drei Läufe).
const a1 = grow(eiche(), 12345),
    a2 = grow(eiche(), 12345),
    a3 = grow(eiche(), 12345);
ok("Determinismus: gleicher Seed ⇒ 3× byte-identisch", sig(a1) === sig(a2) && sig(a2) === sig(a3), sig(a1));

// (2) McMahon: trunkR = clamp((H/k·2)^1.5 · 0.5), k=lerp(13,22,slim). Nachgerechnet.
const P = eiche();
const kM = 13 + (22 - 13) * P.slim;
const DM = Math.pow((P.height / kM) * 2, 1.5);
const expectedR = Math.max(0.07, Math.min(1.25, DM * 0.5));
ok(
    "McMahon: trunkR aus H/slim abgeleitet (nachgerechnet)",
    Math.abs(a1.trunkR - expectedR) < 1e-9,
    "got=" + a1.trunkR.toFixed(5) + " exp=" + expectedR.toFixed(5)
);
// Ein höherer Baum bei gleicher Schlankheit ⇒ dickerer Stamm (Monotonie).
const tall = grow(Object.assign(eiche(), { height: 18 }), 12345);
ok(
    "McMahon: höherer Baum ⇒ dickerer Stamm",
    tall.trunkR > a1.trunkR,
    a1.trunkR.toFixed(4) + " → " + tall.trunkR.toFixed(4)
);
// Schlanker (höheres slim) ⇒ dünnerer Stamm bei gleicher Höhe.
const slimmer = grow(Object.assign(eiche(), { slim: 0.85 }), 12345);
ok(
    "McMahon: schlanker (slim↑) ⇒ dünnerer Stamm",
    slimmer.trunkR < a1.trunkR,
    a1.trunkR.toFixed(4) + " → " + slimmer.trunkR.toFixed(4)
);

// (3) da VINCI: an jeder Gabel r_parent^Δ ≈ Σ r_child^Δ. Wir prüfen die Fläche an den
// Verzweigungen über runMeta: für einen Eltern-Run mit Kindern muss Σ(kind-Startradius^Δ)
// ≤ Eltern-Endradius^Δ · (1+ε) sein (die Vorlage verteilt exakt die Fläche, minus Blatt-Terminals).
const dv = grow(eiche(), 777);
// Start-/End-Radius je Run sammeln.
const runStart = {},
    runEnd = {};
for (const s of dv.segs) {
    if (runStart[s.runId] === undefined) runStart[s.runId] = s.r0;
    runEnd[s.runId] = s.r1;
}
const childrenOf = {};
for (const rid in dv.runMeta) {
    const pr = dv.runMeta[rid].parentRun;
    if (pr >= 0) (childrenOf[pr] = childrenOf[pr] || []).push(+rid);
}
let checked = 0,
    violated = 0;
for (const pr in childrenOf) {
    if (runEnd[pr] === undefined) continue;
    const parentArea = Math.pow(runEnd[pr], P.delta);
    let childArea = 0;
    for (const cr of childrenOf[pr]) if (runStart[cr] !== undefined) childArea += Math.pow(runStart[cr], P.delta);
    if (childArea <= 0) continue;
    checked++;
    // Kinder-Fläche darf die Eltern-Fläche nicht ÜBERSTEIGEN (Erhaltung, Toleranz für gnarl-Modulation).
    if (childArea > parentArea * 1.35) violated++;
}
ok(
    "da Vinci: Flächenerhaltung an Gabeln (Σ Kind-Fläche ≤ Eltern-Fläche)",
    checked > 5 && violated === 0,
    checked + " Gabeln geprüft, " + violated + " verletzt"
);

// (4) VARIANZ: N Seeds ⇒ vaste Streuung (keine zwei identisch, Segment-Zahl streut).
const sigs = new Set();
let minSeg = 1e9,
    maxSeg = 0;
for (let s = 0; s < 40; s++) {
    const r = grow(eiche(), 1000 + s * 7);
    sigs.add(sig(r));
    minSeg = Math.min(minSeg, r.segs.length);
    maxSeg = Math.max(maxSeg, r.segs.length);
}
ok("Varianz: 40 Seeds ⇒ 40 verschiedene Bäume", sigs.size === 40, sigs.size + "/40 unique");
ok("Varianz: Segment-Zahl streut spürbar", maxSeg - minSeg > 10, "Segmente " + minSeg + "…" + maxSeg);

// (5) APIKALDOMINANZ: Nadelbaum (api hoch, conifer) ⇒ schlanker + höher als breit; Eiche
// (api niedrig, dekurrent) ⇒ breiter. Wir messen das Bounding der Segment-Endpunkte.
function extent(res) {
    let maxY = 0,
        maxR = 0;
    for (const s of res.segs) {
        maxY = Math.max(maxY, s.p1[1]);
        maxR = Math.max(maxR, Math.hypot(s.p1[0], s.p1[2]));
    }
    return { h: maxY, r: maxR, ratio: maxR / Math.max(0.1, maxY) };
}
const eE = extent(grow(eiche(), 4242));
const tE = extent(grow(tanne(), 4242));
ok(
    "Apikaldominanz: Nadelbaum (exkurrent) schlanker als Eiche (dekurrent)",
    tE.ratio < eE.ratio,
    "Tanne w/h=" + tE.ratio.toFixed(2) + " · Eiche w/h=" + eE.ratio.toFixed(2)
);

// (6) LEAF-BUDGET: der Cap greift.
const capped = grow(Object.assign(eiche(), { leafBudget: 50 }), 999);
ok("Blatt-Budget: Cap deckelt die Blatt-Zahl", capped.leaves.length <= 50, capped.leaves.length + " ≤ 50");

console.log(
    fails === 0 ? "\n✅ K0 GRÜN — der Phyto-Kern trägt die Gesetze." : "\n⛔ K0 ROT — " + fails + " Verletzung(en)."
);
process.exit(fails === 0 ? 0 : 1);

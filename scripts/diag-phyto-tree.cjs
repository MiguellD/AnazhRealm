// DAS NEUE KLEID K0/K1-BEWEIS (`docs/neues-kleid-verfassung.md`) — die Phyto-Wuchs-Linse.
// Der Kern `growSkeleton` (phyto-core.js, DIE EINE geteilte Quelle seit Welle 0) ist REIN +
// THREE-frei → headless in node beweisbar, OHNE Browser: (1) Determinismus (gleicher Seed ⇒
// byte-identisch), (2) McMahon (Stammradius aus H/slim nachgerechnet), (3) da Vinci
// (Flächenerhaltung an den Gabeln, r^Δ), (4) Varianz (N Seeds ⇒ vaste Streuung, nie
// identisch), (5) Apikaldominanz (exkurrent hoch → schlanker Kegel · dekurrent niedrig →
// breite Krone). Wir laden phyto-core.js direkt (es exportiert auf globalThis.__phytoCore).
// DIE PARITÄT (Welle 0, bis zur Decke w3s-sukzession die eigene Linse diag-phyto-core-parity): dieselbe Datei über BEIDE
// Lade-Pfade byte-identisch — (a) der Main-Thread (`<script src="phyto-core.js">` → globalThis.__phytoCore) UND (b) der
// Worker (`importScripts` → self.__phytoCore, hier ein frischer VM-Context mit `self` als globalem Objekt); divergiert eine
// Konstante zwischen den Scopes (ein window/self-Leck), fällt die Linse. Dazu der P-Zwilling und das Skelett im Haupt-Thread
// (unten). Das ist die Gesetz-#0-Wand: EINE Quelle, viele Leser, KEIN Mirror, der driften kann.
"use strict";
const { vm, fadenScope, ROOT, stammLib } = require("./lib/welt-boot.cjs");

// Der geteilte Kern läuft im IIFE-Muster und exportiert auf `root` (self||globalThis) — in
// node ist das globalThis. Ein simpler require() reicht (die Datei ist kein CommonJS-Modul,
// aber der IIFE-Seiteneffekt setzt globalThis.__phytoCore).
require("../phyto-core.js");
const mainCore = globalThis.__phytoCore;
if (typeof mainCore?.growSkeleton !== "function") {
    throw new Error("phyto-core.js hat __phytoCore.growSkeleton nicht exportiert");
}
const { mulberry32 } = mainCore; // der Test-Strom ist der Strom des Kerns
const grow = (P, seedInt) => mainCore.growSkeleton(P, mulberry32(seedInt));

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
const tanne = () => ({
    ...eiche(),
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

const { errs, check: ok, wandEnde } = require("./lib/welt-boot.cjs").pruefer();
// Feine Signatur: Segment-/Blatt-Zahl + trunkR + Prüfsummen über alle Segment-Endpunkte und Blätter (zwei Bäume mit
// gleicher Zahl aber verschiedener Form ⇒ verschiedene Summe).
const sig = (res) =>
    [
        res.segs.length,
        res.leaves.length,
        res.trunkR.toFixed(9),
        res.segs.reduce((a, s) => (a + s.p1[0] * 13.1 + s.p1[1] * 7.7 + s.p1[2] * 3.3 + s.r1 * 101) % 1e6, 0).toFixed(6),
        res.leaves.reduce((a, l) => (a + l.pos[0] * 5.5 + l.pos[1] * 9.1 + l.scale * 71) % 1e6, 0).toFixed(6),
    ].join("|");


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
const tall = grow({ ...eiche(), height: 18 }, 12345);
ok(
    "McMahon: höherer Baum ⇒ dickerer Stamm",
    tall.trunkR > a1.trunkR,
    a1.trunkR.toFixed(4) + " → " + tall.trunkR.toFixed(4)
);
// Schlanker (höheres slim) ⇒ dünnerer Stamm bei gleicher Höhe.
const slimmer = grow({ ...eiche(), slim: 0.85 }, 12345);
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
    runStart[s.runId] ??= s.r0;
    runEnd[s.runId] = s.r1;
}
const childrenOf = {};
for (const rid in dv.runMeta) {
    const pr = dv.runMeta[rid].parentRun;
    if (pr >= 0) (childrenOf[pr] ||= []).push(+rid);
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
const V40 = Array.from({ length: 40 }, (_, s) => grow(eiche(), 1000 + s * 7));
const sigs = new Set(V40.map(sig));
const [minSeg, maxSeg] = [Math.min, Math.max].map((f) => f(...V40.map((r) => r.segs.length)));
ok("Varianz: 40 Seeds ⇒ 40 verschiedene Bäume", sigs.size === 40, sigs.size + "/40 unique");
ok("Varianz: Segment-Zahl streut spürbar", maxSeg - minSeg > 10, "Segmente " + minSeg + "…" + maxSeg);

// (5) APIKALDOMINANZ: Nadelbaum (api hoch, conifer) ⇒ schlanker + höher als breit; Eiche
// (api niedrig, dekurrent) ⇒ breiter. Wir messen das Bounding der Segment-Endpunkte.
const extent = (res) =>
    Math.max(...res.segs.map((s) => Math.hypot(s.p1[0], s.p1[2]))) / Math.max(0.1, ...res.segs.map((s) => s.p1[1]));
const eE = extent(grow(eiche(), 4242));
const tE = extent(grow(tanne(), 4242));
ok(
    "Apikaldominanz: Nadelbaum (exkurrent) schlanker als Eiche (dekurrent)",
    tE < eE,
    "Tanne w/h=" + tE.toFixed(2) + " · Eiche w/h=" + eE.toFixed(2)
);

// (6) LEAF-BUDGET: der Cap greift.
const capped = grow({ ...eiche(), leafBudget: 50 }, 999);
ok("Blatt-Budget: Cap deckelt die Blatt-Zahl", capped.leaves.length <= 50, capped.leaves.length + " ≤ 50");

// ── DIE PARITÄT ── der WORKER-Pfad: ein frischer Context, in dem `self` das globale Objekt IST (Worker-Scope).
// Der IIFE-Root-Ausdruck `typeof self !== "undefined" ? self : ...` greift dann `self`.
const workerCore = fadenScope(["phyto-core.js"]).__phytoCore; // im Faden ist self === globalThis

console.log("=== DAS NEUE KLEID Welle 0 — Phyto-Core Main↔Worker-Parität ===");
ok("Worker-Pfad exportiert __phytoCore.growSkeleton", typeof workerCore?.growSkeleton === "function");
ok(
    "Beide Pfade sind SEPARATE Funktions-Instanzen (echt zwei Scopes)",
    mainCore.growSkeleton !== workerCore.growSkeleton
);

const weide = () => ({ ...eiche(), trop: 0.8, apical: 0.28, leafSize: 0.35 });
const strauch = () => ({ ...eiche(), basalStems: 5, height: 4 });

// Über eine Palette von Arten × Seeds: Main-Ergebnis MUSS byte-identisch zum Worker-Ergebnis sein.
const arten = Object.entries({ eiche, tanne, weide, strauch });
let maxDivergent = 0,
    tested = 0;
for (const [nm, mk] of arten) {
    for (let s = 0; s < 12; s++) {
        const seed = 4242 + s * 131;
        const rM = grow(mk(), seed);
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

// ── P-ZWILLING: EINE Ableitung Dials → P ──
// Der gesehene Baum (foundry-core `deriveParamsPlant`, wie `buildInstance` ihn ruft: __dials = Preset-Regler, SEED,
// __lod = Bau-Stufe) und das Gesetz (`__phytoCore.treeParams(s, Saat, Stufe, Art)`) müssen denselben P-Vektor
// liefern — Schlüssel für Schlüssel, je Art × Gestalt (Saat) × Stufe. Der Foundry-Worker-Scope wird wie im Worker
// gebaut (die Engine three r184 → phyto-core → foundry-core); clamp/lerp/__dials/SEED/__lod stellt dort die Brücke
// (foundry-bruecke.js), hier ihr Ersatz — die Dials liest der Kern nur aus `__dials` (K47: kein DOM-Leser `gv` mehr).
// Konsum-Leser: `buildInstance` (Foundry-Worker, jeder Baum der Welt) und `build()` (Studio).
// Der Scope ist der des Fadens (welt-boot `fadenScope`: die Engine three r184 → phyto-core → foundry-core), danach die
// Globale der Brücke (die Kerne lesen sie erst im Ruf).
const KERNE = ["phyto-core.js", "foundry-core.js"];
const fsb = fadenScope(KERNE);
vm.runInContext(
    "var clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;" +
        "var __dials = null, SEED = 0, __lod = 0, subject = null, RNG = null, CURRENT = '';",
    fsb
);
const P_ARTEN = ["eiche", "fichte", "birke", "weide", "mammut", "tanne", "buche", "karst", "totholz", "strauch"];
const P_SAMEN = [1, 2, 7, 12345];
const P_STUFEN = [0, 1, 2];
// Vergleich Schlüssel für Schlüssel (Werte per JSON — leafShape ist ein Objekt; ein fehlender Schlüssel ist undefined).
const pDiff = (A, B) =>
    [...new Set([...Object.keys(A), ...Object.keys(B)])].filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
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
    fsb
);
// Selbsttest: ein eingeschleuster Zwilling (Quirl-Abstand fehlt, Nadel-Stride anders) MUSS beim Namen fallen.
{
    const g = JSON.parse(pPaare.find((p) => p.fall === "fichte/s1/L1").gesetz);
    const zw = { ...g, _lf: g._lf + 0.3 };
    delete zw.whorlSpacing;
    const d = pDiff(zw, g);
    ok(
        "P-Zwilling Selbsttest: der eingeschleuste Zwilling fällt an whorlSpacing und _lf",
        d.sort().join() === "_lf,whorlSpacing",
        d.join(",")
    );
}
const pAbw = {};
let pFaelleRot = 0;
for (const p of pPaare) {
    const d = pDiff(JSON.parse(p.gesehen), JSON.parse(p.gesetz));
    if (d.length) pFaelleRot++;
    for (const k of d) (pAbw[k] ||= []).push(p.fall);
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

// ── DAS SKELETT IM HAUPT-THREAD (Integration K20 × K16) ──
// Der gefühlte Baum (`_baumGestaltTeile` ← `_populateBlockerAABBs` ← `spawnArchitecture`) wächst `skelettDerGestalt` im
// Haupt-Thread — dort lädt die Seite phyto-core und foundry-core OHNE die Shell (index.html trägt kein phytogenesis.js):
// jeder Schritt des Wuchses, der einen Vektor-Helfer der Shell liest, bricht dort (baum_totholz warf „vlen is not
// defined", gate:brennglas-takt fand ihn im Brennpunkt der Kern-Landform). Der Scope wird wie im Haupt-Thread gebaut
// (three → phyto-core → foundry-core, KEINE Shell-Globale), jede Baum- und Strauch-Art je Gestalt und Stufe gewachsen.
// Konsum-Leser: `_growTreeBlueprintRich` (Stamm) — der Stamm liest das Skelett für die Kollision.
const hsb = fadenScope(KERNE);
// Selbsttest: der Scope ist der des Haupt-Threads — ein Leser eines Shell-Globals fällt dort beim Namen
ok(
    "Skelett im Haupt-Thread Selbsttest: der Scope trägt keine Shell-Globale (ein Leser von vlen bricht beim Namen)",
    vm.runInContext(
        "(function () { try { vlen([1, 0, 0]); return false; } catch (e) { return /vlen/.test(String(e && e.message)); } })()",
        hsb
    ) === true
);
// DIE JUGEND (stoffe.K5#2, w12-riesenhalm): je Baum-Art und Gestalt der Stufe 1 in jedem Alter des Jungwuchses (`SUKZESSION.jugend`
// des Stamms) der Kronen-Fuß des jungen Skeletts (sein tiefster Blatt-Anker / seine Höhe) minus den des gewachsenen — `jugendRot`
// nennt, wo die Krone des Jungwuchses um mehr als ein Zehntel der Höhe höher sitzt (bis w12-riesenhalm hob der Schaft-Hub die
// Krone der jungen Tanne auf 0,54 H, gewachsen 0,36 H: die Riesenhalme der Narbe); die Mutante ist dieser Fall. Die Höhe des
// Jungwuchses stand schon im Maß der Art (jung/gewachsen ≤ 1,008 vor und nach dem Schnitt).
hsb.__skelettArgs = { samen: [1, 7, 12345], stufen: [0, 1, 2], jugend: stammLib.ladeKlasse(ROOT).AnazhRealm.SUKZESSION.jugend };
const hFaelle = vm.runInContext(
    `(function () {
        const a = self.__skelettArgs, out = [];
        const fuss = (k) => Math.min(...k.nodes.leaves.map((l) => l.pos[1])) / Math.max(...k.nodes.segs.map((q) => q.p1[1]));
        for (const [id, pre] of Object.entries(PRESETS)) {
            if (pre.kind !== "tree" && pre.kind !== "shrub") continue;
            for (const seed of a.samen)
                for (const lod of a.stufen) {
                    const fall = id + "/s" + seed + "/L" + lod;
                    try {
                        const s = skelettDerGestalt(id, seed, lod);
                        const jung = pre.kind === "tree" && lod === 1 ? a.jugend.map((alter) => [alter, fuss(skelettDerGestalt(id, seed, lod, { alter })) - fuss(s)]) : [];
                        out.push({ fall, segs: s.nodes.segs.length, jung });
                    } catch (e) {
                        out.push({ fall, fehler: String(e?.message || e) });
                    }
                }
        }
        return out;
    })()`,
    hsb
);
const jugendRot = (F) => F.flatMap((f) => (f.jung || []).filter(([, d]) => d > 0.1).map(([al, d]) => `${f.fall}@${al} +${d.toFixed(2)}H`));
ok("Jugend: die Krone nie über der gewachsenen", jugendRot([{ jung: [[0.06, 0.18]] }]).length === 1 && hFaelle.some((f) => f.jung?.length) && !jugendRot(hFaelle).length, jugendRot(hFaelle).slice(0, 3).join(" | "));
const hRot = hFaelle.filter((f) => f.fehler || !(f.segs > 0));
for (const f of hRot.slice(0, 6)) console.log("      SKELETT " + f.fall + ": " + (f.fehler || "0 Segmente"));
ok(
    "Skelett im Haupt-Thread: skelettDerGestalt wächst jede Baum- und Strauch-Art ohne die Shell (" +
        new Set(hFaelle.map((f) => f.fall.split("/")[0])).size +
        " Arten × 3 Gestalten × 3 Stufen)",
    hFaelle.length > 0 && hRot.length === 0,
    hFaelle.length + " Fälle, " + hRot.length + " gebrochen" + (hRot.length ? " — " + hRot[0].fall + ": " + (hRot[0].fehler || "0 Segmente") : "")
);

wandEnde(errs, "PHYTO-KERN: der Wuchs trägt die Gesetze, Main + Worker aus EINER Quelle (Gesetz #0).");
